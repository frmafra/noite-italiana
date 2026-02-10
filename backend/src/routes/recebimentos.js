const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        r.*,
        pc.numero as pedido_numero,
        COALESCE(par.razao_social, par.nome) as fornecedor_nome
      FROM recebimentos r
      LEFT JOIN pedidos_compra pc ON r.pedido_id = pc.id
      LEFT JOIN parceiros par ON pc.fornecedor_id = par.id
      ORDER BY COALESCE(r.created_at, r.criado_em) DESC NULLS LAST`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar recebimentos:', error);
    res.status(500).json({ error: 'Erro ao listar recebimentos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rec = await pool.query(
      `SELECT 
        r.*,
        pc.numero as pedido_numero,
        pc.fornecedor_id,
        COALESCE(par.razao_social, par.nome) as fornecedor_nome
      FROM recebimentos r
      LEFT JOIN pedidos_compra pc ON r.pedido_id = pc.id
      LEFT JOIN parceiros par ON pc.fornecedor_id = par.id
      WHERE r.id = $1`,
      [id]
    );
    if (rec.rows.length === 0) {
      return res.status(404).json({ error: 'Recebimento não encontrado' });
    }
    const itens = await pool.query(
      `SELECT 
        ri.*,
        pi.quantidade as quantidade_pedida,
        pi.produto_base_id,
        pb.nome as produto_nome
      FROM recebimentos_itens ri
      JOIN pedidos_itens pi ON ri.pedido_item_id = pi.id
      LEFT JOIN produtos_base pb ON pi.produto_base_id = pb.id
      WHERE ri.recebimento_id = $1`,
      [id]
    );
    res.json({
      ...rec.rows[0],
      itens: itens.rows
    });
  } catch (error) {
    console.error('Erro ao buscar recebimento:', error);
    res.status(500).json({ error: 'Erro ao buscar recebimento' });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { pedido_id, numero_nf, data_nf, data_recebimento, valor_nf, observacoes, itens } = req.body;

    if (!pedido_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Pedido é obrigatório' });
    }

    const pedido = await client.query('SELECT * FROM pedidos_compra WHERE id = $1', [pedido_id]);
    if (pedido.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const descricao = (numero_nf ? `Recebimento NF ${numero_nf}` : `Recebimento Pedido ${pedido_id}`).toString().slice(0, 200) || 'Recebimento';
    const valorPrevisto = parseFloat(valor_nf) || 0;
    const rec = await client.query(
      `INSERT INTO recebimentos (
        pedido_id, numero_nf, data_nf, data_recebimento, valor_nf, observacoes, descricao, valor_previsto
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        pedido_id,
        numero_nf || null,
        data_nf || null,
        data_recebimento || new Date(),
        valor_nf || null,
        observacoes || null,
        descricao,
        valorPrevisto
      ]
    );
    const recebimento_id = rec.rows[0].id;

    if (itens && itens.length > 0) {
      for (const item of itens) {
        if (parseFloat(item.quantidade_recebida) > 0) {
          await client.query(
            `INSERT INTO recebimentos_itens (recebimento_id, pedido_item_id, quantidade_recebida, observacoes)
             VALUES ($1, $2, $3, $4)`,
            [recebimento_id, item.pedido_item_id, item.quantidade_recebida, item.observacoes || null]
          );
          await client.query(
            `UPDATE pedidos_itens SET quantidade_recebida = quantidade_recebida + $1 WHERE id = $2`,
            [item.quantidade_recebida, item.pedido_item_id]
          );
        }
      }
    }

    const itensPedido = await client.query('SELECT * FROM pedidos_itens WHERE pedido_id = $1', [pedido_id]);
    const totalPedido = itensPedido.rows.reduce((s, i) => s + parseFloat(i.quantidade), 0);
    const totalRecebido = itensPedido.rows.reduce((s, i) => s + parseFloat(i.quantidade_recebida || 0), 0);
    const novoStatus = totalRecebido >= totalPedido ? 'recebido' : 'parcial';
    await client.query(
      'UPDATE pedidos_compra SET status = $1, updated_at = NOW() WHERE id = $2',
      [novoStatus, pedido_id]
    );

    const valor_nf_num = parseFloat(valor_nf) || 0;
    if (valor_nf_num > 0) {
      await client.query(
        `INSERT INTO contas_pagar (
          recebimento_id, pedido_id, fornecedor_id, numero_documento,
          data_emissao, data_vencimento, valor, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'aberto')`,
        [
          recebimento_id,
          pedido_id,
          pedido.rows[0].fornecedor_id,
          numero_nf || String(recebimento_id),
          data_nf || data_recebimento || new Date(),
          data_recebimento || new Date(),
          valor_nf_num
        ]
      );
    }

    await client.query('COMMIT');
    const recFinal = await pool.query('SELECT * FROM recebimentos WHERE id = $1', [recebimento_id]);
    res.status(201).json(recFinal.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar recebimento:', error);
    res.status(500).json({ error: 'Erro ao criar recebimento: ' + (error.message || '') });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { numero_nf, data_nf, data_recebimento, valor_nf, observacoes } = req.body;

    const result = await pool.query(
      `UPDATE recebimentos SET
        numero_nf = COALESCE($1, numero_nf),
        data_nf = $2,
        data_recebimento = COALESCE($3, data_recebimento),
        valor_nf = $4,
        observacoes = $5
      WHERE id = $6
      RETURNING *`,
      [numero_nf, data_nf, data_recebimento, valor_nf, observacoes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recebimento não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar recebimento:', error);
    res.status(500).json({ error: 'Erro ao atualizar recebimento: ' + (error.message || '') });
  }
});

// PATCH /:id/baixar - Dar baixa (módulo Financeiro Integrado)
router.patch('/:id/baixar', async (req, res) => {
  try {
    const { id } = req.params;
    const { valor_recebido, data_recebimento } = req.body;
    const result = await pool.query(
      `UPDATE recebimentos
       SET valor_recebido = $1, data_recebimento = $2, status = 'Recebido'
       WHERE id = $3
       RETURNING *`,
      [parseFloat(valor_recebido) || 0, data_recebimento || null, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Recebimento não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao dar baixa no recebimento:', err);
    res.status(500).json({ error: 'Erro ao dar baixa' });
  }
});

module.exports = router;

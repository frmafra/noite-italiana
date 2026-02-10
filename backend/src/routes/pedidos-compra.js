const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { status, fornecedor_id } = req.query;
    let query = `
      SELECT 
        pc.*,
        COALESCE(par.razao_social, par.nome) as fornecedor_nome,
        s.numero as solicitacao_numero
      FROM pedidos_compra pc
      LEFT JOIN parceiros par ON pc.fornecedor_id = par.id
      LEFT JOIN solicitacoes_compra s ON pc.solicitacao_id = s.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      params.push(status);
      query += ` AND pc.status = $${params.length}`;
    }
    if (fornecedor_id) {
      params.push(fornecedor_id);
      query += ` AND pc.fornecedor_id = $${params.length}`;
    }
    query += ' ORDER BY pc.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await pool.query(
      `SELECT 
        pc.*,
        COALESCE(par.razao_social, par.nome) as fornecedor_nome,
        par.telefone as fornecedor_telefone,
        par.email as fornecedor_email,
        s.numero as solicitacao_numero
      FROM pedidos_compra pc
      LEFT JOIN parceiros par ON pc.fornecedor_id = par.id
      LEFT JOIN solicitacoes_compra s ON pc.solicitacao_id = s.id
      WHERE pc.id = $1`,
      [id]
    );
    if (pedido.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const itens = await pool.query(
      `SELECT 
        pi.*,
        pb.nome as produto_nome
      FROM pedidos_itens pi
      LEFT JOIN produtos_base pb ON pi.produto_base_id = pb.id
      WHERE pi.pedido_id = $1
      ORDER BY pi.id`,
      [id]
    );

    const recebimentos = await pool.query(
      'SELECT * FROM recebimentos WHERE pedido_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      ...pedido.rows[0],
      itens: itens.rows,
      recebimentos: recebimentos.rows
    });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      data_pedido,
      prazo_entrega,
      condicoes_pagamento,
      status
    } = req.body;

    const result = await pool.query(
      `UPDATE pedidos_compra SET
        data_pedido = COALESCE($1, data_pedido),
        prazo_entrega = $2,
        condicoes_pagamento = $3,
        status = COALESCE($4, status),
        updated_at = NOW()
      WHERE id = $5
      RETURNING *`,
      [data_pedido, prazo_entrega, condicoes_pagamento, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({ error: 'Erro ao atualizar pedido: ' + (error.message || '') });
  }
});

router.post('/:id/receber', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { numero_nf, data_nf, data_recebimento, valor_nf, observacoes, itens } = req.body;

    const pedido = await client.query('SELECT * FROM pedidos_compra WHERE id = $1', [id]);
    if (pedido.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const descricao = (numero_nf ? `Recebimento NF ${numero_nf}` : `Recebimento Pedido ${pedido.rows[0].numero || id}`).toString().slice(0, 200) || 'Recebimento';
    const valorPrevisto = parseFloat(valor_nf) || 0;
    const rec = await client.query(
      `INSERT INTO recebimentos (
        pedido_id, numero_nf, data_nf, data_recebimento, valor_nf, observacoes, descricao, valor_previsto
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        id,
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
            `INSERT INTO recebimentos_itens (
              recebimento_id, pedido_item_id, quantidade_recebida, observacoes
            ) VALUES ($1, $2, $3, $4)`,
            [
              recebimento_id,
              item.pedido_item_id,
              item.quantidade_recebida,
              item.observacoes || null
            ]
          );
          await client.query(
            `UPDATE pedidos_itens SET 
              quantidade_recebida = quantidade_recebida + $1 
              WHERE id = $2`,
            [item.quantidade_recebida, item.pedido_item_id]
          );
        }
      }
    }

    const itensPedido = await client.query('SELECT * FROM pedidos_itens WHERE pedido_id = $1', [id]);
    const totalPedido = itensPedido.rows.reduce((s, i) => s + parseFloat(i.quantidade), 0);
    const totalRecebido = itensPedido.rows.reduce((s, i) => s + parseFloat(i.quantidade_recebida || 0), 0);
    const novoStatus = totalRecebido >= totalPedido ? 'recebido' : 'parcial';

    await client.query(
      'UPDATE pedidos_compra SET status = $1, updated_at = NOW() WHERE id = $2',
      [novoStatus, id]
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
          id,
          pedido.rows[0].fornecedor_id,
          numero_nf || rec.rows[0].id,
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
    console.error('Erro ao registrar recebimento:', error);
    res.status(500).json({ error: 'Erro ao registrar recebimento: ' + (error.message || '') });
  } finally {
    client.release();
  }
});

module.exports = router;

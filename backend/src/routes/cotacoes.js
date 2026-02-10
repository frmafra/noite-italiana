const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { solicitacao_id, fornecedor_id, status } = req.query;
    let query = `
      SELECT 
        c.*,
        s.numero as solicitacao_numero,
        COALESCE(par.razao_social, par.nome) as fornecedor_nome
      FROM cotacoes c
      LEFT JOIN solicitacoes_compra s ON c.solicitacao_id = s.id
      LEFT JOIN parceiros par ON c.fornecedor_id = par.id
      WHERE 1=1
    `;
    const params = [];
    if (solicitacao_id) {
      params.push(solicitacao_id);
      query += ` AND c.solicitacao_id = $${params.length}`;
    }
    if (fornecedor_id) {
      params.push(fornecedor_id);
      query += ` AND c.fornecedor_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }
    query += ' ORDER BY c.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar cotações:', error);
    res.status(500).json({ error: 'Erro ao listar cotações' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cotacao = await pool.query(
      `SELECT 
        c.*,
        s.numero as solicitacao_numero,
        COALESCE(par.razao_social, par.nome) as fornecedor_nome,
        par.telefone as fornecedor_telefone,
        par.email as fornecedor_email
      FROM cotacoes c
      LEFT JOIN solicitacoes_compra s ON c.solicitacao_id = s.id
      LEFT JOIN parceiros par ON c.fornecedor_id = par.id
      WHERE c.id = $1`,
      [id]
    );
    if (cotacao.rows.length === 0) {
      return res.status(404).json({ error: 'Cotação não encontrada' });
    }
    const itens = await pool.query(
      `SELECT 
        ci.*,
        pb.nome as produto_nome
      FROM cotacoes_itens ci
      LEFT JOIN produtos_base pb ON ci.produto_base_id = pb.id
      WHERE ci.cotacao_id = $1
      ORDER BY ci.id`,
      [id]
    );
    res.json({
      ...cotacao.rows[0],
      itens: itens.rows
    });
  } catch (error) {
    console.error('Erro ao buscar cotação:', error);
    res.status(500).json({ error: 'Erro ao buscar cotação' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      solicitacao_id,
      fornecedor_id,
      contato_fornecedor,
      data_cotacao,
      prazo_entrega,
      condicoes_pagamento,
      observacoes,
      itens
    } = req.body;

    if (!solicitacao_id || !fornecedor_id) {
      return res.status(400).json({ error: 'Solicitação e fornecedor são obrigatórios' });
    }

    const ano = new Date().getFullYear();
    const lastCot = await pool.query(
      `SELECT numero FROM cotacoes WHERE numero LIKE 'COT-' || $1 || '-%' ORDER BY numero DESC LIMIT 1`,
      [ano]
    );
    const proximo = lastCot.rows[0]
      ? parseInt(lastCot.rows[0].numero.split('-')[2], 10) + 1
      : 1;
    const numero = `COT-${ano}-${String(proximo).padStart(3, '0')}`;

    let valor_total = 0;
    if (itens && itens.length > 0) {
      valor_total = itens.reduce((sum, i) => sum + (parseFloat(i.valor_total) || 0), 0);
    }

    const cotacao = await pool.query(
      `INSERT INTO cotacoes (
        numero, solicitacao_id, fornecedor_id, contato_fornecedor,
        data_cotacao, prazo_entrega, condicoes_pagamento, observacoes,
        valor_total, status, valor_unitario
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0)
      RETURNING *`,
      [
        numero,
        solicitacao_id,
        fornecedor_id,
        contato_fornecedor || null,
        data_cotacao || new Date(),
        prazo_entrega || null,
        condicoes_pagamento || null,
        observacoes || null,
        Math.round(valor_total * 100) / 100,
        'em_analise'
      ]
    );

    if (itens && itens.length > 0) {
      for (const item of itens) {
        const vt = parseFloat(item.quantidade) * parseFloat(item.preco_unitario || 0);
        await pool.query(
          `INSERT INTO cotacoes_itens (
            cotacao_id, solicitacao_item_id, produto_base_id, descricao,
            quantidade, unidade, preco_unitario, valor_total, observacoes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            cotacao.rows[0].id,
            item.solicitacao_item_id || null,
            item.produto_base_id,
            item.descricao || null,
            item.quantidade,
            item.unidade || null,
            item.preco_unitario || 0,
            Math.round(vt * 100) / 100,
            item.observacoes || null
          ]
        );
      }
    }

    res.status(201).json(cotacao.rows[0]);
  } catch (error) {
    console.error('Erro ao criar cotação:', error);
    res.status(500).json({ error: 'Erro ao criar cotação: ' + (error.message || '') });
  }
});

router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const {
      contato_fornecedor,
      data_cotacao,
      prazo_entrega,
      condicoes_pagamento,
      observacoes,
      itens
    } = req.body;

    let valor_total = 0;
    if (itens && itens.length > 0) {
      valor_total = itens.reduce((sum, i) => {
        const vt = parseFloat(i.quantidade) * parseFloat(i.preco_unitario || 0);
        return sum + vt;
      }, 0);
    }

    const cotacao = await client.query(
      `UPDATE cotacoes SET
        contato_fornecedor = $1,
        data_cotacao = $2,
        prazo_entrega = $3,
        condicoes_pagamento = $4,
        observacoes = $5,
        valor_total = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *`,
      [
        contato_fornecedor || null,
        data_cotacao || null,
        prazo_entrega || null,
        condicoes_pagamento || null,
        observacoes || null,
        Math.round(valor_total * 100) / 100,
        id
      ]
    );

    if (cotacao.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cotação não encontrada' });
    }

    await client.query('DELETE FROM cotacoes_itens WHERE cotacao_id = $1', [id]);

    if (itens && itens.length > 0) {
      for (const item of itens) {
        const vt = parseFloat(item.quantidade) * parseFloat(item.preco_unitario || 0);
        await client.query(
          `INSERT INTO cotacoes_itens (
            cotacao_id, solicitacao_item_id, produto_base_id, descricao,
            quantidade, unidade, preco_unitario, valor_total, observacoes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            id,
            item.solicitacao_item_id || null,
            item.produto_base_id,
            item.descricao || null,
            item.quantidade,
            item.unidade || null,
            item.preco_unitario || 0,
            Math.round(vt * 100) / 100,
            item.observacoes || null
          ]
        );
      }
    }

    await client.query('COMMIT');
    res.json(cotacao.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar cotação:', error);
    res.status(500).json({ error: 'Erro ao atualizar cotação: ' + (error.message || '') });
  } finally {
    client.release();
  }
});

router.put('/:id/marcar-vencedora', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    const cotacao = await client.query('SELECT * FROM cotacoes WHERE id = $1', [id]);
    if (cotacao.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cotação não encontrada' });
    }

    const solicitacao_id = cotacao.rows[0].solicitacao_id;
    await client.query(
      'UPDATE cotacoes SET vencedora = false WHERE solicitacao_id = $1',
      [solicitacao_id]
    );
    await client.query(
      'UPDATE cotacoes SET vencedora = true, updated_at = NOW() WHERE id = $1',
      [id]
    );

    const updated = await client.query('SELECT * FROM cotacoes WHERE id = $1', [id]);
    await client.query('COMMIT');
    res.json(updated.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao marcar vencedora:', error);
    res.status(500).json({ error: 'Erro ao marcar vencedora: ' + (error.message || '') });
  } finally {
    client.release();
  }
});

router.post('/:id/gerar-pedido', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    const cotacao = await client.query('SELECT * FROM cotacoes WHERE id = $1', [id]);
    if (cotacao.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cotação não encontrada' });
    }
    if (!cotacao.rows[0].vencedora) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Apenas a cotação vencedora pode gerar pedido' });
    }

    const itens = await client.query(
      'SELECT * FROM cotacoes_itens WHERE cotacao_id = $1',
      [id]
    );

    const ano = new Date().getFullYear();
    const lastPed = await client.query(
      `SELECT numero FROM pedidos_compra WHERE numero LIKE 'PC-' || $1 || '-%' ORDER BY numero DESC LIMIT 1`,
      [ano]
    );
    const proximo = lastPed.rows[0]
      ? parseInt(lastPed.rows[0].numero.split('-')[2], 10) + 1
      : 1;
    const numero = `PC-${ano}-${String(proximo).padStart(3, '0')}`;

    const valor_total = cotacao.rows[0].valor_total || 0;

    const pedido = await client.query(
      `INSERT INTO pedidos_compra (
        numero, cotacao_id, solicitacao_id, fornecedor_id,
        data_pedido, prazo_entrega, condicoes_pagamento, valor_total, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        numero,
        id,
        cotacao.rows[0].solicitacao_id,
        cotacao.rows[0].fornecedor_id,
        new Date(),
        cotacao.rows[0].prazo_entrega ? (() => {
          const d = new Date();
          d.setDate(d.getDate() + cotacao.rows[0].prazo_entrega);
          return d;
        })() : null,
        cotacao.rows[0].condicoes_pagamento,
        valor_total,
        'aguardando'
      ]
    );
    const pedido_id = pedido.rows[0].id;

    for (const item of itens.rows) {
      await client.query(
        `INSERT INTO pedidos_itens (
          pedido_id, cotacao_item_id, produto_base_id, descricao,
          quantidade, unidade, preco_unitario, valor_total, observacoes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          pedido_id,
          item.id,
          item.produto_base_id,
          item.descricao,
          item.quantidade,
          item.unidade,
          item.preco_unitario,
          item.valor_total,
          item.observacoes
        ]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(pedido.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao gerar pedido:', error);
    res.status(500).json({ error: 'Erro ao gerar pedido: ' + (error.message || '') });
  } finally {
    client.release();
  }
});

module.exports = router;

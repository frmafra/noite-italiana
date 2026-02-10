/**
 * Rotas para o módulo Financeiro - tabela "pagamentos" (lançamentos manuais de despesas).
 * Não confundir com contas_pagar (fluxo Compras).
 */
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET - Listar (para página Financeiro Integrado)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM pagamentos ORDER BY COALESCE(data_prevista, criado_em) DESC NULLS LAST`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar pagamentos:', err);
    res.status(500).json({ error: 'Erro ao listar pagamentos' });
  }
});

// POST - Criar (formulário Financeiro)
router.post('/', async (req, res) => {
  try {
    const { descricao, fornecedor, valor_previsto, data_prevista, projeto_id, observacoes } = req.body;
    if (!descricao || valor_previsto == null) {
      return res.status(400).json({ error: 'Descrição e valor são obrigatórios' });
    }
    const result = await pool.query(
      `INSERT INTO pagamentos (descricao, fornecedor, valor_previsto, data_prevista, projeto_id, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        descricao,
        fornecedor || null,
        parseFloat(valor_previsto) || 0,
        data_prevista || null,
        projeto_id || null,
        observacoes || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar pagamento:', err);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});

// PATCH /:id/baixar - Dar baixa (valor pago + data); opcional: conta_bancaria_id (registra movimentação)
router.patch('/:id/baixar', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { valor_pago, data_pagamento, conta_bancaria_id } = req.body;
    const valorPago = parseFloat(valor_pago) || 0;
    const dataPag = data_pagamento || new Date().toISOString().slice(0, 10);

    const pag = await pool.query(
      'SELECT id, descricao, conta_pagar_id FROM pagamentos WHERE id = $1',
      [id]
    );
    if (!pag.rows.length) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }
    const descricao = pag.rows[0].descricao || `Pagamento #${id}`;

    await client.query('BEGIN');

    if (conta_bancaria_id) {
      const contaBancaria = await client.query(
        'SELECT saldo_atual FROM contas_bancarias WHERE id = $1',
        [conta_bancaria_id]
      );
      if (!contaBancaria.rows.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Conta bancária não encontrada' });
      }
      const saldoAnterior = parseFloat(contaBancaria.rows[0].saldo_atual || 0);
      await client.query(
        `INSERT INTO movimentacoes_bancarias (conta_bancaria_id, tipo, data, descricao, valor, categoria, pagamento_id, saldo_anterior)
         VALUES ($1, 'saida', $2, $3, $4, 'pagamento_manual', $5, $6)`,
        [conta_bancaria_id, dataPag, descricao, valorPago, id, saldoAnterior]
      );
    }

    const result = await client.query(
      conta_bancaria_id
        ? `UPDATE pagamentos SET valor_pago = $1, data_pagamento = $2, status = 'Pago', conta_bancaria_id = $3 WHERE id = $4 RETURNING *`
        : `UPDATE pagamentos SET valor_pago = $1, data_pagamento = $2, status = 'Pago' WHERE id = $3 RETURNING *`,
      conta_bancaria_id ? [valorPago, dataPag, conta_bancaria_id, id] : [valorPago, dataPag, id]
    );
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao dar baixa no pagamento:', err);
    res.status(500).json({ error: 'Erro ao dar baixa' });
  } finally {
    client.release();
  }
});

module.exports = router;

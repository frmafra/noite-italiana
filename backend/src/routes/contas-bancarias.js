const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /dashboard/saldos - Deve vir antes de /:id
router.get('/dashboard/saldos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nome, tipo, saldo_atual, ativo
      FROM contas_bancarias
      WHERE ativo = true
      ORDER BY nome
    `);
    const total = result.rows.reduce((sum, conta) =>
      sum + parseFloat(conta.saldo_atual || 0), 0
    );
    res.json({ contas: result.rows, total_geral: total });
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ error: 'Erro ao buscar saldos' });
  }
});

// GET - Listar contas bancárias
router.get('/', async (req, res) => {
  try {
    const { ativo } = req.query;
    let query = 'SELECT * FROM contas_bancarias WHERE 1=1';
    const params = [];
    if (ativo !== undefined) {
      params.push(ativo === 'true');
      query += ` AND ativo = $${params.length}`;
    }
    query += ' ORDER BY nome';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar contas:', error);
    res.status(500).json({ error: 'Erro ao listar contas bancárias' });
  }
});

// GET /:id - Buscar uma conta
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM contas_bancarias WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar conta:', error);
    res.status(500).json({ error: 'Erro ao buscar conta' });
  }
});

// POST - Criar conta
router.post('/', async (req, res) => {
  try {
    const { nome, tipo, banco, agencia, conta, saldo_inicial, observacoes, ativo } = req.body;
    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    const saldo = parseFloat(saldo_inicial) || 0;
    const result = await pool.query(
      `INSERT INTO contas_bancarias (nome, tipo, banco, agencia, conta, saldo_inicial, saldo_atual, observacoes, ativo)
       VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8)
       RETURNING *`,
      [nome, tipo || 'conta_corrente', banco || null, agencia || null, conta || null, saldo, observacoes || null, ativo !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// PUT /:id - Atualizar conta
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, tipo, banco, agencia, conta, observacoes, ativo } = req.body;
    const result = await pool.query(
      `UPDATE contas_bancarias SET
        nome = COALESCE($1, nome), tipo = COALESCE($2, tipo), banco = $3, agencia = $4, conta = $5,
        observacoes = $6, ativo = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [nome, tipo, banco, agencia, conta, observacoes, ativo, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar conta:', error);
    res.status(500).json({ error: 'Erro ao atualizar conta' });
  }
});

module.exports = router;

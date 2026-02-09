const express = require('express');
const router = express.Router();
const pool = require('../config/database');
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM pedidos_compras ORDER BY id DESC');
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: 'Erro ao listar' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM pedidos_compras WHERE id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});
router.post('/', async (req, res) => {
  try {
    const { solicitacao_id, fornecedor_id, valor_total, status } = req.body;
    const r = await pool.query('INSERT INTO pedidos_compras (solicitacao_id,fornecedor_id,valor_total,status) VALUES ($1,$2,$3,$4) RETURNING *', [solicitacao_id, fornecedor_id, valor_total, status]);
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao criar' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { solicitacao_id, fornecedor_id, valor_total, status } = req.body;
    const r = await pool.query('UPDATE pedidos_compras SET solicitacao_id=$1,fornecedor_id=$2,valor_total=$3,status=$4 WHERE id=$5 RETURNING *', [solicitacao_id, fornecedor_id, valor_total, status, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM pedidos_compras WHERE id=$1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Deletado com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});
module.exports = router;

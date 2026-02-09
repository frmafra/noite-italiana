const express = require('express');
const router = express.Router();
const pool = require('../config/database');
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM solicitacoes_compras ORDER BY id DESC');
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: 'Erro ao listar' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM solicitacoes_compras WHERE id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});
router.post('/', async (req, res) => {
  try {
    const { atividade_id, area_id, status } = req.body;
    const r = await pool.query('INSERT INTO solicitacoes_compras (atividade_id,area_id,status) VALUES ($1,$2,$3) RETURNING *', [atividade_id, area_id, status]);
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao criar' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { atividade_id, area_id, status } = req.body;
    const r = await pool.query('UPDATE solicitacoes_compras SET atividade_id=$1,area_id=$2,status=$3 WHERE id=$4 RETURNING *', [atividade_id, area_id, status, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM solicitacoes_compras WHERE id=$1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Deletado com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});
module.exports = router;

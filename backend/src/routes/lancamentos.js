const express = require('express');
const router = express.Router();
const pool = require('../config/database');
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM financeiro ORDER BY id DESC');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Erro ao listar' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM financeiro WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});
router.post('/', async (req, res) => {
  try {
    const { descricao, tipo, valor, data_vencimento, status, projeto_id, banco_id, categoria } = req.body;
    const result = await pool.query('INSERT INTO financeiro (descricao,tipo,valor,data_vencimento,status,projeto_id,banco_id,categoria) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [descricao, tipo, valor, data_vencimento, status, projeto_id, banco_id, categoria]);
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao criar' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { descricao, tipo, valor, data_vencimento, status, projeto_id, banco_id, categoria } = req.body;
    const result = await pool.query('UPDATE financeiro SET descricao=$1,tipo=$2,valor=$3,data_vencimento=$4,status=$5,projeto_id=$6,banco_id=$7,categoria=$8 WHERE id=$9 RETURNING *', [descricao, tipo, valor, data_vencimento, status, projeto_id, banco_id, categoria, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM financeiro WHERE id=$1 RETURNING *', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Deletado com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});
module.exports = router;

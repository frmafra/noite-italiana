const express = require('express');
const router = express.Router();
const pool = require('../config/database');
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes_patrocinadores ORDER BY nome');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Erro ao listar' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes_patrocinadores WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});
router.post('/', async (req, res) => {
  try {
    const { nome, valor_cota, projeto_id } = req.body;
    const result = await pool.query('INSERT INTO clientes_patrocinadores (nome,valor_cota,projeto_id) VALUES ($1,$2,$3) RETURNING *', [nome, valor_cota, projeto_id]);
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao criar' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { nome, valor_cota, projeto_id } = req.body;
    const result = await pool.query('UPDATE clientes_patrocinadores SET nome=$1,valor_cota=$2,projeto_id=$3 WHERE id=$4 RETURNING *', [nome, valor_cota, projeto_id, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM clientes_patrocinadores WHERE id=$1 RETURNING *', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Deletado com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});
module.exports = router;

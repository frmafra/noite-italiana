const express = require('express');
const router = express.Router();
const pool = require('../config/database');
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departamentos ORDER BY nome');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM departamentos WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});
router.post('/', async (req, res) => {
  try {
    const { nome, projeto_id, coordenador_id, base_id, ativo } = req.body;
    const result = await pool.query('INSERT INTO departamentos (nome, projeto_id, coordenador_id, base_id, ativo) VALUES ($1,$2,$3,$4,$5) RETURNING *', [nome, projeto_id, coordenador_id, base_id, ativo]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, projeto_id, coordenador_id, base_id, ativo } = req.body;
    const result = await pool.query('UPDATE departamentos SET nome=$1, projeto_id=$2, coordenador_id=$3, base_id=$4, ativo=$5 WHERE id=$6 RETURNING *', [nome, projeto_id, coordenador_id, base_id, ativo, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM departamentos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});
module.exports = router;

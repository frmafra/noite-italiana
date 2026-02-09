const express = require('express');
const router = express.Router();
const pool = require('../config/database');
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM atividades_coordenacao ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM atividades_coordenacao WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});
router.post('/', async (req, res) => {
  try {
    const { departamento_id, voluntario_id, membro_id, descricao, status, data_inicio, data_fim } = req.body;
    const result = await pool.query('INSERT INTO atividades_coordenacao (departamento_id, voluntario_id, membro_id, descricao, status, data_inicio, data_fim) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [departamento_id, voluntario_id, membro_id, descricao, status, data_inicio, data_fim]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { departamento_id, voluntario_id, membro_id, descricao, status, data_inicio, data_fim } = req.body;
    const result = await pool.query('UPDATE atividades_coordenacao SET departamento_id=$1, voluntario_id=$2, membro_id=$3, descricao=$4, status=$5, data_inicio=$6, data_fim=$7 WHERE id=$8 RETURNING *', [departamento_id, voluntario_id, membro_id, descricao, status, data_inicio, data_fim, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM atividades_coordenacao WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});
module.exports = router;

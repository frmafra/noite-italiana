const express = require('express');
const router = express.Router();
const pool = require('../config/database');
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, orcamento_previsto, orcamento_realizado FROM projetos ORDER BY id DESC');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Erro ao listar' });
  }
});
router.get('/:projeto_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, orcamento_previsto, orcamento_realizado FROM projetos WHERE id = $1', [req.params.projeto_id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Projeto não encontrado' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar orçamento' });
  }
});
module.exports = router;

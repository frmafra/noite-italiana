const express = require('express');
const router = express.Router();
const pool = require('../config/database');
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ingressos ORDER BY id DESC');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Erro ao listar' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ingressos WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});
router.post('/', async (req, res) => {
  try {
    const { numero_convite, socio_vendedor_id, valor, status, projeto_id, data_venda } = req.body;
    const result = await pool.query('INSERT INTO ingressos (numero_convite,socio_vendedor_id,valor,status,projeto_id,data_venda) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [numero_convite, socio_vendedor_id, valor, status, projeto_id, data_venda]);
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao criar' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { numero_convite, socio_vendedor_id, valor, status, projeto_id, data_venda } = req.body;
    const result = await pool.query('UPDATE ingressos SET numero_convite=$1,socio_vendedor_id=$2,valor=$3,status=$4,projeto_id=$5,data_venda=$6 WHERE id=$7 RETURNING *', [numero_convite, socio_vendedor_id, valor, status, projeto_id, data_venda, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM ingressos WHERE id=$1 RETURNING *', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Deletado com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});
module.exports = router;

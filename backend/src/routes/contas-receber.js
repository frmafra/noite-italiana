const express = require('express');
const router = express.Router();
const pool = require('../config/database');
router.get('/', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM financeiro WHERE tipo='Receita' ORDER BY data_vencimento");
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Erro ao listar' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM financeiro WHERE id=$1 AND tipo='Receita'", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});
router.post('/', async (req, res) => {
  try {
    const { descricao, valor, data_vencimento, status, projeto_id, banco_id, categoria } = req.body;
    const result = await pool.query("INSERT INTO financeiro (descricao,tipo,valor,data_vencimento,status,projeto_id,banco_id,categoria) VALUES ($1,'Receita',$2,$3,$4,$5,$6,$7) RETURNING *", [descricao, valor, data_vencimento, status, projeto_id, banco_id, categoria]);
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao criar' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { descricao, valor, data_vencimento, status, projeto_id, banco_id, categoria } = req.body;
    const result = await pool.query("UPDATE financeiro SET descricao=$1,valor=$2,data_vencimento=$3,status=$4,projeto_id=$5,banco_id=$6,categoria=$7 WHERE id=$8 AND tipo='Receita' RETURNING *", [descricao, valor, data_vencimento, status, projeto_id, banco_id, categoria, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM financeiro WHERE id=$1 AND tipo='Receita' RETURNING *", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Deletado com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});
module.exports = router;

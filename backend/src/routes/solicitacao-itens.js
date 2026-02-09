const express = require('express');
const router = express.Router();
const pool = require('../config/database');
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM solicitacao_itens ORDER BY id');
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: 'Erro ao listar' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM solicitacao_itens WHERE id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});
router.post('/', async (req, res) => {
  try {
    const { solicitacao_id, produto_id, quantidade, observacao } = req.body;
    const r = await pool.query('INSERT INTO solicitacao_itens (solicitacao_id,produto_id,quantidade,observacao) VALUES ($1,$2,$3,$4) RETURNING *', [solicitacao_id, produto_id, quantidade, observacao]);
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao criar' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { solicitacao_id, produto_id, quantidade, observacao } = req.body;
    const r = await pool.query('UPDATE solicitacao_itens SET solicitacao_id=$1,produto_id=$2,quantidade=$3,observacao=$4 WHERE id=$5 RETURNING *', [solicitacao_id, produto_id, quantidade, observacao, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM solicitacao_itens WHERE id=$1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Deletado com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});
module.exports = router;

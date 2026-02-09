const express = require('express');
const router = express.Router();
const pool = require('../config/database');
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM aprovacoes_compras ORDER BY id DESC');
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: 'Erro ao listar' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM aprovacoes_compras WHERE id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});
router.post('/', async (req, res) => {
  try {
    const { solicitacao_id, aprovador_id, status, data_aprovacao, observacao } = req.body;
    const r = await pool.query('INSERT INTO aprovacoes_compras (solicitacao_id,aprovador_id,status,data_aprovacao,observacao) VALUES ($1,$2,$3,$4,$5) RETURNING *', [solicitacao_id, aprovador_id, status, data_aprovacao, observacao]);
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao criar' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { solicitacao_id, aprovador_id, status, data_aprovacao, observacao } = req.body;
    const r = await pool.query('UPDATE aprovacoes_compras SET solicitacao_id=$1,aprovador_id=$2,status=$3,data_aprovacao=$4,observacao=$5 WHERE id=$6 RETURNING *', [solicitacao_id, aprovador_id, status, data_aprovacao, observacao, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM aprovacoes_compras WHERE id=$1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Deletado com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});
module.exports = router;

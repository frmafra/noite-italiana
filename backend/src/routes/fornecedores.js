const express = require('express');
const router = express.Router();
const pool = require('../config/database');
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM fornecedores ORDER BY nome');
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: 'Erro ao listar' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM fornecedores WHERE id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});
router.post('/', async (req, res) => {
  try {
    const { nome, contato, categoria, telefone, email, contato_vendedor, endereco, cep, cnpj, ativo } = req.body;
    const r = await pool.query('INSERT INTO fornecedores (nome,contato,categoria,telefone,email,contato_vendedor,endereco,cep,cnpj,ativo) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *', [nome, contato, categoria, telefone, email, contato_vendedor, endereco, cep, cnpj, ativo]);
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao criar' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { nome, contato, categoria, telefone, email, contato_vendedor, endereco, cep, cnpj, ativo } = req.body;
    const r = await pool.query('UPDATE fornecedores SET nome=$1,contato=$2,categoria=$3,telefone=$4,email=$5,contato_vendedor=$6,endereco=$7,cep=$8,cnpj=$9,ativo=$10 WHERE id=$11 RETURNING *', [nome, contato, categoria, telefone, email, contato_vendedor, endereco, cep, cnpj, ativo, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM fornecedores WHERE id=$1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Deletado com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});
module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET - Listar todos os projetos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projetos ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({ error: 'Erro ao listar projetos' });
  }
});

// GET - Buscar projeto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM projetos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({ error: 'Erro ao buscar projeto' });
  }
});

// POST - Criar novo projeto
router.post('/', async (req, res) => {
  try {
    const { nome, descricao, escopo, data_inicio, data_fim, orcamento_previsto, status } = req.body;
    const result = await pool.query(
      `INSERT INTO projetos (nome, descricao, escopo, data_inicio, data_fim, orcamento_previsto, status, ativo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *`,
      [nome, descricao, escopo, data_inicio, data_fim, orcamento_previsto || 0, status || 'Planejamento']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ error: 'Erro ao criar projeto' });
  }
});

// PUT - Atualizar projeto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, escopo, data_inicio, data_fim, orcamento_previsto, orcamento_realizado, status, ativo } = req.body;
    const result = await pool.query(
      `UPDATE projetos 
       SET nome=$1, descricao=$2, escopo=$3, data_inicio=$4, data_fim=$5, 
           orcamento_previsto=$6, orcamento_realizado=$7, status=$8, ativo=$9 
       WHERE id=$10 RETURNING *`,
      [nome, descricao, escopo, data_inicio, data_fim, orcamento_previsto, orcamento_realizado, status, ativo, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ error: 'Erro ao atualizar projeto' });
  }
});

// DELETE - Deletar projeto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM projetos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    res.json({ message: 'Projeto deletado com sucesso', projeto: result.rows[0] });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({ error: 'Erro ao deletar projeto' });
  }
});

module.exports = router;

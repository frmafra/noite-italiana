const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET - Listar todos os voluntários
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM voluntarios_master ORDER BY nome');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar voluntários:', error);
    res.status(500).json({ error: 'Erro ao listar voluntários' });
  }
});

// GET - Buscar voluntário por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM voluntarios_master WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voluntário não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar voluntário:', error);
    res.status(500).json({ error: 'Erro ao buscar voluntário' });
  }
});

// POST - Criar novo voluntário
router.post('/', async (req, res) => {
  try {
    const { nome, telefone, email, login, senha, status_vinculo } = req.body;
    const is_coordenador = status_vinculo === 'Coordenador';
    const result = await pool.query(
      `INSERT INTO voluntarios_master (nome, telefone, email, login, senha, is_coordenador, status_vinculo, ativo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *`,
      [nome, telefone, email, login, senha || '123456', is_coordenador, status_vinculo || 'Voluntário']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar voluntário:', error);
    res.status(500).json({ error: 'Erro ao criar voluntário' });
  }
});

// PUT - Atualizar voluntário
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email, login, senha, status_vinculo, ativo } = req.body;
    const is_coordenador = status_vinculo === 'Coordenador';
    const result = await pool.query(
      `UPDATE voluntarios_master 
       SET nome=$1, telefone=$2, email=$3, login=$4, senha=$5, is_coordenador=$6, status_vinculo=$7, ativo=$8 
       WHERE id=$9 RETURNING *`,
      [nome, telefone, email, login, senha, is_coordenador, status_vinculo, ativo, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voluntário não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar voluntário:', error);
    res.status(500).json({ error: 'Erro ao atualizar voluntário' });
  }
});

// DELETE - Deletar voluntário
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM voluntarios_master WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voluntário não encontrado' });
    }
    res.json({ message: 'Voluntário deletado com sucesso', voluntario: result.rows[0] });
  } catch (error) {
    console.error('Erro ao deletar voluntário:', error);
    res.status(500).json({ error: 'Erro ao deletar voluntário' });
  }
});

module.exports = router;

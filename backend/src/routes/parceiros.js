const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET - Listar todos os parceiros
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM parceiros_negocios ORDER BY nome_razao_social');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar parceiros:', error);
    res.status(500).json({ error: 'Erro ao listar parceiros' });
  }
});

// GET - Buscar parceiro por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM parceiros_negocios WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parceiro não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar parceiro:', error);
    res.status(500).json({ error: 'Erro ao buscar parceiro' });
  }
});

// POST - Criar novo parceiro
router.post('/', async (req, res) => {
  try {
    const { nome_razao_social, nome_fantasia, cnpj_cpf, tipo_parceiro, email, telefone, cep, logradouro, numero, complemento, bairro, cidade, estado } = req.body;
    const result = await pool.query(
      `INSERT INTO parceiros_negocios (nome_razao_social, nome_fantasia, cnpj_cpf, tipo_parceiro, email, telefone, cep, logradouro, numero, complemento, bairro, cidade, estado) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [nome_razao_social, nome_fantasia, cnpj_cpf, tipo_parceiro, email, telefone, cep, logradouro, numero, complemento, bairro, cidade, estado]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar parceiro:', error);
    res.status(500).json({ error: 'Erro ao criar parceiro' });
  }
});

// PUT - Atualizar parceiro
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_razao_social, nome_fantasia, cnpj_cpf, tipo_parceiro, email, telefone, cep, logradouro, numero, complemento, bairro, cidade, estado } = req.body;
    const result = await pool.query(
      `UPDATE parceiros_negocios 
       SET nome_razao_social=$1, nome_fantasia=$2, cnpj_cpf=$3, tipo_parceiro=$4, email=$5, telefone=$6, 
           cep=$7, logradouro=$8, numero=$9, complemento=$10, bairro=$11, cidade=$12, estado=$13 
       WHERE id=$14 RETURNING *`,
      [nome_razao_social, nome_fantasia, cnpj_cpf, tipo_parceiro, email, telefone, cep, logradouro, numero, complemento, bairro, cidade, estado, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parceiro não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar parceiro:', error);
    res.status(500).json({ error: 'Erro ao atualizar parceiro' });
  }
});

// DELETE - Deletar parceiro
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM parceiros_negocios WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parceiro não encontrado' });
    }
    res.json({ message: 'Parceiro deletado com sucesso', parceiro: result.rows[0] });
  } catch (error) {
    console.error('Erro ao deletar parceiro:', error);
    res.status(500).json({ error: 'Erro ao deletar parceiro' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET - Listar todos (com filtros: ativo, busca)
router.get('/', async (req, res) => {
  try {
    const { ativo, busca } = req.query;
    let query = 'SELECT * FROM fornecedores WHERE 1=1';
    const params = [];

    if (ativo !== undefined) {
      params.push(ativo === 'true');
      query += ` AND ativo = $${params.length}`;
    }

    if (busca) {
      params.push(`%${busca}%`);
      query += ` AND (razao_social ILIKE $${params.length}
                 OR nome_fantasia ILIKE $${params.length}
                 OR COALESCE(nome, '') ILIKE $${params.length}
                 OR cnpj ILIKE $${params.length})`;
    }

    query += ' ORDER BY COALESCE(razao_social, nome)';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    res.status(500).json({ error: 'Erro ao listar fornecedores' });
  }
});

// GET - Buscar um
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM fornecedores WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    res.status(500).json({ error: 'Erro ao buscar fornecedor' });
  }
});

// POST - Criar
router.post('/', async (req, res) => {
  try {
    const {
      razao_social, nome_fantasia, cnpj, cpf, tipo, inscricao_estadual,
      telefone, celular, email, site,
      cep, logradouro, numero, complemento, bairro, cidade, estado,
      banco, agencia, conta, pix,
      contato_comercial, email_comercial, telefone_comercial,
      observacoes, ativo
    } = req.body;

    const nomeFinal = razao_social || nome_fantasia;
    if (!nomeFinal) {
      return res.status(400).json({ error: 'Razão social é obrigatória' });
    }

    const result = await pool.query(
      `INSERT INTO fornecedores (
        razao_social, nome_fantasia, nome, cnpj, cpf, tipo, inscricao_estadual,
        telefone, celular, email, site,
        cep, logradouro, numero, complemento, bairro, cidade, estado,
        banco, agencia, conta, pix,
        contato_comercial, email_comercial, telefone_comercial,
        observacoes, ativo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      RETURNING *`,
      [
        razao_social, nome_fantasia, nomeFinal, cnpj, cpf, tipo || 'juridica', inscricao_estadual,
        telefone, celular, email, site,
        cep, logradouro, numero, complemento, bairro, cidade, estado,
        banco, agencia, conta, pix,
        contato_comercial, email_comercial, telefone_comercial,
        observacoes, ativo !== false
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);

    if (error.code === '23505') {
      return res.status(400).json({ error: 'CNPJ já cadastrado' });
    }

    res.status(500).json({ error: 'Erro ao criar fornecedor' });
  }
});

// PUT - Atualizar
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      razao_social, nome_fantasia, cnpj, cpf, tipo, inscricao_estadual,
      telefone, celular, email, site,
      cep, logradouro, numero, complemento, bairro, cidade, estado,
      banco, agencia, conta, pix,
      contato_comercial, email_comercial, telefone_comercial,
      observacoes, ativo
    } = req.body;

    const nomeFinal = razao_social || nome_fantasia;

    const result = await pool.query(
      `UPDATE fornecedores SET
        razao_social = $1, nome_fantasia = $2, nome = $3, cnpj = $4, cpf = $5, tipo = $6, inscricao_estadual = $7,
        telefone = $8, celular = $9, email = $10, site = $11,
        cep = $12, logradouro = $13, numero = $14, complemento = $15, bairro = $16, cidade = $17, estado = $18,
        banco = $19, agencia = $20, conta = $21, pix = $22,
        contato_comercial = $23, email_comercial = $24, telefone_comercial = $25,
        observacoes = $26, ativo = $27, updated_at = NOW()
      WHERE id = $28
      RETURNING *`,
      [
        razao_social, nome_fantasia, nomeFinal, cnpj, cpf, tipo, inscricao_estadual,
        telefone, celular, email, site,
        cep, logradouro, numero, complemento, bairro, cidade, estado,
        banco, agencia, conta, pix,
        contato_comercial, email_comercial, telefone_comercial,
        observacoes, ativo, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    res.status(500).json({ error: 'Erro ao atualizar fornecedor' });
  }
});

// DELETE - Inativar (não exclui fisicamente)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE fornecedores SET ativo = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json({ message: 'Fornecedor inativado com sucesso' });
  } catch (error) {
    console.error('Erro ao inativar fornecedor:', error);
    res.status(500).json({ error: 'Erro ao inativar fornecedor' });
  }
});

module.exports = router;

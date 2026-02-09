const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET - Listar todos (com filtros)
router.get('/', async (req, res) => {
  try {
    const { ativo, busca, tipo } = req.query;
    let query = 'SELECT * FROM parceiros WHERE 1=1';
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

    if (tipo === 'fornecedor') query += ' AND eh_fornecedor = true';
    if (tipo === 'cliente') query += ' AND eh_cliente = true';
    if (tipo === 'entidade') query += ' AND eh_entidade = true';

    query += ' ORDER BY COALESCE(razao_social, nome)';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar parceiros:', error);
    res.status(500).json({ error: 'Erro ao listar parceiros' });
  }
});

// GET - Buscar um
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM parceiros WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parceiro não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar parceiro:', error);
    res.status(500).json({ error: 'Erro ao buscar parceiro' });
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
      observacoes, ativo,
      eh_fornecedor, eh_cliente, eh_entidade
    } = req.body;

    if (!razao_social?.trim()) {
      return res.status(400).json({ error: 'Razão social é obrigatória' });
    }

    const ef = eh_fornecedor === true || eh_fornecedor === 'true';
    const ec = eh_cliente === true || eh_cliente === 'true';
    const ee = eh_entidade === true || eh_entidade === 'true';
    if (!ef && !ec && !ee) {
      return res.status(400).json({ error: 'Selecione pelo menos um tipo (Fornecedor, Cliente ou Entidade)' });
    }

    const nomeFinal = razao_social.trim() || nome_fantasia || '';

    const result = await pool.query(
      `INSERT INTO parceiros (
        razao_social, nome_fantasia, nome, cnpj, cpf, tipo, inscricao_estadual,
        telefone, celular, email, site,
        cep, logradouro, numero, complemento, bairro, cidade, estado,
        banco, agencia, conta, pix,
        contato_comercial, email_comercial, telefone_comercial,
        observacoes, ativo,
        eh_fornecedor, eh_cliente, eh_entidade
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
      RETURNING *`,
      [
        razao_social, nome_fantasia, nomeFinal, cnpj || null, cpf || null, tipo || 'juridica', inscricao_estadual || null,
        telefone || null, celular || null, email || null, site || null,
        cep || null, logradouro || null, numero || null, complemento || null, bairro || null, cidade || null, estado || null,
        banco || null, agencia || null, conta || null, pix || null,
        contato_comercial || null, email_comercial || null, telefone_comercial || null,
        observacoes || null, ativo !== false,
        ef, ec, ee
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar parceiro:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'CNPJ já cadastrado' });
    }
    res.status(500).json({ error: 'Erro ao criar parceiro: ' + (error.message || '') });
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
      observacoes, ativo,
      eh_fornecedor, eh_cliente, eh_entidade
    } = req.body;

    const ef = eh_fornecedor === true || eh_fornecedor === 'true';
    const ec = eh_cliente === true || eh_cliente === 'true';
    const ee = eh_entidade === true || eh_entidade === 'true';
    if (!ef && !ec && !ee) {
      return res.status(400).json({ error: 'Selecione pelo menos um tipo' });
    }

    const nomeFinal = razao_social || nome_fantasia || '';

    const result = await pool.query(
      `UPDATE parceiros SET
        razao_social = $1, nome_fantasia = $2, nome = $3, cnpj = $4, cpf = $5, tipo = $6, inscricao_estadual = $7,
        telefone = $8, celular = $9, email = $10, site = $11,
        cep = $12, logradouro = $13, numero = $14, complemento = $15, bairro = $16, cidade = $17, estado = $18,
        banco = $19, agencia = $20, conta = $21, pix = $22,
        contato_comercial = $23, email_comercial = $24, telefone_comercial = $25,
        observacoes = $26, ativo = $27,
        eh_fornecedor = $28, eh_cliente = $29, eh_entidade = $30,
        updated_at = NOW()
      WHERE id = $31
      RETURNING *`,
      [
        razao_social, nome_fantasia, nomeFinal, cnpj, cpf, tipo, inscricao_estadual,
        telefone, celular, email, site,
        cep, logradouro, numero, complemento, bairro, cidade, estado,
        banco, agencia, conta, pix,
        contato_comercial, email_comercial, telefone_comercial,
        observacoes, ativo,
        ef, ec, ee,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parceiro não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar parceiro:', error);
    res.status(500).json({ error: 'Erro ao atualizar parceiro: ' + (error.message || '') });
  }
});

// DELETE - Inativar
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE parceiros SET ativo = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parceiro não encontrado' });
    }

    res.json({ message: 'Parceiro inativado com sucesso' });
  } catch (error) {
    console.error('Erro ao inativar parceiro:', error);
    res.status(500).json({ error: 'Erro ao inativar parceiro' });
  }
});

module.exports = router;

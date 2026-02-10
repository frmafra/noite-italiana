/**
 * API de membros/usuários do portal - usa voluntarios_master.
 * Perfis: Voluntário, Coordenador, Administrador, Tesoureiro, Usuário
 */
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

function toMembro(row, incluirSenha = false) {
  const m = {
    id: row.id,
    nome: row.nome_completo || row.nome || '',
    cargo: row.status_vinculo || 'Usuário',
    login: row.login || '',
    bloqueado: row.ativo === false,
  };
  if (incluirSenha) m.senha = row.senha || '';
  return m;
}

// GET - Listar membros (para gestão de usuários)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nome, nome_completo, login, senha, status_vinculo, ativo
       FROM voluntarios_master
       WHERE login IS NOT NULL AND login != ''
       ORDER BY COALESCE(nome_completo, nome, '')`
    );
    res.json(result.rows.map((r) => toMembro(r, false)));
  } catch (error) {
    console.error('Erro ao listar membros:', error);
    res.status(500).json({ error: 'Erro ao listar membros' });
  }
});

// GET - Um membro por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, nome, nome_completo, login, senha, status_vinculo, ativo FROM voluntarios_master WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Membro não encontrado' });
    res.json(toMembro(result.rows[0], false));
  } catch (error) {
    console.error('Erro ao buscar membro:', error);
    res.status(500).json({ error: 'Erro ao buscar membro' });
  }
});

// POST - Criar membro (usuário do portal)
router.post('/', async (req, res) => {
  try {
    const { nome, cargo, login, senha, bloqueado } = req.body || {};
    const status_vinculo = cargo || 'Usuário';
    const is_coordenador = status_vinculo === 'Coordenador';
    const ativo = bloqueado !== true;
    const nomeFinal = nome || login || 'Novo usuário';
    const result = await pool.query(
      `INSERT INTO voluntarios_master (nome, nome_completo, login, senha, status_vinculo, is_coordenador, ativo, telefone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, '')
       RETURNING id, nome, nome_completo, login, senha, status_vinculo, ativo`,
      [nomeFinal, nomeFinal, login || null, senha || '123456', status_vinculo, is_coordenador, ativo]
    );
    res.status(201).json(toMembro(result.rows[0], false));
  } catch (error) {
    console.error('Erro ao criar membro:', error);
    res.status(500).json({ error: 'Erro ao criar membro' });
  }
});

// PUT - Atualizar membro
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cargo, login, senha, bloqueado } = req.body || {};
    const status_vinculo = cargo || 'Usuário';
    const is_coordenador = status_vinculo === 'Coordenador';
    const ativo = bloqueado !== true;
    const nomeFinal = nome || '';

    let query = `UPDATE voluntarios_master SET nome=$1, nome_completo=$2, login=$3, status_vinculo=$4, is_coordenador=$5, ativo=$6`;
    const values = [nomeFinal, nomeFinal, login || null, status_vinculo, is_coordenador, ativo];
    if (senha != null && String(senha).trim() !== '') {
      query += `, senha=$${values.length + 1}`;
      values.push(senha);
    }
    values.push(id);
    query += ` WHERE id=$${values.length} RETURNING id, nome, nome_completo, login, senha, status_vinculo, ativo`;
    const result = await pool.query(query, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Membro não encontrado' });
    res.json(toMembro(result.rows[0], false));
  } catch (error) {
    console.error('Erro ao atualizar membro:', error);
    res.status(500).json({ error: 'Erro ao atualizar membro' });
  }
});

module.exports = router;

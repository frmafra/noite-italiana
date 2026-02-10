/**
 * API para solicitações de convite da Noite Italiana (formulário "Eu quero um convite")
 */
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const VALOR_CONVITE = 100;
const PERFIS_PERMITIDOS = ['Administrador', 'Tesoureiro', 'Coordenador'];

function requirePortalAuth(req, res, next) {
  const raw = req.headers['x-portal-user'];
  if (!raw) {
    return res.status(401).json({ error: 'Não autorizado. Faça login no portal.' });
  }
  try {
    const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!user.perfil || !PERFIS_PERMITIDOS.includes(user.perfil)) {
      return res.status(403).json({ error: 'Perfil sem permissão para esta ação.' });
    }
    req.portalUser = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

// POST - Registrar nova solicitação (público, sem auth)
router.post('/', async (req, res) => {
  try {
    const { nome_solicitante, quantidade_convites, whatsapp } = req.body || {};
    const nome = String(nome_solicitante || '').trim();
    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    const qtd = Math.max(1, parseInt(quantidade_convites, 10) || 1);
    const result = await pool.query(
      `INSERT INTO solicitacoes_convite (nome_solicitante, quantidade_convites, valor_unitario, whatsapp, status)
       VALUES ($1, $2, $3, $4, 'NOVO')
       RETURNING id, nome_solicitante, quantidade_convites, valor_unitario, whatsapp, status, created_at`,
      [nome, qtd, VALOR_CONVITE, (whatsapp && String(whatsapp).trim()) || null]
    );
    res.status(201).json({
      ok: true,
      message: 'Solicitação registrada! Entraremos em contato.',
      solicitacao: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao registrar solicitação de convite:', error);
    res.status(500).json({ error: 'Erro ao enviar solicitação' });
  }
});

// GET - Listar solicitações (protegido por perfil)
router.get('/', requirePortalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.nome_solicitante, s.quantidade_convites, s.valor_unitario, s.whatsapp,
              s.status, s.responsavel_id, s.contatado_em, s.concluido_em, s.valor_final, s.forma_pagamento, s.observacoes, s.created_at,
              v.nome AS responsavel_nome
       FROM solicitacoes_convite s
       LEFT JOIN voluntarios_master v ON v.id = s.responsavel_id
       ORDER BY s.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar solicitações:', error);
    res.status(500).json({ error: 'Erro ao listar solicitações' });
  }
});

// PATCH - Atualizar solicitação (status, responsável, datas, valor_final, etc.) — protegido
router.patch('/:id', requirePortalAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, responsavel_id, valor_final, forma_pagamento, observacoes } = req.body || {};

    const current = await pool.query(
      'SELECT status, contatado_em, concluido_em FROM solicitacoes_convite WHERE id = $1',
      [id]
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }
    const row = current.rows[0];
    let contatado_em = row.contatado_em;
    let concluido_em = row.concluido_em;

    const novoStatus = status ? String(status).toUpperCase() : null;
    if (novoStatus === 'CONTATADO' && !row.contatado_em) {
      contatado_em = new Date();
    }
    if (novoStatus === 'CONCLUIDO' && !row.concluido_em) {
      concluido_em = new Date();
    }

    const updates = [];
    const values = [];
    let pos = 1;
    if (novoStatus !== null) {
      updates.push(`status = $${pos}`);
      values.push(novoStatus);
      pos++;
    }
    if (responsavel_id !== undefined) {
      updates.push(`responsavel_id = $${pos}`);
      values.push(responsavel_id === '' || responsavel_id == null ? null : parseInt(responsavel_id, 10));
      pos++;
    }
    if (contatado_em !== undefined && contatado_em !== row.contatado_em) {
      updates.push(`contatado_em = $${pos}`);
      values.push(contatado_em);
      pos++;
    }
    if (concluido_em !== undefined && concluido_em !== row.concluido_em) {
      updates.push(`concluido_em = $${pos}`);
      values.push(concluido_em);
      pos++;
    }
    if (valor_final !== undefined) {
      updates.push(`valor_final = $${pos}`);
      values.push(valor_final === '' || valor_final == null ? null : parseFloat(valor_final));
      pos++;
    }
    if (forma_pagamento !== undefined) {
      updates.push(`forma_pagamento = $${pos}`);
      values.push(forma_pagamento === '' ? null : String(forma_pagamento).trim());
      pos++;
    }
    if (observacoes !== undefined) {
      updates.push(`observacoes = $${pos}`);
      values.push(observacoes === '' ? null : String(observacoes).trim());
      pos++;
    }

    if (updates.length === 0) {
      const r = await pool.query(
        `SELECT s.*, v.nome AS responsavel_nome FROM solicitacoes_convite s LEFT JOIN voluntarios_master v ON v.id = s.responsavel_id WHERE s.id = $1`,
        [id]
      );
      return res.json(r.rows[0]);
    }

    values.push(id);
    const sql = `UPDATE solicitacoes_convite SET ${updates.join(', ')} WHERE id = $${pos} RETURNING *`;
    const result = await pool.query(sql, values);
    const updated = result.rows[0];
    const withNome = await pool.query(
      'SELECT s.*, v.nome AS responsavel_nome FROM solicitacoes_convite s LEFT JOIN voluntarios_master v ON v.id = s.responsavel_id WHERE s.id = $1',
      [updated.id]
    );
    res.json(withNome.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error);
    res.status(500).json({ error: 'Erro ao atualizar solicitação' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/auth/setup-admin - cria usuário admin (login: admin, senha: Luma110703) se não existir
router.get('/setup-admin', async (req, res) => {
  try {
    const check = await pool.query(
      "SELECT id FROM voluntarios_master WHERE login = $1",
      ['admin']
    );
    if (check.rows.length > 0) {
      return res.json({ ok: true, message: 'Usuário admin já existe.' });
    }
    await pool.query(
      `INSERT INTO voluntarios_master (nome, nome_completo, login, senha, status_vinculo, is_coordenador, ativo, telefone)
       VALUES ($1, $2, $3, $4, $5, $6, true, '')`,
      ['Administrador', 'Administrador', 'admin', 'Luma110703', 'Administrador', false]
    );
    res.json({ ok: true, message: 'Usuário admin criado. Login: admin, Senha: Luma110703' });
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    res.status(500).json({ error: 'Erro ao criar admin', detail: error.message });
  }
});

// POST /api/auth/login - autentica com login e senha (usa voluntarios_master = cadastro de usuários)
router.post('/login', async (req, res) => {
  try {
    const { login, senha } = req.body || {};
    if (!login || !senha) {
      return res.status(400).json({ error: 'Login e senha são obrigatórios' });
    }
    const loginVal = String(login).trim();
    const senhaVal = String(senha).trim();
    // Query mínima: só login e senha (evita erro se coluna ativo/nome_completo não existir)
    const result = await pool.query(
      'SELECT * FROM voluntarios_master WHERE login = $1 AND senha = $2',
      [loginVal, senhaVal]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Login ou senha inválidos' });
    }
    const row = result.rows[0];
    // Não bloquear se ativo for false (evita dependência da coluna)
    if (row.ativo === false || row.ativo === 0) {
      return res.status(401).json({ error: 'Usuário bloqueado. Contate o administrador.' });
    }
    const user = {
      id: row.id,
      nome: row.nome_completo || row.nome || row.login,
      login: row.login,
      perfil: row.status_vinculo || 'Usuário',
    };
    res.json({ ok: true, user });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao autenticar', detail: error.message });
  }
});

module.exports = router;

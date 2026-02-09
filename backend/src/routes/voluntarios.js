const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const voluntariosPeriodosRoutes = require('./voluntarios-periodos');

// Rotas de períodos (antes do /:id para não capturar "periodos" como id)
router.use('/:voluntarioId/periodos', voluntariosPeriodosRoutes);

// GET - Listar todos os voluntários (ordem por nome_completo ou nome)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM voluntarios_master ORDER BY COALESCE(nome_completo, nome, \'\')'
    );
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

// POST - Criar novo voluntário (aceita todos os campos do cadastro completo)
router.post('/', async (req, res) => {
  try {
    const {
      nome, nome_completo, telefone, whatsapp, email, login, senha, status_vinculo,
      cpf, data_nascimento, endereco_rua, endereco_numero, endereco_bairro,
      endereco_cidade, endereco_estado, endereco_cep
    } = req.body;
    const is_coordenador = status_vinculo === 'Coordenador';
    const nomeFinal = nome_completo || nome || '';
    const telefoneFinal = whatsapp || telefone || '';
    const result = await pool.query(
      `INSERT INTO voluntarios_master (
        nome, telefone, email, login, senha, is_coordenador, status_vinculo, ativo,
        nome_completo, whatsapp, cpf, data_nascimento, endereco_rua, endereco_numero,
        endereco_bairro, endereco_cidade, endereco_estado, endereco_cep
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [
        nomeFinal, telefoneFinal, email || null, login || null, senha || '123456', is_coordenador, status_vinculo || 'Voluntário',
        nomeFinal || null, telefoneFinal || null, cpf || null, data_nascimento || null, endereco_rua || null, endereco_numero || null,
        endereco_bairro || null, endereco_cidade || null, endereco_estado || null, endereco_cep || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar voluntário:', error);
    res.status(500).json({ error: 'Erro ao criar voluntário' });
  }
});

// PUT - Atualizar voluntário (todos os campos)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome, nome_completo, telefone, whatsapp, email, login, senha, status_vinculo, ativo,
      cpf, data_nascimento, endereco_rua, endereco_numero, endereco_bairro,
      endereco_cidade, endereco_estado, endereco_cep
    } = req.body;
    const is_coordenador = status_vinculo === 'Coordenador';
    const nomeFinal = nome_completo != null ? nome_completo : nome;
    const telefoneFinal = whatsapp != null ? whatsapp : telefone;
    const result = await pool.query(
      `UPDATE voluntarios_master SET
        nome=$1, telefone=$2, email=$3, login=$4, senha=$5, is_coordenador=$6, status_vinculo=$7, ativo=$8,
        nome_completo=$9, whatsapp=$10, cpf=$11, data_nascimento=$12, endereco_rua=$13, endereco_numero=$14,
        endereco_bairro=$15, endereco_cidade=$16, endereco_estado=$17, endereco_cep=$18
       WHERE id=$19 RETURNING *`,
      [
        nomeFinal ?? '', telefoneFinal ?? '', email ?? null, login ?? null, senha ?? null, is_coordenador, status_vinculo ?? 'Voluntário', ativo !== false,
        nomeFinal ?? null, telefoneFinal ?? null, cpf ?? null, data_nascimento || null, endereco_rua || null, endereco_numero || null,
        endereco_bairro || null, endereco_cidade || null, endereco_estado || null, endereco_cep || null, id
      ]
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

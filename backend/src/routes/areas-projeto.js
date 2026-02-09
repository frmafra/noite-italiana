const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const selectAreasWithCoordenador = `
  SELECT ap.*, p.nome as projeto_nome,
    v.nome as coordenador_nome, v.nome_completo as coordenador_nome_completo
  FROM areas_projeto ap
  LEFT JOIN projetos p ON ap.projeto_id = p.id
  LEFT JOIN voluntarios_master v ON ap.coordenador_id = v.id`;

// GET - Listar todas (com nome do projeto e coordenador)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `${selectAreasWithCoordenador} ORDER BY ap.projeto_id, ap.ordem, ap.nome`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar áreas:', error);
    res.status(500).json({ error: 'Erro ao listar áreas' });
  }
});

// GET - Listar por projeto (rota mais específica antes de /:id)
router.get('/projeto/:projetoId', async (req, res) => {
  try {
    const { projetoId } = req.params;
    const result = await pool.query(
      `${selectAreasWithCoordenador} WHERE ap.projeto_id = $1 ORDER BY ap.ordem, ap.nome`,
      [projetoId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar áreas do projeto:', error);
    res.status(500).json({ error: 'Erro ao listar áreas' });
  }
});

// GET - Buscar por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `${selectAreasWithCoordenador} WHERE ap.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Área não encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar área:', error);
    res.status(500).json({ error: 'Erro ao buscar área' });
  }
});

// POST - Criar
router.post('/', async (req, res) => {
  try {
    const { projeto_id, nome, descricao, ordem, ativo, coordenador_id } = req.body;
    if (!projeto_id || !nome || !String(nome).trim()) {
      return res.status(400).json({ error: 'projeto_id e nome são obrigatórios' });
    }
    const result = await pool.query(
      `INSERT INTO areas_projeto (projeto_id, nome, descricao, ordem, ativo, coordenador_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [projeto_id, String(nome).trim(), descricao || null, Number(ordem) || 0, ativo !== false, coordenador_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar área:', error);
    res.status(500).json({ error: 'Erro ao criar área' });
  }
});

// PUT - Atualizar ordem (rota específica)
router.put('/:id/ordem', async (req, res) => {
  try {
    const { id } = req.params;
    const { ordem } = req.body;
    const result = await pool.query(
      'UPDATE areas_projeto SET ordem = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [Number(ordem) || 0, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Área não encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar ordem:', error);
    res.status(500).json({ error: 'Erro ao atualizar ordem' });
  }
});

// PUT - Atualizar
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { projeto_id, nome, descricao, ordem, ativo, coordenador_id } = req.body;
    const result = await pool.query(
      `UPDATE areas_projeto SET
        projeto_id=$1, nome=$2, descricao=$3, ordem=$4, ativo=$5, coordenador_id=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [projeto_id, nome || '', descricao || null, Number(ordem) || 0, ativo !== false, coordenador_id || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Área não encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar área:', error);
    res.status(500).json({ error: 'Erro ao atualizar área' });
  }
});

// DELETE - Excluir
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM areas_projeto WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Área não encontrada' });
    res.json({ message: 'Área excluída com sucesso', area: result.rows[0] });
  } catch (error) {
    console.error('Erro ao excluir área:', error);
    res.status(500).json({ error: 'Erro ao excluir área' });
  }
});

module.exports = router;

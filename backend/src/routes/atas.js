const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET - Listar todas as atas (com nome do projeto)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, p.nome as projeto_nome
      FROM atas a
      LEFT JOIN projetos p ON a.projeto_id = p.id
      ORDER BY a.data_reuniao DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar atas:', err);
    res.status(500).json({ error: 'Erro ao listar atas' });
  }
});

// POST - Criar ata
router.post('/', async (req, res) => {
  try {
    const { titulo, conteudo, data_reuniao, projeto_id } = req.body;
    if (!titulo || !conteudo || !data_reuniao) {
      return res.status(400).json({ error: 'Título, conteúdo e data são obrigatórios' });
    }
    const result = await pool.query(
      `INSERT INTO atas (titulo, conteudo, data_reuniao, projeto_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [titulo, conteudo, data_reuniao, projeto_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar ata:', err);
    res.status(500).json({ error: 'Erro ao criar ata' });
  }
});

// PUT - Atualizar ata
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, conteudo, data_reuniao, projeto_id } = req.body;
    const result = await pool.query(
      `UPDATE atas SET titulo = $1, conteudo = $2, data_reuniao = $3, projeto_id = $4
       WHERE id = $5
       RETURNING *`,
      [titulo, conteudo, data_reuniao, projeto_id || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ata não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar ata:', err);
    res.status(500).json({ error: 'Erro ao atualizar ata' });
  }
});

// DELETE - Excluir ata
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM atas WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ata não encontrada' });
    res.json({ message: 'Ata excluída' });
  } catch (err) {
    console.error('Erro ao excluir ata:', err);
    res.status(500).json({ error: 'Erro ao excluir ata' });
  }
});

module.exports = router;

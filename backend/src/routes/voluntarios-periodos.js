const express = require('express');
const router = express.Router({ mergeParams: true });
const pool = require('../config/database');

// Listar períodos de um voluntário (mount: /:voluntarioId/periodos)
router.get('/', async (req, res) => {
  try {
    const voluntarioId = req.params.voluntarioId;
    const result = await pool.query(
      'SELECT * FROM voluntarios_periodos WHERE voluntario_id = $1 ORDER BY data_inicio DESC',
      [voluntarioId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar períodos:', error);
    res.status(500).json({ error: 'Erro ao buscar períodos' });
  }
});

// Adicionar período
router.post('/', async (req, res) => {
  try {
    const voluntarioId = req.params.voluntarioId;
    const { data_inicio, data_fim, funcao, observacoes } = req.body;

    const result = await pool.query(
      'INSERT INTO voluntarios_periodos (voluntario_id, data_inicio, data_fim, funcao, observacoes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [voluntarioId, data_inicio, data_fim || null, funcao || null, observacoes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar período:', error);
    res.status(500).json({ error: 'Erro ao adicionar período' });
  }
});

// Encerrar período (preencher data_fim com hoje) - rota mais específica primeiro
router.put('/:periodoId/encerrar', async (req, res) => {
  try {
    const { periodoId } = req.params;
    const result = await pool.query(
      'UPDATE voluntarios_periodos SET data_fim = CURRENT_DATE, updated_at = NOW() WHERE id = $1 RETURNING *',
      [periodoId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Período não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao encerrar período:', error);
    res.status(500).json({ error: 'Erro ao encerrar período' });
  }
});

// Atualizar período
router.put('/:periodoId', async (req, res) => {
  try {
    const { periodoId } = req.params;
    const { data_inicio, data_fim, funcao, observacoes } = req.body;

    const result = await pool.query(
      'UPDATE voluntarios_periodos SET data_inicio = $1, data_fim = $2, funcao = $3, observacoes = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [data_inicio, data_fim || null, funcao || null, observacoes || null, periodoId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Período não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar período:', error);
    res.status(500).json({ error: 'Erro ao atualizar período' });
  }
});

// Excluir período
router.delete('/:periodoId', async (req, res) => {
  try {
    const { periodoId } = req.params;
    const result = await pool.query('DELETE FROM voluntarios_periodos WHERE id = $1 RETURNING *', [periodoId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Período não encontrado' });
    }
    res.json({ message: 'Período excluído com sucesso', periodo: result.rows[0] });
  } catch (error) {
    console.error('Erro ao excluir período:', error);
    res.status(500).json({ error: 'Erro ao excluir período' });
  }
});

module.exports = router;

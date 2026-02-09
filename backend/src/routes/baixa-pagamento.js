const express = require('express');
const router = express.Router();
const pool = require('../config/database');
router.put('/:id', async (req, res) => {
  try {
    const result = await pool.query("UPDATE financeiro SET status='Pago' WHERE id=$1 AND tipo='Despesa' RETURNING *", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Conta não encontrada' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao dar baixa' });
  }
});
module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
router.put('/:id', async (req, res) => {
  try {
    const r = await pool.query("UPDATE financeiro SET status='Pago' WHERE id=$1 RETURNING *", [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'NF não encontrada' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao dar baixa na NF' });
  }
});
module.exports = router;

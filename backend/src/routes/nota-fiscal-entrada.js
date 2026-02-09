const express = require('express');
const router = express.Router();
const pool = require('../config/database');
router.get('/:pedido_id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM financeiro WHERE pedido_id=$1', [req.params.pedido_id]);
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar NF' });
  }
});
router.post('/', async (req, res) => {
  try {
    const { descricao, valor, data_vencimento, pedido_id, projeto_id, banco_id, categoria } = req.body;
    const r = await pool.query("INSERT INTO financeiro (descricao,tipo,valor,data_vencimento,status,pedido_id,projeto_id,banco_id,categoria) VALUES ($1,'Despesa',$2,$3,'Pendente',$4,$5,$6,$7) RETURNING *", [descricao, valor, data_vencimento, pedido_id, projeto_id, banco_id, categoria]);
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao criar NF' });
  }
});
module.exports = router;

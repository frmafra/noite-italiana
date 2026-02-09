const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bancos ORDER BY nome_banco");
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

router.post("/", async (req, res) => {
  try {
    const { nome_banco, agencia, conta, saldo_inicial } = req.body;
    const result = await pool.query("INSERT INTO bancos (nome_banco, agencia, conta, saldo_inicial) VALUES ($1, $2, $3, $4) RETURNING *", [nome_banco, agencia, conta, saldo_inicial || 0]);
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

module.exports = router;

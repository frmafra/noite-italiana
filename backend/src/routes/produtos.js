const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produtos_base ORDER BY nome");
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

router.post("/", async (req, res) => {
  try {
    const { nome, categoria, unidade, preco_medio, tipo } = req.body;
    const result = await pool.query("INSERT INTO produtos_base (nome, categoria, unidade, preco_medio, tipo) VALUES ($1, $2, $3, $4, $5) RETURNING *", [nome, categoria, unidade, preco_medio || 0, tipo || "Produto"]);
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: "Erro" }); }
});

module.exports = router;

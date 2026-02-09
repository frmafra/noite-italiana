const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// GET - Listar produtos base (com filtros opcionais: categoria, ativo, busca)
router.get("/", async (req, res) => {
  try {
    const { categoria, ativo, busca } = req.query;
    let sql = "SELECT * FROM produtos_base WHERE 1=1";
    const params = [];
    let i = 1;
    if (categoria) { sql += ` AND categoria = $${i}`; params.push(categoria); i++; }
    if (ativo !== undefined && ativo !== '') { sql += ` AND ativo = $${i}`; params.push(ativo === 'true'); i++; }
    if (busca && busca.trim()) { sql += ` AND (nome ILIKE $${i} OR codigo_interno ILIKE $${i})`; params.push(`%${busca.trim()}%`); i++; }
    sql += " ORDER BY nome";
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar produtos base:", error);
    res.status(500).json({ error: "Erro ao listar produtos base" });
  }
});

// GET - Buscar por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM produtos_base WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Produto não encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({ error: "Erro ao buscar produto" });
  }
});

// POST - Criar
router.post("/", async (req, res) => {
  try {
    const { nome, categoria, unidade, preco_medio, tipo, fornecedor, descricao, codigo_interno, ativo } = req.body;
    const result = await pool.query(
      `INSERT INTO produtos_base (nome, categoria, unidade, preco_medio, tipo, fornecedor, descricao, codigo_interno, ativo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        nome || '', categoria || null, unidade || null, Number(preco_medio) || 0,
        tipo || 'Produto', fornecedor || null, descricao || null, codigo_interno || null,
        ativo !== false
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ error: "Erro ao criar produto" });
  }
});

// PUT - Atualizar
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, categoria, unidade, preco_medio, tipo, fornecedor, descricao, codigo_interno, ativo } = req.body;
    const result = await pool.query(
      `UPDATE produtos_base SET
        nome=$1, categoria=$2, unidade=$3, preco_medio=$4, tipo=$5,
        fornecedor=$6, descricao=$7, codigo_interno=$8, ativo=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [
        nome || '', categoria || null, unidade || null, Number(preco_medio) || 0,
        tipo || 'Produto', fornecedor || null, descricao || null, codigo_interno || null,
        ativo !== false, id
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Produto não encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});

// DELETE - Excluir
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM produtos_base WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Produto não encontrado" });
    res.json({ message: "Produto excluído com sucesso", produto: result.rows[0] });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    res.status(500).json({ error: "Erro ao excluir produto" });
  }
});

module.exports = router;

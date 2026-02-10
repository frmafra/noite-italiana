const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const gerarNumero = async () => {
  const ano = new Date().getFullYear();
  const result = await pool.query(
    `SELECT numero FROM solicitacoes_compra 
     WHERE numero LIKE 'SC-' || $1 || '-%' 
     ORDER BY numero DESC LIMIT 1`,
    [ano]
  );
  const proximo = result.rows[0]
    ? parseInt(result.rows[0].numero.split('-')[2], 10) + 1
    : 1;
  return `SC-${ano}-${String(proximo).padStart(3, '0')}`;
};

router.get('/', async (req, res) => {
  try {
    const { projeto_id, status } = req.query;
    let query = `
      SELECT 
        s.*,
        p.nome as projeto_nome,
        v.nome as requisitante_nome,
        v.nome_completo as requisitante_nome_completo,
        a.nome as area_nome
      FROM solicitacoes_compra s
      LEFT JOIN projetos p ON s.projeto_id = p.id
      LEFT JOIN voluntarios_master v ON s.requisitante_id = v.id
      LEFT JOIN areas_projeto a ON s.area_projeto_id = a.id
      WHERE 1=1
    `;
    const params = [];
    if (projeto_id) {
      params.push(projeto_id);
      query += ` AND s.projeto_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND s.status = $${params.length}`;
    }
    query += ' ORDER BY s.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar solicitações:', error);
    res.status(500).json({ error: 'Erro ao listar solicitações' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const solicitacao = await pool.query(
      `SELECT 
        s.*,
        p.nome as projeto_nome,
        v.nome as requisitante_nome,
        v.nome_completo as requisitante_nome_completo,
        a.nome as area_nome
      FROM solicitacoes_compra s
      LEFT JOIN projetos p ON s.projeto_id = p.id
      LEFT JOIN voluntarios_master v ON s.requisitante_id = v.id
      LEFT JOIN areas_projeto a ON s.area_projeto_id = a.id
      WHERE s.id = $1`,
      [id]
    );
    if (solicitacao.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }
    const itens = await pool.query(
      `SELECT 
        si.*,
        pb.nome as produto_nome
      FROM solicitacoes_itens si
      LEFT JOIN produtos_base pb ON si.produto_base_id = pb.id
      WHERE si.solicitacao_id = $1
      ORDER BY si.id`,
      [id]
    );
    res.json({
      ...solicitacao.rows[0],
      itens: itens.rows
    });
  } catch (error) {
    console.error('Erro ao buscar solicitação:', error);
    res.status(500).json({ error: 'Erro ao buscar solicitação' });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      projeto_id,
      area_projeto_id,
      requisitante_id,
      data_solicitacao,
      justificativa,
      status,
      itens
    } = req.body;

    if (!projeto_id || !requisitante_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Projeto e requisitante são obrigatórios' });
    }
    if (!itens || itens.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Adicione pelo menos um item' });
    }

    const numero = await gerarNumero();
    const valor_total = itens.reduce((sum, item) =>
      sum + (parseFloat(item.quantidade) * parseFloat(item.preco_estimado || 0)), 0);

    const solicitacao = await client.query(
      `INSERT INTO solicitacoes_compra (
        numero, projeto_id, area_projeto_id, requisitante_id,
        data_solicitacao, justificativa, status, valor_total
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        numero,
        projeto_id,
        area_projeto_id || null,
        requisitante_id,
        data_solicitacao || new Date(),
        justificativa || null,
        status || 'rascunho',
        Math.round(valor_total * 100) / 100
      ]
    );
    const solicitacao_id = solicitacao.rows[0].id;

    for (const item of itens) {
      const valor_linha = parseFloat(item.quantidade) * parseFloat(item.preco_estimado || 0);
      await client.query(
        `INSERT INTO solicitacoes_itens (
          solicitacao_id, produto_base_id, descricao,
          quantidade, unidade, preco_estimado, valor_total, observacoes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          solicitacao_id,
          item.produto_base_id,
          item.descricao || null,
          item.quantidade,
          item.unidade || null,
          item.preco_estimado || 0,
          Math.round(valor_linha * 100) / 100,
          item.observacoes || null
        ]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(solicitacao.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar solicitação:', error);
    res.status(500).json({ error: 'Erro ao criar solicitação: ' + (error.message || '') });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const {
      projeto_id,
      area_projeto_id,
      requisitante_id,
      data_solicitacao,
      justificativa,
      status,
      itens
    } = req.body;

    if (!itens || itens.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Adicione pelo menos um item' });
    }

    const valor_total = itens.reduce((sum, item) =>
      sum + (parseFloat(item.quantidade) * parseFloat(item.preco_estimado || 0)), 0);

    const solicitacao = await client.query(
      `UPDATE solicitacoes_compra SET
        projeto_id = $1,
        area_projeto_id = $2,
        requisitante_id = $3,
        data_solicitacao = $4,
        justificativa = $5,
        status = $6,
        valor_total = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING *`,
      [
        projeto_id,
        area_projeto_id || null,
        requisitante_id,
        data_solicitacao,
        justificativa,
        status,
        Math.round(valor_total * 100) / 100,
        id
      ]
    );

    if (solicitacao.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    await client.query('DELETE FROM solicitacoes_itens WHERE solicitacao_id = $1', [id]);

    for (const item of itens) {
      const valor_linha = parseFloat(item.quantidade) * parseFloat(item.preco_estimado || 0);
      await client.query(
        `INSERT INTO solicitacoes_itens (
          solicitacao_id, produto_base_id, descricao,
          quantidade, unidade, preco_estimado, valor_total, observacoes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id,
          item.produto_base_id,
          item.descricao || null,
          item.quantidade,
          item.unidade || null,
          item.preco_estimado || 0,
          Math.round(valor_linha * 100) / 100,
          item.observacoes || null
        ]
      );
    }

    await client.query('COMMIT');
    res.json(solicitacao.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar solicitação:', error);
    res.status(500).json({ error: 'Erro ao atualizar solicitação: ' + (error.message || '') });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cotacoes = await pool.query(
      'SELECT id FROM cotacoes WHERE solicitacao_id = $1 LIMIT 1',
      [id]
    );
    if (cotacoes.rows.length > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir. Existem cotações vinculadas a esta solicitação.'
      });
    }
    await pool.query('DELETE FROM solicitacoes_compra WHERE id = $1', [id]);
    res.json({ message: 'Solicitação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir solicitação:', error);
    res.status(500).json({ error: 'Erro ao excluir solicitação' });
  }
});

router.post('/:id/copiar-cotacao', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { fornecedor_id } = req.body;

    if (!fornecedor_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Fornecedor é obrigatório' });
    }

    const solicitacao = await client.query(
      'SELECT * FROM solicitacoes_compra WHERE id = $1',
      [id]
    );
    if (solicitacao.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    const itens = await client.query(
      'SELECT * FROM solicitacoes_itens WHERE solicitacao_id = $1',
      [id]
    );

    const ano = new Date().getFullYear();
    const lastCot = await client.query(
      `SELECT numero FROM cotacoes 
       WHERE numero LIKE 'COT-' || $1 || '-%' 
       ORDER BY numero DESC LIMIT 1`,
      [ano]
    );
    const proximo = lastCot.rows[0]
      ? parseInt(lastCot.rows[0].numero.split('-')[2], 10) + 1
      : 1;
    const numero = `COT-${ano}-${String(proximo).padStart(3, '0')}`;

    const cotacao = await client.query(
      `INSERT INTO cotacoes (
        numero, solicitacao_id, fornecedor_id, data_cotacao, status, valor_total, valor_unitario
      ) VALUES ($1, $2, $3, $4, $5, $6, 0)
      RETURNING *`,
      [numero, id, fornecedor_id, new Date(), 'em_analise', 0]
    );
    const cotacao_id = cotacao.rows[0].id;

    for (const item of itens.rows) {
      await client.query(
        `INSERT INTO cotacoes_itens (
          cotacao_id, solicitacao_item_id, produto_base_id, descricao,
          quantidade, unidade, preco_unitario, valor_total
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          cotacao_id,
          item.id,
          item.produto_base_id,
          item.descricao,
          item.quantidade,
          item.unidade,
          0,
          0
        ]
      );
    }

    await client.query(
      `UPDATE solicitacoes_compra SET status = 'em_cotacao', updated_at = NOW() WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');
    res.status(201).json(cotacao.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao copiar para cotação:', error);
    res.status(500).json({ error: 'Erro ao copiar para cotação: ' + (error.message || '') });
  } finally {
    client.release();
  }
});

module.exports = router;

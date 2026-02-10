const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /dashboard - Resumo financeiro (contas_pagar)
router.get('/dashboard', async (req, res) => {
  try {
    const hoje = new Date().toISOString().slice(0, 10);
    const daqui7 = new Date();
    daqui7.setDate(daqui7.getDate() + 7);
    const daqui7Str = daqui7.toISOString().slice(0, 10);
    const inicioMes = new Date();
    inicioMes.setDate(1);
    const inicioMesStr = inicioMes.toISOString().slice(0, 10);
    const fimMes = new Date(inicioMes.getFullYear(), inicioMes.getMonth() + 1, 0).toISOString().slice(0, 10);

    const [aberto, vencidas, aVencer, pagasMes] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(valor - COALESCE(valor_pago, 0)), 0) as total
         FROM contas_pagar WHERE status IN ('aberto', 'parcial')`
      ),
      pool.query(
        `SELECT COALESCE(SUM(valor - COALESCE(valor_pago, 0)), 0) as total
         FROM contas_pagar WHERE status IN ('aberto', 'parcial') AND data_vencimento < $1`,
        [hoje]
      ),
      pool.query(
        `SELECT COALESCE(SUM(valor - COALESCE(valor_pago, 0)), 0) as total
         FROM contas_pagar WHERE status IN ('aberto', 'parcial') AND data_vencimento BETWEEN $1 AND $2`,
        [hoje, daqui7Str]
      ),
      pool.query(
        `SELECT COALESCE(SUM(p.valor_pago), 0) as total
         FROM pagamentos p
         JOIN contas_pagar c ON p.conta_pagar_id = c.id
         WHERE c.status = 'pago' AND p.data_pagamento BETWEEN $1 AND $2`,
        [inicioMesStr, fimMes]
      )
    ]);

    res.json({
      total_aberto: parseFloat(aberto.rows[0]?.total || 0),
      total_vencidas: parseFloat(vencidas.rows[0]?.total || 0),
      total_a_vencer_7d: parseFloat(aVencer.rows[0]?.total || 0),
      total_pagas_mes: parseFloat(pagasMes.rows[0]?.total || 0)
    });
  } catch (error) {
    console.error('Erro no dashboard contas a pagar:', error);
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
});

// GET / - Listar contas_pagar com filtros
router.get('/', async (req, res) => {
  try {
    const { status, fornecedor_id, vencimento_de, vencimento_ate } = req.query;
    let query = `
      SELECT 
        c.*,
        COALESCE(par.razao_social, par.nome) as fornecedor_nome
      FROM contas_pagar c
      LEFT JOIN parceiros par ON c.fornecedor_id = par.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }
    if (fornecedor_id) {
      params.push(fornecedor_id);
      query += ` AND c.fornecedor_id = $${params.length}`;
    }
    if (vencimento_de) {
      params.push(vencimento_de);
      query += ` AND c.data_vencimento >= $${params.length}`;
    }
    if (vencimento_ate) {
      params.push(vencimento_ate);
      query += ` AND c.data_vencimento <= $${params.length}`;
    }
    query += ' ORDER BY c.data_vencimento ASC, c.id ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar contas a pagar:', error);
    res.status(500).json({ error: 'Erro ao listar contas a pagar' });
  }
});

// GET /:id - Buscar uma conta
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        c.*,
        COALESCE(par.razao_social, par.nome) as fornecedor_nome,
        par.telefone as fornecedor_telefone,
        par.email as fornecedor_email
      FROM contas_pagar c
      LEFT JOIN parceiros par ON c.fornecedor_id = par.id
      WHERE c.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    const pagamentos = await pool.query(
      'SELECT * FROM pagamentos WHERE conta_pagar_id = $1 ORDER BY data_pagamento DESC',
      [id]
    );
    res.json({
      ...result.rows[0],
      pagamentos: pagamentos.rows
    });
  } catch (error) {
    console.error('Erro ao buscar conta:', error);
    res.status(500).json({ error: 'Erro ao buscar conta' });
  }
});

// POST /:id/pagar - Registrar pagamento (com conta bancária e movimentação)
router.post('/:id/pagar', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { data_pagamento, valor_pago, forma_pagamento, observacoes, conta_bancaria_id } = req.body;

    if (!data_pagamento || valor_pago == null || valor_pago === '') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Data e valor são obrigatórios' });
    }
    if (!conta_bancaria_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Selecione a conta bancária' });
    }

    const conta = await client.query('SELECT * FROM contas_pagar WHERE id = $1', [id]);
    if (conta.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    const row = conta.rows[0];
    const valorTotal = parseFloat(row.valor);
    const valorPagoAtual = parseFloat(row.valor_pago || 0);
    const valorPagoNovo = parseFloat(valor_pago);
    const novoTotalPago = valorPagoAtual + valorPagoNovo;
    const novoStatus = novoTotalPago >= valorTotal ? 'pago' : 'parcial';

    const descricao = (row.numero_documento && String(row.numero_documento).trim())
      ? `Pagamento conta #${id} - ${String(row.numero_documento).trim()}`
      : `Pagamento conta a pagar #${id}`;
    const dataPag = data_pagamento instanceof Date ? data_pagamento.toISOString().slice(0, 10) : (data_pagamento || new Date().toISOString().slice(0, 10));

    const insPag = await client.query(
      `INSERT INTO pagamentos (conta_pagar_id, descricao, valor_previsto, data_pagamento, valor_pago, forma_pagamento, observacoes, conta_bancaria_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pago')
       RETURNING id`,
      [id, descricao, valorPagoNovo, dataPag, valorPagoNovo, forma_pagamento || null, observacoes || null, conta_bancaria_id]
    );
    const pagamentoId = insPag.rows[0]?.id;

    const contaBancaria = await client.query(
      'SELECT saldo_atual FROM contas_bancarias WHERE id = $1',
      [conta_bancaria_id]
    );
    if (contaBancaria.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Conta bancária não encontrada' });
    }
    const saldoAnterior = parseFloat(contaBancaria.rows[0].saldo_atual || 0);

    await client.query(
      `INSERT INTO movimentacoes_bancarias (conta_bancaria_id, tipo, data, descricao, valor, categoria, conta_pagar_id, pagamento_id, saldo_anterior)
       VALUES ($1, 'saida', $2, $3, $4, 'pagamento_fornecedor', $5, $6, $7)`,
      [conta_bancaria_id, dataPag, descricao, valorPagoNovo, id, pagamentoId, saldoAnterior]
    );

    await client.query(
      `UPDATE contas_pagar SET valor_pago = $1, status = $2, updated_at = NOW() WHERE id = $3`,
      [novoTotalPago, novoStatus, id]
    );

    await client.query('COMMIT');
    const atualizado = await pool.query('SELECT * FROM contas_pagar WHERE id = $1', [id]);
    res.status(201).json(atualizado.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao registrar pagamento:', error);
    res.status(500).json({ error: 'Erro ao registrar pagamento: ' + (error.message || '') });
  } finally {
    client.release();
  }
});

module.exports = router;

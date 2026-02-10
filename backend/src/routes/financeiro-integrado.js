/**
 * API híbrida: lista unificada de pagamentos (financeiro) + contas_pagar (compras)
 * para a aba PAGAMENTOS do /financeiro.
 */
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET - Listar pagamentos (financeiro) + contas a pagar (compras) em uma única lista
router.get('/pagamentos-todos', async (req, res) => {
  try {
    const { data_inicio, data_fim, projeto_id } = req.query;

    let queryPagamentos = `
      SELECT 
        'financeiro' as origem,
        id,
        data_prevista as data,
        descricao,
        valor_previsto as valor,
        COALESCE(valor_pago, 0) as valor_pago,
        CASE WHEN status = 'Pago' THEN true ELSE false END as conciliado,
        projeto_id,
        fornecedor,
        NULL as documento,
        data_prevista as data_vencimento
      FROM pagamentos
      WHERE conta_pagar_id IS NULL
    `;
    const paramsPag = [];
    if (data_inicio) {
      paramsPag.push(data_inicio);
      queryPagamentos += ` AND data_prevista >= $${paramsPag.length}`;
    }
    if (data_fim) {
      paramsPag.push(data_fim);
      queryPagamentos += ` AND data_prevista <= $${paramsPag.length}`;
    }
    if (projeto_id) {
      paramsPag.push(projeto_id);
      queryPagamentos += ` AND projeto_id = $${paramsPag.length}`;
    }
    queryPagamentos += ' ORDER BY data_prevista DESC NULLS LAST';
    const pagamentos = await pool.query(queryPagamentos, paramsPag);

    let queryContas = `
      SELECT 
        'compras' as origem,
        cp.id,
        cp.data_emissao as data,
        cp.numero_documento as descricao,
        cp.valor,
        COALESCE(cp.valor_pago, 0) as valor_pago,
        CASE WHEN cp.status = 'pago' THEN true ELSE false END as conciliado,
        NULL as projeto_id,
        COALESCE(par.razao_social, par.nome) as fornecedor,
        cp.numero_documento as documento,
        cp.data_vencimento
      FROM contas_pagar cp
      LEFT JOIN parceiros par ON cp.fornecedor_id = par.id
      WHERE 1=1
    `;
    const paramsContas = [];
    if (data_inicio) {
      paramsContas.push(data_inicio);
      queryContas += ` AND cp.data_vencimento >= $${paramsContas.length}`;
    }
    if (data_fim) {
      paramsContas.push(data_fim);
      queryContas += ` AND cp.data_vencimento <= $${paramsContas.length}`;
    }
    queryContas += ' ORDER BY cp.data_vencimento DESC NULLS LAST';
    const contas = await pool.query(queryContas, paramsContas);

    const todos = [
      ...pagamentos.rows.map(r => ({ ...r, data_vencimento: r.data_vencimento ? String(r.data_vencimento).slice(0, 10) : null, data: r.data ? String(r.data).slice(0, 10) : null })),
      ...contas.rows.map(r => ({ ...r, data_vencimento: r.data_vencimento ? String(r.data_vencimento).slice(0, 10) : null, data: r.data ? String(r.data).slice(0, 10) : null }))
    ].sort((a, b) => {
      const da = new Date(a.data_vencimento || a.data || 0).getTime();
      const db = new Date(b.data_vencimento || b.data || 0).getTime();
      return db - da;
    });

    res.json(todos);
  } catch (error) {
    console.error('Erro ao listar pagamentos integrados:', error);
    res.status(500).json({ error: 'Erro ao listar pagamentos: ' + (error.message || '') });
  }
});

// GET - Dashboard integrado (totais financeiro + compras)
router.get('/dashboard-integrado', async (req, res) => {
  try {
    const dashFinanceiro = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status IS NULL OR status != 'Pago' THEN COALESCE(valor_previsto, 0) - COALESCE(valor_pago, 0) ELSE 0 END), 0) as pendente_financeiro,
        COALESCE(SUM(CASE WHEN status = 'Pago' THEN COALESCE(valor_pago, valor_previsto) ELSE 0 END), 0) as pago_financeiro,
        COUNT(CASE WHEN status IS NULL OR status != 'Pago' THEN 1 END) as qtd_pendente_financeiro
      FROM pagamentos
      WHERE conta_pagar_id IS NULL
    `);

    const dashCompras = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status IN ('aberto', 'parcial') THEN valor - COALESCE(valor_pago, 0) ELSE 0 END), 0) as pendente_compras,
        COALESCE(SUM(CASE WHEN status = 'pago' THEN COALESCE(valor_pago, valor) ELSE 0 END), 0) as pago_compras,
        COUNT(CASE WHEN status IN ('aberto', 'parcial') THEN 1 END) as qtd_pendente_compras
      FROM contas_pagar
    `);

    const fin = dashFinanceiro.rows[0] || {};
    const comp = dashCompras.rows[0] || {};

    res.json({
      total_pendente: parseFloat(fin.pendente_financeiro || 0) + parseFloat(comp.pendente_compras || 0),
      total_pago: parseFloat(fin.pago_financeiro || 0) + parseFloat(comp.pago_compras || 0),
      qtd_pendente: parseInt(fin.qtd_pendente_financeiro || 0, 10) + parseInt(comp.qtd_pendente_compras || 0, 10),
      financeiro: {
        pendente: parseFloat(fin.pendente_financeiro || 0),
        pago: parseFloat(fin.pago_financeiro || 0),
        qtd: parseInt(fin.qtd_pendente_financeiro || 0, 10)
      },
      compras: {
        pendente: parseFloat(comp.pendente_compras || 0),
        pago: parseFloat(comp.pago_compras || 0),
        qtd: parseInt(comp.qtd_pendente_compras || 0, 10)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard integrado:', error);
    res.status(500).json({ error: 'Erro ao buscar dashboard' });
  }
});

module.exports = router;

/**
 * API unificada: Contas a Pagar do sistema Compras (contas_pagar) + Financeiro antigo (pagamentos).
 */
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET - Dashboard consolidado (soma dos dois sistemas)
router.get('/dashboard-consolidado', async (req, res) => {
  try {
    const dashboardComprasSimples = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status IN ('aberto', 'parcial') THEN valor - COALESCE(valor_pago, 0) ELSE 0 END), 0) as total_aberto_compras,
        COALESCE(SUM(CASE WHEN status IN ('aberto', 'parcial') AND data_vencimento < CURRENT_DATE THEN valor - COALESCE(valor_pago, 0) ELSE 0 END), 0) as total_vencidas_compras,
        COALESCE(SUM(CASE WHEN status IN ('aberto', 'parcial') AND data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN valor - COALESCE(valor_pago, 0) ELSE 0 END), 0) as total_a_vencer_7d_compras,
        COALESCE(SUM(CASE WHEN status = 'pago' THEN COALESCE(valor_pago, valor) ELSE 0 END), 0) as total_pagas_compras
      FROM contas_pagar
    `);

    const dashboardFinanceiro = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status IS NULL OR status != 'Pago' THEN COALESCE(valor_previsto, 0) - COALESCE(valor_pago, 0) ELSE 0 END), 0) as total_aberto_financeiro,
        COUNT(CASE WHEN status IS NULL OR status != 'Pago' THEN 1 END) as qtd_pendentes_financeiro,
        COALESCE(SUM(CASE WHEN status = 'Pago' THEN COALESCE(valor_pago, valor_previsto) ELSE 0 END), 0) as total_pago_financeiro
      FROM pagamentos
      WHERE conta_pagar_id IS NULL
    `);

    const compras = (dashboardComprasSimples.rows[0]) || {};
    const financeiro = (dashboardFinanceiro.rows[0]) || {};

    const totalAbiertoCompras = parseFloat(compras.total_aberto_compras || 0);
    const totalVencidasCompras = parseFloat(compras.total_vencidas_compras || 0);
    const totalAVencerCompras = parseFloat(compras.total_a_vencer_7d_compras || 0);
    const totalPagasCompras = parseFloat(compras.total_pagas_compras || 0);
    const totalAbiertoFin = parseFloat(financeiro.total_aberto_financeiro || 0);
    const qtdPendentesFin = parseInt(financeiro.qtd_pendentes_financeiro || 0, 10);
    const totalPagoFin = parseFloat(financeiro.total_pago_financeiro || 0);

    res.json({
      total_aberto: totalAbiertoCompras + totalAbiertoFin,
      total_vencidas: totalVencidasCompras,
      total_a_vencer_7d: totalAVencerCompras,
      total_pagas_mes: totalPagasCompras + totalPagoFin,
      compras: {
        total_aberto: totalAbiertoCompras,
        total_vencidas: totalVencidasCompras,
        total_a_vencer_7d: totalAVencerCompras,
        total_pagas_mes: totalPagasCompras
      },
      financeiro: {
        total_aberto: totalAbiertoFin,
        qtd_pendentes: qtdPendentesFin,
        total_pago: totalPagoFin
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard consolidado:', error);
    res.status(500).json({
      error: 'Erro ao buscar dashboard consolidado',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET - Listar todas as contas (dos dois sistemas)
router.get('/contas-todas', async (req, res) => {
  try {
    const { status, fornecedor_id } = req.query;

    let queryCompras = `
      SELECT 
        'compras' as origem,
        cp.id,
        cp.numero_documento,
        COALESCE(par.razao_social, par.nome) as fornecedor,
        cp.data_emissao,
        cp.data_vencimento,
        cp.valor,
        cp.valor_pago,
        cp.status,
        cp.observacoes
      FROM contas_pagar cp
      LEFT JOIN parceiros par ON cp.fornecedor_id = par.id
      WHERE 1=1
    `;
    const paramsCompras = [];
    if (status) {
      paramsCompras.push(status);
      queryCompras += ` AND cp.status = $${paramsCompras.length}`;
    }
    if (fornecedor_id) {
      paramsCompras.push(fornecedor_id);
      queryCompras += ` AND cp.fornecedor_id = $${paramsCompras.length}`;
    }
    queryCompras += ' ORDER BY cp.data_vencimento DESC NULLS LAST';

    const contasCompras = await pool.query(queryCompras, paramsCompras);

    const queryFinanceiro = `
      SELECT 
        'financeiro' as origem,
        id,
        descricao as numero_documento,
        fornecedor,
        data_prevista as data_emissao,
        data_prevista as data_vencimento,
        valor_previsto as valor,
        COALESCE(valor_pago, 0) as valor_pago,
        CASE WHEN status = 'Pago' THEN 'pago' ELSE 'aberto' END as status,
        observacoes
      FROM pagamentos
      WHERE conta_pagar_id IS NULL
      ORDER BY data_prevista DESC NULLS LAST
    `;
    const contasFinanceiro = await pool.query(queryFinanceiro);

    const todasContas = [
      ...contasCompras.rows.map(r => ({ ...r, data_vencimento: r.data_vencimento ? String(r.data_vencimento).slice(0, 10) : null })),
      ...contasFinanceiro.rows.map(r => ({ ...r, data_vencimento: r.data_vencimento ? String(r.data_vencimento).slice(0, 10) : null }))
    ].sort((a, b) => {
      const da = a.data_vencimento ? new Date(a.data_vencimento).getTime() : 0;
      const db = b.data_vencimento ? new Date(b.data_vencimento).getTime() : 0;
      return db - da;
    });

    res.json(todasContas);
  } catch (error) {
    console.error('Erro ao listar contas consolidadas:', error);
    res.status(500).json({
      error: 'Erro ao listar contas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

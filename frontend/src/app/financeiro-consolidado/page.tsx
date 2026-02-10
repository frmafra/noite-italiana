'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://213.199.51.121:4001').replace(/\/api\/?$/, '');

interface DashboardData {
  total_aberto: number;
  total_vencidas: number;
  total_a_vencer_7d: number;
  total_pagas_mes: number;
  compras: {
    total_aberto: number;
    total_vencidas: number;
    total_a_vencer_7d: number;
    total_pagas_mes: number;
  };
  financeiro: {
    total_aberto: number;
    qtd_pendentes: number;
    total_pago: number;
  };
}

interface Conta {
  origem: string;
  id: number;
  numero_documento: string;
  fornecedor: string;
  data_emissao: string;
  data_vencimento: string;
  valor: number;
  valor_pago: number;
  status: string;
}

export default function FinanceiroConsolidado() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro('');
      const base = API_BASE ? `${API_BASE}${API_BASE.endsWith('api') ? '' : '/api'}` : '/api';
      const resDash = await fetch(`${base}/financeiro-consolidado/dashboard-consolidado`);
      if (!resDash.ok) throw new Error('Erro ao carregar dashboard');
      const dataDash = await resDash.json();
      setDashboard(dataDash);

      const resContas = await fetch(`${base}/financeiro-consolidado/contas-todas`);
      if (!resContas.ok) throw new Error('Erro ao carregar contas');
      const dataContas = await resContas.json();
      setContas(Array.isArray(dataContas) ? dataContas : []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setErro(error?.message || 'Erro ao carregar dados. Tente novamente.');
      setDashboard(null);
      setContas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; label: string }> = {
      aberto: { bg: '#6c757d', label: 'Aberto' },
      parcial: { bg: '#ffc107', label: 'Parcial' },
      pago: { bg: '#28a745', label: 'Pago' },
      vencido: { bg: '#dc3545', label: 'Vencido' }
    };
    const badge = badges[status] || badges.aberto;
    return (
      <span style={{
        background: badge.bg,
        color: 'white',
        padding: '4px 10px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 500
      }}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
        Carregando...
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto', fontFamily: 'sans-serif' }}>
      {erro && (
        <div style={{
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24',
          padding: 16,
          borderRadius: 4,
          marginBottom: 16
        }}>
          {erro}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/portal" style={{ color: '#005daa', textDecoration: 'none', fontSize: 14 }}>
            ← Portal
          </Link>
          <h1 style={{ margin: '8px 0 0 0', fontSize: 32, fontWeight: 'bold' }}>
            💰 Financeiro Consolidado
          </h1>
          <p style={{ color: '#666', margin: '4px 0 0 0' }}>
            Visão unificada de Compras e Financeiro
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/financeiro-consolidado" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#17a2b8',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 500
            }}>
              💰 Consolidado
            </button>
          </Link>
          <Link href="/financeiro" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#6f42c1',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 500
            }}>
              📊 Ver Financeiro
            </button>
          </Link>
          <Link href="/compras" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#005daa',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 500
            }}>
              🛒 Ver Compras
            </button>
          </Link>
        </div>
      </div>

      {dashboard && (
        <>
          <h2 style={{ fontSize: 20, marginBottom: 16, fontWeight: 600 }}>📈 Resumo Geral</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 16,
            marginBottom: 32
          }}>
            <div style={{
              background: 'white',
              padding: 20,
              borderRadius: 8,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '2px solid #6c757d'
            }}>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Total em Aberto</div>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#6c757d' }}>
                {formatarMoeda(dashboard.total_aberto)}
              </div>
            </div>
            <div style={{
              background: 'white',
              padding: 20,
              borderRadius: 8,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '2px solid #dc3545'
            }}>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Vencidas</div>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#dc3545' }}>
                {formatarMoeda(dashboard.total_vencidas)}
              </div>
            </div>
            <div style={{
              background: 'white',
              padding: 20,
              borderRadius: 8,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '2px solid #fd7e14'
            }}>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>A Vencer (7 dias)</div>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fd7e14' }}>
                {formatarMoeda(dashboard.total_a_vencer_7d)}
              </div>
            </div>
            <div style={{
              background: 'white',
              padding: 20,
              borderRadius: 8,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '2px solid #28a745'
            }}>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Pagas no Mês</div>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#28a745' }}>
                {formatarMoeda(dashboard.total_pagas_mes)}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
            <div style={{
              background: '#f8f9fa',
              padding: 20,
              borderRadius: 8,
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{ fontSize: 18, marginBottom: 16, color: '#005daa' }}>🛒 Sistema de Compras</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Em aberto:</span><strong>{formatarMoeda(dashboard.compras.total_aberto)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Vencidas:</span><strong style={{ color: '#dc3545' }}>{formatarMoeda(dashboard.compras.total_vencidas)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>A vencer (7d):</span><strong style={{ color: '#fd7e14' }}>{formatarMoeda(dashboard.compras.total_a_vencer_7d)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pagas no mês:</span><strong style={{ color: '#28a745' }}>{formatarMoeda(dashboard.compras.total_pagas_mes)}</strong></div>
              </div>
            </div>
            <div style={{
              background: '#f8f9fa',
              padding: 20,
              borderRadius: 8,
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{ fontSize: 18, marginBottom: 16, color: '#6f42c1' }}>📊 Sistema Financeiro</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Em aberto:</span><strong>{formatarMoeda(dashboard.financeiro.total_aberto)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pendentes:</span><strong>{dashboard.financeiro.qtd_pendentes} contas</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pago no mês:</span><strong style={{ color: '#28a745' }}>{formatarMoeda(dashboard.financeiro.total_pago)}</strong></div>
              </div>
            </div>
          </div>
        </>
      )}

      <h2 style={{ fontSize: 20, marginBottom: 16, fontWeight: 600 }}>📋 Todas as Contas</h2>
      <div style={{ background: 'white', borderRadius: 8, overflow: 'auto', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Origem</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Documento</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Fornecedor</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Vencimento</th>
              <th style={{ padding: 12, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>Valor</th>
              <th style={{ padding: 12, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>Pago</th>
              <th style={{ padding: 12, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {contas.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#999' }}>
                  Nenhuma conta encontrada
                </td>
              </tr>
            ) : (
              contas.map((conta, idx) => (
                <tr key={`${conta.origem}-${conta.id}-${idx}`} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      background: conta.origem === 'compras' ? '#005daa' : '#6f42c1',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 500
                    }}>
                      {conta.origem === 'compras' ? '🛒 Compras' : '📊 Financeiro'}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: 14 }}>{conta.numero_documento || '-'}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>{conta.fornecedor || '-'}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>
                    {conta.data_vencimento ? new Date(conta.data_vencimento).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td style={{ padding: 12, textAlign: 'right', fontSize: 14, fontWeight: 500 }}>
                    {formatarMoeda(Number(conta.valor))}
                  </td>
                  <td style={{ padding: 12, textAlign: 'right', fontSize: 14 }}>
                    {formatarMoeda(Number(conta.valor_pago))}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    {getStatusBadge(conta.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

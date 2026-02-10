'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = 'http://213.199.51.121:4001';

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  try {
    const s = localStorage.getItem('portal_user');
    if (s) {
      return { 'X-Portal-User': s, 'Content-Type': 'application/json' };
    }
  } catch (_) {}
  return { 'Content-Type': 'application/json' };
}

export default function SolicitacoesConvitePage() {
  const [lista, setLista] = useState<any[]>([]);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroResponsavel, setFiltroResponsavel] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');
  const [modalEditar, setModalEditar] = useState<any | null>(null);
  const [formEditar, setFormEditar] = useState({ valor_final: '', forma_pagamento: '', observacoes: '', responsavel_id: '' });

  const carregar = async () => {
    setLoading(true);
    try {
      const [resLista, resVol] = await Promise.all([
        fetch(`${API_BASE}/api/solicitacoes-convite`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/api/voluntarios`),
      ]);
      const data = await resLista.json().catch(() => []);
      setLista(Array.isArray(data) ? data : []);
      const vol = await resVol.json().catch(() => []);
      setResponsaveis(Array.isArray(vol) ? vol : []);
    } catch {
      setLista([]);
      setResponsaveis([]);
    }
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const aplicarFiltros = (rows: any[]) => {
    let r = rows;
    if (filtroStatus) r = r.filter((x) => (x.status || 'NOVO') === filtroStatus);
    if (filtroResponsavel) r = r.filter((x) => String(x.responsavel_id || '') === filtroResponsavel);
    if (filtroBusca.trim()) {
      const b = filtroBusca.trim().toLowerCase();
      r = r.filter((x) => (x.nome_solicitante || '').toLowerCase().includes(b) || (x.whatsapp || '').includes(b));
    }
    return r;
  };

  const listaFiltrada = aplicarFiltros(lista);

  const patchStatus = async (id: number, status: string) => {
    try {
      await fetch(`${API_BASE}/api/solicitacoes-convite/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      carregar();
    } catch (e) {
      alert('Erro ao atualizar.');
    }
  };

  const patchEditar = async () => {
    if (!modalEditar) return;
    try {
      await fetch(`${API_BASE}/api/solicitacoes-convite/${modalEditar.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          valor_final: formEditar.valor_final ? parseFloat(String(formEditar.valor_final).replace(',', '.')) : undefined,
          forma_pagamento: formEditar.forma_pagamento || undefined,
          observacoes: formEditar.observacoes || undefined,
          responsavel_id: formEditar.responsavel_id || null,
        }),
      });
      setModalEditar(null);
      carregar();
    } catch (e) {
      alert('Erro ao salvar.');
    }
  };

  const abrirWhatsApp = (row: any) => {
    const w = row.whatsapp && String(row.whatsapp).replace(/\D/g, '');
    if (w) {
      if ((row.status || 'NOVO') === 'NOVO') {
        patchStatus(row.id, 'CONTATADO');
      }
      window.open(`https://wa.me/55${w}`, '_blank');
    }
  };

  const formatarData = (iso: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatarMoeda = (v: number) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  const badgeStatus = (status: string) => {
    const s = (status || 'NOVO').toUpperCase();
    const cores: Record<string, string> = { NOVO: '#17a2b8', CONTATADO: '#fd7e14', CONCLUIDO: '#28a745' };
    return (
      <span style={{ background: cores[s] || '#6c757d', color: '#fff', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
        {s}
      </span>
    );
  };

  return (
    <div className="page-container" style={{ fontFamily: 'sans-serif', maxWidth: 1100, margin: '0 auto' }}>
      <Link href="/portal" style={{ color: '#005daa', textDecoration: 'none', marginBottom: 16, display: 'inline-block' }}>← Voltar ao Portal</Link>
      <h1 style={{ color: '#005daa', marginBottom: 8 }}>🍝 Solicitações de convite – Noite Italiana 2026</h1>
      <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>Monitore e avance o funil: Novo → Contatado → Concluído.</p>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc' }}>
          <option value="">Todos os status</option>
          <option value="NOVO">NOVO</option>
          <option value="CONTATADO">CONTATADO</option>
          <option value="CONCLUIDO">CONCLUIDO</option>
        </select>
        <select value={filtroResponsavel} onChange={(e) => setFiltroResponsavel(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc' }}>
          <option value="">Todos os responsáveis</option>
          {responsaveis.map((v) => (
            <option key={v.id} value={v.id}>{v.nome_completo || v.nome}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Buscar por nome ou WhatsApp"
          value={filtroBusca}
          onChange={(e) => setFiltroBusca(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', minWidth: 200 }}
        />
      </div>

      {loading && <p style={{ color: '#666' }}>Carregando...</p>}
      {!loading && lista.length === 0 && <p style={{ color: '#666' }}>Nenhuma solicitação ainda.</p>}
      {!loading && lista.length > 0 && (
        <>
          <p style={{ marginBottom: 16, fontWeight: 600, color: '#333' }}>Exibindo {listaFiltrada.length} de {lista.length} solicitação(ões)</p>
          <div className="resp-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 8, overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#005daa', color: '#fff' }}>
                  <th style={{ padding: 12, textAlign: 'left' }}>Data</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Nome</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>Status</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>Qtd</th>
                  <th style={{ padding: 12, textAlign: 'right' }}>Valor un.</th>
                  <th style={{ padding: 12, textAlign: 'right' }}>Total</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Responsável</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>WhatsApp</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 12, fontSize: 14 }}>{formatarData(row.created_at)}</td>
                    <td style={{ padding: 12, fontWeight: 500 }}>{row.nome_solicitante}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{badgeStatus(row.status)}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{row.quantidade_convites}</td>
                    <td style={{ padding: 12, textAlign: 'right' }}>R$ {formatarMoeda(row.valor_unitario)}</td>
                    <td style={{ padding: 12, textAlign: 'right', fontWeight: 600 }}>
                      R$ {formatarMoeda(row.valor_final ?? (row.quantidade_convites || 0) * (row.valor_unitario || 0))}
                    </td>
                    <td style={{ padding: 12, fontSize: 14 }}>{row.responsavel_nome || '—'}</td>
                    <td style={{ padding: 12 }}>
                      {row.whatsapp ? (
                        <button
                          type="button"
                          onClick={() => abrirWhatsApp(row)}
                          style={{ background: '#25d366', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                        >
                          {row.whatsapp}
                        </button>
                      ) : '—'}
                    </td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {(row.status || 'NOVO') !== 'CONTATADO' && (row.status || 'NOVO') !== 'CONCLUIDO' && (
                          <button type="button" onClick={() => patchStatus(row.id, 'CONTATADO')} style={{ background: '#fd7e14', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Contatado</button>
                        )}
                        {(row.status || 'NOVO') !== 'CONCLUIDO' && (
                          <button type="button" onClick={() => patchStatus(row.id, 'CONCLUIDO')} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Concluído</button>
                        )}
                        <button type="button" onClick={() => { setModalEditar(row); setFormEditar({ valor_final: row.valor_final ?? '', forma_pagamento: row.forma_pagamento ?? '', observacoes: row.observacoes ?? '', responsavel_id: row.responsavel_id ?? '' }); }} style={{ background: '#005daa', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Editar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Editar */}
      {modalEditar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModalEditar(null)}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, maxWidth: 420, width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', color: '#005daa' }}>Editar solicitação</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <label>Valor final (R$)</label>
              <input type="text" placeholder="Ex: 100,00" value={formEditar.valor_final} onChange={(e) => setFormEditar((p) => ({ ...p, valor_final: e.target.value }))} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <label>Forma de pagamento</label>
              <input type="text" placeholder="PIX, dinheiro, etc." value={formEditar.forma_pagamento} onChange={(e) => setFormEditar((p) => ({ ...p, forma_pagamento: e.target.value }))} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <label>Responsável</label>
              <select value={formEditar.responsavel_id} onChange={(e) => setFormEditar((p) => ({ ...p, responsavel_id: e.target.value }))} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
                <option value="">—</option>
                {responsaveis.map((v) => <option key={v.id} value={v.id}>{v.nome_completo || v.nome}</option>)}
              </select>
              <label>Observações</label>
              <textarea rows={3} value={formEditar.observacoes} onChange={(e) => setFormEditar((p) => ({ ...p, observacoes: e.target.value }))} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button type="button" onClick={patchEditar} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>Salvar</button>
              <button type="button" onClick={() => setModalEditar(null)} style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

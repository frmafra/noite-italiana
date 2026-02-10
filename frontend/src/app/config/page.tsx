// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ConfigPage() {
  const [tab, setTab] = useState('projetos');
  const [data, setData] = useState({ projetos: [], voluntarios: [], base: [], pastas: [], produtosBase: [] });
  const emptyProj = { id: null, nome: '', descricao: '', escopo: '', status: 'Em Aprovação', orcamento_previsto: 0, orcamento_realizado: 0, data_inicio: '', data_fim: '', ativo: true, coordenador_id: '' };
  const [fProj, setFProj] = useState(emptyProj);
  const emptyVol = {
    id: null, nome: '', nome_completo: '', whatsapp: '', email: '', cpf: '', data_nascimento: '',
    endereco_rua: '', endereco_numero: '', endereco_bairro: '', endereco_cidade: '', endereco_estado: '', endereco_cep: '',
    login: '', senha: '123', status_vinculo: 'Voluntário', telefone: ''
  };
  const [fVol, setFVol] = useState(emptyVol);
  const [periodos, setPeriodos] = useState([]);
  const [modalPeriodo, setModalPeriodo] = useState(false);
  const [editingPeriodoId, setEditingPeriodoId] = useState(null);
  const [fPeriodo, setFPeriodo] = useState({ data_inicio: '', data_fim: '', funcao: '', observacoes: '' });
  const emptyBase = { id: null, nome: '', categoria: '', unidade: '', preco_medio: 0, tipo: 'Produto', fornecedor: '', descricao: '', codigo_interno: '', ativo: true };
  const [fBase, setFBase] = useState(emptyBase);
  const [filtroBase, setFiltroBase] = useState({ busca: '', categoria: '', status: 'todos' });
  const emptyPast = { id: null, projeto_id: '', nome: '', descricao: '', ordem: 0, ativo: true, coordenador_id: '' };
  const [fPast, setFPast] = useState(emptyPast);
  const [projetoPastas, setProjetoPastas] = useState('');
  const [areasPastas, setAreasPastas] = useState([]);

  const API = 'http://213.199.51.121:4001/api';

  const load = async () => {
    try {
      const [p, v, b, pas, prod] = await Promise.all([
        fetch(`${API}/projetos`).then(r => r.ok ? r.json() : []),
        fetch(`${API}/voluntarios`).then(r => r.ok ? r.json() : []),
        fetch(`${API}/areas-base`).then(r => r.ok ? r.json() : []),
        fetch(`${API}/areas-projeto`).then(r => r.ok ? r.json() : []),
        fetch(`${API}/produtos`).then(r => r.ok ? r.json() : [])
      ]);
      setData({ projetos: p, voluntarios: v, base: b, pastas: pas, produtosBase: prod });
    } catch (e) {
      console.error('Erro ao carregar:', e);
      setData({ projetos: [], voluntarios: [], base: [], pastas: [], produtosBase: [] });
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (fVol.id && tab === 'voluntarios') loadPeriodos(fVol.id);
    else setPeriodos([]);
  }, [fVol.id, tab]);
  const loadAreasProjeto = async (projetoId: string | number) => {
    if (!projetoId) { setAreasPastas([]); return; }
    try {
      const r = await fetch(`${API}/areas-projeto/projeto/${projetoId}`);
      const list = r.ok ? await r.json() : [];
      setAreasPastas(list.sort((a: { ordem: number }, b: { ordem: number }) => (a.ordem || 0) - (b.ordem || 0)));
    } catch (e) {
      setAreasPastas([]);
    }
  };
  useEffect(() => {
    if (tab === 'pastas' && projetoPastas) loadAreasProjeto(projetoPastas);
    else if (tab === 'pastas') setAreasPastas([]);
  }, [tab, projetoPastas]);

  const formatMoney = (v: unknown) => {
    const n = Number(v);
    if (isNaN(n)) return 'R$ 0,00';
    return 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };
  const parseMoney = (s: string) => {
    const n = parseFloat(String(s).replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    return n;
  };
  const toDateInput = (d: string | null | undefined) => {
    if (!d) return '';
    const x = new Date(d);
    if (isNaN(x.getTime())) return '';
    return x.toISOString().slice(0, 10);
  };
  const formatarTelefone = (valor: string) => {
    return String(valor || '')
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };
  const formatarCPF = (valor: string) => {
    return String(valor || '')
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };
  const calcularDuracao = (dataInicio: string, dataFim: string | null) => {
    if (!dataInicio) return '-';
    const inicio = new Date(dataInicio);
    const fim = dataFim ? new Date(dataFim) : new Date();
    if (isNaN(inicio.getTime())) return '-';
    if (isNaN(fim.getTime())) return '-';
    const meses = (fim.getFullYear() - inicio.getFullYear()) * 12 + (fim.getMonth() - inicio.getMonth());
    if (meses < 0) return '-';
    const anos = Math.floor(meses / 12);
    const mesesRestantes = meses % 12;
    if (anos > 0) return `${anos} ano${anos > 1 ? 's' : ''} ${mesesRestantes} mês${mesesRestantes !== 1 ? 'es' : ''}`;
    return `${meses} mês${meses !== 1 ? 'es' : ''}`;
  };
  const loadPeriodos = async (voluntarioId: number) => {
    try {
      const r = await fetch(`${API}/voluntarios/${voluntarioId}/periodos`);
      const list = r.ok ? await r.json() : [];
      setPeriodos(list);
    } catch (e) {
      setPeriodos([]);
    }
  };

  const save = async (path, payload, reset) => {
    try {
      const method = payload.id ? 'PUT' : 'POST';
      const url = `${API}/${path}${payload.id ? '/' + payload.id : ''}`;
      // Para PUT de projetos, backend espera todos os campos
      let body = payload;
      if (path === 'projetos' && payload.id) {
        body = {
          nome: payload.nome ?? '',
          descricao: payload.descricao ?? null,
          escopo: payload.escopo ?? '',
          data_inicio: payload.data_inicio || null,
          data_fim: payload.data_fim || null,
          orcamento_previsto: Number(payload.orcamento_previsto) || 0,
          orcamento_realizado: Number(payload.orcamento_realizado) || 0,
          status: payload.status ?? 'Em Aprovação',
          ativo: payload.ativo !== false,
          coordenador_id: payload.coordenador_id ? Number(payload.coordenador_id) : null,
        };
      }
      if (path === 'projetos' && !payload.id) {
        body = {
          nome: payload.nome || 'Novo projeto',
          descricao: payload.descricao ?? null,
          escopo: payload.escopo ?? '',
          data_inicio: payload.data_inicio || null,
          data_fim: payload.data_fim || null,
          orcamento_previsto: Number(payload.orcamento_previsto) || 0,
          orcamento_realizado: Number(payload.orcamento_realizado) || 0,
          status: payload.status || 'Em Aprovação',
          coordenador_id: payload.coordenador_id ? Number(payload.coordenador_id) : null,
        };
      }
      if (path === 'areas-projeto' || path === 'config-pastas') {
        body = {
          projeto_id: payload.projeto_id ? Number(payload.projeto_id) : null,
          nome: payload.nome || '',
          descricao: payload.descricao || null,
          ordem: Number(payload.ordem) || 0,
          ativo: payload.ativo !== false,
          coordenador_id: payload.coordenador_id ? Number(payload.coordenador_id) : null,
        };
      }
      if (path === 'produtos') {
        body = {
          nome: payload.nome || '',
          categoria: payload.categoria || null,
          unidade: payload.unidade || null,
          preco_medio: Number(payload.preco_medio) || 0,
          tipo: payload.tipo || 'Produto',
          fornecedor: payload.fornecedor || null,
          descricao: payload.descricao || null,
          codigo_interno: payload.codigo_interno || null,
          ativo: payload.ativo !== false,
        };
      }
      if (path === 'voluntarios') {
        body = {
          nome: payload.nome_completo || payload.nome || '',
          nome_completo: payload.nome_completo || payload.nome || '',
          whatsapp: payload.whatsapp || payload.telefone || '',
          telefone: payload.whatsapp || payload.telefone || '',
          email: payload.email || null,
          login: payload.login || null,
          senha: payload.senha || '123456',
          status_vinculo: payload.status_vinculo || 'Voluntário',
          ativo: payload.ativo !== false,
          cpf: payload.cpf || null,
          data_nascimento: payload.data_nascimento || null,
          endereco_rua: payload.endereco_rua || null,
          endereco_numero: payload.endereco_numero || null,
          endereco_bairro: payload.endereco_bairro || null,
          endereco_cidade: payload.endereco_cidade || null,
          endereco_estado: payload.endereco_estado || null,
          endereco_cep: payload.endereco_cep || null,
        };
      }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Erro ${res.status}`);
      }
      reset();
      await load();
      alert('Salvo!');
    } catch (e) {
      console.error('Erro ao salvar:', e);
      alert('Erro ao salvar: ' + (e.message || String(e)));
    }
  };

  return (
    <div className="page-container" style={{ fontFamily: 'sans-serif', maxWidth:'1400px', margin:'0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/">
            <button style={{ background: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>
              ← Página Inicial
            </button>
          </Link>
          <Link href="/portal">
            <button style={{ background: '#005daa', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>
              ← Portal (menu)
            </button>
          </Link>
        </div>
        <h1 style={{ color: '#005daa', margin: 0 }}>⚙️ Configurações</h1>
        <div style={{ width: 200 }} />
      </div>
      <div style={{ display:'flex', gap:'5px', marginBottom:'30px', background:'#eee', padding:'5px', borderRadius:'10px', flexWrap: 'wrap' }}>
        {['projetos', 'voluntarios', 'base', 'pastas'].map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ flex:1, minWidth: '90px', padding:'15px', border:'none', borderRadius:'8px', background:tab===t?'#005daa':'transparent', color:tab===t?'#fff':'#333', fontWeight:'bold' }}>{t.toUpperCase()}</button>
        ))}
      </div>
      <div className="resp-grid-aside-450" style={{ gap: '30px' }}>
        <div style={{ background:'#fff', padding:'25px', borderRadius:'20px', boxShadow:'0 10px 20px rgba(0,0,0,0.05)' }}>
          {tab==='projetos' && data.projetos.map(p => (
            <div key={p.id} style={{ padding: '12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <div>
                <strong>{p.nome}</strong>
                {p.status && <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>({p.status})</span>}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setFProj({ ...emptyProj, ...p, data_inicio: toDateInput(p.data_inicio), data_fim: toDateInput(p.data_fim), coordenador_id: p.coordenador_id ?? '' })} style={{ padding: '6px 12px', background: '#005daa', color: '#fff', border: 'none', borderRadius: 6 }}>Editar</button>
                <button onClick={async () => { if (window.confirm('Excluir este projeto?')) { try { const r = await fetch(`${API}/projetos/${p.id}`, { method: 'DELETE' }); if (!r.ok) throw new Error(await r.text()); await load(); setFProj(emptyProj); alert('Excluído.'); } catch (e) { alert('Erro: ' + (e.message || e)); } } }} style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 6 }}>Excluir</button>
              </div>
            </div>
          ))}
          {tab==='voluntarios' && data.voluntarios.map(v => (
            <div key={v.id} style={{ padding: '12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{v.nome_completo || v.nome || 'Sem nome'}</strong>
              <button onClick={() => setFVol({ ...emptyVol, ...v, nome_completo: v.nome_completo || v.nome, whatsapp: v.whatsapp || v.telefone, data_nascimento: toDateInput(v.data_nascimento) })} style={{ padding: '6px 12px', background: '#005daa', color: '#fff', border: 'none', borderRadius: 6 }}>Editar</button>
            </div>
          ))}
          {tab==='base' && (() => {
            const categorias = ['Ingrediente', 'Material', 'Serviço', 'Equipamento', 'Embalagem', 'Transporte', 'Outro'];
            const list = (data.produtosBase || []).filter((p: { nome: string; categoria?: string; codigo_interno?: string; ativo?: boolean }) => {
              const matchNome = !filtroBase.busca || (p.nome || '').toLowerCase().includes(filtroBase.busca.toLowerCase()) || (p.codigo_interno || '').toLowerCase().includes(filtroBase.busca.toLowerCase());
              const matchCat = !filtroBase.categoria || p.categoria === filtroBase.categoria;
              const matchStatus = filtroBase.status === 'todos' || (filtroBase.status === 'ativos' && p.ativo !== false) || (filtroBase.status === 'inativos' && !p.ativo);
              return matchNome && matchCat && matchStatus;
            });
            return (
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <input placeholder="Buscar por nome ou código" value={filtroBase.busca} onChange={e => setFiltroBase({ ...filtroBase, busca: e.target.value })} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', flex: 1, minWidth: 120 }} />
                  <select value={filtroBase.categoria} onChange={e => setFiltroBase({ ...filtroBase, categoria: e.target.value })} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
                    <option value="">Todas categorias</option>
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={filtroBase.status} onChange={e => setFiltroBase({ ...filtroBase, status: e.target.value })} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
                    <option value="todos">Todos</option>
                    <option value="ativos">Ativos</option>
                    <option value="inativos">Inativos</option>
                  </select>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead><tr style={{ background: '#eee', textAlign: 'left' }}><th style={{ padding: 8 }}>Código</th><th style={{ padding: 8 }}>Nome</th><th style={{ padding: 8 }}>Categoria</th><th style={{ padding: 8 }}>Unidade</th><th style={{ padding: 8 }}>Preço</th><th style={{ padding: 8 }}>Status</th><th style={{ padding: 8 }}>Ações</th></tr></thead>
                    <tbody>
                      {list.map((p: { id: number; nome: string; categoria?: string; unidade?: string; preco_medio?: number; codigo_interno?: string; ativo?: boolean }) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: 8 }}>{p.codigo_interno || '-'}</td>
                          <td style={{ padding: 8 }}><strong>{p.nome || '-'}</strong></td>
                          <td style={{ padding: 8 }}>{p.categoria || '-'}</td>
                          <td style={{ padding: 8 }}>{p.unidade || '-'}</td>
                          <td style={{ padding: 8 }}>{formatMoney(p.preco_medio)}</td>
                          <td style={{ padding: 8 }}><span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, background: p.ativo !== false ? '#28a745' : '#6c757d', color: '#fff' }}>{p.ativo !== false ? 'Ativo' : 'Inativo'}</span></td>
                          <td style={{ padding: 8 }}>
                            <button onClick={() => setFBase({ ...emptyBase, ...p, preco_medio: Number(p.preco_medio) || 0 })} style={{ marginRight: 4, padding: '4px 8px', fontSize: 12, background: '#005daa', color: '#fff', border: 'none', borderRadius: 4 }}>Editar</button>
                            <button onClick={async () => { try { const r = await fetch(`${API}/produtos/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...p, ativo: !(p.ativo !== false) }) }); if (!r.ok) throw new Error(await r.text()); await load(); } catch (e) { alert('Erro: ' + (e.message || e)); } }} style={{ marginRight: 4, padding: '4px 8px', fontSize: 12, background: p.ativo !== false ? '#ffc107' : '#17a2b8', color: '#000', border: 'none', borderRadius: 4 }}>{p.ativo !== false ? 'Inativar' : 'Ativar'}</button>
                            <button onClick={async () => { if (!window.confirm('Excluir este produto?')) return; try { const r = await fetch(`${API}/produtos/${p.id}`, { method: 'DELETE' }); if (!r.ok) throw new Error(await r.text()); await load(); setFBase(emptyBase); alert('Excluído.'); } catch (e) { alert('Erro: ' + (e.message || e)); } }} style={{ padding: '4px 8px', fontSize: 12, background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4 }}>Excluir</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
          {tab==='pastas' && (
            <div>
              <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 8 }}>Projeto</label>
              <select value={projetoPastas} onChange={e => { setProjetoPastas(e.target.value); setFPast(emptyPast); }} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 12 }}>
                <option value="">Selecione um projeto...</option>
                {(data.projetos || []).map((p: { id: number; nome: string }) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              {projetoPastas && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong>Áreas do projeto</strong>
                    <button onClick={async () => { if (!window.confirm('Criar 10 áreas padrão da Noite Italiana para este projeto?')) return; const areasPadrao = [{ nome: 'Portaria e Marketing', ordem: 1, descricao: 'Coordenadores: Tim Tom e Mateus' }, { nome: 'Montagem da Festa', ordem: 2, descricao: 'Coordenador: Alcides' }, { nome: 'Buffet e Cozinha', ordem: 3, descricao: 'Coordenadora: Tonnia' }, { nome: 'Bar', ordem: 4, descricao: 'Coordenador: Rolando' }, { nome: 'Limpeza', ordem: 5, descricao: 'Coordenador: Rafael' }, { nome: 'Vallet', ordem: 6, descricao: 'Coordenador: Feltrin' }, { nome: 'Compras Gerais', ordem: 7, descricao: 'Coordenador: Mafra' }, { nome: 'Financeiro', ordem: 8, descricao: 'Coordenador: Leandro' }, { nome: 'Parcerias', ordem: 9, descricao: 'Coordenador: Marcelo' }, { nome: 'Contratos', ordem: 10, descricao: 'Coordenadora: Manu' }]; for (const area of areasPadrao) { await fetch(`${API}/areas-projeto`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...area, projeto_id: Number(projetoPastas), ativo: true }) }); } await loadAreasProjeto(projetoPastas); alert('10 áreas padrão criadas com sucesso!'); }} style={{ padding: '6px 10px', fontSize: 12, background: '#17a2b8', color: '#fff', border: 'none', borderRadius: 6 }}>Áreas padrão</button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead><tr style={{ background: '#eee', textAlign: 'left' }}><th style={{ padding: 8 }}>Ordem</th><th style={{ padding: 8 }}>Nome</th><th style={{ padding: 8 }}>Coordenador</th><th style={{ padding: 8 }}>Descrição</th><th style={{ padding: 8 }}>Status</th><th style={{ padding: 8 }}>Ações</th></tr></thead>
                      <tbody>
                        {areasPastas.map((a: { id: number; ordem?: number; nome: string; descricao?: string; ativo?: boolean; coordenador_nome_completo?: string; coordenador_nome?: string }, i: number) => (
                          <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: 8 }}>{a.ordem ?? i + 1}</td>
                            <td style={{ padding: 8 }}><strong>{a.nome || '-'}</strong></td>
                            <td style={{ padding: 8 }}>{(a.coordenador_nome_completo || a.coordenador_nome) ? <span style={{ background: '#28a745', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>👤 {a.coordenador_nome_completo || a.coordenador_nome}</span> : '-'}</td>
                            <td style={{ padding: 8, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{(a.descricao || '').slice(0, 40)}{(a.descricao || '').length > 40 ? '...' : ''}</td>
                            <td style={{ padding: 8 }}><span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, background: a.ativo !== false ? '#28a745' : '#6c757d', color: '#fff' }}>{a.ativo !== false ? 'Ativo' : 'Inativo'}</span></td>
                            <td style={{ padding: 8 }}>
                              <button onClick={() => setFPast({ ...emptyPast, ...a, projeto_id: String(a.projeto_id || projetoPastas), coordenador_id: (a as { coordenador_id?: number }).coordenador_id ?? '' })} style={{ marginRight: 4, padding: '4px 8px', fontSize: 12, background: '#005daa', color: '#fff', border: 'none', borderRadius: 4 }}>Editar</button>
                              <button onClick={async () => { try { const r = await fetch(`${API}/areas-projeto/${a.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...a, ativo: !(a.ativo !== false) }) }); if (!r.ok) throw new Error(await r.text()); await loadAreasProjeto(projetoPastas); } catch (e) { alert('Erro: ' + (e.message || e)); } }} style={{ marginRight: 4, padding: '4px 8px', fontSize: 12, background: '#ffc107', color: '#000', border: 'none', borderRadius: 4 }}>{a.ativo !== false ? 'Inativar' : 'Ativar'}</button>
                              <button onClick={async () => { if (i > 0) { const novaOrdem = [...areasPastas]; [novaOrdem[i - 1], novaOrdem[i]] = [novaOrdem[i], novaOrdem[i - 1]]; for (let j = 0; j < novaOrdem.length; j++) { await fetch(`${API}/areas-projeto/${novaOrdem[j].id}/ordem`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ordem: j }) }); } await loadAreasProjeto(projetoPastas); } }} style={{ marginRight: 4, padding: '4px 8px', fontSize: 12, background: '#6c757d', color: '#fff', border: 'none', borderRadius: 4 }}>↑</button>
                              <button onClick={async () => { if (i < areasPastas.length - 1) { const novaOrdem = [...areasPastas]; [novaOrdem[i], novaOrdem[i + 1]] = [novaOrdem[i + 1], novaOrdem[i]]; for (let j = 0; j < novaOrdem.length; j++) { await fetch(`${API}/areas-projeto/${novaOrdem[j].id}/ordem`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ordem: j }) }); } await loadAreasProjeto(projetoPastas); } }} style={{ marginRight: 4, padding: '4px 8px', fontSize: 12, background: '#6c757d', color: '#fff', border: 'none', borderRadius: 4 }}>↓</button>
                              <button onClick={async () => { if (!window.confirm('Excluir esta área?')) return; try { const r = await fetch(`${API}/areas-projeto/${a.id}`, { method: 'DELETE' }); if (!r.ok) throw new Error(await r.text()); await loadAreasProjeto(projetoPastas); setFPast(emptyPast); } catch (e) { alert('Erro: ' + (e.message || e)); } }} style={{ padding: '4px 8px', fontSize: 12, background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4 }}>Excluir</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div style={{ background:'#eef2f7', padding:'30px', borderRadius:'20px' }}>
          {tab==='projetos' && (
            <div style={{ display: 'grid', gap: 14 }}>
              <h4 style={{ margin: 0 }}>Projeto</h4>
              <label style={{ fontSize: 12, color: '#555' }}>Nome *</label>
              <input placeholder="Nome do projeto" value={fProj.nome} onChange={e => setFProj({ ...fProj, nome: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <label style={{ fontSize: 12, color: '#555' }}>Coordenador</label>
              <select value={fProj.coordenador_id ?? ''} onChange={e => setFProj({ ...fProj, coordenador_id: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
                <option value="">— Nenhum —</option>
                {(data.voluntarios || []).map((v: { id: number; nome: string }) => <option key={v.id} value={v.id}>{v.nome}</option>)}
              </select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={{ fontSize: 12, color: '#555' }}>Data início</label><input type="date" value={fProj.data_inicio ?? ''} onChange={e => setFProj({ ...fProj, data_inicio: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} /></div>
                <div><label style={{ fontSize: 12, color: '#555' }}>Data fim</label><input type="date" value={fProj.data_fim ?? ''} onChange={e => setFProj({ ...fProj, data_fim: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} /></div>
              </div>
              <label style={{ fontSize: 12, color: '#555' }}>Orçamento previsto (R$)</label>
              <input type="text" placeholder="0,00" value={(fProj.orcamento_previsto == null || fProj.orcamento_previsto === 0 || fProj.orcamento_previsto === '') ? '' : formatMoney(fProj.orcamento_previsto)} onChange={e => setFProj({ ...fProj, orcamento_previsto: parseMoney(e.target.value) })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <label style={{ fontSize: 12, color: '#555' }}>Orçamento realizado (R$)</label>
              <input type="text" placeholder="0,00" value={(fProj.orcamento_realizado == null || fProj.orcamento_realizado === 0 || fProj.orcamento_realizado === '') ? '' : formatMoney(fProj.orcamento_realizado)} onChange={e => setFProj({ ...fProj, orcamento_realizado: parseMoney(e.target.value) })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <label style={{ fontSize: 12, color: '#555' }}>Status</label>
              <select value={fProj.status} onChange={e => setFProj({ ...fProj, status: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
                {['Em Aprovação', 'Ativo', 'Suspenso', 'Parado', 'Cancelado', 'Finalizado'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <label style={{ fontSize: 12, color: '#555' }}>Descrição / Escopo</label>
              <textarea placeholder="Descrição ou escopo" value={fProj.descricao ?? fProj.escopo ?? ''} onChange={e => setFProj({ ...fProj, descricao: e.target.value, escopo: e.target.value })} rows={2} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', resize: 'vertical' }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                <button onClick={() => { if (!String(fProj.nome || '').trim()) { alert('Preencha o nome do projeto.'); return; } save('projetos', fProj, () => setFProj(emptyProj)); }} style={{ background: '#28a745', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: 8, fontWeight: 'bold' }}>SALVAR</button>
                <button onClick={() => setFProj(emptyProj)} style={{ background: '#6c757d', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: 8 }}>NOVO</button>
                {fProj.id && (
                  <>
                    <button onClick={async () => { if (!window.confirm('Finalizar este projeto? O status será alterado para Finalizado.')) return; await save('projetos', { ...fProj, status: 'Finalizado' }, () => setFProj(emptyProj)); }} style={{ background: '#17a2b8', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: 8 }}>FINALIZAR PROJETO</button>
                    <button onClick={async () => { if (!window.confirm('Excluir este projeto?')) return; try { const r = await fetch(`${API}/projetos/${fProj.id}`, { method: 'DELETE' }); if (!r.ok) throw new Error(await r.text()); await load(); setFProj(emptyProj); alert('Excluído.'); } catch (e) { alert('Erro: ' + (e.message || e)); } }} style={{ background: '#dc3545', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: 8 }}>EXCLUIR</button>
                  </>
                )}
              </div>
            </div>
          )}
          {tab==='voluntarios' && (
            <div style={{ display: 'grid', gap: 12 }}>
              <h4 style={{ margin: 0 }}>Cadastro de Voluntário</h4>
              <label style={{ fontSize: 12, color: '#555' }}>Nome completo *</label>
              <input placeholder="Nome completo" value={fVol.nome_completo || fVol.nome} onChange={e => setFVol({ ...fVol, nome_completo: e.target.value, nome: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <label style={{ fontSize: 12, color: '#555' }}>WhatsApp *</label>
              <input placeholder="(99) 99999-9999" value={fVol.whatsapp || fVol.telefone} onChange={e => setFVol({ ...fVol, whatsapp: formatarTelefone(e.target.value), telefone: formatarTelefone(e.target.value) })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} maxLength={15} />
              <label style={{ fontSize: 12, color: '#555' }}>E-mail</label>
              <input type="email" placeholder="email@exemplo.com" value={fVol.email || ''} onChange={e => setFVol({ ...fVol, email: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <label style={{ fontSize: 12, color: '#555' }}>CPF</label>
              <input placeholder="999.999.999-99" value={fVol.cpf || ''} onChange={e => setFVol({ ...fVol, cpf: formatarCPF(e.target.value) })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} maxLength={14} />
              <label style={{ fontSize: 12, color: '#555' }}>Data de nascimento</label>
              <input type="date" value={fVol.data_nascimento || ''} onChange={e => setFVol({ ...fVol, data_nascimento: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <label style={{ fontSize: 12, color: '#555' }}>Endereço</label>
              <input placeholder="Rua" value={fVol.endereco_rua || ''} onChange={e => setFVol({ ...fVol, endereco_rua: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8 }}>
                <input placeholder="Número" value={fVol.endereco_numero || ''} onChange={e => setFVol({ ...fVol, endereco_numero: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
                <input placeholder="CEP" value={fVol.endereco_cep || ''} onChange={e => setFVol({ ...fVol, endereco_cep: e.target.value.replace(/\D/g, '').slice(0, 8) })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              </div>
              <input placeholder="Bairro" value={fVol.endereco_bairro || ''} onChange={e => setFVol({ ...fVol, endereco_bairro: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 60px', gap: 8 }}>
                <input placeholder="Cidade" value={fVol.endereco_cidade || ''} onChange={e => setFVol({ ...fVol, endereco_cidade: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
                <input placeholder="Estado" value={fVol.endereco_estado || ''} onChange={e => setFVol({ ...fVol, endereco_estado: e.target.value.toUpperCase().slice(0, 2) })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} maxLength={2} />
              </div>
              <label style={{ fontSize: 12, color: '#555' }}>Vínculo</label>
              <select value={fVol.status_vinculo} onChange={e => setFVol({ ...fVol, status_vinculo: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
                <option value="Voluntário">Voluntário</option>
                <option value="Coordenador">Coordenador</option>
                <option value="Colaborador">Colaborador</option>
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { if (!String(fVol.nome_completo || fVol.nome || '').trim()) { alert('Preencha o nome completo.'); return; } if (!String(fVol.whatsapp || fVol.telefone || '').replace(/\D/g, '').trim() || (fVol.whatsapp || fVol.telefone || '').replace(/\D/g, '').length < 10) { alert('Preencha o WhatsApp corretamente (mínimo 10 dígitos).'); return; } save('voluntarios', fVol, () => { setFVol(emptyVol); setPeriodos([]); }); }} style={{ background: '#28a745', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: 8, fontWeight: 'bold' }}>SALVAR</button>
                <button onClick={() => { setFVol(emptyVol); setPeriodos([]); setModalPeriodo(false); }} style={{ background: '#6c757d', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: 8 }}>NOVO</button>
              </div>

              {fVol.id && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #ddd' }}>
                  <h5 style={{ margin: '0 0 10px' }}>Períodos de atuação</h5>
                  <button onClick={() => { setEditingPeriodoId(null); setFPeriodo({ data_inicio: '', data_fim: '', funcao: '', observacoes: '' }); const ativo = periodos.find((p: { data_fim: null }) => !p.data_fim); if (ativo) alert('Já existe um período ativo. Encerre-o antes de iniciar outro ou edite o existente.'); setModalPeriodo(true); }} style={{ marginBottom: 10, padding: '8px 14px', background: '#005daa', color: '#fff', border: 'none', borderRadius: 6 }}>+ Novo período</button>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead><tr style={{ background: '#eee', textAlign: 'left' }}><th style={{ padding: 8 }}>Data Início</th><th style={{ padding: 8 }}>Data Fim</th><th style={{ padding: 8 }}>Função</th><th style={{ padding: 8 }}>Duração</th><th style={{ padding: 8 }}>Status</th><th style={{ padding: 8 }}>Ações</th></tr></thead>
                      <tbody>
                        {periodos.map((p: { id: number; data_inicio: string; data_fim: string | null; funcao: string }) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: 8 }}>{toDateInput(p.data_inicio) || '-'}</td>
                            <td style={{ padding: 8 }}>{p.data_fim ? toDateInput(p.data_fim) : '-'}</td>
                            <td style={{ padding: 8 }}>{p.funcao || '-'}</td>
                            <td style={{ padding: 8 }}>{calcularDuracao(p.data_inicio, p.data_fim)}</td>
                            <td style={{ padding: 8 }}><span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, background: !p.data_fim ? '#28a745' : '#6c757d', color: '#fff' }}>{!p.data_fim ? 'Ativo' : 'Inativo'}</span></td>
                            <td style={{ padding: 8 }}>
                              <button onClick={() => { setEditingPeriodoId(p.id); setFPeriodo({ data_inicio: toDateInput(p.data_inicio), data_fim: toDateInput(p.data_fim), funcao: p.funcao || '', observacoes: (p as { observacoes?: string }).observacoes || '' }); setModalPeriodo(true); }} style={{ marginRight: 4, padding: '4px 8px', fontSize: 12, background: '#005daa', color: '#fff', border: 'none', borderRadius: 4 }}>Editar</button>
                              {!p.data_fim && <button onClick={async () => { try { const r = await fetch(`${API}/voluntarios/${fVol.id}/periodos/${p.id}/encerrar`, { method: 'PUT' }); if (!r.ok) throw new Error(await r.text()); await loadPeriodos(fVol.id); } catch (e) { alert('Erro: ' + (e.message || e)); } }} style={{ marginRight: 4, padding: '4px 8px', fontSize: 12, background: '#17a2b8', color: '#fff', border: 'none', borderRadius: 4 }}>Encerrar</button>}
                              <button onClick={async () => { if (!window.confirm('Excluir este período?')) return; try { const r = await fetch(`${API}/voluntarios/${fVol.id}/periodos/${p.id}`, { method: 'DELETE' }); if (!r.ok) throw new Error(await r.text()); await loadPeriodos(fVol.id); } catch (e) { alert('Erro: ' + (e.message || e)); } }} style={{ padding: '4px 8px', fontSize: 12, background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4 }}>Excluir</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {modalPeriodo && fVol.id && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModalPeriodo(false)}>
                  <div style={{ background: '#fff', padding: 24, borderRadius: 12, maxWidth: 400, width: '90%' }} onClick={e => e.stopPropagation()}>
                    <h5 style={{ margin: '0 0 16px' }}>{editingPeriodoId ? 'Editar período' : 'Novo período'}</h5>
                    <label style={{ fontSize: 12, color: '#555' }}>Data início *</label>
                    <input type="date" value={fPeriodo.data_inicio} onChange={e => setFPeriodo({ ...fPeriodo, data_inicio: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 10 }} />
                    <label style={{ fontSize: 12, color: '#555' }}>Data fim</label>
                    <input type="date" value={fPeriodo.data_fim} onChange={e => setFPeriodo({ ...fPeriodo, data_fim: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 10 }} />
                    <label style={{ fontSize: 12, color: '#555' }}>Função</label>
                    <input value={fPeriodo.funcao} onChange={e => setFPeriodo({ ...fPeriodo, funcao: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 10 }} />
                    <label style={{ fontSize: 12, color: '#555' }}>Observações</label>
                    <textarea value={fPeriodo.observacoes} onChange={e => setFPeriodo({ ...fPeriodo, observacoes: e.target.value })} rows={2} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 16 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={async () => { const hoje = new Date().toISOString().slice(0, 10); if (!fPeriodo.data_inicio) { alert('Data início é obrigatória.'); return; } if (fPeriodo.data_inicio > hoje) { alert('Data início não pode ser futura.'); return; } if (fPeriodo.data_fim && fPeriodo.data_fim < fPeriodo.data_inicio) { alert('Data fim deve ser maior ou igual à data início.'); return; } const inicio = new Date(fPeriodo.data_inicio); const fim = fPeriodo.data_fim ? new Date(fPeriodo.data_fim) : null; const otherPeriodos = periodos.filter((per: { id: number }) => per.id !== editingPeriodoId);
const startNew = inicio.getTime(); const endNew = (fim || new Date()).getTime();
const hasOverlap = otherPeriodos.some((per: { data_inicio: string; data_fim: string | null }) => { const startPer = new Date(per.data_inicio).getTime(); const endPer = per.data_fim ? new Date(per.data_fim).getTime() : Date.now(); return startNew < endPer && endNew > startPer; });
if (hasOverlap) { alert('Já existe um período que se sobrepõe a estas datas. Ajuste as datas.'); return; } try { if (editingPeriodoId) { const r = await fetch(`${API}/voluntarios/${fVol.id}/periodos/${editingPeriodoId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fPeriodo) }); if (!r.ok) throw new Error(await r.text()); } else { const r = await fetch(`${API}/voluntarios/${fVol.id}/periodos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fPeriodo) }); if (!r.ok) throw new Error(await r.text()); } setModalPeriodo(false); setFPeriodo({ data_inicio: '', data_fim: '', funcao: '', observacoes: '' }); setEditingPeriodoId(null); await loadPeriodos(fVol.id); } catch (e) { alert('Erro: ' + (e.message || e)); } }} style={{ padding: '10px 18px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 8 }}>Salvar</button>
                      <button onClick={() => { setModalPeriodo(false); setFPeriodo({ data_inicio: '', data_fim: '', funcao: '', observacoes: '' }); setEditingPeriodoId(null); }} style={{ padding: '10px 18px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 8 }}>Cancelar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {tab==='base' && (
            <div style={{ display: 'grid', gap: 12 }}>
              <h4 style={{ margin: 0 }}>Produto Base</h4>
              <label style={{ fontSize: 12, color: '#555' }}>Nome *</label>
              <input placeholder="Nome do produto" value={fBase.nome} onChange={e => setFBase({ ...fBase, nome: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <label style={{ fontSize: 12, color: '#555' }}>Categoria *</label>
              <select value={fBase.categoria} onChange={e => setFBase({ ...fBase, categoria: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
                <option value="">— Selecione —</option>
                {['Ingrediente', 'Material', 'Serviço', 'Equipamento', 'Embalagem', 'Transporte', 'Outro'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label style={{ fontSize: 12, color: '#555' }}>Unidade *</label>
              <select value={fBase.unidade} onChange={e => setFBase({ ...fBase, unidade: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
                <option value="">— Selecione —</option>
                {['kg', 'g', 'mg', 'litro', 'ml', 'unidade', 'dúzia', 'pacote', 'caixa', 'hora', 'diária', 'metro', 'metro²', 'outro'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <label style={{ fontSize: 12, color: '#555' }}>Tipo</label>
              <select value={fBase.tipo} onChange={e => setFBase({ ...fBase, tipo: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
                <option value="Produto">Produto</option>
                <option value="Serviço">Serviço</option>
              </select>
              <label style={{ fontSize: 12, color: '#555' }}>Preço médio (R$)</label>
              <input type="text" placeholder="0,00" value={(fBase.preco_medio == null || fBase.preco_medio === 0 || fBase.preco_medio === '') ? '' : formatMoney(fBase.preco_medio)} onChange={e => setFBase({ ...fBase, preco_medio: parseMoney(e.target.value) })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <label style={{ fontSize: 12, color: '#555' }}>Fornecedor</label>
              <input placeholder="Fornecedor principal" value={fBase.fornecedor || ''} onChange={e => setFBase({ ...fBase, fornecedor: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <label style={{ fontSize: 12, color: '#555' }}>Código interno</label>
              <input placeholder="SKU / referência" value={fBase.codigo_interno || ''} onChange={e => setFBase({ ...fBase, codigo_interno: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <label style={{ fontSize: 12, color: '#555' }}>Descrição</label>
              <textarea placeholder="Descrição detalhada" value={fBase.descricao || ''} onChange={e => setFBase({ ...fBase, descricao: e.target.value })} rows={2} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', resize: 'vertical' }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={fBase.ativo !== false} onChange={e => setFBase({ ...fBase, ativo: e.target.checked })} /> Ativo</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button onClick={() => { if (!String(fBase.nome || '').trim()) { alert('Nome é obrigatório.'); return; } if (!fBase.categoria) { alert('Categoria é obrigatória.'); return; } if (!fBase.unidade) { alert('Unidade é obrigatória.'); return; } save('produtos', fBase, () => setFBase(emptyBase)); }} style={{ background: '#28a745', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: 8, fontWeight: 'bold' }}>SALVAR</button>
                <button onClick={() => setFBase(emptyBase)} style={{ background: '#6c757d', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: 8 }}>NOVO</button>
                <button onClick={() => setFBase(emptyBase)} style={{ background: '#6c757d', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: 8 }}>CANCELAR</button>
              </div>
            </div>
          )}
          {tab==='pastas' && (
            <div style={{ display: 'grid', gap: 12 }}>
              <h4 style={{ margin: 0 }}>Área / Pasta do Projeto</h4>
              <label style={{ fontSize: 12, color: '#555' }}>Projeto *</label>
              <select value={fPast.projeto_id || projetoPastas} onChange={e => setFPast({ ...fPast, projeto_id: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
                <option value="">— Selecione —</option>
                {(data.projetos || []).map((p: { id: number; nome: string }) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <label style={{ fontSize: 12, color: '#555' }}>Nome *</label>
              <input placeholder="Nome da área/pasta" value={fPast.nome} onChange={e => setFPast({ ...fPast, nome: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <label style={{ fontSize: 12, color: '#555' }}>Coordenador</label>
              <select value={fPast.coordenador_id ?? ''} onChange={e => setFPast({ ...fPast, coordenador_id: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
                <option value="">Selecione um coordenador...</option>
                {(data.voluntarios || []).filter((v: { ativo?: boolean }) => v.ativo !== false).sort((a: { nome_completo?: string; nome?: string }, b: { nome_completo?: string; nome?: string }) => (a.nome_completo || a.nome || '').localeCompare(b.nome_completo || b.nome || '')).map((v: { id: number; nome_completo?: string; nome?: string }) => <option key={v.id} value={v.id}>{v.nome_completo || v.nome}</option>)}
              </select>
              <label style={{ fontSize: 12, color: '#555' }}>Descrição</label>
              <textarea placeholder="Descrição (opcional)" value={fPast.descricao || ''} onChange={e => setFPast({ ...fPast, descricao: e.target.value })} rows={2} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', resize: 'vertical' }} />
              <label style={{ fontSize: 12, color: '#555' }}>Ordem</label>
              <input type="number" min={0} value={fPast.ordem ?? 0} onChange={e => setFPast({ ...fPast, ordem: parseInt(e.target.value, 10) || 0 })} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={fPast.ativo !== false} onChange={e => setFPast({ ...fPast, ativo: e.target.checked })} /> Ativo</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button onClick={() => { if (!fPast.projeto_id) { alert('Selecione um projeto.'); return; } if (!String(fPast.nome || '').trim()) { alert('Nome é obrigatório.'); return; } save('areas-projeto', fPast, () => { setFPast(emptyPast); if (projetoPastas) loadAreasProjeto(projetoPastas); }); }} style={{ background: '#28a745', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: 8, fontWeight: 'bold' }}>SALVAR</button>
                <button onClick={() => setFPast(emptyPast)} style={{ background: '#6c757d', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: 8 }}>NOVO</button>
                <button onClick={() => setFPast(emptyPast)} style={{ background: '#6c757d', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: 8 }}>CANCELAR</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE =
  typeof window !== 'undefined'
    ? ''
    : (process.env.NEXT_PUBLIC_API_URL || 'http://213.199.51.121:4001/api').replace(/\/api\/?$/, '');

const TABS = ['parceiros', 'solicitacoes', 'cotacoes', 'pedidos', 'recebimentos', 'contas-pagar'] as const;

// Máscaras
const formatarCNPJ = (v: string) =>
  String(v || '').replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d)/, '$1-$2').slice(0, 18);
const formatarCPF = (v: string) =>
  String(v || '').replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0, 14);
const formatarCEP = (v: string) =>
  String(v || '').replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
const formatarTelefone = (v: string) =>
  String(v || '').replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2').slice(0, 14);
const formatarCelular = (v: string) =>
  String(v || '').replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 15);
const formatarMoeda = (v: number | string) => {
  const n = typeof v === 'string' ? parseFloat(v) || 0 : Number(v) || 0;
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const parseMoeda = (v: string) => parseFloat(String(v || '').replace(/\D/g, '').replace(/(\d+)(\d{2})$/, '$1.$2')) || 0;

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

function apiPath(path: string) {
  const base = API_BASE ? (API_BASE.endsWith('api') ? API_BASE : API_BASE + '/api') : '/api';
  return path.startsWith('/') ? base + path : base + '/' + path;
}

const emptyParceiro = {
  id: null as number | null,
  razao_social: '', nome_fantasia: '', cnpj: '', cpf: '', tipo: 'juridica' as 'juridica' | 'fisica',
  inscricao_estadual: '', telefone: '', celular: '', email: '', site: '',
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
  banco: '', agencia: '', conta: '', pix: '',
  contato_comercial: '', email_comercial: '', telefone_comercial: '',
  observacoes: '', ativo: true,
  eh_fornecedor: false, eh_cliente: false, eh_entidade: false,
};

export default function ComprasPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('parceiros');
  const [parceiros, setParceiros] = useState<any[]>([]);
  const [fParceiro, setFParceiro] = useState(emptyParceiro);
  const [filtroParceiro, setFiltroParceiro] = useState({ busca: '', status: 'ativos' as 'todos' | 'ativos' | 'inativos', tipo: '' as '' | 'fornecedor' | 'cliente' | 'entidade' });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Dados para abas (Solicitações, Cotações, Pedidos, Recebimentos, Contas)
  const [projetos, setProjetos] = useState<any[]>([]);
  const [areasProjeto, setAreasProjeto] = useState<any[]>([]);
  const [voluntarios, setVoluntarios] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<any>(null);
  const [fSolicitacao, setFSolicitacao] = useState<any>({ projeto_id: '', area_projeto_id: '', requisitante_id: '', data_solicitacao: new Date().toISOString().slice(0, 10), justificativa: '', status: 'rascunho', itens: [] });
  const [cotacoes, setCotacoes] = useState<any[]>([]);
  const [cotacaoSelecionada, setCotacaoSelecionada] = useState<any>(null);
  const [fCotacao, setFCotacao] = useState<any>({ solicitacao_id: '', fornecedor_id: '', data_cotacao: new Date().toISOString().slice(0, 10), prazo_entrega: '', condicoes_pagamento: '', itens: [] });
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any>(null);
  const [recebimentos, setRecebimentos] = useState<any[]>([]);
  const [recebimentoSelecionado, setRecebimentoSelecionado] = useState<any>(null);
  const [fRecebimento, setFRecebimento] = useState<any>({ pedido_id: '', numero_nf: '', data_nf: '', data_recebimento: new Date().toISOString().slice(0, 10), valor_nf: '', observacoes: '', itens: [] });
  const [contasPagar, setContasPagar] = useState<any[]>([]);
  const [dashboardContas, setDashboardContas] = useState<any>(null);
  const [modalPagamento, setModalPagamento] = useState<{ aberto: boolean; conta: any; data_pagamento: string; valor_pago: string; forma_pagamento: string; conta_bancaria_id: string }>({ aberto: false, conta: null, data_pagamento: '', valor_pago: '', forma_pagamento: '', conta_bancaria_id: '' });
  const [contasBancarias, setContasBancarias] = useState<any[]>([]);
  const [filtroSolicitacao, setFiltroSolicitacao] = useState({ projeto_id: '', status: '' });
  const [filtroCotacao, setFiltroCotacao] = useState({ solicitacao_id: '', status: '' });
  const [filtroPedido, setFiltroPedido] = useState({ status: '', fornecedor_id: '' });
  const [filtroContas, setFiltroContas] = useState({ status: '', fornecedor_id: '' });
  const [fornecedorParaCotacao, setFornecedorParaCotacao] = useState('');
  const [fornecedores, setFornecedores] = useState<any[]>([]);

  const parceirosUrl = apiPath('parceiros');
  const getParceirosUrl = () => {
    if (parceirosUrl.startsWith('http')) {
      const u = new URL(parceirosUrl);
      if (filtroParceiro.status !== 'todos') u.searchParams.set('ativo', filtroParceiro.status === 'ativos' ? 'true' : 'false');
      if (filtroParceiro.busca) u.searchParams.set('busca', filtroParceiro.busca);
      if (filtroParceiro.tipo) u.searchParams.set('tipo', filtroParceiro.tipo);
      return u.toString();
    }
    const params = new URLSearchParams();
    if (filtroParceiro.status !== 'todos') params.set('ativo', filtroParceiro.status === 'ativos' ? 'true' : 'false');
    if (filtroParceiro.busca) params.set('busca', filtroParceiro.busca);
    if (filtroParceiro.tipo) params.set('tipo', filtroParceiro.tipo);
    const q = params.toString();
    return q ? `${parceirosUrl}?${q}` : parceirosUrl;
  };

  useEffect(() => {
    if (tab === 'parceiros') loadParceiros();
  }, [tab, filtroParceiro.busca, filtroParceiro.status, filtroParceiro.tipo]);

  useEffect(() => {
    if (tab === 'solicitacoes' || tab === 'cotacoes' || tab === 'pedidos' || tab === 'recebimentos' || tab === 'contas-pagar') {
      (async () => {
        try {
          const [rProj, rAreas, rVol, rProd, rPar] = await Promise.all([
            fetch(apiPath('projetos')),
            fetch(apiPath('areas-projeto')),
            fetch(apiPath('voluntarios')),
            fetch(apiPath('produtos')),
            fetch(apiPath('parceiros') + '?tipo=fornecedor')
          ]);
          if (rProj.ok) setProjetos(await rProj.json().then(d => Array.isArray(d) ? d : []));
          if (rAreas.ok) setAreasProjeto(await rAreas.json().then(d => Array.isArray(d) ? d : []));
          if (rVol.ok) setVoluntarios(await rVol.json().then(d => Array.isArray(d) ? d : []));
          if (rProd.ok) setProdutos(await rProd.json().then(d => Array.isArray(d) ? d : []));
          if (rPar.ok) setFornecedores(await rPar.json().then(d => Array.isArray(d) ? d : []));
        } catch (_) {}
      })();
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'solicitacoes') loadSolicitacoes();
  }, [tab, filtroSolicitacao.projeto_id, filtroSolicitacao.status]);

  useEffect(() => {
    if (tab === 'cotacoes') loadCotacoes();
  }, [tab, filtroCotacao.solicitacao_id, filtroCotacao.status]);

  useEffect(() => {
    if (tab === 'pedidos') loadPedidos();
  }, [tab, filtroPedido.status, filtroPedido.fornecedor_id]);

  useEffect(() => {
    if (tab === 'recebimentos') { loadRecebimentos(); loadPedidos(); }
  }, [tab]);

  useEffect(() => {
    if (tab === 'contas-pagar') {
      (async () => {
        const rContas = await fetch(apiPath('contas-bancarias?ativo=true'));
        if (rContas.ok) setContasBancarias(await rContas.json().catch(() => []));
      })();
      loadDashboardContas();
      loadContasPagar();
    }
  }, [tab, filtroContas.status, filtroContas.fornecedor_id]);

  const loadSolicitacoes = async () => {
    setLoading(true); setErro('');
    try {
      const params = new URLSearchParams();
      if (filtroSolicitacao.projeto_id) params.set('projeto_id', filtroSolicitacao.projeto_id);
      if (filtroSolicitacao.status) params.set('status', filtroSolicitacao.status);
      const r = await fetch(apiPath('solicitacoes-compra') + (params.toString() ? '?' + params : ''));
      const data = await r.json().catch(() => []);
      setSolicitacoes(Array.isArray(data) ? data : []);
    } catch (e: any) { setErro(e?.message || 'Erro'); setSolicitacoes([]); } finally { setLoading(false); }
  };

  const loadCotacoes = async () => {
    setLoading(true); setErro('');
    try {
      const params = new URLSearchParams();
      if (filtroCotacao.solicitacao_id) params.set('solicitacao_id', filtroCotacao.solicitacao_id);
      if (filtroCotacao.status) params.set('status', filtroCotacao.status);
      const r = await fetch(apiPath('cotacoes') + (params.toString() ? '?' + params : ''));
      const data = await r.json().catch(() => []);
      setCotacoes(Array.isArray(data) ? data : []);
    } catch (e: any) { setErro(e?.message || 'Erro'); setCotacoes([]); } finally { setLoading(false); }
  };

  const loadPedidos = async () => {
    setLoading(true); setErro('');
    try {
      const params = new URLSearchParams();
      if (filtroPedido.status) params.set('status', filtroPedido.status);
      if (filtroPedido.fornecedor_id) params.set('fornecedor_id', filtroPedido.fornecedor_id);
      const r = await fetch(apiPath('pedidos-compra') + (params.toString() ? '?' + params : ''));
      const data = await r.json().catch(() => []);
      setPedidos(Array.isArray(data) ? data : []);
    } catch (e: any) { setErro(e?.message || 'Erro'); setPedidos([]); } finally { setLoading(false); }
  };

  const loadRecebimentos = async () => {
    setLoading(true); setErro('');
    try {
      const r = await fetch(apiPath('recebimentos'));
      const data = await r.json().catch(() => []);
      setRecebimentos(Array.isArray(data) ? data : []);
    } catch (e: any) { setErro(e?.message || 'Erro'); setRecebimentos([]); } finally { setLoading(false); }
  };

  const loadDashboardContas = async () => {
    try {
      const r = await fetch(apiPath('contas-pagar/dashboard'));
      if (r.ok) setDashboardContas(await r.json());
    } catch (_) { setDashboardContas(null); }
  };

  const loadContasPagar = async () => {
    setLoading(true); setErro('');
    try {
      const params = new URLSearchParams();
      if (filtroContas.status) params.set('status', filtroContas.status);
      if (filtroContas.fornecedor_id) params.set('fornecedor_id', filtroContas.fornecedor_id);
      const r = await fetch(apiPath('contas-pagar') + (params.toString() ? '?' + params : ''));
      const data = await r.json().catch(() => []);
      setContasPagar(Array.isArray(data) ? data : []);
    } catch (e: any) { setErro(e?.message || 'Erro'); setContasPagar([]); } finally { setLoading(false); }
  };

  const loadParceiros = async () => {
    setLoading(true);
    setErro('');
    try {
      const r = await fetch(getParceirosUrl());
      if (!r.ok) throw new Error('Erro ao carregar parceiros');
      const data = await r.json();
      setParceiros(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErro(e?.message || 'Erro ao carregar');
      setParceiros([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarCep = async () => {
    const cep = (fParceiro.cep || '').replace(/\D/g, '');
    if (cep.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (!d.erro) {
        setFParceiro(prev => ({
          ...prev,
          logradouro: d.logradouro || prev.logradouro,
          bairro: d.bairro || prev.bairro,
          cidade: d.localidade || prev.cidade,
          estado: d.uf || prev.estado,
        }));
      }
    } catch (_) {}
  };

  const salvarParceiro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fParceiro.razao_social?.trim()) {
      setErro('Razão social é obrigatória');
      return;
    }
    if (!fParceiro.eh_fornecedor && !fParceiro.eh_cliente && !fParceiro.eh_entidade) {
      setErro('Selecione pelo menos um tipo de parceiro (Fornecedor, Cliente ou Entidade)');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      const payload = {
        razao_social: fParceiro.razao_social.trim(),
        nome_fantasia: fParceiro.nome_fantasia || null,
        cnpj: fParceiro.cnpj?.replace(/\D/g, '') || null,
        cpf: fParceiro.cpf?.replace(/\D/g, '') || null,
        tipo: fParceiro.tipo,
        inscricao_estadual: fParceiro.inscricao_estadual || null,
        telefone: fParceiro.telefone?.replace(/\D/g, '') || null,
        celular: fParceiro.celular?.replace(/\D/g, '') || null,
        email: fParceiro.email || null,
        site: fParceiro.site || null,
        cep: fParceiro.cep?.replace(/\D/g, '') || null,
        logradouro: fParceiro.logradouro || null,
        numero: fParceiro.numero || null,
        complemento: fParceiro.complemento || null,
        bairro: fParceiro.bairro || null,
        cidade: fParceiro.cidade || null,
        estado: fParceiro.estado || null,
        banco: fParceiro.banco || null,
        agencia: fParceiro.agencia || null,
        conta: fParceiro.conta || null,
        pix: fParceiro.pix || null,
        contato_comercial: fParceiro.contato_comercial || null,
        email_comercial: fParceiro.email_comercial || null,
        telefone_comercial: fParceiro.telefone_comercial?.replace(/\D/g, '') || null,
        observacoes: fParceiro.observacoes || null,
        ativo: fParceiro.ativo,
        eh_fornecedor: fParceiro.eh_fornecedor,
        eh_cliente: fParceiro.eh_cliente,
        eh_entidade: fParceiro.eh_entidade,
      };
      const url = fParceiro.id ? `${parceirosUrl}/${fParceiro.id}` : parceirosUrl;
      const method = fParceiro.id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || `Erro ${res.status}`);
      setFParceiro(emptyParceiro);
      await loadParceiros();
    } catch (e: any) {
      const msg = e?.message || 'Erro ao salvar';
      setErro(msg);
      console.error('Erro ao salvar parceiro:', e);
    } finally {
      setSalvando(false);
    }
  };

  const inativarParceiro = async (id: number) => {
    if (!confirm('Inativar este parceiro?')) return;
    try {
      const res = await fetch(`${parceirosUrl}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao inativar');
      await loadParceiros();
      if (fParceiro.id === id) setFParceiro(emptyParceiro);
    } catch (e: any) {
      setErro(e?.message || 'Erro');
    }
  };

  const ativarParceiro = async (id: number) => {
    try {
      const p = parceiros.find(x => x.id === id);
      if (!p) return;
      const res = await fetch(`${parceirosUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...p, ativo: true, eh_fornecedor: p.eh_fornecedor !== false, eh_cliente: p.eh_cliente === true, eh_entidade: p.eh_entidade === true }),
      });
      if (!res.ok) throw new Error('Erro ao ativar');
      await loadParceiros();
    } catch (e: any) {
      setErro(e?.message || 'Erro');
    }
  };

  const editarParceiro = (p: any) => {
    setFParceiro({
      id: p.id,
      razao_social: p.razao_social || p.nome || '',
      nome_fantasia: p.nome_fantasia || '',
      cnpj: p.cnpj ? formatarCNPJ(p.cnpj) : '',
      cpf: p.cpf ? formatarCPF(p.cpf) : '',
      tipo: p.tipo || 'juridica',
      inscricao_estadual: p.inscricao_estadual || '',
      telefone: p.telefone ? formatarTelefone(p.telefone) : '',
      celular: p.celular ? formatarCelular(p.celular) : '',
      email: p.email || '',
      site: p.site || '',
      cep: p.cep ? formatarCEP(p.cep) : '',
      logradouro: p.logradouro || '',
      numero: p.numero || '',
      complemento: p.complemento || '',
      bairro: p.bairro || '',
      cidade: p.cidade || '',
      estado: p.estado || '',
      banco: p.banco || '',
      agencia: p.agencia || '',
      conta: p.conta || '',
      pix: p.pix || '',
      contato_comercial: p.contato_comercial || '',
      email_comercial: p.email_comercial || '',
      telefone_comercial: p.telefone_comercial ? formatarTelefone(p.telefone_comercial) : '',
      observacoes: p.observacoes || '',
      ativo: p.ativo !== false,
      eh_fornecedor: p.eh_fornecedor === true,
      eh_cliente: p.eh_cliente === true,
      eh_entidade: p.eh_entidade === true,
    });
  };

  return (
    <div className="page-container" style={{ fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <Link href="/portal" style={{ color: '#005daa', textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>← Portal</Link>
      <h1 style={{ color: '#005daa', margin: '0 0 16px 0' }}>🛒 Gestão de Compras (ERP)</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, padding: 16, background: '#f8f9fa', borderRadius: 8, flexWrap: 'wrap' }}>
        <Link href="/financeiro-consolidado" style={{ textDecoration: 'none' }}>
          <button style={{ background: '#17a2b8', color: 'white', padding: '10px 16px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>💰 Ver Financeiro Consolidado</button>
        </Link>
        <Link href="/financeiro" style={{ textDecoration: 'none' }}>
          <button style={{ background: '#6f42c1', color: 'white', padding: '10px 16px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>📊 Ver Financeiro</button>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#eee', padding: '6px', borderRadius: '10px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: '1 1 auto',
              minWidth: '100px',
              padding: '12px 16px',
              border: 'none',
              borderRadius: '8px',
              background: tab === t ? '#005daa' : 'transparent',
              color: tab === t ? '#fff' : '#333',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {t === 'parceiros' ? 'Parceiros' : t === 'contas-pagar' ? 'Contas a Pagar' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'parceiros' && (
        <>
          {erro && <div style={{ padding: '12px', background: '#fee', color: '#c00', borderRadius: '8px', marginBottom: '16px' }}>{erro}</div>}

          <div className="resp-grid-aside-420">
            {/* Lista */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                  placeholder="Buscar (razão social, fantasia, CNPJ)"
                  value={filtroParceiro.busca}
                  onChange={e => setFiltroParceiro(prev => ({ ...prev, busca: e.target.value }))}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', flex: '1', minWidth: '200px' }}
                />
                <select
                  value={filtroParceiro.tipo}
                  onChange={e => setFiltroParceiro(prev => ({ ...prev, tipo: e.target.value as any }))}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc' }}
                >
                  <option value="">Todos os tipos</option>
                  <option value="fornecedor">Fornecedores</option>
                  <option value="cliente">Clientes</option>
                  <option value="entidade">Entidades</option>
                </select>
                <select
                  value={filtroParceiro.status}
                  onChange={e => setFiltroParceiro(prev => ({ ...prev, status: e.target.value as any }))}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc' }}
                >
                  <option value="todos">Todos</option>
                  <option value="ativos">Ativos</option>
                  <option value="inativos">Inativos</option>
                </select>
              </div>
              {loading ? (
                <p style={{ color: '#666' }}>Carregando...</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>CNPJ/CPF</th>
                        <th style={{ padding: '10px' }}>Razão Social</th>
                        <th style={{ padding: '10px' }}>Nome Fantasia</th>
                        <th style={{ padding: '10px' }}>Tipo</th>
                        <th style={{ padding: '10px' }}>Telefone</th>
                        <th style={{ padding: '10px' }}>Cidade</th>
                        <th style={{ padding: '10px' }}>Status</th>
                        <th style={{ padding: '10px' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parceiros.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px' }}>{p.cnpj ? formatarCNPJ(p.cnpj) : (p.cpf ? formatarCPF(p.cpf) : '-')}</td>
                          <td style={{ padding: '10px' }}>{p.razao_social || p.nome || '-'}</td>
                          <td style={{ padding: '10px' }}>{p.nome_fantasia || '-'}</td>
                          <td style={{ padding: '10px' }}>
                            {p.eh_fornecedor && <span style={{ marginRight: 4, padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500, background: '#007bff', color: '#fff' }}>Fornecedor</span>}
                            {p.eh_cliente && <span style={{ marginRight: 4, padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500, background: '#28a745', color: '#fff' }}>Cliente</span>}
                            {p.eh_entidade && <span style={{ marginRight: 4, padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500, background: '#6f42c1', color: '#fff' }}>Entidade</span>}
                            {!p.eh_fornecedor && !p.eh_cliente && !p.eh_entidade && '-'}
                          </td>
                          <td style={{ padding: '10px' }}>{p.telefone ? formatarTelefone(p.telefone) : (p.celular ? formatarCelular(p.celular) : '-')}</td>
                          <td style={{ padding: '10px' }}>{p.cidade || '-'}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              background: p.ativo !== false ? '#d4edda' : '#e2e2e2',
                              color: p.ativo !== false ? '#155724' : '#666',
                            }}>
                              {p.ativo !== false ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td style={{ padding: '10px' }}>
                            <button type="button" onClick={() => editarParceiro(p)} style={{ marginRight: '6px', padding: '6px 10px', background: '#005daa', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Editar</button>
                            {p.ativo !== false ? (
                              <button type="button" onClick={() => inativarParceiro(p.id)} style={{ padding: '6px 10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Inativar</button>
                            ) : (
                              <button type="button" onClick={() => ativarParceiro(p.id)} style={{ padding: '6px 10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Ativar</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!loading && parceiros.length === 0 && <p style={{ padding: '20px', color: '#666' }}>Nenhum parceiro encontrado.</p>}
            </div>

            {/* Formulário */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', maxHeight: '85vh', overflowY: 'auto' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#333' }}>{fParceiro.id ? 'Editar Parceiro' : 'Novo Parceiro'}</h2>
              <form onSubmit={salvarParceiro}>
                {/* TIPOS DE PARCEIRO - PRIMEIRA COISA */}
                <div style={{ marginBottom: 20, padding: 16, background: '#f8f9fa', borderRadius: 8, border: '2px solid #dee2e6' }}>
                  <label style={{ fontWeight: 'bold', fontSize: 14, display: 'block', marginBottom: 12, color: '#495057' }}>Tipo de Parceiro: *</label>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input type="checkbox" checked={fParceiro.eh_fornecedor} onChange={e => setFParceiro(prev => ({ ...prev, eh_fornecedor: e.target.checked }))} style={{ marginRight: 8, width: 18, height: 18 }} />
                      <span style={{ fontSize: 14, background: '#007bff', color: 'white', padding: '4px 10px', borderRadius: 12, fontWeight: 500 }}>Fornecedor</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input type="checkbox" checked={fParceiro.eh_cliente} onChange={e => setFParceiro(prev => ({ ...prev, eh_cliente: e.target.checked }))} style={{ marginRight: 8, width: 18, height: 18 }} />
                      <span style={{ fontSize: 14, background: '#28a745', color: 'white', padding: '4px 10px', borderRadius: 12, fontWeight: 500 }}>Cliente</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input type="checkbox" checked={fParceiro.eh_entidade} onChange={e => setFParceiro(prev => ({ ...prev, eh_entidade: e.target.checked }))} style={{ marginRight: 8, width: 18, height: 18 }} />
                      <span style={{ fontSize: 14, background: '#6f42c1', color: 'white', padding: '4px 10px', borderRadius: 12, fontWeight: 500 }}>Entidade</span>
                    </label>
                  </div>
                  <small style={{ display: 'block', marginTop: 8, color: '#6c757d', fontSize: 12 }}>Marque pelo menos um tipo. Um parceiro pode ser fornecedor e cliente ao mesmo tempo.</small>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Pessoa</label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label><input type="radio" name="tipo" checked={fParceiro.tipo === 'juridica'} onChange={() => setFParceiro(prev => ({ ...prev, tipo: 'juridica' }))} /> Jurídica</label>
                    <label><input type="radio" name="tipo" checked={fParceiro.tipo === 'fisica'} onChange={() => setFParceiro(prev => ({ ...prev, tipo: 'fisica' }))} /> Física</label>
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Razão Social *</label>
                  <input required value={fParceiro.razao_social} onChange={e => setFParceiro(prev => ({ ...prev, razao_social: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} placeholder="Razão social" />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Nome Fantasia</label>
                  <input value={fParceiro.nome_fantasia} onChange={e => setFParceiro(prev => ({ ...prev, nome_fantasia: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} placeholder="Nome fantasia" />
                </div>
                {fParceiro.tipo === 'juridica' && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px' }}>CNPJ</label>
                    <input value={fParceiro.cnpj} onChange={e => setFParceiro(prev => ({ ...prev, cnpj: formatarCNPJ(e.target.value) }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} placeholder="00.000.000/0000-00" maxLength={18} />
                  </div>
                )}
                {fParceiro.tipo === 'fisica' && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px' }}>CPF</label>
                    <input value={fParceiro.cpf} onChange={e => setFParceiro(prev => ({ ...prev, cpf: formatarCPF(e.target.value) }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} placeholder="000.000.000-00" maxLength={14} />
                  </div>
                )}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Inscrição Estadual</label>
                  <input value={fParceiro.inscricao_estadual} onChange={e => setFParceiro(prev => ({ ...prev, inscricao_estadual: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
                <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #eee' }} />
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Contato</h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Telefone</label>
                  <input value={fParceiro.telefone} onChange={e => setFParceiro(prev => ({ ...prev, telefone: formatarTelefone(e.target.value) }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} placeholder="(00) 0000-0000" maxLength={14} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Celular</label>
                  <input value={fParceiro.celular} onChange={e => setFParceiro(prev => ({ ...prev, celular: formatarCelular(e.target.value) }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} placeholder="(00) 00000-0000" maxLength={15} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>E-mail</label>
                  <input type="email" value={fParceiro.email} onChange={e => setFParceiro(prev => ({ ...prev, email: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Site</label>
                  <input value={fParceiro.site} onChange={e => setFParceiro(prev => ({ ...prev, site: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
                <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #eee' }} />
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Endereço</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px' }}>CEP</label>
                    <input value={fParceiro.cep} onChange={e => setFParceiro(prev => ({ ...prev, cep: formatarCEP(e.target.value) }))} onBlur={buscarCep} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} placeholder="00000-000" maxLength={9} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px' }}>Número</label>
                    <input value={fParceiro.numero} onChange={e => setFParceiro(prev => ({ ...prev, numero: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Logradouro</label>
                  <input value={fParceiro.logradouro} onChange={e => setFParceiro(prev => ({ ...prev, logradouro: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Complemento</label>
                  <input value={fParceiro.complemento} onChange={e => setFParceiro(prev => ({ ...prev, complemento: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px' }}>Bairro</label>
                    <input value={fParceiro.bairro} onChange={e => setFParceiro(prev => ({ ...prev, bairro: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px' }}>Cidade</label>
                    <input value={fParceiro.cidade} onChange={e => setFParceiro(prev => ({ ...prev, cidade: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px' }}>Estado</label>
                    <select value={fParceiro.estado} onChange={e => setFParceiro(prev => ({ ...prev, estado: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                      <option value="">UF</option>
                      {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>
                <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #eee' }} />
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Dados bancários</h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Banco</label>
                  <input value={fParceiro.banco} onChange={e => setFParceiro(prev => ({ ...prev, banco: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px' }}>Agência</label>
                    <input value={fParceiro.agencia} onChange={e => setFParceiro(prev => ({ ...prev, agencia: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px' }}>Conta</label>
                    <input value={fParceiro.conta} onChange={e => setFParceiro(prev => ({ ...prev, conta: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Chave PIX</label>
                  <input value={fParceiro.pix} onChange={e => setFParceiro(prev => ({ ...prev, pix: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
                <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #eee' }} />
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Contato comercial</h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Nome do contato</label>
                  <input value={fParceiro.contato_comercial} onChange={e => setFParceiro(prev => ({ ...prev, contato_comercial: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>E-mail comercial</label>
                  <input type="email" value={fParceiro.email_comercial} onChange={e => setFParceiro(prev => ({ ...prev, email_comercial: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Telefone comercial</label>
                  <input value={fParceiro.telefone_comercial} onChange={e => setFParceiro(prev => ({ ...prev, telefone_comercial: formatarTelefone(e.target.value) }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Observações</label>
                  <textarea value={fParceiro.observacoes} onChange={e => setFParceiro(prev => ({ ...prev, observacoes: e.target.value }))} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={fParceiro.ativo} onChange={e => setFParceiro(prev => ({ ...prev, ativo: e.target.checked }))} />
                    Ativo
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="submit" disabled={salvando} style={{ padding: '12px 24px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: salvando ? 'not-allowed' : 'pointer' }}>{salvando ? 'Salvando...' : 'SALVAR'}</button>
                  <button type="button" onClick={() => setFParceiro(emptyParceiro)} style={{ padding: '12px 24px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ NOVO PARCEIRO</button>
                  {fParceiro.id && (
                    <button type="button" onClick={() => setFParceiro(emptyParceiro)} style={{ padding: '12px 24px', background: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }}>CANCELAR</button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Aba Solicitações */}
      {tab === 'solicitacoes' && (
        <>
          {erro && <div style={{ padding: '12px', background: '#fee', color: '#c00', borderRadius: '8px', marginBottom: '16px' }}>{erro}</div>}
          <div className="resp-grid-aside-440">
            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <select value={filtroSolicitacao.projeto_id} onChange={e => setFiltroSolicitacao(p => ({ ...p, projeto_id: e.target.value }))} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc' }}>
                  <option value="">Todos os projetos</option>
                  {projetos.map(pr => <option key={pr.id} value={pr.id}>{pr.nome}</option>)}
                </select>
                <select value={filtroSolicitacao.status} onChange={e => setFiltroSolicitacao(p => ({ ...p, status: e.target.value }))} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc' }}>
                  <option value="">Todos status</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="enviada">Enviada</option>
                  <option value="em_cotacao">Em cotação</option>
                  <option value="aprovada">Aprovada</option>
                </select>
              </div>
              {loading ? <p>Carregando...</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead><tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Número</th>
                      <th style={{ padding: '10px' }}>Projeto</th>
                      <th style={{ padding: '10px' }}>Requisitante</th>
                      <th style={{ padding: '10px' }}>Status</th>
                      <th style={{ padding: '10px' }}>Total</th>
                      <th style={{ padding: '10px' }}>Ações</th>
                    </tr></thead>
                    <tbody>
                      {solicitacoes.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px' }}>{s.numero}</td>
                          <td style={{ padding: '10px' }}>{s.projeto_nome || '-'}</td>
                          <td style={{ padding: '10px' }}>{s.requisitante_nome || '-'}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', background: s.status === 'rascunho' ? '#e2e2e2' : s.status === 'enviada' ? '#cce5ff' : s.status === 'em_cotacao' ? '#ffe0cc' : '#d4edda', color: s.status === 'rascunho' ? '#666' : s.status === 'aprovada' ? '#155724' : '#004085' }}>{s.status}</span>
                          </td>
                          <td style={{ padding: '10px' }}>{formatarMoeda(s.valor_total)}</td>
                          <td style={{ padding: '10px' }}>
                            <button type="button" onClick={async () => { setLoading(true); try { const r = await fetch(apiPath(`solicitacoes-compra/${s.id}`)); const d = await r.json(); setSolicitacaoSelecionada(d); setFSolicitacao({ ...d, itens: d.itens || [] }); } catch (_) {} finally { setLoading(false); } }} style={{ marginRight: 6, padding: '6px 10px', background: '#005daa', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Abrir</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!loading && solicitacoes.length === 0 && <p style={{ padding: '20px', color: '#666' }}>Nenhuma solicitação.</p>}
            </div>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', maxHeight: '85vh', overflowY: 'auto' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>{solicitacaoSelecionada ? `Solicitação ${solicitacaoSelecionada.numero}` : 'Nova Solicitação'}</h2>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Projeto *</label>
                <select value={fSolicitacao.projeto_id || ''} onChange={e => setFSolicitacao(p => ({ ...p, projeto_id: e.target.value ? Number(e.target.value) : '' }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
                  <option value="">Selecione</option>
                  {projetos.map(pr => <option key={pr.id} value={pr.id}>{pr.nome}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Área</label>
                <select value={fSolicitacao.area_projeto_id || ''} onChange={e => setFSolicitacao(p => ({ ...p, area_projeto_id: e.target.value ? Number(e.target.value) : '' }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
                  <option value="">Selecione</option>
                  {areasProjeto.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Requisitante *</label>
                <select value={fSolicitacao.requisitante_id || ''} onChange={e => setFSolicitacao(p => ({ ...p, requisitante_id: e.target.value ? Number(e.target.value) : '' }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
                  <option value="">Selecione</option>
                  {voluntarios.map(v => <option key={v.id} value={v.id}>{v.nome_completo || v.nome || v.id}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Data</label>
                <input type="date" value={(fSolicitacao.data_solicitacao || '').toString().slice(0, 10)} onChange={e => setFSolicitacao(p => ({ ...p, data_solicitacao: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Justificativa</label>
                <textarea value={fSolicitacao.justificativa || ''} onChange={e => setFSolicitacao(p => ({ ...p, justificativa: e.target.value }))} rows={2} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Itens</label>
                <button type="button" onClick={() => setFSolicitacao(p => ({ ...p, itens: [...(p.itens || []), { produto_base_id: '', descricao: '', quantidade: 1, unidade: 'UN', preco_estimado: 0, observacoes: '' }] }))} style={{ padding: '8px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>+ Adicionar item</button>
              </div>
              {(fSolicitacao.itens || []).length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 12 }}>
                  <thead><tr style={{ background: '#f0f0f0' }}><th style={{ padding: 8 }}>Produto</th><th style={{ padding: 8 }}>Qtd</th><th style={{ padding: 8 }}>Preço est.</th><th style={{ padding: 8 }}>Valor</th><th style={{ padding: 8 }}></th></tr></thead>
                  <tbody>
                    {(fSolicitacao.itens || []).map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td style={{ padding: 8 }}>
                          <select value={item.produto_base_id || ''} onChange={e => { const itens = [...(fSolicitacao.itens || [])]; itens[idx] = { ...itens[idx], produto_base_id: e.target.value ? Number(e.target.value) : '', descricao: produtos.find(p => p.id === Number(e.target.value))?.nome || itens[idx].descricao }; setFSolicitacao(p => ({ ...p, itens })); }} style={{ width: '100%', padding: 6 }}>
                            <option value="">--</option>
                            {produtos.map(pr => <option key={pr.id} value={pr.id}>{pr.nome}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: 8 }}><input type="number" min={0.01} step={0.01} value={item.quantidade ?? 1} onChange={e => { const itens = [...(fSolicitacao.itens || [])]; itens[idx] = { ...itens[idx], quantidade: parseFloat(e.target.value) || 0 }; setFSolicitacao(p => ({ ...p, itens })); }} style={{ width: 60, padding: 6 }} /></td>
                        <td style={{ padding: 8 }}><input type="number" min={0} step={0.01} value={item.preco_estimado ?? 0} onChange={e => { const itens = [...(fSolicitacao.itens || [])]; itens[idx] = { ...itens[idx], preco_estimado: parseFloat(e.target.value) || 0 }; setFSolicitacao(p => ({ ...p, itens })); }} style={{ width: 80, padding: 6 }} /></td>
                        <td style={{ padding: 8 }}>{formatarMoeda((item.quantidade || 0) * (item.preco_estimado || 0))}</td>
                        <td style={{ padding: 8 }}><button type="button" onClick={() => setFSolicitacao(p => ({ ...p, itens: (p.itens || []).filter((_: any, i: number) => i !== idx) }))} style={{ padding: 4, background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Remover</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p style={{ fontWeight: 'bold', marginBottom: 12 }}>Total: {formatarMoeda((fSolicitacao.itens || []).reduce((s: number, i: any) => s + (parseFloat(i.quantidade) || 0) * (parseFloat(i.preco_estimado) || 0), 0))}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" disabled={salvando} onClick={async () => { if (!fSolicitacao.projeto_id || !fSolicitacao.requisitante_id || !(fSolicitacao.itens || []).length) { setErro('Projeto, requisitante e pelo menos um item são obrigatórios'); return; } setSalvando(true); setErro(''); try { const url = fSolicitacao.id ? apiPath(`solicitacoes-compra/${fSolicitacao.id}`) : apiPath('solicitacoes-compra'); const method = fSolicitacao.id ? 'PUT' : 'POST'; const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fSolicitacao, status: 'rascunho', itens: (fSolicitacao.itens || []).map((i: any) => ({ ...i, produto_base_id: i.produto_base_id || null, quantidade: parseFloat(i.quantidade) || 0, preco_estimado: parseFloat(i.preco_estimado) || 0 })) }) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data?.error || res.status); setFSolicitacao({ projeto_id: '', area_projeto_id: '', requisitante_id: '', data_solicitacao: new Date().toISOString().slice(0, 10), justificativa: '', status: 'rascunho', itens: [] }); setSolicitacaoSelecionada(null); loadSolicitacoes(); } catch (e: any) { setErro(e?.message || 'Erro'); } finally { setSalvando(false); } }} style={{ padding: '10px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 8, cursor: salvando ? 'not-allowed' : 'pointer' }}>{salvando ? 'Salvando...' : 'SALVAR RASCUNHO'}</button>
                <button type="button" disabled={salvando} onClick={async () => { if (!fSolicitacao.projeto_id || !fSolicitacao.requisitante_id || !(fSolicitacao.itens || []).length) { setErro('Projeto, requisitante e pelo menos um item são obrigatórios'); return; } setSalvando(true); setErro(''); try { const url = fSolicitacao.id ? apiPath(`solicitacoes-compra/${fSolicitacao.id}`) : apiPath('solicitacoes-compra'); const method = fSolicitacao.id ? 'PUT' : 'POST'; const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fSolicitacao, status: 'enviada', itens: (fSolicitacao.itens || []).map((i: any) => ({ ...i, produto_base_id: i.produto_base_id || null, quantidade: parseFloat(i.quantidade) || 0, preco_estimado: parseFloat(i.preco_estimado) || 0 })) }) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data?.error || res.status); setFSolicitacao({ projeto_id: '', area_projeto_id: '', requisitante_id: '', data_solicitacao: new Date().toISOString().slice(0, 10), justificativa: '', status: 'rascunho', itens: [] }); setSolicitacaoSelecionada(null); loadSolicitacoes(); } catch (e: any) { setErro(e?.message || 'Erro'); } finally { setSalvando(false); } }} style={{ padding: '10px 16px', background: '#005daa', color: '#fff', border: 'none', borderRadius: 8, cursor: salvando ? 'not-allowed' : 'pointer' }}>ENVIAR</button>
                {solicitacaoSelecionada && (
                  <>
                    <select value={fornecedorParaCotacao} onChange={e => setFornecedorParaCotacao(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} placeholder="Fornecedor">
                      <option value="">Fornecedor para cotação</option>
                      {fornecedores.map(p => <option key={p.id} value={p.id}>{p.razao_social || p.nome}</option>)}
                    </select>
                    <button type="button" disabled={!fornecedorParaCotacao || salvando} onClick={async () => { setSalvando(true); setErro(''); try { const res = await fetch(apiPath(`solicitacoes-compra/${solicitacaoSelecionada.id}/copiar-cotacao`), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fornecedor_id: Number(fornecedorParaCotacao) }) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data?.error || res.status); setFornecedorParaCotacao(''); loadSolicitacoes(); loadCotacoes(); setTab('cotacoes'); } catch (e: any) { setErro(e?.message || 'Erro'); } finally { setSalvando(false); } }} style={{ padding: '10px 16px', background: '#fd7e14', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>COPIAR P/ COTAÇÃO</button>
                  </>
                )}
                <button type="button" onClick={() => { setFSolicitacao({ projeto_id: '', area_projeto_id: '', requisitante_id: '', data_solicitacao: new Date().toISOString().slice(0, 10), justificativa: '', status: 'rascunho', itens: [] }); setSolicitacaoSelecionada(null); }} style={{ padding: '10px 16px', background: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: 8, cursor: 'pointer' }}>NOVO</button>
                {solicitacaoSelecionada && <button type="button" onClick={async () => { if (!confirm('Excluir esta solicitação?')) return; try { const res = await fetch(apiPath(`solicitacoes-compra/${solicitacaoSelecionada.id}`), { method: 'DELETE' }); if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error); setSolicitacaoSelecionada(null); setFSolicitacao({ projeto_id: '', area_projeto_id: '', requisitante_id: '', data_solicitacao: new Date().toISOString().slice(0, 10), justificativa: '', status: 'rascunho', itens: [] }); loadSolicitacoes(); } catch (e: any) { setErro(e?.message || 'Erro'); } }} style={{ padding: '10px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>EXCLUIR</button>}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Aba Cotações */}
      {tab === 'cotacoes' && (
        <>
          {erro && <div style={{ padding: '12px', background: '#fee', color: '#c00', borderRadius: '8px', marginBottom: '16px' }}>{erro}</div>}
          <div className="resp-grid-aside-440">
            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <select value={filtroCotacao.solicitacao_id} onChange={e => setFiltroCotacao(p => ({ ...p, solicitacao_id: e.target.value }))} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc' }}>
                  <option value="">Todas solicitações</option>
                  {solicitacoes.map(s => <option key={s.id} value={s.id}>{s.numero}</option>)}
                </select>
                <select value={filtroCotacao.status} onChange={e => setFiltroCotacao(p => ({ ...p, status: e.target.value }))} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc' }}>
                  <option value="">Todos status</option>
                  <option value="em_analise">Em análise</option>
                  <option value="vencedora">Vencedora</option>
                </select>
              </div>
              {loading ? <p>Carregando...</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead><tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Número</th>
                      <th style={{ padding: '10px' }}>Solicitação</th>
                      <th style={{ padding: '10px' }}>Fornecedor</th>
                      <th style={{ padding: '10px' }}>Total</th>
                      <th style={{ padding: '10px' }}>Vencedora</th>
                      <th style={{ padding: '10px' }}>Ações</th>
                    </tr></thead>
                    <tbody>
                      {cotacoes.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px' }}>{c.numero}</td>
                          <td style={{ padding: '10px' }}>{c.solicitacao_numero || '-'}</td>
                          <td style={{ padding: '10px' }}>{c.fornecedor_nome || '-'}</td>
                          <td style={{ padding: '10px' }}>{formatarMoeda(c.valor_total)}</td>
                          <td style={{ padding: '10px' }}>{c.vencedora ? <span style={{ padding: '4px 8px', borderRadius: 6, background: '#28a745', color: '#fff', fontWeight: 'bold' }}>Vencedora</span> : '-'}</td>
                          <td style={{ padding: '10px' }}>
                            <button type="button" onClick={async () => { setLoading(true); try { const r = await fetch(apiPath(`cotacoes/${c.id}`)); const d = await r.json(); setCotacaoSelecionada(d); setFCotacao({ ...d, itens: d.itens || [] }); } catch (_) {} finally { setLoading(false); } }} style={{ marginRight: 6, padding: '6px 10px', background: '#005daa', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Abrir</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!loading && cotacoes.length === 0 && <p style={{ padding: '20px', color: '#666' }}>Nenhuma cotação.</p>}
            </div>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', maxHeight: '85vh', overflowY: 'auto' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>{cotacaoSelecionada ? `Cotação ${cotacaoSelecionada.numero}` : 'Nova Cotação'}</h2>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Solicitação *</label>
                <select value={fCotacao.solicitacao_id || ''} onChange={async e => { const id = e.target.value ? Number(e.target.value) : ''; setFCotacao(p => ({ ...p, solicitacao_id: id, itens: [] })); if (id) { try { const r = await fetch(apiPath(`solicitacoes-compra/${id}`)); const d = await r.json(); const itens = (d.itens || []).map((i: any) => ({ solicitacao_item_id: i.id, produto_base_id: i.produto_base_id, descricao: i.descricao || i.produto_nome, quantidade: parseFloat(i.quantidade) || 0, unidade: i.unidade, preco_unitario: 0, valor_total: 0, produto_nome: i.produto_nome })); setFCotacao(prev => ({ ...prev, solicitacao_id: id, itens })); } catch (_) {} } }} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
                  <option value="">Selecione</option>
                  {solicitacoes.map(s => <option key={s.id} value={s.id}>{s.numero}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Fornecedor *</label>
                <select value={fCotacao.fornecedor_id || ''} onChange={e => setFCotacao(p => ({ ...p, fornecedor_id: e.target.value ? Number(e.target.value) : '' }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
                  <option value="">Selecione</option>
                  {fornecedores.map(p => <option key={p.id} value={p.id}>{p.razao_social || p.nome}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Data</label>
                <input type="date" value={(fCotacao.data_cotacao || '').toString().slice(0, 10)} onChange={e => setFCotacao(p => ({ ...p, data_cotacao: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Prazo entrega (dias)</label>
                <input type="number" min={0} value={fCotacao.prazo_entrega ?? ''} onChange={e => setFCotacao(p => ({ ...p, prazo_entrega: e.target.value ? Number(e.target.value) : '' }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Condições de pagamento</label>
                <textarea value={fCotacao.condicoes_pagamento || ''} onChange={e => setFCotacao(p => ({ ...p, condicoes_pagamento: e.target.value }))} rows={2} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              </div>
              {(fCotacao.itens || []).length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 12 }}>
                  <thead><tr style={{ background: '#f0f0f0' }}><th style={{ padding: 8 }}>Descrição</th><th style={{ padding: 8 }}>Qtd</th><th style={{ padding: 8 }}>Preço unit.</th><th style={{ padding: 8 }}>Valor</th></tr></thead>
                  <tbody>
                    {(fCotacao.itens || []).map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td style={{ padding: 8 }}>{item.descricao || item.produto_nome || '-'}</td>
                        <td style={{ padding: 8 }}>{item.quantidade}</td>
                        <td style={{ padding: 8 }}><input type="number" min={0} step={0.01} value={item.preco_unitario ?? 0} onChange={e => { const itens = [...(fCotacao.itens || [])]; itens[idx] = { ...itens[idx], preco_unitario: parseFloat(e.target.value) || 0, valor_total: (itens[idx].quantidade || 0) * (parseFloat(e.target.value) || 0) }; setFCotacao(p => ({ ...p, itens })); }} style={{ width: 90, padding: 6 }} /></td>
                        <td style={{ padding: 8 }}>{formatarMoeda((item.quantidade || 0) * (item.preco_unitario || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p style={{ fontWeight: 'bold', marginBottom: 12 }}>Total: {formatarMoeda((fCotacao.itens || []).reduce((s: number, i: any) => s + (parseFloat(i.quantidade) || 0) * (parseFloat(i.preco_unitario) || 0), 0))}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" disabled={salvando} onClick={async () => { if (!fCotacao.solicitacao_id || !fCotacao.fornecedor_id) { setErro('Solicitação e fornecedor obrigatórios'); return; } setSalvando(true); setErro(''); try { const url = fCotacao.id ? apiPath(`cotacoes/${fCotacao.id}`) : apiPath('cotacoes'); const method = fCotacao.id ? 'PUT' : 'POST'; const body = fCotacao.id ? { ...fCotacao, itens: (fCotacao.itens || []).map((i: any) => ({ ...i, preco_unitario: parseFloat(i.preco_unitario) || 0, valor_total: (parseFloat(i.quantidade) || 0) * (parseFloat(i.preco_unitario) || 0) })) } : { solicitacao_id: fCotacao.solicitacao_id, fornecedor_id: fCotacao.fornecedor_id, data_cotacao: fCotacao.data_cotacao, prazo_entrega: fCotacao.prazo_entrega || null, condicoes_pagamento: fCotacao.condicoes_pagamento || null, itens: (fCotacao.itens || []).map((i: any) => ({ ...i, preco_unitario: parseFloat(i.preco_unitario) || 0, valor_total: (parseFloat(i.quantidade) || 0) * (parseFloat(i.preco_unitario) || 0) })) }; const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data?.error || res.status); setFCotacao({ solicitacao_id: '', fornecedor_id: '', data_cotacao: new Date().toISOString().slice(0, 10), prazo_entrega: '', condicoes_pagamento: '', itens: [] }); setCotacaoSelecionada(null); loadCotacoes(); } catch (e: any) { setErro(e?.message || 'Erro'); } finally { setSalvando(false); } }} style={{ padding: '10px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 8, cursor: salvando ? 'not-allowed' : 'pointer' }}>{salvando ? 'Salvando...' : 'SALVAR'}</button>
                {cotacaoSelecionada && !cotacaoSelecionada.vencedora && <button type="button" disabled={salvando} onClick={async () => { setSalvando(true); setErro(''); try { const res = await fetch(apiPath(`cotacoes/${cotacaoSelecionada.id}/marcar-vencedora`), { method: 'PUT' }); if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error); setCotacaoSelecionada(prev => prev ? { ...prev, vencedora: true } : null); loadCotacoes(); } catch (e: any) { setErro(e?.message || 'Erro'); } finally { setSalvando(false); } }} style={{ padding: '10px 16px', background: '#ffc107', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer' }}>MARCAR VENCEDORA</button>}
                {cotacaoSelecionada && cotacaoSelecionada.vencedora && <button type="button" disabled={salvando} onClick={async () => { setSalvando(true); setErro(''); try { const res = await fetch(apiPath(`cotacoes/${cotacaoSelecionada.id}/gerar-pedido`), { method: 'POST' }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data?.error || res.status); setTab('pedidos'); loadPedidos(); setCotacaoSelecionada(null); setFCotacao({ solicitacao_id: '', fornecedor_id: '', data_cotacao: new Date().toISOString().slice(0, 10), prazo_entrega: '', condicoes_pagamento: '', itens: [] }); } catch (e: any) { setErro(e?.message || 'Erro'); } finally { setSalvando(false); } }} style={{ padding: '10px 16px', background: '#005daa', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>GERAR PEDIDO</button>}
                <button type="button" onClick={() => { setFCotacao({ solicitacao_id: '', fornecedor_id: '', data_cotacao: new Date().toISOString().slice(0, 10), prazo_entrega: '', condicoes_pagamento: '', itens: [] }); setCotacaoSelecionada(null); }} style={{ padding: '10px 16px', background: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: 8, cursor: 'pointer' }}>NOVO</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Aba Pedidos */}
      {tab === 'pedidos' && (
        <>
          {erro && <div style={{ padding: '12px', background: '#fee', color: '#c00', borderRadius: '8px', marginBottom: '16px' }}>{erro}</div>}
          <div className="resp-grid-aside-420">
            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <select value={filtroPedido.status} onChange={e => setFiltroPedido(p => ({ ...p, status: e.target.value }))} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc' }}>
                  <option value="">Todos status</option>
                  <option value="aguardando">Aguardando</option>
                  <option value="parcial">Parcial</option>
                  <option value="recebido">Recebido</option>
                </select>
                <select value={filtroPedido.fornecedor_id} onChange={e => setFiltroPedido(p => ({ ...p, fornecedor_id: e.target.value }))} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc' }}>
                  <option value="">Todos fornecedores</option>
                  {fornecedores.map(f => <option key={f.id} value={f.id}>{f.razao_social || f.nome}</option>)}
                </select>
              </div>
              {loading ? <p>Carregando...</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead><tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Número</th>
                      <th style={{ padding: '10px' }}>Fornecedor</th>
                      <th style={{ padding: '10px' }}>Status</th>
                      <th style={{ padding: '10px' }}>Total</th>
                      <th style={{ padding: '10px' }}>Ações</th>
                    </tr></thead>
                    <tbody>
                      {pedidos.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px' }}>{p.numero}</td>
                          <td style={{ padding: '10px' }}>{p.fornecedor_nome || '-'}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 'bold', background: p.status === 'recebido' ? '#d4edda' : p.status === 'parcial' ? '#fff3cd' : '#e2e2e2', color: p.status === 'recebido' ? '#155724' : '#856404' }}>{p.status}</span>
                          </td>
                          <td style={{ padding: '10px' }}>{formatarMoeda(p.valor_total)}</td>
                          <td style={{ padding: '10px' }}>
                            <button type="button" onClick={async () => { setLoading(true); try { const r = await fetch(apiPath(`pedidos-compra/${p.id}`)); const d = await r.json(); setPedidoSelecionado(d); } catch (_) {} finally { setLoading(false); } }} style={{ padding: '6px 10px', background: '#005daa', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Abrir</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!loading && pedidos.length === 0 && <p style={{ padding: '20px', color: '#666' }}>Nenhum pedido.</p>}
            </div>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', maxHeight: '85vh', overflowY: 'auto' }}>
              {pedidoSelecionado ? (
                <>
                  <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Pedido {pedidoSelecionado.numero}</h2>
                  <p><strong>Fornecedor:</strong> {pedidoSelecionado.fornecedor_nome}</p>
                  <p><strong>Status:</strong> <span style={{ padding: '4px 8px', borderRadius: 6, background: pedidoSelecionado.status === 'recebido' ? '#d4edda' : '#fff3cd', fontWeight: 'bold' }}>{pedidoSelecionado.status}</span></p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
                    <thead><tr style={{ background: '#f0f0f0' }}><th style={{ padding: 8 }}>Produto</th><th style={{ padding: 8 }}>Qtd pedida</th><th style={{ padding: 8 }}>Qtd recebida</th><th style={{ padding: 8 }}>Valor</th></tr></thead>
                    <tbody>
                      {(pedidoSelecionado.itens || []).map((i: any) => (
                        <tr key={i.id}><td style={{ padding: 8 }}>{i.produto_nome || i.descricao}</td><td style={{ padding: 8 }}>{i.quantidade}</td><td style={{ padding: 8 }}>{i.quantidade_recebida ?? 0}</td><td style={{ padding: 8 }}>{formatarMoeda(i.valor_total)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  {pedidoSelecionado.status !== 'recebido' && (
                    <button type="button" onClick={() => { setFRecebimento({ pedido_id: pedidoSelecionado.id, numero_nf: '', data_nf: '', data_recebimento: new Date().toISOString().slice(0, 10), valor_nf: '', observacoes: '', itens: (pedidoSelecionado.itens || []).map((i: any) => ({ pedido_item_id: i.id, quantidade_recebida: Math.max(0, parseFloat(i.quantidade) - parseFloat(i.quantidade_recebida || 0)), observacoes: '' })) }); setTab('recebimentos'); setRecebimentoSelecionado(null); loadRecebimentos(); }} style={{ padding: '12px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>REGISTRAR RECEBIMENTO</button>
                  )}
                </>
              ) : <p style={{ color: '#666' }}>Selecione um pedido na lista.</p>}
            </div>
          </div>
        </>
      )}

      {/* Aba Recebimentos */}
      {tab === 'recebimentos' && (
        <>
          {erro && <div style={{ padding: '12px', background: '#fee', color: '#c00', borderRadius: '8px', marginBottom: '16px' }}>{erro}</div>}
          <div className="resp-grid-aside-400">
            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              {loading ? <p>Carregando...</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead><tr style={{ background: '#f0f0f0', textAlign: 'left' }}><th style={{ padding: '10px' }}>ID</th><th style={{ padding: '10px' }}>Pedido</th><th style={{ padding: '10px' }}>Fornecedor</th><th style={{ padding: '10px' }}>Data</th><th style={{ padding: '10px' }}>Valor NF</th></tr></thead>
                    <tbody>
                      {recebimentos.map(r => (
                        <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px' }}>{r.id}</td>
                          <td style={{ padding: '10px' }}>{r.pedido_numero}</td>
                          <td style={{ padding: '10px' }}>{r.fornecedor_nome}</td>
                          <td style={{ padding: '10px' }}>{(r.data_recebimento || '').toString().slice(0, 10)}</td>
                          <td style={{ padding: '10px' }}>{formatarMoeda(r.valor_nf)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!loading && recebimentos.length === 0 && <p style={{ padding: '20px', color: '#666' }}>Nenhum recebimento.</p>}
            </div>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', maxHeight: '85vh', overflowY: 'auto' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Registrar recebimento</h2>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Pedido *</label>
                <select value={fRecebimento.pedido_id || ''} onChange={async e => { const id = e.target.value ? Number(e.target.value) : ''; setFRecebimento(p => ({ ...p, pedido_id: id })); if (id) { try { const r = await fetch(apiPath(`pedidos-compra/${id}`)); const d = await r.json(); setFRecebimento(prev => ({ ...prev, pedido_id: id, itens: (d.itens || []).map((i: any) => ({ pedido_item_id: i.id, quantidade_recebida: Math.max(0, parseFloat(i.quantidade) - parseFloat(i.quantidade_recebida || 0)), observacoes: '' })) })); } catch (_) {} } }} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}>
                  <option value="">Selecione</option>
                  {pedidos.filter(p => p.status !== 'recebido').map(p => <option key={p.id} value={p.id}>{p.numero} - {p.fornecedor_nome}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Número NF</label>
                <input value={fRecebimento.numero_nf || ''} onChange={e => setFRecebimento(p => ({ ...p, numero_nf: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Data NF / Data recebimento</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="date" value={(fRecebimento.data_nf || '').toString().slice(0, 10)} onChange={e => setFRecebimento(p => ({ ...p, data_nf: e.target.value }))} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
                  <input type="date" value={(fRecebimento.data_recebimento || '').toString().slice(0, 10)} onChange={e => setFRecebimento(p => ({ ...p, data_recebimento: e.target.value }))} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Valor NF (R$)</label>
                <input type="number" step={0.01} min={0} value={fRecebimento.valor_nf ?? ''} onChange={e => setFRecebimento(p => ({ ...p, valor_nf: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Quantidade a receber por item</label>
                {(fRecebimento.itens || []).map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ flex: 1, fontSize: 12 }}>Item {idx + 1}</span>
                    <input type="number" min={0} step={0.01} value={item.quantidade_recebida ?? 0} onChange={e => { const itens = [...(fRecebimento.itens || [])]; itens[idx] = { ...itens[idx], quantidade_recebida: parseFloat(e.target.value) || 0 }; setFRecebimento(p => ({ ...p, itens })); }} style={{ width: 80, padding: 6 }} />
                  </div>
                ))}
              </div>
              <button type="button" disabled={!fRecebimento.pedido_id || salvando} onClick={async () => { setSalvando(true); setErro(''); try { const res = await fetch(apiPath(`pedidos-compra/${fRecebimento.pedido_id}/receber`), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ numero_nf: fRecebimento.numero_nf || null, data_nf: fRecebimento.data_nf || null, data_recebimento: fRecebimento.data_recebimento, valor_nf: fRecebimento.valor_nf || null, observacoes: fRecebimento.observacoes || null, itens: (fRecebimento.itens || []).filter((i: any) => (i.quantidade_recebida || 0) > 0) }) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data?.error || res.status); setFRecebimento({ pedido_id: '', numero_nf: '', data_nf: '', data_recebimento: new Date().toISOString().slice(0, 10), valor_nf: '', observacoes: '', itens: [] }); loadRecebimentos(); loadPedidos(); loadContasPagar(); loadDashboardContas(); } catch (e: any) { setErro(e?.message || 'Erro'); } finally { setSalvando(false); } }} style={{ padding: '12px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 8, cursor: salvando ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>{salvando ? 'Salvando...' : 'CONFIRMAR RECEBIMENTO'}</button>
            </div>
          </div>
        </>
      )}

      {/* Aba Contas a Pagar */}
      {tab === 'contas-pagar' && (
        <>
          {erro && <div style={{ padding: '12px', background: '#fee', color: '#c00', borderRadius: '8px', marginBottom: '16px' }}>{erro}</div>}
          {dashboardContas && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}><div style={{ fontSize: 12, color: '#666' }}>Total aberto</div><div style={{ fontSize: '22px', fontWeight: 'bold', color: '#005daa' }}>{formatarMoeda(dashboardContas.total_aberto)}</div></div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}><div style={{ fontSize: 12, color: '#666' }}>Vencidas</div><div style={{ fontSize: '22px', fontWeight: 'bold', color: '#dc3545' }}>{formatarMoeda(dashboardContas.total_vencidas)}</div></div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}><div style={{ fontSize: 12, color: '#666' }}>A vencer (7 dias)</div><div style={{ fontSize: '22px', fontWeight: 'bold', color: '#fd7e14' }}>{formatarMoeda(dashboardContas.total_a_vencer_7d)}</div></div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}><div style={{ fontSize: 12, color: '#666' }}>Pagas no mês</div><div style={{ fontSize: '22px', fontWeight: 'bold', color: '#28a745' }}>{formatarMoeda(dashboardContas.total_pagas_mes)}</div></div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <select value={filtroContas.status} onChange={e => setFiltroContas(p => ({ ...p, status: e.target.value }))} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc' }}>
              <option value="">Todos status</option>
              <option value="aberto">Aberto</option>
              <option value="parcial">Parcial</option>
              <option value="pago">Pago</option>
            </select>
            <select value={filtroContas.fornecedor_id} onChange={e => setFiltroContas(p => ({ ...p, fornecedor_id: e.target.value }))} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc' }}>
              <option value="">Todos fornecedores</option>
              {fornecedores.map(f => <option key={f.id} value={f.id}>{f.razao_social || f.nome}</option>)}
            </select>
          </div>
          {loading ? <p>Carregando...</p> : (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead><tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Documento</th>
                  <th style={{ padding: '10px' }}>Fornecedor</th>
                  <th style={{ padding: '10px' }}>Emissão</th>
                  <th style={{ padding: '10px' }}>Vencimento</th>
                  <th style={{ padding: '10px' }}>Valor</th>
                  <th style={{ padding: '10px' }}>Pago</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Ações</th>
                </tr></thead>
                <tbody>
                  {contasPagar.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{c.numero_documento || c.id}</td>
                      <td style={{ padding: '10px' }}>{c.fornecedor_nome}</td>
                      <td style={{ padding: '10px' }}>{(c.data_emissao || '').toString().slice(0, 10)}</td>
                      <td style={{ padding: '10px' }}>{(c.data_vencimento || '').toString().slice(0, 10)}</td>
                      <td style={{ padding: '10px' }}>{formatarMoeda(c.valor)}</td>
                      <td style={{ padding: '10px' }}>{formatarMoeda(c.valor_pago)}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 'bold', background: c.status === 'pago' ? '#d4edda' : c.status === 'parcial' ? '#fff3cd' : c.status === 'vencido' ? '#f8d7da' : '#e2e2e2', color: c.status === 'pago' ? '#155724' : c.status === 'parcial' ? '#856404' : '#721c24' }}>{c.status}</span>
                      </td>
                      <td style={{ padding: '10px' }}>{c.status !== 'pago' && <button type="button" onClick={() => setModalPagamento({ aberto: true, conta: c, data_pagamento: new Date().toISOString().slice(0, 10), valor_pago: String(Math.max(0, parseFloat(c.valor) - parseFloat(c.valor_pago || 0))), forma_pagamento: '', conta_bancaria_id: '' })} style={{ padding: '6px 10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Pagar</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && contasPagar.length === 0 && <p style={{ padding: '20px', color: '#666' }}>Nenhuma conta a pagar.</p>}

          {modalPagamento.aberto && modalPagamento.conta && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setModalPagamento(p => ({ ...p, aberto: false }))}>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', minWidth: '360px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ margin: '0 0 16px 0' }}>Registrar pagamento</h3>
                <p style={{ marginBottom: 12 }}>Conta: {modalPagamento.conta.numero_documento} - {formatarMoeda(modalPagamento.conta.valor)} (pago: {formatarMoeda(modalPagamento.conta.valor_pago)})</p>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Conta bancária *</label>
                  <select value={modalPagamento.conta_bancaria_id} onChange={e => setModalPagamento(p => ({ ...p, conta_bancaria_id: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} required>
                    <option value="">Selecione a conta...</option>
                    {contasBancarias.map((cb: any) => <option key={cb.id} value={cb.id}>{cb.nome} — {formatarMoeda(cb.saldo_atual)}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Data</label>
                  <input type="date" value={modalPagamento.data_pagamento} onChange={e => setModalPagamento(p => ({ ...p, data_pagamento: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Valor (R$)</label>
                  <input type="number" step={0.01} min={0} value={modalPagamento.valor_pago} onChange={e => setModalPagamento(p => ({ ...p, valor_pago: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Forma de pagamento</label>
                  <input value={modalPagamento.forma_pagamento} onChange={e => setModalPagamento(p => ({ ...p, forma_pagamento: e.target.value }))} placeholder="Ex: PIX, Transferência" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" disabled={salvando || !modalPagamento.conta_bancaria_id} onClick={async () => { setSalvando(true); setErro(''); try { const res = await fetch(apiPath(`contas-pagar/${modalPagamento.conta.id}/pagar`), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data_pagamento: modalPagamento.data_pagamento, valor_pago: parseFloat(modalPagamento.valor_pago) || 0, forma_pagamento: modalPagamento.forma_pagamento || null, conta_bancaria_id: Number(modalPagamento.conta_bancaria_id) }) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data?.error || res.status); setModalPagamento({ aberto: false, conta: null, data_pagamento: '', valor_pago: '', forma_pagamento: '', conta_bancaria_id: '' }); loadContasPagar(); loadDashboardContas(); } catch (e: any) { setErro(e?.message || 'Erro'); } finally { setSalvando(false); } }} style={{ padding: '10px 20px', background: (salvando || !modalPagamento.conta_bancaria_id) ? '#ccc' : '#28a745', color: '#fff', border: 'none', borderRadius: 8, cursor: (salvando || !modalPagamento.conta_bancaria_id) ? 'not-allowed' : 'pointer' }}>{salvando ? 'Salvando...' : 'CONFIRMAR'}</button>
                  <button type="button" onClick={() => setModalPagamento({ aberto: false, conta: null, data_pagamento: '', valor_pago: '', forma_pagamento: '', conta_bancaria_id: '' })} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Fechar</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

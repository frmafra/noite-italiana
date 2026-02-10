'use client';
import { useEffect, useState } from 'react';

export default function FinanceiroPage() {
  const API_BASE = "http://213.199.51.121:4001";
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [patrocinios, setPatrocinios] = useState<any[]>([]);
  const [recebimentos, setRecebimentos] = useState<any[]>([]);
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [contasPagar, setContasPagar] = useState<any[]>([]);
  const [pagamentosTodos, setPagamentosTodos] = useState<any[]>([]);
  const [dashboardIntegrado, setDashboardIntegrado] = useState<any>(null);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [contasBancarias, setContasBancarias] = useState<any[]>([]);
  const [saldosBancarios, setSaldosBancarios] = useState<{ contas: any[]; total_geral: number } | null>(null);
  
  const [filtro, setFiltro] = useState({ de: '', ate: '' });
  const [dataDe, setDataDe] = useState('');
  const [dataAte, setDataAte] = useState('');

  // Formulários de Inclusão
  const [formPat, setFormPat] = useState({ empresa_nome: '', cota_tipo: 'Ouro', valor_contribuicao: '', projeto_id: '', data_prevista: new Date().toISOString().split('T')[0] });
  const [formRec, setFormRec] = useState({ descricao: '', valor_previsto: '', data_prevista: new Date().toISOString().split('T')[0], projeto_id: '' });
  const [formPag, setFormPag] = useState({ descricao: '', fornecedor: '', valor_previsto: '', data_prevista: new Date().toISOString().split('T')[0], projeto_id: '' });

  const [baixandoId, setBaixandoId] = useState<number | null>(null);
  const [baixandoTipo, setBaixandoTipo] = useState('');
  const [formBaixa, setFormBaixa] = useState({ valor: '', data: new Date().toISOString().split('T')[0], conciliado: false, conta_bancaria_id: '' });
  const [erroBaixa, setErroBaixa] = useState('');

  const carregarDados = async () => {
    try {
      const [resPat, resRec, resPag, resContas, resProj, resPagTodos, resDashInt, resContasBanc, resSaldos] = await Promise.all([
        fetch(`${API_BASE}/api/patrocinios`),
        fetch(`${API_BASE}/api/recebimentos`),
        fetch(`${API_BASE}/api/pagamentos`),
        fetch(`${API_BASE}/api/contas-pagar`),
        fetch(`${API_BASE}/api/projetos`),
        fetch(`${API_BASE}/api/financeiro-integrado/pagamentos-todos`),
        fetch(`${API_BASE}/api/financeiro-integrado/dashboard-integrado`),
        fetch(`${API_BASE}/api/contas-bancarias?ativo=true`),
        fetch(`${API_BASE}/api/contas-bancarias/dashboard/saldos`)
      ]);
      setPatrocinios(await resPat.json().catch(() => []));
      setRecebimentos(await resRec.json().catch(() => []));
      setPagamentos(await resPag.json().catch(() => []));
      setContasPagar(await resContas.json().catch(() => []));
      setProjetos(await resProj.json().catch(() => []));
      setPagamentosTodos(await resPagTodos.json().catch(() => []));
      if (resDashInt.ok) setDashboardIntegrado(await resDashInt.json().catch(() => null));
      if (resContasBanc.ok) setContasBancarias(await resContasBanc.json().catch(() => []));
      if (resSaldos.ok) setSaldosBancarios(await resSaldos.json().catch(() => null));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { carregarDados(); }, []);

  const salvar = async (rota: string, body: any, setForm: any, initial: any) => {
    await fetch(`${API_BASE}/api/${rota}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    setForm(initial);
    carregarDados();
  };

  const formatarMoeda = (v: number) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const formatarDataBR = (iso: string) => iso ? iso.split('T')[0].split('-').reverse().join('/') : '--/--/----';

  const aplicarFiltro = (lista: any[], campoData: string) => {
    if (!filtro.de && !filtro.ate) return lista;
    return lista.filter(i => {
      const d = i[campoData]?.split('T')[0];
      return (!filtro.de || d >= filtro.de) && (!filtro.ate || d <= filtro.ate);
    });
  };

  const executarBaixa = async () => {
    setErroBaixa('');
    const rota = baixandoTipo === 'patrocinio' ? 'patrocinios' : baixandoTipo === 'recebimento' ? 'recebimentos' : 'pagamentos';
    const campoVal = baixandoTipo === 'pagamento' ? 'valor_pago' : 'valor_recebido';
    const campoDat = baixandoTipo === 'pagamento' ? 'data_pagamento' : 'data_recebimento';
    try {
      const res = await fetch(`${API_BASE}/api/${rota}/${baixandoId}/baixar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [campoVal]: formBaixa.valor,
          [campoDat]: formBaixa.data,
          conciliado: formBaixa.conciliado,
          ...(baixandoTipo === 'pagamento' && formBaixa.conta_bancaria_id ? { conta_bancaria_id: Number(formBaixa.conta_bancaria_id) } : {})
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErroBaixa(data?.error || `Erro ${res.status} ao dar baixa`);
        return;
      }
      setBaixandoId(null);
      carregarDados();
    } catch (err: any) {
      setErroBaixa(err?.message || 'Falha de rede ao dar baixa');
    }
  };

  const patsF = aplicarFiltro(patrocinios, 'data_prevista');
  const recsF = aplicarFiltro(recebimentos, 'data_prevista');
  const pagsF = aplicarFiltro(pagamentos, 'data_prevista');
  const contasPagarF = aplicarFiltro(contasPagar, 'data_vencimento');
  const getDataPag = (i: any) => (i.data_vencimento || i.data)?.split?.('T')[0] ?? '';
  const pagamentosTodosF = pagamentosTodos.filter(i => {
    const d = getDataPag(i);
    return (!filtro.de || d >= filtro.de) && (!filtro.ate || d <= filtro.ate);
  });

  const recReal = patsF.filter(p=>p.status_recebimento==='Recebido').reduce((s,p)=>s+Number(p.valor_recebido || 0),0) + recsF.filter(r=>r.status==='Recebido').reduce((s,r)=>s+Number(r.valor_recebido || 0),0);
  const recTotal = patsF.reduce((s,p)=>s+Number(p.valor_contribuicao || 0),0) + recsF.reduce((s,r)=>s+Number(r.valor_previsto || 0),0);
  const pagRealManual = pagsF.filter(p=>p.status==='Pago').reduce((s,p)=>s+Number(p.valor_pago || 0),0);
  const pagTotalManual = pagsF.reduce((s,p)=>s+Number(p.valor_previsto || 0),0);
  const contasPagarReal = contasPagarF.filter(c=>c.status==='pago').reduce((s,c)=>s+Number(c.valor_pago || 0),0);
  const contasPagarTotal = contasPagarF.reduce((s,c)=>s+Number(c.valor || 0),0);
  const pagReal = pagRealManual + contasPagarReal;
  const pagTotal = pagTotalManual + contasPagarTotal;

  return (
    <div className="page-container" style={{ fontFamily:'sans-serif', background:'#f5f5f5', minHeight:'100vh'}}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px', flexWrap:'wrap', gap:'12px'}}>
        <a href="/portal" style={{background:'#333', color:'white', padding:'10px 20px', borderRadius:'8px', textDecoration:'none', fontWeight:'bold'}}>🏠 MENU</a>
        <h1 style={{color:'#d32f2f', margin:0}}>💰 Financeiro Integrado</h1>
      </div>
      <div style={{display:'flex', gap:12, marginBottom:'20px', padding:16, background:'#f8f9fa', borderRadius:8, flexWrap:'wrap'}}>
        <a href="/financeiro-consolidado" style={{textDecoration:'none'}}><button style={{background:'#17a2b8', color:'white', padding:'10px 16px', border:'none', borderRadius:4, cursor:'pointer', fontSize:14, fontWeight:500}}>💰 Financeiro Consolidado</button></a>
        <a href="/compras" style={{textDecoration:'none'}}><button style={{background:'#005daa', color:'white', padding:'10px 16px', border:'none', borderRadius:4, cursor:'pointer', fontSize:14, fontWeight:500}}>🛒 Ver Compras</button></a>
      </div>

      <div style={{background:'#fff', padding:'15px', borderRadius:'8px', marginBottom:'20px', display:'flex', gap:'10px', alignItems:'center'}}>
        <input type="date" onChange={e=>setDataDe(e.target.value)} />
        <input type="date" onChange={e=>setDataAte(e.target.value)} />
        <button onClick={()=>setFiltro({de:dataDe, ate:dataAte})} style={{background:'#2e7d32', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer'}}>FILTRAR</button>
      </div>

      {saldosBancarios && saldosBancarios.contas?.length > 0 && (
        <div style={{ background: 'white', padding: 20, borderRadius: 8, marginBottom: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: 16 }}>🏦 Saldos Bancários</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {saldosBancarios.contas.map((conta: any) => (
              <div key={conta.id} style={{ padding: 16, background: '#f8f9fa', borderRadius: 4, border: '1px solid #dee2e6' }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{conta.nome}</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: Number(conta.saldo_atual) >= 0 ? '#28a745' : '#dc3545' }}>
                  R$ {formatarMoeda(Number(conta.saldo_atual))}
                </div>
              </div>
            ))}
            <div style={{ padding: 16, background: '#005daa', color: 'white', borderRadius: 4 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>TOTAL GERAL</div>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>R$ {formatarMoeda(Number(saldosBancarios.total_geral))}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'flex', gap:'5px', marginBottom:'20px'}}>
        {['dashboard', 'patrocinios', 'recebimentos', 'pagamentos', 'balancete'].map(a => (
          <button key={a} onClick={()=>setAbaAtiva(a)} style={{flex:1, padding:'12px', background: abaAtiva===a?'#d32f2f':'#fff', color: abaAtiva===a?'white':'#333', border:'1px solid #ddd', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>{a.toUpperCase()}</button>
        ))}
      </div>

      <div style={{background:'white', padding:'20px', borderRadius:'12px', boxShadow:'0 4px 10px rgba(0,0,0,0.1)'}}>
        
        {abaAtiva === 'patrocinios' && (
          <div>
            <form onSubmit={e=>{e.preventDefault(); salvar('patrocinios', formPat, setFormPat, {empresa_nome:'', cota_tipo:'Ouro', valor_contribuicao:'', projeto_id:'', data_prevista:new Date().toISOString().split('T')[0]});}} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap:'10px', marginBottom:'20px', background:'#f9f9f9', padding:'15px', borderRadius:'8px'}}>
              <input placeholder="Empresa" value={formPat.empresa_nome} onChange={e=>setFormPat({...formPat, empresa_nome:e.target.value})} required />
              <input type="number" placeholder="Valor" value={formPat.valor_contribuicao} onChange={e=>setFormPat({...formPat, valor_contribuicao:e.target.value})} required />
              <input type="date" value={formPat.data_prevista} onChange={e=>setFormPat({...formPat, data_prevista:e.target.value})} />
              <select onChange={e=>setFormPat({...formPat, projeto_id:e.target.value})} required><option value="">Projeto</option>{projetos.map((p:any)=><option key={p.id} value={p.id}>{p.nome}</option>)}</select>
              <button type="submit" style={{background:'#d32f2f', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>+ ADICIONAR</button>
            </form>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead><tr style={{background:'#eee'}}><th style={{padding:'10px'}}>Data</th><th>Empresa</th><th>Valor</th><th>Conc.</th><th>Ação</th></tr></thead>
              <tbody>{patsF.map((p:any)=>(<tr key={p.id} style={{borderBottom:'1px solid #eee', textAlign:'center'}}><td style={{padding:'10px'}}>{formatarDataBR(p.data_prevista)}</td><td>{p.empresa_nome}</td><td>R$ {formatarMoeda(p.valor_contribuicao)}</td><td>{p.conciliado ? '✅' : '❌'}</td><td>{p.status_recebimento !== 'Recebido' && <button onClick={()=>{setBaixandoId(p.id); setBaixandoTipo('patrocinio'); setFormBaixa({...formBaixa, valor:p.valor_contribuicao})}} style={{background:'#2e7d32', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>Baixar</button>}</td></tr>))}</tbody>
            </table>
          </div>
        )}

        {abaAtiva === 'recebimentos' && (
          <div>
            <form onSubmit={e=>{e.preventDefault(); salvar('recebimentos', formRec, setFormRec, {descricao:'', valor_previsto:'', data_prevista:new Date().toISOString().split('T')[0], projeto_id:''});}} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap:'10px', marginBottom:'20px', background:'#f9f9f9', padding:'15px', borderRadius:'8px'}}>
              <input placeholder="Descrição" value={formRec.descricao} onChange={e=>setFormRec({...formRec, descricao:e.target.value})} required />
              <input type="number" placeholder="Valor" value={formRec.valor_previsto} onChange={e=>setFormRec({...formRec, valor_previsto:e.target.value})} required />
              <input type="date" value={formRec.data_prevista} onChange={e=>setFormRec({...formRec, data_prevista:e.target.value})} />
              <select onChange={e=>setFormRec({...formRec, projeto_id:e.target.value})} required><option value="">Projeto</option>{projetos.map((p:any)=><option key={p.id} value={p.id}>{p.nome}</option>)}</select>
              <button type="submit" style={{background:'#2e7d32', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>+ ADICIONAR</button>
            </form>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead><tr style={{background:'#eee'}}><th style={{padding:'10px'}}>Data</th><th>Descrição</th><th>Valor</th><th>Conc.</th><th>Ação</th></tr></thead>
              <tbody>{recsF.map((r:any)=>(<tr key={r.id} style={{borderBottom:'1px solid #eee', textAlign:'center'}}><td style={{padding:'10px'}}>{formatarDataBR(r.data_prevista)}</td><td>{r.descricao}</td><td>R$ {formatarMoeda(r.valor_previsto)}</td><td>{r.conciliado ? '✅' : '❌'}</td><td>{r.status !== 'Recebido' && <button onClick={()=>{setBaixandoId(r.id); setBaixandoTipo('recebimento'); setFormBaixa({...formBaixa, valor:r.valor_previsto})}} style={{background:'#2e7d32', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>Baixar</button>}</td></tr>))}</tbody>
            </table>
          </div>
        )}

        {abaAtiva === 'pagamentos' && (
          <div>
            <form onSubmit={e=>{e.preventDefault(); salvar('pagamentos', formPag, setFormPag, {descricao:'', fornecedor:'', valor_previsto:'', data_prevista:new Date().toISOString().split('T')[0], projeto_id:''});}} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap:'10px', marginBottom:'20px', background:'#f9f9f9', padding:'15px', borderRadius:'8px'}}>
              <input placeholder="Descrição" value={formPag.descricao} onChange={e=>setFormPag({...formPag, descricao:e.target.value})} required />
              <input type="number" placeholder="Valor" value={formPag.valor_previsto} onChange={e=>setFormPag({...formPag, valor_previsto:e.target.value})} required />
              <input type="date" value={formPag.data_prevista} onChange={e=>setFormPag({...formPag, data_prevista:e.target.value})} />
              <select onChange={e=>setFormPag({...formPag, projeto_id:e.target.value})} required><option value="">Projeto</option>{projetos.map((p:any)=><option key={p.id} value={p.id}>{p.nome}</option>)}</select>
              <button type="submit" style={{background:'#c62828', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>+ ADICIONAR</button>
            </form>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12, padding: 12, background: '#f8f9fa', borderRadius: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#6f42c1', color: 'white', padding: '3px 8px', borderRadius: 4, fontSize: 11 }}>📊</span>
                <span style={{ fontSize: 14 }}>Sistema Financeiro</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#005daa', color: 'white', padding: '3px 8px', borderRadius: 4, fontSize: 11 }}>🛒</span>
                <span style={{ fontSize: 14 }}>Sistema de Compras</span>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 14, color: '#666' }}>Total: {pagamentosTodosF.length} registros</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
              <thead><tr style={{ background: '#eee' }}><th style={{ padding: '10px' }}>Origem</th><th>Data</th><th>Descrição</th><th>Fornecedor</th><th>Valor</th><th>Conc.</th><th>Ação</th></tr></thead>
              <tbody>
                {pagamentosTodosF.map((pag: any) => (
                  <tr
                    key={`${pag.origem}-${pag.id}`}
                    style={{
                      borderBottom: '1px solid #eee',
                      textAlign: 'center',
                      background: pag.origem === 'compras' ? '#e7f3ff' : 'white',
                      borderLeft: pag.origem === 'compras' ? '4px solid #005daa' : 'none'
                    }}
                  >
                    <td style={{ padding: '10px' }}>
                      <span style={{ background: pag.origem === 'compras' ? '#005daa' : '#6f42c1', color: 'white', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>
                        {pag.origem === 'compras' ? '🛒' : '📊'}
                      </span>
                    </td>
                    <td>{formatarDataBR(getDataPag(pag) || '')}</td>
                    <td>{pag.descricao || '-'}</td>
                    <td>{pag.fornecedor || '-'}</td>
                    <td>R$ {formatarMoeda(pag.valor)}</td>
                    <td>{pag.conciliado ? <span style={{ color: 'green' }}>✓</span> : <span style={{ color: 'red' }}>✗</span>}</td>
                    <td>
                      {pag.origem === 'financeiro' && !pag.conciliado && (
                        <button onClick={() => { setBaixandoId(pag.id); setBaixandoTipo('pagamento'); setFormBaixa({ ...formBaixa, valor: pag.valor }); }} style={{ background: '#c62828', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer' }}>Baixar</button>
                      )}
                      {pag.origem === 'compras' && (
                        <a href={`/compras?tab=contas-pagar${pag.id ? '&id=' + pag.id : ''}`} target="_blank" rel="noopener noreferrer" style={{ color: '#005daa', fontWeight: 500 }}>Ver</a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: 16, background: '#f8f9fa', borderRadius: 8, marginTop: 16 }}>
              <h4>🛒 Contas a pagar (Compras)</h4>
              {dashboardIntegrado && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
                  <div>
                    <small>Pendente:</small>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#dc3545' }}>R$ {Number(dashboardIntegrado.compras?.pendente ?? 0).toFixed(2)}</div>
                    <small>{dashboardIntegrado.compras?.qtd ?? 0} contas</small>
                  </div>
                  <div>
                    <small>Pago no mês:</small>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#28a745' }}>R$ {Number(dashboardIntegrado.compras?.pago ?? 0).toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <a href="/compras?tab=contas-pagar" target="_blank" rel="noopener noreferrer">
                      <button style={{ background: '#005daa', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Ver todas →</button>
                    </a>
                  </div>
                </div>
              )}
              <small style={{ display: 'block', marginTop: 8, color: '#666' }}>As contas do sistema de Compras já aparecem na lista acima com o ícone 🛒</small>
            </div>
          </div>
        )}

        {abaAtiva === 'balancete' && (
          <div>
            <h2>📊 Balancete / DRE</h2>
            <p style={{fontSize:'13px', color:'#666', marginBottom:'10px'}}>Despesas incluem pagamentos manuais e contas a pagar do fluxo Compras.</p>
            <table style={{width:'100%', borderCollapse:'collapse', marginTop:'10px'}}>
              <thead><tr style={{background:'#f8f9fa', textAlign:'left'}}><th style={{padding:'15px'}}>CONTA</th><th>REALIZADO</th><th>A REALIZAR</th><th>PROJETADO</th></tr></thead>
              <tbody>
                <tr style={{borderBottom:'1px solid #eee'}}><td style={{padding:'15px', color:'#2e7d32', fontWeight:'bold'}}>(+) RECEITAS</td><td>R$ {formatarMoeda(recReal)}</td><td>R$ {formatarMoeda(recTotal - recReal)}</td><td style={{fontWeight:'bold'}}>R$ {formatarMoeda(recTotal)}</td></tr>
                <tr style={{borderBottom:'1px solid #eee'}}><td style={{padding:'15px', color:'#c62828', fontWeight:'bold'}}>(-) DESPESAS (manual + Compras)</td><td>R$ {formatarMoeda(pagReal)}</td><td>R$ {formatarMoeda(pagTotal - pagReal)}</td><td style={{fontWeight:'bold'}}>R$ {formatarMoeda(pagTotal)}</td></tr>
                <tr style={{background:'#333', color:'white', fontWeight:'bold'}}><td style={{padding:'15px'}}>RESULTADO LÍQUIDO</td><td>R$ {formatarMoeda(recReal - pagReal)}</td><td>R$ {formatarMoeda((recTotal-recReal)-(pagTotal-pagReal))}</td><td style={{background:'#d32f2f', padding:'15px'}}>R$ {formatarMoeda(recTotal - pagTotal)}</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {abaAtiva === 'dashboard' && (
          <div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px'}}>
              <div style={{padding:'20px', background:'#e8f5e9', borderRadius:'8px'}}><h3>Receitas (Realizado)</h3><p style={{fontSize:'24px', fontWeight:'bold', color:'#2e7d32'}}>R$ {formatarMoeda(recReal)}</p></div>
              <div style={{padding:'20px', background:'#ffebee', borderRadius:'8px'}}><h3>Despesas (Realizado)</h3><p style={{fontSize:'24px', fontWeight:'bold', color:'#c62828'}}>R$ {formatarMoeda(pagReal)}</p><small style={{color:'#666'}}>Manual: R$ {formatarMoeda(pagRealManual)} | Compras: R$ {formatarMoeda(contasPagarReal)}</small></div>
              <div style={{padding:'20px', background:'#e3f2fd', borderRadius:'8px'}}><h3>Saldo em Caixa</h3><p style={{fontSize:'24px', fontWeight:'bold', color:'#1565c0'}}>R$ {formatarMoeda(recReal - pagReal)}</p></div>
            </div>
            <div style={{marginTop:'20px', padding:'15px', background:'#fff8e1', borderRadius:'8px'}}>
              <h4 style={{margin:'0 0 10px 0'}}>📋 Previsão a pagar (inclui Compras)</h4>
              <p style={{margin:0}}>Total despesas (manual + contas a pagar do fluxo Compras): <strong>R$ {formatarMoeda(pagTotal)}</strong> — A realizar: <strong>R$ {formatarMoeda(pagTotal - pagReal)}</strong></p>
            </div>
          </div>
        )}
      </div>

      {baixandoId && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
          <div style={{background:'white', padding:'30px', borderRadius:'12px', width:'380px', maxWidth:'95vw'}}>
            <h3>Confirmar Baixa</h3>
            {erroBaixa && <div style={{padding:'10px', marginBottom:'12px', background:'#ffebee', color:'#c62828', borderRadius:6, fontSize:14}}>{erroBaixa}</div>}
            {baixandoTipo === 'pagamento' && (
              <div style={{marginBottom:'12px'}}>
                <label style={{display:'block', marginBottom:4, fontWeight:500}}>Conta bancária *</label>
                <select
                  style={{width:'100%', padding:'12px', borderRadius:'6px', border:'1px solid #ddd'}}
                  value={formBaixa.conta_bancaria_id}
                  onChange={e=>setFormBaixa({...formBaixa, conta_bancaria_id:e.target.value})}
                >
                  <option value="">Selecione a conta...</option>
                  {contasBancarias.map((conta: any) => (
                    <option key={conta.id} value={conta.id}>
                      {conta.nome} — R$ {formatarMoeda(Number(conta.saldo_atual))}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div style={{marginBottom:'10px'}}><label style={{display:'block', marginBottom:4}}>Valor:</label><input type="number" step="0.01" style={{width:'100%', padding:'12px', borderRadius:'6px', border:'1px solid #ddd'}} value={formBaixa.valor} onChange={e=>setFormBaixa({...formBaixa, valor:e.target.value})} /></div>
            <div style={{marginBottom:'10px'}}><label style={{display:'block', marginBottom:4}}>Data:</label><input type="date" style={{width:'100%', padding:'12px', borderRadius:'6px', border:'1px solid #ddd'}} value={formBaixa.data} onChange={e=>setFormBaixa({...formBaixa, data:e.target.value})} /></div>
            <div style={{marginBottom:'20px'}}><label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}}><input type="checkbox" checked={formBaixa.conciliado} onChange={e=>setFormBaixa({...formBaixa, conciliado:e.target.checked})} /> Conciliado com Banco?</label></div>
            <button onClick={executarBaixa} disabled={baixandoTipo === 'pagamento' && !formBaixa.conta_bancaria_id} style={{width:'100%', padding:'15px', background: (baixandoTipo === 'pagamento' && !formBaixa.conta_bancaria_id) ? '#ccc' : '#2e7d32', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor: (baixandoTipo === 'pagamento' && !formBaixa.conta_bancaria_id) ? 'not-allowed' : 'pointer'}}>✅ CONFIRMAR</button>
            <button onClick={()=>{ setBaixandoId(null); setErroBaixa(''); }} style={{width:'100%', padding:'10px', background:'none', color:'#666', border:'none', cursor:'pointer', marginTop:'10px'}}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

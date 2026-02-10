// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CadastrosMaster() {
  const [tab, setTab] = useState('parceiros-negocios');
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  
  const [fParc, setFParc] = useState({ id: null, nome_razao_social: '', cnpj_cpf: '', tipo_parceiro: 'Fornecedor', cep: '', logradouro: '', bairro: '', cidade: '', uf: '' });
  const [fProd, setFProd] = useState({ id: null, nome: '', unidade: '', tipo: 'Produto', preco_custo: 0 });
  const [fBank, setFBank] = useState({ id: null, nome_banco: '', agencia: '', conta: '' });

  const load = async () => {
    try {
      const r = await fetch(`http://213.199.51.121:4001/api/${tab}`);
      const d = await r.json();
      setList(Array.isArray(d) ? d : []);
    } catch (e) { setList([]); }
  };

  useEffect(() => { load(); }, [tab]);

  const apiAction = async (path, payload, resetFunc) => {
    const method = payload.id ? 'PUT' : 'POST';
    const url = payload.id ? `http://213.199.51.121:4001/api/${path}/${payload.id}` : `http://213.199.51.121:4001/api/${path}`;
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (r.ok) { resetFunc(); load(); alert('Registro Salvo!'); }
  };

  const filtered = list.filter(i => {
    const val = (i.nome_razao_social || i.nome || i.nome_banco || '').toLowerCase();
    return val.includes(search.toLowerCase());
  });

  return (
    <div className="page-container" style={{ fontFamily: 'sans-serif', background: '#f4f7fa', minHeight: '100vh' }}>
      <Link href="/portal">← Voltar ao Portal</Link>
      <h1 style={{color:'#005daa', margin:'20px 0'}}>📝 Central de Cadastros</h1>
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', background: '#eee', padding: '5px', borderRadius: '10px', flexWrap: 'wrap' }}>
        {[ {id:'parceiros-negocios', n:'Parceiros'}, {id:'produtos', n:'Produtos'}, {id:'bancos', n:'Bancos'} ].map(t => (
          <button key={t.id} onClick={() => {setTab(t.id); setSearch('');}} style={{ flex: 1, minWidth: '100px', padding: '12px', border: 'none', borderRadius: '8px', background: tab === t.id ? '#005daa' : 'transparent', color: tab === t.id ? '#fff' : '#333', fontWeight: 'bold', cursor:'pointer' }}>{t.n.toUpperCase()}</button>
        ))}
      </div>
      <div className="resp-grid-aside-400">
        <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
          <input placeholder="🔍 Pesquisar..." value={search} onChange={e=>setSearch(e.target.value)} style={{ width:'100%', padding:'10px', marginBottom:'20px' }} />
          {filtered.map(i => (
            <div key={i.id} style={{ padding: '12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
              <span>{i.nome_razao_social || i.nome || i.nome_banco}</span>
              <button onClick={() => tab==='parceiros-negocios'?setFParc(i):tab==='produtos'?setFProd(i):setFBank(i)}>✏️</button>
            </div>
          ))}
        </div>
        <div style={{ background: '#eef2f7', padding: '30px', borderRadius: '20px' }}>
          {tab === 'parceiros-negocios' && (
            <div style={{display:'grid', gap:'10px'}}>
              <h4>Parceiro</h4>
              <input placeholder="Razão Social" value={fParc.nome_razao_social} onChange={e=>setFParc({...fParc, nome_razao_social:e.target.value})} />
              <input placeholder="CNPJ" value={fParc.cnpj_cpf} onChange={e=>setFParc({...fParc, cnpj_cpf:e.target.value})} />
              <button onClick={()=>apiAction('parceiros-negocios', fParc, ()=>setFParc({id:null, nome_razao_social:''}))} style={{background:'#28a745', color:'#fff', padding:'10px', border:'none', borderRadius:'8px'}}>SALVAR</button>
            </div>
          )}
          {tab === 'produtos' && (
            <div style={{display:'grid', gap:'10px'}}>
              <h4>Produto</h4>
              <input placeholder="Nome" value={fProd.nome} onChange={e=>setFProd({...fProd, nome:e.target.value})} />
              <input placeholder="Unidade" value={fProd.unidade} onChange={e=>setFProd({...fProd, unidade:e.target.value})} />
              <button onClick={()=>apiAction('produtos', fProd, ()=>setFProd({id:null, nome:'', unidade:''}))} style={{background:'#28a745', color:'#fff', padding:'10px', border:'none', borderRadius:'8px'}}>SALVAR</button>
            </div>
          )}
          {tab === 'bancos' && (
            <div style={{display:'grid', gap:'10px'}}>
              <h4>Banco</h4>
              <input placeholder="Nome Banco" value={fBank.nome_banco} onChange={e=>setFBank({...fBank, nome_banco:e.target.value})} />
              <input placeholder="Agência" value={fBank.agencia} onChange={e=>setFBank({...fBank, agencia:e.target.value})} />
              <input placeholder="Conta" value={fBank.conta} onChange={e=>setFBank({...fBank, conta:e.target.value})} />
              <button onClick={()=>apiAction('bancos', fBank, ()=>setFBank({id:null, nome_banco:'', agencia:'', conta:''}))} style={{background:'#28a745', color:'#fff', padding:'10px', border:'none', borderRadius:'8px'}}>SALVAR</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

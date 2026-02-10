// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState([]);
  const [selectedForn, setSelectedForn] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ nome: '', categoria: '', telefone: '', email: '', contato_vendedor: '', endereco: '', cep: '', cnpj: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const res = await fetch('http://213.199.51.121:4001/api/fornecedores');
    setFornecedores(await res.json());
  };

  const buscaCep = async (cep) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    const data = await res.json();
    if (!data.erro) setForm(f => ({ ...f, endereco: `${data.logradouro}, ${data.bairro}, ${data.localidade}-${data.uf}`, cep: data.cep }));
  };

  const buscaCnpj = async (cnpj) => {
    const clean = cnpj.replace(/\D/g, '');
    if (clean.length !== 14) return;
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
    const data = await res.json();
    if (data.razao_social) setForm(f => ({ ...f, nome: data.razao_social, email: data.email, telefone: data.ddd_telefone_1, endereco: `${data.logradouro}, ${data.numero}, ${data.bairro}`, cep: data.cep }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `http://213.199.51.121:4001/api/fornecedores/${selectedForn.id}` : 'http://213.199.51.121:4001/api/fornecedores';
    
    await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ nome: '', categoria: '', telefone: '', email: '', contato_vendedor: '', endereco: '', cep: '', cnpj: '' });
    setIsEditing(false);
    setSelectedForn(null);
    fetchData();
  };

  const startEdit = () => {
    setForm(selectedForn);
    setIsEditing(true);
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <Link href="/portal">← Portal</Link>
      <h1 style={{ color: '#6f42c1' }}>🤝 Gestão de Fornecedores</h1>

      <button onClick={() => { setIsEditing(false); setSelectedForn({}); setForm({nome:'', categoria:'', telefone:'', email:'', contato_vendedor:'', endereco:'', cep:'', cnpj:''}); }} style={{ background: '#6f42c1', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', marginBottom: '20px', cursor:'pointer' }}>+ Novo Fornecedor</button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {fornecedores.map(f => (
          <div key={f.id} onClick={() => setSelectedForn(f)} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '15px', background: 'white', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#6f42c1' }}>{f.nome}</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>🏷️ {f.categoria}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>📍 {f.endereco?.substring(0, 30)}...</p>
          </div>
        ))}
      </div>

      {selectedForn && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {!isEditing ? (
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'2px solid #eee', paddingBottom:'15px' }}>
                  <h2>{selectedForn.nome}</h2>
                  <div>
                    <button onClick={startEdit} style={{ background: '#005daa', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', marginRight: '10px', cursor:'pointer' }}>EDITAR DADOS</button>
                    <button onClick={() => setSelectedForn(null)}>FECHAR</button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                  <div>
                    <p><strong>CNPJ:</strong> {selectedForn.cnpj}</p>
                    <p><strong>Categoria:</strong> {selectedForn.categoria}</p>
                    <p><strong>Contato:</strong> {selectedForn.contato_vendedor}</p>
                    <p><strong>WhatsApp:</strong> {selectedForn.telefone}</p>
                    <p><strong>Endereço:</strong> {selectedForn.endereco} - CEP: {selectedForn.cep}</p>
                  </div>
                  <div style={{ height: '250px', background: '#eee', borderRadius: '15px', overflow: 'hidden' }}>
                    <iframe width="100%" height="100%" frameBorder="0" src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedForn.endereco)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave}>
                <h3>{selectedForn.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <input type="text" placeholder="CNPJ" value={form.cnpj} onChange={e=>setForm({...form, cnpj:e.target.value})} onBlur={e=>buscaCnpj(e.target.value)} style={{padding:'10px'}} />
                  <input type="text" placeholder="Nome" required value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})} style={{padding:'10px'}} />
                  <input type="text" placeholder="CEP" value={form.cep} onChange={e=>setForm({...form, cep:e.target.value})} onBlur={e=>buscaCep(e.target.value)} style={{padding:'10px'}} />
                  <input type="text" placeholder="Categoria" value={form.categoria} onChange={e=>setForm({...form, categoria:e.target.value})} style={{padding:'10px'}} />
                  <input type="text" placeholder="Endereço" value={form.endereco} onChange={e=>setForm({...form, endereco:e.target.value})} style={{padding:'10px', gridColumn:'span 2'}} />
                  <input type="text" placeholder="WhatsApp" value={form.telefone} onChange={e=>setForm({...form, telefone:e.target.value})} style={{padding:'10px'}} />
                  <input type="text" placeholder="Vendedor" value={form.contato_vendedor} onChange={e=>setForm({...form, contato_vendedor:e.target.value})} style={{padding:'10px'}} />
                </div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ background: '#28a745', color: '#fff', padding: '10px 30px', border: 'none', borderRadius: '8px' }}>SALVAR ALTERAÇÕES</button>
                  <button type="button" onClick={() => setIsEditing(false)} style={{ background: '#6c757d', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px' }}>CANCELAR</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

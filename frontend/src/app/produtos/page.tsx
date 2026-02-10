// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState({ nome: '', categoria: '', unidade: '' });

  useEffect(() => { fetchProdutos(); }, []);

  const fetchProdutos = async () => {
    const res = await fetch('http://213.199.51.121:4001/api/produtos');
    setProdutos(await res.json());
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await fetch('http://213.199.51.121:4001/api/produtos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ nome: '', categoria: '', unidade: '' });
    fetchProdutos();
  };

  const handleEdit = async (p) => {
    const novoNome = prompt('Editar Nome do Produto:', p.nome);
    const novaUnid = prompt('Editar Unidade de Medida (kg, un, m):', p.unidade);
    if(novoNome && novaUnid) {
      await fetch(`http://213.199.51.121:4001/api/produtos/${p.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...p, nome: novoNome, unidade: novaUnid })
      });
      fetchProdutos();
    }
  };

  const handleDelete = async (id) => {
    if(confirm('Excluir este produto permanentemente?')) {
      const res = await fetch(`http://213.199.51.121:4001/api/produtos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if(data.error) alert(data.error);
      fetchProdutos();
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <Link href="/portal">← Voltar ao Portal</Link>
      <h1 style={{ color: '#e83e8c' }}>📦 Catálogo de Produtos</h1>

      <form onSubmit={handleSave} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '15px', marginBottom: '30px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px' }}>
        <input type="text" placeholder="Nome do Item" required value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})} style={{padding:'10px'}} />
        <input type="text" placeholder="Unidade" value={form.unidade} onChange={e=>setForm({...form, unidade:e.target.value})} style={{padding:'10px'}} />
        <button type="submit" style={{ background: '#e83e8c', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>+ Adicionar</button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        {produtos.map(p => (
          <div key={p.id} style={{ padding: '15px', background: 'white', border: '1px solid #eee', borderRadius: '12px', position: 'relative' }}>
            <div style={{position:'absolute', right:'10px', top:'10px'}}>
               <button onClick={() => handleEdit(p)} style={{background:'none', border:'none', cursor:'pointer'}}>✏️</button>
               <button onClick={() => handleDelete(p.id)} style={{background:'none', border:'none', cursor:'pointer'}}>🗑️</button>
            </div>
            <strong>{p.nome}</strong><br/>
            <small style={{color:'#999'}}>{p.categoria} | Un: {p.unidade}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';

export default function DestinacaoPage() {
  const [entidades, setEntidades] = useState<any[]>([]);
  const [projetoId, setProjetoId] = useState('');
  const [form, setForm] = useState({ entidade_nome: '', valor_previsto: '' });

  const carregarDestinacao = (id: string) => {
    fetch(`http://213.199.51.121:4001/api/destinacao/${id}`)
      .then(res => res.json())
      .then(data => setEntidades(data));
  };

  useEffect(() => {
    const id = localStorage.getItem('projeto_id');
    if (id) { setProjetoId(id); carregarDestinacao(id); }
  }, []);

  const salvarEntidade = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://213.199.51.121:4001/api/destinacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, projeto_id: projetoId })
    });
    setForm({ entidade_nome: '', valor_previsto: '' });
    carregarDestinacao(projetoId);
  };

  return (
    <div className="page-container" style={{ fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#9c27b0' }}>🤝 Destinação de Recursos (Entidades)</h1>
      <form onSubmit={salvarEntidade} style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <input style={{ padding: '10px', marginRight: '10px' }} placeholder="Nome da Entidade" value={form.entidade_nome} onChange={e => setForm({...form, entidade_nome: e.target.value})} required />
        <input style={{ padding: '10px', marginRight: '10px' }} type="number" placeholder="Valor Previsto" value={form.valor_previsto} onChange={e => setForm({...form, valor_previsto: e.target.value})} required />
        <button type="submit" style={{ background: '#9c27b0', color: 'white', padding: '10px', border: 'none', borderRadius: '4px' }}>Cadastrar Destinação</button>
      </form>
      {entidades.map(e => (
        <div key={e.id} style={{ background: 'white', padding: '15px', borderBottom: '1px solid #ddd' }}>
          <strong>{e.entidade_nome}</strong> - Previsto: R$ {Number(e.valor_previsto).toLocaleString('pt-BR')}
        </div>
      ))}
      <button onClick={() => window.location.href = '/portal'}>← Voltar ao Portal</button>
    </div>
  );
}

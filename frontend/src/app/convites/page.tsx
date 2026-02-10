'use client';
import { useEffect, useState } from 'react';

export default function ConvitesPage() {
  const [lotes, setLotes] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [form, setForm] = useState({ nome_lote: '', valor_unitario: '', quantidade_total: '', projeto_id: '' });

  const carregarDados = async () => {
    try {
      const resL = await fetch('http://213.199.51.121:4001/api/convites');
      setLotes(await resL.json());
      const resP = await fetch('http://213.199.51.121:4001/api/projetos');
      setProjetos(await resP.json());
    } catch (err) { console.error("Erro ao carregar dados", err); }
  };

  useEffect(() => { carregarDados(); }, []);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projeto_id) { alert("Por favor, selecione um projeto!"); return; }
    
    await fetch('http://213.199.51.121:4001/api/convites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    
    setForm({ nome_lote: '', valor_unitario: '', quantidade_total: '', projeto_id: '' });
    carregarDados();
  };

  return (
    <div className="page-container" style={{ fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#2e7d32' }}>🎫 Gestão de Convites</h1>
      
      <form onSubmit={salvar} style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px' }}>
        <h3>Criar Lote de Ingressos</h3>
        <div className="resp-grid-2" style={{ gap: '15px' }}>
          <div>
            <label>Nome do Lote:</label>
            <input style={{ width: '100%', padding: '10px', marginTop: '5px' }} placeholder="Ex: 1º Lote" value={form.nome_lote} onChange={e => setForm({...form, nome_lote: e.target.value})} required />
          </div>
          <div>
            <label>Vincular ao Projeto:</label>
            <select style={{ width: '100%', padding: '10px', marginTop: '5px' }} value={form.projeto_id} onChange={e => setForm({...form, projeto_id: e.target.value})} required>
              <option value="">-- Selecione o Projeto --</option>
              {projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div>
            <label>Preço Unitário (R$):</label>
            <input type="number" style={{ width: '100%', padding: '10px', marginTop: '5px' }} value={form.valor_unitario} onChange={e => setForm({...form, valor_unitario: e.target.value})} required />
          </div>
          <div>
            <label>Quantidade Total:</label>
            <input type="number" style={{ width: '100%', padding: '10px', marginTop: '5px' }} value={form.quantidade_total} onChange={e => setForm({...form, quantidade_total: e.target.value})} required />
          </div>
        </div>
        <button type="submit" style={{ marginTop: '20px', padding: '12px 25px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Gravar Lote
        </button>
      </form>

      <div style={{ display: 'grid', gap: '15px' }}>
        {lotes.map(l => (
          <div key={l.id} style={{ padding: '15px', background: '#fff', borderLeft: '8px solid #2e7d32', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: '0.8rem', color: '#666' }}>PROJETO: {l.projeto_nome || 'Não definido'}</span>
            <h2 style={{ margin: '5px 0' }}>{l.nome_lote}</h2>
            <p>Valor: <strong>R$ {l.valor_unitario}</strong> | Disponível: <strong>{l.quantidade_total} convites</strong></p>
          </div>
        ))}
      </div>
      <br /><a href="/portal" style={{ color: '#2e7d32', textDecoration: 'none', fontWeight: 'bold' }}>← Voltar ao Portal</a>
    </div>
  );
}

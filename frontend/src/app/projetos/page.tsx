'use client';
import { useEffect, useState } from 'react';

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState({ nome: '', descricao: '', data_inicio: '', data_fim: '', status: 'Planejamento' });

  const carregarDados = async () => {
    try {
      const res = await fetch('http://213.199.51.121:4001/api/projetos/full');
      setProjetos(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { carregarDados(); }, []);

  const salvarProjeto = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editandoId ? `http://213.199.51.121:4001/api/projetos/${editandoId}` : 'http://213.199.51.121:4001/api/projetos';
    await fetch(url, { method: editandoId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ nome: '', descricao: '', data_inicio: '', data_fim: '', status: 'Planejamento' });
    setEditandoId(null);
    carregarDados();
  };

  const editarProjeto = (p: any) => {
    setForm({ nome: p.nome, descricao: p.descricao || '', data_inicio: p.data_inicio ? p.data_inicio.split('T')[0] : '', data_fim: p.data_fim ? p.data_fim.split('T')[0] : '', status: p.status || 'Planejamento' });
    setEditandoId(p.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
    setForm({ nome: '', descricao: '', data_inicio: '', data_fim: '', status: 'Planejamento' });
    setEditandoId(null);
  };

  const toggleAtivo = async (id: number) => {
    await fetch(`http://213.199.51.121:4001/api/projetos/${id}/toggle`, { method: 'PATCH' });
    carregarDados();
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#1976d2' }}>🎯 Gestão de Projetos</h1>

      <form onSubmit={salvarProjeto} style={{ background: editandoId ? '#fff3cd' : '#fff', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: editandoId ? '2px solid #ffc107' : '1px solid #ddd' }}>
        <h3>{editandoId ? '✏️ Editando Projeto' : '➕ Criar Novo Projeto'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <input style={{ padding: '10px' }} placeholder="Nome do Projeto" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
          <input type="date" style={{ padding: '10px' }} value={form.data_inicio} onChange={e => setForm({...form, data_inicio: e.target.value})} />
          <input type="date" style={{ padding: '10px' }} value={form.data_fim} onChange={e => setForm({...form, data_fim: e.target.value})} />
          <select style={{ padding: '10px' }} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="Planejamento">Planejamento</option>
            <option value="Ativo">Ativo</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluído">Concluído</option>
          </select>
        </div>
        <textarea style={{ width: '100%', padding: '10px', minHeight: '80px', marginBottom: '10px' }} placeholder="Descrição..." value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ background: editandoId ? '#ffc107' : '#1976d2', color: editandoId ? '#000' : 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {editandoId ? '💾 Atualizar' : '➕ Criar'}
          </button>
          {editandoId && <button type="button" onClick={cancelarEdicao} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer' }}>✖️ Cancelar</button>}
        </div>
      </form>

      <div style={{ display: 'grid', gap: '20px' }}>
        {projetos.map((p: any) => (
          <div key={p.id} style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', opacity: p.ativo === false ? 0.6 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>{p.nome}</h2>
                <p style={{ margin: '0 0 10px 0', color: '#666' }}>{p.descricao}</p>
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.9em', color: '#666' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', background: p.status === 'Ativo' ? '#e8f5e9' : '#fff3e0', color: p.status === 'Ativo' ? '#2e7d32' : '#f57c00', fontWeight: 'bold' }}>{p.status}</span>
                  {p.data_inicio && <span>📅 {new Date(p.data_inicio).toLocaleDateString('pt-BR')}</span>}
                  {p.data_fim && <span>🏁 {new Date(p.data_fim).toLocaleDateString('pt-BR')}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ padding: '6px 14px', borderRadius: '12px', fontSize: '0.85em', background: p.ativo === false ? '#ffebee' : '#e8f5e9', color: p.ativo === false ? '#c62828' : '#2e7d32', fontWeight: 'bold' }}>
                  {p.ativo === false ? '🔒 Inativo' : '✅ Ativo'}
                </span>
                <button onClick={() => editarProjeto(p)} style={{ background: '#ffc107', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✏️ Editar</button>
                <button onClick={() => toggleAtivo(p.id)} style={{ background: p.ativo === false ? '#4caf50' : '#f44336', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {p.ativo === false ? '🔓 Ativar' : '🔒 Desativar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <br /><a href="/portal" style={{ color: '#1976d2', fontWeight: 'bold' }}>← Voltar ao Portal</a>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';

export default function CronogramaPage() {
  const [atividades, setAtividades] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState({ atividade: '', prazo: '', responsavel: '', projeto_id: '', status: 'Pendente' });

  const carregarDados = async () => {
    try {
      const resP = await fetch('http://213.199.51.121:4001/api/projetos');
      setProjetos(await resP.json());
      
      const resC = await fetch('http://213.199.51.121:4001/api/cronograma');
      setAtividades(await resC.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const salvarTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projeto_id) {
      alert('Por favor, selecione um projeto!');
      return;
    }
    
    const url = editandoId ? `http://213.199.51.121:4001/api/cronograma/${editandoId}` : 'http://213.199.51.121:4001/api/cronograma';
    await fetch(url, { method: editandoId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ atividade: '', prazo: '', responsavel: '', projeto_id: '', status: 'Pendente' });
    setEditandoId(null);
    carregarDados();
  };

  const editarAtividade = (a: any) => {
    setForm({ atividade: a.atividade, prazo: a.prazo ? a.prazo.split('T')[0] : '', responsavel: a.responsavel || '', projeto_id: a.projeto_id || '', status: a.status || 'Pendente' });
    setEditandoId(a.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
    setForm({ atividade: '', prazo: '', responsavel: '', projeto_id: '', status: 'Pendente' });
    setEditandoId(null);
  };

  const mudarStatus = async (id: number, novoStatus: string) => {
    await fetch(`http://213.199.51.121:4001/api/cronograma/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: novoStatus }) });
    carregarDados();
  };

  return (
    <div className="page-container" style={{ fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#f57c00' }}>📅 Cronograma de Atividades</h1>

      <form onSubmit={salvarTarefa} style={{ background: editandoId ? '#fff3cd' : '#fff', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: editandoId ? '2px solid #ffc107' : '1px solid #ddd' }}>
        <h3>{editandoId ? '✏️ Editando Atividade' : '➕ Nova Atividade'}</h3>
        <div className="resp-form-4" style={{ marginBottom: '10px' }}>
          <input style={{ padding: '10px' }} placeholder="Descrição da atividade" value={form.atividade} onChange={e => setForm({...form, atividade: e.target.value})} required />
          <input type="date" style={{ padding: '10px' }} value={form.prazo} onChange={e => setForm({...form, prazo: e.target.value})} required />
          <input style={{ padding: '10px' }} placeholder="Responsável" value={form.responsavel} onChange={e => setForm({...form, responsavel: e.target.value})} />
          <select style={{ padding: '10px' }} value={form.projeto_id} onChange={e => setForm({...form, projeto_id: e.target.value})} required>
            <option value="">Selecione o Projeto</option>
            {projetos.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ background: editandoId ? '#ffc107' : '#f57c00', color: editandoId ? '#000' : 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {editandoId ? '💾 Atualizar' : '➕ Adicionar'}
          </button>
          {editandoId && <button type="button" onClick={cancelarEdicao} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>✖️ Cancelar</button>}
        </div>
      </form>

      <div className="resp-table-wrap">
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#f57c00', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Atividade</th>
            <th style={{ padding: '12px' }}>Prazo</th>
            <th style={{ padding: '12px' }}>Responsável</th>
            <th style={{ padding: '12px' }}>Projeto</th>
            <th style={{ padding: '12px' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {atividades.map((a: any) => (
            <tr key={a.id} style={{ borderBottom: '1px solid #eee', opacity: a.status === 'Concluído' ? 0.6 : 1 }}>
              <td style={{ padding: '12px' }}>{a.atividade}</td>
              <td style={{ padding: '12px' }}>{a.prazo ? new Date(a.prazo).toLocaleDateString('pt-BR') : '-'}</td>
              <td style={{ padding: '12px' }}>{a.responsavel}</td>
              <td style={{ padding: '12px', color: '#666' }}>{a.projeto_nome || 'Não vinculado'}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.85em', background: a.status === 'Concluído' ? '#e8f5e9' : a.status === 'Em Andamento' ? '#fff3e0' : '#ffebee', color: a.status === 'Concluído' ? '#2e7d32' : a.status === 'Em Andamento' ? '#f57c00' : '#c62828', fontWeight: 'bold' }}>
                  {a.status}
                </span>
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <button onClick={() => editarAtividade(a)} style={{ background: '#ffc107', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontWeight: 'bold' }}>✏️ Editar</button>
                {a.status !== 'Concluído' && (
                  <button onClick={() => mudarStatus(a.id, a.status === 'Pendente' ? 'Em Andamento' : 'Concluído')} style={{ background: a.status === 'Pendente' ? '#2196f3' : '#4caf50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {a.status === 'Pendente' ? '▶️ Iniciar' : '✅ Concluir'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <br /><a href="/portal" style={{ color: '#f57c00', fontWeight: 'bold' }}>← Voltar ao Portal</a>
    </div>
  );
}

// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AtasPage() {
  const [atas, setAtas] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ titulo: '', conteudo: '', data_reuniao: '', projeto_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resAtas, resProj] = await Promise.all([
        fetch('http://213.199.51.121:4001/api/atas'),
        fetch('http://213.199.51.121:4001/api/projetos')
      ]);
      const dataAtas = await resAtas.json().catch(() => []);
      const dataProj = await resProj.json().catch(() => []);
      setAtas(Array.isArray(dataAtas) ? dataAtas : []);
      setProjetos(Array.isArray(dataProj) ? dataProj : []);
    } catch (e) { console.error(e); setAtas([]); setProjetos([]); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `http://213.199.51.121:4001/api/atas/${editId}` : 'http://213.199.51.121:4001/api/atas';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setEditId(null);
    setFormData({ titulo: '', conteudo: '', data_reuniao: '', projeto_id: '' });
    fetchData();
  };

  const handleEdit = (ata) => {
    setEditId(ata.id);
    setFormData({
      titulo: ata.titulo,
      conteudo: ata.conteudo,
      data_reuniao: ata.data_reuniao ? new Date(ata.data_reuniao).toISOString().slice(0, 16) : '',
      projeto_id: ata.projeto_id || ''
    });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (confirm('Deseja excluir esta ata?')) {
      await fetch(`http://213.199.51.121:4001/api/atas/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  if (loading) return <div style={{padding: '20px'}}>Carregando sistema de atas...</div>;

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <Link href="/portal">← Voltar ao Portal</Link>
      <h1 style={{ color: '#005daa', marginTop: '15px' }}>{editId ? '📝 Editar Ata' : '➕ Nova Ata de Reunião'}</h1>
      
      <form onSubmit={handleSubmit} style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <div className="resp-grid-2" style={{ marginBottom: '10px' }}>
          <input type="text" placeholder="Título da Reunião" required value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input type="datetime-local" required value={formData.data_reuniao} onChange={e => setFormData({...formData, data_reuniao: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <select value={formData.projeto_id} onChange={e => setFormData({...formData, projeto_id: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <option value="">-- Selecione o Projeto (Opcional) --</option>
          {projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
        <textarea placeholder="Conteúdo da ata..." required rows={8} value={formData.conteudo} onChange={e => setFormData({...formData, conteudo: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', display: 'block', border: '1px solid #ccc', borderRadius: '4px' }} />
        <button type="submit" style={{ background: editId ? '#28a745' : '#005daa', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {editId ? 'Salvar Alterações' : 'Gravar Nova Ata'}
        </button>
        {editId && <button type="button" onClick={() => { setEditId(null); setFormData({titulo:'', conteudo:'', data_reuniao:'', projeto_id:''}); }} style={{ marginLeft: '10px', background: '#666', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px' }}>Cancelar</button>}
      </form>

      <h2 style={{ borderBottom: '2px solid #005daa', paddingBottom: '10px' }}>Histórico de Atas</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {atas.map(ata => (
          <div key={ata.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', position: 'relative', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ position: 'absolute', right: '15px', top: '15px' }}>
              <button onClick={() => handleEdit(ata)} style={{ background: '#ffc107', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>✏️ Editar</button>
              <button onClick={() => handleDelete(ata.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
            </div>
            <small style={{ color: '#666' }}>📅 {new Date(ata.data_reuniao).toLocaleString('pt-BR')}</small>
            <h3 style={{ margin: '5px 0', color: '#333', paddingRight: '100px' }}>{ata.titulo}</h3>
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '14px', color: '#444', lineHeight: '1.5', margin: '10px 0' }}>{ata.conteudo}</p>
            {ata.projeto_nome && <span style={{ background: '#e1ecf4', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', color: '#005daa', fontWeight: 'bold' }}>📌 {ata.projeto_nome}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

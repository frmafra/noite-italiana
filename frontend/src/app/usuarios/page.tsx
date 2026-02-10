// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UsuariosPage() {
  const [membros, setMembros] = useState([]);
  const PERFIS = ['Voluntário', 'Coordenador', 'Administrador', 'Tesoureiro', 'Usuário'];
  const [form, setForm] = useState({ id: null, nome: '', cargo: 'Usuário', login: '', senha: '', bloqueado: false });

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    const res = await fetch('http://213.199.51.121:4001/api/membros');
    setMembros(await res.json());
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const url = form.id ? `http://213.199.51.121:4001/api/membros/${form.id}` : 'http://213.199.51.121:4001/api/membros';
    await fetch(url, {
      method: form.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ id: null, nome: '', cargo: 'Usuário', login: '', senha: '', bloqueado: false });
    fetchData();
  };

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <Link href="/portal">← Voltar ao Portal</Link>
      <h1 style={{ color: '#343a40' }}>🛡️ Gestão de Usuários e Acessos</h1>
      <div className="resp-grid-aside">
        <div className="resp-table-wrap">
        <table style={{ width:'100%', background:'#fff', borderRadius:'10px', overflow:'hidden', borderCollapse:'collapse' }}>
          <thead><tr style={{background:'#343a40', color:'#fff'}}><th style={{padding:'10px'}}>Membro</th><th style={{padding:'10px'}}>Perfil</th><th style={{padding:'10px'}}>Login</th><th style={{padding:'10px'}}>Status</th><th style={{padding:'10px'}}>Ação</th></tr></thead>
          <tbody>
            {membros.map(m => (
              <tr key={m.id} style={{borderBottom:'1px solid #eee'}}>
                <td style={{padding:'10px'}}><strong>{m.nome}</strong></td>
                <td style={{padding:'10px'}}><span style={{ background: '#e3f2fd', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{m.cargo || 'Usuário'}</span></td>
                <td style={{padding:'10px'}}>{m.login}</td>
                <td style={{padding:'10px', color: m.bloqueado ? 'red' : 'green'}}>{m.bloqueado ? 'Bloqueado' : 'Ativo'}</td>
                <td style={{padding:'10px'}}><button onClick={() => setForm(m)}>Editar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <form onSubmit={handleSave} style={{background:'#fff', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
          <h3>{form.id ? 'Editar Usuário' : 'Novo Usuário'}</h3>
          <input type="text" placeholder="Nome" required value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})} style={{width:'100%', padding:'8px', marginBottom:'10px'}} />
          <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#555' }}>Perfil</label>
          <select value={form.cargo || 'Usuário'} onChange={e=>setForm({...form, cargo:e.target.value})} style={{width:'100%', padding:'8px', marginBottom:'10px'}}>
            {PERFIS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input type="text" placeholder="Login" required value={form.login} onChange={e=>setForm({...form, login:e.target.value})} style={{width:'100%', padding:'8px', marginBottom:'10px'}} />
          <input type="password" placeholder={form.id ? 'Deixe em branco para manter a senha' : 'Senha'} value={form.senha} onChange={e=>setForm({...form, senha:e.target.value})} style={{width:'100%', padding:'8px', marginBottom:'10px'}} required={!form.id} />
          {form.id && <small style={{ color: '#666' }}>Deixe em branco para manter a senha atual.</small>}
          <label style={{ display: 'block', marginTop: 10 }}><input type="checkbox" checked={form.bloqueado} onChange={e=>setForm({...form, bloqueado:e.target.checked})} /> Bloquear usuário (não poderá fazer login)</label>
          <button type="submit" style={{width:'100%', padding:'10px', marginTop:'15px', background:'#005daa', color:'#fff', border:'none', borderRadius:'5px'}}>Salvar</button>
        </form>
      </div>
    </div>
  );
}

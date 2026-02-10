'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = 'http://213.199.51.121:4001';

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [setupMsg, setSetupMsg] = useState('');

  const criarAdmin = async () => {
    setSetupMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/setup-admin`);
      const data = await res.json().catch(() => ({}));
      setSetupMsg(data.message || (data.error ? `Erro: ${data.error}` : 'Feito. Tente entrar com admin / Luma110703'));
    } catch (e) {
      setSetupMsg('Erro de conexão.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login.trim(), senha }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || 'Login ou senha inválidos.';
        setErro(data.detail ? `${msg} (${data.detail})` : msg);
        setCarregando(false);
        return;
      }
      if (data.ok && data.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('portal_user', JSON.stringify(data.user));
        }
        router.push('/portal');
        return;
      }
      setErro('Resposta inválida do servidor.');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as Error).message) : '';
      setErro('Erro de conexão. Tente novamente.' + (msg ? ` ${msg}` : ''));
    }
    setCarregando(false);
  };

  return (
    <div className="page-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom, #f4f7fa 0%, #e8eef5 100%)', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#fff', padding: 40, borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ color: '#005daa', fontSize: '1.5rem', margin: 0 }}>Portal de Gestão</h1>
          <p style={{ color: '#666', fontSize: 14, marginTop: 8 }}>Entre com seu login e senha</p>
        </div>
        <form onSubmit={handleSubmit}>
          {erro && (
            <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {erro}
            </div>
          )}
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#333' }}>Login</label>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Seu login"
            required
            autoComplete="username"
            style={{ width: '100%', padding: 14, border: '1px solid #ccc', borderRadius: 8, marginBottom: 16, fontSize: 16 }}
          />
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#333' }}>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
            required
            autoComplete="current-password"
            style={{ width: '100%', padding: 14, border: '1px solid #ccc', borderRadius: 8, marginBottom: 24, fontSize: 16 }}
          />
          <button
            type="submit"
            disabled={carregando}
            style={{
              width: '100%',
              padding: 14,
              background: carregando ? '#999' : '#005daa',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: carregando ? 'not-allowed' : 'pointer',
            }}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        {setupMsg && <p style={{ marginTop: 16, padding: 12, background: '#e8f5e9', color: '#2e7d32', borderRadius: 8, fontSize: 14 }}>{setupMsg}</p>}
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#666' }}>
          <button type="button" onClick={criarAdmin} style={{ background: 'none', border: 'none', color: '#005daa', cursor: 'pointer', textDecoration: 'underline', fontSize: 14 }}>Primeiro acesso? Criar usuário admin</button>
        </p>
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 14, color: '#666' }}>
          <Link href="/" style={{ color: '#005daa', textDecoration: 'none' }}>← Voltar à página inicial</Link>
        </p>
      </div>
    </div>
  );
}

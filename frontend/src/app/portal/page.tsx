'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API = 'http://213.199.51.121:4001';

export default function PortalPage() {
  const router = useRouter();
  const [projetos, setProjetos] = useState<any[]>([]);
  const [user, setUser] = useState<{ nome?: string; login?: string; perfil?: string } | null>(null);
  const [pedidosIngresso, setPedidosIngresso] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const s = localStorage.getItem('portal_user');
        if (s) setUser(JSON.parse(s));
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    fetch(`${API}/api/projetos`)
      .then((r) => r.json())
      .then(setProjetos)
      .catch(() => setProjetos([]));
  }, []);

  useEffect(() => {
    const headers: HeadersInit = {};
    try {
      const s = typeof window !== 'undefined' ? localStorage.getItem('portal_user') : null;
      if (s) headers['X-Portal-User'] = s;
    } catch (_) {}
    fetch(`${API}/api/solicitacoes-convite`, { headers })
      .then((r) => r.json())
      .then((data: any[]) => setPedidosIngresso(Array.isArray(data) ? data.length : 0))
      .catch(() => setPedidosIngresso(0));
  }, []);

  const menuPrincipal = [
    { title: 'PROJETOS', icon: '📅', color: '#005daa', link: '/config?tab=projetos' },
    { title: 'FINANCEIRO', icon: '💰', color: '#28a745', link: '/financeiro' },
    { title: 'COMPRAS', icon: '🛒', color: '#ffc107', link: '/compras' },
    { title: 'CONFIGURAÇÃO', icon: '⚙️', color: '#333', link: '/config' },
    { title: 'CADASTROS', icon: '📝', color: '#6c757d', link: '/cadastros' },
  ];

  const menuOutros = [
    { title: 'CRONOGRAMA', icon: '📆', color: '#17a2b8', link: '/cronograma' },
    { title: 'CONVITES', icon: '🎫', color: '#fd7e14', link: '/convites' },
    { title: 'ATAS', icon: '📋', color: '#6f42c1', link: '/atas' },
    { title: 'DOCUMENTAÇÃO', icon: '📁', color: '#20c997', link: '/documentacao' },
    { title: 'COMITÊ', icon: '👥', color: '#2e7d32', link: '/comite' },
    { title: 'USUÁRIOS', icon: '👤', color: '#e83e8c', link: '/usuarios' },
    { title: 'DESTINAÇÃO', icon: '🤝', color: '#9c27b0', link: '/destinacao' },
  ];

  const renderCard = (m: { title: string; icon: string; color: string; link: string }, i: number) => (
    <Link key={i} href={m.link} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: '#fff',
          padding: '20px 16px',
          borderRadius: '16px',
          textAlign: 'center',
          borderTop: `6px solid ${m.color}`,
          boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          minHeight: '100px',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 14px 28px rgba(0,0,0,0.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{m.icon}</div>
        <h4 style={{ color: m.color, margin: 0, fontSize: '0.8rem', fontWeight: 'bold', lineHeight: 1.25 }}>{m.title}</h4>
      </div>
    </Link>
  );

  return (
    <div className="page-container" style={{ fontFamily: 'sans-serif', background: '#f4f7fa', minHeight: '100vh', overflow: 'visible' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <Link href="/">
          <button
            style={{
              background: '#6c757d',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            ← Página Inicial
          </button>
        </Link>
        <h1 style={{ color: '#005daa', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
          Portal de Gestão
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {user && (
            <span style={{ fontSize: 14, color: '#555' }}>Olá, <strong>{user.nome || user.login}</strong> {user.perfil && <span style={{ background: '#e3f2fd', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}>{user.perfil}</span>}
            </span>
          )}
          <button
            onClick={() => { localStorage.removeItem('portal_user'); router.push('/login'); }}
            style={{ background: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
          >
            Sair
          </button>
        </div>
      </div>

      <h2 style={{ color: '#333', marginBottom: '12px', fontSize: '1.1rem' }}>Principal</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {menuPrincipal.map((m, i) => renderCard(m, i))}
        <Link href="/solicitacoes-convite" style={{ textDecoration: 'none' }}>
          <div
            style={{
              background: '#fff',
              padding: '20px 16px',
              borderRadius: '16px',
              textAlign: 'center',
              borderTop: '6px solid #F7A81B',
              boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              minHeight: '100px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 14px 28px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎫</div>
            <h4 style={{ color: '#F7A81B', margin: 0, fontSize: '0.8rem', fontWeight: 'bold', lineHeight: 1.25 }}>PEDIDOS DE INGRESSO</h4>
            <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#666' }}>
              {pedidosIngresso === null ? '...' : `${pedidosIngresso} pedido(s)`}
            </p>
          </div>
        </Link>
      </div>

      <h2 style={{ color: '#333', marginBottom: '12px', fontSize: '1.1rem' }}>Outros módulos</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {menuOutros.map((m, i) => renderCard(m, i))}
      </div>

      <h2 style={{ color: '#333', marginBottom: '20px' }}>Projetos Ativos</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: '25px',
        }}
      >
        {projetos.length === 0 && <p style={{ color: '#666' }}>Carregando projetos...</p>}
        {projetos.map((p) => (
          <Link
            key={p.id}
            href={`/comite?projetoId=${p.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: '#fff',
                padding: '30px',
                borderRadius: '25px',
                boxShadow: '0 15px 30px rgba(0,0,0,0.05)',
                borderLeft: '10px solid #005daa',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 18px 36px rgba(0,0,0,0.08)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.05)';
              }}
            >
              <h3 style={{ color: '#005daa', margin: 0 }}>{p.nome}</h3>
              <p style={{ color: '#888', fontSize: '12px', marginTop: 8 }}>
                {p.status} | Orçado: R$ {Number(p.orcamento_previsto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* HEADER */}
      <header style={{
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 50,
              height: 50,
              background: '#005EB8',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 'bold',
              color: 'white'
            }}>
              R
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#005EB8', lineHeight: 1.2 }}>
                Rotary Boulevard
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>
                Ribeirão Preto - SP
              </div>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="#sobre" style={{ color: '#333', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>Sobre</a>
            <a href="#projetos" style={{ color: '#333', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>Projetos</a>
            <Link href="/convite" style={{ color: '#333', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>🍝 Quero um convite</Link>
            <a href="#contato" style={{ color: '#333', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>Contato</a>
            <Link href="/login">
              <button
                style={{
                  background: 'linear-gradient(135deg, #005EB8 0%, #0073d1 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,94,184,0.3)',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,94,184,0.4)';
                }}
                onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,94,184,0.3)';
                }}
              >
                → Acessar o Portal
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #005EB8 0%, #F7A81B 100%)',
          padding: '8px 20px',
          borderRadius: 20,
          color: 'white',
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0,94,184,0.2)'
        }}>
          ⭐ Servindo a comunidade desde 1995
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 'bold',
          color: '#005EB8',
          marginBottom: 24,
          lineHeight: 1.2,
          letterSpacing: -1
        }}>
          Rotary Boulevard<br />de Ribeirão Preto
        </h1>

        <p style={{ fontSize: 20, color: '#666', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
          Transformando vidas através de projetos comunitários que fazem a diferença.
          Juntos, construímos um futuro melhor para todos.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          <a href="#projetos">
            <button
              style={{
                background: '#F7A81B',
                color: 'white',
                padding: '16px 32px',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(247,168,27,0.3)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(247,168,27,0.4)';
              }}
              onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(247,168,27,0.3)';
              }}
            >
              Conheça nossos projetos
            </button>
          </a>
          <a href="#contato">
            <button
              style={{
                background: 'white',
                color: '#005EB8',
                padding: '16px 32px',
                border: '2px solid #005EB8',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.background = '#005EB8';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#005EB8';
              }}
            >
              Seja um voluntário
            </button>
          </a>
        </div>

        <p style={{ fontSize: 14, color: '#888', marginTop: 32, marginBottom: 0 }}>
          Equipe e voluntários: acesse o sistema de gestão do clube (projetos, financeiro, compras).
        </p>
        <Link href="/login" style={{ display: 'inline-block', marginTop: 8 }}>
          <button
            style={{
              background: '#333',
              color: 'white',
              padding: '14px 28px',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = '#005EB8';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = '#333';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            → Acessar o Portal
          </button>
        </Link>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 24,
          maxWidth: 900,
          margin: '80px auto 0'
        }}>
          {[
            { number: '29', label: 'Anos de história', icon: '📅' },
            { number: '500+', label: 'Famílias atendidas', icon: '👨‍👩‍👧‍👦' },
            { number: '15', label: 'Projetos ativos', icon: '🎯' },
            { number: 'R$ 2M+', label: 'Investidos', icon: '💰' }
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                background: 'white',
                padding: 24,
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseOut={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 'bold', color: '#005EB8', marginBottom: 4 }}>{stat.number}</div>
              <div style={{ fontSize: 14, color: '#666' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 42, fontWeight: 'bold', color: '#005EB8', marginBottom: 16 }}>
              Sobre o Rotary Boulevard
            </h2>
            <p style={{ fontSize: 18, color: '#666', maxWidth: 700, margin: '0 auto' }}>
              Somos parte da maior rede de líderes comunitários do mundo
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
            {[
              { icon: '🤝', title: 'Companheirismo', desc: 'Construímos amizades duradouras baseadas em confiança e respeito mútuo' },
              { icon: '💡', title: 'Liderança', desc: 'Desenvolvemos líderes que fazem a diferença em suas comunidades' },
              { icon: '❤️', title: 'Serviço', desc: 'Colocamos as necessidades dos outros em primeiro lugar através da ação' }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: 32,
                  background: '#f8f9fa',
                  borderRadius: 12,
                  textAlign: 'center',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.background = '#005EB8';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.background = '#f8f9fa';
                  e.currentTarget.style.color = '#333';
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>{item.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.9 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJETOS */}
      <section id="projetos" style={{ padding: '80px 24px', background: 'linear-gradient(to bottom, #f5f5f5 0%, white 100%)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 42, fontWeight: 'bold', color: '#005EB8', marginBottom: 16 }}>
              🎯 Nossos Projetos
            </h2>
            <p style={{ fontSize: 18, color: '#666' }}>Conheça as iniciativas que transformam vidas</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
            {/* Noite Italiana */}
            <div
              style={{
                background: 'white',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{
                height: 220,
                background: 'linear-gradient(135deg, #005EB8 0%, #F7A81B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 72
              }}>
                🍝
              </div>
              <div style={{ padding: 24 }}>
                <span style={{ display: 'inline-block', background: '#28a745', color: 'white', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>✓ Ativo</span>
                <h3 style={{ fontSize: 24, fontWeight: 'bold', color: '#005EB8', marginBottom: 12 }}>Noite Italiana 2026</h3>
                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6, marginBottom: 12 }}>
                  Jantar beneficente tradicional que reúne a comunidade em torno da gastronomia italiana e da solidariedade. Toda renda revertida para projetos sociais.
                </p>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.5, marginBottom: 12 }}>
                  Uma <strong>festa italiana</strong> é uma noite de mesa farta, massas e risotos, vinho e sobremesas típicas, em ambiente acolhedor. É a tradição da boa comida e do encontro entre amigos e familiares, com propósito solidário: cada convite (R$ 100,00) ajuda a financiar ações do Rotary na comunidade.
                </p>
                <p style={{ fontSize: 14, color: '#005EB8', fontWeight: 600, marginBottom: 16 }}>📅 15 de maio de 2026</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #f0f0f0', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 14, color: '#666' }}>Convite: R$ 100,00</span>
                  <Link href="/convite"><button style={{ background: '#F7A81B', color: 'white', padding: '8px 20px', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Eu quero um convite →</button></Link>
                </div>
              </div>
            </div>

            {/* Panetone Solidário */}
            <div
              style={{
                background: 'white',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{ height: 220, background: 'linear-gradient(135deg, #F7A81B 0%, #ffd700 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>🎄</div>
              <div style={{ padding: 24 }}>
                <span style={{ display: 'inline-block', background: '#ffc107', color: '#333', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>⏳ Em planejamento</span>
                <h3 style={{ fontSize: 24, fontWeight: 'bold', color: '#005EB8', marginBottom: 12 }}>Panetone Solidário</h3>
                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>
                  Campanha anual de arrecadação através da venda de panetones artesanais. Renda destinada a projetos de educação e assistência social.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: 14, color: '#666' }}>📅 Dezembro 2026</span>
                  <button style={{ background: '#6c757d', color: 'white', padding: '8px 20px', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Em breve →</button>
                </div>
              </div>
            </div>

            {/* Educação para Todos */}
            <div
              style={{
                background: 'white',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{ height: 220, background: 'linear-gradient(135deg, #6f42c1 0%, #9561e2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>📚</div>
              <div style={{ padding: 24 }}>
                <span style={{ display: 'inline-block', background: '#28a745', color: 'white', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>✓ Ativo</span>
                <h3 style={{ fontSize: 24, fontWeight: 'bold', color: '#005EB8', marginBottom: 12 }}>Educação para Todos</h3>
                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>
                  Programa contínuo de apoio educacional para crianças em situação de vulnerabilidade. Material escolar, reforço e acompanhamento.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: 14, color: '#666' }}>👨‍👩‍👧‍👦 120 famílias</span>
                  <button style={{ background: '#F7A81B', color: 'white', padding: '8px 20px', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Saiba mais →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" style={{ background: 'linear-gradient(135deg, #005EB8 0%, #0073d1 100%)', padding: '80px 24px', color: 'white' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 42, fontWeight: 'bold', marginBottom: 16 }}>Faça Parte</h2>
          <p style={{ fontSize: 18, marginBottom: 40, opacity: 0.9 }}>
            Junte-se a nós e ajude a transformar vidas na nossa comunidade
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 40 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: 32, borderRadius: 12, backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💼</div>
              <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Seja um Rotariano</h3>
              <p style={{ fontSize: 14, opacity: 0.9 }}>Participe das nossas reuniões e projetos</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: 32, borderRadius: 12, backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🤝</div>
              <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Seja Voluntário</h3>
              <p style={{ fontSize: 14, opacity: 0.9 }}>Contribua com seu tempo e talentos</p>
            </div>
          </div>
          <div style={{ background: 'white', color: '#333', padding: 32, borderRadius: 12, textAlign: 'left' }}>
            <h4 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#005EB8' }}>Entre em Contato</h4>
            <div style={{ display: 'grid', gap: 12, fontSize: 15 }}>
              <div>📍 Ribeirão Preto - SP, Brasil</div>
              <div>📧 contato@rotaryboulevard.org.br</div>
              <div>📱 (16) XXXX-XXXX</div>
              <div>🕐 Reuniões: Toda terça-feira, 20h</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#1a1a1a', color: 'white', padding: '40px 24px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, background: '#005EB8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 'bold' }}>R</div>
              <div style={{ fontWeight: 'bold', fontSize: 16 }}>Rotary Boulevard de Ribeirão Preto</div>
            </div>
            <p style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.6 }}>
              Servindo a comunidade desde 1995. Parte do Rotary International, a maior rede de líderes comunitários do mundo.
            </p>
          </div>
          <div>
            <h5 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>Links Rápidos</h5>
            <div style={{ display: 'grid', gap: 8, fontSize: 14, opacity: 0.7 }}>
              <a href="#sobre" style={{ color: 'white', textDecoration: 'none' }}>Sobre</a>
              <a href="#projetos" style={{ color: 'white', textDecoration: 'none' }}>Projetos</a>
              <Link href="/convite" style={{ color: 'white', textDecoration: 'none' }}>Quero um convite</Link>
              <a href="#contato" style={{ color: 'white', textDecoration: 'none' }}>Contato</a>
              <Link href="/login" style={{ color: 'white', textDecoration: 'none' }}>Portal</Link>
            </div>
          </div>
          <div>
            <h5 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>Redes Sociais</h5>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', fontSize: 14, transition: 'background 0.3s' }} onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = '#005EB8'; }} onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}>F</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', fontSize: 12, transition: 'background 0.3s' }} onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = '#005EB8'; }} onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}>IG</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', fontSize: 12, transition: 'background 0.3s' }} onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = '#005EB8'; }} onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}>in</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, textAlign: 'center', fontSize: 14, opacity: 0.6 }}>
          © 2026 Rotary Boulevard de Ribeirão Preto. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

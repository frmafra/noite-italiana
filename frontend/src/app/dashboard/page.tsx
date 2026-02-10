'use client';
import { useEffect, useState } from 'react';

export default function DashboardProjeto() {
  const [projeto, setProjeto] = useState<any>(null);

  useEffect(() => {
    const id = localStorage.getItem('projeto_id');
    fetch(`http://213.199.51.121:4001/api/projetos`) // Aqui buscaríamos o detalhe do projeto
      .then(res => res.json())
      .then(data => {
        const atual = data.find((p:any) => p.id == id);
        setProjeto(atual);
      });
  }, []);

  const modulos = [
    { title: '👥 Comitê', link: '/comite', color: '#2e7d32' },
    { title: '📝 Atas', link: '/atas', color: '#555' },
    { title: '💰 Financeiro', link: '/financeiro', color: '#d32f2f' },
    { title: '📅 Cronograma', link: '/cronograma', color: '#005daa' },
    { title: '🎫 Ingressos', link: '/convites', color: '#ff9800' },
    { title: '🤝 Doações/Entidades', link: '/destinacao', color: '#9c27b0' }
  ];

  if (!projeto) return <p>Carregando...</p>;

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h1>{projeto.nome}</h1>
          <span style={{ 
            padding: '5px 15px', 
            borderRadius: '20px', 
            backgroundColor: projeto.status === 'Ativo' ? '#e8f5e9' : '#ffebee',
            color: projeto.status === 'Ativo' ? '#2e7d32' : '#c62828',
            fontWeight: 'bold'
          }}>{projeto.status}</span>
        </div>
        <p style={{ color: '#666' }}>{projeto.descricao}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {modulos.map(m => (
          <div key={m.link} onClick={() => window.location.href = m.link}
               style={{ 
                 padding: '25px', background: 'white', borderRadius: '12px', textAlign: 'center', 
                 cursor: 'pointer', borderBottom: `5px solid ${m.color}`, transition: 'transform 0.2s' 
               }}>
            <h3 style={{ margin: 0 }}>{m.title}</h3>
          </div>
        ))}
      </div>
      
      <button onClick={() => window.location.href = '/portal'} style={{ marginTop: '30px', padding: '10px', cursor: 'pointer' }}>Voltar ao Portal</button>
    </div>
  );
}

'use client';
import Link from 'next/link';

export default function DocumentacaoPage() {
  const manual = [
    { t: '👥 Comitê Operacional', d: 'É onde os líderes (como o Alcides ou a Tonnia) gerenciam seus voluntários e marcam o que já foi feito no plano de ação. É o "chão de fábrica" do evento.' },
    { t: '🤝 Fornecedores', d: 'A agenda telefônica do evento. Aqui cadastramos quem vende a massa, quem faz o som e quem limpa o salão.' },
    { t: '📦 Catálogo de Produtos', d: 'Onde definimos o que o evento consome (ex: Vinho, TNT, Carne). É a base para ninguém pedir nada com nome errado.' },
    { t: '🛒 Central de Compras', d: 'O coração logístico. Aqui o Mafra vê os pedidos de todos, faz 3 orçamentos e escolhe o ganhador.' },
    { t: '💰 Financeiro', d: 'Onde o Leandro controla o que já foi pago e o que ainda temos de saldo no caixa.' },
    { t: '📄 Atas de Reunião', d: 'Registro oficial. Serve para ninguém esquecer o que foi combinado nas reuniões de segunda-feira.' },
    { t: '🏗️ Projetos', d: 'Área administrativa para criar novos eventos (ex: Almoço de Páscoa) usando a mesma estrutura.' }
  ];

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
      <Link href="/portal">← Voltar ao Portal</Link>
      <h1 style={{ color: '#005daa' }}>📖 Guia de Utilização do Portal</h1>
      <p>Bem-vindo à equipe! Este portal foi criado para organizar a <strong>Noite Italiana 2026</strong>. Abaixo, entenda cada módulo:</p>
      
      {manual.map((item, i) => (
        <div key={i} style={{ marginBottom: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '12px', borderLeft: '5px solid #005daa' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>{item.t}</h3>
          <p style={{ margin: 0, color: '#444' }}>{item.d}</p>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';

const API_BASE = 'http://213.199.51.121:4001';
const VALOR_CONVITE = 100;

export default function ConvitePage() {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [whatsapp, setWhatsapp] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const total = quantidade * VALOR_CONVITE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const res = await fetch(`${API_BASE}/api/solicitacoes-convite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_solicitante: nome.trim(),
          quantidade_convites: quantidade,
          whatsapp: whatsapp.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.error || 'Não foi possível enviar. Tente novamente.');
        setCarregando(false);
        return;
      }
      setEnviado(true);
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    }
    setCarregando(false);
  };

  if (enviado) {
    return (
      <div className="page-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>✅</div>
          <h1 style={{ color: '#28a745', marginBottom: 16 }}>Solicitação enviada!</h1>
          <p style={{ fontSize: 18, color: '#555', lineHeight: 1.6 }}>
            Obrigado pelo interesse na Noite Italiana 2026. Entraremos em contato em breve pelo WhatsApp para confirmar seu convite.
          </p>
          <Link href="/" style={{ display: 'inline-block', marginTop: 24, color: '#005daa', fontWeight: 600 }}>← Voltar à página inicial</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ minHeight: '80vh', fontFamily: 'sans-serif', paddingTop: 40, paddingBottom: 60 }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Link href="/#projetos" style={{ color: '#005daa', textDecoration: 'none', marginBottom: 24, display: 'inline-block' }}>← Voltar</Link>
        <div style={{ background: 'linear-gradient(135deg, #005EB8 0%, #F7A81B 100%)', padding: 32, borderRadius: 16, color: 'white', marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, margin: '0 0 8px 0' }}>🍝 Noite Italiana 2026</h1>
          <p style={{ margin: 0, opacity: 0.95 }}>15 de maio de 2026 · Jantar beneficente</p>
          <p style={{ margin: '16px 0 0', fontSize: 15 }}>Convite: R$ {VALOR_CONVITE},00 (valor único)</p>
        </div>

        <h2 style={{ color: '#333', marginBottom: 16 }}>Eu quero um convite</h2>
        <p style={{ color: '#666', marginBottom: 24 }}>Preencha os dados abaixo. Entraremos em contato para confirmar e combinar a forma de pagamento.</p>

        <form onSubmit={handleSubmit} style={{ background: '#f8f9fa', padding: 28, borderRadius: 12 }}>
          {erro && <div style={{ padding: 12, background: '#ffebee', color: '#c62828', borderRadius: 8, marginBottom: 16 }}>{erro}</div>}
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>Nome completo *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="Seu nome"
            style={{ width: '100%', padding: 14, border: '1px solid #ccc', borderRadius: 8, marginBottom: 16, fontSize: 16 }}
          />
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>Quantidade de convites *</label>
          <input
            type="number"
            min={1}
            max={20}
            value={quantidade}
            onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value, 10) || 1))}
            style={{ width: '100%', padding: 14, border: '1px solid #ccc', borderRadius: 8, marginBottom: 16, fontSize: 16 }}
          />
          <p style={{ fontSize: 14, color: '#666', margin: '-8px 0 16px' }}>Valor por convite: R$ {VALOR_CONVITE},00 · Total: R$ {total.toLocaleString('pt-BR')},00</p>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333' }}>WhatsApp</label>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(16) 99999-9999"
            style={{ width: '100%', padding: 14, border: '1px solid #ccc', borderRadius: 8, marginBottom: 24, fontSize: 16 }}
          />
          <button
            type="submit"
            disabled={carregando}
            style={{
              width: '100%',
              padding: 16,
              background: carregando ? '#999' : '#F7A81B',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 600,
              cursor: carregando ? 'not-allowed' : 'pointer',
            }}
          >
            {carregando ? 'Enviando...' : 'Enviar solicitação'}
          </button>
        </form>
      </div>
    </div>
  );
}

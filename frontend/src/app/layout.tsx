// @ts-nocheck
'use client';
import './globals.css';
import AuthGuard from './AuthGuard';

export default function RootLayout({ children }) {
  const handleWhatsapp = () => {
    const local = window.location.pathname;
    const msg = encodeURIComponent(`Olá Suporte! Estou no Portal Noite Italiana, na página [${local}], e preciso de uma ajuda.`);
    window.open(`https://wa.me/5511976214583?text=${msg}`, '_blank');
  };

  return (
    <html lang="pt-br">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body style={{ margin: 0, background: '#f0f2f5' }}>
        <AuthGuard>{children}</AuthGuard>
        
        {/* BOTÃO FLUTUANTE DE WHATSAPP */}
        <div 
          className="whatsapp-float"
          onClick={handleWhatsapp}
          style={{ 
            position: 'fixed', bottom: '20px', right: '20px', 
            background: '#25d366', color: 'white', padding: '15px 25px', 
            borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)', zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: '10px'
          }}
        >
          <span>💬 Suporte (Dúvidas)</span>
        </div>
      </body>
    </html>
  );
}

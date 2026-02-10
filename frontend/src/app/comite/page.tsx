// @ts-nocheck
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ComiteContent() {
  const params = useSearchParams();
  const projetoId = params.get('projetoId');
  const [departamentos, setDepartamentos] = useState([]);

  useEffect(() => {
    const url = projetoId 
      ? `http://213.199.51.121:4001/api/departamentos?projeto_id=${projetoId}`
      : `http://213.199.51.121:4001/api/departamentos`;
    fetch(url).then(r => r.json()).then(setDepartamentos);
  }, [projetoId]);

  return (
    <div className="page-container" style={{ fontFamily: 'sans-serif' }}>
      <Link href="/portal">← Voltar ao Portal</Link>
      <h1 style={{ color: '#005daa', marginTop: '20px' }}>📂 Pastas Operacionais</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
        {departamentos.map(d => (
          <div key={d.id} style={{ background: '#fff', padding: '30px', borderRadius: '20px', borderTop: '10px solid #005daa', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: 0 }}>{d.nome}</h3>
            <p style={{ color: '#888' }}>Coordenador: <b>{d.coordenador_nome}</b></p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComitePage() {
  return (
    <Suspense fallback={<div style={{padding:'50px'}}>Carregando painel...</div>}>
      <ComiteContent />
    </Suspense>
  );
}

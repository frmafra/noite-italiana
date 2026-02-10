-- Solicitações de convite para a Noite Italiana (formulário público "Eu quero um convite")
CREATE TABLE IF NOT EXISTS solicitacoes_convite (
  id SERIAL PRIMARY KEY,
  nome_solicitante VARCHAR(255) NOT NULL,
  quantidade_convites INTEGER NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  whatsapp VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_convite_created ON solicitacoes_convite(created_at DESC);

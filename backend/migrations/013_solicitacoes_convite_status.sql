-- Melhoria do funil: status, responsável, datas e dados de conclusão
ALTER TABLE solicitacoes_convite
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'NOVO',
  ADD COLUMN IF NOT EXISTS responsavel_id INTEGER REFERENCES voluntarios_master(id),
  ADD COLUMN IF NOT EXISTS contatado_em TIMESTAMP,
  ADD COLUMN IF NOT EXISTS concluido_em TIMESTAMP,
  ADD COLUMN IF NOT EXISTS valor_final DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(100),
  ADD COLUMN IF NOT EXISTS observacoes TEXT;

CREATE INDEX IF NOT EXISTS idx_solicitacoes_convite_status ON solicitacoes_convite(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_convite_responsavel ON solicitacoes_convite(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_convite_contatado ON solicitacoes_convite(contatado_em);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_convite_concluido ON solicitacoes_convite(concluido_em);

UPDATE solicitacoes_convite SET status = 'NOVO' WHERE status IS NULL;

-- Campos adicionais em produtos_base
ALTER TABLE produtos_base
  ADD COLUMN IF NOT EXISTS fornecedor VARCHAR(255),
  ADD COLUMN IF NOT EXISTS descricao TEXT,
  ADD COLUMN IF NOT EXISTS codigo_interno VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_base_categoria ON produtos_base(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_base_ativo ON produtos_base(ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_base_nome ON produtos_base(nome);

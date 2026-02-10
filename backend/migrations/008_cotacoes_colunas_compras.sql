-- Cotacoes: tabela existia com schema antigo. Adiciona colunas do fluxo Compras (006).

ALTER TABLE cotacoes ADD COLUMN IF NOT EXISTS numero VARCHAR(50) UNIQUE;
ALTER TABLE cotacoes ADD COLUMN IF NOT EXISTS contato_fornecedor VARCHAR(255);
ALTER TABLE cotacoes ADD COLUMN IF NOT EXISTS data_cotacao DATE DEFAULT CURRENT_DATE;
ALTER TABLE cotacoes ADD COLUMN IF NOT EXISTS condicoes_pagamento TEXT;
ALTER TABLE cotacoes ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE cotacoes ADD COLUMN IF NOT EXISTS valor_total DECIMAL(10,2) DEFAULT 0;
ALTER TABLE cotacoes ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'em_analise';
ALTER TABLE cotacoes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE cotacoes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- numero: índice único para evitar duplicatas (numero pode ser NULL em registros antigos)
CREATE UNIQUE INDEX IF NOT EXISTS cotacoes_numero_key ON cotacoes(numero) WHERE numero IS NOT NULL;

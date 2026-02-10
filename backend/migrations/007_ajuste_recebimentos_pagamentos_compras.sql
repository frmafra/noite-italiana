-- Ajuste: tabelas recebimentos e pagamentos já existiam com outro schema (financeiro).
-- Adiciona colunas necessárias para o fluxo de Compras (Fases 1-5) sem quebrar uso existente.

-- RECEBIMENTOS: colunas do fluxo compras (pedido, NF, valor_nf)
ALTER TABLE recebimentos ADD COLUMN IF NOT EXISTS pedido_id INTEGER REFERENCES pedidos_compra(id);
ALTER TABLE recebimentos ADD COLUMN IF NOT EXISTS numero_nf VARCHAR(100);
ALTER TABLE recebimentos ADD COLUMN IF NOT EXISTS data_nf DATE;
ALTER TABLE recebimentos ADD COLUMN IF NOT EXISTS valor_nf DECIMAL(10,2);
ALTER TABLE recebimentos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- PAGAMENTOS: colunas do fluxo contas a pagar
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS conta_pagar_id INTEGER REFERENCES contas_pagar(id);
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_recebimentos_pedido ON recebimentos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_conta_pagar ON pagamentos(conta_pagar_id);

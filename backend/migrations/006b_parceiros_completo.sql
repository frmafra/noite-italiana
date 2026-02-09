-- Parceiros de Negócios: unificar fornecedores com flags (fornecedor/cliente/entidade)
-- 0. Se já existir tabela "parceiros", renomear para não conflitar
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'parceiros') THEN
    ALTER TABLE parceiros RENAME TO parceiros_legacy;
  END IF;
END $$;
-- 1. Renomear tabela fornecedores para parceiros
ALTER TABLE fornecedores RENAME TO parceiros;

-- 2. Adicionar campos de tipo (flags)
ALTER TABLE parceiros
  ADD COLUMN IF NOT EXISTS eh_fornecedor BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS eh_cliente BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS eh_entidade BOOLEAN DEFAULT false;

-- 3. Migrar dados existentes (marcar todos como fornecedor)
UPDATE parceiros
SET eh_fornecedor = true
WHERE eh_fornecedor IS NULL OR eh_fornecedor = false;

-- 4. Atualizar FKs nas outras tabelas (renomear constraint, referência já aponta para parceiros)
ALTER TABLE cotacoes
  DROP CONSTRAINT IF EXISTS cotacoes_fornecedor_id_fkey;
ALTER TABLE cotacoes
  ADD CONSTRAINT cotacoes_parceiro_id_fkey
  FOREIGN KEY (fornecedor_id) REFERENCES parceiros(id);

ALTER TABLE pedidos_compra
  DROP CONSTRAINT IF EXISTS pedidos_compra_fornecedor_id_fkey;
ALTER TABLE pedidos_compra
  ADD CONSTRAINT pedidos_compra_parceiro_id_fkey
  FOREIGN KEY (fornecedor_id) REFERENCES parceiros(id);

ALTER TABLE contas_pagar
  DROP CONSTRAINT IF EXISTS contas_pagar_fornecedor_id_fkey;
ALTER TABLE contas_pagar
  ADD CONSTRAINT contas_pagar_parceiro_id_fkey
  FOREIGN KEY (fornecedor_id) REFERENCES parceiros(id);

-- 5. Índices
CREATE INDEX IF NOT EXISTS idx_parceiros_eh_fornecedor ON parceiros(eh_fornecedor);
CREATE INDEX IF NOT EXISTS idx_parceiros_eh_cliente ON parceiros(eh_cliente);
CREATE INDEX IF NOT EXISTS idx_parceiros_eh_entidade ON parceiros(eh_entidade);

-- Sistema bancário integrado: contas, movimentações e vínculo com pagamentos

-- 1. Tabela de contas bancárias
CREATE TABLE IF NOT EXISTS contas_bancarias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'conta_corrente',
  banco VARCHAR(100),
  agencia VARCHAR(20),
  conta VARCHAR(30),
  saldo_inicial DECIMAL(12,2) DEFAULT 0,
  saldo_atual DECIMAL(12,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabela de movimentações bancárias
CREATE TABLE IF NOT EXISTS movimentacoes_bancarias (
  id SERIAL PRIMARY KEY,
  conta_bancaria_id INTEGER NOT NULL REFERENCES contas_bancarias(id),
  tipo VARCHAR(50) NOT NULL,
  data DATE NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  categoria VARCHAR(100),
  pagamento_id INTEGER REFERENCES pagamentos(id),
  conta_pagar_id INTEGER REFERENCES contas_pagar(id),
  recebimento_id INTEGER REFERENCES recebimentos(id),
  saldo_anterior DECIMAL(12,2),
  saldo_posterior DECIMAL(12,2),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Adicionar conta_bancaria_id em pagamentos (forma_pagamento já pode existir)
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS conta_bancaria_id INTEGER REFERENCES contas_bancarias(id);
ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(100);

-- Tornar descricao nullable para compatibilidade (sempre preencher na aplicação)
ALTER TABLE pagamentos ALTER COLUMN descricao DROP NOT NULL;

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_movimentacoes_conta ON movimentacoes_bancarias(conta_bancaria_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes_bancarias(data);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON movimentacoes_bancarias(tipo);
CREATE INDEX IF NOT EXISTS idx_pagamentos_conta_bancaria ON pagamentos(conta_bancaria_id);

-- 5. Conta "Caixa Geral" padrão (só se não existir)
INSERT INTO contas_bancarias (nome, tipo, saldo_inicial, saldo_atual)
SELECT 'Caixa Geral', 'caixa', 0, 0
WHERE NOT EXISTS (SELECT 1 FROM contas_bancarias WHERE nome = 'Caixa Geral' AND tipo = 'caixa');

-- 6. Função para atualizar saldo ao inserir movimentação
CREATE OR REPLACE FUNCTION atualizar_saldo_bancario()
RETURNS TRIGGER AS $$
DECLARE
  v_saldo DECIMAL(12,2);
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.saldo_anterior IS NULL THEN
      SELECT saldo_atual INTO v_saldo FROM contas_bancarias WHERE id = NEW.conta_bancaria_id;
      NEW.saldo_anterior := COALESCE(v_saldo, 0);
    END IF;

    IF NEW.tipo = 'entrada' THEN
      NEW.saldo_posterior := NEW.saldo_anterior + NEW.valor;
      UPDATE contas_bancarias
      SET saldo_atual = saldo_atual + NEW.valor, updated_at = NOW()
      WHERE id = NEW.conta_bancaria_id;
    ELSE
      NEW.saldo_posterior := NEW.saldo_anterior - NEW.valor;
      UPDATE contas_bancarias
      SET saldo_atual = saldo_atual - NEW.valor, updated_at = NOW()
      WHERE id = NEW.conta_bancaria_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_saldo ON movimentacoes_bancarias;
CREATE TRIGGER trigger_atualizar_saldo
  BEFORE INSERT ON movimentacoes_bancarias
  FOR EACH ROW
  EXECUTE PROCEDURE atualizar_saldo_bancario();

-- ============================================================
-- SISTEMA COMPRAS (ERP): Fornecedores + Solicitações → Cotações → Pedidos → Recebimento → Contas a Pagar
-- ============================================================

-- 0. FORNECEDORES (expandir tabela existente ou criar completa)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fornecedores') THEN
    CREATE TABLE fornecedores (
      id SERIAL PRIMARY KEY,
      razao_social VARCHAR(255) NOT NULL,
      nome_fantasia VARCHAR(255),
      nome VARCHAR(255),
      cnpj VARCHAR(18) UNIQUE,
      cpf VARCHAR(14),
      tipo VARCHAR(50) DEFAULT 'juridica',
      inscricao_estadual VARCHAR(50),
      telefone VARCHAR(20),
      celular VARCHAR(20),
      email VARCHAR(255),
      site VARCHAR(255),
      cep VARCHAR(10),
      logradouro VARCHAR(255),
      numero VARCHAR(20),
      complemento VARCHAR(100),
      bairro VARCHAR(100),
      cidade VARCHAR(100),
      estado VARCHAR(2),
      banco VARCHAR(100),
      agencia VARCHAR(20),
      conta VARCHAR(30),
      pix VARCHAR(255),
      contato_comercial VARCHAR(255),
      email_comercial VARCHAR(255),
      telefone_comercial VARCHAR(20),
      observacoes TEXT,
      ativo BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  ELSE
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS razao_social VARCHAR(255);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS nome_fantasia VARCHAR(255);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS cpf VARCHAR(14);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'juridica';
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS inscricao_estadual VARCHAR(50);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS celular VARCHAR(20);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS site VARCHAR(255);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS logradouro VARCHAR(255);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS numero VARCHAR(20);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS complemento VARCHAR(100);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS bairro VARCHAR(100);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS estado VARCHAR(2);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS banco VARCHAR(100);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS agencia VARCHAR(20);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS conta VARCHAR(30);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS pix VARCHAR(255);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS contato_comercial VARCHAR(255);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS email_comercial VARCHAR(255);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS telefone_comercial VARCHAR(20);
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS observacoes TEXT;
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
    ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    UPDATE fornecedores SET razao_social = nome WHERE razao_social IS NULL AND nome IS NOT NULL;
    UPDATE fornecedores SET nome_fantasia = nome WHERE nome_fantasia IS NULL AND nome IS NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_fornecedores_cnpj ON fornecedores(cnpj);
CREATE INDEX IF NOT EXISTS idx_fornecedores_ativo ON fornecedores(ativo);

-- 1. SOLICITAÇÕES DE COMPRA
CREATE TABLE IF NOT EXISTS solicitacoes_compra (
  id SERIAL PRIMARY KEY,
  numero VARCHAR(50) UNIQUE,
  projeto_id INTEGER REFERENCES projetos(id),
  area_projeto_id INTEGER REFERENCES areas_projeto(id),
  requisitante_id INTEGER REFERENCES voluntarios_master(id),
  data_solicitacao DATE DEFAULT CURRENT_DATE,
  justificativa TEXT,
  status VARCHAR(50) DEFAULT 'rascunho',
  valor_total DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. ITENS DA SOLICITAÇÃO
CREATE TABLE IF NOT EXISTS solicitacoes_itens (
  id SERIAL PRIMARY KEY,
  solicitacao_id INTEGER REFERENCES solicitacoes_compra(id) ON DELETE CASCADE,
  produto_base_id INTEGER REFERENCES produtos_base(id),
  descricao TEXT,
  quantidade DECIMAL(10,2) NOT NULL,
  unidade VARCHAR(50),
  preco_estimado DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. COTAÇÕES
CREATE TABLE IF NOT EXISTS cotacoes (
  id SERIAL PRIMARY KEY,
  numero VARCHAR(50) UNIQUE,
  solicitacao_id INTEGER REFERENCES solicitacoes_compra(id),
  fornecedor_id INTEGER REFERENCES fornecedores(id),
  contato_fornecedor VARCHAR(255),
  data_cotacao DATE DEFAULT CURRENT_DATE,
  prazo_entrega INTEGER,
  condicoes_pagamento TEXT,
  observacoes TEXT,
  valor_total DECIMAL(10,2) DEFAULT 0,
  vencedora BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'em_analise',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. ITENS DA COTAÇÃO
CREATE TABLE IF NOT EXISTS cotacoes_itens (
  id SERIAL PRIMARY KEY,
  cotacao_id INTEGER REFERENCES cotacoes(id) ON DELETE CASCADE,
  solicitacao_item_id INTEGER REFERENCES solicitacoes_itens(id),
  produto_base_id INTEGER REFERENCES produtos_base(id),
  descricao TEXT,
  quantidade DECIMAL(10,2) NOT NULL,
  unidade VARCHAR(50),
  preco_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. PEDIDOS DE COMPRA
CREATE TABLE IF NOT EXISTS pedidos_compra (
  id SERIAL PRIMARY KEY,
  numero VARCHAR(50) UNIQUE,
  cotacao_id INTEGER REFERENCES cotacoes(id),
  solicitacao_id INTEGER REFERENCES solicitacoes_compra(id),
  fornecedor_id INTEGER REFERENCES fornecedores(id),
  data_pedido DATE DEFAULT CURRENT_DATE,
  prazo_entrega DATE,
  condicoes_pagamento TEXT,
  valor_total DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'aguardando',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. ITENS DO PEDIDO
CREATE TABLE IF NOT EXISTS pedidos_itens (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos_compra(id) ON DELETE CASCADE,
  cotacao_item_id INTEGER REFERENCES cotacoes_itens(id),
  produto_base_id INTEGER REFERENCES produtos_base(id),
  descricao TEXT,
  quantidade DECIMAL(10,2) NOT NULL,
  quantidade_recebida DECIMAL(10,2) DEFAULT 0,
  unidade VARCHAR(50),
  preco_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. RECEBIMENTOS / NOTAS FISCAIS
CREATE TABLE IF NOT EXISTS recebimentos (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos_compra(id),
  numero_nf VARCHAR(100),
  data_recebimento DATE DEFAULT CURRENT_DATE,
  data_nf DATE,
  valor_nf DECIMAL(10,2),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. ITENS RECEBIDOS
CREATE TABLE IF NOT EXISTS recebimentos_itens (
  id SERIAL PRIMARY KEY,
  recebimento_id INTEGER REFERENCES recebimentos(id) ON DELETE CASCADE,
  pedido_item_id INTEGER REFERENCES pedidos_itens(id),
  quantidade_recebida DECIMAL(10,2) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. CONTAS A PAGAR
CREATE TABLE IF NOT EXISTS contas_pagar (
  id SERIAL PRIMARY KEY,
  recebimento_id INTEGER REFERENCES recebimentos(id),
  pedido_id INTEGER REFERENCES pedidos_compra(id),
  fornecedor_id INTEGER REFERENCES fornecedores(id),
  numero_documento VARCHAR(100),
  data_emissao DATE,
  data_vencimento DATE NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'aberto',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. PAGAMENTOS
CREATE TABLE IF NOT EXISTS pagamentos (
  id SERIAL PRIMARY KEY,
  conta_pagar_id INTEGER REFERENCES contas_pagar(id),
  data_pagamento DATE NOT NULL,
  valor_pago DECIMAL(10,2) NOT NULL,
  forma_pagamento VARCHAR(100),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_solicitacoes_projeto ON solicitacoes_compra(projeto_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes_compra(status);
CREATE INDEX IF NOT EXISTS idx_cotacoes_solicitacao ON cotacoes(solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_cotacoes_fornecedor ON cotacoes(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos_compra(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_fornecedor ON pedidos_compra(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_fornecedor ON contas_pagar(fornecedor_id);

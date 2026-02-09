-- Campos adicionais em voluntarios_master (tabela existente no projeto)
ALTER TABLE voluntarios_master
  ADD COLUMN IF NOT EXISTS nome_completo VARCHAR(255),
  ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20),
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS cpf VARCHAR(14),
  ADD COLUMN IF NOT EXISTS data_nascimento DATE,
  ADD COLUMN IF NOT EXISTS endereco_rua VARCHAR(255),
  ADD COLUMN IF NOT EXISTS endereco_numero VARCHAR(20),
  ADD COLUMN IF NOT EXISTS endereco_bairro VARCHAR(100),
  ADD COLUMN IF NOT EXISTS endereco_cidade VARCHAR(100),
  ADD COLUMN IF NOT EXISTS endereco_estado VARCHAR(2),
  ADD COLUMN IF NOT EXISTS endereco_cep VARCHAR(10);

-- Preencher nome_completo a partir de nome onde estiver vazio (compatibilidade)
UPDATE voluntarios_master SET nome_completo = nome WHERE nome_completo IS NULL AND nome IS NOT NULL;
UPDATE voluntarios_master SET whatsapp = telefone WHERE whatsapp IS NULL AND telefone IS NOT NULL;

-- Tabela de períodos de atuação
CREATE TABLE IF NOT EXISTS voluntarios_periodos (
  id SERIAL PRIMARY KEY,
  voluntario_id INTEGER NOT NULL REFERENCES voluntarios_master(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  funcao VARCHAR(100),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voluntarios_periodos_voluntario
  ON voluntarios_periodos(voluntario_id);

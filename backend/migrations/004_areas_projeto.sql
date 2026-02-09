-- Tabela de áreas/pastas por projeto (estrutura de custos por projeto)
CREATE TABLE IF NOT EXISTS areas_projeto (
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_areas_projeto_projeto ON areas_projeto(projeto_id);
CREATE INDEX IF NOT EXISTS idx_areas_projeto_ordem ON areas_projeto(ordem);

-- Tabela de atas de reunião
CREATE TABLE IF NOT EXISTS atas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  data_reuniao TIMESTAMP NOT NULL,
  projeto_id INTEGER REFERENCES projetos(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_atas_projeto ON atas(projeto_id);
CREATE INDEX IF NOT EXISTS idx_atas_data ON atas(data_reuniao DESC);

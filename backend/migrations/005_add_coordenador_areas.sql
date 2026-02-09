-- Adicionar campo coordenador_id em areas_projeto
ALTER TABLE areas_projeto
  ADD COLUMN IF NOT EXISTS coordenador_id INTEGER REFERENCES voluntarios_master(id);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_areas_projeto_coordenador
  ON areas_projeto(coordenador_id);

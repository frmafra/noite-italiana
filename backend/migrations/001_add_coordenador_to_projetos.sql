-- Adiciona coluna coordenador_id à tabela projetos (referência a voluntarios_master)
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS coordenador_id integer REFERENCES voluntarios_master(id);

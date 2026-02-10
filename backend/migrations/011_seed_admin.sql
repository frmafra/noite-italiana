-- Usuário administrador do portal (login: admin, senha: Luma110703)
INSERT INTO voluntarios_master (
  nome, nome_completo, telefone, email, login, senha, is_coordenador, status_vinculo, ativo
)
SELECT
  'Administrador',
  'Administrador',
  '',
  NULL,
  'admin',
  'Luma110703',
  false,
  'Administrador',
  true
WHERE NOT EXISTS (SELECT 1 FROM voluntarios_master WHERE login = 'admin');

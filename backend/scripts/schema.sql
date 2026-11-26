CREATE TABLE IF NOT EXISTS pacientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  nascimento DATE NOT NULL,
  telefone VARCHAR(30) NOT NULL DEFAULT ''
);

-- Atualiza com segurança uma tabela criada na versão anterior da atividade.
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS telefone VARCHAR(30) NOT NULL DEFAULT '';

-- Dados fictícios que já vinham no projeto.
INSERT INTO pacientes (nome, email, nascimento, telefone) VALUES
  ('Ana Souza', 'ana.souza@example.com', '1990-05-10', '(11) 99999-1111'),
  ('Bruno Lima', 'bruno.lima@example.com', '1985-09-20', '(11) 99999-2222')
ON CONFLICT (email) DO NOTHING;

SELECT setval(
  pg_get_serial_sequence('pacientes', 'id'),
  GREATEST(COALESCE((SELECT MAX(id) FROM pacientes), 1), 1),
  EXISTS (SELECT 1 FROM pacientes)
);

-- Fix analistas table - add all missing columns

-- Add missing columns
DO $$
BEGIN
  -- senha
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'senha') THEN
    ALTER TABLE analistas ADD COLUMN senha TEXT;
  END IF;

  -- telefone
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'telefone') THEN
    ALTER TABLE analistas ADD COLUMN telefone TEXT;
  END IF;

  -- empresa
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'empresa') THEN
    ALTER TABLE analistas ADD COLUMN empresa TEXT;
  END IF;

  -- tipo
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'tipo') THEN
    ALTER TABLE analistas ADD COLUMN tipo TEXT DEFAULT 'empresa';
  END IF;

  -- licencas_total
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'licencas_total') THEN
    ALTER TABLE analistas ADD COLUMN licencas_total INTEGER DEFAULT 10;
  END IF;

  -- licencas_usadas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'licencas_usadas') THEN
    ALTER TABLE analistas ADD COLUMN licencas_usadas INTEGER DEFAULT 0;
  END IF;

  -- link_unico
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'link_unico') THEN
    ALTER TABLE analistas ADD COLUMN link_unico UUID DEFAULT gen_random_uuid();
  END IF;

  -- ativo
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'ativo') THEN
    ALTER TABLE analistas ADD COLUMN ativo BOOLEAN DEFAULT true;
  END IF;

  -- data_cadastro
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'data_cadastro') THEN
    ALTER TABLE analistas ADD COLUMN data_cadastro TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- ultimo_acesso
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'ultimo_acesso') THEN
    ALTER TABLE analistas ADD COLUMN ultimo_acesso TIMESTAMPTZ;
  END IF;

  -- cpf_cnpj
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'cpf_cnpj') THEN
    ALTER TABLE analistas ADD COLUMN cpf_cnpj TEXT;
  END IF;

  -- updated_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'updated_at') THEN
    ALTER TABLE analistas ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Insert the 3 analysts
INSERT INTO analistas (
  id, nome, email, senha, telefone, empresa, tipo,
  licencas_total, licencas_usadas, link_unico, ativo,
  data_cadastro, ultimo_acesso, cpf_cnpj, updated_at
) VALUES
(
  '64764447-c15f-43d2-9ed9-66cf42febd09',
  'Ederson Marques',
  'operacional1@assessoriaveon.com',
  'Eusouabussola',
  '45998386876',
  'Instituto Veon LTDA',
  'empresa',
  10,
  0,
  'f78ee024-487d-40b2-bc59-130bbbf55369',
  true,
  '2025-12-12 21:03:53.386578+00',
  NULL,
  '11552198995',
  NOW()
),
(
  'a500c828-599f-477a-a499-e8f35d5c4616',
  'Henrique Alves',
  'henriquealves01648@gmail.com',
  'Eufaturo1M$',
  '45998116723',
  'Instituto Veon LTDA',
  'empresa',
  10,
  1,
  '5804d05f-01b0-4f5c-883c-134f9aa45bfd',
  true,
  '2025-12-12 20:48:20.822571+00',
  '2025-12-12 21:20:26.697+00',
  '51065648000187',
  NOW()
),
(
  'aa146ce3-0083-4e99-adad-cc093dd165cd',
  'Hermes da Costa Marques',
  'hermescostaconsultor@gmail.com',
  'alterar1234',
  '65996090833',
  'MIND3',
  'empresa',
  10,
  3,
  'adf44014-20c6-441f-be20-2ed8837b8469',
  true,
  '2025-12-12 22:39:06.125442+00',
  '2025-12-12 22:40:15.416+00',
  '63436470000112',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  senha = EXCLUDED.senha,
  telefone = EXCLUDED.telefone,
  empresa = EXCLUDED.empresa,
  tipo = EXCLUDED.tipo,
  licencas_total = EXCLUDED.licencas_total,
  licencas_usadas = EXCLUDED.licencas_usadas,
  link_unico = EXCLUDED.link_unico,
  ativo = true,
  updated_at = NOW();

-- Verify
SELECT id, nome, email, ativo, licencas_total, licencas_usadas FROM analistas
WHERE id IN (
  '64764447-c15f-43d2-9ed9-66cf42febd09',
  'a500c828-599f-477a-a499-e8f35d5c4616',
  'aa146ce3-0083-4e99-adad-cc093dd165cd'
);

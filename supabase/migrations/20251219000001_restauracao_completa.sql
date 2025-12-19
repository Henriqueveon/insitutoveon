-- =====================================================
-- RESTAURAÇÃO COMPLETA DO BANCO DE DADOS VEON
-- Data: 19/12/2025
-- =====================================================

-- =====================================================
-- PASSO 1: GARANTIR ESTRUTURA DAS TABELAS
-- =====================================================

-- Criar tabela vagas_recrutamento se não existir
CREATE TABLE IF NOT EXISTS vagas_recrutamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas_recrutamento(id) ON DELETE CASCADE,
  titulo TEXT,
  descricao TEXT,
  faixa_salarial_min DECIMAL(10,2),
  faixa_salarial_max DECIMAL(10,2),
  regime TEXT,
  cidade TEXT,
  estado TEXT,
  modalidade TEXT,
  horario TEXT,
  beneficios TEXT,
  requisitos TEXT,
  palavras_funcionario_ideal TEXT,
  perfil_disc_ideal TEXT,
  status TEXT DEFAULT 'ativa',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  faixa_salarial TEXT,
  salario_minimo DECIMAL(10,2),
  salario_maximo DECIMAL(10,2),
  carga_horaria TEXT,
  endereco TEXT,
  perfil_disc_desejado TEXT,
  areas_conhecimento JSONB DEFAULT '[]',
  escolaridade_minima TEXT,
  experiencia_minima INTEGER DEFAULT 0,
  requer_cnh BOOLEAN DEFAULT false,
  categoria_cnh_requerida TEXT,
  requer_veiculo BOOLEAN DEFAULT false,
  quantidade_vagas INTEGER DEFAULT 1,
  urgente BOOLEAN DEFAULT false,
  encerrada_em TIMESTAMPTZ
);

-- Enable RLS on vagas
ALTER TABLE vagas_recrutamento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vagas_public_read" ON vagas_recrutamento;
CREATE POLICY "vagas_public_read" ON vagas_recrutamento FOR SELECT USING (true);
DROP POLICY IF EXISTS "vagas_insert" ON vagas_recrutamento;
CREATE POLICY "vagas_insert" ON vagas_recrutamento FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "vagas_update" ON vagas_recrutamento;
CREATE POLICY "vagas_update" ON vagas_recrutamento FOR UPDATE USING (true);
DROP POLICY IF EXISTS "vagas_delete" ON vagas_recrutamento;
CREATE POLICY "vagas_delete" ON vagas_recrutamento FOR DELETE USING (true);

-- Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  nome_completo TEXT,
  cargo TEXT DEFAULT 'Usuário',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (true);

-- =====================================================
-- PASSO 2: RESTAURAR ANALISTAS (3 REGISTROS)
-- =====================================================

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
  10, 0,
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
  10, 1,
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
  10, 3,
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
  cpf_cnpj = EXCLUDED.cpf_cnpj,
  updated_at = NOW();

-- =====================================================
-- PASSO 3: RESTAURAR PROFILES (8 REGISTROS)
-- =====================================================

INSERT INTO profiles (id, nome_completo, cargo, avatar_url, created_at, updated_at)
VALUES
('7e192772-3e0e-4bd5-9a94-f7208fd35dae', 'Henrique Alves', 'Usuário', NULL, '2025-12-12 06:06:25.022607+00', '2025-12-12 06:08:05.915125+00'),
('4c389ba3-49ba-44a2-a1e8-32fd1f1d32a5', 'veonmidias@gmail.com', 'Usuário', NULL, '2025-12-13 18:43:35.43355+00', '2025-12-13 18:43:35.43355+00'),
('ea277535-ee8d-4cb6-bb70-0c87a25df4a8', 'institutoveon@gmail.com', 'Usuário', NULL, '2025-12-14 20:49:03.954402+00', '2025-12-14 20:49:03.954402+00'),
('2c581912-d70c-4845-9100-09665a46238f', 'rodrigueskamilyvitoria2003@gmail.com', 'Usuário', NULL, '2025-12-15 00:42:59.370684+00', '2025-12-15 00:42:59.370684+00'),
('48e0636d-1643-4f08-8193-5f5544403f04', 'kariny817@gmail.com', 'Usuário', NULL, '2025-12-15 01:18:52.684727+00', '2025-12-15 01:18:52.684727+00'),
('14df62d7-9c5f-40e3-ba54-5afc981e708d', 'vitor.parmanhani@gmail.com', 'Usuário', NULL, '2025-12-15 01:35:18.919511+00', '2025-12-15 01:35:18.919511+00'),
('d6bb2a06-5fff-4683-9822-0d7cbb08229f', 'ninobr112@gmail.com', 'Usuário', NULL, '2025-12-15 10:54:17.687539+00', '2025-12-15 10:54:17.687539+00'),
('e0f4e438-ce7c-4265-bf6a-ca8747dbb2cb', 'rafaelbonoldi1074@gmail.com', 'Usuário', NULL, '2025-12-15 19:34:58.210519+00', '2025-12-15 19:34:58.210519+00')
ON CONFLICT (id) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  cargo = EXCLUDED.cargo,
  updated_at = NOW();

-- =====================================================
-- PASSO 4: RESTAURAR EMPRESAS (2 REGISTROS)
-- =====================================================

-- Empresa 1: INSTITUTO VEON
INSERT INTO empresas_recrutamento (
  id, cnpj, razao_social, nome_fantasia, situacao_cadastral, data_abertura,
  natureza_juridica, porte, capital_social, logradouro, numero, complemento,
  bairro, cidade, estado, cep, telefone_empresa,
  socio_nome, socio_cpf, socio_email, socio_telefone,
  senha_hash, creditos, aceite_termos, aceite_termos_data,
  aceite_lgpd, aceite_lgpd_data, status, created_at, updated_at,
  segmento, tempo_mercado, num_colaboradores, site_url,
  instagram_empresa, sobre_empresa, diferenciais, porque_trabalhar,
  socio_funcao, verificado, cadastro_completo
) VALUES (
  'a52b073d-5d4b-48ab-b5f3-c3202491a891',
  '51.065.648/0001-87',
  'INSTITUTO VEON LTDA',
  'INSTITUTO VEON',
  'ATIVA',
  '2023-06-15',
  'Sociedade Empresária Limitada',
  'MICRO EMPRESA',
  5000.00,
  'VISCONDE DE GUARAPUAVA',
  '2214',
  'APT 301',
  'CENTRO',
  'CASCAVEL',
  'PR',
  '85801160',
  '4598038455',
  'Henrique Alves',
  '08337947950',
  'henriquealves01648@gmail.com',
  '45998116723',
  'Eufaturo1M$',
  0.00,
  true,
  '2025-12-13 20:48:54.324196',
  true,
  '2025-12-13 20:48:54.324196',
  'ativo',
  '2025-12-13 20:48:54.324196',
  NOW(),
  'Educação',
  '1 a 3 anos',
  '11 a 50',
  'institutoveon.com',
  'institutoveon',
  'teste 123',
  '["Bonificação por Metas","Cozinha/Refeitório","Estacionamento","Horário Flexível","Treinamentos Profissionalizantes","Plano de Carreira","Mentoria","Ambiente Descontraído","Confraternizações","Eventos de Integração"]',
  'teste 123456',
  'socio_proprietario',
  false,
  true
)
ON CONFLICT (id) DO UPDATE SET
  cnpj = EXCLUDED.cnpj,
  razao_social = EXCLUDED.razao_social,
  nome_fantasia = EXCLUDED.nome_fantasia,
  situacao_cadastral = EXCLUDED.situacao_cadastral,
  socio_nome = EXCLUDED.socio_nome,
  socio_email = EXCLUDED.socio_email,
  socio_telefone = EXCLUDED.socio_telefone,
  senha_hash = EXCLUDED.senha_hash,
  status = 'ativo',
  segmento = EXCLUDED.segmento,
  sobre_empresa = EXCLUDED.sobre_empresa,
  diferenciais = EXCLUDED.diferenciais,
  porque_trabalhar = EXCLUDED.porque_trabalhar,
  cadastro_completo = EXCLUDED.cadastro_completo,
  updated_at = NOW();

-- Empresa 2: RAFAEL JOSE BONOLDI
INSERT INTO empresas_recrutamento (
  id, cnpj, razao_social, nome_fantasia, situacao_cadastral, data_abertura,
  natureza_juridica, porte, capital_social, logradouro, numero,
  bairro, cidade, estado, cep, telefone_empresa,
  socio_nome, socio_cpf, socio_email, socio_telefone,
  senha_hash, creditos, aceite_termos, aceite_termos_data,
  aceite_lgpd, aceite_lgpd_data, status, created_at, updated_at,
  socio_funcao, verificado, cadastro_completo
) VALUES (
  'de2deb53-3063-4be5-b353-8cc3e93d9687',
  '62.542.602/0001-28',
  '62.542.602 RAFAEL JOSE BONOLDI',
  '62.542.602 RAFAEL JOSE BONOLDI',
  'ATIVA',
  '2025-09-03',
  'Empresário (Individual)',
  'MICRO EMPRESA',
  2000.00,
  'JENUINO REBELLATO',
  '2119',
  'FLORESTA',
  'CASCAVEL',
  'PR',
  '85814512',
  '4591311810',
  'Rafael Bonoldi',
  '01207621960',
  'rafaelbonoldi1074@gmail.com',
  '45991311810',
  'Novasenha123',
  0.00,
  true,
  '2025-12-15 19:34:59.393347',
  true,
  '2025-12-15 19:34:59.393347',
  'ativo',
  '2025-12-15 19:34:59.393347',
  NOW(),
  'socio_proprietario',
  false,
  true
)
ON CONFLICT (id) DO UPDATE SET
  cnpj = EXCLUDED.cnpj,
  razao_social = EXCLUDED.razao_social,
  nome_fantasia = EXCLUDED.nome_fantasia,
  situacao_cadastral = EXCLUDED.situacao_cadastral,
  socio_nome = EXCLUDED.socio_nome,
  socio_email = EXCLUDED.socio_email,
  socio_telefone = EXCLUDED.socio_telefone,
  senha_hash = EXCLUDED.senha_hash,
  status = 'ativo',
  cadastro_completo = EXCLUDED.cadastro_completo,
  updated_at = NOW();

-- =====================================================
-- PASSO 5: RESTAURAR VAGAS (2 REGISTROS)
-- =====================================================

-- Vaga 1: Vendedor Closer
INSERT INTO vagas_recrutamento (
  id, empresa_id, titulo, descricao, regime, cidade, estado, modalidade,
  status, created_at, updated_at, faixa_salarial, areas_conhecimento,
  experiencia_minima, requer_cnh, requer_veiculo, quantidade_vagas, urgente
) VALUES (
  'a81a9148-3b13-425b-9dd5-59b019f5ce26',
  'a52b073d-5d4b-48ab-b5f3-c3202491a891',
  'Vendedor Closer',
  'Fazer fechamento de vendas on-line.',
  'pj',
  'Cascavel',
  'PR',
  'presencial',
  'ativa',
  '2025-12-13 20:52:55.558508',
  NOW(),
  '2500_4000',
  '[]',
  0,
  false,
  false,
  1,
  false
)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  descricao = EXCLUDED.descricao,
  regime = EXCLUDED.regime,
  cidade = EXCLUDED.cidade,
  estado = EXCLUDED.estado,
  modalidade = EXCLUDED.modalidade,
  faixa_salarial = EXCLUDED.faixa_salarial,
  status = 'ativa',
  updated_at = NOW();

-- Vaga 2: Social Media
INSERT INTO vagas_recrutamento (
  id, empresa_id, titulo, descricao, regime, cidade, estado, modalidade,
  status, created_at, updated_at, faixa_salarial, areas_conhecimento,
  experiencia_minima, requer_cnh, requer_veiculo, quantidade_vagas, urgente
) VALUES (
  '699c49b0-1cfc-42f2-80f4-47abc5eeb590',
  'a52b073d-5d4b-48ab-b5f3-c3202491a891',
  'Social Midia',
  'Vaga para jovem iniciando no mercado de trabalho.',
  'estagio',
  'Cascavel',
  'PR',
  'presencial',
  'ativa',
  '2025-12-17 03:03:10.222222',
  NOW(),
  '1500_2500',
  '[]',
  0,
  false,
  false,
  1,
  false
)
ON CONFLICT (id) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  descricao = EXCLUDED.descricao,
  regime = EXCLUDED.regime,
  cidade = EXCLUDED.cidade,
  estado = EXCLUDED.estado,
  modalidade = EXCLUDED.modalidade,
  faixa_salarial = EXCLUDED.faixa_salarial,
  status = 'ativa',
  updated_at = NOW();

-- =====================================================
-- PASSO 6: RESTAURAR CANDIDATOS (5 REGISTROS)
-- =====================================================

-- Candidato 1: Karine
INSERT INTO candidatos_recrutamento (
  id, nome_completo, telefone, email, status,
  aceite_termos, aceite_termos_data, aceite_lgpd, aceite_lgpd_data,
  created_at, updated_at, etapa_cadastro, cadastro_completo,
  auth_user_id, slug_publico, curriculo_publico, visualizacoes_perfil,
  confiabilidade, etapa_atual, etapas_completadas, etapas_json,
  confiabilidade_score, confiabilidade_nivel, confiabilidade_flags
) VALUES (
  'b78c93f9-c7c3-4ebe-b457-3f670ab51621',
  'Karine Cristina da Cruz',
  '45998614321',
  'kariny817@gmail.com',
  'disponivel',
  true, '2025-12-15 01:18:53.212987',
  true, '2025-12-15 01:18:53.212987',
  '2025-12-15 01:18:53.212987', NOW(),
  1, false,
  '48e0636d-1643-4f08-8193-5f5544403f04',
  'arine-ristina-da-ruz-131695', true, 0,
  0, 1, 0,
  '{"dados_pessoais":false,"disc":false,"expectativas":false,"experiencia":false,"formacao":false,"foto":false,"logistica":false,"vida_pessoal":false}',
  0, 'baixa', '[]'
)
ON CONFLICT (id) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  telefone = EXCLUDED.telefone,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  auth_user_id = EXCLUDED.auth_user_id,
  slug_publico = EXCLUDED.slug_publico,
  updated_at = NOW();

-- Candidato 2: Nicholas
INSERT INTO candidatos_recrutamento (
  id, nome_completo, telefone, email, status,
  aceite_termos, aceite_termos_data, aceite_lgpd, aceite_lgpd_data,
  created_at, updated_at, etapa_cadastro, cadastro_completo,
  auth_user_id, slug_publico, curriculo_publico, visualizacoes_perfil,
  confiabilidade, etapa_atual, etapas_completadas, etapas_json,
  confiabilidade_score, confiabilidade_nivel, confiabilidade_flags
) VALUES (
  '06453022-1e0a-455b-ba10-de9e5317f061',
  'NICHOLAS BATISTA BEZERRA',
  '45998038455',
  'ninobr112@gmail.com',
  'disponivel',
  true, '2025-12-15 10:54:18.20668',
  true, '2025-12-15 10:54:18.20668',
  '2025-12-15 10:54:18.20668', NOW(),
  1, false,
  'd6bb2a06-5fff-4683-9822-0d7cbb08229f',
  '-7d363d', true, 0,
  0, 1, 0,
  '{"dados_pessoais":false,"disc":false,"expectativas":false,"experiencia":false,"formacao":false,"foto":false,"logistica":false,"vida_pessoal":false}',
  0, 'baixa', '[]'
)
ON CONFLICT (id) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  telefone = EXCLUDED.telefone,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  auth_user_id = EXCLUDED.auth_user_id,
  slug_publico = EXCLUDED.slug_publico,
  updated_at = NOW();

-- Candidato 3: Vitor
INSERT INTO candidatos_recrutamento (
  id, nome_completo, data_nascimento, cpf, telefone, email,
  estado, cidade, bairro, esta_trabalhando,
  ultima_empresa, ultimo_cargo, areas_experiencia, anos_experiencia,
  escolaridade, estado_civil, sexo, status,
  aceite_termos, aceite_termos_data, aceite_lgpd, aceite_lgpd_data,
  created_at, updated_at, etapa_cadastro, cadastro_completo,
  auth_user_id, slug_publico, curriculo_publico, visualizacoes_perfil,
  confiabilidade, etapa_atual, etapas_completadas, etapas_json,
  confiabilidade_score, confiabilidade_nivel, confiabilidade_flags
) VALUES (
  '37cafc92-58cf-463c-9e68-b59262e9910f',
  'Vitor Hugo de carvalho parmanhani',
  '2006-08-14',
  '13354007966',
  '44991716176',
  'vitor.parmanhani@gmail.com',
  'PR', 'Jesuítas', 'Centro',
  true,
  'Concretas', 'Auxiliar de Produção', '["outros"]', 4,
  'medio_incompleto', 'casado', 'masculino', 'disponivel',
  true, '2025-12-15 01:35:19.492456',
  true, '2025-12-15 01:35:19.492456',
  '2025-12-15 01:35:19.492456', NOW(),
  1, false,
  '14df62d7-9c5f-40e3-ba54-5afc981e708d',
  'itor-ugo-de-carvalho-parmanhani-844b4e', true, 0,
  0, 1, 0,
  '{"dados_pessoais":false,"disc":false,"expectativas":false,"experiencia":false,"formacao":false,"foto":false,"logistica":false,"vida_pessoal":false}',
  0, 'baixa', '[]'
)
ON CONFLICT (id) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  data_nascimento = EXCLUDED.data_nascimento,
  cpf = EXCLUDED.cpf,
  telefone = EXCLUDED.telefone,
  email = EXCLUDED.email,
  estado = EXCLUDED.estado,
  cidade = EXCLUDED.cidade,
  bairro = EXCLUDED.bairro,
  esta_trabalhando = EXCLUDED.esta_trabalhando,
  ultima_empresa = EXCLUDED.ultima_empresa,
  ultimo_cargo = EXCLUDED.ultimo_cargo,
  areas_experiencia = EXCLUDED.areas_experiencia,
  anos_experiencia = EXCLUDED.anos_experiencia,
  escolaridade = EXCLUDED.escolaridade,
  estado_civil = EXCLUDED.estado_civil,
  sexo = EXCLUDED.sexo,
  status = EXCLUDED.status,
  auth_user_id = EXCLUDED.auth_user_id,
  slug_publico = EXCLUDED.slug_publico,
  updated_at = NOW();

-- Candidato 4: Kamily
INSERT INTO candidatos_recrutamento (
  id, nome_completo, data_nascimento, cpf, telefone, email,
  estado, bairro, esta_trabalhando,
  ultima_empresa, ultimo_cargo, areas_experiencia, anos_experiencia,
  escolaridade, estado_civil, sexo, status,
  aceite_termos, aceite_termos_data, aceite_lgpd, aceite_lgpd_data,
  created_at, updated_at, etapa_cadastro, cadastro_completo,
  auth_user_id, slug_publico, curriculo_publico, visualizacoes_perfil,
  confiabilidade, etapa_atual, etapas_completadas, etapas_json,
  confiabilidade_score, confiabilidade_nivel, confiabilidade_flags
) VALUES (
  'df963026-8f16-477f-9663-71db1f10f0cb',
  'Kamily Vitória Rodrigues',
  '2003-09-11',
  '12983648923',
  '45999862437',
  'rodrigueskamilyvitoria2003@gmail.com',
  'PR', 'São Cristóvão',
  false,
  'RJS Utilidades LTDA', 'Vendedora', '["vendas"]', 1,
  'medio_incompleto', 'solteiro', 'feminino', 'disponivel',
  true, '2025-12-15 00:43:00.283786',
  true, '2025-12-15 00:43:00.283786',
  '2025-12-15 00:43:00.283786', NOW(),
  1, false,
  '2c581912-d70c-4845-9100-09665a46238f',
  'amily-itoria-odrigues-83a14a', true, 0,
  0, 1, 0,
  '{"dados_pessoais":false,"disc":false,"expectativas":false,"experiencia":false,"formacao":false,"foto":false,"logistica":false,"vida_pessoal":false}',
  0, 'baixa', '[]'
)
ON CONFLICT (id) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  data_nascimento = EXCLUDED.data_nascimento,
  cpf = EXCLUDED.cpf,
  telefone = EXCLUDED.telefone,
  email = EXCLUDED.email,
  estado = EXCLUDED.estado,
  bairro = EXCLUDED.bairro,
  esta_trabalhando = EXCLUDED.esta_trabalhando,
  ultima_empresa = EXCLUDED.ultima_empresa,
  ultimo_cargo = EXCLUDED.ultimo_cargo,
  areas_experiencia = EXCLUDED.areas_experiencia,
  anos_experiencia = EXCLUDED.anos_experiencia,
  escolaridade = EXCLUDED.escolaridade,
  estado_civil = EXCLUDED.estado_civil,
  sexo = EXCLUDED.sexo,
  status = EXCLUDED.status,
  auth_user_id = EXCLUDED.auth_user_id,
  slug_publico = EXCLUDED.slug_publico,
  updated_at = NOW();

-- Candidato 5: Henrique (COM DISC COMPLETO)
INSERT INTO candidatos_recrutamento (
  id, nome_completo, data_nascimento, cpf, telefone, email,
  estado, cidade, bairro, esta_trabalhando,
  ultima_empresa, ultimo_cargo, areas_experiencia, anos_experiencia,
  escolaridade, certificacoes, possui_cnh, disponibilidade_horario,
  aceita_viajar, estado_civil, instagram, pretensao_salarial,
  valores_empresa, areas_interesse, objetivo_profissional,
  perfil_disc, perfil_natural, cadastro_completo, sexo, status,
  aceite_termos, aceite_termos_data, aceite_lgpd, aceite_lgpd_data,
  created_at, updated_at, etapa_cadastro,
  auth_user_id, slug_publico, curriculo_publico, visualizacoes_perfil,
  confiabilidade, etapa_atual, etapas_completadas, etapas_json,
  confiabilidade_score, confiabilidade_nivel, confiabilidade_flags
) VALUES (
  'fc275cf2-860e-4271-ae0d-0276b1cf0005',
  'Henrique Alves',
  '1993-11-12',
  '08337947950',
  '45998116722',
  'henriquealves01648@gmail.com',
  'PR', 'Cascavel', 'Centro',
  false,
  'Instituto veon', 'Vendedor', '["vendas","atendimento","marketing","ti"]', 15,
  'fundamental_incompleto', 'Método Cis', '["A","B"]', 'comercial',
  'eventualmente', 'casado', 'Henriquealwes', '2500_3000',
  '["carreira","proposito","treinamentos"]', '["vendas_comercial","atendimento","marketing","ti"]',
  'Aprender e crescer',
  'I', '{"C":-18,"D":14,"I":26,"S":-22}', true, 'masculino', 'disponivel',
  true, '2025-12-15 01:48:48.403994',
  true, '2025-12-15 01:48:48.403994',
  '2025-12-15 01:48:48.403994', NOW(),
  1,
  '1e73954a-eead-41bd-9ebb-e3168c2e9fd3',
  'enrique-lves-1d1a69', true, 0,
  0, 1, 0,
  '{"dados_pessoais":false,"disc":false,"expectativas":false,"experiencia":false,"formacao":false,"foto":false,"logistica":false,"vida_pessoal":false}',
  100, 'ALTA', '[]'
)
ON CONFLICT (id) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  data_nascimento = EXCLUDED.data_nascimento,
  cpf = EXCLUDED.cpf,
  telefone = EXCLUDED.telefone,
  email = EXCLUDED.email,
  estado = EXCLUDED.estado,
  cidade = EXCLUDED.cidade,
  bairro = EXCLUDED.bairro,
  esta_trabalhando = EXCLUDED.esta_trabalhando,
  ultima_empresa = EXCLUDED.ultima_empresa,
  ultimo_cargo = EXCLUDED.ultimo_cargo,
  areas_experiencia = EXCLUDED.areas_experiencia,
  anos_experiencia = EXCLUDED.anos_experiencia,
  escolaridade = EXCLUDED.escolaridade,
  certificacoes = EXCLUDED.certificacoes,
  possui_cnh = EXCLUDED.possui_cnh,
  disponibilidade_horario = EXCLUDED.disponibilidade_horario,
  aceita_viajar = EXCLUDED.aceita_viajar,
  estado_civil = EXCLUDED.estado_civil,
  instagram = EXCLUDED.instagram,
  pretensao_salarial = EXCLUDED.pretensao_salarial,
  valores_empresa = EXCLUDED.valores_empresa,
  areas_interesse = EXCLUDED.areas_interesse,
  objetivo_profissional = EXCLUDED.objetivo_profissional,
  perfil_disc = EXCLUDED.perfil_disc,
  perfil_natural = EXCLUDED.perfil_natural,
  cadastro_completo = EXCLUDED.cadastro_completo,
  sexo = EXCLUDED.sexo,
  status = EXCLUDED.status,
  auth_user_id = EXCLUDED.auth_user_id,
  slug_publico = EXCLUDED.slug_publico,
  confiabilidade_score = EXCLUDED.confiabilidade_score,
  confiabilidade_nivel = EXCLUDED.confiabilidade_nivel,
  updated_at = NOW();

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
SELECT 'RESTAURAÇÃO COMPLETA!' as resultado;

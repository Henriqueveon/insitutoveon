-- =====================================================
-- SQL PARA EXECUTAR NO SUPABASE DASHBOARD
-- Cole este script em: SQL Editor > New Query > Run
-- =====================================================

-- =====================================================
-- TABELA: diferenciais_empresa
-- =====================================================
CREATE TABLE IF NOT EXISTS diferenciais_empresa (
  id SERIAL PRIMARY KEY,
  categoria TEXT NOT NULL,
  nome TEXT NOT NULL,
  icone TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true
);

-- =====================================================
-- TABELA: cidades_coordenadas
-- =====================================================
CREATE TABLE IF NOT EXISTS cidades_coordenadas (
  id SERIAL PRIMARY KEY,
  cidade TEXT NOT NULL,
  estado TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  populacao INTEGER
);

-- =====================================================
-- TABELA: pacotes_creditos
-- =====================================================
CREATE TABLE IF NOT EXISTS pacotes_creditos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  quantidade_entrevistas INTEGER NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  preco_por_entrevista DECIMAL(10,2),
  preco_original DECIMAL(10,2),
  economia DECIMAL(5,2) DEFAULT 0,
  destaque BOOLEAN DEFAULT false,
  badge TEXT,
  cor_botao TEXT DEFAULT 'gray',
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: analistas
-- =====================================================
CREATE TABLE IF NOT EXISTS analistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  telefone TEXT,
  empresa TEXT,
  tipo TEXT DEFAULT 'empresa',
  licencas_total INTEGER DEFAULT 10,
  licencas_usadas INTEGER DEFAULT 0,
  link_unico UUID DEFAULT gen_random_uuid(),
  ativo BOOLEAN DEFAULT true,
  data_cadastro TIMESTAMPTZ DEFAULT NOW(),
  ultimo_acesso TIMESTAMPTZ,
  cpf_cnpj TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: empresas_recrutamento
-- =====================================================
CREATE TABLE IF NOT EXISTS empresas_recrutamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj TEXT,
  razao_social TEXT,
  nome_fantasia TEXT,
  situacao_cadastral TEXT,
  data_abertura DATE,
  natureza_juridica TEXT,
  porte TEXT,
  capital_social DECIMAL(15,2),
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  telefone_empresa TEXT,
  email_empresa TEXT,
  socio_nome TEXT,
  socio_cpf TEXT,
  socio_email TEXT,
  socio_telefone TEXT,
  socio_foto_url TEXT,
  senha_hash TEXT,
  creditos DECIMAL(10,2) DEFAULT 0,
  cartao_token TEXT,
  aceite_termos BOOLEAN DEFAULT false,
  aceite_termos_data TIMESTAMPTZ,
  aceite_lgpd BOOLEAN DEFAULT false,
  aceite_lgpd_data TIMESTAMPTZ,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  logo_url TEXT,
  segmento TEXT,
  tempo_mercado TEXT,
  num_colaboradores TEXT,
  site_url TEXT,
  instagram_empresa TEXT,
  sobre_empresa TEXT,
  diferenciais JSONB DEFAULT '[]',
  porque_trabalhar TEXT,
  fotos_ambiente JSONB DEFAULT '[]',
  link_recrutamento TEXT,
  total_acessos_link INTEGER DEFAULT 0,
  auth_user_id UUID,
  responsavel_nome TEXT,
  responsavel_cargo TEXT,
  socio_funcao TEXT,
  verificado BOOLEAN DEFAULT false,
  cadastro_completo BOOLEAN DEFAULT false
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas_recrutamento(cnpj);
CREATE INDEX IF NOT EXISTS idx_empresas_socio_email ON empresas_recrutamento(socio_email);
CREATE INDEX IF NOT EXISTS idx_empresas_auth_user ON empresas_recrutamento(auth_user_id);

-- =====================================================
-- TABELA: candidatos_recrutamento
-- =====================================================
CREATE TABLE IF NOT EXISTS candidatos_recrutamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT,
  data_nascimento DATE,
  cpf TEXT,
  telefone TEXT,
  email TEXT,
  estado TEXT,
  cidade TEXT,
  bairro TEXT,
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  sexo TEXT,
  esta_trabalhando BOOLEAN,
  salario_atual DECIMAL(10,2),
  regime_atual TEXT,
  motivo_busca_oportunidade TEXT,
  disponibilidade_inicio TEXT,
  regime_preferido TEXT,
  ultima_empresa TEXT,
  ultimo_cargo TEXT,
  tempo_ultima_empresa TEXT,
  motivo_saida TEXT,
  areas_experiencia JSONB DEFAULT '[]',
  anos_experiencia INTEGER,
  escolaridade TEXT,
  curso TEXT,
  instituicao TEXT,
  ano_conclusao TEXT,
  certificacoes JSONB DEFAULT '[]',
  possui_veiculo BOOLEAN,
  possui_cnh BOOLEAN,
  categoria_cnh TEXT,
  disponibilidade_horario JSONB DEFAULT '[]',
  aceita_viajar BOOLEAN,
  aceita_mudanca BOOLEAN,
  estado_civil TEXT,
  tem_filhos BOOLEAN,
  quantidade_filhos INTEGER,
  idade_filhos TEXT,
  instagram TEXT,
  pretensao_salarial TEXT,
  valores_empresa TEXT,
  areas_interesse JSONB DEFAULT '[]',
  objetivo_profissional TEXT,
  foto_url TEXT,
  video_url TEXT,
  video_duracao INTEGER,
  video_tipo TEXT,
  documento_url TEXT,
  documento_tipo TEXT,
  documento_verificado BOOLEAN DEFAULT false,
  curriculo_url TEXT,
  teste_disc_id UUID,
  perfil_disc TEXT,
  perfil_disc_detalhado JSONB,
  perfil_valores JSONB,
  perfil_natural TEXT,
  teste_disc_concluido BOOLEAN DEFAULT false,
  teste_disc_data TIMESTAMPTZ,
  disc_completado_em TIMESTAMPTZ,
  disc_resultado_json JSONB,
  confiabilidade INTEGER DEFAULT 0,
  confiabilidade_score INTEGER DEFAULT 0,
  confiabilidade_nivel TEXT DEFAULT 'baixa',
  confiabilidade_flags JSONB DEFAULT '[]',
  status TEXT DEFAULT 'disponivel',
  etapa_atual INTEGER DEFAULT 1,
  etapa_cadastro INTEGER DEFAULT 1,
  etapas_completadas INTEGER DEFAULT 0,
  etapas_json JSONB,
  cadastro_completo BOOLEAN DEFAULT false,
  recrutado_por_empresa_id UUID REFERENCES empresas_recrutamento(id),
  recrutado_data TIMESTAMPTZ,
  indicado_por_empresa_id UUID REFERENCES empresas_recrutamento(id),
  indicado_por_candidato_id UUID,
  aceite_termos BOOLEAN DEFAULT false,
  aceite_termos_data TIMESTAMPTZ,
  aceite_lgpd BOOLEAN DEFAULT false,
  aceite_lgpd_data TIMESTAMPTZ,
  auth_user_id UUID,
  slug_publico TEXT,
  curriculo_publico BOOLEAN DEFAULT false,
  visualizacoes_perfil INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_candidatos_email ON candidatos_recrutamento(email);
CREATE INDEX IF NOT EXISTS idx_candidatos_cpf ON candidatos_recrutamento(cpf);
CREATE INDEX IF NOT EXISTS idx_candidatos_auth_user ON candidatos_recrutamento(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_status ON candidatos_recrutamento(status);
CREATE INDEX IF NOT EXISTS idx_candidatos_cidade ON candidatos_recrutamento(cidade);

-- =====================================================
-- TABELA: candidatos_disc
-- =====================================================
CREATE TABLE IF NOT EXISTS candidatos_disc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  telefone_whatsapp TEXT,
  email TEXT,
  cargo_atual TEXT,
  empresa_instagram TEXT,
  perfil_natural TEXT,
  perfil_adaptado TEXT,
  perfil_tipo TEXT,
  pdf_url TEXT,
  status TEXT DEFAULT 'pendente',
  analista_id UUID REFERENCES analistas(id),
  confiabilidade_score INTEGER DEFAULT 100,
  confiabilidade_nivel TEXT DEFAULT 'ALTA',
  flags_detectadas JSONB DEFAULT '[]',
  tempo_total_segundos INTEGER,
  tempo_por_questao JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_disc_analista ON candidatos_disc(analista_id);
CREATE INDEX IF NOT EXISTS idx_disc_status ON candidatos_disc(status);
CREATE INDEX IF NOT EXISTS idx_disc_email ON candidatos_disc(email);

-- =====================================================
-- TABELA: codigos_indicacao
-- =====================================================
CREATE TABLE IF NOT EXISTS codigos_indicacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_usuario TEXT NOT NULL,
  usuario_id UUID NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  total_indicacoes INTEGER DEFAULT 0,
  creditos_ganhos DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_codigo_usuario ON codigos_indicacao(usuario_id);
CREATE INDEX IF NOT EXISTS idx_codigo_codigo ON codigos_indicacao(codigo);

-- =====================================================
-- TABELA: entrevistas_recrutamento
-- =====================================================
CREATE TABLE IF NOT EXISTS entrevistas_recrutamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas_recrutamento(id) ON DELETE CASCADE,
  candidato_id UUID REFERENCES candidatos_recrutamento(id) ON DELETE CASCADE,
  data_agendada TIMESTAMPTZ,
  status TEXT DEFAULT 'pendente',
  tipo TEXT DEFAULT 'presencial',
  local TEXT,
  link_online TEXT,
  observacoes TEXT,
  feedback_empresa TEXT,
  nota_empresa INTEGER,
  feedback_candidato TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entrevistas_empresa ON entrevistas_recrutamento(empresa_id);
CREATE INDEX IF NOT EXISTS idx_entrevistas_candidato ON entrevistas_recrutamento(candidato_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE diferenciais_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE cidades_coordenadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacotes_creditos ENABLE ROW LEVEL SECURITY;
ALTER TABLE analistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas_recrutamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos_recrutamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos_disc ENABLE ROW LEVEL SECURITY;
ALTER TABLE codigos_indicacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrevistas_recrutamento ENABLE ROW LEVEL SECURITY;

-- Politicas de leitura publica para tabelas de lookup
DROP POLICY IF EXISTS "diferenciais_public_read" ON diferenciais_empresa;
CREATE POLICY "diferenciais_public_read" ON diferenciais_empresa FOR SELECT USING (true);

DROP POLICY IF EXISTS "cidades_public_read" ON cidades_coordenadas;
CREATE POLICY "cidades_public_read" ON cidades_coordenadas FOR SELECT USING (true);

DROP POLICY IF EXISTS "pacotes_public_read" ON pacotes_creditos;
CREATE POLICY "pacotes_public_read" ON pacotes_creditos FOR SELECT USING (true);

-- Politicas para analistas
DROP POLICY IF EXISTS "analistas_public_read" ON analistas;
CREATE POLICY "analistas_public_read" ON analistas FOR SELECT USING (true);

DROP POLICY IF EXISTS "analistas_insert" ON analistas;
CREATE POLICY "analistas_insert" ON analistas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "analistas_update" ON analistas;
CREATE POLICY "analistas_update" ON analistas FOR UPDATE USING (true);

-- Politicas para empresas
DROP POLICY IF EXISTS "empresas_public_read" ON empresas_recrutamento;
CREATE POLICY "empresas_public_read" ON empresas_recrutamento FOR SELECT USING (true);

DROP POLICY IF EXISTS "empresas_insert" ON empresas_recrutamento;
CREATE POLICY "empresas_insert" ON empresas_recrutamento FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "empresas_update" ON empresas_recrutamento;
CREATE POLICY "empresas_update" ON empresas_recrutamento FOR UPDATE USING (true);

DROP POLICY IF EXISTS "empresas_delete" ON empresas_recrutamento;
CREATE POLICY "empresas_delete" ON empresas_recrutamento FOR DELETE USING (true);

-- Politicas para candidatos_recrutamento
DROP POLICY IF EXISTS "candidatos_public_read" ON candidatos_recrutamento;
CREATE POLICY "candidatos_public_read" ON candidatos_recrutamento FOR SELECT USING (true);

DROP POLICY IF EXISTS "candidatos_insert" ON candidatos_recrutamento;
CREATE POLICY "candidatos_insert" ON candidatos_recrutamento FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "candidatos_update" ON candidatos_recrutamento;
CREATE POLICY "candidatos_update" ON candidatos_recrutamento FOR UPDATE USING (true);

DROP POLICY IF EXISTS "candidatos_delete" ON candidatos_recrutamento;
CREATE POLICY "candidatos_delete" ON candidatos_recrutamento FOR DELETE USING (true);

-- Politicas para candidatos_disc
DROP POLICY IF EXISTS "disc_public_read" ON candidatos_disc;
CREATE POLICY "disc_public_read" ON candidatos_disc FOR SELECT USING (true);

DROP POLICY IF EXISTS "disc_insert" ON candidatos_disc;
CREATE POLICY "disc_insert" ON candidatos_disc FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "disc_update" ON candidatos_disc;
CREATE POLICY "disc_update" ON candidatos_disc FOR UPDATE USING (true);

DROP POLICY IF EXISTS "disc_delete" ON candidatos_disc;
CREATE POLICY "disc_delete" ON candidatos_disc FOR DELETE USING (true);

-- Politicas para codigos_indicacao
DROP POLICY IF EXISTS "codigos_public_read" ON codigos_indicacao;
CREATE POLICY "codigos_public_read" ON codigos_indicacao FOR SELECT USING (true);

DROP POLICY IF EXISTS "codigos_insert" ON codigos_indicacao;
CREATE POLICY "codigos_insert" ON codigos_indicacao FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "codigos_update" ON codigos_indicacao;
CREATE POLICY "codigos_update" ON codigos_indicacao FOR UPDATE USING (true);

-- Politicas para entrevistas
DROP POLICY IF EXISTS "entrevistas_public_read" ON entrevistas_recrutamento;
CREATE POLICY "entrevistas_public_read" ON entrevistas_recrutamento FOR SELECT USING (true);

DROP POLICY IF EXISTS "entrevistas_insert" ON entrevistas_recrutamento;
CREATE POLICY "entrevistas_insert" ON entrevistas_recrutamento FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "entrevistas_update" ON entrevistas_recrutamento;
CREATE POLICY "entrevistas_update" ON entrevistas_recrutamento FOR UPDATE USING (true);

DROP POLICY IF EXISTS "entrevistas_delete" ON entrevistas_recrutamento;
CREATE POLICY "entrevistas_delete" ON entrevistas_recrutamento FOR DELETE USING (true);

-- =====================================================
-- SUCESSO!
-- =====================================================
SELECT 'Tabelas criadas com sucesso!' as resultado;

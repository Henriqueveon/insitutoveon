-- =====================================================
-- MIGRAÇÃO DE RESTAURAÇÃO - VEON Recrutamento
-- Garante que todas as tabelas existem com estrutura correta
-- =====================================================

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

-- Índices
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
  certificacoes TEXT,
  possui_veiculo TEXT,
  possui_cnh TEXT,
  categoria_cnh TEXT,
  disponibilidade_horario TEXT,
  aceita_viajar TEXT,
  aceita_mudanca TEXT,
  estado_civil TEXT,
  tem_filhos BOOLEAN,
  quantidade_filhos INTEGER,
  idade_filhos TEXT,
  instagram TEXT,
  pretensao_salarial TEXT,
  valores_empresa JSONB DEFAULT '[]',
  areas_interesse JSONB DEFAULT '[]',
  objetivo_profissional TEXT,
  foto_url TEXT,
  video_url TEXT,
  video_duracao TEXT,
  video_tipo TEXT,
  documento_url TEXT,
  documento_tipo TEXT,
  documento_verificado BOOLEAN DEFAULT false,
  curriculo_url TEXT,
  teste_disc_id UUID,
  perfil_disc TEXT,
  perfil_disc_detalhado JSONB,
  perfil_valores TEXT,
  perfil_natural JSONB,
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
  etapas_json JSONB DEFAULT '{}',
  cadastro_completo BOOLEAN DEFAULT false,
  recrutado_por_empresa_id UUID,
  recrutado_data TIMESTAMPTZ,
  indicado_por_empresa_id UUID,
  indicado_por_candidato_id UUID,
  aceite_termos BOOLEAN DEFAULT false,
  aceite_termos_data TIMESTAMPTZ,
  aceite_lgpd BOOLEAN DEFAULT false,
  aceite_lgpd_data TIMESTAMPTZ,
  auth_user_id UUID,
  slug_publico TEXT,
  curriculo_publico BOOLEAN DEFAULT true,
  visualizacoes_perfil INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_candidatos_email ON candidatos_recrutamento(email);
CREATE INDEX IF NOT EXISTS idx_candidatos_telefone ON candidatos_recrutamento(telefone);
CREATE INDEX IF NOT EXISTS idx_candidatos_status ON candidatos_recrutamento(status);
CREATE INDEX IF NOT EXISTS idx_candidatos_auth_user ON candidatos_recrutamento(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_cidade_estado ON candidatos_recrutamento(cidade, estado);
CREATE INDEX IF NOT EXISTS idx_candidatos_slug ON candidatos_recrutamento(slug_publico);

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
  perfil_natural JSONB,
  perfil_adaptado JSONB,
  perfil_tipo TEXT,
  pdf_url TEXT,
  status TEXT DEFAULT 'pendente',
  analista_id UUID,
  confiabilidade_score INTEGER DEFAULT 100,
  confiabilidade_nivel TEXT DEFAULT 'ALTA',
  flags_detectadas JSONB DEFAULT '[]',
  tempo_total_segundos INTEGER,
  tempo_por_questao JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_disc_status ON candidatos_disc(status);
CREATE INDEX IF NOT EXISTS idx_disc_analista ON candidatos_disc(analista_id);
CREATE INDEX IF NOT EXISTS idx_disc_email ON candidatos_disc(email);

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
  economia DECIMAL(10,2) DEFAULT 0,
  destaque BOOLEAN DEFAULT false,
  badge TEXT,
  cor_botao TEXT DEFAULT 'gray',
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
  estado TEXT NOT NULL,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  populacao INTEGER
);

-- =====================================================
-- TABELA: profiles (vinculada ao auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  nome_completo TEXT,
  cargo TEXT DEFAULT 'Usuário',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: entrevistas_recrutamento
-- =====================================================
CREATE TABLE IF NOT EXISTS entrevistas_recrutamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL,
  empresa_id UUID NOT NULL,
  vaga_id UUID,
  data_proposta DATE,
  hora_proposta TIME,
  tipo TEXT DEFAULT 'presencial',
  local TEXT,
  observacoes TEXT,
  status TEXT DEFAULT 'pendente',
  resposta_candidato TEXT,
  data_resposta TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entrevistas_candidato ON entrevistas_recrutamento(candidato_id);
CREATE INDEX IF NOT EXISTS idx_entrevistas_empresa ON entrevistas_recrutamento(empresa_id);
CREATE INDEX IF NOT EXISTS idx_entrevistas_status ON entrevistas_recrutamento(status);

-- =====================================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE analistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas_recrutamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos_recrutamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos_disc ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacotes_creditos ENABLE ROW LEVEL SECURITY;
ALTER TABLE codigos_indicacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE diferenciais_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE cidades_coordenadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrevistas_recrutamento ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS PERMISSIVAS PARA RESTAURAÇÃO
-- (Depois ajustar para produção)
-- =====================================================

-- Políticas temporárias (service role bypassa RLS)
-- Tabelas de lookup - públicas para leitura

DROP POLICY IF EXISTS "Pacotes são públicos para leitura" ON pacotes_creditos;
CREATE POLICY "Pacotes são públicos para leitura" ON pacotes_creditos
  FOR SELECT TO anon, authenticated USING (ativo = true);

DROP POLICY IF EXISTS "Diferenciais são públicos para leitura" ON diferenciais_empresa;
CREATE POLICY "Diferenciais são públicos para leitura" ON diferenciais_empresa
  FOR SELECT TO anon, authenticated USING (ativo = true);

DROP POLICY IF EXISTS "Cidades são públicas para leitura" ON cidades_coordenadas;
CREATE POLICY "Cidades são públicas para leitura" ON cidades_coordenadas
  FOR SELECT TO anon, authenticated USING (true);

-- Políticas para empresas
DROP POLICY IF EXISTS "Empresas podem ver próprios dados" ON empresas_recrutamento;
CREATE POLICY "Empresas podem ver próprios dados" ON empresas_recrutamento
  FOR SELECT TO authenticated USING (
    auth.uid() = auth_user_id OR
    socio_email = auth.email()
  );

DROP POLICY IF EXISTS "Empresas podem atualizar próprios dados" ON empresas_recrutamento;
CREATE POLICY "Empresas podem atualizar próprios dados" ON empresas_recrutamento
  FOR UPDATE TO authenticated USING (
    auth.uid() = auth_user_id OR
    socio_email = auth.email()
  );

DROP POLICY IF EXISTS "Qualquer autenticado pode criar empresa" ON empresas_recrutamento;
CREATE POLICY "Qualquer autenticado pode criar empresa" ON empresas_recrutamento
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Anon pode criar empresa" ON empresas_recrutamento;
CREATE POLICY "Anon pode criar empresa" ON empresas_recrutamento
  FOR INSERT TO anon WITH CHECK (true);

-- Políticas para candidatos
DROP POLICY IF EXISTS "Candidatos podem ver próprios dados" ON candidatos_recrutamento;
CREATE POLICY "Candidatos podem ver próprios dados" ON candidatos_recrutamento
  FOR SELECT TO authenticated USING (
    auth.uid() = auth_user_id OR
    email = auth.email()
  );

DROP POLICY IF EXISTS "Candidatos podem atualizar próprios dados" ON candidatos_recrutamento;
CREATE POLICY "Candidatos podem atualizar próprios dados" ON candidatos_recrutamento
  FOR UPDATE TO authenticated USING (
    auth.uid() = auth_user_id OR
    email = auth.email()
  );

DROP POLICY IF EXISTS "Empresas podem ver candidatos disponíveis" ON candidatos_recrutamento;
CREATE POLICY "Empresas podem ver candidatos disponíveis" ON candidatos_recrutamento
  FOR SELECT TO authenticated USING (
    status = 'disponivel' OR
    auth.uid() = auth_user_id OR
    email = auth.email()
  );

DROP POLICY IF EXISTS "Qualquer autenticado pode criar candidato" ON candidatos_recrutamento;
CREATE POLICY "Qualquer autenticado pode criar candidato" ON candidatos_recrutamento
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Anon pode criar candidato" ON candidatos_recrutamento;
CREATE POLICY "Anon pode criar candidato" ON candidatos_recrutamento
  FOR INSERT TO anon WITH CHECK (true);

-- Políticas para candidatos_disc
DROP POLICY IF EXISTS "Analistas podem ver seus candidatos DISC" ON candidatos_disc;
CREATE POLICY "Analistas podem ver seus candidatos DISC" ON candidatos_disc
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Qualquer um pode inserir no DISC" ON candidatos_disc;
CREATE POLICY "Qualquer um pode inserir no DISC" ON candidatos_disc
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Atualizar DISC" ON candidatos_disc;
CREATE POLICY "Atualizar DISC" ON candidatos_disc
  FOR UPDATE TO anon, authenticated USING (true);

-- Políticas para analistas
DROP POLICY IF EXISTS "Analistas podem ver próprios dados" ON analistas;
CREATE POLICY "Analistas podem ver próprios dados" ON analistas
  FOR SELECT TO authenticated USING (
    email = auth.email()
  );

DROP POLICY IF EXISTS "Analistas podem atualizar próprios dados" ON analistas;
CREATE POLICY "Analistas podem atualizar próprios dados" ON analistas
  FOR UPDATE TO authenticated USING (
    email = auth.email()
  );

-- Políticas para profiles
DROP POLICY IF EXISTS "Profiles são públicos para leitura" ON profiles;
CREATE POLICY "Profiles são públicos para leitura" ON profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Usuários podem atualizar próprio profile" ON profiles;
CREATE POLICY "Usuários podem atualizar próprio profile" ON profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Usuários podem inserir próprio profile" ON profiles;
CREATE POLICY "Usuários podem inserir próprio profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Políticas para códigos de indicação
DROP POLICY IF EXISTS "Códigos de indicação visíveis" ON codigos_indicacao;
CREATE POLICY "Códigos de indicação visíveis" ON codigos_indicacao
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Criar código de indicação" ON codigos_indicacao;
CREATE POLICY "Criar código de indicação" ON codigos_indicacao
  FOR INSERT TO authenticated WITH CHECK (true);

-- Políticas para entrevistas
DROP POLICY IF EXISTS "Ver entrevistas" ON entrevistas_recrutamento;
CREATE POLICY "Ver entrevistas" ON entrevistas_recrutamento
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Criar entrevistas" ON entrevistas_recrutamento;
CREATE POLICY "Criar entrevistas" ON entrevistas_recrutamento
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Atualizar entrevistas" ON entrevistas_recrutamento;
CREATE POLICY "Atualizar entrevistas" ON entrevistas_recrutamento
  FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- TRIGGER para criar profile automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, cargo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'Usuário')
  )
  ON CONFLICT (id) DO UPDATE SET
    nome_completo = EXCLUDED.nome_completo,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- FUNÇÃO para vincular empresa ao auth.user
-- =====================================================
CREATE OR REPLACE FUNCTION vincular_auth_empresa()
RETURNS void AS $$
DECLARE
  v_user_email TEXT;
  v_user_id UUID;
BEGIN
  v_user_email := auth.email();
  v_user_id := auth.uid();

  IF v_user_email IS NOT NULL AND v_user_id IS NOT NULL THEN
    UPDATE empresas_recrutamento
    SET auth_user_id = v_user_id
    WHERE LOWER(socio_email) = LOWER(v_user_email)
      AND auth_user_id IS NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO para vincular candidato ao auth.user
-- =====================================================
CREATE OR REPLACE FUNCTION vincular_auth_candidato()
RETURNS void AS $$
DECLARE
  v_user_email TEXT;
  v_user_id UUID;
BEGIN
  v_user_email := auth.email();
  v_user_id := auth.uid();

  IF v_user_email IS NOT NULL AND v_user_id IS NOT NULL THEN
    UPDATE candidatos_recrutamento
    SET auth_user_id = v_user_id
    WHERE LOWER(email) = LOWER(v_user_email)
      AND auth_user_id IS NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute
GRANT EXECUTE ON FUNCTION vincular_auth_empresa TO authenticated;
GRANT EXECUTE ON FUNCTION vincular_auth_candidato TO authenticated;

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

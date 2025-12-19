-- =====================================================
-- CORREÇÃO COMPLETA DO SCHEMA - 19/12/2025
-- =====================================================

-- =====================================================
-- 1. CRIAR TABELA PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  nome_completo TEXT,
  cargo TEXT DEFAULT 'Usuário',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (true);

-- =====================================================
-- 2. ADICIONAR COLUNAS FALTANTES EM VAGAS_RECRUTAMENTO
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vagas_recrutamento' AND column_name = 'faixa_salarial') THEN
    ALTER TABLE vagas_recrutamento ADD COLUMN faixa_salarial TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vagas_recrutamento' AND column_name = 'regime') THEN
    ALTER TABLE vagas_recrutamento ADD COLUMN regime TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vagas_recrutamento' AND column_name = 'modalidade') THEN
    ALTER TABLE vagas_recrutamento ADD COLUMN modalidade TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vagas_recrutamento' AND column_name = 'descricao') THEN
    ALTER TABLE vagas_recrutamento ADD COLUMN descricao TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vagas_recrutamento' AND column_name = 'titulo') THEN
    ALTER TABLE vagas_recrutamento ADD COLUMN titulo TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vagas_recrutamento' AND column_name = 'cidade') THEN
    ALTER TABLE vagas_recrutamento ADD COLUMN cidade TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vagas_recrutamento' AND column_name = 'estado') THEN
    ALTER TABLE vagas_recrutamento ADD COLUMN estado TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vagas_recrutamento' AND column_name = 'status') THEN
    ALTER TABLE vagas_recrutamento ADD COLUMN status TEXT DEFAULT 'ativa';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vagas_recrutamento' AND column_name = 'empresa_id') THEN
    ALTER TABLE vagas_recrutamento ADD COLUMN empresa_id UUID;
  END IF;
END $$;

-- =====================================================
-- 3. ADICIONAR COLUNAS FALTANTES EM CANDIDATOS_RECRUTAMENTO
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'nome_completo') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN nome_completo TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'data_nascimento') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN data_nascimento DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'cpf') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN cpf TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'telefone') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN telefone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'email') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN email TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'estado') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN estado TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'cidade') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN cidade TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'bairro') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN bairro TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'esta_trabalhando') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN esta_trabalhando BOOLEAN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'ultima_empresa') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN ultima_empresa TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'ultimo_cargo') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN ultimo_cargo TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'areas_experiencia') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN areas_experiencia JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'anos_experiencia') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN anos_experiencia INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'escolaridade') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN escolaridade TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'certificacoes') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN certificacoes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'possui_cnh') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN possui_cnh TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'disponibilidade_horario') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN disponibilidade_horario TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'aceita_viajar') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN aceita_viajar TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'estado_civil') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN estado_civil TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'instagram') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN instagram TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'pretensao_salarial') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN pretensao_salarial TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'valores_empresa') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN valores_empresa JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'areas_interesse') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN areas_interesse JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'objetivo_profissional') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN objetivo_profissional TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'perfil_disc') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN perfil_disc TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'perfil_natural') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN perfil_natural TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'cadastro_completo') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN cadastro_completo BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'sexo') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN sexo TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'status') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN status TEXT DEFAULT 'disponivel';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'aceite_termos') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN aceite_termos BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'aceite_lgpd') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN aceite_lgpd BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'auth_user_id') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN auth_user_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'slug_publico') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN slug_publico TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'curriculo_publico') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN curriculo_publico BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'confiabilidade_score') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN confiabilidade_score INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'confiabilidade_nivel') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN confiabilidade_nivel TEXT DEFAULT 'baixa';
  END IF;
END $$;

SELECT 'Schema corrigido com sucesso!' as resultado;

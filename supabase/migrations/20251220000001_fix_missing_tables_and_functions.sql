-- =============================================
-- CORRIGIR TABELAS E FUNÇÕES FALTANTES
-- Resolver erros 404 e estrutura do banco
-- =============================================

-- =============================================
-- PARTE 1: CRIAR TABELAS FALTANTES
-- =============================================

-- Tabela de perfis (profiles) - se não existir
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  nome TEXT,
  avatar_url TEXT,
  tipo TEXT, -- 'candidato', 'empresa', 'analista', 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON profiles;
CREATE POLICY "Usuários podem ver próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON profiles;
CREATE POLICY "Usuários podem atualizar próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Permitir inserção de perfil" ON profiles;
CREATE POLICY "Permitir inserção de perfil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tabela de roles (user_roles) - se não existir
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user', -- 'user', 'admin', 'gestor', 'analista'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver próprias roles" ON user_roles;
CREATE POLICY "Usuários podem ver próprias roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins podem gerenciar roles" ON user_roles;
CREATE POLICY "Admins podem gerenciar roles" ON user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- PARTE 2: CORRIGIR TABELA DE NOTIFICAÇÕES
-- =============================================

-- Criar tabela de notificações se não existir
CREATE TABLE IF NOT EXISTS notificacoes_recrutamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinatario_id UUID NOT NULL,
  destinatario_tipo TEXT NOT NULL DEFAULT 'candidato', -- 'candidato', 'empresa', 'analista'
  tipo TEXT NOT NULL, -- 'proposta', 'match', 'mensagem', 'sistema'
  titulo TEXT NOT NULL,
  mensagem TEXT,
  dados JSONB,
  lida BOOLEAN DEFAULT FALSE,
  lida_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notificacoes_recrutamento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem próprias notificações" ON notificacoes_recrutamento;
CREATE POLICY "Usuários veem próprias notificações" ON notificacoes_recrutamento
  FOR SELECT USING (destinatario_id = auth.uid());

DROP POLICY IF EXISTS "Sistema pode criar notificações" ON notificacoes_recrutamento;
CREATE POLICY "Sistema pode criar notificações" ON notificacoes_recrutamento
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem marcar como lida" ON notificacoes_recrutamento;
CREATE POLICY "Usuários podem marcar como lida" ON notificacoes_recrutamento
  FOR UPDATE USING (destinatario_id = auth.uid());

-- =============================================
-- PARTE 3: CRIAR TABELA SOLICITACOES_ENTREVISTA
-- =============================================

CREATE TABLE IF NOT EXISTS solicitacoes_entrevista (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  candidato_id UUID NOT NULL,
  vaga_id UUID,
  status TEXT DEFAULT 'pendente', -- 'pendente', 'aceita', 'recusada', 'expirada'
  mensagem TEXT,
  data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_resposta TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE solicitacoes_entrevista ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Candidatos veem próprias solicitações" ON solicitacoes_entrevista;
CREATE POLICY "Candidatos veem próprias solicitações" ON solicitacoes_entrevista
  FOR SELECT USING (candidato_id = auth.uid());

DROP POLICY IF EXISTS "Empresas veem próprias solicitações" ON solicitacoes_entrevista;
CREATE POLICY "Empresas veem próprias solicitações" ON solicitacoes_entrevista
  FOR SELECT USING (empresa_id = auth.uid());

DROP POLICY IF EXISTS "Empresas podem criar solicitações" ON solicitacoes_entrevista;
CREATE POLICY "Empresas podem criar solicitações" ON solicitacoes_entrevista
  FOR INSERT WITH CHECK (empresa_id = auth.uid());

DROP POLICY IF EXISTS "Candidatos podem responder" ON solicitacoes_entrevista;
CREATE POLICY "Candidatos podem responder" ON solicitacoes_entrevista
  FOR UPDATE USING (candidato_id = auth.uid());

-- =============================================
-- PARTE 4: CRIAR FUNÇÃO GERAR_CODIGO_INDICACAO
-- =============================================

CREATE OR REPLACE FUNCTION public.gerar_codigo_indicacao(
  p_tipo_usuario TEXT,
  p_usuario_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_codigo TEXT;
  v_existe BOOLEAN;
BEGIN
  -- Gerar código único
  LOOP
    -- Formato: VEON + 6 caracteres aleatórios
    v_codigo := 'VEON' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

    -- Verificar se já existe
    SELECT EXISTS (
      SELECT 1 FROM candidatos_recrutamento WHERE codigo_indicacao = v_codigo
      UNION ALL
      SELECT 1 FROM empresas_recrutamento WHERE codigo_indicacao = v_codigo
    ) INTO v_existe;

    EXIT WHEN NOT v_existe;
  END LOOP;

  -- Salvar o código no usuário
  IF p_tipo_usuario = 'candidato' THEN
    UPDATE candidatos_recrutamento
    SET codigo_indicacao = v_codigo
    WHERE id = p_usuario_id OR auth_user_id = p_usuario_id;
  ELSIF p_tipo_usuario = 'empresa' THEN
    UPDATE empresas_recrutamento
    SET codigo_indicacao = v_codigo
    WHERE id = p_usuario_id OR auth_user_id = p_usuario_id;
  END IF;

  RETURN v_codigo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PARTE 5: ADICIONAR COLUNAS FALTANTES
-- =============================================

-- Garantir que a coluna codigo_indicacao existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'candidatos_recrutamento' AND column_name = 'codigo_indicacao') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN codigo_indicacao TEXT UNIQUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'empresas_recrutamento' AND column_name = 'codigo_indicacao') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN codigo_indicacao TEXT UNIQUE;
  END IF;
END $$;

-- Colunas em candidatos_recrutamento
DO $$
BEGIN
  -- auth_user_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'candidatos_recrutamento' AND column_name = 'auth_user_id') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);
  END IF;

  -- email_verificado
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'candidatos_recrutamento' AND column_name = 'email_verificado') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN email_verificado BOOLEAN DEFAULT FALSE;
  END IF;

  -- email_verificado_em
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'candidatos_recrutamento' AND column_name = 'email_verificado_em') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN email_verificado_em TIMESTAMP WITH TIME ZONE;
  END IF;

  -- etapa_cadastro
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'candidatos_recrutamento' AND column_name = 'etapa_cadastro') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN etapa_cadastro INT DEFAULT 1;
  END IF;

  -- cadastro_completo
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'candidatos_recrutamento' AND column_name = 'cadastro_completo') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN cadastro_completo BOOLEAN DEFAULT FALSE;
  END IF;

  -- visivel_empresas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'candidatos_recrutamento' AND column_name = 'visivel_empresas') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN visivel_empresas BOOLEAN DEFAULT FALSE;
  END IF;

  -- perfil_disc
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'candidatos_recrutamento' AND column_name = 'perfil_disc') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN perfil_disc TEXT;
  END IF;

  -- teste_disc_completo
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'candidatos_recrutamento' AND column_name = 'teste_disc_completo') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN teste_disc_completo BOOLEAN DEFAULT FALSE;
  END IF;

  -- areas_interesse como array
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'candidatos_recrutamento' AND column_name = 'areas_interesse') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN areas_interesse TEXT[];
  END IF;
END $$;

-- Colunas em empresas_recrutamento
DO $$
BEGIN
  -- email_verificado
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'empresas_recrutamento' AND column_name = 'email_verificado') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN email_verificado BOOLEAN DEFAULT FALSE;
  END IF;

  -- email_verificado_em
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'empresas_recrutamento' AND column_name = 'email_verificado_em') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN email_verificado_em TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- =============================================
-- PARTE 6: CORRIGIR RLS PARA PERMITIR ACESSO
-- =============================================

-- Política mais permissiva para candidatos verem próprios dados
DROP POLICY IF EXISTS "Candidatos podem ver próprios dados" ON candidatos_recrutamento;
CREATE POLICY "Candidatos podem ver próprios dados" ON candidatos_recrutamento
  FOR SELECT USING (
    auth_user_id = auth.uid()
    OR id = auth.uid()
    OR id::text = (auth.jwt() ->> 'sub')
  );

DROP POLICY IF EXISTS "Candidatos podem atualizar próprios dados" ON candidatos_recrutamento;
CREATE POLICY "Candidatos podem atualizar próprios dados" ON candidatos_recrutamento
  FOR UPDATE USING (
    auth_user_id = auth.uid()
    OR id = auth.uid()
  );

DROP POLICY IF EXISTS "Permitir inserção de candidatos" ON candidatos_recrutamento;
CREATE POLICY "Permitir inserção de candidatos" ON candidatos_recrutamento
  FOR INSERT WITH CHECK (true);

-- Políticas para empresas
DROP POLICY IF EXISTS "Empresas podem ver próprios dados" ON empresas_recrutamento;
CREATE POLICY "Empresas podem ver próprios dados" ON empresas_recrutamento
  FOR SELECT USING (
    auth_user_id = auth.uid()
    OR id = auth.uid()
  );

DROP POLICY IF EXISTS "Empresas podem atualizar próprios dados" ON empresas_recrutamento;
CREATE POLICY "Empresas podem atualizar próprios dados" ON empresas_recrutamento
  FOR UPDATE USING (
    auth_user_id = auth.uid()
    OR id = auth.uid()
  );

-- =============================================
-- PARTE 7: GRANTS E PERMISSÕES
-- =============================================

-- Garantir que as tabelas são acessíveis
GRANT SELECT, INSERT, UPDATE ON candidatos_recrutamento TO authenticated;
GRANT SELECT, INSERT, UPDATE ON empresas_recrutamento TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notificacoes_recrutamento TO authenticated;
GRANT SELECT, INSERT, UPDATE ON solicitacoes_entrevista TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON user_roles TO authenticated;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Permissão para executar função
GRANT EXECUTE ON FUNCTION public.gerar_codigo_indicacao TO authenticated;

-- =============================================
-- PARTE 8: REFRESH DO SCHEMA CACHE
-- =============================================

-- Forçar atualização do cache
NOTIFY pgrst, 'reload schema';

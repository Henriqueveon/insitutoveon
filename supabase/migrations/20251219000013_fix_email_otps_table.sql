-- =====================================================
-- CORRIGIR TABELA EMAIL_OTPS
-- Garantir estrutura correta e políticas RLS
-- =====================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  codigo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'verificacao',
  tentativas INT DEFAULT 0,
  max_tentativas INT DEFAULT 5,
  expira_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'),
  verificado BOOLEAN DEFAULT FALSE,
  verificado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_codigo ON email_otps(codigo);
CREATE INDEX IF NOT EXISTS idx_email_otps_lookup ON email_otps(email, codigo, verificado);

-- Habilitar RLS
ALTER TABLE email_otps ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Permitir inserção" ON email_otps;
DROP POLICY IF EXISTS "Permitir leitura" ON email_otps;
DROP POLICY IF EXISTS "Permitir atualização" ON email_otps;
DROP POLICY IF EXISTS "Permitir deleção" ON email_otps;
DROP POLICY IF EXISTS "email_otps_insert" ON email_otps;
DROP POLICY IF EXISTS "email_otps_select" ON email_otps;
DROP POLICY IF EXISTS "email_otps_update" ON email_otps;
DROP POLICY IF EXISTS "email_otps_delete" ON email_otps;
DROP POLICY IF EXISTS "service_role_all" ON email_otps;
DROP POLICY IF EXISTS "service_role_full_access" ON email_otps;
DROP POLICY IF EXISTS "anon_insert" ON email_otps;
DROP POLICY IF EXISTS "anon_select" ON email_otps;
DROP POLICY IF EXISTS "anon_update" ON email_otps;
DROP POLICY IF EXISTS "authenticated_insert" ON email_otps;
DROP POLICY IF EXISTS "authenticated_select" ON email_otps;
DROP POLICY IF EXISTS "authenticated_update" ON email_otps;

-- Criar política permissiva para service_role (Edge Functions)
CREATE POLICY "service_role_full_access" ON email_otps
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Criar políticas para anon e authenticated (para fallback)
CREATE POLICY "anon_insert" ON email_otps
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_select" ON email_otps
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon_update" ON email_otps
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_insert" ON email_otps
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_select" ON email_otps
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_update" ON email_otps
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Conceder permissões
GRANT ALL ON email_otps TO authenticated;
GRANT ALL ON email_otps TO anon;
GRANT ALL ON email_otps TO service_role;

-- Comentário na tabela
COMMENT ON TABLE email_otps IS 'Armazena códigos OTP para verificação de email';

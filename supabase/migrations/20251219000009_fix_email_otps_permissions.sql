-- =====================================================
-- FIX: Garantir permissões corretas na tabela email_otps
-- =====================================================

-- Garantir que a tabela existe com estrutura correta
CREATE TABLE IF NOT EXISTS email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  codigo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'verificacao',
  tentativas INT DEFAULT 0,
  max_tentativas INT DEFAULT 3,
  expira_em TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'),
  verificado BOOLEAN DEFAULT FALSE,
  verificado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_codigo ON email_otps(codigo);
CREATE INDEX IF NOT EXISTS idx_email_otps_email_codigo ON email_otps(email, codigo);

-- Desabilitar RLS temporariamente para garantir acesso
ALTER TABLE email_otps DISABLE ROW LEVEL SECURITY;

-- Grants completos
GRANT ALL ON email_otps TO authenticated;
GRANT ALL ON email_otps TO anon;
GRANT ALL ON email_otps TO service_role;

-- Habilitar RLS com policies permissivas
ALTER TABLE email_otps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_otps_full_access" ON email_otps;
CREATE POLICY "email_otps_full_access" ON email_otps
  FOR ALL
  USING (true)
  WITH CHECK (true);

SELECT 'Permissões email_otps corrigidas!' as resultado;

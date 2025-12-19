-- =====================================================
-- TABELA EMAIL_OTPS PARA VERIFICAÇÃO POR CÓDIGO
-- =====================================================

-- Criar extensão UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela
CREATE TABLE IF NOT EXISTS email_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  codigo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'verificacao', -- 'verificacao', 'login', 'recuperacao'
  tentativas INT DEFAULT 0,
  max_tentativas INT DEFAULT 3,
  expira_em TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  verificado BOOLEAN DEFAULT FALSE,
  verificado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_codigo ON email_otps(codigo);
CREATE INDEX IF NOT EXISTS idx_email_otps_expira ON email_otps(expira_em);
CREATE INDEX IF NOT EXISTS idx_email_otps_verificado ON email_otps(verificado);

-- Habilitar RLS
ALTER TABLE email_otps ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes se houver
DROP POLICY IF EXISTS "Qualquer um pode criar OTP" ON email_otps;
DROP POLICY IF EXISTS "Sistema pode verificar OTP" ON email_otps;
DROP POLICY IF EXISTS "Sistema pode atualizar OTP" ON email_otps;

-- Policy para inserir (qualquer um pode solicitar OTP)
CREATE POLICY "Qualquer um pode criar OTP" ON email_otps
  FOR INSERT WITH CHECK (true);

-- Policy para selecionar (para verificação)
CREATE POLICY "Sistema pode verificar OTP" ON email_otps
  FOR SELECT USING (true);

-- Policy para atualizar (para marcar como verificado)
CREATE POLICY "Sistema pode atualizar OTP" ON email_otps
  FOR UPDATE USING (true);

-- Policy para deletar (limpeza)
CREATE POLICY "Sistema pode deletar OTP" ON email_otps
  FOR DELETE USING (true);

-- Função para limpar OTPs expirados (executar periodicamente)
CREATE OR REPLACE FUNCTION limpar_otps_expirados()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM email_otps
  WHERE expira_em < NOW() - INTERVAL '1 hour'
     OR (verificado = true AND verificado_em < NOW() - INTERVAL '1 day');
END;
$$;

SELECT 'Tabela email_otps criada com sucesso!' as resultado;

-- =============================================
-- CORRIGIR NOMES DAS COLUNAS DA TABELA email_otps
-- Renomear colunas com caracteres especiais para padrão
-- =============================================

-- Verificar e renomear colunas se existirem com nomes errados
DO $$
BEGIN
  -- Renomear "e-mail" para "email" se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_otps' AND column_name = 'e-mail'
  ) THEN
    ALTER TABLE email_otps RENAME COLUMN "e-mail" TO email;
    RAISE NOTICE 'Coluna e-mail renomeada para email';
  END IF;

  -- Renomear "código" para "codigo" se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_otps' AND column_name = 'código'
  ) THEN
    ALTER TABLE email_otps RENAME COLUMN "código" TO codigo;
    RAISE NOTICE 'Coluna código renomeada para codigo';
  END IF;

  -- Renomear "criado_em" para "created_at" se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_otps' AND column_name = 'criado_em'
  ) THEN
    ALTER TABLE email_otps RENAME COLUMN "criado_em" TO created_at;
    RAISE NOTICE 'Coluna criado_em renomeada para created_at';
  END IF;

  -- Renomear "esforço" para "tentativas" se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_otps' AND column_name = 'esforço'
  ) THEN
    ALTER TABLE email_otps RENAME COLUMN "esforço" TO tentativas;
    RAISE NOTICE 'Coluna esforço renomeada para tentativas';
  END IF;
END $$;

-- Garantir que as colunas existem com os nomes corretos
DO $$
BEGIN
  -- email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_otps' AND column_name = 'email'
  ) THEN
    ALTER TABLE email_otps ADD COLUMN email TEXT;
  END IF;

  -- codigo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_otps' AND column_name = 'codigo'
  ) THEN
    ALTER TABLE email_otps ADD COLUMN codigo TEXT;
  END IF;

  -- created_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_otps' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE email_otps ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- tentativas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_otps' AND column_name = 'tentativas'
  ) THEN
    ALTER TABLE email_otps ADD COLUMN tentativas INT DEFAULT 0;
  END IF;
END $$;

-- Recriar índices com nomes corretos
DROP INDEX IF EXISTS idx_email_otps_email;
DROP INDEX IF EXISTS idx_email_otps_codigo;
DROP INDEX IF EXISTS idx_email_otps_lookup;

CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_codigo ON email_otps(codigo);
CREATE INDEX IF NOT EXISTS idx_email_otps_lookup ON email_otps(email, codigo, verificado);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

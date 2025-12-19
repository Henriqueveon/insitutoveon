-- =====================================================
-- ADICIONAR CAMPO EMAIL_VERIFICADO NAS TABELAS
-- =====================================================

-- Candidatos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidatos_recrutamento' AND column_name = 'email_verificado') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN email_verificado BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidatos_recrutamento' AND column_name = 'email_verificado_em') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN email_verificado_em TIMESTAMPTZ;
  END IF;
END $$;

-- Empresas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'empresas_recrutamento' AND column_name = 'email_verificado') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN email_verificado BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'empresas_recrutamento' AND column_name = 'email_verificado_em') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN email_verificado_em TIMESTAMPTZ;
  END IF;
END $$;

-- Marcar contas existentes como verificadas (já passaram pelo processo antigo)
UPDATE candidatos_recrutamento
SET email_verificado = TRUE, email_verificado_em = created_at
WHERE email_verificado IS NULL OR email_verificado = FALSE;

UPDATE empresas_recrutamento
SET email_verificado = TRUE, email_verificado_em = created_at
WHERE email_verificado IS NULL OR email_verificado = FALSE;

SELECT 'Campos email_verificado adicionados!' as resultado;

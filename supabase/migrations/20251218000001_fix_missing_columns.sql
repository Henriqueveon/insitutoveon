-- Add missing columns to empresas_recrutamento if they don't exist
DO $$
BEGIN
  -- socio_email
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'empresas_recrutamento' AND column_name = 'socio_email') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN socio_email TEXT;
  END IF;

  -- socio_foto_url
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'empresas_recrutamento' AND column_name = 'socio_foto_url') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN socio_foto_url TEXT;
  END IF;

  -- responsavel_nome
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'empresas_recrutamento' AND column_name = 'responsavel_nome') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN responsavel_nome TEXT;
  END IF;

  -- responsavel_cargo
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'empresas_recrutamento' AND column_name = 'responsavel_cargo') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN responsavel_cargo TEXT;
  END IF;

  -- socio_funcao
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'empresas_recrutamento' AND column_name = 'socio_funcao') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN socio_funcao TEXT;
  END IF;

  -- verificado
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'empresas_recrutamento' AND column_name = 'verificado') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN verificado BOOLEAN DEFAULT false;
  END IF;

  -- cadastro_completo
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'empresas_recrutamento' AND column_name = 'cadastro_completo') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN cadastro_completo BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create indexes if they don't exist (ignore errors)
CREATE INDEX IF NOT EXISTS idx_empresas_socio_email ON empresas_recrutamento(socio_email);

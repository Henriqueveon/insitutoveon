-- =====================================================
-- Converter objetivo_profissional de TEXT para JSONB
-- Para suportar array de áreas de interesse (1-5 tags)
-- =====================================================

-- Alterar tipo da coluna para JSONB
-- Dados existentes (texto) são convertidos para array com 1 elemento
ALTER TABLE candidatos_recrutamento
ALTER COLUMN objetivo_profissional TYPE JSONB
USING CASE
  WHEN objetivo_profissional IS NOT NULL AND objetivo_profissional != ''
  THEN jsonb_build_array(objetivo_profissional)
  ELSE '[]'::jsonb
END;

-- Definir valor padrão como array vazio
ALTER TABLE candidatos_recrutamento
ALTER COLUMN objetivo_profissional SET DEFAULT '[]'::jsonb;

-- Comentário explicativo na coluna
COMMENT ON COLUMN candidatos_recrutamento.objetivo_profissional IS
'Array JSON de até 5 áreas de interesse de atuação profissional (máx 25 chars cada)';

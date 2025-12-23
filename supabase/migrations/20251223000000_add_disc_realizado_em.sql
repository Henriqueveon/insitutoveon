-- =====================================================
-- ADICIONAR CAMPO DISC_REALIZADO_EM
-- Para controlar quando candidato pode refazer teste (21 dias)
-- =====================================================

-- Adicionar coluna para data de realização do teste DISC
ALTER TABLE candidatos_recrutamento
ADD COLUMN IF NOT EXISTS disc_realizado_em TIMESTAMPTZ;

-- Comentário explicativo
COMMENT ON COLUMN candidatos_recrutamento.disc_realizado_em IS
'Data/hora em que o candidato realizou o teste DISC. Pode refazer após 21 dias.';

-- Atualizar candidatos que já têm perfil_disc mas não têm a data
-- Usa created_at como fallback para candidatos existentes
UPDATE candidatos_recrutamento
SET disc_realizado_em = COALESCE(updated_at, created_at)
WHERE perfil_disc IS NOT NULL
  AND disc_realizado_em IS NULL;

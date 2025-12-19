-- =====================================================
-- MIGRAÇÃO: Adicionar campo perfil_natural em candidatos_recrutamento
-- Para armazenar os scores DISC detalhados
-- =====================================================

-- Adicionar campo perfil_natural (JSONB com D, I, S, C scores)
ALTER TABLE public.candidatos_recrutamento
ADD COLUMN IF NOT EXISTS perfil_natural JSONB;

-- Comentário explicativo
COMMENT ON COLUMN public.candidatos_recrutamento.perfil_natural IS 'Scores DISC detalhados: {D: number, I: number, S: number, C: number}';

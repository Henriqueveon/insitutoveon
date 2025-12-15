-- =====================================================
-- MIGRAÇÃO: Adicionar campos de confiabilidade em candidatos_recrutamento
-- Para armazenar os scores de confiabilidade do teste DISC
-- =====================================================

-- Adicionar campos de confiabilidade
ALTER TABLE public.candidatos_recrutamento
ADD COLUMN IF NOT EXISTS confiabilidade_score INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS confiabilidade_nivel VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS confiabilidade_flags JSONB DEFAULT '[]'::jsonb;

-- Comentários explicativos
COMMENT ON COLUMN public.candidatos_recrutamento.confiabilidade_score IS 'Score de confiabilidade do teste DISC (0-100)';
COMMENT ON COLUMN public.candidatos_recrutamento.confiabilidade_nivel IS 'Nível de confiabilidade: ALTA, MEDIA, BAIXA, SUSPEITA';
COMMENT ON COLUMN public.candidatos_recrutamento.confiabilidade_flags IS 'Array de flags detectadas durante o teste DISC';

-- Criar índice para consultas por confiabilidade
CREATE INDEX IF NOT EXISTS idx_candidatos_recrutamento_confiabilidade
ON public.candidatos_recrutamento(confiabilidade_nivel);

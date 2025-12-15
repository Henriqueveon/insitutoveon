-- ============================================
-- ADICIONAR CAMPOS EXTRAS DE CONFIABILIDADE
-- ============================================

-- 1. Adicionar coluna de score separado (0-100)
ALTER TABLE public.candidatos_recrutamento
ADD COLUMN IF NOT EXISTS confiabilidade_score INTEGER DEFAULT NULL;

-- 2. Adicionar coluna de nível (baixa, media, alta, muito_alta)
ALTER TABLE public.candidatos_recrutamento
ADD COLUMN IF NOT EXISTS confiabilidade_nivel VARCHAR(20) DEFAULT NULL;

-- 3. Adicionar coluna de flags (quais itens estão completos)
ALTER TABLE public.candidatos_recrutamento
ADD COLUMN IF NOT EXISTS confiabilidade_flags JSONB DEFAULT '[]'::jsonb;

-- 4. Criar índice para otimizar buscas por nível de confiabilidade
CREATE INDEX IF NOT EXISTS idx_candidatos_recrutamento_confiabilidade_nivel
ON public.candidatos_recrutamento(confiabilidade_nivel);

-- 5. Atualizar confiabilidade_nivel baseado no score existente
UPDATE public.candidatos_recrutamento
SET confiabilidade_nivel = CASE
    WHEN confiabilidade >= 80 THEN 'muito_alta'
    WHEN confiabilidade >= 60 THEN 'alta'
    WHEN confiabilidade >= 40 THEN 'media'
    ELSE 'baixa'
END,
confiabilidade_score = confiabilidade
WHERE confiabilidade IS NOT NULL;
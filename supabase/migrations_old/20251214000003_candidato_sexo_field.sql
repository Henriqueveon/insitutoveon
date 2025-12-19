-- =====================================================
-- MIGRAÇÃO: Adicionar campo sexo para candidatos
-- Para permitir filtro de sexo na busca de empresas
-- =====================================================

-- 1. Adicionar coluna sexo
ALTER TABLE public.candidatos_recrutamento
ADD COLUMN IF NOT EXISTS sexo VARCHAR(20);

-- 2. Criar índice para filtro por sexo
CREATE INDEX IF NOT EXISTS idx_candidatos_sexo
ON public.candidatos_recrutamento(sexo);

-- 3. Comentário no campo
COMMENT ON COLUMN public.candidatos_recrutamento.sexo IS
'Sexo do candidato: masculino, feminino, outro';

-- =====================================================
-- MIGRAÇÃO: Cadastro Simplificado de Candidatos
-- Permite cadastro inicial apenas com nome, telefone, email
-- =====================================================

-- 1. Adicionar coluna cadastro_completo
ALTER TABLE public.candidatos_recrutamento
ADD COLUMN IF NOT EXISTS cadastro_completo BOOLEAN DEFAULT FALSE;

-- 2. Adicionar coluna para código de indicação usado no cadastro
ALTER TABLE public.candidatos_recrutamento
ADD COLUMN IF NOT EXISTS codigo_indicacao VARCHAR(20);

-- 3. Tornar campos opcionais para cadastro rápido (se ainda forem NOT NULL)
-- Nota: Isso só funciona se os campos já existirem como NOT NULL
DO $$
BEGIN
    -- Tornar data_nascimento opcional
    ALTER TABLE public.candidatos_recrutamento ALTER COLUMN data_nascimento DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    -- Tornar cpf opcional
    ALTER TABLE public.candidatos_recrutamento ALTER COLUMN cpf DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    -- Tornar estado opcional
    ALTER TABLE public.candidatos_recrutamento ALTER COLUMN estado DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    -- Tornar cidade opcional
    ALTER TABLE public.candidatos_recrutamento ALTER COLUMN cidade DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 4. Atualizar candidatos existentes que já possuem dados completos
UPDATE public.candidatos_recrutamento
SET cadastro_completo = TRUE
WHERE data_nascimento IS NOT NULL
  AND cpf IS NOT NULL
  AND estado IS NOT NULL
  AND cidade IS NOT NULL
  AND areas_experiencia IS NOT NULL
  AND escolaridade IS NOT NULL
  AND pretensao_salarial IS NOT NULL;

-- 5. Criar índice para busca de candidatos completos
CREATE INDEX IF NOT EXISTS idx_candidatos_cadastro_completo
ON public.candidatos_recrutamento(cadastro_completo);

-- 6. Criar índice composto para busca de candidatos disponíveis e completos
CREATE INDEX IF NOT EXISTS idx_candidatos_disponiveis_completos
ON public.candidatos_recrutamento(status, cadastro_completo)
WHERE status = 'disponivel' AND cadastro_completo = TRUE;

-- 7. Adicionar status 'pendente' para novos cadastros incompletos
COMMENT ON COLUMN public.candidatos_recrutamento.status IS
'Status do candidato: disponivel, em_processo, recrutado, pausado, pendente (cadastro incompleto)';

-- 8. Criar view para candidatos visíveis às empresas (completos)
CREATE OR REPLACE VIEW public.candidatos_disponiveis AS
SELECT *
FROM public.candidatos_recrutamento
WHERE status = 'disponivel'
  AND cadastro_completo = TRUE
  AND perfil_disc IS NOT NULL
  AND foto_url IS NOT NULL;

-- Comentário na view
COMMENT ON VIEW public.candidatos_disponiveis IS
'View de candidatos visíveis para empresas - apenas perfis completos';

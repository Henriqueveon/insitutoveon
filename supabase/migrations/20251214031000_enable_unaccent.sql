-- =====================================================
-- CORREÇÃO: Habilitar extensão unaccent
-- Necessária para triggers que removem acentos
-- =====================================================

-- 1. Habilitar extensão unaccent
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Se houver trigger problemático, desabilitá-lo temporariamente
-- (Vamos dropar qualquer trigger de normalização que possa existir)
DROP TRIGGER IF EXISTS normalize_candidato_nome ON public.candidatos_recrutamento;
DROP TRIGGER IF EXISTS trigger_normalize_nome ON public.candidatos_recrutamento;
DROP TRIGGER IF EXISTS tr_normalize_candidato ON public.candidatos_recrutamento;

-- 3. Dropar função que possa usar unaccent se existir
DROP FUNCTION IF EXISTS public.normalize_candidato_nome() CASCADE;
DROP FUNCTION IF EXISTS public.normalizar_nome() CASCADE;

-- 4. Se precisar de normalização, criar uma função segura
CREATE OR REPLACE FUNCTION public.normalize_text_safe(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Tentar usar unaccent se disponível
    BEGIN
        RETURN LOWER(unaccent(COALESCE(input_text, '')));
    EXCEPTION WHEN undefined_function THEN
        -- Se unaccent não existe, retornar sem normalização
        RETURN LOWER(COALESCE(input_text, ''));
    END;
END;
$$;

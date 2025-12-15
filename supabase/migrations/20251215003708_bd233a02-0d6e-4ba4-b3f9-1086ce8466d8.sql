-- =====================================================
-- CORREÇÃO COMPLETA - Triggers, extensões e função RPC
-- Data: 2025-12-14
-- =====================================================

-- 1. HABILITAR EXTENSÃO UNACCENT
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. DROPAR TRIGGERS PROBLEMÁTICOS QUE USAM UNACCENT
DROP TRIGGER IF EXISTS normalize_candidato_nome ON public.candidatos_recrutamento;
DROP TRIGGER IF EXISTS trigger_normalize_nome ON public.candidatos_recrutamento;
DROP TRIGGER IF EXISTS tr_normalize_candidato ON public.candidatos_recrutamento;
DROP TRIGGER IF EXISTS normalizar_nome_trigger ON public.candidatos_recrutamento;
DROP TRIGGER IF EXISTS set_nome_normalizado ON public.candidatos_recrutamento;

-- 3. DROPAR FUNÇÕES QUE USAM UNACCENT
DROP FUNCTION IF EXISTS public.normalize_candidato_nome() CASCADE;
DROP FUNCTION IF EXISTS public.normalizar_nome() CASCADE;
DROP FUNCTION IF EXISTS public.set_nome_normalizado() CASCADE;

-- 4. CRIAR/ATUALIZAR FUNÇÃO RPC DE CADASTRO RÁPIDO
CREATE OR REPLACE FUNCTION public.cadastrar_candidato_rapido(
    p_nome_completo VARCHAR,
    p_telefone VARCHAR,
    p_email VARCHAR,
    p_auth_user_id UUID DEFAULT NULL,
    p_codigo_indicacao VARCHAR DEFAULT NULL
) 
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE 
    v_candidato_id UUID;
BEGIN
    -- Verificar email duplicado
    IF EXISTS (SELECT 1 FROM candidatos_recrutamento WHERE LOWER(email) = LOWER(p_email)) THEN
        RETURN json_build_object('success', false, 'error', 'E-mail já cadastrado');
    END IF;
    
    -- Verificar telefone duplicado
    IF EXISTS (SELECT 1 FROM candidatos_recrutamento WHERE telefone = p_telefone) THEN
        RETURN json_build_object('success', false, 'error', 'Telefone já cadastrado');
    END IF;
    
    -- Inserir candidato
    INSERT INTO candidatos_recrutamento (
        nome_completo, 
        telefone, 
        email, 
        auth_user_id,
        status, 
        cadastro_completo,
        aceite_termos, 
        aceite_termos_data,
        aceite_lgpd, 
        aceite_lgpd_data
    ) VALUES (
        p_nome_completo, 
        p_telefone, 
        LOWER(p_email), 
        p_auth_user_id,
        'disponivel', 
        FALSE,
        TRUE, 
        NOW(),
        TRUE, 
        NOW()
    ) RETURNING id INTO v_candidato_id;
    
    -- Processar indicação se houver
    IF p_codigo_indicacao IS NOT NULL AND p_codigo_indicacao != '' THEN
        BEGIN
            PERFORM processar_indicacao(p_codigo_indicacao, 'candidato', v_candidato_id);
        EXCEPTION WHEN OTHERS THEN
            -- Ignorar erro de indicação
            NULL;
        END;
    END IF;
    
    RETURN json_build_object('success', true, 'candidato_id', v_candidato_id);
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END; 
$$;

-- 5. CONCEDER PERMISSÕES À FUNÇÃO
GRANT EXECUTE ON FUNCTION public.cadastrar_candidato_rapido TO anon;
GRANT EXECUTE ON FUNCTION public.cadastrar_candidato_rapido TO authenticated;
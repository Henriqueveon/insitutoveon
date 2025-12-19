-- =====================================================
-- MIGRAÇÃO: fix_candidato_insert
-- Data: 2025-12-14
-- Objetivo: Corrigir políticas RLS e criar função RPC
-- =====================================================

-- PARTE 1: REMOVER POLÍTICAS CONFLITANTES
DROP POLICY IF EXISTS "Candidatos podem se cadastrar" ON public.candidatos_recrutamento;
DROP POLICY IF EXISTS "Candidatos podem ver seus dados" ON public.candidatos_recrutamento;
DROP POLICY IF EXISTS "Candidatos podem atualizar seus dados" ON public.candidatos_recrutamento;
DROP POLICY IF EXISTS "Candidatos select all" ON public.candidatos_recrutamento;
DROP POLICY IF EXISTS "Candidatos update all" ON public.candidatos_recrutamento;
DROP POLICY IF EXISTS "Leitura pública de candidatos disponíveis" ON public.candidatos_recrutamento;

-- PARTE 2: CRIAR POLÍTICAS PERMISSIVAS
CREATE POLICY "candidatos_select_public" 
ON public.candidatos_recrutamento 
FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "candidatos_insert_public" 
ON public.candidatos_recrutamento 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "candidatos_update_own" 
ON public.candidatos_recrutamento 
FOR UPDATE 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- PARTE 3: CRIAR FUNÇÃO RPC PARA CADASTRO RÁPIDO
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
    )
    VALUES (
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
    )
    RETURNING id INTO v_candidato_id;
    
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
    
EXCEPTION 
    WHEN OTHERS THEN 
        RETURN json_build_object('success', false, 'error', SQLERRM);
END; 
$$;

-- PARTE 4: CONCEDER PERMISSÕES
GRANT EXECUTE ON FUNCTION public.cadastrar_candidato_rapido TO anon;
GRANT EXECUTE ON FUNCTION public.cadastrar_candidato_rapido TO authenticated;
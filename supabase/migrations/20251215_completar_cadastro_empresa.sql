-- =====================================================
-- MIGRAÇÃO: Função para Completar Cadastro da Empresa
-- Bypassa RLS para permitir empresas sem Auth completarem cadastro
-- =====================================================

-- Função RPC para completar cadastro (bypassa RLS)
CREATE OR REPLACE FUNCTION public.completar_cadastro_empresa(
    p_empresa_id UUID,
    p_socio_nome VARCHAR,
    p_socio_funcao VARCHAR,
    p_socio_cpf VARCHAR,
    p_senha VARCHAR
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_empresa_exists BOOLEAN;
BEGIN
    -- Verificar se empresa existe
    SELECT EXISTS (
        SELECT 1 FROM empresas_recrutamento WHERE id = p_empresa_id
    ) INTO v_empresa_exists;

    IF NOT v_empresa_exists THEN
        RETURN json_build_object('success', false, 'error', 'Empresa não encontrada');
    END IF;

    -- Atualizar dados da empresa
    UPDATE empresas_recrutamento
    SET
        socio_nome = p_socio_nome,
        socio_funcao = p_socio_funcao,
        socio_cpf = p_socio_cpf,
        senha_hash = p_senha,
        cadastro_completo = TRUE,
        updated_at = NOW()
    WHERE id = p_empresa_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Cadastro completado com sucesso'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION public.completar_cadastro_empresa IS
'Completa o cadastro da empresa com dados do responsável. Bypassa RLS para permitir execução sem Auth.';

-- Grant para execução anônima
GRANT EXECUTE ON FUNCTION public.completar_cadastro_empresa TO anon;
GRANT EXECUTE ON FUNCTION public.completar_cadastro_empresa TO authenticated;

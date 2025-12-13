-- Dropar função se existir
DROP FUNCTION IF EXISTS public.delete_candidato(UUID);

-- Criar função que deleta candidato e retorna sucesso/falha
CREATE OR REPLACE FUNCTION public.delete_candidato(p_candidato_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted_count INTEGER;
    v_candidato_nome TEXT;
BEGIN
    -- Buscar nome do candidato antes de deletar
    SELECT nome_completo INTO v_candidato_nome
    FROM public.candidatos_disc
    WHERE id = p_candidato_id;
    
    -- Se não encontrou o candidato
    IF v_candidato_nome IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Candidato não encontrado'
        );
    END IF;
    
    -- Deletar métricas associadas primeiro (foreign key)
    DELETE FROM public.metricas_teste
    WHERE candidato_id = p_candidato_id;
    
    -- Deletar o candidato
    DELETE FROM public.candidatos_disc
    WHERE id = p_candidato_id;
    
    -- Verificar quantos foram deletados
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    IF v_deleted_count > 0 THEN
        RETURN jsonb_build_object(
            'success', true,
            'deleted_count', v_deleted_count,
            'nome', v_candidato_nome
        );
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Falha ao deletar candidato'
        );
    END IF;
END;
$$;

-- Dar permissão para usuários anônimos e autenticados
GRANT EXECUTE ON FUNCTION public.delete_candidato(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.delete_candidato(UUID) TO authenticated;
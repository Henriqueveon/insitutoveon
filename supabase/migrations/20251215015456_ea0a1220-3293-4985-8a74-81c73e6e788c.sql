-- =====================================================
-- CORREÇÃO COMPLETA: Permitir exclusão de candidatos
-- Data: 15/12/2025
-- =====================================================

-- ============================================
-- PARTE 1: POLÍTICAS RLS PARA candidatos_recrutamento
-- ============================================

-- Remover políticas antigas de DELETE (se existirem)
DROP POLICY IF EXISTS "candidatos_delete_policy" ON public.candidatos_recrutamento;
DROP POLICY IF EXISTS "candidatos_delete_authenticated" ON public.candidatos_recrutamento;
DROP POLICY IF EXISTS "candidatos_delete_anon" ON public.candidatos_recrutamento;
DROP POLICY IF EXISTS "enable_delete_for_authenticated" ON public.candidatos_recrutamento;
DROP POLICY IF EXISTS "gestor_pode_deletar_candidatos" ON public.candidatos_recrutamento;
DROP POLICY IF EXISTS "candidatos_delete_auth" ON public.candidatos_recrutamento;
DROP POLICY IF EXISTS "Candidatos delete authenticated" ON public.candidatos_recrutamento;

-- Criar política de DELETE para usuários autenticados
CREATE POLICY "candidatos_delete_authenticated"
ON public.candidatos_recrutamento
FOR DELETE
TO authenticated
USING (true);

-- GRANT DELETE
GRANT DELETE ON public.candidatos_recrutamento TO authenticated;
GRANT DELETE ON public.candidatos_recrutamento TO anon;

-- ============================================
-- PARTE 2: POLÍTICAS RLS PARA solicitacoes_entrevista
-- ============================================

DROP POLICY IF EXISTS "solicitacoes_delete_policy" ON public.solicitacoes_entrevista;
DROP POLICY IF EXISTS "solicitacoes_delete_authenticated" ON public.solicitacoes_entrevista;
DROP POLICY IF EXISTS "enable_delete_solicitacoes" ON public.solicitacoes_entrevista;

CREATE POLICY "solicitacoes_delete_authenticated"
ON public.solicitacoes_entrevista
FOR DELETE
TO authenticated
USING (true);

GRANT DELETE ON public.solicitacoes_entrevista TO authenticated;
GRANT DELETE ON public.solicitacoes_entrevista TO anon;

-- ============================================
-- PARTE 3: POLÍTICAS RLS PARA indicacoes
-- ============================================

DROP POLICY IF EXISTS "indicacoes_delete_policy" ON public.indicacoes;
DROP POLICY IF EXISTS "indicacoes_delete_authenticated" ON public.indicacoes;

CREATE POLICY "indicacoes_delete_authenticated"
ON public.indicacoes
FOR DELETE
TO authenticated
USING (true);

GRANT DELETE ON public.indicacoes TO authenticated;
GRANT DELETE ON public.indicacoes TO anon;

-- ============================================
-- PARTE 4: POLÍTICAS RLS PARA favoritos_recrutamento
-- ============================================

DROP POLICY IF EXISTS "favoritos_delete_authenticated" ON public.favoritos_recrutamento;

CREATE POLICY "favoritos_delete_authenticated"
ON public.favoritos_recrutamento
FOR DELETE
TO authenticated
USING (true);

GRANT DELETE ON public.favoritos_recrutamento TO authenticated;

-- ============================================
-- PARTE 5: POLÍTICAS RLS PARA propostas_recrutamento
-- ============================================

DROP POLICY IF EXISTS "propostas_delete_authenticated" ON public.propostas_recrutamento;

CREATE POLICY "propostas_delete_authenticated"
ON public.propostas_recrutamento
FOR DELETE
TO authenticated
USING (true);

GRANT DELETE ON public.propostas_recrutamento TO authenticated;

-- ============================================
-- PARTE 6: FUNÇÃO RPC PARA EXCLUSÃO COMPLETA
-- ============================================

CREATE OR REPLACE FUNCTION public.delete_candidato_completo(p_candidato_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted_solicitacoes INT := 0;
    v_deleted_indicacoes INT := 0;
    v_deleted_favoritos INT := 0;
    v_deleted_propostas INT := 0;
    v_candidato_nome TEXT;
BEGIN
    -- Buscar nome do candidato
    SELECT nome_completo INTO v_candidato_nome
    FROM candidatos_recrutamento
    WHERE id = p_candidato_id;
    
    IF v_candidato_nome IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Candidato não encontrado'
        );
    END IF;
    
    -- Deletar solicitações de entrevista
    DELETE FROM solicitacoes_entrevista WHERE candidato_id = p_candidato_id;
    GET DIAGNOSTICS v_deleted_solicitacoes = ROW_COUNT;
    
    -- Deletar indicações
    DELETE FROM indicacoes WHERE indicado_id = p_candidato_id AND indicado_tipo = 'candidato';
    GET DIAGNOSTICS v_deleted_indicacoes = ROW_COUNT;
    
    -- Deletar favoritos
    DELETE FROM favoritos_recrutamento WHERE candidato_id = p_candidato_id;
    GET DIAGNOSTICS v_deleted_favoritos = ROW_COUNT;
    
    -- Deletar propostas
    DELETE FROM propostas_recrutamento WHERE candidato_id = p_candidato_id;
    GET DIAGNOSTICS v_deleted_propostas = ROW_COUNT;
    
    -- Finalmente, deletar o candidato
    DELETE FROM candidatos_recrutamento WHERE id = p_candidato_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Candidato excluído com sucesso',
        'candidato_nome', v_candidato_nome,
        'registros_removidos', json_build_object(
            'solicitacoes', v_deleted_solicitacoes,
            'indicacoes', v_deleted_indicacoes,
            'favoritos', v_deleted_favoritos,
            'propostas', v_deleted_propostas
        )
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Conceder permissões
GRANT EXECUTE ON FUNCTION public.delete_candidato_completo TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_candidato_completo TO anon;
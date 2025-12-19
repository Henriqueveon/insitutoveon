-- =====================================================
-- FUNÇÃO RPC PARA DELETAR EMPRESA
-- Usa SECURITY DEFINER para bypassar RLS
-- =====================================================

DROP FUNCTION IF EXISTS public.delete_empresa(UUID);

CREATE OR REPLACE FUNCTION public.delete_empresa(p_empresa_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted_count INTEGER;
    v_empresa_nome TEXT;
BEGIN
    SELECT razao_social INTO v_empresa_nome
    FROM public.empresas_recrutamento
    WHERE id = p_empresa_id;
    
    IF v_empresa_nome IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Empresa não encontrada');
    END IF;
    
    -- Deletar registros relacionados
    DELETE FROM public.notificacoes WHERE destinatario_id = p_empresa_id;
    DELETE FROM public.notificacoes_recrutamento WHERE destinatario_id = p_empresa_id;
    DELETE FROM public.transacoes_recrutamento WHERE usuario_id = p_empresa_id;
    DELETE FROM public.favoritos_recrutamento WHERE empresa_id = p_empresa_id;
    DELETE FROM public.entrevistas_recrutamento WHERE empresa_id = p_empresa_id;
    DELETE FROM public.propostas_recrutamento WHERE empresa_id = p_empresa_id;
    DELETE FROM public.solicitacoes_entrevista WHERE empresa_id = p_empresa_id;
    DELETE FROM public.vagas_recrutamento WHERE empresa_id = p_empresa_id;
    
    -- Deletar a empresa
    DELETE FROM public.empresas_recrutamento WHERE id = p_empresa_id;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    IF v_deleted_count > 0 THEN
        RETURN jsonb_build_object('success', true, 'deleted_count', v_deleted_count, 'nome', v_empresa_nome);
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Falha ao deletar');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_empresa(UUID) TO authenticated, anon, service_role;

-- Política RLS para DELETE
DROP POLICY IF EXISTS "empresas_delete_all" ON public.empresas_recrutamento;
CREATE POLICY "empresas_delete_all" ON public.empresas_recrutamento
  FOR DELETE TO anon, authenticated USING (true);
-- ============================================
-- MIGRAÇÃO 2: FIX STATUS DISC
-- Profissional fica ONLINE ao completar DISC
-- ============================================

-- 1. Adicionar coluna para data de conclusão do DISC
ALTER TABLE public.candidatos_recrutamento 
ADD COLUMN IF NOT EXISTS disc_completado_em TIMESTAMP WITH TIME ZONE;

-- 2. Adicionar coluna para resultado completo do DISC (JSON)
ALTER TABLE public.candidatos_recrutamento 
ADD COLUMN IF NOT EXISTS disc_resultado_json JSONB;

-- 3. Criar função para atualizar status automaticamente após DISC
CREATE OR REPLACE FUNCTION public.atualizar_status_apos_disc()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.perfil_disc IS NOT NULL AND (OLD.perfil_disc IS NULL OR OLD.perfil_disc = '') THEN
        NEW.status := 'disponivel';
        NEW.disc_completado_em := NOW();
        NEW.cadastro_completo := TRUE;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 4. Dropar trigger antigo se existir
DROP TRIGGER IF EXISTS tr_atualizar_status_disc ON public.candidatos_recrutamento;

-- 5. Criar trigger para atualizar status quando DISC for preenchido
CREATE TRIGGER tr_atualizar_status_disc
BEFORE UPDATE ON public.candidatos_recrutamento
FOR EACH ROW
WHEN (NEW.perfil_disc IS DISTINCT FROM OLD.perfil_disc)
EXECUTE FUNCTION atualizar_status_apos_disc();

-- 6. Criar função RPC para finalizar DISC manualmente
CREATE OR REPLACE FUNCTION public.finalizar_disc_candidato(
    p_candidato_id UUID,
    p_perfil_disc VARCHAR,
    p_resultado_json JSONB DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_candidato RECORD;
BEGIN
    SELECT * INTO v_candidato
    FROM candidatos_recrutamento
    WHERE id = p_candidato_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Candidato não encontrado');
    END IF;
    
    UPDATE candidatos_recrutamento
    SET 
        perfil_disc = p_perfil_disc,
        disc_resultado_json = p_resultado_json,
        disc_completado_em = NOW(),
        status = 'disponivel',
        cadastro_completo = TRUE
    WHERE id = p_candidato_id;
    
    PERFORM calcular_confiabilidade(p_candidato_id);
    
    RETURN json_build_object(
        'success', true,
        'message', 'DISC finalizado! Profissional está ONLINE',
        'status', 'disponivel',
        'perfil_disc', p_perfil_disc
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 7. Conceder permissões
GRANT EXECUTE ON FUNCTION public.finalizar_disc_candidato TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalizar_disc_candidato TO anon;

-- 8. Atualizar candidatos que já têm DISC mas não estão disponíveis
UPDATE candidatos_recrutamento
SET 
    status = 'disponivel',
    cadastro_completo = TRUE,
    disc_completado_em = COALESCE(disc_completado_em, updated_at, created_at)
WHERE perfil_disc IS NOT NULL 
  AND perfil_disc != ''
  AND status != 'disponivel';
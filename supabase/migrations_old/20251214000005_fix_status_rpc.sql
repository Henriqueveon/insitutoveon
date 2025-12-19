-- =====================================================
-- MIGRAÇÃO: Corrigir status na função buscar_candidatos_proximos
-- O status estava 'ativo' mas deveria ser 'disponivel'
-- =====================================================

-- Recriar função com status correto
DROP FUNCTION IF EXISTS public.buscar_candidatos_proximos(TEXT, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION public.buscar_candidatos_proximos(
    p_cidade_origem TEXT,
    p_estado_origem TEXT,
    p_raio_km INTEGER DEFAULT 30
)
RETURNS TABLE (
    candidato_id UUID,
    cidade TEXT,
    estado TEXT,
    distancia_km DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_lat_origem DECIMAL;
    v_lon_origem DECIMAL;
BEGIN
    -- Buscar coordenadas da cidade origem
    SELECT latitude, longitude INTO v_lat_origem, v_lon_origem
    FROM public.cidades_coordenadas
    WHERE cidade ILIKE p_cidade_origem AND estado = p_estado_origem;

    IF v_lat_origem IS NULL THEN
        -- Se não encontrar a cidade, retornar todos os candidatos do mesmo estado
        RETURN QUERY
        SELECT c.id, c.cidade, c.estado, NULL::DECIMAL
        FROM public.candidatos_recrutamento c
        WHERE c.estado = p_estado_origem
          AND c.status = 'disponivel'
          AND c.cadastro_completo = true;
        RETURN;
    END IF;

    -- Buscar candidatos dentro do raio
    RETURN QUERY
    SELECT
        c.id,
        c.cidade,
        c.estado,
        public.calcular_distancia_km(v_lat_origem, v_lon_origem, cc.latitude, cc.longitude) as dist
    FROM public.candidatos_recrutamento c
    LEFT JOIN public.cidades_coordenadas cc ON c.cidade ILIKE cc.cidade AND c.estado = cc.estado
    WHERE c.status = 'disponivel'
      AND c.cadastro_completo = true
      AND (
        cc.id IS NULL -- Incluir candidatos sem coordenadas cadastradas
        OR public.calcular_distancia_km(v_lat_origem, v_lon_origem, cc.latitude, cc.longitude) <= p_raio_km
    )
    ORDER BY dist NULLS LAST;
END;
$$;

GRANT EXECUTE ON FUNCTION public.buscar_candidatos_proximos(TEXT, TEXT, INTEGER) TO anon, authenticated;

-- =====================================================
-- CRIAR FUNÇÕES RPC FALTANTES
-- =====================================================

-- 1. Função para gerar código de indicação
CREATE OR REPLACE FUNCTION public.gerar_codigo_indicacao(
    p_empresa_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_codigo TEXT;
BEGIN
    -- Gerar código único de 8 caracteres
    v_codigo := UPPER(SUBSTRING(MD5(p_empresa_id::TEXT || NOW()::TEXT) FROM 1 FOR 8));

    -- Atualizar empresa com o código (se houver campo para isso)
    -- UPDATE public.empresas_recrutamento SET codigo_indicacao = v_codigo WHERE id = p_empresa_id;

    RETURN v_codigo;
END;
$$;

GRANT EXECUTE ON FUNCTION public.gerar_codigo_indicacao(UUID) TO authenticated;

-- 2. Função para processar indicação
CREATE OR REPLACE FUNCTION public.processar_indicacao(
    p_codigo_indicacao TEXT,
    p_candidato_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_empresa_id UUID;
BEGIN
    -- Buscar empresa pelo código de indicação
    -- (Assumindo que há um campo codigo_indicacao na tabela empresas)
    -- SELECT id INTO v_empresa_id FROM public.empresas_recrutamento WHERE codigo_indicacao = p_codigo_indicacao;

    -- Se não encontrou, retornar erro
    -- IF v_empresa_id IS NULL THEN
    --     RETURN jsonb_build_object('success', false, 'error', 'Código de indicação inválido');
    -- END IF;

    -- Atualizar candidato com o código usado
    UPDATE public.candidatos_recrutamento
    SET codigo_indicacao = p_codigo_indicacao
    WHERE id = p_candidato_id;

    RETURN jsonb_build_object('success', true, 'message', 'Indicação processada');
END;
$$;

GRANT EXECUTE ON FUNCTION public.processar_indicacao(TEXT, UUID) TO authenticated;

-- 3. Função para marcar todas notificações como lidas
CREATE OR REPLACE FUNCTION public.marcar_todas_notificacoes_lidas(
    p_destinatario_id UUID,
    p_tipo_destinatario TEXT DEFAULT 'empresa'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.notificacoes_recrutamento
    SET lida = true, lida_em = NOW()
    WHERE destinatario_id = p_destinatario_id
      AND tipo_destinatario = p_tipo_destinatario
      AND lida = false;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.marcar_todas_notificacoes_lidas(UUID, TEXT) TO authenticated;

-- 4. Função para deletar candidato (com SECURITY DEFINER para bypassar RLS)
CREATE OR REPLACE FUNCTION public.delete_candidato(
    p_candidato_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se candidato existe
    IF NOT EXISTS (SELECT 1 FROM public.candidatos_recrutamento WHERE id = p_candidato_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Candidato não encontrado');
    END IF;

    -- Deletar solicitações de entrevista relacionadas
    DELETE FROM public.solicitacoes_entrevista WHERE candidato_id = p_candidato_id;

    -- Deletar notificações relacionadas
    DELETE FROM public.notificacoes_recrutamento
    WHERE destinatario_id = p_candidato_id AND tipo_destinatario = 'candidato';

    -- Deletar candidato
    DELETE FROM public.candidatos_recrutamento WHERE id = p_candidato_id;

    RETURN jsonb_build_object('success', true, 'message', 'Candidato excluído com sucesso');
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_candidato(UUID) TO authenticated;

-- 5. Função para deletar empresa
CREATE OR REPLACE FUNCTION public.delete_empresa(
    p_empresa_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se empresa existe
    IF NOT EXISTS (SELECT 1 FROM public.empresas_recrutamento WHERE id = p_empresa_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Empresa não encontrada');
    END IF;

    -- Deletar vagas relacionadas
    DELETE FROM public.vagas_recrutamento WHERE empresa_id = p_empresa_id;

    -- Deletar solicitações de entrevista relacionadas
    DELETE FROM public.solicitacoes_entrevista WHERE empresa_id = p_empresa_id;

    -- Deletar notificações relacionadas
    DELETE FROM public.notificacoes_recrutamento
    WHERE destinatario_id = p_empresa_id AND tipo_destinatario = 'empresa';

    -- Deletar empresa
    DELETE FROM public.empresas_recrutamento WHERE id = p_empresa_id;

    RETURN jsonb_build_object('success', true, 'message', 'Empresa excluída com sucesso');
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_empresa(UUID) TO authenticated;

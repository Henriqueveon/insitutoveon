-- =====================================================
-- SISTEMA DE NOTIFICAÇÕES
-- Para comunicação do gestor com empresas e candidatos
-- =====================================================

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destinatario_id UUID NOT NULL,
    tipo_destinatario VARCHAR(20) NOT NULL CHECK (tipo_destinatario IN ('empresa', 'candidato')),
    titulo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo_notificacao VARCHAR(20) NOT NULL DEFAULT 'informativo'
        CHECK (tipo_notificacao IN ('informativo', 'promocao', 'atualizacao', 'urgente')),
    lida BOOLEAN DEFAULT FALSE,
    lida_em TIMESTAMPTZ,
    enviada_por UUID, -- gestor que enviou
    lote_id UUID, -- para agrupar notificações do mesmo envio
    agendada_para TIMESTAMPTZ,
    enviada BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para histórico de envios em massa
CREATE TABLE IF NOT EXISTS public.notificacoes_lotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo_notificacao VARCHAR(20) NOT NULL,
    destinatario_tipo VARCHAR(20) NOT NULL, -- 'empresa', 'candidato', 'ambos', 'especificos_empresa', 'especificos_candidato'
    total_enviadas INTEGER DEFAULT 0,
    total_lidas INTEGER DEFAULT 0,
    enviado_por UUID,
    agendada_para TIMESTAMPTZ,
    enviada BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notificacoes_destinatario ON public.notificacoes(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo_dest ON public.notificacoes(tipo_destinatario);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lote ON public.notificacoes(lote_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created ON public.notificacoes(created_at DESC);

-- RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes_lotes ENABLE ROW LEVEL SECURITY;

-- Políticas para notificacoes
DROP POLICY IF EXISTS "notificacoes_select_own" ON public.notificacoes;
CREATE POLICY "notificacoes_select_own" ON public.notificacoes
    FOR SELECT USING (
        destinatario_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.gestores WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "notificacoes_update_own" ON public.notificacoes;
CREATE POLICY "notificacoes_update_own" ON public.notificacoes
    FOR UPDATE USING (destinatario_id = auth.uid());

DROP POLICY IF EXISTS "notificacoes_insert_gestor" ON public.notificacoes;
CREATE POLICY "notificacoes_insert_gestor" ON public.notificacoes
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.gestores WHERE user_id = auth.uid())
    );

-- Políticas para lotes
DROP POLICY IF EXISTS "lotes_select_gestor" ON public.notificacoes_lotes;
CREATE POLICY "lotes_select_gestor" ON public.notificacoes_lotes
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.gestores WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "lotes_insert_gestor" ON public.notificacoes_lotes;
CREATE POLICY "lotes_insert_gestor" ON public.notificacoes_lotes
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.gestores WHERE user_id = auth.uid())
    );

GRANT SELECT, UPDATE ON public.notificacoes TO authenticated;
GRANT SELECT, INSERT ON public.notificacoes_lotes TO authenticated;

-- =====================================================
-- FUNÇÃO PARA ENVIO EM MASSA
-- =====================================================

DROP FUNCTION IF EXISTS public.enviar_notificacao_massa(TEXT, TEXT, TEXT, TEXT, UUID[]);

CREATE OR REPLACE FUNCTION public.enviar_notificacao_massa(
    p_titulo TEXT,
    p_mensagem TEXT,
    p_tipo TEXT,
    p_destinatario_tipo TEXT, -- 'empresa', 'candidato', 'ambos', 'especificos_empresa', 'especificos_candidato'
    p_destinatarios_ids UUID[] DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER := 0;
    v_count_temp INTEGER := 0;
    v_lote_id UUID;
    v_gestor_id UUID;
BEGIN
    -- Verificar se é gestor
    SELECT user_id INTO v_gestor_id FROM public.gestores WHERE user_id = auth.uid();
    IF v_gestor_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Acesso não autorizado');
    END IF;

    -- Criar lote
    INSERT INTO public.notificacoes_lotes (titulo, mensagem, tipo_notificacao, destinatario_tipo, enviado_por)
    VALUES (p_titulo, p_mensagem, p_tipo, p_destinatario_tipo, v_gestor_id)
    RETURNING id INTO v_lote_id;

    -- Se destinatários específicos de empresa
    IF p_destinatario_tipo = 'especificos_empresa' AND p_destinatarios_ids IS NOT NULL THEN
        INSERT INTO public.notificacoes (destinatario_id, tipo_destinatario, titulo, mensagem, tipo_notificacao, enviada_por, lote_id)
        SELECT unnest(p_destinatarios_ids), 'empresa', p_titulo, p_mensagem, p_tipo, v_gestor_id, v_lote_id;
        GET DIAGNOSTICS v_count = ROW_COUNT;

    -- Se destinatários específicos de candidato
    ELSIF p_destinatario_tipo = 'especificos_candidato' AND p_destinatarios_ids IS NOT NULL THEN
        INSERT INTO public.notificacoes (destinatario_id, tipo_destinatario, titulo, mensagem, tipo_notificacao, enviada_por, lote_id)
        SELECT unnest(p_destinatarios_ids), 'candidato', p_titulo, p_mensagem, p_tipo, v_gestor_id, v_lote_id;
        GET DIAGNOSTICS v_count = ROW_COUNT;

    ELSE
        -- Enviar para todas as empresas
        IF p_destinatario_tipo IN ('empresa', 'ambos') THEN
            INSERT INTO public.notificacoes (destinatario_id, tipo_destinatario, titulo, mensagem, tipo_notificacao, enviada_por, lote_id)
            SELECT id, 'empresa', p_titulo, p_mensagem, p_tipo, v_gestor_id, v_lote_id
            FROM public.empresas_recrutamento
            WHERE status = 'ativo';
            GET DIAGNOSTICS v_count_temp = ROW_COUNT;
            v_count := v_count + v_count_temp;
        END IF;

        -- Enviar para todos os candidatos
        IF p_destinatario_tipo IN ('candidato', 'ambos') THEN
            INSERT INTO public.notificacoes (destinatario_id, tipo_destinatario, titulo, mensagem, tipo_notificacao, enviada_por, lote_id)
            SELECT id, 'candidato', p_titulo, p_mensagem, p_tipo, v_gestor_id, v_lote_id
            FROM public.candidatos_recrutamento
            WHERE status IN ('disponivel', 'em_processo', 'ativo');
            GET DIAGNOSTICS v_count_temp = ROW_COUNT;
            v_count := v_count + v_count_temp;
        END IF;
    END IF;

    -- Atualizar total do lote
    UPDATE public.notificacoes_lotes SET total_enviadas = v_count WHERE id = v_lote_id;

    RETURN json_build_object('success', true, 'enviadas', v_count, 'lote_id', v_lote_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.enviar_notificacao_massa(TEXT, TEXT, TEXT, TEXT, UUID[]) TO authenticated;

-- =====================================================
-- FUNÇÃO PARA CONTAR NÃO LIDAS
-- =====================================================

DROP FUNCTION IF EXISTS public.contar_notificacoes_nao_lidas(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.contar_notificacoes_nao_lidas(
    p_destinatario_id UUID,
    p_tipo_destinatario TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.notificacoes
    WHERE destinatario_id = p_destinatario_id
    AND tipo_destinatario = p_tipo_destinatario
    AND lida = FALSE;

    RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.contar_notificacoes_nao_lidas(UUID, TEXT) TO authenticated;

-- =====================================================
-- FUNÇÃO PARA MARCAR TODAS COMO LIDAS
-- =====================================================

DROP FUNCTION IF EXISTS public.marcar_todas_notificacoes_lidas(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.marcar_todas_notificacoes_lidas(
    p_destinatario_id UUID,
    p_tipo_destinatario TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.notificacoes
    SET lida = TRUE, lida_em = NOW()
    WHERE destinatario_id = p_destinatario_id
    AND tipo_destinatario = p_tipo_destinatario
    AND lida = FALSE;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    RETURN json_build_object('success', true, 'marcadas', v_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.marcar_todas_notificacoes_lidas(UUID, TEXT) TO authenticated;

-- =====================================================
-- FUNÇÃO PARA ATUALIZAR TAXA DE LEITURA DOS LOTES
-- =====================================================

DROP FUNCTION IF EXISTS public.atualizar_taxa_leitura_lotes();

CREATE OR REPLACE FUNCTION public.atualizar_taxa_leitura_lotes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.lida = TRUE AND OLD.lida = FALSE THEN
        UPDATE public.notificacoes_lotes
        SET total_lidas = total_lidas + 1
        WHERE id = NEW.lote_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_atualizar_taxa_leitura ON public.notificacoes;
CREATE TRIGGER trigger_atualizar_taxa_leitura
    AFTER UPDATE OF lida ON public.notificacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.atualizar_taxa_leitura_lotes();

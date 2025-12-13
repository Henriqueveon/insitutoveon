-- =====================================================
-- SISTEMA DE INDICAÇÃO E LINKS COMPARTILHÁVEIS
-- Modelo viral estilo Waze
-- =====================================================

-- Tabela de códigos de indicação
CREATE TABLE IF NOT EXISTS public.codigos_indicacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_usuario VARCHAR(20) NOT NULL, -- 'empresa' ou 'candidato'
    usuario_id UUID NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    total_indicacoes INTEGER DEFAULT 0,
    creditos_ganhos DECIMAL(10,2) DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de indicações realizadas
CREATE TABLE IF NOT EXISTS public.indicacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_indicacao_id UUID REFERENCES public.codigos_indicacao(id),
    indicador_tipo VARCHAR(20) NOT NULL,
    indicador_id UUID NOT NULL,
    indicado_tipo VARCHAR(20) NOT NULL,
    indicado_id UUID NOT NULL,
    credito_indicador DECIMAL(10,2) NOT NULL,
    credito_indicado DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pendente', -- pendente, creditado
    creditado_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_codigos_indicacao_usuario ON public.codigos_indicacao(tipo_usuario, usuario_id);
CREATE INDEX IF NOT EXISTS idx_codigos_indicacao_codigo ON public.codigos_indicacao(codigo);
CREATE INDEX IF NOT EXISTS idx_indicacoes_indicador ON public.indicacoes(indicador_id);
CREATE INDEX IF NOT EXISTS idx_indicacoes_codigo ON public.indicacoes(codigo_indicacao_id);

-- RLS
ALTER TABLE public.codigos_indicacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "codigos_all" ON public.codigos_indicacao;
CREATE POLICY "codigos_all" ON public.codigos_indicacao
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "indicacoes_all" ON public.indicacoes;
CREATE POLICY "indicacoes_all" ON public.indicacoes
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

GRANT ALL ON public.codigos_indicacao TO anon, authenticated;
GRANT ALL ON public.indicacoes TO anon, authenticated;

-- =====================================================
-- FUNÇÃO: Gerar código único de indicação
-- =====================================================
DROP FUNCTION IF EXISTS public.gerar_codigo_indicacao(TEXT, UUID);

CREATE OR REPLACE FUNCTION public.gerar_codigo_indicacao(
    p_tipo_usuario TEXT,
    p_usuario_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_codigo TEXT;
    v_codigo_id UUID;
BEGIN
    -- Verificar se já tem código
    SELECT id, codigo INTO v_codigo_id, v_codigo
    FROM public.codigos_indicacao
    WHERE tipo_usuario = p_tipo_usuario AND usuario_id = p_usuario_id AND ativo = true;

    IF v_codigo IS NOT NULL THEN
        RETURN json_build_object('success', true, 'codigo', v_codigo, 'id', v_codigo_id, 'existente', true);
    END IF;

    -- Gerar código único (6 caracteres alfanuméricos)
    v_codigo := UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6));

    -- Garantir unicidade
    WHILE EXISTS (SELECT 1 FROM public.codigos_indicacao WHERE codigo = v_codigo) LOOP
        v_codigo := UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6));
    END LOOP;

    INSERT INTO public.codigos_indicacao (tipo_usuario, usuario_id, codigo)
    VALUES (p_tipo_usuario, p_usuario_id, v_codigo)
    RETURNING id INTO v_codigo_id;

    RETURN json_build_object('success', true, 'codigo', v_codigo, 'id', v_codigo_id, 'existente', false);
END;
$$;

-- =====================================================
-- FUNÇÃO: Processar indicação
-- =====================================================
DROP FUNCTION IF EXISTS public.processar_indicacao(TEXT, TEXT, UUID);

CREATE OR REPLACE FUNCTION public.processar_indicacao(
    p_codigo TEXT,
    p_indicado_tipo TEXT,
    p_indicado_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_codigo_record RECORD;
    v_credito_indicador DECIMAL(10,2);
    v_indicacao_id UUID;
BEGIN
    -- Buscar código
    SELECT * INTO v_codigo_record
    FROM public.codigos_indicacao
    WHERE codigo = UPPER(p_codigo) AND ativo = true;

    IF v_codigo_record IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Código de indicação inválido');
    END IF;

    -- Verificar se não está se auto-indicando
    IF v_codigo_record.usuario_id = p_indicado_id THEN
        RETURN json_build_object('success', false, 'error', 'Você não pode usar seu próprio código');
    END IF;

    -- Verificar se já foi indicado por este código
    IF EXISTS (SELECT 1 FROM public.indicacoes WHERE codigo_indicacao_id = v_codigo_record.id AND indicado_id = p_indicado_id) THEN
        RETURN json_build_object('success', false, 'error', 'Este usuário já foi indicado');
    END IF;

    -- Definir crédito baseado no tipo do indicador
    IF v_codigo_record.tipo_usuario = 'empresa' THEN
        v_credito_indicador := 80.00; -- Empresa ganha R$ 80
    ELSE
        v_credito_indicador := 30.00; -- Candidato ganha R$ 30
    END IF;

    -- Registrar indicação
    INSERT INTO public.indicacoes (
        codigo_indicacao_id, indicador_tipo, indicador_id,
        indicado_tipo, indicado_id, credito_indicador, status
    ) VALUES (
        v_codigo_record.id, v_codigo_record.tipo_usuario, v_codigo_record.usuario_id,
        p_indicado_tipo, p_indicado_id, v_credito_indicador, 'pendente'
    ) RETURNING id INTO v_indicacao_id;

    -- Atualizar contador
    UPDATE public.codigos_indicacao
    SET total_indicacoes = total_indicacoes + 1
    WHERE id = v_codigo_record.id;

    RETURN json_build_object(
        'success', true,
        'indicacao_id', v_indicacao_id,
        'credito_indicador', v_credito_indicador,
        'message', 'Indicação registrada! Crédito será liberado após confirmação.'
    );
END;
$$;

-- =====================================================
-- FUNÇÃO: Creditar indicação (após cadastro completo)
-- =====================================================
DROP FUNCTION IF EXISTS public.creditar_indicacao(UUID);

CREATE OR REPLACE FUNCTION public.creditar_indicacao(
    p_indicacao_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_indicacao RECORD;
    v_creditos_atuais DECIMAL(10,2);
BEGIN
    -- Buscar indicação
    SELECT * INTO v_indicacao
    FROM public.indicacoes
    WHERE id = p_indicacao_id AND status = 'pendente';

    IF v_indicacao IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Indicação não encontrada ou já creditada');
    END IF;

    -- Creditar indicador baseado no tipo
    IF v_indicacao.indicador_tipo = 'empresa' THEN
        SELECT creditos INTO v_creditos_atuais
        FROM public.empresas_recrutamento
        WHERE id = v_indicacao.indicador_id;

        UPDATE public.empresas_recrutamento
        SET creditos = COALESCE(v_creditos_atuais, 0) + v_indicacao.credito_indicador
        WHERE id = v_indicacao.indicador_id;
    ELSE
        -- Para candidatos, atualizar em outra tabela se houver sistema de créditos
        NULL;
    END IF;

    -- Atualizar indicação
    UPDATE public.indicacoes
    SET status = 'creditado', creditado_em = NOW()
    WHERE id = p_indicacao_id;

    -- Atualizar total de créditos ganhos no código
    UPDATE public.codigos_indicacao
    SET creditos_ganhos = creditos_ganhos + v_indicacao.credito_indicador
    WHERE id = v_indicacao.codigo_indicacao_id;

    RETURN json_build_object('success', true, 'creditado', v_indicacao.credito_indicador);
END;
$$;

GRANT EXECUTE ON FUNCTION public.gerar_codigo_indicacao(TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.processar_indicacao(TEXT, TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.creditar_indicacao(UUID) TO anon, authenticated;

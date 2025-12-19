-- =====================================================
-- PERFIL INSTAGRAM STYLE - Tabelas para estatísticas
-- Visualizações, salvamentos e vídeos em destaque
-- =====================================================

-- =====================================================
-- TABELA: visualizacoes_perfil
-- Registra visualizações de perfis de candidatos
-- =====================================================
CREATE TABLE IF NOT EXISTS visualizacoes_perfil (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidato_id UUID NOT NULL REFERENCES candidatos_recrutamento(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas_recrutamento(id) ON DELETE SET NULL,
    visualizador_ip VARCHAR(45),
    user_agent TEXT,
    fonte VARCHAR(50) DEFAULT 'app', -- 'app', 'link_compartilhado', 'busca', etc
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_visualizacoes_candidato ON visualizacoes_perfil(candidato_id);
CREATE INDEX IF NOT EXISTS idx_visualizacoes_empresa ON visualizacoes_perfil(empresa_id);
CREATE INDEX IF NOT EXISTS idx_visualizacoes_data ON visualizacoes_perfil(created_at);

-- =====================================================
-- TABELA: salvamentos_candidato
-- Registra quando empresas salvam candidatos
-- =====================================================
CREATE TABLE IF NOT EXISTS salvamentos_candidato (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidato_id UUID NOT NULL REFERENCES candidatos_recrutamento(id) ON DELETE CASCADE,
    empresa_id UUID NOT NULL REFERENCES empresas_recrutamento(id) ON DELETE CASCADE,
    lista VARCHAR(100) DEFAULT 'favoritos', -- 'favoritos', 'interessantes', 'para_entrevistar', etc
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidato_id, empresa_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_salvamentos_candidato ON salvamentos_candidato(candidato_id);
CREATE INDEX IF NOT EXISTS idx_salvamentos_empresa ON salvamentos_candidato(empresa_id);

-- =====================================================
-- TABELA: videos_destaque
-- Vídeos adicionais dos candidatos (além do principal)
-- =====================================================
CREATE TABLE IF NOT EXISTS videos_destaque (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidato_id UUID NOT NULL REFERENCES candidatos_recrutamento(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    duracao INTEGER, -- duração em segundos
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    visualizacoes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_videos_destaque_candidato ON videos_destaque(candidato_id);
CREATE INDEX IF NOT EXISTS idx_videos_destaque_ativo ON videos_destaque(ativo);

-- =====================================================
-- VIEW: stats_perfil_candidato
-- Estatísticas agregadas por candidato
-- =====================================================
CREATE OR REPLACE VIEW stats_perfil_candidato AS
SELECT
    c.id AS candidato_id,
    COALESCE(v.total_visualizacoes, 0) AS visualizacoes,
    COALESCE(s.total_salvamentos, 0) AS salvamentos,
    COALESCE(e.total_entrevistas, 0) AS entrevistas,
    COALESCE(v.visualizacoes_ultimos_7_dias, 0) AS visualizacoes_7d,
    COALESCE(v.visualizacoes_ultimos_30_dias, 0) AS visualizacoes_30d
FROM candidatos_recrutamento c
LEFT JOIN (
    SELECT
        candidato_id,
        COUNT(*) AS total_visualizacoes,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS visualizacoes_ultimos_7_dias,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS visualizacoes_ultimos_30_dias
    FROM visualizacoes_perfil
    GROUP BY candidato_id
) v ON c.id = v.candidato_id
LEFT JOIN (
    SELECT candidato_id, COUNT(*) AS total_salvamentos
    FROM salvamentos_candidato
    GROUP BY candidato_id
) s ON c.id = s.candidato_id
LEFT JOIN (
    SELECT candidato_id, COUNT(*) AS total_entrevistas
    FROM entrevistas_recrutamento
    GROUP BY candidato_id
) e ON c.id = e.candidato_id;

-- =====================================================
-- FUNCTION: registrar_visualizacao
-- Registra uma visualização de perfil
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_visualizacao(
    p_candidato_id UUID,
    p_empresa_id UUID DEFAULT NULL,
    p_ip VARCHAR DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_fonte VARCHAR DEFAULT 'app'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO visualizacoes_perfil (candidato_id, empresa_id, visualizador_ip, user_agent, fonte)
    VALUES (p_candidato_id, p_empresa_id, p_ip, p_user_agent, p_fonte)
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

-- =====================================================
-- FUNCTION: toggle_salvar_candidato
-- Salva ou remove um candidato dos favoritos
-- =====================================================
CREATE OR REPLACE FUNCTION toggle_salvar_candidato(
    p_candidato_id UUID,
    p_empresa_id UUID,
    p_lista VARCHAR DEFAULT 'favoritos',
    p_notas TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exists BOOLEAN;
    v_id UUID;
BEGIN
    -- Verificar se já existe
    SELECT EXISTS(
        SELECT 1 FROM salvamentos_candidato
        WHERE candidato_id = p_candidato_id AND empresa_id = p_empresa_id
    ) INTO v_exists;

    IF v_exists THEN
        -- Remover
        DELETE FROM salvamentos_candidato
        WHERE candidato_id = p_candidato_id AND empresa_id = p_empresa_id;

        RETURN jsonb_build_object('acao', 'removido', 'salvo', false);
    ELSE
        -- Adicionar
        INSERT INTO salvamentos_candidato (candidato_id, empresa_id, lista, notas)
        VALUES (p_candidato_id, p_empresa_id, p_lista, p_notas)
        RETURNING id INTO v_id;

        RETURN jsonb_build_object('acao', 'salvo', 'salvo', true, 'id', v_id);
    END IF;
END;
$$;

-- =====================================================
-- FUNCTION: get_stats_candidato
-- Retorna estatísticas do perfil de um candidato
-- =====================================================
CREATE OR REPLACE FUNCTION get_stats_candidato(p_candidato_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'visualizacoes', COALESCE(visualizacoes, 0),
        'salvamentos', COALESCE(salvamentos, 0),
        'entrevistas', COALESCE(entrevistas, 0),
        'visualizacoes_7d', COALESCE(visualizacoes_7d, 0),
        'visualizacoes_30d', COALESCE(visualizacoes_30d, 0)
    )
    INTO v_result
    FROM stats_perfil_candidato
    WHERE candidato_id = p_candidato_id;

    RETURN COALESCE(v_result, jsonb_build_object(
        'visualizacoes', 0,
        'salvamentos', 0,
        'entrevistas', 0,
        'visualizacoes_7d', 0,
        'visualizacoes_30d', 0
    ));
END;
$$;

-- =====================================================
-- FUNCTION: verificar_candidato_salvo
-- Verifica se um candidato está salvo por uma empresa
-- =====================================================
CREATE OR REPLACE FUNCTION verificar_candidato_salvo(
    p_candidato_id UUID,
    p_empresa_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM salvamentos_candidato
        WHERE candidato_id = p_candidato_id AND empresa_id = p_empresa_id
    );
END;
$$;

-- =====================================================
-- TRIGGER: atualizar_visualizacoes_video
-- Incrementa contador de visualizações de vídeo
-- =====================================================
CREATE OR REPLACE FUNCTION incrementar_visualizacao_video()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE videos_destaque
    SET visualizacoes = visualizacoes + 1,
        updated_at = NOW()
    WHERE id = NEW.video_id;
    RETURN NEW;
END;
$$;

-- Tabela auxiliar para registrar visualizações de vídeo
CREATE TABLE IF NOT EXISTS visualizacoes_video (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id UUID NOT NULL REFERENCES videos_destaque(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas_recrutamento(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visualizacoes_video ON visualizacoes_video(video_id);

-- Criar trigger
DROP TRIGGER IF EXISTS trg_incrementar_viz_video ON visualizacoes_video;
CREATE TRIGGER trg_incrementar_viz_video
    AFTER INSERT ON visualizacoes_video
    FOR EACH ROW
    EXECUTE FUNCTION incrementar_visualizacao_video();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE visualizacoes_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE salvamentos_candidato ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos_destaque ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizacoes_video ENABLE ROW LEVEL SECURITY;

-- Políticas para visualizacoes_perfil
CREATE POLICY "Empresas podem inserir visualizações" ON visualizacoes_perfil
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Candidatos podem ver suas visualizações" ON visualizacoes_perfil
    FOR SELECT TO authenticated USING (
        candidato_id IN (SELECT id FROM candidatos_recrutamento WHERE auth_user_id = auth.uid())
    );

-- Políticas para salvamentos_candidato
CREATE POLICY "Empresas podem gerenciar seus salvamentos" ON salvamentos_candidato
    FOR ALL TO authenticated USING (
        empresa_id IN (SELECT id FROM empresas_recrutamento WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Candidatos podem ver quem os salvou" ON salvamentos_candidato
    FOR SELECT TO authenticated USING (
        candidato_id IN (SELECT id FROM candidatos_recrutamento WHERE auth_user_id = auth.uid())
    );

-- Políticas para videos_destaque
CREATE POLICY "Candidatos podem gerenciar seus vídeos" ON videos_destaque
    FOR ALL TO authenticated USING (
        candidato_id IN (SELECT id FROM candidatos_recrutamento WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Todos podem ver vídeos ativos" ON videos_destaque
    FOR SELECT TO authenticated USING (ativo = true);

-- Políticas para visualizacoes_video
CREATE POLICY "Qualquer um pode registrar visualização de vídeo" ON visualizacoes_video
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Candidatos podem ver visualizações de seus vídeos" ON visualizacoes_video
    FOR SELECT TO authenticated USING (
        video_id IN (
            SELECT id FROM videos_destaque
            WHERE candidato_id IN (SELECT id FROM candidatos_recrutamento WHERE auth_user_id = auth.uid())
        )
    );

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION registrar_visualizacao TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_salvar_candidato TO authenticated;
GRANT EXECUTE ON FUNCTION get_stats_candidato TO authenticated;
GRANT EXECUTE ON FUNCTION verificar_candidato_salvo TO authenticated;

-- =============================================
-- MIGRAÇÃO CONSOLIDADA: CAMPOS E FUNÇÕES PARA RECRUTAMENTO
-- Adaptada para o schema existente
-- =============================================

-- ===========================================
-- 1. NOVAS TABELAS (se não existirem)
-- ===========================================

-- Tabela de vagas (diferente de vagas_recrutamento existente)
CREATE TABLE IF NOT EXISTS vagas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas_recrutamento(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    requisitos TEXT,
    beneficios TEXT,
    cargo VARCHAR(150),
    nivel VARCHAR(50),
    regime VARCHAR(50),
    modelo VARCHAR(50),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    salario_min DECIMAL(10,2),
    salario_max DECIMAL(10,2),
    salario_visivel BOOLEAN DEFAULT false,
    perfil_disc_ideal VARCHAR(10),
    status VARCHAR(30) DEFAULT 'rascunho',
    destaque BOOLEAN DEFAULT false,
    urgente BOOLEAN DEFAULT false,
    visualizacoes INTEGER DEFAULT 0,
    total_candidaturas INTEGER DEFAULT 0,
    data_publicacao TIMESTAMP WITH TIME ZONE,
    data_encerramento TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de candidaturas
CREATE TABLE IF NOT EXISTS candidaturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vaga_id UUID REFERENCES vagas(id) ON DELETE CASCADE,
    candidato_id UUID REFERENCES candidatos_recrutamento(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'nova',
    nota_recrutador INTEGER,
    comentario_recrutador TEXT,
    fit_score DECIMAL(5,2),
    carta_apresentacao TEXT,
    historico_status JSONB DEFAULT '[]'::jsonb,
    data_candidatura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_visualizacao TIMESTAMP WITH TIME ZONE,
    data_entrevista TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vaga_id, candidato_id)
);

-- Tabela de visualizações de perfil
CREATE TABLE IF NOT EXISTS visualizacoes_perfil (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidato_id UUID REFERENCES candidatos_recrutamento(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas_recrutamento(id) ON DELETE SET NULL,
    origem VARCHAR(50),
    vaga_id UUID REFERENCES vagas(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    visualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 2. CAMPOS NOVOS EM CANDIDATOS
-- ===========================================

-- Campo sexo (tipo ENUM)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sexo_tipo') THEN
        CREATE TYPE sexo_tipo AS ENUM ('masculino', 'feminino', 'outro', 'prefiro_nao_informar');
    END IF;
END $$;

ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS sexo sexo_tipo;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS slug_publico VARCHAR(100) UNIQUE;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS curriculo_publico BOOLEAN DEFAULT true;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS visualizacoes_perfil INTEGER DEFAULT 0;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS indicado_por_empresa_id UUID;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS indicado_por_candidato_id UUID;

-- ===========================================
-- 3. CAMPOS NOVOS EM EMPRESAS
-- ===========================================

ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;
ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS responsavel_nome VARCHAR(200);
ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS responsavel_cargo VARCHAR(100);
ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS socio_funcao VARCHAR(100);
ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT false;

-- ===========================================
-- 4. ÍNDICES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_candidatos_sexo ON candidatos_recrutamento(sexo);
CREATE INDEX IF NOT EXISTS idx_candidatos_auth_user ON candidatos_recrutamento(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_slug ON candidatos_recrutamento(slug_publico);
CREATE INDEX IF NOT EXISTS idx_empresas_auth_user ON empresas_recrutamento(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_vagas_empresa ON vagas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_vagas_status ON vagas(status);
CREATE INDEX IF NOT EXISTS idx_candidaturas_vaga ON candidaturas(vaga_id);
CREATE INDEX IF NOT EXISTS idx_candidaturas_candidato ON candidaturas(candidato_id);
CREATE INDEX IF NOT EXISTS idx_visualizacoes_candidato ON visualizacoes_perfil(candidato_id);

-- ===========================================
-- 5. FUNÇÕES RPC DE AUTENTICAÇÃO
-- ===========================================

-- Função para obter empresa do usuário logado
CREATE OR REPLACE FUNCTION get_empresa_logada()
RETURNS JSON AS $$
DECLARE
    v_empresa JSON;
BEGIN
    SELECT json_build_object(
        'id', id,
        'razao_social', razao_social,
        'nome_fantasia', nome_fantasia,
        'cnpj', cnpj,
        'socio_email', socio_email,
        'cidade', cidade,
        'estado', estado,
        'cadastro_completo', CASE WHEN cnpj IS NOT NULL AND cidade IS NOT NULL THEN true ELSE false END,
        'creditos', creditos,
        'status', status
    )
    INTO v_empresa
    FROM empresas_recrutamento
    WHERE auth_user_id = auth.uid();
    
    RETURN COALESCE(v_empresa, json_build_object('found', false));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter candidato do usuário logado
CREATE OR REPLACE FUNCTION get_candidato_logado()
RETURNS JSON AS $$
DECLARE
    v_candidato JSON;
BEGIN
    SELECT json_build_object(
        'id', id,
        'nome_completo', nome_completo,
        'email', email,
        'telefone', telefone,
        'cidade', cidade,
        'estado', estado,
        'cadastro_completo', cadastro_completo,
        'slug_publico', slug_publico,
        'perfil_disc', perfil_disc,
        'curriculo_publico', curriculo_publico,
        'visualizacoes_perfil', visualizacoes_perfil
    )
    INTO v_candidato
    FROM candidatos_recrutamento
    WHERE auth_user_id = auth.uid();
    
    RETURN COALESCE(v_candidato, json_build_object('found', false));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar tipo de usuário
CREATE OR REPLACE FUNCTION get_tipo_usuario()
RETURNS JSON AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM empresas_recrutamento WHERE auth_user_id = auth.uid();
    IF v_id IS NOT NULL THEN
        RETURN json_build_object('tipo', 'empresa', 'id', v_id);
    END IF;
    
    SELECT id INTO v_id FROM candidatos_recrutamento WHERE auth_user_id = auth.uid();
    IF v_id IS NOT NULL THEN
        RETURN json_build_object('tipo', 'candidato', 'id', v_id);
    END IF;
    
    RETURN json_build_object('tipo', null, 'id', null);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para vincular empresa ao Auth
CREATE OR REPLACE FUNCTION vincular_auth_empresa(
    p_empresa_id UUID,
    p_auth_user_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_auth_id UUID;
BEGIN
    v_auth_id := COALESCE(p_auth_user_id, auth.uid());
    
    IF v_auth_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Usuário não autenticado');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM empresas_recrutamento WHERE id = p_empresa_id) THEN
        RETURN json_build_object('success', false, 'error', 'Empresa não encontrada');
    END IF;
    
    IF EXISTS (SELECT 1 FROM empresas_recrutamento WHERE auth_user_id = v_auth_id AND id != p_empresa_id) THEN
        RETURN json_build_object('success', false, 'error', 'Usuário já vinculado a outra empresa');
    END IF;
    
    UPDATE empresas_recrutamento 
    SET auth_user_id = v_auth_id, updated_at = NOW()
    WHERE id = p_empresa_id;
    
    RETURN json_build_object('success', true, 'message', 'Empresa vinculada com sucesso');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para vincular candidato ao Auth
CREATE OR REPLACE FUNCTION vincular_auth_candidato(
    p_candidato_id UUID,
    p_auth_user_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_auth_id UUID;
BEGIN
    v_auth_id := COALESCE(p_auth_user_id, auth.uid());
    
    IF v_auth_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Usuário não autenticado');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM candidatos_recrutamento WHERE id = p_candidato_id) THEN
        RETURN json_build_object('success', false, 'error', 'Candidato não encontrado');
    END IF;
    
    IF EXISTS (SELECT 1 FROM candidatos_recrutamento WHERE auth_user_id = v_auth_id AND id != p_candidato_id) THEN
        RETURN json_build_object('success', false, 'error', 'Usuário já vinculado a outro candidato');
    END IF;
    
    UPDATE candidatos_recrutamento 
    SET auth_user_id = v_auth_id, updated_at = NOW()
    WHERE id = p_candidato_id;
    
    RETURN json_build_object('success', true, 'message', 'Candidato vinculado com sucesso');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para estatísticas por sexo
CREATE OR REPLACE FUNCTION obter_estatisticas_sexo(
    p_empresa_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_resultado JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'masculino', COUNT(*) FILTER (WHERE sexo = 'masculino'),
        'feminino', COUNT(*) FILTER (WHERE sexo = 'feminino'),
        'outro', COUNT(*) FILTER (WHERE sexo = 'outro'),
        'prefiro_nao_informar', COUNT(*) FILTER (WHERE sexo = 'prefiro_nao_informar'),
        'nao_informado', COUNT(*) FILTER (WHERE sexo IS NULL)
    )
    INTO v_resultado
    FROM candidatos_recrutamento
    WHERE status IN ('disponivel', 'em_processo');

    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para gerar slug único para candidato
CREATE OR REPLACE FUNCTION gerar_slug_candidato()
RETURNS TRIGGER AS $$
DECLARE
    base_slug VARCHAR(100);
    final_slug VARCHAR(100);
BEGIN
    IF NEW.slug_publico IS NOT NULL THEN
        RETURN NEW;
    END IF;
    
    base_slug := LOWER(REGEXP_REPLACE(
        UNACCENT(NEW.nome_completo),
        '[^a-z0-9]+', '-', 'g'
    ));
    base_slug := TRIM(BOTH '-' FROM base_slug);
    final_slug := base_slug || '-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6);
    
    WHILE EXISTS (SELECT 1 FROM candidatos_recrutamento WHERE slug_publico = final_slug AND id != NEW.id) LOOP
        final_slug := base_slug || '-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6);
    END LOOP;
    
    NEW.slug_publico := final_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar slug
DROP TRIGGER IF EXISTS trigger_gerar_slug_candidato ON candidatos_recrutamento;
CREATE TRIGGER trigger_gerar_slug_candidato
    BEFORE INSERT ON candidatos_recrutamento
    FOR EACH ROW
    WHEN (NEW.slug_publico IS NULL)
    EXECUTE FUNCTION gerar_slug_candidato();

-- ===========================================
-- 6. RLS PARA NOVAS TABELAS
-- ===========================================

ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizacoes_perfil ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vagas_select" ON vagas;
CREATE POLICY "vagas_select" ON vagas FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "vagas_all" ON vagas;
CREATE POLICY "vagas_all" ON vagas FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "candidaturas_all" ON candidaturas;
CREATE POLICY "candidaturas_all" ON candidaturas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "visualizacoes_all" ON visualizacoes_perfil;
CREATE POLICY "visualizacoes_all" ON visualizacoes_perfil FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ===========================================
-- 7. GRANTS
-- ===========================================

GRANT ALL ON vagas TO anon, authenticated;
GRANT ALL ON candidaturas TO anon, authenticated;
GRANT ALL ON visualizacoes_perfil TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_empresa_logada TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_candidato_logado TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_tipo_usuario TO anon, authenticated;
GRANT EXECUTE ON FUNCTION vincular_auth_empresa TO anon, authenticated;
GRANT EXECUTE ON FUNCTION vincular_auth_candidato TO anon, authenticated;
GRANT EXECUTE ON FUNCTION obter_estatisticas_sexo TO anon, authenticated;
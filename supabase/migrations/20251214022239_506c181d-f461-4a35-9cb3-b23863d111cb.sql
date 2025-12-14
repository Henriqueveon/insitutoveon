-- =============================================
-- MIGRAÇÃO CONSOLIDADA: AUTH USER ID + STATUS + RPCs
-- Data: 2025-12-14
-- =============================================

-- ===========================================
-- 1. CAMPO STATUS (se não existir)
-- ===========================================

-- Status para empresas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'empresas_recrutamento' AND column_name = 'status'
    ) THEN
        ALTER TABLE empresas_recrutamento ADD COLUMN status VARCHAR(30) DEFAULT 'pendente';
    END IF;
END $$;

-- Status para candidatos (já existe, mas garantir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'candidatos_recrutamento' AND column_name = 'status'
    ) THEN
        ALTER TABLE candidatos_recrutamento ADD COLUMN status VARCHAR(30) DEFAULT 'pendente';
    END IF;
END $$;

-- Índices para status
CREATE INDEX IF NOT EXISTS idx_empresas_status ON empresas_recrutamento(status);
CREATE INDEX IF NOT EXISTS idx_candidatos_status ON candidatos_recrutamento(status);

-- Atualizar registros existentes para status correto
UPDATE empresas_recrutamento SET status = 'ativo' WHERE status IS NULL;
UPDATE candidatos_recrutamento SET status = 'disponivel' WHERE status IS NULL;

-- ===========================================
-- 2. CORRIGIR FUNÇÃO cadastrar_empresa_com_auth
-- ===========================================

CREATE OR REPLACE FUNCTION cadastrar_empresa_com_auth(
    p_razao_social VARCHAR(255),
    p_email VARCHAR(255),
    p_telefone VARCHAR(20) DEFAULT NULL,
    p_responsavel_nome VARCHAR(200) DEFAULT NULL,
    p_socio_funcao VARCHAR(100) DEFAULT NULL,
    p_auth_user_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_empresa_id UUID;
    v_auth_id UUID;
BEGIN
    v_auth_id := COALESCE(p_auth_user_id, auth.uid());
    
    IF EXISTS (SELECT 1 FROM empresas_recrutamento WHERE socio_email = p_email) THEN
        RETURN json_build_object('success', false, 'error', 'Email já cadastrado no sistema');
    END IF;
    
    IF v_auth_id IS NOT NULL AND EXISTS (SELECT 1 FROM empresas_recrutamento WHERE auth_user_id = v_auth_id) THEN
        RETURN json_build_object('success', false, 'error', 'Usuário já possui uma empresa cadastrada');
    END IF;
    
    INSERT INTO empresas_recrutamento (
        razao_social, socio_email, socio_telefone, responsavel_nome, socio_funcao,
        auth_user_id, status, socio_nome, socio_cpf, senha_hash
    ) VALUES (
        p_razao_social, p_email, p_telefone, p_responsavel_nome, p_socio_funcao,
        v_auth_id, 'ativo', p_responsavel_nome, '00000000000', 'AUTH_SUPABASE'
    )
    RETURNING id INTO v_empresa_id;
    
    RETURN json_build_object('success', true, 'empresa_id', v_empresa_id, 'message', 'Empresa cadastrada com sucesso');
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 3. CORRIGIR FUNÇÃO cadastrar_candidato_com_auth
-- ===========================================

CREATE OR REPLACE FUNCTION cadastrar_candidato_com_auth(
    p_nome VARCHAR(255),
    p_email VARCHAR(255),
    p_telefone VARCHAR(20) DEFAULT NULL,
    p_codigo_indicacao VARCHAR(20) DEFAULT NULL,
    p_sexo VARCHAR(30) DEFAULT NULL,
    p_auth_user_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_candidato_id UUID;
    v_empresa_indicadora UUID;
    v_auth_id UUID;
BEGIN
    v_auth_id := COALESCE(p_auth_user_id, auth.uid());
    
    IF EXISTS (SELECT 1 FROM candidatos_recrutamento WHERE email = p_email) THEN
        RETURN json_build_object('success', false, 'error', 'Email já cadastrado no sistema');
    END IF;
    
    IF v_auth_id IS NOT NULL AND EXISTS (SELECT 1 FROM candidatos_recrutamento WHERE auth_user_id = v_auth_id) THEN
        RETURN json_build_object('success', false, 'error', 'Usuário já possui um cadastro de candidato');
    END IF;
    
    IF p_codigo_indicacao IS NOT NULL AND p_codigo_indicacao != '' THEN
        SELECT id INTO v_empresa_indicadora
        FROM empresas_recrutamento WHERE link_recrutamento = p_codigo_indicacao AND status = 'ativo';
    END IF;
    
    INSERT INTO candidatos_recrutamento (
        nome_completo, email, telefone, indicado_por_empresa_id, auth_user_id, 
        status, cpf, data_nascimento, cidade, estado, sexo
    ) VALUES (
        p_nome, p_email, p_telefone, v_empresa_indicadora, v_auth_id,
        'disponivel', '00000000000', '2000-01-01', 'Não informada', 'PR',
        CASE WHEN p_sexo IS NOT NULL THEN p_sexo::sexo_tipo ELSE NULL END
    )
    RETURNING id INTO v_candidato_id;
    
    RETURN json_build_object('success', true, 'candidato_id', v_candidato_id, 'message', 'Candidato cadastrado com sucesso');
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 4. FUNÇÕES PARA ATUALIZAR STATUS
-- ===========================================

CREATE OR REPLACE FUNCTION atualizar_status_empresa(p_empresa_id UUID, p_status VARCHAR(30))
RETURNS JSON AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM empresas_recrutamento WHERE id = p_empresa_id) THEN
        RETURN json_build_object('success', false, 'error', 'Empresa não encontrada');
    END IF;
    
    UPDATE empresas_recrutamento SET status = p_status, updated_at = NOW() WHERE id = p_empresa_id;
    RETURN json_build_object('success', true, 'message', 'Status atualizado');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION atualizar_status_candidato(p_candidato_id UUID, p_status VARCHAR(30))
RETURNS JSON AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM candidatos_recrutamento WHERE id = p_candidato_id) THEN
        RETURN json_build_object('success', false, 'error', 'Candidato não encontrado');
    END IF;
    
    UPDATE candidatos_recrutamento SET status = p_status, updated_at = NOW() WHERE id = p_candidato_id;
    RETURN json_build_object('success', true, 'message', 'Status atualizado');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 5. FUNÇÕES PARA COMPLETAR CADASTRO
-- ===========================================

CREATE OR REPLACE FUNCTION completar_cadastro_empresa(
    p_empresa_id UUID,
    p_cnpj VARCHAR(18) DEFAULT NULL,
    p_nome_fantasia VARCHAR(255) DEFAULT NULL,
    p_cidade VARCHAR(100) DEFAULT NULL,
    p_estado VARCHAR(2) DEFAULT NULL,
    p_logradouro VARCHAR(300) DEFAULT NULL,
    p_cep VARCHAR(10) DEFAULT NULL,
    p_segmento VARCHAR(100) DEFAULT NULL,
    p_porte VARCHAR(50) DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM empresas_recrutamento WHERE id = p_empresa_id AND (auth_user_id = auth.uid() OR auth.uid() IS NULL)) THEN
        RETURN json_build_object('success', false, 'error', 'Empresa não encontrada ou sem permissão');
    END IF;
    
    UPDATE empresas_recrutamento SET
        cnpj = COALESCE(p_cnpj, cnpj),
        nome_fantasia = COALESCE(p_nome_fantasia, nome_fantasia),
        cidade = COALESCE(p_cidade, cidade),
        estado = COALESCE(p_estado, estado),
        logradouro = COALESCE(p_logradouro, logradouro),
        cep = COALESCE(p_cep, cep),
        segmento = COALESCE(p_segmento, segmento),
        porte = COALESCE(p_porte, porte),
        updated_at = NOW()
    WHERE id = p_empresa_id;
    
    RETURN json_build_object('success', true, 'message', 'Dados atualizados');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION completar_cadastro_candidato(
    p_candidato_id UUID,
    p_cpf VARCHAR(14) DEFAULT NULL,
    p_data_nascimento DATE DEFAULT NULL,
    p_cidade VARCHAR(100) DEFAULT NULL,
    p_estado VARCHAR(2) DEFAULT NULL,
    p_ultimo_cargo VARCHAR(150) DEFAULT NULL,
    p_ultima_empresa VARCHAR(200) DEFAULT NULL,
    p_pretensao_salarial VARCHAR(50) DEFAULT NULL,
    p_objetivo_profissional TEXT DEFAULT NULL,
    p_instagram VARCHAR(255) DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM candidatos_recrutamento WHERE id = p_candidato_id AND (auth_user_id = auth.uid() OR auth.uid() IS NULL)) THEN
        RETURN json_build_object('success', false, 'error', 'Candidato não encontrado ou sem permissão');
    END IF;
    
    UPDATE candidatos_recrutamento SET
        cpf = COALESCE(p_cpf, cpf),
        data_nascimento = COALESCE(p_data_nascimento, data_nascimento),
        cidade = COALESCE(p_cidade, cidade),
        estado = COALESCE(p_estado, estado),
        ultimo_cargo = COALESCE(p_ultimo_cargo, ultimo_cargo),
        ultima_empresa = COALESCE(p_ultima_empresa, ultima_empresa),
        pretensao_salarial = COALESCE(p_pretensao_salarial, pretensao_salarial),
        objetivo_profissional = COALESCE(p_objetivo_profissional, objetivo_profissional),
        instagram = COALESCE(p_instagram, instagram),
        cadastro_completo = true,
        updated_at = NOW()
    WHERE id = p_candidato_id;
    
    RETURN json_build_object('success', true, 'cadastro_completo', true, 'message', 'Cadastro atualizado');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 6. FUNÇÃO PARA BUSCAR CANDIDATO POR SLUG
-- ===========================================

CREATE OR REPLACE FUNCTION get_candidato_por_slug(p_slug VARCHAR(100))
RETURNS JSON AS $$
DECLARE
    v_candidato JSON;
BEGIN
    SELECT json_build_object(
        'id', id, 'nome_completo', nome_completo, 'cidade', cidade, 'estado', estado,
        'ultimo_cargo', ultimo_cargo, 'ultima_empresa', ultima_empresa,
        'objetivo_profissional', objetivo_profissional, 'escolaridade', escolaridade,
        'curso', curso, 'perfil_disc', perfil_disc, 'instagram', instagram, 'foto_url', foto_url,
        'visualizacoes_perfil', visualizacoes_perfil
    )
    INTO v_candidato
    FROM candidatos_recrutamento
    WHERE slug_publico = p_slug AND curriculo_publico = true AND status IN ('disponivel', 'em_processo');
    
    IF v_candidato IS NOT NULL THEN
        UPDATE candidatos_recrutamento SET visualizacoes_perfil = visualizacoes_perfil + 1 WHERE slug_publico = p_slug;
    END IF;
    
    RETURN COALESCE(v_candidato, json_build_object('found', false));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 7. FUNÇÃO PARA LISTAR CANDIDATOS PÚBLICOS
-- ===========================================

CREATE OR REPLACE FUNCTION listar_candidatos_publicos(
    p_limite INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_cidade VARCHAR(100) DEFAULT NULL,
    p_estado VARCHAR(2) DEFAULT NULL,
    p_perfil_disc VARCHAR(10) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_candidatos JSON;
    v_total INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM candidatos_recrutamento
    WHERE curriculo_publico = true AND status IN ('disponivel', 'em_processo')
      AND (p_cidade IS NULL OR cidade ILIKE '%' || p_cidade || '%')
      AND (p_estado IS NULL OR estado = p_estado)
      AND (p_perfil_disc IS NULL OR perfil_disc = p_perfil_disc);
    
    SELECT json_agg(c) INTO v_candidatos
    FROM (
        SELECT id, nome_completo, cidade, estado, ultimo_cargo, perfil_disc, slug_publico, foto_url, created_at
        FROM candidatos_recrutamento
        WHERE curriculo_publico = true AND status IN ('disponivel', 'em_processo')
          AND (p_cidade IS NULL OR cidade ILIKE '%' || p_cidade || '%')
          AND (p_estado IS NULL OR estado = p_estado)
          AND (p_perfil_disc IS NULL OR perfil_disc = p_perfil_disc)
        ORDER BY created_at DESC LIMIT p_limite OFFSET p_offset
    ) c;
    
    RETURN json_build_object('candidatos', COALESCE(v_candidatos, '[]'::json), 'total', v_total, 'limite', p_limite, 'offset', p_offset);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants
GRANT EXECUTE ON FUNCTION cadastrar_empresa_com_auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cadastrar_candidato_com_auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION atualizar_status_empresa TO authenticated;
GRANT EXECUTE ON FUNCTION atualizar_status_candidato TO authenticated;
GRANT EXECUTE ON FUNCTION completar_cadastro_empresa TO anon, authenticated;
GRANT EXECUTE ON FUNCTION completar_cadastro_candidato TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_candidato_por_slug TO anon, authenticated;
GRANT EXECUTE ON FUNCTION listar_candidatos_publicos TO anon, authenticated;
-- =====================================================
-- MIGRAÇÃO: Adicionar auth_user_id para vincular Auth com tabelas
-- Permite que empresas e candidatos sejam identificados pelo Supabase Auth
-- =====================================================

-- 1. Adicionar coluna auth_user_id na tabela empresas_recrutamento
ALTER TABLE public.empresas_recrutamento
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- 2. Adicionar coluna auth_user_id na tabela candidatos_recrutamento
ALTER TABLE public.candidatos_recrutamento
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- 3. Criar índices para busca rápida por auth_user_id
CREATE INDEX IF NOT EXISTS idx_empresas_auth_user_id
ON public.empresas_recrutamento(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_candidatos_auth_user_id
ON public.candidatos_recrutamento(auth_user_id);

-- 4. Comentários nas colunas
COMMENT ON COLUMN public.empresas_recrutamento.auth_user_id IS
'ID do usuário no Supabase Auth (auth.users.id)';

COMMENT ON COLUMN public.candidatos_recrutamento.auth_user_id IS
'ID do usuário no Supabase Auth (auth.users.id)';

-- 5. Atualizar a função RPC cadastrar_empresa para incluir auth_user_id
CREATE OR REPLACE FUNCTION public.cadastrar_empresa(
    p_cnpj VARCHAR,
    p_razao_social VARCHAR,
    p_nome_fantasia VARCHAR DEFAULT NULL,
    p_situacao_cadastral VARCHAR DEFAULT NULL,
    p_data_abertura DATE DEFAULT NULL,
    p_natureza_juridica VARCHAR DEFAULT NULL,
    p_porte VARCHAR DEFAULT NULL,
    p_capital_social DECIMAL DEFAULT NULL,
    p_logradouro VARCHAR DEFAULT NULL,
    p_numero VARCHAR DEFAULT NULL,
    p_complemento VARCHAR DEFAULT NULL,
    p_bairro VARCHAR DEFAULT NULL,
    p_cidade VARCHAR DEFAULT NULL,
    p_estado VARCHAR DEFAULT NULL,
    p_cep VARCHAR DEFAULT NULL,
    p_telefone_empresa VARCHAR DEFAULT NULL,
    p_email_empresa VARCHAR DEFAULT NULL,
    p_socio_nome VARCHAR,
    p_socio_cpf VARCHAR,
    p_socio_email VARCHAR,
    p_socio_telefone VARCHAR,
    p_socio_foto_url TEXT DEFAULT NULL,
    p_aceite_termos BOOLEAN DEFAULT FALSE,
    p_aceite_lgpd BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_empresa_id UUID;
    v_auth_user_id UUID;
BEGIN
    -- Obter o auth_user_id do usuário autenticado (se existir)
    v_auth_user_id := auth.uid();

    -- Inserir a empresa
    INSERT INTO public.empresas_recrutamento (
        cnpj, razao_social, nome_fantasia, situacao_cadastral,
        data_abertura, natureza_juridica, porte, capital_social,
        logradouro, numero, complemento, bairro, cidade, estado, cep,
        telefone_empresa, email_empresa,
        socio_nome, socio_cpf, socio_email, socio_telefone, socio_foto_url,
        senha_hash, aceite_termos, aceite_termos_data, aceite_lgpd, aceite_lgpd_data,
        auth_user_id
    ) VALUES (
        p_cnpj, p_razao_social, p_nome_fantasia, p_situacao_cadastral,
        p_data_abertura, p_natureza_juridica, p_porte, p_capital_social,
        p_logradouro, p_numero, p_complemento, p_bairro, p_cidade, p_estado, p_cep,
        p_telefone_empresa, p_email_empresa,
        p_socio_nome, p_socio_cpf, p_socio_email, p_socio_telefone, p_socio_foto_url,
        'AUTH_SUPABASE', -- Indica que usa Auth
        p_aceite_termos, CASE WHEN p_aceite_termos THEN NOW() ELSE NULL END,
        p_aceite_lgpd, CASE WHEN p_aceite_lgpd THEN NOW() ELSE NULL END,
        v_auth_user_id
    )
    RETURNING id INTO v_empresa_id;

    RETURN jsonb_build_object('success', true, 'id', v_empresa_id);
EXCEPTION
    WHEN unique_violation THEN
        RETURN jsonb_build_object('success', false, 'error', 'CNPJ ou email já cadastrado');
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 6. Criar função RPC para cadastrar candidato com auth_user_id
CREATE OR REPLACE FUNCTION public.cadastrar_candidato(
    p_nome_completo VARCHAR,
    p_data_nascimento DATE,
    p_cpf VARCHAR,
    p_telefone VARCHAR,
    p_email VARCHAR,
    p_estado VARCHAR,
    p_cidade VARCHAR,
    p_bairro VARCHAR DEFAULT NULL,
    p_codigo_indicacao VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_candidato_id UUID;
    v_auth_user_id UUID;
BEGIN
    -- Obter o auth_user_id do usuário autenticado (se existir)
    v_auth_user_id := auth.uid();

    -- Inserir o candidato
    INSERT INTO public.candidatos_recrutamento (
        nome_completo, data_nascimento, cpf, telefone, email,
        estado, cidade, bairro, codigo_indicacao, auth_user_id
    ) VALUES (
        p_nome_completo, p_data_nascimento, p_cpf, p_telefone, p_email,
        p_estado, p_cidade, p_bairro, p_codigo_indicacao, v_auth_user_id
    )
    RETURNING id INTO v_candidato_id;

    RETURN jsonb_build_object('success', true, 'id', v_candidato_id);
EXCEPTION
    WHEN unique_violation THEN
        RETURN jsonb_build_object('success', false, 'error', 'CPF ou email já cadastrado');
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 7. Atualizar registros existentes (vincular por email)
-- Empresas: vincular auth_user_id pelo socio_email
UPDATE public.empresas_recrutamento e
SET auth_user_id = u.id
FROM auth.users u
WHERE e.auth_user_id IS NULL
  AND LOWER(e.socio_email) = LOWER(u.email);

-- Candidatos: vincular auth_user_id pelo email
UPDATE public.candidatos_recrutamento c
SET auth_user_id = u.id
FROM auth.users u
WHERE c.auth_user_id IS NULL
  AND LOWER(c.email) = LOWER(u.email);

-- 8. Policies RLS para acesso baseado em auth_user_id

-- Empresas podem ver e atualizar seus próprios dados
DROP POLICY IF EXISTS "Empresas podem ver seus dados" ON public.empresas_recrutamento;
CREATE POLICY "Empresas podem ver seus dados"
ON public.empresas_recrutamento FOR SELECT
USING (auth_user_id = auth.uid() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Empresas podem atualizar seus dados" ON public.empresas_recrutamento;
CREATE POLICY "Empresas podem atualizar seus dados"
ON public.empresas_recrutamento FOR UPDATE
USING (auth_user_id = auth.uid());

-- Candidatos podem ver e atualizar seus próprios dados
DROP POLICY IF EXISTS "Candidatos podem ver seus dados" ON public.candidatos_recrutamento;
CREATE POLICY "Candidatos podem ver seus dados"
ON public.candidatos_recrutamento FOR SELECT
USING (auth_user_id = auth.uid() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Candidatos podem atualizar seus dados" ON public.candidatos_recrutamento;
CREATE POLICY "Candidatos podem atualizar seus dados"
ON public.candidatos_recrutamento FOR UPDATE
USING (auth_user_id = auth.uid());

-- 9. Criar função para obter empresa logada
CREATE OR REPLACE FUNCTION public.get_empresa_logada()
RETURNS TABLE (
    id UUID,
    razao_social VARCHAR,
    nome_fantasia VARCHAR,
    socio_email VARCHAR,
    creditos DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.razao_social,
        e.nome_fantasia,
        e.socio_email,
        e.creditos
    FROM public.empresas_recrutamento e
    WHERE e.auth_user_id = auth.uid();
END;
$$;

-- 10. Criar função para obter candidato logado
CREATE OR REPLACE FUNCTION public.get_candidato_logado()
RETURNS TABLE (
    id UUID,
    nome_completo VARCHAR,
    email VARCHAR,
    foto_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.nome_completo,
        c.email,
        c.foto_url
    FROM public.candidatos_recrutamento c
    WHERE c.auth_user_id = auth.uid();
END;
$$;

-- 11. Atualizar função cadastrar_empresa_rapido para incluir auth_user_id
CREATE OR REPLACE FUNCTION public.cadastrar_empresa_rapido(
    p_cnpj VARCHAR,
    p_razao_social VARCHAR,
    p_nome_fantasia VARCHAR DEFAULT NULL,
    p_situacao_cadastral VARCHAR DEFAULT NULL,
    p_data_abertura DATE DEFAULT NULL,
    p_natureza_juridica VARCHAR DEFAULT NULL,
    p_porte VARCHAR DEFAULT NULL,
    p_capital_social DECIMAL DEFAULT NULL,
    p_logradouro VARCHAR DEFAULT NULL,
    p_numero VARCHAR DEFAULT NULL,
    p_complemento VARCHAR DEFAULT NULL,
    p_bairro VARCHAR DEFAULT NULL,
    p_cidade VARCHAR DEFAULT NULL,
    p_estado VARCHAR DEFAULT NULL,
    p_cep VARCHAR DEFAULT NULL,
    p_telefone_empresa VARCHAR DEFAULT NULL,
    p_email_empresa VARCHAR DEFAULT NULL,
    p_socio_email VARCHAR,
    p_socio_telefone VARCHAR
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_empresa_id UUID;
    v_auth_user_id UUID;
BEGIN
    -- Obter auth_user_id se usuário estiver autenticado
    v_auth_user_id := auth.uid();

    -- Verificar se CNPJ já existe
    IF EXISTS (SELECT 1 FROM empresas_recrutamento WHERE cnpj = p_cnpj) THEN
        RETURN json_build_object('success', false, 'error', 'CNPJ já cadastrado');
    END IF;

    -- Verificar se email já existe
    IF EXISTS (SELECT 1 FROM empresas_recrutamento WHERE socio_email = p_socio_email) THEN
        RETURN json_build_object('success', false, 'error', 'Email já cadastrado');
    END IF;

    -- Inserir empresa com cadastro incompleto
    INSERT INTO empresas_recrutamento (
        cnpj,
        razao_social,
        nome_fantasia,
        situacao_cadastral,
        data_abertura,
        natureza_juridica,
        porte,
        capital_social,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        telefone_empresa,
        email_empresa,
        socio_email,
        socio_telefone,
        cadastro_completo,
        aceite_termos,
        aceite_termos_data,
        aceite_lgpd,
        aceite_lgpd_data,
        auth_user_id
    ) VALUES (
        p_cnpj,
        p_razao_social,
        p_nome_fantasia,
        p_situacao_cadastral,
        p_data_abertura,
        p_natureza_juridica,
        p_porte,
        p_capital_social,
        p_logradouro,
        p_numero,
        p_complemento,
        p_bairro,
        p_cidade,
        p_estado,
        p_cep,
        p_telefone_empresa,
        p_email_empresa,
        p_socio_email,
        p_socio_telefone,
        FALSE, -- cadastro_completo = false
        TRUE,  -- aceite_termos
        NOW(),
        TRUE,  -- aceite_lgpd
        NOW(),
        v_auth_user_id
    )
    RETURNING id INTO v_empresa_id;

    RETURN json_build_object(
        'success', true,
        'empresa_id', v_empresa_id
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- 12. Função para atualizar auth_user_id após login (para registros existentes)
CREATE OR REPLACE FUNCTION public.vincular_auth_empresa()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_email TEXT;
    v_updated_count INT;
BEGIN
    -- Obter email do usuário autenticado
    SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();

    IF v_user_email IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado');
    END IF;

    -- Atualizar empresa que tem esse email
    UPDATE public.empresas_recrutamento
    SET auth_user_id = auth.uid()
    WHERE LOWER(socio_email) = LOWER(v_user_email)
      AND auth_user_id IS NULL;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;

    IF v_updated_count > 0 THEN
        RETURN jsonb_build_object('success', true, 'message', 'Conta vinculada com sucesso');
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Empresa não encontrada ou já vinculada');
    END IF;
END;
$$;

-- 13. Função para atualizar auth_user_id após login de candidato
CREATE OR REPLACE FUNCTION public.vincular_auth_candidato()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_email TEXT;
    v_updated_count INT;
BEGIN
    -- Obter email do usuário autenticado
    SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();

    IF v_user_email IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado');
    END IF;

    -- Atualizar candidato que tem esse email
    UPDATE public.candidatos_recrutamento
    SET auth_user_id = auth.uid()
    WHERE LOWER(email) = LOWER(v_user_email)
      AND auth_user_id IS NULL;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;

    IF v_updated_count > 0 THEN
        RETURN jsonb_build_object('success', true, 'message', 'Conta vinculada com sucesso');
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Candidato não encontrado ou já vinculado');
    END IF;
END;
$$;

-- Grants para as novas funções
GRANT EXECUTE ON FUNCTION public.vincular_auth_empresa TO authenticated;
GRANT EXECUTE ON FUNCTION public.vincular_auth_candidato TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_empresa_logada TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_candidato_logado TO authenticated;

-- =====================================================
-- CORREÇÃO DAS FUNÇÕES RPC - 19/12/2025
-- =====================================================

-- =====================================================
-- 1. AJUSTAR COLUNA NOME EM CANDIDATOS
-- =====================================================

-- Tornar coluna 'nome' nullable se existir
DO $$
BEGIN
    ALTER TABLE public.candidatos_recrutamento ALTER COLUMN nome DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- =====================================================
-- 2. CORRIGIR FUNÇÃO CADASTRAR CANDIDATO
-- =====================================================

CREATE OR REPLACE FUNCTION public.cadastrar_candidato_rapido(
    p_nome_completo VARCHAR,
    p_telefone VARCHAR,
    p_email VARCHAR,
    p_auth_user_id UUID DEFAULT NULL,
    p_codigo_indicacao VARCHAR DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_candidato_id UUID;
BEGIN
    -- Verificar se email já existe
    IF EXISTS (SELECT 1 FROM candidatos_recrutamento WHERE LOWER(email) = LOWER(p_email)) THEN
        RETURN json_build_object('success', false, 'error', 'E-mail já cadastrado');
    END IF;

    -- Verificar se telefone já existe
    IF EXISTS (SELECT 1 FROM candidatos_recrutamento WHERE telefone = p_telefone) THEN
        RETURN json_build_object('success', false, 'error', 'Telefone já cadastrado');
    END IF;

    -- Inserir candidato (inclui tanto 'nome' quanto 'nome_completo')
    INSERT INTO candidatos_recrutamento (
        nome,
        nome_completo,
        telefone,
        email,
        auth_user_id,
        status,
        cadastro_completo,
        aceite_termos,
        aceite_termos_data,
        aceite_lgpd,
        aceite_lgpd_data,
        codigo_indicacao
    ) VALUES (
        p_nome_completo,
        p_nome_completo,
        p_telefone,
        LOWER(p_email),
        p_auth_user_id,
        'pendente',
        FALSE,
        TRUE,
        NOW(),
        TRUE,
        NOW(),
        p_codigo_indicacao
    )
    RETURNING id INTO v_candidato_id;

    RETURN json_build_object(
        'success', true,
        'candidato_id', v_candidato_id
    );

EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object('success', false, 'error', 'E-mail ou telefone já cadastrado');
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.cadastrar_candidato_rapido TO anon;
GRANT EXECUTE ON FUNCTION public.cadastrar_candidato_rapido TO authenticated;

-- =====================================================
-- 3. CORRIGIR FUNÇÃO CADASTRAR EMPRESA
-- =====================================================

CREATE OR REPLACE FUNCTION public.cadastrar_empresa(
  p_cnpj TEXT,
  p_razao_social TEXT,
  p_nome_fantasia TEXT DEFAULT NULL,
  p_situacao_cadastral TEXT DEFAULT NULL,
  p_data_abertura TEXT DEFAULT NULL,
  p_natureza_juridica TEXT DEFAULT NULL,
  p_porte TEXT DEFAULT NULL,
  p_capital_social NUMERIC DEFAULT NULL,
  p_logradouro TEXT DEFAULT NULL,
  p_numero TEXT DEFAULT NULL,
  p_complemento TEXT DEFAULT NULL,
  p_bairro TEXT DEFAULT NULL,
  p_cidade TEXT DEFAULT NULL,
  p_estado TEXT DEFAULT NULL,
  p_cep TEXT DEFAULT NULL,
  p_telefone_empresa TEXT DEFAULT NULL,
  p_email_empresa TEXT DEFAULT NULL,
  p_socio_nome TEXT DEFAULT NULL,
  p_socio_cpf TEXT DEFAULT NULL,
  p_socio_email TEXT DEFAULT NULL,
  p_socio_telefone TEXT DEFAULT NULL,
  p_socio_foto_url TEXT DEFAULT NULL,
  p_aceite_termos BOOLEAN DEFAULT FALSE,
  p_aceite_lgpd BOOLEAN DEFAULT FALSE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_empresa_id UUID;
  v_result JSON;
  v_data_abertura DATE;
BEGIN
  -- Converter data_abertura de TEXT para DATE se fornecida
  IF p_data_abertura IS NOT NULL AND p_data_abertura != '' THEN
    BEGIN
      v_data_abertura := p_data_abertura::DATE;
    EXCEPTION WHEN OTHERS THEN
      v_data_abertura := NULL;
    END;
  ELSE
    v_data_abertura := NULL;
  END IF;

  -- Inserir empresa
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
    socio_nome,
    socio_cpf,
    socio_email,
    socio_telefone,
    socio_foto_url,
    senha_hash,
    aceite_termos,
    aceite_termos_data,
    aceite_lgpd,
    aceite_lgpd_data,
    status,
    creditos
  ) VALUES (
    p_cnpj,
    p_razao_social,
    p_nome_fantasia,
    p_situacao_cadastral,
    v_data_abertura,
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
    p_socio_nome,
    p_socio_cpf,
    p_socio_email,
    p_socio_telefone,
    p_socio_foto_url,
    'AUTH_SUPABASE',
    p_aceite_termos,
    NOW(),
    p_aceite_lgpd,
    NOW(),
    'ativo',
    0
  )
  RETURNING id INTO v_empresa_id;

  v_result := json_build_object(
    'success', true,
    'empresa_id', v_empresa_id,
    'message', 'Empresa cadastrada com sucesso'
  );

  RETURN v_result;

EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object(
      'success', false,
      'error', 'CNPJ já cadastrado',
      'code', 'DUPLICATE_CNPJ'
    );
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'code', SQLSTATE
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.cadastrar_empresa TO anon;
GRANT EXECUTE ON FUNCTION public.cadastrar_empresa TO authenticated;

SELECT 'Funções RPC corrigidas!' as resultado;

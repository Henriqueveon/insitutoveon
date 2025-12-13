-- =====================================================
-- FUNÇÃO PARA CADASTRAR EMPRESA (bypassa RLS)
-- =====================================================

-- Função para inserir empresa com SECURITY DEFINER
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
  p_socio_nome TEXT,
  p_socio_cpf TEXT,
  p_socio_email TEXT,
  p_socio_telefone TEXT,
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
BEGIN
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

  -- Retornar sucesso
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

-- Garantir que a função pode ser chamada por usuários anônimos (para cadastro)
GRANT EXECUTE ON FUNCTION public.cadastrar_empresa TO anon;
GRANT EXECUTE ON FUNCTION public.cadastrar_empresa TO authenticated;

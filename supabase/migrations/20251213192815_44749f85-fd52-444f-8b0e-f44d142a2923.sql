-- =====================================================
-- 1. TABELA PARA ARMAZENAR CÓDIGOS OTP
-- =====================================================

CREATE TABLE IF NOT EXISTS public.email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  codigo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'cadastro_empresa',
  tentativas INTEGER DEFAULT 0,
  max_tentativas INTEGER DEFAULT 3,
  verificado BOOLEAN DEFAULT FALSE,
  expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verificado_em TIMESTAMP WITH TIME ZONE
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON public.email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_codigo ON public.email_otps(codigo);
CREATE INDEX IF NOT EXISTS idx_email_otps_expira ON public.email_otps(expira_em);

-- RLS
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_otp" ON public.email_otps
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "allow_select_own_otp" ON public.email_otps
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "allow_update_otp" ON public.email_otps
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 2. FUNÇÃO CRIAR OTP
-- =====================================================

CREATE OR REPLACE FUNCTION public.criar_otp(
  p_email TEXT,
  p_tipo TEXT DEFAULT 'cadastro_empresa'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_codigo TEXT;
  v_otp_id UUID;
  v_expira_em TIMESTAMP WITH TIME ZONE;
BEGIN
  v_codigo := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  v_expira_em := NOW() + INTERVAL '10 minutes';

  UPDATE public.email_otps
  SET expira_em = NOW()
  WHERE email = p_email
  AND tipo = p_tipo
  AND verificado = false;

  INSERT INTO public.email_otps (email, codigo, tipo, expira_em)
  VALUES (p_email, v_codigo, p_tipo, v_expira_em)
  RETURNING id INTO v_otp_id;

  RETURN json_build_object(
    'success', true,
    'otp_id', v_otp_id,
    'codigo', v_codigo,
    'expira_em', v_expira_em
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- =====================================================
-- 3. FUNÇÃO VERIFICAR OTP
-- =====================================================

CREATE OR REPLACE FUNCTION public.verificar_otp(
  p_email TEXT,
  p_codigo TEXT,
  p_tipo TEXT DEFAULT 'cadastro_empresa'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_otp RECORD;
BEGIN
  SELECT * INTO v_otp
  FROM public.email_otps
  WHERE email = p_email
  AND tipo = p_tipo
  AND verificado = false
  AND expira_em > NOW()
  ORDER BY criado_em DESC
  LIMIT 1;

  IF v_otp IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Código expirado ou inválido. Solicite um novo código.',
      'code', 'OTP_NOT_FOUND'
    );
  END IF;

  IF v_otp.tentativas >= v_otp.max_tentativas THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Número máximo de tentativas excedido. Solicite um novo código.',
      'code', 'MAX_ATTEMPTS'
    );
  END IF;

  IF v_otp.codigo != p_codigo THEN
    UPDATE public.email_otps
    SET tentativas = tentativas + 1
    WHERE id = v_otp.id;

    RETURN json_build_object(
      'success', false,
      'error', 'Código incorreto. Tentativas restantes: ' || (v_otp.max_tentativas - v_otp.tentativas - 1)::TEXT,
      'code', 'INVALID_CODE',
      'tentativas_restantes', v_otp.max_tentativas - v_otp.tentativas - 1
    );
  END IF;

  UPDATE public.email_otps
  SET verificado = true, verificado_em = NOW()
  WHERE id = v_otp.id;

  RETURN json_build_object(
    'success', true,
    'message', 'Email verificado com sucesso!'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- =====================================================
-- 4. FUNÇÃO LIMPAR OTPS EXPIRADOS
-- =====================================================

CREATE OR REPLACE FUNCTION public.limpar_otps_expirados()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.email_otps
  WHERE expira_em < NOW()
  OR verificado = true;
END;
$$;

-- =====================================================
-- 5. FUNÇÃO CADASTRAR EMPRESA (todos parâmetros com default)
-- =====================================================

CREATE OR REPLACE FUNCTION public.cadastrar_empresa(
  p_cnpj TEXT,
  p_razao_social TEXT,
  p_socio_nome TEXT,
  p_socio_cpf TEXT,
  p_socio_email TEXT,
  p_socio_telefone TEXT,
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
    CASE WHEN p_data_abertura IS NOT NULL THEN p_data_abertura::DATE ELSE NULL END,
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

-- =====================================================
-- 6. PERMISSÕES DAS FUNÇÕES
-- =====================================================

GRANT EXECUTE ON FUNCTION public.criar_otp TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_otp TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.limpar_otps_expirados TO service_role;
GRANT EXECUTE ON FUNCTION public.cadastrar_empresa TO anon, authenticated;
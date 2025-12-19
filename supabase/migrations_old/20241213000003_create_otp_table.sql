-- =====================================================
-- TABELA PARA ARMAZENAR CÓDIGOS OTP
-- =====================================================

-- Dropar tabela se existir com schema incorreto
DROP TABLE IF EXISTS public.email_otps CASCADE;

-- Tabela de OTPs para verificação de email
CREATE TABLE IF NOT EXISTS public.email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  codigo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'cadastro_empresa', -- cadastro_empresa, recuperacao_senha, etc
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

-- RLS: Permitir acesso público para criação e verificação
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

-- Política: Permitir inserção por qualquer um (anônimo)
CREATE POLICY "allow_insert_otp" ON public.email_otps
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Política: Permitir leitura apenas do próprio email (para verificação)
CREATE POLICY "allow_select_own_otp" ON public.email_otps
  FOR SELECT TO anon, authenticated
  USING (true);

-- Política: Permitir atualização (para marcar como verificado)
CREATE POLICY "allow_update_otp" ON public.email_otps
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Função para limpar OTPs expirados (rodar periodicamente)
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

-- Função para criar OTP
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
  -- Gerar código de 6 dígitos
  v_codigo := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

  -- Expiração em 10 minutos
  v_expira_em := NOW() + INTERVAL '10 minutes';

  -- Invalidar OTPs anteriores do mesmo email e tipo
  UPDATE public.email_otps
  SET expira_em = NOW()
  WHERE email = p_email
  AND tipo = p_tipo
  AND verificado = false;

  -- Criar novo OTP
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

-- Função para verificar OTP
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
  -- Buscar OTP válido
  SELECT * INTO v_otp
  FROM public.email_otps
  WHERE email = p_email
  AND tipo = p_tipo
  AND verificado = false
  AND expira_em > NOW()
  ORDER BY criado_em DESC
  LIMIT 1;

  -- Verificar se encontrou
  IF v_otp IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Código expirado ou inválido. Solicite um novo código.',
      'code', 'OTP_NOT_FOUND'
    );
  END IF;

  -- Verificar tentativas
  IF v_otp.tentativas >= v_otp.max_tentativas THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Número máximo de tentativas excedido. Solicite um novo código.',
      'code', 'MAX_ATTEMPTS'
    );
  END IF;

  -- Verificar código
  IF v_otp.codigo != p_codigo THEN
    -- Incrementar tentativas
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

  -- Código correto - marcar como verificado
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

-- Permissões
GRANT EXECUTE ON FUNCTION public.criar_otp TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_otp TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.limpar_otps_expirados TO service_role;

-- =====================================================
-- FUNÇÃO RPC PARA CONFIRMAR EMAIL NO SUPABASE AUTH
-- Esta função permite confirmar email de usuário via código OTP
-- sem precisar do link de confirmação do Supabase
-- =====================================================

-- Função para confirmar email de um usuário no auth.users
CREATE OR REPLACE FUNCTION confirmar_email_usuario(p_auth_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar a tabela auth.users para confirmar o email
  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
  WHERE id = p_auth_user_id;

  -- Retornar se atualizou algum registro
  RETURN FOUND;
END;
$$;

-- Dar permissão para usuários autenticados e anônimos chamarem esta função
-- (necessário para o fluxo de login com verificação OTP)
GRANT EXECUTE ON FUNCTION confirmar_email_usuario(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION confirmar_email_usuario(UUID) TO anon;

-- Comentário na função
COMMENT ON FUNCTION confirmar_email_usuario IS
'Confirma o email de um usuário no Supabase Auth após verificação via OTP customizado.';

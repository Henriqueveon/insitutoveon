-- =====================================================
-- TRIGGER PARA AUTO-CONFIRMAR EMAIL DE NOVOS USUÁRIOS
-- Este trigger confirma automaticamente o email quando
-- um novo usuário é criado no Supabase Auth
-- =====================================================

-- Função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION auto_confirm_email_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  -- Se o email ainda não foi confirmado, confirmar automaticamente
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;

-- Criar trigger que executa ANTES do INSERT
CREATE TRIGGER auto_confirm_email_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_email_on_signup();

-- Também confirmar emails de usuários existentes que ainda não confirmaram
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, created_at)
WHERE email_confirmed_at IS NULL;

-- Comentário na função
COMMENT ON FUNCTION auto_confirm_email_on_signup IS
'Auto-confirma email de novos usuários no momento do cadastro,
permitindo login imediato sem necessidade de clicar em link de confirmação.';

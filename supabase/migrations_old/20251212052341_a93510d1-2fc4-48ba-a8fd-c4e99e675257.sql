-- Criar usuário admin diretamente
-- O trigger handle_new_user criará o perfil automaticamente

-- Primeiro verificar se já existe e deletar se necessário
DO $$
DECLARE
  existing_user_id UUID;
BEGIN
  SELECT id INTO existing_user_id FROM auth.users WHERE email = 'veonmidias@gmail.com';
  IF existing_user_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = existing_user_id;
  END IF;
END $$;

-- Inserir novo usuário admin com senha hashada
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  aud,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'veonmidias@gmail.com',
  crypt('Eufaturo1M$', gen_salt('bf')),
  now(),
  jsonb_build_object('nome_completo', 'Almirante Henrique', 'cargo', 'Administrador'),
  now(),
  now(),
  '',
  'authenticated',
  'authenticated'
);

-- Adicionar role de admin ao usuário recém-criado
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'veonmidias@gmail.com';
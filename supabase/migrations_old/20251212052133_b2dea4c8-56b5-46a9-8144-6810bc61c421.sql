-- ================================================
-- PAINEL DO GESTOR - MIGRAÇÃO COMPLETA
-- ================================================

-- 1. Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Criar tabela de profiles (dados do usuário)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  cargo TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Criar tabela de user_roles (separada para segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 4. Habilitar RLS em ambas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Criar função security definer para verificar roles (evita recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 6. RLS policies para profiles
CREATE POLICY "Usuários podem ver próprio perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos perfis"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 7. RLS policies para user_roles
CREATE POLICY "Admins podem gerenciar roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuários podem ver próprio role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- 8. Atualizar RLS de candidatos_disc para acesso apenas por admins
DROP POLICY IF EXISTS "Anyone can read candidates" ON public.candidatos_disc;
DROP POLICY IF EXISTS "Anyone can insert candidates" ON public.candidatos_disc;

CREATE POLICY "Público pode inserir candidatos"
ON public.candidatos_disc FOR INSERT
WITH CHECK (true);

CREATE POLICY "Apenas admins podem ler candidatos"
ON public.candidatos_disc FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem atualizar candidatos"
ON public.candidatos_disc FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem deletar candidatos"
ON public.candidatos_disc FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 9. Função para criar perfil automaticamente ao cadastrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, cargo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome_completo', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'cargo', 'Usuário')
  );
  RETURN NEW;
END;
$$;

-- 10. Trigger para criar perfil ao cadastrar
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Trigger para atualizar updated_at nos profiles
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();
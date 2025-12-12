-- =====================================================
-- MIGRAÇÃO: Funções de Autenticação
-- Instituto VEON - Sistema de Analistas
-- =====================================================

-- Habilitar extensão pgcrypto para bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 1. FUNÇÃO PARA LOGIN (verifica email/senha)
-- =====================================================

CREATE OR REPLACE FUNCTION public.login_usuario(
  p_email VARCHAR,
  p_senha VARCHAR
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fundador RECORD;
  v_analista RECORD;
  v_senha_hash VARCHAR;
  v_resultado JSON;
BEGIN
  -- Primeiro, verificar se é fundador
  SELECT id, email, senha, nome
  INTO v_fundador
  FROM public.fundador
  WHERE LOWER(email) = LOWER(p_email);

  IF FOUND THEN
    -- Verificar senha do fundador
    IF v_fundador.senha = crypt(p_senha, v_fundador.senha) THEN
      -- Atualizar updated_at
      UPDATE public.fundador SET updated_at = NOW() WHERE id = v_fundador.id;

      RETURN json_build_object(
        'success', true,
        'tipo', 'fundador',
        'usuario', json_build_object(
          'id', v_fundador.id,
          'email', v_fundador.email,
          'nome', v_fundador.nome
        )
      );
    ELSE
      RETURN json_build_object('success', false, 'error', 'Senha incorreta');
    END IF;
  END IF;

  -- Se não é fundador, verificar se é analista
  SELECT id, email, senha, nome, telefone, empresa, tipo,
         licencas_total, licencas_usadas, link_unico, ativo
  INTO v_analista
  FROM public.analistas
  WHERE LOWER(email) = LOWER(p_email);

  IF FOUND THEN
    -- Verificar se está ativo
    IF NOT v_analista.ativo THEN
      RETURN json_build_object('success', false, 'error', 'Conta desativada');
    END IF;

    -- Verificar senha do analista
    IF v_analista.senha = crypt(p_senha, v_analista.senha) THEN
      -- Atualizar último acesso
      UPDATE public.analistas
      SET ultimo_acesso = NOW(), updated_at = NOW()
      WHERE id = v_analista.id;

      RETURN json_build_object(
        'success', true,
        'tipo', 'analista',
        'usuario', json_build_object(
          'id', v_analista.id,
          'email', v_analista.email,
          'nome', v_analista.nome,
          'telefone', v_analista.telefone,
          'empresa', v_analista.empresa,
          'tipo', v_analista.tipo,
          'licencas_total', v_analista.licencas_total,
          'licencas_usadas', v_analista.licencas_usadas,
          'link_unico', v_analista.link_unico
        )
      );
    ELSE
      RETURN json_build_object('success', false, 'error', 'Senha incorreta');
    END IF;
  END IF;

  -- Email não encontrado
  RETURN json_build_object('success', false, 'error', 'Email não encontrado');
END;
$$;

-- =====================================================
-- 2. FUNÇÃO PARA CRIAR HASH DE SENHA
-- =====================================================

CREATE OR REPLACE FUNCTION public.criar_hash_senha(p_senha VARCHAR)
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN crypt(p_senha, gen_salt('bf', 10));
END;
$$;

-- =====================================================
-- 3. INSERIR FUNDADOR PADRÃO
-- =====================================================

INSERT INTO public.fundador (email, senha, nome)
VALUES (
  'admin@institutoveon.com.br',
  crypt('Veon@2024', gen_salt('bf', 10)),
  'Administrador VEON'
)
ON CONFLICT (email) DO UPDATE SET
  senha = crypt('Veon@2024', gen_salt('bf', 10)),
  nome = 'Administrador VEON',
  updated_at = NOW();

-- =====================================================
-- 4. FUNÇÃO PARA ALTERAR SENHA
-- =====================================================

CREATE OR REPLACE FUNCTION public.alterar_senha(
  p_tipo VARCHAR,
  p_id UUID,
  p_senha_atual VARCHAR,
  p_nova_senha VARCHAR
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_senha_hash VARCHAR;
BEGIN
  IF p_tipo = 'fundador' THEN
    SELECT senha INTO v_senha_hash FROM public.fundador WHERE id = p_id;

    IF NOT FOUND THEN
      RETURN json_build_object('success', false, 'error', 'Usuário não encontrado');
    END IF;

    IF v_senha_hash != crypt(p_senha_atual, v_senha_hash) THEN
      RETURN json_build_object('success', false, 'error', 'Senha atual incorreta');
    END IF;

    UPDATE public.fundador
    SET senha = crypt(p_nova_senha, gen_salt('bf', 10)), updated_at = NOW()
    WHERE id = p_id;

  ELSIF p_tipo = 'analista' THEN
    SELECT senha INTO v_senha_hash FROM public.analistas WHERE id = p_id;

    IF NOT FOUND THEN
      RETURN json_build_object('success', false, 'error', 'Usuário não encontrado');
    END IF;

    IF v_senha_hash != crypt(p_senha_atual, v_senha_hash) THEN
      RETURN json_build_object('success', false, 'error', 'Senha atual incorreta');
    END IF;

    UPDATE public.analistas
    SET senha = crypt(p_nova_senha, gen_salt('bf', 10)), updated_at = NOW()
    WHERE id = p_id;

  ELSE
    RETURN json_build_object('success', false, 'error', 'Tipo de usuário inválido');
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

-- =====================================================
-- 5. GRANT PERMISSÕES PARA ANON E AUTHENTICATED
-- =====================================================

GRANT EXECUTE ON FUNCTION public.login_usuario TO anon;
GRANT EXECUTE ON FUNCTION public.login_usuario TO authenticated;
GRANT EXECUTE ON FUNCTION public.alterar_senha TO anon;
GRANT EXECUTE ON FUNCTION public.alterar_senha TO authenticated;

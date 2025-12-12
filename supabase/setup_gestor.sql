-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO DO PRIMEIRO GESTOR
-- Instituto VEON - Painel do Gestor
-- =====================================================
--
-- INSTRUÇÕES:
-- 1. Primeiro, execute a migração: 20251212000001_painel_gestor_tables.sql
-- 2. Crie um usuário no Supabase Dashboard:
--    - Vá em Authentication → Users → Add User
--    - Email: seu email
--    - Password: sua senha
-- 3. Copie o User UID do usuário criado
-- 4. Substitua os valores abaixo e execute este script
--
-- =====================================================

-- SUBSTITUA ESTES VALORES:
-- ========================

-- Cole o User UID do Supabase Auth aqui (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
DO $$
DECLARE
    v_user_id UUID := 'COLE_O_USER_UID_AQUI'; -- ⚠️ SUBSTITUA PELO SEU USER UID
    v_nome VARCHAR := 'Seu Nome Completo';    -- ⚠️ SUBSTITUA PELO SEU NOME
    v_email VARCHAR := 'seu@email.com';       -- ⚠️ SUBSTITUA PELO SEU EMAIL
    v_cargo VARCHAR := 'Administrador';
    v_empresa_id UUID := '00000000-0000-0000-0000-000000000001'; -- Instituto VEON (padrão)
BEGIN
    -- Verificar se a empresa padrão existe
    IF NOT EXISTS (SELECT 1 FROM public.empresas WHERE id = v_empresa_id) THEN
        INSERT INTO public.empresas (id, nome, cor_primaria, cor_secundaria)
        VALUES (v_empresa_id, 'Instituto VEON - Escola do Varejo', '#003366', '#E31E24');
        RAISE NOTICE 'Empresa Instituto VEON criada.';
    END IF;

    -- Verificar se o gestor já existe
    IF EXISTS (SELECT 1 FROM public.gestores WHERE email = v_email) THEN
        RAISE NOTICE 'Gestor com este email já existe. Atualizando...';
        UPDATE public.gestores
        SET user_id = v_user_id, nome = v_nome, cargo = v_cargo, is_admin = true, ativo = true
        WHERE email = v_email;
    ELSE
        -- Inserir novo gestor
        INSERT INTO public.gestores (user_id, empresa_id, nome, email, cargo, is_admin, ativo)
        VALUES (v_user_id, v_empresa_id, v_nome, v_email, v_cargo, true, true);
        RAISE NOTICE 'Gestor criado com sucesso!';
    END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
-- Execute esta query para verificar se deu certo:

SELECT
    g.id,
    g.nome,
    g.email,
    g.cargo,
    g.is_admin,
    e.nome as empresa
FROM public.gestores g
LEFT JOIN public.empresas e ON g.empresa_id = e.id;

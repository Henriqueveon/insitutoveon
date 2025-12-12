-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO DO FUNDADOR
-- Instituto VEON - Sistema de Analistas
-- =====================================================
--
-- INSTRUÇÕES:
-- 1. Primeiro, execute a migração: 20251212150000_sistema_analistas.sql
-- 2. Substitua os valores abaixo
-- 3. Execute este script no Supabase SQL Editor
--
-- IMPORTANTE: A senha deve ser um hash bcrypt!
-- Use um gerador online ou a função crypt() do PostgreSQL com pgcrypto
--
-- =====================================================

-- Para gerar hash de senha, use:
-- SELECT crypt('sua_senha_aqui', gen_salt('bf'));

-- SUBSTITUA ESTES VALORES:
-- ========================

INSERT INTO public.fundador (email, senha, nome)
VALUES (
    'fundador@institutoveon.com.br',  -- ⚠️ SUBSTITUA PELO EMAIL DO FUNDADOR
    '$2a$10$HASH_DA_SENHA_AQUI',       -- ⚠️ SUBSTITUA PELO HASH BCRYPT DA SENHA
    'Nome do Fundador'                 -- ⚠️ SUBSTITUA PELO NOME DO FUNDADOR
)
ON CONFLICT (email) DO UPDATE SET
    nome = EXCLUDED.nome,
    senha = EXCLUDED.senha,
    updated_at = NOW();

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
-- Execute esta query para verificar se deu certo:

SELECT id, email, nome, created_at FROM public.fundador;

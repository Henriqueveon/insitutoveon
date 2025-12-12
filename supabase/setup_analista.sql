-- =====================================================
-- SCRIPT DE CRIAÇÃO DE ANALISTA
-- Instituto VEON - Sistema de Analistas
-- =====================================================
--
-- INSTRUÇÕES:
-- 1. Primeiro, execute a migração: 20251212150000_sistema_analistas.sql
-- 2. Substitua os valores abaixo para cada analista
-- 3. Execute este script no Supabase SQL Editor
--
-- IMPORTANTE: A senha deve ser um hash bcrypt!
-- Use: SELECT crypt('senha_aqui', gen_salt('bf'));
--
-- =====================================================

-- Para gerar hash de senha:
-- SELECT crypt('senha123', gen_salt('bf'));

-- EXEMPLO DE CRIAÇÃO DE ANALISTA:
-- ===============================

INSERT INTO public.analistas (
    nome,
    email,
    senha,
    telefone,
    empresa,
    tipo,
    licencas_total,
    ativo
)
VALUES (
    'Nome do Analista',                -- ⚠️ Nome completo
    'analista@email.com',              -- ⚠️ Email (único)
    '$2a$10$HASH_DA_SENHA',            -- ⚠️ Hash bcrypt da senha
    '(11) 99999-9999',                 -- Telefone (opcional)
    'Nome da Consultoria',             -- Empresa (opcional)
    'coach',                           -- Tipo: coach, psicologo, empresa, rh, escola, outro
    50,                                -- Quantidade de licenças
    true                               -- Ativo
)
ON CONFLICT (email) DO UPDATE SET
    nome = EXCLUDED.nome,
    telefone = EXCLUDED.telefone,
    empresa = EXCLUDED.empresa,
    tipo = EXCLUDED.tipo,
    licencas_total = EXCLUDED.licencas_total,
    updated_at = NOW();

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
-- Execute esta query para ver todos os analistas:

SELECT
    id,
    nome,
    email,
    telefone,
    empresa,
    tipo,
    licencas_total,
    licencas_usadas,
    (licencas_total - licencas_usadas) as licencas_disponiveis,
    link_unico,
    ativo,
    data_cadastro
FROM public.analistas
ORDER BY data_cadastro DESC;

-- =====================================================
-- CONSULTAS ÚTEIS
-- =====================================================

-- Ver link único de um analista específico:
-- SELECT link_unico FROM public.analistas WHERE email = 'analista@email.com';

-- Ver candidatos de um analista:
-- SELECT c.* FROM public.candidatos_disc c
-- JOIN public.analistas a ON c.analista_id = a.id
-- WHERE a.email = 'analista@email.com';

-- Adicionar mais licenças a um analista:
-- UPDATE public.analistas SET licencas_total = licencas_total + 10 WHERE email = 'analista@email.com';

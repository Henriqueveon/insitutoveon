-- =====================================================
-- MIGRAÇÃO: Foto opcional e correção de candidatos
-- Candidatos com DISC completo devem ficar disponíveis
-- mesmo sem foto (foto agora é opcional)
-- =====================================================

-- 1. Atualizar candidatos que têm perfil DISC mas estão offline
-- Coloca status = 'disponivel' para quem tem:
-- - perfil_disc preenchido
-- - dados básicos preenchidos (nome, cpf, cidade, estado)
-- - experiência preenchida (escolaridade, areas_experiencia, pretensao_salarial)
UPDATE public.candidatos_recrutamento
SET
  status = 'disponivel',
  cadastro_completo = true
WHERE perfil_disc IS NOT NULL
  AND perfil_disc != ''
  AND nome_completo IS NOT NULL
  AND cpf IS NOT NULL
  AND cidade IS NOT NULL
  AND estado IS NOT NULL
  AND escolaridade IS NOT NULL
  AND areas_experiencia IS NOT NULL
  AND pretensao_salarial IS NOT NULL
  AND (status IS NULL OR status = 'offline' OR status = '');

-- 2. Também atualizar quem tem perfil_natural mas não tem perfil_disc
-- (candidatos que fizeram o teste mas o campo não foi preenchido corretamente)
UPDATE public.candidatos_recrutamento
SET perfil_disc = CASE
  WHEN COALESCE((perfil_natural->>'D')::numeric, 0) >= COALESCE((perfil_natural->>'I')::numeric, 0)
   AND COALESCE((perfil_natural->>'D')::numeric, 0) >= COALESCE((perfil_natural->>'S')::numeric, 0)
   AND COALESCE((perfil_natural->>'D')::numeric, 0) >= COALESCE((perfil_natural->>'C')::numeric, 0)
  THEN 'D'
  WHEN COALESCE((perfil_natural->>'I')::numeric, 0) >= COALESCE((perfil_natural->>'D')::numeric, 0)
   AND COALESCE((perfil_natural->>'I')::numeric, 0) >= COALESCE((perfil_natural->>'S')::numeric, 0)
   AND COALESCE((perfil_natural->>'I')::numeric, 0) >= COALESCE((perfil_natural->>'C')::numeric, 0)
  THEN 'I'
  WHEN COALESCE((perfil_natural->>'S')::numeric, 0) >= COALESCE((perfil_natural->>'D')::numeric, 0)
   AND COALESCE((perfil_natural->>'S')::numeric, 0) >= COALESCE((perfil_natural->>'I')::numeric, 0)
   AND COALESCE((perfil_natural->>'S')::numeric, 0) >= COALESCE((perfil_natural->>'C')::numeric, 0)
  THEN 'S'
  ELSE 'C'
END
WHERE perfil_natural IS NOT NULL
  AND perfil_natural != '{}'::jsonb
  AND (perfil_disc IS NULL OR perfil_disc = '');

-- 3. Após corrigir perfil_disc, atualizar status desses candidatos também
UPDATE public.candidatos_recrutamento
SET
  status = 'disponivel',
  cadastro_completo = true
WHERE perfil_disc IS NOT NULL
  AND perfil_disc != ''
  AND nome_completo IS NOT NULL
  AND cpf IS NOT NULL
  AND cidade IS NOT NULL
  AND estado IS NOT NULL
  AND escolaridade IS NOT NULL
  AND areas_experiencia IS NOT NULL
  AND pretensao_salarial IS NOT NULL
  AND (status IS NULL OR status != 'disponivel' OR cadastro_completo = false);

-- 4. Query para verificar o candidato Henrique Alves especificamente
-- (executar separadamente para conferir)
-- SELECT id, nome_completo, perfil_disc, status, cadastro_completo, foto_url,
--        cpf, cidade, estado, escolaridade, areas_experiencia, pretensao_salarial
-- FROM public.candidatos_recrutamento
-- WHERE nome_completo ILIKE '%henrique%alves%';

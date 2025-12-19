-- =====================================================
-- MIGRAÇÃO: Corrigir candidatos com DISC que estão offline
-- Atualiza status e perfil_disc baseado no perfil_natural
-- =====================================================

-- 1. Atualizar candidatos que têm perfil_natural mas status não é 'disponivel'
UPDATE public.candidatos_recrutamento
SET status = 'disponivel'
WHERE perfil_natural IS NOT NULL
  AND perfil_natural != '{}'::jsonb
  AND (status IS NULL OR status != 'disponivel');

-- 2. Atualizar perfil_disc baseado no perfil_natural para candidatos que têm perfil_natural mas não têm perfil_disc
UPDATE public.candidatos_recrutamento
SET perfil_disc = CASE
  -- Determinar o perfil dominante baseado nos valores D, I, S, C
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

-- 3. Log para verificação (comentar em produção se necessário)
-- SELECT id, nome_completo, perfil_disc, status, perfil_natural
-- FROM public.candidatos_recrutamento
-- WHERE perfil_natural IS NOT NULL;

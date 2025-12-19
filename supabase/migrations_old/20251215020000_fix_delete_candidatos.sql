-- =====================================================
-- CORREÇÃO: Permitir exclusão de candidatos pelo gestor
-- Data: 15/12/2025
-- =====================================================

-- 1. Política para DELETE de candidatos (usuários autenticados)
DROP POLICY IF EXISTS "candidatos_delete_auth" ON public.candidatos_recrutamento;
DROP POLICY IF EXISTS "Candidatos delete authenticated" ON public.candidatos_recrutamento;

CREATE POLICY "candidatos_delete_authenticated"
ON public.candidatos_recrutamento FOR DELETE
TO authenticated
USING (true);

-- 2. Também permitir que anon delete (para testes)
DROP POLICY IF EXISTS "candidatos_delete_anon" ON public.candidatos_recrutamento;

CREATE POLICY "candidatos_delete_anon"
ON public.candidatos_recrutamento FOR DELETE
TO anon
USING (true);

-- 3. GRANT de DELETE
GRANT DELETE ON public.candidatos_recrutamento TO authenticated;
GRANT DELETE ON public.candidatos_recrutamento TO anon;

-- 4. Também garantir UPDATE (caso ainda não exista)
DROP POLICY IF EXISTS "candidatos_update_authenticated" ON public.candidatos_recrutamento;

CREATE POLICY "candidatos_update_authenticated"
ON public.candidatos_recrutamento FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

GRANT UPDATE ON public.candidatos_recrutamento TO authenticated;

-- =====================================================
-- 5. TABELAS RELACIONADAS - Permitir DELETE também
-- =====================================================

-- Solicitações de entrevista
DROP POLICY IF EXISTS "solicitacoes_delete_authenticated" ON public.solicitacoes_entrevista;
CREATE POLICY "solicitacoes_delete_authenticated"
ON public.solicitacoes_entrevista FOR DELETE
TO authenticated
USING (true);

GRANT DELETE ON public.solicitacoes_entrevista TO authenticated;

-- Indicações de candidatos (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'indicacoes_candidatos') THEN
        EXECUTE 'DROP POLICY IF EXISTS "indicacoes_delete_authenticated" ON public.indicacoes_candidatos';
        EXECUTE 'CREATE POLICY "indicacoes_delete_authenticated" ON public.indicacoes_candidatos FOR DELETE TO authenticated USING (true)';
        EXECUTE 'GRANT DELETE ON public.indicacoes_candidatos TO authenticated';
    END IF;
END
$$;


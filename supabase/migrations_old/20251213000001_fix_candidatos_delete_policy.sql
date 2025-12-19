-- =====================================================
-- MIGRAÇÃO: Corrigir policy de DELETE para candidatos_disc
-- Problema: Gestores não conseguiam deletar candidatos porque
-- a policy de DELETE verificava user_roles, mas gestores
-- estão na tabela gestores.
-- =====================================================

-- Remover policy antiga que usa has_role (que verifica user_roles)
DROP POLICY IF EXISTS "Apenas admins podem deletar candidatos" ON public.candidatos_disc;

-- Criar nova policy que permite gestores deletarem candidatos da sua empresa
-- ou candidatos sem empresa (registros antigos)
CREATE POLICY "Gestores can delete empresa candidates"
ON public.candidatos_disc
FOR DELETE
USING (
  -- Gestor pode deletar candidatos da sua empresa
  empresa_id IN (
    SELECT empresa_id FROM public.gestores
    WHERE user_id = auth.uid()
  )
  OR
  -- Gestor admin pode deletar candidatos sem empresa (legados)
  (
    empresa_id IS NULL
    AND EXISTS (
      SELECT 1 FROM public.gestores
      WHERE user_id = auth.uid() AND is_admin = true
    )
  )
  OR
  -- Também permitir se tiver role admin no sistema antigo (compatibilidade)
  public.has_role(auth.uid(), 'admin')
);

-- Verificação: listar todas as policies da tabela candidatos_disc
-- Execute no Supabase SQL Editor para confirmar:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'candidatos_disc';

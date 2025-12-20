-- =====================================================
-- CORREÇÃO DE POLÍTICAS RLS
-- Corrige INSERT em destaques_candidato e midias_destaque
-- Corrige política de notificacoes_recrutamento
-- =====================================================

-- =============================================
-- 1. CORRIGIR RLS DE DESTAQUES_CANDIDATO
-- =============================================

-- Remover política problemática (FOR ALL sem WITH CHECK)
DROP POLICY IF EXISTS "Candidatos gerenciam próprios destaques" ON destaques_candidato;

-- Criar política separada para SELECT
CREATE POLICY "Candidatos podem ver seus destaques" ON destaques_candidato
  FOR SELECT USING (
    candidato_id IN (
      SELECT id FROM candidatos_recrutamento WHERE auth_user_id = auth.uid()
    )
  );

-- Criar política para INSERT com WITH CHECK
CREATE POLICY "Candidatos podem criar destaques" ON destaques_candidato
  FOR INSERT WITH CHECK (
    candidato_id IN (
      SELECT id FROM candidatos_recrutamento WHERE auth_user_id = auth.uid()
    )
  );

-- Criar política para UPDATE
CREATE POLICY "Candidatos podem editar seus destaques" ON destaques_candidato
  FOR UPDATE USING (
    candidato_id IN (
      SELECT id FROM candidatos_recrutamento WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    candidato_id IN (
      SELECT id FROM candidatos_recrutamento WHERE auth_user_id = auth.uid()
    )
  );

-- Criar política para DELETE
CREATE POLICY "Candidatos podem deletar seus destaques" ON destaques_candidato
  FOR DELETE USING (
    candidato_id IN (
      SELECT id FROM candidatos_recrutamento WHERE auth_user_id = auth.uid()
    )
  );

-- =============================================
-- 2. CORRIGIR RLS DE MIDIAS_DESTAQUE
-- =============================================

-- Remover política problemática
DROP POLICY IF EXISTS "Candidatos gerenciam próprias mídias" ON midias_destaque;

-- Criar política para SELECT (todos podem ver)
CREATE POLICY "Todos podem ver midias" ON midias_destaque
  FOR SELECT USING (true);

-- Criar política para INSERT
CREATE POLICY "Candidatos podem criar midias" ON midias_destaque
  FOR INSERT WITH CHECK (
    destaque_id IN (
      SELECT d.id FROM destaques_candidato d
      JOIN candidatos_recrutamento c ON c.id = d.candidato_id
      WHERE c.auth_user_id = auth.uid()
    )
  );

-- Criar política para UPDATE
CREATE POLICY "Candidatos podem editar suas midias" ON midias_destaque
  FOR UPDATE USING (
    destaque_id IN (
      SELECT d.id FROM destaques_candidato d
      JOIN candidatos_recrutamento c ON c.id = d.candidato_id
      WHERE c.auth_user_id = auth.uid()
    )
  );

-- Criar política para DELETE
CREATE POLICY "Candidatos podem deletar suas midias" ON midias_destaque
  FOR DELETE USING (
    destaque_id IN (
      SELECT d.id FROM destaques_candidato d
      JOIN candidatos_recrutamento c ON c.id = d.candidato_id
      WHERE c.auth_user_id = auth.uid()
    )
  );

-- =============================================
-- 3. CORRIGIR RLS DE NOTIFICAÇÕES
-- =============================================

-- O problema: destinatario_id armazena o ID do candidato/empresa, não auth.uid()
-- Precisamos verificar via candidatos_recrutamento ou empresas_recrutamento

DROP POLICY IF EXISTS "Usuários veem próprias notificações" ON notificacoes_recrutamento;
CREATE POLICY "Usuários veem próprias notificações" ON notificacoes_recrutamento
  FOR SELECT USING (
    -- Candidato logado
    destinatario_id IN (
      SELECT id FROM candidatos_recrutamento WHERE auth_user_id = auth.uid()
    )
    OR
    -- Empresa logada
    destinatario_id IN (
      SELECT id FROM empresas_recrutamento WHERE auth_user_id = auth.uid()
    )
    OR
    -- Ou é o próprio auth.uid (para analistas)
    destinatario_id = auth.uid()
  );

DROP POLICY IF EXISTS "Usuários podem marcar como lida" ON notificacoes_recrutamento;
CREATE POLICY "Usuários podem marcar como lida" ON notificacoes_recrutamento
  FOR UPDATE USING (
    destinatario_id IN (
      SELECT id FROM candidatos_recrutamento WHERE auth_user_id = auth.uid()
    )
    OR
    destinatario_id IN (
      SELECT id FROM empresas_recrutamento WHERE auth_user_id = auth.uid()
    )
    OR
    destinatario_id = auth.uid()
  );

-- Manter política de INSERT aberta (sistema cria notificações)
DROP POLICY IF EXISTS "Sistema pode criar notificações" ON notificacoes_recrutamento;
CREATE POLICY "Sistema pode criar notificações" ON notificacoes_recrutamento
  FOR INSERT WITH CHECK (true);

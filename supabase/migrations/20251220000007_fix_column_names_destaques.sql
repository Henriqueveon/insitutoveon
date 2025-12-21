-- =====================================================
-- CORRIGIR NOMES DAS COLUNAS EM DESTAQUES_CANDIDATO
-- Problema: Colunas com nomes errados ("eu ia", "id_da_caminha")
-- =====================================================

-- ============================================
-- 1. DROPAR TODAS AS POLÍTICAS RLS EXISTENTES
-- ============================================

DROP POLICY IF EXISTS "Candidatos podem criar destaques" ON destaques_candidato;
DROP POLICY IF EXISTS "Candidatos podem ver seus destaques" ON destaques_candidato;
DROP POLICY IF EXISTS "Candidatos podem editar seus destaques" ON destaques_candidato;
DROP POLICY IF EXISTS "Candidatos podem deletar seus destaques" ON destaques_candidato;
DROP POLICY IF EXISTS "Candidatos gerenciam próprios destaques" ON destaques_candidato;
DROP POLICY IF EXISTS "Empresas podem ver destaques" ON destaques_candidato;
DROP POLICY IF EXISTS "Todos podem ver destaques" ON destaques_candidato;

-- Dropar políticas de midias também
DROP POLICY IF EXISTS "Candidatos podem criar midias" ON midias_destaque;
DROP POLICY IF EXISTS "Candidatos podem editar suas midias" ON midias_destaque;
DROP POLICY IF EXISTS "Candidatos podem deletar suas midias" ON midias_destaque;
DROP POLICY IF EXISTS "Candidatos gerenciam próprias mídias" ON midias_destaque;
DROP POLICY IF EXISTS "Empresas podem ver mídias" ON midias_destaque;
DROP POLICY IF EXISTS "Todos podem ver midias" ON midias_destaque;

-- ============================================
-- 2. RENOMEAR COLUNAS (SE EXISTIREM COM NOMES ERRADOS)
-- ============================================

-- Tentar renomear "eu ia" para "id" (se existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'destaques_candidato' AND column_name = 'eu ia'
  ) THEN
    ALTER TABLE destaques_candidato RENAME COLUMN "eu ia" TO id;
  END IF;
END $$;

-- Tentar renomear "id_da_caminha" para "candidato_id" (se existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'destaques_candidato' AND column_name = 'id_da_caminha'
  ) THEN
    ALTER TABLE destaques_candidato RENAME COLUMN "id_da_caminha" TO candidato_id;
  END IF;
END $$;

-- ============================================
-- 3. GARANTIR QUE A TABELA TEM ESTRUTURA CORRETA
-- ============================================

-- Se a tabela não tiver as colunas corretas, adicionar
DO $$
BEGIN
  -- Verificar se candidato_id existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'destaques_candidato' AND column_name = 'candidato_id'
  ) THEN
    -- Se não existe candidato_id, verificar se existe algum outro nome
    RAISE NOTICE 'Coluna candidato_id não encontrada. Verificar estrutura da tabela.';
  END IF;
END $$;

-- ============================================
-- 4. RECRIAR POLÍTICAS RLS PARA DESTAQUES
-- ============================================

-- Política para SELECT (todos podem ver)
CREATE POLICY "Todos podem ver destaques" ON destaques_candidato
  FOR SELECT USING (true);

-- Política para INSERT
CREATE POLICY "Candidatos podem criar destaques" ON destaques_candidato
  FOR INSERT WITH CHECK (
    candidato_id IN (
      SELECT id FROM candidatos_recrutamento
      WHERE auth_user_id = auth.uid()
    )
  );

-- Política para UPDATE
CREATE POLICY "Candidatos podem editar seus destaques" ON destaques_candidato
  FOR UPDATE USING (
    candidato_id IN (
      SELECT id FROM candidatos_recrutamento
      WHERE auth_user_id = auth.uid()
    )
  );

-- Política para DELETE
CREATE POLICY "Candidatos podem deletar seus destaques" ON destaques_candidato
  FOR DELETE USING (
    candidato_id IN (
      SELECT id FROM candidatos_recrutamento
      WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================
-- 5. RECRIAR POLÍTICAS RLS PARA MIDIAS
-- ============================================

-- Política para SELECT (todos podem ver)
CREATE POLICY "Todos podem ver midias" ON midias_destaque
  FOR SELECT USING (true);

-- Política para INSERT (aberta - validação via destaque)
CREATE POLICY "Candidatos podem criar midias" ON midias_destaque
  FOR INSERT WITH CHECK (
    destaque_id IN (
      SELECT d.id FROM destaques_candidato d
      JOIN candidatos_recrutamento c ON c.id = d.candidato_id
      WHERE c.auth_user_id = auth.uid()
    )
  );

-- Política para UPDATE
CREATE POLICY "Candidatos podem editar suas midias" ON midias_destaque
  FOR UPDATE USING (
    destaque_id IN (
      SELECT d.id FROM destaques_candidato d
      JOIN candidatos_recrutamento c ON c.id = d.candidato_id
      WHERE c.auth_user_id = auth.uid()
    )
  );

-- Política para DELETE
CREATE POLICY "Candidatos podem deletar suas midias" ON midias_destaque
  FOR DELETE USING (
    destaque_id IN (
      SELECT d.id FROM destaques_candidato d
      JOIN candidatos_recrutamento c ON c.id = d.candidato_id
      WHERE c.auth_user_id = auth.uid()
    )
  );

-- =============================================
-- PERFIL INSTAGRAM - TABELAS E FUNÇÕES
-- Destaques, mídias e visualizações
-- =============================================

-- =============================================
-- 1. ADICIONAR COLUNAS EM CANDIDATOS
-- =============================================

ALTER TABLE candidatos_recrutamento
ADD COLUMN IF NOT EXISTS total_visualizacoes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_propostas_recebidas INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_candidaturas INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- =============================================
-- 2. TABELA DESTAQUES_CANDIDATO
-- =============================================

CREATE TABLE IF NOT EXISTS destaques_candidato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL REFERENCES candidatos_recrutamento(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  icone TEXT DEFAULT '📌',
  ordem INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_destaques_candidato ON destaques_candidato(candidato_id, ordem);

ALTER TABLE destaques_candidato ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Candidatos gerenciam próprios destaques" ON destaques_candidato;
CREATE POLICY "Candidatos gerenciam próprios destaques" ON destaques_candidato
  FOR ALL USING (
    candidato_id IN (
      SELECT id FROM candidatos_recrutamento WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Empresas podem ver destaques" ON destaques_candidato;
CREATE POLICY "Empresas podem ver destaques" ON destaques_candidato
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM empresas_recrutamento WHERE auth_user_id = auth.uid()
    )
  );

-- =============================================
-- 3. TABELA MIDIAS_DESTAQUE
-- =============================================

CREATE TABLE IF NOT EXISTS midias_destaque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destaque_id UUID NOT NULL REFERENCES destaques_candidato(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('foto', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duracao_segundos INT,
  ordem INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_midias_destaque ON midias_destaque(destaque_id, ordem);

ALTER TABLE midias_destaque ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Candidatos gerenciam próprias mídias" ON midias_destaque;
CREATE POLICY "Candidatos gerenciam próprias mídias" ON midias_destaque
  FOR ALL USING (
    destaque_id IN (
      SELECT id FROM destaques_candidato
      WHERE candidato_id IN (
        SELECT id FROM candidatos_recrutamento WHERE auth_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Empresas podem ver mídias" ON midias_destaque;
CREATE POLICY "Empresas podem ver mídias" ON midias_destaque
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM empresas_recrutamento WHERE auth_user_id = auth.uid()
    )
  );

-- =============================================
-- 4. TABELA VISUALIZACOES_PERFIL
-- =============================================

CREATE TABLE IF NOT EXISTS visualizacoes_perfil (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL REFERENCES candidatos_recrutamento(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas_recrutamento(id) ON DELETE CASCADE,
  visualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar função imutável para extrair data
CREATE OR REPLACE FUNCTION date_from_timestamptz(ts TIMESTAMPTZ)
RETURNS DATE AS $$
  SELECT ts::date;
$$ LANGUAGE SQL IMMUTABLE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_visualizacoes_unico
ON visualizacoes_perfil(candidato_id, empresa_id, date_from_timestamptz(visualizado_em));

CREATE INDEX IF NOT EXISTS idx_visualizacoes_candidato
ON visualizacoes_perfil(candidato_id, visualizado_em DESC);

ALTER TABLE visualizacoes_perfil ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Empresas podem registrar visualização" ON visualizacoes_perfil;
CREATE POLICY "Empresas podem registrar visualização" ON visualizacoes_perfil
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT id FROM empresas_recrutamento WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Candidatos veem quem visualizou" ON visualizacoes_perfil;
CREATE POLICY "Candidatos veem quem visualizou" ON visualizacoes_perfil
  FOR SELECT USING (
    candidato_id IN (
      SELECT id FROM candidatos_recrutamento WHERE auth_user_id = auth.uid()
    )
  );

-- =============================================
-- 5. TABELA CANDIDATOS_SALVOS (Favoritos)
-- =============================================

CREATE TABLE IF NOT EXISTS candidatos_salvos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas_recrutamento(id) ON DELETE CASCADE,
  candidato_id UUID NOT NULL REFERENCES candidatos_recrutamento(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, candidato_id)
);

CREATE INDEX IF NOT EXISTS idx_candidatos_salvos_empresa ON candidatos_salvos(empresa_id);

ALTER TABLE candidatos_salvos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Empresas gerenciam salvos" ON candidatos_salvos;
CREATE POLICY "Empresas gerenciam salvos" ON candidatos_salvos
  FOR ALL USING (
    empresa_id IN (
      SELECT id FROM empresas_recrutamento WHERE auth_user_id = auth.uid()
    )
  );

-- =============================================
-- 6. FUNÇÃO REGISTRAR VISUALIZAÇÃO
-- =============================================

CREATE OR REPLACE FUNCTION registrar_visualizacao_perfil(
  p_candidato_id UUID,
  p_empresa_id UUID
) RETURNS void AS $$
BEGIN
  -- Inserir visualização (ignora se já existe hoje)
  INSERT INTO visualizacoes_perfil (candidato_id, empresa_id)
  VALUES (p_candidato_id, p_empresa_id)
  ON CONFLICT DO NOTHING;

  -- Atualizar contador
  UPDATE candidatos_recrutamento
  SET total_visualizacoes = (
    SELECT COUNT(*) FROM visualizacoes_perfil WHERE candidato_id = p_candidato_id
  )
  WHERE id = p_candidato_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. GRANTS
-- =============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON destaques_candidato TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON midias_destaque TO authenticated;
GRANT SELECT, INSERT ON visualizacoes_perfil TO authenticated;
GRANT SELECT, INSERT, DELETE ON candidatos_salvos TO authenticated;
GRANT EXECUTE ON FUNCTION registrar_visualizacao_perfil TO authenticated;

-- Refresh schema
NOTIFY pgrst, 'reload schema';

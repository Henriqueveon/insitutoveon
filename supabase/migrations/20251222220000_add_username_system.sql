-- =====================================================
-- SISTEMA DE USERNAME (@) PARA CANDIDATOS E EMPRESAS
-- =====================================================

-- Adicionar username para candidatos
ALTER TABLE candidatos_recrutamento
ADD COLUMN IF NOT EXISTS username VARCHAR(20) UNIQUE;

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_candidatos_username
ON candidatos_recrutamento(username);

COMMENT ON COLUMN candidatos_recrutamento.username IS
'Username único do candidato (@usuario). Apenas letras minúsculas, números, ponto e underline. 3-20 caracteres.';

-- Adicionar username para empresas
ALTER TABLE empresas_recrutamento
ADD COLUMN IF NOT EXISTS username VARCHAR(20) UNIQUE;

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_empresas_username
ON empresas_recrutamento(username);

COMMENT ON COLUMN empresas_recrutamento.username IS
'Username único da empresa (@usuario). Apenas letras minúsculas, números, ponto e underline. 3-20 caracteres.';

-- Função para verificar disponibilidade do username
CREATE OR REPLACE FUNCTION verificar_username_disponivel(
  p_username VARCHAR(20),
  p_tipo VARCHAR(10),
  p_id_atual UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_existe_candidato BOOLEAN;
  v_existe_empresa BOOLEAN;
BEGIN
  -- Verificar em candidatos
  SELECT EXISTS (
    SELECT 1 FROM candidatos_recrutamento
    WHERE username = p_username
    AND (p_id_atual IS NULL OR id != p_id_atual)
  ) INTO v_existe_candidato;

  -- Verificar em empresas
  SELECT EXISTS (
    SELECT 1 FROM empresas_recrutamento
    WHERE username = p_username
    AND (p_id_atual IS NULL OR id != p_id_atual)
  ) INTO v_existe_empresa;

  -- Username disponível se não existe em nenhuma tabela
  RETURN NOT (v_existe_candidato OR v_existe_empresa);
END;
$$ LANGUAGE plpgsql;

-- Função para buscar por username
CREATE OR REPLACE FUNCTION buscar_por_username(p_username VARCHAR(20))
RETURNS TABLE(
  id UUID,
  tipo VARCHAR(10),
  nome TEXT,
  username VARCHAR(20),
  foto_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    'candidato'::VARCHAR(10) as tipo,
    c.nome_completo as nome,
    c.username,
    c.foto_url
  FROM candidatos_recrutamento c
  WHERE c.username ILIKE '%' || p_username || '%'

  UNION ALL

  SELECT
    e.id,
    'empresa'::VARCHAR(10) as tipo,
    e.nome_fantasia as nome,
    e.username,
    e.socio_foto_url as foto_url
  FROM empresas_recrutamento e
  WHERE e.username ILIKE '%' || p_username || '%'

  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

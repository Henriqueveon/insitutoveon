-- Adicionar coluna de capa aos destaques do candidato
ALTER TABLE destaques_candidato
ADD COLUMN IF NOT EXISTS capa_url TEXT;

-- Comentário explicativo
COMMENT ON COLUMN destaques_candidato.capa_url IS 'URL da imagem de capa do destaque (exibida no círculo)';

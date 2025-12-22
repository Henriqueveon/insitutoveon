-- =====================================================
-- Adicionar colunas para disponibilidade de início
-- =====================================================

-- Adicionar coluna tipo de disponibilidade
ALTER TABLE candidatos_recrutamento
ADD COLUMN IF NOT EXISTS disponibilidade_tipo VARCHAR(20) DEFAULT 'imediata';

-- Adicionar coluna data específica
ALTER TABLE candidatos_recrutamento
ADD COLUMN IF NOT EXISTS disponibilidade_data DATE;

-- Comentários explicativos
COMMENT ON COLUMN candidatos_recrutamento.disponibilidade_tipo IS
'Tipo de disponibilidade: imediata, em_30_dias, a_combinar, a_partir_de';

COMMENT ON COLUMN candidatos_recrutamento.disponibilidade_data IS
'Data específica quando disponibilidade_tipo = a_partir_de';

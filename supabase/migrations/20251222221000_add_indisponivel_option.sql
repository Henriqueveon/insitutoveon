-- =====================================================
-- Adicionar opção "indisponível" na disponibilidade
-- =====================================================

-- Nota: Como não havia constraint anterior, apenas documentando
-- que os valores aceitos são:
-- imediata, em_30_dias, a_combinar, a_partir_de, indisponivel

COMMENT ON COLUMN candidatos_recrutamento.disponibilidade_tipo IS
'Tipo de disponibilidade: imediata, em_30_dias, a_combinar, a_partir_de, indisponivel';

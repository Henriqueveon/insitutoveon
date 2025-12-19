-- Migration: Adicionar campos de confiabilidade e métricas de qualidade
-- Data: 2024-12-12
-- Descrição: Adiciona campos para armazenar score de confiabilidade, flags detectadas e métricas de tempo

-- Adicionar campos de confiabilidade na tabela candidatos_disc
ALTER TABLE public.candidatos_disc
ADD COLUMN IF NOT EXISTS confiabilidade_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS confiabilidade_nivel VARCHAR(20) DEFAULT 'ALTA',
ADD COLUMN IF NOT EXISTS flags_detectadas JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tempo_total_segundos INTEGER,
ADD COLUMN IF NOT EXISTS tempo_por_questao JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS respostas_controle JSONB DEFAULT '{}'::jsonb;

-- Criar índice para consultas por confiabilidade
CREATE INDEX IF NOT EXISTS idx_candidatos_confiabilidade
ON public.candidatos_disc(confiabilidade_nivel);

-- Comentários para documentação
COMMENT ON COLUMN public.candidatos_disc.confiabilidade_score IS 'Score de confiabilidade do teste (0-100)';
COMMENT ON COLUMN public.candidatos_disc.confiabilidade_nivel IS 'Nível de confiabilidade: ALTA, MEDIA, BAIXA, SUSPEITA';
COMMENT ON COLUMN public.candidatos_disc.flags_detectadas IS 'Array de flags detectadas durante o teste';
COMMENT ON COLUMN public.candidatos_disc.tempo_total_segundos IS 'Tempo total para completar o teste em segundos';
COMMENT ON COLUMN public.candidatos_disc.tempo_por_questao IS 'Objeto JSON com tempo gasto em cada questão';
COMMENT ON COLUMN public.candidatos_disc.respostas_controle IS 'Respostas dos itens de controle de qualidade';

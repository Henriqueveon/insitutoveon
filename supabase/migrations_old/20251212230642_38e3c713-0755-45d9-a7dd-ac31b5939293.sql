-- Add reliability columns to candidatos_disc
ALTER TABLE public.candidatos_disc
ADD COLUMN IF NOT EXISTS confiabilidade_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS confiabilidade_nivel VARCHAR(20) DEFAULT 'ALTA',
ADD COLUMN IF NOT EXISTS flags_detectadas TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tempo_total_segundos INTEGER,
ADD COLUMN IF NOT EXISTS tempo_por_questao JSONB DEFAULT '{}'::jsonb;

-- Create metricas_teste table for detailed test validation metrics
CREATE TABLE IF NOT EXISTS public.metricas_teste (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID REFERENCES public.candidatos_disc(id) ON DELETE CASCADE,
  
  -- Time metrics
  tempo_total_segundos INTEGER,
  tempo_por_questao JSONB DEFAULT '{}'::jsonb,
  tempo_medio_ms INTEGER,
  
  -- Control results
  ctrl_atencao_passou BOOLEAN DEFAULT TRUE,
  ctrl_desejabilidade_passou BOOLEAN DEFAULT TRUE,
  ctrl_consistencia_passou BOOLEAN DEFAULT TRUE,
  ctrl_tempo_passou BOOLEAN DEFAULT TRUE,
  
  -- Control details
  ctrl_atencao_resposta VARCHAR(50),
  ctrl_desejabilidade_resposta VARCHAR(50),
  ctrl_consistencia_resposta VARCHAR(50),
  ctrl_consistencia_questao_comparada INTEGER,
  ctrl_consistencia_resposta_original VARCHAR(50),
  
  -- Reliability score
  confiabilidade_score INTEGER DEFAULT 100,
  confiabilidade_nivel VARCHAR(20) DEFAULT 'ALTA',
  flags_detectadas TEXT[] DEFAULT '{}',
  
  -- Raw data for factorial analysis
  respostas_brutas JSONB,
  scores_disc_brutos JSONB,
  scores_spranger_brutos JSONB,
  
  -- Detected patterns
  padrao_flat_profile BOOLEAN DEFAULT FALSE,
  padrao_contraditorio BOOLEAN DEFAULT FALSE,
  padrao_tempo_rapido BOOLEAN DEFAULT FALSE,
  padrao_tempo_lento BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  versao_teste VARCHAR(10) DEFAULT '2.0',
  dispositivo VARCHAR(50),
  navegador VARCHAR(100),
  ip_hash VARCHAR(64),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_metricas_candidato ON public.metricas_teste(candidato_id);
CREATE INDEX IF NOT EXISTS idx_metricas_confiabilidade ON public.metricas_teste(confiabilidade_nivel);
CREATE INDEX IF NOT EXISTS idx_metricas_versao ON public.metricas_teste(versao_teste);
CREATE INDEX IF NOT EXISTS idx_metricas_created ON public.metricas_teste(created_at);

-- Enable RLS
ALTER TABLE public.metricas_teste ENABLE ROW LEVEL SECURITY;

-- Policies for metricas_teste
CREATE POLICY "Métricas públicas para leitura" ON public.metricas_teste
  FOR SELECT USING (true);

CREATE POLICY "Inserção de métricas" ON public.metricas_teste
  FOR INSERT WITH CHECK (true);

-- View for aggregated statistics
CREATE OR REPLACE VIEW public.estatisticas_validacao AS
SELECT
  COUNT(*) as total_testes,
  COUNT(*) FILTER (WHERE confiabilidade_nivel = 'ALTA') as testes_alta,
  COUNT(*) FILTER (WHERE confiabilidade_nivel = 'MEDIA') as testes_media,
  COUNT(*) FILTER (WHERE confiabilidade_nivel = 'BAIXA') as testes_baixa,
  COUNT(*) FILTER (WHERE confiabilidade_nivel = 'SUSPEITA') as testes_suspeita,
  ROUND(AVG(confiabilidade_score)::numeric, 1) as score_medio,
  ROUND(AVG(tempo_total_segundos)::numeric, 0) as tempo_medio_segundos,
  ROUND(AVG(tempo_medio_ms)::numeric, 0) as tempo_medio_por_questao_ms,
  COUNT(*) FILTER (WHERE ctrl_atencao_passou = false) as falhas_atencao,
  COUNT(*) FILTER (WHERE ctrl_desejabilidade_passou = false) as falhas_desejabilidade,
  COUNT(*) FILTER (WHERE ctrl_consistencia_passou = false) as falhas_consistencia,
  COUNT(*) FILTER (WHERE ctrl_tempo_passou = false) as falhas_tempo,
  versao_teste
FROM public.metricas_teste
GROUP BY versao_teste;
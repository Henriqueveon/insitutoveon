-- Migration: Criar tabela de métricas detalhadas para validação científica
-- Data: 2024-12-12
-- Descrição: Armazena dados detalhados de cada teste para análise psicométrica

-- Tabela de métricas detalhadas por teste
CREATE TABLE IF NOT EXISTS public.metricas_teste (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidato_id UUID REFERENCES public.candidatos_disc(id) ON DELETE CASCADE,

  -- Tempo
  tempo_total_segundos INTEGER,
  tempo_por_questao JSONB DEFAULT '{}'::jsonb,  -- {"disc_1": 5000, "disc_2": 8000, ...}
  tempo_medio_ms INTEGER,

  -- Resultados dos Controles
  ctrl_atencao_passou BOOLEAN DEFAULT TRUE,
  ctrl_desejabilidade_passou BOOLEAN DEFAULT TRUE,
  ctrl_consistencia_passou BOOLEAN DEFAULT TRUE,
  ctrl_tempo_passou BOOLEAN DEFAULT TRUE,

  -- Detalhes dos controles
  ctrl_atencao_resposta VARCHAR(50),
  ctrl_desejabilidade_resposta VARCHAR(50),
  ctrl_consistencia_resposta VARCHAR(50),
  ctrl_consistencia_questao_comparada INTEGER,
  ctrl_consistencia_resposta_original VARCHAR(50),

  -- Score de confiabilidade
  confiabilidade_score INTEGER DEFAULT 100,  -- 0-100
  confiabilidade_nivel VARCHAR(20) DEFAULT 'ALTA',  -- ALTA, MEDIA, BAIXA, SUSPEITA
  flags_detectadas TEXT[] DEFAULT '{}',

  -- Dados para análise fatorial
  respostas_brutas JSONB,  -- Todas respostas na ordem {"disc_1": {"mais": "D", "menos": "S"}, ...}
  scores_disc_brutos JSONB,  -- {"D": 15, "I": 12, "S": 8, "C": 10}
  scores_spranger_brutos JSONB,  -- {"TEO": 25, "ECO": 30, ...}

  -- Padrões detectados
  padrao_flat_profile BOOLEAN DEFAULT FALSE,
  padrao_contraditorio BOOLEAN DEFAULT FALSE,
  padrao_tempo_rapido BOOLEAN DEFAULT FALSE,
  padrao_tempo_lento BOOLEAN DEFAULT FALSE,

  -- Metadados
  versao_teste VARCHAR(10) DEFAULT '2.0',
  dispositivo VARCHAR(50),  -- mobile, desktop, tablet
  navegador VARCHAR(100),
  ip_hash VARCHAR(64),  -- Hash do IP para detectar múltiplos testes

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para análise e consultas
CREATE INDEX IF NOT EXISTS idx_metricas_candidato ON public.metricas_teste(candidato_id);
CREATE INDEX IF NOT EXISTS idx_metricas_confiabilidade ON public.metricas_teste(confiabilidade_nivel);
CREATE INDEX IF NOT EXISTS idx_metricas_versao ON public.metricas_teste(versao_teste);
CREATE INDEX IF NOT EXISTS idx_metricas_created ON public.metricas_teste(created_at);

-- Comentários para documentação
COMMENT ON TABLE public.metricas_teste IS 'Métricas detalhadas de cada teste para validação científica e análise psicométrica';
COMMENT ON COLUMN public.metricas_teste.confiabilidade_score IS 'Score de 0-100 indicando a confiabilidade das respostas';
COMMENT ON COLUMN public.metricas_teste.flags_detectadas IS 'Array de flags de problemas detectados durante o teste';
COMMENT ON COLUMN public.metricas_teste.respostas_brutas IS 'Todas as respostas em formato JSON para análise fatorial';

-- Habilitar RLS
ALTER TABLE public.metricas_teste ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Métricas públicas para leitura" ON public.metricas_teste
  FOR SELECT USING (true);

CREATE POLICY "Inserção de métricas" ON public.metricas_teste
  FOR INSERT WITH CHECK (true);

-- View para estatísticas agregadas (usado no dashboard)
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

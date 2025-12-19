-- Add all missing columns to existing tables

-- diferenciais_empresa columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diferenciais_empresa' AND column_name = 'categoria') THEN
    ALTER TABLE diferenciais_empresa ADD COLUMN categoria TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diferenciais_empresa' AND column_name = 'nome') THEN
    ALTER TABLE diferenciais_empresa ADD COLUMN nome TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diferenciais_empresa' AND column_name = 'icone') THEN
    ALTER TABLE diferenciais_empresa ADD COLUMN icone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diferenciais_empresa' AND column_name = 'ordem') THEN
    ALTER TABLE diferenciais_empresa ADD COLUMN ordem INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diferenciais_empresa' AND column_name = 'ativo') THEN
    ALTER TABLE diferenciais_empresa ADD COLUMN ativo BOOLEAN DEFAULT true;
  END IF;
END $$;

-- pacotes_creditos columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pacotes_creditos' AND column_name = 'badge') THEN
    ALTER TABLE pacotes_creditos ADD COLUMN badge TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pacotes_creditos' AND column_name = 'preco_original') THEN
    ALTER TABLE pacotes_creditos ADD COLUMN preco_original DECIMAL(10,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pacotes_creditos' AND column_name = 'economia') THEN
    ALTER TABLE pacotes_creditos ADD COLUMN economia DECIMAL(5,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pacotes_creditos' AND column_name = 'destaque') THEN
    ALTER TABLE pacotes_creditos ADD COLUMN destaque BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pacotes_creditos' AND column_name = 'cor_botao') THEN
    ALTER TABLE pacotes_creditos ADD COLUMN cor_botao TEXT DEFAULT 'gray';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pacotes_creditos' AND column_name = 'ordem') THEN
    ALTER TABLE pacotes_creditos ADD COLUMN ordem INTEGER DEFAULT 0;
  END IF;
END $$;

-- analistas columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'cpf_cnpj') THEN
    ALTER TABLE analistas ADD COLUMN cpf_cnpj TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'updated_at') THEN
    ALTER TABLE analistas ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- empresas_recrutamento columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'aceite_lgpd') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN aceite_lgpd BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'aceite_lgpd_data') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN aceite_lgpd_data TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'aceite_termos') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN aceite_termos BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'aceite_termos_data') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN aceite_termos_data TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'responsavel_nome') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN responsavel_nome TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'responsavel_cargo') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN responsavel_cargo TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'socio_funcao') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN socio_funcao TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'verificado') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN verificado BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'cadastro_completo') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN cadastro_completo BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'fotos_ambiente') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN fotos_ambiente JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'diferenciais') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN diferenciais JSONB DEFAULT '[]';
  END IF;
END $$;

-- candidatos_recrutamento columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'aceita_mudanca') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN aceita_mudanca BOOLEAN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'aceita_viajar') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN aceita_viajar BOOLEAN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'estado_civil') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN estado_civil TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'tem_filhos') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN tem_filhos BOOLEAN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'quantidade_filhos') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN quantidade_filhos INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'idade_filhos') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN idade_filhos TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'valores_empresa') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN valores_empresa TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'perfil_disc_detalhado') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN perfil_disc_detalhado JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'perfil_valores') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN perfil_valores JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'perfil_natural') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN perfil_natural TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'disc_completado_em') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN disc_completado_em TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'disc_resultado_json') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN disc_resultado_json JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'confiabilidade') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN confiabilidade INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'confiabilidade_score') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN confiabilidade_score INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'confiabilidade_nivel') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN confiabilidade_nivel TEXT DEFAULT 'baixa';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'confiabilidade_flags') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN confiabilidade_flags JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'etapas_json') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN etapas_json JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'recrutado_por_empresa_id') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN recrutado_por_empresa_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'recrutado_data') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN recrutado_data TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'indicado_por_empresa_id') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN indicado_por_empresa_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'indicado_por_candidato_id') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN indicado_por_candidato_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'slug_publico') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN slug_publico TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'curriculo_publico') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN curriculo_publico BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'visualizacoes_perfil') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN visualizacoes_perfil INTEGER DEFAULT 0;
  END IF;
END $$;

-- codigos_indicacao columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'codigos_indicacao' AND column_name = 'creditos_ganhos') THEN
    ALTER TABLE codigos_indicacao ADD COLUMN creditos_ganhos DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

-- Create candidatos_disc table if it doesn't exist
CREATE TABLE IF NOT EXISTS candidatos_disc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  telefone_whatsapp TEXT,
  email TEXT,
  cargo_atual TEXT,
  empresa_instagram TEXT,
  perfil_natural TEXT,
  perfil_adaptado TEXT,
  perfil_tipo TEXT,
  pdf_url TEXT,
  status TEXT DEFAULT 'pendente',
  analista_id UUID REFERENCES analistas(id),
  confiabilidade_score INTEGER DEFAULT 100,
  confiabilidade_nivel TEXT DEFAULT 'ALTA',
  flags_detectadas JSONB DEFAULT '[]',
  tempo_total_segundos INTEGER,
  tempo_por_questao JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on candidatos_disc
ALTER TABLE candidatos_disc ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for candidatos_disc
DROP POLICY IF EXISTS "disc_public_read" ON candidatos_disc;
CREATE POLICY "disc_public_read" ON candidatos_disc FOR SELECT USING (true);

DROP POLICY IF EXISTS "disc_insert" ON candidatos_disc;
CREATE POLICY "disc_insert" ON candidatos_disc FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "disc_update" ON candidatos_disc;
CREATE POLICY "disc_update" ON candidatos_disc FOR UPDATE USING (true);

DROP POLICY IF EXISTS "disc_delete" ON candidatos_disc;
CREATE POLICY "disc_delete" ON candidatos_disc FOR DELETE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_disc_analista ON candidatos_disc(analista_id);
CREATE INDEX IF NOT EXISTS idx_disc_status ON candidatos_disc(status);
CREATE INDEX IF NOT EXISTS idx_disc_email ON candidatos_disc(email);

SELECT 'All columns added successfully!' as resultado;

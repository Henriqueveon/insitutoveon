ALTER TABLE diferenciais_empresa ADD COLUMN IF NOT EXISTS categoria TEXT;
ALTER TABLE diferenciais_empresa ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE diferenciais_empresa ADD COLUMN IF NOT EXISTS icone TEXT;
ALTER TABLE diferenciais_empresa ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;
ALTER TABLE diferenciais_empresa ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE pacotes_creditos ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE pacotes_creditos ADD COLUMN IF NOT EXISTS cor_botao TEXT DEFAULT 'gray';
ALTER TABLE pacotes_creditos ADD COLUMN IF NOT EXISTS preco_por_entrevista DECIMAL(10,2);
ALTER TABLE pacotes_creditos ADD COLUMN IF NOT EXISTS preco_original DECIMAL(10,2);
ALTER TABLE pacotes_creditos ADD COLUMN IF NOT EXISTS economia DECIMAL(5,2) DEFAULT 0;
ALTER TABLE analistas ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;
ALTER TABLE analistas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS aceite_lgpd BOOLEAN DEFAULT false;
ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS aceite_lgpd_data TIMESTAMPTZ;
ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS aceite_termos BOOLEAN DEFAULT false;
ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS aceite_termos_data TIMESTAMPTZ;
ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT false;
ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS cadastro_completo BOOLEAN DEFAULT false;
ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS responsavel_nome TEXT;
ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS responsavel_cargo TEXT;
ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS socio_funcao TEXT;
ALTER TABLE empresas_recrutamento ADD COLUMN IF NOT EXISTS total_acessos_link INTEGER DEFAULT 0;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS aceita_mudanca BOOLEAN;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS aceita_viajar BOOLEAN;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS estado_civil TEXT;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS tem_filhos BOOLEAN;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS quantidade_filhos INTEGER;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS idade_filhos TEXT;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS pretensao_salarial TEXT;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS valores_empresa TEXT;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS areas_interesse JSONB DEFAULT '[]';
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS objetivo_profissional TEXT;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS documento_url TEXT;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS documento_tipo TEXT;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS documento_verificado BOOLEAN DEFAULT false;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS perfil_disc_detalhado JSONB;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS perfil_valores JSONB;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS perfil_natural TEXT;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS disc_completado_em TIMESTAMPTZ;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS disc_resultado_json JSONB;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS confiabilidade INTEGER DEFAULT 0;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS confiabilidade_score INTEGER DEFAULT 0;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS confiabilidade_nivel TEXT DEFAULT 'baixa';
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS confiabilidade_flags JSONB DEFAULT '[]';
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS etapa_cadastro INTEGER DEFAULT 1;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS etapas_completadas INTEGER DEFAULT 0;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS etapas_json JSONB;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS recrutado_por_empresa_id UUID;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS recrutado_data TIMESTAMPTZ;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS indicado_por_empresa_id UUID;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS indicado_por_candidato_id UUID;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS slug_publico TEXT;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS curriculo_publico BOOLEAN DEFAULT false;
ALTER TABLE candidatos_recrutamento ADD COLUMN IF NOT EXISTS visualizacoes_perfil INTEGER DEFAULT 0;
ALTER TABLE codigos_indicacao ADD COLUMN IF NOT EXISTS creditos_ganhos DECIMAL(10,2) DEFAULT 0;
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
    analista_id UUID,
    confiabilidade_score INTEGER DEFAULT 100,
    confiabilidade_nivel TEXT DEFAULT 'ALTA',
    flags_detectadas JSONB DEFAULT '[]',
    tempo_total_segundos INTEGER,
    tempo_por_questao JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
ALTER TABLE candidatos_disc ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "disc_public_read" ON candidatos_disc;
CREATE POLICY "disc_public_read" ON candidatos_disc FOR SELECT USING (true);
DROP POLICY IF EXISTS "disc_insert" ON candidatos_disc;
CREATE POLICY "disc_insert" ON candidatos_disc FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "disc_update" ON candidatos_disc;
CREATE POLICY "disc_update" ON candidatos_disc FOR UPDATE USING (true);
DROP POLICY IF EXISTS "disc_delete" ON candidatos_disc;
CREATE POLICY "disc_delete" ON candidatos_disc FOR DELETE USING (true);
-- =====================================================
-- SQL COMPLETO PARA O SISTEMA DE RECRUTAMENTO VEON
-- =====================================================

-- =====================================================
-- 1. ADICIONAR COLUNAS em vagas_recrutamento
-- =====================================================

ALTER TABLE public.vagas_recrutamento ADD COLUMN IF NOT EXISTS faixa_salarial TEXT;
ALTER TABLE public.vagas_recrutamento ADD COLUMN IF NOT EXISTS salario_minimo NUMERIC;
ALTER TABLE public.vagas_recrutamento ADD COLUMN IF NOT EXISTS salario_maximo NUMERIC;
ALTER TABLE public.vagas_recrutamento ADD COLUMN IF NOT EXISTS carga_horaria TEXT;
ALTER TABLE public.vagas_recrutamento ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE public.vagas_recrutamento ADD COLUMN IF NOT EXISTS perfil_disc_desejado TEXT;
ALTER TABLE public.vagas_recrutamento ADD COLUMN IF NOT EXISTS areas_conhecimento TEXT[] DEFAULT '{}';
ALTER TABLE public.vagas_recrutamento ADD COLUMN IF NOT EXISTS escolaridade_minima TEXT;
ALTER TABLE public.vagas_recrutamento ADD COLUMN IF NOT EXISTS experiencia_minima INTEGER DEFAULT 0;
ALTER TABLE public.vagas_recrutamento ADD COLUMN IF NOT EXISTS requer_cnh BOOLEAN DEFAULT FALSE;
ALTER TABLE public.vagas_recrutamento ADD COLUMN IF NOT EXISTS categoria_cnh_requerida TEXT;
ALTER TABLE public.vagas_recrutamento ADD COLUMN IF NOT EXISTS requer_veiculo BOOLEAN DEFAULT FALSE;
ALTER TABLE public.vagas_recrutamento ADD COLUMN IF NOT EXISTS quantidade_vagas INTEGER DEFAULT 1;
ALTER TABLE public.vagas_recrutamento ADD COLUMN IF NOT EXISTS urgente BOOLEAN DEFAULT FALSE;
ALTER TABLE public.vagas_recrutamento ADD COLUMN IF NOT EXISTS encerrada_em TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 2. CRIAR TABELA propostas_recrutamento
-- =====================================================

CREATE TABLE IF NOT EXISTS public.propostas_recrutamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas_recrutamento(id) ON DELETE CASCADE,
  candidato_id UUID REFERENCES public.candidatos_recrutamento(id) ON DELETE CASCADE,
  vaga_id UUID REFERENCES public.vagas_recrutamento(id) ON DELETE SET NULL,
  salario_oferecido NUMERIC,
  mensagem TEXT,
  status TEXT DEFAULT 'pendente',
  motivo_recusa TEXT,
  observacao_recusa TEXT,
  data_entrevista DATE,
  horario_entrevista TIME,
  tipo_entrevista TEXT,
  local_entrevista TEXT,
  link_entrevista TEXT,
  data_contratacao DATE,
  salario_contratacao NUMERIC,
  pago BOOLEAN DEFAULT FALSE,
  valor_pago NUMERIC,
  data_pagamento TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  respondida_em TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_propostas_empresa ON public.propostas_recrutamento(empresa_id);
CREATE INDEX IF NOT EXISTS idx_propostas_candidato ON public.propostas_recrutamento(candidato_id);
CREATE INDEX IF NOT EXISTS idx_propostas_status ON public.propostas_recrutamento(status);

ALTER TABLE public.propostas_recrutamento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "propostas_all" ON public.propostas_recrutamento;
CREATE POLICY "propostas_all" ON public.propostas_recrutamento FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON public.propostas_recrutamento TO anon, authenticated;

-- =====================================================
-- 3. CRIAR TABELA favoritos_recrutamento
-- =====================================================

CREATE TABLE IF NOT EXISTS public.favoritos_recrutamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas_recrutamento(id) ON DELETE CASCADE,
  candidato_id UUID REFERENCES public.candidatos_recrutamento(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, candidato_id)
);

CREATE INDEX IF NOT EXISTS idx_favoritos_empresa ON public.favoritos_recrutamento(empresa_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_candidato ON public.favoritos_recrutamento(candidato_id);

ALTER TABLE public.favoritos_recrutamento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "favoritos_all" ON public.favoritos_recrutamento;
CREATE POLICY "favoritos_all" ON public.favoritos_recrutamento FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON public.favoritos_recrutamento TO anon, authenticated;

-- =====================================================
-- 4. CRIAR TABELA notificacoes
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinatario_id UUID NOT NULL,
  tipo_destinatario TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo_notificacao TEXT NOT NULL,
  dados JSONB DEFAULT '{}',
  lida BOOLEAN DEFAULT FALSE,
  lida_em TIMESTAMP WITH TIME ZONE,
  enviada_whatsapp BOOLEAN DEFAULT FALSE,
  enviada_whatsapp_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_destinatario ON public.notificacoes(destinatario_id);
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notificacoes_all" ON public.notificacoes;
CREATE POLICY "notificacoes_all" ON public.notificacoes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON public.notificacoes TO anon, authenticated;

-- =====================================================
-- 5. ADICIONAR COLUNAS em candidatos_recrutamento
-- =====================================================

ALTER TABLE public.candidatos_recrutamento ADD COLUMN IF NOT EXISTS curriculo_url TEXT;
ALTER TABLE public.candidatos_recrutamento ADD COLUMN IF NOT EXISTS instituicao TEXT;
ALTER TABLE public.candidatos_recrutamento ADD COLUMN IF NOT EXISTS ano_conclusao TEXT;
ALTER TABLE public.candidatos_recrutamento ADD COLUMN IF NOT EXISTS categoria_cnh TEXT;
ALTER TABLE public.candidatos_recrutamento ADD COLUMN IF NOT EXISTS perfil_disc_detalhado JSONB;
ALTER TABLE public.candidatos_recrutamento ADD COLUMN IF NOT EXISTS teste_disc_concluido BOOLEAN DEFAULT FALSE;
ALTER TABLE public.candidatos_recrutamento ADD COLUMN IF NOT EXISTS teste_disc_data TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.candidatos_recrutamento ADD COLUMN IF NOT EXISTS etapa_cadastro INTEGER DEFAULT 1;
ALTER TABLE public.candidatos_recrutamento ADD COLUMN IF NOT EXISTS cadastro_completo BOOLEAN DEFAULT FALSE;
ALTER TABLE public.candidatos_recrutamento ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE public.candidatos_recrutamento ADD COLUMN IF NOT EXISTS logradouro TEXT;
ALTER TABLE public.candidatos_recrutamento ADD COLUMN IF NOT EXISTS numero TEXT;
ALTER TABLE public.candidatos_recrutamento ADD COLUMN IF NOT EXISTS complemento TEXT;

-- =====================================================
-- 6. ADICIONAR COLUNAS em transacoes_recrutamento
-- =====================================================

ALTER TABLE public.transacoes_recrutamento ADD COLUMN IF NOT EXISTS candidato_id UUID;
ALTER TABLE public.transacoes_recrutamento ADD COLUMN IF NOT EXISTS proposta_id UUID;

-- =====================================================
-- 7. CRIAR TABELA entrevistas_recrutamento
-- =====================================================

CREATE TABLE IF NOT EXISTS public.entrevistas_recrutamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id UUID REFERENCES public.propostas_recrutamento(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES public.empresas_recrutamento(id) ON DELETE CASCADE,
  candidato_id UUID REFERENCES public.candidatos_recrutamento(id) ON DELETE CASCADE,
  vaga_id UUID REFERENCES public.vagas_recrutamento(id) ON DELETE SET NULL,
  data_entrevista DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME,
  tipo TEXT NOT NULL,
  local TEXT,
  link_reuniao TEXT,
  status TEXT DEFAULT 'agendada',
  feedback_empresa TEXT,
  nota_empresa INTEGER,
  feedback_candidato TEXT,
  nota_candidato INTEGER,
  resultado TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.entrevistas_recrutamento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "entrevistas_all" ON public.entrevistas_recrutamento;
CREATE POLICY "entrevistas_all" ON public.entrevistas_recrutamento FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT ALL ON public.entrevistas_recrutamento TO anon, authenticated;

-- =====================================================
-- 8. CORRIGIR POLÍTICAS RLS DAS TABELAS EXISTENTES
-- =====================================================

-- Candidatos
DROP POLICY IF EXISTS "Candidatos select all" ON public.candidatos_recrutamento;
CREATE POLICY "Candidatos select all" ON public.candidatos_recrutamento FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Candidatos update all" ON public.candidatos_recrutamento;
CREATE POLICY "Candidatos update all" ON public.candidatos_recrutamento FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Empresas
DROP POLICY IF EXISTS "Empresas select all" ON public.empresas_recrutamento;
CREATE POLICY "Empresas select all" ON public.empresas_recrutamento FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Empresas update all" ON public.empresas_recrutamento;
CREATE POLICY "Empresas update all" ON public.empresas_recrutamento FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Vagas
DROP POLICY IF EXISTS "Vagas ativas são públicas" ON public.vagas_recrutamento;
DROP POLICY IF EXISTS "Vagas select all" ON public.vagas_recrutamento;
CREATE POLICY "Vagas select all" ON public.vagas_recrutamento FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Vagas insert all" ON public.vagas_recrutamento;
CREATE POLICY "Vagas insert all" ON public.vagas_recrutamento FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Vagas update all" ON public.vagas_recrutamento;
CREATE POLICY "Vagas update all" ON public.vagas_recrutamento FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Vagas delete all" ON public.vagas_recrutamento;
CREATE POLICY "Vagas delete all" ON public.vagas_recrutamento FOR DELETE TO anon, authenticated USING (true);

-- Transações
DROP POLICY IF EXISTS "Transacoes all" ON public.transacoes_recrutamento;
CREATE POLICY "Transacoes all" ON public.transacoes_recrutamento FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 9. GRANTS GERAIS
-- =====================================================

GRANT ALL ON public.empresas_recrutamento TO anon, authenticated;
GRANT ALL ON public.candidatos_recrutamento TO anon, authenticated;
GRANT ALL ON public.vagas_recrutamento TO anon, authenticated;
GRANT ALL ON public.transacoes_recrutamento TO anon, authenticated;
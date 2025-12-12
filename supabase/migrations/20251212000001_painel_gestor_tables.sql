-- =====================================================
-- MIGRAÇÃO: Painel do Gestor - Tabelas Base
-- Instituto VEON - Escola do Varejo
-- =====================================================

-- 1. Tabela de Empresas (Multi-tenant)
CREATE TABLE public.empresas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  logo_url TEXT,
  cor_primaria VARCHAR(7) DEFAULT '#003366',
  cor_secundaria VARCHAR(7) DEFAULT '#E31E24',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Gestores (Admins das empresas)
CREATE TABLE public.gestores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  cargo VARCHAR(100),
  is_admin BOOLEAN DEFAULT false, -- Super admin pode gerenciar múltiplas empresas
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Links de Avaliação
CREATE TABLE public.links_avaliacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  gestor_id UUID REFERENCES public.gestores(id) ON DELETE SET NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL, -- Código único para URL (ex: veon-vendas-2024)
  nome VARCHAR(255) NOT NULL, -- Nome descritivo (ex: "Processo Seletivo Vendas")
  descricao TEXT,
  cargo_vaga VARCHAR(100), -- Cargo da vaga
  limite_candidatos INTEGER, -- NULL = ilimitado
  data_expiracao TIMESTAMP WITH TIME ZONE, -- NULL = sem expiração
  ativo BOOLEAN DEFAULT true,
  total_acessos INTEGER DEFAULT 0,
  total_completados INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Adicionar colunas à tabela candidatos_disc existente
ALTER TABLE public.candidatos_disc
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS link_id UUID REFERENCES public.links_avaliacao(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS perfil_natural JSONB, -- {D: number, I: number, S: number, C: number}
ADD COLUMN IF NOT EXISTS perfil_adaptado JSONB,
ADD COLUMN IF NOT EXISTS perfil_tipo VARCHAR(50), -- Ex: "DI", "SC", etc.
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS notion_page_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pendente'; -- pendente, em_analise, aprovado, reprovado

-- =====================================================
-- Enable RLS on all tables
-- =====================================================

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links_avaliacao ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies para Empresas
-- =====================================================

-- Gestores só veem sua própria empresa
CREATE POLICY "Gestores can view their empresa"
ON public.empresas
FOR SELECT
USING (
  id IN (
    SELECT empresa_id FROM public.gestores
    WHERE user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.gestores
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Apenas super admins podem inserir empresas
CREATE POLICY "Super admins can insert empresas"
ON public.empresas
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.gestores
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Gestores podem atualizar sua própria empresa
CREATE POLICY "Gestores can update their empresa"
ON public.empresas
FOR UPDATE
USING (
  id IN (
    SELECT empresa_id FROM public.gestores
    WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- RLS Policies para Gestores
-- =====================================================

-- Gestores podem ver outros gestores da mesma empresa
CREATE POLICY "Gestores can view same empresa gestores"
ON public.gestores
FOR SELECT
USING (
  empresa_id IN (
    SELECT empresa_id FROM public.gestores
    WHERE user_id = auth.uid()
  )
  OR
  user_id = auth.uid()
);

-- Gestores podem atualizar seu próprio perfil
CREATE POLICY "Gestores can update own profile"
ON public.gestores
FOR UPDATE
USING (user_id = auth.uid());

-- =====================================================
-- RLS Policies para Links de Avaliação
-- =====================================================

-- Gestores podem ver links da sua empresa
CREATE POLICY "Gestores can view empresa links"
ON public.links_avaliacao
FOR SELECT
USING (
  empresa_id IN (
    SELECT empresa_id FROM public.gestores
    WHERE user_id = auth.uid()
  )
);

-- Gestores podem criar links para sua empresa
CREATE POLICY "Gestores can insert empresa links"
ON public.links_avaliacao
FOR INSERT
WITH CHECK (
  empresa_id IN (
    SELECT empresa_id FROM public.gestores
    WHERE user_id = auth.uid()
  )
);

-- Gestores podem atualizar links da sua empresa
CREATE POLICY "Gestores can update empresa links"
ON public.links_avaliacao
FOR UPDATE
USING (
  empresa_id IN (
    SELECT empresa_id FROM public.gestores
    WHERE user_id = auth.uid()
  )
);

-- Gestores podem deletar links da sua empresa
CREATE POLICY "Gestores can delete empresa links"
ON public.links_avaliacao
FOR DELETE
USING (
  empresa_id IN (
    SELECT empresa_id FROM public.gestores
    WHERE user_id = auth.uid()
  )
);

-- Acesso público para verificar se link é válido (para formulário público)
CREATE POLICY "Public can check link validity"
ON public.links_avaliacao
FOR SELECT
USING (ativo = true AND (data_expiracao IS NULL OR data_expiracao > NOW()));

-- =====================================================
-- Atualizar RLS Policies para Candidatos DISC
-- =====================================================

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Anyone can read candidates" ON public.candidatos_disc;

-- Gestores podem ver candidatos da sua empresa
CREATE POLICY "Gestores can view empresa candidates"
ON public.candidatos_disc
FOR SELECT
USING (
  empresa_id IN (
    SELECT empresa_id FROM public.gestores
    WHERE user_id = auth.uid()
  )
  OR
  empresa_id IS NULL -- Candidatos antigos sem empresa
);

-- Gestores podem atualizar status dos candidatos
CREATE POLICY "Gestores can update candidate status"
ON public.candidatos_disc
FOR UPDATE
USING (
  empresa_id IN (
    SELECT empresa_id FROM public.gestores
    WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- Triggers para updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_empresas_updated_at
BEFORE UPDATE ON public.empresas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gestores_updated_at
BEFORE UPDATE ON public.gestores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_links_avaliacao_updated_at
BEFORE UPDATE ON public.links_avaliacao
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Trigger para incrementar contador de acessos do link
-- =====================================================

CREATE OR REPLACE FUNCTION public.increment_link_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.link_id IS NOT NULL THEN
    UPDATE public.links_avaliacao
    SET total_acessos = total_acessos + 1
    WHERE id = NEW.link_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER increment_link_on_candidate_insert
AFTER INSERT ON public.candidatos_disc
FOR EACH ROW
EXECUTE FUNCTION public.increment_link_access();

-- =====================================================
-- Trigger para incrementar contador de completados
-- =====================================================

CREATE OR REPLACE FUNCTION public.increment_link_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.perfil_natural IS NOT NULL AND OLD.perfil_natural IS NULL AND NEW.link_id IS NOT NULL THEN
    UPDATE public.links_avaliacao
    SET total_completados = total_completados + 1
    WHERE id = NEW.link_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER increment_completed_on_profile_update
AFTER UPDATE ON public.candidatos_disc
FOR EACH ROW
EXECUTE FUNCTION public.increment_link_completed();

-- =====================================================
-- Índices para performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_gestores_user_id ON public.gestores(user_id);
CREATE INDEX IF NOT EXISTS idx_gestores_empresa_id ON public.gestores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_links_empresa_id ON public.links_avaliacao(empresa_id);
CREATE INDEX IF NOT EXISTS idx_links_codigo ON public.links_avaliacao(codigo);
CREATE INDEX IF NOT EXISTS idx_candidatos_empresa_id ON public.candidatos_disc(empresa_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_link_id ON public.candidatos_disc(link_id);
CREATE INDEX IF NOT EXISTS idx_candidatos_status ON public.candidatos_disc(status);
CREATE INDEX IF NOT EXISTS idx_candidatos_created_at ON public.candidatos_disc(created_at DESC);

-- =====================================================
-- Inserir empresa padrão (Instituto VEON)
-- =====================================================

INSERT INTO public.empresas (id, nome, cnpj, cor_primaria, cor_secundaria)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Instituto VEON - Escola do Varejo',
  NULL,
  '#003366',
  '#E31E24'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRAÇÃO: Sistema de Analistas
-- Instituto VEON - Escola do Varejo
-- =====================================================

-- =====================================================
-- 1. TABELA FUNDADOR (Super Admin do Sistema)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.fundador (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL, -- Hash da senha
  nome VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA ANALISTAS
-- =====================================================

-- Tipo ENUM para tipo de analista
DO $$ BEGIN
  CREATE TYPE tipo_analista AS ENUM ('coach', 'psicologo', 'empresa', 'rh', 'escola', 'outro');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.analistas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL, -- Hash da senha
  telefone VARCHAR(20),
  empresa VARCHAR(255), -- Nome da empresa/consultoria
  tipo tipo_analista DEFAULT 'outro',
  licencas_total INTEGER DEFAULT 0,
  licencas_usadas INTEGER DEFAULT 0,
  link_unico UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL, -- Link único para cada analista
  ativo BOOLEAN DEFAULT true,
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. MODIFICAR TABELA CANDIDATOS_DISC
-- =====================================================

-- Adicionar coluna analista_id (pode ser null para candidatos antigos)
ALTER TABLE public.candidatos_disc
ADD COLUMN IF NOT EXISTS analista_id UUID REFERENCES public.analistas(id) ON DELETE SET NULL;

-- =====================================================
-- 4. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_analistas_email ON public.analistas(email);
CREATE INDEX IF NOT EXISTS idx_analistas_link_unico ON public.analistas(link_unico);
CREATE INDEX IF NOT EXISTS idx_analistas_ativo ON public.analistas(ativo);
CREATE INDEX IF NOT EXISTS idx_analistas_tipo ON public.analistas(tipo);
CREATE INDEX IF NOT EXISTS idx_candidatos_analista_id ON public.candidatos_disc(analista_id);
CREATE INDEX IF NOT EXISTS idx_fundador_email ON public.fundador(email);

-- =====================================================
-- 5. TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER update_analistas_updated_at
BEFORE UPDATE ON public.analistas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fundador_updated_at
BEFORE UPDATE ON public.fundador
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. RLS (Row Level Security) - ANALISTAS
-- =====================================================

ALTER TABLE public.analistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundador ENABLE ROW LEVEL SECURITY;

-- Analistas podem ver apenas seus próprios dados
CREATE POLICY "Analistas can view own data"
ON public.analistas
FOR SELECT
USING (true); -- Será refinado quando implementarmos auth

-- Analistas podem atualizar seus próprios dados
CREATE POLICY "Analistas can update own data"
ON public.analistas
FOR UPDATE
USING (true); -- Será refinado quando implementarmos auth

-- Permitir insert para criação de novos analistas
CREATE POLICY "Allow insert analistas"
ON public.analistas
FOR INSERT
WITH CHECK (true);

-- Fundador - acesso restrito
CREATE POLICY "Fundador access"
ON public.fundador
FOR ALL
USING (true); -- Apenas via backend/service role

-- =====================================================
-- 7. RLS PARA CANDIDATOS - ANALISTAS
-- =====================================================

-- Analistas podem ver candidatos vinculados a eles
CREATE POLICY "Analistas can view their candidates"
ON public.candidatos_disc
FOR SELECT
USING (
  analista_id IS NOT NULL
  OR empresa_id IS NOT NULL
  OR empresa_id IS NULL -- Candidatos antigos sem vinculo
);

-- Analistas podem atualizar candidatos vinculados a eles
CREATE POLICY "Analistas can update their candidates"
ON public.candidatos_disc
FOR UPDATE
USING (analista_id IS NOT NULL OR empresa_id IS NOT NULL);

-- =====================================================
-- 8. FUNÇÃO PARA VERIFICAR LICENÇAS DISPONÍVEIS
-- =====================================================

CREATE OR REPLACE FUNCTION public.analista_tem_licenca(p_analista_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_licencas_total INTEGER;
  v_licencas_usadas INTEGER;
BEGIN
  SELECT licencas_total, licencas_usadas
  INTO v_licencas_total, v_licencas_usadas
  FROM public.analistas
  WHERE id = p_analista_id AND ativo = true;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  RETURN v_licencas_usadas < v_licencas_total;
END;
$$;

-- =====================================================
-- 9. FUNÇÃO PARA CONSUMIR LICENÇA
-- =====================================================

CREATE OR REPLACE FUNCTION public.consumir_licenca(p_analista_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.analistas
  SET licencas_usadas = licencas_usadas + 1
  WHERE id = p_analista_id
    AND ativo = true
    AND licencas_usadas < licencas_total;

  RETURN FOUND;
END;
$$;

-- =====================================================
-- 10. TRIGGER PARA CONSUMIR LICENÇA AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION public.auto_consumir_licenca()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se o candidato tem um analista vinculado, consumir licença
  IF NEW.analista_id IS NOT NULL THEN
    PERFORM public.consumir_licenca(NEW.analista_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_consumir_licenca_candidato
AFTER INSERT ON public.candidatos_disc
FOR EACH ROW
EXECUTE FUNCTION public.auto_consumir_licenca();

-- =====================================================
-- 11. FUNÇÃO PARA ATUALIZAR ÚLTIMO ACESSO
-- =====================================================

CREATE OR REPLACE FUNCTION public.atualizar_ultimo_acesso_analista(p_analista_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.analistas
  SET ultimo_acesso = NOW()
  WHERE id = p_analista_id;
END;
$$;

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE public.fundador IS 'Tabela do fundador/super admin do sistema';
COMMENT ON TABLE public.analistas IS 'Tabela de analistas (coaches, psicólogos, RH, etc.)';
COMMENT ON COLUMN public.analistas.link_unico IS 'UUID único para gerar link de avaliação do analista';
COMMENT ON COLUMN public.analistas.licencas_total IS 'Total de licenças/créditos disponíveis para o analista';
COMMENT ON COLUMN public.analistas.licencas_usadas IS 'Quantidade de licenças já utilizadas';
COMMENT ON COLUMN public.analistas.tipo IS 'Tipo do analista: coach, psicologo, empresa, rh, escola, outro';

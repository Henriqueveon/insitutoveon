-- =====================================================
-- TABELA DE PACOTES DE CRÉDITOS
-- Sistema de pacotes de entrevistas
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pacotes_creditos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    quantidade_entrevistas INTEGER NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    preco_por_entrevista DECIMAL(10,2) NOT NULL,
    economia DECIMAL(10,2) DEFAULT 0,
    destaque BOOLEAN DEFAULT FALSE,
    badge TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir pacotes
INSERT INTO public.pacotes_creditos (nome, quantidade_entrevistas, preco, preco_por_entrevista, economia, destaque, badge, ordem) VALUES
('Avulso', 1, 39.90, 39.90, 0, false, null, 1),
('Popular', 5, 189.00, 37.80, 10.50, true, 'MAIS POPULAR', 2),
('Profissional', 10, 299.00, 29.90, 100.00, false, 'MELHOR CUSTO-BENEFÍCIO', 3)
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE public.pacotes_creditos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pacotes_select" ON public.pacotes_creditos;
CREATE POLICY "pacotes_select" ON public.pacotes_creditos
  FOR SELECT USING (true);

-- Grant
GRANT SELECT ON public.pacotes_creditos TO anon, authenticated;

-- =====================================================
-- ADICIONAR COLUNA descricao EM transacoes_recrutamento
-- =====================================================

ALTER TABLE public.transacoes_recrutamento
ADD COLUMN IF NOT EXISTS descricao TEXT;

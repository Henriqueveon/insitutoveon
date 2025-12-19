-- =====================================================
-- PERFIL DA EMPRESA - Diferenciais e Benefícios
-- Campos adicionais para atrair candidatos
-- =====================================================

-- Adicionar colunas na tabela empresas_recrutamento
ALTER TABLE public.empresas_recrutamento ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.empresas_recrutamento ADD COLUMN IF NOT EXISTS segmento VARCHAR(100);
ALTER TABLE public.empresas_recrutamento ADD COLUMN IF NOT EXISTS tempo_mercado VARCHAR(50);
ALTER TABLE public.empresas_recrutamento ADD COLUMN IF NOT EXISTS num_colaboradores VARCHAR(50);
ALTER TABLE public.empresas_recrutamento ADD COLUMN IF NOT EXISTS site_url TEXT;
ALTER TABLE public.empresas_recrutamento ADD COLUMN IF NOT EXISTS instagram_empresa VARCHAR(100);
ALTER TABLE public.empresas_recrutamento ADD COLUMN IF NOT EXISTS sobre_empresa TEXT;
ALTER TABLE public.empresas_recrutamento ADD COLUMN IF NOT EXISTS diferenciais TEXT[];
ALTER TABLE public.empresas_recrutamento ADD COLUMN IF NOT EXISTS porque_trabalhar TEXT;
ALTER TABLE public.empresas_recrutamento ADD COLUMN IF NOT EXISTS fotos_ambiente TEXT[];

-- Criar bucket para logos e fotos das empresas (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('empresas', 'empresas', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para empresas
DROP POLICY IF EXISTS "empresas_upload" ON storage.objects;
CREATE POLICY "empresas_upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'empresas' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "empresas_select" ON storage.objects;
CREATE POLICY "empresas_select" ON storage.objects
    FOR SELECT USING (bucket_id = 'empresas');

DROP POLICY IF EXISTS "empresas_update" ON storage.objects;
CREATE POLICY "empresas_update" ON storage.objects
    FOR UPDATE USING (bucket_id = 'empresas' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "empresas_delete" ON storage.objects;
CREATE POLICY "empresas_delete" ON storage.objects
    FOR DELETE USING (bucket_id = 'empresas' AND auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON COLUMN public.empresas_recrutamento.logo_url IS 'URL do logo da empresa';
COMMENT ON COLUMN public.empresas_recrutamento.segmento IS 'Segmento de atuação: Varejo, Serviços, Indústria, etc';
COMMENT ON COLUMN public.empresas_recrutamento.tempo_mercado IS 'Há quantos anos a empresa existe';
COMMENT ON COLUMN public.empresas_recrutamento.num_colaboradores IS 'Faixa de número de colaboradores';
COMMENT ON COLUMN public.empresas_recrutamento.diferenciais IS 'Array de diferenciais/benefícios oferecidos';
COMMENT ON COLUMN public.empresas_recrutamento.fotos_ambiente IS 'Array de URLs das fotos do ambiente';

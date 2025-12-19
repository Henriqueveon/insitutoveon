-- =====================================================
-- CORREÇÃO: Garantir que empresas podem ver candidatos
-- Data: 15/12/2025
-- =====================================================

-- 1. Garantir política de SELECT para candidatos
DROP POLICY IF EXISTS "candidatos_select_public" ON public.candidatos_recrutamento;
DROP POLICY IF EXISTS "Candidatos select all" ON public.candidatos_recrutamento;

CREATE POLICY "candidatos_select_all"
ON public.candidatos_recrutamento FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Garantir que empresas autenticadas podem ler candidatos disponíveis
-- (redundante, mas garante funcionamento)
CREATE POLICY "empresas_podem_ver_candidatos"
ON public.candidatos_recrutamento FOR SELECT
TO authenticated
USING (
    status = 'disponivel'
    OR auth.uid() IS NOT NULL
);

-- 3. Garantir que tabela cidades_coordenadas pode ser lida
CREATE TABLE IF NOT EXISTS public.cidades_coordenadas (
    id SERIAL PRIMARY KEY,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    populacao INTEGER DEFAULT 0
);

-- Política de leitura para cidades
ALTER TABLE public.cidades_coordenadas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cidades_select_all" ON public.cidades_coordenadas;
CREATE POLICY "cidades_select_all" ON public.cidades_coordenadas
FOR SELECT TO anon, authenticated USING (true);

-- 4. GRANT de leitura
GRANT SELECT ON public.candidatos_recrutamento TO anon, authenticated;
GRANT SELECT ON public.cidades_coordenadas TO anon, authenticated;

-- 5. Se não houver candidatos de teste, criar alguns para demonstração
-- (Comentado - descomentar se precisar)
/*
INSERT INTO public.candidatos_recrutamento (
    nome_completo, email, telefone, cidade, estado, status,
    cadastro_completo, perfil_disc, foto_url
) VALUES
    ('João Silva Demo', 'joao.demo@teste.com', '11999990001', 'São Paulo', 'SP', 'disponivel', true, 'D', 'https://randomuser.me/api/portraits/men/1.jpg'),
    ('Maria Santos Demo', 'maria.demo@teste.com', '11999990002', 'Rio de Janeiro', 'RJ', 'disponivel', true, 'I', 'https://randomuser.me/api/portraits/women/1.jpg'),
    ('Pedro Oliveira Demo', 'pedro.demo@teste.com', '11999990003', 'Belo Horizonte', 'MG', 'disponivel', true, 'S', 'https://randomuser.me/api/portraits/men/2.jpg')
ON CONFLICT (email) DO NOTHING;
*/

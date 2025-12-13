-- =====================================================
-- TABELA DE COORDENADAS DAS CIDADES
-- Para cálculo de proximidade geográfica
-- =====================================================

CREATE TABLE IF NOT EXISTS public.cidades_coordenadas (
    id SERIAL PRIMARY KEY,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    populacao INTEGER DEFAULT 0,
    UNIQUE(cidade, estado)
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_cidades_estado ON public.cidades_coordenadas(estado);
CREATE INDEX IF NOT EXISTS idx_cidades_nome ON public.cidades_coordenadas(cidade);

-- RLS
ALTER TABLE public.cidades_coordenadas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cidades_select" ON public.cidades_coordenadas;
CREATE POLICY "cidades_select" ON public.cidades_coordenadas
    FOR SELECT USING (true);

GRANT SELECT ON public.cidades_coordenadas TO anon, authenticated;

-- =====================================================
-- INSERIR PRINCIPAIS CIDADES DO BRASIL
-- =====================================================

INSERT INTO public.cidades_coordenadas (cidade, estado, latitude, longitude, populacao) VALUES
-- Paraná
('Cascavel', 'PR', -24.9578, -53.4595, 332333),
('Curitiba', 'PR', -25.4290, -49.2710, 1963726),
('Londrina', 'PR', -23.3045, -51.1696, 575377),
('Maringá', 'PR', -23.4205, -51.9333, 430157),
('Foz do Iguaçu', 'PR', -25.5163, -54.5854, 258532),
('Toledo', 'PR', -24.7246, -53.7412, 142645),
('Ponta Grossa', 'PR', -25.0916, -50.1668, 355336),
('Guarapuava', 'PR', -25.3907, -51.4628, 182644),
('Paranaguá', 'PR', -25.5161, -48.5225, 156174),
('Umuarama', 'PR', -23.7664, -53.3250, 112500),
('Campo Mourão', 'PR', -24.0459, -52.3831, 96102),
('Apucarana', 'PR', -23.5508, -51.4608, 136234),
('Francisco Beltrão', 'PR', -26.0782, -53.0550, 92216),
('Pato Branco', 'PR', -26.2292, -52.6706, 83472),
('Medianeira', 'PR', -25.2967, -54.0944, 48036),

-- São Paulo
('São Paulo', 'SP', -23.5505, -46.6333, 12325232),
('Campinas', 'SP', -22.9056, -47.0608, 1223237),
('Guarulhos', 'SP', -23.4543, -46.5337, 1404694),
('São Bernardo do Campo', 'SP', -23.6914, -46.5646, 844483),
('Santo André', 'SP', -23.6737, -46.5432, 721368),
('Ribeirão Preto', 'SP', -21.1775, -47.8103, 711825),
('Osasco', 'SP', -23.5325, -46.7917, 699944),
('Sorocaba', 'SP', -23.5015, -47.4526, 687357),
('São José dos Campos', 'SP', -23.1896, -45.8841, 729737),
('Santos', 'SP', -23.9536, -46.3331, 433311),

-- Rio de Janeiro
('Rio de Janeiro', 'RJ', -22.9068, -43.1729, 6747815),
('São Gonçalo', 'RJ', -22.8268, -43.0634, 1091737),
('Niterói', 'RJ', -22.8833, -43.1037, 515317),
('Duque de Caxias', 'RJ', -22.7856, -43.3117, 924624),
('Nova Iguaçu', 'RJ', -22.7592, -43.4509, 823302),

-- Minas Gerais
('Belo Horizonte', 'MG', -19.9167, -43.9345, 2521564),
('Uberlândia', 'MG', -18.9186, -48.2772, 699097),
('Contagem', 'MG', -19.9318, -44.0539, 668949),
('Juiz de Fora', 'MG', -21.7642, -43.3503, 573285),
('Betim', 'MG', -19.9681, -44.1985, 444784),

-- Santa Catarina
('Florianópolis', 'SC', -27.5954, -48.5480, 508826),
('Joinville', 'SC', -26.3044, -48.8456, 597658),
('Blumenau', 'SC', -26.9194, -49.0661, 361855),
('Chapecó', 'SC', -27.0963, -52.6158, 224013),
('Criciúma', 'SC', -28.6778, -49.3697, 217311),
('Itajaí', 'SC', -26.9078, -48.6619, 223112),

-- Rio Grande do Sul
('Porto Alegre', 'RS', -30.0346, -51.2177, 1488252),
('Caxias do Sul', 'RS', -29.1678, -51.1794, 517451),
('Pelotas', 'RS', -31.7654, -52.3376, 343132),
('Canoas', 'RS', -29.9178, -51.1839, 348208),
('Santa Maria', 'RS', -29.6842, -53.8069, 283677),

-- Bahia
('Salvador', 'BA', -12.9714, -38.5014, 2886698),
('Feira de Santana', 'BA', -12.2664, -38.9663, 619609),
('Vitória da Conquista', 'BA', -14.8619, -40.8389, 341128),

-- Pernambuco
('Recife', 'PE', -8.0476, -34.8770, 1653461),
('Jaboatão dos Guararapes', 'PE', -8.1128, -35.0153, 706867),
('Olinda', 'PE', -8.0089, -34.8553, 393115),

-- Ceará
('Fortaleza', 'CE', -3.7172, -38.5433, 2686612),
('Caucaia', 'CE', -3.7361, -38.6531, 365212),

-- Goiás
('Goiânia', 'GO', -16.6869, -49.2648, 1536097),
('Aparecida de Goiânia', 'GO', -16.8198, -49.2469, 590146),
('Anápolis', 'GO', -16.3281, -48.9534, 391772),

-- Distrito Federal
('Brasília', 'DF', -15.7801, -47.9292, 3094325),

-- Espírito Santo
('Vitória', 'ES', -20.2976, -40.2958, 365855),
('Vila Velha', 'ES', -20.3297, -40.2925, 501325),
('Serra', 'ES', -20.1286, -40.3078, 527240),

-- Pará
('Belém', 'PA', -1.4558, -48.4902, 1499641),
('Ananindeua', 'PA', -1.3658, -48.3722, 535547),

-- Amazonas
('Manaus', 'AM', -3.1190, -60.0217, 2219580),

-- Maranhão
('São Luís', 'MA', -2.5307, -44.3068, 1108975),

-- Mato Grosso
('Cuiabá', 'MT', -15.6014, -56.0979, 618124),
('Várzea Grande', 'MT', -15.6469, -56.1322, 287526),

-- Mato Grosso do Sul
('Campo Grande', 'MS', -20.4697, -54.6201, 906092),
('Dourados', 'MS', -22.2231, -54.8118, 225495),

-- Paraíba
('João Pessoa', 'PB', -7.1195, -34.8450, 817511),
('Campina Grande', 'PB', -7.2306, -35.8811, 411807),

-- Rio Grande do Norte
('Natal', 'RN', -5.7945, -35.2110, 896708),
('Mossoró', 'RN', -5.1878, -37.3441, 300618),

-- Alagoas
('Maceió', 'AL', -9.6498, -35.7089, 1025360),

-- Piauí
('Teresina', 'PI', -5.0920, -42.8038, 868075),

-- Sergipe
('Aracaju', 'SE', -10.9472, -37.0731, 664908),

-- Rondônia
('Porto Velho', 'RO', -8.7612, -63.9004, 548952),

-- Tocantins
('Palmas', 'TO', -10.1689, -48.3317, 306296),

-- Acre
('Rio Branco', 'AC', -9.9753, -67.8106, 413418),

-- Amapá
('Macapá', 'AP', 0.0349, -51.0694, 512902),

-- Roraima
('Boa Vista', 'RR', 2.8235, -60.6758, 419652)

ON CONFLICT (cidade, estado) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    populacao = EXCLUDED.populacao;

-- =====================================================
-- FUNÇÃO PARA CALCULAR DISTÂNCIA EM KM (Haversine)
-- =====================================================

DROP FUNCTION IF EXISTS public.calcular_distancia_km(DECIMAL, DECIMAL, DECIMAL, DECIMAL);

CREATE OR REPLACE FUNCTION public.calcular_distancia_km(
    lat1 DECIMAL, lon1 DECIMAL,
    lat2 DECIMAL, lon2 DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    R DECIMAL := 6371; -- Raio da Terra em km
    dLat DECIMAL;
    dLon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
        RETURN NULL;
    END IF;

    dLat := RADIANS(lat2 - lat1);
    dLon := RADIANS(lon2 - lon1);
    a := SIN(dLat/2) * SIN(dLat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dLon/2) * SIN(dLon/2);
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    RETURN ROUND((R * c)::NUMERIC, 2);
END;
$$;

-- =====================================================
-- FUNÇÃO PARA BUSCAR CANDIDATOS POR PROXIMIDADE
-- =====================================================

DROP FUNCTION IF EXISTS public.buscar_candidatos_proximos(TEXT, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION public.buscar_candidatos_proximos(
    p_cidade_origem TEXT,
    p_estado_origem TEXT,
    p_raio_km INTEGER DEFAULT 30
)
RETURNS TABLE (
    candidato_id UUID,
    cidade TEXT,
    estado TEXT,
    distancia_km DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_lat_origem DECIMAL;
    v_lon_origem DECIMAL;
BEGIN
    -- Buscar coordenadas da cidade origem
    SELECT latitude, longitude INTO v_lat_origem, v_lon_origem
    FROM public.cidades_coordenadas
    WHERE cidade ILIKE p_cidade_origem AND estado = p_estado_origem;

    IF v_lat_origem IS NULL THEN
        -- Se não encontrar a cidade, retornar todos os candidatos do mesmo estado
        RETURN QUERY
        SELECT c.id, c.cidade, c.estado, NULL::DECIMAL
        FROM public.candidatos_recrutamento c
        WHERE c.estado = p_estado_origem AND c.status = 'ativo';
        RETURN;
    END IF;

    -- Buscar candidatos dentro do raio
    RETURN QUERY
    SELECT
        c.id,
        c.cidade,
        c.estado,
        public.calcular_distancia_km(v_lat_origem, v_lon_origem, cc.latitude, cc.longitude) as dist
    FROM public.candidatos_recrutamento c
    LEFT JOIN public.cidades_coordenadas cc ON c.cidade ILIKE cc.cidade AND c.estado = cc.estado
    WHERE c.status = 'ativo'
    AND (
        cc.id IS NULL -- Incluir candidatos sem coordenadas cadastradas
        OR public.calcular_distancia_km(v_lat_origem, v_lon_origem, cc.latitude, cc.longitude) <= p_raio_km
    )
    ORDER BY dist NULLS LAST;
END;
$$;

GRANT EXECUTE ON FUNCTION public.calcular_distancia_km(DECIMAL, DECIMAL, DECIMAL, DECIMAL) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.buscar_candidatos_proximos(TEXT, TEXT, INTEGER) TO anon, authenticated;

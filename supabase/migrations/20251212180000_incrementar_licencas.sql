-- Função para incrementar licenças usadas do analista
CREATE OR REPLACE FUNCTION incrementar_licencas_usadas(p_analista_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_licencas_total INTEGER;
    v_licencas_usadas INTEGER;
BEGIN
    -- Buscar licenças atuais do analista
    SELECT licencas_total, licencas_usadas
    INTO v_licencas_total, v_licencas_usadas
    FROM analistas
    WHERE id = p_analista_id;

    -- Verificar se analista existe
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Analista não encontrado'
        );
    END IF;

    -- Verificar se há licenças disponíveis
    IF v_licencas_usadas >= v_licencas_total THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Sem licenças disponíveis'
        );
    END IF;

    -- Incrementar licenças usadas
    UPDATE analistas
    SET licencas_usadas = licencas_usadas + 1
    WHERE id = p_analista_id;

    RETURN jsonb_build_object(
        'success', true,
        'licencas_usadas', v_licencas_usadas + 1,
        'licencas_total', v_licencas_total
    );
END;
$$;

-- Garantir que a coluna analista_id existe na tabela candidatos_disc
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'candidatos_disc'
        AND column_name = 'analista_id'
    ) THEN
        ALTER TABLE candidatos_disc ADD COLUMN analista_id UUID REFERENCES analistas(id);
        CREATE INDEX IF NOT EXISTS idx_candidatos_analista ON candidatos_disc(analista_id);
    END IF;
END $$;

-- Garantir que a coluna perfil_disc existe (para exibição simples do perfil)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'candidatos_disc'
        AND column_name = 'perfil_disc'
    ) THEN
        ALTER TABLE candidatos_disc ADD COLUMN perfil_disc VARCHAR(10);
    END IF;
END $$;

-- Atualizar perfil_disc baseado em perfil_tipo existente
UPDATE candidatos_disc
SET perfil_disc = perfil_tipo
WHERE perfil_disc IS NULL AND perfil_tipo IS NOT NULL;

-- Adicionar campo CPF/CNPJ na tabela analistas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'analistas'
        AND column_name = 'cpf_cnpj'
    ) THEN
        ALTER TABLE analistas ADD COLUMN cpf_cnpj VARCHAR(18);
    END IF;
END $$;

-- Criar índice para CPF/CNPJ (único, mas permite nulos)
CREATE UNIQUE INDEX IF NOT EXISTS idx_analistas_cpf_cnpj
ON analistas(cpf_cnpj)
WHERE cpf_cnpj IS NOT NULL;

-- Função simples para criar hash de senha (usando crypt com bf)
-- Esta função é mais robusta e funciona mesmo sem extensão instalada
CREATE OR REPLACE FUNCTION criar_hash_senha(p_senha TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Tentar usar pgcrypto se disponível
    BEGIN
        RETURN crypt(p_senha, gen_salt('bf'));
    EXCEPTION WHEN undefined_function THEN
        -- Se pgcrypto não estiver disponível, usar hash simples (não recomendado para produção)
        RETURN encode(sha256(p_senha::bytea), 'hex');
    END;
END;
$$;

-- Garantir que a coluna ultimo_acesso existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'analistas'
        AND column_name = 'ultimo_acesso'
    ) THEN
        ALTER TABLE analistas ADD COLUMN ultimo_acesso TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

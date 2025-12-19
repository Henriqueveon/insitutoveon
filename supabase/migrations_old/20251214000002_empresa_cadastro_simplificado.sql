-- =====================================================
-- MIGRAÇÃO: Cadastro Simplificado de Empresas
-- Permite cadastro inicial apenas com CNPJ, Email, Telefone
-- =====================================================

-- 1. Adicionar coluna cadastro_completo
ALTER TABLE public.empresas_recrutamento
ADD COLUMN IF NOT EXISTS cadastro_completo BOOLEAN DEFAULT FALSE;

-- 2. Adicionar coluna socio_funcao (função do responsável)
ALTER TABLE public.empresas_recrutamento
ADD COLUMN IF NOT EXISTS socio_funcao VARCHAR(50);

-- 3. Modificar campos obrigatórios para permitir cadastro rápido
-- socio_nome pode ser vazio inicialmente
DO $$
BEGIN
    ALTER TABLE public.empresas_recrutamento ALTER COLUMN socio_nome DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- socio_cpf pode ser vazio inicialmente
DO $$
BEGIN
    ALTER TABLE public.empresas_recrutamento ALTER COLUMN socio_cpf DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- senha_hash pode ser vazio (login via OTP)
DO $$
BEGIN
    ALTER TABLE public.empresas_recrutamento ALTER COLUMN senha_hash DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 4. Atualizar empresas existentes como cadastro completo
UPDATE public.empresas_recrutamento
SET cadastro_completo = TRUE
WHERE socio_nome IS NOT NULL
  AND socio_cpf IS NOT NULL;

-- 5. Criar índice para busca de empresas com cadastro completo
CREATE INDEX IF NOT EXISTS idx_empresas_cadastro_completo
ON public.empresas_recrutamento(cadastro_completo);

-- 6. Policy para atualização de empresas (próprio registro)
DROP POLICY IF EXISTS "Empresas podem atualizar proprio registro" ON public.empresas_recrutamento;
CREATE POLICY "Empresas podem atualizar proprio registro"
ON public.empresas_recrutamento FOR UPDATE
USING (true)
WITH CHECK (true);

-- 7. Policy para leitura de empresas
DROP POLICY IF EXISTS "Empresas podem ler proprio registro" ON public.empresas_recrutamento;
CREATE POLICY "Empresas podem ler proprio registro"
ON public.empresas_recrutamento FOR SELECT
USING (true);

-- 8. Função RPC para cadastro rápido (bypassa RLS)
CREATE OR REPLACE FUNCTION public.cadastrar_empresa_rapido(
    p_cnpj VARCHAR,
    p_razao_social VARCHAR,
    p_nome_fantasia VARCHAR DEFAULT NULL,
    p_situacao_cadastral VARCHAR DEFAULT NULL,
    p_data_abertura DATE DEFAULT NULL,
    p_natureza_juridica VARCHAR DEFAULT NULL,
    p_porte VARCHAR DEFAULT NULL,
    p_capital_social DECIMAL DEFAULT NULL,
    p_logradouro VARCHAR DEFAULT NULL,
    p_numero VARCHAR DEFAULT NULL,
    p_complemento VARCHAR DEFAULT NULL,
    p_bairro VARCHAR DEFAULT NULL,
    p_cidade VARCHAR DEFAULT NULL,
    p_estado VARCHAR DEFAULT NULL,
    p_cep VARCHAR DEFAULT NULL,
    p_telefone_empresa VARCHAR DEFAULT NULL,
    p_email_empresa VARCHAR DEFAULT NULL,
    p_socio_email VARCHAR,
    p_socio_telefone VARCHAR
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_empresa_id UUID;
BEGIN
    -- Verificar se CNPJ já existe
    IF EXISTS (SELECT 1 FROM empresas_recrutamento WHERE cnpj = p_cnpj) THEN
        RETURN json_build_object('success', false, 'error', 'CNPJ já cadastrado');
    END IF;

    -- Verificar se email já existe
    IF EXISTS (SELECT 1 FROM empresas_recrutamento WHERE socio_email = p_socio_email) THEN
        RETURN json_build_object('success', false, 'error', 'Email já cadastrado');
    END IF;

    -- Inserir empresa com cadastro incompleto
    INSERT INTO empresas_recrutamento (
        cnpj,
        razao_social,
        nome_fantasia,
        situacao_cadastral,
        data_abertura,
        natureza_juridica,
        porte,
        capital_social,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        telefone_empresa,
        email_empresa,
        socio_email,
        socio_telefone,
        cadastro_completo,
        aceite_termos,
        aceite_termos_data,
        aceite_lgpd,
        aceite_lgpd_data
    ) VALUES (
        p_cnpj,
        p_razao_social,
        p_nome_fantasia,
        p_situacao_cadastral,
        p_data_abertura,
        p_natureza_juridica,
        p_porte,
        p_capital_social,
        p_logradouro,
        p_numero,
        p_complemento,
        p_bairro,
        p_cidade,
        p_estado,
        p_cep,
        p_telefone_empresa,
        p_email_empresa,
        p_socio_email,
        p_socio_telefone,
        FALSE, -- cadastro_completo = false
        TRUE,  -- aceite_termos
        NOW(),
        TRUE,  -- aceite_lgpd
        NOW()
    )
    RETURNING id INTO v_empresa_id;

    RETURN json_build_object(
        'success', true,
        'empresa_id', v_empresa_id
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION public.cadastrar_empresa_rapido IS
'Cadastra empresa com dados mínimos (CNPJ + Email + Telefone). Cadastro incompleto - precisa completar depois.';

-- Grant para execução anônima
GRANT EXECUTE ON FUNCTION public.cadastrar_empresa_rapido TO anon;
GRANT EXECUTE ON FUNCTION public.cadastrar_empresa_rapido TO authenticated;

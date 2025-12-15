-- =====================================================
-- MIGRAÇÃO: Adicionar campo cadastro_completo
-- =====================================================

-- Adicionar coluna cadastro_completo
ALTER TABLE empresas_recrutamento 
ADD COLUMN IF NOT EXISTS cadastro_completo BOOLEAN DEFAULT FALSE;

-- Atualizar empresas que têm dados completos
UPDATE empresas_recrutamento
SET cadastro_completo = TRUE
WHERE socio_nome IS NOT NULL
  AND socio_cpf IS NOT NULL
  AND LENGTH(socio_cpf) >= 11
  AND socio_funcao IS NOT NULL;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_empresas_cadastro_completo 
ON empresas_recrutamento(cadastro_completo);

-- Criar função RPC para completar cadastro
CREATE OR REPLACE FUNCTION public.completar_cadastro_empresa_v2(
  p_empresa_id UUID,
  p_socio_nome VARCHAR DEFAULT NULL,
  p_socio_funcao VARCHAR DEFAULT NULL,
  p_socio_cpf VARCHAR DEFAULT NULL,
  p_senha VARCHAR DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_empresa RECORD;
BEGIN
  -- Verificar se empresa existe
  SELECT * INTO v_empresa FROM empresas_recrutamento WHERE id = p_empresa_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Empresa não encontrada');
  END IF;
  
  -- Atualizar dados
  UPDATE empresas_recrutamento SET
    socio_nome = COALESCE(p_socio_nome, socio_nome),
    socio_funcao = COALESCE(p_socio_funcao, socio_funcao),
    socio_cpf = COALESCE(p_socio_cpf, socio_cpf),
    senha_hash = COALESCE(p_senha, senha_hash),
    cadastro_completo = TRUE,
    updated_at = NOW()
  WHERE id = p_empresa_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Cadastro completo com sucesso',
    'empresa_id', p_empresa_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
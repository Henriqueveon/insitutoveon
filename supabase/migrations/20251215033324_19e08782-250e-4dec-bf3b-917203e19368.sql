-- ============================================
-- MIGRAÇÃO 1: ADICIONAR CONFIABILIDADE
-- ============================================

-- 1. Adicionar coluna de confiabilidade (0-100%)
ALTER TABLE public.candidatos_recrutamento 
ADD COLUMN IF NOT EXISTS confiabilidade INTEGER DEFAULT 0;

-- 2. Adicionar coluna de etapa atual do cadastro
ALTER TABLE public.candidatos_recrutamento 
ADD COLUMN IF NOT EXISTS etapa_atual INTEGER DEFAULT 1;

-- 3. Adicionar coluna de total de etapas completadas
ALTER TABLE public.candidatos_recrutamento 
ADD COLUMN IF NOT EXISTS etapas_completadas INTEGER DEFAULT 0;

-- 4. Adicionar coluna para rastrear quais etapas foram feitas
ALTER TABLE public.candidatos_recrutamento 
ADD COLUMN IF NOT EXISTS etapas_json JSONB DEFAULT '{"dados_pessoais": false, "experiencia": false, "formacao": false, "logistica": false, "vida_pessoal": false, "expectativas": false, "foto": false, "disc": false}'::jsonb;

-- 5. Criar função para calcular confiabilidade
CREATE OR REPLACE FUNCTION public.calcular_confiabilidade(p_candidato_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_confiabilidade INTEGER := 0;
    v_candidato RECORD;
BEGIN
    SELECT * INTO v_candidato
    FROM candidatos_recrutamento
    WHERE id = p_candidato_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    IF v_candidato.nome_completo IS NOT NULL 
       AND v_candidato.telefone IS NOT NULL 
       AND v_candidato.email IS NOT NULL THEN
        v_confiabilidade := v_confiabilidade + 10;
    END IF;
    
    IF v_candidato.cpf IS NOT NULL THEN
        v_confiabilidade := v_confiabilidade + 5;
    END IF;
    
    IF v_candidato.data_nascimento IS NOT NULL THEN
        v_confiabilidade := v_confiabilidade + 5;
    END IF;
    
    IF v_candidato.cidade IS NOT NULL AND v_candidato.estado IS NOT NULL THEN
        v_confiabilidade := v_confiabilidade + 10;
    END IF;
    
    IF v_candidato.ultimo_cargo IS NOT NULL OR v_candidato.ultima_empresa IS NOT NULL THEN
        v_confiabilidade := v_confiabilidade + 15;
    END IF;
    
    IF v_candidato.escolaridade IS NOT NULL THEN
        v_confiabilidade := v_confiabilidade + 10;
    END IF;
    
    IF v_candidato.pretensao_salarial IS NOT NULL THEN
        v_confiabilidade := v_confiabilidade + 5;
    END IF;
    
    IF v_candidato.foto_url IS NOT NULL THEN
        v_confiabilidade := v_confiabilidade + 10;
    END IF;
    
    IF v_candidato.perfil_disc IS NOT NULL THEN
        v_confiabilidade := v_confiabilidade + 30;
    END IF;
    
    IF v_confiabilidade > 100 THEN
        v_confiabilidade := 100;
    END IF;
    
    UPDATE candidatos_recrutamento
    SET confiabilidade = v_confiabilidade
    WHERE id = p_candidato_id;
    
    RETURN v_confiabilidade;
END;
$$;

GRANT EXECUTE ON FUNCTION public.calcular_confiabilidade TO authenticated;
GRANT EXECUTE ON FUNCTION public.calcular_confiabilidade TO anon;
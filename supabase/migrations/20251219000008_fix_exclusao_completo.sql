-- =====================================================
-- FIX COMPLETO: Sistema de Exclusão de Contas
-- Corrige constraints, colunas e função
-- =====================================================

-- 1. Adicionar colunas que podem estar faltando em candidatos_recrutamento
DO $$
BEGIN
  -- Adicionar colunas de exclusão se não existirem
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidatos_recrutamento' AND column_name = 'exclusao_solicitada') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN exclusao_solicitada BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidatos_recrutamento' AND column_name = 'exclusao_data_solicitacao') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN exclusao_data_solicitacao TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidatos_recrutamento' AND column_name = 'exclusao_data_prevista') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN exclusao_data_prevista TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidatos_recrutamento' AND column_name = 'exclusao_motivo') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN exclusao_motivo TEXT;
  END IF;
END $$;

-- 2. Adicionar colunas em empresas_recrutamento
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'empresas_recrutamento' AND column_name = 'exclusao_solicitada') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN exclusao_solicitada BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'empresas_recrutamento' AND column_name = 'exclusao_data_solicitacao') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN exclusao_data_solicitacao TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'empresas_recrutamento' AND column_name = 'exclusao_data_prevista') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN exclusao_data_prevista TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'empresas_recrutamento' AND column_name = 'exclusao_motivo') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN exclusao_motivo TEXT;
  END IF;
END $$;

-- 3. Adicionar colunas em analistas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analistas' AND column_name = 'exclusao_solicitada') THEN
    ALTER TABLE analistas ADD COLUMN exclusao_solicitada BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analistas' AND column_name = 'exclusao_data_solicitacao') THEN
    ALTER TABLE analistas ADD COLUMN exclusao_data_solicitacao TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analistas' AND column_name = 'exclusao_data_prevista') THEN
    ALTER TABLE analistas ADD COLUMN exclusao_data_prevista TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analistas' AND column_name = 'exclusao_motivo') THEN
    ALTER TABLE analistas ADD COLUMN exclusao_motivo TEXT;
  END IF;
END $$;

-- 4. Remover constraints de status que podem estar bloqueando
-- Candidatos
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'candidatos_recrutamento'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%status%'
  LOOP
    EXECUTE 'ALTER TABLE candidatos_recrutamento DROP CONSTRAINT IF EXISTS ' || constraint_name;
  END LOOP;
END $$;

-- Empresas
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'empresas_recrutamento'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%status%'
  LOOP
    EXECUTE 'ALTER TABLE empresas_recrutamento DROP CONSTRAINT IF EXISTS ' || constraint_name;
  END LOOP;
END $$;

-- 5. Recriar função com tratamento de erro robusto
DROP FUNCTION IF EXISTS solicitar_exclusao_conta(UUID, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION solicitar_exclusao_conta(
  p_usuario_id UUID,
  p_usuario_tipo TEXT,
  p_motivo TEXT,
  p_comentario TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_usuario_email TEXT;
  v_usuario_nome TEXT;
  v_usuario_telefone TEXT;
  v_motivo_texto TEXT;
  v_data_exclusao TIMESTAMPTZ;
BEGIN
  -- Validar parâmetros
  IF p_usuario_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'ID do usuário é obrigatório');
  END IF;

  IF p_usuario_tipo NOT IN ('candidato', 'empresa', 'analista') THEN
    RETURN json_build_object('success', false, 'error', 'Tipo de usuário inválido');
  END IF;

  IF p_motivo IS NULL OR p_motivo = '' THEN
    RETURN json_build_object('success', false, 'error', 'Motivo é obrigatório');
  END IF;

  -- Mapear código do motivo para texto
  v_motivo_texto := CASE p_motivo
    WHEN 'encontrei_emprego_candidato' THEN 'Já encontrei meu emprego/candidato'
    WHEN 'nao_gostei_plataforma' THEN 'Não gostei da plataforma'
    WHEN 'plataforma_nao_atende' THEN 'A plataforma não me atende'
    WHEN 'nao_sei_usar' THEN 'Não sei mexer na plataforma'
    WHEN 'entrei_conhecer' THEN 'Entrei só para conhecer'
    WHEN 'nao_informar' THEN 'Não quero informar'
    ELSE p_motivo
  END;

  v_data_exclusao := NOW() + INTERVAL '30 days';

  -- Processar baseado no tipo
  IF p_usuario_tipo = 'candidato' THEN
    SELECT email, nome_completo, telefone
    INTO v_usuario_email, v_usuario_nome, v_usuario_telefone
    FROM candidatos_recrutamento WHERE id = p_usuario_id;

    IF v_usuario_email IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'Candidato não encontrado');
    END IF;

    UPDATE candidatos_recrutamento SET
      exclusao_solicitada = TRUE,
      exclusao_data_solicitacao = NOW(),
      exclusao_data_prevista = v_data_exclusao,
      exclusao_motivo = p_motivo
    WHERE id = p_usuario_id;

  ELSIF p_usuario_tipo = 'empresa' THEN
    SELECT socio_email, COALESCE(nome_fantasia, razao_social), socio_telefone
    INTO v_usuario_email, v_usuario_nome, v_usuario_telefone
    FROM empresas_recrutamento WHERE id = p_usuario_id;

    IF v_usuario_email IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'Empresa não encontrada');
    END IF;

    UPDATE empresas_recrutamento SET
      exclusao_solicitada = TRUE,
      exclusao_data_solicitacao = NOW(),
      exclusao_data_prevista = v_data_exclusao,
      exclusao_motivo = p_motivo
    WHERE id = p_usuario_id;

  ELSIF p_usuario_tipo = 'analista' THEN
    SELECT email, nome, telefone
    INTO v_usuario_email, v_usuario_nome, v_usuario_telefone
    FROM analistas WHERE id = p_usuario_id;

    IF v_usuario_email IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'Analista não encontrado');
    END IF;

    UPDATE analistas SET
      exclusao_solicitada = TRUE,
      exclusao_data_solicitacao = NOW(),
      exclusao_data_prevista = v_data_exclusao,
      exclusao_motivo = p_motivo,
      ativo = FALSE
    WHERE id = p_usuario_id;
  END IF;

  -- Registrar solicitação
  INSERT INTO solicitacoes_exclusao (
    usuario_id, usuario_tipo, usuario_email, usuario_nome, usuario_telefone,
    motivo, motivo_texto, comentario_adicional, data_exclusao_prevista
  ) VALUES (
    p_usuario_id, p_usuario_tipo, v_usuario_email, v_usuario_nome, v_usuario_telefone,
    p_motivo, v_motivo_texto, p_comentario, v_data_exclusao
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Solicitação de exclusão registrada',
    'data_exclusao_prevista', v_data_exclusao,
    'dias_restantes', 30
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', 'Erro interno: ' || SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grants
GRANT EXECUTE ON FUNCTION solicitar_exclusao_conta(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION solicitar_exclusao_conta(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION solicitar_exclusao_conta(UUID, TEXT, TEXT, TEXT) TO service_role;

-- 7. Garantir que a tabela solicitacoes_exclusao tem as policies corretas
ALTER TABLE solicitacoes_exclusao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_select" ON solicitacoes_exclusao;
CREATE POLICY "allow_all_select" ON solicitacoes_exclusao FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_all_insert" ON solicitacoes_exclusao;
CREATE POLICY "allow_all_insert" ON solicitacoes_exclusao FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_update" ON solicitacoes_exclusao;
CREATE POLICY "allow_all_update" ON solicitacoes_exclusao FOR UPDATE USING (true);

-- 8. Grant na tabela
GRANT SELECT, INSERT, UPDATE ON solicitacoes_exclusao TO authenticated;
GRANT SELECT, INSERT, UPDATE ON solicitacoes_exclusao TO anon;

SELECT 'Fix completo aplicado com sucesso!' as resultado;

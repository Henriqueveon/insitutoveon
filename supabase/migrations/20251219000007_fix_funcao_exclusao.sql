-- =====================================================
-- FIX: Recriar função de exclusão de conta
-- =====================================================

-- Garantir que a tabela existe
CREATE TABLE IF NOT EXISTS solicitacoes_exclusao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  usuario_tipo TEXT NOT NULL CHECK (usuario_tipo IN ('candidato', 'empresa', 'analista')),
  usuario_email TEXT NOT NULL,
  usuario_nome TEXT NOT NULL,
  usuario_telefone TEXT,
  motivo TEXT NOT NULL CHECK (motivo IN (
    'encontrei_emprego_candidato',
    'nao_gostei_plataforma',
    'plataforma_nao_atende',
    'nao_sei_usar',
    'entrei_conhecer',
    'nao_informar'
  )),
  motivo_texto TEXT,
  comentario_adicional TEXT,
  data_solicitacao TIMESTAMPTZ DEFAULT NOW(),
  data_exclusao_prevista TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'reativada', 'excluida', 'cancelada')),
  data_reativacao TIMESTAMPTZ,
  data_exclusao_efetiva TIMESTAMPTZ,
  ip_solicitacao TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE solicitacoes_exclusao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exclusao_select_all" ON solicitacoes_exclusao;
CREATE POLICY "exclusao_select_all" ON solicitacoes_exclusao FOR SELECT USING (true);

DROP POLICY IF EXISTS "exclusao_insert_all" ON solicitacoes_exclusao;
CREATE POLICY "exclusao_insert_all" ON solicitacoes_exclusao FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "exclusao_update_all" ON solicitacoes_exclusao;
CREATE POLICY "exclusao_update_all" ON solicitacoes_exclusao FOR UPDATE USING (true);

-- Dropar função existente para recriar
DROP FUNCTION IF EXISTS solicitar_exclusao_conta(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS solicitar_exclusao_conta(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);

-- Criar função
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
  v_motivo_texto := CASE p_motivo
    WHEN 'encontrei_emprego_candidato' THEN 'Já encontrei meu emprego/candidato'
    WHEN 'nao_gostei_plataforma' THEN 'Não gostei da plataforma'
    WHEN 'plataforma_nao_atende' THEN 'A plataforma não me atende'
    WHEN 'nao_sei_usar' THEN 'Não sei mexer na plataforma'
    WHEN 'entrei_conhecer' THEN 'Entrei só para conhecer'
    WHEN 'nao_informar' THEN 'Não quero informar'
    ELSE 'Motivo não especificado'
  END;

  v_data_exclusao := NOW() + INTERVAL '30 days';

  IF p_usuario_tipo = 'candidato' THEN
    SELECT email, nome_completo, telefone
    INTO v_usuario_email, v_usuario_nome, v_usuario_telefone
    FROM candidatos_recrutamento WHERE id = p_usuario_id;

    UPDATE candidatos_recrutamento SET
      exclusao_solicitada = TRUE,
      exclusao_data_solicitacao = NOW(),
      exclusao_data_prevista = v_data_exclusao,
      exclusao_motivo = p_motivo,
      status = 'exclusao_pendente'
    WHERE id = p_usuario_id;

  ELSIF p_usuario_tipo = 'empresa' THEN
    SELECT socio_email, COALESCE(nome_fantasia, razao_social), socio_telefone
    INTO v_usuario_email, v_usuario_nome, v_usuario_telefone
    FROM empresas_recrutamento WHERE id = p_usuario_id;

    UPDATE empresas_recrutamento SET
      exclusao_solicitada = TRUE,
      exclusao_data_solicitacao = NOW(),
      exclusao_data_prevista = v_data_exclusao,
      exclusao_motivo = p_motivo,
      status = 'exclusao_pendente'
    WHERE id = p_usuario_id;

  ELSIF p_usuario_tipo = 'analista' THEN
    SELECT email, nome, telefone
    INTO v_usuario_email, v_usuario_nome, v_usuario_telefone
    FROM analistas WHERE id = p_usuario_id;

    UPDATE analistas SET
      exclusao_solicitada = TRUE,
      exclusao_data_solicitacao = NOW(),
      exclusao_data_prevista = v_data_exclusao,
      exclusao_motivo = p_motivo,
      ativo = FALSE
    WHERE id = p_usuario_id;
  ELSE
    RETURN json_build_object('success', false, 'error', 'Tipo de usuário inválido');
  END IF;

  IF v_usuario_email IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;

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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants
GRANT EXECUTE ON FUNCTION solicitar_exclusao_conta(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION solicitar_exclusao_conta(UUID, TEXT, TEXT, TEXT) TO anon;

-- Função reativar
DROP FUNCTION IF EXISTS reativar_conta_se_pendente(UUID, TEXT);

CREATE OR REPLACE FUNCTION reativar_conta_se_pendente(
  p_usuario_id UUID,
  p_usuario_tipo TEXT
) RETURNS JSON AS $$
DECLARE
  v_exclusao_pendente BOOLEAN := FALSE;
BEGIN
  IF p_usuario_tipo = 'candidato' THEN
    SELECT COALESCE(exclusao_solicitada, FALSE) INTO v_exclusao_pendente
    FROM candidatos_recrutamento WHERE id = p_usuario_id;

    IF v_exclusao_pendente THEN
      UPDATE candidatos_recrutamento SET
        exclusao_solicitada = FALSE,
        exclusao_data_solicitacao = NULL,
        exclusao_data_prevista = NULL,
        exclusao_motivo = NULL,
        status = 'disponivel'
      WHERE id = p_usuario_id;
    END IF;

  ELSIF p_usuario_tipo = 'empresa' THEN
    SELECT COALESCE(exclusao_solicitada, FALSE) INTO v_exclusao_pendente
    FROM empresas_recrutamento WHERE id = p_usuario_id;

    IF v_exclusao_pendente THEN
      UPDATE empresas_recrutamento SET
        exclusao_solicitada = FALSE,
        exclusao_data_solicitacao = NULL,
        exclusao_data_prevista = NULL,
        exclusao_motivo = NULL,
        status = 'ativo'
      WHERE id = p_usuario_id;
    END IF;

  ELSIF p_usuario_tipo = 'analista' THEN
    SELECT COALESCE(exclusao_solicitada, FALSE) INTO v_exclusao_pendente
    FROM analistas WHERE id = p_usuario_id;

    IF v_exclusao_pendente THEN
      UPDATE analistas SET
        exclusao_solicitada = FALSE,
        exclusao_data_solicitacao = NULL,
        exclusao_data_prevista = NULL,
        exclusao_motivo = NULL,
        ativo = TRUE
      WHERE id = p_usuario_id;
    END IF;
  END IF;

  IF v_exclusao_pendente THEN
    UPDATE solicitacoes_exclusao SET
      status = 'reativada',
      data_reativacao = NOW()
    WHERE usuario_id = p_usuario_id
      AND usuario_tipo = p_usuario_tipo
      AND status = 'pendente';

    RETURN json_build_object(
      'reativada', true,
      'message', 'Sua conta foi reativada com sucesso!'
    );
  END IF;

  RETURN json_build_object('reativada', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION reativar_conta_se_pendente(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reativar_conta_se_pendente(UUID, TEXT) TO anon;

-- Views
DROP VIEW IF EXISTS vw_monitoramento_exclusoes;
CREATE VIEW vw_monitoramento_exclusoes AS
SELECT
  se.id,
  se.usuario_id,
  se.usuario_tipo,
  se.usuario_nome,
  se.usuario_email,
  se.usuario_telefone,
  se.motivo,
  se.motivo_texto,
  se.comentario_adicional,
  se.data_solicitacao,
  se.data_exclusao_prevista,
  GREATEST(0, EXTRACT(DAY FROM (se.data_exclusao_prevista - NOW()))::INT) as dias_restantes,
  se.status,
  se.data_reativacao,
  se.data_exclusao_efetiva,
  se.created_at
FROM solicitacoes_exclusao se
ORDER BY
  CASE se.status
    WHEN 'pendente' THEN 1
    WHEN 'reativada' THEN 2
    WHEN 'excluida' THEN 3
    ELSE 4
  END,
  se.data_exclusao_prevista ASC;

DROP VIEW IF EXISTS vw_estatisticas_exclusoes;
CREATE VIEW vw_estatisticas_exclusoes AS
SELECT
  COUNT(*) FILTER (WHERE status = 'pendente') as total_pendentes,
  COUNT(*) FILTER (WHERE status = 'reativada') as total_reativadas,
  COUNT(*) FILTER (WHERE status = 'excluida') as total_excluidas,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'pendente' AND data_exclusao_prevista <= NOW() + INTERVAL '7 days') as exclusoes_proximos_7_dias,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'reativada')::NUMERIC /
    NULLIF(COUNT(*) FILTER (WHERE status IN ('reativada', 'excluida')), 0) * 100,
    1
  ) as percentual_reativacao
FROM solicitacoes_exclusao;

SELECT 'Função solicitar_exclusao_conta recriada com sucesso!' as resultado;

-- =====================================================
-- SISTEMA DE EXCLUSÃO DE CONTAS COM MONITORAMENTO
-- =====================================================

-- Garantir extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CRIAR TABELA DE SOLICITAÇÕES DE EXCLUSÃO
-- =====================================================

CREATE TABLE IF NOT EXISTS solicitacoes_exclusao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação do usuário
  usuario_id UUID NOT NULL,
  usuario_tipo TEXT NOT NULL CHECK (usuario_tipo IN ('candidato', 'empresa', 'analista')),
  usuario_email TEXT NOT NULL,
  usuario_nome TEXT NOT NULL,
  usuario_telefone TEXT,

  -- Motivo da exclusão
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

  -- Controle de exclusão
  data_solicitacao TIMESTAMPTZ DEFAULT NOW(),
  data_exclusao_prevista TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),

  -- Status
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'reativada', 'excluida', 'cancelada')),
  data_reativacao TIMESTAMPTZ,
  data_exclusao_efetiva TIMESTAMPTZ,

  -- Metadados
  ip_solicitacao TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_exclusao_usuario ON solicitacoes_exclusao(usuario_id, usuario_tipo);
CREATE INDEX IF NOT EXISTS idx_exclusao_status ON solicitacoes_exclusao(status);
CREATE INDEX IF NOT EXISTS idx_exclusao_data_prevista ON solicitacoes_exclusao(data_exclusao_prevista);

-- RLS
ALTER TABLE solicitacoes_exclusao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exclusao_select_all" ON solicitacoes_exclusao;
CREATE POLICY "exclusao_select_all" ON solicitacoes_exclusao FOR SELECT USING (true);

DROP POLICY IF EXISTS "exclusao_insert_all" ON solicitacoes_exclusao;
CREATE POLICY "exclusao_insert_all" ON solicitacoes_exclusao FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "exclusao_update_all" ON solicitacoes_exclusao;
CREATE POLICY "exclusao_update_all" ON solicitacoes_exclusao FOR UPDATE USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_exclusao_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_exclusao_updated ON solicitacoes_exclusao;
CREATE TRIGGER trigger_exclusao_updated
BEFORE UPDATE ON solicitacoes_exclusao
FOR EACH ROW EXECUTE FUNCTION update_exclusao_timestamp();

-- =====================================================
-- 2. ADICIONAR CAMPOS NAS TABELAS DE USUÁRIOS
-- =====================================================

-- Candidatos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'exclusao_solicitada') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN exclusao_solicitada BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'exclusao_data_solicitacao') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN exclusao_data_solicitacao TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'exclusao_data_prevista') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN exclusao_data_prevista TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidatos_recrutamento' AND column_name = 'exclusao_motivo') THEN
    ALTER TABLE candidatos_recrutamento ADD COLUMN exclusao_motivo TEXT;
  END IF;
END $$;

-- Empresas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'exclusao_solicitada') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN exclusao_solicitada BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'exclusao_data_solicitacao') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN exclusao_data_solicitacao TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'exclusao_data_prevista') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN exclusao_data_prevista TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas_recrutamento' AND column_name = 'exclusao_motivo') THEN
    ALTER TABLE empresas_recrutamento ADD COLUMN exclusao_motivo TEXT;
  END IF;
END $$;

-- Analistas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'exclusao_solicitada') THEN
    ALTER TABLE analistas ADD COLUMN exclusao_solicitada BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'exclusao_data_solicitacao') THEN
    ALTER TABLE analistas ADD COLUMN exclusao_data_solicitacao TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'exclusao_data_prevista') THEN
    ALTER TABLE analistas ADD COLUMN exclusao_data_prevista TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analistas' AND column_name = 'exclusao_motivo') THEN
    ALTER TABLE analistas ADD COLUMN exclusao_motivo TEXT;
  END IF;
END $$;

-- =====================================================
-- 3. FUNÇÃO PARA SOLICITAR EXCLUSÃO
-- =====================================================

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
  -- Mapear código do motivo para texto
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

  -- Buscar dados do usuário baseado no tipo
  IF p_usuario_tipo = 'candidato' THEN
    SELECT email, nome_completo, telefone
    INTO v_usuario_email, v_usuario_nome, v_usuario_telefone
    FROM candidatos_recrutamento WHERE id = p_usuario_id;

    -- Marcar candidato para exclusão
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

  -- Verificar se encontrou o usuário
  IF v_usuario_email IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuário não encontrado');
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION solicitar_exclusao_conta TO authenticated;
GRANT EXECUTE ON FUNCTION solicitar_exclusao_conta TO anon;

-- =====================================================
-- 4. FUNÇÃO PARA REATIVAR CONTA (NO LOGIN)
-- =====================================================

CREATE OR REPLACE FUNCTION reativar_conta_se_pendente(
  p_usuario_id UUID,
  p_usuario_tipo TEXT
) RETURNS JSON AS $$
DECLARE
  v_exclusao_pendente BOOLEAN := FALSE;
BEGIN
  -- Verificar se há exclusão pendente
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

  -- Atualizar registro de exclusão
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

GRANT EXECUTE ON FUNCTION reativar_conta_se_pendente TO authenticated;
GRANT EXECUTE ON FUNCTION reativar_conta_se_pendente TO anon;

-- =====================================================
-- 5. FUNÇÃO PARA EXCLUSÃO AUTOMÁTICA (CRON JOB)
-- =====================================================

CREATE OR REPLACE FUNCTION executar_exclusoes_pendentes()
RETURNS JSON AS $$
DECLARE
  v_count INT := 0;
  v_exclusao RECORD;
BEGIN
  -- Buscar todas as exclusões vencidas
  FOR v_exclusao IN
    SELECT * FROM solicitacoes_exclusao
    WHERE status = 'pendente'
    AND data_exclusao_prevista <= NOW()
  LOOP
    -- Excluir baseado no tipo (anonimizar dados - LGPD)
    IF v_exclusao.usuario_tipo = 'candidato' THEN
      UPDATE candidatos_recrutamento SET
        nome_completo = 'Usuário Excluído',
        nome = 'Usuário Excluído',
        email = 'excluido_' || v_exclusao.usuario_id || '@removed.com',
        telefone = NULL,
        cpf = NULL,
        data_nascimento = NULL,
        instagram = NULL,
        status = 'excluido',
        exclusao_solicitada = FALSE
      WHERE id = v_exclusao.usuario_id;

    ELSIF v_exclusao.usuario_tipo = 'empresa' THEN
      UPDATE empresas_recrutamento SET
        socio_nome = 'Empresa Excluída',
        socio_email = 'excluido_' || v_exclusao.usuario_id || '@removed.com',
        socio_telefone = NULL,
        socio_cpf = NULL,
        status = 'excluido',
        exclusao_solicitada = FALSE
      WHERE id = v_exclusao.usuario_id;

    ELSIF v_exclusao.usuario_tipo = 'analista' THEN
      UPDATE analistas SET
        nome = 'Analista Excluído',
        email = 'excluido_' || v_exclusao.usuario_id || '@removed.com',
        telefone = NULL,
        ativo = FALSE,
        exclusao_solicitada = FALSE
      WHERE id = v_exclusao.usuario_id;
    END IF;

    -- Atualizar status da solicitação
    UPDATE solicitacoes_exclusao SET
      status = 'excluida',
      data_exclusao_efetiva = NOW()
    WHERE id = v_exclusao.id;

    v_count := v_count + 1;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'contas_excluidas', v_count,
    'executado_em', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. VIEW PARA MONITORAMENTO
-- =====================================================

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

-- =====================================================
-- 7. VIEW DE ESTATÍSTICAS
-- =====================================================

DROP VIEW IF EXISTS vw_estatisticas_exclusoes;
CREATE VIEW vw_estatisticas_exclusoes AS
SELECT
  COUNT(*) FILTER (WHERE status = 'pendente') as pendentes,
  COUNT(*) FILTER (WHERE status = 'reativada') as reativadas,
  COUNT(*) FILTER (WHERE status = 'excluida') as excluidas,
  COUNT(*) as total,

  COUNT(*) FILTER (WHERE motivo = 'encontrei_emprego_candidato' AND status = 'pendente') as motivo_encontrei_emprego,
  COUNT(*) FILTER (WHERE motivo = 'nao_gostei_plataforma' AND status = 'pendente') as motivo_nao_gostei,
  COUNT(*) FILTER (WHERE motivo = 'plataforma_nao_atende' AND status = 'pendente') as motivo_nao_atende,
  COUNT(*) FILTER (WHERE motivo = 'nao_sei_usar' AND status = 'pendente') as motivo_nao_sei_usar,
  COUNT(*) FILTER (WHERE motivo = 'entrei_conhecer' AND status = 'pendente') as motivo_conhecer,
  COUNT(*) FILTER (WHERE motivo = 'nao_informar' AND status = 'pendente') as motivo_nao_informar,

  COUNT(*) FILTER (WHERE usuario_tipo = 'candidato' AND status = 'pendente') as candidatos_pendentes,
  COUNT(*) FILTER (WHERE usuario_tipo = 'empresa' AND status = 'pendente') as empresas_pendentes,
  COUNT(*) FILTER (WHERE usuario_tipo = 'analista' AND status = 'pendente') as analistas_pendentes,

  COUNT(*) FILTER (WHERE status = 'pendente' AND data_exclusao_prevista <= NOW() + INTERVAL '7 days') as exclusoes_proximas,

  ROUND(
    COUNT(*) FILTER (WHERE status = 'reativada')::NUMERIC /
    NULLIF(COUNT(*) FILTER (WHERE status IN ('reativada', 'excluida')), 0) * 100,
    1
  ) as taxa_reativacao_percent

FROM solicitacoes_exclusao;

SELECT 'Sistema de exclusão de contas criado com sucesso!' as resultado;

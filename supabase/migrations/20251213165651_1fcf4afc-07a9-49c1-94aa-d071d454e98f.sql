-- =====================================================
-- MIGRAÇÃO: Área de Recrutamento VEON
-- Fase 1 - Criação das tabelas base
-- =====================================================

-- ============================================
-- TABELA: EMPRESAS RECRUTADORAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.empresas_recrutamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Dados do CNPJ (preenchidos automaticamente via API)
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    situacao_cadastral VARCHAR(50),
    data_abertura DATE,
    natureza_juridica VARCHAR(255),
    porte VARCHAR(50),
    capital_social DECIMAL(15,2),

    -- Endereço da empresa
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),

    -- Contato da empresa
    telefone_empresa VARCHAR(20),
    email_empresa VARCHAR(255),

    -- Dados do sócio responsável
    socio_nome VARCHAR(255) NOT NULL,
    socio_cpf VARCHAR(14) NOT NULL,
    socio_email VARCHAR(255) NOT NULL,
    socio_telefone VARCHAR(20) NOT NULL,
    socio_foto_url TEXT,

    -- Autenticação
    senha_hash VARCHAR(255) NOT NULL,

    -- Financeiro
    creditos DECIMAL(10,2) DEFAULT 0,
    cartao_token TEXT,

    -- Termos
    aceite_termos BOOLEAN DEFAULT FALSE,
    aceite_termos_data TIMESTAMP,
    aceite_lgpd BOOLEAN DEFAULT FALSE,
    aceite_lgpd_data TIMESTAMP,

    -- Controle
    status VARCHAR(20) DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABELA: CANDIDATOS RECRUTAMENTO
-- ============================================
CREATE TABLE IF NOT EXISTS public.candidatos_recrutamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- BLOCO 1: Dados Pessoais
    nome_completo VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    bairro VARCHAR(100),

    -- BLOCO 2: Situação Atual
    esta_trabalhando BOOLEAN,
    salario_atual VARCHAR(50),
    regime_atual VARCHAR(10),
    motivo_busca_oportunidade TEXT,
    disponibilidade_inicio VARCHAR(50),
    regime_preferido VARCHAR(20),

    -- BLOCO 3: Experiência Profissional
    ultima_empresa VARCHAR(255),
    ultimo_cargo VARCHAR(255),
    tempo_ultima_empresa VARCHAR(50),
    motivo_saida VARCHAR(255),
    areas_experiencia TEXT[],
    anos_experiencia INTEGER,

    -- BLOCO 4: Formação
    escolaridade VARCHAR(50),
    curso VARCHAR(255),
    certificacoes TEXT,

    -- BLOCO 5: Logística
    possui_veiculo VARCHAR(20),
    possui_cnh VARCHAR(10),
    disponibilidade_horario VARCHAR(50),
    aceita_viajar VARCHAR(20),
    aceita_mudanca VARCHAR(20),

    -- BLOCO 6: Vida Pessoal
    estado_civil VARCHAR(20),
    tem_filhos BOOLEAN,
    quantidade_filhos INTEGER,
    idade_filhos VARCHAR(100),
    instagram VARCHAR(100),

    -- BLOCO 7: Expectativas
    pretensao_salarial VARCHAR(50),
    valores_empresa TEXT[],
    areas_interesse TEXT[],
    objetivo_profissional TEXT,

    -- Mídia
    foto_url TEXT,
    video_url TEXT,
    video_duracao INTEGER,
    video_tipo VARCHAR(20),
    documento_url TEXT,
    documento_tipo VARCHAR(10),
    documento_verificado BOOLEAN DEFAULT FALSE,

    -- DISC e Valores
    teste_disc_id UUID,
    perfil_disc VARCHAR(10),
    perfil_valores JSONB,

    -- Status
    status VARCHAR(30) DEFAULT 'disponivel',
    recrutado_por_empresa_id UUID,
    recrutado_data TIMESTAMP,

    -- Termos
    aceite_termos BOOLEAN DEFAULT FALSE,
    aceite_termos_data TIMESTAMP,
    aceite_lgpd BOOLEAN DEFAULT FALSE,
    aceite_lgpd_data TIMESTAMP,

    -- Controle
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABELA: VAGAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.vagas_recrutamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES public.empresas_recrutamento(id) ON DELETE CASCADE,

    -- Dados da vaga
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    faixa_salarial_min DECIMAL(10,2),
    faixa_salarial_max DECIMAL(10,2),
    regime VARCHAR(20),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    modalidade VARCHAR(20),
    horario VARCHAR(50),
    beneficios TEXT[],
    requisitos TEXT[],

    -- Match DISC
    palavras_funcionario_ideal VARCHAR(255),
    perfil_disc_ideal VARCHAR(10),

    -- Status
    status VARCHAR(20) DEFAULT 'ativa',

    -- Controle
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABELA: SOLICITAÇÕES DE ENTREVISTA
-- ============================================
CREATE TABLE IF NOT EXISTS public.solicitacoes_entrevista (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    empresa_id UUID REFERENCES public.empresas_recrutamento(id),
    candidato_id UUID REFERENCES public.candidatos_recrutamento(id),
    vaga_id UUID REFERENCES public.vagas_recrutamento(id),

    -- Status do processo
    status VARCHAR(30) DEFAULT 'aguardando_candidato',

    -- Pagamentos
    empresa_pagou BOOLEAN DEFAULT FALSE,
    empresa_valor_pago DECIMAL(10,2),
    empresa_pagamento_data TIMESTAMP,
    empresa_pagamento_id VARCHAR(255),

    candidato_pagou BOOLEAN DEFAULT FALSE,
    candidato_valor_pago DECIMAL(10,2),
    candidato_pagamento_data TIMESTAMP,
    candidato_pagamento_id VARCHAR(255),

    -- Se recusado
    motivo_recusa VARCHAR(100),

    -- Dados liberados
    dados_liberados BOOLEAN DEFAULT FALSE,
    dados_liberados_data TIMESTAMP,

    -- Match
    match_percentual INTEGER,

    -- Controle
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expira_em TIMESTAMP
);

-- ============================================
-- TABELA: TRANSAÇÕES FINANCEIRAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.transacoes_recrutamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tipo VARCHAR(20) NOT NULL,
    usuario_id UUID NOT NULL,
    solicitacao_id UUID REFERENCES public.solicitacoes_entrevista(id),

    valor DECIMAL(10,2) NOT NULL,
    tipo_transacao VARCHAR(20),
    metodo_pagamento VARCHAR(20),

    status VARCHAR(20) DEFAULT 'pendente',

    gateway_id VARCHAR(255),
    gateway_response JSONB,

    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABELA: NOTIFICAÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS public.notificacoes_recrutamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tipo_destinatario VARCHAR(20) NOT NULL,
    destinatario_id UUID NOT NULL,

    tipo_notificacao VARCHAR(50) NOT NULL,

    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    dados JSONB,

    lida BOOLEAN DEFAULT FALSE,
    lida_em TIMESTAMP,

    enviada_whatsapp BOOLEAN DEFAULT FALSE,
    enviada_whatsapp_em TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_candidatos_rec_status ON public.candidatos_recrutamento(status);
CREATE INDEX IF NOT EXISTS idx_candidatos_rec_cidade ON public.candidatos_recrutamento(cidade, estado);
CREATE INDEX IF NOT EXISTS idx_candidatos_rec_perfil ON public.candidatos_recrutamento(perfil_disc);
CREATE INDEX IF NOT EXISTS idx_vagas_rec_status ON public.vagas_recrutamento(status);
CREATE INDEX IF NOT EXISTS idx_vagas_rec_empresa ON public.vagas_recrutamento(empresa_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON public.solicitacoes_entrevista(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_empresa ON public.solicitacoes_entrevista(empresa_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_candidato ON public.solicitacoes_entrevista(candidato_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_rec_destinatario ON public.notificacoes_recrutamento(tipo_destinatario, destinatario_id, lida);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE public.empresas_recrutamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidatos_recrutamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vagas_recrutamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_entrevista ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes_recrutamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes_recrutamento ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES BÁSICAS
-- ============================================
CREATE POLICY "Empresas podem se cadastrar"
ON public.empresas_recrutamento FOR INSERT
WITH CHECK (true);

CREATE POLICY "Candidatos podem se cadastrar"
ON public.candidatos_recrutamento FOR INSERT
WITH CHECK (true);

CREATE POLICY "Vagas ativas são públicas"
ON public.vagas_recrutamento FOR SELECT
USING (status = 'ativa');

CREATE POLICY "Leitura pública de candidatos disponíveis"
ON public.candidatos_recrutamento FOR SELECT
USING (status IN ('disponivel', 'em_processo'));

CREATE POLICY "Leitura pública de empresas ativas"
ON public.empresas_recrutamento FOR SELECT
USING (status = 'ativo');

CREATE POLICY "Solicitações podem ser criadas"
ON public.solicitacoes_entrevista FOR INSERT
WITH CHECK (true);

CREATE POLICY "Solicitações podem ser lidas pelos envolvidos"
ON public.solicitacoes_entrevista FOR SELECT
USING (true);

CREATE POLICY "Solicitações podem ser atualizadas"
ON public.solicitacoes_entrevista FOR UPDATE
USING (true);

CREATE POLICY "Transações podem ser criadas"
ON public.transacoes_recrutamento FOR INSERT
WITH CHECK (true);

CREATE POLICY "Transações podem ser lidas"
ON public.transacoes_recrutamento FOR SELECT
USING (true);

CREATE POLICY "Notificações podem ser criadas"
ON public.notificacoes_recrutamento FOR INSERT
WITH CHECK (true);

CREATE POLICY "Notificações podem ser lidas"
ON public.notificacoes_recrutamento FOR SELECT
USING (true);

CREATE POLICY "Notificações podem ser atualizadas"
ON public.notificacoes_recrutamento FOR UPDATE
USING (true);
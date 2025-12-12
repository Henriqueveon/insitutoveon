-- Tabela de solicitações de licenças dos analistas
CREATE TABLE IF NOT EXISTS solicitacoes_licencas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analista_id UUID NOT NULL REFERENCES analistas(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    mensagem TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
    resposta_gestor TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_solicitacoes_analista ON solicitacoes_licencas(analista_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes_licencas(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_created ON solicitacoes_licencas(created_at DESC);

-- Habilitar RLS
ALTER TABLE solicitacoes_licencas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Qualquer um pode ver solicitacoes"
    ON solicitacoes_licencas FOR SELECT
    USING (true);

CREATE POLICY "Qualquer um pode inserir solicitacoes"
    ON solicitacoes_licencas FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar solicitacoes"
    ON solicitacoes_licencas FOR UPDATE
    USING (true);

-- Criar tabela de analistas
CREATE TABLE IF NOT EXISTS public.analistas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    telefone TEXT,
    empresa TEXT,
    tipo TEXT CHECK (tipo IN ('coach', 'psicologo', 'empresa', 'rh', 'escola', 'outro')),
    licencas_total INTEGER DEFAULT 0,
    licencas_usadas INTEGER DEFAULT 0,
    link_unico TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    ativo BOOLEAN DEFAULT true,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultimo_acesso TIMESTAMP WITH TIME ZONE,
    cpf_cnpj TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.analistas ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (para login)
CREATE POLICY "Permitir leitura pública de analistas" ON public.analistas
    FOR SELECT USING (true);

-- Política para inserção (admins)
CREATE POLICY "Admins podem inserir analistas" ON public.analistas
    FOR INSERT WITH CHECK (true);

-- Política para atualização (admins)
CREATE POLICY "Admins podem atualizar analistas" ON public.analistas
    FOR UPDATE USING (true);

-- Adicionar coluna analista_id na tabela de candidatos
ALTER TABLE public.candidatos_disc
ADD COLUMN IF NOT EXISTS analista_id UUID REFERENCES public.analistas(id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_candidatos_analista ON public.candidatos_disc(analista_id);
CREATE INDEX IF NOT EXISTS idx_analistas_email ON public.analistas(email);
CREATE INDEX IF NOT EXISTS idx_analistas_link ON public.analistas(link_unico);
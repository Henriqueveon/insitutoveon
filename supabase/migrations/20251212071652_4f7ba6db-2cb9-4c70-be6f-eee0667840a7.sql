-- Adicionar colunas faltantes na tabela candidatos_disc
ALTER TABLE public.candidatos_disc
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS perfil_natural JSONB,
ADD COLUMN IF NOT EXISTS perfil_adaptado JSONB,
ADD COLUMN IF NOT EXISTS perfil_tipo VARCHAR(50),
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pendente';
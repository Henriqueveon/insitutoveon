-- Tornar campos opcionais na tabela candidatos_recrutamento
ALTER TABLE public.candidatos_recrutamento ALTER COLUMN data_nascimento DROP NOT NULL;
ALTER TABLE public.candidatos_recrutamento ALTER COLUMN cpf DROP NOT NULL;
ALTER TABLE public.candidatos_recrutamento ALTER COLUMN estado DROP NOT NULL;
ALTER TABLE public.candidatos_recrutamento ALTER COLUMN cidade DROP NOT NULL;
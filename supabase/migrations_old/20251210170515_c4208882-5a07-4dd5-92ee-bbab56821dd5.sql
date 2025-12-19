-- Create table for DISC candidates
CREATE TABLE public.candidatos_disc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo VARCHAR(255) NOT NULL,
  telefone_whatsapp VARCHAR(20) NOT NULL,
  cargo_atual VARCHAR(100) NOT NULL,
  empresa_instagram VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.candidatos_disc ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can insert candidates"
ON public.candidatos_disc
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read (for admin functionality - we'll add proper auth later)
CREATE POLICY "Anyone can read candidates"
ON public.candidatos_disc
FOR SELECT
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_candidatos_disc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_candidatos_disc_updated_at
BEFORE UPDATE ON public.candidatos_disc
FOR EACH ROW
EXECUTE FUNCTION public.update_candidatos_disc_updated_at();
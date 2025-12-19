-- Remover políticas restritivas existentes
DROP POLICY IF EXISTS "Apenas admins podem ler candidatos" ON public.candidatos_disc;
DROP POLICY IF EXISTS "Apenas admins podem atualizar candidatos" ON public.candidatos_disc;
DROP POLICY IF EXISTS "Público pode ler candidatos" ON public.candidatos_disc;
DROP POLICY IF EXISTS "Público pode atualizar candidatos" ON public.candidatos_disc;

-- Criar política de leitura pública
CREATE POLICY "Público pode ler candidatos" 
ON public.candidatos_disc 
FOR SELECT 
USING (true);

-- Manter atualização apenas para admins (mais seguro)
CREATE POLICY "Admins podem atualizar candidatos" 
ON public.candidatos_disc 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));
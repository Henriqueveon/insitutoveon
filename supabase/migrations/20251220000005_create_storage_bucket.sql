-- =====================================================
-- CRIAR BUCKET DE STORAGE PARA RECRUTAMENTO
-- Este bucket armazena fotos de perfil, vídeos e destaques
-- quando o Cloudflare R2 não está configurado (fallback)
-- =====================================================

-- Criar bucket "recrutamento" se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recrutamento',
  'recrutamento',
  true,  -- público para visualização
  NULL,  -- sem limite de tamanho
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de acesso para o bucket

-- Política de SELECT (visualização pública)
DROP POLICY IF EXISTS "Acesso público de leitura" ON storage.objects;
CREATE POLICY "Acesso público de leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'recrutamento');

-- Política de INSERT (usuários autenticados podem fazer upload)
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'recrutamento'
  AND auth.role() = 'authenticated'
);

-- Política de UPDATE (usuários podem atualizar seus próprios arquivos)
DROP POLICY IF EXISTS "Usuários podem atualizar próprios arquivos" ON storage.objects;
CREATE POLICY "Usuários podem atualizar próprios arquivos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'recrutamento'
  AND auth.role() = 'authenticated'
);

-- Política de DELETE (usuários podem deletar seus próprios arquivos)
DROP POLICY IF EXISTS "Usuários podem deletar próprios arquivos" ON storage.objects;
CREATE POLICY "Usuários podem deletar próprios arquivos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'recrutamento'
  AND auth.role() = 'authenticated'
);

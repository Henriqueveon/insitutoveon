-- Make the 'teste' bucket public so PDF URLs are accessible
UPDATE storage.buckets 
SET public = true 
WHERE id = 'teste';

-- Drop existing policies to recreate them safely
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to pdfs folder" ON storage.objects;

-- Create policy for public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'teste');

-- Create policy for public uploads to pdfs folder
CREATE POLICY "Allow public uploads to pdfs folder"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'teste' AND (storage.foldername(name))[1] = 'pdfs');
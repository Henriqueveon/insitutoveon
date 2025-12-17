// =====================================================
// SUPABASE EDGE FUNCTION - R2 Storage
// Gerencia uploads, downloads e exclusão de arquivos no Cloudflare R2
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from 'npm:@aws-sdk/client-s3';
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuração do cliente R2
const R2 = new S3Client({
  region: 'auto',
  endpoint: Deno.env.get('R2_ENDPOINT'),
  credentials: {
    accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID') || '',
    secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY') || '',
  },
});

const BUCKET_NAME = Deno.env.get('R2_BUCKET_NAME') || 'recruta-veon';
const PUBLIC_URL = Deno.env.get('R2_PUBLIC_URL') || 'https://pub-0f558b5290ad49e0bd19160872aa52dc.r2.dev';

interface UploadRequest {
  action: 'upload' | 'delete' | 'getSignedUrl' | 'getPublicUrl';
  path: string;
  contentType?: string;
  expiresIn?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, path, contentType, expiresIn = 3600 }: UploadRequest = await req.json();

    switch (action) {
      case 'getSignedUrl': {
        // Gera URL assinada para upload direto
        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: path,
          ContentType: contentType || 'application/octet-stream',
        });

        const signedUrl = await getSignedUrl(R2, command, { expiresIn });

        return new Response(
          JSON.stringify({
            success: true,
            signedUrl,
            publicUrl: `${PUBLIC_URL}/${path}`,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'delete': {
        // Deleta arquivo do R2
        const command = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: path,
        });

        await R2.send(command);

        return new Response(
          JSON.stringify({
            success: true,
            message: `Arquivo ${path} deletado com sucesso`,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'getPublicUrl': {
        return new Response(
          JSON.stringify({
            success: true,
            publicUrl: `${PUBLIC_URL}/${path}`,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Ação inválida' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }
  } catch (error) {
    console.error('Erro no R2 Storage:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

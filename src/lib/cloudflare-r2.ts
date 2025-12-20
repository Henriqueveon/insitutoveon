// =====================================================
// CLOUDFLARE R2 - Configuração e funções de upload
// =====================================================

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Credenciais Cloudflare R2
// IMPORTANTE: Em produção, usar variáveis de ambiente
const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID || "51417a6d9fab76ef20513ae7e9a87093";
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME || "veon-recrutamento";
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || `https://pub-${R2_ACCOUNT_ID}.r2.dev`;

// Verificar se as credenciais estão configuradas
export const isR2Configured = () => {
  return Boolean(R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
};

// Cliente S3 para R2
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload de arquivo para o R2
 * @param file - Arquivo a ser enviado
 * @param path - Caminho no bucket (ex: "fotos/candidato-123/foto.jpg")
 * @returns URL pública do arquivo
 */
export async function uploadToR2(file: File, path: string): Promise<string> {
  if (!isR2Configured()) {
    throw new Error("Cloudflare R2 não está configurado. Verifique as variáveis de ambiente.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: path,
    Body: buffer,
    ContentType: file.type,
    // Metadados opcionais
    Metadata: {
      "original-name": encodeURIComponent(file.name),
      "uploaded-at": new Date().toISOString(),
    },
  });

  await r2Client.send(command);

  return `${R2_PUBLIC_URL}/${path}`;
}

/**
 * Upload de arquivo a partir de base64
 * @param base64Data - Dados em base64
 * @param path - Caminho no bucket
 * @param contentType - Tipo do conteúdo (ex: "image/jpeg")
 * @returns URL pública do arquivo
 */
export async function uploadBase64ToR2(
  base64Data: string,
  path: string,
  contentType: string
): Promise<string> {
  if (!isR2Configured()) {
    throw new Error("Cloudflare R2 não está configurado. Verifique as variáveis de ambiente.");
  }

  // Remover prefixo data:image/... se existir
  const base64Content = base64Data.includes(",")
    ? base64Data.split(",")[1]
    : base64Data;

  // Converter base64 para buffer
  const binaryString = atob(base64Content);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: path,
    Body: bytes,
    ContentType: contentType,
  });

  await r2Client.send(command);

  return `${R2_PUBLIC_URL}/${path}`;
}

/**
 * Deletar arquivo do R2
 * @param path - Caminho do arquivo no bucket
 */
export async function deleteFromR2(path: string): Promise<void> {
  if (!isR2Configured()) {
    throw new Error("Cloudflare R2 não está configurado. Verifique as variáveis de ambiente.");
  }

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: path,
  });

  await r2Client.send(command);
}

/**
 * Gerar caminho para arquivo
 * @param tipo - Tipo de arquivo (fotos-perfil, videos, destaques)
 * @param userId - ID do usuário
 * @param fileName - Nome do arquivo
 */
export function gerarCaminhoArquivo(
  tipo: "fotos-perfil" | "videos" | "destaques" | "documentos",
  userId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  return `${tipo}/${userId}/${timestamp}.${extension}`;
}

/**
 * Validar arquivo antes do upload
 * @param file - Arquivo a ser validado
 * @param tipo - Tipo de upload
 */
export function validarArquivo(
  file: File,
  tipo: "imagem" | "video"
): { valido: boolean; erro?: string } {
  const maxSizeImagem = 10 * 1024 * 1024; // 10MB
  const maxSizeVideo = 100 * 1024 * 1024; // 100MB

  const tiposImagemPermitidos = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const tiposVideoPermitidos = ["video/mp4", "video/webm", "video/quicktime"];

  if (tipo === "imagem") {
    if (!tiposImagemPermitidos.includes(file.type)) {
      return {
        valido: false,
        erro: "Formato de imagem não suportado. Use JPG, PNG, WebP ou GIF.",
      };
    }
    if (file.size > maxSizeImagem) {
      return {
        valido: false,
        erro: "Imagem muito grande. O tamanho máximo é 10MB.",
      };
    }
  }

  if (tipo === "video") {
    if (!tiposVideoPermitidos.includes(file.type)) {
      return {
        valido: false,
        erro: "Formato de vídeo não suportado. Use MP4, WebM ou MOV.",
      };
    }
    if (file.size > maxSizeVideo) {
      return {
        valido: false,
        erro: "Vídeo muito grande. O tamanho máximo é 100MB.",
      };
    }
  }

  return { valido: true };
}

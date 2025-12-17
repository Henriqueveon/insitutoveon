// =====================================================
// SERVIÇO DE STORAGE R2 - Frontend
// Integração com Cloudflare R2 via Supabase Edge Functions
// =====================================================

import { supabase } from '@/integrations/supabase/client';

// Tipos de arquivos suportados
export type FileCategory = 'candidatos' | 'empresas' | 'vagas';
export type FileType = 'foto' | 'curriculo' | 'video' | 'logo' | 'imagem';

// Interface para resposta do upload
export interface UploadResponse {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

// Interface para configuração de upload
export interface UploadConfig {
  category: FileCategory;
  entityId: string;
  fileType: FileType;
  file: File;
  onProgress?: (progress: number) => void;
}

// URL pública do R2 (configurável via env)
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || 'https://pub-0f558b5290ad49e0bd19160872aa52dc.r2.dev';

/**
 * Gera o caminho do arquivo no R2
 * Estrutura: /categoria/id/tipo.extensao
 */
export function generateFilePath(
  category: FileCategory,
  entityId: string,
  fileType: FileType,
  fileName: string
): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const timestamp = Date.now();

  // Define nome do arquivo baseado no tipo
  const fileNameMap: Record<FileType, string> = {
    foto: `foto-${timestamp}.${extension}`,
    curriculo: `curriculo-${timestamp}.${extension}`,
    video: `video-entrevista-${timestamp}.${extension}`,
    logo: `logo-${timestamp}.${extension}`,
    imagem: `imagem-${timestamp}.${extension}`,
  };

  return `${category}/${entityId}/${fileNameMap[fileType]}`;
}

/**
 * Obtém URL assinada para upload direto no R2
 */
export async function getSignedUploadUrl(
  path: string,
  contentType: string
): Promise<{ signedUrl: string; publicUrl: string } | null> {
  try {
    const { data, error } = await supabase.functions.invoke('r2-storage', {
      body: {
        action: 'getSignedUrl',
        path,
        contentType,
        expiresIn: 3600, // 1 hora
      },
    });

    if (error) {
      console.error('Erro ao obter URL assinada:', error);
      return null;
    }

    return {
      signedUrl: data.signedUrl,
      publicUrl: data.publicUrl,
    };
  } catch (error) {
    console.error('Erro ao obter URL assinada:', error);
    return null;
  }
}

/**
 * Faz upload de arquivo para o R2
 * Usa URL assinada para upload direto
 */
export async function uploadFile(config: UploadConfig): Promise<UploadResponse> {
  const { category, entityId, fileType, file, onProgress } = config;

  try {
    // Validar arquivo
    const validation = validateFile(file, fileType);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Gerar caminho do arquivo
    const filePath = generateFilePath(category, entityId, fileType, file.name);

    // Obter URL assinada
    const urlData = await getSignedUploadUrl(filePath, file.type);
    if (!urlData) {
      return { success: false, error: 'Não foi possível obter URL de upload' };
    }

    // Fazer upload direto para o R2
    const response = await uploadWithProgress(urlData.signedUrl, file, onProgress);

    if (!response.ok) {
      return { success: false, error: 'Falha no upload do arquivo' };
    }

    return {
      success: true,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Erro no upload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido no upload',
    };
  }
}

/**
 * Upload com acompanhamento de progresso
 */
async function uploadWithProgress(
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      resolve(new Response(xhr.responseText, { status: xhr.status }));
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Erro na conexão'));
    });

    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

/**
 * Deleta arquivo do R2
 */
export async function deleteFile(path: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('r2-storage', {
      body: {
        action: 'delete',
        path,
      },
    });

    if (error) {
      console.error('Erro ao deletar arquivo:', error);
      return false;
    }

    return data.success;
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return false;
  }
}

/**
 * Gera URL pública para um arquivo
 */
export function getPublicUrl(path: string): string {
  return `${R2_PUBLIC_URL}/${path}`;
}

/**
 * Extrai o path do R2 a partir de uma URL pública
 */
export function extractPathFromUrl(publicUrl: string): string | null {
  if (!publicUrl.startsWith(R2_PUBLIC_URL)) {
    return null;
  }
  return publicUrl.replace(`${R2_PUBLIC_URL}/`, '');
}

/**
 * Valida arquivo antes do upload
 */
export function validateFile(
  file: File,
  fileType: FileType
): { valid: boolean; error?: string } {
  // Limites de tamanho (em bytes)
  const sizeLimits: Record<FileType, number> = {
    foto: 5 * 1024 * 1024,      // 5MB
    logo: 2 * 1024 * 1024,      // 2MB
    imagem: 5 * 1024 * 1024,    // 5MB
    curriculo: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024,   // 100MB
  };

  // Tipos MIME permitidos
  const allowedTypes: Record<FileType, string[]> = {
    foto: ['image/jpeg', 'image/png', 'image/webp'],
    logo: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    imagem: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    curriculo: ['application/pdf'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
  };

  // Verificar tamanho
  if (file.size > sizeLimits[fileType]) {
    const maxSizeMB = sizeLimits[fileType] / (1024 * 1024);
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`,
    };
  }

  // Verificar tipo
  if (!allowedTypes[fileType].includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes[fileType].join(', ')}`,
    };
  }

  return { valid: true };
}

// =====================================================
// FUNÇÕES ESPECÍFICAS POR TIPO DE ARQUIVO
// =====================================================

/**
 * Upload de foto do candidato
 */
export async function uploadFotoCandidato(
  candidatoId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  return uploadFile({
    category: 'candidatos',
    entityId: candidatoId,
    fileType: 'foto',
    file,
    onProgress,
  });
}

/**
 * Upload de currículo do candidato
 */
export async function uploadCurriculoCandidato(
  candidatoId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  return uploadFile({
    category: 'candidatos',
    entityId: candidatoId,
    fileType: 'curriculo',
    file,
    onProgress,
  });
}

/**
 * Upload de vídeo de entrevista do candidato
 */
export async function uploadVideoCandidato(
  candidatoId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  return uploadFile({
    category: 'candidatos',
    entityId: candidatoId,
    fileType: 'video',
    file,
    onProgress,
  });
}

/**
 * Upload de logo da empresa
 */
export async function uploadLogoEmpresa(
  empresaId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  return uploadFile({
    category: 'empresas',
    entityId: empresaId,
    fileType: 'logo',
    file,
    onProgress,
  });
}

/**
 * Upload de imagem da vaga
 */
export async function uploadImagemVaga(
  vagaId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  return uploadFile({
    category: 'vagas',
    entityId: vagaId,
    fileType: 'imagem',
    file,
    onProgress,
  });
}

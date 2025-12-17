// =====================================================
// HOOK - useFileUpload
// Hook React para upload de arquivos no R2
// =====================================================

import { useState, useCallback } from 'react';
import {
  uploadFile,
  deleteFile,
  validateFile,
  UploadConfig,
  UploadResponse,
  FileType,
} from '@/services/r2Storage';

export interface UseFileUploadOptions {
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: string) => void;
}

export interface UseFileUploadReturn {
  upload: (config: Omit<UploadConfig, 'onProgress'>) => Promise<UploadResponse>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

/**
 * Hook para gerenciar upload de arquivos
 */
export function useFileUpload(options?: UseFileUploadOptions): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(
    async (config: Omit<UploadConfig, 'onProgress'>): Promise<UploadResponse> => {
      reset();
      setIsUploading(true);

      try {
        const response = await uploadFile({
          ...config,
          onProgress: setProgress,
        });

        if (response.success) {
          options?.onSuccess?.(response);
        } else {
          setError(response.error || 'Erro desconhecido');
          options?.onError?.(response.error || 'Erro desconhecido');
        }

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro no upload';
        setError(errorMessage);
        options?.onError?.(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsUploading(false);
      }
    },
    [options, reset]
  );

  return {
    upload,
    isUploading,
    progress,
    error,
    reset,
  };
}

// =====================================================
// HOOKS ESPECIALIZADOS
// =====================================================

/**
 * Hook para upload de foto de candidato
 */
export function useFotoCandidatoUpload(
  candidatoId: string,
  options?: UseFileUploadOptions
) {
  const { upload, ...rest } = useFileUpload(options);

  const uploadFoto = useCallback(
    (file: File) =>
      upload({
        category: 'candidatos',
        entityId: candidatoId,
        fileType: 'foto',
        file,
      }),
    [candidatoId, upload]
  );

  return { uploadFoto, ...rest };
}

/**
 * Hook para upload de currículo de candidato
 */
export function useCurriculoCandidatoUpload(
  candidatoId: string,
  options?: UseFileUploadOptions
) {
  const { upload, ...rest } = useFileUpload(options);

  const uploadCurriculo = useCallback(
    (file: File) =>
      upload({
        category: 'candidatos',
        entityId: candidatoId,
        fileType: 'curriculo',
        file,
      }),
    [candidatoId, upload]
  );

  return { uploadCurriculo, ...rest };
}

/**
 * Hook para upload de vídeo de candidato
 */
export function useVideoCandidatoUpload(
  candidatoId: string,
  options?: UseFileUploadOptions
) {
  const { upload, ...rest } = useFileUpload(options);

  const uploadVideo = useCallback(
    (file: File) =>
      upload({
        category: 'candidatos',
        entityId: candidatoId,
        fileType: 'video',
        file,
      }),
    [candidatoId, upload]
  );

  return { uploadVideo, ...rest };
}

/**
 * Hook para upload de logo de empresa
 */
export function useLogoEmpresaUpload(
  empresaId: string,
  options?: UseFileUploadOptions
) {
  const { upload, ...rest } = useFileUpload(options);

  const uploadLogo = useCallback(
    (file: File) =>
      upload({
        category: 'empresas',
        entityId: empresaId,
        fileType: 'logo',
        file,
      }),
    [empresaId, upload]
  );

  return { uploadLogo, ...rest };
}

/**
 * Hook para upload de imagem de vaga
 */
export function useImagemVagaUpload(
  vagaId: string,
  options?: UseFileUploadOptions
) {
  const { upload, ...rest } = useFileUpload(options);

  const uploadImagem = useCallback(
    (file: File) =>
      upload({
        category: 'vagas',
        entityId: vagaId,
        fileType: 'imagem',
        file,
      }),
    [vagaId, upload]
  );

  return { uploadImagem, ...rest };
}

// =====================================================
// HOOK PARA DELETAR ARQUIVOS
// =====================================================

export interface UseFileDeleteReturn {
  deleteFileFromR2: (path: string) => Promise<boolean>;
  isDeleting: boolean;
  error: string | null;
}

/**
 * Hook para deletar arquivos do R2
 */
export function useFileDelete(): UseFileDeleteReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteFileFromR2 = useCallback(async (path: string): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      const success = await deleteFile(path);
      if (!success) {
        setError('Não foi possível deletar o arquivo');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar';
      setError(errorMessage);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteFileFromR2, isDeleting, error };
}

// =====================================================
// HOOK PARA VALIDAÇÃO DE ARQUIVOS
// =====================================================

/**
 * Hook para validar arquivos antes do upload
 */
export function useFileValidation(fileType: FileType) {
  const validate = useCallback(
    (file: File) => validateFile(file, fileType),
    [fileType]
  );

  return { validate };
}

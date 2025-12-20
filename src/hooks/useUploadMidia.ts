// =====================================================
// HOOK DE UPLOAD DE MÍDIA - Cloudflare R2
// =====================================================

import { useState, useCallback } from "react";
import {
  uploadToR2,
  uploadBase64ToR2,
  gerarCaminhoArquivo,
  validarArquivo,
  isR2Configured,
} from "@/lib/cloudflare-r2";
import { supabase } from "@/integrations/supabase/client";

interface UploadResult {
  url: string;
  tipo: "foto" | "video";
  path: string;
}

interface UseUploadMidiaReturn {
  uploadMidia: (
    file: File,
    userId: string,
    pasta?: "fotos-perfil" | "videos" | "destaques" | "documentos"
  ) => Promise<UploadResult | null>;
  uploadBase64: (
    base64Data: string,
    userId: string,
    tipo: "foto" | "video",
    pasta?: "fotos-perfil" | "videos" | "destaques" | "documentos"
  ) => Promise<UploadResult | null>;
  uploading: boolean;
  progress: number;
  error: string | null;
  isConfigured: boolean;
}

export function useUploadMidia(): UseUploadMidiaReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = isR2Configured();

  /**
   * Upload de arquivo (File)
   */
  const uploadMidia = useCallback(
    async (
      file: File,
      userId: string,
      pasta: "fotos-perfil" | "videos" | "destaques" | "documentos" = "destaques"
    ): Promise<UploadResult | null> => {
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Determinar tipo
        const tipo = file.type.startsWith("video/") ? "video" : "foto";

        // Validar arquivo
        const validacao = validarArquivo(file, tipo === "video" ? "video" : "imagem");
        if (!validacao.valido) {
          setError(validacao.erro || "Arquivo inválido");
          return null;
        }

        setProgress(20);

        // Se R2 não está configurado, usar Supabase Storage como fallback
        if (!isConfigured) {
          console.warn("R2 não configurado, usando Supabase Storage como fallback");

          const path = `${pasta}/${userId}/${Date.now()}.${file.name.split(".").pop()}`;

          setProgress(40);

          const { error: uploadError } = await supabase.storage
            .from("recrutamento")
            .upload(path, file, { upsert: true });

          if (uploadError) throw uploadError;

          setProgress(80);

          const { data: urlData } = supabase.storage
            .from("recrutamento")
            .getPublicUrl(path);

          setProgress(100);

          return {
            url: urlData.publicUrl,
            tipo,
            path,
          };
        }

        // Upload para R2
        setProgress(30);

        const path = gerarCaminhoArquivo(pasta, userId, file.name);

        setProgress(50);

        const url = await uploadToR2(file, path);

        setProgress(100);

        return { url, tipo, path };
      } catch (err: any) {
        console.error("Erro no upload:", err);
        setError(err.message || "Erro ao fazer upload");
        return null;
      } finally {
        setUploading(false);
      }
    },
    [isConfigured]
  );

  /**
   * Upload de base64 (para fotos de câmera)
   */
  const uploadBase64 = useCallback(
    async (
      base64Data: string,
      userId: string,
      tipo: "foto" | "video",
      pasta: "fotos-perfil" | "videos" | "destaques" | "documentos" = "fotos-perfil"
    ): Promise<UploadResult | null> => {
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        const extension = tipo === "video" ? "webm" : "jpg";
        const contentType = tipo === "video" ? "video/webm" : "image/jpeg";

        setProgress(30);

        // Se R2 não está configurado, converter para File e usar Supabase
        if (!isConfigured) {
          console.warn("R2 não configurado, usando Supabase Storage como fallback");

          // Converter base64 para blob
          const response = await fetch(base64Data);
          const blob = await response.blob();

          setProgress(50);

          const path = `${pasta}/${userId}/${Date.now()}.${extension}`;

          const { error: uploadError } = await supabase.storage
            .from("recrutamento")
            .upload(path, blob, { upsert: true });

          if (uploadError) throw uploadError;

          setProgress(80);

          const { data: urlData } = supabase.storage
            .from("recrutamento")
            .getPublicUrl(path);

          setProgress(100);

          return {
            url: urlData.publicUrl,
            tipo,
            path,
          };
        }

        // Upload para R2
        const path = `${pasta}/${userId}/${Date.now()}.${extension}`;

        setProgress(60);

        const url = await uploadBase64ToR2(base64Data, path, contentType);

        setProgress(100);

        return { url, tipo, path };
      } catch (err: any) {
        console.error("Erro no upload:", err);
        setError(err.message || "Erro ao fazer upload");
        return null;
      } finally {
        setUploading(false);
      }
    },
    [isConfigured]
  );

  return {
    uploadMidia,
    uploadBase64,
    uploading,
    progress,
    error,
    isConfigured,
  };
}

export default useUploadMidia;

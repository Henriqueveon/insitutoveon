// =====================================================
// COMPONENTE - VideoUpload
// Upload de vídeo de entrevista do candidato com integração R2 + Supabase
// =====================================================

import { useCallback, useState } from 'react';
import { FileUpload } from './FileUpload';
import { useVideoCandidatoUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoUploadProps {
  candidatoId: string;
  currentVideoUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
  className?: string;
}

export function VideoUpload({
  candidatoId,
  currentVideoUrl,
  onUploadSuccess,
  className,
}: VideoUploadProps) {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState<string | null>(currentVideoUrl || null);

  const { uploadVideo, isUploading, progress, error } = useVideoCandidatoUpload(
    candidatoId,
    {
      onSuccess: async (response) => {
        if (response.publicUrl) {
          // Atualiza URL no Supabase
          const { error: updateError } = await supabase
            .from('candidatos_recrutamento')
            .update({ video_url: response.publicUrl })
            .eq('id', candidatoId);

          if (updateError) {
            console.error('Erro ao atualizar vídeo no banco:', updateError);
            toast({
              title: 'Aviso',
              description: 'Vídeo enviado, mas houve erro ao salvar no perfil',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sucesso!',
              description: 'Vídeo de apresentação enviado com sucesso',
            });
            setVideoUrl(response.publicUrl);
            onUploadSuccess?.(response.publicUrl);
          }
        }
      },
      onError: (errorMsg) => {
        toast({
          title: 'Erro no upload',
          description: errorMsg,
          variant: 'destructive',
        });
      },
    }
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      uploadVideo(file);
    },
    [uploadVideo]
  );

  const handleRemoveVideo = useCallback(() => {
    setVideoUrl(null);
  }, []);

  return (
    <div className={className}>
      {/* Preview do vídeo existente */}
      {videoUrl && !isUploading && (
        <div className="relative mb-4 rounded-lg overflow-hidden border border-slate-700 bg-black">
          <video
            src={videoUrl}
            controls
            className="w-full h-64 object-contain"
          >
            Seu navegador não suporta vídeos.
          </video>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemoveVideo}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <FileUpload
        fileType="video"
        onFileSelect={handleFileSelect}
        isUploading={isUploading}
        progress={progress}
        error={error}
        placeholder="Arraste seu vídeo de apresentação aqui"
      />

      <p className="text-xs text-slate-500 mt-2 text-center">
        Dica: Grave um vídeo de 30s a 2min se apresentando para as empresas
      </p>
    </div>
  );
}

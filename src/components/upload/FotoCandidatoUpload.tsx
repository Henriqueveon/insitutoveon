// =====================================================
// COMPONENTE - FotoCandidatoUpload
// Upload de foto do candidato com integração R2 + Supabase
// =====================================================

import { useCallback } from 'react';
import { FileUpload } from './FileUpload';
import { useFotoCandidatoUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FotoCandidatoUploadProps {
  candidatoId: string;
  currentFotoUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
  className?: string;
}

export function FotoCandidatoUpload({
  candidatoId,
  currentFotoUrl,
  onUploadSuccess,
  className,
}: FotoCandidatoUploadProps) {
  const { toast } = useToast();

  const { uploadFoto, isUploading, progress, error } = useFotoCandidatoUpload(
    candidatoId,
    {
      onSuccess: async (response) => {
        if (response.publicUrl) {
          // Atualiza URL no Supabase
          const { error: updateError } = await supabase
            .from('candidatos_recrutamento')
            .update({ foto_url: response.publicUrl })
            .eq('id', candidatoId);

          if (updateError) {
            console.error('Erro ao atualizar foto no banco:', updateError);
            toast({
              title: 'Aviso',
              description: 'Foto enviada, mas houve erro ao salvar no perfil',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sucesso!',
              description: 'Foto atualizada com sucesso',
            });
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
      uploadFoto(file);
    },
    [uploadFoto]
  );

  return (
    <FileUpload
      fileType="foto"
      onFileSelect={handleFileSelect}
      isUploading={isUploading}
      progress={progress}
      error={error}
      currentFileUrl={currentFotoUrl}
      placeholder="Arraste sua foto aqui"
      className={className}
    />
  );
}

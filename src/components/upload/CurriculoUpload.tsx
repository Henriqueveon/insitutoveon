// =====================================================
// COMPONENTE - CurriculoUpload
// Upload de currículo PDF do candidato com integração R2 + Supabase
// =====================================================

import { useCallback } from 'react';
import { FileUpload } from './FileUpload';
import { useCurriculoCandidatoUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CurriculoUploadProps {
  candidatoId: string;
  currentCurriculoUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
  className?: string;
}

export function CurriculoUpload({
  candidatoId,
  currentCurriculoUrl,
  onUploadSuccess,
  className,
}: CurriculoUploadProps) {
  const { toast } = useToast();

  const { uploadCurriculo, isUploading, progress, error } = useCurriculoCandidatoUpload(
    candidatoId,
    {
      onSuccess: async (response) => {
        if (response.publicUrl) {
          // Atualiza URL no Supabase
          const { error: updateError } = await supabase
            .from('candidatos_recrutamento')
            .update({ curriculo_url: response.publicUrl })
            .eq('id', candidatoId);

          if (updateError) {
            console.error('Erro ao atualizar currículo no banco:', updateError);
            toast({
              title: 'Aviso',
              description: 'Currículo enviado, mas houve erro ao salvar no perfil',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sucesso!',
              description: 'Currículo enviado com sucesso',
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
      uploadCurriculo(file);
    },
    [uploadCurriculo]
  );

  return (
    <FileUpload
      fileType="curriculo"
      onFileSelect={handleFileSelect}
      isUploading={isUploading}
      progress={progress}
      error={error}
      currentFileUrl={currentCurriculoUrl}
      placeholder="Arraste seu currículo PDF aqui"
      className={className}
    />
  );
}

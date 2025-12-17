// =====================================================
// COMPONENTE - LogoEmpresaUpload
// Upload de logo da empresa com integração R2 + Supabase
// =====================================================

import { useCallback } from 'react';
import { FileUpload } from './FileUpload';
import { useLogoEmpresaUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LogoEmpresaUploadProps {
  empresaId: string;
  currentLogoUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
  className?: string;
}

export function LogoEmpresaUpload({
  empresaId,
  currentLogoUrl,
  onUploadSuccess,
  className,
}: LogoEmpresaUploadProps) {
  const { toast } = useToast();

  const { uploadLogo, isUploading, progress, error } = useLogoEmpresaUpload(
    empresaId,
    {
      onSuccess: async (response) => {
        if (response.publicUrl) {
          // Atualiza URL no Supabase
          const { error: updateError } = await supabase
            .from('empresas_recrutamento')
            .update({ logo_url: response.publicUrl })
            .eq('id', empresaId);

          if (updateError) {
            console.error('Erro ao atualizar logo no banco:', updateError);
            toast({
              title: 'Aviso',
              description: 'Logo enviada, mas houve erro ao salvar no perfil',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sucesso!',
              description: 'Logo da empresa atualizada com sucesso',
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
      uploadLogo(file);
    },
    [uploadLogo]
  );

  return (
    <FileUpload
      fileType="logo"
      onFileSelect={handleFileSelect}
      isUploading={isUploading}
      progress={progress}
      error={error}
      currentFileUrl={currentLogoUrl}
      placeholder="Arraste a logo da empresa aqui"
      className={className}
    />
  );
}

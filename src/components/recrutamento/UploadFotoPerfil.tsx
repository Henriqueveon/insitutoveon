// =====================================================
// UPLOAD FOTO PERFIL - Componente de upload de foto
// =====================================================

import { useState, useRef } from "react";
import { Camera, Loader2, X, Check } from "lucide-react";
import { useUploadMidia } from "@/hooks/useUploadMidia";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UploadFotoPerfilProps {
  candidatoId: string;
  fotoAtual?: string | null;
  nomeCompleto?: string;
  onUploadComplete: (url: string) => void;
  size?: "sm" | "md" | "lg";
}

export function UploadFotoPerfil({
  candidatoId,
  fotoAtual,
  nomeCompleto = "",
  onUploadComplete,
  size = "md",
}: UploadFotoPerfilProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadMidia, uploading, progress, error } = useUploadMidia();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const buttonSizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Formato inválido",
        description: "Selecione uma imagem (JPG, PNG, WebP ou GIF)",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 10MB",
        variant: "destructive",
      });
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setSelectedFile(file);
      setModalOpen(true);
    };
    reader.readAsDataURL(file);

    // Limpar input para permitir selecionar o mesmo arquivo novamente
    e.target.value = "";
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    const result = await uploadMidia(selectedFile, candidatoId, "fotos-perfil");

    if (result) {
      // Atualizar no banco
      const { error: dbError } = await supabase
        .from("candidatos_recrutamento")
        .update({ foto_url: result.url })
        .eq("id", candidatoId);

      if (dbError) {
        toast({
          title: "Erro ao salvar",
          description: "A foto foi enviada mas não foi possível salvar no perfil.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Foto atualizada!",
          description: "Sua foto de perfil foi salva com sucesso.",
        });
        onUploadComplete(result.url);
      }

      setModalOpen(false);
      setPreviewUrl(null);
      setSelectedFile(null);
    } else if (error) {
      toast({
        title: "Erro no upload",
        description: error,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  return (
    <>
      <div className="relative inline-block">
        {/* Foto atual ou placeholder */}
        <div
          className={`${sizeClasses[size]} rounded-full overflow-hidden bg-slate-700 ring-2 ring-white/10`}
        >
          <Avatar className="w-full h-full">
            <AvatarImage src={fotoAtual || undefined} className="object-cover" />
            <AvatarFallback className="bg-slate-600 text-white text-xl">
              {nomeCompleto.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Botão de upload */}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`absolute -bottom-1 -right-1 ${buttonSizeClasses[size]} bg-[#E31E24] rounded-full flex items-center justify-center hover:bg-[#C41920] transition-colors shadow-lg`}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Camera className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Input hidden */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Modal de confirmação */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar foto</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {/* Preview */}
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-700">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Progress bar */}
            {uploading && (
              <div className="mb-4">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#E31E24] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-xs text-slate-400 mt-1">
                  Enviando... {progress}%
                </p>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={uploading}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmUpload}
                disabled={uploading}
                className="flex-1 bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {uploading ? "Enviando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UploadFotoPerfil;

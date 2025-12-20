// =====================================================
// MODAL ADICIONAR DESTAQUE - Upload de highlights/stories
// Usa Cloudflare R2 para armazenamento
// =====================================================

import { useState, useRef } from "react";
import { Plus, Image, Video, X, Loader2, Check, Trash2 } from "lucide-react";
import { useUploadMidia } from "@/hooks/useUploadMidia";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ModalAdicionarDestaqueProps {
  candidatoId: string;
  isOpen: boolean;
  onClose: () => void;
  onDestaqueAdicionado: () => void;
}

interface MidiaPreview {
  file: File;
  preview: string;
  tipo: "foto" | "video";
}

const ICONES_DISPONIVEIS = [
  { emoji: "📋", label: "Projetos" },
  { emoji: "🎬", label: "Trabalhos" },
  { emoji: "💡", label: "Ideias" },
  { emoji: "🏆", label: "Conquistas" },
  { emoji: "📚", label: "Certificados" },
  { emoji: "💼", label: "Experiência" },
  { emoji: "🎨", label: "Portfólio" },
  { emoji: "🔧", label: "Habilidades" },
  { emoji: "📸", label: "Fotos" },
  { emoji: "🎯", label: "Metas" },
  { emoji: "⭐", label: "Favoritos" },
  { emoji: "🚀", label: "Projetos" },
];

export function ModalAdicionarDestaque({
  candidatoId,
  isOpen,
  onClose,
  onDestaqueAdicionado,
}: ModalAdicionarDestaqueProps) {
  const { uploadMidia, uploading, progress } = useUploadMidia();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState("");
  const [icone, setIcone] = useState("📋");
  const [midias, setMidias] = useState<MidiaPreview[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const novasMidias: MidiaPreview[] = [];

    Array.from(files).forEach((file) => {
      // Validar tipo
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        toast({
          title: "Formato inválido",
          description: "Selecione imagens ou vídeos.",
          variant: "destructive",
        });
        return;
      }

      novasMidias.push({
        file,
        preview: URL.createObjectURL(file),
        tipo: isVideo ? "video" : "foto",
      });
    });

    setMidias((prev) => [...prev, ...novasMidias]);
    e.target.value = "";
  };

  const removerMidia = (index: number) => {
    setMidias((prev) => {
      const nova = [...prev];
      URL.revokeObjectURL(nova[index].preview);
      nova.splice(index, 1);
      return nova;
    });
  };

  const salvarDestaque = async () => {
    if (!titulo.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Digite um título para o destaque.",
        variant: "destructive",
      });
      return;
    }

    if (midias.length === 0) {
      toast({
        title: "Adicione mídias",
        description: "Selecione pelo menos uma foto ou vídeo.",
        variant: "destructive",
      });
      return;
    }

    setSalvando(true);
    setUploadProgress(0);

    try {
      // 1. Criar o destaque
      const { data: destaque, error: destaqueError } = await supabase
        .from("destaques_candidato")
        .insert({
          candidato_id: candidatoId,
          titulo: titulo.trim(),
          icone,
          ordem: 0,
        })
        .select()
        .single();

      if (destaqueError) throw destaqueError;

      // 2. Upload das mídias
      const totalMidias = midias.length;
      let midiasUploadadas = 0;

      for (const midia of midias) {
        const result = await uploadMidia(midia.file, candidatoId, "destaques");

        if (result) {
          // Salvar referência da mídia
          await supabase.from("midias_destaque").insert({
            destaque_id: destaque.id,
            url: result.url,
            tipo: midia.tipo,
            ordem: midiasUploadadas,
          });
        }

        midiasUploadadas++;
        setUploadProgress(Math.round((midiasUploadadas / totalMidias) * 100));
      }

      toast({
        title: "Destaque criado!",
        description: `"${titulo}" foi adicionado ao seu perfil.`,
      });

      // Limpar e fechar
      limparForm();
      onDestaqueAdicionado();
      onClose();
    } catch (err: any) {
      console.error("Erro ao salvar destaque:", err);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível criar o destaque.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  const limparForm = () => {
    setTitulo("");
    setIcone("📋");
    midias.forEach((m) => URL.revokeObjectURL(m.preview));
    setMidias([]);
    setUploadProgress(0);
  };

  const handleClose = () => {
    limparForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Novo Destaque</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Título */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Título</label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Meus Projetos"
              className="bg-gray-800 border-gray-700 text-white"
              maxLength={20}
            />
          </div>

          {/* Seletor de ícone */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Ícone</label>
            <div className="grid grid-cols-6 gap-2">
              {ICONES_DISPONIVEIS.map((item) => (
                <button
                  key={item.emoji}
                  onClick={() => setIcone(item.emoji)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    icone === item.emoji
                      ? "bg-blue-600 ring-2 ring-blue-400"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                  title={item.label}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Preview das mídias */}
          {midias.length > 0 && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Mídias ({midias.length})
              </label>
              <div className="grid grid-cols-3 gap-2">
                {midias.map((midia, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-800">
                    {midia.tipo === "foto" ? (
                      <img
                        src={midia.preview}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={midia.preview}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      onClick={() => removerMidia(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                    {midia.tipo === "video" && (
                      <div className="absolute bottom-1 left-1 bg-black/60 px-1 rounded text-xs text-white">
                        <Video className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botão adicionar mídia */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors"
          >
            <div className="flex justify-center gap-2 mb-2">
              <Image className="w-6 h-6 text-gray-500" />
              <Video className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-400">Adicionar fotos ou vídeos</p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, WebP, GIF, MP4, WebM, MOV
            </p>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Progress bar */}
          {salvando && (
            <div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-center text-xs text-gray-400 mt-1">
                Enviando... {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={salvando}
            className="border-gray-600 text-gray-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={salvarDestaque}
            disabled={salvando || midias.length === 0 || !titulo.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {salvando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Criar Destaque
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModalAdicionarDestaque;

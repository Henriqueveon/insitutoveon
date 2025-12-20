// =====================================================
// UPLOAD VIDEO - Componente de gravação e upload de vídeo
// Usa Cloudflare R2 para armazenamento
// =====================================================

import { useState, useRef, useEffect } from "react";
import { Video, Circle, Square, Loader2, X, Check, RotateCcw, Play } from "lucide-react";
import { useUploadMidia } from "@/hooks/useUploadMidia";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UploadVideoProps {
  candidatoId: string;
  videoAtual?: string | null;
  onUploadComplete: (url: string) => void;
}

export function UploadVideo({
  candidatoId,
  videoAtual,
  onUploadComplete,
}: UploadVideoProps) {
  const { uploadMidia, uploading, progress, error } = useUploadMidia();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [gravandoVideo, setGravandoVideo] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [videoChunks, setVideoChunks] = useState<Blob[]>([]);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [tempoGravacao, setTempoGravacao] = useState(0);
  const [salvando, setSalvando] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [videoStream]);

  const iniciarGravacao = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 720, height: 1280 },
        audio: true,
      });

      setVideoStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setVideoChunks(chunks);
        setPreviewVideo(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        setVideoStream(null);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setGravandoVideo(true);

      // Timer
      let tempo = 0;
      timerRef.current = setInterval(() => {
        tempo++;
        setTempoGravacao(tempo);
        if (tempo >= 60) {
          pararGravacao();
        }
      }, 1000);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera.",
        variant: "destructive",
      });
    }
  };

  const pararGravacao = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setGravandoVideo(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTempoGravacao(0);
    }
  };

  const salvarVideo = async () => {
    if (videoChunks.length === 0) return;

    setSalvando(true);

    try {
      const blob = new Blob(videoChunks, { type: "video/webm" });
      const file = new File([blob], `video-${Date.now()}.webm`, {
        type: "video/webm",
      });

      // Upload usando R2 (ou fallback para Supabase)
      const result = await uploadMidia(file, candidatoId, "videos");

      if (result) {
        // Atualizar no banco
        const { error: dbError } = await supabase
          .from("candidatos_recrutamento")
          .update({ video_url: result.url })
          .eq("id", candidatoId);

        if (dbError) {
          toast({
            title: "Erro ao salvar",
            description: "O vídeo foi enviado mas não foi possível salvar no perfil.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Vídeo salvo!",
            description: "Seu vídeo de apresentação foi atualizado.",
          });
          onUploadComplete(result.url);
        }

        fecharModal();
      } else if (error) {
        toast({
          title: "Erro no upload",
          description: error,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Erro ao salvar vídeo:", err);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o vídeo.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  const fecharModal = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setVideoStream(null);
    setMediaRecorder(null);
    setGravandoVideo(false);
    setPreviewVideo(null);
    setVideoChunks([]);
    setTempoGravacao(0);
    setModalOpen(false);
  };

  const formatarTempo = (segundos: number) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const regravarVideo = () => {
    if (previewVideo) {
      URL.revokeObjectURL(previewVideo);
    }
    setPreviewVideo(null);
    setVideoChunks([]);
  };

  return (
    <>
      {/* Botão para abrir modal */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setModalOpen(true)}
        className="border-gray-600 text-gray-300 hover:bg-gray-800"
      >
        <Video className="w-4 h-4 mr-2" />
        {videoAtual ? "Regravar vídeo" : "Gravar vídeo"}
      </Button>

      {/* Modal de gravação */}
      <Dialog open={modalOpen} onOpenChange={fecharModal}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">
              {previewVideo ? "Preview do Vídeo" : "Gravar Vídeo de Apresentação"}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {previewVideo ? (
              <div>
                <video
                  src={previewVideo}
                  controls
                  className="w-full rounded-lg aspect-[9/16] object-cover bg-black"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={regravarVideo}
                  className="mt-2 text-gray-400 w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Gravar novamente
                </Button>
              </div>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="w-full rounded-lg aspect-[9/16] object-cover bg-gray-800"
                />

                {gravandoVideo && (
                  <div className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-full flex items-center text-white text-sm">
                    <Circle className="w-3 h-3 mr-1 fill-current animate-pulse" />
                    {formatarTempo(tempoGravacao)}
                  </div>
                )}

                <div className="flex justify-center mt-4">
                  {!gravandoVideo ? (
                    <Button
                      onClick={iniciarGravacao}
                      className="bg-red-500 hover:bg-red-600 rounded-full h-16 w-16"
                    >
                      <Circle className="w-8 h-8 fill-white" />
                    </Button>
                  ) : (
                    <Button
                      onClick={pararGravacao}
                      className="bg-red-500 hover:bg-red-600 rounded-full h-16 w-16"
                    >
                      <Square className="w-6 h-6 fill-white" />
                    </Button>
                  )}
                </div>

                <p className="text-xs text-gray-500 text-center mt-2">
                  {gravandoVideo
                    ? "Clique para parar (máx. 60s)"
                    : "Clique para iniciar a gravação"}
                </p>
              </div>
            )}

            {/* Progress bar */}
            {(uploading || salvando) && (
              <div className="mt-4">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-xs text-gray-400 mt-1">
                  Enviando... {progress}%
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={fecharModal}
              disabled={uploading || salvando}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            {previewVideo && (
              <Button
                onClick={salvarVideo}
                disabled={uploading || salvando}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {uploading || salvando ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {uploading || salvando ? "Enviando..." : "Salvar Vídeo"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UploadVideo;

// =====================================================
// VÍDEO-PITCH CANDIDATO - Gravação de Vídeo
// Área de Recrutamento VEON
// Com suporte a gravação, upload e "fazer depois"
// =====================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Video,
  Square,
  RotateCcw,
  Check,
  Play,
  Pause,
  Loader2,
  AlertCircle,
  Upload,
  SkipForward,
  Sparkles,
} from 'lucide-react';

const MIN_DURACAO = 10; // segundos
const MAX_DURACAO = 60; // segundos
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ROTEIRO = [
  '1. Diga seu primeiro nome e idade',
  '2. Fale sua área de atuação',
  '3. Cite sua maior conquista profissional',
  '4. Por que uma empresa deveria te contratar?',
];

type ModoVideo = 'selecao' | 'gravando' | 'preview' | 'upload';

export default function VideoCandidato() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { form, ref, fotoBlob } = location.state || {};

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [gravando, setGravando] = useState(false);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tempo, setTempo] = useState(0);
  const [usarRoteiro, setUsarRoteiro] = useState(true);
  const [reproduzindo, setReproduzindo] = useState(false);
  const [cameraDisponivel, setCameraDisponivel] = useState(true);
  const [modoAtivo, setModoAtivo] = useState<ModoVideo>('selecao');
  const [salvando, setSalvando] = useState(false);

  // Verificar disponibilidade da câmera
  useEffect(() => {
    const verificarCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraDisponivel(false);
          return;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const temCamera = devices.some(device => device.kind === 'videoinput');
        const temMicrofone = devices.some(device => device.kind === 'audioinput');
        setCameraDisponivel(temCamera && temMicrofone);
      } catch (error) {
        console.error('Erro ao verificar dispositivos:', error);
        setCameraDisponivel(false);
      }
    };

    verificarCamera();
  }, []);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (gravando) {
      interval = setInterval(() => {
        setTempo((prev) => {
          if (prev >= MAX_DURACAO) {
            pararGravacao();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gravando]);

  // Formatar tempo
  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Iniciar câmera
  const iniciarCamera = useCallback(async () => {
    try {
      setCameraError(null);
      setIsLoading(true);

      // Verificar se mediaDevices está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste navegador');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: true,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setCameraAtiva(true);
      setModoAtivo('gravando');
    } catch (error: any) {
      console.error('Erro ao acessar câmera:', error);

      let mensagemErro = 'Não foi possível acessar a câmera ou microfone.';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        mensagemErro = 'Permissão de câmera/microfone negada. Por favor, permita o acesso nas configurações do navegador.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        mensagemErro = 'Nenhuma câmera ou microfone encontrado neste dispositivo.';
        setCameraDisponivel(false);
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        mensagemErro = 'Câmera ou microfone já está sendo usado por outro aplicativo.';
      }

      setCameraError(mensagemErro);
      setModoAtivo('selecao');

      toast({
        title: 'Erro ao acessar câmera',
        description: 'Use a opção de enviar um vídeo ou pule esta etapa.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Parar câmera
  const pararCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraAtiva(false);
  }, [stream]);

  // Iniciar gravação
  const iniciarGravacao = useCallback(() => {
    if (!stream) return;

    chunksRef.current = [];
    setTempo(0);

    const options = { mimeType: 'video/webm;codecs=vp8,opus' };
    let mediaRecorder: MediaRecorder;

    try {
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
      // Fallback para outros navegadores
      mediaRecorder = new MediaRecorder(stream);
    }

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setVideoBlob(blob);
      setVideoUrl(URL.createObjectURL(blob));
      pararCamera();
      setModoAtivo('preview');
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000); // Chunk a cada segundo
    setGravando(true);
  }, [stream, pararCamera]);

  // Parar gravação
  const pararGravacao = useCallback(() => {
    if (mediaRecorderRef.current && gravando) {
      mediaRecorderRef.current.stop();
      setGravando(false);
    }
  }, [gravando]);

  // Gravar novamente
  const gravarNovamente = () => {
    setVideoBlob(null);
    setVideoUrl(null);
    setTempo(0);
    setModoAtivo('gravando');
    iniciarCamera();
  };

  // Voltar para seleção
  const voltarParaSelecao = () => {
    setVideoBlob(null);
    setVideoUrl(null);
    setTempo(0);
    setCameraError(null);
    pararCamera();
    setModoAtivo('selecao');
  };

  // Upload de arquivo de vídeo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo de vídeo.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O vídeo deve ter no máximo 50MB.',
        variant: 'destructive',
      });
      return;
    }

    // Criar URL para preview
    const url = URL.createObjectURL(file);
    setVideoBlob(file);
    setVideoUrl(url);
    setModoAtivo('preview');

    // Obter duração do vídeo
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.onloadedmetadata = () => {
      setTempo(Math.floor(tempVideo.duration));
      URL.revokeObjectURL(tempVideo.src);
    };
    tempVideo.src = url;
  };

  // Abrir seletor de arquivo
  const selecionarUpload = () => {
    fileInputRef.current?.click();
  };

  // Fazer depois - pular vídeo
  const fazerDepois = () => {
    // Navegar sem vídeo
    navigate('/recrutamento/candidato/documento', {
      state: { form, ref, fotoBlob, videoBlob: null, videoDuracao: 0, videoTipo: null },
    });
  };

  // Usar vídeo e continuar
  const usarVideo = () => {
    if (!videoBlob) return;

    if (tempo < MIN_DURACAO) {
      toast({
        title: 'Vídeo muito curto',
        description: `O vídeo deve ter no mínimo ${MIN_DURACAO} segundos.`,
        variant: 'destructive',
      });
      return;
    }

    // Salvar no localStorage temporariamente
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      localStorage.setItem('veon_candidato_video', base64);
      localStorage.setItem('veon_candidato_video_tipo', usarRoteiro ? 'roteiro' : 'livre');
      localStorage.setItem('veon_candidato_video_duracao', tempo.toString());

      navigate('/recrutamento/candidato/documento', {
        state: { form, ref, fotoBlob, videoBlob: base64, videoDuracao: tempo, videoTipo: usarRoteiro ? 'roteiro' : 'livre' },
      });
    };
    reader.readAsDataURL(videoBlob);
  };

  // Toggle play/pause do preview
  const togglePreview = () => {
    if (!previewRef.current) return;

    if (reproduzindo) {
      previewRef.current.pause();
    } else {
      previewRef.current.play();
    }
    setReproduzindo(!reproduzindo);
  };

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Redirecionar se não tiver form
  useEffect(() => {
    if (!form) {
      navigate('/recrutamento/candidato/cadastro');
    }
  }, [form, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#003DA5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-2xl flex items-center justify-center">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Grave seu vídeo de apresentação
          </h1>
          <p className="text-slate-400">
            As empresas adoram conhecer os candidatos antes da entrevista!
          </p>
        </div>

        {/* Toggle roteiro */}
        {!videoUrl && !gravando && (
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Label htmlFor="roteiro" className="text-slate-300">
              Vídeo livre
            </Label>
            <Switch
              id="roteiro"
              checked={usarRoteiro}
              onCheckedChange={setUsarRoteiro}
            />
            <Label htmlFor="roteiro" className="text-slate-300">
              Com roteiro
            </Label>
          </div>
        )}

        {/* Área do vídeo */}
        <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm mb-4">
          <CardContent className="p-4">
            <div className="relative aspect-[9/16] max-h-[400px] rounded-xl overflow-hidden bg-slate-900 mx-auto">
              {/* Preview do vídeo gravado */}
              {videoUrl ? (
                <div className="relative w-full h-full">
                  <video
                    ref={previewRef}
                    src={videoUrl}
                    className="w-full h-full object-cover"
                    playsInline
                    onEnded={() => setReproduzindo(false)}
                  />
                  <button
                    onClick={togglePreview}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40"
                  >
                    {reproduzindo ? (
                      <Pause className="w-16 h-16 text-white" />
                    ) : (
                      <Play className="w-16 h-16 text-white" />
                    )}
                  </button>
                </div>
              ) : cameraAtiva ? (
                /* Stream de vídeo */
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                /* Placeholder - tela de seleção */
                <div className="w-full h-full flex flex-col items-center justify-center p-6">
                  {isLoading ? (
                    <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
                  ) : cameraError ? (
                    <>
                      <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                      <p className="text-slate-400 text-center text-sm mb-4">
                        {cameraError}
                      </p>
                      <Button
                        variant="outline"
                        onClick={selecionarUpload}
                        className="border-slate-600 text-slate-300"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Enviar vídeo
                      </Button>
                    </>
                  ) : (
                    <>
                      <Video className="w-16 h-16 text-slate-600 mb-4" />
                      <p className="text-slate-500 text-center">
                        Escolha como deseja adicionar seu vídeo
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Timer */}
              {(gravando || videoUrl) && (
                <div className="absolute top-4 right-4 bg-black/60 rounded-full px-3 py-1">
                  <span className={`font-mono font-bold ${gravando ? 'text-red-400' : 'text-white'}`}>
                    {formatarTempo(tempo)} / {formatarTempo(MAX_DURACAO)}
                  </span>
                </div>
              )}

              {/* Indicador de gravação */}
              {gravando && (
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-medium">REC</span>
                </div>
              )}

              {/* Roteiro na tela */}
              {gravando && usarRoteiro && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="space-y-1 text-white text-xs">
                    {ROTEIRO.map((linha, i) => (
                      <p key={i} className="opacity-90">{linha}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instrução */}
        {!videoUrl && !gravando && cameraAtiva && (
          <div className="mb-4 p-3 bg-slate-800/40 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300 text-center">
              {usarRoteiro ? (
                <>
                  <strong className="text-white">Siga o roteiro:</strong>
                  <br />
                  {ROTEIRO.join(' → ')}
                </>
              ) : (
                <>
                  <strong className="text-white">Vídeo livre:</strong>
                  <br />
                  Fale sobre você, suas experiências e por que você é um bom profissional
                </>
              )}
            </p>
          </div>
        )}

        {/* Duração mínima */}
        {videoUrl && tempo < MIN_DURACAO && (
          <div className="mb-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
            <p className="text-sm text-red-300 text-center">
              O vídeo deve ter no mínimo {MIN_DURACAO} segundos. Grave novamente.
            </p>
          </div>
        )}

        {/* Botões */}
        <div className="space-y-3">
          {modoAtivo === 'preview' && videoUrl ? (
            /* Vídeo gravado/carregado - botões de ação */
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={voltarParaSelecao}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 py-6"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Escolher outro
              </Button>
              <Button
                onClick={usarVideo}
                disabled={tempo < MIN_DURACAO || salvando}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 py-6 disabled:opacity-50"
              >
                {salvando ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Check className="w-5 h-5 mr-2" />
                )}
                Usar este vídeo
              </Button>
            </div>
          ) : gravando ? (
            /* Gravando */
            <>
              <Button
                onClick={pararGravacao}
                className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg"
              >
                <Square className="w-6 h-6 mr-2" />
                Parar gravação
              </Button>
              <Button
                variant="outline"
                onClick={voltarParaSelecao}
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </Button>
            </>
          ) : cameraAtiva ? (
            /* Câmera ativa - pronto para gravar */
            <>
              <Button
                onClick={iniciarGravacao}
                className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B] py-6 text-lg animate-pulse"
              >
                <div className="w-6 h-6 mr-2 bg-white rounded-full" />
                Iniciar gravação
              </Button>
              <Button
                variant="outline"
                onClick={voltarParaSelecao}
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </Button>
            </>
          ) : (
            /* Tela de seleção - 3 opções */
            <>
              {/* Botão Gravar - só mostra se câmera disponível */}
              {cameraDisponivel && (
                <Button
                  onClick={iniciarCamera}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B] py-6 text-lg"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  ) : (
                    <Video className="w-6 h-6 mr-2" />
                  )}
                  Gravar Agora
                </Button>
              )}

              {/* Botão Upload */}
              <Button
                variant={cameraDisponivel ? 'outline' : 'default'}
                onClick={selecionarUpload}
                className={cameraDisponivel
                  ? "w-full border-slate-600 text-slate-300 hover:bg-slate-700 py-6"
                  : "w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B] py-6 text-lg"
                }
              >
                <Upload className="w-5 h-5 mr-2" />
                Enviar Vídeo
              </Button>

              {/* Botão Fazer Depois */}
              <Button
                variant="ghost"
                onClick={fazerDepois}
                className="w-full text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 py-6"
              >
                <SkipForward className="w-5 h-5 mr-2" />
                Fazer Depois
              </Button>

              {/* Aviso sobre vídeo */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-sm text-amber-400 text-center flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Candidatos com vídeo recebem 3x mais propostas!
                </p>
              </div>

              {/* Mensagem se câmera não disponível */}
              {!cameraDisponivel && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-400 text-center">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Câmera não disponível. Envie um vídeo ou faça depois.
                  </p>
                </div>
              )}

              {/* Input de arquivo oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          )}
        </div>

        {/* Info de tempo */}
        {(modoAtivo === 'gravando' || modoAtivo === 'preview') && (
          <p className="mt-4 text-center text-sm text-slate-500">
            Mínimo {MIN_DURACAO}s • Máximo {MAX_DURACAO}s
          </p>
        )}
      </div>
    </div>
  );
}

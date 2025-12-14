// =====================================================
// SELFIE CANDIDATO - Captura de Foto
// Área de Recrutamento VEON
// Com suporte a câmera e upload
// =====================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Camera,
  RotateCcw,
  Check,
  Upload,
  AlertCircle,
  Loader2,
  ImageIcon,
} from 'lucide-react';

export default function SelfieCandidato() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { form, ref } = location.state || {};

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [fotoBlob, setFotoBlob] = useState<Blob | null>(null);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usandoFrontal, setUsandoFrontal] = useState(true);
  const [cameraDisponivel, setCameraDisponivel] = useState(true);
  const [modoAtivo, setModoAtivo] = useState<'selecao' | 'camera' | 'upload' | 'preview'>('selecao');
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
        setCameraDisponivel(temCamera);
      } catch (error) {
        console.error('Erro ao verificar câmera:', error);
        setCameraDisponivel(false);
      }
    };

    verificarCamera();
  }, []);

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
          facingMode: usandoFrontal ? 'user' : 'environment',
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setCameraAtiva(true);
      setModoAtivo('camera');
    } catch (error: any) {
      console.error('Erro ao acessar câmera:', error);

      let mensagemErro = 'Não foi possível acessar a câmera.';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        mensagemErro = 'Permissão de câmera negada. Por favor, permita o acesso nas configurações do navegador.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        mensagemErro = 'Nenhuma câmera encontrada neste dispositivo.';
        setCameraDisponivel(false);
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        mensagemErro = 'Câmera já está sendo usada por outro aplicativo.';
      } else if (error.name === 'OverconstrainedError') {
        mensagemErro = 'Configurações de câmera não suportadas.';
      }

      setCameraError(mensagemErro);
      setModoAtivo('selecao');

      toast({
        title: 'Erro na câmera',
        description: 'Use a opção de enviar uma foto do seu dispositivo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [usandoFrontal, toast]);

  // Parar câmera
  const pararCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraAtiva(false);
  }, [stream]);

  // Tirar foto
  const tirarFoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Definir tamanho do canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Espelhar se for câmera frontal
    if (usandoFrontal) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    // Converter para blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setFotoBlob(blob);
          setFoto(URL.createObjectURL(blob));
          pararCamera();
          setModoAtivo('preview');
        }
      },
      'image/jpeg',
      0.9
    );
  }, [usandoFrontal, pararCamera]);

  // Upload de arquivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setFotoBlob(file);
    setFoto(URL.createObjectURL(file));
    pararCamera();
    setModoAtivo('preview');
  };

  // Tirar outra foto / escolher outra
  const voltarParaSelecao = () => {
    setFoto(null);
    setFotoBlob(null);
    setCameraError(null);
    setModoAtivo('selecao');
  };

  // Iniciar modo câmera
  const selecionarCamera = () => {
    setModoAtivo('camera');
    iniciarCamera();
  };

  // Iniciar modo upload
  const selecionarUpload = () => {
    fileInputRef.current?.click();
  };

  // Usar foto e continuar
  const usarFoto = () => {
    if (!fotoBlob) return;

    // Ativar loading state
    setSalvando(true);

    // Salvar no localStorage temporariamente
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      localStorage.setItem('veon_candidato_foto', base64);

      navigate('/recrutamento/candidato/video', {
        state: { form, ref, fotoBlob: base64 },
      });
    };
    reader.onerror = () => {
      setSalvando(false);
      toast({
        title: 'Erro ao processar foto',
        description: 'Tente novamente ou envie outra foto.',
        variant: 'destructive',
      });
    };
    reader.readAsDataURL(fotoBlob);
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
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-2xl flex items-center justify-center">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Vamos colocar um rosto no seu currículo!
          </h1>
          <p className="text-slate-400">
            Tire uma foto de rosto, em ambiente claro
          </p>
        </div>

        {/* Área da foto */}
        <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900">
              {/* Canvas para captura (oculto) */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Preview da foto */}
              {modoAtivo === 'preview' && foto ? (
                <img
                  src={foto}
                  alt="Sua foto"
                  className="w-full h-full object-cover"
                />
              ) : modoAtivo === 'camera' && cameraAtiva ? (
                /* Stream de vídeo */
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${usandoFrontal ? 'scale-x-[-1]' : ''}`}
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
                        Enviar foto
                      </Button>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-16 h-16 text-slate-600 mb-4" />
                      <p className="text-slate-500 text-center">
                        Escolha como deseja adicionar sua foto
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Guia de rosto */}
              {modoAtivo === 'camera' && cameraAtiva && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-64 border-2 border-dashed border-white/30 rounded-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="space-y-3">
          {modoAtivo === 'preview' && foto ? (
            /* Foto capturada - botões de ação */
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={voltarParaSelecao}
                disabled={salvando}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 py-6 disabled:opacity-50"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Escolher outra
              </Button>
              <Button
                onClick={usarFoto}
                disabled={salvando}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 py-6 disabled:opacity-50"
              >
                {salvando ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Check className="w-5 h-5 mr-2" />
                )}
                {salvando ? 'Salvando...' : 'Usar esta foto'}
              </Button>
            </div>
          ) : modoAtivo === 'camera' && cameraAtiva ? (
            /* Câmera ativa - botão de captura */
            <>
              <Button
                onClick={tirarFoto}
                className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B] py-6 text-lg"
              >
                <Camera className="w-6 h-6 mr-2" />
                Tirar foto
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
            /* Tela de seleção - duas opções */
            <>
              {/* Botão Tirar Foto - só mostra se câmera disponível */}
              {cameraDisponivel && (
                <Button
                  onClick={selecionarCamera}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B] py-6 text-lg"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 mr-2" />
                  )}
                  Tirar Foto
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
                Enviar do Dispositivo
              </Button>

              {/* Mensagem se câmera não disponível */}
              {!cameraDisponivel && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-400 text-center">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Câmera não disponível neste dispositivo. Use a opção de enviar uma foto.
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          )}
        </div>

        {/* Dicas */}
        <div className="mt-6 p-4 bg-slate-800/40 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400 text-center">
            <strong className="text-white">Dicas para uma boa foto:</strong>
            <br />
            Ambiente bem iluminado, rosto centralizado, fundo neutro
          </p>
        </div>
      </div>
    </div>
  );
}

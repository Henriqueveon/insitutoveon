// =====================================================
// DOCUMENTO CANDIDATO - Upload CNH/RG
// Área de Recrutamento VEON
// =====================================================

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Upload,
  Camera,
  CreditCard,
  IdCard,
  Check,
  RotateCcw,
  Loader2,
  Shield,
  AlertCircle,
  SkipForward,
} from 'lucide-react';

type TipoDocumento = 'cnh' | 'rg';

export default function DocumentoCandidato() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { form, ref, fotoBlob, videoBlob, videoDuracao, videoTipo } = location.state || {};

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento | null>(null);
  const [documentoUrl, setDocumentoUrl] = useState<string | null>(null);
  const [documentoBlob, setDocumentoBlob] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Iniciar câmera
  const iniciarCamera = async () => {
    try {
      setCameraError(null);
      setIsLoading(true);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Câmera traseira
          width: { ideal: 1280 },
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
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setCameraError('Não foi possível acessar a câmera. Use a opção de upload.');
    } finally {
      setIsLoading(false);
    }
  };

  // Parar câmera
  const pararCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraAtiva(false);
  };

  // Tirar foto do documento
  const capturarDocumento = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setDocumentoBlob(blob);
          setDocumentoUrl(URL.createObjectURL(blob));
          pararCamera();
        }
      },
      'image/jpeg',
      0.9
    );
  };

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

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setDocumentoBlob(file);
    setDocumentoUrl(URL.createObjectURL(file));
    pararCamera();
  };

  // Enviar outro documento
  const enviarOutro = () => {
    setDocumentoUrl(null);
    setDocumentoBlob(null);
    setTipoDocumento(null);
  };

  // Continuar para termos
  const continuar = () => {
    if (!documentoBlob || !tipoDocumento) return;

    // Salvar no localStorage temporariamente
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      localStorage.setItem('veon_candidato_documento', base64);
      localStorage.setItem('veon_candidato_documento_tipo', tipoDocumento);

      navigate('/recrutamento/candidato/termos', {
        state: {
          form,
          ref,
          fotoBlob,
          videoBlob,
          videoDuracao,
          videoTipo,
          documentoBlob: base64,
          documentoTipo: tipoDocumento,
        },
      });
    };
    reader.readAsDataURL(documentoBlob);
  };

  // Fazer depois - pular documento
  const fazerDepois = () => {
    navigate('/recrutamento/candidato/termos', {
      state: {
        form,
        ref,
        fotoBlob,
        videoBlob,
        videoDuracao,
        videoTipo,
        documentoBlob: null,
        documentoTipo: null,
      },
    });
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
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Verificação de identidade
          </h1>
          <p className="text-slate-400">
            Para sua segurança e das empresas, precisamos verificar sua identidade
          </p>
        </div>

        {/* Canvas oculto */}
        <canvas ref={canvasRef} className="hidden" />

        {!tipoDocumento ? (
          /* Seleção do tipo de documento */
          <div className="space-y-4">
            <p className="text-center text-slate-300 mb-6">
              Qual documento você vai usar?
            </p>

            <Card
              className="bg-slate-800/60 border-slate-700 cursor-pointer hover:border-[#E31E24]/50 transition-all"
              onClick={() => setTipoDocumento('cnh')}
            >
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">CNH</h3>
                  <p className="text-sm text-slate-400">
                    Carteira Nacional de Habilitação (frente)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-slate-800/60 border-slate-700 cursor-pointer hover:border-[#E31E24]/50 transition-all"
              onClick={() => setTipoDocumento('rg')}
            >
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <IdCard className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">RG</h3>
                  <p className="text-sm text-slate-400">
                    Registro Geral (frente)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Botão Fazer Depois */}
            <Button
              variant="ghost"
              onClick={fazerDepois}
              className="w-full text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 py-6 mt-4"
            >
              <SkipForward className="w-5 h-5 mr-2" />
              Enviar documento depois
            </Button>

            {/* Aviso */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-sm text-amber-400 text-center">
                Candidatos com documento verificado têm mais credibilidade
              </p>
            </div>
          </div>
        ) : documentoUrl ? (
          /* Preview do documento */
          <>
            <Card className="bg-slate-800/60 border-slate-700 mb-6">
              <CardContent className="p-4">
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
                  <img
                    src={documentoUrl}
                    alt="Documento"
                    className="w-full h-full object-contain"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={enviarOutro}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 py-6"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Enviar outro
              </Button>
              <Button
                onClick={continuar}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 py-6"
              >
                <Check className="w-5 h-5 mr-2" />
                Usar este
              </Button>
            </div>
          </>
        ) : (
          /* Captura do documento */
          <>
            <Card className="bg-slate-800/60 border-slate-700 mb-6">
              <CardContent className="p-4">
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
                  {cameraAtiva ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      {cameraError ? (
                        <>
                          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                          <p className="text-slate-400 text-center px-4 text-sm">
                            {cameraError}
                          </p>
                        </>
                      ) : isLoading ? (
                        <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
                      ) : (
                        <>
                          {tipoDocumento === 'cnh' ? (
                            <CreditCard className="w-16 h-16 text-slate-600 mb-4" />
                          ) : (
                            <IdCard className="w-16 h-16 text-slate-600 mb-4" />
                          )}
                          <p className="text-slate-500">
                            {tipoDocumento === 'cnh' ? 'CNH' : 'RG'} (frente)
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Guia do documento */}
                  {cameraAtiva && (
                    <div className="absolute inset-4 border-2 border-dashed border-white/30 rounded-lg pointer-events-none" />
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {cameraAtiva ? (
                <Button
                  onClick={capturarDocumento}
                  className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B] py-6 text-lg"
                >
                  <Camera className="w-6 h-6 mr-2" />
                  Capturar documento
                </Button>
              ) : (
                <>
                  <Button
                    onClick={iniciarCamera}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B] py-6"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5 mr-2" />
                    )}
                    Tirar foto do documento
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-slate-900 text-slate-500">ou</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 py-6"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Enviar foto do dispositivo
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </>
              )}

              <Button
                variant="ghost"
                onClick={() => setTipoDocumento(null)}
                className="w-full text-slate-400 hover:text-white"
              >
                Trocar tipo de documento
              </Button>
            </div>
          </>
        )}

        {/* Aviso de segurança */}
        <div className="mt-6 p-4 bg-slate-800/40 rounded-lg border border-slate-700">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-400">
              Seus documentos são criptografados e armazenados de forma segura.
              Utilizamos apenas para verificação de identidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

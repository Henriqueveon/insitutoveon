// =====================================================
// CADASTRO EMPRESA - Área de Recrutamento VEON
// 6 Etapas: CNPJ → Sócio → Email OTP → Foto → Termos → Senha
// =====================================================

import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  User,
  Camera,
  Upload,
  FileText,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { buscarCNPJ, formatarCNPJ, validarCNPJ } from '../services/cnpjService';
import { CNPJResponse } from '../types/recrutamento.types';
import { obterMensagemErro } from '../utils/traduzirErro';

// URL base das Edge Functions do Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lzrquwyvguxywvlxsthj.supabase.co';

// Máscaras
const aplicarMascaraCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

const aplicarMascaraCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14);
};

// Validação de CPF com dígitos verificadores
const validarCPF = (cpf: string): boolean => {
  const cpfLimpo = cpf.replace(/\D/g, '');

  if (cpfLimpo.length !== 11) return false;

  // Rejeita CPFs com todos dígitos iguais (111.111.111-11, etc)
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  // Calcula primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(9))) return false;

  // Calcula segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(10))) return false;

  return true;
};

const aplicarMascaraTelefone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
};

// Validação de senha
const validarSenha = (senha: string) => {
  const temMinimo = senha.length >= 8;
  const temMaiuscula = /[A-Z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const forca = [temMinimo, temMaiuscula, temNumero].filter(Boolean).length;

  return { temMinimo, temMaiuscula, temNumero, forca, valido: forca === 3 };
};

export default function EmpresaCadastro() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Etapa atual (1-5)
  const [etapa, setEtapa] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Etapa 1: CNPJ
  const [cnpj, setCnpj] = useState('');
  const [dadosCNPJ, setDadosCNPJ] = useState<CNPJResponse | null>(null);
  const [cnpjError, setCnpjError] = useState<string | null>(null);

  // Etapa 2: Dados do Sócio
  const [socioNome, setSocioNome] = useState('');
  const [socioCpf, setSocioCpf] = useState('');
  const [socioEmail, setSocioEmail] = useState('');
  const [socioTelefone, setSocioTelefone] = useState('');

  // Etapa 3: Foto
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [usandoCamera, setUsandoCamera] = useState(false);
  const [streamCamera, setStreamCamera] = useState<MediaStream | null>(null);

  // Etapa 3: Verificação de Email (OTP)
  const [codigoOtp, setCodigoOtp] = useState('');
  const [enviandoOtp, setEnviandoOtp] = useState(false);
  const [verificandoOtp, setVerificandoOtp] = useState(false);
  const [emailVerificado, setEmailVerificado] = useState(false);
  const [otpEnviado, setOtpEnviado] = useState(false);
  const [tempoReenvio, setTempoReenvio] = useState(0);

  // Etapa 5: Termos
  const [showTermosModal, setShowTermosModal] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouLGPD, setAceitouLGPD] = useState(false);

  // Etapa 6: Senha
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  // Progresso (agora são 6 etapas)
  const progresso = (etapa / 6) * 100;

  // ========== ETAPA 1: BUSCAR CNPJ ==========
  const handleBuscarCNPJ = async () => {
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    if (!validarCNPJ(cnpjLimpo)) {
      setCnpjError('CNPJ inválido. Verifique o número digitado.');
      return;
    }

    setIsLoading(true);
    setCnpjError(null);

    try {
      const dados = await buscarCNPJ(cnpjLimpo);

      if (!dados) {
        throw new Error('CNPJ não encontrado na Receita Federal.');
      }

      if (dados.situacao_cadastral !== 'ATIVA') {
        setCnpjError(`CNPJ com situação "${dados.situacao_cadastral}". Não é possível cadastrar empresa com CNPJ inativo.`);
        setDadosCNPJ(null);
        return;
      }

      // Verificar se já existe no banco
      const { data: empresaExistente } = await supabase
        .from('empresas_recrutamento')
        .select('id')
        .eq('cnpj', dados.cnpj)
        .single();

      if (empresaExistente) {
        setCnpjError('Esta empresa já está cadastrada. Faça login.');
        setDadosCNPJ(null);
        return;
      }

      setDadosCNPJ(dados);
      toast({
        title: 'CNPJ encontrado!',
        description: dados.razao_social,
      });
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
      setCnpjError(error instanceof Error ? error.message : 'Erro ao buscar CNPJ. Tente novamente.');
      setDadosCNPJ(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== ETAPA 3: VERIFICAÇÃO DE EMAIL (OTP) ==========

  // Timer para reenvio de OTP
  useEffect(() => {
    if (tempoReenvio > 0) {
      const timer = setTimeout(() => setTempoReenvio(tempoReenvio - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [tempoReenvio]);

  const enviarOTP = async () => {
    if (!socioEmail) {
      toast({
        title: 'Email não informado',
        description: 'Volte à etapa anterior e informe seu email.',
        variant: 'destructive',
      });
      return;
    }

    setEnviandoOtp(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: socioEmail,
          tipo: 'cadastro_empresa',
          nome: socioNome,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success) {
        setOtpEnviado(true);
        setTempoReenvio(60); // 60 segundos para reenviar
        toast({
          title: 'Código enviado!',
          description: `Verifique sua caixa de entrada: ${data.email_masked}`,
        });
      } else {
        throw new Error(data.error || 'Erro ao enviar código');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Erro ao enviar OTP:', error);
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      toast({
        title: isTimeout ? 'Tempo esgotado' : 'Erro ao enviar código',
        description: isTimeout
          ? 'O servidor demorou muito para responder. Tente novamente.'
          : error instanceof Error ? error.message : 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setEnviandoOtp(false);
    }
  };

  const verificarOTP = async () => {
    if (codigoOtp.length !== 6) {
      toast({
        title: 'Código inválido',
        description: 'Digite o código de 6 dígitos enviado para seu email.',
        variant: 'destructive',
      });
      return;
    }

    setVerificandoOtp(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: socioEmail,
          codigo: codigoOtp,
          tipo: 'cadastro_empresa',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success) {
        setEmailVerificado(true);
        toast({
          title: 'Email verificado!',
          description: 'Seu email foi confirmado com sucesso.',
        });
        // Avançar automaticamente para próxima etapa
        setTimeout(() => setEtapa(4), 1000);
      } else {
        toast({
          title: 'Código incorreto',
          description: data.error || 'Verifique o código e tente novamente.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Erro ao verificar OTP:', error);
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      toast({
        title: isTimeout ? 'Tempo esgotado' : 'Erro na verificação',
        description: isTimeout
          ? 'O servidor demorou muito para responder. Tente novamente.'
          : 'Não foi possível verificar o código. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setVerificandoOtp(false);
    }
  };

  // ========== ETAPA 4: FOTO ==========

  // Efeito para conectar stream ao video quando ambos estiverem prontos
  useEffect(() => {
    if (usandoCamera && streamCamera && videoRef.current) {
      videoRef.current.srcObject = streamCamera;
      videoRef.current.play().catch(console.error);
    }
  }, [usandoCamera, streamCamera]);

  // Limpar stream ao desmontar componente
  useEffect(() => {
    return () => {
      if (streamCamera) {
        streamCamera.getTracks().forEach((track) => track.stop());
      }
    };
  }, [streamCamera]);

  const iniciarCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStreamCamera(stream);
      setUsandoCamera(true);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      toast({
        title: 'Erro na câmera',
        description: 'Não foi possível acessar a câmera. Verifique as permissões ou tente fazer upload de uma foto.',
        variant: 'destructive',
      });
    }
  };

  const tirarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFotoUrl(dataUrl);

        // Converter para File
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
            setFotoFile(file);
          }
        }, 'image/jpeg', 0.8);
      }
    }
    pararCamera();
  };

  const pararCamera = () => {
    if (streamCamera) {
      streamCamera.getTracks().forEach((track) => track.stop());
      setStreamCamera(null);
    }
    setUsandoCamera(false);
  };

  const handleUploadFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'A foto deve ter no máximo 5MB.',
          variant: 'destructive',
        });
        return;
      }

      setFotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ========== ETAPA 5: FINALIZAR CADASTRO ==========
  const finalizarCadastro = async () => {
    if (!dadosCNPJ) return;

    const validacao = validarSenha(senha);
    if (!validacao.valido) {
      toast({
        title: 'Senha fraca',
        description: 'A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula e 1 número.',
        variant: 'destructive',
      });
      return;
    }

    if (senha !== confirmarSenha) {
      toast({
        title: 'Senhas não conferem',
        description: 'As senhas digitadas são diferentes.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: socioEmail,
        password: senha,
        options: {
          data: {
            nome: socioNome,
            tipo: 'empresa',
          },
        },
      });

      if (authError) throw authError;

      // 2. Upload da foto (se houver)
      let fotoUrlFinal = null;
      if (fotoFile) {
        const fileName = `empresas/${Date.now()}_${fotoFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('fotos')
          .upload(fileName, fotoFile);

        if (uploadError) {
          console.error('Erro no upload da foto:', uploadError);
        } else {
          const { data: urlData } = supabase.storage.from('fotos').getPublicUrl(fileName);
          fotoUrlFinal = urlData.publicUrl;
        }
      }

      // 3. Inserir empresa no banco usando RPC (bypassa RLS)
      const { data: rpcResult, error: rpcError } = await supabase.rpc('cadastrar_empresa', {
        p_cnpj: dadosCNPJ.cnpj,
        p_razao_social: dadosCNPJ.razao_social,
        p_nome_fantasia: dadosCNPJ.nome_fantasia || null,
        p_situacao_cadastral: dadosCNPJ.situacao_cadastral || null,
        p_data_abertura: dadosCNPJ.data_abertura || null,
        p_natureza_juridica: dadosCNPJ.natureza_juridica || null,
        p_porte: dadosCNPJ.porte || null,
        p_capital_social: dadosCNPJ.capital_social || null,
        p_logradouro: dadosCNPJ.logradouro || null,
        p_numero: dadosCNPJ.numero || null,
        p_complemento: dadosCNPJ.complemento || null,
        p_bairro: dadosCNPJ.bairro || null,
        p_cidade: dadosCNPJ.municipio || null,
        p_estado: dadosCNPJ.uf || null,
        p_cep: dadosCNPJ.cep || null,
        p_telefone_empresa: dadosCNPJ.telefone || null,
        p_email_empresa: dadosCNPJ.email || null,
        p_socio_nome: socioNome,
        p_socio_cpf: socioCpf.replace(/\D/g, ''), // Remove máscara
        p_socio_email: socioEmail,
        p_socio_telefone: socioTelefone.replace(/\D/g, ''), // Remove máscara
        p_socio_foto_url: fotoUrlFinal,
        p_aceite_termos: aceitouTermos,
        p_aceite_lgpd: aceitouLGPD,
      });

      if (rpcError) {
        console.error('Erro RPC:', rpcError);
        throw new Error(rpcError.message);
      }

      const result = rpcResult as { success: boolean; error?: string };
      if (result && !result.success) {
        throw new Error(result.error || 'Erro ao cadastrar empresa');
      }

      // Mostrar mensagem de sucesso com instrução para confirmar email
      toast({
        title: 'Cadastro realizado!',
        description: 'Para finalizar o cadastro, abra seu email e faça a confirmação.',
        duration: 10000, // 10 segundos para dar tempo de ler
      });

      // Redirecionar para página de login após 3 segundos
      setTimeout(() => {
        navigate('/recrutamento/empresa/login');
      }, 3000);
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast({
        title: 'Erro no cadastro',
        description: obterMensagemErro(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Navegação entre etapas
  const proximaEtapa = () => {
    // Etapa 2 -> 3 (OTP): Enviar código automaticamente
    if (etapa === 2) {
      setEtapa(3);
      // Enviar OTP automaticamente ao entrar na etapa 3
      setTimeout(() => enviarOTP(), 300);
    } else if (etapa === 3) {
      // Só avança da etapa 3 quando email verificado (controlado pelo verificarOTP)
      setEtapa(4);
    } else {
      setEtapa((prev) => Math.min(prev + 1, 6));
    }
  };

  const etapaAnterior = () => {
    // Navegação normal entre todas as etapas
    setEtapa((prev) => Math.max(prev - 1, 1));
  };

  // Validação por etapa
  const podeAvancar = () => {
    switch (etapa) {
      case 1:
        return dadosCNPJ !== null;
      case 2:
        // Valida CPF com dígitos verificadores, email e telefone
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(socioEmail);
        return socioNome.trim().length >= 3 && validarCPF(socioCpf) && emailValido && socioTelefone.length >= 14;
      case 3:
        // Etapa pulada - email verificado pelo Supabase Auth
        return true;
      case 4:
        return fotoUrl !== null;
      case 5:
        return aceitouTermos && aceitouLGPD;
      case 6:
        return validarSenha(senha).valido && senha === confirmarSenha;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#003DA5]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Cadastro de Empresa</h1>
          <p className="text-slate-400 mt-2">Veon Recrutamento</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Etapa {etapa} de 6</span>
            <span>{Math.round(progresso)}%</span>
          </div>
          <Progress value={progresso} className="h-2 bg-slate-700" />

          {/* Steps indicators */}
          <div className="flex justify-between mt-4">
            {[
              { icon: Search, label: 'CNPJ' },
              { icon: User, label: 'Sócio' },
              { icon: Mail, label: 'Email' },
              { icon: Camera, label: 'Foto' },
              { icon: FileText, label: 'Termos' },
              { icon: Lock, label: 'Senha' },
            ].map((step, index) => (
              <div
                key={index}
                className={`flex flex-col items-center ${
                  index + 1 <= etapa ? 'text-[#00D9FF]' : 'text-slate-600'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index + 1 < etapa
                      ? 'bg-green-500'
                      : index + 1 === etapa
                      ? 'bg-[#00D9FF]'
                      : 'bg-slate-700'
                  }`}
                >
                  {index + 1 < etapa ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <step.icon className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="text-xs mt-1 hidden sm:block">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card principal */}
        <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
          <CardContent className="pt-6">
            {/* ========== ETAPA 1: CNPJ ========== */}
            {etapa === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white">Buscar CNPJ</h2>
                  <p className="text-slate-400 mt-1">
                    Digite o CNPJ da empresa para buscar os dados automaticamente
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj" className="text-slate-300">
                      CNPJ
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="cnpj"
                        placeholder="00.000.000/0000-00"
                        value={cnpj}
                        onChange={(e) => {
                          setCnpj(aplicarMascaraCNPJ(e.target.value));
                          setCnpjError(null);
                          setDadosCNPJ(null);
                        }}
                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-lg"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleBuscarCNPJ}
                        disabled={isLoading || cnpj.length < 18}
                        className="bg-[#003DA5] hover:bg-[#002D7A]"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Erro */}
                  {cnpjError && (
                    <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{cnpjError}</p>
                    </div>
                  )}

                  {/* Dados do CNPJ */}
                  {dadosCNPJ && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-medium">CNPJ Encontrado</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500">Razão Social</p>
                          <p className="text-white font-medium">{dadosCNPJ.razao_social}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Nome Fantasia</p>
                          <p className="text-white font-medium">
                            {dadosCNPJ.nome_fantasia || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Situação</p>
                          <p className="text-green-400 font-medium">
                            {dadosCNPJ.situacao_cadastral}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Porte</p>
                          <p className="text-white font-medium">{dadosCNPJ.porte || '-'}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-slate-500">Endereço</p>
                          <p className="text-white font-medium">
                            {dadosCNPJ.logradouro}, {dadosCNPJ.numero}
                            {dadosCNPJ.complemento && ` - ${dadosCNPJ.complemento}`}
                            <br />
                            {dadosCNPJ.bairro} - {dadosCNPJ.municipio}/{dadosCNPJ.uf}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========== ETAPA 2: DADOS DO SÓCIO ========== */}
            {etapa === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white">Dados do Sócio</h2>
                  <p className="text-slate-400 mt-1">
                    Preencha os dados do responsável pela empresa
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="socioNome" className="text-slate-300">
                      Nome completo *
                    </Label>
                    <Input
                      id="socioNome"
                      placeholder="João da Silva"
                      value={socioNome}
                      onChange={(e) => setSocioNome(e.target.value)}
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="socioCpf" className="text-slate-300">
                      CPF *
                    </Label>
                    <Input
                      id="socioCpf"
                      placeholder="000.000.000-00"
                      value={socioCpf}
                      onChange={(e) => setSocioCpf(aplicarMascaraCPF(e.target.value))}
                      className={`bg-slate-900/50 text-white placeholder:text-slate-500 ${
                        socioCpf.length === 14
                          ? validarCPF(socioCpf)
                            ? 'border-green-500'
                            : 'border-red-500'
                          : 'border-slate-600'
                      }`}
                    />
                    {socioCpf.length === 14 && !validarCPF(socioCpf) && (
                      <p className="text-red-400 text-xs">CPF inválido. Verifique os dígitos.</p>
                    )}
                    {socioCpf.length === 14 && validarCPF(socioCpf) && (
                      <p className="text-green-400 text-xs">✓ CPF válido</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="socioEmail" className="text-slate-300">
                      E-mail *
                    </Label>
                    <Input
                      id="socioEmail"
                      type="email"
                      placeholder="socio@empresa.com"
                      value={socioEmail}
                      onChange={(e) => setSocioEmail(e.target.value)}
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="socioTelefone" className="text-slate-300">
                      Telefone/WhatsApp *
                    </Label>
                    <Input
                      id="socioTelefone"
                      placeholder="(00) 00000-0000"
                      value={socioTelefone}
                      onChange={(e) => setSocioTelefone(aplicarMascaraTelefone(e.target.value))}
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ========== ETAPA 3: VERIFICAÇÃO DE EMAIL ========== */}
            {etapa === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white">Verificar E-mail</h2>
                  <p className="text-slate-400 mt-1">
                    Digite o código de 6 dígitos enviado para {socioEmail}
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Ícone de email */}
                  <div className="flex justify-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                      emailVerificado ? 'bg-green-500/20' : 'bg-[#00D9FF]/20'
                    }`}>
                      {emailVerificado ? (
                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                      ) : (
                        <Mail className="w-10 h-10 text-[#00D9FF]" />
                      )}
                    </div>
                  </div>

                  {emailVerificado ? (
                    <div className="text-center space-y-2">
                      <p className="text-green-400 font-medium text-lg">Email verificado com sucesso!</p>
                      <p className="text-slate-400 text-sm">Você será redirecionado automaticamente...</p>
                    </div>
                  ) : (
                    <>
                      {/* Campo de código OTP */}
                      <div className="space-y-2">
                        <Label htmlFor="codigoOtp" className="text-slate-300 text-center block">
                          Código de verificação
                        </Label>
                        <Input
                          id="codigoOtp"
                          placeholder="000000"
                          value={codigoOtp}
                          onChange={(e) => setCodigoOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 text-center text-2xl tracking-[0.5em] font-mono"
                          maxLength={6}
                          disabled={verificandoOtp}
                        />
                      </div>

                      {/* Botão verificar */}
                      <Button
                        onClick={verificarOTP}
                        disabled={codigoOtp.length !== 6 || verificandoOtp}
                        className="w-full bg-gradient-to-r from-[#00D9FF] to-[#0099CC] hover:from-[#00C4E6] hover:to-[#0088B3] text-slate-900 font-medium"
                      >
                        {verificandoOtp ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verificando...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Verificar Código
                          </>
                        )}
                      </Button>

                      {/* Reenviar código */}
                      <div className="text-center">
                        <p className="text-slate-500 text-sm mb-2">Não recebeu o código?</p>
                        {tempoReenvio > 0 ? (
                          <p className="text-slate-400 text-sm">
                            Aguarde <span className="text-[#00D9FF] font-medium">{tempoReenvio}s</span> para reenviar
                          </p>
                        ) : (
                          <Button
                            onClick={enviarOTP}
                            disabled={enviandoOtp}
                            variant="ghost"
                            className="text-[#00D9FF] hover:text-[#00C4E6] hover:bg-[#00D9FF]/10"
                          >
                            {enviandoOtp ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reenviar código
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Dica */}
                      <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                        <p className="text-slate-400 text-xs text-center">
                          O código expira em 10 minutos. Verifique também sua caixa de spam.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ========== ETAPA 4: FOTO ========== */}
            {etapa === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white">Foto do Sócio</h2>
                  <p className="text-slate-400 mt-1">
                    Tire uma selfie ou faça upload de uma foto
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Preview ou Camera */}
                  <div className="relative aspect-square max-w-xs mx-auto bg-slate-900/50 rounded-2xl overflow-hidden border-2 border-dashed border-slate-600">
                    {usandoCamera ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : fotoUrl ? (
                      <img
                        src={fotoUrl}
                        alt="Foto do sócio"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                        <User className="w-20 h-20 mb-2" />
                        <p className="text-sm">Nenhuma foto</p>
                      </div>
                    )}
                  </div>

                  <canvas ref={canvasRef} className="hidden" />

                  {/* Botões */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {usandoCamera ? (
                      <>
                        <Button
                          onClick={tirarFoto}
                          className="bg-[#E31E24] hover:bg-[#C91920]"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Capturar
                        </Button>
                        <Button
                          onClick={pararCamera}
                          variant="outline"
                          className="border-slate-600 text-slate-300"
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={iniciarCamera}
                          className="bg-[#003DA5] hover:bg-[#002D7A]"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Tirar Selfie
                        </Button>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                        {fotoUrl && (
                          <Button
                            onClick={() => {
                              setFotoUrl(null);
                              setFotoFile(null);
                            }}
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            Remover
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadFoto}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* ========== ETAPA 5: TERMOS ========== */}
            {etapa === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white">Termos e Condições</h2>
                  <p className="text-slate-400 mt-1">
                    Leia e aceite os termos para continuar
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Importante</p>
                        <p className="text-slate-400 text-sm mt-1">
                          Ao prosseguir, você concorda com nossos termos de uso e política de
                          privacidade. Clique no botão abaixo para ler os termos completos.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowTermosModal(true)}
                    variant="outline"
                    className="w-full border-[#00D9FF] text-[#00D9FF] hover:bg-[#00D9FF]/10"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Ler Termos Completos
                  </Button>

                  <div className="space-y-3 pt-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="termos"
                        checked={aceitouTermos}
                        onCheckedChange={(checked) => setAceitouTermos(checked as boolean)}
                        className="mt-1"
                      />
                      <Label htmlFor="termos" className="text-slate-300 text-sm cursor-pointer">
                        Li e concordo com os termos de uso da plataforma
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="lgpd"
                        checked={aceitouLGPD}
                        onCheckedChange={(checked) => setAceitouLGPD(checked as boolean)}
                        className="mt-1"
                      />
                      <Label htmlFor="lgpd" className="text-slate-300 text-sm cursor-pointer">
                        Concordo com os termos da plataforma
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========== ETAPA 6: SENHA ========== */}
            {etapa === 6 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white">Criar Senha</h2>
                  <p className="text-slate-400 mt-1">
                    Crie uma senha segura para sua conta
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="senha" className="text-slate-300">
                      Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="senha"
                        type={showSenha ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSenha(!showSenha)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Indicadores de força */}
                    {senha && (
                      <div className="space-y-2 mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full ${
                                validarSenha(senha).forca >= level
                                  ? validarSenha(senha).forca === 3
                                    ? 'bg-green-500'
                                    : validarSenha(senha).forca === 2
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                  : 'bg-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-xs space-y-1">
                          <p className={validarSenha(senha).temMinimo ? 'text-green-400' : 'text-slate-500'}>
                            {validarSenha(senha).temMinimo ? '✓' : '○'} Mínimo 8 caracteres
                          </p>
                          <p className={validarSenha(senha).temMaiuscula ? 'text-green-400' : 'text-slate-500'}>
                            {validarSenha(senha).temMaiuscula ? '✓' : '○'} Uma letra maiúscula
                          </p>
                          <p className={validarSenha(senha).temNumero ? 'text-green-400' : 'text-slate-500'}>
                            {validarSenha(senha).temNumero ? '✓' : '○'} Um número
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha" className="text-slate-300">
                      Confirmar Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmarSenha"
                        type={showConfirmarSenha ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showConfirmarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmarSenha && senha !== confirmarSenha && (
                      <p className="text-red-400 text-xs">As senhas não conferem</p>
                    )}
                    {confirmarSenha && senha === confirmarSenha && (
                      <p className="text-green-400 text-xs">✓ Senhas conferem</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navegação */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
              {etapa > 1 ? (
                <Button
                  onClick={etapaAnterior}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              ) : (
                <Link to="/recrutamento/empresa/login">
                  <Button variant="ghost" className="text-slate-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Fazer Login
                  </Button>
                </Link>
              )}

              {etapa < 6 ? (
                <Button
                  onClick={proximaEtapa}
                  disabled={!podeAvancar() || (etapa === 3 && !emailVerificado)}
                  className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B]"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={finalizarCadastro}
                  disabled={!podeAvancar() || isLoading}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      Finalizar Cadastro
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Termos */}
      <Dialog open={showTermosModal} onOpenChange={setShowTermosModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">
              TERMOS E CONDIÇÕES GERAIS DE USO DA PLATAFORMA
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Documento atualizado em conformidade com as legislações vigentes
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3 text-[10px] leading-tight text-slate-400">
            <p>
              PREÂMBULO: O presente instrumento particular, doravante denominado "TERMO DE USO E CONDIÇÕES GERAIS", estabelece as condições gerais de uso dos serviços oferecidos pela plataforma digital VEON RECRUTAMENTO, de propriedade de INSTITUTO VEON LTDA, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº XX.XXX.XXX/0001-XX, com sede na cidade de São Paulo, Estado de São Paulo, na Rua Example, nº XXX, Bairro Centro, CEP XXXXX-XXX, doravante denominada simplesmente "VEON" ou "PLATAFORMA", e de outro lado, a pessoa física ou jurídica que realizar seu cadastro e aceitar os presentes termos, doravante denominada "USUÁRIO" ou "EMPRESA CONTRATANTE".
            </p>

            <p className="font-semibold text-slate-300 text-[11px] mt-4">CAPÍTULO I - DAS DEFINIÇÕES E INTERPRETAÇÕES</p>
            <p>
              Art. 1º - Para os fins deste instrumento, consideram-se as seguintes definições: I - "Plataforma": sistema eletrônico de intermediação de serviços de recrutamento e seleção de pessoal, disponibilizado pela VEON através de website, aplicativo móvel ou qualquer outro meio digital; II - "Usuário": toda e qualquer pessoa física ou jurídica que acesse, utilize ou interaja com a Plataforma, independentemente de cadastro prévio; III - "Empresa Contratante": pessoa jurídica regularmente constituída que realize cadastro na Plataforma com a finalidade de utilizar os serviços de recrutamento e seleção; IV - "Candidato": pessoa física que disponibilize seus dados pessoais e profissionais na Plataforma com a finalidade de participar de processos seletivos; V - "Dados Pessoais": informações relacionadas à pessoa natural identificada ou identificável, nos termos da Lei nº 13.709/2018; VI - "Tratamento de Dados": toda operação realizada com dados pessoais, como coleta, produção, recepção, classificação, utilização, acesso, reprodução, transmissão, distribuição, processamento, arquivamento, armazenamento, eliminação, avaliação ou controle da informação, modificação, comunicação, transferência, difusão ou extração.
            </p>

            <p className="font-semibold text-slate-300 text-[11px] mt-4">CAPÍTULO II - DO OBJETO</p>
            <p>
              Art. 2º - O presente Termo tem por objeto estabelecer as condições gerais de uso da Plataforma VEON RECRUTAMENTO, bem como definir os direitos e obrigações das partes envolvidas. Parágrafo único: A utilização da Plataforma implica na aceitação integral e irrestrita de todos os termos e condições aqui estabelecidos, bem como das políticas de privacidade e demais documentos complementares disponibilizados pela VEON. Art. 3º - A VEON disponibiliza aos seus usuários uma plataforma tecnológica que permite: I - O cadastramento de vagas de emprego por parte das Empresas Contratantes; II - O cadastramento de currículos e informações profissionais por parte dos Candidatos; III - A busca e seleção de candidatos através de filtros e algoritmos de compatibilidade; IV - A intermediação do contato entre Empresas Contratantes e Candidatos; V - O gerenciamento de processos seletivos; VI - A disponibilização de relatórios e análises comportamentais.
            </p>

            <p className="font-semibold text-slate-300 text-[11px] mt-4">CAPÍTULO III - DO CADASTRO E ACESSO</p>
            <p>
              Art. 4º - O acesso completo aos serviços da Plataforma está condicionado à realização de cadastro prévio, mediante o fornecimento de informações verdadeiras, atuais e completas. § 1º - O Usuário é integralmente responsável pela veracidade das informações fornecidas no momento do cadastro e durante toda a vigência de sua conta. § 2º - A VEON reserva-se o direito de solicitar, a qualquer momento, documentos comprobatórios das informações fornecidas. § 3º - O fornecimento de informações falsas, imprecisas ou incompletas poderá resultar na suspensão ou cancelamento da conta, sem prejuízo das medidas legais cabíveis. Art. 5º - O Usuário é o único responsável pela guarda e sigilo de suas credenciais de acesso (login e senha), comprometendo-se a não divulgá-las a terceiros. Parágrafo único: A VEON não se responsabiliza por acessos não autorizados decorrentes da negligência do Usuário na guarda de suas credenciais.
            </p>

            <p className="font-semibold text-slate-300 text-[11px] mt-4">CAPÍTULO IV - DOS SERVIÇOS E FUNCIONALIDADES</p>
            <p>
              Art. 6º - A VEON oferece diferentes modalidades de serviços, cujas características, preços e condições estão descritos na página de planos disponível na Plataforma. § 1º - Os serviços podem ser modificados, suspensos ou descontinuados a qualquer momento, mediante comunicação prévia aos usuários afetados. § 2º - A contratação de serviços pagos está sujeita às condições comerciais vigentes no momento da contratação. Art. 7º - O sistema de créditos funciona da seguinte forma: I - A Empresa Contratante adquire créditos através dos meios de pagamento disponibilizados na Plataforma; II - Os créditos são consumidos conforme a utilização dos serviços; III - Os créditos não utilizados não são reembolsáveis, salvo disposição em contrário prevista em lei; IV - A VEON reserva-se o direito de modificar a política de créditos mediante comunicação prévia. Art. 8º - O algoritmo de compatibilidade ("match") utilizado pela Plataforma considera diversos fatores, incluindo, mas não se limitando a: perfil comportamental, experiência profissional, formação acadêmica, pretensão salarial, localização geográfica e outros critérios relevantes. Parágrafo único: A VEON não garante a contratação de candidatos indicados pelo sistema de compatibilidade, sendo este meramente indicativo.
            </p>

            <p className="font-semibold text-slate-300 text-[11px] mt-4">CAPÍTULO V - DAS OBRIGAÇÕES DO USUÁRIO</p>
            <p>
              Art. 9º - Constituem obrigações do Usuário: I - Utilizar a Plataforma de acordo com a legislação vigente, a moral e os bons costumes; II - Fornecer informações verdadeiras, atuais e completas; III - Manter suas credenciais de acesso em sigilo; IV - Não utilizar a Plataforma para fins ilícitos ou não autorizados; V - Não reproduzir, copiar, distribuir ou modificar qualquer conteúdo da Plataforma sem autorização prévia; VI - Respeitar os direitos de propriedade intelectual da VEON e de terceiros; VII - Não realizar engenharia reversa, descompilação ou qualquer tentativa de obter o código-fonte da Plataforma; VIII - Não utilizar mecanismos automatizados (bots, crawlers, etc.) para acessar a Plataforma; IX - Não praticar atos que possam comprometer a segurança ou o funcionamento da Plataforma; X - Comunicar à VEON qualquer irregularidade ou violação de que tenha conhecimento.
            </p>

            <p className="font-semibold text-slate-300 text-[11px] mt-4">CAPÍTULO VI - DA CONFIDENCIALIDADE E PROTEÇÃO DE DADOS</p>
            <p>
              Art. 10 - As informações dos Candidatos disponibilizadas na Plataforma são confidenciais e de uso exclusivo para fins de recrutamento e seleção. § 1º - É expressamente proibido: I - Compartilhar, divulgar, vender ou transferir dados de candidatos a terceiros; II - Utilizar os dados para finalidades diversas do recrutamento e seleção; III - Armazenar dados de candidatos em sistemas externos à Plataforma sem autorização; IV - Realizar contatos não relacionados a oportunidades de emprego. § 2º - O descumprimento das obrigações de confidencialidade sujeitará o infrator às penalidades previstas neste Termo e na legislação aplicável. Art. 11 - O tratamento de dados pessoais realizado através da Plataforma obedece aos princípios e requisitos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018). § 1º - A VEON atua como operadora de dados pessoais quando realiza o tratamento de dados de candidatos em nome das Empresas Contratantes. § 2º - As Empresas Contratantes são controladoras dos dados pessoais dos candidatos que acessarem através da Plataforma, sendo responsáveis pelo cumprimento das obrigações legais aplicáveis.
            </p>

            <p className="font-semibold text-slate-300 text-[11px] mt-4">CAPÍTULO VII - DA PROPRIEDADE INTELECTUAL</p>
            <p>
              Art. 12 - Todos os direitos de propriedade intelectual relacionados à Plataforma, incluindo, mas não se limitando a: software, código-fonte, algoritmos, design, layout, textos, imagens, logotipos, marcas e qualquer outro conteúdo, são de propriedade exclusiva da VEON ou de seus licenciadores. Parágrafo único: O uso da Plataforma não confere ao Usuário qualquer direito de propriedade intelectual sobre os elementos mencionados no caput. Art. 13 - O Usuário concede à VEON licença não exclusiva, gratuita, mundial e por prazo indeterminado para utilizar, reproduzir, modificar e exibir os conteúdos por ele disponibilizados na Plataforma, exclusivamente para os fins de prestação dos serviços contratados. Art. 14 - A VEON poderá utilizar dados anonimizados e agregados para fins estatísticos, de pesquisa, desenvolvimento e melhoria dos serviços, sem qualquer identificação individual dos usuários.
            </p>

            <p className="font-semibold text-slate-300 text-[11px] mt-4">CAPÍTULO VIII - DAS PENALIDADES</p>
            <p>
              Art. 15 - O descumprimento de qualquer disposição deste Termo poderá resultar nas seguintes penalidades, aplicáveis isolada ou cumulativamente, a critério da VEON: I - Advertência formal; II - Suspensão temporária do acesso à Plataforma; III - Cancelamento definitivo da conta; IV - Perda dos créditos não utilizados; V - Cobrança de multa compensatória no valor de R$ 10.000,00 (dez mil reais) por infração; VI - Responsabilização civil pelos danos causados; VII - Comunicação às autoridades competentes, quando aplicável. Art. 16 - O descumprimento das obrigações de confidencialidade e proteção de dados sujeitará o infrator às penalidades previstas na Lei Geral de Proteção de Dados (LGPD), incluindo: I - Advertência; II - Multa simples de até 2% do faturamento, limitada a R$ 50.000.000,00 por infração; III - Multa diária; IV - Publicização da infração; V - Bloqueio ou eliminação dos dados pessoais; VI - Suspensão ou proibição do exercício de atividade de tratamento de dados.
            </p>

            <p className="font-semibold text-slate-300 text-[11px] mt-4">CAPÍTULO IX - DA LIMITAÇÃO DE RESPONSABILIDADE</p>
            <p>
              Art. 17 - A VEON não se responsabiliza por: I - Danos decorrentes de caso fortuito ou força maior; II - Atos praticados por terceiros, incluindo invasões, ataques cibernéticos ou outras interferências; III - Indisponibilidade temporária da Plataforma por motivos técnicos, manutenção ou atualização; IV - Conteúdos publicados por usuários; V - Resultados dos processos seletivos; VI - Veracidade das informações fornecidas por candidatos ou empresas; VII - Relações trabalhistas estabelecidas entre empresas e candidatos. Art. 18 - Em qualquer hipótese, a responsabilidade da VEON estará limitada ao valor efetivamente pago pelo Usuário nos últimos 12 meses anteriores ao evento danoso. Parágrafo único: Esta limitação não se aplica em casos de dolo ou culpa grave comprovados.
            </p>

            <p className="font-semibold text-slate-300 text-[11px] mt-4">CAPÍTULO X - DA VIGÊNCIA E RESCISÃO</p>
            <p>
              Art. 19 - Este Termo entra em vigor na data do aceite pelo Usuário e permanece válido por prazo indeterminado. Art. 20 - O Usuário pode rescindir este Termo a qualquer momento, mediante solicitação de exclusão de sua conta através dos canais disponibilizados pela Plataforma. § 1º - A rescisão não exime o Usuário das obrigações já assumidas durante a vigência do Termo. § 2º - Os créditos não utilizados no momento da rescisão não serão reembolsados, salvo disposição legal em contrário. Art. 21 - A VEON pode rescindir este Termo a qualquer momento, mediante comunicação prévia de 30 dias, ressalvados os casos de descumprimento das obrigações previstas, hipótese em que a rescisão será imediata.
            </p>

            <p className="font-semibold text-slate-300 text-[11px] mt-4">CAPÍTULO XI - DAS DISPOSIÇÕES GERAIS</p>
            <p>
              Art. 22 - A tolerância de uma das partes quanto ao descumprimento de qualquer obrigação pela outra não implicará novação, renúncia ou alteração do pactuado. Art. 23 - A eventual invalidade ou nulidade de qualquer cláusula deste Termo não afetará a validade das demais disposições, que permanecerão em pleno vigor e efeito. Art. 24 - A VEON reserva-se o direito de modificar este Termo a qualquer momento, mediante publicação da versão atualizada na Plataforma. § 1º - As alterações entrarão em vigor na data de sua publicação. § 2º - O uso continuado da Plataforma após a publicação das alterações implica na aceitação dos novos termos. Art. 25 - Este Termo é regido pelas leis da República Federativa do Brasil. Art. 26 - Fica eleito o foro da Comarca de São Paulo, Estado de São Paulo, para dirimir quaisquer dúvidas ou controvérsias decorrentes deste Termo, com renúncia expressa a qualquer outro, por mais privilegiado que seja. Art. 27 - As comunicações entre as partes serão realizadas preferencialmente através dos canais disponibilizados na Plataforma ou por e-mail. Art. 28 - Este instrumento constitui o acordo integral entre as partes com relação ao seu objeto, substituindo todos os acordos, entendimentos e negociações anteriores, verbais ou escritos.
            </p>

            <p className="font-semibold text-slate-300 text-[11px] mt-4">ANEXO I - POLÍTICA DE PRIVACIDADE (RESUMO)</p>
            <p>
              A presente política descreve como a VEON coleta, utiliza, armazena e protege os dados pessoais dos usuários da Plataforma. 1. DADOS COLETADOS: Coletamos dados fornecidos diretamente pelo usuário (nome, e-mail, telefone, CPF/CNPJ, endereço, informações profissionais), dados coletados automaticamente (endereço IP, tipo de dispositivo, navegador, sistema operacional, páginas acessadas, tempo de permanência, cookies) e dados obtidos de terceiros (informações públicas, bases de dados governamentais). 2. FINALIDADES: Os dados são utilizados para: prestação dos serviços contratados; personalização da experiência do usuário; comunicação sobre produtos, serviços e novidades; melhoria da Plataforma; cumprimento de obrigações legais; prevenção de fraudes; análises estatísticas e de mercado. 3. COMPARTILHAMENTO: Os dados podem ser compartilhados com: empresas do grupo econômico; prestadores de serviços (processadores de pagamento, serviços de hospedagem, etc.); autoridades governamentais quando exigido por lei; empresas contratantes (no caso de candidatos). 4. ARMAZENAMENTO: Os dados são armazenados em servidores seguros, localizados no Brasil e/ou no exterior, pelo prazo necessário ao cumprimento das finalidades descritas ou conforme exigido por lei. 5. DIREITOS DOS TITULARES: Os titulares podem exercer os direitos previstos na LGPD, incluindo: confirmação e acesso; correção; anonimização, bloqueio ou eliminação; portabilidade; informação sobre compartilhamento; revogação do consentimento; oposição.
            </p>

            <p className="font-semibold text-slate-300 text-[11px] mt-4">ANEXO II - POLÍTICA DE COOKIES</p>
            <p>
              1. O QUE SÃO COOKIES: Cookies são pequenos arquivos de texto armazenados no dispositivo do usuário quando este acessa a Plataforma. 2. TIPOS DE COOKIES UTILIZADOS: a) Cookies essenciais: necessários para o funcionamento básico da Plataforma; b) Cookies de desempenho: coletam informações sobre como os usuários utilizam a Plataforma; c) Cookies de funcionalidade: permitem personalizar a experiência do usuário; d) Cookies de publicidade: utilizados para exibir anúncios relevantes. 3. GERENCIAMENTO DE COOKIES: O usuário pode configurar seu navegador para recusar cookies ou alertá-lo quando cookies estiverem sendo enviados. A desativação de cookies pode afetar o funcionamento de algumas funcionalidades da Plataforma. 4. COOKIES DE TERCEIROS: A Plataforma pode utilizar serviços de terceiros que também utilizam cookies, como: Google Analytics, Facebook Pixel, entre outros. Estes serviços possuem políticas de privacidade próprias.
            </p>

            <p className="font-semibold text-slate-300 text-[11px] mt-4">ANEXO III - ACORDO DE NÍVEL DE SERVIÇO (SLA)</p>
            <p>
              1. DISPONIBILIDADE: A VEON se compromete a manter a Plataforma disponível em pelo menos 99% do tempo, calculado mensalmente, excluindo-se períodos de manutenção programada e casos de força maior. 2. MANUTENÇÃO: As manutenções programadas serão realizadas preferencialmente em horários de baixa utilização e comunicadas com antecedência mínima de 24 horas, exceto em casos de urgência. 3. SUPORTE: O suporte técnico está disponível através dos canais indicados na Plataforma, em horário comercial (segunda a sexta, das 9h às 18h, exceto feriados). 4. TEMPO DE RESPOSTA: A VEON se compromete a responder às solicitações de suporte em até 48 horas úteis. 5. COMPENSAÇÃO: Em caso de indisponibilidade superior ao limite estabelecido, o usuário terá direito a créditos proporcionais ao período de indisponibilidade, limitados a 30% do valor pago no mês.
            </p>

            <p className="text-center text-slate-500 text-[9px] mt-6 border-t border-slate-700 pt-4">
              Documento gerado eletronicamente. Versão 2.4.1 - Última atualização: {new Date().toLocaleDateString('pt-BR')}.
              Registro: VEON-TOS-{Date.now().toString(36).toUpperCase()}.
              Este documento foi elaborado em conformidade com a Lei nº 13.709/2018 (LGPD), Lei nº 12.965/2014 (Marco Civil da Internet),
              Código de Defesa do Consumidor (Lei nº 8.078/1990) e demais legislações aplicáveis.
              Em caso de dúvidas, entre em contato através do e-mail juridico@veon.com.br.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700">
            <Button
              onClick={() => setShowTermosModal(false)}
              className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

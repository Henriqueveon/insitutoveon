// =====================================================
// CADASTRO EMPRESA - Área de Recrutamento VEON
// 5 Etapas: CNPJ → Sócio → Foto → Termos → Senha
// =====================================================

import { useState, useRef } from 'react';
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
} from 'lucide-react';
import { buscarCNPJ, formatarCNPJ, validarCNPJ } from '../services/cnpjService';
import { CNPJResponse } from '../types/recrutamento.types';

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

  // Etapa 4: Termos
  const [showTermosModal, setShowTermosModal] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouLGPD, setAceitouLGPD] = useState(false);

  // Etapa 5: Senha
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  // Progresso
  const progresso = (etapa / 5) * 100;

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

  // ========== ETAPA 3: FOTO ==========
  const iniciarCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      setStreamCamera(stream);
      setUsandoCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: 'Erro na câmera',
        description: 'Não foi possível acessar a câmera. Tente fazer upload de uma foto.',
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

      // 3. Inserir empresa no banco
      const { error: insertError } = await supabase.from('empresas_recrutamento').insert({
        cnpj: dadosCNPJ.cnpj,
        razao_social: dadosCNPJ.razao_social,
        nome_fantasia: dadosCNPJ.nome_fantasia,
        situacao_cadastral: dadosCNPJ.situacao_cadastral,
        data_abertura: dadosCNPJ.data_abertura,
        natureza_juridica: dadosCNPJ.natureza_juridica,
        porte: dadosCNPJ.porte,
        capital_social: dadosCNPJ.capital_social,
        logradouro: dadosCNPJ.logradouro,
        numero: dadosCNPJ.numero,
        complemento: dadosCNPJ.complemento,
        bairro: dadosCNPJ.bairro,
        cidade: dadosCNPJ.municipio,
        estado: dadosCNPJ.uf,
        cep: dadosCNPJ.cep,
        telefone_empresa: dadosCNPJ.telefone,
        email_empresa: dadosCNPJ.email,
        socio_nome: socioNome,
        socio_cpf: socioCpf,
        socio_email: socioEmail,
        socio_telefone: socioTelefone,
        socio_foto_url: fotoUrlFinal,
        senha_hash: 'AUTH_SUPABASE', // Senha gerenciada pelo Supabase Auth
        aceite_termos: aceitouTermos,
        aceite_termos_data: new Date().toISOString(),
        aceite_lgpd: aceitouLGPD,
        aceite_lgpd_data: new Date().toISOString(),
        status: 'ativo',
      });

      if (insertError) throw insertError;

      toast({
        title: 'Cadastro realizado!',
        description: 'Sua empresa foi cadastrada com sucesso.',
      });

      navigate('/recrutamento/empresa/dashboard');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast({
        title: 'Erro no cadastro',
        description: error instanceof Error ? error.message : 'Erro ao cadastrar empresa. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Navegação entre etapas
  const proximaEtapa = () => {
    if (etapa === 4 && !showTermosModal) {
      setShowTermosModal(true);
      return;
    }
    setEtapa((prev) => Math.min(prev + 1, 5));
  };

  const etapaAnterior = () => {
    setEtapa((prev) => Math.max(prev - 1, 1));
  };

  // Validação por etapa
  const podeAvancar = () => {
    switch (etapa) {
      case 1:
        return dadosCNPJ !== null;
      case 2:
        return socioNome && socioCpf.length === 14 && socioEmail && socioTelefone.length >= 14;
      case 3:
        return fotoUrl !== null;
      case 4:
        return aceitouTermos && aceitouLGPD;
      case 5:
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
            <span>Etapa {etapa} de 5</span>
            <span>{Math.round(progresso)}%</span>
          </div>
          <Progress value={progresso} className="h-2 bg-slate-700" />

          {/* Steps indicators */}
          <div className="flex justify-between mt-4">
            {[
              { icon: Search, label: 'CNPJ' },
              { icon: User, label: 'Sócio' },
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
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
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

            {/* ========== ETAPA 3: FOTO ========== */}
            {etapa === 3 && (
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

            {/* ========== ETAPA 4: TERMOS ========== */}
            {etapa === 4 && (
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
                        Li e aceito os termos de responsabilidade e confidencialidade
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
                        Concordo com a coleta de dados para melhoria da plataforma (LGPD)
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========== ETAPA 5: SENHA ========== */}
            {etapa === 5 && (
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

              {etapa < 5 ? (
                <Button
                  onClick={proximaEtapa}
                  disabled={!podeAvancar()}
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
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              TERMO DE RESPONSABILIDADE E CONFIDENCIALIDADE
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Leia atentamente os termos abaixo
            </DialogDescription>
          </DialogHeader>

          <div className="prose prose-invert prose-sm max-w-none mt-4">
            <p className="text-slate-300">
              Ao utilizar a plataforma Veon Recrutamento, você declara estar ciente e concorda
              com os seguintes termos:
            </p>

            <h3 className="text-white font-semibold mt-4">1. CONFIDENCIALIDADE DOS DADOS</h3>
            <p className="text-slate-300">
              Os dados dos candidatos disponibilizados nesta plataforma são confidenciais e de
              uso exclusivo para fins de recrutamento e seleção.
            </p>

            <h3 className="text-white font-semibold mt-4">2. PROIBIÇÃO DE COMPARTILHAMENTO</h3>
            <p className="text-slate-300">
              É expressamente proibido compartilhar, divulgar, vender ou transferir dados dos
              candidatos para terceiros.
            </p>

            <h3 className="text-white font-semibold mt-4">3. USO ADEQUADO</h3>
            <p className="text-slate-300">
              Os dados devem ser utilizados exclusivamente para contato profissional
              relacionado a oportunidades de emprego.
            </p>

            <h3 className="text-white font-semibold mt-4">4. PENALIDADES</h3>
            <p className="text-slate-300">
              O descumprimento destes termos sujeitará a empresa às penalidades previstas na
              Lei Geral de Proteção de Dados (LGPD) - Lei nº 13.709/2018, incluindo multas de
              até 2% do faturamento, limitada a R$ 50 milhões por infração.
            </p>

            <h3 className="text-white font-semibold mt-4">5. COLETA DE DADOS</h3>
            <p className="text-slate-300">
              Você está ciente de que a Veon coleta dados de uso da plataforma para melhoria
              contínua dos serviços.
            </p>

            <h3 className="text-white font-semibold mt-4">6. RESPONSABILIDADE</h3>
            <p className="text-slate-300">
              A empresa é integralmente responsável pelo uso que fizer dos dados acessados
              através desta plataforma.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700">
            <Button
              onClick={() => setShowTermosModal(false)}
              className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
            >
              Fechar e Voltar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =====================================================
// CURRÍCULO PÚBLICO - Link compartilhável do candidato
// Empresas precisam fazer login/cadastro para ver contato
// =====================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Car,
  Plane,
  Home,
  Clock,
  DollarSign,
  Play,
  Star,
  Target,
  CheckCircle,
  Lock,
  Building2,
  Mail,
  Phone,
  Send,
  LogIn,
  UserPlus,
  ArrowLeft,
} from 'lucide-react';

interface Candidato {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  foto_url: string | null;
  video_url: string | null;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  perfil_disc: string | null;
  objetivo_profissional: string | null;
  status: string;

  // Experiência
  areas_experiencia: string[] | null;
  anos_experiencia: number | null;
  ultima_empresa: string | null;
  ultimo_cargo: string | null;
  tempo_ultima_empresa: string | null;

  // Formação
  escolaridade: string | null;
  curso: string | null;
  certificacoes: string | null;

  // Disponibilidade
  disponibilidade_inicio: string | null;
  disponibilidade_horario: string | null;
  regime_preferido: string | null;
  pretensao_salarial: string | null;

  // Logística
  possui_cnh: string | null;
  possui_veiculo: string | null;
  aceita_viajar: string | null;
  aceita_mudanca: string | null;

  // Valores
  valores_empresa: string[] | null;
  areas_interesse: string[] | null;
}

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
}

export default function CurriculoPublico() {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();

  const [candidato, setCandidato] = useState<Candidato | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [mostrarModalAcesso, setMostrarModalAcesso] = useState(false);

  useEffect(() => {
    if (shortId) {
      carregarDados();
    }
  }, [shortId]);

  const carregarDados = async () => {
    setIsLoading(true);
    setErro(null);

    try {
      // 1. Buscar candidato pelo shortId (primeiros 8 caracteres do UUID)
      const { data: candidatos, error: candidatoError } = await supabase
        .from('candidatos_recrutamento')
        .select('*')
        .ilike('id', `${shortId}%`)
        .limit(1);

      if (candidatoError) throw candidatoError;

      if (!candidatos || candidatos.length === 0) {
        setErro('Currículo não encontrado');
        setIsLoading(false);
        return;
      }

      const candidatoData = candidatos[0];

      // Verificar se candidato está disponível
      if (candidatoData.status === 'contratado') {
        setErro('Este profissional já foi contratado');
        setIsLoading(false);
        return;
      }

      setCandidato(candidatoData);

      // 2. Verificar se há empresa logada
      // Primeiro tentar via Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: empresaData } = await supabase
          .from('empresas_recrutamento')
          .select('id, razao_social, nome_fantasia')
          .eq('auth_user_id', user.id)
          .single();

        if (empresaData) {
          setEmpresa(empresaData);
        }
      }

      // Se não encontrou via auth, tentar localStorage
      if (!empresa) {
        const empresaId = localStorage.getItem('veon_empresa_id');
        if (empresaId) {
          const { data: empresaData } = await supabase
            .from('empresas_recrutamento')
            .select('id, razao_social, nome_fantasia')
            .eq('id', empresaId)
            .single();

          if (empresaData) {
            setEmpresa(empresaData);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar:', error);
      setErro('Erro ao carregar currículo');
    } finally {
      setIsLoading(false);
    }
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const getCorPerfil = (perfil: string | null) => {
    switch (perfil) {
      case 'D': return 'bg-red-500';
      case 'I': return 'bg-yellow-500';
      case 'S': return 'bg-green-500';
      case 'C': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  const getNomePerfil = (perfil: string | null) => {
    switch (perfil) {
      case 'D': return 'Dominância';
      case 'I': return 'Influência';
      case 'S': return 'Estabilidade';
      case 'C': return 'Conformidade';
      default: return 'Não avaliado';
    }
  };

  const getDescricaoPerfil = (perfil: string | null) => {
    switch (perfil) {
      case 'D': return 'Direto, decisivo, orientado a resultados';
      case 'I': return 'Comunicativo, entusiasta, otimista';
      case 'S': return 'Calmo, paciente, leal';
      case 'C': return 'Analítico, preciso, detalhista';
      default: return '';
    }
  };

  const getFaixaSalarialLabel = (faixa: string | null) => {
    if (!faixa) return 'A combinar';
    const faixas: Record<string, string> = {
      'ate_1500': 'Até R$ 1.500',
      '1500_2500': 'R$ 1.500 - R$ 2.500',
      '2500_4000': 'R$ 2.500 - R$ 4.000',
      '4000_6000': 'R$ 4.000 - R$ 6.000',
      '6000_10000': 'R$ 6.000 - R$ 10.000',
      'acima_10000': 'Acima de R$ 10.000',
    };
    return faixas[faixa] || faixa;
  };

  const getDisponibilidadeLabel = (disp: string | null) => {
    if (!disp) return 'A combinar';
    const disps: Record<string, string> = {
      'imediata': 'Imediata',
      '15_dias': 'Em 15 dias',
      '30_dias': 'Em 30 dias',
      'a_combinar': 'A combinar',
    };
    return disps[disp] || disp;
  };

  const handleEnviarProposta = () => {
    if (!empresa) {
      setMostrarModalAcesso(true);
      return;
    }
    // Redirecionar para o painel da empresa com o candidato selecionado
    navigate(`/recrutamento/empresa/buscar-candidatos?candidato=${candidato?.id}`);
  };

  const handleLogin = () => {
    // Salvar URL atual para retornar após login
    localStorage.setItem('veon_redirect_after_login', window.location.pathname);
    navigate('/recrutamento/empresa/login');
  };

  const handleCadastro = () => {
    // Salvar URL atual para retornar após cadastro
    localStorage.setItem('veon_redirect_after_login', window.location.pathname);
    navigate('/recrutamento/empresa/bem-vindo');
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E31E24]" />
      </div>
    );
  }

  // Erro
  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/80 border-slate-700 max-w-md w-full">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{erro}</h2>
            <p className="text-slate-400 mb-6">
              O link pode estar incorreto ou expirado.
            </p>
            <Button
              onClick={() => navigate('/recrutamento/empresa/bem-vindo')}
              className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
            >
              Ir para área de empresas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!candidato) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#003DA5]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-xl flex items-center justify-center">
              <span className="text-lg font-black text-white">V</span>
            </div>
            <span className="text-white font-semibold">VEON Recrutamento</span>
          </div>

          {empresa ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Building2 className="w-3 h-3 mr-1" />
              {empresa.nome_fantasia || empresa.razao_social}
            </Badge>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogin}
              className="border-slate-600 text-slate-300"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Entrar como Empresa
            </Button>
          )}
        </div>

        {/* Card Principal */}
        <Card className="bg-slate-800/60 border-slate-700 overflow-hidden mb-4">
          {/* Header com foto */}
          <div className="bg-gradient-to-r from-[#E31E24]/20 to-[#003DA5]/20 p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-24 w-24 border-2 border-white/20">
                <AvatarImage src={candidato.foto_url || undefined} />
                <AvatarFallback className="bg-slate-600 text-white text-3xl">
                  {candidato.nome_completo.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {candidato.nome_completo}
                </h1>
                <p className="text-slate-300 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {candidato.cidade}, {candidato.estado}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  {calcularIdade(candidato.data_nascimento)} anos
                </p>

                {/* Status */}
                <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Disponível para contratação
                </Badge>
              </div>
            </div>

            {/* Perfil DISC */}
            {candidato.perfil_disc && (
              <div className="mt-4 flex items-center space-x-3 bg-slate-800/50 rounded-lg p-3">
                <div className={`w-14 h-14 rounded-full ${getCorPerfil(candidato.perfil_disc)} flex items-center justify-center text-xl font-bold text-white`}>
                  {candidato.perfil_disc}
                </div>
                <div>
                  <p className="text-white font-medium">
                    Perfil {getNomePerfil(candidato.perfil_disc)}
                  </p>
                  <p className="text-sm text-slate-400">
                    {getDescricaoPerfil(candidato.perfil_disc)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <CardContent className="p-5 space-y-6">
            {/* Objetivo */}
            {candidato.objetivo_profissional && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Objetivo Profissional
                </h3>
                <p className="text-white">{candidato.objetivo_profissional}</p>
              </div>
            )}

            {/* Vídeo */}
            {candidato.video_url && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                  <Play className="w-4 h-4 mr-2" />
                  Vídeo de Apresentação
                </h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-slate-900">
                  <video
                    src={candidato.video_url}
                    controls
                    className="w-full h-full object-contain"
                    poster={candidato.foto_url || undefined}
                  />
                </div>
              </div>
            )}

            {/* Experiência */}
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                Experiência Profissional
              </h3>
              {candidato.ultima_empresa && (
                <div className="bg-slate-700/50 rounded-lg p-3 mb-2">
                  <p className="text-white font-medium">{candidato.ultimo_cargo}</p>
                  <p className="text-slate-400 text-sm">{candidato.ultima_empresa}</p>
                  {candidato.tempo_ultima_empresa && (
                    <p className="text-slate-500 text-xs mt-1">
                      Período: {candidato.tempo_ultima_empresa}
                    </p>
                  )}
                </div>
              )}
              {candidato.areas_experiencia && candidato.areas_experiencia.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {candidato.areas_experiencia.map((area, i) => (
                    <Badge key={i} variant="secondary" className="bg-slate-700 text-slate-300">
                      {area}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Formação */}
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                <GraduationCap className="w-4 h-4 mr-2" />
                Formação
              </h3>
              <p className="text-white">{candidato.escolaridade || 'Não informado'}</p>
              {candidato.curso && (
                <p className="text-slate-400 text-sm">{candidato.curso}</p>
              )}
              {candidato.certificacoes && (
                <p className="text-slate-500 text-xs mt-1">
                  Certificações: {candidato.certificacoes}
                </p>
              )}
            </div>

            {/* Disponibilidade */}
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Disponibilidade
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Início</p>
                  <p className="text-white text-sm">
                    {getDisponibilidadeLabel(candidato.disponibilidade_inicio)}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Horário</p>
                  <p className="text-white text-sm">{candidato.disponibilidade_horario || 'Flexível'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Regime</p>
                  <p className="text-white text-sm capitalize">{candidato.regime_preferido || 'A combinar'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Pretensão</p>
                  <p className="text-white text-sm">
                    {getFaixaSalarialLabel(candidato.pretensao_salarial)}
                  </p>
                </div>
              </div>
            </div>

            {/* Características */}
            <div className="flex flex-wrap gap-2">
              {candidato.possui_cnh && candidato.possui_cnh !== 'nao' && (
                <Badge className="bg-blue-500/20 text-blue-400">
                  <Car className="w-3 h-3 mr-1" />
                  CNH {candidato.possui_cnh}
                </Badge>
              )}
              {candidato.possui_veiculo === 'sim' && (
                <Badge className="bg-green-500/20 text-green-400">
                  <Car className="w-3 h-3 mr-1" />
                  Veículo próprio
                </Badge>
              )}
              {candidato.aceita_viajar === 'sim' && (
                <Badge className="bg-purple-500/20 text-purple-400">
                  <Plane className="w-3 h-3 mr-1" />
                  Aceita viajar
                </Badge>
              )}
              {candidato.aceita_mudanca === 'sim' && (
                <Badge className="bg-orange-500/20 text-orange-400">
                  <Home className="w-3 h-3 mr-1" />
                  Aceita mudança
                </Badge>
              )}
            </div>

            {/* Áreas de interesse */}
            {candidato.areas_interesse && candidato.areas_interesse.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Áreas de Interesse
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidato.areas_interesse.map((area, i) => (
                    <Badge key={i} variant="outline" className="border-slate-600 text-slate-300">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Valores */}
            {candidato.valores_empresa && candidato.valores_empresa.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  O que busca em uma empresa
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidato.valores_empresa.map((valor, i) => (
                    <Badge key={i} variant="outline" className="border-slate-600 text-slate-300">
                      {valor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Dados de contato - APENAS para empresas logadas */}
            {empresa ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-400 mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Dados de Contato
                </h3>
                <div className="space-y-2">
                  <p className="text-white flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-slate-400" />
                    {candidato.email}
                  </p>
                  <p className="text-white flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-slate-400" />
                    {candidato.telefone}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Dados de contato protegidos</p>
                    <p className="text-slate-400 text-sm">
                      Faça login como empresa para ver email e telefone
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA - Ação principal */}
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="p-5">
            {empresa ? (
              <>
                <Button
                  onClick={handleEnviarProposta}
                  className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B] text-white font-semibold py-6 text-lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Proposta de Entrevista
                </Button>
                <p className="text-center text-slate-500 text-xs mt-3">
                  O candidato receberá sua proposta e poderá aceitar ou recusar
                </p>
              </>
            ) : (
              <>
                <p className="text-center text-slate-300 mb-4">
                  Gostou deste profissional? <br />
                  <span className="text-white font-medium">Cadastre sua empresa para entrar em contato!</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleLogin}
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700 py-5"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Fazer Login
                  </Button>
                  <Button
                    onClick={handleCadastro}
                    className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] py-5"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Cadastrar Empresa
                  </Button>
                </div>
                <p className="text-center text-slate-500 text-xs mt-3">
                  Cadastro rápido em menos de 1 minuto
                </p>

                {/* Opção para pessoa física */}
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-center text-slate-400 text-sm mb-2">
                    Não é uma empresa?
                  </p>
                  <Button
                    onClick={() => navigate('/recrutamento/candidato/bem-vindo')}
                    variant="ghost"
                    className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sou profissional, quero cadastrar meu currículo
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm">
            Currículo verificado por VEON Recrutamento
          </p>
        </div>
      </div>

      {/* Modal de Acesso (para clique em enviar proposta sem login) */}
      {mostrarModalAcesso && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#E31E24]/20 rounded-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-[#E31E24]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Acesso exclusivo para empresas
                </h2>
                <p className="text-slate-400">
                  Para enviar propostas e ver dados de contato, você precisa estar cadastrado como empresa.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleCadastro}
                  className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C] py-5"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Cadastrar minha empresa
                </Button>
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full border-slate-600 text-white py-5"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Já tenho cadastro
                </Button>

                {/* Divisor */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-slate-800 text-slate-500">ou</span>
                  </div>
                </div>

                {/* Opção pessoa física */}
                <Button
                  onClick={() => {
                    setMostrarModalAcesso(false);
                    navigate('/recrutamento/candidato/bem-vindo');
                  }}
                  variant="ghost"
                  className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Não sou empresa, quero cadastrar meu currículo
                </Button>

                <Button
                  onClick={() => setMostrarModalAcesso(false)}
                  variant="ghost"
                  className="w-full text-slate-400"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

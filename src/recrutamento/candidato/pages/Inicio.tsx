// =====================================================
// INÍCIO CANDIDATO - Área de Recrutamento VEON
// Design Instagram-like com alto contraste
// =====================================================

import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Eye,
  Mail,
  Video,
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Camera,
  Zap,
  ChevronRight,
} from 'lucide-react';
import SecaoIndicacaoCandidato from '../components/SecaoIndicacaoCandidato';
import StatusIndicador from '../components/StatusIndicador';
import { ModalVerificacaoPendente } from '@/components/ModalVerificacaoPendente';

interface Candidato {
  id: string;
  nome_completo: string;
  email?: string;
  foto_url: string | null;
  video_url: string | null;
  status: string;
  perfil_disc: string | null;
  objetivo_profissional: string | null;
  cadastro_completo: boolean;
  email_verificado?: boolean;
  data_nascimento?: string | null;
  cpf?: string | null;
  estado?: string | null;
  cidade?: string | null;
  escolaridade?: string | null;
  areas_experiencia?: string[] | null;
  pretensao_salarial?: string | null;
}

interface Stats {
  visualizacoes: number;
  propostasNovas: number;
  propostasAceitas: number;
}

export default function InicioCandidato() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { candidato, propostasNovas } = useOutletContext<{
    candidato: Candidato | null;
    propostasNovas: number;
  }>();

  const [stats, setStats] = useState<Stats>({
    visualizacoes: 0,
    propostasNovas: 0,
    propostasAceitas: 0,
  });
  const [progressoPerfil, setProgressoPerfil] = useState(0);
  const [itensIncompletos, setItensIncompletos] = useState<string[]>([]);

  // Estado para modal de verificação de email
  const [modalVerificacaoAberto, setModalVerificacaoAberto] = useState(false);
  const [emailParaVerificar, setEmailParaVerificar] = useState<string>('');

  useEffect(() => {
    if (candidato?.id) {
      carregarStats();
      calcularProgressoPerfil();
    }
  }, [candidato?.id]);

  // Verificar email pendente ao carregar
  useEffect(() => {
    if (candidato && candidato.email_verificado !== true) {
      // Email não verificado - buscar email e abrir modal
      const buscarEmailCandidato = async () => {
        const { data } = await supabase
          .from('candidatos_recrutamento')
          .select('email')
          .eq('id', candidato.id)
          .single();

        if (data?.email) {
          setEmailParaVerificar(data.email);
          setModalVerificacaoAberto(true);
        }
      };

      buscarEmailCandidato();
    }
  }, [candidato?.id, candidato?.email_verificado]);

  const carregarStats = async () => {
    if (!candidato?.id) return;

    // Visualizações (simulado - em produção seria uma tabela de logs)
    const visualizacoes = Math.floor(Math.random() * 20) + 5;

    // Propostas novas (aguardando resposta do candidato)
    const { count: novas } = await supabase
      .from('solicitacoes_entrevista')
      .select('*', { count: 'exact', head: true })
      .eq('candidato_id', candidato.id)
      .eq('status', 'aguardando_candidato');

    // Propostas aceitas
    const { count: aceitas } = await supabase
      .from('solicitacoes_entrevista')
      .select('*', { count: 'exact', head: true })
      .eq('candidato_id', candidato.id)
      .eq('status', 'aceita');

    setStats({
      visualizacoes,
      propostasNovas: novas || 0,
      propostasAceitas: aceitas || 0,
    });
  };

  const calcularProgressoPerfil = () => {
    if (!candidato) return;

    const itens = [];
    let pontos = 0;
    const total = 5;

    // Foto
    if (candidato.foto_url) {
      pontos++;
    } else {
      itens.push('Adicione sua foto');
    }

    // Vídeo
    if (candidato.video_url) {
      pontos++;
    } else {
      itens.push('Grave seu vídeo de apresentação');
    }

    // Perfil DISC
    if (candidato.perfil_disc) {
      pontos++;
    } else {
      itens.push('Complete o teste DISC');
    }

    // Objetivo profissional
    if (candidato.objetivo_profissional) {
      pontos++;
    } else {
      itens.push('Adicione seu objetivo profissional');
    }

    // Status disponível
    if (candidato.status === 'disponivel') {
      pontos++;
    } else {
      itens.push('Ative seu perfil para receber propostas');
    }

    setProgressoPerfil((pontos / total) * 100);
    setItensIncompletos(itens);
  };

  // Verificar se perfil está completo (mesma lógica do StatusIndicador)
  const perfilCompleto = !!(
    candidato?.cadastro_completo &&
    candidato?.foto_url &&
    candidato?.perfil_disc
  );

  const getStatusConfig = () => {
    // Se perfil incompleto, mostrar como OFF
    if (!perfilCompleto) {
      return {
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        icon: '🔴',
        text: 'Você está OFFLINE para empresas',
        subtext: 'Complete seu perfil para aparecer nas buscas',
      };
    }

    // Perfil completo - mostrar status real
    switch (candidato?.status) {
      case 'disponivel':
        return {
          color: 'from-green-500 to-green-600',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          icon: '🟢',
          text: 'Você está DISPONÍVEL para o mercado',
          subtext: 'Empresas podem visualizar seu perfil e enviar propostas',
        };
      case 'pausado':
        return {
          color: 'from-slate-500 to-slate-600',
          bgColor: 'bg-slate-500/10',
          borderColor: 'border-slate-500/30',
          icon: '⏸️',
          text: 'Seu perfil está PAUSADO',
          subtext: 'Você não está recebendo novas propostas',
        };
      case 'contratado':
        return {
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          icon: '🎉',
          text: 'Parabéns! Você foi CONTRATADO',
          subtext: 'Seu perfil não está mais visível para empresas',
        };
      default:
        return {
          color: 'from-green-500 to-green-600',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          icon: '🟢',
          text: 'Você está DISPONÍVEL para o mercado',
          subtext: 'Empresas podem visualizar seu perfil e enviar propostas',
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Verificar se precisa mostrar indicador de status OFF
  const mostrarStatusOff = candidato && (
    !candidato.cadastro_completo ||
    !candidato.foto_url ||
    !candidato.perfil_disc
  );

  // Ações rápidas
  const acoesRapidas = [
    {
      icon: Video,
      label: 'Gravar vídeo',
      descricao: '3x mais propostas',
      ativo: !candidato?.video_url,
      action: () => navigate('/recrutamento/candidato/configuracoes'),
      cor: 'from-purple-500 to-pink-500',
    },
    {
      icon: Camera,
      label: 'Adicionar foto',
      descricao: 'Foto profissional',
      ativo: !candidato?.foto_url,
      action: () => navigate('/recrutamento/candidato/configuracoes'),
      cor: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      label: 'Currículo',
      descricao: 'Ver ou editar',
      ativo: true,
      action: () => navigate('/recrutamento/candidato/meu-curriculo'),
      cor: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* Indicador de Status OFF */}
      {mostrarStatusOff && candidato && (
        <StatusIndicador candidato={candidato} />
      )}

      {/* Card Principal de Status - Estilo Stories */}
      <div className={`rounded-2xl p-5 ${
        perfilCompleto
          ? 'bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border border-emerald-500/30'
          : 'bg-gradient-to-br from-red-600/20 to-red-900/20 border border-red-500/30'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            perfilCompleto ? 'bg-emerald-500' : 'bg-red-500'
          }`}>
            {perfilCompleto ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">
              {statusConfig.text}
            </h2>
            <p className="text-sm text-white/60">
              {statusConfig.subtext}
            </p>
          </div>
        </div>

        {/* Stats Grid - Alto contraste */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/30 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-white/50" />
              <span className="text-xs text-white/50 font-medium">Visualizações</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.visualizacoes}
            </p>
          </div>
          <div className="bg-black/30 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-white/50" />
              <span className="text-xs text-white/50 font-medium">Propostas</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.propostasNovas}
            </p>
          </div>
        </div>

        {stats.propostasNovas > 0 && (
          <Button
            onClick={() => navigate('/recrutamento/candidato/propostas')}
            className="w-full mt-4 bg-white text-black font-bold h-12 rounded-xl hover:bg-white/90"
          >
            Ver {stats.propostasNovas} proposta{stats.propostasNovas > 1 ? 's' : ''}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>

      {/* Progresso do Perfil - Design moderno */}
      {progressoPerfil < 100 && (
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="font-semibold text-white">Complete seu perfil</span>
            </div>
            <span className="text-sm font-bold text-white bg-white/10 px-2.5 py-1 rounded-full">
              {Math.round(progressoPerfil)}%
            </span>
          </div>

          {/* Barra de progresso customizada */}
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${progressoPerfil}%` }}
            />
          </div>

          <div className="space-y-2.5">
            {itensIncompletos.slice(0, 2).map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-white/80">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ações Rápidas - Grid estilo Instagram */}
      <div className="grid grid-cols-3 gap-3">
        {acoesRapidas.filter(a => a.ativo).slice(0, 3).map((acao, index) => (
          <button
            key={index}
            onClick={acao.action}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center hover:bg-zinc-800 transition-all active:scale-95"
          >
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${acao.cor} flex items-center justify-center`}>
              <acao.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-white font-medium text-sm">{acao.label}</p>
            <p className="text-zinc-500 text-xs mt-0.5">{acao.descricao}</p>
          </button>
        ))}
      </div>

      {/* Perfil DISC - Card moderno */}
      {candidato?.perfil_disc && (
        <button
          onClick={() => navigate('/recrutamento/candidato/meu-curriculo')}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-left hover:bg-zinc-800 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white ${
                candidato.perfil_disc === 'D' ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                candidato.perfil_disc === 'I' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                candidato.perfil_disc === 'S' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                'bg-gradient-to-br from-blue-500 to-indigo-600'
              }`}>
                {candidato.perfil_disc}
              </div>
              <div>
                <p className="text-white font-semibold text-base">
                  Perfil {candidato.perfil_disc === 'D' ? 'Dominante' :
                   candidato.perfil_disc === 'I' ? 'Influente' :
                   candidato.perfil_disc === 'S' ? 'Estável' :
                   'Analítico'}
                </p>
                <p className="text-zinc-400 text-sm mt-0.5">
                  {candidato.perfil_disc === 'D' ? 'Focado em resultados' :
                   candidato.perfil_disc === 'I' ? 'Comunicativo e entusiasta' :
                   candidato.perfil_disc === 'S' ? 'Calmo e paciente' :
                   'Preciso e detalhista'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-500" />
          </div>
        </button>
      )}

      {/* Dica do dia - Minimalista */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Dica do dia</p>
            <p className="text-zinc-400 text-sm mt-1">
              Profissionais com vídeo de apresentação recebem até 3x mais propostas de empresas.
            </p>
          </div>
        </div>
      </div>

      {/* Seção de Indicação */}
      {candidato && (
        <SecaoIndicacaoCandidato candidato={candidato} />
      )}

      {/* Modal de Verificação de Email Pendente */}
      {candidato && emailParaVerificar && (
        <ModalVerificacaoPendente
          isOpen={modalVerificacaoAberto}
          onClose={() => {
            setModalVerificacaoAberto(false);
            toast({
              title: 'Verificação pendente',
              description: 'Você pode verificar seu email a qualquer momento nas configurações.',
              variant: 'default',
            });
          }}
          email={emailParaVerificar}
          nome={candidato.nome_completo}
          tipo="candidato"
          usuarioId={candidato.id}
          onVerificado={() => {
            setModalVerificacaoAberto(false);
            toast({
              title: 'Email verificado!',
              description: 'Seu email foi verificado com sucesso.',
            });
            // Recarregar a página para atualizar o estado
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

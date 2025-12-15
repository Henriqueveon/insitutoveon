// =====================================================
// INÍCIO CANDIDATO - Área de Recrutamento VEON
// Dashboard com status e progresso do perfil
// =====================================================

import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  Mail,
  Video,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';
import SecaoIndicacaoCandidato from '../components/SecaoIndicacaoCandidato';
import StatusIndicador from '../components/StatusIndicador';

interface Candidato {
  id: string;
  nome_completo: string;
  foto_url: string | null;
  video_url: string | null;
  status: string;
  perfil_disc: string | null;
  objetivo_profissional: string | null;
  cadastro_completo: boolean;
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

  useEffect(() => {
    if (candidato?.id) {
      carregarStats();
      calcularProgressoPerfil();
    }
  }, [candidato?.id]);

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

  const dicas = [
    {
      icon: Video,
      text: 'Profissionais com vídeo recebem 3x mais propostas',
      action: () => navigate('/recrutamento/candidato/configuracoes'),
    },
    {
      icon: FileText,
      text: 'Mantenha seu currículo sempre atualizado',
      action: () => navigate('/recrutamento/candidato/meu-curriculo'),
    },
    {
      icon: TrendingUp,
      text: 'Empresas valorizam perfis completos',
      action: () => navigate('/recrutamento/candidato/configuracoes'),
    },
  ];

  // Verificar se precisa mostrar indicador de status OFF
  const mostrarStatusOff = candidato && (
    !candidato.cadastro_completo ||
    !candidato.foto_url ||
    !candidato.perfil_disc
  );

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Indicador de Status OFF - Aparece primeiro se incompleto */}
      {mostrarStatusOff && candidato && (
        <StatusIndicador candidato={candidato} />
      )}

      {/* Card de Status */}
      <Card className={`${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3 mb-4">
            <span className="text-2xl">{statusConfig.icon}</span>
            <div>
              <h2 className="text-lg font-bold text-white">
                {statusConfig.text}
              </h2>
              <p className="text-sm text-slate-400">
                {statusConfig.subtext}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <Eye className="w-4 h-4" />
                <span className="text-xs">Visualizações hoje</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.visualizacoes}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <Mail className="w-4 h-4" />
                <span className="text-xs">Propostas aguardando</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.propostasNovas}
              </p>
            </div>
          </div>

          {stats.propostasNovas > 0 && (
            <Button
              onClick={() => navigate('/recrutamento/candidato/propostas')}
              className="w-full mt-4 bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
            >
              Ver Propostas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Progresso do Perfil */}
      {progressoPerfil < 100 && (
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h3 className="font-medium text-white">Complete seu perfil</h3>
              </div>
              <span className="text-sm text-slate-400">{Math.round(progressoPerfil)}%</span>
            </div>

            <Progress value={progressoPerfil} className="h-2 mb-4" />

            <div className="space-y-2">
              {itensIncompletos.slice(0, 2).map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>

            {!candidato?.video_url && (
              <Button
                onClick={() => navigate('/recrutamento/candidato/configuracoes')}
                variant="outline"
                className="w-full mt-4 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
              >
                <Video className="w-4 h-4 mr-2" />
                Gravar Vídeo
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Perfil completo */}
      {progressoPerfil === 100 && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="font-medium text-white mb-1">Perfil completo!</h3>
            <p className="text-sm text-slate-400">
              Seu perfil está 100% completo. Continue assim!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dicas */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium text-white">Dicas para você</h3>
          </div>

          <div className="space-y-3">
            {dicas.map((dica, index) => (
              <div
                key={index}
                onClick={dica.action}
                className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <dica.icon className="w-5 h-5 text-blue-400" />
                </div>
                <p className="flex-1 text-sm text-slate-300">{dica.text}</p>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Perfil DISC */}
      {candidato?.perfil_disc && (
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">Seu Perfil DISC</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/recrutamento/candidato/meu-curriculo')}
                className="text-slate-400"
              >
                Ver completo
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                candidato.perfil_disc === 'D' ? 'bg-red-500' :
                candidato.perfil_disc === 'I' ? 'bg-yellow-500' :
                candidato.perfil_disc === 'S' ? 'bg-green-500' :
                'bg-blue-500'
              }`}>
                {candidato.perfil_disc}
              </div>
              <div>
                <p className="text-white font-medium">
                  {candidato.perfil_disc === 'D' ? 'Dominância' :
                   candidato.perfil_disc === 'I' ? 'Influência' :
                   candidato.perfil_disc === 'S' ? 'Estabilidade' :
                   'Conformidade'}
                </p>
                <p className="text-sm text-slate-400">
                  {candidato.perfil_disc === 'D' ? 'Direto, decisivo, orientado a resultados' :
                   candidato.perfil_disc === 'I' ? 'Comunicativo, entusiasta, otimista' :
                   candidato.perfil_disc === 'S' ? 'Calmo, paciente, bom ouvinte' :
                   'Analítico, preciso, detalhista'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção de Indicação */}
      {candidato && (
        <SecaoIndicacaoCandidato candidato={candidato} />
      )}
    </div>
  );
}

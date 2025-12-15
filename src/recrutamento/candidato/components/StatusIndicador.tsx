// =====================================================
// STATUS INDICADOR - Mostra se candidato está OFF/ON
// Design moderno com alto contraste
// =====================================================

import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  User,
  FileText,
  Camera,
  Brain,
  ChevronRight,
  X,
} from 'lucide-react';

interface Candidato {
  id: string;
  nome_completo: string;
  foto_url: string | null;
  video_url?: string | null;
  perfil_disc: string | null;
  cadastro_completo: boolean;
  status?: string; // 'disponivel', 'pausado', 'contratado'
  // Campos do cadastro completo
  data_nascimento?: string | null;
  cpf?: string | null;
  estado?: string | null;
  cidade?: string | null;
  escolaridade?: string | null;
  areas_experiencia?: string[] | null;
  pretensao_salarial?: string | null;
}

interface Props {
  candidato: Candidato;
  onFechar?: () => void;
}

interface PendenciaItem {
  id: string;
  titulo: string;
  descricao: string;
  icon: React.ElementType;
  completo: boolean;
  acao: string;
  rota: string;
}

export default function StatusIndicador({ candidato, onFechar }: Props) {
  const navigate = useNavigate();

  // Calcular pendências
  const getPendencias = (): PendenciaItem[] => {
    const pendencias: PendenciaItem[] = [];

    // 1. Dados pessoais completos
    const dadosPessoaisCompletos = !!(
      candidato.data_nascimento &&
      candidato.cpf &&
      candidato.estado &&
      candidato.cidade
    );
    pendencias.push({
      id: 'dados_pessoais',
      titulo: 'Dados pessoais',
      descricao: 'Nome, CPF, localização',
      icon: User,
      completo: dadosPessoaisCompletos,
      acao: 'Completar',
      rota: '/recrutamento/candidato/completar-cadastro',
    });

    // 2. Experiência profissional
    const experienciaCompleta = !!(
      candidato.escolaridade &&
      candidato.areas_experiencia?.length &&
      candidato.pretensao_salarial
    );
    pendencias.push({
      id: 'experiencia',
      titulo: 'Experiência',
      descricao: 'Formação e experiências',
      icon: FileText,
      completo: experienciaCompleta,
      acao: 'Completar',
      rota: '/recrutamento/candidato/completar-cadastro',
    });

    // 3. Foto de perfil
    pendencias.push({
      id: 'foto',
      titulo: 'Foto de perfil',
      descricao: 'Foto profissional',
      icon: Camera,
      completo: !!candidato.foto_url,
      acao: 'Adicionar',
      rota: '/recrutamento/candidato/configuracoes',
    });

    // 4. Teste DISC
    pendencias.push({
      id: 'disc',
      titulo: 'Teste DISC',
      descricao: 'Perfil comportamental',
      icon: Brain,
      completo: !!candidato.perfil_disc,
      acao: 'Fazer teste',
      rota: '/teste',
    });

    return pendencias;
  };

  const pendencias = getPendencias();
  // Pendências obrigatórias para ficar online (foto é opcional)
  const pendenciasObrigatorias = pendencias.filter(p => p.id !== 'foto');
  const obrigatoriasCompletas = pendenciasObrigatorias.filter(p => p.completo).length;
  // Progresso considera todas as pendências para mostrar ao usuário
  const totalPendencias = pendencias.length;
  const pendenciasCompletas = pendencias.filter(p => p.completo).length;
  const progresso = (pendenciasCompletas / totalPendencias) * 100;
  // Para ficar online, só precisa das obrigatórias (dados, experiência, DISC)
  const estaOnline = obrigatoriasCompletas === pendenciasObrigatorias.length;

  if (estaOnline) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-red-950 to-zinc-900 border border-red-500/30 rounded-2xl relative overflow-hidden">
      {/* Botão fechar */}
      {onFechar && (
        <button
          onClick={onFechar}
          className="absolute top-4 right-4 text-white/40 hover:text-white z-10 p-1"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="p-5">
        {/* Header com status */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="font-bold text-white text-base">Você está OFFLINE</span>
            </div>
            <p className="text-white/60 text-sm">
              Empresas não podem ver seu perfil
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm font-medium">Progresso</span>
            <span className="text-white font-bold text-sm">{Math.round(progresso)}%</span>
          </div>
          <div className="h-2.5 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>

        {/* Lista de pendências - Grid moderno */}
        <div className="grid grid-cols-2 gap-2">
          {pendencias.map((pendencia) => {
            const Icon = pendencia.icon;
            return (
              <button
                key={pendencia.id}
                onClick={() => navigate(pendencia.rota)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all active:scale-95 ${
                  pendencia.completo
                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                    : 'bg-black/30 border border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  pendencia.completo
                    ? 'bg-emerald-500'
                    : 'bg-white/10'
                }`}>
                  {pendencia.completo ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className="w-5 h-5 text-white/70" />
                  )}
                </div>
                <div className="text-left min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    pendencia.completo ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {pendencia.titulo}
                  </p>
                  {!pendencia.completo && (
                    <p className="text-xs text-red-400 font-medium">
                      {pendencia.acao} →
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Mensagem motivacional */}
        <p className="mt-4 text-xs text-center text-white/40">
          Complete para receber até 5x mais propostas
        </p>
      </div>
    </div>
  );
}

// Componente compacto para o header - Design moderno
export function StatusBadge({ candidato }: { candidato: Candidato }) {
  // Foto não é mais obrigatória para ficar online
  const perfilCompleto = !!(
    candidato.cadastro_completo &&
    candidato.perfil_disc
  );

  // Se perfil incompleto, mostrar OFF
  if (!perfilCompleto) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span>Offline</span>
      </div>
    );
  }

  // Perfil completo - mostrar status real
  const statusConfig = {
    disponivel: {
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      dot: 'bg-emerald-500',
      label: 'Online',
    },
    pausado: {
      bg: 'bg-zinc-500/20',
      border: 'border-zinc-500/30',
      text: 'text-zinc-400',
      dot: 'bg-zinc-500',
      label: 'Pausado',
    },
    contratado: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      dot: 'bg-blue-500',
      label: 'Contratado',
    },
  };

  const config = statusConfig[candidato.status as keyof typeof statusConfig] || statusConfig.disponivel;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </div>
  );
}

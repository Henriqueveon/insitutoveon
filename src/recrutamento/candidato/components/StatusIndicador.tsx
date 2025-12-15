// =====================================================
// STATUS INDICADOR - Mostra se candidato está OFF/ON
// Baseado em cadastro completo + teste DISC + foto
// =====================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  CheckCircle,
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
      descricao: 'Preencha seus dados básicos',
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
      titulo: 'Experiência profissional',
      descricao: 'Adicione sua experiência e formação',
      icon: FileText,
      completo: experienciaCompleta,
      acao: 'Completar',
      rota: '/recrutamento/candidato/completar-cadastro',
    });

    // 3. Foto de perfil
    pendencias.push({
      id: 'foto',
      titulo: 'Foto de perfil',
      descricao: 'Adicione uma foto profissional',
      icon: Camera,
      completo: !!candidato.foto_url,
      acao: 'Adicionar',
      rota: '/recrutamento/candidato/configuracoes',
    });

    // 4. Teste DISC
    pendencias.push({
      id: 'disc',
      titulo: 'Teste DISC',
      descricao: 'Descubra seu perfil comportamental',
      icon: Brain,
      completo: !!candidato.perfil_disc,
      acao: 'Fazer teste',
      rota: '/teste',
    });

    return pendencias;
  };

  const pendencias = getPendencias();
  const totalPendencias = pendencias.length;
  const pendenciasCompletas = pendencias.filter(p => p.completo).length;
  const progresso = (pendenciasCompletas / totalPendencias) * 100;
  const estaOnline = progresso === 100;

  // Se está completo, não mostrar nada (ou mostrar badge verde no header)
  if (estaOnline) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border-red-500/30 relative overflow-hidden">
      {/* Botão fechar opcional */}
      {onFechar && (
        <button
          onClick={onFechar}
          className="absolute top-3 right-3 text-slate-400 hover:text-white z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <CardContent className="p-5">
        {/* Status Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-semibold text-white">Você está OFF</span>
            </div>
            <p className="text-sm text-slate-400">
              Complete seu perfil para aparecer para empresas
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Progresso do perfil</span>
            <span className="text-white font-medium">{Math.round(progresso)}%</span>
          </div>
          <Progress value={progresso} className="h-2" />
        </div>

        {/* Lista de pendências */}
        <div className="space-y-2">
          {pendencias.map((pendencia) => {
            const Icon = pendencia.icon;
            return (
              <button
                key={pendencia.id}
                onClick={() => navigate(pendencia.rota)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                  pendencia.completo
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-slate-800/60 border border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    pendencia.completo
                      ? 'bg-green-500/20'
                      : 'bg-slate-700'
                  }`}>
                    {pendencia.completo ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Icon className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-medium ${
                      pendencia.completo ? 'text-green-400' : 'text-white'
                    }`}>
                      {pendencia.titulo}
                    </p>
                    {!pendencia.completo && (
                      <p className="text-xs text-slate-500">{pendencia.descricao}</p>
                    )}
                  </div>
                </div>
                {!pendencia.completo && (
                  <div className="flex items-center gap-1 text-[#E31E24] text-sm">
                    <span>{pendencia.acao}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Mensagem motivacional */}
        <p className="mt-4 text-xs text-center text-slate-500">
          Profissionais com perfil completo recebem 5x mais propostas
        </p>
      </CardContent>
    </Card>
  );
}

// Componente compacto para o header
export function StatusBadge({ candidato }: { candidato: Candidato }) {
  // Primeiro verificar se o perfil está completo
  const perfilCompleto = !!(
    candidato.cadastro_completo &&
    candidato.foto_url &&
    candidato.perfil_disc
  );

  // Se perfil incompleto, sempre mostrar OFF
  if (!perfilCompleto) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span>OFF</span>
      </div>
    );
  }

  // Perfil completo - mostrar status real
  const statusConfig = {
    disponivel: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      dot: 'bg-green-500',
      label: 'Disponível',
    },
    pausado: {
      bg: 'bg-slate-500/20',
      text: 'text-slate-400',
      dot: 'bg-slate-500',
      label: 'Pausado',
    },
    contratado: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      dot: 'bg-blue-500',
      label: 'Contratado',
    },
  };

  const config = statusConfig[candidato.status as keyof typeof statusConfig] || statusConfig.disponivel;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </div>
  );
}

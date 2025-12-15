// =====================================================
// DISC CONCLUIDO - Tela de sucesso após teste DISC
// Candidato vê seu perfil e fica ONLINE
// =====================================================

import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useAssessment } from '@/context/AssessmentContext';
import { getProfileDescription, getProfileType } from '@/data/discProfiles';
import {
  Sparkles,
  ArrowRight,
  Trophy,
  Eye,
  Star,
} from 'lucide-react';

interface Candidato {
  id: string;
  nome_completo: string;
  foto_url: string | null;
  perfil_disc: string | null;
  status: string;
}

export default function DiscConcluido() {
  const navigate = useNavigate();
  const { candidato, recarregarCandidato } = useOutletContext<{
    candidato: Candidato | null;
    recarregarCandidato: () => void;
  }>();

  const { naturalProfile, resetAssessment } = useAssessment();
  const [perfilSalvo, setPerfilSalvo] = useState(false);
  const [perfilInfo, setPerfilInfo] = useState<{
    tipo: string;
    nome: string;
    descricao: string;
  } | null>(null);

  const [showCelebration, setShowCelebration] = useState(true);

  // Ocultar celebração após 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => setShowCelebration(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Salvar perfil DISC e atualizar status para ONLINE
  useEffect(() => {
    const salvarPerfil = async () => {
      if (!candidato?.id || !naturalProfile || perfilSalvo) return;

      try {
        const perfilTipo = getProfileType(
          naturalProfile.D,
          naturalProfile.I,
          naturalProfile.S,
          naturalProfile.C
        );

        const profile = getProfileDescription(
          naturalProfile.D,
          naturalProfile.I,
          naturalProfile.S,
          naturalProfile.C
        );

        // Atualizar candidato com perfil DISC e status disponivel (ONLINE)
        const { error } = await supabase
          .from('candidatos_recrutamento')
          .update({
            perfil_disc: perfilTipo,
            status: 'disponivel', // ONLINE!
            perfil_natural: {
              D: naturalProfile.D,
              I: naturalProfile.I,
              S: naturalProfile.S,
              C: naturalProfile.C,
            },
          })
          .eq('id', candidato.id);

        if (error) {
          console.error('Erro ao salvar perfil DISC:', error);
        } else {
          console.log('✅ Perfil DISC salvo e candidato está ONLINE!');
          setPerfilInfo({
            tipo: perfilTipo,
            nome: profile.nome,
            descricao: profile.descricaoCurta,
          });
          setPerfilSalvo(true);

          // Recarregar dados do candidato
          recarregarCandidato();
        }
      } catch (error) {
        console.error('Erro ao salvar perfil:', error);
      }
    };

    salvarPerfil();
  }, [candidato?.id, naturalProfile, perfilSalvo, recarregarCandidato]);

  const handleVoltar = () => {
    resetAssessment();
    navigate('/recrutamento/candidato/inicio');
  };

  const handleVerCurriculo = () => {
    resetAssessment();
    navigate('/recrutamento/candidato/meu-curriculo');
  };

  // Cor do perfil DISC
  const getPerfilColor = () => {
    if (!perfilInfo?.tipo) return 'from-emerald-500 to-teal-600';
    const tipo = perfilInfo.tipo.charAt(0);
    switch (tipo) {
      case 'D': return 'from-red-500 to-rose-600';
      case 'I': return 'from-amber-500 to-orange-600';
      case 'S': return 'from-emerald-500 to-teal-600';
      case 'C': return 'from-blue-500 to-indigo-600';
      default: return 'from-emerald-500 to-teal-600';
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 max-w-lg mx-auto">
      {/* Particles de celebração */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-float-up"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#E31E24', '#003DA5', '#10b981', '#f59e0b'][i % 4],
              }}
            />
          ))}
        </div>
      )}

      {/* Card Principal */}
      <div className="w-full bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border border-emerald-500/30 rounded-3xl p-8 text-center relative overflow-hidden animate-scale-in">
        {/* Decoração de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Conteúdo */}
        <div className="relative z-10">
          {/* Ícone de sucesso */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-bounce">
            <Trophy className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">
            Parabéns! 🎉
          </h1>

          <p className="text-emerald-300 text-lg mb-2">
            Você completou o teste DISC
          </p>

          {/* Status ONLINE */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/30 border border-emerald-500/50 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-300 font-semibold">Você está ONLINE!</span>
          </div>

          {/* Info do Perfil DISC */}
          {perfilInfo && (
            <div className={`bg-gradient-to-br ${getPerfilColor()} rounded-2xl p-5 mb-6`}>
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {perfilInfo.tipo}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-white/80 text-xs font-medium">Seu perfil</p>
                  <p className="text-white font-bold text-lg">{perfilInfo.nome}</p>
                </div>
              </div>
              <p className="text-white/90 text-sm">
                {perfilInfo.descricao.slice(0, 150)}...
              </p>
            </div>
          )}

          {/* Benefícios */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                <Eye className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-white/90 text-sm text-left">
                Empresas agora podem ver seu perfil
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/30 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-white/90 text-sm text-left">
                Receba propostas de vagas compatíveis
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-white/90 text-sm text-left">
                Seu perfil comportamental destaca você
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-3">
            <Button
              onClick={handleVerCurriculo}
              className="w-full h-14 bg-white text-black font-bold text-base rounded-xl hover:bg-white/90"
            >
              Ver Meu Currículo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={handleVoltar}
              variant="ghost"
              className="w-full h-12 text-white/70 hover:text-white hover:bg-white/10 font-medium"
            >
              Voltar à Tela Inicial
            </Button>
          </div>
        </div>
      </div>

      {/* Dica */}
      <p className="text-zinc-500 text-xs text-center mt-6 max-w-xs">
        Mantenha seu perfil atualizado para aumentar suas chances de receber propostas
      </p>
    </div>
  );
}

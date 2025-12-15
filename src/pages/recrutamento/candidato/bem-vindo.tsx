// =====================================================
// BEM-VINDO CANDIDATO - Área de Recrutamento VEON
// Design moderno e compacto para público jovem (20-35)
// =====================================================

import { Button } from "@/components/ui/button";
import {
  Crosshair,
  Brain,
  FileCheck,
  Building2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CandidatoBemVindo = () => {
  const navigate = useNavigate();

  const beneficios = [
    {
      icon: Crosshair,
      title: 'Vagas certas pra você',
      description: 'Algoritmo encontra oportunidades com seu perfil',
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      icon: Brain,
      title: 'Descubra seus talentos',
      description: 'Teste científico revela suas habilidades',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      icon: FileCheck,
      title: 'Currículo automático',
      description: 'Gerado profissionalmente para você',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Building2,
      title: 'Escolha onde trabalhar',
      description: 'Conheça propostas antes da entrevista',
      gradient: 'from-blue-500 to-cyan-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Background sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#E31E24]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#00D9FF]/8 rounded-full blur-3xl" />
      </div>

      {/* Botão voltar */}
      <Button
        variant="ghost"
        className="absolute left-4 top-4 text-slate-400 hover:text-white z-20"
        onClick={() => navigate('/recrutamento')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 py-8">
        <div className="max-w-md mx-auto w-full">
          {/* Logo compacto */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-xl flex items-center justify-center shadow-lg shadow-[#E31E24]/20">
              <span className="text-2xl font-black text-white">V</span>
            </div>
          </div>

          {/* Header compacto */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Empresas querem{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E31E24] to-[#00D9FF]">
                te contratar
              </span>
            </h1>
            <p className="text-slate-400 text-sm">
              Crie seu perfil e receba propostas de emprego
            </p>
          </div>

          {/* Grid 2x2 compacto de benefícios */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {beneficios.map((b, i) => (
              <div
                key={i}
                className="group relative bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-all"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${b.gradient} flex items-center justify-center mb-2.5 shadow-lg`}>
                  <b.icon className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-0.5 leading-tight">
                  {b.title}
                </h3>
                <p className="text-xs text-slate-500 leading-snug">
                  {b.description}
                </p>
              </div>
            ))}
          </div>

          {/* Como funciona - versão ultra compacta */}
          <div className="flex items-center justify-center gap-2 mb-6 text-xs text-slate-500">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Cadastro em 30s</span>
            <span className="text-slate-700">•</span>
            <span>Perfil profissional</span>
            <span className="text-slate-700">•</span>
            <span>Propostas diretas</span>
          </div>

          {/* CTA Principal - Login */}
          <Button
            onClick={() => navigate('/recrutamento/candidato/login')}
            size="lg"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-base py-6 rounded-xl shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02]"
          >
            ENTRAR NA MINHA CONTA
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Cadastro destacado */}
          <div className="mt-4 p-4 bg-gradient-to-r from-[#E31E24]/10 to-[#003DA5]/10 rounded-xl border border-[#E31E24]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">
                  Ainda não tem conta?
                </p>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Cadastro rápido</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/recrutamento/candidato/cadastro-rapido')}
                className="flex items-center gap-1.5 bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 text-[#00D9FF] px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
              >
                Criar conta
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rodapé discreto */}
          <p className="text-center text-xs text-slate-600 mt-4">
            Dados protegidos pela LGPD
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidatoBemVindo;

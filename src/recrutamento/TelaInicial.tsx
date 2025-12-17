// =====================================================
// TELA INICIAL - Recruta Veon
// Direcionamento para Empresas ou Candidatos
// =====================================================

import { useNavigate } from 'react-router-dom';
import { Building2, User, ArrowRight, Sparkles } from 'lucide-react';
import veonLogo from '@/assets/veon-logo.png';

export default function TelaInicial() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#1E3A8A]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#6B3B8C]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-8">
        <div className="max-w-md mx-auto w-full text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-[#E31E24]/20 p-3">
              <img
                src={veonLogo}
                alt="Instituto Veon"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Titulo Principal */}
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            RECRUTA{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E31E24] to-[#1E3A8A]">
              VEON
            </span>
          </h1>

          {/* Slogan */}
          <p className="text-lg md:text-xl text-slate-400 mb-10">
            Recrutamento inteligente{' '}
            <br className="md:hidden" />
            para pessoas inteligentes
          </p>

          {/* Botoes de navegacao */}
          <div className="space-y-4 mb-8">
            {/* Botao Empresa */}
            <button
              onClick={() => navigate('/recrutamento/empresa/login')}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-[#E31E24] to-[#1E3A8A] p-[2px] rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#E31E24]/30"
            >
              <div className="bg-slate-900 rounded-2xl px-6 py-5 flex items-center justify-between group-hover:bg-slate-900/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#E31E24] to-[#1E3A8A] rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-lg">Sou Empresa</p>
                    <p className="text-slate-400 text-sm">Encontre profissionais</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            {/* Botao Candidato */}
            <button
              onClick={() => navigate('/recrutamento/candidato/login')}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-[#1E3A8A] to-[#6B3B8C] p-[2px] rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#6B3B8C]/30"
            >
              <div className="bg-slate-900 rounded-2xl px-6 py-5 flex items-center justify-between group-hover:bg-slate-900/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#6B3B8C] rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-lg">Sou Candidato</p>
                    <p className="text-slate-400 text-sm">Encontre seu emprego</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>

          {/* Destaque DISC */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-white font-semibold">Powered by DISC</span>
            </div>
            <p className="text-slate-400 text-sm">
              Metodologia cientifica que conecta{' '}
              <br className="hidden md:block" />
              o perfil certo a vaga certa
            </p>
          </div>

          {/* Indicadores */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#E31E24] to-[#1E3A8A]">
                73%
              </p>
              <p className="text-xs text-slate-500">menos turnover</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1E3A8A] to-[#6B3B8C]">
                5x
              </p>
              <p className="text-xs text-slate-500">mais assertivo</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6B3B8C] to-[#E31E24]">
                60%
              </p>
              <p className="text-xs text-slate-500">mais rapido</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-4 border-t border-slate-800">
        <p className="text-xs text-slate-600">
          Instituto Veon &copy; {new Date().getFullYear()} - Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}

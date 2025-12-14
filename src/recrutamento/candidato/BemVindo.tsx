// =====================================================
// BEM-VINDO CANDIDATO - Área de Recrutamento VEON
// Tela inicial de captação com benefícios
// =====================================================

import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Target,
  BarChart3,
  FileText,
  Bell,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function BemVindo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref'); // Código de referência/campanha

  const handleComecar = () => {
    // Agora vai para o cadastro rápido (só 3 campos)
    const url = ref
      ? `/recrutamento/candidato/cadastro-rapido?ref=${ref}`
      : '/recrutamento/candidato/cadastro-rapido';
    navigate(url);
  };

  const beneficios = [
    {
      icon: Target,
      title: 'Match Inteligente',
      description: 'Conectamos você com vagas ideais para seu perfil',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: BarChart3,
      title: 'Descubra seus Talentos',
      description: 'Teste DISC revela suas habilidades naturais',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: FileText,
      title: 'Currículo Profissional',
      description: 'Gerado automaticamente com seu perfil completo',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Bell,
      title: 'Propostas Diretas',
      description: 'Receba convites de empresas interessadas',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const passos = [
    'Cadastre-se em 30 segundos',
    'Complete seu perfil com calma',
    'Faça o teste de perfil DISC',
    'Adicione foto e vídeo',
    'Receba propostas de empresas',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#E31E24]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#003DA5]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00D9FF]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-black text-white">V</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Descubra seus talentos naturais e encontre a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E31E24] to-[#00D9FF]">
              vaga perfeita
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Cadastre-se gratuitamente e seja encontrado por centenas de empresas que buscam profissionais como você
          </p>
        </div>

        {/* Cards de benefícios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {beneficios.map((beneficio, index) => (
            <Card
              key={index}
              className="bg-slate-800/60 border-slate-700 backdrop-blur-sm hover:bg-slate-800/80 transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-5 text-center">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${beneficio.color} flex items-center justify-center shadow-lg`}>
                  <beneficio.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {beneficio.title}
                </h3>
                <p className="text-sm text-slate-400">
                  {beneficio.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Destaque estatística */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-lg md:text-xl font-semibold text-white mb-2">
                  Candidatos que finalizam o cadastro completo:
                </p>
                <ul className="space-y-2 text-green-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Têm <strong className="text-white">96% mais chances</strong> de serem contratados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Recebem propostas com <strong className="text-white">salários 23% maiores</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Descobrem seus <strong className="text-white">talentos naturais</strong> com teste científico</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Como funciona */}
        <div className="max-w-2xl mx-auto mb-10">
          <h2 className="text-xl font-semibold text-white text-center mb-6">
            Como funciona?
          </h2>
          <div className="space-y-3">
            {passos.map((passo, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-slate-800/40 rounded-lg p-4 border border-slate-700/50"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E31E24] to-[#003DA5] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-slate-300">{passo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={handleComecar}
            size="lg"
            className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B] text-white font-bold text-lg px-10 py-7 rounded-xl shadow-2xl shadow-red-500/20 transition-all duration-300 hover:scale-105"
          >
            COMEÇAR MEU CADASTRO
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>

          <div className="flex items-center justify-center gap-2 mt-4 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Cadastro rápido em 30 segundos</span>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Seus dados estão protegidos pela LGPD
          </p>
        </div>
      </div>
    </div>
  );
}

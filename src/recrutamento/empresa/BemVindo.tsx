// =====================================================
// BEM-VINDO EMPRESA - Área de Recrutamento VEON
// Tela inicial de captação para empresas
// =====================================================

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Brain,
  Target,
  Users,
  TrendingDown,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  BarChart3,
} from 'lucide-react';

export default function BemVindo() {
  const navigate = useNavigate();

  const handleComecar = () => {
    navigate('/recrutamento/empresa/cadastro');
  };

  const handleLogin = () => {
    navigate('/recrutamento/empresa/login');
  };

  const beneficios = [
    {
      icon: Brain,
      title: 'Perfil DISC antes de contratar',
      description: 'Saiba o perfil comportamental do candidato antes da entrevista',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: TrendingDown,
      title: 'Reduza Turnover',
      description: 'Contratações assertivas diminuem rotatividade e custos',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: Target,
      title: 'Match Inteligente',
      description: 'Encontre o perfil ideal para cada vaga automaticamente',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Clock,
      title: 'Economize Tempo',
      description: 'Filtre candidatos por comportamento antes da entrevista',
      color: 'from-green-500 to-green-600',
    },
  ];

  const estatisticas = [
    { valor: '73%', descricao: 'de redução no turnover' },
    { valor: '5x', descricao: 'mais candidatos qualificados' },
    { valor: '60%', descricao: 'menos tempo no processo' },
  ];

  const perfisDisc = [
    { letra: 'D', cor: 'bg-red-500', nome: 'Dominância', perfil: 'Executor', descricao: 'Foco em resultados' },
    { letra: 'I', cor: 'bg-yellow-500', nome: 'Influência', perfil: 'Comunicador', descricao: 'Foco em pessoas' },
    { letra: 'S', cor: 'bg-green-500', nome: 'Estabilidade', perfil: 'Colaborador', descricao: 'Foco em equipe' },
    { letra: 'C', cor: 'bg-blue-500', nome: 'Conformidade', perfil: 'Analítico', descricao: 'Foco em qualidade' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E31E24]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            O Profissional que você busca{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              está aqui
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            Chega de perder tempo com profissionais sem compromisso.
            <br className="hidden md:block" />
            <strong className="text-white">Conheça os melhores profissionais antes da entrevista</strong>
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

        {/* Seção DISC */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border border-slate-600 rounded-2xl p-6 backdrop-blur-sm">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Brain className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">O Poder do DISC</h2>
              </div>
              <p className="text-slate-400">
                Metodologia científica que revela o perfil comportamental de cada profissional
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {perfisDisc.map((perfil) => (
                <div
                  key={perfil.letra}
                  className="text-center p-4 rounded-xl bg-slate-700/50 border border-slate-600"
                >
                  <div className={`w-12 h-12 ${perfil.cor} rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold text-xl`}>
                    {perfil.letra}
                  </div>
                  <p className="text-white font-medium">{perfil.nome}</p>
                  <p className="text-slate-400 text-sm">{perfil.perfil}</p>
                  <p className="text-slate-500 text-xs mt-1">{perfil.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="grid grid-cols-3 gap-4">
            {estatisticas.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  {stat.valor}
                </p>
                <p className="text-sm text-slate-400 mt-1">{stat.descricao}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Destaque - Frase de Impacto */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-lg md:text-xl font-semibold text-white mb-3">
                  Recrutamento inteligente para empresas inteligentes
                </p>
                <ul className="space-y-2 text-blue-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Acesso a profissionais com perfil comportamental revelado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Vídeos de apresentação para conhecer antes de contratar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Filtros avançados por região, experiência e perfil DISC</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={handleComecar}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg px-10 py-7 rounded-xl shadow-2xl shadow-blue-500/20 transition-all duration-300 hover:scale-105"
          >
            ENCONTRE UM PROFISSIONAL
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>

          <div className="flex items-center justify-center gap-2 mt-4 text-slate-400">
            <Users className="w-4 h-4" />
            <span className="text-sm">Milhares de profissionais qualificados</span>
          </div>

          <p className="text-sm text-slate-500 mt-6">
            Já tem uma conta?{' '}
            <button
              onClick={handleLogin}
              className="text-blue-400 hover:underline"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

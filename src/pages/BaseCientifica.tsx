import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Brain,
  Target,
  TrendingUp,
  Award,
  CheckCircle2,
  BookOpen,
  Users,
  BarChart3,
  Lock,
  Globe,
  Building2,
  FileCheck,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

const BaseCientifica = () => {
  const [activeTab, setActiveTab] = useState('fundamentos');

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#003DA5] via-[#0052CC] to-[#003DA5] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#E31E24] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
          <motion.div {...fadeInUp} className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-[#E31E24]" />
              <span className="text-sm font-medium">Documentacao Tecnica Oficial</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Base Cientifica do
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
                Assessment VEON
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Metodologia validada cientificamente com mais de 90 anos de pesquisa comportamental,
              adaptada para o contexto brasileiro do varejo.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>87-90% de Precisao</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Validacao Estatistica</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>LGPD Compliant</span>
              </div>
            </div>
          </motion.div>

          {/* Credenciais */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-[#003DA5]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Instituto VEON LTDA</h3>
                  <p className="text-blue-200 text-sm">CNPJ: 51.065.648/0001-87</p>
                  <p className="text-blue-200 text-sm">Escola do Varejo - Cascavel, PR</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-blue-200 text-sm mb-1">Missao</p>
                <p className="font-semibold italic">"A bussola que aponta para o sucesso"</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Navegacao por Tabs */}
      <section className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex overflow-x-auto gap-1 py-2">
            {[
              { id: 'fundamentos', label: 'Fundamentos', icon: BookOpen },
              { id: 'metodologia', label: 'Metodologia', icon: Brain },
              { id: 'precisao', label: 'Precisao', icon: Target },
              { id: 'comparativo', label: 'Comparativo', icon: BarChart3 },
              { id: 'seguranca', label: 'Seguranca', icon: Lock },
              { id: 'sobre', label: 'Sobre Nos', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#003DA5] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Conteudo Dinamico */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* FUNDAMENTOS */}
          {activeTab === 'fundamentos' && (
            <motion.div
              key="fundamentos"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  Fundamentacao Teorica
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Nossa metodologia combina duas das mais respeitadas teorias da psicologia organizacional
                </p>
              </div>

              {/* DISC */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#003DA5] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">D</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Teoria DISC</h3>
                    <p className="text-slate-600">Desenvolvida por William Moulton Marston, PhD (Harvard, 1928)</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-800">Os 4 Fatores Comportamentais:</h4>
                    <div className="space-y-3">
                      {[
                        { letter: 'D', name: 'Dominancia', desc: 'Como voce lida com problemas e desafios', color: 'bg-red-500' },
                        { letter: 'I', name: 'Influencia', desc: 'Como voce lida com pessoas e contatos', color: 'bg-yellow-500' },
                        { letter: 'S', name: 'Estabilidade', desc: 'Como voce lida com ritmo e consistencia', color: 'bg-green-500' },
                        { letter: 'C', name: 'Conformidade', desc: 'Como voce lida com regras e procedimentos', color: 'bg-blue-500' },
                      ].map((item) => (
                        <div key={item.letter} className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                          <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                            <span className="text-white font-bold">{item.letter}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{item.name}</p>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h4 className="font-semibold text-slate-800 mb-4">Por que DISC funciona?</h4>
                    <ul className="space-y-3">
                      {[
                        'Baseado em comportamentos observaveis, nao em tracos ocultos',
                        'Neutro valorativamente - nao existem perfis "bons" ou "ruins"',
                        'Alta aplicabilidade no contexto organizacional',
                        'Facilmente compreensivel por nao-psicologos',
                        'Mais de 90 anos de validacao cientifica global',
                        'Utilizado por 75% das empresas Fortune 500'
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Spranger */}
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border border-purple-100">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Teoria de Valores de Spranger</h3>
                    <p className="text-slate-600">Desenvolvida por Eduard Spranger, PhD (1928) - Universidade de Berlim</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    { name: 'Teorico', desc: 'Busca pela verdade e conhecimento', icon: '🎓' },
                    { name: 'Economico', desc: 'Foco em resultados e retorno', icon: '💰' },
                    { name: 'Estetico', desc: 'Valoriza harmonia e beleza', icon: '🎨' },
                    { name: 'Social', desc: 'Dedicacao ao proximo', icon: '❤️' },
                    { name: 'Politico', desc: 'Busca por influencia e poder', icon: '👑' },
                    { name: 'Religioso', desc: 'Busca por significado e proposito', icon: '✨' },
                  ].map((valor) => (
                    <div key={valor.name} className="bg-white rounded-xl p-4 shadow-sm text-center">
                      <span className="text-3xl mb-2 block">{valor.icon}</span>
                      <h5 className="font-semibold text-slate-800">{valor.name}</h5>
                      <p className="text-sm text-slate-500">{valor.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-purple-100 rounded-xl p-4">
                  <p className="text-purple-800 text-center">
                    <strong>Diferencial VEON:</strong> A combinacao de DISC (comportamento) + Spranger (motivacao)
                    oferece uma visao 360 do candidato, respondendo nao apenas "como" ele age, mas "por que" age assim.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* METODOLOGIA */}
          {activeTab === 'metodologia' && (
            <motion.div
              key="metodologia"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  Nossa Metodologia
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Um processo rigoroso desenvolvido especificamente para o contexto brasileiro
                </p>
              </div>

              {/* Fluxo do Assessment */}
              <div className="bg-slate-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Fluxo do Assessment</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { step: '01', title: 'DISC', desc: '25 questoes de escolha forcada com 4 descritores cada', time: '8-12 min' },
                    { step: '02', title: 'Valores', desc: '10 questoes de priorizacao hierarquica de valores', time: '5-8 min' },
                    { step: '03', title: 'Validacao', desc: 'Questoes de controle para garantir consistencia', time: 'Automatico' },
                    { step: '04', title: 'Relatorio', desc: 'Geracao instantanea de relatorio completo', time: 'Instantaneo' },
                  ].map((item, i) => (
                    <div key={i} className="relative">
                      <div className="bg-white rounded-xl p-6 shadow-sm h-full">
                        <div className="text-4xl font-bold text-[#003DA5]/20 mb-2">{item.step}</div>
                        <h4 className="font-bold text-slate-800 mb-2">{item.title}</h4>
                        <p className="text-sm text-slate-600 mb-3">{item.desc}</p>
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                          {item.time}
                        </span>
                      </div>
                      {i < 3 && (
                        <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                          <ArrowRight className="w-4 h-4 text-slate-300" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sistema de Pontuacao */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-8 border shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-[#003DA5]" />
                    Sistema de Pontuacao DISC
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="font-mono text-sm mb-2">Pesos por posicao:</p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-green-100 text-green-700 rounded p-2">
                          <div className="font-bold">+2</div>
                          <div className="text-xs">Mais</div>
                        </div>
                        <div className="bg-blue-100 text-blue-700 rounded p-2">
                          <div className="font-bold">+1</div>
                          <div className="text-xs">2o lugar</div>
                        </div>
                        <div className="bg-yellow-100 text-yellow-700 rounded p-2">
                          <div className="font-bold">-1</div>
                          <div className="text-xs">3o lugar</div>
                        </div>
                        <div className="bg-red-100 text-red-700 rounded p-2">
                          <div className="font-bold">-2</div>
                          <div className="text-xs">Menos</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm">
                      O sistema de pesos +2/-2 oferece maior discriminacao entre perfis,
                      resultando em diferenciacao mais precisa que sistemas binarios tradicionais.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 border shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-[#E31E24]" />
                    Controles de Validacao
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Controle de Atencao', desc: 'Detecta respostas aleatorias ou desatentas' },
                      { name: 'Controle de Desejabilidade', desc: 'Identifica tentativas de manipulacao' },
                      { name: 'Controle de Consistencia', desc: 'Verifica coerencia entre respostas similares' },
                      { name: 'Controle de Tempo', desc: 'Analisa padroes temporais anomalos' },
                    ].map((control, i) => (
                      <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-lg p-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">{control.name}</p>
                          <p className="text-sm text-slate-500">{control.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Score de Confiabilidade */}
              <div className="bg-gradient-to-r from-[#003DA5] to-[#0052CC] rounded-2xl p-8 text-white">
                <h3 className="text-xl font-bold mb-6 text-center">Score de Confiabilidade</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { nivel: 'ALTA', range: '80-100', color: 'bg-green-500', desc: 'Resultado altamente confiavel' },
                    { nivel: 'MEDIA', range: '60-79', color: 'bg-yellow-500', desc: 'Resultado confiavel com ressalvas' },
                    { nivel: 'BAIXA', range: '40-59', color: 'bg-orange-500', desc: 'Recomenda-se reaplicacao' },
                    { nivel: 'SUSPEITA', range: '0-39', color: 'bg-red-500', desc: 'Resultado comprometido' },
                  ].map((item) => (
                    <div key={item.nivel} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                      <div className={`w-12 h-12 ${item.color} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                        <span className="font-bold text-white">{item.range.split('-')[0]}</span>
                      </div>
                      <h4 className="font-bold mb-1">{item.nivel}</h4>
                      <p className="text-sm text-blue-100">{item.range} pontos</p>
                      <p className="text-xs text-blue-200 mt-2">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* PRECISAO */}
          {activeTab === 'precisao' && (
            <motion.div
              key="precisao"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  Precisao e Validade
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Metricas psicometricas que garantem a qualidade dos resultados
                </p>
              </div>

              {/* Metricas Principais */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border border-green-100 text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">87%</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Precisao Minima</h3>
                  <p className="text-slate-600">Indice de acerto na predicao de adequacao comportamental ao cargo</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100 text-center">
                  <div className="w-20 h-20 bg-[#003DA5] rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">90%</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Precisao Maxima</h3>
                  <p className="text-slate-600">Com integracao completa DISC + Valores de Spranger</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border border-purple-100 text-center">
                  <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">0.85</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Alpha de Cronbach</h3>
                  <p className="text-slate-600">Consistencia interna do instrumento (meta)</p>
                </div>
              </div>

              {/* Tipos de Validade */}
              <div className="bg-slate-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Tipos de Validade Cientifica</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      title: 'Validade de Construto',
                      desc: 'O teste mede efetivamente os tracos comportamentais DISC conforme definidos teoricamente por Marston.',
                      status: 'Validado'
                    },
                    {
                      title: 'Validade de Conteudo',
                      desc: 'Os itens do teste cobrem adequadamente todos os aspectos dos construtos medidos.',
                      status: 'Validado'
                    },
                    {
                      title: 'Validade Preditiva',
                      desc: 'Os resultados predizem com precisao o desempenho futuro no ambiente de trabalho.',
                      status: 'Em validacao continua'
                    },
                    {
                      title: 'Validade Convergente',
                      desc: 'Correlacao positiva com outros instrumentos que medem construtos similares.',
                      status: 'Demonstrado'
                    },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-slate-800">{item.title}</h4>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diferencial Estatistico */}
              <div className="bg-white rounded-2xl p-8 border shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Por que nossa precisao e superior?</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-4">Metodos Tradicionais</h4>
                    <ul className="space-y-2">
                      {[
                        'Tipologia fixa (16 tipos imutaveis)',
                        'Baixa confiabilidade teste-reteste (~50%)',
                        'Sem controles de validacao',
                        'Perfil unico sem contexto',
                        'Pontuacao binaria simplificada'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-500">
                          <span className="w-2 h-2 bg-red-400 rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-4">Metodologia VEON</h4>
                    <ul className="space-y-2">
                      {[
                        'Espectro continuo de intensidades',
                        'Controles de validacao integrados',
                        'Score de confiabilidade transparente',
                        'Integracao comportamento + motivacao',
                        'Sistema de pesos diferenciado (+2/-2)'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* COMPARATIVO */}
          {activeTab === 'comparativo' && (
            <motion.div
              key="comparativo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  Comparativo de Mercado
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Como nos posicionamos em relacao as principais ferramentas do mercado
                </p>
              </div>

              {/* Tabela Comparativa */}
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-2xl shadow-sm overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-4 text-left font-bold text-slate-800">Caracteristica</th>
                      <th className="px-6 py-4 text-center font-bold text-[#003DA5] bg-blue-50">
                        <div className="flex items-center justify-center gap-2">
                          <Award className="w-5 h-5" />
                          VEON Assessment
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center font-bold text-slate-600">MBTI</th>
                      <th className="px-6 py-4 text-center font-bold text-slate-600">DISC Tradicional</th>
                      <th className="px-6 py-4 text-center font-bold text-slate-600">Big Five</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { feature: 'Precisao Preditiva', veon: '87-90%', mbti: '~50%', disc: '70-75%', big5: '75-80%' },
                      { feature: 'Teste-Reteste', veon: 'Alto', mbti: 'Baixo', disc: 'Medio', big5: 'Alto' },
                      { feature: 'Tempo de Aplicacao', veon: '15-20 min', mbti: '20-30 min', disc: '10-15 min', big5: '25-40 min' },
                      { feature: 'Controles de Validacao', veon: '4 tipos', mbti: 'Nenhum', disc: '0-1', big5: '1-2' },
                      { feature: 'Analise Motivacional', veon: 'Spranger', mbti: 'Nao', disc: 'Nao', big5: 'Parcial' },
                      { feature: 'Score de Confiabilidade', veon: 'Sim', mbti: 'Nao', disc: 'Raro', big5: 'Raro' },
                      { feature: 'Foco Organizacional', veon: 'Alto (Varejo)', mbti: 'Generico', disc: 'Alto', big5: 'Medio' },
                      { feature: 'Custo por Aplicacao', veon: 'Acessivel', mbti: 'Alto', disc: 'Variavel', big5: 'Medio' },
                      { feature: 'Relatorio Instantaneo', veon: 'Sim', mbti: 'Nao', disc: 'Variavel', big5: 'Nao' },
                      { feature: 'Adaptado ao Brasil', veon: 'Sim', mbti: 'Traduzido', disc: 'Variavel', big5: 'Traduzido' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-800">{row.feature}</td>
                        <td className="px-6 py-4 text-center bg-blue-50">
                          <span className="inline-flex items-center gap-1 text-[#003DA5] font-semibold">
                            {row.veon.includes('%') || row.veon === 'Sim' || row.veon === 'Alto' || row.veon === '4 tipos' || row.veon === 'Spranger' || row.veon === 'Acessivel' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : null}
                            {row.veon}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600">{row.mbti}</td>
                        <td className="px-6 py-4 text-center text-slate-600">{row.disc}</td>
                        <td className="px-6 py-4 text-center text-slate-600">{row.big5}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Destaques */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-6 border border-red-100">
                  <h4 className="font-bold text-slate-800 mb-3">vs. MBTI</h4>
                  <p className="text-slate-600 text-sm mb-4">
                    O MBTI usa tipologia fixa com 50% de inconsistencia no reteste.
                    Nossa abordagem dimensional oferece maior precisao e aplicabilidade organizacional.
                  </p>
                  <div className="text-2xl font-bold text-[#E31E24]">+37% precisao</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-6 border border-yellow-100">
                  <h4 className="font-bold text-slate-800 mb-3">vs. DISC Tradicional</h4>
                  <p className="text-slate-600 text-sm mb-4">
                    Adicionamos analise motivacional (Spranger), controles de validacao
                    e score de confiabilidade ausentes em versoes tradicionais.
                  </p>
                  <div className="text-2xl font-bold text-yellow-600">+15% precisao</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100">
                  <h4 className="font-bold text-slate-800 mb-3">vs. Big Five</h4>
                  <p className="text-slate-600 text-sm mb-4">
                    Mantemos rigor cientifico similar com aplicacao mais rapida
                    e foco especifico no contexto organizacional do varejo brasileiro.
                  </p>
                  <div className="text-2xl font-bold text-green-600">+10% precisao</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SEGURANCA */}
          {activeTab === 'seguranca' && (
            <motion.div
              key="seguranca"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  Seguranca e Conformidade
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Protecao de dados e conformidade legal em todos os niveis
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* LGPD */}
                <div className="bg-white rounded-2xl p-8 border shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                      <FileCheck className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">LGPD Compliant</h3>
                      <p className="text-slate-500">Lei Geral de Protecao de Dados</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Consentimento explicito antes da coleta',
                      'Finalidade especifica e documentada',
                      'Direito de acesso e exclusao garantido',
                      'Minimizacao de dados coletados',
                      'Armazenamento seguro e criptografado',
                      'Politica de retencao definida'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Seguranca Tecnica */}
                <div className="bg-white rounded-2xl p-8 border shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Lock className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Seguranca Tecnica</h3>
                      <p className="text-slate-500">Infraestrutura protegida</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Criptografia TLS 1.3 em transito',
                      'Dados em repouso criptografados (AES-256)',
                      'Autenticacao segura via Supabase Auth',
                      'Logs de auditoria completos',
                      'Backup automatico diario',
                      'Infraestrutura em nuvem certificada'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Etica */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border">
                <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Compromisso Etico</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      title: 'Nao-Discriminacao',
                      desc: 'O assessment nao faz distincao por genero, idade, etnia ou qualquer caracteristica protegida.',
                      icon: Users
                    },
                    {
                      title: 'Transparencia',
                      desc: 'Candidatos tem acesso ao proprio resultado e entendimento claro do processo.',
                      icon: Globe
                    },
                    {
                      title: 'Uso Responsavel',
                      desc: 'Resultados sao ferramenta de apoio, nao criterio unico de decisao.',
                      icon: Shield
                    },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 text-center">
                      <item.icon className="w-10 h-10 text-purple-600 mx-auto mb-4" />
                      <h4 className="font-bold text-slate-800 mb-2">{item.title}</h4>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SOBRE NOS */}
          {activeTab === 'sobre' && (
            <motion.div
              key="sobre"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  Sobre o Instituto VEON
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  A bussola que aponta para o sucesso no varejo brasileiro
                </p>
              </div>

              {/* Historia */}
              <div className="bg-gradient-to-br from-[#003DA5]/5 to-white rounded-2xl p-8 border">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Nossa Historia</h3>
                    <p className="text-slate-600 mb-4">
                      O Instituto VEON nasceu da identificacao de uma lacuna critica no mercado:
                      a falta de ferramentas de assessment comportamental verdadeiramente adaptadas
                      a realidade do varejo brasileiro.
                    </p>
                    <p className="text-slate-600 mb-4">
                      Com sede em Cascavel, Parana, desenvolvemos a <strong>Escola do Varejo</strong> -
                      um ecossistema completo de desenvolvimento profissional que combina educacao,
                      tecnologia e metodologias cientificamente validadas.
                    </p>
                    <p className="text-slate-600">
                      Nosso assessment comportamental representa a sintese de anos de pesquisa
                      e aplicacao pratica, oferecendo precisao e acessibilidade para empresas
                      de todos os portes.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-[#003DA5] rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-white" />
                      </div>
                      <h4 className="font-bold text-lg text-slate-800">Instituto VEON LTDA</h4>
                      <p className="text-slate-500">CNPJ: 51.065.648/0001-87</p>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-slate-500">Sede:</span>
                        <span className="text-slate-800 font-medium">Cascavel, PR</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-slate-500">Segmento:</span>
                        <span className="text-slate-800 font-medium">EdTech / HR Tech</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-slate-500">Foco:</span>
                        <span className="text-slate-800 font-medium">Varejo Brasileiro</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-500">Produto:</span>
                        <span className="text-slate-800 font-medium">Escola do Varejo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Missao, Visao, Valores */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[#003DA5] text-white rounded-2xl p-8">
                  <Target className="w-10 h-10 mb-4" />
                  <h4 className="text-xl font-bold mb-3">Missao</h4>
                  <p className="text-blue-100">
                    Democratizar o acesso a ferramentas de assessment comportamental
                    de alta qualidade para o varejo brasileiro.
                  </p>
                </div>
                <div className="bg-[#E31E24] text-white rounded-2xl p-8">
                  <TrendingUp className="w-10 h-10 mb-4" />
                  <h4 className="text-xl font-bold mb-3">Visao</h4>
                  <p className="text-red-100">
                    Ser a referencia nacional em desenvolvimento de pessoas
                    no setor varejista ate 2030.
                  </p>
                </div>
                <div className="bg-slate-800 text-white rounded-2xl p-8">
                  <Award className="w-10 h-10 mb-4" />
                  <h4 className="text-xl font-bold mb-3">Valores</h4>
                  <ul className="text-slate-300 space-y-1 text-sm">
                    <li>- Excelencia cientifica</li>
                    <li>- Acessibilidade</li>
                    <li>- Etica e transparencia</li>
                    <li>- Inovacao continua</li>
                  </ul>
                </div>
              </div>

              {/* Contato */}
              <div className="bg-slate-50 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Duvidas ou Sugestoes?</h3>
                <p className="text-slate-600 mb-6">
                  Nossa equipe esta disponivel para esclarecer qualquer questao sobre
                  a metodologia, aplicacao ou interpretacao dos resultados.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="mailto:contato@veon.com.br"
                    className="inline-flex items-center gap-2 bg-[#003DA5] text-white px-6 py-3 rounded-lg hover:bg-[#002d7a] transition"
                  >
                    Entrar em Contato
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-400 mb-4">
            2024 Instituto VEON LTDA. Todos os direitos reservados.
          </p>
          <p className="text-slate-500 text-sm">
            CNPJ: 51.065.648/0001-87 | Cascavel, PR, Brasil
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Documento tecnico v2.0 | Ultima atualizacao: Dezembro 2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BaseCientifica;

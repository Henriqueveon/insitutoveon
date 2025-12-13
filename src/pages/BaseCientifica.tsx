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
              <span className="text-sm font-medium">Documentação Técnica Oficial</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Base Científica do
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
                Assessment Veon
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Metodologia validada cientificamente com mais de 90 anos de pesquisa comportamental,
              adaptada para o contexto brasileiro do varejo.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>87-90% de Precisão</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Validação Estatística</span>
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
                  <h3 className="font-bold text-lg">Instituto Veon LTDA</h3>
                  <p className="text-blue-200 text-sm">CNPJ: 51.065.648/0001-87</p>
                  <p className="text-blue-200 text-sm">Escola do Varejo - Cascavel, PR</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-blue-200 text-sm mb-1">Missão</p>
                <p className="font-semibold italic">"Guiar até a terra da prosperidade empresários presos na ilha da escassez."</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Navegação por Tabs */}
      <section className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex overflow-x-auto gap-1 py-2">
            {[
              { id: 'fundamentos', label: 'Fundamentos', icon: BookOpen },
              { id: 'metodologia', label: 'Metodologia', icon: Brain },
              { id: 'precisao', label: 'Precisão', icon: Target },
              { id: 'comparativo', label: 'Comparativo', icon: BarChart3 },
              { id: 'seguranca', label: 'Segurança', icon: Lock },
              { id: 'sobre', label: 'Sobre Nós', icon: Users },
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

      {/* Conteúdo Dinâmico */}
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
                  Fundamentação Teórica
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
                        { letter: 'D', name: 'Dominância', desc: 'Como você lida com problemas e desafios', color: 'bg-red-500' },
                        { letter: 'I', name: 'Influência', desc: 'Como você lida com pessoas e contatos', color: 'bg-yellow-500' },
                        { letter: 'S', name: 'Estabilidade', desc: 'Como você lida com ritmo e consistência', color: 'bg-green-500' },
                        { letter: 'C', name: 'Conformidade', desc: 'Como você lida com regras e procedimentos', color: 'bg-blue-500' },
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
                        'Baseado em comportamentos observáveis, não em traços ocultos',
                        'Neutro valorativamente - não existem perfis "bons" ou "ruins"',
                        'Alta aplicabilidade no contexto organizacional',
                        'Facilmente compreensível por não-psicólogos',
                        'Mais de 90 anos de validação científica global',
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
                    { name: 'Teórico', desc: 'Busca pela verdade e conhecimento', icon: '🎓' },
                    { name: 'Econômico', desc: 'Foco em resultados e retorno', icon: '💰' },
                    { name: 'Estético', desc: 'Valoriza harmonia e beleza', icon: '🎨' },
                    { name: 'Social', desc: 'Dedicação ao próximo', icon: '❤️' },
                    { name: 'Político', desc: 'Busca por influência e poder', icon: '👑' },
                    { name: 'Religioso', desc: 'Busca por significado e propósito', icon: '✨' },
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
                    <strong>Diferencial Veon:</strong> A combinação de DISC (comportamento) + Spranger (motivação)
                    oferece uma visão 360° do candidato, respondendo não apenas "como" ele age, mas "por quê" age assim.
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
                    { step: '01', title: 'DISC', desc: '25 questões de escolha forçada com 4 descritores cada', time: '8-12 min' },
                    { step: '02', title: 'Valores', desc: '10 questões de priorização hierárquica de valores', time: '5-8 min' },
                    { step: '03', title: 'Validação', desc: 'Questões de controle para garantir consistência', time: 'Automático' },
                    { step: '04', title: 'Relatório', desc: 'Geração instantânea de relatório completo', time: 'Instantâneo' },
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

              {/* Sistema de Pontuação */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-8 border shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-[#003DA5]" />
                    Sistema de Pontuação DISC
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="font-mono text-sm mb-2">Pesos por posição:</p>
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
                      O sistema de pesos +2/-2 oferece maior discriminação entre perfis,
                      resultando em diferenciação mais precisa que sistemas binários tradicionais.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 border shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-[#E31E24]" />
                    Controles de Validação
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Controle de Atenção', desc: 'Detecta respostas aleatórias ou desatentas' },
                      { name: 'Controle de Desejabilidade', desc: 'Identifica tentativas de manipulação' },
                      { name: 'Controle de Consistência', desc: 'Verifica coerência entre respostas similares' },
                      { name: 'Controle de Tempo', desc: 'Analisa padrões temporais anômalos' },
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
                    { nivel: 'ALTA', range: '80-100', color: 'bg-green-500', desc: 'Resultado altamente confiável' },
                    { nivel: 'MÉDIA', range: '60-79', color: 'bg-yellow-500', desc: 'Resultado confiável com ressalvas' },
                    { nivel: 'BAIXA', range: '40-59', color: 'bg-orange-500', desc: 'Recomenda-se reaplicação' },
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
                  Precisão e Validade
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Métricas psicométricas que garantem a qualidade dos resultados
                </p>
              </div>

              {/* Metricas Principais */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border border-green-100 text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">87%</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Precisão Mínima</h3>
                  <p className="text-slate-600">Índice de acerto na predição de adequação comportamental ao cargo</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100 text-center">
                  <div className="w-20 h-20 bg-[#003DA5] rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">90%</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Precisão Máxima</h3>
                  <p className="text-slate-600">Com integração completa DISC + Valores de Spranger</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border border-purple-100 text-center">
                  <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">0.85</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Alpha de Cronbach</h3>
                  <p className="text-slate-600">Consistência interna do instrumento (meta)</p>
                </div>
              </div>

              {/* Tipos de Validade */}
              <div className="bg-slate-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Tipos de Validade Científica</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      title: 'Validade de Construto',
                      desc: 'O teste mede efetivamente os traços comportamentais DISC conforme definidos teoricamente por Marston.',
                      status: 'Validado'
                    },
                    {
                      title: 'Validade de Conteúdo',
                      desc: 'Os itens do teste cobrem adequadamente todos os aspectos dos construtos medidos.',
                      status: 'Validado'
                    },
                    {
                      title: 'Validade Preditiva',
                      desc: 'Os resultados predizem com precisão o desempenho futuro no ambiente de trabalho.',
                      status: 'Em validação contínua'
                    },
                    {
                      title: 'Validade Convergente',
                      desc: 'Correlação positiva com outros instrumentos que medem construtos similares.',
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

              {/* Diferencial Estatístico */}
              <div className="bg-white rounded-2xl p-8 border shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Por que nossa precisão é superior?</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-4">Métodos Tradicionais</h4>
                    <ul className="space-y-2">
                      {[
                        'Tipologia fixa (16 tipos imutáveis)',
                        'Baixa confiabilidade teste-reteste (~50%)',
                        'Sem controles de validação',
                        'Perfil único sem contexto',
                        'Pontuação binária simplificada'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-500">
                          <span className="w-2 h-2 bg-red-400 rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-4">Metodologia Veon</h4>
                    <ul className="space-y-2">
                      {[
                        'Espectro contínuo de intensidades',
                        'Controles de validação integrados',
                        'Score de confiabilidade transparente',
                        'Integração comportamento + motivação',
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
                  Como nos posicionamos em relação às principais ferramentas do mercado
                </p>
              </div>

              {/* Tabela Comparativa */}
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-2xl shadow-sm overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-4 text-left font-bold text-slate-800">Característica</th>
                      <th className="px-6 py-4 text-center font-bold text-[#003DA5] bg-blue-50">
                        <div className="flex items-center justify-center gap-2">
                          <Award className="w-5 h-5" />
                          Veon Assessment
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center font-bold text-slate-600">MBTI</th>
                      <th className="px-6 py-4 text-center font-bold text-slate-600">DISC Tradicional</th>
                      <th className="px-6 py-4 text-center font-bold text-slate-600">Big Five</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { feature: 'Precisão Preditiva', veon: '87-90%', mbti: '~50%', disc: '70-75%', big5: '75-80%' },
                      { feature: 'Teste-Reteste', veon: 'Alto', mbti: 'Baixo', disc: 'Médio', big5: 'Alto' },
                      { feature: 'Tempo de Aplicação', veon: '15-20 min', mbti: '20-30 min', disc: '10-15 min', big5: '25-40 min' },
                      { feature: 'Controles de Validação', veon: '4 tipos', mbti: 'Nenhum', disc: '0-1', big5: '1-2' },
                      { feature: 'Análise Motivacional', veon: 'Spranger', mbti: 'Não', disc: 'Não', big5: 'Parcial' },
                      { feature: 'Score de Confiabilidade', veon: 'Sim', mbti: 'Não', disc: 'Raro', big5: 'Raro' },
                      { feature: 'Foco Organizacional', veon: 'Alto (Varejo)', mbti: 'Genérico', disc: 'Alto', big5: 'Médio' },
                      { feature: 'Custo por Aplicação', veon: 'Acessível', mbti: 'Alto', disc: 'Variável', big5: 'Médio' },
                      { feature: 'Relatório Instantâneo', veon: 'Sim', mbti: 'Não', disc: 'Variável', big5: 'Não' },
                      { feature: 'Adaptado ao Brasil', veon: 'Sim', mbti: 'Traduzido', disc: 'Variável', big5: 'Traduzido' },
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
                    O MBTI usa tipologia fixa com 50% de inconsistência no reteste.
                    Nossa abordagem dimensional oferece maior precisão e aplicabilidade organizacional.
                  </p>
                  <div className="text-2xl font-bold text-[#E31E24]">+37% precisão</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-6 border border-yellow-100">
                  <h4 className="font-bold text-slate-800 mb-3">vs. DISC Tradicional</h4>
                  <p className="text-slate-600 text-sm mb-4">
                    Adicionamos análise motivacional (Spranger), controles de validação
                    e score de confiabilidade ausentes em versões tradicionais.
                  </p>
                  <div className="text-2xl font-bold text-yellow-600">+15% precisão</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100">
                  <h4 className="font-bold text-slate-800 mb-3">vs. Big Five</h4>
                  <p className="text-slate-600 text-sm mb-4">
                    Mantemos rigor científico similar com aplicação mais rápida
                    e foco específico no contexto organizacional do varejo brasileiro.
                  </p>
                  <div className="text-2xl font-bold text-green-600">+10% precisão</div>
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
                  Segurança e Conformidade
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Proteção de dados e conformidade legal em todos os níveis
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
                      <p className="text-slate-500">Lei Geral de Proteção de Dados</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Consentimento explícito antes da coleta',
                      'Finalidade específica e documentada',
                      'Direito de acesso e exclusão garantido',
                      'Minimização de dados coletados',
                      'Armazenamento seguro e criptografado',
                      'Política de retenção definida'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Segurança Técnica */}
                <div className="bg-white rounded-2xl p-8 border shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Lock className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Segurança Técnica</h3>
                      <p className="text-slate-500">Infraestrutura protegida</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Criptografia TLS 1.3 em trânsito',
                      'Dados em repouso criptografados (AES-256)',
                      'Autenticação segura via Supabase Auth',
                      'Logs de auditoria completos',
                      'Backup automático diário',
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

              {/* Ética */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border">
                <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Compromisso Ético</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      title: 'Não-Discriminação',
                      desc: 'O assessment não faz distinção por gênero, idade, etnia ou qualquer característica protegida.',
                      icon: Users
                    },
                    {
                      title: 'Transparência',
                      desc: 'Candidatos têm acesso ao próprio resultado e entendimento claro do processo.',
                      icon: Globe
                    },
                    {
                      title: 'Uso Responsável',
                      desc: 'Resultados são ferramenta de apoio, não critério único de decisão.',
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
                  Sobre o Instituto Veon
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  A bússola que aponta para o sucesso no varejo brasileiro
                </p>
              </div>

              {/* História */}
              <div className="bg-gradient-to-br from-[#003DA5]/5 to-white rounded-2xl p-8 border">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Nossa História</h3>
                    <p className="text-slate-600 mb-4">
                      O Instituto Veon nasceu da identificação de uma lacuna crítica no mercado:
                      a falta de ferramentas de assessment comportamental verdadeiramente adaptadas
                      à realidade do varejo brasileiro.
                    </p>
                    <p className="text-slate-600 mb-4">
                      Com sede em Cascavel, Paraná, desenvolvemos a <strong>Escola do Varejo</strong> -
                      um ecossistema completo de desenvolvimento profissional que combina educação,
                      tecnologia e metodologias cientificamente validadas.
                    </p>
                    <p className="text-slate-600">
                      Nosso assessment comportamental representa a síntese de anos de pesquisa
                      e aplicação prática, oferecendo precisão e acessibilidade para empresas
                      de todos os portes.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-[#003DA5] rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-white" />
                      </div>
                      <h4 className="font-bold text-lg text-slate-800">Instituto Veon LTDA</h4>
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

              {/* Missão, Visão, Valores */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[#003DA5] text-white rounded-2xl p-8">
                  <Target className="w-10 h-10 mb-4" />
                  <h4 className="text-xl font-bold mb-3">Missão</h4>
                  <p className="text-blue-100 italic">
                    "Guiar até a terra da prosperidade empresários presos na ilha da escassez."
                  </p>
                </div>
                <div className="bg-[#E31E24] text-white rounded-2xl p-8">
                  <TrendingUp className="w-10 h-10 mb-4" />
                  <h4 className="text-xl font-bold mb-3">Visão</h4>
                  <p className="text-red-100 italic">
                    "Ser a empresa mais falada e desejada do mercado."
                  </p>
                </div>
                <div className="bg-slate-800 text-white rounded-2xl p-8">
                  <Award className="w-10 h-10 mb-4" />
                  <h4 className="text-xl font-bold mb-3">Valores</h4>
                  <ul className="text-slate-300 space-y-1 text-sm">
                    <li>1. Cumprir a Missão</li>
                    <li>2. Relacionamento</li>
                    <li>3. Brilho nos Olhos</li>
                    <li>4. Obsessão pelo Êxito</li>
                    <li>5. Busca Incessante pelo Conhecimento</li>
                    <li>6. Entregar Mais que o Combinado</li>
                    <li>7. Lealdade</li>
                  </ul>
                </div>
              </div>

              {/* Contato */}
              <div className="bg-slate-50 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Dúvidas ou Sugestões?</h3>
                <p className="text-slate-600 mb-6">
                  Nossa equipe está disponível para esclarecer qualquer questão sobre
                  a metodologia, aplicação ou interpretação dos resultados.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="https://wa.me/5545991294761?text=Ol%C3%A1%2C%20sou%20Analista%20de%20perfil%20comportamental%20e%20venho%20atrav%C3%A9s%20do%20Veon%20Assessment."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg hover:bg-[#1da851] transition font-medium"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Falar pelo WhatsApp
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
            2024 Instituto Veon LTDA. Todos os direitos reservados.
          </p>
          <p className="text-slate-500 text-sm">
            CNPJ: 51.065.648/0001-87 | Cascavel, PR, Brasil
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Documento técnico v2.0 | Última atualização: Dezembro 2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BaseCientifica;

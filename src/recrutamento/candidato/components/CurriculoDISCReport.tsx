// =====================================================
// CURRÍCULO DISC REPORT - Relatório DISC para recrutadores
// 100% igual ao relatório público, com linguagem auto-explicativa
// =====================================================

import { useMemo } from 'react';
import { discProfiles, getProfileType, getProfileDescription } from '@/data/discProfiles';
import { Button } from '@/components/ui/button';
import {
  Target,
  AlertTriangle,
  Heart,
  Shield,
  Zap,
  Users,
  MessageCircle,
  Briefcase,
  TrendingUp,
  Brain,
  Eye,
  Star,
  ChevronRight,
  Info,
  Lightbulb,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  XCircle,
  Check,
  Calendar,
  BookOpen,
} from 'lucide-react';

// Cores oficiais DISC
const DISC_COLORS = {
  D: '#E53935',
  I: '#FBC02D',
  S: '#43A047',
  C: '#1E88E5',
};

const DISC_NAMES = {
  D: 'Dominância',
  I: 'Influência',
  S: 'Estabilidade',
  C: 'Conformidade',
};

// Descrições de cada dimensão para recrutadores
const DISC_DESCRIPTIONS = {
  D: 'Como este profissional enfrenta desafios e toma decisões',
  I: 'Como este profissional se comunica e influencia pessoas',
  S: 'Como este profissional lida com mudanças e ritmo de trabalho',
  C: 'Como este profissional segue regras e analisa informações',
};

interface Profile {
  D: number;
  I: number;
  S: number;
  C: number;
}

interface ConfiabilidadeData {
  score: number | null;
  nivel: string | null;
  flags: string[] | null;
}

interface CurriculoDISCReportProps {
  naturalProfile: Profile;
  adaptedProfile?: Profile;
  nomeCompleto: string;
  confiabilidade?: ConfiabilidadeData | null;
  onAgendarEntrevista?: () => void;
}

// Normaliza score de -25/+25 para 0-100
const normalizeScore = (score: number): number => {
  return Math.round(((score + 25) / 50) * 100);
};

// Gera interpretação da amplitude (adaptação)
const getAmplitudeInterpretation = (factor: string, natural: number, adapted: number, nome: string): string => {
  const diff = adapted - natural;
  const firstName = nome.split(' ')[0];

  if (factor === 'D') {
    if (diff < -15) return `No trabalho, ${firstName} está se contendo e sendo mais cauteloso do que normalmente é. Isso pode causar cansaço se mantido por muito tempo.`;
    if (diff > 15) return `${firstName} está forçando a barra para ser mais decisivo e firme no trabalho. Importante respeitar o ritmo natural.`;
  }
  if (factor === 'I') {
    if (diff < -15) return `${firstName} está se segurando para falar menos e ser mais reservado. A energia social natural está sendo contida.`;
    if (diff > 15) return `${firstName} está fazendo esforço extra para ser mais comunicativo e sociável no trabalho.`;
  }
  if (factor === 'S') {
    if (diff < -15) return `${firstName} está correndo mais do que gostaria. O ritmo natural é mais calmo, mas o ambiente está acelerando.`;
    if (diff > 15) return `${firstName} está buscando mais calma e estabilidade do que naturalmente tem. Pode estar evitando mudanças.`;
  }
  if (factor === 'C') {
    if (diff < -15) return `${firstName} está sendo menos detalhista do que gostaria. O ambiente não permite ser tão cuidadoso quanto quer.`;
    if (diff > 15) return `${firstName} está se esforçando para ser mais organizado e preciso do que naturalmente é.`;
  }
  return `Tudo certo! ${firstName} está agindo no trabalho de forma parecida com seu jeito natural.`;
};

// Mapeamento das flags para descrições em português
const FLAG_DESCRIPTIONS: Record<string, string> = {
  'Detectadas respostas socialmente desejáveis': 'Algumas respostas parecem socialmente desejáveis',
  'Item de atenção respondido incorretamente': 'Falha no item de verificação de atenção',
  'Padrão de respostas inconsistente detectado': 'Padrão de respostas inconsistente',
  'Tempo de resposta muito rápido - possível aleatoriedade': 'Tempo de resposta muito rápido',
  'Tempo de resposta acima do esperado': 'Tempo de resposta acima do esperado',
  'Perfil muito homogêneo - pode indicar respostas aleatórias': 'Perfil muito homogêneo',
  'Padrão contraditório nas escolhas': 'Padrão contraditório nas escolhas',
  // Flags em inglês (caso existam)
  'fake_responses': 'Algumas respostas parecem socialmente desejáveis',
  'attention_failed': 'Falha no item de verificação de atenção',
  'inconsistent': 'Padrão de respostas inconsistente',
  'rushed': 'Tempo de resposta muito rápido',
  'slow': 'Tempo de resposta acima do esperado',
  'flat_profile': 'Perfil muito homogêneo',
  'contradictory': 'Padrão contraditório nas escolhas',
};

// Helper para obter estilo da confiabilidade
const getConfiabilidadeStyle = (nivel: string | null) => {
  switch (nivel) {
    case 'ALTA':
      return {
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        textColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500',
        icon: ShieldCheck,
        label: 'Alta Confiabilidade',
        description: 'As respostas apresentam alto grau de consistência e autenticidade.',
      };
    case 'MEDIA':
      return {
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        textColor: 'text-amber-400',
        iconBg: 'bg-amber-500',
        icon: ShieldAlert,
        label: 'Confiabilidade Moderada',
        description: 'Algumas respostas apresentam variações que merecem atenção.',
      };
    case 'BAIXA':
      return {
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        textColor: 'text-orange-400',
        iconBg: 'bg-orange-500',
        icon: ShieldAlert,
        label: 'Confiabilidade Reduzida',
        description: 'Recomenda-se cautela na interpretação dos resultados.',
      };
    case 'SUSPEITA':
      return {
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        textColor: 'text-red-400',
        iconBg: 'bg-red-500',
        icon: ShieldX,
        label: 'Confiabilidade Comprometida',
        description: 'Os resultados podem não refletir o perfil real.',
      };
    default:
      return {
        bgColor: 'bg-zinc-500/10',
        borderColor: 'border-zinc-500/30',
        textColor: 'text-zinc-400',
        iconBg: 'bg-zinc-500',
        icon: Shield,
        label: 'Confiabilidade',
        description: 'Informações de confiabilidade do teste.',
      };
  }
};

export default function CurriculoDISCReport({
  naturalProfile,
  adaptedProfile,
  nomeCompleto,
  confiabilidade,
  onAgendarEntrevista,
}: CurriculoDISCReportProps) {
  const adapted = adaptedProfile || naturalProfile;
  const firstName = nomeCompleto.split(' ')[0];

  // Dados calculados
  const profileData = useMemo(() => {
    const tipo = getProfileType(naturalProfile.D, naturalProfile.I, naturalProfile.S, naturalProfile.C);
    const descricao = getProfileDescription(naturalProfile.D, naturalProfile.I, naturalProfile.S, naturalProfile.C);
    return { tipo, descricao };
  }, [naturalProfile]);

  const normalizedNatural = useMemo(() => ({
    D: normalizeScore(naturalProfile.D),
    I: normalizeScore(naturalProfile.I),
    S: normalizeScore(naturalProfile.S),
    C: normalizeScore(naturalProfile.C),
  }), [naturalProfile]);

  const normalizedAdapted = useMemo(() => ({
    D: normalizeScore(adapted.D),
    I: normalizeScore(adapted.I),
    S: normalizeScore(adapted.S),
    C: normalizeScore(adapted.C),
  }), [adapted]);

  // Competências calculadas
  const competencies = useMemo(() => {
    const nD = normalizedNatural.D;
    const nI = normalizedNatural.I;
    const nS = normalizedNatural.S;
    const nC = normalizedNatural.C;

    return [
      { name: 'Ousadia', value: Math.round(nD * 0.9 + nI * 0.1), profile: 'D' },
      { name: 'Comando', value: Math.round(nD * 0.85 + nC * 0.15), profile: 'D' },
      { name: 'Assertividade', value: Math.round(nD * 0.7 + nI * 0.3), profile: 'D' },
      { name: 'Objetividade', value: Math.round(nD * 0.6 + nC * 0.4), profile: 'D' },
      { name: 'Persuasão', value: Math.round(nI * 0.8 + nD * 0.2), profile: 'I' },
      { name: 'Entusiasmo', value: Math.round(nI * 0.9 + nD * 0.1), profile: 'I' },
      { name: 'Sociabilidade', value: Math.round(nI * 0.7 + nS * 0.3), profile: 'I' },
      { name: 'Comunicação', value: Math.round(nI * 0.85 + nS * 0.15), profile: 'I' },
      { name: 'Paciência', value: Math.round(nS * 0.9 + nC * 0.1), profile: 'S' },
      { name: 'Persistência', value: Math.round(nS * 0.7 + nD * 0.3), profile: 'S' },
      { name: 'Empatia', value: Math.round(nS * 0.8 + nI * 0.2), profile: 'S' },
      { name: 'Cooperação', value: Math.round(nS * 0.85 + nI * 0.15), profile: 'S' },
      { name: 'Precisão', value: Math.round(nC * 0.9 + nD * 0.1), profile: 'C' },
      { name: 'Organização', value: Math.round(nC * 0.7 + nS * 0.3), profile: 'C' },
      { name: 'Análise', value: Math.round(nC * 0.85 + nS * 0.15), profile: 'C' },
      { name: 'Planejamento', value: Math.round(nC * 0.75 + nD * 0.25), profile: 'C' },
    ];
  }, [normalizedNatural]);

  // Estilos de liderança
  const leadershipStyles = useMemo(() => {
    const total = normalizedNatural.D + normalizedNatural.I + normalizedNatural.S + normalizedNatural.C;
    return [
      { name: 'Líder Executor', profile: 'D', value: Math.round((normalizedNatural.D / total) * 100), color: DISC_COLORS.D, traits: ['Direto', 'Decisivo', 'Focado em metas'] },
      { name: 'Líder Motivador', profile: 'I', value: Math.round((normalizedNatural.I / total) * 100), color: DISC_COLORS.I, traits: ['Comunicativo', 'Entusiasta', 'Inspirador'] },
      { name: 'Líder Apoiador', profile: 'S', value: Math.round((normalizedNatural.S / total) * 100), color: DISC_COLORS.S, traits: ['Paciente', 'Cooperativo', 'Confiável'] },
      { name: 'Líder Analítico', profile: 'C', value: Math.round((normalizedNatural.C / total) * 100), color: DISC_COLORS.C, traits: ['Organizado', 'Preciso', 'Estratégico'] },
    ];
  }, [normalizedNatural]);

  const dominantLeadership = leadershipStyles.reduce((prev, curr) => curr.value > prev.value ? curr : prev);
  const profileColor = DISC_COLORS[profileData.tipo.charAt(0) as keyof typeof DISC_COLORS] || DISC_COLORS.D;

  return (
    <div className="space-y-6">
      {/* Metodologia DISC - Explicação para recrutadores */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          Metodologia DISC
        </h3>
        <p className="text-sm text-zinc-300 mb-4">
          O modelo DISC identifica quatro dimensões comportamentais principais. Este relatório mostra como <strong className="text-white">{firstName}</strong> se comporta naturalmente e como se adapta no ambiente de trabalho.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(['D', 'I', 'S', 'C'] as const).map((key) => (
            <div
              key={key}
              className="p-3 rounded-xl border"
              style={{ backgroundColor: `${DISC_COLORS[key]}15`, borderColor: `${DISC_COLORS[key]}40` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold" style={{ color: DISC_COLORS[key] }}>{key}</span>
                <span className="text-sm font-medium text-white">{DISC_NAMES[key]}</span>
              </div>
              <p className="text-xs text-zinc-400">{DISC_DESCRIPTIONS[key].replace('Como este profissional', 'Como')}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Confiabilidade do Teste */}
      {confiabilidade && confiabilidade.score !== null && (() => {
        const style = getConfiabilidadeStyle(confiabilidade.nivel);
        const IconComponent = style.icon;

        return (
          <section className={`rounded-2xl p-5 border ${style.bgColor} ${style.borderColor}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-bold ${style.textColor}`}>{style.label}</h3>
                  <span className={`text-2xl font-bold ${style.textColor}`}>
                    {confiabilidade.score}/100
                  </span>
                </div>
                <p className="text-sm text-zinc-300 mb-3">{style.description}</p>

                {/* Barra de progresso */}
                <div className="h-3 bg-zinc-700 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${style.iconBg}`}
                    style={{ width: `${confiabilidade.score}%` }}
                  />
                </div>

                {/* Observações Detectadas */}
                {confiabilidade.flags && confiabilidade.flags.length > 0 && (
                  <div className="pt-4 border-t border-current/20">
                    <p className={`text-xs font-semibold ${style.textColor} uppercase tracking-wide mb-3`}>
                      Observações Detectadas:
                    </p>
                    <ul className="space-y-2">
                      {confiabilidade.flags.map((flag, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className={`w-4 h-4 ${style.textColor} mt-0.5 flex-shrink-0`} />
                          <span className="text-sm text-zinc-300">
                            {FLAG_DESCRIPTIONS[flag] || flag}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Perfil DISC com barras e comentários */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Brain className="w-5 h-5" style={{ color: profileColor }} />
          Perfil DISC de {firstName}
        </h3>
        <p className="text-sm text-zinc-400 mb-4">
          Compare como <strong className="text-white">{firstName}</strong> age naturalmente (barra cheia) com como se adapta no trabalho (barra transparente).
          <strong className="text-white"> Quanto maior a barra, mais forte é essa característica.</strong>
        </p>

        {/* Scale labels */}
        <div className="flex justify-between text-xs text-zinc-500 mb-4 ml-24">
          <span>Baixo</span>
          <span>Médio</span>
          <span>Alto</span>
        </div>

        <div className="space-y-5">
          {(['D', 'I', 'S', 'C'] as const).map((key) => {
            const natural = normalizedNatural[key];
            const adaptedValue = normalizedAdapted[key];
            const diff = Math.abs(natural - adaptedValue);
            const isSignificant = diff > 15;

            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-20">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: DISC_COLORS[key] }}
                      >
                        {key}
                      </div>
                      <span className="text-sm font-medium text-white">{DISC_NAMES[key]}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {/* Natural Bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 w-14">Natural</span>
                      <div className="flex-1 h-5 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                          style={{ width: `${natural}%`, backgroundColor: DISC_COLORS[key] }}
                        >
                          <span className="text-xs font-bold text-white drop-shadow">{natural}%</span>
                        </div>
                      </div>
                    </div>
                    {/* Adapted Bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 w-14">Trabalho</span>
                      <div className="flex-1 h-5 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500 opacity-60"
                          style={{ width: `${adaptedValue}%`, backgroundColor: DISC_COLORS[key] }}
                        >
                          <span className="text-xs font-bold text-white drop-shadow">{adaptedValue}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Descrição da dimensão */}
                <p className="text-xs text-zinc-400 ml-24 italic">{DISC_DESCRIPTIONS[key]}</p>
                {/* Interpretação de adaptação */}
                <div className={`ml-24 p-2 rounded-lg text-xs ${isSignificant ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'}`}>
                  {isSignificant && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                  {!isSignificant && <Check className="w-3 h-3 inline mr-1" />}
                  {getAmplitudeInterpretation(key, natural, adaptedValue, nomeCompleto)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="mt-5 pt-4 border-t border-zinc-700">
          <div className="flex items-center justify-center gap-6 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-zinc-500" />
              <span>Natural (como a pessoa é)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-zinc-500 opacity-60" />
              <span>Adaptado (no trabalho)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre este profissional */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" style={{ color: profileColor }} />
          Sobre Este Profissional
        </h3>

        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: profileColor }}
            >
              {profileData.tipo}
            </div>
            <div>
              <p className="text-zinc-400 text-xs">Perfil predominante</p>
              <p className="text-white font-bold text-lg">{profileData.descricao.nome}</p>
            </div>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed">
            {profileData.descricao.descricaoCompleta}
          </p>
        </div>
      </section>

      {/* Potencialidades */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Potencialidades de {firstName}
        </h3>
        <p className="text-sm text-zinc-400 mb-4">Pontos fortes naturais deste profissional:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {profileData.descricao.potencialidades.slice(0, 6).map((potencial, i) => (
            <div key={i} className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-emerald-300">{potencial}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pontos a Desenvolver */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          Pontos a Desenvolver
        </h3>
        <p className="text-sm text-zinc-400 mb-4">Oportunidades de crescimento:</p>

        <div className="space-y-2">
          {profileData.descricao.pontosDesenvolver.map((ponto, i) => (
            <div key={i} className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-amber-200">{ponto}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quadro de Competências */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-blue-400" />
          Quadro de Competências
        </h3>
        <p className="text-sm text-zinc-400 mb-4">
          Avaliação das principais competências comportamentais:
        </p>

        <div className="grid grid-cols-2 gap-4">
          {(['D', 'I', 'S', 'C'] as const).map((profile) => {
            const profileComps = competencies.filter(c => c.profile === profile);
            const bgColor = profile === 'D' ? 'bg-red-500/10 border-red-500/30' :
                           profile === 'I' ? 'bg-amber-500/10 border-amber-500/30' :
                           profile === 'S' ? 'bg-emerald-500/10 border-emerald-500/30' :
                           'bg-blue-500/10 border-blue-500/30';

            return (
              <div key={profile} className={`rounded-xl p-3 border ${bgColor}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: DISC_COLORS[profile] }}
                  >
                    {profile}
                  </div>
                  <span className="text-sm font-medium text-white">{DISC_NAMES[profile]}</span>
                </div>
                <div className="space-y-2">
                  {profileComps.map((comp) => (
                    <div key={comp.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-300">{comp.name}</span>
                        <span className="text-zinc-400">{comp.value}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${comp.value}%`, backgroundColor: DISC_COLORS[profile] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Estilo de Liderança */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Estilo de Liderança de {firstName}
        </h3>

        <div
          className="p-4 rounded-xl mb-4 border"
          style={{ backgroundColor: `${dominantLeadership.color}15`, borderColor: `${dominantLeadership.color}50` }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: dominantLeadership.color }}
            >
              {dominantLeadership.profile}
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-400">Estilo predominante</p>
              <p className="text-white font-bold">{dominantLeadership.name}</p>
            </div>
            <span className="text-2xl font-bold" style={{ color: dominantLeadership.color }}>
              {dominantLeadership.value}%
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {dominantLeadership.traits.map((trait) => (
              <span
                key={trait}
                className="text-xs px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: dominantLeadership.color }}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {leadershipStyles.map((style) => (
            <div key={style.name} className="flex items-center gap-2 bg-zinc-700/30 rounded-lg p-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: style.color }}
              >
                {style.profile}
              </div>
              <span className="text-xs text-zinc-300 flex-1">{style.name}</span>
              <span className="text-xs font-bold" style={{ color: style.color }}>{style.value}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* Motivadores */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-400" />
          O Que Motiva {firstName}
        </h3>

        <div className="space-y-3">
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
            <p className="text-xs text-rose-400 font-medium mb-1">Motivador Principal</p>
            <p className="text-white text-sm">{profileData.descricao.motivadores.principal}</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <p className="text-xs text-orange-400 font-medium mb-1">Motivador Secundário</p>
            <p className="text-white text-sm">{profileData.descricao.motivadores.secundario}</p>
          </div>
        </div>
      </section>

      {/* Medos Centrais */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-yellow-400" />
          Os Medos Centrais de {firstName}
        </h3>
        <p className="text-sm text-zinc-400 mb-4">
          Compreender os medos ajuda a criar um ambiente onde este profissional possa prosperar:
        </p>

        <div className="space-y-2">
          {profileData.descricao.medos.map((medo, i) => (
            <div key={i} className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-amber-200">{medo}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Como pode ser mal interpretado */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-red-400" />
          Como {firstName} Pode Ser Mal Interpretado
        </h3>
        <p className="text-sm text-zinc-400 mb-4">
          Alguns comportamentos naturais podem gerar interpretações equivocadas. Conhecer esses pontos ajuda na comunicação:
        </p>

        <div className="space-y-2">
          {profileData.descricao.alertasCriticos.malInterpretado.map((alerta, i) => (
            <div key={i} className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <Info className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-200">{alerta}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Relações Interpessoais */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-pink-400" />
          Relações Interpessoais
        </h3>
        <p className="text-zinc-300 text-sm leading-relaxed">
          {profileData.descricao.relacoesInterpessoais}
        </p>
      </section>

      {/* Tomada de Decisão */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          Como {firstName} Toma Decisões
        </h3>
        <p className="text-zinc-300 text-sm leading-relaxed">
          {profileData.descricao.tomadaDecisao}
        </p>
      </section>

      {/* Dicas de Comunicação */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-400" />
          Dicas de Comunicação com {firstName}
        </h3>

        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-xs text-emerald-400 font-medium mb-2">Como se comunicar com este profissional</p>
            <p className="text-white text-sm">{profileData.descricao.comunicacao.comoComunicar}</p>
          </div>
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4">
            <p className="text-xs text-teal-400 font-medium mb-2">Como este profissional prefere receber informações</p>
            <p className="text-white text-sm">{profileData.descricao.comunicacao.comoReceber}</p>
          </div>
        </div>
      </section>

      {/* Funções Ideais */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-violet-400" />
          Funções Ideais para {firstName}
        </h3>

        <p className="text-sm text-zinc-400 mb-4">
          {profileData.descricao.melhorAdequacao}
        </p>

        <div className="flex flex-wrap gap-2">
          {profileData.descricao.cargosIdeais.map((cargo, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: profileColor }}
            >
              {cargo}
            </span>
          ))}
        </div>
      </section>

      {/* Mensagem de Assertividade Científica */}
      <section className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 rounded-2xl p-5 border border-cyan-500/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-cyan-400 mb-2">Assertividade Científica</h3>
            <p className="text-zinc-300 text-sm leading-relaxed mb-4">
              Este relatório possui <strong className="text-white">acima de 80% de assertividade científica</strong> baseada na metodologia DISC validada internacionalmente.
              Independente do resultado apresentado, <strong className="text-white">realize a entrevista e conheça o profissional pessoalmente</strong>.
              O teste comportamental é uma ferramenta de apoio, não substitui a interação humana.
            </p>

            {onAgendarEntrevista && (
              <Button
                onClick={onAgendarEntrevista}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:opacity-90"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Entrevista
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center py-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500">
          Análise comportamental baseada na metodologia DISC | Instituto VEON
        </p>
        <p className="text-xs text-zinc-600 mt-1">
          "A bússola que aponta para o sucesso!"
        </p>
      </div>
    </div>
  );
}

// =====================================================
// CURRÍCULO DISC REPORT - Relatório DISC completo para currículo
// 85% do relatório original com linguagem personalizada
// =====================================================

import { useMemo } from 'react';
import { discProfiles, getProfileType, getProfileDescription, ProfileData } from '@/data/discProfiles';
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

interface Profile {
  D: number;
  I: number;
  S: number;
  C: number;
}

interface CurriculoDISCReportProps {
  naturalProfile: Profile;
  adaptedProfile?: Profile;
  nomeCompleto: string;
}

// Normaliza score de -25/+25 para 0-100
const normalizeScore = (score: number): number => {
  return Math.round(((score + 25) / 50) * 100);
};

export default function CurriculoDISCReport({
  naturalProfile,
  adaptedProfile,
  nomeCompleto,
}: CurriculoDISCReportProps) {
  const adapted = adaptedProfile || naturalProfile;

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

  const firstName = nomeCompleto.split(' ')[0];

  // Cor principal do perfil
  const profileColor = DISC_COLORS[profileData.tipo.charAt(0) as keyof typeof DISC_COLORS] || DISC_COLORS.D;

  return (
    <div className="space-y-6">
      {/* Seção 1: Gráfico DISC Horizontal */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5" style={{ color: profileColor }} />
          Perfil Comportamental DISC
        </h3>

        <p className="text-sm text-zinc-400 mb-4">
          Este gráfico mostra como <strong className="text-white">{firstName}</strong> se comporta naturalmente e como se adapta no ambiente de trabalho.
        </p>

        <div className="space-y-4">
          {(['D', 'I', 'S', 'C'] as const).map((key) => (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: DISC_COLORS[key] }}
                >
                  {key}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-medium">{DISC_NAMES[key]}</span>
                    <span className="text-xs text-zinc-400">{normalizedNatural[key]}%</span>
                  </div>
                  <div className="h-3 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${normalizedNatural[key]}%`, backgroundColor: DISC_COLORS[key] }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-700">
          <p className="text-xs text-zinc-500 text-center">
            Quanto maior a barra, mais forte é essa característica neste profissional.
          </p>
        </div>
      </section>

      {/* Seção 2: Sobre este profissional */}
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

      {/* Seção 3: Potencialidades */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          Potencialidades de {firstName}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {profileData.descricao.potencialidades.map((potencial, i) => (
            <div key={i} className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ChevronRight className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-emerald-300">{potencial}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Seção 4: Quadro de Competências */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Quadro de Competências
        </h3>

        <p className="text-sm text-zinc-400 mb-4">
          Avaliação das principais competências comportamentais deste profissional.
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

      {/* Seção 5: Estilo de Liderança */}
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

      {/* Seção 6: O que motiva este profissional */}
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

      {/* Seção 7: Medos centrais */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-yellow-400" />
          Os Medos Centrais de {firstName}
        </h3>

        <p className="text-sm text-zinc-400 mb-4">
          Compreender os medos ajuda a criar um ambiente onde este profissional possa prosperar.
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

      {/* Seção 8: Como pode ser mal interpretado */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-red-400" />
          Como {firstName} Pode Ser Mal Interpretado
        </h3>

        <p className="text-sm text-zinc-400 mb-4">
          Alguns comportamentos naturais podem gerar interpretações equivocadas. Conhecer esses pontos ajuda na comunicação.
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

      {/* Seção 9: Pontos a desenvolver */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Pontos de Desenvolvimento
        </h3>

        <div className="space-y-2">
          {profileData.descricao.pontosDesenvolver.map((ponto, i) => (
            <div key={i} className="flex items-start gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
              <Lightbulb className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-cyan-200">{ponto}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Seção 10: Dicas de comunicação */}
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

      {/* Seção 11: Funções ideais */}
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

      {/* Seção 12: Relacionamentos interpessoais */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-pink-400" />
          Relacionamentos Interpessoais
        </h3>

        <p className="text-zinc-300 text-sm leading-relaxed">
          {profileData.descricao.relacoesInterpessoais}
        </p>
      </section>

      {/* Seção 13: Tomada de decisão */}
      <section className="bg-zinc-800/60 rounded-2xl p-5 border border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Como {firstName} Toma Decisões
        </h3>

        <p className="text-zinc-300 text-sm leading-relaxed">
          {profileData.descricao.tomadaDecisao}
        </p>
      </section>

      {/* Footer */}
      <div className="text-center py-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500">
          Análise comportamental baseada na metodologia DISC | Instituto VEON
        </p>
      </div>
    </div>
  );
}

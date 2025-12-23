// =====================================================
// RELATÓRIO DISC MODAL - Visualização completa do perfil
// Suporta modo candidato (Você) e modo empresa (Nome)
// =====================================================

import { useState } from "react";
import {
  X,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Users,
  Brain,
  Lightbulb,
  MessageSquare,
  Briefcase,
  TrendingUp,
  Heart,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { discProfiles, ProfileData } from "@/data/discProfiles";

interface RelatorioDiscModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidato: {
    id: string;
    nome_completo: string;
    perfil_disc: string | null;
    perfil_natural?: Record<string, number> | null;
    confiabilidade_score?: number | null;
    confiabilidade_nivel?: string | null;
    disc_realizado_em?: string | null;
  };
  isProprioPeril: boolean; // true = "Você" / false = "Nome do candidato"
  diasParaRefazer: number;
  podeRefazer: boolean;
  onRefazerTeste: () => void;
}

// Cores DISC
const coresDisc = {
  D: { bg: "bg-red-500", text: "text-red-500", bgLight: "bg-red-500/20", label: "Dominante" },
  I: { bg: "bg-amber-500", text: "text-amber-500", bgLight: "bg-amber-500/20", label: "Influente" },
  S: { bg: "bg-emerald-500", text: "text-emerald-500", bgLight: "bg-emerald-500/20", label: "Estável" },
  C: { bg: "bg-blue-500", text: "text-blue-500", bgLight: "bg-blue-500/20", label: "Conforme" },
} as const;

// Normalizar scores para 0-100 (DISC usa escala de -50 a +50)
const normalizarScore = (score: number): number => {
  return Math.round(((score + 50) / 100) * 100);
};

// Cor do badge de confiabilidade
const getCorConfiabilidade = (nivel: string | null | undefined) => {
  switch (nivel) {
    case "ALTA":
      return "bg-green-500/20 text-green-400 border-green-500/40";
    case "MÉDIA":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
    case "BAIXA":
      return "bg-orange-500/20 text-orange-400 border-orange-500/40";
    case "SUSPEITA":
      return "bg-red-500/20 text-red-400 border-red-500/40";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/40";
  }
};

export function RelatorioDiscModal({
  isOpen,
  onClose,
  candidato,
  isProprioPeril,
  diasParaRefazer,
  podeRefazer,
  onRefazerTeste,
}: RelatorioDiscModalProps) {
  const perfil = discProfiles[candidato.perfil_disc || "D"] as ProfileData | undefined;
  const primeiroNome = candidato.nome_completo.split(" ")[0];

  if (!perfil || !candidato.perfil_disc) {
    return null;
  }

  // Scores normalizados
  const scores = candidato.perfil_natural || { D: 0, I: 0, S: 0, C: 0 };
  const scoresNormalizados = {
    D: normalizarScore(scores.D || 0),
    I: normalizarScore(scores.I || 0),
    S: normalizarScore(scores.S || 0),
    C: normalizarScore(scores.C || 0),
  };

  // Pegar letra dominante
  const letraDominante = candidato.perfil_disc.charAt(0) as keyof typeof coresDisc;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800 text-white p-0">
        {/* Header fixo */}
        <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 p-4">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Target className="w-5 h-5 text-white" />
                Relatório DISC
              </DialogTitle>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          {/* Header: Confiabilidade + Botão Refazer */}
          <div className="flex items-center justify-between mt-4">
            <div
              className={`px-3 py-1 rounded-full border text-sm ${getCorConfiabilidade(
                candidato.confiabilidade_nivel
              )}`}
            >
              Confiabilidade: {candidato.confiabilidade_nivel || "N/A"}{" "}
              {candidato.confiabilidade_score ? `(${candidato.confiabilidade_score}%)` : ""}
            </div>

            {isProprioPeril &&
              (podeRefazer ? (
                <Button
                  onClick={onRefazerTeste}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refazer Teste
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  Refazer em {diasParaRefazer} dias
                </div>
              ))}
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div className="space-y-6 p-4">
          {/* ===== SEÇÃO 1: Gráfico de Barras DISC ===== */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Intensidade do Perfil
            </h3>
            <div className="space-y-3">
              {(["D", "I", "S", "C"] as const).map((fator) => (
                <div key={fator} className="flex items-center gap-3">
                  <span className={`w-24 text-sm font-medium ${coresDisc[fator].text}`}>
                    {coresDisc[fator].label}
                  </span>
                  <div className="flex-1 h-6 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${coresDisc[fator].bg} rounded-full transition-all duration-500`}
                      style={{ width: `${scoresNormalizados[fator]}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-bold">
                    {scoresNormalizados[fator]}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ===== SEÇÃO 2: Perfil Identificado ===== */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              {isProprioPeril ? "Seu Perfil" : `Perfil de ${primeiroNome}`}
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`text-3xl font-bold ${coresDisc[letraDominante]?.text || "text-white"}`}
              >
                {candidato.perfil_disc}
              </span>
              <span className="text-xl text-gray-400">-</span>
              <span className="text-xl font-medium">{perfil.nome}</span>
            </div>
            <p className="text-gray-300 leading-relaxed">{perfil.descricaoCurta}</p>
          </div>

          {/* ===== SEÇÃO 3: Descrição Completa ===== */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              Descrição do Perfil
            </h3>
            <p className="text-gray-300 leading-relaxed">{perfil.descricaoCompleta}</p>
          </div>

          {/* ===== SEÇÃO 4: Potencialidades ===== */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              {isProprioPeril ? "Suas Potencialidades" : `Potencialidades de ${primeiroNome}`}
            </h3>
            <ul className="space-y-2">
              {perfil.potencialidades?.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300">
                  <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== SEÇÃO 5: Pontos a Desenvolver ===== */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Pontos a Desenvolver
            </h3>
            <ul className="space-y-2">
              {perfil.pontosDesenvolver?.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300">
                  <span className="text-amber-500 mt-1 flex-shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== SEÇÃO 6: Motivadores ===== */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              {isProprioPeril ? "O Que Te Motiva" : `O Que Motiva ${primeiroNome}`}
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-400">Motivador Principal:</span>
                <p className="text-gray-200 font-medium">{perfil.motivadores?.principal}</p>
              </div>
              <div>
                <span className="text-sm text-gray-400">Motivador Secundário:</span>
                <p className="text-gray-200">{perfil.motivadores?.secundario}</p>
              </div>
            </div>
          </div>

          {/* ===== SEÇÃO 7: Medos ===== */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              {isProprioPeril ? "Seus Medos/Inseguranças" : `Medos de ${primeiroNome}`}
            </h3>
            <ul className="space-y-2">
              {perfil.medos?.map((medo, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300">
                  <span className="text-red-400 mt-1 flex-shrink-0">⚠</span>
                  <span>{medo}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== SEÇÃO 8: Estilo de Comunicação ===== */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-500" />
              Estilo de Comunicação
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-blue-400 font-medium">
                  {isProprioPeril
                    ? "Como se comunicar com você:"
                    : `Como se comunicar com ${primeiroNome}:`}
                </span>
                <p className="text-gray-300 mt-1">{perfil.comunicacao?.comoComunicar}</p>
              </div>
              <div>
                <span className="text-sm text-green-400 font-medium">
                  {isProprioPeril
                    ? "Como você se comunica:"
                    : `Como ${primeiroNome} se comunica:`}
                </span>
                <p className="text-gray-300 mt-1">{perfil.comunicacao?.comoReceber}</p>
              </div>
            </div>
          </div>

          {/* ===== SEÇÃO 9: Tomada de Decisão ===== */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Tomada de Decisão
            </h3>
            <p className="text-gray-300 leading-relaxed">{perfil.tomadaDecisao}</p>
          </div>

          {/* ===== SEÇÃO 10: Relações Interpessoais ===== */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-500" />
              Relações Interpessoais
            </h3>
            <p className="text-gray-300 leading-relaxed">{perfil.relacoesInterpessoais}</p>
          </div>

          {/* ===== SEÇÃO 11: Cargos Ideais ===== */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              {isProprioPeril ? "Cargos Ideais Para Você" : `Cargos Ideais Para ${primeiroNome}`}
            </h3>
            <div className="flex flex-wrap gap-2">
              {perfil.cargosIdeais?.map((cargo, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-zinc-700 rounded-lg text-sm text-gray-300"
                >
                  {cargo}
                </span>
              ))}
            </div>
          </div>

          {/* ===== SEÇÃO 12: Melhor Adequação ===== */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Melhor Adequação em Organizações
            </h3>
            <p className="text-gray-300 leading-relaxed">{perfil.melhorAdequacao}</p>
          </div>

          {/* ===== SEÇÃO 13: Plano de Ação ===== */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-500" />
              Plano de Ação para Desenvolvimento
            </h3>
            <ol className="space-y-2">
              {perfil.planoAcao?.map((acao, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span>{acao}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* ===== SEÇÃO 14: Alertas Críticos ===== */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Alertas Importantes
            </h3>

            {/* Mal interpretado */}
            {perfil.alertasCriticos?.malInterpretado &&
              perfil.alertasCriticos.malInterpretado.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-orange-400 font-medium mb-2">
                    {isProprioPeril
                      ? "Você pode ser mal interpretado(a) como:"
                      : `${primeiroNome} pode ser mal interpretado(a) como:`}
                  </p>
                  <ul className="space-y-1">
                    {perfil.alertasCriticos.malInterpretado.map((item, i) => (
                      <li key={i} className="text-gray-400 text-sm pl-4 border-l-2 border-orange-500/40">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Perda de colaboradores - só para empresa */}
            {!isProprioPeril &&
              perfil.alertasCriticos?.perdaColaboradores &&
              perfil.alertasCriticos.perdaColaboradores.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-red-400 font-medium mb-2">
                    Risco de perda de colaboradores:
                  </p>
                  <ul className="space-y-1">
                    {perfil.alertasCriticos.perdaColaboradores.map((item, i) => (
                      <li key={i} className="text-gray-400 text-sm pl-4 border-l-2 border-red-500/40">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Medos que travam */}
            {perfil.alertasCriticos?.medosTravas &&
              perfil.alertasCriticos.medosTravas.length > 0 && (
                <div>
                  <p className="text-sm text-yellow-400 font-medium mb-2">
                    {isProprioPeril
                      ? "Medos que podem te travar:"
                      : `Medos que podem travar ${primeiroNome}:`}
                  </p>
                  <ul className="space-y-1">
                    {perfil.alertasCriticos.medosTravas.map((item, i) => (
                      <li key={i} className="text-gray-400 text-sm pl-4 border-l-2 border-yellow-500/40">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          {/* Botão final para refazer */}
          {isProprioPeril && podeRefazer && (
            <div className="pt-4 border-t border-zinc-800">
              <Button
                onClick={onRefazerTeste}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refazer Teste DISC
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Você pode refazer o teste a cada 21 dias para acompanhar sua evolução
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

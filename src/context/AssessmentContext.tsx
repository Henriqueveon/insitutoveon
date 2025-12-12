import React, { createContext, useContext, useState, ReactNode } from 'react';
import { discSprangerCorrelation, sprangerQuestions } from '@/data/sprangerQuestions';

export interface CandidateData {
  id?: string;
  nome_completo: string;
  email: string;
  telefone_whatsapp: string;
  cargo_atual: string;
  empresa_instagram: string;
}

export interface Answer {
  questionId: number;
  mais: 'D' | 'I' | 'S' | 'C';
  menos: 'D' | 'I' | 'S' | 'C';
  timestamp: number;
}

// Resposta para perguntas situacionais (perfil adaptado)
export interface SituationalAnswer {
  questionId: number;
  selected: 'D' | 'I' | 'S' | 'C';
  timestamp: number;
}

export interface Profile {
  D: number;
  I: number;
  S: number;
  C: number;
}

// Spranger Types
export type SprangerValue = 'TEO' | 'ECO' | 'EST' | 'SOC' | 'IND' | 'TRA';

export interface SprangerAnswer {
  questionId: number;
  ranking: string[]; // Array ordenado: [1º +5pts, 2º +4pts, 3º +3pts, 4º +2pts, 5º +1pt, 6º 0pts]
  timestamp: number;
}

export interface SprangerProfile {
  TEO: number; // Teórico
  ECO: number; // Econômico
  EST: number; // Estético
  SOC: number; // Social
  IND: number; // Individualista
  TRA: number; // Tradicional
}

// Consistency validation result
export interface ConsistencyResult {
  score: number; // 0-100 (100 = perfectly consistent)
  level: 'high' | 'medium' | 'low';
  warnings: string[];
}

interface AssessmentContextType {
  candidate: CandidateData | null;
  setCandidate: (data: CandidateData) => void;
  answers: Answer[];
  addAnswer: (answer: Answer) => void;
  clearAnswers: () => void;
  // Situational answers (for adapted profile)
  situationalAnswers: SituationalAnswer[];
  addSituationalAnswer: (answer: SituationalAnswer) => void;
  clearSituationalAnswers: () => void;
  naturalProfile: Profile | null;
  adaptedProfile: Profile | null;
  calculateProfiles: () => void;
  resetAssessment: () => void;
  startTime: number | null;
  setStartTime: (time: number) => void;
  // Spranger
  sprangerAnswers: SprangerAnswer[];
  addSprangerAnswer: (answer: SprangerAnswer) => void;
  clearSprangerAnswers: () => void;
  sprangerProfile: SprangerProfile | null;
  calculateSprangerProfile: () => void;
  sprangerStartTime: number | null;
  setSprangerStartTime: (time: number) => void;
  // Combined analysis
  getSprangerDISCCorrelation: () => { value: SprangerValue; discMatch: string; strength: number }[] | null;
  // Consistency validation
  consistencyResult: ConsistencyResult | null;
  calculateConsistency: () => ConsistencyResult;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [situationalAnswers, setSituationalAnswers] = useState<SituationalAnswer[]>([]);
  const [naturalProfile, setNaturalProfile] = useState<Profile | null>(null);
  const [adaptedProfile, setAdaptedProfile] = useState<Profile | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [consistencyResult, setConsistencyResult] = useState<ConsistencyResult | null>(null);

  // Spranger state
  const [sprangerAnswers, setSprangerAnswers] = useState<SprangerAnswer[]>([]);
  const [sprangerProfile, setSprangerProfile] = useState<SprangerProfile | null>(null);
  const [sprangerStartTime, setSprangerStartTime] = useState<number | null>(null);

  const addAnswer = (answer: Answer) => {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== answer.questionId);
      return [...filtered, answer];
    });
  };

  const clearAnswers = () => {
    setAnswers([]);
  };

  // Situational answers (for adapted profile - measured directly)
  const addSituationalAnswer = (answer: SituationalAnswer) => {
    setSituationalAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== answer.questionId);
      return [...filtered, answer];
    });
  };

  const clearSituationalAnswers = () => {
    setSituationalAnswers([]);
  };

  const addSprangerAnswer = (answer: SprangerAnswer) => {
    setSprangerAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== answer.questionId);
      return [...filtered, answer];
    });
  };

  const clearSprangerAnswers = () => {
    setSprangerAnswers([]);
  };

  const calculateProfiles = () => {
    // Calculate Natural Profile with improved scoring system
    // Using +2/-2 instead of +1/-1 for better differentiation
    const natural: Profile = { D: 0, I: 0, S: 0, C: 0 };

    answers.forEach((answer) => {
      natural[answer.mais] += 2;  // "Mais combina" gets +2 points
      natural[answer.menos] -= 2; // "Menos combina" gets -2 points
      // Note: The other 2 factors get 0 points (neutral)
    });

    // Scale is now -50 to +50 (25 questions × 2 points each direction)
    setNaturalProfile(natural);

    // Calculate Adapted Profile - NOW MEASURED DIRECTLY from situational questions!
    // The adapted profile represents behavioral adjustments in professional environments
    const factors: Array<'D' | 'I' | 'S' | 'C'> = ['D', 'I', 'S', 'C'];

    if (situationalAnswers.length > 0) {
      // NEW: Calculate adapted profile from situational answers (MEASURED, not estimated)
      // Each situational question gives +8 points to the selected factor
      // This creates a scale similar to natural profile for comparison
      const adapted: Profile = { D: 0, I: 0, S: 0, C: 0 };

      situationalAnswers.forEach((answer) => {
        adapted[answer.selected] += 8; // 6 questions × 8 = max 48 per factor
      });

      // Normalize to -50 to +50 scale to match natural profile
      // Shift from 0-48 to centered scale
      const totalSituational = situationalAnswers.length * 8; // Total points distributed
      const avgPerFactor = totalSituational / 4; // Expected average if evenly distributed

      factors.forEach(factor => {
        // Center the scale: subtract average, multiply by factor to get -50 to +50 range
        adapted[factor] = Math.round((adapted[factor] - avgPerFactor) * (50 / avgPerFactor));
        // Clamp to valid range
        adapted[factor] = Math.max(-50, Math.min(50, adapted[factor]));
      });

      setAdaptedProfile(adapted);
    } else {
      // Fallback: Calculate Adapted Profile using deterministic algorithm based on DISC theory
      // Used only if situational questions weren't answered (backward compatibility)
      const adapted: Profile = { ...natural };

      // Sort factors by score to identify dominant and lowest
      const sortedFactors = [...factors].sort((a, b) => natural[b] - natural[a]);
      const dominant = sortedFactors[0];
      const lowest = sortedFactors[3];

      // Calculate intensity of adaptation based on profile extremity
      const dominantScore = natural[dominant];
      const lowestScore = natural[lowest];
      const profileSpread = dominantScore - lowestScore;

      const baseAdjustment = 4;
      const spreadFactor = Math.round(profileSpread * 0.04);
      const totalAdjustment = baseAdjustment + spreadFactor;

      // Opposite pairs in DISC: D↔S (pace), I↔C (priority)
      const opposites: Record<string, 'D' | 'I' | 'S' | 'C'> = {
        D: 'S', S: 'D', I: 'C', C: 'I'
      };

      const oppositeFactor = opposites[dominant];

      // Primary adaptation: reduce dominant, increase opposite
      adapted[dominant] -= totalAdjustment;
      adapted[oppositeFactor] += Math.round(totalAdjustment * 0.6);

      // Secondary adaptation
      factors.forEach(factor => {
        if (factor !== dominant && factor !== oppositeFactor) {
          if (natural[factor] > 10) {
            adapted[factor] -= 2;
          } else if (natural[factor] < -10) {
            adapted[factor] += 2;
          }
        }
      });

      // Ensure adapted profile stays within valid range
      factors.forEach(factor => {
        adapted[factor] = Math.max(-50, Math.min(50, adapted[factor]));
      });

      setAdaptedProfile(adapted);
    }
  };

  const calculateSprangerProfile = () => {
    // Initialize profile with zeros
    const profile: SprangerProfile = {
      TEO: 0,
      ECO: 0,
      EST: 0,
      SOC: 0,
      IND: 0,
      TRA: 0,
    };

    // Build mapping from option ID to Spranger value
    const optionToValue: Record<string, SprangerValue> = {};
    sprangerQuestions.forEach((question) => {
      question.opcoes.forEach((opcao) => {
        optionToValue[opcao.id] = opcao.valor;
      });
    });

    // Pontuação: 1º = 5pts, 2º = 4pts, 3º = 3pts, 4º = 2pts, 5º = 1pt, 6º = 0pts
    const points = [5, 4, 3, 2, 1, 0];

    // Process each answer
    sprangerAnswers.forEach((answer) => {
      answer.ranking.forEach((optionId, index) => {
        const value = optionToValue[optionId];
        if (value && points[index] !== undefined) {
          profile[value] += points[index];
        }
      });
    });

    setSprangerProfile(profile);
  };

  const getSprangerDISCCorrelation = () => {
    if (!sprangerProfile || !naturalProfile) return null;

    const values: SprangerValue[] = ['TEO', 'ECO', 'EST', 'SOC', 'IND', 'TRA'];
    const discFactors: Array<'D' | 'I' | 'S' | 'C'> = ['D', 'I', 'S', 'C'];

    // Normalize DISC profile to 0-100 scale (from -50/+50 scale)
    const normalizedDISC: Record<string, number> = {};
    discFactors.forEach((factor) => {
      normalizedDISC[factor] = Math.round(((naturalProfile[factor] + 50) / 100) * 100);
    });

    // For each Spranger value, find the strongest DISC correlation
    return values.map((value) => {
      const correlations = discSprangerCorrelation[value];
      let strongestMatch = 'D';
      let highestScore = 0;

      discFactors.forEach((factor) => {
        const correlation = correlations[factor];
        const discValue = normalizedDISC[factor];
        const score = correlation * discValue;

        if (score > highestScore) {
          highestScore = score;
          strongestMatch = factor;
        }
      });

      // Calculate correlation strength based on how well Spranger value aligns with DISC
      const maxCorrelation = Math.max(...Object.values(correlations));
      const actualDISCValue = normalizedDISC[strongestMatch];
      const strength = Math.round((maxCorrelation * actualDISCValue) / 100 * 100);

      return {
        value,
        discMatch: strongestMatch,
        strength,
      };
    });
  };

  // Calculate consistency/reliability of responses
  const calculateConsistency = (): ConsistencyResult => {
    const warnings: string[] = [];
    let deductions = 0;

    if (answers.length === 0) {
      return { score: 0, level: 'low', warnings: ['Nenhuma resposta registrada'] };
    }

    // 1. Check response time consistency (if available)
    if (startTime) {
      const totalTime = Date.now() - startTime;
      const avgTimePerQuestion = totalTime / answers.length;

      // Too fast (< 3 seconds average) suggests random clicking
      if (avgTimePerQuestion < 3000) {
        deductions += 20;
        warnings.push('Respostas muito rápidas - possível falta de reflexão');
      }
      // Very fast (< 5 seconds average)
      else if (avgTimePerQuestion < 5000) {
        deductions += 10;
        warnings.push('Tempo de resposta abaixo do ideal');
      }
    }

    // 2. Check for contradictory patterns
    // Group answers by factor to check for consistency
    const factorChoices: Record<string, { mais: number; menos: number }> = {
      D: { mais: 0, menos: 0 },
      I: { mais: 0, menos: 0 },
      S: { mais: 0, menos: 0 },
      C: { mais: 0, menos: 0 },
    };

    answers.forEach((answer) => {
      factorChoices[answer.mais].mais++;
      factorChoices[answer.menos].menos++;
    });

    // Check for factors that are both frequently "mais" AND "menos" (contradiction)
    const factors: Array<'D' | 'I' | 'S' | 'C'> = ['D', 'I', 'S', 'C'];
    factors.forEach((factor) => {
      const choice = factorChoices[factor];
      // If a factor is selected as "mais" and "menos" with similar frequency, it's inconsistent
      const total = choice.mais + choice.menos;
      if (total >= 6) {
        const ratio = Math.min(choice.mais, choice.menos) / Math.max(choice.mais, choice.menos);
        if (ratio > 0.6) {
          deductions += 15;
          warnings.push(`Padrão contraditório no fator ${factor}`);
        }
      }
    });

    // 3. Check for flat profile (all factors similar - may indicate random answers)
    if (naturalProfile) {
      const values = [naturalProfile.D, naturalProfile.I, naturalProfile.S, naturalProfile.C];
      const max = Math.max(...values);
      const min = Math.min(...values);
      const spread = max - min;

      // Very flat profile (spread < 10 on -50/+50 scale) suggests random answers
      if (spread < 10) {
        deductions += 15;
        warnings.push('Perfil muito homogêneo - pode indicar respostas aleatórias');
      }
    }

    // 4. Check for extreme profile (may be valid but worth noting)
    if (naturalProfile) {
      const values = [naturalProfile.D, naturalProfile.I, naturalProfile.S, naturalProfile.C];
      const max = Math.max(...values);
      const min = Math.min(...values);

      if (max > 40 || min < -40) {
        // Not a deduction, just a note
        warnings.push('Perfil com tendências muito fortes - verifique se reflete sua realidade');
      }
    }

    // 5. Check answer distribution (should use all 4 factors somewhat evenly for "mais")
    const maisDistribution = factors.map(f => factorChoices[f].mais);
    const maxMais = Math.max(...maisDistribution);
    const minMais = Math.min(...maisDistribution);

    if (maxMais > 0 && minMais === 0) {
      // One factor was never selected as "mais" - might indicate bias
      const neverSelected = factors.filter(f => factorChoices[f].mais === 0);
      if (neverSelected.length >= 2) {
        deductions += 10;
        warnings.push('Alguns fatores nunca foram selecionados como "mais combina"');
      }
    }

    // Calculate final score
    const score = Math.max(0, Math.min(100, 100 - deductions));

    // Determine level
    let level: 'high' | 'medium' | 'low';
    if (score >= 80) {
      level = 'high';
    } else if (score >= 60) {
      level = 'medium';
    } else {
      level = 'low';
    }

    const result: ConsistencyResult = { score, level, warnings };
    setConsistencyResult(result);
    return result;
  };

  const resetAssessment = () => {
    setCandidate(null);
    setAnswers([]);
    setSituationalAnswers([]);
    setNaturalProfile(null);
    setAdaptedProfile(null);
    setStartTime(null);
    setConsistencyResult(null);
    setSprangerAnswers([]);
    setSprangerProfile(null);
    setSprangerStartTime(null);
  };

  return (
    <AssessmentContext.Provider
      value={{
        candidate,
        setCandidate,
        answers,
        addAnswer,
        clearAnswers,
        // Situational answers
        situationalAnswers,
        addSituationalAnswer,
        clearSituationalAnswers,
        naturalProfile,
        adaptedProfile,
        calculateProfiles,
        resetAssessment,
        startTime,
        setStartTime,
        // Spranger
        sprangerAnswers,
        addSprangerAnswer,
        clearSprangerAnswers,
        sprangerProfile,
        calculateSprangerProfile,
        sprangerStartTime,
        setSprangerStartTime,
        getSprangerDISCCorrelation,
        // Consistency
        consistencyResult,
        calculateConsistency,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { discSprangerCorrelation } from '@/data/sprangerQuestions';

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
  muitoEu: string[]; // IDs das opções em "MUITO EU" (3 pontos cada)
  maisOuMenos: string[]; // IDs das opções em "MAIS OU MENOS" (1 ponto cada)
  poucoEu: string[]; // IDs das opções em "POUCO EU" (0 pontos)
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

interface AssessmentContextType {
  candidate: CandidateData | null;
  setCandidate: (data: CandidateData) => void;
  answers: Answer[];
  addAnswer: (answer: Answer) => void;
  clearAnswers: () => void;
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
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [naturalProfile, setNaturalProfile] = useState<Profile | null>(null);
  const [adaptedProfile, setAdaptedProfile] = useState<Profile | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

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
    // Calculate Natural Profile
    const natural: Profile = { D: 0, I: 0, S: 0, C: 0 };

    answers.forEach((answer) => {
      natural[answer.mais] += 1;
      natural[answer.menos] -= 1;
    });

    setNaturalProfile(natural);

    // Calculate Adapted Profile (simulated adjustment)
    const adapted: Profile = { ...natural };

    // Find dominant factor
    const factors: Array<'D' | 'I' | 'S' | 'C'> = ['D', 'I', 'S', 'C'];
    const dominant = factors.reduce((a, b) => (natural[a] > natural[b] ? a : b));

    // Apply adjustment based on dominant factor
    const adjustmentAmount = Math.floor(Math.random() * 3) + 3; // 3-5
    const increaseAmount = Math.floor(Math.random() * 3) + 1; // 1-3

    switch (dominant) {
      case 'D':
        adapted.D -= adjustmentAmount;
        adapted.S += increaseAmount;
        break;
      case 'I':
        adapted.I -= adjustmentAmount;
        adapted.C += increaseAmount;
        break;
      case 'S':
        adapted.S -= adjustmentAmount;
        adapted.D += increaseAmount;
        break;
      case 'C':
        adapted.C -= adjustmentAmount;
        adapted.I += increaseAmount;
        break;
    }

    setAdaptedProfile(adapted);
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

    // Import questions to map option IDs to values
    // We need to map each option ID to its Spranger value
    const optionToValue: Record<string, SprangerValue> = {};

    // Build the mapping from sprangerQuestions data
    // Option IDs follow pattern: "1a", "1b", etc.
    // The last letter indicates the value: a=TEO, b=ECO, c=EST, d=SOC, e=IND, f=TRA
    const letterToValue: Record<string, SprangerValue> = {
      'a': 'TEO',
      'b': 'ECO',
      'c': 'EST',
      'd': 'SOC',
      'e': 'IND',
      'f': 'TRA',
    };

    // Process each answer
    sprangerAnswers.forEach((answer) => {
      // MUITO EU = 3 pontos
      answer.muitoEu.forEach((optionId) => {
        const letter = optionId.slice(-1);
        const value = letterToValue[letter];
        if (value) {
          profile[value] += 3;
        }
      });

      // MAIS OU MENOS = 1 ponto
      answer.maisOuMenos.forEach((optionId) => {
        const letter = optionId.slice(-1);
        const value = letterToValue[letter];
        if (value) {
          profile[value] += 1;
        }
      });

      // POUCO EU = 0 pontos (já é zero, não precisa fazer nada)
    });

    setSprangerProfile(profile);
  };

  const getSprangerDISCCorrelation = () => {
    if (!sprangerProfile || !naturalProfile) return null;

    const values: SprangerValue[] = ['TEO', 'ECO', 'EST', 'SOC', 'IND', 'TRA'];
    const discFactors: Array<'D' | 'I' | 'S' | 'C'> = ['D', 'I', 'S', 'C'];

    // Normalize DISC profile to 0-100 scale
    const normalizedDISC: Record<string, number> = {};
    discFactors.forEach((factor) => {
      normalizedDISC[factor] = Math.round(((naturalProfile[factor] + 25) / 50) * 100);
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

  const resetAssessment = () => {
    setCandidate(null);
    setAnswers([]);
    setNaturalProfile(null);
    setAdaptedProfile(null);
    setStartTime(null);
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

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CandidateData {
  nome: string;
  telefone: string;
  cargoAtual: string;
  empresa: string;
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
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [naturalProfile, setNaturalProfile] = useState<Profile | null>(null);
  const [adaptedProfile, setAdaptedProfile] = useState<Profile | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const addAnswer = (answer: Answer) => {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== answer.questionId);
      return [...filtered, answer];
    });
  };

  const clearAnswers = () => {
    setAnswers([]);
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

  const resetAssessment = () => {
    setCandidate(null);
    setAnswers([]);
    setNaturalProfile(null);
    setAdaptedProfile(null);
    setStartTime(null);
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

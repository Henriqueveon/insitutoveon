import { forwardRef } from 'react';
import { PageContainer } from './PageContainer';
import { PDFCoverPage } from './PDFCoverPage';
import { PDFDISCPage } from './PDFDISCPage';
import { PDFCompetenciesPage } from './PDFCompetenciesPage';
import { PDFLeadershipPage } from './PDFLeadershipPage';

interface PDFReportProps {
  candidateData: {
    nome: string;
    data: string;
  };
  discData: {
    natural: { D: number; I: number; S: number; C: number };
    adaptado: { D: number; I: number; S: number; C: number };
  };
}

/**
 * PDFReport - The main PDF report component with rigid A4 page structure
 * Each PageContainer represents one physical A4 page
 */
export const PDFReport = forwardRef<HTMLDivElement, PDFReportProps>(
  ({ candidateData, discData }, ref) => {
    // Calculate amplitude
    const amplitude = {
      D: { valor: discData.adaptado.D - discData.natural.D, alerta: Math.abs(discData.adaptado.D - discData.natural.D) > 5 },
      I: { valor: discData.adaptado.I - discData.natural.I, alerta: Math.abs(discData.adaptado.I - discData.natural.I) > 5 },
      S: { valor: discData.adaptado.S - discData.natural.S, alerta: Math.abs(discData.adaptado.S - discData.natural.S) > 5 },
      C: { valor: discData.adaptado.C - discData.natural.C, alerta: Math.abs(discData.adaptado.C - discData.natural.C) > 5 },
    };

    // Competencies data based on DISC scores
    const mapaCompetencias = generateCompetencias(discData.natural, discData.adaptado);

    // Leadership data based on DISC profile
    const lideranca = generateLideranca(discData.natural);

    // Values data based on profile
    const valores = generateValores(discData.natural);

    return (
      <div ref={ref} className="bg-gray-100 print:bg-white">
        {/* PAGE 1: Cover */}
        <PageContainer noPadding>
          <PDFCoverPage 
            nome={candidateData.nome} 
            data={candidateData.data} 
          />
        </PageContainer>

        {/* PAGE 2: DISC Chart + Amplitude */}
        <PageContainer>
          <PDFDISCPage 
            discData={discData} 
            amplitude={amplitude} 
          />
        </PageContainer>

        {/* PAGE 3: Competencies Radar */}
        <PageContainer>
          <PDFCompetenciesPage 
            competencias={mapaCompetencias} 
          />
        </PageContainer>

        {/* PAGE 4: Leadership + Values */}
        <PageContainer>
          <PDFLeadershipPage 
            lideranca={lideranca} 
            valores={valores} 
          />
        </PageContainer>
      </div>
    );
  }
);

PDFReport.displayName = 'PDFReport';

// Helper functions
function generateCompetencias(natural: { D: number; I: number; S: number; C: number }, adaptado: { D: number; I: number; S: number; C: number }) {
  const normalize = (score: number) => Math.round(((score + 50) / 100) * 100);
  
  const nD = normalize(natural.D);
  const nI = normalize(natural.I);
  const nS = normalize(natural.S);
  const nC = normalize(natural.C);
  
  const aD = normalize(adaptado.D);
  const aI = normalize(adaptado.I);
  const aS = normalize(adaptado.S);
  const aC = normalize(adaptado.C);

  return [
    { subject: 'Ousadia', A: Math.round(nD * 0.9 + nI * 0.1), B: Math.round(aD * 0.9 + aI * 0.1) },
    { subject: 'Comando', A: Math.round(nD * 0.85 + nC * 0.15), B: Math.round(aD * 0.85 + aC * 0.15) },
    { subject: 'Objetividade', A: Math.round(nD * 0.6 + nC * 0.4), B: Math.round(aD * 0.6 + aC * 0.4) },
    { subject: 'Assertividade', A: Math.round(nD * 0.7 + nI * 0.3), B: Math.round(aD * 0.7 + aI * 0.3) },
    { subject: 'Persuasão', A: Math.round(nI * 0.8 + nD * 0.2), B: Math.round(aI * 0.8 + aD * 0.2) },
    { subject: 'Extroversão', A: Math.round(nI * 0.85 + nS * 0.15), B: Math.round(aI * 0.85 + aS * 0.15) },
    { subject: 'Entusiasmo', A: Math.round(nI * 0.9 + nD * 0.1), B: Math.round(aI * 0.9 + aD * 0.1) },
    { subject: 'Sociabilidade', A: Math.round(nI * 0.7 + nS * 0.3), B: Math.round(aI * 0.7 + aS * 0.3) },
    { subject: 'Paciência', A: Math.round(nS * 0.9 + nC * 0.1), B: Math.round(aS * 0.9 + aC * 0.1) },
    { subject: 'Persistência', A: Math.round(nS * 0.7 + nD * 0.3), B: Math.round(aS * 0.7 + aD * 0.3) },
    { subject: 'Empatia', A: Math.round(nS * 0.8 + nI * 0.2), B: Math.round(aS * 0.8 + aI * 0.2) },
    { subject: 'Concentração', A: Math.round(nC * 0.8 + nS * 0.2), B: Math.round(aC * 0.8 + aS * 0.2) },
    { subject: 'Prudência', A: Math.round(nC * 0.85 + nS * 0.15), B: Math.round(aC * 0.85 + aS * 0.15) },
    { subject: 'Detalhismo', A: Math.round(nC * 0.9 + nD * 0.1), B: Math.round(aC * 0.9 + aD * 0.1) },
    { subject: 'Organização', A: Math.round(nC * 0.7 + nS * 0.3), B: Math.round(aC * 0.7 + aS * 0.3) },
    { subject: 'Planejamento', A: Math.round(nC * 0.75 + nD * 0.25), B: Math.round(aC * 0.75 + aD * 0.25) },
  ];
}

function generateLideranca(natural: { D: number; I: number; S: number; C: number }) {
  const normalize = (score: number) => Math.round(((score + 50) / 100) * 100);
  const total = normalize(natural.D) + normalize(natural.I) + normalize(natural.S) + normalize(natural.C);
  
  return [
    { name: 'Executivo', value: Math.round((normalize(natural.D) / total) * 100), color: '#FF6B6B' },
    { name: 'Motivador', value: Math.round((normalize(natural.I) / total) * 100), color: '#FFB84D' },
    { name: 'Facilitador', value: Math.round((normalize(natural.S) / total) * 100), color: '#51CF66' },
    { name: 'Metódico', value: Math.round((normalize(natural.C) / total) * 100), color: '#4DABF7' },
  ];
}

function generateValores(natural: { D: number; I: number; S: number; C: number }) {
  const normalize = (score: number) => Math.round(((score + 50) / 100) * 100);
  const nD = normalize(natural.D);
  const nI = normalize(natural.I);
  const nS = normalize(natural.S);
  const nC = normalize(natural.C);

  return [
    { name: 'Econômico', value: Math.round((nD * 0.4 + nC * 0.3 + nI * 0.2 + nS * 0.1) / 4), color: '#4CAF50' },
    { name: 'Político', value: Math.round((nD * 0.5 + nI * 0.3 + nC * 0.15 + nS * 0.05) / 4), color: '#F44336' },
    { name: 'Social', value: Math.round((nS * 0.4 + nI * 0.4 + nC * 0.1 + nD * 0.1) / 4), color: '#2196F3' },
    { name: 'Teórico', value: Math.round((nC * 0.5 + nD * 0.2 + nS * 0.2 + nI * 0.1) / 4), color: '#9C27B0' },
    { name: 'Estético', value: Math.round((nI * 0.4 + nS * 0.3 + nC * 0.2 + nD * 0.1) / 4), color: '#FF9800' },
    { name: 'Tradicional', value: Math.round((nS * 0.5 + nC * 0.3 + nI * 0.1 + nD * 0.1) / 4), color: '#795548' },
  ].sort((a, b) => b.value - a.value);
}

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CandidateData {
  id?: string;
  nome_completo: string;
  telefone_whatsapp: string;
  cargo_atual: string;
  empresa_instagram: string;
}

interface ProfileScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

interface ProfileData {
  nome: string;
  descricaoCurta: string;
  descricaoCompleta: string;
  potencialidades: string[];
  relacoesInterpessoais: string;
  tomadaDecisao: string;
  motivadores: {
    principal: string;
    secundario: string;
  };
  medos: string[];
  melhorAdequacao: string;
  pontosDesenvolver: string[];
  comunicacao: {
    comoComunicar: string;
    comoReceber: string;
  };
  planoAcao: string[];
  cargosIdeais: string[];
}

// VEON Brand Colors
const VEON_COLORS = {
  azulEscuro: [27, 59, 95] as [number, number, number],
  azulMedio: [44, 82, 130] as [number, number, number],
  vermelho: [227, 30, 36] as [number, number, number],
  roxo: [107, 59, 140] as [number, number, number],
  branco: [255, 255, 255] as [number, number, number],
  cinzaClaro: [247, 250, 252] as [number, number, number],
  cinzaTexto: [74, 85, 104] as [number, number, number],
  discD: [227, 30, 36] as [number, number, number],
  discI: [245, 158, 11] as [number, number, number],
  discS: [34, 197, 94] as [number, number, number],
  discC: [59, 130, 246] as [number, number, number],
};

// Helper function to draw gradient background (simulated with rectangles)
function drawGradientBackground(pdf: jsPDF, width: number, height: number) {
  const steps = 50;
  for (let i = 0; i < steps; i++) {
    const progress = i / steps;
    const r = Math.round(VEON_COLORS.roxo[0] * (1 - progress) + VEON_COLORS.azulMedio[0] * progress);
    const g = Math.round(VEON_COLORS.roxo[1] * (1 - progress) + VEON_COLORS.azulMedio[1] * progress);
    const b = Math.round(VEON_COLORS.roxo[2] * (1 - progress) + VEON_COLORS.azulMedio[2] * progress);
    pdf.setFillColor(r, g, b);
    pdf.rect(0, (height / steps) * i, width, height / steps + 1, 'F');
  }
}

// Helper to normalize DISC scores from -25/+25 to percentage
function normalizeScore(score: number): number {
  return Math.round(((score + 25) / 50) * 100);
}

// Helper to draw bar chart
function drawBarChart(
  pdf: jsPDF, 
  scores: ProfileScores, 
  x: number, 
  y: number, 
  title: string,
  subtitle: string
) {
  const barHeight = 12;
  const barSpacing = 20;
  const maxBarWidth = 100;
  const labelWidth = 50;
  
  // Section header
  pdf.setFillColor(...VEON_COLORS.azulEscuro);
  pdf.roundedRect(x - 5, y - 8, 180, 22, 3, 3, 'F');
  pdf.setTextColor(...VEON_COLORS.branco);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, x, y + 3);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(subtitle, x, y + 11);
  
  y += 30;
  
  const factors = [
    { label: 'D - Dominância', key: 'D' as keyof ProfileScores, color: VEON_COLORS.discD },
    { label: 'I - Influência', key: 'I' as keyof ProfileScores, color: VEON_COLORS.discI },
    { label: 'S - Estabilidade', key: 'S' as keyof ProfileScores, color: VEON_COLORS.discS },
    { label: 'C - Conformidade', key: 'C' as keyof ProfileScores, color: VEON_COLORS.discC },
  ];
  
  factors.forEach((factor, index) => {
    const barY = y + (index * barSpacing);
    const normalizedValue = normalizeScore(scores[factor.key]);
    const barWidth = (normalizedValue / 100) * maxBarWidth;
    
    // Label
    pdf.setTextColor(...VEON_COLORS.cinzaTexto);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(factor.label, x, barY + 3);
    
    // Background bar
    pdf.setFillColor(230, 230, 230);
    pdf.roundedRect(x + labelWidth, barY - 4, maxBarWidth, barHeight, 2, 2, 'F');
    
    // Value bar
    pdf.setFillColor(...factor.color);
    pdf.roundedRect(x + labelWidth, barY - 4, barWidth, barHeight, 2, 2, 'F');
    
    // Value text
    pdf.setTextColor(...VEON_COLORS.cinzaTexto);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${normalizedValue}%`, x + labelWidth + maxBarWidth + 5, barY + 3);
  });
  
  return y + (factors.length * barSpacing);
}

export async function generatePDF(
  candidate: CandidateData,
  naturalProfile: ProfileScores,
  adaptedProfile: ProfileScores,
  profile: ProfileData,
  chartElement: HTMLElement | null,
  returnBlob: boolean = false
): Promise<{ blob: Blob; fileName: string } | void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // ========================================
  // PÁGINA 1 - CAPA
  // ========================================
  
  // Gradient background
  drawGradientBackground(pdf, pageWidth, pageHeight);
  
  // Logo area - white circle with compass icon simulation
  pdf.setFillColor(...VEON_COLORS.branco);
  pdf.circle(pageWidth / 2, 70, 25, 'F');
  
  // Compass icon (simplified representation)
  pdf.setFillColor(...VEON_COLORS.azulEscuro);
  pdf.circle(pageWidth / 2, 70, 20, 'F');
  pdf.setFillColor(...VEON_COLORS.branco);
  pdf.circle(pageWidth / 2, 70, 15, 'F');
  
  // Compass needle simulation
  pdf.setFillColor(...VEON_COLORS.azulEscuro);
  // Triangle pointing up
  pdf.triangle(pageWidth / 2, 55, pageWidth / 2 - 5, 75, pageWidth / 2 + 5, 75, 'F');
  
  // "INSTITUTO VEON" text
  pdf.setTextColor(...VEON_COLORS.branco);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INSTITUTO', pageWidth / 2, 110, { align: 'center' });
  pdf.setFontSize(28);
  pdf.text('VEON', pageWidth / 2, 122, { align: 'center' });
  
  // Divider line
  pdf.setDrawColor(...VEON_COLORS.branco);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth / 2 + 40, 105, pageWidth / 2 + 40, 125);
  
  // "Escola do Varejo"
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Escola do Varejo', pageWidth / 2 + 70, 117, { align: 'center' });
  
  // Main title section
  pdf.setDrawColor(...VEON_COLORS.branco);
  pdf.setLineWidth(0.3);
  pdf.line(55, 145, 155, 145);
  
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RELATÓRIO DE PERFIL', pageWidth / 2, 165, { align: 'center' });
  pdf.text('COMPORTAMENTAL DISC', pageWidth / 2, 178, { align: 'center' });
  
  pdf.line(55, 190, 155, 190);
  
  // Candidate info
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text(candidate.nome_completo, pageWidth / 2, 210, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text(new Date().toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  }), pageWidth / 2, 222, { align: 'center' });
  
  // Motivational phrase
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'italic');
  pdf.text('"A bússola que aponta', pageWidth / 2, 255, { align: 'center' });
  pdf.text('para o sucesso"', pageWidth / 2, 265, { align: 'center' });

  // ========================================
  // PÁGINA 2 - PERFIL NATURAL
  // ========================================
  pdf.addPage();
  
  // Header
  pdf.setFillColor(...VEON_COLORS.azulEscuro);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  pdf.setFillColor(...VEON_COLORS.vermelho);
  pdf.rect(0, 35, pageWidth, 3, 'F');
  
  pdf.setTextColor(...VEON_COLORS.branco);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PERFIL NATURAL', margin, 18);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Como você realmente é em sua essência', margin, 28);
  
  let yPos = 55;
  
  // Bar chart for natural profile
  yPos = drawBarChart(pdf, naturalProfile, margin, yPos, 'PONTUAÇÃO DISC - NATURAL', 'Seu comportamento em situações naturais');
  
  yPos += 15;
  
  // Profile identified box
  pdf.setFillColor(...VEON_COLORS.vermelho);
  pdf.roundedRect(margin, yPos, contentWidth, 18, 4, 4, 'F');
  pdf.setTextColor(...VEON_COLORS.branco);
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`PERFIL IDENTIFICADO: ${profile.nome.toUpperCase()}`, pageWidth / 2, yPos + 12, { align: 'center' });
  
  yPos += 30;
  
  // Características principais
  pdf.setTextColor(...VEON_COLORS.azulEscuro);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CARACTERÍSTICAS PRINCIPAIS', margin, yPos);
  
  yPos += 8;
  pdf.setTextColor(...VEON_COLORS.cinzaTexto);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const descLines = pdf.splitTextToSize(profile.descricaoCompleta, contentWidth);
  pdf.text(descLines, margin, yPos);
  yPos += descLines.length * 5 + 10;
  
  // Pontos fortes (potencialidades)
  pdf.setTextColor(...VEON_COLORS.azulEscuro);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PONTOS FORTES', margin, yPos);
  
  yPos += 7;
  pdf.setTextColor(...VEON_COLORS.cinzaTexto);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const pontosFortes = profile.potencialidades.slice(0, 4);
  pontosFortes.forEach((ponto) => {
    pdf.text(`• ${ponto}`, margin + 3, yPos);
    yPos += 6;
  });
  
  yPos += 8;
  
  // Pontos de atenção
  pdf.setTextColor(...VEON_COLORS.vermelho);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PONTOS DE ATENÇÃO', margin, yPos);
  
  yPos += 7;
  pdf.setTextColor(...VEON_COLORS.cinzaTexto);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const pontosAtencao = profile.pontosDesenvolver.slice(0, 3);
  pontosAtencao.forEach((ponto) => {
    pdf.text(`• ${ponto}`, margin + 3, yPos);
    yPos += 6;
  });

  // ========================================
  // PÁGINA 3 - PERFIL ADAPTADO
  // ========================================
  pdf.addPage();
  
  // Header
  pdf.setFillColor(...VEON_COLORS.azulEscuro);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  pdf.setFillColor(...VEON_COLORS.vermelho);
  pdf.rect(0, 35, pageWidth, 3, 'F');
  
  pdf.setTextColor(...VEON_COLORS.branco);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PERFIL ADAPTADO', margin, 18);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Como você age no ambiente de trabalho', margin, 28);
  
  yPos = 55;
  
  // Bar chart for adapted profile
  yPos = drawBarChart(pdf, adaptedProfile, margin, yPos, 'PONTUAÇÃO DISC - ADAPTADO', 'Seu comportamento em situações profissionais');
  
  yPos += 15;
  
  // Comparison box
  pdf.setFillColor(...VEON_COLORS.cinzaClaro);
  pdf.roundedRect(margin, yPos, contentWidth, 50, 4, 4, 'F');
  
  pdf.setTextColor(...VEON_COLORS.azulEscuro);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ADAPTAÇÃO OBSERVADA', margin + 5, yPos + 12);
  
  pdf.setTextColor(...VEON_COLORS.cinzaTexto);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const adaptText = 'Você adapta seu comportamento no ambiente profissional para atender às demandas do trabalho. Esta diferença entre perfil natural e adaptado indica como você se ajusta às expectativas do cargo.';
  const adaptLines = pdf.splitTextToSize(adaptText, contentWidth - 10);
  pdf.text(adaptLines, margin + 5, yPos + 22);
  
  yPos += 60;
  
  // Diferenças Natural vs Adaptado
  pdf.setTextColor(...VEON_COLORS.azulEscuro);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DIFERENÇAS NATURAL vs ADAPTADO', margin, yPos);
  
  yPos += 10;
  
  const factors = [
    { key: 'D' as keyof ProfileScores, name: 'Dominância', color: VEON_COLORS.discD },
    { key: 'I' as keyof ProfileScores, name: 'Influência', color: VEON_COLORS.discI },
    { key: 'S' as keyof ProfileScores, name: 'Estabilidade', color: VEON_COLORS.discS },
    { key: 'C' as keyof ProfileScores, name: 'Conformidade', color: VEON_COLORS.discC },
  ];
  
  factors.forEach((factor, index) => {
    const naturalNorm = normalizeScore(naturalProfile[factor.key]);
    const adaptedNorm = normalizeScore(adaptedProfile[factor.key]);
    const diff = adaptedNorm - naturalNorm;
    const diffText = diff > 0 ? `+${diff}` : `${diff}`;
    const interpretation = diff > 10 ? '(mais no trabalho)' : diff < -10 ? '(menos no trabalho)' : '(similar)';
    
    pdf.setFillColor(...factor.color);
    pdf.circle(margin + 5, yPos + 2, 4, 'F');
    
    pdf.setTextColor(...VEON_COLORS.cinzaTexto);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(factor.name, margin + 12, yPos + 4);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${diffText} pontos ${interpretation}`, margin + 50, yPos + 4);
    
    yPos += 12;
  });
  
  yPos += 15;
  
  // Relações Interpessoais
  pdf.setTextColor(...VEON_COLORS.azulEscuro);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RELAÇÕES INTERPESSOAIS', margin, yPos);
  
  yPos += 8;
  pdf.setTextColor(...VEON_COLORS.cinzaTexto);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const relLines = pdf.splitTextToSize(profile.relacoesInterpessoais, contentWidth);
  pdf.text(relLines, margin, yPos);

  // ========================================
  // PÁGINA 4 - RECOMENDAÇÕES
  // ========================================
  pdf.addPage();
  
  // Header
  pdf.setFillColor(...VEON_COLORS.azulEscuro);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  pdf.setFillColor(...VEON_COLORS.vermelho);
  pdf.rect(0, 35, pageWidth, 3, 'F');
  
  pdf.setTextColor(...VEON_COLORS.branco);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RECOMENDAÇÕES PROFISSIONAIS', margin, 18);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Direcionamento para desenvolvimento e carreira', margin, 28);
  
  yPos = 55;
  
  // Funções Ideais
  pdf.setFillColor(...VEON_COLORS.roxo);
  pdf.roundedRect(margin, yPos - 5, contentWidth, 8, 2, 2, 'F');
  pdf.setTextColor(...VEON_COLORS.branco);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('FUNÇÕES IDEAIS', margin + 5, yPos + 1);
  
  yPos += 12;
  pdf.setTextColor(...VEON_COLORS.cinzaTexto);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  profile.cargosIdeais.slice(0, 6).forEach((cargo) => {
    pdf.text(`• ${cargo}`, margin + 5, yPos);
    yPos += 6;
  });
  
  yPos += 10;
  
  // Trabalho em Equipe
  pdf.setFillColor(...VEON_COLORS.roxo);
  pdf.roundedRect(margin, yPos - 5, contentWidth, 8, 2, 2, 'F');
  pdf.setTextColor(...VEON_COLORS.branco);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TRABALHO EM EQUIPE', margin + 5, yPos + 1);
  
  yPos += 12;
  pdf.setTextColor(...VEON_COLORS.cinzaTexto);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const teamLines = pdf.splitTextToSize(profile.melhorAdequacao, contentWidth - 10);
  pdf.text(teamLines, margin + 5, yPos);
  yPos += teamLines.length * 5 + 10;
  
  // Desenvolvimento Sugerido
  pdf.setFillColor(...VEON_COLORS.roxo);
  pdf.roundedRect(margin, yPos - 5, contentWidth, 8, 2, 2, 'F');
  pdf.setTextColor(...VEON_COLORS.branco);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DESENVOLVIMENTO SUGERIDO', margin + 5, yPos + 1);
  
  yPos += 12;
  pdf.setTextColor(...VEON_COLORS.cinzaTexto);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  profile.planoAcao.slice(0, 4).forEach((acao, index) => {
    pdf.setFillColor(...VEON_COLORS.azulEscuro);
    pdf.circle(margin + 5, yPos - 1, 3, 'F');
    pdf.setTextColor(...VEON_COLORS.branco);
    pdf.setFontSize(8);
    pdf.text(`${index + 1}`, margin + 5, yPos, { align: 'center' });
    
    pdf.setTextColor(...VEON_COLORS.cinzaTexto);
    pdf.setFontSize(10);
    const acaoLines = pdf.splitTextToSize(acao, contentWidth - 20);
    pdf.text(acaoLines, margin + 12, yPos);
    yPos += acaoLines.length * 5 + 5;
  });
  
  yPos += 10;
  
  // Cursos Recomendados VEON
  pdf.setFillColor(...VEON_COLORS.vermelho);
  pdf.roundedRect(margin, yPos - 5, contentWidth, 8, 2, 2, 'F');
  pdf.setTextColor(...VEON_COLORS.branco);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CURSOS RECOMENDADOS VEON', margin + 5, yPos + 1);
  
  yPos += 12;
  pdf.setTextColor(...VEON_COLORS.cinzaTexto);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const cursosVeon = [
    'Liderança em Vendas',
    'Gestão de Relacionamentos',
    'High Performance Team',
    'Comunicação Assertiva'
  ];
  
  cursosVeon.forEach((curso) => {
    pdf.text(`• ${curso}`, margin + 5, yPos);
    yPos += 6;
  });
  
  // Footer block with VEON branding
  pdf.setFillColor(...VEON_COLORS.azulEscuro);
  pdf.roundedRect(margin, pageHeight - 55, contentWidth, 35, 4, 4, 'F');
  
  pdf.setTextColor(...VEON_COLORS.branco);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Instituto VEON', margin + 10, pageHeight - 40);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Escola do Varejo', margin + 10, pageHeight - 32);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text('"A bússola que aponta para o sucesso"', margin + 10, pageHeight - 24);

  // ========================================
  // FOOTER EM TODAS AS PÁGINAS
  // ========================================
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Skip cover page footer styling
    if (i > 1) {
      pdf.setFillColor(...VEON_COLORS.azulEscuro);
      pdf.rect(0, pageHeight - 12, pageWidth, 12, 'F');
      pdf.setTextColor(...VEON_COLORS.branco);
      pdf.setFontSize(8);
      pdf.text('Instituto VEON - Escola do Varejo | Análise Comportamental DISC', margin, pageHeight - 4);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 4, { align: 'right' });
    }
  }

  // Save the PDF
  const fileName = `Perfil-DISC-${candidate.nome_completo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  if (returnBlob) {
    const pdfBlob = pdf.output('blob');
    return { blob: pdfBlob, fileName };
  }
  
  pdf.save(fileName);
}

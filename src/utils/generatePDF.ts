import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CandidateData {
  nome: string;
  telefone: string;
  empresa: string;
  cargoAtual: string;
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

export async function generatePDF(
  candidate: CandidateData,
  naturalProfile: ProfileScores,
  adaptedProfile: ProfileScores,
  profile: ProfileData,
  chartElement: HTMLElement | null
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  const colors = {
    veonBlue: [30, 58, 138] as [number, number, number],
    veonRed: [217, 37, 29] as [number, number, number],
    textDark: [31, 41, 55] as [number, number, number],
    textMuted: [107, 114, 128] as [number, number, number],
    bgLight: [248, 250, 252] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    discD: [239, 68, 68] as [number, number, number],
    discI: [234, 179, 8] as [number, number, number],
    discS: [34, 197, 94] as [number, number, number],
    discC: [59, 130, 246] as [number, number, number],
  };

  const addNewPage = () => {
    pdf.addPage();
    yPosition = margin;
  };

  const checkPageBreak = (height: number) => {
    if (yPosition + height > pageHeight - margin) {
      addNewPage();
      return true;
    }
    return false;
  };

  // Header with gradient background
  pdf.setFillColor(...colors.veonBlue);
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  // Accent line
  pdf.setFillColor(...colors.veonRed);
  pdf.rect(0, 50, pageWidth, 3, 'F');

  // Title
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Relatório de Perfil Comportamental DISC', margin, 25);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Instituto VEON - "Eu sou a bússola que aponta para o sucesso!"', margin, 35);
  
  pdf.setFontSize(10);
  pdf.text(`Avaliação realizada em ${new Date().toLocaleDateString('pt-BR')}`, margin, 45);

  yPosition = 65;

  // Candidate Information Box
  pdf.setFillColor(...colors.bgLight);
  pdf.roundedRect(margin, yPosition, contentWidth, 35, 3, 3, 'F');
  
  pdf.setTextColor(...colors.veonBlue);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Informações do Candidato', margin + 5, yPosition + 8);

  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Nome: ${candidate.nome}`, margin + 5, yPosition + 18);
  pdf.text(`Telefone: ${candidate.telefone}`, margin + 5, yPosition + 25);
  pdf.text(`Empresa: ${candidate.empresa}`, margin + 90, yPosition + 18);
  pdf.text(`Cargo: ${candidate.cargoAtual}`, margin + 90, yPosition + 25);

  yPosition += 45;

  // Profile Name Section
  pdf.setFillColor(...colors.veonBlue);
  pdf.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F');
  
  pdf.setTextColor(...colors.white);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(profile.nome, margin + 5, yPosition + 10);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(profile.descricaoCurta, margin + 5, yPosition + 18);

  yPosition += 35;

  // DISC Scores Table
  pdf.setTextColor(...colors.veonBlue);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Pontuação DISC', margin, yPosition);

  yPosition += 8;

  const scoreBoxWidth = (contentWidth - 15) / 4;
  const scoreLabels = ['D', 'I', 'S', 'C'];
  const scoreColors = [colors.discD, colors.discI, colors.discS, colors.discC];
  const scoreNames = ['Dominância', 'Influência', 'Estabilidade', 'Conformidade'];
  const naturalScores = [naturalProfile.D, naturalProfile.I, naturalProfile.S, naturalProfile.C];
  const adaptedScores = [adaptedProfile.D, adaptedProfile.I, adaptedProfile.S, adaptedProfile.C];

  scoreLabels.forEach((label, index) => {
    const xPos = margin + (index * (scoreBoxWidth + 5));
    
    pdf.setFillColor(...scoreColors[index]);
    pdf.roundedRect(xPos, yPosition, scoreBoxWidth, 30, 2, 2, 'F');
    
    pdf.setTextColor(...colors.white);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, xPos + scoreBoxWidth / 2, yPosition + 12, { align: 'center' });
    
    pdf.setFontSize(8);
    pdf.text(scoreNames[index], xPos + scoreBoxWidth / 2, yPosition + 19, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.text(`N: ${naturalScores[index]}% | A: ${adaptedScores[index]}%`, xPos + scoreBoxWidth / 2, yPosition + 27, { align: 'center' });
  });

  yPosition += 40;

  // Capture chart if available
  if (chartElement) {
    try {
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 80;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      checkPageBreak(imgHeight + 10);
      
      pdf.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 15;
    } catch (error) {
      console.log('Could not capture chart');
    }
  }

  // Description
  checkPageBreak(40);
  pdf.setTextColor(...colors.veonBlue);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Descrição do Perfil', margin, yPosition);

  yPosition += 7;
  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const descriptionLines = pdf.splitTextToSize(profile.descricaoCompleta, contentWidth);
  pdf.text(descriptionLines, margin, yPosition);
  yPosition += descriptionLines.length * 5 + 10;

  // New page for detailed sections
  addNewPage();

  // Potencialidades
  pdf.setTextColor(...colors.veonBlue);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Potencialidades', margin, yPosition);

  yPosition += 7;
  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  profile.potencialidades.forEach((item, index) => {
    checkPageBreak(7);
    pdf.text(`• ${item}`, margin + 3, yPosition);
    yPosition += 6;
  });

  yPosition += 8;

  // Pontos a Desenvolver
  checkPageBreak(20);
  pdf.setTextColor(...colors.veonBlue);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Pontos a Desenvolver', margin, yPosition);

  yPosition += 7;
  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  profile.pontosDesenvolver.forEach((item) => {
    checkPageBreak(7);
    pdf.text(`• ${item}`, margin + 3, yPosition);
    yPosition += 6;
  });

  yPosition += 8;

  // Relações Interpessoais
  checkPageBreak(30);
  pdf.setTextColor(...colors.veonBlue);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Relações Interpessoais', margin, yPosition);

  yPosition += 7;
  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const relLines = pdf.splitTextToSize(profile.relacoesInterpessoais, contentWidth);
  pdf.text(relLines, margin, yPosition);
  yPosition += relLines.length * 5 + 10;

  // Tomada de Decisão
  checkPageBreak(30);
  pdf.setTextColor(...colors.veonBlue);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tomada de Decisão', margin, yPosition);

  yPosition += 7;
  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const decLines = pdf.splitTextToSize(profile.tomadaDecisao, contentWidth);
  pdf.text(decLines, margin, yPosition);
  yPosition += decLines.length * 5 + 10;

  // Motivadores
  checkPageBreak(40);
  pdf.setTextColor(...colors.veonBlue);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Motivadores', margin, yPosition);

  yPosition += 7;
  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Principal:', margin + 3, yPosition);
  pdf.setFont('helvetica', 'normal');
  const motivadorPrincipalLines = pdf.splitTextToSize(profile.motivadores.principal, contentWidth - 25);
  pdf.text(motivadorPrincipalLines, margin + 25, yPosition);
  yPosition += motivadorPrincipalLines.length * 5 + 3;

  pdf.setFont('helvetica', 'bold');
  pdf.text('Secundário:', margin + 3, yPosition);
  pdf.setFont('helvetica', 'normal');
  const motivadorSecundarioLines = pdf.splitTextToSize(profile.motivadores.secundario, contentWidth - 25);
  pdf.text(motivadorSecundarioLines, margin + 30, yPosition);
  yPosition += motivadorSecundarioLines.length * 5 + 10;

  // Medos
  checkPageBreak(30);
  pdf.setTextColor(...colors.veonBlue);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Medos e Receios', margin, yPosition);

  yPosition += 7;
  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  profile.medos.forEach((item) => {
    checkPageBreak(7);
    pdf.text(`• ${item}`, margin + 3, yPosition);
    yPosition += 6;
  });

  yPosition += 8;

  // New page for professional info
  addNewPage();

  // Melhor Adequação Profissional
  pdf.setTextColor(...colors.veonBlue);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Melhor Adequação Profissional', margin, yPosition);

  yPosition += 7;
  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const adequacaoLines = pdf.splitTextToSize(profile.melhorAdequacao, contentWidth);
  pdf.text(adequacaoLines, margin, yPosition);
  yPosition += adequacaoLines.length * 5 + 8;

  // Cargos Ideais
  pdf.setTextColor(...colors.veonBlue);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Cargos Ideais:', margin, yPosition);

  yPosition += 6;
  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(profile.cargosIdeais.join(' | '), margin + 3, yPosition);
  yPosition += 15;

  // Comunicação
  checkPageBreak(50);
  pdf.setTextColor(...colors.veonBlue);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Sugestões de Comunicação', margin, yPosition);

  yPosition += 8;
  pdf.setFillColor(...colors.bgLight);
  pdf.roundedRect(margin, yPosition, contentWidth / 2 - 5, 45, 2, 2, 'F');
  pdf.roundedRect(margin + contentWidth / 2 + 5, yPosition, contentWidth / 2 - 5, 45, 2, 2, 'F');

  pdf.setTextColor(...colors.veonBlue);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Como Comunicar com Este Perfil', margin + 3, yPosition + 8);
  pdf.text('Como Este Perfil Recebe', margin + contentWidth / 2 + 8, yPosition + 8);

  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  const comunicarLines = pdf.splitTextToSize(profile.comunicacao.comoComunicar, contentWidth / 2 - 15);
  pdf.text(comunicarLines, margin + 3, yPosition + 15);
  
  const receberLines = pdf.splitTextToSize(profile.comunicacao.comoReceber, contentWidth / 2 - 15);
  pdf.text(receberLines, margin + contentWidth / 2 + 8, yPosition + 15);

  yPosition += 55;

  // Plano de Ação
  checkPageBreak(60);
  pdf.setTextColor(...colors.veonBlue);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Plano de Ação para Desenvolvimento', margin, yPosition);

  yPosition += 8;
  pdf.setTextColor(...colors.textDark);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  profile.planoAcao.forEach((item, index) => {
    checkPageBreak(12);
    pdf.setFillColor(...colors.veonBlue);
    pdf.circle(margin + 3, yPosition - 1.5, 3, 'F');
    pdf.setTextColor(...colors.white);
    pdf.setFontSize(8);
    pdf.text(`${index + 1}`, margin + 3, yPosition, { align: 'center' });
    
    pdf.setTextColor(...colors.textDark);
    pdf.setFontSize(10);
    const actionLines = pdf.splitTextToSize(item, contentWidth - 15);
    pdf.text(actionLines, margin + 10, yPosition);
    yPosition += actionLines.length * 5 + 5;
  });

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFillColor(...colors.veonBlue);
    pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    pdf.setTextColor(...colors.white);
    pdf.setFontSize(8);
    pdf.text('Instituto VEON - Análise Comportamental DISC', margin, pageHeight - 6);
    pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  // Save the PDF
  const fileName = `Relatorio_DISC_${candidate.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}

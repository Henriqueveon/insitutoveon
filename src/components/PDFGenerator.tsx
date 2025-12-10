import React, { useRef, useState, ReactNode } from 'react';
import html2pdf from 'html2pdf.js';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// VEON Brand Colors
const VEON_COLORS = {
  azul: '#003366',
  azulEscuro: '#001a33',
  vermelho: '#E31E24',
  branco: '#FFFFFF',
  cinzaClaro: '#F5F5F5',
  cinzaMedio: '#6B7280',
  preto: '#1F2937',
};

interface PDFGeneratorProps {
  candidatoNome: string;
  children: ReactNode;
  onPDFGenerated?: (blob: Blob, fileName: string) => void;
}

// Cover Page Component with VEON Branding
const CapaPDF = ({ candidatoNome, data }: { candidatoNome: string; data: string }) => (
  <div 
    className="pdf-capa"
    style={{
      minHeight: '297mm',
      width: '210mm',
      background: `linear-gradient(135deg, ${VEON_COLORS.azul} 0%, ${VEON_COLORS.azulEscuro} 100%)`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: VEON_COLORS.branco,
      textAlign: 'center',
      padding: '40px',
      position: 'relative',
      pageBreakAfter: 'always',
      boxSizing: 'border-box',
    }}
  >
    {/* Boat Icon SVG (White) */}
    <svg 
      width="140" 
      height="140" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginBottom: '30px' }}
    >
      {/* Sail */}
      <path 
        d="M12 2L6 12h12L12 2z" 
        fill={VEON_COLORS.branco}
        stroke={VEON_COLORS.vermelho}
        strokeWidth="0.5"
      />
      {/* Mast */}
      <line 
        x1="12" 
        y1="2" 
        x2="12" 
        y2="14" 
        stroke={VEON_COLORS.branco}
        strokeWidth="1"
      />
      {/* Hull */}
      <path 
        d="M4 14c0 0 2-2 4-2s4 2 4 2 2-2 4-2 4 2 4 2v2c-1 1-3 2-8 2s-7-1-8-2v-2z" 
        fill={VEON_COLORS.branco}
      />
      {/* Waves */}
      <path 
        d="M2 18c1-.5 2-1 3-1s2 .5 3 1 2 1 3 1 2-.5 3-1 2-.5 3-1 2 .5 3 1" 
        stroke={VEON_COLORS.branco}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path 
        d="M2 21c1-.5 2-1 3-1s2 .5 3 1 2 1 3 1 2-.5 3-1 2-.5 3-1 2 .5 3 1" 
        stroke={VEON_COLORS.branco}
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>

    {/* Top Divider (VEON Red) */}
    <div style={{
      width: '250px',
      height: '3px',
      background: VEON_COLORS.vermelho,
      marginBottom: '40px',
      boxShadow: `0 0 15px ${VEON_COLORS.vermelho}60`,
    }} />

    {/* Title */}
    <h1 style={{
      fontSize: '32pt',
      fontWeight: 'bold',
      marginBottom: '10px',
      fontFamily: 'Inter, Poppins, sans-serif',
      lineHeight: '1.3',
      color: VEON_COLORS.branco,
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      letterSpacing: '2px',
    }}>
      RELATÓRIO DE PERFIL
    </h1>
    <h2 style={{
      fontSize: '28pt',
      fontWeight: 'bold',
      marginBottom: '0',
      fontFamily: 'Inter, Poppins, sans-serif',
      lineHeight: '1.3',
      color: VEON_COLORS.branco,
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      letterSpacing: '2px',
    }}>
      COMPORTAMENTAL DISC
    </h2>

    {/* Bottom Divider (VEON Red) */}
    <div style={{
      width: '250px',
      height: '3px',
      background: VEON_COLORS.vermelho,
      marginTop: '40px',
      marginBottom: '40px',
      boxShadow: `0 0 15px ${VEON_COLORS.vermelho}60`,
    }} />

    {/* Motivational phrase */}
    <p style={{
      fontSize: '16pt',
      fontStyle: 'italic',
      marginBottom: '80px',
      fontFamily: 'Inter, Poppins, sans-serif',
      color: VEON_COLORS.branco,
      letterSpacing: '0.5px',
      opacity: 0.95,
    }}>
      "A bússola que aponta para o sucesso"
    </p>

    {/* Candidate name */}
    <p style={{
      fontSize: '22pt',
      fontWeight: '600',
      marginBottom: '12px',
      fontFamily: 'Inter, Poppins, sans-serif',
      color: VEON_COLORS.branco,
    }}>
      {candidatoNome}
    </p>

    {/* Date */}
    <p style={{
      fontSize: '12pt',
      fontFamily: 'Inter, Poppins, sans-serif',
      color: VEON_COLORS.branco,
      opacity: '0.85',
    }}>
      {data}
    </p>

    {/* Discrete footer (bottom right corner) */}
    <div style={{
      position: 'absolute',
      bottom: '30px',
      right: '30px',
      fontSize: '10pt',
      opacity: '0.7',
      textAlign: 'right',
      fontFamily: 'Inter, Poppins, sans-serif',
      color: VEON_COLORS.branco,
      lineHeight: '1.5',
    }}>
      Instituto VEON<br/>
      <span style={{ fontSize: '8pt' }}>A Escola do Varejo</span>
    </div>
  </div>
);

export const PDFGenerator = ({ candidatoNome, children, onPDFGenerated }: PDFGeneratorProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [gerando, setGerando] = useState(false);

  const gerarPDF = async () => {
    if (!reportRef.current) return;
    
    setGerando(true);
    
    try {
      const element = reportRef.current;
      const fileName = `relatorio-veon-${candidatoNome.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      const options = {
        margin: [0, 0, 0, 0] as [number, number, number, number],
        filename: fileName,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          scrollY: 0,
          windowWidth: element.scrollWidth,
        },
        jsPDF: { 
          unit: 'mm' as const, 
          format: 'a4' as const, 
          orientation: 'portrait' as const,
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: '.no-break',
        },
      };

      // Hide elements with .no-print class
      const elementosOcultar = element.querySelectorAll('.no-print');
      elementosOcultar.forEach(el => (el as HTMLElement).style.display = 'none');

      // Generate PDF as blob
      const pdfBlob = await html2pdf().set(options).from(element).outputPdf('blob');

      // Restore hidden elements
      elementosOcultar.forEach(el => (el as HTMLElement).style.display = '');

      // Call callback if provided
      if (onPDFGenerated) {
        onPDFGenerated(pdfBlob, fileName);
      }

      // Upload to Supabase Storage
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('teste')
          .upload(`pdfs/${fileName}`, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('teste')
            .getPublicUrl(`pdfs/${fileName}`);

          const pdfUrl = urlData.publicUrl;
          console.log('📤 PDF uploaded to:', pdfUrl);

          // Update Notion with PDF URL
          const notionPageId = localStorage.getItem('candidato_notion_id');
          if (notionPageId && pdfUrl) {
            await supabase.functions.invoke('notion-sync', {
              body: {
                action: 'update_pdf',
                data: { notionPageId, pdfUrl },
              },
            });
          }
        }
      } catch (uploadErr) {
        console.warn('Upload error (non-blocking):', uploadErr);
      }

      // Trigger download
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.success('PDF gerado com sucesso!');
      console.log('✅ PDF gerado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setGerando(false);
    }
  };

  const dataFormatada = new Date().toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <>
      {/* Download PDF Button (VEON colors) */}
      <Button
        onClick={gerarPDF}
        disabled={gerando}
        className="no-print fixed top-4 right-4 z-50 gap-2 shadow-lg"
        style={{
          backgroundColor: gerando ? '#c01a1f' : VEON_COLORS.vermelho,
          color: VEON_COLORS.branco,
        }}
      >
        {gerando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Gerando PDF...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Baixar PDF
          </>
        )}
      </Button>

      {/* Report Container */}
      <div ref={reportRef} className="pdf-container">
        {/* Custom VEON Cover */}
        <CapaPDF 
          candidatoNome={candidatoNome} 
          data={dataFormatada}
        />

        {/* Report content (provided via children) */}
        <div className="pdf-content bg-white">
          {children}
        </div>
      </div>
    </>
  );
};

export default PDFGenerator;

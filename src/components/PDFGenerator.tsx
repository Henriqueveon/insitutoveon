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

// Cover Page Component - TEXT ONLY (no logos, icons, or images)
const CapaPDF = ({ candidatoNome, data }: { candidatoNome: string; data: string }) => (
  <div 
    className="pdf-capa"
    style={{
      minHeight: '297mm',
      width: '210mm',
      background: 'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#FFFFFF',
      textAlign: 'center',
      padding: '60px 40px',
      position: 'relative',
      pageBreakAfter: 'always',
      boxSizing: 'border-box',
    }}
  >
    {/* Top decorative line (white) */}
    <div style={{
      width: '256px',
      height: '4px',
      background: '#FFFFFF',
      marginBottom: '48px',
      opacity: 0.8,
      borderRadius: '2px',
    }} />

    {/* Main Title */}
    <h1 style={{
      fontSize: '48pt',
      fontWeight: 'bold',
      marginBottom: '8px',
      fontFamily: 'Inter, Poppins, sans-serif',
      lineHeight: '1.15',
      color: '#FFFFFF',
      textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
      letterSpacing: '-0.5px',
    }}>
      RELATÓRIO DE PERFIL
    </h1>
    <h1 style={{
      fontSize: '48pt',
      fontWeight: 'bold',
      marginBottom: '0',
      fontFamily: 'Inter, Poppins, sans-serif',
      lineHeight: '1.15',
      color: '#FFFFFF',
      textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
      letterSpacing: '-0.5px',
    }}>
      COMPORTAMENTAL DISC
    </h1>

    {/* Bottom decorative line (white) */}
    <div style={{
      width: '256px',
      height: '4px',
      background: '#FFFFFF',
      marginTop: '48px',
      marginBottom: '48px',
      opacity: 0.8,
      borderRadius: '2px',
    }} />

    {/* Motivational phrase */}
    <p style={{
      fontSize: '24pt',
      fontStyle: 'italic',
      fontWeight: '300',
      marginBottom: '80px',
      fontFamily: 'Inter, Poppins, sans-serif',
      color: '#FFFFFF',
      letterSpacing: '0.5px',
      opacity: 0.95,
    }}>
      "A bússola que aponta para o sucesso"
    </p>

    {/* Candidate name */}
    <p style={{
      fontSize: '30pt',
      fontWeight: '600',
      marginBottom: '16px',
      fontFamily: 'Inter, Poppins, sans-serif',
      color: '#FFFFFF',
    }}>
      {candidatoNome}
    </p>

    {/* Date */}
    <p style={{
      fontSize: '18pt',
      fontWeight: '300',
      fontFamily: 'Inter, Poppins, sans-serif',
      color: '#FFFFFF',
      opacity: 0.9,
    }}>
      Realizado em: {data}
    </p>

    {/* Discrete footer (bottom right corner) */}
    <div style={{
      position: 'absolute',
      bottom: '32px',
      right: '32px',
      fontSize: '12pt',
      opacity: 0.7,
      textAlign: 'right',
      fontFamily: 'Inter, Poppins, sans-serif',
      color: '#FFFFFF',
      lineHeight: '1.5',
    }}>
      <span style={{ fontWeight: '600', display: 'block' }}>Instituto VEON</span>
      <span style={{ fontSize: '10pt', fontWeight: '300' }}>A Escola do Varejo</span>
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
          removeContainer: true,
          imageTimeout: 0,
          allowTaint: false,
        },
        jsPDF: { 
          unit: 'mm' as const, 
          format: 'a4' as const, 
          orientation: 'portrait' as const,
          compress: true,
        },
        pagebreak: { 
          mode: ['css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: ['.no-break', 'img', 'svg', 'canvas', '.recharts-wrapper'],
        },
      };

      // Hide elements with .no-print class
      const elementosOcultar = element.querySelectorAll('.no-print');
      elementosOcultar.forEach(el => (el as HTMLElement).style.display = 'none');

      // Fix SVG dimensions for better rendering
      const svgs = element.querySelectorAll('svg');
      svgs.forEach(svg => {
        const rect = svg.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          svg.setAttribute('width', String(rect.width));
          svg.setAttribute('height', String(rect.height));
        }
      });

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
      <button
        onClick={gerarPDF}
        disabled={gerando}
        className="no-print"
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          backgroundColor: VEON_COLORS.vermelho,
          color: VEON_COLORS.branco,
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 9999,
          fontWeight: '600',
          border: 'none',
          cursor: gerando ? 'not-allowed' : 'pointer',
          opacity: gerando ? 0.7 : 1,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {gerando ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Gerando PDF...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Baixar PDF
          </>
        )}
      </button>

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

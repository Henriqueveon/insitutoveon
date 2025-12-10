import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { PDFReport } from '@/components/report/PDFReport';
import { Download, ArrowLeft } from 'lucide-react';

/**
 * PDFPreview - Dedicated page for PDF export with hardcoded Henrique data
 * Uses rigid A4 PageContainer structure for pixel-perfect PDF output
 */
export default function PDFPreview() {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);

  // HARDCODED DATA FOR HENRIQUE - As per requirements
  const candidateData = {
    nome: "Henrique",
    data: "10 de dezembro de 2025"
  };

  const discData = {
    natural: { D: 54, I: 54, S: 56, C: 36 },
    adaptado: { D: 56, I: 54, S: 48, C: 36 }
  };

  const handleExportPDF = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Relatorio-DISC-${candidateData.nome}-${new Date().toISOString().split('T')[0]}`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 0;
      }
      @media print {
        html, body {
          width: 210mm;
          height: 297mm;
          margin: 0;
          padding: 0;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print {
          display: none !important;
        }
      }
    `
  });

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Fixed Header - Hidden in print */}
      <header className="no-print fixed top-0 left-0 right-0 z-50 bg-white shadow-md p-4">
        <div className="max-w-[210mm] mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <h1 className="text-lg font-semibold text-gray-800">
            Pré-visualização do PDF
          </h1>
          
          <Button 
            onClick={() => handleExportPDF()}
            className="bg-red-600 hover:bg-red-700 gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
      </header>

      {/* Report Container with top padding for fixed header */}
      <div className="pt-20 pb-10">
        <PDFReport
          ref={reportRef}
          candidateData={candidateData}
          discData={discData}
        />
      </div>

      {/* Floating Export Button */}
      <button
        onClick={() => handleExportPDF()}
        className="no-print fixed bottom-8 right-8 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full shadow-2xl font-semibold transition-all flex items-center gap-3 hover:scale-110 z-50"
      >
        <Download className="w-5 h-5" />
        📄 Exportar para PDF
      </button>
    </div>
  );
}

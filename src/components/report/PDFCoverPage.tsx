interface PDFCoverPageProps {
  nome: string;
  data: string;
}

/**
 * PDFCoverPage - Minimalist typographic cover page
 * NO logos, NO images, NO SVGs - only text and CSS
 */
export function PDFCoverPage({ nome, data }: PDFCoverPageProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex flex-col items-center justify-center text-white relative">
      {/* Decorative top line */}
      <div className="w-80 h-1 bg-white/60 rounded-full mb-12" />
      
      {/* Main title */}
      <h1 className="text-5xl font-bold text-center leading-tight tracking-tight mb-4">
        RELATÓRIO DE PERFIL
      </h1>
      <h1 className="text-5xl font-bold text-center leading-tight tracking-tight mb-12">
        COMPORTAMENTAL DISC
      </h1>
      
      {/* Decorative middle line */}
      <div className="w-80 h-1 bg-white/60 rounded-full mb-12" />
      
      {/* Motivational phrase */}
      <p className="text-2xl italic font-light tracking-wide mb-16 text-white/90">
        "A bússola que aponta para o sucesso"
      </p>
      
      {/* Candidate name - prominent */}
      <div className="text-center mb-8">
        <p className="text-5xl font-semibold tracking-wide">
          {nome}
        </p>
      </div>
      
      {/* Date */}
      <p className="text-xl font-light text-white/80">
        Realizado em: {data}
      </p>
      
      {/* Footer - institutional */}
      <div className="absolute bottom-10 right-10 text-right">
        <p className="font-semibold text-base text-white/80">Instituto VEON</p>
        <p className="text-xs font-light text-white/60 mt-1">A Escola do Varejo</p>
      </div>
    </div>
  );
}

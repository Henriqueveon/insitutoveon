import { CandidateData } from '@/context/AssessmentContext';
import veonLogo from '@/assets/veon-logo.png';

interface ReportCoverProps {
  candidate: CandidateData;
}

export function ReportCover({ candidate }: ReportCoverProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-veon-red via-veon-blue to-veon-blue-dark rounded-2xl shadow-2xl overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
        <div className="absolute bottom-20 right-20 w-48 h-48 border-4 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 border-4 border-white rounded-full" />
      </div>

      <div className="text-center text-white p-8 relative z-10">
        <div className="mb-8">
          <img 
            src={veonLogo} 
            alt="Instituto VEON" 
            className="h-20 md:h-24 mx-auto object-contain"
          />
          <p className="text-lg mt-2 opacity-90 font-medium">Escola do Varejo</p>
        </div>

        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 drop-shadow-lg">
          RELATÓRIO DE PERFIL
        </h1>
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-8 drop-shadow-lg">
          COMPORTAMENTAL DISC
        </h2>

        <div className="w-48 h-0.5 bg-white/50 mx-auto mb-8" />

        <div className="space-y-2">
          <p className="text-2xl md:text-3xl font-semibold">{candidate.nome_completo}</p>
          <p className="text-lg opacity-90">{candidate.cargo_atual}</p>
          <p className="text-base opacity-75">{candidate.empresa_instagram}</p>
        </div>

        <div className="mt-12 space-y-1">
          <p className="text-sm opacity-75">Realizado em</p>
          <p className="text-xl font-semibold">
            {new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20">
          <p className="text-lg italic opacity-90">
            "A bússola que aponta para o sucesso"
          </p>
        </div>
      </div>
    </div>
  );
}

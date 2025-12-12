import { CandidateData } from '@/context/AssessmentContext';

interface ReportCoverProps {
  candidate: CandidateData;
}

export function ReportCover({ candidate }: ReportCoverProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-[#003366] to-[#001a33] rounded-2xl shadow-2xl overflow-hidden relative print:rounded-none print:min-h-[297mm]">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 border border-white rounded-full" />
        <div className="absolute bottom-10 right-10 w-80 h-80 border border-white rounded-full" />
      </div>

      <div className="text-center text-white px-8 py-12 relative z-10 max-w-4xl w-full">
        {/* Top decorative line */}
        <div className="w-80 h-1 bg-white mx-auto mb-12 opacity-80 rounded-full" />

        {/* Main title */}
        <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 leading-tight tracking-tight drop-shadow-lg">
          RELATORIO DE PERFIL
        </h1>
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight tracking-tight drop-shadow-lg">
          COMPORTAMENTAL DISC
        </h2>

        {/* Middle decorative line */}
        <div className="w-80 h-1 bg-white mx-auto my-10 opacity-80 rounded-full" />

        {/* Motivational phrase */}
        <p className="text-2xl md:text-3xl italic mb-16 font-light tracking-wide opacity-95">
          "A bussola que aponta para o sucesso"
        </p>

        {/* Candidate info */}
        <div className="mt-12 space-y-3">
          <p className="text-3xl md:text-4xl font-semibold tracking-wide">
            {candidate.nome_completo}
          </p>
          <p className="text-lg md:text-xl opacity-90 font-light">
            {candidate.cargo_atual}
          </p>
          {candidate.empresa_instagram && (
            <p className="text-base opacity-75">{candidate.empresa_instagram}</p>
          )}
        </div>

        {/* Footer section - Date and Institutional info */}
        <div className="absolute bottom-6 left-0 right-0 text-center space-y-5">
          {/* Date */}
          <p className="text-lg font-light opacity-90">
            Realizado em:{' '}
            <span className="font-medium">
              {new Date().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </p>

          {/* Divider line */}
          <div className="w-40 h-px bg-white/30 mx-auto" />

          {/* Institutional info */}
          <div className="opacity-80">
            <p className="font-semibold text-xl">Instituto VEON</p>
            <p className="text-sm font-light mt-1">A Escola do Varejo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

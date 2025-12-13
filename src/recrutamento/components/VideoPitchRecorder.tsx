// =====================================================
// VIDEO PITCH RECORDER - Área de Recrutamento VEON
// Componente para gravar vídeo pitch de 1 minuto
// =====================================================

interface VideoPitchRecorderProps {
  maxDuracao?: number; // Em segundos, padrão 60
  tipoRoteiro?: 'roteiro' | 'livre';
  onVideoGravado: (videoBlob: Blob) => void;
  onErro?: (erro: string) => void;
}

export default function VideoPitchRecorder({
  maxDuracao = 60,
  tipoRoteiro = 'roteiro',
  onVideoGravado,
  onErro,
}: VideoPitchRecorderProps) {
  // TODO: Implementar na Fase 3
  return (
    <div>
      <h3>Gravador de Vídeo</h3>
    </div>
  );
}

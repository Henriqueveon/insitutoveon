// =====================================================
// VIDEO PLAYER - Área de Recrutamento VEON
// Player para vídeo pitch do candidato
// =====================================================

interface VideoPlayerProps {
  videoUrl: string;
  duracao?: number;
  thumbnail?: string;
  onPlay?: () => void;
}

export default function VideoPlayer({
  videoUrl,
  duracao,
  thumbnail,
  onPlay,
}: VideoPlayerProps) {
  // TODO: Implementar na Fase 3
  return (
    <div>
      <video src={videoUrl} />
    </div>
  );
}

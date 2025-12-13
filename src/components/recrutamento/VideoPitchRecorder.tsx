import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, StopCircle, Play } from "lucide-react";

interface VideoPitchRecorderProps {
  onVideoRecorded: (blob: Blob) => void;
}

const VideoPitchRecorder = ({ onVideoRecorded }: VideoPitchRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleStartRecording = () => {
    setIsRecording(true);
    // TODO: Implementar gravação
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // TODO: Implementar parada da gravação
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 text-center">
      <div className="w-full aspect-video bg-slate-900 rounded-lg mb-4 flex items-center justify-center">
        <Video className="w-16 h-16 text-slate-600" />
      </div>
      
      <p className="text-slate-400 mb-4">
        Grave um vídeo de até 60 segundos se apresentando
      </p>

      {!isRecording ? (
        <Button onClick={handleStartRecording} className="gap-2">
          <Play className="w-4 h-4" /> Iniciar Gravação
        </Button>
      ) : (
        <Button onClick={handleStopRecording} variant="destructive" className="gap-2">
          <StopCircle className="w-4 h-4" /> Parar Gravação
        </Button>
      )}
    </div>
  );
};

export default VideoPitchRecorder;

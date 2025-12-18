// =====================================================
// VIDEO PLAYER MODAL - Modal de vídeo estilo Instagram/TikTok
// Reprodução de vídeos em tela cheia com controles
// =====================================================

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Loader2,
} from 'lucide-react';

interface VideoDestaque {
  id: string;
  thumbnail_url: string | null;
  video_url: string;
  titulo: string;
  duracao: number | null;
  visualizacoes: number;
}

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoDestaque | null;
  candidatoNome: string;
  candidatoFoto: string | null;
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  video,
  candidatoNome,
  candidatoFoto,
}: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      setIsLoading(true);
      videoRef.current.play().catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setProgress(0);
      setIsLoading(true);
    }
  }, [isOpen]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(prog);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full max-w-none max-h-none p-0 bg-black border-none rounded-none">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Video */}
          <video
            ref={videoRef}
            src={video.video_url}
            className="max-w-full max-h-full object-contain"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedData={() => setIsLoading(false)}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            playsInline
            loop
          />

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          )}

          {/* Play/Pause Overlay */}
          {!isPlaying && !isLoading && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-10 h-10 text-white fill-white ml-1" />
              </div>
            </button>
          )}

          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={candidatoFoto || undefined} />
                <AvatarFallback className="bg-zinc-700 text-white">
                  {candidatoNome.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold text-sm">{candidatoNome}</p>
                <p className="text-white/70 text-xs">{video.titulo}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Right Side Actions (TikTok style) */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center ${isLiked ? 'text-red-500' : 'text-white'}`}>
                <Heart className={`w-7 h-7 ${isLiked ? 'fill-red-500' : ''}`} />
              </div>
              <span className="text-white text-xs font-medium">{video.visualizacoes}</span>
            </button>

            <button className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white">
                <MessageCircle className="w-7 h-7" />
              </div>
              <span className="text-white text-xs font-medium">0</span>
            </button>

            <button
              onClick={() => setIsSaved(!isSaved)}
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center ${isSaved ? 'text-amber-400' : 'text-white'}`}>
                <Bookmark className={`w-7 h-7 ${isSaved ? 'fill-amber-400' : ''}`} />
              </div>
              <span className="text-white text-xs font-medium">Salvar</span>
            </button>

            <button className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white">
                <Share2 className="w-7 h-7" />
              </div>
              <span className="text-white text-xs font-medium">Enviar</span>
            </button>
          </div>

          {/* Bottom Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
            {/* Progress Bar */}
            <div
              className="h-1 bg-white/30 rounded-full mb-4 cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="text-white"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 fill-white" />
                  )}
                </button>
                <button
                  onClick={toggleMute}
                  className="text-white"
                >
                  {isMuted ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </button>
              </div>

              <div className="text-white/70 text-sm">
                {formatDuration(video.duracao)}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

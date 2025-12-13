interface VideoPlayerProps {
  url: string;
  className?: string;
}

const VideoPlayer = ({ url, className }: VideoPlayerProps) => {
  return (
    <div className={className}>
      <video 
        src={url} 
        controls 
        className="w-full rounded-lg"
      >
        Seu navegador não suporta vídeos.
      </video>
    </div>
  );
};

export default VideoPlayer;

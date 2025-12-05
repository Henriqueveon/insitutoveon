import { Compass } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div className="w-12 h-12 rounded-full gradient-veon flex items-center justify-center shadow-lg">
          <Compass className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-veon-red rounded-full border-2 border-white" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            Instituto <span className="text-veon-blue">VEON</span>
          </span>
          <span className="text-xs text-muted-foreground font-medium tracking-wide">
            Análise Comportamental DISC
          </span>
        </div>
      )}
    </div>
  );
}

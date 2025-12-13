import veonLogo from '@/assets/veon-logo.png';
interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
export function Logo({
  className = '',
  showText = true,
  size = 'md'
}: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  return <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full gradient-veon flex items-center justify-center shadow-lg overflow-hidden`}>
        <img src={veonLogo} alt="VEON Logo" className="w-full h-full object-cover" />
      </div>
      {showText && <div className="flex flex-col">
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            Instituto <span className="text-veon-blue">Veon</span>
          </span>
          <span className="text-xs text-muted-foreground font-medium tracking-wide">
            Análise Comportamental DISC
          </span>
        </div>}
    </div>;
}
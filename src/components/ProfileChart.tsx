import { Profile } from '@/context/AssessmentContext';

interface ProfileChartProps {
  naturalProfile: Profile;
  adaptedProfile: Profile;
}

function normalizeScore(score: number): number {
  // Normalize from range -50 to +50 to 0-100
  return Math.round(((score + 50) / 100) * 100);
}

export function ProfileChart({ naturalProfile, adaptedProfile }: ProfileChartProps) {
  const factors: Array<{ key: keyof Profile; label: string; color: string; bgColor: string }> = [
    { key: 'D', label: 'Dominância', color: 'bg-disc-d', bgColor: 'bg-disc-d/20' },
    { key: 'I', label: 'Influência', color: 'bg-disc-i', bgColor: 'bg-disc-i/20' },
    { key: 'S', label: 'Estabilidade', color: 'bg-disc-s', bgColor: 'bg-disc-s/20' },
    { key: 'C', label: 'Conformidade', color: 'bg-disc-c', bgColor: 'bg-disc-c/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded gradient-veon" />
          <span className="text-muted-foreground">Perfil Natural</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted border-2 border-border" />
          <span className="text-muted-foreground">Perfil Adaptado</span>
        </div>
      </div>

      <div className="space-y-4">
        {factors.map((factor) => {
          const naturalValue = normalizeScore(naturalProfile[factor.key]);
          const adaptedValue = normalizeScore(adaptedProfile[factor.key]);

          return (
            <div key={factor.key} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${factor.color} flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{factor.key}</span>
                  </div>
                  <span className="font-medium text-foreground">{factor.label}</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-foreground font-semibold">{naturalValue}%</span>
                  <span className="text-muted-foreground">{adaptedValue}%</span>
                </div>
              </div>
              
              <div className="relative h-6 rounded-full bg-muted overflow-hidden">
                {/* Adapted bar (behind) */}
                <div
                  className="absolute top-0 left-0 h-full bg-muted-foreground/30 transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${adaptedValue}%` }}
                />
                {/* Natural bar (front) */}
                <div
                  className={`absolute top-0 left-0 h-full ${factor.color} transition-all duration-700 ease-out rounded-full shadow-md`}
                  style={{ width: `${naturalValue}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

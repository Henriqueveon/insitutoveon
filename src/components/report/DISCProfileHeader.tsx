import { Star } from 'lucide-react';

// Cores oficiais DISC
const DISC_COLORS = {
  D: '#E31E24', // Vermelho
  I: '#FFD700', // Amarelo/Dourado
  S: '#00A651', // Verde
  C: '#003DA5', // Azul
};

interface DISCProfile {
  D: number;
  I: number;
  S: number;
  C: number;
}

interface ProfileDescription {
  nome: string;
  descricaoCurta: string;
  descricaoCompleta: string;
}

interface DISCProfileHeaderProps {
  naturalProfile: DISCProfile;
  profile: ProfileDescription;
}

export function DISCProfileHeader({ naturalProfile, profile }: DISCProfileHeaderProps) {
  // Calcular porcentagens normalizadas (0-100)
  const calculatePercentages = () => {
    const factors = ['D', 'I', 'S', 'C'] as const;

    // Os valores do perfil podem ser negativos ou positivos (-50 a +50 tipicamente)
    // Vamos normalizar para valores positivos primeiro
    const normalized = factors.map(f => ({
      factor: f,
      value: Math.max(0, naturalProfile[f] + 50), // Converter de -50/+50 para 0-100
    }));

    // Ordenar do maior para o menor
    normalized.sort((a, b) => b.value - a.value);

    // Pegar os dois maiores (ou apenas o maior se for perfil puro)
    const total = normalized[0].value + normalized[1].value;

    if (total === 0) {
      return [{ factor: 'D' as const, percentage: 100 }];
    }

    // Se o segundo fator for muito pequeno (menos de 15% do total), considerar perfil puro
    const secondPercentage = (normalized[1].value / total) * 100;

    if (secondPercentage < 15) {
      return [{ factor: normalized[0].factor, percentage: 100 }];
    }

    // Perfil composto - calcular porcentagens dos dois principais
    const firstPercentage = Math.round((normalized[0].value / total) * 100);
    const secondPercentageRounded = 100 - firstPercentage;

    return [
      { factor: normalized[0].factor, percentage: firstPercentage },
      { factor: normalized[1].factor, percentage: secondPercentageRounded },
    ];
  };

  const percentages = calculatePercentages();
  const isPure = percentages.length === 1;

  // Gerar o gradiente CSS
  const generateGradient = () => {
    if (isPure) {
      return DISC_COLORS[percentages[0].factor];
    }

    const first = percentages[0];
    const second = percentages[1];

    // Gradiente com transicao suave no ponto de encontro
    return `linear-gradient(to right, ${DISC_COLORS[first.factor]} 0%, ${DISC_COLORS[first.factor]} ${first.percentage - 5}%, ${DISC_COLORS[second.factor]} ${first.percentage + 5}%, ${DISC_COLORS[second.factor]} 100%)`;
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-lg">
      {/* Barra de cores DISC */}
      <div
        className="relative p-6 text-white min-h-[120px] flex items-center"
        style={{ background: generateGradient() }}
      >
        {/* Indicadores de porcentagem */}
        <div className="absolute inset-0 flex">
          {percentages.map((item, index) => (
            <div
              key={item.factor}
              className="flex items-center justify-center"
              style={{ width: `${item.percentage}%` }}
            >
              <span
                className="text-white font-bold text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
              >
                {item.factor} {item.percentage}%
              </span>
            </div>
          ))}
        </div>

        {/* Conteudo do perfil */}
        <div className="relative z-10 flex items-center gap-3 w-full">
          <Star className="w-8 h-8 drop-shadow-lg" />
          <div>
            <h2 className="font-display text-2xl font-bold drop-shadow-lg">{profile.nome}</h2>
            <p className="opacity-95 drop-shadow-md">{profile.descricaoCurta}</p>
          </div>
        </div>
      </div>

      {/* Descricao do perfil */}
      <div className="bg-card p-6 border-x border-b rounded-b-xl">
        <p className="text-muted-foreground leading-relaxed">{profile.descricaoCompleta}</p>
      </div>
    </div>
  );
}

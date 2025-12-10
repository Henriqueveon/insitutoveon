import { Profile } from '@/context/AssessmentContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Brain } from 'lucide-react';

interface JungPsychologicalTypesProps {
  naturalProfile: Profile;
  adaptedProfile: Profile;
}

interface BipolarScaleProps {
  dimension: string;
  left: string;
  right: string;
  value: number;
}

function BipolarScale({ dimension, left, right, value }: BipolarScaleProps) {
  return (
    <div className="mb-6">
      <h4 className="text-center text-sm font-semibold text-muted-foreground mb-3">
        {dimension}
      </h4>
      
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-bold transition-colors ${
          value < 50 ? 'text-[#00CED1]' : 'text-muted-foreground/50'
        }`}>
          {left}
        </span>
        <span className={`text-sm font-bold transition-colors ${
          value > 50 ? 'text-[#00CED1]' : 'text-muted-foreground/50'
        }`}>
          {right}
        </span>
      </div>
      
      <div className="relative h-10 bg-gradient-to-r from-[#00CED1]/20 via-muted to-[#FF6B6B]/20 rounded-full overflow-hidden">
        {/* Center marker */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border z-10" />
        
        {/* Position indicator */}
        <div 
          className="absolute w-5 h-5 bg-gradient-to-r from-[#00CED1] to-[#0099CC] rounded-full top-1/2 transform -translate-y-1/2 shadow-lg border-2 border-white z-20 transition-all"
          style={{ left: `calc(${value}% - 10px)` }}
        />
        
        {/* Fill bar */}
        <div 
          className="absolute h-full bg-gradient-to-r from-[#00CED1]/30 to-transparent rounded-l-full"
          style={{ width: `${Math.min(value, 50)}%` }}
        />
        <div 
          className="absolute h-full bg-gradient-to-l from-[#FF6B6B]/30 to-transparent rounded-r-full right-0"
          style={{ width: `${Math.max(0, 100 - Math.max(value, 50))}%` }}
        />
      </div>
      
      <div className="text-center text-xs text-muted-foreground mt-2">
        {value}% {value < 50 ? `← ${left}` : `${right} →`}
      </div>
    </div>
  );
}

export function JungPsychologicalTypes({ naturalProfile, adaptedProfile }: JungPsychologicalTypesProps) {
  // Calculate Jung dimensions based on DISC profile
  // Extroversion vs Introversion: High I and D = Extroversion
  const extroversion = Math.round(((naturalProfile.I + naturalProfile.D) / 2) * 0.8 + 10);
  
  // Sensing vs Intuition: High S and C = Sensing
  const sensing = Math.round(((naturalProfile.S + naturalProfile.C) / 2) * 0.7 + 15);
  
  // Thinking vs Feeling: High D and C = Thinking
  const thinking = Math.round(((naturalProfile.D + naturalProfile.C) / 2) * 0.75 + 12);

  // Determine personality type
  const getType = () => {
    const e = extroversion < 50 ? 'E' : 'I';
    const s = sensing < 50 ? 'S' : 'N';
    const t = thinking < 50 ? 'T' : 'F';
    return `${e}${s}${t}`;
  };

  const typeDescriptions: Record<string, { name: string; description: string }> = {
    'EST': { name: 'Executor Prático', description: 'Pessoas com este perfil são práticas, realistas e focadas em fatos. Preferem ação e interação social.' },
    'ESF': { name: 'Facilitador Social', description: 'Orientados para pessoas, valorizam harmonia e cooperação. Tomam decisões baseadas em valores humanos.' },
    'ENT': { name: 'Visionário Estratégico', description: 'Pensadores independentes que gostam de desenvolver teorias e sistemas inovadores.' },
    'ENF': { name: 'Inspirador Carismático', description: 'Criativos e entusiasmados, inspiram outros com suas visões e ideias.' },
    'IST': { name: 'Analista Detalhista', description: 'Práticos e organizados, preferem trabalhar de forma independente com fatos concretos.' },
    'ISF': { name: 'Apoiador Leal', description: 'Confiáveis e cuidadosos, valorizam tradições e relacionamentos próximos.' },
    'INT': { name: 'Arquiteto de Ideias', description: 'Pensadores lógicos e independentes que buscam compreender sistemas complexos.' },
    'INF': { name: 'Idealista Reflexivo', description: 'Profundos e criativos, buscam significado e autenticidade em tudo que fazem.' },
  };

  const currentType = getType();
  const typeInfo = typeDescriptions[currentType] || { 
    name: 'Perfil Misto', 
    description: 'Você apresenta características balanceadas entre as dimensões.' 
  };

  return (
    <Card className="card-elevated animate-slide-up no-break">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="w-5 h-5 text-[#00CED1]" />
          Tipos Psicológicos (Jung)
        </CardTitle>
        <CardDescription>
          Baseado na teoria de Carl Jung, avalia preferências cognitivas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <BipolarScale 
            dimension="Direcionamento de Energia"
            left="Extroversão"
            right="Introversão"
            value={extroversion}
          />
          
          <BipolarScale 
            dimension="Forma de Percepção"
            left="Sensação"
            right="Intuição"
            value={sensing}
          />
          
          <BipolarScale 
            dimension="Tomada de Decisão"
            left="Pensamento"
            right="Sentimento"
            value={thinking}
          />
        </div>

        {/* Result card */}
        <div className="p-6 bg-gradient-to-br from-[#00CED1]/10 to-[#4DABF7]/10 rounded-xl border-2 border-[#00CED1]/30">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl font-bold text-[#00CED1] font-display">{currentType}</span>
            <h3 className="font-bold text-xl text-foreground">
              {typeInfo.name}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {typeInfo.description}
          </p>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00CED1]" />
            <span>Tendência predominante</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span>Centro indica equilíbrio</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// CARD PROFISSIONAL - Estilo Instagram/Facebook
// Visual atrativo com foto, nome, cidade, DISC e match%
// =====================================================

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Heart,
  Play,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface Profissional {
  id: string;
  nome_completo: string;
  foto_url: string | null;
  video_url: string | null;
  cidade: string;
  estado: string;
  perfil_disc: string | null;
  areas_experiencia: string[] | null;
  anos_experiencia: number | null;
  pretensao_salarial: string | null;
  objetivo_profissional: string | null;
  distancia_km?: number | null;
}

interface Props {
  profissional: Profissional;
  onClick: () => void;
  isFavorito: boolean;
  onToggleFavorito: (id: string) => void;
  matchPercentual?: number; // 0-100
}

// Configurações de perfil DISC
const DISC_CONFIG = {
  D: {
    cor: 'bg-red-500',
    corTexto: 'text-red-400',
    corBg: 'bg-red-500/20',
    nome: 'Dominância',
    descricao: 'Executor',
    icone: '🎯',
  },
  I: {
    cor: 'bg-yellow-500',
    corTexto: 'text-yellow-400',
    corBg: 'bg-yellow-500/20',
    nome: 'Influência',
    descricao: 'Comunicador',
    icone: '⭐',
  },
  S: {
    cor: 'bg-green-500',
    corTexto: 'text-green-400',
    corBg: 'bg-green-500/20',
    nome: 'Estabilidade',
    descricao: 'Colaborador',
    icone: '🤝',
  },
  C: {
    cor: 'bg-blue-500',
    corTexto: 'text-blue-400',
    corBg: 'bg-blue-500/20',
    nome: 'Conformidade',
    descricao: 'Analítico',
    icone: '📊',
  },
};

export default function ProfissionalCard({
  profissional,
  onClick,
  isFavorito,
  onToggleFavorito,
  matchPercentual = 0,
}: Props) {
  const primeiroNome = profissional.nome_completo.split(' ')[0];
  const discConfig = profissional.perfil_disc
    ? DISC_CONFIG[profissional.perfil_disc as keyof typeof DISC_CONFIG]
    : null;

  // Calcular match se não fornecido (fallback simples)
  const match = matchPercentual || calcularMatchSimples(profissional);

  return (
    <div
      onClick={onClick}
      className="group relative bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-slate-500 hover:shadow-xl hover:shadow-slate-900/50 hover:-translate-y-1"
    >
      {/* Badge de Match no canto superior */}
      {match > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            match >= 80 ? 'bg-green-500 text-white' :
            match >= 60 ? 'bg-yellow-500 text-slate-900' :
            'bg-slate-600 text-white'
          }`}>
            <TrendingUp className="w-3 h-3" />
            {match}% match
          </div>
        </div>
      )}

      {/* Botão Favorito */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorito(profissional.id);
        }}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
          isFavorito
            ? 'bg-red-500 text-white'
            : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'
        }`}
      >
        <Heart className={`w-4 h-4 ${isFavorito ? 'fill-current' : ''}`} />
      </button>

      {/* Badge de Vídeo se tiver */}
      {profissional.video_url && (
        <div className="absolute top-3 right-14 z-10">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500 text-white text-xs font-medium">
            <Play className="w-3 h-3 fill-current" />
            Vídeo
          </div>
        </div>
      )}

      {/* Área da Foto - Estilo Instagram */}
      <div className="p-6 pb-4 flex flex-col items-center">
        <div className="relative">
          {/* Ring decorativo */}
          <div className={`absolute inset-0 rounded-full ${discConfig?.cor || 'bg-slate-600'} opacity-30 blur-sm scale-110`} />

          {/* Avatar */}
          <Avatar className="w-24 h-24 border-4 border-slate-700 relative">
            <AvatarImage
              src={profissional.foto_url || undefined}
              className="object-cover"
            />
            <AvatarFallback className={`text-2xl font-bold text-white ${discConfig?.cor || 'bg-slate-600'}`}>
              {primeiroNome.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Badge DISC no avatar */}
          {discConfig && (
            <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full ${discConfig.cor} flex items-center justify-center text-sm font-bold text-white border-2 border-slate-800 shadow-lg`}>
              {profissional.perfil_disc}
            </div>
          )}
        </div>

        {/* Nome e Localização */}
        <h3 className="mt-4 text-lg font-bold text-white group-hover:text-[#E31E24] transition-colors">
          {primeiroNome}
        </h3>

        <p className="flex items-center gap-1 text-sm text-slate-400 mt-1">
          <MapPin className="w-3.5 h-3.5" />
          {profissional.cidade}, {profissional.estado}
          {profissional.distancia_km !== undefined && profissional.distancia_km !== null && (
            <span className="text-green-400 ml-1">
              • {profissional.distancia_km}km
            </span>
          )}
        </p>
      </div>

      {/* Perfil DISC Destacado */}
      {discConfig && (
        <div className={`mx-4 mb-4 px-4 py-3 rounded-xl ${discConfig.corBg} border border-slate-700`}>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">{discConfig.icone}</span>
            <div className="text-center">
              <p className={`font-semibold ${discConfig.corTexto}`}>
                {discConfig.nome}
              </p>
              <p className="text-xs text-slate-400">{discConfig.descricao}</p>
            </div>
          </div>
        </div>
      )}

      {/* Áreas de experiência */}
      {profissional.areas_experiencia && profissional.areas_experiencia.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap justify-center gap-1.5">
            {profissional.areas_experiencia.slice(0, 2).map((area, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="bg-slate-700/50 text-slate-300 text-xs"
              >
                {area}
              </Badge>
            ))}
            {profissional.areas_experiencia.length > 2 && (
              <Badge
                variant="secondary"
                className="bg-slate-700/50 text-slate-400 text-xs"
              >
                +{profissional.areas_experiencia.length - 2}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Footer com CTA */}
      <div className="px-4 pb-4">
        <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#E31E24]/10 to-[#E31E24]/5 border border-[#E31E24]/30 text-[#E31E24] font-medium text-sm transition-all group-hover:from-[#E31E24] group-hover:to-[#B91C1C] group-hover:text-white group-hover:border-transparent">
          Ver perfil completo
        </button>
      </div>

      {/* Efeito de brilho no hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}

// Função auxiliar para calcular match simples (quando não há dados específicos da empresa)
function calcularMatchSimples(profissional: Profissional): number {
  let pontos = 0;
  let total = 0;

  // DISC preenchido (+25 pontos)
  total += 25;
  if (profissional.perfil_disc) {
    pontos += 25;
  }

  // Foto (+20 pontos)
  total += 20;
  if (profissional.foto_url) {
    pontos += 20;
  }

  // Vídeo (+20 pontos)
  total += 20;
  if (profissional.video_url) {
    pontos += 20;
  }

  // Experiência definida (+15 pontos)
  total += 15;
  if (profissional.areas_experiencia && profissional.areas_experiencia.length > 0) {
    pontos += 15;
  }

  // Pretensão salarial definida (+10 pontos)
  total += 10;
  if (profissional.pretensao_salarial) {
    pontos += 10;
  }

  // Objetivo profissional (+10 pontos)
  total += 10;
  if (profissional.objetivo_profissional) {
    pontos += 10;
  }

  return Math.round((pontos / total) * 100);
}

// Exportar função de cálculo de match para uso externo
export { calcularMatchSimples };

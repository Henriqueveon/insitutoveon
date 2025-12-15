// =====================================================
// EMPRESA PERFIL CARD - Exibição para Candidatos
// Mostra diferenciais, benefícios e fotos
// =====================================================

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2,
  Users,
  Clock,
  Heart,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react';

interface EmpresaPerfil {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  logo_url?: string | null;
  segmento?: string | null;
  tempo_mercado?: string | null;
  num_colaboradores?: string | null;
  site_url?: string | null;
  instagram_empresa?: string | null;
  sobre_empresa?: string | null;
  diferenciais?: string[] | null;
  porque_trabalhar?: string | null;
  fotos_ambiente?: string[] | null;
  cidade?: string;
  estado?: string;
}

interface EmpresaPerfilCardProps {
  empresa: EmpresaPerfil;
  compact?: boolean;
}

// Mapeamento de ícones para categorias de diferenciais
const CATEGORIAS_DIFERENCIAIS = {
  beneficios: {
    icon: Heart,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    itens: [
      'Vale Refeição', 'Vale Alimentação', 'Vale Transporte',
      'Plano de Saúde', 'Plano Odontológico', 'Seguro de Vida',
      'Participação nos Lucros', 'Bonificação por Metas', 'Day Off no Aniversário',
    ],
  },
  estrutura: {
    icon: Building2,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    itens: [
      'Cozinha/Refeitório', 'Área de Descanso', 'Estacionamento',
      'Ambiente Climatizado', 'Home Office', 'Horário Flexível',
    ],
  },
  desenvolvimento: {
    icon: GraduationCap,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    itens: [
      'Treinamentos Profissionalizantes', 'Plano de Carreira',
      'Bolsa de Estudos', 'Cursos e Certificações', 'Mentoria',
    ],
  },
  cultura: {
    icon: Sparkles,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    itens: [
      'Ambiente Descontraído', 'Eventos de Integração',
      'Confraternizações', 'Dress Code Livre',
    ],
  },
};

const getDiferencialCategoria = (diferencial: string) => {
  for (const [key, categoria] of Object.entries(CATEGORIAS_DIFERENCIAIS)) {
    if (categoria.itens.includes(diferencial)) {
      return { key, ...categoria };
    }
  }
  return {
    key: 'outros',
    icon: Sparkles,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    itens: [],
  };
};

export default function EmpresaPerfilCard({ empresa, compact = false }: EmpresaPerfilCardProps) {
  const [galeriaAberta, setGaleriaAberta] = useState(false);
  const [fotoAtual, setFotoAtual] = useState(0);

  const temDiferenciais = empresa.diferenciais && empresa.diferenciais.length > 0;
  const temFotos = empresa.fotos_ambiente && empresa.fotos_ambiente.length > 0;

  const navegarGaleria = (direcao: 'prev' | 'next') => {
    if (!empresa.fotos_ambiente) return;
    const total = empresa.fotos_ambiente.length;
    if (direcao === 'prev') {
      setFotoAtual((prev) => (prev - 1 + total) % total);
    } else {
      setFotoAtual((prev) => (prev + 1) % total);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={empresa.logo_url || undefined} />
          <AvatarFallback className="bg-slate-700 text-white">
            {empresa.nome_fantasia?.charAt(0) || 'E'}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium text-white truncate">
            {empresa.nome_fantasia || empresa.razao_social}
          </p>
          {empresa.segmento && (
            <p className="text-xs text-slate-400">{empresa.segmento}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="bg-slate-800/60 border-slate-700 overflow-hidden">
        <CardContent className="p-0">
          {/* Header com logo */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 border-4 border-slate-600">
                <AvatarImage src={empresa.logo_url || undefined} />
                <AvatarFallback className="bg-slate-600 text-white text-2xl">
                  {empresa.nome_fantasia?.charAt(0) || 'E'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white">
                  {empresa.nome_fantasia || empresa.razao_social}
                </h3>
                {empresa.segmento && (
                  <Badge className="mt-1 bg-blue-500/20 text-blue-400">
                    {empresa.segmento}
                  </Badge>
                )}
                {(empresa.cidade || empresa.estado) && (
                  <p className="text-sm text-slate-400 mt-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {empresa.cidade}{empresa.cidade && empresa.estado && ', '}{empresa.estado}
                  </p>
                )}
              </div>
            </div>

            {/* Info rápida */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-600">
              {empresa.tempo_mercado && (
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {empresa.tempo_mercado}
                </div>
              )}
              {empresa.num_colaboradores && (
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Users className="w-4 h-4 text-slate-400" />
                  {empresa.num_colaboradores} colaboradores
                </div>
              )}
            </div>

            {/* Links externos removidos para manter usuários dentro do app */}
          </div>

          {/* Sobre */}
          {empresa.sobre_empresa && (
            <div className="p-6 border-b border-slate-700">
              <h4 className="font-medium text-white mb-2">Sobre a empresa</h4>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">
                {empresa.sobre_empresa}
              </p>
            </div>
          )}

          {/* Diferenciais */}
          {temDiferenciais && (
            <div className="p-6 border-b border-slate-700">
              <h4 className="font-medium text-white mb-4">O que oferecemos</h4>
              <div className="flex flex-wrap gap-2">
                {empresa.diferenciais!.map((diferencial, index) => {
                  const cat = getDiferencialCategoria(diferencial);
                  const IconComponent = cat.icon;
                  return (
                    <Badge
                      key={index}
                      className={`${cat.bgColor} ${cat.color} border-0 py-1.5`}
                    >
                      <IconComponent className="w-3.5 h-3.5 mr-1.5" />
                      {diferencial}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Por que trabalhar aqui */}
          {empresa.porque_trabalhar && (
            <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
              <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-400" />
                Por que trabalhar aqui?
              </h4>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">
                {empresa.porque_trabalhar}
              </p>
            </div>
          )}

          {/* Fotos do ambiente */}
          {temFotos && (
            <div className="p-6">
              <h4 className="font-medium text-white mb-4">Nosso ambiente</h4>
              <div className="grid grid-cols-3 gap-2">
                {empresa.fotos_ambiente!.slice(0, 3).map((foto, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setFotoAtual(index);
                      setGaleriaAberta(true);
                    }}
                    className="aspect-square relative rounded-lg overflow-hidden group"
                  >
                    <img
                      src={foto}
                      alt={`Ambiente ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    {index === 2 && empresa.fotos_ambiente!.length > 3 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold">
                          +{empresa.fotos_ambiente!.length - 3}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Galeria em tela cheia */}
      <Dialog open={galeriaAberta} onOpenChange={setGaleriaAberta}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl p-0">
          <DialogHeader className="p-4 border-b border-slate-700">
            <DialogTitle className="text-white">
              {empresa.nome_fantasia || empresa.razao_social} - Ambiente de Trabalho
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            <img
              src={empresa.fotos_ambiente?.[fotoAtual]}
              alt={`Foto ${fotoAtual + 1}`}
              className="w-full max-h-[70vh] object-contain"
            />
            {empresa.fotos_ambiente && empresa.fotos_ambiente.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navegarGaleria('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navegarGaleria('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full">
                  <span className="text-white text-sm">
                    {fotoAtual + 1} / {empresa.fotos_ambiente.length}
                  </span>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// =====================================================
// PERFIL INSTAGRAM DO CANDIDATO
// Design inspirado no Instagram com foto, stats e destaques
// =====================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Plus,
  Loader2,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Destaque {
  id: string;
  titulo: string;
  icone: string;
  ordem: number;
  midias: {
    id: string;
    tipo: 'foto' | 'video';
    url: string;
    thumbnail_url?: string;
  }[];
}

interface PerfilInstagramCandidatoProps {
  candidato: {
    id: string;
    nome_completo: string;
    foto_url?: string;
    cidade?: string;
    estado?: string;
    perfil_disc?: string;
    headline?: string;
    bio?: string;
    experiencia_anos?: number;
    total_visualizacoes?: number;
    total_propostas_recebidas?: number;
    total_candidaturas?: number;
  };
  modoVisualizacao?: 'candidato' | 'empresa';
  empresaId?: string;
  onVerCurriculo?: () => void;
  onAgendarEntrevista?: () => void;
  onClose?: () => void;
}

// Cores do perfil DISC
const coresDISC: Record<string, { bg: string; text: string }> = {
  D: { bg: 'bg-red-500', text: 'text-white' },
  Dominante: { bg: 'bg-red-500', text: 'text-white' },
  I: { bg: 'bg-yellow-500', text: 'text-black' },
  Influente: { bg: 'bg-yellow-500', text: 'text-black' },
  S: { bg: 'bg-green-500', text: 'text-white' },
  Estável: { bg: 'bg-green-500', text: 'text-white' },
  C: { bg: 'bg-blue-500', text: 'text-white' },
  Conforme: { bg: 'bg-blue-500', text: 'text-white' },
};

export function PerfilInstagramCandidato({
  candidato,
  modoVisualizacao = 'empresa',
  empresaId,
  onVerCurriculo,
  onAgendarEntrevista,
  onClose,
}: PerfilInstagramCandidatoProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [destaques, setDestaques] = useState<Destaque[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [destaqueAtivo, setDestaqueAtivo] = useState<Destaque | null>(null);
  const [midiaAtiva, setMidiaAtiva] = useState(0);

  useEffect(() => {
    carregarDestaques();
    if (modoVisualizacao === 'empresa' && empresaId) {
      verificarSalvo();
      registrarVisualizacao();
    }
  }, [candidato.id]);

  const carregarDestaques = async () => {
    try {
      const { data } = await supabase
        .from('destaques_candidato')
        .select(`
          *,
          midias:midias_destaque(*)
        `)
        .eq('candidato_id', candidato.id)
        .order('ordem');

      if (data) setDestaques(data);
    } catch (error) {
      console.error('Erro ao carregar destaques:', error);
    } finally {
      setLoading(false);
    }
  };

  const verificarSalvo = async () => {
    if (!empresaId) return;

    const { data } = await supabase
      .from('candidatos_salvos')
      .select('id')
      .eq('empresa_id', empresaId)
      .eq('candidato_id', candidato.id)
      .single();

    setSalvo(!!data);
  };

  const registrarVisualizacao = async () => {
    if (!empresaId) return;

    try {
      await supabase.rpc('registrar_visualizacao_perfil', {
        p_candidato_id: candidato.id,
        p_empresa_id: empresaId,
      });
    } catch (error) {
      console.error('Erro ao registrar visualização:', error);
    }
  };

  const toggleSalvar = async () => {
    if (!empresaId) return;

    setSalvando(true);
    try {
      if (salvo) {
        await supabase
          .from('candidatos_salvos')
          .delete()
          .eq('empresa_id', empresaId)
          .eq('candidato_id', candidato.id);

        setSalvo(false);
        toast({ title: 'Removido dos salvos' });
      } else {
        await supabase.from('candidatos_salvos').insert({
          empresa_id: empresaId,
          candidato_id: candidato.id,
        });

        setSalvo(true);
        toast({ title: 'Candidato salvo!' });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSalvando(false);
    }
  };

  const getPerfisDisc = () => {
    if (!candidato.perfil_disc) return [];
    return candidato.perfil_disc.split(/[\s,]+/).filter(Boolean);
  };

  const primeiroNome = candidato.nome_completo?.split(' ')[0] || '';

  return (
    <div className="bg-black text-white min-h-full">
      {/* Header com botão fechar */}
      {onClose && (
        <div className="flex justify-end p-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Perfil */}
      <div className="px-4 pb-6">
        {/* Foto + Stats */}
        <div className="flex items-center gap-5 mb-4">
          {/* Foto com borda gradiente Instagram */}
          <div className="relative flex-shrink-0">
            <div className="w-[90px] h-[90px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
              <div className="w-full h-full rounded-full overflow-hidden bg-black p-[2px]">
                {candidato.foto_url ? (
                  <img
                    src={candidato.foto_url}
                    alt={candidato.nome_completo}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {primeiroNome.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="flex flex-1 justify-around text-center">
            <div>
              <p className="text-xl font-bold">{candidato.total_visualizacoes || 0}</p>
              <p className="text-[11px] text-gray-400">visualizações</p>
            </div>
            <div>
              <p className="text-xl font-bold">{candidato.total_propostas_recebidas || 0}</p>
              <p className="text-[11px] text-gray-400">propostas</p>
            </div>
            <div>
              <p className="text-xl font-bold">{candidato.total_candidaturas || 0}</p>
              <p className="text-[11px] text-gray-400">candidaturas</p>
            </div>
          </div>
        </div>

        {/* Nome e Bio */}
        <div className="mb-4">
          <h1 className="text-lg font-semibold">
            {candidato.nome_completo}
            {candidato.headline && (
              <span className="font-normal text-gray-300"> - {candidato.headline}</span>
            )}
          </h1>

          {candidato.bio && (
            <p className="text-gray-300 text-sm mt-1">{candidato.bio}</p>
          )}

          {candidato.experiencia_anos !== undefined && candidato.experiencia_anos > 0 && (
            <p className="text-gray-400 text-sm mt-1">
              + de {candidato.experiencia_anos} {candidato.experiencia_anos === 1 ? 'ano' : 'anos'} de experiência
            </p>
          )}

          {(candidato.cidade || candidato.estado) && (
            <p className="text-white text-sm mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {[candidato.cidade, candidato.estado].filter(Boolean).join(' - ')}
            </p>
          )}
        </div>

        {/* Perfil DISC */}
        {candidato.perfil_disc && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {getPerfisDisc().map((perfil) => {
              const cores = coresDISC[perfil] || { bg: 'bg-gray-500', text: 'text-white' };
              return (
                <Badge
                  key={perfil}
                  className={`${cores.bg} ${cores.text} px-3 py-1 text-sm font-medium`}
                >
                  {perfil}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Botões de Ação */}
        {modoVisualizacao === 'empresa' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-white text-black hover:bg-gray-100 border-0 h-9"
              onClick={onVerCurriculo}
            >
              <Eye className="w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              className="flex-[2] bg-white text-black hover:bg-gray-100 border-0 h-9 font-semibold"
              onClick={onAgendarEntrevista}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Entrevista
            </Button>

            <Button
              variant="outline"
              className="bg-white text-black hover:bg-gray-100 border-0 h-9 px-3"
              onClick={toggleSalvar}
              disabled={salvando}
            >
              {salvando ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : salvo ? (
                <BookmarkCheck className="w-5 h-5 fill-black" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Destaques (Stories) */}
      <div className="px-4 py-4 border-t border-gray-800">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* Botão Adicionar (só para candidato) */}
            {modoVisualizacao === 'candidato' && (
              <button
                onClick={() => {
                  toast({ title: 'Em breve!', description: 'Funcionalidade de destaques chegando em breve.' });
                }}
                className="flex flex-col items-center gap-1 flex-shrink-0"
              >
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center hover:border-gray-400 transition-colors">
                  <Plus className="w-6 h-6 text-gray-500" />
                </div>
                <span className="text-xs text-gray-400">Adicionar</span>
              </button>
            )}

            {/* Destaques existentes */}
            {destaques.map((destaque) => {
              const temMidia = destaque.midias && destaque.midias.length > 0;
              const thumbnail = destaque.midias?.[0]?.thumbnail_url || destaque.midias?.[0]?.url;

              return (
                <button
                  key={destaque.id}
                  onClick={() => {
                    if (temMidia) {
                      setDestaqueAtivo(destaque);
                      setMidiaAtiva(0);
                    }
                  }}
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                >
                  <div
                    className={`w-16 h-16 rounded-full p-[2px] ${
                      temMidia
                        ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'
                        : 'bg-gray-600'
                    }`}
                  >
                    <div className="w-full h-full rounded-full bg-black p-[2px] flex items-center justify-center overflow-hidden">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={destaque.titulo}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{destaque.icone || '📌'}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-300 truncate max-w-[64px]">
                    {destaque.titulo}
                  </span>
                </button>
              );
            })}

            {destaques.length === 0 && modoVisualizacao === 'empresa' && (
              <p className="text-gray-500 text-sm py-4">
                Nenhum destaque adicionado ainda
              </p>
            )}
          </div>
        )}
      </div>

      {/* Visualizador de Destaque (Fullscreen) */}
      {destaqueAtivo && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Barras de progresso */}
          <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
            {destaqueAtivo.midias.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full bg-white transition-all duration-100 ${
                    index < midiaAtiva ? 'w-full' : index === midiaAtiva ? 'w-1/2' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{destaqueAtivo.icone}</span>
              <span className="text-white font-semibold">{destaqueAtivo.titulo}</span>
            </div>
            <button onClick={() => setDestaqueAtivo(null)}>
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Conteúdo */}
          <div
            className="w-full h-full flex items-center justify-center"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              if (x < rect.width / 2) {
                // Anterior
                if (midiaAtiva > 0) {
                  setMidiaAtiva(midiaAtiva - 1);
                }
              } else {
                // Próxima
                if (midiaAtiva < destaqueAtivo.midias.length - 1) {
                  setMidiaAtiva(midiaAtiva + 1);
                } else {
                  setDestaqueAtivo(null);
                }
              }
            }}
          >
            {destaqueAtivo.midias[midiaAtiva]?.tipo === 'video' ? (
              <video
                src={destaqueAtivo.midias[midiaAtiva].url}
                className="max-w-full max-h-full object-contain"
                autoPlay
                controls
              />
            ) : (
              <img
                src={destaqueAtivo.midias[midiaAtiva]?.url}
                alt=""
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* Navegação lateral */}
          {midiaAtiva > 0 && (
            <button
              onClick={() => setMidiaAtiva(midiaAtiva - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {midiaAtiva < destaqueAtivo.midias.length - 1 && (
            <button
              onClick={() => setMidiaAtiva(midiaAtiva + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PerfilInstagramCandidato;

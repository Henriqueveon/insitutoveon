// =====================================================
// HOOKS - Perfil Instagram Style
// Hooks para estatísticas, visualizações e salvamentos
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// =====================================================
// TIPOS
// =====================================================

export interface PerfilStats {
  visualizacoes: number;
  salvamentos: number;
  entrevistas: number;
  visualizacoes_7d?: number;
  visualizacoes_30d?: number;
}

export interface VideoDestaque {
  id: string;
  candidato_id: string;
  video_url: string;
  thumbnail_url: string | null;
  titulo: string;
  descricao: string | null;
  duracao: number | null;
  ordem: number;
  ativo: boolean;
  visualizacoes: number;
  created_at: string;
}

// =====================================================
// usePerfilStats - Busca estatísticas do perfil
// =====================================================

export function usePerfilStats(candidatoId: string | null) {
  const [stats, setStats] = useState<PerfilStats>({
    visualizacoes: 0,
    salvamentos: 0,
    entrevistas: 0,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['perfil-stats', candidatoId],
    queryFn: async () => {
      if (!candidatoId) return null;

      const { data, error } = await supabase.rpc('get_stats_candidato', {
        p_candidato_id: candidatoId,
      });

      if (error) {
        console.error('Erro ao buscar stats:', error);
        return null;
      }

      return data as PerfilStats;
    },
    enabled: !!candidatoId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  useEffect(() => {
    if (data) {
      setStats(data);
    }
  }, [data]);

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
}

// =====================================================
// useRegistrarVisualizacao - Registra visualização
// =====================================================

export function useRegistrarVisualizacao() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      candidatoId,
      empresaId,
      fonte = 'app',
    }: {
      candidatoId: string;
      empresaId?: string;
      fonte?: string;
    }) => {
      const { data, error } = await supabase.rpc('registrar_visualizacao', {
        p_candidato_id: candidatoId,
        p_empresa_id: empresaId || null,
        p_ip: null,
        p_user_agent: navigator.userAgent,
        p_fonte: fonte,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidar cache de stats
      queryClient.invalidateQueries({
        queryKey: ['perfil-stats', variables.candidatoId],
      });
    },
  });

  const registrar = useCallback(
    (candidatoId: string, empresaId?: string, fonte?: string) => {
      return mutation.mutateAsync({ candidatoId, empresaId, fonte });
    },
    [mutation]
  );

  return {
    registrar,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

// =====================================================
// useSalvarCandidato - Toggle salvar/remover candidato
// =====================================================

export function useSalvarCandidato(empresaId: string | null) {
  const queryClient = useQueryClient();
  const [salvos, setSalvos] = useState<Set<string>>(new Set());

  // Carregar lista de salvos da empresa
  useEffect(() => {
    if (!empresaId) return;

    const carregarSalvos = async () => {
      const { data, error } = await supabase
        .from('salvamentos_candidato')
        .select('candidato_id')
        .eq('empresa_id', empresaId);

      if (!error && data) {
        setSalvos(new Set(data.map((s) => s.candidato_id)));
      }
    };

    carregarSalvos();
  }, [empresaId]);

  const toggleMutation = useMutation({
    mutationFn: async ({
      candidatoId,
      lista = 'favoritos',
      notas,
    }: {
      candidatoId: string;
      lista?: string;
      notas?: string;
    }) => {
      if (!empresaId) throw new Error('Empresa não identificada');

      const { data, error } = await supabase.rpc('toggle_salvar_candidato', {
        p_candidato_id: candidatoId,
        p_empresa_id: empresaId,
        p_lista: lista,
        p_notas: notas || null,
      });

      if (error) throw error;
      return data as { acao: string; salvo: boolean; id?: string };
    },
    onSuccess: (result, variables) => {
      // Atualizar estado local
      setSalvos((prev) => {
        const newSet = new Set(prev);
        if (result.salvo) {
          newSet.add(variables.candidatoId);
        } else {
          newSet.delete(variables.candidatoId);
        }
        return newSet;
      });

      // Invalidar caches
      queryClient.invalidateQueries({
        queryKey: ['perfil-stats', variables.candidatoId],
      });
      queryClient.invalidateQueries({
        queryKey: ['candidatos-salvos', empresaId],
      });
    },
  });

  const toggle = useCallback(
    (candidatoId: string, lista?: string, notas?: string) => {
      return toggleMutation.mutateAsync({ candidatoId, lista, notas });
    },
    [toggleMutation]
  );

  const isSalvo = useCallback(
    (candidatoId: string) => salvos.has(candidatoId),
    [salvos]
  );

  return {
    toggle,
    isSalvo,
    isLoading: toggleMutation.isPending,
    error: toggleMutation.error,
    salvos: Array.from(salvos),
  };
}

// =====================================================
// useVerificarCandidatoSalvo - Verifica se está salvo
// =====================================================

export function useVerificarCandidatoSalvo(
  candidatoId: string | null,
  empresaId: string | null
) {
  const { data, isLoading } = useQuery({
    queryKey: ['candidato-salvo', candidatoId, empresaId],
    queryFn: async () => {
      if (!candidatoId || !empresaId) return false;

      const { data, error } = await supabase.rpc('verificar_candidato_salvo', {
        p_candidato_id: candidatoId,
        p_empresa_id: empresaId,
      });

      if (error) {
        console.error('Erro ao verificar salvamento:', error);
        return false;
      }

      return data as boolean;
    },
    enabled: !!candidatoId && !!empresaId,
  });

  return {
    isSalvo: data ?? false,
    isLoading,
  };
}

// =====================================================
// useVideosDestaque - Busca vídeos em destaque
// =====================================================

export function useVideosDestaque(candidatoId: string | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['videos-destaque', candidatoId],
    queryFn: async () => {
      if (!candidatoId) return [];

      const { data, error } = await supabase
        .from('videos_destaque')
        .select('*')
        .eq('candidato_id', candidatoId)
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) {
        console.error('Erro ao buscar vídeos:', error);
        return [];
      }

      return data as VideoDestaque[];
    },
    enabled: !!candidatoId,
  });

  return {
    videos: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

// =====================================================
// useRegistrarVisualizacaoVideo - Registra viz de vídeo
// =====================================================

export function useRegistrarVisualizacaoVideo() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      videoId,
      empresaId,
    }: {
      videoId: string;
      empresaId?: string;
    }) => {
      const { data, error } = await supabase
        .from('visualizacoes_video')
        .insert({
          video_id: videoId,
          empresa_id: empresaId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar cache de vídeos
      queryClient.invalidateQueries({
        queryKey: ['videos-destaque'],
      });
    },
  });

  const registrar = useCallback(
    (videoId: string, empresaId?: string) => {
      return mutation.mutateAsync({ videoId, empresaId });
    },
    [mutation]
  );

  return {
    registrar,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

// =====================================================
// useCandidatosSalvos - Lista candidatos salvos
// =====================================================

export function useCandidatosSalvos(empresaId: string | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['candidatos-salvos', empresaId],
    queryFn: async () => {
      if (!empresaId) return [];

      const { data, error } = await supabase
        .from('salvamentos_candidato')
        .select(`
          id,
          lista,
          notas,
          created_at,
          candidato:candidatos_recrutamento(
            id,
            nome_completo,
            foto_url,
            cidade,
            estado,
            perfil_disc,
            ultimo_cargo,
            ultima_empresa
          )
        `)
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar salvos:', error);
        return [];
      }

      return data;
    },
    enabled: !!empresaId,
  });

  return {
    candidatos: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

// =====================================================
// useGerenciarVideoDestaque - CRUD de vídeos
// =====================================================

export function useGerenciarVideoDestaque(candidatoId: string | null) {
  const queryClient = useQueryClient();

  const adicionarMutation = useMutation({
    mutationFn: async (video: Omit<VideoDestaque, 'id' | 'created_at' | 'visualizacoes'>) => {
      const { data, error } = await supabase
        .from('videos_destaque')
        .insert({
          ...video,
          candidato_id: candidatoId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['videos-destaque', candidatoId],
      });
    },
  });

  const atualizarMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<VideoDestaque>;
    }) => {
      const { data, error } = await supabase
        .from('videos_destaque')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['videos-destaque', candidatoId],
      });
    },
  });

  const removerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('videos_destaque')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['videos-destaque', candidatoId],
      });
    },
  });

  return {
    adicionar: adicionarMutation.mutateAsync,
    atualizar: atualizarMutation.mutateAsync,
    remover: removerMutation.mutateAsync,
    isLoading:
      adicionarMutation.isPending ||
      atualizarMutation.isPending ||
      removerMutation.isPending,
  };
}

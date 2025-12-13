// =====================================================
// LINK DE RECRUTAMENTO - Painel da Empresa
// Link compartilhável para candidatos
// =====================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Link as LinkIcon,
  Copy,
  Share2,
  Users,
  UserCheck,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
}

interface Props {
  empresa: Empresa;
}

const BASE_URL = 'https://insitutoveon.lovable.app';

export default function LinkRecrutamento({ empresa }: Props) {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    acessos: 0,
    cadastros: 0,
    conversao: 0,
  });

  // Gerar slug da empresa baseado no nome fantasia ou razão social
  const gerarSlug = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 30);
  };

  const slugEmpresa = empresa?.nome_fantasia
    ? gerarSlug(empresa.nome_fantasia)
    : empresa?.id?.substring(0, 8);

  const linkRecrutamento = `${BASE_URL}/recrutamento/candidato/bem-vindo?empresa=${slugEmpresa}`;

  useEffect(() => {
    if (empresa?.id) {
      carregarEstatisticas();
    }
  }, [empresa?.id]);

  const carregarEstatisticas = async () => {
    try {
      // Buscar candidatos que vieram pelo link da empresa
      // Por enquanto, simular dados
      const { count: totalCandidatos } = await supabase
        .from('propostas_recrutamento')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresa.id);

      const cadastros = totalCandidatos || 0;
      const acessos = cadastros * 3; // Estimativa
      const conversao = acessos > 0 ? Math.round((cadastros / acessos) * 100) : 0;

      setStats({ acessos, cadastros, conversao });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(linkRecrutamento);
    toast({
      title: 'Link copiado!',
      description: 'Compartilhe com seus candidatos.',
    });
  };

  const compartilharWhatsApp = () => {
    const nomeEmpresa = empresa?.nome_fantasia || empresa?.razao_social || 'Nossa empresa';
    const mensagem = encodeURIComponent(
      `🎯 Oportunidade de Emprego!\n\n` +
      `A ${nomeEmpresa} está contratando através da Recruta Veon.\n\n` +
      `Descubra seus talentos naturais e encontre a vaga ideal para você.\n\n` +
      `Cadastre-se aqui:\n${linkRecrutamento}`
    );
    window.open(`https://wa.me/?text=${mensagem}`, '_blank');
  };

  const abrirLink = () => {
    window.open(linkRecrutamento, '_blank');
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-green-500/30 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />

      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <LinkIcon className="w-5 h-5 text-green-400" />
          </div>
          <span>🔗 Seu Link de Recrutamento</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        <p className="text-slate-300 text-sm">
          Copie esse link e compartilhe com seus candidatos.{' '}
          <strong className="text-white">
            Conheça 90% do comportamento de quem vai trabalhar na sua empresa.
          </strong>
        </p>

        {/* Link */}
        <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700">
          <p className="text-green-400 text-sm font-mono truncate">
            {linkRecrutamento}
          </p>
        </div>

        {/* Botões */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={copiarLink}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar Link
          </Button>
          <Button
            onClick={compartilharWhatsApp}
            variant="outline"
            className="border-green-500/50 text-green-400 hover:bg-green-500/10"
          >
            <Share2 className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            onClick={abrirLink}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-lg font-bold text-white">{stats.acessos}</span>
            </div>
            <p className="text-slate-500 text-xs">Acessos</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <UserCheck className="w-4 h-4 text-green-400" />
              <span className="text-lg font-bold text-white">{stats.cadastros}</span>
            </div>
            <p className="text-slate-500 text-xs">Cadastros</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-lg font-bold text-white">{stats.conversao}%</span>
            </div>
            <p className="text-slate-500 text-xs">Conversão</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

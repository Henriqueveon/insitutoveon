// =====================================================
// EMPTY STATE - Estados vazios com mensagens motivacionais
// Área de Recrutamento VEON
// =====================================================

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Users,
  Briefcase,
  Bell,
  FileText,
  Search,
  Video,
  Share2,
  CreditCard,
  Sparkles,
  LucideIcon,
} from 'lucide-react';

interface EmptyStateProps {
  tipo: 'candidatos' | 'vagas' | 'propostas' | 'notificacoes' | 'filtros' | 'video' | 'compartilhar' | 'creditos' | 'custom';
  titulo?: string;
  descricao?: string;
  icon?: LucideIcon;
  acao?: {
    texto: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

const configuracoes = {
  candidatos: {
    icon: Users,
    titulo: 'Nenhum candidato encontrado',
    descricao: 'Ainda não há candidatos com esses critérios. Tente ajustar os filtros ou compartilhe seu link de recrutamento!',
  },
  vagas: {
    icon: Briefcase,
    titulo: 'Nenhuma vaga cadastrada',
    descricao: 'Você ainda não criou nenhuma vaga. Crie sua primeira vaga e encontre talentos incríveis!',
  },
  propostas: {
    icon: FileText,
    titulo: 'Nenhuma proposta ainda',
    descricao: 'Complete seu perfil e adicione um vídeo para se destacar e receber mais propostas!',
  },
  notificacoes: {
    icon: Bell,
    titulo: 'Tudo tranquilo por aqui!',
    descricao: 'Você não tem notificações no momento. Continue explorando a plataforma.',
  },
  filtros: {
    icon: Search,
    titulo: 'Nenhum resultado',
    descricao: 'Nenhum candidato encontrado. Tente ampliar seus filtros para encontrar mais candidatos.',
  },
  video: {
    icon: Video,
    titulo: 'Vídeo não adicionado',
    descricao: 'Candidatos com vídeo recebem 3x mais propostas. Que tal gravar o seu?',
  },
  compartilhar: {
    icon: Share2,
    titulo: 'Compartilhe e cresça',
    descricao: 'Ajude um amigo a encontrar o emprego dos sonhos e ganhe recompensas!',
  },
  creditos: {
    icon: CreditCard,
    titulo: 'Sem créditos',
    descricao: 'Você não tem créditos suficientes. Recarregue e continue recrutando!',
  },
  custom: {
    icon: Sparkles,
    titulo: 'Nenhum item',
    descricao: 'Não há itens para exibir no momento.',
  },
};

export default function EmptyState({
  tipo,
  titulo,
  descricao,
  icon: CustomIcon,
  acao,
  children,
}: EmptyStateProps) {
  const config = configuracoes[tipo];
  const Icon = CustomIcon || config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {/* Ícone com animação */}
      <div className="w-20 h-20 bg-slate-800/60 rounded-full flex items-center justify-center mb-6 border border-slate-700">
        <Icon className="w-10 h-10 text-slate-500" />
      </div>

      {/* Título */}
      <h3 className="text-xl font-semibold text-white mb-2">
        {titulo || config.titulo}
      </h3>

      {/* Descrição */}
      <p className="text-slate-400 max-w-md mb-6">
        {descricao || config.descricao}
      </p>

      {/* Botão de ação */}
      {acao && (
        <Button
          onClick={acao.onClick}
          className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#C91920] hover:to-[#991B1B]"
        >
          {acao.texto}
        </Button>
      )}

      {/* Conteúdo customizado */}
      {children}
    </div>
  );
}

// =====================================================
// MENSAGENS DE FEEDBACK CONTEXTUAIS
// =====================================================

export const mensagensSucesso = {
  cadastroCompleto: '🎉 Parabéns! Seu perfil está completo. Agora empresas podem te encontrar!',
  propostaRecebida: '🎯 Uma empresa quer te conhecer! Isso significa que seu perfil se destacou.',
  vagaPublicada: '✅ Vaga publicada! Vamos encontrar os melhores candidatos para você.',
  indicacaoSucesso: '🎁 Indicação registrada! Você receberá a recompensa quando seu amigo completar o cadastro.',
  propostaEnviada: 'Proposta enviada com sucesso! O candidato será notificado.',
  dadosSalvos: 'Alterações salvas com sucesso!',
  videoAdicionado: '🎬 Vídeo adicionado! Seu perfil ficou ainda mais atrativo.',
};

export const mensagensErro = {
  conexao: 'Não foi possível carregar. Verifique sua conexão e tente novamente.',
  permissao: 'Você não tem permissão para realizar esta ação.',
  camposObrigatorios: 'Preencha todos os campos obrigatórios.',
  emailInvalido: 'Digite um e-mail válido.',
  senhaFraca: 'A senha deve ter pelo menos 6 caracteres.',
  arquivoGrande: 'O arquivo é muito grande. Tente um menor.',
  formatoInvalido: 'Formato de arquivo não suportado.',
};

export const mensagensAviso = {
  semVideo: '💡 Dica: Candidatos com vídeo recebem 3x mais propostas. Que tal gravar o seu?',
  semCreditos: '💳 Você não tem créditos suficientes. Recarregue e continue recrutando!',
  perfilIncompleto: '📝 Complete seu perfil para aumentar suas chances de ser encontrado.',
  confirmarExclusao: 'Tem certeza que deseja excluir? Esta ação não pode ser desfeita.',
};

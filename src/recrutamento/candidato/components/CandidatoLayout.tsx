// =====================================================
// LAYOUT CANDIDATO - Área de Recrutamento VEON
// Design Instagram-like com contraste otimizado
// =====================================================

import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Home,
  Mail,
  FileText,
  User,
  LogOut,
  Settings,
  Gift,
  Briefcase,
} from 'lucide-react';
import NotificationBell from '@/components/recrutamento/NotificationBell';
import { StatusBadge } from './StatusIndicador';

interface Candidato {
  id: string;
  nome_completo: string;
  foto_url: string | null;
  video_url?: string | null;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  status: string;
  perfil_disc: string | null;
  cadastro_completo: boolean;
  email_verificado?: boolean;
}

const menuItems = [
  { path: '/recrutamento/candidato/inicio', label: 'Início', icon: Home },
  { path: '/recrutamento/candidato/vagas', label: 'Vagas', icon: Briefcase },
  { path: '/recrutamento/candidato/meu-curriculo', label: 'Currículo', icon: FileText },
  { path: '/recrutamento/candidato/configuracoes', label: 'Perfil', icon: Settings },
];

export default function CandidatoLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [candidato, setCandidato] = useState<Candidato | null>(null);
  const [propostasNovas, setPropostasNovas] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarCandidato();
  }, []);

  const carregarCandidato = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Sem autenticação - redirecionar para login
        navigate('/recrutamento/candidato/login');
        return;
      }

      // 1. Primeiro tentar buscar pelo auth_user_id
      let { data, error } = await supabase
        .from('candidatos_recrutamento')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      // 2. Se não encontrou por auth_user_id, tentar por email (migração)
      if (error || !data) {
        const { data: dataByEmail, error: errorByEmail } = await supabase
          .from('candidatos_recrutamento')
          .select('*')
          .eq('email', user.email)
          .single();

        if (errorByEmail || !dataByEmail) {
          // Candidato não existe - redirecionar para cadastro
          navigate('/recrutamento/candidato/bem-vindo');
          return;
        }

        data = dataByEmail;

        // 3. Vincular auth_user_id se ainda não estiver vinculado
        if (!dataByEmail.auth_user_id) {
          await supabase.rpc('vincular_auth_candidato', {
            p_candidato_id: dataByEmail.id,
            p_auth_user_id: user.id,
          });
        }
      }

      setCandidato(data);
      carregarPropostasNovas(data.id);
    } catch (error) {
      console.error('Erro ao carregar candidato:', error);
      navigate('/recrutamento/candidato/login');
    } finally {
      setIsLoading(false);
    }
  };

  const carregarPropostasNovas = async (candidatoId: string) => {
    const { count } = await supabase
      .from('solicitacoes_entrevista')
      .select('*', { count: 'exact', head: true })
      .eq('candidato_id', candidatoId)
      .eq('status', 'aguardando_candidato');

    setPropostasNovas(count || 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/recrutamento/candidato/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-[#E31E24]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header - Instagram Style */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo e Saudação */}
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-[#E31E24] ring-offset-2 ring-offset-black">
              <AvatarImage src={candidato?.foto_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-[#E31E24] to-[#003DA5] text-white font-bold text-sm">
                {candidato?.nome_completo?.charAt(0) || 'V'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-semibold text-base leading-tight">
                {candidato?.nome_completo?.split(' ')[0]}
              </p>
              {candidato && <StatusBadge candidato={candidato} />}
            </div>
          </div>

          {/* Ações - Maiores para touch */}
          <div className="flex items-center gap-1">
            {/* Botão de Indicação */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/10 relative"
              onClick={() => navigate('/recrutamento/candidato/inicio#indicacao')}
            >
              <Gift className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
            </Button>

            {candidato && (
              <NotificationBell
                usuarioId={candidato.id}
                tipoUsuario="candidato"
                baseUrl="/recrutamento/candidato"
              />
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/10">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 bg-zinc-900 border-zinc-800 shadow-2xl">
                <div className="px-3 py-2.5 border-b border-zinc-800">
                  <p className="font-semibold text-white text-sm">{candidato?.nome_completo}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{candidato?.email}</p>
                </div>
                <DropdownMenuItem
                  className="text-white hover:bg-white/10 cursor-pointer py-3 px-3"
                  onClick={() => navigate('/recrutamento/candidato/configuracoes')}
                >
                  <Settings className="w-4 h-4 mr-3 text-zinc-400" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  className="text-red-400 hover:bg-red-500/10 cursor-pointer py-3 px-3"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sair da conta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Page Content - Mais padding */}
      <main className="flex-1 px-4 py-5 pb-24">
        <Outlet context={{ candidato, recarregarCandidato: carregarCandidato, propostasNovas }} />
      </main>

      {/* Bottom Navigation - Instagram Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white/10 safe-area-bottom">
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const showBadge = item.path.includes('vagas') && propostasNovas > 0;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center py-2 px-5 relative"
              >
                <div className="relative">
                  <item.icon
                    className={`w-6 h-6 transition-all ${
                      isActive ? 'text-white scale-110' : 'text-zinc-500'
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[#E31E24] text-white text-[10px] font-bold rounded-full px-1">
                      {propostasNovas}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${
                  isActive ? 'text-white' : 'text-zinc-500'
                }`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// =====================================================
// LAYOUT CANDIDATO - Área de Recrutamento VEON
// Mobile-first com menu inferior
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
  Settings,
  LogOut,
  ChevronRight,
  User,
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
}

const menuItems = [
  { path: '/recrutamento/candidato/inicio', label: 'Início', icon: Home },
  { path: '/recrutamento/candidato/propostas', label: 'Propostas', icon: Mail },
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E31E24]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 h-16 bg-slate-800/95 backdrop-blur border-b border-slate-700">
        <div className="flex items-center justify-between h-full px-4">
          {/* Saudação */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={candidato?.foto_url || undefined} />
              <AvatarFallback className="bg-[#E31E24] text-white">
                {candidato?.nome_completo?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-white font-medium">
                Olá, {candidato?.nome_completo?.split(' ')[0]}!
              </p>
              {/* Status Badge - OFF/Disponível */}
              {candidato && <StatusBadge candidato={candidato} />}
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center space-x-2">
            {/* Notificações */}
            {candidato && (
              <NotificationBell
                usuarioId={candidato.id}
                tipoUsuario="candidato"
                baseUrl="/recrutamento/candidato"
              />
            )}

            {/* Menu do usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-white">{candidato?.nome_completo}</p>
                  <p className="text-xs text-slate-400">{candidato?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem
                  className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                  onClick={() => navigate('/recrutamento/candidato/configuracoes')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem
                  className="text-red-400 hover:text-red-300 hover:bg-slate-700 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 p-4 pb-24">
        <Outlet context={{ candidato, recarregarCandidato: carregarCandidato, propostasNovas }} />
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800 border-t border-slate-700 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const showBadge = item.path.includes('propostas') && propostasNovas > 0;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full relative transition-colors ${
                  isActive
                    ? 'text-[#E31E24]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="relative">
                  <item.icon className="w-6 h-6" />
                  {showBadge && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 bg-[#E31E24] text-[10px]">
                      {propostasNovas}
                    </Badge>
                  )}
                </div>
                <span className="text-xs mt-1">{item.label}</span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#E31E24] rounded-b-full" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// =====================================================
// LAYOUT EMPRESA - Estilo Rede Social Mobile-First
// Bottom Nav Mobile + Sidebar Desktop
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
  LayoutDashboard,
  Search,
  FileText,
  Briefcase,
  CheckCircle,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Building2,
  Users,
  Bell,
  Gift,
  MoreHorizontal,
  Home,
  UserCheck,
  Wallet,
  Info,
} from 'lucide-react';
import NotificationBell from '@/components/recrutamento/NotificationBell';

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  socio_nome: string;
  socio_foto_url: string | null;
  creditos: number;
  cadastro_completo?: boolean;
  logo_url?: string | null;
}

// Menu items completo (para desktop sidebar e dropdown mobile)
const menuItems = [
  { path: '/recrutamento/empresa/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/recrutamento/empresa/buscar-candidatos', label: 'Buscar Candidatos', icon: Search },
  { path: '/recrutamento/empresa/minhas-vagas', label: 'Minhas Vagas', icon: FileText },
  { path: '/recrutamento/empresa/em-processo', label: 'Em Processo', icon: Briefcase },
  { path: '/recrutamento/empresa/contratados', label: 'Contratados', icon: CheckCircle },
  { path: '/recrutamento/empresa/creditos', label: 'Créditos', icon: CreditCard },
  { path: '/recrutamento/empresa/sobre-empresa', label: 'Sobre a Empresa', icon: Building2 },
  { path: '/recrutamento/empresa/configuracoes', label: 'Configurações', icon: Settings },
];

// Bottom nav items (mobile - máximo 5)
const bottomNavItems = [
  { path: '/recrutamento/empresa/dashboard', label: 'Início', icon: Home },
  { path: '/recrutamento/empresa/buscar-candidatos', label: 'Buscar', icon: Search },
  { path: '/recrutamento/empresa/minhas-vagas', label: 'Vagas', icon: FileText },
  { path: '/recrutamento/empresa/em-processo', label: 'Processo', icon: Users },
  { path: '/recrutamento/empresa/contratados', label: 'Contratados', icon: UserCheck },
];

export default function EmpresaLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarEmpresa();
  }, []);

  // Redirecionar para completar cadastro se necessário
  useEffect(() => {
    if (empresa && !isLoading) {
      const isCompletarCadastroPage = location.pathname === '/recrutamento/empresa/completar-cadastro';
      
      // Se cadastro não está completo e não está na página de completar
      if (empresa.cadastro_completo === false && !isCompletarCadastroPage) {
        navigate('/recrutamento/empresa/completar-cadastro', { replace: true });
      }
    }
  }, [empresa, isLoading, location.pathname, navigate]);

  const carregarEmpresa = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const empresaId = localStorage.getItem('veon_empresa_id');
        if (empresaId) {
          const { data } = await supabase
            .from('empresas_recrutamento')
            .select('id, razao_social, nome_fantasia, socio_nome, socio_foto_url, creditos, logo_url, cadastro_completo')
            .eq('id', empresaId)
            .single();

          if (data) {
            setEmpresa(data as any);
            setIsLoading(false);
            return;
          }
        }
        navigate('/recrutamento/empresa/login');
        return;
      }

      const { data, error } = await supabase
        .from('empresas_recrutamento')
        .select('id, razao_social, nome_fantasia, socio_nome, socio_foto_url, creditos, logo_url, cadastro_completo')
        .eq('socio_email', user.email)
        .single();

      if (error || !data) {
        const empresaId = localStorage.getItem('veon_empresa_id');
        if (empresaId) {
          const { data: dataLocal } = await supabase
            .from('empresas_recrutamento')
            .select('id, razao_social, nome_fantasia, socio_nome, socio_foto_url, creditos, logo_url, cadastro_completo')
            .eq('id', empresaId)
            .single();

          if (dataLocal) {
            setEmpresa(dataLocal as any);
            setIsLoading(false);
            return;
          }
        }
        toast({
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar os dados da empresa.',
          variant: 'destructive',
        });
        navigate('/recrutamento/empresa/login');
        return;
      }

      setEmpresa(data as any);
      localStorage.setItem('veon_empresa_id', (data as any).id);
    } catch (error) {
      console.error('Erro ao carregar empresa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('veon_empresa_id');
    navigate('/recrutamento/empresa/login');
  };

  const formatarCreditos = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const primeiroNome = empresa?.socio_nome?.split(' ')[0] || 'Empresa';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-[#E31E24]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* ==================== SIDEBAR DESKTOP ==================== */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-zinc-900 border-r border-zinc-800">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-zinc-800">
          <div className="w-10 h-10 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="ml-3 text-lg font-bold text-white">Veon</span>
          <span className="ml-1 text-sm text-zinc-500">Empresa</span>
        </div>

        {/* Menu Desktop */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-white text-black font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-black' : ''}`} />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Créditos Desktop */}
        <div className="p-4 border-t border-zinc-800">
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-xs text-emerald-400/70 mb-1 font-medium">Saldo disponível</p>
            <p className="text-2xl font-bold text-emerald-400">
              {formatarCreditos(empresa?.creditos || 0)}
            </p>
            <Button
              size="sm"
              className="w-full mt-3 bg-white text-black font-semibold hover:bg-white/90"
              onClick={() => navigate('/recrutamento/empresa/creditos')}
            >
              Adicionar Créditos
            </Button>
          </div>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* ==================== HEADER MOBILE/DESKTOP ==================== */}
        <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between h-14 px-4">
            {/* Left - Avatar e Saudação */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-[#E31E24]/50">
                <AvatarImage src={empresa?.logo_url || empresa?.socio_foto_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-[#E31E24] to-[#003DA5] text-white font-bold">
                  {empresa?.nome_fantasia?.charAt(0) || empresa?.razao_social?.charAt(0) || 'E'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-white font-semibold text-sm leading-tight">
                  Olá, {primeiroNome}
                </p>
                <p className="text-zinc-500 text-xs">
                  {empresa?.nome_fantasia || empresa?.razao_social}
                </p>
              </div>
            </div>

            {/* Right - Ações */}
            <div className="flex items-center gap-2">
              {/* Créditos Badge Mobile */}
              <button
                onClick={() => navigate('/recrutamento/empresa/creditos')}
                className="lg:hidden flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1.5 active:scale-95 transition-transform"
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">
                  {formatarCreditos(empresa?.creditos || 0)}
                </span>
              </button>

              {/* Indicação */}
              <button
                onClick={() => navigate('/recrutamento/empresa/indicacao')}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-colors active:scale-95"
              >
                <Gift className="w-5 h-5 text-purple-400" />
              </button>

              {/* Notificações */}
              {empresa && (
                <NotificationBell
                  usuarioId={empresa.id}
                  tipoUsuario="empresa"
                  baseUrl="/recrutamento/empresa"
                />
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-white/10 rounded-xl transition-colors active:scale-95">
                    <MoreHorizontal className="w-5 h-5 text-white/70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-zinc-900 border-zinc-800 shadow-2xl rounded-2xl p-1">
                  {/* Header do menu */}
                  <div className="px-3 py-3 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={empresa?.logo_url || empresa?.socio_foto_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-[#E31E24] to-[#003DA5] text-white font-bold">
                          {empresa?.nome_fantasia?.charAt(0) || 'E'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-white text-sm">{empresa?.socio_nome}</p>
                        <p className="text-zinc-400 text-xs">{empresa?.nome_fantasia}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items mobile (os que não estão na bottom nav) */}
                  <div className="py-1 lg:hidden">
                    <DropdownMenuItem
                      className="text-white hover:bg-white/10 cursor-pointer py-3 px-3 rounded-xl"
                      onClick={() => navigate('/recrutamento/empresa/creditos')}
                    >
                      <CreditCard className="w-4 h-4 mr-3 text-emerald-400" />
                      Créditos
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-white hover:bg-white/10 cursor-pointer py-3 px-3 rounded-xl"
                      onClick={() => navigate('/recrutamento/empresa/sobre-empresa')}
                    >
                      <Building2 className="w-4 h-4 mr-3 text-blue-400" />
                      Sobre a Empresa
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuItem
                    className="text-white hover:bg-white/10 cursor-pointer py-3 px-3 rounded-xl"
                    onClick={() => navigate('/recrutamento/empresa/configuracoes')}
                  >
                    <Settings className="w-4 h-4 mr-3 text-zinc-400" />
                    Configurações
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-zinc-800 my-1" />

                  <DropdownMenuItem
                    className="text-red-400 hover:bg-red-500/10 cursor-pointer py-3 px-3 rounded-xl"
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

        {/* ==================== PAGE CONTENT ==================== */}
        <main className="flex-1 px-4 py-4 pb-24 lg:pb-6 lg:px-6">
          <Outlet context={{ empresa, recarregarEmpresa: carregarEmpresa }} />
        </main>

        {/* ==================== BOTTOM NAV MOBILE ==================== */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
          <div className="flex items-center justify-around h-16 px-2">
            {bottomNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all active:scale-95 ${
                    isActive ? 'text-white' : 'text-zinc-500'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-gradient-to-br from-[#E31E24] to-[#003DA5]' : ''}`}>
                    <item.icon className={`${isActive ? 'w-5 h-5' : 'w-5 h-5'}`} />
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

// =====================================================
// LAYOUT EMPRESA - Área de Recrutamento VEON
// Sidebar + Header + Content
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
}

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

export default function EmpresaLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados da empresa
  useEffect(() => {
    carregarEmpresa();
  }, []);

  const carregarEmpresa = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Tentar recuperar do localStorage (empresa sem auth - cadastro rápido)
        const empresaId = localStorage.getItem('veon_empresa_id');
        if (empresaId) {
          const { data } = await supabase
            .from('empresas_recrutamento')
            .select('id, razao_social, nome_fantasia, socio_nome, socio_foto_url, creditos')
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

      // Buscar empresa pelo email do usuário autenticado
      const { data, error } = await supabase
        .from('empresas_recrutamento')
        .select('id, razao_social, nome_fantasia, socio_nome, socio_foto_url, creditos')
        .eq('socio_email', user.email)
        .single();

      if (error || !data) {
        // Tentar pelo localStorage como fallback
        const empresaId = localStorage.getItem('veon_empresa_id');
        if (empresaId) {
          const { data: dataLocal } = await supabase
            .from('empresas_recrutamento')
            .select('id, razao_social, nome_fantasia, socio_nome, socio_foto_url, creditos')
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
      localStorage.setItem('veon_empresa_id', (data as any).id); // Salvar para sessões futuras
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-[#E31E24]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-zinc-900 border-r border-zinc-800">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-zinc-800">
          <div className="w-10 h-10 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="ml-3 text-lg font-bold text-white">Veon</span>
          <span className="ml-1 text-sm text-zinc-500">Empresa</span>
        </div>

        {/* Menu */}
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

        {/* Créditos */}
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

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-zinc-900 border-r border-zinc-800">
            <div className="flex items-center justify-between h-16 px-5 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Veon</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <nav className="px-3 py-4 space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-white text-black font-semibold'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-black' : ''}`} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Créditos mobile */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
              <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border border-emerald-500/30 rounded-xl p-4">
                <p className="text-xs text-emerald-400/70 mb-1">Saldo</p>
                <p className="text-xl font-bold text-emerald-400">
                  {formatarCreditos(empresa?.creditos || 0)}
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 h-14 bg-black/95 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden lg:flex items-center text-sm">
              <span className="text-zinc-500">
                {empresa?.nome_fantasia || empresa?.razao_social}
              </span>
              <ChevronRight className="w-4 h-4 mx-2 text-zinc-700" />
              <span className="text-white font-medium">
                {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Créditos - Mobile */}
              <div className="lg:hidden bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-3 py-1.5">
                <span className="text-sm font-bold text-emerald-400">
                  {formatarCreditos(empresa?.creditos || 0)}
                </span>
              </div>

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
                  <Button variant="ghost" className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 h-10 px-2">
                    <Avatar className="h-8 w-8 ring-2 ring-white/20">
                      <AvatarImage src={empresa?.socio_foto_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-[#E31E24] to-[#003DA5] text-white font-bold text-sm">
                        {empresa?.socio_nome?.charAt(0) || 'E'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium">
                      {empresa?.socio_nome?.split(' ')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 bg-zinc-900 border-zinc-800 shadow-2xl">
                  <div className="px-3 py-2.5 border-b border-zinc-800">
                    <p className="font-semibold text-white text-sm">{empresa?.socio_nome}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">{empresa?.nome_fantasia}</p>
                  </div>
                  <DropdownMenuItem
                    className="text-white hover:bg-white/10 cursor-pointer py-3 px-3"
                    onClick={() => navigate('/recrutamento/empresa/configuracoes')}
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

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet context={{ empresa, recarregarEmpresa: carregarEmpresa }} />
        </main>
      </div>
    </div>
  );
}

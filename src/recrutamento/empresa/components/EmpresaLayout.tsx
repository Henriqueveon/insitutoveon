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
  cadastro_completo: boolean;
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
            .select('id, razao_social, nome_fantasia, socio_nome, socio_foto_url, creditos, cadastro_completo')
            .eq('id', empresaId)
            .single();

          if (data) {
            setEmpresa(data);
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
        .select('id, razao_social, nome_fantasia, socio_nome, socio_foto_url, creditos, cadastro_completo')
        .eq('socio_email', user.email)
        .single();

      if (error || !data) {
        // Tentar pelo localStorage como fallback
        const empresaId = localStorage.getItem('veon_empresa_id');
        if (empresaId) {
          const { data: dataLocal } = await supabase
            .from('empresas_recrutamento')
            .select('id, razao_social, nome_fantasia, socio_nome, socio_foto_url, creditos, cadastro_completo')
            .eq('id', empresaId)
            .single();

          if (dataLocal) {
            setEmpresa(dataLocal);
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

      setEmpresa(data);
      localStorage.setItem('veon_empresa_id', data.id); // Salvar para sessões futuras
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E31E24]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-800 border-r border-slate-700">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-slate-700">
          <div className="w-10 h-10 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="ml-3 text-lg font-bold text-white">Veon</span>
          <span className="ml-1 text-sm text-slate-400">Recrutamento</span>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#E31E24]/20 text-[#E31E24] border-l-4 border-[#E31E24]'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Créditos */}
        <div className="p-4 border-t border-slate-700">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">Saldo disponível</p>
            <p className="text-xl font-bold text-green-400">
              {formatarCreditos(empresa?.creditos || 0)}
            </p>
            <Button
              size="sm"
              className="w-full mt-3 bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
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
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-slate-800 border-r border-slate-700">
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-[#E31E24] to-[#003DA5] rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="ml-3 text-lg font-bold text-white">Veon</span>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <nav className="px-4 py-4 space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#E31E24]/20 text-[#E31E24]'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 bg-slate-800/95 backdrop-blur border-b border-slate-700">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden lg:flex items-center text-sm">
              <span className="text-slate-400">
                {empresa?.nome_fantasia || empresa?.razao_social}
              </span>
              <ChevronRight className="w-4 h-4 mx-2 text-slate-600" />
              <span className="text-white font-medium">
                {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Créditos - Mobile */}
              <div className="lg:hidden bg-slate-700/50 rounded-lg px-3 py-1">
                <span className="text-xs text-slate-400">Saldo:</span>
                <span className="ml-1 text-sm font-bold text-green-400">
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
                  <Button variant="ghost" className="flex items-center space-x-2 text-slate-300 hover:text-white">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={empresa?.socio_foto_url || undefined} />
                      <AvatarFallback className="bg-[#E31E24] text-white">
                        {empresa?.socio_nome?.charAt(0) || 'E'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm">
                      {empresa?.socio_nome?.split(' ')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-white">{empresa?.socio_nome}</p>
                    <p className="text-xs text-slate-400">{empresa?.nome_fantasia}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                    onClick={() => navigate('/recrutamento/empresa/configuracoes')}
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
        <main className="p-4 lg:p-6">
          <Outlet context={{ empresa, recarregarEmpresa: carregarEmpresa }} />
        </main>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Building2,
  UserSearch,
  FileText,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/painel/dashboard', icon: LayoutDashboard },
  { name: 'Meus Analistas', href: '/painel/analistas', icon: Users },
  { name: 'Todos os Candidatos', href: '/painel/candidatos', icon: ClipboardList },
  { name: 'Novo Analista', href: '/painel/novo-analista', icon: UserPlus },
];

const recrutamentoSubmenu = [
  { name: 'Dashboard', href: '/painel/recrutamento', icon: LayoutDashboard },
  { name: 'Empresas', href: '/painel/recrutamento/empresas', icon: Building2 },
  { name: 'Candidatos', href: '/painel/recrutamento/candidatos', icon: UserSearch },
  { name: 'Vagas', href: '/painel/recrutamento/vagas', icon: FileText },
  { name: 'Entrevistas', href: '/painel/recrutamento/entrevistas', icon: Calendar },
  { name: 'Financeiro', href: '/painel/recrutamento/financeiro', icon: DollarSign },
];

export default function PainelLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recrutamentoOpen, setRecrutamentoOpen] = useState(
    location.pathname.includes('/painel/recrutamento')
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/painel/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const displayName = profile?.nome_completo || user?.email || 'Usuário';

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-slate-800 border-r border-slate-700 transform transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          <Logo />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gradient-to-r from-[#00D9FF]/20 to-[#0099CC]/20 text-[#00D9FF] border border-[#00D9FF]/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}

          {/* Área de Recrutamento - Submenu expansível */}
          <div className="pt-2">
            <button
              onClick={() => setRecrutamentoOpen(!recrutamentoOpen)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                location.pathname.includes('/painel/recrutamento')
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5" />
                Área de Recrutamento
              </div>
              <ChevronRight
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  recrutamentoOpen && 'rotate-90'
                )}
              />
            </button>

            {/* Submenu */}
            <div
              className={cn(
                'overflow-hidden transition-all duration-200',
                recrutamentoOpen ? 'max-h-96 mt-1' : 'max-h-0'
              )}
            >
              <div className="ml-4 pl-4 border-l border-slate-700 space-y-1">
                {recrutamentoSubmenu.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    end={item.href === '/painel/recrutamento'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      )
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          {/* Configurações */}
          <NavLink
            to="/painel/configuracoes"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-2',
                isActive
                  ? 'bg-gradient-to-r from-[#00D9FF]/20 to-[#0099CC]/20 text-[#00D9FF] border border-[#00D9FF]/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              )
            }
          >
            <Settings className="w-5 h-5" />
            Configurações
          </NavLink>
        </nav>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-slate-700 text-white text-xs">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <header className="h-16 bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-30">
          <div className="h-full px-4 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop breadcrumb placeholder */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-white">Painel do Gestor</h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-slate-700 text-white text-xs">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block text-sm">{displayName.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                  <DropdownMenuLabel className="text-white">
                    <div className="flex flex-col">
                      <span>{displayName}</span>
                      <span className="text-xs font-normal text-slate-400">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    onClick={() => navigate('/painel/configuracoes')}
                    className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-400 hover:text-red-300 hover:bg-slate-700 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

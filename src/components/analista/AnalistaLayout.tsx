import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthAnalista, UsuarioAnalista } from '@/context/AuthAnalistaContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Users,
  Link2,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/analista/dashboard', icon: LayoutDashboard },
  { name: 'Meus Candidatos', href: '/analista/candidatos', icon: Users },
  { name: 'Configurações', href: '/analista/configuracoes', icon: Settings },
];

export default function AnalistaLayout() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuthAnalista();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const analista = usuario as UsuarioAnalista;

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const displayName = analista?.nome || 'Analista';
  const empresaName = analista?.empresa || null;

  return (
    <div className="min-h-screen bg-white">
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
          'fixed top-0 left-0 z-50 h-full w-64 bg-[#003DA5] transform transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar header - Logo */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#003DA5] font-bold text-lg">V</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg">Instituto VEON</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-white/20">
              <AvatarFallback className="bg-white text-[#003DA5] font-bold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{displayName}</p>
              {empresaName && (
                <div className="flex items-center gap-1 text-white/70 text-sm">
                  <Building2 className="w-3 h-3" />
                  <span className="truncate">{empresaName}</span>
                </div>
              )}
            </div>
          </div>
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
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white text-[#003DA5]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer - Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="h-full px-4 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-[#003DA5]"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Welcome message */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-gray-600">Bem-vindo,</span>
              <span className="text-[#003DA5] font-semibold">{displayName}</span>
              {empresaName && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">{empresaName}</span>
                </>
              )}
            </div>

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-[#003DA5] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-[#003DA5] font-bold">VEON</span>
            </div>

            {/* Logout button desktop */}
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="hidden lg:flex text-gray-600 hover:text-[#E31E24] hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>

            {/* Mobile placeholder for alignment */}
            <div className="lg:hidden w-6" />
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 bg-gray-50 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthAnalista } from '@/context/AuthAnalistaContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteAnalistaProps {
  children: React.ReactNode;
}

export default function ProtectedRouteAnalista({ children }: ProtectedRouteAnalistaProps) {
  const { isAuthenticated, isLoading, tipoUsuario } = useAuthAnalista();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#00D9FF] mx-auto" />
          <p className="mt-4 text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (tipoUsuario !== 'analista') {
    // Se é fundador tentando acessar área do analista, redirecionar para área do fundador
    return <Navigate to="/fundador/dashboard" replace />;
  }

  return <>{children}</>;
}

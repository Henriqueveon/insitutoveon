import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Tipos de usuário
export type TipoUsuario = 'fundador' | 'analista';

export interface UsuarioFundador {
  id: string;
  email: string;
  nome: string;
}

export interface UsuarioAnalista {
  id: string;
  email: string;
  nome: string;
  telefone: string | null;
  empresa: string | null;
  tipo: string;
  licencas_total: number;
  licencas_usadas: number;
  link_unico: string;
}

export type Usuario = UsuarioFundador | UsuarioAnalista;

interface SessionData {
  tipo: TipoUsuario;
  usuario: Usuario;
  expiresAt: number;
}

interface AuthAnalistaContextType {
  usuario: Usuario | null;
  tipoUsuario: TipoUsuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  atualizarUsuario: (dados: Partial<Usuario>) => void;
}

const SESSION_KEY = 'veon_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas em ms

const AuthAnalistaContext = createContext<AuthAnalistaContextType | undefined>(undefined);

export function AuthAnalistaProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar sessão do localStorage ao iniciar
  useEffect(() => {
    const loadSession = () => {
      try {
        const sessionStr = localStorage.getItem(SESSION_KEY);
        if (sessionStr) {
          const session: SessionData = JSON.parse(sessionStr);

          // Verificar se a sessão expirou
          if (session.expiresAt > Date.now()) {
            setUsuario(session.usuario);
            setTipoUsuario(session.tipo);
          } else {
            // Sessão expirada, limpar
            localStorage.removeItem(SESSION_KEY);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  // Salvar sessão no localStorage
  const saveSession = (tipo: TipoUsuario, usuario: Usuario) => {
    const session: SessionData = {
      tipo,
      usuario,
      expiresAt: Date.now() + SESSION_DURATION,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  };

  const login = async (email: string, senha: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.rpc('login_usuario', {
        p_email: email,
        p_senha: senha,
      });

      if (error) {
        console.error('Erro RPC:', error);
        return { success: false, error: 'Erro ao conectar com o servidor' };
      }

      const resultado = data as { success: boolean; tipo?: TipoUsuario; usuario?: Usuario; error?: string };

      if (!resultado.success) {
        return { success: false, error: resultado.error || 'Credenciais inválidas' };
      }

      // Login bem sucedido
      if (resultado.tipo && resultado.usuario) {
        setTipoUsuario(resultado.tipo);
        setUsuario(resultado.usuario);
        saveSession(resultado.tipo, resultado.usuario);
        return { success: true };
      }

      return { success: false, error: 'Resposta inválida do servidor' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  const logout = () => {
    setUsuario(null);
    setTipoUsuario(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const atualizarUsuario = (dados: Partial<Usuario>) => {
    if (usuario && tipoUsuario) {
      const usuarioAtualizado = { ...usuario, ...dados } as Usuario;
      setUsuario(usuarioAtualizado);
      saveSession(tipoUsuario, usuarioAtualizado);
    }
  };

  return (
    <AuthAnalistaContext.Provider
      value={{
        usuario,
        tipoUsuario,
        isLoading,
        isAuthenticated: !!usuario,
        login,
        logout,
        atualizarUsuario,
      }}
    >
      {children}
    </AuthAnalistaContext.Provider>
  );
}

export function useAuthAnalista() {
  const context = useContext(AuthAnalistaContext);
  if (context === undefined) {
    throw new Error('useAuthAnalista must be used within an AuthAnalistaProvider');
  }
  return context;
}

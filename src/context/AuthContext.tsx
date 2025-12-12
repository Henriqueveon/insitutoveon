import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Gestor {
  id: string;
  user_id: string;
  empresa_id: string;
  nome: string;
  email: string;
  cargo: string | null;
  is_admin: boolean;
  ativo: boolean;
}

interface Empresa {
  id: string;
  nome: string;
  cnpj: string | null;
  logo_url: string | null;
  cor_primaria: string;
  cor_secundaria: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  gestor: Gestor | null;
  empresa: Empresa | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [gestor, setGestor] = useState<Gestor | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGestorData = async (userId: string) => {
    try {
      // Buscar dados do gestor
      const { data: gestorData, error: gestorError } = await supabase
        .from('gestores')
        .select('*')
        .eq('user_id', userId)
        .eq('ativo', true)
        .single();

      if (gestorError || !gestorData) {
        console.error('Gestor não encontrado:', gestorError);
        return;
      }

      setGestor(gestorData as Gestor);

      // Buscar dados da empresa
      if (gestorData.empresa_id) {
        const { data: empresaData, error: empresaError } = await supabase
          .from('empresas')
          .select('*')
          .eq('id', gestorData.empresa_id)
          .single();

        if (!empresaError && empresaData) {
          setEmpresa(empresaData as Empresa);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do gestor:', error);
    }
  };

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchGestorData(session.user.id);
      }
      setIsLoading(false);
    });

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          await fetchGestorData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setGestor(null);
          setEmpresa(null);
        }

        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setGestor(null);
    setEmpresa(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        gestor,
        empresa,
        isLoading,
        signIn,
        signOut,
        isAuthenticated: !!session && !!gestor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

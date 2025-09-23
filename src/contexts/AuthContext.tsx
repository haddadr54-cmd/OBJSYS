import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, signInWithSupabase, isSupabaseConfigured } from '../lib/supabase';
import { localDB } from '../lib/localDatabase';
import { signIn as authSignIn, getCurrentSessionUsuario } from '../lib/authService';
import type { Usuario } from '../lib/supabase';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  isSupabaseConnected: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  useEffect(() => {
    console.log('AuthProvider: Inicializando...');
    
    const initializeAuth = async () => {
      try {
  // Verificar se supabase está configurado corretamente
  setIsSupabaseConnected(!!supabase && isSupabaseConfigured);
        
        // Carregar usuário salvo
        const savedUser = localStorage.getItem('currentUser');
        console.log('Usuário salvo no localStorage:', savedUser);
        
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            console.log('✅ Usuário (legacy/local) carregado:', userData);
            setUser(userData);
          } catch (error) {
            console.log('⚠️ Dados inválidos no localStorage - removendo');
            localStorage.removeItem('currentUser');
          }
        }

        // Tentar sessão Supabase Auth (nova camada)
        try {
          const sessionUsuario = await getCurrentSessionUsuario();
          if (sessionUsuario) {
            console.log('🔐 Sessão Supabase Auth detectada, substituindo usuário local');
            setUser(sessionUsuario);
            localStorage.setItem('currentUser', JSON.stringify(sessionUsuario));
          }
        } catch (e) {
          console.warn('Falha ao recuperar sessão Auth (pode estar em transição):', e);
        }
        
      } catch (error) {
        console.error('Erro na inicialização:', error);
      } finally {
        console.log('AuthProvider: Finalizando inicialização, loading = false');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔄 Tentando login (transição Auth)...', { email, isSupabaseConnected });
    // Tenta novo fluxo
    try {
      if (!isSupabaseConnected) {
        // Fallback OFFLINE: autenticar contra localDB seed
        const u = localDB.getUsuarioByEmail(email);
        if (!u || u.senha !== password || !u.ativo) {
          throw new Error('Credenciais inválidas');
        }
        const offlineUsuario: Usuario = {
          id: u.id,
          nome: u.nome,
          email: u.email,
          tipo_usuario: u.tipo_usuario,
          telefone: u.telefone,
          avatar_url: u.avatar_url,
          ativo: u.ativo,
          criado_em: u.criado_em
        } as any;
        setUser(offlineUsuario);
        localStorage.setItem('currentUser', JSON.stringify(offlineUsuario));
        return;
      }

      const { usuario } = await authSignIn(email, password);
      if (usuario) {
        console.log('✅ Login via Supabase Auth (vínculo resolvido)');
        setUser(usuario);
        localStorage.setItem('currentUser', JSON.stringify(usuario));
        return;
      }
      console.warn('⚠️ Usuário autenticado, mas sem registro vinculado (provisionamento pendente)');
      // Fallback: fluxo legacy enquanto não provisionado
      const legacy = await signInWithSupabase(email, password);
      console.log('✅ Login fallback legacy realizado');
      setUser(legacy);
      localStorage.setItem('currentUser', JSON.stringify(legacy));
    } catch (e) {
      console.warn('Falha no fluxo Auth novo, tentando legacy...', e);
      const legacy = await signInWithSupabase(email, password);
      setUser(legacy);
      localStorage.setItem('currentUser', JSON.stringify(legacy));
    }
  };

  const signOut = async () => {
    console.log('🚪 Fazendo logout...');
    
    // Fazer logout no Supabase se estiver conectado
    if (isSupabaseConnected && supabase) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('❌ Erro ao fazer logout Supabase Auth:', error);
      } catch (error) {
        console.error('❌ Erro inesperado logout Auth:', error);
      }
    }
    
    // Limpar dados locais
    localStorage.removeItem('currentUser');
    setUser(null);
    console.log('✅ Logout realizado com sucesso');
  };

  const value = {
    user,
    loading,
    isSupabaseConnected,
    signIn,
    signOut,
  };

  console.log('AuthProvider render:', { user: !!user, loading, isSupabaseConnected });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
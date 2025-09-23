import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, signInWithSupabase } from '../lib/supabase';
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
        // A conexão com o Supabase será gerenciada pelo ConfigManager
        // Aqui apenas verificamos se o cliente está disponível
        setIsSupabaseConnected(!!supabase);
        
        // Carregar usuário salvo
        const savedUser = localStorage.getItem('currentUser');
        console.log('Usuário salvo no localStorage:', savedUser);
        
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            console.log('✅ Usuário carregado:', userData);
            setUser(userData);
          } catch (error) {
            console.log('⚠️ Dados inválidos no localStorage - removendo');
            localStorage.removeItem('currentUser');
          }
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
    console.log('🔄 Tentando login...', { email, isSupabaseConnected });
    
    try {
      let userData: Usuario;
      
      if (!isSupabaseConnected) {
        throw new Error('Sistema requer conexão com Supabase. Verifique sua conexão com a internet e tente novamente.');
      }
      
      userData = await signInWithSupabase(email, password);
      console.log('✅ Login Supabase bem-sucedido:', userData);
      
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (error) {
      console.log('❌ Erro no login:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🚪 Fazendo logout...');
    
    // Fazer logout no Supabase se estiver conectado
    if (isSupabaseConnected && supabase) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('❌ Erro ao fazer logout no Supabase:', error);
        } else {
          console.log('✅ Logout do Supabase realizado com sucesso');
        }
      } catch (error) {
        console.error('❌ Erro inesperado no logout do Supabase:', error);
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
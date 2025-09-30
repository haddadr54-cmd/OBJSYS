import { useEffect, useState, ReactNode } from 'react';
import { signInWithSupabase, getSupabaseClient } from '../../lib/supabase';
import { localDB } from '../../lib/localDatabase';
// (authService imports removidos após refactor para lazy supabase auth)
import type { Usuario } from '../../lib/supabase.types';
import { AuthContext, AuthContextType } from './AuthContext';

interface AuthProviderProps { children: ReactNode; }

export function AuthProvider({ children }: AuthProviderProps) {
  // Inicializa usuário do localStorage SINCRONAMENTE para evitar flash
  const [user, setUser] = useState<Usuario | null>(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (err) {
      console.warn('[AuthProvider] Erro ao carregar usuário inicial:', err);
      localStorage.removeItem('currentUser');
    }
    return null;
  });
  const [loading, setLoading] = useState(false); // Começa false, só fica true durante operações assíncronas
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const client = await getSupabaseClient();
                setIsSupabaseConnected(!!client);
        
        // Usuário já foi carregado no useState inicial, só atualiza se necessário
        if (client) {
          try {
            const { data: { user } } = await client.auth.getUser();
            if (user) {
              const usuarioLike: Partial<Usuario> = {
                id: user.id,
                email: user.email || '',
                nome: user.user_metadata?.full_name || user.email || 'Usuário',
                tipo_usuario: (user.user_metadata?.role || 'pai'),
                ativo: true,
                criado_em: user.created_at
              } as any;
              setUser(usuarioLike as Usuario);
              localStorage.setItem('currentUser', JSON.stringify(usuarioLike));
              console.log('[AuthProvider] Usuário carregado do Supabase:', usuarioLike);
              return;
            } else {
              console.warn('[AuthProvider] Nenhum usuário autenticado no Supabase.');
            }
          } catch (err) {
            console.warn('[AuthProvider] Erro ao obter usuário do Supabase:', err);
          }
        }
        // Usuário já foi carregado no useState inicial
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        try {
          if (e.newValue) setUser(JSON.parse(e.newValue)); else setUser(null);
        } catch (err) {
          console.warn('[AuthProvider] Erro ao atualizar usuário via storage event:', err);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const client = await getSupabaseClient();
      if (!isSupabaseConnected || !client) {
        const u = localDB.getUsuarioByEmail(email);
        if (!u || u.senha !== password || !u.ativo) throw new Error('Credenciais inválidas');
        const offlineUsuario: Usuario = { id: u.id, nome: u.nome, email: u.email, tipo_usuario: u.tipo_usuario, telefone: u.telefone, avatar_url: u.avatar_url, ativo: u.ativo, criado_em: u.criado_em } as any;
        setUser(offlineUsuario);
        localStorage.setItem('currentUser', JSON.stringify(offlineUsuario));
        return;
      }
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (!error && data.user) {
        const user = data.user;
        const usuarioLike: Partial<Usuario> = {
          id: user.id,
          email: user.email || '',
          nome: user.user_metadata?.full_name || user.email || 'Usuário',
          tipo_usuario: (user.user_metadata?.role || 'pai'),
          ativo: true,
          criado_em: user.created_at
        } as any;
        setUser(usuarioLike as Usuario);
        localStorage.setItem('currentUser', JSON.stringify(usuarioLike));
        return;
      }
      const legacy = await signInWithSupabase(email, password);
      setUser(legacy);
      localStorage.setItem('currentUser', JSON.stringify(legacy));
    } catch (e) {
      const legacy = await signInWithSupabase(email, password);
      setUser(legacy);
      localStorage.setItem('currentUser', JSON.stringify(legacy));
    }
  };

  const signOut = async () => {
    console.log('🚪 Iniciando logout...');
    
    if (isSupabaseConnected) {
      const client = await getSupabaseClient();
      if (client) { 
        try { 
          await client.auth.signOut(); 
          console.log('✅ Logout Supabase realizado');
        } catch (err) { 
          console.warn('⚠️ Erro no logout Supabase:', err);
        } 
      }
    }
    
    // Limpeza COMPLETA de tudo relacionado ao login
    try {
      // Remover TODOS os estilos CSS dinâmicos
      const dynamicStyles = document.getElementById('login-button-dynamic-styles');
      if (dynamicStyles) {
        dynamicStyles.remove();
      }
      
      // Remover qualquer style tag dinâmico
      document.querySelectorAll('style[id*="dynamic"], style[id*="login"], style[id*="button"]').forEach(style => {
        style.remove();
      });
      
      // Limpar cache do browser (forçar reload completo)
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      // Limpar TODOS os dados do localStorage relacionados ao login
      const keysToRemove = [
        'login_customization',
        'currentUser',
        'sidebar_customization',
        'systemConfig'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (err) {
          console.warn(`Erro ao remover ${key}:`, err);
        }
      });
      
      // Reset do estado
      setUser(null);
      
      console.log('✅ Logout completo realizado');
      
      // Aplicar fade out suave antes do reload
      const fadeOutAndReload = () => {
        // Esconder conteúdo gradualmente
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.2s ease-out';
        
        // Aplicar background consistente
        document.documentElement.style.background = '#f8fafc';
        document.body.style.background = '#f8fafc';
        
        // Reload após transição
        setTimeout(() => {
          window.location.reload();
        }, 200);
      };
      
      fadeOutAndReload();
      
    } catch (error) {
      console.error('❌ Erro durante logout:', error);
      // Mesmo com erro, fazer o logout com transição suave
      localStorage.removeItem('currentUser');
      setUser(null);
      
      // Fade out mesmo com erro
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.2s ease-out';
      setTimeout(() => {
        window.location.reload();
      }, 200);
    }
  };

  const value: AuthContextType = { user, loading, isSupabaseConnected, signIn, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

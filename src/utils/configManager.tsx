import { createClient } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qvintxmztryvlivwjeoz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Criar cliente Supabase
const supabase = supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
}) : null;

if (!supabase) {
  console.warn('⚠️ Supabase não configurado para ConfigManager. As configurações globais não serão persistidas.');
}

interface GlobalConfigState {
  [key: string]: any; // Para armazenar diferentes tipos de configurações (login, sidebar, etc.)
}

interface GlobalConfigContextType {
  configs: GlobalConfigState;
  saveConfig: (key: string, value: any) => Promise<void>;
  loading: boolean;
  error: string | null;
  isSupabaseConnected: boolean;
}

const GlobalConfigContext = createContext<GlobalConfigContextType | undefined>(undefined);

export const useGlobalConfig = () => {
  const context = useContext(GlobalConfigContext);
  if (context === undefined) {
    throw new Error('useGlobalConfig must be used within a GlobalConfigProvider');
  }
  return context;
};

export const GlobalConfigProvider = ({ children }: { children: ReactNode }) => {
  const [configs, setConfigs] = useState<GlobalConfigState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  const fetchConfig = useCallback(async (key: string) => {
    if (!supabase) {
      console.warn(`Supabase não está disponível para buscar a configuração "${key}".`);
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('configuracoes_globais')
        .select('valor')
        .eq('chave', key)
        .maybeSingle();

      if (error) {
        throw error;
      }
      return data ? data.valor : null;
    } catch (err: any) {
      console.error(`Erro ao buscar configuração "${key}" do Supabase:`, err.message);
      setError(`Erro ao carregar configurações: ${err.message}`);
      return null;
    }
  }, []);

  const saveConfig = useCallback(async (key: string, value: any) => {
    if (!supabase) {
      throw new Error(`Supabase não está disponível para salvar a configuração "${key}". Verifique sua conexão.`);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('configuracoes_globais')
        .upsert({ 
          chave: key, 
          valor: value,
          ultima_atualizacao: new Date().toISOString()
        }, { onConflict: 'chave' })
        .select();

      if (error) {
        throw error;
      }
      
      setConfigs(prev => ({ ...prev, [key]: value }));
      console.log(`✅ Configuração "${key}" salva com sucesso no Supabase.`);
      
      // Também salvar no localStorage como backup
      localStorage.setItem(key, JSON.stringify(value));
      
    } catch (err: any) {
      console.error(`Erro ao salvar configuração "${key}" no Supabase:`, err.message);
      setError(`Erro ao salvar configurações no Supabase: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Verificar se Supabase está disponível
      if (!supabase) {
        console.log('📦 Carregando configurações do localStorage (Supabase não disponível)');
        // Carregar do localStorage como fallback
        const loginConfig = localStorage.getItem('login_customization');
        const sidebarConfig = localStorage.getItem('sidebar_customization');
        
        setConfigs({
          login_customization: loginConfig ? JSON.parse(loginConfig) : null,
          sidebar_customization: sidebarConfig ? JSON.parse(sidebarConfig) : null
        });
        setIsSupabaseConnected(false);
        return;
      }

      // Tentar conectar e inicializar banco
      try {
        // Testar conexão
        const { data: testConnection, error: connectionError } = await supabase
          .from('configuracoes_globais')
          .select('id')
          .limit(1);
        
        if (connectionError && connectionError.code !== 'PGRST116') {
          throw new Error(`Erro de conexão: ${connectionError.message}`);
        }
        
        setIsSupabaseConnected(true);
        console.log('✅ Supabase conectado com sucesso!');
        
        // Carregar configurações do Supabase
        const [loginConfig, sidebarConfig] = await Promise.all([
          fetchConfig('login_customization'),
          fetchConfig('sidebar_customization')
        ]);

        setConfigs({
          login_customization: loginConfig,
          sidebar_customization: sidebarConfig
        });
        
        console.log('✅ Todas as configurações globais carregadas do Supabase.');
        
      } catch (supabaseError) {
        console.log('❌ Erro ao conectar com Supabase:', supabaseError);
        setIsSupabaseConnected(false);
        
        // Fallback para localStorage
        console.log('📦 Carregando configurações do localStorage (fallback)');
        const loginConfig = localStorage.getItem('login_customization');
        const sidebarConfig = localStorage.getItem('sidebar_customization');
        
        setConfigs({
          login_customization: loginConfig ? JSON.parse(loginConfig) : null,
          sidebar_customization: sidebarConfig ? JSON.parse(sidebarConfig) : null
        });
      }
      
    } catch (err: any) {
      console.error('Erro ao carregar todas as configurações globais:', err.message);
      setError(`Erro ao carregar configurações iniciais: ${err.message}`);
      setIsSupabaseConnected(false);
    } finally {
      setLoading(false);
    }
  }, [fetchConfig]);

  useEffect(() => {
    loadAllConfigs();

    // Configurar Realtime apenas se Supabase estiver disponível
    if (supabase) {
      const subscription = supabase
        .channel('global_configs_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'configuracoes_globais' 
        }, payload => {
          console.log('⚡ Realtime update received:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newConfig = payload.new as { chave: string, valor: any };
            setConfigs(prev => ({ ...prev, [newConfig.chave]: newConfig.valor }));
            
            // Também atualizar localStorage
            localStorage.setItem(newConfig.chave, JSON.stringify(newConfig.valor));
            
            console.log(`🔄 Configuração "${newConfig.chave}" atualizada via Realtime.`);
            
            // Disparar eventos para componentes que ainda dependem deles
            window.dispatchEvent(new CustomEvent('globalConfigChanged', { 
              detail: { key: newConfig.chave, value: newConfig.valor } 
            }));
            
          } else if (payload.eventType === 'DELETE') {
            const oldConfig = payload.old as { chave: string };
            setConfigs(prev => {
              const newConfigs = { ...prev };
              delete newConfigs[oldConfig.chave];
              return newConfigs;
            });
            
            // Remover do localStorage
            localStorage.removeItem(oldConfig.chave);
            
            console.log(`🗑️ Configuração "${oldConfig.chave}" removida via Realtime.`);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [loadAllConfigs]);

  const value = {
    configs,
    saveConfig,
    loading,
    error,
    isSupabaseConnected,
  };

  return (
    <GlobalConfigContext.Provider value={value}>
      {children}
    </GlobalConfigContext.Provider>
  );
};
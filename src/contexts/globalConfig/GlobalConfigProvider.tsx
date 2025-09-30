import { useState, useEffect, useCallback, ReactNode } from 'react';
import { useLogoConfig } from '../logo/useLogo';
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabase';
import { GlobalConfigContext, GlobalConfigState } from './GlobalConfigContext';

interface Props { children: ReactNode }

export const GlobalConfigProvider = ({ children }: Props) => {
  const [configs, setConfigs] = useState<GlobalConfigState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const { updateLogoConfig } = useLogoConfig();

  const fetchConfig = useCallback(async (key: string) => {
    const client = await getSupabaseClient();
    if (!client) return null;
    try {
      const { data: row, error } = await client
        .from('configuracoes_globais')
        .select('valor')
        .eq('chave', key)
        .maybeSingle();
      if (error) throw error;
      return row ? row.valor : null;
    } catch (err: any) {
      console.error(`[GlobalConfig] Erro ao buscar configuração ${key}:`, err.message);
      setError(`Erro ao carregar configurações: ${err.message}`);
      return null;
    }
  }, []);

  const saveConfig = useCallback(async (key: string, value: any) => {
    const client = await getSupabaseClient();
    if (!client) {
      // Fallback para localStorage em modo offline
      console.warn('⚠️ [GlobalConfig] Supabase indisponível, salvando apenas em localStorage');
      setConfigs(prev => ({ ...prev, [key]: value }));
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await client
        .from('configuracoes_globais')
        .upsert({ chave: key, valor: value, ultima_atualizacao: new Date().toISOString() }, { onConflict: 'chave' })
        .select();
      if (error) throw error;
      setConfigs(prev => ({ ...prev, [key]: value }));
      localStorage.setItem(key, JSON.stringify(value));
      console.log(`✅ [GlobalConfig] Configuração "${key}" salva.`);
    } catch (err: any) {
      console.error(`[GlobalConfig] Erro ao salvar ${key}:`, err.message);
      // Fallback para localStorage em caso de erro
      console.warn('⚠️ [GlobalConfig] Erro ao salvar no Supabase, usando localStorage como fallback');
      setConfigs(prev => ({ ...prev, [key]: value }));
      localStorage.setItem(key, JSON.stringify(value));
      setError(`Aviso: Configuração salva apenas localmente devido a problema de conexão`);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        console.log('📦 [GlobalConfig] Supabase não configurado, carregando de localStorage');
        const loginConfig = localStorage.getItem('login_customization');
        const sidebarConfig = localStorage.getItem('sidebar_customization');
        const visualConfig = localStorage.getItem('visual_customization');
        const notifEnabled = localStorage.getItem('notifications_enabled');
        const notifSyncEnabled = localStorage.getItem('notifications_sync_enabled');
        const notifMetricsEnabled = localStorage.getItem('notifications_metrics_enabled');
        const parentsShowRecovery = localStorage.getItem('parents_show_recovery');
        setConfigs({
          login_customization: loginConfig ? JSON.parse(loginConfig) : null,
          sidebar_customization: sidebarConfig ? JSON.parse(sidebarConfig) : null,
          visual_customization: visualConfig ? JSON.parse(visualConfig) : null,
          notifications_enabled: notifEnabled ? JSON.parse(notifEnabled) : true,
          notifications_sync_enabled: notifSyncEnabled ? JSON.parse(notifSyncEnabled) : true,
          notifications_metrics_enabled: notifMetricsEnabled ? JSON.parse(notifMetricsEnabled) : true,
          parents_show_recovery: parentsShowRecovery ? JSON.parse(parentsShowRecovery) : false
        });
        // Sincronizar com LogoContext se houver visual_customization
        if (visualConfig) {
          try {
            const v = JSON.parse(visualConfig);
            updateLogoConfig({
              logoUrl: v.logoUrl ?? v.logo_url,
              systemName: v.systemName ?? v.system_name,
              primaryColor: v.primaryColor,
              secondaryColor: v.secondaryColor,
              accentColor: v.accentColor,
            });
          } catch {}
        }
        setIsSupabaseConnected(false);
        return;
      }

      const client = await getSupabaseClient();
      if (!client) {
        console.log('📦 [GlobalConfig] Cliente Supabase indisponível, carregando de localStorage');
        const loginConfig = localStorage.getItem('login_customization');
        const sidebarConfig = localStorage.getItem('sidebar_customization');
        const visualConfig = localStorage.getItem('visual_customization');
        const notifEnabled = localStorage.getItem('notifications_enabled');
        const notifSyncEnabled = localStorage.getItem('notifications_sync_enabled');
        const notifMetricsEnabled = localStorage.getItem('notifications_metrics_enabled');
        const parentsShowRecovery = localStorage.getItem('parents_show_recovery');
        setConfigs({
          login_customization: loginConfig ? JSON.parse(loginConfig) : null,
          sidebar_customization: sidebarConfig ? JSON.parse(sidebarConfig) : null,
          visual_customization: visualConfig ? JSON.parse(visualConfig) : null,
          notifications_enabled: notifEnabled ? JSON.parse(notifEnabled) : true,
          notifications_sync_enabled: notifSyncEnabled ? JSON.parse(notifSyncEnabled) : true,
          notifications_metrics_enabled: notifMetricsEnabled ? JSON.parse(notifMetricsEnabled) : true,
          parents_show_recovery: parentsShowRecovery ? JSON.parse(parentsShowRecovery) : false
        });
        if (visualConfig) {
          try {
            const v = JSON.parse(visualConfig);
            updateLogoConfig({
              logoUrl: v.logoUrl ?? v.logo_url,
              systemName: v.systemName ?? v.system_name,
              primaryColor: v.primaryColor,
              secondaryColor: v.secondaryColor,
              accentColor: v.accentColor,
            });
          } catch {}
        }
        setIsSupabaseConnected(false);
        return;
      }

      // Teste de conexão
      const { error: connectionError } = await client
        .from('configuracoes_globais')
        .select('id')
        .limit(1);
      if (connectionError && connectionError.code !== 'PGRST116') {
        throw new Error(connectionError.message);
      }
      setIsSupabaseConnected(true);
      console.log('✅ [GlobalConfig] Supabase conectado');

      const [loginConfig, sidebarConfig, visualCustomization, notificationsEnabled, notificationsSyncEnabled, notificationsMetricsEnabled, parentsShowRecovery] = await Promise.all([
        fetchConfig('login_customization'),
        fetchConfig('sidebar_customization'),
        fetchConfig('visual_customization'),
        fetchConfig('notifications_enabled'),
        fetchConfig('notifications_sync_enabled'),
        fetchConfig('notifications_metrics_enabled'),
        fetchConfig('parents_show_recovery')
      ]);
      setConfigs({
        login_customization: loginConfig,
        sidebar_customization: sidebarConfig,
        visual_customization: visualCustomization,
        notifications_enabled: notificationsEnabled ?? true,
        notifications_sync_enabled: notificationsSyncEnabled ?? true,
        notifications_metrics_enabled: notificationsMetricsEnabled ?? true,
        parents_show_recovery: parentsShowRecovery ?? false
      });
      if (visualCustomization) {
        updateLogoConfig({
          logoUrl: visualCustomization.logoUrl ?? visualCustomization.logo_url,
          systemName: visualCustomization.systemName ?? visualCustomization.system_name,
          primaryColor: visualCustomization.primaryColor,
          secondaryColor: visualCustomization.secondaryColor,
          accentColor: visualCustomization.accentColor,
        });
        localStorage.setItem('visual_customization', JSON.stringify(visualCustomization));
      }
    } catch (e: any) {
      console.warn('❌ [GlobalConfig] Erro conexão, fallback localStorage:', e.message);
      setIsSupabaseConnected(false);
      const loginConfig = localStorage.getItem('login_customization');
      const sidebarConfig = localStorage.getItem('sidebar_customization');
      const visualConfig = localStorage.getItem('visual_customization');
      const notifEnabled = localStorage.getItem('notifications_enabled');
      const notifSyncEnabled = localStorage.getItem('notifications_sync_enabled');
      const notifMetricsEnabled = localStorage.getItem('notifications_metrics_enabled');
      const parentsShowRecovery = localStorage.getItem('parents_show_recovery');
      setConfigs({
        login_customization: loginConfig ? JSON.parse(loginConfig) : null,
        sidebar_customization: sidebarConfig ? JSON.parse(sidebarConfig) : null,
        visual_customization: visualConfig ? JSON.parse(visualConfig) : null,
        notifications_enabled: notifEnabled ? JSON.parse(notifEnabled) : true,
        notifications_sync_enabled: notifSyncEnabled ? JSON.parse(notifSyncEnabled) : true,
        notifications_metrics_enabled: notifMetricsEnabled ? JSON.parse(notifMetricsEnabled) : true,
        parents_show_recovery: parentsShowRecovery ? JSON.parse(parentsShowRecovery) : false
      });
      if (visualConfig) {
        try {
          const v = JSON.parse(visualConfig);
          updateLogoConfig({
            logoUrl: v.logoUrl ?? v.logo_url,
            systemName: v.systemName ?? v.system_name,
            primaryColor: v.primaryColor,
            secondaryColor: v.secondaryColor,
            accentColor: v.accentColor,
          });
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  }, [fetchConfig]);

  useEffect(() => {
    loadAllConfigs();
    
    // Configurar realtime apenas se Supabase estiver disponível
    const setupRealtime = async () => {
      if (!isSupabaseConfigured) return;
      
      const client = await getSupabaseClient();
      if (!client) return;

      const channel = client
        .channel('global_configs_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'configuracoes_globais' }, (payload: any) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newConfig = payload.new as { chave: string; valor: any };
            setConfigs(prev => ({ ...prev, [newConfig.chave]: newConfig.valor }));
            localStorage.setItem(newConfig.chave, JSON.stringify(newConfig.valor));
            if (newConfig.chave === 'visual_customization') {
              const v = newConfig.valor;
              updateLogoConfig({
                logoUrl: v.logoUrl ?? v.logo_url,
                systemName: v.systemName ?? v.system_name,
                primaryColor: v.primaryColor,
                secondaryColor: v.secondaryColor,
                accentColor: v.accentColor,
              });
            }
            window.dispatchEvent(new CustomEvent('globalConfigChanged', { detail: { key: newConfig.chave, value: newConfig.valor } }));
          } else if (payload.eventType === 'DELETE') {
            const oldConfig = payload.old as { chave: string };
            setConfigs(prev => { const n = { ...prev }; delete n[oldConfig.chave]; return n; });
            localStorage.removeItem(oldConfig.chave);
          }
        })
        .subscribe();

      return () => { 
        client.removeChannel(channel); 
      };
    };

    const cleanup = setupRealtime();
    return () => {
      cleanup?.then(fn => fn?.());
    };
  }, [loadAllConfigs, isSupabaseConfigured]);

  return (
    <GlobalConfigContext.Provider value={{ configs, saveConfig, loading, error, isSupabaseConnected }}>
      {children}
    </GlobalConfigContext.Provider>
  );
};

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NotificationContext } from './NotificationContext';
import { useAuth } from '../auth';
import { useDataService } from '../../lib/dataService';
import type { Recado, ProvaTarefa, Material } from '../../lib/supabase.types';
import { registrarVisualizacao } from '../../lib/supabase';
import { initializeRealtime, useRealtimeEntity, onRecadoDeletedBroadcast } from '../../lib/realtime';
import { getPriorityFromProvaDate, useReadStoreKey } from './helpers';
import type { NotificationContextValue, NotificationItem, NotificationType } from './types';
import { useGlobalConfig } from '../globalConfig/useGlobalConfig';
import { SmartCache } from '../../utils/performanceOptimizations';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const { configs } = useGlobalConfig();
  const notificationsEnabled = configs.notifications_enabled !== false; // default true
  const syncEnabled = configs.notifications_sync_enabled !== false; // nova flag
  const lastEventsRef = useRef<number[]>([]); // timestamps de eventos realtime

  // Parâmetros de retenção
  const MAX_ITEMS = 500;
  const MAX_AGE_DAYS = 90;
  const maxAgeMs = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const byIdRef = useRef<Record<string, NotificationItem>>({});
  const orderRef = useRef<string[]>([]);
  const [loading, setLoading] = useState(false);
  const refreshTimer = useRef<number | null>(null);
  
  // Cache inteligente para reduzir chamadas à API
  const notificationCache = useRef(new SmartCache<NotificationItem[]>());
  const lastFetchTime = useRef<number>(0);
  const MIN_FETCH_INTERVAL = 2000; // Mínimo 2 segundos entre fetches

  const readKey = useReadStoreKey(user?.id);
  const [readSet, setReadSet] = useState<Set<string>>(() => {
    if (!readKey) return new Set<string>();
    try {
      const raw = localStorage.getItem(readKey);
      if (!raw) return new Set<string>();
      return new Set<string>(JSON.parse(raw));
    } catch { return new Set<string>(); }
  });

  useEffect(() => {
    if (!readKey) return;
    try { localStorage.setItem(readKey, JSON.stringify(Array.from(readSet))); } catch { /* ignore */ }
  }, [readKey, readSet]);

  useEffect(() => {
    if (!readKey) { setReadSet(new Set<string>()); return; }
    try { const raw = localStorage.getItem(readKey); setReadSet(raw ? new Set<string>(JSON.parse(raw)) : new Set<string>()); } catch { setReadSet(new Set<string>()); }
  }, [readKey]);

  const refresh = useCallback(async () => {
    if (!user || !notificationsEnabled || !syncEnabled) return;
    
    // Throttle: evitar múltiplas chamadas simultâneas
    const now = Date.now();
    if (now - lastFetchTime.current < MIN_FETCH_INTERVAL) {
      return;
    }
    
    // Verificar cache primeiro
    const cachedData = notificationCache.current.get('notifications');
    if (cachedData && (now - lastFetchTime.current) < 10000) { // Cache válido por 10s
      setNotifications(cachedData);
      return;
    }
    
    setLoading(true);
    lastFetchTime.current = now;
    
    try {
      const [recados, provasTarefas, materiais] = await Promise.all([
        dataService.getRecados(),
        dataService.getProvasTarefas(),
        dataService.getMateriais(),
      ]);
      // Processamento otimizado - usando Map para melhor performance
      const itemMap = new Map<string, NotificationItem>();
      
      // Processa recados
      for (const r of recados as Recado[]) {
        const id = `recado-${r.id}`;
        itemMap.set(id, { 
          id, type: 'recado', title: r.titulo, message: r.conteudo, 
          data: r, timestamp: r.data_envio, read: readSet.has(id), 
          priority: 'normal', category: 'Comunicação', 
          iconName: 'message', color: 'text-purple-600' 
        });
      }
      
      // Processa provas/tarefas
      for (const p of provasTarefas as ProvaTarefa[]) {
        const id = `prova-${p.id}`;
        itemMap.set(id, { 
          id, type: 'prova_tarefa', 
          title: `${p.tipo === 'prova' ? 'Prova' : 'Tarefa'}: ${p.titulo}`, 
          message: `Data: ${new Date(p.data).toLocaleDateString('pt-BR')} - ${p.disciplina?.nome || ''}`, 
          data: p, timestamp: p.criado_em, read: readSet.has(id), 
          priority: getPriorityFromProvaDate(p.data), category: 'Agenda', 
          iconName: 'calendar', color: p.tipo === 'prova' ? 'text-red-600' : 'text-blue-600' 
        });
      }
      
      // Processa materiais
      for (const m of materiais as Material[]) {
        const id = `material-${m.id}`;
        itemMap.set(id, { 
          id, type: 'material', title: `Novo Material: ${m.titulo}`, 
          message: `${m.tipo.toUpperCase()} - ${m.disciplina?.nome || ''}`, 
          data: m, timestamp: m.criado_em, read: readSet.has(id), 
          priority: 'normal', category: 'Materiais', 
          iconName: 'file', color: 'text-green-600' 
        });
      }
      
      // Converte para array e ordena (mais rápido que sort individual)
      const list = Array.from(itemMap.values()).sort((a,b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Retenção otimizada: usar timestamp atual uma vez
      const currentTime = Date.now();
      const filtered = list
        .filter(n => (currentTime - new Date(n.timestamp).getTime()) <= maxAgeMs)
        .slice(0, MAX_ITEMS); // Mais eficiente que length = MAX_ITEMS
      
      // Cache da resposta processada
      notificationCache.current.set('notifications', filtered, 10000); // 10s TTL
      
      // Diff inteligente para evitar re-renders desnecessários
      setNotifications(prev => {
        // Quick check: mesmo comprimento e mesmos IDs na mesma ordem
        if (prev.length === filtered.length && 
            prev.every((item, index) => 
              item.id === filtered[index].id && 
              item.read === filtered[index].read
            )) {
          metricsRef.current.suppressedUpdates += 1;
          return prev; // Mantém referência existente
        }
        
        // Atualiza referências internas
        const map: Record<string, NotificationItem> = {};
        filtered.forEach(n => { map[n.id] = n; });
        byIdRef.current = map;
        orderRef.current = filtered.map(n => n.id);
        
        // Persist em background (não bloqueia UI)
        requestIdleCallback(() => {
          try { 
            localStorage.setItem('notifications_cache', JSON.stringify(filtered)); 
          } catch {/* ignore */}
        });
        
        return filtered;
      });
      metricsRef.current.totalRefreshes += 1;
      metricsRef.current.lastRefresh = Date.now();
    } catch (e) { console.error('[Notification] refresh error', e); } finally { setLoading(false); }
  // removido readSet das deps para não refazer refresh completo a cada mudança de leitura e provocar "piscar" do sino
  }, [dataService, user, notificationsEnabled, syncEnabled, readSet, maxAgeMs]);

  // Carregar inicialmente apenas se habilitado
  useEffect(() => { refresh(); }, [refresh]);

  // Limpar notificações quando desativado nas configs
  useEffect(() => {
    if (!notificationsEnabled) {
      setNotifications([]);
      return;
    }
    if (!syncEnabled) {
      // Modo congelado: mantém lista existente sem limpar
      return;
    }
    refresh();
  }, [notificationsEnabled, syncEnabled, refresh]);


  useEffect(() => {
    if (!isSupabaseConnected || !notificationsEnabled || !syncEnabled) return;
    initializeRealtime();
    const off = onRecadoDeletedBroadcast((payload: any) => {
      const recadoId = payload?.id || payload?.recado_id || payload; if (!recadoId) return; const id = `recado-${recadoId}`;
      setNotifications(prev => prev.filter(n => n.id !== id));
      setReadSet(prev => { const next = new Set(prev); next.delete(id); return next; });
    });
    return () => { try { off(); } catch {/* ignore */} };
  }, [isSupabaseConnected, notificationsEnabled, syncEnabled]);

  // Sistema de debounce otimizado - reduzido para melhor responsividade
  const scheduleRefresh = useCallback(() => {
    if (!notificationsEnabled || !syncEnabled) return;
    
    const now = Date.now();
    // Throttle mais agressivo: evita refresh se muito recente
    if (now - lastFetchTime.current < 1000) return; 
    
    lastEventsRef.current.push(now);
    // Limpar eventos antigos (últimos 5s apenas)
    lastEventsRef.current = lastEventsRef.current.filter(t => now - t < 5000);
    
    // Delay reduzido: 200ms base, max 800ms
    const bursts = lastEventsRef.current.length;
    const delay = Math.min(800, 200 + (bursts - 1) * 100);
    
    if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
    refreshTimer.current = window.setTimeout(refresh, delay);
    metricsRef.current.adaptiveDelay = delay;
  }, [notificationsEnabled, syncEnabled, refresh]);

  // Debounced realtime handlers
  useRealtimeEntity('recados', scheduleRefresh);
  useRealtimeEntity('provas_tarefas', scheduleRefresh);
  useRealtimeEntity('materiais', scheduleRefresh);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    setReadSet(prev => new Set<string>(prev).add(notificationId));
    if (isSupabaseConnected) {
      const item = notifications.find(n => n.id === notificationId);
      const sep = notificationId.indexOf('-');
      const t = item?.type || (sep > 0 ? (notificationId.slice(0, sep) as NotificationType) : 'sistema');
      const entityId = (item?.data?.id as string | undefined) ?? (sep > 0 ? notificationId.slice(sep + 1) : undefined);
      if (entityId) {
        if (t === 'recado') registrarVisualizacao('recado', entityId).catch(() => {});
        if (t === 'prova_tarefa') registrarVisualizacao('prova_tarefa', entityId).catch(() => {});
        if (t === 'material') registrarVisualizacao('material', entityId).catch(() => {});
      }
    }
  }, [isSupabaseConnected, notifications]);

  const markAsUnread = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: false } : n));
    setReadSet(prev => { const next = new Set<string>(prev); next.delete(notificationId); return next; });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setReadSet(new Set<string>(notifications.map(n => n.id)));
  }, [notifications]);

  const removeById = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setReadSet(prev => { const next = new Set<string>(prev); next.delete(notificationId); return next; });
  }, []);

  const deleteById = useCallback(async (notificationId: string) => {
    try {
      const item = notifications.find(n => n.id === notificationId);
      const sep = notificationId.indexOf('-');
      const prefix = item ? (item.type === 'prova_tarefa' ? 'prova' : item.type) : (sep > 0 ? notificationId.slice(0, sep) : 'sistema');
      const entityId = (item?.data?.id as string | undefined) ?? (sep > 0 ? notificationId.slice(sep + 1) : undefined);
      let ok = false;
      if (prefix === 'recado' && entityId) ok = await dataService.deleteRecado(entityId);
      else if (prefix === 'prova' && entityId) ok = await dataService.deleteProvaTarefa(entityId);
      else if (prefix === 'material' && entityId) ok = await dataService.deleteMaterial(entityId);
      else if (prefix === 'sistema') ok = true;
      if (ok) removeById(notificationId);
      return ok;
    } catch (e) { console.error('[Notification] delete error', notificationId, e); return false; }
  }, [dataService, removeById, notifications]);

  const deleteRead = useCallback(async () => {
    const ids = notifications.filter(n => n.read).map(n => n.id); if (ids.length === 0) return; await Promise.all(ids.map(id => deleteById(id))); await refresh();
  }, [notifications, deleteById, refresh]);

  const bulkDelete = useCallback(async (notificationIds: string[]) => {
    const recados: string[] = []; const provas: string[] = []; const materiais: string[] = []; const locais: string[] = [];
    notificationIds.forEach(nid => { const item = notifications.find(n => n.id === nid); const sep = nid.indexOf('-'); const prefix = item ? (item.type === 'prova_tarefa' ? 'prova' : item.type) : (sep > 0 ? nid.slice(0, sep) : 'sistema'); const entityId = (item?.data?.id as string | undefined) ?? (sep > 0 ? nid.slice(sep + 1) : undefined); if (prefix === 'recado' && entityId) recados.push(entityId); else if (prefix === 'prova' && entityId) provas.push(entityId); else if (prefix === 'material' && entityId) materiais.push(entityId); else locais.push(nid); });
    const successIds: string[] = []; const failedIds: string[] = [];
    try {
      if (recados.length > 0) {
        try { const res = await dataService.bulkDeleteRecados(recados); successIds.push(...res.successIds.map(id => `recado-${id}`)); failedIds.push(...res.failedIds.map(id => `recado-${id}`)); } catch { failedIds.push(...recados.map(id => `recado-${id}`)); }
      }
      for (const id of provas) { try { const ok = await dataService.deleteProvaTarefa(id); if (ok) successIds.push(`prova-${id}`); else failedIds.push(`prova-${id}`); } catch { failedIds.push(`prova-${id}`); }
      }
      for (const id of materiais) { try { const ok = await dataService.deleteMaterial(id); if (ok) successIds.push(`material-${id}`); else failedIds.push(`material-${id}`); } catch { failedIds.push(`material-${id}`); }
      }
      locais.forEach(id => successIds.push(id));
    } finally {
      if (successIds.length > 0) {
        setNotifications(prev => prev.filter(n => !successIds.includes(n.id)));
        setReadSet(prev => { const next = new Set(prev); successIds.forEach(i => next.delete(i)); return next; });
      }
      await refresh();
    }
    return { successIds, failedIds };
  }, [dataService, refresh, notifications]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // Métricas
  const metricsRef = useRef<{ lastRefresh?: number; totalRefreshes: number; suppressedUpdates: number; adaptiveDelay?: number }>({ totalRefreshes: 0, suppressedUpdates: 0 });

  // Carregar cache inicial se houver (apenas primeira montagem, antes de refresh)
  useEffect(() => {
    if (notifications.length > 0) return; // já carregou algo
    try {
      const raw = localStorage.getItem('notifications_cache');
      if (raw) {
        const arr: NotificationItem[] = JSON.parse(raw);
        setNotifications(arr);
        const map: Record<string, NotificationItem> = {};
        arr.forEach(n => { map[n.id] = n; });
        byIdRef.current = map;
        orderRef.current = arr.map(n => n.id);
      }
    } catch {/* ignore */}
  }, []);

  const resetMetrics = useCallback(() => {
    metricsRef.current.lastRefresh = undefined;
    metricsRef.current.totalRefreshes = 0;
    metricsRef.current.suppressedUpdates = 0;
    metricsRef.current.adaptiveDelay = undefined;
  }, []);

  const resetAll = useCallback(() => {
    setNotifications([]);
    setReadSet(new Set<string>());
    try { if (readKey) localStorage.removeItem(readKey); } catch {/* ignore */}
    try { localStorage.removeItem('notifications_cache'); } catch {/* ignore */}
    resetMetrics();
  }, [readKey, resetMetrics]);

  const value: NotificationContextValue = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    refresh,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    removeById,
    deleteById,
    deleteRead,
    bulkDelete,
    meta: {
      lastRefresh: metricsRef.current.lastRefresh,
      totalRefreshes: metricsRef.current.totalRefreshes,
      suppressedUpdates: metricsRef.current.suppressedUpdates,
      adaptiveDelay: metricsRef.current.adaptiveDelay
    },
    flags: {
      enabled: notificationsEnabled,
      sync: syncEnabled
    },
    resetMetrics,
    resetAll
  }), [notifications, unreadCount, loading, refresh, markAsRead, markAsUnread, markAllAsRead, removeById, deleteById, deleteRead, bulkDelete, notificationsEnabled, syncEnabled, resetMetrics, resetAll]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

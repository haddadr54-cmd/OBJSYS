import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useDataService } from '../lib/dataService';
import type { Recado, ProvaTarefa, Material } from '../lib/supabase';
import { registrarVisualizacao } from '../lib/supabase';
import { initializeRealtime, useRealtimeEntity, onRecadoDeletedBroadcast } from '../lib/realtime';

export type NotificationType = 'recado' | 'prova_tarefa' | 'material' | 'sistema';

export interface NotificationItem {
  id: string; // ex: recado-<id>
  type: NotificationType;
  title: string;
  message: string;
  data: any; // item original
  timestamp: string;
  read: boolean;
  priority: 'baixa' | 'normal' | 'alta' | 'urgente';
  category: string;
  iconName: 'message' | 'calendar' | 'file' | 'settings';
  color: string; // classe tailwind
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAsUnread: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeById: (notificationId: string) => void;
  deleteById: (notificationId: string) => Promise<boolean>;
  deleteRead: () => Promise<void>;
  bulkDelete: (notificationIds: string[]) => Promise<{ successIds: string[]; failedIds: string[] }>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

function useReadStoreKey(userId?: string) {
  return userId ? `notif_read_${userId}` : undefined;
}

function getPriorityFromProvaDate(dateISO: string): 'baixa' | 'normal' | 'alta' | 'urgente' {
  const hoje = new Date();
  const data = new Date(dateISO);
  const diffDays = Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return 'urgente';
  if (diffDays <= 3) return 'alta';
  if (diffDays <= 7) return 'normal';
  return 'baixa';
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const refreshTimer = useRef<number | null>(null);

  const readKey = useReadStoreKey(user?.id);
  const [readSet, setReadSet] = useState<Set<string>>(() => {
    if (!readKey) return new Set<string>();
    try {
      const raw = localStorage.getItem(readKey);
      if (!raw) return new Set<string>();
      return new Set<string>(JSON.parse(raw));
    } catch {
      return new Set<string>();
    }
  });

  // Persistir changes em readSet
  useEffect(() => {
    if (!readKey) return;
    try {
      localStorage.setItem(readKey, JSON.stringify(Array.from(readSet)));
    } catch (_err) {
      // ignore persistence errors (private mode / quota)
    }
  }, [readKey, readSet]);

  // Recarregar o conjunto de "lidas" quando o usuário (readKey) mudar
  useEffect(() => {
    // Quando não houver usuário logado, limpe o estado
    if (!readKey) {
      setReadSet(new Set<string>());
      return;
    }
    try {
      const raw = localStorage.getItem(readKey);
      setReadSet(raw ? new Set<string>(JSON.parse(raw)) : new Set<string>());
    } catch {
      setReadSet(new Set<string>());
    }
  }, [readKey]);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [recados, provasTarefas, materiais] = await Promise.all([
        dataService.getRecados(),
        dataService.getProvasTarefas(),
        dataService.getMateriais(),
      ]);

      const list: NotificationItem[] = [];

      // Recados
      (recados as Recado[]).forEach((r) => {
        const id = `recado-${r.id}`;
        list.push({
          id,
          type: 'recado',
          title: r.titulo,
          message: r.conteudo,
          data: r,
          timestamp: r.data_envio,
          read: readSet.has(id),
          priority: 'normal',
          category: 'Comunicação',
          iconName: 'message',
          color: 'text-purple-600',
        });
      });

      // Provas/Tarefas
      (provasTarefas as ProvaTarefa[]).forEach((p) => {
        const id = `prova-${p.id}`;
        list.push({
          id,
          type: 'prova_tarefa',
          title: `${p.tipo === 'prova' ? 'Prova' : 'Tarefa'}: ${p.titulo}`,
          message: `Data: ${new Date(p.data).toLocaleDateString('pt-BR')} - ${p.disciplina?.nome || ''}`,
          data: p,
          timestamp: p.criado_em,
          read: readSet.has(id),
          priority: getPriorityFromProvaDate(p.data),
          category: 'Agenda',
          iconName: 'calendar',
          color: p.tipo === 'prova' ? 'text-red-600' : 'text-blue-600',
        });
      });

      // Materiais
      (materiais as Material[]).forEach((m) => {
        const id = `material-${m.id}`;
        list.push({
          id,
          type: 'material',
          title: `Novo Material: ${m.titulo}`,
          message: `${m.tipo.toUpperCase()} - ${m.disciplina?.nome || ''}`,
          data: m,
          timestamp: m.criado_em,
          read: readSet.has(id),
          priority: 'normal',
          category: 'Materiais',
          iconName: 'file',
          color: 'text-green-600',
        });
      });

      // Admin: exemplo de notificação de sistema
      if (user.tipo_usuario === 'admin') {
        const id = 'sistema-1';
        list.push({
          id,
          type: 'sistema',
          title: 'Backup Automático Realizado',
          message: 'Backup diário executado com sucesso às 02:00',
          data: null,
          timestamp: new Date().toISOString(),
          read: true, // notificações de sistema não contam para o badge
          priority: 'baixa',
          category: 'Sistema',
          iconName: 'settings',
          color: 'text-gray-600',
        });
      }

      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotifications(list);
    } catch (e) {
      console.error('[NotificationContext] Erro ao carregar notificações', e);
    } finally {
      setLoading(false);
    }
  }, [dataService, user, readSet]);

  useEffect(() => { refresh(); }, [refresh]);

  // Realtime: auto-refresh em mudanças relevantes
  const scheduleRefresh = useCallback(() => {
    if (!isSupabaseConnected) return; // offline: sem realtime
    if (refreshTimer.current) {
      window.clearTimeout(refreshTimer.current);
    }
    // Debounce curto para coalescer múltiplos eventos
    refreshTimer.current = window.setTimeout(() => {
      refresh();
    }, 400);
  }, [refresh, isSupabaseConnected]);

  useEffect(() => {
    if (!isSupabaseConnected) return;
    initializeRealtime();
    // Broadcast específico para deleção de recados (otimização leve)
    const off = onRecadoDeletedBroadcast((payload: any) => {
      const recadoId = payload?.id || payload?.recado_id || payload; // aceitar formatos variados
      if (!recadoId) return;
      const id = `recado-${recadoId}`;
      setNotifications(prev => prev.filter(n => n.id !== id));
      setReadSet(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    });
    return () => {
      try {
        off();
      } catch (_e) {
        // ignore unsubscribe errors
      }
    };
  }, [isSupabaseConnected]);

  // Subscrições por entidade (insere/update/delete) -> refresh coalescido
  useRealtimeEntity('recados', () => scheduleRefresh());
  useRealtimeEntity('provas_tarefas', () => scheduleRefresh());
  useRealtimeEntity('materiais', () => scheduleRefresh());

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
    setReadSet((prev) => new Set<string>(prev).add(notificationId));
    // Persistir visualização no backend quando aplicável
    if (isSupabaseConnected) {
      // Resolver tipo e entityId com segurança (UUIDs e IDs com hífens)
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
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: false } : n)));
    setReadSet((prev) => {
      const next = new Set<string>(prev);
      next.delete(notificationId);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setReadSet(new Set<string>(notifications.map((n) => n.id)));
  }, [notifications]);

  const removeById = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    setReadSet((prev) => {
      const next = new Set<string>(prev);
      next.delete(notificationId);
      return next;
    });
  }, []);

  // Exclui no backend/localDB conforme o tipo e atualiza o estado
  const deleteById = useCallback(async (notificationId: string) => {
    try {
      // Resolver meta a partir do item armazenado para evitar problemas com hífens nos IDs
      const item = notifications.find(n => n.id === notificationId);
      const sep = notificationId.indexOf('-');
      const prefix = item ? (item.type === 'prova_tarefa' ? 'prova' : item.type) : (sep > 0 ? notificationId.slice(0, sep) : 'sistema');
      const entityId = (item?.data?.id as string | undefined) ?? (sep > 0 ? notificationId.slice(sep + 1) : undefined);
      let ok = false;
      if (prefix === 'recado' && entityId) {
        ok = await dataService.deleteRecado(entityId);
      } else if (prefix === 'prova' && entityId) {
        ok = await dataService.deleteProvaTarefa(entityId);
      } else if (prefix === 'material' && entityId) {
        ok = await dataService.deleteMaterial(entityId);
      } else if (prefix === 'sistema') {
        // apenas local
        ok = true;
      }
      if (ok) {
        removeById(notificationId);
        // Em ambientes online, mudanças virão via realtime; offline já está aplicado.
        if (!isSupabaseConnected) {
          // nada
        }
      }
      return ok;
    } catch (e) {
      console.error('[NotificationContext] Erro ao excluir notificação', notificationId, e);
      return false;
    }
  }, [dataService, isSupabaseConnected, removeById, notifications]);

  const deleteRead = useCallback(async () => {
    const idsParaExcluir = notifications.filter(n => n.read).map(n => n.id);
    if (idsParaExcluir.length === 0) return;
    await Promise.all(idsParaExcluir.map(id => deleteById(id)));
    // Como deleteById já remove, não é necessário set adicional; garantir consistência:
    await refresh();
  }, [notifications, deleteById, refresh]);

  const bulkDelete = useCallback(async (notificationIds: string[]) => {
    const recados: string[] = [];
    const provas: string[] = [];
    const materiais: string[] = [];
    const locais: string[] = [];
    notificationIds.forEach(nid => {
      const item = notifications.find(n => n.id === nid);
      const sep = nid.indexOf('-');
      const prefix = item ? (item.type === 'prova_tarefa' ? 'prova' : item.type) : (sep > 0 ? nid.slice(0, sep) : 'sistema');
      const entityId = (item?.data?.id as string | undefined) ?? (sep > 0 ? nid.slice(sep + 1) : undefined);
      if (prefix === 'recado' && entityId) recados.push(entityId);
      else if (prefix === 'prova' && entityId) provas.push(entityId);
      else if (prefix === 'material' && entityId) materiais.push(entityId);
      else locais.push(nid);
    });

    const successIds: string[] = [];
    const failedIds: string[] = [];

    try {
      if (recados.length > 0) {
        try {
          const res = await dataService.bulkDeleteRecados(recados);
          successIds.push(...res.successIds.map(id => `recado-${id}`));
          failedIds.push(...res.failedIds.map(id => `recado-${id}`));
        } catch {
          failedIds.push(...recados.map(id => `recado-${id}`));
        }
      }
      for (const id of provas) {
        try {
          const ok = await dataService.deleteProvaTarefa(id);
          if (ok) successIds.push(`prova-${id}`); else failedIds.push(`prova-${id}`);
        } catch {
          failedIds.push(`prova-${id}`);
        }
      }
      for (const id of materiais) {
        try {
          const ok = await dataService.deleteMaterial(id);
          if (ok) successIds.push(`material-${id}`); else failedIds.push(`material-${id}`);
        } catch {
          failedIds.push(`material-${id}`);
        }
      }
      // Locais (sistema, etc.)
      locais.forEach(id => successIds.push(id));
    } finally {
      // Remover do estado os que tiveram sucesso
      if (successIds.length > 0) {
        setNotifications(prev => prev.filter(n => !successIds.includes(n.id)));
        setReadSet(prev => {
          const next = new Set(prev);
          successIds.forEach(i => next.delete(i));
          return next;
        });
      }
      // Atualizar visão geral
      await refresh();
    }

    return { successIds, failedIds };
  }, [dataService, refresh]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo<NotificationContextValue>(() => ({
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
  }), [notifications, unreadCount, loading, refresh, markAsRead, markAsUnread, markAllAsRead, removeById, deleteById, deleteRead, bulkDelete]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

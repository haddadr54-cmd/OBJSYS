// Unificado para usar o cliente único supabase.ts
import { supabase } from './supabase';

// Tipos de eventos normalizados
export type RealtimeEntity = 'notas' | 'recados' | 'provas_tarefas' | 'materiais';
export type RealtimeAction = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeEvent<T = any> {
  entity: RealtimeEntity;
  action: RealtimeAction;
  newRecord?: T | null;
  oldRecord?: T | null;
  raw: any;
  receivedAt: number;
}

export type RealtimeCallback<T = any> = (event: RealtimeEvent<T>) => void;

// Broadcast callbacks (ex: eventos sintéticos como 'recado_deleted')
type BroadcastHandler = (payload: any) => void;
const broadcastListeners: Record<string, Set<BroadcastHandler>> = {
  recado_deleted: new Set()
};

interface SubscriptionHandle {
  entity: RealtimeEntity;
  unsubscribe: () => Promise<void>;
}

// Observers por entidade
const listeners: Record<RealtimeEntity, Set<RealtimeCallback>> = {
  notas: new Set(),
  recados: new Set(),
  provas_tarefas: new Set(),
  materiais: new Set()
};

let initialized = false;
const DEBUG_REALTIME = (import.meta as any).env?.VITE_DEBUG_REALTIME === 'true';
let activeChannels: SubscriptionHandle[] = [];
let broadcastChannelInitialized = false;

// Função para inicializar os canais uma única vez
export const initializeRealtime = () => {
  if (initialized) return;
  initialized = true;
  console.log('[Realtime] Inicializando canais...');
  attachChannel('notas');
  attachChannel('recados');
  attachChannel('provas_tarefas');
  attachChannel('materiais');
  attachBroadcastChannel();
};

function attachBroadcastChannel() {
  if (broadcastChannelInitialized) return;
  const channel = supabase.channel('recados_broadcast');
  channel.on('broadcast', { event: 'recado_deleted' }, (payload) => {
    if (DEBUG_REALTIME) console.debug('[Realtime][BROADCAST] recado_deleted', payload.payload);
    broadcastListeners.recado_deleted.forEach(cb => {
      try { cb(payload.payload); } catch (e) { console.error('[Realtime][BROADCAST] handler error', e); }
    });
  }).subscribe(status => {
    if (DEBUG_REALTIME) console.debug('[Realtime][BROADCAST][STATUS]', status);
  });
  broadcastChannelInitialized = true;
}

export const onRecadoDeletedBroadcast = (handler: BroadcastHandler) => {
  broadcastListeners.recado_deleted.add(handler);
  return () => broadcastListeners.recado_deleted.delete(handler);
};

function attachChannel(entity: RealtimeEntity) {
  const channel = supabase.channel(`public:${entity}`);

  channel.on(
    'postgres_changes',
    { event: '*', schema: 'public', table: entity },
    (payload) => {
      const action = (payload.eventType || 'UPDATE') as RealtimeAction;
      const evt: RealtimeEvent = {
        entity,
        action,
        newRecord: payload.new || null,
        oldRecord: payload.old || null,
        raw: payload,
        receivedAt: Date.now()
      };
      if (DEBUG_REALTIME) {
        console.debug('[Realtime][EVENT]', entity, action, {
          newId: (evt.newRecord as any)?.id,
            oldId: (evt.oldRecord as any)?.id
        });
      }
      // Emitir para listeners
      listeners[entity].forEach(cb => {
        try { cb(evt); } catch (e) { console.error('[Realtime] Listener error', e); }
      });
    }
  ).subscribe((status) => {
    if (!DEBUG_REALTIME) {
      if (status === 'SUBSCRIBED') console.log(`[Realtime] Canal ${entity} ativo`);
    } else {
      console.debug('[Realtime][STATUS]', entity, status);
    }
  });

  activeChannels.push({
    entity,
    unsubscribe: async () => {
      await supabase.removeChannel(channel);
    }
  });
}

export const onRealtime = <T = any>(entity: RealtimeEntity, callback: RealtimeCallback<T>) => {
  listeners[entity].add(callback as RealtimeCallback);
  return () => listeners[entity].delete(callback as RealtimeCallback);
};

export const shutdownRealtime = async () => {
  await Promise.all(activeChannels.map(c => c.unsubscribe()));
  activeChannels = [];
  initialized = false;
  console.log('[Realtime] Todos canais desligados');
};

// Hook utilitário (leve) – implementável mais completo depois
import { useEffect } from 'react';
export const useRealtimeEntity = <T = any>(entity: RealtimeEntity, handler: RealtimeCallback<T>) => {
  useEffect(() => {
    initializeRealtime();
    const off = onRealtime<T>(entity, handler);
    return () => { off(); };
  }, [entity, handler]);
};

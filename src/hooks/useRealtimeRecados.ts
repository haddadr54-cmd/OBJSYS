import { useCallback, useEffect, useRef, useState } from 'react';
import { useRealtimeEntity, RealtimeEvent, onRecadoDeletedBroadcast } from '../lib/realtime';
import type { Recado } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface UseRealtimeRecadosOptions {
  enabled?: boolean;
  initialFetch?: boolean;
}

export function useRealtimeRecados(options: UseRealtimeRecadosOptions = {}) {
  const { enabled = true, initialFetch = true } = options;
  const [recados, setRecados] = useState<Recado[]>([]);
  const [loading, setLoading] = useState<boolean>(!!initialFetch);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, Recado>>(new Map());
  const liveRef = useRef<boolean>(false);
  // Armazenar eventos recebidos antes do snapshot inicial para não perdê-los
  const pendingEventsRef = useRef<RealtimeEvent[]>([]);

  const applySnapshot = useCallback((rows: Recado[]) => {
    cacheRef.current.clear();
    rows.forEach(r => cacheRef.current.set(r.id, r));
    setRecados(Array.from(cacheRef.current.values()).sort((a,b)=>b.data_envio.localeCompare(a.data_envio)));
  }, []);

  const applyPending = useCallback(() => {
    if (pendingEventsRef.current.length === 0) return;
    const map = cacheRef.current;
    for (const evt of pendingEventsRef.current) {
      if (evt.action === 'INSERT' && evt.newRecord) {
        map.set(evt.newRecord.id, evt.newRecord);
      } else if (evt.action === 'UPDATE' && evt.newRecord) {
        map.set(evt.newRecord.id, evt.newRecord);
      } else if (evt.action === 'DELETE' && evt.oldRecord) {
        map.delete(evt.oldRecord.id);
      }
    }
    pendingEventsRef.current = [];
    setRecados(Array.from(map.values()).sort((a,b)=>b.data_envio.localeCompare(a.data_envio)));
  }, []);

  const fetchAll = useCallback(async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recados')
        .select(`*, autor:usuarios!enviado_por(*)`)
        .order('data_envio', { ascending: false });
      if (error) throw error;
      applySnapshot(data || []);
      liveRef.current = true;
      // Aplicar quaisquer eventos recebidos antes do snapshot
      applyPending();
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar recados');
    } finally {
      setLoading(false);
    }
  }, [applySnapshot, enabled, applyPending]);

  useRealtimeEntity('recados', (evt) => {
    if (!enabled) return;
    // Se snapshot ainda não chegou, enfileirar
    if (!liveRef.current) {
      pendingEventsRef.current.push(evt);
      return;
    }
    const map = cacheRef.current;
    if (evt.action === 'INSERT' && evt.newRecord) {
      map.set(evt.newRecord.id, evt.newRecord);
    } else if (evt.action === 'UPDATE' && evt.newRecord) {
      map.set(evt.newRecord.id, evt.newRecord);
    } else if (evt.action === 'DELETE') {
      const id = evt.oldRecord?.id || evt.newRecord?.id; // fallback defensivo
      if (id) map.delete(id);
    }
    setRecados(Array.from(map.values()).sort((a,b)=>b.data_envio.localeCompare(a.data_envio)));
  });

  // Broadcast redundante (fallback) – remove recado caso evento DELETE realtime não tenha sido aplicado
  useEffect(() => {
    if (!enabled) return;
    const off = onRecadoDeletedBroadcast(({ id }) => {
      const map = cacheRef.current;
      if (map.has(id)) {
        map.delete(id);
        setRecados(Array.from(map.values()).sort((a,b)=>b.data_envio.localeCompare(a.data_envio)));
      }
    });
    return () => { off(); };
  }, [enabled]);

  useEffect(() => { if (enabled && initialFetch) fetchAll(); }, [enabled, initialFetch, fetchAll]);

  return { recados, loading, error, refetch: fetchAll };
}

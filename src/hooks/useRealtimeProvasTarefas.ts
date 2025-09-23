import { useCallback, useEffect, useRef, useState } from 'react';
import { useRealtimeEntity, RealtimeEvent } from '../lib/realtime';
import type { ProvaTarefa } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface UseRealtimePTOptions {
  enabled?: boolean;
  initialFetch?: boolean;
}

export function useRealtimeProvasTarefas(options: UseRealtimePTOptions = {}) {
  const { enabled = true, initialFetch = true } = options;
  const [provasTarefas, setProvasTarefas] = useState<ProvaTarefa[]>([]);
  const [loading, setLoading] = useState<boolean>(!!initialFetch);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, ProvaTarefa>>(new Map());
  const liveRef = useRef<boolean>(false);
  const pendingEventsRef = useRef<RealtimeEvent[]>([]);

  const applySnapshot = useCallback((rows: ProvaTarefa[]) => {
    cacheRef.current.clear();
    rows.forEach(r => cacheRef.current.set(r.id, r));
    setProvasTarefas(Array.from(cacheRef.current.values()).sort((a,b)=>a.data.localeCompare(b.data)));
  }, []);

  const applyPending = useCallback(() => {
    if (pendingEventsRef.current.length === 0) return;
    const map = cacheRef.current;
    for (const evt of pendingEventsRef.current) {
      if (evt.action === 'INSERT' && evt.newRecord) map.set(evt.newRecord.id, evt.newRecord);
      else if (evt.action === 'UPDATE' && evt.newRecord) map.set(evt.newRecord.id, evt.newRecord);
      else if (evt.action === 'DELETE') {
        const id = evt.oldRecord?.id || evt.newRecord?.id;
        if (id) map.delete(id);
      }
    }
    pendingEventsRef.current = [];
    setProvasTarefas(Array.from(map.values()).sort((a,b)=>a.data.localeCompare(b.data)));
  }, []);

  const fetchAll = useCallback(async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('provas_tarefas')
        .select(`*, disciplina:disciplinas(*)`)
        .order('data', { ascending: true });
      if (error) throw error;
      applySnapshot(data || []);
      liveRef.current = true;
      applyPending();
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar provas/tarefas');
    } finally {
      setLoading(false);
    }
  }, [applySnapshot, enabled, applyPending]);

  useRealtimeEntity('provas_tarefas', (evt) => {
    if (!enabled) return;
    if (!liveRef.current) {
      pendingEventsRef.current.push(evt);
      return;
    }
    const map = cacheRef.current;
    if (evt.action === 'INSERT' && evt.newRecord) map.set(evt.newRecord.id, evt.newRecord);
    else if (evt.action === 'UPDATE' && evt.newRecord) map.set(evt.newRecord.id, evt.newRecord);
    else if (evt.action === 'DELETE') {
      const id = evt.oldRecord?.id || evt.newRecord?.id;
      if (id) map.delete(id);
    }
    setProvasTarefas(Array.from(map.values()).sort((a,b)=>a.data.localeCompare(b.data)));
  });

  useEffect(() => { if (enabled && initialFetch) fetchAll(); }, [enabled, initialFetch, fetchAll]);

  return { provasTarefas, loading, error, refetch: fetchAll };
}

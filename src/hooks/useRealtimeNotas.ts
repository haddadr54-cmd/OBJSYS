import { useCallback, useEffect, useRef, useState } from 'react';
import { useRealtimeEntity, RealtimeEvent } from '../lib/realtime';
import type { Nota } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface UseRealtimeNotasOptions {
  enabled?: boolean;
  initialFetch?: boolean;
}

export function useRealtimeNotas(options: UseRealtimeNotasOptions = {}) {
  const { enabled = true, initialFetch = true } = options;
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState<boolean>(!!initialFetch);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, Nota>>(new Map());
  const liveRef = useRef<boolean>(false);
  const pendingEventsRef = useRef<RealtimeEvent[]>([]);

  const applySnapshot = useCallback((rows: Nota[]) => {
    cacheRef.current.clear();
    rows.forEach(r => cacheRef.current.set(r.id, r));
    setNotas(Array.from(cacheRef.current.values()).sort((a,b)=>b.criado_em.localeCompare(a.criado_em)));
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
    setNotas(Array.from(map.values()).sort((a,b)=>b.criado_em.localeCompare(a.criado_em)));
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notas')
        .select(`*, aluno:alunos(*), disciplina:disciplinas(*)`)
        .order('criado_em', { ascending: false });
      if (error) throw error;
      applySnapshot(data || []);
      liveRef.current = true;
      applyPending();
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar notas');
    } finally {
      setLoading(false);
    }
  }, [applySnapshot, applyPending]);

  // Evento realtime
  useRealtimeEntity('notas', (evt) => {
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
    setNotas(Array.from(map.values()).sort((a,b)=>b.criado_em.localeCompare(a.criado_em)));
  });

  useEffect(() => {
    if (enabled && initialFetch) {
      fetchAll();
    }
  }, [enabled, initialFetch, fetchAll]);

  return { notas, loading, error, refetch: fetchAll };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRealtimeEntity, RealtimeEvent } from '../lib/realtime';
import type { Material } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface UseRealtimeMateriaisOptions {
  enabled?: boolean;
  initialFetch?: boolean;
}

export function useRealtimeMateriais(options: UseRealtimeMateriaisOptions = {}) {
  const { enabled = true, initialFetch = true } = options;
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(!!initialFetch);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, Material>>(new Map());
  const liveRef = useRef<boolean>(false);
  const pendingEventsRef = useRef<RealtimeEvent[]>([]);

  const applySnapshot = useCallback((rows: Material[]) => {
    cacheRef.current.clear();
    rows.forEach(r => cacheRef.current.set(r.id, r));
    setMateriais(Array.from(cacheRef.current.values()).sort((a,b)=>b.criado_em.localeCompare(a.criado_em)));
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
    setMateriais(Array.from(map.values()).sort((a,b)=>b.criado_em.localeCompare(a.criado_em)));
  }, []);

  const fetchAll = useCallback(async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('materiais')
        .select(`*, disciplina:disciplinas(*)`)
        .order('criado_em', { ascending: false });
      if (error) throw error;
      applySnapshot(data || []);
      liveRef.current = true;
      applyPending();
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar materiais');
    } finally {
      setLoading(false);
    }
  }, [applySnapshot, enabled, applyPending]);

  useRealtimeEntity('materiais', (evt) => {
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
    setMateriais(Array.from(map.values()).sort((a,b)=>b.criado_em.localeCompare(a.criado_em)));
  });

  useEffect(() => { if (enabled && initialFetch) fetchAll(); }, [enabled, initialFetch, fetchAll]);

  return { materiais, loading, error, refetch: fetchAll };
}

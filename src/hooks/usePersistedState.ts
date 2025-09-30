import React from 'react';

// Generic persisted state hook with JSON serialization.
// Safe against SSR (guards localStorage) and malformed JSON.
export function usePersistedState<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = React.useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  React.useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(state)); } catch { /* ignore */ }
  }, [key, state]);

  return [state, setState];
}

// Convenience boolean version
export function usePersistedBoolean(key: string, initial: boolean): [boolean, (v: boolean | ((prev: boolean) => boolean)) => void] {
  const [value, setValue] = usePersistedState<boolean>(key, initial);
  const set = React.useCallback((v: boolean | ((prev: boolean) => boolean)) => {
    setValue(prev => typeof v === 'function' ? (v as (p: boolean) => boolean)(prev) : v);
  }, [setValue]);
  return [value, set];
}
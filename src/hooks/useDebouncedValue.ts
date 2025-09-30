import { useEffect, useState } from 'react';

/**
 * Retorna um valor apenas após o usuário parar de atualizá-lo por um intervalo (debounce).
 * Útil para buscas e filtros que não devem disparar em cada digitação.
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}

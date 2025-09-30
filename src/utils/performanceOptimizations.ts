import React, { memo, useMemo, useCallback } from 'react';

/**
 * Utilitários para otimização de performance
 */

// Debounce otimizado para múltiplas funções
export function createMultiDebounce<T extends Record<string, (...args: any[]) => void>>(
  functions: T,
  delay: number = 300
): T {
  const timers: Record<string, NodeJS.Timeout> = {};
  
  const debouncedFunctions = {} as T;
  
  for (const [key, fn] of Object.entries(functions)) {
    debouncedFunctions[key as keyof T] = ((...args: any[]) => {
      if (timers[key]) clearTimeout(timers[key]);
      timers[key] = setTimeout(() => fn(...args), delay);
    }) as T[keyof T];
  }
  
  return debouncedFunctions;
}

// Cache inteligente com TTL
export class SmartCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>();
  
  set(key: string, data: T, ttl: number = 5 * 60 * 1000) { // 5 minutos padrão
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }
  
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear() {
    this.cache.clear();
  }
  
  // Limpeza automática de entradas expiradas
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton para cache global
export const globalCache = new SmartCache();

// Auto-limpeza do cache a cada 5 minutos
setInterval(() => globalCache.cleanup(), 5 * 60 * 1000);

// Hook para componentes memoizados
export const withPerformanceOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  isEqualFn?: (prevProps: P, nextProps: P) => boolean
) => {
  return memo(Component, isEqualFn);
};

// Utilitário para preparar dados complexos uma vez
export const useStableData = <T>(
  data: T,
  dependencies: any[] = []
): T => {
  return useMemo(() => data, dependencies);
};

// Factory para callbacks estáveis
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[] = []
): T => {
  return useCallback(callback, dependencies);
};

// Lazy loading otimizado com preload
export const createPreloadedLazy = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  preloadCondition?: () => boolean
) => {
  let modulePromise: Promise<{ default: T }> | null = null;
  
  const preload = () => {
    if (!modulePromise) {
      modulePromise = importFn();
    }
    return modulePromise;
  };
  
  // Preload automático se condição é atendida
  if (preloadCondition && preloadCondition()) {
    setTimeout(preload, 100);
  }
  
  const LazyComponent = React.lazy(() => {
    return modulePromise || preload();
  });
  
  (LazyComponent as any).preload = preload;
  return LazyComponent;
};

// Throttle para eventos de scroll/resize
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number = 16 // ~60fps
): T {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}

// Intersection Observer otimizado
export const createOptimizedObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  const throttledCallback = throttle(callback, 100);
  return new IntersectionObserver(throttledCallback, {
    rootMargin: '50px',
    threshold: [0, 0.25, 0.5, 0.75, 1],
    ...options
  });
};

// Virtual scrolling simples para listas grandes
export const useVirtualList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  return useMemo(() => {
    const itemCount = items.length;
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    
    return {
      totalHeight: itemCount * itemHeight,
      visibleItems: items.slice(0, Math.min(visibleCount + overscan * 2, itemCount)),
      getItemStyle: (index: number) => ({
        position: 'absolute' as const,
        top: index * itemHeight,
        height: itemHeight,
        width: '100%'
      })
    };
  }, [items, itemHeight, containerHeight, overscan]);
};
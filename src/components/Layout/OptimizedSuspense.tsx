import React, { Suspense, memo } from 'react';

// Componente de loading otimizado e reutilizável
export const OptimizedSuspense = memo(({ children, fallback }: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => (
  <Suspense 
    fallback={
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg text-gray-600 animate-pulse">Carregando...</p>
          </div>
        </div>
      )
    }
  >
    {children}
  </Suspense>
));

OptimizedSuspense.displayName = 'OptimizedSuspense';

// Fallback mais rápido para páginas
export const QuickPageLoader = memo(() => (
  <div className="animate-pulse p-6 space-y-4">
    <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
      ))}
    </div>
  </div>
));

QuickPageLoader.displayName = 'QuickPageLoader';

// HOC para otimizar componentes pesados
export function withOptimization<T extends Record<string, any>>(
  Component: React.ComponentType<T>
) {
  const OptimizedComponent = memo((props: T) => {
    return <Component {...props} />;
  });
  
  OptimizedComponent.displayName = `Optimized(${Component.displayName || Component.name})`;
  return OptimizedComponent;
}

// Sistema de cache para componentes React
class ComponentCache {
  private cache = new Map<string, React.ComponentType<any>>();
  
  set<T>(key: string, component: React.ComponentType<T>) {
    this.cache.set(key, component);
  }
  
  get<T>(key: string): React.ComponentType<T> | undefined {
    return this.cache.get(key) as React.ComponentType<T> | undefined;
  }
  
  has(key: string): boolean {
    return this.cache.has(key);
  }
  
  clear() {
    this.cache.clear();
  }
}

export const componentCache = new ComponentCache();

// Lazy loading otimizado com cache
export function createOptimizedLazy<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  cacheKey: string,
  preload: boolean = false
): React.LazyExoticComponent<T> {
  // Verificar cache primeiro - retorna lazy component mesmo se cacheado
  let componentPromise: Promise<{ default: T }> | null = null;
  
  const loadComponent = () => {
    if (!componentPromise) {
      componentPromise = importFn();
    }
    return componentPromise;
  };
  
  // Preload se solicitado
  if (preload) {
    requestIdleCallback(() => {
      loadComponent().then(module => {
        componentCache.set(cacheKey, module.default);
      }).catch(() => {}); // Silenciar erro de preload
    });
  }
  
  const LazyComponent = React.lazy(() => {
    return loadComponent().then(module => {
      componentCache.set(cacheKey, module.default);
      return module;
    });
  });
  
  // Adicionar método preload
  (LazyComponent as any).preload = loadComponent;
  
  return LazyComponent;
}

// Hook para preloading inteligente baseado em interação do usuário
export function useSmartPreload(
  dependencies: string[],
  loaders: (() => Promise<any>)[]
) {
  React.useEffect(() => {
  const timeouts: NodeJS.Timeout[] = [];
    
    const preloadWithDelay = () => {
      loaders.forEach((loader, index) => {
        const timeout = setTimeout(() => {
          requestIdleCallback(() => {
            loader().catch(() => {}); // Falha silenciosa no preload
          });
        }, index * 500); // Espaça os preloads
        
        timeouts.push(timeout);
      });
    };
    
    // Aguarda um pouco antes de iniciar preload
    const mainTimeout = setTimeout(preloadWithDelay, 1000);
    timeouts.push(mainTimeout);
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, dependencies);
}

// Intersection Observer para lazy loading de seções
export function useLazySection(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin: '50px' }
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [threshold, isVisible]);
  
  return { ref, isVisible };
}
import { useState, ReactNode } from 'react';
import { LogoContext, LogoContextType, defaultLogoConfig, LogoConfig } from './LogoContext';

interface LogoProviderProps { children: ReactNode; }

export function LogoProvider({ children }: LogoProviderProps) {
  // Pré-carrega do localStorage de forma síncrona para evitar flash visual
  const [logoConfig, setLogoConfig] = useState<LogoConfig>(() => {
    const saved = localStorage.getItem('systemLogoConfig');
    if (saved) {
      try { return { ...defaultLogoConfig, ...JSON.parse(saved) } as LogoConfig; } catch { /* ignore */ }
    }
    return defaultLogoConfig;
  });

  const updateLogoConfig: LogoContextType['updateLogoConfig'] = (cfg) => {
    setLogoConfig(prev => {
      const next = { ...prev, ...cfg };
      localStorage.setItem('systemLogoConfig', JSON.stringify(next));
      return next;
    });
  };

  return <LogoContext.Provider value={{ logoConfig, updateLogoConfig }}>{children}</LogoContext.Provider>;
}

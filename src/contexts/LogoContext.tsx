import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface LogoConfig {
  logoUrl: string;
  logoSize: 'small' | 'medium' | 'large';
  logoShape: 'square' | 'circle' | 'rounded';
  showText: boolean;
  systemName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

interface LogoContextType {
  logoConfig: LogoConfig;
  updateLogoConfig: (config: Partial<LogoConfig>) => void;
}

const defaultLogoConfig: LogoConfig = {
  logoUrl: '/logo-objetivo.png',
  logoSize: 'medium',
  logoShape: 'rounded',
  showText: true,
  systemName: 'Objetivo',
  primaryColor: '#002776',
  secondaryColor: '#3B82F6',
  accentColor: '#8B5CF6'
};

const LogoContext = createContext<LogoContextType | undefined>(undefined);

export function useLogoConfig() {
  const context = useContext(LogoContext);
  if (context === undefined) {
    throw new Error('useLogoConfig must be used within a LogoProvider');
  }
  return context;
}

interface LogoProviderProps {
  children: ReactNode;
}

export function LogoProvider({ children }: LogoProviderProps) {
  const [logoConfig, setLogoConfig] = useState<LogoConfig>(defaultLogoConfig);

  useEffect(() => {
    // Carregar configurações do logo do localStorage
    const savedLogoConfig = localStorage.getItem('systemLogoConfig');
    if (savedLogoConfig) {
      try {
        const config = JSON.parse(savedLogoConfig);
        setLogoConfig({ ...defaultLogoConfig, ...config });
      } catch (error) {
        console.error('Erro ao carregar configurações do logo:', error);
      }
    }
  }, []);

  const updateLogoConfig = (newConfig: Partial<LogoConfig>) => {
    const updatedConfig = { ...logoConfig, ...newConfig };
    setLogoConfig(updatedConfig);
    localStorage.setItem('systemLogoConfig', JSON.stringify(updatedConfig));
  };

  return (
    <LogoContext.Provider value={{ logoConfig, updateLogoConfig }}>
      {children}
    </LogoContext.Provider>
  );
}
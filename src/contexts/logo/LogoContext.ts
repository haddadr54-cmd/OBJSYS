import { createContext } from 'react';

export interface LogoConfig {
  logoUrl: string;
  logoSize: 'small' | 'medium' | 'large';
  logoShape: 'square' | 'circle' | 'rounded';
  showText: boolean;
  systemName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface LogoContextType {
  logoConfig: LogoConfig;
  updateLogoConfig: (config: Partial<LogoConfig>) => void;
}

export const defaultLogoConfig: LogoConfig = {
  logoUrl: '/logo-objetivo.png',
  logoSize: 'medium',
  logoShape: 'rounded',
  showText: true,
  systemName: 'Objetivo',
  primaryColor: '#002776',
  secondaryColor: '#3B82F6',
  accentColor: '#8B5CF6'
};

export const LogoContext = createContext<LogoContextType | undefined>(undefined);

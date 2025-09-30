import { createContext } from 'react';

export interface GlobalConfigState {
  [key: string]: any; // Estrutura flexível para diferentes customizações
}

export interface GlobalConfigContextType {
  configs: GlobalConfigState;
  saveConfig: (key: string, value: any) => Promise<void>;
  loading: boolean;
  error: string | null;
  isSupabaseConnected: boolean;
}

export const GlobalConfigContext = createContext<GlobalConfigContextType | undefined>(undefined);

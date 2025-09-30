import { createContext } from 'react';
import type { Usuario } from '../../lib/supabase.types';

export interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  isSupabaseConnected: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

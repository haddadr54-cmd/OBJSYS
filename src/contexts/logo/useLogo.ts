import { useContext } from 'react';
import { LogoContext } from './LogoContext';

export function useLogoConfig() {
  const ctx = useContext(LogoContext);
  if (!ctx) throw new Error('useLogoConfig must be used within LogoProvider');
  return ctx;
}

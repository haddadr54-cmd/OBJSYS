import { useContext } from 'react';
import { GlobalConfigContext } from './GlobalConfigContext';

export const useGlobalConfig = () => {
  const ctx = useContext(GlobalConfigContext);
  if (!ctx) throw new Error('useGlobalConfig deve ser usado dentro de GlobalConfigProvider');
  return ctx;
};

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ANTI-FLASH: Forçar visibilidade IMEDIATA
document.documentElement.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
document.documentElement.style.visibility = 'visible';
document.documentElement.style.opacity = '1';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

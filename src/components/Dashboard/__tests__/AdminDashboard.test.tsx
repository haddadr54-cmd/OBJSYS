import React from 'react';
// Mock global para requestIdleCallback (Vitest/jsdom)
if (typeof globalThis.requestIdleCallback === 'undefined') {
  const cbWrap = (cb: (deadline?: any) => void) => setTimeout(() => cb?.({ didTimeout: false, timeRemaining: () => 0 }), 1);
  (globalThis as any).requestIdleCallback = cbWrap as any;
}
import { describe, it, expect, beforeAll } from 'vitest';
// Mock localStorage para ambiente de teste
beforeAll(() => {
  if (typeof global.localStorage === 'undefined') {
    let store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value.toString(); },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; },
      key: (index: number) => Object.keys(store)[index] || null,
      get length() { return Object.keys(store).length; }
    } as Storage;
  }
});
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../../../contexts/auth/AuthProvider';
import { GlobalConfigProvider } from '../../../contexts/globalConfig/GlobalConfigProvider';
import AdminDashboard from '../AdminDashboard';

describe('AdminDashboard', () => {
  it('deve exibir o título Sistema', () => {
    render(
      <AuthProvider>
        <GlobalConfigProvider>
          <AdminDashboard onNavigate={() => {}} currentPage="dashboard" />
        </GlobalConfigProvider>
      </AuthProvider>
    );
    expect(screen.getByText(/Sistema/i)).toBeInTheDocument();
  });
});


import '@testing-library/jest-dom/vitest';
// setupTests.ts para Vitest
if (typeof globalThis.requestIdleCallback === 'undefined') {
  globalThis.requestIdleCallback = (cb) => setTimeout(cb, 1);
}

if (typeof globalThis.localStorage === 'undefined') {
  let store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() { return Object.keys(store).length; }
  } as Storage;
}

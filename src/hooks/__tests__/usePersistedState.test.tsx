import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { usePersistedState, usePersistedBoolean } from '../usePersistedState';

describe('usePersistedState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value and persists changes', () => {
  const { result } = renderHook(() => usePersistedState('k1', { a: 1 }));
    expect(result.current[0]).toEqual({ a: 1 });
    act(() => {
      result.current[1]({ a: 2 });
    });
    expect(JSON.parse(localStorage.getItem('k1') || '{}')).toEqual({ a: 2 });
  });

  it('restores from localStorage', () => {
    localStorage.setItem('k2', JSON.stringify({ a: 9 }));
  const { result } = renderHook(() => usePersistedState('k2', { a: 1 }));
    expect(result.current[0]).toEqual({ a: 9 });
  });
});

describe('usePersistedBoolean', () => {
  beforeEach(() => localStorage.clear());

  it('toggles and persists boolean', () => {
    const { result } = renderHook(() => usePersistedBoolean('flag', false));
    expect(result.current[0]).toBe(false);
  act(() => { result.current[1]((prev: boolean) => !prev); });
    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem('flag')).toBe('true');
  });
});
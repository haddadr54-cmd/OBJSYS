import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { useDebouncedValue } from '../useDebouncedValue';

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

describe('useDebouncedValue', () => {
  it('debounces value changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), { initialProps: { value: 'a', delay: 200 } });
    // initial immediate value
    expect(result.current).toBe('a');
    // change value
    rerender({ value: 'abc', delay: 200 });
    // still old until timer flush
    expect(result.current).toBe('a');
    act(() => { vi.advanceTimersByTime(199); });
    expect(result.current).toBe('a');
    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current).toBe('abc');
  });
});
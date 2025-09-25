// Centralized API client for frontend
// Uses VITE_API_BASE_URL when provided; falls back to relative "/" (useful for dev proxy)

const rawBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;

function normalizeBaseUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  // Remove trailing slash to avoid double slashes on join
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

export const API_BASE_URL = normalizeBaseUrl(rawBase);

function joinPath(base: string, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

export function apiUrl(path: string): string {
  return joinPath(API_BASE_URL, path);
}

export function apiFetch(input: string, init?: RequestInit) {
  return fetch(apiUrl(input), init);
}

// ── Token Storage Helpers ──────────────────────────────────────────────────────
// Safely wraps localStorage for SSR/SSG compatibility

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  
  // Set auth_token cookie for Next.js middleware (proxy.ts)
  document.cookie = `auth_token=${access}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  
  // Clear the cookie
  document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
}

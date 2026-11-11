import type { Account, AccountStats, PlayerStats, Pull, Rarity } from './types';

export const REWARD: Record<Rarity, number> = { common: 5, rare: 10, epic: 30, legendary: 100 };

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: {
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  });
  const payload = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) throw new ApiError(payload?.error ?? 'Something went wrong', res.status);
  return payload as T;
}

export interface SessionPayload {
  user: Account;
  stats: AccountStats;
}

export const getMe = () => request<SessionPayload>('/api/me');

export const register = (username: string, password: string) =>
  request<SessionPayload>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const login = (username: string, password: string) =>
  request<SessionPayload>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const logout = () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });

export const drawCard = () => request<{ card: Pull; balance: number }>('/api/draw', { method: 'POST' });

export const getCollection = () => request<{ balance: number; cards: Pull[] }>('/api/collection');

export const getPlayerStats = (id: string) =>
  request<PlayerStats>(`/api/player/${encodeURIComponent(id)}`);

import { useCallback, useEffect, useState } from 'react';
import { getMe, login, logout, register } from '../lib/api';
import type { Account, AccountStats } from '../lib/types';

export interface AccountState {
  user: Account | null;
  stats: AccountStats | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  applyBalance: (balance: number) => void;
}

export function useAccount(): AccountState {
  const [user, setUser] = useState<Account | null>(null);
  const [stats, setStats] = useState<AccountStats | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const payload = await getMe();
      setUser(payload.user);
      setStats(payload.stats);
    } catch {
      setUser(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signUp = useCallback(async (username: string, password: string) => {
    const payload = await register(username, password);
    setUser(payload.user);
    setStats(payload.stats);
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const payload = await login(username, password);
    setUser(payload.user);
    setStats(payload.stats);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      setStats(null);
    }
  }, []);

  const applyBalance = useCallback((balance: number) => {
    setUser((current) => (current ? { ...current, balance } : current));
  }, []);

  return { user, stats, loading, signIn, signUp, signOut, refresh, applyBalance };
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getStoredToken, setStoredToken } from '../api/client';
import type { User } from '../types';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      return;
    }
    const me = await api.me();
    setUser(me);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (getStoredToken()) await refreshUser();
      } catch {
        setStoredToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await api.login(email, password);
    setStoredToken(token);
    setUser(u);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { token, user: u } = await api.register({ name, email, password });
    setStoredToken(token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

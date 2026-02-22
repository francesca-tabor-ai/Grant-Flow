import React, { createContext, useContext, useState, useEffect } from 'react';

type User = { id: string; email: string; name: string | null; role: string } | null;

const API_BASE = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? '';

function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' });
}

async function parseErrorResponse(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { error?: string };
    if (typeof json?.error === 'string') return json.error;
  } catch {
    /* ignore */
  }
  if (res.status === 0 || text === '') return 'Network error. Check the server and try again.';
  return text.slice(0, 200) || `Request failed (${res.status})`;
}

const AuthContext = createContext<{
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('grantflow_token') : null;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authFetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setUser(u?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const msg = await parseErrorResponse(res);
      throw new Error(msg || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('grantflow_token', data.token);
    setUser(data.user);
  };

  const register = async (email: string, password: string, name?: string) => {
    const res = await authFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const msg = await parseErrorResponse(res);
      throw new Error(msg || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('grantflow_token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('grantflow_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

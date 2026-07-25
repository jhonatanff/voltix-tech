import { createContext, useContext, useState, useCallback } from 'react';
import { API_URL } from '../config';

const STORAGE_KEY = 'voltix_auth';
const AuthContext = createContext(null);

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function requestAuth(path, payload) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    // respuesta sin cuerpo JSON
  }

  if (!res.ok) {
    throw new Error(data.error || 'No se pudo completar la solicitud. Intenta de nuevo.');
  }
  return data;
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  const persist = (value) => {
    setAuth(value);
    if (value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const register = useCallback(async ({ name, phone, email, password }) => {
    const data = await requestAuth('/api/auth/register', { name, phone, email, password });
    persist(data);
    return data;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await requestAuth('/api/auth/login', { email, password });
    persist(data);
    return data;
  }, []);

  const logout = useCallback(() => persist(null), []);

  const value = {
    user: auth?.user || null,
    token: auth?.token || null,
    isAuthenticated: Boolean(auth?.token),
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

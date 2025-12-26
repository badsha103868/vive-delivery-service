import React, { createContext, useContext, useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('vive_token'));

  useEffect(() => {
    async function load() {
      if (!token) return setUser(null);
      try {
        const res = await fetch(`${API_BASE}/api/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Not authenticated');
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.warn('Auth load failed', err);
        setToken(null);
        localStorage.removeItem('vive_token');
        setUser(null);
      }
    }
    load();
  }, [token]);

  async function login({ email, password }) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Login failed');
    localStorage.setItem('vive_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function register({ name, email, password }) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Register failed');
    localStorage.setItem('vive_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vive_token');
  }

  function fetchWithAuth(url, opts = {}) {
    return fetch(url, {
      ...opts,
      headers: { ...(opts.headers || {}), Authorization: token ? `Bearer ${token}` : undefined },
    });
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

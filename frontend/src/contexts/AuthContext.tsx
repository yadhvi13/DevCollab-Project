"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';

interface User {
  _id: string;
  id?: string;
  username: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
    }
    setToken(newToken);
    setUser(newUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Client-side initialization
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (savedToken) {
      setToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      if (user) {
        setLoading(false);
        return;
      }
      // Fetch user profile
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          logout();
        }
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
    }
  }, [token, user, logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  showAuth: boolean;
  setShowAuth: (show: boolean) => void;
  login: (user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use a short timeout for auth check - if backend is down, fail fast
        const { data } = await api.get('/auth/me', { timeout: 3000 });
        setUser(data);
      } catch (error: any) {
        // Silently handle network errors and proxy errors (500/503) when backend is offline
        const isOffline = !error?.response || error?.status === 500 || error?.status === 503;
        const isAuthError = error?.status === 401;

        if (!isOffline && !isAuthError) {
          console.log('Auth check failed:', error?.message || 'Unknown error');
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (userData: UserProfile) => {
    // If token is provided in the body, store it as a fallback for cross-site cookie issues
    if (userData.token) {
      localStorage.setItem('citrus_token', userData.token);
    }
    setUser(userData);
    setShowAuth(false);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      localStorage.removeItem('citrus_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, showAuth, setShowAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

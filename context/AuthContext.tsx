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
  const [user, setUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('citrus_user_cache');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('citrus_user_cache'); // Only load if no cache
  });
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('citrus_token');

      // If no token exists locally, skip the request to avoid unnecessary 401 console errors
      // Note: This assumes token is required for cross-site persistence
      if (!token) {
        setLoading(false);
        setUser(null);
        return;
      }

      try {
        // Use a short timeout for auth check - if backend is down, fail fast
        const { data } = await api.get('/auth/me', { timeout: 2000 });
        setUser(data);
        localStorage.setItem('citrus_user_cache', JSON.stringify(data));
      } catch (error: any) {
        // Silently handle network errors and auth failures
        const isOffline = !error?.response || error?.status === 0 || error?.status === 500 || error?.status === 503 || error?.code === 'ECONNABORTED';
        const isAuthError = error?.response?.status === 401;

        if (isOffline) {
          const cachedUser = localStorage.getItem('citrus_user_cache');
          if (cachedUser) {
            setUser(JSON.parse(cachedUser));
            setLoading(false);
            return;
          }
        }

        if (isAuthError) {
          localStorage.removeItem('citrus_token');
          localStorage.removeItem('citrus_user_cache');
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
    localStorage.setItem('citrus_user_cache', JSON.stringify(userData));
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
      localStorage.removeItem('citrus_user_cache');
      localStorage.removeItem('citrus_cache_accounts');
      localStorage.removeItem('citrus_cache_transactions');
      localStorage.removeItem('citrus_cache_types');
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

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
        // Try to get current user from backend (cookies will be sent automatically)
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error) {
        // If 401 or network error, user is not logged in
        console.log('Not authenticated');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (userData: UserProfile) => {
    setUser(userData);
    setShowAuth(false);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
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

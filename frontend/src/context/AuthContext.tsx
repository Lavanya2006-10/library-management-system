import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: Role) => Promise<void>;
  register: (name: string, email: string, password: string, role?: Role, department?: string, year?: number) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartlib_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('smartlib_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('smartlib_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('smartlib_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Session expired or invalid token', err);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('smartlib_token', newToken);
    localStorage.setItem('smartlib_user', JSON.stringify(newUser));
  };

  const demoLogin = async (role: Role) => {
    const credentials = {
      admin: { email: 'admin@smartlib.io', password: 'adminpassword' },
      librarian: { email: 'librarian@smartlib.io', password: 'librarianpassword' },
      student: { email: 'lavanyas.24it@kongu.edu', password: 'studentpassword' },
    };
    const cred = credentials[role];
    if (cred) {
      await login(cred.email, cred.password);
    }
  };

  const register = async (name: string, email: string, password: string, role: Role = 'student', department?: string, year?: number) => {
    const res = await api.post('/auth/register', { name, email, password, role, department, year });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('smartlib_token', newToken);
    localStorage.setItem('smartlib_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smartlib_token');
    localStorage.removeItem('smartlib_user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('smartlib_user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('smartlib_user', JSON.stringify(res.data.user));
    } catch (err) {
      console.error('Failed to refresh user profile', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        demoLogin,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

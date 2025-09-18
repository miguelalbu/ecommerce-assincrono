import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    cpf_cnpj: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (name: string, email: string, password: string, cpf_cnpj: string) => Promise<User | null>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const register = async (name: string, email: string, password: string, cpf_cnpj: string): Promise<User | null> => {
    try {
      const response = await api.post('/auth/register', { 
        name, 
        email, 
        password, 
        cpf_cnpj,
        role: 'USER'
      });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Registration failed', error);
      return null;
    }
  };
  
  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      return userData; 
    } catch (error) {
      console.error('Login failed', error);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decodedToken = JSON.parse(atob(payload));
        setUser(decodedToken.user); 
      } catch (error) {
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
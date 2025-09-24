// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Validate token by fetching current user
          const response = await authAPI.getCurrentUser();
          setUser(response.user);
          // console.log('✅ User authenticated from stored token');
        } catch (error) {
          // Token is invalid, clear everything
          // console.log('❌ Invalid token, clearing auth data');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('cart');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // console.log('🔐 Attempting login for:', email);
      const response = await authAPI.login({ email, password });
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      
      // console.log('✅ Login successful for:', response.user.email);
      
      // Dispatch event for CartContext to reload cart
      window.dispatchEvent(new CustomEvent('authLogin', { detail: response.user }));
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      // console.log('👤 Attempting registration for:', userData.email);
      const response = await authAPI.register(userData);
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      
      // console.log('✅ Registration successful for:', response.user.email);
      
      // Dispatch event for CartContext to reload cart
      window.dispatchEvent(new CustomEvent('authLogin', { detail: response.user }));
      
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // console.log('🚪 Logging out user:', user?.email);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setUser(null);
    
    // Dispatch event for CartContext to clear cart
    window.dispatchEvent(new Event('authLogout'));
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
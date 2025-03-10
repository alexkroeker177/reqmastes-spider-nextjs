'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (token: string, userData: any) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    console.log('Auth Provider mounted');
    try {
      const storedUser = localStorage.getItem('user');
      console.log('Stored user:', storedUser);
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('Parsed user data:', userData);
        setUser(userData);
        setIsAuthenticated(true);
      }
      
      checkAuth(); // Always verify with server
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    console.log('Checking auth with server');
    try {
      const response = await fetch('/api/auth/check');
      console.log('Auth check response:', response);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Server auth data:', userData);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Saved user data to localStorage');
      } else {
        console.log('Auth check failed, clearing user data');
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (token: string, userData: any) => {
    console.log('Login called with:', { token, userData });
    try {
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('User data saved to localStorage after login');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const logout = async () => {
    console.log('Logout called');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
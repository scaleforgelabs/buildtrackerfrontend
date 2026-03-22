"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService } from '@/libs/api/auth';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (!token || !refreshToken) {
        // Automatically clear any lingering state if either token is missing
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        return;
      }

      if (token) {
        const response = await authService.getProfile();
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      const { token, refresh_token, user } = response.data;

      localStorage.setItem('access_token', token);
      localStorage.setItem('refresh_token', refresh_token);
      setUser(user);
    } catch (error: any) {
      // If account is not verified, redirect to OTP verification
      if (error.response?.status === 403 && error.response?.data?.requires_verification) {
        const unverifiedEmail = error.response.data.email;
        window.location.href = `/otp-verification?email=${encodeURIComponent(unverifiedEmail)}`;
        return;
      }
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authService.register(data);
      // Registration no longer returns tokens - user must verify OTP first
      // The signup page will handle the redirect to OTP verification
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      if (refresh_token) {
        await authService.logout(refresh_token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Custom hook for checking if user is authenticated
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, loading]);

  return { isAuthenticated, loading };
}
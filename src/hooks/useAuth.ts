import { useCallback, useEffect, useState } from 'react';
import { getApiUrl } from '../config';

interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  fullName: string;
  id: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
  };
  timestamp: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const API_URL = getApiUrl();

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize state from localStorage if available
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      isAuthenticated: !!token,
    };
  });
  const [loading, setLoading] = useState(true);

  // Update localStorage when auth state changes
  useEffect(() => {
    if (authState.user) {
      localStorage.setItem('user', JSON.stringify(authState.user));
    } else {
      localStorage.removeItem('user');
    }
  }, [authState.user]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const responseData: AuthResponse = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.message || 'Login failed');
      }

      // Update auth state
      const newAuthState = {
        user: responseData.data.user,
        isAuthenticated: true,
      };
      setAuthState(newAuthState);

      // Store token and user data in localStorage
      localStorage.setItem('authToken', responseData.data.accessToken);
      localStorage.setItem('user', JSON.stringify(responseData.data.user));

      // Redirect to dashboard after successful login
      window.location.href = '/masters/channel';

      return responseData.data.user;
    } catch {
      // Login failed - ignoring error details
      throw new Error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setLoading(true);

    // Clear auth state
    setAuthState({
      user: null,
      isAuthenticated: false,
    });

    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Force a page reload to clear all state
    window.location.href = '/login';

    setLoading(false);
  }, []);

  const checkAuth = useCallback(() => {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    const isAuthenticated = !!token;

    if (isAuthenticated && storedUser) {
      setAuthState({
        user: JSON.parse(storedUser),
        isAuthenticated: true,
      });
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
      });
    }

    setLoading(false);
    return isAuthenticated;
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading,
    login,
    logout,
    checkAuth,
  };
};

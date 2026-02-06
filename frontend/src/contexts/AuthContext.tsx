import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Admin, LoginFormData } from '../types';
import { apiClient, endpoints } from '../lib/api';
import { storage } from '../lib/utils';
import toast from 'react-hot-toast';

interface AuthState {
  user: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: Admin }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

interface AuthContextType extends AuthState {
  login: (credentials: LoginFormData) => Promise<boolean>;
  logout: (showToast?: boolean) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const token = storage.get<string>('authToken');
    if (token) {
      // Verify token with backend
      verifyToken();
    }
  }, []);

  const verifyToken = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      const profileRes = await apiClient.get<{ success: boolean; data: { admin: Admin } }>(endpoints.profile);
      const admin = profileRes?.data?.admin;
      // If we get admin data successfully, consider token valid
      if (admin && profileRes?.success) {
        dispatch({ type: 'AUTH_SUCCESS', payload: admin });
      } else {
        throw new Error('Invalid profile response');
      }
    } catch (error: any) {
      // Clear invalid token
      storage.remove('authToken');
      dispatch({ type: 'AUTH_FAILURE', payload: error?.message || 'Token verification failed' });
    }
  };

  const login = async (credentials: LoginFormData): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const result = await apiClient.post<{ success: boolean; data: { admin: Admin; accessToken: string; expiresIn?: string } }>(
        endpoints.login,
        credentials
      );

      // Check if response is successful
      if (!result?.success) {
        throw new Error('Login failed');
      }

      const admin = result?.data?.admin;
      const accessToken = result?.data?.accessToken;
      if (!admin || !accessToken) {
        throw new Error('Invalid login response - missing admin or token');
      }
      
      // Store token
      storage.set('authToken', accessToken);
      
      // Update state
      dispatch({ type: 'AUTH_SUCCESS', payload: admin });
      
      toast.success(`Welcome back, ${admin?.name ?? 'Admin'}!`);
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed. Please check your credentials.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = async (showToast: boolean = true) => {
    try {
      // Call logout endpoint (don't wait for it if it fails)
      try {
        await apiClient.post(endpoints.logout);
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API call failed:', error);
      }
    } finally {
      // Always clear local storage and state, regardless of API call result
      storage.remove('authToken');
      
      // Clear any other auth-related storage
      try {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        // Clear all localStorage items that might be auth-related
        Object.keys(localStorage).forEach(key => {
          if (key.includes('auth') || key.includes('token') || key.includes('user')) {
            localStorage.removeItem(key);
          }
        });
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('auth') || key.includes('token') || key.includes('user')) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (e) {
        // Ignore storage errors
      }
      
      // Dispatch logout action to clear state immediately
      dispatch({ type: 'LOGOUT' });
      
      // Show success message only if requested
      if (showToast) {
        toast.success('Logged out successfully');
      }
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
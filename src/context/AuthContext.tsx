import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthTokens, User } from '../types';
import { loginUser } from '../services/authService';
import { jwtDecode } from '../utils/jwt';

interface AuthContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens');
        
        if (storedTokens) {
          const parsedTokens: AuthTokens = JSON.parse(storedTokens);
          const expiresAt = new Date(parsedTokens.expires_at);
          
          // Check if token is still valid
          if (expiresAt > new Date()) {
            setTokens(parsedTokens);
            setIsAuthenticated(true);
            
            // Decode user from token
            const decodedUser = jwtDecode<User>(parsedTokens.access_token);
            if (decodedUser) {
              setUser(decodedUser);
            }
          } else {
            // Token expired, clear storage
            localStorage.removeItem('auth_tokens');
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string) => {
    try {
      const response = await loginUser(username);
      
      if (response.data) {
        const tokenData = response.data;
        
        // Store tokens
        setTokens(tokenData);
        localStorage.setItem('auth_tokens', JSON.stringify(tokenData));
        
        // Decode and set user
        const decodedUser = jwtDecode<User>(tokenData.access_token);
        if (decodedUser) {
          setUser(decodedUser);
        }
        
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_tokens');
    setIsAuthenticated(false);
    setUser(null);
    setTokens(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitialized,
        user,
        tokens,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
// app/contexts/AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isLoggedIn: boolean | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthStatus();

    // Set up event listeners with dynamic import to avoid circular dependencies
    const setupEventListeners = async () => {
      try {
        const { authEvents } = await import('../services/AuthService');
        
        // Listen for logout events from AuthService
        const logoutSubscription = authEvents.addListener('logout', (event: any) => {
          console.log('🔔 AuthContext received logout event:', event);
          setIsLoggedIn(false);
        });

        // Listen for auth failure events (token refresh failures, etc.)
        const authFailureSubscription = authEvents.addListener('authFailure', (event: any) => {
          console.log('🔔 AuthContext received auth failure event:', event);
          setIsLoggedIn(false);
        });

        // Return cleanup function
        return () => {
          logoutSubscription.remove();
          authFailureSubscription.remove();
        };
      } catch (error) {
        console.error('Error setting up auth event listeners:', error);
      }
    };

    let cleanup: (() => void) | undefined;
    setupEventListeners().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    // Cleanup on unmount
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(loggedIn === 'true');
    } catch (error) {
      console.error('Auth check error:', error);
      setIsLoggedIn(false);
    }
  };

  const login = async () => {
    await AsyncStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('username');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
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

// default export so expo-router doesn't warn about a missing route component
export default AuthProvider;
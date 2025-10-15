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
      const [loggedIn, pinVerified, lastVerification] = await Promise.all([
        AsyncStorage.getItem('isLoggedIn'),
        AsyncStorage.getItem('pinVerified'),
        AsyncStorage.getItem('lastPinVerification')
      ]);

      const isLoggedIn = loggedIn === 'true';
      const isPinVerified = pinVerified === 'true';
      
      // Check if PIN verification has expired (24 hours)
      const pinExpired = lastVerification 
        ? Date.now() - new Date(lastVerification).getTime() > 24 * 60 * 60 * 1000
        : true;

      console.log('Auth status check:', {
        isLoggedIn,
        isPinVerified,
        pinExpired,
        lastVerification
      });

      // User is truly authenticated only if logged in AND PIN is verified (and not expired)
      setIsLoggedIn(isLoggedIn && isPinVerified && !pinExpired);
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
    await AsyncStorage.clear();
    console.log('User logged out, cleared AsyncStorage');
    AsyncStorage.getAllKeys().then(keys => console.log(keys));
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
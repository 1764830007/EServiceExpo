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
        const logoutHandler = (event: any) => {
          console.log('🔔 AuthContext received logout event:', event);
          console.log('🔄 Setting isLoggedIn to false');
          setIsLoggedIn(false);
          
          // Force immediate auth status check
          setTimeout(() => {
            console.log('🔄 Re-checking auth status after logout');
            checkAuthStatus();
          }, 100);
        };

        // Listen for auth failure events (token refresh failures, etc.)
        const authFailureHandler = (event: any) => {
          console.log('🔔 AuthContext received auth failure event:', event);
          setIsLoggedIn(false);
        };

        const logoutSubscription = authEvents.addListener('logout', logoutHandler);
        const authFailureSubscription = authEvents.addListener('authFailure', authFailureHandler);

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
    try {
      // Import AuthService dynamically to avoid circular dependency
      const { default: authService } = await import('../services/AuthService');
      await authService.logout();
      console.log('✅ AuthContext logout completed');
    } catch (error) {
      console.error('❌ AuthContext logout error:', error);
      // Fallback: clear storage and set state
      await AsyncStorage.clear();
      setIsLoggedIn(false);
    }
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
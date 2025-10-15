import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, AppStateStatus, View } from 'react-native';
// import 'react-native-reanimated';
import LanguageProvider from "@/hooks/locales/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from './contexts/ThemeContext';

function RouteProtection({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const [initialAuthCheck, setInitialAuthCheck] = useState(false);

  // Initial auth check to prevent index page flash
  useEffect(() => {
    const performInitialAuthCheck = async () => {
      try {
        const [authToken, isLoggedInStored, userPIN, pinVerified] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('isLoggedIn'),
          AsyncStorage.getItem('userPIN'),
          AsyncStorage.getItem('pinVerified')
        ]);

        const hasAuth = !!(authToken && isLoggedInStored === 'true');
        const hasPIN = !!userPIN;
        const isPinVerified = pinVerified === 'true';

        console.log('Initial auth check:', { hasAuth, hasPIN, isPinVerified, segments });

        // Check if already on the intended page to prevent unnecessary redirects
        const inAuthGroup = segments[0] === 'User';

        // Determine where to navigate based on auth state
        if (!hasAuth) {
          // No authentication - go to login (only if not already there)
          if (!inAuthGroup) {
            console.log('No auth - navigating to login');
            router.replace('/User/login');
          } else {
            console.log('No auth but already in auth group - staying');
          }
        } else if (!hasPIN) {
          // Has auth but no PIN - go to PIN setup (only if not already there)
          const inPinSetup = segments[0] === 'pin' && segments[1] === 'pin-setup';
          if (!inPinSetup) {
            console.log('Has auth, no PIN - navigating to PIN setup');
            router.replace('/pin/pin-setup');
          } else {
            console.log('Has auth, no PIN but already in PIN setup - staying');
          }
        } else if (!isPinVerified) {
          // Has auth and PIN but not verified - go to PIN verify (only if not already there)
          const inPinVerify = segments[0] === 'pin' && segments[1] === 'pin-verify';
          if (!inPinVerify) {
            console.log('Has auth and PIN, not verified - navigating to PIN verify');
            router.replace('/pin/pin-verify');
          } else {
            console.log('Has auth and PIN, not verified but already in PIN verify - staying');
          }
        } else {
          // Fully authenticated - go to main app (only if not already there)
          const inTabsGroup = segments[0] === '(tabs)';
          if (!inTabsGroup) {
            console.log('Fully authenticated - navigating to tabs');
            router.replace('/(tabs)');
          } else {
            console.log('Fully authenticated and already in tabs - staying');
          }
        }

        setInitialAuthCheck(true);
      } catch (error) {
        console.error('Initial auth check error:', error);
        router.replace('/User/login');
        setInitialAuthCheck(true);
      }
    };

    performInitialAuthCheck();
  }, []);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log('App state changed:', appState.current, '->', nextAppState);
      
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came back to foreground - require PIN verification
        const [authToken, userPIN] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('userPIN')
        ]);

        if (authToken && userPIN) {
          console.log('App resumed - clearing PIN verification and redirecting to PIN verify');
          await AsyncStorage.removeItem('pinVerified');
          // Immediately redirect to PIN verification
          router.replace('/pin/pin-verify');
        }
      }
      
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (isLoggedIn === null || !initialAuthCheck) return;

    const checkPinStatus = async () => {
      try {
        const inAuthGroup = segments[0] === 'User';
        const inTabsGroup = segments[0] === '(tabs)';
        const inPinSetup = segments[0] === 'pin' && segments[1] === 'pin-setup';
        const inPinVerify = segments[0] === 'pin' && segments[1] === 'pin-verify';

        // Skip route protection completely for PIN setup page
        if (inPinSetup) {
          console.log('In PIN setup - skipping route protection');
          return;
        }

        // If user lands on index/tabs without being authenticated, redirect to login
        if (inTabsGroup && !isLoggedIn) {
          console.log('User on tabs without authentication - redirecting to login');
          router.replace('/User/login');
          return;
        }

        const [authToken, userPIN, pinVerified, lastVerification] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('userPIN'),
          AsyncStorage.getItem('pinVerified'),
          AsyncStorage.getItem('lastPinVerification')
        ]);

        const hasAuthToken = !!authToken;
        const hasPIN = !!userPIN;
        const isPinVerified = pinVerified === 'true';
        
        // Check if PIN verification has expired (24 hours)
        const pinExpired = lastVerification 
          ? Date.now() - new Date(lastVerification).getTime() > 24 * 60 * 60 * 1000
          : true;

        console.log("Route protection:", { 
          isLoggedIn, 
          segments, 
          hasAuthToken,
          hasPIN,
          isPinVerified,
          pinExpired
        });

        // Priority check: If user is not logged in (logout scenario), redirect to login immediately
        if (!isLoggedIn) {
          console.log('User not logged in - redirecting to login');
          if (!inAuthGroup) {
            router.replace('/User/login');
          }
          return;
        }

        // If user has auth token but no PIN, redirect to PIN setup
        if (hasAuthToken && !hasPIN && !inAuthGroup) {
          console.log('Redirecting to PIN setup');
          router.replace('/pin/pin-setup');
          return;
        }

        // If user has PIN but not verified (or expired), redirect to PIN verify
        // Also require PIN verification on app start even if previously verified
        if (hasAuthToken && hasPIN && (!isPinVerified || pinExpired) && !inPinVerify && !inAuthGroup) {
          console.log('Redirecting to PIN verification');
          router.replace('/pin/pin-verify');
          return;
        }

        // If user has auth token and PIN but is verified and not expired,
        // still require PIN verification if not in tabs (app first start)
        if (hasAuthToken && hasPIN && isPinVerified && !pinExpired && !inTabsGroup && !inPinVerify && !inAuthGroup) {
          console.log('App first start - requiring PIN verification');
          await AsyncStorage.removeItem('pinVerified');
          router.replace('/pin/pin-verify');
          return;
        }

        // If user is properly authenticated and in auth group, redirect to main app
        if (isLoggedIn && inAuthGroup) {
          console.log("Redirecting to tabs");
          router.replace("/(tabs)");
          return;
        }
      } catch (error) {
        console.error('Route protection error:', error);
        router.replace('/User/login');
      }
    };

    checkPinStatus();
  }, [isLoggedIn, segments, initialAuthCheck]);

  // Show loading screen during initial auth check to prevent index page flash
  if (!initialAuthCheck) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <RouteProtection>
            <Stack screenOptions={{animation: "ios_from_right"}}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="User" options={{ headerShown: false }} />
              <Stack.Screen name="pin/pin-setup" options={{ headerShown: false }} />
              <Stack.Screen name="pin/pin-verify" options={{ headerShown: false }} />
              <Stack.Screen name="dark-mode" options={{ headerShown: false }} />
              <Stack.Screen name="devices" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </RouteProtection>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

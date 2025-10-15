import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from 'react-native';
// import 'react-native-reanimated';
import LanguageProvider from "@/hooks/locales/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from './contexts/ThemeContext';
export const unstable_settings = {
  anchor: "(tabs)",
};

function RouteProtection({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const appState = useRef<AppStateStatus>(AppState.currentState);

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
    if (isLoggedIn === null) return;

    const checkPinStatus = async () => {
      try {
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

        const inAuthGroup = segments[0] === 'User';
        const inTabsGroup = segments[0] === '(tabs)';
        const inPinSetup = segments[0] === 'pin' && segments[1] === 'pin-setup';
        const inPinVerify = segments[0] === 'pin' && segments[1] === 'pin-verify';

        console.log("Route protection:", { 
          isLoggedIn, 
          segments, 
          hasAuthToken,
          hasPIN,
          isPinVerified,
          pinExpired
        });

        // If user has auth token but no PIN, redirect to PIN setup
        if (hasAuthToken && !hasPIN && !inPinSetup && !inAuthGroup) {
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
        // BUT skip this if user is coming from PIN setup
        if (hasAuthToken && hasPIN && isPinVerified && !pinExpired && !inTabsGroup && !inPinVerify && !inAuthGroup && !inPinSetup) {
          console.log('App first start - requiring PIN verification');
          await AsyncStorage.removeItem('pinVerified');
          router.replace('/pin/pin-verify');
          return;
        }

        // If user is not logged in and not in auth flow, redirect to login
        if (!isLoggedIn && !inAuthGroup && !inPinSetup && !inPinVerify) {
          console.log('Redirecting to login');
          router.replace('/User/login');
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
  }, [isLoggedIn, segments]);

  if (isLoggedIn === null) {
    return null;
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

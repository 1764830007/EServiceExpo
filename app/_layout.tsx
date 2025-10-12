import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
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

  useEffect(() => {
    if (isLoggedIn === null) return;

    const inAuthGroup = segments[0] === "login";
    const inTabsGroup = segments[0] === "(tabs)";

    console.log("Route protection:", { isLoggedIn, segments });

    if (!isLoggedIn && !inAuthGroup) {
      console.log("Redirecting to login");
      router.replace("/login");
    } else if (isLoggedIn && inAuthGroup) {
      console.log("Redirecting to tabs");
      router.replace("/(tabs)");
    }
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
            <Stack screenOptions={{animation: 'fade'}}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="devices" options={{ headerShown: false }} />
              <Stack.Screen name="devices/equipment-list" options={{ headerShown: false }} />
              <Stack.Screen name="dark-mode" options={{ headerShown: false }} />
              <Stack.Screen name="devices/equipment-report" options={{ headerShown: false }} />
              <Stack.Screen name="devices/equipment-fault-alert" options={{ headerShown: false }} />
              <Stack.Screen name="devices/equipment-fence" options={{ headerShown: false }} />
              <Stack.Screen name="devices/equipment-bind-list" options={{ headerShown: false }} />
              <Stack.Screen name="devices/equipment-create-bind" options={{ headerShown: false }} />
              
            </Stack>
            <StatusBar style="auto" />
          </RouteProtection>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

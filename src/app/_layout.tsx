import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { palette } from '@/components/fit-ui';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { WardrobeProvider } from '@/context/wardrobe-context';
import { FittingProvider } from '@/context/fitting-context';
import { WeatherProvider } from '@/context/weather-context';

export const unstable_settings = { initialRouteName: 'login' };

// Deja pasar a login/registro sin sesión, y manda para allá cualquier otra
// pantalla si todavía no hay nadie logueado. Cuando sí hay sesión, saca al
// usuario de login/registro y lo manda al armario.
function AuthGate({ children }: { children: ReactNode }) {
  const { ready, session } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const inAuthScreens = segments[0] === 'login' || segments[0] === 'register';
    if (!session && !inAuthScreens) {
      router.replace('/login');
    } else if (session && inAuthScreens) {
      router.replace('/(tabs)');
    }
  }, [ready, session, segments, router]);

  if (!ready) {
    return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: palette.paper }}><ActivityIndicator color={palette.blue} /></View>;
  }
  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Barlow: require('../../assets/fonts/BarlowCondensed-Regular.ttf'),
    BarlowBold: require('../../assets/fonts/BarlowCondensed-SemiBold.ttf'),
  });
  if (!loaded && !error) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: palette.paper }}><ActivityIndicator color={palette.blue} /></View>;
  return <SafeAreaProvider><AuthProvider><WardrobeProvider><WeatherProvider><FittingProvider>
    <View style={{ flex: 1, backgroundColor: '#E2E4E4', alignItems: 'center' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 480 : undefined, backgroundColor: palette.paper }}>
        <StatusBar style="auto" />
        <AuthGate>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.paper }, animation: 'slide_from_right' }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="add" />
            <Stack.Screen name="try-on" />
          </Stack>
        </AuthGate>
      </View>
    </View>
  </FittingProvider></WeatherProvider></WardrobeProvider></AuthProvider></SafeAreaProvider>;
}

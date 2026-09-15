import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import { WardrobeProvider } from '@/context/wardrobe-context';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <WardrobeProvider>
        <Tabs
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            tabBarStyle: { backgroundColor: colors.background },
            tabBarActiveTintColor: colors.text,
            tabBarInactiveTintColor: colors.textSecondary,
          }}>
          <Tabs.Screen name="index" options={{ title: 'Armario' }} />
          <Tabs.Screen name="add" options={{ title: 'Agregar' }} />
        </Tabs>
      </WardrobeProvider>
    </ThemeProvider>
  );
}

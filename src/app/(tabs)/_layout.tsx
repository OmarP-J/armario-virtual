import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Label, palette } from '@/components/fit-ui';

const tabs = [
  { name: 'index', title: 'Armario', icon: 'grid-outline' },
  { name: 'fits', title: 'Fits IA', icon: 'layers-outline' },
  { name: 'add', title: 'Añadir', icon: 'add' },
  { name: 'tienda', title: 'Tienda', icon: 'bag-outline' },
  { name: 'perfil', title: 'Perfil', icon: 'person-outline' },
] as const;
export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return <Tabs screenOptions={{ headerShown: false }} tabBar={({ state, navigation }) =>
    <View style={{ flexDirection: 'row', paddingBottom: Math.max(insets.bottom, 8), paddingTop: 8, borderTopWidth: 1, borderColor: palette.line, backgroundColor: palette.paper }}>
      {tabs.map(tab => {
        const selected = state.routes[state.index].name === tab.name;
        const color = selected ? palette.blue : '#8A9297';
        return <Pressable key={tab.name} accessibilityRole="tab" accessibilityLabel={tab.title} accessibilityState={{ selected }}
          onPress={() => {
            if (tab.name === 'add') { router.push('/add'); return; }
            const route = state.routes.find(route => route.name === tab.name);
            if (!route) return;
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!event.defaultPrevented) navigation.navigate(tab.name);
          }} style={{ flex: 1, minHeight: 48, justifyContent: 'center', alignItems: 'center', gap: 5 }}>
          <Ionicons name={tab.icon} size={tab.name === 'add' ? 25 : 20} color={color} />
          <Label style={{ color, fontSize: 9, letterSpacing: 1.4 }}>{tab.title}</Label>
        </Pressable>;
      })}
    </View>}>
    <Tabs.Screen name="index" /><Tabs.Screen name="fits" /><Tabs.Screen name="tienda" /><Tabs.Screen name="perfil" />
  </Tabs>;
}

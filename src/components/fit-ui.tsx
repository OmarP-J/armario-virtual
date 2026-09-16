import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextProps, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const palette = {
  paper: '#F3F3F1', ink: '#222625', muted: '#777F85', line: '#CED1D2',
  blue: '#5A82A5', pale: '#E4EDF3', navy: '#1D2D39', navyDeep: '#15334D', white: '#FFFFFF',
};

export function Copy({ style, ...props }: TextProps) {
  return <Text {...props} style={[s.copy, style]} />;
}
export function Label({ children, light = false, style, ...props }: TextProps & { light?: boolean }) {
  return <Text {...props} style={[s.label, { color: light ? '#B6C9D8' : palette.blue }, style]}>{children}</Text>;
}
export function Title({ children, light = false, style, ...props }: TextProps & { light?: boolean }) {
  return <Text {...props} accessibilityRole="header" style={[s.title, light && { color: palette.white }, style]}>{children}</Text>;
}
export function Screen({ children, dark = false, scroll = true }: { children: ReactNode; dark?: boolean; scroll?: boolean }) {
  return <SafeAreaView style={[s.screen, dark && { backgroundColor: palette.navy }]} edges={['top', 'left', 'right']}>
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>{children}</ScrollView> : children}
  </SafeAreaView>;
}
export function Heading({ eyebrow, title, subtitle, back = false, dark = false, right }: {
  eyebrow: string; title: string; subtitle?: string; back?: boolean; dark?: boolean; right?: ReactNode;
}) {
  const router = useRouter();
  return <View style={s.heading}>
    {back && <Pressable accessibilityRole="button" accessibilityLabel="Volver" hitSlop={8}
      onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={s.back}>
      <Ionicons name="chevron-back" size={22} color={dark ? palette.white : palette.ink} />
    </Pressable>}
    <View style={{ flex: 1, gap: 3 }}><Label light={dark}>{eyebrow}</Label><Title light={dark}>{title}</Title>
      {subtitle && <Copy style={dark ? { color: '#B6C9D8' } : undefined}>{subtitle}</Copy>}
    </View>{right}
  </View>;
}
export function Action({ children, onPress, outline = false, dark = false, icon, disabled = false, style }: {
  children: string; onPress: () => void; outline?: boolean; dark?: boolean;
  icon?: keyof typeof Ionicons.glyphMap; disabled?: boolean; style?: ViewStyle;
}) {
  const color = outline ? (dark ? '#D5E0E8' : palette.ink) : palette.white;
  return <Pressable accessibilityRole="button" accessibilityLabel={children} accessibilityState={{ disabled }}
    disabled={disabled} onPress={onPress} style={({ pressed }) => [s.action,
      outline && { backgroundColor: 'transparent', borderColor: dark ? '#586A78' : palette.line },
      (pressed || disabled) && { opacity: 0.55 }, style]}>
    {icon && <Ionicons name={icon} size={17} color={color} />}
    <Text style={[s.actionText, { color }]}>{children}</Text>
  </Pressable>;
}
export function Chip({ children, selected = false, onPress, dark = false }: {
  children: string; selected?: boolean; onPress: () => void; dark?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={children} accessibilityState={{ selected }} onPress={onPress}
    style={[s.chip, dark && { borderColor: '#667885' }, selected && { borderColor: palette.blue, backgroundColor: palette.blue }]}>
    <Label style={{ color: selected ? '#FFF' : dark ? '#C4D2DD' : '#5B6267', fontSize: 11, letterSpacing: 1.3 }}>{children}</Label>
  </Pressable>;
}
export function Badge({ children, dark = false }: { children: string; dark?: boolean }) {
  return <View style={[s.badge, dark && { borderColor: '#63727D' }]}><Label light={dark} style={{ fontSize: 10, letterSpacing: 1 }}>{children}</Label></View>;
}
export function Note({ children, dark = false, icon = 'information-circle-outline' }: {
  children: string; dark?: boolean; icon?: keyof typeof Ionicons.glyphMap;
}) {
  return <View style={s.note}><Ionicons name={icon} size={16} color={dark ? '#A3C1D9' : palette.blue} />
    <Copy style={[{ flex: 1, fontSize: 12, lineHeight: 18 }, dark && { color: '#BACAD6' }]}>{children}</Copy></View>;
}
export const ui = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, alignItems: 'center' },
  section: { gap: 12, marginBottom: 20 },
  rule: { borderWidth: 1, borderColor: palette.line, padding: 14, gap: 8 },
  input: { minHeight: 46, borderWidth: 1, borderColor: palette.line, paddingHorizontal: 12, color: palette.ink, fontSize: 14, backgroundColor: '#FFF' },
  error: { color: '#B34337', fontSize: 13, lineHeight: 19 },
});
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 22, paddingBottom: 28, flexGrow: 1 },
  copy: { fontSize: 13, lineHeight: 20, color: palette.muted },
  label: { fontFamily: 'Barlow', fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase' },
  title: { fontFamily: 'BarlowBold', fontSize: 31, lineHeight: 35, textTransform: 'uppercase', color: palette.ink },
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginBottom: 22 },
  back: { paddingTop: 13, minHeight: 44, justifyContent: 'center' },
  action: { minHeight: 49, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: palette.blue,
    backgroundColor: palette.blue, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  actionText: { fontFamily: 'BarlowBold', fontSize: 15, letterSpacing: 2.3, textTransform: 'uppercase', textAlign: 'center' },
  chip: { minHeight: 34, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: '#BFC5C8', justifyContent: 'center' },
  badge: { borderWidth: 1, borderColor: palette.line, paddingVertical: 4, paddingHorizontal: 7, alignSelf: 'flex-start' },
  note: { flexDirection: 'row', gap: 9, paddingVertical: 12, alignItems: 'flex-start' },
});

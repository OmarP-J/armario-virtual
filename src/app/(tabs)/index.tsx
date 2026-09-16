import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Action, Chip, Copy, Heading, Label, Note, palette, Screen, Title, ui } from '@/components/fit-ui';
import { GarmentArt } from '@/components/garment-art';
import { CATEGORIES, ClothingItem, useWardrobe } from '@/context/wardrobe-context';
import { useFitting } from '@/context/fitting-context';
import { DEMO_ITEMS } from '@/data/demo';

export default function WardrobeScreen() {
  const router = useRouter();
  const { items, loading, storageError, removeItem } = useWardrobe();
  const { fits } = useFitting();
  const [filter, setFilter] = useState('todo');
  const [selected, setSelected] = useState<ClothingItem | null>(null);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(false);
  const demo = !items.length;
  const displayed = demo ? DEMO_ITEMS : items;
  const filtered = displayed.filter(item => filter === 'todo' || item.category === filter);
  if (loading) return <Screen><Copy>Cargando tu armario…</Copy></Screen>;
  return <Screen>
    <Heading eyebrow="Mi armario" title={displayed.length + ' prendas'} subtitle={fits.length + ' fits guardados · ' + (demo ? 'armario de ejemplo' : 'guardado en este dispositivo')}
      right={<Pressable accessibilityRole="button" accessibilityLabel="Agregar prenda" onPress={() => router.push('/add')} style={styles.add}><Ionicons name="add" size={23} color={palette.ink} /></Pressable>} />
    {storageError && <Copy style={ui.error}>{storageError}</Copy>}
    <View style={[ui.row, { marginBottom: 15 }]}>
      <Chip selected={filter === 'todo'} onPress={() => setFilter('todo')}>Todo</Chip>
      {CATEGORIES.filter(category => category.value !== 'otro' || displayed.some(item => item.category === 'otro')).map(category => <Chip key={category.value} selected={filter === category.value} onPress={() => setFilter(category.value)}>{category.label}</Chip>)}
    </View>
    <View style={styles.grid}>{filtered.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={'Ver ' + item.type} onPress={() => { setSelected(item); setError(''); }} style={styles.card}>
      <View style={styles.art}><GarmentArt item={item} /></View>
      <View style={styles.details}><Title style={{ fontFamily: 'Barlow', fontSize: 18, lineHeight: 23 }}>{item.type}</Title>
        <Copy style={{ fontSize: 11 }}>{item.color}{item.material ? ' · ' + item.material : ' · ' + item.season}</Copy></View>
    </Pressable>)}</View>
    {!filtered.length && <View style={{ paddingVertical: 40 }}><Title style={{ fontSize: 24 }}>Un espacio para algo nuevo</Title><Copy>Todavía no tienes prendas en esta categoría.</Copy></View>}
    <Action icon="sparkles-outline" onPress={() => router.push('/fits')} style={{ marginTop: 18 }}>Generar fit con IA</Action>
    {demo && <Note>Estas prendas son de ejemplo. Añade tu primera prenda para empezar tu propio armario.</Note>}
    <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
      <View style={styles.overlay}><View style={styles.modal}>
        {selected && <>
          <Heading eyebrow={selected.demo ? 'Prenda de ejemplo' : 'Tu prenda'} title={selected.type} right={<Pressable accessibilityRole="button" accessibilityLabel="Cerrar detalle" onPress={() => setSelected(null)} style={styles.add}><Ionicons name="close" size={23} /></Pressable>} />
          <View style={{ height: 220, backgroundColor: '#E7EAEB' }}><GarmentArt item={selected} /></View>
          <Copy>{selected.color} · {selected.material ? selected.material + ' · ' : ''}{selected.season}</Copy>
          <Label>{CATEGORIES.find(category => category.value === selected.category)?.label}</Label>
          {error ? <Copy style={ui.error}>{error}</Copy> : null}
          {!selected.demo && <Action outline disabled={removing} onPress={async () => { setRemoving(true); try { await removeItem(selected.id); setSelected(null); } catch { setError('No se pudo eliminar. Inténtalo de nuevo.'); } finally { setRemoving(false); } }}>{removing ? 'Eliminando…' : 'Eliminar del armario'}</Action>}
          {selected.demo && <Action onPress={() => { setSelected(null); router.push('/add'); }}>Añadir mi primera prenda</Action>}
        </>}
      </View></View>
    </Modal>
  </Screen>;
}
const styles = StyleSheet.create({
  add: { width: 42, height: 42, borderWidth: 1, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', flexGrow: 1, maxWidth: '49%', borderWidth: 1, borderColor: palette.line },
  art: { height: 170, backgroundColor: '#E8EDF0', borderBottomWidth: 1, borderColor: palette.line },
  details: { paddingHorizontal: 10, paddingVertical: 12, gap: 4 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#101C2ABD', padding: 24 },
  modal: { backgroundColor: palette.paper, padding: 24, width: '100%', maxWidth: 410, gap: 15 },
});

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ClothingItem, useWardrobe } from '@/context/wardrobe-context';

export default function WardrobeScreen() {
  const { items, loading } = useWardrobe();
  const router = useRouter();

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Cargando tu armario…</ThemedText>
      </ThemedView>
    );
  }

  if (items.length === 0) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          Tu armario está vacío
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
          Agrega tu primera prenda desde la pestaña &quot;Agregar&quot;.
        </ThemedText>
        <Pressable
          onPress={() => router.push('/add')}
          style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}>
          <ThemedText type="smallBold" style={styles.emptyButtonText}>
            Agregar prenda
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <ClothingCard item={item} />}
      />
    </SafeAreaView>
  );
}

function ClothingCard({ item }: { item: ClothingItem }) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Image source={{ uri: item.photoUri }} style={styles.photo} contentFit="cover" />
      <ThemedText type="smallBold" numberOfLines={1} style={styles.cardTitle}>
        {item.type || 'Sin tipo'}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
        {item.color || 'Sin color'} · {item.season}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    gap: Spacing.two,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: Spacing.three,
    backgroundColor: '#3c87f7',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  emptyButtonText: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.7,
  },
  list: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  row: {
    gap: Spacing.three,
  },
  card: {
    flex: 1,
    borderRadius: Spacing.three,
    padding: Spacing.two,
    gap: Spacing.half,
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Spacing.two,
    marginBottom: Spacing.half,
  },
  cardTitle: {
    textTransform: 'capitalize',
  },
});

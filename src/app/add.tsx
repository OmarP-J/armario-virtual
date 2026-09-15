import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { Season, useWardrobe } from '@/context/wardrobe-context';

const SEASONS: Season[] = ['primavera', 'verano', 'otoño', 'invierno'];

export default function AddItemScreen() {
  const { addItem } = useWardrobe();
  const router = useRouter();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [season, setSeason] = useState<Season>('verano');
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Falta permiso', 'Necesitamos acceso a tus fotos para elegir una imagen.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!photoUri) {
      Alert.alert('Falta la foto', 'Elige una foto de la prenda antes de guardar.');
      return;
    }
    if (!type.trim()) {
      Alert.alert('Falta el tipo', 'Escribe qué tipo de prenda es (ej. camisa, pantalón).');
      return;
    }

    setSaving(true);
    try {
      await addItem({ photoUri, type: type.trim(), color: color.trim(), season });
      setPhotoUri(null);
      setType('');
      setColor('');
      setSeason('verano');
      router.push('/');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable onPress={pickImage} style={styles.photoPicker}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} contentFit="cover" />
          ) : (
            <ThemedView type="backgroundElement" style={styles.photoPlaceholder}>
              <ThemedText type="smallBold">Toca para elegir una foto</ThemedText>
            </ThemedView>
          )}
        </Pressable>

        <ThemedText type="smallBold" style={styles.label}>
          Tipo de prenda
        </ThemedText>
        <TextInputField value={type} onChangeText={setType} placeholder="Ej. camisa, pantalón, abrigo" />

        <ThemedText type="smallBold" style={styles.label}>
          Color
        </ThemedText>
        <TextInputField value={color} onChangeText={setColor} placeholder="Ej. azul, negro" />

        <ThemedText type="smallBold" style={styles.label}>
          Temporada
        </ThemedText>
        <ThemedView style={styles.seasonRow}>
          {SEASONS.map((s) => (
            <Pressable
              key={s}
              onPress={() => setSeason(s)}
              style={[styles.seasonChip, season === s && styles.seasonChipSelected]}>
              <ThemedText
                type="small"
                style={season === s ? styles.seasonTextSelected : undefined}>
                {s}
              </ThemedText>
            </Pressable>
          ))}
        </ThemedView>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [styles.saveButton, (pressed || saving) && styles.pressed]}>
          <ThemedText type="smallBold" style={styles.saveButtonText}>
            {saving ? 'Guardando…' : 'Guardar prenda'}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function TextInputField(props: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      placeholderTextColor={Colors.light.textSecondary}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  photoPicker: {
    marginBottom: Spacing.two,
  },
  photoPreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Spacing.three,
  },
  photoPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderColor: '#B4B2A9',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  seasonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  seasonChip: {
    borderWidth: 1,
    borderColor: '#B4B2A9',
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  seasonChipSelected: {
    backgroundColor: '#3c87f7',
    borderColor: '#3c87f7',
  },
  seasonTextSelected: {
    color: '#ffffff',
  },
  saveButton: {
    marginTop: Spacing.four,
    backgroundColor: '#3c87f7',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.7,
  },
});

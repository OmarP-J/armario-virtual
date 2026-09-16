import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Action, Chip, Copy, Heading, Label, palette, Screen, ui } from '@/components/fit-ui';
import { CATEGORIES, Category, Season, useWardrobe } from '@/context/wardrobe-context';

const SEASONS: { value: Season; label: string }[] = [
  { value: 'primavera', label: 'Primavera' },
  { value: 'verano', label: 'Verano' },
  { value: 'otoño', label: 'Otoño' },
  { value: 'invierno', label: 'Invierno' },
];

export default function AddItemScreen() {
  const { addItem } = useWardrobe();
  const router = useRouter();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [season, setSeason] = useState<Season>('verano');
  const [category, setCategory] = useState<Category>('tops');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const pickImage = async () => {
    setError('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Necesitamos acceso a tus fotos para elegir una imagen.');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: true,
        aspect: [4, 5],
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      setError('No se pudo abrir la galería. Inténtalo de nuevo.');
    }
  };

  const takePhoto = async () => {
    setError('');
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Necesitamos acceso a tu cámara para tomar la foto.');
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: true,
        aspect: [4, 5],
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      setError('No se pudo abrir la cámara. Inténtalo de nuevo.');
    }
  };

  const handleSave = async () => {
    if (!photoUri) {
      setError('Elige una foto de la prenda antes de guardar.');
      return;
    }
    if (!type.trim()) {
      setError('Escribe qué tipo de prenda es (ej. camisa, pantalón).');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await addItem({
        photoUri,
        type: type.trim(),
        color: color.trim(),
        material: material.trim() || undefined,
        season,
        category,
      });
      router.back();
    } catch {
      setError('No se pudo guardar la prenda. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Heading eyebrow="Nueva prenda" title="Añadir al armario" subtitle="Guárdala para armar más fits." back />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={photoUri ? 'Cambiar foto de la prenda' : 'Vista previa de la foto'}
        onPress={photoUri ? pickImage : undefined}
        style={{ marginBottom: 12 }}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={{ width: '100%', aspectRatio: 4 / 5, backgroundColor: '#E6EAEC' }} contentFit="cover" />
        ) : (
          <View
            style={{
              width: '100%',
              aspectRatio: 4 / 5,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: palette.line,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}>
            <Label style={{ color: palette.muted }}>Toma o elige una foto de la prenda</Label>
          </View>
        )}
      </Pressable>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <Action outline icon="camera-outline" style={{ flex: 1 }} onPress={takePhoto}>
          Tomar foto
        </Action>
        <Action outline icon="images-outline" style={{ flex: 1 }} onPress={pickImage}>
          Galería
        </Action>
      </View>

      <View style={ui.section}>
        <Label style={{ color: palette.muted }}>Categoría</Label>
        <View style={ui.row}>
          {CATEGORIES.map((c) => (
            <Chip key={c.value} selected={category === c.value} onPress={() => setCategory(c.value)}>
              {c.label}
            </Chip>
          ))}
        </View>
      </View>

      <View style={ui.section}>
        <Label style={{ color: palette.muted }}>Tipo de prenda</Label>
        <TextInput
          value={type}
          onChangeText={setType}
          placeholder="Ej. camisa, pantalón, abrigo"
          placeholderTextColor={palette.muted}
          style={ui.input}
        />
      </View>

      <View style={ui.section}>
        <Label style={{ color: palette.muted }}>Color</Label>
        <TextInput
          value={color}
          onChangeText={setColor}
          placeholder="Ej. azul, negro"
          placeholderTextColor={palette.muted}
          style={ui.input}
        />
      </View>

      <View style={ui.section}>
        <Label style={{ color: palette.muted }}>Material (opcional)</Label>
        <TextInput
          value={material}
          onChangeText={setMaterial}
          placeholder="Ej. algodón, lino, piel"
          placeholderTextColor={palette.muted}
          style={ui.input}
        />
      </View>

      <View style={ui.section}>
        <Label style={{ color: palette.muted }}>Temporada</Label>
        <View style={ui.row}>
          {SEASONS.map((s) => (
            <Chip key={s.value} selected={season === s.value} onPress={() => setSeason(s.value)}>
              {s.label}
            </Chip>
          ))}
        </View>
      </View>

      {error ? <Copy style={ui.error}>{error}</Copy> : null}

      <Action onPress={handleSave} disabled={saving} style={{ marginTop: 8 }}>
        {saving ? 'Guardando…' : 'Guardar prenda'}
      </Action>
    </Screen>
  );
}

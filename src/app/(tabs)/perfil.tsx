import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Action, Chip, Copy, Heading, Label, Note, palette, Screen, ui } from '@/components/fit-ui';
import { Mannequin } from '@/components/mannequin';
import { Measurement } from '@/components/measurement';
import { useAuth } from '@/context/auth-context';
import { useFitting } from '@/context/fitting-context';
import { SKIN_TONES } from '@/data/demo';

export default function PerfilScreen() {
  const router = useRouter();
  const { profile, updateProfile, ready, error } = useFitting();
  const { session, logout } = useAuth();
  const [angle, setAngle] = useState(15);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  if (!ready) return <Screen><Copy>Cargando tus medidas…</Copy></Screen>;
  return <Screen>
    <Heading eyebrow="Mi cuerpo" title="Arma tu maniquí" subtitle="Se ajusta en vivo con lo que llenes." back />
    <View style={{ flexDirection: 'row', gap: 14, marginBottom: 22 }}>
      <View style={{ width: '39%', height: 260, borderWidth: 1, borderColor: palette.line, backgroundColor: '#E6EAEC' }}>
        <Label style={{ textAlign: 'right', fontSize: 10, padding: 8, letterSpacing: 1 }}>{profile.height + ' cm · ' + profile.weight + ' kg'}</Label>
        {photo ? <Image source={{ uri: photo }} style={{ flex: 1 }} contentFit="contain" /> : <Mannequin profile={profile} angle={angle} onAngleChange={setAngle} />}
        <Label style={{ fontSize: 9, letterSpacing: 1, padding: 9, borderTopWidth: 1, borderColor: palette.line }}>{photo ? 'Foto de referencia' : 'Arrastra para girar'}</Label>
      </View>
      <View style={{ flex: 1, gap: 12 }}>
        <Label style={{ color: palette.muted }}>Sexo</Label>
        <View style={ui.row}>{['Mujer', 'Hombre', 'No binarie'].map(sex => <Chip key={sex} selected={profile.sex === sex} onPress={() => updateProfile({ sex })}>{sex}</Chip>)}</View>
        <Label style={{ color: palette.muted }}>Tono de piel</Label>
        <View style={[ui.row, { gap: 6 }]}>{SKIN_TONES.map((color, index) => <Pressable key={color} accessibilityRole="button" accessibilityLabel={'Tono de piel ' + (index + 1)} accessibilityState={{ selected: profile.skin === index }} onPress={() => updateProfile({ skin: index })} style={{ width: 28, height: 32, backgroundColor: color, borderWidth: profile.skin === index ? 2 : 1, borderColor: profile.skin === index ? palette.ink : '#B5ACA0', alignItems: 'center', justifyContent: 'center' }}>{profile.skin === index && <Ionicons name="checkmark" size={16} color={index > 3 ? '#FFF' : '#322416'} />}</Pressable>)}</View>
        <Label style={{ color: palette.muted }}>Complexión</Label>
        <View style={ui.row}>{['Delgada', 'Media', 'Atlética', 'Robusta'].map(build => <Chip key={build} selected={profile.build === build} onPress={() => updateProfile({ build })}>{build}</Chip>)}</View>
      </View>
    </View>
    {!photo && <View style={[ui.row, { marginBottom: 18 }]}>{[{ label: 'Frente', angle: 0 }, { label: 'Perfil', angle: 90 }, { label: 'Espalda', angle: 180 }].map(view => <Chip key={view.label} selected={angle === view.angle} onPress={() => setAngle(view.angle)}>{view.label}</Chip>)}</View>}
    <Measurement label="Edad" value={profile.age} min={18} max={85} unit="años" onChange={age => updateProfile({ age })} />
    <Measurement label="Altura" value={profile.height} min={130} max={210} unit="cm" onChange={height => updateProfile({ height })} />
    <Measurement label="Peso" value={profile.weight} min={35} max={160} unit="kg" onChange={weight => updateProfile({ weight })} />
    {error || photoError ? <Copy style={ui.error}>{error || photoError}</Copy> : null}
    <View style={[ui.rule, { paddingVertical: 0, marginBottom: 14 }]}><Note icon="lock-closed-outline">Tus medidas se guardan solo en este dispositivo. El maniquí es una representación esquemática.</Note></View>
    <View style={ui.section}>
      <Action onPress={() => router.push('/try-on')}>Ver cómo me queda</Action>
      <Action outline icon={photo ? 'person-outline' : 'camera-outline'} onPress={async () => {
        if (photo) { setPhoto(null); return; }
        setPhotoError('');
        try {
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
          if (!result.canceled && result.assets[0]) setPhoto(result.assets[0].uri);
        } catch { setPhotoError('No se pudo abrir la foto. Inténtalo de nuevo.'); }
      }}>{photo ? 'Volver al maniquí' : 'Usar mi foto como referencia'}</Action>
    </View>
    {photo && <Copy>Tu foto se muestra solo como referencia durante esta sesión. La prueba de ropa usa el maniquí.</Copy>}
    <View style={[ui.rule, { marginTop: 8 }]}>
      <Label style={{ color: palette.muted }}>Mi cuenta</Label>
      <Copy>{(session?.name ?? '') + ' · ' + (session?.email ?? '')}</Copy>
      <Action outline icon="log-out-outline" onPress={() => logout()}>Cerrar sesión</Action>
    </View>
  </Screen>;
}

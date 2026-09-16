import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Action, Badge, Chip, Heading, Label, Note, palette, Screen, ui } from '@/components/fit-ui';
import { Mannequin } from '@/components/mannequin';
import { useFitting } from '@/context/fitting-context';
import { useWardrobe } from '@/context/wardrobe-context';
import { useWeather } from '@/context/weather-context';
import { colorHex, composeFit, DEMO_ITEMS, OCCASIONS } from '@/data/demo';
export default function TryOnScreen() {
  const router = useRouter();
  const { profile, variant, occasion } = useFitting();
  const { items } = useWardrobe();
  const { weather } = useWeather();
  const pieces = composeFit(items.length ? items : DEMO_ITEMS, variant, weather?.tempC);
  const [angle, setAngle] = useState(0);
  return <Screen dark>
    <Heading eyebrow="Prueba virtual · vista orientativa" title={OCCASIONS[occasion]} dark back />
    <View style={{ borderWidth: 1, borderColor: '#586A78', height: 410, marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12 }}>
        <Badge dark>Maniquí esquemático</Badge><Badge dark>{profile.height + ' cm · ' + profile.weight + ' kg'}</Badge>
      </View>
      <Mannequin profile={profile} dressed angle={angle} onAngleChange={setAngle} dark shirtColor={colorHex(pieces.find(item => item.category === 'tops')?.color ?? 'Azul')} pantsColor={colorHex(pieces.find(item => item.category === 'pantalones')?.color ?? 'Arena')} />
      <Label light style={{ textAlign: 'right', padding: 10, fontSize: 10 }}>Arrastra para girar</Label>
    </View>
    <View style={ui.row}>{[{ label: 'Frente', angle: 0 }, { label: 'Perfil', angle: 90 }, { label: 'Espalda', angle: 180 }].map(view => <Chip key={view.label} dark selected={angle === view.angle} onPress={() => setAngle(view.angle)}>{view.label}</Chip>)}</View>
    <Note dark>Vista ilustrativa de colores y proporciones. No simula el ajuste de una prenda real ni recomienda tallas.</Note>
    <View style={ui.section}>
      <Action onPress={() => router.push('/tienda')}>Buscar mocasín</Action>
      <Action outline dark onPress={() => router.push('/perfil')}>Ajustar mis medidas</Action>
    </View>
  </Screen>;
}

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Action, Badge, Chip, Copy, Heading, Label, Note, palette, Screen, Title, ui } from '@/components/fit-ui';
import { GarmentArt } from '@/components/garment-art';
import { useWardrobe } from '@/context/wardrobe-context';
import { useFitting } from '@/context/fitting-context';
import { useWeather } from '@/context/weather-context';
import { composeFit, DEMO_ITEMS, OCCASIONS } from '@/data/demo';

export default function FitsScreen() {
  const router = useRouter();
  const { items } = useWardrobe();
  const { variant, occasion, setOccasion, regenerate, saveFit, fits, ready, error: storageError } = useFitting();
  const { weather, loading: weatherLoading, error: weatherError, usingRealLocation } = useWeather();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [regenerated, setRegenerated] = useState(false);

  const wardrobe = items.length ? items : DEMO_ITEMS;
  const pieces = composeFit(wardrobe, variant, weather?.tempC);

  const shoeChoices = useMemo(() => wardrobe.filter((item) => item.category === 'calzado'), [wardrobe]);
  const shoePiece = shoeChoices.length ? shoeChoices[variant % shoeChoices.length] : null;
  const allPieces = shoePiece ? [...pieces, shoePiece] : pieces;

  const title = OCCASIONS[occasion];
  const fitId = title + ':' + allPieces.map((item) => item.id).join(',');
  const saved = fits.some((fit) => fit.id === fitId);

  const weatherLabel = weather
    ? weather.tempC + '° ' + weather.description + (usingRealLocation ? '' : ' · ejemplo')
    : weatherLoading
      ? 'Obteniendo tu clima…'
      : '18° nublado · ejemplo';

  return <Screen>
    <View style={{ backgroundColor: palette.navy, margin: -22, marginBottom: 20, padding: 22 }}>
      <Heading eyebrow="Fit generado" title={title} dark />
      <View style={ui.row}>
        <Badge dark>{weatherLabel}</Badge>
        <Badge dark>{allPieces.length + ' piezas de ' + (items.length ? 'tu armario' : 'ejemplo')}</Badge>
      </View>
    </View>
    <View style={[ui.row, { marginBottom: 16 }]}>{OCCASIONS.map((name, index) => <Chip key={name} selected={occasion === index} onPress={() => { setOccasion(index); setError(''); }}>{name}</Chip>)}</View>
    <View style={{ borderWidth: 1, borderColor: palette.line, padding: 12, backgroundColor: '#E6ECF0', marginBottom: 16 }}>
      <Label>Tu combinación {variant + 1}</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', minHeight: 220, gap: 8 }}>
        {allPieces.map(item => <View key={item.id} style={{ width: allPieces.length > 1 ? '47%' : '100%', flexGrow: 1, height: 178 }}>
          <View style={{ flex: 1 }}><GarmentArt item={item} compact /></View><Copy style={{ textAlign: 'center', fontSize: 11, color: palette.ink }}>{item.type}</Copy>
        </View>)}
        {!shoePiece && <View style={{ width: '47%', flexGrow: 1, height: 178, opacity: 0.7 }}>
          <View style={{ flex: 1 }}><GarmentArt item={{ category: 'calzado', color: 'Marrón', photoUri: '' }} compact /></View>
          <Copy style={{ textAlign: 'center', fontSize: 11 }}>Pieza sugerida</Copy>
        </View>}
      </View>
    </View>
    {!shoePiece && <View style={[ui.rule, { marginBottom: 14 }]}>
      <Label>Pieza sugerida para completar</Label><Title style={{ fontSize: 25, lineHeight: 29 }}>Mocasín de piel marrón</Title>
      <Copy>No tienes calzado en tu armario todavía. Esta es una opción de tono cálido para acompañar el resto del fit.</Copy>
    </View>}
    <View style={ui.section}>
      {!shoePiece && <Action onPress={() => router.push('/tienda')}>Buscar en tiendas</Action>}
      <Action outline icon="person-outline" onPress={() => router.push('/try-on')}>Probar en mi maniquí</Action>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Action outline icon="refresh-outline" style={{ flex: 1 }} onPress={() => { regenerate(); setRegenerated(true); setError(''); }}>Regenerar</Action>
        <Action outline icon={saved ? 'checkmark' : 'bookmark-outline'} style={{ flex: 1 }} disabled={saved || saving || !ready || !allPieces.length} onPress={async () => {
          setSaving(true); setError('');
          try { await saveFit(title, allPieces); } catch { setError('No se pudo guardar el fit. Inténtalo de nuevo.'); } finally { setSaving(false); }
        }}>{saved ? 'Fit guardado' : saving ? 'Guardando…' : 'Guardar fit'}</Action>
      </View>
      {error || storageError || weatherError ? <Copy style={ui.error}>{error || storageError || weatherError}</Copy> : null}
      {regenerated && !wardrobe.some(item => wardrobe.filter(other => other.category === item.category).length > 1) && <Copy>Añade más prendas de la misma categoría para obtener otras combinaciones.</Copy>}
      <Action outline onPress={() => setShowSaved(!showSaved)}>{(showSaved ? 'Ocultar' : 'Ver') + ' fits guardados (' + fits.length + ')'}</Action>
      {showSaved && <View style={{ gap: 12 }}>{!fits.length ? <Copy>Tus combinaciones guardadas aparecerán aquí.</Copy> : fits.map(fit => <View key={fit.id} style={ui.rule}><Title style={{ fontSize: 23 }}>{fit.title}</Title><Copy>{fit.items.map(item => item.type).join(' · ')}</Copy><Label>{fit.items.some(item => item.demo) ? 'Con prendas de ejemplo' : 'Con tus prendas'}</Label></View>)}</View>}
    </View>
    <Note>
      {usingRealLocation
        ? 'El clima es real, según tu ubicación: si hace menos de 18°C se suma un abrigo. La combinación rota entre tus prendas; la recomendación con un modelo de IA todavía no está conectada.'
        : 'El clima es de ejemplo (sin acceso a tu ubicación). La combinación rota entre tus prendas; la recomendación con un modelo de IA todavía no está conectada.'}
    </Note>
  </Screen>;
}

import { useState } from 'react';
import { Linking, View } from 'react-native';
import { Action, Badge, Chip, Copy, Heading, Note, palette, Screen, Title, ui } from '@/components/fit-ui';
import { GarmentArt } from '@/components/garment-art';

const PRODUCTS = [
  { store: 'Amazon', match: 96, name: 'Mocasín piel Bristol', price: '$1,290 MXN', delivery: 'Prime · 2 días', color: 'Marrón', url: 'https://www.amazon.com.mx/s?k=mocasin+piel+marron' },
  { store: 'Temu', match: 88, name: 'Loafer suede clásico', price: '$349 MXN', delivery: 'Envío 9 días', color: 'Arena', url: 'https://www.temu.com/search_result.html?search_key=mocasin%20marron' },
  { store: 'SHEIN', match: 84, name: 'Mocasín tostado chunky', price: '$429 MXN', delivery: 'Envío 7 días', color: 'Caramelo', url: 'https://www.shein.com/pdsearch/brown%20loafers/' },
];
export default function TiendaScreen() {
  const [filter, setFilter] = useState('Todas');
  const [error, setError] = useState('');
  const products = PRODUCTS.filter(product => filter === 'Todas' || product.store === filter);
  return <Screen>
    <Heading eyebrow="Completar el fit" title="Mocasín de piel marrón" subtitle={products.length + ' opciones de ejemplo · talla 42 · envío a MX'} back />
    <View style={[ui.row, { marginBottom: 20 }]}>{['Todas', 'Amazon', 'Temu', 'SHEIN'].map(store => <Chip key={store} selected={store === filter} onPress={() => setFilter(store)}>{store}</Chip>)}</View>
    <View style={{ gap: 16, flex: 1 }}>
      {products.map(product => <View key={product.store} style={{ borderWidth: 1, borderColor: palette.line, flexDirection: 'row', minHeight: 167 }}>
        <View style={{ width: '31%', backgroundColor: '#E5EDF2', borderRightWidth: 1, borderColor: palette.line }}><GarmentArt compact item={{ category: 'calzado', color: product.color, photoUri: '' }} /></View>
        <View style={{ flex: 1, padding: 12, gap: 5 }}>
          <View style={ui.row}><Badge>{product.store}</Badge><Badge>{'MATCH ' + product.match + '%'}</Badge><Copy style={{ fontSize: 10 }}>EJEMPLO</Copy></View>
          <Title style={{ fontSize: 20, lineHeight: 24 }}>{product.name}</Title>
          <View style={ui.row}><Title style={{ fontSize: 21, lineHeight: 24 }}>{product.price}</Title></View>
          <Copy style={{ fontSize: 11 }}>{product.delivery} · ilustrativo</Copy>
          <Action outline style={{ minHeight: 38, paddingVertical: 7 }} onPress={async () => { setError(''); try { await Linking.openURL(product.url); } catch { setError('No se pudo abrir la tienda. Inténtalo de nuevo.'); } }}>{'Buscar en ' + product.store}</Action>
        </View>
      </View>)}
    </View>
    {error ? <Copy style={ui.error}>{error}</Copy> : null}
    <Note>Catálogo de demostración: precios y envíos son ilustrativos. Los botones abren una búsqueda; confirma disponibilidad y precio en cada tienda.</Note>
  </Screen>;
}

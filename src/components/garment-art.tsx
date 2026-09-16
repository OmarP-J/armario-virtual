import { Image } from 'expo-image';
import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import type { ClothingItem } from '@/context/wardrobe-context';
import { colorHex } from '@/data/demo';

export function GarmentArt({ item, compact = false }: { item: Pick<ClothingItem, 'category' | 'color' | 'photoUri'>; compact?: boolean }) {
  // Un id de gradiente fijo ("fabric") colisiona en el DOM cuando hay varias prendas
  // en pantalla a la vez (la cuadrícula del armario, por ejemplo): el navegador
  // resuelve fill="url(#fabric)" contra el PRIMER elemento con ese id en todo el
  // documento, así que todas las prendas terminan pintadas con el color de la
  // primera. useId() da un sufijo único por instancia para que cada ilustración
  // use su propio gradiente.
  const fabricId = 'fabric-' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (item.photoUri) return <Image source={{ uri: item.photoUri }} style={StyleSheet.absoluteFill} contentFit="contain" accessibilityLabel={`${item.category} ${item.color}`} />;
  const fill = colorHex(item.color);
  const fabricFill = `url(#${fabricId})`;
  return <View style={{ flex: 1, width: '100%', padding: compact ? 6 : 14 }}>
    <Svg width="100%" height="100%" viewBox="0 0 180 180" accessibilityLabel={`Ilustración de ${item.category} ${item.color}`}>
      <Defs><LinearGradient id={fabricId} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={fill} /><Stop offset="1" stopColor={fill} stopOpacity="0.72" /></LinearGradient></Defs>
      {item.category === 'pantalones' ? <>
        <Path d="M56 20 L126 20 L137 158 L97 161 L88 76 L79 161 L40 157 Z" fill={fabricFill} stroke="#283844" strokeOpacity=".22" />
        <Path d="M56 31 L126 31 M88 32 L88 76 M62 35 Q64 51 51 56 M118 35 Q118 49 129 55 M50 148 L78 151 M98 151 L135 149" fill="none" stroke="#283844" strokeOpacity=".25" />
      </> : item.category === 'calzado' ? <>
        <Path d="M31 62 Q40 58 50 48 L74 55 Q73 81 100 88 L141 99 Q162 103 158 119 Q115 133 30 118 Z" fill={fabricFill} stroke="#384955" strokeOpacity=".25" />
        <Path d="M31 112 Q104 128 158 112 L158 122 Q109 139 29 124 Z" fill="#DCDDD8" />
        <Path d="M73 78 L97 83 M78 84 L105 90 M86 91 L114 96" stroke="#6D7476" strokeWidth="2" />
      </> : <>
        <Path d={item.category === 'abrigos' ? 'M62 20 L79 15 L101 15 L118 20 L148 39 L163 116 L143 121 L120 68 L127 163 L53 163 L59 68 L36 121 L17 115 L32 39 Z' : 'M61 28 L79 21 L102 21 L120 28 L154 49 L137 83 L119 70 L124 155 L56 155 L61 70 L43 83 L26 49 Z'} fill={fabricFill} stroke="#384955" strokeOpacity=".22" />
        <Path d="M79 21 L90 39 L72 48 L63 28 M102 21 L90 39 L109 48 L120 28 M90 39 L90 155" fill="none" stroke="#384955" strokeOpacity=".3" />
        <Path d="M101 60 L115 60 L115 77 L101 77 Z" fill="none" stroke="#384955" strokeOpacity=".25" />
        {[59, 80, 101, 122, 142].map(y => <Line key={y} x1="94" x2="96" y1={y} y2={y} stroke="#FFFFFF" strokeWidth="2" />)}
      </>}
    </Svg>
  </View>;
}

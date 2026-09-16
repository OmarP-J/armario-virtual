import type { ClothingItem } from '@/context/wardrobe-context';

export const DEMO_ITEMS: ClothingItem[] = [
  { id: 'demo-oxford', type: 'Camisa oxford', color: 'Azul', material: 'Algodón', category: 'tops', season: 'primavera', photoUri: '', createdAt: 0, demo: true },
  { id: 'demo-lino', type: 'Camisa lino', color: 'Beige', material: 'Lino', category: 'tops', season: 'verano', photoUri: '', createdAt: 0, demo: true },
  { id: 'demo-chino', type: 'Chino slim', color: 'Arena', category: 'pantalones', season: 'verano', photoUri: '', createdAt: 0, demo: true },
  { id: 'demo-jean', type: 'Jean recto', color: 'Índigo', category: 'pantalones', season: 'otoño', photoUri: '', createdAt: 0, demo: true },
  { id: 'demo-tenis', type: 'Tenis blancos', color: 'Blanco', category: 'calzado', season: 'primavera', photoUri: '', createdAt: 0, demo: true },
  { id: 'demo-abrigo', type: 'Abrigo ligero', color: 'Caramelo', category: 'abrigos', season: 'invierno', photoUri: '', createdAt: 0, demo: true },
];

export const SKIN_TONES = ['#F2D9C0', '#E7BD98', '#C99B70', '#A67547', '#775332', '#442C20'];
export const OCCASIONS = ['Viernes casual', 'Día de oficina', 'Fin de semana'];

export function colorHex(color: string) {
  const value = color.toLowerCase();
  const colors: Record<string, string> = { azul: '#88A7BB', beige: '#D9CDB6', arena: '#C4AD87', índigo: '#465D74', blanco: '#EEEDE7', negro: '#30353A', caramelo: '#9F7752', marrón: '#795237', rojo: '#A4534C', verde: '#6F8070', gris: '#A5AAAC' };
  return Object.entries(colors).find(([name]) => value.includes(name))?.[1] ?? '#A9B7BD';
}

// tempC opcional: si se conoce el clima real, solo suma un abrigo cuando hace
// frío de verdad (< 18°C); sin dato de clima, mantiene el comportamiento anterior.
export function composeFit(items: ClothingItem[], variant: number, tempC?: number) {
  const pick = (category: ClothingItem['category']) => {
    const choices = items.filter(item => item.category === category);
    return choices.length ? choices[variant % choices.length] : undefined;
  };
  const wantsCoat = tempC === undefined ? true : tempC < 18;
  const pieces = [pick('tops'), pick('pantalones')];
  if (wantsCoat) pieces.push(pick('abrigos'));
  return pieces.filter((item): item is ClothingItem => !!item);
}

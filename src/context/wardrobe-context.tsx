import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

export type Season = 'primavera' | 'verano' | 'otoño' | 'invierno';

export type Category = 'tops' | 'pantalones' | 'calzado' | 'abrigos' | 'otro';

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'tops', label: 'Tops' },
  { value: 'pantalones', label: 'Pantalones' },
  { value: 'calzado', label: 'Calzado' },
  { value: 'abrigos', label: 'Abrigos' },
  { value: 'otro', label: 'Otro' },
];

export type ClothingItem = {
  id: string;
  photoUri: string;
  type: string;
  color: string;
  season: Season;
  category: Category;
  createdAt: number;
  material?: string;
  demo?: boolean;
};

type NewClothingItem = Omit<ClothingItem, 'id' | 'createdAt'>;

type WardrobeContextValue = {
  items: ClothingItem[];
  loading: boolean;
  storageError: string | null;
  addItem: (item: NewClothingItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
};

const STORAGE_KEY = '@armario-virtual/items';

// La primera vez que se abre la app en un dispositivo no hay nada guardado
// todavía (distinto de "el usuario borró todo su armario", que sí deja un
// array vacío guardado). Le damos un par de prendas genéricas de arranque
// para que el armario no se vea vacío desde el primer momento; el usuario
// puede editarlas o borrarlas como a cualquier prenda propia.
const STARTER_ITEMS: Omit<ClothingItem, 'id' | 'createdAt'>[] = [
  { type: 'Camiseta básica', color: 'Blanco', category: 'tops', season: 'verano', photoUri: '' },
  { type: 'Jeans clásicos', color: 'Azul', category: 'pantalones', season: 'otoño', photoUri: '' },
  { type: 'Tenis casuales', color: 'Negro', category: 'calzado', season: 'primavera', photoUri: '' },
];

const WardrobeContext = createContext<WardrobeContextValue | undefined>(undefined);

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const itemsRef = useRef<ClothingItem[]>([]);
  const writeQueue = useRef(Promise.resolve());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(async (raw) => {
        if (raw) {
          const stored = JSON.parse(raw);
          if (!Array.isArray(stored) || !stored.every(item => item && typeof item.id === 'string' && typeof item.type === 'string' && typeof item.color === 'string' && typeof item.photoUri === 'string')) throw new Error('Invalid wardrobe');
          itemsRef.current = stored;
          setItems(stored);
        } else {
          const starter: ClothingItem[] = STARTER_ITEMS.map((item, index) => ({
            ...item,
            id: `starter-${index}-${Date.now()}`,
            createdAt: Date.now() - index,
          }));
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(starter));
          itemsRef.current = starter;
          setItems(starter);
        }
      })
      .catch(() => setStorageError('No se pudo leer tu armario. Recarga la aplicación para intentarlo de nuevo.'))
      .finally(() => setLoading(false));
  }, []);

  const updateItems = (update: (current: ClothingItem[]) => ClothingItem[]) => {
    if (loading || storageError) return Promise.reject(new Error('Tu armario todavía no está disponible.'));
    const task = writeQueue.current.catch(() => {}).then(async () => {
      const next = update(itemsRef.current);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      itemsRef.current = next;
      setItems(next);
    });
    writeQueue.current = task;
    return task;
  };

  const addItem = async (item: NewClothingItem) => {
    const newItem: ClothingItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
    };
    await updateItems(prev => [newItem, ...prev]);
  };

  const removeItem = async (id: string) => {
    await updateItems(prev => prev.filter((item) => item.id !== id));
  };

  return (
    <WardrobeContext.Provider value={{ items, loading, storageError, addItem, removeItem }}>
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const ctx = useContext(WardrobeContext);
  if (!ctx) {
    throw new Error('useWardrobe debe usarse dentro de <WardrobeProvider>');
  }
  return ctx;
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type Season = 'primavera' | 'verano' | 'otoño' | 'invierno';

export type ClothingItem = {
  id: string;
  photoUri: string;
  type: string;
  color: string;
  season: Season;
  createdAt: number;
};

type NewClothingItem = Omit<ClothingItem, 'id' | 'createdAt'>;

type WardrobeContextValue = {
  items: ClothingItem[];
  loading: boolean;
  addItem: (item: NewClothingItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
};

const STORAGE_KEY = '@armario-virtual/items';

const WardrobeContext = createContext<WardrobeContextValue | undefined>(undefined);

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Carga las prendas guardadas al abrir la app.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setItems(JSON.parse(raw));
      })
      .finally(() => setLoading(false));
  }, []);

  // Guarda cada vez que la lista cambia (una vez que ya cargó lo anterior).
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {
        // Si falla el guardado no rompemos la app; se reintenta en el próximo cambio.
      });
    }
  }, [items, loading]);

  const addItem = async (item: NewClothingItem) => {
    const newItem: ClothingItem = {
      ...item,
      id: `${Date.now()}`,
      createdAt: Date.now(),
    };
    setItems((prev) => [newItem, ...prev]);
  };

  const removeItem = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <WardrobeContext.Provider value={{ items, loading, addItem, removeItem }}>
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

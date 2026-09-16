import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import type { ClothingItem } from './wardrobe-context';

export type BodyProfile = { sex: string; skin: number; build: string; age: number; height: number; weight: number };
export const DEFAULT_PROFILE: BodyProfile = { sex: 'Mujer', skin: 2, build: 'Media', age: 28, height: 168, weight: 64 };
export type SavedFit = { id: string; title: string; items: ClothingItem[]; createdAt: number };
type Stored = { profile: BodyProfile; fits: SavedFit[] };
type ContextValue = Stored & {
  ready: boolean; error: string | null; variant: number; occasion: number;
  setOccasion: (value: number) => void; regenerate: () => void;
  updateProfile: (patch: Partial<BodyProfile>) => void;
  saveFit: (title: string, items: ClothingItem[]) => Promise<void>;
};
const Context = createContext<ContextValue | null>(null);
const KEY = '@armario-virtual/fitting-v1';
export function FittingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Stored>({ profile: DEFAULT_PROFILE, fits: [] });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variant, setVariant] = useState(0);
  const [occasion, setOccasion] = useState(0);
  const current = useRef(data);
  const queue = useRef(Promise.resolve());
  const canWrite = useRef(false);
  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        const parsed = JSON.parse(raw);
        const p = parsed?.profile;
        if (!p || !Array.isArray(parsed.fits) || !['Mujer', 'Hombre', 'No binarie'].includes(p.sex) || !['Delgada', 'Media', 'Atlética', 'Robusta'].includes(p.build) || !Number.isInteger(p.skin) || p.skin < 0 || p.skin > 5 || !Number.isFinite(p.height) || p.height < 130 || p.height > 210 || !Number.isFinite(p.weight) || p.weight < 35 || p.weight > 160 || !Number.isFinite(p.age) || p.age < 18 || p.age > 85 || !parsed.fits.every((fit: SavedFit) => typeof fit.id === 'string' && typeof fit.title === 'string' && Array.isArray(fit.items))) throw new Error('Invalid profile');
        current.current = parsed;
        setData(parsed);
      }
      canWrite.current = true;
    }).catch(() => setError('No pudimos leer tus medidas y fits guardados. Recarga para volver a intentarlo.')).finally(() => setReady(true));
  }, []);
  const persist = (next: Stored) => {
    const task = queue.current.catch(() => {}).then(() => AsyncStorage.setItem(KEY, JSON.stringify(next)));
    queue.current = task;
    return task;
  };
  const updateProfile = (patch: Partial<BodyProfile>) => {
    if (!canWrite.current) return;
    const next = { ...current.current, profile: { ...current.current.profile, ...patch } };
    current.current = next;
    setData(next);
    persist(next).then(() => setError(null)).catch(() => setError('No se guardaron los últimos cambios. Vuelve a ajustar una medida para reintentar.'));
  };
  const saveFit = async (title: string, items: ClothingItem[]) => {
    if (!canWrite.current) throw new Error('El almacenamiento no está disponible.');
    const id = title + ':' + items.map(item => item.id).join(',');
    if (current.current.fits.some(fit => fit.id === id)) return;
    const previous = current.current;
    const next = { ...previous, fits: [{ id, title, items, createdAt: Date.now() }, ...previous.fits] };
    current.current = next;
    try {
      await persist(next);
      setData(current.current);
    } catch (error) {
      current.current = { ...current.current, fits: previous.fits };
      setData(current.current);
      throw error;
    }
  };
  return <Context.Provider value={{ ...data, ready, error, variant, occasion, setOccasion, regenerate: () => setVariant(value => value + 1), updateProfile, saveFit }}>{children}</Context.Provider>;
}
export function useFitting() {
  const context = useContext(Context);
  if (!context) throw new Error('FittingProvider is required');
  return context;
}

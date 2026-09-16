import * as Location from 'expo-location';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { fetchWeather, WeatherInfo } from '@/services/weather';

type WeatherContextValue = {
  weather: WeatherInfo | null;
  loading: boolean;
  error: string | null;
  usingRealLocation: boolean;
  refresh: () => void;
};

const WeatherContext = createContext<WeatherContextValue | null>(null);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingRealLocation, setUsingRealLocation] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          throw new Error('sin-permiso');
        }
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
        const info = await fetchWeather(position.coords.latitude, position.coords.longitude);
        if (cancelled) return;
        setWeather(info);
        setUsingRealLocation(true);
      } catch (err) {
        if (cancelled) return;
        setWeather(null);
        setUsingRealLocation(false);
        setError(
          err instanceof Error && err.message === 'sin-permiso'
            ? 'Sin acceso a tu ubicación: mostrando un clima de ejemplo.'
            : 'No se pudo obtener el clima real ahora: mostrando un clima de ejemplo.'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return (
    <WeatherContext.Provider
      value={{ weather, loading, error, usingRealLocation, refresh: () => setTick((t) => t + 1) }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather debe usarse dentro de WeatherProvider');
  return ctx;
}

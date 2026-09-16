export type WeatherInfo = {
  tempC: number;
  description: string;
  code: number;
  isDay: boolean;
};

// Códigos WMO usados por Open-Meteo (https://open-meteo.com/en/docs), resumidos al español.
const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: 'despejado',
  1: 'mayormente despejado',
  2: 'parcialmente nublado',
  3: 'nublado',
  45: 'neblina',
  48: 'neblina escarchada',
  51: 'llovizna ligera',
  53: 'llovizna',
  55: 'llovizna densa',
  56: 'llovizna helada',
  57: 'llovizna helada densa',
  61: 'lluvia ligera',
  63: 'lluvia',
  65: 'lluvia fuerte',
  66: 'lluvia helada',
  67: 'lluvia helada fuerte',
  71: 'nieve ligera',
  73: 'nieve',
  75: 'nieve fuerte',
  77: 'granizo fino',
  80: 'chubascos ligeros',
  81: 'chubascos',
  82: 'chubascos fuertes',
  85: 'chubascos de nieve',
  86: 'chubascos de nieve fuertes',
  95: 'tormenta',
  96: 'tormenta con granizo',
  99: 'tormenta con granizo fuerte',
};

export function describeWeatherCode(code: number): string {
  return WEATHER_DESCRIPTIONS[code] ?? 'clima variable';
}

// Clima real vía Open-Meteo: es gratis y no requiere API key, ideal para esta demo.
export async function fetchWeather(lat: number, lon: number): Promise<WeatherInfo> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,is_day&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('No se pudo obtener el clima (' + response.status + ')');
  }
  const json = await response.json();
  const current = json?.current;
  if (!current || typeof current.temperature_2m !== 'number') {
    throw new Error('Respuesta de clima inválida');
  }
  return {
    tempC: Math.round(current.temperature_2m),
    description: describeWeatherCode(current.weather_code),
    code: current.weather_code,
    isDay: current.is_day === 1,
  };
}

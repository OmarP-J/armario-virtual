# Armario virtual 👕

App de armario virtual: catalogá tu ropa con fotos y (más adelante) recibí recomendaciones de outfit según el clima. Este es el punto de partida — fase 1 del plan: subir fotos y catalogar prendas.

## Cómo correrlo

1. Instalá las dependencias:

   ```bash
   npm install
   ```

2. Iniciá el servidor de desarrollo:

   ```bash
   npx expo start
   ```

3. Instalá la app **Expo Go** en tu celular (App Store o Play Store) y escaneá el código QR que aparece en la terminal. La app se abre directo en tu teléfono, sin necesidad de Xcode ni Android Studio.

   - También podés presionar `w` en la terminal para probarlo en el navegador (algunas funciones nativas, como elegir foto, se comportan distinto en web).

## Qué hay hecho hasta ahora

- **Pestaña "Armario"** (`src/app/index.tsx`): muestra tus prendas guardadas en una cuadrícula. Si no hay ninguna, te invita a agregar la primera.
- **Pestaña "Agregar"** (`src/app/add.tsx`): elegí una foto de la galería, escribí tipo y color, y elegí la temporada.
- **`src/context/wardrobe-context.tsx`**: guarda las prendas en el propio dispositivo (`AsyncStorage`), así que ya funciona sin backend. Cuando quieras pasar a Firebase/Supabase para sincronizar entre dispositivos, este es el archivo que se reemplaza.

## Próximos pasos (según el roadmap)

1. Conectar una API de clima y armar la lógica de recomendación de outfit.
2. Agregar el estado limpio/sucio a cada prenda y recordatorios de lavado.
3. Sumar reconocimiento automático de fotos con un modelo de visión (para no tener que escribir tipo/color a mano).
4. Búsqueda y enlaces de compra (fase con Amazon).

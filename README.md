# Armario virtual 👕

App de armario virtual con IA — catalogá tu ropa, arma outfits según el clima, y encontrá lo que te falta. Tema navy oscuro ("Fit Engine"), siguiendo el diseño en `Armario Virtual.dc.html`.

## Cómo correrlo

1. `npm install` (hay dos librerías nuevas: `@expo/vector-icons` y `expo-linear-gradient`).
2. `npx expo start`.
3. Escaneá el QR con la app **Expo Go** en tu celular.

## Navegación (calca el diseño)

- **Armario** (`(tabs)/index.tsx`) — tus prendas en cuadrícula, con filtros por categoría (Tops, Pantalones, Calzado, Abrigos). El botón `+` del header abre el modal de agregar prenda.
- **Fits IA** (`(tabs)/fits.tsx`) — placeholder. Acá va el motor que cruza clima + armario + ocasión para armar un outfit (pantalla 02 del diseño).
- **Tienda** (`(tabs)/tienda.tsx`) — placeholder. Acá va la búsqueda de la pieza que falta en Amazon/Temu/Shein con redirección (pantalla 03).
- **Perfil** (`(tabs)/perfil.tsx`) — placeholder. Acá van las medidas y el maniquí 3D (pantallas 05 y 06 — proyecto aparte, requiere motor 3D).
- **Agregar prenda** (`add.tsx`) — modal, ya no es una pestaña. Guarda en el dispositivo con `AsyncStorage` (sin backend todavía).

## Qué falta por fase

1. **Fits IA**: lógica de recomendación con un modelo de IA (clima + armario + ocasión → outfit + qué falta).
2. **Captura con IA**: reemplazar el formulario manual de "Agregar" por cámara + modelo de visión que clasifique la prenda sola.
3. **Tienda**: botón que busca la pieza faltante y redirige a Amazon/Temu/Shein (sin compra automatizada — ninguna de las tres da esa API).
4. **Maniquí 3D / prueba virtual**: fase aparte, necesita un motor 3D real (Three.js) — no es un ajuste de pantalla.

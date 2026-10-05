# Cambios

## 1.4.0 — 2026-10-05
- Fotos propias de la finca: la bienvenida usa las vacas en el potrero y el banner del Inicio cambia entre el maíz (cultivos) y las vacas (pastos). Quedan guardadas para verse sin internet.
- Pantalla de bienvenida (solo la primera vez) como el mockup: paisaje, lema, botones Cultivos, Ganadería, Clima y Finanzas, y botón Comenzar.
- Inicio con banner ("¡Hola!") y fotos de cada cultivo en la lista de lo que más rinde. Las miniaturas vienen de Wikimedia Commons; sin internet o sin foto queda un ícono de planta.
- Pruebas nuevas: botones de Inicio, bienvenida y títulos de foto de cada cultivo.

## 1.3.0 — 2026-10-04
- Diseño nuevo: barra verde arriba, tarjetas, barra inferior de 5 botones (Inicio, Calcular, Clima, Cultivos, Guía) y letra Source Sans 3.
- Pantalla de Inicio: su finca (clima del lugar), el pronóstico de hoy, atajos y los 5 cultivos o pastos que más rinden en su zona. Al tocar uno se abre el cálculo completo.
- Los cálculos no cambian. Nueva función `topCultivos` en `js/calculos.js`, con pruebas.
- Pruebas nuevas: la lista del service worker coincide con lo que carga `index.html`, las rutas son relativas y cada pestaña tiene su sección.
- Colores de la app instalada (`theme_color` y fondo) al nuevo verde.
- Corrección: al actualizar, la app ya no mezcla archivos viejos con nuevos (service worker con red primero para los archivos propios, y recarga una vez al instalar la versión nueva).

## 1.2.0 — 2026-10-04
- Campo animado en el encabezado (sol, nubes, plantas que crecen y gotas).
- Resultado de rentabilidad: ícono animado en el veredicto, cifras que suben contando y barras de aptitud que se llenan.
- Clima y riego: ícono del tiempo animado (sol, nubes, lluvia, tormenta), gotas sobre las plantas cuando toca regar y barras de lluvia que crecen.
- Publicación pasa de Netlify a GitHub Pages (gratis, desde GitHub Actions).
- Corrección: la página ya no se desborda hacia la derecha en el celular.
- Entrada suave de tarjetas y pestañas; todo se apaga con "reducir movimiento" del sistema.

## 1.1.0 — 2026-10-04
- La app se llama ahora **Siembro Colombia** (nombre, ícono instalado, título y encabezado).
- Publicación en Netlify conectada a GitHub; pruebas en GitHub Actions.

## 1.0.0 — 2026-10-03
- Calculadora de rentabilidad para 22 cultivos y forrajes en 56 municipios.
- Agua disponible, comparación de 7 sistemas de riego y veredicto por agua.
- Tradicional, con riego o automatizado.
- Ganadería: pastos (ceba y leche), maíz forrajero, sorgo y millo.
- Pestaña Clima con Open-Meteo y recomendación de riego diaria.
- Fichas técnicas con fotos de Wikimedia, distancia de siembra, abonos y plagas.
- Suelos típicos por zona de Colombia.
- PWA instalable con modo sin conexión.
- Proyecto dividido en archivos, pruebas automáticas y publicación en GitHub Pages.

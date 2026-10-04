# 🌱 Siembro Colombia — ¿Siembro o no siembro?

Aplicación web progresiva (PWA) para agricultores y ganaderos de Colombia. Le dice a la persona si un cultivo es rentable en su municipio, cuánto debe invertir, cuánto ganaría, qué sistema de riego gasta menos agua y si el agua que tiene le alcanza. Incluye el pronóstico del clima, fichas técnicas con fotos y una guía para aprender a hacer las cuentas.

Funciona en el navegador del celular y del computador, se instala como app y sigue funcionando sin internet en el campo.

## Qué hace

- **Rentabilidad:** inversión, utilidad por año, ganancia en el horizonte del cultivo, año en que se recupera la plata y veredicto ("Sí, es rentable", "Rentabilidad baja", "No lo siembre, pierde dinero").
- **Aptitud:** compara altura, temperatura, lluvia, tipo de suelo y pH con lo que pide cada cultivo.
- **Agua y riego:** necesidad de agua (ETo × Kc), comparación de goteo, cinta, microaspersión, aspersión, surcos e inundación, y cuántas hectáreas alcanza a regar con su pozo, quebrada, reservorio o acueducto.
- **Tradicional, con riego o automatizado:** compara los tres manejos y recomienda el que más conviene.
- **Ganadería:** pastos de clima cálido y frío (ceba o leche), maíz forrajero, sorgo forrajero y millo, con carga animal y silo para el verano.
- **Clima:** temperatura actual, 7 días de pronóstico, probabilidad de lluvia y "¿Riego hoy?" con metros cúbicos, litros por planta y horas de bombeo.
- **Fichas de cultivo:** foto, producción por hectárea, distancia de siembra con dibujo, semillas por hectárea, pasos de cultivo, abonos en bultos y plagas con foto.
- **Suelos por zona:** el suelo y el pH típico se sugieren al elegir el municipio.

Cubre 56 municipios de la Costa Atlántica, Antioquia, el Eje Cafetero, Tolima, Huila, Bogotá y el altiplano, más la opción de ingresar el clima a mano.

## Estructura

```
siembro/
├── index.html              Página y estructura de las 4 pestañas
├── manifest.webmanifest    Nombre, colores e íconos para instalarla
├── sw.js                   Service worker: modo sin conexión (suba VERSION en cada cambio)
├── css/estilos.css         Estilos, modo oscuro y diseño para celular
├── icons/                  Íconos de la app
├── js/
│   ├── utilidades.js       Formato de pesos, números y acceso al DOM
│   ├── datos/
│   │   ├── municipios.js   Municipios: región, altura, temperatura, lluvia, meses secos, coordenadas
│   │   ├── cultivos.js     Cultivos, sistemas de riego y valores económicos de referencia
│   │   └── fichas.js       Fichas técnicas, zonas de suelo y fotos de riego
│   ├── calculos.js         Cálculos puros, sin DOM: aptitud, agua, finanzas y veredicto
│   ├── formulario.js       Pestañas, formulario y lectura de datos
│   ├── resultados.js       Pinta el resultado del cálculo
│   ├── fichas-ui.js        Fotos de Wikimedia, dibujo de distancia y pestaña Cultivos
│   ├── clima.js            Pronóstico Open-Meteo y riego del día
│   └── app.js              Arranque, instalación y datos guardados
├── tests/calculos.test.mjs Pruebas de los cálculos
├── .github/workflows/pruebas.yml  Pruebas automáticas en GitHub
└── netlify.toml            Configuración de Netlify (ya no se usa; ahora se publica en GitHub Pages)
```

No usa frameworks ni paso de compilación: son archivos estáticos. Los scripts se cargan en orden en `index.html` (datos y cálculos antes que la interfaz).

## Correr en el computador

Un service worker solo funciona en `http://localhost` o con HTTPS, no abriendo el archivo con doble clic.

```bash
npm start            # abre http://localhost:5173
# o, sin Node:
python3 -m http.server 5173
```

Pruebas (Node 20 o superior, no hay que instalar nada):

```bash
npm test
```

## Publicar

### GitHub Pages (automático desde GitHub)

El sitio es **https://dajesa0937.github.io/siembro-colombia/**. Cada `git push` a `main` corre `npm test` en GitHub Actions y, si las pruebas pasan, publica la nueva versión. Si una prueba falla, no se publica y el sitio sigue con la versión anterior. Para activarlo una sola vez: en GitHub, **Settings → Pages → Source: GitHub Actions**.

GitHub Actions también corre las pruebas (`.github/workflows/pruebas.yml`), para ver el resultado en cada commit.

### Antes de cada publicación

Suba la versión en `sw.js` (`siembrocolombia-v5` → `siembrocolombia-v6`). Si no, los celulares que ya la instalaron pueden seguir viendo la versión anterior.

## Cómo se calcula

- **Evapotranspiración de referencia (ETo):** se estima por temperatura (≈ 1,2 + 0,14 × T, más 0,5 mm en zonas secas). En la pestaña Clima se usa la ETo FAO del pronóstico.
- **Consumo del cultivo:** ETc = ETo × Kc (× pérdidas por filtración en arroz). 1 mm sobre 1 ha = 10 m³.
- **Lluvia aprovechable:** 75 % de la lluvia (80 % en el cálculo diario).
- **Lámina de riego:** lo que falta, más la demanda de los meses secos.
- **Agua bruta:** lámina ÷ eficiencia del sistema (goteo 90 %, cinta 88 %, microaspersión 85 %, aspersión 75 %, inundación intermitente 55 %, surcos 50 %, inundación 40 %). En árboles con goteo o micro se moja el 70 % del área.
- **Agua disponible:** caudal (L/s) × 3,6 × horas de bombeo = m³ por día; se compara con el día de mayor consumo. Un reservorio se compara con el riego del año.
- **Finanzas:** ingresos = producción × precio; costos = establecimiento o ciclo + mantenimiento + recolección + energía del riego por m³. Los perennes siguen una curva de producción por año; los de ciclo corto se evalúan a 5 años.
- **Ganadería:** materia seca × 60 % de aprovechamiento ÷ 3.650 kg por UGG al año = carga animal.
- **Veredicto:** "No lo siembre" si el clima no sirve, si el agua no alcanza para la mitad del área o si no se recupera la inversión; "Rentabilidad baja" si el margen es menor al 15 %.

## Agregar un cultivo

1. En `js/datos/cultivos.js` agregue una entrada en `C` (copie una parecida: `tipo` es `per` para perennes, `cic` para ciclo corto o `pasto`).
2. En `js/datos/fichas.js` agregue su ficha en `FICHA`, con la misma clave.
3. Corra `npm test`: la prueba revisa que todo cultivo tenga ficha y sistemas de riego válidos.

## Agregar un municipio

Agregue una fila en `MUN` (`js/datos/municipios.js`) con `[departamento, municipio, región, altura, temperatura, lluvia mm/año, meses secos, latitud, longitud]` y asígnele zona de suelo en `ZMUN` (`js/datos/fichas.js`).

## Fuentes y advertencias

- **Clima:** [Open-Meteo](https://open-meteo.com), gratis y sin clave.
- **Fotos:** Wikipedia y Wikimedia Commons, con licencias libres. Cada foto enlaza a su fuente y licencia.
- **Precios, rendimientos, costos y dosis de fertilizante:** valores de referencia aproximados para Colombia en 2026, a precio de finca. Cambian por temporada, zona y comprador. La app es un primer filtro: confirme con un agrónomo, la UMATA, Agrosavia o el gremio del cultivo antes de invertir, y ajuste la fertilización con análisis de suelo.

## Pendientes

- [ ] Precios mayoristas en vivo del SIPSA (DANE).
- [ ] Más municipios y cultivos (cebolla, tomate, caña panelera, aguacate en Santander).
- [ ] Guardar varias fincas por usuario.
- [ ] Exportar el resultado en PDF para solicitudes de crédito.

## Licencia

MIT © 2026 Dawin de Jesús Salazar Oviedo

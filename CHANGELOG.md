# Cambios

## 1.8.0 — 2026-10-05
- Cálculo de bomba rehecho. Antes usaba siempre 30 m de altura y 60 % de eficiencia. Ahora calcula la altura total (TDH) con: profundidad del agua o altura de succión, desnivel del lote, roce en la tubería (Hazen-Williams, con 15 % por accesorios), presión que pide cada sistema de riego (goteo, cinta, microaspersión, aspersión, surcos) y filtros.
- Escoge la tubería más delgada que no pase de 1,5 m/s y dice cuántos kW se ahorran con un tubo más grueso.
- Potencia: hidráulica (ρ·g·Q·H), en el eje según el estado de la bomba (70 / 60 / 45 %), con eficiencia del motor, 15 % de reserva y tamaño comercial en HP; kWh por m³ (2,725 × H ÷ η, FAO).
- Revisa la succión según la altitud (presión del aire y vapor del agua): avisa cuando una bomba de superficie no sube el agua a esa altura y recomienda sumergible.
- Costo por día, por mes seco y por m³ con electricidad (precio del kWh editable), motor diésel (galón de ACPM editable) o paneles solares (Wp aproximados).
- Nueva tarjeta "Bomba y energía" en Agua y riego (cultivos) con todas esas variables; la calculadora usa la misma cuenta.
- Funciones nuevas y reutilizables en `js/calculos.js` (con pruebas): `presionAtmM`, `presionVaporM`, `tuboParaCaudal`, `perdidaHW`, `alturaBombeo`, `potenciaBomba`, `kWhBombeo`, `revisarSuccion`, `litrosDiesel`, `panelesSolares`, `sistemaBombeo`.

## 1.7.1 — 2026-10-05
- Calculadora, pastos: ya no dice "No lo siembre, pierde dinero" cuando el pasto deja ganancia cada año. Antes lo decía si la inversión no se recuperaba en 8 años, aunque el pasto durara mucho más. Ahora los pastos se evalúan a 10 años.
- Veredictos más claros: "pierde dinero" solo si en plena producción gasta más de lo que vende; "Gana casi nada" si deja menos del 5 % anual de lo invertido (menos que un CDT); "Gana poco: la inversión demora en volver" si gana pero no recupera lo invertido.
- Se corrigió que los pastos de leche con recuperación de más de 6 años salieran como "Sí, es rentable": ahora salen como "Rentabilidad baja".
- Resultado de pastos: nueva línea "Si ya tiene el pasto sembrado" con la ganancia por año y por hectárea sin contar la siembra.
- Pruebas nuevas que revisan todos los municipios, en ceba y leche, con y sin riego, para que el veredicto no contradiga las cuentas.

## 1.7.0 — 2026-10-05
- Nuevo catálogo de semillas de pasto de clima cálido (SOESP / Durespo) en `js/datos/pastos.js`: 8 variedades (Brachiaria decumbens Basilisk, humidicola Comum y Llanero, brizantha Marandú y Xaraés, ruziziensis Ruzi, Panicum Tanzania y Mombasa) con altura, lluvia mínima, suelo ácido, encharcamiento, sequía, heno, ensilaje, proteína, forraje por hectárea, días a pastoreo y semilla por hectárea.
- Pantalla Semillas (cultivo "Pastos de clima cálido"): guía que ordena las variedades según su lugar, para qué es el pasto, tipo y fertilidad del suelo; calcula los kilos y el costo de semilla para su área según el valor cultural de la bolsa, y trae consejos de siembra del catálogo.
- Ganadería: tarjeta "Semilla de pasto que se adapta a su finca" con las 3 mejores y un botón a la guía completa.
- Funciones nuevas y reutilizables en `js/calculos.js` (con pruebas): `kgSemillaPasto`, `costoSemillaPasto`, `recomendarPastos`.

## 1.6.2 — 2026-10-05
- Se quitó el botón "Más", que escondía opciones. Ahora la barra de abajo tiene cinco botones siempre visibles: Inicio, Cultivos, Ganadería, Clima y Finanzas.
- Fichas, Historial y Guía se ven en la barra de arriba en computador y, en el celular, en la lista "Más herramientas" al final de Inicio (junto con "Ver la bienvenida").

## 1.6.1 — 2026-10-05
- Arriba de cada pantalla: el botón "Volver" ahora tiene texto y borde, y "Cambiar lugar" es un botón visible (antes era un enlace pequeño).
- Los botones de pestañas de cada pantalla (Hoy, 16 días, Mes…; Pasto/Ganado; Por cultivo/Por clima…) ahora son botones grandes con borde, separados y siempre visibles; en Clima quedan en dos filas de tres.

## 1.6.0 — 2026-10-05
- Pantalla Clima con seis pestañas: Hoy, 16 días, Mes, 3 meses, 6 meses y Año. Cada una trae recomendaciones separadas para el cultivo y para el ganado.
- Mes, 3 meses, 6 meses y Año usan el clima real de los últimos 10 años del lugar (Open-Meteo, se baja una sola vez y queda guardado). Muestran lluvia, temperatura, agua que falta para el cultivo elegido, pasto del ganado y los años más secos y más lluviosos. Sin conexión usan un cálculo aproximado y lo dicen.
- No hay predicción de meses futuros: nadie la puede dar con precisión. Los períodos largos son "lo normal" de ese lugar.
- Funciones nuevas y reutilizables en `js/calculos.js` (con pruebas): `resumenClimatico`, `periodoMeses`, `balanceMes`, `indiceForraje`, `recomendacionesPeriodo`, `recomendacionesPronostico`. El calendario de siembra, ¿Cuándo sembrar? (Por clima), Ganadería (pasto durante el año) e Inicio ya las usan.
- Inicio muestra la recomendación más importante del pronóstico de la semana.
- Pronóstico de 7 a 16 días (`urlClima`).

## 1.5.0 — 2026-10-05
- La app se reorganizó como el mockup. Barra inferior: Inicio, Cultivos, Ganadería, Finanzas y Más. Las pantallas de adentro tienen flecha para volver (y el botón atrás del celular también funciona).
- Inicio: banner "¡Hola!", tarjeta "Tu finca" con el clima (el lugar se cambia ahí mismo) y cuatro atajos: Siembra recomendada, Riego, Aplicación de abono y Ganadería.
- Cultivos: los 5 más rentables (por zona o por tipo de suelo) y entradas a ¿Cuándo sembrar?, Semillas recomendadas, Agua y riego, Abonos y fertilización y Fichas.
- Pantallas nuevas: ¿Cuándo sembrar? (calendario por mes, por cultivo, por clima y por región), Semillas recomendadas, Agua y riego (cultivos y ganadería), Abonos y fertilización, Pastoreo y ganadería (pasto, rotación de potreros y cuántos animales aguanta el lote), Mi finca – Resumen financiero (con gráfico de costos) e Historial de cálculos.
- Calculadora integral: Cultivo o Ganadería, área, rendimiento y precio a la vista; suelo, agua y manejo quedan en "opcional". El resultado muestra producción, ingreso bruto, costos y utilidad neta.
- Cálculos nuevos en `js/calculos.js` (con pruebas): `calendarioSiembra`, `lluviaMensual`, `rangoMeses`, `frecuenciaRiego`, `dosisAbono`, `desgloseCostos` (la suma da exactamente los costos del año) y `rotacion`. Los cálculos de rentabilidad no cambian.
- Archivo nuevo: `js/pantallas.js`. El calendario y la rotación son guías generales (la app lo dice) para confirmar con la UMATA.
- Pruebas nuevas de pantallas y de los cálculos anteriores.

## 1.4.0 — 2026-10-05
- Corrección: el flujo de GitHub ahora publica también la carpeta `img/` (sin ella no se veían las fotos). Una prueba nueva avisa si falta alguna carpeta.
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

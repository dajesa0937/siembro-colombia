// Siembro Colombia — service worker: la app funciona sin internet en el campo.
// IMPORTANTE: suba VERSION cada vez que publique cambios para que los celulares se actualicen.
const VERSION = 'siembrocolombia-v8';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './css/estilos.css', './css/animaciones.css',
  './js/utilidades.js', './js/datos/municipios.js', './js/datos/cultivos.js', './js/datos/fichas.js',
  './js/calculos.js', './js/formulario.js', './js/resultados.js', './js/fichas-ui.js', './js/clima.js', './js/inicio.js', './js/animaciones.js', './js/app.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Página: primero la red para recibir actualizaciones; sin señal, la copia guardada.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => {
      const copia = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copia)); return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }

  // El pronóstico no se guarda aquí: la app guarda el último en localStorage.
  if (url.host.endsWith('open-meteo.com')) return;

  // Archivos propios: primero la red, para que nunca se mezclen archivos nuevos con viejos; sin señal, la copia guardada.
  if (url.origin === location.origin) {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => {
      if (r.ok) { const copia = r.clone(); caches.open(VERSION).then(c => c.put(req, copia)); }
      return r;
    }).catch(() => caches.match(req)));
    return;
  }

  // Fuentes de Google y fotos de Wikimedia: copia guardada y se actualiza en segundo plano.
  const cacheable = url.host.endsWith('gstatic.com') ||
    url.host.endsWith('googleapis.com') || url.host.endsWith('wikipedia.org') || url.host.endsWith('wikimedia.org');
  if (!cacheable) return;
  e.respondWith(caches.open(VERSION).then(async c => {
    const guardada = await c.match(req);
    const red = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => guardada);
    return guardada || red;
  }));
});

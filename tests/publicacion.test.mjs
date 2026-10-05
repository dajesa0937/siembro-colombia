// Revisa que lo que carga index.html esté en la lista que guarda el service worker (modo sin conexión)
// y que todos los archivos existan. Evita que la app falle sin internet por olvidar un archivo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const leer = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const html = leer('index.html');
const sw = leer('sw.js');
const shell = [...sw.match(/const SHELL = \[([\s\S]*?)\];/)[1].matchAll(/'\.\/([^']*)'/g)].map(m => m[1]).filter(Boolean);
const locales = u => !/^(https?:)?\/\//.test(u);

test('cada archivo de la lista del service worker existe', () => {
  for (const f of shell) assert.ok(existsSync(new URL('../' + f, import.meta.url)), `no existe ${f}`);
});

test('los scripts y estilos de index.html están en la lista del service worker', () => {
  const usados = [
    ...[...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]),
    ...[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]),
    ...[...html.matchAll(/<link rel="manifest" href="([^"]+)"/g)].map(m => m[1])
  ].filter(locales);
  assert.ok(usados.length >= 10);
  for (const u of usados) assert.ok(shell.includes(u), `${u} falta en SHELL de sw.js`);
});

test('las rutas son relativas (la app vive en /siembro-colombia/ en GitHub Pages)', () => {
  assert.ok(!/(src|href)="\/(?!\/)/.test(html), 'index.html tiene una ruta que empieza con /');
  const m = JSON.parse(leer('manifest.webmanifest'));
  assert.equal(m.start_url, './');
  assert.equal(m.scope, './');
  for (const i of m.icons) assert.ok(!i.src.startsWith('/'), `ícono con ruta absoluta: ${i.src}`);
});

test('cada pestaña del menú tiene su sección', () => {
  for (const [, t] of html.matchAll(/data-tab="([a-z]+)"/g)) assert.ok(html.includes(`id="tab-${t}"`), `falta la sección tab-${t}`);
});

test('el service worker pide los archivos propios a la red primero (evita mezclar versiones al actualizar)', () => {
  assert.match(sw, /cache: 'reload'/, 'la instalación debe saltarse la caché del navegador');
  assert.match(sw, /url\.origin === location\.origin\) \{\s*e\.respondWith\(fetch\(req, \{ cache: 'no-cache' \}\)/, 'los archivos propios deben ir red primero');
});

test('los botones con data-ir llevan a una pestaña que existe (o a ganadería)', () => {
  for (const [, d] of html.matchAll(/data-ir="([a-z]+)"/g)) {
    assert.ok(d === 'ganaderia' || html.includes(`id="tab-${d}"`), `data-ir="${d}" no tiene pestaña`);
  }
});

test('la bienvenida tiene su botón Comenzar y la pantalla de Inicio su banner de foto', () => {
  for (const id of ['bienvenida', 'comenzar', 'bienvFondo', 'bannerFoto', 'top5', 'iniFinca']) {
    assert.ok(html.includes(`id="${id}"`), `falta id="${id}" en index.html`);
  }
});

test('las fotos de la finca existen y están en la lista del service worker (se ven sin internet)', () => {
  const css = leer('css/estilos.css');
  const fotos = [...css.matchAll(/url\("\.\.\/(img\/[^"]+)"\)/g)].map(m => m[1]);
  fotos.push(...[...leer('js/inicio.js').matchAll(/"(img\/[^"]+\.jpg)"/g)].map(m => m[1]), ...[...html.matchAll(/src="(img\/[^"]+)"/g)].map(m => m[1]));
  assert.ok(fotos.length >= 3);
  for (const f of new Set(fotos)) {
    assert.ok(existsSync(new URL('../' + f, import.meta.url)), `no existe ${f}`);
    assert.ok(shell.includes(f), `${f} falta en SHELL de sw.js`);
  }
});

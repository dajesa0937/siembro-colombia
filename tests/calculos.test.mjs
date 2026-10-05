// Pruebas de los cálculos con el corredor de pruebas de Node (node --test). No necesita instalar nada.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const archivos = ['js/utilidades.js', 'js/datos/municipios.js', 'js/datos/cultivos.js', 'js/datos/fichas.js', 'js/calculos.js'];
const codigo = archivos.map(f => readFileSync(new URL('../' + f, import.meta.url), 'utf8')).join('\n') +
  '\nthis.api={MUN,C,METODOS,FICHA,ZONAS,ZMUN,aptitud,agua,haPosibles,finanzas,veredicto,topCultivos};';
const ctx = vm.createContext({ Intl, Math, Number, Object, Array, JSON });
vm.runInContext(codigo, ctx);
const { MUN, C, METODOS, FICHA, ZONAS, ZMUN, aptitud, agua, haPosibles, finanzas, veredicto, topCultivos } = ctx.api;

const lugar = nombre => { const m = MUN.find(x => x[1] === nombre); return { dep: m[0], mun: m[1], reg: m[2], alt: m[3], t: m[4], r: m[5], dry: m[6], lat: m[7], lon: m[8] }; };
const base = c => ({ p: c.tipo === 'pasto' ? c.pCarne : c.p, y: c.y, est: c.est, man: c.man });
function evaluar(k, mun, { modo = 'trad', ha = 1, suelo = 'franco', D = { f: 'lluvia', dia: 0 }, uso = 'ceba' } = {}) {
  const c = C[k], L = lugar(mun), A = agua(c, L, ha), met = A.mejor;
  const apt = aptitud(c, L, suelo, null, modo), F = finanzas(c, L, ha, modo, met, A, base(c), uso);
  const haMax = haPosibles(D, A.m[met], ha);
  return { c, A, apt, F, v: veredicto(apt, F, c, { modo, haMax, ha, met }) };
}

test('cada cultivo tiene ficha técnica y sistemas de riego válidos', () => {
  for (const [k, c] of Object.entries(C)) {
    assert.ok(FICHA[k], `falta ficha de ${k}`);
    for (const m of c.met) assert.ok(METODOS[m], `${k}: método ${m} no existe`);
  }
});

test('cada municipio tiene zona de suelo', () => {
  for (const m of MUN) assert.ok(ZONAS[ZMUN[m[1]]], `sin zona: ${m[1]}`);
});

test('aguacate Hass en Montería: no lo siembre por clima', () => {
  assert.equal(evaluar('hass', 'Montería').v.t, 'No lo siembre');
});

test('cacao en Tierralta es rentable', () => {
  assert.equal(evaluar('cacao', 'Tierralta').v.k, 'ok');
});

test('arroz de riego sin agua no se recomienda', () => {
  assert.equal(evaluar('arroz', 'Lorica').v.k, 'no');
});

test('el goteo gasta menos agua que la gravedad por surcos', () => {
  const A = agua(C.tabasco, lugar('Montería'), 1);
  assert.ok(A.m.goteo.volAnual < A.m.surcos.volAnual);
  assert.equal(A.mejor, 'goteo');
});

test('si el agua no alcanza para la mitad del área, dice que no siembre esa área', () => {
  const r = evaluar('tabasco', 'Montería', { modo: 'riego', D: { f: 'pozo', dia: 0.3 * 3.6 * 10, q: 0.3, h: 10 } });
  assert.equal(r.v.t, 'No siembre esa área');
});

test('en Bogotá la papa no necesita el mismo riego que en la Costa', () => {
  const bog = agua(C.papa, lugar('Bogotá'), 1), cos = agua(C.maiz, lugar('Valledupar'), 1);
  assert.ok(bog.eto < cos.eto);
});

test('topCultivos: ordena de mayor a menor ganancia y no incluye cultivos que pierden plata', () => {
  const top = topCultivos(lugar('Tierralta'), { n: 5 });
  assert.ok(top.length > 0 && top.length <= 5);
  for (let i = 1; i < top.length; i++) assert.ok(top[i - 1].prom >= top[i].prom);
  for (const t of top) { assert.notEqual(t.v.k, 'no'); assert.ok(t.prom > 0); assert.ok(t.apt.total >= 0.6); }
});

test('topCultivos: no recomienda aguacate Hass en Montería (clima no apto)', () => {
  const top = topCultivos(lugar('Montería'), { n: 30 });
  assert.ok(!top.some(t => t.k === 'hass'));
});

test('topCultivos: sin agua disponible solo propone manejo tradicional', () => {
  for (const t of topCultivos(lugar('Tierralta'), { n: 30 })) assert.equal(t.modo, 'trad');
});

test('topCultivos: el grupo de pastos solo trae pastos y forrajes', () => {
  for (const t of topCultivos(lugar('Planeta Rica'), { grupo: 'for', n: 30 })) assert.equal(t.c.g, 'for');
});

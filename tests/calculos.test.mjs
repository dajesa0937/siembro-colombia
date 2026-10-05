// Pruebas de los cálculos con el corredor de pruebas de Node (node --test). No necesita instalar nada.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const archivos = ['js/utilidades.js', 'js/datos/municipios.js', 'js/datos/cultivos.js', 'js/datos/fichas.js', 'js/datos/pastos.js', 'js/calculos.js'];
const codigo = archivos.map(f => readFileSync(new URL('../' + f, import.meta.url), 'utf8')).join('\n') +
  '\nthis.api={perdidaHW,presionAtmM,presionVaporM,potenciaBomba,kWhBombeo,tuboParaCaudal,alturaBombeo,sistemaBombeo,revisarSuccion,panelesSolares,litrosDiesel,PASTOS,kgSemillaPasto,costoSemillaPasto,recomendarPastos,MUN,C,METODOS,FICHA,ZONAS,ZMUN,aptitud,agua,haPosibles,finanzas,veredicto,topCultivos,MESES,lluviaMensual,calendarioSiembra,rangoMeses,frecuenciaRiego,dosisAbono,desgloseCostos,rotacion,resumenClimatico,periodoMeses,mesesAproximados,balanceMes,indiceForraje,recomendacionesPeriodo,recomendacionesPronostico};';
const ctx = vm.createContext({ Intl, Math, Number, Object, Array, JSON });
vm.runInContext(codigo, ctx);
const { perdidaHW, presionAtmM, presionVaporM, potenciaBomba, kWhBombeo, tuboParaCaudal, alturaBombeo, sistemaBombeo, revisarSuccion, panelesSolares, litrosDiesel, PASTOS, kgSemillaPasto, costoSemillaPasto, recomendarPastos, MUN, C, METODOS, FICHA, ZONAS, ZMUN, aptitud, agua, haPosibles, finanzas, veredicto, topCultivos, MESES, lluviaMensual, calendarioSiembra, rangoMeses, frecuenciaRiego, dosisAbono, desgloseCostos, rotacion, resumenClimatico, periodoMeses, mesesAproximados, balanceMes, indiceForraje, recomendacionesPeriodo, recomendacionesPronostico } = ctx.api;

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

test('cada cultivo tiene títulos de Wikipedia para su foto (miniaturas del Inicio y fichas)', () => {
  for (const k of Object.keys(C)) assert.ok(Array.isArray(FICHA[k].w) && FICHA[k].w.length > 0, `${k} sin títulos de foto`);
});

test('el desglose de costos suma exactamente los costos de cada año (cultivos, pastos, cada manejo)', () => {
  for (const k of Object.keys(C)) for (const modo of ['trad', 'riego', 'auto']) {
    const { F } = evaluar(k, 'Montería', { modo, uso: k === 'pasto_leche' ? 'leche' : 'ceba' });
    for (const f of F.filas) {
      const suma = Object.values(f.c).reduce((a, b) => a + b, 0);
      assert.ok(Math.abs(suma - f.cos) < 1, `${k} ${modo} año ${f.a}: ${suma} != ${f.cos}`);
    }
    const d = desgloseCostos(F.filas[F.filas.length - 1]);
    assert.ok(Math.abs(d.reduce((a, x) => a + x.pct, 0) - 1) < 1e-9);
  }
});

test('el desglose también suma en ganadería de leche', () => {
  const pasto = Object.keys(C).find(k => C[k].tipo === 'pasto');
  const { F } = evaluar(pasto, 'Montería', { uso: 'leche' });
  for (const f of F.filas) assert.ok(Math.abs(Object.values(f.c).reduce((a, b) => a + b, 0) - f.cos) < 1);
});

test('la lluvia de los 12 meses suma la lluvia anual del lugar', () => {
  for (const mun of ['Montería', 'Bogotá', 'La Ceja', 'Pereira']) {
    const L = lugar(mun), mm = lluviaMensual(L);
    assert.equal(mm.length, 12);
    assert.ok(Math.abs(mm.reduce((a, b) => a + b, 0) - L.r) < 1e-6);
  }
});

test('rangoMeses junta meses seguidos y cruza el cambio de año', () => {
  assert.equal(rangoMeses([3, 4, 5]), 'abril a junio');
  assert.equal(rangoMeses([11, 0, 1]), 'diciembre a febrero');
  assert.equal(rangoMeses([0, 10]), 'enero y noviembre');
  assert.equal(rangoMeses([]), '');
});

test('calendario de siembra: maíz en la costa se siembra con las lluvias, no en la sequía', () => {
  const r = calendarioSiembra(C.maiz, lugar('Montería'), false);
  assert.equal(r.meses.length, 12);
  assert.ok(r.ideal && r.mejores.length > 0);
  assert.ok(r.mejores.every(m => m >= 3 && m <= 9), 'los meses ideales caen en lluvias: ' + r.mejores);
  assert.equal(r.meses[0], 0, 'enero (verano fuerte) no es ideal sin riego');
});

test('calendario: donde el clima no sirve, ningún mes es recomendado ni con riego', () => {
  const r = calendarioSiembra(C.hass, lugar('Montería'), true);
  assert.ok(r.climaNo);
  assert.ok(r.meses.every(v => v === 0));
});

test('calendario: con riego hay más meses posibles que sin riego', () => {
  const L = lugar('Santa Marta');
  const sin = calendarioSiembra(C.maiz, L, false).meses.filter(v => v > 0).length;
  const con = calendarioSiembra(C.maiz, L, true).meses.filter(v => v > 0).length;
  assert.ok(con >= sin);
});

test('frecuencia de riego: el suelo arenoso se riega más seguido que el arcilloso y el goteo casi a diario', () => {
  const L = lugar('Montería');
  const a = frecuenciaRiego(C.maiz, L, 'arenoso', 'aspersion'), b = frecuenciaRiego(C.maiz, L, 'arcilloso', 'aspersion');
  assert.ok(a.dias <= b.dias && a.dias >= 1);
  const g = frecuenciaRiego(C.cacao, L, 'franco', 'goteo');
  assert.ok(g.dias <= 2);
  assert.ok(g.bruto > g.neto);
});

test('dosis de abono: bultos de 50 kg desde nutrientes (urea 46 % N, DAP 46 % P, KCl 60 % K)', () => {
  const d = dosisAbono('maiz', 2);
  assert.ok(Math.abs(d.urea - d.N / .46 / 50 * 2) < 1e-9);
  assert.ok(Math.abs(d.dap - d.P / .46 / 50 * 2) < 1e-9);
  assert.ok(Math.abs(d.kcl - d.K / .6 / 50 * 2) < 1e-9);
  for (const k of Object.keys(C)) assert.ok(dosisAbono(k), `sin dosis de ${k}`);
});

test('rotación de potreros: más descanso donde hay meses secos o frío, y los potreros alcanzan para el descanso', () => {
  const calido = rotacion(lugar('Tierralta')), seco = rotacion(lugar('Valledupar')), frio = rotacion(lugar('Bogotá'));
  assert.ok(seco.descanso > calido.descanso);
  assert.ok(frio.descanso > calido.descanso);
  for (const r of [calido, seco, frio]) {
    assert.ok(r.rango[0] < r.descanso && r.descanso < r.rango[1]);
    assert.ok((r.potreros - 1) * r.ocup >= r.descanso, 'con esos potreros el pasto descansa lo suficiente');
  }
});

// Datos diarios inventados: 3 años, llueve 5 mm/día en abril y mayo, 0,5 mm el resto, 28 °C / 20 °C
function diasFalsos() {
  const time = [], ll = [], tmax = [], tmin = [], et0 = [];
  for (const y of [2022, 2023, 2024]) for (let m = 0; m < 12; m++) {
    const n = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= n; d++) { time.push(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`); ll.push(m === 3 || m === 4 ? 5 : .5); tmax.push(28); tmin.push(20); et0.push(4); }
  }
  return { time, ll, tmax, tmin, et0 };
}

test('resumenClimatico: promedia los años por mes y calcula lluvia, temperatura y evaporación', () => {
  const d = diasFalsos(), r = resumenClimatico(d.time, d.ll, d.tmax, d.tmin, d.et0);
  assert.equal(r.length, 12);
  assert.ok(Math.abs(r[3].mm - 150) < 1e-9, 'abril: 30 días × 5 mm');
  assert.ok(Math.abs(r[0].mm - 15.5) < 1e-9, 'enero: 31 días × 0,5 mm');
  assert.equal(r[3].min, r[3].max);
  assert.equal(r[0].anios, 3);
  assert.equal(r[0].t, 24);
  assert.equal(r[0].et0, 4);
});

test('resumenClimatico: ignora los meses incompletos', () => {
  const d = diasFalsos(), n = d.time.length - 10;
  const r = resumenClimatico(d.time.slice(0, n), d.ll.slice(0, n), d.tmax.slice(0, n), d.tmin.slice(0, n), d.et0.slice(0, n));
  assert.equal(r[11].anios, 2, 'diciembre de 2024 está incompleto');
});

test('periodoMeses da la vuelta al año', () => {
  const m = [...Array(12).keys()].map(i => ({ m: i }));
  assert.equal(JSON.stringify(periodoMeses(m, 10, 4).map(x => x.m)), '[10,11,0,1]');
});

test('balanceMes e indiceForraje: sin lluvia falta agua; con mucha lluvia sobra', () => {
  const seco = { m: 0, mm: 10, et0: 4, t: 25 }, humedo = { m: 4, mm: 400, et0: 4, t: 25 };
  assert.ok(balanceMes(C.maiz, seco).falta > 50 && balanceMes(C.maiz, seco).sobra === 0);
  assert.ok(balanceMes(C.maiz, humedo).falta === 0 && balanceMes(C.maiz, humedo).sobra > 0);
  assert.ok(indiceForraje(seco) < .5 && indiceForraje(humedo) > 1);
});

test('mesesAproximados da 12 meses que suman la lluvia anual', () => {
  const L = lugar('Montería'), m = mesesAproximados(L);
  assert.equal(m.length, 12);
  assert.ok(Math.abs(m.reduce((s, x) => s + x.mm, 0) - L.r) < 1e-6);
});

test('recomendaciones por período: avisa de riego y de pasto en los meses secos, y no inventa problemas en los húmedos', () => {
  const d = diasFalsos(), meses = resumenClimatico(d.time, d.ll, d.tmax, d.tmin, d.et0);
  const sec = recomendacionesPeriodo(periodoMeses(meses, 0, 3), C.maiz);
  assert.ok(sec.agri.some(x => x.n === 'aviso' && /riego/i.test(x.t)));
  assert.ok(sec.gan.some(x => x.n === 'aviso' && /silo|heno/i.test(x.t)));
  const hum = recomendacionesPeriodo([{ m: 3, mm: 150, et0: 3, t: 22, min: 100, max: 200 }, { m: 4, mm: 150, et0: 3, t: 22, min: 100, max: 200 }], C.maiz);
  assert.ok(hum.agri.some(x => x.n === 'ok'));
  assert.ok(!hum.gan.some(x => /Guarde silo/.test(x.t)));
});

test('recomendaciones del pronóstico: lluvia fuerte = no abonar; días secos = ventana; calor = sombra para el ganado', () => {
  const lluvia = recomendacionesPronostico([{ ll: 10, max: 28 }, { ll: 8, max: 27 }, { ll: 5, max: 27 }, { ll: 0, max: 28 }]);
  assert.ok(lluvia.agri.some(x => x.n === 'no' && /abone/i.test(x.t)));
  const secos = recomendacionesPronostico([...Array(7)].map(() => ({ ll: 0, max: 30 })));
  assert.ok(secos.agri.some(x => /días seguidos/.test(x.t)));
  assert.ok(secos.agri.some(x => /solo se esperan/.test(x.t)));
  const calor = recomendacionesPronostico([{ ll: 0, max: 35 }, { ll: 0, max: 36 }, { ll: 2, max: 30 }]);
  assert.ok(calor.gan.some(x => /sombra/i.test(x.t)));
  const nada = recomendacionesPronostico([{ ll: 3, max: 28 }, { ll: 3, max: 28 }]);
  assert.ok(nada.agri.length > 0 && nada.gan.length > 0);
});

test('catálogo de pastos: 8 variedades con datos completos', () => {
  assert.equal(PASTOS.length, 8);
  for (const p of PASTOS) {
    assert.ok(p.n && p.puntos > 0 && p.kgRef > 0 && p.ms > 0 && p.lluviaMin > 0 && p.altMax > 0, p.k);
    const vcRef = p.puntos / p.kgRef; assert.ok(vcRef >= 40 && vcRef <= 80, `${p.k}: valor cultural de referencia raro (${vcRef})`);
    assert.ok(p.germ[0] < p.germ[1] && p.diasPast[0] < p.diasPast[1]);
  }
});

test('kgSemillaPasto: más kilos si la bolsa tiene menos valor cultural', () => {
  assert.equal(kgSemillaPasto(375, 75, 1), 5);
  assert.ok(Math.abs(kgSemillaPasto(375, 60, 2) - 12.5) < 1e-9);
  assert.ok(kgSemillaPasto(375, 60) > kgSemillaPasto(375, 75));
  assert.equal(kgSemillaPasto(375, 0, 1), 375);
  assert.equal(costoSemillaPasto(375, 75, 5700, 2), 57000);
});

test('recomendarPastos: no recomienda lo que no sirve para la altura o lluvia', () => {
  const frio = recomendarPastos(PASTOS, { alt: 1900, r: 1500 }, {});
  assert.ok(frio.find(r => r.p.k === 'tanzania').ok === false);
  assert.ok(frio.find(r => r.p.k === 'decumbens').ok === true);
  const seco = recomendarPastos(PASTOS, { alt: 100, r: 600 }, {});
  assert.ok(seco.every(r => !r.ok));
  const lista = recomendarPastos(PASTOS, { alt: 100, r: 1300 }, {});
  const oks = lista.map(r => r.ok); assert.ok(oks.indexOf(false) === -1 || oks.slice(oks.indexOf(false)).every(x => !x));
});

test('recomendarPastos: suelo ácido favorece Brachiaria y castiga Panicum; heno descarta Brachiaria que no sirven', () => {
  const L = { alt: 100, r: 1500 };
  const ac = recomendarPastos(PASTOS, L, { acido: true, fertil: 'baja' });
  assert.ok(['decumbens', 'humidicola', 'llanero'].includes(ac[0].p.k));
  assert.ok(ac.findIndex(r => r.p.k === 'mombasa') > 3);
  const heno = recomendarPastos(PASTOS, L, { uso: 'heno', fertil: 'alta' });
  assert.ok(heno[0].p.heno >= 3);
  const enc = recomendarPastos(PASTOS, L, { encharca: true });
  assert.equal(enc[0].p.k, 'humidicola');
});

test('pastos: se evalúan a 10 años y nunca dice "pierde dinero" si cada año deja ganancia', () => {
  for (const k of ['pastoT', 'pastoF']) {
    assert.equal(C[k].ramp.length, 10);
    for (const uso of ['ceba', 'leche']) for (const modo of ['trad', 'riego']) for (const m of MUN) {
      const L = lugar(m[1]), c = C[k], A = agua(c, L, 1), apt = aptitud(c, L, 'franco', null, modo);
      const F = finanzas(c, L, 1, modo, A.mejor, A, { p: uso === 'leche' ? c.pLeche : c.pCarne, y: c.y, est: c.est, man: c.man }, uso);
      const v = veredicto(apt, F, c, { modo, haMax: 99, ha: 1, met: A.mejor });
      if (v.t === 'No lo siembre, pierde dinero') assert.ok(F.anual <= 0, `${k} ${uso} ${modo} ${m[1]}: dice pierde dinero pero gana ${F.anual} al año`);
      if (v.k === 'ok') assert.ok(F.payback !== null && F.payback <= 6 && F.margen >= 0.15, `${k} ${uso} ${modo} ${m[1]}: "sí" sin recuperar la inversión en 6 años`);
    }
  }
});

test('veredicto: ganancia chiquita frente a la inversión no es "rentable"; ganancia que tarda en volver es "gana poco"', () => {
  const c = C.pastoT, L = lugar('Montería'), A = agua(c, L, 1), apt = aptitud(c, L, 'franco', null, 'trad');
  const F0 = finanzas(c, L, 1, 'trad', A.mejor, A, { p: c.pCarne, y: c.y, est: c.est, man: c.man }, 'ceba');
  const W = { modo: 'trad', haMax: 9, ha: 1, met: A.mejor };
  assert.ok(F0.anual > 0 && F0.acum <= 0);
  assert.equal(veredicto(apt, F0, c, W).k, 'mid');
  const casiNada = { ...F0, anual: F0.inversion * 0.02 };
  assert.equal(veredicto(apt, casiNada, c, W).t, 'No lo siembre: gana casi nada');
  const pierde = { ...F0, anual: -1 };
  assert.equal(veredicto(apt, pierde, c, W).t, 'No lo siembre, pierde dinero');
});

test('pasto de clima cálido con riego en una zona húmeda: no conviene (cuesta más de lo que da)', () => {
  const { v } = evaluar('pastoT', 'Tierralta', { modo: 'riego' });
  assert.notEqual(v.k, 'ok');
});

// ---------- Bombeo ----------
const cerca = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} no está cerca de ${b} (±${tol})`);

test('bombeo: potencia hidráulica = ρ·g·Q·H (10 L/s a 30 m = 2,94 kW) y en el eje se divide por la eficiencia', () => {
  const P = potenciaBomba(10, 30, { etaB: 0.6 });
  cerca(P.hid, 2.943, 0.001); cerca(P.eje, 4.905, 0.001);
  assert.ok(P.motor > P.eje && P.elec > P.eje);
  assert.ok(P.hpCom >= P.hp && [0.5, 0.75, 1, 1.5, 2, 3, 5, 7.5, 10, 15].includes(P.hpCom));
});

test('bombeo: energía por m³ = 2,725 · H / η (FAO): 30 m con 50 % da 0,1635 kWh/m³', () => {
  cerca(kWhBombeo(1, 30, 0.5), 0.1635, 1e-9);
  cerca(kWhBombeo(1000, 30, 0.5), 163.5, 1e-6);
  assert.equal(kWhBombeo(10, 30, 0), 0);
});

test('bombeo: pérdida Hazen-Williams (10 L/s, tubo de 100 mm, 100 m, C = 150 ≈ 1,46 m) y crece con el caudal y baja con el diámetro', () => {
  cerca(perdidaHW(10, 100, 100), 1.459, 0.01);
  assert.ok(perdidaHW(20, 100, 100) > perdidaHW(10, 100, 100) * 3.5);
  assert.ok(perdidaHW(10, 78, 100) > perdidaHW(10, 100, 100));
  assert.equal(perdidaHW(0, 100, 100), 0);
  assert.equal(perdidaHW(10, 100, 0), 0);
});

test('bombeo: presión atmosférica baja con la altura y la de vapor sube con la temperatura', () => {
  cerca(presionAtmM(0), 10.33, 0.01); cerca(presionAtmM(2600), 7.52, 0.05);
  assert.ok(presionAtmM(1500) < presionAtmM(500));
  cerca(presionVaporM(20), 0.239, 0.01);
  assert.ok(presionVaporM(40) > presionVaporM(20));
});

test('bombeo: tubería que no pasa de 1,5 m/s', () => {
  for (const q of [0.5, 2, 4, 8, 15, 30]) { const t = tuboParaCaudal(q); assert.ok(t.v <= 1.5 || t.pulg === 8, `q=${q}`); }
  assert.ok(tuboParaCaudal(8).mm > tuboParaCaudal(1).mm);
});

test('bombeo: altura total suma estática, roce, accesorios, presión del riego y filtros; la aspersión gasta más presión que el goteo', () => {
  const g = alturaBombeo({ q: 4, metodo: 'goteo', hs: 3, desnivel: 10, dist: 200 }), a = alturaBombeo({ q: 4, metodo: 'aspersion', hs: 3, desnivel: 10, dist: 200 });
  cerca(g.tdh, g.estatica + g.friccion + g.locales + g.presion + g.filtros, 1e-9);
  assert.equal(g.estatica, 13);
  assert.ok(a.tdh > g.tdh + 15);
});

test('bombeo: un tubo más grueso baja la altura y los kW; sistemaBombeo lo compara', () => {
  const s = sistemaBombeo({ q: 4, metodo: 'goteo', hs: 3, desnivel: 10, dist: 200, etaB: 0.6 });
  assert.ok(s.mayor.pulg > s.H.tubo.pulg && s.mayor.H.tdh < s.H.tdh && s.mayor.ahorroKW > 0);
});

test('bombeo: a mayor altitud la bomba de superficie sube menos el agua; en Bogotá no sirve la misma succión que en Montería', () => {
  const costa = revisarSuccion({ alt: 20, hs: 5 }), alto = revisarSuccion({ alt: 2600, hs: 5 });
  assert.ok(costa.ok && !alto.ok);
  assert.ok(alto.hsMax < costa.hsMax);
  assert.ok(alto.hsMax >= 0);
});

test('bombeo: diésel y paneles dan números razonables', () => {
  cerca(litrosDiesel(10), 2.7, 1e-9);
  assert.ok(panelesSolares(1) >= 1333 && panelesSolares(1) % 50 === 0);
});

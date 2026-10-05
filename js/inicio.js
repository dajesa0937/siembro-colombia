// Siembro Colombia — pantalla de Inicio: su finca, atajos y los cultivos que más rinden en la zona
// Archivo cargado como script clásico: las constantes y funciones quedan globales y las usan los demás archivos.

let topGrupo="agr",tokenInicio=0;
const HOJA_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21V11"/><path d="M12 13c-4 0-6-2-6-6 4 0 6 2 6 6z"/><path d="M12 11c0-4 2-6 6-6 0 4-2 6-6 6z"/></svg>';
const PIN_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>';

function pintarInicio(){
  const L=lugar(),donde=`${L.mun}${L.dep?", "+L.dep:""}`;
  $("iniFinca").innerHTML=`<div class="finca-top"><div class="pin">${PIN_SVG}</div><div><b>${donde}</b><small>${REG[L.reg]}, ${num(L.alt)} msnm</small></div><button type="button" class="sec" data-ir="calc">Cambiar</button></div>
   <div class="stats"><div><small>Temperatura</small><b>${L.t} °C</b></div><div><small>Lluvia al año</small><b>${num(L.r)} mm</b></div><div><small>Meses secos</small><b>${L.dry}</b></div></div>
   <div class="tiempo-ini" id="tiempoIni"></div>`;
  try{const d=JSON.parse(localStorage.getItem("siembro:ultimo")||"null");
    if(d&&C[d.cul])$("atCalc").textContent=`Último cálculo: ${C[d.cul].n} en ${d.dep==="__otro"?"su finca":d.mun}. Toque para verlo o cambiarlo.`;}catch(e){}
  pintarTop();climaInicio();
}

// ---------- Clima de hoy (usa el mismo pronóstico guardado que la pestaña Clima) ----------
function mostrarTiempoIni(j,guardado){
  const c=j.current||{},d=j.daily||{},ll=(d.precipitation_sum||[])[0],pr=(d.precipitation_probability_max||[])[0],man=(d.precipitation_sum||[])[1];
  const caja=$("tiempoIni"),at=$("atClima");if(!caja)return;
  caja.textContent=`Ahora ${num(c.temperature_2m??0)} °C, ${(WMO[c.weather_code]||"").toLowerCase()}. Lluvia hoy: ${num(ll??0,1)} mm${pr!=null?` (${pr} % de probabilidad)`:""}.${guardado?" Pronóstico guardado.":""}`;
  at.textContent=`Hoy ${num(ll??0,1)} mm de lluvia esperada y mañana ${num(man??0,1)} mm. Toque para ver cuánta agua regar.`;
}
async function climaInicio(){
  const U=lugarClima(),mi=++tokenInicio;
  if(!U){$("atClima").textContent="Toque para ver el pronóstico y usar su ubicación.";return;}
  const key=`siembro:clima:${U.lat.toFixed(2)},${U.lon.toFixed(2)}`;let g=null;
  try{g=JSON.parse(localStorage.getItem(key)||"null");}catch(e){}
  if(g&&Date.now()-g.t<30*60*1000){mostrarTiempoIni(g.j,false);return;}
  if(g)mostrarTiempoIni(g.j,!navigator.onLine);
  if(!navigator.onLine)return;
  try{const r=await fetch(urlClima(U));if(!r.ok)throw new Error(r.status);const j=await r.json();
    try{localStorage.setItem(key,JSON.stringify({t:Date.now(),j}));}catch(e){}
    if(mi===tokenInicio)mostrarTiempoIni(j,false);}catch(e){}
}

// ---------- Lo que más rinde en su zona ----------
function pintarTop(){
  const L=lugar(),D=disponible(),suelo=$("suelo").value;
  const top=topCultivos(L,{ha:1,suelo,ph:+$("ph").value||null,D,grupo:topGrupo,uso:$("uso").value,n:5});
  const sueloTxt=$("suelo").selectedOptions[0].text.split(" (")[0].toLowerCase();
  $("topPara").textContent=`Para suelo ${sueloTxt} y ${D.f==="lluvia"?"solo lluvia":"su fuente de agua"}. Cambie el suelo o el agua en Calcular y esta lista se actualiza.`;
  $("top5").innerHTML=top.length?top.map((t,i)=>`<li><button type="button" data-k="${t.k}"><span class="n">${i+1}</span><span class="th" data-mini="${(FICHA[t.k]?FICHA[t.k].w:[t.c.n]).join("|")}" data-alt="${t.c.n}">${HOJA_SVG}</span><span class="t"><b>${t.c.n}</b><small>${Math.round(t.apt.total*100)} % apto, ${MODOS[t.modo].toLowerCase()}</small></span><span class="g">${millones(t.prom)}<small>por año por ha</small></span></button></li>`).join("")
    :`<li class="hint">Con este suelo, clima y agua, ${topGrupo==="agr"?"ningún cultivo de la lista":"ningún pasto de la lista"} sale claramente rentable. Pruebe otro suelo o fuente de agua en Calcular, o revise los precios en "Ajustar precios".</li>`;
  cargarMiniaturas($("top5"));
}

// ---------- Fotos ----------
// Miniaturas del Top: vienen de Wikimedia Commons; sin internet o sin foto queda el ícono de la planta.
const primeraCarga=urls=>urls.reduce((p,u)=>p.then(ok=>ok||new Promise(res=>{const i=new Image();i.onload=()=>res(u);i.onerror=()=>res(null);i.src=u;})),Promise.resolve(null));
function cargarMiniaturas(root){root.querySelectorAll("[data-mini]:not([data-ok])").forEach(async el=>{
  el.dataset.ok="1";const f=await buscarFoto(el.dataset.mini.split("|"));if(!f)return;
  const src=await primeraCarga([f.src]);if(src)el.innerHTML=`<img src="${src}" alt="${el.dataset.alt||f.titulo}" loading="lazy">`;});}

// ---------- Bienvenida (solo la primera vez) ----------
function cerrarBienvenida(){const b=$("bienvenida");if(!b||b.hidden)return;b.hidden=true;try{localStorage.setItem("siembro:bienvenida","1");}catch(e){}}
// El banner del Inicio cambia de foto según se vean cultivos (maíz) o pastos (vacas).
function actualizarBanner(){const f=$("bannerFoto");if(!f)return;const p=topGrupo==="for";
  f.src=p?"img/paisaje-vacas.jpg":"img/paisaje-maiz.jpg";f.alt=p?"Vacas descansando en un potrero de la montaña":"Cultivo de maíz y potreros en la montaña";f.style.objectPosition=p?"50% 82%":"50% 78%";}
function sincronizarSeg(){document.querySelectorAll(".seg button[data-g]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.g===topGrupo));actualizarBanner();}
function iniciarInicio(){actualizarBanner();if(!$("bienvenida").hidden)$("bienvenida").focus({preventScroll:true});}

document.addEventListener("click",e=>{
  const ir=e.target.closest("[data-ir]");
  if(ir){cerrarBienvenida();if(ir.dataset.ir==="ganaderia"){topGrupo="for";sincronizarSeg();abrirTab("inicio");}else abrirTab(ir.dataset.ir);return;}
  const k=e.target.closest("#top5 button[data-k]");if(k){abrirTab("calc");probar(k.dataset.k);return;}
  const g=e.target.closest(".seg button[data-g]");
  if(g){topGrupo=g.dataset.g;sincronizarSeg();pintarTop();}
});
addEventListener("keydown",e=>{if(e.key==="Escape")cerrarBienvenida();});

// Siembro Colombia — pantalla de Inicio: su finca, atajos y los cultivos que más rinden en la zona
// Archivo cargado como script clásico: las constantes y funciones quedan globales y las usan los demás archivos.

let topGrupo="agr",tokenInicio=0;
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
  $("top5").innerHTML=top.length?top.map((t,i)=>`<li><button type="button" data-k="${t.k}"><span class="n">${i+1}</span><span class="t"><b>${t.c.n}</b><small>${Math.round(t.apt.total*100)} % apto, ${MODOS[t.modo].toLowerCase()}</small></span><span class="g">${millones(t.prom)}<small>por año por ha</small></span></button></li>`).join("")
    :`<li class="hint">Con este suelo, clima y agua, ${topGrupo==="agr"?"ningún cultivo de la lista":"ningún pasto de la lista"} sale claramente rentable. Pruebe otro suelo o fuente de agua en Calcular, o revise los precios en "Ajustar precios".</li>`;
}

document.addEventListener("click",e=>{
  const ir=e.target.closest("[data-ir]");if(ir){abrirTab(ir.dataset.ir);return;}
  const k=e.target.closest("#top5 button[data-k]");if(k){abrirTab("calc");probar(k.dataset.k);return;}
  const g=e.target.closest(".seg button[data-g]");
  if(g){topGrupo=g.dataset.g;document.querySelectorAll(".seg button[data-g]").forEach(b=>b.setAttribute("aria-pressed",b===g));pintarTop();}
});

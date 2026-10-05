// Siembro Colombia — pantalla de Inicio (su finca, clima de hoy y los 4 atajos), bienvenida y botones de navegación
// Archivo cargado como script clásico: las constantes y funciones quedan globales y las usan los demás archivos.

let tokenInicio=0;
const SVG_BASE=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const HOJA_SVG=SVG_BASE('<path d="M12 21V11"/><path d="M12 13c-4 0-6-2-6-6 4 0 6 2 6 6z"/><path d="M12 11c0-4 2-6 6-6 0 4-2 6-6 6z"/>');
const PIN_SVG=SVG_BASE('<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>');
const lugarTxt=()=>{const L=lugar();return `${L.mun}${L.dep?", "+L.dep:""}`;};

// Lo que resulta de las cuentas para el lugar, suelo y agua que eligió (lo usan los atajos y las pantallas)
function contextoZona(){return{L:lugar(),D:disponible(),suelo:$("suelo").value,ph:+$("ph").value||null};}
function mejorDe(grupo,n=1,uso="ceba",solo){
  const x=contextoZona();
  return topCultivos(x.L,{ha:1,suelo:x.suelo,ph:x.ph,D:x.D,grupo,uso,n:20}).filter(t=>!solo||t.c.tipo===solo).slice(0,n);
}

function pintarInicio(){
  const L=lugar();
  $("iniFinca").innerHTML=`<div class="finca-top"><div class="pin">${PIN_SVG}</div><div><b>Tu finca</b><small>${lugarTxt()} · ${num(L.alt)} msnm</small></div><button type="button" class="sec" id="cambiarFinca">${$("fincaSel").hidden?"Cambiar":"Listo"}</button></div>
   <div class="stats"><div><small>Temperatura</small><b>${L.t} °C</b></div><div><small>Lluvia al año</small><b>${num(L.r)} mm</b></div><div><small>Meses secos</small><b>${L.dry}</b></div></div>
   <div class="tiempo-ini" id="tiempoIni"></div>`;
  const top=mejorDe("agr",1)[0],pas=mejorDe("for",1,"ceba","pasto")[0];
  if(top){
    const A=agua(top.c,L,1),cal=calendarioSiembra(top.c,L,top.modo!=="trad"),dz=dosisAbono(top.k),fr=frecuenciaRiego(top.c,L,$("suelo").value,A.mejor);
    $("atSiembra").textContent=`${top.c.n}: ${cal.mejores.length?(cal.ideal?"mejor época ":"época posible ")+rangoMeses(cal.mejores):"con riego, casi cualquier mes"}.`;
    $("atRiego").textContent=A.necesita?`${top.c.n}: riegue cada ${fr.dias} ${fr.dias===1?"día":"días"} si no llueve.`:`La lluvia de su zona alcanza para ${top.c.n.toLowerCase()}: no gaste agua de más.`;
    $("atAbono").textContent=dz?`${top.c.n}: unos ${num(dz.urea,1)} bultos de urea por hectárea ${dz.porCiclo?"por ciclo":"al año"}.`:"Plan de abonos por cultivo.";
  }else{
    $("atSiembra").textContent="Con este suelo y agua ningún cultivo sale claramente rentable. Pruebe otro suelo o fuente de agua.";
    $("atRiego").textContent=`Su zona recibe ${num(L.r)} mm al año y tiene ${L.dry} ${L.dry===1?"mes seco":"meses secos"}.`;
    $("atAbono").textContent="Elija un cultivo y vea cuánto abono necesita.";
  }
  $("atGan").textContent=pas?`${pas.c.n}: aguanta unos ${num(pas.F.ugg,1)} animales por hectárea. Rote los potreros.`:"Pasto recomendado y rotación de potreros.";
  pintarMas();climaInicio();precargarNormales();
}

// ---------- Clima de hoy (usa el mismo pronóstico guardado que la pantalla Clima) ----------
function mostrarTiempoIni(j,guardado){
  const c=j.current||{},d=j.daily||{},ll=(d.precipitation_sum||[])[0],pr=(d.precipitation_probability_max||[])[0],sem=(d.precipitation_sum||[]).slice(0,7).reduce((a,b)=>a+(b||0),0);
  const caja=$("tiempoIni");if(!caja)return;
  caja.textContent=`Ahora ${num(c.temperature_2m??0)} °C, ${(WMO[c.weather_code]||"").toLowerCase()}. Lluvia hoy: ${num(ll??0,1)} mm${pr!=null?` (${pr} % de probabilidad)`:""}. En 7 días: ${num(sem,0)} mm.${guardado?" Pronóstico guardado.":""}`;
  const rec=recomendacionesPronostico((d.time||[]).slice(0,7).map((t,i)=>({ll:d.precipitation_sum[i]||0,max:d.temperature_2m_max[i]})));
  const b=document.createElement("b");b.textContent=rec.agri[0].t;caja.append(document.createElement("br"),b);
}
async function climaInicio(){
  const U=lugarClima(),mi=++tokenInicio;
  if(!U)return;
  const key=`siembro:clima:${U.lat.toFixed(2)},${U.lon.toFixed(2)}`;let g=null;
  try{g=JSON.parse(localStorage.getItem(key)||"null");}catch(e){}
  if(g&&Date.now()-g.t<30*60*1000){mostrarTiempoIni(g.j,false);return;}
  if(g)mostrarTiempoIni(g.j,!navigator.onLine);
  if(!navigator.onLine)return;
  try{const r=await fetch(urlClima(U));if(!r.ok)throw new Error(r.status);const j=await r.json();
    try{localStorage.setItem(key,JSON.stringify({t:Date.now(),j}));}catch(e){}
    if(mi===tokenInicio)mostrarTiempoIni(j,false);}catch(e){}
}

// ---------- Fotos ----------
// Miniaturas de las listas: vienen de Wikimedia Commons; sin internet o sin foto queda el ícono de la planta.
const primeraCarga=urls=>urls.reduce((p,u)=>p.then(ok=>ok||new Promise(res=>{const i=new Image();i.onload=()=>res(u);i.onerror=()=>res(null);i.src=u;})),Promise.resolve(null));
function cargarMiniaturas(root){root.querySelectorAll("[data-mini]:not([data-ok])").forEach(async el=>{
  el.dataset.ok="1";const f=await buscarFoto(el.dataset.mini.split("|"));if(!f)return;
  const src=await primeraCarga([f.src]);if(src)el.innerHTML=`<img src="${src}" alt="${el.dataset.alt||f.titulo}" loading="lazy">`;});}

// ---------- Bienvenida (solo la primera vez) ----------
function cerrarBienvenida(){const b=$("bienvenida");if(!b||b.hidden)return;b.hidden=true;try{localStorage.setItem("siembro:bienvenida","1");}catch(e){}}
function iniciarInicio(){if(!$("bienvenida").hidden)$("bienvenida").focus({preventScroll:true});}

// ---------- Botones ----------
document.addEventListener("click",e=>{
  const ir=e.target.closest("[data-ir]");
  if(ir){cerrarBienvenida();abrirTab(ir.dataset.ir);return;}
  if(e.target.closest("#atras")){atras();return;}
  if(e.target.closest("#cambiarFinca")){$("fincaSel").hidden=!$("fincaSel").hidden;pintarInicio();return;}
  if(e.target.closest("[data-cambiar]")){abrirTab("inicio");$("fincaSel").hidden=false;pintarInicio();$("fincaSel").scrollIntoView({block:"center"});return;}
  if(e.target.closest("#verBienvenida")){const b=$("bienvenida");b.hidden=false;b.focus({preventScroll:true});return;}
});
addEventListener("keydown",e=>{if(e.key==="Escape")cerrarBienvenida();});

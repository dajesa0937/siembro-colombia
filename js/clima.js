// Siembro Colombia — pronóstico Open-Meteo y recomendación de riego diaria
// Archivo cargado como script clásico: las constantes y funciones quedan globales y las usan los demás archivos.

// ---------- Clima (Open-Meteo, gratis y sin clave) ----------
const WMO={0:"Despejado",1:"Mayormente despejado",2:"Parcialmente nublado",3:"Nublado",45:"Niebla",48:"Niebla",51:"Llovizna débil",53:"Llovizna",55:"Llovizna fuerte",61:"Lluvia débil",63:"Lluvia moderada",65:"Lluvia fuerte",80:"Chubascos",81:"Chubascos fuertes",82:"Aguaceros muy fuertes",95:"Tormenta eléctrica",96:"Tormenta con granizo",99:"Tormenta con granizo"};
function lugarClima(){if(ubicPropia)return ubicPropia;const L=lugar();if(L.lat==null)return null;return{lat:L.lat,lon:L.lon,nombre:`${L.mun}, ${L.dep}`};}
// Dirección del pronóstico: la usan la pestaña Clima y la pantalla de Inicio (guardan el mismo dato).
const urlClima=U=>`https://api.open-meteo.com/v1/forecast?latitude=${U.lat}&longitude=${U.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration&timezone=America%2FBogota&forecast_days=16`;
async function cargarClima(forzar){
  const U=lugarClima();
  if(!U){$("climaOut").innerHTML=`<div class="empty"><h2>Elija un municipio o use su ubicación</h2><p>Para "Otro lugar" toque "Usar mi ubicación" y la app busca el pronóstico de donde está.</p></div>`;$("cLugar").textContent="Clima";return;}
  const key=`siembro:clima:${U.lat.toFixed(2)},${U.lon.toFixed(2)}`;
  if(!forzar&&climaCargado===key)return;
  $("cLugar").textContent="Clima en "+U.nombre;
  const url=urlClima(U);
  try{const r=await fetch(url);if(!r.ok)throw new Error(r.status);const j=await r.json();
    try{localStorage.setItem(key,JSON.stringify({t:Date.now(),j}));}catch(e){}
    climaCargado=key;pintarClima(j,null);}
  catch(e){let g=null;try{g=JSON.parse(localStorage.getItem(key)||"null");}catch(_){}
    if(g){climaCargado=key;pintarClima(g.j,g.t);}
    else $("climaOut").innerHTML=`<div class="empty"><h2>No se pudo traer el clima</h2><p>Revise la conexión a internet y toque "Actualizar". Cuando cargue una vez, queda guardado para verlo sin señal.</p></div>`;}
}
// Por cada día: lo que gasta el cultivo menos el 80 % de la lluvia, y el agua de riego que eso significa (m³) con el sistema elegido.
function diasRiego(j,n,{kc,kr,ef,ha}){const d=j.daily;
  return d.time.slice(0,n).map((t,i)=>{const et0=d.et0_fao_evapotranspiration[i]||0,ll=d.precipitation_sum[i]||0,pr=d.precipitation_probability_max?d.precipitation_probability_max[i]:null;
    const neta=Math.max(0,kc*et0-.8*ll);return{t,et0,ll,pr,code:d.weather_code?d.weather_code[i]:null,max:d.temperature_2m_max[i],min:d.temperature_2m_min[i],neta,m3:neta*kr/ef*10*ha};});}
// Datos del cultivo y del riego que eligió en la calculadora (los usan las pestañas Hoy y 16 días)
function contextoRiego(){const P=leerForm(),c=C[P.k],A=agua(c,P.L,P.ha),met=(P.met!=="mejor"&&c.met.includes(P.met))?P.met:A.mejor,ef=METODOS[met].ef;
  return{P,c,L:P.L,ha:P.ha,A,met,ef,kc:c.kc*(c.perc||1),kr:fLoc(c,met),D:P.D};}
function htmlHoy(j,guardado){
  const P=leerForm(),c=C[P.k],L=P.L,ha=P.ha,A=agua(c,L,ha);
  const met=(P.met!=="mejor"&&c.met.includes(P.met))?P.met:A.mejor,ef=METODOS[met].ef;
  const kc=c.kc*(c.perc||1),kr=fLoc(c,met),D=P.D,d=j.daily,cur=j.current||{};
  $("cPara").textContent=`Riego calculado para ${c.n.toLowerCase()}, ${num(ha,1)} ha, ${METODOS[met].n.toLowerCase()}. Puede cambiarlo en Calcular.`;
  const dias=diasRiego(j,7,{kc,kr,ef,ha});
  const hoy=dias[0],man=dias[1]||{ll:0,pr:0,m3:0};
  const esperar=(hoy.ll>=5&&(hoy.pr??100)>=60)||(man.ll>=8&&(man.pr??100)>=70);
  const semana=dias.reduce((s,x)=>s+x.m3,0),sinPron=dias.reduce((s,x)=>s+kc*x.et0*kr/ef*10*ha,0);
  const fechaCorta=t=>new Date(t+"T12:00:00").toLocaleDateString("es-CO",{weekday:"short",day:"numeric"});
  const maxLl=Math.max(5,...dias.map(x=>x.ll));
  const porPlanta=(c.tipo==="per")?hoy.neta*kr/ef*(10000/c.dens):null;
  const horas=(D.q&&D.q>0)?hoy.m3/(D.q*3.6):null;
  const titulo=esperar?"Hoy no riegue: viene lluvia":hoy.neta<.5?"Hoy no hace falta regar":`Riegue ${num(hoy.m3,1)} m³ hoy`;
  let h=`${guardado?`<div class="aviso agua">Sin conexión: pronóstico guardado el ${new Date(guardado).toLocaleString("es-CO",{day:"numeric",month:"short",hour:"numeric",minute:"2-digit"})}.</div>`:""}
  <div class="card"><h2>Ahora</h2><div class="ahora"><div class="temp">${num(cur.temperature_2m??0,0)}°</div>
   <div><b>${WMO[cur.weather_code]||""}</b><br>Humedad ${num(cur.relative_humidity_2m??0)} %, viento ${num(cur.wind_speed_10m??0)} km/h${cur.precipitation?`, lloviendo ${num(cur.precipitation,1)} mm`:""}</div></div>
   <p class="hint">Hoy: máxima ${num(hoy.max,0)}°, mínima ${num(hoy.min,0)}°, ${hoy.pr!=null?hoy.pr+" % de probabilidad de lluvia":"sin dato de probabilidad"}.</p></div>
  <div class="card agua"><h2>¿Riego hoy?</h2>
   <div class="hoy">${titulo}</div>
   <p>${esperar?`Se esperan ${num(hoy.ll,1)} mm hoy y ${num(man.ll,1)} mm mañana (probabilidad de ${hoy.pr??"–"} % y ${man.pr??"–"} %). Ahorra ${num(hoy.m3+man.m3,1)} m³ de agua esperando la lluvia.`
     :hoy.neta<.5?`La lluvia de hoy (${num(hoy.ll,1)} mm) cubre lo que el cultivo gasta.`
     :`Su cultivo gasta hoy ${num(kc*hoy.et0,1)} mm y la lluvia aporta ${num(hoy.ll*.8,1)} mm. Faltan ${num(hoy.neta,1)} mm${porPlanta?`, unos <b>${num(porPlanta,1)} litros por planta</b>`:""}${horas?`, unas <b>${num(horas,1)} horas de bombeo</b> con sus ${num(D.q,1)} L/s`:""}.`}</p>
   <p>Riegue antes de las 9 de la mañana o después de las 4 de la tarde para perder menos agua.</p>
   <div class="kv"><div><small>Riego esta semana</small><b>${num(semana,1)} m³</b></div><div><small>Ahorro por seguir el pronóstico</small><b>${num(Math.max(0,sinPron-semana),1)} m³</b></div>
   ${c.met.filter(k=>k!==met).slice(0,2).map(k=>`<div><small>Con ${METODOS[k].n.toLowerCase()} gastaría</small><b>${num(semana*ef/METODOS[k].ef*fLoc(c,k)/kr,1)} m³</b></div>`).join("")}</div>
   ${D.f!=="lluvia"&&(D.dia||D.total)?`<p class="hint">${D.dia?`Su fuente da ${num(D.dia,1)} m³ al día: ${semana/7>D.dia?`<b class="neg">no alcanza para el promedio de esta semana (${num(semana/7,1)} m³ al día).</b>`:"le alcanza esta semana."}`:`Su reservorio tiene ${num(D.total)} m³: ${semana>0?"le dura unos "+num(D.total/(semana/7))+" días a este ritmo.":"esta semana no necesita usarlo."}`}</p>`:""}
   <details class="como"><summary>¿Cómo se calculó?</summary><p>Cada día: lo que gasta el cultivo (evaporación del pronóstico, hoy ${num(hoy.et0,1)} mm, × Kc ${num(kc,2)}) menos el 80 % de la lluvia esperada. Lo que falta se divide por la eficiencia del sistema (${METODOS[met].n.toLowerCase()}, ${Math.round(ef*100)} %) y se multiplica por 10 m³ por cada milímetro y cada hectárea.</p></details></div>
  <div class="card"><h2>Próximos 7 días</h2><div class="dias">
   ${dias.map((x,i)=>`<div class="dia"><b>${i===0?"Hoy":fechaCorta(x.t)}</b>${num(x.max,0)}° / ${num(x.min,0)}°<div class="gota" aria-hidden="true"><i style="height:${Math.max(3,x.ll/maxLl*46)}px"></i></div>${num(x.ll,1)} mm<br><small>${x.pr!=null?x.pr+" % lluvia":""}</small><br><small>${x.neta>.5?"Riego "+num(x.m3,1)+" m³":"Sin riego"}</small></div>`).join("")}
  </div><p class="hint">Barras azules: lluvia esperada en milímetros. Pronóstico de Open-Meteo.</p></div>`;
  const rec=recomendacionesPronostico(dias);
  h+=htmlRecomendaciones(rec,"Recomendaciones para esta semana");
  return h;
}
// Dos listas (agricultor y ganadero) con un punto de color: verde = bueno, ocre = ojo, rojo = no lo haga
const htmlRecomendaciones=(rec,titulo)=>`<div class="card"><h2>${titulo}</h2><h3>Para el cultivo</h3><ul class="recs">${rec.agri.map(x=>`<li class="${x.n}"><i></i><span>${x.t.charAt(0).toUpperCase()+x.t.slice(1)}</span></li>`).join("")}</ul><h3>Para el ganado</h3><ul class="recs">${rec.gan.map(x=>`<li class="${x.n}"><i></i><span>${x.t.charAt(0).toUpperCase()+x.t.slice(1)}</span></li>`).join("")}</ul></div>`;

// ---------- Pestañas: Hoy, 16 días, Mes, Trimestre, Semestre y Año ----------
let clModo="hoy",climaJ=null,climaGuardado=null,cargandoNormales=false;
const PERIODOS={mes:1,trimestre:3,semestre:6,anio:12};
function pintarClima(j,guardado){climaJ=j;climaGuardado=guardado;renderClima();}
function renderClima(){
  document.querySelectorAll("[data-cl]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.cl===clModo));
  if(clModo!=="hoy"&&clModo!=="dias"){renderPeriodo();return;}
  if(!climaJ)return;
  const out=$("climaOut");
  if(clModo==="hoy"){out.innerHTML=htmlHoy(climaJ,climaGuardado);if(typeof animarClima==="function")animarClima(out,(climaJ.current||{}).weather_code);}
  else{out.innerHTML=htmlDias(climaJ,climaGuardado);}
}
function htmlDias(j,guardado){
  const R=contextoRiego(),dias=diasRiego(j,16,R),tot=dias.reduce((s,x)=>s+x.ll,0),llov=dias.filter(x=>x.ll>=1).length,calor=dias.reduce((a,x)=>x.max>a.max?x:a,dias[0]),riego=dias.reduce((s,x)=>s+x.m3,0),maxLl=Math.max(5,...dias.map(x=>x.ll));
  const f=t=>new Date(t+"T12:00:00").toLocaleDateString("es-CO",{weekday:"short",day:"numeric",month:"short"}).replace(".","").replace(",","");
  $("cPara").textContent=`Próximos 16 días. Riego calculado para ${R.c.n.toLowerCase()}, ${num(R.ha,1)} ha, ${METODOS[R.met].n.toLowerCase()}.`;
  return `${guardado?`<div class="aviso agua">Sin conexión: pronóstico guardado el ${new Date(guardado).toLocaleString("es-CO",{day:"numeric",month:"short",hour:"numeric",minute:"2-digit"})}.</div>`:""}
  <div class="card agua"><h2>Resumen de 16 días</h2><div class="kv"><div><small>Lluvia esperada</small><b>${num(tot)} mm</b></div><div><small>Días con lluvia</small><b>${llov} de ${dias.length}</b></div><div><small>Día más caliente</small><b>${num(calor.max,0)} °C (${f(calor.t)})</b></div><div><small>Riego necesario</small><b>${num(riego,1)} m³</b></div></div>
   <p class="hint">Pasados 7 días el pronóstico pierde precisión: use los días lejanos como idea general y mire cada mañana el de hoy. Datos de Open-Meteo.</p></div>
  <div class="card"><h2>Día por día</h2><ul class="dias16">${dias.map((x,i)=>`<li><b>${i===0?"Hoy":f(x.t)}</b><span class="d16t">${num(x.max,0)}° / ${num(x.min,0)}°</span><span class="d16b"><i style="width:${Math.max(2,x.ll/maxLl*100)}%"></i></span><span class="d16l">${num(x.ll,1)} mm</span><small>${x.pr!=null?x.pr+" %":""}</small></li>`).join("")}</ul>
   <p class="hint">La barra azul es la lluvia esperada y el porcentaje la probabilidad de que llueva.</p></div>`
   +htmlRecomendaciones(recomendacionesPronostico(dias),"Recomendaciones para los próximos días");
}

// ---------- Años pasados (clima típico del lugar, datos reales de Open-Meteo) ----------
const urlNormales=U=>{const y=new Date().getFullYear();return `https://archive-api.open-meteo.com/v1/archive?latitude=${U.lat}&longitude=${U.lon}&start_date=${y-10}-01-01&end_date=${y-1}-12-31&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,et0_fao_evapotranspiration&timezone=America%2FBogota`;};
const claveNormales=U=>`siembro:normales:${U.lat.toFixed(2)},${U.lon.toFixed(2)}`;
function leerNormales(U){try{const g=JSON.parse(localStorage.getItem(claveNormales(U))||"null");return g&&g.meses&&g.meses.length===12?g:null;}catch(e){return null;}}
// Baja 10 años de datos diarios una sola vez por lugar y guarda el resumen de 12 meses (pesa muy poco). Devuelve el resumen o null.
async function cargarNormales(U){
  const g=leerNormales(U);if(g)return g;if(!navigator.onLine)return null;
  try{const r=await fetch(urlNormales(U));if(!r.ok)throw new Error(r.status);const j=(await r.json()).daily;
    const meses=resumenClimatico(j.time,j.precipitation_sum,j.temperature_2m_max,j.temperature_2m_min,j.et0_fao_evapotranspiration);
    if(meses.some(m=>m.mm==null))return null;
    const y=new Date().getFullYear(),o={t:Date.now(),y0:y-10,y1:y-1,meses};
    try{localStorage.setItem(claveNormales(U),JSON.stringify(o));}catch(e){}return o;}catch(e){return null;}
}
// Los 12 meses típicos del lugar: reales si ya se bajaron; si no, aproximados con el perfil de la región.
function mesesDelLugar(){const U=lugarClima(),g=U&&leerNormales(U);
  return g?{meses:g.meses,real:true,y0:g.y0,y1:g.y1}:{meses:mesesAproximados(lugar()),real:false};}
// Baja los datos en segundo plano para que el calendario y la ganadería usen datos reales
async function precargarNormales(){const U=lugarClima();if(!U||leerNormales(U))return;
  if(await cargarNormales(U)&&typeof vistaActual!=="undefined"&&["cuando","ganaderia","clima","inicio"].includes(vistaActual))pintarVista(vistaActual);}

function renderPeriodo(){
  const out=$("climaOut"),U=lugarClima();
  if(!U){out.innerHTML=`<div class="empty"><h2>Elija un municipio o use su ubicación</h2></div>`;return;}
  if(!leerNormales(U)&&!cargandoNormales){
    cargandoNormales=true;out.innerHTML=`<div class="empty"><h2>Buscando el clima de años pasados…</h2><p>Se baja una sola vez para este lugar y queda guardado en el celular.</p></div>`;
    cargarNormales(U).finally(()=>{cargandoNormales=false;if(clModo!=="hoy"&&clModo!=="dias")$("climaOut").innerHTML=htmlPeriodo(PERIODOS[clModo]);});return;}
  if(cargandoNormales)return;
  out.innerHTML=htmlPeriodo(PERIODOS[clModo]);
}
const NOM_PER={1:"Este mes",3:"Los próximos 3 meses",6:"Los próximos 6 meses",12:"Todo el año"};
function htmlPeriodo(n){
  const D=mesesDelLugar(),R=contextoRiego(),c=R.c,L=lugar(),hoy=new Date().getMonth(),ms=periodoMeses(D.meses,hoy,n),idx=ms.map(x=>x.m);
  const llu=ms.reduce((s,x)=>s+x.mm,0),tm=ms.reduce((s,x)=>s+x.t,0)/n,bal=ms.map(x=>balanceMes(c,x)),falta=bal.reduce((s,b)=>s+b.falta,0),mx=Math.max(...ms.map(x=>x.max??x.mm),1);
  const cult=calendarioSiembra(c,L,false,D.meses.map(x=>x.mm));
  $("cPara").textContent=`${NOM_PER[n]}: ${rangoMeses(idx)}. Calculado para ${c.n.toLowerCase()}.`;
  const nota=D.real?`Promedio real de ${D.y1-D.y0+1} años (${D.y0} a ${D.y1}) en ${U_nombre()}. Datos de Open-Meteo.`:`<b>Aproximado:</b> sin conexión no se pudo bajar el clima real de este lugar; se usa la lluvia anual repartida como llueve en su región. Con conexión se actualiza solo.`;
  let h=`<div class="card agua"><h2>${n===1?MESES[hoy].replace(/^./,x=>x.toUpperCase()):NOM_PER[n]}</h2>
   <div class="kv"><div><small>Lluvia ${n===1?"típica":"típica en total"}</small><b>${num(llu)} mm</b></div><div><small>Temperatura</small><b>${num(tm,0)} °C</b></div><div><small>Agua que falta para ${c.n.toLowerCase()}</small><b>${falta>5?num(falta*10)+" m³/ha":"Ninguna"}</b></div></div>
   <div class="lluvia chico">${ms.map(x=>`<span><b>${num(x.mm)}</b><i style="height:${Math.round(x.mm/mx*100)}%" class="${indiceForraje(x)<.5?"seco":""}"></i><small>${MES3[x.m]}</small></span>`).join("")}</div>
   <p class="hint">Barras: milímetros de lluvia por mes. Rojas: meses de poca lluvia, cuando el pasto crece poco. ${nota}</p></div>`;
  h+=`<div class="card"><h2>Mes por mes</h2><div class="scroll"><table><thead><tr><th>Mes</th><th>Lluvia</th><th>Falta (cultivo)</th><th>Pasto</th></tr></thead><tbody>${ms.map((x,i)=>{const ip=indiceForraje(x);return `<tr><td>${MESES[x.m]}</td><td>${num(x.mm)} mm${D.real?`<br><small>entre ${num(x.min)} y ${num(x.max)}</small>`:""}</td><td class="${bal[i].falta>20?"neg":""}">${bal[i].falta>20?num(bal[i].falta)+" mm":"—"}</td><td>${ip>=1?"Abundante":ip>=.5?"Normal":"Poco"}</td></tr>`}).join("")}</tbody></table></div>
   ${D.real?`<p class="hint">"Entre" muestra la lluvia más baja y la más alta de esos años: un año cualquiera puede ser mucho más seco o más lluvioso que el promedio, sobre todo con El Niño (llueve menos) y La Niña (llueve más).</p>`:""}</div>`;
  h+=htmlRecomendaciones(recomendacionesPeriodo(ms,c),n===1?"Recomendaciones del mes":"Recomendaciones para este período");
  if(n>=6){
    h+=`<div class="card"><h2>Para planear el año</h2><h3>¿Cuándo sembrar ${c.n.toLowerCase()}?</h3>${barraCal(cult.meses)}${leyendaCal}
     <p>${cult.climaNo?`${c.n} no se da bien en ${U_nombre()}.`:cult.ideal?`Mejor época sin riego: <b>${rangoMeses(cult.mejores)}</b>.`:`Sin riego ningún mes es ideal. Con riego puede sembrar casi todo el año.`}</p>
     <h3>¿Cuánto pasto va a tener el ganado?</h3>${barraCal(D.meses.map(x=>{const i=indiceForraje(x);return i>=1?2:i>=.5?1:0;}))}<div class="leyenda"><span><i class="m2"></i>Abundante</span><span><i class="m1"></i>Normal</span><span><i class="m0"></i>Poco</span></div>
     <p class="hint">Guarde silo o heno en los meses de abundancia para los meses de poco pasto.</p></div>`;}
  return h;
}
const U_nombre=()=>{const U=lugarClima();return U?U.nombre:"su lugar";};
document.addEventListener("click",e=>{const b=e.target.closest("[data-cl]");if(b){clModo=b.dataset.cl;renderClima();}});
$("actClima").onclick=()=>cargarClima(true);
$("miUbic").onclick=()=>{if(!navigator.geolocation){alert("Su celular no permite compartir la ubicación.");return;}
  $("miUbic").textContent="Buscando…";
  navigator.geolocation.getCurrentPosition(p=>{const la=p.coords.latitude,lo=p.coords.longitude;
    const cerca=MUN.map(m=>({m,d:Math.hypot(m[7]-la,m[8]-lo)})).sort((a,b)=>a.d-b.d)[0].m;
    $("dep").value=cerca[0];llenarMun();$("mun").value=cerca[1];mostrarClima();
    ubicPropia={lat:+la.toFixed(3),lon:+lo.toFixed(3),nombre:`su ubicación (cerca de ${cerca[1]})`};
    $("miUbic").textContent="Usar mi ubicación";cargarClima(true);},
    ()=>{$("miUbic").textContent="Usar mi ubicación";alert("No se pudo obtener la ubicación. Revise el permiso de ubicación del navegador.");},{enableHighAccuracy:false,timeout:15000,maximumAge:600000});};
["cul","met","area","fuente","qLs","horas","vol","m3mes"].forEach(i=>$(i).addEventListener("change",()=>{climaCargado=null;}));

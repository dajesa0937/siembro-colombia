// Siembro Colombia — pronóstico Open-Meteo y recomendación de riego diaria
// Archivo cargado como script clásico: las constantes y funciones quedan globales y las usan los demás archivos.

// ---------- Clima (Open-Meteo, gratis y sin clave) ----------
const WMO={0:"Despejado",1:"Mayormente despejado",2:"Parcialmente nublado",3:"Nublado",45:"Niebla",48:"Niebla",51:"Llovizna débil",53:"Llovizna",55:"Llovizna fuerte",61:"Lluvia débil",63:"Lluvia moderada",65:"Lluvia fuerte",80:"Chubascos",81:"Chubascos fuertes",82:"Aguaceros muy fuertes",95:"Tormenta eléctrica",96:"Tormenta con granizo",99:"Tormenta con granizo"};
function lugarClima(){if(ubicPropia)return ubicPropia;const L=lugar();if(L.lat==null)return null;return{lat:L.lat,lon:L.lon,nombre:`${L.mun}, ${L.dep}`};}
async function cargarClima(forzar){
  const U=lugarClima();
  if(!U){$("climaOut").innerHTML=`<div class="empty"><h2>Elija un municipio o use su ubicación</h2><p>Para "Otro lugar" toque "Usar mi ubicación" y la app busca el pronóstico de donde está.</p></div>`;$("cLugar").textContent="Clima";return;}
  const key=`siembro:clima:${U.lat.toFixed(2)},${U.lon.toFixed(2)}`;
  if(!forzar&&climaCargado===key)return;
  $("cLugar").textContent="Clima en "+U.nombre;
  const url=`https://api.open-meteo.com/v1/forecast?latitude=${U.lat}&longitude=${U.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration&timezone=America%2FBogota&forecast_days=7`;
  try{const r=await fetch(url);if(!r.ok)throw new Error(r.status);const j=await r.json();
    try{localStorage.setItem(key,JSON.stringify({t:Date.now(),j}));}catch(e){}
    climaCargado=key;pintarClima(j,null);}
  catch(e){let g=null;try{g=JSON.parse(localStorage.getItem(key)||"null");}catch(_){}
    if(g){climaCargado=key;pintarClima(g.j,g.t);}
    else $("climaOut").innerHTML=`<div class="empty"><h2>No se pudo traer el clima</h2><p>Revise la conexión a internet y toque "Actualizar". Cuando cargue una vez, queda guardado para verlo sin señal.</p></div>`;}
}
function pintarClima(j,guardado){
  const P=leerForm(),c=C[P.k],L=P.L,ha=P.ha,A=agua(c,L,ha);
  const met=(P.met!=="mejor"&&c.met.includes(P.met))?P.met:A.mejor,ef=METODOS[met].ef;
  const kc=c.kc*(c.perc||1),kr=fLoc(c,met),D=P.D,d=j.daily,cur=j.current||{};
  $("cPara").textContent=`Riego calculado para ${c.n.toLowerCase()}, ${num(ha,1)} ha, ${METODOS[met].n.toLowerCase()}. Puede cambiarlo en Calcular.`;
  const dias=d.time.map((t,i)=>{const et0=d.et0_fao_evapotranspiration[i]||0,ll=d.precipitation_sum[i]||0,pr=d.precipitation_probability_max?d.precipitation_probability_max[i]:null;
    const neta=Math.max(0,kc*et0-.8*ll);return{t,et0,ll,pr,max:d.temperature_2m_max[i],min:d.temperature_2m_min[i],neta,m3:neta*kr/ef*10*ha};});
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
  $("climaOut").innerHTML=h;
  if(typeof animarClima==="function")animarClima($("climaOut"),cur.weather_code);
}
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

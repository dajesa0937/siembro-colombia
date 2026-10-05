// Siembro Colombia — pantallas: Cultivos, ¿Cuándo sembrar?, Semillas, Agua y riego, Abonos, Ganadería, Finanzas, Historial y Más
// Archivo cargado como script clásico: las constantes y funciones quedan globales y las usan los demás archivos.
// Las cuentas están en calculos.js; aquí solo se arma lo que ve la persona.

// ---------- Íconos ----------
const SV={
  home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  hoja:'<path d="M12 21V11"/><path d="M12 13c-4 0-6-2-6-6 4 0 6 2 6 6z"/><path d="M12 11c0-4 2-6 6-6 0 4-2 6-6 6z"/><path d="M5 21h14"/>',
  vaca:'<path d="M5 8C3 8 2 7 2 5c2 0 3 1 3 3zM19 8c2 0 3-1 3-3-2 0-3 1-3 3z"/><path d="M6 8h12l1 6c0 4-3 7-7 7s-7-3-7-7z"/><circle cx="9.5" cy="13" r=".6"/><circle cx="14.5" cy="13" r=".6"/><ellipse cx="12" cy="17.5" rx="3" ry="2"/>',
  barras:'<path d="M4 20V11M10 20V4M16 20v-7M2 20h20"/>',
  mas:'<circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/>',
  gota:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  calendario:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  abono:'<path d="M7 8h10l2 12H5z"/><path d="M9 8c0-2.5 1-5 3-5s3 2.5 3 5"/><path d="M9 14h6"/>',
  nube:'<path d="M7 15a4 4 0 1 1 .9-7.9A5 5 0 0 1 17.5 8 3.5 3.5 0 0 1 17 15z"/><path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2"/>',
  foto:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 9"/>',
  libro:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/><path d="M9 8h6M9 12h6"/>',
  reloj:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  atras:'<path d="M15 5l-7 7 7 7"/>'
};
function pintarIconos(root=document){root.querySelectorAll("[data-ico]:not([data-hecho])").forEach(e=>{e.innerHTML=SVG_BASE(SV[e.dataset.ico]||"");e.dataset.hecho="1";});}

// ---------- Qué se pinta al abrir cada pantalla ----------
function pintarVista(t){
  pintarIconos();pintarChips();
  ({cultivos:pintarCultivos,ganaderia:pintarGanaderia,finanzas:pintarFinanzas,calc:pintarCalc,cuando:pintarCuando,semillas:pintarSemillas,
    riego:pintarRiego,abonos:pintarAbonos,fichas:pintarFicha,historial:pintarHistorial,inicio:pintarInicio,
    clima:()=>{if(climaJ)renderClima();cargarClima();},guia:()=>cargarFotos($("tab-guia"))})[t]();
}
function pintarChips(){const h=`${PIN_SVG}<b>${lugarTxt()}</b><button type="button" class="sec" data-cambiar>Cambiar lugar</button>`;
  document.querySelectorAll("[data-lugar],#lugarCalc").forEach(e=>{e.innerHTML=h;});}
const seg=(sel,attr,val)=>document.querySelectorAll(sel).forEach(b=>b.setAttribute("aria-pressed",b.dataset[attr]===val));
const sueloTxt=()=>$("suelo").selectedOptions[0].text.split(" (")[0].toLowerCase();

// ---------- Cultivos: los más rentables ----------
let rentModo="zona",topActual=[];
function pintarCultivos(){
  const x=contextoZona(),z=ZONAS[ZMUN[x.L.mun]];
  seg("[data-rent]","rent",rentModo);$("rentSueloBox").hidden=rentModo!=="suelo";
  if(!$("rentSuelo").options.length)$("rentSuelo").innerHTML=$("suelo").innerHTML;$("rentSuelo").value=$("suelo").value;
  topActual=topCultivos(x.L,{ha:1,suelo:x.suelo,ph:x.ph,D:x.D,grupo:"agr",uso:"ceba",n:5});
  const aguaTxt=x.D.f==="lluvia"?"solo lluvia":"su fuente de agua";
  $("topPara").textContent=rentModo==="zona"?`Para ${lugarTxt()}${z?" ("+z.n+")":""}, con suelo ${sueloTxt()} y ${aguaTxt}. Si su suelo es otro, toque "Por tipo de suelo".`
    :`Para suelo ${sueloTxt()} en ${lugarTxt()} y ${aguaTxt}. Cambie el tipo de suelo y la lista se actualiza.`;
  $("top5").innerHTML=listaTop(topActual,t=>`${Math.round(t.apt.total*100)} % apto, ${MODOS[t.modo].toLowerCase()}`)||
    `<li class="hint">Con este suelo, clima y agua ningún cultivo de la lista sale claramente rentable. Pruebe otro suelo o fuente de agua en la calculadora.</li>`;
  $("verAnalisis").hidden=!topActual.length;
  cargarMiniaturas($("top5"));
}
function listaTop(top,sub){return top.map((t,i)=>`<li><button type="button" data-k="${t.k}"><span class="n">${i+1}</span><span class="th" data-mini="${(FICHA[t.k]?FICHA[t.k].w:[t.c.n]).join("|")}" data-alt="${t.c.n}">${HOJA_SVG}</span><span class="t"><b>${t.c.n}</b><small>${sub(t)}</small></span><span class="g">${millones(t.prom)}<small>por año por ha</small></span></button></li>`).join("");}

// ---------- Ganadería ----------
let ganModo="pasto",gEst={k:null,ha:5,uso:"ceba"};
function pintarGanaderia(){
  seg("[data-gan]","gan",ganModo);$("ganPasto").hidden=ganModo!=="pasto";$("ganGanado").hidden=ganModo!=="ganado";
  if(ganModo==="pasto")pintarPasto();else pintarGanado();
}
function pintarPasto(){
  const x=contextoZona(),top=mejorDe("for",4,"ceba"),pas=top.find(t=>t.c.tipo==="pasto"),r=rotacion(x.L);
  let h=`<p class="lugar-chip" data-lugar></p><div class="card"><h2>Pasto recomendado</h2>`;
  if(pas){const c=pas.c;
    h+=`${fig(FICHA[pas.k].w,c.n,"grande")}<p><b>${c.n}</b> es el que mejor le sale en ${lugarTxt()}: ${Math.round(pas.apt.total*100)} % apto${pas.modo!=="trad"?" con riego":""}.</p>
     <div class="kv"><div><small>Forraje al año</small><b>${num(c.y,0)} t materia seca/ha</b></div><div><small>Aguanta</small><b>${num(pas.F.ugg,1)} animales/ha</b></div><div><small>Variedades</small><b>${c.v.slice(0,3).join(", ")}</b></div></div><p>${c.nota}</p>`;
  }else h+=`<p>Con este suelo, clima y agua ningún pasto de la lista sale claramente rentable. Revise el agua para el verano o pruebe forraje para silo.</p>`;
  h+=`</div>`;
  if(top.length)h+=`<div class="card"><h2>Pastos y forrajes que le sirven</h2><ol class="top5" id="topPasto">${listaTop(top,t=>t.c.tipo==="pasto"?`${num(t.F.ugg,1)} animales por ha`:"forraje para silo y verano")}</ol><p class="hint">Ganancia promedio por año y por hectárea, sin contar la compra de animales. Toque uno para ver las cuentas.</p></div>`;
  const D=mesesDelLugar(),ind=D.meses.map(indiceForraje),flacos=D.meses.filter((m,i)=>ind[i]<.5).map(m=>m.m);
  h+=`<div class="card"><h2>Pasto durante el año</h2>${barraCal(ind.map(i=>i>=1?2:i>=.5?1:0))}<div class="leyenda"><span><i class="m2"></i>Abundante</span><span><i class="m1"></i>Normal</span><span><i class="m0"></i>Poco</span></div>
    <p>${flacos.length?`Meses de poco pasto: <b>${rangoMeses(flacos)}</b>. Guarde silo o heno antes y baje la carga de animales.`:"Su zona tiene lluvia para que el pasto crezca todo el año."}</p><button type="button" class="sec" data-ir="clima">Ver el clima mes a mes</button>
    <p class="hint">${D.real?`Con la lluvia real de ${D.y1-D.y0+1} años.`:"Aproximado; con conexión se actualiza con datos reales."}</p></div>`;
  h+=`<div class="card"><h2>Manejo y rotación</h2>
    <div class="kv"><div><small>Días en cada potrero</small><b>${r.ocup} días</b></div><div><small>Descanso del pasto</small><b>${r.rango[0]} a ${r.rango[1]} días</b></div><div><small>Potreros que necesita</small><b>${r.potreros}</b></div></div>
    <p>Divida el lote en <b>${r.potreros} potreros</b> con cerca eléctrica o alambre. Los animales pasan ${r.ocup} días en cada uno y vuelven cuando el pasto descansó entre ${r.rango[0]} y ${r.rango[1]} días.</p>
    <p class="hint">Guía general para su clima${x.L.dry>=3?`, con ${x.L.dry} meses secos (el pasto rebrota más despacio)`:""}. Mire el pasto: el animal debe entrar cuando ya recuperó y salir dejándole hojas para que rebrote.</p></div>
    <div class="card agua"><h2>Consejo ganadero</h2><ul class="tight"><li><b>No sobrecargue:</b> con más animales de los que aguanta, el pasto se acaba y el suelo se compacta.</li>
    <li><b>Guarde comida para el verano:</b> silo de maíz o sorgo, o heno, para los meses secos${x.L.dry>=3?" (en su zona son "+x.L.dry+")":""}.</li>
    <li><b>Agua limpia siempre:</b> un bebedero en cada potrero o cerca. Un animal adulto toma unos 50 litros al día.</li>
    <li><b>Sombra y sal:</b> árboles en el potrero y sal mineralizada todo el año.</li></ul></div>`;
  $("ganPasto").innerHTML=h;pintarChips();cargarFotos($("ganPasto"));cargarMiniaturas($("ganPasto"));
}
function pintarGanado(){
  const pastos=Object.keys(C).filter(k=>C[k].tipo==="pasto");
  if(!gEst.k||!C[gEst.k]){const m=mejorDe("for",1,"ceba","pasto")[0];gEst.k=m?m.k:pastos[0];}
  $("ganGanado").innerHTML=`<p class="lugar-chip" data-lugar></p><div class="card"><h2>¿Cuántos animales aguanta su lote?</h2>
    <label for="gPas">Pasto</label><select id="gPas">${pastos.map(k=>`<option value="${k}"${k===gEst.k?" selected":""}>${C[k].n}</option>`).join("")}</select>
    <div class="row2"><div><label for="gHa">Área (hectáreas)</label><input id="gHa" type="number" min="0.1" step="0.1" value="${gEst.ha}" inputmode="decimal"></div>
    <div><label for="gUso">Para qué</label><select id="gUso"><option value="ceba"${gEst.uso==="ceba"?" selected":""}>Ceba (carne)</option><option value="leche"${gEst.uso==="leche"?" selected":""}>Leche</option></select></div></div></div>
    <div id="gRes"></div>`;
  pintarChips();calcGanado();
}
function calcGanado(){
  const x=contextoZona(),{k,ha,uso}=gEst,R=evaluar(k,x.L,ha,x.suelo,x.ph,"trad","mejor",false,uso,{f:"lluvia",dia:0}),{c,F,v}=R,ult=F.filas[F.H],ugg=F.ugg,vacas=ugg*.75;
  $("gRes").innerHTML=`<div class="verdict ${v.k}"><div class="stamp">${v.t}</div><p>${v.why}</p>
    <div class="big"><div><b>${num(ugg,0)}</b><small>Animales de 450 kg que aguanta (${num(ugg/ha,1)} por ha)</small></div>
    ${uso==="leche"?`<div><b>${num(vacas*c.leche)} L</b><small>Leche por día con ${num(vacas,0)} vacas en ordeño</small></div>`:`<div><b>${num(ugg*c.gdp*365)} kg</b><small>Carne por año (${num(c.gdp*1000)} g por animal al día)</small></div>`}
    <div><b>${num(ugg*50)} L</b><small>Agua para beber al día</small></div>
    <div><b>${millones(ult.ing)}</b><small>Ingresos por año</small></div><div><b>${millones(ult.cos)}</b><small>Costos por año</small></div>
    <div><b class="${F.anual<0?"neg":""}">${millones(F.anual)}</b><small>Utilidad por año</small></div></div></div>
    <div class="card"><p>Compra de animales (no incluida en las cuentas): unos ${millones(uso==="leche"?vacas*4.5e6:ugg*250*(+c.pCarne||0)*1.05)}.</p>
    <details class="como"><summary>¿Cómo se calculó?</summary><p>${num(c.y,1)} t de materia seca por hectárea × 60 % que aprovechan los animales ÷ 3.650 kg que come un animal de 450 kg al año = ${num(c.y*1000*.6/3650,1)} animales por hectárea, con el pasto en su punto y solo con lluvia. En pastos sin manejo la carga real es de 0,8 a 1 animal por hectárea. ${uso==="leche"?`Se cuentan 75 % de vacas en ordeño con ${c.leche} litros al día durante 305 días.`:""}</p></details>
    <button type="button" class="sec" data-k="${k}" id="gCalc">Ver cuentas completas con el pasto</button></div>`;
}

// ---------- ¿Cuándo sembrar? ----------
let cuModo="cultivo";
const MES3=MESES.map(m=>m.slice(0,3));
const ETIQ=["No recomendado","Posible","Ideal"];
const barraCal=v=>`<div class="cal" role="img" aria-label="${v.map((x,i)=>MESES[i]+": "+ETIQ[x].toLowerCase()).join(", ")}">${v.map((x,i)=>`<span class="m${x}"><i></i><small>${MES3[i]}</small></span>`).join("")}</div>`;
const leyendaCal='<div class="leyenda"><span><i class="m2"></i>Ideal</span><span><i class="m1"></i>Posible</span><span><i class="m0"></i>No recomendado</span></div>';
function climaRegion(r){const f=MUN.filter(m=>m[2]===r),a=i=>f.reduce((s,m)=>s+m[i],0)/f.length;return{reg:r,alt:a(3),t:a(4),r:a(5),dry:Math.round(a(6))};}
function pintarCuando(){
  seg("[data-cu]","cu",cuModo);const k=$("cuCul").value||$("cul").value,c=C[k],L=lugar(),D=mesesDelLugar(),mmr=D.meses.map(x=>x.mm),sin=calendarioSiembra(c,L,false,mmr),con=calendarioSiembra(c,L,true,mmr);
  let h="";
  if(cuModo==="cultivo"){
    h+=`<div class="card"><h2>${c.n}</h2><h3>Solo con lluvia</h3>${barraCal(sin.meses)}<h3>Con riego</h3>${barraCal(con.meses)}${leyendaCal}</div>`;
    h+=`<div class="card"><h2>Mejor época para sembrar</h2>`;
    if(sin.climaNo)h+=`<div class="aviso no">${c.n} no se da bien en ${lugarTxt()}.<span>La altura (${num(L.alt)} msnm) o la temperatura (${L.t} °C) no le sirven a este cultivo. Ni con riego se recomienda.</span></div>`;
    else if(c.soloRiego)h+=`<div class="aviso agua">${c.n} necesita riego todo el año.<span>Si tiene agua segura, siembre en ${rangoMeses(con.mejores)||"cualquier mes"}.</span></div>`;
    else if(sin.ideal)h+=`<div class="aviso ok">${rangoMeses(sin.mejores)}.<span>En esos meses la lluvia de los meses siguientes alcanza para el cultivo${c.tipo==="cic"?`, que dura unos ${c.meses} meses`:" mientras pega y arranca"}.</span></div>`;
    else h+=`<div class="aviso agua">Sin riego ningún mes tiene lluvia suficiente.<span>Con riego siembre en ${rangoMeses(con.mejores)||"el mes que prefiera"}. Si no tiene agua, es mejor otro cultivo.</span></div>`;
    h+=`<p><b>Consejo:</b> ${c.tipo==="cic"?"siembre cuando empiezan las lluvias para que la semilla nazca con agua, y planee que la cosecha caiga en verano para que el grano se seque bien.":c.tipo==="pasto"?"siembre al empezar las lluvias, con el suelo ya húmedo, y no deje entrar los animales hasta que el pasto pegue bien.":"los árboles se siembran al empezar las lluvias para que peguen bien; en verano necesitan riego los primeros meses."}</p>
     <p class="hint">Es una guía con la lluvia típica de su zona${D.real?" (datos reales de "+(D.y1-D.y0+1)+" años)":" (aproximada)"}. Cada año el clima cambia: confirme con la UMATA y con sus vecinos antes de sembrar.</p></div>`;
    h+=`<button type="button" class="go" data-k="${k}" id="cuCalc">Calcular si conviene sembrar ${c.n.toLowerCase()}</button>`;
  }else if(cuModo==="clima"){
    const mm=mmr,mx=Math.max(...mm),hoy=new Date().getMonth(),prom=mm.reduce((a,b)=>a+b,0)/12;
    const ord=[...mm.keys()].sort((a,b)=>mm[b]-mm[a]),lluv=ord.slice(0,3).sort((a,b)=>a-b),seco=ord.slice(-3).sort((a,b)=>a-b);
    const ahora=Object.keys(C).filter(x=>C[x].g==="agr").map(x=>({x,r:calendarioSiembra(C[x],L,false,mmr)})).filter(o=>o.r.meses[hoy]===2);
    h+=`<div class="card"><h2>Lluvia mes a mes en ${lugarTxt()}</h2><div class="lluvia">${mm.map((v,i)=>`<span class="${i===hoy?"hoy":""}"><b>${num(v)}</b><i style="height:${Math.round(v/mx*100)}%" class="${v<prom*.6?"seco":""}"></i><small>${MES3[i]}</small></span>`).join("")}</div>
      <p>Meses más lluviosos: <b>${rangoMeses(lluv)}</b>. Meses más secos: <b>${rangoMeses(seco)}</b>.</p>
      <p class="hint">Milímetros de lluvia por mes. ${D.real?`Promedio real de ${D.y1-D.y0+1} años (${D.y0} a ${D.y1}), de Open-Meteo.`:`Aproximado: su lluvia anual repartida como llueve normalmente en ${REG[L.reg]}. Con conexión se reemplaza por datos reales.`} Las barras rojas son meses secos. Para más detalle vea Clima.</p></div>
      <div class="card"><h2>Qué se puede sembrar en ${MESES[hoy]}</h2>${ahora.length?`<p>Sin riego, con la lluvia que viene, este mes es ideal para:</p><div class="chips">${ahora.map(o=>`<button type="button" class="sec" data-cuk="${o.x}">${C[o.x].n}</button>`).join("")}</div>`:`<p>Este mes no es ideal para ningún cultivo de la lista sin riego. Con riego sí puede sembrar: mire cada cultivo en "Por cultivo".</p>`}</div>`;
  }else{
    h+=`<div class="card"><h2>${c.n} en cada región</h2>${Object.keys(REG).map(r=>{const R=climaRegion(r),cal=calendarioSiembra(c,R,false);
      return `<div class="fila-reg"><b>${REG[r]}</b>${cal.climaNo?`<p class="hint">No se da bien en la mayor parte de esta región.</p>`:barraCal(cal.meses)}</div>`;}).join("")}${leyendaCal}
      <p class="hint">Es el promedio de los municipios de cada región que trae la app; dentro de una región la altura cambia mucho. Para su finca use "Por cultivo".</p></div>`;
  }
  $("cuandoOut").innerHTML=h;
}

// ---------- Semillas ----------
function pintarSemillas(){
  const k=$("seCul").value||$("cul").value,c=C[k],F=FICHA[k],ha=Math.max(.1,+$("area").value||1);
  let h=`<div class="card"><h2>${c.n}</h2>${fig(F.w,c.n,"grande")}
    <div class="kv"><div><small>Semilla por hectárea</small><b>${num(c.dens)} ${c.u}</b></div><div><small>Precio aproximado</small><b>${cop(c.pS)} c/u</b></div><div><small>Costo por hectárea</small><b>${millones(c.dens*c.pS)}</b></div><div><small>Distancia de siembra</small><b>${F.dist?`${num(F.dist[0],2)} × ${num(F.dist[1],2)} m`:"según el manejo"}</b></div></div></div>`;
  h+=`<h2 class="sec-t">Variedades que se usan en Colombia</h2><div class="vars">${c.v.map((v,i)=>`<div class="card var"><span class="ci" data-ico="hoja"></span><div><b>${v}</b><small>${num(c.dens*ha)} ${c.u} para ${num(ha,1)} ha · ${millones(c.dens*c.pS*ha)}</small></div><button type="button" class="sec" data-var="${i}">Usar en el cálculo</button></div>`).join("")}</div>`;
  h+=`<div class="card agua"><h3 style="margin-top:0">Dónde conseguir la semilla</h3><p>${c.d}</p><p><b>Compre siempre semilla certificada</b> con registro del ICA y pida la factura: una semilla mala le daña el cultivo entero.</p>
    <p class="hint">La app no tiene datos de rendimiento de cada variedad: pregunte en la UMATA, en Agrosavia o al gremio cuál se da mejor en su zona. Para cambiar el área, use la calculadora.</p></div>`;
  $("semOut").innerHTML=h;pintarIconos($("semOut"));cargarFotos($("semOut"));
}

// ---------- Agua y riego ----------
let rgModo="cultivos",nAni=20;
function pintarRiego(){
  seg("[data-rg]","rg",rgModo);$("rgSelBox").hidden=rgModo!=="cultivos";
  if(rgModo==="ganaderia"){
    $("riegoOut").innerHTML=`<div class="card agua"><h2>Agua para el ganado</h2><label for="nAni">Número de animales adultos</label><input id="nAni" type="number" min="1" value="${nAni}" inputmode="numeric">
      <div class="kv" id="aniKv"></div>
      <h3>Cómo ahorrar y cuidar el agua</h3><ul class="tight"><li>Bebederos con flotador: no se desperdicia ni se ensucia el agua.</li><li>Un bebedero en cada potrero evita que los animales caminen de más y dañen las orillas de la quebrada.</li><li>Cerque el nacimiento y la quebrada para que no entren a ensuciar el agua.</li><li>Un tanque grande y el agua por gravedad ahorran combustible y energía.</li><li>Recoja agua de lluvia del techo del establo o la sala de ordeño.</li></ul>
      <p class="hint">Un animal adulto toma unos 50 litros al día; una vaca en ordeño en tiempo caliente puede tomar bastante más. Revise que el bebedero siempre tenga agua.</p></div>`;
    calcAni();return;
  }
  const k=$("rgCul").value||$("cul").value,c=C[k],L=lugar(),suelo=$("suelo").value,A=agua(c,L,1),met=A.mejor,MT=METODOS[met],fr=frecuenciaRiego(c,L,suelo,met);
  const peor=[...c.met].sort((a,b)=>METODOS[a].ef-METODOS[b].ef)[0],ahorro=A.m[peor].volAnual-A.m[met].volAnual;
  let h=`<div class="card agua"><h2>Necesidad de agua</h2><div class="kv"><div><small>Gasta por día</small><b>${num(A.etc,1)} mm (${num(A.etc*10)} m³/ha)</b></div><div><small>Lluvia que le falta al año</small><b>${num(A.lam)} mm</b></div><div><small>¿Necesita riego?</small><b>${A.necesita?"Sí":"No"}</b></div></div>
    <p>${A.necesita?`En ${lugarTxt()} llueven ${num(L.r)} mm al año, con ${L.dry} ${L.dry===1?"mes seco":"meses secos"}. A ${c.n.toLowerCase()} le faltan unos ${num(A.lam)} mm: son ${num(A.lam*10)} m³ por hectárea que debe recibir de riego.`:`La lluvia de su zona alcanza para ${c.n.toLowerCase()}. Ponga drenajes para el invierno y deje el riego solo como seguro.`}</p></div>`;
  h+=`<div class="card"><h2>Frecuencia de riego</h2>${A.necesita?`<div class="kv"><div><small>Riegue cada</small><b>${fr.dias} ${fr.dias===1?"día":"días"}</b></div><div><small>Lámina de agua</small><b>${num(fr.bruto,1)} mm</b></div><div><small>Agua por hectárea</small><b>${num(fr.m3ha)} m³ cada riego</b></div></div>
    <p>Con suelo <b>${sueloTxt()}</b> y ${MT.n.toLowerCase()}. ${fr.gota?"El goteo se riega poco y seguido, para no dejar la raíz sin agua.":"Entre más arenoso el suelo, más seguido hay que regar."} Si llovió, espere: no riegue.</p>`:`<p>No hace falta regar de rutina. Si pasan más de dos semanas sin lluvia en época seca, revise el cultivo y riegue solo lo necesario.</p>`}
    <p class="hint">Es una guía: el suelo guarda unos ${AGUA_UTIL[suelo]} mm de agua al alcance de la raíz y la planta gasta ${num(fr.etc,1)} mm por día. Meta el dedo en el suelo: si a 10 cm está húmedo, no riegue.</p></div>`;
  h+=`<div class="card"><h2>Recomendaciones</h2><p><b>${MT.n}:</b> ${MT.txt}</p>
    <div class="scroll"><table><thead><tr><th>Sistema</th><th>Agua al año por ha</th><th>Inversión por ha</th></tr></thead><tbody>${c.met.map(m=>`<tr class="${m===met?"best":""}"><td>${METODOS[m].n}${m===met?" (ahorra más)":""}</td><td>${num(A.m[m].volAnual)} m³</td><td>${millones(METODOS[m].c)}</td></tr>`).join("")}</tbody></table></div></div>`;
  h+=`<div class="card"><h2>Ahorro de agua</h2>${A.necesita&&ahorro>0?`<div class="aviso ok">${num(ahorro)} m³ al año por hectárea.<span>Es lo que se ahorra con ${MT.n.toLowerCase()} frente a ${METODOS[peor].n.toLowerCase()}: ${Math.round(ahorro/A.m[peor].volAnual*100)} % menos agua.</span></div>`:`<div class="aviso ok">Su mayor ahorro es no regar.<span>La lluvia de su zona alcanza para este cultivo.</span></div>`}
    <ul class="tight"><li>Riegue en la madrugada o al atardecer: se evapora menos.</li><li>Cubra el suelo con paja, hojas o corteza (mulch): guarda la humedad.</li><li>Revise mangueras y llaves: una fuga pequeña pierde mucha agua al mes.</li></ul>
    <button type="button" class="sec" data-ir="clima">Ver el pronóstico de lluvia</button></div>`;
  $("riegoOut").innerHTML=h;
}
function calcAni(){const n=Math.max(1,+(($("nAni")||{}).value)||nAni);nAni=n;$("aniKv").innerHTML=`<div><small>Al día</small><b>${num(n*50)} L</b></div><div><small>Al mes</small><b>${num(n*50*30/1000,1)} m³</b></div><div><small>Al año</small><b>${num(n*50*365/1000)} m³</b></div>`;}

// ---------- Abonos ----------
function pintarAbonos(){
  const k=$("abCul").value||$("cul").value,c=C[k],ha=Math.max(.1,+$("area").value||1),d=dosisAbono(k,1),F=FICHA[k];
  const cuando=c.tipo==="cic"?"Aplique un tercio a la siembra y dos tercios entre 25 y 40 días después, con el suelo húmedo.":c.tipo==="pasto"?"Aplique después de cada pastoreo o al empezar las lluvias, repartido en 2 o 3 veces al año.":"Reparta el abono en 2 o 3 aplicaciones al año, al empezar las lluvias, alrededor de la planta (en la gotera del árbol).";
  const filas=[["Abono orgánico (compost o gallinaza descompuesta)","2 a 4 toneladas","Mejora el suelo y guarda la humedad. Cantidad general: ajústela según el cultivo y su suelo."],
    ["Urea (nitrógeno)",`${num(d.urea,1)} bultos de 50 kg`,`${d.N} kg de nitrógeno (N) por hectárea`],["DAP (fósforo)",`${num(d.dap,1)} bultos de 50 kg`,`${d.P} kg de fósforo (P₂O₅) por hectárea`],["Cloruro de potasio (potasio)",`${num(d.kcl,1)} bultos de 50 kg`,`${d.K} kg de potasio (K₂O) por hectárea`]];
  $("aboOut").innerHTML=`<div class="card"><h2>Plan de abonos: ${c.n}</h2><p class="hint">Por hectárea, ${d.porCiclo?"por ciclo":"al año"}. Para ${num(ha,1)} ha multiplique por ${num(ha,1)} (cambie el área en la calculadora).</p>
    <ul class="plan">${filas.map(([n,q,t],i)=>`<li><span class="ci ${i===0?"":"ocre"}" data-ico="abono"></span><div><b>${n}</b><small>${t}</small></div><strong>${q}</strong></li>`).join("")}</ul>
    <p>Para ${num(ha,1)} ha: <b>${num(d.urea*ha,1)} bultos de urea</b>, <b>${num(d.dap*ha,1)} de DAP</b> y <b>${num(d.kcl*ha,1)} de cloruro de potasio</b>.</p></div>
    <div class="card agua"><h2>Cuándo y cómo aplicar</h2><p>${cuando}</p><ul class="tight"><li>El DAP también trae nitrógeno: puede bajar un poco la urea.</li><li>No abone antes de una lluvia muy fuerte ni sobre suelo seco: se pierde y contamina el agua.</li><li>Un análisis de suelo (en la UMATA o Agrosavia) le dice qué le falta de verdad y le ahorra plata.</li></ul>
    <p class="hint">Las dosis son de referencia para ${c.n.toLowerCase()}. Ajústelas con el análisis de suelo y la recomendación de su técnico.</p></div>`;
  pintarIconos($("aboOut"));
}

// ---------- Calculadora ----------
function pintarCalc(){llenarCul();ponerCultivo($("cul").value,false);}

// ---------- Finanzas ----------
let ultimoCalc=null;
const COL_COSTO={estab:"#15803D",semilla:"#A8680C",mant:"#1B6F8F",cosecha:"#8A5A3B",riego:"#6D5BD0",animales:"#B3321F"};
function donut(parts){let off=25;const seg=parts.map(p=>{const s=`<circle cx="21" cy="21" r="15.9155" fill="none" stroke="${COL_COSTO[p.k]}" stroke-width="7" stroke-dasharray="${(p.pct*100).toFixed(3)} ${(100-p.pct*100).toFixed(3)}" stroke-dashoffset="${off.toFixed(3)}"/>`;off-=p.pct*100;return s;}).join("");
  return `<svg class="donut" viewBox="0 0 42 42" role="img" aria-label="Reparto de los costos">${seg}</svg>`;}
function pintarFinanzas(){
  const hist=leerHistorial();
  if(!ultimoCalc){$("finOut").innerHTML=`<div class="card"><h2>Todavía no ha hecho ningún cálculo</h2><p>Con la calculadora vea cuánto cuesta sembrar, cuánto gana y cuánto le queda. El resumen de su finca aparece aquí.</p><button type="button" class="go" data-ir="calc">Hacer un cálculo</button></div>`+(hist.length?`<button type="button" class="sec" data-ir="historial">Ver historial</button>`:"");return;}
  const {P,R}=ultimoCalc,{c,F,v}=R,u=F.filas[F.H],des=desgloseCostos(u);
  $("finOut").innerHTML=`<div class="card"><p class="hint" style="margin-top:0">${c.n} · ${P.L.mun} · ${num(P.ha,1)} ha · ${MODOS[P.modo].toLowerCase()}</p>
    <div class="verdict ${v.k} chico"><div class="stamp">${v.t}</div><p>${v.why}</p></div>
    <div class="tiles-fin"><div><small>Ingresos</small><b>${millones(u.ing)}</b></div><div><small>Costos</small><b>${millones(u.cos)}</b></div><div><small>Utilidad</small><b class="${u.flujo<0?"neg":"pos"}">${millones(u.flujo)}</b></div><div><small>Margen</small><b class="${F.margen<0?"neg":""}">${F.margen<0?"Negativo":Math.round(F.margen*100)+" %"}</b></div><div class="ancho"><small>Ganancia neta en ${F.H} años (con la inversión)</small><b class="${F.acum<0?"neg":"pos"}">${millones(F.acum)}</b></div></div>
    <p class="hint">Por año en plena producción${c.tipo==="cic"?" ("+F.filas[1].cic+" "+(F.filas[1].cic>1?"ciclos":"ciclo")+")":""}. Inversión inicial: ${millones(F.inversion)}. ${F.payback?"Recupera la inversión en el año "+F.payback+".":"No recupera la inversión."}</p></div>
    <div class="card"><h2>Detalle de costos</h2><div class="donut-box">${donut(des)}<div class="donut-c"><small>Costos</small><b>${millones(u.cos)}</b></div></div>
    <ul class="leyenda-costos">${des.map(x=>`<li><i style="background:${COL_COSTO[x.k]}"></i><span>${x.n}</span><b>${millones(x.v)}</b><small>${Math.round(x.pct*100)} %</small></li>`).join("")}</ul></div>
    <div class="chips"><button type="button" class="sec" data-ir="historial">Ver historial</button><button type="button" class="sec" data-ir="calc">Hacer otro cálculo</button></div>`;
}

// ---------- Historial de cálculos (solo en este celular) ----------
const HKEY="siembro:historial";
function leerHistorial(){try{const h=JSON.parse(localStorage.getItem(HKEY)||"[]");return Array.isArray(h)?h:[];}catch(e){return [];}}
function guardarHistorial(P,R){
  try{const e={t:Date.now(),k:P.k,cn:R.c.n,lug:`${P.L.mun}${P.L.dep?", "+P.L.dep:""}`,ha:P.ha,modo:P.modo,uso:P.uso,v:R.v.k,vt:R.v.t,anual:R.F.anual,acum:R.F.acum,H:R.F.H,d:datosForm()};
    const h=leerHistorial().filter(x=>!(x.k===e.k&&x.lug===e.lug&&x.ha===e.ha&&x.modo===e.modo&&x.uso===e.uso));
    h.unshift(e);localStorage.setItem(HKEY,JSON.stringify(h.slice(0,15)));}catch(e){}
}
function pintarHistorial(){
  const h=leerHistorial();
  $("histOut").innerHTML=h.length?`<div class="hist">${h.map((e,i)=>`<div class="card hi"><span class="dot ${e.v}"></span><div><b>${e.cn}</b><small>${e.lug} · ${num(e.ha,1)} ha · ${MODOS[e.modo].toLowerCase()}</small><small>${new Date(e.t).toLocaleDateString("es-CO",{day:"numeric",month:"short",year:"numeric"})} · ${e.vt}</small></div><div class="hv"><b class="${e.anual<0?"neg":"pos"}">${millones(e.anual)}</b><small>por año</small></div><button type="button" class="sec" data-hist="${i}">Ver</button></div>`).join("")}</div>
    <button type="button" class="sec" id="borrarHist">Borrar historial</button>
    <p class="hint">Se guarda solo en este celular, no se envía a ningún lado.</p>`
    :`<div class="card"><h2>Todavía no hay cálculos guardados</h2><p>Cada cálculo que haga con el botón Calcular queda aquí para volver a verlo.</p><button type="button" class="go" data-ir="calc">Hacer un cálculo</button></div>`;
}

// ---------- Más ----------
function pintarMas(){const n=leerHistorial().length;$("masHist").textContent=n?`${n} ${n===1?"cálculo guardado":"cálculos guardados"} en este celular.`:"Los cálculos que ha hecho en este celular.";}

// ---------- Botones de las pantallas ----------
document.addEventListener("click",e=>{
  const T=s=>e.target.closest(s);let b;
  if((b=T("#top5 button[data-k], #topPasto button[data-k]"))){abrirTab("calc");probar(b.dataset.k);return;}
  if((b=T("#verAnalisis"))){if(topActual[0]){abrirTab("calc");probar(topActual[0].k);}return;}
  if((b=T("#gCalc, #cuCalc"))){abrirTab("calc");probar(b.dataset.k);return;}
  if((b=T("[data-rent]"))){rentModo=b.dataset.rent;pintarCultivos();return;}
  if((b=T("[data-gan]"))){ganModo=b.dataset.gan;pintarGanaderia();return;}
  if((b=T("[data-cu]"))){cuModo=b.dataset.cu;pintarCuando();return;}
  if((b=T("[data-cuk]"))){ponerCultivo(b.dataset.cuk,false);cuModo="cultivo";pintarCuando();scrollTo(0,0);return;}
  if((b=T("[data-rg]"))){rgModo=b.dataset.rg;pintarRiego();return;}
  if((b=T("[data-calcg]"))){grupoCalc=b.dataset.calcg;llenarCul();ponerCultivo($("cul").options[0].value,false);return;}
  if((b=T("[data-var]"))){$("var").selectedIndex=+b.dataset.var;abrirTab("calc");calcular(true);return;}
  if((b=T("[data-hist]"))){const h=leerHistorial()[+b.dataset.hist];if(h&&aplicarGuardado(h.d)){abrirTab("calc");calcular(false);abrirTab("finanzas");}return;}
  if(T("#borrarHist")){try{localStorage.removeItem(HKEY);}catch(x){}pintarHistorial();return;}
});
document.addEventListener("change",e=>{
  const t=e.target;
  if(t.classList.contains("selCul")){ponerCultivo(t.value);return;}
  if(t.id==="rentSuelo"){$("suelo").value=t.value;pintarCultivos();return;}
  if(t.id==="gPas"){gEst.k=t.value;calcGanado();return;}
  if(t.id==="gUso"){gEst.uso=t.value;calcGanado();return;}
});
document.addEventListener("input",e=>{
  if(e.target.id==="gHa"){gEst.ha=Math.max(.1,+e.target.value||1);calcGanado();}
  if(e.target.id==="nAni")calcAni();
});

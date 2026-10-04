// Siembro — pinta el resultado del cálculo
// Archivo cargado como script clásico: las constantes y funciones quedan globales y las usan los demás archivos.

function calcular(usuario){
  const P=leerForm(),{L,k,ha,suelo,ph,modo,uso,D}=P;
  const R=evaluar(k,L,ha,suelo,ph,modo,P.met,true,uso,D),{c,A,apt,F,v,met,haMax}=R;
  const comp=Object.keys(MODOS).map(m=>({m,...evaluar(k,L,ha,suelo,ph,m,P.met,true,uso,D)}));
  const mejor=comp.filter(x=>x.v.k!=="no").sort((a,b)=>b.F.acum-a.F.acum)[0];
  const alts=Object.keys(C).filter(x=>x!==k&&C[x].g===c.g).map(x=>{const r=Object.keys(MODOS).map(m=>evaluar(x,L,ha,suelo,ph,m,"mejor",false,uso,D)).sort((a,b)=>b.F.acum-a.F.acum)[0];return{x,r,prom:r.F.acum/r.F.H};})
    .filter(o=>o.r.apt.total>=.6&&o.r.v.k!=="no").sort((a,b)=>b.prom-a.prom).slice(0,4);
  const per=c.tipo!=="cic",pasto=c.tipo==="pasto",horiz=`${F.H} años`,lugarTxt=`${L.mun}${L.dep?", "+L.dep:""}`;
  const sup=supDe(c,uso),M=A.m[met],MT=METODOS[met];

  let h=`<div class="verdict ${v.k}">
    <div class="stamp">${v.t}</div>
    <div class="what">${c.n} (${$("var").value}) en ${lugarTxt}, ${num(ha,1)} ha, ${MODOS[modo].toLowerCase()}${modo!=="trad"?" por "+MT.n.toLowerCase():""}${pasto?", para "+(uso==="leche"?"leche":"ceba"):""}</div>
    <p>${v.why}</p>
    <div class="big">
      <div><b>${millones(F.inversion)}</b><small>Inversión inicial${c.tipo==="cic"?" (primer ciclo)":" (hasta que produzca)"}</small></div>
      <div><b class="${F.anual<0?'neg':''}">${millones(F.anual)}</b><small>Utilidad por año${c.tipo==="cic"?" con "+F.filas[1].cic+" "+(F.filas[1].cic>1?"ciclos":"ciclo"):" en plena producción"}</small></div>
      <div><b class="${F.acum<0?'neg':''}">${millones(F.acum)}</b><small>Ganancia neta en ${horiz}</small></div>
      <div><b>${modo==="trad"?"Solo lluvia":num(F.agua)+" m³"}</b><small>Agua de riego al año</small></div>
    </div></div>`;
  h+=`<div class="card"><h2>Así se cultiva ${c.n.toLowerCase()}</h2>${fichaHTML(k,ha,false)}<button type="button" class="sec" onclick="verFicha('${k}')">Ver ficha completa con fotos de plagas</button></div>`;

  const D_txt={lluvia:"Solo lluvia",pozo:`Pozo: ${num(D.q||0,1)} L/s por ${D.h} h = ${num(D.dia||0)} m³ al día`,quebrada:`Quebrada: ${num(D.q||0,1)} L/s por ${D.h} h = ${num(D.dia||0)} m³ al día`,reservorio:`Reservorio: ${num(D.total||0)} m³ guardados`,acueducto:`Acueducto: ${num(D.dia||0,1)} m³ al día`}[D.f];
  h+=`<div class="card agua"><h2>Agua: cuánto gasta y cuánto tiene</h2>
   <p><b>${A.necesita?"Sí necesita riego.":"No necesita riego."}</b> ${A.necesita?`A la lluvia de su zona le faltan unos <b>${num(A.lam)} mm al año</b>, sobre todo en ${L.dry} ${L.dry===1?"mes seco":"meses secos"}. Son ${num(A.lam*10)} m³ por hectárea que la planta necesita recibir.`:"La lluvia de su zona alcanza para este cultivo. Ponga drenajes para el invierno y deje el riego solo como seguro."}</p>
   <h3>Qué sistema le conviene</h3>
   <div class="scroll"><table><thead><tr><th>Sistema</th><th>Agua al año</th><th>Día más seco</th><th>Alcanza para</th><th>Inversión</th></tr></thead><tbody>
   ${c.met.map(k2=>{const x=A.m[k2],hm=haPosibles(D,x,ha);return `<tr class="${k2===met?'best':''}"><td>${METODOS[k2].n}${k2===A.mejor?" (ahorra más)":""}</td><td>${num(x.volAnual)} m³</td><td>${num(x.volDia,1)} m³</td><td class="${D.f!=="lluvia"&&hm<ha?'neg':''}">${D.f==="lluvia"?"—":hm===Infinity?"Sobra":num(hm,1)+" ha"}</td><td>${millones(METODOS[k2].c*ha+3.5e6)}</td></tr>`}).join("")}
   </tbody></table></div>
   <p>${MT.txt}${met!==A.mejor?` Con ${METODOS[A.mejor].n.toLowerCase()} gastaría ${num(A.m[met].volAnual-A.m[A.mejor].volAnual)} m³ menos al año.`:""}</p>
   <h3>Su agua disponible</h3>
   <p>${D_txt}.</p>
   ${D.f==="lluvia"?(A.necesita?`<div class="aviso no">Sin fuente de agua va a perder cerca del ${Math.round(Math.max(F.pen,finanzas(c,L,ha,"trad",met,A,sup,uso).pen)*100)} % de la cosecha en verano.<span>Para regar con ${MT.n.toLowerCase()} necesitaría un reservorio de unos ${num(M.volAnual)} m³ o un pozo de ${num(M.q,2)} L/s.</span></div>`:`<div class="aviso ok">La lluvia le alcanza.<span>No necesita invertir en fuente de agua para este cultivo.</span></div>`)
     :(haMax>=ha?`<div class="aviso ok">Su agua alcanza${haMax===Infinity?"":` para ${num(haMax,1)} ha`}.<span>Puede regar las ${num(ha,1)} ha con ${MT.n.toLowerCase()}${haMax!==Infinity&&haMax<ha*1.3?", pero con poco margen: no la desperdicie":""}.</span></div>`
     :`<div class="aviso no">Su agua solo alcanza para ${num(haMax,1)} ha.<span>${D.total!==undefined?`Le faltan ${num(M.volAnual-D.total)} m³: amplíe el reservorio o siembre menos.`:`En el día más seco necesita ${num(M.volDia,1)} m³ y tiene ${num(D.dia,1)} m³. Bombee más horas, guarde agua en un tanque o siembre menos.`}</span></div>`)}
   ${A.necesita?`<div class="kv"><div><small>Caudal de bomba</small><b>${num(M.q,2)} L/s</b></div><div><small>Bomba aproximada</small><b>${num(Math.max(.5,M.q*30/(76*.6)),1)} HP</b></div><div><small>Sectores de riego</small><b>${Math.max(1,Math.ceil(ha/1.5))}</b></div><div><small>Reservorio para un mes seco</small><b>${num(M.volDia*30)} m³</b></div></div>`:""}
   ${modo==="auto"?`<p>Con automatización (controlador, una electroválvula por sector y sensores de humedad del suelo) solo se riega cuando el suelo lo pide: ahorra cerca del 15 % del agua. Puede funcionar con panel solar.</p>`:""}
   <details class="como"><summary>¿Cómo se calculó?</summary>
   <ol class="tight"><li>Evaporación de referencia en ${lugarTxt} (ETo): ${num(A.eto,1)} mm al día.</li>
   <li>Su cultivo gasta ${num(c.kc,2)} veces eso (Kc)${c.perc?", más lo que se filtra en el arroz inundado":""}: ${num(A.etc,1)} mm al día, o sea ${num(A.etc*10)} m³ por hectárea al día.</li>
   <li>En ${per?"un año":"la temporada"} necesita ${num(A.need)} mm. La lluvia aprovechable (75 %) da ${num(A.eff)} mm.</li>
   <li>Lo que falta, ${num(A.lam)} mm, se divide por la eficiencia del sistema (${MT.n.toLowerCase()}, ${Math.round(MT.ef*100)} %): ${num(A.lam)} ÷ ${MT.ef} ${M.kr<1?" × 0,7":""} × 10 × ${num(ha,1)} ha = ${num(M.volAnual)} m³ al año.</li>
   ${M.kr<1?`<li>Con ${MT.n.toLowerCase()} solo se moja la zona de raíces de cada árbol, por eso se cuenta el 70 % del área.</li>`:""}<li>Caudal: ${num(M.volDia,1)} m³ en 10 horas = ${num(M.q,2)} litros por segundo.</li></ol></details></div>`;

  h+=`<div class="card"><h2>Qué tan apto es</h2><div class="apt">
    ${[["Clima",apt.sClima],["Agua",apt.sAgua],["Suelo",apt.sSuelo],["pH",apt.sPh],["Total",apt.total]].map(([n,s])=>`<div class="it"><span>${n}</span><div class="bar"><i style="width:${Math.round(s*100)}%;background:${color(s)}"></i></div><b>${Math.round(s*100)}%</b></div>`).join("")}
    </div>
    <p class="hint">Este cultivo pide ${c.t[0]}–${c.t[1]} °C, ${num(c.alt[0])}–${num(c.alt[1])} msnm, ${num(c.r[0])}–${num(c.r[1])} mm de lluvia y pH ${c.ph[0]}–${c.ph[1]}. Su zona: ${L.t} °C, ${num(L.alt)} msnm, ${num(L.r)} mm${ph?", pH "+ph:""}.</p>
    ${apt.sSuelo<.6?`<p><b>Ojo con el suelo:</b> el suelo ${$("suelo").selectedOptions[0].text.split(" (")[0].toLowerCase()} no le conviene a este cultivo. ${apt.sSuelo<.45?"Si insiste, siembre en camas altas o montículos y abra drenajes.":"Mejórelo con materia orgánica."}</p>`:""}
    <p>${c.nota}</p></div>`;

  if(pasto){const ugg=F.ugg,vacas=ugg*.75;h+=`<div class="card"><h2>Su ganadería con este pasto</h2>
    <div class="kv"><div><small>Forraje al año</small><b>${num(sup.y*F.f*ha,1)} t materia seca</b></div><div><small>Capacidad de carga</small><b>${num(ugg/ha,1)} animales/ha</b></div><div><small>Animales en ${num(ha,1)} ha</small><b>${num(ugg,0)} UGG</b></div>
    ${uso==="leche"?`<div><small>Vacas en ordeño</small><b>${num(vacas,0)}</b></div><div><small>Leche al día</small><b>${num(vacas*c.leche)} L</b></div>`:`<div><small>Ganancia de peso</small><b>${num(c.gdp*1000)} g/animal/día</b></div><div><small>Carne al año</small><b>${num(ugg*c.gdp*365)} kg</b></div>`}</div>
    <p>Compra de animales (no incluida en las cuentas): unos ${millones(uso==="leche"?vacas*4.5e6:ugg*250*sup.p*1.05)}. Agua para el ganado: ${num(ugg*50)} litros al día.</p>
    <details class="como"><summary>¿Cómo se calculó?</summary><p>${num(sup.y,1)} t de materia seca por hectárea × 60 % que aprovechan los animales ÷ 3.650 kg que come un animal de 450 kg al año = ${num(sup.y*1000*.6/3650,1)} animales por hectárea${F.f<1?`, menos ${Math.round((1-F.f)*100)} % por falta de agua en verano`:""}. ${uso==="leche"?`Se cuentan 75 % de vacas en ordeño con ${c.leche} litros al día durante 305 días, y un costo de ${cop(c.cL)} por litro producido (concentrado, sal, sanidad, ordeño y mano de obra).`:`Cada animal gana ${num(c.gdp*1000)} gramos al día.`} En pastos sin manejo la carga real es de 0,8 a 1 animal por hectárea.</p></details></div>`;}
  if(c.silo){const t=sup.y*F.f*F.filas[1].cic*ha;h+=`<div class="card"><h2>Comida para el verano</h2><p>Con ${num(t)} t de silo al año alimenta unas <b>${num(t*1000/(15*90))} vacas durante 3 meses de verano</b>, a 15 kg por vaca al día.</p><p>Si no lo vende y lo usa en su finca, vale lo mismo que el concentrado o el silo que dejaría de comprar.</p></div>`;}

  h+=`<div class="card"><h2>Cuentas año por año</h2>
    <div class="kv"><div><small>Precio usado</small><b>${cop(sup.p)}${pasto&&uso==="leche"?"/L":"/kg"}</b></div><div><small>${pasto?"Forraje":"Producción "+(per?"adulta":"por ciclo")}</small><b>${num(sup.y,1)} t/ha</b></div><div><small>Margen en plena producción</small><b>${F.margen<0?"Negativo":Math.round(F.margen*100)+" %"}</b></div><div><small>Recupera la inversión</small><b>${F.payback?"Año "+F.payback:"No recupera"}</b></div>
    ${F.pen>0&&modo==="trad"?`<div><small>Pérdida por falta de agua</small><b class="neg">−${Math.round(F.pen*100)} % de cosecha</b></div>`:""}</div>
    <div class="scroll"><table><thead><tr><th>Año</th><th>${pasto?(uso==="leche"?"Leche":"Carne"):"Cosecha"}</th><th>Ingresos</th><th>Costos</th><th>Utilidad</th><th>Acumulado</th></tr></thead><tbody>
    ${F.filas.map(r=>`<tr><td>${r.a===0?(c.tipo==="cic"?"Inversión riego":"Siembra"):r.a}</td><td>${r.prod}</td><td>${millones(r.ing)}</td><td>${millones(r.cos)}</td><td class="${r.flujo<0?'neg':'pos'}">${millones(r.flujo)}</td><td class="${r.acum<0?'neg':'pos'}">${millones(r.acum)}</td></tr>`).join("")}
    </tbody></table></div>
    <details class="como"><summary>¿Cómo se calculó?</summary><ul class="tight">
    <li><b>Ingresos</b> = ${pasto?(uso==="leche"?"litros de leche × precio por litro":"kilos de carne producidos × precio del ganado en pie"):"toneladas cosechadas × 1.000 × precio por kilo"}.</li>
    <li><b>Costos</b> = ${c.tipo==="cic"?"costo del ciclo (preparación, semilla, fertilizante, control de plagas y mano de obra) × número de ciclos":"mantenimiento del año (fertilizante, podas, plagas, mano de obra)"} + ${pasto?"sanidad, sal y manejo de los animales":`recolección (${cop(c.hc)} por kg)`}${modo!=="trad"?` + energía y mantenimiento del riego (${cop(METODOS[met].cm)} por m³ de agua${METODOS[met].cm<100?", por gravedad casi no gasta energía":""})`:""}.</li>
    <li><b>Utilidad</b> = ingresos − costos. El <b>acumulado</b> suma cada año desde la siembra: cuando pasa a positivo, ya recuperó la plata.</li>
    <li><b>Margen</b> = utilidad ÷ ingresos. Por debajo del 15 % el negocio es frágil.</li>
    <li>No incluye arriendo de la tierra, transporte al comprador ni intereses de crédito.</li></ul></details></div>`;

  h+=`<div class="card"><h2>¿Tradicional, con riego o automatizado?</h2>
    <div class="scroll"><table><thead><tr><th>Manejo</th><th>Inversión</th><th>Agua/año</th><th>Utilidad/año</th><th>Ganancia ${horiz}</th></tr></thead><tbody>
    ${comp.map(x=>`<tr class="${mejor&&x.m===mejor.m?'best':x.v.k==="no"?'mal':''}"><td>${MODOS[x.m]}</td><td>${millones(x.F.inversion)}</td><td>${x.m==="trad"?"Lluvia":num(x.F.agua)+" m³"}</td><td class="${x.F.anual<0?'neg':''}">${millones(x.F.anual)}</td><td class="${x.F.acum<0?'neg':''}">${millones(x.F.acum)}</td></tr>`).join("")}
    </tbody></table></div>
    <p>${mejor?`Le conviene más <b>${MODOS[mejor.m].toLowerCase()}</b>. `+(mejor.m==="trad"?"La lluvia de la zona alcanza y el riego no se paga solo.":mejor.m==="riego"?"El riego evita perder cosecha en verano; la automatización todavía no compensa su costo en esta área.":"Ahorra mano de obra y agua, y asegura la cosecha en verano. Entre más hectáreas, más se paga la automatización."):"En ninguna forma de manejo resulta rentable o el agua no alcanza. No lo siembre así."}</p></div>`;

  h+=`<div class="card agua"><h2>Así se ve el sistema: ${MT.n.toLowerCase()}</h2>${fig(FOTO_RIEGO[met],MT.n)}<p>${MT.txt}</p></div>`;
  h+=`<div class="card"><h2>Semilla: cuánto y dónde</h2>
    <div class="kv"><div><small>Variedad</small><b>${$("var").value}</b></div><div><small>Cantidad${c.tipo==="cic"?" por ciclo":""}</small><b>${num(c.dens*ha)} ${c.u}</b></div><div><small>Precio aproximado</small><b>${cop(c.pS)} c/u</b></div><div><small>Costo total</small><b>${millones(F.semilla)}</b></div></div>
    <p>${c.d}</p><p class="hint">Variedades usadas en Colombia: ${c.v.join(", ")}.</p></div>`;

  if(alts.length)h+=`<div class="card"><h2>${v.k==="ok"?"Otras opciones que le sirven aquí":"Mejor pruebe con estas opciones"}</h2><div class="alt">
    ${alts.map(o=>`<button type="button" onclick="probar('${o.x}')"><b>${o.r.c.n}</b><span>${millones(o.prom)} por año en promedio<br>${Math.round(o.r.apt.total*100)} % apto, ${o.r.A.necesita?METODOS[o.r.A.mejor].n.toLowerCase():"sin riego"}</span></button>`).join("")}</div>
    <p class="hint">Calculado con precios de referencia, su misma área y su agua disponible. Toque uno para ver el detalle.</p></div>`;

  $("out").innerHTML=h;cargarFotos($("out"));guardar();climaCargado=null;
  if(usuario&&innerWidth<900)$("out").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
}
function probar(k){$("cul").value=k;llenarCultivo();calcular(true);}

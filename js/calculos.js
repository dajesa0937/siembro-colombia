// Siembro Colombia — cálculos puros (sin DOM): aptitud, agua, finanzas y veredicto
// Archivo cargado como script clásico: las constantes y funciones quedan globales y las usan los demás archivos.

function aptitud(c,L,suelo,ph,modo){
  const dist=(v,[a,b])=>v<a?a-v:v>b?v-b:0;
  const sAlt=Math.max(0,1-dist(L.alt,c.alt)/400),sT=Math.max(0,1-dist(L.t,c.t)/3),sClima=Math.min(sAlt,sT);
  let sAgua=1;
  if(c.soloRiego&&modo==="trad") sAgua=.3;
  else if(L.r<c.r[0]) sAgua=modo==="trad"?Math.max(.5,L.r/c.r[0]):1;
  else if(L.r>c.r[1]) sAgua=Math.max(.5,1-(L.r-c.r[1])/2000);
  const sSuelo=c.s[suelo],sPh=(ph&&(ph<c.ph[0]||ph>c.ph[1]))?.75:1;
  return{total:sClima*sAgua*sSuelo*sPh,sClima,sAgua,sSuelo,sPh};
}
const fLoc=(c,k)=>(c.tipo==="per"&&METODOS[k].loc)?.7:1; // goteo y micro solo mojan la zona de raíces
const ETo=(t,r)=>1.2+.14*t+(r<1000?.5:0);
function agua(c,L,ha){
  const eto=ETo(L.t,L.r),etc=c.kc*eto*(c.perc||1),per=c.tipo!=="cic";
  const need=per?etc*365:etc*30*c.meses*c.ciclos;
  const eff=per?L.r*.75:L.r/Math.max(1,12-L.dry)*Math.min(c.meses*c.ciclos,12-L.dry)*.75;
  const def=need-eff;
  let lam=per?Math.max(def,L.dry*30*etc*.85):Math.max(def,0);
  if(!per&&c.ciclos>1&&L.dry>=3) lam+=etc*30*Math.min(c.meses,L.dry)*.85;
  if(c.soloRiego) lam=Math.max(lam,need*.6);
  lam=Math.max(0,lam);
  const m={};c.met.forEach(k=>{const ef=METODOS[k].ef,kr=fLoc(c,k),volDia=etc*kr/ef*10*ha;m[k]={ef,kr,volDia,volAnual:lam*kr/ef*10*ha,q:volDia*1000/(10*3600)};});
  const mejor=[...c.met].sort((a,b)=>METODOS[b].ef-METODOS[a].ef)[0];
  return{eto,etc,need,eff,def,lam,necesita:lam>60||!!c.soloRiego,m,mejor};
}
function haPosibles(D,M,ha){if(D.f==="lluvia")return 0;
  if(D.total!==undefined)return M.volAnual>0?ha*D.total/M.volAnual:Infinity;
  return M.volDia>0?ha*D.dia/M.volDia:Infinity;}
function finanzas(c,L,ha,modo,met,A,sup,uso){
  const per=c.tipo!=="cic";
  let pen=0;
  if(A.necesita) pen=per?Math.min(.45,.07*L.dry+Math.max(0,A.def)/A.need*.5):Math.min(.45,Math.max(0,A.def)/A.need*.6+(c.meses>=8?.04*L.dry:0));
  if(c.soloRiego) pen=Math.max(pen,.5);
  let f=1-pen,manF=1,capex=0,op=0,aguaA=0;
  const M=A.m[met];
  if(modo!=="trad"){capex=METODOS[met].c*ha+3.5e6;aguaA=M.volAnual;f=A.necesita?1.05:1;
    if(modo==="auto"){capex+=3.8e6+.9e6*ha;aguaA*=.85;f+=.05;manF=.88;op=300000;}
    op+=aguaA*METODOS[met].cm;}
  const semilla=c.dens*c.pS*ha,filas=[];
  if(c.tipo==="pasto"){
    filas.push({a:0,ing:0,cos:sup.est*ha+semilla+capex,prod:"—",c:{estab:sup.est*ha,semilla,riego:capex}});
    c.ramp.forEach((r,i)=>{const ms=sup.y*r*f*ha,ugg=ms*1000*.6/3650;let ing,cos,prod,cc;
      if(uso==="leche"){const vacas=ugg*.75,lt=vacas*c.leche*305;ing=lt*sup.p;cos=sup.man*manF*ha+lt*c.cL+op;prod=num(lt)+" L";cc={mant:sup.man*manF*ha,animales:lt*c.cL,riego:op};}
      else{const kg=ugg*c.gdp*365;ing=kg*sup.p;cos=sup.man*manF*ha+ugg*450000+op;prod=num(kg)+" kg";cc={mant:sup.man*manF*ha,animales:ugg*450000,riego:op};}
      filas.push({a:i+1,ing,cos,prod,ugg,c:cc});});
  }else if(per){
    filas.push({a:0,ing:0,cos:sup.est*ha+semilla+capex,prod:"—",c:{estab:sup.est*ha,semilla,riego:capex}});
    c.ramp.forEach((r,i)=>{const kg=sup.y*1000*r*f*ha;filas.push({a:i+1,ing:kg*sup.p,cos:sup.man*manF*ha+kg*c.hc+op,prod:kg?num(kg/1000,1)+" t":"—",c:{mant:sup.man*manF*ha,cosecha:kg*c.hc,riego:op}});});
  }else{
    let cic=c.ciclos;if(modo==="trad"&&cic>1&&L.dry>=5)cic=1;
    filas.push({a:0,ing:0,cos:capex,prod:"—",c:{riego:capex}});
    for(let i=1;i<=5;i++){const kg=cic*sup.y*1000*f*ha;filas.push({a:i,ing:kg*sup.p,cos:cic*(sup.est*manF+c.dens*c.pS)*ha+kg*c.hc+op,prod:num(kg/1000,1)+" t",cic,c:{mant:cic*sup.est*manF*ha,semilla:cic*c.dens*c.pS*ha,cosecha:kg*c.hc,riego:op}});}
  }
  let acum=0,payback=null;filas.forEach(r=>{r.flujo=r.ing-r.cos;acum+=r.flujo;r.acum=acum;if(payback===null&&r.a>0&&acum>=0)payback=r.a;});
  const ult=filas[filas.length-1],margen=ult.ing>0?ult.flujo/ult.ing:-1;
  const inversion=c.tipo==="cic"?filas[0].cos+filas[1].cos/(filas[1].cic||1):filas.slice(0,3).reduce((s,r)=>s+Math.max(0,r.cos-r.ing),0);
  return{filas,acum,payback,margen,anual:ult.flujo,inversion,semilla,capex,pen,agua:aguaA,H:filas.length-1,ugg:ult.ugg||0,f};
}
function veredicto(apt,F,c,W){
  if(apt.sClima<.4)return{k:"no",t:"No lo siembre",why:"El clima de esta zona no sirve para este cultivo: la altura o la temperatura están fuera de lo que la planta necesita. Ni con riego ni con buen manejo va a producir bien."};
  if(c.soloRiego&&W.modo==="trad")return{k:"no",t:"No lo siembre",why:"El arroz de riego no se puede sembrar sin agua segura. Si solo depende de la lluvia va a perder la inversión."};
  if(W.modo!=="trad"&&W.haMax<W.ha*.5)return{k:"no",t:"No siembre esa área",why:`Su agua solo alcanza para regar ${num(W.haMax,1)} ha con ${METODOS[W.met].n.toLowerCase()}. Si siembra ${num(W.ha,1)} ha, en verano se le seca el cultivo y pierde plata. Siembre menos área o consiga más agua.`};
  if(apt.total<.45)return{k:"no",t:"No lo siembre",why:"El cultivo es poco apto para este suelo y clima. Aunque crezca, el rendimiento será bajo y el riesgo de pérdida alto."};
  if(F.acum<=0||F.anual<=0)return{k:"no",t:"No lo siembre, pierde dinero",why:`Con los precios y costos actuales no recupera la inversión en ${F.H} años. Revise el precio de venta, el manejo o pruebe otro cultivo.`};
  if(W.modo!=="trad"&&W.haMax<W.ha)return{k:"mid",t:"El agua no alcanza",why:`Su agua alcanza para ${num(W.haMax,1)} de las ${num(W.ha,1)} ha. Puede ganar, pero en verano parte del lote va a sufrir. Siembre ${num(Math.floor(W.haMax*10)/10,1)} ha o construya un reservorio.`};
  if(F.margen<.15||apt.total<.7||(c.tipo==="per"&&(F.payback===null||F.payback>6)))return{k:"mid",t:"Rentabilidad baja",why:"Puede ganar, pero el margen es estrecho o el cultivo no está en su zona ideal. Un mal precio o un mal invierno se lleva la ganancia."};
  return{k:"ok",t:"Sí, es rentable",why:"El cultivo se adapta a la zona y deja buen margen con los precios de referencia."};
}
// Los cultivos que más rinden en un lugar (para la pantalla de Inicio). Solo cuenta los que no tienen veredicto "no".
// Se ordena por ganancia promedio por año. Con "solo lluvia" solo cuenta el manejo tradicional: sin fuente de agua no se puede planear riego.
function topCultivos(L,{ha=1,suelo="franco",ph=null,D={f:"lluvia",dia:0},uso="ceba",grupo="agr",n=5}={}){
  return Object.keys(C).filter(k=>C[k].g===grupo).map(k=>{
    const c=C[k],A=agua(c,L,ha),met=A.mejor,sup={p:c.tipo==="pasto"?(uso==="leche"?c.pLeche:c.pCarne):c.p,y:c.y,est:c.est,man:c.man};
    const opciones=["trad","riego","auto"].map(modo=>{
      const apt=aptitud(c,L,suelo,ph,modo),F=finanzas(c,L,ha,modo,met,A,sup,uso),haMax=haPosibles(D,A.m[met],ha);
      return{modo,apt,F,v:veredicto(apt,F,c,{modo,haMax,ha,met})};
    }).filter(o=>o.v.k!=="no").sort((a,b)=>b.F.acum-a.F.acum);
    const r=opciones[0];
    return r&&r.apt.total>=.6?{k,c,modo:r.modo,apt:r.apt,F:r.F,v:r.v,prom:r.F.acum/r.F.H}:null;
  }).filter(Boolean).sort((a,b)=>b.prom-a.prom).slice(0,n);
}

// ---------- Pantallas del mockup: calendario de siembra, frecuencia de riego, abonos y desglose de costos ----------
const MESES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
// Cómo se reparte la lluvia en el año en cada región (factor 1 = mes promedio). Es una guía general, no un dato de la finca.
const LLUVIA_MES={
 costa:[.15,.1,.2,.6,1.3,1.3,1.2,1.5,1.8,2.2,1.4,.45],
 antioquia:[.6,.7,1,1.4,1.4,.9,.7,.8,1.1,1.5,1.4,.8],
 andes:[.7,.8,1.1,1.5,1.3,.7,.5,.6,1,1.5,1.4,.9],
 bogota:[.4,.6,1,1.7,1.3,.8,.7,.7,.9,1.5,1.4,.7]
};
// Lluvia de cada mes en mm: la lluvia anual del lugar repartida con el perfil de su región.
function lluviaMensual(L){const p=LLUVIA_MES[L.reg]||LLUVIA_MES.andes,s=p.reduce((a,b)=>a+b,0);return p.map(f=>L.r*f/s);}
// Calendario de siembra: 12 meses, 2 = ideal, 1 = posible, 0 = no recomendado.
// Se siembra bien cuando la lluvia de los meses siguientes cubre lo que la planta gasta. Con riego casi cualquier mes sirve.
function calendarioSiembra(c,L,conRiego,mmReal){
  const mm=(mmReal&&mmReal.length===12&&mmReal.every(v=>v!=null))?mmReal:lluviaMensual(L),etc=c.kc*ETo(L.t,L.r)*30*(c.perc||1),n=c.tipo==="cic"?Math.min(5,Math.max(3,Math.ceil(c.meses))):3;
  const apt=aptitud(c,L,"franco",null,"riego");
  const meses=mm.map((_,m)=>{
    let llu=0;for(let i=0;i<n;i++)llu+=mm[(m+i)%12];
    const r=llu/(etc*n);
    if(apt.sClima<.4)return{m,r,v:0};
    if(c.soloRiego&&!conRiego)return{m,r,v:0};
    return{m,r,v:r>=.8?2:r>=.5?1:(conRiego?1:0)};});
  const mejores=meses.filter(x=>x.v===2).map(x=>x.m);
  const alt=mejores.length?mejores:[...meses].sort((a,b)=>b.r-a.r).slice(0,2).filter(x=>x.v>0).map(x=>x.m);
  return{meses:meses.map(x=>x.v),mejores:alt,ideal:mejores.length>0,climaNo:apt.sClima<.4};
}
// "abril a junio" o "enero y noviembre": junta meses seguidos (el año da la vuelta de diciembre a enero)
function rangoMeses(ms){
  if(!ms.length)return "";
  const s=[...ms].sort((a,b)=>a-b);
  if(s.length>=2&&s[0]===0&&s[s.length-1]===11){let i=s.length-1;while(i>0&&s[i-1]===s[i]-1)i--;if(i>0&&s.slice(0,i).every((x,j)=>x===j)){const a=s.slice(i),b=s.slice(0,i);return `${MESES[a[0]]} a ${MESES[b[b.length-1]]}`;}}
  const grupos=[];s.forEach(m=>{const g=grupos[grupos.length-1];if(g&&m===g[g.length-1]+1)g.push(m);else grupos.push([m]);});
  const t=grupos.map(g=>g.length===1?MESES[g[0]]:g.length===2?`${MESES[g[0]]} y ${MESES[g[1]]}`:`${MESES[g[0]]} a ${MESES[g[g.length-1]]}`);
  return t.length===1?t[0]:t.slice(0,-1).join(", ")+" y "+t[t.length-1];
}
// Cada cuántos días regar y cuánta lámina: agua que el suelo guarda al alcance de la raíz ÷ lo que la planta gasta por día.
const AGUA_UTIL={arenoso:20,"franco-arenoso":30,franco:40,"franco-arcilloso":45,arcilloso:50};
function frecuenciaRiego(c,L,suelo,met,ha=1){
  const A=agua(c,L,ha),kr=fLoc(c,met),etc=A.etc*kr,gota=["goteo","cinta","micro"].includes(met);
  const util=AGUA_UTIL[suelo]||40;let dias=Math.max(1,Math.floor(util/Math.max(.1,etc)));
  dias=gota?Math.min(dias,2):Math.min(dias,14);
  const neto=etc*dias,bruto=neto/METODOS[met].ef;
  return{dias,neto,bruto,m3ha:bruto*10,etc,A,gota};
}
// Abonos de referencia de la ficha: nutrientes por hectárea y bultos de 50 kg (urea 46 % N, DAP 46 % P₂O₅, cloruro de potasio 60 % K₂O).
function dosisAbono(k,ha=1){
  const c=C[k],F=FICHA[k];if(!F||!F.fert)return null;
  const [N,P,K]=F.fert;
  return{N,P,K,urea:N/.46/50*ha,dap:P/.46/50*ha,kcl:K/.6/50*ha,tipo:c.tipo,porCiclo:c.tipo==="cic"};
}
// Costos por tipo en la fila de un año (para el resumen y el gráfico de la finca). La suma da los costos de la fila.
const TIPOS_COSTO=[["estab","Siembra y preparación"],["semilla","Semilla o plántulas"],["mant","Labores, abonos y plagas"],["cosecha","Cosecha"],["riego","Riego"],["animales","Animales y sanidad"]];
function desgloseCostos(fila){
  const c=fila.c||{};const tot=TIPOS_COSTO.reduce((s,[k])=>s+(c[k]||0),0)||1;
  return TIPOS_COSTO.map(([k,n])=>({k,n,v:c[k]||0,pct:(c[k]||0)/tot})).filter(x=>x.v>0);
}
// Rotación de potreros (guía general para el trópico): días que el animal ocupa un potrero, días de descanso del pasto y cuántos potreros hacen falta.
// El descanso es más largo donde hay meses secos o hace frío, porque el pasto rebrota más despacio.
function rotacion(L,ocup=3){
  let d=35;if(L.dry>=4)d=50;else if(L.dry>=3)d=42;if(L.t<16)d+=10;
  return{ocup,descanso:d,rango:[d-5,d+5],potreros:Math.ceil(d/ocup)+1};
}

// ---------- Clima: años pasados, balance de agua y recomendaciones (sirven al agricultor y al ganadero) ----------
// Resume años de datos diarios (lluvia, temperatura máxima y mínima, evaporación) en 12 meses típicos.
// Solo cuenta los meses completos. Devuelve por mes: lluvia promedio, la más baja y la más alta de esos años, temperatura y evaporación diaria.
function resumenClimatico(time,ll,tmax,tmin,et0){
  const por={};
  time.forEach((f,i)=>{const k=f.slice(0,7),o=por[k]||(por[k]={m:+f.slice(5,7)-1,ll:0,t:0,n:0,et:0,en:0});
    if(ll[i]!=null)o.ll+=ll[i];
    if(tmax[i]!=null&&tmin[i]!=null){o.t+=(tmax[i]+tmin[i])/2;o.n++;}
    if(et0&&et0[i]!=null){o.et+=et0[i];o.en++;}});
  const m=[...Array(12)].map(()=>({tot:[],t:[],et:[]}));
  Object.values(por).forEach(o=>{if(o.n<27)return;m[o.m].tot.push(o.ll);m[o.m].t.push(o.t/o.n);if(o.en)m[o.m].et.push(o.et/o.en);});
  const med=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
  return m.map((x,i)=>({m:i,mm:med(x.tot),min:x.tot.length?Math.min(...x.tot):null,max:x.tot.length?Math.max(...x.tot):null,t:med(x.t),et0:med(x.et),anios:x.tot.length}));
}
// Los n meses que siguen desde el mes "desde" (0 = enero); el año da la vuelta.
const periodoMeses=(meses,desde,n)=>[...Array(n)].map((_,i)=>meses[(desde+i)%12]);
// Meses típicos "aproximados" cuando aún no se han bajado los datos reales: la lluvia anual del lugar repartida como en su región.
function mesesAproximados(L){const mm=lluviaMensual(L);return mm.map((v,i)=>({m:i,mm:v,min:null,max:null,t:L.t,et0:ETo(L.t,L.r),anios:0}));}
// Cuánta agua gasta el cultivo en un mes y cuánta le falta si solo llueve lo típico (se aprovecha el 75 % de la lluvia).
function balanceMes(c,mes){
  const etc=c.kc*(c.perc||1)*(mes.et0??(1.2+.14*mes.t))*30,efec=(mes.mm||0)*.75;
  return{etc,efec,falta:Math.max(0,etc-efec),sobra:Math.max(0,efec-etc)};
}
// Cuánto pasto crece en el mes frente a lo que el pasto necesita: 1 o más = crece bien; menos de 0,5 = verano duro.
function indiceForraje(mes){const need=.9*(mes.et0??(1.2+.14*mes.t))*30;return need>0?(mes.mm||0)*.75/need:0;}
const NOMBRE_MES=m=>MESES[m];
// Recomendaciones para un período (mes, trimestre, semestre o año) a partir de los meses típicos.
// Devuelve dos listas, una para el agricultor y otra para el ganadero. Cada una: {n:"ok"|"aviso"|"no", t:texto}.
function recomendacionesPeriodo(meses,c){
  const agri=[],gan=[],lista=ms=>rangoMeses(ms.map(x=>x.m));
  const prom=meses.reduce((s,x)=>s+(x.mm||0),0)/meses.length;
  const bal=meses.map(x=>({x,b:balanceMes(c,x)})),secos=bal.filter(o=>o.b.falta>20),falta=secos.reduce((s,o)=>s+o.b.falta,0);
  if(secos.length)agri.push({n:"aviso",t:`En ${lista(secos.map(o=>o.x))} la lluvia no le alcanza a ${c.n.toLowerCase()}: faltan unos ${Math.round(falta)} mm, o sea ${Math.round(falta*10).toLocaleString("es-CO")} m³ por hectárea. Planee el riego o guarde agua antes.`});
  else agri.push({n:"ok",t:`La lluvia típica de este período alcanza para ${c.n.toLowerCase()}: no debería necesitar riego de rutina.`});
  const muy=meses.filter(x=>x.mm!=null&&x.mm>=Math.max(150,prom*1.5));
  if(muy.length)agri.push({n:"aviso",t:`${lista(muy)} ${muy.length>1?"son los meses más lluviosos":"es el mes más lluvioso"}: abra drenajes, no abone antes de un aguacero y revise hojas por hongos.`});
  const buenos=bal.filter(o=>o.b.falta<=20&&o.b.efec>=o.b.etc*.8).map(o=>o.x);
  if(buenos.length&&buenos.length<meses.length)agri.push({n:"ok",t:`${lista(buenos)} ${buenos.length>1?"son buenos meses":"es un buen mes"} para sembrar y para abonar: hay humedad en el suelo.`});
  const flacos=meses.filter(x=>indiceForraje(x)<.5);
  if(flacos.length)gan.push({n:"aviso",t:`En ${lista(flacos)} el pasto crece poco. Guarde silo o heno antes, baje la carga de animales y alargue el descanso de los potreros.`});
  else gan.push({n:"ok",t:`Hay lluvia para que el pasto crezca en todo el período. Aproveche para fertilizar y para cortar silo.`});
  const calor=meses.filter(x=>x.t!=null&&x.t>=27);
  if(calor.length)gan.push({n:"aviso",t:`${lista(calor)}: temperatura promedio de ${Math.round(Math.max(...calor.map(x=>x.t)))} °C o más. Dé sombra y agua fresca todo el día; los animales pueden tomar más de 50 litros.`});
  if(muy.length)gan.push({n:"aviso",t:`En ${lista(muy)} los potreros se encharcan: no deje los animales en lo bajo, cuide pezuñas y ubres, y rote más rápido para que no dañen el pasto.`});
  return{agri,gan};
}
// Recomendaciones para los próximos días a partir del pronóstico: dias = [{ll,pr,max,min}].
function recomendacionesPronostico(dias){
  const agri=[],gan=[],n3=dias.slice(0,3),ll3=n3.reduce((s,x)=>s+(x.ll||0),0),total=dias.reduce((s,x)=>s+(x.ll||0),0);
  if(ll3>=15)agri.push({n:"no",t:`Vienen ${Math.round(ll3)} mm en 3 días: no abone ni fumigue, la lluvia se lo lleva. Tampoco riegue.`});
  const secos=[];let racha=0,ini=0;dias.forEach((x,i)=>{if((x.ll||0)<1){if(!racha)ini=i;racha++;if(racha>=3&&!secos.some(s=>s.ini===ini))secos.push({ini,n:racha});else if(racha>3){secos.find(s=>s.ini===ini).n=racha;}}else racha=0;});
  if(secos.length){const s=secos[0];agri.push({n:"ok",t:`Hay ${s.n} días seguidos casi sin lluvia ${s.ini===0?"desde hoy":"desde dentro de "+s.ini+" días"}: buen momento para fumigar, abonar o cosechar.`});}
  if(total<10&&dias.length>=7)agri.push({n:"aviso",t:`En ${dias.length} días solo se esperan ${Math.round(total)} mm: ponga cuidado con el riego y no desperdicie agua.`});
  const calor=dias.filter(x=>x.max>=33);
  if(calor.length>=2){agri.push({n:"aviso",t:`Se esperan ${calor.length} días de ${Math.round(Math.max(...calor.map(x=>x.max)))} °C o más: riegue temprano y revise que las plantas jóvenes no se marchiten.`});
    gan.push({n:"aviso",t:`Calor fuerte: dé sombra y agua fresca todo el día y no mueva el ganado en las horas de sol (de 10 a 3).`});}
  const fuerte=dias.find(x=>(x.ll||0)>=40);
  if(fuerte)gan.push({n:"no",t:`Hay un día con ${Math.round(fuerte.ll)} mm o más: saque los animales de las partes bajas y de la orilla de las quebradas.`});
  if(!gan.length)gan.push({n:"ok",t:`No se ven problemas de clima para el ganado en estos días. Revise que los bebederos tengan agua limpia.`});
  if(!agri.length)agri.push({n:"ok",t:`Sin alertas de clima para los cultivos en estos días. Siga su plan de riego.`});
  return{agri,gan};
}

// ---------- Semillas de pasto (catálogo en js/datos/pastos.js; funciones puras, sin DOM) ----------
// Kilos de semilla para sembrar `ha` hectáreas: la recomendación viene en puntos de valor cultural (PVC) y se divide por el % de valor cultural (VC) de la bolsa.
// Una bolsa con VC bajo trae más paja: hay que echar más kilos. Compare por costo del área total, no por precio del kilo.
function kgSemillaPasto(puntos,vc,ha=1){const v=Math.min(100,Math.max(1,+vc||0));return puntos/v*Math.max(0,+ha||0);}
// Costo de semilla para `ha` hectáreas con una bolsa de precio `precioKg` y valor cultural `vc`.
function costoSemillaPasto(puntos,vc,precioKg,ha=1){return kgSemillaPasto(puntos,vc,ha)*Math.max(0,+precioKg||0);}
// Ordena los pastos del catálogo para un lugar. L={alt,r}; o={uso:"pastoreo"|"corte"|"heno"|"silo", acido, encharca, fertil:"baja"|"media"|"alta", sequia}.
// Devuelve [{p, ok, puntaje, bien:[], ojo:[]}]: los que sirven primero (ok) y de mayor puntaje; los que no sirven al final con el motivo en `ojo`.
function recomendarPastos(lista,L,o={}){
  const uso=o.uso||"pastoreo",fert=o.fertil||"media",ex={baja:1,media:2,alta:3}[fert]||2;
  return lista.map(p=>{
    const bien=[],ojo=[];let ok=true,pt=50;
    if(L.alt>p.altMax){ok=false;ojo.push(`Su finca está a ${Math.round(L.alt)} msnm y este pasto llega hasta ${p.altMax} msnm.`);}
    if(L.r<p.lluviaMin){ok=false;ojo.push(`Llueve ${Math.round(L.r)} mm al año y pide mínimo ${p.lluviaMin} mm (sin riego se seca).`);}
    else if(L.r<p.lluviaMin+200){ojo.push("Está cerca del mínimo de lluvia: en verano puede necesitar riego.");pt-=5;}
    if(o.acido){if(p.acido===3){bien.push("Aguanta suelo ácido.");pt+=18;}else if(p.acido===2){pt+=6;}else{ojo.push("No aguanta bien el suelo ácido: encale primero.");pt-=18;}}
    if(o.encharca){if(p.encharc===3){bien.push("Aguanta encharcamiento.");pt+=18;}else if(p.encharc===2){pt+=6;}else{ojo.push("No aguanta que se encharque el potrero.");pt-=18;}}
    if(o.sequia){if(p.frioSeq===3){bien.push("Aguanta la sequía.");pt+=14;}else if(p.frioSeq===1){ojo.push("Sufre en sequías largas.");pt-=14;}}
    if(p.exig>ex){ojo.push(fert==="baja"?"Pide un suelo más fértil que el suyo: sin abono rinde poco.":"Pide abono para rendir; con su suelo no da todo.");pt-=(p.exig-ex)*10;}
    else if(p.exig===1&&fert==="baja"){bien.push("Se da en suelo pobre.");pt+=8;}
    if(uso==="heno"){if(p.heno>=3){bien.push("Sirve para heno.");pt+=12;}else if(p.heno===0){ojo.push("No sirve para heno.");pt-=12;}}
    if(uso==="silo"){if(p.silaje>=3){bien.push("Sirve para ensilaje.");pt+=12;}else if(p.silaje===0){ojo.push("No sirve para ensilaje.");pt-=12;}}
    if(uso==="corte"){pt+=(p.ms-16)*.8;}
    if(uso==="pastoreo"){if(p.pastInt===3){bien.push("Aguanta pastoreo pesado.");pt+=8;}pt+=(p.ms-16)*.4+(p.calidad-2)*4;}
    if(p.mion===1){ojo.push("El salivazo (mión) lo ataca fuerte.");pt-=6;}
    if(p.foto===1){ojo.push("Puede causar fotosensibilidad: cuidado con terneros, ovejas y caballos.");pt-=4;}
    if(p.ms>=22)bien.push(`Produce mucho: ${p.ms} t de materia seca por ha al año.`);
    if(p.prot>=12)bien.push(`Buena proteína (${p.prot} %).`);
    return{p,ok,puntaje:Math.round(pt),bien,ojo};
  }).sort((a,b)=>(b.ok-a.ok)||(b.puntaje-a.puntaje));
}

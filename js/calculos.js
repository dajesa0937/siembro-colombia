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
    filas.push({a:0,ing:0,cos:sup.est*ha+semilla+capex,prod:"—"});
    c.ramp.forEach((r,i)=>{const ms=sup.y*r*f*ha,ugg=ms*1000*.6/3650;let ing,cos,prod;
      if(uso==="leche"){const vacas=ugg*.75,lt=vacas*c.leche*305;ing=lt*sup.p;cos=sup.man*manF*ha+lt*c.cL+op;prod=num(lt)+" L";}
      else{const kg=ugg*c.gdp*365;ing=kg*sup.p;cos=sup.man*manF*ha+ugg*450000+op;prod=num(kg)+" kg";}
      filas.push({a:i+1,ing,cos,prod,ugg});});
  }else if(per){
    filas.push({a:0,ing:0,cos:sup.est*ha+semilla+capex,prod:"—"});
    c.ramp.forEach((r,i)=>{const kg=sup.y*1000*r*f*ha;filas.push({a:i+1,ing:kg*sup.p,cos:sup.man*manF*ha+kg*c.hc+op,prod:kg?num(kg/1000,1)+" t":"—"});});
  }else{
    let cic=c.ciclos;if(modo==="trad"&&cic>1&&L.dry>=5)cic=1;
    filas.push({a:0,ing:0,cos:capex,prod:"—"});
    for(let i=1;i<=5;i++){const kg=cic*sup.y*1000*f*ha;filas.push({a:i,ing:kg*sup.p,cos:cic*(sup.est*manF+c.dens*c.pS)*ha+kg*c.hc+op,prod:num(kg/1000,1)+" t",cic});}
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

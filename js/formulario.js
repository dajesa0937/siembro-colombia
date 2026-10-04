// Siembro Colombia — pestañas, formulario y lectura de datos del usuario
// Archivo cargado como script clásico: las constantes y funciones quedan globales y las usan los demás archivos.

document.querySelectorAll("nav.tabs button").forEach(b=>b.onclick=()=>abrirTab(b.dataset.tab));
function abrirTab(t){document.querySelectorAll("nav.tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.tab===t));
  ["calc","clima","cultivos","guia"].forEach(x=>$("tab-"+x).hidden=x!==t);scrollTo(0,0);if(t==="clima")cargarClima();if(t==="cultivos"&&!$("fichaOut").innerHTML)pintarFicha();if(t==="guia")cargarFotos($("tab-guia"));}

const deps=[...new Set(MUN.map(m=>m[0]))];
$("dep").innerHTML=deps.map(d=>`<option>${d}</option>`).join("")+`<option value="__otro">Otro lugar (ingresar clima)</option>`;
function llenarMun(){const d=$("dep").value;$("custom").hidden=d!=="__otro";$("mun").disabled=d==="__otro";
  $("mun").innerHTML=d==="__otro"?"<option>Datos propios</option>":MUN.filter(m=>m[0]===d).map(m=>`<option>${m[1]}</option>`).join("");mostrarClima();}
const grp=g=>Object.entries(C).filter(([,c])=>c.g===g).map(([k,c])=>`<option value="${k}">${c.n}</option>`).join("");
$("cul").innerHTML=`<optgroup label="Cultivos agrícolas">${grp("agr")}</optgroup><optgroup label="Pastos y forrajes para ganadería">${grp("for")}</optgroup>`;
function ajustarPrecio(){const c=C[$("cul").value];if(c.tipo!=="pasto")return;const l=$("uso").value==="leche";
  $("sP").value=l?c.pLeche:c.pCarne;$("sPl").textContent=l?"Precio de la leche (COP/litro)":"Precio ganado en pie (COP/kg)";}
function llenarCultivo(){const k=$("cul").value,c=C[k];$("var").innerHTML=c.v.map(v=>`<option>${v}</option>`).join("");
  $("sP").value=c.p||"";$("sY").value=c.y;$("sE").value=c.est;$("sM").value=c.man;
  const cic=c.tipo==="cic",pasto=c.tipo==="pasto";$("usoBox").hidden=!pasto;
  $("sPl").textContent="Precio de venta (COP/kg)";
  $("sYl").textContent=pasto?"Forraje (t materia seca/ha/año)":cic?"Rendimiento (t/ha por ciclo)":"Rendimiento adulto (t/ha/año)";
  $("sEl").textContent=cic?"Costo por ciclo (COP/ha)":"Establecimiento (COP/ha)";
  $("sM").disabled=cic;$("sMl").textContent=cic?"Mantenimiento (va en el ciclo)":"Mantenimiento (COP/ha/año)";
  if(pasto)ajustarPrecio();
  $("met").innerHTML=`<option value="mejor">El que más agua ahorra (recomendado)</option>`+c.met.map(m=>`<option value="${m}">${METODOS[m].n}</option>`).join("");}
function lugar(){if($("dep").value==="__otro")return{dep:"",mun:"su finca",reg:$("cReg").value,alt:+$("cAlt").value,t:+$("cT").value,r:+$("cR").value,dry:+$("cD").value,lat:null,lon:null};
  const m=MUN.find(x=>x[0]===$("dep").value&&x[1]===$("mun").value);return{dep:m[0],mun:m[1],reg:m[2],alt:m[3],t:m[4],r:m[5],dry:m[6],lat:m[7],lon:m[8]};}
function mostrarClima(){const L=lugar(),z=typeof ZONAS!=="undefined"&&ZONAS[ZMUN[L.mun]];$("clima").innerHTML=`<b>${REG[L.reg]}</b><br>${num(L.alt)} msnm, ${L.t} °C promedio, ${num(L.r)} mm de lluvia al año, ${L.dry} ${L.dry===1?"mes seco":"meses secos"}.`+(z?`<div class="zona"><b>Suelo típico: ${z.n}</b><br>${z.txt} pH típico ${z.ph}.</div>`:"");}
function sugerirSuelo(){const z=ZONAS[ZMUN[lugar().mun]];if(z){$("suelo").value=z.suelo;$("ph").placeholder="Típico "+z.ph;}}
function mostrarFuente(){const f=$("fuente").value;$("fCaudal").hidden=!(f==="pozo"||f==="quebrada");$("fVol").hidden=f!=="reservorio";$("fAcu").hidden=f!=="acueducto";$("fuenteHint").hidden=f==="lluvia";}
let climaCargado=null,ubicPropia=null;
$("dep").onchange=()=>{llenarMun();sugerirSuelo();climaCargado=null;ubicPropia=null;};$("mun").onchange=()=>{mostrarClima();sugerirSuelo();climaCargado=null;ubicPropia=null;};
["cAlt","cT","cR","cD","cReg"].forEach(i=>$(i).oninput=mostrarClima);
$("cul").onchange=llenarCultivo;$("uso").onchange=ajustarPrecio;$("fuente").onchange=mostrarFuente;
function disponible(){const f=$("fuente").value;
  if(f==="pozo"||f==="quebrada"){const q=+$("qLs").value||0,h=+$("horas").value||10;return{f,dia:q*3.6*h,q,h};}
  if(f==="reservorio")return{f,total:+$("vol").value||0};
  if(f==="acueducto")return{f,dia:(+$("m3mes").value||0)/30};
  return{f,dia:0};}
function supDe(c,uso){const p=+$("sP").value||(c.tipo==="pasto"?(uso==="leche"?c.pLeche:c.pCarne):c.p);
  return{p,y:+$("sY").value||c.y,est:+$("sE").value||c.est,man:c.tipo==="cic"?0:(+$("sM").value||c.man)};}
function supBase(c,uso){return{p:c.tipo==="pasto"?(uso==="leche"?c.pLeche:c.pCarne):c.p,y:c.y,est:c.est,man:c.man};}
function evaluar(k,L,ha,suelo,ph,modo,metSel,usarSup,uso,D){
  const c=C[k],A=agua(c,L,ha),met=(metSel&&metSel!=="mejor"&&c.met.includes(metSel))?metSel:A.mejor;
  const apt=aptitud(c,L,suelo,ph,modo),F=finanzas(c,L,ha,modo,met,A,usarSup?supDe(c,uso):supBase(c,uso),uso);
  const haMax=haPosibles(D,A.m[met],ha);
  return{c,A,apt,F,met,haMax,v:veredicto(apt,F,c,{modo,haMax,ha,met})};
}
function leerForm(){return{L:lugar(),k:$("cul").value,ha:Math.max(.1,+$("area").value||1),suelo:$("suelo").value,ph:+$("ph").value||null,
  modo:document.querySelector('input[name=modo]:checked').value,met:$("met").value,uso:$("uso").value,D:disponible()};}


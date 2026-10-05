// Siembro Colombia — arranque, instalación PWA y datos guardados
// Archivo cargado como script clásico: las constantes y funciones quedan globales y las usan los demás archivos.

// ---------- Inicio ----------
llenarMun();llenarCultivo();mostrarFuente();sugerirSuelo();
$("fCul").innerHTML=$("cul").innerHTML;$("fCul").onchange=pintarFicha;
$("zonasGuia").innerHTML=Object.values(ZONAS).map(z=>`<p><b>${z.n}:</b> ${z.txt} Suelo más común: ${z.suelo}, pH ${z.ph}.</p>`).join("");
$("fotosRiego").innerHTML=["goteo","micro","aspersion","surcos","inundacion"].map(m=>fig(FOTO_RIEGO[m],METODOS[m].n)).join("");

// ---------- PWA ----------
if("serviceWorker" in navigator){
  // Cuando se instala una versión nueva, se recarga una vez para no quedar con archivos viejos y nuevos mezclados.
  const habiaSW=!!navigator.serviceWorker.controller;let recargada=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{if(habiaSW&&!recargada){recargada=true;location.reload();}});
  addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));}
let promptInstalar=null;
addEventListener("beforeinstallprompt",e=>{e.preventDefault();promptInstalar=e;$("instalar").hidden=false;});
$("instalar").onclick=async()=>{if(!promptInstalar)return;promptInstalar.prompt();await promptInstalar.userChoice;promptInstalar=null;$("instalar").hidden=true;};
addEventListener("appinstalled",()=>{$("instalar").hidden=true;});
if(/iphone|ipad|ipod/i.test(navigator.userAgent)&&!(matchMedia("(display-mode: standalone)").matches||navigator.standalone))$("iosTip").hidden=false;
function red(){const on=navigator.onLine;$("net").textContent=on?"":"Sin conexión: la calculadora sigue funcionando.";$("net").className="net"+(on?"":" off");}
addEventListener("online",red);addEventListener("offline",red);red();
const CAMPOS=["dep","mun","cul","var","uso","area","ph","suelo","fuente","qLs","horas","vol","m3mes","met","cAlt","cT","cR","cD","cReg","sP","sY","sE","sM"];
function guardar(){try{const d={v:2};CAMPOS.forEach(i=>d[i]=$(i).value);d.modo=document.querySelector('input[name=modo]:checked').value;localStorage.setItem("siembro:ultimo",JSON.stringify(d));}catch(e){}}
function restaurar(){try{const d=JSON.parse(localStorage.getItem("siembro:ultimo")||"null");if(!d||d.v!==2||!C[d.cul])return false;
  $("dep").value=d.dep;llenarMun();$("mun").value=d.mun;$("cul").value=d.cul;llenarCultivo();
  CAMPOS.forEach(i=>{if(!["dep","mun","cul"].includes(i)&&d[i]!==undefined&&d[i]!=="")$(i).value=d[i];});
  const m=document.querySelector(`input[name=modo][value="${d.modo}"]`);if(m)m.checked=true;mostrarClima();mostrarFuente();return true;}catch(e){return false;}}
if(restaurar())calcular(false);
pintarInicio();
iniciarInicio();

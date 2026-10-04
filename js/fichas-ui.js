// Siembro Colombia — fotos de Wikimedia, dibujo de distancia, fertilización y pestaña Cultivos
// Archivo cargado como script clásico: las constantes y funciones quedan globales y las usan los demás archivos.

// ---------- Fotos libres de Wikipedia / Wikimedia Commons ----------
const FOTOS_MEM={};
async function buscarFoto(titulos){
  const clave=titulos.join("|");if(FOTOS_MEM[clave]!==undefined)return FOTOS_MEM[clave];
  try{const g=JSON.parse(localStorage.getItem("siembro:foto:"+clave)||"null");if(g){FOTOS_MEM[clave]=g;return g;}}catch(e){}
  for(const t of titulos){for(const lang of ["es","en"]){
    try{const r=await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t.replace(/ /g,"_"))}`);
      if(!r.ok)continue;const j=await r.json();const th=j.thumbnail&&j.thumbnail.source;if(!th)continue;
      const f={src:th.replace(/\/(\d+)px-/,"/640px-"),page:(j.content_urls&&j.content_urls.mobile&&j.content_urls.mobile.page)||"",titulo:j.title};
      FOTOS_MEM[clave]=f;try{localStorage.setItem("siembro:foto:"+clave,JSON.stringify(f));}catch(e){}return f;}catch(e){}}}
  FOTOS_MEM[clave]=null;return null;}
// Llena los <figure data-foto="título1|título2"> que haya dentro de un contenedor
function cargarFotos(cont){cont.querySelectorAll("figure[data-foto]:not([data-ok])").forEach(async fig=>{
  fig.dataset.ok="1";const f=await buscarFoto(fig.dataset.foto.split("|"));
  if(!f){fig.innerHTML=`<div class="sinfoto">${navigator.onLine?"Sin foto disponible":"Las fotos se ven cuando hay conexión"}</div>`;return;}
  fig.innerHTML=`<img src="${f.src}" alt="${fig.dataset.alt||f.titulo}" loading="lazy" onerror="this.parentNode.innerHTML='<div class=sinfoto>Las fotos se ven cuando hay conexión</div>'"><figcaption>${fig.dataset.alt||f.titulo}. Foto: Wikimedia Commons${f.page?` (<a href="${f.page}" target="_blank" rel="noopener">fuente y licencia</a>)`:""}</figcaption>`;});}
const fig=(titulos,alt,cls="")=>`<figure class="foto ${cls}" data-foto="${titulos.join("|")}" data-alt="${alt}"><div class="sinfoto">Cargando foto…</div></figure>`;

// ---------- Dibujo de la distancia de siembra ----------
function dibujoDistancia(c,F){
  if(!F.dist)return `<p>${F.dSiembra}</p>`;
  const [a,b]=F.dist,cols=5,rows=3,W=320,H=200,px=40,py=40,dx=(W-2*px)/(cols-1),dy=(H-2*py-20)/(rows-1);
  let s=`<svg class="dist" viewBox="0 0 ${W} ${H}" role="img" aria-label="Distancia de siembra ${num(a,2)} metros entre surcos y ${num(b,2)} metros entre plantas">`;
  for(let r=0;r<rows;r++){s+=`<line x1="${px-18}" x2="${W-px+18}" y1="${py+r*dy}" y2="${py+r*dy}" stroke="var(--tierra)" stroke-opacity=".35" stroke-width="6" stroke-linecap="round"/>`;
    for(let k=0;k<cols;k++)s+=`<circle cx="${px+k*dx}" cy="${py+r*dy}" r="8" fill="var(--leaf)"/><path d="M${px+k*dx} ${py+r*dy-6}q-7-9 0-15q7 6 0 15" fill="var(--leaf-soft)" stroke="var(--leaf)" stroke-width="1.2"/>`;}
  const yb=py+(rows-1)*dy+28;
  s+=`<g stroke="var(--ocre)" stroke-width="1.6" fill="var(--ocre)"><line x1="${px}" x2="${px+dx}" y1="${yb}" y2="${yb}"/><path d="M${px} ${yb}l6 -4v8zM${px+dx} ${yb}l-6 -4v8z"/>
   <line x1="${W-px+26}" x2="${W-px+26}" y1="${py}" y2="${py+dy}"/><path d="M${W-px+26} ${py}l-4 6h8zM${W-px+26} ${py+dy}l-4 -6h8z"/></g>
   <text x="${px+dx/2}" y="${yb+18}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">${num(b,2)} m entre plantas</text>
   <text x="${W-px+12}" y="${py+dy/2}" text-anchor="end" font-size="13" font-weight="700" fill="var(--ink)" transform="rotate(-90 ${W-px+12} ${py+dy/2})" dy="0">${num(a,2)} m</text></svg>`;
  return s+`<p class="hint">${num(a,2)} m entre surcos o hileras × ${num(b,2)} m entre plantas = ${num(10000/(a*b))} plantas por hectárea.</p>`;
}
function fertTexto(c,F,ha){
  const [N,P,K]=F.fert,per=c.tipo==="per";
  const urea=N/.46/50,dap=P/.46/50,kcl=K/.6/50;
  return `<div class="kv"><div><small>Nitrógeno (N)</small><b>${N} kg/ha</b></div><div><small>Fósforo (P₂O₅)</small><b>${P} kg/ha</b></div><div><small>Potasio (K₂O)</small><b>${K} kg/ha</b></div></div>
  <p>${per||c.tipo==="pasto"?"Al año":"Por ciclo"}, para ${num(ha,1)} ha equivale aproximadamente a <b>${num(urea*ha,1)} bultos de urea</b>, <b>${num(dap*ha,1)} de DAP</b> y <b>${num(kcl*ha,1)} de cloruro de potasio</b> (bultos de 50 kg)${per&&c.dens<3000?`, unos ${num((urea+dap+kcl)*50*1000/c.dens)} gramos de fertilizante por planta al año repartidos en 2 o 3 aplicaciones`:""}.</p>
  <p class="hint">El DAP también trae nitrógeno, así que puede bajar un poco la urea. Reparta el fertilizante en varias aplicaciones con el suelo húmedo, agregue abono orgánico y ajuste siempre con un análisis de suelo.</p>`;}
function fichaHTML(k,ha,completa){
  const c=C[k],F=FICHA[k];if(!F)return "";
  const prodTxt=c.tipo==="pasto"?`${num(c.y,0)} t de materia seca por ha al año`:c.tipo==="cic"?`${num(c.y,1)} t por ha por ciclo (${c.prod})`:`${num(c.y,1)} t por ha al año en plena producción (${c.prod})`;
  const plagas=F.plagas.map(([n,w])=>`<li>${n}${w&&completa?` <button type="button" class="link" data-plaga="${w}" data-n="${n}">Ver foto</button>`:""}</li>`).join("");
  return `${fig(F.w,c.n,"grande")}
   <div class="kv"><div><small>Producción</small><b>${prodTxt}</b></div><div><small>Semilla por ha</small><b>${num(c.dens)} ${c.u}</b></div><div><small>Ciclo</small><b>${F.ciclo}</b></div><div><small>Clima</small><b>${c.t[0]}–${c.t[1]} °C, ${num(c.alt[0])}–${num(c.alt[1])} msnm</b></div><div><small>Suelo y pH</small><b>${Object.entries(c.s).filter(([,v])=>v>=.95).map(([s])=>s).join(", ")}; pH ${c.ph[0]}–${c.ph[1]}</b></div></div>
   <h3>Distancia de siembra</h3>${dibujoDistancia(c,F)}
   <h3>Cómo se cultiva</h3><ol class="tight">${F.pasos.map(p=>`<li>${p}</li>`).join("")}</ol>
   <h3>Abonos y fertilizantes</h3>${fertTexto(c,F,ha)}
   <h3>Plagas y enfermedades principales</h3><ul class="tight">${plagas}</ul>${completa?'<div class="plagaFoto"></div>':""}
   ${completa?`<h3>Riego recomendado</h3><p>${c.met.map(m=>METODOS[m].n).join(", ")}. El que más agua ahorra: <b>${METODOS[[...c.met].sort((a,b)=>METODOS[b].ef-METODOS[a].ef)[0]].n.toLowerCase()}</b>.</p>
   <h3>Dónde comprar semilla</h3><p>${c.d}</p>`:""}`;}
function activarPlagas(cont){cont.querySelectorAll("button[data-plaga]").forEach(b=>b.onclick=()=>{
  const box=b.closest(".card,.fichaBox").querySelector(".plagaFoto");box.innerHTML=fig([b.dataset.plaga],b.dataset.n);cargarFotos(box);box.scrollIntoView({block:"nearest"});});}
// ---------- Pestaña Cultivos ----------
function pintarFicha(){const k=$("fCul").value,box=$("fichaOut");box.innerHTML=`<div class="card fichaBox"><h2>${C[k].n}</h2>${fichaHTML(k,1,true)}<button type="button" class="sec" onclick="usarEnCalculo('${k}')">Calcular rentabilidad de este cultivo</button></div>`;cargarFotos(box);activarPlagas(box);}
function usarEnCalculo(k){$("cul").value=k;llenarCultivo();abrirTab("calc");calcular(true);}
function verFicha(k){$("fCul").value=k;abrirTab("cultivos");pintarFicha();}

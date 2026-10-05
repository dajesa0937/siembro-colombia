// Siembro Colombia — ilustraciones y animaciones (SVG + CSS). No cambia ningún cálculo.
// Archivo cargado como script clásico. Las animaciones se apagan solas con "reducir movimiento" del sistema.

const REDUCIR=matchMedia("(prefers-reduced-motion: reduce)").matches;

function broteSVG(){
  return `<svg class="brote" viewBox="0 0 84 84" aria-hidden="true"><ellipse cx="42" cy="74" rx="26" ry="5" fill="var(--tierra)" opacity=".35"/>
  <g class="m"><path d="M42 74V38" stroke="var(--leaf)" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M42 54c-16 0-24-8-24-24c16 0 24 8 24 24z" fill="var(--leaf)"/><path d="M42 44c0-16 8-24 24-24c0 16-8 24-24 24z" fill="var(--leaf)" opacity=".75"/></g></svg>`;
}
const ICO={
  ok:`<svg class="ico" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" opacity=".25"/><g class="hj"><path d="M32 50V26"/><path d="M32 36c-10 0-15-5-15-15c10 0 15 5 15 15z"/><path d="M32 30c0-10 5-15 15-15c0 10-5 15-15 15z"/></g></svg>`,
  mid:`<svg class="ico" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 8L58 54H6z"/><path d="M32 26v14"/><path d="M32 47v1"/></svg>`,
  no:`<svg class="ico" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26"/><path d="M22 22l20 20M42 22L22 42"/></svg>`
};
function tiempoSVG(code){
  const sol=`<circle class="sol-c" cx="50" cy="50" r="17"/><g class="rayos">${[0,45,90,135,180,225,270,315].map(a=>`<path d="M50 20v-9" transform="rotate(${a} 50 50)"/>`).join("")}</g>`;
  const nube=(y=0)=>`<g class="nube-g" transform="translate(0 ${y})"><ellipse class="nube-c" cx="50" cy="60" rx="30" ry="14"/><ellipse class="nube-c" cx="38" cy="52" rx="16" ry="13"/><ellipse class="nube-c" cx="60" cy="48" rx="19" ry="15"/></g>`;
  const lluvia=`<g class="lluvia"><path d="M34 78v10"/><path d="M50 78v10"/><path d="M66 78v10"/></g>`;
  let inner;
  if(code<=1)inner=sol;
  else if(code===2)inner=`<g transform="translate(14 -10) scale(.75)">${sol}</g>${nube(4)}`;
  else if(code>=95)inner=`${nube(-8)}<path class="rayo" d="M52 62l-10 16h8l-4 14l16-20h-9z"/>${lluvia.replace(/<path d="M50 78v10"\/>/,"")}`;
  else if((code>=51&&code<=67)||(code>=80&&code<=82))inner=`${nube(-8)}${lluvia}`;
  else inner=nube(0);
  return `<svg class="tiempo" viewBox="0 0 100 100" aria-hidden="true">${inner}</svg>`;
}
function riegoSVG(){
  const gts=[40,95,150,205,260].map((x,i)=>`<path class="gt" style="--d:${(i*.25).toFixed(2)}s" d="M${x} 6q-5 8 0 12q5-4 0-12z"/>`).join("");
  const pl=[40,95,150,205,260].map(x=>`<g class="planta"><path d="M${x} 56V42"/><path d="M${x} 48q-8 0-9-8q8 0 9 8z" fill="var(--leaf)"/><path d="M${x} 46q8 0 9-8q-8 0-9 8z" fill="var(--leaf)"/></g>`).join("");
  return `<svg class="riegoAnim" viewBox="0 0 300 64" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><rect class="suelo" x="0" y="56" width="300" height="8" rx="3"/>${gts}${pl}</svg>`;
}

// Números que "suben" hasta su valor: conserva símbolos y formato colombiano (1.234,5).
function contar(el){
  const t=el.textContent,m=t.match(/\d[\d.]*(?:,\d+)?/);if(!m)return;
  const dec=m[0].includes(",")?m[0].split(",")[1].length:0,fin=parseFloat(m[0].replace(/\./g,"").replace(",","."));
  if(!isFinite(fin)||fin===0)return;
  const pre=t.slice(0,m.index),post=t.slice(m.index+m[0].length),t0=performance.now(),dur=900;
  const paso=ahora=>{const p=Math.min(1,(ahora-t0)/dur),e=1-Math.pow(1-p,3);
    el.textContent=pre+(fin*e).toLocaleString("es-CO",{minimumFractionDigits:dec,maximumFractionDigits:dec})+post;
    if(p<1)requestAnimationFrame(paso);else el.textContent=t;};
  requestAnimationFrame(paso);
}
function animarResultado(root){
  const v=root.querySelector(".verdict");
  if(v){const k=v.classList.contains("ok")?"ok":v.classList.contains("mid")?"mid":"no";v.insertAdjacentHTML("afterbegin",ICO[k]);}
  if(!REDUCIR)root.querySelectorAll(".big b").forEach(contar);
}
function animarClima(root,code){
  const a=root.querySelector(".ahora");
  if(a&&code!=null)a.insertAdjacentHTML("afterbegin",tiempoSVG(code));
  const h=root.querySelector(".card.agua .hoy");
  if(h&&/^Riegue/.test(h.textContent))h.insertAdjacentHTML("afterend",riegoSVG());
}

// Arranque: brote en el estado vacío.
(function(){
  const e=document.querySelector("#out .empty");if(e)e.insertAdjacentHTML("afterbegin",broteSVG());
})();

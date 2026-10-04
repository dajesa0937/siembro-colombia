// Siembro Colombia — ilustraciones y animaciones (SVG + CSS). No cambia ningún cálculo.
// Archivo cargado como script clásico. Las animaciones se apagan solas con "reducir movimiento" del sistema.

const REDUCIR=matchMedia("(prefers-reduced-motion: reduce)").matches;

// Una planta joven (maíz/hoja) con su base en (0,0). t = tamaño.
const planta=(x,y,t,d)=>`<g transform="translate(${x} ${y}) scale(${t})"><g class="planta" style="--d:${d}s"><g class="mece">
  <path class="tallo" d="M0 0V-46"/><path class="hoja" d="M0 -14q-20-2-26-20q20-2 26 20z"/><path class="hoja" d="M0 -26q20-2 26-20q-20-2-26 20z"/><path class="hoja" d="M0 -44q-9-11 0-24q9 13 0 24z"/></g></g></g>`;

function heroSVG(){
  return `<svg class="hero" viewBox="0 0 900 230" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Campo colombiano con sol, nubes y plantas creciendo">
  <g class="sol"><circle cx="600" cy="56" r="26" fill="#E8A91F"/>${[0,45,90,135,180,225,270,315].map(a=>`<path d="M600 ${56-38}v-12" stroke="#E8A91F" stroke-width="5" stroke-linecap="round" transform="rotate(${a} 600 56)"/>`).join("")}</g>
  <g class="nube n1"><ellipse cx="120" cy="52" rx="46" ry="16"/><ellipse cx="96" cy="44" rx="26" ry="16"/><ellipse cx="144" cy="42" rx="30" ry="18"/></g>
  <g class="nube n2"><ellipse cx="320" cy="92" rx="38" ry="12"/><ellipse cx="302" cy="86" rx="20" ry="12"/><ellipse cx="336" cy="84" rx="24" ry="14"/></g>
  <g class="nube n3"><ellipse cx="760" cy="34" rx="36" ry="12"/><ellipse cx="744" cy="28" rx="20" ry="12"/><ellipse cx="776" cy="27" rx="22" ry="13"/></g>
  <path class="loma1" d="M0 150C140 112 300 112 450 140S760 160 900 120V230H0z"/>
  <path class="loma2" d="M0 182C160 150 330 168 500 178S780 168 900 156V230H0z"/>
  <path class="surco" d="M-10 205C200 184 420 196 910 176" opacity=".55"/><path class="surco" d="M-10 222C220 204 460 214 910 198" opacity=".45"/>
  <circle class="gota" style="--d:0s" cx="262" cy="110" r="3.4"/><circle class="gota" style="--d:.9s" cx="276" cy="104" r="3.4"/><circle class="gota" style="--d:1.7s" cx="290" cy="112" r="3.4"/>
  ${planta(230,196,.9,0)}${planta(330,200,1.15,.25)}${planta(450,198,1.3,.5)}${planta(580,203,1.05,.75)}${planta(700,200,1.2,1)}${planta(800,205,.85,1.2)}
  </svg>`;
}
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

// Arranque: campo animado en el encabezado y brote en el estado vacío.
(function(){
  const b=document.querySelector("header.top .pwabar");if(b)b.insertAdjacentHTML("beforebegin",heroSVG());
  const e=document.querySelector("#out .empty");if(e)e.insertAdjacentHTML("afterbegin",broteSVG());
})();

// Siembro — utilidades de formato y acceso al DOM
// Archivo cargado como script clásico: las constantes y funciones quedan globales y las usan los demás archivos.

const $=id=>document.getElementById(id);
const cop=n=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(Math.round(n));
const millones=n=>{const a=Math.abs(n),s=n<0?"−":"";return a>=1e6?s+"$"+(a/1e6).toLocaleString("es-CO",{maximumFractionDigits:1})+" M":s+"$"+Math.round(a).toLocaleString("es-CO")};
const num=(n,d=0)=>(+n).toLocaleString("es-CO",{maximumFractionDigits:d});
const color=v=>v>=.75?"var(--leaf)":v>=.45?"var(--ocre)":"var(--aji)";

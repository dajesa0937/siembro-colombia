// Siembro Colombia — semillas de pasto de clima cálido (catálogo SOESP / Durespo, "Semillas de pasto forrajero para clima cálido")
// Archivo cargado como script clásico: PASTOS queda global. Son datos de un catálogo comercial (el vendedor), pensados como guía:
// confirme en su finca con la UMATA, Agrosavia o un técnico antes de sembrar muchas hectáreas.
// Niveles: 3 = alta, 2 = media, 1 = baja (en "exig", 3 = muy exigente en fertilidad).
// puntos = puntos de valor cultural (PVC) que recomienda el catálogo; kg/ha = puntos / %VC de la bolsa (con VC 75 → kgRef).
const PASTOS=[
{k:"decumbens",n:"Brachiaria decumbens cv. Basilisk",g:"Brachiaria",crec:"Decumbente",
 estab:3,cobert:3,acido:3,exig:1,resp:2,heno:1,calidad:2,mion:1,manejo:3,encharc:1,pastInt:3,erradic:1,foto:1,frioSeq:3,silaje:0,
 puntos:375,kgRef:5,germ:[7,21],altPast:15,diasPast:[90,120],prot:8,ms:18,palat:"Buena",lluviaMin:800,altMax:2000,
 nota:"Muy fácil de sembrar y aguanta suelo ácido y pobre. Es sensible al salivazo (mión) y al encharcamiento, y puede causar fotosensibilidad en animales jóvenes."},
{k:"humidicola",n:"Brachiaria humidicola cv. Comum",g:"Brachiaria",crec:"Estolonífero",
 estab:1,cobert:3,acido:3,exig:1,resp:2,heno:0,calidad:1,mion:3,manejo:3,encharc:3,pastInt:3,erradic:1,foto:1,frioSeq:3,silaje:0,
 puntos:280,kgRef:6,germ:[15,30],altPast:10,diasPast:[120,180],prot:5,ms:12,palat:"Buena",lluviaMin:700,altMax:1200,
 nota:"Sirve para suelos pobres, ácidos y que se inundan. Demora en establecerse y su forraje es de baja proteína; puede causar fotosensibilidad."},
{k:"llanero",n:"Brachiaria humidicola cv. Llanero (Dictyoneura)",g:"Brachiaria",crec:"Estolonífero",
 estab:1,cobert:3,acido:2,exig:2,resp:2,heno:0,calidad:2,mion:3,manejo:3,encharc:2,pastInt:3,erradic:1,foto:0,frioSeq:3,silaje:0,
 puntos:280,kgRef:6,germ:[15,30],altPast:10,diasPast:[120,180],prot:6,ms:12,palat:"Buena",lluviaMin:700,altMax:1200,
 nota:"Parecido al humidicola pero sin fotosensibilidad y con forraje un poco mejor. Demora en establecerse."},
{k:"marandu",n:"Brachiaria brizantha cv. Marandú",g:"Brachiaria",crec:"Macolla",
 estab:3,cobert:3,acido:1,exig:2,resp:3,heno:0,calidad:3,mion:3,manejo:2,encharc:1,pastInt:2,erradic:2,foto:0,frioSeq:2,silaje:3,
 puntos:375,kgRef:5,germ:[7,21],altPast:25,diasPast:[90,120],prot:10,ms:16,palat:"Buena",lluviaMin:800,altMax:1800,
 nota:"Buen forraje y resistente al salivazo. Pide suelos de fertilidad media (no aguanta suelo ácido ni encharcado) y responde bien al abono."},
{k:"xaraes",n:"Brachiaria brizantha cv. Xaraés (Toledo)",g:"Brachiaria",crec:"Macolla",
 estab:3,cobert:2,acido:1,exig:2,resp:3,heno:0,calidad:3,mion:3,manejo:1,encharc:2,pastInt:2,erradic:2,foto:0,frioSeq:2,silaje:3,
 puntos:375,kgRef:5,germ:[7,21],altPast:25,diasPast:[90,120],prot:12,ms:19,palat:"Buena",lluviaMin:700,altMax:1600,
 nota:"Produce más que el Marandú y tiene más proteína. Aguanta un poco de encharcamiento, pero no el suelo ácido. Pide buen manejo del pastoreo."},
{k:"ruzi",n:"Brachiaria ruziziensis cv. Ruzi",g:"Brachiaria",crec:"Macolla",
 estab:2,cobert:3,acido:2,exig:2,resp:3,heno:3,calidad:3,mion:1,manejo:2,encharc:1,pastInt:2,erradic:2,foto:0,frioSeq:3,silaje:0,
 puntos:375,kgRef:5,germ:[15,30],altPast:10,diasPast:[90,120],prot:10,ms:16,palat:"Excelente",lluviaMin:800,altMax:1800,
 nota:"Muy sabroso para el ganado y sirve para heno. Aguanta mejor la sequía, pero el salivazo lo ataca fuerte y no le gusta el encharcamiento."},
{k:"tanzania",n:"Panicum maximum cv. Tanzania",g:"Panicum",crec:"Macolla (matojo)",
 estab:3,cobert:2,acido:1,exig:3,resp:3,heno:3,calidad:3,mion:2,manejo:1,encharc:1,pastInt:3,erradic:3,foto:0,frioSeq:1,silaje:3,
 puntos:250,kgRef:3.5,germ:[7,28],altPast:30,diasPast:[90,120],prot:14,ms:24,palat:"Excelente",lluviaMin:800,altMax:1600,
 nota:"Produce mucho y es muy sabroso, pero pide suelo fértil y buen abono, y no aguanta suelo ácido, encharcamiento ni sequía larga."},
{k:"mombasa",n:"Panicum maximum cv. Mombasa (Mombaça)",g:"Panicum",crec:"Macolla (matojo)",
 estab:3,cobert:2,acido:1,exig:3,resp:3,heno:3,calidad:3,mion:2,manejo:1,encharc:1,pastInt:3,erradic:3,foto:0,frioSeq:1,silaje:3,
 puntos:250,kgRef:3.5,germ:[7,28],altPast:30,diasPast:[90,120],prot:14,ms:25,palat:"Excelente",lluviaMin:800,altMax:1600,
 nota:"El que más forraje da del catálogo. Pide suelo fértil, abono y agua; en suelo pobre, ácido o sin riego en verano no rinde."}
];
const NIVEL3=["—","Baja","Media","Alta"];

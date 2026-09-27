// Dev-only: extrae productos de la web anterior (laboratoriolamar.com)
const fs = require("fs");
const cats = ["aminoacidos","antialergicos","antibacterianos","antibioticos","anticinestocicos","anticonceptivos","anticonvulcionantes","anticonvulsivantes","antidiarreicos","antihelminticos","antiemeticos","antihistaminicos","antiinflamatorios","antimicoticos","antiparasitarios","antisepticos","bactericidas","coccidicidas","corticoides","diureticos","energizantes","estimulantes","expectorantes","fluidificantes","glucocorticoides","hormona_tiroidea","inhibidores_celo","inhibidores_crecimiento_tumoral","inmunosupresores","laxantes","lubrificantes","miorelajantes","moduladores_conducta","preanestesicos","pulguicidas","quimioterapicos","tranquilizantes"];
const ent = s => s.replace(/<br\s*\/?>/gi," ").replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#(\d+);/g,(m,n)=>String.fromCharCode(+n)).replace(/&([a-z]+);/gi,(m,n)=>({aacute:"á",eacute:"é",iacute:"í",oacute:"ó",uacute:"ú",ntilde:"ñ",Aacute:"Á",Eacute:"É",Iacute:"Í",Oacute:"Ó",Uacute:"Ú",Ntilde:"Ñ",deg:"°",ordm:"º",szlig:"ß",beta:"β",micro:"µ",lt:"<",gt:">",uuml:"ü"}[n]||m)).replace(/\s+/g," ").trim();
const nav = new Set(["INICIO","LA EMPRESA","NOVEDADES","PRODUCTOS","PROMOCIONES","VADEMÉCUM","CONTACTO","REGISTRARSE","VER MÁS DETALLES","Por una mejor calidad de vida de las mascotas"]);
const footer = /^(Monteagudo|Provincia de|República|\+54|Copyrights|webmaster)/;
(async () => {
  const P = {}; const imgsByCat = {};
  for (const cat of cats) {
    let html = await (await fetch("http://www.phone.laboratoriolamar.com/" + cat + ".html")).text();
    html = html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");
    imgsByCat[cat] = [...html.matchAll(/<img[^>]+src="([^"?]+)/g)].map(m => m[1]).filter(s => !/blank|logo_|pets_back|\/u\d+|construccion/.test(s));
    const lines = [...html.matchAll(/<(p|h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(m => ent(m[2])).filter(x => x && !nav.has(x));
    let cur = null, field = null;
    for (const l of lines) {
      if (footer.test(l)) break;
      if (/^[A-ZÁÉÍÓÚÑ ]+:.+/.test(l)) continue;
      const fm = l.match(/^([A-ZÁÉÍÓÚÑ ]+):$/);
      if (fm) { field = fm[1].trim(); continue; }
      if (l.includes("|")) continue;
      if (/^[A-ZÁÉÍÓÚÑ0-9 .\-,]+$/.test(l) && l.length < 45) {
        let name = l.trim(); if (name === "CLINDAMICIN") name = "CLINDAMICINA";
        cur = P[name] || (P[name] = { name, cats: [], fields: {} });
        if (!cur.cats.includes(cat)) cur.cats.push(cat);
        field = null; continue;
      }
      if (cur && field) { const f = cur.fields; (f[field] ||= []); if (!f[field].includes(l)) f[field].push(l); }
    }
  }
  fs.writeFileSync("products-raw.json", JSON.stringify({ products: Object.values(P), imgsByCat }, null, 1));
  console.log(Object.keys(P).length + " productos");
})();

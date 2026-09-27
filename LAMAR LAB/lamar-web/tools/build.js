// Dev-only: arma las páginas finales (raíz del sitio) a partir de tools/src/*.html
// y del catálogo. Uso:  node tools/build.js
// Las páginas generadas son HTML estático puro: no hace falta Node para publicarlas.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(__dirname, "src");
const VERSION = "20260927";
const SITE_URL = "https://www.laboratoriolamar.com/";
const cat = require("./catalog.js");
const raw = require("./products-raw.json").products;

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const tidy = (s) => s.replace(/ßlactámicos/g, "β-lactámicos").replace(/prea-nestésico/g, "preanestésico").replace(/\s+([.,;:])/g, "$1").replace(/\.(?=[A-ZÁÉÍÓÚ])/g, ". ");

// ---------- Catálogo ----------
const lineById = Object.fromEntries(cat.lines.map((l) => [l.id, l]));
const FIELD_LABEL = {
  "DESCRIPCIÓN": "Descripción", "INDICACIONES DE USO": "Descripción", "PRESENTACIÓN": "Presentación",
  "COMPOSICIÓN Y PRESENTACIONES": "Composición y presentaciones", "INDICACIONES": "Indicaciones", "DOSIFICACIÓN": "Dosificación",
};
const FIELD_ORDER = ["Descripción", "Composición y presentaciones", "Presentación", "Indicaciones", "Dosificación"];

const products = cat.products.map((p) => {
  const r = raw.find((x) => x.name === p.key);
  if (!r) throw new Error("Falta en products-raw.json: " + p.key);
  const fields = {};
  for (const [k, v] of Object.entries(r.fields)) {
    const label = FIELD_LABEL[k] || k.charAt(0) + k.slice(1).toLowerCase();
    fields[label] = v.map(tidy);
  }
  const ordered = FIELD_ORDER.filter((f) => fields[f]).map((f) => ({ label: f, paras: fields[f] }));
  const desc = (fields["Descripción"] || [""])[0];
  const summary = desc.length > 150 ? desc.slice(0, desc.lastIndexOf(" ", 150)) + "…" : desc;
  return { ...p, id: slug(p.name), lineName: lineById[p.line].name, tone: lineById[p.line].tone, fields: ordered, summary };
});
products.forEach((p) => { if (!lineById[p.line]) throw new Error("Línea desconocida: " + p.line); });
const ESPECIE = { ambos: "Perros y gatos", perros: "Perros", gatos: "Gatos" };

// ---------- Fragmentos ----------
const ICON = `<svg class="hex-icon" viewBox="0 0 260 307" aria-hidden="true" focusable="false"><use href="#lamar-hex"/></svg>`;
const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    <mask id="lamar-hex-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="260" height="307">
      <path d="M130 8 L252 80 L252 227 L130 299 L8 227 L8 80 Z" fill="#fff" stroke="#fff" stroke-width="16" stroke-linejoin="round"/>
      <polyline points="97,47 -23,118 20,164" fill="none" stroke="#000" stroke-width="10"/>
      <polyline points="137,59 13,132 65,210" fill="none" stroke="#000" stroke-width="10"/>
    </mask>
    <symbol id="lamar-hex" viewBox="0 0 260 307">
      <rect width="260" height="307" fill="currentColor" mask="url(#lamar-hex-mask)"/>
    </symbol>
  </defs>
</svg>`;
const LOGO = `<span class="logo">${ICON}<span class="logo-word"><span class="logo-name">Lamar</span><span class="logo-sub">Laboratorio</span></span></span>`;

const NAV = [
  ["inicio", "index.html", "Inicio"],
  ["empresa", "empresa.html", "Empresa"],
  ["productos", "productos.html", "Productos"],
  ["vademecum", "vademecum.html", "Vademécum"],
  ["distribuidores", "distribuidores.html", "Distribuidores"],
  ["trabaja", "trabaja-con-nosotros.html", "Enviar CV"],
];

function header(active) {
  const links = NAV.map(([id, href, label]) =>
    `<li><a href="${href}"${id === active ? ' aria-current="page"' : ""}>${label}</a></li>`).join("\n          ");
  return `<a class="skip-link" href="#main">Saltar al contenido</a>
  ${SPRITE}
  <header class="site-header" data-header>
    <div class="container header-inner">
      <a class="header-logo" href="index.html" aria-label="Laboratorio Lamar — Inicio">${LOGO}</a>
      <nav class="main-nav" aria-label="Principal">
        <ul class="nav-list">
          ${links}
        </ul>
      </nav>
      <a class="btn btn-primary btn-sm header-cta${active === "contacto" ? " is-current" : ""}" href="contacto.html">Contacto</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" data-nav-toggle>
        <span class="sr-only">Abrir menú</span><span class="nav-toggle-bars" aria-hidden="true"></span>
      </button>
    </div>
  </header>
  <div class="mobile-nav" id="mobile-nav" data-mobile-nav hidden>
      <ul>
        ${NAV.map(([id, href, label], i) => `<li style="--i:${i}"><a href="${href}"${id === active ? ' aria-current="page"' : ""}>${label}</a></li>`).join("\n        ")}
        <li style="--i:${NAV.length}"><a href="contacto.html"${active === "contacto" ? ' aria-current="page"' : ""}>Contacto</a></li>
      </ul>
      <p class="mobile-nav-foot">Monteagudo 2113, San Fernando · <a href="tel:+541147144423">+54 11 4714-4423</a></p>
  </div>`;
}

const FOOTER = `<footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a href="index.html" aria-label="Laboratorio Lamar — Inicio">${LOGO}</a>
        <p>Medicamentos veterinarios para perros y gatos. Desarrollados y elaborados en Argentina desde 1986.</p>
      </div>
      <div>
        <h2 class="footer-title">Sitio</h2>
        <ul class="footer-links">
          <li><a href="empresa.html">Empresa</a></li>
          <li><a href="productos.html">Productos</a></li>
          <li><a href="vademecum.html">Vademécum</a></li>
          <li><a href="assets/docs/vademecum-lamar.pdf" download>Vademécum en PDF</a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer-title">Trabajemos juntos</h2>
        <ul class="footer-links">
          <li><a href="distribuidores.html">Distribuidores</a></li>
          <li><a href="trabaja-con-nosotros.html">Enviar CV</a></li>
          <li><a href="contacto.html">Contacto</a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer-title">Laboratorio</h2>
        <address class="footer-address">
          <a href="https://www.google.com/maps/search/?api=1&amp;query=Monteagudo+2113+San+Fernando+Buenos+Aires" target="_blank" rel="noopener">Monteagudo 2113, San Fernando<br>Provincia de Buenos Aires, Argentina</a><br>
          <a href="tel:+541147144423">+54 11 4714-4423 / 4856</a>
        </address>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>© <span data-year>2026</span> Laboratorio Lamar S.R.L. Todos los derechos reservados.</p>
      <p>Productos de uso veterinario. Consulte a su médico veterinario. · <a href="creditos.html">Créditos de imágenes</a></p>
    </div>
  </footer>`;

function head({ title, desc, page }) {
  const full = page === "inicio" ? "Laboratorio Lamar — Medicamentos veterinarios desde 1986" : `${title} — Laboratorio Lamar`;
  return `<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(full)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="theme-color" content="#5E3F5A">
  <meta property="og:title" content="${esc(full)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Laboratorio Lamar">
  <meta property="og:locale" content="es_AR">
  <meta property="og:image" content="${SITE_URL}assets/img/og-lamar.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;1,300&amp;display=swap">
  <link rel="stylesheet" href="styles.css?v=${VERSION}">
  <script>document.documentElement.classList.add("js");try{if(!sessionStorage.getItem("lamar-splash")){document.documentElement.classList.add("show-splash");sessionStorage.setItem("lamar-splash","1")}}catch(e){}</script>`;
}

const SPLASH = `<div class="splash" data-splash aria-hidden="true">
    <svg class="splash-hex" viewBox="-20 -20 300 347"><path pathLength="1" d="M130 8 L252 80 L252 227 L130 299 L8 227 L8 80 Z"/><polyline pathLength="1" points="97,47 13,96"/><polyline pathLength="1" points="137,59 13,132 65,210"/></svg>
    <span class="splash-word">Lamar</span>
  </div>`;

const SCRIPTS = `<script defer src="lib/gsap.min.js"></script>
  <script defer src="lib/ScrollTrigger.min.js"></script>
  <script defer src="lib/manifest.js?v=${VERSION}"></script>
  <script defer src="main.js?v=${VERSION}"></script>`;

function pack(p, { tag = "article", attrs = "" } = {}) {
  return `<${tag} class="pack tone-${p.tone}" ${attrs}>
          <span class="pack-top"><span class="pack-brand">Lamar<small>Laboratorio</small></span></span>
          <span class="pack-body">
            <span class="pack-cat">${esc(p.tipo)}</span>
            <span class="pack-name">${esc(p.name)}</span>
            <span class="pack-rule"></span>
            <span class="pack-meta">${esc(p.formas.join(" · "))}</span>
            <span class="pack-foot">LABORATORIO_<b>Lamar</b></span>
          </span>
        </${tag}>`;
}

function productCard(p) {
  return `<li class="product-card reveal" data-product="${p.id}" data-line="${p.line}" data-especie="${p.especie}" data-search="${esc(slug([p.name, p.tipo, p.lineName, p.summary].join(" ")).replace(/-/g, " "))}">
        <a class="product-link" href="vademecum.html#${p.id}" data-open-product="${p.id}">
          ${pack(p, { tag: "span", attrs: 'aria-hidden="true"' })}
          <span class="product-info">
            <span class="product-line">${esc(p.lineName)}</span>
            <span class="product-name">${esc(p.name)}</span>
            <span class="product-summary">${esc(p.summary)}</span>
            <span class="product-tags"><span class="tag">${ESPECIE[p.especie]}</span>${p.formas.map((f) => `<span class="tag">${esc(f.split(" ")[0])}</span>`).filter((v, i, a) => a.indexOf(v) === i).join("")}</span>
            <span class="product-more">Ver ficha técnica <span aria-hidden="true">→</span></span>
          </span>
        </a>
      </li>`;
}

const PRODUCT_GRID = `<ul class="product-grid" data-product-grid>
      ${products.map(productCard).join("\n      ")}
    </ul>`;

const LINE_FILTERS = [`<button type="button" class="chip is-active" data-filter-line="todas" aria-pressed="true">Todas <span>${products.length}</span></button>`]
  .concat(cat.lines.map((l) => `<button type="button" class="chip" data-filter-line="${l.id}" aria-pressed="false">${esc(l.name)} <span>${products.filter((p) => p.line === l.id).length}</span></button>`))
  .join("\n        ");

const LINES_GRID = `<ol class="lines-grid">
      ${cat.lines.map((l, i) => {
        const items = products.filter((p) => p.line === l.id);
        return `<li class="line-card reveal tone-${l.tone}" style="--d:${(i % 4) * 70}ms">
        <a href="productos.html?linea=${l.id}">
          <span class="line-num">${String(i + 1).padStart(2, "0")}</span>
          <span class="line-name">${esc(l.name)}</span>
          <span class="line-short">${esc(l.short)}</span>
          <span class="line-count">${items.length} ${items.length === 1 ? "producto" : "productos"} <span aria-hidden="true">→</span></span>
        </a>
      </li>`;
      }).join("\n      ")}
    </ol>`;

const FEATURED = `<ul class="featured-row">
      ${cat.featured.map((id, i) => {
        const p = products.find((x) => x.id === id);
        return `<li class="featured-item reveal" style="--d:${i * 90}ms">
        <a href="vademecum.html#${p.id}" data-open-product="${p.id}" data-tilt>
          ${pack(p, { tag: "span", attrs: 'aria-hidden="true"' })}
          <span class="featured-caption"><span class="featured-name">${esc(p.name)}</span><span class="featured-tipo">Ver ficha técnica <span aria-hidden="true">→</span></span></span>
        </a>
      </li>`;
      }).join("\n      ")}
    </ul>`;

const MARQUEE_ITEMS = cat.lines.map((l) => `<span>${esc(l.name)}</span><svg viewBox="0 0 260 307" aria-hidden="true"><use href="#lamar-hex"/></svg>`).join("");
const MARQUEE = `<div class="marquee" aria-hidden="true"><div class="marquee-track"><div class="marquee-group">${MARQUEE_ITEMS}</div><div class="marquee-group">${MARQUEE_ITEMS}</div></div></div>`;

const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name, "es"));
const letters = [...new Set(sorted.map((p) => p.name[0].toUpperCase()))];

const VADEMECUM_INDEX = cat.lines.map((l) => `<div class="vd-index-group">
          <h3>${esc(l.name)}</h3>
          <ul>${products.filter((p) => p.line === l.id).map((p) => `<li><a href="#${p.id}">${esc(p.name)}</a></li>`).join("")}</ul>
        </div>`).join("\n        ");

const VADEMECUM = cat.lines.map((l, li) => `<section class="vd-line" id="linea-${l.id}" aria-labelledby="linea-${l.id}-t">
          <header class="vd-line-head">
            <span class="vd-line-num">${String(li + 1).padStart(2, "0")}</span>
            <h2 id="linea-${l.id}-t">${esc(l.name)}</h2>
            <p>${esc(l.short)}</p>
          </header>
          ${products.filter((p) => p.line === l.id).map((p) => `<article class="vd-entry" id="${p.id}" data-vd-entry data-search="${esc(slug([p.name, p.tipo, l.name].join(" ")).replace(/-/g, " "))}">
            <header class="vd-entry-head">
              <p class="vd-entry-tipo">${esc(p.tipo)}</p>
              <h3>${esc(p.name)}</h3>
              <p class="vd-entry-meta"><span>${ESPECIE[p.especie]}</span>${p.formas.map((f) => `<span>${esc(f)}</span>`).join("")}</p>
            </header>
            <dl class="vd-fields">
              ${p.fields.map((f) => `<div class="vd-field"><dt>${esc(f.label)}</dt><dd>${f.paras.map((x) => `<p>${esc(x)}</p>`).join("")}</dd></div>`).join("\n              ")}
            </dl>
          </article>`).join("\n          ")}
        </section>`).join("\n        ");

const TOKENS = {
  SCRIPTS, FOOTER, SPLASH, LOGO, ICON, PRODUCT_GRID, LINE_FILTERS, LINES_GRID, FEATURED, MARQUEE,
  VADEMECUM, VADEMECUM_INDEX, COUNT_PRODUCTS: String(products.length), COUNT_LINES: String(cat.lines.length),
  YEAR_UPDATE: "Septiembre 2026", VERSION,
};

// ---------- Build ----------
for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith(".html"))) {
  let src = fs.readFileSync(path.join(SRC, file), "utf8");
  const m = src.match(/^<!--meta (\{[\s\S]*?\})-->\s*/);
  if (!m) throw new Error("Falta <!--meta--> en " + file);
  const meta = JSON.parse(m[1]);
  src = src.slice(m[0].length);
  let out = src
    .replace("{{HEAD}}", head(meta))
    .replace("{{HEADER}}", header(meta.page));
  out = out.replace(/\{\{([A-Z_]+)\}\}/g, (all, k) => {
    if (!(k in TOKENS)) throw new Error(`Token desconocido {{${k}}} en ${file}`);
    return TOKENS[k];
  });
  fs.writeFileSync(path.join(ROOT, file), out);
  console.log("✓ " + file);
}

// Datos para enriquecer (fichas en modal y buscador). El contenido crítico ya está en el HTML.
const manifest = {
  name: "Laboratorio Lamar",
  contact: { phone: "+54 11 4714-4423 / 4856", address: "Monteagudo 2113, San Fernando, Buenos Aires" },
  lines: cat.lines,
  products: products.map(({ id, name, line, lineName, tipo, formas, especie, tone, fields }) => ({ id, name, line, lineName, tipo, formas, especie: ESPECIE[especie], tone, fields })),
};
fs.writeFileSync(path.join(ROOT, "lib", "manifest.js"),
  `/* Generado por tools/build.js — no editar a mano */\n(function () {\n  "use strict";\n  window.__BRAND__ = ${JSON.stringify(manifest)};\n})();\n`);
console.log("✓ lib/manifest.js (" + products.length + " productos)");

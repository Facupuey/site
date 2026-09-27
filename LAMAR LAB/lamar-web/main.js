/* Laboratorio Lamar — main.js (IIFE, sin módulos) */
(function () {
  "use strict";

  const data = window.__BRAND__ || {};
  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const escHTML = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  /* ---------- Splash (doble red de seguridad: CSS 4.5s + JS) ---------- */
  function initSplash() {
    const splash = $("[data-splash]");
    if (!splash || !document.documentElement.classList.contains("show-splash")) return;
    const hide = () => splash.classList.add("is-out");
    setTimeout(hide, 1400);
    setTimeout(hide, 4000);
  }

  /* ---------- Header ---------- */
  function initHeader() {
    const header = $("[data-header]");
    if (!header) return;
    const onScroll = () => header.classList.toggle("is-scrolled", scrollY > 8);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });

    const toggle = $("[data-nav-toggle]");
    const panel = $("[data-mobile-nav]");
    if (!toggle || !panel) return;
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector(".sr-only").textContent = open ? "Cerrar menú" : "Abrir menú";
      panel.hidden = !open;
      document.body.classList.toggle("nav-open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    matchMedia("(min-width: 1280px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- Split de títulos (preserva <em> y <br>) ---------- */
  function initSplit() {
    $$("[data-split]").forEach((el) => {
      if (el.dataset.splitDone) return;
      el.dataset.splitDone = "1";
      el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
      let i = 0;
      const wrap = (text) => text.split(/(\s+)/).map((w) => {
        if (!w) return "";
        if (/^\s+$/.test(w)) return " ";
        return '<span class="split-word" aria-hidden="true"><span style="--wi:' + (i++) + '">' + escHTML(w) + "</span></span>";
      }).join("");
      el.innerHTML = Array.from(el.childNodes).map((node) => {
        if (node.nodeType === 3) return wrap(node.textContent);
        if (node.nodeName === "BR") return "<br>";
        if (node.nodeType === 1) {
          const tag = node.tagName.toLowerCase();
          return "<" + tag + ">" + wrap(node.textContent) + "</" + tag + ">";
        }
        return "";
      }).join("");
      el.classList.add("is-split");
    });
  }

  /* ---------- Reveals (threshold bajo + red de seguridad 6s) ---------- */
  function initReveals() {
    const targets = $$(".reveal, .is-split");
    if (!("IntersectionObserver" in window)) { targets.forEach((el) => el.classList.add("is-visible")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    targets.forEach((el) => io.observe(el));
    setTimeout(() => {
      targets.forEach((el) => {
        if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < innerHeight) el.classList.add("is-visible");
      });
    }, 6000);
  }

  /* ---------- Contadores ---------- */
  function initCounters() {
    const els = $$("[data-count]");
    if (!els.length) return;
    const run = (el) => {
      const to = parseInt(el.dataset.count, 10);
      const from = parseInt(el.dataset.from || "0", 10);
      if (isNaN(to)) return;
      const dur = 1600;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - p, 4);
        el.textContent = String(Math.round(from + (to - from) * e));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.01 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Parallax suave (GSAP ScrollTrigger) ---------- */
  function initParallax() {
    if (reduced || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    $$("[data-parallax]").forEach((el) => {
      const amount = parseFloat(el.dataset.parallax) || 20;
      gsap.fromTo(el, { y: -amount / 2 }, {
        y: amount / 2, ease: "none",
        scrollTrigger: { trigger: el.closest("section, figure, .container") || el, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
    });
  }

  /* ---------- Tilt en packs destacados ---------- */
  function initTilt() {
    if (!fineHover) return;
    $$("[data-tilt]").forEach((card) => {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = "1";
      const pack = $(".pack", card);
      if (!pack) return;
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        pack.style.transform = "rotateY(" + (x * 12).toFixed(2) + "deg) rotateX(" + (-y * 10).toFixed(2) + "deg) translateY(-6px)";
      });
      card.addEventListener("mouseout", (e) => {
        if (!card.contains(e.relatedTarget)) pack.style.transform = "";
      });
    });
  }

  /* ---------- Ficha de producto en modal ---------- */
  function packHTML(p) {
    return '<span class="pack tone-' + escHTML(p.tone) + '" aria-hidden="true">' +
      '<span class="pack-top"><span class="pack-brand">Lamar<small>Laboratorio</small></span></span>' +
      '<span class="pack-body"><span class="pack-cat">' + escHTML(p.tipo) + '</span><span class="pack-name">' + escHTML(p.name) +
      '</span><span class="pack-rule"></span><span class="pack-meta">' + escHTML(p.formas.join(" · ")) +
      '</span><span class="pack-foot">LABORATORIO_<b>Lamar</b></span></span></span>';
  }
  function ensureDialog() {
    let dlg = $("[data-product-dialog]");
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.className = "product-dialog";
    dlg.setAttribute("data-product-dialog", "");
    dlg.setAttribute("aria-labelledby", "pd-title");
    dlg.innerHTML = '<div class="pd-inner"><button class="pd-close" type="button" data-dialog-close><span class="sr-only">Cerrar</span><span aria-hidden="true">×</span></button>' +
      '<div class="pd-pack" data-pd-pack></div><div class="pd-content"><p class="kicker" data-pd-line></p><h2 id="pd-title" data-pd-title></h2>' +
      '<p class="pd-meta" data-pd-meta></p><dl class="vd-fields" data-pd-fields></dl><div class="pd-actions">' +
      '<a class="btn btn-primary btn-sm" href="vademecum.html" data-pd-link>Ver en el vademécum</a>' +
      '<a class="btn btn-ghost btn-sm" href="contacto.html">Hacer una consulta</a></div></div></div>';
    document.body.appendChild(dlg);
    return dlg;
  }
  function initProductDialog() {
    const products = data.products || [];
    if (!products.length || !$("[data-open-product]") || typeof HTMLDialogElement === "undefined") return;
    const dlg = ensureDialog();
    const byId = Object.fromEntries(products.map((p) => [p.id, p]));
    const open = (p) => {
      $("[data-pd-pack]", dlg).innerHTML = packHTML(p);
      $("[data-pd-line]", dlg).textContent = p.lineName;
      $("[data-pd-title]", dlg).textContent = p.name;
      $("[data-pd-meta]", dlg).textContent = p.tipo + " · " + p.especie + " · " + p.formas.join(" · ");
      $("[data-pd-fields]", dlg).innerHTML = p.fields.map((f) =>
        '<div class="vd-field"><dt>' + escHTML(f.label) + "</dt><dd>" + f.paras.map((x) => "<p>" + escHTML(x) + "</p>").join("") + "</dd></div>").join("");
      $("[data-pd-link]", dlg).href = "vademecum.html#" + p.id;
      dlg.showModal();
      $(".pd-content", dlg).scrollTop = 0;
    };
    document.addEventListener("click", (e) => {
      const a = e.target.closest("[data-open-product]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const p = byId[a.dataset.openProduct];
      if (!p) return;
      e.preventDefault();
      open(p);
    });
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg || e.target.closest("[data-dialog-close]")) dlg.close();
    });
  }

  /* ---------- Catálogo: filtros + búsqueda ---------- */
  function initCatalog() {
    const grid = $("[data-product-grid]");
    if (!grid) return;
    const cards = $$(".product-card", grid);
    const search = $("[data-catalog-search]");
    const count = $("[data-catalog-count]");
    const empty = $("[data-catalog-empty]");
    const state = { line: "todas", especie: "todas", q: "" };

    const params = new URLSearchParams(location.search);
    if (params.get("linea") && $('[data-filter-line="' + params.get("linea") + '"]')) state.line = params.get("linea");

    const apply = () => {
      const q = norm(state.q);
      let n = 0;
      cards.forEach((c) => {
        const ok = (state.line === "todas" || c.dataset.line === state.line) &&
          (state.especie === "todas" || c.dataset.especie === state.especie || c.dataset.especie === "ambos") &&
          (!q || q.split(" ").every((w) => c.dataset.search.includes(w)));
        c.hidden = !ok;
        if (ok) { n++; c.classList.add("is-visible"); }
      });
      count.textContent = "Mostrando " + n + (n === 1 ? " producto" : " productos");
      empty.hidden = n > 0;
      $$("[data-filter-line]").forEach((b) => {
        const on = b.dataset.filterLine === state.line;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      $$("[data-filter-especie]").forEach((b) => {
        const on = b.dataset.filterEspecie === state.especie;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
    };

    $$("[data-filter-line]").forEach((b) => b.addEventListener("click", () => {
      state.line = b.dataset.filterLine;
      const url = new URL(location.href);
      if (state.line === "todas") url.searchParams.delete("linea"); else url.searchParams.set("linea", state.line);
      history.replaceState(null, "", url);
      apply();
    }));
    $$("[data-filter-especie]").forEach((b) => b.addEventListener("click", () => { state.especie = b.dataset.filterEspecie; apply(); }));
    if (search) search.addEventListener("input", () => { state.q = search.value; apply(); });
    const reset = $("[data-catalog-reset]");
    if (reset) reset.addEventListener("click", () => { state.line = "todas"; state.especie = "todas"; state.q = ""; if (search) search.value = ""; apply(); });
    apply();
    const active = $(".chip.is-active");
    if (active && state.line !== "todas") active.scrollIntoView({ block: "nearest", inline: "center" });
  }

  /* ---------- Vademécum: búsqueda, índice activo, imprimir ---------- */
  function initVademecum() {
    const content = $("[data-vd-content]");
    if (!content) return;
    const entries = $$("[data-vd-entry]", content);
    const links = $$(".vd-index a");
    const input = $("[data-vd-search]");
    const empty = $("[data-vd-empty]");

    if (input) input.addEventListener("input", () => {
      const q = norm(input.value);
      let n = 0;
      entries.forEach((e) => {
        const ok = !q || q.split(" ").every((w) => e.dataset.search.includes(w));
        e.hidden = !ok;
        if (ok) n++;
      });
      $$(".vd-line", content).forEach((s) => { s.hidden = !$$("[data-vd-entry]:not([hidden])", s).length; });
      links.forEach((a) => {
        const target = document.getElementById(a.hash.slice(1));
        a.parentElement.hidden = !!(target && target.hidden);
      });
      empty.hidden = n > 0;
    });

    const print = $("[data-print]");
    if (print) print.addEventListener("click", () => window.print());

    if ("IntersectionObserver" in window && links.length) {
      const map = new Map(links.map((a) => [a.hash.slice(1), a]));
      const io = new IntersectionObserver((items) => {
        items.forEach((it) => {
          if (!it.isIntersecting) return;
          links.forEach((a) => a.classList.remove("is-active"));
          const a = map.get(it.target.id);
          if (a) {
            a.classList.add("is-active");
            const nav = a.closest(".vd-index");
            if (nav && nav.scrollHeight > nav.clientHeight) {
              const top = a.offsetTop - nav.clientHeight / 2;
              nav.scrollTo({ top: top, behavior: "smooth" });
            }
          }
        });
      }, { rootMargin: "-30% 0px -60% 0px" });
      entries.forEach((e) => io.observe(e));
    }
  }

  /* ---------- Formularios ---------- */
  const isPreview = location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const MSG = {
    distribuidor: "¡Gracias! Recibimos tu solicitud. Nuestro equipo comercial se va a comunicar con vos a la brevedad.",
    cv: "¡Gracias! Recibimos tu CV. Lo vamos a tener en cuenta en nuestras próximas búsquedas.",
    contacto: "¡Gracias por escribirnos! Te respondemos a la brevedad.",
  };

  function validateField(el) {
    const field = el.closest(".field") || el.closest(".check");
    if (!field) return true;
    let msg = "";
    if (el.type === "checkbox") { if (el.required && !el.checked) msg = "Necesitamos tu aceptación para continuar."; }
    else if (el.type === "file") {
      const f = el.files && el.files[0];
      const max = parseFloat(el.dataset.maxMb || "5");
      if (el.required && !f) msg = "Adjuntá tu CV.";
      else if (f && !/\.(pdf|docx?)$/i.test(f.name)) msg = "El archivo debe ser PDF o Word.";
      else if (f && f.size > max * 1024 * 1024) msg = "El archivo supera los " + max + " MB.";
    } else if (el.required && !el.value.trim()) msg = "Completá este campo.";
    else if (el.type === "email" && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value)) msg = "Revisá el email.";
    else if (el.type === "url" && el.value && !/^https?:\/\/\S+\.\S+/.test(el.value)) msg = "Ingresá una dirección completa (https://…).";

    field.classList.toggle("is-invalid", !!msg);
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    let err = field.querySelector(".field-error");
    if (msg && field.classList.contains("field")) {
      if (!err) {
        err = document.createElement("span");
        err.className = "field-error";
        err.id = (el.id || el.name) + "-error";
        field.appendChild(err);
        el.setAttribute("aria-describedby", err.id);
      }
      err.textContent = msg;
    } else if (err) err.textContent = "";
    return !msg;
  }

  function initForms() {
    // Mensaje tras envío sin JS (enviar.php redirige con ?enviado=)
    const params = new URLSearchParams(location.search);
    $$("[data-form]").forEach((form) => {
      if (form.dataset.bound) return;
      form.dataset.bound = "1";
      const status = $("[data-form-status]", form);
      const kind = (form.querySelector('[name="formulario"]') || {}).value || "contacto";
      if (params.get("enviado") === "1") { status.className = "form-status is-ok"; status.textContent = MSG[kind]; }
      if (params.get("enviado") === "0") { status.className = "form-status is-error"; status.textContent = "No pudimos enviar el formulario. Probá de nuevo o llamanos al +54 11 4714-4423."; }

      const fields = $$("input:not([type=hidden]):not([name=website]), select, textarea", form);
      fields.forEach((el) => {
        el.addEventListener("blur", () => { if (el.value || el.type === "checkbox") validateField(el); });
        el.addEventListener("change", () => validateField(el));
      });

      const drop = $("[data-file-drop]", form);
      if (drop) {
        const input = $("input[type=file]", drop);
        const label = $("[data-file-name]", drop);
        const original = label.innerHTML;
        input.addEventListener("change", () => {
          const f = input.files && input.files[0];
          drop.classList.toggle("has-file", !!f);
          label.innerHTML = f ? escHTML(f.name) + " · " + (f.size / 1024 / 1024).toFixed(1) + " MB" : original;
        });
        ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, () => drop.classList.add("is-drag")));
        ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove("is-drag")));
      }

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const ok = fields.map(validateField).every(Boolean);
        if (!ok) {
          const first = $(".is-invalid input, .is-invalid select, .is-invalid textarea", form);
          if (first) first.focus();
          status.className = "form-status is-error";
          status.textContent = "Revisá los campos marcados.";
          return;
        }
        const btn = $("button[type=submit]", form);
        form.classList.add("is-sending");
        btn.disabled = true;
        status.className = "form-status";
        status.textContent = "Enviando…";
        try {
          if (isPreview) {
            await new Promise((r) => setTimeout(r, 900));
            status.className = "form-status is-ok";
            status.textContent = MSG[kind] + " (Vista previa: el envío real funciona una vez publicado en el hosting.)";
          } else {
            const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json.ok) throw new Error(json.error || "Error " + res.status);
            status.className = "form-status is-ok";
            status.textContent = MSG[kind];
          }
          form.reset();
          const d = $("[data-file-drop]", form);
          if (d) { d.classList.remove("has-file"); $("input[type=file]", d).dispatchEvent(new Event("change")); }
        } catch (err) {
          status.className = "form-status is-error";
          status.textContent = (err && err.message && !/^Error \d|Failed to fetch|NetworkError/.test(err.message) ? err.message + " " : "No pudimos enviar el formulario. ") +
            "Probá de nuevo o llamanos al +54 11 4714-4423.";
        } finally {
          form.classList.remove("is-sending");
          btn.disabled = false;
        }
      });
    });
  }

  function initYear() { $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); }); }

  function boot() {
    safe(initSplash, "initSplash");
    safe(initHeader, "initHeader");
    safe(initSplit, "initSplit");
    safe(initReveals, "initReveals");
    safe(initCounters, "initCounters");
    safe(initTilt, "initTilt");
    safe(initProductDialog, "initProductDialog");
    safe(initCatalog, "initCatalog");
    safe(initVademecum, "initVademecum");
    safe(initForms, "initForms");
    safe(initYear, "initYear");
    safe(initParallax, "initParallax");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

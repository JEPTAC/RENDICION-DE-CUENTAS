
(() => {
  "use strict";

  const PAGE_MAP = {
    "": "home",
    "index.html": "home",
    "recursos.html": "resources",
    "noticias.html": "news",
    "noticia.html": "news",
    "ideas.html": "ideas",
    "vigencias.html": "vigencias"
  };

  const state = {
    initialized:false,
    mutationObserver:null,
    sectionObserver:null,
    railObserver:null,
    refreshTimer:null
  };

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pageName() {
    const filename = (location.pathname.split("/").pop() || "").toLowerCase();
    if (PAGE_MAP[filename]) return PAGE_MAP[filename];
    if (/rendicion-?\d{4}|rendicion\.html/.test(filename)) return "year";
    return "generic";
  }

  function applyHeroLayoutClass() {
    const allowed = new Set(["compact","balanced","wide"]);
    const params = new URLSearchParams(location.search);
    const requested = (params.get("hero") || "").toLowerCase();
    const stored = (localStorage.getItem("sp_hero_layout") || "").toLowerCase();
    const hero = allowed.has(requested)
      ? requested
      : allowed.has(stored)
        ? stored
        : "compact";

    if (allowed.has(requested)) {
      localStorage.setItem("sp_hero_layout", hero);
    }

    document.body.classList.remove(
      "hero-layout-compact",
      "hero-layout-balanced",
      "hero-layout-wide"
    );
    document.body.classList.add(`hero-layout-${hero}`);
    document.documentElement.dataset.heroLayout = hero;
  }

  function ensurePageClass() {
    const page = pageName();
    document.body.classList.add(
      "claude-studio",
      "blue-studio",
      `claude-page-${page}`
    );
    document.documentElement.dataset.claudePage = page;
    applyHeroLayoutClass();
  }

  function sectionTitle(section) {
    const heading = section.querySelector(
      "h1,h2,h3,.home-section__head h2,.section-head h2,.year-section__head h2"
    );
    return (heading?.textContent || "Sección").trim().replace(/\s+/g, " ");
  }

  function suitableSections() {
    return [...document.querySelectorAll(
      "main > section, main > article, .site-main > section, .site-main > article"
    )].filter(section => {
      if (!section.isConnected) return false;
      if (section.matches(
        ".home-hero,.page-hero,.news-page-hero,[hidden],.dialog-shell"
      )) return false;
      return section.getBoundingClientRect().height > 80;
    });
  }

  function preferredHead(section) {
    return section.querySelector([
      ".home-section__head",
      ".section-head",
      ".year-section__head",
      ".archive-intro",
      ".news-section-heading",
      ".library-section-head",
      ".ideas-section-head"
    ].join(","));
  }

  function addHeroAtmosphere() {
    const hero = document.querySelector(
      ".home-hero,.page-hero,.news-page-hero"
    );
    if (!hero || hero.querySelector(":scope > .bs-hero-atmosphere")) return;

    const atmosphere = document.createElement("div");
    atmosphere.className = "bs-hero-atmosphere";
    atmosphere.setAttribute("aria-hidden","true");
    atmosphere.innerHTML = `
      <span class="bs-hero-atmosphere__grid"></span>
      <span class="bs-hero-atmosphere__ribbon bs-hero-atmosphere__ribbon--a"></span>
      <span class="bs-hero-atmosphere__ribbon bs-hero-atmosphere__ribbon--b"></span>
      <span class="bs-hero-atmosphere__orbit"></span>
      <span class="bs-hero-atmosphere__particles"></span>
      <span class="bs-hero-atmosphere__flare"></span>`;
    hero.prepend(atmosphere);
  }

  function addAmbient(section,index) {
    if (section.querySelector(":scope > .cd-ambient")) return;

    const ambient = document.createElement("div");
    ambient.className = "cd-ambient";
    ambient.setAttribute("aria-hidden", "true");
    ambient.innerHTML = `
      <span class="cd-ambient__mesh"></span>
      <span class="cd-ambient__orb cd-ambient__orb--a"></span>
      <span class="cd-ambient__orb cd-ambient__orb--b"></span>
      <span class="cd-ambient__line"></span>
      <span class="cd-ambient__ribbon"></span>
      <span class="cd-ambient__rings"></span>
      <span class="cd-ambient__spark"></span>`;
    ambient.style.setProperty("--cd-seed", String(index % 5));
    section.prepend(ambient);
  }

  function decorateSections() {
    const sections = suitableSections();

    sections.forEach((section,index) => {
      section.classList.add("cd-section", "cd-reveal");
      section.dataset.cdIndex = String(index + 1).padStart(2, "0");

      if (!section.id) {
        section.id = `contenido-${index + 1}`;
      }

      const head = preferredHead(section);
      if (head && !head.querySelector(".cd-section-mark")) {
        const mark = document.createElement("div");
        mark.className = "cd-section-mark";
        mark.setAttribute("aria-hidden", "true");
        mark.innerHTML = `
          <span>${section.dataset.cdIndex}</span>
          <i></i>
          <em>San Pedro</em>`;
        head.prepend(mark);
      }

      addAmbient(section,index);
    });

    return sections;
  }

  const CARD_SELECTOR = [
    ".edition-card",
    ".deal-card",
    ".quote-card",
    ".trust-card",
    ".news-card",
    ".news-story",
    ".news-feature-card",
    ".resource-library-card",
    ".year-resource-card",
    ".ideas-cta",
    ".idea-card",
    ".idea-public-card",
    ".idea-feature-card",
    ".idea-column",
    ".dashboard-panel",
    ".executive-kpi",
    ".institution-result",
    ".method-step",
    ".commitment-row",
    ".followup-summary > article",
    ".request-summary > article"
  ].join(",");

  function bindCardMotion(card) {
    if (card.dataset.cdMotion === "1") return;
    card.dataset.cdMotion = "1";
    card.classList.add("cd-card", "cd-reveal");

    const siblings = [...(card.parentElement?.children || [])];
    const index = Math.max(siblings.indexOf(card),0);
    card.style.setProperty("--cd-order", String(index));

    if (prefersReducedMotion()) return;

    let frame = null;

    card.addEventListener("pointermove", event => {
      if (event.pointerType === "touch") return;
      const rect = card.getBoundingClientRect();
      const x = Math.max(0,Math.min(1,(event.clientX - rect.left) / rect.width));
      const y = Math.max(0,Math.min(1,(event.clientY - rect.top) / rect.height));

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        card.style.setProperty("--cd-x", `${(x * 100).toFixed(2)}%`);
        card.style.setProperty("--cd-y", `${(y * 100).toFixed(2)}%`);
        card.style.setProperty("--cd-rx", `${((.5 - y) * 1.8).toFixed(2)}deg`);
        card.style.setProperty("--cd-ry", `${((x - .5) * 2.5).toFixed(2)}deg`);
      });
    }, {passive:true});

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--cd-rx", "0deg");
      card.style.setProperty("--cd-ry", "0deg");
    }, {passive:true});
  }

  function directChildrenMatching(parent, selector) {
    return [...parent.children].filter(child => child.matches(selector));
  }

  function normalizeAdminControls() {
    document.querySelectorAll(".admin-quick-section").forEach(section => {
      const buttons = directChildrenMatching(
        section,
        ".admin-section-edit-button"
      );
      buttons.slice(1).forEach(button => button.remove());

      buttons[0]?.setAttribute("type","button");
      if (buttons[0] && !buttons[0].getAttribute("aria-label")) {
        buttons[0].setAttribute("aria-label","Editar esta sección");
      }
    });

    document.querySelectorAll("[data-admin-entity]").forEach(entity => {
      const buttons = directChildrenMatching(
        entity,
        ".admin-quick-card-edit"
      );
      buttons.slice(1).forEach(button => button.remove());

      buttons[0]?.setAttribute("type","button");
      if (buttons[0] && !buttons[0].getAttribute("aria-label")) {
        buttons[0].setAttribute("aria-label","Editar este contenido");
      }
    });

    document.querySelectorAll(
      ".admin-section-edit-button, " +
      ".admin-quick-card-edit, " +
      ".dashboard-edit-button"
    ).forEach(button => {
      button.setAttribute("type","button");
      button.style.pointerEvents = "auto";
    });
  }

  function decorateCards(root = document) {
    root.querySelectorAll(CARD_SELECTOR).forEach(bindCardMotion);
  }

  function setupReveal(root = document) {
    const items = root.querySelectorAll(".cd-reveal:not(.cd-observed)");

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      items.forEach(item => item.classList.add("cd-observed","cd-visible"));
      return;
    }

    if (!state.sectionObserver) {
      state.sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("cd-visible");
          state.sectionObserver.unobserve(entry.target);
        });
      },{
        threshold:.07,
        rootMargin:"0px 0px -6% 0px"
      });
    }

    items.forEach(item => {
      item.classList.add("cd-observed");
      state.sectionObserver.observe(item);
    });
  }

  function buildRail(sections) {
    const visibleSections = sections.slice(0,9);
    if (visibleSections.length < 2) {
      document.querySelector(".cd-section-rail")?.remove();
      state.railObserver?.disconnect();
      state.railObserver = null;
      return;
    }

    const signature = visibleSections
      .map(section => section.id)
      .join("|");

    let rail = document.querySelector(".cd-section-rail");

    if (!rail) {
      rail = document.createElement("nav");
      rail.className = "cd-section-rail";
      rail.setAttribute("aria-label", "Navegación de la página");
      rail.innerHTML = `
        <span class="cd-section-rail__title">Recorrido</span>
        <div class="cd-section-rail__list"></div>`;
      document.body.appendChild(rail);
    }

    const list = rail.querySelector(".cd-section-rail__list");

    // Solo reconstruye si cambió la estructura real de las secciones.
    // Esto evita el titileo producido por contenido dinámico.
    if (rail.dataset.signature !== signature) {
      rail.dataset.signature = signature;
      list.replaceChildren();

      visibleSections.forEach((section,index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.target = section.id;
        button.setAttribute(
          "aria-label",
          `Ir a ${sectionTitle(section)}`
        );
        button.innerHTML = `
          <span>${String(index + 1).padStart(2,"0")}</span>
          <i aria-hidden="true"></i>`;

        button.addEventListener("click", () => {
          section.scrollIntoView({
            behavior:prefersReducedMotion() ? "auto" : "smooth",
            block:"start"
          });
        });

        list.appendChild(button);
      });
    }

    state.railObserver?.disconnect();

    state.railObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      rail.querySelectorAll("button").forEach(button => {
        const active = button.dataset.target === visible.target.id;
        button.classList.toggle("active",active);
        button.setAttribute(
          "aria-current",
          active ? "true" : "false"
        );
      });
    },{
      threshold:[.12,.35,.65],
      rootMargin:"-18% 0px -60% 0px"
    });

    visibleSections.forEach(section => {
      state.railObserver.observe(section);
    });
  }

  function addPageSignature() {
    const page = pageName();
    const target = document.querySelector(
      ".home-hero,.page-hero,.news-page-hero,.ideas-page__head"
    );

    if (!target || target.querySelector(".cd-page-signature")) return;

    const labels = {
      home:"Gestión abierta",
      resources:"Biblioteca pública",
      news:"Actualidad municipal",
      ideas:"Participación activa",
      vigencias:"Archivo institucional",
      year:"Rendición de Cuentas"
    };

    const signature = document.createElement("div");
    signature.className = "cd-page-signature";
    signature.setAttribute("aria-hidden","true");
    signature.innerHTML = `
      <span></span>
      <strong>${labels[page] || "Portal institucional"}</strong>
      <i></i>`;
    target.appendChild(signature);
  }

  function addCursorGlow() {
    if (prefersReducedMotion()) return;
    if (document.querySelector(".cd-cursor-glow")) return;

    const glow = document.createElement("div");
    glow.className = "cd-cursor-glow";
    glow.setAttribute("aria-hidden","true");
    document.body.appendChild(glow);

    let frame = null;
    document.addEventListener("pointermove", event => {
      if (event.pointerType === "touch") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        glow.style.setProperty("--cd-pointer-x",`${event.clientX}px`);
        glow.style.setProperty("--cd-pointer-y",`${event.clientY}px`);
      });
    }, {passive:true});
  }



  function integrateHomeHeroBanner() {
    if (pageName() !== "home") return;

    const hero = document.querySelector(".home-hero");
    const copy = hero?.querySelector(".home-hero__copy");
    const visual = hero?.querySelector(".home-hero__visual");
    if (!hero || !copy || !visual) return;

    const title = copy.querySelector("h1");
    const targetSibling = title ? title.nextElementSibling : copy.firstElementChild;

    if (visual.parentElement !== copy || (title && visual.previousElementSibling !== title)) {
      if (title) {
        copy.insertBefore(visual, targetSibling);
      } else {
        copy.prepend(visual);
      }
    }

    hero.classList.add("home-hero--banner-inside");
  }

  function refresh() {
    ensurePageClass();
    addHeroAtmosphere();
    addPageSignature();
    integrateHomeHeroBanner();
    const sections = decorateSections();
    decorateCards();
    normalizeAdminControls();
    setupReveal();
    buildRail(sections);
  }

  function scheduleRefresh() {
    clearTimeout(state.refreshTimer);
    state.refreshTimer = window.setTimeout(refresh,80);
  }

  function observeDynamicContent() {
    if (state.mutationObserver) return;

    const ignoredStudioSelector = [
      ".cd-section-rail",
      ".cd-ambient",
      ".bs-hero-atmosphere",
      ".cd-page-signature",
      ".cd-cursor-glow"
    ].join(",");

    state.mutationObserver = new MutationObserver(mutations => {
      const hasRelevantNode = mutations.some(mutation =>
        [...mutation.addedNodes].some(node => {
          if (!(node instanceof Element)) return false;
          if (node.matches(ignoredStudioSelector)) return false;
          if (node.closest(ignoredStudioSelector)) return false;
          return true;
        })
      );

      if (hasRelevantNode) scheduleRefresh();
    });

    state.mutationObserver.observe(document.body,{
      subtree:true,
      childList:true
    });

    document.addEventListener("portal:rendered",scheduleRefresh);
  }

  function init() {
    if (!document.body) return;
    if (state.initialized) {
      refresh();
      return;
    }

    state.initialized = true;
    ensurePageClass();
    addCursorGlow();
    refresh();
    observeDynamicContent();
  }

  window.ClaudeStudio = {init,refresh};

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded",init,{once:true});
  } else {
    init();
  }
})();

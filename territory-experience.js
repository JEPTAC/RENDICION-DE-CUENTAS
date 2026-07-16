(() => {
  "use strict";

  const STORE_KEY = "sp_territory_experience_v1";
  const BUILD = "11.5-territorio-premium";
  const HOME_PATHS = new Set(["","index.html","/"]);
  const CENTER = [3.99557,-76.22805];

  const MODES = {
    territory:{
      label:"Territorio",
      short:"Localidades",
      icon:"◎",
      description:"Cabecera, corregimientos y veredas de referencia."
    },
    impact:{
      label:"Afectaciones",
      short:"Afectaciones",
      icon:"!",
      description:"Eventos y población afectada cargados con soporte institucional."
    },
    work:{
      label:"Obras y respuesta",
      short:"Obras",
      icon:"↗",
      description:"Intervenciones, respuestas, avances y evidencias."
    },
    participation:{
      label:"Participación",
      short:"Participación",
      icon:"✦",
      description:"Ideas, encuentros y ejercicios de control social."
    }
  };

  /*
   * Coordenadas de referencia cartográfica abierta. No representan polígonos
   * oficiales ni límites prediales. Guaqueros se conserva en el inventario
   * territorial, pero queda pendiente de coordenada oficial.
   */
  const TERRITORY = [
    {
      id:"cabecera",
      name:"Cabecera municipal",
      kind:"Casco urbano",
      lat:3.99557,
      lng:-76.22805,
      altitude:988,
      veredas:["Barrios y equipamientos visibles en el mapa base"],
      note:"Centro urbano de San Pedro."
    },
    {
      id:"angosturas",
      name:"Angosturas",
      kind:"Corregimiento",
      lat:3.97989,
      lng:-76.18611,
      altitude:1262,
      veredas:["La China","Positos"],
      note:"Zona rural de montaña."
    },
    {
      id:"buenos-aires",
      name:"Buenos Aires",
      kind:"Corregimiento",
      lat:3.92892,
      lng:-76.17372,
      altitude:2060,
      veredas:["El Edén","La Pradera"],
      note:"Localidad rural de mayor altitud."
    },
    {
      id:"los-chancos",
      name:"Los Chancos",
      kind:"Corregimiento",
      lat:4.02131,
      lng:-76.21679,
      altitude:990,
      veredas:["Belén","Guadualejo","Las Chambas"],
      note:"Corredor rural cercano a la cabecera."
    },
    {
      id:"naranjal",
      name:"Naranjal",
      kind:"Corregimiento",
      lat:3.97449,
      lng:-76.15450,
      altitude:1526,
      veredas:["La Arenosa"],
      note:"Zona de ladera oriental."
    },
    {
      id:"presidente",
      name:"Presidente",
      kind:"Corregimiento",
      lat:3.96125,
      lng:-76.26298,
      altitude:991,
      veredas:["Arenales","El Hormiguero","Pantanillo","La Ventura"],
      note:"Localidad de referencia próxima al límite municipal."
    },
    {
      id:"san-jose",
      name:"San José",
      kind:"Corregimiento",
      lat:4.03534,
      lng:-76.26846,
      altitude:942,
      veredas:["El Chircal"],
      note:"Sector rural occidental."
    },
    {
      id:"todos-los-santos",
      name:"Todos los Santos",
      kind:"Corregimiento",
      lat:3.98088,
      lng:-76.23919,
      altitude:976,
      veredas:["La Puente","Montegrande","Monterredondo"],
      note:"También identificado como Todos Santos."
    },
    {
      id:"guayabal",
      name:"Guayabal",
      kind:"Corregimiento",
      lat:4.00635,
      lng:-76.23503,
      altitude:967,
      veredas:[],
      note:"Localidad cercana al casco urbano."
    },
    {
      id:"la-esmeralda",
      name:"La Esmeralda",
      kind:"Corregimiento",
      lat:3.94417,
      lng:-76.13111,
      altitude:1730,
      veredas:["Playa Rica","La Altania"],
      note:"También registrada como Esmeraldas en cartografía abierta."
    },
    {
      id:"la-siria",
      name:"La Siria",
      kind:"Corregimiento",
      lat:3.94731,
      lng:-76.14853,
      altitude:1715,
      veredas:[],
      note:"Zona montañosa oriental."
    },
    {
      id:"guaqueros",
      name:"Guaqueros",
      kind:"Corregimiento",
      lat:null,
      lng:null,
      altitude:null,
      veredas:["Los Mates"],
      note:"Pendiente de georreferenciación oficial en el portal."
    },
    {
      id:"platanares",
      name:"Platanares",
      kind:"Corregimiento",
      lat:3.96021,
      lng:-76.13962,
      altitude:1412,
      veredas:[],
      note:"Localidad rural oriental."
    },
    {
      id:"pavas",
      name:"Pavas",
      kind:"Corregimiento",
      lat:3.96337,
      lng:-76.20150,
      altitude:1291,
      veredas:[],
      note:"Zona de ladera próxima a Angosturas."
    }
  ];

  const STORY_DEFAULTS = [
    {
      id:"register",
      title:"El hecho se registra",
      caption:"La información inicia con una descripción clara, una fecha y un responsable.",
      type:"visual",
      url:"",
      poster:""
    },
    {
      id:"locate",
      title:"Se ubica en el territorio",
      caption:"El registro se conecta con un barrio, vereda, corregimiento o coordenada.",
      type:"visual",
      url:"",
      poster:""
    },
    {
      id:"respond",
      title:"Se conecta con una respuesta",
      caption:"La ciudadanía puede seguir responsable, estado, avance y compromisos.",
      type:"visual",
      url:"",
      poster:""
    },
    {
      id:"verify",
      title:"La evidencia queda visible",
      caption:"Documentos, fotografías y resultados cierran el ciclo de rendición.",
      type:"visual",
      url:"",
      poster:""
    }
  ];

  const BASEMAP_LABELS = Object.freeze({
    plano:"Plano",
    relieve:"Relieve",
    satelite:"Satélite",
    hibrido:"Híbrido"
  });

  const state = {
    initialized:false,
    section:null,
    storySection:null,
    map:null,
    mapReady:false,
    leafletPromise:null,
    markerLayer:null,
    radiusLayer:null,
    activeMode:"territory",
    selectedId:null,
    mapObserver:null,
    storyObserver:null,
    mapClick:null,
    adminDialog:null,
    storyAdminDialog:null,
    editingRecordId:null,
    records:[],
    localFallback:null,
    baseLayers:null,
    activeBaseLayer:null,
    activeBaseName:"plano",
    baseLayerReadyTimer:0,
    zoomTimer:0
  };

  const portal = () => window.Portal;

  function isHome() {
    const bodyPage = document.body?.dataset?.page;
    if (bodyPage === "home") return true;
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    return HOME_PATHS.has(file) || document.body?.classList.contains("page-home");
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g,char => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    })[char]);
  }

  function slug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-z0-9]+/g,"-")
      .replace(/^-|-$/g,"");
  }

  function isAdmin() {
    const adminKey = portal()?.KEYS?.admin || "sp_v6_admin";
    return Boolean(
      portal()?.state?.admin ||
      sessionStorage.getItem(adminKey) === "1" ||
      window.FirebasePortal?.getStatus?.()?.canWrite
    );
  }

  function defaultStore() {
    return {
      version:2,
      updatedAt:"",
      records:[],
      storyMedia:STORY_DEFAULTS.map(item => ({...item}))
    };
  }

  function readLocalStore() {
    if (state.localFallback) return state.localFallback;
    try {
      state.localFallback = {
        ...defaultStore(),
        ...JSON.parse(localStorage.getItem(STORE_KEY) || "{}")
      };
    } catch {
      state.localFallback = defaultStore();
    }
    return state.localFallback;
  }

  function getStore() {
    const content = portal()?.state?.content;
    if (content) {
      if (
        !content.territoryExperience ||
        typeof content.territoryExperience !== "object"
      ) {
        content.territoryExperience = defaultStore();
      }
      if (!Array.isArray(content.territoryExperience.records)) {
        content.territoryExperience.records = [];
      }
      if (!Array.isArray(content.territoryExperience.storyMedia)) {
        content.territoryExperience.storyMedia =
          STORY_DEFAULTS.map(item => ({...item}));
      }
      return content.territoryExperience;
    }
    return readLocalStore();
  }

  function persistStore() {
    const store = getStore();
    store.updatedAt = new Date().toISOString();

    if (portal()?.state?.content) {
      portal()?.helpers?.save?.();
      window.dispatchEvent(new CustomEvent("portal:datachange"));
    } else {
      localStorage.setItem(STORE_KEY,JSON.stringify(store));
    }
  }

  function refreshRecords() {
    state.records = getStore().records
      .filter(record => record && typeof record === "object")
      .map(record => ({
        id:record.id || `territory-${crypto.randomUUID?.() || Date.now()}`,
        category:["impact","work","participation"].includes(record.category)
          ? record.category
          : "impact",
        name:String(record.name || "Punto territorial"),
        sector:String(record.sector || ""),
        lat:Number(record.lat),
        lng:Number(record.lng),
        people:Number(record.people) || 0,
        status:String(record.status || "En seguimiento"),
        date:String(record.date || ""),
        description:String(record.description || ""),
        evidence:String(record.evidence || ""),
        updatedAt:String(record.updatedAt || "")
      }))
      .filter(record => Number.isFinite(record.lat) && Number.isFinite(record.lng));
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("es-CO").format(Number(value) || 0);
  }

  function totalPeople() {
    return state.records.reduce((sum,item) => sum + (Number(item.people) || 0),0);
  }

  function createFallbackNodes() {
    const positioned = TERRITORY.filter(item => Number.isFinite(item.lat));
    const lats = positioned.map(item => item.lat);
    const lngs = positioned.map(item => item.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return positioned.map((item,index) => {
      const x = ((item.lng - minLng) / Math.max(maxLng - minLng,.001)) * 76 + 12;
      const y = (1 - (item.lat - minLat) / Math.max(maxLat - minLat,.001)) * 72 + 14;
      return `
        <button
          class="territory-fallback-node"
          type="button"
          data-territory-id="${escapeHtml(item.id)}"
          style="--node-x:${x.toFixed(2)}%;--node-y:${y.toFixed(2)}%;--node-delay:${index * 55}ms"
          aria-label="Ubicar ${escapeHtml(item.name)}"
        >
          <i></i>
          <span>${escapeHtml(item.name)}</span>
        </button>`;
    }).join("");
  }

  function safeMediaUrl(value) {
    const url = String(value || "").trim();
    if (!url) return "";
    try {
      const parsed = new URL(url,location.href);
      return ["http:","https:","data:"].includes(parsed.protocol)
        ? parsed.href
        : "";
    } catch {
      return "";
    }
  }

  function getStoryMedia() {
    const store = getStore();
    return STORY_DEFAULTS.map((fallback,index) => ({
      ...fallback,
      ...(store.storyMedia?.[index] || {})
    }));
  }

  function visualSceneMarkup(index) {
    const scenes = [
      `
        <div class="territory-media-illustration is-register">
          <span class="media-sheet sheet-a"></span>
          <span class="media-sheet sheet-b"></span>
          <span class="media-sheet sheet-c"></span>
          <span class="media-writing-line line-a"></span>
          <span class="media-writing-line line-b"></span>
          <span class="media-writing-line line-c"></span>
          <i class="media-cursor"></i>
        </div>`,
      `
        <div class="territory-media-illustration is-locate">
          <span class="media-map-grid"></span>
          <span class="media-route route-a"></span>
          <span class="media-route route-b"></span>
          <span class="media-pin"><i></i></span>
          <span class="media-coordinate">3.99557 · -76.22805</span>
        </div>`,
      `
        <div class="territory-media-illustration is-respond">
          <span class="media-response-wave wave-a"></span>
          <span class="media-response-wave wave-b"></span>
          <span class="media-response-card card-a"><i></i><b>Responsable</b></span>
          <span class="media-response-card card-b"><i></i><b>Avance</b></span>
          <span class="media-response-card card-c"><i></i><b>Compromiso</b></span>
        </div>`,
      `
        <div class="territory-media-illustration is-verify">
          <span class="media-evidence evidence-a"></span>
          <span class="media-evidence evidence-b"></span>
          <span class="media-scan-line"></span>
          <span class="media-check"><i></i></span>
          <span class="media-evidence-label">EVIDENCIA VERIFICADA</span>
        </div>`
    ];
    return scenes[index] || scenes[0];
  }

  function renderStoryMedia(index = 0) {
    const holder = state.storySection?.querySelector("#territoryStoryMediaStage");
    if (!holder) return;

    const item = getStoryMedia()[index] || STORY_DEFAULTS[index];
    const url = safeMediaUrl(item.url);
    const poster = safeMediaUrl(item.poster);

    let media = visualSceneMarkup(index);
    if (item.type === "image" && url) {
      media = `
        <img
          src="${escapeHtml(url)}"
          alt=""
          loading="lazy"
          decoding="async"
        >`;
    } else if (item.type === "video" && url) {
      media = `
        <video
          src="${escapeHtml(url)}"
          ${poster ? `poster="${escapeHtml(poster)}"` : ""}
          muted
          loop
          playsinline
          autoplay
          preload="metadata"
        ></video>`;
    }

    holder.dataset.mediaType = item.type || "visual";
    holder.dataset.storyScene = String(index);
    holder.innerHTML = `
      <div class="territory-story-media-frame is-active">
        ${media}
        <span class="territory-story-media-vignette"></span>
        <small>${escapeHtml(["REGISTRO","UBICACIÓN","RESPUESTA","EVIDENCIA"][index])}</small>
      </div>`;
  }

  function createMapSection() {
    if (document.querySelector("#territorioVivo")) {
      state.section = document.querySelector("#territorioVivo");
      state.storySection = document.querySelector("#territoryStory");
      return;
    }

    const section = document.createElement("section");
    section.id = "territorioVivo";
    section.className =
      "home-section home-section--territory territory-experience-section";
    section.dataset.territoryExperience = "true";
    section.innerHTML = `
      <div class="site-shell territory-shell">
        <div class="home-section__head territory-section-head">
          <div>
            <span>TERRITORIO VIVO</span>
            <h2>San Pedro, visto por capas</h2>
          </div>
          <p>
            Explore el municipio, acerque el mapa y conecte cada lugar con
            afectaciones, respuestas, obras, evidencias y participación.
          </p>
        </div>

        <div class="territory-stage">
          <aside class="territory-panel">
            <div class="territory-mode-switch" role="tablist" aria-label="Capas del mapa">
              ${Object.entries(MODES).map(([key,mode],index) => `
                <button
                  type="button"
                  class="${index === 0 ? "active" : ""}"
                  data-territory-mode="${key}"
                  role="tab"
                  aria-selected="${index === 0 ? "true" : "false"}"
                >
                  <i aria-hidden="true">${mode.icon}</i>
                  <span>${mode.short}</span>
                </button>`).join("")}
            </div>

            <div class="territory-panel-copy">
              <span id="territoryModeLabel">CAPA TERRITORIAL</span>
              <h3 id="territoryModeTitle">${MODES.territory.label}</h3>
              <p id="territoryModeDescription">${MODES.territory.description}</p>
            </div>

            <div class="territory-metrics" aria-label="Resumen del mapa">
              <article>
                <small>Localidades</small>
                <strong id="territoryMetricLocations">${TERRITORY.filter(item => Number.isFinite(item.lat)).length}/${TERRITORY.length}</strong>
              </article>
              <article>
                <small>Registros</small>
                <strong id="territoryMetricRecords">0</strong>
              </article>
              <article>
                <small>Personas afectadas</small>
                <strong id="territoryMetricPopulation">Sin dato</strong>
              </article>
            </div>

            <label class="territory-search">
              <span>Buscar territorio o registro</span>
              <input
                id="territorySearch"
                type="search"
                placeholder="Corregimiento, vereda o sector"
                autocomplete="off"
              >
            </label>

            <div class="territory-result-list" id="territoryResultList"></div>

            <div class="territory-detail-card" id="territoryDetailCard" aria-live="polite">
              <span>SELECCIONE UN PUNTO</span>
              <h3 id="territoryDetailTitle">Explore el territorio</h3>
              <p id="territoryDetailDescription">
                Use los filtros, el buscador o los puntos del mapa para consultar información.
              </p>
              <div id="territoryDetailMeta"></div>
            </div>
          </aside>

          <div class="territory-map-shell">
            <div class="territory-map-toolbar">
              <div>
                <span class="territory-live-dot" aria-hidden="true"></span>
                <strong>Mapa territorial interactivo</strong>
              </div>
              <div class="territory-map-view-switch" role="group" aria-label="Vista cartográfica">
                ${Object.entries(BASEMAP_LABELS).map(([key,label],index) => `
                  <button
                    type="button"
                    class="${index === 0 ? "active" : ""}"
                    data-territory-basemap="${key}"
                    aria-pressed="${index === 0 ? "true" : "false"}"
                  >
                    <span>${label}</span>
                  </button>`).join("")}
              </div>
              <div class="territory-toolbar-actions">
                <button type="button" class="territory-map-action" id="territoryResetMap">
                  Vista general
                </button>
                <button type="button" class="territory-map-action territory-admin-button" id="territoryAdminButton" hidden>
                  Gestionar datos
                </button>
              </div>
            </div>

            <div
              class="territory-map"
              id="territoryMap"
              role="application"
              aria-label="Mapa interactivo de San Pedro, Valle del Cauca"
            ></div>
            <div class="territory-map-zoom-orbit" aria-hidden="true">
              <i></i><i></i><i></i>
            </div>
            <div class="territory-camera-status" aria-live="polite">
              <i></i>
              <span id="territoryCameraStatus">Vista general preparada</span>
            </div>

            <div class="territory-map-fallback" id="territoryMapFallback">
              <div class="territory-contours" aria-hidden="true">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
              <div class="territory-fallback-orbit" aria-hidden="true"></div>
              ${createFallbackNodes()}
              <div class="territory-map-loading">
                <span></span>
                <strong>Preparando el mapa territorial</strong>
                <small>La experiencia interactiva se carga únicamente al acercarse a esta sección.</small>
              </div>
            </div>

            <div class="territory-coordinate-bar">
              <span id="territoryCoordinateText">Centro: 3.99557, -76.22805</span>
              <small>
                Cartografía abierta y vistas satelitales de referencia.
                Los límites y nombres deben validarse con información oficial.
              </small>
            </div>

            <div class="territory-legend" aria-label="Leyenda">
              <span><i class="is-territory"></i> Territorio</span>
              <span><i class="is-impact"></i> Afectación</span>
              <span><i class="is-work"></i> Obra o respuesta</span>
              <span><i class="is-participation"></i> Participación</span>
            </div>
          </div>
        </div>

        <div class="territory-focus-grid" id="territoryFocusGrid">
          ${Object.entries(MODES).map(([key,mode],index) => `
            <article
              class="territory-focus-card ${index === 0 ? "active" : ""}"
              data-territory-card="${key}"
              tabindex="0"
              role="button"
              aria-label="Activar capa ${escapeHtml(mode.label)}"
            >
              <div class="territory-card-index">0${index + 1}</div>
              <span>${escapeHtml(mode.label).toUpperCase()}</span>
              <h3>${escapeHtml([
                "Conozca cada lugar",
                "Ubique dónde ocurrió",
                "Siga la respuesta",
                "Vea cómo participa la comunidad"
              ][index])}</h3>
              <p>${escapeHtml(mode.description)}</p>
              <button type="button" tabindex="-1">
                Abrir capa <b aria-hidden="true">↗</b>
              </button>
            </article>`).join("")}
        </div>
      </div>
    `;

    const story = document.createElement("section");
    story.id = "territoryStory";
    story.className =
      "home-section home-section--soft territory-story-section";
    story.innerHTML = `
      <div class="site-shell territory-story-shell">
        <div class="home-section__head">
          <div>
            <span>DEL TERRITORIO A LA RESPUESTA</span>
            <h2>Una historia pública que se puede seguir</h2>
            <button
              type="button"
              class="territory-story-admin-button"
              id="territoryStoryAdminButton"
              hidden
            >
              Gestionar imágenes y videos
            </button>
          </div>
          <p>
            Cada situación puede convertirse en una secuencia verificable:
            ubicación, impacto, decisión y evidencia.
          </p>
        </div>

        <div class="territory-story-layout">
          <div class="territory-story-visual">
            <div
              class="territory-story-media-stage"
              id="territoryStoryMediaStage"
              aria-hidden="true"
            ></div>
            <div class="territory-story-world" aria-hidden="true">
              <span class="territory-story-ring ring-a"></span>
              <span class="territory-story-ring ring-b"></span>
              <span class="territory-story-ring ring-c"></span>
              <span class="territory-story-path"></span>
              <i class="territory-story-node node-a"></i>
              <i class="territory-story-node node-b"></i>
              <i class="territory-story-node node-c"></i>
              <i class="territory-story-node node-d"></i>
              <div class="territory-story-core">
                <small id="territoryStoryIndex">01</small>
                <strong id="territoryStoryTitle">El hecho se registra</strong>
              </div>
            </div>
            <p id="territoryStoryCaption">
              La información inicia con una descripción clara y una fecha.
            </p>
            <div class="territory-story-progress" aria-label="Pasos de la narrativa">
              ${STORY_DEFAULTS.map((item,index) => `
                <button
                  type="button"
                  class="${index === 0 ? "active" : ""}"
                  data-story-jump="${index}"
                  aria-label="Ir al paso ${index + 1}"
                >
                  <i></i><span>0${index + 1}</span>
                </button>`).join("")}
            </div>
          </div>

          <div class="territory-story-steps">
            <article
              class="territory-story-step active"
              data-story-index="0"
              data-story-title="El hecho se registra"
              data-story-caption="La información inicia con una descripción clara y una fecha."
            >
              <span>01</span>
              <div>
                <h3>Registrar</h3>
                <p>Se documenta qué ocurrió, cuándo ocurrió y quién reporta.</p>
              </div>
            </article>
            <article
              class="territory-story-step"
              data-story-index="1"
              data-story-title="Se ubica en el territorio"
              data-story-caption="El mapa conecta el registro con un barrio, vereda, corregimiento o coordenada."
            >
              <span>02</span>
              <div>
                <h3>Ubicar</h3>
                <p>La situación se vincula con un punto, sector o área territorial.</p>
              </div>
            </article>
            <article
              class="territory-story-step"
              data-story-index="2"
              data-story-title="Se conecta con una respuesta"
              data-story-caption="La ciudadanía puede identificar responsable, estado y avance."
            >
              <span>03</span>
              <div>
                <h3>Responder</h3>
                <p>Se publica la actuación institucional, su estado y los compromisos.</p>
              </div>
            </article>
            <article
              class="territory-story-step"
              data-story-index="3"
              data-story-title="La evidencia queda visible"
              data-story-caption="Documentos, fotografías y resultados cierran el ciclo de rendición."
            >
              <span>04</span>
              <div>
                <h3>Verificar</h3>
                <p>La respuesta se conecta con documentos, fotografías y resultados.</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    `;

    const anchor =
      document.querySelector(".explorer-bar") ||
      document.querySelector(".home-hero") ||
      document.querySelector("main > section");

    if (anchor) {
      anchor.insertAdjacentElement("afterend",section);
      section.insertAdjacentElement("afterend",story);
    } else {
      document.querySelector("main")?.append(section,story);
    }

    state.section = section;
    state.storySection = story;
    renderStoryMedia(0);
  }

  function layerRecords(mode = state.activeMode) {
    if (mode === "territory") return TERRITORY;
    return state.records.filter(record => record.category === mode);
  }

  function setMode(mode,{focusMap=false} = {}) {
    if (!MODES[mode]) return;
    state.activeMode = mode;
    state.selectedId = null;

    state.section?.querySelectorAll("[data-territory-mode]").forEach(button => {
      const active = button.dataset.territoryMode === mode;
      button.classList.toggle("active",active);
      button.setAttribute("aria-selected",String(active));
    });

    state.section?.querySelectorAll("[data-territory-card]").forEach(card => {
      card.classList.toggle("active",card.dataset.territoryCard === mode);
    });

    const modeData = MODES[mode];
    const label = state.section?.querySelector("#territoryModeLabel");
    const title = state.section?.querySelector("#territoryModeTitle");
    const description = state.section?.querySelector("#territoryModeDescription");
    if (label) label.textContent = `CAPA · ${modeData.short.toUpperCase()}`;
    if (title) title.textContent = modeData.label;
    if (description) description.textContent = modeData.description;

    renderMetrics();
    renderResultList();
    renderMapLayers();

    if (focusMap) {
      state.section?.querySelector(".territory-map-shell")
        ?.scrollIntoView({behavior:"smooth",block:"center"});
    }
  }

  function renderMetrics() {
    const georeferenced = TERRITORY.filter(item => Number.isFinite(item.lat)).length;
    const records = state.records.length;
    const people = totalPeople();

    const locationsNode = state.section?.querySelector("#territoryMetricLocations");
    const recordsNode = state.section?.querySelector("#territoryMetricRecords");
    const peopleNode = state.section?.querySelector("#territoryMetricPopulation");

    if (locationsNode) locationsNode.textContent = `${georeferenced}/${TERRITORY.length}`;
    if (recordsNode) {
      recordsNode.textContent = state.activeMode === "territory"
        ? formatNumber(records)
        : formatNumber(layerRecords().length);
    }
    if (peopleNode) {
      peopleNode.textContent = people > 0
        ? formatNumber(people)
        : "Sin dato";
    }
  }

  function searchMatches(item,query) {
    if (!query) return true;
    const haystack = [
      item.name,
      item.kind,
      item.sector,
      item.status,
      item.description,
      ...(item.veredas || [])
    ].join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    const normalized = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    return haystack.includes(normalized);
  }

  function renderResultList() {
    const holder = state.section?.querySelector("#territoryResultList");
    const search = state.section?.querySelector("#territorySearch")?.value.trim() || "";
    if (!holder) return;

    const items = layerRecords().filter(item => searchMatches(item,search));

    if (!items.length) {
      holder.innerHTML = `
        <div class="territory-empty">
          <strong>No hay datos cargados en esta capa.</strong>
          <p>
            El administrador puede registrar puntos con coordenadas, estado,
            población afectada y evidencia.
          </p>
        </div>`;
      return;
    }

    holder.innerHTML = items.map(item => {
      const hasCoordinates =
        Number.isFinite(item.lat) && Number.isFinite(item.lng);
      const subtitle = state.activeMode === "territory"
        ? `${item.kind}${item.veredas?.length ? ` · ${item.veredas.length} veredas` : ""}`
        : `${MODES[item.category]?.label || "Registro"} · ${item.status || "Sin estado"}`;
      const value = state.activeMode === "territory"
        ? (item.altitude ? `${formatNumber(item.altitude)} m` : "Por ubicar")
        : (item.people ? `${formatNumber(item.people)} personas` : "Sin cifra");

      return `
        <button
          type="button"
          class="territory-result-item ${state.selectedId === item.id ? "active" : ""}"
          data-territory-result="${escapeHtml(item.id)}"
          ${hasCoordinates ? "" : "data-no-coordinates='true'"}
        >
          <i class="territory-result-symbol is-${escapeHtml(item.category || "territory")}">
            ${escapeHtml(MODES[item.category]?.icon || "◎")}
          </i>
          <span>
            <strong>${escapeHtml(item.name)}</strong>
            <small>${escapeHtml(subtitle)}</small>
          </span>
          <b>${escapeHtml(value)}</b>
        </button>`;
    }).join("");
  }

  function selectItem(item,{fly=true} = {}) {
    if (!item) return;
    state.selectedId = item.id;
    renderResultList();

    const title = state.section?.querySelector("#territoryDetailTitle");
    const description = state.section?.querySelector("#territoryDetailDescription");
    const meta = state.section?.querySelector("#territoryDetailMeta");

    if (title) title.textContent = item.name;
    if (description) {
      description.textContent =
        item.description ||
        item.note ||
        "Información territorial disponible para consulta.";
    }

    const chips = [];
    if (item.kind) chips.push(item.kind);
    if (item.sector) chips.push(item.sector);
    if (item.status) chips.push(item.status);
    if (item.date) chips.push(item.date);
    if (item.people) chips.push(`${formatNumber(item.people)} personas`);
    if (item.altitude) chips.push(`${formatNumber(item.altitude)} m s. n. m.`);
    if (item.veredas?.length) chips.push(item.veredas.join(" · "));
    if (meta) {
      meta.innerHTML = chips.map(chip => `<span>${escapeHtml(chip)}</span>`).join("");
    }

    if (
      fly &&
      state.mapReady &&
      Number.isFinite(item.lat) &&
      Number.isFinite(item.lng)
    ) {
      cinematicFlyTo(item);
    }
  }

  function createLeafletIcon(category = "territory",label = "") {
    const icon = MODES[category]?.icon || "◎";
    return window.L.divIcon({
      className:`territory-leaflet-icon is-${category}`,
      html:`
        <span class="territory-marker-pulse"></span>
        <i>${escapeHtml(icon)}</i>
        <b>${escapeHtml(label)}</b>`,
      iconSize:[34,34],
      iconAnchor:[17,17],
      popupAnchor:[0,-18]
    });
  }

  function popupHtml(item) {
    const category = item.category || "territory";
    const details = [];
    if (item.kind) details.push(item.kind);
    if (item.sector) details.push(item.sector);
    if (item.status) details.push(item.status);
    if (item.people) details.push(`${formatNumber(item.people)} personas`);
    if (item.veredas?.length) details.push(item.veredas.join(", "));

    return `
      <div class="territory-popup">
        <span>${escapeHtml(MODES[category]?.label || "Territorio")}</span>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.description || item.note || details.join(" · "))}</p>
        ${details.length ? `<small>${escapeHtml(details.join(" · "))}</small>` : ""}
      </div>`;
  }

  function createBaseLayers() {
    if (!window.L) return null;

    const tileOptions = {
      minZoom:9,
      updateWhenIdle:true,
      updateWhenZooming:false,
      keepBuffer:2,
      crossOrigin:true
    };

    const plano = window.L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        ...tileOptions,
        maxZoom:19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }
    );

    const relieve = window.L.tileLayer(
      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      {
        ...tileOptions,
        maxZoom:17,
        attribution:
          'Datos &copy; OpenStreetMap · relieve &copy; OpenTopoMap'
      }
    );

    const imageryUrl =
      "https://server.arcgisonline.com/ArcGIS/rest/services/" +
      "World_Imagery/MapServer/tile/{z}/{y}/{x}";
    const labelsUrl =
      "https://services.arcgisonline.com/ArcGIS/rest/services/" +
      "Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

    const satelite = window.L.tileLayer(imageryUrl,{
      ...tileOptions,
      maxZoom:19,
      attribution:"Imágenes &copy; Esri y proveedores"
    });

    const hybridImagery = window.L.tileLayer(imageryUrl,{
      ...tileOptions,
      maxZoom:19,
      attribution:"Imágenes &copy; Esri y proveedores"
    });
    const hybridLabels = window.L.tileLayer(labelsUrl,{
      ...tileOptions,
      maxZoom:19,
      pane:"overlayPane",
      opacity:.92
    });
    const hibrido = window.L.layerGroup([hybridImagery,hybridLabels]);

    return {plano,relieve,satelite,hibrido};
  }

  function setMapCameraStatus(message,active = false) {
    const shell = state.section?.querySelector(".territory-map-shell");
    const node = state.section?.querySelector("#territoryCameraStatus");
    if (node) node.textContent = message;
    shell?.classList.toggle("is-camera-active",active);
  }

  function markBaseButton(button,status) {
    if (!button) return;
    button.classList.remove("is-loading","is-loaded");
    button.removeAttribute("aria-busy");
    if (status === "loading") {
      button.classList.add("is-loading");
      button.setAttribute("aria-busy","true");
    }
    if (status === "loaded") {
      button.classList.add("is-loaded");
      window.setTimeout(() => button.classList.remove("is-loaded"),1000);
    }
  }

  function switchBasemap(name,button = null) {
    if (!state.mapReady || !state.baseLayers?.[name]) return;
    if (name === state.activeBaseName) return;

    const shell = state.section?.querySelector(".territory-map-shell");
    const next = state.baseLayers[name];
    const previous = state.activeBaseLayer;
    markBaseButton(button,"loading");
    shell?.classList.add("is-layer-switching");
    setMapCameraStatus(`Cargando vista ${BASEMAP_LABELS[name]}…`,true);

    clearTimeout(state.baseLayerReadyTimer);
    if (previous && state.map.hasLayer(previous)) state.map.removeLayer(previous);
    state.activeBaseLayer = next;
    state.activeBaseName = name;
    next.addTo(state.map);

    state.section?.querySelectorAll("[data-territory-basemap]")
      .forEach(control => {
        const active = control.dataset.territoryBasemap === name;
        control.classList.toggle("active",active);
        control.setAttribute("aria-pressed",String(active));
      });

    shell.dataset.basemap = name;

    const ready = () => {
      clearTimeout(state.baseLayerReadyTimer);
      shell?.classList.remove("is-layer-switching");
      markBaseButton(button,"loaded");
      setMapCameraStatus(`Vista ${BASEMAP_LABELS[name]} lista`,false);
    };

    const watchLayer = name === "hibrido"
      ? next.getLayers?.()[0]
      : next;
    watchLayer?.once?.("load",ready);
    state.baseLayerReadyTimer = window.setTimeout(ready,1800);
  }

  function cinematicFlyTo(item) {
    if (!state.mapReady || !state.map) return;

    const shell = state.section?.querySelector(".territory-map-shell");
    clearTimeout(state.zoomTimer);
    shell?.classList.remove("is-cinematic-zoom");
    void shell?.offsetWidth;
    shell?.classList.add("is-cinematic-zoom");

    setMapCameraStatus(`Acercando la vista a ${item.name}`,true);

    const currentZoom = state.map.getZoom();
    const targetZoom = Math.max(14.25,Math.min(16,currentZoom + 2.25));
    state.map.flyTo([item.lat,item.lng],targetZoom,{
      animate:true,
      duration:1.35,
      easeLinearity:.18,
      noMoveStart:false
    });

    state.map.once("moveend",() => {
      const layer = state.markerLayer?.getLayers?.().find(marker =>
        marker.options?.territoryId === item.id
      );
      layer?.openPopup?.();
      setMapCameraStatus(`${item.name} en detalle`,false);
      state.zoomTimer = window.setTimeout(() => {
        shell?.classList.remove("is-cinematic-zoom");
      },850);
    });
  }

  function renderMapLayers() {
    if (!state.mapReady || !window.L) return;

    if (!state.markerLayer) {
      state.markerLayer = window.L.layerGroup().addTo(state.map);
    }
    if (!state.radiusLayer) {
      state.radiusLayer = window.L.layerGroup().addTo(state.map);
    }

    state.markerLayer.clearLayers();
    state.radiusLayer.clearLayers();

    const items = layerRecords();
    const bounds = [];

    items.forEach(item => {
      if (!Number.isFinite(item.lat) || !Number.isFinite(item.lng)) return;
      const category = item.category || "territory";
      const marker = window.L.marker([item.lat,item.lng],{
        icon:createLeafletIcon(category,item.name),
        keyboard:true,
        title:item.name,
        territoryId:item.id,
        riseOnHover:true
      });
      marker.bindPopup(popupHtml(item),{
        className:"territory-popup-shell",
        maxWidth:300
      });
      marker.on("click",() => selectItem(item,{fly:false}));
      marker.addTo(state.markerLayer);
      bounds.push([item.lat,item.lng]);

      if (category === "impact" && item.people > 0) {
        const radius = Math.min(1800,Math.max(180,item.people * 8));
        window.L.circle([item.lat,item.lng],{
          radius,
          color:"#ff6b42",
          weight:1,
          opacity:.75,
          fillColor:"#ff6b42",
          fillOpacity:.12,
          interactive:false
        }).addTo(state.radiusLayer);
      }
    });

    if (bounds.length && state.activeMode !== "territory") {
      state.map.fitBounds(bounds,{
        padding:[54,54],
        maxZoom:15,
        animate:true,
        duration:.65
      });
    }
  }

  function resetMap() {
    if (!state.mapReady) return;
    const shell = state.section?.querySelector(".territory-map-shell");
    shell?.classList.add("is-cinematic-zoom");
    setMapCameraStatus("Regresando a la vista general",true);
    const positions = TERRITORY
      .filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lng))
      .map(item => [item.lat,item.lng]);

    if (positions.length) {
      state.map.fitBounds(positions,{
        padding:[38,38],
        maxZoom:13,
        animate:true,
        duration:.8
      });
    } else {
      state.map.flyTo(CENTER,12,{duration:1.1,easeLinearity:.2});
    }

    state.map.once("moveend",() => {
      setMapCameraStatus("Vista general preparada",false);
      window.setTimeout(() => shell?.classList.remove("is-cinematic-zoom"),700);
    });
  }

  function loadLeaflet() {
    if (window.L?.map) return Promise.resolve(window.L);
    if (state.leafletPromise) return state.leafletPromise;

    state.leafletPromise = new Promise((resolve,reject) => {
      let css = document.querySelector("#territoryLeafletCss");
      if (!css) {
        css = document.createElement("link");
        css.id = "territoryLeafletCss";
        css.rel = "stylesheet";
        css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        css.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        css.crossOrigin = "";
        document.head.appendChild(css);
      }

      const existing = document.querySelector("#territoryLeafletScript");
      if (existing) {
        existing.addEventListener("load",() => resolve(window.L),{once:true});
        existing.addEventListener("error",reject,{once:true});
        return;
      }

      const script = document.createElement("script");
      script.id = "territoryLeafletScript";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.onload = () => resolve(window.L);
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return state.leafletPromise;
  }

  async function initMap() {
    if (state.mapReady || !state.section) return;

    const mapNode = state.section.querySelector("#territoryMap");
    const fallback = state.section.querySelector("#territoryMapFallback");
    if (!mapNode) return;

    try {
      await loadLeaflet();
      if (!window.L?.map) throw new Error("Leaflet no disponible.");

      state.map = window.L.map(mapNode,{
        center:CENTER,
        zoom:12,
        zoomControl:false,
        scrollWheelZoom:true,
        doubleClickZoom:true,
        touchZoom:true,
        boxZoom:true,
        keyboard:true,
        preferCanvas:true,
        attributionControl:true,
        fadeAnimation:true,
        zoomAnimation:true,
        markerZoomAnimation:true,
        inertia:true,
        inertiaDeceleration:2600,
        easeLinearity:.18,
        zoomSnap:.25,
        zoomDelta:.5,
        wheelPxPerZoomLevel:84
      });

      state.baseLayers = createBaseLayers();
      state.activeBaseName = "plano";
      state.activeBaseLayer = state.baseLayers.plano;
      state.activeBaseLayer.addTo(state.map);
      state.section.querySelector(".territory-map-shell").dataset.basemap =
        state.activeBaseName;

      window.L.control.zoom({position:"topright"}).addTo(state.map);
      window.L.control.scale({
        position:"bottomleft",
        imperial:false,
        maxWidth:110
      }).addTo(state.map);

      state.map.on("click",event => {
        const {lat,lng} = event.latlng;
        state.mapClick = {lat,lng};
        const text = state.section?.querySelector("#territoryCoordinateText");
        if (text) {
          text.textContent = `Punto seleccionado: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }

        if (state.adminDialog?.open) {
          const form = state.adminDialog.querySelector("#territoryRecordForm");
          if (form) {
            form.elements.lat.value = lat.toFixed(6);
            form.elements.lng.value = lng.toFixed(6);
          }
        }
      });

      state.map.on("moveend",() => {
        if (!state.map) return;
        const center = state.map.getCenter();
        const text = state.section?.querySelector("#territoryCoordinateText");
        if (text && !state.mapClick) {
          text.textContent =
            `Centro: ${center.lat.toFixed(5)}, ${center.lng.toFixed(5)} · zoom ${state.map.getZoom().toFixed(2)}`;
        }
      });

      state.map.on("zoomstart",() => {
        state.section?.querySelector(".territory-map-shell")
          ?.classList.add("is-map-zooming");
      });
      state.map.on("zoomend",() => {
        state.section?.querySelector(".territory-map-shell")
          ?.classList.remove("is-map-zooming");
      });

      state.mapReady = true;
      fallback?.classList.add("is-hidden");
      mapNode.classList.add("is-ready");
      renderMapLayers();
      resetMap();

      window.setTimeout(() => state.map.invalidateSize({animate:false}),120);
    } catch (error) {
      fallback?.classList.add("has-error");
      const loading = fallback?.querySelector(".territory-map-loading");
      if (loading) {
        loading.innerHTML = `
          <strong>Mapa base no disponible</strong>
          <small>
            La vista territorial de respaldo sigue activa. Revise la conexión
            para habilitar zoom, desplazamiento y cartografía abierta.
          </small>`;
      }
      console.warn("TerritoryExperience: Leaflet no pudo cargarse.",error);
    }
  }

  function observeMap() {
    if (!state.section || state.mapObserver) return;

    if (!("IntersectionObserver" in window)) {
      initMap();
      return;
    }

    state.mapObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      initMap();
      state.mapObserver.disconnect();
      state.mapObserver = null;
    },{
      threshold:.02,
      rootMargin:"360px 0px"
    });

    state.mapObserver.observe(state.section);
  }

  function ensureStoryAdminDialog() {
    if (state.storyAdminDialog) return state.storyAdminDialog;

    const dialog = document.createElement("dialog");
    dialog.id = "territoryStoryAdminDialog";
    dialog.className = "territory-story-admin-dialog";
    dialog.innerHTML = `
      <div class="territory-story-admin-shell">
        <header>
          <div>
            <span>NARRATIVA VISUAL</span>
            <h2>Imágenes y videos por etapa</h2>
            <p>
              Puede conservar la animación integrada o pegar una URL directa
              de imagen o video. Utilice únicamente material autorizado.
            </p>
          </div>
          <button type="button" data-story-admin-close aria-label="Cerrar">×</button>
        </header>

        <form id="territoryStoryMediaForm">
          <div id="territoryStoryMediaRows"></div>
          <footer>
            <button type="button" class="button button-secondary" data-story-admin-close>
              Cancelar
            </button>
            <button type="submit" class="button button-primary">
              Guardar narrativa
            </button>
          </footer>
        </form>
      </div>`;

    document.body.appendChild(dialog);
    state.storyAdminDialog = dialog;

    dialog.addEventListener("click",event => {
      if (event.target === dialog || event.target.closest("[data-story-admin-close]")) {
        dialog.close();
      }
    });

    dialog.querySelector("#territoryStoryMediaForm")
      .addEventListener("submit",event => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const storyMedia = STORY_DEFAULTS.map((fallback,index) => ({
          ...fallback,
          type:String(formData.get(`type-${index}`) || "visual"),
          url:safeMediaUrl(formData.get(`url-${index}`)),
          poster:safeMediaUrl(formData.get(`poster-${index}`))
        }));

        getStore().storyMedia = storyMedia;
        persistStore();
        renderStoryMedia(
          Number(state.storySection?.style.getPropertyValue("--story-step")) || 0
        );
        portal()?.helpers?.hideLoading?.(
          "Narrativa visual actualizada.",
          {trigger:event.submitter}
        );
        dialog.close();
      });

    return dialog;
  }

  function renderStoryAdminRows() {
    const dialog = ensureStoryAdminDialog();
    const holder = dialog.querySelector("#territoryStoryMediaRows");
    const media = getStoryMedia();

    holder.innerHTML = media.map((item,index) => `
      <section class="territory-story-admin-row">
        <div>
          <span>0${index + 1}</span>
          <h3>${escapeHtml(STORY_DEFAULTS[index].title)}</h3>
        </div>
        <label>
          Tipo de contenido
          <select name="type-${index}">
            <option value="visual" ${item.type === "visual" ? "selected" : ""}>
              Animación integrada
            </option>
            <option value="image" ${item.type === "image" ? "selected" : ""}>
              Imagen por URL
            </option>
            <option value="video" ${item.type === "video" ? "selected" : ""}>
              Video por URL
            </option>
          </select>
        </label>
        <label>
          URL de imagen o video
          <input
            name="url-${index}"
            type="url"
            value="${escapeHtml(item.url || "")}"
            placeholder="https://..."
          >
        </label>
        <label>
          Póster del video
          <input
            name="poster-${index}"
            type="url"
            value="${escapeHtml(item.poster || "")}"
            placeholder="Opcional"
          >
        </label>
      </section>`).join("");
  }

  function openStoryAdminDialog() {
    if (!isAdmin()) {
      portal()?.helpers?.toast?.("Debe iniciar sesión con permisos administrativos.");
      return;
    }
    renderStoryAdminRows();
    if (!state.storyAdminDialog.open) state.storyAdminDialog.showModal();
  }

  function setStoryStep(step) {
    if (!step || !state.storySection) return;
    const index = Number(step.dataset.storyIndex || 0);
    state.storySection.style.setProperty("--story-step",String(index));
    state.storySection.querySelectorAll(".territory-story-step")
      .forEach(item => item.classList.toggle("active",item === step));

    const indexNode = state.storySection.querySelector("#territoryStoryIndex");
    const titleNode = state.storySection.querySelector("#territoryStoryTitle");
    const captionNode = state.storySection.querySelector("#territoryStoryCaption");

    if (indexNode) indexNode.textContent = String(index + 1).padStart(2,"0");
    if (titleNode) titleNode.textContent = step.dataset.storyTitle || "";
    if (captionNode) captionNode.textContent = step.dataset.storyCaption || "";

    state.storySection.querySelectorAll("[data-story-jump]").forEach(button => {
      const active = Number(button.dataset.storyJump) === index;
      button.classList.toggle("active",active);
      button.setAttribute("aria-current",active ? "step" : "false");
    });
    renderStoryMedia(index);
  }

  function setupStoryObserver() {
    if (!state.storySection || state.storyObserver) return;
    const steps = [...state.storySection.querySelectorAll(".territory-story-step")];

    if (!("IntersectionObserver" in window)) {
      steps.forEach(step => step.addEventListener("click",() => setStoryStep(step)));
      return;
    }

    state.storyObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setStoryStep(visible.target);
    },{
      threshold:[.24,.48,.72],
      rootMargin:"-24% 0px -48% 0px"
    });

    steps.forEach(step => {
      state.storyObserver.observe(step);
      step.addEventListener("click",() => setStoryStep(step));
    });
  }

  function focusCardMotion(card) {
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !matchMedia("(hover:hover) and (pointer:fine)").matches
    ) return;

    let frame = 0;
    card.addEventListener("pointermove",event => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.setProperty("--territory-card-x",x.toFixed(3));
        card.style.setProperty("--territory-card-y",y.toFixed(3));
      });
    },{passive:true});
    card.addEventListener("pointerleave",() => {
      card.style.removeProperty("--territory-card-x");
      card.style.removeProperty("--territory-card-y");
    },{passive:true});
  }

  function ensureAdminDialog() {
    if (state.adminDialog) return state.adminDialog;

    const dialog = document.createElement("dialog");
    dialog.id = "territoryAdminDialog";
    dialog.className = "territory-admin-dialog";
    dialog.setAttribute("aria-labelledby","territoryAdminTitle");
    dialog.innerHTML = `
      <div class="territory-admin-shell">
        <header class="territory-admin-head">
          <div>
            <span>GESTIÓN DEL MAPA</span>
            <h2 id="territoryAdminTitle">Datos territoriales</h2>
            <p>
              Registre únicamente información validada. Los campos de población
              y evidencia pueden dejarse vacíos cuando no exista soporte oficial.
            </p>
          </div>
          <button type="button" class="territory-admin-close" aria-label="Cerrar">×</button>
        </header>

        <div class="territory-admin-layout">
          <form id="territoryRecordForm" class="territory-record-form">
            <input type="hidden" name="recordId">

            <label>
              Capa
              <select name="category" required>
                <option value="impact">Afectación</option>
                <option value="work">Obra o respuesta</option>
                <option value="participation">Participación</option>
              </select>
            </label>

            <label>
              Nombre del registro
              <input name="name" maxlength="120" required>
            </label>

            <label>
              Barrio, vereda, corregimiento o sector
              <input name="sector" maxlength="120">
            </label>

            <div class="territory-admin-coordinates">
              <label>
                Latitud
                <input name="lat" type="number" step="0.000001" required>
              </label>
              <label>
                Longitud
                <input name="lng" type="number" step="0.000001" required>
              </label>
            </div>

            <button type="button" class="territory-use-map-center">
              Usar centro actual del mapa
            </button>

            <div class="territory-admin-coordinates">
              <label>
                Personas afectadas
                <input name="people" type="number" min="0" step="1">
              </label>
              <label>
                Fecha
                <input name="date" type="date">
              </label>
            </div>

            <label>
              Estado
              <input name="status" maxlength="80" value="En seguimiento">
            </label>

            <label>
              Descripción
              <textarea name="description" rows="4" maxlength="900"></textarea>
            </label>

            <label>
              Enlace de evidencia
              <input name="evidence" type="url" placeholder="https://...">
            </label>

            <div class="territory-admin-form-actions">
              <button type="button" class="button button-secondary territory-clear-form">
                Limpiar
              </button>
              <button type="submit" class="button button-primary">
                Guardar punto
              </button>
            </div>
          </form>

          <section class="territory-admin-records">
            <div class="territory-admin-records-head">
              <div>
                <span>REGISTROS CARGADOS</span>
                <strong id="territoryAdminCount">0</strong>
              </div>
              <button type="button" class="territory-export-data">
                Exportar JSON
              </button>
            </div>
            <div id="territoryAdminList"></div>
          </section>
        </div>
      </div>`;

    document.body.appendChild(dialog);
    state.adminDialog = dialog;

    dialog.querySelector(".territory-admin-close")
      .addEventListener("click",() => dialog.close());

    dialog.addEventListener("click",event => {
      if (event.target === dialog) dialog.close();
    });

    dialog.querySelector(".territory-use-map-center")
      .addEventListener("click",() => {
        const center = state.mapReady
          ? state.map.getCenter()
          : {lat:CENTER[0],lng:CENTER[1]};
        const form = dialog.querySelector("#territoryRecordForm");
        form.elements.lat.value = center.lat.toFixed(6);
        form.elements.lng.value = center.lng.toFixed(6);
      });

    dialog.querySelector(".territory-clear-form")
      .addEventListener("click",clearAdminForm);

    dialog.querySelector(".territory-export-data")
      .addEventListener("click",exportData);

    dialog.querySelector("#territoryRecordForm")
      .addEventListener("submit",event => {
        event.preventDefault();
        saveAdminRecord(new FormData(event.currentTarget));
      });

    return dialog;
  }

  function clearAdminForm() {
    const form = state.adminDialog?.querySelector("#territoryRecordForm");
    if (!form) return;
    form.reset();
    form.elements.category.value = "impact";
    form.elements.status.value = "En seguimiento";
    form.elements.recordId.value = "";
    state.editingRecordId = null;

    const center = state.mapReady
      ? state.map.getCenter()
      : {lat:CENTER[0],lng:CENTER[1]};
    form.elements.lat.value = center.lat.toFixed(6);
    form.elements.lng.value = center.lng.toFixed(6);
  }

  function renderAdminList() {
    const list = state.adminDialog?.querySelector("#territoryAdminList");
    const count = state.adminDialog?.querySelector("#territoryAdminCount");
    if (!list || !count) return;

    count.textContent = formatNumber(state.records.length);

    if (!state.records.length) {
      list.innerHTML = `
        <div class="territory-admin-empty">
          <strong>Aún no hay puntos oficiales.</strong>
          <p>Agregue afectaciones, obras o ejercicios de participación.</p>
        </div>`;
      return;
    }

    list.innerHTML = state.records.map(record => `
      <article class="territory-admin-row">
        <i class="is-${escapeHtml(record.category)}">
          ${escapeHtml(MODES[record.category]?.icon || "◎")}
        </i>
        <div>
          <strong>${escapeHtml(record.name)}</strong>
          <small>
            ${escapeHtml(record.sector || "Sin sector")} ·
            ${escapeHtml(record.status || "Sin estado")}
          </small>
        </div>
        <button type="button" data-territory-edit="${escapeHtml(record.id)}">
          Editar
        </button>
        <button type="button" data-territory-delete="${escapeHtml(record.id)}">
          Eliminar
        </button>
      </article>`).join("");
  }

  function openAdminDialog() {
    if (!isAdmin()) {
      portal()?.helpers?.toast?.("Debe iniciar sesión con permisos administrativos.");
      portal()?.openDialog?.("loginDialog");
      return;
    }

    refreshRecords();
    const dialog = ensureAdminDialog();
    renderAdminList();
    clearAdminForm();
    if (!dialog.open) dialog.showModal();
  }

  function saveAdminRecord(formData) {
    const lat = Number(formData.get("lat"));
    const lng = Number(formData.get("lng"));
    const name = String(formData.get("name") || "").trim();
    if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      portal()?.helpers?.toast?.("Complete nombre, latitud y longitud.");
      return;
    }

    const id = String(formData.get("recordId") || "").trim()
      || `territory-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

    const record = {
      id,
      category:String(formData.get("category") || "impact"),
      name,
      sector:String(formData.get("sector") || "").trim(),
      lat,
      lng,
      people:Math.max(0,Number(formData.get("people")) || 0),
      date:String(formData.get("date") || ""),
      status:String(formData.get("status") || "").trim(),
      description:String(formData.get("description") || "").trim(),
      evidence:String(formData.get("evidence") || "").trim(),
      updatedAt:new Date().toISOString()
    };

    const store = getStore();
    const index = store.records.findIndex(item => item.id === id);
    if (index >= 0) store.records[index] = record;
    else store.records.push(record);

    persistStore();
    refreshRecords();
    renderAdminList();
    renderMetrics();
    renderResultList();
    renderMapLayers();
    clearAdminForm();
    portal()?.helpers?.toast?.("Punto territorial guardado.");
  }

  function editAdminRecord(id) {
    const record = state.records.find(item => item.id === id);
    const form = state.adminDialog?.querySelector("#territoryRecordForm");
    if (!record || !form) return;

    state.editingRecordId = id;
    Object.entries(record).forEach(([key,value]) => {
      if (form.elements[key]) form.elements[key].value = value ?? "";
    });
    form.elements.recordId.value = id;
    form.scrollIntoView({behavior:"smooth",block:"start"});
  }

  function deleteAdminRecord(id) {
    const record = state.records.find(item => item.id === id);
    if (!record) return;
    if (!confirm(`¿Eliminar "${record.name}" del mapa?`)) return;

    const store = getStore();
    store.records = store.records.filter(item => item.id !== id);
    persistStore();
    refreshRecords();
    renderAdminList();
    renderMetrics();
    renderResultList();
    renderMapLayers();
    portal()?.helpers?.toast?.("Punto territorial eliminado.");
  }

  function exportData() {
    const payload = JSON.stringify(getStore(),null,2);
    const blob = new Blob([payload],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `san-pedro-territorio-${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function syncAdminVisibility() {
    const mapButton = state.section?.querySelector("#territoryAdminButton");
    const storyButton = state.storySection?.querySelector(
      "#territoryStoryAdminButton"
    );
    const hidden = !isAdmin();
    if (mapButton) mapButton.hidden = hidden;
    if (storyButton) storyButton.hidden = hidden;
  }

  function bindEvents() {
    state.section?.addEventListener("click",event => {
      const basemapButton = event.target.closest("[data-territory-basemap]");
      if (basemapButton) {
        switchBasemap(basemapButton.dataset.territoryBasemap,basemapButton);
        return;
      }

      const modeButton = event.target.closest("[data-territory-mode]");
      if (modeButton) {
        setMode(modeButton.dataset.territoryMode);
        return;
      }

      const result = event.target.closest("[data-territory-result]");
      if (result) {
        const id = result.dataset.territoryResult;
        const item = layerRecords().find(entry => entry.id === id);
        if (item) selectItem(item);
        return;
      }

      const fallbackNode = event.target.closest("[data-territory-id]");
      if (fallbackNode) {
        const item = TERRITORY.find(entry =>
          entry.id === fallbackNode.dataset.territoryId
        );
        if (item) selectItem(item);
        return;
      }

      const card = event.target.closest("[data-territory-card]");
      if (card) {
        setMode(card.dataset.territoryCard,{focusMap:true});
        return;
      }

      if (event.target.closest("#territoryResetMap")) {
        state.mapClick = null;
        resetMap();
        return;
      }

      if (event.target.closest("#territoryAdminButton")) {
        openAdminDialog();
      }
    });

    state.section?.addEventListener("keydown",event => {
      const card = event.target.closest("[data-territory-card]");
      if (!card || !["Enter"," "].includes(event.key)) return;
      event.preventDefault();
      setMode(card.dataset.territoryCard,{focusMap:true});
    });


    state.storySection?.addEventListener("click",event => {
      const jump = event.target.closest("[data-story-jump]");
      if (jump) {
        const step = state.storySection.querySelector(
          `.territory-story-step[data-story-index="${jump.dataset.storyJump}"]`
        );
        if (step) {
          setStoryStep(step);
          step.scrollIntoView({behavior:"smooth",block:"center"});
        }
        return;
      }

      if (event.target.closest("#territoryStoryAdminButton")) {
        openStoryAdminDialog();
      }
    });

    state.section?.querySelector("#territorySearch")
      ?.addEventListener("input",renderResultList);

    state.section?.querySelectorAll(".territory-focus-card")
      .forEach(focusCardMotion);

    document.addEventListener("click",event => {
      const edit = event.target.closest("[data-territory-edit]");
      if (edit) editAdminRecord(edit.dataset.territoryEdit);

      const remove = event.target.closest("[data-territory-delete]");
      if (remove) deleteAdminRecord(remove.dataset.territoryDelete);
    });

    [
      "portal:rendered",
      "portal:datachange",
      "firebase:authchange",
      "portal:adminchange"
    ].forEach(name => {
      document.addEventListener(name,() => {
        refreshRecords();
        syncAdminVisibility();
        renderMetrics();
        renderResultList();
        renderMapLayers();
        renderStoryMedia(
          Number(state.storySection?.style.getPropertyValue("--story-step")) || 0
        );
      });
    });

    window.addEventListener("resize",() => {
      if (!state.mapReady) return;
      requestAnimationFrame(() => state.map.invalidateSize({animate:false}));
    },{passive:true});
  }

  function init() {
    if (!isHome()) return;

    if (state.initialized) {
      syncAdminVisibility();
      refreshRecords();
      renderMetrics();
      renderResultList();
      return;
    }

    state.initialized = true;
    refreshRecords();
    createMapSection();
    bindEvents();
    syncAdminVisibility();
    renderMetrics();
    renderResultList();
    setupStoryObserver();
    observeMap();

    window.dispatchEvent(new CustomEvent("portal:rendered",{
      detail:{source:"territory-experience",build:BUILD}
    }));
  }

  window.TerritoryExperience = {
    init,
    setMode,
    openAdmin:openAdminDialog,
    openStoryAdmin:openStoryAdminDialog,
    switchBasemap,
    resetMap,
    refresh:() => {
      refreshRecords();
      renderMetrics();
      renderResultList();
      renderMapLayers();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded",init,{once:true});
  } else {
    init();
  }
})();
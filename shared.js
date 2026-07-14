(() => {
  const KEYS = {
    years: "sp_v4_years",
    resources: "sp_v4_resources",
    ideas: "sp_v4_ideas",
    settings: "sp_v4_settings",
    admin: "sp_v4_admin"
  };

  const DEFAULT_YEARS = [
    {
      year: 2025,
      status: "Publicada",
      progress: 92,
      summary: "Balance completo de resultados, inversión, participación y compromisos de la vigencia.",
      headline: "Un año de resultados que se pueden consultar, entender y verificar.",
      documents: 18,
      videos: 6,
      commitments: 24,
      questions: 18,
      metrics: { plan: 92, projects: 148, commitments: 87, participation: 36 },
      sectors: [
        ["Infraestructura", 94],
        ["Desarrollo social", 89],
        ["Gestión administrativa", 86],
        ["Participación ciudadana", 82]
      ]
    },
    {
      year: 2026,
      status: "En construcción",
      progress: 58,
      summary: "Avances parciales, evidencias y preparación de la próxima audiencia de Rendición de Cuentas.",
      headline: "La información se construye durante el año, no únicamente al final.",
      documents: 7,
      videos: 2,
      commitments: 9,
      questions: 7,
      metrics: { plan: 58, projects: 74, commitments: 61, participation: 18 },
      sectors: [
        ["Infraestructura", 63],
        ["Desarrollo social", 59],
        ["Gestión administrativa", 57],
        ["Participación ciudadana", 51]
      ]
    },
    {
      year: 2027,
      status: "Programada",
      progress: 0,
      summary: "Edición reservada para incorporar documentos, resultados y espacios ciudadanos de la nueva vigencia.",
      headline: "Una estructura lista para crecer sin rediseñar todo el portal.",
      documents: 0,
      videos: 0,
      commitments: 0,
      questions: 0,
      metrics: { plan: 0, projects: 0, commitments: 0, participation: 0 },
      sectors: [
        ["Infraestructura", 0],
        ["Desarrollo social", 0],
        ["Gestión administrativa", 0],
        ["Participación ciudadana", 0]
      ]
    }
  ];

  const DEFAULT_RESOURCES = [
    { id:"r1", year:2025, type:"informe", title:"Informe de Gestión y Rendición de Cuentas 2025", description:"Documento principal con resultados, ejecución, metas, retos y compromisos.", meta:"84 páginas · 4.8 MB", url:"#", featured:true },
    { id:"r2", year:2025, type:"presentacion", title:"Presentación de la Audiencia Pública", description:"Síntesis visual utilizada durante el ejercicio de diálogo ciudadano.", meta:"42 diapositivas · 9.2 MB", url:"#", featured:true },
    { id:"r3", year:2025, type:"video", title:"Transmisión de la Audiencia Pública", description:"Registro audiovisual completo de la jornada institucional.", meta:"1 h 48 min", url:"#", featured:true },
    { id:"r4", year:2025, type:"datos", title:"Base consolidada de indicadores", description:"Archivo estructurado para consulta, análisis y reutilización.", meta:"12 hojas · 1.3 MB", url:"#", featured:true },
    { id:"r5", year:2025, type:"compromiso", title:"Matriz de seguimiento a compromisos", description:"Responsables, fechas, avances y evidencias asociadas.", meta:"24 compromisos", url:"#", featured:false },
    { id:"r6", year:2025, type:"respuesta", title:"Preguntas y respuestas ciudadanas", description:"Consolidado de inquietudes y respuestas oficiales.", meta:"18 respuestas", url:"#", featured:false },
    { id:"r7", year:2026, type:"informe", title:"Informe preliminar de avance 2026", description:"Corte de seguimiento para preparar la nueva edición.", meta:"Borrador", url:"#", featured:true },
    { id:"r8", year:2026, type:"datos", title:"Seguimiento semestral de metas", description:"Avance demostrativo de metas de la vigencia 2026.", meta:"6 hojas", url:"#", featured:true },
    { id:"r9", year:2027, type:"informe", title:"Espacio documental 2027", description:"Reserva para incorporar los documentos de la nueva vigencia.", meta:"Programado", url:"#", featured:true }
  ];

  const DEFAULT_IDEAS = [
    {
      id:"i1", title:"Ruta segura para estudiantes", author:"Junta de Acción Comunal", location:"Zona urbana",
      category:"Infraestructura", description:"Mejorar señalización, iluminación y pasos seguros en recorridos utilizados por estudiantes.",
      status:"analisis", response:"La propuesta fue remitida a Planeación e Infraestructura para revisión técnica.", votes:18, created:"20 jun. 2026"
    },
    {
      id:"i2", title:"Mercado campesino mensual", author:"Productores rurales", location:"Zona rural",
      category:"Desarrollo social", description:"Crear un espacio mensual para que productores locales ofrezcan sus productos directamente.",
      status:"aceptada", response:"La iniciativa será considerada en la programación institucional del segundo semestre.", votes:31, created:"11 jun. 2026"
    },
    {
      id:"i3", title:"Recuperación de un parque barrial", author:"Colectivo juvenil", location:"Barrio El Centro",
      category:"Medio ambiente", description:"Recuperar zonas verdes, mobiliario y pintura mediante una jornada comunitaria.",
      status:"resuelta", response:"Se realizó una intervención inicial y se programó una segunda jornada de mantenimiento.", votes:22, created:"27 may. 2026"
    },
    {
      id:"i4", title:"Talleres culturales itinerantes", author:"Madres comunitarias", location:"Corregimientos",
      category:"Cultura", description:"Llevar talleres de música, lectura y artes a diferentes sectores rurales.",
      status:"recibida", response:"La propuesta fue recibida y está pendiente de asignación.", votes:9, created:"2 jul. 2026"
    }
  ];

  const DEFAULT_SETTINGS = {
    theme:"blue",
    primary:"#0b4fb3",
    secondary:"#137ad1",
    accent:"#f4b41a",
    background:"#f5f7fb",
    text:"#14213d",
    fontScale:100,
    radius:18
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function loadArray(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return Array.isArray(value) ? value : clone(fallback);
    } catch {
      return clone(fallback);
    }
  }

  function loadObject(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && typeof value === "object" ? { ...clone(fallback), ...value } : clone(fallback);
    } catch {
      return clone(fallback);
    }
  }

  const state = {
    years: loadArray(KEYS.years, DEFAULT_YEARS),
    resources: loadArray(KEYS.resources, DEFAULT_RESOURCES),
    ideas: loadArray(KEYS.ideas, DEFAULT_IDEAS),
    settings: loadObject(KEYS.settings, DEFAULT_SETTINGS),
    admin: sessionStorage.getItem(KEYS.admin) === "1"
  };

  const helpers = {
    escape(value) {
      return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
      })[c]);
    },
    safeUrl(value) {
      const url = String(value || "#").trim();
      return /^(https?:\/\/|#|\/)/i.test(url) ? url : "#";
    },
    yearUrl(year) {
      const numeric = Number(year);
      if ([2025, 2026, 2027].includes(numeric)) return `rendicion-${numeric}.html`;
      return `rendicion.html?year=${numeric}`;
    },
    typeLabel(type) {
      return {
        informe:"Informe", presentacion:"Presentación", video:"Video",
        datos:"Datos abiertos", compromiso:"Seguimiento", respuesta:"Respuesta"
      }[type] || "Documento";
    },
    typeIcon(type) {
      return {
        informe:"PDF", presentacion:"PPT", video:"VID",
        datos:"XLS", compromiso:"SEG", respuesta:"FAQ"
      }[type] || "DOC";
    },
    statusLabel(status) {
      return {
        recibida:"Recibida",
        analisis:"En análisis",
        aceptada:"Se tendrá en cuenta",
        resuelta:"Resuelta"
      }[status] || status;
    },
    getYear(year) {
      return state.years.find(item => Number(item.year) === Number(year));
    },
    save() {
      localStorage.setItem(KEYS.years, JSON.stringify(state.years));
      localStorage.setItem(KEYS.resources, JSON.stringify(state.resources));
      localStorage.setItem(KEYS.ideas, JSON.stringify(state.ideas));
      localStorage.setItem(KEYS.settings, JSON.stringify(state.settings));
    },
    toast(message) {
      let toast = document.querySelector("#globalToast");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "globalToast";
        toast.className = "toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        document.body.appendChild(toast);
      }
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
    }
  };

  function applySettings() {
    const root = document.documentElement;
    const s = state.settings;
    root.style.setProperty("--primary", s.primary);
    root.style.setProperty("--secondary", s.secondary);
    root.style.setProperty("--accent", s.accent);
    root.style.setProperty("--page", s.background);
    root.style.setProperty("--ink", s.text);
    root.style.setProperty("--font-scale", Number(s.fontScale) / 100);
    root.style.setProperty("--radius", `${s.radius}px`);
  }

  function renderHeader() {
    const target = document.querySelector("#siteHeader");
    if (!target) return;
    const page = document.body.dataset.page || "";
    const active = name => page === name ? "active" : "";
    const years = [...state.years].sort((a,b) => Number(a.year) - Number(b.year));

    target.className = "site-header-wrapper";
    target.innerHTML = `
      <a class="skip-link" href="#main-content">Saltar al contenido principal</a>

      <div class="top-utility">
        <div class="site-shell top-utility__inner">
          <span>Portal especial de la Alcaldía de San Pedro, Valle del Cauca</span>
          <div>
            <a href="https://www.sanpedro-valle.gov.co/" target="_blank" rel="noopener">Portal institucional</a>
            <a href="https://www.sanpedro-valle.gov.co/transparencia" target="_blank" rel="noopener">Transparencia</a>
            <button type="button" id="accessibilityButton" aria-expanded="false" aria-controls="accessibilityPopover">Accesibilidad</button>
          </div>
        </div>
      </div>

      <header class="main-header">
        <div class="site-shell main-header__inner">
          <a class="header-brand" href="index.html" aria-label="Ir a la portada de Rendición de Cuentas de San Pedro">
            <img class="header-crest" src="assets/escudo-san-pedro.png" alt="Escudo oficial del municipio de San Pedro, Valle del Cauca">
            <span class="header-brand__copy">
              <strong>San Pedro</strong>
              <small>Rendición de Cuentas</small>
            </span>
            <span class="header-brand__divider" aria-hidden="true"></span>
            <img class="header-tourism-logo" src="assets/imagen-san-pedro-color.png" alt="Marca San Pedro, donde nacen los sueños">
          </a>

          <button class="mobile-nav-button" id="mobileNavButton" type="button" aria-label="Abrir menú principal" aria-expanded="false" aria-controls="primaryNav">☰</button>

          <nav class="primary-nav" id="primaryNav" aria-label="Navegación principal">
            <a class="${active("home")}" href="index.html">Inicio</a>
            <div class="nav-dropdown">
              <button class="${active("year")}" type="button" aria-haspopup="true" aria-expanded="false">Vigencias <span aria-hidden="true">⌄</span></button>
              <div class="nav-dropdown__menu">
                ${years.map(y => `<a href="${helpers.yearUrl(y.year)}"><b>${y.year}</b><span>${helpers.escape(y.status)}</span></a>`).join("")}
                <a href="vigencias.html"><b>Archivo histórico</b><span>Ver todas las ediciones</span></a>
              </div>
            </div>
            <a class="${active("resources")}" href="recursos.html">Recursos</a>
            <a class="${active("ideas")}" href="ideas.html">Ideas ciudadanas</a>
          </nav>

          <div class="header-actions">
            <button class="reader-entry" id="readerToggle" type="button" aria-label="Abrir narrador de texto" aria-expanded="false" aria-controls="readerPanel">
              <span aria-hidden="true">🔊</span><span>Escuchar</span>
            </button>
            <button class="header-search" id="headerSearch" type="button" aria-label="Abrir búsqueda general"><span aria-hidden="true">⌕</span></button>
            <button class="admin-entry" id="adminEntry" type="button">Administrador</button>
          </div>
        </div>
      </header>

      <div class="accessibility-popover" id="accessibilityPopover" role="region" aria-label="Herramientas de accesibilidad" aria-hidden="true">
        <strong>Accesibilidad</strong>
        <button type="button" data-access="increase">Aumentar texto</button>
        <button type="button" data-access="decrease">Reducir texto</button>
        <button type="button" data-access="contrast">Alto contraste</button>
        <button type="button" data-access="motion">Reducir movimiento</button>
      </div>

      <aside class="reader-panel" id="readerPanel" role="region" aria-label="Narrador de texto" aria-hidden="true">
        <div class="reader-panel__head">
          <div><strong>Narrador de texto</strong><small>Español latino · preferencia Colombia</small></div>
          <button type="button" id="readerClose" aria-label="Cerrar narrador">×</button>
        </div>
        <label class="reader-field">Contenido que desea escuchar
          <select id="readerScope">
            <option value="page">Página completa</option>
          </select>
        </label>
        <label class="reader-field">Voz latinoamericana
          <select id="readerVoice" aria-describedby="readerVoiceHelp">
            <option value="">Buscando voces disponibles…</option>
          </select>
          <small id="readerVoiceHelp">Se prioriza Colombia y después otras variantes latinoamericanas.</small>
        </label>
        <label class="reader-field">Velocidad
          <input id="readerRate" type="range" min="0.7" max="1.4" step="0.1" value="1">
        </label>
        <div class="reader-controls">
          <button type="button" id="readerPlay"><span aria-hidden="true">▶</span> Leer</button>
          <button type="button" id="readerPause"><span aria-hidden="true">⏸</span> Pausar</button>
          <button type="button" id="readerStop"><span aria-hidden="true">■</span> Detener</button>
        </div>
        <p class="reader-status" id="readerStatus" role="status" aria-live="polite">Listo para iniciar la narración.</p>
      </aside>
    `;
  }

  function renderFooter() {
    const target = document.querySelector("#siteFooter");
    if (!target) return;
    target.innerHTML = `
      <footer class="site-footer">
        <div class="site-shell site-footer__grid">
          <div>
            <a class="footer-brand" href="index.html">
              <img src="assets/escudo-san-pedro.png" alt="Escudo oficial del municipio de San Pedro">
              <span><strong>San Pedro</strong><small>Donde nacen los sueños</small></span>
            </a>
            <p>Portal especial para consultar resultados, documentos, compromisos y participación ciudadana.</p>
            <div class="footer-social"><span>f</span><span>◎</span><span>▶</span></div>
          </div>
          <div><h3>Rendición</h3><a href="rendicion-2025.html">Vigencia 2025</a><a href="rendicion-2026.html">Vigencia 2026</a><a href="vigencias.html">Archivo histórico</a></div>
          <div><h3>Ciudadanía</h3><a href="ideas.html">Laboratorio de ideas</a><a href="recursos.html">Centro de recursos</a><a href="https://www.sanpedro-valle.gov.co/?x=1600527" target="_blank">PQRDS</a></div>
          <div><h3>Contacto</h3><p>Calle 5 # 3-85 Esquina</p><p>San Pedro, Valle del Cauca</p><a href="https://www.sanpedro-valle.gov.co/" target="_blank">Portal institucional ↗</a></div>
        </div>
        <div class="site-shell site-footer__bottom"><span>© ${new Date().getFullYear()} Municipio de San Pedro</span><span>Rendición de Cuentas</span></div>
      </footer>
    `;
  }

  function renderGlobalDialogs() {
    const holder = document.querySelector("#globalDialogs") || (() => {
      const div = document.createElement("div");
      div.id = "globalDialogs";
      document.body.appendChild(div);
      return div;
    })();

    holder.innerHTML = `
      <dialog class="dialog" id="searchDialog">
        <button class="dialog-close" data-close-dialog="searchDialog">×</button>
        <span class="section-kicker">BÚSQUEDA GENERAL</span>
        <h2>¿Qué desea consultar?</h2>
        <input class="large-input" id="globalSearchInput" placeholder="Vigencia, documento, idea o tema">
        <div class="search-list" id="globalSearchList"></div>
      </dialog>

      <dialog class="dialog" id="loginDialog">
        <button class="dialog-close" data-close-dialog="loginDialog">×</button>
        <span class="section-kicker">ACCESO ADMINISTRATIVO</span>
        <h2>Ingresar al panel</h2>
        <p class="dialog-note">Acceso demostrativo local. La autenticación real se conectará posteriormente a Firebase.</p>
        <form class="dialog-form" id="adminLoginForm">
          <label>Usuario<input name="username" required></label>
          <label>Contraseña<input name="password" type="password" required></label>
          <button class="button button-primary">Ingresar</button>
          <small>Credenciales de prueba disponibles en el README.</small>
        </form>
      </dialog>

      <dialog class="admin-panel" id="adminPanel">
        <div class="admin-panel__layout">
          <aside class="admin-sidebar">
            <div class="admin-brand"><img src="assets/escudo-san-pedro.png" alt="Escudo oficial del municipio de San Pedro"><span><strong>Administración</strong><small>Modo demostración</small></span></div>
            <button class="admin-tab-button active" data-admin-tab="appearance">Apariencia</button>
            <button class="admin-tab-button" data-admin-tab="years">Vigencias</button>
            <button class="admin-tab-button" data-admin-tab="resources">Recursos</button>
            <button class="admin-tab-button" data-admin-tab="ideas">Ideas ciudadanas</button>
            <button class="admin-tab-button" data-admin-tab="backup">Respaldo</button>
            <button class="admin-tab-button admin-signout" id="adminSignout">Cerrar sesión</button>
          </aside>
          <section class="admin-main">
            <div class="admin-top">
              <div><span>PANEL ADMINISTRATIVO</span><h2 id="adminTitle">Apariencia</h2></div>
              <button data-close-dialog="adminPanel" aria-label="Cerrar panel administrativo">Cerrar <span aria-hidden="true">×</span></button>
            </div>

            <div class="admin-tab active" data-admin-panel="appearance">
              <div class="admin-card">
                <h3>Temas visuales</h3>
                <div class="theme-cards">
                  <button data-theme="blue"><img src="assets/imagen-san-pedro-color.png" alt="Marca multicolor San Pedro, donde nacen los sueños"><strong>Azul institucional</strong><small>Inspirado en el portal moderno</small></button>
                  <button data-theme="municipal"><img src="assets/escudo-san-pedro.png" alt="Escudo oficial del municipio de San Pedro"><strong>Municipal</strong><small>Azul, verde y amarillo</small></button>
                  <button data-theme="purple"><img src="assets/marca-san-pedro-morada.png" alt="Marca alternativa morada de San Pedro"><strong>Morado</strong><small>Identidad alternativa</small></button>
                </div>
              </div>
              <div class="admin-grid">
                <div class="admin-card">
                  <h3>Colores</h3>
                  <div class="color-grid">
                    <label>Principal<input id="adminPrimary" type="color"></label>
                    <label>Secundario<input id="adminSecondary" type="color"></label>
                    <label>Acento<input id="adminAccent" type="color"></label>
                    <label>Fondo<input id="adminBackground" type="color"></label>
                    <label>Texto<input id="adminText" type="color"></label>
                  </div>
                  <button class="button button-primary" id="applyAdminColors">Aplicar</button>
                </div>
                <div class="admin-card">
                  <h3>Escala y formas</h3>
                  <label class="range-label">Tamaño general <output id="adminFontOutput"></output><input id="adminFontScale" type="range" min="85" max="120"></label>
                  <label class="range-label">Redondeado <output id="adminRadiusOutput"></output><input id="adminRadius" type="range" min="0" max="30"></label>
                </div>
              </div>
            </div>

            <div class="admin-tab" data-admin-panel="years">
              <div class="admin-grid">
                <div class="admin-card">
                  <h3>Crear nueva vigencia</h3>
                  <form class="admin-form" id="createYearForm">
                    <label>Año<input name="year" type="number" min="2025" max="2100" required></label>
                    <label>Estado<select name="status"><option>Programada</option><option>En construcción</option><option>Publicada</option></select></label>
                    <label>Avance<input name="progress" type="number" min="0" max="100" value="0"></label>
                    <label>Resumen<textarea name="summary" rows="4" required></textarea></label>
                    <button class="button button-primary">Crear vigencia</button>
                  </form>
                </div>
                <div class="admin-card"><h3>Vigencias disponibles</h3><div id="adminYearsList"></div></div>
              </div>
            </div>

            <div class="admin-tab" data-admin-panel="resources">
              <div class="admin-grid">
                <div class="admin-card">
                  <h3>Agregar recurso</h3>
                  <form class="admin-form" id="createResourceForm">
                    <label>Título<input name="title" required></label>
                    <label>Vigencia<select name="year" id="adminResourceYear"></select></label>
                    <label>Tipo<select name="type"><option value="informe">Informe</option><option value="presentacion">Presentación</option><option value="video">Video</option><option value="datos">Datos</option><option value="compromiso">Seguimiento</option><option value="respuesta">Respuesta</option></select></label>
                    <label>Descripción<textarea name="description" rows="3" required></textarea></label>
                    <label>Enlace<input name="url" value="#"></label>
                    <button class="button button-primary">Agregar recurso</button>
                  </form>
                </div>
                <div class="admin-card"><h3>Recursos registrados</h3><div class="admin-scroll-list" id="adminResourcesList"></div></div>
              </div>
            </div>

            <div class="admin-tab" data-admin-panel="ideas">
              <div class="admin-card"><h3>Gestión de ideas ciudadanas</h3><div class="admin-scroll-list" id="adminIdeasList"></div></div>
            </div>

            <div class="admin-tab" data-admin-panel="backup">
              <div class="admin-grid">
                <div class="admin-card"><h3>Exportar configuración</h3><p>Descargue un respaldo de vigencias, recursos, ideas y apariencia.</p><button class="button button-primary" id="exportPortal">Descargar JSON</button></div>
                <div class="admin-card admin-danger-card"><h3>Restablecer demostración</h3><p>Elimina los cambios guardados en este navegador.</p><button class="button button-danger" id="resetPortal">Restablecer</button></div>
              </div>
            </div>
          </section>
        </div>
      </dialog>

      <dialog class="dialog" id="ideaAdminDialog">
        <button class="dialog-close" data-close-dialog="ideaAdminDialog">×</button>
        <div id="ideaAdminDialogContent"></div>
      </dialog>
    `;
  }

  function openDialog(id) {
    const dialog = document.querySelector(`#${id}`);
    if (dialog && !dialog.open) dialog.showModal();
  }

  function closeDialog(id) {
    const dialog = document.querySelector(`#${id}`);
    if (dialog?.open) dialog.close();
  }

  function searchPortal(query) {
    const list = document.querySelector("#globalSearchList");
    if (!list) return;
    const q = query.trim().toLowerCase();
    if (!q) {
      list.innerHTML = `
        <a class="search-item" href="vigencias.html"><span><strong>Archivo histórico</strong><small>Consulte todas las vigencias</small></span><b>→</b></a>
        <a class="search-item" href="recursos.html"><span><strong>Centro de recursos</strong><small>Informes, videos, datos y respuestas</small></span><b>→</b></a>
        <a class="search-item" href="ideas.html"><span><strong>Ideas ciudadanas</strong><small>Propuestas y respuestas institucionales</small></span><b>→</b></a>`;
      return;
    }

    const results = [];
    state.years
      .filter(y => `${y.year} ${y.status} ${y.summary}`.toLowerCase().includes(q))
      .forEach(y => results.push({ title:`Rendición de Cuentas ${y.year}`, meta:y.status, href:helpers.yearUrl(y.year) }));
    state.resources
      .filter(r => `${r.title} ${r.description} ${r.year} ${r.type}`.toLowerCase().includes(q))
      .forEach(r => results.push({ title:r.title, meta:`${r.year} · ${helpers.typeLabel(r.type)}`, href:`recursos.html?q=${encodeURIComponent(r.title)}` }));
    state.ideas
      .filter(i => `${i.title} ${i.description} ${i.category} ${i.location}`.toLowerCase().includes(q))
      .forEach(i => results.push({ title:i.title, meta:`Idea · ${helpers.statusLabel(i.status)}`, href:`ideas.html?id=${i.id}` }));

    list.innerHTML = results.length
      ? results.map(r => `<a class="search-item" href="${r.href}"><span><strong>${helpers.escape(r.title)}</strong><small>${helpers.escape(r.meta)}</small></span><b>→</b></a>`).join("")
      : `<p class="dialog-note">No se encontraron resultados para “${helpers.escape(query)}”.</p>`;
  }

  function syncAdmin() {
    const s = state.settings;
    const ids = {
      adminPrimary:"primary", adminSecondary:"secondary", adminAccent:"accent",
      adminBackground:"background", adminText:"text"
    };
    Object.entries(ids).forEach(([id,key]) => {
      const input = document.querySelector(`#${id}`);
      if (input) input.value = s[key];
    });
    const scale = document.querySelector("#adminFontScale");
    const radius = document.querySelector("#adminRadius");
    if (scale) scale.value = s.fontScale;
    if (radius) radius.value = s.radius;
    if (document.querySelector("#adminFontOutput")) document.querySelector("#adminFontOutput").value = `${s.fontScale}%`;
    if (document.querySelector("#adminRadiusOutput")) document.querySelector("#adminRadiusOutput").value = `${s.radius}px`;

    const yearSelect = document.querySelector("#adminResourceYear");
    if (yearSelect) {
      yearSelect.innerHTML = [...state.years].sort((a,b) => a.year-b.year).map(y => `<option>${y.year}</option>`).join("");
    }

    const yearList = document.querySelector("#adminYearsList");
    if (yearList) {
      yearList.innerHTML = [...state.years].sort((a,b)=>a.year-b.year).map(y => `
        <div class="admin-list-row"><span><strong>${y.year}</strong><small>${helpers.escape(y.status)} · ${y.progress}%</small></span><a href="${helpers.yearUrl(y.year)}" target="_blank">Abrir ↗</a></div>`).join("");
    }

    const resourceList = document.querySelector("#adminResourcesList");
    if (resourceList) {
      resourceList.innerHTML = state.resources.map(r => `
        <div class="admin-list-row"><span><strong>${helpers.escape(r.title)}</strong><small>${r.year} · ${helpers.typeLabel(r.type)}</small></span><button data-delete-resource="${r.id}">Eliminar</button></div>`).join("");
    }

    const ideasList = document.querySelector("#adminIdeasList");
    if (ideasList) {
      ideasList.innerHTML = state.ideas.map(i => `
        <div class="admin-list-row"><span><strong>${helpers.escape(i.title)}</strong><small>${helpers.statusLabel(i.status)} · ${helpers.escape(i.location)}</small></span><button data-admin-idea="${i.id}">Gestionar</button></div>`).join("");
    }
  }

  function applyTheme(name) {
    const themes = {
      blue:{ theme:"blue", primary:"#0b4fb3", secondary:"#137ad1", accent:"#f4b41a", background:"#f5f7fb", text:"#14213d" },
      municipal:{ theme:"municipal", primary:"#0a2d6a", secondary:"#178049", accent:"#f0bd17", background:"#f5f7f5", text:"#172033" },
      purple:{ theme:"purple", primary:"#751558", secondary:"#4b0d3a", accent:"#d9ad4f", background:"#f8f3f7", text:"#2a1723" }
    };
    state.settings = { ...state.settings, ...themes[name] };
    helpers.save();
    applySettings();
    syncAdmin();
    helpers.toast("Tema aplicado.");
  }

  function openIdeaAdmin(id) {
    const idea = state.ideas.find(i => i.id === id);
    if (!idea) return;
    const holder = document.querySelector("#ideaAdminDialogContent");
    holder.innerHTML = `
      <span class="section-kicker">GESTIÓN INSTITUCIONAL</span>
      <h2>${helpers.escape(idea.title)}</h2>
      <form class="dialog-form" id="ideaAdminForm" data-idea-id="${idea.id}">
        <label>Estado<select name="status">
          <option value="recibida" ${idea.status==="recibida"?"selected":""}>Recibida</option>
          <option value="analisis" ${idea.status==="analisis"?"selected":""}>En análisis</option>
          <option value="aceptada" ${idea.status==="aceptada"?"selected":""}>Se tendrá en cuenta</option>
          <option value="resuelta" ${idea.status==="resuelta"?"selected":""}>Resuelta</option>
        </select></label>
        <label>Respuesta institucional<textarea name="response" rows="6" required>${helpers.escape(idea.response)}</textarea></label>
        <button class="button button-primary">Guardar respuesta</button>
      </form>`;
    openDialog("ideaAdminDialog");
  }

  function bindGlobalEvents() {
    document.addEventListener("click", event => {
      const close = event.target.closest("[data-close-dialog]");
      if (close) closeDialog(close.dataset.closeDialog);

      const adminTab = event.target.closest("[data-admin-tab]");
      if (adminTab) {
        const tab = adminTab.dataset.adminTab;
        document.querySelectorAll(".admin-tab-button").forEach(b => b.classList.toggle("active", b.dataset.adminTab === tab));
        document.querySelectorAll(".admin-tab").forEach(p => p.classList.toggle("active", p.dataset.adminPanel === tab));
        const titles = {appearance:"Apariencia", years:"Vigencias", resources:"Recursos", ideas:"Ideas ciudadanas", backup:"Respaldo"};
        document.querySelector("#adminTitle").textContent = titles[tab];
      }

      const theme = event.target.closest("[data-theme]");
      if (theme) applyTheme(theme.dataset.theme);

      const idea = event.target.closest("[data-admin-idea]");
      if (idea) openIdeaAdmin(idea.dataset.adminIdea);

      const deleteResource = event.target.closest("[data-delete-resource]");
      if (deleteResource) {
        state.resources = state.resources.filter(r => r.id !== deleteResource.dataset.deleteResource);
        helpers.save();
        syncAdmin();
        helpers.toast("Recurso eliminado.");
      }

      const access = event.target.closest("[data-access]");
      if (access) {
        const type = access.dataset.access;
        if (type === "increase") {
          state.settings.fontScale = Math.min(125, Number(state.settings.fontScale) + 5);
          helpers.save(); applySettings();
        }
        if (type === "decrease") {
          state.settings.fontScale = Math.max(80, Number(state.settings.fontScale) - 5);
          helpers.save(); applySettings();
        }
        if (type === "contrast") document.body.classList.toggle("high-contrast");
        if (type === "motion") document.body.classList.toggle("reduce-motion");
      }
    });

    document.querySelector("#accessibilityButton")?.addEventListener("click", event => {
      const popover = document.querySelector("#accessibilityPopover");
      const open = popover?.classList.toggle("open");
      popover?.setAttribute("aria-hidden", String(!open));
      event.currentTarget.setAttribute("aria-expanded", String(Boolean(open)));
    });

    document.querySelector("#mobileNavButton")?.addEventListener("click", event => {
      const nav = document.querySelector("#primaryNav");
      const open = nav?.classList.toggle("open");
      event.currentTarget.setAttribute("aria-expanded", String(Boolean(open)));
    });

    document.querySelector(".nav-dropdown > button")?.addEventListener("click", event => {
      event.preventDefault();
      const dropdown = event.currentTarget.closest(".nav-dropdown");
      const open = dropdown?.classList.toggle("open");
      event.currentTarget.setAttribute("aria-expanded", String(Boolean(open)));
    });

    document.querySelector("#headerSearch")?.addEventListener("click", () => {
      openDialog("searchDialog");
      const input = document.querySelector("#globalSearchInput");
      input.value = "";
      searchPortal("");
      setTimeout(() => input.focus(), 80);
    });

    document.querySelector("#globalSearchInput")?.addEventListener("input", event => searchPortal(event.target.value));

    document.querySelector("#adminEntry")?.addEventListener("click", () => {
      state.admin ? (syncAdmin(), openDialog("adminPanel")) : openDialog("loginDialog");
    });

    document.querySelector("#adminLoginForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const form = new FormData(event.target);
      if (form.get("username") === "admin" && form.get("password") === "SanPedro2026*") {
        state.admin = true;
        sessionStorage.setItem(KEYS.admin, "1");
        event.target.reset();
        closeDialog("loginDialog");
        syncAdmin();
        openDialog("adminPanel");
        helpers.toast("Sesión iniciada.");
      } else {
        helpers.toast("Credenciales incorrectas.");
      }
    });

    document.querySelector("#adminSignout")?.addEventListener("click", () => {
      state.admin = false;
      sessionStorage.removeItem(KEYS.admin);
      closeDialog("adminPanel");
      helpers.toast("Sesión cerrada.");
    });

    document.querySelector("#applyAdminColors")?.addEventListener("click", () => {
      state.settings.primary = document.querySelector("#adminPrimary").value;
      state.settings.secondary = document.querySelector("#adminSecondary").value;
      state.settings.accent = document.querySelector("#adminAccent").value;
      state.settings.background = document.querySelector("#adminBackground").value;
      state.settings.text = document.querySelector("#adminText").value;
      helpers.save(); applySettings(); helpers.toast("Colores actualizados.");
    });

    document.querySelector("#adminFontScale")?.addEventListener("input", event => {
      state.settings.fontScale = Number(event.target.value);
      document.querySelector("#adminFontOutput").value = `${event.target.value}%`;
      helpers.save(); applySettings();
    });

    document.querySelector("#adminRadius")?.addEventListener("input", event => {
      state.settings.radius = Number(event.target.value);
      document.querySelector("#adminRadiusOutput").value = `${event.target.value}px`;
      helpers.save(); applySettings();
    });

    document.querySelector("#createYearForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const form = new FormData(event.target);
      const year = Number(form.get("year"));
      if (helpers.getYear(year)) {
        helpers.toast("La vigencia ya existe.");
        return;
      }
      state.years.push({
        year,
        status: form.get("status"),
        progress: Number(form.get("progress")),
        summary: form.get("summary"),
        headline: "Nueva edición de Rendición de Cuentas.",
        documents:0, videos:0, commitments:0, questions:0,
        metrics:{plan:Number(form.get("progress")),projects:0,commitments:0,participation:0},
        sectors:[["Infraestructura",0],["Desarrollo social",0],["Gestión administrativa",0],["Participación ciudadana",0]]
      });
      helpers.save();
      syncAdmin();
      event.target.reset();
      helpers.toast(`Vigencia ${year} creada. Actualizando navegación...`);
      setTimeout(() => location.reload(), 700);
    });

    document.querySelector("#createResourceForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const form = new FormData(event.target);
      state.resources.unshift({
        id:`r${Date.now()}`,
        title:form.get("title"),
        year:Number(form.get("year")),
        type:form.get("type"),
        description:form.get("description"),
        meta:"Recurso agregado desde el panel",
        url:form.get("url") || "#",
        featured:false
      });
      helpers.save();
      syncAdmin();
      event.target.reset();
      helpers.toast("Recurso agregado. Actualizando contenido...");
      setTimeout(() => location.reload(), 700);
    });

    document.addEventListener("submit", event => {
      if (event.target.id !== "ideaAdminForm") return;
      event.preventDefault();
      const form = new FormData(event.target);
      const idea = state.ideas.find(i => i.id === event.target.dataset.ideaId);
      if (!idea) return;
      idea.status = form.get("status");
      idea.response = form.get("response");
      helpers.save();
      closeDialog("ideaAdminDialog");
      syncAdmin();
      helpers.toast("Respuesta actualizada.");
      window.dispatchEvent(new CustomEvent("portal:datachange"));
    });

    document.querySelector("#exportPortal")?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify({
        years:state.years, resources:state.resources, ideas:state.ideas, settings:state.settings,
        exportedAt:new Date().toISOString()
      }, null, 2)], { type:"application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "respaldo-rendicion-san-pedro-v4.json";
      link.click();
      URL.revokeObjectURL(url);
    });

    document.querySelector("#resetPortal")?.addEventListener("click", () => {
      if (!confirm("¿Restablecer la demostración local?")) return;
      Object.values(KEYS).forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      location.reload();
    });

    document.querySelectorAll("dialog").forEach(dialog => {
      dialog.addEventListener("click", event => {
        if (event.target === dialog) dialog.close();
      });
    });
  }


  function initReader() {
    const supported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    const panel = document.querySelector("#readerPanel");
    const toggle = document.querySelector("#readerToggle");
    const close = document.querySelector("#readerClose");
    const play = document.querySelector("#readerPlay");
    const pause = document.querySelector("#readerPause");
    const stop = document.querySelector("#readerStop");
    const scope = document.querySelector("#readerScope");
    const voiceSelect = document.querySelector("#readerVoice");
    const rate = document.querySelector("#readerRate");
    const status = document.querySelector("#readerStatus");

    if (!panel || !toggle) return;

    let chunks = [];
    let chunkIndex = 0;
    let currentUtterance = null;
    let paused = false;

    function setStatus(message) {
      if (status) status.textContent = message;
    }

    function populateScopes() {
      const previous = scope.value;
      scope.innerHTML = '<option value="page">Página completa</option>';
      const main = document.querySelector("main");
      if (!main) return;

      [...main.querySelectorAll("section")].forEach((section, index) => {
        const heading = section.querySelector("h1, h2");
        if (!heading) return;
        if (!section.id) section.id = `seccion-narracion-${index + 1}`;
        const option = document.createElement("option");
        option.value = section.id;
        option.textContent = heading.textContent.trim();
        scope.appendChild(option);
      });

      if ([...scope.options].some(option => option.value === previous)) scope.value = previous;
    }

    function readableText(target) {
      const selectors = "h1,h2,h3,h4,p,li,summary,figcaption,blockquote,article strong";
      const parts = [...target.querySelectorAll(selectors)]
        .filter(element => {
          if (element.closest("nav,footer,form,dialog,.no-narrate,.reader-panel,.accessibility-popover")) return false;
          const style = getComputedStyle(element);
          return style.display !== "none" && style.visibility !== "hidden";
        })
        .map(element => element.textContent.replace(/\s+/g, " ").trim())
        .filter((text, index, all) => text && all.indexOf(text) === index);
      return parts.join(". ");
    }

    function splitText(text) {
      const sentences = text
        .replace(/\s+/g, " ")
        .split(/(?<=[.!?])\s+/)
        .map(item => item.trim())
        .filter(Boolean);

      const result = [];
      let buffer = "";
      sentences.forEach(sentence => {
        if ((buffer + " " + sentence).trim().length <= 230) {
          buffer = `${buffer} ${sentence}`.trim();
        } else {
          if (buffer) result.push(buffer);
          if (sentence.length <= 230) {
            buffer = sentence;
          } else {
            const words = sentence.split(" ");
            let longBuffer = "";
            words.forEach(word => {
              if ((longBuffer + " " + word).trim().length > 220) {
                result.push(longBuffer);
                longBuffer = word;
              } else {
                longBuffer = `${longBuffer} ${word}`.trim();
              }
            });
            buffer = longBuffer;
          }
        }
      });
      if (buffer) result.push(buffer);
      return result;
    }

    const LATIN_SPANISH_PRIORITY = [
      "es-CO", "es-MX", "es-US", "es-AR", "es-CL", "es-PE",
      "es-VE", "es-EC", "es-UY", "es-BO", "es-PY", "es-CR",
      "es-PA", "es-GT", "es-HN", "es-SV", "es-NI", "es-DO",
      "es-PR", "es-CU", "es-419"
    ];

    const REGION_NAMES = {
      "es-CO":"Colombia",
      "es-MX":"México",
      "es-US":"Estados Unidos · español latino",
      "es-AR":"Argentina",
      "es-CL":"Chile",
      "es-PE":"Perú",
      "es-VE":"Venezuela",
      "es-EC":"Ecuador",
      "es-UY":"Uruguay",
      "es-BO":"Bolivia",
      "es-PY":"Paraguay",
      "es-CR":"Costa Rica",
      "es-PA":"Panamá",
      "es-GT":"Guatemala",
      "es-HN":"Honduras",
      "es-SV":"El Salvador",
      "es-NI":"Nicaragua",
      "es-DO":"República Dominicana",
      "es-PR":"Puerto Rico",
      "es-CU":"Cuba",
      "es-419":"Latinoamérica",
      "es-ES":"España"
    };

    function normalizedLang(lang) {
      const raw = String(lang || "").replace("_", "-");
      const parts = raw.split("-");
      if (parts.length < 2) return raw.toLowerCase();
      return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
    }

    function priorityIndex(voice) {
      const normalized = normalizedLang(voice.lang);
      const index = LATIN_SPANISH_PRIORITY.indexOf(normalized);
      return index === -1 ? 999 : index;
    }

    function isLatinSpanishVoice(voice) {
      return LATIN_SPANISH_PRIORITY.includes(normalizedLang(voice.lang));
    }

    function availableSpanishVoices() {
      return speechSynthesis.getVoices()
        .filter(voice => /^es(?:-|$)/i.test(voice.lang || ""))
        .sort((a, b) => {
          const latinDifference = Number(!isLatinSpanishVoice(a)) - Number(!isLatinSpanishVoice(b));
          if (latinDifference) return latinDifference;
          const priorityDifference = priorityIndex(a) - priorityIndex(b);
          if (priorityDifference) return priorityDifference;
          return a.name.localeCompare(b.name, "es");
        });
    }

    function voiceOptionLabel(voice) {
      const lang = normalizedLang(voice.lang);
      const region = REGION_NAMES[lang] || lang || "Español";
      const quality = voice.localService ? "voz del dispositivo" : "voz del navegador";
      return `${region} — ${voice.name} · ${quality}`;
    }

    function populateVoices() {
      if (!voiceSelect || !supported) return;

      const previous = voiceSelect.value || localStorage.getItem("sp_reader_latin_voice") || "";
      const voices = availableSpanishVoices();
      const latinVoices = voices.filter(isLatinSpanishVoice);
      const otherSpanishVoices = voices.filter(voice => !isLatinSpanishVoice(voice));

      voiceSelect.innerHTML = "";

      if (!voices.length) {
        const automatic = document.createElement("option");
        automatic.value = "";
        automatic.textContent = "Español latino automático";
        voiceSelect.appendChild(automatic);
        setStatus("El navegador usará la mejor voz en español disponible.");
        return;
      }

      if (latinVoices.length) {
        const latinGroup = document.createElement("optgroup");
        latinGroup.label = "Español latinoamericano";
        latinVoices.forEach(voice => {
          const option = document.createElement("option");
          option.value = voice.voiceURI;
          option.textContent = voiceOptionLabel(voice);
          latinGroup.appendChild(option);
        });
        voiceSelect.appendChild(latinGroup);
      }

      if (otherSpanishVoices.length) {
        const alternativeGroup = document.createElement("optgroup");
        alternativeGroup.label = latinVoices.length ? "Otras voces en español" : "Voces en español disponibles";
        otherSpanishVoices.forEach(voice => {
          const option = document.createElement("option");
          option.value = voice.voiceURI;
          option.textContent = voiceOptionLabel(voice);
          alternativeGroup.appendChild(option);
        });
        voiceSelect.appendChild(alternativeGroup);
      }

      const availableValues = [...voiceSelect.options].map(option => option.value);
      if (previous && availableValues.includes(previous)) {
        voiceSelect.value = previous;
      } else {
        const colombian = latinVoices.find(voice => normalizedLang(voice.lang) === "es-CO");
        const preferred = colombian || latinVoices[0] || voices[0];
        if (preferred) voiceSelect.value = preferred.voiceURI;
      }

      const selected = selectedVoice();
      if (selected) {
        const lang = normalizedLang(selected.lang);
        const region = REGION_NAMES[lang] || lang;
        setStatus(
          isLatinSpanishVoice(selected)
            ? `Voz latinoamericana seleccionada: ${region}.`
            : `No se encontró una voz latinoamericana; se usará ${region} como alternativa.`
        );
      }
    }

    function selectedVoice() {
      const voices = availableSpanishVoices();
      const selectedUri = voiceSelect?.value;
      return voices.find(voice => voice.voiceURI === selectedUri)
        || voices.find(voice => normalizedLang(voice.lang) === "es-CO")
        || voices.find(isLatinSpanishVoice)
        || voices[0]
        || null;
    }

    function speakNext() {
      if (chunkIndex >= chunks.length) {
        setStatus("Narración finalizada.");
        currentUtterance = null;
        paused = false;
        return;
      }

      currentUtterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
      const voice = selectedVoice();
      currentUtterance.lang = voice ? normalizedLang(voice.lang) : "es-CO";
      currentUtterance.rate = Number(rate.value || 1);
      currentUtterance.pitch = 1;
      if (voice) currentUtterance.voice = voice;

      currentUtterance.onstart = () => {
        setStatus(`Leyendo fragmento ${chunkIndex + 1} de ${chunks.length}.`);
      };
      currentUtterance.onend = () => {
        chunkIndex += 1;
        speakNext();
      };
      currentUtterance.onerror = event => {
        if (event.error !== "interrupted" && event.error !== "canceled") {
          setStatus("No fue posible continuar la narración.");
        }
      };
      speechSynthesis.speak(currentUtterance);
    }

    function startReading() {
      if (!supported) {
        setStatus("Este navegador no admite narración de texto.");
        return;
      }

      speechSynthesis.cancel();
      paused = false;
      pause.innerHTML = '<span aria-hidden="true">⏸</span> Pausar';

      const target = scope.value === "page"
        ? document.querySelector("main")
        : document.getElementById(scope.value);

      if (!target) {
        setStatus("No se encontró el contenido seleccionado.");
        return;
      }

      const text = readableText(target);
      chunks = splitText(text);
      chunkIndex = 0;

      if (!chunks.length) {
        setStatus("No hay texto disponible para narrar.");
        return;
      }
      speakNext();
    }

    function togglePause() {
      if (!supported || !speechSynthesis.speaking) return;
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
        paused = false;
        pause.innerHTML = '<span aria-hidden="true">⏸</span> Pausar';
        setStatus("Narración reanudada.");
      } else {
        speechSynthesis.pause();
        paused = true;
        pause.innerHTML = '<span aria-hidden="true">▶</span> Continuar';
        setStatus("Narración pausada.");
      }
    }

    function stopReading() {
      if (supported) speechSynthesis.cancel();
      chunks = [];
      chunkIndex = 0;
      paused = false;
      pause.innerHTML = '<span aria-hidden="true">⏸</span> Pausar';
      setStatus("Narración detenida.");
    }

    function openPanel() {
      populateScopes();
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      scope.focus();
    }

    function closePanel() {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }

    toggle.addEventListener("click", () => panel.classList.contains("open") ? closePanel() : openPanel());
    close.addEventListener("click", closePanel);
    play.addEventListener("click", startReading);
    pause.addEventListener("click", togglePause);
    stop.addEventListener("click", stopReading);

    voiceSelect?.addEventListener("change", () => {
      localStorage.setItem("sp_reader_latin_voice", voiceSelect.value);
      const voice = selectedVoice();
      if (!voice) {
        setStatus("Se utilizará la voz automática en español latino.");
        return;
      }
      const lang = normalizedLang(voice.lang);
      const region = REGION_NAMES[lang] || lang;
      setStatus(
        isLatinSpanishVoice(voice)
          ? `Voz seleccionada: ${region}.`
          : `Voz alternativa seleccionada: ${region}.`
      );
    });

    if (supported) {
      populateVoices();
      speechSynthesis.addEventListener?.("voiceschanged", populateVoices);
      window.setTimeout(populateVoices, 250);
      window.setTimeout(populateVoices, 1000);
    }

    window.addEventListener("beforeunload", stopReading);

    if (!supported) {
      play.disabled = true;
      pause.disabled = true;
      stop.disabled = true;
      setStatus("La narración no está disponible en este navegador.");
    }
  }

  function initReveal() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    }, { threshold:0.08 });
    document.querySelectorAll(".reveal").forEach(item => observer.observe(item));
  }

  function init() {
    applySettings();
    renderHeader();
    renderFooter();
    renderGlobalDialogs();
    bindGlobalEvents();
    initReader();
    syncAdmin();
    initReveal();

    const progress = document.createElement("div");
    progress.className = "reading-progress";
    document.body.prepend(progress);
    window.addEventListener("scroll", () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
    });
  }

  window.Portal = { state, helpers, openDialog, closeDialog, syncAdmin, applySettings };
  document.addEventListener("DOMContentLoaded", init);
})();
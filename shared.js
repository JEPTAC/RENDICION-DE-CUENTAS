(() => {
  const KEYS = {
    years: "sp_v4_years",
    resources: "sp_v4_resources",
    ideas: "sp_v4_ideas",
    settings: "sp_v6_settings",
    content: "sp_v6_content",
    pageSettings: "sp_v6_page_settings",
    dashboards: "sp_v7_dashboards",
    commitments: "sp_v7_commitments",
    citizenRequests: "sp_v7_citizen_requests",
    admin: "sp_v6_admin"
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

  const DEFAULT_DASHBOARDS = {"2025":{"year":2025,"technical":{"eventName":"Audiencia Pública de Rendición de Cuentas","entity":"Alcaldía Municipal de San Pedro, Valle del Cauca","presides":"Diego Fernando Mendoza Tascón","territory":"Municipio de San Pedro, Valle del Cauca","elaborationDate":"Mayo de 2026","source":"Audiencia pública, intervenciones por dependencia y matriz ciudadana de solicitudes","documentStatus":"Entregable final"},"kpis":[{"id":"kpi-investment","label":"Inversión base analizada","value":13435321251,"format":"currency","display":"$13.435.321.251","description":"Suma de los rubros principales reportados.","icon":"$","color":"blue"},{"id":"kpi-ita","label":"Índice ITA","value":92,"format":"score","display":"92/100","description":"Transparencia y acceso a la información.","icon":"ITA","color":"teal"},{"id":"kpi-business","label":"Emprendimientos beneficiados","value":66,"format":"number","display":"66","description":"Beneficiados por San Pedro Impulsa 2025.","icon":"↗","color":"orange"},{"id":"kpi-victims","label":"Víctimas atendidas","value":3000,"format":"number","display":"3.000","description":"Personas impactadas mediante jornadas y ayudas.","icon":"♥","color":"pink"},{"id":"kpi-older","label":"Adultos mayores beneficiados","value":550,"format":"number","display":"550","description":"Beneficiarios de programas sociales.","icon":"+","color":"purple"},{"id":"kpi-health","label":"Salud pública","value":4293,"format":"number","display":"4.293","description":"Personas beneficiadas en actividades urbanas y rurales.","icon":"✚","color":"green"}],"investment":[{"id":"inv-planning","label":"Planeación e Infraestructura","value":7772469282,"scope":"Servicios públicos, saneamiento, alumbrado, vías, maquinaria y subsidios."},{"id":"inv-government","label":"Gobierno y Convivencia","value":1698864332,"scope":"Víctimas, tránsito, seguridad, sistema penitenciario, JAC, Comisaría y gestión del riesgo."},{"id":"inv-education","label":"Educación, Cultura y Deporte","value":1593000000,"scope":"Cultura, deporte, recreación, educación, PAE, transporte y escenarios."},{"id":"inv-welfare","label":"Bienestar Social","value":618577054,"scope":"Adultos mayores, género, LGBTIQ+, etnias, niñez, adolescencia y familia."},{"id":"inv-agriculture","label":"Agricultura y Medio Ambiente","value":588722397,"scope":"Campo, bienestar animal, mercados campesinos, huertas y recurso hídrico."},{"id":"inv-finance","label":"Hacienda","value":501938794,"scope":"Modernización financiera, saneamiento fiscal, recaudo y refinanciación."},{"id":"inv-health","label":"Salud pública - proyecto PIC","value":501246394,"scope":"Promoción, prevención, vigilancia epidemiológica y acciones urbanas y rurales."},{"id":"inv-general","label":"Secretaría General","value":160502998,"scope":"Turismo, emprendimiento, empleo, transparencia, canales digitales y PQR."}],"populationReach":[{"id":"reach-water","label":"Gestión del recurso hídrico","value":18128},{"id":"reach-insurance","label":"Aseguramiento en salud","value":8353},{"id":"reach-culture","label":"Cultura","value":8000},{"id":"reach-public-health","label":"Salud pública","value":4293},{"id":"reach-victims","label":"Víctimas del conflicto","value":3000},{"id":"reach-family","label":"Niñez y familia","value":2583},{"id":"reach-education","label":"Educación","value":2000},{"id":"reach-markets","label":"Mercados campesinos","value":590},{"id":"reach-older","label":"Adultos mayores","value":550},{"id":"reach-women","label":"Mujeres","value":300}],"execution":[{"id":"exe-transparency","label":"Secretaría General - transparencia","value":100},{"id":"exe-employment","label":"Secretaría General - empleo","value":100},{"id":"exe-tourism","label":"Secretaría General - turismo","value":100},{"id":"exe-family","label":"Bienestar - NNA y familia","value":100},{"id":"exe-gender","label":"Bienestar - género","value":100},{"id":"exe-lgbtiq","label":"Bienestar - LGBTIQ+","value":100},{"id":"exe-territorial","label":"Planeación - gestión territorial","value":100},{"id":"exe-finance-system","label":"Hacienda - sistema financiero","value":100},{"id":"exe-fiscal","label":"Hacienda - saneamiento fiscal","value":99.91},{"id":"exe-risk","label":"Gobierno - gestión del riesgo","value":99},{"id":"exe-jac","label":"Gobierno - JAC","value":99},{"id":"exe-older","label":"Bienestar - adultos mayores","value":97.5},{"id":"exe-transit","label":"Gobierno - tránsito","value":96},{"id":"exe-victims","label":"Gobierno - víctimas","value":96},{"id":"exe-education","label":"Educación","value":92},{"id":"exe-culture","label":"Cultura","value":82},{"id":"exe-prison","label":"Gobierno - sistema penitenciario","value":80},{"id":"exe-sports","label":"Deporte y recreación","value":38}],"methodology":[{"id":"method-1","title":"Apertura institucional","description":"Contextualización de la responsabilidad pública de informar la gestión."},{"id":"method-2","title":"Pregunta orientadora","description":"Balance general, retos territoriales y mensaje del alcalde."},{"id":"method-3","title":"Informes por dependencia","description":"Proyectos, inversión, ejecución, beneficiarios y resultados."},{"id":"method-4","title":"Intervenciones complementarias","description":"Fuentes de financiación, impactos, dificultades y prioridades."},{"id":"method-5","title":"Síntesis de resultados","description":"Logros, avances sectoriales y relación con el Plan de Desarrollo."},{"id":"method-6","title":"Compromisos y seguimiento","description":"Retos 2026 en vías, acueductos, emprendimiento, transparencia y control social."}],"focusAreas":["Transparencia y control social","Planeación y sostenibilidad financiera","Inversión social y enfoque diferencial","Infraestructura y servicios esenciales","Participación ciudadana y seguimiento institucional"],"institutionalResults":[{"id":"result-finance","department":"Hacienda","actions":"Modernización financiera, saneamiento fiscal, recaudo y refinanciación.","result":"Mayor recaudo, reducción de tasa y estabilidad fiscal.","value":"$501.938.794"},{"id":"result-planning","department":"Planeación e Infraestructura","actions":"Servicios públicos, saneamiento, vías, alumbrado, residuos y subsidios.","result":"Mejoramiento de condiciones urbanas y rurales.","value":"$7.772.469.282"},{"id":"result-welfare","department":"Bienestar Social","actions":"Adultos mayores, género, LGBTIQ+, etnias, NNA y familia.","result":"Inclusión y protección social.","value":"$618.577.054"},{"id":"result-education","department":"Educación, Cultura y Deporte","actions":"PAE, transporte, gratuidad, cultura, deporte y escenarios.","result":"Permanencia escolar, identidad cultural y recreación.","value":"Más de $1.500 millones"},{"id":"result-agriculture","department":"Agricultura y Ambiente","actions":"Campo, bienestar animal, mercados, huertas y recurso hídrico.","result":"Fortalecimiento rural y sostenibilidad ambiental.","value":"$588.722.397"},{"id":"result-government","department":"Gobierno y Convivencia","actions":"Víctimas, tránsito, sistema penitenciario, JAC, comisaría y riesgo.","result":"Seguridad, participación y atención a emergencias.","value":"$1.698.864.332"},{"id":"result-health","department":"Salud","actions":"PIC, discapacidad, población vulnerable, aseguramiento y EPS/IPS.","result":"Prevención, cobertura y atención territorial.","value":"$501.246.394 PIC"},{"id":"result-general","department":"Secretaría General","actions":"Turismo, emprendimiento, empleo, transparencia, web y PQR.","result":"San Pedro Impulsa, ITA 92/100 y modernización.","value":"$160.502.998"},{"id":"result-social","department":"Gestión Social","actions":"Campañas solidarias, donaciones y apoyo a pacientes y familias.","result":"Articulación comunitaria y privada.","value":"Sin cifra única reportada"}],"keyPoints":["La gestión financiera permitió mejorar la capacidad institucional de inversión mediante recaudo, fiscalización y refinanciación.","La infraestructura y los servicios públicos concentraron la mayor inversión reportada.","La política social se mantuvo como eje estratégico con enfoque diferencial.","Educación, cultura y deporte aportaron a permanencia escolar, identidad cultural y recreación.","El campo, el ambiente y la gestión del riesgo requieren continuidad.","La modernización institucional fortaleció la transparencia y el acceso a la información."]}};

  const DEFAULT_COMMITMENTS = [{"id":"commit-2025-01","year":2025,"title":"Intervención de vías rurales","responsible":"Planeación, Infraestructura, Agricultura y Alcaldía","scope":"Mantenimiento y adecuación de vías afectadas por ola invernal para facilitar movilidad y comercialización campesina.","priority":"Alta","status":"pendiente","progress":0,"dueDate":"","evidenceUrl":"","updatedAt":""},{"id":"commit-2025-02","year":2025,"title":"Continuidad San Pedro Impulsa","responsible":"Secretaría General y aliados institucionales","scope":"Fortalecer capacitación, entrega de insumos y acompañamiento a emprendimientos locales.","priority":"Alta","status":"pendiente","progress":0,"dueDate":"","evidenceUrl":"","updatedAt":""},{"id":"commit-2025-03","year":2025,"title":"Proyecto de doble calzada","responsible":"Alcaldía, Planeación e instancias competentes","scope":"Avanzar en mesas de trabajo, cumplimiento de sentencia y obras con inversión estimada cercana a $8.000 millones.","priority":"Estratégica","status":"pendiente","progress":0,"dueDate":"","evidenceUrl":"","updatedAt":""},{"id":"commit-2025-04","year":2025,"title":"Acueducto en San José","responsible":"Alcaldía y Planeación","scope":"Gestionar proyecto de infraestructura con cifra estimada cercana a $8.000 millones.","priority":"Estratégica","status":"pendiente","progress":0,"dueDate":"","evidenceUrl":"","updatedAt":""},{"id":"commit-2025-05","year":2025,"title":"Vías hacia Todos Santos","responsible":"Alcaldía y Gobernación del Valle del Cauca","scope":"Continuar gestión y articulación para mejorar corredores viales departamentales.","priority":"Alta","status":"pendiente","progress":0,"dueDate":"","evidenceUrl":"","updatedAt":""},{"id":"commit-2025-06","year":2025,"title":"Veeduría y control social","responsible":"Alcaldía, Concejo, Personería y comunidad","scope":"Promover acompañamiento ciudadano e institucional a proyectos y obras públicas.","priority":"Transversal","status":"pendiente","progress":0,"dueDate":"","evidenceUrl":"","updatedAt":""},{"id":"commit-2025-07","year":2025,"title":"Canales digitales y PQR","responsible":"Secretaría General y dependencias competentes","scope":"Mantener ventanilla única, página web, transparencia activa y atención oportuna al ciudadano.","priority":"Transversal","status":"pendiente","progress":0,"dueDate":"","evidenceUrl":"","updatedAt":""}];

  const DEFAULT_CITIZEN_REQUESTS = [{"id":"request-2025-01","year":2025,"radicados":"RC-2026-20260529-YGQT; RC-2026-20260529-1UFX; RC-2026-20260529-1LEK; RC-2026-20260529-16UI; RC-2026-20260529-15IG","applicant":"Feder Usuario","topic":"Educación, cultura y deporte","status":"Pendiente de respuesta específica","support":"No se identificó respuesta específica en el informe consolidado.","request":"Información sobre el recaudo y la inversión realizada en la maratón de perros.","response":""},{"id":"request-2025-02","year":2025,"radicados":"RC-2026-20260529-W3I0","applicant":"Luz Marina Palacio","topic":"Gobierno","status":"Pendiente de respuesta específica","support":"No se identificó respuesta específica en el informe consolidado.","request":"Inquietud sobre las medidas previstas para mejorar el control de ruido en el municipio.","response":""},{"id":"request-2025-03","year":2025,"radicados":"RC-2026-20260529-VQQL; RC-2026-20260529-TMR4; RC-2026-20260529-KCA1; RC-2026-20260529-K1N4; RC-2026-20260529-F1DR; RC-2026-20260529-EFIC; RC-2026-20260529-AQDI; RC-2026-20260529-7S2W; RC-2026-20260529-1UP2; RC-2026-20260529-1TX4; RC-2026-20260529-1BYX; RC-2026-20260529-134D","applicant":"Yeison Andrés Trochez Holguín","topic":"Educación, cultura y deporte","status":"Respondida en vivo durante la Rendición de Cuentas","support":"Video de la Rendición de Cuentas. Referencia interna: sección 5.5.","request":"Reconocimiento ciudadano por el apoyo brindado a las manifestaciones culturales durante 2025, especialmente al sector danza.","response":"La Administración Municipal agradece el reconocimiento ciudadano y deja constancia de que durante 2025 se fortalecieron los procesos de formación artística en música, danza, pintura, teatro y artes plásticas, con alcance comunitario y aporte a la identidad cultural del municipio."},{"id":"request-2025-04","year":2025,"radicados":"RC-2026-20260529-V0UZ","applicant":"Luz Robledo","topic":"Salud","status":"Respuesta general con base en el informe","support":"Referencia interna: sección 5.8, Secretaría de Salud Municipal.","request":"Consulta sobre los planes de gestión de la Secretaría de Salud para mejorar la prestación y el enfoque territorial hacia 2027.","response":"La gestión en salud se orienta a promoción, prevención, vigilancia epidemiológica, discapacidad, población vulnerable, atención al ciudadano y aseguramiento. Como línea de continuidad, se planteó acercar la salud al territorio y fortalecer la articulación con el Hospital Local y la Gobernación."},{"id":"request-2025-05","year":2025,"radicados":"RC-2026-20260529-L1EO","applicant":"Mónica Perdomo","topic":"Alcaldía municipal","status":"Respuesta general con base en el informe","support":"Referencia interna: secciones 7 y 7.1.","request":"Felicitación por la continuidad de experiencias y proyectos exitosos durante el periodo de gobierno.","response":"La Administración Municipal recibe el reconocimiento y reitera su compromiso de dar continuidad a acciones con impacto territorial, incluyendo vías rurales, San Pedro Impulsa, acueductos, doble calzada, canales digitales, PQR y control social."},{"id":"request-2025-06","year":2025,"radicados":"RC-2026-20260529-91X1; RC-2026-20260529-1VHU","applicant":"Luz Marina Palacio","topic":"Educación, cultura y deporte","status":"Respuesta general con base en el informe","support":"Referencia interna: sección 5.5, Oficina de Educación, Cultura y Deporte.","request":"Observación sobre la necesidad de fortalecer el deporte municipal y revisar la proporción de inversión frente al componente cultural.","response":"La observación queda vinculada al seguimiento presupuestal y a la necesidad de fortalecer la oferta deportiva municipal."},{"id":"request-2025-07","year":2025,"radicados":"RC-2026-20260529-1YVJ","applicant":"Rubén Darío Victoria Álvarez","topic":"Educación, cultura y deporte","status":"Pendiente de respuesta específica","support":"El informe menciona mantenimiento general de escenarios deportivos, pero no identifica una respuesta específica para el barrio El Porvenir.","request":"Inquietud por el encerramiento de la cancha múltiple, el mantenimiento de juegos infantiles y máquinas del parque biosaludable del barrio El Porvenir.","response":""},{"id":"request-2025-08","year":2025,"radicados":"RC-2026-20260529-1YAI","applicant":"Eugenia Stella Jaramillo","topic":"Salud","status":"Pendiente de respuesta específica","support":"El informe menciona seguimiento institucional a EPS e IPS, pero no identifica una respuesta específica sobre urgencias del Hospital Local.","request":"Inquietud por quejas ciudadanas sobre la atención en urgencias del Hospital Local.","response":""}];

  const DEFAULT_SETTINGS = {
    theme:"blue",
    primary:"#0b4fb3",
    secondary:"#137ad1",
    accent:"#f4b41a",
    background:"#f5f7fb",
    text:"#14213d",
    fontScale:106,
    radius:18,
    headerHeight:76,
    crestSize:46,
    brandSize:132,
    showTourismLogo:true,
    headerCrest:"",
    headerBrand:"",
    animationMode:"smooth",
    contentWidth:1200
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
    content: loadObject(KEYS.content, {}),
    pageSettings: loadObject(KEYS.pageSettings, {}),
    dashboards: loadObject(KEYS.dashboards, DEFAULT_DASHBOARDS),
    commitments: loadArray(KEYS.commitments, DEFAULT_COMMITMENTS),
    citizenRequests: loadArray(KEYS.citizenRequests, DEFAULT_CITIZEN_REQUESTS),
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
    formatCurrency(value) {
      return new Intl.NumberFormat("es-CO", {style:"currency",currency:"COP",maximumFractionDigits:0}).format(Number(value || 0));
    },
    formatNumber(value) {
      return new Intl.NumberFormat("es-CO", {maximumFractionDigits:2}).format(Number(value || 0));
    },
    save(options = {}) {
      localStorage.setItem(KEYS.years, JSON.stringify(state.years));
      localStorage.setItem(KEYS.resources, JSON.stringify(state.resources));
      localStorage.setItem(KEYS.ideas, JSON.stringify(state.ideas));
      localStorage.setItem(KEYS.settings, JSON.stringify(state.settings));
      localStorage.setItem(KEYS.content, JSON.stringify(state.content));
      localStorage.setItem(KEYS.pageSettings, JSON.stringify(state.pageSettings));
      localStorage.setItem(KEYS.dashboards, JSON.stringify(state.dashboards));
      localStorage.setItem(KEYS.commitments, JSON.stringify(state.commitments));
      localStorage.setItem(KEYS.citizenRequests, JSON.stringify(state.citizenRequests));
      if (!options.localOnly) window.FirebasePortal?.queueSync?.();
    },
    pageKey() {
      const filename = location.pathname.split("/").pop() || "index.html";
      if (filename === "rendicion.html") {
        const year = new URLSearchParams(location.search).get("year") || "general";
        return `rendicion-${year}`;
      }
      return filename.replace(/\.html$/i, "") || "inicio";
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
    root.style.setProperty("--site-width", `${Number(s.contentWidth || 1200)}px`);
    root.style.setProperty("--main-header-height", `${Number(s.headerHeight || 76)}px`);
    root.style.setProperty("--header-base-height", `${31 + Number(s.headerHeight || 76)}px`);
    root.style.setProperty("--crest-size", `${Number(s.crestSize || 46)}px`);
    root.style.setProperty("--brand-logo-size", `${Number(s.brandSize || 132)}px`);
    document.body.dataset.animationMode = s.animationMode || "smooth";
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
          <a class="header-brand${state.settings.showTourismLogo === false ? " no-tourism-logo" : ""}" href="index.html" aria-label="Ir a la portada de Rendición de Cuentas de San Pedro">
            <img class="header-crest" src="${helpers.escape(state.settings.headerCrest || "assets/escudo-san-pedro.png")}" alt="Escudo oficial del municipio de San Pedro, Valle del Cauca">
            <span class="header-brand__copy">
              <strong>San Pedro</strong>
              <small>Rendición de Cuentas</small>
            </span>
            <span class="header-brand__divider${state.settings.showTourismLogo === false ? " is-hidden" : ""}" aria-hidden="true"></span>
            <img class="header-tourism-logo${state.settings.showTourismLogo === false ? " is-hidden" : ""}" src="${helpers.escape(state.settings.headerBrand || "assets/imagen-san-pedro-color.png")}" alt="Marca San Pedro, donde nacen los sueños">
          </a>

          <button class="mobile-nav-button" id="mobileNavButton" type="button" aria-label="Abrir menú principal" aria-expanded="false" aria-controls="primaryNav">☰</button>

          <nav class="primary-nav" id="primaryNav" aria-label="Navegación principal">
            <a class="${active("home")}" href="index.html">Inicio</a>
            <div class="nav-dropdown">
              <button class="${active("year")}" type="button" aria-haspopup="true" aria-expanded="false">Vigencias <span class="nav-status-dot" aria-hidden="true"></span></button>
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

            <button class="header-search" id="headerSearch" type="button" aria-label="Abrir búsqueda general">
              <span aria-hidden="true">⌕</span>
            </button>

            <button class="admin-entry" id="adminEntry" type="button">
              Ingresar
            </button>

            <div class="admin-session"
              id="adminSession"
              ${state.admin ? "" : "hidden"}>

              <button type="button"
                class="admin-session__identity"
                id="adminSessionIdentity"
                aria-label="Abrir información de la cuenta">
                <span class="admin-session__avatar" id="adminSessionAvatar">A</span>
                <span class="admin-session__copy">
                  <strong id="adminSessionName">Administrador</strong>
                  <small id="adminSessionRole">Sesión administrativa</small>
                </span>
              </button>

              <button type="button"
                class="admin-session__button"
                id="adminConsoleEntry">
                Administrador
              </button>
            </div>
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

      <dialog class="dialog auth-dialog" id="loginDialog">
        <button class="dialog-close" data-close-dialog="loginDialog" aria-label="Cerrar">×</button>
        <span class="section-kicker">CUENTA CIUDADANA</span>
        <h2>Ingresar al portal</h2>
        <p class="dialog-note">La ciudadanía puede crear una cuenta gratuita. Las cuentas nuevas se registran automáticamente con el rol de invitado.</p>

        <div class="auth-view-tabs" role="tablist" aria-label="Acceso al portal">
          <button type="button" class="active" data-auth-view="login" role="tab" aria-selected="true">Iniciar sesión</button>
          <button type="button" data-auth-view="register" role="tab" aria-selected="false">Crear cuenta</button>
        </div>

        <section class="auth-view-panel active" data-auth-panel="login">
          <form class="dialog-form firebase-login-form" id="adminLoginForm">
            <label>Correo electrónico
              <input name="identity" type="email" autocomplete="email" placeholder="correo@ejemplo.com" required>
            </label>
            <label>Contraseña
              <input name="password" type="password" autocomplete="current-password" required>
            </label>
            <button class="button button-primary">Ingresar</button>
            <button class="button button-secondary" type="button" id="googleAdminLogin">Continuar con Google</button>
            <button class="auth-text-button" type="button" id="forgotPasswordButton">Olvidé mi contraseña</button>
            <small id="firebaseLoginStatus" class="auth-status" aria-live="polite">Conectando con Firebase…</small>
            <details class="local-login-help">
              <summary>Acceso local de emergencia</summary>
              <p>Solo para mantenimiento temporal. No sincroniza información entre dispositivos.</p>
            </details>
          </form>
        </section>

        <section class="auth-view-panel" data-auth-panel="register" hidden>
          <form class="dialog-form registration-form" id="publicRegistrationForm">
            <label>Nombre completo
              <input name="displayName" autocomplete="name" minlength="3" maxlength="120" required>
            </label>
            <label>Correo electrónico
              <input name="email" type="email" autocomplete="email" required>
            </label>
            <div class="auth-two-columns">
              <label>Contraseña
                <input name="password" type="password" autocomplete="new-password" minlength="8" required>
              </label>
              <label>Confirmar contraseña
                <input name="passwordConfirm" type="password" autocomplete="new-password" minlength="8" required>
              </label>
            </div>
            <label>Barrio, corregimiento o sector
              <input name="neighborhood" maxlength="120" placeholder="Opcional">
            </label>
            <label class="auth-consent">
              <input name="accept" type="checkbox" required>
              <span>Acepto el tratamiento de mis datos para gestionar mi cuenta y participación en el portal.</span>
            </label>
            <button class="button button-primary">Crear cuenta de invitado</button>
            <button class="button button-secondary" type="button" id="googleRegistration">Registrarme con Google</button>
            <small class="auth-status" id="registrationStatus" aria-live="polite">Recibirá un correo para verificar su dirección.</small>
          </form>
        </section>
      </dialog>

      <dialog class="dialog account-dialog" id="accountDialog">
        <button class="dialog-close" data-close-dialog="accountDialog" aria-label="Cerrar">×</button>
        <div class="account-header">
          <span class="account-avatar" id="accountAvatar">U</span>
          <div>
            <span class="section-kicker">MI CUENTA</span>
            <h2 id="accountDisplayName">Usuario</h2>
            <p id="accountEmail">correo@ejemplo.com</p>
          </div>
        </div>

        <div class="account-status-grid">
          <div><small>Rol</small><strong id="accountRole">Invitado</strong></div>
          <div><small>Correo</small><strong id="accountVerification">Pendiente</strong></div>
          <div><small>Perfil</small><strong id="accountProfileSource">Firebase</strong></div>
        </div>

        <form class="dialog-form account-profile-form" id="accountProfileForm">
          <label>Nombre visible<input name="displayName" maxlength="120"></label>
          <label>Teléfono<input name="phone" maxlength="40" placeholder="Opcional"></label>
          <label>Barrio, corregimiento o sector<input name="neighborhood" maxlength="120" placeholder="Opcional"></label>
          <button class="button button-primary">Guardar perfil</button>
        </form>

        <div class="account-actions">
          <button class="button button-secondary" type="button" id="resendVerificationButton">Reenviar verificación</button>
          <button class="button button-secondary" type="button" id="accountManageUsers" hidden>Gestionar usuarios</button>
          <button class="button button-danger" type="button" id="accountSignout">Cerrar sesión</button>
        </div>

        <p class="account-diagnostic" id="firebaseAccountDiagnostic" aria-live="polite"></p>
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
    state.commitments
      .filter(item => `${item.title} ${item.responsible} ${item.scope} ${item.priority}`.toLowerCase().includes(q))
      .forEach(item => results.push({ title:item.title, meta:`Compromiso ${item.year} · ${item.priority}`, href:`rendicion-${item.year}.html#seguimiento` }));
    state.citizenRequests
      .filter(item => `${item.request} ${item.applicant} ${item.topic} ${item.status}`.toLowerCase().includes(q))
      .forEach(item => results.push({ title:item.request, meta:`Solicitud ${item.year} · ${item.status}`, href:`rendicion-${item.year}.html#solicitudes` }));

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

  function updateAdminHeader(detail = {}) {
    const session = document.querySelector("#adminSession");
    const entry = document.querySelector("#adminEntry");
    const avatar = document.querySelector("#adminSessionAvatar");
    const name = document.querySelector("#adminSessionName");
    const role = document.querySelector("#adminSessionRole");

    const canWrite = Boolean(detail.canWrite)
      || sessionStorage.getItem("sp_admin_mode") === "local";

    if (!canWrite) {
      if (session) session.hidden = true;
      if (entry) entry.hidden = false;
      return;
    }

    const displayName =
      detail.profile?.displayName
      || detail.user?.displayName
      || detail.user?.email
      || (sessionStorage.getItem("sp_admin_mode") === "local"
        ? "Administrador local"
        : "Administrador");

    const roleName =
      detail.roleLabel
      || roleLabel(detail.role)
      || (sessionStorage.getItem("sp_admin_mode") === "local"
        ? "Acceso local"
        : "Administrador");

    if (session) session.hidden = false;
    if (entry) entry.hidden = true;
    if (avatar) avatar.textContent =
      String(displayName).trim().charAt(0).toUpperCase() || "A";
    if (name) name.textContent = displayName;
    if (role) role.textContent = roleName;
  }

  function roleLabel(role) {
    return window.FirebasePortal?.roleLabel?.(role) || {
      super_admin:"Superadministrador",
      admin:"Administrador",
      editor:"Editor",
      guest:"Invitado"
    }[role] || "Invitado";
  }

  function setAuthView(view) {
    document.querySelectorAll("[data-auth-view]").forEach(button => {
      const active = button.dataset.authView === view;
      button.classList.toggle("active",active);
      button.setAttribute("aria-selected",String(active));
    });
    document.querySelectorAll("[data-auth-panel]").forEach(panel => {
      const active = panel.dataset.authPanel === view;
      panel.classList.toggle("active",active);
      panel.hidden = !active;
    });
  }

  function updateAccountDialog(detail = {}) {
    const user = detail.user;
    const profile = detail.profile || {};
    if (!user) return;

    const displayName =
      profile.displayName
      || user.displayName
      || "Usuario del portal";
    const email = user.email || profile.email || "";
    const role = detail.role || profile.role || "guest";

    const avatar = document.querySelector("#accountAvatar");
    const name = document.querySelector("#accountDisplayName");
    const emailNode = document.querySelector("#accountEmail");
    const roleNode = document.querySelector("#accountRole");
    const verification = document.querySelector("#accountVerification");
    const source = document.querySelector("#accountProfileSource");
    const diagnostic = document.querySelector("#firebaseAccountDiagnostic");
    const profileForm = document.querySelector("#accountProfileForm");
    const resend = document.querySelector("#resendVerificationButton");
    const manage = document.querySelector("#accountManageUsers");

    if (avatar) avatar.textContent = displayName.trim().charAt(0).toUpperCase() || "U";
    if (name) name.textContent = displayName;
    if (emailNode) emailNode.textContent = email;
    if (roleNode) {
      roleNode.textContent = roleLabel(role);
      roleNode.dataset.role = role;
    }
    if (verification) {
      verification.textContent = detail.emailVerified ? "Verificado" : "Pendiente";
      verification.classList.toggle("is-verified",Boolean(detail.emailVerified));
    }
    if (source) {
      source.textContent = {
        uid:"UID",
        email_legacy:"Perfil por correo",
        migrated_to_uid:"Migrado a UID",
        created_guest:"Creado automáticamente"
      }[detail.profileSource] || "Firebase";
    }
    if (profileForm) {
      profileForm.elements.displayName.value = displayName;
      profileForm.elements.phone.value = profile.phone || "";
      profileForm.elements.neighborhood.value = profile.neighborhood || "";
    }
    if (resend) resend.hidden = Boolean(detail.emailVerified);
    if (manage) manage.hidden = !Boolean(detail.isSuperAdmin);
    if (diagnostic) {
      diagnostic.textContent = detail.profileError
        ? `No se pudo validar el perfil: ${detail.profileError}`
        : detail.isSuperAdmin
          ? "Cuenta reconocida correctamente como superadministrador."
          : "Su cuenta puede participar como invitado. El superadministrador puede modificar el rol desde Gestión de usuarios.";
      diagnostic.classList.toggle("is-error",Boolean(detail.profileError));
    }
  }

  async function performFirebaseSignout() {
    await window.FirebasePortal?.signOut?.().catch(() => {});
    state.admin = false;
    sessionStorage.removeItem(KEYS.admin);
    sessionStorage.removeItem("sp_admin_mode");
    closeDialog("adminPanel");
    closeDialog("accountDialog");
    window.InlineAdmin?.deactivate?.(false);

    updateAdminHeader({canWrite:false});
    const button = document.querySelector("#adminEntry");
    if (button) {
      button.hidden = false;
      button.textContent = "Ingresar";
      button.classList.remove("is-active");
    }
    helpers.toast("Sesión cerrada.");
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
      const firebaseStatus = window.FirebasePortal?.getStatus?.();

      if (firebaseStatus?.user) {
        updateAccountDialog({
          ...firebaseStatus,
          roleLabel:roleLabel(firebaseStatus.role)
        });
        openDialog("accountDialog");
        return;
      }

      setAuthView("login");
      openDialog("loginDialog");
    });

    document.querySelector("#adminConsoleEntry")?.addEventListener("click", () => {
      window.InlineAdmin?.openConsole?.("editing");
    });

    document.querySelector("#adminSessionIdentity")?.addEventListener("click", () => {
      const firebaseStatus = window.FirebasePortal?.getStatus?.();
      if (firebaseStatus?.user) {
        updateAccountDialog({
          ...firebaseStatus,
          roleLabel:roleLabel(firebaseStatus.role)
        });
        openDialog("accountDialog");
      } else {
        window.InlineAdmin?.openConsole?.("editing");
      }
    });

    document.querySelectorAll("[data-auth-view]").forEach(button => {
      button.addEventListener("click", () => setAuthView(button.dataset.authView));
    });

    document.querySelector("#adminLoginForm")?.addEventListener("submit", async event => {
      event.preventDefault();
      const form = new FormData(event.target);
      const identity = String(form.get("identity") || "").trim();
      const password = String(form.get("password") || "");
      const status = document.querySelector("#firebaseLoginStatus");

      if (identity === "admin" && password === "SanPedro2026*") {
        state.admin = true;
        sessionStorage.setItem(KEYS.admin,"1");
        sessionStorage.setItem("sp_admin_mode","local");
        event.target.reset();
        closeDialog("loginDialog");

        updateAdminHeader({
          canWrite:true,
          roleLabel:"Acceso local",
          profile:{displayName:"Administrador local"}
        });
        window.InlineAdmin?.openConsole?.("editing");
        helpers.toast("Sesión administrativa local iniciada. Active la edición desde el panel cuando la necesite.");
        return;
      }

      try {
        if (status) status.textContent = "Validando cuenta…";
        const result = await window.FirebasePortal?.signInEmail?.(identity,password);
        if (!result) throw new Error("Firebase todavía no está disponible.");
        event.target.reset();
        closeDialog("loginDialog");
      } catch (error) {
        const message =
          window.FirebasePortal?.friendlyError?.(error)
          || error.message
          || "No fue posible iniciar sesión.";
        if (status) status.textContent = message;
        helpers.toast(message);
      }
    });

    document.querySelector("#publicRegistrationForm")?.addEventListener("submit", async event => {
      event.preventDefault();
      const form = new FormData(event.target);
      const password = String(form.get("password") || "");
      const confirmation = String(form.get("passwordConfirm") || "");
      const status = document.querySelector("#registrationStatus");

      if (password !== confirmation) {
        const message = "Las contraseñas no coinciden.";
        if (status) status.textContent = message;
        helpers.toast(message);
        return;
      }

      try {
        if (status) status.textContent = "Creando cuenta…";
        await window.FirebasePortal?.registerEmail?.({
          displayName:form.get("displayName"),
          email:form.get("email"),
          password,
          neighborhood:form.get("neighborhood")
        });
        event.target.reset();
        closeDialog("loginDialog");
        const firebaseStatus = window.FirebasePortal?.getStatus?.();
        updateAccountDialog(firebaseStatus || {});
        openDialog("accountDialog");
        helpers.toast("Cuenta creada como invitado. Revise su correo para verificarla.");
      } catch (error) {
        const message =
          window.FirebasePortal?.friendlyError?.(error)
          || error.message
          || "No fue posible crear la cuenta.";
        if (status) status.textContent = message;
        helpers.toast(message);
      }
    });

    async function googleAccess() {
      try {
        await window.FirebasePortal?.signInGoogle?.();
        closeDialog("loginDialog");
      } catch (error) {
        helpers.toast(
          window.FirebasePortal?.friendlyError?.(error)
          || error.message
          || "No fue posible continuar con Google."
        );
      }
    }

    document.querySelector("#googleAdminLogin")?.addEventListener("click",googleAccess);
    document.querySelector("#googleRegistration")?.addEventListener("click",googleAccess);

    document.querySelector("#forgotPasswordButton")?.addEventListener("click", async () => {
      const email =
        document.querySelector("#adminLoginForm")?.elements.identity?.value
        || prompt("Correo de la cuenta:");
      if (!email) return;

      try {
        await window.FirebasePortal?.sendPasswordReset?.(email);
        helpers.toast("Se envió el enlace para restablecer la contraseña.");
      } catch (error) {
        helpers.toast(window.FirebasePortal?.friendlyError?.(error) || error.message);
      }
    });

    document.querySelector("#accountProfileForm")?.addEventListener("submit", async event => {
      event.preventDefault();
      const data = new FormData(event.target);
      try {
        await window.FirebasePortal?.updateOwnProfile?.({
          displayName:data.get("displayName"),
          phone:data.get("phone"),
          neighborhood:data.get("neighborhood")
        });
        helpers.toast("Perfil actualizado.");
      } catch (error) {
        helpers.toast(window.FirebasePortal?.friendlyError?.(error) || error.message);
      }
    });

    document.querySelector("#resendVerificationButton")?.addEventListener("click", async () => {
      try {
        await window.FirebasePortal?.resendVerification?.();
        helpers.toast("Correo de verificación enviado.");
      } catch (error) {
        helpers.toast(window.FirebasePortal?.friendlyError?.(error) || error.message);
      }
    });

    document.querySelector("#accountManageUsers")?.addEventListener("click", () => {
      closeDialog("accountDialog");
      window.InlineAdmin?.activate?.();
      window.InlineAdmin?.openUsers?.();
    });

    document.querySelector("#accountSignout")?.addEventListener("click",performFirebaseSignout);

    document.querySelector("#adminSignout")?.addEventListener("click",performFirebaseSignout);

    if (state.admin && sessionStorage.getItem("sp_admin_mode") === "local") {
      updateAdminHeader({
        canWrite:true,
        roleLabel:"Acceso local",
        profile:{displayName:"Administrador local"}
      });
    }

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
        years:state.years,
        resources:state.resources,
        ideas:state.ideas,
        settings:state.settings,
        content:state.content,
        pageSettings:state.pageSettings,
        dashboards:state.dashboards,
        commitments:state.commitments,
        citizenRequests:state.citizenRequests,
        exportedAt:new Date().toISOString()
      }, null, 2)], { type:"application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "respaldo-rendicion-san-pedro-v6.json";
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


  function loadDriveService() {
    if (document.querySelector('script[data-drive-portal]')) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const configScript = document.createElement("script");
      configScript.src = "drive-config.js?v=9.3-drive-visible";
      configScript.dataset.driveConfig = "true";

      configScript.onload = () => {
        const serviceScript = document.createElement("script");
        serviceScript.src = "drive-service.js?v=9.3-drive-visible";
        serviceScript.dataset.drivePortal = "true";
        serviceScript.onload = () => {
          window.DrivePortal?.init?.().finally(resolve);
        };
        serviceScript.onerror = () => {
          helpers.toast("No fue posible cargar Google Drive.");
          reject(new Error("No fue posible cargar drive-service.js."));
        };
        document.head.appendChild(serviceScript);
      };

      configScript.onerror = () => {
        helpers.toast("No fue posible cargar la configuración de Google Drive.");
        reject(new Error("No fue posible cargar drive-config.js."));
      };
      document.head.appendChild(configScript);
    });
  }

  function loadFirebaseService() {
    if (document.querySelector('script[data-firebase-portal]')) return;
    const script = document.createElement("script");
    script.src = "firebase-service.js?v=9.9-admin-console";
    script.dataset.firebasePortal = "true";
    script.onload = () => window.FirebasePortal?.init?.();
    script.onerror = () => helpers.toast("No fue posible cargar la conexión con Firebase.");
    document.head.appendChild(script);
  }

  function loadInlineAdministration() {
    if (document.querySelector('script[data-inline-admin]')) return;

    const script = document.createElement("script");
    script.src = "inline-admin.js?v=9.9-admin-console";
    script.dataset.inlineAdmin = "true";
    script.onload = () => {
      window.InlineAdmin?.init();
      if (state.admin) window.InlineAdmin?.activate();
    };
    script.onerror = () => helpers.toast("No fue posible cargar el editor directo.");
    document.head.appendChild(script);
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

  function bindFirebaseEvents() {
    window.addEventListener("firebase:ready", event => {
      const status = document.querySelector("#firebaseLoginStatus");
      if (!status) return;
      status.textContent = event.detail?.connected
        ? "Firebase conectado."
        : event.detail?.error || "Firebase disponible sin conexión de red.";
    });

    window.addEventListener("firebase:auth", event => {
      const detail = event.detail || {};
      const localMode =
        sessionStorage.getItem("sp_admin_mode") === "local";

      if (!detail.user && localMode) return;

      updateAccountDialog(detail);

      const button = document.querySelector("#adminEntry");

      if (detail.user && detail.canWrite) {
        state.admin = true;
        sessionStorage.setItem(KEYS.admin,"1");
        sessionStorage.setItem("sp_admin_mode","firebase");

        updateAdminHeader(detail);
        window.InlineAdmin?.deactivate?.(false);

        if (detail.reason !== "initial") {
          helpers.toast(
            `Sesión iniciada · ${detail.roleLabel || roleLabel(detail.role)}.`
          );
        }
      } else if (detail.user) {
        state.admin = false;
        sessionStorage.removeItem(KEYS.admin);
        sessionStorage.removeItem("sp_admin_mode");
        window.InlineAdmin?.deactivate?.(false);

        updateAdminHeader({canWrite:false});
        if (button) {
          button.hidden = false;
          button.textContent = "Mi cuenta";
          button.classList.remove("is-active");
        }

        if (detail.profileError) {
          helpers.toast(
            "La cuenta inició sesión, pero Firestore no permitió leer el rol. Publique las reglas V9."
          );
        } else if (detail.reason === "registration") {
          helpers.toast("Cuenta creada con rol de invitado.");
        }
      } else {
        state.admin = false;
        sessionStorage.removeItem(KEYS.admin);
        sessionStorage.removeItem("sp_admin_mode");

        updateAdminHeader({canWrite:false});
        if (button) {
          button.hidden = false;
          button.textContent = "Ingresar";
          button.classList.remove("is-active");
        }
      }
    });

    window.addEventListener("firebase:data", () => {
      window.dispatchEvent(new CustomEvent("portal:datachange"));
    });

    window.addEventListener("portal:adminlogout", () => {
      updateAdminHeader({canWrite:false});
      const button = document.querySelector("#adminEntry");
      if (button) {
        button.hidden = false;
        button.textContent = "Ingresar";
      }
    });
  }

  function initReveal() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    }, { threshold:0.08 });
    document.querySelectorAll(".reveal").forEach(item => observer.observe(item));
  }

  function refreshStylesheetVersion() {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute("href") || "";
      if (!/(^|\/)styles\.css(?:\?|$)/.test(href)) return;
      const base = href.split("?")[0];
      const versioned = `${base}?v=9.9-admin-console`;
      if (href !== versioned) link.setAttribute("href",versioned);
    });
  }

  function init() {
    refreshStylesheetVersion();
    applySettings();
    renderHeader();
    renderFooter();
    renderGlobalDialogs();
    bindGlobalEvents();
    bindFirebaseEvents();
    initReader();
    loadFirebaseService();
    loadDriveService().finally(loadInlineAdministration);
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

  window.Portal = { state, helpers, openDialog, closeDialog, syncAdmin, applySettings, KEYS };
  document.addEventListener("DOMContentLoaded", init);
})();
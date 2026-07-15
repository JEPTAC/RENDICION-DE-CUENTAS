document.addEventListener("DOMContentLoaded", () => {
  const { state, helpers, openDialog } = window.Portal;
  const bodyYear = document.body.dataset.year;
  const queryYear = new URLSearchParams(location.search).get("year");
  const yearNumber = Number(bodyYear || queryYear || 2025);
  const year = helpers.getYear(yearNumber);

  if (!year) {
    document.querySelector("#main-content").innerHTML = `
      <section class="missing-page"><span class="section-kicker">VIGENCIA NO DISPONIBLE</span><h1>No encontramos la edición solicitada.</h1><a class="button button-primary" href="vigencias.html">Volver al archivo histórico</a></section>`;
    return;
  }

  document.title = `Rendición de Cuentas ${year.year} | San Pedro`;

  const pageHero = document.querySelector(".page-hero");
  const yearThemes = {
    2025: "celebration",
    2026: "mobility",
    2027: "sports"
  };
  const selectedTheme = yearThemes[year.year] || ["celebration", "mobility", "sports"][Math.abs(year.year) % 3];

  const heroScenes = {
    celebration: `
      <div class="page-hero__scene page-hero__scene--gif page-hero__scene--celebration" aria-hidden="true">
        <div class="hero-gif-canvas">
          <span class="hero-gif-glow hero-gif-glow--a"></span>
          <span class="hero-gif-glow hero-gif-glow--b"></span>
          <span class="hero-gif-panel hero-gif-panel--main"></span>
          <span class="hero-gif-panel hero-gif-panel--mini"></span>
          <img class="hero-gif hero-gif--chiva" src="hero-gifs/chiva.gif" alt="" loading="eager" decoding="async">
          <img class="hero-gif hero-gif--bus-mini" src="hero-gifs/bus.gif" alt="" loading="eager" decoding="async">
          <img class="hero-gif hero-gif--notes-a" src="hero-gifs/notes.gif" alt="" loading="eager" decoding="async">
          <img class="hero-gif hero-gif--notes-b" src="hero-gifs/notes.gif" alt="" loading="eager" decoding="async">
          <img class="hero-gif hero-gif--sparkle-a" src="hero-gifs/sparkle.gif" alt="" loading="eager" decoding="async">
          <img class="hero-gif hero-gif--sparkle-b" src="hero-gifs/sparkle.gif" alt="" loading="eager" decoding="async">
          <img class="hero-gif hero-gif--stream-a" src="hero-gifs/streamer.gif" alt="" loading="eager" decoding="async">
        </div>
      </div>`,
    mobility: `
      <div class="page-hero__scene page-hero__scene--gif page-hero__scene--mobility" aria-hidden="true">
        <div class="hero-gif-canvas">
          <span class="hero-gif-glow hero-gif-glow--a"></span>
          <span class="hero-gif-glow hero-gif-glow--c"></span>
          <span class="hero-gif-panel hero-gif-panel--route"></span>
          <span class="hero-gif-line hero-gif-line--a"></span>
          <span class="hero-gif-line hero-gif-line--b"></span>
          <img class="hero-gif hero-gif--bus-main" src="hero-gifs/bus.gif" alt="" loading="eager" decoding="async">
          <img class="hero-gif hero-gif--chiva-small" src="hero-gifs/chiva.gif" alt="" loading="eager" decoding="async">
          <img class="hero-gif hero-gif--sparkle-route" src="hero-gifs/sparkle.gif" alt="" loading="eager" decoding="async">
          <img class="hero-gif hero-gif--stream-route" src="hero-gifs/streamer.gif" alt="" loading="eager" decoding="async">
          <img class="hero-gif hero-gif--notes-route" src="hero-gifs/notes.gif" alt="" loading="eager" decoding="async">
        </div>
      </div>`,
    sports: `
      <div class="page-hero__scene page-hero__scene--gif page-hero__scene--sports" aria-hidden="true">
        <div class="hero-gif-canvas">
          <span class="hero-gif-glow hero-gif-glow--a"></span>
          <span class="hero-gif-glow hero-gif-glow--d"></span>
          <span class="hero-gif-panel hero-gif-panel--arena"></span>
          <span class="hero-gif-orbit hero-gif-orbit--a"></span>
          <span class="hero-gif-orbit hero-gif-orbit--b"></span>
          <img class="hero-gif hero-gif--football" src="hero-gifs/football.gif" alt="" loading="eager" decoding="async">
          <img class="hero-gif hero-gif--basketball" src="hero-gifs/basketball.gif" alt="" loading="eager" decoding="async">
          <img class="hero-gif hero-gif--sparkle-sport" src="hero-gifs/sparkle.gif" alt="" loading="eager" decoding="async">
          <img class="hero-gif hero-gif--stream-sport" src="hero-gifs/streamer.gif" alt="" loading="eager" decoding="async">
          <img class="hero-gif hero-gif--notes-sport" src="hero-gifs/notes.gif" alt="" loading="eager" decoding="async">
        </div>
      </div>`
  };

  if (pageHero) {
    pageHero.classList.remove("page-hero--celebration", "page-hero--mobility", "page-hero--sports");
    pageHero.classList.add(`page-hero--${selectedTheme}`);
    pageHero.dataset.heroTheme = selectedTheme;
    if (!pageHero.querySelector('.page-hero__scene')) {
      pageHero.insertAdjacentHTML('afterbegin', heroScenes[selectedTheme]);
    }
  }
  const yearMain = document.querySelector("#main-content");
  if (yearMain) {
    yearMain.dataset.adminEntity = "year";
    yearMain.dataset.entityId = String(year.year);
  }
  document.querySelectorAll("[data-year-text]").forEach(el => el.textContent = year.year);
  document.querySelector("#yearStatus").textContent = year.status;
  document.querySelector("#yearHeadline").textContent = year.headline;
  document.querySelector("#yearSummary").textContent = year.summary;
  document.querySelector("#yearProgress").textContent = `${year.progress}%`;
  document.querySelector("#yearDocuments").textContent = state.resources.filter(r => Number(r.year) === year.year).length;
  document.querySelector("#yearVideos").textContent = state.resources.filter(r => Number(r.year) === year.year && r.type === "video").length;
  document.querySelector("#yearCommitments").textContent = year.commitments;
  document.querySelector("#yearQuestions").textContent = year.questions;

  const picker = document.querySelector("#yearPagePicker");
  picker.innerHTML = [...state.years].sort((a,b)=>a.year-b.year).map(y => `<option value="${y.year}" ${y.year===year.year?"selected":""}>${y.year}</option>`).join("");
  picker.addEventListener("change", event => location.href = helpers.yearUrl(Number(event.target.value)));

  const reportDashboard = state.dashboards?.[String(year.year)] || state.dashboards?.[year.year];
  const metrics = reportDashboard?.kpis?.slice(0,4).map(item => [item.label,item.display || helpers.formatNumber(item.value),item.description]) || [
    ["Cumplimiento del plan", `${year.metrics.plan}%`, "Avance consolidado de las metas estratégicas."],
    ["Proyectos ejecutados", year.metrics.projects, "Iniciativas terminadas o en operación."],
    ["Compromisos atendidos", `${year.metrics.commitments}%`, "Solicitudes con gestión documentada."],
    ["Espacios participativos", year.metrics.participation, "Mesas, audiencias y encuentros ciudadanos."]
  ];
  document.querySelector("#yearMetrics").innerHTML = metrics.map((m,index) => `
    <article class="year-metric reveal visible"><span>0${index+1}</span><strong>${m[1]}</strong><h3>${m[0]}</h3><p>${m[2]}</p></article>`).join("");

  document.querySelector("#sectorBars").innerHTML = year.sectors.map(item => `
    <div><span><b>${helpers.escape(item[0])}</b><strong>${item[1]}%</strong></span><i><u style="width:${item[1]}%"></u></i></div>`).join("");

  const resources = state.resources.filter(r => Number(r.year) === year.year);
  const featured = resources.slice(0,6);
  document.querySelector("#yearResources").innerHTML = featured.length ? featured.map(item => `
    <article class="year-resource-card reveal visible" data-resource-id="${item.id}" data-admin-entity="resource" data-entity-id="${item.id}">
      <span class="${item.image ? "has-resource-image" : ""}" ${item.image ? `style="background-image:url('${item.image}')"` : ""}>${item.image ? "" : helpers.typeIcon(item.type)}</span>
      <div><small>${helpers.typeLabel(item.type)}</small><strong>${helpers.escape(item.title)}</strong><p>${helpers.escape(item.meta)}</p></div>
      <button class="year-resource-open" type="button" aria-label="Ver recurso">↗</button>
    </article>`).join("") : `
    <div class="empty-year"><strong>La documentación todavía no está publicada.</strong><p>La estructura está preparada para incorporar los recursos cuando estén disponibles.</p></div>`;

  const stories = [
    ["Informe central", "Qué se hizo, cuánto se ejecutó y cuáles fueron los resultados principales."],
    ["La gestión en historias", "Una explicación más cercana del impacto de los proyectos y decisiones."],
    ["Preguntas de la ciudadanía", "Respuestas oficiales y aclaraciones relacionadas con la vigencia."]
  ];
  document.querySelector("#yearStories").innerHTML = stories.map((story,index) => `
    <article class="news-story reveal visible">
      <div class="news-story__number">0${index+1}</div>
      <small>EDICIÓN ${year.year}</small>
      <h3>${story[0]}</h3>
      <p>${story[1]}</p>
      <button data-story-index="${index}">Leer historia →</button>
    </article>`).join("");

  document.addEventListener("click", event => {
    const resourceButton = event.target.closest("[data-resource-id]");
    if (resourceButton) {
      const resource = state.resources.find(r => r.id === resourceButton.dataset.resourceId);
      if (!resource) return;
      document.querySelector("#resourcePreviewContent").innerHTML = `
        <div class="resource-preview">
          <div class="resource-preview__icon">${helpers.typeIcon(resource.type)}</div>
          <div><span class="section-kicker">${resource.year} · ${helpers.typeLabel(resource.type).toUpperCase()}</span><h2>${helpers.escape(resource.title)}</h2><p>${helpers.escape(resource.description)}</p><div class="resource-preview__meta">${helpers.escape(resource.meta)}</div><a class="button button-primary" href="${helpers.safeUrl(resource.url)}">Abrir recurso</a></div>
        </div>`;
      openDialog("resourcePreviewDialog");
    }

    const storyButton = event.target.closest("[data-story-index]");
    if (storyButton) {
      const story = stories[Number(storyButton.dataset.storyIndex)];
      document.querySelector("#storyDialogContent").innerHTML = `<span class="section-kicker">HISTORIA DE LA GESTIÓN</span><h2>${story[0]}</h2><p>${story[1]}</p><p>Este módulo puede ampliarse con fotografías, testimonios, cifras destacadas y documentos relacionados de la vigencia ${year.year}.</p>`;
      openDialog("storyDialog");
    }
  });

  const dashboardScript = document.createElement("script");
  dashboardScript.src = "dashboard.js?v=10.7-professional-repair";
  dashboardScript.onload = () => window.RendicionDashboard?.init?.(year.year);
  dashboardScript.onerror = () => helpers.toast("No fue posible cargar el tablero de indicadores.");
  document.head.appendChild(dashboardScript);

  window.addEventListener("firebase:data", () => window.RendicionDashboard?.refresh?.(year.year));
  window.dispatchEvent(new CustomEvent("portal:rendered"));

  document.querySelector("#yearNewsletter").addEventListener("submit", event => {
    event.preventDefault();
    event.target.reset();
    helpers.toast("Suscripción registrada en la demostración.");
  });
});
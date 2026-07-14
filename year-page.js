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

  const metrics = [
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
    <button class="year-resource-card reveal visible" data-resource-id="${item.id}">
      <span>${helpers.typeIcon(item.type)}</span>
      <div><small>${helpers.typeLabel(item.type)}</small><strong>${helpers.escape(item.title)}</strong><p>${helpers.escape(item.meta)}</p></div>
      <b>↗</b>
    </button>`).join("") : `
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

  document.querySelector("#yearNewsletter").addEventListener("submit", event => {
    event.preventDefault();
    event.target.reset();
    helpers.toast("Suscripción registrada en la demostración.");
  });
});
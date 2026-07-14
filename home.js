document.addEventListener("DOMContentLoaded", () => {
  const { state, helpers } = window.Portal;
  const years = [...state.years].sort((a,b) => Number(a.year)-Number(b.year));

  const selector = document.querySelector("#homeYear");
  selector.innerHTML = years.map(y => `<option value="${y.year}">${y.year}</option>`).join("");

  document.querySelector("#homeExploreForm").addEventListener("submit", event => {
    event.preventDefault();
    const year = Number(selector.value);
    location.href = helpers.yearUrl(year);
  });

  const grid = document.querySelector("#featuredYears");
  grid.innerHTML = years.slice(0,4).map((year,index) => `
    <article class="edition-card reveal visible ${index === 0 ? "edition-card--featured" : ""}">
      <div class="edition-card__visual edition-visual-${index%3}">
        <span class="edition-discount">${year.progress}%</span>
        <div class="edition-landscape"><i></i><b></b><u></u></div>
        <small>${helpers.escape(year.status)}</small>
      </div>
      <div class="edition-card__body">
        <div class="edition-card__meta"><span>EDICIÓN ${year.year}</span><b>★ ${year.status === "Publicada" ? "5.0" : "En preparación"}</b></div>
        <h3>Rendición de Cuentas ${year.year}</h3>
        <p>${helpers.escape(year.summary)}</p>
        <div class="edition-card__footer"><span>${year.documents} recursos</span><a href="${helpers.yearUrl(year.year)}">Explorar →</a></div>
      </div>
    </article>`).join("");

  const featureYear = helpers.getYear(2025) || years[0];
  document.querySelector("#homeHeroProgress").textContent = `${featureYear.progress}%`;
  document.querySelector("#homeResourceCount").textContent = state.resources.length;
  document.querySelector("#homeIdeasCount").textContent = state.ideas.length;

  const editorialResources = state.resources.filter(r => r.featured).slice(0,3);
  document.querySelector("#editorialCards").innerHTML = editorialResources.map((item,index) => `
    <article class="deal-card reveal visible">
      <div class="deal-card__visual deal-${index}"><span>${helpers.typeIcon(item.type)}</span></div>
      <div><small>${item.year} · ${helpers.typeLabel(item.type)}</small><h3>${helpers.escape(item.title)}</h3><p>${helpers.escape(item.meta)}</p><a href="recursos.html?q=${encodeURIComponent(item.title)}">Ver detalles →</a></div>
    </article>`).join("");

  const ideas = state.ideas.slice(0,3);
  document.querySelector("#citizenQuotes").innerHTML = ideas.map(idea => `
    <article class="quote-card reveal visible">
      <div class="quote-symbol">“</div>
      <p>${helpers.escape(idea.description)}</p>
      <div class="quote-author"><span>${helpers.escape(idea.author).charAt(0)}</span><div><strong>${helpers.escape(idea.author)}</strong><small>${helpers.escape(idea.location)} · ♥ ${idea.votes}</small></div></div>
    </article>`).join("");

  document.querySelector("#newsletterForm").addEventListener("submit", event => {
    event.preventDefault();
    event.target.reset();
    helpers.toast("Suscripción registrada en la demostración.");
  });
});
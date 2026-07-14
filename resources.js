document.addEventListener("DOMContentLoaded", () => {
  const { state, helpers, openDialog } = window.Portal;
  const query = new URLSearchParams(location.search).get("q") || "";
  const search = document.querySelector("#resourcePageSearch");
  const yearFilter = document.querySelector("#resourcePageYear");
  const typeFilter = document.querySelector("#resourcePageType");
  search.value = query;

  yearFilter.innerHTML = `<option value="all">Todas las vigencias</option>${[...state.years].sort((a,b)=>a.year-b.year).map(y => `<option>${y.year}</option>`).join("")}`;

  function render() {
    const q = search.value.toLowerCase().trim();
    const year = yearFilter.value;
    const type = typeFilter.value;
    const list = state.resources.filter(item => {
      const text = `${item.title} ${item.description} ${item.meta} ${item.year} ${item.type}`.toLowerCase();
      return (!q || text.includes(q)) && (year === "all" || Number(year) === Number(item.year)) && (type === "all" || type === item.type);
    });
    document.querySelector("#resourceResultsCount").textContent = list.length;
    document.querySelector("#resourcePageGrid").innerHTML = list.length ? list.map(item => `
      <article class="resource-library-card reveal visible">
        <div class="resource-library-card__cover"><span>${helpers.typeIcon(item.type)}</span><small>${item.year}</small></div>
        <div class="resource-library-card__body"><small>${helpers.typeLabel(item.type)}</small><h3>${helpers.escape(item.title)}</h3><p>${helpers.escape(item.description)}</p><div><span>${helpers.escape(item.meta)}</span><button data-resource-open="${item.id}">Ver recurso →</button></div></div>
      </article>`).join("") : `<div class="empty-library"><strong>No encontramos recursos.</strong><p>Cambie los filtros o utilice otra palabra clave.</p></div>`;
  }

  [search, yearFilter, typeFilter].forEach(el => el.addEventListener("input", render));
  render();

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-resource-open]");
    if (!button) return;
    const item = state.resources.find(r => r.id === button.dataset.resourceOpen);
    document.querySelector("#libraryDialogContent").innerHTML = `
      <div class="resource-preview">
        <div class="resource-preview__icon">${helpers.typeIcon(item.type)}</div>
        <div><span class="section-kicker">${item.year} · ${helpers.typeLabel(item.type).toUpperCase()}</span><h2>${helpers.escape(item.title)}</h2><p>${helpers.escape(item.description)}</p><div class="resource-preview__meta">${helpers.escape(item.meta)}</div><a class="button button-primary" href="${helpers.safeUrl(item.url)}">Abrir recurso</a></div>
      </div>`;
    openDialog("libraryDialog");
  });
});
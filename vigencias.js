document.addEventListener("DOMContentLoaded", () => {
  const { state, helpers } = window.Portal;
  const years = [...state.years].sort((a,b)=>a.year-b.year);
  document.querySelector("#archiveCount").textContent = years.length;
  document.querySelector("#archiveGrid").innerHTML = years.map((year,index) => `
    <article class="archive-card reveal visible">
      <div class="archive-card__visual archive-${index%3}"><span>${year.progress}%</span><div class="mini-scene"><i></i><b></b><u></u></div></div>
      <div class="archive-card__body"><div><small>${helpers.escape(year.status)}</small><strong>${year.year}</strong></div><h2>Rendición de Cuentas ${year.year}</h2><p>${helpers.escape(year.summary)}</p><ul><li>${year.documents} documentos</li><li>${year.videos} videos</li><li>${year.commitments} compromisos</li></ul><a class="button button-primary" href="${helpers.yearUrl(year.year)}">Abrir edición</a></div>
    </article>`).join("");
});
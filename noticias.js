(() => {
  const ui = {
    query:"",
    category:"all",
    year:"all",
    page:1,
    perPage:6
  };

  const escape = value => window.Portal.helpers.escape(value);

  function normalizedNews() {
    return (window.Portal.state.news || [])
      .map(item => ({
        ...item,
        tags:Array.isArray(item.tags) ? item.tags : [],
        active:item.active !== false,
        hidden:Boolean(item.hidden)
      }))
      .filter(item => item.active && !item.hidden)
      .sort((a,b) => {
        const featured = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
        if (featured) return featured;
        return new Date(b.publishedAt || b.createdAt || 0)
          - new Date(a.publishedAt || a.createdAt || 0);
      });
  }

  function formatDate(value) {
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value || "Sin fecha";
    return date.toLocaleDateString("es-CO",{
      day:"numeric",
      month:"long",
      year:"numeric"
    });
  }

  function visual(item,className = "") {
    const image = item.image
      ? `style="background-image:linear-gradient(180deg,rgba(5,31,70,.04),rgba(5,31,70,.34)),url('${escape(item.image)}')"`
      : "";
    return `
      <div class="news-visual ${className} ${item.image ? "has-image" : ""}" ${image}>
        ${item.image
          ? ""
          : `<span aria-hidden="true">${escape((item.category || "N").slice(0,1).toUpperCase())}</span>`}
      </div>`;
  }

  function renderFeatured(items) {
    const holder = document.querySelector("#newsFeatured");
    if (!holder) return;

    const item = items.find(news => news.featured) || items[0];
    if (!item) {
      holder.innerHTML = `
        <div class="news-empty-state">
          <strong>No hay una noticia destacada.</strong>
          <p>El administrador puede publicar la primera noticia directamente desde esta sección.</p>
        </div>`;
      return;
    }

    holder.innerHTML = `
      <article class="news-feature-card"
        data-admin-entity="news"
        data-entity-id="${escape(item.id)}">
        <a class="news-feature-card__media"
          href="${window.Portal.helpers.newsUrl(item.id)}"
          aria-label="Leer ${escape(item.title)}">
          ${visual(item,"news-visual--feature")}
        </a>
        <div class="news-feature-card__content">
          <div class="news-meta-row">
            <span>${escape(item.category || "Gestión municipal")}</span>
            <time datetime="${escape(item.publishedAt)}">${escape(formatDate(item.publishedAt))}</time>
          </div>
          <h3><a href="${window.Portal.helpers.newsUrl(item.id)}">${escape(item.title)}</a></h3>
          <p>${escape(item.excerpt)}</p>
          <div class="news-feature-card__footer">
            <span>${escape(item.source || item.author || "Alcaldía Municipal")}</span>
            <a class="news-read-link" href="${window.Portal.helpers.newsUrl(item.id)}">Leer noticia <b aria-hidden="true">→</b></a>
          </div>
        </div>
      </article>`;
  }

  function filteredItems(items) {
    const query = ui.query.trim().toLowerCase();

    return items.filter(item => {
      const text = [
        item.title,
        item.excerpt,
        item.body,
        item.category,
        item.source,
        ...(item.tags || [])
      ].join(" ").toLowerCase();

      const matchesQuery = !query || text.includes(query);
      const matchesCategory =
        ui.category === "all" || item.category === ui.category;
      const matchesYear =
        ui.year === "all"
        || String(item.publishedAt || "").startsWith(String(ui.year));

      return matchesQuery && matchesCategory && matchesYear;
    });
  }

  function card(item) {
    return `
      <li>
        <article class="news-card"
          data-admin-entity="news"
          data-entity-id="${escape(item.id)}">
          <a href="${window.Portal.helpers.newsUrl(item.id)}"
            class="news-card__media"
            aria-label="Leer ${escape(item.title)}">
            ${visual(item)}
            ${item.featured ? '<span class="news-featured-badge">Destacada</span>' : ""}
          </a>
          <div class="news-card__body">
            <div class="news-meta-row">
              <span>${escape(item.category || "Gestión municipal")}</span>
              <time datetime="${escape(item.publishedAt)}">${escape(formatDate(item.publishedAt))}</time>
            </div>
            <h3><a href="${window.Portal.helpers.newsUrl(item.id)}">${escape(item.title)}</a></h3>
            <p>${escape(item.excerpt)}</p>
            <footer>
              <span>${escape(item.source || item.author || "Alcaldía Municipal")}</span>
              <a class="news-read-link" href="${window.Portal.helpers.newsUrl(item.id)}">Conozca más <b aria-hidden="true">→</b></a>
            </footer>
          </div>
        </article>
      </li>`;
  }

  function pagination(totalPages) {
    const holder = document.querySelector("#newsPagination");
    if (!holder) return;

    if (totalPages <= 1) {
      holder.innerHTML = "";
      return;
    }

    const pages = [];
    const start = Math.max(1,Math.min(ui.page - 2,totalPages - 4));
    const end = Math.min(totalPages,start + 4);

    pages.push(`
      <button type="button" data-page="${Math.max(1,ui.page - 1)}"
        ${ui.page === 1 ? "disabled" : ""}>Anterior</button>`);

    if (start > 1) {
      pages.push(`<button type="button" data-page="1">1</button>`);
      if (start > 2) pages.push(`<span>…</span>`);
    }

    for (let page = start; page <= end; page += 1) {
      pages.push(`
        <button type="button"
          data-page="${page}"
          ${page === ui.page ? 'class="active" aria-current="page"' : ""}>
          ${page}
        </button>`);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push(`<span>…</span>`);
      pages.push(`<button type="button" data-page="${totalPages}">${totalPages}</button>`);
    }

    pages.push(`
      <button type="button" data-page="${Math.min(totalPages,ui.page + 1)}"
        ${ui.page === totalPages ? "disabled" : ""}>Siguiente</button>`);

    holder.innerHTML = pages.join("");
  }

  function renderFilters(items) {
    const category = document.querySelector("#newsCategory");
    const year = document.querySelector("#newsYear");

    const categories = [...new Set(items.map(item => item.category).filter(Boolean))]
      .sort((a,b) => a.localeCompare(b,"es"));
    const years = [...new Set(
      items.map(item => String(item.publishedAt || "").slice(0,4)).filter(Boolean)
    )].sort((a,b) => Number(b) - Number(a));

    category.innerHTML =
      '<option value="all">Todas las categorías</option>'
      + categories.map(value => `<option value="${escape(value)}">${escape(value)}</option>`).join("");
    year.innerHTML =
      '<option value="all">Todos los años</option>'
      + years.map(value => `<option value="${escape(value)}">${escape(value)}</option>`).join("");

    category.value = ui.category;
    year.value = ui.year;
  }

  function render() {
    const items = normalizedNews();
    renderFeatured(items);
    renderFilters(items);

    const filtered = filteredItems(items);
    const totalPages = Math.max(1,Math.ceil(filtered.length / ui.perPage));
    if (ui.page > totalPages) ui.page = totalPages;

    const start = (ui.page - 1) * ui.perPage;
    const visible = filtered.slice(start,start + ui.perPage);

    document.querySelector("#newsTotalCount").textContent = String(items.length);
    document.querySelector("#newsResultSummary").innerHTML =
      `<strong>${filtered.length}</strong> ${filtered.length === 1 ? "noticia encontrada" : "noticias encontradas"}.`;

    const grid = document.querySelector("#newsGrid");
    grid.innerHTML = visible.length
      ? visible.map(card).join("")
      : `<li class="news-empty-state">
          <strong>No encontramos noticias con estos filtros.</strong>
          <p>Pruebe otra categoría, año o palabra clave.</p>
        </li>`;

    pagination(totalPages);
    window.dispatchEvent(new CustomEvent("portal:rendered"));
  }

  function bind() {
    document.querySelector("#newsSearch")?.addEventListener("input",event => {
      ui.query = event.target.value;
      ui.page = 1;
      render();
    });

    document.querySelector("#newsCategory")?.addEventListener("change",event => {
      ui.category = event.target.value;
      ui.page = 1;
      render();
    });

    document.querySelector("#newsYear")?.addEventListener("change",event => {
      ui.year = event.target.value;
      ui.page = 1;
      render();
    });

    document.querySelector("#newsClearFilters")?.addEventListener("click",() => {
      ui.query = "";
      ui.category = "all";
      ui.year = "all";
      ui.page = 1;
      document.querySelector("#newsSearch").value = "";
      render();
    });

    document.querySelector("#newsPagination")?.addEventListener("click",event => {
      const button = event.target.closest("[data-page]");
      if (!button || button.disabled) return;
      ui.page = Number(button.dataset.page);
      render();
      document.querySelector("#ultimas-noticias")?.scrollIntoView({
        behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block:"start"
      });
    });

    document.querySelector("#newsSubscriptionForm")?.addEventListener("submit",event => {
      event.preventDefault();
      event.currentTarget.reset();
      window.Portal.helpers.toast(
        "Suscripción registrada en esta demostración. Conecte un servicio de correo para envíos reales."
      );
    });

    window.addEventListener("portal:datachange",render);
  }

  document.addEventListener("DOMContentLoaded",() => {
    bind();
    render();
  });
})();
(() => {
  const Portal = window.Portal;
  if (!Portal) return;

  const { state, helpers } = Portal;
  let active = false;
  let inspectorTarget = null;
  let mutationObserver = null;
  let saveTimer = null;

  const pageKey = () => helpers.pageKey();

  function pageData() {
    const key = pageKey();
    if (!state.pageSettings[key]) {
      state.pageSettings[key] = {
        publication: { status:"published", publishAt:"" },
        banner: {
          image:"",
          height:"",
          position:"center center",
          overlay:22,
          textAlign:"left"
        },
        sections:{},
        elements:{},
        sectionOrder:[],
        customBlocks:[]
      };
    }
    return state.pageSettings[key];
  }

  function contentKey(element) {
    if (element.dataset.adminContentKey) return element.dataset.adminContentKey;

    const main = document.querySelector("main");
    const section = element.closest("section,article,aside") || main;
    const sectionId = section?.id
      || section?.dataset.adminEntity
      || [...(main?.querySelectorAll("section,article,aside") || [])].indexOf(section);
    const candidates = section
      ? [...section.querySelectorAll("h1,h2,h3,h4,p,li,summary,blockquote,.button,a:not(nav a)")]
      : [];
    const index = candidates.indexOf(element);
    const key = `${pageKey()}:text:${sectionId}:${element.tagName.toLowerCase()}:${index}`;
    element.dataset.adminContentKey = key;
    return key;
  }

  function sectionKey(section) {
    if (section.dataset.adminSectionKey) return section.dataset.adminSectionKey;
    const main = document.querySelector("main");
    const index = [...(main?.querySelectorAll(":scope > section") || document.querySelectorAll("main section"))].indexOf(section);
    const key = section.id || section.dataset.adminEntity || `section-${Math.max(index,0)}`;
    section.dataset.adminSectionKey = key;
    return key;
  }

  function imageKey(image) {
    if (image.dataset.adminImageKey) return image.dataset.adminImageKey;
    const images = [...document.querySelectorAll("main img,header img")];
    const key = `${pageKey()}:image:${image.id || image.className || images.indexOf(image)}`;
    image.dataset.adminImageKey = key;
    return key;
  }

  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        helpers.save();
        showSaved();
      } catch (error) {
        helpers.toast("No fue posible guardar. Reduzca el tamaño de las imágenes cargadas.");
      }
    }, 180);
  }

  function showSaved() {
    const indicator = document.querySelector("#inlineAdminSaved");
    if (!indicator) return;
    indicator.textContent = "Guardado";
    indicator.classList.add("is-visible");
    clearTimeout(indicator._timer);
    indicator._timer = setTimeout(() => indicator.classList.remove("is-visible"), 1400);
  }

  function compressedImage(file, options = {}) {
    const { maxWidth = 1920, maxHeight = 1080, quality = .82 } = options;
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) {
        reject(new Error("Seleccione un archivo de imagen."));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("No fue posible leer la imagen."));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("La imagen no es válida."));
        image.onload = () => {
          let width = image.naturalWidth;
          let height = image.naturalHeight;
          const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function persistImage(dataUrl,category="content") {
    if (window.FirebasePortal?.canWrite?.()) {
      try { return await window.FirebasePortal.uploadDataUrl(dataUrl,`public/images/${category}`); }
      catch (error) { helpers.toast(window.FirebasePortal.friendlyError(error)); }
    }
    return dataUrl;
  }

  async function persistDocument(file,category="documents") {
    if (!file) return "";
    if (!window.FirebasePortal?.canWrite?.()) {
      helpers.toast("Para subir documentos debe iniciar sesión con un administrador de Firebase.");
      return "";
    }
    return window.FirebasePortal.uploadFile(file,`public/documents/${category}`);
  }

  function toolbarTemplate() {
    const s = state.settings;
    const p = pageData();
    return `
      <div class="inline-admin-toolbar" id="inlineAdminToolbar" role="region" aria-label="Barra de edición directa">
        <div class="inline-admin-brand">
          <span class="admin-live-dot"></span>
          <div><strong>Edición directa</strong><small>${pageKey()}</small></div>
        </div>

        <div class="inline-admin-actions">
          <details class="inline-admin-menu">
            <summary>Apariencia</summary>
            <div class="inline-admin-menu__panel">
              <label>Color principal<input id="inlinePrimary" type="color" value="${s.primary}"></label>
              <label>Color de acento<input id="inlineAccent" type="color" value="${s.accent}"></label>
              <label>Tamaño de letra <output id="inlineFontOutput">${s.fontScale}%</output>
                <input id="inlineFontScale" type="range" min="90" max="125" value="${s.fontScale}">
              </label>
              <label>Ancho del contenido
                <select id="inlineContentWidth">
                  <option value="1120" ${Number(s.contentWidth)===1120?"selected":""}>Compacto</option>
                  <option value="1200" ${Number(s.contentWidth||1200)===1200?"selected":""}>Estándar</option>
                  <option value="1320" ${Number(s.contentWidth)===1320?"selected":""}>Amplio</option>
                </select>
              </label>
              <label>Animaciones
                <select id="inlineAnimation">
                  <option value="smooth" ${s.animationMode==="smooth"?"selected":""}>Fluidas</option>
                  <option value="subtle" ${s.animationMode==="subtle"?"selected":""}>Sutiles</option>
                  <option value="none" ${s.animationMode==="none"?"selected":""}>Sin animación</option>
                </select>
              </label>
            </div>
          </details>

          <details class="inline-admin-menu">
            <summary>Encabezado y logos</summary>
            <div class="inline-admin-menu__panel">
              <label>Altura de la barra <output id="inlineHeaderOutput">${s.headerHeight}px</output>
                <input id="inlineHeaderHeight" type="range" min="64" max="96" value="${s.headerHeight}">
              </label>
              <label>Tamaño del escudo <output id="inlineCrestOutput">${s.crestSize}px</output>
                <input id="inlineCrestSize" type="range" min="34" max="72" value="${s.crestSize}">
              </label>
              <label>Tamaño de la marca <output id="inlineBrandOutput">${s.brandSize}px</output>
                <input id="inlineBrandSize" type="range" min="72" max="210" value="${s.brandSize}">
              </label>
              <label class="inline-check"><input id="inlineShowBrand" type="checkbox" ${s.showTourismLogo!==false?"checked":""}> Mostrar marca San Pedro</label>
              <label class="inline-file">Cambiar escudo<input id="inlineCrestUpload" type="file" accept="image/*"></label>
              <label class="inline-file">Cambiar marca<input id="inlineBrandUpload" type="file" accept="image/*"></label>
              <button type="button" class="inline-mini-button" id="inlineResetLogos">Restablecer logos</button>
            </div>
          </details>

          <details class="inline-admin-menu">
            <summary>Banner</summary>
            <div class="inline-admin-menu__panel">
              <label class="inline-file">Subir imagen del banner<input id="inlineBannerUpload" type="file" accept="image/*"></label>
              <label>Altura <output id="inlineBannerOutput">${p.banner.height || "Automática"}</output>
                <input id="inlineBannerHeight" type="range" min="360" max="820" value="${parseInt(p.banner.height)||610}">
              </label>
              <label>Posición
                <select id="inlineBannerPosition">
                  ${["center center","center top","center bottom","left center","right center"].map(value => `<option value="${value}" ${p.banner.position===value?"selected":""}>${value.replace("center","Centro").replace("top","Arriba").replace("bottom","Abajo").replace("left","Izquierda").replace("right","Derecha")}</option>`).join("")}
                </select>
              </label>
              <label>Oscurecimiento <output id="inlineOverlayOutput">${p.banner.overlay}%</output>
                <input id="inlineBannerOverlay" type="range" min="0" max="70" value="${p.banner.overlay}">
              </label>
              <label>Alineación del texto
                <select id="inlineBannerAlign">
                  <option value="left" ${p.banner.textAlign==="left"?"selected":""}>Izquierda</option>
                  <option value="center" ${p.banner.textAlign==="center"?"selected":""}>Centro</option>
                </select>
              </label>
              <button type="button" class="inline-mini-button" id="inlineRemoveBanner">Quitar imagen</button>
            </div>
          </details>

          <details class="inline-admin-menu">
            <summary>Publicación</summary>
            <div class="inline-admin-menu__panel">
              <label>Estado
                <select id="inlinePublicationStatus">
                  <option value="published" ${p.publication.status==="published"?"selected":""}>Publicado</option>
                  <option value="draft" ${p.publication.status==="draft"?"selected":""}>Borrador</option>
                  <option value="scheduled" ${p.publication.status==="scheduled"?"selected":""}>Programado</option>
                </select>
              </label>
              <label>Fecha de publicación<input id="inlinePublishAt" type="datetime-local" value="${p.publication.publishAt || ""}"></label>
              <p>La programación funciona localmente en esta versión estática.</p>
            </div>
          </details>

          <details class="inline-admin-menu">
            <summary>Contenido ＋</summary>
            <div class="inline-admin-menu__panel">
              <button type="button" class="inline-content-create" data-create-entity="year">＋ Nueva vigencia</button>
              <button type="button" class="inline-content-create" data-create-entity="resource">＋ Nuevo recurso</button>
              <button type="button" class="inline-content-create" data-create-entity="idea">＋ Nueva idea ciudadana</button>
            </div>
          </details>

          <button type="button" class="inline-toolbar-button firebase-sync-button" id="inlineFirebaseSync"><span class="firebase-sync-dot"></span> Firebase</button>
          <button type="button" class="inline-toolbar-button" id="inlineNewBlock">＋ Nuevo bloque</button>
          <button type="button" class="inline-toolbar-button" id="inlineVisitorView">Vista visitante</button>
          <button type="button" class="inline-toolbar-button is-danger" id="inlineLogout">Cerrar sesión</button>
        </div>

        <span class="inline-admin-saved" id="inlineAdminSaved">Guardado</span>
      </div>

      <aside class="inline-admin-inspector" id="inlineAdminInspector" aria-label="Inspector de edición">
        <div class="inline-inspector-head">
          <div><strong id="inlineInspectorTitle">Editor</strong><small id="inlineInspectorSubtitle">Seleccione un elemento</small></div>
          <button type="button" id="inlineInspectorClose" aria-label="Cerrar inspector">×</button>
        </div>
        <div class="inline-inspector-content" id="inlineInspectorContent">
          <div class="inline-empty-state">
            <span>✦</span>
            <strong>Seleccione una sección, tarjeta, texto o imagen.</strong>
            <p>Los cambios se guardan automáticamente en este navegador.</p>
          </div>
        </div>
      </aside>
    `;
  }

  function injectToolbar() {
    if (document.querySelector("#inlineAdminToolbar")) return;
    const holder = document.createElement("div");
    holder.id = "inlineAdminRoot";
    holder.innerHTML = toolbarTemplate();

    const header = document.querySelector("#siteHeader");
    if (header) header.appendChild(holder);
    else document.body.prepend(holder);

    bindToolbar();
  }

  function bindToolbar() {
    const get = selector => document.querySelector(selector);

    get("#inlinePrimary")?.addEventListener("input", event => {
      state.settings.primary = event.target.value;
      Portal.applySettings();
      persist();
    });
    get("#inlineAccent")?.addEventListener("input", event => {
      state.settings.accent = event.target.value;
      Portal.applySettings();
      persist();
    });
    get("#inlineFontScale")?.addEventListener("input", event => {
      state.settings.fontScale = Number(event.target.value);
      get("#inlineFontOutput").value = `${event.target.value}%`;
      Portal.applySettings();
      persist();
    });
    get("#inlineContentWidth")?.addEventListener("change", event => {
      state.settings.contentWidth = Number(event.target.value);
      Portal.applySettings();
      persist();
    });
    get("#inlineAnimation")?.addEventListener("change", event => {
      state.settings.animationMode = event.target.value;
      Portal.applySettings();
      persist();
    });

    get("#inlineHeaderHeight")?.addEventListener("input", event => {
      state.settings.headerHeight = Number(event.target.value);
      get("#inlineHeaderOutput").value = `${event.target.value}px`;
      Portal.applySettings();
      persist();
    });
    get("#inlineCrestSize")?.addEventListener("input", event => {
      state.settings.crestSize = Number(event.target.value);
      get("#inlineCrestOutput").value = `${event.target.value}px`;
      Portal.applySettings();
      persist();
    });
    get("#inlineBrandSize")?.addEventListener("input", event => {
      state.settings.brandSize = Number(event.target.value);
      get("#inlineBrandOutput").value = `${event.target.value}px`;
      Portal.applySettings();
      persist();
    });
    get("#inlineShowBrand")?.addEventListener("change", event => {
      state.settings.showTourismLogo = event.target.checked;
      document.querySelector(".header-tourism-logo")?.classList.toggle("is-hidden", !event.target.checked);
      document.querySelector(".header-brand__divider")?.classList.toggle("is-hidden", !event.target.checked);
      document.querySelector(".header-brand")?.classList.toggle("no-tourism-logo", !event.target.checked);
      persist();
    });

    get("#inlineCrestUpload")?.addEventListener("change", async event => {
      try {
        state.settings.headerCrest = await persistImage(await compressedImage(event.target.files[0], {maxWidth:600,maxHeight:600,quality:.88}),"branding/crest");
        const image = document.querySelector(".header-crest");
        if (image) image.src = state.settings.headerCrest;
        persist();
      } catch (error) { helpers.toast(error.message); }
      event.target.value = "";
    });

    get("#inlineBrandUpload")?.addEventListener("change", async event => {
      try {
        state.settings.headerBrand = await persistImage(await compressedImage(event.target.files[0], {maxWidth:1200,maxHeight:600,quality:.9}),"branding/brand");
        const image = document.querySelector(".header-tourism-logo");
        if (image) image.src = state.settings.headerBrand;
        persist();
      } catch (error) { helpers.toast(error.message); }
      event.target.value = "";
    });

    get("#inlineResetLogos")?.addEventListener("click", () => {
      state.settings.headerCrest = "";
      state.settings.headerBrand = "";
      state.settings.showTourismLogo = true;
      document.querySelector(".header-crest").src = "assets/escudo-san-pedro.png";
      const brand = document.querySelector(".header-tourism-logo");
      brand.src = "assets/imagen-san-pedro-color.png";
      brand.classList.remove("is-hidden");
      document.querySelector(".header-brand__divider")?.classList.remove("is-hidden");
      document.querySelector(".header-brand")?.classList.remove("no-tourism-logo");
      get("#inlineShowBrand").checked = true;
      persist();
    });

    get("#inlineBannerUpload")?.addEventListener("change", async event => {
      try {
        pageData().banner.image = await persistImage(await compressedImage(event.target.files[0], {maxWidth:2200,maxHeight:1200,quality:.84}),`banners/${pageKey()}`);
        applyBanner();
        persist();
      } catch (error) { helpers.toast(error.message); }
      event.target.value = "";
    });

    get("#inlineBannerHeight")?.addEventListener("input", event => {
      pageData().banner.height = `${event.target.value}px`;
      get("#inlineBannerOutput").value = `${event.target.value}px`;
      applyBanner();
      persist();
    });
    get("#inlineBannerPosition")?.addEventListener("change", event => {
      pageData().banner.position = event.target.value;
      applyBanner();
      persist();
    });
    get("#inlineBannerOverlay")?.addEventListener("input", event => {
      pageData().banner.overlay = Number(event.target.value);
      get("#inlineOverlayOutput").value = `${event.target.value}%`;
      applyBanner();
      persist();
    });
    get("#inlineBannerAlign")?.addEventListener("change", event => {
      pageData().banner.textAlign = event.target.value;
      applyBanner();
      persist();
    });
    get("#inlineRemoveBanner")?.addEventListener("click", () => {
      pageData().banner.image = "";
      pageData().banner.height = "";
      applyBanner();
      persist();
    });

    get("#inlinePublicationStatus")?.addEventListener("change", event => {
      pageData().publication.status = event.target.value;
      applyPublicationState();
      persist();
    });
    get("#inlinePublishAt")?.addEventListener("change", event => {
      pageData().publication.publishAt = event.target.value;
      applyPublicationState();
      persist();
    });

    document.querySelectorAll("[data-create-entity]").forEach(button => {
      button.addEventListener("click", () => openNewEntityInspector(button.dataset.createEntity));
    });
    get("#inlineFirebaseSync")?.addEventListener("click", async () => {
      try {
        await window.FirebasePortal?.pushAll?.({action:"manual_sync"});
      } catch (error) {
        helpers.toast(window.FirebasePortal?.friendlyError?.(error) || error.message);
      }
    });
    get("#inlineNewBlock")?.addEventListener("click", () => openNewBlockInspector());
    get("#inlineVisitorView")?.addEventListener("click", () => deactivate(false));
    get("#inlineLogout")?.addEventListener("click", logout);
    get("#inlineInspectorClose")?.addEventListener("click", closeInspector);
  }

  function bannerElement() {
    return document.querySelector(".home-hero,.page-hero");
  }

  function applyBanner() {
    const banner = bannerElement();
    if (!banner) return;
    const config = pageData().banner;

    banner.style.minHeight = config.height || "";
    banner.style.setProperty("--admin-banner-position", config.position || "center center");
    banner.style.setProperty("--admin-banner-overlay", String((config.overlay || 0) / 100));

    if (config.image) {
      banner.classList.add("has-admin-banner");
      banner.style.backgroundImage =
        `linear-gradient(rgba(3,29,67,${(config.overlay||0)/100}),rgba(3,29,67,${Math.min(.78,(config.overlay||0)/100+.12)})),url("${config.image}")`;
      banner.style.backgroundPosition = config.position || "center center";
      banner.style.backgroundSize = "cover";
    } else {
      banner.classList.remove("has-admin-banner");
      banner.style.backgroundImage = "";
      banner.style.backgroundPosition = "";
      banner.style.backgroundSize = "";
    }

    const copy = banner.querySelector(".home-hero__copy,.page-hero__grid>div:first-child");
    if (copy) {
      copy.style.textAlign = config.textAlign || "left";
      copy.classList.toggle("is-centered", config.textAlign === "center");
    }
  }

  function applyPublicationState() {
    const config = pageData().publication;
    document.body.dataset.publicationStatus = config.status || "published";

    document.querySelector(".publication-gate")?.remove();
    const main = document.querySelector("main");
    if (!main) return;

    const scheduledFuture = config.status === "scheduled"
      && config.publishAt
      && new Date(config.publishAt).getTime() > Date.now();
    const unavailable = !state.admin && (config.status === "draft" || scheduledFuture);

    main.hidden = unavailable;
    if (unavailable) {
      const notice = document.createElement("section");
      notice.className = "publication-gate";
      notice.innerHTML = `
        <span>PUBLICACIÓN ${config.status === "draft" ? "EN BORRADOR" : "PROGRAMADA"}</span>
        <h1>Esta página todavía no se encuentra disponible.</h1>
        <p>${scheduledFuture ? `Publicación prevista para ${new Date(config.publishAt).toLocaleString("es-CO")}.` : "El contenido está siendo preparado por la administración."}</p>
        <a class="button button-primary" href="index.html">Volver al inicio</a>`;
      document.querySelector("#siteHeader")?.after(notice);
    }
  }

  function applySavedContent() {
    document.querySelectorAll("main h1,main h2,main h3,main h4,main p,main li,main summary,main blockquote,main .button,main a:not(nav a)").forEach(element => {
      if (element.closest("form,dialog,.no-inline-edit")) return;
      const key = contentKey(element);
      if (Object.prototype.hasOwnProperty.call(state.content, key)) {
        element.innerHTML = state.content[key];
      }

      const style = pageData().elements[key];
      if (style) Object.assign(element.style, style);
    });

    document.querySelectorAll("main img,header img").forEach(image => {
      const key = imageKey(image);
      const media = pageData().elements[key];
      if (!media) return;
      if (media.src) image.src = media.src;
      if (media.alt !== undefined) image.alt = media.alt;
      if (media.width) image.style.width = media.width;
      if (media.objectFit) image.style.objectFit = media.objectFit;
    });
  }

  function applySectionOrder() {
    const order = pageData().sectionOrder || [];
    if (!order.length) return;

    const main = document.querySelector("main");
    if (!main) return;

    const sections = [...main.children].filter(element => element.tagName === "SECTION");
    const byKey = new Map(sections.map(section => [sectionKey(section), section]));
    order.forEach(key => {
      const section = byKey.get(key);
      if (section) main.appendChild(section);
    });
  }

  function applySectionStyles() {
    document.querySelectorAll("main section").forEach(section => {
      const key = sectionKey(section);
      const style = pageData().sections[key];
      if (!style) return;

      section.hidden = style.visible === false;
      section.style.backgroundColor = style.backgroundColor || "";
      section.style.backgroundImage = style.backgroundImage ? `url("${style.backgroundImage}")` : "";
      section.style.backgroundSize = style.backgroundImage ? "cover" : "";
      section.style.backgroundPosition = style.backgroundPosition || "center center";
      section.style.paddingTop = style.paddingTop ? `${style.paddingTop}px` : "";
      section.style.paddingBottom = style.paddingBottom ? `${style.paddingBottom}px` : "";
      section.style.minHeight = style.minHeight ? `${style.minHeight}px` : "";
    });
  }

  function renderCustomBlocks() {
    const main = document.querySelector("main");
    if (!main) return;

    main.querySelectorAll("[data-custom-block]").forEach(element => element.remove());
    pageData().customBlocks.forEach(block => {
      const section = document.createElement("section");
      section.className = `home-section custom-inline-block custom-inline-block--${block.theme || "blue"}`;
      section.dataset.customBlock = block.id;
      section.innerHTML = `
        <div class="site-shell custom-inline-block__inner">
          <div>
            <span class="section-kicker">${helpers.escape(block.kicker || "NUEVO MÓDULO")}</span>
            <h2>${helpers.escape(block.title)}</h2>
            <p>${helpers.escape(block.text)}</p>
          </div>
          ${block.button ? `<a class="button button-primary" href="${helpers.safeUrl(block.url || "#")}">${helpers.escape(block.button)}</a>` : ""}
        </div>`;
      const footer = main.querySelector(".newsletter-bar");
      if (footer) main.insertBefore(section, footer);
      else main.appendChild(section);
    });
  }

  function decorate() {
    if (!active) return;

    applySavedContent();
    applySectionStyles();

    document.querySelectorAll("main section").forEach(section => {
      if (section.querySelector(":scope > .admin-section-tools")) return;
      section.classList.add("admin-editable-section");

      const tools = document.createElement("div");
      tools.className = "admin-section-tools";
      tools.innerHTML = `
        <button type="button" data-inline-section="${sectionKey(section)}">Editar sección</button>
        <button type="button" data-inline-move="up" aria-label="Subir sección">↑</button>
        <button type="button" data-inline-move="down" aria-label="Bajar sección">↓</button>`;
      section.prepend(tools);
    });

    document.querySelectorAll("[data-admin-entity]").forEach(card => {
      card.classList.add("admin-editable-card");
      if (card.querySelector(":scope > .admin-card-edit")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-card-edit";
      button.dataset.inlineEntity = card.dataset.adminEntity;
      button.dataset.entityId = card.dataset.entityId;
      button.dataset.entityYear = card.dataset.entityYear || "";
      button.textContent = "Editar";
      card.appendChild(button);
    });

    document.querySelectorAll("main h1,main h2,main h3,main h4,main p,main li,main summary,main blockquote,main .button,main a:not(nav a)").forEach(element => {
      if (element.closest("form,dialog,.admin-section-tools,.admin-card-edit,.no-inline-edit")) return;
      element.classList.add("admin-inline-text");
      element.contentEditable = "true";
      element.spellcheck = true;
      element.dataset.adminContentKey = contentKey(element);
      element.setAttribute("aria-label", `Texto editable: ${element.textContent.trim().slice(0,80)}`);
    });

    document.querySelectorAll("main img,header img").forEach(image => {
      image.classList.add("admin-inline-image");
      image.dataset.adminImageKey = imageKey(image);
    });
  }

  function undecorate() {
    document.querySelectorAll(".admin-section-tools,.admin-card-edit").forEach(element => element.remove());
    document.querySelectorAll(".admin-editable-section,.admin-editable-card,.admin-inline-image").forEach(element => {
      element.classList.remove("admin-editable-section","admin-editable-card","admin-inline-image");
    });
    document.querySelectorAll(".admin-inline-text").forEach(element => {
      element.contentEditable = "false";
      element.classList.remove("admin-inline-text");
      element.removeAttribute("aria-label");
    });
  }

  function activate() {
    active = true;
    state.admin = true;
    sessionStorage.setItem(Portal.KEYS.admin, "1");
    document.body.classList.add("admin-inline-active");
    injectToolbar();
    document.querySelector("#inlineAdminRoot")?.classList.remove("is-hidden");
    applyBanner();
    applyPublicationState();
    decorate();

    const adminButton = document.querySelector("#adminEntry");
    if (adminButton) {
      adminButton.textContent = "Edición activa";
      adminButton.classList.add("is-active");
    }

    if (!mutationObserver) {
      mutationObserver = new MutationObserver(() => {
        clearTimeout(mutationObserver._timer);
        mutationObserver._timer = setTimeout(decorate, 90);
      });
      const main = document.querySelector("main");
      if (main) mutationObserver.observe(main, {childList:true,subtree:true});
    }
  }

  function deactivate(showMessage = true) {
    active = false;
    document.body.classList.remove("admin-inline-active","admin-inspector-open");
    closeInspector();
    undecorate();
    document.querySelector("#inlineAdminRoot")?.classList.add("is-hidden");
    const button = document.querySelector("#adminEntry");
    if (button) button.textContent = "Editar página";
    if (showMessage) helpers.toast("Vista de visitante activada.");
  }

  function logout() {
    state.admin = false;
    sessionStorage.removeItem(Portal.KEYS.admin);
    deactivate(false);
    const button = document.querySelector("#adminEntry");
    if (button) {
      button.textContent = "Administrador";
      button.classList.remove("is-active");
    }
    helpers.toast("Sesión administrativa cerrada.");
  }

  function openInspector(title, subtitle, content) {
    inspectorTarget = null;
    document.querySelector("#inlineInspectorTitle").textContent = title;
    document.querySelector("#inlineInspectorSubtitle").textContent = subtitle || "";
    document.querySelector("#inlineInspectorContent").innerHTML = content;
    document.querySelector("#inlineAdminInspector").classList.add("open");
    document.body.classList.add("admin-inspector-open");
  }

  function closeInspector() {
    document.querySelector("#inlineAdminInspector")?.classList.remove("open");
    document.body.classList.remove("admin-inspector-open");
    inspectorTarget = null;
  }

  function openSectionInspector(section) {
    inspectorTarget = section;
    const key = sectionKey(section);
    const current = pageData().sections[key] || {
      visible:true, backgroundColor:"", backgroundImage:"",
      backgroundPosition:"center center", paddingTop:"", paddingBottom:"", minHeight:""
    };

    const title = section.querySelector("h1,h2,h3")?.textContent.trim() || "Sección";
    openInspector("Editar sección", title, `
      <div class="inline-inspector-form">
        <label class="inline-check"><input id="sectionVisible" type="checkbox" ${current.visible!==false?"checked":""}> Mostrar sección</label>
        <label>Color de fondo<input id="sectionBackground" type="color" value="${current.backgroundColor || "#ffffff"}"></label>
        <label class="inline-check"><input id="sectionTransparent" type="checkbox" ${!current.backgroundColor?"checked":""}> Fondo transparente</label>
        <label class="inline-file">Imagen de fondo<input id="sectionImage" type="file" accept="image/*"></label>
        <label>Posición
          <select id="sectionPosition">
            ${["center center","center top","center bottom","left center","right center"].map(value => `<option value="${value}" ${current.backgroundPosition===value?"selected":""}>${value}</option>`).join("")}
          </select>
        </label>
        <label>Espacio superior <output id="sectionTopOutput">${current.paddingTop || 0}px</output><input id="sectionTop" type="range" min="0" max="180" value="${current.paddingTop || 0}"></label>
        <label>Espacio inferior <output id="sectionBottomOutput">${current.paddingBottom || 0}px</output><input id="sectionBottom" type="range" min="0" max="180" value="${current.paddingBottom || 0}"></label>
        <label>Altura mínima <output id="sectionHeightOutput">${current.minHeight || 0}px</output><input id="sectionHeight" type="range" min="0" max="900" value="${current.minHeight || 0}"></label>
        <button type="button" class="inline-danger-button" id="sectionReset">Restablecer sección</button>
      </div>`);

    const update = () => {
      const data = pageData().sections[key] || {};
      data.visible = document.querySelector("#sectionVisible").checked;
      data.backgroundColor = document.querySelector("#sectionTransparent").checked ? "" : document.querySelector("#sectionBackground").value;
      data.backgroundPosition = document.querySelector("#sectionPosition").value;
      data.paddingTop = Number(document.querySelector("#sectionTop").value);
      data.paddingBottom = Number(document.querySelector("#sectionBottom").value);
      data.minHeight = Number(document.querySelector("#sectionHeight").value);
      pageData().sections[key] = data;
      applySectionStyles();
      persist();
    };

    ["#sectionVisible","#sectionBackground","#sectionTransparent","#sectionPosition","#sectionTop","#sectionBottom","#sectionHeight"].forEach(selector => {
      document.querySelector(selector)?.addEventListener("input", () => {
        document.querySelector("#sectionTopOutput").value = `${document.querySelector("#sectionTop").value}px`;
        document.querySelector("#sectionBottomOutput").value = `${document.querySelector("#sectionBottom").value}px`;
        document.querySelector("#sectionHeightOutput").value = `${document.querySelector("#sectionHeight").value}px`;
        update();
      });
    });

    document.querySelector("#sectionImage")?.addEventListener("change", async event => {
      try {
        const data = pageData().sections[key] || {};
        data.backgroundImage = await persistImage(await compressedImage(event.target.files[0], {maxWidth:2200,maxHeight:1300,quality:.83}),`sections/${pageKey()}`);
        pageData().sections[key] = data;
        applySectionStyles();
        persist();
      } catch (error) { helpers.toast(error.message); }
    });

    document.querySelector("#sectionReset")?.addEventListener("click", () => {
      delete pageData().sections[key];
      section.hidden = false;
      section.removeAttribute("style");
      persist();
      closeInspector();
    });
  }

  function openTextInspector(element) {
    inspectorTarget = element;
    const key = contentKey(element);
    const saved = pageData().elements[key] || {};
    const computed = getComputedStyle(element);

    openInspector("Editar texto", element.textContent.trim().slice(0,75), `
      <div class="inline-inspector-form">
        <p class="inline-hint">Puede escribir directamente sobre el texto en la página.</p>
        <label>Tamaño <output id="textSizeOutput">${Math.round(parseFloat(computed.fontSize))}px</output><input id="textSize" type="range" min="10" max="82" value="${Math.round(parseFloat(saved.fontSize || computed.fontSize))}"></label>
        <label>Color<input id="textColor" type="color" value="${rgbToHex(saved.color || computed.color)}"></label>
        <label>Peso
          <select id="textWeight">
            ${[400,500,600,700,800].map(value => `<option value="${value}" ${String(saved.fontWeight || computed.fontWeight)===String(value)?"selected":""}>${value}</option>`).join("")}
          </select>
        </label>
        <label>Alineación
          <select id="textAlign">
            ${["left","center","right"].map(value => `<option value="${value}" ${(saved.textAlign || computed.textAlign)===value?"selected":""}>${value}</option>`).join("")}
          </select>
        </label>
        <button type="button" class="inline-danger-button" id="textReset">Restablecer texto y estilo</button>
      </div>`);

    const apply = () => {
      const style = {
        fontSize:`${document.querySelector("#textSize").value}px`,
        color:document.querySelector("#textColor").value,
        fontWeight:document.querySelector("#textWeight").value,
        textAlign:document.querySelector("#textAlign").value
      };
      pageData().elements[key] = style;
      Object.assign(element.style, style);
      document.querySelector("#textSizeOutput").value = style.fontSize;
      persist();
    };

    ["#textSize","#textColor","#textWeight","#textAlign"].forEach(selector => {
      document.querySelector(selector)?.addEventListener("input", apply);
    });

    document.querySelector("#textReset")?.addEventListener("click", () => {
      delete state.content[key];
      delete pageData().elements[key];
      element.removeAttribute("style");
      location.reload();
    });
  }

  function openImageInspector(image) {
    inspectorTarget = image;
    const key = imageKey(image);
    const saved = pageData().elements[key] || {};

    openInspector("Editar imagen", image.alt || "Imagen", `
      <div class="inline-inspector-form">
        <img class="inline-image-preview" id="inlineImagePreview" src="${helpers.escape(image.src)}" alt="">
        <label class="inline-file">Subir otra imagen<input id="inlineImageUpload" type="file" accept="image/*"></label>
        <label>Texto alternativo<input id="inlineImageAlt" value="${helpers.escape(image.alt || "")}"></label>
        <label>Ancho <output id="inlineImageWidthOutput">${parseInt(image.getBoundingClientRect().width)}px</output><input id="inlineImageWidth" type="range" min="30" max="700" value="${parseInt(saved.width) || Math.round(image.getBoundingClientRect().width)}"></label>
        <label>Ajuste
          <select id="inlineImageFit">
            <option value="contain" ${(saved.objectFit || getComputedStyle(image).objectFit)==="contain"?"selected":""}>Contener</option>
            <option value="cover" ${(saved.objectFit || getComputedStyle(image).objectFit)==="cover"?"selected":""}>Cubrir</option>
          </select>
        </label>
        <button type="button" class="inline-danger-button" id="inlineImageReset">Restablecer imagen</button>
      </div>`);

    document.querySelector("#inlineImageUpload")?.addEventListener("change", async event => {
      try {
        const src = await persistImage(await compressedImage(event.target.files[0], {maxWidth:1800,maxHeight:1200,quality:.87}),`content/${pageKey()}`);
        const data = pageData().elements[key] || {};
        data.src = src;
        pageData().elements[key] = data;
        image.src = src;
        document.querySelector("#inlineImagePreview").src = src;
        persist();
      } catch (error) { helpers.toast(error.message); }
    });

    document.querySelector("#inlineImageAlt")?.addEventListener("input", event => {
      const data = pageData().elements[key] || {};
      data.alt = event.target.value;
      pageData().elements[key] = data;
      image.alt = event.target.value;
      persist();
    });

    document.querySelector("#inlineImageWidth")?.addEventListener("input", event => {
      const data = pageData().elements[key] || {};
      data.width = `${event.target.value}px`;
      pageData().elements[key] = data;
      image.style.width = data.width;
      document.querySelector("#inlineImageWidthOutput").value = data.width;
      persist();
    });

    document.querySelector("#inlineImageFit")?.addEventListener("change", event => {
      const data = pageData().elements[key] || {};
      data.objectFit = event.target.value;
      pageData().elements[key] = data;
      image.style.objectFit = data.objectFit;
      persist();
    });

    document.querySelector("#inlineImageReset")?.addEventListener("click", () => {
      delete pageData().elements[key];
      location.reload();
    });
  }

  function entityData(type, id, year) {
    const dashboard = state.dashboards?.[String(year)] || state.dashboards?.[year];
    if (type === "year") return state.years.find(item => String(item.year) === String(id));
    if (type === "resource") return state.resources.find(item => item.id === id);
    if (type === "idea") return state.ideas.find(item => item.id === id);
    if (type === "dashboardKpi") return dashboard?.kpis?.find(item => item.id === id);
    if (type === "investmentItem") return dashboard?.investment?.find(item => item.id === id);
    if (type === "reachItem") return dashboard?.populationReach?.find(item => item.id === id);
    if (type === "executionItem") return dashboard?.execution?.find(item => item.id === id);
    if (type === "commitment") return state.commitments.find(item => item.id === id);
    if (type === "citizenRequest") return state.citizenRequests.find(item => item.id === id);
    return null;
  }

  function openEntityInspector(type, id, year) {
    const entity = entityData(type, id, year);
    if (!entity) return;

    if (type === "year") {
      openInspector("Editar vigencia", `Rendición de Cuentas ${entity.year}`, `
        <form class="inline-inspector-form" id="entityEditForm">
          <label>Estado<select name="status">
            ${["Publicada","En construcción","Programada"].map(value => `<option ${entity.status===value?"selected":""}>${value}</option>`).join("")}
          </select></label>
          <label>Avance<input name="progress" type="number" min="0" max="100" value="${entity.progress}"></label>
          <label>Titular<input name="headline" value="${helpers.escape(entity.headline || "")}"></label>
          <label>Resumen<textarea name="summary" rows="5">${helpers.escape(entity.summary || "")}</textarea></label>
          <div class="inline-two-columns">
            <label>Documentos<input name="documents" type="number" min="0" value="${entity.documents || 0}"></label>
            <label>Videos<input name="videos" type="number" min="0" value="${entity.videos || 0}"></label>
            <label>Compromisos<input name="commitments" type="number" min="0" value="${entity.commitments || 0}"></label>
            <label>Respuestas<input name="questions" type="number" min="0" value="${entity.questions || 0}"></label>
          </div>
          <h4 class="inline-form-heading">Indicadores</h4>
          <div class="inline-two-columns">
            <label>Cumplimiento del plan<input name="metricPlan" type="number" min="0" max="100" value="${entity.metrics?.plan || 0}"></label>
            <label>Proyectos<input name="metricProjects" type="number" min="0" value="${entity.metrics?.projects || 0}"></label>
            <label>Compromisos atendidos<input name="metricCommitments" type="number" min="0" max="100" value="${entity.metrics?.commitments || 0}"></label>
            <label>Espacios participativos<input name="metricParticipation" type="number" min="0" value="${entity.metrics?.participation || 0}"></label>
          </div>
          <h4 class="inline-form-heading">Líneas estratégicas</h4>
          ${(entity.sectors || []).slice(0,4).map((sector,index) => `
            <div class="inline-sector-row">
              <input name="sectorName${index}" value="${helpers.escape(sector[0])}" aria-label="Nombre de la línea ${index+1}">
              <input name="sectorValue${index}" type="number" min="0" max="100" value="${sector[1]}" aria-label="Avance de la línea ${index+1}">
            </div>`).join("")}
          <label class="inline-file">Imagen de portada<input name="cover" type="file" accept="image/*"></label>
          ${entity.cover ? '<button type="button" class="inline-mini-button" id="removeEntityImage">Quitar portada</button>' : ""}
          <button class="button button-primary">Guardar vigencia</button>
        </form>`);
    }

    if (type === "resource") {
      openInspector("Editar recurso", entity.title, `
        <form class="inline-inspector-form" id="entityEditForm">
          <label>Título<input name="title" value="${helpers.escape(entity.title)}"></label>
          <label>Vigencia<select name="year">${state.years.map(year => `<option value="${year.year}" ${Number(entity.year)===Number(year.year)?"selected":""}>${year.year}</option>`).join("")}</select></label>
          <label>Tipo<select name="type">${["informe","presentacion","video","datos","compromiso","respuesta"].map(value => `<option value="${value}" ${entity.type===value?"selected":""}>${helpers.typeLabel(value)}</option>`).join("")}</select></label>
          <label>Descripción<textarea name="description" rows="4">${helpers.escape(entity.description)}</textarea></label>
          <label>Detalle<input name="meta" value="${helpers.escape(entity.meta || "")}"></label>
          <label>Enlace<input name="url" value="${helpers.escape(entity.url || "#")}"></label>
          <label class="inline-file">Subir documento<input name="document" type="file" accept=".pdf,.xlsx,.xls,.csv,.ppt,.pptx,.doc,.docx,video/*"></label>
          <label class="inline-check"><input name="featured" type="checkbox" ${entity.featured?"checked":""}> Recurso destacado</label>
          <label class="inline-file">Imagen del recurso<input name="image" type="file" accept="image/*"></label>
          ${entity.image ? '<button type="button" class="inline-mini-button" id="removeEntityImage">Quitar imagen</button>' : ""}
          <button class="button button-primary">Guardar recurso</button>
          <button type="button" class="inline-danger-button" id="deleteEntity">Eliminar recurso</button>
        </form>`);
    }

    if (type === "idea") {
      openInspector("Editar idea ciudadana", entity.title, `
        <form class="inline-inspector-form" id="entityEditForm">
          <label>Título<input name="title" value="${helpers.escape(entity.title)}"></label>
          <label>Autor o colectivo<input name="author" value="${helpers.escape(entity.author)}"></label>
          <label>Ubicación<input name="location" value="${helpers.escape(entity.location)}"></label>
          <label>Categoría<input name="category" value="${helpers.escape(entity.category)}"></label>
          <label>Descripción<textarea name="description" rows="5">${helpers.escape(entity.description)}</textarea></label>
          <label>Estado<select name="status">${["recibida","analisis","aceptada","resuelta"].map(value => `<option value="${value}" ${entity.status===value?"selected":""}>${helpers.statusLabel(value)}</option>`).join("")}</select></label>
          <label>Respuesta institucional<textarea name="response" rows="5">${helpers.escape(entity.response)}</textarea></label>
          <label>Apoyos<input name="votes" type="number" min="0" value="${entity.votes || 0}"></label>
          <button class="button button-primary">Guardar idea</button>
          <button type="button" class="inline-danger-button" id="deleteEntity">Eliminar idea</button>
        </form>`);
    }


    if (type === "dashboardKpi") {
      openInspector("Editar indicador", entity.label, `<form class="inline-inspector-form" id="entityEditForm">
        <label>Nombre<input name="label" value="${helpers.escape(entity.label)}"></label>
        <label>Valor numérico<input name="value" type="number" step="any" value="${entity.value}"></label>
        <label>Valor visible<input name="display" value="${helpers.escape(entity.display || "")}"></label>
        <label>Descripción<textarea name="description" rows="4">${helpers.escape(entity.description || "")}</textarea></label>
        <label>Ícono<input name="icon" value="${helpers.escape(entity.icon || "")}"></label>
        <label>Color<select name="color">${["blue","teal","orange","pink","purple","green"].map(value=>`<option ${entity.color===value?"selected":""}>${value}</option>`).join("")}</select></label>
        <button class="button button-primary">Guardar indicador</button></form>`);
    }

    if (["investmentItem","reachItem","executionItem"].includes(type)) {
      openInspector("Editar dato de gráfica", entity.label, `<form class="inline-inspector-form" id="entityEditForm">
        <label>Nombre<input name="label" value="${helpers.escape(entity.label)}"></label>
        <label>Valor<input name="value" type="number" step="any" value="${entity.value}"></label>
        ${type==="investmentItem"?`<label>Alcance<textarea name="scope" rows="4">${helpers.escape(entity.scope || "")}</textarea></label>`:""}
        <button class="button button-primary">Guardar dato</button></form>`);
    }

    if (type === "commitment") {
      openInspector("Editar compromiso", entity.title, `<form class="inline-inspector-form" id="entityEditForm">
        <label>Compromiso<input name="title" value="${helpers.escape(entity.title)}"></label>
        <label>Responsable<textarea name="responsible" rows="3">${helpers.escape(entity.responsible)}</textarea></label>
        <label>Alcance<textarea name="scope" rows="5">${helpers.escape(entity.scope)}</textarea></label>
        <label>Prioridad<select name="priority">${["Alta","Estratégica","Transversal"].map(value=>`<option ${entity.priority===value?"selected":""}>${value}</option>`).join("")}</select></label>
        <label>Estado<select name="status">${[["pendiente","Pendiente"],["en_progreso","En progreso"],["cumplido","Cumplido"],["bloqueado","Bloqueado"]].map(([value,label])=>`<option value="${value}" ${entity.status===value?"selected":""}>${label}</option>`).join("")}</select></label>
        <label>Avance <output id="commitmentProgressOutput">${entity.progress || 0}%</output><input name="progress" id="commitmentProgress" type="range" min="0" max="100" value="${entity.progress || 0}"></label>
        <label>Fecha objetivo<input name="dueDate" type="date" value="${helpers.escape(entity.dueDate || "")}"></label>
        <label>Enlace de evidencia<input name="evidenceUrl" value="${helpers.escape(entity.evidenceUrl || "")}"></label>
        <label class="inline-file">Subir evidencia<input name="evidenceFile" type="file" accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"></label>
        <button class="button button-primary">Guardar compromiso</button></form>`);
      document.querySelector("#commitmentProgress")?.addEventListener("input",event=>document.querySelector("#commitmentProgressOutput").value=`${event.target.value}%`);
    }

    if (type === "citizenRequest") {
      openInspector("Editar solicitud ciudadana", entity.request, `<form class="inline-inspector-form" id="entityEditForm">
        <label>Radicados<textarea name="radicados" rows="3">${helpers.escape(entity.radicados)}</textarea></label>
        <label>Solicitante<input name="applicant" value="${helpers.escape(entity.applicant)}"></label>
        <label>Tema<input name="topic" value="${helpers.escape(entity.topic)}"></label>
        <label>Estado<input name="status" value="${helpers.escape(entity.status)}"></label>
        <label>Solicitud<textarea name="request" rows="5">${helpers.escape(entity.request)}</textarea></label>
        <label>Respuesta institucional<textarea name="response" rows="6">${helpers.escape(entity.response || "")}</textarea></label>
        <label>Referencia y soporte<textarea name="support" rows="4">${helpers.escape(entity.support || "")}</textarea></label>
        <button class="button button-primary">Guardar solicitud</button></form>`);
    }

    const form = document.querySelector("#entityEditForm");
    const imageInput = form?.querySelector('input[name="image"],input[name="cover"]');
    const documentInput = form?.querySelector('input[name="document"]');
    const evidenceInput = form?.querySelector('input[name="evidenceFile"]');
    let pendingImage = null;
    let pendingDocument = null;
    let pendingEvidence = null;

    imageInput?.addEventListener("change", async event => {
      try {
        pendingImage = await persistImage(await compressedImage(event.target.files[0], {maxWidth:1800,maxHeight:1100,quality:.84}),`entities/${type}`);
        helpers.toast("Imagen preparada. Guarde los cambios.");
      } catch (error) { helpers.toast(error.message); }
    });

    documentInput?.addEventListener("change", async event => {
      try { pendingDocument = await persistDocument(event.target.files[0],`resources/${entity.id}`); helpers.toast("Documento cargado. Guarde los cambios."); }
      catch (error) { helpers.toast(window.FirebasePortal?.friendlyError?.(error) || error.message); }
    });

    evidenceInput?.addEventListener("change", async event => {
      try { pendingEvidence = await persistDocument(event.target.files[0],`commitments/${entity.id}`); helpers.toast("Evidencia cargada. Guarde los cambios."); }
      catch (error) { helpers.toast(window.FirebasePortal?.friendlyError?.(error) || error.message); }
    });

    document.querySelector("#removeEntityImage")?.addEventListener("click", () => {
      if (type === "year") entity.cover = "";
      if (type === "resource") entity.image = "";
      pendingImage = "";
      helpers.save();
      helpers.toast("Imagen eliminada.");
    });

    document.querySelector("#deleteEntity")?.addEventListener("click", () => {
      if (!confirm("¿Eliminar este elemento?")) return;
      if (type === "resource") state.resources = state.resources.filter(item => item.id !== entity.id);
      if (type === "idea") state.ideas = state.ideas.filter(item => item.id !== entity.id);
      helpers.save();
      location.reload();
    });

    form?.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(event.target);

      if (type === "year") {
        entity.status = data.get("status");
        entity.progress = Number(data.get("progress"));
        entity.headline = data.get("headline");
        entity.summary = data.get("summary");
        entity.documents = Number(data.get("documents"));
        entity.videos = Number(data.get("videos"));
        entity.commitments = Number(data.get("commitments"));
        entity.questions = Number(data.get("questions"));
        entity.metrics = {
          plan:Number(data.get("metricPlan")),
          projects:Number(data.get("metricProjects")),
          commitments:Number(data.get("metricCommitments")),
          participation:Number(data.get("metricParticipation"))
        };
        entity.sectors = [0,1,2,3]
          .map(index => [data.get(`sectorName${index}`), Number(data.get(`sectorValue${index}`))])
          .filter(item => item[0]);
        if (pendingImage !== null) entity.cover = pendingImage;
      }

      if (type === "resource") {
        entity.title = data.get("title");
        entity.year = Number(data.get("year"));
        entity.type = data.get("type");
        entity.description = data.get("description");
        entity.meta = data.get("meta");
        entity.url = data.get("url");
        entity.featured = data.get("featured") === "on";
        if (pendingImage !== null) entity.image = pendingImage;
      }

      if (type === "idea") {
        entity.title = data.get("title");
        entity.author = data.get("author");
        entity.location = data.get("location");
        entity.category = data.get("category");
        entity.description = data.get("description");
        entity.status = data.get("status");
        entity.response = data.get("response");
        entity.votes = Number(data.get("votes"));
      }

      if (type === "dashboardKpi") {
        entity.label=data.get("label"); entity.value=Number(data.get("value")); entity.display=data.get("display"); entity.description=data.get("description"); entity.icon=data.get("icon"); entity.color=data.get("color");
      }
      if (["investmentItem","reachItem","executionItem"].includes(type)) {
        entity.label=data.get("label"); entity.value=Number(data.get("value")); if(type==="investmentItem") entity.scope=data.get("scope");
      }
      if (type === "commitment") {
        entity.title=data.get("title"); entity.responsible=data.get("responsible"); entity.scope=data.get("scope"); entity.priority=data.get("priority"); entity.status=data.get("status"); entity.progress=Number(data.get("progress")); entity.dueDate=data.get("dueDate"); entity.evidenceUrl=pendingEvidence || data.get("evidenceUrl"); entity.updatedAt=new Date().toISOString();
      }
      if (type === "citizenRequest") {
        entity.radicados=data.get("radicados"); entity.applicant=data.get("applicant"); entity.topic=data.get("topic"); entity.status=data.get("status"); entity.request=data.get("request"); entity.response=data.get("response"); entity.support=data.get("support");
      }
      if (type === "resource" && pendingDocument) entity.url=pendingDocument;

      helpers.save();
      helpers.toast("Cambios guardados.");
      setTimeout(() => location.reload(), 350);
    });
  }

  function openNewEntityInspector(type) {
    if (type === "year") {
      const nextYear = Math.max(...state.years.map(item => Number(item.year)), new Date().getFullYear()) + 1;
      openInspector("Nueva vigencia", "Crear una nueva edición", `
        <form class="inline-inspector-form" id="newEntityForm">
          <label>Año<input name="year" type="number" min="2025" max="2100" value="${nextYear}" required></label>
          <label>Estado<select name="status"><option>Programada</option><option>En construcción</option><option>Publicada</option></select></label>
          <label>Avance<input name="progress" type="number" min="0" max="100" value="0"></label>
          <label>Titular<input name="headline" value="Nueva edición de Rendición de Cuentas."></label>
          <label>Resumen<textarea name="summary" rows="5" required></textarea></label>
          <label class="inline-file">Imagen de portada<input name="cover" type="file" accept="image/*"></label>
          <button class="button button-primary">Crear vigencia</button>
        </form>`);
    }

    if (type === "resource") {
      openInspector("Nuevo recurso", "Agregar al centro documental", `
        <form class="inline-inspector-form" id="newEntityForm">
          <label>Título<input name="title" required></label>
          <label>Vigencia<select name="year">${state.years.map(year => `<option value="${year.year}">${year.year}</option>`).join("")}</select></label>
          <label>Tipo<select name="type">${["informe","presentacion","video","datos","compromiso","respuesta"].map(value => `<option value="${value}">${helpers.typeLabel(value)}</option>`).join("")}</select></label>
          <label>Descripción<textarea name="description" rows="4" required></textarea></label>
          <label>Detalle<input name="meta" placeholder="Ejemplo: 24 páginas · 3 MB"></label>
          <label>Enlace<input name="url" value="#"></label>
          <label class="inline-file">Subir documento<input name="document" type="file" accept=".pdf,.xlsx,.xls,.csv,.ppt,.pptx,.doc,.docx,video/*"></label>
          <label class="inline-check"><input name="featured" type="checkbox"> Mostrar como destacado</label>
          <label class="inline-file">Imagen del recurso<input name="image" type="file" accept="image/*"></label>
          <button class="button button-primary">Crear recurso</button>
        </form>`);
    }

    if (type === "idea") {
      openInspector("Nueva idea ciudadana", "Registro administrativo", `
        <form class="inline-inspector-form" id="newEntityForm">
          <label>Título<input name="title" required></label>
          <label>Autor o colectivo<input name="author" required></label>
          <label>Ubicación<input name="location" required></label>
          <label>Categoría<input name="category" required></label>
          <label>Descripción<textarea name="description" rows="5" required></textarea></label>
          <label>Estado<select name="status"><option value="recibida">Recibida</option><option value="analisis">En análisis</option><option value="aceptada">Se tendrá en cuenta</option><option value="resuelta">Resuelta</option></select></label>
          <label>Respuesta institucional<textarea name="response" rows="4">La propuesta fue recibida y está pendiente de revisión institucional.</textarea></label>
          <button class="button button-primary">Crear idea</button>
        </form>`);
    }

    const form = document.querySelector("#newEntityForm");
    if (!form) return;
    const imageInput = form.querySelector('input[name="image"],input[name="cover"]');
    const documentInput = form.querySelector('input[name="document"]');
    let preparedImage = "";
    let preparedDocument = "";

    imageInput?.addEventListener("change", async event => {
      try {
        preparedImage = await persistImage(await compressedImage(event.target.files[0], {maxWidth:1800,maxHeight:1100,quality:.84}),`entities/${type}`);
        helpers.toast("Imagen preparada.");
      } catch (error) { helpers.toast(error.message); }
    });


    documentInput?.addEventListener("change", async event => {
      try { preparedDocument = await persistDocument(event.target.files[0],`resources/new`); helpers.toast("Documento cargado."); }
      catch (error) { helpers.toast(window.FirebasePortal?.friendlyError?.(error) || error.message); }
    });
    form.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(event.target);

      if (type === "year") {
        const year = Number(data.get("year"));
        if (state.years.some(item => Number(item.year) === year)) {
          helpers.toast("La vigencia ya existe.");
          return;
        }
        state.years.push({
          year,
          status:data.get("status"),
          progress:Number(data.get("progress")),
          summary:data.get("summary"),
          headline:data.get("headline"),
          documents:0,
          videos:0,
          commitments:0,
          questions:0,
          cover:preparedImage,
          metrics:{plan:Number(data.get("progress")),projects:0,commitments:0,participation:0},
          sectors:[["Infraestructura",0],["Desarrollo social",0],["Gestión administrativa",0],["Participación ciudadana",0]]
        });
      }

      if (type === "resource") {
        state.resources.unshift({
          id:`r${Date.now()}`,
          title:data.get("title"),
          year:Number(data.get("year")),
          type:data.get("type"),
          description:data.get("description"),
          meta:data.get("meta") || "Recurso digital",
          url:preparedDocument || data.get("url") || "#",
          featured:data.get("featured") === "on",
          image:preparedImage
        });
      }

      if (type === "idea") {
        state.ideas.unshift({
          id:`i${Date.now()}`,
          title:data.get("title"),
          author:data.get("author"),
          location:data.get("location"),
          category:data.get("category"),
          description:data.get("description"),
          status:data.get("status"),
          response:data.get("response"),
          votes:0,
          created:new Date().toLocaleDateString("es-CO",{day:"numeric",month:"short",year:"numeric"})
        });
      }

      helpers.save();
      helpers.toast("Contenido creado.");
      setTimeout(() => location.reload(), 350);
    });
  }

  function openNewBlockInspector() {
    openInspector("Crear nuevo bloque", "Se agregará antes del boletín final", `
      <form class="inline-inspector-form" id="newBlockForm">
        <label>Rótulo<input name="kicker" value="NUEVO MÓDULO"></label>
        <label>Título<input name="title" required></label>
        <label>Contenido<textarea name="text" rows="6" required></textarea></label>
        <label>Texto del botón<input name="button" value="Ver información"></label>
        <label>Enlace<input name="url" value="#"></label>
        <label>Estilo<select name="theme"><option value="blue">Azul</option><option value="light">Claro</option><option value="accent">Acento</option></select></label>
        <button class="button button-primary">Crear bloque</button>
      </form>`);

    document.querySelector("#newBlockForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(event.target);
      pageData().customBlocks.push({
        id:`block-${Date.now()}`,
        kicker:data.get("kicker"),
        title:data.get("title"),
        text:data.get("text"),
        button:data.get("button"),
        url:data.get("url"),
        theme:data.get("theme")
      });
      persist();
      renderCustomBlocks();
      decorate();
      closeInspector();
      helpers.toast("Nuevo bloque creado.");
    });
  }

  function moveSection(section, direction) {
    const sibling = direction === "up" ? section.previousElementSibling : section.nextElementSibling;
    if (!sibling || sibling.tagName !== "SECTION") return;
    if (direction === "up") section.parentNode.insertBefore(section, sibling);
    else section.parentNode.insertBefore(sibling, section);

    const main = document.querySelector("main");
    pageData().sectionOrder = [...main.children]
      .filter(element => element.tagName === "SECTION")
      .map(sectionKey);
    persist();
    helpers.toast("Orden de las secciones guardado.");
  }

  function rgbToHex(value) {
    if (!value || value.startsWith("#")) return value || "#14213d";
    const parts = value.match(/\d+/g);
    if (!parts || parts.length < 3) return "#14213d";
    return `#${parts.slice(0,3).map(number => Number(number).toString(16).padStart(2,"0")).join("")}`;
  }

  function bindDocumentEditing() {
    document.addEventListener("click", event => {
      if (!active) return;

      const sectionButton = event.target.closest("[data-inline-section]");
      const moveButton = event.target.closest("[data-inline-move]");
      const entityButton = event.target.closest("[data-inline-entity]");
      const editableAction = event.target.closest(".admin-inline-text");

      if (sectionButton || moveButton || entityButton || (editableAction && editableAction.matches("a,button,.button"))) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (sectionButton) openSectionInspector(sectionButton.closest("section"));
        if (moveButton) moveSection(moveButton.closest("section"), moveButton.dataset.inlineMove);
        if (entityButton) openEntityInspector(entityButton.dataset.inlineEntity, entityButton.dataset.entityId, entityButton.dataset.entityYear);
      }
    }, true);

    document.addEventListener("input", event => {
      const editable = event.target.closest(".admin-inline-text");
      if (!active || !editable) return;
      const key = contentKey(editable);
      state.content[key] = editable.innerHTML;
      persist();
    });

    document.addEventListener("keydown", event => {
      const editable = event.target.closest(".admin-inline-text");
      if (!active || !editable) return;
      if (event.key === "Escape") editable.blur();
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") editable.blur();
    });

    document.addEventListener("click", event => {
      if (!active) return;

      const sectionButton = event.target.closest("[data-inline-section]");
      if (sectionButton) {
        event.preventDefault();
        event.stopPropagation();
        openSectionInspector(sectionButton.closest("section"));
        return;
      }

      const moveButton = event.target.closest("[data-inline-move]");
      if (moveButton) {
        event.preventDefault();
        event.stopPropagation();
        moveSection(moveButton.closest("section"), moveButton.dataset.inlineMove);
        return;
      }

      const entityButton = event.target.closest("[data-inline-entity]");
      if (entityButton) {
        event.preventDefault();
        event.stopPropagation();
        openEntityInspector(entityButton.dataset.inlineEntity, entityButton.dataset.entityId, entityButton.dataset.entityYear);
        return;
      }

      const image = event.target.closest(".admin-inline-image");
      if (image) {
        event.preventDefault();
        event.stopPropagation();
        openImageInspector(image);
        return;
      }

      const editable = event.target.closest(".admin-inline-text");
      if (editable) {
        if (editable.matches("a,button,.button")) {
          event.preventDefault();
          event.stopPropagation();
        }
        if (event.altKey) {
          event.preventDefault();
          openTextInspector(editable);
        }
      }
    });
  }

  function init() {
    applySavedContent();
    applySectionOrder();
    applySectionStyles();
    renderCustomBlocks();
    applyBanner();
    applyPublicationState();
    bindDocumentEditing();

    window.addEventListener("portal:rendered", () => {
      applySavedContent();
      applySectionOrder();
      applySectionStyles();
      renderCustomBlocks();
      if (active) decorate();
    });
  }

  window.InlineAdmin = { init, activate, deactivate, decorate, openEntityEditor:openEntityInspector };
})();
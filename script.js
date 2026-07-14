const yearData = {
  "2025": { status:"VIGENCIA PUBLICADA", title:"Rendición de Cuentas 2025", description:"Consulte el informe central, la presentación pública, los anexos técnicos, las respuestas ciudadanas y el seguimiento a compromisos.", docs:18, videos:6, commitments:24 },
  "2026": { status:"VIGENCIA EN CONSTRUCCIÓN", title:"Rendición de Cuentas 2026", description:"Espacio de preparación, avances periódicos, evidencias y documentos que alimentarán la próxima rendición.", docs:7, videos:2, commitments:9 },
  "2027": { status:"VIGENCIA PROGRAMADA", title:"Rendición de Cuentas 2027", description:"Estructura lista para incorporar información, documentos, indicadores y espacios de participación de la vigencia.", docs:0, videos:0, commitments:0 },
  "2028": { status:"VIGENCIA PROGRAMADA", title:"Rendición de Cuentas 2028", description:"Nueva edición histórica preparada para crecer sin modificar la arquitectura general del portal.", docs:0, videos:0, commitments:0 },
  "historico": { status:"MEMORIA INSTITUCIONAL", title:"Archivo histórico", description:"Consulta consolidada de todas las vigencias, documentos, compromisos, indicadores y contenidos publicados.", docs:25, videos:8, commitments:33 }
};

document.querySelectorAll(".year-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".year-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const item = yearData[tab.dataset.year];
    document.querySelector(".year-status").textContent = item.status;
    document.querySelector("#yearTitle").textContent = item.title;
    document.querySelector("#yearDescription").textContent = item.description;
    document.querySelector("#docsCount").textContent = item.docs;
    document.querySelector("#videoCount").textContent = item.videos;
    document.querySelector("#commitmentCount").textContent = item.commitments;
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add("visible");
  });
},{threshold:.12});
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

const counters = document.querySelectorAll(".counter");
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(!entry.isIntersecting || entry.target.dataset.done) return;
    entry.target.dataset.done = "true";
    const target = Number(entry.target.dataset.target);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 45));
    const timer = setInterval(() => {
      current += step;
      if(current >= target){ current = target; clearInterval(timer); }
      entry.target.textContent = current;
    }, 24);
  });
},{threshold:.6});
counters.forEach(c => counterObserver.observe(c));

const resourceSearch = document.querySelector("#resourceSearch");
const yearFilter = document.querySelector("#yearFilter");
const typeFilter = document.querySelector("#typeFilter");
const cards = [...document.querySelectorAll(".resource-card")];
const emptyState = document.querySelector("#emptyState");

function filterResources(){
  const q = resourceSearch.value.toLowerCase().trim();
  const y = yearFilter.value;
  const t = typeFilter.value;
  let visible = 0;
  cards.forEach(card => {
    const okQ = !q || card.dataset.search.includes(q);
    const okY = y === "all" || card.dataset.year === y;
    const okT = t === "all" || card.dataset.type === t;
    const show = okQ && okY && okT;
    card.style.display = show ? "grid" : "none";
    if(show) visible++;
  });
  emptyState.style.display = visible ? "none" : "block";
}
[resourceSearch,yearFilter,typeFilter].forEach(el => el.addEventListener("input",filterResources));

const searchModal = document.querySelector("#searchModal");
document.querySelector("#searchTrigger").addEventListener("click",()=>searchModal.showModal());
document.querySelector("#modalClose").addEventListener("click",()=>searchModal.close());
document.querySelectorAll(".search-suggestions button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelector("#globalSearch").value = btn.dataset.query;
  });
});
document.querySelector("#globalSearch").addEventListener("keydown",e=>{
  if(e.key === "Enter"){
    resourceSearch.value = e.target.value;
    filterResources();
    searchModal.close();
    document.querySelector("#repositorio").scrollIntoView({behavior:"smooth"});
  }
});

const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector("#mainNav");
menuToggle.addEventListener("click",()=>{
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded",String(open));
});
mainNav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>mainNav.classList.remove("open")));

window.addEventListener("scroll",()=>{
  const max = document.documentElement.scrollHeight - innerHeight;
  document.querySelector("#readingProgress").style.width = `${(scrollY/max)*100}%`;
});

document.querySelector("#participationForm").addEventListener("submit",e=>{
  e.preventDefault();
  document.querySelector("#formMessage").textContent = "Participación registrada en esta demostración.";
  e.target.reset();
});
document.querySelector("#newsletterForm").addEventListener("submit",e=>{
  e.preventDefault();
  alert("Suscripción registrada en esta demostración.");
  e.target.reset();
});
document.querySelector("#currentYear").textContent = new Date().getFullYear();

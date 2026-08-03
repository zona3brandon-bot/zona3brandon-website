const cfg = window.ZONA3B_PUBLIC_CONFIG;

const productData = [
  {name:"Teléfonos", category:"Tecnología", icon:"📱", description:"Equipos móviles y opciones para diferentes presupuestos."},
  {name:"Accesorios", category:"Tecnología", icon:"🎧", description:"Cargadores, cables, audífonos y accesorios seleccionados."},
  {name:"Ventiladores recargables", category:"Hogar", icon:"🌀", description:"Soluciones prácticas y recargables para el hogar."},
  {name:"Bombillas y lámparas", category:"Hogar", icon:"💡", description:"Iluminación y artículos eléctricos seleccionados."},
  {name:"Aseo personal", category:"Cuidado", icon:"🧴", description:"Productos de higiene y cuidado diario."},
  {name:"Dulces y galletas", category:"Alimentos", icon:"🍪", description:"Variedad de productos para compartir y enviar."},
  {name:"Artículos para bebé", category:"Cuidado", icon:"👶", description:"Toallitas y productos esenciales seleccionados."},
  {name:"Artículos del hogar", category:"Hogar", icon:"🏠", description:"Productos prácticos para la casa y la familia."}
];

const serviceIcons = { maritime:"🚢", air:"✈️", express:"⚡" };

function whatsappUrl(message = "Hola, quiero información sobre los productos y envíos de Zona 3B Brandon.") {
  return `https://wa.me/${cfg.whatsappDigits}?text=${encodeURIComponent(message)}`;
}

function applyConfig() {
  document.getElementById("portal-link").href = cfg.portalUrl;
  document.getElementById("top-phone").href = `tel:+${cfg.phoneDigits}`;
  document.getElementById("top-phone").textContent = cfg.phoneDisplay;
  document.getElementById("contact-phone").href = `tel:+${cfg.phoneDigits}`;
  document.getElementById("phone-display").textContent = cfg.phoneDisplay;
  document.getElementById("contact-whatsapp").href = whatsappUrl();
  document.getElementById("hero-whatsapp").href = whatsappUrl();
  document.getElementById("offers-whatsapp").href = whatsappUrl("Hola, quiero conocer las promociones vigentes de Zona 3B Brandon.");
  document.getElementById("floating-whatsapp").href = whatsappUrl();
  document.getElementById("contact-map").href = cfg.mapsUrl;
  document.getElementById("address-display").textContent = cfg.address;
  document.getElementById("hours-display").textContent = cfg.hours;
}

function renderServices() {
  const entries = Object.entries(cfg.shipping);
  document.getElementById("hero-rates").innerHTML = entries.map(([key,s]) =>
    `<div><b>$${s.rate.toFixed(2)}</b><span>${s.name} / lb</span></div>`
  ).join("");

  document.getElementById("service-grid").innerHTML = entries.map(([key,s],i) => `
    <article class="service-card ${key==="air"?"featured":""} reveal">
      ${key==="air"?'<span class="badge">Más popular</span>':""}
      <div class="service-icon">${serviceIcons[key]}</div>
      <h3>${s.name}</h3>
      <div class="rate">$${s.rate.toFixed(2)} <small>/ libra</small></div>
      <p>${key==="maritime"?"La alternativa más económica para cajas y envíos sin urgencia.":key==="air"?"Buen balance entre rapidez y precio para artículos prioritarios.":"Servicio prioritario para envíos que necesitan llegar más rápido."}</p>
      <ul><li>Tiempo estimado: ${s.time}</li><li>Atención personalizada</li><li>Consulta condiciones aplicables</li></ul>
    </article>`).join("");

  const select = document.getElementById("shipping-type");
  select.innerHTML = entries.map(([key,s]) => `<option value="${key}">${s.name} — $${s.rate.toFixed(2)}/lb</option>`).join("");
}

function renderProducts(filter="Todos", search="") {
  const normalized = search.trim().toLowerCase();
  const filtered = productData.filter(p =>
    (filter==="Todos" || p.category===filter) &&
    (`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(normalized))
  );
  document.getElementById("product-grid").innerHTML = filtered.map(p => `
    <article class="product-card reveal visible">
      <div class="product-image">${p.icon}</div>
      <div class="product-body">
        <small>${p.category}</small>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <a href="${whatsappUrl(`Hola, quiero información sobre ${p.name}.`)}">Consultar disponibilidad →</a>
      </div>
    </article>`).join("") || "<p>No encontramos productos con esa búsqueda.</p>";
}

function setupFilters() {
  const categories = ["Todos", ...new Set(productData.map(p=>p.category))];
  const holder = document.getElementById("category-filters");
  holder.innerHTML = categories.map((c,i)=>`<button class="filter-button ${i===0?"active":""}" data-category="${c}">${c}</button>`).join("");
  let active = "Todos";
  holder.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if(!btn) return;
    active = btn.dataset.category;
    document.querySelectorAll(".filter-button").forEach(b=>b.classList.toggle("active", b===btn));
    renderProducts(active, document.getElementById("product-search").value);
  });
  document.getElementById("product-search").addEventListener("input", e => renderProducts(active,e.target.value));
}

function setupCalculator() {
  document.getElementById("calculator-form").addEventListener("submit", e => {
    e.preventDefault();
    const key = document.getElementById("shipping-type").value;
    const weight = Number(document.getElementById("weight").value);
    const service = cfg.shipping[key];
    const total = Number.isFinite(weight) && weight > 0 ? weight * service.rate : 0;
    document.getElementById("estimate").textContent = `$${total.toFixed(2)}`;
    document.getElementById("estimate-description").textContent =
      total > 0 ? `${weight.toFixed(1)} lb × $${service.rate.toFixed(2)} (${service.name})` : "Agrega un peso válido.";
  });
}

function setupContact() {
  document.getElementById("contact-form").addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value;
    const message = document.getElementById("message").value.trim();
    window.open(whatsappUrl(`Hola, soy ${name}. Mi teléfono es ${phone}. Consulta: ${service}. ${message}`), "_blank", "noopener");
  });
}

function setupMenu() {
  const button = document.querySelector(".menu-button");
  const menu = document.querySelector(".menu");
  button.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>menu.classList.remove("open")));
}

function setupReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
}

applyConfig();
renderServices();
setupFilters();
renderProducts();
setupCalculator();
setupContact();
setupMenu();
document.getElementById("year").textContent = new Date().getFullYear();
requestAnimationFrame(setupReveal);

const cfg = window.ZONA3B_CONFIG;
let lang = localStorage.getItem("zona3bLang") || "es";
let shipmentCounter = 0;

const translations = {
  es: {
    topbar:"📦 Envíos marítimos, aéreos y express a Cuba",navHome:"Inicio",navShipping:"Envíos",navProducts:"Productos",navCalculator:"Calculadora",navReviews:"Opiniones",navContact:"Contacto",portal:"Portal empleados",route:"Brandon, Florida → Cuba",heroTitle:"Compra aquí.<br><span>Envíalo a Cuba.</span>",heroText:"Productos, promociones y tres opciones de envío en un solo lugar, con atención personalizada para cada cliente.",calculate:"Calcular envío",whatsapp:"Escribir por WhatsApp",statShipping:"Tipos de envío",statReceipt:"Recibo unificado",statLocal:"Atención local",mainRoute:"Ruta principal",active:"Activo",clearPrices:"Precios claros",personalCare:"Atención personalizada",shippingEyebrow:"Servicios de envío",shippingTitle:"Una opción para cada necesidad",shippingSubtitle:"Compara precio, velocidad y conveniencia.",productsEyebrow:"Tienda",productsTitle:"Productos destacados",productsSubtitle:"Consulta disponibilidad y precio actual por WhatsApp.",searchPlaceholder:"Buscar productos...",calculatorEyebrow:"Calculadora avanzada",calculatorTitle:"Obtén un estimado más completo",calculatorSubtitle:"Puedes sumar caja de la tienda, cargo del sistema y aduana.",instant:"Resultado instantáneo",multiple:"Permite varios envíos",transparent:"Detalle transparente",addShipment:"Agregar otro envío",storeBox:"Agregar caja de la tienda",shippingSubtotal:"Subtotal envíos",systemFee:"Cargo del sistema",boxFee:"Caja",estimatedTotal:"Total estimado",estimateNote:"Estimado informativo. La aduana no se calcula en la página pública porque puede variar; confirma siempre el total final con la tienda.",offersEyebrow:"Promociones",offersTitle:"Ofertas nuevas durante todo el mes",offersText:"Pregunta por teléfonos, ventiladores recargables, cajas y productos para el hogar.",seeOffers:"Ver promociones",reviewsEyebrow:"Opiniones",reviewsTitle:"Lo que valoran nuestros clientes",contactEyebrow:"Contacto",contactTitle:"Visítanos en Brandon",contactText:"Confirma horarios, disponibilidad y precios antes de visitar la tienda.",phone:"Teléfono",writeNow:"Escríbenos ahora",address:"Dirección",hours:"Horario",requestInfo:"Solicita información",name:"Nombre",service:"Servicio",message:"Mensaje",sendWhatsapp:"Enviar por WhatsApp",maritimeOption:"Envío marítimo",airOption:"Envío aéreo",expressOption:"Envío express",productsOption:"Productos y promociones",important:"Información importante:",importantText:"Los precios y tiempos pueden variar por destino, aduana, transportación y otras condiciones.",weight:"Peso (lb)",type:"Tipo de envío",remove:"Eliminar",all:"Todos",technology:"Tecnología",home:"Hogar",care:"Cuidado",food:"Alimentos"
  },
  en: {
    topbar:"📦 Maritime, air and express shipping to Cuba",navHome:"Home",navShipping:"Shipping",navProducts:"Products",navCalculator:"Calculator",navReviews:"Reviews",navContact:"Contact",portal:"Employee portal",route:"Brandon, Florida → Cuba",heroTitle:"Shop here.<br><span>Send it to Cuba.</span>",heroText:"Products, promotions and three shipping options in one place, with personalized service for every customer.",calculate:"Calculate shipping",whatsapp:"Message us on WhatsApp",statShipping:"Shipping types",statReceipt:"Unified receipt",statLocal:"Local service",mainRoute:"Main route",active:"Active",clearPrices:"Clear pricing",personalCare:"Personalized service",shippingEyebrow:"Shipping services",shippingTitle:"An option for every need",shippingSubtitle:"Compare price, speed and convenience.",productsEyebrow:"Store",productsTitle:"Featured products",productsSubtitle:"Check current availability and pricing through WhatsApp.",searchPlaceholder:"Search products...",calculatorEyebrow:"Advanced calculator",calculatorTitle:"Get a more complete estimate",calculatorSubtitle:"You can add store box, system fee and customs.",instant:"Instant result",multiple:"Supports multiple shipments",transparent:"Transparent breakdown",addShipment:"Add another shipment",storeBox:"Add store box",shippingSubtotal:"Shipping subtotal",systemFee:"System fee",boxFee:"Box",estimatedTotal:"Estimated total",estimateNote:"Informational estimate. Customs is not calculated on the public website because it may vary; always confirm the final amount with the store.",offersEyebrow:"Promotions",offersTitle:"New offers throughout the month",offersText:"Ask about phones, rechargeable fans, boxes and home products.",seeOffers:"See promotions",reviewsEyebrow:"Reviews",reviewsTitle:"What our customers value",contactEyebrow:"Contact",contactTitle:"Visit us in Brandon",contactText:"Confirm hours, availability and pricing before visiting.",phone:"Phone",writeNow:"Message us now",address:"Address",hours:"Hours",requestInfo:"Request information",name:"Name",service:"Service",message:"Message",sendWhatsapp:"Send through WhatsApp",maritimeOption:"Maritime shipping",airOption:"Air shipping",expressOption:"Express shipping",productsOption:"Products and promotions",important:"Important information:",importantText:"Prices and timelines may vary because of destination, customs, transportation and other conditions.",weight:"Weight (lb)",type:"Shipping type",remove:"Remove",all:"All",technology:"Technology",home:"Home",care:"Care",food:"Food"
  }
};

const products = [
  {nameEs:"Teléfonos",nameEn:"Phones",cat:"technology",icon:"📱",descEs:"Equipos móviles para diferentes presupuestos.",descEn:"Mobile devices for different budgets."},
  {nameEs:"Accesorios",nameEn:"Accessories",cat:"technology",icon:"🎧",descEs:"Cargadores, cables, audífonos y más.",descEn:"Chargers, cables, headphones and more."},
  {nameEs:"Ventiladores recargables",nameEn:"Rechargeable fans",cat:"home",icon:"🌀",descEs:"Soluciones prácticas para el hogar.",descEn:"Practical solutions for the home."},
  {nameEs:"Bombillas y lámparas",nameEn:"Bulbs and lamps",cat:"home",icon:"💡",descEs:"Iluminación y artículos eléctricos.",descEn:"Lighting and electrical items."},
  {nameEs:"Aseo personal",nameEn:"Personal care",cat:"care",icon:"🧴",descEs:"Productos de higiene y cuidado diario.",descEn:"Daily hygiene and care products."},
  {nameEs:"Dulces y galletas",nameEn:"Candy and cookies",cat:"food",icon:"🍪",descEs:"Productos seleccionados para compartir.",descEn:"Selected products to share."},
  {nameEs:"Artículos para bebé",nameEn:"Baby products",cat:"care",icon:"👶",descEs:"Toallitas y esenciales seleccionados.",descEn:"Wipes and selected essentials."},
  {nameEs:"Artículos del hogar",nameEn:"Home items",cat:"home",icon:"🏠",descEs:"Productos útiles para la casa.",descEn:"Useful products for the home."}
];

function t(key){ return translations[lang][key] || key; }
function wa(message){ return `https://wa.me/${cfg.store.whatsappDigits}?text=${encodeURIComponent(message)}`; }

function applyStaticConfig(){
  document.getElementById("portal-link").href = cfg.store.portalUrl;
  document.getElementById("top-phone").href = `tel:+${cfg.store.phoneDigits}`;
  document.getElementById("top-phone").textContent = cfg.store.phoneDisplay;
  document.getElementById("contact-phone").href = `tel:+${cfg.store.phoneDigits}`;
  document.getElementById("phone-display").textContent = cfg.store.phoneDisplay;
  document.getElementById("contact-whatsapp").href = wa("Hola, quiero información sobre Zona 3B Brandon.");
  document.getElementById("hero-whatsapp").href = wa("Hola, quiero información sobre envíos y productos.");
  document.getElementById("offers-whatsapp").href = wa("Hola, quiero conocer las promociones vigentes.");
  document.getElementById("floating-whatsapp").href = wa("Hola, quiero información.");
  document.getElementById("contact-map").href = cfg.store.mapsUrl;
  document.getElementById("address-display").textContent = cfg.store.address;
  document.getElementById("hours-display").textContent = cfg.store.hours;
}

function applyLanguage(){
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=t(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-html]").forEach(el=>el.innerHTML=t(el.dataset.i18nHtml));
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));
  document.getElementById("lang-toggle").textContent = lang==="es" ? "EN" : "ES";
  renderShipping();
  renderProducts(currentCategory,currentSearch);
  renderReviews();
  refreshShipmentLabels();
}

function renderShipping(){
  const entries = Object.entries(cfg.rates);
  document.getElementById("hero-rates").innerHTML = entries.map(([key,s])=>`<div><b>$${s.rate.toFixed(2)}</b><span>${lang==="es"?s.labelEs:s.labelEn} / lb</span></div>`).join("");
  document.getElementById("shipping-grid").innerHTML = entries.map(([key,s])=>`
    <article class="shipping-card ${key==="air"?"featured":""} reveal visible">
      ${key==="air"?`<span class="badge">${lang==="es"?"Más popular":"Most popular"}</span>`:""}
      <div class="icon">${key==="maritime"?"🚢":key==="air"?"✈️":"⚡"}</div>
      <h3>${lang==="es"?s.labelEs:s.labelEn}</h3>
      <div class="rate">$${s.rate.toFixed(2)} <small>/ lb</small></div>
      <p>${lang==="es"?"Tiempo estimado":"Estimated time"}: ${lang==="es"?s.etaEs:s.etaEn}</p>
      <ul><li>${lang==="es"?"Atención personalizada":"Personalized service"}</li><li>${lang==="es"?"Consulta condiciones aplicables":"Ask about applicable conditions"}</li></ul>
    </article>`).join("");
}

let currentCategory = "all", currentSearch = "";
function renderProducts(category="all",search=""){
  currentCategory=category; currentSearch=search;
  const filtered=products.filter(p=>(category==="all"||p.cat===category)&&(`${p.nameEs} ${p.nameEn} ${p.descEs} ${p.descEn}`.toLowerCase().includes(search.toLowerCase())));
  document.getElementById("product-grid").innerHTML=filtered.map(p=>`
    <article class="product-card">
      <div class="product-image">${p.icon}</div>
      <div class="product-body">
        <small>${t(p.cat)}</small>
        <h3>${lang==="es"?p.nameEs:p.nameEn}</h3>
        <p>${lang==="es"?p.descEs:p.descEn}</p>
        <a href="${wa(`${lang==="es"?"Hola, quiero información sobre":"Hello, I want information about"} ${lang==="es"?p.nameEs:p.nameEn}.`)}">${lang==="es"?"Consultar disponibilidad":"Check availability"} →</a>
      </div>
    </article>`).join("");
}

function setupFilters(){
  const cats=["all","technology","home","care","food"];
  document.getElementById("category-filters").innerHTML=cats.map((c,i)=>`<button class="filter-button ${i===0?"active":""}" data-cat="${c}">${t(c)}</button>`).join("");
  document.getElementById("category-filters").addEventListener("click",e=>{
    const b=e.target.closest("button"); if(!b)return;
    document.querySelectorAll(".filter-button").forEach(x=>x.classList.toggle("active",x===b));
    renderProducts(b.dataset.cat,document.getElementById("product-search").value);
  });
  document.getElementById("product-search").addEventListener("input",e=>renderProducts(currentCategory,e.target.value));
}

function addShipment(){
  shipmentCounter++;
  const row=document.createElement("div");
  row.className="shipment-row";
  row.dataset.id=shipmentCounter;
  row.innerHTML=`
    <label><span class="type-label">${t("type")}</span>
      <select class="shipment-type">
        ${Object.entries(cfg.rates).map(([key,s])=>`<option value="${key}">${lang==="es"?s.labelEs:s.labelEn} — $${s.rate.toFixed(2)}/lb</option>`).join("")}
      </select>
    </label>
    <label><span class="weight-label">${t("weight")}</span><input class="shipment-weight" type="number" min="0" step="0.1" value="0"></label>
    <button class="remove-shipment" type="button" title="${t("remove")}">×</button>`;
  document.getElementById("shipment-list").appendChild(row);
  row.querySelectorAll("select,input").forEach(el=>el.addEventListener("input",calculateTotal));
  row.querySelector(".remove-shipment").addEventListener("click",()=>{row.remove();calculateTotal();});
  calculateTotal();
}

function refreshShipmentLabels(){
  document.querySelectorAll(".type-label").forEach(x=>x.textContent=t("type"));
  document.querySelectorAll(".weight-label").forEach(x=>x.textContent=t("weight"));
  document.querySelectorAll(".shipment-type").forEach(select=>{
    const current=select.value;
    select.innerHTML=Object.entries(cfg.rates).map(([key,s])=>`<option value="${key}">${lang==="es"?s.labelEs:s.labelEn} — $${s.rate.toFixed(2)}/lb</option>`).join("");
    select.value=current;
  });
}

function calculateTotal(){
  let subtotal=0,count=0;
  document.querySelectorAll(".shipment-row").forEach(row=>{
    const key=row.querySelector(".shipment-type").value;
    const weight=Number(row.querySelector(".shipment-weight").value)||0;
    if(weight>0) count++;
    subtotal+=weight*cfg.rates[key].rate;
  });
  const system=count*cfg.fees.systemPerShipment;
  const box=document.getElementById("store-box").checked?cfg.fees.storeBox:0;
  const total=subtotal+system+box;
  const money=n=>`$${n.toFixed(2)}`;
  document.getElementById("shipping-subtotal").textContent=money(subtotal);
  document.getElementById("system-fee").textContent=money(system);
  document.getElementById("box-fee").textContent=money(box);
  document.getElementById("grand-total").textContent=money(total);
}

function renderReviews(){
  document.getElementById("review-grid").innerHTML=cfg.reviews.map(r=>`
    <article class="review-card reveal visible">
      <div class="stars">${"★".repeat(r.stars)}</div>
      <p>“${lang==="es"?r.textEs:r.textEn}”</p>
      <strong>${r.name}</strong>
    </article>`).join("");
}

function setupTheme(){
  const saved=localStorage.getItem("zona3bTheme")||"light";
  document.documentElement.dataset.theme=saved;
  document.getElementById("theme-toggle").addEventListener("click",()=>{
    const next=document.documentElement.dataset.theme==="light"?"dark":"light";
    document.documentElement.dataset.theme=next;
    localStorage.setItem("zona3bTheme",next);
  });
}

function setupMenu(){
  const b=document.querySelector(".menu-button"),m=document.querySelector(".menu");
  b.addEventListener("click",()=>{const open=m.classList.toggle("open");b.setAttribute("aria-expanded",String(open));});
  m.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>m.classList.remove("open")));
}

function setupContact(){
  document.getElementById("contact-form").addEventListener("submit",e=>{
    e.preventDefault();
    const msg=`${lang==="es"?"Hola, soy":"Hello, I am"} ${document.getElementById("name").value}. ${lang==="es"?"Mi teléfono es":"My phone is"} ${document.getElementById("phone").value}. ${document.getElementById("service").value}: ${document.getElementById("message").value}`;
    window.open(wa(msg),"_blank","noopener");
  });
}

function setupReveal(){
  const o=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");o.unobserve(e.target)}}),{threshold:.12});
  document.querySelectorAll(".reveal").forEach(x=>o.observe(x));
}

function animateCounters(){
  document.querySelectorAll(".counter").forEach(el=>{
    const target=Number(el.dataset.target),suffix=el.dataset.suffix||"";
    let current=0;
    const step=Math.max(1,Math.ceil(target/35));
    const timer=setInterval(()=>{current=Math.min(target,current+step);el.textContent=current+suffix;if(current>=target)clearInterval(timer)},35);
  });
}

applyStaticConfig();
setupFilters();
renderShipping();
renderProducts();
renderReviews();
addShipment();
document.getElementById("add-shipment").addEventListener("click",addShipment);
document.getElementById("store-box").addEventListener("change",calculateTotal);
document.getElementById("lang-toggle").addEventListener("click",()=>{lang=lang==="es"?"en":"es";localStorage.setItem("zona3bLang",lang);applyLanguage();});
setupTheme();setupMenu();setupContact();applyLanguage();
document.getElementById("year").textContent=new Date().getFullYear();
requestAnimationFrame(()=>{setupReveal();animateCounters();});

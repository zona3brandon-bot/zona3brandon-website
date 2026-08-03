const cfg = window.ZONA3B_SITE;
let currentType = "maritime";

function money(n){ return `$${n.toFixed(2)}`; }
function wa(text){ return `https://wa.me/${cfg.whatsappDigits}?text=${encodeURIComponent(text)}`; }

function initLinks(){
  document.getElementById("portal-link").href = cfg.portalUrl;
  document.getElementById("top-phone").href = `tel:+${cfg.phoneDigits}`;
  document.getElementById("top-whatsapp").href = wa("Hola, quiero información sobre Zona 3B Brandon.");
  document.getElementById("hero-whatsapp").href = wa("Hola, quiero información sobre productos y envíos.");
  document.getElementById("products-whatsapp").href = wa("Hola, quiero conocer los productos disponibles.");
  document.getElementById("offers-whatsapp").href = wa("Hola, quiero conocer las ofertas vigentes.");
  document.getElementById("floating-whatsapp").href = wa("Hola, quiero información.");
  document.getElementById("map-link").href = cfg.mapsUrl;
  document.getElementById("address-1").textContent = cfg.addressLine1;
  document.getElementById("address-2").textContent = cfg.addressLine2;
}

function renderTabs(){
  const holder = document.getElementById("ship-tabs");
  holder.innerHTML = Object.entries(cfg.rates).map(([key,item]) =>
    `<button class="ship-tab ${key===currentType?"active":""}" data-type="${key}">${item.icon} ${item.label}</button>`
  ).join("");
  holder.addEventListener("click", e => {
    const btn = e.target.closest(".ship-tab");
    if(!btn) return;
    currentType = btn.dataset.type;
    document.querySelectorAll(".ship-tab").forEach(b=>b.classList.toggle("active", b===btn));
    calculate();
  });
}

function calculate(){
  const pounds = Number(document.getElementById("pounds").value) || 0;
  const shipping = pounds * cfg.rates[currentType].rate;
  const box = document.getElementById("store-box").checked ? cfg.storeBoxFee : 0;
  const total = shipping + cfg.systemFee + box;
  document.getElementById("shipping-label").textContent = `Envío (${cfg.rates[currentType].label})`;
  document.getElementById("shipping-cost").textContent = money(shipping);
  document.getElementById("system-cost").textContent = money(cfg.systemFee);
  document.getElementById("box-cost").textContent = money(box);
  document.getElementById("total-cost").textContent = money(total);
}

function setupMenu(){
  const btn = document.querySelector(".menu-btn");
  const menu = document.querySelector(".menu");
  btn.addEventListener("click", ()=>{
    const open = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>menu.classList.remove("open")));
}

initLinks();
renderTabs();
calculate();
document.getElementById("pounds").addEventListener("input", calculate);
document.getElementById("store-box").addEventListener("change", calculate);
setupMenu();

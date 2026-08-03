const cfg = window.ZONA3B_SITE;
let currentType = "maritime";

const money = value => `$${value.toFixed(2)}`;
const whatsappUrl = message => `https://wa.me/${cfg.whatsappDigits}?text=${encodeURIComponent(message)}`;

function setupLinks() {
  document.getElementById("portal-link").href = cfg.portalUrl;
  document.getElementById("top-phone").href = `tel:+${cfg.phoneDigits}`;
  document.getElementById("top-whatsapp").href = whatsappUrl("Hola, quiero información sobre Zona 3B Brandon.");
  document.getElementById("hero-whatsapp").href = whatsappUrl("Hola, quiero información sobre productos y envíos.");
  document.getElementById("products-whatsapp").href = whatsappUrl("Hola, quiero conocer los productos disponibles.");
  document.getElementById("offers-whatsapp").href = whatsappUrl("Hola, quiero conocer las ofertas vigentes.");
  document.getElementById("boxes-whatsapp").href = whatsappUrl("Hola, quiero información sobre las ofertas de cajas 12x12x12, 14x14x14, 16x16x16 y 18x18x18.");
  document.getElementById("floating-whatsapp").href = whatsappUrl("Hola, quiero información.");
  document.getElementById("map-link").href = cfg.mapsUrl;
  document.getElementById("address-1").textContent = cfg.addressLine1;
  document.getElementById("address-2").textContent = cfg.addressLine2;
}

function renderTabs() {
  const holder = document.getElementById("ship-tabs");
  holder.innerHTML = Object.entries(cfg.rates).map(([key, item]) =>
    `<button class="ship-tab ${key === currentType ? "active" : ""}" data-type="${key}">${item.icon} ${item.label}</button>`
  ).join("");

  holder.addEventListener("click", event => {
    const button = event.target.closest(".ship-tab");
    if (!button) return;
    currentType = button.dataset.type;
    document.querySelectorAll(".ship-tab").forEach(tab => tab.classList.toggle("active", tab === button));
    calculate();
  });
}

function calculate() {
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


function setupCarousel() {
  const track = document.getElementById("carousel-track");
  if (!track) return;
  const slides = Array.from(track.children);
  const dotsHolder = document.getElementById("carousel-dots");
  const prev = document.getElementById("carousel-prev");
  const next = document.getElementById("carousel-next");
  let index = 0;
  let timer;

  function visibleSlides() {
    if (window.innerWidth <= 680) return 1;
    if (window.innerWidth <= 1000) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, slides.length - visibleSlides());
  }

  function renderDots() {
    dotsHolder.innerHTML = "";
    for (let i = 0; i <= maxIndex(); i++) {
      const dot = document.createElement("button");
      dot.className = `carousel-dot ${i === index ? "active" : ""}`;
      dot.setAttribute("aria-label", `Ir a oferta ${i + 1}`);
      dot.addEventListener("click", () => {
        index = i;
        update();
        restart();
      });
      dotsHolder.appendChild(dot);
    }
  }

  function update() {
    if (index > maxIndex()) index = maxIndex();
    const percent = 100 / visibleSlides();
    track.style.transform = `translateX(-${index * percent}%)`;
    Array.from(dotsHolder.children).forEach((dot, i) => dot.classList.toggle("active", i === index));
  }

  function goNext() {
    index = index >= maxIndex() ? 0 : index + 1;
    update();
  }

  function goPrev() {
    index = index <= 0 ? maxIndex() : index - 1;
    update();
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(goNext, 3500);
  }

  next.addEventListener("click", () => { goNext(); restart(); });
  prev.addEventListener("click", () => { goPrev(); restart(); });
  window.addEventListener("resize", () => { renderDots(); update(); });

  let startX = 0;
  track.addEventListener("touchstart", e => startX = e.touches[0].clientX, {passive:true});
  track.addEventListener("touchend", e => {
    const delta = e.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 45) delta < 0 ? goNext() : goPrev();
    restart();
  }, {passive:true});

  renderDots();
  update();
  restart();
}

function setupMenu() {
  const button = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");
  button.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => menu.classList.remove("open")));
}

setupLinks();
renderTabs();
calculate();
document.getElementById("pounds").addEventListener("input", calculate);
document.getElementById("store-box").addEventListener("change", calculate);
setupMenu();
setupCarousel();

document.querySelectorAll(".box-slide img").forEach((img) => {
  img.addEventListener("error", () => {
    img.style.display = "none";
    const fallback = document.createElement("div");
    fallback.className = "product-visual";
    fallback.style.height = "280px";
    fallback.style.fontSize = "90px";
    fallback.textContent = "📦";
    img.parentElement.insertBefore(fallback, img);
  }, { once: true });
});

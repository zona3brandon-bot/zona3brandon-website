const cfg = window.ZONA3B_SITE;
let currentType = "maritime";
const money = value => `$${value.toFixed(2)}`;
const wa = message => `https://wa.me/${cfg.whatsappDigits}?text=${encodeURIComponent(message)}`;

function setupLinks(){
  document.getElementById("portal-link").href = cfg.portalUrl;
  document.getElementById("top-phone").href = `tel:+${cfg.phoneDigits}`;
  document.getElementById("top-whatsapp").href = wa("Hola, quiero información sobre Zona 3B Brandon.");
  document.getElementById("hero-whatsapp").href = wa("Hola, quiero información sobre productos y envíos.");
  document.getElementById("products-whatsapp").href = wa("Hola, quiero conocer los productos disponibles.");
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
    document.querySelectorAll(".ship-tab").forEach(tab => tab.classList.toggle("active", tab===btn));
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
  const button = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");
  button.addEventListener("click", ()=>{
    const open = menu.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", ()=>menu.classList.remove("open")));
}

function setupCarousel(){
  const track = document.getElementById("carousel-track");
  const slides = [...track.children];
  const dots = document.getElementById("carousel-dots");
  const prev = document.getElementById("carousel-prev");
  const next = document.getElementById("carousel-next");
  let index = 0;
  let timer;

  const visible = () => window.innerWidth <= 680 ? 1 : window.innerWidth <= 1120 ? 2 : 4;
  const maxIndex = () => Math.max(0, slides.length - visible());

  function renderDots(){
    dots.innerHTML = "";
    for(let i=0;i<=maxIndex();i++){
      const d = document.createElement("button");
      d.className = `carousel-dot ${i===index?"active":""}`;
      d.addEventListener("click",()=>{index=i;update();restart();});
      dots.appendChild(d);
    }
  }

  function update(){
    if(index>maxIndex()) index=maxIndex();
    const percent=100/visible();
    track.style.transform=`translateX(-${index*percent}%)`;
    [...dots.children].forEach((d,i)=>d.classList.toggle("active",i===index));
  }

  function nextSlide(){index=index>=maxIndex()?0:index+1;update();}
  function prevSlide(){index=index<=0?maxIndex():index-1;update();}
  function restart(){clearInterval(timer);timer=setInterval(nextSlide,3500);}

  next.addEventListener("click",()=>{nextSlide();restart();});
  prev.addEventListener("click",()=>{prevSlide();restart();});
  window.addEventListener("resize",()=>{renderDots();update();});

  renderDots();
  update();
  restart();
}

setupLinks();
renderTabs();
calculate();
setupMenu();
setupCarousel();
document.getElementById("pounds").addEventListener("input",calculate);
document.getElementById("store-box").addEventListener("change",calculate);

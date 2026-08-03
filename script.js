const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

document.getElementById('shipping-calculator')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const rate = Number(document.getElementById('shipping-type').value);
  const weight = Number(document.getElementById('shipping-weight').value);
  const total = Number.isFinite(weight) && weight > 0 ? rate * weight : 0;
  document.getElementById('calculator-result').innerHTML =
    `Estimado: <strong>$${total.toFixed(2)}</strong>`;
});

document.getElementById('contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('contact-name').value.trim();
  const phone = document.getElementById('contact-phone').value.trim();
  const message = document.getElementById('contact-message').value.trim();

  // REEMPLAZA 10000000000 por el número real de WhatsApp, incluyendo código de país.
  const whatsappNumber = '10000000000';
  const text = encodeURIComponent(
    `Hola, soy ${name}. Mi teléfono es ${phone}. ${message}`
  );
  window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank', 'noopener');
});

document.getElementById('year').textContent = new Date().getFullYear();

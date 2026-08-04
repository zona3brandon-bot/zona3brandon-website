(() => {
  const categories = ["Todos", "Alimentos", "Aseo Personal", "Hogar", "Farmacia", "Electrónica", "Perfumería"];
  const products = Array.isArray(window.ZONA3B_PRODUCTOS) ? window.ZONA3B_PRODUCTOS : [];
  const filterWrap = document.getElementById('category-filter');
  const grid = document.getElementById('product-grid');
  const title = document.getElementById('products-title');
  const count = document.getElementById('products-count');
  const search = document.getElementById('product-search');
  let active = 'Todos';

  function renderFilters(){
    filterWrap.innerHTML = categories.map(c => `<button type="button" class="${c===active?'active':''}" data-category="${c}">${c}</button>`).join('');
  }

  function renderProducts(){
    const term = (search.value || '').trim().toLowerCase();
    const visible = products.filter(p => (active === 'Todos' || p.categoria === active) && (!term || `${p.nombre} ${p.descripcion||''}`.toLowerCase().includes(term)));
    title.textContent = active === 'Todos' ? 'Todos los productos' : active;
    count.textContent = `${visible.length} producto${visible.length === 1 ? '' : 's'}`;
    if(!visible.length){
      grid.innerHTML = `<div class="empty-products"><div class="empty-icon">🛍️</div><h3>${term ? 'No encontramos productos' : 'Productos próximamente'}</h3><p>${term ? 'Prueba con otro nombre o selecciona una categoría diferente.' : 'Esta categoría está preparada para que agregues los artículos disponibles en la tienda. Los productos se irán publicando y actualizando aquí.'}</p></div>`;
      return;
    }
    grid.innerHTML = visible.map(p => `<article class="product-card"><div class="product-image">${p.emoji || '🛍️'}</div><div class="product-info"><small>${p.categoria}</small><h3>${p.nombre}</h3><p>${p.descripcion || ''}</p>${p.precio != null ? `<strong>$${Number(p.precio).toFixed(2)}</strong>` : ''}</div></article>`).join('');
  }

  filterWrap.addEventListener('click', e => {
    const btn = e.target.closest('button[data-category]');
    if(!btn) return;
    active = btn.dataset.category;
    renderFilters(); renderProducts();
  });
  document.querySelectorAll('[data-open-category]').forEach(card => card.addEventListener('click', () => {
    active = card.dataset.openCategory;
    renderFilters(); renderProducts();
    document.getElementById('productos').scrollIntoView({behavior:'smooth'});
  }));
  search.addEventListener('input', renderProducts);
  renderFilters(); renderProducts();
})();

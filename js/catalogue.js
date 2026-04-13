/* ============================================================
   GnanaBarani Furnitures — Catalogue Page JS
   ============================================================ */

(function () {
  /* ── State ─────────────────────────────────────────────── */
  let activeCategories = new Set();
  let activeMaterials  = new Set();
  let maxPrice         = 90000;
  let searchQuery      = '';
  let sortBy           = 'default';

  /* ── Derive unique materials from PRODUCTS ─────────────── */
  const ALL_MATERIALS = [...new Set(
    PRODUCTS.map(p => p.material.split(' with ')[0].split(' &')[0].trim())
  )].sort();

  /* ── DOM refs ───────────────────────────────────────────── */
  const grid          = document.getElementById('catalogueGrid');
  const resultsCount  = document.getElementById('resultsCount');
  const searchInput   = document.getElementById('searchInput');
  const sortSelect    = document.getElementById('sortSelect');
  const priceSlider   = document.getElementById('priceSlider');
  const priceDisplay  = document.getElementById('priceDisplay');
  const priceMin      = document.getElementById('priceMin');
  const priceMax      = document.getElementById('priceMax');
  const filterDrawer  = document.getElementById('filterDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerClose   = document.getElementById('drawerClose');
  const filterToggle  = document.getElementById('filterToggleBtn');
  const drawerSlider  = document.getElementById('drawerPriceSlider');
  const drawerDisplay = document.getElementById('drawerPriceDisplay');
  const drawerApply   = document.getElementById('drawerApplyBtn');
  const drawerClear   = document.getElementById('drawerClearBtn');

  /* ── Build category checkboxes ──────────────────────────── */
  function buildCategoryFilters(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = CATEGORIES.map(cat => {
      const count = PRODUCTS.filter(p => p.category === cat.id).length;
      if (count === 0) return '';
      return `
        <label class="filter-option">
          <input type="checkbox" data-cat="${cat.id}" class="cat-check">
          <span>${cat.label}</span>
          <span class="count">${count}</span>
        </label>`;
    }).join('');
    container.querySelectorAll('.cat-check').forEach(cb => {
      if (activeCategories.has(cb.dataset.cat)) cb.checked = true;
      cb.addEventListener('change', () => {
        cb.checked ? activeCategories.add(cb.dataset.cat) : activeCategories.delete(cb.dataset.cat);
        syncCheckboxes('cat-check', activeCategories, 'cat');
        render();
      });
    });
  }

  /* ── Build material checkboxes ──────────────────────────── */
  function buildMaterialFilters(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ALL_MATERIALS.map(mat => `
      <label class="filter-option">
        <input type="checkbox" data-mat="${mat}" class="mat-check">
        <span>${mat}</span>
      </label>`).join('');
    container.querySelectorAll('.mat-check').forEach(cb => {
      if (activeMaterials.has(cb.dataset.mat)) cb.checked = true;
      cb.addEventListener('change', () => {
        cb.checked ? activeMaterials.add(cb.dataset.mat) : activeMaterials.delete(cb.dataset.mat);
        syncCheckboxes('mat-check', activeMaterials, 'mat');
        render();
      });
    });
  }

  /* ── Sync checkbox state across sidebar + drawer ─────────── */
  function syncCheckboxes(cls, activeSet, dataKey) {
    document.querySelectorAll('.' + cls).forEach(cb => {
      cb.checked = activeSet.has(cb.dataset[dataKey]);
    });
  }

  /* ── Filter & sort ──────────────────────────────────────── */
  function getFiltered() {
    let list = [...PRODUCTS];

    if (activeCategories.size > 0)
      list = list.filter(p => activeCategories.has(p.category));

    if (activeMaterials.size > 0)
      list = list.filter(p => {
        const base = p.material.split(' with ')[0].split(' &')[0].trim();
        return activeMaterials.has(base);
      });

    list = list.filter(p => p.price <= maxPrice);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'price-asc':   list.sort((a,b) => a.price - b.price);       break;
      case 'price-desc':  list.sort((a,b) => b.price - a.price);       break;
      case 'name-asc':    list.sort((a,b) => a.name.localeCompare(b.name)); break;
      case 'rating-desc': list.sort((a,b) => b.rating - a.rating);     break;
    }

    return list;
  }

  /* ── Render ─────────────────────────────────────────────── */
  function render() {
    const list = getFiltered();
    resultsCount.textContent = list.length + ' product' + (list.length !== 1 ? 's' : '');

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <h3>No products found</h3>
          <p>Try adjusting your filters or search term.</p>
          <button class="btn btn--primary" onclick="clearAll()">Clear All Filters</button>
        </div>`;
      return;
    }

    grid.innerHTML = list.map(p => buildProductCard(p)).join('');
  }

  /* ── Price slider ───────────────────────────────────────── */
  function updatePriceDisplay(val) {
    maxPrice = parseInt(val);
    const label = 'Up to ' + formatINR(maxPrice);
    if (priceDisplay)  priceDisplay.textContent  = label;
    if (drawerDisplay) drawerDisplay.textContent = label;
    if (priceMax)      priceMax.value = maxPrice;
  }

  priceSlider && priceSlider.addEventListener('input', e => {
    if (drawerSlider) drawerSlider.value = e.target.value;
    updatePriceDisplay(e.target.value);
    render();
  });
  drawerSlider && drawerSlider.addEventListener('input', e => {
    if (priceSlider) priceSlider.value = e.target.value;
    updatePriceDisplay(e.target.value);
  });

  priceMax && priceMax.addEventListener('change', e => {
    const val = Math.min(Math.max(parseInt(e.target.value) || 90000, 0), 90000);
    if (priceSlider)  priceSlider.value  = val;
    if (drawerSlider) drawerSlider.value = val;
    updatePriceDisplay(val);
    render();
  });

  /* ── Search (debounced) ─────────────────────────────────── */
  let searchTimer;
  searchInput && searchInput.addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { searchQuery = e.target.value.trim(); render(); }, 300);
  });

  /* ── Sort ───────────────────────────────────────────────── */
  sortSelect && sortSelect.addEventListener('change', e => { sortBy = e.target.value; render(); });

  /* ── Clear buttons ──────────────────────────────────────── */
  window.clearAll = function () {
    activeCategories.clear();
    activeMaterials.clear();
    maxPrice = 90000;
    searchQuery = '';
    sortBy = 'default';
    if (searchInput)  searchInput.value  = '';
    if (sortSelect)   sortSelect.value   = 'default';
    if (priceSlider)  priceSlider.value  = 90000;
    if (drawerSlider) drawerSlider.value = 90000;
    updatePriceDisplay(90000);
    syncCheckboxes('cat-check', activeCategories, 'cat');
    syncCheckboxes('mat-check', activeMaterials, 'mat');
    render();
  };

  document.getElementById('clearAllBtn')    && document.getElementById('clearAllBtn').addEventListener('click', clearAll);
  document.getElementById('clearCategory')  && document.getElementById('clearCategory').addEventListener('click', () => { activeCategories.clear(); syncCheckboxes('cat-check', activeCategories, 'cat'); render(); });
  document.getElementById('clearMaterial')  && document.getElementById('clearMaterial').addEventListener('click', () => { activeMaterials.clear();  syncCheckboxes('mat-check', activeMaterials, 'mat'); render(); });
  document.getElementById('clearPrice')     && document.getElementById('clearPrice').addEventListener('click', () => { maxPrice = 90000; if (priceSlider) priceSlider.value = 90000; if (drawerSlider) drawerSlider.value = 90000; updatePriceDisplay(90000); render(); });

  /* ── Mobile drawer ──────────────────────────────────────── */
  function openDrawer()  { filterDrawer && filterDrawer.classList.add('open');  document.body.style.overflow = 'hidden'; }
  function closeDrawer() { filterDrawer && filterDrawer.classList.remove('open'); document.body.style.overflow = ''; }
  filterToggle  && filterToggle.addEventListener('click', openDrawer);
  drawerOverlay && drawerOverlay.addEventListener('click', closeDrawer);
  drawerClose   && drawerClose.addEventListener('click', closeDrawer);
  drawerApply   && drawerApply.addEventListener('click', () => { render(); closeDrawer(); });
  drawerClear   && drawerClear.addEventListener('click', () => { clearAll(); closeDrawer(); });

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) activeCategories.add(cat);

    buildCategoryFilters('categoryFilters');
    buildCategoryFilters('drawerCategoryFilters');
    buildMaterialFilters('materialFilters');
    buildMaterialFilters('drawerMaterialFilters');

    render();
  }

  init();
})();

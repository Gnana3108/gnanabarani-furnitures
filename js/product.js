/* ============================================================
   GnanaBarani Furnitures — Product Detail Page JS
   ============================================================ */

(function () {
  const params = new URLSearchParams(window.location.search);
  const id     = parseInt(params.get('id'));
  const product = PRODUCTS.find(p => p.id === id);

  const detailEl   = document.getElementById('productDetail');
  const notFoundEl = document.getElementById('notFoundState');

  if (!product || isNaN(id)) {
    detailEl   && (detailEl.style.display   = 'none');
    notFoundEl && (notFoundEl.style.display = 'block');
    return;
  }

  /* ── Populate page title ──────────────────────────────── */
  document.title = product.name + ' – GnanaBarani Furnitures';

  /* ── Breadcrumb ─────────────────────────────────────────*/
  const bcName = document.getElementById('breadcrumbName');
  if (bcName) bcName.textContent = product.name;

  /* ── Gallery ─────────────────────────────────────────── */
  const mainImg    = document.getElementById('mainImage');
  const thumbsWrap = document.getElementById('galleryThumbs');
  const lightbox   = document.getElementById('lightbox');
  const lbImg      = document.getElementById('lightboxImg');

  // Use same image for all 4 thumbnails (single real image per product)
  const images = [product.image, product.image, product.image, product.image];
  let activeIdx = 0;

  function setMainImage(idx) {
    activeIdx = idx;
    mainImg.src = images[idx];
    mainImg.alt = product.name;
    document.querySelectorAll('.gallery-thumb').forEach((t, i) => {
      t.classList.toggle('active', i === idx);
    });
  }

  thumbsWrap.innerHTML = images.map((src, i) => `
    <div class="gallery-thumb${i === 0 ? ' active' : ''}" onclick="setThumb(${i})">
      <img src="${src}" alt="${product.name} view ${i + 1}" loading="lazy"
           onerror="this.src='https://picsum.photos/seed/${product.id}${i}/200/200'">
    </div>`).join('');

  window.setThumb = (idx) => setMainImage(idx);
  setMainImage(0);

  // Lightbox on main image click
  mainImg.style.cursor = 'zoom-in';
  mainImg.addEventListener('click', () => {
    if (lbImg)    lbImg.src = images[activeIdx];
    lightbox && lightbox.classList.add('open');
  });
  document.getElementById('lightboxClose') && document.getElementById('lightboxClose').addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox && lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('open'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lightbox && lightbox.classList.remove('open'); });

  /* ── Product Info ─────────────────────────────────────── */
  const catLabel = (CATEGORIES.find(c => c.id === product.category) || {}).label || product.category;

  document.getElementById('categoryBadge').textContent    = catLabel;
  document.getElementById('productName').textContent      = product.name;
  document.getElementById('productPrice').textContent     = formatINR(product.price);
  document.getElementById('productStars').innerHTML       = generateStars(product.rating);
  document.getElementById('productRating').textContent    = product.rating + ' / 5';
  document.getElementById('productDescription').textContent = product.description;
  document.getElementById('productDimensions').textContent = product.dimensions;
  document.getElementById('productMaterial1').textContent  = product.material;
  document.getElementById('productMaterial2').textContent  = product.material;
  document.getElementById('productCategory').textContent   = catLabel;
  document.getElementById('productWarranty').textContent   = product.warranty;

  /* ── WhatsApp button ─────────────────────────────────── */
  const waMsg = `Hi, I'm interested in your *${product.name}* (${formatINR(product.price)}). Please share more details and availability.`;
  document.getElementById('waBtn').href = `https://wa.me/919443379639?text=${encodeURIComponent(waMsg)}`;

  /* ── Tabs ────────────────────────────────────────────── */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tab = document.getElementById('tab-' + btn.dataset.tab);
      tab && tab.classList.add('active');
    });
  });

  /* ── Related Products ────────────────────────────────── */
  const related = PRODUCTS
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const relatedSection = document.getElementById('relatedSection');
  const relatedGrid    = document.getElementById('relatedGrid');

  if (related.length > 0 && relatedSection && relatedGrid) {
    relatedSection.style.display = 'block';
    relatedGrid.innerHTML = related.map(p => buildProductCard(p)).join('');
  }
})();

/* ============================================================
   GnanaBarani Furnitures — Shared JS (all pages)
   ============================================================ */

const WA_NUMBER  = '919443379639';
const WA_DEFAULT = 'Hi, I\'m interested in your furniture collection.';

/* ── Utilities ─────────────────────────────────────────────── */
function formatINR(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

function generateStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '<i class="fas fa-star"></i>'.repeat(full)
    + (half ? '<i class="fas fa-star-half-alt"></i>' : '')
    + '<i class="far fa-star"></i>'.repeat(empty);
}

function waLink(text) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

function getCategoryLabel(id) {
  const cat = (typeof CATEGORIES !== 'undefined' ? CATEGORIES : []).find(c => c.id === id);
  return cat ? cat.label : id;
}

/* ── Navigation ────────────────────────────────────────────── */
(function initNav() {
  const nav       = document.getElementById('mainNav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const overlay   = document.getElementById('mobileOverlay');
  if (!nav) return;

  // Scroll: add/remove 'scrolled' class
  const isHome = nav.classList.contains('nav--transparent');
  function onScroll() {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else if (isHome) {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  function openMenu() {
    mobileMenu && mobileMenu.classList.add('open');
    overlay    && overlay.classList.add('open');
    hamburger  && hamburger.classList.add('open');
    hamburger  && hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu && mobileMenu.classList.remove('open');
    overlay    && overlay.classList.remove('open');
    hamburger  && hamburger.classList.remove('open');
    hamburger  && hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Use both click and touchend for instant mobile response
  function addTap(el, fn) {
    if (!el) return;
    el.addEventListener('click', fn);
    el.addEventListener('touchend', function(e) {
      e.preventDefault(); // prevent ghost click delay
      fn();
    }, { passive: false });
  }

  addTap(hamburger, () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });
  addTap(overlay, closeMenu);

  // Also close menu when a mobile nav link is tapped
  document.querySelectorAll('.nav__mobile-link').forEach(link => {
    link.addEventListener('touchend', () => closeMenu(), { passive: true });
  });

  // Close on resize
  window.addEventListener('resize', () => { if (window.innerWidth > 768) closeMenu(); });

  // Active link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ── WhatsApp Floating Button ──────────────────────────────── */
(function injectWAFloat() {
  const btn = document.createElement('a');
  btn.href        = waLink(WA_DEFAULT);
  btn.target      = '_blank';
  btn.rel         = 'noopener noreferrer';
  btn.className   = 'whatsapp-float';
  btn.setAttribute('aria-label', 'Chat on WhatsApp');
  btn.innerHTML   = '<i class="fab fa-whatsapp"></i>';
  document.body.appendChild(btn);
})();

/* ── Scroll Reveal ─────────────────────────────────────────── */
(function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '1'; el.style.transform = 'none';
    });
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ── Product Card Builder (reused by index + catalogue) ────── */
function buildProductCard(p) {
  const catLabel = getCategoryLabel(p.category);
  return `
    <article class="product-card">
      <a href="product.html?id=${p.id}" class="product-card__img">
        <img src="${p.image}" alt="${p.name}" loading="lazy"
          onerror="this.src='https://picsum.photos/seed/${p.id}/400/300'">
        <span class="product-card__badge">${catLabel}</span>
      </a>
      <div class="product-card__body">
        <h3 class="product-card__name">${p.name}</h3>
        <p class="product-card__desc">${p.description}</p>
        <div class="product-card__footer">
          <div>
            <div class="product-card__price">${formatINR(p.price)}</div>
            <div class="stars">${generateStars(p.rating)}</div>
          </div>
          <a href="product.html?id=${p.id}" class="btn btn--sm btn--primary">View Details</a>
        </div>
      </div>
    </article>`;
}

/* ==========================================================================
   Chinmay Naringrekar — Portfolio · interaction layer
   Liquid Glass: theming, ambient backdrop, motion
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ---------- Ambient aurora + grain backdrop ---------- */
  // Injected once, shared by every page. The glass surfaces refract this.
  if (!document.querySelector('.aurora')) {
    var aurora = document.createElement('div');
    aurora.className = 'aurora';
    aurora.setAttribute('aria-hidden', 'true');
    aurora.innerHTML = '<span class="blob blob-1"></span><span class="blob blob-2"></span>';
    var grain = document.createElement('div');
    grain.className = 'grain';
    grain.setAttribute('aria-hidden', 'true');
    document.body.prepend(grain);
    document.body.prepend(aurora);
  }

  /* ---------- Theme toggle ---------- */
  // The no-flash inline <head> script has already set data-theme. Mirror it here.
  var STORE_KEY = 'theme';
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
  }

  var nav = document.querySelector('.nav');
  var navInner = document.querySelector('.nav-inner');
  var navToggleBtn = document.querySelector('.nav-toggle');

  if (navInner) {
    var toggle = document.createElement('button');
    toggle.className = 'theme-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Toggle dark mode');
    toggle.innerHTML =
      '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
      '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg>';
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(STORE_KEY, next); } catch (e) {}
    });
    // Insert before the hamburger so order reads: brand … links · toggle · menu
    if (navToggleBtn) navInner.insertBefore(toggle, navToggleBtn);
    else navInner.appendChild(toggle);
  }

  // Follow the system theme only while the user hasn't chosen explicitly.
  media.addEventListener('change', function (e) {
    var stored;
    try { stored = localStorage.getItem(STORE_KEY); } catch (err) {}
    if (!stored) applyTheme(e.matches ? 'dark' : 'light');
  });

  /* ---------- Mobile nav ---------- */
  if (navToggleBtn && nav) {
    navToggleBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      navToggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  /* ---------- Nav elevation on scroll ---------- */
  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 8) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Scroll reveal with directional stagger ---------- */
  var targets = document.querySelectorAll('.reveal');
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        // Stagger siblings that enter together (tiles, cards, steps…).
        var el = e.target;
        var siblings = el.parentElement
          ? Array.prototype.filter.call(el.parentElement.children, function (c) {
              return c.classList && c.classList.contains('reveal') && !c.classList.contains('in');
            })
          : [el];
        var idx = siblings.indexOf(el);
        el.style.setProperty('--reveal-delay', (idx > 0 ? Math.min(idx, 6) * 80 : 0) + 'ms');
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('in'); });
  }

  /* ---------- Pointer-tracked specular highlight ---------- */
  // Glass surfaces catch the light where the cursor is.
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduced && fine) {
    var specSelector = '.tile, .skill-card, .feature, .glass-spec, .hero-meta div, .pager a';
    var raf = 0, pending = null;
    function track(el, ev) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((ev.clientX - r.left) / r.width * 100) + '%');
      el.style.setProperty('--my', ((ev.clientY - r.top) / r.height * 100) + '%');
    }
    document.addEventListener('pointermove', function (ev) {
      var el = ev.target.closest && ev.target.closest(specSelector);
      if (!el) return;
      pending = { el: el, ev: ev };
      if (!raf) raf = requestAnimationFrame(function () {
        raf = 0;
        if (pending) track(pending.el, pending.ev);
      });
    }, { passive: true });
  }
})();

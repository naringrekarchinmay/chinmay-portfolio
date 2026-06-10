// Mobile nav toggle
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav-toggle');
if (toggle) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('.nav-links a').forEach(a =>
    a.addEventListener('click', () => nav.classList.remove('open'))
  );
}

// Scroll reveal
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const targets = document.querySelectorAll('.reveal');
if (!reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(t => io.observe(t));
} else {
  targets.forEach(t => t.classList.add('in'));
}

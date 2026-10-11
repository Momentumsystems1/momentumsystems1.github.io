(() => {
  const nav = document.querySelector('.nav');
  const hero = document.querySelector('.hero, .page-hero');
  const setNav = () => {
    const limit = hero ? hero.offsetHeight - 80 : 40;
    nav.classList.toggle('is-light', window.scrollY > limit);
  };
  setNav();
  window.addEventListener('scroll', setNav, { passive: true });

  const burger = document.querySelector('.burger');
  const menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false');
    }));
  }

  document.querySelectorAll('.info-btn').forEach(btn => {
    const pop = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !open);
      pop.hidden = open;
    });
  });

  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  document.querySelectorAll('.rv').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  const y = document.getElementById('y'); if (y) y.textContent = new Date().getFullYear();
})();

/* Portal de clientes: popup de cuenta gratuita y pestañas de ficha */
(() => {
  window.PORTAL_URL = window.PORTAL_URL || '';
  const modal = document.getElementById('modal-cuenta');
  const open = () => { if (!modal) return; modal.hidden = false; requestAnimationFrame(() => modal.classList.add('open')); modal.querySelector('.x').focus(); };
  const close = () => { if (!modal) return; modal.classList.remove('open'); setTimeout(() => { modal.hidden = true; }, 300); };
  document.querySelectorAll('.js-cuenta').forEach(a => a.addEventListener('click', e => {
    if (window.PORTAL_URL) { window.location.href = window.PORTAL_URL; return; }
    e.preventDefault(); open();
  }));
  if (modal) {
    modal.querySelector('.x').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    const pl = modal.querySelector('[data-portal-link]');
    if (pl) pl.addEventListener('click', e => { if (!window.PORTAL_URL) { e.preventDefault(); window.location.href = 'mailto:team@instaflash.net?subject=Alta%20portal%20de%20clientes'; } else pl.href = window.PORTAL_URL; });
  }
  document.querySelectorAll('.switch [role=tab]').forEach(t => t.addEventListener('click', () => {
    const list = t.closest('.switch');
    list.querySelectorAll('[role=tab]').forEach(x => { x.setAttribute('aria-selected', x === t); document.getElementById(x.getAttribute('aria-controls')).hidden = x !== t; });
  }));
})();

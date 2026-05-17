// HDH AG — Main JS v3

// ─── ANIMATED BG: inject glow orbs + blobs into all page/section heroes ──────
(function() {
  document.querySelectorAll('.page-hero, .vs-hero, .contact-hero').forEach(hero => {
    ['hero-glow-tl','hero-glow-tr','hero-glow-bl','hero-glow-br'].forEach(cls => {
      const el = document.createElement('div');
      el.className = cls;
      hero.appendChild(el);
    });
    ['phblob-1','phblob-2'].forEach(cls => {
      const el = document.createElement('div');
      el.className = 'hblob ' + cls;
      hero.appendChild(el);
    });
  });
})();

// ─── NAV: transparent top · hide on scroll-down · show on scroll-up ──────────
const nav = document.querySelector('.nav');
let lastY = 0;
let rafPending = false;

function handleNav() {
  const y = window.scrollY;

  if (y <= 10) {
    // At top — fully transparent
    nav.classList.remove('scrolled', 'nav-hidden');
  } else if (y > lastY + 5) {
    // Scrolling DOWN — hide nav
    nav.classList.add('scrolled', 'nav-hidden');
  } else if (y < lastY - 5) {
    // Scrolling UP — show frosted header
    nav.classList.add('scrolled');
    nav.classList.remove('nav-hidden');
  } else if (y > 10) {
    // Stationary but past hero — ensure scrolled is set
    nav.classList.add('scrolled');
  }

  lastY = y;
  rafPending = false;
}

// Run on load so sub-pages loaded mid-scroll get correct state
handleNav();

window.addEventListener('scroll', () => {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(handleNav);
  }
}, { passive: true });

// ─── NAV THEME: white on dark hero, dark on light sections ────────────────
function updateNavTheme() {
  const darkSections = document.querySelectorAll('.hero, .page-hero, .vs-hero, .contact-hero');
  const NAV_H = 68;
  let isOverDark = false;
  darkSections.forEach(s => {
    const r = s.getBoundingClientRect();
    if (r.top <= NAV_H && r.bottom >= 0) isOverDark = true;
  });
  nav.classList.toggle('nav-on-dark', isOverDark);
  nav.classList.toggle('nav-on-light', !isOverDark);
}
updateNavTheme();
window.addEventListener('scroll', updateNavTheme, { passive: true });

// ─── HAMBURGER ────────────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
});
navMenu?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    navMenu.classList.remove('open');
  });
});

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
  .forEach(el => revealObs.observe(el));

// ─── COUNT-UP ─────────────────────────────────────────────────────────────────
function countUp(el) {
  const raw    = el.dataset.target;
  const target = parseFloat(raw);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const dec    = raw.includes('.') ? raw.split('.')[1].length : 0;
  const dur    = 1600;
  const t0     = performance.now();

  const tick = (now) => {
    const p    = Math.min((now - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + (target * ease).toFixed(dec) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const countObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      countUp(e.target);
      countObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => countObs.observe(el));

// ─── CARD 3D TILT ─────────────────────────────────────────────────────────────
document.querySelectorAll('.feature-card, .div-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform =
      `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ─── HERO PARALLAX ────────────────────────────────────────────────────────────
const heroEl = document.querySelector('.page-hero, .vs-hero, .hero');
if (heroEl) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroEl.style.backgroundPositionY = `calc(50% + ${y * 0.25}px)`;
    }
  }, { passive: true });
}

// ─── STAGGER HERO REVEAL ON LOAD ──────────────────────────────────────────────
// Elements in the viewport on load animate immediately (don't wait for scroll)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
    .forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.1) {
        // Already visible — fire with a small delay matching transition-delay
        const delay = parseFloat(getComputedStyle(el).transitionDelay) * 1000 || 0;
        setTimeout(() => el.classList.add('in'), delay + 80);
      }
    });
});

// ─── OFFLINE LANGUAGE SWITCHER ────────────────────────────────────────────────
function applyTranslation(lang) {
  if (typeof HDH_T === 'undefined') return;
  const t = HDH_T[lang];
  if (!t) return;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });
  document.documentElement.lang = lang;
}

const langBtn  = document.getElementById('langBtn');
const langMenu = document.getElementById('langMenu');

langBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  langMenu.classList.toggle('open');
  langBtn.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.lang-switcher')) {
    langMenu?.classList.remove('open');
    langBtn?.classList.remove('open');
  }
});

langMenu?.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    const code  = btn.dataset.lang;
    const label = btn.dataset.label;
    const cur = document.getElementById('langCurrent');
    if (cur) cur.textContent = label;
    langMenu.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.lang === code));
    langMenu.classList.remove('open');
    langBtn?.classList.remove('open');
    localStorage.setItem('hdh_lang', code);
    applyTranslation(code);
  });
});

// Restore saved language on page load
const _savedLang = localStorage.getItem('hdh_lang');
if (_savedLang) {
  const cur = document.getElementById('langCurrent');
  if (cur) cur.textContent = _savedLang.toUpperCase();
  langMenu?.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.lang === _savedLang));
  if (_savedLang !== 'en') {
    document.addEventListener('DOMContentLoaded', () => applyTranslation(_savedLang));
  }
}

// ─── SCROLL PROGRESS BAR ─────────────────────────────────────────────────────
(function() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  }, { passive: true });
})();

// ─── CURSOR GLOW ─────────────────────────────────────────────────────────────
(function() {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  let cx = 0, cy = 0, mx = -999, my = -999;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  (function animate() {
    cx += (mx - cx) * 0.10;
    cy += (my - cy) * 0.10;
    glow.style.transform = `translate(${cx}px,${cy}px)`;
    requestAnimationFrame(animate);
  })();
  const sel = 'a,button,.feature-card,.div-card,.btn,.svc-card,.contact-card,.podcast-card,.dl-card';
  document.querySelectorAll(sel).forEach(el => {
    el.addEventListener('mouseenter', () => glow.classList.add('expand'));
    el.addEventListener('mouseleave', () => glow.classList.remove('expand'));
  });
})();

// ─── BUTTON RIPPLE ────────────────────────────────────────────────────────────
document.querySelectorAll('.btn').forEach(btn => {
  btn.style.overflow = 'hidden';
  btn.addEventListener('click', function(e) {
    const r = document.createElement('span');
    r.className = 'btn-ripple';
    const rect = this.getBoundingClientRect();
    r.style.left = `${e.clientX - rect.left}px`;
    r.style.top  = `${e.clientY - rect.top}px`;
    this.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });
});

// ─── MAGNETIC BUTTONS ─────────────────────────────────────────────────────────
document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
  btn.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width  / 2) * 0.20;
    const y = (e.clientY - rect.top  - rect.height / 2) * 0.20;
    this.style.transform = `translate(${x}px,${y}px)`;
  });
  btn.addEventListener('mouseleave', function() { this.style.transform = ''; });
});

// ─── STAGGER OBSERVER ─────────────────────────────────────────────────────────
const staggerObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); staggerObs.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.stagger').forEach(el => staggerObs.observe(el));

// ─── STAT COUNTER (index stats strip) ────────────────────────────────────────
document.querySelectorAll('.stat-n[data-target]').forEach(el => {
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      const raw    = el.dataset.target;
      const target = parseFloat(raw);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const dec    = raw.includes('.') ? raw.split('.')[1].length : 0;
      const dur    = 1800;
      const t0     = performance.now();
      const tick = now => {
        const p    = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + (target * ease).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(tick); else el.textContent = prefix + raw + suffix;
      };
      requestAnimationFrame(tick);
      obs.disconnect();
    }
  }, { threshold: 0.5 });
  obs.observe(el);
});

// ─── SMOOTH FOOTER SOCIAL TOOLTIP ────────────────────────────────────────────
document.querySelectorAll('.f-social-link').forEach(link => {
  const label = link.getAttribute('aria-label');
  if (!label) return;
  link.setAttribute('title', label);
});

// ─── SPEC ITEM STAGGER ────────────────────────────────────────────────────────
// Add incremental delays to spec list items when they enter view
const specObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const items = entry.target.querySelectorAll('.spec-item');
      items.forEach((item, i) => {
        setTimeout(() => item.classList.add('reveal-in'), i * 80);
      });
      specObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.spec-list').forEach(list => {
  list.querySelectorAll('.spec-item').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-16px)';
    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  specObs.observe(list);
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.spec-item').forEach(item => {
    item.classList.add = function(cls) {
      if (cls === 'reveal-in') {
        item.style.opacity = '1';
        item.style.transform = 'none';
      }
      HTMLElement.prototype.classList.add.call(item, cls);
    };
  });
});

// animations.js — Premium GSAP animation system for FinTrack

const EASE = {
  out:    'power3.out',
  inOut:  'power3.inOut',
  spring: 'elastic.out(1, 0.5)',
  back:   'back.out(1.6)',
  expo:   'expo.out',
};

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      gsap.to(window, { duration: 1.1, scrollTo: { y: target, offsetY: 72 }, ease: EASE.inOut });
    });
  });
}

function initCursorGlow() {
  const glow = document.createElement('div');
  glow.style.cssText = 'position:fixed;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(244,63,94,0.045) 0%,transparent 65%);pointer-events:none;z-index:0;transform:translate(-50%,-50%);';
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    gsap.to(glow, { x: e.clientX, y: e.clientY, duration: 0.7, ease: 'power2.out' });
  });
}

function initPageEntrance() {
  const tl = gsap.timeline({ defaults: { ease: EASE.out } });
  tl.from('.page-header h1', { y: 22, opacity: 0, duration: 0.5 }, 0);
  tl.from('.page-header p',  { y: 14, opacity: 0, duration: 0.4 }, 0.08);
  tl.from('.stat-card', { y: 32, opacity: 0, scale: 0.96, duration: 0.52, stagger: { amount: 0.22 }, clearProps: 'all' }, 0.1);
  tl.from('.btn-primary, .btn-outline', { y: 10, opacity: 0, duration: 0.35, stagger: 0.05, clearProps: 'all' }, 0.18);
}

function initScrollReveals() {
  gsap.utils.toArray('.card:not(.stat-card)').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 91%', toggleActions: 'play none none none' },
      y: 28, opacity: 0, scale: 0.97, duration: 0.5, delay: (i % 4) * 0.055,
      ease: EASE.out, clearProps: 'all',
    });
  });

  gsap.utils.toArray('.data-table tbody tr').forEach((row, i) => {
    gsap.from(row, {
      scrollTrigger: { trigger: row, start: 'top 96%' },
      x: -18, opacity: 0, duration: 0.38, delay: i * 0.045,
      ease: EASE.out, clearProps: 'all',
    });
  });

  gsap.utils.toArray('.progress-bar-fill').forEach(bar => {
    const target = bar.style.width || '0%';
    bar.style.width = '0%';
    ScrollTrigger.create({
      trigger: bar, start: 'top 94%',
      onEnter: () => gsap.to(bar, { width: target, duration: 1.1, ease: 'power2.inOut', delay: 0.08 }),
    });
  });

  gsap.utils.toArray('.badge').forEach((b, i) => {
    gsap.from(b, {
      scrollTrigger: { trigger: b, start: 'top 97%' },
      scale: 0.6, opacity: 0, duration: 0.32, delay: i * 0.025,
      ease: EASE.back, clearProps: 'all',
    });
  });

  gsap.utils.toArray('h3').forEach(h => {
    gsap.from(h, {
      scrollTrigger: { trigger: h, start: 'top 93%' },
      x: -12, opacity: 0, duration: 0.4, ease: EASE.out, clearProps: 'all',
    });
  });
}

function animateCounters() {
  document.querySelectorAll('.stat-value').forEach(el => {
    const raw = el.textContent.trim();
    const match = raw.match(/^([₦$£€+\-]?)([\d,]+)(%?)$/);
    if (!match) return;
    const prefix = match[1] || '';
    const suffix = match[3] || '';
    const num = parseFloat(match[2].replace(/,/g, ''));
    if (isNaN(num) || num === 0) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: num, duration: 1.4, ease: 'power2.out', delay: 0.25,
      onUpdate() { el.textContent = `${prefix}${Math.floor(obj.val).toLocaleString('en-NG')}${suffix}`; }
    });
  });
}

function initMicroInteractions() {
  document.querySelectorAll('.nav-item:not(.active)').forEach(item => {
    const svg = item.querySelector('svg');
    item.addEventListener('mouseenter', () => {
      gsap.to(item, { x: 5, duration: 0.2, ease: EASE.out });
      if (svg) gsap.to(svg, { rotate: 6, duration: 0.2, ease: EASE.out });
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(item, { x: 0, duration: 0.2, ease: EASE.out });
      if (svg) gsap.to(svg, { rotate: 0, duration: 0.2, ease: EASE.out });
    });
  });

  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mouseenter', () => gsap.to(btn, { y: -2.5, scale: 1.025, duration: 0.2, ease: EASE.out }));
    btn.addEventListener('mouseleave', () => gsap.to(btn, { y: 0, scale: 1, duration: 0.2, ease: EASE.out }));
    btn.addEventListener('mousedown', () => gsap.to(btn, { scale: 0.96, duration: 0.1 }));
    btn.addEventListener('mouseup', () => gsap.to(btn, { scale: 1.025, duration: 0.12, ease: EASE.back }));
  });

  document.querySelectorAll('.btn-outline').forEach(btn => {
    btn.addEventListener('mouseenter', () => gsap.to(btn, { y: -1.5, duration: 0.18, ease: EASE.out }));
    btn.addEventListener('mouseleave', () => gsap.to(btn, { y: 0, duration: 0.18, ease: EASE.out }));
  });

  document.querySelectorAll('.card:not(.stat-card)').forEach(card => {
    card.addEventListener('mouseenter', () => gsap.to(card, { y: -4, duration: 0.25, ease: EASE.out }));
    card.addEventListener('mouseleave', () => gsap.to(card, { y: 0, duration: 0.25, ease: EASE.out }));
  });

  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('mouseenter', () => gsap.to(card, { y: -3, scale: 1.015, duration: 0.22, ease: EASE.out }));
    card.addEventListener('mouseleave', () => gsap.to(card, { y: 0, scale: 1, duration: 0.22, ease: EASE.out }));
  });

  document.querySelectorAll('.icon-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.12, duration: 0.18, ease: EASE.back }));
    btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1, duration: 0.18, ease: EASE.out }));
  });

  document.querySelectorAll('.toggle input').forEach(input => {
    input.addEventListener('change', () => {
      const slider = input.nextElementSibling;
      if (slider) gsap.fromTo(slider, { scale: 0.88 }, { scale: 1, duration: 0.38, ease: EASE.spring });
    });
  });
}

function getChartAnimConfig() {
  return {
    animation: { duration: 1100, easing: 'easeInOutQuart', delay: ctx => ctx.dataIndex * 55 },
    transitions: { active: { animation: { duration: 350 } } },
  };
}

function initLandingAnimations() {
  const tl = gsap.timeline({ defaults: { ease: EASE.out } });
  tl.from('.hero-glow',   { scale: 0.3, opacity: 0, duration: 1.8, ease: 'power2.out' }, 0);
  tl.from('.hero-glow2',  { scale: 0.3, opacity: 0, duration: 2.0, ease: 'power2.out' }, 0.15);
  tl.from('.landing-nav', { y: -70, opacity: 0, duration: 0.65, ease: EASE.expo }, 0.05);
  tl.from('.badge',       { y: -20, opacity: 0, scale: 0.7, duration: 0.5, ease: EASE.back }, 0.22);
  const h1 = document.querySelector('h1');
  if (h1) tl.from(h1, { y: 36, opacity: 0, duration: 0.7 }, 0.3);
  tl.from('section > div > p',     { y: 22, opacity: 0, duration: 0.5 }, 0.44);
  tl.from('section > div > div > .btn', { y: 18, opacity: 0, scale: 0.92, duration: 0.45, stagger: 0.09, ease: EASE.back }, 0.56);
  tl.from('.stat-pill',   { y: 12, opacity: 0, scale: 0.85, duration: 0.4, stagger: 0.08, ease: EASE.back }, 0.7);

  const mockup = document.querySelector('section + section .card');
  if (mockup) {
    gsap.from(mockup, {
      scrollTrigger: { trigger: mockup, start: 'top 85%' },
      y: 52, opacity: 0, scale: 0.95, duration: 0.85, ease: EASE.out,
    });
  }

  gsap.utils.toArray('.feature-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 89%' },
      y: 36, opacity: 0, scale: 0.94, duration: 0.52, delay: (i % 3) * 0.08,
      ease: EASE.out, clearProps: 'all',
    });
    card.addEventListener('mouseenter', () => gsap.to(card, { y: -7, scale: 1.02, duration: 0.28, ease: EASE.out }));
    card.addEventListener('mouseleave', () => gsap.to(card, { y: 0, scale: 1, duration: 0.28, ease: EASE.out }));
  });

  initSmoothScroll();
  initMicroInteractions();
}

function initAuthAnimations() {
  const tl = gsap.timeline({ defaults: { ease: EASE.out } });
  gsap.from('.auth-glow', { opacity: 0, scale: 0.2, duration: 2, ease: 'power2.out' });
  tl.from('.auth-card',   { y: 50, opacity: 0, scale: 0.94, duration: 0.65 }, 0.1);
  tl.from('.logo-icon',   { scale: 0, rotation: -90, duration: 0.5, ease: EASE.spring }, 0.3);
  tl.from('.auth-card h1',{ y: 16, opacity: 0, duration: 0.4 }, 0.46);
  tl.from('.auth-card p', { y: 10, opacity: 0, duration: 0.35 }, 0.53);
  tl.from('.auth-tabs',   { y: 10, opacity: 0, duration: 0.3 }, 0.6);
  tl.from('.input-field', { y: 14, opacity: 0, duration: 0.35, stagger: 0.07, clearProps: 'all' }, 0.64);
  tl.from('.btn-primary', { y: 10, opacity: 0, scale: 0.9, duration: 0.4, ease: EASE.back }, 0.9);
  initMicroInteractions();
}

function initSavingsAnimations() {
  gsap.utils.toArray('.grid-2 .card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 88%' },
      y: 36, opacity: 0, scale: 0.94, duration: 0.55, delay: (i % 2) * 0.1,
      ease: EASE.out, clearProps: 'all',
    });
  });
}

function initNotificationAnimations() {
  gsap.utils.toArray('[style*="border-left"]').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 94%' },
      x: -26, opacity: 0, duration: 0.45, delay: i * 0.08,
      ease: EASE.out, clearProps: 'all',
    });
  });
}

function initDebtAnimations() {
  gsap.utils.toArray('.card:not(.stat-card)').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 90%' },
      x: i % 2 === 0 ? -22 : 22, opacity: 0, duration: 0.52,
      ease: EASE.out, clearProps: 'all',
    });
  });
}

function initSitemapAnimations() {
  gsap.from('.sm-node', {
    scrollTrigger: { trigger: '.sm-node', start: 'top 90%' },
    scale: 0.8, opacity: 0, duration: 0.38, stagger: 0.04, ease: EASE.back, clearProps: 'all',
  });
}

function animateThemeToggle() {
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      gsap.fromTo('body', { opacity: 0.5 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    });
  });
}

function initAllAnimations(pageType) {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  gsap.config({ nullTargetWarn: false });
  ScrollTrigger.getAll().forEach(st => st.kill());

  initSmoothScroll();
  initCursorGlow();
  animateThemeToggle();

  if (pageType === 'landing') { initLandingAnimations(); return; }
  if (pageType === 'auth')    { initAuthAnimations(); return; }

  initPageEntrance();
  initScrollReveals();
  animateCounters();
  initMicroInteractions();

  if (pageType === 'savings')       initSavingsAnimations();
  if (pageType === 'notifications') initNotificationAnimations();
  if (pageType === 'debt')          initDebtAnimations();
  if (pageType === 'sitemap')       initSitemapAnimations();
}

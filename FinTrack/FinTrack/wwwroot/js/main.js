// ── Theme Toggle ──
const html = document.documentElement;
const body = document.body;

function getTheme() {
  return localStorage.getItem('theme') || 'dark';
}

function applyTheme(theme) {
  if (theme === 'light') {
    body.classList.add('light');
  } else {
    body.classList.remove('light');
  }
  // Update all theme toggle icons
  document.querySelectorAll('.theme-icon-dark').forEach(el => {
    el.style.display = theme === 'dark' ? 'none' : 'block';
  });
  document.querySelectorAll('.theme-icon-light').forEach(el => {
    el.style.display = theme === 'light' ? 'none' : 'block';
  });
}

function toggleTheme() {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
}

// ── Sidebar Toggle (mobile) ──
function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const hamburger = document.querySelector('.hamburger');

  if (!sidebar) return;

  hamburger?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });

  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
}

// ── Active nav item ──
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    if (item.dataset.page === path) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// ── Animate elements on load ──
function animateOnLoad() {
  document.querySelectorAll('.card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.04}s`;
    card.classList.add('fade-up');
  });
}

// ── GSAP Loader ──
function loadGSAP(callback) {
  if (window.gsap) { callback(); return; }

  const scripts = [
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollToPlugin.min.js'
  ];

  let loaded = 0;
  scripts.forEach(src => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => { if (++loaded === scripts.length) callback(); };
    document.head.appendChild(s);
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(getTheme());
  initSidebar();
  setActiveNav();

  // Theme toggle buttons
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  // Pre-load GSAP so it's available when layout.js calls initAllAnimations
  loadGSAP(() => {
    // For landing & auth pages (no layout.js), run animations directly
    const isAppPage = !!document.getElementById('layout-root');
    if (!isAppPage) {
      const isAuth = !!document.querySelector('.auth-card') || !!document.querySelector('.auth-bg');
      const type = isAuth ? 'auth' : 'landing';
      if (window.initAllAnimations) initAllAnimations(type);
    }
    // App pages: animations are triggered inside initLayout() after DOM injection
  });
});

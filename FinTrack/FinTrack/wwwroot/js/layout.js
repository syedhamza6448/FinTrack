// layout.js — injects sidebar and topbar into app pages
// Usage: include <div id="layout-root"></div> in body, then call initLayout({title, page})

function getSidebar(activePage) {
  const navItems = [
    { page: 'dashboard.html', label: 'Dashboard', icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' },
    { page: 'transactions.html', label: 'Transactions', icon: '<path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>' },
    { page: 'budget.html', label: 'Budget', icon: '<path d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1-4h-4a1 1 0 00-1 1v4h6V4a1 1 0 00-1-1z"/>' },
    { page: 'expenses.html', label: 'Expenses', icon: '<path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>' },
    { page: 'investments.html', label: 'Investments', icon: '<path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>' },
    { page: 'debt.html', label: 'Debt', icon: '<path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>' },
    { page: 'savings.html', label: 'Savings & Goals', icon: '<path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>' },
    { page: 'reports.html', label: 'Reports', icon: '<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>' },
    { page: 'notifications.html', label: 'Notifications', icon: '<path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>' },
    { page: 'education.html', label: 'Education', icon: '<path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>' },
    { page: 'settings.html', label: 'Settings', icon: '<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/>' },
    { page: 'sitemap.html', label: 'Sitemap', icon: '<path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 16V5m0 0L9 7"/>' },
  ];

  const sections = [
    { label: 'Main', pages: ['dashboard.html','transactions.html','budget.html','expenses.html'] },
    { label: 'Finance', pages: ['investments.html','debt.html','savings.html','reports.html'] },
    { label: 'More', pages: ['notifications.html','education.html','settings.html','sitemap.html'] },
  ];

  let html = `<aside class="sidebar">
    <a href="../index.html" class="sidebar-logo">
      <div class="logo-icon">₦</div>
      <span>FinTrack</span>
    </a>`;

  sections.forEach(sec => {
    html += `<div class="sidebar-section-label">${sec.label}</div>`;
    sec.pages.forEach(pg => {
      const item = navItems.find(n => n.page === pg);
      if (!item) return;
      const isActive = pg === activePage;
      html += `<a href="${pg}" class="nav-item${isActive ? ' active' : ''}" data-page="${pg}">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">${item.icon}</svg>
        ${item.label}
      </a>`;
    });
  });

  html += `</aside><div class="sidebar-overlay"></div>`;
  return html;
}

function getTopbar(title) {
  return `<header class="topbar">
    <div style="display:flex;align-items:center;gap:0.75rem;">
      <button class="hamburger">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
      <span class="topbar-title">${title}</span>
    </div>
    <div class="topbar-right">
      <button class="icon-btn theme-toggle-btn" title="Toggle theme">
        <svg class="theme-icon-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
        <svg class="theme-icon-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="display:none"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
      </button>
      <a href="notifications.html" class="icon-btn notif-dot" title="Notifications">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
      </a>
      <a href="settings.html" class="avatar" title="Profile">JD</a>
    </div>
  </header>`;
}

function initLayout({ title, page }) {
  const root = document.getElementById('layout-root');
  if (!root) return;
  root.innerHTML = getSidebar(page) + `<div class="main-wrapper"><div id="topbar-slot"></div><div class="page-content" id="page-content-slot"></div></div>`;
  document.getElementById('topbar-slot').outerHTML = getTopbar(title);
  // Move page content into slot
  const content = document.getElementById('page-main-content');
  const slot = document.getElementById('page-content-slot');
  if (content && slot) { slot.innerHTML = content.innerHTML; content.remove(); }

  // Re-init sidebar interactions now that DOM is ready
  if (window.initSidebar) initSidebar();

  // Fire GSAP animations after layout is injected
  // Use a small delay so DOM is fully painted
  setTimeout(() => {
    if (window.gsap && window.initAllAnimations) {
      const isSavings = page.includes('savings');
      const isNotif = page.includes('notifications');
  const isDebt = page.includes('debt');
  const isSitemap = page.includes('sitemap');
      const type = isSavings ? 'savings' : isNotif ? 'notifications' : isDebt ? 'debt' : isSitemap ? 'sitemap' : 'default';
      initAllAnimations(type);
    }
  }, 60);
}

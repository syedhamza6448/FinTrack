document.addEventListener('DOMContentLoaded', function () {

    // ── Theme Toggle ──────────────────────────────────────
    const body = document.body;
    const themeBtn = document.querySelector('.theme-toggle-btn');
    const lightIcon = document.querySelector('.theme-icon-light');
    const darkIcon = document.querySelector('.theme-icon-dark');

    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        body.classList.add('light');
        if (lightIcon) lightIcon.style.display = 'none';
        if (darkIcon) darkIcon.style.display = '';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            body.classList.toggle('light');
            const isLight = body.classList.contains('light');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            if (lightIcon) lightIcon.style.display = isLight ? 'none' : '';
            if (darkIcon) darkIcon.style.display = isLight ? '' : 'none';
        });
    }

    // ── Sidebar Toggle (Desktop) ──────────────────────────
    const sidebar = document.getElementById('sidebar');
    const mainWrap = document.getElementById('mainWrap');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const tooltip = document.getElementById('navTooltip');

    // Restore collapse state
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed && sidebar) {
        sidebar.classList.add('collapsed');
        mainWrap?.classList.add('expanded');
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function () {
            const collapsed = sidebar.classList.toggle('collapsed');
            mainWrap?.classList.toggle('expanded', collapsed);
            localStorage.setItem('sidebarCollapsed', collapsed);
            if (tooltip) tooltip.classList.remove('visible');
        });
    }

    // ── Tooltip (collapsed sidebar only) ─────────────────
    if (tooltip) {
        const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-tooltip], .sidebar-footer .nav-item[data-tooltip]');

        navItems.forEach(function (item) {
            item.addEventListener('mouseenter', function () {
                if (!sidebar?.classList.contains('collapsed')) return;

                const label = item.getAttribute('data-tooltip');
                tooltip.textContent = label;

                const rect = item.getBoundingClientRect();
                tooltip.style.top = (rect.top + rect.height / 2) + 'px';
                tooltip.classList.add('visible');
            });

            item.addEventListener('mouseleave', function () {
                tooltip.classList.remove('visible');
            });

            item.addEventListener('click', function () {
                tooltip.classList.remove('visible');
            });
        });
    }

    // ── Mobile More Menu ──────────────────────────────────
    const moreBtn = document.getElementById('moreBtn');
    const moreMenu = document.getElementById('moreMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');

    if (moreBtn && moreMenu) {
        moreBtn.addEventListener('click', function () {
            moreMenu.classList.toggle('open');
            mobileOverlay?.classList.toggle('open');
        });

        mobileOverlay?.addEventListener('click', function () {
            moreMenu.classList.remove('open');
            mobileOverlay.classList.remove('open');
        });
    }
});
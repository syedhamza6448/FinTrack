/**
 * Updates the document favicon to match the current theme (dark or light).
 * Call this whenever data-theme changes (app init, shell toggle, settings).
 */
export function updateFaviconForTheme(): void {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const href = theme === 'light' ? 'favicon-light.ico' : 'favicon.ico';
  const link = document.getElementById('app-favicon') as HTMLLinkElement | null;
  if (link) {
    link.href = href;
  }
}

(() => {
  const ready = () => {
    // Only reveal private navigation after a valid sign-in.
    try {
      if (window.Auth && Auth.isLoggedIn()) {
        document.querySelectorAll('[data-auth-link]').forEach(el => el.hidden = false);
      }
    } catch (_) {}

    // Mobile navigation remains usable after the shared navbar is fetched.
    const button = document.querySelector('.mobile-menu-button');
    const nav = document.getElementById('main-navigation');
    if (button && nav && !button.dataset.bound) {
      button.dataset.bound = 'true';
      button.addEventListener('click', () => {
        const open = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!open));
        nav.classList.toggle('open', !open);
      });
    }

    // Lightweight production API health indicator.
    const indicators = document.querySelectorAll('[data-api-status]');
    if (indicators.length && window.UNION_CONFIG?.API_BASE) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      fetch(String(UNION_CONFIG.API_BASE).replace(/\/$/, '') + '/api/health', { signal: controller.signal })
        .then(response => {
          clearTimeout(timeout);
          const ok = response.ok;
          indicators.forEach(el => { el.textContent = ok ? 'Operational' : 'Degraded'; el.className = ok ? 'operational' : 'scheduled'; });
        })
        .catch(() => {
          clearTimeout(timeout);
          indicators.forEach(el => { el.textContent = 'Check Discord'; el.className = 'scheduled'; });
        });
    }
  };
  document.addEventListener('DOMContentLoaded', () => setTimeout(ready, 180));
  document.addEventListener('union-nav-ready', ready);
})();

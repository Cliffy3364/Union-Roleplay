(() => {
  const RELEASE_DATE = new Date('2026-09-01T00:00:00+01:00');
  const pad = value => String(Math.max(0, value)).padStart(2, '0');
  const getParts = () => {
    const distance = RELEASE_DATE.getTime() - Date.now();
    if (distance <= 0) return { live: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      live: false,
      days: Math.floor(distance / 86400000),
      hours: Math.floor((distance % 86400000) / 3600000),
      minutes: Math.floor((distance % 3600000) / 60000),
      seconds: Math.floor((distance % 60000) / 1000)
    };
  };
  const paint = () => {
    const p = getParts();
    document.querySelectorAll('[data-countdown-days]').forEach(el => el.textContent = pad(p.days));
    document.querySelectorAll('[data-countdown-hours]').forEach(el => el.textContent = pad(p.hours));
    document.querySelectorAll('[data-countdown-minutes]').forEach(el => el.textContent = pad(p.minutes));
    document.querySelectorAll('[data-countdown-seconds]').forEach(el => el.textContent = pad(p.seconds));
    document.querySelectorAll('[data-release-inline]').forEach(el => {
      el.textContent = p.live ? 'Union Roleplay is now live' : `${p.days}d ${pad(p.hours)}h ${pad(p.minutes)}m ${pad(p.seconds)}s`;
    });
    document.querySelectorAll('[data-release-state]').forEach(el => {
      el.innerHTML = p.live ? '<b>Union Roleplay is live.</b> Connect now and begin your story.' : '<b>Launching 1 September 2026.</b> Secure your place before the city opens.';
    });
  };
  const addRibbon = () => {
    if (document.querySelector('.release-ribbon') || document.body.classList.contains('login-page')) return;
    const ribbon = document.createElement('div');
    ribbon.className = 'release-ribbon';
    ribbon.innerHTML = '<div class="release-ribbon-inner"><span class="release-ribbon-dot"></span><strong>Union City launches 1 September 2026</strong><span class="release-ribbon-time" data-release-inline></span></div>';
    const nav = document.querySelector('.navbar');
    if (nav) nav.insertAdjacentElement('afterend', ribbon);
  };
  const markActiveNav = () => {
    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = (a.getAttribute('href') || '').split('#')[0];
      if (href === current || (current === '' && href === 'index.html')) a.classList.add('active');
    });
  };
  const boot = () => { addRibbon(); markActiveNav(); paint(); setInterval(paint, 1000); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 120)); else setTimeout(boot, 120);
})();

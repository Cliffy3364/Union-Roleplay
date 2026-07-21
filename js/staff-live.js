(() => {
  'use strict';

  const API_BASE = (window.PORTAL_CONFIG && window.PORTAL_CONFIG.API_BASE_URL) ||
    (window.UNION_CONFIG && window.UNION_CONFIG.API_BASE_URL) ||
    'https://union-roleplay-api.danielclifford2808.workers.dev';
  const POLL_MS = 8000;
  const HEARTBEAT_MS = 20000;
  const seenKey = 'union_staff_live_seen';
  let currentSnapshot = null;
  let firstLoad = true;

  const token = () => (window.Auth && typeof Auth.getAccessToken === 'function'
    ? Auth.getAccessToken()
    : localStorage.getItem('union_access_token')) || '';

  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  })[ch]);

  const fmtTime = value => {
    const n = Number(value || 0);
    if (!n) return 'Just now';
    const seconds = Math.max(0, Math.floor((Date.now() - n) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return new Date(n).toLocaleDateString('en-GB');
  };

  function activeTab() {
    return document.querySelector('[data-staff-tab].active')?.dataset.staffTab || 'dashboard';
  }

  function detailForTab(tab) {
    return ({
      dashboard: 'Viewing the live dashboard',
      tickets: 'Managing live tickets',
      applications: 'Reviewing applications',
      transcripts: 'Reviewing transcripts',
      settings: 'Viewing Discord setup'
    })[tab] || 'Using the staff panel';
  }

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token()}`,
        ...(options.headers || {})
      },
      cache: 'no-store'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  }

  function mount() {
    const tabs = document.querySelector('.staff-tabs');
    if (!tabs || document.getElementById('staff-live-bar')) return;

    const bar = document.createElement('section');
    bar.id = 'staff-live-bar';
    bar.className = 'staff-live-bar';
    bar.innerHTML = `
      <div class="staff-live-status"><i></i><span>LIVE</span><small id="staff-live-updated">Connecting…</small></div>
      <div class="staff-live-metrics" id="staff-live-metrics"></div>
      <div class="staff-live-actions">
        <button type="button" id="staff-presence-button" class="staff-presence-button" aria-expanded="false">
          <span class="presence-stack" id="staff-presence-stack"></span>
          <b id="staff-online-count">0 online</b>
        </button>
        <button type="button" id="staff-notification-button" class="staff-notification-button" aria-expanded="false" aria-label="Open notifications">
          <span>🔔</span><b id="staff-notification-count" hidden>0</b>
        </button>
      </div>
      <aside id="staff-presence-panel" class="staff-live-popover staff-presence-panel" hidden></aside>
      <aside id="staff-notification-panel" class="staff-live-popover staff-notification-panel" hidden></aside>`;
    tabs.parentNode.insertBefore(bar, tabs);

    document.getElementById('staff-presence-button').addEventListener('click', () => togglePopover('presence'));
    document.getElementById('staff-notification-button').addEventListener('click', () => {
      togglePopover('notifications');
      markAllSeen();
    });
    document.addEventListener('click', event => {
      if (!bar.contains(event.target)) closePopovers();
    });
  }

  function togglePopover(type) {
    const presence = document.getElementById('staff-presence-panel');
    const notifications = document.getElementById('staff-notification-panel');
    const target = type === 'presence' ? presence : notifications;
    const other = type === 'presence' ? notifications : presence;
    other.hidden = true;
    target.hidden = !target.hidden;
    document.getElementById('staff-presence-button')?.setAttribute('aria-expanded', String(!presence.hidden));
    document.getElementById('staff-notification-button')?.setAttribute('aria-expanded', String(!notifications.hidden));
  }

  function closePopovers() {
    ['staff-presence-panel','staff-notification-panel'].forEach(id => {
      const el = document.getElementById(id); if (el) el.hidden = true;
    });
  }

  function avatarMarkup(person, index) {
    const id = person.discord_id;
    const avatar = person.avatar;
    if (id && avatar) return `<img src="https://cdn.discordapp.com/avatars/${encodeURIComponent(id)}/${encodeURIComponent(avatar)}.png?size=64" alt="">`;
    return `<span>${escapeHtml((person.display_name || '?').charAt(0).toUpperCase())}</span>`;
  }

  function render(snapshot) {
    currentSnapshot = snapshot;
    const s = snapshot.summary || {};
    document.getElementById('staff-live-updated').textContent = `Updated ${new Date(snapshot.generated_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}`;
    document.getElementById('staff-live-metrics').innerHTML = `
      <button data-live-tab="tickets"><strong>${s.open_tickets || 0}</strong><span>Open tickets</span>${s.unread_tickets ? `<em>${s.unread_tickets} unread</em>` : ''}</button>
      <button data-live-tab="applications"><strong>${s.pending_applications || 0}</strong><span>Pending applications</span>${s.applications_today ? `<em>+${s.applications_today} today</em>` : ''}</button>
      <button data-live-tab="transcripts"><strong>${s.closed_today || 0}</strong><span>Closed today</span></button>`;
    document.querySelectorAll('[data-live-tab]').forEach(btn => btn.onclick = () => document.querySelector(`[data-staff-tab="${btn.dataset.liveTab}"]`)?.click());

    const presence = snapshot.presence || [];
    document.getElementById('staff-online-count').textContent = `${presence.length} online`;
    document.getElementById('staff-presence-stack').innerHTML = presence.slice(0,3).map(avatarMarkup).join('');
    document.getElementById('staff-presence-panel').innerHTML = `
      <header><div><span>STAFF PRESENCE</span><strong>${presence.length} online</strong></div><i></i></header>
      <div class="presence-list">${presence.length ? presence.map((p,i) => `
        <article><div class="presence-avatar">${avatarMarkup(p,i)}<i></i></div><div><strong>${escapeHtml(p.display_name)}</strong><p>${escapeHtml(p.activity_detail || detailForTab(p.active_tab))}</p></div><time>${fmtTime(p.last_seen)}</time></article>`).join('') : '<p class="live-empty">No staff are currently active.</p>'}</div>`;

    renderEvents(snapshot.events || []);
    updateTabBadges(s);
    if (!firstLoad) notifyNewEvents(snapshot.events || []);
    firstLoad = false;
  }

  function seenSet() {
    try { return new Set(JSON.parse(localStorage.getItem(seenKey) || '[]')); } catch { return new Set(); }
  }

  function renderEvents(events) {
    const seen = seenSet();
    const unread = events.filter(e => !seen.has(e.uid));
    const badge = document.getElementById('staff-notification-count');
    badge.textContent = String(unread.length);
    badge.hidden = unread.length === 0;
    document.getElementById('staff-notification-panel').innerHTML = `
      <header><div><span>NOTIFICATIONS</span><strong>Latest activity</strong></div><button type="button" id="staff-mark-read">Mark all read</button></header>
      <div class="notification-list">${events.length ? events.slice(0,15).map(e => `
        <button type="button" data-event-kind="${escapeHtml(e.kind)}" class="${seen.has(e.uid)?'':'unread'}">
          <i>${e.kind === 'ticket' ? '🎫' : '📋'}</i><div><strong>${escapeHtml(e.action || 'Updated')}</strong><p>${escapeHtml(e.reference || '')} · ${escapeHtml(e.title || '')}</p><small>${escapeHtml(e.actor || 'Union Staff')} · ${fmtTime(e.created_at)}</small></div>
        </button>`).join('') : '<p class="live-empty">No recent activity.</p>'}</div>`;
    document.getElementById('staff-mark-read')?.addEventListener('click', markAllSeen);
    document.querySelectorAll('[data-event-kind]').forEach(button => button.addEventListener('click', () => {
      document.querySelector(`[data-staff-tab="${button.dataset.eventKind === 'ticket' ? 'tickets' : 'applications'}"]`)?.click();
      closePopovers();
    }));
  }

  function markAllSeen() {
    if (!currentSnapshot) return;
    localStorage.setItem(seenKey, JSON.stringify((currentSnapshot.events || []).map(e => e.uid).slice(0,100)));
    renderEvents(currentSnapshot.events || []);
  }

  function updateTabBadges(summary) {
    const values = {tickets: summary.unread_tickets || 0, applications: summary.pending_applications || 0};
    Object.entries(values).forEach(([tab,count]) => {
      const btn = document.querySelector(`[data-staff-tab="${tab}"]`);
      if (!btn) return;
      let badge = btn.querySelector('.staff-tab-badge');
      if (!badge) { badge = document.createElement('b'); badge.className='staff-tab-badge'; btn.appendChild(badge); }
      badge.textContent = String(count);
      badge.hidden = !count;
    });
  }

  function toast(event) {
    let tray = document.getElementById('staff-toast-tray');
    if (!tray) { tray = document.createElement('div'); tray.id='staff-toast-tray'; tray.className='staff-toast-tray'; document.body.appendChild(tray); }
    const el = document.createElement('button');
    el.className='staff-live-toast';
    el.innerHTML=`<i>${event.kind==='ticket'?'🎫':'📋'}</i><div><span>${escapeHtml(event.action || 'New update')}</span><strong>${escapeHtml(event.reference || '')} ${escapeHtml(event.title || '')}</strong></div>`;
    el.onclick=()=>{document.querySelector(`[data-staff-tab="${event.kind==='ticket'?'tickets':'applications'}"]`)?.click();el.remove();};
    tray.appendChild(el);
    setTimeout(()=>el.classList.add('show'),20);
    setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),250)},6500);
  }

  function notifyNewEvents(events) {
    const seen = seenSet();
    events.filter(e => !seen.has(e.uid)).slice(0,3).reverse().forEach(toast);
  }

  async function heartbeat() {
    if (!token()) return;
    const tab = activeTab();
    try { await request('/api/staff/presence', {method:'POST', body:JSON.stringify({tab, detail:detailForTab(tab)})}); } catch (e) { console.warn('Presence heartbeat failed', e); }
  }

  async function poll() {
    if (!token()) return;
    try {
      const snapshot = await request('/api/staff/live');
      render(snapshot);
    } catch (error) {
      const updated = document.getElementById('staff-live-updated');
      if (updated) updated.textContent = 'Live connection unavailable';
      console.warn('Live staff update failed', error);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    mount();
    heartbeat();
    poll();
    setInterval(poll, POLL_MS);
    setInterval(heartbeat, HEARTBEAT_MS);
    document.querySelectorAll('[data-staff-tab]').forEach(btn => btn.addEventListener('click', () => setTimeout(heartbeat, 100)));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { heartbeat(); poll(); } });
  });
})();

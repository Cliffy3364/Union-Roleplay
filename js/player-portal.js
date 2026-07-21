(() => {
  const API = String(window.UNION_CONFIG?.API_BASE || '').replace(/\/$/, '');
  const token = () => localStorage.getItem('union_access_token') || sessionStorage.getItem('union_access_token') || '';
  const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const fmt = value => value ? new Date(Number(value)).toLocaleString() : '—';
  const statusClass = s => String(s || '').toLowerCase().replace(/\s+/g,'-');
  let state = { applications: [], tickets: [], notifications: [], announcements: [], user: null, stats: {} };

  async function api(path, options={}) {
    const response = await fetch(`${API}${path}`, { ...options, headers: { Authorization: `Bearer ${token()}`, 'Content-Type':'application/json', ...(options.headers||{}) } });
    const data = await response.json().catch(()=>({success:false,error:'Invalid server response.'}));
    if (!response.ok || data.success === false) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  }

  function empty(text){ return `<div class="empty-state">${esc(text)}</div>`; }
  function applicationItem(a){
    const date = a.reviewed_at || a.submitted_at || a.last_saved_at;
    return `<article class="portal-list-item" data-search="${esc(`${a.reference||''} ${a.application_type||''} ${a.status||''}`.toLowerCase())}" data-status="${esc(a.status||'')}"><div><span class="portal-status ${statusClass(a.status)}">${esc(a.status||'Draft')}</span><h4>${esc(a.application_type||'Application')}</h4><p>${esc(a.reference||`Application #${a.id}`)}${a.staff_response ? ` · ${esc(a.staff_response)}` : ''}</p></div><time>${fmt(date)}</time></article>`;
  }
  function ticketItem(t){
    const canReopen = String(t.status).toLowerCase()==='closed' && Number(t.delete_at||0)>Date.now();
    return `<article class="portal-list-item" data-search="${esc(`${t.reference||''} ${t.subject||''} ${t.category||''}`.toLowerCase())}" data-status="${esc(t.status||'')}"><div><span class="portal-status ${statusClass(t.status)}">${esc(t.status||'Open')}</span><h4>${esc(t.subject||'Support Ticket')}</h4><p>${esc(t.reference||'')} · ${esc(t.category||'Support')}${canReopen?' · Reopen available':''}</p></div><time>${fmt(t.updated_at)}</time></article>`;
  }
  function announcementCard(a){ return `<article class="announcement-card ${a.pinned?'pinned':''}"><span class="portal-status">${esc(a.category||'News')}</span><h4>${a.pinned?'📌 ':''}${esc(a.title)}</h4><p>${esc(a.body)}</p><time>${fmt(a.created_at)}</time></article>`; }
  function notificationItem(n){ return `<article class="portal-list-item ${n.read?'':'notification-unread'}" data-key="${esc(n.key)}"><a class="portal-message-link" href="${esc(n.href||'#')}"><span class="portal-status">${esc(n.type)}</span><h4>${esc(n.title)}</h4><p>${esc(n.message||'')}</p></a><time>${fmt(n.created_at)}</time></article>`; }

  function renderDashboard(){
    const u=state.user||{}; const s=state.stats||{};
    document.getElementById('portalWelcome').textContent=u.displayName||u.username||'Union Player';
    document.getElementById('portalIdentity').textContent=u.discordUsername?`@${u.discordUsername}`:'Discord connected';
    document.getElementById('statApplications').textContent=s.applications||0;
    document.getElementById('statDrafts').textContent=`${s.drafts||0} drafts`;
    document.getElementById('statTickets').textContent=s.open_tickets||0;
    document.getElementById('statNotifications').textContent=s.unread_notifications||0;
    document.getElementById('statUnionId').textContent=u.unionId||u.union_id||'Pending';
    document.getElementById('appCountBadge').textContent=s.applications||0;
    document.getElementById('ticketCountBadge').textContent=s.open_tickets||0;
    document.getElementById('notificationBadge').textContent=s.unread_notifications||0;
    document.getElementById('dashboardApplications').innerHTML=state.applications.slice(0,4).map(applicationItem).join('')||empty('No applications yet.');
    document.getElementById('dashboardTickets').innerHTML=state.tickets.slice(0,4).map(ticketItem).join('')||empty('No support tickets yet.');
    document.getElementById('dashboardAnnouncements').innerHTML=state.announcements.slice(0,3).map(announcementCard).join('')||empty('No announcements have been published.');
  }
  function renderAll(){
    renderDashboard();
    document.getElementById('applicationsList').innerHTML=state.applications.map(applicationItem).join('')||empty('No applications found.');
    document.getElementById('ticketsList').innerHTML=state.tickets.map(ticketItem).join('')||empty('No tickets found.');
    document.getElementById('notificationsList').innerHTML=state.notifications.map(notificationItem).join('')||empty('You are all caught up.');
    document.getElementById('announcementsList').innerHTML=state.announcements.map(announcementCard).join('')||empty('No announcements have been published.');
    renderAccount();
  }
  function renderAccount(){
    const u=state.user||{}; const name=u.displayName||u.username||'Union Player';
    document.getElementById('accountName').textContent=name;
    document.getElementById('accountDiscord').textContent=u.discordUsername?`@${u.discordUsername}`:'Discord connected';
    document.getElementById('accountUnionId').textContent=u.unionId||u.union_id||'Pending';
    document.getElementById('accountDiscordId').textContent=u.discordId||u.discord_id||'—';
    document.getElementById('accountCreated').textContent=fmt(u.created_at);
    const avatar=document.getElementById('accountAvatar'); avatar.textContent=name.charAt(0).toUpperCase();
    if(u.avatarUrl||u.avatar_url){avatar.style.backgroundImage=`url(${u.avatarUrl||u.avatar_url})`;avatar.textContent='';}
  }
  function applyFilters(listId, searchId, statusId){
    const q=document.getElementById(searchId).value.trim().toLowerCase(); const status=document.getElementById(statusId).value.toLowerCase();
    document.querySelectorAll(`#${listId} .portal-list-item`).forEach(item=>{ item.hidden=Boolean((q&&!item.dataset.search.includes(q))||(status&&String(item.dataset.status).toLowerCase()!==status)); });
  }
  function openTab(tab){
    document.querySelectorAll('[data-portal-tab]').forEach(b=>b.classList.toggle('active',b.dataset.portalTab===tab));
    document.querySelectorAll('[data-portal-panel]').forEach(p=>p.classList.toggle('active',p.dataset.portalPanel===tab));
    history.replaceState(null,'',`#${tab}`);
  }
  async function load(){
    const loading=document.getElementById('portalLoading'), error=document.getElementById('portalError'); loading.hidden=false; error.hidden=true;
    if(!token()){ location.href='login.html?redirect=portal.html'; return; }
    try{
      const [dash, notes, anns, prefs]=await Promise.all([api('/api/portal/dashboard'),api('/api/portal/notifications'),api('/api/portal/announcements'),api('/api/portal/preferences')]);
      state={...dash,notifications:notes.notifications||[],announcements:anns.announcements||dash.announcements||[]};
      renderAll();
      const form=document.getElementById('preferencesForm'); Object.entries(prefs.preferences||{}).forEach(([k,v])=>{if(form.elements[k]) form.elements[k].checked=Boolean(v)});
      loading.hidden=true;
    }catch(e){loading.hidden=true;error.hidden=false;error.textContent=e.message;}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('[data-portal-tab]').forEach(b=>b.addEventListener('click',()=>openTab(b.dataset.portalTab)));
    document.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>openTab(b.dataset.jump)));
    document.getElementById('portalRefresh').addEventListener('click',load);
    ['applicationSearch','applicationStatus'].forEach(id=>document.getElementById(id).addEventListener('input',()=>applyFilters('applicationsList','applicationSearch','applicationStatus')));
    ['ticketSearch','ticketStatus'].forEach(id=>document.getElementById(id).addEventListener('input',()=>applyFilters('ticketsList','ticketSearch','ticketStatus')));
    document.getElementById('markAllRead').addEventListener('click',async()=>{await api('/api/portal/notifications/read',{method:'POST',body:JSON.stringify({all:true})}); await load();});
    document.getElementById('preferencesForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,b={};['email_updates','browser_notifications','application_updates','ticket_updates','announcement_updates'].forEach(k=>b[k]=f.elements[k].checked);const m=document.getElementById('preferencesMessage');try{await api('/api/portal/preferences',{method:'POST',body:JSON.stringify(b)});m.textContent='Preferences saved.';}catch(err){m.textContent=err.message;}});
    openTab((location.hash||'#dashboard').slice(1)); load();
  });
})();

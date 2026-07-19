(() => {
  const cfg = window.UNION_PORTAL_CONFIG || { discordWebhook: '', discordEnabled: false };
  const TICKETS_KEY = 'unionTickets';
  const APPS_KEY = 'unionApplications';
  const MAX_FILES = Number(cfg.tickets?.maxAttachments) || 4;
  const MAX_FILE_SIZE = (Number(cfg.tickets?.maxAttachmentSizeMB) || 2) * 1024 * 1024;
  const CLOSED_RETENTION_MS = (Number(cfg.tickets?.autoDeleteHours) || 48) * 60 * 60 * 1000;
  let activePlayerTicket = null;
  let activeStaffTicket = null;

  const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const uid = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const esc = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  const fmt = (date) => new Date(date).toLocaleString();

  function purgeExpiredTickets() {
    const now = Date.now();
    const tickets = read(TICKETS_KEY);
    const kept = tickets.filter(ticket => {
      if (ticket.status !== 'Closed') return true;
      const closedAt = Date.parse(ticket.closedAt || ticket.updatedAt || ticket.createdAt);
      return Number.isNaN(closedAt) || now - closedAt < CLOSED_RETENTION_MS;
    });
    if (kept.length !== tickets.length) write(TICKETS_KEY, kept);
    return kept;
  }

  function remainingClosedTime(ticket) {
    const closedAt = Date.parse(ticket.closedAt || ticket.updatedAt || ticket.createdAt);
    if (Number.isNaN(closedAt)) return 0;
    return Math.max(0, CLOSED_RETENTION_MS - (Date.now() - closedAt));
  }

  function durationText(ms) {
    const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  purgeExpiredTickets();

  async function discord(content, embed) {
    if (!cfg.discordEnabled) return;
    const endpoint = cfg.api?.enabled && cfg.api?.baseUrl ? `${String(cfg.api.baseUrl).replace(/\/$/, '')}/portal/notify` : cfg.discordWebhook;
    if (!endpoint) return;
    try {
      await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, embeds: embed ? [embed] : [] })
      });
    } catch (error) { console.warn('Discord webhook failed', error); }
  }

  async function filesToData(files) {
    const selected = [...files].slice(0, MAX_FILES);
    if ([...files].length > MAX_FILES) throw new Error(`You can attach a maximum of ${MAX_FILES} images.`);
    const bad = selected.find(f => f.size > MAX_FILE_SIZE || !f.type.startsWith('image/'));
    if (bad) throw new Error(`${bad.name} is not a supported image or is larger than 2 MB.`);
    return Promise.all(selected.map(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: uid('IMG'), name: file.name, type: file.type, size: file.size, data: reader.result });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    })));
  }

  function attachmentHtml(items=[]) {
    if (!items.length) return '';
    return `<div class="chat-attachments">${items.map(a => `<button type="button" class="chat-image" data-image-src="${esc(a.data)}" aria-label="Open ${esc(a.name)}"><img src="${esc(a.data)}" alt="${esc(a.name)}"><span>${esc(a.name)}</span></button>`).join('')}</div>`;
  }

  function bindImageViewer(scope=document) {
    scope.querySelectorAll('[data-image-src]').forEach(btn => btn.addEventListener('click', () => {
      const modal = document.createElement('div');
      modal.className = 'ticket-image-modal';
      modal.innerHTML = `<button aria-label="Close image">×</button><img src="${esc(btn.dataset.imageSrc)}" alt="Ticket attachment">`;
      modal.addEventListener('click', e => { if (e.target === modal || e.target.tagName === 'BUTTON') modal.remove(); });
      document.body.appendChild(modal);
    }));
  }

  document.querySelectorAll('[data-application-form]').forEach(form => form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const currentUser = window.Auth?.getUser?.();
    const record = { id: uid('APP'), ownerId: currentUser?.id || 'guest', ownerName: currentUser?.username || '', type: form.dataset.applicationType, createdAt: new Date().toISOString(), status: 'Pending Review', response: '', data };
    const all = read(APPS_KEY); all.unshift(record); write(APPS_KEY, all);
    await discord(record.type === 'Whitelist Application' ? 'A new whitelist application has been submitted.' : `A new ${record.type} has been submitted.`, { title: `New application: ${record.type}`, description: `Reference: ${record.id}`, color: 10833386 });
    const msg = form.querySelector('.portal-form-message'); if (msg) msg.textContent = `Application submitted. Reference: ${record.id}`;
    form.reset();
  }));

  const ticketForm = document.getElementById('support-ticket-form');
  const categoryInput = document.getElementById('ticket-category');
  const banIdField = document.getElementById('ban-id-field');
  const banIdInput = document.getElementById('ticket-ban-id');
  const initialFiles = document.getElementById('ticket-attachments');
  const initialPreview = document.getElementById('ticket-file-preview');

  function updateBanIdRequirement() {
    if (!categoryInput || !banIdField || !banIdInput) return;
    const required = categoryInput.value === 'Ban Appeal';
    banIdField.hidden = !required;
    banIdInput.required = required;
    if (!required) banIdInput.value = '';
  }
  if (categoryInput) { categoryInput.addEventListener('change', updateBanIdRequirement); updateBanIdRequirement(); }
  if (initialFiles) initialFiles.addEventListener('change', () => {
    initialPreview.innerHTML = [...initialFiles.files].map(f => `<span>${esc(f.name)} <small>${Math.round(f.size/1024)} KB</small></span>`).join('');
  });

  if (ticketForm) ticketForm.addEventListener('submit', async e => {
    e.preventDefault();
    const message = document.getElementById('ticket-form-message');
    try {
      const category = categoryInput.value;
      const banId = banIdInput?.value.trim() || '';
      if (category === 'Ban Appeal' && !banId) throw new Error('A Ban ID is required to open a Ban Appeal ticket.');
      const attachments = await filesToData(initialFiles?.files || []);
      const now = new Date().toISOString();
      const details = document.getElementById('ticket-details').value.trim();
      const record = {
        id: uid('TKT'), ownerId: window.Auth?.getUser?.()?.id || 'guest', createdAt: now, updatedAt: now, status: 'Open', category, banId,
        name: document.getElementById('ticket-name').value,
        priority: document.getElementById('ticket-priority').value,
        subject: document.getElementById('ticket-subject').value,
        details,
        messages: [{ id: uid('MSG'), sender: 'player', senderName: document.getElementById('ticket-name').value, text: details, createdAt: now, attachments, readByStaff: false }]
      };
      const all = purgeExpiredTickets(); all.unshift(record); write(TICKETS_KEY, all);
      await discord(`Support Ticket ${record.id} has been opened.`, { title: record.subject, description: `${banId ? `Ban ID: ${banId}\n` : ''}${details}`.slice(0, 1000), color: 10833386 });
      message.textContent = `Ticket opened. Reference: ${record.id}`;
      ticketForm.reset(); updateBanIdRequirement(); if (initialPreview) initialPreview.innerHTML = '';
      activePlayerTicket = record.id; renderMyTickets(); renderPlayerThread();
    } catch (error) { message.textContent = error.message; }
  });

  function normalizedMessages(ticket) {
    if (Array.isArray(ticket.messages)) return ticket.messages;
    const list = [{ id: uid('MSG'), sender: 'player', senderName: ticket.name || 'Player', text: ticket.details || '', createdAt: ticket.createdAt, attachments: [] }];
    if (ticket.response) list.push({ id: uid('MSG'), sender: 'staff', senderName: 'Union Staff', text: ticket.response, createdAt: ticket.updatedAt || ticket.createdAt, attachments: [] });
    return list;
  }

  function renderMyTickets() {
    const el = document.getElementById('local-ticket-list'); if (!el) return;
    const userId = window.Auth?.getUser?.()?.id || 'guest';
    const all = purgeExpiredTickets().filter(t => (t.ownerId || 'guest') === userId);
    el.innerHTML = all.length ? all.map(t => {
      const msgs = normalizedMessages(t), last = msgs[msgs.length - 1];
      const closedHint = t.status === 'Closed' ? ` · deletes in ${durationText(remainingClosedTime(t))}` : '';
      return `<button class="local-ticket-card ${activePlayerTicket===t.id?'active':''}" data-open-player-ticket="${esc(t.id)}"><div class="local-ticket-ref">${esc(t.id)}</div><div><h3>${esc(t.subject)}</h3><p>${fmt(t.updatedAt || t.createdAt)} · ${esc(t.category)}${closedHint}</p><div class="ticket-last-message">${esc(last?.senderName || '')}: ${esc((last?.text || 'Attachment').slice(0,80))}</div></div><span class="local-ticket-status">${esc(t.status)}</span></button>`;
    }).join('') : '<div class="ticket-empty-state"><strong>No tickets yet</strong><p>Your submitted tickets will appear here.</p></div>';
    el.querySelectorAll('[data-open-player-ticket]').forEach(b => b.addEventListener('click', () => { activePlayerTicket = b.dataset.openPlayerTicket; renderMyTickets(); renderPlayerThread(); }));
  }

  function reopenPlayerTicket(id) {
    const arr = purgeExpiredTickets(), item = arr.find(t => t.id === id);
    if (!item || item.status !== 'Closed' || remainingClosedTime(item) <= 0) return;
    item.status = 'Open'; item.reopenedAt = new Date().toISOString(); item.updatedAt = item.reopenedAt; delete item.closedAt;
    item.messages = normalizedMessages(item);
    item.messages.push({ id: uid('MSG'), sender: 'system', senderName: 'Ticket System', text: 'The player reopened this ticket within the 48-hour window.', createdAt: item.reopenedAt, attachments: [], readByStaff: false });
    write(TICKETS_KEY, arr); renderMyTickets(); renderPlayerThread();
    discord(`Support Ticket ${item.id} has been reopened by the player.`, { title: item.subject, description: 'Reopened within the 48-hour transcript period.', color: 10833386 });
  }

  function renderPlayerThread() {
    const panel = document.getElementById('player-ticket-thread'); if (!panel) return;
    const userId = window.Auth?.getUser?.()?.id || 'guest';
    const all = purgeExpiredTickets(), ticket = all.find(t => t.id === activePlayerTicket && (t.ownerId || 'guest') === userId);
    if (!ticket) { activePlayerTicket = null; panel.innerHTML = '<div class="ticket-empty-state"><strong>Select a ticket</strong><p>Open one of your tickets to view the conversation.</p></div>'; return; }
    const messages = normalizedMessages(ticket);
    const banInfo = ticket.banId ? ` · Ban ID: ${esc(ticket.banId)}` : '';
    const closedBlock = ticket.status === 'Closed' ? `<div class="chat-closed-notice"><strong>This ticket is closed.</strong><p>You can reopen it for ${durationText(remainingClosedTime(ticket))}. It will then be permanently deleted.</p><button class="primary-button" type="button" id="player-reopen-ticket">Reopen Ticket</button></div>` : '';
    const composer = ticket.status === 'Closed' ? closedBlock : `<form class="ticket-chat-composer" id="player-chat-form"><textarea id="player-chat-text" rows="3" maxlength="2000" placeholder="Write a reply..."></textarea><div class="composer-actions"><label class="attachment-button">Attach images<input id="player-chat-files" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple></label><span id="player-chat-file-name"></span><button class="primary-button" type="submit">Send Reply</button></div><p class="ticket-form-message" id="player-chat-message"></p></form>`;
    panel.innerHTML = `<header class="thread-header"><div><span>${esc(ticket.id)}</span><h2>${esc(ticket.subject)}</h2><p>${esc(ticket.category)} · ${esc(ticket.priority)} priority${banInfo}</p></div><span class="thread-status">${esc(ticket.status)}</span></header><div class="ticket-chat-log">${messages.map(m => `<article class="chat-message ${m.sender==='staff'?'staff':m.sender==='system'?'system':'player'}"><div class="chat-message-meta"><strong>${esc(m.senderName || (m.sender==='staff'?'Union Staff':ticket.name))}</strong><span>${fmt(m.createdAt)}</span></div>${m.text?`<p>${esc(m.text).replace(/\n/g,'<br>')}</p>`:''}${attachmentHtml(m.attachments)}</article>`).join('')}</div>${composer}`;
    const log = panel.querySelector('.ticket-chat-log'); if (log) log.scrollTop = log.scrollHeight;
    bindImageViewer(panel);
    panel.querySelector('#player-reopen-ticket')?.addEventListener('click', () => reopenPlayerTicket(ticket.id));
    const fileInput = panel.querySelector('#player-chat-files');
    if (fileInput) fileInput.addEventListener('change', () => panel.querySelector('#player-chat-file-name').textContent = [...fileInput.files].map(f=>f.name).join(', '));
    const form = panel.querySelector('#player-chat-form');
    if (form) form.addEventListener('submit', async e => {
      e.preventDefault(); const status = panel.querySelector('#player-chat-message');
      try {
        const text = panel.querySelector('#player-chat-text').value.trim();
        const attachments = await filesToData(fileInput.files);
        if (!text && !attachments.length) throw new Error('Write a message or attach an image first.');
        const arr = purgeExpiredTickets(), item = arr.find(t => t.id === ticket.id); item.messages = normalizedMessages(item);
        item.messages.push({ id: uid('MSG'), sender: 'player', senderName: item.name, text, attachments, createdAt: new Date().toISOString(), readByStaff: false }); item.updatedAt = new Date().toISOString(); if (item.status==='Awaiting Player') item.status='In Progress'; write(TICKETS_KEY, arr);
        await discord(`Support Ticket ${item.id} has received a player reply.`, { title: item.subject, description: text || 'Image attachment added', color: 10833386 });
        renderMyTickets(); renderPlayerThread();
      } catch (error) { status.textContent = error.message; }
    });
  }

  renderMyTickets(); renderPlayerThread();

  const panel = document.getElementById('staff-panel-content');
  if (panel) {
    let tab = 'tickets';
    document.querySelectorAll('[data-staff-tab]').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('[data-staff-tab]').forEach(x => x.classList.remove('active')); b.classList.add('active'); tab = b.dataset.staffTab; activeStaffTicket = null; renderStaff();
    }));

    function stats() {
      const t = purgeExpiredTickets(), a = read(APPS_KEY);
      const unread = t.filter(x=>x.status!=='Closed').reduce((n,x)=>n+normalizedMessages(x).filter(m=>m.sender==='player' && !m.readByStaff).length,0);
      document.getElementById('staff-stats').innerHTML = `<article><span>OPEN TICKETS</span><strong>${t.filter(x=>x.status!=='Closed').length}</strong></article><article><span>UNREAD MESSAGES</span><strong>${unread}</strong></article><article><span>TRANSCRIPTS</span><strong>${t.filter(x=>x.status==='Closed').length}</strong></article><article><span>PENDING APPLICATIONS</span><strong>${a.filter(x=>x.status==='Pending Review').length}</strong></article>`;
    }

    function ticketRows(arr, emptyTitle, emptyText) {
      return arr.length ? arr.map(t=>{const msgs=normalizedMessages(t), unread=msgs.filter(m=>m.sender==='player'&&!m.readByStaff).length,last=msgs[msgs.length-1];return `<button class="staff-ticket-row ${activeStaffTicket===t.id?'active':''}" data-staff-ticket="${esc(t.id)}"><div><span>${esc(t.id)}${unread&&t.status!=='Closed'?` <b>${unread}</b>`:''}</span><h3>${esc(t.subject)}</h3><p>${esc(last?.text || 'Image attachment').slice(0,70)}</p></div><small>${t.status==='Closed'?durationText(remainingClosedTime(t)):esc(t.status)}</small></button>`}).join('') : `<div class="ticket-empty-state"><strong>${emptyTitle}</strong><p>${emptyText}</p></div>`;
    }

    function renderTicketInbox(closedOnly=false) {
      const all = purgeExpiredTickets();
      const arr = all.filter(t => closedOnly ? t.status === 'Closed' : t.status !== 'Closed');
      panel.innerHTML = `<div class="staff-ticket-workspace"><aside class="staff-ticket-inbox"><div class="staff-inbox-head"><span>${closedOnly?'TRANSCRIPTS':'LIVE TICKETS'}</span><strong>${arr.length}</strong></div>${ticketRows(arr, closedOnly?'No transcripts':'No tickets', closedOnly?'Closed tickets remain here for 48 hours.':'New tickets will appear here.')}</aside><section id="staff-live-thread" class="staff-live-thread"><div class="ticket-empty-state"><strong>Select a ${closedOnly?'transcript':'conversation'}</strong><p>Choose a ticket to view its full history.</p></div></section></div>`;
      panel.querySelectorAll('[data-staff-ticket]').forEach(b=>b.addEventListener('click',()=>{activeStaffTicket=b.dataset.staffTicket;if(!closedOnly)markRead(activeStaffTicket);renderTicketInbox(closedOnly);renderStaffThread(closedOnly);}));
      if (activeStaffTicket) renderStaffThread(closedOnly);
    }

    function markRead(id){const arr=purgeExpiredTickets(),item=arr.find(t=>t.id===id);if(!item)return;item.messages=normalizedMessages(item).map(m=>({...m,readByStaff:m.sender==='player'?true:m.readByStaff}));write(TICKETS_KEY,arr);stats();}

    function changeTicketStatus(ticket, status) {
      const data = purgeExpiredTickets(), item = data.find(x=>x.id===ticket.id); if (!item) return;
      item.status = status; item.updatedAt = new Date().toISOString();
      if (status === 'Closed') item.closedAt = item.updatedAt; else delete item.closedAt;
      write(TICKETS_KEY,data); renderStaff();
    }

    function renderStaffThread(transcriptMode=false){
      const holder=document.getElementById('staff-live-thread');if(!holder)return;const arr=purgeExpiredTickets(),t=arr.find(x=>x.id===activeStaffTicket);if(!t)return;
      const messages=normalizedMessages(t); const banInfo=t.banId?` · Ban ID: ${esc(t.banId)}`:'';
      const statusControl = transcriptMode ? `<div class="transcript-actions"><span>Deletes in ${durationText(remainingClosedTime(t))}</span><button type="button" class="primary-button" id="staff-reopen-ticket">Reopen Ticket</button></div>` : `<select id="staff-ticket-status">${['Open','In Progress','Awaiting Player','Closed'].map(s=>`<option ${t.status===s?'selected':''}>${s}</option>`).join('')}</select>`;
      const composer = transcriptMode ? `<div class="chat-closed-notice"><strong>Closed transcript</strong><p>This ticket will be permanently deleted 48 hours after it was closed unless it is reopened.</p></div>` : `<form class="ticket-chat-composer" id="staff-chat-form"><textarea id="staff-chat-text" rows="3" maxlength="2000" placeholder="Reply as Union Staff..."></textarea><div class="composer-actions"><label class="attachment-button">Attach images<input id="staff-chat-files" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple></label><span id="staff-chat-file-name"></span><button class="primary-button" type="submit">Send Reply</button></div><p class="ticket-form-message" id="staff-chat-message"></p></form>`;
      holder.innerHTML=`<header class="thread-header"><div><span>${esc(t.id)}</span><h2>${esc(t.subject)}</h2><p>${esc(t.name)} · ${esc(t.category)} · ${esc(t.priority)}${banInfo}</p></div>${statusControl}</header><div class="ticket-chat-log staff-log">${messages.map(m=>`<article class="chat-message ${m.sender==='staff'?'staff':m.sender==='system'?'system':'player'}"><div class="chat-message-meta"><strong>${esc(m.senderName || (m.sender==='staff'?'Union Staff':t.name))}</strong><span>${fmt(m.createdAt)}</span></div>${m.text?`<p>${esc(m.text).replace(/\n/g,'<br>')}</p>`:''}${attachmentHtml(m.attachments)}</article>`).join('')}</div>${composer}`;
      const log=holder.querySelector('.ticket-chat-log');if(log)log.scrollTop=log.scrollHeight;bindImageViewer(holder);
      holder.querySelector('#staff-reopen-ticket')?.addEventListener('click',()=>changeTicketStatus(t,'Open'));
      const select=holder.querySelector('#staff-ticket-status');if(select)select.addEventListener('change',()=>changeTicketStatus(t,select.value));
      const files=holder.querySelector('#staff-chat-files');if(files)files.addEventListener('change',()=>holder.querySelector('#staff-chat-file-name').textContent=[...files.files].map(f=>f.name).join(', '));
      const form=holder.querySelector('#staff-chat-form');if(form)form.addEventListener('submit',async e=>{e.preventDefault();const status=holder.querySelector('#staff-chat-message');try{const text=holder.querySelector('#staff-chat-text').value.trim(),attachments=await filesToData(files.files);if(!text&&!attachments.length)throw new Error('Write a reply or attach an image first.');const data=purgeExpiredTickets(),item=data.find(x=>x.id===t.id);item.messages=normalizedMessages(item);item.messages.push({id:uid('MSG'),sender:'staff',senderName:'Union Staff',text,attachments,createdAt:new Date().toISOString(),readByStaff:true});item.updatedAt=new Date().toISOString();if(item.status==='Open')item.status='Awaiting Player';write(TICKETS_KEY,data);await discord(`Support Ticket ${item.id} has been responded to.`,{title:item.subject,description:text||'Image attachment added',color:10833386});renderTicketInbox(false);}catch(error){status.textContent=error.message;}});
    }

    async function saveApplication(id){const arr=read(APPS_KEY),item=arr.find(x=>x.id===id);if(!item)return;item.status=document.querySelector(`[data-status="${id}"]`).value;item.response=document.querySelector(`[data-response="${id}"]`).value.trim();write(APPS_KEY,arr);await discord(`Application ${id} has been updated.`,{title:'Application update',description:item.response||item.status,color:10833386});renderStaff();}

    function renderStaff(){
      stats();
      if(tab==='settings'){panel.innerHTML=`<div class="settings-panel"><span>DISCORD INTEGRATION</span><h2>Prepared for final setup</h2><p>Open <code>js/portal-config.js</code> when you are ready. Add the webhook URL and change <code>discordEnabled</code> to <code>true</code>. No Discord role restrictions or authentication are active yet.</p><pre>window.UNION_PORTAL_CONFIG = {\n  discordWebhook: '',\n  discordEnabled: false\n};</pre></div>`;return;}
      if(tab==='tickets'){renderTicketInbox(false);return;}
      if(tab==='transcripts'){renderTicketInbox(true);return;}
      const arr=read(APPS_KEY);panel.innerHTML=`<div class="staff-record-list">${arr.length?arr.map(x=>`<article class="staff-record"><header><div><span>${esc(x.id)}</span><h3>${esc(x.type)}</h3><p>${fmt(x.createdAt)}</p></div><select data-status="${esc(x.id)}">${['Pending Review','Interview','Accepted','Declined'].map(s=>`<option ${x.status===s?'selected':''}>${s}</option>`).join('')}</select></header><div class="staff-record-data">${Object.entries(x.data||{}).map(([k,v])=>`<p><strong>${esc(k.replace(/([A-Z])/g,' $1'))}</strong><span>${esc(v)}</span></p>`).join('')}</div><label>Staff response<textarea data-response="${esc(x.id)}" rows="4">${esc(x.response||'')}</textarea></label><button class="primary-button" data-app-save="${esc(x.id)}">Save Update</button></article>`).join(''):'<div class="ticket-empty-state"><strong>No applications yet</strong><p>New submissions will appear here.</p></div>'}</div>`;panel.querySelectorAll('[data-app-save]').forEach(b=>b.addEventListener('click',()=>saveApplication(b.dataset.appSave)));
    }
    renderStaff();
    setInterval(() => { purgeExpiredTickets(); renderStaff(); }, 60000);
  }

  window.addEventListener('storage', e => { if ([TICKETS_KEY,APPS_KEY].includes(e.key)) { purgeExpiredTickets(); renderMyTickets(); renderPlayerThread(); if(panel) location.reload(); } });
})();

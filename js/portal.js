(() => {
  const cfg = window.UNION_PORTAL_CONFIG || { discordWebhook: '', discordEnabled: false };
  const TICKETS_KEY = 'unionTickets';
  const APPS_KEY = 'unionApplications';
  const MAX_FILES = Number(cfg.tickets?.maxAttachments) || 4;
  const MAX_FILE_SIZE = (Number(cfg.tickets?.maxAttachmentSizeMB) || 2) * 1024 * 1024;
  const CLOSED_RETENTION_MS = (Number(cfg.tickets?.autoDeleteHours) || 48) * 60 * 60 * 1000;
  let activePlayerTicket = null;
  let activeStaffTicket = null;

  const API_BASE =
    String(cfg.api?.baseUrl || "https://union-roleplay-api.danielclifford2808.workers.dev")
      .replace(/\/$/, "");

  const getAccessToken = () =>
    localStorage.getItem("union_access_token") ||
    sessionStorage.getItem("union_access_token") ||
    "";


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

function getFormData(form) {
  const data = {};

  form.querySelectorAll("[name]").forEach(field => {
    if (field.type === "checkbox") {
      data[field.name] = field.checked;
    } else {
      data[field.name] = field.value;
    }
  });

  return data;
}

function calculateFormProgress(form) {
  const requiredFields = [...form.querySelectorAll("[required]")];

  if (!requiredFields.length) {
    return 0;
  }

  const completedFields = requiredFields.filter(field => {
    if (field.type === "checkbox") {
      return field.checked;
    }

    return String(field.value || "").trim() !== "";
  }).length;

  return Math.round(
    (completedFields / requiredFields.length) * 100
  );
}

function setApplicationSubmittedState(form, application = {}) {
  form.dataset.submitted = "true";
  form.querySelectorAll("input, textarea, select, button[type='submit']").forEach(field => {
    field.disabled = true;
  });

  const message = form.querySelector(".portal-form-message");
  if (message) {
    const status = application.status || "Submitted";
    const reference = application.application_id || application.union_id || application.id || "";
    message.textContent = reference
      ? `Application submitted — ${status}. Reference: ${reference}`
      : `Application submitted — ${status}.`;
  }
}

async function saveApplicationDraft(form, showMessage = false) {
  if (form.dataset.submitted === "true") return false;

  const token = getAccessToken();

  if (!token) {
    return false;
  }

  const response = await fetch(
    `${API_BASE}/api/applications/save`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        application_type: form.dataset.applicationType || "General Application",
        progress: calculateFormProgress(form),
        data: getFormData(form)
      })
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || "The application draft could not be saved."
    );
  }

  if (showMessage) {
    const message =
      form.querySelector(".portal-form-message");

    if (message) {
      message.textContent = "Application draft saved.";
    }
  }

  return true;
}

async function loadApplicationDraft(form) {
  const token = getAccessToken();

  if (!token) {
    return;
  }

  let response = await fetch(
    `${API_BASE}/api/applications/me?type=${encodeURIComponent(form.dataset.applicationType || "General Application")}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  let result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || "The application draft could not be loaded."
    );
  }

  if (!result.application) {
    const createResponse = await fetch(
      `${API_BASE}/api/applications/create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          application_type: form.dataset.applicationType || "General Application"
        })
      }
    );

    const createResult = await createResponse.json();

    if (!createResponse.ok || !createResult.success) {
      throw new Error(
        createResult.error ||
        "The application draft could not be created."
      );
    }

    result = createResult;
  }

  let savedData = {};

  try {
    savedData =
      typeof result.application?.data === "string"
        ? JSON.parse(result.application.data || "{}")
        : result.application?.data || {};
  } catch {
    savedData = {};
  }

  Object.entries(savedData).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);

    if (!field) {
      return;
    }

    if (field.type === "checkbox") {
      field.checked = Boolean(value);
    } else {
      field.value = value ?? "";
    }
  });

  const user = window.Auth?.getUser?.();
  const discordField =
    form.elements.namedItem("discordName");

  if (
    discordField &&
    !discordField.value &&
    user
  ) {
    discordField.value =
      user.discord_username ||
      user.discordUsername ||
      user.username ||
      "";
  }

  if (discordField) {
    discordField.readOnly = true;
  }

  const message =
    form.querySelector(".portal-form-message");

  if (String(result.application?.status || "Draft").toLowerCase() !== "draft") {
    setApplicationSubmittedState(form, result.application);
    return;
  }

  if (message && result.application?.last_saved_at) {
    message.textContent =
      `Draft restored. Last saved: ${
        new Date(
          Number(result.application.last_saved_at)
        ).toLocaleString()
      }`;
  }
}

document
  .querySelectorAll("[data-application-form]")
  .forEach(form => {
    let saveTimer = null;

    loadApplicationDraft(form).catch(error => {
      const message = form.querySelector(".portal-form-message");
      if (message) message.textContent = error.message;
    });

    const queueSave = delay => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        saveApplicationDraft(form).catch(error => {
          const message = form.querySelector(".portal-form-message");
          if (message) message.textContent = error.message;
        });
      }, delay);
    };

    form.addEventListener("input", () => queueSave(1000));
    form.addEventListener("change", () => queueSave(500));

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const message = form.querySelector(".portal-form-message");

      try {
        if (form.dataset.submitted === "true") {
          throw new Error("This application has already been submitted.");
        }

        const token = getAccessToken();
        if (!token) throw new Error("Please log in before submitting your application.");

        const submitResponse = await fetch(`${API_BASE}/api/applications/submit`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            application_type: form.dataset.applicationType || "General Application",
            progress: calculateFormProgress(form),
            data: getFormData(form)
          })
        });

        const submitResult = await submitResponse.json();
        if (!submitResponse.ok || !submitResult.success) {
          throw new Error(submitResult.error || "Application could not be submitted.");
        }

        setApplicationSubmittedState(form, submitResult.application || {});
      } catch (error) {
        if (message) message.textContent = error.message || "The application could not be submitted.";
      }
    });
  });

  const ticketForm = document.getElementById('support-ticket-form');
  const categoryInput = document.getElementById('ticket-category');
  const banIdField = document.getElementById('ban-id-field');
  const banIdInput = document.getElementById('ticket-ban-id');
  const initialFiles = document.getElementById('ticket-attachments');
  const initialPreview = document.getElementById('ticket-file-preview');
  let playerTickets = [];
  let currentPlayerTicket = null;

  async function apiRequest(path, options = {}) {
    const token = getAccessToken();
    if (!token) throw new Error('Please log in with Discord first.');
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === false) throw new Error(result.error || 'The request could not be completed.');
    return result;
  }

  function parseTicketMessages(ticket) {
    if (Array.isArray(ticket.messages)) return ticket.messages;
    try { return JSON.parse(ticket.messages || '[]'); } catch { return []; }
  }

  function normaliseTicket(ticket) {
    return {
      ...ticket,
      id: ticket.reference || ticket.id,
      reference: ticket.reference || ticket.id,
      banId: ticket.ban_id || ticket.banId || '',
      createdAt: ticket.created_at || ticket.createdAt,
      updatedAt: ticket.updated_at || ticket.updatedAt,
      closedAt: ticket.closed_at || ticket.closedAt,
      messages: parseTicketMessages(ticket)
    };
  }

  function remainingClosedTime(ticket) {
    const deleteAt = Number(ticket.delete_at || 0);
    return deleteAt ? Math.max(0, deleteAt - Date.now()) : CLOSED_RETENTION_MS;
  }

  function updateBanIdRequirement() {
    if (!categoryInput || !banIdField || !banIdInput) return;
    const required = categoryInput.value === 'Ban Appeal';
    banIdField.hidden = !required;
    banIdInput.required = required;
    if (!required) banIdInput.value = '';
  }

  if (categoryInput) { categoryInput.addEventListener('change', updateBanIdRequirement); updateBanIdRequirement(); }
  if (initialFiles) initialFiles.addEventListener('change', () => {
    if (initialPreview) initialPreview.innerHTML = [...initialFiles.files].map(f => `<span>${esc(f.name)} <small>${Math.round(f.size/1024)} KB</small></span>`).join('');
  });

  async function loadMyTickets() {
    if (!document.getElementById('local-ticket-list')) return;
    const result = await apiRequest('/api/tickets/me');
    playerTickets = (result.tickets || []).map(normaliseTicket);
    if (activePlayerTicket) currentPlayerTicket = playerTickets.find(t => String(t.reference) === String(activePlayerTicket)) || null;
    renderMyTickets();
    renderPlayerThread();
  }

  if (ticketForm) ticketForm.addEventListener('submit', async e => {
    e.preventDefault();
    const message = document.getElementById('ticket-form-message');
    const button = ticketForm.querySelector('button[type="submit"]');
    try {
      if (button) { button.disabled = true; button.textContent = 'Opening Ticket...'; }
      const category = categoryInput.value;
      const banId = banIdInput?.value.trim() || '';
      if (category === 'Ban Appeal' && !banId) throw new Error('A Ban ID is required to open a Ban Appeal ticket.');
      const attachments = await filesToData(initialFiles?.files || []);
      const result = await apiRequest('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          category,
          ban_id: banId,
          name: document.getElementById('ticket-name').value.trim(),
          priority: document.getElementById('ticket-priority').value,
          subject: document.getElementById('ticket-subject').value.trim(),
          details: document.getElementById('ticket-details').value.trim(),
          attachments
        })
      });
      message.textContent = `Ticket opened. Reference: ${result.ticket.reference}`;
      ticketForm.reset(); updateBanIdRequirement(); if (initialPreview) initialPreview.innerHTML = '';
      activePlayerTicket = result.ticket.reference;
      await loadMyTickets();
    } catch (error) { if (message) message.textContent = error.message; }
    finally { if (button) { button.disabled = false; button.textContent = 'Open Support Ticket'; } }
  });

  function renderMyTickets() {
    const el = document.getElementById('local-ticket-list'); if (!el) return;
    el.innerHTML = playerTickets.length ? playerTickets.map(t => {
      const msgs = parseTicketMessages(t), last = msgs[msgs.length - 1];
      const closedHint = t.status === 'Closed' ? ` · deletes in ${durationText(remainingClosedTime(t))}` : '';
      return `<button class="local-ticket-card ${String(activePlayerTicket)===String(t.reference)?'active':''}" data-open-player-ticket="${esc(t.reference)}"><div class="local-ticket-ref">${esc(t.reference)}</div><div><h3>${esc(t.subject)}</h3><p>${fmt(t.updatedAt || t.createdAt)} · ${esc(t.category)}${closedHint}</p><div class="ticket-last-message">${esc(last?.sender_name || last?.senderName || '')}: ${esc((last?.text || 'Attachment').slice(0,80))}</div></div><span class="local-ticket-status">${esc(t.status)}</span></button>`;
    }).join('') : '<div class="ticket-empty-state"><strong>No tickets yet</strong><p>Your submitted tickets will appear here.</p></div>';
    el.querySelectorAll('[data-open-player-ticket]').forEach(b => b.addEventListener('click', async () => {
      activePlayerTicket = b.dataset.openPlayerTicket;
      const result = await apiRequest(`/api/tickets/${encodeURIComponent(activePlayerTicket)}`);
      currentPlayerTicket = normaliseTicket(result.ticket);
      renderMyTickets(); renderPlayerThread();
    }));
  }

  async function reopenPlayerTicket(reference) {
    await apiRequest(`/api/tickets/${encodeURIComponent(reference)}/reopen`, { method: 'POST', body: '{}' });
    await loadMyTickets();
  }

  function renderPlayerThread() {
    const panel = document.getElementById('player-ticket-thread'); if (!panel) return;
    const ticket = currentPlayerTicket || playerTickets.find(t => String(t.reference) === String(activePlayerTicket));
    if (!ticket) { panel.innerHTML = '<div class="ticket-empty-state"><strong>Select a ticket</strong><p>Open one of your tickets to view the conversation.</p></div>'; return; }
    const messages = parseTicketMessages(ticket);
    const banInfo = ticket.banId ? ` · Ban ID: ${esc(ticket.banId)}` : '';
    const canReopen = ticket.status === 'Closed' && remainingClosedTime(ticket) > 0;
    const closedBlock = ticket.status === 'Closed' ? `<div class="chat-closed-notice"><strong>This ticket is closed.</strong><p>${canReopen ? `You can reopen it for ${durationText(remainingClosedTime(ticket))}.` : 'The reopen window has expired.'}</p>${canReopen ? '<button class="primary-button" type="button" id="player-reopen-ticket">Reopen Ticket</button>' : ''}</div>` : '';
    const composer = ticket.status === 'Closed' ? closedBlock : `<form class="ticket-chat-composer" id="player-chat-form"><textarea id="player-chat-text" rows="3" maxlength="2000" placeholder="Write a reply..."></textarea><div class="composer-actions"><label class="attachment-button">Attach images<input id="player-chat-files" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple></label><span id="player-chat-file-name"></span><button class="primary-button" type="submit">Send Reply</button></div><p class="ticket-form-message" id="player-chat-message"></p></form>`;
    panel.innerHTML = `<header class="thread-header"><div><span>${esc(ticket.reference)}</span><h2>${esc(ticket.subject)}</h2><p>${esc(ticket.category)} · ${esc(ticket.priority)} priority${banInfo}</p></div><span class="thread-status">${esc(ticket.status)}</span></header><div class="ticket-chat-log">${messages.map(m => `<article class="chat-message ${m.sender==='staff'?'staff':m.sender==='system'?'system':'player'}"><div class="chat-message-meta"><strong>${esc(m.sender_name || m.senderName || (m.sender==='staff'?'Union Staff':ticket.name))}</strong><span>${fmt(m.created_at || m.createdAt)}</span></div>${m.text?`<p>${esc(m.text).replace(/\n/g,'<br>')}</p>`:''}${attachmentHtml(m.attachments || [])}</article>`).join('')}</div>${composer}`;
    const log = panel.querySelector('.ticket-chat-log'); if (log) log.scrollTop = log.scrollHeight;
    bindImageViewer(panel);
    panel.querySelector('#player-reopen-ticket')?.addEventListener('click', () => reopenPlayerTicket(ticket.reference));
    const fileInput = panel.querySelector('#player-chat-files');
    if (fileInput) fileInput.addEventListener('change', () => panel.querySelector('#player-chat-file-name').textContent = [...fileInput.files].map(f=>f.name).join(', '));
    panel.querySelector('#player-chat-form')?.addEventListener('submit', async e => {
      e.preventDefault(); const status = panel.querySelector('#player-chat-message');
      try {
        const text = panel.querySelector('#player-chat-text').value.trim();
        const attachments = await filesToData(fileInput?.files || []);
        if (!text && !attachments.length) throw new Error('Write a message or attach an image first.');
        await apiRequest(`/api/tickets/${encodeURIComponent(ticket.reference)}/messages`, { method:'POST', body:JSON.stringify({ text, attachments }) });
        const result = await apiRequest(`/api/tickets/${encodeURIComponent(ticket.reference)}`);
        currentPlayerTicket = normaliseTicket(result.ticket);
        await loadMyTickets();
      } catch (error) { if (status) status.textContent = error.message; }
    });
  }

  if (document.getElementById('local-ticket-list')) loadMyTickets().catch(error => {
    const el = document.getElementById('local-ticket-list');
    if (el) el.innerHTML = `<div class="ticket-empty-state"><strong>Tickets unavailable</strong><p>${esc(error.message)}</p></div>`;
  });

  const panel = document.getElementById('staff-panel-content');
  if (panel) {
    let tab = 'dashboard';
    let staffApplications = [];
    let applicationSearch = '';
    let applicationStatus = '';
    let applicationType = '';
    let applicationSort = 'newest';
    let applicationAssigned = '';
    let applicationPriority = '';
    let applicationPage = 1;
    const applicationPageSize = 8;
    let dashboardData = { summary: {}, activity: [] };
    document.querySelectorAll('[data-staff-tab]').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('[data-staff-tab]').forEach(x => x.classList.remove('active')); b.classList.add('active'); tab = b.dataset.staffTab; activeStaffTicket = null; renderStaff();
    }));

    let staffTickets = [];

    async function loadStaffTickets(closedOnly = false) {
      const result = await apiRequest(`/api/staff/tickets${closedOnly ? '?status=Closed' : '?active=1'}`);
      staffTickets = (result.tickets || []).map(normaliseTicket);
      return staffTickets;
    }

    function stats() {
      const unread = staffTickets.reduce((n, x) => n + Number(x.unread_count || 0), 0);
      const pending = staffApplications.filter(x => ['Submitted', 'Pending Review'].includes(x.status)).length;
      const holder = document.getElementById('staff-stats');
      if (holder) holder.innerHTML = `<article><span>OPEN TICKETS</span><strong>${staffTickets.filter(x=>x.status!=='Closed').length}</strong></article><article><span>UNREAD MESSAGES</span><strong>${unread}</strong></article><article><span>TRANSCRIPTS</span><strong>${staffTickets.filter(x=>x.status==='Closed').length}</strong></article><article><span>PENDING APPLICATIONS</span><strong>${pending}</strong></article>`;
    }

    function ticketRows(arr, emptyTitle, emptyText) {
      return arr.length ? arr.map(t=>{const msgs=parseTicketMessages(t),last=msgs[msgs.length-1];return `<button class="staff-ticket-row ${String(activeStaffTicket)===String(t.reference)?'active':''}" data-staff-ticket="${esc(t.reference)}"><div><span>${esc(t.reference)}${Number(t.unread_count)>0&&t.status!=='Closed'?` <b>${t.unread_count}</b>`:''}</span><h3>${esc(t.subject)}</h3><p>${esc(last?.text || 'Image attachment').slice(0,70)}</p></div><small>${t.status==='Closed'?durationText(remainingClosedTime(t)):esc(t.status)}</small></button>`}).join('') : `<div class="ticket-empty-state"><strong>${emptyTitle}</strong><p>${emptyText}</p></div>`;
    }

    async function renderTicketInbox(closedOnly=false) {
      panel.innerHTML = '<div class="ticket-empty-state"><strong>Loading tickets...</strong><p>Fetching conversations from the Union database.</p></div>';
      try {
        const arr = await loadStaffTickets(closedOnly);
        stats();
        panel.innerHTML = `<div class="staff-ticket-workspace"><aside class="staff-ticket-inbox"><div class="staff-inbox-head"><span>${closedOnly?'TRANSCRIPTS':'LIVE TICKETS'}</span><strong>${arr.length}</strong></div>${ticketRows(arr, closedOnly?'No transcripts':'No tickets', closedOnly?'Closed tickets remain here for 48 hours.':'New tickets will appear here.')}</aside><section id="staff-live-thread" class="staff-live-thread"><div class="ticket-empty-state"><strong>Select a ${closedOnly?'transcript':'conversation'}</strong><p>Choose a ticket to view its full history.</p></div></section></div>`;
        panel.querySelectorAll('[data-staff-ticket]').forEach(b=>b.addEventListener('click', async()=>{activeStaffTicket=b.dataset.staffTicket;await apiRequest(`/api/staff/tickets/${encodeURIComponent(activeStaffTicket)}/read`,{method:'POST',body:'{}'});renderTicketInbox(closedOnly).then(()=>renderStaffThread(closedOnly));}));
        if (activeStaffTicket) await renderStaffThread(closedOnly);
      } catch (error) { panel.innerHTML = `<div class="ticket-empty-state"><strong>Tickets unavailable</strong><p>${esc(error.message)}</p></div>`; }
    }

    async function changeTicketStatus(ticket, status) {
      await apiRequest(`/api/staff/tickets/${encodeURIComponent(ticket.reference)}/status`, { method:'POST', body:JSON.stringify({status}) });
      await renderTicketInbox(status === 'Closed' ? true : false);
    }

    async function renderStaffThread(transcriptMode=false){
      const holder=document.getElementById('staff-live-thread');if(!holder||!activeStaffTicket)return;
      const result=await apiRequest(`/api/staff/tickets/${encodeURIComponent(activeStaffTicket)}`);const t=normaliseTicket(result.ticket);
      const messages=parseTicketMessages(t); const banInfo=t.banId?` · Ban ID: ${esc(t.banId)}`:'';
      const statusControl = transcriptMode ? `<div class="transcript-actions"><span>Deletes in ${durationText(remainingClosedTime(t))}</span><button type="button" class="primary-button" id="staff-reopen-ticket">Reopen Ticket</button></div>` : `<select id="staff-ticket-status">${['Open','In Progress','Awaiting Player','Closed'].map(s=>`<option ${t.status===s?'selected':''}>${s}</option>`).join('')}</select>`;
      const composer = transcriptMode ? `<div class="chat-closed-notice"><strong>Closed transcript</strong><p>This ticket will be permanently deleted 48 hours after it was closed unless it is reopened.</p></div>` : `<form class="ticket-chat-composer" id="staff-chat-form"><textarea id="staff-chat-text" rows="3" maxlength="2000" placeholder="Reply as Union Staff..."></textarea><div class="composer-actions"><label class="attachment-button">Attach images<input id="staff-chat-files" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple></label><span id="staff-chat-file-name"></span><button class="primary-button" type="submit">Send Reply</button></div><p class="ticket-form-message" id="staff-chat-message"></p></form>`;
      holder.innerHTML=`<header class="thread-header"><div><span>${esc(t.reference)}</span><h2>${esc(t.subject)}</h2><p>${esc(t.name)} · ${esc(t.category)} · ${esc(t.priority)}${banInfo}</p></div>${statusControl}</header><div class="ticket-chat-log staff-log">${messages.map(m=>`<article class="chat-message ${m.sender==='staff'?'staff':m.sender==='system'?'system':'player'}"><div class="chat-message-meta"><strong>${esc(m.sender_name || m.senderName || (m.sender==='staff'?'Union Staff':t.name))}</strong><span>${fmt(m.created_at || m.createdAt)}</span></div>${m.text?`<p>${esc(m.text).replace(/\n/g,'<br>')}</p>`:''}${attachmentHtml(m.attachments || [])}</article>`).join('')}</div>${composer}`;
      const log=holder.querySelector('.ticket-chat-log');if(log)log.scrollTop=log.scrollHeight;bindImageViewer(holder);
      holder.querySelector('#staff-reopen-ticket')?.addEventListener('click',()=>changeTicketStatus(t,'Open'));
      const select=holder.querySelector('#staff-ticket-status');if(select)select.addEventListener('change',()=>changeTicketStatus(t,select.value));
      const files=holder.querySelector('#staff-chat-files');if(files)files.addEventListener('change',()=>holder.querySelector('#staff-chat-file-name').textContent=[...files.files].map(f=>f.name).join(', '));
      holder.querySelector('#staff-chat-form')?.addEventListener('submit',async e=>{e.preventDefault();const status=holder.querySelector('#staff-chat-message');try{const message=holder.querySelector('#staff-chat-text').value.trim(),attachments=await filesToData(files?.files||[]);if(!message&&!attachments.length)throw new Error('Write a reply or attach an image first.');await apiRequest(`/api/staff/tickets/${encodeURIComponent(t.reference)}/messages`,{method:'POST',body:JSON.stringify({text:message,attachments})});await renderTicketInbox(false);}catch(error){if(status)status.textContent=error.message;}});
    }

    async function loadApplicationDashboard() {
      const result = await apiRequest('/api/staff/applications/dashboard');
      dashboardData = result || { summary: {}, activity: [] };
      return dashboardData;
    }

    async function setApplicationAssignment(id, mode) {
      const body = mode === 'claim' ? { claim: true } : { assigned_to: '' };
      await apiRequest(`/api/staff/application/${id}/assignment`, { method: 'POST', body: JSON.stringify(body) });
      await renderApplications();
    }

    async function addInternalNote(id) {
      const input = panel.querySelector(`[data-new-note="${id}"]`);
      const note = input?.value.trim() || '';
      if (!note) return alert('Write an internal note first.');
      await apiRequest(`/api/staff/application/${id}/notes`, { method: 'POST', body: JSON.stringify({ note }) });
      await renderApplications();
    }

    function renderDashboardCards(summary) {
      const cards = [
        ['TOTAL APPLICATIONS', summary.total || 0],
        ['PENDING REVIEW', summary.pending || 0],
        ['INTERVIEWS', summary.interviews || 0],
        ['ACCEPTED', summary.accepted || 0],
        ['DECLINED', summary.declined || 0],
        ['LAST 7 DAYS', summary.this_week || 0],
        ['LAST 30 DAYS', summary.this_month || 0]
      ];
      return `<div class="recruitment-summary-grid">${cards.map(([label,value]) => `<article><span>${label}</span><strong>${Number(value)}</strong></article>`).join('')}</div>`;
    }

    async function renderDashboard() {
      panel.innerHTML = '<div class="ticket-empty-state"><strong>Loading dashboard...</strong><p>Building the latest recruitment overview.</p></div>';
      try {
        const result = await loadApplicationDashboard();
        const activity = result.activity || [];
        panel.innerHTML = `${renderDashboardCards(result.summary || {})}
          <div class="recruitment-dashboard-columns">
            <section class="recruitment-dashboard-card"><header><span>RECENT ACTIVITY</span><h2>Recruitment timeline</h2></header>
              <div class="recruitment-activity-list">${activity.length ? activity.map(item => `<article><strong>${esc(item.action)}</strong><p>${esc(item.actor_name || 'Union Staff')}${item.details ? ` · ${esc(item.details).slice(0,140)}` : ''}</p><time>${fmt(Number(item.created_at))}</time></article>`).join('') : '<div class="ticket-empty-state"><strong>No activity yet</strong><p>Assignments, notes and review decisions will appear here.</p></div>'}</div>
            </section>
            <section class="recruitment-dashboard-card recruitment-quick-actions"><header><span>QUICK ACTIONS</span><h2>Application management</h2></header>
              <button class="primary-button" data-open-applications>Open application queue</button>
              <p>Search, claim, prioritise and review every department application from one queue.</p>
            </section>
          </div>`;
        panel.querySelector('[data-open-applications]')?.addEventListener('click', () => {
          tab = 'applications';
          document.querySelectorAll('[data-staff-tab]').forEach(x => x.classList.toggle('active', x.dataset.staffTab === 'applications'));
          renderStaff();
        });
      } catch (error) {
        panel.innerHTML = `<div class="ticket-empty-state"><strong>Dashboard unavailable</strong><p>${esc(error.message)}</p></div>`;
      }
    }

    async function loadStaffApplications() {
      const token = getAccessToken();
      if (!token) throw new Error("Please log in with an authorised staff account.");

      const response = await fetch(`${API_BASE}/api/staff/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Applications could not be loaded.");
      }
      staffApplications = result.applications || [];
      return staffApplications;
    }

    function parseApplicationData(application) {
      try {
        return typeof application.data === 'string'
          ? JSON.parse(application.data || '{}')
          : (application.data || {});
      } catch {
        return {};
      }
    }

    async function saveApplication(id) {
      const token = getAccessToken();
      const status = document.querySelector(`[data-status="${id}"]`)?.value || 'Pending Review';
      const reviewerNotes = document.querySelector(`[data-notes="${id}"]`)?.value.trim() || '';
      const priority = document.querySelector(`[data-priority="${id}"]`)?.value || 'Normal';
      const staffResponse = document.querySelector(`[data-response="${id}"]`)?.value.trim() || '';
      const button = document.querySelector(`[data-app-save="${id}"]`);
      if (button) { button.disabled = true; button.textContent = 'Saving...'; }

      try {
        const response = await fetch(`${API_BASE}/api/staff/application/${id}/review`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status,
            reviewer_notes: reviewerNotes,
            staff_response: staffResponse,
            priority
          })
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || 'Review could not be saved.');
        await loadStaffApplications();
        await renderStaff();
      } catch (error) {
        if (button) { button.disabled = false; button.textContent = 'Save Update'; }
        alert(error.message);
      }
    }

    async function renderApplications() {
      panel.innerHTML = '<div class="ticket-empty-state"><strong>Loading applications...</strong><p>Fetching submissions from the Union database.</p></div>';
      try {
        await loadStaffApplications();
        stats();

        let arr = [...staffApplications];
        if (applicationSearch) {
          const q = applicationSearch.toLowerCase();
          arr = arr.filter(x => [
            x.union_id,
            x.discord_id,
            x.discord_username,
            x.discord_display_name,
            x.status
          ].some(value => String(value || '').toLowerCase().includes(q)));
        }
        if (applicationStatus) {
          arr = arr.filter(x => String(x.status || '').toLowerCase() === applicationStatus.toLowerCase());
        }
        if (applicationType) arr = arr.filter(x => String(x.application_type || 'Whitelist Application') === applicationType);
        if (applicationAssigned === 'assigned') arr = arr.filter(x => x.assigned_to);
        if (applicationAssigned === 'unassigned') arr = arr.filter(x => !x.assigned_to);
        if (applicationPriority) arr = arr.filter(x => String(x.priority || 'Normal') === applicationPriority);
        arr.sort((a, b) => {
          const aTime = Number(a.submitted_at || a.updated_at || a.created_at || 0);
          const bTime = Number(b.submitted_at || b.updated_at || b.created_at || 0);
          if (applicationSort === 'priority') { const rank={Urgent:3,High:2,Normal:1,Low:0}; return (rank[b.priority||'Normal']||0)-(rank[a.priority||'Normal']||0); }
          return applicationSort === 'oldest' ? aTime - bTime : bTime - aTime;
        });
        const totalResults = arr.length;
        const totalPages = Math.max(1, Math.ceil(totalResults / applicationPageSize));
        applicationPage = Math.min(applicationPage, totalPages);
        arr = arr.slice((applicationPage - 1) * applicationPageSize, applicationPage * applicationPageSize);

        panel.innerHTML = `
          <div class="staff-application-toolbar">
            <label><span>Search</span><input id="application-search" type="search" placeholder="Union ID or Discord username" value="${esc(applicationSearch)}"></label>
            <label><span>Status</span><select id="application-filter">
              <option value="">All statuses</option>
              ${['Submitted','Pending Review','Interview','Accepted','Declined'].map(status => `<option value="${status}" ${applicationStatus===status?'selected':''}>${status}</option>`).join('')}
            </select></label>
            <label><span>Department / type</span><select id="application-type-filter">
              <option value="">All application types</option>
              ${[...new Set(staffApplications.map(x => x.application_type || 'Whitelist Application'))].sort().map(type => `<option value="${esc(type)}" ${applicationType===type?'selected':''}>${esc(type)}</option>`).join('')}
            </select></label>
            <label><span>Assignment</span><select id="application-assigned-filter"><option value="">All</option><option value="assigned" ${applicationAssigned==='assigned'?'selected':''}>Assigned</option><option value="unassigned" ${applicationAssigned==='unassigned'?'selected':''}>Unassigned</option></select></label>
            <label><span>Priority</span><select id="application-priority-filter"><option value="">All</option>${['Urgent','High','Normal','Low'].map(v=>`<option value="${v}" ${applicationPriority===v?'selected':''}>${v}</option>`).join('')}</select></label>
            <label><span>Sort</span><select id="application-sort">
              <option value="newest" ${applicationSort==='newest'?'selected':''}>Newest first</option>
              <option value="oldest" ${applicationSort==='oldest'?'selected':''}>Oldest first</option>
              <option value="priority" ${applicationSort==='priority'?'selected':''}>Priority</option>
            </select></label>
            <strong>${totalResults} result${totalResults === 1 ? '' : 's'}</strong>
          </div>
          <div class="staff-record-list">${arr.length ? arr.map(x => {
            const data = parseApplicationData(x);
            const submitted = x.submitted_at || x.updated_at || x.created_at;
            const applicant = x.discord_display_name || x.discord_username || x.discord_id || 'Unknown applicant';
            return `<article class="staff-record">
              <header><div><span>${esc(x.reference || x.union_id || `Application #${x.id}`)}</span><h3>${esc(applicant)}</h3><p>${esc(x.application_type || 'Whitelist Application')} · ${submitted ? fmt(Number(submitted) || submitted) : 'Unknown date'}</p><p><b>${esc(x.priority || 'Normal')} priority</b> · ${x.assigned_to ? `Assigned to ${esc(x.assigned_to)}` : 'Unassigned'}</p></div>
              <div class="application-review-controls"><select data-priority="${esc(x.id)}">${['Urgent','High','Normal','Low'].map(priority => `<option ${String(x.priority||'Normal')===priority?'selected':''}>${priority}</option>`).join('')}</select><select data-status="${esc(x.id)}">${['Submitted','Pending Review','Interview','Accepted','Declined'].map(status => `<option ${x.status===status?'selected':''}>${status}</option>`).join('')}</select></div></header>
              <div class="staff-record-data">${Object.entries(data).map(([key,value]) => `<p><strong>${esc(key.replace(/([A-Z])/g,' $1'))}</strong><span>${esc(typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value)}</span></p>`).join('')}</div>
              <div class="application-assignment-actions"><button type="button" data-claim-app="${esc(x.id)}">Claim application</button><button type="button" data-unassign-app="${esc(x.id)}">Unassign</button></div>
              <label>Add internal note<textarea data-new-note="${esc(x.id)}" rows="2" placeholder="Add a timestamped staff-only note..."></textarea></label><button type="button" data-add-note="${esc(x.id)}">Add Note</button>
              <label>Internal reviewer notes<textarea data-notes="${esc(x.id)}" rows="3">${esc(x.reviewer_notes || '')}</textarea></label>
              <label>Response shown to player<textarea data-response="${esc(x.id)}" rows="4">${esc(x.staff_response || '')}</textarea></label>
              <button class="primary-button" data-app-save="${esc(x.id)}">Save Update</button>
            </article>`;
          }).join('') : '<div class="ticket-empty-state"><strong>No matching applications</strong><p>Change the search or status filter to see more results.</p></div>'}</div><nav class="application-pagination"><button id="application-prev" ${applicationPage<=1?'disabled':''}>Previous</button><span>Page ${applicationPage} of ${totalPages}</span><button id="application-next" ${applicationPage>=totalPages?'disabled':''}>Next</button></nav>`;

        panel.querySelectorAll('[data-app-save]').forEach(button => button.addEventListener('click', () => saveApplication(button.dataset.appSave)));
        panel.querySelectorAll('[data-claim-app]').forEach(b => b.addEventListener('click', () => setApplicationAssignment(b.dataset.claimApp, 'claim')));
        panel.querySelectorAll('[data-unassign-app]').forEach(b => b.addEventListener('click', () => setApplicationAssignment(b.dataset.unassignApp, 'unassign')));
        panel.querySelectorAll('[data-add-note]').forEach(b => b.addEventListener('click', () => addInternalNote(b.dataset.addNote)));
        panel.querySelector('#application-prev')?.addEventListener('click', () => { applicationPage--; renderApplications(); });
        panel.querySelector('#application-next')?.addEventListener('click', () => { applicationPage++; renderApplications(); });
        panel.querySelector('#application-search')?.addEventListener('input', event => {
          applicationSearch = event.target.value; applicationPage = 1;
          renderApplications();
        });
        panel.querySelector('#application-filter')?.addEventListener('change', event => {
          applicationStatus = event.target.value; applicationPage = 1;
          renderApplications();
        });
        panel.querySelector('#application-type-filter')?.addEventListener('change', event => {
          applicationType = event.target.value; applicationPage = 1;
          renderApplications();
        });
        panel.querySelector('#application-assigned-filter')?.addEventListener('change', event => { applicationAssigned = event.target.value; applicationPage=1; renderApplications(); });
        panel.querySelector('#application-priority-filter')?.addEventListener('change', event => { applicationPriority = event.target.value; applicationPage=1; renderApplications(); });
        panel.querySelector('#application-sort')?.addEventListener('change', event => {
          applicationSort = event.target.value;
          renderApplications();
        });
      } catch (error) {
        panel.innerHTML = `<div class="ticket-empty-state"><strong>Applications unavailable</strong><p>${esc(error.message)}</p></div>`;
        stats();
      }
    }

    async function renderStaff(){
      stats();
      if(tab==='dashboard'){await renderDashboard();return;}
      if(tab==='settings'){panel.innerHTML=`<div class="settings-panel"><span>STAFF ACCESS</span><h2>Database-backed applications enabled</h2><p>Staff access can be controlled with <code>STAFF_ROLE_IDS</code> and <code>DISCORD_GUILD_ID</code>. <code>STAFF_DISCORD_IDS</code> remains available as an owner fallback.</p></div>`;return;}
      if(tab==='tickets'){renderTicketInbox(false);return;}
      if(tab==='transcripts'){renderTicketInbox(true);return;}
      await renderApplications();
    }
    renderStaff();
    setInterval(() => { if (tab !== 'applications') renderStaff(); }, 60000);
  }

  window.addEventListener('storage', e => { if (e.key === APPS_KEY && panel) location.reload(); });
})();

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

function setWhitelistSubmittedState(form, application = {}) {
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

async function saveWhitelistDraft(form, showMessage = false) {
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

async function loadWhitelistDraft(form) {
  const token = getAccessToken();

  if (!token) {
    return;
  }

  let response = await fetch(
    `${API_BASE}/api/applications/me`,
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
        }
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
    setWhitelistSubmittedState(form, result.application);
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
    const isWhitelist =
      form.dataset.applicationType ===
      "Whitelist Application";

    let saveTimer = null;

    if (isWhitelist) {
      loadWhitelistDraft(form).catch(error => {
        const message =
          form.querySelector(".portal-form-message");

        if (message) {
          message.textContent = error.message;
        }
      });

      form.addEventListener("input", () => {
        clearTimeout(saveTimer);

        saveTimer = setTimeout(() => {
          saveWhitelistDraft(form).catch(error => {
            const message =
              form.querySelector(".portal-form-message");

            if (message) {
              message.textContent = error.message;
            }
          });
        }, 1000);
      });

      form.addEventListener("change", () => {
        clearTimeout(saveTimer);

        saveTimer = setTimeout(() => {
          saveWhitelistDraft(form).catch(error => {
            const message =
              form.querySelector(".portal-form-message");

            if (message) {
              message.textContent = error.message;
            }
          });
        }, 500);
      });
    }

    form.addEventListener("submit", async event => {
      event.preventDefault();

      const message = form.querySelector(".portal-form-message");

      try {
        if (isWhitelist) {
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
              progress: calculateFormProgress(form),
              data: getFormData(form)
            })
          });

          const submitResult = await submitResponse.json();
          if (!submitResponse.ok || !submitResult.success) {
            throw new Error(submitResult.error || "Application could not be submitted.");
          }

          setWhitelistSubmittedState(form, submitResult.application || {});
          return;
        }

        const data = Object.fromEntries(new FormData(form));
        const currentUser = window.Auth?.getUser?.();
        const record = {
          id: uid("APP"),
          ownerId: currentUser?.id || "guest",
          ownerName: currentUser?.username || "",
          type: form.dataset.applicationType,
          createdAt: new Date().toISOString(),
          status: "Pending Review",
          response: "",
          data
        };

        const all = read(APPS_KEY);
        all.unshift(record);
        write(APPS_KEY, all);

        await discord(`A new ${record.type} has been submitted.`, {
          title: `New application: ${record.type}`,
          description: `Reference: ${record.id}`,
          color: 10833386
        });

        if (message) message.textContent = `Application submitted. Reference: ${record.id}`;
        form.reset();
      } catch (error) {
        if (message) {
          message.textContent = error.message || "The application could not be submitted.";
        }
      }
    });
  });

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


  async function renderProfileApplicationStatus() {
    const empty = document.getElementById('profileApplicationsEmpty');
    const list = document.getElementById('profileApplicationList');
    if (!empty || !list) return;

    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/applications/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (!response.ok || !result.success || !result.application) return;

      const app = result.application;
      const status = String(app.status || 'Draft');
      const statusClass = status.toLowerCase().replace(/\s+/g, '-');
      const submitted = app.submitted_at || app.updated_at || app.created_at;
      const responseText = String(app.staff_response || '').trim();

      empty.hidden = true;
      list.hidden = false;
      list.innerHTML = `
        <article class="profile-application-item profile-application-database">
          <div>
            <span class="profile-application-type">WHITELIST</span>
            <h3>Union Roleplay Whitelist</h3>
            <p>${status === 'Draft' ? `Draft saved at ${submitted ? esc(fmt(Number(submitted) || submitted)) : 'an unknown time'}` : `Submitted ${submitted ? esc(fmt(Number(submitted) || submitted)) : 'date unavailable'}`}</p>
            <small>${esc(app.union_id || '')}</small>
          </div>
          <span class="profile-inline-status ${esc(statusClass)}">${esc(status)}</span>
        </article>
        ${responseText ? `<div class="profile-staff-response"><strong>Staff response</strong><p>${esc(responseText).replace(/\n/g, '<br>')}</p></div>` : ''}
      `;
    } catch (error) {
      console.warn('Application status could not be loaded', error);
    }
  }

  renderProfileApplicationStatus();

  const panel = document.getElementById('staff-panel-content');
  if (panel) {
    let tab = 'tickets';
    let staffApplications = [];
    let applicationSearch = '';
    let applicationStatus = '';
    let applicationSort = 'newest';
    document.querySelectorAll('[data-staff-tab]').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('[data-staff-tab]').forEach(x => x.classList.remove('active')); b.classList.add('active'); tab = b.dataset.staffTab; activeStaffTicket = null; renderStaff();
    }));

    function stats() {
      const t = purgeExpiredTickets();
      const unread = t.filter(x=>x.status!=='Closed').reduce((n,x)=>n+normalizedMessages(x).filter(m=>m.sender==='player' && !m.readByStaff).length,0);
      const pending = staffApplications.filter(x => ['Submitted', 'Pending Review'].includes(x.status)).length;
      const holder = document.getElementById('staff-stats');
      if (holder) holder.innerHTML = `<article><span>OPEN TICKETS</span><strong>${t.filter(x=>x.status!=='Closed').length}</strong></article><article><span>UNREAD MESSAGES</span><strong>${unread}</strong></article><article><span>TRANSCRIPTS</span><strong>${t.filter(x=>x.status==='Closed').length}</strong></article><article><span>PENDING APPLICATIONS</span><strong>${pending}</strong></article>`;
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
            staff_response: staffResponse
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
        arr.sort((a, b) => {
          const aTime = Number(a.submitted_at || a.updated_at || a.created_at || 0);
          const bTime = Number(b.submitted_at || b.updated_at || b.created_at || 0);
          return applicationSort === 'oldest' ? aTime - bTime : bTime - aTime;
        });

        panel.innerHTML = `
          <div class="staff-application-toolbar">
            <label><span>Search</span><input id="application-search" type="search" placeholder="Union ID or Discord username" value="${esc(applicationSearch)}"></label>
            <label><span>Status</span><select id="application-filter">
              <option value="">All statuses</option>
              ${['Submitted','Pending Review','Interview','Accepted','Declined'].map(status => `<option value="${status}" ${applicationStatus===status?'selected':''}>${status}</option>`).join('')}
            </select></label>
            <label><span>Sort</span><select id="application-sort">
              <option value="newest" ${applicationSort==='newest'?'selected':''}>Newest first</option>
              <option value="oldest" ${applicationSort==='oldest'?'selected':''}>Oldest first</option>
            </select></label>
            <strong>${arr.length} result${arr.length === 1 ? '' : 's'}</strong>
          </div>
          <div class="staff-record-list">${arr.length ? arr.map(x => {
            const data = parseApplicationData(x);
            const submitted = x.submitted_at || x.updated_at || x.created_at;
            const applicant = x.discord_display_name || x.discord_username || x.discord_id || 'Unknown applicant';
            return `<article class="staff-record">
              <header><div><span>${esc(x.union_id || `Application #${x.id}`)}</span><h3>${esc(applicant)}</h3><p>${submitted ? fmt(Number(submitted) || submitted) : 'Unknown date'} · ${esc(x.discord_id || '')}</p></div>
              <select data-status="${esc(x.id)}">${['Submitted','Pending Review','Interview','Accepted','Declined'].map(status => `<option ${x.status===status?'selected':''}>${status}</option>`).join('')}</select></header>
              <div class="staff-record-data">${Object.entries(data).map(([key,value]) => `<p><strong>${esc(key.replace(/([A-Z])/g,' $1'))}</strong><span>${esc(typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value)}</span></p>`).join('')}</div>
              <label>Internal reviewer notes<textarea data-notes="${esc(x.id)}" rows="3">${esc(x.reviewer_notes || '')}</textarea></label>
              <label>Response shown to player<textarea data-response="${esc(x.id)}" rows="4">${esc(x.staff_response || '')}</textarea></label>
              <button class="primary-button" data-app-save="${esc(x.id)}">Save Update</button>
            </article>`;
          }).join('') : '<div class="ticket-empty-state"><strong>No matching applications</strong><p>Change the search or status filter to see more results.</p></div>'}</div>`;

        panel.querySelectorAll('[data-app-save]').forEach(button => button.addEventListener('click', () => saveApplication(button.dataset.appSave)));
        panel.querySelector('#application-search')?.addEventListener('input', event => {
          applicationSearch = event.target.value;
          renderApplications();
        });
        panel.querySelector('#application-filter')?.addEventListener('change', event => {
          applicationStatus = event.target.value;
          renderApplications();
        });
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
      if(tab==='settings'){panel.innerHTML=`<div class="settings-panel"><span>STAFF ACCESS</span><h2>Database-backed applications enabled</h2><p>Staff access can be controlled with <code>STAFF_ROLE_IDS</code> and <code>DISCORD_GUILD_ID</code>. <code>STAFF_DISCORD_IDS</code> remains available as an owner fallback.</p></div>`;return;}
      if(tab==='tickets'){renderTicketInbox(false);return;}
      if(tab==='transcripts'){renderTicketInbox(true);return;}
      await renderApplications();
    }
    renderStaff();
    setInterval(() => { purgeExpiredTickets(); if (tab !== 'applications') renderStaff(); }, 60000);
  }

  window.addEventListener('storage', e => { if ([TICKETS_KEY,APPS_KEY].includes(e.key)) { purgeExpiredTickets(); renderMyTickets(); renderPlayerThread(); if(panel) location.reload(); } });
})();

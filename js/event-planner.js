/**
 * CareerOS — Event Planner
 * Private event planning with social features (RSVP, comments, sharing)
 */

const EVENT_CATEGORIES = [
  { key: 'Party', label: 'Party', emoji: '🎉', color: '#8b5cf6' },
  { key: 'Meeting', label: 'Meeting', emoji: '👥', color: '#3b82f6' },
  { key: 'Familie', label: 'Familie', emoji: '👨‍👩‍👧‍👦', color: '#ec4899' },
  { key: 'Hobby', label: 'Hobby', emoji: '🎮', color: '#06b6d4' },
  { key: 'Sport', label: 'Sport', emoji: '⚽', color: '#f59e0b' },
];

App.register('events', (container) => {
  let events = App.data.get('careeross_events', []);
  let activeTab = 'my-events';

  function save() {
    App.data.set('careeross_events', events);
  }

  function getEventComments(eventId) {
    return App.data.get(`careeross_event_${eventId}_comments`, []);
  }

  function saveEventComments(eventId, comments) {
    App.data.set(`careeross_event_${eventId}_comments`, comments);
  }

  function render() {
    const now = new Date();
    const myEvents = events.filter(e => e.createdBy === 'current-user');
    const invitedEvents = events.filter(e =>
      e.createdBy !== 'current-user' &&
      e.members.some(m => m.userId === 'current-user')
    );

    const upcomingCount = events.filter(e => new Date(e.datetime) > now).length;
    const myRsvpYes = events.filter(e =>
      e.members.some(m => m.userId === 'current-user' && m.status === 'yes')
    ).length;

    container.innerHTML = `
      <div class="page-header">
        <span class="page-tag">Tool 5</span>
        <h1 class="page-title">Events</h1>
        <p class="page-sub">Private Treffen planen, Freunde einladen, zusammen organisieren</p>
      </div>

      <!-- Tabs -->
      <div class="flex-between mb-24" style="flex-wrap:wrap;gap:12px">
        <div class="flex gap-8" style="flex-wrap:wrap">
          <button class="acc-tab ${activeTab === 'my-events' ? 'active' : ''}" data-tab="my-events">
            Meine Events (${myEvents.length})
          </button>
          <button class="acc-tab ${activeTab === 'invited' ? 'active' : ''}" data-tab="invited">
            Einladungen (${invitedEvents.length})
          </button>
        </div>
        <button class="btn btn-primary" id="createEventBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Neues Event
        </button>
      </div>

      <!-- Metrics -->
      <div class="grid-3 mb-24">
        <div class="stat-cell" style="border-top:3px solid #3b82f6">
          <div class="stat-label">Anstehende Events</div>
          <div class="stat-value" style="color:#3b82f6;font-size:1.6rem">${upcomingCount}</div>
        </div>
        <div class="stat-cell" style="border-top:3px solid #10b981">
          <div class="stat-label">Deine Zusagen</div>
          <div class="stat-value" style="color:#10b981;font-size:1.6rem">${myRsvpYes}</div>
        </div>
        <div class="stat-cell" style="border-top:3px solid #f59e0b">
          <div class="stat-label">Gesamte Events</div>
          <div class="stat-value" style="color:#f59e0b;font-size:1.6rem">${events.length}</div>
        </div>
      </div>

      <!-- My Events -->
      ${activeTab === 'my-events' ? `
        <div class="events-grid">
          ${myEvents.length === 0 ? `
            <div class="card" style="grid-column: 1/-1">
              <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <div class="empty-state-title">Noch keine Events erstellt</div>
                <div class="empty-state-desc">Erstelle dein erstes Event, um Freunde einzuladen.</div>
                <button class="btn btn-primary mt-16" id="createEventBtn2">Event erstellen</button>
              </div>
            </div>
          ` : myEvents.map(e => renderEventCard(e)).join('')}
        </div>
      ` : ''}

      <!-- Invited Events -->
      ${activeTab === 'invited' ? `
        <div class="events-grid">
          ${invitedEvents.length === 0 ? `
            <div class="card" style="grid-column: 1/-1">
              <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-title">Noch keine Einladungen</div>
                <div class="empty-state-desc">Freunde werden dir Events zuschicken, wenn sie dich einladen.</div>
              </div>
            </div>
          ` : invitedEvents.map(e => renderEventCard(e, true)).join('')}
        </div>
      ` : ''}
    `;

    // Tab switching
    container.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        render();
      });
    });

    // Create event buttons
    ['createEventBtn', 'createEventBtn2'].forEach(id => {
      const btn = container.querySelector(`#${id}`);
      if (btn) btn.addEventListener('click', () => showCreateEventModal());
    });

    // Event card clicks
    container.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', () => {
        const eventId = card.dataset.eventId;
        const event = events.find(e => e.id === eventId);
        if (event) showEventDetailModal(event);
      });
    });
  }

  function renderEventCard(event, isInvited = false) {
    const category = EVENT_CATEGORIES.find(c => c.key === event.category) || EVENT_CATEGORIES[0];
    const eventDate = new Date(event.datetime);
    const now = new Date();
    const isUpcoming = eventDate > now;
    const userMember = event.members.find(m => m.userId === 'current-user');
    const statusColor = userMember ? (
      userMember.status === 'yes' ? '#10b981' :
      userMember.status === 'maybe' ? '#f59e0b' :
      '#ef4444'
    ) : '#ddd';

    return `
      <div class="event-card" data-event-id="${event.id}">
        <div class="event-hero" style="background-color:${category.color}30;min-height:120px;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center">
          <div style="font-size:3rem">${category.emoji}</div>
        </div>
        <div style="padding:16px">
          <div class="flex-between mb-8" style="align-items:start">
            <div style="flex:1">
              <h3 style="margin:0;font-size:1rem;font-weight:600">${App.utils.escape(event.title)}</h3>
              <div class="text-xs text-muted">${category.label}</div>
            </div>
            ${userMember && !isInvited ? `<div style="width:24px;height:24px;background:${statusColor};border-radius:50%;"></div>` : ''}
          </div>

          <div class="text-sm mb-12" style="opacity:0.8">${App.utils.escape(event.description.slice(0, 60))}${event.description.length > 60 ? '...' : ''}</div>

          <div class="text-xs text-muted mb-12">
            <div>📅 ${App.utils.formatDate(event.datetime)}</div>
            <div>📍 ${App.utils.escape(event.location)}</div>
          </div>

          <div class="flex gap-8">
            <span class="badge" style="background:#f3f4f6;color:#666;font-size:0.75rem">👥 ${event.members.filter(m => m.status === 'yes').length}/${event.members.length}</span>
            ${isUpcoming ? `<span class="badge" style="background:#dcfce7;color:#10b981;font-size:0.75rem">Anstehend</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function showCreateEventModal() {
    App.modal.show(`
      <div class="modal-header">
        <div class="modal-title">Neues Event</div>
        <button class="modal-close">&times;</button>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Event Titel *</label>
          <input class="form-input" id="eTitle" placeholder="z.B. Kinoabend - Dune 3">
        </div>
        <div class="form-group">
          <label class="form-label">Kategorie</label>
          <select class="form-select" id="eCategory">
            ${EVENT_CATEGORIES.map(c => `<option value="${c.key}">${c.emoji} ${c.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Datum / Uhrzeit *</label>
          <input class="form-input" type="datetime-local" id="eDateTime">
        </div>
        <div class="form-group">
          <label class="form-label">Ort *</label>
          <input class="form-input" id="eLocation" placeholder="z.B. Kino oder Park">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Beschreibung</label>
        <textarea class="form-textarea" id="eDescription" rows="3" placeholder="Kurze Beschreibung des Events..."></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Coverbild URL (optional)</label>
          <input class="form-input" id="eCoverImage" placeholder="https://...">
        </div>
        <div class="form-group">
          <label class="form-label">Max. Teilnehmerzahl</label>
          <input class="form-input" type="number" id="eMaxGuests" placeholder="z.B. 10" min="1">
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" id="eCancel">Abbrechen</button>
        <button class="btn btn-primary" id="eSave">Event erstellen</button>
      </div>
    `);

    const overlay = document.getElementById('modal-overlay');
    const now = new Date().toISOString().slice(0, 16);
    overlay.querySelector('#eDateTime').value = now;

    overlay.querySelector('#eCancel').addEventListener('click', () => App.modal.hide());

    overlay.querySelector('#eSave').addEventListener('click', () => {
      const title = overlay.querySelector('#eTitle').value.trim();
      const datetime = overlay.querySelector('#eDateTime').value;
      const location = overlay.querySelector('#eLocation').value.trim();
      const description = overlay.querySelector('#eDescription').value.trim();

      if (!title || !datetime || !location) {
        App.toast('Titel, Datum und Ort sind erforderlich', 'error');
        return;
      }

      const event = {
        id: App.utils.uuid(),
        createdBy: 'current-user',
        title,
        description,
        datetime,
        location,
        category: overlay.querySelector('#eCategory').value,
        coverImage: overlay.querySelector('#eCoverImage').value.trim() || '',
        maxGuests: parseInt(overlay.querySelector('#eMaxGuests').value) || null,
        status: 'upcoming',
        members: [
          { userId: 'current-user', name: 'Du', status: 'yes', joinedAt: new Date().toISOString() }
        ],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      events.push(event);
      save();
      App.modal.hide();
      App.toast('Event erstellt!', 'success');
      render();
    });
  }

  function showEventDetailModal(event) {
    const userMember = event.members.find(m => m.userId === 'current-user');
    const category = EVENT_CATEGORIES.find(c => c.key === event.category) || EVENT_CATEGORIES[0];
    const comments = getEventComments(event.id);

    const yesList = event.members.filter(m => m.status === 'yes');
    const maybeList = event.members.filter(m => m.status === 'maybe');
    const noList = event.members.filter(m => m.status === 'no');

    let modalHTML = `
      <div class="modal-header">
        <div>
          <div class="modal-title">${App.utils.escape(event.title)}</div>
          <div class="text-sm text-muted">${category.emoji} ${category.label}</div>
        </div>
        <button class="modal-close">&times;</button>
      </div>

      <div class="mb-16">
        <div class="text-sm text-muted mb-8">
          <div>📅 ${App.utils.formatDate(event.datetime)}</div>
          <div>📍 ${App.utils.escape(event.location)}</div>
        </div>
        ${event.description ? `<p style="margin:0;font-size:0.9rem">${App.utils.escape(event.description)}</p>` : ''}
      </div>

      <!-- RSVP Buttons (nur wenn eingeladen) -->
      ${userMember ? `
        <div class="mb-16">
          <div class="text-sm text-muted mb-8">Deine Zusage:</div>
          <div class="flex gap-8">
            <button class="btn btn-sm ${userMember.status === 'yes' ? 'btn-primary' : 'btn-secondary'}" data-rsvp="yes">✅ Ja</button>
            <button class="btn btn-sm ${userMember.status === 'maybe' ? 'btn-primary' : 'btn-secondary'}" data-rsvp="maybe">❓ Vielleicht</button>
            <button class="btn btn-sm ${userMember.status === 'no' ? 'btn-primary' : 'btn-secondary'}" data-rsvp="no">❌ Nein</button>
          </div>
        </div>
      ` : ''}

      <!-- Share Link -->
      ${event.createdBy === 'current-user' ? `
        <div class="callout mb-16">
          <div class="callout-title">Event teilen</div>
          <div style="word-break:break-all;font-size:0.85rem">
            Link: event.app/event/${event.id}
            <button class="btn btn-sm btn-secondary" id="eCopyLink" style="margin-top:8px;width:100%">📋 Link kopieren</button>
          </div>
        </div>
      ` : ''}

      <!-- Participants List -->
      <div class="mb-16">
        <div class="text-sm text-muted mb-8">👥 Teilnehmer (${event.members.length})</div>
        ${yesList.length > 0 ? `
          <div style="margin-bottom:12px">
            <div style="font-size:0.8rem;color:#10b981;font-weight:600;margin-bottom:4px">✅ Zusagen (${yesList.length})</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${yesList.map(m => `<span class="badge" style="background:#d1fae5;color:#10b981">${App.utils.escape(m.name)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${maybeList.length > 0 ? `
          <div style="margin-bottom:12px">
            <div style="font-size:0.8rem;color:#f59e0b;font-weight:600;margin-bottom:4px">❓ Vielleicht (${maybeList.length})</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${maybeList.map(m => `<span class="badge" style="background:#fef3c7;color:#f59e0b">${App.utils.escape(m.name)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${noList.length > 0 ? `
          <div>
            <div style="font-size:0.8rem;color:#ef4444;font-weight:600;margin-bottom:4px">❌ Absagen (${noList.length})</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${noList.map(m => `<span class="badge" style="background:#fee2e2;color:#ef4444">${App.utils.escape(m.name)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Comments -->
      <div class="mb-16">
        <div class="text-sm text-muted mb-12">💬 Kommentare (${comments.length})</div>
        <div style="background:#f9fafb;border-radius:6px;padding:12px;margin-bottom:12px">
          <input class="form-input" id="eCommentInput" placeholder="Kommentar hinzufügen...">
        </div>
        <div style="max-height:200px;overflow-y:auto;border:1px solid #e8e0d5;border-radius:6px;padding:12px">
          ${comments.length === 0 ? `
            <div class="text-xs text-muted" style="text-align:center;padding:16px">Noch keine Kommentare</div>
          ` : comments.map((c, idx) => `
            <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #e8e0d5">
              <div style="font-weight:600;font-size:0.85rem">${App.utils.escape(c.userName)}</div>
              <div style="font-size:0.8rem;color:#7a6a60;margin-bottom:4px">${App.utils.escape(c.content)}</div>
              <div style="font-size:0.75rem;color:#999">${formatTimeAgo(c.createdAt)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="modal-footer">
        ${event.createdBy === 'current-user' ? `<button class="btn btn-danger" id="eDelete">Löschen</button>` : ''}
        <button class="btn btn-secondary modal-close-btn">Schließen</button>
      </div>
    `;

    App.modal.show(modalHTML);

    const overlay = document.getElementById('modal-overlay');
    overlay.querySelector('.modal-close-btn').addEventListener('click', () => App.modal.hide());

    // RSVP
    overlay.querySelectorAll('[data-rsvp]').forEach(btn => {
      btn.addEventListener('click', () => {
        const status = btn.dataset.rsvp;
        const member = event.members.find(m => m.userId === 'current-user');
        if (member) {
          member.status = status;
          member.joinedAt = new Date().toISOString();
        }
        save();
        App.modal.hide();
        App.toast(`Status: ${status === 'yes' ? '✅ Zusage' : status === 'maybe' ? '❓ Vielleicht' : '❌ Absage'}`, 'success');
        render();
      });
    });

    // Copy link
    const copyBtn = overlay.querySelector('#eCopyLink');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(`event.app/event/${event.id}`).then(() => {
          App.toast('Link kopiert!', 'success');
        });
      });
    }

    // Add comment
    const commentInput = overlay.querySelector('#eCommentInput');
    if (commentInput) {
      const handleComment = () => {
        const content = commentInput.value.trim();
        if (!content) return;

        const newComment = {
          id: App.utils.uuid(),
          eventId: event.id,
          userId: 'current-user',
          userName: 'Du',
          content,
          reactions: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        comments.push(newComment);
        saveEventComments(event.id, comments);
        commentInput.value = '';
        App.toast('Kommentar hinzugefügt!', 'success');
        showEventDetailModal(event);
      };

      commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleComment();
        }
      });
    }

    // Delete event
    const deleteBtn = overlay.querySelector('#eDelete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (confirm('Event wirklich löschen? Dies kann nicht rückgängig gemacht werden.')) {
          events = events.filter(e => e.id !== event.id);
          save();
          App.modal.hide();
          App.toast('Event gelöscht', 'info');
          render();
        }
      });
    }
  }

  function formatTimeAgo(isoDate) {
    const date = new Date(isoDate);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'gerade eben';
    if (seconds < 3600) return `vor ${Math.floor(seconds / 60)} Min`;
    if (seconds < 86400) return `vor ${Math.floor(seconds / 3600)} Std`;
    return `vor ${Math.floor(seconds / 86400)} Tag${Math.floor(seconds / 86400) > 1 ? 'en' : ''}`;
  }

  render();
});

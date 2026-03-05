/**
 * CareerOS — Job Tracker
 * Kanban board for tracking job applications
 */

const STATUSES = [
  { key: 'Applied',   label: 'Beworben',  color: '#6b7280' },
  { key: 'Screening', label: 'Screening', color: '#3b82f6' },
  { key: 'Interview', label: 'Interview', color: '#eab308' },
  { key: 'Offer',     label: 'Angebot',   color: '#22c55e' },
  { key: 'Rejected',  label: 'Abgelehnt', color: '#ef4444' },
];

App.register('jobs', (container) => {
  let jobs = App.data.get('jobs');
  let filter = 'all';

  function save() {
    App.data.set('jobs', jobs);
  }

  function render() {
    const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);

    container.innerHTML = `
      <div class="page-header">
        <span class="page-tag">Tool 2</span>
        <h1 class="page-title">Job Tracker</h1>
        <p class="page-sub">Bewerbungen verfolgen und Pipeline im Blick behalten</p>
      </div>

      <!-- Controls -->
      <div class="flex-between mb-24" style="flex-wrap:wrap;gap:12px">
        <div class="flex gap-8" style="flex-wrap:wrap">
          <button class="acc-tab ${filter === 'all' ? 'active' : ''}" data-filter="all">
            Alle (${jobs.length})
          </button>
          ${STATUSES.map(s => {
            const count = jobs.filter(j => j.status === s.key).length;
            return `<button class="acc-tab ${filter === s.key ? 'active' : ''}" data-filter="${s.key}">
              ${s.label} (${count})
            </button>`;
          }).join('')}
        </div>
        <button class="btn btn-primary" id="addJobBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Bewerbung hinzufügen
        </button>
      </div>

      <!-- Stats row -->
      <div class="grid-4 mb-24">
        ${STATUSES.map(s => {
          const count = jobs.filter(j => j.status === s.key).length;
          return `<div class="stat-cell" style="border-top:3px solid ${s.color}">
            <div class="stat-label">${s.label}</div>
            <div class="stat-value" style="color:${s.color};font-size:1.6rem">${count}</div>
          </div>`;
        }).join('')}
      </div>

      <!-- Kanban board -->
      <div class="kanban-board" id="kanbanBoard">
        ${STATUSES.map(s => {
          const colJobs = filtered.filter(j => j.status === s.key);
          return `
            <div class="kanban-col" data-status="${s.key}">
              <div class="kanban-col-header">
                <span class="kanban-col-title" style="color:${s.color}">${s.label}</span>
                <span class="kanban-col-count">${colJobs.length}</span>
              </div>
              <div class="kanban-col-cards">
                ${colJobs.length === 0
                  ? `<div class="text-sm text-muted" style="padding:8px 0;opacity:0.6">Keine Einträge</div>`
                  : colJobs.map(j => renderCard(j)).join('')}
              </div>
            </div>`;
        }).join('')}
      </div>

      ${jobs.length === 0 ? `
        <div class="card mt-24">
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <div class="empty-state-title">Noch keine Bewerbungen</div>
            <div class="empty-state-desc">Füge deine erste Bewerbung hinzu, um deinen Bewerbungsprozess zu tracken.</div>
            <button class="btn btn-primary mt-16" id="addJobBtn2">Erste Bewerbung hinzufügen</button>
          </div>
        </div>
      ` : ''}
    `;

    // Filter tabs
    container.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        filter = btn.dataset.filter;
        render();
      });
    });

    // Add job button
    const addBtn = container.querySelector('#addJobBtn');
    if (addBtn) addBtn.addEventListener('click', showAddModal);
    const addBtn2 = container.querySelector('#addJobBtn2');
    if (addBtn2) addBtn2.addEventListener('click', showAddModal);

    // Card clicks
    container.querySelectorAll('.kanban-card').forEach(card => {
      card.addEventListener('click', () => {
        const job = jobs.find(j => j.id === card.dataset.id);
        if (job) showDetailModal(job);
      });
    });
  }

  function renderCard(j) {
    const statusCfg = STATUSES.find(s => s.key === j.status) || STATUSES[0];
    return `
      <div class="kanban-card" data-id="${j.id}">
        <div class="kanban-card-company">${App.utils.escape(j.company)}</div>
        <div class="kanban-card-role">${App.utils.escape(j.role)}</div>
        <div class="kanban-card-meta">
          <span class="kanban-card-date">${App.utils.formatDate(j.appliedDate || j.createdAt)}</span>
          ${j.salary ? `<span class="badge badge-copper">${App.utils.escape(j.salary)}</span>` : ''}
        </div>
        ${j.notes ? `<div class="text-sm text-muted mt-8" style="font-size:0.72rem;opacity:0.8">${App.utils.escape(j.notes.slice(0, 60))}${j.notes.length > 60 ? '...' : ''}</div>` : ''}
      </div>`;
  }

  function showAddModal(editJob = null) {
    const isEdit = !!editJob;
    const j = editJob || {};
    App.modal.show(`
      <div class="modal-header">
        <div class="modal-title">${isEdit ? 'Bewerbung bearbeiten' : 'Neue Bewerbung'}</div>
        <button class="modal-close">&times;</button>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Unternehmen *</label>
          <input class="form-input" id="mCompany" placeholder="z.B. Salesforce" value="${App.utils.escape(j.company || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Stelle *</label>
          <input class="form-input" id="mRole" placeholder="z.B. Inside Sales Representative" value="${App.utils.escape(j.role || '')}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" id="mStatus">
            ${STATUSES.map(s => `<option value="${s.key}" ${(j.status || 'Applied') === s.key ? 'selected' : ''}>${s.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Bewerbungsdatum</label>
          <input class="form-input" type="date" id="mDate" value="${j.appliedDate || App.utils.today()}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Gehalt (optional)</label>
          <input class="form-input" id="mSalary" placeholder="z.B. €45.000–55.000" value="${App.utils.escape(j.salary || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Stellenlink (optional)</label>
          <input class="form-input" id="mLink" type="url" placeholder="https://..." value="${App.utils.escape(j.link || '')}">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Notizen</label>
        <textarea class="form-textarea" id="mNotes" rows="3" placeholder="Ansprechpartner, nächste Schritte, Gesprächsnotizen...">${App.utils.escape(j.notes || '')}</textarea>
      </div>

      <div class="modal-footer">
        ${isEdit ? `<button class="btn btn-danger" id="mDelete">Löschen</button>` : ''}
        <button class="btn btn-secondary" id="mCancel">Abbrechen</button>
        <button class="btn btn-primary" id="mSave">${isEdit ? 'Speichern' : 'Hinzufügen'}</button>
      </div>
    `);

    const overlay = document.getElementById('modal-overlay');
    overlay.querySelector('#mCancel').addEventListener('click', () => App.modal.hide());

    if (isEdit) {
      overlay.querySelector('#mDelete').addEventListener('click', () => {
        if (confirm(`"${j.company}" wirklich löschen?`)) {
          jobs = jobs.filter(x => x.id !== j.id);
          save();
          App.modal.hide();
          App.toast('Bewerbung gelöscht', 'info');
          render();
        }
      });
    }

    overlay.querySelector('#mSave').addEventListener('click', () => {
      const company = overlay.querySelector('#mCompany').value.trim();
      const role = overlay.querySelector('#mRole').value.trim();
      if (!company || !role) {
        App.toast('Unternehmen und Stelle sind Pflichtfelder', 'error');
        return;
      }
      const updated = {
        id: j.id || App.utils.uuid(),
        company,
        role,
        status: overlay.querySelector('#mStatus').value,
        appliedDate: overlay.querySelector('#mDate').value,
        salary: overlay.querySelector('#mSalary').value.trim(),
        link: overlay.querySelector('#mLink').value.trim(),
        notes: overlay.querySelector('#mNotes').value.trim(),
        createdAt: j.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isEdit) {
        jobs = jobs.map(x => x.id === j.id ? updated : x);
        App.toast('Bewerbung aktualisiert', 'success');
      } else {
        jobs.push(updated);
        App.toast('Bewerbung hinzugefügt', 'success');
      }
      save();
      App.modal.hide();
      render();
    });
  }

  function showDetailModal(j) {
    const statusCfg = STATUSES.find(s => s.key === j.status) || STATUSES[0];
    App.modal.show(`
      <div class="modal-header">
        <div>
          <div class="modal-title">${App.utils.escape(j.company)}</div>
          <div class="text-sm text-muted">${App.utils.escape(j.role)}</div>
        </div>
        <button class="modal-close">&times;</button>
      </div>

      <div class="flex gap-12 mb-16" style="flex-wrap:wrap">
        <span class="badge" style="background:${statusCfg.color}22;color:${statusCfg.color}">${statusCfg.label}</span>
        <span class="text-sm text-muted">Beworben: ${App.utils.formatDate(j.appliedDate)}</span>
        ${j.salary ? `<span class="badge badge-copper">${App.utils.escape(j.salary)}</span>` : ''}
      </div>

      ${j.notes ? `
        <div class="callout">
          <div class="callout-title">Notizen</div>
          ${App.utils.escape(j.notes)}
        </div>
      ` : ''}

      ${j.link ? `
        <div class="mt-16 text-sm">
          <a href="${App.utils.escape(j.link)}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm">
            🔗 Stellenlink öffnen
          </a>
        </div>
      ` : ''}

      <div class="mt-16">
        <div class="form-label">Status ändern</div>
        <div class="flex gap-8" style="flex-wrap:wrap">
          ${STATUSES.map(s => `
            <button class="btn btn-sm ${j.status === s.key ? 'btn-primary' : 'btn-secondary'}" data-newstatus="${s.key}">
              ${s.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" id="dEdit">Bearbeiten</button>
        <button class="btn btn-secondary modal-close-btn">Schließen</button>
      </div>
    `);

    const overlay = document.getElementById('modal-overlay');
    overlay.querySelector('.modal-close-btn').addEventListener('click', () => App.modal.hide());

    overlay.querySelector('#dEdit').addEventListener('click', () => {
      App.modal.hide();
      showAddModal(j);
    });

    overlay.querySelectorAll('[data-newstatus]').forEach(btn => {
      btn.addEventListener('click', () => {
        j.status = btn.dataset.newstatus;
        j.updatedAt = new Date().toISOString();
        jobs = jobs.map(x => x.id === j.id ? j : x);
        save();
        App.modal.hide();
        App.toast(`Status: ${btn.dataset.newstatus}`, 'success');
        render();
      });
    });
  }

  render();
});

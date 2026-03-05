/**
 * CareerOS — Sales Workflow Tracker v2
 * Multi-board pipeline with custom stages, drag & drop, and templates
 */

/* ============================================================
   BUILT-IN PIPELINE TEMPLATES
   ============================================================ */
const PIPELINE_TEMPLATES = {
  sales: {
    label: 'Sales Pipeline',
    icon: '📈',
    stages: [
      { key: 'Prospecting',  label: 'Prospektierung', color: '#6b7280' },
      { key: 'Discovery',    label: 'Entdeckung',     color: '#3b82f6' },
      { key: 'Proposal',     label: 'Proposal',       color: '#f59e0b' },
      { key: 'Negotiation',  label: 'Verhandlung',    color: '#ec4899' },
      { key: 'Closed',       label: 'Abgeschlossen',  color: '#10b981' },
    ]
  },
  content: {
    label: 'Content Pipeline',
    icon: '✍️',
    stages: [
      { key: 'ContentDump',    label: 'Content Dump',    color: '#8b5cf6' },
      { key: 'InBearbeitung',  label: 'In Bearbeitung',  color: '#3b82f6' },
      { key: 'InternesReview', label: 'Internes Review', color: '#f59e0b' },
      { key: 'Approval',       label: 'Approval',        color: '#ec4899' },
      { key: 'Freigegeben',    label: 'Freigegeben',     color: '#06b6d4' },
      { key: 'Published',      label: 'Published',       color: '#10b981' },
    ]
  },
  project: {
    label: 'Projekt Board',
    icon: '🗂️',
    stages: [
      { key: 'Backlog',     label: 'Backlog',      color: '#6b7280' },
      { key: 'ToDo',        label: 'To Do',        color: '#3b82f6' },
      { key: 'InProgress',  label: 'In Bearbeitung', color: '#f59e0b' },
      { key: 'Review',      label: 'Review',       color: '#ec4899' },
      { key: 'Done',        label: 'Fertig',       color: '#10b981' },
    ]
  },
  recruiting: {
    label: 'Recruiting Board',
    icon: '👥',
    stages: [
      { key: 'Applied',    label: 'Beworben',      color: '#6b7280' },
      { key: 'Screening',  label: 'Screening',     color: '#3b82f6' },
      { key: 'Interview',  label: 'Interview',     color: '#f59e0b' },
      { key: 'Offer',      label: 'Angebot',       color: '#059669' },
      { key: 'Hired',      label: 'Eingestellt',   color: '#10b981' },
      { key: 'Rejected',   label: 'Abgelehnt',     color: '#ef4444' },
    ]
  },
  custom: {
    label: 'Eigene Pipeline',
    icon: '⚙️',
    stages: [
      { key: 'Step1', label: 'Schritt 1', color: '#6b7280' },
      { key: 'Step2', label: 'Schritt 2', color: '#3b82f6' },
      { key: 'Step3', label: 'Schritt 3', color: '#10b981' },
    ]
  }
};

const STAGE_COLORS = [
  '#6b7280', '#3b82f6', '#f59e0b', '#ec4899',
  '#8b5cf6', '#06b6d4', '#10b981', '#059669',
  '#ef4444', '#f97316', '#84cc16', '#a855f7'
];

/* ============================================================
   MAIN MODULE
   ============================================================ */
App.register('sales', (container) => {

  // --- State ---
  let boards    = App.data.get('sales_boards', []);
  let deals     = App.data.get('sales_deals', []);
  let activeTab = 'pipeline';
  let activeBoardId = null;

  // Bootstrap: create default Sales board if none exists
  if (boards.length === 0) {
    boards = [{
      id: App.utils.uuid(),
      name: 'Sales Pipeline',
      template: 'sales',
      stages: JSON.parse(JSON.stringify(PIPELINE_TEMPLATES.sales.stages)),
      createdAt: new Date().toISOString()
    }];
    App.data.set('sales_boards', boards);
  }
  activeBoardId = activeBoardId || boards[0].id;

  function saveBoards() { App.data.set('sales_boards', boards); }
  function saveDeals()  { App.data.set('sales_deals', deals); }

  function currentBoard() {
    return boards.find(b => b.id === activeBoardId) || boards[0];
  }

  /* ============================================================
     RENDER
  ============================================================ */
  function render() {
    const board  = currentBoard();
    const stages = board.stages;
    const boardDeals = deals.filter(d => d.boardId === board.id);

    // Closed = last stage for metrics purposes
    const lastStageKey  = stages[stages.length - 1]?.key;
    const closedDeals   = boardDeals.filter(d => d.stage === lastStageKey);
    const activeDeals   = boardDeals.filter(d => d.stage !== lastStageKey);
    const pipelineValue = activeDeals.reduce((s, d) => s + (parseFloat(d.value) || 0), 0);
    const closedValue   = closedDeals.reduce((s, d) => s + (parseFloat(d.value) || 0), 0);

    container.innerHTML = `
      <div class="page-header">
        <span class="page-tag">Tool 3</span>
        <h1 class="page-title">Sales Workflow</h1>
        <p class="page-sub">Pipeline-Boards verwalten · Custom Stages · Drag & Drop</p>
      </div>

      <!-- Board Selector -->
      <div class="board-selector-bar">
        ${boards.map(b => `
          <button class="board-tab ${b.id === board.id ? 'active' : ''}" data-board="${b.id}">
            ${PIPELINE_TEMPLATES[b.template]?.icon || '📋'} ${App.utils.escape(b.name)}
          </button>
        `).join('')}
        <button class="board-tab board-tab-add" id="addBoardBtn" title="Neues Board">＋</button>
      </div>

      <!-- Tabs + Actions -->
      <div class="flex-between mb-24" style="flex-wrap:wrap;gap:12px">
        <div class="flex gap-8" style="flex-wrap:wrap">
          <button class="acc-tab ${activeTab === 'pipeline' ? 'active' : ''}" data-tab="pipeline">Kanban</button>
          <button class="acc-tab ${activeTab === 'list'     ? 'active' : ''}" data-tab="list">
            Liste (${boardDeals.length})
          </button>
        </div>
        <div class="flex gap-8" style="flex-wrap:wrap">
          <button class="btn btn-secondary btn-sm" id="manageStagesBtn">⚙️ Stages verwalten</button>
          <button class="btn btn-primary" id="addDealBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Neue Karte
          </button>
        </div>
      </div>

      <!-- Metrics -->
      <div class="grid-4 mb-24">
        <div class="stat-cell" style="border-top:3px solid #059669">
          <div class="stat-label">Aktive Karten</div>
          <div class="stat-value" style="color:#059669;font-size:1.6rem">${activeDeals.length}</div>
        </div>
        <div class="stat-cell" style="border-top:3px solid #3b82f6">
          <div class="stat-label">Pipeline Value</div>
          <div class="stat-value" style="color:#3b82f6;font-size:1.6rem">${App.utils.formatCurrency(pipelineValue)}</div>
        </div>
        <div class="stat-cell" style="border-top:3px solid #10b981">
          <div class="stat-label">Stages</div>
          <div class="stat-value" style="color:#10b981;font-size:1.6rem">${stages.length}</div>
        </div>
        <div class="stat-cell" style="border-top:3px solid #f59e0b">
          <div class="stat-label">Abgeschlossen Value</div>
          <div class="stat-value" style="color:#f59e0b;font-size:1.6rem">${App.utils.formatCurrency(closedValue)}</div>
        </div>
      </div>

      <!-- Kanban Pipeline View -->
      ${activeTab === 'pipeline' ? `
        <div class="kanban-board" id="salesKanban">
          ${stages.map(stage => {
            const stageDeals = boardDeals.filter(d => d.stage === stage.key);
            const stageValue = stageDeals.reduce((s, d) => s + (parseFloat(d.value) || 0), 0);
            return `
              <div class="kanban-col"
                   data-stage="${App.utils.escape(stage.key)}"
                   id="col-${App.utils.escape(stage.key)}">
                <div class="kanban-col-header">
                  <div>
                    <span class="kanban-col-title" style="color:${stage.color}">${App.utils.escape(stage.label)}</span>
                    <span class="kanban-col-count">${stageDeals.length}</span>
                  </div>
                  <div class="text-xs text-muted">${App.utils.formatCurrency(stageValue)}</div>
                </div>
                <div class="kanban-col-cards" data-drop-zone="${App.utils.escape(stage.key)}">
                  ${stageDeals.length === 0
                    ? `<div class="kanban-empty-hint" data-stage="${App.utils.escape(stage.key)}">Hierher ziehen</div>`
                    : stageDeals.map(d => renderDealCard(d, stage)).join('')
                  }
                </div>
              </div>`;
          }).join('')}
        </div>
        <p class="text-xs text-muted" style="margin-top:8px;text-align:center;opacity:0.6">
          💡 Tipp: Karten per Drag & Drop zwischen Spalten verschieben
        </p>
      ` : ''}

      <!-- List View -->
      ${activeTab === 'list' ? `
        <div class="card">
          ${boardDeals.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">📊</div>
              <div class="empty-state-title">Noch keine Einträge</div>
              <div class="empty-state-desc">Füge deine erste Karte hinzu.</div>
              <button class="btn btn-primary mt-16" id="addDealBtn2">Erste Karte hinzufügen</button>
            </div>
          ` : `
            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Wert</th>
                  <th>Stage</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody>
                ${boardDeals.map(d => {
                  const stage = stages.find(s => s.key === d.stage);
                  return `
                    <tr class="deal-row" data-id="${d.id}">
                      <td>
                        <div class="font-bold">${App.utils.escape(d.company)}</div>
                        <div class="text-xs text-muted">${App.utils.escape(d.dealName || '')}</div>
                      </td>
                      <td>${App.utils.formatCurrency(d.value)}</td>
                      <td>
                        <span class="badge" style="background:${stage?.color || '#ccc'}22;color:${stage?.color || '#666'}">
                          ${App.utils.escape(stage?.label || d.stage)}
                        </span>
                      </td>
                      <td class="text-sm text-muted">${App.utils.formatDate(d.createdAt)}</td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          `}
        </div>
      ` : ''}
    `;

    bindEvents();
    if (activeTab === 'pipeline') initDragDrop();
  }

  /* ============================================================
     DRAG & DROP  (HTML5 native)
  ============================================================ */
  let draggedDealId = null;

  function initDragDrop() {
    // Draggable cards
    container.querySelectorAll('.kanban-card[draggable="true"]').forEach(card => {
      card.addEventListener('dragstart', e => {
        draggedDealId = card.dataset.id;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedDealId);
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.kanban-col-cards').forEach(z => z.classList.remove('drag-over'));
        draggedDealId = null;
      });
    });

    // Drop zones (the kanban-col-cards divs)
    container.querySelectorAll('.kanban-col-cards').forEach(zone => {
      zone.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        zone.classList.add('drag-over');
      });
      zone.addEventListener('dragleave', e => {
        // Only remove if truly leaving the zone (not entering a child)
        if (!zone.contains(e.relatedTarget)) {
          zone.classList.remove('drag-over');
        }
      });
      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const targetStage = zone.dataset.dropZone;
        const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
        if (!dealId || !targetStage) return;

        const deal = deals.find(d => d.id === dealId);
        if (!deal) return;

        const prevStage = deal.stage;
        if (prevStage === targetStage) return;

        deal.stage = targetStage;
        deal.updatedAt = new Date().toISOString();

        const board = currentBoard();
        const stageLabel = board.stages.find(s => s.key === targetStage)?.label || targetStage;
        const prevLabel  = board.stages.find(s => s.key === prevStage)?.label || prevStage;

        saveDeals();
        App.toast(`"${deal.dealName}" → ${stageLabel}`, 'success');
        render();
      });
    });
  }

  /* ============================================================
     RENDER HELPERS
  ============================================================ */
  function renderDealCard(d, stage) {
    return `
      <div class="kanban-card"
           data-id="${d.id}"
           draggable="true"
           title="Ziehen zum Verschieben | Klicken für Details">
        <div class="kanban-card-drag-handle">⠿</div>
        <div class="kanban-card-company">${App.utils.escape(d.company)}</div>
        <div class="kanban-card-role" style="font-size:0.85rem;font-weight:600">
          ${App.utils.escape(d.dealName || 'Unbenanntes Projekt')}
        </div>
        <div class="kanban-card-meta">
          <span style="color:${stage?.color};font-weight:600">${App.utils.formatCurrency(d.value)}</span>
          ${d.decision_makers?.length ? `<span class="text-xs text-muted">👤 ${d.decision_makers.length}</span>` : ''}
        </div>
        ${d.notes ? `<div class="text-xs text-muted mt-8" style="opacity:0.8">${App.utils.escape(d.notes.slice(0,55))}${d.notes.length>55?'…':''}</div>` : ''}
      </div>`;
  }

  /* ============================================================
     EVENT BINDING
  ============================================================ */
  function bindEvents() {
    // Tabs
    container.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => { activeTab = btn.dataset.tab; render(); });
    });

    // Board selector
    container.querySelectorAll('[data-board]').forEach(btn => {
      btn.addEventListener('click', () => { activeBoardId = btn.dataset.board; render(); });
    });

    // New board
    const addBoardBtn = container.querySelector('#addBoardBtn');
    if (addBoardBtn) addBoardBtn.addEventListener('click', showNewBoardModal);

    // Manage stages
    const manageBtn = container.querySelector('#manageStagesBtn');
    if (manageBtn) manageBtn.addEventListener('click', showManageStagesModal);

    // New deal button(s)
    ['addDealBtn', 'addDealBtn2'].forEach(id => {
      const btn = container.querySelector(`#${id}`);
      if (btn) btn.addEventListener('click', () => showAddDealModal());
    });

    // Card clicks (open detail — but only if not dragging)
    container.querySelectorAll('.kanban-card').forEach(card => {
      card.addEventListener('click', () => {
        if (draggedDealId) return;
        const deal = deals.find(d => d.id === card.dataset.id);
        if (deal) showDealDetailModal(deal);
      });
    });

    // List row clicks
    container.querySelectorAll('.deal-row').forEach(row => {
      row.addEventListener('click', () => {
        const deal = deals.find(d => d.id === row.dataset.id);
        if (deal) showDealDetailModal(deal);
      });
    });
  }

  /* ============================================================
     BOARD MANAGEMENT
  ============================================================ */
  function showNewBoardModal() {
    App.modal.show(`
      <div class="modal-header">
        <div class="modal-title">Neues Board erstellen</div>
        <button class="modal-close">&times;</button>
      </div>

      <div class="form-group">
        <label class="form-label">Board Name *</label>
        <input class="form-input" id="bName" placeholder="z.B. Content Marketing Q2">
      </div>

      <div class="form-group">
        <label class="form-label">Pipeline-Template wählen</label>
        <div class="template-grid" id="templateGrid">
          ${Object.entries(PIPELINE_TEMPLATES).map(([key, tpl]) => `
            <button class="template-card ${key === 'sales' ? 'selected' : ''}" data-template="${key}">
              <div style="font-size:1.5rem;margin-bottom:6px">${tpl.icon}</div>
              <div style="font-weight:600;font-size:0.9rem">${tpl.label}</div>
              <div class="text-xs text-muted">${tpl.stages.length} Stages</div>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" id="bCancel">Abbrechen</button>
        <button class="btn btn-primary"   id="bCreate">Board erstellen</button>
      </div>
    `);

    const overlay = document.getElementById('modal-overlay');
    let selectedTemplate = 'sales';

    // Template selection
    overlay.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        overlay.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedTemplate = card.dataset.template;
      });
    });

    overlay.querySelector('#bCancel').addEventListener('click', () => App.modal.hide());
    overlay.querySelector('#bCreate').addEventListener('click', () => {
      const name = overlay.querySelector('#bName').value.trim();
      if (!name) { App.toast('Name ist erforderlich', 'error'); return; }

      const newBoard = {
        id:        App.utils.uuid(),
        name,
        template:  selectedTemplate,
        stages:    JSON.parse(JSON.stringify(PIPELINE_TEMPLATES[selectedTemplate].stages)),
        createdAt: new Date().toISOString()
      };
      boards.push(newBoard);
      activeBoardId = newBoard.id;
      saveBoards();
      App.modal.hide();
      App.toast(`Board "${name}" erstellt!`, 'success');
      render();
    });
  }

  /* ============================================================
     STAGE MANAGER
  ============================================================ */
  function showManageStagesModal() {
    const board  = currentBoard();
    const stages = board.stages;

    function buildStagesList() {
      return stages.map((s, idx) => `
        <div class="stage-row" data-idx="${idx}">
          <div class="stage-row-handle">⠿</div>
          <input class="form-input stage-label-input" style="flex:1"
                 value="${App.utils.escape(s.label)}" data-idx="${idx}" data-field="label">
          <select class="stage-color-select" data-idx="${idx}" data-field="color">
            ${STAGE_COLORS.map(c => `
              <option value="${c}" ${s.color === c ? 'selected' : ''}
                style="background:${c};color:white">${c}</option>
            `).join('')}
          </select>
          <div class="stage-color-dot" style="background:${s.color};width:24px;height:24px;border-radius:50%;flex-shrink:0;"></div>
          <button class="btn btn-sm btn-danger stage-delete-btn" data-idx="${idx}"
                  title="Stage löschen" ${stages.length <= 1 ? 'disabled' : ''}>
            ✕
          </button>
        </div>
      `).join('');
    }

    App.modal.show(`
      <div class="modal-header">
        <div>
          <div class="modal-title">Stages verwalten</div>
          <div class="text-sm text-muted">${App.utils.escape(board.name)}</div>
        </div>
        <button class="modal-close">&times;</button>
      </div>

      <p class="text-sm text-muted mb-16">
        Bearbeite, füge hinzu oder lösche Stages. Die Reihenfolge von links nach rechts im Kanban.
      </p>

      <div id="stagesList">
        ${buildStagesList()}
      </div>

      <div class="mt-16 mb-24">
        <button class="btn btn-secondary w-full" id="addStageBtn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Stage hinzufügen
        </button>
      </div>

      <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:10px 14px;font-size:0.85rem;margin-bottom:16px">
        ⚠️ Gelöschte Stages verschieben vorhandene Karten in die erste Stage.
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" id="smCancel">Abbrechen</button>
        <button class="btn btn-primary"   id="smSave">Speichern</button>
      </div>
    `);

    const overlay = document.getElementById('modal-overlay');

    function rebindStageRows() {
      const list = overlay.querySelector('#stagesList');
      list.innerHTML = buildStagesList();

      // Live label/color update
      list.querySelectorAll('[data-field="label"]').forEach(inp => {
        inp.addEventListener('input', () => {
          const idx = parseInt(inp.dataset.idx);
          stages[idx].label = inp.value;
        });
      });
      list.querySelectorAll('[data-field="color"]').forEach(sel => {
        sel.addEventListener('change', () => {
          const idx = parseInt(sel.dataset.idx);
          stages[idx].color = sel.value;
          // Update dot
          const dot = sel.nextElementSibling;
          if (dot) dot.style.background = sel.value;
        });
      });
      // Delete
      list.querySelectorAll('.stage-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          if (stages.length <= 1) return;
          if (confirm(`Stage "${stages[idx].label}" löschen?`)) {
            const deletedKey = stages[idx].key;
            const fallbackKey = stages[0].key;
            // Move orphaned deals
            deals.forEach(d => {
              if (d.boardId === board.id && d.stage === deletedKey) {
                d.stage = fallbackKey;
              }
            });
            saveDeals();
            stages.splice(idx, 1);
            rebindStageRows();
          }
        });
      });
    }

    rebindStageRows();

    // Add stage
    overlay.querySelector('#addStageBtn').addEventListener('click', () => {
      const newStage = {
        key:   `Stage${Date.now()}`,
        label: `Neue Stage`,
        color: STAGE_COLORS[stages.length % STAGE_COLORS.length]
      };
      stages.push(newStage);
      rebindStageRows();
    });

    overlay.querySelector('#smCancel').addEventListener('click', () => {
      // Reload original stages on cancel
      const original = boards.find(b => b.id === activeBoardId);
      if (original) board.stages = original.stages;
      App.modal.hide();
      render();
    });

    overlay.querySelector('#smSave').addEventListener('click', () => {
      // Clean up empty labels
      stages.forEach(s => {
        if (!s.label.trim()) s.label = 'Unbenannte Stage';
      });
      board.stages = stages;
      saveBoards();
      App.modal.hide();
      App.toast('Stages gespeichert!', 'success');
      render();
    });
  }

  /* ============================================================
     DEAL MODAL — CREATE / EDIT
  ============================================================ */
  function showAddDealModal(editDeal = null) {
    const board   = currentBoard();
    const stages  = board.stages;
    const isEdit  = !!editDeal;
    const d       = editDeal || {};

    App.modal.show(`
      <div class="modal-header">
        <div class="modal-title">${isEdit ? 'Karte bearbeiten' : 'Neue Karte'}</div>
        <button class="modal-close">&times;</button>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Name / Unternehmen *</label>
          <input class="form-input" id="mCompany" placeholder="z.B. TechCorp AG"
                 value="${App.utils.escape(d.company || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Karten-Titel *</label>
          <input class="form-input" id="mDealName" placeholder="z.B. Q3 Content-Plan"
                 value="${App.utils.escape(d.dealName || '')}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Wert (€)</label>
          <input class="form-input" type="number" id="mValue"
                 placeholder="0" value="${d.value || 0}" min="0" step="100">
        </div>
        <div class="form-group">
          <label class="form-label">Stage</label>
          <select class="form-select" id="mStage">
            ${stages.map(s => `
              <option value="${App.utils.escape(s.key)}"
                      ${(d.stage || stages[0]?.key) === s.key ? 'selected' : ''}>
                ${App.utils.escape(s.label)}
              </option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Ansprechpartner (optional)</label>
          <input class="form-input" id="mDecisionMakers"
                 placeholder="z.B. Name; Titel"
                 value="${App.utils.escape((d.decision_makers || []).join('; '))}">
        </div>
        <div class="form-group">
          <label class="form-label">Deadline / Timeline</label>
          <input class="form-input" type="date" id="mTimeline"
                 value="${d.timeline || App.utils.today()}">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Notizen</label>
        <textarea class="form-textarea" id="mNotes" rows="3"
                  placeholder="Kontext, Anforderungen, Details...">${App.utils.escape(d.notes || '')}</textarea>
      </div>

      <div class="modal-footer">
        ${isEdit ? `<button class="btn btn-danger" id="mDelete">Löschen</button>` : ''}
        <button class="btn btn-secondary" id="mCancel">Abbrechen</button>
        <button class="btn btn-primary"   id="mSave">${isEdit ? 'Speichern' : 'Hinzufügen'}</button>
      </div>
    `);

    const overlay = document.getElementById('modal-overlay');
    overlay.querySelector('#mCancel').addEventListener('click', () => App.modal.hide());

    if (isEdit) {
      overlay.querySelector('#mDelete').addEventListener('click', () => {
        if (confirm(`Karte "${d.dealName}" wirklich löschen?`)) {
          deals = deals.filter(x => x.id !== d.id);
          saveDeals();
          App.modal.hide();
          App.toast('Karte gelöscht', 'info');
          render();
        }
      });
    }

    overlay.querySelector('#mSave').addEventListener('click', () => {
      const company  = overlay.querySelector('#mCompany').value.trim();
      const dealName = overlay.querySelector('#mDealName').value.trim();
      if (!company || !dealName) {
        App.toast('Name und Titel sind erforderlich', 'error');
        return;
      }

      const decisionMakers = overlay.querySelector('#mDecisionMakers').value.trim()
        .split(';').map(m => m.trim()).filter(Boolean);

      const updated = {
        id:               d.id || App.utils.uuid(),
        boardId:          activeBoardId,
        company,
        dealName,
        value:            parseFloat(overlay.querySelector('#mValue').value) || 0,
        stage:            overlay.querySelector('#mStage').value,
        timeline:         overlay.querySelector('#mTimeline').value,
        decision_makers:  decisionMakers,
        notes:            overlay.querySelector('#mNotes').value.trim(),
        createdAt:        d.createdAt || new Date().toISOString(),
        updatedAt:        new Date().toISOString()
      };

      if (isEdit) {
        deals = deals.map(x => x.id === d.id ? updated : x);
        App.toast('Karte aktualisiert', 'success');
      } else {
        deals.push(updated);
        App.toast('Karte hinzugefügt', 'success');
      }
      saveDeals();
      App.modal.hide();
      render();
    });
  }

  /* ============================================================
     DEAL DETAIL MODAL
  ============================================================ */
  function showDealDetailModal(d) {
    const board  = currentBoard();
    const stages = board.stages;
    const stage  = stages.find(s => s.key === d.stage) || stages[0];

    App.modal.show(`
      <div class="modal-header">
        <div>
          <div class="modal-title">${App.utils.escape(d.company)}</div>
          <div class="text-sm text-muted">${App.utils.escape(d.dealName)}</div>
        </div>
        <button class="modal-close">&times;</button>
      </div>

      <div class="flex gap-12 mb-16" style="flex-wrap:wrap">
        <span class="badge" style="background:${stage.color}22;color:${stage.color}">
          ${App.utils.escape(stage.label)}
        </span>
        <span class="text-sm text-muted">💰 ${App.utils.formatCurrency(d.value)}</span>
        ${d.timeline ? `<span class="text-sm text-muted">📅 ${App.utils.formatDate(d.timeline)}</span>` : ''}
      </div>

      ${d.notes ? `
        <div class="callout mb-16">
          <div class="callout-title">Notizen</div>
          ${App.utils.escape(d.notes)}
        </div>` : ''}

      ${d.decision_makers?.length ? `
        <div class="callout mb-16">
          <div class="callout-title">Ansprechpartner</div>
          <ul style="margin:8px 0;padding-left:20px">
            ${d.decision_makers.map(dm => `<li>${App.utils.escape(dm)}</li>`).join('')}
          </ul>
        </div>` : ''}

      <div class="mb-16">
        <div class="form-label mb-12">Stage verschieben</div>
        <div class="stage-move-track">
          ${stages.map(s => `
            <button class="stage-move-btn ${d.stage === s.key ? 'active' : ''}"
                    data-newstage="${App.utils.escape(s.key)}"
                    style="--stage-color:${s.color}">
              ${App.utils.escape(s.label)}
            </button>
          `).join('<span class="stage-move-arrow">›</span>')}
        </div>
      </div>

      <div class="mt-16">
        <div class="form-label mb-12">Aktionen</div>
        <div class="flex gap-8" style="flex-wrap:wrap">
          <button class="btn btn-secondary btn-sm" id="dGenerateScript">📝 Script generieren</button>
          <button class="btn btn-secondary btn-sm" id="dGenerateFAQ">❓ FAQ generieren</button>
          <button class="btn btn-secondary btn-sm" id="dGeneratePresentation">🎯 Präsentation</button>
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
      showAddDealModal(d);
    });

    overlay.querySelectorAll('[data-newstage]').forEach(btn => {
      btn.addEventListener('click', () => {
        d.stage     = btn.dataset.newstage;
        d.updatedAt = new Date().toISOString();
        deals       = deals.map(x => x.id === d.id ? d : x);
        saveDeals();
        App.modal.hide();
        const stageLabel = stages.find(s => s.key === d.stage)?.label || d.stage;
        App.toast(`Stage: ${stageLabel}`, 'success');
        render();
      });
    });

    overlay.querySelector('#dGenerateScript').addEventListener('click', () => {
      App.modal.hide(); generateScriptForDeal(d);
    });
    overlay.querySelector('#dGenerateFAQ').addEventListener('click', () => {
      App.modal.hide(); generateFAQForDeal(d);
    });
    overlay.querySelector('#dGeneratePresentation').addEventListener('click', () => {
      App.modal.hide(); generatePresentationForDeal(d);
    });
  }

  render();
});

/* ============================================================
   HELPER: delegate to sub-modules
============================================================ */
function generateScriptForDeal(deal) {
  window.ScriptGenerator ? window.ScriptGenerator.generate(deal)
    : App.toast('Script-Generator noch nicht verfügbar', 'error');
}
function generateFAQForDeal(deal) {
  window.FAQBuilder ? window.FAQBuilder.generateForDeal(deal)
    : App.toast('FAQ-Builder noch nicht verfügbar', 'error');
}
function generatePresentationForDeal(deal) {
  window.PresentationGen ? window.PresentationGen.generate(deal)
    : App.toast('Präsentations-Generator noch nicht verfügbar', 'error');
}

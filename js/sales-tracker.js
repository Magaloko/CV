/**
 * CareerOS — Sales Workflow Tracker
 * B2B sales pipeline management with deal tracking and AI-powered content generation
 */

const SALES_STAGES = [
  { key: 'Prospecting', label: 'Prospektierung', color: '#6b7280' },
  { key: 'Discovery',   label: 'Entdeckung',    color: '#3b82f6' },
  { key: 'Proposal',    label: 'Proposal',      color: '#f59e0b' },
  { key: 'Negotiation', label: 'Verhandlung',   color: '#ec4899' },
  { key: 'Closed',      label: 'Abgeschlossen', color: '#10b981' },
];

App.register('sales', (container) => {
  let deals = App.data.get('sales_deals', []);
  let activeTab = 'pipeline';

  function save() {
    App.data.set('sales_deals', deals);
  }

  function render() {
    // Calculate metrics
    const activeDeal = deals.filter(d => d.stage !== 'Closed').length;
    const totalValue = deals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);
    const pipelineValue = deals.filter(d => d.stage !== 'Closed').reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);
    const closedValue = deals.filter(d => d.stage === 'Closed').reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);

    container.innerHTML = `
      <div class="page-header">
        <span class="page-tag">Tool 3</span>
        <h1 class="page-title">Sales Workflow</h1>
        <p class="page-sub">Verkaufspipeline verwalten, Scripts generieren, FAQs erstellen</p>
      </div>

      <!-- Tabs -->
      <div class="flex-between mb-24" style="flex-wrap:wrap;gap:12px">
        <div class="flex gap-8" style="flex-wrap:wrap">
          <button class="acc-tab ${activeTab === 'pipeline' ? 'active' : ''}" data-tab="pipeline">
            Pipeline
          </button>
          <button class="acc-tab ${activeTab === 'list' ? 'active' : ''}" data-tab="list">
            Deals (${deals.length})
          </button>
        </div>
        <button class="btn btn-primary" id="addDealBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Neues Deal
        </button>
      </div>

      <!-- Metrics -->
      <div class="grid-4 mb-24">
        <div class="stat-cell" style="border-top:3px solid #059669">
          <div class="stat-label">Aktive Deals</div>
          <div class="stat-value" style="color:#059669;font-size:1.6rem">${activeDeal}</div>
        </div>
        <div class="stat-cell" style="border-top:3px solid #3b82f6">
          <div class="stat-label">Pipeline Value</div>
          <div class="stat-value" style="color:#3b82f6;font-size:1.6rem">${App.utils.formatCurrency(pipelineValue)}</div>
        </div>
        <div class="stat-cell" style="border-top:3px solid #10b981">
          <div class="stat-label">Abgeschlossene Deals</div>
          <div class="stat-value" style="color:#10b981;font-size:1.6rem">${deals.filter(d => d.stage === 'Closed').length}</div>
        </div>
        <div class="stat-cell" style="border-top:3px solid #059669">
          <div class="stat-label">Geschlossener Value</div>
          <div class="stat-value" style="color:#059669;font-size:1.6rem">${App.utils.formatCurrency(closedValue)}</div>
        </div>
      </div>

      <!-- Pipeline View -->
      ${activeTab === 'pipeline' ? `
        <div class="kanban-board" id="salesKanban">
          ${SALES_STAGES.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage.key);
            const stageValue = stageDeals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);
            return `
              <div class="kanban-col" data-stage="${stage.key}">
                <div class="kanban-col-header">
                  <div>
                    <span class="kanban-col-title" style="color:${stage.color}">${stage.label}</span>
                    <span class="kanban-col-count">${stageDeals.length}</span>
                  </div>
                  <div class="text-xs text-muted">${App.utils.formatCurrency(stageValue)}</div>
                </div>
                <div class="kanban-col-cards">
                  ${stageDeals.length === 0
                    ? `<div class="text-sm text-muted" style="padding:8px 0;opacity:0.6">Keine Deals</div>`
                    : stageDeals.map(d => renderDealCard(d)).join('')}
                </div>
              </div>`;
          }).join('')}
        </div>
      ` : ''}

      <!-- List View -->
      ${activeTab === 'list' ? `
        <div class="card">
          ${deals.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">📊</div>
              <div class="empty-state-title">Noch keine Deals</div>
              <div class="empty-state-desc">Füge dein erstes Deal hinzu, um deine Verkaufspipeline zu verwalten.</div>
              <button class="btn btn-primary mt-16" id="addDealBtn2">Erstes Deal hinzufügen</button>
            </div>
          ` : `
            <table class="data-table">
              <thead>
                <tr>
                  <th>Unternehmen</th>
                  <th>Wert</th>
                  <th>Stage</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody>
                ${deals.map(d => {
                  const stage = SALES_STAGES.find(s => s.key === d.stage);
                  return `
                    <tr class="deal-row" data-id="${d.id}">
                      <td class="font-bold">${App.utils.escape(d.company)}</td>
                      <td>${App.utils.formatCurrency(d.value)}</td>
                      <td><span class="badge" style="background:${stage?.color}22;color:${stage?.color}">${stage?.label || d.stage}</span></td>
                      <td class="text-sm text-muted">${App.utils.formatDate(d.createdAt)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `}
        </div>
      ` : ''}

      ${deals.length === 0 && activeTab === 'pipeline' ? `
        <div class="card mt-24">
          <div class="empty-state">
            <div class="empty-state-icon">📊</div>
            <div class="empty-state-title">Noch keine Deals</div>
            <div class="empty-state-desc">Füge dein erstes Deal hinzu, um deine Verkaufspipeline zu verwalten.</div>
            <button class="btn btn-primary mt-16" id="addDealBtn3">Erstes Deal hinzufügen</button>
          </div>
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

    // Add deal buttons
    ['addDealBtn', 'addDealBtn2', 'addDealBtn3'].forEach(id => {
      const btn = container.querySelector(`#${id}`);
      if (btn) btn.addEventListener('click', () => showAddDealModal());
    });

    // Deal card clicks
    container.querySelectorAll('.kanban-card').forEach(card => {
      card.addEventListener('click', () => {
        const deal = deals.find(d => d.id === card.dataset.id);
        if (deal) showDealDetailModal(deal);
      });
    });

    // Deal row clicks
    container.querySelectorAll('.deal-row').forEach(row => {
      row.addEventListener('click', () => {
        const deal = deals.find(d => d.id === row.dataset.id);
        if (deal) showDealDetailModal(deal);
      });
    });
  }

  function renderDealCard(d) {
    const stage = SALES_STAGES.find(s => s.key === d.stage);
    return `
      <div class="kanban-card" data-id="${d.id}">
        <div class="kanban-card-company">${App.utils.escape(d.company)}</div>
        <div class="kanban-card-role" style="font-size:0.85rem;font-weight:600">${App.utils.escape(d.dealName || 'Unbenanntes Deal')}</div>
        <div class="kanban-card-meta">
          <span style="color:${stage?.color};font-weight:600">${App.utils.formatCurrency(d.value)}</span>
          ${d.decision_makers ? `<span class="text-xs text-muted">👤 ${d.decision_makers.length}</span>` : ''}
        </div>
        ${d.notes ? `<div class="text-xs text-muted mt-8" style="opacity:0.8">${App.utils.escape(d.notes.slice(0, 50))}${d.notes.length > 50 ? '...' : ''}</div>` : ''}
      </div>`;
  }

  function showAddDealModal(editDeal = null) {
    const isEdit = !!editDeal;
    const d = editDeal || {};
    App.modal.show(`
      <div class="modal-header">
        <div class="modal-title">${isEdit ? 'Deal bearbeiten' : 'Neues Deal'}</div>
        <button class="modal-close">&times;</button>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Unternehmen *</label>
          <input class="form-input" id="mCompany" placeholder="z.B. TechCorp AG" value="${App.utils.escape(d.company || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Deal Name *</label>
          <input class="form-input" id="mDealName" placeholder="z.B. Enterprise-Paket" value="${App.utils.escape(d.dealName || '')}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Deal Value (€) *</label>
          <input class="form-input" type="number" id="mValue" placeholder="z.B. 50000" value="${d.value || ''}" min="0" step="100">
        </div>
        <div class="form-group">
          <label class="form-label">Stage</label>
          <select class="form-select" id="mStage">
            ${SALES_STAGES.map(s => `<option value="${s.key}" ${(d.stage || 'Prospecting') === s.key ? 'selected' : ''}>${s.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Entscheidungsträger (optional)</label>
          <input class="form-input" id="mDecisionMakers" placeholder="z.B. Name, Titel" value="${App.utils.escape((d.decision_makers || []).join('; '))}">
        </div>
        <div class="form-group">
          <label class="form-label">Timeline (optional)</label>
          <input class="form-input" type="date" id="mTimeline" value="${d.timeline || App.utils.today()}">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Notizen</label>
        <textarea class="form-textarea" id="mNotes" rows="3" placeholder="Kontext, Anforderungen, wichtige Details...">${App.utils.escape(d.notes || '')}</textarea>
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
        if (confirm(`Deal "${d.company}" wirklich löschen?`)) {
          deals = deals.filter(x => x.id !== d.id);
          save();
          App.modal.hide();
          App.toast('Deal gelöscht', 'info');
          render();
        }
      });
    }

    overlay.querySelector('#mSave').addEventListener('click', () => {
      const company = overlay.querySelector('#mCompany').value.trim();
      const dealName = overlay.querySelector('#mDealName').value.trim();
      const value = parseFloat(overlay.querySelector('#mValue').value) || 0;

      if (!company || !dealName || value <= 0) {
        App.toast('Unternehmen, Deal Name und Value sind erforderlich', 'error');
        return;
      }

      const decisionMakers = overlay.querySelector('#mDecisionMakers').value.trim()
        .split(';')
        .map(m => m.trim())
        .filter(m => m);

      const updated = {
        id: d.id || App.utils.uuid(),
        company,
        dealName,
        value,
        stage: overlay.querySelector('#mStage').value,
        timeline: overlay.querySelector('#mTimeline').value,
        decision_makers: decisionMakers,
        notes: overlay.querySelector('#mNotes').value.trim(),
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isEdit) {
        deals = deals.map(x => x.id === d.id ? updated : x);
        App.toast('Deal aktualisiert', 'success');
      } else {
        deals.push(updated);
        App.toast('Deal hinzugefügt', 'success');
      }
      save();
      App.modal.hide();
      render();
    });
  }

  function showDealDetailModal(d) {
    const stage = SALES_STAGES.find(s => s.key === d.stage) || SALES_STAGES[0];
    App.modal.show(`
      <div class="modal-header">
        <div>
          <div class="modal-title">${App.utils.escape(d.company)}</div>
          <div class="text-sm text-muted">${App.utils.escape(d.dealName)}</div>
        </div>
        <button class="modal-close">&times;</button>
      </div>

      <div class="flex gap-12 mb-16" style="flex-wrap:wrap">
        <span class="badge" style="background:${stage.color}22;color:${stage.color}">${stage.label}</span>
        <span class="text-sm text-muted">💰 ${App.utils.formatCurrency(d.value)}</span>
        ${d.timeline ? `<span class="text-sm text-muted">📅 ${App.utils.formatDate(d.timeline)}</span>` : ''}
      </div>

      ${d.notes ? `
        <div class="callout">
          <div class="callout-title">Notizen</div>
          ${App.utils.escape(d.notes)}
        </div>
      ` : ''}

      ${d.decision_makers && d.decision_makers.length > 0 ? `
        <div class="callout mt-16">
          <div class="callout-title">Entscheidungsträger</div>
          <ul style="margin:8px 0;padding-left:20px">
            ${d.decision_makers.map(dm => `<li>${App.utils.escape(dm)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="mt-16">
        <div class="form-label mb-12">Stage ändern</div>
        <div class="flex gap-8" style="flex-wrap:wrap">
          ${SALES_STAGES.map(s => `
            <button class="btn btn-sm ${d.stage === s.key ? 'btn-primary' : 'btn-secondary'}" data-newstage="${s.key}">
              ${s.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="mt-24">
        <div class="form-label mb-12">Aktionen</div>
        <div class="flex gap-8" style="flex-wrap:wrap">
          <button class="btn btn-secondary btn-sm" id="dGenerateScript">📝 Script generieren</button>
          <button class="btn btn-secondary btn-sm" id="dGenerateFAQ">❓ FAQ generieren</button>
          <button class="btn btn-secondary btn-sm" id="dGeneratePresentation">🎯 Präsentation generieren</button>
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

    // Stage change
    overlay.querySelectorAll('[data-newstage]').forEach(btn => {
      btn.addEventListener('click', () => {
        d.stage = btn.dataset.newstage;
        d.updatedAt = new Date().toISOString();
        deals = deals.map(x => x.id === d.id ? d : x);
        save();
        App.modal.hide();
        App.toast(`Stage: ${btn.textContent}`, 'success');
        render();
      });
    });

    // Action buttons
    overlay.querySelector('#dGenerateScript').addEventListener('click', () => {
      App.modal.hide();
      generateScriptForDeal(d);
    });

    overlay.querySelector('#dGenerateFAQ').addEventListener('click', () => {
      App.modal.hide();
      generateFAQForDeal(d);
    });

    overlay.querySelector('#dGeneratePresentation').addEventListener('click', () => {
      App.modal.hide();
      generatePresentationForDeal(d);
    });
  }

  render();
});

/**
 * Placeholder functions called by deal detail modal
 * These are implemented in separate modules
 */
function generateScriptForDeal(deal) {
  // Implemented in script-generator.js
  if (window.ScriptGenerator) {
    window.ScriptGenerator.generate(deal);
  } else {
    App.toast('Script-Generator noch nicht verfügbar', 'error');
  }
}

function generateFAQForDeal(deal) {
  // Implemented in faq-builder.js
  if (window.FAQBuilder) {
    window.FAQBuilder.generateForDeal(deal);
  } else {
    App.toast('FAQ-Builder noch nicht verfügbar', 'error');
  }
}

function generatePresentationForDeal(deal) {
  // Implemented in presentation-gen.js
  if (window.PresentationGen) {
    window.PresentationGen.generate(deal);
  } else {
    App.toast('Präsentations-Generator noch nicht verfügbar', 'error');
  }
}

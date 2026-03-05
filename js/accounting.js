/**
 * CareerOS — Buchhaltung (Kontora-inspired)
 *
 * Features:
 * - Dashboard: monthly revenue, open invoices, expenses
 * - Customers (Kundenkartei): CRUD
 * - Invoices (AR): create, status tracking, Austrian VAT, print
 * - Expenses (ER): track expenses by category
 */

// Austrian VAT rates
const VAT_RATES = [0, 10, 13, 20];

const EXPENSE_CATEGORIES = [
  'Miete & Büro', 'Personal', 'Software & Tools', 'Marketing & Werbung',
  'Reise & Fahrtkosten', 'Telefon & Internet', 'Steuerberater & Rechtsberatung',
  'Fortbildung', 'Büromaterial', 'Sonstiges'
];

const INV_STATUSES = [
  { key: 'Entwurf',       label: 'Entwurf',     css: 'inv-entwurf' },
  { key: 'Offen',         label: 'Offen',        css: 'inv-offen' },
  { key: 'Bezahlt',       label: 'Bezahlt',      css: 'inv-bezahlt' },
  { key: 'Überfällig',    label: 'Überfällig',   css: 'inv-ueberfaellig' },
];

App.register('accounting', (container) => {
  let activeTab = 'dashboard';

  function render() {
    container.innerHTML = `
      <div class="page-header">
        <span class="page-tag">Sub-Tool · Kontora-inspired</span>
        <h1 class="page-title">Buchhaltung</h1>
        <p class="page-sub">Rechnungen, Kunden und Ausgaben für Selbstständige & Freelancer</p>
      </div>

      <div class="accounting-tabs" id="accTabs">
        <button class="acc-tab ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">📊 Übersicht</button>
        <button class="acc-tab ${activeTab === 'invoices' ? 'active' : ''}" data-tab="invoices">🧾 Rechnungen (AR)</button>
        <button class="acc-tab ${activeTab === 'expenses' ? 'active' : ''}" data-tab="expenses">💸 Ausgaben (ER)</button>
        <button class="acc-tab ${activeTab === 'customers' ? 'active' : ''}" data-tab="customers">👤 Kunden</button>
      </div>

      <div id="accContent"></div>
    `;

    // Tab switching
    container.querySelectorAll('.acc-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        container.querySelectorAll('.acc-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTab(container.querySelector('#accContent'));
      });
    });

    renderTab(container.querySelector('#accContent'));
  }

  function renderTab(el) {
    switch (activeTab) {
      case 'dashboard':  renderDashboard(el);  break;
      case 'invoices':   renderInvoices(el);    break;
      case 'expenses':   renderExpenses(el);    break;
      case 'customers':  renderCustomers(el);   break;
    }
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  function renderDashboard(el) {
    const invoices = App.data.get('invoices');
    const expenses = App.data.get('expenses');
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();

    function inMonth(date, month, year) {
      const d = new Date(date);
      return d.getMonth() === month && d.getFullYear() === year;
    }

    const monthInvoices   = invoices.filter(i => inMonth(i.date, m, y));
    const monthRevenue    = invoices.filter(i => i.status === 'Bezahlt' && inMonth(i.date, m, y))
                              .reduce((s, i) => s + (parseFloat(i.totalGross) || 0), 0);
    const openAmount      = invoices.filter(i => i.status === 'Offen')
                              .reduce((s, i) => s + (parseFloat(i.totalGross) || 0), 0);
    const overdueAmount   = invoices.filter(i => {
                              if (i.status !== 'Offen') return false;
                              return i.dueDate && new Date(i.dueDate) < now;
                            }).reduce((s, i) => s + (parseFloat(i.totalGross) || 0), 0);
    const monthExpenses   = expenses.filter(e => inMonth(e.date, m, y))
                              .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    const profit          = monthRevenue - monthExpenses;

    // Recent invoices
    const recent = [...invoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

    // Expense by category
    const byCat = {};
    expenses.filter(e => inMonth(e.date, m, y)).forEach(e => {
      byCat[e.category] = (byCat[e.category] || 0) + (parseFloat(e.amount) || 0);
    });

    el.innerHTML = `
      <div class="grid-4 mb-24">
        <div class="stat-cell">
          <div class="stat-label">Umsatz (Monat)</div>
          <div class="stat-value">${App.utils.formatCurrency(monthRevenue)}</div>
          <div class="stat-desc">${monthInvoices.length} Rechnungen</div>
        </div>
        <div class="stat-cell">
          <div class="stat-label">Offene Forderungen</div>
          <div class="stat-value" style="font-size:1.4rem">${App.utils.formatCurrency(openAmount)}</div>
          <div class="stat-desc" style="${overdueAmount > 0 ? 'color:#ef4444' : ''}">
            ${overdueAmount > 0 ? `⚠ ${App.utils.formatCurrency(overdueAmount)} überfällig` : 'Alle pünktlich'}
          </div>
        </div>
        <div class="stat-cell">
          <div class="stat-label">Ausgaben (Monat)</div>
          <div class="stat-value" style="font-size:1.4rem">${App.utils.formatCurrency(monthExpenses)}</div>
          <div class="stat-desc">${Object.keys(byCat).length} Kategorien</div>
        </div>
        <div class="stat-cell">
          <div class="stat-label">Gewinn (Monat)</div>
          <div class="stat-value" style="color:${profit >= 0 ? 'var(--status-green)' : '#ef4444'};font-size:1.4rem">
            ${App.utils.formatCurrency(profit)}
          </div>
          <div class="stat-desc">Umsatz minus Ausgaben</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="flex-between mb-16">
            <div class="card-title">Letzte Rechnungen</div>
            <button class="btn btn-ghost btn-sm" onclick="document.querySelector('[data-tab=invoices]').click()">Alle →</button>
          </div>
          ${recent.length === 0 ? `
            <div class="empty-state" style="padding:20px 0">
              <div class="text-muted">Noch keine Rechnungen</div>
            </div>
          ` : `
            <table class="data-table">
              <thead><tr><th>Nr.</th><th>Kunde</th><th>Betrag</th><th>Status</th></tr></thead>
              <tbody>
                ${recent.map(inv => `
                  <tr>
                    <td class="text-copper font-bold text-sm">${App.utils.escape(inv.number)}</td>
                    <td>${App.utils.escape(inv.customerName || '—')}</td>
                    <td class="font-bold">${App.utils.formatCurrency(inv.totalGross)}</td>
                    <td><span class="invoice-status ${getInvCss(inv)}">${App.utils.escape(inv.status)}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>

        <div class="card">
          <div class="card-title">Ausgaben nach Kategorie (Monat)</div>
          ${Object.keys(byCat).length === 0 ? `
            <div class="empty-state" style="padding:20px 0">
              <div class="text-muted">Noch keine Ausgaben diesen Monat</div>
            </div>
          ` : Object.entries(byCat)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amt]) => {
                const pct = monthExpenses > 0 ? (amt / monthExpenses * 100) : 0;
                return `
                  <div style="margin-bottom:12px">
                    <div class="flex-between text-sm mb-4">
                      <span>${App.utils.escape(cat)}</span>
                      <span class="font-bold">${App.utils.formatCurrency(amt)}</span>
                    </div>
                    <div style="height:6px;background:var(--border);border-radius:99px">
                      <div style="width:${pct}%;height:100%;background:var(--copper);border-radius:99px"></div>
                    </div>
                  </div>`;
              }).join('')}
        </div>
      </div>
    `;
  }

  // ============================================================
  // INVOICES (AR)
  // ============================================================

  function renderInvoices(el) {
    let invoices = App.data.get('invoices');
    let statusFilter = 'all';

    function renderList() {
      const filtered = statusFilter === 'all' ? invoices : invoices.filter(i => i.status === statusFilter);
      el.innerHTML = `
        <div class="flex-between mb-16" style="flex-wrap:wrap;gap:12px">
          <div class="flex gap-8" style="flex-wrap:wrap">
            ${['all', ...INV_STATUSES.map(s => s.key)].map(f => `
              <button class="acc-tab ${statusFilter === f ? 'active' : ''}" data-sf="${f}">
                ${f === 'all' ? 'Alle' : f} (${f === 'all' ? invoices.length : invoices.filter(i => i.status === f).length})
              </button>`).join('')}
          </div>
          <button class="btn btn-primary" id="newInvBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Neue Rechnung
          </button>
        </div>

        ${filtered.length === 0 ? `
          <div class="card">
            <div class="empty-state">
              <div class="empty-state-icon">🧾</div>
              <div class="empty-state-title">Keine Rechnungen</div>
              <div class="empty-state-desc">Erstelle deine erste Rechnung</div>
              <button class="btn btn-primary mt-16" id="newInvBtn2">Rechnung erstellen</button>
            </div>
          </div>
        ` : `
          <div class="card" style="padding:0;overflow:hidden">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Rechnungsnr.</th><th>Datum</th><th>Fällig</th>
                  <th>Kunde</th><th>Netto</th><th>Brutto</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                ${filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map(inv => `
                  <tr>
                    <td class="font-bold text-copper">${App.utils.escape(inv.number)}</td>
                    <td>${App.utils.formatDate(inv.date)}</td>
                    <td>${App.utils.formatDate(inv.dueDate)}</td>
                    <td>${App.utils.escape(inv.customerName || '—')}</td>
                    <td>${App.utils.formatCurrency(inv.totalNet)}</td>
                    <td class="font-bold">${App.utils.formatCurrency(inv.totalGross)}</td>
                    <td>
                      <select class="vat-select" data-invid="${inv.id}" style="font-size:0.75rem;padding:4px 6px">
                        ${INV_STATUSES.map(s => `<option value="${s.key}" ${inv.status === s.key ? 'selected' : ''}>${s.label}</option>`).join('')}
                      </select>
                    </td>
                    <td>
                      <div class="flex gap-8">
                        <button class="btn btn-ghost btn-sm btn-icon" title="Ansehen/Drucken" data-print="${inv.id}">🖨</button>
                        <button class="btn btn-secondary btn-sm btn-icon" title="Bearbeiten" data-edit="${inv.id}">✎</button>
                        <button class="btn btn-danger btn-sm btn-icon" title="Löschen" data-del="${inv.id}">✕</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      `;

      // Status filter
      el.querySelectorAll('[data-sf]').forEach(btn => {
        btn.addEventListener('click', () => { statusFilter = btn.dataset.sf; renderList(); });
      });

      // New invoice
      const newBtn = el.querySelector('#newInvBtn');
      if (newBtn) newBtn.addEventListener('click', () => showInvoiceModal(null, afterSave));
      const newBtn2 = el.querySelector('#newInvBtn2');
      if (newBtn2) newBtn2.addEventListener('click', () => showInvoiceModal(null, afterSave));

      // Status change dropdowns
      el.querySelectorAll('[data-invid]').forEach(sel => {
        sel.addEventListener('change', () => {
          invoices = invoices.map(i => i.id === sel.dataset.invid ? { ...i, status: sel.value } : i);
          App.data.set('invoices', invoices);
          App.toast(`Status: ${sel.value}`, 'success');
        });
      });

      // Edit buttons
      el.querySelectorAll('[data-edit]').forEach(btn => {
        btn.addEventListener('click', () => {
          const inv = invoices.find(i => i.id === btn.dataset.edit);
          if (inv) showInvoiceModal(inv, afterSave);
        });
      });

      // Delete buttons
      el.querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', () => {
          const inv = invoices.find(i => i.id === btn.dataset.del);
          if (inv && confirm(`Rechnung ${inv.number} löschen?`)) {
            invoices = invoices.filter(i => i.id !== btn.dataset.del);
            App.data.set('invoices', invoices);
            App.toast('Rechnung gelöscht', 'info');
            renderList();
          }
        });
      });

      // Print buttons
      el.querySelectorAll('[data-print]').forEach(btn => {
        btn.addEventListener('click', () => {
          const inv = invoices.find(i => i.id === btn.dataset.print);
          if (inv) printInvoice(inv);
        });
      });
    }

    function afterSave(updated) {
      const idx = invoices.findIndex(i => i.id === updated.id);
      if (idx >= 0) invoices[idx] = updated; else invoices.push(updated);
      App.data.set('invoices', invoices);
      renderList();
    }

    renderList();
  }

  // ============================================================
  // INVOICE MODAL (Create / Edit)
  // ============================================================

  function showInvoiceModal(inv, onSave) {
    const customers = App.data.get('customers');
    const invoices = App.data.get('invoices');
    const isEdit = !!inv;
    const j = inv || {
      id: App.utils.uuid(),
      number: nextInvoiceNumber(invoices),
      date: App.utils.today(),
      dueDate: addDays(App.utils.today(), 30),
      status: 'Offen',
      lines: [{ desc: '', qty: 1, unitPrice: 0, vat: 20 }]
    };
    const lines = j.lines || [{ desc: '', qty: 1, unitPrice: 0, vat: 20 }];

    function lineRow(l, i) {
      return `
        <div class="invoice-line" data-lrow="${i}">
          <input class="form-input" placeholder="Beschreibung" value="${App.utils.escape(l.desc || '')}" data-field="desc">
          <input class="form-input" type="number" min="0.01" step="0.01" placeholder="Menge" value="${l.qty || 1}" data-field="qty" style="text-align:right">
          <input class="form-input" type="number" min="0" step="0.01" placeholder="Einzelpreis €" value="${l.unitPrice || ''}" data-field="unitPrice" style="text-align:right">
          <select class="vat-select form-select" data-field="vat">
            ${VAT_RATES.map(r => `<option value="${r}" ${(l.vat || 20) == r ? 'selected' : ''}>${r}% MwSt</option>`).join('')}
          </select>
          <button class="btn btn-danger btn-sm btn-icon del-line" title="Zeile löschen">✕</button>
        </div>`;
    }

    App.modal.show(`
      <div class="modal-header">
        <div class="modal-title">${isEdit ? 'Rechnung bearbeiten' : 'Neue Rechnung'}</div>
        <button class="modal-close">&times;</button>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Rechnungsnummer</label>
          <input class="form-input" id="invNum" value="${App.utils.escape(j.number)}">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" id="invStatus">
            ${INV_STATUSES.map(s => `<option value="${s.key}" ${j.status === s.key ? 'selected' : ''}>${s.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Rechnungsdatum</label>
          <input class="form-input" type="date" id="invDate" value="${j.date}">
        </div>
        <div class="form-group">
          <label class="form-label">Fälligkeitsdatum</label>
          <input class="form-input" type="date" id="invDue" value="${j.dueDate || ''}">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Kunde</label>
        <select class="form-select" id="invCustomer">
          <option value="">— Kunden wählen —</option>
          ${customers.map(c => `<option value="${c.id}" data-name="${App.utils.escape(c.name)}" ${j.customerId === c.id ? 'selected' : ''}>${App.utils.escape(c.name)}</option>`).join('')}
          <option value="__manual__">Manuell eingeben</option>
        </select>
      </div>

      <div class="form-group" id="manualCustomerGroup" style="display:${(!j.customerId || j.customerId === '__manual__') ? 'block' : 'none'}">
        <label class="form-label">Kundenname (manuell)</label>
        <input class="form-input" id="invCustName" value="${App.utils.escape(j.customerName || '')}" placeholder="Firmenname oder Vollname">
      </div>

      <div class="divider"></div>
      <div class="form-label mb-8">Leistungspositionen</div>

      <div id="linesContainer">
        ${lines.map((l, i) => lineRow(l, i)).join('')}
      </div>

      <button class="btn btn-ghost btn-sm mt-8" id="addLineBtn">
        + Zeile hinzufügen
      </button>

      <div class="divider"></div>
      <div id="invTotals" class="mb-16"></div>

      <div class="form-group">
        <label class="form-label">Notiz (optional, erscheint auf Rechnung)</label>
        <textarea class="form-textarea" id="invNote" rows="2">${App.utils.escape(j.note || '')}</textarea>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary modal-close">Abbrechen</button>
        <button class="btn btn-ghost btn-sm" id="saveAndPrintBtn">Speichern & Drucken</button>
        <button class="btn btn-primary" id="saveInvBtn">Speichern</button>
      </div>
    `);

    const overlay = document.getElementById('modal-overlay');
    let currentLines = lines.map(l => ({ ...l }));

    function updateTotals() {
      let totalNet = 0, totalVat = 0;
      currentLines.forEach(l => {
        const net = (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0);
        totalNet += net;
        totalVat += net * (parseInt(l.vat) || 0) / 100;
      });
      const totalGross = totalNet + totalVat;
      overlay.querySelector('#invTotals').innerHTML = `
        <table style="width:100%;font-size:0.875rem">
          <tr><td class="text-muted">Netto</td><td style="text-align:right">${App.utils.formatCurrency(totalNet)}</td></tr>
          <tr><td class="text-muted">MwSt</td><td style="text-align:right">${App.utils.formatCurrency(totalVat)}</td></tr>
          <tr style="font-weight:700;font-size:1rem;border-top:2px solid var(--border)">
            <td>Gesamt (Brutto)</td>
            <td style="text-align:right;color:var(--copper)">${App.utils.formatCurrency(totalGross)}</td>
          </tr>
        </table>
      `;
      return { totalNet, totalVat, totalGross };
    }

    function refreshLines() {
      overlay.querySelector('#linesContainer').innerHTML =
        currentLines.map((l, i) => lineRow(l, i)).join('');
      bindLineEvents();
      updateTotals();
    }

    function bindLineEvents() {
      overlay.querySelectorAll('[data-lrow]').forEach(row => {
        const idx = parseInt(row.dataset.lrow);
        row.querySelectorAll('[data-field]').forEach(inp => {
          inp.addEventListener('input', () => {
            currentLines[idx][inp.dataset.field] = inp.value;
            updateTotals();
          });
        });
        row.querySelector('.del-line').addEventListener('click', () => {
          if (currentLines.length === 1) {
            App.toast('Mindestens eine Position erforderlich', 'error');
            return;
          }
          currentLines.splice(idx, 1);
          refreshLines();
        });
      });
    }

    bindLineEvents();
    updateTotals();

    // Add line
    overlay.querySelector('#addLineBtn').addEventListener('click', () => {
      currentLines.push({ desc: '', qty: 1, unitPrice: 0, vat: 20 });
      refreshLines();
    });

    // Customer select
    overlay.querySelector('#invCustomer').addEventListener('change', e => {
      const group = overlay.querySelector('#manualCustomerGroup');
      group.style.display = (e.target.value === '' || e.target.value === '__manual__') ? 'block' : 'none';
      if (e.target.value !== '' && e.target.value !== '__manual__') {
        const opt = e.target.selectedOptions[0];
        overlay.querySelector('#invCustName').value = opt.dataset.name || '';
      }
    });

    function buildInvoice() {
      const totals = updateTotals();
      const custSel = overlay.querySelector('#invCustomer');
      const custId = custSel.value === '__manual__' || custSel.value === '' ? null : custSel.value;
      const custName = custId
        ? (overlay.querySelector('#invCustomer').selectedOptions[0]?.dataset.name || '')
        : overlay.querySelector('#invCustName').value.trim();
      return {
        id: j.id,
        number: overlay.querySelector('#invNum').value.trim() || j.number,
        date: overlay.querySelector('#invDate').value,
        dueDate: overlay.querySelector('#invDue').value,
        status: overlay.querySelector('#invStatus').value,
        customerId: custId,
        customerName: custName,
        lines: currentLines,
        totalNet: totals.totalNet,
        totalVat: totals.totalVat,
        totalGross: totals.totalGross,
        note: overlay.querySelector('#invNote').value.trim(),
        createdAt: j.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    overlay.querySelector('#saveInvBtn').addEventListener('click', () => {
      const updated = buildInvoice();
      if (!updated.number) { App.toast('Rechnungsnummer fehlt', 'error'); return; }
      App.toast(isEdit ? 'Rechnung aktualisiert' : 'Rechnung erstellt', 'success');
      App.modal.hide();
      onSave(updated);
    });

    overlay.querySelector('#saveAndPrintBtn').addEventListener('click', () => {
      const updated = buildInvoice();
      App.toast('Gespeichert', 'success');
      App.modal.hide();
      onSave(updated);
      setTimeout(() => printInvoice(updated), 300);
    });
  }

  // ============================================================
  // PRINT INVOICE
  // ============================================================

  function printInvoice(inv) {
    const win = window.open('', '_blank');
    win.document.write(`
<!DOCTYPE html><html lang="de"><head>
<meta charset="UTF-8">
<title>Rechnung ${inv.number}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #1A1410; font-size: 13px; }
  h1 { font-size: 24px; color: #C05A2A; margin-bottom: 4px; }
  .head { display: flex; justify-content: space-between; margin-bottom: 40px; }
  .label { font-size: 11px; color: #7A6A60; text-transform: uppercase; letter-spacing: 0.05em; }
  table { width: 100%; border-collapse: collapse; margin: 24px 0; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; color: #7A6A60; padding: 8px 10px; border-bottom: 2px solid #E8E0D5; }
  td { padding: 8px 10px; border-bottom: 1px solid #E8E0D5; }
  .total-row { font-weight: bold; font-size: 15px; color: #C05A2A; }
  .note { margin-top: 24px; padding: 12px; background: #FAF7F3; border-left: 3px solid #C05A2A; font-size: 12px; color: #3D3228; }
  @media print { body { margin: 20px; } }
</style>
</head><body>
<div class="head">
  <div>
    <h1>RECHNUNG</h1>
    <div style="font-size:18px;font-weight:bold;color:#3D3228">${inv.number}</div>
  </div>
  <div style="text-align:right">
    <div class="label">Rechnungsdatum</div>
    <div>${App.utils.formatDate(inv.date)}</div>
    <div class="label" style="margin-top:8px">Fällig bis</div>
    <div style="font-weight:bold">${App.utils.formatDate(inv.dueDate)}</div>
  </div>
</div>

${inv.customerName ? `<div style="margin-bottom:24px"><div class="label">Rechnungsempfänger</div><div style="font-size:15px;font-weight:bold">${inv.customerName}</div></div>` : ''}

<table>
  <thead><tr><th>Beschreibung</th><th style="text-align:right">Menge</th><th style="text-align:right">Einzelpreis</th><th style="text-align:right">MwSt</th><th style="text-align:right">Betrag</th></tr></thead>
  <tbody>
    ${(inv.lines || []).map(l => {
      const net = (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0);
      return `<tr>
        <td>${l.desc || ''}</td>
        <td style="text-align:right">${l.qty}</td>
        <td style="text-align:right">${new Intl.NumberFormat('de-AT',{style:'currency',currency:'EUR'}).format(l.unitPrice || 0)}</td>
        <td style="text-align:right">${l.vat || 0}%</td>
        <td style="text-align:right">${new Intl.NumberFormat('de-AT',{style:'currency',currency:'EUR'}).format(net)}</td>
      </tr>`;
    }).join('')}
    <tr><td colspan="4" style="text-align:right;color:#7A6A60;font-size:12px">Nettobetrag</td><td style="text-align:right">${App.utils.formatCurrency(inv.totalNet)}</td></tr>
    <tr><td colspan="4" style="text-align:right;color:#7A6A60;font-size:12px">MwSt gesamt</td><td style="text-align:right">${App.utils.formatCurrency(inv.totalVat)}</td></tr>
    <tr class="total-row"><td colspan="4" style="text-align:right">Gesamtbetrag (Brutto)</td><td style="text-align:right">${App.utils.formatCurrency(inv.totalGross)}</td></tr>
  </tbody>
</table>

${inv.note ? `<div class="note">${inv.note}</div>` : ''}

<script>window.onload = () => window.print();<\/script>
</body></html>`);
    win.document.close();
  }

  // ============================================================
  // EXPENSES (ER)
  // ============================================================

  function renderExpenses(el) {
    let expenses = App.data.get('expenses');
    let filter = '';

    function renderList() {
      const filtered = filter ? expenses.filter(e => e.category === filter) : expenses;
      const total = filtered.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

      el.innerHTML = `
        <div class="flex-between mb-16" style="flex-wrap:wrap;gap:12px">
          <div class="flex gap-8" style="flex-wrap:wrap;align-items:center">
            <select class="form-select" id="catFilter" style="width:auto;min-width:160px">
              <option value="">Alle Kategorien</option>
              ${EXPENSE_CATEGORIES.map(c => `<option value="${c}" ${filter === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
            <span class="text-sm text-muted">${filtered.length} Ausgaben · ${App.utils.formatCurrency(total)}</span>
          </div>
          <button class="btn btn-primary" id="newExpBtn">+ Ausgabe erfassen</button>
        </div>

        ${filtered.length === 0 ? `
          <div class="card">
            <div class="empty-state">
              <div class="empty-state-icon">💸</div>
              <div class="empty-state-title">Keine Ausgaben</div>
              <button class="btn btn-primary mt-16" id="newExpBtn2">Erste Ausgabe erfassen</button>
            </div>
          </div>
        ` : `
          <div class="card" style="padding:0;overflow:hidden">
            <table class="data-table">
              <thead><tr><th>Datum</th><th>Lieferant</th><th>Kategorie</th><th>Betrag</th><th></th></tr></thead>
              <tbody>
                ${filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map(exp => `
                  <tr>
                    <td>${App.utils.formatDate(exp.date)}</td>
                    <td class="font-bold">${App.utils.escape(exp.vendor || '—')}</td>
                    <td><span class="badge badge-copper">${App.utils.escape(exp.category)}</span></td>
                    <td class="font-bold">${App.utils.formatCurrency(exp.amount)}</td>
                    <td>
                      <button class="btn btn-danger btn-sm btn-icon" data-delexp="${exp.id}">✕</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      `;

      el.querySelector('#catFilter').addEventListener('change', e => { filter = e.target.value; renderList(); });
      const nb = el.querySelector('#newExpBtn');
      if (nb) nb.addEventListener('click', () => showExpenseModal(null, after));
      const nb2 = el.querySelector('#newExpBtn2');
      if (nb2) nb2.addEventListener('click', () => showExpenseModal(null, after));
      el.querySelectorAll('[data-delexp]').forEach(btn => {
        btn.addEventListener('click', () => {
          expenses = expenses.filter(e => e.id !== btn.dataset.delexp);
          App.data.set('expenses', expenses);
          App.toast('Ausgabe gelöscht', 'info');
          renderList();
        });
      });
    }

    function after(exp) {
      expenses.push(exp);
      App.data.set('expenses', expenses);
      renderList();
    }

    renderList();
  }

  function showExpenseModal(exp, onSave) {
    App.modal.show(`
      <div class="modal-header">
        <div class="modal-title">Ausgabe erfassen</div>
        <button class="modal-close">&times;</button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Lieferant *</label>
          <input class="form-input" id="eVendor" placeholder="z.B. AWS, Notariat Wien">
        </div>
        <div class="form-group">
          <label class="form-label">Betrag (€) *</label>
          <input class="form-input" type="number" id="eAmount" step="0.01" min="0" placeholder="0.00">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Kategorie</label>
          <select class="form-select" id="eCat">
            ${EXPENSE_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Datum</label>
          <input class="form-input" type="date" id="eDate" value="${App.utils.today()}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Notiz (optional)</label>
        <input class="form-input" id="eNote" placeholder="Beschreibung">
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-close">Abbrechen</button>
        <button class="btn btn-primary" id="saveExpBtn">Speichern</button>
      </div>
    `);

    const overlay = document.getElementById('modal-overlay');
    overlay.querySelector('#saveExpBtn').addEventListener('click', () => {
      const vendor = overlay.querySelector('#eVendor').value.trim();
      const amount = parseFloat(overlay.querySelector('#eAmount').value);
      if (!vendor || isNaN(amount) || amount <= 0) {
        App.toast('Lieferant und Betrag sind Pflichtfelder', 'error');
        return;
      }
      const saved = {
        id: App.utils.uuid(),
        vendor, amount,
        category: overlay.querySelector('#eCat').value,
        date: overlay.querySelector('#eDate').value,
        note: overlay.querySelector('#eNote').value.trim(),
        createdAt: new Date().toISOString()
      };
      App.modal.hide();
      App.toast('Ausgabe gespeichert', 'success');
      onSave(saved);
    });
  }

  // ============================================================
  // CUSTOMERS
  // ============================================================

  function renderCustomers(el) {
    let customers = App.data.get('customers');

    function renderList() {
      el.innerHTML = `
        <div class="flex-between mb-16">
          <span class="text-sm text-muted">${customers.length} Kunden</span>
          <button class="btn btn-primary" id="newCustBtn">+ Neuer Kunde</button>
        </div>
        ${customers.length === 0 ? `
          <div class="card">
            <div class="empty-state">
              <div class="empty-state-icon">👤</div>
              <div class="empty-state-title">Noch keine Kunden</div>
              <button class="btn btn-primary mt-16" id="newCustBtn2">Ersten Kunden anlegen</button>
            </div>
          </div>
        ` : `
          <div class="card" style="padding:0;overflow:hidden">
            <table class="data-table">
              <thead><tr><th>Name / Firma</th><th>UID</th><th>Kontakt</th><th>E-Mail</th><th></th></tr></thead>
              <tbody>
                ${customers.map(c => `
                  <tr>
                    <td class="font-bold">${App.utils.escape(c.name)}</td>
                    <td class="text-sm text-muted">${App.utils.escape(c.uid || '—')}</td>
                    <td class="text-sm">${App.utils.escape(c.contact || '—')}</td>
                    <td class="text-sm">${App.utils.escape(c.email || '—')}</td>
                    <td>
                      <div class="flex gap-8">
                        <button class="btn btn-secondary btn-sm" data-editc="${c.id}">Bearbeiten</button>
                        <button class="btn btn-danger btn-sm btn-icon" data-delc="${c.id}">✕</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      `;

      const nb = el.querySelector('#newCustBtn');
      if (nb) nb.addEventListener('click', () => showCustomerModal(null));
      const nb2 = el.querySelector('#newCustBtn2');
      if (nb2) nb2.addEventListener('click', () => showCustomerModal(null));
      el.querySelectorAll('[data-editc]').forEach(btn => {
        btn.addEventListener('click', () => {
          showCustomerModal(customers.find(c => c.id === btn.dataset.editc));
        });
      });
      el.querySelectorAll('[data-delc]').forEach(btn => {
        btn.addEventListener('click', () => {
          const c = customers.find(c => c.id === btn.dataset.delc);
          if (c && confirm(`"${c.name}" löschen?`)) {
            customers = customers.filter(x => x.id !== c.id);
            App.data.set('customers', customers);
            App.toast('Kunde gelöscht', 'info');
            renderList();
          }
        });
      });
    }

    function showCustomerModal(cust) {
      const isEdit = !!cust;
      const c = cust || {};
      App.modal.show(`
        <div class="modal-header">
          <div class="modal-title">${isEdit ? 'Kunde bearbeiten' : 'Neuer Kunde'}</div>
          <button class="modal-close">&times;</button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Firmenname / Vollname *</label>
            <input class="form-input" id="cName" value="${App.utils.escape(c.name || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">UID-Nummer (optional)</label>
            <input class="form-input" id="cUID" placeholder="ATU12345678" value="${App.utils.escape(c.uid || '')}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">E-Mail</label>
            <input class="form-input" type="email" id="cEmail" value="${App.utils.escape(c.email || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Telefon</label>
            <input class="form-input" id="cPhone" value="${App.utils.escape(c.phone || '')}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Adresse</label>
          <textarea class="form-textarea" id="cAddress" rows="2">${App.utils.escape(c.address || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Ansprechpartner</label>
          <input class="form-input" id="cContact" value="${App.utils.escape(c.contact || '')}">
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close">Abbrechen</button>
          <button class="btn btn-primary" id="saveCustBtn">${isEdit ? 'Speichern' : 'Anlegen'}</button>
        </div>
      `);

      const overlay = document.getElementById('modal-overlay');
      overlay.querySelector('#saveCustBtn').addEventListener('click', () => {
        const name = overlay.querySelector('#cName').value.trim();
        if (!name) { App.toast('Name ist ein Pflichtfeld', 'error'); return; }
        const updated = {
          id: c.id || App.utils.uuid(),
          name,
          uid:     overlay.querySelector('#cUID').value.trim(),
          email:   overlay.querySelector('#cEmail').value.trim(),
          phone:   overlay.querySelector('#cPhone').value.trim(),
          address: overlay.querySelector('#cAddress').value.trim(),
          contact: overlay.querySelector('#cContact').value.trim(),
          createdAt: c.createdAt || new Date().toISOString()
        };
        if (isEdit) {
          customers = customers.map(x => x.id === c.id ? updated : x);
        } else {
          customers.push(updated);
        }
        App.data.set('customers', customers);
        App.toast(isEdit ? 'Kunde aktualisiert' : 'Kunde angelegt', 'success');
        App.modal.hide();
        renderList();
      });
    }

    renderList();
  }

  render();
});

// ============================================================
// HELPERS
// ============================================================

function getInvCss(inv) {
  const now = new Date();
  if (inv.status === 'Offen' && inv.dueDate && new Date(inv.dueDate) < now) return 'inv-ueberfaellig';
  const s = INV_STATUSES.find(x => x.key === inv.status);
  return s ? s.css : 'inv-entwurf';
}

function nextInvoiceNumber(invoices) {
  const year = new Date().getFullYear();
  const thisYear = invoices.filter(i => i.number && i.number.startsWith(year + '-'));
  const nums = thisYear.map(i => parseInt(i.number.split('-')[1] || '0'));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `${year}-${String(max + 1).padStart(3, '0')}`;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

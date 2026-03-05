/**
 * CareerOS — Dashboard View
 */

App.register('dashboard', (container) => {
  const jobs = App.data.get('jobs');
  const invoices = App.data.get('invoices');
  const cvStore = App.data.getObj('cv_last', {});

  // Compute stats
  const activeJobs = jobs.filter(j => !['Offer', 'Rejected'].includes(j.status)).length;
  const totalJobs = jobs.length;

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const monthRevenue = invoices
    .filter(i => {
      if (i.status !== 'Bezahlt') return false;
      const d = new Date(i.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((s, i) => s + (parseFloat(i.totalGross) || 0), 0);

  const openInvoices = invoices.filter(i => i.status === 'Offen').length;
  const overdueInvoices = invoices.filter(i => {
    if (i.status !== 'Offen') return false;
    return i.dueDate && new Date(i.dueDate) < now;
  }).length;

  const atsScore = cvStore.score || 0;

  // Recent jobs
  const recentJobs = [...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  // Open invoices list
  const openInvList = invoices.filter(i => i.status === 'Offen').slice(0, 5);

  container.innerHTML = `
    <div class="page-header">
      <span class="page-tag">Übersicht</span>
      <h1 class="page-title">Dashboard</h1>
      <p class="page-sub">Willkommen zurück, Magomed. Hier ist dein aktueller Stand.</p>
    </div>

    <!-- KPI Row -->
    <div class="grid-4 mb-24">
      <div class="stat-cell">
        <div class="stat-label">ATS Score</div>
        <div class="stat-value" style="color:${atsScore >= 75 ? '#22c55e' : atsScore >= 50 ? '#C05A2A' : '#ef4444'}">${atsScore}</div>
        <div class="stat-desc">Letzter CV-Scan</div>
      </div>
      <div class="stat-cell">
        <div class="stat-label">Aktive Bewerbungen</div>
        <div class="stat-value">${activeJobs}</div>
        <div class="stat-desc">von ${totalJobs} gesamt</div>
      </div>
      <div class="stat-cell">
        <div class="stat-label">Umsatz (dieser Monat)</div>
        <div class="stat-value">${App.utils.formatCurrency(monthRevenue)}</div>
        <div class="stat-desc">bezahlte Rechnungen</div>
      </div>
      <div class="stat-cell">
        <div class="stat-label">Offene Rechnungen</div>
        <div class="stat-value" style="color:${overdueInvoices > 0 ? '#ef4444' : '#C05A2A'}">${openInvoices}</div>
        <div class="stat-desc">${overdueInvoices > 0 ? `<span style="color:#ef4444">${overdueInvoices} überfällig</span>` : 'alle pünktlich'}</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card mb-24">
      <div class="card-title">Schnellzugriff</div>
      <div class="flex gap-12" style="flex-wrap:wrap">
        <a href="#/cv" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          CV analysieren
        </a>
        <a href="#/jobs" class="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          Bewerbung hinzufügen
        </a>
        <a href="#/accounting" class="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Neue Rechnung
        </a>
      </div>
    </div>

    <div class="grid-2">

      <!-- Recent Applications -->
      <div class="card">
        <div class="flex-between mb-16">
          <div class="card-title">Letzte Bewerbungen</div>
          <a href="#/jobs" class="btn btn-ghost btn-sm">Alle ansehen</a>
        </div>
        ${recentJobs.length === 0 ? `
          <div class="empty-state" style="padding:30px 0">
            <div class="empty-state-icon">📋</div>
            <div class="text-muted">Noch keine Bewerbungen</div>
            <a href="#/jobs" class="btn btn-primary btn-sm mt-16">Erste hinzufügen</a>
          </div>
        ` : `
          <table class="data-table">
            <thead><tr><th>Unternehmen</th><th>Rolle</th><th>Status</th></tr></thead>
            <tbody>
              ${recentJobs.map(j => `
                <tr>
                  <td class="font-bold">${App.utils.escape(j.company)}</td>
                  <td class="text-sm text-muted">${App.utils.escape(j.role)}</td>
                  <td>${statusBadge(j.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>

      <!-- Open Invoices -->
      <div class="card">
        <div class="flex-between mb-16">
          <div class="card-title">Offene Rechnungen</div>
          <a href="#/accounting" class="btn btn-ghost btn-sm">Zur Buchhaltung</a>
        </div>
        ${openInvList.length === 0 ? `
          <div class="empty-state" style="padding:30px 0">
            <div class="empty-state-icon">✓</div>
            <div class="text-muted">Keine offenen Rechnungen</div>
          </div>
        ` : `
          <table class="data-table">
            <thead><tr><th>Rechnungsnr.</th><th>Kunde</th><th>Betrag</th><th>Fällig</th></tr></thead>
            <tbody>
              ${openInvList.map(inv => {
                const isOverdue = inv.dueDate && new Date(inv.dueDate) < new Date();
                return `
                  <tr>
                    <td class="text-sm text-copper font-bold">${App.utils.escape(inv.number)}</td>
                    <td>${App.utils.escape(inv.customerName || '—')}</td>
                    <td class="font-bold">${App.utils.formatCurrency(inv.totalGross)}</td>
                    <td class="${isOverdue ? 'text-sm' : 'text-sm'}" style="${isOverdue ? 'color:#ef4444;font-weight:700' : ''}">
                      ${App.utils.formatDate(inv.dueDate)}
                      ${isOverdue ? ' ⚠' : ''}
                    </td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>

    </div>

    <!-- CV Tip callout -->
    ${atsScore === 0 ? `
      <div class="callout mt-24">
        <div class="callout-title">💡 Starte mit dem CV Analyzer</div>
        Füge deinen Lebenslauf und eine Stellenausschreibung ein, um deinen ATS-Score zu berechnen
        und gezielte Optimierungsempfehlungen zu erhalten.
        <br><a href="#/cv" class="btn btn-primary btn-sm mt-8">CV analysieren →</a>
      </div>
    ` : `
      <div class="callout mt-24" style="border-left-color: ${atsScore >= 75 ? '#22c55e' : '#C05A2A'}">
        <div class="callout-title">Letzter ATS-Score: ${atsScore}/100</div>
        ${atsScore >= 75
          ? 'Dein CV ist gut optimiert. Halte ihn für jede neue Stelle aktuell.'
          : atsScore >= 50
            ? 'Dein CV ist auf einem guten Weg. Schau dir die Empfehlungen im CV Analyzer an.'
            : 'Dein CV hat Optimierungspotenzial. Nutze den CV Analyzer für konkrete Hinweise.'}
        <br><a href="#/cv" class="btn btn-ghost btn-sm mt-8">CV neu analysieren →</a>
      </div>
    `}
  `;
});

function statusBadge(status) {
  const map = {
    'Applied':    ['badge-gray',   'Beworben'],
    'Screening':  ['badge-blue',   'Screening'],
    'Interview':  ['badge-yellow', 'Interview'],
    'Offer':      ['badge-green',  'Angebot'],
    'Rejected':   ['badge-red',    'Abgelehnt'],
  };
  const [cls, label] = map[status] || ['badge-gray', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

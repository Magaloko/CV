/**
 * CareerOS — Presentation Generator
 * Auto-generate summary presentation slides from deal data
 */

window.PresentationGen = (() => {

  let presentations = App.data.get('sales_presentations', []);

  function savePresentations() {
    App.data.set('sales_presentations', presentations);
  }

  function generate(deal) {
    const presentation = {
      id: App.utils.uuid(),
      dealId: deal.id,
      company: deal.company,
      dealName: deal.dealName,
      createdAt: new Date().toISOString(),
      slides: generateSlides(deal)
    };

    presentations.push(presentation);
    savePresentations();

    displayPresentation(presentation);
  }

  function generateSlides(deal) {
    const slides = [
      {
        title: 'Deal Overview',
        type: 'cover',
        content: {
          company: deal.company,
          dealName: deal.dealName,
          date: new Date().toLocaleDateString('de-AT')
        }
      },
      {
        title: 'Key Metrics',
        type: 'metrics',
        content: {
          value: deal.value,
          stage: deal.stage,
          timeline: deal.timeline,
          decisionMakers: deal.decision_makers || []
        }
      },
      {
        title: 'Deal Progress',
        type: 'progress',
        content: {
          stage: deal.stage,
          notes: deal.notes
        }
      },
      {
        title: 'Next Steps',
        type: 'action',
        content: {
          actions: [
            'Schedule follow-up meeting',
            'Send proposal/contract',
            'Prepare implementation plan',
            'Confirm timeline'
          ]
        }
      }
    ];

    return slides;
  }

  function displayPresentation(presentation) {
    let slideHTML = '';

    presentation.slides.forEach((slide, idx) => {
      slideHTML += renderSlide(slide, idx);
    });

    const fullHTML = `
      <div class="modal-header">
        <div>
          <div class="modal-title">Präsentation - ${presentation.company}</div>
          <div class="text-sm text-muted">${presentation.slides.length} Slides</div>
        </div>
        <button class="modal-close">&times;</button>
      </div>

      <div class="presentation-container" style="max-height:400px;overflow-y:auto;margin-bottom:16px">
        ${slideHTML}
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" id="pExportHTML">📥 HTML exportieren</button>
        <button class="btn btn-secondary" id="pPrint">🖨 Drucken</button>
        <button class="btn btn-secondary modal-close-btn">Schließen</button>
      </div>
    `;

    App.modal.show(fullHTML);

    const overlay = document.getElementById('modal-overlay');
    overlay.querySelector('.modal-close-btn').addEventListener('click', () => App.modal.hide());

    // Export HTML
    overlay.querySelector('#pExportHTML').addEventListener('click', () => {
      const htmlContent = generateStandaloneHTML(presentation);
      downloadHTML(htmlContent, `${presentation.company}-Presentation.html`);
      App.toast('Präsentation exportiert!', 'success');
    });

    // Print
    overlay.querySelector('#pPrint').addEventListener('click', () => {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(generateStandaloneHTML(presentation));
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    });
  }

  function renderSlide(slide, idx) {
    let content = '';

    switch (slide.type) {
      case 'cover':
        content = `
          <div class="slide-cover">
            <h1>${App.utils.escape(slide.content.company)}</h1>
            <h2>${App.utils.escape(slide.content.dealName)}</h2>
            <p class="slide-date">${slide.content.date}</p>
          </div>
        `;
        break;

      case 'metrics':
        content = `
          <div class="slide-content">
            <h2>${slide.title}</h2>
            <div class="slide-metrics">
              <div class="metric-card">
                <div class="metric-label">Deal Value</div>
                <div class="metric-value">${App.utils.formatCurrency(slide.content.value)}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Current Stage</div>
                <div class="metric-value">${slide.content.stage}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Timeline</div>
                <div class="metric-value">${App.utils.formatDate(slide.content.timeline)}</div>
              </div>
            </div>
            ${slide.content.decisionMakers && slide.content.decisionMakers.length > 0 ? `
              <div class="slide-section">
                <h3>Decision Makers</h3>
                <ul>
                  ${slide.content.decisionMakers.map(dm => `<li>${App.utils.escape(dm)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `;
        break;

      case 'progress':
        content = `
          <div class="slide-content">
            <h2>${slide.title}</h2>
            <div class="slide-progress">
              <div class="progress-stage">${slide.content.stage}</div>
              ${slide.content.notes ? `
                <div class="progress-notes">
                  <h3>Notes</h3>
                  <p>${App.utils.escape(slide.content.notes)}</p>
                </div>
              ` : ''}
            </div>
          </div>
        `;
        break;

      case 'action':
        content = `
          <div class="slide-content">
            <h2>${slide.title}</h2>
            <div class="slide-actions">
              <ul>
                ${slide.content.actions.map(action => `<li>✓ ${App.utils.escape(action)}</li>`).join('')}
              </ul>
            </div>
          </div>
        `;
        break;

      default:
        content = `<div class="slide-content"><h2>${slide.title}</h2></div>`;
    }

    return `
      <div class="slide" data-slide="${idx}">
        ${content}
      </div>
    `;
  }

  function generateStandaloneHTML(presentation) {
    const slideHTML = presentation.slides.map((slide, idx) => {
      let content = '';

      switch (slide.type) {
        case 'cover':
          content = `
            <div style="text-align: center; padding: 60px 40px; background: linear-gradient(135deg, #059669, #047857); color: white; page-break-after: always;">
              <h1 style="font-size: 3.5rem; margin: 0 0 20px 0;">${slide.content.company}</h1>
              <h2 style="font-size: 2rem; margin: 0 0 40px 0; opacity: 0.9;">${slide.content.dealName}</h2>
              <p style="font-size: 1.2rem; opacity: 0.8;">${slide.content.date}</p>
            </div>
          `;
          break;

        case 'metrics':
          content = `
            <div style="padding: 40px; page-break-after: always;">
              <h2 style="color: #059669; border-bottom: 3px solid #059669; padding-bottom: 10px; margin-bottom: 30px;">${slide.title}</h2>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
                <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-align: center;">
                  <div style="color: #999; font-size: 0.9rem; margin-bottom: 8px;">Deal Value</div>
                  <div style="font-size: 1.8rem; font-weight: bold; color: #059669;">${App.utils.formatCurrency(slide.content.value)}</div>
                </div>
                <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-align: center;">
                  <div style="color: #999; font-size: 0.9rem; margin-bottom: 8px;">Current Stage</div>
                  <div style="font-size: 1.8rem; font-weight: bold; color: #059669;">${slide.content.stage}</div>
                </div>
                <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-align: center;">
                  <div style="color: #999; font-size: 0.9rem; margin-bottom: 8px;">Timeline</div>
                  <div style="font-size: 1.5rem; font-weight: bold; color: #059669;">${App.utils.formatDate(slide.content.timeline)}</div>
                </div>
              </div>
              ${slide.content.decisionMakers && slide.content.decisionMakers.length > 0 ? `
                <div style="margin-top: 30px;">
                  <h3 style="color: #111; margin-bottom: 15px;">Decision Makers</h3>
                  <ul style="margin: 0; padding-left: 20px;">
                    ${slide.content.decisionMakers.map(dm => `<li style="margin-bottom: 8px;">${dm}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `;
          break;

        case 'progress':
          content = `
            <div style="padding: 40px; page-break-after: always;">
              <h2 style="color: #059669; border-bottom: 3px solid #059669; padding-bottom: 10px; margin-bottom: 30px;">${slide.title}</h2>
              <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin-bottom: 20px;">
                <div style="font-size: 1.5rem; font-weight: bold; color: #059669;">${slide.content.stage}</div>
              </div>
              ${slide.content.notes ? `
                <div style="background: #f9fafb; padding: 20px; border-radius: 6px;">
                  <h3 style="margin-top: 0;">Notes</h3>
                  <p>${slide.content.notes}</p>
                </div>
              ` : ''}
            </div>
          `;
          break;

        case 'action':
          content = `
            <div style="padding: 40px; page-break-after: always;">
              <h2 style="color: #059669; border-bottom: 3px solid #059669; padding-bottom: 10px; margin-bottom: 30px;">${slide.title}</h2>
              <ul style="margin: 0; padding-left: 40px; font-size: 1.1rem; line-height: 2;">
                ${slide.content.actions.map(action => `<li style="margin-bottom: 12px;">✓ ${action}</li>`).join('')}
              </ul>
            </div>
          `;
          break;
      }

      return content;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${presentation.company} - Presentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #111827;
      background: white;
    }
    @media print {
      body { background: white; }
      .slide { page-break-after: always; }
    }
  </style>
</head>
<body>
  ${slideHTML}
</body>
</html>
    `;
  }

  function downloadHTML(content, filename) {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  return {
    generate,
    getPresentations: () => presentations
  };
})();

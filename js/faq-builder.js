/**
 * CareerOS — FAQ Builder
 * AI-powered FAQ generation and management for deals
 */

window.FAQBuilder = (() => {

  const FAQ_CONTEXT = `You are an expert at anticipating customer questions and objections.
Your role is to generate FAQ entries that address common concerns at different sales stages.
Create clear, concise answers that build confidence and reduce sales friction.`;

  const STAGE_FAQ_TOPICS = {
    'Prospecting': [
      'Why should we talk to you?',
      'How is your solution different from X (competitor)?',
      'Do you work with companies like ours?',
      'What is the typical engagement process?'
    ],
    'Discovery': [
      'How long does implementation typically take?',
      'What support do you provide?',
      'How do we measure success?',
      'What happens after we sign?'
    ],
    'Proposal': [
      'Can you customize the solution for us?',
      'What is included in the price?',
      'Are there additional costs?',
      'What if we need changes?',
      'How does your support work?'
    ],
    'Negotiation': [
      'Can you reduce your price?',
      'What if implementation doesn\'t go as planned?',
      'Can we start with a pilot?',
      'What are your payment terms?',
      'What is your refund policy?'
    ],
    'Closed': [
      'When do we start?',
      'Who will I work with?',
      'How is our data protected?',
      'What happens if we want to cancel?'
    ]
  };

  let faqs = App.data.get('sales_faqs', []);

  function saveFAQs() {
    App.data.set('sales_faqs', faqs);
  }

  function generateForDeal(deal) {
    // Show loading modal
    App.modal.show(`
      <div class="modal-header">
        <div class="modal-title">FAQ generieren</div>
        <button class="modal-close">&times;</button>
      </div>
      <div style="padding:20px;text-align:center">
        <div style="font-size:3rem;margin-bottom:16px">⏳</div>
        <p>Claude generiert FAQs für Ihr Deal...</p>
        <p style="color:#999;margin-top:8px">Dies kann 10-30 Sekunden dauern.</p>
      </div>
    `);

    try {
      const faqTopics = STAGE_FAQ_TOPICS[deal.stage] || STAGE_FAQ_TOPICS['Discovery'];
      const mockResponse = generateMockFAQs(deal, faqTopics);
      displayFAQResults(deal, mockResponse);
    } catch (error) {
      App.modal.hide();
      App.toast(`Fehler beim Generieren: ${error.message}`, 'error');
    }
  }

  function generateMockFAQs(deal, topics) {
    const mockAnswers = {
      'Why should we talk to you?': `We specialize in helping companies like ${deal.company} achieve [specific goal]. Our approach is based on [methodology], which has delivered [quantified result] for similar clients.`,

      'How is your solution different from X (competitor)?': `Our solution focuses on [unique aspect]. Unlike competitors, we [differentiation 1], [differentiation 2], and [differentiation 3]. Most importantly, we provide [unique value].`,

      'Do you work with companies like ours?': `Yes, we've worked with [number] companies in your industry. Recent clients include [examples]. They've achieved [result].`,

      'What is the typical engagement process?': `1. Discovery call to understand your needs (1 week)\n2. Proposal & planning (1-2 weeks)\n3. Implementation (4-8 weeks depending on scope)\n4. Go-live & support (ongoing)`,

      'How long does implementation typically take?': `Implementation typically takes ${Math.ceil(Math.random() * 12)} weeks, depending on scope. For a ${deal.dealName === 'Enterprise' ? 'full enterprise deployment' : 'standard setup'}, you can expect [timeline].`,

      'What support do you provide?': `We provide:\n- Dedicated implementation manager\n- Technical support during and after implementation\n- Training for your team\n- Quarterly business reviews\n- Priority support line`,

      'How do we measure success?': `We establish KPIs during discovery. Common metrics include:\n- [Metric 1]: Expected [target]\n- [Metric 2]: Expected [target]\n- [Metric 3]: Expected [target]\nWe track these monthly.`,

      'What happens after we sign?': `Within 2 weeks, we schedule:\n1. Kickoff meeting with your team\n2. Technical setup & data migration planning\n3. Training schedule confirmation\nYour implementation manager becomes your primary contact.`,

      'Can you customize the solution for us?': `Yes, we offer [number of options] customization levels. Most clients use our standard configuration, which covers 95% of use cases. Custom work is available and priced separately.`,

      'What is included in the price?': `The €${deal.value} investment includes:\n- Software license\n- Implementation services\n- Training\n- 12 months support\n- [Other included items]`,

      'Are there additional costs?': `Typically no, unless you want:\n- Custom development (estimate provided separately)\n- Premium support tier\n- Additional user licenses\nWe\'ll discuss these during implementation planning.`,

      'What if we need changes?': `Changes requested during implementation are accommodated within scope. Changes outside scope can be:\n- Added to future phases\n- Handled as change orders\nWe manage scope carefully upfront to avoid surprises.`,

      'Can you reduce your price?': `Our €${deal.value} reflects our service quality and implementation support. We can discuss:\n- Phased implementation to spread costs\n- Multi-year commitment discounts\n- Expanded scope for better ROI\nLet's discuss your budget constraints.`,

      'What if implementation doesn\'t go as planned?': `We have a proven implementation methodology. If we fall behind:\n1. We identify the issue immediately\n2. We allocate additional resources\n3. We adjust timeline with your input\n4. We support you until you succeed\nYour success is our success.`,

      'Can we start with a pilot?': `We typically recommend full implementation because [reason]. However, we can discuss a pilot covering [scope]. This would require [X weeks] and [X cost].`,

      'What are your payment terms?': `Standard terms are [terms]. We can also discuss:\n- Quarterly installments\n- Milestone-based payments\n- Annual payments with discount\nLet's find a structure that works.`,

      'What is your refund policy?': `We\'re confident in our solution. If you\'re not satisfied after [period], we offer [refund terms]. In practice, this rarely happens because [reason].`,

      'When do we start?': `Subject to signature, we can begin within [timeframe]. Your kickoff meeting is scheduled within [days].`,

      'Who will I work with?': `Your primary contact is [Title]. For technical questions, you\'ll work with [technical contact]. For business questions, reach out to me.`,

      'How is our data protected?': `We follow [compliance standards]. Data is:\n- Encrypted in transit and at rest\n- Backed up daily\n- Located in [region]\n- Protected by [security measures]\nWe have [certification].`,

      'What happens if we want to cancel?': `Our contracts include [cancellation terms]. After [period], either party can cancel with [notice period].`
    };

    const faqList = topics.map(question => ({
      question,
      answer: mockAnswers[question] || `This is an important question. ${mockAnswers['Why should we talk to you?']}`
    }));

    return { stage: deal.stage, faqs: faqList };
  }

  function displayFAQResults(deal, response) {
    let displayHTML = `
      <div class="modal-header">
        <div>
          <div class="modal-title">FAQs - ${deal.company}</div>
          <div class="text-sm text-muted">${response.stage}-Stage</div>
        </div>
        <button class="modal-close">&times;</button>
      </div>

      <div class="faqs-list">
    `;

    response.faqs.forEach((item, idx) => {
      displayHTML += `
        <div class="faq-item">
          <div class="faq-question" data-faq="${idx}">
            <span style="font-weight:600">Q: ${App.utils.escape(item.question)}</span>
            <span style="float:right">▼</span>
          </div>
          <div class="faq-answer" id="faq-${idx}" style="display:none;padding:12px;background:#f3f4f6;border-radius:4px;margin-top:8px">
            <strong>A:</strong> <p style="margin:8px 0">${App.utils.escape(item.answer).replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      `;
    });

    displayHTML += `
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" id="dSaveAsTemplate">💾 Als Template speichern</button>
        <button class="btn btn-secondary modal-close-btn">Schließen</button>
      </div>
    `;

    App.modal.show(displayHTML);

    const overlay = document.getElementById('modal-overlay');
    overlay.querySelector('.modal-close-btn').addEventListener('click', () => App.modal.hide());

    // Toggle FAQs
    overlay.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const idx = q.dataset.faq;
        const answer = overlay.querySelector(`#faq-${idx}`);
        if (answer.style.display === 'none') {
          answer.style.display = 'block';
          q.querySelector('span:last-child').textContent = '▲';
        } else {
          answer.style.display = 'none';
          q.querySelector('span:last-child').textContent = '▼';
        }
      });
    });

    // Save as template
    overlay.querySelector('#dSaveAsTemplate').addEventListener('click', () => {
      const template = {
        id: App.utils.uuid(),
        dealId: deal.id,
        company: deal.company,
        stage: deal.stage,
        faqs: response.faqs,
        createdAt: new Date().toISOString()
      };
      faqs.push(template);
      saveFAQs();
      App.toast('FAQ Template gespeichert!', 'success');
    });
  }

  function showFAQLibrary() {
    let html = `
      <div class="modal-header">
        <div class="modal-title">FAQ Bibliothek</div>
        <button class="modal-close">&times;</button>
      </div>

      ${faqs.length === 0 ? `
        <div class="empty-state" style="padding:30px 0">
          <div class="empty-state-icon">❓</div>
          <div class="text-muted">Noch keine FAQs erstellt</div>
        </div>
      ` : `
        <div style="max-height:400px;overflow-y:auto">
          ${faqs.map((faq, idx) => `
            <div class="card mb-16">
              <div style="display:flex;justify-content:space-between;align-items:start">
                <div>
                  <div class="text-sm text-muted">${faq.company} · ${faq.stage}</div>
                  <h4 style="margin:4px 0">${faq.faqs.length} FAQs</h4>
                </div>
                <button class="btn btn-sm btn-danger" data-delete-faq="${idx}">🗑 Löschen</button>
              </div>
            </div>
          `).join('')}
        </div>
      `}

      <div class="modal-footer">
        <button class="btn btn-secondary modal-close-btn">Schließen</button>
      </div>
    `;

    App.modal.show(html);

    const overlay = document.getElementById('modal-overlay');
    overlay.querySelector('.modal-close-btn').addEventListener('click', () => App.modal.hide());

    overlay.querySelectorAll('[data-delete-faq]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.deleteFaq);
        if (confirm('FAQ wirklich löschen?')) {
          faqs.splice(idx, 1);
          saveFAQs();
          App.toast('FAQ gelöscht', 'info');
          showFAQLibrary();
        }
      });
    });
  }

  return {
    generateForDeal,
    showLibrary: showFAQLibrary,
    getFAQs: () => faqs
  };
})();

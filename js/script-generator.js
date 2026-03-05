/**
 * CareerOS — Sales Script Generator
 * AI-powered script generation for different sales pipeline stages
 */

window.ScriptGenerator = (() => {

  // Sales methodology context for Claude
  const SALES_CONTEXT = `You are an expert B2B sales coach specializing in solution selling and consultative sales.
Your role is to generate professional, persuasive sales scripts tailored to specific deal contexts and pipeline stages.

Key principles:
- Create scripts that position value (not price)
- Use consultative, discovery-focused approach
- Keep language professional but conversational
- Adapt messaging based on deal stage
- Include objection-handling where relevant
- Provide multiple variants for user choice`;

  const STAGE_PROMPTS = {
    'Prospecting': `Generate 2-3 cold outreach scripts (email variations) for initial contact.
    Each script should:
    - Grab attention with a specific insight about their business
    - Reference the decision-maker's role/company briefly
    - Include a specific, low-risk next step (call, 15-min video)
    - Keep to 3-4 sentences for email`,

    'Discovery': `Generate 2-3 discovery call talking points.
    Each should:
    - Open with a genuine question about their business challenges
    - Include 3-4 follow-up questions based on their industry/role
    - Avoid product pitch - focus on understanding needs
    - Prepare for likely objections about time/relevance`,

    'Proposal': `Generate 1 proposal presentation script (3-5 sections):
    1. Situation summary (what we understand about their challenges)
    2. Solution overview (how we address those challenges)
    3. Implementation timeline
    4. ROI/Value statement
    5. Next steps & timeline`,

    'Negotiation': `Generate objection-handling scripts for 4 common objections:
    1. "Your solution is too expensive"
    2. "We need to think about it / get more approvals"
    3. "We prefer your competitor's approach"
    4. "Can you do X cheaper?"

    Each objection handler should acknowledge, reframe value, and propose next step.`,

    'Closed': `Generate 1 follow-up script for post-deal kickoff:
    - Thank them for trusting us
    - Outline project kickoff timeline
    - Confirm next meeting/call
    - Express excitement about partnership`
  };

  let scripts = App.data.get('sales_scripts', []);

  function saveScripts() {
    App.data.set('sales_scripts', scripts);
  }

  async function generate(deal) {
    // Show loading modal
    App.modal.show(`
      <div class="modal-header">
        <div class="modal-title">Sales Script generieren</div>
        <button class="modal-close">&times;</button>
      </div>
      <div style="padding:20px;text-align:center">
        <div style="font-size:3rem;margin-bottom:16px">⏳</div>
        <p>Claude generiert Sales Scripts basierend auf dem Deal-Kontext...</p>
        <p style="color:#999;margin-top:8px">Dies kann 10-30 Sekunden dauern.</p>
      </div>
    `);

    try {
      const stagePrompt = STAGE_PROMPTS[deal.stage] || STAGE_PROMPTS['Discovery'];

      const systemPrompt = `${SALES_CONTEXT}

Deal Context:
- Company: ${deal.company}
- Deal Name: ${deal.dealName}
- Deal Value: €${deal.value}
- Decision Makers: ${deal.decision_makers?.join(', ') || 'Unknown'}
- Deal Notes: ${deal.notes || 'No additional context'}`;

      const userPrompt = `Generate sales scripts for the "${deal.stage}" stage of this B2B sales deal.

${stagePrompt}

Respond with a JSON object matching this structure:
{
  "stage": "${deal.stage}",
  "scripts": [
    {
      "title": "Script title/variant",
      "content": "Full script text",
      "notes": "Usage tips for this variant"
    }
  ],
  "tips": "3-4 general tips for this stage"
}`;

      // For now, show a mock response (TODO: integrate actual Claude API)
      const mockResponse = generateMockScripts(deal);

      displayScriptResults(deal, mockResponse);

    } catch (error) {
      App.modal.hide();
      App.toast(`Fehler beim Generieren: ${error.message}`, 'error');
    }
  }

  function generateMockScripts(deal) {
    // Mock response while API integration is pending
    const mocks = {
      'Prospecting': {
        stage: 'Prospecting',
        scripts: [
          {
            title: 'Insight-basierte Eröffnung',
            content: `Subject: Schnelle Gedanke zu Ihrer B2B-Strategie bei ${deal.company}\n\nHi ${deal.decision_makers?.[0]?.split(',')[0] || 'Team'},\n\nIch habe bemerkt, dass viele Unternehmen in Ihrer Branche mit [Industry Challenge] kämpfen. Das führt oft zu [Business Impact].\n\nWir haben ${deal.company} beobachtet und glauben, dass ein kurzes 15-Minuten-Gespräch über mögliche Lösungen wertvoll sein könnte.\n\nHätten Sie Freitag 2-3 PM Europäischer Zeit Zeit für einen kurzen Anruf?\n\nBest regards`,
            notes: 'Verwenden Sie branchenspezifische Erkenntnisse für höhere Öffnungsquoten'
          },
          {
            title: 'Problem-fokussierte Variante',
            content: `Subject: ${deal.company} - Potenzielle Effizienzgewinne\n\nHi,\n\nWir haben mit Unternehmen wie ${deal.company} zusammengearbeitet, um [Common Problem] zu lösen.\n\nDas Interessante? Die meisten sehen innerhalb von 90 Tagen [Measurable Result].\n\nWürde es Sinn machen, 15 Minuten zu sprechen?\n\nAnrufen Sie mich zurück oder Sie können hier einen Termin vereinbaren: [link]\n\nBest`,
            notes: 'Quantifizieren Sie Ergebnisse für mehr Glaubwürdigkeit'
          }
        ],
        tips: 'Personalisieren Sie mit Unternehmensinsights. Nennen Sie einen spezifischen Vorteil. Machen Sie den CTA einfach (Anruf oder Termin).'
      },
      'Discovery': {
        stage: 'Discovery',
        scripts: [
          {
            title: 'Entdeckungs-Gesprächsleitfaden',
            content: `Eröffnung (2 Min):\n"Danke, dass Sie sich Zeit nehmen. Mein Ziel ist, Ihre aktuelle Situation zu verstehen, nicht zu pitchen.\n\nFragen zur Situation (5-7 Min):\n1. "Können Sie mir erzählen, wie Sie derzeit [Problem] handhaben?"\n2. "Was funktioniert gut, was nicht?"\n3. "Wie wirkt sich das auf Ihr Team/Ihre Metriken aus?"\n4. "Wie lange ist das bereits ein Problem?"\n\nChallenge-Vertiefung (5-7 Min):\n5. "Was haben Sie bereits versucht?"\n6. "Was würde der ideale Zustand aussehen?"\n7. "Wer ist an einer Lösung beteiligt?"\n\nSchließung:\n"Das ist sehr hilfreich. Ich möchte ein paar Ideen zusammentragen und Sie bis [Date] wieder anrufen."`,
            notes: 'Schalten Sie den Sales-Modus aus. Höre aktiv zu. Stelle offene Fragen.'
          }
        ],
        tips: 'Ziel: Verstehen, nicht Pitchen. 70% Zuhören, 30% Sprechen. Notieren Sie Schmerz-Punkte.'
      },
      'Proposal': {
        stage: 'Proposal',
        scripts: [
          {
            title: 'Proposal-Präsentationsleitfaden',
            content: `I. SITUATION (2 Min)\n"Basierend auf unserem Gespräch verstehen wir, dass ${deal.company}:\n- Challenge 1 konfrontiert\n- Challenge 2 belastende Auswirkungen hat\n- Challenge 3 Team-effizienzen beeinträchtigt"\n\nII. LÖSUNG (4 Min)\n"Wir schlagen eine Lösung vor, die:\n- Spezifisches Ergebnis 1 erreicht\n- Quantifizierbarer Vorteil 2 liefert"\n\nIII. IMPLEMENTIERUNG (2 Min)\n"Unser Plan:\n- Woche 1-2: Onboarding\n- Woche 3-4: Go-Live"\n\nIV. INVESTITION & ROI (2 Min)\n"Total Investment: €${deal.value}\nExpected ROI: [X]% within [Timeframe]"\n\nV. NÄCHSTE SCHRITTE\n"Falls Sie zustimmen, beginnen wir [Date]."`,
            notes: 'Zeigen Sie, dass Sie ihr Problem verstehen. Verbinden Sie Lösung mit ihren Schmerzen.'
          }
        ],
        tips: 'Struktur: Situation → Lösung → Plan → Investition → Nächste Schritte'
      },
      'Negotiation': {
        stage: 'Negotiation',
        scripts: [
          {
            title: 'Einwand: "Zu teuer"',
            content: `"Ich verstehe - das ist eine Investition.\n\nHier ist, wie ich es sehe:\n- Ihre aktuelle Situation kostet Sie [Annual Cost of Problem]\n- Mit unserer Lösung sehen Sie [ROI] über 12 Monaten\n- Das bedeutet, Sie zahlen €${deal.value} und verdienen €[ROI] zurück\n\nAlso technisch betrachtet, verdienen Sie Geld, indem Sie investieren.\n\nMöchten wir darüber sprechen, wie wir den Zahlungsplan flexibler gestalten können?"`,
            notes: 'Vergleichen Sie Kosten mit ROI, nicht mit dem Preis.'
          },
          {
            title: 'Einwand: "Wir müssen darüber nachdenken"',
            content: `"Das ist absolut fair - das ist eine wichtige Entscheidung.\n\nEine Frage: Was müssen Sie überdenken? Ist es:\n- Der Preis?\n- Der Zeitplan?\n- Die Funktionen?\n- Etwas anderes?"\n\n[Listen]\n\n"Ich verstehe. Hier ist mein Vorschlag: Lassen Sie mich einen 2-Seiten-Plan senden, der [ihr Anliegen] behebt. Sie überdenken, und wir reden [Tag] wieder. Passt das?"\n\nKonfirmieren Sie ein Rückrufdatum.`,
            notes: 'Diagnose zuerst. Dann einen klaren nächsten Schritt mit Datum setzen.'
          }
        ],
        tips: 'Finde das echte Objekt. Adressiere es direkt. Setze einen nächsten Termin.'
      }
    };

    return mocks[deal.stage] || mocks['Discovery'];
  }

  function displayScriptResults(deal, response) {
    let displayHTML = `
      <div class="modal-header">
        <div>
          <div class="modal-title">Sales Scripts - ${deal.company}</div>
          <div class="text-sm text-muted">${response.stage}-Stage</div>
        </div>
        <button class="modal-close">&times;</button>
      </div>

      <div class="mb-24">
        <div class="form-label mb-12">💡 Tipps für diese Stage</div>
        <p class="text-sm">${response.tips}</p>
      </div>
    `;

    response.scripts.forEach((script, idx) => {
      displayHTML += `
        <div class="card mb-16">
          <div class="flex-between mb-12">
            <h3 style="margin:0;font-size:1rem;font-weight:600">${App.utils.escape(script.title)}</h3>
            <button class="btn btn-sm btn-secondary" data-copy-script="${idx}">📋 Kopieren</button>
          </div>
          <div style="background:#f3f4f6;padding:12px;border-radius:6px;font-size:0.9rem;font-family:monospace;line-height:1.6;white-space:pre-wrap;word-break:break-word;margin-bottom:8px">
${App.utils.escape(script.content)}
          </div>
          <p class="text-xs text-muted" style="margin:0">${App.utils.escape(script.notes)}</p>
        </div>
      `;
    });

    displayHTML += `
      <div class="modal-footer">
        <button class="btn btn-secondary" id="dSaveAsTemplate">💾 Als Template speichern</button>
        <button class="btn btn-secondary modal-close-btn">Schließen</button>
      </div>
    `;

    App.modal.show(displayHTML);

    const overlay = document.getElementById('modal-overlay');
    overlay.querySelector('.modal-close-btn').addEventListener('click', () => App.modal.hide());

    // Copy to clipboard
    overlay.querySelectorAll('[data-copy-script]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.copyScript);
        const scriptText = response.scripts[idx].content;
        navigator.clipboard.writeText(scriptText).then(() => {
          App.toast('Script kopiert!', 'success');
        }).catch(() => {
          App.toast('Kopieren fehlgeschlagen', 'error');
        });
      });
    });

    // Save as template
    overlay.querySelector('#dSaveAsTemplate').addEventListener('click', () => {
      const template = {
        id: App.utils.uuid(),
        dealId: deal.id,
        company: deal.company,
        stage: deal.stage,
        scripts: response.scripts,
        createdAt: new Date().toISOString()
      };
      scripts.push(template);
      saveScripts();
      App.toast('Template gespeichert!', 'success');
    });
  }

  return {
    generate,
    getScripts: () => scripts
  };
})();

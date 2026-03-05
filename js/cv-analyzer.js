/**
 * CareerOS — CV Analyzer
 *
 * Implements the ATS methodology extracted from the email conversations:
 * - Keyword & Technical Alignment (40%)
 * - Semantic & Structural Relevance (30%)
 * - Quantified Results & Revenue Signals (30%)
 * - Competency Matrix (Inside Sales, Account Manager, General)
 * - 4-Step Repositioning Framework
 */

// ============================================================
// KNOWLEDGE BASE (from email methodology)
// ============================================================

const ATS_KNOWLEDGE = {

  roleProfiles: {
    'inside-sales': {
      label: 'Inside Sales Representative',
      coreKeywords: [
        'pipeline', 'quota', 'outbound', 'CRM', 'lead', 'prospect', 'conversion',
        'revenue', 'KPI', 'forecast', 'cadence', 'cold call', 'B2B', 'account',
        'upsell', 'cross-sell', 'deal', 'close', 'SDR', 'BDR', 'SaaS', 'demo',
        'discovery', 'objection', 'follow-up', 'sequence', 'Salesforce', 'HubSpot',
        'Pipedrive', 'pipeline management', 'lead generation', 'qualification',
        'sales cycle', 'win rate', 'deal velocity', 'MQL', 'SQL', 'opportunity',
        'revenue target', 'attainment', 'commission', 'OTE', 'inbound', 'outreach'
      ],
      competencies: {
        'Prospecting & Lead Qualification': {
          keywords: ['prospect', 'lead', 'qualify', 'qualification', 'outbound', 'cold call',
            'SDR', 'BDR', 'lead generation', 'top of funnel', 'discovery', 'MQL', 'SQL',
            'sourcing', 'targeting', 'ICP', 'ideal customer profile'],
          weight: 1.5
        },
        'Outbound Cadence Strategy': {
          keywords: ['cadence', 'sequence', 'outreach', 'follow-up', 'touchpoint', 'multi-touch',
            'email campaign', 'LinkedIn', 'cold email', 'cold calling', 'outbound',
            'automated sequence', 'Salesloft', 'Outreach.io', 'reply rate'],
          weight: 1.2
        },
        'CRM Discipline & Reporting': {
          keywords: ['CRM', 'Salesforce', 'HubSpot', 'Pipedrive', 'reporting', 'forecast',
            'activity tracking', 'pipeline hygiene', 'data entry', 'logging', 'dashboard',
            'weekly report', 'KPI tracking', 'analytics'],
          weight: 1.0
        },
        'Pipeline Management': {
          keywords: ['pipeline', 'funnel', 'opportunity', 'stage', 'close', 'velocity', 'deal',
            'forecast', 'pipeline review', 'deal review', 'qualification', 'sales cycle',
            'pipeline coverage', 'win rate', 'conversion rate'],
          weight: 1.3
        },
        'Revenue Accountability': {
          keywords: ['quota', 'target', 'revenue', 'attainment', 'OTE', 'commission', 'KPI',
            'achievement', 'goal', 'performance', 'metric', '% of quota', 'overachievement',
            'revenue target', 'ARR', 'MRR', 'ACV', 'deal size'],
          weight: 1.5
        },
        'Cross-functional Collaboration': {
          keywords: ['collaborate', 'cross-functional', 'marketing', 'product', 'customer success',
            'team', 'align', 'coordination', 'stakeholder', 'handover', 'feedback loop',
            'solution team', 'presales'],
          weight: 0.8
        }
      }
    },

    'account-manager': {
      label: 'Account Manager / Key Account Manager',
      coreKeywords: [
        'account', 'client', 'relationship', 'retention', 'upsell', 'expansion', 'renewal',
        'NPS', 'satisfaction', 'strategic', 'key account', 'revenue', 'portfolio',
        'churn', 'lifetime value', 'LTV', 'QBR', 'business review', 'stakeholder',
        'negotiation', 'contract', 'P&L', 'budget', 'executive', 'growth',
        'customer success', 'onboarding', 'implementation', 'escalation', 'CSAT'
      ],
      competencies: {
        'Relationship Management': {
          keywords: ['relationship', 'account', 'client', 'partner', 'stakeholder', 'executive',
            'C-level', 'trust', 'long-term', 'strategic partner', 'QBR', 'business review'],
          weight: 1.5
        },
        'Revenue Expansion & Upsell': {
          keywords: ['upsell', 'cross-sell', 'expansion', 'growth', 'revenue', 'ARR', 'MRR',
            'additional revenue', 'land and expand', 'add-on', 'upgrade', 'renewal'],
          weight: 1.5
        },
        'Retention & Churn Prevention': {
          keywords: ['retention', 'churn', 'renewal', 'NPS', 'CSAT', 'satisfaction', 'at-risk',
            'health score', 'customer success', 'escalation', 'save', 'win-back'],
          weight: 1.3
        },
        'Negotiation & Commercial Acumen': {
          keywords: ['negotiation', 'contract', 'pricing', 'commercial', 'P&L', 'margin', 'discount',
            'budget', 'investment', 'ROI', 'business case', 'value proposition'],
          weight: 1.2
        },
        'Portfolio & Account Planning': {
          keywords: ['portfolio', 'account plan', 'territory', 'segmentation', 'prioritization',
            'whitespace', 'opportunity mapping', 'strategic account'],
          weight: 1.0
        },
        'Customer Onboarding & Success': {
          keywords: ['onboarding', 'implementation', 'training', 'adoption', 'time to value',
            'customer success', 'support', 'escalation', 'SLA'],
          weight: 0.9
        }
      }
    },

    'general': {
      label: 'General Sales / Commercial',
      coreKeywords: [
        'sales', 'target', 'client', 'revenue', 'team', 'performance', 'result', 'growth',
        'strategy', 'project', 'management', 'communication', 'negotiation', 'presentation',
        'B2B', 'B2C', 'customer', 'market', 'product', 'solution', 'commercial'
      ],
      competencies: {
        'Sales & Business Development': {
          keywords: ['sales', 'business development', 'BD', 'acquisition', 'revenue', 'target',
            'new business', 'hunter', 'growth', 'market'],
          weight: 1.5
        },
        'Customer Relationship': {
          keywords: ['customer', 'client', 'relationship', 'account', 'satisfaction', 'loyalty',
            'retention', 'service', 'support'],
          weight: 1.2
        },
        'Commercial Acumen': {
          keywords: ['commercial', 'negotiation', 'pricing', 'margin', 'P&L', 'budget', 'ROI',
            'business case', 'value', 'cost', 'investment'],
          weight: 1.2
        },
        'Performance & Results': {
          keywords: ['target', 'quota', 'KPI', 'metric', 'performance', 'achievement', 'result',
            'overachieve', 'goal', 'objective', 'OKR'],
          weight: 1.3
        },
        'Team & Leadership': {
          keywords: ['team', 'leadership', 'manage', 'lead', 'mentor', 'coordinate', 'delegate',
            'responsibility', 'cross-functional'],
          weight: 0.9
        },
        'Strategy & Planning': {
          keywords: ['strategy', 'plan', 'forecast', 'roadmap', 'market analysis', 'segmentation',
            'positioning', 'go-to-market', 'GTM'],
          weight: 1.0
        }
      }
    }
  },

  // Revenue signals — the "30% quantified results" dimension
  revenueSignals: [
    'quota', 'attainment', 'revenue', 'pipeline', 'forecast', 'conversion rate',
    'win rate', 'deal velocity', 'ARR', 'MRR', 'ACV', 'LTV', 'churn rate', 'NPS',
    'CSAT', 'ROI', 'margin', 'growth', '%', '€', '$', 'million', 'mio', 'tsd', 'k €',
    'top performer', 'overachieved', 'exceeded', 'ranked', 'award', 'target', 'objective',
    'increase', 'grew', 'generated', 'saved', 'reduced', 'improved'
  ],

  // Structural quality signals
  structureSignals: {
    sectionHeaders: ['experience', 'erfahrung', 'education', 'ausbildung', 'skills', 'fähigkeiten',
      'summary', 'profil', 'contact', 'kontakt', 'languages', 'sprachen', 'certifications',
      'achievements', 'erfolge', 'career', 'beruf'],
    bulletIndicators: /^[\s]*[•\-\*\→▶◆▪]\s/m,
    contactPatterns: /[\w.]+@[\w.]+\.\w+|[\+\d][\d\s\-\(\)]{6,}/
  },

  // 4-Step repositioning framework (from email chain)
  repositioningSteps: {
    'inside-sales': [
      {
        title: 'Clarify Target Role Definition',
        desc: 'Adjust your headline and professional summary to clearly signal "Inside Sales Specialist" or "B2B Sales Representative". Eliminate ambiguity about your direction. The recruiter should know within 5 seconds what role you target.'
      },
      {
        title: 'Extract Revenue Evidence',
        desc: 'Quantify every achievement: quota attainment %, pipeline generated (€), conversion rates, deal counts, revenue contribution. Numbers are scannable — add them to every relevant bullet point.'
      },
      {
        title: 'Re-Architect Narrative Flow',
        desc: 'Restructure bullet points to follow: Action → Metric → Impact. Lead with pipeline ownership, outbound cadence, and CRM discipline. Reframe field sales or retail experience as "prospecting", "client acquisition", and "revenue accountability".'
      },
      {
        title: 'Signal Role Intentionality',
        desc: 'Ensure your career progression reads as deliberate specialization — not accidental transition. Connect each role to Inside Sales skills: prospecting, discovery, cadence, pipeline management, quota attainment.'
      }
    ],
    'account-manager': [
      {
        title: 'Position as Strategic Account Leader',
        desc: 'Your headline must reflect progression toward Key Account Management. Use titles like "Account Manager | B2B Client Success | Revenue Expansion".'
      },
      {
        title: 'Quantify Retention & Growth',
        desc: 'Document renewal rates, churn prevention, upsell revenue generated, NPS scores, and portfolio size (number of accounts, total ARR managed).'
      },
      {
        title: 'Highlight Relationship Depth',
        desc: 'Show C-level relationships, QBRs delivered, escalations resolved. Recruiters scan for evidence of strategic influence — not just tactical support.'
      },
      {
        title: 'Frame Commercial Ownership',
        desc: 'Demonstrate negotiation ownership: contract renewals you led, commercial terms you influenced, budget discussions you navigated.'
      }
    ],
    'general': [
      {
        title: 'Define Your Commercial Identity',
        desc: 'Clarify which commercial function you target: hunting (new business), farming (account growth), or management. A focused headline converts better than a generic one.'
      },
      {
        title: 'Lead with Results',
        desc: 'Move your top 3 quantified achievements to the top of each role description. Recruiters scan the first third of a document for commercial impact signals.'
      },
      {
        title: 'Use Market-Standard Terminology',
        desc: 'Replace generic descriptions with industry terms: "prospecting" instead of "finding clients", "pipeline management" instead of "tracking leads", "quota attainment" instead of "hitting targets".'
      },
      {
        title: 'Tighten Structure for ATS',
        desc: 'Use clean section headers (Experience, Skills, Education). Avoid tables, graphics, and unusual fonts — ATS parsers struggle with complex layouts. Use bullet points consistently.'
      }
    ]
  }
};


// ============================================================
// SCORING ENGINE
// ============================================================

const ATSEngine = {

  /**
   * Extract meaningful keywords from text (remove stopwords, short words)
   */
  extractKeywords(text) {
    const stopwords = new Set([
      'the', 'and', 'for', 'with', 'from', 'that', 'this', 'are', 'was', 'were',
      'has', 'have', 'had', 'will', 'would', 'could', 'should', 'been', 'being',
      'their', 'they', 'you', 'your', 'our', 'not', 'but', 'more', 'than', 'into',
      'also', 'can', 'all', 'any', 'its', 'one', 'may', 'both', 'each', 'when',
      'which', 'what', 'how', 'who', 'why', 'very', 'well', 'then', 'them', 'other',
      'such', 'new', 'work', 'use', 'make', 'like', 'time', 'just', 'know', 'take',
      'see', 'get', 'come', 'over', 'think', 'also', 'back', 'after', 'good', 'need',
      // German
      'die', 'der', 'das', 'und', 'ist', 'mit', 'von', 'auf', 'dem', 'den', 'ein',
      'eine', 'einer', 'eines', 'einem', 'des', 'an', 'zu', 'in', 'im', 'bei', 'als',
      'oder', 'wie', 'für', 'über', 'aus', 'nach', 'vor', 'um', 'sich', 'auch', 'nur',
      'so', 'noch', 'aber', 'alle', 'wird', 'hat', 'ist', 'sind', 'haben', 'werden'
    ]);
    const words = text.toLowerCase()
      .replace(/[^\w\s\-äöüß]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopwords.has(w));
    // Deduplicate
    return [...new Set(words)];
  },

  /**
   * Find multi-word phrases from a keyword list in text
   */
  findPhrases(text, phrases) {
    const lower = text.toLowerCase();
    return phrases.filter(p => lower.includes(p.toLowerCase()));
  },

  /**
   * DIMENSION 1: Keyword match ratio (40% weight)
   * Compares JD keywords against CV content
   */
  scoreKeywords(cvText, jdText, roleProfile) {
    const jdKeywords = this.extractKeywords(jdText);
    const cvLower = cvText.toLowerCase();
    const coreKeywords = roleProfile.coreKeywords;

    // JD-derived keyword match
    const jdMatched = jdKeywords.filter(kw => cvLower.includes(kw));
    const jdRatio = jdKeywords.length > 0 ? jdMatched.length / jdKeywords.length : 0;

    // Core role keyword match
    const coreFound = this.findPhrases(cvText, coreKeywords);
    const coreRatio = coreKeywords.length > 0 ? coreFound.length / coreKeywords.length : 0;

    // Combined: 60% JD-derived, 40% core
    const combined = (jdRatio * 0.6 + coreRatio * 0.4);
    const score = Math.min(100, Math.round(combined * 130)); // scale to 0-100

    // Which core keywords are missing?
    const missing = coreKeywords.filter(kw => !cvLower.includes(kw.toLowerCase()));
    const found = coreKeywords.filter(kw => cvLower.includes(kw.toLowerCase()));

    return { score, missing, found, jdMatched, jdKeywords };
  },

  /**
   * DIMENSION 2: Semantic & structural relevance (30% weight)
   */
  scoreStructure(cvText) {
    let points = 0;
    let max = 100;
    const lower = cvText.toLowerCase();
    const signals = ATS_KNOWLEDGE.structureSignals;

    // Section headers present
    const headersFound = signals.sectionHeaders.filter(h => lower.includes(h));
    const headerScore = Math.min(30, headersFound.length * 5);
    points += headerScore;

    // Bullet points used
    if (signals.bulletIndicators.test(cvText)) points += 20;

    // Contact info present
    if (signals.contactPatterns.test(cvText)) points += 15;

    // Reasonable length (300–2000 words)
    const wordCount = cvText.split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 2000) points += 15;
    else if (wordCount >= 150) points += 8;

    // Has a professional summary/profile section
    if (lower.match(/\b(summary|profil|professional|objective|ziel|über mich)\b/)) points += 10;

    // No obvious tables/graphics (plain text check)
    if (!cvText.match(/\|\s+\|/)) points += 10;

    return Math.min(100, points);
  },

  /**
   * DIMENSION 3: Quantified results & revenue signals (30% weight)
   */
  scoreResults(cvText) {
    let points = 0;
    const lower = cvText.toLowerCase();
    const signals = ATS_KNOWLEDGE.revenueSignals;

    // Count revenue signal matches
    const foundSignals = signals.filter(s => lower.includes(s.toLowerCase()));
    const signalScore = Math.min(50, foundSignals.length * 4);
    points += signalScore;

    // Numbers with % (strong indicator)
    const percentages = (cvText.match(/\d+\s*%/g) || []).length;
    points += Math.min(20, percentages * 5);

    // Currency amounts
    const currencies = (cvText.match(/[€$£]\s*[\d,]+|[\d,]+\s*[€$£]/g) || []).length;
    points += Math.min(15, currencies * 5);

    // Year ranges / tenure (shows stability)
    const tenures = (cvText.match(/20\d\d\s*[–\-]\s*(20\d\d|present|heute|now)/gi) || []).length;
    points += Math.min(15, tenures * 5);

    return Math.min(100, points);
  },

  /**
   * Competency matrix scoring
   */
  scoreCompetencies(cvText, roleProfile) {
    const results = {};
    const lower = cvText.toLowerCase();

    Object.entries(roleProfile.competencies).forEach(([name, data]) => {
      const matched = data.keywords.filter(kw => lower.includes(kw.toLowerCase()));
      const ratio = matched.length / data.keywords.length;
      let level, fillPct;
      if (matched.length >= 3 || ratio >= 0.3) {
        level = 'strong'; fillPct = 100;
      } else if (matched.length >= 1) {
        level = 'partial'; fillPct = 50;
      } else {
        level = 'missing'; fillPct = 0;
      }
      results[name] = { level, fillPct, matched, total: data.keywords.length };
    });

    return results;
  },

  /**
   * MAIN SCORING FUNCTION
   * Returns overall score + breakdown
   */
  analyze(cvText, jdTexts, roleKey) {
    const roleProfile = ATS_KNOWLEDGE.roleProfiles[roleKey];
    if (!roleProfile) return null;

    const jdCombined = jdTexts.filter(Boolean).join('\n');

    const kw = this.scoreKeywords(cvText, jdCombined, roleProfile);
    const struct = this.scoreStructure(cvText);
    const results = this.scoreResults(cvText);

    // Weighted total: 40% keywords, 30% structure, 30% results
    const total = Math.round(kw.score * 0.40 + struct * 0.30 + results * 0.30);

    const competencies = this.scoreCompetencies(cvText, roleProfile);
    const steps = ATS_KNOWLEDGE.repositioningSteps[roleKey];

    return {
      score: total,
      breakdown: {
        keywords:  { score: kw.score,  weight: 40 },
        structure: { score: struct,     weight: 30 },
        results:   { score: results,    weight: 30 }
      },
      keywords: {
        found:   kw.found,
        missing: kw.missing.slice(0, 20),  // top 20 missing
        jdMatched: kw.jdMatched.slice(0, 15)
      },
      competencies,
      steps,
      roleLabel: roleProfile.label
    };
  }
};


// ============================================================
// VIEW
// ============================================================

App.register('cv', (container) => {
  const saved = App.data.getObj('cv_last', {});
  let activeJdTab = 0;
  let jdTexts = saved.jdTexts || ['', '', ''];
  let currentRole = saved.role || 'inside-sales';
  let lastResult = saved.result || null;

  container.innerHTML = `
    <div class="page-header">
      <span class="page-tag">Tool 1</span>
      <h1 class="page-title">CV Analyzer</h1>
      <p class="page-sub">ATS-Score berechnen, Keyword-Gaps identifizieren, Positionierung optimieren</p>
    </div>

    <div class="cv-layout">

      <!-- LEFT: Input panel -->
      <div class="cv-input-panel">

        <!-- Role selector -->
        <div class="card mb-16">
          <div class="card-title">Zielrolle</div>
          <select class="form-select" id="roleSelect">
            <option value="inside-sales" ${currentRole === 'inside-sales' ? 'selected' : ''}>Inside Sales Representative</option>
            <option value="account-manager" ${currentRole === 'account-manager' ? 'selected' : ''}>Account Manager / Key Account Manager</option>
            <option value="general" ${currentRole === 'general' ? 'selected' : ''}>General Sales / Commercial</option>
          </select>
        </div>

        <!-- CV input -->
        <div class="card mb-16">
          <div class="card-title">Lebenslauf (Text)</div>
          <textarea class="form-textarea" id="cvText" rows="12" placeholder="Füge deinen CV-Text hier ein (plain text, kein PDF)...">${App.utils.escape(saved.cvText || '')}</textarea>
          <div class="text-sm text-muted mt-8" id="cvWordCount">
            ${saved.cvText ? (saved.cvText.split(/\s+/).length + ' Wörter') : '0 Wörter'}
          </div>
        </div>

        <!-- JD inputs -->
        <div class="card mb-16">
          <div class="card-title">Stellenausschreibungen (1–3)</div>
          <div class="jd-tabs" id="jdTabBar">
            <button class="jd-tab active" data-tab="0">JD 1</button>
            <button class="jd-tab" data-tab="1">JD 2</button>
            <button class="jd-tab" data-tab="2">JD 3</button>
          </div>
          <textarea class="form-textarea" id="jdText" rows="8"
            placeholder="Stellenausschreibung einfügen...">${App.utils.escape(jdTexts[0] || '')}</textarea>
        </div>

        <button class="btn btn-primary w-full" id="analyzeBtn" style="font-size:1rem; padding:14px">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          ATS-Score berechnen
        </button>
      </div>

      <!-- RIGHT: Results panel -->
      <div id="resultsPanel">
        ${lastResult ? renderResults(lastResult) : renderEmptyResults()}
      </div>

    </div>
  `;

  // JD tab switching
  container.querySelectorAll('.jd-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      // Save current JD text
      jdTexts[activeJdTab] = container.querySelector('#jdText').value;
      // Switch tab
      activeJdTab = parseInt(btn.dataset.tab);
      container.querySelectorAll('.jd-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      container.querySelector('#jdText').value = jdTexts[activeJdTab] || '';
    });
  });

  // Word count
  container.querySelector('#cvText').addEventListener('input', e => {
    const wc = e.target.value.trim().split(/\s+/).filter(Boolean).length;
    container.querySelector('#cvWordCount').textContent = wc + ' Wörter';
  });

  // Analyze button
  container.querySelector('#analyzeBtn').addEventListener('click', () => {
    jdTexts[activeJdTab] = container.querySelector('#jdText').value;
    const cvText = container.querySelector('#cvText').value.trim();
    currentRole = container.querySelector('#roleSelect').value;

    if (cvText.length < 100) {
      App.toast('Bitte mindestens 100 Zeichen CV-Text eingeben', 'error');
      return;
    }
    if (!jdTexts.some(t => t.trim().length > 50)) {
      App.toast('Bitte mindestens eine Stellenausschreibung eingeben', 'error');
      return;
    }

    const btn = container.querySelector('#analyzeBtn');
    btn.disabled = true;
    btn.textContent = 'Analysiere...';

    // Run analysis (slightly async for UX)
    setTimeout(() => {
      const result = ATSEngine.analyze(cvText, jdTexts, currentRole);
      lastResult = result;

      // Save to storage
      App.data.set('cv_last', { cvText, jdTexts, role: currentRole, result, score: result.score });

      container.querySelector('#resultsPanel').innerHTML = renderResults(result);
      btn.disabled = false;
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> ATS-Score berechnen`;
      App.toast(`Score berechnet: ${result.score}/100`, 'success');
    }, 600);
  });
});

// ============================================================
// RENDER HELPERS
// ============================================================

function renderEmptyResults() {
  return `
    <div class="card">
      <div class="empty-state" style="padding:50px 20px">
        <div class="empty-state-icon">📊</div>
        <div class="empty-state-title">Noch keine Analyse</div>
        <div class="empty-state-desc">CV und Stellenausschreibung einfügen, dann "ATS-Score berechnen" klicken.</div>
      </div>
    </div>`;
}

function renderResults(r) {
  const { score, breakdown, keywords, competencies, steps, roleLabel } = r;

  const scoreColor = score >= 75 ? '#22c55e' : score >= 50 ? '#C05A2A' : '#ef4444';
  const scoreLabel = score >= 75 ? 'Stark' : score >= 50 ? 'Mittel' : 'Optimierungsbedarf';

  return `
    <!-- Score -->
    <div class="card mb-16">
      <div class="card-title">Gesamtscore — ${App.utils.escape(roleLabel)}</div>
      <div class="flex-center gap-24" style="padding:12px 0">
        ${App.scoreRing(score, 'ATS Score')}
        <div style="flex:1">
          <div style="font-size:1.1rem;font-weight:700;color:${scoreColor};margin-bottom:4px">${scoreLabel}</div>
          <div class="text-sm text-muted mb-16">Gewichtete Analyse nach Employer-Standard</div>
          <div class="flex flex-between text-sm mb-8">
            <span>Keyword-Alignment (40%)</span>
            <span class="font-bold">${breakdown.keywords.score}/100</span>
          </div>
          <div style="height:6px;background:var(--border);border-radius:99px;margin-bottom:10px">
            <div style="width:${breakdown.keywords.score}%;height:100%;background:var(--copper);border-radius:99px"></div>
          </div>
          <div class="flex flex-between text-sm mb-8">
            <span>Struktur & Semantik (30%)</span>
            <span class="font-bold">${breakdown.structure.score}/100</span>
          </div>
          <div style="height:6px;background:var(--border);border-radius:99px;margin-bottom:10px">
            <div style="width:${breakdown.structure.score}%;height:100%;background:#3b82f6;border-radius:99px"></div>
          </div>
          <div class="flex flex-between text-sm mb-8">
            <span>Ergebnisse & Revenue (30%)</span>
            <span class="font-bold">${breakdown.results.score}/100</span>
          </div>
          <div style="height:6px;background:var(--border);border-radius:99px">
            <div style="width:${breakdown.results.score}%;height:100%;background:#22c55e;border-radius:99px"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Competency Matrix -->
    <div class="card mb-16">
      <div class="card-title">Kompetenz-Matrix</div>
      ${Object.entries(competencies).map(([name, data]) => `
        <div class="competency-item comp-${data.level}">
          <div class="competency-name">${App.utils.escape(name)}</div>
          <div class="competency-bar-wrap">
            <div class="competency-bar-fill" style="width:${data.fillPct}%"></div>
          </div>
          <div class="competency-status">
            ${data.level === 'strong' ? '✓ Stark' : data.level === 'partial' ? '~ Partiell' : '✕ Fehlend'}
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Keyword Gaps -->
    <div class="card mb-16">
      <div class="card-title">Keyword-Analyse</div>
      ${keywords.found.length > 0 ? `
        <div class="mb-8">
          <span class="text-sm font-bold" style="color:#16a34a">✓ Gefunden (${keywords.found.length})</span>
          <div class="mt-8">
            ${keywords.found.slice(0, 15).map(kw => `<span class="keyword-pill found">${App.utils.escape(kw)}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      ${keywords.missing.length > 0 ? `
        <div class="mt-16">
          <span class="text-sm font-bold" style="color:#dc2626">✕ Fehlende Keywords (${keywords.missing.length})</span>
          <div class="mt-8">
            ${keywords.missing.slice(0, 20).map(kw => `<span class="keyword-pill missing">${App.utils.escape(kw)}</span>`).join('')}
          </div>
          <div class="text-sm text-muted mt-8">Integriere diese Keywords kontextuell in deine Bullet Points.</div>
        </div>
      ` : ''}
    </div>

    <!-- 4-Step Repositioning -->
    <div class="card">
      <div class="card-title">4-Step Repositioning Framework</div>
      <div class="mt-8">
        ${steps.map((step, i) => `
          <div class="step-item">
            <div class="step-num">${i + 1}</div>
            <div class="step-content">
              <div class="step-title">${App.utils.escape(step.title)}</div>
              <div class="step-desc">${App.utils.escape(step.desc)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

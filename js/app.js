/**
 * CareerOS — Core App: Router, Data Layer, Shared Utilities
 */

const App = {

  /* ============================================================
     DATA LAYER — localStorage
     ============================================================ */
  data: {
    get(key, fallback = []) {
      try {
        const raw = localStorage.getItem('careeross_' + key);
        return raw ? JSON.parse(raw) : fallback;
      } catch { return fallback; }
    },
    set(key, value) {
      try {
        localStorage.setItem('careeross_' + key, JSON.stringify(value));
      } catch (e) { console.warn('Storage write failed', e); }
    },
    getObj(key, fallback = {}) {
      try {
        const raw = localStorage.getItem('careeross_' + key);
        return raw ? JSON.parse(raw) : fallback;
      } catch { return fallback; }
    }
  },

  /* ============================================================
     UTILITIES
     ============================================================ */
  utils: {
    uuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    },

    formatDate(iso) {
      if (!iso) return '—';
      const d = new Date(iso);
      return d.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },

    formatCurrency(n) {
      return new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n || 0);
    },

    today() {
      return new Date().toISOString().slice(0, 10);
    },

    daysUntil(isoDate) {
      const diff = new Date(isoDate) - new Date();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    },

    escape(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  },

  /* ============================================================
     ROUTER
     ============================================================ */
  routes: {},

  register(name, renderFn) {
    this.routes[name] = renderFn;
  },

  navigate(hash) {
    const route = (hash || '').replace(/^#\//, '') || 'dashboard';
    const container = document.getElementById('view-container');
    const fn = this.routes[route];
    if (fn) {
      container.innerHTML = '';
      fn(container);
    } else {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">Seite nicht gefunden</div>
        <a href="#/dashboard" class="btn btn-primary mt-16">Zum Dashboard</a>
      </div>`;
    }
    this._updateNav(route);
    window.scrollTo(0, 0);
  },

  _updateNav(activeRoute) {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.route === activeRoute);
    });
  },

  init() {
    // Handle routing
    window.addEventListener('hashchange', () => this.navigate(location.hash));
    window.addEventListener('load', () => {
      this.navigate(location.hash || '#/dashboard');
    });

    // Mobile sidebar toggle
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (toggle && sidebar) {
      toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
      document.querySelectorAll('.nav-item').forEach(a => {
        a.addEventListener('click', () => sidebar.classList.remove('open'));
      });
    }
  },

  /* ============================================================
     MODAL
     ============================================================ */
  modal: {
    show(html) {
      const overlay = document.getElementById('modal-overlay');
      overlay.innerHTML = `<div class="modal">${html}</div>`;
      overlay.classList.remove('hidden');
      overlay.addEventListener('click', e => {
        if (e.target === overlay) this.hide();
      }, { once: true });
      // Close button
      const closeBtn = overlay.querySelector('.modal-close');
      if (closeBtn) closeBtn.addEventListener('click', () => this.hide());
    },
    hide() {
      document.getElementById('modal-overlay').classList.add('hidden');
    }
  },

  /* ============================================================
     TOAST
     ============================================================ */
  toast(msg, type = 'info', duration = 3000) {
    const icons = { success: '✓', error: '✕', info: '●' };
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type] || '●'}</span> ${App.utils.escape(msg)}`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s';
      setTimeout(() => el.remove(), 300);
    }, duration);
  },

  /* ============================================================
     SCORE RING HELPER
     ============================================================ */
  scoreRing(score, label = 'ATS Score') {
    const r = 50;
    const circumference = 2 * Math.PI * r;
    const dashOffset = circumference - (score / 100) * circumference;
    const color = score >= 75 ? '#22c55e' : score >= 50 ? '#C05A2A' : '#ef4444';
    return `
      <div class="score-ring-wrap">
        <div class="score-ring">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle class="score-ring-bg" cx="60" cy="60" r="${r}"/>
            <circle class="score-ring-fill"
              cx="60" cy="60" r="${r}"
              stroke="${color}"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${dashOffset}"/>
          </svg>
          <div class="score-ring-text">
            <span class="score-ring-num" style="color:${color}">${score}</span>
            <span class="score-ring-label">/ 100</span>
          </div>
        </div>
        <span class="text-sm text-muted">${label}</span>
      </div>`;
  }
};

// Boot
App.init();

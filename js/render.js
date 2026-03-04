/* ═══════════════════════════════════════════════════════════════════════════
   DOM rendering — editor panel, slide preview, filmstrip, warnings
═══════════════════════════════════════════════════════════════════════════ */

import { state, THEMES, applyTheme } from './state.js';
import { esc, scaleSlide } from './utils.js';
import { parseYAML, validate } from './parser.js';

/* ── Slide renderer → HTMLElement ─────────────────────────────────────── */

export function renderSlide(slide, index, total) {
  const el  = document.createElement('div');
  const num = document.createElement('div');
  num.className = 'slide-num';
  num.textContent = `${index + 1} / ${total}`;

  const type = slide.type || 'bullets';
  el.className = `slide slide-type-${type}`;
  applyTheme(el, state.currentTheme);

  switch (type) {
    case 'title': {
      const logoHtml = state.meta.logo
        ? `<img class="title-logo" src="${esc(state.meta.logo)}" alt="logo">`
        : '';
      el.innerHTML = `
        ${logoHtml}
        <div class="s-heading">${esc(slide.heading || state.meta.title)}</div>
        <div class="accent-bar"></div>
        <div class="s-subtitle">${esc(slide.subtitle || state.meta.subtitle)}</div>
        <div class="s-meta">
          <span>${esc(state.meta.author)}</span>
          <span>${esc(slide.date || state.meta.date)}</span>
        </div>`;
      break;
    }
    case 'bullets': {
      const li = (slide.bullets || [])
        .map(b => `<li>${esc(b)}</li>`).join('');
      el.innerHTML = `
        <div class="s-heading">${esc(slide.heading)}</div>
        <ul class="s-bullets">${li}</ul>`;
      break;
    }
    case 'split': {
      const mkCol = (col) => {
        if (!col) return '';
        const li = (col.bullets || []).map(b => `<li>${esc(b)}</li>`).join('');
        return `<div>
          <div class="split-col-head">${esc(col.heading || '')}</div>
          <ul class="s-bullets">${li}</ul>
        </div>`;
      };
      el.innerHTML = `
        <div class="s-heading">${esc(slide.heading || '')}</div>
        <div class="split-cols">
          ${mkCol(slide.left)}
          ${mkCol(slide.right)}
        </div>`;
      break;
    }
    case 'code': {
      el.innerHTML = `
        <div class="s-heading">${esc(slide.heading || 'Code')}</div>
        <div class="code-block">
          <div class="code-lang">${esc(slide.language || 'code')}</div>
          <pre>${esc(slide.code || '')}</pre>
        </div>`;
      break;
    }
    case 'quote': {
      el.innerHTML = `
        <div class="quote-mark">"</div>
        <div class="quote-text">${esc(slide.text || '')}</div>
        ${slide.source ? `<div class="quote-source">\u2014 ${esc(slide.source)}</div>` : ''}`;
      break;
    }
    case 'divider': {
      el.innerHTML = `
        <div class="s-heading">${esc(slide.heading || '')}</div>
        <div class="accent-bar" style="margin:14px 0"></div>
        ${slide.subtitle ? `<div class="s-subtitle">${esc(slide.subtitle)}</div>` : ''}`;
      break;
    }
    case 'qa': {
      el.innerHTML = `
        <div class="qa-icon">\uD83D\uDCAC</div>
        <div class="s-heading">${esc(slide.heading || 'Questions?')}</div>
        ${slide.subtext ? `<div class="s-subtext">${esc(slide.subtext)}</div>` : ''}`;
      break;
    }
    case 'cta': {
      el.innerHTML = `
        <div class="s-heading">${esc(slide.heading || 'Next Steps')}</div>
        ${slide.action ? `<div class="cta-pill">\u2192 ${esc(slide.action)}</div>` : ''}
        ${slide.subtext ? `<div class="s-subtext">${esc(slide.subtext)}</div>` : ''}`;
      break;
    }
    default:
      el.className = 'slide slide-state';
      el.innerHTML = `<p>Unknown slide type: <strong>${esc(type)}</strong></p>`;
  }

  el.appendChild(num);

  // Watermark logo on every non-title slide
  if (state.meta.logo && state.meta.logo_all && type !== 'title') {
    const wm = document.createElement('img');
    wm.className = 'slide-logo-watermark';
    wm.src = state.meta.logo;
    wm.alt = '';
    el.appendChild(wm);
  }

  return el;
}

/* ── Stage helpers ────────────────────────────────────────────────────── */

export function showEmpty() {
  document.getElementById('stage').innerHTML = `
    <div class="stage-empty">
      <div class="s-icon">\uD83D\uDCC4</div>
      <p>Paste YAML to get started<br>or click \u2295 Sample above</p>
    </div>`;
  document.getElementById('slide-count-badge').textContent = '';
}

export function showError(msg) {
  document.getElementById('stage').innerHTML = `
    <div class="stage-empty">
      <div class="s-icon">\u26A0</div>
      <p style="color:var(--danger);font-family:var(--mono);font-size:.75rem;max-width:80%">${esc(msg)}</p>
    </div>`;
}

export function showSlide(index) {
  const stage = document.getElementById('stage');
  stage.innerHTML = '';
  if (!state.slides.length) { showEmpty(); return; }
  const el = renderSlide(state.slides[index], index, state.slides.length);
  stage.appendChild(el);
  scaleSlide(el, stage);
}

export function updateCounter() {
  const n = state.slides.length;
  document.getElementById('slide-counter').textContent =
    n ? `${state.current + 1} / ${n}` : '\u2014 / \u2014';
  document.getElementById('prev-btn').disabled = state.current === 0 || !n;
  document.getElementById('next-btn').disabled = state.current >= n - 1 || !n;
}

export function updateWarnings(ws) {
  const el = document.getElementById('warnings');
  if (!ws.length) {
    el.className = 'warnings-bar empty';
    el.innerHTML = '\u2713 No issues';
    return;
  }
  el.className = 'warnings-bar';
  el.innerHTML = ws.map(w => `
    <div class="warning-item lvl-${w.level}">
      <span class="warning-badge">${w.slide ? `slide ${w.slide}` : 'deck'}</span>
      <span>${esc(w.msg)}</span>
    </div>`).join('');
}

/* ── Filmstrip ────────────────────────────────────────────────────────── */

export function renderFilmstrip() {
  const strip = document.getElementById('filmstrip');
  strip.innerHTML = '';
  const t = THEMES[state.currentTheme] || THEMES.neorgon;
  state.slides.forEach((slide, i) => {
    const type  = slide.type || 'bullets';
    const label = slide.heading || slide.text || slide.action || '';
    const thumb = document.createElement('div');
    thumb.className = 'film-thumb' + (i === state.current ? ' active' : '');
    thumb.style.background = t.bg;
    if (i === state.current) thumb.style.borderColor = t.accent;
    thumb.innerHTML = `
      <div class="film-type">${type}</div>
      <div class="film-num">${i + 1}</div>
      <div class="film-text">${esc(label.substring(0, 28))}</div>`;
    thumb.onclick = () => { state.current = i; showSlide(i); updateCounter(); syncFilmstrip(); };
    strip.appendChild(thumb);
  });
}

export function syncFilmstrip() {
  const thumbs = document.querySelectorAll('.film-thumb');
  const t = THEMES[state.currentTheme] || THEMES.neorgon;
  thumbs.forEach((el, i) => {
    const isActive = i === state.current;
    el.classList.toggle('active', isActive);
    el.style.borderColor = isActive ? t.accent : '';
  });
  const active = document.querySelector('.film-thumb.active');
  if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

/* ── Main update loop ─────────────────────────────────────────────────── */

export function update() {
  const text = document.getElementById('yaml-input').value.trim();
  localStorage.setItem('presentation-sage', document.getElementById('yaml-input').value);

  if (!text) {
    state.slides = []; state.meta = {}; state.error = null;
    showEmpty(); updateWarnings([]); updateCounter(); return;
  }

  const result = parseYAML(text);
  if (result.error) {
    state.error = result.error;
    showError(result.error);
    updateWarnings([{ level: 'error', slide: null, msg: result.error }]);
    return;
  }

  state.error  = null;
  state.slides = result.slides;
  state.meta   = result.meta;
  if (state.current >= state.slides.length)
    state.current = Math.max(0, state.slides.length - 1);

  showSlide(state.current);
  updateCounter();
  updateWarnings(validate(state.slides, state.meta));
  renderFilmstrip();

  const badge = document.getElementById('slide-count-badge');
  badge.textContent = state.slides.length
    ? `${state.slides.length} slide${state.slides.length !== 1 ? 's' : ''}`
    : '';
}

/* ── ResizeObservers ──────────────────────────────────────────────────── */

export function initResizeObservers() {
  const stageObserver = new ResizeObserver(() => {
    const stage = document.getElementById('stage');
    const slide = stage.querySelector('.slide:not(.slide-state)');
    if (slide) scaleSlide(slide, stage);
  });
  stageObserver.observe(document.getElementById('stage'));

  const fsObserver = new ResizeObserver(() => {
    const stage = document.getElementById('fs-slide-host');
    const slide = stage.querySelector('.slide');
    if (slide) scaleSlide(slide, document.getElementById('fs-stage'));
  });
  fsObserver.observe(document.getElementById('fs-stage'));
}

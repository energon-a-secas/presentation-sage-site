/* ═══════════════════════════════════════════════════════════════════════════
   Event handlers — keyboard shortcuts, toolbar buttons, sample deck
═══════════════════════════════════════════════════════════════════════════ */

import { state, THEMES } from './state.js';
import { showSlide, updateCounter, syncFilmstrip, update } from './render.js';
import { openFullscreen, closeFullscreen, fsPrev, fsNext,
         openGrid, closeGrid,
         openPresenter, closePresenter, pressPrev, pressNext } from './preview.js';
import { exportYAML, exportMarp, exportHTML, exportPPTX } from './export.js';
import { runAudit } from './audit.js';

/* ── Navigation ───────────────────────────────────────────────────────── */

export function prevSlide() {
  if (state.current > 0) {
    state.current--;
    showSlide(state.current);
    updateCounter();
    syncFilmstrip();
  }
}

export function nextSlide() {
  if (state.current < state.slides.length - 1) {
    state.current++;
    showSlide(state.current);
    updateCounter();
    syncFilmstrip();
  }
}

/* ── Theme switcher ───────────────────────────────────────────────────── */

export function setTheme(name) {
  if (!THEMES[name]) return;
  state.currentTheme = name;
  localStorage.setItem('pres-sage-theme', name);
  if (state.slides.length) showSlide(state.current);
}

/* ── Sample deck ──────────────────────────────────────────────────────── */

export function loadSample() {
  document.getElementById('yaml-input').value = `presentation:
  title: "Why We're Switching to Event-Driven Architecture"
  subtitle: "From polling chaos to reactive clarity"
  author: "Luciano"
  date: "2026-03"

  slides:
    - type: title
      heading: "Why We're Switching to Event-Driven Architecture"
      subtitle: "From polling chaos to reactive clarity"

    - type: bullets
      heading: "The Problem"
      bullets:
        - "API polling every 5s \u2014 200k unnecessary requests/day"
        - "Race conditions causing data inconsistencies"
        - "3 services sharing a DB table they shouldn't touch"

    - type: split
      heading: "Before vs After"
      left:
        heading: "Now (REST polling)"
        bullets:
          - "Tight coupling between services"
          - "Hard to add new consumers"
          - "High DB load at peak"
      right:
        heading: "Target (Event-driven)"
        bullets:
          - "Services only know their own queue"
          - "New consumer = subscribe, done"
          - "Load distributed naturally"

    - type: code
      heading: "Producing an event (Kafka)"
      language: python
      code: |
        producer.send(
          topic="order.created",
          value={"order_id": 123, "user_id": 456}
        )

    - type: quote
      text: "Make each service responsible for one thing and let events connect them."
      source: "Team architecture principle"

    - type: qa
      heading: "Does this change affect you?"
      subtext: "Let's make sure every team's use case is covered"

    - type: divider
      heading: "Migration Plan"
      subtitle: "How we get from here to there"

    - type: bullets
      heading: "Phase 1 \u2014 Strangler fig (Week 1\u20132)"
      bullets:
        - "Identify the 3 highest-volume polling endpoints"
        - "Add Kafka producer alongside existing REST call"
        - "No consumer changes yet \u2014 just emit"

    - type: cta
      heading: "Next Step"
      action: "Review the RFC in Confluence by Friday"
      subtext: "Link in Slack #architecture \u2014 comments welcome"
`;
  state.current = 0;
  update();
}

/* ── Keyboard shortcuts ───────────────────────────────────────────────── */

export function initEvents() {
  // Editor arrow keys
  document.addEventListener('keydown', (e) => {
    const inEditor = document.activeElement === document.getElementById('yaml-input');
    if (inEditor) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSlide();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prevSlide();
  });

  // Fullscreen keys
  document.addEventListener('keydown', (e) => {
    const fs = document.getElementById('fs-stage');
    if (!fs.classList.contains('active')) return;
    if (e.key === 'Escape') closeFullscreen();
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') fsNext();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   fsPrev();
  });

  // Grid keys
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('grid-overlay').classList.contains('active')) return;
    if (e.key === 'Escape') closeGrid();
  });

  // Global shortcuts: G = grid, F = fullscreen present
  document.addEventListener('keydown', (e) => {
    const inEditor = document.activeElement === document.getElementById('yaml-input');
    const inPres   = document.getElementById('pres-overlay').classList.contains('active');
    const inGrid   = document.getElementById('grid-overlay').classList.contains('active');
    if (inEditor || inPres || inGrid) return;
    if (e.key === 'g' || e.key === 'G') openGrid();
    if (e.key === 'f' || e.key === 'F') openPresenter();
  });

  // Presenter keys
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('pres-overlay').classList.contains('active')) return;
    if (e.key === 'Escape') closePresenter();
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') pressNext();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   pressPrev();
  });

  // YAML input listener
  document.getElementById('yaml-input').addEventListener('input', update);
}

/* ── Expose all handlers to window for inline onclick attributes ───── */

export function exposeGlobals() {
  window.setTheme        = setTheme;
  window.exportYAML      = exportYAML;
  window.exportMarp      = exportMarp;
  window.exportHTML       = exportHTML;
  window.exportPPTX      = exportPPTX;
  window.loadSample      = loadSample;
  window.runAudit        = runAudit;
  window.openGrid        = openGrid;
  window.openPresenter   = openPresenter;
  window.prevSlide       = prevSlide;
  window.nextSlide       = nextSlide;
  window.closeFullscreen = closeFullscreen;
  window.fsPrev          = fsPrev;
  window.fsNext          = fsNext;
  window.closeGrid       = closeGrid;
  window.closePresenter  = closePresenter;
  window.pressPrev       = pressPrev;
  window.pressNext       = pressNext;
}

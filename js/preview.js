/* ═══════════════════════════════════════════════════════════════════════════
   Slide preview — fullscreen, grid overview, presenter mode
═══════════════════════════════════════════════════════════════════════════ */

import { state } from './state.js';
import { scaleSlide } from './utils.js';
import { renderSlide, showSlide, updateCounter, syncFilmstrip } from './render.js';

/* ── Fullscreen ───────────────────────────────────────────────────────── */

export function openFullscreen() {
  if (!state.slides.length) return;
  state.fsCurrent = state.current;
  fsRender();
  document.getElementById('fs-stage').classList.add('active');
}

export function closeFullscreen() {
  document.getElementById('fs-stage').classList.remove('active');
}

export function fsPrev() {
  if (state.fsCurrent > 0) { state.fsCurrent--; fsRender(); }
}

export function fsNext() {
  if (state.fsCurrent < state.slides.length - 1) { state.fsCurrent++; fsRender(); }
}

function fsRender() {
  const host = document.getElementById('fs-slide-host');
  host.innerHTML = '';
  const el = renderSlide(state.slides[state.fsCurrent], state.fsCurrent, state.slides.length);
  host.appendChild(el);
  scaleSlide(el, document.getElementById('fs-stage'));
  document.getElementById('fs-counter').textContent =
    `${state.fsCurrent + 1} / ${state.slides.length}`;
  document.getElementById('fs-prev').disabled = state.fsCurrent === 0;
  document.getElementById('fs-next').disabled = state.fsCurrent >= state.slides.length - 1;
}

/* ── Grid overview ────────────────────────────────────────────────────── */

export function openGrid() {
  if (!state.slides.length) return;
  const grid = document.getElementById('grid-scroll');
  grid.innerHTML = '';
  document.getElementById('grid-count').textContent =
    `${state.slides.length} slide${state.slides.length !== 1 ? 's' : ''}`;

  state.slides.forEach((slide, i) => {
    const cell  = document.createElement('div');
    cell.className = 'grid-cell' + (i === state.current ? ' active' : '');
    const inner = document.createElement('div');
    inner.className = 'grid-cell-inner';
    inner.appendChild(renderSlide(slide, i, state.slides.length));
    const idx = document.createElement('div');
    idx.className = 'grid-idx';
    idx.textContent = i + 1;
    cell.appendChild(inner);
    cell.appendChild(idx);
    cell.onclick = () => { state.current = i; showSlide(i); updateCounter(); syncFilmstrip(); closeGrid(); };
    grid.appendChild(cell);
  });

  document.getElementById('grid-overlay').classList.add('active');

  // Scale each slide to fit its cell after paint
  requestAnimationFrame(() => {
    document.querySelectorAll('.grid-cell-inner').forEach(inner => {
      const cell    = inner.closest('.grid-cell');
      const slideEl = inner.querySelector('.slide');
      if (!cell || !slideEl) return;
      const scale = cell.clientWidth / 960;
      slideEl.style.transform       = `scale(${scale})`;
      slideEl.style.transformOrigin = 'top left';
      slideEl.style.position        = 'absolute';
      slideEl.style.left = '0'; slideEl.style.top = '0';
    });
  });
}

export function closeGrid() {
  document.getElementById('grid-overlay').classList.remove('active');
}

/* ── Presenter mode ───────────────────────────────────────────────────── */

let _presTimer = null;
let _presSecs  = 0;
let _presCur   = 0;

export function openPresenter() {
  if (!state.slides.length) return;
  _presCur  = state.current;
  _presSecs = 0;
  presRender();
  document.getElementById('pres-overlay').classList.add('active');
  _presTimer = setInterval(() => {
    _presSecs++;
    const h = Math.floor(_presSecs / 3600);
    const m = Math.floor((_presSecs % 3600) / 60);
    const s = _presSecs % 60;
    document.getElementById('pres-timer').textContent =
      `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, 1000);
}

export function closePresenter() {
  document.getElementById('pres-overlay').classList.remove('active');
  clearInterval(_presTimer);
  _presTimer = null;
}

function presRender() {
  const stage = document.getElementById('pres-stage');
  stage.innerHTML = '';
  const slide = state.slides[_presCur];
  const el = renderSlide(slide, _presCur, state.slides.length);
  stage.appendChild(el);
  requestAnimationFrame(() => scaleSlide(el, stage));
  document.getElementById('pres-counter').textContent = `${_presCur + 1} / ${state.slides.length}`;
  document.getElementById('pres-prev').disabled = _presCur === 0;
  document.getElementById('pres-next').disabled = _presCur >= state.slides.length - 1;
  const notesEl   = document.getElementById('pres-notes');
  const notesText = document.getElementById('pres-note-text');
  if (slide.note) { notesText.textContent = slide.note; notesEl.style.display = ''; }
  else { notesEl.style.display = 'none'; }
}

export function pressPrev() { if (_presCur > 0) { _presCur--; presRender(); } }
export function pressNext() { if (_presCur < state.slides.length - 1) { _presCur++; presRender(); } }

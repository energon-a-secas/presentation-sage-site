/* ═══════════════════════════════════════════════════════════════════════════
   Flow auditor / coaching panel
═══════════════════════════════════════════════════════════════════════════ */

import { state } from './state.js';
import { esc } from './utils.js';
import { validate } from './parser.js';

export function runAudit() {
  if (!state.slides.length) return;
  state.auditOpen = !state.auditOpen;
  document.getElementById('audit-panel').classList.toggle('open', state.auditOpen);
  document.querySelector('[data-action="runAudit"]').textContent =
    state.auditOpen ? '\uD83D\uDD0D Hide' : '\uD83D\uDD0D Audit';
  if (!state.auditOpen) return;

  const ws = validate(state.slides, state.meta);
  const issueHtml = ws.length
    ? ws.map(w => `<div class="audit-item lvl-${w.level}">
        <span class="audit-badge">${w.slide ? 'slide ' + w.slide : 'deck'}</span>
        <span>${esc(w.msg)}</span></div>`).join('')
    : `<div class="audit-ok">\u2713 All density checks passed</div>`;

  const flowQs = [
    'Does slide 1 state the problem, not just the topic?',
    'Is the order: problem \u2192 solution \u2192 proof \u2192 ask?',
    'Is there exactly ONE idea per slide?',
    'If you printed only the headings, do they tell a coherent story?',
    'Can you remove any slide without losing the argument?',
    'Does the last slide tell the audience what to do next?',
  ];

  document.getElementById('audit-inner').innerHTML = `
    <div class="audit-title">"${esc(state.meta.title)}" \u00B7 ${state.slides.length} slides \u00B7 ${ws.length} issue(s)</div>
    <div class="audit-section">
      <div class="audit-section-head">Density checks</div>${issueHtml}
    </div>
    <div class="audit-section">
      <div class="audit-section-head">Flow questions</div>
      ${flowQs.map(q => `<div class="audit-question">${esc(q)}</div>`).join('')}
    </div>`;
}

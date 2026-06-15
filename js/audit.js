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

  const coachMap = [
    { pattern: /bullets.*Aim for 5 or fewer/, tip: 'Group these bullets into 3 themes, or move details to speaker notes.' },
    { pattern: /Bullet \d+: \d+ words/, tip: 'Rewrite this bullet as a 3-5 word fragment.' },
    { pattern: /full sentence/, tip: 'Replace the sentence with a punchy fragment; save the full thought for your voice.' },
    { pattern: /Code block: \d+ lines/, tip: 'Show only the 5-10 lines that prove the point; link to the full snippet.' },
    { pattern: /Split slide: \d+ items per column/, tip: 'Drop the weakest comparison point so each side has 3-4 items.' },
    { pattern: /Missing heading/, tip: 'Add a 3-5 word heading that frames the one takeaway.' },
    { pattern: /No Q&A or pause slide/, tip: 'Insert a Q&A or pause slide after the strongest proof point.' },
    { pattern: /No CTA slide/, tip: 'End with one specific ask: what should the audience do next?' },
    { pattern: /First slide is not a title/, tip: 'Open with a title slide that names the problem, not just the topic.' },
    { pattern: /Last slide is not a CTA or Q&A/, tip: 'Close with a CTA or Q&A so the deck ends with action.' },
  ];

  const coachTips = [];
  ws.forEach(w => {
    const match = coachMap.find(m => m.pattern.test(w.msg));
    if (match) {
      const key = `${w.slide || 'deck'}-${match.tip}`;
      if (!coachTips.some(t => t.key === key)) coachTips.push({ key, slide: w.slide, tip: match.tip });
    }
  });

  if (!coachTips.length && ws.length === 0) {
    coachTips.push({ key: 'clean', slide: null, tip: 'Your deck is clean. Focus next on the story arc: problem, proof, then ask.' });
  }

  const coachHtml = coachTips.length
    ? coachTips.map(t => `<div class="audit-item lvl-info">
        <span class="audit-badge">${t.slide ? 'slide ' + t.slide : 'deck'}</span>
        <span>${esc(t.tip)}</span></div>`).join('')
    : `<div class="audit-ok">\u2713 No specific rewrites suggested</div>`;

  document.getElementById('audit-inner').innerHTML = `
    <div class="audit-title">"${esc(state.meta.title)}" \u00B7 ${state.slides.length} slides \u00B7 ${ws.length} issue(s)</div>
    <div class="audit-section">
      <div class="audit-section-head">Density checks</div>${issueHtml}
    </div>
    <div class="audit-section">
      <div class="audit-section-head">AI Coach suggestions</div>${coachHtml}
    </div>
    <div class="audit-section">
      <div class="audit-section-head">Flow questions</div>
      ${flowQs.map(q => `<div class="audit-question">${esc(q)}</div>`).join('')}
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Shared mutable state + theme system
═══════════════════════════════════════════════════════════════════════════ */

export const THEMES = {
  neorgon: {
    bg: '#080f20', accent: '#0063e5', text: '#f9f9f9', ts: '#cacaca',
    muted: 'rgba(255,255,255,.45)', dim: 'rgba(255,255,255,.22)',
    border: 'rgba(255,255,255,.08)', codeBg: 'rgba(0,0,0,.5)', codeText: '#a5f3fc',
    grad: 'linear-gradient(135deg,rgba(0,99,229,.07) 0%,transparent 55%)',
  },
  midnight: {
    bg: '#0d0b1e', accent: '#a78bfa', text: '#f0ecff', ts: '#d8d0f5',
    muted: 'rgba(216,208,245,.45)', dim: 'rgba(216,208,245,.22)',
    border: 'rgba(167,139,250,.12)', codeBg: 'rgba(0,0,20,.6)', codeText: '#c4b5fd',
    grad: 'linear-gradient(135deg,rgba(167,139,250,.08) 0%,transparent 55%)',
  },
  ember: {
    bg: '#130900', accent: '#f59e0b', text: '#fef3c7', ts: '#fde68a',
    muted: 'rgba(253,230,138,.45)', dim: 'rgba(253,230,138,.22)',
    border: 'rgba(245,158,11,.12)', codeBg: 'rgba(0,0,0,.55)', codeText: '#fde68a',
    grad: 'linear-gradient(135deg,rgba(245,158,11,.06) 0%,transparent 55%)',
  },
  minimal: {
    bg: '#f8fafc', accent: '#1d4ed8', text: '#0f172a', ts: '#1e293b',
    muted: 'rgba(15,23,42,.5)', dim: 'rgba(15,23,42,.3)',
    border: 'rgba(15,23,42,.1)', codeBg: 'rgba(0,0,0,.04)', codeText: '#1e40af',
    grad: 'linear-gradient(135deg,rgba(29,78,216,.04) 0%,transparent 55%)',
  },
};

/** Shared mutable state — all modules import this same object */
export const state = {
  slides:      [],
  meta:        {},
  current:     0,
  fsCurrent:   0,
  error:       null,
  currentTheme: localStorage.getItem('pres-sage-theme') || 'neorgon',
  auditOpen:   false,
};

export const BG_PRESETS = {
  aurora:   'linear-gradient(135deg, #1a0040 0%, #0d3b4e 50%, #0a2a2a 100%)',
  sunset:   'linear-gradient(135deg, #2d0a1e 0%, #4a1a0a 50%, #1a0800 100%)',
  ocean:    'linear-gradient(135deg, #001a33 0%, #003355 50%, #001a2e 100%)',
  ember:    'linear-gradient(135deg, #1a0500 0%, #3d1200 50%, #140300 100%)',
  midnight: 'linear-gradient(135deg, #0a0020 0%, #1a0040 50%, #050010 100%)',
  forest:   'linear-gradient(135deg, #001a0a 0%, #0a2e1a 50%, #001408 100%)',
  storm:    'linear-gradient(135deg, #0a0a1e 0%, #1a1a3a 50%, #050510 100%)',
};

/** Resolve a background value: preset name → gradient, or pass through raw CSS */
export function resolveBg(value) {
  if (!value) return null;
  return BG_PRESETS[value] || value;
}

/** Apply a theme's CSS custom properties to a slide element */
export function applyTheme(el, name) {
  const t = THEMES[name] || THEMES.neorgon;
  el.style.background = t.bg;
  el.style.setProperty('--sl-accent',    t.accent);
  el.style.setProperty('--sl-text',      t.text);
  el.style.setProperty('--sl-ts',        t.ts);
  el.style.setProperty('--sl-muted',     t.muted);
  el.style.setProperty('--sl-dim',       t.dim);
  el.style.setProperty('--sl-border',    t.border);
  el.style.setProperty('--sl-code-bg',   t.codeBg);
  el.style.setProperty('--sl-code-text', t.codeText);
  el.style.setProperty('--sl-grad',      t.grad);
}

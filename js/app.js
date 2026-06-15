/* ═══════════════════════════════════════════════════════════════════════════
   App entry point — wires up all modules and initializes
═══════════════════════════════════════════════════════════════════════════ */

import { state } from './state.js';
import { update, initResizeObservers } from './render.js';
import { initEvents, exposeGlobals } from './events.js';

// Expose all onclick handlers to the global scope (used by HTML attributes)
exposeGlobals();

// Restore theme picker to saved value
document.getElementById('theme-select').value = state.currentTheme;

// Set up ResizeObservers for slide scaling
initResizeObservers();

// Bind keyboard shortcuts and input listener
initEvents();

// Restore saved presentation from localStorage, or load from URL ?yaml=... parameter
const params = new URLSearchParams(location.search);
const urlYaml = params.get('yaml');
if (urlYaml) {
  try {
    document.getElementById('yaml-input').value = decodeURIComponent(urlYaml);
    update();
  } catch (e) {
    console.error('Failed to decode YAML from URL', e);
  }
} else {
  const saved = localStorage.getItem('presentation-sage');
  if (saved) {
    document.getElementById('yaml-input').value = saved;
    update();
  }
}

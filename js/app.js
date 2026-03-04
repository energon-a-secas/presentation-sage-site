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

// Restore saved presentation from localStorage
const saved = localStorage.getItem('presentation-sage');
if (saved) {
  document.getElementById('yaml-input').value = saved;
  update();
}

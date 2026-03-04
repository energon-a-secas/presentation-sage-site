/* ═══════════════════════════════════════════════════════════════════════════
   Shared helpers
═══════════════════════════════════════════════════════════════════════════ */

/** HTML-escape a string */
export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Scale a 960x540 slide element to fill its container */
export function scaleSlide(slideEl, container) {
  const cw = container.clientWidth;
  const ch = container.clientHeight;
  if (!cw || !ch) return;
  const scale = Math.min(cw / 960, ch / 540) * 0.96;
  slideEl.style.transform = `scale(${scale})`;
  slideEl.style.left = `${(cw - 960 * scale) / 2}px`;
  slideEl.style.top  = `${(ch - 540 * scale) / 2}px`;
}

/** Build a filename-safe slug from the presentation title */
export function slug(meta) {
  return (meta.title || 'presentation')
    .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/** Show a temporary toast notification. */
let _toastTimer = null;
export function showToast(msg) {
  let el = document.getElementById('app-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('visible'), 2000);
}

/** Trigger a download of arbitrary content */
export function download(content, filename, mime) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

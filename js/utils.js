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
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('visible'), 2000);
}

/** Convert inline Markdown to HTML: **bold**, *italic*, `code`, [text](url) */
export function inlineMd(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,.08);padding:1px 5px;border-radius:3px;font-family:var(--mono);font-size:.85em">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, text, url) => {
      if (/^\s*javascript\s*:/i.test(url)) return text;
      return `<a href="${url}" target="_blank" rel="noopener" style="color:var(--sl-accent,#0063e5);text-decoration:underline">${text}</a>`;
    });
}

/** Trigger a download of arbitrary content */
export function download(content, filename, mime) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

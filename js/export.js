/* ═══════════════════════════════════════════════════════════════════════════
   Export functions — YAML, Marp Markdown, standalone HTML, PPTX
═══════════════════════════════════════════════════════════════════════════ */

import { state } from './state.js';
import { esc, slug, download } from './utils.js';
import { renderSlide } from './render.js';

/* ── YAML export ──────────────────────────────────────────────────────── */

export function exportYAML() {
  const text = document.getElementById('yaml-input').value;
  if (!text.trim()) { alert('Nothing to export.'); return; }
  download(text, `${slug(state.meta)}.yaml`, 'text/yaml');
}

/* ── Marp Markdown export ─────────────────────────────────────────────── */

export function exportMarp() {
  if (!state.slides.length) { alert('Load a presentation first.'); return; }
  const { meta, slides } = state;
  const lines = [
    '---', 'marp: true', 'theme: default', 'paginate: true',
    `title: "${meta.title}"`, `author: "${meta.author}"`, '---', '',
  ];

  slides.forEach((slide, i) => {
    if (i > 0) lines.push('---', '');
    const type = slide.type || 'bullets';
    switch (type) {
      case 'title':
        lines.push(`# ${slide.heading || meta.title}`);
        if (slide.subtitle || meta.subtitle) lines.push(``, `**${slide.subtitle || meta.subtitle}**`);
        if (meta.author) lines.push('', meta.author);
        if (meta.date)   lines.push(meta.date);
        break;
      case 'bullets':
        lines.push(`## ${slide.heading || ''}`);
        (slide.bullets || []).forEach(b => lines.push(`- ${b}`));
        break;
      case 'split':
        lines.push(`## ${slide.heading || ''}`);
        lines.push('', `**${slide.left?.heading || 'Left'}**`);
        (slide.left?.bullets  || []).forEach(b => lines.push(`- ${b}`));
        lines.push('', `**${slide.right?.heading || 'Right'}**`);
        (slide.right?.bullets || []).forEach(b => lines.push(`- ${b}`));
        break;
      case 'code':
        lines.push(`## ${slide.heading || 'Code'}`, '',
          `\`\`\`${slide.language || ''}`, slide.code || '', '```');
        break;
      case 'quote':
        lines.push(`> ${slide.text || ''}`);
        if (slide.source) lines.push('', `\u2014 ${slide.source}`);
        break;
      case 'divider':
        lines.push(`# ${slide.heading || ''}`);
        if (slide.subtitle) lines.push('', slide.subtitle);
        break;
      case 'qa':
        lines.push(`# ${slide.heading || 'Questions?'}`);
        if (slide.subtext) lines.push('', slide.subtext);
        break;
      case 'cta':
        lines.push(`# ${slide.heading || 'Next Steps'}`);
        if (slide.action) lines.push('', `**\u2192 ${slide.action}**`);
        if (slide.subtext) lines.push('', slide.subtext);
        break;
    }
    lines.push('');
  });

  download(lines.join('\n'), `${slug(state.meta)}.md`, 'text/markdown');
}

/* ── Standalone HTML export ───────────────────────────────────────────── */

export function exportHTML() {
  if (!state.slides.length) { alert('Load a presentation first.'); return; }
  const { meta, slides } = state;

  const slideMarkup = slides.map((slide, i) => {
    const el = renderSlide(slide, i, slides.length);
    el.style.cssText = 'max-width:min(92vw,calc(92vh*16/9));border-radius:4px;';
    return `<div class="fs-slide${i === 0 ? ' active' : ''}">${el.outerHTML}</div>`;
  }).join('\n');

  const inlineStyle = Array.from(document.styleSheets[0].cssRules)
    .map(r => r.cssText).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(meta.title)}</title>
<style>
${inlineStyle}
body{overflow:hidden;display:flex;align-items:center;justify-content:center;height:100vh;background:#000;}
.fs-slide{display:none;position:absolute;}
.fs-slide.active{display:flex;}
.controls{position:fixed;bottom:18px;display:flex;align-items:center;gap:12px;z-index:10;}
.controls .nav-btn{width:36px;height:36px;font-size:1rem;}
#ctr{font-size:.82rem;color:rgba(255,255,255,.4);min-width:60px;text-align:center;}
</style>
</head>
<body>
${slideMarkup}
<div class="controls">
  <button class="nav-btn" onclick="prev()">\u2039</button>
  <span id="ctr">1 / ${slides.length}</span>
  <button class="nav-btn" onclick="next()">\u203A</button>
</div>
<script>
let cur=0,total=${slides.length};
function show(n){document.querySelectorAll('.fs-slide').forEach((s,i)=>s.classList.toggle('active',i===n));document.getElementById('ctr').textContent=(n+1)+' / '+total;}
function prev(){if(cur>0){cur--;show(cur);}}
function next(){if(cur<total-1){cur++;show(cur);}}
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key==='ArrowDown')next();
  if(e.key==='ArrowLeft'||e.key==='ArrowUp')prev();
});
<\/script>
</body></html>`;

  download(html, `${slug(state.meta)}.html`, 'text/html');
}

/* ── PPTX export ──────────────────────────────────────────────────────── */

export function exportPPTX() {
  if (!state.slides.length) { alert('Load a presentation first.'); return; }
  if (typeof PptxGenJS === 'undefined') {
    alert('Export library did not load. Check your internet connection.'); return;
  }

  const { meta, slides } = state;
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';

  const C = {
    bg:      '040714',
    bg2:     '080f20',
    accent:  '0063e5',
    white:   'FFFFFF',
    muted:   '8899bb',
    dim:     '445566',
    bullet:  'a5f3fc',
    code_bg: '000000',
  };

  slides.forEach((slide) => {
    const s    = pptx.addSlide();
    const type = slide.type || 'bullets';
    s.background = { color: C.bg2 };

    // Top accent stripe
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.04,
      fill: { color: C.accent }, line: { type: 'none' },
    });

    switch (type) {
      case 'title':
        s.addText(slide.heading || meta.title || '', {
          x: 0.8, y: 1.3, w: 8.4, h: 1.4,
          fontSize: 34, bold: true, color: C.white,
          align: 'center', valign: 'middle',
        });
        s.addShape(pptx.ShapeType.rect, {
          x: 4.25, y: 2.9, w: 1.5, h: 0.055,
          fill: { color: C.accent }, line: { type: 'none' },
        });
        if (slide.subtitle || meta.subtitle) {
          s.addText(slide.subtitle || meta.subtitle, {
            x: 0.8, y: 3.1, w: 8.4, h: 0.7,
            fontSize: 15, color: C.muted, align: 'center',
          });
        }
        if (meta.author)
          s.addText(meta.author, { x: 0.5, y: 4.8, w: 4, h: 0.38, fontSize: 10, color: C.dim });
        if (meta.date || slide.date)
          s.addText(slide.date || meta.date, {
            x: 5.5, y: 4.8, w: 4, h: 0.38, fontSize: 10, color: C.dim, align: 'right',
          });
        break;

      case 'bullets':
        s.addText(slide.heading || '', {
          x: 0.4, y: 0.25, w: 9.2, h: 0.72,
          fontSize: 19, bold: true, color: C.white, valign: 'middle',
        });
        s.addShape(pptx.ShapeType.line, {
          x: 0.4, y: 1.05, w: 9.2, h: 0, line: { color: '1a2a3a', width: 1 },
        });
        (slide.bullets || []).forEach((b, i) => {
          s.addShape(pptx.ShapeType.ellipse, {
            x: 0.45, y: 1.35 + i * 0.62 + 0.15, w: 0.1, h: 0.1,
            fill: { color: C.accent }, line: { type: 'none' },
          });
          s.addText(String(b), {
            x: 0.68, y: 1.3 + i * 0.62, w: 8.9, h: 0.56,
            fontSize: 13, color: 'e2e8f0', valign: 'middle',
          });
        });
        break;

      case 'split': {
        s.addText(slide.heading || '', {
          x: 0.4, y: 0.25, w: 9.2, h: 0.72,
          fontSize: 19, bold: true, color: C.white,
        });
        s.addShape(pptx.ShapeType.line, {
          x: 0.4, y: 1.05, w: 9.2, h: 0, line: { color: '1a2a3a', width: 1 },
        });
        s.addShape(pptx.ShapeType.line, {
          x: 5, y: 1.15, w: 0, h: 3.5, line: { color: '1a2a3a', width: 1 },
        });
        if (slide.left?.heading)
          s.addText(slide.left.heading, {
            x: 0.4, y: 1.15, w: 4.3, h: 0.42, fontSize: 11, bold: true, color: C.accent,
          });
        (slide.left?.bullets || []).forEach((b, i) =>
          s.addText(`\u2022 ${b}`, { x: 0.4, y: 1.65 + i * 0.56, w: 4.3, h: 0.5, fontSize: 12, color: 'e2e8f0' }));
        if (slide.right?.heading)
          s.addText(slide.right.heading, {
            x: 5.3, y: 1.15, w: 4.3, h: 0.42, fontSize: 11, bold: true, color: C.accent,
          });
        (slide.right?.bullets || []).forEach((b, i) =>
          s.addText(`\u2022 ${b}`, { x: 5.3, y: 1.65 + i * 0.56, w: 4.3, h: 0.5, fontSize: 12, color: 'e2e8f0' }));
        break;
      }

      case 'code':
        s.addText(slide.heading || 'Code', {
          x: 0.4, y: 0.25, w: 9.2, h: 0.72, fontSize: 19, bold: true, color: C.white,
        });
        s.addShape(pptx.ShapeType.rect, {
          x: 0.4, y: 1.05, w: 9.2, h: 3.6,
          fill: { color: C.code_bg, transparency: 30 }, line: { color: '1a2a3a', width: 1 },
        });
        s.addText(slide.code || '', {
          x: 0.6, y: 1.15, w: 8.8, h: 3.4,
          fontSize: 10, fontFace: 'Courier New', color: C.bullet,
          valign: 'top', wrap: true,
        });
        break;

      case 'quote':
        s.addText('"', { x: 0.4, y: 0.2, w: 1.2, h: 1.4, fontSize: 72, color: C.accent, bold: true });
        s.addText(slide.text || '', {
          x: 0.8, y: 1.0, w: 8.4, h: 2.6,
          fontSize: 17, color: C.white, italic: true,
          align: 'center', valign: 'middle',
        });
        if (slide.source)
          s.addText(`\u2014 ${slide.source}`, {
            x: 0.8, y: 3.8, w: 8.4, h: 0.5,
            fontSize: 13, color: C.accent, bold: true, align: 'center',
          });
        break;

      case 'divider':
        s.background = { color: '08102a' };
        s.addText(slide.heading || '', {
          x: 0.8, y: 1.4, w: 8.4, h: 1.4,
          fontSize: 34, bold: true, color: C.white, align: 'center',
        });
        s.addShape(pptx.ShapeType.rect, {
          x: 4.25, y: 3.0, w: 1.5, h: 0.055,
          fill: { color: C.accent }, line: { type: 'none' },
        });
        if (slide.subtitle)
          s.addText(slide.subtitle, {
            x: 0.8, y: 3.2, w: 8.4, h: 0.6, fontSize: 14, color: C.muted, align: 'center',
          });
        break;

      case 'qa':
        s.addText('\uD83D\uDCAC', { x: 4, y: 0.7, w: 2, h: 1.2, fontSize: 40, align: 'center' });
        s.addText(slide.heading || 'Questions?', {
          x: 0.8, y: 2.0, w: 8.4, h: 1.4,
          fontSize: 34, bold: true, color: C.white, align: 'center',
        });
        if (slide.subtext)
          s.addText(slide.subtext, {
            x: 0.8, y: 3.6, w: 8.4, h: 0.5, fontSize: 13, color: C.muted, align: 'center',
          });
        break;

      case 'cta':
        s.addText(slide.heading || 'Next Steps', {
          x: 0.8, y: 0.8, w: 8.4, h: 1.4,
          fontSize: 28, bold: true, color: C.white, align: 'center',
        });
        if (slide.action) {
          s.addShape(pptx.ShapeType.roundRect, {
            x: 2.5, y: 2.5, w: 5, h: 0.95,
            fill: { color: C.accent }, line: { type: 'none' }, rectRadius: 0.1,
          });
          s.addText(`\u2192 ${slide.action}`, {
            x: 2.5, y: 2.5, w: 5, h: 0.95,
            fontSize: 15, bold: true, color: C.white, align: 'center', valign: 'middle',
          });
        }
        if (slide.subtext)
          s.addText(slide.subtext, {
            x: 0.8, y: 3.65, w: 8.4, h: 0.5, fontSize: 12, color: C.muted, align: 'center',
          });
        break;
    }

    // Slide number
    s.addText(`${slides.indexOf(slide) + 1}`, {
      x: 9.1, y: 5.05, w: 0.6, h: 0.3,
      fontSize: 8, color: C.dim, align: 'right',
    });
  });

  pptx.writeFile({ fileName: `${slug(state.meta)}.pptx` });
}

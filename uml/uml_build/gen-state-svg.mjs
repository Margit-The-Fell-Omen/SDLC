// Deterministic orthogonal state-machine SVG for Character Exchange.
// - every connector is axis-aligned (right-angled)
// - all connectors run in gutters and only touch block edges (no crossing blocks)
// - two labelled concurrent regions (Modal lifecycle / Share-token lifecycle)
// - no pseudo-state dots: Start / Exit are real labelled states
//
// usage: node gen-state-svg.mjs <out.svg>

import fs from 'node:fs';

const out = process.argv[2] || '/tmp/state-diagram.svg';
const parts = [];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const FONT = 13;

function wrap(label, max = 18) {
  const words = String(label).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function textBlock(x, y, label) {
  const lines = wrap(label);
  const lh = FONT + 3;
  const sy = y - ((lines.length - 1) * lh) / 2;
  let t = '';
  lines.forEach((ln, i) => (t += `<tspan x="${x}" y="${sy + i * lh}">${esc(ln)}</tspan>`));
  return `<text text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${FONT}" fill="#111">${t}</text>`;
}

function state(x, y, label, w = 150, h = 50) {
  parts.push(`<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="10" ry="10" fill="#ffffff" stroke="#333333" stroke-width="2" />`);
  parts.push(textBlock(x, y, label));
}

function composite(x1, y1, x2, y2, title) {
  parts.push(`<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="12" ry="12" fill="#fafafa" stroke="#333333" stroke-width="2" />`);
  parts.push(`<text x="${x1 + 14}" y="${y1 + 22}" font-family="sans-serif" font-size="13" font-weight="bold" fill="#333">${esc(title)}</text>`);
}

function regionLabel(x, y, text) {
  parts.push(`<text x="${x}" y="${y}" font-family="sans-serif" font-size="15" font-weight="bold" fill="#222">${esc(text)}</text>`);
}

function edge(points, opts = {}) {
  const d = points.map((p, i) => `${i ? 'L' : 'M'} ${p[0]},${p[1]}`).join(' ');
  const start = opts.both ? ' marker-start="url(#arrow)"' : '';
  parts.push(`<path d="${d}" fill="none" stroke="#333333" stroke-width="2" marker-end="url(#arrow)"${start} />`);
  if (opts.label) {
    const w = opts.label.length * 6.4 + 8;
    const start = opts.anchor === 'start';
    const bx = start ? opts.lx : opts.lx - w / 2;
    const tx = start ? opts.lx + 4 : opts.lx;
    parts.push(`<rect x="${bx}" y="${opts.ly - 9}" width="${w}" height="16" fill="#ffffff" />`);
    parts.push(`<text x="${tx}" y="${opts.ly + 3}" text-anchor="${start ? 'start' : 'middle'}" font-family="sans-serif" font-size="11" fill="#444">${esc(opts.label)}</text>`);
  }
}

// ---------------- Outer container + concurrency divider ----------------
parts.push(`<rect x="20" y="20" width="1000" height="1040" rx="16" ry="16" fill="#ffffff" stroke="#333333" stroke-width="2" />`);
parts.push(`<text x="40" y="50" font-family="sans-serif" font-size="16" font-weight="bold" fill="#111">CharacterExchange Orchestration</text>`);
parts.push(`<line x1="640" y1="110" x2="640" y2="1040" stroke="#888888" stroke-width="1.5" stroke-dasharray="6 6" />`);

regionLabel(40, 88, 'Modal (UI) lifecycle');
regionLabel(680, 88, 'Share-token lifecycle');

// ---------------- Region A: Modal ----------------
const SX = 110;
state(SX, 140, 'Start');
state(SX, 240, 'Modal Closed');
state(SX, 340, 'Modal Opening');
state(210, 1000, 'Exit');

composite(200, 420, 560, 900, 'Modal Ready');
state(300, 500, 'Ready', 120, 46);
state(470, 500, 'Copied', 130, 46);
state(470, 600, 'Regenerating', 130, 46);
state(470, 700, 'Importing', 130, 46);
state(300, 800, 'Imported', 130, 46);

// spine
edge([[SX, 165], [SX, 215]]);
edge([[60, 265], [60, 315]], { label: 'click "Exchange"', lx: 68, ly: 302, anchor: 'start' });
edge([[70, 365], [70, 500], [240, 500]], { label: 'link + summary', lx: 145, ly: 488 });

// internal (bidirectional where the flow goes both ways)
edge([[360, 500], [405, 500]], { both: true });
edge([[300, 523], [300, 600], [405, 600]], { both: true, label: 'Regenerate', lx: 395, ly: 565 });
edge([[340, 523], [340, 700], [405, 700]], { both: true, label: 'Load', lx: 372, ly: 688 });
edge([[470, 723], [470, 800], [365, 800]]);
edge([[235, 800], [215, 800], [215, 490], [240, 490]]);

// exits: leave through a border at an aligned x, then route in the gutter
edge([[330, 477], [330, 282], [150, 282], [150, 265]], { label: 'close / abort', lx: 255, ly: 270 });
edge([[535, 700], [590, 700], [590, 290], [170, 290], [170, 265]], { label: 'import completed', lx: 420, ly: 278 });

// closed -> exit (route around the far left, outside the composite)
edge([[35, 240], [30, 240], [30, 1000], [135, 1000]], { label: 'modal destroyed', lx: 38, ly: 640, anchor: 'start' });

// ---------------- Region B: Share token ----------------
const TX = 860;
state(TX, 160, 'Token Start', 190);
state(TX, 270, 'Token Created', 190);
state(TX, 380, 'Token Active', 190);
state(TX, 490, 'Token Revoked', 190);
state(TX, 600, 'Token Purged', 190);

edge([[TX, 185], [TX, 245]]);
edge([[TX, 295], [TX, 355]], { label: 'token persisted', lx: 742, ly: 325 });
edge([[TX, 405], [TX, 465]], { label: 'regenerate issued', lx: 736, ly: 435 });
edge([[TX, 515], [TX, 575]], { label: 'purged / superseded', lx: 734, ly: 545 });

// ---------------- Assemble ----------------
const width = 1040;
const height = 1080;
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color:#ffffff">
<defs>
  <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
    <path d="M0,0 L10,5 L0,10 Z" fill="#333333" />
  </marker>
</defs>
${parts.join('\n')}
</svg>
`;
fs.writeFileSync(out, svg);
console.log(`wrote ${out} (${parts.length} elements)`);
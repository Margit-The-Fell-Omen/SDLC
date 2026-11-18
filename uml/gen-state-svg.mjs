// Deterministic orthogonal state-machine SVG for Character Exchange.
// - every connector is axis-aligned (right-angled)
// - arrows crossing the Modal_Ready composite border are collinear/aligned
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

function state(x, y, label, w = 170, h = 50) {
  parts.push(`<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="10" ry="10" fill="#ffffff" stroke="#333333" stroke-width="2" />`);
  parts.push(textBlock(x, y, label));
}

function composite(x1, y1, x2, y2, title) {
  parts.push(`<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="12" ry="12" fill="#fafafa" stroke="#333333" stroke-width="2" />`);
  parts.push(`<text x="${x1 + 14}" y="${y1 + 22}" font-family="sans-serif" font-size="13" font-weight="bold" fill="#333">${esc(title)}</text>`);
}

function edge(points, opts = {}) {
  const d = points.map((p, i) => `${i ? 'L' : 'M'} ${p[0]},${p[1]}`).join(' ');
  const start = opts.both ? ' marker-start="url(#arrow)"' : '';
  parts.push(`<path d="${d}" fill="none" stroke="#333333" stroke-width="2" marker-end="url(#arrow)"${start} />`);
  if (opts.label) {
    const lx = opts.lx;
    const ly = opts.ly;
    const w = opts.label.length * 6.4 + 8;
    parts.push(`<rect x="${lx - w / 2}" y="${ly - 9}" width="${w}" height="16" fill="#ffffff" />`);
    parts.push(`<text x="${lx}" y="${ly + 3}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#444">${esc(opts.label)}</text>`);
  }
}

// ---------------- Outer container + concurrency divider ----------------
parts.push(`<rect x="20" y="20" width="1460" height="1080" rx="16" ry="16" fill="#ffffff" stroke="#333333" stroke-width="2" />`);
parts.push(`<text x="40" y="52" font-family="sans-serif" font-size="16" font-weight="bold" fill="#111">CharacterExchange Orchestration</text>`);
parts.push(`<line x1="760" y1="70" x2="760" y2="1080" stroke="#888888" stroke-width="1.5" stroke-dasharray="6 6" />`);

// ---------------- Region A: Modal ----------------
const SX = 150;
state(SX, 100, 'Start');
state(SX, 190, 'Modal Closed');
state(SX, 280, 'Modal Opening');
state(SX, 1010, 'Exit');

composite(200, 360, 700, 780, 'Modal Ready');
state(310, 450, 'Ready', 130, 46);
state(560, 450, 'Copied', 150, 46);
state(560, 560, 'Regenerating', 150, 46);
state(560, 670, 'Importing', 150, 46);
state(310, 700, 'Imported', 150, 46);

// spine
edge([[SX, 125], [SX, 165]]);
edge([[SX, 215], [SX, 255]], { label: 'click Exchange', lx: 90, ly: 235 });
edge([[SX, 305], [SX, 450], [245, 450]], { label: 'link + summary', lx: 210, ly: 430 });

// internal (bidirectional)
edge([[375, 450], [485, 450]], { both: true });
edge([[310, 473], [310, 560], [485, 560]], { both: true, label: 'Regenerate', lx: 400, ly: 548 });
edge([[350, 473], [350, 670], [485, 670]], { both: true, label: 'Load', lx: 420, ly: 658 });
edge([[485, 670], [430, 670], [430, 700], [385, 700]]);
edge([[235, 700], [215, 700], [215, 450], [245, 450]]);

// exits (cross border aligned)
edge([[310, 427], [310, 240], [120, 240], [120, 215]], { label: 'close / abort', lx: 210, ly: 228 });
edge([[635, 670], [730, 670], [730, 230], [180, 230], [180, 215]], { label: 'import completed', lx: 560, ly: 218 });

// closed -> exit (route around the left)
edge([[65, 190], [50, 190], [50, 1010], [65, 1010]], { label: 'modal destroyed', lx: 150, ly: 1010 });

// ---------------- Region B: Share token ----------------
const TX = 1000;
state(TX, 100, 'Token Start', 190);
state(TX, 200, 'Token Created', 190);
state(TX, 310, 'Token Active', 190);
state(TX, 420, 'Token Revoked', 190);
state(TX, 530, 'Token Purged', 190);

edge([[TX, 125], [TX, 175]]);
edge([[TX, 225], [TX, 285]], { label: 'token persisted', lx: 900, ly: 255 });
edge([[TX, 335], [TX, 395]], { label: 'regenerate issued', lx: 895, ly: 365 });
edge([[TX, 445], [TX, 505]], { label: 'purged / superseded', lx: 895, ly: 475 });

// ---------------- Assemble ----------------
const width = 1500;
const height = 1120;
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
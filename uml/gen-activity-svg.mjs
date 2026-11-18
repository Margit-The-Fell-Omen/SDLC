// Deterministic, planar activity-diagram SVG for the Character Exchange flow.
// Layout: a vertical "guard chain" of 2-way decisions on the spine; each
// decision either continues straight down or branches straight right.
// Every edge is straight (0 bends) or has exactly one right-angle bend,
// and branches never cross (they occupy disjoint horizontal bands / columns).
//
// usage: node gen-activity-svg.mjs <out.svg>

import fs from 'node:fs';

const out = process.argv[2] || '/tmp/activity-diagram.svg';

const W = 240, H = 56; // box
const DW = 280, DH = 120; // diamond
const R = 30; // circle
const FONT = 13;

const parts = [];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(label, max = 20) {
  const words = label.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function textBlock(x, y, label) {
  const lines = wrap(label);
  const lh = FONT + 3;
  const startY = y - ((lines.length - 1) * lh) / 2;
  let t = '';
  lines.forEach((ln, i) => {
    t += `<tspan x="${x}" y="${startY + i * lh}">${esc(ln)}</tspan>`;
  });
  return `<text text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${FONT}" fill="#111">${t}</text>`;
}

function box(x, y, label) {
  // straight (square) corners, as in the original flowchart
  parts.push(`<rect x="${x - W / 2}" y="${y - H / 2}" width="${W}" height="${H}" fill="#ffffff" stroke="#333333" stroke-width="2" />`);
  parts.push(textBlock(x, y, label));
}

function diamond(x, y, label) {
  const pts = `${x},${y - DH / 2} ${x + DW / 2},${y} ${x},${y + DH / 2} ${x - DW / 2},${y}`;
  parts.push(`<polygon points="${pts}" fill="#ffffff" stroke="#333333" stroke-width="2" />`);
  parts.push(textBlock(x, y, label));
}

// stadium / pill shape, matching Mermaid's ([Start]) / ([Stop])
const STAD_W = 200;
const STAD_H = 56;
function stadium(x, y, label) {
  const rx = STAD_H / 2;
  parts.push(
    `<rect x="${x - STAD_W / 2}" y="${y - STAD_H / 2}" width="${STAD_W}" height="${STAD_H}" rx="${rx}" ry="${rx}" fill="#ffffff" stroke="#333333" stroke-width="2" />`
  );
  parts.push(textBlock(x, y, label));
}

function edge(points, label) {
  const d = points.map((p, i) => `${i ? 'L' : 'M'} ${p[0]},${p[1]}`).join(' ');
  parts.push(`<path d="${d}" fill="none" stroke="#333333" stroke-width="2" marker-end="url(#arrow)" />`);
  if (label) {
    const [a, b] = points;
    const vertical = Math.abs(a[0] - b[0]) < 0.5;
    if (vertical) {
      parts.push(
        `<text x="${a[0] + 10}" y="${(a[1] + b[1]) / 2}" text-anchor="start" font-family="sans-serif" font-size="12" fill="#555555">${esc(label)}</text>`
      );
    } else {
      parts.push(
        `<text x="${(a[0] + b[0]) / 2}" y="${a[1] - 8}" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#555555">${esc(label)}</text>`
      );
    }
  }
}

const L = (x) => x - W / 2; // box left
const Rr = (x) => x + W / 2; // box right
const T = (y) => y - H / 2;
const B = (y) => y + H / 2;
const LD = (x) => x - DW / 2;
const RD = (x) => x + DW / 2;
const TD = (y) => y - DH / 2;
const BD = (y) => y + DH / 2;

// ---------------- Spine (guard chain) ----------------
const SX = 160;

stadium(SX, 60, 'Start');
box(SX, 150, "Click 'Exchange'");
box(SX, 240, 'Open modal');
box(SX, 330, 'Request share link');
box(SX, 420, 'Generate link');
box(SX, 510, 'Render link + summary');

const D1 = 640; // Copy?
const D2 = 900; // Regenerate?
const D3 = 1170; // Import?
const D4 = 1520; // Close / X?

diamond(SX, D1, 'Action: Copy?');
diamond(SX, D2, 'Regenerate?');
diamond(SX, D3, 'Import?');
diamond(SX, D4, 'Close / X?');

edge([[SX, 60 + STAD_H / 2], [SX, T(150)]]);
edge([[SX, B(150)], [SX, T(240)]]);
edge([[SX, B(240)], [SX, T(330)]]);
edge([[SX, B(330)], [SX, T(420)]]);
edge([[SX, B(420)], [SX, T(510)]]);
edge([[SX, B(510)], [SX, TD(D1)]]);
edge([[SX, BD(D1)], [SX, TD(D2)]], 'no');
edge([[SX, BD(D2)], [SX, TD(D3)]], 'no');
edge([[SX, BD(D3)], [SX, TD(D4)]], 'no');

// ---------------- Branch 1: Copy (row at y = D1) ----------------
{
  const y = D1;
  const n1 = 600, n2 = 960, n3 = 1320;
  box(n1, y, 'Read URL');
  box(n2, y, 'Copy to clipboard');
  box(n3, y, "'Copied!' feedback");
  edge([[RD(SX), y], [L(n1), y]], 'yes');
  edge([[Rr(n1), y], [L(n2), y]]);
  edge([[Rr(n2), y], [L(n3), y]]);
}

// ---------------- Branch 2: Regenerate (row at y = D2) ----------------
{
  const y = D2;
  const n1 = 600, dec = 960, ok = 1320, err = 960, errY = D2 + 160;
  box(n1, y, 'POST regenerate');
  diamond(dec, y, 'Success?');
  box(ok, y, 'Show new link');
  box(err, errY, 'Show error');
  edge([[RD(SX), y], [L(n1), y]], 'yes');
  edge([[Rr(n1), y], [LD(dec), y]]);
  edge([[RD(dec), y], [L(ok), y]], 'yes');
  edge([[dec, BD(y)], [dec, T(errY)]], 'no');
}

// ---------------- Branch 3: Import (row at y = D3) ----------------
{
  const y = D3;
  const n1 = 600, dec = 960, n2 = 1320, dec2 = 1680, ok = 2040, errY = D3 + 160;
  box(n1, y, 'Paste URL, Load');
  diamond(dec, y, 'URL valid?');
  box(n2, y, 'POST import');
  diamond(dec2, y, 'Token resolves?');
  box(ok, y, 'Render character');
  box(dec, errY, 'Error: Invalid URL');
  box(dec2, errY, 'Error: Link expired');
  edge([[RD(SX), y], [L(n1), y]], 'yes');
  edge([[Rr(n1), y], [LD(dec), y]]);
  edge([[RD(dec), y], [L(n2), y]], 'yes');
  edge([[Rr(n2), y], [LD(dec2), y]]);
  edge([[RD(dec2), y], [L(ok), y]], 'yes');
  edge([[dec, BD(y)], [dec, T(errY)]], 'no');
  edge([[dec2, BD(y)], [dec2, T(errY)]], 'no');
}

// ---------------- Branch 4: Close (row at y = D4) ----------------
{
  const y = D4;
  const dec1 = 600, n2 = 960, n3 = 600, y3 = D4 + 160;
  diamond(dec1, y, 'Import in progress?');
  box(n2, y, 'Complete/abort import');
  box(n3, y3, 'Close modal');
  stadium(SX, 1780, 'Stop');
  edge([[RD(SX), y], [LD(dec1), y]], 'yes');
  edge([[RD(dec1), y], [L(n2), y]], 'yes');
  edge([[dec1, BD(y)], [dec1, T(y3)]], 'no');
  edge([[n2, B(y)], [n2, y3], [Rr(n3), y3]]);
  edge([[n3, B(y3)], [n3, 1780], [SX + STAD_W / 2, 1780]]);
  // "no" from Close? goes straight to Stop along the spine
  edge([[SX, BD(y)], [SX, 1780 - STAD_H / 2]], 'no');
}

// ---------------- Assemble ----------------
const width = 2280;
const height = 1900;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color:#ffffff">
<defs>
  <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse">
    <path d="M0,0 L10,5 L0,10 Z" fill="#333333" />
  </marker>
</defs>
<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />
${parts.join('\n')}
</svg>
`;

fs.writeFileSync(out, svg);
console.log(`wrote ${out} (${parts.length} elements)`);
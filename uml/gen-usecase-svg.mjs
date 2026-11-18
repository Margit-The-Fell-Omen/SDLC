// Deterministic use-case diagram SVG for Character Exchange.
// - actors (Player, GM / Party member) aligned in one column
// - all connectors are right-angled
// - every connector uses a unique channel x / start y / approach y
//   so no two connector segments overlap
// - use cases use the original stadium ("pill") shape
//
// usage: node gen-usecase-svg.mjs <out.svg>

import fs from 'node:fs';

const out = process.argv[2] || '/tmp/use-case-diagram.svg';
const parts = [];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const FONT = 13;

function wrap(label, max = 16) {
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

function textBlock(x, y, label, size = FONT) {
  const lines = wrap(label);
  const lh = size + 3;
  const sy = y - ((lines.length - 1) * lh) / 2;
  let t = '';
  lines.forEach((ln, i) => (t += `<tspan x="${x}" y="${sy + i * lh}">${esc(ln)}</tspan>`));
  return `<text text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${size}" fill="#111">${t}</text>`;
}

function actor(x, y, label) {
  parts.push(
    `<circle cx="${x}" cy="${y - 26}" r="11" fill="#ffffff" stroke="#333333" stroke-width="2" />` +
      `<line x1="${x}" y1="${y - 15}" x2="${x}" y2="${y + 12}" stroke="#333333" stroke-width="2" />` +
      `<line x1="${x - 16}" y1="${y - 2}" x2="${x + 16}" y2="${y - 2}" stroke="#333333" stroke-width="2" />` +
      `<line x1="${x}" y1="${y + 12}" x2="${x - 14}" y2="${y + 34}" stroke="#333333" stroke-width="2" />` +
      `<line x1="${x}" y1="${y + 12}" x2="${x + 14}" y2="${y + 34}" stroke="#333333" stroke-width="2" />`
  );
  parts.push(`<text x="${x}" y="${y + 54}" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#111">${esc(label)}</text>`);
}

// original stadium / pill shape (Mermaid "([...])")
const UCW = 240;
const UCH = 96;
function usecase(x, y, label) {
  parts.push(
    `<rect x="${x - UCW / 2}" y="${y - UCH / 2}" width="${UCW}" height="${UCH}" rx="${UCH / 2}" ry="${UCH / 2}" fill="#ffffff" stroke="#333333" stroke-width="2" />`
  );
  parts.push(textBlock(x, y, label));
}

// role as a rectangular node (as in the original diagram) with a dotted arrow;
// the box is auto-sized to its text
function roleBox(rightX, centerY, text) {
  const lines = wrap(text, 28);
  const lh = 13;
  const padX = 9;
  const padY = 8;
  const longest = Math.max(...lines.map((l) => l.length));
  const w = Math.ceil(longest * 6.0 + padX * 2);
  const h = lines.length * lh + padY * 2;
  const x = rightX - w;
  const y = centerY - h / 2;
  parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff" stroke="#333333" stroke-width="2" />`);
  let t = '';
  lines.forEach((ln, i) => (t += `<tspan x="${x + padX}" y="${y + padY + 10 + i * lh}">${esc(ln)}</tspan>`));
  parts.push(`<text text-anchor="start" font-family="sans-serif" font-size="10.5" fill="#111">${t}</text>`);
}

function dotted(points) {
  const d = points.map((p, i) => `${i ? 'L' : 'M'} ${p[0]},${p[1]}`).join(' ');
  parts.push(`<path d="${d}" fill="none" stroke="#333333" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#arrow)" />`);
}

function solid(points) {
  const d = points.map((p, i) => `${i ? 'L' : 'M'} ${p[0]},${p[1]}`).join(' ');
  parts.push(`<path d="${d}" fill="none" stroke="#333333" stroke-width="2" />`);
}

function dashed(points, label, lx, ly) {
  const d = points.map((p, i) => `${i ? 'L' : 'M'} ${p[0]},${p[1]}`).join(' ');
  parts.push(`<path d="${d}" fill="none" stroke="#333333" stroke-width="2" stroke-dasharray="7 5" marker-end="url(#arrow)" />`);
  if (label) {
    const w = label.length * 6.4 + 8;
    parts.push(`<rect x="${lx - w / 2}" y="${ly - 9}" width="${w}" height="16" fill="#ffffff" />`);
    parts.push(`<text x="${lx}" y="${ly + 3}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#444">${esc(label)}</text>`);
  }
}

// ---------------- Actors (one aligned column) ----------------
const AX = 110;
const P_Y = 420;
const G_Y = 800;
actor(AX, P_Y, 'Player');
actor(AX, G_Y, 'GM / Party member');

// Role nodes (rectangles) connected to the actors by dotted arrows,
// exactly as in the original diagram (P -.-> P_note / G -.-> G_note).
roleBox(30, 430, "Role: opens the Character Exchange modal; shares / copies the active character link; imports another player's character by URL");
roleBox(30, 810, 'Role: follows a share link in a browser to view a character; imports multiple party sheets for campaign management');
dotted([[108, 430], [30, 430]]);
dotted([[108, 810], [30, 810]]);

// ---------------- System boundary ----------------
parts.push(`<rect x="260" y="60" width="1100" height="940" rx="14" ry="14" fill="#fafafa" stroke="#333333" stroke-width="2" />`);
parts.push(`<text x="282" y="92" font-family="sans-serif" font-size="15" font-weight="bold" fill="#111">RPG Character Sheet App - Character Exchange subsystem</text>`);

// ---------------- Use cases ----------------
const C1 = 430;
const C2 = 830;
usecase(C1, 180, 'UC-1 Open Modal');
usecase(C1, 340, 'UC-2 Display Share Link');
usecase(C1, 500, 'UC-3 Copy Link');
usecase(C1, 660, 'UC-4 Regenerate Link');
usecase(C1, 820, 'UC-7 Close Modal');

usecase(C2, 260, 'UC-6 Display Summary');
usecase(C2, 580, 'UC-5 Import by URL');
usecase(C2, 740, 'UC-8 Open Shared Link');
usecase(1170, 580, 'UC-9 Handle Import Errors');

const leftC1 = C1 - UCW / 2; // 310
const rightC1 = C1 + UCW / 2; // 550
const leftC2 = C2 - UCW / 2; // 710
const rightC2 = C2 + UCW / 2; // 950
const leftC3 = 1170 - UCW / 2; // 1050

// ---------------- Associations: unique channel/start/approach per edge ----------------
// [channelX, startY, approachY, targetLeft]
const playerEdges = [
  [200, 390, 180, leftC1],
  [214, 400, 340, leftC1],
  [228, 410, 500, leftC1],
  [242, 420, 660, leftC1],
  [256, 430, 820, leftC1],
  [270, 440, 260, leftC2],
  [284, 450, 568, leftC2],
];
for (const [ch, sy, ay, tl] of playerEdges) {
  solid([[AX + 18, sy], [ch, sy], [ch, ay], [tl, ay]]);
}

const gmEdges = [
  [296, 770, 740, leftC2],
  [300, 800, 592, leftC2],
];
for (const [ch, sy, ay, tl] of gmEdges) {
  solid([[AX + 18, sy], [ch, sy], [ch, ay], [tl, ay]]);
}

// ---------------- include / extend (right-angled, dashed, non-overlapping) ----------------
// UC-3 includes UC-2 (vertical inside the column)
dashed([[C1, 500 - UCH / 2], [C1, 340 + UCH / 2]], 'include', C1 + 42, 420);
// UC-2 includes UC-6 (around the right, into UC-6's right side; does not
// pass through any use-case block)
dashed([[rightC1, 340], [1000, 340], [1000, 260], [rightC2, 260]], 'include', 780, 332);
// UC-4 includes UC-2 (around the right side of the column, offset approach)
dashed([[rightC1, 660], [600, 660], [600, 326], [rightC1, 326]], 'include', 578, 500);
// UC-9 extends UC-5
dashed([[leftC3, 580], [rightC2, 580]], 'extend', 1000, 562);

// ---------------- Assemble ----------------
const minX = -230;
const width = 1650;
const height = 1060;
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} 0 ${width} ${height}" width="${width}" height="${height}" style="background-color:#ffffff">
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
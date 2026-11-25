// Shared UML drawing helpers (reference style: light-blue classifiers).
// Used by the class / component / deployment generators.

export const COL = {
  line: '#333333',
  classFill: '#e6f4f9',
  compFill: '#ffffff',
  artFill: '#ffffff',
  text: '#111111',
};

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function txt(parts, x, y, s, o = {}) {
  const size = o.size || 12;
  const weight = o.weight || 'normal';
  const anchor = o.anchor || 'middle';
  const fill = o.fill || COL.text;
  const style = o.italic ? ' font-style="italic"' : '';
  parts.push(
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="sans-serif" font-size="${size}" font-weight="${weight}"${style} fill="${fill}">${esc(s)}</text>`
  );
}

export function rect(parts, x, y, w, h, o = {}) {
  parts.push(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}"${o.rx ? ` rx="${o.rx}" ry="${o.rx}"` : ''} fill="${o.fill || '#ffffff'}" stroke="${o.stroke || COL.line}" stroke-width="${o.sw || 1.6}" />`
  );
}

export function line(parts, pts, o = {}) {
  const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0]},${p[1]}`).join(' ');
  const dash = o.dash ? ` stroke-dasharray="${o.dash}"` : '';
  const start = o.startMarker ? ` marker-start="url(#${o.startMarker})"` : '';
  const end = o.endMarker ? ` marker-end="url(#${o.endMarker})"` : '';
  parts.push(
    `<path d="${d}" fill="none" stroke="${o.stroke || COL.line}" stroke-width="${o.sw || 1.6}"${dash}${start}${end} />`
  );
}

// ---- class / interface box with compartments ----
export function classBox(parts, o) {
  const x = o.x;
  const y = o.y;
  const w = o.w;
  const attrs = o.attrs || [];
  const ops = o.ops || [];
  const head = o.stereotype ? 46 : 32;
  const lh = 15;
  const pad = 7;
  const ah = attrs.length ? attrs.length * lh + pad : 0;
  const oh = ops.length ? ops.length * lh + pad : 0;
  const h = head + ah + oh;
  rect(parts, x, y, w, h, { fill: o.fill || COL.classFill });
  if (o.stereotype) txt(parts, x + w / 2, y + 15, `\u00AB${o.stereotype}\u00BB`, { size: 11 });
  const nameY = o.stereotype ? y + 36 : y + 21;
  txt(parts, x + w / 2, nameY, o.name, { size: 13, weight: 'bold' });
  parts.push(`<line x1="${x}" y1="${y + head}" x2="${x + w}" y2="${y + head}" stroke="${COL.line}" stroke-width="1.2" />`);
  if (attrs.length) {
    let cy = y + head + pad + 4;
    attrs.forEach((a) => {
      txt(parts, x + 8, cy + 6, a, { size: 11, anchor: 'start' });
      cy += lh;
    });
    parts.push(`<line x1="${x}" y1="${y + head + ah}" x2="${x + w}" y2="${y + head + ah}" stroke="${COL.line}" stroke-width="1.2" />`);
  }
  if (ops.length) {
    let oy = y + head + ah + pad + 4;
    ops.forEach((op) => {
      txt(parts, x + 8, oy + 6, op, { size: 11, anchor: 'start' });
      oy += lh;
    });
  }
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2, top: y, bottom: y + h, left: x, right: x + w, headBottom: y + head, headTop: y };
}

// UML component icon (rectangle with two tabs)
export function compIcon(parts, x, y, scale = 1) {
  const s = scale;
  rect(parts, x, y, 18 * s, 14 * s, { sw: 1.3 });
  rect(parts, x - 5 * s, y + 2 * s, 10 * s, 4 * s, { sw: 1.3 });
  rect(parts, x - 5 * s, y + 8 * s, 10 * s, 4 * s, { sw: 1.3 });
}

export function compBox(parts, o) {
  rect(parts, o.x, o.y, o.w, o.h, { fill: o.fill || COL.compFill });
  compIcon(parts, o.x + o.w - 30, o.y + 10, 1);
  if (o.stereotype) txt(parts, o.x + o.w / 2, o.y + 18, `\u00AB${o.stereotype}\u00BB`, { size: 11 });
  txt(parts, o.x + o.w / 2, o.y + (o.stereotype ? 34 : 24), o.name, { size: 12, weight: 'bold' });
  return { x: o.x, y: o.y, w: o.w, h: o.h, cx: o.x + o.w / 2, cy: o.y + o.h / 2, top: o.y, bottom: o.y + o.h, left: o.x, right: o.x + o.w };
}

export function subsystem(parts, o) {
  rect(parts, o.x, o.y, o.w, o.h, { fill: '#ffffff', sw: 1.8 });
  parts.push(`<line x1="${o.x}" y1="${o.y + 40}" x2="${o.x + o.w}" y2="${o.y + 40}" stroke="${COL.line}" stroke-width="1.4" />`);
  compIcon(parts, o.x + o.w - 30, o.y + 12, 1.1);
  txt(parts, o.x + o.w / 2, o.y + 18, `\u00ABsubsystem\u00BB ${o.name}`, { size: 12, weight: 'bold' });
  txt(parts, o.x + o.w / 2, o.y + 34, 'internal structure', { size: 11 });
  return { x: o.x, y: o.y, w: o.w, h: o.h, cx: o.x + o.w / 2, cy: o.y + o.h / 2, top: o.y, bottom: o.y + o.h, left: o.x, right: o.x + o.w };
}

// artifact box (document with folded corner)
export function artifact(parts, o) {
  const f = 14;
  parts.push(
    `<path d="M ${o.x} ${o.y} L ${o.x + o.w - f} ${o.y} L ${o.x + o.w} ${o.y + f} L ${o.x + o.w} ${o.y + o.h} L ${o.x} ${o.y + o.h} Z" fill="${COL.artFill}" stroke="${COL.line}" stroke-width="1.6" />`
  );
  parts.push(`<path d="M ${o.x + o.w - f} ${o.y} L ${o.x + o.w - f} ${o.y + f} L ${o.x + o.w} ${o.y + f}" fill="none" stroke="${COL.line}" stroke-width="1.2" />`);
  if (o.stereotype) txt(parts, o.x + o.w / 2, o.y + (o.library ? 26 : 20), `\u00AB${o.stereotype}\u00BB`, { size: 10 });
  const ny = o.y + (o.stereotype ? (o.library ? 44 : 40) : 24);
  (o.lines || [o.name]).forEach((ln, i) => txt(parts, o.x + o.w / 2, ny + i * 15, ln, { size: 12, weight: i === (o.lines ? o.lines.length - 1 : 0) ? 'bold' : 'normal' }));
  return { x: o.x, y: o.y, w: o.w, h: o.h, cx: o.x + o.w / 2, cy: o.y + o.h / 2, top: o.y, bottom: o.y + o.h, left: o.x, right: o.x + o.w };
}

export function folder(parts, o) {
  const tab = 14;
  parts.push(
    `<path d="M ${o.x} ${o.y + tab} L ${o.x} ${o.y + o.h} L ${o.x + o.w} ${o.y + o.h} L ${o.x + o.w} ${o.y + tab} L ${o.x + o.w / 2} ${o.y + tab} L ${o.x + o.w / 2 - 10} ${o.y} L ${o.x + tab} ${o.y} Z" fill="${COL.artFill}" stroke="${COL.line}" stroke-width="1.5" />`
  );
  txt(parts, o.x + o.w / 2, o.y + 22, `\u00ABfolder\u00BB ${o.name}`, { size: 11, weight: 'bold' });
  return { x: o.x, y: o.y, w: o.w, h: o.h, cx: o.x + o.w / 2, cy: o.y + o.h / 2, top: o.y, bottom: o.y + o.h, left: o.x, right: o.x + o.w };
}

// small port square on a component border
export function port(parts, x, y) {
  rect(parts, x - 5, y - 5, 10, 10, { sw: 1.3 });
}
// provided interface (ball). (x,y) is the ball centre; if stemTo is given a
// stem is drawn from the ball edge toward that point (a port on the border).
export function ball(parts, x, y, stemTo) {
  if (stemTo) {
    const [sx, sy] = stemTo;
    const dx = sx - x;
    const dy = sy - y;
    const len = Math.hypot(dx, dy) || 1;
    const ex = x + (dx / len) * 6;
    const ey = y + (dy / len) * 6;
    line(parts, [[ex, ey], [sx, sy]], { sw: 1.4 });
  }
  parts.push(`<circle cx="${x}" cy="${y}" r="6" fill="#ffffff" stroke="${COL.line}" stroke-width="1.4" />`);
}

// required interface (socket). (x,y) is the centre of the half-circle; open is
// the direction of the opening ('left' | 'right' | 'up' | 'down'). If stemTo is
// given a stem is drawn from the convex back side toward that point.
export function socket(parts, x, y, open, stemTo, r = 7) {
  let d;
  if (open === 'left') d = `M ${x} ${y - r} A ${r} ${r} 0 0 1 ${x} ${y + r}`;
  else if (open === 'right') d = `M ${x} ${y - r} A ${r} ${r} 0 0 0 ${x} ${y + r}`;
  else if (open === 'up') d = `M ${x - r} ${y} A ${r} ${r} 0 0 0 ${x + r} ${y}`;
  else d = `M ${x - r} ${y} A ${r} ${r} 0 0 1 ${x + r} ${y}`;
  parts.push(`<path d="${d}" fill="none" stroke="${COL.line}" stroke-width="1.4" />`);
  if (stemTo) {
    const [cx, cy] = socketConvex(x, y, open, r);
    line(parts, [[cx, cy], stemTo], { sw: 1.4 });
  }
}

// point where a stem attaches to a socket (the convex / back side)
export function socketConvex(x, y, open, r = 7) {
  if (open === 'left') return [x + r, y];
  if (open === 'right') return [x - r, y];
  if (open === 'up') return [x, y + r];
  return [x, y - r];
}

export function svgDoc(parts, width, height) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color:#ffffff">
<defs>
  <marker id="open" markerWidth="12" markerHeight="12" refX="10" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10" fill="none" stroke="${COL.line}" stroke-width="1.5"/></marker>
  <marker id="gen" markerWidth="14" markerHeight="14" refX="11" refY="6" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L11,6 L0,12 Z" fill="#ffffff" stroke="${COL.line}" stroke-width="1.4"/></marker>
  <marker id="hollowDia" markerWidth="16" markerHeight="12" refX="8" refY="6" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,6 L8,0 L16,6 L8,12 Z" fill="#ffffff" stroke="${COL.line}" stroke-width="1.3"/></marker>
  <marker id="filledDia" markerWidth="16" markerHeight="12" refX="1" refY="6" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,6 L8,0 L16,6 L8,12 Z" fill="${COL.line}"/></marker>
</defs>
<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />
${parts.join('\n')}
</svg>
`;
}
import fs from 'node:fs';

const [, , input, output] = process.argv;
if (!input || !output) {
  console.error('usage: node fix-sequence-svg.mjs <in.svg> <out.svg>');
  process.exit(1);
}

let svg = fs.readFileSync(input, 'utf8');

// ---- 1. Read the viewBox ----
const vbMatch = /viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/.exec(svg);
const vb = vbMatch
  ? [parseFloat(vbMatch[1]), parseFloat(vbMatch[2]), parseFloat(vbMatch[3]), parseFloat(vbMatch[4])]
  : [-50, -50, 1000, 1000];
const minX = vb[0];
const minY = vb[1];

const num = (tag, key) => {
  const m = new RegExp(`${key}="([-\\d.]+)"`).exec(tag);
  return m ? parseFloat(m[1]) : null;
};

const ACTIVATION_HALF = 5; // half-width of the activation rectangles

// ---- 2. Find all participant lifelines (id="actorN", x2 = column, y2 = end) ----
const actors = [];
const lineRe = /<line id="actor\d+"[^>]*>/g;
let m;
while ((m = lineRe.exec(svg))) {
  const tag = m[0];
  actors.push({ x: num(tag, 'x2'), y: num(tag, 'y2'), touches: [] });
}

const nearestActor = (x) => {
  let best = null;
  let bestD = Infinity;
  for (const a of actors) {
    const d = Math.abs(a.x - x);
    if (d < bestD) {
      bestD = d;
      best = a;
    }
  }
  return bestD <= 20 ? best : null;
};

// ---- 3. Collect the y where each arrow touches each lifeline ----
const addTouch = (x, y) => {
  if (x == null || y == null) return;
  const a = nearestActor(x);
  if (a) a.touches.push(y);
};

const msgLineRe = /<line[^>]*class="messageLine[^"]*"[^>]*>/g;
while ((m = msgLineRe.exec(svg))) {
  const tag = m[0];
  addTouch(num(tag, 'x1'), num(tag, 'y1'));
  addTouch(num(tag, 'x2'), num(tag, 'y2'));
}
const msgPathRe = /<path[^>]*class="messageLine[^"]*"[^>]*d="([^"]*)"[^>]*>/g;
while ((m = msgPathRe.exec(svg))) {
  const nums = (m[1].match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  if (nums.length >= 2) addTouch(nums[0], nums[1]);
  if (nums.length >= 2) addTouch(nums[nums.length - 2], nums[nums.length - 1]);
}

// ---- 4. Choose a sane lifeline end (just below the last touch) ----
let maxContentY = minY;
for (const a of actors) for (const y of a.touches) maxContentY = Math.max(maxContentY, y);
const endY = Math.min(
  Math.max(...actors.map((a) => a.y)),
  maxContentY + 45
);

// ---- 5. Remove the mirrored bottom actor boxes (rect + its text + stick figure) ----
svg = svg.replace(
  /<rect[^>]*class="actor actor-bottom"[^>]*\/>\s*<text[^>]*class="actor actor-box"[^>]*>[\s\S]*?<\/text>/g,
  ''
);
svg = svg.replace(/<g class="actor-man actor-bottom"[^>]*>[\s\S]*?<\/g>/g, '');

// ---- 5c. Participant boxes: white background + black outline.
//         Actor stick figure: black lines, white head with black outline.
svg = svg.replace(/<rect[^>]*class="actor actor-top"[^>]*\/>/g, (tag) =>
  tag.replace(/fill="[^"]*"/, 'fill="#ffffff"').replace(/stroke="[^"]*"/, 'stroke="#000000"')
);
svg = svg.replace(/<g class="actor-man actor-top"[^>]*>[\s\S]*?<\/g>/g, (g) =>
  g
    .replace(/<circle([^>]*?)\/>/g, (c, attrs) => {
      const a = attrs.replace(/\sfill="[^"]*"/, '').replace(/\sstroke="[^"]*"/, '');
      return `<circle${a} fill="#ffffff" stroke="#000000" />`;
    })
    .replace(/<line([^>]*?)\/>/g, (l, attrs) => {
      const a = attrs.replace(/\sstroke="[^"]*"/, '');
      return `<line${a} stroke="#000000" />`;
    })
);

// ---- 5b. Make message arrows only touch the activation-block edges ----
// Both the start and the end are clipped to the rectangle edge, so the line
// neither begins nor ends inside the vertical blocks on the lifelines.
svg = svg.replace(/<line[^>]*class="messageLine[^"]*"[^>]*\/>/g, (tag) => {
  const x1 = num(tag, 'x1');
  const y1 = num(tag, 'y1');
  const x2 = num(tag, 'x2');
  const y2 = num(tag, 'y2');
  if (x1 == null || x2 == null || y1 == null || y2 == null) return tag;
  if (Math.abs(y1 - y2) > 0.5) return tag; // only horizontal messages
  if (Math.abs(x1 - x2) < 0.5) return tag; // ignore self-messages here
  const a1 = nearestActor(x1);
  const a2 = nearestActor(x2);
  if (!a1 || !a2 || Math.abs(a1.x - a2.x) < 0.5) return tag;
  let nx1, nx2;
  if (a1.x < a2.x) {
    // goes right: leave the source's right edge, hit the target's left edge
    nx1 = a1.x + ACTIVATION_HALF;
    nx2 = a2.x - ACTIVATION_HALF;
  } else {
    // goes left
    nx1 = a1.x - ACTIVATION_HALF;
    nx2 = a2.x + ACTIVATION_HALF;
  }
  return tag
    .replace(/x1="[-\d.]+"/, `x1="${nx1}"`)
    .replace(/x2="[-\d.]+"/, `x2="${nx2}"`);
});

// arrowhead tip exactly at the line end (no overshoot into the block)
svg = svg.replace(/(<marker[^>]*id="arrowhead"[^>]*refX=")[-\d.]+(")/, '$110$2');

// ---- 6. Shorten every lifeline to endY and make it dashed (attribute inside the tag) ----
svg = svg.replace(/<line id="actor\d+"[^>]*\/>/g, (tag) => {
  let t = tag.replace(/y2="[-\d.]+"/, `y2="${endY}"`);
  // lifeline colour must be black
  t = /stroke="/.test(t)
    ? t.replace(/stroke="[^"]*"/, 'stroke="#000000"')
    : t.replace(/\/>$/, ' stroke="#000000"/>');
  if (!/stroke-dasharray=/.test(t)) {
    t = t.replace(/\/>$/, ' stroke-dasharray="4 4"/>');
  }
  return t;
});

// ---- 6b. Make self-messages (same lifeline) orthogonal (right angles) ----
svg = svg.replace(/<path[^>]*>/g, (tag) => {
  if (!/class="messageLine/.test(tag)) return tag;
  const dm = /\sd="([^"]*)"/.exec(tag);
  if (!dm) return tag;
  const d = dm[1];
  const nums = (d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  if (nums.length < 4) return tag;
  const x1 = nums[0];
  const y1 = nums[1];
  const x2 = nums[nums.length - 2];
  const y2 = nums[nums.length - 1];
  if (Math.abs(x1 - x2) > 1) return tag; // not a self-message
  const dx = 60;
  const a = nearestActor(x1);
  const edge = a ? a.x + ACTIVATION_HALF : x1; // loop starts/ends at the rect edge
  const nd = `M ${edge},${y1} L ${edge + dx},${y1} L ${edge + dx},${y2} L ${edge},${y2}`;
  return tag.replace(/\sd="[^"]*"/, ` d="${nd}"`);
});

// ---- 7. Build activation rectangles: from first to last arrow on each lifeline ----
const RECT_W = ACTIVATION_HALF * 2;
let rects = '';
for (const a of actors) {
  if (!a.touches.length) continue;
  const top = Math.min(...a.touches);
  const bottom = Math.max(...a.touches);
  const h = Math.max(bottom - top, 1);
  rects +=
    `<rect class="activation" x="${(a.x - RECT_W / 2).toFixed(1)}" y="${top.toFixed(1)}" ` +
    `width="${RECT_W}" height="${h.toFixed(1)}" fill="#ffffff" stroke="#000000" stroke-width="1" />`;
}

// insert rects before the first message ELEMENT (never inside a tag)
let insertAt = -1;
const tIdx = svg.indexOf('class="messageText"');
if (tIdx >= 0) insertAt = svg.lastIndexOf('<text', tIdx);
if (insertAt < 0) {
  const lIdx = svg.indexOf('class="messageLine');
  if (lIdx >= 0) insertAt = svg.lastIndexOf('<line', lIdx);
}
if (insertAt < 0) insertAt = svg.indexOf('</svg>');
svg = svg.slice(0, insertAt) + rects + svg.slice(insertAt);

// ---- 8. Draw an X (cross) at the end of each lifeline ----
const H = 7;
let crosses = '';
for (const a of actors) {
  crosses +=
    `<g class="lifeline-cross">` +
    `<line x1="${a.x - H}" y1="${endY - H}" x2="${a.x + H}" y2="${endY + H}" stroke="#000000" stroke-width="2" />` +
    `<line x1="${a.x - H}" y1="${endY + H}" x2="${a.x + H}" y2="${endY - H}" stroke="#000000" stroke-width="2" />` +
    `</g>`;
}
// force black dashed lifelines past Mermaid's own stylesheet rules
const lifelineCss =
  '<style>#my-svg .actor-line{stroke:#000000 !important;stroke-dasharray:4 4 !important;}' +
  // participant header rectangles: white background, black outline
  '#my-svg .actor-top{fill:#ffffff !important;stroke:#000000 !important;}' +
  // actor stick figure: black lines, white head with black outline
  '#my-svg .actor-man line{stroke:#000000 !important;}' +
  '#my-svg .actor-man circle{fill:#ffffff !important;stroke:#000000 !important;}' +
  // activation rectangles + end crosses: black outline
  '#my-svg .activation{fill:#ffffff !important;stroke:#000000 !important;}' +
  '#my-svg .lifeline-cross line{stroke:#000000 !important;}</style>';
svg = svg.replace('</svg>', `${lifelineCss}${crosses}</svg>`);

// ---- 9. Fit the viewBox to the new bottom ----
const newBottom = endY + 30;
const newHeight = newBottom - minY;
svg = svg.replace(
  /viewBox="[-\d.]+ [-\d.]+ [-\d.]+ [-\d.]+"/,
  `viewBox="${minX} ${minY} ${vb[2]} ${newHeight}"`
);

fs.writeFileSync(output, svg);
console.log(
  `lifelines: ${actors.length} at x=[${actors.map((a) => a.x).join(', ')}], endY=${endY}, height=${newHeight}`
);
for (const a of actors) {
  if (a.touches.length) {
    console.log(`  x=${a.x}: activation y ${Math.min(...a.touches)}..${Math.max(...a.touches)}`);
  }
}
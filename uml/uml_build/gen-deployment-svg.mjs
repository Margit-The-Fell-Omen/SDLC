// Deployment diagram for the Character Exchange feature (reference UML style).
// usage: node gen-deployment-svg.mjs <out.svg>
import fs from 'node:fs';
import { rect, artifact, folder, compBox, port, ball, line, svgDoc, COL, txt } from './uml-style.mjs';

const out = process.argv[2] || '/tmp/deployment-diagram.svg';
const parts = [];

// outer WAR artifact
rect(parts, 40, 30, 640, 540, { fill: '#ffffff', sw: 1.8 });
txt(parts, 360, 52, '\u00ABartifact\u00BB character-exchange.war', { size: 13, weight: 'bold' });
parts.push(`<line x1="40" y1="64" x2="680" y2="64" stroke="${COL.line}" stroke-width="1.2" />`);

// WEB-INF folder
folder(parts, { x: 70, y: 96, w: 580, h: 446, name: 'WEB-INF' });

// web.xml
artifact(parts, { x: 95, y: 150, w: 130, h: 64, stereotype: 'file', name: 'web.xml' });

// lib folder
folder(parts, { x: 95, y: 250, w: 530, h: 270, name: 'lib' });

// libraries
artifact(parts, { x: 110, y: 330, w: 140, h: 64, stereotype: 'library', name: 'character-exchange.jar' });
artifact(parts, { x: 280, y: 330, w: 140, h: 64, stereotype: 'library', name: 'orders.jar' });
artifact(parts, { x: 450, y: 330, w: 150, h: 64, stereotype: 'library', name: 'web-tools.jar' });

// components
compBox(parts, { x: 150, y: 680, w: 250, h: 120, stereotype: 'component', name: 'Share Link Service' });
compBox(parts, { x: 520, y: 680, w: 250, h: 120, stereotype: 'component', name: 'Import Controller' });

// provided interfaces (ball on a stem from the component border)
port(parts, 150, 740);
ball(parts, 138, 740, [150, 740]);
txt(parts, 96, 726, 'IShareLinkApi', { size: 10 });

port(parts, 520, 740);
ball(parts, 508, 740, [520, 740]);
txt(parts, 470, 726, 'IImportApi', { size: 10 });

// manifest dependencies from jars to components
line(parts, [[185, 394], [275, 680]], { dash: '4 4', endMarker: 'open' });
txt(parts, 210, 540, '\u00ABmanifest\u00BB', { size: 10 });
line(parts, [[520, 394], [645, 680]], { dash: '4 4', endMarker: 'open' });
txt(parts, 520, 540, '\u00ABmanifest\u00BB', { size: 10 });

fs.writeFileSync(out, svgDoc(parts, 1200, 900));
console.log(`wrote ${out} (${parts.length} elements)`);

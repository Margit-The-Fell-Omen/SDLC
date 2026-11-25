// Component diagram (internal-structure style, matching the reference):
//  - subsystems with internal parts;
//  - every internal part has ports (squares); interface balls sit on a visible
//    stem (~10px) away from the port;
//  - delegation connectors are solid port-to-port lines;
//  - provided/required interfaces are balls/sockets on the subsystem border
//    ports, on ~10px stems, joined by a dashed arrow.
//
// usage: node gen-component-svg.mjs <out.svg>
import fs from 'node:fs';
import { subsystem, compBox, port, ball, socket, line, svgDoc, txt } from './uml-style.mjs';

const out = process.argv[2] || '/tmp/component-diagram.svg';
const parts = [];

// ---------------- subsystems (extra gap between Service and Repository) ----------------
subsystem(parts, { x: 40, y: 40, w: 560, h: 560, name: 'Character Exchange UI' });
subsystem(parts, { x: 700, y: 40, w: 620, h: 400, name: 'Share Link Service' });     // 40..440
subsystem(parts, { x: 700, y: 540, w: 620, h: 300, name: 'Character Repository' });  // 540..840

// ---------------- internal parts ----------------
compBox(parts, { x: 120, y: 120, w: 240, h: 110, name: ':CharacterExchangeModal' }); // 120..360,120..230
compBox(parts, { x: 120, y: 340, w: 240, h: 110, name: ':ShareLinkManager' });        // 120..360,340..450
compBox(parts, { x: 770, y: 150, w: 220, h: 110, name: ':ShareLinkService' });        // 770..990,150..260
compBox(parts, { x: 1050, y: 150, w: 220, h: 110, name: ':ImportController' });       // 1050..1270,150..260
compBox(parts, { x: 740, y: 620, w: 240, h: 110, name: ':LinkStore' });               // 740..980,620..730

// ---------------- ports on internal parts ----------------
port(parts, 120, 175); port(parts, 360, 175);   // modal L/R
port(parts, 120, 395); port(parts, 360, 395);   // manager L/R
port(parts, 770, 205); port(parts, 990, 205);   // service L/R
port(parts, 860, 260);                           // service bottom (IStore)
port(parts, 1050, 205); port(parts, 1270, 205); // import L/R
port(parts, 860, 620);                           // linkstore top (IStore)

// ---------------- ports on subsystem borders ----------------
port(parts, 40, 175);   // UI left  -> ICharExchange (provided)
port(parts, 40, 395);   // UI left  -> IPlayerSession (provided)
port(parts, 600, 285);  // UI right -> IShareLinkApi (required)
port(parts, 700, 285);  // service left -> IShareLinkApi (provided)
port(parts, 860, 440);  // service bottom -> IStore (required)
port(parts, 860, 540);  // repository top  -> IStore (provided)
port(parts, 1320, 205); // service right -> IImportApi (provided)

// ---------------- interface balls at internal-part ports (~10px stems) ----------------
ball(parts, 99, 175, [115, 175]);    // modal L
ball(parts, 381, 175, [365, 175]);   // modal R
ball(parts, 99, 395, [115, 395]);    // manager L
ball(parts, 381, 395, [365, 395]);   // manager R
ball(parts, 749, 205, [765, 205]);   // service L
ball(parts, 860, 281, [860, 265]);   // service bottom
ball(parts, 860, 599, [860, 615]);   // linkstore top
ball(parts, 1011, 205, [995, 205]);  // service R (internal assembly)
ball(parts, 1291, 205, [1275, 205]); // import R (delegation side)

// ---------------- interfaces on subsystem borders (~10px stems) ----------------
ball(parts, 19, 175, [35, 175]);
txt(parts, 45, 164, 'ICharExchange', { size: 9, anchor: 'start' });
ball(parts, 19, 395, [35, 395]);
txt(parts, 45, 384, 'IPlayerSession', { size: 9, anchor: 'start' });

// internal assembly: :ShareLinkService R (ball) -- :ImportController L (socket)
// (ball seated in the socket; socket on a stem to the import port)
socket(parts, 1024, 205, 'left', [1045, 205]);

// IShareLinkApi: port -- stem -- socket -- (long) dashed arrow -- ball -- stem -- port
socket(parts, 622, 285, 'right', [605, 285]);
ball(parts, 679, 285, [695, 285]);
line(parts, [[629, 285], [673, 285]], { dash: '5 4', endMarker: 'open' });
txt(parts, 650, 272, 'IShareLinkApi', { size: 10 });

// IStore: port -- stem -- socket -- (long) dashed arrow -- ball -- stem -- port
socket(parts, 860, 462, 'down', [860, 445]);
ball(parts, 860, 519, [860, 535]);
line(parts, [[860, 469], [860, 513]], { dash: '5 4', endMarker: 'open' });
txt(parts, 905, 490, 'IStore', { size: 10 });

// IImportApi (service right border, provided): port -- stem -- ball
ball(parts, 1341, 205, [1325, 205]);
txt(parts, 1330, 190, 'IImportApi', { size: 10, anchor: 'start' });

// :ImportController R -- delegation -- service right border port
line(parts, [[1297, 205], [1315, 205]]);

// ---------------- delegation connectors (subsystem port -> part ball) ----------------
line(parts, [[45, 175], [93, 175]]);                               // UI left -> modal L ball
line(parts, [[45, 395], [93, 395]]);                               // UI left -> manager L ball
line(parts, [[595, 285], [560, 285], [560, 175], [387, 175]]);     // UI right -> modal R ball
line(parts, [[595, 285], [560, 285], [560, 395], [387, 395]]);     // UI right -> manager R ball
line(parts, [[705, 285], [740, 285], [740, 205], [743, 205]]);     // service left -> service L ball
line(parts, [[860, 435], [860, 287]]);                             // service bottom -> service bottom ball
line(parts, [[860, 545], [860, 593]]);                             // repository top -> linkstore top ball

fs.writeFileSync(out, svgDoc(parts, 1400, 900));
console.log(`wrote ${out} (${parts.length} elements)`);

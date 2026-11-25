// Class diagram for the Character Exchange feature (reference UML style).
// usage: node gen-class-svg.mjs <out.svg>
import fs from 'node:fs';
import { classBox, line, svgDoc } from './uml-style.mjs';

const out = process.argv[2] || '/tmp/class-diagram.svg';
const parts = [];

const api = classBox(parts, {
  x: 60, y: 40, w: 320, stereotype: 'interface', name: 'ShareLinkApi',
  ops: ['+ getOrCreateLink(characterId: String): ShareLink', '+ resolveToken(token: String): Character', '+ regenerate(characterId: String): ShareLink'],
});
const svc = classBox(parts, {
  x: 60, y: 320, w: 320, name: 'ShareLinkService',
  attrs: ['- store: LinkStore'],
  ops: ['+ getOrCreateActiveToken(characterId: String): ShareToken', '+ resolveToken(token: String): Character', '+ regenerate(characterId: String): ShareToken'],
});
const store = classBox(parts, {
  x: 60, y: 620, w: 320, name: 'LinkStore',
  attrs: ['- links: Map<String, ShareToken>'],
  ops: ['+ save(token: ShareToken): void', '+ lookup(tokenHash: String): ShareToken', '+ revoke(token: String): void'],
});
const importer = classBox(parts, {
  x: 480, y: 320, w: 320, name: 'ImportController',
  attrs: ['- service: ShareLinkService'],
  ops: ['+ importByUrl(url: String): Character', '- validate(url: String): Boolean'],
});
const modal = classBox(parts, {
  x: 480, y: 40, w: 360, name: 'CharacterExchangeModal',
  attrs: ['- activeCharacter: Character', '- displayedUrl: String'],
  ops: ['+ open(): void', '+ renderSummary(c: Character): void', '+ copyLink(): void', '+ load(url: String): void', '+ close(): void'],
});
const manager = classBox(parts, {
  x: 940, y: 40, w: 340, name: 'ShareLinkManager',
  attrs: ['- clipboard: Clipboard'],
  ops: ['+ requestActiveLink(characterId: String): ShareLink', '+ copyToClipboard(url: String): void', '+ regenerate(): ShareLink'],
});
const character = classBox(parts, {
  x: 940, y: 320, w: 340, name: 'Character',
  attrs: ['+ avatar: String', '+ name: String', '+ race: String', '+ clazz: String', '+ level: int', '+ hp: int', '+ maxHp: int', '+ mp: int', '+ maxMp: int'],
  ops: ['+ summary(): String'],
});
const token = classBox(parts, {
  x: 480, y: 620, w: 320, name: 'ShareToken',
  attrs: ['+ token: String', '+ characterId: String', '+ createdAt: Date', '+ revoked: boolean'],
});

// relationships
// realization: service implements interface
line(parts, [[svc.cx, svc.top], [api.cx, api.bottom]], { dash: '6 4', endMarker: 'gen' });
// dependency: service -> store
line(parts, [[svc.cx, svc.bottom], [store.cx, store.top]], { dash: '6 4', endMarker: 'open' });
// aggregation: store o-- token
line(parts, [[token.left, 669], [store.right, 669]], { endMarker: 'hollowDia' });
// dependency: importer -> service
line(parts, [[importer.left, 372], [svc.right, 372]], { dash: '6 4', endMarker: 'open' });
// dependency: modal -> manager
line(parts, [[modal.right, 110], [manager.left, 110]], { dash: '6 4', endMarker: 'open' });
// usage dependency: manager -> interface (routed below the modal)
line(parts, [[manager.cx, manager.bottom], [manager.cx, 240], [api.right, 240], [api.right, api.bottom]], { dash: '6 4', endMarker: 'open' });
// association: modal -> character
line(parts, [[modal.cx, modal.bottom], [modal.cx, 280], [character.cx, 280], [character.cx, character.top]], { endMarker: 'open' });
// association: token -> character
line(parts, [[token.right, 669], [880, 669], [880, character.cy], [character.left, character.cy]], { endMarker: 'open' });

fs.writeFileSync(out, svgDoc(parts, 1420, 900));
console.log(`wrote ${out} (${parts.length} elements)`);
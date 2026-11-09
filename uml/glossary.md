# Project Glossary — Character Exchange Feature

Version 1.0  
RPG Character Sheet App Team  
November 2026

> Glossary of domain, project, and modeling terms used across the UML model and the
> SRS/SDD/ADR documentation for the **Character Exchange** feature.
> Stored as a standalone artifact and referenced from `uml/README.md` and the SDD.

| Term | Definition |
|------|------------|
| Actor (Acteur) | An external entity (a person, a system, or an external device) that interacts with the system to achieve a goal. In this model: **Player** and **GM / Party member**. |
| Use Case (Precedent) | A specification of a set of interactions between an actor and the system that produces a value-observable result. E.g. **Share character**, **Import character**. |
| Share link (Ссылка-приглашение) | A short URL (`https://rpg.app/s/{token}`) that lets someone open the active character in view mode. Must not exceed 50 characters. |
| Token | The opaque short identifier embedded in a share URL, mapped to a character server-side. Unused latent (ungraphable) to prevent enumeration. |
| Opaque token | A random, non-sequential identifier carrying no readable character/player information. |
| Revocation (Отзыв) | Making a previously issued link unusable; after regeneration the old token resolves to `410 Gone`. |
| Regenerate (Перегенерить) | Issue a new active link for a character and immediately invalidate the previous one. |
| Import (Импорт) | Resolving a pasted share URL into a remote character and loading it into the local session/viewer. |
| Clipboard (Буфер обмена) | System clipboard accessed via the secure-context `navigator.clipboard` API to copy the link. |
| SSRF | Server-Side Request Forgery — mitigated by validating that import URLs belong to the allowed application origin before proxying. |
| LinkStore | Backend persistence element; `share_links` table storing `token_hash`, `character_id`, `created_at`, `revoked`. |
| ShareLinkService | Backend service responsible for issuing, storing, resolving, and revoking tokens. |
| ShareLinkManager | Frontend service that calls share-link endpoints and invokes the clipboard API. |
| ImportController | Backend controller that validates and proxies import URLs through `ShareLinkResolver`. |
| Unit | A game character owned by the player; the subject of sharing/importing (avatar, name, race, class, level, HP, MP). |
| Active character | The character currently selected/opened in the character sheet, whose share link is displayed. |
| Activity Diagram | UML behavior diagram showing the flow of control/actions (modal open, copy, import). |
| State Diagram | UML state machine showing the states of the modal window and of a share token over time. |
| Sequence Diagram | UML interaction diagram showing message exchange between the browser, frontend, backend, and `LinkStore` over time. |
| Use-Case Diagram | UML diagram showing actors, use cases, and their relationships at the system boundary. |
| DM / GM | Dungeon Master / Game Master — a power user who opens shared links and imports many sheets. |
| REQ-* | Requirement identifiers from the SRS (e.g. REQ-FUNC-001 … REQ-FUNC-005, REQ-SEC-001, REQ-PERF-001). |
| SSC | Supplementary Specification — non-functional/global requirements; see `uml/supplementary-spec.md`. |
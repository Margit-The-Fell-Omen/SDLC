---
status: "accepted"
date: 2026-10-28
decision-makers: AI Assistant
consulted: Backend Lead; Product Owner
informed: Frontend Team; QA Team
---

# Use Server-Generated Opaque Short Tokens for Character Share Links

## Context and Problem Statement

The Character Exchange feature lets players share the currently active character by a unique URL and import another player's character from a pasted link. The URL must be **short (at most 120 characters including protocol and domain)**, must be **revocable** (generating a new link immediately invalidates the previous one), and must be usable directly in a browser address bar (see SRS, REQ-FUNC-001, REQ-FUNC-002, REQ-FUNC-004).

How should the share link be encoded so that it stays short, cannot be used to enumerate other players' characters, can be invalidated on demand, and remains safe to pass around in messengers and browser address bars?

## Decision Drivers

* **URL length cap:** the full generated URL must not exceed 120 characters (SRS acceptance criterion, referenced by REQ-FUNC-001). The production base URL `https://live-dnd-list.duckdns.org/s/` is 36 characters, leaving ~84 characters for the token.
* **Revocability:** regenerating a link must invalidate the previous one immediately (SRS, REQ-FUNC-002).
* **Security / anti-enumeration:** share links must not expose internal character IDs or player account data, so other users cannot guess or enumerate valid links (REQ-SEC-001).
* **Direct browser navigation:** `GET /s/{token}` must resolve and redirect to the character sheet in view mode.
* **Simplicity of import:** backend import must be able to resolve a token to the correct character in one lookup.

## Considered Options

* **Opaque random tokens stored in the link store** (base62 alphabet, ~22 characters ≈ 131 bits of entropy; token → character mapping persisted in a `share_links` table).
* **Stateless signed tokens** (e.g., JWT carrying `characterId`, expiry, and a signature; verified by the backend without storage).
* **Encoded sequential character IDs** (base62-encode the character's database primary key; no extra storage).

## Decision Outcome

Chosen option: **Opaque random tokens stored in the link store**, because it is the only option that simultaneously satisfies the hard 120-character URL cap with cryptographically safe entropy, provides *instant* revocation on regeneration without key management or clock dependencies, and completely hides the underlying character identity (preventing link enumeration via predictable IDs).

* URL layout: production base `https://live-dnd-list.duckdns.org/s/` = 36 characters fixed, leaving 84 for the token; a 22-character base62 token keeps the total at ~58 characters, well under the 120-character budget. A configurable `app.frontend-base-url` keeps local/test environments within the same cap.
* Lifecycle: a `share_links` row stores `token_hash`, `character_type`, `character_id`, `created_at`, `revoked`; regeneration sets `revoked = true` on the old row and inserts a new one, so the old token resolves to `410 Gone`.
* Generalization: `character_type` (`DND14`, `DND24`, `VTM5`) is part of the row so the same service, token format, revocation, and public-resolution flow serve every ruleset. `DND14`/`DND24` are set during character creation from the chosen content edition (legacy/2014 vs. 2024) and persisted on the character; `VTM5` is reserved for the VTM module and reuses the identical contract when its sheets are built. The link service depends on an entity-agnostic contract (`ShareableCharacter`) rather than D&D-specific types.

### Consequences

* Good, because links are short (≤ 120 chars), unguessable, and instantly revocable with a simple database update.
* Good, because the share identity is fully decoupled from the character ID, defeating enumeration attacks.
* Good, because import is a single indexed lookup by token and requires no signature/secret management.
* Bad, because a `share_links` store and an indexed token field must be maintained, and each shared-link open is one database round-trip.
* Bad, because a leaked *active* token cannot be recovered (revoking it is the only remedy) — acceptable for a game sheet use case.

### Confirmation

* Unit/integration tests assert: generated URL length ≤ 120 characters; regenerated link returns `410 Gone` while the new link returns `200`; tokens are not sequential; `GET /s/{token}` with an unknown token returns `404`.
* Code review enforces that no shareable URL exposes a raw character/player ID.
* CI gate: security scan for enumerable URL patterns (e.g., sequential integers or UUID leaks).

## Pros and Cons of the Options

### Opaque random tokens stored in the link store

Server picks a cryptographically random base62 string and stores token → character mapping.

* Good, because ~131 bits of entropy cannot be brute-forced even within the short URL budget.
* Good, because revocation is a single `active = false` update with immediate effect.
* Good, because token ⇄ character mapping contains no exploitable structure.
* Neutral, because an extra table and an index must be provisioned.
* Bad, because link resolution requires a database read per open.

### Stateless signed tokens (JWT)

Share link becomes `https://rpg.app/s/{base64url(JWT(characterId, exp, signature))}`.

* Good, because link resolution needs no storage lookup — verify signature, read ID.
* Bad, because a JWT carrying `characterId` as payload grows beyond the 120-character budget at useful entropy/expiry settings.
* Bad, because invalidation on regeneration requires either a revocation list (`blacklist`) or short expiries, adding the very storage the option tried to avoid.
* Bad, because signing keys must be managed, rotated, and kept consistent across the fleet.

### Encoded sequential character IDs

Share link encodes the character's primary key, e.g., `https://rpg.app/s/Ab3x9Y`.

* Good, because it is the shortest possible link with zero storage overhead.
* Bad, because base62 of a sequential ID is trivially enumerable — anyone can walk neighboring IDs and open other players' characters (violates REQ-SEC-001).
* Bad, because regeneration cannot invalidate the old link without a separate revocation store.
* Bad, because it exposes internal data-model information in a public URL.

## More Information

* Feasibility check confirms the production fixed URL prefix length; the token budget of 84 characters (120-char cap) is documented in SDD DV-001 / DV-005.
* Affected requirements: REQ-FUNC-001 (display link), REQ-FUNC-002 (copy / regeneration), REQ-FUNC-004 (import by URL), REQ-SEC-001 (URL validation).
* Affected SDD design elements: DV-002 (Composition — `ShareLinkService`, `LinkStore`), DV-003 (Interface — `GET /s/{token}`, regenerate/import endpoints), DV-006 (Dependency).
* Related references: [Character Exchange UI Mockup](../srs/mockup_char_share_feature.jpg); SRS `project-srs-en.md`.

---

## How the UML behavior model is built and how it connects to this decision

This section explains the *mechanism* used to construct the dynamic-behavior model and how the
various UML diagrams are interrelated and trace back to ADR-001.

### Building mechanism

The whole model is written in **textual UML (Mermaid)**, stored as reusable `.mmd` sources
under `uml/`. This is intentional: text diagrams are versioned in Git, diffable in PRs, and
rendered natively by GitHub/GitLab or the Mermaid CLI whenever an image is needed, so the model
stays in sync with the code and documents it represents. Mermaid has no native use-case or
activity syntax, so those two are `flowchart`s; the state and sequence diagrams use native
`stateDiagram-v2` and `sequenceDiagram`. Supporting artifacts are dedicated standalone files:

* **Glossary** (`uml/glossary.md`) — a table of domain and modeling terms shared by the SRS, SDD, and ADR, kept in one place and referenced (not duplicated) elsewhere.
* **Supplementary specification** (`uml/supplementary-spec.md`) — non-functional/global requirements (performance, security, usability, localization) that do not fit a single use case.
* **Use-case specification** (`uml/use-case-spec.md`) — per-actor (1–2 lines) and per-use-case descriptions (explanation, preconditions, flow of events, postconditions).

### How the diagrams are related

1. **Use-case diagram** (`uml/use-case-diagram.mmd`) defines the system boundary and the
   services it offers. It is the *entry point*: actors (**Player**, **GM / Party member**) and
   use cases (UC-1…UC-8) are derived from the SRS requirements.
2. **Activity diagram** (`uml/activity-diagram.mmd`) refines the *primary* use cases into
   ordered actions and decision nodes (Copy / Regenerate / Import / Close, and the import
   validity check), i.e. it specifies the **control flow** of UC-2…UC-5.
3. **State diagram** (`uml/state-diagram.mmd`) captures the **stateful** behavior that the
   activity diagram treats as atomic: the modal window lifecycle and the share-token lifecycle,
   modeled as two concurrent regions in one composite state. ADR-001 directly determines the
   token region — `Active → Revoked` is exactly the "regeneration sets `active = false`" step
   from the Decision Outcome.
4. **Sequence diagram** (`uml/sequence-diagram.mmd`) shows the **message exchange over time**
   among the frontend/browser, backend components, and `LinkStore`. It is the "how it runs"
   counterpart to the use-case "what is offered" view: its messages match the DV-003 API
   contracts and DV-002 component responsibilities.

### Where ADR-001 enters the model

ADR-001 constrains every level of the behavior model:

* **Use case level:** *Regenerate / Invalidate Share Link* (UC-4) and the *404/410* error in
  *Import* (UC-5) express the revocability and anti-enumeration decisions.
* **State level:** the `Active`/`Revoked` token states and the `410 Gone` on a revoked token
  follow from "regeneration sets `active = false`" in the Decision Outcome.
* **Sequence level:** the import flow's `alt` branch `token revoked / unknown → 410 Gone`
  realizes ADR-001's revocation semantics at message level.

### Traceability summary

| Diagram | Connects to | Testifies |
|---------|-------------|-----------|
| Use-case | DV-001, SRS REQ-FUNC-001…005, REQ-SEC-001 | system boundary, offered services |
| Activity | DV-004 (Interaction) | control flow of UC-2…UC-5 |
| State | DV-005 (State Dynamics), ADR-001 | modal + token lifecycle, revocation |
| Sequence | DV-003 (Interface), DV-002, ADR-001 | runtime message flows incl. error paths |

Revisit this ADR if URL-length budget, revocation semantics, or the token entropy requirement
change — any of these would ripple through the use-case, state, and sequence diagrams above.

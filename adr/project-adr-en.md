---
status: "accepted"
date: 2026-10-28
decision-makers: AI Assistant
consulted: Backend Lead; Product Owner
informed: Frontend Team; QA Team
---

# Use Server-Generated Opaque Short Tokens for Character Share Links

## Context and Problem Statement

The Character Exchange feature lets players share the currently active character by a unique URL and import another player's character from a pasted link. The URL must be **short (at most 50 characters including protocol and domain)**, must be **revocable** (generating a new link immediately invalidates the previous one), and must be usable directly in a browser address bar (see SRS, REQ-FUNC-001, REQ-FUNC-002, REQ-FUNC-004).

How should the share link be encoded so that it stays short, cannot be used to enumerate other players' characters, can be invalidated on demand, and remains safe to pass around in messengers and browser address bars?

## Decision Drivers

* **URL length cap:** the full generated URL must not exceed 50 characters (SRS acceptance criterion, referenced by REQ-FUNC-001). Only ~30 characters remain for the token once the base URL is included.
* **Revocability:** regenerating a link must invalidate the previous one immediately (SRS, REQ-FUNC-002).
* **Security / anti-enumeration:** share links must not expose internal character IDs or player account data, so other users cannot guess or enumerate valid links (REQ-SEC-001).
* **Direct browser navigation:** `GET /s/{token}` must resolve and redirect to the character sheet in view mode.
* **Simplicity of import:** backend import must be able to resolve a token to the correct character in one lookup.

## Considered Options

* **Opaque random tokens stored in the link store** (base62 alphabet, ~22 characters ≈ 131 bits of entropy; token → character mapping persisted in a `share_links` table).
* **Stateless signed tokens** (e.g., JWT carrying `characterId`, expiry, and a signature; verified by the backend without storage).
* **Encoded sequential character IDs** (base62-encode the character's database primary key; no extra storage).

## Decision Outcome

Chosen option: **Opaque random tokens stored in the link store**, because it is the only option that simultaneously satisfies the hard 50-character URL cap with cryptographically safe entropy, provides *instant* revocation on regeneration without key management or clock dependencies, and completely hides the underlying character identity (preventing link enumeration via predictable IDs).

* URL layout: `https://rpg.app/s/{token}` → `https://` (8) + `rpg.app` (7) + `/s/` (3) = 18 characters fixed, leaving 32 for the token; a 22-character base62 token keeps the total well under the 50-character budget.
* Lifecycle: a `share_links` row stores `token_hash`, `character_id`, `created_at`, `active`; regeneration sets `active = false` on the old row and inserts a new one, so the old token resolves to `410 Gone`.

### Consequences

* Good, because links are short (< 50 chars), unguessable, and instantly revocable with a simple database update.
* Good, because the share identity is fully decoupled from the character ID, defeating enumeration attacks.
* Good, because import is a single indexed lookup by token and requires no signature/secret management.
* Bad, because a `share_links` store and an indexed token field must be maintained, and each shared-link open is one database round-trip.
* Bad, because a leaked *active* token cannot be recovered (revoking it is the only remedy) — acceptable for a game sheet use case.

### Confirmation

* Unit/integration tests assert: generated URL length ≤ 50 characters; regenerated link returns `410 Gone` while the new link returns `200`; tokens are not sequential; `GET /s/{token}` with an unknown token returns `404`.
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
* Bad, because a JWT carrying `characterId` as payload grows beyond the 50-character budget at useful entropy/expiry settings.
* Bad, because invalidation on regeneration requires either a revocation list (`blacklist`) or short expiries, adding the very storage the option tried to avoid.
* Bad, because signing keys must be managed, rotated, and kept consistent across the fleet.

### Encoded sequential character IDs

Share link encodes the character's primary key, e.g., `https://rpg.app/s/Ab3x9Y`.

* Good, because it is the shortest possible link with zero storage overhead.
* Bad, because base62 of a sequential ID is trivially enumerable — anyone can walk neighboring IDs and open other players' characters (violates REQ-SEC-001).
* Bad, because regeneration cannot invalidate the old link without a separate revocation store.
* Bad, because it exposes internal data-model information in a public URL.

## More Information

* Feasibility check with the mockup confirms the fixed URL prefix lengths; the token budget of 32 characters is documented in SDD DV-001 / DV-005.
* Affected requirements: REQ-FUNC-001 (display link), REQ-FUNC-002 (copy / regeneration), REQ-FUNC-004 (import by URL), REQ-SEC-001 (URL validation).
* Affected SDD design elements: DV-002 (Composition — `ShareLinkService`, `LinkStore`), DV-003 (Interface — `GET /s/{token}`, regenerate/import endpoints), DV-006 (Dependency).
* Related references: [Character Exchange UI Mockup](../srs/mockup_char_share_feature.jpg); SRS `project-srs-en.md`.

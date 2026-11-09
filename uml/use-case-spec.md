# Use-Case Specification — Character Exchange Feature

> Companion document to `uml/use-case-diagram.mmd`. Every **actor** is described in 1–2 lines;
> every **use case** is given with explanation, preconditions, basic/alternate flows, and postconditions.
> Requirements referenced as REQ-FUNC-* are from `srs/project-srs-en.md` (SRS v0.2).

Version 1.0 · November 2026

---

## 1. Actors

| Actor | Description (role in the system) |
|-------|----------------------------------|
| **Player** | A standard user who opens the Character Exchange modal, shares/copies the link to the *active* character, and imports another player's character by pasted URL. |
| **GM / Party member** | A power user who opens a shared link directly in the browser to view a character and frequently imports multiple party sheets for campaign management. |

> Relationship note: the **GM / Party member** actor is a specialized kind of visiting reader — it
> reaches the system through a browser by following a share link (UC-8) and performs bulk imports (UC-5).

---

## 2. Use Cases — Overview

| ID | Use Case | Primary Actor | Requirements |
|----|----------|---------------|--------------|
| UC-1 | Open Character Exchange Modal | Player | REQ-FUNC-003, REQ-INT-001 |
| UC-2 | Display Share Link | Player | REQ-FUNC-001 |
| UC-3 | Copy Link to Clipboard | Player | REQ-FUNC-002 |
| UC-4 | Regenerate / Invalidate Share Link | Player | REQ-FUNC-002 (invalidation) |
| UC-5 | Import Character by URL | Player, GM / Party member | REQ-FUNC-004, REQ-SEC-001 |
| UC-6 | Display Character Summary | Player | REQ-FUNC-003 |
| UC-7 | Close Modal | Player | REQ-FUNC-005 |
| UC-8 | Open Shared Character Link | GM / Party member | REQ-FUNC-001 (browser nav) |
| UC-9 | Handle Import Errors | Player, GM / Party member | REQ-FUNC-004, REQ-SEC-001 |

**`include` relationships:**

* `UC-2 Display Share Link` ⟶ **include** ⟶ `UC-6 Display Character Summary`
* `UC-3 Copy Link to Clipboard` ⟶ **include** ⟶ `UC-2 Display Share Link`
* `UC-4 Regenerate / Invalidate Share Link` ⟶ **include** ⟶ `UC-2 Display Share Link`

**`extend` relationship:**

* `UC-9 Handle Import Errors` ⟶ **extend** ⟶ `UC-5 Import Character by URL` (on error: "Link expired" 404/410, "Invalid URL" 400).

---

## 3. Use-Case Descriptions

### UC-1 — Open Character Exchange Modal

* **Explanation:** The player clicks the exchange button on the character sheet; the system opens the modal and loads the active character's share link and summary.
* **Preconditions:** A character is open (active) in the sheet; the backend exposes an active share link.
* **Basic flow of events:**
  1. Player clicks the *Exchange* button.
  2. System renders the modal overlay (dark theme) — `CharacterExchangeModal`.
  3. System requests the active share link from `POST /api/v1/characters/{id}/share-link`.
  4. System displays the returned URL (readonly) and the character summary card.
* **Alternate flows:** Backend returns no active link → system generates one (see UC-4 path). Backend unavailable → inline error.
* **Postconditions:** Modal is visible; link field (readonly) and summary card are populated; system within 200 ms (REQ-PERF-001).

### UC-2 — Display Share Link

* **Explanation:** The system shows the active character's unique short URL in a read-only field so the user cannot accidentally modify it.
* **Preconditions:** The modal is open; a share link exists/generated for the active character.
* **Basic flow of events:**
  1. System fetches current link (or uses the one from UC-1).
  2. System renders the URL into a `readonly` input.
  3. System also renders the summary card (`include` UC-6).
* **Alternate flows:** No active link → new link generated (UC-4) and displayed.
* **Postconditions:** A correctly formatted link (≤ 50 chars) is visible and read-only.
* **Requirements:** REQ-FUNC-001.

### UC-3 — Copy Link to Clipboard

* **Explanation:** The player clicks *Copy*; the system saves the visible URL to the system clipboard and gives feedback.
* **Preconditions:** The link is displayed (UC-2) in a secure (HTTPS) context with `navigator.clipboard`.
* **Basic flow of events:**
  1. Player clicks *Copy* (`Копировать`).
  2. System reads the displayed URL (`include` UC-2).
  3. System calls `navigator.clipboard.writeText(url)`.
  4. System shows confirmation ("Copied!", button feedback).
* **Alternate flows:** Clipboard API unavailable/denied → inline fallback message.
* **Postconditions:** URL is on the system clipboard; user received visual confirmation.
* **Requirements:** REQ-FUNC-002.

### UC-4 — Regenerate / Invalidate Share Link

* **Explanation:** The player requests a new link; the old link is immediately revoked server-side.
* **Preconditions:** The modal is open; an active link exists.
* **Basic flow of events:**
  1. Player clicks *Regenerate*.
  2. System calls `POST /api/v1/characters/{id}/share-link/regenerate`.
  3. Backend (`ShareLinkService`) sets old token `revoked = true` and inserts a new one.
  4. System displays the new link (`include` UC-2).
* **Alternate flows:** Old link opened afterward → `GET /s/{token}` returns `410 Gone`.
* **Postconditions:** A new active link is displayed; the previous link is invalid (resolves to `410 Gone`).
* **Requirements:** REQ-FUNC-002 (invalidation), REQ-SEC-001.

### UC-5 — Import Character by URL

* **Explanation:** The player pastes another player's share URL and clicks *Load*; the system validates and fetches the character.
* **Preconditions:** The modal is open; an import URL is pasted.
* **Basic flow of events:**
  1. Player pastes a URL and clicks *Load* (`Загрузить`).
  2. System validates the URL client-side against the origin whitelist.
  3. System calls `POST /api/v1/characters/import` with `{url}`.
  4. Backend re-validates (SSRF guard) and resolves the token via `ShareLinkResolver`.
  5. System renders the imported character.
* **Alternate flows:** Invalid URL → localStorage/inline `400` message; dead/revoked link → inline `404/410` "Link expired".
* **Postconditions:** Valid URL → imported character loaded; otherwise an inline error is shown and the modal state is unchanged.
* **Requirements:** REQ-FUNC-004, REQ-SEC-001.

### UC-6 — Display Character Summary

* **Explanation:** The system renders Avatar, Name, Race, Class, Level, current/max HP, current/max MP for the active character to prevent sharing the wrong sheet.
* **Preconditions:** Modal open; active character data available.
* **Basic flow of events:** System renders the 7 data points from the active character state into the summary card.
* **Alternate flows:** Missing optional fields (e.g. no avatar) → placeholders.
* **Postconditions:** All 7 data points rendered accurately.
* **Requirements:** REQ-FUNC-003.

### UC-7 — Close Modal

* **Explanation:** The player dismisses the modal via *Close* (red outline) or the *X* icon.
* **Preconditions:** The modal is open.
* **Basic flow of events:**
  1. Player clicks *Close* or *X*.
  2. If no import is in progress, system closes the modal without saving state changes.
  3. If an import is in progress, it is completed or aborted before closing.
* **Postconditions:** The modal is closed; no unintended state persisted.
* **Requirements:** REQ-FUNC-005.

### UC-8 — Open Shared Character Link

* **Explanation:** A GM/party member follows a share link in the browser to view the character in view mode.
* **Preconditions:** A share link exists; the browser requests `GET /s/{token}`.
* **Basic flow of events:**
  1. Actor enters/opens `https://rpg.app/s/{token}` in the address bar.
  2. `ShareLinkService` resolves the token via `LinkStore`.
  3. On success: serves `302 → /characters/{id}` (view mode).
  4. On revoked token: `410 Gone` → landing shows "Link expired".
  5. On unknown token: `404`.
* **Postconditions:** The visitor sees the character in view mode, or an appropriate error.
* **Requirements:** REQ-FUNC-001 (browser navigation), REQ-SEC-001.

---

### UC-9 — Handle Import Errors

* **Explanation:** When an import URL is invalid, revoked, or unknown, the system surfaces an inline, localized error and leaves the modal state unchanged.
* **Preconditions:** The modal is open; the *Load* action of UC-5 has been triggered.
* **Basic flow of events:**
  1. System detects an error during UC-5 (client whitelist check or token resolution).
  2. System maps the error to a message: `400` "Invalid URL", `404`/`410` "Link expired".
  3. System shows the inline error beside the import input.
* **Alternate flows:** Transient network error → generic retry-able message.
* **Postconditions:** Error is visible inline; no partial character is rendered; the modal can retry or close.
* **Requirements:** REQ-FUNC-004, REQ-SEC-001.

---

## 4. Cross-reference

* Diagram: `uml/use-case-diagram.mmd`
* Glossary: `uml/glossary.md`
* Supplementary spec: `uml/supplementary-spec.md`
* SDD design elements: DV-001 (Context), DV-003 (Interface), DV-004 (Interaction), DV-005 (State Dynamics)
# Software Design Description
## For Character Exchange UI Feature

Version 0.1  
Prepared by AI Assistant  
RPG Character Sheet App Team  
October 28, 2026

## Table of Contents
<!-- TOC -->
* [1. Introduction](#1-introduction)
  * [1.1 Document Purpose](#11-document-purpose)
  * [1.2 Subject Scope](#12-subject-scope)
  * [1.3 Definitions, Acronyms, and Abbreviations](#13-definitions-acronyms-and-abbreviations)
  * [1.4 References](#14-references)
  * [1.5 Document Overview](#15-document-overview)
* [2. Design Overview](#2-design-overview)
  * [2.1 Stakeholder Concerns](#21-stakeholder-concerns)
  * [2.2 Selected Viewpoints](#22-selected-viewpoints)
* [3. Design Views](#3-design-views)
  * [3.1 Priority Ranking](#31-priority-ranking)
  * [3.2 DV-001 Context](#32-dv-001-context)
  * [3.3 DV-002 Composition](#33-dv-002-composition)
  * [3.4 DV-003 Interface](#34-dv-003-interface)
  * [3.5 DV-004 Interaction](#35-dv-004-interaction)
  * [3.6 DV-005 State Dynamics](#36-dv-005-state-dynamics)
  * [3.7 DV-006 Dependency](#37-dv-006-dependency)
* [4. Decisions](#4-decisions)
* [5. Appendixes](#5-appendixes)
<!-- TOC -->

## Revision History

| Name | Date | Reason For Changes | Version |
|------|------|--------------------|---------|
| AI Assistant | 2026-10-28 | Initial design based on SRS v0.2 (project-srs-en.md) | 0.1 |

## 1. Introduction

This section provides an overview of the document and orients the reader to the system being designed.

### 1.1 Document Purpose

This Software Design Description (SDD) defines **how** the Character Exchange feature of the RPG Character Sheet Application is built: its component structure, key interfaces, interaction flows, and state dynamics. The intended audiences are frontend and backend engineers, architects, and QA testers, who use this document to implement the feature, review architecture decisions, and plan tests.

### 1.2 Subject Scope

The design covers the "Character Exchange" modal window of the RPG Character Sheet Application, target release v1.2. It includes the modal UI, the share-link and import services on the backend, and the short-link endpoint. Out of scope: authentication/authorization infrastructure, the general character sheet rendering, and release infrastructure, which are covered by the application-level documents.

The feature builds on the authoritative requirements defined in `srs/project-srs-en.md` (SRS v0.2).

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|--------------------------------------------------------------------------------------------------------------------------|
| SRS  | Software Requirements Specification — documents what the system shall do (see `srs/project-srs-en.md`) |
| SDD  | Software Design Description — documents how the system is built (this document) |
| ADR  | Architecture Decision Record — documents a justified architectural choice (see `adr/adr-template.md`) |
| API  | Application Programming Interface — a set of definitions and protocols for building and integrating application software |
| HP / MP | Hit Points / Mana Points — standard RPG metrics for health and magical energy |
| UI  | User Interface — the visual part of an application through which a user interacts with it |
| URL | Uniform Resource Locator — a reference to a web resource |
| token | The opaque short identifier embedded in a share URL, mapped to a character server-side |

### 1.4 References

| # | Reference | Type |
|---|-----------|------|
| 1 | SRS v0.2 — `srs/project-srs-en.md` (requirements for Character Exchange UI) | Normative |
| 2 | ARD-001 — `adr/adr-template.md` (opaque short tokens for share links) | Normative |
| 3 | Design mockup — `srs/mockup_char_share_feature.jpg` | Informative |
| 4 | Global App Style Guide v2.1 (flat dark theme, red accents) | Normative |

### 1.5 Document Overview

Section 2 describes stakeholder concerns and the viewpoints chosen to address them. Section 3 contains the design views (DV-001 ... DV-006), each traced to the SRS requirements it implements, with feature priorities ranked from 10 (highest) to 50 (minimum). Section 4 summarizes architectural decisions, and Section 5 lists appendixes. Revisions are tracked in the Revision History table above.

## 2. Design Overview

This section describes the nature and approach of the system architecture and design.

### 2.1 Stakeholder Concerns

| Stakeholder | Main Concern | Addressed by |
|-------------|--------------|--------------|
| Players | Quick, error-free sharing/copying of the correct character | DV-001, DV-004, DV-005 |
| Dungeon Masters | Bulk import of party sheets, reliability | DV-001, DV-004 |
| Backend Engineers | Short/deterministic link scheme, revocability, security | ADR-001, DV-002, DV-003 |
| Frontend Engineers | Component layout matching the mockup, state handling | DV-002, DV-005 |
| QA | Testability of copy, regeneration, import validation | DV-003, DV-004, DV-006 |

### 2.2 Selected Viewpoints

The following viewpoints (per ISO/IEC/IEEE 42010) are instantiated as views in Section 3:

| Viewpoint | Addresses | View |
|-----------|-----------|------|
| **Context** | System boundaries, external actors, offered services | DV-001 |
| **Composition** | Major components and how they are organized | DV-002 |
| **Interface** | Externally visible contracts (API) between components | DV-003 |
| **Interaction** | Runtime message flows (happy/failure paths) | DV-004 |
| **State Dynamics** | Modal and token states and transitions | DV-005 |
| **Dependency** | Directional "uses/requires" relationships | DV-006 |

Viewpoints from the SDD template that are not instantiated (Physical, Algorithm, Concurrency, Patterns, Resources, Deployment, Information, Structure, Logical) are out of scope for this small UI feature and are covered by the application-level architecture.

## 3. Design Views

### 3.1 Priority Ranking

Priority of developed functionality ranked from 10 (highest) to 50 (minimum), per SRS v0.2.

| Priority | Requirement(s) | Functionality |
|----------|----------------|---------------|
| 10 | REQ-FUNC-001, REQ-FUNC-002 | Display the active character's unique link; copy to clipboard |
| 20 | REQ-SEC-001, REQ-FUNC-004 (validation) | Client-side URL validation and server-side import sanitization |
| 30 | REQ-FUNC-004 | Import another player's character by pasted URL |
| 40 | REQ-FUNC-003, REQ-FUNC-005, REQ-INT-001 | Character summary card; modal open/close; visual design per mockup |
| 50 | REQ-PERF-001, REQ-INST-001 | Modal render performance (≤ 200 ms); localization support |

### 3.2 DV-001 Context

- **ID:** DV-001-Context
- **Title:** Character Exchange system boundary
- **Viewpoint:** Context
- **Representation**: The Character Exchange sub-system is a client-server component of the RPG Character Sheet Application. External actors: **Player** (opens the modal, copies/shares/imports a character) and **GM / party member** (opens a shared link directly in a browser). The sub-system offers the services: *generate share link*, *regenerate/invalidate link*, *copy link*, *import by URL*, *open shared character*.
- **SRS Requirements:** REQ-FUNC-001, REQ-FUNC-002, REQ-FUNC-004
- **Decision:** ADR-001
- **More Information:** Boundary excludes identity/authentication; the link store is owned by this sub-system.

### 3.3 DV-002 Composition

- **ID:** DV-002-Composition
- **Title:** Component breakdown
- **Viewpoint:** Composition
- **Representation (logical decomposition):**
  - `CharacterExchangeModal` (frontend) — modal shell: summary card, link field, Copy / Close / X controls, Import input + Load button.
  - `ShareLinkManager` (frontend) — calls share-link/regenerate endpoints, invokes `navigator.clipboard.writeText`.
  - `ImportController` (backend) — validates and proxies import URLs, calls `ShareLinkResolver`.
  - `ShareLinkService` (backend) — issues, stores, and revokes tokens; resolves `GET /s/{token}` to a character.
  - `LinkStore` (persistence) — `share_links` table: `token_hash (PK)`, `character_id`, `revoked`, `created_at`.
- **SRS Requirements:** REQ-FUNC-001, REQ-FUNC-002, REQ-FUNC-004
- **Decision:** ADR-001
- **More Information:** Frontend consumes the same dark-theme design system; no third-party modal library required.

### 3.4 DV-003 Interface

- **ID:** DV-003-Interface
- **Title:** API contracts
- **Viewpoint:** Interface
- **Representation:**

  | Endpoint | Method | Request | Response |
  |----------|--------|---------|----------|
  | `/api/v1/characters/{id}/share-link` | POST | — | `200 {url}` (active link) |
  | `/api/v1/characters/{id}/share-link/regenerate` | POST | — | `200 {url}` (new active link; previous revoked) |
  | `/s/{token}` | GET | — | `302 → /characters/{id}`; `404` unknown; `410` revoked |
  | `/api/v1/characters/import` | POST | `{url}` | `200 {character}`; `400` invalid URL; `404/410` dead link |

  Invariants: generated full URL ≤ 50 characters; import URLs must belong to the application's allowed origin (validated on the client against a whitelist and re-validated on the server, preventing SSRF — REQ-SEC-001).
- **SRS Requirements:** REQ-FUNC-002, REQ-FUNC-004, REQ-SEC-001
- **Decision:** ADR-001
- **More Information:** Clipboard uses the secure-context `navigator.clipboard` API; no cookies beyond the app session.

### 3.5 DV-004 Interaction

- **ID:** DV-004-Interaction
- **Title:** Runtime message flows
- **Viewpoint:** Interaction
- **Representation (sequence, happy path):**
  1. Player clicks *Exchange* → modal opens → frontend requests `POST /share-link` → `LinkStore` returns active token → modal renders summary + link field.
  2. Player clicks *Copy* → `navigator.clipboard.writeText(url)` → button feedback ("Copied!").
  3. Player clicks *Regenerate* → `POST /regenerate` → old token flagged `revoked`, new URL rendered.
  4. **Failure path:** another player opens an old link → `GET /s/{token}` → `410 Gone` → modal/landing shows "Link expired".
  5. Player pastes a link and clicks *Load* → client whitelist check → `POST /import` → server resolves token → returns `{character}` or error; on `400/404/410` the input shows an inline error.
- **SRS Requirements:** REQ-FUNC-001 … REQ-FUNC-005, REQ-SEC-001
- **Decision:** ADR-001
- **More Information:** All flows are localizable via the i18n framework (REQ-INST-001).

### 3.6 DV-005 State Dynamics

- **ID:** DV-005-StateDynamics
- **Title:** Modal and link states
- **Viewpoint:** State Dynamics
- **Representation (state transition table):**

  | State | Trigger | Next state / action |
  |-------|---------|---------------------|
  | Closed | click *Exchange* | Opening → Ready |
  | Ready | link loaded | display summary + URL (readonly) |
  | Ready | click *Copy* | Copied (feedback) → Ready |
  | Ready | click *Regenerate* | Regenerating → Ready (new URL, old revoked) |
  | Ready | click *Load* (valid URL) | Importing → Imported (character loaded) / Error |
  | Ready/Importing | click *Close* or X | Closed (no state changes unless an import is in progress) |
  | Active (token) | regenerate issued | Revoked (old) |
  | Revoked (token) | `GET /s/{token}` | `410 Gone` |

- **SRS Requirements:** REQ-FUNC-001, REQ-FUNC-002, REQ-FUNC-004, REQ-FUNC-005
- **Decision:** ADR-001
- **More Information:** Modal close is stateless except when an import is in progress (import completes or is aborted before close).

### 3.7 DV-006 Dependency

- **ID:** DV-006-Dependency
- **Title:** Component dependencies
- **Viewpoint:** Dependency
- **Representation (directional, "uses"):**

  ```text
  CharacterExchangeModal ──uses──► ShareLinkManager ──uses──► POST /api/v1/characters/{id}/share-link
  CharacterExchangeModal ──uses──► ImportController (POST /api/v1/characters/import)
  ImportController ──uses──► ShareLinkResolver ──uses──► LinkStore
  ShareLinkService ──uses──► LinkStore          (issue / revoke / resolve tokens)
  Browser ├──uses──► navigator.clipboard       (copy)
          └──uses──► GET /s/{token}            (direct navigation)
  ```

  No cyclic dependencies; `LinkStore` is the single-owned persistence element. Security-critical import path depends only on the whitelist validator and `ShareLinkResolver`.
- **SRS Requirements:** REQ-FUNC-004, REQ-SEC-001, REQ-PERF-001
- **Decision:** ADR-001
- **More Information:** Adding or removing a backend endpoint ripples only through `ShareLinkManager` and `ImportController`.

## 4. Decisions

| ID | Title | Outcome / Reference |
|----|-------|---------------------|
| ADR-001 | Share-link scheme | Use server-generated opaque short tokens stored in `LinkStore` (see `adr/adr-template.md`) |

## 5. Appendixes

- **Appendix A:** Design mockup — `srs/mockup_char_share_feature.jpg`.
- **Appendix B:** Traceability summary — every SRS requirement in Section 3 of the SRS is implemented by DV-001 … DV-006 above; priorities are listed in Section 3.1.

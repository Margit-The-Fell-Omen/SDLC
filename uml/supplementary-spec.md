# Supplementary Specification — Character Exchange Feature

> Additional/supplementary specifications (SSC) that are global, non-functional, or do not
> fit cleanly into a single use case for the **Character Exchange** modal of the RPG
> Character Sheet Application. Standalone artifact referenced from `uml/README.md` and the SDD.
> Traceable to `srs/project-srs-en.md` (SRS v0.2).

Version 1.0 · November 2026

---

## 1. Usability

* U-1. The modal shall render and display the character summary within **200 ms** of the user triggering it (SRS REQ-PERF-001).
* U-2. All modal copy and action buttons shall provide immediate visual feedback (e.g. button label changes to "Copied").
* U-3. The user shall be able to identify the active character at a glance via the summary card (avatar, name, race, class, level, HP, MP) to avoid sharing the wrong sheet (SRS REQ-FUNC-003).
* U-4. Error states (invalid/expired link, network failure) shall be shown inline next to the relevant control, never as silent failures.

## 2. Reliability

* R-1. An import that is in progress must either complete or be cleanly aborted before the modal closes; closing while importing must not corrupt session state (SDD DV-005).
* R-2. Revoked links must consistently resolve to `410 Gone`; unknown tokens to `404`, and active tokens to `302 → /characters/{id}`.

## 3. Performance

* P-1. Full generated share URL must not exceed **50 characters** (SRS REQ-FUNC-001 acceptance criterion).
* P-2. Share-link resolution is a single indexed lookup and must be a low-latency round trip (ADR-001).

## 4. Supportability / Maintainability

* S-1. All model files use textual UML (Mermaid `.mmd`), so diagrams are diffable, reviewable in PRs, and rendered natively by GitHub/GitLab or the Mermaid CLI; see `uml/README.md`.
* S-2. Glossary and supplementary specification are kept as standalone files and referenced (not duplicated) by the SDD.
* S-3. Component naming (`ShareLinkManager`, `ShareLinkService`, `ImportController`, `LinkStore`, `CharacterExchangeModal`) is consistent across SDD DV-002 and the UML model.

## 5. Security

* SEC-1. Import URLs shall be validated client-side against an origin whitelist and re-validated server-side to prevent SSRF and malicious redirects (SRS REQ-SEC-001).
* SEC-2. Share tokens shall be opaque and non-sequential to prevent enumeration of other players' characters (ADR-001, REQ-SEC-001).
* SEC-3. Clipboard operations use the secure-context `navigator.clipboard` API (requires HTTPS).

## 6. Compliance / Localization

* C-1. All hardcoded UI strings (e.g. "Обмен персонажами", "Копировать", "Загрузить", "Закрыть") shall use the i18n framework (SRS REQ-INST-001).
* C-2. Consent/attachment: no personal data beyond the character sheet is transmitted; links expose only the character, never the account identity.

## 7. Design Constraints

* DC-1. UI must match the app's flat dark theme with red accents for close/cancel actions (SRS REQ-INT-001).
* DC-2. No third-party modal library is required; `CharacterExchangeModal` uses the existing design system (SDD DV-002).

---

## Traceability

| SSC item | SRS requirement / design element |
|----------|----------------------------------|
| U-1 | REQ-PERF-001 |
| U-3 | REQ-FUNC-003 |
| P-1   | REQ-FUNC-001 criterion |
| SEC-1 | REQ-SEC-001 |
| SEC-2 | ADR-001, REQ-SEC-001 |
| C-1   | REQ-INST-001 |
| DC-1  | REQ-INT-001 |
| All   | SDD DV-001 … DV-006 |

## Cross-reference

* Glossary: `uml/glossary.md`
* Use-Case diagram: `uml/use-case-diagram.mmd`
* Use-Case specifications: `uml/use-case-spec.md`
* SDD: `sdd/project-sdd-en.md`
* SRS: `srs/project-srs-en.md`
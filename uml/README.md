# UML Dynamic-Behavior Model — Character Exchange Feature

Textual UML model of the dynamic behavior of the **Character Exchange** feature of the
RPG Character Sheet Application (target v1.2). Produced from the documentation (`srs/`,
`sdd/`, `adr/`). All diagrams are written as **textual Mermaid** (`.mmd`), per the task
requirement, so they are diffable, reviewable in PRs, and rendered natively by GitHub/GitLab
or the Mermaid CLI.

Note on notation mapping: Mermaid has **no native use-case or activity diagram** syntax, so
those two are rendered as `flowchart`s (actors + use cases, and the modal control flow
respectively); the **state** diagram uses native `stateDiagram-v2`, and the **sequence**
diagram uses native `sequenceDiagram`.

## Contents

| File | Content |
|------|---------|
| `glossary.md` | Project glossary — tabular, standalone artifact. |
| `supplementary-spec.md` | Additional / supplementary (non-functional, global) specifications. |
| `use-case-spec.md` | Actor descriptions (1–2 lines) and use-case descriptions (explanation, preconditions, flows, postconditions). |
| `use-case-diagram.mmd` | Use-Case diagram (`flowchart`) — actors and use cases with `include`/`extend` relations. |
| `activity-diagram.mmd` | Activity diagram (`flowchart`) — modal flow (open/copy/regenerate/import/close). |
| `state-diagram.mmd` | State Machine diagram (`stateDiagram-v2`) — modal (UI) and share-token lifecycle (two concurrent regions). |
| `sequence-diagram.mmd` | Sequence diagram (`sequenceDiagram`) — message flows for share/copy and import (red notation comments). |
| `README.md` | This overview, render instructions, and traceability. |

## How to render

The `.mmd` files are rendered with **Mermaid** (text → SVG/PNG):

* GitHub / GitLab render `.mmd` natively inside Markdown fenced blocks.
* Local CLI: `mmdc -i use-case-diagram.mmd -o use-case-diagram.svg` (and the other three).
* VS Code extension: "Mermaid Preview" / "Markdown Preview Mermaid Support".
  Wrap a `.mmd` file's contents in a ` ```mermaid ` fenced block (the `---title---` front
  matter can be dropped for GitHub preview).

All four diagrams start with a Mermaid `%%{init}%%` directive that forces a **white
background** (and dark node/line borders) so they stay readable on GitHub in both light and
dark themes.

The red notation comments in `sequence-diagram.mmd` use `<font color="red">` markup in note
text and `alt`/`else` labels; this renders as color in most Mermaid renderers and is
best-effort otherwise.

## How the model was built

1. **Actors & use cases** were derived from the SRS (`srs/project-srs-en.md`):
   REQ-FUNC-001 … REQ-FUNC-005, REQ-SEC-001, and the requirements doc (`srs/project-req-en.md`).
2. **Dependencies between use cases** (the `include`/`extend`) mirror the runtime flows in
   SDD DV-004 (Interaction) — e.g. *Copy* includes *Display Share Link*, *Display Share Link*
   includes *Display Character Summary*.
3. **Activity** and **State** diagrams instantiate SDD DV-005 (State Dynamics) and DV-004.
4. **Sequence** diagram maps directly to the API contracts in SDD DV-003 (Interface) and the
   components of DV-002 (Composition: `CharacterExchangeModal`, `ShareLinkManager`,
   `ImportController`, `ShareLinkService`, `LinkStore`).

## Traceability

| UML artifact | SDD design element | SRS / ADR |
|--------------|--------------------|-----------|
| Use-Case diagram | DV-001 Context, DV-003 Interface | REQ-FUNC-001…005, REQ-SEC-001 |
| Activity diagram | DV-004 Interaction | REQ-FUNC-001…005 |
| State diagram | DV-005 State Dynamics | REQ-FUNC-002, REQ-FUNC-005, ADR-001 |
| Sequence diagram | DV-004 Interaction, DV-003 Interface | REQ-FUNC-002, REQ-FUNC-004, REQ-SEC-001 |

Glossary and supplementary specifications feed SDD §1.3 (Definitions) and the quality/security
attributes; see `sdd/project-sdd-en.md` and `adr/project-adr-en.md`.
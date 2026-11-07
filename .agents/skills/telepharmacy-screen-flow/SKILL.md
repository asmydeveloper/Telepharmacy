---
name: telepharmacy-screen-flow
description: Add or change Telepharmacy screens and flows in this repository, including screen codes, domain grouping, and review-case buttons in /screens.
---

# Telepharmacy screen flow

Use for screen and flow changes in this project.

- Inspect the runtime registry in `public/runtime/customer.js` or `public/runtime/console.js` before choosing a screen code. Keep an existing screen's code; allocate a unique code for a new screen or sheet. Preserve existing state suffixes and append new cases.
- Reuse the appropriate domain group from `/screens`: start, before, during, after, account, edge. Create a new flow group/folder only when the feature has a distinct purpose; otherwise place it beside related screens.
- Register screens with `TP.screen` and sheets with `TP.sheetDef` (staff uses its existing registry). Add actual actionable `states` for the meaningful cases the screen supports, including unavailable/empty/error states when applicable. These produce the case buttons in the right preview panel and `/screens`.
- Store customer screen manifests at `design-system/screens/<group>/<code>.json`, with code, screen id and case links. Each case link must open the matching live screen and state.
- Keep state fixtures separate from user edits: case previews must not persist simulated addresses, favorites or consultation choices.
- Keep form and communication choices connected to the existing flow. Selecting chat/video should carry that choice into intake and queue; do not skip the intake/consent flow or start a real call from a preview.
- Log only design and UI changes in `src/data/change-log.json`: short Thai bullets with actual affected screen codes.
- Check syntax and build. Verify the changed behavior and case links at a level appropriate to the change. Update this guidance only when the user's workflow requirements change.

- Follow the project-wide healthcare UX/UI principles in `AGENTS.md`: research relevant primary guidance before layout/flow changes, use clear first-glance hierarchy, remove unhelpful repetition, show contextual alerts, and preserve pharmacist consultation before medication purchase. Verify in the built-in Codex browser only and disclose any unverified visual/usability checks.


## Preview panel and generated specs — 7 November 2026

- The customer preview has one right-hand panel: current screen (notes and unresolved decisions), current-screen state cases, contextual pharmacist simulation, app switches, screen jump, and restart. Keep the left sidebar removed. Preserve the stage code badge and the mobile panel tab/open-close behavior.
- Read the current screen or open sheet registry at render time. Hosted internal sheets use their host for panel context. Keep permanent case suffixes tied to the original states array even when retired cases are hidden by previewEventPolicy; never renumber visible cases.
- Pharmacist simulations are contextual preview actions, not a production dashboard. Keep simulated data, app switches, restart, and autofill out of exported customer UI. Autofill stays off unless explicitly enabled; never auto-submit or auto-consent.
- Edit screen notes, wait and states in public/runtime/customer.js. docs/screen-specs.md is generated; do not edit it by hand. npm run screens:sync regenerates manifests, event guides/catalog and screen specs together. npm run screens:check must fail if any generated document is stale.
- After panel changes, run node tests/preview-panel.cjs, syntax checks, screens:check, design:check and the applicable build/tests. The panel test checks state code/manifest parity, host-sheet context, required sections, badge, simulations, mock action and retired-case hiding; it does not replace browser QA of mobile toggling, jump and restart.
- /flow embeds the actual customer screens rather than separately drawn replicas. Keep its live state links aligned with the runtime. Update flowapp.md, phamacy-dashboard.md and admin-dashboard.md for affected behavior, distinguishing preview controls from proposed production functionality.

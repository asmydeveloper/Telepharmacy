---
name: telepharmacy-screen-flow
description: Add or change Telepharmacy screens and flows in this repository, including screen codes, domain grouping, and review-case buttons in /screens.
---

# Telepharmacy screen flow

Use for screen and flow changes in this project.

- Inspect the runtime registry in `public/runtime/customer.js` or `public/runtime/console.js` before choosing a screen code. Keep an existing screen's code; allocate a unique code for a new screen or sheet. Preserve existing state suffixes and append new cases.
- Reuse the appropriate domain group from `/screens`: start, before, during, after, account, edge. Create a new flow group/folder only when the feature has a distinct purpose; otherwise place it beside related screens.
- Register screens with `TP.screen` and sheets with `TP.sheetDef` (staff uses its existing registry). Add actual actionable `states` for the meaningful cases the screen supports, including unavailable/empty/error states when applicable. These produce the case buttons in the side panel and `/screens`.
- Store customer screen manifests at `design-system/screens/<group>/<code>.json`, with code, screen id and case links. Each case link must open the matching live screen and state.
- Keep state fixtures separate from user edits: case previews must not persist simulated addresses, favorites or consultation choices.
- Keep form and communication choices connected to the existing flow. Selecting chat/video should carry that choice into intake and queue; do not skip the intake/consent flow or start a real call from a preview.
- Log only design and UI changes in `src/data/change-log.json`: short Thai bullets with actual affected screen codes.
- Check syntax and build. Verify the changed behavior and case links at a level appropriate to the change. Update this guidance only when the user's workflow requirements change.

- Follow the project-wide healthcare UX/UI principles in `AGENTS.md`: research relevant primary guidance before layout/flow changes, use clear first-glance hierarchy, remove unhelpful repetition, show contextual alerts, and preserve pharmacist consultation before medication purchase. Verify in the built-in Codex browser only and disclose any unverified visual/usability checks.

# Code maintenance and resource audit

Reviewed: 2026-11-07. No business workflow or visual redesign is included in this cleanup.

## Implemented

- Pinned Prettier with shared configuration; formatted authored JSX, JS modules and CSS under src, plus next.config.js.
- /flow defers each real UI iframe until it intersects the viewport. Loaded documents stay mounted so scrolling does not discard form edits.
- Trusted, same-origin parent messages control preview activity. Hidden/offscreen previews pause canvas requestAnimationFrame, CSS animations and order-expiry display polling. Resuming immediately reconciles the original deadline, without extending it.
- Runtime content hashes are reused between requests until source metadata changes, avoiding repeated full-file hashing for every iframe request.
- Consolidated six SHA-256-identical profile image pairs under public/assets/profiles, updated references and removed 11,757,966 duplicate bytes. The image content is unchanged.
- Removed an ignored .DS_Store. Kept dependencies, build caches and parked map/family functionality.

## Evidence

- One development server was running, with 0.0% idle CPU in the sampled process reading. This does not establish the sole cause of machine heat.
- At the top of /flow, 3 of 48 iframes loaded. After jumping to A300, 6 had loaded. An offscreen frame acquired preview-inactive; its selected checkbox survived scrolling away and back. No console errors were observed in that check.
- Build, screen registry/spec checks, design token checks, formatting checks and the new performance unit script passed.

## Formatting scope

Generated files, vendor assets and generated tokens are excluded. public/runtime/customer.js is not blanket-formatted: legacy unit harnesses extract exact source fragments. Migrate these to module imports before formatting the whole runtime. Activity/expiry code changed here is structured into readable functions.

Four CSS/code-badge assertions now tolerate whitespace and terminal semicolons while preserving their original selector and behavior checks.

## Existing test failures

Before cleanup, 25 unit scripts passed and 9 failed: case-preview.cjs, chat-order-lifecycle.cjs, checkout-coupon.cjs, health-record.cjs, history.cjs, home-addresses.cjs, home-outside-range.cjs, profile-edit.cjs and video-request.cjs. After cleanup, 26 scripts pass (including the new performance script), the same 9 still fail, and no previously passing script regressed. These require separate fixture/harness and workflow investigation. A successful build does not mean every feature passes.

## Running efficiently

Run one development server and close unused preview tabs. Initial compilation can still use significant CPU. To review without editing, use npm run build then npm run start instead of dev, after stopping the existing server or choosing a different port. Do not start duplicate servers to bypass port conflicts.

## Remaining structural work

Incrementally split customer.js into domain modules with contract tests; replace source-string extraction with direct API testing; simplify migrated JSX prop spreads when those components are touched. These larger refactors are not complete in this pass.

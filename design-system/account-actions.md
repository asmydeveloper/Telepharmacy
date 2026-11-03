# C501 / C511

C501 uses a generated 2D default avatar without upload controls and an abstract CI cover. Personal information remains editable through its menu. Asset prompts are stored next to the PNGs in public/assets/profiles.

Logout goes directly to C102, the email/phone method chooser; account history is retained.

C511 is a confirmation sheet with consequences above the field. The exact Thai keyword is required and excluded from preview autofill. Active consultations and pending orders block deletion with links to resolve the original case/order. Duplicate actions are blocked. Dismissing the sheet cancels the pending prototype callback. Failures retain data and allow retry.

accountService is a prototype adapter without a real deletion API. Retention wording refers to the privacy policy without inventing a legal duration. tests/account-actions.cjs covers routing, guards, cancellation and failure behavior. Browser QA uses Codex IAB only.

# C207 queue redesign — 2026-11-01

Sources read:
- https://www.nngroup.com/articles/virtual-queue-best-practices/ — explain queue status and what happens next, preserve a place when navigating away, prevent accidental exits, make the transition to being served clear.
- https://design-system.nhsapp.service.nhs.uk/patterns/contact-their-gp-surgery-online/ — use understandable health-task language and make replies discoverable as messages.

Local application: compact pale CI status card with actual numeric position; waiting/next/paused messages; independent notification-off message with enable action even at position 1; minimize action preserves the case; cancel remains behind the existing confirmation sheet. Do not estimate time without data. Pharmacist identity/licence and submitted symptoms remain available in separate cards. Retain the ambient canvas and smaller animated halo per user preference, respecting reduced motion; remove only the digit odometer; digits render as plain text and update through the existing queue simulation. Existing acceptance transition and urgent flags remain. One scroll container with owned page gutters; no negative-margin bottom sheet. Pharmacist-card wrapping changes are scoped to this page. Not patient-tested; visual verification requires the built-in browser.

## C201 resumable consultation card
Same sources reviewed for the homepage card. Display one current case with explicit status, branch, pharmacist identity (on-duty while waiting, assigned while consulting), submitted topic and one state-specific CTA. Position 1 says next, never zero queues. Waiting copy explains how to leave safely; notification-off copy does not promise a push. Room/idle/payment states route to the existing room, not a new consultation. No estimated time is fabricated. The white card and pale CI topic area are a local visual decision, not a validated patient test. Existing case priority remains above the invitation banner.

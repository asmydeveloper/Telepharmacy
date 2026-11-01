# Consultation ended with an unpaid medicine order

Decision: 1 November 2026. The user specified a **15-minute payment window from the time the pharmacist sends the order**. This is a product rule, not a statutory or industry-wide deadline.

## Evidence and design inference

- [Pharmacy2U: consultation fees](https://www.pharmacy2u.co.uk/help-and-support/articles/consultations-treatments/is-there-a-fee-for-my-consultation/69b7be9e119b5613cbb3a37c) distinguishes a free consultation from an optional medicine purchase. Design inference: consultation completion and order payment must be separate statuses; an unpaid/expired order does not mean the consultation failed.
- [Stripe: accept a payment](https://docs.stripe.com/payments/existing-customers?platform=web&ui=stripe-hosted) documents payment completion and asynchronous success/failure events. Design inference: production fulfillment must use verified server events, rather than treating the return page or browser countdown as payment confirmation.

## Implemented prototype behavior

| Event | Consultation | Medicine order | Customer action |
| --- | --- | --- | --- |
| Pharmacist sends order | Continues | Pending, original deadline starts | Review medicines and pay |
| Pharmacist/customer ends chat, or inactivity closes it | Closed according to the consultation outcome | Remains pending until the original deadline | Pay from home, history/summary, or the closed chat; minimized bar returns to the order |
| Reopen checkout | Unchanged | Same order and deadline | Resume payment; no new case or extension |
| Payment succeeds within the window | Remains closed if already closed | Paid | Receipt and fulfillment view |
| Original deadline passes | Unchanged | Expired | Read existing summary; ask pharmacist for a new review/order |
| Repeated success callback | Unchanged | Remains paid | No duplicate receipt or fulfillment transition |

The pending card shows a clear medicine-payment status, branch, item count, total, deadline and remaining time. Expiry disables payment for the old order. Existing chat and consultation summary remain available. No automatic reorder, prescription extension or debit occurs.

Preview controls under the screen-name badge include closed/pending payment, one minute remaining, and closed/payment expired. Corresponding room and home states are listed in `/screens`.

## Production and Flutter handoff

The current implementation is a prototype, with in-memory case/order state and a browser clock; it does not charge real money. A production service must own `issuedAt`, `expiresAt`, order identity and atomic pending/paid/expired transitions. Use the payment provider's verified events, idempotency keys and transaction status; reconcile delayed successful payments even if a client timer has elapsed. Never blindly discard a bank-confirmed charge because the UI expired. Refresh the status after reconnect/app resume. A new medicine order requires pharmacist review, not a client-side timer reset.

Flutter should consume the same separate consultation and order states through a service adapter. The phone frame, preview controls and fixtures are excluded from the app handoff.

Validation: `tests/post-consult-payment.cjs` covers the 15-minute clock, closure by pharmacist/customer/inactivity, archived-case payment, no consultation recreation, duplicate success and expired-payment rejection. Browser visual QA remains unavailable when the Codex browser host cannot connect.

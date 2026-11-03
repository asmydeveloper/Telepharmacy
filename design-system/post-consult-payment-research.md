> ปรับข้อกำหนด 2026-11-02: โหมดสนทนาปิดเคสแล้วเปิดชำระรายการเดิมทันทีและกลับเข้าห้องเดิมไม่ได้ ดู [โฟลว์ปัจจุบัน](../docs/chat-order-lifecycle.md) ข้อความด้านล่างที่กล่าวถึง closed chat แบบอ่านย้อนหลังถูกแทนที่สำหรับโหมดสนทนา เวลา 15 นาทีเริ่มเมื่อเปิดหน้าชำระครั้งแรก รายการในแชทยังไม่เริ่มนับ

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

## Checkout coupon prototype · 2 November 2026

The coupon field replaces the obsolete instruction to ask the pharmacist before paying. Use a persistent label, explicit Apply/Remove buttons and inline feedback, following the project's [W3C form notification guidance](https://www.w3.org/WAI/tutorials/forms/notifications/). Keep medicine list prices unchanged; show the discount separately in the final summary, QR breakdown and receipt.

`TP.checkoutCouponAdapter.validate` currently uses **preview fixtures only**: TEST50 discounts medicine subtotal by 50 baht when subtotal is at least 100; EXPIRED50 exercises expiry; other codes are invalid. These amounts and conditions are test assumptions, not approved promotions. Discount does not reduce delivery cost; the prototype recalculates the card fee after discount. Applying twice does not stack, removal restores totals, another order does not inherit the discount, and an expired order rejects application.

Production must replace the adapter with server validation tied to order/user identity, enforce eligibility, redemption limits, expiry and atomic redemption, and return the authoritative amount and fee policy before creating a payment. No coupon service or real discount is connected. Test cases: EV-C308-coupon-valid, EV-C308-coupon-invalid, EV-C308-coupon-expired.

## Payment method cards · 2 November 2026

- [Evonet Payment Logo Centre](https://developer.evonetonline.com/docs/acceptance-marks) recommends the horizontal mark when a payment option contains one payment brand. Use the original PromptPay SVG on a white surface without recolouring; keep the Thai name and description alongside it. Card payment retains a generic card icon because accepted card schemes have not been confirmed.
- [W3C Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) specifies one selected option, labelled radios, aria-checked and arrow-key navigation. Keep the radio indicator on the right and CI selected border/background, so selection is conveyed by both shape and colour. Tab enters the selected option; arrows switch payment methods.
- Layout inference: full-width rows with a consistent artwork area, title, explanatory line and visible fee underneath reduce alignment noise and preserve Thai readability. All fees continue using the existing discounted totals calculation; no payment gateway or fee policy changed.

Latest visual choice: user supplied a Thai QR symbol and requested compact 1:1 rounded icons. Checkout now uses 48px tiles for both methods; credit/debit uses a filled CI illustration of two cards instead of the outline icon. Existing radio semantics and fee calculation remain unchanged.

# Checkout refinement — 1 November 2026

User scope: store pickup or express delivery only; no parcel shipping. Use the same medicine information and list renderer as the consultation chat. Keep the existing 15-minute order deadline.

## Research

- [GOV.UK Check answers](https://design-system.service.gov.uk/patterns/check-answers/): split review information into understandable sections, show only relevant fields, allow changes and preserve existing values. Applied as four sections: pharmacist's medicine list, collection/delivery choice, payment method, final amount.
- [Baymard Payment UX](https://baymard.com/blog/payment-ux): keep the order summary accessible on the payment step. Applied as the final amount section plus the total on the persistent payment action. Delivery cost and card fee remain visible before confirmation.

These are UX recommendations, not a medical or legal determination. The user's two fulfillment options are product policy. Cold medicines currently require pickup rather than silently using an unsupported transport service.

## Implemented

- One shared chat/checkout medicine list: picture, name, quantity, medicine type, instructions and price, from the exact order object.
- Pickup shows the dispensing branch. Express reveals address and map pin, enforces delivery range and requires a shipping quote before payment.
- Parcel/cold legacy selection values normalize to pickup; unavailable methods cannot be selected by the action handler.
- Reduced nested cards; separated sections and a smaller footer to leave more space for the form.
- Apply the existing [GOV.UK Check answers guidance](https://design-system.service.gov.uk/patterns/check-answers/) to invoice recipients by returning from saved-profile management to the same order review with its existing selections.
- History pending payments use the regular card layout with a case-bound countdown and direct checkout action. The filter strip is temporarily removed per user request. Mock pending records are dated today to sort before older fixtures.

Validation: checkout-options, history and post-consult-payment tests; token checks and production build. Only simulated payments/quotes are available. No visual browser QA is claimed when the Codex browser host is unavailable.

## แบบจำลองบัตรเครดิตผ่าน Omise

- [Omise.js](https://docs.omise.co/omise-js) จัดการข้อมูลในแบบฟอร์มบัตรและส่งโทเคนแบบใช้ครั้งเดียวให้แอป เซิร์ฟเวอร์ร้านใช้โทเคนนี้สร้างรายการชำระ
- [3-D Secure](https://docs.omise.co/3d-secure) บางรายการผ่านโดยอัตโนมัติ รายการที่ต้องยืนยันจะให้ลูกค้ายืนยันกับธนาคารผ่านขั้นตอนที่ Omise ส่งกลับมา
- [Charges API](https://docs.omise.co/charges-api) ให้เซิร์ฟเวอร์ตรวจสถานะรายการชำระก่อนเปลี่ยนสถานะคำสั่งซื้อ
- ต้นแบบแสดงแบบฟอร์มบัตรแบบอ่านอย่างเดียว ยืนยันด้วยข้อมูลจำลอง และตรวจผลจำลองโดยใช้เวลาของคำสั่งซื้อเดิม

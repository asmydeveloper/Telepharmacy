# Notification inbox · C404

User decision, 2 November 2026: remove read-status copy and Read All action; use a consistent root header, group notifications by day, and provide many preview examples.

## Evidence and design inference

[W3C headings guidance](https://www.w3.org/WAI/tutorials/page-structure/headings/) explains that headings communicate page organisation and help assistive navigation. Implement one navigation H1 and H2 headings per day, each linked to its section with aria-labelledby. This supports scanning the same day quickly; day grouping itself is a product design choice, not a W3C prescription.

Use semantic lists for notification items, with the complete row as one button and decorative icon/chevron. Newest first; interpret timestamps in Asia/Bangkok. Today/yesterday labels compare calendar dates rather than elapsed 24-hour periods; earlier days show a full date. Invalid dates go under a fallback heading without inventing a timestamp.

## Implemented scope

- All notification rows use the same visual style. No read/unread copy, read badges or bulk read action in C404. Opening a row retains internal read tracking for other existing consumers.
- Preview data: 14 neutral examples across five days, generated separately by TP.previewInbox. No medicine names, symptoms or payment amounts. Summary links identify an existing example record; history/account/address/health examples use existing routes. Opening the live inbox does not replace newly received notifications; only explicit preview selection resets fixtures.
- Existing state suffixes 1–3 retained; append many, same-day, loading and error cases. Error retry recovers the preview fixtures and empty inbox stays empty.
- Flutter: headings, lists, timestamp grouping and destination callbacks transfer to native widgets. Fixtures and preview controls are excluded. No new backend notification service, push permission or delivery guarantees are implemented.

Browser visual QA depends on Codex IAB access; source/build and grouping/action tests do not substitute for on-device usability testing.

C404 แสดงปุ่มย้อนกลับเมื่อมีประวัติหน้าต้นทาง (TP.canBack) ปุ่มล่างใช้ TP.tab ซึ่งล้าง stack จึงไม่แสดงย้อนกลับ ทดสอบทั้งสองบริบทใน tests/inbox.cjs และ back-navigation.cjs

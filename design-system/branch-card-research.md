# Compact pharmacy card — C201.14 / C212

## Sources
- [Material Design cards](https://m1.material.io/components/cards.html): cards are entry points to detailed information; keep supporting actions restrained.
- [NN/g progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/): show key attributes first and move secondary details to a deliberate next step.

## Application
- Small thumbnail beside branch name; no large image header that increases card height.
- Show branch name, consultation status, distance and queue; keep the favorite icon accessible at 44 px.
- One primary consultation action, one secondary details action.
- Move opening hours, full address, pharmacist, licences, map, phone and fee explanation to C212.
- Do not clamp critical status text or lock the card height: allow Thai text and narrow screens to wrap.
- Store picture is generated illustrative imagery, not a verified photograph of a real branch.


C212: จัดภาพรวมและสถานะคิวไว้ก่อน แยกข้อมูลติดต่อกับผู้ดูแลเป็นหัวข้อโดยใช้ gap24 ระหว่างกลุ่ม และ8–12ในกลุ่ม ใบอนุญาตร้านพับเปิดได้ คงใบประกอบเภสัชกรไว้ข้างโปรไฟล์และคง actions ท้ายแผง
อ้างอิง https://www.nngroup.com/articles/visual-hierarchy-ux-definition/ และ https://www.nngroup.com/articles/progressive-disclosure/

## C201.26 — refined store list (2026-10-31)
- Material lists https://m2.material.io/components/lists : consistent supporting visuals, primary text and secondary actions improve scanning. Use one photo column and one information column for every row; preserve distance ordering.
- NN/g proximity https://www.nngroup.com/articles/gestalt-proximity/ : keep related information closer than neighboring groups. Keep name, availability and logistics together, with 16px vertical row padding and one divider between stores.
- Application: 88px square rounded photos, name as primary text, semantic availability tag retained, distance and hours grouped in wrapping metadata. Favorite stays a separate 44px target; full row opens existing C212. Remove redundant chevron to leave more width for Thai names.
- Design hypothesis: easier comparison with fewer competing alignments; not patient-tested. No ratings, wait estimates, promotions or clinical claims were added. Closed/pause/system-off states keep their labels.

C211: reuse C201 list anatomy and proximity research above; keep the primary row action separate from the favorite toggle. Show saved count, distance ordering where known, empty state with a clear return to nearby stores, and address prompt when distance is unavailable. No direct medicine purchase or consultation bypass.

# C203: symptom selection (2026-11-01)

Primary guidance consulted:
- NHS: https://service-manual.nhs.uk/design-system/components/checkboxes — multiple answers need explicit selection controls and a select-all-that-apply instruction.
- W3C: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html — target size/spacing reduces accidental activation; the AA minimum is 24px with exceptions, not 48px.

Design decision (not a patient usability test): two equal-width columns, 48px minimum tap height, left-aligned labels and visible square check indicators. Retain shared toggle-button semantics (aria-pressed), keyboard support and selected summary; do not rely on color alone. Search removed from this short list. Separate runny nose/congestion, rash/itch and red eyes/burning eyes so selection does not assert an unreported symptom. Existing combined/custom values remain representable when revisiting a draft. Other opens a labeled field; empty summary hidden; errors and emergency warnings remain visible when applicable.

Follow-up: apply the same explicit selections to urgent symptoms. Keep the section neutral, with a red text warning and emergency phone link only when relevant; full service risks remain available in C215. Start consultations in chat, video stays available inside the room. The compact acknowledgement keeps the existing recorded acceptance/version logic; reading terms never accepts them.


## C205 emergency sheet revision (2026-11-01)

- NHS care cards: https://service-manual.nhs.uk/design-system/patterns/help-users-decide-when-and-where-to-get-care — use a clear action heading, concise symptom bullets and brief, specific content; emergency guidance directs immediate help. It distinguishes this pattern from generic warning callouts.
- NHS shortness of breath: https://www.nhs.uk/symptoms/shortness-of-breath/ — severe breathing difficulty, tight/heavy chest and sudden confusion warrant immediate emergency help. The prototype's broad symptom categories still require pharmacist/clinical review; the screen does not diagnose an emergency.
- NIEMS emergency medicine guidance: https://www.niems.go.th/th/Upload/File/255608011613371971_jbvgecEoaqYSlvaX.pdf — Thailand emergency help number 1669.

Application decision: neutral selected-symptom list, immediate-care instruction with a warning icon, one red emergency call action, then a separately bordered footer with the requested outline consultation confirmation. Red-button use is a local emergency-action convention requested by the user, not a claim that the NHS button guideline recommends red for calling. Remove conversational encouragement and the unverified promise of priority service. Keep “อย่ารอการตอบในแอป” visible. Preserve the existing urgent flag and continuation logic. This is a design proposal, not patient-tested evidence.

## C203 cover and form panel
Reuses the established C103/C104 cover and rounded panel. Decorative photo is hidden from assistive technology; all form labels, urgent advice and acknowledgement stay live HTML inside the scroll area. Fixed CTA remains outside scrolling with reserved space to avoid obscuring final fields. Existing NHS checkbox and W3C target guidance above retained; no new clinical claim. Photo does not represent an assigned pharmacist. This layout has not been patient-tested.

## Consultation mode · 2026-11-01
User adds a single-choice preference before symptom entry. Reuse native radio inputs with one shared name and a labelled group, with icon and text for both options. Selection is stored in intake.mode and transferred to the case; it does not grant camera access or start a call. The existing pharmacist video invitation flow remains the entry to an actual call.

## ข้อมูลก่อนปรึกษาตรงกับสมุดสุขภาพ (2 พ.ย. 2569)
C203 ใช้ TP.healthRecord ร่วมกับ C505 แสดงประวัติแพ้ยา ยาประจำ โรคประจำตัว แพ้อาหาร น้ำหนัก และส่วนสูงจากข้อมูลที่ผู้ใช้บันทึก ไม่แสดงผู้บันทึกเดิม แยกยังไม่ทราบกับไม่มีและคงข้อความหลายบรรทัด ใช้รายการเส้นแบ่งบางพร้อมดินสอเปิด C517 แก้เฉพาะหมวด บันทึกแล้ว refresh หน้าปัจจุบัน ไม่เปลี่ยนวิธีปรึกษาหรือข้อความอาการ ช่องพิมพ์อาการใช้พื้นขาว semantic-surface

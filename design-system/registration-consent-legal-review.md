# Registration health consent — 1 November 2026

## Implemented scope
C104 uses one unchecked checkbox for a single purpose: pharmaceutical care in the consultation requested by the patient, including related medicine safety follow-up. The eight previous labels describe data categories, not eight independent purposes. Marketing, research, unrelated analytics and consent for another family member are excluded. C115 is a read-only bottom sheet; reading or closing it does not accept consent. C507 displays the same document for accounts with the new registration consent record. Editing the form clears acceptance. An old checkbox/category set alone cannot accept a newer document.

The prototype adapter records document version, controller, purpose, categories, method and client time after successful registration. This is local prototype state, not a server audit trail or proof of legal compliance. `consentTopics` remains a compatibility representation of the scope; these flags must not be interpreted as eight independently obtained consents.

## Confirmed and missing facts
- Controller name supplied by owner: บริษัท มิตรอารีแคร์ จำกัด.
- Not confirmed: controller address, privacy contact, applicable retention schedule, actual recipients/processors, international transfer arrangements, controller roles of pharmacies, lawful basis for each processing activity, and arrangements for minors/representation.
- Existing `dpo@mitraree.com` and blanket one-year claims were not treated as verified facts and are not included in the new document.
- C115 visibly identifies the document as a draft, with missing controller details. Do not remove this status until the missing facts are supplied and the legal review is completed.

## Primary sources read
- PDPA 2019, sections 19, 20, 22, 23 and 26 and data subject rights: official-government hosted act, https://www.nangam-la.go.th/userfiles/page/19315453442522023.pdf . Consent must be explicit, purpose-specific, informed and withdrawable; the notice must identify the controller/contact and retention period or criteria. Health data is sensitive; section 26 also contains grounds/exceptions requiring assessment for professional healthcare.
- PDPC consent guidelines, published by MDES, https://mdes.go.th/uploads/tinymce/source/สคส/แนวทางการดำเนินการในการขอความยินยอม.pdf . Sections 3.1–3.6 and 5: separate consent from unrelated processing, no preselection, accessible information, withdrawal of comparable ease, and evidence of affirmative choice.

## Review before production
1. Determine whether each necessary care activity relies on explicit consent, the professional-healthcare exception under section 26, contract, or another applicable basis. Do not use consent as a substitute for analysing the actual service.
2. The current product prototype still gates signup on health consent as requested. Whether account creation must be separated from optional health-data consent needs review before production; unrelated processing must not be a signup condition.
3. Supply actual controller contact/address, retention criteria, recipients, processor contracts and transfer safeguards. Align the full privacy notice with this document. The new document is not a substitute for that notice.
4. Confirm guardian/representative verification and data flows before processing minors' or family members' data.
5. Build server-side versioned policy storage, consent evidence, withdrawal and rights handling. Review legacy C105/C106/C508 and other older consent copy for consistency; this task does not certify those legacy flows.

## Verification
Unit checks cover a single registration checkbox, no checkboxes in C115, no acceptance on read, current-version gating, unchecking, registration adapter metadata, and marketing staying off. Browser/assistive technology verification remains unavailable because the Codex browser host cannot connect.

## Consolidation, 1 November 2026 (latest codes)
C105 signup/read more C107, and C506 account consent/read more C507 now share a single draft-2 document. Legacy C109 consent screen is removed; former declines page becomes C109, Face ID C110, terms C111, intro C112. All live consent routes point to C506; opening the document cannot accept it. Added consultation records, delivery/payment purpose boundary, limited recipients, consultation/follow-up/notification details and the branch contact directory at the very end. Actual processor locations/notification payloads/video recording policies remain to be confirmed; these are expressed as obligations/conditions rather than unverified operating claims. No invented DPO address or blanket statutory one-year retention carried forward. Branch contacts are existing prototype branch data, not a verified controller privacy channel. Account rejection and withdrawal preserve a route to read and reconsider; reconsent requires an unchecked native checkbox plus explicit confirmation. Existing accepted-version 3 requires current prototype version 4.
Re-read PDPC guidelines on MDES official site, sections 3.1–3.6 on informed specific freely given consent and withdrawal. The document remains a draft pending the previously listed facts; consolidation does not certify production compliance.

## ข่าวสารและสิทธิพิเศษ — 1 พฤศจิกายน 2569
- C105 เหลือกล่องสุขภาพด้านในและกล่องข่าวสารแยกกัน ไม่มีการเลือกข่าวสารล่วงหน้า และไม่ใช้เป็นเงื่อนไขสมัคร
- C113 อ่านอย่างเดียว แจ้งชื่อ/ช่องทางที่ยืนยัน วัตถุประสงค์ อีเมลหรือ SMS สิทธิถอน และแยกข้อความบริการออกจากการตลาด ไม่ใช้ข้อมูลสุขภาพจัดกลุ่มโฆษณา
- เก็บผลการเลือก เวอร์ชัน วิธี เวลา และช่องทางใน prototype adapter; ยังไม่เชื่อมระบบส่งข่าวสารจริง
- ยึดหลักความยินยอมแยกวัตถุประสงค์ สมัครใจ และถอนง่ายจากแนวทาง PDPC: https://mdes.go.th/uploads/tinymce/source/สคส/แนวทางการดำเนินการในการขอความยินยอม.pdf
- เอกสารยังเป็นฉบับร่าง รอยืนยันที่อยู่/ช่องทางใช้สิทธิ ผู้รับข้อมูล และ retention ก่อนใช้จริง

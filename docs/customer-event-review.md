# Customer event review — 7 November 2026

Reviewed against dev commit 9337e7c. Pulled origin/dev (already current). Changes remain uncommitted for review.

## Scope and implementation

105 cases are retired using enabled=false; their positions and state keys remain reserved. No existing cases were renumbered. C103, C104 and C113 were left unchanged. Legacy parcel handlers are guarded rather than offered in checkout. Current customer fulfillment choices are pickup and express only; no cold-chain or carrier-selection feature was added. No family, map or C506–C508 flow was restored.

The preview panel, /screens, generated guides/specs and /flow exclude retired choices. New login cases were appended as C102.13 (filled) and C102.14 (service error). /flow now uses live C303 instead of the retired provider-ready card and no longer offers completed fulfillment as a home-card fixture.

## Fixed visible behavior

- C102.2 inline invalid credentials; C102.3 signed-out notice with 30-day session copy; C102.13 filled credentials; C102.14 service failure. Notes reference C102, not removed C109.
- C201.39/.40 quick consultation explains busy/unknown queue. Unknown distance remains unknown, not outside coverage. C212.4 describes unknown distance; appended C212.9 covers a known distance outside 15 km.
- C207.4 uses an exported queue danger helper, fixing the undefined reference. C207.5 shows notifications-off notice with a working enable action.
- C405.3/.4 show distinct follow-up answer/end-only information.
- C501 logout opens C510. C510 copy follows email/password and Google authentication, not phone OTP.
- C511.6 remains in the deletion sheet and shows service failure instead of completing deletion.
- C203.11 displays an explicit inline error. C515.3 now has invalid address fields and keeps validation messages after asynchronous address options load. C518.4 mounts its address loader and exposes retry.
- C105 date-wheel duplicates and obsolete partial-consent/text-list variants were retired only after comparing mounted behavior. C105.22 is labelled as the current free-text condition entry.
- C201/C212 store distance and status labels, staff queue labels and muted text tokens were aligned. Muted/secondary text uses #666666 (at least 4.5:1 on the current light surfaces); duplicate home tag styling was removed.

## Kept exceptions

- C201.44 remains: opening an active room allows its normal progression, whereas C201.54 deliberately holds the case-chat fixture. They differ after interaction even when the initial card is similar. This distinction was inspected in code; a side-by-side browser replay was not completed.
- C414.2 and C415 remain: express delivery reaches the delivered state and opens the received-medicine confirmation. Verified in the browser. Express carrier copy uses Lalamove; no Inter Express option is offered.
- C105.30/.34/.35/.36 remain for generic wheel, leap date, latest allowed date and oldest allowed date. C105.57/.59/.61 remain for sent/cooldown, expired and resend-ready phone OTP.

## Invoice card C402 / C421

C402 uses a compact checkbox header with edit/select action, a single recipient summary and an explicit request button. C421 selects from the same person/company records managed in C518, with an empty state and add form. Selection does not issue the invoice. Pending and issued states stay in C402; issued shows PDF download. No delete or unsupported email-delivery option was added to the selector. Header/helper spacing and muted background avoid nested tab sections. /flow embeds these actual screens.

## Browser checks completed

- C102.2/.3/.14, C207.4/.5 (including enable), C405.3/.4 and C511.6.
- Mounted C203.11; C308.8/.9/.10/.13; C406.4; C410.4; C515.3; C518.4 with retry.
- Mounted C105.2/.30–.36, .6/.8/.21/.26, .10/.17, .12/.13, .22/.25, .57/.59/.61 before duplicate retirement.
- C414.2 → C415, C402.5 PDF action visibility, C421 person/company empty/add/select and C402 selected-recipient details. Final screenshot: /tmp/telepharmacy-tax-card.png.

## Verification and limits

Required preview-panel, home-addresses, checkout-options and receipt-recipient-picker tests pass. screens:check and design:check pass. Syntax checks cover customer.js and address-map.js. Final format:check, git diff --check and production build pass, including static generation of /flow. An initial build caught three stale journey references (A110, A206, A221); those links were corrected and the build rerun successfully.

Eight pre-existing test suites still fail and were rerun, not hidden: case-preview and chat-order-lifecycle expect completed home fulfillment cards that the current policy hides; checkout-coupon asserts old source text pd.discount||0; history expects the old ผลการปรึกษา label; health-record and home-outside-range fail while extracting source into a fake DOM (Unexpected token }); profile-edit reports 2 versus 0; video-request's test harness lacks TP.NOW.time. case-preview now reaches its completed-card assertion rather than the earlier parcel lookup failure. These failures do not establish production readiness and need separate fixture/test-contract maintenance.

Not all 419 visible page events were clicked. No cross-browser/device usability, real authentication, payment, carrier callback or PDF filesystem integration was certified. C201.39/.40 and C501 logout were checked in source, not separately exercised in the browser during this review. Generated event guides are checklists, not QA pass records.

## Retired cases (reserved codes)

| Code | State | Previous label | Reason |
| --- | --- | --- | --- |
| C102.4 | cover | ภาพปกหน้าร้าน | Design-only, duplicate or no visible current-user state |
| C102.5 | platform-cover | ปกแพลตฟอร์มร้านยา ไม่มีคน | Design-only, duplicate or no visible current-user state |
| C102.6 | storefront-cover | ปกหน้าร้าน ตัดป้ายร้านข้างเคียง | Design-only, duplicate or no visible current-user state |
| C102.7 | no-logo-overlay | ปกหน้าร้าน ไม่มีโลโก้และกล่องทับ | Design-only, duplicate or no visible current-user state |
| C102.8 | compact-terms | ข้อกำหนดและนโยบายระยะกระชับ | Design-only, duplicate or no visible current-user state |
| C102.9 | white-fade | เฟดขาว ปุ่มสี Primary | Design-only, duplicate or no visible current-user state |
| C102.10 | white-image | ภาพปกด้านล่างขาว ไม่มีเฟด CSS | Design-only, duplicate or no visible current-user state |
| C102.11 | simple-cover | ปกไม่มีข้อความรอง | Design-only, duplicate or no visible current-user state |
| C102.12 | cover-heading | หัวข้อและคำอธิบายบรรทัดเดียว | Design-only, duplicate or no visible current-user state |
| C108.2 | email | สมัครสำเร็จด้วยอีเมล | Design-only, duplicate or no visible current-user state |
| C108.6 | full-cover | ปกเต็มจอและปุ่มใต้คำต้อนรับ | Design-only, duplicate or no visible current-user state |
| C105.20 | quick-fill | ปุ่มมอคข้อมูลใต้ป้ายชื่อหน้า | Design-only, duplicate or no visible current-user state |
| C212.5 | choose-mode | เลือกสนทนาหรือวิดีโอ | Design-only, duplicate or no visible current-user state |
| C212.6 | grouped | รายละเอียดแบ่งหมวด | Design-only, duplicate or no visible current-user state |
| C212.8 | neutral-sections | หมวดข้อมูลพื้นเทาอ่อน | Design-only, duplicate or no visible current-user state |
| C201.10 | banner-edge | แบนเนอร์เต็มขอบ | Design-only, duplicate or no visible current-user state |
| C201.11 | blue-canvas | พื้นหลังเทาอมฟ้าอ่อน | Design-only, duplicate or no visible current-user state |
| C201.12 | pharmacy-banner | ภาพร้านยาและเฟดข้อความ | Design-only, duplicate or no visible current-user state |
| C201.13 | mini-menu | มินิเมนูสุขภาพใต้แบนเนอร์ | Design-only, duplicate or no visible current-user state |
| C201.14 | compact-store | การ์ดสาขาแบบกระชับ | Design-only, duplicate or no visible current-user state |
| C201.15 | named-address | ชื่อที่อยู่และดรอปดาวน์ | Design-only, duplicate or no visible current-user state |
| C201.16 | plain-mini-menu | มินิเมนูไม่มีกรอบ | Design-only, duplicate or no visible current-user state |
| C201.17 | branch-tile | การ์ดรูปซ้ายและเลือกวิธีปรึกษา | Design-only, duplicate or no visible current-user state |
| C201.18 | white-canvas | พื้นหลังสีขาว | Design-only, duplicate or no visible current-user state |
| C201.19 | layout-system | กริดและระยะกลางทั้งแอป | Design-only, duplicate or no visible current-user state |
| C201.20 | store-list | ลิสต์ร้านยา 6 ร้าน | Design-only, duplicate or no visible current-user state |
| C201.21 | care-shortcuts | ติดตามยาและประวัติในมินิเมนู | Design-only, duplicate or no visible current-user state |
| C201.22 | figma-system | Figma tokens และ component กลาง | Design-only, duplicate or no visible current-user state |
| C201.23 | real-photos | ภาพถ่ายและรูปมุมมน | Design-only, duplicate or no visible current-user state |
| C201.24 | pastel-icons | ไอคอนภาพประกอบพาสเทล | Design-only, duplicate or no visible current-user state |
| C201.25 | banner-actions | ปุ่มแบนเนอร์เสมอกัน ไม่มี badge | Design-only, duplicate or no visible current-user state |
| C201.26 | refined-store-list | ลิสต์ร้านจัดลำดับข้อมูลใหม่ | Design-only, duplicate or no visible current-user state |
| C201.27 | distinct-store-photos | ภาพจำลองแต่ละร้านต่างกัน | Design-only, duplicate or no visible current-user state |
| C201.28 | soft-status | แท็กเปิดรับปรึกษาพื้นเขียวอ่อน | Design-only, duplicate or no visible current-user state |
| C201.29 | bear-banner | ปกหมีเภสัชกร 3D | Design-only, duplicate or no visible current-user state |
| C201.30 | banner-safe-area | ภาพปกเต็ม safe area เฟดต่อเนื่อง | Design-only, duplicate or no visible current-user state |
| C201.31 | bright-bear | หมีสดใส เฟดเฉพาะด้านบน | Design-only, duplicate or no visible current-user state |
| C201.32 | tritone-icons | ไอคอน Flat 3 สี CI | Design-only, duplicate or no visible current-user state |
| C201.33 | personal-greeting | ทักทายชื่อจริงและหัวใจขาวเต็ม | Design-only, duplicate or no visible current-user state |
| C201.34 | counter-bear | หมีอยู่หลังเคาน์เตอร์เป็นธรรมชาติ | Design-only, duplicate or no visible current-user state |
| C201.35 | soft-rounded-icons | ไอคอนมนสี CI อ่อนและแนวปุ่มที่อยู่ | Design-only, duplicate or no visible current-user state |
| C201.36 | glass-tabs | เมนูล่าง Liquid Glass | Design-only, duplicate or no visible current-user state |
| C201.37 | female-pharmacist-banner | ปกเภสัชกรหญิงหลังเคาน์เตอร์ | Design-only, duplicate or no visible current-user state |
| C201.38 | quick-consult | ปุ่มกลาง เลือกร้านว่างใกล้สุด | Design-only, duplicate or no visible current-user state |
| C201.42 | consult-banner | แบนเนอร์ชวนปรึกษาเหนือร้านยา | Design-only, duplicate or no visible current-user state |
| C201.57 | case-finished | จำลอง จบการปรึกษา | Design-only, duplicate or no visible current-user state |
| C201.58 | case-cancelled | จำลอง ยกเลิกคิว | Design-only, duplicate or no visible current-user state |
| C201.59 | case-expired | จำลอง หมดเวลารอคำตอบ | Design-only, duplicate or no visible current-user state |
| C201.64 | case-none | ไม่มีปรึกษา | Design-only, duplicate or no visible current-user state |
| C201.41 | quick-address | ปรึกษาโดยยังไม่มีที่อยู่ | Design-only, duplicate or no visible current-user state |
| C201.43 | active-next | การปรึกษา คิวถัดไป | Design-only, duplicate or no visible current-user state |
| C201.45 | active-paused | การปรึกษา พักรับคิว | Design-only, duplicate or no visible current-user state |
| C201.46 | active-payment | การปรึกษา รอชำระ | Design-only, duplicate or no visible current-user state |
| C201.47 | active-idle | การปรึกษา รอคำตอบ | Design-only, duplicate or no visible current-user state |
| C201.68 | case-delivery-delivered | จัดส่งเสร็จสิ้น | Design-only, duplicate or no visible current-user state |
| C201.71 | case-pickup-complete | รับยาที่สาขาแล้ว | Design-only, duplicate or no visible current-user state |
| C201.72 | case-parcel-preparing | จัดส่งปกติ · ร้านกำลังเตรียมยา | Retired parcel delivery |
| C201.73 | case-parcel-transit | จัดส่งปกติ · กำลังขนส่ง | Retired parcel delivery |
| C201.74 | case-parcel-out | จัดส่งปกติ · กำลังนำส่ง | Retired parcel delivery |
| C201.75 | case-parcel-delivered | จัดส่งปกติ · ส่งถึงแล้ว รอยืนยันรับยา | Retired parcel delivery |
| C203.8 | search | ตัวเลือกอาการ 2 คอลัมน์ | Design-only, duplicate or no visible current-user state |
| C203.14 | cover | ปกเล่าอาการและฟอร์มซ้อน | Design-only, duplicate or no visible current-user state |
| C207.6 | refined | รอในห้องแชท | Design-only, duplicate or no visible current-user state |
| C303.14 | provider-joined | เภสัชกรเข้าห้องแล้ว | Design-only, duplicate or no visible current-user state |
| C308.2 | parcel | จัดส่งปกติ | Design-only, duplicate or no visible current-user state |
| C308.11 | bankon | พร้อมเพย์ (แทนแอปธนาคารเดิม) | Design-only, duplicate or no visible current-user state |
| C308.12 | bankapp | QR พร้อมเพย์ (แทนแอปธนาคารเดิม) | Design-only, duplicate or no visible current-user state |
| C309.2 | parcel | จัดส่งปกติ | Design-only, duplicate or no visible current-user state |
| C309.6 | sent | ส่งพัสดุแล้ว มีเลขพัสดุ | Design-only, duplicate or no visible current-user state |
| C414.6 | prep | จัดส่งปกติ · ร้านกำลังเตรียมยา | Design-only, duplicate or no visible current-user state |
| C414.12 | out | จัดส่งปกติ · กำลังนำส่ง | Design-only, duplicate or no visible current-user state |
| C402.2 | parcel | ส่งพัสดุ จ่ายบัตร | Design-only, duplicate or no visible current-user state |
| C403.4 | self | เฉพาะตัวเอง | Design-only, duplicate or no visible current-user state |
| C403.5 | paid | ปรึกษาสำเร็จ | Design-only, duplicate or no visible current-user state |
| C403.6 | no-medication | สิ้นสุดก่อนสรุป | Design-only, duplicate or no visible current-user state |
| C403.10 | dark-filters | แท็บประเภทสี CI เข้ม | Design-only, duplicate or no visible current-user state |
| C403.11 | shared-tabs | แท็บกลาง ตัวอักษร 14px | Design-only, duplicate or no visible current-user state |
| C403.12 | store-recipient-card | หัวการ์ดร้านยา ท้ายการ์ดผู้รับการปรึกษา | Design-only, duplicate or no visible current-user state |
| C403.13 | receipt-inside | ดูใบเสร็จในใบสรุป | Design-only, duplicate or no visible current-user state |
| C403.14 | detail-rows | รายละเอียดเรียงแถวพร้อมไอคอน | Design-only, duplicate or no visible current-user state |
| C403.15 | purchase-status | ป้ายตามข้อมูลซื้อยา | Design-only, duplicate or no visible current-user state |
| C403.19 | tap-card | แตะการ์ด ไม่มีข้อความลิงก์ | Design-only, duplicate or no visible current-user state |
| C403.21 | tab-counts | จำนวนรายการในแต่ละแท็บ | Design-only, duplicate or no visible current-user state |
| C403.24 | ten-records | ประวัติ 10 รายการ หลายวันและเดือน | Design-only, duplicate or no visible current-user state |
| C403.25 | completed | ปรึกษาสำเร็จ | Design-only, duplicate or no visible current-user state |
| C403.26 | ended | สิ้นสุดก่อนสรุป | Design-only, duplicate or no visible current-user state |
| C403.29 | long-note | ข้อความปรึกษายาว แสดงไม่เกิน 3 บรรทัด | Design-only, duplicate or no visible current-user state |
| C403.20 | search-below-tabs | ช่องค้นหาอยู่ใต้แท็บ | Design-only, duplicate or no visible current-user state |
| C403.23 | search-cleared | ช่องค้นหาหลังล้างคำ | Design-only, duplicate or no visible current-user state |
| C416.2 | empty | ยังไม่มีรายงาน | Design-only, duplicate or no visible current-user state |
| C416.7 | report-statuses | ตัวอย่างสถานะรายงาน | Design-only, duplicate or no visible current-user state |
| C404.2 | read | รายการเดิม | Design-only, duplicate or no visible current-user state |
| C404.4 | many | แจ้งเตือนหลายวัน | Design-only, duplicate or no visible current-user state |
| C501.2 | profile-cover | ปกบัญชีและโปรไฟล์ตรงกลาง | Design-only, duplicate or no visible current-user state |
| C501.3 | abstract-cover | ปก Abstract CI เต็ม safe area | Design-only, duplicate or no visible current-user state |
| C501.4 | clean-profile | โปรไฟล์พื้นเทาและเมนูพื้นขาว | Design-only, duplicate or no visible current-user state |
| C505.3 | sfx | ข้อมูลเดิมที่ผู้ใช้ระบุ | Design-only, duplicate or no visible current-user state |
| C105.13 | consent-partial | ความยินยอมเก่าไม่แทนการเลือกฉบับใหม่ | Browser verified duplicate of the current text-input, address, consent or combined date-wheel form |
| C105.17 | health-no-results | ยาไม่อยู่ในลิสต์ ใช้อื่น ๆ | Browser verified duplicate of the current text-input, address, consent or combined date-wheel form |
| C105.21 | address-search | ค้นหาที่อยู่และเติมอัตโนมัติ | Browser verified duplicate of the current text-input, address, consent or combined date-wheel form |
| C105.25 | conditions-no-results | โรคที่ไม่มีในลิสต์ ใช้อื่น ๆ | Browser verified duplicate of the current text-input, address, consent or combined date-wheel form |
| C105.26 | registration-back | ย้อนกลับเพื่อแก้ไขข้อมูล | Browser verified duplicate of the current text-input, address, consent or combined date-wheel form |
| C105.31 | dob-months | วันเกิด: เลือกเดือน | Browser verified duplicate of the current text-input, address, consent or combined date-wheel form |
| C105.32 | dob-days | วันเกิด: เลือกวัน | Browser verified duplicate of the current text-input, address, consent or combined date-wheel form |
| C105.33 | dob-selected | วันเกิด: ค่าเดิม | Browser verified duplicate of the current text-input, address, consent or combined date-wheel form |

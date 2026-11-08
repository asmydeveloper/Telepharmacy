# Flow แอปลูกค้าและรายการตรวจระบบจริง

ปรับปรุง 6 พฤศจิกายน 2569 · สถานะ: เอกสารวิเคราะห์จากต้นแบบ ไม่ใช่ผลทดสอบผ่านหรือระบบที่เชื่อมต่อจริง

## ขอบเขต UI ปัจจุบัน
- C105 / C501 ยืนยันความยินยอมข้อมูลสุขภาพในขั้นสมัครเท่านั้น เอกสาร C107 เปิดอ่านได้ ไม่มีหน้าถอนหรือขอซ้ำในต้นแบบ และตัดเมนูข่าวสารและสิทธิพิเศษ
- C515 บังคับกรอกชื่อที่อยู่เมื่อเพิ่มหรือแก้ไข ตรวจชื่อว่างหรือเป็นช่องว่างล้วนโดยคงที่อยู่เดิมไว้
- C308 / C309 รับยาที่ร้านด้วยรหัสรับยา แจ้งลูกค้าเมื่อยาพร้อมรับ
- C404 ตัวอย่างแสดงเภสัชกรรับคิว มีข้อความ มีรายการยารอชำระ ชำระแล้ว ยาพร้อมรับ กำลังจัดส่ง ส่งสำเร็จ และใบสรุปพร้อม แบ่งตามวัน แสดงหัวข้อและเวลา รายละเอียดอยู่ในหน้าที่เปิดจากรายการ
- C410 แตะกล่องเวลาทั้งกล่องเพื่อเปิดตัวเลือกชั่วโมงและนาทีแบบลอยใต้ช่อง กล่องลอยกะทัดรัด จัดหัวข้อและตัวเลขกึ่งกลางในสองคอลัมน์แนวตั้ง (ชั่วโมง 01–23 แล้ว 00 นาที 00–59) บันทึกเมื่อเลือกเวลาครบและเรียงตามมื้อ ตรวจการปิดตัวเลือก การยกเลิก และการกลับมาเห็นค่าที่บันทึก

## วิธีใช้และขอบเขต
- ทะเบียนท้ายเอกสารดึงจาก `public/preview/events/catalog.json` ในต้นแบบ ณ วันที่ระบุ เป็นรายการที่มี fixture ไม่ได้ยืนยันว่า API หรือทุกสถานการณ์จริงทำงานแล้ว ตรวจคู่กับ [ทะเบียนเหตุการณ์](public/preview/events/README.md), [APP-HANDOFF](APP-HANDOFF.md) และหน้าพรีวิว
- `[มีต้นแบบ]` หมายถึงมีหน้า/เหตุการณ์จำลอง; `[ต้องทำ]` หมายถึงข้อเสนอที่ยังต้องออกแบบ พัฒนาและทดสอบ; `[ต้องยืนยัน]` คือกติกาธุรกิจหรือข้อมูลจริงที่ยังไม่ตกลง อย่าตีความข้อความจำลองเป็นข้อกำหนดกฎหมายหรือคำแนะนำทางยา
- เมื่อเพิ่ม ลด หรือเปลี่ยนหน้า/สถานะ ให้อัปเดตทั้งสามเอกสารนี้ ตรวจผลกระทบข้ามฝั่ง ใช้รหัสเหตุการณ์เดิม และอัปเดตทะเบียนด้วย `npm run screens:sync`; ตรวจด้วย `npm run screens:check` แล้วทดสอบ action จริง
- ขอบเขตปัจจุบัน: ผู้สมัครคนเดียว; พักฟีเจอร์ครอบครัวและแผนที่; ต้องปรึกษาเภสัชกรก่อนซื้อยา; ลูกค้าเลือกแชทหรือวิดีโอ; วิธีรับยาปัจจุบันคือรับที่ร้านหรือส่งด่วน

## Flow และรายการตรวจตามจุดเปลี่ยน
1. **เริ่มใช้/บัญชี** — เปิดแอป → เข้าสู่ระบบเบอร์หรืออีเมล → ยืนยัน OTP → สมัคร → ยินยอมข้อมูลสุขภาพอย่างชัดแจ้ง → หน้าแรก. ตรวจ OTP ผิด/หมดอายุ/ขอใหม่/จำกัดครั้ง, บัญชีเดิม/ใหม่, อายุ, ข้อมูลบังคับ, ยกเลิกกลับมาแล้วร่างไม่หาย, ระบบล่ม/เน็ตหลุด/กดซ้ำ. `[ต้องทำ]` บันทึก consent version เวลา ผู้รับผิดชอบและช่องทางด้วย backend จริง
2. **หน้าแรกและค้นหาร้าน** — ไม่มีเคสเริ่มต้น; ที่อยู่หลัก/ไม่มีที่อยู่/แก้ที่อยู่, ร้านเปิด/ปิด/พักคิว, ระยะบริการ/ไม่ทราบตำแหน่ง, โหลด/ว่าง/ล้มเหลว. เคสกำลังดำเนินอยู่แสดงการ์ดที่เหมาะกับสถานะ ไม่แสดงรหัสเคสในห้องคุยหรือการ์ดที่กำลังดำเนินการ
3. **เริ่มปรึกษา** — เลือกสาขาและโหมด → อาการ/รูป/ข้อมูลสุขภาพ → เตือนอาการเร่งด่วน → ยืนยัน → เข้าคิว. ตรวจไม่กรอก/อัปโหลดผิด/ยกเลิก/รับคิวซ้ำ/สาขาหยุดรับ/ปิด/ผู้ใช้หมดสิทธิ์, คงโหมดและข้อมูลเดียวกันทั้งสองฝั่ง. `[ต้องทำ]` กำหนดกติกาคัดกรองและการส่งต่อให้ผู้ประกอบวิชาชีพอนุมัติ
4. **คิวและแชท/วิดีโอ** — รอหลายคิว/คิวถัดไป/เภสัชกรพัก → รับคิว → คุย → ขอวิดีโอ/ยอมรับ/ปฏิเสธ/ถอนคำขอ → ส่งข้อความและรายการยา → สรุป/จบ. ตรวจพร้อมกันสองอุปกรณ์, เงียบเตือน 3 นาทีและปิด 5 นาทีตามต้นแบบ, การส่งไม่สำเร็จ/เน็ตหลุด/กล้องไมค์ไม่ได้รับอนุญาต/กลับมาต่อ, ป้องกันจ่ายยาหรือรับคิวซ้ำ. `[ต้องยืนยัน]` เวลารอและ SLA จริง
5. **รายการยาและจ่ายเงิน** — เภสัชกรเสนอยาและราคาในแชท; หลังจบคุยลูกค้าเปิดชำระคำสั่งซื้อเดิม. เลือกรับที่ร้าน/ส่งด่วนและที่อยู่ → ส่วนลด → ใบกำกับ (ไม่ขอ/ขอ บุคคล/นิติบุคคล) → เลือกช่องทาง → ยืนยัน. ตรวจราคาที่เซิร์ฟเวอร์/ค่าส่ง/ส่วนลด, ที่อยู่หลุดระยะ, ร้านปิด, สินค้าหมด, ใบกำกับไม่มีข้อมูล/แก้ไข/ยกเลิก, ชำระสำเร็จ/ล้มเหลว/ค้าง/timeout/webhook ซ้ำ. โหมดแชทเริ่มนับ 15 นาทีเมื่อเปิดชำระครั้งแรก ไม่ต่อเวลาเองและไม่เปิดแชทที่จบใหม่; วิดีโอใช้กติกาที่ตกลงแยก. `[ต้องทำ]` payment reconciliation และ idempotency; ห้ามถือว่าจ่ายแล้วจาก UI เพียงอย่างเดียว
6. **จัดเตรียม/รับยา** — จ่ายแล้ว → เตรียมยา → รับที่ร้าน: พร้อมรับ → รับสำเร็จ; ส่งด่วน: เรียกไรเดอร์ → รับยา → กำลังส่ง → ส่งสำเร็จ. ไม่แสดงเป็นประวัติที่เสร็จจนรับ/ส่งสำเร็จ; หน้ารวมสรุปแสดงรายละเอียดที่เกี่ยวข้องและสถานะจากคำสั่งซื้อเดียวกัน. ตรวจไรเดอร์ไม่พบ/ปฏิเสธ/ลิงก์ติดตามไม่มี/ส่งไม่สำเร็จ/รับไม่ทัน/ยกเลิก/คืนเงิน `[ต้องออกแบบ]`; ลิงก์ third party ต้องใช้ URL ที่ได้รับจริง ไม่สร้างลิงก์ติดตามปลอม
7. **ประวัติ/สรุป/ใบเสร็จ** — รายการกำลังดำเนินการไว้ก่อน ตามด้วยประวัติ; แยกผลปรึกษาออกจากสถานะจ่ายและส่ง. สรุปข้อมูลผู้รับ เรื่องที่ปรึกษา ยา วิธีใช้ และคำแนะนำจากข้อมูลเคสเดียวกัน; ใบเสร็จจากคำสั่งซื้อเดียวกัน; ให้คะแนนครั้งเดียว. ตรวจไม่มีการจ่ายยา/ยกเลิก/หมดเวลา/ไม่ตอบ/ไม่ซื้อยา/ชำระแล้วและจัดส่งสำเร็จ, สรุป/ใบเสร็จไม่มีหรือโหลดไม่สำเร็จ, เข้าจากแจ้งเตือนหรือย้อนกลับ
8. **ใบกำกับภาษี** — ใช้ข้อมูลผู้รับที่บันทึกในบัญชีร่วมกันกับ checkout/ใบเสร็จ; แบบบุคคล/นิติบุคคลแยกหนึ่งชุด; ยังไม่มีให้เพิ่มข้อมูล, แก้ไข, ส่งคำขอ, รอตรวจ, ออกแล้วดาวน์โหลดเอกสารจริง, ส่งไม่สำเร็จ/ถูกปฏิเสธ/เลยกำหนด `[ต้องออกแบบ]`. ต้นแบบระบุ 7 วันเป็นกติกาธุรกิจที่ต้องยืนยัน ไม่อ้างว่าเป็นระยะตามกฎหมาย; เอกสารที่ออกแล้วต้องเป็น snapshot ป้องกันข้อมูลแก้ย้อนหลัง
9. **ติดตามยา/แจ้งอาการ** — แยกยาตามมื้อและตามแผนที่เริ่ม/จบต่างกัน; แสดงยาที่ใช้อยู่และประวัติ; ยาใช้เมื่อจำเป็นบันทึกแยก. ตรวจบันทึก/ยกเลิก/ลืม/จบคอร์ส/ปิดเตือน/หลายแผน/ไม่มีแผน/ออฟไลน์/เปลี่ยนวัน. แจ้งอาการเลือกหลายยา, ข้อมูลอาการต่อยา, เร่งด่วนต้องเห็นคำแนะนำทันที; รายงานที่ส่งไม่ใช่การยืนยันแพ้ยา ต้องรอเภสัชกรประเมิน; แสดงรายงานตามวัน ต้นทางและคำตอบ. `[ต้องทำ]` ทบทวนสิทธิ์ข้อมูลและการส่งต่อทางคลินิก
10. **แจ้งเตือน/บัญชี** — แจ้งเตือนเข้าแอป/OS ปิดสิทธิ์/ซ้ำ/เปิดลิงก์รายการที่หาย/อ่านแล้ว; ที่อยู่ ข้อมูลสุขภาพ ประวัติแพ้ยาที่ผู้ใช้กรอก ใบกำกับ และลบบัญชี; ตรวจสิทธิ์ แก้ไข/ยกเลิก/บันทึก/โหลดผิดพลาดและข้อมูลคงอยู่

## สัญญาข้อมูลและการทดสอบข้ามระบบ
- ใช้ `userId`, `consultationId`, `orderId`, `paymentId`, `fulfillmentId`, `reportId` เป็นตัวเชื่อม; รหัสแสดงผลเป็นคนละเรื่องกับ ID ภายใน ห้ามสร้างเลขใหม่เมื่อเปิดหน้า; รหัสคำสั่งซื้อเดียวกันตลอด lifecycle
- แยก state machine: consultation, order, payment, fulfillment, prescription/dispense, adverse report, tax request, notification; เก็บ timestamp, actor, version และเหตุผลการเปลี่ยน ไม่อนุมานสถานะข้ามกันโดยไม่มี event ยืนยัน
- ตรวจ `[ ]` transition ที่อนุญาตและสถานะย้อนกลับ `[ ]` concurrent updates `[ ]` retry/idempotency `[ ]` webhook out-of-order `[ ]` โหลดซ้ำและกู้คืน `[ ]` ผูกข้อมูลคน/สาขา/เคสถูกต้อง `[ ]` duplicate event `[ ]` timezone `[ ]` permission `[ ]` accessibility `[ ]` หน้าจอ loading/empty/error ทุกทางเข้า
- `[ต้องทำ]` API authorization แบบรายคน/สาขา, audit, logging ไม่ใส่ข้อมูลสุขภาพเกินจำเป็น, backup/restore, retention และการจัดการความยินยอมร่วมกับผู้รับผิดชอบข้อมูล

## แหล่งอ้างอิงและข้อจำกัด
- [แนวทางมาตรฐานบริการเภสัชกรรมทางไกล สภาเภสัชกรรม 62/2565](https://pharmacycouncil.org/index.php/share/file/index.php?catid=0&itemid=2966&menuid=68&option=content_detail) และ [แนวทางและขั้นตอนบริการเภสัชกรรมทางไกล อย.](https://drug.fda.moph.go.th/press-release/telepharmacy_2/) ใช้เป็นจุดเริ่มตรวจบทบาทและข้อกำหนดจริง ต้องตรวจฉบับล่าสุดกับผู้เชี่ยวชาญก่อนเปิดบริการ
- [HL7 FHIR MedicationRequest](https://hl7.org/fhir/medicationrequest.html) เป็นแนวทางพิจารณาการแยกคำสั่งยาและวงจรข้อมูล ไม่ได้หมายความว่าต้นแบบเชื่อม FHIR แล้ว

## ทะเบียนหน้าจอและเหตุการณ์ที่มี fixture
รหัสด้านล่างเป็น snapshot จากทะเบียนที่สร้างอัตโนมัติ โปรดเปิดคู่มือรายหน้าเพื่อดูวิธีกดและเงื่อนไข; การมีรายการไม่เท่ากับผ่าน QA. รวมหน้าที่ซ่อนหรือพักใช้ตามทะเบียนเดิม ต้องตรวจขอบเขตปัจจุบันก่อนพัฒนา

### C101 · splash (1 เหตุการณ์)

- `EV-C101-default` — ปกติ · [เปิดเคส](/?screen=splash&splash=0)

### C102 · login (12 เหตุการณ์)

- `EV-C102-normal` — เลือกวิธีเข้าสู่ระบบ · [เปิดเคส](/?screen=login&state=normal&splash=0)
- `EV-C102-error` — ข้อความผิดพลาดการเข้าสู่ระบบ · [เปิดเคส](/?screen=login&state=error&splash=0)
- `EV-C102-signedout` — หลุดจากระบบ 30 วัน · [เปิดเคส](/?screen=login&state=signedout&splash=0)
- `EV-C102-cover` — ภาพปกหน้าร้าน · [เปิดเคส](/?screen=login&state=cover&splash=0)
- `EV-C102-platform-cover` — ปกแพลตฟอร์มร้านยา ไม่มีคน · [เปิดเคส](/?screen=login&state=platform-cover&splash=0)
- `EV-C102-storefront-cover` — ปกหน้าร้าน ตัดป้ายร้านข้างเคียง · [เปิดเคส](/?screen=login&state=storefront-cover&splash=0)
- `EV-C102-no-logo-overlay` — ปกหน้าร้าน ไม่มีโลโก้และกล่องทับ · [เปิดเคส](/?screen=login&state=no-logo-overlay&splash=0)
- `EV-C102-compact-terms` — ข้อกำหนดและนโยบายระยะกระชับ · [เปิดเคส](/?screen=login&state=compact-terms&splash=0)
- `EV-C102-white-fade` — เฟดขาว ปุ่มสี Primary · [เปิดเคส](/?screen=login&state=white-fade&splash=0)
- `EV-C102-white-image` — ภาพปกด้านล่างขาว ไม่มีเฟด CSS · [เปิดเคส](/?screen=login&state=white-image&splash=0)
- `EV-C102-simple-cover` — ปกไม่มีข้อความรอง · [เปิดเคส](/?screen=login&state=simple-cover&splash=0)
- `EV-C102-cover-heading` — หัวข้อและคำอธิบายบรรทัดเดียว · [เปิดเคส](/?screen=login&state=cover-heading&splash=0)

### C103 · loginphone (17 เหตุการณ์)

- `EV-C103-normal` — ปกติ · [เปิดเคส](/?screen=loginphone&state=normal&splash=0)
- `EV-C103-error` — เบอร์ไม่ถูกต้อง · [เปิดเคส](/?screen=loginphone&state=error&splash=0)
- `EV-C103-signedout` — หลุดจากระบบ 30 วัน · [เปิดเคส](/?screen=loginphone&state=signedout&splash=0)
- `EV-C103-filled` — กรอกเบอร์แล้ว · [เปิดเคส](/?screen=loginphone&state=filled&splash=0)
- `EV-C103-panel-layout` — กล่องล็อกอิน 70% พร้อมปก CI · [เปิดเคส](/?screen=loginphone&state=panel-layout&splash=0)
- `EV-C103-consultation-cover` — ปกเภสัชกร ไม่มีข้อความ · [เปิดเคส](/?screen=loginphone&state=consultation-cover&splash=0)
- `EV-C103-otp-sent` — กล่องกรอกรหัสในหน้าเดิม · [เปิดเคส](/?screen=loginphone&state=otp-sent&splash=0)
- `EV-C103-otp-filled` — รหัสครบ พร้อมยืนยัน · [เปิดเคส](/?screen=loginphone&state=otp-filled&splash=0)
- `EV-C103-otp-wrong` — รหัสไม่ถูกต้อง · [เปิดเคส](/?screen=loginphone&state=otp-wrong&splash=0)
- `EV-C103-otp-expired` — รหัสหมดอายุ · [เปิดเคส](/?screen=loginphone&state=otp-expired&splash=0)
- `EV-C103-otp-locked` — ลองผิดครบกำหนด · [เปิดเคส](/?screen=loginphone&state=otp-locked&splash=0)
- `EV-C103-resend` — ส่งรหัสใหม่ได้ · [เปิดเคส](/?screen=loginphone&state=resend&splash=0)
- `EV-C103-new-account` — ยืนยันแล้วไปสมัครใหม่ · [เปิดเคส](/?screen=loginphone&state=new-account&splash=0)
- `EV-C103-existing-account` — ยืนยันแล้วไปหน้าหลัก · [เปิดเคส](/?screen=loginphone&state=existing-account&splash=0)
- `EV-C103-plain-panel` — ไม่มีโลโก้และกล่องทับ · [เปิดเคส](/?screen=loginphone&state=plain-panel&splash=0)
- `EV-C103-otp-c103` — กรอกรหัสในหน้าเดิม กลับแก้ปลายทางได้ · [เปิดเคส](/?screen=loginphone&state=otp-c103&splash=0)
- `EV-C103-masked-target` — ซ่อนปลายทางและแป้นตัวเลขพอดีปุ่ม · [เปิดเคส](/?screen=loginphone&state=masked-target&splash=0)

### C104 · loginemail (17 เหตุการณ์)

- `EV-C104-normal` — ยังไม่กรอก · [เปิดเคส](/?screen=loginemail&state=normal&splash=0)
- `EV-C104-filled` — กรอกอีเมลแล้ว · [เปิดเคส](/?screen=loginemail&state=filled&splash=0)
- `EV-C104-invalid` — รูปแบบอีเมลไม่ถูกต้อง · [เปิดเคส](/?screen=loginemail&state=invalid&splash=0)
- `EV-C104-service-error` — ส่งรหัสไม่สำเร็จ · [เปิดเคส](/?screen=loginemail&state=service-error&splash=0)
- `EV-C104-panel-layout` — กล่องล็อกอิน 70% พร้อมปก CI · [เปิดเคส](/?screen=loginemail&state=panel-layout&splash=0)
- `EV-C104-consultation-cover` — ปกเภสัชกร ไม่มีข้อความ · [เปิดเคส](/?screen=loginemail&state=consultation-cover&splash=0)
- `EV-C104-otp-sent` — กล่องกรอกรหัสในหน้าเดิม · [เปิดเคส](/?screen=loginemail&state=otp-sent&splash=0)
- `EV-C104-otp-filled` — รหัสครบ พร้อมยืนยัน · [เปิดเคส](/?screen=loginemail&state=otp-filled&splash=0)
- `EV-C104-otp-wrong` — รหัสไม่ถูกต้อง · [เปิดเคส](/?screen=loginemail&state=otp-wrong&splash=0)
- `EV-C104-otp-expired` — รหัสหมดอายุ · [เปิดเคส](/?screen=loginemail&state=otp-expired&splash=0)
- `EV-C104-otp-locked` — ลองผิดครบกำหนด · [เปิดเคส](/?screen=loginemail&state=otp-locked&splash=0)
- `EV-C104-resend` — ส่งรหัสใหม่ได้ · [เปิดเคส](/?screen=loginemail&state=resend&splash=0)
- `EV-C104-new-account` — ยืนยันแล้วไปสมัครใหม่ · [เปิดเคส](/?screen=loginemail&state=new-account&splash=0)
- `EV-C104-existing-account` — ยืนยันแล้วไปหน้าหลัก · [เปิดเคส](/?screen=loginemail&state=existing-account&splash=0)
- `EV-C104-plain-panel` — ไม่มีโลโก้และกล่องทับ · [เปิดเคส](/?screen=loginemail&state=plain-panel&splash=0)
- `EV-C104-otp-c103` — กรอกรหัสในหน้าเดิม กลับแก้ปลายทางได้ · [เปิดเคส](/?screen=loginemail&state=otp-c103&splash=0)
- `EV-C104-masked-target` — ซ่อนปลายทางและแป้นตัวเลขพอดีปุ่ม · [เปิดเคส](/?screen=loginemail&state=masked-target&splash=0)

### C105 · profile (54 เหตุการณ์)

- `EV-C105-empty` — เบอร์ใหม่: ยังไม่กรอก · [เปิดเคส](/?screen=profile&state=empty&splash=0)
- `EV-C105-filled` — เบอร์ใหม่: กรอกแล้ว · [เปิดเคส](/?screen=profile&state=filled&splash=0)
- `EV-C105-error` — ปีเกิดไม่ถูกต้อง · [เปิดเคส](/?screen=profile&state=error&splash=0)
- `EV-C105-acct` — มีบัญชีเว็บ: ความยินยอมฉบับใหม่ · [เปิดเคส](/?screen=profile&state=acct&splash=0)
- `EV-C105-email` — สมัครใหม่ด้วยอีเมลที่ยืนยันแล้ว · [เปิดเคส](/?screen=profile&state=email&splash=0)
- `EV-C105-address` — ขั้นที่อยู่ พร้อมค้นหาอัตโนมัติ · [เปิดเคส](/?screen=profile&state=address&splash=0)
- `EV-C105-address-no-results` — ค้นหาที่อยู่ไม่พบ กรอกเองได้ · [เปิดเคส](/?screen=profile&state=address-no-results&splash=0)
- `EV-C105-address-error` — ตัวช่วยที่อยู่โหลดไม่สำเร็จ · [เปิดเคส](/?screen=profile&state=address-error&splash=0)
- `EV-C105-health` — ขั้นข้อมูลสุขภาพ ยังไม่ทราบ · [เปิดเคส](/?screen=profile&state=health&splash=0)
- `EV-C105-health-empty` — ระบุข้อมูลสุขภาพ แต่ยังไม่มีรายการ · [เปิดเคส](/?screen=profile&state=health-empty&splash=0)
- `EV-C105-health-filled` — ข้อมูลสุขภาพหลายรายการ · [เปิดเคส](/?screen=profile&state=health-filled&splash=0)
- `EV-C105-review` — ตรวจทานและความยินยอม ยังไม่ติ๊ก · [เปิดเคส](/?screen=profile&state=review&splash=0)
- `EV-C105-consent-partial` — ความยินยอมเก่าไม่แทนการเลือกฉบับใหม่ · [เปิดเคส](/?screen=profile&state=consent-partial&splash=0)
- `EV-C105-consent-ready` — เลือกยินยอมแล้ว พร้อมสมัคร · [เปิดเคส](/?screen=profile&state=consent-ready&splash=0)
- `EV-C105-save-error` — บันทึกไม่สำเร็จ ข้อมูลยังอยู่ · [เปิดเคส](/?screen=profile&state=save-error&splash=0)
- `EV-C105-health-none` — ไม่มีประวัติสุขภาพ โดยผู้ใช้เลือกเอง · [เปิดเคส](/?screen=profile&state=health-none&splash=0)
- `EV-C105-health-no-results` — ยาไม่อยู่ในลิสต์ ใช้อื่น ๆ · [เปิดเคส](/?screen=profile&state=health-no-results&splash=0)
- `EV-C105-health-documents` — แนบเอกสารแพ้ยาแล้ว · [เปิดเคส](/?screen=profile&state=health-documents&splash=0)
- `EV-C105-health-doc-error` — ไฟล์แนบไม่ผ่านเงื่อนไข · [เปิดเคส](/?screen=profile&state=health-doc-error&splash=0)
- `EV-C105-quick-fill` — ปุ่มมอคข้อมูลใต้ป้ายชื่อหน้า · [เปิดเคส](/?screen=profile&state=quick-fill&splash=0)
- `EV-C105-address-search` — ค้นหาที่อยู่และเติมอัตโนมัติ · [เปิดเคส](/?screen=profile&state=address-search&splash=0)
- `EV-C105-conditions-multi` — เลือกโรคได้หลายข้อ · [เปิดเคส](/?screen=profile&state=conditions-multi&splash=0)
- `EV-C105-conditions-other` — ระบุโรคอื่น ๆ · [เปิดเคส](/?screen=profile&state=conditions-other&splash=0)
- `EV-C105-conditions-other-empty` — เลือกอื่น ๆ แต่ยังไม่กรอก · [เปิดเคส](/?screen=profile&state=conditions-other-empty&splash=0)
- `EV-C105-conditions-no-results` — โรคที่ไม่มีในลิสต์ ใช้อื่น ๆ · [เปิดเคส](/?screen=profile&state=conditions-no-results&splash=0)
- `EV-C105-registration-back` — ย้อนกลับเพื่อแก้ไขข้อมูล · [เปิดเคส](/?screen=profile&state=registration-back&splash=0)
- `EV-C105-health-all-other` — เลือกหลายข้อและอื่น ๆ ทุกกลุ่มสุขภาพ · [เปิดเคส](/?screen=profile&state=health-all-other&splash=0)
- `EV-C105-health-doc-limit` — แนบเอกสารครบ 5 ไฟล์ · [เปิดเคส](/?screen=profile&state=health-doc-limit&splash=0)
- `EV-C105-review-documents` — ตรวจทานไฟล์แนบ รูปย่อและชื่อไฟล์ · [เปิดเคส](/?screen=profile&state=review-documents&splash=0)
- `EV-C105-dob-years` — วันเกิด: ล้อหมุน · [เปิดเคส](/?screen=profile&state=dob-years&splash=0)
- `EV-C105-dob-months` — วันเกิด: เลือกเดือน · [เปิดเคส](/?screen=profile&state=dob-months&splash=0)
- `EV-C105-dob-days` — วันเกิด: เลือกวัน · [เปิดเคส](/?screen=profile&state=dob-days&splash=0)
- `EV-C105-dob-selected` — วันเกิด: ค่าเดิม · [เปิดเคส](/?screen=profile&state=dob-selected&splash=0)
- `EV-C105-dob-leap` — วันเกิด: ปีอธิกสุรทิน · [เปิดเคส](/?screen=profile&state=dob-leap&splash=0)
- `EV-C105-dob-future` — วันเกิด: จำกัดถึงวันนี้ · [เปิดเคส](/?screen=profile&state=dob-future&splash=0)
- `EV-C105-dob-oldest` — วันเกิด: ปี 1900 · [เปิดเคส](/?screen=profile&state=dob-oldest&splash=0)
- `EV-C105-address-select` — เลือกจังหวัด อำเภอ ตำบล · [เปิดเคส](/?screen=profile&state=address-select&splash=0)
- `EV-C105-address-missing-phone` — ที่อยู่ยังไม่กรอกเบอร์ · [เปิดเคส](/?screen=profile&state=address-missing-phone&splash=0)
- `EV-C105-address-invalid-phone` — รูปแบบเบอร์ติดต่อไม่ถูกต้อง · [เปิดเคส](/?screen=profile&state=address-invalid-phone&splash=0)
- `EV-C105-health-text` — ระบุสุขภาพด้วยข้อความ · [เปิดเคส](/?screen=profile&state=health-text&splash=0)
- `EV-C105-national-id-short` — เลขประชาชนไม่ครบ 13 หลัก · [เปิดเคส](/?screen=profile&state=national-id-short&splash=0)
- `EV-C105-national-id-format` — เลขประชาชนมีตัวอักษร · [เปิดเคส](/?screen=profile&state=national-id-format&splash=0)
- `EV-C105-national-id-checksum` — เลขประชาชนครบแต่เลขตรวจสอบผิด · [เปิดเคส](/?screen=profile&state=national-id-checksum&splash=0)
- `EV-C105-map-ready` — ที่อยู่ครบ พร้อมยืนยันหมุด · [เปิดเคส](/?screen=profile&state=map-ready&splash=0)
- `EV-C105-map-outside` — หมุดอยู่นอกตำบล บันทึกไม่ได้ · [เปิดเคส](/?screen=profile&state=map-outside&splash=0)
- `EV-C105-map-error` — โหลดขอบเขตตำบลไม่ได้ · [เปิดเคส](/?screen=profile&state=map-error&splash=0)
- `EV-C105-map-saved` — บันทึกหมุดแล้ว แก้ไขตำแหน่งได้เสมอ · [เปิดเคส](/?screen=profile&state=map-saved&splash=0)
- `EV-C105-address-split` — ที่อยู่แยกบ้านเลขที่ อาคาร ซอย ถนน · [เปิดเคส](/?screen=profile&state=address-split&splash=0)
- `EV-C105-address-legacy` — ที่อยู่เดิมยังอยู่ครบ ไม่แยกอัตโนมัติ · [เปิดเคส](/?screen=profile&state=address-legacy&splash=0)
- `EV-C105-address-details-invalid` — รายละเอียดอาคารยาวเกินกำหนด · [เปิดเคส](/?screen=profile&state=address-details-invalid&splash=0)
- `EV-C105-personal-edit` — แก้ไขข้อมูลส่วนตัว · [เปิดเคส](/?screen=profile&state=personal-edit&splash=0)
- `EV-C105-personal-edit-invalid` — แก้ไขข้อมูลส่วนตัวไม่ครบ · [เปิดเคส](/?screen=profile&state=personal-edit-invalid&splash=0)

### C106 · registrationexit (1 เหตุการณ์)

- `EV-C106-normal` — ยืนยันก่อนออก · [เปิดเคส](/?screen=registrationexit&state=normal&splash=0)

### C107 · registrationconsent (1 เหตุการณ์)

- `EV-C107-normal` — อ่านความยินยอม ไม่มีช่องติ๊ก · [เปิดเคส](/?screen=registrationconsent&state=normal&splash=0)

### C108 · registrationsuccess (6 เหตุการณ์)

- `EV-C108-normal` — สมัครสำเร็จด้วยเบอร์โทร · [เปิดเคส](/?screen=registrationsuccess&state=normal&splash=0)
- `EV-C108-email` — สมัครสำเร็จด้วยอีเมล · [เปิดเคส](/?screen=registrationsuccess&state=email&splash=0)
- `EV-C108-long-name` — ชื่อจริงยาว · [เปิดเคส](/?screen=registrationsuccess&state=long-name&splash=0)
- `EV-C108-full-cover` — ปกเต็มจอและปุ่มใต้คำต้อนรับ · [เปิดเคส](/?screen=registrationsuccess&state=full-cover&splash=0)

### C111 · doc (1 เหตุการณ์)

- `EV-C111-default` — ปกติ · [เปิดเคส](/?screen=doc&splash=0)

### C112 · onboard (3 เหตุการณ์)

- `EV-C112-p1` — หน้า 1 เภสัชกรตัวจริง · [เปิดเคส](/?screen=onboard&state=p1&splash=0)
- `EV-C112-p2` — หน้า 2 เวลาให้บริการ · [เปิดเคส](/?screen=onboard&state=p2&splash=0)
- `EV-C112-p3` — หน้า 3 ขั้นตอนและความเสี่ยง · [เปิดเคส](/?screen=onboard&state=p3&splash=0)

### C201 · home (68 เหตุการณ์)

- `EV-C201-normal` — ปกติ · [เปิดเคส](/?screen=home&state=normal&splash=0)
- `EV-C201-loading` — กำลังโหลด · [เปิดเคส](/?screen=home&state=loading&splash=0)
- `EV-C201-outarea` — ไม่พบร้านในพื้นที่ · [เปิดเคส](/?screen=home&state=outarea&splash=0)
- `EV-C201-unknownarea` — ตรวจสอบพื้นที่ไม่ได้ · แสดงทุกสาขา · [เปิดเคส](/?screen=home&state=unknownarea&splash=0)
- `EV-C201-banner-edge` — แบนเนอร์เต็มขอบ · [เปิดเคส](/?screen=home&state=banner-edge&splash=0)
- `EV-C201-blue-canvas` — พื้นหลังเทาอมฟ้าอ่อน · [เปิดเคส](/?screen=home&state=blue-canvas&splash=0)
- `EV-C201-pharmacy-banner` — ภาพร้านยาและเฟดข้อความ · [เปิดเคส](/?screen=home&state=pharmacy-banner&splash=0)
- `EV-C201-mini-menu` — มินิเมนูสุขภาพใต้แบนเนอร์ · [เปิดเคส](/?screen=home&state=mini-menu&splash=0)
- `EV-C201-compact-store` — การ์ดสาขาแบบกระชับ · [เปิดเคส](/?screen=home&state=compact-store&splash=0)
- `EV-C201-named-address` — ชื่อที่อยู่และดรอปดาวน์ · [เปิดเคส](/?screen=home&state=named-address&splash=0)
- `EV-C201-plain-mini-menu` — มินิเมนูไม่มีกรอบ · [เปิดเคส](/?screen=home&state=plain-mini-menu&splash=0)
- `EV-C201-branch-tile` — การ์ดรูปซ้ายและเลือกวิธีปรึกษา · [เปิดเคส](/?screen=home&state=branch-tile&splash=0)
- `EV-C201-white-canvas` — พื้นหลังสีขาว · [เปิดเคส](/?screen=home&state=white-canvas&splash=0)
- `EV-C201-layout-system` — กริดและระยะกลางทั้งแอป · [เปิดเคส](/?screen=home&state=layout-system&splash=0)
- `EV-C201-store-list` — ลิสต์ร้านยา 6 ร้าน · [เปิดเคส](/?screen=home&state=store-list&splash=0)
- `EV-C201-care-shortcuts` — ติดตามยาและประวัติในมินิเมนู · [เปิดเคส](/?screen=home&state=care-shortcuts&splash=0)
- `EV-C201-figma-system` — Figma tokens และ component กลาง · [เปิดเคส](/?screen=home&state=figma-system&splash=0)
- `EV-C201-real-photos` — ภาพถ่ายและรูปมุมมน · [เปิดเคส](/?screen=home&state=real-photos&splash=0)
- `EV-C201-pastel-icons` — ไอคอนภาพประกอบพาสเทล · [เปิดเคส](/?screen=home&state=pastel-icons&splash=0)
- `EV-C201-banner-actions` — ปุ่มแบนเนอร์เสมอกัน ไม่มี badge · [เปิดเคส](/?screen=home&state=banner-actions&splash=0)
- `EV-C201-refined-store-list` — ลิสต์ร้านจัดลำดับข้อมูลใหม่ · [เปิดเคส](/?screen=home&state=refined-store-list&splash=0)
- `EV-C201-distinct-store-photos` — ภาพจำลองแต่ละร้านต่างกัน · [เปิดเคส](/?screen=home&state=distinct-store-photos&splash=0)
- `EV-C201-soft-status` — แท็กเปิดรับปรึกษาพื้นเขียวอ่อน · [เปิดเคส](/?screen=home&state=soft-status&splash=0)
- `EV-C201-bear-banner` — ปกหมีเภสัชกร 3D · [เปิดเคส](/?screen=home&state=bear-banner&splash=0)
- `EV-C201-banner-safe-area` — ภาพปกเต็ม safe area เฟดต่อเนื่อง · [เปิดเคส](/?screen=home&state=banner-safe-area&splash=0)
- `EV-C201-bright-bear` — หมีสดใส เฟดเฉพาะด้านบน · [เปิดเคส](/?screen=home&state=bright-bear&splash=0)
- `EV-C201-tritone-icons` — ไอคอน Flat 3 สี CI · [เปิดเคส](/?screen=home&state=tritone-icons&splash=0)
- `EV-C201-personal-greeting` — ทักทายชื่อจริงและหัวใจขาวเต็ม · [เปิดเคส](/?screen=home&state=personal-greeting&splash=0)
- `EV-C201-counter-bear` — หมีอยู่หลังเคาน์เตอร์เป็นธรรมชาติ · [เปิดเคส](/?screen=home&state=counter-bear&splash=0)
- `EV-C201-soft-rounded-icons` — ไอคอนมนสี CI อ่อนและแนวปุ่มที่อยู่ · [เปิดเคส](/?screen=home&state=soft-rounded-icons&splash=0)
- `EV-C201-glass-tabs` — เมนูล่าง Liquid Glass · [เปิดเคส](/?screen=home&state=glass-tabs&splash=0)
- `EV-C201-female-pharmacist-banner` — ปกเภสัชกรหญิงหลังเคาน์เตอร์ · [เปิดเคส](/?screen=home&state=female-pharmacist-banner&splash=0)
- `EV-C201-quick-consult` — ปุ่มกลาง เลือกร้านว่างใกล้สุด · [เปิดเคส](/?screen=home&state=quick-consult&splash=0)
- `EV-C201-quick-address` — ปรึกษาโดยยังไม่มีที่อยู่ · [เปิดเคส](/?screen=home&state=quick-address&splash=0)
- `EV-C201-consult-banner` — แบนเนอร์ชวนปรึกษาเหนือร้านยา · [เปิดเคส](/?screen=home&state=consult-banner&splash=0)
- `EV-C201-active-next` — การปรึกษา คิวถัดไป · [เปิดเคส](/?screen=home&state=active-next&splash=0)
- `EV-C201-active-paused` — การปรึกษา พักรับคิว · [เปิดเคส](/?screen=home&state=active-paused&splash=0)
- `EV-C201-active-payment` — การปรึกษา รอชำระ · [เปิดเคส](/?screen=home&state=active-payment&splash=0)
- `EV-C201-active-idle` — การปรึกษา รอคำตอบ · [เปิดเคส](/?screen=home&state=active-idle&splash=0)
- `EV-C201-case-queue3` — จำลอง รออีก 3 คิว · [เปิดเคส](/?screen=home&state=case-queue3&splash=0)
- `EV-C201-case-next` — จำลอง คิวถัดไป · [เปิดเคส](/?screen=home&state=case-next&splash=0)
- `EV-C201-case-paused` — จำลอง เภสัชกรพัก · [เปิดเคส](/?screen=home&state=case-paused&splash=0)
- `EV-C201-case-matched` — จำลอง รับคิวแล้ว · [เปิดเคส](/?screen=home&state=case-matched&splash=0)
- `EV-C201-case-chat` — สนทนา-จ่ายยา · [เปิดเคส](/?screen=home&state=case-chat&splash=0)
- `EV-C201-case-reply` — จำลอง รอคำตอบจากคุณ · [เปิดเคส](/?screen=home&state=case-reply&splash=0)
- `EV-C201-case-payment` — จำลอง รอชำระเงิน · [เปิดเคส](/?screen=home&state=case-payment&splash=0)
- `EV-C201-case-finished` — จำลอง จบการปรึกษา · [เปิดเคส](/?screen=home&state=case-finished&splash=0)
- `EV-C201-case-cancelled` — จำลอง ยกเลิกคิว · [เปิดเคส](/?screen=home&state=case-cancelled&splash=0)
- `EV-C201-case-expired` — จำลอง หมดเวลารอคำตอบ · [เปิดเคส](/?screen=home&state=case-expired&splash=0)
- `EV-C201-case-closed-unpaid` — จบแชท รอชำระค่ายา · [เปิดเคส](/?screen=home&state=case-closed-unpaid&splash=0)
- `EV-C201-case-closed-payexpired` — จบแชท หมดเวลาชำระ · [เปิดเคส](/?screen=home&state=case-closed-payexpired&splash=0)
- `EV-C201-case-none` — ไม่มีปรึกษา · [เปิดเคส](/?screen=home&state=case-none&splash=0)
- `EV-C201-case-delivery-preparing` — ชำระแล้ว · เตรียมยา · [เปิดเคส](/?screen=home&state=case-delivery-preparing&splash=0)
- `EV-C201-case-delivery-calling` — กำลังเรียกไรเดอร์ · [เปิดเคส](/?screen=home&state=case-delivery-calling&splash=0)
- `EV-C201-case-delivery-delivering` — ไรเดอร์กำลังส่งยา · [เปิดเคส](/?screen=home&state=case-delivery-delivering&splash=0)
- `EV-C201-case-delivery-delivered` — จัดส่งเสร็จสิ้น · [เปิดเคส](/?screen=home&state=case-delivery-delivered&splash=0)

### C203 · intake (14 เหตุการณ์)

- `EV-C203-normal` — ว่าง · [เปิดเคส](/?screen=intake&state=normal&splash=0)
- `EV-C203-filled` — กรอกแล้ว · [เปิดเคส](/?screen=intake&state=filled&splash=0)
- `EV-C203-other` — พิมพ์อาการเอง · [เปิดเคส](/?screen=intake&state=other&splash=0)
- `EV-C203-noallergy` — ยังไม่ระบุแพ้ยา · [เปิดเคส](/?screen=intake&state=noallergy&splash=0)
- `EV-C203-fail` — เข้าคิวไม่สำเร็จ · [เปิดเคส](/?screen=intake&state=fail&splash=0)
- `EV-C203-ack` — ติ๊กรับทราบแล้ว · [เปิดเคส](/?screen=intake&state=ack&splash=0)
- `EV-C203-outzone` — ที่อยู่หลักนอกเขตส่งยา · [เปิดเคส](/?screen=intake&state=outzone&splash=0)
- `EV-C203-search` — ตัวเลือกอาการ 2 คอลัมน์ · [เปิดเคส](/?screen=intake&state=search&splash=0)
- `EV-C203-urgent` — แจ้งเตือนอาการอันตราย · [เปิดเคส](/?screen=intake&state=urgent&splash=0)
- `EV-C203-multi` — เลือกหลายอาการ · [เปิดเคส](/?screen=intake&state=multi&splash=0)
- `EV-C203-custom-error` — ยังไม่ได้เล่ารายละเอียด · [เปิดเคส](/?screen=intake&state=custom-error&splash=0)
- `EV-C203-photos` — แนบรูป 3 รูป · [เปิดเคส](/?screen=intake&state=photos&splash=0)
- `EV-C203-photo-error` — แนบไฟล์ไม่รองรับ · [เปิดเคส](/?screen=intake&state=photo-error&splash=0)
- `EV-C203-cover` — ปกเล่าอาการและฟอร์มซ้อน · [เปิดเคส](/?screen=intake&state=cover&splash=0)

### C204 · allergy (1 เหตุการณ์)

- `EV-C204-default` — ปกติ · [เปิดเคส](/?screen=allergy&splash=0)

### C205 · redflag (1 เหตุการณ์)

- `EV-C205-default` — ปกติ · [เปิดเคส](/?screen=redflag&splash=0)

### C206 · pushask (1 เหตุการณ์)

- `EV-C206-default` — ปกติ · [เปิดเคส](/?screen=pushask&splash=0)

### C207 · queue (12 เหตุการณ์)

- `EV-C207-q2` — รออีก 1 คิว · [เปิดเคส](/?screen=queue&state=q2&splash=0)
- `EV-C207-q1` — คิวถัดไป · [เปิดเคส](/?screen=queue&state=q1&splash=0)
- `EV-C207-paused` — เภสัชกรพัก · [เปิดเคส](/?screen=queue&state=paused&splash=0)
- `EV-C207-refined` — รอในห้องแชท · [เปิดเคส](/?screen=queue&state=refined&splash=0)
- `EV-C207-q4` — รออีก 3 คิว · [เปิดเคส](/?screen=queue&state=q4&splash=0)
- `EV-C207-message` — พิมพ์ข้อมูลระหว่างรอ · [เปิดเคส](/?screen=queue&state=message&splash=0)
- `EV-C207-offline` — ส่งข้อความระหว่างรอไม่สำเร็จ · [เปิดเคส](/?screen=queue&state=offline&splash=0)
- `EV-C207-outzone` — ที่อยู่จัดส่งนอกเขต 15 กม. · [เปิดเคส](/?screen=queue&state=outzone&splash=0)

### C208 · cancelq (1 เหตุการณ์)

- `EV-C208-default` — ปกติ · [เปิดเคส](/?screen=cancelq&splash=0)

### C210 · homeaddress (3 เหตุการณ์)

- `EV-C210-normal` — มีที่อยู่ · [เปิดเคส](/?screen=homeaddress&state=normal&splash=0)
- `EV-C210-empty` — ยังไม่มีที่อยู่ · [เปิดเคส](/?screen=homeaddress&state=empty&splash=0)

### C212 · storeinfo (8 เหตุการณ์)

- `EV-C212-normal` — เปิดรับปรึกษา · [เปิดเคส](/?screen=storeinfo&state=normal&splash=0)
- `EV-C212-paused` — เภสัชกรพัก · [เปิดเคส](/?screen=storeinfo&state=paused&splash=0)
- `EV-C212-closed` — ร้านปิด · [เปิดเคส](/?screen=storeinfo&state=closed&splash=0)
- `EV-C212-outside` — อยู่นอกระยะให้บริการ · [เปิดเคส](/?screen=storeinfo&state=outside&splash=0)
- `EV-C212-choose-mode` — เลือกสนทนาหรือวิดีโอ · [เปิดเคส](/?screen=storeinfo&state=choose-mode&splash=0)
- `EV-C212-grouped` — รายละเอียดแบ่งหมวด · [เปิดเคส](/?screen=storeinfo&state=grouped&splash=0)
- `EV-C212-license` — ตรวจใบอนุญาตร้านยา · [เปิดเคส](/?screen=storeinfo&state=license&splash=0)
- `EV-C212-neutral-sections` — หมวดข้อมูลพื้นเทาอ่อน · [เปิดเคส](/?screen=storeinfo&state=neutral-sections&splash=0)

### C215 · serviceterms (1 เหตุการณ์)

- `EV-C215-normal` — อ่านเงื่อนไขบริการ · [เปิดเคส](/?screen=serviceterms&state=normal&splash=0)

### C301 · lock (9 เหตุการณ์)

- `EV-C301-accept` — รับคิว · [เปิดเคส](/?screen=lock&state=accept&splash=0)
- `EV-C301-msg` — ข้อความใหม่ · [เปิดเคส](/?screen=lock&state=msg&splash=0)
- `EV-C301-order` — รายการยา · [เปิดเคส](/?screen=lock&state=order&splash=0)
- `EV-C301-payexp` — รายการใกล้หมดเวลา · [เปิดเคส](/?screen=lock&state=payexp&splash=0)
- `EV-C301-paused` — เภสัชกรพัก · [เปิดเคส](/?screen=lock&state=paused&splash=0)
- `EV-C301-summary` — ใบสรุป · [เปิดเคส](/?screen=lock&state=summary&splash=0)
- `EV-C301-adr` — ตอบเรื่องอาการหลังใช้ยา · [เปิดเคส](/?screen=lock&state=adr&splash=0)
- `EV-C301-fudose` — เตือนกินยา · [เปิดเคส](/?screen=lock&state=fudose&splash=0)
- `EV-C301-fucheck` — ถามอาการระหว่างใช้ยา · [เปิดเคส](/?screen=lock&state=fucheck&splash=0)

C302 เลิกใช้: เมื่อเภสัชกรรับคิว ผู้ใช้เข้าห้องปรึกษา C303 โดยตรง รวมทั้งการเปิดจากแจ้งเตือน

### C303 · room (19 เหตุการณ์)

- `EV-C303-live` — เล่นบทสนทนา · [เปิดเคส](/?screen=room&state=live&splash=0)
- `EV-C303-order` — มีรายการยารอชำระ · [เปิดเคส](/?screen=room&state=order&splash=0)
- `EV-C303-paid` — ชำระแล้ว · [เปิดเคส](/?screen=room&state=paid&splash=0)
- `EV-C303-expired` — รายการหมดอายุ · [เปิดเคส](/?screen=room&state=expired&splash=0)
- `EV-C303-offline` — ไม่มีอินเทอร์เน็ต · [เปิดเคส](/?screen=room&state=offline&splash=0)
- `EV-C303-closed` — ปิดเคส + ใบสรุป · [เปิดเคส](/?screen=room&state=closed&splash=0)
- `EV-C303-call` — คุยวิดีโออยู่ · [เปิดเคส](/?screen=room&state=call&splash=0)
- `EV-C303-idle` — เงียบ 3 นาที ใกล้ปิดเอง · [เปิดเคส](/?screen=room&state=idle&splash=0)
- `EV-C303-idleclosed` — ปิดเองเพราะเงียบ 5 นาที · [เปิดเคส](/?screen=room&state=idleclosed&splash=0)
- `EV-C303-waiting` — รอในแชท อีก 3 คิว · [เปิดเคส](/?screen=room&state=waiting&splash=0)
- `EV-C303-waiting-message` — ส่งอาการไว้ระหว่างรอ · [เปิดเคส](/?screen=room&state=waiting-message&splash=0)
- `EV-C303-waiting-paused` — พักชั่วคราวในห้องแชท · [เปิดเคส](/?screen=room&state=waiting-paused&splash=0)
- `EV-C303-provider-joined` — เภสัชกรเข้าห้องแล้ว · [เปิดเคส](/?screen=room&state=provider-joined&splash=0)
- `EV-C303-video-request` — เภสัชกรขอวิดีโอคอล · [เปิดเคส](/?screen=room&state=video-request&splash=0)
- `EV-C303-video-declined` — เลือกคุยแชทต่อ · [เปิดเคส](/?screen=room&state=video-declined&splash=0)
- `EV-C303-video-withdrawn` — เภสัชกรถอนคำขอวิดีโอ · [เปิดเคส](/?screen=room&state=video-withdrawn&splash=0)
- `EV-C303-closed-unpaid` — จบแชท รอชำระค่ายา · [เปิดเคส](/?screen=room&state=closed-unpaid&splash=0)
- `EV-C303-payment-soon` — จบแชท เหลือชำระ 1 นาที · [เปิดเคส](/?screen=room&state=payment-soon&splash=0)
- `EV-C303-closed-payexpired` — จบแชท หมดเวลาชำระ · [เปิดเคส](/?screen=room&state=closed-payexpired&splash=0)

### C304 · roommenu (1 เหตุการณ์)

- `EV-C304-default` — ปกติ · [เปิดเคส](/?screen=roommenu&splash=0)

### C305 · endcase (1 เหตุการณ์)

- `EV-C305-default` — ปกติ · [เปิดเคส](/?screen=endcase&splash=0)

### C306 · video (5 เหตุการณ์)

- `EV-C306-on` — คุยอยู่ · [เปิดเคส](/?screen=video&state=on&splash=0)
- `EV-C306-connecting` — กำลังเชื่อมต่อ · [เปิดเคส](/?screen=video&state=connecting&splash=0)
- `EV-C306-camoff` — ปิดกล้องตัวเอง · [เปิดเคส](/?screen=video&state=camoff&splash=0)
- `EV-C306-weak` — สัญญาณอ่อน · [เปิดเคส](/?screen=video&state=weak&splash=0)
- `EV-C306-pcam` — กล้องเภสัชกรใช้ไม่ได้ · [เปิดเคส](/?screen=video&state=pcam&splash=0)

### C307 · hangup (1 เหตุการณ์)

- `EV-C307-default` — ปกติ · [เปิดเคส](/?screen=hangup&splash=0)

### C308 · pay (28 เหตุการณ์)

- `EV-C308-normal` — รับที่ร้าน (ค่าเริ่มต้น) · [เปิดเคส](/?screen=pay&state=normal&splash=0)
- `EV-C308-parcel` — จัดส่งปกติ · [เปิดเคส](/?screen=pay&state=parcel&splash=0)
- `EV-C308-express` — ส่งด่วน ยังไม่ปักหมุด · [เปิดเคส](/?screen=pay&state=express&splash=0)
- `EV-C308-noaddr` — ยังไม่มีที่อยู่ · [เปิดเคส](/?screen=pay&state=noaddr&splash=0)
- `EV-C308-form` — กำลังเพิ่มที่อยู่ · [เปิดเคส](/?screen=pay&state=form&splash=0)
- `EV-C308-closed` — ร้านปิด · [เปิดเคส](/?screen=pay&state=closed&splash=0)
- `EV-C308-card` — จ่ายด้วยบัตร · [เปิดเคส](/?screen=pay&state=card&splash=0)
- `EV-C308-otp` — บัตร: หน้ายืนยันของธนาคาร · [เปิดเคส](/?screen=pay&state=otp&splash=0)
- `EV-C308-qr` — หน้า QR พร้อมเพย์ · [เปิดเคส](/?screen=pay&state=qr&splash=0)
- `EV-C308-qrexp` — QR หมดอายุ · [เปิดเคส](/?screen=pay&state=qrexp&splash=0)
- `EV-C308-bankon` — พร้อมเพย์ (แทนแอปธนาคารเดิม) · [เปิดเคส](/?screen=pay&state=bankon&splash=0)
- `EV-C308-bankapp` — QR พร้อมเพย์ (แทนแอปธนาคารเดิม) · [เปิดเคส](/?screen=pay&state=bankapp&splash=0)
- `EV-C308-checking` — กำลังตรวจสอบการชำระ · [เปิดเคส](/?screen=pay&state=checking&splash=0)
- `EV-C308-expmap` — ส่งด่วน ปักหมุดเองบนแผนที่ · [เปิดเคส](/?screen=pay&state=expmap&splash=0)
- `EV-C308-exppin` — ส่งด่วน ยืนยันตำแหน่งแล้ว · [เปิดเคส](/?screen=pay&state=exppin&splash=0)
- `EV-C308-locdeny` — ส่งด่วน ไม่ให้สิทธิ์ตำแหน่ง · [เปิดเคส](/?screen=pay&state=locdeny&splash=0)
- `EV-C308-far` — กรุงเทพแต่เกิน 15 กม. · [เปิดเคส](/?screen=pay&state=far&splash=0)
- `EV-C308-outzone` — ที่อยู่นอกเขตส่งยา · [เปิดเคส](/?screen=pay&state=outzone&splash=0)
- `EV-C308-recvoff` — เภสัชกรปิดบางทาง · [เปิดเคส](/?screen=pay&state=recvoff&splash=0)
- `EV-C308-cold` — มียาเก็บเย็น · [เปิดเคส](/?screen=pay&state=cold&splash=0)
- `EV-C308-unlock` — ส่งด่วนเกินระยะ รับที่ร้านแทน · [เปิดเคส](/?screen=pay&state=unlock&splash=0)
- `EV-C308-map-ready` — ยืนยันหมุดตำบล · [เปิดเคส](/?screen=pay&state=map-ready&splash=0)
- `EV-C308-map-outside` — หมุดนอกตำบล · [เปิดเคส](/?screen=pay&state=map-outside&splash=0)
- `EV-C308-map-error` — โหลดขอบเขตตำบลไม่ได้ · [เปิดเคส](/?screen=pay&state=map-error&splash=0)
- `EV-C308-map-saved` — บันทึกหมุดแล้ว แก้ไขตำแหน่งได้เสมอ · [เปิดเคส](/?screen=pay&state=map-saved&splash=0)
- `EV-C308-coupon-valid` — โค้ดส่วนลดใช้ได้ · [เปิดเคส](/?screen=pay&state=coupon-valid&splash=0)
- `EV-C308-coupon-invalid` — โค้ดส่วนลดไม่ถูกต้อง · [เปิดเคส](/?screen=pay&state=coupon-invalid&splash=0)
- `EV-C308-coupon-expired` — โค้ดส่วนลดหมดอายุ · [เปิดเคส](/?screen=pay&state=coupon-expired&splash=0)
- `EV-C308-tax-picker` — เลือกข้อมูลใบกำกับภาษี · [เปิดเคส](/?screen=pay&state=tax-picker&splash=0)

### C309 · paid (9 เหตุการณ์)

- `EV-C309-pickup` — รับที่ร้าน · [เปิดเคส](/?screen=paid&state=pickup&splash=0)
- `EV-C309-parcel` — จัดส่งปกติ · [เปิดเคส](/?screen=paid&state=parcel&splash=0)
- `EV-C309-express` — ส่งด่วน · [เปิดเคส](/?screen=paid&state=express&splash=0)
- `EV-C309-night` — จ่ายตอนร้านปิด · [เปิดเคส](/?screen=paid&state=night&splash=0)
- `EV-C309-ready` — ยาพร้อมรับแล้ว · [เปิดเคส](/?screen=paid&state=ready&splash=0)
- `EV-C309-sent` — ส่งพัสดุแล้ว มีเลขพัสดุ · [เปิดเคส](/?screen=paid&state=sent&splash=0)
- `EV-C309-rider` — ไรเดอร์รับยาแล้ว · [เปิดเคส](/?screen=paid&state=rider&splash=0)
- `EV-C309-cold` — ส่งเย็น Inter Express มีเลขพัสดุ · [เปิดเคส](/?screen=paid&state=cold&splash=0)
- `EV-C309-overdue` — เลยกำหนดรับยา · [เปิดเคส](/?screen=paid&state=overdue&splash=0)

### C401 · summary (5 เหตุการณ์)

- `EV-C401-normal` — มียา · [เปิดเคส](/?screen=summary&state=normal&splash=0)
- `EV-C401-nomeds` — ไม่ได้ซื้อยา · [เปิดเคส](/?screen=summary&state=nomeds&splash=0)
- `EV-C401-closed` — เพิ่งจบเคส · [เปิดเคส](/?screen=summary&state=closed&splash=0)
- `EV-C401-rated` — ให้คะแนนแล้ว · [เปิดเคส](/?screen=summary&state=rated&splash=0)
- `EV-C401-missing` — ไม่พบใบสรุป · [เปิดเคส](/?screen=summary&state=missing&splash=0)

### C402 · receipt (7 เหตุการณ์)

- `EV-C402-normal` — รับที่ร้าน พร้อมเพย์ · [เปิดเคส](/?screen=receipt&state=normal&splash=0)
- `EV-C402-parcel` — ส่งพัสดุ จ่ายบัตร · [เปิดเคส](/?screen=receipt&state=parcel&splash=0)
- `EV-C402-notax` — ยังไม่มีข้อมูลใบกำกับภาษี · [เปิดเคส](/?screen=receipt&state=notax&splash=0)
- `EV-C402-taxpending` — ส่งคำขอแล้ว · รอร้านตรวจสอบ · [เปิดเคส](/?screen=receipt&state=taxpending&splash=0)
- `EV-C402-taxdone` — ออกใบกำกับภาษีแล้ว · [เปิดเคส](/?screen=receipt&state=taxdone&splash=0)
- `EV-C402-late` — เลยกำหนดขอใบกำกับภาษี · [เปิดเคส](/?screen=receipt&state=late&splash=0)
- `EV-C402-missing` — ไม่พบใบเสร็จ · [เปิดเคส](/?screen=receipt&state=missing&splash=0)

### C403 · history (29 เหตุการณ์)

- `EV-C403-normal` — มีรายการ · [เปิดเคส](/?screen=history&state=normal&splash=0)
- `EV-C403-empty` — ยังไม่มี · [เปิดเคส](/?screen=history&state=empty&splash=0)
- `EV-C403-loading` — กำลังโหลด · [เปิดเคส](/?screen=history&state=loading&splash=0)
- `EV-C403-self` — เฉพาะตัวเอง · [เปิดเคส](/?screen=history&state=self&splash=0)
- `EV-C403-paid` — ปรึกษาสำเร็จ · [เปิดเคส](/?screen=history&state=paid&splash=0)
- `EV-C403-no-medication` — สิ้นสุดก่อนสรุป · [เปิดเคส](/?screen=history&state=no-medication&splash=0)
- `EV-C403-search` — ค้นหาประวัติ · [เปิดเคส](/?screen=history&state=search&splash=0)
- `EV-C403-no-results` — ค้นหาไม่พบ · [เปิดเคส](/?screen=history&state=no-results&splash=0)
- `EV-C403-error` — โหลดไม่สำเร็จ · [เปิดเคส](/?screen=history&state=error&splash=0)
- `EV-C403-dark-filters` — แท็บประเภทสี CI เข้ม · [เปิดเคส](/?screen=history&state=dark-filters&splash=0)
- `EV-C403-shared-tabs` — แท็บกลาง ตัวอักษร 14px · [เปิดเคส](/?screen=history&state=shared-tabs&splash=0)
- `EV-C403-store-recipient-card` — หัวการ์ดร้านยา ท้ายการ์ดผู้รับการปรึกษา · [เปิดเคส](/?screen=history&state=store-recipient-card&splash=0)
- `EV-C403-receipt-inside` — ดูใบเสร็จในใบสรุป · [เปิดเคส](/?screen=history&state=receipt-inside&splash=0)
- `EV-C403-detail-rows` — รายละเอียดเรียงแถวพร้อมไอคอน · [เปิดเคส](/?screen=history&state=detail-rows&splash=0)
- `EV-C403-purchase-status` — ป้ายตามข้อมูลซื้อยา · [เปิดเคส](/?screen=history&state=purchase-status&splash=0)
- `EV-C403-pending-order` — รายการยารอชำระ · [เปิดเคส](/?screen=history&state=pending-order&splash=0)
- `EV-C403-expired-order` — รายการยาหมดอายุ · [เปิดเคส](/?screen=history&state=expired-order&splash=0)
- `EV-C403-cancelled-order` — ยกเลิกรายการยา · [เปิดเคส](/?screen=history&state=cancelled-order&splash=0)
- `EV-C403-tap-card` — แตะการ์ด ไม่มีข้อความลิงก์ · [เปิดเคส](/?screen=history&state=tap-card&splash=0)
- `EV-C403-search-below-tabs` — ช่องค้นหาอยู่ใต้แท็บ · [เปิดเคส](/?screen=history&state=search-below-tabs&splash=0)
- `EV-C403-tab-counts` — จำนวนรายการในแต่ละแท็บ · [เปิดเคส](/?screen=history&state=tab-counts&splash=0)
- `EV-C403-search-open` — เปิดช่องค้นหาจากหัวหน้า · [เปิดเคส](/?screen=history&state=search-open&splash=0)
- `EV-C403-search-cleared` — ช่องค้นหาหลังล้างคำ · [เปิดเคส](/?screen=history&state=search-cleared&splash=0)
- `EV-C403-ten-records` — ประวัติ 10 รายการ หลายวันและเดือน · [เปิดเคส](/?screen=history&state=ten-records&splash=0)
- `EV-C403-completed` — ปรึกษาสำเร็จ · [เปิดเคส](/?screen=history&state=completed&splash=0)
- `EV-C403-ended` — สิ้นสุดก่อนสรุป · [เปิดเคส](/?screen=history&state=ended&splash=0)
- `EV-C403-customer-ended` — คุณจบการสนทนา · [เปิดเคส](/?screen=history&state=customer-ended&splash=0)
- `EV-C403-no-response` — ไม่มีการตอบกลับ 5 นาที · [เปิดเคส](/?screen=history&state=no-response&splash=0)
- `EV-C403-long-note` — ข้อความปรึกษายาว แสดงไม่เกิน 3 บรรทัด · [เปิดเคส](/?screen=history&state=long-note&splash=0)

### C404 · inbox (7 เหตุการณ์)

- `EV-C404-normal` — หลายรายการ แบ่งตามวัน · [เปิดเคส](/?screen=inbox&state=normal&splash=0)
- `EV-C404-read` — รายการเดิม · [เปิดเคส](/?screen=inbox&state=read&splash=0)
- `EV-C404-empty` — ยังไม่มี · [เปิดเคส](/?screen=inbox&state=empty&splash=0)
- `EV-C404-many` — แจ้งเตือนหลายวัน · [เปิดเคส](/?screen=inbox&state=many&splash=0)
- `EV-C404-same-day` — หลายรายการในวันเดียว · [เปิดเคส](/?screen=inbox&state=same-day&splash=0)
- `EV-C404-loading` — กำลังโหลดแจ้งเตือน · [เปิดเคส](/?screen=inbox&state=loading&splash=0)
- `EV-C404-error` — โหลดแจ้งเตือนไม่สำเร็จ · [เปิดเคส](/?screen=inbox&state=error&splash=0)

### C405 · follow (18 เหตุการณ์)

- `EV-C405-normal` — วันที่ 3 ปกติ · [เปิดเคส](/?screen=follow&state=normal&splash=0)
- `EV-C405-missed` — ลืมมื้อกลางวัน · [เปิดเคส](/?screen=follow&state=missed&splash=0)
- `EV-C405-checked` — ตอบกลางคอร์สแล้ว · [เปิดเคส](/?screen=follow&state=checked&splash=0)
- `EV-C405-endonly` — เภสัชกรเลือกถามหลังครบคอร์สอย่างเดียว · [เปิดเคส](/?screen=follow&state=endonly&splash=0)
- `EV-C405-worse` — แจ้งว่าแย่ลง · [เปิดเคส](/?screen=follow&state=worse&splash=0)
- `EV-C405-day1` — เพิ่งเริ่มวันนี้ · [เปิดเคส](/?screen=follow&state=day1&splash=0)
- `EV-C405-done` — ครบคอร์ส · [เปิดเคส](/?screen=follow&state=done&splash=0)
- `EV-C405-remoff` — ปิดเตือนกินยา · [เปิดเคส](/?screen=follow&state=remoff&splash=0)
- `EV-C405-off` — หยุดติดตาม · [เปิดเคส](/?screen=follow&state=off&splash=0)
- `EV-C405-offline` — ไม่มีเน็ต · [เปิดเคส](/?screen=follow&state=offline&splash=0)
- `EV-C405-empty` — ไม่มีแผน · [เปิดเคส](/?screen=follow&state=empty&splash=0)
- `EV-C405-loading` — กำลังโหลด · [เปิดเคส](/?screen=follow&state=loading&splash=0)
- `EV-C405-sym` — ไม่มียา ถามอีก 3 วัน · [เปิดเคส](/?screen=follow&state=sym&splash=0)
- `EV-C405-symdue` — ไม่มียา ถึงวันถามอาการ · [เปิดเคส](/?screen=follow&state=symdue&splash=0)
- `EV-C405-symworse` — ไม่มียา แจ้งว่าแย่ลง · [เปิดเคส](/?screen=follow&state=symworse&splash=0)
- `EV-C405-symdone` — ไม่มียา ตอบแล้ว · [เปิดเคส](/?screen=follow&state=symdone&splash=0)
- `EV-C405-talked` — แจ้งว่าแย่ลง คุยในการปรึกษาใหม่แล้ว · [เปิดเคส](/?screen=follow&state=talked&splash=0)
- `EV-C405-multi-plan` — 3 แผนยา ระยะเวลาแตกต่างกัน · [เปิดเคส](/?screen=follow&state=multi-plan&splash=0)

### C406 · fucheck (5 เหตุการณ์)

- `EV-C406-normal` — กลางคอร์ส ยังไม่ตอบ · [เปิดเคส](/?screen=fucheck&state=normal&splash=0)
- `EV-C406-self` — บอกเองระหว่างคอร์ส · [เปิดเคส](/?screen=fucheck&state=self&splash=0)
- `EV-C406-closed` — ตอนร้านปิด · [เปิดเคส](/?screen=fucheck&state=closed&splash=0)
- `EV-C406-error` — ส่งไม่สำเร็จ · [เปิดเคส](/?screen=fucheck&state=error&splash=0)
- `EV-C406-sym` — ไม่มียา ถามครั้งเดียว · [เปิดเคส](/?screen=fucheck&state=sym&splash=0)

### C407 · furesult (8 เหตุการณ์)

- `EV-C407-better` — ดีขึ้น · [เปิดเคส](/?screen=furesult&state=better&splash=0)
- `EV-C407-same` — เหมือนเดิม · [เปิดเคส](/?screen=furesult&state=same&splash=0)
- `EV-C407-worse` — แย่ลง · [เปิดเคส](/?screen=furesult&state=worse&splash=0)
- `EV-C407-danger` — มีอาการรุนแรง · [เปิดเคส](/?screen=furesult&state=danger&splash=0)
- `EV-C407-closed` — แย่ลง ตอนร้านปิด · [เปิดเคส](/?screen=furesult&state=closed&splash=0)
- `EV-C407-symbetter` — ไม่มียา ดีขึ้น · [เปิดเคส](/?screen=furesult&state=symbetter&splash=0)
- `EV-C407-symsame` — ไม่มียา เหมือนเดิม · [เปิดเคส](/?screen=furesult&state=symsame&splash=0)
- `EV-C407-late` — แย่ลง ก่อนร้านปิดไม่ถึง 2 ชั่วโมง · [เปิดเคส](/?screen=furesult&state=late&splash=0)

### C408 · fulog (4 เหตุการณ์)

- `EV-C408-normal` — ระหว่างคอร์ส · [เปิดเคส](/?screen=fulog&state=normal&splash=0)
- `EV-C408-done` — ครบคอร์สแล้ว · [เปิดเคส](/?screen=fulog&state=done&splash=0)
- `EV-C408-empty` — เพิ่งเริ่ม ยังไม่มี · [เปิดเคส](/?screen=fulog&state=empty&splash=0)
- `EV-C408-loading` — กำลังโหลด · [เปิดเคส](/?screen=fulog&state=loading&splash=0)

### C409 · fudone (3 เหตุการณ์)

- `EV-C409-ask` — ถามหลังครบคอร์ส · [เปิดเคส](/?screen=fudone&state=ask&splash=0)
- `EV-C409-healed` — หายดีแล้ว · [เปิดเคส](/?screen=fudone&state=healed&splash=0)
- `EV-C409-still` — ยังมีอาการ · [เปิดเคส](/?screen=fudone&state=still&splash=0)

### C410 · fureminder (4 เหตุการณ์)

- `EV-C410-normal` — เปิดเตือน · [เปิดเคส](/?screen=fureminder&state=normal&splash=0)
- `EV-C410-off` — ปิดเตือนอยู่ · [เปิดเคส](/?screen=fureminder&state=off&splash=0)
- `EV-C410-notifoff` — ปิดแจ้งเตือนของแอป · [เปิดเคส](/?screen=fureminder&state=notifoff&splash=0)
- `EV-C410-error` — เวลาไม่เรียง · [เปิดเคส](/?screen=fureminder&state=error&splash=0)

### C411 · fuoff (1 เหตุการณ์)

- `EV-C411-default` — ปกติ · [เปิดเคส](/?screen=fuoff&splash=0)

### C412 · adr (8 เหตุการณ์)

- `EV-C412-normal` — เลือกยาที่ใช้อยู่ · [เปิดเคส](/?screen=adr&state=normal&splash=0)
- `EV-C412-filled` — กรอกครบหลายรายการ · [เปิดเคส](/?screen=adr&state=filled&splash=0)
- `EV-C412-severe` — อาการเร่งด่วน · [เปิดเคส](/?screen=adr&state=severe&splash=0)
- `EV-C412-search` — ค้นหายา · [เปิดเคส](/?screen=adr&state=search&splash=0)
- `EV-C412-no-results` — ค้นหาไม่พบ · [เปิดเคส](/?screen=adr&state=no-results&splash=0)
- `EV-C412-symptoms` — กรอกอาการในกล่องยา · [เปิดเคส](/?screen=adr&state=symptoms&splash=0)
- `EV-C412-submit-error` — ส่งไม่สำเร็จ ข้อมูลยังอยู่ · [เปิดเคส](/?screen=adr&state=submit-error&splash=0)
- `EV-C412-no-active` — ไม่มียาที่ใช้อยู่ · [เปิดเคส](/?screen=adr&state=no-active&splash=0)

### C413 · adrsent (8 เหตุการณ์)

- `EV-C413-sent` — ส่งแล้ว รอติดต่อ · [เปิดเคส](/?screen=adrsent&state=sent&splash=0)
- `EV-C413-severe` — อาการรุนแรง · [เปิดเคส](/?screen=adrsent&state=severe&splash=0)
- `EV-C413-replied` — เภสัชกรตอบแล้ว · [เปิดเคส](/?screen=adrsent&state=replied&splash=0)
- `EV-C413-closed` — ส่งตอนร้านปิด · [เปิดเคส](/?screen=adrsent&state=closed&splash=0)
- `EV-C413-sfx` — ตอบว่าเป็นผลข้างเคียง · [เปิดเคส](/?screen=adrsent&state=sfx&splash=0)
- `EV-C413-patient-report` — รายงานใหม่รอประเมิน · [เปิดเคส](/?screen=adrsent&state=patient-report&splash=0)
- `EV-C413-patient-reply` — ข้อความตอบกลับรายงานใหม่ · [เปิดเคส](/?screen=adrsent&state=patient-reply&splash=0)
- `EV-C413-unknown-drug` — ไม่ทราบชื่อยา · [เปิดเคส](/?screen=adrsent&state=unknown-drug&splash=0)

### C414 · track (11 เหตุการณ์)

- `EV-C414-transit` — กำลังขนส่ง · [เปิดเคส](/?screen=track&state=transit&splash=0)
- `EV-C414-delivered` — ส่งถึงแล้ว · [เปิดเคส](/?screen=track&state=delivered&splash=0)
- `EV-C414-received` — กดได้รับยาแล้ว · [เปิดเคส](/?screen=track&state=received&splash=0)
- `EV-C414-cold` — ส่งเย็น Inter Express · [เปิดเคส](/?screen=track&state=cold&splash=0)
- `EV-C414-rider` — ส่งด่วน Lalamove · [เปิดเคส](/?screen=track&state=rider&splash=0)
- `EV-C414-prep` — ร้านยังไม่ส่งของ · [เปิดเคส](/?screen=track&state=prep&splash=0)
- `EV-C414-coldlink` — ส่งเย็น ร้านแปะลิงก์ติดตาม · [เปิดเคส](/?screen=track&state=coldlink&splash=0)
- `EV-C414-chat-preparing` — สนทนา: กำลังเตรียมยา · [เปิดเคส](/?screen=track&state=chat-preparing&splash=0)
- `EV-C414-chat-calling` — สนทนา: กำลังเรียกไรเดอร์ · [เปิดเคส](/?screen=track&state=chat-calling&splash=0)
- `EV-C414-chat-delivering` — สนทนา: ไรเดอร์กำลังส่งยา · [เปิดเคส](/?screen=track&state=chat-delivering&splash=0)
- `EV-C414-chat-delivered` — สนทนา: จัดส่งเสร็จสิ้น · [เปิดเคส](/?screen=track&state=chat-delivered&splash=0)

### C415 · gotask (1 เหตุการณ์)

- `EV-C415-default` — ปกติ · [เปิดเคส](/?screen=gotask&splash=0)

### C416 · adrcare (6 เหตุการณ์)

- `EV-C416-normal` — ข้อมูลของตัวเอง · [เปิดเคส](/?screen=adrcare&state=normal&splash=0)
- `EV-C416-empty` — ยังไม่มีรายงาน · [เปิดเคส](/?screen=adrcare&state=empty&splash=0)
- `EV-C416-reported` — มีรายงานรอประเมิน · [เปิดเคส](/?screen=adrcare&state=reported&splash=0)
- `EV-C416-loading` — กำลังโหลด · [เปิดเคส](/?screen=adrcare&state=loading&splash=0)
- `EV-C416-error` — โหลดไม่สำเร็จ · [เปิดเคส](/?screen=adrcare&state=error&splash=0)
- `EV-C416-grouped-days` — หลายรายงาน แบ่งตามวัน · [เปิดเคส](/?screen=adrcare&state=grouped-days&splash=0)

### C418 · medhub (1 เหตุการณ์)

- `EV-C418-normal` — เมนูยา 3 รายการ · [เปิดเคส](/?screen=medhub&state=normal&splash=0)

### C419 · adrreport (4 เหตุการณ์)

- `EV-C419-pending` — รอเภสัชกรประเมิน · [เปิดเคส](/?screen=adrreport&state=pending&splash=0)
- `EV-C419-replied` — ประเมินแล้ว · [เปิดเคส](/?screen=adrreport&state=replied&splash=0)
- `EV-C419-reply-long` — คำตอบหลายบรรทัด · [เปิดเคส](/?screen=adrreport&state=reply-long&splash=0)
- `EV-C419-source-missing` — ไม่มีข้อมูลการปรึกษาต้นทาง · [เปิดเคส](/?screen=adrreport&state=source-missing&splash=0)

### C501 · account (4 เหตุการณ์)

- `EV-C501-normal` — ปกติ · [เปิดเคส](/?screen=account&state=normal&splash=0)
- `EV-C501-profile-cover` — ปกบัญชีและโปรไฟล์ตรงกลาง · [เปิดเคส](/?screen=account&state=profile-cover&splash=0)
- `EV-C501-abstract-cover` — ปก Abstract CI เต็ม safe area · [เปิดเคส](/?screen=account&state=abstract-cover&splash=0)
- `EV-C501-clean-profile` — โปรไฟล์พื้นเทาและเมนูพื้นขาว · [เปิดเคส](/?screen=account&state=clean-profile&splash=0)

### C505 · health (7 เหตุการณ์)

- `EV-C505-normal` — ดูข้อมูลสุขภาพ · [เปิดเคส](/?screen=health&state=normal&splash=0)
- `EV-C505-unknown` — ยังไม่ระบุ · [เปิดเคส](/?screen=health&state=unknown&splash=0)
- `EV-C505-sfx` — ข้อมูลเดิมที่ผู้ใช้ระบุ · [เปิดเคส](/?screen=health&state=sfx&splash=0)
- `EV-C505-none` — ระบุว่าไม่มี · [เปิดเคส](/?screen=health&state=none&splash=0)
- `EV-C505-long-text` — ข้อมูลหลายรายการ · [เปิดเคส](/?screen=health&state=long-text&splash=0)

### C509 · help (2 เหตุการณ์)

- `EV-C509-open` — ในเวลาทำการ · [เปิดเคส](/?screen=help&state=open&splash=0)
- `EV-C509-closed` — นอกเวลาทำการ · [เปิดเคส](/?screen=help&state=closed&splash=0)

### C510 · logout (1 เหตุการณ์)

- `EV-C510-default` — ปกติ · [เปิดเคส](/?screen=logout&splash=0)

### C511 · deleteacc (6 เหตุการณ์)

- `EV-C511-normal` — พิมพ์ยืนยันก่อนลบ · [เปิดเคส](/?screen=deleteacc&state=normal&splash=0)
- `EV-C511-blocked` — มีการปรึกษาค้าง · [เปิดเคส](/?screen=deleteacc&state=blocked&splash=0)
- `EV-C511-unpaid` — มีรายการรอชำระ · [เปิดเคส](/?screen=deleteacc&state=unpaid&splash=0)
- `EV-C511-typed` — พิมพ์ยืนยันครบ · [เปิดเคส](/?screen=deleteacc&state=typed&splash=0)
- `EV-C511-wrong-text` — พิมพ์ไม่ตรง · [เปิดเคส](/?screen=deleteacc&state=wrong-text&splash=0)
- `EV-C511-save-error` — ลบไม่สำเร็จ · [เปิดเคส](/?screen=deleteacc&state=save-error&splash=0)

### C512 · deleted (1 เหตุการณ์)

- `EV-C512-default` — ปกติ · [เปิดเคส](/?screen=deleted&splash=0)

### C513 · algdel (1 เหตุการณ์)


### C514 · addressbook (4 เหตุการณ์)

- `EV-C514-normal` — มีที่อยู่หลัก · [เปิดเคส](/?screen=addressbook&state=normal&splash=0)

### C515 · addressedit (16 เหตุการณ์)

- `EV-C515-normal` — เพิ่มที่อยู่ · [เปิดเคส](/?screen=addressedit&state=normal&splash=0)
- `EV-C515-edit` — แก้ไขที่อยู่ · [เปิดเคส](/?screen=addressedit&state=edit&splash=0)
- `EV-C515-map-ready` — ที่อยู่ครบ พร้อมยืนยันหมุด · [เปิดเคส](/?screen=addressedit&state=map-ready&splash=0)
- `EV-C515-map-outside` — หมุดนอกตำบล บันทึกไม่ได้ · [เปิดเคส](/?screen=addressedit&state=map-outside&splash=0)
- `EV-C515-map-error` — โหลดขอบเขตตำบลไม่ได้ · [เปิดเคส](/?screen=addressedit&state=map-error&splash=0)
- `EV-C515-form-required` — ไม่กรอกข้อมูลบังคับ · [เปิดเคส](/?screen=addressedit&state=form-required&splash=0)
- `EV-C515-form-phone` — เบอร์มือถือผิดรูปแบบ · [เปิดเคส](/?screen=addressedit&state=form-phone&splash=0)
- `EV-C515-form-area` — พื้นที่ยังเลือกไม่ครบ · [เปิดเคส](/?screen=addressedit&state=form-area&splash=0)
- `EV-C515-map-saved` — บันทึกหมุดแล้ว แก้ไขตำแหน่งได้เสมอ · [เปิดเคส](/?screen=addressedit&state=map-saved&splash=0)
- `EV-C515-form-legacy` — ที่อยู่เดิมยังอยู่ครบ ไม่แยกอัตโนมัติ · [เปิดเคส](/?screen=addressedit&state=form-legacy&splash=0)

### C517 · healthfield (9 เหตุการณ์)

- `EV-C517-allergies` — แก้ไขประวัติแพ้ยา · [เปิดเคส](/?screen=healthfield&state=allergies&splash=0)
- `EV-C517-meds` — แก้ไขยาที่ใช้ประจำ · [เปิดเคส](/?screen=healthfield&state=meds&splash=0)
- `EV-C517-conditions` — แก้ไขโรคประจำตัว · [เปิดเคส](/?screen=healthfield&state=conditions&splash=0)
- `EV-C517-food` — แก้ไขประวัติแพ้อาหาร · [เปิดเคส](/?screen=healthfield&state=food&splash=0)
- `EV-C517-weight` — แก้ไขน้ำหนัก · [เปิดเคส](/?screen=healthfield&state=weight&splash=0)
- `EV-C517-height` — แก้ไขส่วนสูง · [เปิดเคส](/?screen=healthfield&state=height&splash=0)
- `EV-C517-unknown` — ยังไม่ทราบ · [เปิดเคส](/?screen=healthfield&state=unknown&splash=0)
- `EV-C517-none` — ระบุว่าไม่มี · [เปิดเคส](/?screen=healthfield&state=none&splash=0)
- `EV-C517-invalid` — กรอกข้อมูลไม่ครบ · [เปิดเคส](/?screen=healthfield&state=invalid&splash=0)


### C518 · taxprofile (6 เหตุการณ์)

- `EV-C518-normal` — บุคคลธรรมดา · [เปิดเคส](/?screen=taxprofile&state=normal&splash=0)
- `EV-C518-company` — นิติบุคคล · [เปิดเคส](/?screen=taxprofile&state=company&splash=0)
- `EV-C518-empty` — ยังไม่มีข้อมูล · [เปิดเคส](/?screen=taxprofile&state=empty&splash=0)
- `EV-C518-address-error` — โหลดข้อมูลที่อยู่ไม่สำเร็จ · [เปิดเคส](/?screen=taxprofile&state=address-error&splash=0)
- `EV-C518-saved-person` — บันทึกบุคคลธรรมดาแล้ว · [เปิดเคส](/?screen=taxprofile&state=saved-person&splash=0)
- `EV-C518-saved-company` — บันทึกนิติบุคคลแล้ว · [เปิดเคส](/?screen=taxprofile&state=saved-company&splash=0)

### C519 · taxprofileedit (2 เหตุการณ์)

- `EV-C519-person` — แก้ไขบุคคลธรรมดา · [เปิดเคส](/?screen=taxprofileedit&state=person&splash=0)
- `EV-C519-company` — แก้ไขนิติบุคคล · [เปิดเคส](/?screen=taxprofileedit&state=company&splash=0)

### C601 · update (2 เหตุการณ์)

- `EV-C601-ios` — iPhone · [เปิดเคส](/?screen=update&state=ios&splash=0)
- `EV-C601-android` — Android · [เปิดเคส](/?screen=update&state=android&splash=0)

### C602 · sysoff (2 เหตุการณ์)

- `EV-C602-off` — ไม่มีเคสค้าง · [เปิดเคส](/?screen=sysoff&state=off&splash=0)
- `EV-C602-case` — มีเคสค้างตอนปิด · [เปิดเคส](/?screen=sysoff&state=case&splash=0)

### C603 · queueclosed (2 เหตุการณ์)

- `EV-C603-branch` — สาขาปิดรับก่อนเวลา · [เปิดเคส](/?screen=queueclosed&state=branch&splash=0)
- `EV-C603-store` — ร้านปิด · [เปิดเคส](/?screen=queueclosed&state=store&splash=0)

### C604 · expired (1 เหตุการณ์)

- `EV-C604-default` — ปกติ · [เปิดเคส](/?screen=expired&splash=0)

### C605 · offline (2 เหตุการณ์)

- `EV-C605-form` — ฝากคำถาม · [เปิดเคส](/?screen=offline&state=form&splash=0)
- `EV-C605-sent` — ส่งแล้ว · [เปิดเคส](/?screen=offline&state=sent&splash=0)

### C606 · declined (1 เหตุการณ์)

- `EV-C606-default` — ปกติ · [เปิดเคส](/?screen=declined&splash=0)

### C607 · nocam (1 เหตุการณ์)

- `EV-C607-default` — ปกติ · [เปิดเคส](/?screen=nocam&splash=0)

### C608 · lost (3 เหตุการณ์)

- `EV-C608-me` — เน็ตของคุณหลุด · [เปิดเคส](/?screen=lost&state=me&splash=0)
- `EV-C608-peer` — เภสัชกรหลุด · [เปิดเคส](/?screen=lost&state=peer&splash=0)
- `EV-C608-fail` — ต่อไม่สำเร็จ · [เปิดเคส](/?screen=lost&state=fail&splash=0)

### C609 · payfail (2 เหตุการณ์)

- `EV-C609-card` — บัตรไม่ผ่าน · [เปิดเคส](/?screen=payfail&state=card&splash=0)
- `EV-C609-bank` — ยกเลิกในแอปธนาคาร · [เปิดเคส](/?screen=payfail&state=bank&splash=0)

## เหตุการณ์กลาง

- `EV-GLOBAL-001` — ไม่มีอินเทอร์เน็ต
- `EV-GLOBAL-002` — เซิร์ฟเวอร์ขัดข้อง
- `EV-GLOBAL-003` — การตอบกลับหมดเวลา
- `EV-GLOBAL-004` — ระบบตอบกลับช้า

- C308 แสดงข้อมูลผู้รับใบกำกับที่บันทึกแล้วเป็นรายการชื่อ เลขผู้เสียภาษีแบบปกปิด เบอร์ ที่อยู่ และอีเมลหรือสาขาเมื่อมีข้อมูล โดยใช้ข้อมูลชุดเดียวกับบัญชี


- ต้นแบบ: หน้าชำระเงิน: ข้อมูลผู้รับใบกำกับภาษีที่บันทึกแล้วมีปุ่มแก้ไข เปิดฟอร์มประเภทที่เลือก และกลับมาหน้าชำระเงินหลังบันทึกหรือยกเลิก


### ตัวอย่างสถานะรายงานอาการหลังใช้ยา — 5 พฤศจิกายน 2569

C416 เพิ่มเคสพรีวิว `report-statuses`: รายงานตัวอย่างแยกวันและสถานะ รอเภสัชกรประเมิน, กำลังประเมิน, ต้องการข้อมูลเพิ่มเติม, เภสัชกรตอบแล้ว เปิด C419 เพื่อดูรายละเอียดและข้อความตัวอย่างได้ การรายงานไม่ใช่การยืนยันแพ้ยา สถานะกำลังประเมินและต้องการข้อมูลเพิ่มเติมเป็นข้อเสนอสำหรับระบบจริง ยังไม่มีการเชื่อมงานเภสัชกรจริง


- 5 พฤศจิกายน 2569: หน้าเข้าสู่ระบบ C102 นำข้อความหัวข้อซ้ำเหนือปุ่มออก ช่องทางเข้าสู่ระบบและการสมัครยังใช้โฟลเดิม ไม่มีการเปลี่ยนงานฝั่งเภสัชกรหรือแอดมิน

## โฟลหลักลูกค้า /flow

- A100 เข้าสู่ระบบและสมัครสมาชิก
- A200 ปรึกษาเภสัชกร สั่งจ่ายยา ชำระเงิน และรับยา พร้อมการ์ดหน้าแรกตามสถานะ
- A300 ประวัติการปรึกษาและใบเสร็จ
- A400 ข้อมูลยา การกินยา และติดตามอาการ

รหัส A ระบุขั้นในผัง แต่ละขั้นอ้างอิงรหัส C และสถานะเดิมของต้นแบบ ตัวอย่างเปิดแยกตามสถานะ

พรีวิวใน /flow แสดงจอแอปทันทีในแถวเลื่อนแนวนอน ตัดกรอบเครื่องและแถบสถานะเครื่องออก กรอบหมวดขยายตามความกว้างจอ ส่วนพรีวิวแต่ละใบคงขนาด 393 × 852 CSS px หน้า /flow ใช้ชื่อ “โฟลการทำงานแอปพลิเคชัน” พร้อมภาพปกเภสัชกรในร้านยา

พรีวิว C401 อ้างอิงรายการยาในใบสรุปเพื่อแยกตัวอย่างมียากับไม่ได้ซื้อยา เมื่อเปิดใบสรุปจากประวัติจะอ้างอิงเคสที่เลือก

A302 คำสั่งซื้อ ใช้ตัวเลือกสถานะประวัติเพื่อเปิดใบสรุปของเคสตัวอย่างที่ตรงกับสถานะบนการ์ด C403

การ์ดประวัติ C403 ใช้ป้าย 3 แบบ ได้แก่ **สำเร็จ** เมื่อปรึกษาจบหรือรับยาแล้ว, **สิ้นสุด** เมื่อหมดเวลาชำระ ไม่มีการตอบกลับ หรือผู้รับบริการจบก่อนสรุป และ **ยกเลิกแล้ว** เมื่อยกเลิกคำสั่งซื้อ เหตุผลเฉพาะอยู่ใต้การ์ดและใช้ค้นหาได้ รายการที่ยังดำเนินการอยู่แสดงสถานะและปุ่มตามขั้นตอนเดิม

- C303 แสดงรายการยาที่เสนอโดยไม่มีปุ่มขอรายการใหม่หรือสถานะหมดเวลาชำระในแชท เมื่อปิดการปรึกษาที่มีรายการรอชำระ ระบบเปิด C308 ของรายการเดิม สถานะหมดเวลาชำระทดสอบใน C308 และยังอ้างอิงได้จากประวัติคำสั่งซื้อ

- นำ A405 (C408 บันทึกการกินยา) ออกจากโฟลหลัก A400 รหัสขั้นตอนอื่นใช้ตามเดิม C408 ยังเปิดได้จากปุ่มดูบันทึกในผลหลังครบคอร์ส C409 จึงยังอยู่ในทะเบียนหน้าจอ

### ประเมินอาการจากประวัติคำสั่งซื้อ

- เปิดรายละเอียด C401 จากประวัติคำสั่งซื้อ C403 แล้วแสดงปุ่มประเมินอาการท้ายหน้ารายละเอียดเมื่อชำระเงินและรับยาเรียบร้อยแล้ว ทั้งรับที่สาขาและจัดส่ง
- A406 อยู่ในหมวด A300 และพรีวิวแผง C420 ซึ่งเปิดจากท้ายหน้ารายละเอียด แล้วเลือกดีขึ้น เหมือนเดิม แย่ลง หรือมีอาการรุนแรง คำตอบผูกกับการปรึกษาของคำสั่งซื้อนั้นและไปผลลัพธ์ C407
- ใช้ตัวเลือกทีละข้อโดยไม่มีคำตอบตั้งต้นตาม [NHS Service Manual](https://service-manual.nhs.uk/design-system/components/radios) ต้นแบบคงรูปแบบแตะเพื่อส่งของ C406 และแจ้งวิธีส่งในแผง
- ปุ่มท้าย C401 ใช้กรอบแบบเดียวกัน แยกด้วยไอคอนหัวใจสำหรับแจ้งอาการหลังใช้ยาและไอคอนคลิปบอร์ดสำหรับประเมินอาการ

### พรีวิวโฟลหลักลูกค้า

- พรีวิวใน `/flow` ใช้พื้นที่หน้าจอ 393 × 852 CSS px ทุกการ์ด เลื่อนแถวแนวนอนและใช้งานภายในพรีวิวได้ การเลือกสถานะใหม่จะเปิดตัวอย่างนั้นใหม่
- ข้อมูลที่ลองแก้ในพรีวิว เช่น ที่อยู่และคะแนน ไม่ใช้พื้นที่จัดเก็บร่วมกับต้นแบบที่เปิดแยก

- กรอบหมวดใน `/flow` ใช้ความกว้างที่จอมีและจำกัดการเลื่อนแนวนอนไว้ในแถวพรีวิว ตามแนวทาง [W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) เรื่องแยกพื้นที่เลื่อนเฉพาะส่วน

### การเข้าสู่ระบบและสมัครสมาชิก 6 พฤศจิกายน 2569

C102 / A101 ใช้หัวข้อ “ยินดีต้อนรับ” และตัดข้อความรองออก ส่วน C105 / A106 เพิ่มการตั้งและยืนยันรหัสผ่านท้ายขั้นข้อมูลส่วนตัว เช็กลิสต์อัปเดตทันทีเมื่อพิมพ์ ต้องมีอย่างน้อย 15 ตัวอักษร ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษ และยืนยันให้ตรงกันก่อนกดถัดไป พรีวิวมีกรณีไม่ครบ ไม่ตรง และผ่านครบ รหัสผ่านอยู่ในร่างชั่วคราวของต้นแบบเท่านั้น

A106 มีปุ่มรูปตาด้านขวาของช่องรหัสผ่านทั้งสองช่อง ซ่อนค่าเมื่อเปิดฟอร์มและกดแสดงหรือซ่อนได้แยกกัน

### การแสดงสาขาบนหน้าแรก (A201)

- เมื่อมีที่อยู่แต่ตรวจสอบระยะไม่ได้ ให้แสดงทุกสาขาพร้อมป้าย «อยู่นอกระยะให้บริการ» และแสดงระยะว่าไม่ทราบ แยกจากกรณีไม่มีที่อยู่หรือยืนยันว่าไม่มีสาขาในพื้นที่
- เปิดรายละเอียดได้ทุกสถานะ แสดง «ร้านปิด» ทั้งเมื่อร้านปิดและเมื่อระบบหยุดรับปรึกษา สาขาที่ปิดหรือนอกระยะเปิดดูข้อมูลติดต่อได้จากรายละเอียด ส่วนทางลัดและหน้าร้านโปรดถูกถอดออก
- วางป้ายสถานะไว้ในรายการและเปิดรายละเอียดจากแถวเดียวกัน เพื่อให้เห็นข้อจำกัดก่อนตัดสินใจเริ่มปรึกษา [Health Literacy Online](https://odphp.health.gov/healthliteracyonline/health-literacy-online-glance)

### ขนาดตัวอักษรแอปลูกค้า

- ใช้ Noto Sans Thai และขนาดตามบทบาท หัวข้อใหญ่ 28/40 หัวข้อหน้า 24/36 หรือ 20/30 สำหรับฟอร์มยาว หัวข้อย่อยในฟอร์ม 16/24 น้ำหนักกึ่งหนา เนื้อหา ช่องกรอก และปุ่ม 16/24 ป้ายช่องกรอกและคำอธิบาย 14/22 ข้อมูลประกอบ เช่น เวลาและเลขอ้างอิง 12/20 หน่วยเป็น CSS px สำหรับขนาดตัวอักษรและความสูงบรรทัด
- A202 ใช้ C203 โดยตรง หัวข้อหน้า 20/30 หัวข้อแต่ละขั้น 16/24 คงตัวเลือกอาการ ข้อความเตือน และข้อความที่พิมพ์ 16/24

C308 / A213 เพิ่ม “จัดส่งปกติ” พร้อมข้อความ “ได้รับสินค้าภายใน 1-3 วันทำการ” ใช้ที่อยู่จัดส่งที่บันทึกไว้ ร้านจัดขนส่งให้ ต้นแบบใช้ค่าส่ง ฿25 และมีตัวอย่างหลังชำระใน A215

หลังเลือกวิธีรับยาใน A213 และชำระเงินแล้ว /flow แยกพรีวิวตามวิธีรับยา

- รับที่ร้าน (A221 → A219) ร้านเตรียมยา → พร้อมรับที่สาขา → ร้านบันทึกรับยาแล้ว มีตัวอย่างเลยกำหนดรับยา
- ส่งด่วน (A217 → A218) ร้านเตรียมยา → เรียกไรเดอร์ → ไรเดอร์กำลังส่ง → จัดส่งสำเร็จ
- จัดส่งปกติ (A222 → A220) ร้านเตรียมยา → ส่งให้ขนส่งและมีเลขพัสดุ → กำลังขนส่ง → กำลังนำส่ง → ส่งถึงแล้ว → ลูกค้ายืนยันรับยา ปุ่มยืนยันแสดงหลังมีสถานะส่งถึงแล้ว


### อัปเดตภาพปกผังโฟลว์ 7 พฤศจิกายน 2569

หน้า `/flow` ใช้ภาพปก `public/assets/photos/flow-pharmacy-cover-v2.jpg` เป็นภาพเภสัชกรในร้านยาและพื้นที่สี CI สำหรับข้อความ รายการหน้าจอ สถานะ และการทำงานยังอ้างอิงโฟลว์เดิม


อัปเดต 7 พฤศจิกายน 2569 — ชื่อหัวข้อและชื่อแท็บของ `/flow` ใช้คำว่า “โฟลการทำงาน”

### อัปเดตช่องทางเข้าสู่ระบบ — 7 พฤศจิกายน 2569

C102 แสดงปุ่ม Google และอีเมล/รหัสผ่าน พร้อมข้อความเชิญลงทะเบียนและปุ่มแยกด้านล่าง C109 เป็นฟอร์มอีเมล/รหัสผ่าน มีปุ่มแสดง/ซ่อนรหัสผ่าน และสถานะกรอกครบ รหัสไม่ถูกต้อง ระบบขัดข้อง การลงทะเบียนเปิด C105 โดยตรง กรอกข้อมูล 4 ขั้นและยอมรับเงื่อนไข C114 จำลอง Google บัญชีเดิม/ใหม่/เชื่อมต่อผิดพลาด สมาชิกใหม่ยังต้องผ่านการสมัครก่อนใช้งาน /flow เพิ่ม A113–A115 และแยกกลุ่มเข้าสู่ระบบกับลงทะเบียนชัดเจน

ต้นแบบยังไม่เชื่อมบริการล็อกอินจริง บัญชีทดสอบอีเมล somjai@example.com / Mitraree!2026Demo ใช้ในต้นแบบเท่านั้น ไม่บันทึกรหัสผ่านลงข้อมูลผู้ใช้ Google ใช้หน้าจำลองที่ระบุชัดเจน รองรับยกเลิกกลับหน้าเดิม ก่อนใช้งานจริงต้องแทน adapter ด้วยระบบยืนยันตัวตนและทดสอบสำเร็จ/ล้มเหลว/ยกเลิก/บัญชีใหม่

แนวทางปุ่ม Google: https://developers.google.com/identity/branding-guidelines


อัปเดต C102 — 7 พฤศจิกายน 2569: เพิ่มเฟดขาวสูงขึ้นหลังหัวข้อและปุ่มหน้าเข้าสู่ระบบ ย่อท้ายหน้าเป็น “ข้อกำหนดการใช้งาน และ นโยบายความเป็นส่วนตัว” บรรทัดเดียว ลิงก์ทั้งสองยังกดอ่านได้ /flow A101 ใช้หน้าจริงชุดเดียวกัน ไม่มีการเปลี่ยนขั้นตอนหรือสิทธิ์ในแดชบอร์ด

- 2026-11-07: C102/C114 ใช้ข้อความ “ดำเนินการด้วย Google” และปรับชื่อใน /flow ให้ตรงหน้าจริง การทำงานเดิม

- 2026-11-07: ปุ่มลงทะเบียน C102/C109 เปิดฟอร์มสมัคร C105 โดยตรง ไม่เปิดตัวเลือกช่องทาง C113; ผู้สมัครกรอกอีเมลในขั้นข้อมูลส่วนตัว ส่วนผู้ที่ยืนยันช่องทางมาแล้วใช้ข้อมูลเดิม /flow ใช้หน้าจริงร่วมกัน การยืนยันอีเมลและการสร้างบัญชีจริงยังต้องเชื่อมบริการฝั่งระบบ

- 2026-11-07 C102: ฟอร์มอีเมลและรหัสผ่านพร้อมปุ่มตาในกล่องขาวมุมมน → เข้าสู่ระบบ → หรือ → Google → ลงทะเบียน C105; /flow A101 ใช้หน้าจริง ฝั่งเภสัช/แอดมินไม่มีสิทธิ์เพิ่ม การตรวจบัญชียังเป็น mock เดิม ไม่เพิ่มปุ่มจำรหัสหรือรีเซ็ตรหัสที่ยังไม่รองรับ อ้างอิง label/autocomplete: https://www.w3.org/WAI/WCAG22/Techniques/html/H100

- C102 ปรับกล่องฟอร์มชิดขอบซ้ายขวาและล่าง เหลือมุมมนด้านบน เว้นระยะภายในและ safe area; /flow ใช้ดีไซน์เดียวกัน ไม่มีการเปลี่ยนโฟลหรือสิทธิ์เพิ่มเติม

- 2026-11-07: C102 ลดระยะห่างหัวข้อ ฟอร์ม ตัวคั่น Google และลงทะเบียนให้กล่องล็อกอินกระชับ คงภาพปกเดิม; ยกเลิกหน้าล็อกอินแยก C109/A114 เพราะใช้ฟอร์มใน C102 แล้ว /flow แสดงหน้าจริงเดียวกัน ไม่มีการเปลี่ยนสิทธิ์ของเภสัชกรหรือแอดมิน


## อัปเดต 7 พฤศจิกายน 2026 — สมัครสมาชิกและยืนยันเบอร์ในฟอร์ม (C105 / A106)

- Google C114: ระบบตรวจ token และบัญชีก่อนแยกทาง สมาชิกเดิมเข้าแอป สมาชิกใหม่เข้า C105 ขั้น 1; อีเมลเต็มจาก Google แสดงใน input แบบ readonly ไม่ให้นำอีเมลอื่นมาแทน
- ขั้น 1 เรียง อีเมล → เบอร์มือถือ → ขอ SMS OTP → ช่องรหัส 6 หลักและยืนยันในฟอร์มเดิม → ข้อมูลส่วนตัว/รหัสผ่าน ไม่เปิดหน้า OTP แยกในเส้นทางนี้
- รหัสต้นแบบทุกช่องใช้ 123456 ไม่มี SMS/อีเมลจริง ส่วนรหัสอ้างอิงเป็นตัวอย่างเท่านั้น ห้ามนำ demo adapter ไปใช้จริง
- ระหว่างรอ OTP แสดงเบอร์ปลายทาง, เวลาหมดอายุ, ส่งรหัสใหม่ (เว้น 60 วินาที) และเปลี่ยนเบอร์; ข้อผิดพลาดไม่แสดงจำนวนครั้งที่เหลือ
- เปลี่ยนเบอร์ต้องล้าง challenge/ผลยืนยันเดิม เก็บข้อมูลส่วนอื่นไว้ ห้ามผลตอบกลับของเบอร์เก่ามายืนยันเบอร์ใหม่
- ยืนยันสำเร็จแสดงสถานะและปุ่มเปลี่ยนเบอร์ ผ่านขั้นแรกได้เมื่ออีเมล/เบอร์ยืนยัน/ข้อมูลส่วนตัว/รหัสผ่านครบ พร้อมนำเบอร์ไปเติมข้อมูลติดต่อขั้นที่อยู่ (แก้ผู้ติดต่อในที่อยู่แยกได้)
- ปุ่มถัดไปขั้น 1–3 กดตรวจได้ แสดง error ณ ช่องแรกที่ไม่ผ่านและโฟกัสให้; รองรับ input/change และอ่านค่าปัจจุบันก่อนตรวจ ลดอาการดูเหมือนปุ่มค้าง ขั้นสุดท้ายยังต้องให้ความยินยอมก่อนสมัคร
- บันทึก email และ verified phone ไป user คนเดียวกัน ใช้ร่วมหน้าบัญชี/ข้อมูลติดต่อ ไม่บันทึกรหัส OTP หรือ password ใน user object
- /flow ใช้พรีวิว C105 จริง; เพิ่ม Google ใหม่, กรอกเบอร์, ส่งแล้ว, รหัสผิด, หมดอายุ, ส่งซ้ำ, ยืนยันแล้ว, เปลี่ยนเบอร์, ส่งล้มเหลว และข้อมูลครบไปขั้นที่อยู่
- ตรวจในเบราว์เซอร์: เคส filled เดิมไปขั้น 2 ได้ ไม่พบอาการค้างแบบตายตัว; เพิ่มการรายงาน validation และรับค่า autofill แทนการสรุปสาเหตุโดยไม่มีหลักฐาน

หลักฐาน UX: [GOV.UK Confirm a phone number](https://design-system.service.gov.uk/patterns/confirm-a-phone-number/) แนะนำยืนยันมือถือด้วย SMS, autocomplete one-time-code, รองรับการส่งใหม่และเปลี่ยนเบอร์ การจัดให้อยู่ภายในฟอร์มคือการออกแบบของโครงการนี้ ไม่ใช่ผลทดสอบกับคนไข้
Google: [Verify Google ID token](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token) ตรวจ token ฝั่ง server และใช้ sub เป็นตัวเชื่อมบัญชี ห้ามเชื่อ email จาก query/client อย่างเดียว


## แผงต้นแบบและสเปกที่สร้างจากโค้ด — 7 พฤศจิกายน 2026

- ต้นแบบรวมเครื่องมือไว้แผงขวา: จอปัจจุบันและบันทึกสเปก, สถานะตัวอย่าง, จำลองเภสัชกรตามบริบท, สวิตช์ทั้งแอป, ไปจอ และเริ่มใหม่ ไม่มี sidebar ซ้าย มีป้ายรหัสจอและปุ่มเปิดแผงบนมือถือ
- เครื่องมือจำลองเป็นส่วนของ preview ไม่ใช่เมนูจริงของผู้ใช้ เภสัชกร หรือแอดมิน และไม่ยืนยันว่ามีระบบหลังบ้านรองรับแล้ว
- สเปกหน้าจออ้างอิง docs/screen-specs.md ซึ่งสร้างจาก notes / wait / states ใน public/runtime/customer.js พร้อม manifests และคู่มือเหตุการณ์ด้วย screens:sync; screens:check ต้องไม่ผ่านเมื่อเอกสารเก่า ห้ามแก้ไฟล์สเปกที่สร้างแล้วโดยตรง
- /flow ใช้หน้าจอจริงและ state เดียวกับแอป ต้องตรวจลิงก์เมื่อปรับ registry และคงรหัสเคสเดิม

- 7 พฤศจิกายน 2026: C102 ลดช่องว่าง label กับช่องกรอกอีเมล/รหัสผ่านตาม token เดียวกันในหน้าจริงและ /flow; ไม่มีการเปลี่ยนขั้นตอนหรือข้อมูลฝั่งเภสัชกร/แอดมิน

7 พฤศจิกายน 2026: C102 กระชับช่องว่างภายในกล่องเข้าสู่ระบบเพิ่มเติม โดยคงขนาดปุ่มและช่องกรอก; /flow ใช้หน้าจริงเดียวกัน ไม่มีการเปลี่ยนโฟลว์หรือข้อมูลฝั่งเภสัชกร/แอดมิน

7 พฤศจิกายน 2026: C102 เพิ่มจำไว้ในระบบ (ไม่เลือกเริ่มต้น) และลืมรหัสผ่านใต้ช่องรหัสผ่าน; C115 เปิดฟอร์มอีเมลและผลส่งคำขอแบบกลาง ต้นแบบไม่ส่งเมลจริง ระบบจริงต้องใช้ลิงก์ครั้งเดียวหมดอายุและ session policy ฝั่ง server ไม่เก็บรหัสผ่านใน browser storage. /flow ใช้หน้าจริงร่วมกัน ฝั่งเภสัชกรไม่มีสิทธิ์ดูรหัสผ่าน แอดมินดูได้เฉพาะเหตุการณ์กู้บัญชีที่จำเป็น

7 พฤศจิกายน 2026: C115 ลืมรหัสผ่านเป็นหน้าแยกจาก C102 พร้อมปุ่มย้อนกลับและส่งคำขอในหน้าเดิม ไม่เปิดแผ่นเลื่อน; /flow A115 ใช้หน้าจริงทั้งกรอกและส่งแล้ว ระบบจริง/สิทธิ์ฝั่งเภสัชกรและแอดมินคงเดิม


### C115 — หน้าส่งคำขอตั้งรหัสผ่าน (7 พฤศจิกายน 2026)
- แสดงภาพซองจดหมาย 3D สี CI พร้อมหัวข้อ “ตรวจสอบอีเมลของคุณ” และคำแนะนำตรวจจดหมายขยะ
- ปุ่ม “ส่งอีเมลอีกครั้ง” อยู่ในหน้าเดิม รอ 60 วินาทีหลังส่งแต่ละครั้ง พร้อมข้อความสถานะ; มีปุ่มกลับไปเข้าสู่ระบบ
- ต้นแบบจำลองคำขอเท่านั้น ไม่ส่งอีเมลจริง; ระบบจริงตอบแบบเดียวกันทั้งอีเมลที่มีและไม่มีบัญชี ใช้บริการยืนยันตัวตนสำหรับลิงก์และการจำกัดการส่งซ้ำ
- ฝั่งเภสัชไม่ต้องดำเนินการตั้งรหัสผ่านให้ผู้ใช้; ฝั่งแอดมินติดตามข้อผิดพลาดผ่านบริการยืนยันตัวตน ไม่แสดงรหัสผ่านหรือลิงก์ลับ
- /flow A115 ใช้หน้าจอจริงร่วมกัน; หลักฐานการจัดหน้า: https://design-system.service.gov.uk/patterns/confirmation-pages/ — แสดงสิ่งที่เกิดขึ้นและขั้นตอนถัดไปชัดเจน (การเลือกภาพและระยะเป็นข้อเสนอการออกแบบ ยังไม่ได้ทดสอบกับคนไข้)


### C203 — ระยะฟอร์มก่อนปรึกษา (7 พฤศจิกายน 2026)
ลดช่องว่างบนฟอร์มเป็น 20px ระหว่างส่วนเป็น 16px และระยะเหนือหัวข้อแต่ละส่วนเป็น 12px; ลดระยะซ้อนก่อนช่องอาการและแนบรูป โดยคงขนาดช่องกรอก ปุ่ม และข้อมูลเดิม /flow ใช้หน้าจอจริงจึงปรับตรงกัน ฝั่งเภสัชและแอดมินไม่มีการเปลี่ยนข้อมูลหรือขั้นตอนจากการปรับระยะนี้


### C308 / C402 — คำขอใบกำกับร่วมกัน (7 พฤศจิกายน 2026)
ลูกค้าเลือกขอใบกำกับขณะชำระเงินแล้ว เมื่อเปิดใบเสร็จของคำสั่งซื้อเดียวกันต้องเห็นสถานะรอดำเนินการทันที ไม่ขอซ้ำ; ออกใบแล้วจึงมีปุ่มดาวน์โหลด PDF ในท้ายการ์ด
C402 รายการที่ยังไม่ได้ขอ: เปลี่ยนแท็บซ้อนเป็นสวิตช์ขอใบกำกับ แล้วแสดงตัวเลือกผู้รับแบบ radio บุคคลธรรมดา/นิติบุคคล การ์ดข้อมูลแก้ไขได้ และปุ่มส่งคำขอที่ท้ายการ์ด; เลย 7 วันซ่อนเฉพาะการขอใหม่ คำขอเดิมยังดูสถานะและโหลดไฟล์ได้ /flow ใช้ UI จริงเดียวกัน
หลักฐาน UX: https://design-system.service.gov.uk/components/checkboxes/ รองรับการเปิดรายละเอียดตามตัวเลือก; https://design-system.service.gov.uk/components/select/ แนะนำตัวเลือกที่มองเห็นได้ก่อน select สำหรับตัวเลือกน้อย การใช้สวิตช์และ radio เป็นข้อเสนอการออกแบบ ยังไม่ได้ทดสอบกับคนไข้


7 พฤศจิกายน 2026: C403 ปรับแท็กสถานะสำเร็จเป็นพื้นเขียวอ่อน ตัวอักษรเขียวเข้มจาก success token ตามภาพอ้างอิง; คงข้อความและเงื่อนไขสถานะเดิม /flow ใช้หน้าจอจริงเดียวกัน ไม่มีการเปลี่ยนข้อมูลหรือขั้นตอนฝั่งเภสัช/แอดมิน

7 พฤศจิกายน 2026: C402 หัวการ์ดขอใบกำกับเพิ่มไอคอนเอกสารด้านซ้าย ลดช่องว่างหัวข้อกับคำอธิบายเป็น 4px และระยะบนล่างเป็น 12px; /flow ใช้ UI เดียวกัน ไม่มีการเปลี่ยนขั้นตอนหรือข้อมูลหลังบ้าน


### สถานะร้าน — 7 พฤศจิกายน 2026
- เปิดรับบริการ: แท็กเขียว
- ปิดรับบริการ: แท็กเทา
- ปิดรับชั่วคราว: แท็กเหลือง
หน้าแรก C201 และข้อมูลร้าน C212 ใช้สถานะชุดเดียวกัน ดูรายละเอียดได้ทุกสถานะ ระยะให้บริการเป็นข้อมูลแยก ไม่แทนสถานะร้าน /flow ใช้หน้าจริงและเคสเปิด/ปิด/พักเดิม ไม่มีการเปลี่ยนการรับคิวจากงานปรับป้ายนี้


### ผู้รับใบกำกับภาษีหลายรายการ — 7 พฤศจิกายน 2569
ข้อกำหนดนี้แทนกฎเดิมที่เก็บได้ประเภทละหนึ่งรายการ: C518 แยกบุคคลธรรมดา/นิติบุคคล และเพิ่มได้หลายรายการในแต่ละหมวด การ์ดสั้นแสดงชื่อ เลขผู้เสียภาษีปิดบางส่วน เบอร์และที่อยู่รวม หัวพื้นเทาอ่อนมีปุ่มแก้ไขทางขวา ไม่มีปุ่มท้ายการ์ด ปุ่มลบอยู่ในหน้าต่างแก้ไขและต้องยืนยันเฉพาะรายการ เพิ่มหรือแก้ไขใช้ฟอร์มเดิม C519 ปิด/ยกเลิกไม่บันทึก การเลือกประเภทไม่ลบรายการของอีกหมวด
C308/C402 ใช้รายการผู้รับชุดเดียวกันและเลือกได้ครั้งละหนึ่งรายการ เมื่อจ่ายเงินพร้อมขอใบกำกับหรือส่งคำขอภายหลัง ให้เก็บ snapshot ของผู้รับที่เลือก การแก้หรือลบในบัญชีไม่เปลี่ยนคำขอที่ส่งแล้ว /flow ใช้ UI จริงของ C518/C519 และเพิ่มเคสหลายบุคคล/หลายนิติบุคคลต่อท้ายโดยไม่เลื่อนเลขเดิม
ต้นแบบยังเป็นข้อมูลจำลองใน session; ระบบจริงต้องมี recipient ID, owner ID, ประเภท, ข้อมูลติดต่อ/ภาษี/ที่อยู่, CRUD เฉพาะเจ้าของ และ order-tax snapshot ฝั่งเซิร์ฟเวอร์ เภสัช/แอดมินเห็นเฉพาะผู้รับที่แนบคำขอและสิทธิ์งานเอกสาร ไม่ใช้ข้อมูลรายการอื่นของผู้ใช้หรือเปลี่ยนเอกสารที่ออกแล้วจากการแก้สมุดผู้รับ
แนวทาง UX: [GOV.UK Check answers](https://design-system.service.gov.uk/patterns/check-answers/) แนะนำ summary card สำหรับข้อมูลชนิดเดียวกันหลายชุด และคงข้อมูลเดิมเมื่อแก้; [DWP Add another thing](https://design-system.dwp.gov.uk/patterns/add-another-thing/how-it-works) ใช้เพิ่ม/แก้/ลบเป็นรายรายการและยืนยันก่อนลบ นำมาปรับกับการ์ดสั้นในหมวดผู้รับ ไม่ได้อ้างว่าได้ทดสอบกับผู้ป่วยแล้ว

### C518 รายการผู้รับ — 7 พฤศจิกายน 2569
- ต้นแบบทั้งบุคคลธรรมดาและนิติบุคคล: เมื่อไม่มีข้อมูลแสดง Empty พร้อมภาพเอกสาร กดเพิ่มข้อมูลจึงเปิดฟอร์ม C519 ไม่แสดงฟอร์มในหน้ารายการ
- ลดระยะระหว่างแท็บ หัวข้อ และการ์ด เรียงเนื้อหาการ์ดเป็นที่อยู่ โทรศัพท์ อีเมล และเลขผู้เสียภาษี (ปกปิดตามเดิม) หากไม่มีอีเมลแสดง — ไม่สร้างข้อมูลขึ้นเอง
- /flow ใช้หน้าจอจริง ฝั่งเภสัชและแอดมินไม่มีสิทธิ์หรือขั้นตอนใหม่จากการปรับนี้


### การ์ดแจ้งเตือน C404 — 7 พฤศจิกายน 2569
C404 แสดงการ์ดมุมมน ไอคอนซ้าย หัวข้อเป็นสถานะหลัก ข้อความรองอธิบายสิ่งที่ทำต่อได้ เวลาอยู่ขวา แบ่งตามวันและเรียงล่าสุดก่อน ไม่ใช้ชื่อร้านเป็นหัวข้อ ตัวอย่าง 10 รายการครอบคลุมรับคิว ข้อความ รอชำระ ชำระสำเร็จ เตรียมยา เรียกไรเดอร์ ส่งยา พร้อมรับ และส่งสำเร็จ รวมใบสรุป; คลิกเปิดรายละเอียดเดิม /flow ใช้จอจริงเดียวกัน ไม่แยกวาดหน้าจอ

อ้างอิงการออกแบบ: https://www.nngroup.com/articles/indicators-validations-notifications/ — ใช้หัวข้อบอกการเปลี่ยนสถานะและข้อความรองให้บริบท ไม่ใช้ popup ขัดจังหวะกับรายการทั่วไป ยังไม่ได้ทดสอบกับผู้ป่วยจริง


## Preview resource policy (2026-11-07)

- `/flow` embeds the real UI and loads each iframe only when it enters the viewport.
- Keep loaded frames mounted to preserve edits. Pause canvas animation and expiry display polling offscreen or in hidden tabs. Reconcile against the original deadline on return; never extend order validity.
- This changes preview scheduling only, not customer workflows or pharmacist/admin permissions. Production services must enforce deadlines independently.


## C402 / C421 เลือกผู้รับใบกำกับภาษี — 7 พฤศจิกายน 2026
- C402 เริ่มเป็นกล่อง checkbox “ต้องการใบกำกับภาษี” พร้อมปุ่มเลือกข้อมูลด้านขวา กดแล้วเปิด C421 ไม่แสดงแท็บซ้อนในใบเสร็จ
- C421 ใช้รายการเดียวกับ C518 แยกบุคคลธรรมดา/นิติบุคคล รองรับหลายรายการและ empty พร้อมเพิ่มข้อมูลผ่านฟอร์มเดิม ไม่มีปุ่มลบในจุดเลือก
- เลือกการ์ดแล้วกลับ C402 แสดงชื่อ ที่อยู่ โทรศัพท์ อีเมล (ไม่มีแสดง —) เลขผู้เสียภาษีปิดบางส่วน และสาขาถ้ามี ปิดโดยไม่เลือกไม่เปลี่ยนข้อมูล
- การเลือกยังไม่ส่งคำขอ ต้องกดส่งคำขออีกครั้ง หลังส่งแสดงรอดำเนินการ ออกใบแล้วแสดงปุ่ม PDF หากขอไว้ตอนชำระเงินข้ามขั้นเลือกไปสถานะเดิม
- ยังไม่เปิดบริการส่งเอกสารทางอีเมล จึงไม่เพิ่มตัวเลือก e-Receipt จากภาพอ้างอิงโดยไม่มีบริการรองรับ
- /flow A303 มีสถานะเลือกผู้รับแล้ว และ A306 ใช้ C421 จริง
- หลักฐานออกแบบ: [GOV.UK Check answers](https://design-system.service.gov.uk/patterns/check-answers/) และ [NHS Check answers](https://service-manual.nhs.uk/design-system/patterns/check-answers/) สนับสนุนสรุปข้อมูลก่อนส่งและทางเปลี่ยนข้อมูลโดยคงค่าที่กรอก นำมาปรับกับการเลือกผู้รับ ยังไม่ได้ทดสอบกับผู้ป่วยจริง


## Current event review — 7 November 2026

Current checkout scope is pickup and express only. Retired parcel/cold-chain preview choices and duplicate/design-only events are hidden without renumbering. Unknown distance is not outside coverage. Login errors, queue notices, address validation/retry and follow-up fixtures now show their actual states. See [customer event review](docs/customer-event-review.md) for all reserved codes, browser evidence and limits. C402/C421 uses shared tax recipients; selecting a record is separate from submitting a request.


## ยกเลิกหน้า C113 — 7 พฤศจิกายน 2026

ลบแผ่นเลือกช่องทางลงทะเบียน C113 (registermethod) และ action ที่ใช้เฉพาะหน้านี้ออกแล้ว ปุ่มลงทะเบียน C102 เปิด C105 ขั้นแรกโดยตรง ไม่มีหน้าคั่น C113 ในแผงพรีวิว /screens หรือ /flow คงรหัส C114 และรหัสอื่นเดิม ไม่เลื่อนเลข ไม่เปลี่ยน C103/C104 หรือการสมัครผ่าน Google การลบหน้าคั่นไม่เปลี่ยนสิทธิ์หรือข้อมูลฝั่งเภสัชกร/แอดมิน


## ยกเลิกหน้ารับรหัสแยก C103 และ C104 — 7 พฤศจิกายน 2026
ลบหน้ารับรหัสทางโทรศัพท์ C103 (loginphone) และทางอีเมล C104 (loginemail) ออกจากต้นแบบ แผงพรีวิว /screens และ /flow ตามคำสั่งล่าสุด เข้าสู่ระบบด้วยอีเมลและรหัสผ่านหรือ Google ที่ C102 ลงทะเบียนตรง C105 โดยคงการยืนยันเบอร์ด้วย OTP ในฟอร์มสมัครเดิม ไม่ลบรหัสหน้าที่เหลือหรือเลื่อนเลข ฝั่งเภสัชกรและแอดมินรับข้อมูลบัญชีที่ยืนยันจากขั้นสมัครเดิม ไม่มีหน้ารับรหัสแยกที่ต้องรองรับเพิ่ม


### C112 — แนะนำแอป 7 พฤศจิกายน 2569
- ปรับภาพและเนื้อหา 3 หน้า: เภสัชกรที่ตรวจสอบได้ เลือกสาขาที่เปิดรับ และขั้นตอน/ข้อจำกัดการปรึกษา
- /flow A116 ใช้หน้าจอจริงทั้ง p1/p2/p3 ปัด แตะจุด ถัดไป ข้าม หรือเริ่มใช้งานไป C102 ได้ ไม่มีขั้นบังคับเพิ่ม
- ไม่มีการฝากคำถามนอกเวลาบริการ ภาพเป็นภาพจำลอง ไม่ใช่ข้อมูลใบอนุญาตจริง ฝั่งเภสัชกรและแอดมินไม่มีเมนูใหม่ ข้อมูลเวลาและผู้ให้บริการต้องเชื่อมสาขาจริง

- C112 ปรับภาพแนะนำเป็นการ์ดภาพซ้อนแบบคอลลาจตามเรฟล่าสุด พื้นขาว หัวข้อกึ่งกลางและปุ่มล่าง ใช้เนื้อหา/สถานะเดิมทั้งสามหน้า /flow แสดง UI เดียวกัน ไม่มีขั้นตอนหรือเมนูจัดการเพิ่ม

- C112 เปลี่ยนภาพทั้งสามหน้าเป็นภาพเจนแนวภาพถ่ายสมจริงแทนการ์ตูน คงการ์ดซ้อนและโฟลเดิม /flow ใช้ assets เดียวกัน ภาพบุคคลและร้านยังเป็นภาพจำลอง ไม่ใช่ข้อมูลผู้ให้บริการจริง


### สถานะสาขา · 7 พฤศจิกายน 2569
- C201/C212: ในระยะไม่เกิน 15 กม. แสดงเปิดรับบริการ (เขียว), ปิดรับบริการ (เทา), ปิดรับชั่วคราว (เหลือง); เกิน 15 กม. ใช้แท็กนอกพื้นที่ให้บริการแทนสถานะร้าน โดยยังเปิดดูรายละเอียดร้านได้
- ต้นแบบหน้าแรกมีข้อมูลจำลองครบ 4 แบบ และเคส branch-statuses ในแผงทดสอบและ /flow; ฝั่งร้าน/ผู้ดูแลใช้สถานะเปิด/ปิด/พัก ส่วนระยะคำนวณตามที่อยู่ลูกค้า ไม่ใช่สถานะที่ร้านตั้งเอง


### สาขาปิดรับชั่วคราว · 7 พฤศจิกายน 2569
C212 ยังเปิดดูข้อมูลร้านได้ แต่ไม่แสดงปุ่มปรึกษาเภสัชและไม่ให้เริ่มคิวใหม่ขณะสถานะ pause; แสดงข้อความให้เลือกสาขาที่เปิดรับบริการ ไม่เปลี่ยนการปรึกษาที่ค้างอยู่เดิม /flow ใช้หน้าจอจริงร่วมกัน


### ฟอร์มก่อนปรึกษา C203 · 7 พฤศจิกายน 2569
นำหมวดตรวจอาการอันตรายออกจากฟอร์มลูกค้าและเลื่อนข้อมูลก่อนปรึกษาเป็นข้อ 3; ไม่ส่งข้อมูลจากช่องคัดกรองที่ยกเลิกเป็นข้อมูลใหม่ ฝั่งเภสัชกรยังประเมินจากข้อความอาการและการสนทนา ไม่ถือว่าการไม่มีช่องนี้แปลว่าไม่มีอาการอันตราย /flow ใช้ฟอร์มจริงเดียวกัน


### C402 — ปรับการเลือกใบกำกับภาษี (7 พฤศจิกายน 2569)
ต้นแบบใช้หัวการ์ดไอคอนเอกสาร ชื่อและระยะเวลาขอเอกสาร พร้อม checkbox ที่กดได้ทั้งแถว เปิด C421 เพื่อเลือกข้อมูลผู้รับเดิม เมื่อเลือกแล้วแสดงข้อมูลและปุ่มเปลี่ยนผู้รับก่อนส่งคำขอ สถานะรอดำเนินการ/ออกใบแล้วและปุ่ม PDF คงเดิม ไม่เปลี่ยนขั้นตอนฝั่งร้านหรือแอดมิน


### C201 / C403 — การ์ดระหว่างดำเนินการรูปแบบร่วม (7 พฤศจิกายน 2569)
ต้นแบบใช้หัวการ์ดไอคอนตามเหตุการณ์ (รอคิว/พัก/สนทนา/ชำระเงิน/รับที่ร้าน/ขนส่ง) พร้อมแท็กสถานะ เนื้อหากลางบอกขั้นตอนปัจจุบันและสาขา ท้ายการ์ดรวมเฉพาะปุ่มทำต่อ คิวและข้อมูลบุคลากร ยอดเงิน เวลาชำระ และเลขคำสั่งซื้อใช้ข้อมูลเดิม ไม่แสดงรหัสเคสเพิ่ม การ์ดที่นำกลับมาใช้ในประวัติและ /flow ใช้ renderer เดียวกัน ไม่เปลี่ยน transition ฝั่งเภสัชกรหรือแอดมิน


## ภาพรวมการ์ดสถานะ — 7 พฤศจิกายน 2569
- ต้นแบบ `/card-status-all` รวม 3 รูปแบบการ์ด 22 ตัวอย่าง แยกรอปรึกษา ชำระเงิน รับที่ร้าน ส่งด่วน และจัดส่งปกติ ใช้ renderer เดียวกับหน้าแรกและประวัติ กดทำรายการต่อในตัวอย่างได้
- หน้านี้เป็นเครื่องมือรีวิวต้นแบบ ไม่ใช่เมนูผู้ใช้หรือ dashboard จริง แต่ละตัวอย่างแยกข้อมูลจำลอง ไม่เพิ่มสถานะธุรกิจใหม่
- C403 ลดช่องว่างระหว่างการ์ดกำลังดำเนินการกับประวัติรายเดือนให้เหลือระยะเดียว 16px

- `/card-status-all` แสดงเฉพาะก้อนการ์ดจริงตรงกลางบนพื้นอ่อน ไม่แสดงเมนูล่างหรือกรอบจอ ความสูงพรีวิวปรับตามเนื้อหาการ์ดและโหลดเมื่อเลื่อนถึง

- ในภาพรวมการ์ด เมื่อกดแอคชั่นจะขยาย iframe เดิมเป็นป๊อปอัปทรง iPhone ให้ทำรายการต่อได้ คลิกพื้นหลัง dim ปุ่มปิด หรือ Escape เพื่อปิดและคืนตัวอย่างเริ่มต้น เฉพาะเครื่องมือรีวิว ไม่เปลี่ยน flow ในแอปจริง


## ห้องรอเภสัชกร C207 / C303 — 7 พฤศจิกายน 2569
- หลังส่งข้อมูล C203 เปิดห้องแชทเดิมระหว่างค้นหา/รอคิว: หัวข้อ “แชทกับเภสัชกร” ปุ่มย่อซ้าย ยกเลิกขวา แถบสถานะพื้นขาวไอคอนค้นหา และจำนวนคิวปัจจุบัน ไม่มีเวลารอประมาณที่ยังไม่มีข้อมูลรองรับ
- ไม่แสดงชื่อหรือรูปเภสัชกรก่อนรับเคส ไม่มีปุ่มแจ้งอาการลอย คงกล้อง ช่องข้อความ ส่งข้อความ และร่างระหว่างรอ เมื่อเภสัชกรรับเคสเปลี่ยนเป็นหน้าสนทนาเดิมพร้อมข้อความเดิม โหมดรอวิดีโอคงเดิม
- /flow ใช้ห้องจริงร่วมกัน จึงแสดงดีไซน์ล่าสุดโดยตรง; ระบบจริงต้องส่งสถานะคิว/พัก/รับเคสจากบริการคิว ไม่อนุมานเวลาจากจำนวนคน
- แนวทางสถานะเข้าถึงได้: [W3C ARIA22](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22) ใช้ role=status และ aria-atomic เพื่อแจ้งคิวอัปเดตโดยไม่ย้ายโฟกัส ไม่ได้อ้างว่าทดสอบกับผู้ป่วยแล้ว

### ส่วนบนห้องสนทนาเมื่อรับคิว — 7 พฤศจิกายน 2569
- C303 แสดงโปรไฟล์ ชื่อ ใบอนุญาตและชื่อสาขาจากเคส ใต้หัวข้อแชทกับเภสัชกร ปุ่มวิดีโอคอลอย่างเดียวข้างโปรไฟล์ ไม่มีปุ่มโทร
- พื้นสนทนาเทาอ่อน ข้อความลูกค้า Primary/ตัวอักษรขาว ข้อความเภสัชกรพื้นขาว ทุกปุ่มเป็นภาษาไทย กล้องส่งรูปคงเดิม
- คงการเข้าร่วมวิดีโอจากคำขอเภสัชกร ปุ่มบนหัวห้องแนะนำให้แจ้งในแชทหากยังไม่มีคำขอที่ยอมรับ ไม่เริ่มกล้องเอง /flow แสดงหน้าจอจริงเดียวกัน

- C207 ล่าสุด: แถบรอคิวสี Primary พร้อมแสงไล่ผ่านเบา ๆ หยุดแอนิเมชันเมื่อผู้ใช้ลดการเคลื่อนไหว พื้นแชทเทาอ่อน /flow ใช้ UI เดียวกัน
- C303 แถบโปรไฟล์เภสัชกรใช้พื้น Primary ข้อความขาว ไม่มีแสงเคลื่อนไหว

- C303: ลด padding แนวตั้งแถบเภสัชกรเป็น 4px และความสูงขั้นต่ำ 60px พื้นที่แชทและแถบคอล/ออฟไลน์ขยับตาม โดย /flow ใช้หน้าจอเดียวกัน

- C303 ล่าสุด: ไม่แสดงการ์ดข้อมูลก่อนปรึกษาในห้องแชททั้งตอนรับคิวและกลับเข้าห้อง ข้อมูลอาการ ประวัติแพ้ยา และยาประจำยังคงในเคสสำหรับฝั่งเภสัชกร ไม่ลบข้อมูลต้นทาง /flow ใช้หน้าจอจริงเดียวกัน


C207/C303 ล่าสุด: หัวห้องขณะรอแสดง “ยกเลิก” สีแดง เปิดยืนยันยกเลิกคิว; เมื่อเภสัชรับแล้วแสดง “จบสนทนา” สีแดง เปิดยืนยันจบโดยตรง ยกเลิกเมนูตัวเลือก C304 ข้อมูลเคสและการชำระเงินยังใช้กติกาเดิม /flow แสดงหน้าจอจริงเดียวกัน


C303 รายการยาที่เภสัชกรส่ง: การ์ดหัว–เนื้อหา–ท้าย แสดงรูป ชื่อ จำนวน วิธีใช้ ราคาต่อรายการ และรวมค่ายา จาก order.items เดียวกับบิล/ใบสรุป ไม่มีปุ่มชำระเงินหรือคำสั่งซื้อในการ์ด ผู้ใช้ถามวิธีใช้ต่อได้ การชำระเงินเปิดหลังจบแชทตามกติกาเดิม เคส order ใช้พรีวิวใน /flow ด้วย


แผงพรีวิวหมวดระหว่างปรึกษามีทางลัด C303.2 “เภสัชกรส่งรายละเอียดรายการยา” เปิดเคส order โดยตรง และ C305 ใช้ชื่อ “จบสนทนา” ให้ตรงกับปุ่มหัวแชท ทางลัดนี้เป็นเครื่องมือพรีวิว ไม่ใช่เมนูในแอปจริง


ปรับภาพ C303.2: การ์ดรายการยาจากเภสัชกรใช้พื้นขาวทั้งหัว เนื้อหา และท้าย ตัดไอคอนยาที่หัวออก แยกส่วนด้วยเส้นคั่นและเงาการ์ด ยอดรวมสี Primary; ข้อมูลและการทำงานเดิม /flow แสดงหน้าจอจริงเดียวกัน

C303.2 ท้ายการ์ดรายการยาแสดงข้อความแจ้งพื้นเหลือง “โปรดแจ้งเภสัชกร หากต้องการแก้ไขรายการยา” ให้ผู้ใช้ขอปรับรายการผ่านเภสัชกรในแชท ไม่มีปุ่มแก้รายการเอง


C303/C303.3 ตะกร้ายาระหว่างสนทนา: เมื่อเภสัชกรส่งยา แสดงแถบตะกร้ายาเหนือช่องพิมพ์ กดเปิดแผ่นตะกร้า แสดงรูป ชื่อ จำนวน วิธีใช้ ราคา และยอดรวมจาก order.items เดียวกับการ์ดแชท/ใบเสร็จ ไม่มีปุ่มชำระหรือแก้จำนวน; ปิดกลับแชทและคงข้อความร่าง มีเคสพรีวิวรายการยา/ยังไม่มีรายการยาใน /flow ปรับยอดรวมในการ์ดแชทเป็นขนาด body เพื่อไม่เด่นเกินชื่อรายการ

อ้างอิงการออกแบบ C303.3: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ — ใช้ sheet เดิมที่ dim พื้นหลัง มีปุ่มปิด และคืน focus กลับปุ่มเรียก; เป็นการตัดสินใจออกแบบ ยังไม่ได้ทดสอบกับคนไข้จริง

รูปแบบข้อมูลยาร่วมทั้งแอป: จำนวนใช้ “จำนวน: <จำนวนและหน่วยเดิม>” เช่น 1 กล่อง/แผง/ขวด/หลอด; วิธีใช้ขึ้นต้น “วิธีใช้:” ใช้ร่วมในรายการแชท ตะกร้า ใบเสร็จ สถานะรับยา และรายละเอียดประวัติ ไม่เปลี่ยนปริมาณหรือคำสั่งใช้ยา

แถบตะกร้า C303 อยู่แยกเหนือส่วนพิมพ์ข้อความ ติดกันเต็มความกว้าง ไม่แทรกอยู่ในแถวกล้อง/ช่องพิมพ์/ส่ง

ส่วนแสดงรายการยาร่วมไม่แสดงข้อความประเภทยา เช่น ต้องจ่ายโดยเภสัชกร/ยาสามัญประจำบ้าน บรรทัดจำนวนแสดงเพียงจำนวนและหน่วย ข้อมูลประเภทในรายการยายังคงอยู่สำหรับระบบฝั่งร้าน

แถบตะกร้าใช้ไอคอนตะกร้าหูหิ้วในชุดไอคอนร่วม สี Primary หน้าข้อความตะกร้ายา

C303 แถบตะกร้าใช้ gradient จาก brand-deep ไป brand พร้อมข้อความ/ไอคอนสีขาว เพื่อแยกจากพื้นที่แชทและช่องพิมพ์


### อัปเดต 7 พฤศจิกายน 2026: วิดีโอและข้อมูลในห้องแชท

C303 วิดีโอคอล: แตะไอคอนในหัวแชทเข้าห้อง C306 สถานะรอเภสัชกรทันที เริ่มจับเวลาเมื่อเภสัชกรเข้าร่วม ย่อไปแชทแล้วกลับเข้าห้องเดิมได้ ปุ่มวางสายยังยืนยันก่อนออก

C303.4: แตะชื่อหรือรูปเภสัชกรเปิดป๊อปอัปกลางจอ แสดงรูป ชื่อเต็ม เลขใบอนุญาต สาขา และใบอนุญาตร้านจากเคสเดิม ปิดแล้วคงแชทและร่างข้อความ

C303.3: ปกตะกร้ายาใช้ภาพ 3D ยาสี CI ใน public/assets/illustrations/medicine-basket-cover-v1.png /flow ใช้หน้าจอจริงเดียวกัน


อัปเดต C306: ไม่แสดงการ์ดข้อมูล/ยืนยันตัวตนเภสัชกรกลางหน้าวิดีโอ ทั้งตอนรอและเชื่อมต่อ ข้อมูลผู้ให้บริการดูจากป๊อปอัปในหัวแชท C303.4 แถบกลับเข้าสายในแชทใช้สี brand-deep และแสดงสถานะรอโดยไม่คำนวณเวลาจากค่าว่าง

C303.3 ปกตะกร้าใช้ภาพแบนเนอร์เต็มพื้นหลัง medicine-basket-banner-v2.png แทนภาพตะกร้าแยกชิ้น ข้อความและจำนวนรายการเป็นข้อมูลจริงวางทับด้านซ้าย

C306 ปกหน้ารอสายใช้รูปเภสัชกรของเคสบนพื้น Primary เข้ม วงแสงเคลื่อนไหวและข้อความกำลังโทรหาเภสัชกร เมื่อเข้าร่วมจึงเริ่มเวลา รองรับลดการเคลื่อนไหว รูปในต้นแบบไม่ใช่สตรีมวิดีโอจริง

C303.3 ปกหัวตะกร้าลดความสูงขั้นต่ำเป็น 104px ให้กระชับและเหลือพื้นที่รายการยา /flow ใช้สไตล์จริงเดียวกัน

แถบตะกร้ายาเหนือช่องพิมพ์ C303 ใช้ภาพพื้นหลังโทนอ่อน medicine-basket-strip-light-v1.png ที่ opacity 0.3 พร้อมข้อความ Primary เข้ม แยกจากปกเต็มภาพในหัว sheet C303.3

อัปเดตแถบตะกร้า C303: พื้นหลัง Primary ข้อความและไอคอนสีขาว ภาพยาเดิมซ้อนจาง 12% เพื่อรักษาความชัดของตัวอักษร ใช้ร่วมในแอปและ /flow

C306 รอสาย: เอฟเฟกต์วงคลื่นน้ำ 4 วงแผ่จากรูปเภสัชกรแล้วจาง ใช้ CSS transform/opacity รอบละ 5.6 วินาที หยุดเมื่อรับสาย รองรับ prefers-reduced-motion เป็นภาพนิ่ง ใช้หน้าจอจริงเดียวกันใน /flow ไม่ใช่ไฟล์วิดีโอ

C306 แผงต้นแบบ: ปุ่มไปจอวิดีโอเปิดสถานะรอเภสัชกรพร้อมคลื่นน้ำทุกครั้ง แม้เคยเลือกคุยอยู่ก่อนหน้า; C306.1 ยังเลือกดูสายที่รับแล้วได้ รหัสสถานะไม่เปลี่ยน /flow ใช้หน้าจอจริงและสถานะรอเดียวกัน เป็นการควบคุม preview ไม่เปลี่ยนกระบวนการรับสายจริง

เมื่อเภสัชกรจบแชท C303 และมียารอชำระ ช่องพิมพ์เปลี่ยนเป็นปุ่ม “ขั้นตอนต่อไป ชำระค่ายา (30 วิ)” กดทันทีหรือครบ 30 วินาทีเข้า C308 ของคำสั่งซื้อเดิม ไม่ให้ส่งข้อความอีก เวลา 15 นาทีเริ่มเมื่อเปิดชำระจริง เคสไม่มีรายการยาไม่แสดงปุ่มนี้ /flow A211 เพิ่ม checkout-handoff รหัสเดิมคงอยู่ ระบบจริงต้องรับเหตุการณ์จบแชทและ order id จากเภสัชกรพร้อมตรวจสิทธิ์ชำระฝั่งเซิร์ฟเวอร์


### C303.5 — เภสัชกรสิ้นสุดสนทนา / ตะกร้ายาตามรายการจริง

หลังเภสัชกรจบสนทนา หากมียารอชำระ แทนช่องพิมพ์ด้วยปุ่ม “ขั้นตอนต่อไป ชำระค่ายา (30 วิ)” กดได้ทันทีหรือเปิดชำระอัตโนมัติเมื่อครบ 30 วินาที ใช้คำสั่งซื้อเดิมและเริ่มเวลาชำระเมื่อเข้าชำระจริง ไม่มีปุ่มนี้ก่อนจบสนทนา หรือเมื่อไม่มียา

แถบตะกร้า C303 เปิด C303.3 เฉพาะเมื่อมีรายการยาที่เภสัชกรเพิ่ม หากลบทั้งหมดให้ซ่อนทันทีและไม่เหลือพื้นที่แถบว่าง ไม่เปิดตะกร้าว่างในโฟลว์ปกติ กรณีสำรอง preview มีภาพตะกร้าว่าง การจำลองฝั่งเภสัชกรมีปุ่มส่งรายการยาและลบยาทั้งหมด ในระบบจริงต้องรับการเปลี่ยนรายการจากบริการข้อมูลเดียวกันทั้งแชท ตะกร้า บิล และใบสรุป

เมื่อกดไปชำระหรือครบเวลานับถอยหลัง ต้องเปลี่ยนเป็นการ์ดรอชำระและหน้าชำระเงิน ไม่กลับห้องแชทเดิม รวมการกดย้อนกลับ เปิดลิงก์ห้องเดิม หรือกดจากแถบปรึกษา ให้ไปสถานะคำสั่งซื้อเดิม ไม่สร้างรายการใหม่


### ปรับโฟลว์ชำระเงินและแผงตัวอย่าง — 7 พฤศจิกายน 2569
- C303.5 เป็นทางลัดเภสัชกรสิ้นสุดสนทนา มีปุ่มนับถอยหลัง 30 วินาทีไป C308 โดยไม่แสดงใบสรุปในช่วงนี้; C305 ใช้ชื่อผู้ใช้กดจบสนทนา
- C308 รองรับรับที่ร้าน ส่งด่วน และจัดส่งปกติ (1–3 วันทำการ ร้านเลือกขนส่ง) ตามความพร้อมของรายการยา
- ขอใบกำกับใน C308 ใช้การ์ดและรายการผู้รับเดียวกับ C402/C518 เลือกจากแผ่นข้อมูลแล้วแสดงรายละเอียด ไม่มีแท็บซ้อน บันทึกคำขอพร้อมการชำระและติดตามสถานะในใบเสร็จ
- ไม่แสดงยกเลิกรายการยานี้และลิงก์นโยบายความเป็นส่วนตัวท้ายหน้าชำระเงิน

- 8 พ.ย. 2569: C308 วิธีรับยาเป็น radio แนวตั้ง 3 แถวพร้อมไอคอน เวลาและค่าส่ง ตัดเส้นคั่นท้ายส่วนรับยาและใบกำกับภาษี; /flow ใช้ UI จริงเดียวกัน

### ปรับหน้าชำระเงิน — 8 พฤศจิกายน 2569
- C308 แสดงคำแนะนำเภสัชกรจากเคสเดียวกับใบสรุปต่อใต้รายการยา หากมีข้อมูล; ที่อยู่จัดส่งใช้การ์ดแยกหัวข้อและเนื้อหา คงที่อยู่ snapshot ของคำสั่งซื้อ
- วิธีรับยาเป็น radio เรียงลงมา 3 วิธี โดยค่าจัดส่งอยู่ด้านขวาของแถว ไม่แยกบรรทัด; หัวข้อเลือกวิธีชำระเงินไม่มีไอคอน
- แผงตัวอย่างเรียง C303.5 หลัง C303.4 ตามรหัส เป็นตัวควบคุม preview ไม่ใช่เมนูระบบจริง; /flow ใช้หน้าจอเดียวกัน

### บิลสแกนพร้อมเพย์ C308 — 8 พฤศจิกายน 2569
- หน้าสแกนใช้การ์ดหัวร้านค้า/วิธีรับยา กลางแสดงยอดเงิน เลขคำสั่งซื้อและยอดแยก แล้วแสดง QR พร้อมเวลาหมดอายุและปุ่มบันทึก QR; ท้ายการ์ดอธิบายสแกนจากรูปในมือถือเครื่องเดียวกัน
- ใช้ยอดและร้านจากคำสั่งซื้อเดียวกับ checkout; สถานะสำเร็จในระบบจริงต้องได้รับการยืนยันจากผู้ให้บริการชำระเงิน ไม่ใช้การกดบันทึกรูปเป็นหลักฐาน ต้นแบบยังเป็นข้อมูลและ QR จำลอง
- เหตุผลด้าน UX: NN/g แนะนำให้เห็นยอดรวมและส่วนประกอบราคาชัดเจนด้านบน https://www.nngroup.com/articles/mobile-checkout-ux/ ; SCB แนะนำร้านตรวจการรับชำระจากธนาคารก่อนส่งมอบ https://www.scb.co.th/th/personal-banking/fraud-fighter/update-fraud/qr-payment-safety-for-merchants/
- การแยกหัว/กลาง/ท้ายและระยะตาม token เป็นการตัดสินใจออกแบบสำหรับต้นแบบ ยังไม่ได้ทดสอบกับผู้ป่วยจริง; /flow แสดง UI เดียวกัน

- 8 พ.ย. 2569 — C308: รูปวิธีชำระเงินขนาด 36px และขอบวิธีรับยาที่ยังไม่เลือกใช้ semantic-border สีอ่อน; /flow ใช้ UI เดียวกัน เป็นการปรับภาพแสดงผล ไม่มีการเปลี่ยนข้อมูลหรือการทำงานฝั่งจัดการ

### C309 — 8 พฤศจิกายน 2569
- การ์ดสถานะใช้หัวข้อสถานะล่าสุดแทนเวลา พร้อมไอคอนขั้นตอนแนวนอน เน้นขั้นตอนปัจจุบันและแสดงคำอธิบายด้านล่าง รองรับรับที่ร้านและจัดส่ง ใช้ข้อมูลเดิมของคำสั่งซื้อ ไม่มีการเปลี่ยนการทำงานฝั่งจัดการ; /flow ใช้หน้าจอเดียวกัน
- อ้างอิงความชัดเจนของขั้นตอนปัจจุบันและขั้นตอนที่เหลือ: https://www.nngroup.com/articles/designing-for-waits-and-interruptions/ รูปแบบเป็นการออกแบบตามเรฟผู้ใช้ ยังไม่ได้ทดสอบ usability กับผู้ใช้จริง


### 8 พฤศจิกายน 2026 — C309 หน้าสถานะยา
- นำก้อนชำระเงินสำเร็จ ไอคอน และยอดเงินขนาดใหญ่ด้านบนออก เปลี่ยนชื่อหน้าเป็น “สถานะยา” เพื่อเน้นติดตามการรับ/จัดส่งยา
- คงรหัสรับยา กล่องสถานะล่าสุด และรายละเอียดคำสั่งซื้อเดิม ยอดเงินยังดูได้ในรายละเอียดคำสั่งซื้อ ไม่มีการเปลี่ยนสถานะหรือการทำงานฝั่งเภสัชกร/แอดมิน
- /flow แสดงหน้าจริงเดียวกัน จึงสะท้อนการปรับนี้ด้วย


### 8 พฤศจิกายน 2026 — ผลชำระเงินและรายการยา
- C311 แสดงหลังยืนยันชำระสำเร็จ พร้อมภาพตะกร้ายาฉลอง เลขคำสั่งซื้อ ปุ่มดูสถานะจัดส่งยา และกลับหน้าหลัก
- C609 มีภาพชำระไม่สำเร็จและปุ่มลองใหม่ กลับ C308 โดยคง expiresAt เดิม ไม่เพิ่มเวลา ไม่กลับแชท หมดเวลาแล้วใช้โฟลว์หมดเวลาชำระเดิม
- C309 ใช้รายการยา component เดียวกับแชท มีรูป จำนวน และวิธีใช้ คงยอดค่ายา ค่าจัดส่ง และยอดชำระเดิม
- /flow ใช้หน้าจริงและเพิ่มตัวอย่างผลชำระเงิน เภสัชกรและแอดมินใช้สถานะยืนยันจากผู้ให้บริการชำระเงินและข้อมูลคำสั่งซื้อเดียวกัน

- เพิ่มเติม: C309 วางกล่องสถานะล่าสุดไว้บนสุดก่อนรหัสรับยาเสมอ และเลขคำสั่งซื้อใช้แหล่งกลางเดียวกัน (order.no) ทุกหน้า ไม่สร้างเลขสุ่มใหม่เมื่อเปิดดูผลสำเร็จ/สถานะยา/ใบเสร็จ ประวัติเดิมใช้เลขที่บันทึกไว้

### 8 พฤศจิกายน 2569 — C309 ไทม์ไลน์สถานะยาแนวตั้ง
- ต้นแบบ: การ์ดสถานะอยู่บนสุด แสดงจุดเชื่อมซ้าย ข้อความและรายละเอียดแต่ละขั้นตรงกลาง และไอคอนขวา แยกผ่านแล้ว/ปัจจุบัน/ยังไม่ถึง ไม่สร้างเวลาส่งที่ไม่มีข้อมูล
- รับที่ร้านและจัดส่งใช้รูปแบบเดียวกัน แต่คงขั้นตอนตามวิธีรับยาเดิม /flow แสดงหน้าจอจริงเดียวกัน
- ข้อมูลฝั่งเภสัชกรและแอดมินยังใช้สถานะเดิม ไม่มีการเพิ่มสิทธิ์หรือขั้นตอนใหม่
- หลักฐานการจัดลำดับสถานะ: https://www.nngroup.com/articles/designing-for-waits-and-interruptions/ ใช้แสดงความคืบหน้าและขั้นตอนที่เหลือให้ชัดเจน

### 8 พฤศจิกายน 2569 — C309 ลดไอคอนในไทม์ไลน์
- เอาไอคอนตกแต่งฝั่งขวาของทุกขั้นออก เหลือจุดเชื่อมและข้อความสถานะพร้อมรายละเอียด ใช้ร่วมกันทั้งรับที่ร้านและจัดส่ง และแสดงผ่าน /flow จากหน้าจอจริง
- สถานะ ข้อมูล และการทำงานฝั่งเภสัชกร/แอดมินคงเดิม เป็นการปรับหน้าตาเท่านั้น

### 8 พฤศจิกายน 2569 — C309 ไทม์ไลน์ไม่มีกรอบ
- แสดงสถานะยาเป็นไทม์ไลน์บนพื้นหน้าจอโดยตรง เอากรอบ พื้นหลัง และมุมโค้งของกล่องครอบออก ใช้ระยะขอบหน้าจอเดียวกับส่วนอื่น
- /flow ใช้หน้าจอจริง จึงเปลี่ยนตามกัน ข้อมูลสถานะและการทำงานฝั่งเภสัชกร/แอดมินไม่เปลี่ยน

### 8 พฤศจิกายน 2569 — C309 เลขคำสั่งซื้อและทางออก
- แสดงเลขคำสั่งซื้อชิดซ้ายเหนือไทม์ไลน์จาก order.no เดียวกับรายละเอียด/ใบเสร็จ
- ลบก้อนปุ่มกลับห้องปรึกษาและกลับหน้าแรกท้ายหน้า ปุ่มปิดยังใช้ต้นทางเดิม แต่ถ้าต้นทางเป็นแชทที่ปิดแล้วและจะวนกลับสถานะยา ให้กลับหน้าหลักแทน
- /flow ใช้ UI จริงเดียวกัน ฝั่งเภสัชกร/แอดมินไม่มีสถานะใหม่ และไม่เปิดแชทที่จบแล้วกลับมา


## 8 November 2026 — C309 / C414
สถานะรับยาและขนส่งใช้ภาพสถานะตรงกลาง ตามด้วยสถานะล่าสุด เลขคำสั่งซื้อ และแถบไอคอนแนวนอน ไม่มีข้อความใต้ไอคอน พื้นหลัง primary อ่อนไล่จางถึงแถบไอคอน; ภาพแยกเตรียมยา พร้อมรับ รอไรเดอร์ ส่งด่วน พัสดุ และส่งถึงแล้ว ใช้คำสั่งซื้อเดิมทุกหน้า ไม่เปลี่ยนเงื่อนไขยืนยันรับยา

UX: https://www.nngroup.com/articles/designing-for-waits-and-interruptions/ — แสดงความคืบหน้าและสถานะปัจจุบันให้ชัดเจน ภาพเป็นการสื่อสารเสริมและยังมีชื่อสถานะจริง; ไม่เพิ่มเวลาโดยประมาณที่ไม่มีจากระบบขนส่ง

ย่อไอคอนขั้นตอนเหลือ 36 พิกเซล พร้อมแสงกระจายแบบนิ่งเฉพาะขั้นตอนปัจจุบัน ภาพสถานะไม่มีแอนิเมชัน

ปรับออร่าไอคอนขั้นตอนปัจจุบันเป็นวงแสง primary แผ่ออกวนเบา ๆ สองชั้น ใช้ร่วมกัน C309/C414 ภาพสถานะด้านบนอยู่นิ่ง และเปลี่ยนเป็นแสงนิ่งเมื่อเปิดลดการเคลื่อนไหว

C414 ส่งด่วนจัดข้อมูลเหมือน C309: สถานะบนสุด ตามด้วยการ์ดหัวข้อ–เนื้อหาที่อยู่จัดส่ง (ปุ่มติดตามไรเดอร์), ข้อมูลคำสั่งซื้อ, รายการยาและยอดชำระ, คำแนะนำเภสัชกร และดูใบเสร็จ เอาปุ่มตรึงท้ายหน้ากลับหน้าแรก/ติดต่อสาขาออก ใช้ข้อมูลจากคำสั่งซื้อเดียวกัน

เอาวงขอบสีอ่อนรอบไอคอนสถานะปัจจุบันออก คงเฉพาะแสงออร่า primary แบบนุ่ม ไม่มีเส้นขอบแข็ง ใช้ร่วมกัน C309 และ C414

ไอคอนสถานะปัจจุบันไม่มี box-shadow ใช้ออร่าสี primary โปร่งใสแบบ radial gradient แผ่ออกแทน คงภาพด้านบนอยู่นิ่ง และรองรับลดการเคลื่อนไหว

เอาพื้นหลัง primary ไล่สีของส่วนสถานะยาและขนส่งออก ใช้พื้นปกติ คงเฉพาะออร่าสีรอบไอคอนขั้นตอนปัจจุบัน

เปลี่ยนไอคอนขั้นตอนกำลังนำส่งแบบส่งด่วนเป็นจักรยานยนต์ สื่อถึงไรเดอร์ ใช้ร่วมกันในสถานะยาและจัดส่ง; จัดส่งปกติคงไอคอนรถขนส่ง /flow แสดงจากหน้าจอจริง

C414 การ์ดขนส่งแสดงรหัสพัสดุโดยไม่ใส่คำว่าเลขพัสดุนำหน้า และใช้ปุ่มไอคอนคัดลอกพร้อมชื่อสำหรับการเข้าถึงแทนข้อความ /flow ใช้หน้าจอเดียวกัน

C414.11 จัดส่งเสร็จสิ้นแสดงปุ่มได้รับยาแล้วใต้สถานะ เปิดยืนยันรับยาก่อนบันทึก แยกขนส่งส่งถึงออกจากลูกค้ายืนยันรับยา ไม่บันทึกรับยาอัตโนมัติเมื่อขนส่งเปลี่ยนเป็นส่งสำเร็จ

C414 แผงทดสอบแบ่งหัวข้อรับยาที่ร้าน ส่งด่วน และจัดส่งปกติ เพิ่มรับที่ร้านครบขั้นตอน: เตรียมยา รอร้านเปิด พร้อมรับ รับแล้ว และเลยกำหนด รวมทั้งพัสดุยืนยันได้รับยาแล้ว คงรหัสเคสเดิมและเพิ่มต่อท้าย /flow ใช้หน้าจอจริงร่วมกัน

การ์ดข้อมูลขนส่ง: แสดงเฉพาะรหัสพัสดุ ไม่ใส่คำว่าเลขพัสดุ และใช้ไอคอนคัดลอกชิดขวาสุดโดยไม่มีข้อความบนปุ่ม

ข้อมูลยาในใบสรุปและรายละเอียดประวัติใช้รายการยาร่วมกับแชทเภสัชกร: รูป ชื่อ จำนวน และวิธีใช้ในก้อนเดียว คงคำแนะนำและมื้อยาจากข้อมูลเดิม ไม่แสดงราคาซ้ำในใบสรุป /flow ใช้หน้าจอจริง

หน้าสถานะจัดส่งใช้ปุ่มปิดมุมขวาแทนปุ่มกลับ ส่วนหัวปกใบสรุปแสดงคำสั่งซื้อ # ตามเลขคำสั่งซื้อของรายการเดียวกันแทนรหัสเคส /flow ใช้ดีไซน์จริงร่วมกัน
## สวิตช์ประเภทผู้ใช้ในแผงพรีวิว — 7 พฤศจิกายน 2569
- เครื่องมือพรีวิวจำตัวเลือกใช้ครั้งแรก/เคยใช้แล้วแยกจากสถานะแอป สมัครสำเร็จแล้ว S.firstTime ของแอปเป็น false ตามเดิม แต่ปุ่มยังเลือกค่าเดิมและกดเริ่มใหม่จะเป็นผู้ใช้ครั้งแรกอีกครั้ง เลือกค่าใหม่ได้จากสวิตช์เท่านั้น ไม่เป็นส่วนของแอปจริง และโหลดหน้าใหม่แล้วค่าจะกลับเป็นค่าเริ่มต้น

## หลังสมัครสมาชิก: ลบ Face ID และเข้าแนะนำแอป — 7 พฤศจิกายน 2569
- ลำดับใหม่ C105 → C108 → กดเริ่มใช้งาน → C112 → ข้ามหรือเริ่มใช้งาน → หน้าหลัก C201
- ลบหน้า C110 และการ์ดชวนเปิด Face ID บนหน้าแรก ไม่นำรหัส C110 ไปใช้ซ้ำ
- เปิดเคส C112 โดยยังไม่เข้าสู่ระบบ ปุ่มเดิมไป C102
- ลบสวิตช์ Face ID หรือลายนิ้วมือใน C501 ตามคำสั่งผู้ใช้ แอปไม่มีฟีเจอร์นี้แล้ว
- ตรวจด้วย unit test ยังไม่ได้ตรวจใน Browser
- ปิดเคส C108.3 ยังสมัครไม่เสร็จ และ C108.5 ไม่มีชื่อแสดง เพราะผู้ใช้จริงต้องผ่านการสมัครก่อนจึงถึงหน้านี้ คงรหัสเดิมไว้ ไม่เลื่อนเลขเคส

## ที่อยู่หลังสมัครและการแสดงที่อยู่ — 7 พฤศจิกายน 2569
- สมัครสำเร็จแล้วบัญชีมีที่อยู่หลักทันที C201 จึงไม่แสดงสถานะยังไม่มีที่อยู่ ปิดเคส C201.7
- ต้นแบบใช้ที่อยู่จำลอง ไม่ได้ใช้ค่าที่กรอกใน C105 ระบบจริงต้องบันทึกที่อยู่ปัจจุบันจาก C105 เป็นที่อยู่หลัก
- เลิกใช้ชื่อที่อยู่ ลบฟิลด์ใน C515 ปิดเคส C210.3, C514.4, C515.4, C515.16
- แถบที่อยู่บน C201 แสดงที่อยู่เต็มบรรทัดเดียว ยาวเกินแสดง ... ส่วนการ์ดใน C210 และ C514 แสดงชื่อผู้รับ เบอร์ และที่อยู่เต็ม
- ตรวจด้วย unit test ยังไม่ได้ตรวจใน Browser

## ยุบเหตุการณ์ C201 — 7 พฤศจิกายน 2569
- C201.1 แสดงร้านยาใกล้ฉันคละสถานะ เปิด ปิด ปิดชั่วคราว และนอกพื้นที่ในหน้าเดียว
- ปิดเคส C201.3, .4, .5, .6, .44, .49, .50, .61, .63, .76 เพราะซ้ำข้อมูลในเคสอื่น คงเลขเดิม
- ร้านปิดทั้งหมดดูได้จากสวิตช์เวลาร้านในแผงพรีวิว การเปลี่ยนที่อยู่ดูได้จาก C210 คำขอวิดีโอดูได้จาก C303.15
- ตรวจด้วย unit test ยังไม่ได้ตรวจใน Browser
- ปุ่มปรึกษาเภสัชบน C201 พาเข้าคิวสาขาที่เปิดรับและคิวสั้นสุดเสมอ ไม่บล็อกเมื่อไม่มีคิวว่าง ปิดเคส C201.39 และ C201.40 ถ้าทุกสาขาในพื้นที่ไม่เปิดรับจะเปิดข้อมูลสาขา C212
- C201.8 และ C201.9 ใช้หัวข้อร้านยาใกล้ฉันและแถวร้านแบบเดียวกัน ต่างกันที่แท็ก นอกพื้นที่ให้บริการ พร้อมระยะทาง กับ ตรวจสอบพื้นที่ไม่ได้ พร้อมไม่ทราบระยะทาง ไม่บอกว่านอกพื้นที่เมื่อยังไม่รู้ระยะ

## ลดเหตุการณ์ C5XX — 8 พฤศจิกายน 2569
- ปิดเคส C505.4, C505.6, C514.2, C515.3, C515.10, C515.15 เพราะผู้ใช้จริงไปไม่ถึงหรือซ้ำเคสอื่น คงเลขเดิม
- ปิดเคส C514.3 ใช้ C514.1 แล้วกดตั้งเป็นที่อยู่หลักแทน
- ยุบ C515.13 รวมกับ C515.14 คงเคสที่อยู่เดิมที่ยังรวมในช่องบ้านเลขที่ ส่วนที่อยู่แยกช่องดูได้จาก C515.2
- ซ่อน C513 เพราะเปิดได้จากฟอร์มสมาชิกครอบครัวที่พักไว้เท่านั้น เก็บโค้ดไว้คืนกลับได้
- ชื่อและนามสกุลในฟอร์มที่อยู่เป็นข้อความอิสระ ตรวจเฉพาะว่าไม่เว้นว่าง มีผลกับ C515 ส่วนขั้นที่อยู่ของ C105 ยังตรวจรูปแบบชื่อแยกต่างหาก
- ตรวจด้วย unit test ยังไม่ได้ตรวจใน Browser
- เพิ่มเคส C514.5 แจ้งเตือนตั้งเป็นที่อยู่หลักแล้ว และ C514.6 แจ้งเตือนบันทึกที่อยู่แล้ว ใช้ข้อความเดียวกับปุ่มจริง แสดงครั้งเดียวต่อการเปิดเคส
- เพิ่มเคส C519.3 เพิ่มบุคคลธรรมดา และ C519.4 เพิ่มนิติบุคคล ฟอร์มว่างตามที่เปิดจากปุ่มเพิ่มข้อมูลใน C518 หัวแผ่นเปลี่ยนเป็นเพิ่มข้อมูลออกใบกำกับภาษี แก้ไขเดิมยังขึ้นหัวแก้ไข
- C519 ตรวจแต่ละช่องเมื่อออกจากช่องและก่อนบันทึก แก้ถูกแล้วข้อความหายทันที เพิ่มเคส C519.5, C519.6, C519.7 ใช้กฎเดียวกันใน C308 และ C402 ที่เปิดฟอร์มนี้
- แผงพรีวิวมีปุ่มมอคข้อมูลตอนเปิดฟอร์มเพิ่มข้อมูล C519 เติมเฉพาะช่องว่าง ไม่บันทึกให้ และไม่อยู่ใน UI ของลูกค้า

## ฟอร์มข้อมูลใบกำกับภาษีตามสเปกเว็บเดิม — 8 พฤศจิกายน 2569
ต้นแบบ C519 ใช้ช่องตามสเปกจากผู้ใช้ ยังไม่ได้เชื่อม API จริง ตารางนี้เป็นแผนจับคู่สำหรับ adapter:

| ต้นแบบ | สเปก | นิติบุคคล | บุคคลธรรมดา | กฎในต้นแบบ |
|---|---|---|---|---|
| kind | tax_entity_type | ออกใบกำกับภาษีในนาม | ออกใบกำกับภาษีในนาม | เลือกจากแท็บ C518 |
| name / first | company_name | ชื่อนิติบุคคล | ชื่อ | บังคับ ไม่เกิน 500 |
| business / last | business_name | ชื่อธุรกิจ | นามสกุล | บังคับ ไม่เกิน 500 |
| id | registration_number | เลขประจำตัวผู้เสียภาษี | เลขประจำตัวประชาชน | 13 หลัก บุคคลธรรมดาตรวจเลขบัตรด้วย |
| phone | phone | เบอร์โทรศัพท์ | เบอร์โทรศัพท์ | 9–10 หลัก |
| detail | address | ที่อยู่ (เลขที่) | ที่อยู่ (เลขที่) | บังคับ ไม่เกิน 500 |
| village, alley, road | village, alley, road | หมู่บ้าน / อาคาร, ตรอก / ซอย, ถนน | เหมือนกัน | ไม่บังคับ |
| prov | provinces | จังหวัด | จังหวัด | เลือกจากรายการ |
| amp | amphure | อำเภอ / เขต | อำเภอ / เขต | เลือกตามจังหวัด |
| dist | district | ตำบล / แขวง | ตำบล / แขวง | เลือกตามอำเภอ |
| zip | zipcode | รหัสไปรษณีย์ | รหัสไปรษณีย์ | ต้นแบบบังคับ เซิร์ฟเวอร์เดิมไม่บังคับ |

เรื่องที่ต้องยืนยันก่อนใช้จริง:
- ส่ง address_type ที่ไม่ใช่ 1 (เว็บเดิมส่ง 2) และไม่ต้องส่งตำแหน่งแผนที่
- ไม่มีช่องสาขา ต้องถามนักบัญชีว่านิติบุคคลต้องระบุสำนักงานใหญ่หรือสาขาหรือไม่
- ถ้าต้องบังคับรหัสไปรษณีย์จริง ต้องตรวจที่ backend
- โค้ดแก้ไขที่อยู่ฝั่งเซิร์ฟเวอร์เดิมตรวจน้อยกว่าตอนเพิ่ม รวมเลข 13 หลัก ต้องเพิ่มการตรวจเดียวกัน
- สเปกกำหนดค่าเริ่มต้นเป็นนิติบุคคล แต่แท็บ C518 ปัจจุบันเริ่มที่บุคคลธรรมดา รอผู้ใช้ตัดสินใจ

เอาช่องสาขาและแถวอีเมลออกจาก C519, C518, C421, C308 และ C402 ส่วนแถวสาขาใน C402 จะไม่แสดงเมื่อไม่มีข้อมูล ตรวจด้วย unit test ยังไม่ได้ตรวจใน Browser
- ทุกช่องพิมพ์ใน C519 มี placeholder แบบบอกให้กรอกหรือระบุ ไม่ใช้ตัวอย่าง รหัสไปรษณีย์แบบเลือกจากรายการบอกว่าระบบจะเติมให้ ป้ายชื่อช่องยังแสดงตลอด

C414 ทุกสถานะส่งด่วนและพัสดุใช้การ์ดข้อมูลร่วมกันเหมือนหน้าสถานะอื่น: ที่อยู่จัดส่ง ข้อมูลคำสั่งซื้อ รายการยาและยอด คำแนะนำเภสัชกร และใบเสร็จของคำสั่งซื้อเดิม ปุ่มได้รับยาแล้วอยู่ใต้สถานะเมื่อส่งถึง ไม่ใช้แถบปุ่มล่างแบบเก่า /flow แสดงหน้าจอจริง


## ยกเลิกการยืนยันรับยา — 8 พฤศจิกายน 2569

กฎล่าสุดแทนข้อกำหนดเดิมที่ให้ลูกค้ากดยืนยันรับยา: เอาปุ่มยืนยันรับยาออกทั้งหมด รวม C414, C415 และ C405 ปิดเคสยืนยันเดิมโดยไม่เลื่อนรหัส C415 เลิกใช้และสงวนรหัสไว้ รายการย้ายไปประวัติทันที และเริ่มติดตามการใช้ยาตามข้อมูลส่งมอบ ไม่รอผู้ใช้กดหรือครบ 7 วัน /flow และ /card-status-all ใช้สถานะเดียวกับหน้าจอจริง ระบบจริงต้องเชื่อมข้อมูลส่งมอบจากบริการที่เกี่ยวข้อง


## C203 ลดขั้นตอนแจ้งอาการ — 8 พฤศจิกายน 2569

เอาส่วนเลือกสนทนา/วิดีโอคอลออกจากหน้าแจ้งอาการ ลำดับใหม่คือ 1 อาการที่ต้องการปรึกษา (พร้อมแนบรูป) และ 2 ข้อมูลก่อนปรึกษา วิธีปรึกษายังคงรับจากทางเข้าของเคส ไม่ต้องเลือกซ้ำ เภสัชกรและผู้ดูแลยังดูข้อมูลอาการและสุขภาพของเคสเดิมได้ /flow ใช้หน้าจอจริงเดียวกัน


## ยกเลิกหน้าก่อนปรึกษาที่ไม่ใช้ — 8 พฤศจิกายน 2569

ยกเลิก C204 แพ้ยาและยาประจำ และ C205 อาการที่ควรไปโรงพยาบาล ออกจากทะเบียนหน้าจอและแผงพรีวิว ข้อมูลสุขภาพยังแก้ผ่านฟอร์มสุขภาพร่วมจาก C203 ได้ ยกเลิกเคส C207.4 มีธงด่วนและกล่องเตือนระหว่างรอคิว โดยสงวนเลขเดิม ไม่เลื่อนเลขสถานะอื่น /flow ใช้หน้าจอจริง ไม่เพิ่มการจำลองธงด่วนให้ฝั่งเภสัชกรหรือแอดมินในโฟลว์นี้


อัปเดต C207 — 8 พฤศจิกายน 2569: ยกเลิก C207.5 ปิดการแจ้งเตือนไว้ ไม่แสดงกล่องเตือนหรือปุ่มเปิดการแจ้งเตือนในห้องรอคิว สงวนเลข .5 โดยไม่เลื่อนเลขอื่น การตั้งค่าแจ้งเตือนส่วนอื่นยังใช้ตามเดิม

อัปเดต 8 พฤศจิกายน 2569: ยกเลิกเคสตัวอย่าง C207.12 วิดีโอคอล · คิวถัดไป จากพรีวิวและรายการโฟลว์ สงวนเลข .12 ไม่เลื่อนเลขอื่น


## C300 เภสัชกรพร้อมให้บริการ — 8 พฤศจิกายน 2569

ย้ายเคส C207.9 ไปเป็น C300 หมวดระหว่างปรึกษา หลังเภสัชกรรับคิว ใช้ห้องสนทนาจริงร่วมกับ C303 แสดงข้อมูลเภสัชกรและวิดีโอคอล คงข้อความระหว่างรอเมื่อรับคิวจริง แผงจำลองและ /flow มีทางเข้า C300 สงวนเลข C207.9 ไม่เลื่อนเลขอื่น ฝั่งเภสัชกร/แอดมินอ้างอิงเหตุการณ์รับคิวและเข้าห้องเดิม ไม่สร้างเคสหรือคำสั่งซื้อใหม่


อัปเดตดีไซน์ C303.3 — 8 พฤศจิกายน 2569: ข้อความแจ้งให้ติดต่อเภสัชกรเมื่อแก้รายการยาในตะกร้าใช้กล่องข้อมูลสีเทาอ่อน ข้อมูลยาและสิทธิ์แก้ไขรายการยังอ้างอิงเภสัชกรเดิม /flow ใช้หน้าจอเดียวกัน


### เส้นทางสถานะหลังชำระเงิน — 8 พฤศจิกายน 2569
ต้นแบบ C308 → C311 ชำระสำเร็จ → ปุ่มดูสถานะจัดส่งยา ใช้วิธีรับยาจากคำสั่งซื้อที่ชำระแล้ว: รับที่ร้านเปิด C309; ส่งด่วนและจัดส่งปกติเปิด C414 ของบริการนั้น การ์ดติดตามบนหน้าแรก/ประวัติใช้เส้นทางเดียวกัน คงเลขคำสั่งซื้อ รายการยา ยอดเงิน และที่อยู่เดิม ไม่สร้างคำสั่งซื้อใหม่หรือใช้สถานะตัวอย่างเก่าทับข้อมูลจริงในโฟลว์ การจัดส่งเริ่มจากกำลังเตรียมยา และไม่เปิดห้องสนทนาที่จบแล้วกลับมา


### ข้อมูลใช้ยา C405 — 8 พฤศจิกายน 2569
นำแท็บยาที่ใช้อยู่/ประวัติการใช้ยาออก แสดงการ์ดแผนยาปัจจุบันโดยตรง ประวัติยาที่มีข้อมูลแสดงต่อด้านล่าง ไม่ต้องสลับแท็บ ไม่มีส่วนประวัติว่างเมื่อไม่มีรายการ คงข้อมูล วิธีใช้ และลิงก์ใบสรุปเดิม หน้า /flow ใช้หน้าจอจริงร่วมกัน


### บันทึกยารายตัว C405 — 8 พฤศจิกายน 2569
การ์ดมื้อยาใช้ checkbox ต่อรายการยาแทนปุ่มทานแล้วทั้งมื้อ บันทึกตามแผน/วัน/มื้อ/ตัวยา ยกเลิกได้รายตัว จำนวนรายการที่บันทึกแล้วอัปเดตตามจริง คงปุ่มแจ้งอาการ แยกบันทึกตัวอย่างออกจากข้อมูลแผนยาของผู้ใช้ /flow แสดงหน้าจอจริงร่วมกัน

C405 checkbox ที่ยังไม่เลือกใช้พื้นขาวกับเส้นขอบ primary หนา 2px เพื่อให้เห็นช่องชัดเจน เมื่อเลือกใช้พื้น primary และเครื่องหมายถูกสีขาว พื้นที่กด 44×44px


### ปุ่มแจ้งอาการ C405 — 8 พฤศจิกายน 2569
รวมปุ่มแจ้งอาการเป็นปุ่มเดียวด้านล่างการ์ดยาทั้งหมด (รวมยาที่ใช้เมื่อมีอาการ) เอาปุ่มซ้ำในแต่ละการ์ดออก เปิด C412 ด้วยข้อมูลยาแผนเดิม ตัวอย่างหลายแผนยังส่งบริบท multiPlan ส่วน checkbox และบันทึกยาตามอาการทำงานเดิม /flow ใช้หน้าจอจริงร่วมกัน


### ภาพรวมคำสั่งซื้อ C405 — 8 พฤศจิกายน 2569
ย้ายแพทเทิร์นหัวและท้ายการ์ดแผนยาเป็นภาพรวมบนสุด เลื่อนแนวนอน 5 คำสั่งซื้อ ไม่แสดงรายการยาในภาพรวม การ์ดยาตามอาการใช้หัวและเนื้อหาเหมือนมื้อยา ลด padding/gap และใช้ปุ่มแจ้งอาการสีแดงปุ่มเดียวท้ายรายการ หน้า /flow ใช้หน้าจอจริงร่วมกัน การ์ดภาพรวมไม่มีปุ่มดูใบสรุป รายการมื้อยาและ checkbox ยังอยู่ด้านล่าง

ภาพรวม C405 ใช้การ์ดพื้นขาว ไม่มีพื้นสีแบ่งหัว/ท้าย ลดเส้นแบ่งซ้ำ มีป้ายจำนวนวันที่เหลือ ไม่แสดงปุ่มใบสรุป เพื่อให้อ่านภาพรวมได้กระชับ

หัวการ์ดภาพรวมคำสั่งซื้อ C405 จัดแถวซ้าย–ขวา: คำสั่งซื้อ/เลขคำสั่งซื้อ, วันที่ปรึกษา/วันที่เหลือ และเรื่องที่ปรึกษา/รายละเอียด ชิดขอบเนื้อหาทั้งสองฝั่ง

ยาตามอาการ C405 ใช้ checkbox ข้างตัวยาแทนปุ่มกินแล้วท้ายการ์ด ติ๊กบันทึกครั้งล่าสุดและติ๊กซ้ำยกเลิก เมื่อตามช่วงห่างที่กำหนดครบจึงเปิดให้บันทึกครั้งถัดไป คงจำนวนครั้ง/เวลาล่าสุด/ข้อจำกัดต่อวัน การตรวจเงื่อนไขอยู่ที่ action ด้วย

ท้ายการ์ดภาพรวม C405 ใช้พื้น primary ข้อความสีขาว และ padding 12px รอบเนื้อหา แสดงวันที่ของแผน วันสิ้นสุด และความคืบหน้า

แยกหัวกลุ่มบันทึกการกินยา C405 ใต้ภาพรวมคำสั่งซื้อ ใช้หัวข้อแบบเดียวกัน แถบความคืบหน้าแผนยามีปลายมนทั้ง track และค่าความคืบหน้า

การ์ดภาพรวม C405 ตกแต่งลายวง abstract สี CI จางที่มุมการ์ด ไม่ใช้ภาพหรือ animation คงความชัดเจนของเนื้อหาและท้ายการ์ด primary ใช้ดีไซน์ร่วมกับ /flow


### C405 — หัวการ์ดคำสั่งซื้อ (8 พฤศจิกายน 2569)
ต้นแบบแยกเลขคำสั่งซื้อเป็น header ของการ์ดในแถบเลื่อน และมีปุ่มไอคอนดวงตาด้านขวาเพื่อเปิดใบสรุปของคำสั่งซื้อเดียวกัน ข้อมูลการปรึกษาอยู่ใน body; /flow ใช้หน้าจอจริงนี้ ไม่มีสถานะหรือเมนูจัดการฝั่งเภสัชกรและแอดมินเพิ่ม

C405: ปุ่มดวงตาด้านขวาหัวการ์ดคำสั่งซื้อมีข้อความ “ดูข้อมูล” กดเปิดรายละเอียดเดิมของคำสั่งซื้อ ไม่มีการเปลี่ยนสถานะหรือสิทธิ์จัดการ

C405: แถบคำสั่งซื้อมีจุดและตัวเลขตำแหน่งปัจจุบันใต้การ์ด เปลี่ยนตามการเลื่อนแนวนอน เป็นข้อมูลนำทาง UI เท่านั้น /flow ใช้ component จริงร่วมกัน

C405: ลด padding แนวตั้งของหัวการ์ดคำสั่งซื้อ คงปุ่มดูข้อมูลสูงอย่างน้อย 44px เพื่อให้แตะได้สะดวก ไม่มีผลต่อโฟลว์ข้อมูล

C405 ล่าสุด: แสดงตำแหน่งการเลื่อนด้วยจุดเท่านั้น เอาตัวเลขหน้าออก คงคำอธิบายตำแหน่งสำหรับโปรแกรมอ่านหน้าจอ

C405 ล่าสุด: การ์ดคำสั่งซื้อซ่อนวันที่ปรึกษาและจำนวนวันที่เหลือใน body แสดงเรื่องที่ปรึกษาสูงสุด 2 บรรทัดพร้อม … เมื่อเกิน เพิ่มข้อความยาวในข้อมูลจำลองร่วม รายละเอียดเต็มยังเปิดได้จากดูข้อมูล

C405: เอาป้ายหัวข้อเรื่องที่ปรึกษาออกจากการ์ดคำสั่งซื้อ เหลือข้อความอาการชิดซ้าย จำกัด 2 บรรทัดเช่นเดิม

C405: ใช้ภาพพื้นหลัง abstract CI สีมิ้นต์อ่อนที่สร้างใหม่บนการ์ดคำสั่งซื้อ ซ้อนสีขาวจางเพื่อรักษาความชัดของตัวอักษร ใช้ไฟล์ WebP ร่วมกันทุกการ์ด ไม่มีภาพเคลื่อนไหวหรือสถานะระบบเพิ่ม

C405: เอาเส้นคั่นใต้หัวการ์ดคำสั่งซื้อออก เป็นการปรับดีไซน์เท่านั้น /flow ใช้หน้าจอจริงเดียวกัน

C405: เอา padding ด้านบนของข้อความอาการในการ์ดคำสั่งซื้อออก ให้ชิดหัวการ์ดมากขึ้น คงระยะด้านข้างและด้านล่าง ไม่มีผลต่อข้อมูลหรือสถานะ

C405: หัวข้อคำสั่งซื้อที่ติดตามแสดงเฉพาะจำนวนคำสั่งซื้อ เอาคำว่า “เลื่อนดู” ออก การเลื่อนและจุดบอกตำแหน่งคงเดิม /flow ใช้หน้าจอจริงร่วมกัน

C405 — เกลาระยะการ์ดคำสั่งซื้อ: ใช้ระยะด้านข้างและ footer 16px เพิ่มช่องว่างระหว่างการ์ดเป็น 16px ข้อความมีระยะบน 4px และล่าง 16px คงหัวการ์ดกระชับ พื้นหลังอ่อนและข้อความสองบรรทัด ไม่มีการเปลี่ยนข้อมูลหรือสถานะ /flow ใช้ดีไซน์จริงเดียวกัน

C405: คืนช่องไฟการ์ดบันทึกยาทุกมื้อและยากินเมื่อมีอาการเป็นแบบก่อนลดระยะล่าสุด ใช้ padding 12px ตามเดิม /flow ใช้สไตล์ร่วมเดียวกัน ไม่มีผลต่อข้อมูลหรือสถานะ

C405: ลดความสูงลิงก์ดูสรุปการปรึกษาในรายการยาทุกกล่องที่ใช้ fu-multi-origin จาก 44px เป็น 32px คง padding 0 และการเปิดใบสรุปเดิม /flow ใช้สไตล์ร่วมเดียวกัน


## 8 พฤศจิกายน 2569 — จบคอร์สและปรึกษาอาการหลังใช้ยา
- C405 เพิ่มการ์ดจำลองจบคอร์สใน carousel พร้อมปุ่มประเมินอาการ C420 ที่ผูกกับคำสั่งซื้อนั้น แยกข้อมูลจำลองจากแผนยาปัจจุบัน จบช่วงเวลาคอร์สไม่ได้ยืนยันว่าทานยาครบทุกมื้อ
- C412 เหลืออาการ/รายละเอียด เวลาเริ่ม และระดับความรบกวน ตัดหมวดอาการเร่งด่วนและข้อมูลการใช้ยาเพิ่มเติม คงคำเตือนฉุกเฉินด้านบน ปุ่มปรึกษาเภสัชบันทึกรายงานแล้วเปิด C207 หรือ C303 เดิมที่ยังเปิด พร้อมส่งข้อความยาและอาการทุกตัวครั้งเดียว และผูก chatCaseId
- /flow ใช้หน้าจอจริงร่วมกัน การเปลี่ยนแปลงมีผลใน preview ด้วย ไม่วาดสำเนา
- UX อ้างอิง https://www.w3.org/WAI/tutorials/forms/notifications/ ใช้ข้อความแจ้งผลบันทึกและข้อผิดพลาดชัดเจน ไม่ถือว่าผ่าน usability กับคนไข้จริง


## 8 พฤศจิกายน 2569 — รูปแบบรายงานอาการในแชท

ข้อความอัตโนมัติจาก C412 ใน C207/C303 แสดงชื่อยาที่แจ้ง ตามด้วยอาการ เริ่มมีอาการ ความรบกวน และรายละเอียดเพิ่มเติม เรียงลงมาแยกแต่ละยา ไม่มีรูปยา ข้อมูลเป็น snapshot ของรายงานที่ส่ง พร้อม reportId เดิม; ข้อความเก่าใช้รายงานที่อ้างอิงมาแสดงรูปแบบเดียวกัน /flow ใช้หน้าจอจริงจึงแสดงตรงกัน

แนวทางอ่านง่าย: [CDC Plain Language](https://www.cdc.gov/health-literacy/php/develop-materials/plain-language.html) แนะนำแบ่งข้อมูลเป็นกลุ่มและใช้หัวข้อ นำมาจัดหัวข้ออาการตามยา ยังไม่ได้ทดสอบกับผู้ป่วยจริง


## 8 พฤศจิกายน 2569 — เปิดบันทึกการกินยาโดยตรง

C418 เปลี่ยนจากเมนูแบนเนอร์ 3 ก้อนเป็นหน้าติดตามการใช้ยาเต็มหน้า ทางลัดข้อมูลยาบน C201 เปิดคำสั่งซื้อที่ติดตาม บันทึกมื้อยา ยาตามอาการ และปุ่มแจ้งอาการทันที ใช้ render/mount เดียวกับ C405 เพื่อให้หน้าจอและข้อมูลตรงกัน มีเคสหลายแผน/ว่าง/โหลดและตั้งเวลาเตือนเดิม /flow A401 ใช้หน้าจอจริง ไม่มีเมนูขั้นกลาง


## 8 พฤศจิกายน 2569 — แบนเนอร์หน้าแรกตามสถานะ

C201 ซ่อนแบนเนอร์เรื่องยา ถามเภสัชได้ เมื่อมีการ์ดสถานะปรึกษา/รอคิว รอชำระเงิน รับยาหรือจัดส่ง และส่วนการดูแลที่กำลังดำเนินการ ใช้ผลการแสดงการ์ดจริงตัดสิน เมื่อไม่มีข้อมูลการ์ดสถานะแล้วจึงแสดงแบนเนอร์กลับ /flow ใช้หน้าจอจริงตามเงื่อนไขเดียวกัน


### 8 พฤศจิกายน 2569 — ข้อความแจ้งอาการในแชท

C412 ส่งข้อมูลเข้าห้อง C207/C303 เป็นข้อความของผู้ใช้แยกบับเบิ้ลละยา เรียงชื่อยา ตามด้วยอาการ เริ่มมีอาการ ความรบกวน และรายละเอียดเพิ่มเติมถ้ามี ไม่มีการ์ดรายงานและรูปยา ใช้ข้อมูลรายงานเดิมและเชื่อมเคสเดิม ไม่เปลี่ยนผลรายงานเป็นการยืนยันแพ้ยาอัตโนมัติ /flow ใช้หน้าจอจริงเดียวกัน


### 8 พฤศจิกายน 2569 — หัวข้อช่วงเวลากินยา

C405 และ C418 ใช้หัวข้อ เช้า กลางวัน เย็น และก่อนนอน โดยตัดคำว่า “มื้อ” ออกจากหัวข้อการ์ด ข้อมูลแผนยาและการบันทึกคงเดิม ใช้ร่วมกันใน /flow

ลิงก์ดูสรุปใต้ยาใน C405/C418 แสดงเลขคำสั่งซื้อจาก TP.orderNumber ของแผนเดียวกัน แทนรหัสเคส MR และยังเปิดสรุปของคำสั่งซื้อนั้น


### เมนูและการ์ดติดตามยา — 8 พฤศจิกายน 2569
- C201 เปลี่ยนเมนูเป็น การใช้ยา เพิ่ม อื่นๆ เชื่อมหน้าบัญชี C501 ไอคอนธีมเดียวกัน 4 คอลัมน์
- Badge การใช้ยาแสดงเมื่อมีออเดอร์ส่งสำเร็จ/รับที่ร้านใหม่ ล้างเมื่อเปิด C418 กลับขึ้นได้สำหรับออเดอร์ใหม่ เพิ่มเคส medication-new / medication-read
- C405/C418 ลิงก์ใต้ยาเหลือ ดูข้อมูลคำสั่งซื้อ การ์ดคำสั่งซื้อสี Primary เข้มพร้อมลาย Abstract จางทั้งใบ รวม footer
- ส่งประเมินสำเร็จแล้วซ่อนการ์ดคำสั่งซื้อนั้นจาก carousel พร้อมปรับจำนวนและจุดหน้า การปิดหรือส่งไม่สำเร็จยังคงการ์ด
- การ์ดสถานะ C201/C403 ใช้หัว Primary เข้ม พื้นข้อมูลขาว ไอคอนและปุ่มร่วมกัน /flow และ /card-status-all แสดงดีไซน์จริง
- อ้างอิงการจัดกลุ่มและลำดับข้อมูลจาก https://www.nngroup.com/articles/cards-component/ ส่วนความพรีเมียมเป็นการตัดสินใจออกแบบ ยังไม่ได้ทดสอบกับผู้ป่วย Pinterest ขอเข้าสู่ระบบจึงไม่ใช้เป็นหลักฐานที่อ่านแล้ว

- พื้นราง progress ในการ์ดคำสั่งซื้อใช้ขาวโปร่ง 18% เพื่อดรอปพื้นหลังลงและให้ส่วนความคืบหน้าขาวเด่น

- 8 พฤศจิกายน 2569: C405/C418 เปลี่ยนพื้นหลังการ์ดคำสั่งซื้อเป็นภาพ Abstract คลื่นแก้ว/ผ้าไหมโทน Teal ที่สร้างใหม่ เก็บลายริมขวาและพื้นที่สงบกลางภาพ พร้อมม่านสีเข้มบางเพื่ออ่านข้อความขาวได้ ใช้ shared CSS จึงตรงกันใน /flow; asset: public/assets/follow-order-abstract-teal-v2.webp

- C405/C418 เพิ่มข้อความใต้หัวข้อบันทึกการกินยา: เช็กลิสต์การกินยาเริ่มใหม่ทุกวันเวลา 00:00 น.

- 8 พฤศจิกายน 2569: UI ลูกค้า C405/C418 ใช้ภาพแผงยาและขวดยาโปร่งใสที่สร้างใหม่เป็นลายพื้นหลังความชัด 14% บนสี Primary ทั้งการ์ด แทนลายคลื่นเดิม ใช้ shared CSS ในหน้าจริงและ /flow; ไม่เปลี่ยนข้อมูลหรือขั้นตอนฝั่งร้าน/ผู้ดูแล; asset: public/assets/follow-order-medicine-v3.webp

- 8 พฤศจิกายน 2569: การ์ดสถานะ C201/C403 ปรับตามเรฟเป็นหัวสี Primary และพื้นข้อมูลขาวมุมมนซ้อนหัว เส้นประแบ่งแอคชั่น ปุ่มแคปซูลกระชับชิดขวา ใช้ shared component styles ทั้งคิว สนทนา ชำระเงิน และจัดส่ง จึงตรงกันใน /flow และ /card-status-all ไม่เปลี่ยนขั้นตอนหรือข้อมูลร้าน/ผู้ดูแล

- 8 พฤศจิกายน 2569: C405/C418 เรียงคอร์สที่ครบกำหนดและยังไม่ส่งประเมินไว้ต้น carousel พร้อมคำถามอาการหลังจบคอร์สและปุ่มประเมินอาการ ส่งสำเร็จจึงซ่อนการ์ด ปิดแผ่นหรือส่งไม่สำเร็จยังคงการ์ด ใช้ร่วมกันใน /flow; ไม่เปลี่ยนขั้นตอนฝั่งร้าน/ผู้ดูแล และไม่ได้ตีความว่าผู้ใช้กินยาครบจากวันครบกำหนดเพียงอย่างเดียว

- 8 พฤศจิกายน 2569: กรอบการ์ดสถานะ C201/C403 ใช้ brand-200 ขนาด 1px และ shadow-md เพื่อแยกพื้นขาว โดยคงพื้นข้อมูลขาวและแพทเทิร์นเดิม ใช้ร่วมใน /flow และ /card-status-all อ้างอิง USWDS Card (https://designsystem.digital.gov/components/card/) ที่อธิบายการใช้ border/shadow แยกการ์ดจากบริบทหน้า ไม่ใช่ผลทดสอบผู้ป่วย และไม่เปลี่ยนขั้นตอนร้าน/ผู้ดูแล

- 8 พฤศจิกายน 2569: ตามคำสั่งล่าสุด การ์ดสถานะ C201/C403 ทุกประเภทไม่มี box shadow คงกรอบ brand-200 ขนาด 1px ใช้ร่วมในหน้าจริง /flow และ /card-status-all แทนข้อกำหนดเงาก่อนหน้า ไม่เปลี่ยนข้อมูลหรือขั้นตอนร้าน/ผู้ดูแล


### 8 พฤศจิกายน 2026 — C308 ปุ่มชำระเงิน
- ปุ่มชำระเงินคงขนาดเดิมระหว่างดำเนินการ เอาแอนิเมชันหดความกว้างออก แต่ยังแสดงกำลังดำเนินการและป้องกันกดซ้ำ หน้าจริงและ /flow ใช้ runtime เดียวกัน ไม่เปลี่ยนการยืนยันยอดหรือสถานะจากร้าน/ระบบชำระเงิน


### 8 พฤศจิกายน 2026 — สี Alert ร่วมกัน
- C102.3 แจ้งออกจากระบบหลังไม่ใช้งาน 30 วันใช้ฟ้า; C102.2 เข้าสู่ระบบไม่สำเร็จใช้แดง พร้อมไอคอนและข้อความ ไม่ใช้สีเพียงอย่างเดียว
- Shared Alert ใช้พื้นอ่อน ขอบชัด ไม่มีเงา: info ฟ้า, warning เหลือง, error แดง, success เขียว ส่วน neutral คงสีเทา หน้าจริงและ /flow ใช้ component เดียวกัน
- อ้างอิง https://designsystem.digital.gov/components/alert/ และ https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html — วัดคอนทราสต์ข้อความ >=4.5:1; การเลือกเฉดเป็นข้อเสนอของดีไซน์ ไม่ใช่ผลทดสอบผู้ป่วย และไม่เปลี่ยนสถานะจากร้านหรือ backend


### 8 พฤศจิกายน 2026 — C102.3 ระยะ Alert
- เพิ่มช่องว่าง 16px หลัง Alert ก่อนฟอร์มอีเมล เฉพาะสถานะที่แสดงข้อความแจ้งเตือน ใช้ร่วมกันกับ /flow

## C207 ที่อยู่จัดส่งนอกเขต 15 กม. — 8 พฤศจิกายน 2569
มีในต้นแบบ: เพิ่มเคส C207.13 ต่อจาก C203 ที่อยู่หลักนอกเขตส่งยา เคสเข้าคิวและรอเภสัชกรได้ตามปกติ ห้องรอแสดงข้อความปักด้านบนว่าที่อยู่จัดส่งอยู่นอกเขต พร้อมตำบล จังหวัด และระยะถ้าทราบ ถ้าซื้อยาให้รับที่ร้าน หรือเลือกที่อยู่อื่นที่ห่างสาขาไม่เกิน 15 กม. ตอนชำระเงิน (ล็อกเขตปิดอยู่: รับที่ร้าน ส่งด่วนไม่ได้) ข้อความแสดงเฉพาะระหว่างรอคิว ไม่บล็อกการรอหรือยกเลิกคิว
ฝั่งเภสัชกรและแอดมิน: ใช้ที่อยู่จัดส่งที่บันทึกในเคสเดิม ไม่สร้างเคสหรือคำสั่งซื้อใหม่ การตรวจเขตตอนชำระยังใช้กติกา C308 เดิม
ต้องยืนยัน: ดีไซน์ของข้อความนี้รอทีมออกแบบปรับ ระยะทางเป็นข้อมูลจำลองตามตำบล ยังไม่ได้ตรวจหน้าจอใน Browser ที่อนุญาต

อัปเดต C207 — 8 พฤศจิกายน 2569: ยกเลิกเคส C207.11 รอเภสัชกรวิดีโอคอล จากพรีวิวและรายการโฟลว์ตามที่ผู้ใช้ยืนยันว่าไม่มีเคสนี้แล้ว สงวนเลข .11 ไม่เลื่อนเลขอื่น (C207.13 ยังเป็นที่อยู่นอกเขต 15 กม.)

อัปเดต C207 — 8 พฤศจิกายน 2569: C207.10 เปลี่ยนจากอินเทอร์เน็ตขาดระหว่างรอ (ซ้ำกับ C303.21 และปุ่มกลาง EV-GLOBAL-001) เป็นข้อความที่ลูกค้าพิมพ์ระหว่างรอแต่ส่งไม่สำเร็จ บับเบิ้ลมีปุ่มแตะลองส่งใหม่ ข้อความไม่หาย คิวไม่เปลี่ยน คง state key เดิม ฝั่งเภสัชกรได้รับข้อความเมื่อส่งสำเร็จเท่านั้น

## ข้อความแจ้งอาการเป็นข้อความแรกในแชท — 8 พฤศจิกายน 2569
มีในต้นแบบ: เมื่อเข้าห้องแชทหลังส่งคำปรึกษา (C207 รอคิว, C300 เภสัชกรพร้อม, C303 ห้องปรึกษา) ห้องรอเรียงเหมือนกันทุกเคส: ข้อความ info "ระหว่างรอเภสัชกร คุณสามารถแจ้งอาการหรือสอบถามข้อมูลเพิ่มเติมไว้ได้เลย" อยู่บนสุด ตามด้วยบับเบิ้ลของลูกค้า "แจ้งอาการ" ที่ส่งให้อัตโนมัติ แล้วจึงเป็นข้อความที่ลูกค้าพิมพ์ระหว่างรอ หลังเภสัชกรรับคิวลำดับนี้คงเดิม ข้อความ "เภสัชกรเข้าร่วมห้องแล้ว" ต่อท้าย ถ้าเข้าห้องโดยไม่ได้รอคิว ข้อความแจ้งอาการเป็นข้อความแรก
เนื้อหาเป็นข้อความตัวอย่างคงที่ (อาการ ไข้ เจ็บคอ, รายละเอียด, ประวัติแพ้ยายังไม่ได้ระบุ) ไม่ดึงค่าที่กรอกใน C203 และไม่ส่ง state ข้ามหน้า
C203 มีปุ่มมอคข้อมูลในแผงทดสอบ เติมอาการและรายละเอียดเฉพาะช่องที่ว่าง ไม่ติ๊กรับทราบให้ ปุ่มนี้อยู่ในแผงทดสอบเท่านั้น ไม่ใช่ UI ลูกค้า
ฝั่งเภสัชกรและแอดมิน: ระบบจริงควรส่งข้อมูลแจ้งอาการจริงของเคสเป็นข้อความแรก ต้องกำหนดรูปแบบข้อความและข้อมูลที่ส่ง (อาการ รายละเอียด แพ้ยา รูปที่แนบ) ก่อนใช้จริง
ต้องยืนยัน: รูปแบบบับเบิ้ลยังไม่ได้ตรวจใน Browser ที่อนุญาต

## รหัสแผ่นตะกร้ายาและข้อมูลเภสัชกร — 8 พฤศจิกายน 2569
แผ่นตะกร้ายาเปลี่ยนรหัสจาก C303.3 เป็น C312 และป๊อปอัปข้อมูลเภสัชกรเปลี่ยนจาก C303.4 เป็น C313 เพราะรหัสเดิมชนกับเลขเคส C303.3 (ชำระแล้ว) และ C303.4 (หมดเวลาชำระ) ที่ปิดไว้และสงวนเลข เนื้อหาและการทำงานของทั้งสองแผ่นไม่เปลี่ยน ตารางเทียบอยู่ที่ design-system/during-screen-code-migration.json บันทึกเก่าที่อ้าง C303.3/C303.4 ในความหมายของแผ่นให้เทียบตามตารางนี้ ไม่แก้ประวัติย้อนหลัง
แผงทดสอบส่วน "ไปจอ" แสดงเฉพาะหน้าจอและแผ่น เอาทางลัดเคส C303.2 และ C303.5 ออก ทั้งสองเคสยังกดได้จาก "ลองสถานะของจอนี้" ใน C303

## ลบ C209 ตรวจพื้นที่ให้บริการ — 8 พฤศจิกายน 2569
ผู้ใช้สั่งลบหน้า C209 (ขอใช้ตำแหน่ง, นอกพื้นที่, ไม่ให้ตำแหน่ง, ปลดล็อกเขตเกิน 15 กม.) กดเริ่มปรึกษาแล้วไปหน้าแจ้งอาการ C203 ทันที ไม่ขอตำแหน่งโทรศัพท์และไม่บล็อกตามตำแหน่ง สงวนรหัส C209 ไม่นำไปใช้ซ้ำ แผงทดสอบเอาสวิตช์ตำแหน่งโทรศัพท์ (จำลอง) ออก
ยังคงอยู่: หน้าแรก C201 แสดงร้านนอกระยะ 15 กม. ว่าเริ่มปรึกษาไม่ได้, C203 แจ้งเมื่อที่อยู่หลักนอกเขตส่งยา, C207.13 ห้องรอแจ้งที่อยู่จัดส่งนอกเขต และ C308 ตรวจเขตตอนชำระเงิน สวิตช์ล็อกเขต 15 กม. ยังมีผลกับการจัดส่งตามเดิม
ฝั่งเภสัชกรและแอดมิน: สวิตช์ล็อกเขตในคอนโซลไม่บล็อกการเริ่มปรึกษาจากตำแหน่งโทรศัพท์อีกต่อไป เขตส่งยาตรวจจากที่อยู่ เหตุผล (ผู้ใช้ยืนยัน 8 พ.ย. 2569): แอปไม่ขอตำแหน่งปัจจุบันของผู้ใช้แล้ว พื้นที่ให้บริการยึดตามที่อยู่ที่ผู้ใช้เลือกเท่านั้น ยังต้องตรวจว่าตรงกับเงื่อนไขที่แจ้ง อย. ก่อนใช้จริง

## รวม C300 เข้า C303 — 8 พฤศจิกายน 2569
C300 เภสัชกรพร้อมให้บริการ ใช้ห้องแชทเดียวกับ C303 และค้างโดยเภสัชกรไม่เริ่มคุย จึงรวมเข้า C303 ตามคำสั่งผู้ใช้: เภสัชกรรับคิวจาก C207 แล้วเปิดห้องแชท C303 ทันที แชทจากห้องรอคงอยู่ครบ (วันนี้ → ระหว่างรอเภสัชกร → แจ้งอาการ → ข้อความที่พิมพ์ → เภสัชกรเข้าร่วมห้องแล้ว) และเภสัชกรเริ่มคุยต่อ เปิดเคส C303.14 เภสัชกรเข้าห้องแล้ว · ก่อนเริ่มพิมพ์ แทนหน้า C300 ไม่นำรหัส C300 ไปใช้ซ้ำ /flow ขั้น A205R ชี้ C303.14
ฝั่งเภสัชกรและแอดมิน: เหตุการณ์รับคิวและเข้าห้องเดิมไม่เปลี่ยน ไม่สร้างเคสหรือคำสั่งซื้อใหม่

## C303.5 ลำดับจบแชทก่อนชำระเงิน — 8 พฤศจิกายน 2569
มีในต้นแบบ: เมื่อเภสัชกรจบแชทที่มีรายการยารอชำระ เภสัชกรพิมพ์ข้อความปิดท้าย 3 ข้อความทีละข้อความ (ขออนุญาตบันทึกรายการและจบการสนทนา, เลือกรับยาที่ร้านหรือจัดส่งด่วน ชำระผ่านพร้อมเพย์หรือบัตรภายใน 15 นาทีหลังเปิดหน้าชำระ, ขอบคุณที่ใช้บริการ) พิมพ์ช้าพอให้อ่าน → เว้น 3 วินาที → เภสัชกรสิ้นสุดสนทนาแล้ว พร้อมปุ่มนับถอยหลัง 30 วินาทีไป C308 ทันที
ข้อความเป็นตัวอย่างของต้นแบบ ไม่อ้างคูปองหรือโปรโมชันเพราะยังไม่มีโปรโมชันจริง เวลา 15 นาทีเริ่มเมื่อเปิดหน้าชำระครั้งแรกตามกติกาเดิม
ไปหน้าชำระเงิน: เปิด C308 ทับห้องแชททันทีโดยไม่แสดงหน้าแรกก่อน หน้าข้างใต้สลับเป็นหน้าแรกแบบไม่มีการเคลื่อนไหว ปิด C308 แล้วกลับหน้าแรก ไม่กลับเข้าห้องแชทที่ปิดแล้ว
ฝั่งเภสัชกร: ระบบจริงควรมีข้อความปิดท้ายสำเร็จรูปที่เภสัชกรส่งก่อนกดจบ หรือส่งอัตโนมัติเมื่อกดจบ ต้องยืนยันว่าแบบไหนก่อนใช้จริง

## C201 การ์ดการปรึกษาบนหน้าแรก — 8 พฤศจิกายน 2569
มีในต้นแบบ: การ์ดการปรึกษาเหลือ 2 แบบ (1) รอเภสัชกร ใช้กับคิวปกติ คิวถัดไป และเภสัชกรพัก แสดงจำนวนผู้รอก่อนหรือคิวถัดไป (2) กำลังปรึกษา ใช้กับรับคิวแล้ว กำลังสนทนา เภสัชกรรอคำตอบ และมีรายการยาในแชทที่ยังเปิด ปุ่มกลับไปปรึกษาต่อ การ์ดรอชำระค่ายายังแสดงหลังจบแชทจนกว่าจะชำระหรือหมดเวลา รายการยาที่หมดเวลาชำระไม่แสดงการ์ดบนหน้าแรก ดูได้ในประวัติการปรึกษาและใบสรุป
ปิดเคส C201.52, C201.53, C201.55, C201.56, C201.62 สงวนเลขเดิม C201.54 เปลี่ยนชื่อเป็น จำลอง กำลังปรึกษา /flow ขั้น A204/A207/A212 ปรับตาม และเอาขั้น A205 การ์ดรับคิวแล้วออก
ข้อสังเกต: การ์ดหน้าแรกไม่บอกแล้วว่าเภสัชกรรอคำตอบภายใน 2 นาที หรือเภสัชกรพัก ข้อมูลนี้ยังอยู่ในห้องแชท C207/C303

## Badge ข้อมูลยาใหม่ — 8 พฤศจิกายน 2569
จุดแดงที่เมนูติดตามการใช้ยาบนหน้าแรกขึ้นเมื่อคำสั่งซื้อชำระเงินสำเร็จ ทั้งส่งด่วนและรับที่ร้าน (C201.65–.70) ไม่รอจัดส่งสำเร็จแล้ว หายเมื่อเปิดข้อมูลยา C201.77/.78 ใช้คำสั่งซื้อที่ชำระและเสร็จสิ้นแล้ว จึงไม่มีการ์ดสถานะคำสั่งซื้อ หน้าแรกแสดงการ์ดปรึกษาเภสัช ฝั่งเภสัชกร: ข้อมูลยาที่ลูกค้าเห็นคือรายการที่ชำระแล้ว ต้องยืนยันว่าระบบจริงส่งข้อมูลยาให้ลูกค้าตั้งแต่ชำระสำเร็จ


## ภาพสถานะยา 2D vector และฟอร์ม OTP — 8 พฤศจิกายน 2569
- C309/C414 ใช้ภาพประกอบ 2D vector โทน Primary CI ชุดเดียวกัน 6 แบบ: เตรียมยา พร้อมรับที่ร้าน เรียกไรเดอร์ ส่งด่วน ส่งพัสดุ และส่งถึงแล้ว ภาพนิ่งพื้นโปร่งใส ไม่มีการเปลี่ยนลำดับงานหรือสถานะฝั่งร้าน/แอดมิน
- /flow ฝังหน้าจอจริง จึงใช้ภาพและฟอร์มเดียวกับแอปโดยอัตโนมัติ
- C105 ลดข้อความซ้ำในส่วนยืนยันเบอร์ เอาพื้นกล่อง OTP ออก ย้ายเปลี่ยนเบอร์เป็นลิงก์ขีดเส้นใต้ด้านขวาในช่องเบอร์ เอาส่งรหัส OTP แล้วออก แสดงส่งรหัสใหม่แทนเวลานับถอยหลังเมื่อรหัสหมดอายุ label OTP มีดอกจันแดงและระยะเท่าช่องอื่น เบอร์ที่รูปแบบถูกต้องแต่รอยืนยันไม่แสดงเป็นข้อผิดพลาด ยังต้องยืนยัน OTP ก่อนผ่านขั้นแรก และยังแจ้งเบอร์ผิดรูปแบบ/OTP ผิด/หมดอายุ
- อ้างอิงการใช้ error เฉพาะข้อมูลผิดและเก็บข้อมูลที่กรอก: https://design-system.service.gov.uk/components/error-message/

## รายการแจ้งเตือน C404 — 8 พฤศจิกายน 2569
- แสดงเป็นรายการบนพื้นหน้าเดียวกัน คั่นแต่ละรายการด้วยเส้น divider ด้านล่าง ไม่มีกรอบมนหรือพื้นสีของกล่อง คงไอคอน หัวข้อ คำอธิบาย เวลา และการกดดูรายละเอียด /flow ใช้หน้าจอจริงร่วมกัน


## C207 หน้ารอคิวก่อนเข้าแชท — 8 พฤศจิกายน 2569 (ใช้แทนข้อกำหนดห้องแชทระหว่างรอเดิม)
ต้นแบบปัจจุบัน: C203 → C207 หน้าค้นหาและรอคิว → เภสัชกรรับบริการ → C303 แชท ไม่มีปุ่มย่อ กลับ หรือช่องพิมพ์ใน C207 ออกได้เฉพาะยกเลิกคิวผ่าน C208 ไม่มีการประมาณเวลารอ แสดงรหัสคิวคงที่แยกจากจำนวนคิวก่อนหน้า แม้เป็นคิวถัดไปก็ยังไม่เปิดแชทจนรับบริการ ข้อมูลอาการและรายงานหลังใช้ยาที่ส่งก่อนเข้าคิวยังคงอยู่และส่งในแชทหลังรับบริการ สงวน C207.8/.10 และ C303.11/.12/.13 ที่เลิกใช้ ไม่เลื่อนเลขอื่น C300 ยังคงยกเลิกแล้ว ฝั่งเภสัชกร/แอดมินเป็นข้อกำหนดการเชื่อม event รับบริการจริง; ปุ่มจำลองในพรีวิวไม่ใช่ระบบหลังบ้านจริง
Research: [NN/g Virtual Queues](https://www.nngroup.com/articles/virtual-queue-best-practices/) แนะนำให้สื่อสารจำนวนคิวก่อนหน้าและแยกจังหวะรอกับเริ่มบริการชัดเจน การออกแบบรหัสคิวเด่นและจำนวนคิวในบัตรเดียวเป็นการประยุกต์ของต้นแบบนี้ ยังไม่ได้ทดสอบกับคนไข้จริง ข้อกำหนดไม่ย่อหน้าเป็นคำขอของเจ้าของผลิตภัณฑ์

## รายละเอียดคำสั่งซื้อร่วมกับหน้าสถานะ — 8 พฤศจิกายน 2569
ต้นแบบ C309/C414 ใช้รายละเอียดเดียวกับ C401: เรื่องที่ปรึกษา ข้อมูลรับบริการและเภสัชกร ยา/จำนวน/วิธีใช้ คำแนะนำ การชำระเงิน/ยอดแยก และใบเสร็จ ระหว่างดำเนินการนำสถานะและข้อมูลเฉพาะวิธีรับยาไว้บนสุด (รับที่ร้าน: รหัสและสาขา; ส่งด่วน: ที่อยู่/ติดตามไรเดอร์; พัสดุ: ขนส่ง/รหัสติดตาม/ที่อยู่) เมื่อสาขาหรือขนส่งแจ้งสำเร็จตัดส่วนติดตามออกและใช้ประวัติชุดเดิม ไม่มีปุ่มลูกค้ายืนยันรับยา
แนวทางจัดข้อมูล: แบ่งหัวข้อตามเนื้อหาและแสดงเฉพาะส่วนเกี่ยวข้อง อ้างอิง GOV.UK Design System https://design-system.service.gov.uk/patterns/check-answers/ เป็นการประยุกต์กับรายละเอียดคำสั่งซื้อ ไม่ใช่ผลทดสอบกับคนไข้ ระบบจริงยังต้องรับสถานะจากสาขา/ผู้ให้บริการขนส่ง


### ประวัติและแจ้งเตือนคำสั่งซื้อ — 8 พฤศจิกายน 2026
- C403 แสดงเฉพาะเลขคำสั่งซื้อ สถานะ วันเวลา และยอดชำระจริง (รวมค่าส่ง/ค่าธรรมเนียมจาก paid.total) กดเพื่อดูข้อมูลเต็มในรายการเดิม; ไม่แสดงสาขาหรืออาการในรายการย่อ รายการที่ไม่จ่ายไม่แสดงเป็นยอดชำระแล้ว
- C404 ต้องส่ง id คำสั่งซื้อกับแจ้งเตือน เปิดสถานะรับยาที่ยังดำเนินการ หรือสรุปคำสั่งซื้อที่สิ้นสุดแล้ว ไม่ใช้รายการแรกเป็น fallback; id ที่หาไม่พบแจ้งให้ทราบ
- แนวทางลดข้อมูลรอง: https://www.nngroup.com/articles/progressive-disclosure/ และคงสถานะให้หาได้ง่ายตาม https://baymard.com/ecommerce-design-examples/62-orders-overview เป็นการประยุกต์กับต้นแบบ ยังไม่ได้ทดสอบกับผู้ใช้จริง

## ข้อความแจ้งอาการไม่จัดหมวด — 8 พฤศจิกายน 2569
ข้อความแจ้งอาการอัตโนมัติในแชทขึ้นต้นด้วยหัวข้อ อาการเบื้องต้น แล้วตามด้วยสิ่งที่ลูกค้ากรอกใน C203 ตามที่พิมพ์ ไม่มีป้าย อาการ:/รายละเอียด:/ประวัติแพ้ยา: C412 แจ้งอาการหลังใช้ยาส่งเข้าแชทโดยขึ้นต้นด้วยหัวข้อ แจ้งแพ้ยา ตามด้วยชื่อยาและรายละเอียดเดิม หัวข้อนี้เป็นข้อความที่ผู้ใช้แจ้ง ไม่ใช่การยืนยันว่าแพ้ยา ต้นแบบยังใช้ข้อความตัวอย่างคงที่ ฝั่งเภสัชกร: ระบบจริงส่งข้อความดิบตามที่กรอก ไม่ต้องแยกหมวด ข้อมูลแพ้ยาและสุขภาพยังดูจากข้อมูลเคสแยก

## กติกา 1 คน 1 เคสปรึกษา — 8 พฤศจิกายน 2569
กติกา (ผู้ใช้ยืนยัน): แจ้งอาการเพื่อปรึกษาเภสัช (C203) และแจ้งอาการหลังใช้ยา/แพ้ยา (C412) คือการเปิดเคสปรึกษากับเภสัชกรเหมือนกัน ผู้ใช้ 1 คนมีเคสที่ยังไม่จบได้ครั้งละ 1 เคส ต้องจบเคสเดิมก่อน (เภสัชกรปิด ลูกค้าจบเอง ยกเลิกคิว หรือหมดเวลา) จึงเริ่มเคสใหม่ได้
มีในต้นแบบ: ระหว่างมีเคสค้าง ปุ่มปรึกษาเภสัชบนหน้าแรกและแผ่นข้อมูลร้านพากลับเคสเดิม (C207 หรือ C303) ไม่สร้างเคสใหม่ การ์ดหน้าแรกแสดงเคสที่ค้าง รายการยารอชำระหลังจบแชทไม่นับเป็นเคสที่ยังไม่จบ
ต้องยืนยัน: ตอนนี้ถ้าส่งรายงาน C412 ระหว่างมีเคสค้าง ต้นแบบนำรายงานไปต่อท้ายแชทของเคสเดิม ไม่สร้างเคสใหม่ ต้องยืนยันว่าแบบนี้ถูกต้อง หรือให้บล็อกการส่ง C412 จนกว่าเคสเดิมจะจบ
ฝั่งเภสัชกรและแอดมิน: ระบบจริงต้องกันการสร้างเคสซ้อนของผู้ใช้คนเดียวกันฝั่งเซิร์ฟเวอร์ด้วย ไม่พึ่งแอปอย่างเดียว

## C305 ผู้ใช้กดจบสนทนา = ยกเลิก — 8 พฤศจิกายน 2569
มีในต้นแบบ: ลูกค้ากดจบสนทนาแล้วยืนยันใน C305 เคสปรึกษาถูกยกเลิก รายการยาที่ยังไม่ชำระของเคสนั้นถูกยกเลิกด้วย กลับหน้าแรก C201 ที่ไม่มีการ์ดสถานะการปรึกษาหรือการ์ดชำระเงิน เริ่มปรึกษาใหม่ได้ทันที ไม่ส่งแจ้งเตือนใบสรุปหรือรายการรอชำระ ประวัติ C403 แสดงสถานะ ยกเลิก (คุณยกเลิกการปรึกษานี้) กติกานี้แทนแบบเดิมที่คงรายการยาค้างชำระหลังลูกค้าจบแชท เภสัชกรจบและหมดเวลาเพราะไม่ตอบยังใช้กติกาเดิม
ฝั่งเภสัชกรและแอดมิน: เคสที่ลูกค้ายกเลิกต้องแสดงผลเป็นยกเลิกโดยลูกค้า และรายการยาที่เสนอไว้ต้องถูกยกเลิก ไม่เรียกเก็บเงิน ต้องยืนยันว่าเภสัชกรยังต้องบันทึกสรุปเคสที่ถูกยกเลิกหรือไม่

## C308 ยุบเคสทดสอบ — 8 พฤศจิกายน 2569
ปิดเคสที่หน้าตาเหมือนเคสอื่นหรือเกิดไม่ได้ สงวนเลขเดิม: C308.2 จัดส่งปกติ ใช้ C308.3 ส่งด่วนแทน (หน้าเดียวกัน ต่างแค่ชื่อค่าส่ง ตัวเลือกจัดส่งปกติในโค้ดยังไม่ได้ลบ รอยืนยันเรื่องเปิดใช้), C308.4 ยังไม่มีที่อยู่ และ C308.5 กำลังเพิ่มที่อยู่ (หลังสมัครมีที่อยู่หลักเสมอ และหน้าชำระเงินแก้ที่อยู่ไม่ได้), C308.17 กรุงเทพเกิน 15 กม. ใช้ C308.18 นอกเขตส่งยาแทน (กติกา 15 กม. ทุกที่อยู่ ป้ายเหมือนกัน), C308.20 มียาเก็บเย็น ใช้ C308.19 รับที่ร้านเท่านั้นแทน (กล่องแจ้งแบบเดียวกัน), C308.28 โค้ดหมดอายุ ใช้ C308.27 โค้ดไม่ถูกต้องแทน (ข้อความผิดพลาดใต้ช่องแบบเดียวกัน) เหลือ 14 เคส /flow ขั้น A213 ปรับตาม

## C308 วิธีรับยาและบริษัทขนส่ง — 8 พฤศจิกายน 2569
ผู้ใช้ยืนยัน: วิธีรับยามี รับที่ร้าน, ส่งด่วน (Lalamove) และจัดส่งพัสดุ เลือกบริษัทขนส่งได้ 2 ราย คือ Flash Express และ DHL Express (แทนกฎเดิมที่มีแค่รับที่ร้านกับส่งด่วน) ส่งแบบเย็นยังไม่เปิด
มีในต้นแบบ: เลือกจัดส่งพัสดุแล้วแสดงหัวข้อ เลือกบริษัทขนส่ง ใต้ตัวเลือก ค่าเริ่มต้น Flash Express ค่าส่งและเวลาตามบริษัทที่เลือก (ค่าตัวอย่างจากใบเสนอราคาเดิมในโค้ด) บริษัทที่เลือกบันทึกในคำสั่งซื้อและใช้ในหน้าติดตามพัสดุ ส่งด่วนและจัดส่งพัสดุแสดงราคาบนการ์ดทันทีเพราะรู้ที่อยู่จัดส่งจากหน้าแรกแล้ว (จัดส่งพัสดุแสดงราคาของบริษัทที่เลือก ค่าเริ่มต้น Flash) ที่อยู่นอกเขตแสดง นอกเขต ระบบจริงต้องคำนวณค่าส่งจากระยะทางและราคาบริษัทขนส่งฝั่งเซิร์ฟเวอร์ ตัวเลือกบริษัทแสดงโลโก้ Flash Express และ DHL (ที่มาใน public/assets/couriers/SOURCES.md ต้องยืนยันการใช้โลโก้กับบริษัทขนส่งก่อนใช้จริง) เปิดเคส C308.2 กลับมา
ต้องยืนยัน: ค่าส่งและระยะเวลาจริงของแต่ละบริษัท ภาพประกอบในตัวอย่างเว็บแสดง Flash 2-4 วัน ฿55 และ DHL 3-5 วัน ฿30 ซึ่งต่างจากค่าในต้นแบบ กติกาเขต 15 กม. ยังบังคับจัดส่งพัสดุเมื่อเปิดล็อกเขต

C308 อัปเดต 8 พฤศจิกายน 2569: แผ่นเลือกข้อมูลใบกำกับภาษีเปิดซ้อนด้านล่างภายในหน้าชำระเงิน พื้นหลังยังเป็น C308 ไม่สลับไปหน้าอื่น ปิดด้วยปุ่มปิด แตะพื้นหลัง หรือ Esc เพิ่มข้อมูลใหม่ยังเปิดฟอร์มแก้ไขแบบเดิม ปิดเคส C308.29 หมดเวลาชำระค่ายา สงวนเลขเดิม เพิ่มเคส C308.30 เลือกข้อมูลใบกำกับภาษี เปิดหน้าชำระเงินพร้อมแผ่นเลือกข้อมูล

## C418/C405 คำสั่งซื้อที่ติดตาม — 8 พฤศจิกายน 2569
การ์ดคำสั่งซื้อเป็น scroll carousel ชิดขอบจอ เห็นการ์ดถัดไปบางส่วน เลื่อนด้วยการปัดนิ้ว trackpad กดจุดด้านล่าง หรือปุ่มลูกศร (เอาการลากด้วยเมาส์ออกเพราะทำให้กดปุ่มบนการ์ดไม่ได้) หยุดทีละการ์ด จุดเป็นปุ่มกดได้ แต่ละการ์ดแสดงลำดับของตัวเองที่หัวการ์ด เช่น 2/6 Flutter เทียบได้กับ PageView พร้อม viewportFraction และตัวบอกหน้า ยังไม่ได้ตรวจใน Browser ที่อนุญาต


### C403 การ์ดคำสั่งซื้อ · 8 พฤศจิกายน 2569
มีในต้นแบบ: หัวการ์ดแสดงไอคอน เลขคำสั่งซื้อและปุ่มคัดลอกแยกจากการเปิดรายละเอียด สถานะอยู่ขวา ใต้เส้นแบ่งแสดงวันเวลา จำนวนรายการยาที่มีข้อมูล และยอดชำระจริง รายการยังไม่ชำระไม่แสดงยอดเป็นศูนย์ ไม่แสดงสาขาหรืออาการบนการ์ด คงทางเข้าชำระเงินสำหรับรายการค้างจ่าย ไม่เปลี่ยนงานฝั่งร้านหรือผู้ดูแลระบบ


### C403 สถานะรายการ — 8 พฤศจิกายน 2569
ชำระและรับยาแล้วแสดง คำสั่งซื้อสำเร็จ; ชำระแล้วรอรับยาแสดง กำลังจัดส่ง (รวมรับที่ร้าน); ผู้ใช้จบสนทนาหรือหมดเวลาชำระแสดง ยกเลิกคำสั่งซื้อ ใช้หัวการ์ดไอคอนกล่องพัสดุสีขาวบนพื้น primary และสถานะตัวหนาขนาดใหญ่ รายละเอียดเปิดคำสั่งซื้อเดิม

การ์ด C403 แสดงร้านยาที่สั่งซื้อ วันที่สั่งซื้อ จำนวนรายการ และราคาเมื่อชำระสำเร็จ เรียงหัวข้อซ้ายผลลัพธ์ขวา ตัวอักษร body สถานะตัวหนาชิดขวาคู่กับลูกศรเปิดรายละเอียด

C403 ล่าสุด: เลขคำสั่งซื้อและสถานะอยู่แถวเดียวกัน สถานะขนาด caption ชิดขวาติดลูกศร ไม่มีปุ่มคัดลอกเลขคำสั่งซื้อ

C403 ป้ายสถานะมีเพียง คำสั่งซื้อสำเร็จ / กำลังจัดส่ง / ยกเลิกคำสั่งซื้อ รายการที่ไม่มีคำสั่งซื้อหรือยังรอจ่ายและไม่เข้าเงื่อนไขไม่แสดงป้ายอื่น ปุ่มชำระที่ยังใช้ได้คงอยู่

C418 หัวการ์ดเรียงลำดับ 1/n ไว้เหนือเลขคำสั่งซื้อ ปุ่มดูข้อมูลอยู่ขวา การ์ดจบคอร์สคงปุ่มประเมินอาการโดยไม่มีประโยคคำถามซ้ำ

C403: ชำระแล้วแต่ยังไม่รับยา ทุกวิธีรับและทุกขั้นตอนจัดยา/ขนส่ง ใช้ป้าย กำลังจัดส่ง สีเหลือง จนสาขาหรือขนส่งยืนยันส่งมอบสำเร็จ เพิ่มตัวอย่างชำระแล้วรอรับในประวัติ

C403 มีแท็บบนสุด ทั้งหมด / รอจัดส่ง / สำเร็จ / ยกเลิก แท็บรอจัดส่งรวมรายการชำระแล้วที่ยังไม่รับยา ใช้ร่วมกับคำค้นหาได้ รายการไม่มีสถานะอยู่เฉพาะทั้งหมด

C403: การ์ดกำลังจัดส่งเปิดสถานะของคำสั่งซื้อที่เลือก โดยรับที่ร้านไป C309 ส่วนส่งด่วน/จัดส่งปกติไป C414 ตามข้อมูลชำระเดิม รายการสำเร็จและยกเลิกยังเปิดรายละเอียดคำสั่งซื้อ

C201: ใต้เมนูลัดแสดงแบนเนอร์เตี้ยสำหรับคำสั่งซื้อที่ยังจัดส่งหรือรอรับ มีไอคอนสถานะล่าสุดและเลขคำสั่งซื้อ กดเปิด C309/C414 ของรายการนั้น ซ่อนเมื่อส่งมอบสำเร็จ

- C401: คำสั่งซื้อที่ยกเลิกใช้ปกสีแดงอ่อนและภาพประกอบยกเลิกจาง ๆ อิงสถานะเดียวกับประวัติ ไม่เพิ่มแถวสถานะในข้อมูลการรับบริการ

- C207: ปกภาพโทน primary เข้ม แสดงจำนวนคิวก่อนหน้าโดยไม่แสดงรหัสคิว/รายละเอียดซ้ำ คิวถัดไปและเภสัชกรพักใช้ข้อความสั้น คงออกได้เฉพาะยกเลิกคิว

C418/C405: เปิดเมนูติดตามยาหรือ badge แล้วแสดงหน้าคำสั่งซื้อและบันทึกการกินยาโดยตรง ไม่มีหน้าคั่นรอรับยา แผนที่ยังไม่ได้รับยายังไม่เปิดให้บันทึกหรือเริ่มเตือนกินยา

## C309 สถานะยา — 8 พฤศจิกายน 2569
C309 แสดงเฉพาะสถานะ รหัสรับยา/ที่อยู่จัดส่ง และสาขา รายละเอียดคำสั่งซื้อย้ายไปหน้า C401 ผ่านปุ่ม ดูคำสั่งซื้อ (คำสั่งซื้อเดิม ไม่สร้างใหม่) ปิด C309.10 รับยาที่สาขาแล้ว เพราะเมื่อรับยาหรือจัดส่งสำเร็จ ให้ดูที่ C401 สงวนเลขเดิม

## C114 ลงชื่อเข้าใช้ด้วย Google — 8 พฤศจิกายน 2569
ต้นแบบเลียนแบบหน้าเลือกบัญชีของ Google (โลโก้ G เลือกบัญชี ชื่อแอป รายการบัญชี ใช้บัญชีอื่น และข้อความการแชร์ข้อมูล) บัญชีเป็นข้อมูลตัวอย่าง ไม่มีการรับรหัสผ่าน ระบบจริงต้องใช้ Google Identity Services ซึ่งแสดงหน้าเลือกบัญชีของ Google เอง และตรวจสอบ token ฝั่งเซิร์ฟเวอร์ ห้ามสร้างหน้าเลือกบัญชีหรือช่องรหัสผ่าน Google เองในแอปจริง

C201: ระหว่างเตรียมยาและจัดส่ง แสดงแบนเนอร์ปรึกษาใต้สถานะจัดส่งเพื่อเริ่มปรึกษาครั้งใหม่ได้ โดยยังซ่อนเมื่อมีคิว/เคสปรึกษาเปิดอยู่หรือรอชำระเงิน

แถบเหนือเมนูล่าง: แสดงช่วงคิวปรึกษา สนทนา และรอชำระเงินเท่านั้น หลังชำระสำเร็จไม่แสดงแถบนี้ในทุกแท็บ ใช้แบนเนอร์สถานะรับยา/จัดส่งใต้เมนูหน้าแรกแทน

C201.79: ตัวอย่างสองคำสั่งซื้อที่ยังรับยาไม่ครบ บนหน้าแรกใต้เมนู แสดงเป็นกลุ่มรายการพร้อมจำนวน แต่ละใบมีสถานะ เลขคำสั่งซื้อ สาขา และวิธีรับยา กดแล้วเปิดสถานะเฉพาะใบนั้น เมื่อสำเร็จแล้วใบดังกล่าวออกจากกลุ่ม แบนเนอร์ปรึกษายังอยู่ใต้กลุ่ม

### ผลชำระเงิน C311 / C609 · 8 พฤศจิกายน 2569
ภาพผลชำระเงินใช้ภาพ 2D โทน CI เช่นเดียวกับสถานะจัดส่ง หัวข้อใหญ่ ข้อความรอง เลขคำสั่งซื้อเดิม และปุ่มขั้นตอนถัดไปแยกกันชัดเจน C609 ย้ายไปกลุ่มระหว่างปรึกษาเพื่อเปิดทดสอบบัตรไม่ผ่าน/ยกเลิกแอปธนาคาร โดยคงรหัสเดิม ปุ่มลองใหม่ไม่ต่อเวลาชำระเงิน


## ยกเลิกฟีเจอร์ติดตามการใช้ยา — 8 พฤศจิกายน 2569
ผู้ใช้สั่งเอาเมนูลัด 4 ปุ่มใต้แถบที่อยู่บน C201 ออก และยกเลิกฟีเจอร์ติดตามการใช้ยาทั้งหมด ข้อนี้แทนหัวข้อ C418/C405 และข้อความเรื่องจุดแดงข้อมูลยา เตือนกินยา ถามอาการกลางคอร์ส/หลังครบคอร์ส และประเมินอาการหลังจบคอร์สก่อนหน้า
- มีในต้นแบบ: ลบหน้า C405–C411, C418 และแผ่น C420 สงวนรหัสไว้ ไม่นำไปใช้ซ้ำ ปิดเคส C301 fudose/fucheck และ C201 medication-new/medication-read ข้อมูลสุขภาพ สมุดที่อยู่ และการตั้งค่าเข้าได้จากหน้าบัญชี C501
- แจ้งอาการหลังใช้ยา C412/C413/C416/C419 ยังอยู่ แท็บยาที่ใช้อยู่ดึงจากเคสล่าสุดที่ชำระแล้ว แท็บยาที่ใช้ใน 7 วันดึงจากประวัติการปรึกษาของเจ้าของบัญชี /flow A400 เหลือเฉพาะการแจ้งอาการหลังใช้ยา
- ต้องยืนยัน: คอนโซลร้าน S401 และสวิตช์ติดตามอาการตอนปิดเคส S305 ยังมีตรรกะติดตามอาการเดิม ลิงก์ไปหน้าลูกค้าที่ถูกลบเอาออกแล้ว รอผู้ใช้สั่งว่าจะเอาส่วนคอนโซลออกด้วยหรือไม่ หมวดข้อมูล ติดตามอาการป่วย ในเอกสารความยินยอมยังคงไว้ รอตรวจกับฝ่ายกฎหมาย


## เคลียร์โฟลว์ส่งมอบ — 8 พฤศจิกายน 2569
โฟลว์หลัก: สมัคร → หน้าแรก → ปรึกษา แชท/วิดีโอคอล → ชำระเงิน → ติดตามการจัดส่งยา → ประวัติคำสั่งซื้อ + แจ้งเตือนสถานะ
- มีในต้นแบบ: ลบแจ้งอาการหลังใช้ยา (C412 C413 C416 C419 ปุ่มใน C401 ข้อความรายงานในแชท และแจ้งเตือนจอล็อก C301 adr) และครอบครัว (C502–C504 C513) สงวนรหัสไว้ /flow ไม่มีหมวด A400 แล้ว
- ใบกำกับภาษี: ขอได้ครั้งเดียวต่อคำสั่งซื้อ ตอนชำระ C308 หรือจากใบเสร็จ C402 ในประวัติ ขอแล้วเห็นสถานะอย่างเดียว ลบทางออกใบใหม่ที่ค้างในโค้ด
- แก้บั๊ก: แก้ข้อมูลส่วนตัวจากบัญชี (C105 personal-edit) ไม่ติดการตรวจรหัสผ่านของขั้นสมัครแล้ว
- ลบโค้ดเคสทดสอบที่เลิกใช้ 179 เคส รหัสเคสที่ยังใช้คงเดิม ข้อมูลจำลองหลักย้ายไป public/runtime/customer-fixtures.js
- ต้องยืนยัน: คอนโซลร้าน S401 ยังรับรายงานอาการหลังใช้ยาและติดตามอาการ แต่แอปลูกค้าไม่มีทางส่งแล้ว ระบบจริงต้องตรวจกติกาใบกำกับภาษีครั้งเดียวที่เซิร์ฟเวอร์


## C308 ต้นแบบหน้าตาชำระเงิน — 8 พฤศจิกายน 2569
ผู้ใช้สั่งให้ C308 เป็น mock up UI เท่านั้น: เปิดแล้วต้องเห็นหน้าชำระพร้อมรายการยาตัวอย่างเสมอ ไม่ขึ้น "รายการนี้ชำระไม่ได้แล้ว"
- มีในต้นแบบ: ถ้าเคสปัจจุบันไม่มีรายการที่ชำระได้ (ชำระแล้ว หมดเวลา 15 นาที ยกเลิก หรือจบเคสโดยไม่มียา) C308 ใช้เคสตัวอย่างแยก (`S._paymentCase`, `mockCheckout: true`) ไม่แก้เคสจริงหรือประวัติ รายการที่ยังชำระได้จากแชท การ์ดหน้าแรก หรือประวัติยังเปิดรายการเดิม
- ต้องยืนยัน: ระบบจริงต้องกลับไปใช้กติกาเดิม รายการหมดเวลา/ชำระแล้วห้ามชำระซ้ำ ต้องแสดงสถานะจากเซิร์ฟเวอร์ ห้ามสร้างรายการใหม่เอง


## C114 เหลือเคสเดียว และ C102.15 Google ปฏิเสธ — 8 พฤศจิกายน 2569
- มีในต้นแบบ: C114 รวมเป็นเคสเดียว (รหัส C114 ไม่มี suffix) หน้าเลือกบัญชีแสดงบัญชีตัวอย่าง 2 บัญชี แตะสมาชิกเดิมเข้าหน้าแรก แตะสมาชิกใหม่ไปสมัคร C105 ยกเลิกปิดแผ่นกลับ C102 เคส C114.2 สมาชิกใหม่ และ C114.3 ไม่สำเร็จ เลิกใช้
- C102.15 ถูกปฏิเสธการเข้าสู่ระบบด้วย Google: ข้อความเตือนสีแดงบนหน้าเข้าสู่ระบบ ไม่เข้าระบบหรือสร้างบัญชี ลองปุ่ม Google อีกครั้งหรือใช้อีเมลได้ /flow เพิ่ม A114
- ต้องยืนยัน: ระบบจริงใช้ Google Identity Services แยกกรณีผู้ใช้ยกเลิก ปฏิเสธสิทธิ์ และ token ไม่ผ่านการตรวจฝั่งเซิร์ฟเวอร์ ต้นแบบใช้ข้อความเดียว


## C207 กลับหน้าแรกโดยคิวยังคงอยู่ — 8 พฤศจิกายน 2569
ข้อกำหนดล่าสุดแทนข้อจำกัดห้ามกลับเดิม: ปุ่มย้อนกลับมุมซ้ายกลับ C201 โดยไม่ยกเลิกหรือสร้างคิวใหม่ หน้าแรกแสดงการ์ดรอคิวและกดกลับ C207 ได้ ลำดับคิวและข้อมูลเดิมคงอยู่ ยังไม่เข้า C303 จนเภสัชกรรับบริการ การยกเลิกยังต้องผ่าน C208

C403: หัวข้อกลุ่มรายการที่ยังดำเนินการใช้ “คำสั่งซื้อกำลังดำเนินการ” ทั้งรายการประวัติและเคสปัจจุบัน

C207: พื้นหลังคลื่นเวกเตอร์ primary โปร่งบางตามขอบและด้านล่าง เว้นกลางสำหรับข้อมูลคิว ใช้การเคลื่อนไหวช้าเดิมและหยุดเมื่อเลือกลดการเคลื่อนไหว

C207: พื้นหลังคลื่นครอบคลุมทั้งหน้าจอ รวมด้านบนและหลังปุ่มยกเลิก โดยเลเยอร์เนื้อหาและปุ่มโปร่งใส

C207: เพิ่มคลื่นซ้อนเลเยอร์มุมซ้ายบนให้รับกับด้านล่างขวา โดยคงความโปร่งบางและพื้นที่อ่านข้อความกลางจอ

C207: คลื่นพื้นหลังใช้เฉพาะเลเยอร์สีอ่อน ไม่มีเส้นขอบเข้มตามแนวคลื่น

C207: ภาพสถานะรอปรึกษาใช้โทรศัพท์ นาฬิกา และฟองสนทนาแบบ 2D vector โทนเดียวกับขนส่ง แสดงเฉพาะตัวเลขใต้ข้อความมีคิวก่อนหน้าคุณ ไม่มีหน่วยคิวซ้ำ

C207: ภาพล่าสุดใช้ illustration 2D ผู้รับบริการนั่งรอพร้อมโทรศัพท์และนาฬิกา โทน primary/mint

C207: ขยายภาพรอคิวเป็น 280px สูงตามสัดส่วน จำกัดไม่เกินพื้นที่เนื้อหา และลดระยะใต้ภาพ

C207: กล่องจำนวนคิวล่าสุดใช้พื้นขาว ขอบเทาบาง และแสดงหน่วย “คิว” ข้างตัวเลข ตามคำขอใหม่


### 8 พฤศจิกายน 2569 · การ์ดสถานะร่วม
ปรับ C201/C403 และ /card-status-all ให้ใช้การ์ดพื้นขาว ขอบ primary บางกับแถบด้านบน ไอคอนพื้น primary ป้ายสถานะด้านขวา ข้อมูลเภสัชกรพื้นเทาอ่อน และส่วนปุ่มพื้น primary อ่อน ไม่มีเงา คงข้อความและเส้นทางกดเดิม อ้างอิง https://service-manual.nhs.uk/design-system/components/card : จัดข้อมูลที่สัมพันธ์กันในกลุ่มเดียวและใช้ปุ่มชื่อชัดเจน การจัดภาพนี้เป็นข้อเสนอออกแบบ ยังไม่ได้ทดสอบกับคนไข้จริง


ปรับการ์ดปรึกษารอบใหม่: หัว primary รวมสถานะและจำนวนคิวเด่น ข้อมูลเภสัชกรบนพื้นขาว ไม่มีกล่องเทาซ้อน ปุ่มเต็มความกว้างและไม่มีเงา C201/C403 และ gallery ใช้ component เดียวกัน คงหลัก NHS card เรื่องลำดับหัวข้อและปุ่มชัดเจนตามอ้างอิงข้างต้น


การ์ดปรึกษา: ข้อความมีผู้รอก่อนคุณ N คน ใช้หัวข้อบรรทัดเดียว ขนาดเดียวกับคุณเป็นคิวถัดไป ยกเลิกตัวเลขคิวขนาดใหญ่แยกบรรทัด


การ์ดรอชำระ C201/C403: ใช้หัว primary แบบการ์ดปรึกษา แสดงยอดเงินเป็นหัวข้อหลัก แท็กรอชำระอยู่แถวเดียวกับเวลานับถอยหลัง ข้อมูลสาขา/จำนวนรายการและสองปุ่มยังใช้ flow เดิม รวมกรณีใกล้หมดเวลาและยังไม่เปิด checkout

การ์ดรอชำระ: หัวข้อยอดเงินต้องชำระ ฿XXX บรรทัดเดียว แถวที่สองในหัว primary แสดงแท็กรอชำระและเวลาคงเหลือ

การ์ดรอชำระล่าสุด: แท็กรอชำระอยู่มุมบนขวา หัวข้อ “ต้องชำระ ฿XXX” ขนาด h2 เวลาคงเหลืออยู่บรรทัดถัดไป เหลือปุ่มดูรายการยาและชำระเงินเพียงปุ่มเดียว

การ์ดรอชำระ: เวลาคงเหลือใช้ตัวอักษร small ชิดใต้ยอดเงิน ระยะห่าง 4px และลด padding ท้ายหัวการ์ดเป็น 12px

หัวการ์ดสถานะ primary ใช้ไอคอนเดียวกับสถานะเป็นลายด้านขวา เอียง -18 องศา ความทึบ 7% ตกแต่งเท่านั้นและไม่รับการกด ใช้ร่วม C201/C403/gallery

## C201.79 หลายคำสั่งซื้อเป็น carousel — 8 พฤศจิกายน 2569
- มีในต้นแบบ: เมื่อมีคำสั่งซื้อที่ชำระแล้วและยังไม่เสร็จมากกว่า 1 รายการ หน้าแรกแสดงหัวข้อ คำสั่งซื้อที่กำลังดำเนินการ + จำนวน แล้วเป็น carousel การ์ดละ 1 คำสั่งซื้อ (กว้าง 88% การ์ดถัดไปโผล่) scroll-snap ปัดซ้ายขวา จุดบอกตำแหน่งเปลี่ยนตามการเลื่อน กดจุดหรือปุ่มลูกศรเมื่อโฟกัสเพื่อเลื่อน แตะการ์ดเปิดสถานะคำสั่งซื้อนั้นตามเดิม คำสั่งซื้อเดียวยังเป็นการ์ดเดี่ยว
- Flutter: เทียบได้กับ PageView viewportFraction 0.88 + dot indicator
- ต้องยืนยัน: ลำดับการ์ดเมื่อมีหลายรายการ (ตอนนี้ตามลำดับรายการคำสั่งซื้อในระบบ)


## C414 ปุ่มดูคำสั่งซื้อแทนก้อนรายละเอียด — 8 พฤศจิกายน 2569
- มีในต้นแบบ: C414 ทุกเคส (C414.1, .2, .5, .8–.11, .13–.16) ตัดก้อนสรุปการรับบริการ เรื่องที่ปรึกษา ข้อมูลบริการ ยา ยอดชำระ ออก เหลือสถานะ ที่อยู่จัดส่ง และปุ่ม ดูคำสั่งซื้อ ที่เปิดใบคำสั่งซื้อ C401 ของคำสั่งซื้อเดิม รูปแบบเดียวกับ C309/C414.17
- จัดส่งสำเร็จ (C414.2, .11, .16) ยังเป็นหน้าสถานะ จัดส่งแล้ว ไม่สลับทั้งหน้าเป็นใบสรุป ปุ่มติดตามไรเดอร์ซ่อนเมื่อจัดส่งเสร็จแล้ว
- ต้องยืนยัน: ไม่มี


## ลบเคสรอร้านเปิดเพื่อเตรียมยา — 8 พฤศจิกายน 2569
ผู้ใช้ยืนยัน: สั่งยาได้หลังปรึกษาเภสัชกรเท่านั้น และชำระต่อจากการปรึกษาทันที ร้านจึงเปิดอยู่เสมอตอนชำระ ไม่มีกรณีชำระแล้วรอร้านเปิด
- มีในต้นแบบ: ลบ C414.21 รอร้านเปิดเพื่อเตรียมยา และ C309.4 จ่ายตอนร้านปิด (แนวคิดเดียวกัน) รหัสสงวนไว้ เคสอื่นคงรหัสเดิม ข้อความสถานะ เริ่มเตรียมยาเมื่อร้านเปิด 09:00 / เริ่มเตรียมวันทำการถัดไป ถูกเอาออก
- ต้องยืนยัน: ไม่มี


## จัดส่งปกติ (ไปรษณีย์) ครบทุกขั้น — 8 พฤศจิกายน 2569
- มีในต้นแบบ: C414 จัดส่งปกติใช้ไทม์ไลน์ 6 ขั้นเดียวกันทุกเคส: ชำระแล้ว → ร้านจัดยาและแพ็ก → ส่งให้บริษัทขนส่งแล้ว → กำลังขนส่ง → กำลังนำส่ง → ส่งถึงแล้ว เพิ่มเคส C414.22 แพ็กแล้ว รอขนส่งเข้ารับ (ยังไม่มีเลขพัสดุ) และ C414.23 ส่งให้บริษัทขนส่งแล้ว (มีเลขพัสดุ คัดลอกได้) เวลาแสดงเฉพาะขั้นที่ถึงแล้ว ขั้นส่งถึงแล้วแสดงประมาณการ 1-3 วันทำการ การ์ดหน้าแรกแสดงสถานะใหม่ทั้งสอง /flow A222 และ /card-status-all เพิ่มเคสใหม่
- ต้องยืนยัน: ระบบจริงต้องรับสถานะจาก Flash Express/DHL Express (webhook หรือ API) เพื่อเปลี่ยนขั้น ต้นแบบใช้ข้อมูลจำลอง และยังไม่มีเคสส่งไม่สำเร็จ/ตีกลับ


## ลบไทม์ไลน์ส่งด่วนแบบเก่า C414.1 / .2 / .5 — 8 พฤศจิกายน 2569
- มีในต้นแบบ: ลบ C414.1 ส่งด่วน · กำลังจัดส่ง, C414.2 ขนส่งแจ้งว่าส่งถึงแล้ว และ C414.5 ส่งด่วน · ไรเดอร์กำลังจัดส่ง เพราะซ้ำกับ C414.8–.11 ซึ่งเป็นโฟลว์ส่งด่วนปัจจุบัน (เตรียมยา → เรียกไรเดอร์ → ไรเดอร์กำลังส่งยา → จัดส่งเสร็จสิ้น) ลบโค้ดไทม์ไลน์ส่งด่วนแบบเก่า (ชำระแล้ว → แพ็กแล้ว → ไรเดอร์ Lalamove รับยา → ส่งถึง) ด้วย คำสั่งซื้อจริงที่ชำระแล้วใช้โฟลว์ 4 ขั้นอยู่แล้ว เปิด C414 จากเมนูกระโดดเริ่มที่ C414.8 รหัส .1 .2 .5 สงวนไว้ เคสอื่นคงรหัสเดิม
- ต้องยืนยัน: ไม่มี


## รวมขั้นแพ็ก/ส่งให้ขนส่ง และลบหน้าสถานะสำเร็จ — 8 พฤศจิกายน 2569
- มีในต้นแบบ: จัดส่งปกติรวม C414.22 กับ .23 เป็นขั้นเดียว C414.22 แพ็กแล้ว ส่งให้บริษัทขนส่ง (มีเลขพัสดุ คัดลอกได้) ไทม์ไลน์: ชำระแล้ว → ร้านจัดยาและแพ็ก → แพ็กแล้ว ส่งให้บริษัทขนส่ง → กำลังขนส่ง → กำลังนำส่ง → ส่งถึงแล้ว
- ลบหน้าสถานะสำเร็จ C414.11 สนทนา: จัดส่งเสร็จสิ้น, C414.16 จัดส่งปกติ · จัดส่งสำเร็จ, C414.19 รับยาที่สาขาแล้ว เมื่อคำสั่งซื้อเสร็จ (ไรเดอร์ส่งถึง ขนส่งแจ้งส่งถึง หรือรับยาที่สาขาแล้ว) แอปเปิดใบคำสั่งซื้อ C401 ของคำสั่งซื้อนั้นทันที ทั้งจากการ์ดหน้าแรก แจ้งเตือน และขณะเปิดหน้าสถานะค้างอยู่ /flow และ /card-status-all เอาเคสสำเร็จออก รหัส .11 .16 .19 .23 สงวนไว้
- ต้องยืนยัน: ไม่มี


## เลยกำหนดรับยา: เอาปุ่มโทรหาร้านซ้ำออก — 8 พฤศจิกายน 2569
- มีในต้นแบบ: C414.20 / C309.9 เลยกำหนดรับยา การ์ด การรับยา แสดงเฉพาะข้อความ ร้านเก็บยาไว้ให้ถึงวันที่ และร้านจะโทรหาคุณ เอาปุ่มเขียว โทรหาร้าน ออก ยังโทรได้จากปุ่ม โทรหาร้าน ในการ์ด รับที่สาขา
- ต้องยืนยัน: ไม่มี


## C203 ลดเคสทดสอบ — 8 พฤศจิกายน 2569
- มีในต้นแบบ: ลบเคส C203.3 พิมพ์อาการเอง, .4 ยังไม่ระบุแพ้ยา, .5 เข้าคิวไม่สำเร็จ, .6 ติ๊กรับทราบแล้ว, .10 เลือกหลายอาการ, .11 ยังไม่ได้เล่ารายละเอียด ตามคำสั่งผู้ใช้ รวมข้อมูลจำลองของเคสเหล่านี้และข้อความเตือน ยังส่งข้อมูลไม่สำเร็จ ที่แสดงเฉพาะในเคส .5 เหลือ C203.1 ว่าง .2 กรอกแล้ว .7 ที่อยู่หลักนอกเขตส่งยา .12 แนบรูป 3 รูป .13 แนบไฟล์ไม่รองรับ รหัสที่ลบสงวนไว้ หน้าแจ้งอาการยังพิมพ์อาการเอง เลือกหลายอาการ และตรวจช่องรายละเอียดได้ตามเดิม
- ต้องยืนยัน: ระบบจริงต้องมีข้อความเมื่อเข้าคิวไม่สำเร็จ (คงข้อมูลที่กรอกและให้ลองใหม่) ต้นแบบไม่มีเคสทดสอบกรณีนี้แล้ว


## รีวิว C105 สมัครสมาชิก — 8 พฤศจิกายน 2569
- มีในต้นแบบ: ลบเคส C105.4 มีบัญชีเว็บ: ความยินยอมฉบับใหม่ (ไม่มีโหมดบัญชีเว็บเดิม ลบฟอร์มเก่าและโค้ดโหมดนี้ทั้งหมด) และ C105.5 สมัครใหม่ด้วยอีเมลที่ยืนยันแล้ว (ไม่มีการยืนยันตัวตนอีเมล) ลบเคสสุขภาพแบบติ๊กรายการที่ซ้ำกับการพิมพ์ข้อความ: C105.11 ข้อมูลสุขภาพหลายรายการ, .22 ระบุโรคประจำตัว, .23 ระบุโรคอื่น ๆ, .24 เลือกอื่น ๆ แต่ยังไม่กรอก, .27 เลือกหลายข้อและอื่น ๆ พร้อมโค้ดรายการให้ติ๊กที่ไม่ได้ใช้แล้ว (REG_LISTS, regHealthOptions)
- คงไว้ตามที่ผู้ใช้เลือก: ข้อมูลสุขภาพแต่ละหมวดยังเลือก ยังไม่ทราบ / ไม่มี / ระบุข้อมูล แล้วพิมพ์ข้อความเอง (C105.9 .10 .16 .40) และแนบเอกสารแพ้ยา (C105.18 .19 .28 .29)
- เบอร์โทรยืนยันด้วย SMS OTP ในฟอร์ม (C105.56–.64) อีเมลไม่มีการยืนยัน สมัครด้วย Google ใช้อีเมลจาก Google แก้ไม่ได้ (C105.55) รหัสที่ลบสงวนไว้ เคสอื่นคงรหัสเดิม
- ต้องยืนยัน: ไม่มี


## C105 เรียงรหัสใหม่ตามโฟลว์ + C520 แก้ไขข้อมูลส่วนตัว — 8 พฤศจิกายน 2569
- มีในต้นแบบ: ผู้ใช้สั่งเรียงรหัสเคส C105 ใหม่ตามขั้นของฟอร์ม เลขต่อเนื่อง 37 เคส: ข้อมูลส่วนตัว C105.1–.18 (ติดต่อและ OTP → ชื่อ เลขประชาชน วันเกิด → รหัสผ่าน) · ที่อยู่ .19–.26 · ข้อมูลสุขภาพ .27–.33 · ตรวจทานและยินยอม .34–.37 แผงพรีวิวจัดกลุ่มเคสตามขั้น รหัสเก่าเทียบได้ที่ design-system/c105-code-migration.json รหัสเหตุการณ์ EV-C105-<state> ไม่เปลี่ยน
- ตัดเคส OTP ที่ซ้ำ เหลือ กรอกเบอร์ / ส่ง SMS กรอกรหัส / รหัสไม่ถูกต้อง / OTP หมดอายุ / ส่ง SMS ไม่สำเร็จ (ลบ OTP ผิดครบจำนวน, ส่งรหัสใหม่ได้, ยืนยันเบอร์แล้ว, เปลี่ยนเบอร์) ลบเคสรายละเอียดอาคารยาวเกินกำหนด เพราะช่องจำกัดความยาว 200 ตัวอักษรอยู่แล้ว
- แก้ไขข้อมูลส่วนตัวย้ายออกจาก C105 เป็นหน้าใหม่ C520 (กลุ่มบัญชี เปิดจาก C501 › ข้อมูลส่วนตัว) เคส C520.1 แก้ไขข้อมูลส่วนตัว และ C520.2 ข้อมูลไม่ครบ หน้าตาและการบันทึกเหมือนเดิม /flow เพิ่ม A117
- ต้องยืนยัน: ไม่มี


## ลดเคสและรวมหน้าตามคำสั่งผู้ใช้ — 8 พฤศจิกายน 2569 (รอบ C105/C207/C303/C309/C401/C402)
- C105: วันเกิดเหลือเคสเดียว C105.15 วันเกิด: จำกัดถึงวันนี้ ลบ .12 ปีเกิดไม่ถูกต้อง .13 ล้อหมุน .14 ปีอธิกสุรทิน .16 ปี 1900 (ตัวเลือกวันเกิดยังทำงานเหมือนเดิม)
- C207: ลบเคส .3 เภสัชกรพัก ผู้ใช้เห็นสถานะรอคิวเท่านั้น และลบ C301 แจ้งเตือนเภสัชกรพัก (C301.5)
- C303: ลบเคส .14 เภสัชกรเข้าห้องแล้ว .15 ขอวิดีโอคอล .16 เลือกคุยแชทต่อ .17 ถอนคำขอวิดีโอ .18 จบแชทรอชำระ .19 เหลือชำระ 1 นาที (โค้ดคำขอวิดีโอจากเภสัชกรยังอยู่ รอยืนยันว่าจะลบทั้งฟีเจอร์ไหม)
- C309 รวมเข้า C414: หน้าสถานะยาทุกแบบใช้ C414 (รับที่สาขา .17 .18 .20 · ส่งด่วน · จัดส่งปกติ) การ์ดหน้าแรก แจ้งเตือน และปุ่มจากชำระสำเร็จไป C414 รหัส C309 สงวนไว้
- C401 เคสใหม่: .1 มียา กำลังจัดส่ง · .2 มียา จัดส่งสำเร็จ · .3 มียา ให้คะแนนแล้ว · .4 ไม่มียา ปรึกษาอย่างเดียว · .5 ไม่มียา ให้คะแนนแล้ว · .6 ยกเลิก · .7 ไม่พบใบสรุป มียาแสดงลิงก์ใบเสร็จ ไม่มียาไม่มีใบเสร็จ ทุกเคสให้คะแนนได้ยกเว้นยกเลิก (ผู้ใช้จบเอง/ไม่ตอบ แสดงสถานะยกเลิกอย่างเดียว) ให้คะแนนแล้วแสดงคะแนนที่ให้ C401 แสดงใบคำสั่งซื้อระหว่างจัดส่งด้วย (เดิมเด้งกลับหน้าสถานะ ทำให้ปุ่มดูคำสั่งซื้อใน C414 วนกลับ)
- C402: .1 ขอใบกำกับภาษี (รวม .3) · .4 ส่งใบกำกับภาษีทางอีเมลแล้ว (แทนรอดำเนินการ/ออกแล้ว ไม่มีดาวน์โหลดในแอป แจ้งให้ตรวจอีเมล ถ้าไม่ได้รับโทรฝ่ายบริการลูกค้า) · .6 เกิน 7 วัน ขอใบกำกับภาษีไม่ได้ (แสดงข้อความแทนการซ่อน) · .7 ไม่พบใบเสร็จ ลบ .5 และ .8
- ต้องยืนยัน: บัญชีที่สมัครด้วยเบอร์อาจไม่มีอีเมล ต้องกำหนดว่าส่งใบกำกับภาษีไปที่ไหน · เบอร์ฝ่ายบริการลูกค้าใช้ TP.STORE.cs จากข้อมูลต้นแบบ ต้องยืนยันเบอร์จริง


## รอบปรับ C207/C303/C401/C403/C421/C517 — 8 พฤศจิกายน 2569
- C207.13 นอกรัศมี 15 กม.: กล่องเตือน (สีเหลือง) แจ้งว่าปรึกษาเภสัชกรได้ตามปกติ แต่ซื้อหรือรับยาจากการปรึกษานี้ไม่ได้ ให้เปลี่ยนที่อยู่ก่อนปรึกษาครั้งถัดไป
- C303.8 กล่อง ยังคุยต่อไหม ใช้รูปทรงและสีเดียวกับกล่องเตือนกลาง (.note.warn)
- C401.6 ยกเลิก: แถบหัวเป็นสีกลาง ไม่ใช่สีแดง ข้อความ ยกเลิก
- C403 จัดเคสใหม่: .1 ทั้งหมด .2 รอจัดส่ง .3 สำเร็จ .4 ยกเลิก .5 ไม่มีข้อมูลการสั่งซื้อ .6 ค้นหา .7 ค้นหาไม่พบ .8 กำลังโหลด .9 โหลดไม่สำเร็จ (เรียงรหัสใหม่) เคสรอชำระ หมดอายุ ยกเลิกรายการ จบเอง ไม่ตอบ ถูกรวมในแท็บยกเลิก/ทั้งหมด
- C421.3 ไม่มีข้อมูลผู้รับ: ปุ่มเพิ่มข้อมูลผู้รับเปิด C519 แก้ไขข้อมูลออกใบกำกับภาษีโดยตรง
- แก้บั๊กแผงพรีวิว: สลับเคสของแผ่นที่เปิดอยู่ (เช่น C517, C519) แล้วแผ่นแสดงเคสเดิม เพราะปิดแผ่นหลังเตรียมข้อมูล ทำให้ข้อมูลถูกล้าง ตอนนี้ปิดก่อนแล้วจึงเตรียมเคสใหม่
- ต้องยืนยัน: C308 ยังเลือกรับยาที่ร้านได้เมื่อที่อยู่นอกรัศมี ขัดกับข้อความ C207.13 ที่ว่าซื้อยาไม่ได้
- แก้ต่อ: C207 หน้ารอคิวไม่เคยเรียกกล่องเตือนนอกรัศมี (มีแค่ใน C303) ตอนนี้แสดงใต้สรุปคิวแล้ว

- C403 ปรับต่อ (8 พ.ย. 2569): ไม่มีการค้นหาแล้ว (ลบปุ่มค้นหา ช่องค้นหา และเคส .6 ค้นหา .7 ค้นหาไม่พบ) เคสเหลือ .1 ทั้งหมด .2 รอจัดส่ง .3 สำเร็จ .4 ยกเลิก .5 ไม่มีข้อมูลการสั่งซื้อ .6 กำลังโหลด .7 โหลดไม่สำเร็จ แท็บสถานะแสดงทุกเคสรวมกำลังโหลดและโหลดไม่สำเร็จ โหลดไม่สำเร็จใช้หน้าตาแบบเดียวกับไม่มีข้อมูล (ภาพประกอบ + ปุ่มลองอีกครั้ง) แก้บั๊กเคสแท็บแสดงเหมือนกัน (หน้าบังคับแท็บทั้งหมดทุกครั้ง) ตอนนี้แต่ละเคสเลือกแท็บของตัวเอง


## ลดหน้า edge C601–C607 — 8 พฤศจิกายน 2569
- มีในต้นแบบ: C601 บังคับอัปเดตแอปเหลือเคสเดียว (รวม iPhone/Android) ลบหน้า C602 ปิดรับปรึกษาชั่วคราว, C603 สาขาปิดรับปรึกษา, C604 คิวหมดเวลา, C605 นอกเวลา: ฝากคำถาม, C606 เภสัชกรไม่รับเคส, C607 ไม่ให้สิทธิ์กล้อง รหัสสงวนไว้ ลบปุ่มจำลองที่พาไปหน้าเหล่านี้ (พักรับเคส กลับมารับเคส ปิดรับเคสสาขา รอครบ 30 นาที ร้านปิดระหว่างรอคิว ตอบคำถามที่ฝากไว้) ตอนร้านปิด ปุ่มในหน้าแจ้งอาการเป็น ร้านปิดรับปรึกษาอยู่ (กดไม่ได้) แทนฝากคำถาม ห้องที่ปิดเพราะไม่ตอบไม่มีปุ่มฝากคำถาม ผู้ใช้ที่ปฏิเสธกล้องเข้าหน้าวิดีโอคอลตามเดิม
- ต้องยืนยัน: ระบบจริงต้องมีทางแจ้งผู้ใช้เมื่อคิวหมดเวลา เภสัชกรไม่รับเคส สาขาปิดระหว่างรอ หรือไม่ได้ให้สิทธิ์กล้อง ต้นแบบไม่มีหน้าจอกรณีเหล่านี้แล้ว

- C403 ปรับต่อ (8 พ.ย. 2569): ไม่แสดงการ์ดกำลังปรึกษา/รอคิวในหน้าประวัติ ใช้แถบด้านล่างแทน ประวัติแสดงเฉพาะ ชำระแล้วรอจัดส่ง สำเร็จ และยกเลิก รายการรอชำระไม่อยู่ในประวัติ (อยู่ที่การ์ดหน้าแรก) ปรึกษาอย่างเดียวที่ไม่มียานับเป็นสำเร็จ ไม่มีการตอบกลับ 5 นาทีนับเป็นยกเลิก


## C610 ปิดปรับปรุงระบบ และ C611 เชื่อมต่อระบบไม่ได้ — 8 พฤศจิกายน 2569
- มีในต้นแบบ: หน้าใหม่กลุ่มจอผิดปกติ หน้าตาเดียวกับ C601 (ภาพไอคอน หัวข้อ คำอธิบาย การ์ดข้อมูล) ไม่มีปุ่มย้อนกลับ ปุ่มลองอีกครั้งด้านล่าง ระหว่างลองแสดงกำลังลองเชื่อมต่อ (.2) ทั้งสองหน้ามีคำเตือนฉุกเฉินไปโรงพยาบาลหรือโทร 1669 เพราะติดต่อเภสัชกรผ่านแอปไม่ได้ C610 ปิดปรับปรุงตามแผน แจ้งเวลากลับมา (ข้อความตัวอย่าง) ข้อมูลและคำสั่งซื้ออยู่ครบ C611 เรียก API ไม่ได้ทั้งระบบ (ต่างจาก C608 สัญญาณหลุดระหว่างวิดีโอคอล)
- ต้องยืนยัน: ระบบจริงต้องมี endpoint สถานะระบบหรือ flag ปิดปรับปรุง และเวลาที่จะกลับมาให้บริการ เบอร์ติดต่อร้านใช้ข้อมูลต้นแบบ
- C610/C611 ปรับเนื้อหาตาม research (design-system/service-unavailable-research.md): หัวข้อขออภัยแบบตรงไปตรงมา บอกเวลากลับมา (C610) บอกว่าข้อมูลและคำสั่งซื้อไม่หาย ทางเลือกปรึกษาที่ร้าน การ์ดติดต่อเราแบบเดียวกับ C601 ไม่มีศัพท์เทคนิค ปุ่ม ตรวจสอบอีกครั้ง/ลองอีกครั้ง
- C610/C611 เกลาคำ (8 พ.ย. 2569): ตัดการ์ดข้อมูลและการ์ดติดต่อ เหลือหัวข้อ คำอธิบาย 2 บรรทัด คำเตือนฉุกเฉินสั้น และปุ่ม C610 ไม่แสดงวันเวลา


### ระยะหน้าผลชำระเงิน C311 / C609 — 8 พฤศจิกายน 2569
ปรับพื้นที่บนหน้าสำเร็จตาม safe area โดยไม่เผื่อแถบหัวที่ไม่มี ลดภาพและช่องไฟระหว่างหัวข้อ ข้อความ เลขคำสั่งซื้อ และปุ่ม ใช้รูปแบบร่วมกันทั้งสำเร็จและไม่สำเร็จ เนื้อหายาวเลื่อนได้ คงการลองชำระใหม่และเวลาหมดอายุเดิม
อ้างอิง https://service-manual.nhs.uk/design-system/patterns/confirmation-page : เน้นผลของรายการ สิ่งที่จะเกิดถัดไป และเลขอ้างอิงอย่างชัดเจน ใช้เป็นเหตุผลจัดกลุ่มข้อมูล ส่วนค่าระยะเป็นการปรับให้เหมาะกับหน้าจอของต้นแบบนี้


## 8 พฤศจิกายน 2569 · พื้นที่บริการและคำเตือนเงียบ
C201 ตรวจว่ามีร้านในรัศมี 15 กม. จากที่อยู่ที่เลือกก่อนเริ่มปรึกษา หากไม่มี หน้าแรกยังแสดงร้านพร้อมสถานะอยู่นอกพื้นที่ให้บริการ แสดง Toast เฉพาะกดเมนูหรือแบนเนอร์ปรึกษา ไม่มีการเข้าคิว ลบเคส C207.13 และข้อความนอกเขตระหว่างรอแล้ว สงวนเลขเดิม
C303.8 ยังคงเตือนเมื่อเงียบ 3 นาทีและให้ตอบอีก 2 นาที ใช้กล่องอำพันอ่อน หัวข้อชัดเจน เวลาที่เหลือ และปุ่มปรึกษาต่อเต็มความกว้างสีน้ำตาลอำพันเข้ม กดแล้วคงห้องเดิม
อ้างอิง https://designsystem.digital.gov/components/alert/ ใช้หัวข้อสั้นและข้อความอธิบาย ไม่พึ่งสีอย่างเดียว และ https://design.homeoffice.gov.uk/design-system/patterns/help-users-to/manage-service-timing-out ให้เห็นเวลาและทางเลือกคุยต่อก่อนสิ้นสุด การใช้กล่องในแชทและคู่อำพันเป็นการออกแบบตามบริบทแอป ยังไม่ได้ทดสอบกับผู้ป่วยจริง

C201.8 ล่าสุด: ทั้งแบนเนอร์ปรึกษาและเมนูกลางใช้ quickConsult ตรวจรัศมี 15 กม. เมื่อไม่มีร้านในระยะ แสดง Toast “อยู่นอกระยะการใช้งาน” ค้างจนกดปิด คงหน้าเดิมและรายการร้าน ไม่เริ่มเคส

Toast นอกระยะของปุ่มปรึกษาทั้งสองปุ่มใช้ภาพแผนที่ร้านยา พร้อมหัวข้อ “อยู่นอกระยะการให้บริการ” และข้อความแนะนำเปลี่ยนที่อยู่ เนื่องจากไม่มีร้านในรัศมี 15 กม. ปิดได้ด้วยปุ่มกากบาท

ข้อกำหนดล่าสุด: ปุ่มปรึกษาทั้งสองปุ่มเมื่อไม่มีร้านในรัศมี 15 กม. เปิด C216 Modal Bottom Sheet พร้อมรูป หัวข้อ คำอธิบาย และปุ่มปิด แทน Toast เดิม ปิดแล้วคงหน้าเดิม ไม่เริ่มเคส

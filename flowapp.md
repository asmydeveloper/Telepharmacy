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
- `EV-C108-unavailable` — ยังสมัครไม่เสร็จ · [เปิดเคส](/?screen=registrationsuccess&state=unavailable&splash=0)
- `EV-C108-long-name` — ชื่อจริงยาว · [เปิดเคส](/?screen=registrationsuccess&state=long-name&splash=0)
- `EV-C108-no-name` — ไม่มีชื่อแสดง · [เปิดเคส](/?screen=registrationsuccess&state=no-name&splash=0)
- `EV-C108-full-cover` — ปกเต็มจอและปุ่มใต้คำต้อนรับ · [เปิดเคส](/?screen=registrationsuccess&state=full-cover&splash=0)

### C110 · faceid (2 เหตุการณ์)

- `EV-C110-ios` — iPhone (Face ID) · [เปิดเคส](/?screen=faceid&state=ios&splash=0)
- `EV-C110-android` — Android (ลายนิ้วมือ) · [เปิดเคส](/?screen=faceid&state=android&splash=0)

### C111 · doc (1 เหตุการณ์)

- `EV-C111-default` — ปกติ · [เปิดเคส](/?screen=doc&splash=0)

### C112 · onboard (3 เหตุการณ์)

- `EV-C112-p1` — หน้า 1 เภสัชกรตัวจริง · [เปิดเคส](/?screen=onboard&state=p1&splash=0)
- `EV-C112-p2` — หน้า 2 เวลาให้บริการ · [เปิดเคส](/?screen=onboard&state=p2&splash=0)
- `EV-C112-p3` — หน้า 3 ขั้นตอนและความเสี่ยง · [เปิดเคส](/?screen=onboard&state=p3&splash=0)

### C201 · home (68 เหตุการณ์)

- `EV-C201-normal` — ปกติ · [เปิดเคส](/?screen=home&state=normal&splash=0)
- `EV-C201-loading` — กำลังโหลด · [เปิดเคส](/?screen=home&state=loading&splash=0)
- `EV-C201-active` — มีเคสค้าง · [เปิดเคส](/?screen=home&state=active&splash=0)
- `EV-C201-busy` — สาขาใกล้สุดพัก · [เปิดเคส](/?screen=home&state=busy&splash=0)
- `EV-C201-closed` — ร้านปิด · [เปิดเคส](/?screen=home&state=closed&splash=0)
- `EV-C201-address-alt` — เลือกที่อยู่คลองเตย · [เปิดเคส](/?screen=home&state=address-alt&splash=0)
- `EV-C201-noaddress` — ไม่มีที่อยู่ · [เปิดเคส](/?screen=home&state=noaddress&splash=0)
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
- `EV-C201-quick-busy` — ไม่มีร้านคิวว่าง · [เปิดเคส](/?screen=home&state=quick-busy&splash=0)
- `EV-C201-quick-unknown` — ยังไม่ทราบจำนวนคิว · [เปิดเคส](/?screen=home&state=quick-unknown&splash=0)
- `EV-C201-quick-address` — ปรึกษาโดยยังไม่มีที่อยู่ · [เปิดเคส](/?screen=home&state=quick-address&splash=0)
- `EV-C201-consult-banner` — แบนเนอร์ชวนปรึกษาเหนือร้านยา · [เปิดเคส](/?screen=home&state=consult-banner&splash=0)
- `EV-C201-active-next` — การปรึกษา คิวถัดไป · [เปิดเคส](/?screen=home&state=active-next&splash=0)
- `EV-C201-active-room` — การปรึกษา ยังไม่จบ · [เปิดเคส](/?screen=home&state=active-room&splash=0)
- `EV-C201-active-paused` — การปรึกษา พักรับคิว · [เปิดเคส](/?screen=home&state=active-paused&splash=0)
- `EV-C201-active-payment` — การปรึกษา รอชำระ · [เปิดเคส](/?screen=home&state=active-payment&splash=0)
- `EV-C201-active-idle` — การปรึกษา รอคำตอบ · [เปิดเคส](/?screen=home&state=active-idle&splash=0)
- `EV-C201-case-queue3` — จำลอง รออีก 3 คิว · [เปิดเคส](/?screen=home&state=case-queue3&splash=0)
- `EV-C201-case-queue2` — จำลอง รออีก 2 คิว · [เปิดเคส](/?screen=home&state=case-queue2&splash=0)
- `EV-C201-case-queue1` — จำลอง รออีก 1 คิว · [เปิดเคส](/?screen=home&state=case-queue1&splash=0)
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
- `EV-C201-case-payment-soon` — เหลือชำระ 1 นาที · [เปิดเคส](/?screen=home&state=case-payment-soon&splash=0)
- `EV-C201-case-closed-payexpired` — จบแชท หมดเวลาชำระ · [เปิดเคส](/?screen=home&state=case-closed-payexpired&splash=0)
- `EV-C201-case-video-request` — เภสัชกรขอวิดีโอคอล · [เปิดเคส](/?screen=home&state=case-video-request&splash=0)
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
- `EV-C207-urgent` — มีธงด่วน · [เปิดเคส](/?screen=queue&state=urgent&splash=0)
- `EV-C207-notifoff` — ปิดการแจ้งเตือนไว้ · [เปิดเคส](/?screen=queue&state=notifoff&splash=0)
- `EV-C207-refined` — รอในห้องแชท · [เปิดเคส](/?screen=queue&state=refined&splash=0)
- `EV-C207-q4` — รออีก 3 คิว · [เปิดเคส](/?screen=queue&state=q4&splash=0)
- `EV-C207-message` — พิมพ์ข้อมูลระหว่างรอ · [เปิดเคส](/?screen=queue&state=message&splash=0)
- `EV-C207-joined` — เภสัชกรพร้อมให้บริการ · [เปิดเคส](/?screen=queue&state=joined&splash=0)
- `EV-C207-offline` — อินเทอร์เน็ตขาดระหว่างรอ · [เปิดเคส](/?screen=queue&state=offline&splash=0)
- `EV-C207-video-wait` — รอเภสัชกรวิดีโอคอล · [เปิดเคส](/?screen=queue&state=video-wait&splash=0)
- `EV-C207-video-next` — วิดีโอคอล · คิวถัดไป · [เปิดเคส](/?screen=queue&state=video-next&splash=0)

### C208 · cancelq (1 เหตุการณ์)

- `EV-C208-default` — ปกติ · [เปิดเคส](/?screen=cancelq&splash=0)

### C209 · area (4 เหตุการณ์)

- `EV-C209-ask` — ขอใช้ตำแหน่ง · [เปิดเคส](/?screen=area&state=ask&splash=0)
- `EV-C209-out` — นอกพื้นที่ให้บริการ · [เปิดเคส](/?screen=area&state=out&splash=0)
- `EV-C209-deny` — ไม่ให้ตำแหน่ง · [เปิดเคส](/?screen=area&state=deny&splash=0)
- `EV-C209-warn` — ปลดล็อกเขต เกิน 15 กม. · [เปิดเคส](/?screen=area&state=warn&splash=0)

### C210 · homeaddress (3 เหตุการณ์)

- `EV-C210-normal` — มีที่อยู่ · [เปิดเคส](/?screen=homeaddress&state=normal&splash=0)
- `EV-C210-empty` — ยังไม่มีที่อยู่ · [เปิดเคส](/?screen=homeaddress&state=empty&splash=0)
- `EV-C210-named` — ที่อยู่ตั้งชื่อเอง · [เปิดเคส](/?screen=homeaddress&state=named&splash=0)

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
- `EV-C505-edit` — แก้ไขข้อมูล · [เปิดเคส](/?screen=health&state=edit&splash=0)
- `EV-C505-none` — ระบุว่าไม่มี · [เปิดเคส](/?screen=health&state=none&splash=0)
- `EV-C505-invalid` — แก้ไขข้อมูลไม่ครบ · [เปิดเคส](/?screen=health&state=invalid&splash=0)
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

- `EV-C513-default` — ปกติ · [เปิดเคส](/?screen=algdel&splash=0)

### C514 · addressbook (4 เหตุการณ์)

- `EV-C514-normal` — มีที่อยู่หลัก · [เปิดเคส](/?screen=addressbook&state=normal&splash=0)
- `EV-C514-empty` — ยังไม่มีที่อยู่ · [เปิดเคส](/?screen=addressbook&state=empty&splash=0)
- `EV-C514-alternate` — เปลี่ยนที่อยู่หลัก · [เปิดเคส](/?screen=addressbook&state=alternate&splash=0)
- `EV-C514-named` — ชื่อที่อยู่ บ้านแม่ · [เปิดเคส](/?screen=addressbook&state=named&splash=0)

### C515 · addressedit (16 เหตุการณ์)

- `EV-C515-normal` — เพิ่มที่อยู่ · [เปิดเคส](/?screen=addressedit&state=normal&splash=0)
- `EV-C515-edit` — แก้ไขที่อยู่ · [เปิดเคส](/?screen=addressedit&state=edit&splash=0)
- `EV-C515-invalid` — ข้อมูลไม่ครบ · [เปิดเคส](/?screen=addressedit&state=invalid&splash=0)
- `EV-C515-named` — แก้ไขชื่อที่อยู่ · [เปิดเคส](/?screen=addressedit&state=named&splash=0)
- `EV-C515-map-ready` — ที่อยู่ครบ พร้อมยืนยันหมุด · [เปิดเคส](/?screen=addressedit&state=map-ready&splash=0)
- `EV-C515-map-outside` — หมุดนอกตำบล บันทึกไม่ได้ · [เปิดเคส](/?screen=addressedit&state=map-outside&splash=0)
- `EV-C515-map-error` — โหลดขอบเขตตำบลไม่ได้ · [เปิดเคส](/?screen=addressedit&state=map-error&splash=0)
- `EV-C515-form-required` — ไม่กรอกข้อมูลบังคับ · [เปิดเคส](/?screen=addressedit&state=form-required&splash=0)
- `EV-C515-form-phone` — เบอร์มือถือผิดรูปแบบ · [เปิดเคส](/?screen=addressedit&state=form-phone&splash=0)
- `EV-C515-form-name` — ชื่อมีตัวเลข · [เปิดเคส](/?screen=addressedit&state=form-name&splash=0)
- `EV-C515-form-area` — พื้นที่ยังเลือกไม่ครบ · [เปิดเคส](/?screen=addressedit&state=form-area&splash=0)
- `EV-C515-map-saved` — บันทึกหมุดแล้ว แก้ไขตำแหน่งได้เสมอ · [เปิดเคส](/?screen=addressedit&state=map-saved&splash=0)
- `EV-C515-form-split` — ที่อยู่แยกบ้านเลขที่ อาคาร ซอย ถนน · [เปิดเคส](/?screen=addressedit&state=form-split&splash=0)
- `EV-C515-form-legacy` — ที่อยู่เดิมยังอยู่ครบ ไม่แยกอัตโนมัติ · [เปิดเคส](/?screen=addressedit&state=form-legacy&splash=0)
- `EV-C515-form-details` — รายละเอียดอาคารยาวเกินกำหนด · [เปิดเคส](/?screen=addressedit&state=form-details&splash=0)

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

- `EV-C515-form-address-label` — ยังไม่กรอกชื่อที่อยู่ · [เปิดเคส](/?screen=addressedit&state=form-address-label&splash=0)

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

C102 แสดงปุ่ม Google และอีเมล/รหัสผ่าน พร้อมข้อความเชิญลงทะเบียนและปุ่มแยกด้านล่าง C109 เป็นฟอร์มอีเมล/รหัสผ่าน มีปุ่มแสดง/ซ่อนรหัสผ่าน และสถานะกรอกครบ รหัสไม่ถูกต้อง ระบบขัดข้อง ส่วน C113 เลือกช่องทางลงทะเบียน → C103/C104 ยืนยัน OTP → C105 กรอกข้อมูล 4 ขั้นและยอมรับเงื่อนไข C114 จำลอง Google บัญชีเดิม/ใหม่/เชื่อมต่อผิดพลาด สมาชิกใหม่ยังต้องผ่านการสมัครก่อนใช้งาน /flow เพิ่ม A113–A115 และแยกกลุ่มเข้าสู่ระบบกับลงทะเบียนชัดเจน

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

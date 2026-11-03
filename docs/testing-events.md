# คู่มือเคสทดสอบและส่งต่อ Flutter

คู่มือรายหน้าและทะเบียนรหัสอยู่ที่ [ดัชนีเหตุการณ์](../public/preview/events/README.md) เอกสารสร้างจาก registry เดียวกับ /screens ด้วย `npm run screens:sync` และตรวจความตรงกันด้วย `npm run screens:check`

- [สมัครสมาชิก C105](../public/preview/events/C105.md)
- [เหตุการณ์กลาง](../public/preview/events/GLOBAL.md)
- [ทะเบียน JSON](../public/preview/events/catalog.json)

แยก event ID จากรหัสหน้าจอ ไม่เปลี่ยนรหัสเดิม เคสกลางเป็น UI fault simulation ไม่ใช่การจำลอง backend เต็มระบบ ก่อนย้าย Flutter ต้องต่อ service adapter และตรวจ acceptance checklist อีกครั้ง เครื่องมือ preview ไม่ใช่ส่วนที่ย้ายไปแอปจริง

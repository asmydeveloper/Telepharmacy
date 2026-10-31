# ขอบเขตเตรียมย้ายแอปลูกค้า

สถานะ: เตรียมแนวทางไว้ ยังไม่ย้าย รอคำสั่งผู้ใช้หลังเกลาโฟลว์เสร็จ

## สิ่งที่จะนำไป
หน้าจอและแผ่นข้อมูลภายในแอป ปุ่ม ฟอร์ม เมนูจริง โฟลว์การใช้งาน tokens และ assets ที่ UI ใช้ คง loading/empty/error แต่ไม่เอาข้อมูลจำลองที่ใช้เรียกสถานะเหล่านั้นไปด้วย

## สิ่งที่อยู่เฉพาะต้นแบบ
กรอบเครื่องและ status bar จำลอง แผงทดสอบ รหัส/ปุ่มเคส registry โหมด bare/chrome/still เครื่องมือ /screens /design-system /log คอนโซลฝั่งร้าน และ fixtures ผู้ใช้ ร้านยา ระยะทาง ประวัติ สนทนา คิว ยาและการชำระเงิน

## แผนที่โค้ดปัจจุบัน
- `public/runtime/customer.js`: ยังรวมหน้าจอ โฟลว์ ข้อมูลจำลอง panel และ boot ไว้ด้วยกัน ต้องแยกก่อนนำไปใช้จริง ไม่คัดลอกทั้งไฟล์
- `src/app/Shell.jsx` และ `src/app/styles.css`: มีทั้งโครงพรีวิวและส่วนแอป ต้องคัดเฉพาะ DOM/styles ที่ตัวแอปต้องใช้
- `src/styles/tokens.css`, `customer-ui.css`, `layout.css`, `home.css`: ใช้เป็นฐาน UI ได้ แต่ต้องตัดการพึ่งกรอบจำลอง เช่น container `.phone` และ safe area จำลองออกหรือเปลี่ยนเป็น app root จริง
- `public/assets/`: เลือกเฉพาะภาพและไอคอนที่ใช้ ตรวจภาพตัวอย่างก่อนส่งมอบ
- `design-system/screens/`, `tests/`, `scripts/`: เก็บเป็นเอกสารและเครื่องมือพัฒนาต้นแบบ ไม่รวมในเนื้อแอปที่ส่งออก

## แนวทางงานถัดไป
ให้ UI รับข้อมูลและการกระทำผ่าน props/service adapters แยก fixtures กับ preview ไว้ภายนอก UI เป้าหมายคือโฟลเดอร์ app core ที่ไม่ import เครื่องมือทดสอบหรือ mock data ขณะนี้ยังไม่ได้แยกครบและยังไม่สร้างโฟลเดอร์ส่งออก

เมื่อผู้ใช้สั่งย้าย: ยืนยันแพลตฟอร์มปลายทาง แยก core กับ adapters แล้วตรวจทุกเส้นทางสำคัญโดยไม่มี preview runtime ก่อนส่งมอบ การใช้งานเว็บ Next.js กับ native mobile อาจต้องใช้ส่วนแสดงผลต่างกัน จึงยังไม่กำหนดแพลตฟอร์มแทนผู้ใช้

## Design System ที่แยกไว้แล้ว
`src/design-system/figma-tokens.json`, `src/styles/figma-tokens.css`, `src/styles/tokens.css` และ `src/styles/components.css` ไม่มี fixture ผู้ใช้หรือเครื่องมือพรีวิว ใช้เป็นฐานตอนแยก app core ได้ แต่ runtime หน้าจอยังต้องแยกตามแผนเดิม ไม่ได้ย้ายแอปในรอบนี้

## ประวัติและรายงานอาการที่ปรับล่าสุด
`src/styles/history.css` และ `src/styles/adr.css` เป็นฐาน layout ของหน้าประวัติ/รายงาน ส่วน `historyItems`, `medsFor`, `adrDraft`, `adrStoreReport` ใน runtime ยังเป็น prototype data layer ต้องแทนด้วย adapters ที่ตรวจสิทธิ์ผู้ดูแลและเก็บตาม patient id จริง รูปแนบเป็น object URL ใน session ยังไม่ได้ upload หรือเก็บถาวร ไม่คัดลอก registry/prep/sentMock ไปแอปจริง

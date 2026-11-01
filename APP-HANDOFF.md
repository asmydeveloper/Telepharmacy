# ขอบเขตเตรียมย้ายแอปลูกค้า

สถานะ: ผู้ใช้ยืนยันปลายทางเป็น Flutter วันที่ 1 พฤศจิกายน 2569 ปัจจุบันเกลาต้นแบบ Next.js ต่อไป ยังไม่เริ่มแปลง รอคำสั่งผู้ใช้อีกครั้ง

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

เมื่อผู้ใช้สั่งแปลง: เขียนส่วนแสดงผลและ navigation เป็น Flutter โดยยึดหน้าตาและพฤติกรรมแอปภายในจอพรีวิว ไม่คัดลอก DOM/CSS โดยตรง แยก core กับ adapters แล้วตรวจทุกเส้นทางสำคัญโดยไม่มี preview runtime ก่อนส่งมอบ ใช้ safe area และองค์ประกอบระบบจริงของอุปกรณ์แทนกรอบ/status bar/Dynamic Island/home indicator จำลอง

## Design System ที่แยกไว้แล้ว
`src/design-system/figma-tokens.json`, `src/styles/figma-tokens.css`, `src/styles/tokens.css` และ `src/styles/components.css` ไม่มี fixture ผู้ใช้หรือเครื่องมือพรีวิว ใช้เป็นฐานตอนแยก app core ได้ แต่ runtime หน้าจอยังต้องแยกตามแผนเดิม ไม่ได้ย้ายแอปในรอบนี้

## ประวัติและรายงานอาการที่ปรับล่าสุด
`src/styles/history.css` และ `src/styles/adr.css` เป็นฐาน layout ของหน้าประวัติ/รายงาน ส่วน `historyItems`, `medsFor`, `adrDraft`, `adrStoreReport` ใน runtime ยังเป็น prototype data layer ต้องแทนด้วย adapters ที่ตรวจสิทธิ์ผู้ดูแลและเก็บตาม patient id จริง รูปแนบเป็น object URL ใน session ยังไม่ได้ upload หรือเก็บถาวร ไม่คัดลอก registry/prep/sentMock ไปแอปจริง

## การเตรียมหน้าถัดไปสำหรับ Flutter
พิจารณาการเทียบ component, state, gestures, keyboard, safe area และ animation ระหว่างเว็บกับ Flutter เมื่อเพิ่มหรือเปลี่ยนหน้า ใช้ tokens/assets ร่วมเป็นแหล่งอ้างอิง แยกข้อมูลจำลองออกจากข้อกำหนด UI และบันทึกข้อจำกัดหรือวิธีทดแทนเมื่อพบการพึ่ง browser เฉพาะทาง การเลือกแพ็กเกจและตรวจความเข้ากันได้จริงให้ทำเมื่อเกี่ยวข้องกับงานนั้น ไม่ถือว่าต้นแบบเว็บพร้อมใช้งานจริงหรือแปลงเป็น Flutter แล้ว

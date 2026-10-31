# MITRAREE Design System

อ้างอิง Figma Telepharmacy เป็นชุดหลัก ดู [แผนที่ component และวิธีตรวจ](figma-component-mapping.md)

เปิด `/design-system` เพื่อดู tokens/component ที่ใช้งานจริง พร้อมเลือกเคสและความกว้าง 320/360/393/430px

- `src/design-system/figma-tokens.json`: source tokens ที่อ่านจากตัวแปร Figma
- `src/styles/figma-tokens.css`: generated tokens
- `src/styles/tokens.css`: compatibility aliases สำหรับหน้าจอเดิม
- `src/styles/components.css`: component กลาง
- `src/styles/layout.css`: layout, gutter และ safe area
- `src/styles/home.css`: layout หน้าแรกและร้านยา

มือถือใช้ gutter16px, spacing4/8/12/16/24/32/48/64, controls44/48/56, radius4/8/12/16/24/pill และ Noto Sans Thai

รัน `npm run design:sync` หลังแก้ token source และ `npm run design:check` เพื่อตรวจการอ้างอิง
ทะเบียนหน้าจอใช้ `npm run screens:sync` / `npm run screens:check` จัดตามกลุ่มใน `/screens`

ต้นแบบยังใช้ข้อมูลที่อยู่ ร้านยา ระยะทางและสถานะจำลอง แยกข้อกำหนดการย้ายเนื้อแอปไว้ใน `APP-HANDOFF.md`

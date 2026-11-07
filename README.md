# MITRAREE · Next.js

แอปลูกค้า คอนโซลร้าน ผังทุกจอ และ Design System ย้ายมารันด้วย Next.js App Router ไม่มีหน้า `.html` และไม่มี iframe ครอบไฟล์ HTML เดิม

## เริ่มใช้งาน

ต้องมี Node.js 20.9 ขึ้นไป

```sh
npm install
npm run dev
```

เปิด http://localhost:3000

| เส้นทาง | หน้า |
| --- | --- |
| `/` | แอปลูกค้า |
| `/console` | คอนโซลร้าน |
| `/screens` | ผังทุกจอ พร้อมเลือกฝั่งลูกค้า/ร้าน |
| `/design-system` | ตัวอย่างคอมโพเนนต์และขนาด UI |

```sh
npm run build
npm start
```

## โครงสร้างและการแก้ไข

- `src/app/**/page.jsx`: หน้าและ metadata ของ Next.js
- `src/app/**/Shell.jsx`: โครงหน้าจอ React JSX
- `src/app/**/styles.css`: สไตล์ของแต่ละหน้า
- `src/components/Runtime.jsx`: โหลดพฤติกรรมต้นแบบหลัง React พร้อมใช้งาน
- `public/runtime/*.js`: เครื่องมือแสดงจอ สถานะจำลอง และเหตุการณ์จากต้นแบบเดิม
- `public/assets/`: ภาพและรูปโปรไฟล์ แยกจาก data URI เพื่อใช้ไฟล์ร่วมกัน

การย้ายครั้งนี้คงเครื่องมือแสดงหน้าจอเดิมไว้ใน JavaScript ซึ่งยังสร้างเนื้อหาบางส่วนด้วย DOM/template strings ไม่ได้เขียนทุกจอย่อยใหม่เป็น React components ข้อมูลและ flow ยังเป็นต้นแบบจำลอง ไม่มีระบบหลังบ้านหรือการชำระเงินจริงเพิ่มเข้ามา

ลิงก์ข้ามแอปโหลดหน้าใหม่เพื่อแยกสถานะและ event listeners ของแต่ละต้นแบบ ผังทุกจอใช้ iframe ไปยังเส้นทาง Next.js เพื่อแสดงหน้าจอจริง รวมทั้ง query parameters เดิม เช่น `?screen=login&splash=0`

## ฐานข้อมูลอ้างอิง

- [แผนที่ฐานข้อมูล MITRAREE](docs/mitraree-database.md) — schema snapshot จากผู้ใช้ วันที่ 1 พฤศจิกายน 2569 รวมแผนภาพและ SQL อ้างอิง ยังไม่ได้เชื่อมต่อฐานข้อมูลหรือรัน SQL


## Code maintenance

- `npm run format`: format authored JSX/modules/CSS in src and next.config.js.
- `npm run format:check`: check the shared formatting rules.
- `npm run test:performance`: check preview activity, timer cleanup and runtime-version invalidation.
- Scope, evidence and remaining work: [docs/code-maintenance.md](docs/code-maintenance.md).

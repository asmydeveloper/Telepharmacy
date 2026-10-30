# MITRAREE Design System

ดูตัวอย่างที่ `/design-system` และหน้าที่ใช้งานจริง C201 ที่ `/?screen=home&splash=0`

- `src/styles/tokens.css`: แหล่งค่ากลางของ spacing, radius, typography และขนาด controls
- `src/styles/customer-ui.css`: กฎ UI ร่วมและ layout หน้า C201
- `src/app/styles.css`: สไตล์ฐานและหน้าจอเดิม

ใช้ spacing 4/8/12/16/20/24/32/40 px; page gutter 20 px (16 px บนจอแคบ); section gap 24 px; card padding 16 px; hero padding 20 px
ปุ่มสูงอย่างน้อย 52 px, ปุ่มเล็กและพื้นที่กดไอคอน 44 px; radius ปุ่ม 12 px, การ์ด 16 px, hero 20 px

หน้าแรกใช้ `.hm-content` จัด gap กลางแทน margin ของการ์ดแต่ละใบ ความสูงเพิ่มตามข้อความไทยได้
แก้ token ที่ไฟล์กลางเท่านั้น ไม่ฝังสำเนา CSS แยกในแต่ละหน้า

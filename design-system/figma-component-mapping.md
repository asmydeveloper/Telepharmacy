# Figma → แอปลูกค้า

แหล่งอ้างอิง: [Telepharmacy Design System](https://www.figma.com/design/IByXSAbLSY9yPqGOLZeTFu/Untitled?node-id=6-2)

ใช้ **ค่าตัวแปรที่ผูกกับ layer จริง** เป็นหลัก ข้อความชื่อ swatch บางจุดใน Figma ยังแสดงค่าสีก่อนแก้ เช่น neutral-50 และ status colors จึงไม่คัดค่าจากป้ายข้อความนั้น

## ไฟล์กลาง

- `src/design-system/figma-tokens.json`: ข้อมูล Foundations และ semantic/component tokens จาก Figma
- `src/styles/figma-tokens.css`: CSS ที่สร้างจาก source ด้านบน
- `src/styles/tokens.css`: alias ให้หน้าจอเดิมใช้ชื่อเดิมแต่ resolve เป็น Figma tokens
- `src/styles/components.css`: สัญญารูปแบบ component ที่ใช้ร่วมกัน ไม่มีข้อมูลตัวอย่างหรือเครื่องมือพรีวิว
- `src/design-system/component-sources.json`: ลิงก์ node ที่อ่าน design context ประกอบการปรับ
- `public/assets/design-system/`: SVG จาก Figma แบบ local คง root dimensions เดิม ไม่มี URL ชั่วคราวใน runtime

## การจับคู่

| กลุ่ม Figma | Component ในแอป | กฎที่ใช้ |
| --- | --- | --- |
| Button Primary / Secondary / Ghost / Danger | `.btn`, `TP.ui.btn` | SM44 / MD48 / LG56, pill, padding-x24, medium16/24, hover/pressed/focus/disabled/loading |
| Field / Text / Textarea / Select | `.input`, `.field`, `.st-phbox` | สูง48, padding12, radius12, label14/22, helper14/22, error/success/disabled/readonly |
| Choice Checkbox / Radio / Switch / Card | `.ck`, `.rd`, `.sw`, `.opt` | control20, switch44×24, touch44, selected teal, focus2px offset2px |
| OTP | `.st-otp`, `.st-cell` | digit44×48, gap8, radius8, font16/24, error/disabled/focus |
| FilterChip / RemovableChip | `.chip`, `.chips` | touch44, pill, label14/22, selected/neutral/error semantic colors |
| StatusPill / CountBadge | `.tag`, badge variants | min28, padding4×8, caption12/20, แยกสี semantic |
| Data Card / ListRow / AddressCard | `.card`, `.group`, `.row`, `.hm-address-card`, `.ds-history-card` | padding16, radius16, border semantic, title/body/helper จาก type tokens |
| BottomSheet / Dialog | `.sheet`, `.sh-*`, dialog contents | radius24, white surface, shadow-lg, title20/30, footer actions48 |
| Navigation / BottomBar | `.nav`, `.tabbar` | semantic surface และสี CI ตามหน้าที่ |
| Segmented control | `ui.seg()` / `.seg` | ผู้ใช้ปรับสเปก: แคปซูล neutral-50, active primary/on-primary, font14px, touch44px; ใช้ component-segment-* tokens กลาง |
| Avatar / Skeleton / Progress | `.av`, `.skel`, progress styles | avatar32/48/64, neutral loading surfaces, brand progress |
| Consultation | `.msg`, `.msg.me`, chat cards | body16/24, radius12, muted/selected surfaces, เก็บ flow และข้อมูลเดิม |
| Pharmacy / Product / Price / Order / Timeline | existing domain classes | เปลี่ยน palette/type/radius/spacing เป็น tokens และคงข้อมูล/ปุ่มเดิม |

คงข้อกำหนดหน้าหลักที่ผู้ใช้สรุปไว้: แบนเนอร์เต็มขอบ รูปร้าน1:1มุม12 และลิสต์ร้านไม่มีกรอบ ไม่เปลี่ยนเป็นการ์ดแนวตั้งของหน้าตัวอย่างใน Figma

## ตรวจและแก้ต่อ

- `npm run design:sync`: สร้าง CSS จาก token source
- `npm run design:check`: ตรวจ source/CSS ตรงกัน, token references, cycles และ SVG ที่ใช้งาน
- `npm run screens:check`: ตรวจรหัสและลิงก์เคสตรง runtime
- `/design-system`: ตัวอย่าง controls, เลือกหน้ากับเคส, ตรวจ7หน้าที่320/360/393/430px
- `npm run test:home`: ตรวจโฟลว์ที่อยู่ พื้นที่บริการ ร้านโปรด และวิธีปรึกษา

เฉพาะฝั่งแอปลูกค้า ไม่เปลี่ยนคอนโซลร้านตามสเปก customer library นี้ งานนี้ยังไม่ย้ายแอปไปปลายทาง เมื่อต้องย้ายให้ใช้ tokens/component source แยกจาก runtime fixtures ตาม `APP-HANDOFF.md`


## C203 / แจ้งอาการ
แยก3กลุ่มผู้รับคำปรึกษา อาการ และข้อมูลก่อนปรึกษา ค้นหาเป็นตัวกรองไม่เปลี่ยนอาการที่เลือก เพิ่มอาการเองมีจุดเดียวและป้องกันรายการซ้ำ รายการที่เลือกกดลบได้ ช่องเพิ่มเติมและแนบรูปเป็น optional disclosure มี labels ชัดเจน ไม่พึ่ง placeholder อย่างเดียว
Alert แยก error/danger กับ warning มี icon และข้อความ อาการอันตรายคงอยู่บนหน้าและไม่ข้าม redflag gate/acknowledgement เดิม ตัดข้อความฉุกเฉินที่ซ้ำในสรุปก่อนเข้าคิว แต่เก็บฉบับเต็มไว้
อ้างอิง https://design-system.service.gov.uk/patterns/question-pages/ และ https://www.nngroup.com/articles/required-fields/
ทดสอบ `npm run test:intake` สำหรับ search/clear/empty/custom/duplicate/remove โดยไม่เปิด browser ภายนอก

C203: ไม่แสดงจำนวนคนรอระหว่างกรอกอาการ คงชื่อสาขาสำหรับตรวจปลายทางและคงสถานะคิวหลังส่งข้อมูล เหตุผลการออกแบบ: จำนวนคนไม่เท่ากับเวลารอ ไม่เดาเวลาที่ไม่มีข้อมูลจริง หลักฐานเรื่องการคง feedback ระหว่างรอ: https://www.nngroup.com/articles/designing-for-waits-and-interruptions/ (การลดความลังเลก่อนส่งเป็นสมมติฐานที่ยังไม่ได้ทดสอบกับผู้ใช้)

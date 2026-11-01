# รอเภสัชกรในห้องแชท · 1 พฤศจิกายน 2569

## หลักฐานที่อ่าน
- [Salesforce: Queue Position in Messaging Window](https://help.salesforce.com/s/articleView?id=service.miaw_show_queue_position.htm&language=en_US&type=5): แสดงตำแหน่งคิวก่อนรับบริการ และหยุดแสดงเมื่อเริ่มสนทนา
- [NN/g: Visibility of System Status](https://www.nngroup.com/articles/visibility-system-status/): สื่อสารสถานะและผลของการกระทำในเวลาที่เหมาะสม
- [UTHealth: Visibility of System State](https://sbmi.uth.edu/nccd/ehrusability/design/guidelines/Principles/visibility.htm): ให้ feedback ระหว่างรอ แสดงการเปลี่ยนแปลงในบริบท และข้อมูลที่กรอกไว้

## การนำมาใช้
ใช้แชทเดิมร่วมกันตั้งแต่รอจนจบ แถบบนแสดงจำนวนคิวก่อนเรา (pos-1) ไม่ประมาณเวลารอ ข้อความระบบแจ้งเมื่อเปลี่ยนคิวและพัก โดยไม่เลื่อนผู้ใช้ลงท้ายถ้ากำลังอ่านด้านบน ส่งข้อมูลระหว่างรอได้ แต่ไม่มีคำตอบจำลองหรือ typing ก่อนเภสัชกรรับเคส เมื่อรับแล้วเพิ่มการ์ดชื่อและใบอนุญาตพร้อมข้อความให้บริการในห้องเดิม จึงเปิดวิดีโอคอล ย่อกลับหน้าแรกได้ ข้อความและร่างยังอยู่

นี่เป็นข้อสรุปการออกแบบจากหลักฐานและคำสั่งผู้ใช้ ยังไม่ได้ทดสอบกับผู้ป่วยจริง คิวและแชทเป็น prototype ในหน่วยความจำ ไม่มีการส่งถึงเภสัชกรจริง การแสดงคิวใช้ event จำลอง ไม่ใช่เวลาจริงจาก server

## Flutter ภายหลัง
ใช้ conversation model เดียวสำหรับ waiting/paused/active/closed แยก queue/provider events จาก composer และรายการข้อความ เก็บ draft กับ conversation เพื่อคงข้อมูลเมื่อย่อ ใช้ safe area ของอุปกรณ์จริง และแยกตัวควบคุมพรีวิวออกจาก UI


## Provider card and incoming video request — 2026-11-01
Source: https://service-manual.nhs.uk/design-system/components/card/ (read 2026-11-01). NHS recommends grouping related information and actions in short, scannable cards with a clear heading. Applied here as pharmacist photo/name, branch/license metadata, and a separate availability footer; this specific arrangement is a design inference, not a tested NHS clinician-card pattern.
User-confirmed flow: only the pharmacist requests video. The customer explicitly accepts the request card or keeps chatting. No camera/microphone start before acceptance. Pending, declined, withdrawn, active and ended cards remain in the transcript. In-app minimize retains call state and chat draft; returning opens the same call. Preview controls simulate incoming provider events; no live video service is connected. Flutter handoff: use an invitation state model and keep the media session above chat/video route widgets so navigation does not dispose the call.

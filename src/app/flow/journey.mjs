export const orderHistoryCases = [
  ['payment-expired', 'สิ้นสุด · หมดเวลาชำระเงิน'],
  ['order-complete', 'สำเร็จ · รับยาแล้ว'],
  ['no-response', 'สิ้นสุด · ไม่มีการตอบกลับ'],
  ['declined-medicine', 'สำเร็จ · ไม่รับยา'],
  ['no-medicine', 'สำเร็จ · ไม่มีรายการยา'],
  ['order-cancelled', 'ยกเลิกแล้ว'],
  ['customer-ended', 'สิ้นสุด · ผู้รับบริการจบการสนทนา'],
].map(([state, label]) => ({
  state, label, url: '/?screen=summary&splash=0&historyOutcome=' + state,
}));

// A codes identify journey steps. C codes and state keys come from the screen registry.
export const journey = [
  ['A100', 'เข้าสู่ระบบและสมัครสมาชิก', [
    ['เข้าสู่ระบบสมาชิก', [
      ['A101', 'เลือกวิธีเข้าสู่ระบบ', 'C102', 'normal'],
      ['A113', 'ดำเนินการด้วย Google', 'C114', 'normal', ['new-account', 'error']],
      ['A115', 'ลืมรหัสผ่าน', 'C115', 'normal', ['sent']],
    ]],
    ['ลงทะเบียนและยืนยันตัวตน', [
      ['A102', 'ลงทะเบียนด้วยเบอร์โทรศัพท์', 'C103', 'normal'],
      ['A103', 'ยืนยัน OTP ทางโทรศัพท์', 'C103', 'otp-sent', ['otp-wrong', 'otp-expired']],
      ['A104', 'ลงทะเบียนด้วยอีเมล', 'C104', 'normal'],
      ['A105', 'ยืนยัน OTP ทางอีเมล', 'C104', 'otp-sent', ['otp-wrong', 'otp-expired']],
    ]],
    ['สร้างบัญชีใหม่', [
      ['A106', 'ข้อมูลสมาชิกและยืนยันเบอร์ในฟอร์ม', 'C105', 'empty', ['google-new', 'phone-entry', 'phone-sent', 'phone-wrong', 'phone-expired', 'phone-resend', 'phone-verified', 'phone-change', 'phone-send-error', 'password-partial', 'password-mismatch', 'filled']],
      ['A107', 'เพิ่มที่อยู่', 'C105', 'address'],
      ['A108', 'ระบุข้อมูลสุขภาพ', 'C105', 'health'],
      ['A109', 'ตรวจทานข้อมูลก่อนสมัคร', 'C105', 'review', ['consent-ready', 'save-error']],
      ['A110', 'สมัครสมาชิกสำเร็จ', 'C108', 'normal', ['email']],
    ]],
    ['จัดการบัญชีหลังสมัคร', [
      ['A111', 'เพิ่มหรือแก้ไขชื่อที่อยู่', 'C515', 'named', ['form-address-label']],
      ['A112', 'เปิดเมนูบัญชี', 'C501', 'normal'],
    ]],
  ]],
  ['A200', 'ปรึกษาเภสัชกรจนถึงรับยา', [
    ['เริ่มปรึกษาและรอคิว', [
      ['A201', 'ดูสาขาจากหน้าแรก', 'C201', 'normal', ['busy', 'closed', 'unknownarea', 'noaddress', 'outarea']],
      ['A202', 'แจ้งอาการและเลือกแชทหรือวิดีโอ', 'C203', 'filled', ['normal', 'urgent']],
      ['A203', 'รอเภสัชกรรับคิว', 'C207', 'q4', ['q2', 'q1', 'paused', 'video-wait']],
      ['A204', 'การ์ดหน้าแรก · กำลังรอคิว', 'C201', 'case-queue3', ['case-queue2', 'case-queue1', 'case-next', 'case-paused']],
      ['A205', 'การ์ดหน้าแรก · เภสัชกรรับคิวแล้ว', 'C201', 'case-matched'],
    ]],
    ['พูดคุยและสั่งจ่ายยา', [
      ['A206', 'เข้าห้องและเริ่มสนทนา', 'C303', 'provider-joined', ['live']],
      ['A207', 'การ์ดหน้าแรก · กลับเข้าห้องสนทนา', 'C201', 'case-chat', ['case-reply']],
      ['A208', 'เภสัชกรขอวิดีโอคอล', 'C303', 'video-request', ['video-declined', 'video-withdrawn']],
      ['A209', 'การ์ดหน้าแรก · มีคำขอวิดีโอคอล', 'C201', 'case-video-request'],
      ['A210', 'ปรึกษาผ่านวิดีโอ', 'C306', 'on', ['connecting', 'camoff', 'weak']],
      ['A211', 'เภสัชกรส่งรายการยาให้ตรวจสอบ', 'C303', 'order', ['closed-unpaid', 'payment-soon']],
      ['A212', 'การ์ดหน้าแรก · รอชำระค่ายา', 'C201', 'case-payment', ['case-closed-unpaid', 'case-payment-soon', 'case-closed-payexpired']],
    ]],
    ['ชำระเงินและเตรียมยา', [
      ['A213', 'เลือกวิธีรับยาและตรวจยอด', 'C308', 'normal', ['express', 'parcel', 'noaddr', 'far', 'outzone']],
      ['A214', 'ชำระเงินและตรวจสอบผล', 'C308', 'qr', ['card', 'otp', 'checking', 'qrexp', 'order-expired']],
      ['A215', 'ชำระสำเร็จและรอจัดยา', 'C309', 'express', ['pickup', 'parcel', 'night']],
      ['A216', 'การ์ดหน้าแรก · ร้านกำลังเตรียมยา', 'C201', 'case-delivery-preparing'],
    ]],
    ['รับที่ร้าน', [
      ['A221', 'การ์ดหน้าแรก · รับที่ร้าน', 'C201', 'case-pickup-preparing', ['case-pickup-ready', 'case-pickup-complete']],
      ['A219', 'ดูรหัสรับยาและสถานะรับที่สาขา', 'C309', 'pickup', ['ready', 'pickup-complete', 'overdue']],
    ], 'ร้านเตรียมยา → พร้อมรับที่สาขา → ร้านบันทึกว่ารับยาแล้ว'],
    ['ส่งด่วน', [
      ['A217', 'การ์ดหน้าแรก · ส่งด่วน', 'C201', 'case-delivery-preparing', ['case-delivery-calling', 'case-delivery-delivering', 'case-delivery-delivered']],
      ['A218', 'ดูไทม์ไลน์ส่งด่วน', 'C414', 'chat-preparing', ['chat-calling', 'chat-delivering', 'chat-delivered']],
    ], 'ร้านเตรียมยา → เรียกไรเดอร์ → ไรเดอร์กำลังส่ง → จัดส่งสำเร็จ'],
    ['จัดส่งปกติ', [
      ['A222', 'การ์ดหน้าแรก · จัดส่งปกติ', 'C201', 'case-parcel-preparing', ['case-parcel-transit', 'case-parcel-out', 'case-parcel-delivered']],
      ['A220', 'ดูไทม์ไลน์พัสดุและยืนยันรับยา', 'C414', 'prep', ['transit', 'out', 'delivered', 'received']],
    ], 'ร้านเตรียมยา → ส่งให้ขนส่ง → กำลังขนส่ง → กำลังนำส่ง → ส่งถึงแล้ว → ลูกค้ายืนยันว่าได้รับยา'],
  ]],
  ['A300', 'ประวัติการปรึกษาและใบเสร็จ', [
    ['ย้อนดูผลการปรึกษา', [
      ['A301', 'เปิดประวัติการปรึกษา', 'C403', 'normal'],
      ['A302', 'คำสั่งซื้อ', 'C401'],
      ['A406', 'ประเมินอาการจากคำสั่งซื้อที่สำเร็จ', 'C420', 'normal'],
    ]],
    ['ดูเอกสารการชำระเงิน', [
      ['A303', 'ดูข้อมูลใบเสร็จ', 'C402', 'normal', ['parcel', 'missing']],
      ['A304', 'ติดตามใบกำกับภาษี', 'C402', 'taxpending', ['notax', 'taxdone', 'late']],
    ]],
    ['ดูความคืบหน้าจากการแจ้งเตือน', [
      ['A305', 'ดูสถานะสำคัญของการปรึกษาและคำสั่งซื้อ', 'C404', 'normal', ['empty', 'error']],
    ]],
  ]],
  ['A400', 'ข้อมูลยาและการกินยา', [
    ['เปิดข้อมูลยาและแผนการกิน', [
      ['A401', 'เปิดศูนย์รวมข้อมูลยา', 'C418', 'normal'],
      ['A402', 'ดูวิธีกินยาจากใบสรุป', 'C401', 'normal'],
      ['A403', 'ดูแผนและบันทึกการกินยา', 'C405', 'normal', ['day1', 'missed', 'multi-plan', 'done', 'empty']],
      ['A404', 'เลือกเวลาเตือนจากกล่องของแต่ละมื้อ', 'C410', 'normal', ['off', 'notifoff', 'error']],
    ]],
    ['ติดตามอาการหลังใช้ยา', [
      ['A407', 'แจ้งอาการหลังใช้ยา', 'C412', 'normal', ['filled', 'submit-error']],
      ['A408', 'ดูผลการแจ้งอาการ', 'C419', 'pending', ['replied']],
    ]],
  ]],
];

import CardPreview from './CardPreview';
import './styles.css';

export const metadata = { title: 'ภาพรวมการ์ดสถานะ | MITRAREE' };
const groups = [
  [
    'consultation',
    'ระหว่างปรึกษา',
    'การ์ดการปรึกษา',
    [
      ['queue3', 'รออีก 3 คิว'],
      ['queue2', 'รออีก 2 คิว'],
      ['queue1', 'รออีก 1 คิว'],
      ['next', 'คิวถัดไป'],
      ['paused', 'เภสัชกรพัก'],
      ['matched', 'เภสัชกรรับคิวแล้ว'],
      ['chat', 'กำลังสนทนา'],
      ['video-request', 'เภสัชกรขอวิดีโอคอล'],
      ['reply', 'รอคำตอบจากคุณ'],
      ['payment', 'เภสัชกรส่งรายการยา'],
    ],
  ],
  [
    'payment',
    'หลังปรึกษา · การชำระเงิน',
    'การ์ดชำระเงิน',
    [
      ['closed-unpaid', 'รอชำระค่ายา'],
      ['payment-soon', 'ใกล้หมดเวลาชำระ'],
      ['closed-payexpired', 'หมดเวลาชำระเงิน'],
    ],
  ],
  [
    'pickup',
    'รับยาที่ร้าน',
    'การ์ดสถานะคำสั่งซื้อ',
    [
      ['pickup-preparing', 'กำลังเตรียมยา'],
      ['pickup-ready', 'พร้อมรับยาที่สาขา'],
    ],
  ],
  [
    'express',
    'จัดส่งด่วน',
    'การ์ดสถานะคำสั่งซื้อ',
    [
      ['delivery-preparing', 'กำลังเตรียมยา'],
      ['delivery-calling', 'กำลังเรียกไรเดอร์'],
      ['delivery-delivering', 'ไรเดอร์กำลังส่งยา'],
    ],
  ],
  [
    'parcel',
    'จัดส่งปกติ',
    'การ์ดสถานะคำสั่งซื้อ',
    [
      ['parcel-preparing', 'กำลังเตรียมยา'],
      ['parcel-packed', 'แพ็กแล้ว ส่งให้บริษัทขนส่ง'],
      ['parcel-transit', 'อยู่ระหว่างขนส่ง'],
      ['parcel-out', 'กำลังนำส่ง'],
    ],
  ],
];
const total = groups.reduce((count, group) => count + group[3].length, 0);

export default function Page() {
  return (
    <main className="card-status-page">
      <header className="card-status-hero">
        <div className="card-status-top">
          <strong>MITRAREE · ภาพรวมต้นแบบ</strong>
          <a href="/flow">ดูโฟลการทำงาน ↗</a>
        </div>
        <h1>การ์ดสถานะการปรึกษา</h1>
        <p>ดูการ์ดที่ผู้ใช้เห็นในแต่ละช่วง ตั้งแต่รอคิวจนถึงรับยา</p>
        <div className="card-status-counts">
          <span>
            <b>3</b> รูปแบบการ์ด
          </span>
          <span>
            <b>{total}</b> ตัวอย่างสถานะ
          </span>
          <span>
            <b>{groups.length}</b> หมวด
          </span>
        </div>
      </header>
      <nav className="card-status-nav" aria-label="หมวดการ์ด">
        {groups.map(([id, title, , cases]) => (
          <a key={id} href={'#' + id}>
            {title}
            <span>{cases.length}</span>
          </a>
        ))}
      </nav>
      <p className="card-status-note">
        ใช้การ์ดจริงจากหน้าแรก กดปุ่มในตัวอย่างได้ · แต่ละตัวอย่างมีข้อมูลจำลองแยกกัน
      </p>
      {groups.map(([id, title, pattern, cases]) => (
        <section className="card-status-group" id={id} key={id}>
          <header>
            <div>
              <p>{pattern}</p>
              <h2>{title}</h2>
            </div>
            <span>{cases.length} ตัวอย่าง</span>
          </header>
          <div className="card-status-grid">
            {cases.map(([state, label]) => (
              <article className="card-status-example" key={state}>
                <div className="card-status-example-title">
                  <h3>{label}</h3>
                  <span>C201 / C403</span>
                </div>
                <CardPreview state={state} label={label} />
              </article>
            ))}
          </div>
        </section>
      ))}
      <aside className="card-status-note">
        <strong>เมื่อจบรายการ</strong>
        <p>
          รับยาที่สาขาแล้ว หรือขนส่งแจ้งจัดส่งสำเร็จ: ย้ายไปประวัติคำสั่งซื้อ ส่วนไม่มีการปรึกษา
          ยกเลิกคิว และจบการปรึกษาที่ไม่มีรายการค้าง จะไม่แสดงการ์ดดำเนินการบนหน้าแรก
        </p>
      </aside>
    </main>
  );
}

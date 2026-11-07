import './styles.css';
import '@/styles/figma-tokens.css';
import '@/styles/tokens.css';
import '@/styles/customer-ui.css';
import '@/styles/layout.css';
import '@/styles/home.css';
import '@/styles/components.css';
import '@/styles/intake.css';
import '@/styles/history.css';
import '@/styles/adr.css';

import LayoutPreview from './LayoutPreview';
import SegmentedPreview from './SegmentedPreview';

export const metadata = { title: 'MITRAREE · Design System' };
const spaces = [4, 8, 12, 16, 24, 32, 48, 64];
const radii = [
  ['xs', 4],
  ['sm', 8],
  ['md', 12],
  ['lg', 16],
  ['xl', 24],
  ['pill', 9999],
];
export default function Page() {
  return (
    <main className="design-guide">
      <nav>
        <a href="/">← แอปลูกค้า</a>
        <a href="/?screen=home&splash=0">หน้าแรก C201</a>
        <a href="/log">บันทึกการแก้ไข</a>
      </nav>
      <header>
        <p>MITRAREE / DESIGN SYSTEM</p>
        <h1>Design System จาก Figma</h1>
        <p>Primary #005F69 · Noto Sans Thai · ปุ่ม 44 / 48 / 56 px · ขอบหน้ามือถือ 16 px</p>
      </header>
      <p>
        <a
          href="https://www.figma.com/design/IByXSAbLSY9yPqGOLZeTFu/Untitled?node-id=6-2"
          target="_blank"
          rel="noreferrer"
        >
          เปิด Foundations ใน Figma ↗
        </a>
      </p>
      <LayoutPreview />
      <div className="guide-grid">
        <SegmentedPreview />
        <section>
          <h2>Empty states · ภาพสื่อความหมาย</h2>
          <p>
            ภาพ CI อ่อน พร้อมหัวข้อ เหตุผล และทางไปต่อ แยกข้อมูลว่างจากการค้นหาไม่พบและข้อผิดพลาด
          </p>
          <div className="guide-grid">
            {[
              ['history', 'ประวัติ'],
              ['users', 'ครอบครัว'],
              ['store', 'ร้านยา'],
              ['heart', 'ร้านโปรด'],
              ['map-pin', 'ที่อยู่'],
              ['pill', 'ยา'],
              ['clipboard-list', 'รายงานอาการ'],
              ['bell', 'แจ้งเตือน'],
              ['receipt', 'ใบเสร็จ'],
              ['file-search', 'ผลค้นหา'],
            ].map(([icon, label]) => (
              <figure key={icon}>
                <img
                  className="empty-illustration"
                  src={`/assets/empty/${icon}.svg`}
                  width="120"
                  height="96"
                  alt=""
                />
                <figcaption>{label}</figcaption>
              </figure>
            ))}
          </div>
          <a href="/screens">เปิดเคสทดสอบสถานะว่างของแต่ละหน้า →</a>
        </section>
        <section>
          <h2>Spacing</h2>
          <p>
            8 px ภายในข้อความ · 12 px ระหว่างไอคอนกับข้อความ · 16 px ภายในการ์ด · 24 px ระหว่างส่วน
          </p>
          {spaces.map((value, i) => (
            <div className="space-sample" key={value}>
              <code>--space-{[1, 2, 3, 4, 6, 8, 12, 16][i]}</code>
              <span style={{ width: value, height: 16, background: 'var(--brand)' }} />
              <b>{value} px</b>
            </div>
          ))}
        </section>
        <section>
          <h2>มุมโค้ง</h2>
          <div className="radius-samples">
            {radii.map(([name, value]) => (
              <figure key={name}>
                <div style={{ borderRadius: `var(--radius-${name})` }} />
                <figcaption>
                  {name}
                  <br />
                  {value} px
                </figcaption>
              </figure>
            ))}
          </div>
          <p>
            ปุ่มและช่องกรอก 12 px · การ์ด 16 px · แผงข้อมูล 24 px · วงรีใช้กับปุ่มและ badge ·
            แถบนำทางใช้มุม 12 px
          </p>
        </section>
        <section>
          <h2>ปุ่มและช่องกรอก</h2>
          <p>
            ปุ่มปกติ 48 px · ปุ่มเล็กและพื้นที่กดไอคอนอย่างน้อย 44 px · padding 12 × 24 px · gap 8
            px
          </p>
          <button className="btn primary sm">ปุ่มเล็ก 44 px</button>
          <button className="btn primary">เริ่มปรึกษา · 48 px</button>
          <button className="btn primary lg">ปุ่มใหญ่ 56 px</button>
          <button className="btn sm secondary">ปุ่มขนาดเล็ก</button>
          <label className="field">
            ชื่อผู้รับบริการ
            <input className="input" placeholder="กรอกชื่อ" />
          </label>
          <button className="btn" disabled>
            ยังดำเนินการไม่ได้
          </button>
        </section>
        <section>
          <h2>กริดและเลย์เอาต์ทั้งแอป</h2>
          <p>ขอบหน้า 16 px · ภายในการ์ด 16 px · แผงข้อมูล 24 px · gap เมนูลัด 12 px</p>
          <div className="guide-card">
            <strong>ติดตามการใช้ยา</strong>
            <p>จัดข้อความและไอคอนด้วย gap 12 px</p>
          </div>
          <div className="guide-shortcuts">
            <div className="guide-card">แพ้ยา / ผลข้างเคียง</div>
            <div className="guide-card">สมาชิกในบ้าน</div>
          </div>
          <p>ความสูงเพิ่มตามเนื้อหา เพื่อให้ข้อความไทยขึ้นบรรทัดได้</p>
        </section>
      </div>
    </main>
  );
}

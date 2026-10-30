import './styles.css';
import '@/styles/tokens.css';
import '@/styles/customer-ui.css';

export const metadata = { title: 'MITRAREE · Design System' };
const spaces = [4, 8, 12, 16, 20, 24, 32, 40];
const radii = [['small', 8], ['control', 12], ['card', 16], ['feature', 20]];
export default function Page() {
  return <main className="design-guide">
    <nav><a href="/">← แอปลูกค้า</a><a href="/?screen=home&splash=0">หน้าแรก C201</a><a href="/log">บันทึกการแก้ไข</a></nav>
    <header><p>MITRAREE / DESIGN SYSTEM</p><h1>ขนาดและระยะที่ใช้ร่วมกัน</h1><p>พื้นฐาน 4 px · ปุ่ม 52 px · การ์ด 16 px · ระยะระหว่างส่วน 24 px</p></header>
    <div className="guide-grid">
      <section><h2>Spacing</h2><p>8 px ภายในข้อความ · 12 px ระหว่างไอคอนกับข้อความ · 16 px ภายในการ์ด · 24 px ระหว่างส่วน</p>
        {spaces.map((value, i) => <div className="space-sample" key={value}><code>--space-{[1,2,3,4,5,6,8,10][i]}</code><span style={{width:value, height:16, background:'var(--brand)'}}/><b>{value} px</b></div>)}
      </section>
      <section><h2>มุมโค้ง</h2><div className="radius-samples">{radii.map(([name,value]) => <figure key={name}><div style={{borderRadius:`var(--radius-${name})`}}/><figcaption>{name}<br/>{value} px</figcaption></figure>)}</div><p>ปุ่มและช่องกรอก 12 px · การ์ด 16 px · การ์ดหลัก 20 px · วงรีใช้กับ badge และแถบนำทาง</p></section>
      <section><h2>ปุ่มและช่องกรอก</h2><p>ปุ่มปกติ 52 px · ปุ่มเล็กและพื้นที่กดไอคอนอย่างน้อย 44 px · padding 12 × 20 px · gap 8 px</p><button className="btn">เริ่มปรึกษา →</button><button className="btn sm secondary">ปุ่มขนาดเล็ก</button><label className="field">ชื่อผู้รับบริการ<input className="input" placeholder="กรอกชื่อ" /></label><button className="btn" disabled>ยังดำเนินการไม่ได้</button></section>
      <section><h2>การ์ดและเลย์เอาต์ C201</h2><p>ขอบหน้า 20 px · ภายในการ์ด 16 px · การ์ดหลัก 20 px · gap เมนูลัด 12 px</p><div className="guide-card"><strong>ติดตามการใช้ยา</strong><p>จัดข้อความและไอคอนด้วย gap 12 px</p></div><div className="guide-shortcuts"><div className="guide-card">แพ้ยา / ผลข้างเคียง</div><div className="guide-card">สมาชิกในบ้าน</div></div><p>ความสูงเพิ่มตามเนื้อหา เพื่อให้ข้อความไทยขึ้นบรรทัดได้</p></section>
    </div>
  </main>;
}

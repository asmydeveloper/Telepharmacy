export default function Shell() {
  return (
    <>
      <main {...{}}>
        <header {...{ className: 'ds-header' }}>
          <p {...{}}>{'MITRAREE / CUSTOMER UI'}</p>
          <h1 {...{ style: { fontSize: '28px', color: 'var(--brand)' } }}>{'Design System'}</h1>
          <p {...{}}>{'สีและเอกลักษณ์เดิม พร้อมระบบขนาด ตัวอักษร ปุ่ม และระยะห่างที่สม่ำเสมอ'}</p>
        </header>
        <div {...{ className: 'ds-demo-grid' }}>
          <section {...{ className: 'ds-demo' }}>
            <h2 {...{}}>{'ปุ่ม / Buttons'}</h2>
            <p {...{ className: 'ds-label' }}>{'52 px · 16 px semibold · radius 14 px'}</p>
            <button {...{ className: 'btn primary' }}>{'เริ่มปรึกษาเภสัชกร'}</button>
            <button {...{ className: 'btn secondary' }}>{'ดูรายละเอียด'}</button>
            <button {...{ className: 'btn tint' }}>{'กลับไปดูคิว'}</button>
            <button {...{ className: 'btn ghost' }}>{'ไว้ภายหลัง'}</button>
            <div {...{ className: 'btn-row' }}>
              <button {...{ className: 'btn sm primary' }}>{'บันทึก'}</button>
              <button {...{ className: 'btn sm secondary' }}>{'ยกเลิก'}</button>
            </div>
            <p {...{ className: 'ds-label' }}>{'Small 44 px · 14 px semibold · radius 8 px'}</p>
            <button {...{ className: 'btn', disabled: true }}>{'ดำเนินการต่อ'}</button>
          </section>
          <section {...{ className: 'ds-demo' }}>
            <h2 {...{}}>{'ตัวอักษร / Noto Sans Thai'}</h2>
            <p {...{ style: { fontSize: '28px', fontWeight: '700' } }}>{'ข้อมูลของคุณ'}</p>
            <p {...{ style: { fontSize: '20px', fontWeight: '600' } }}>{'ข้อมูลส่วนตัว'}</p>
            <p {...{ style: { fontSize: '16px' } }}>{'เภสัชกรพร้อมดูแลคุณและครอบครัว'}</p>
            <p {...{ style: { fontSize: '14px', color: 'var(--ink-3)' } }}>
              {'บันทึกข้อมูลไว้ เพื่อสะดวกในการปรึกษาครั้งต่อไป'}
            </p>
            <p {...{ className: 'ds-label' }}>
              {'คำกำกับสั้น 12 px · ข้อความไทยใช้ระยะบรรทัด 1.6–1.65'}
            </p>
            <div {...{ className: 'ds-swatches' }}>
              <i {...{ className: 'ds-swatch', style: { background: 'var(--brand)' } }}></i>
              <i {...{ className: 'ds-swatch', style: { background: 'var(--brand-tint)' } }}></i>
              <i {...{ className: 'ds-swatch', style: { background: 'var(--cream)' } }}></i>
            </div>
          </section>
          <section {...{ className: 'ds-demo' }}>
            <h2 {...{}}>{'ช่องกรอก / Form'}</h2>
            <div {...{ className: 'field' }}>
              <label {...{ htmlFor: 'demoName' }}>{'ชื่อ'}</label>
              <input
                {...{ className: 'input', id: 'demoName', placeholder: 'ชื่อจริง', value: 'สมใจ' }}
              />
            </div>
            <div {...{ className: 'field' }}>
              <label {...{ htmlFor: 'demoAddress' }}>{'ที่อยู่'}</label>
              <input
                {...{
                  className: 'input',
                  id: 'demoAddress',
                  placeholder: 'บ้านเลขที่ / ซอย / ถนน',
                }}
              />
              <p {...{ className: 'hint' }}>{'สูงอย่างน้อย 52 px · ตัวอักษร 16 px'}</p>
            </div>
            <div {...{ className: 'field err' }}>
              <label {...{ htmlFor: 'demoZip' }}>{'รหัสไปรษณีย์'}</label>
              <input
                {...{
                  className: 'input',
                  id: 'demoZip',
                  value: '101',
                  'aria-invalid': 'true',
                  'aria-describedby': 'zipError',
                }}
              />
              <p {...{ className: 'err-t', id: 'zipError' }}>{'ใส่รหัสไปรษณีย์ 5 หลัก'}</p>
            </div>
          </section>
          <section {...{ className: 'ds-demo' }}>
            <h2 {...{}}>{'ระยะห่างและมุม / Layout'}</h2>
            <p {...{}}>
              {'Gap 8 / 12 / 16 px'}
              <br {...{}} />
              {'Padding การ์ด 16 px'}
              <br {...{}} />
              {'Padding ปุ่ม 12 × 20 px'}
              <br {...{}} />
              {'ระยะระหว่างส่วน 24 px'}
            </p>
            <div {...{ className: 'ds-radius' }}>
              <div {...{}}>
                <i {...{ style: { borderRadius: '8px' } }}></i>
                <small {...{}}>{'8 px'}</small>
              </div>
              <div {...{}}>
                <i {...{ style: { borderRadius: '14px' } }}></i>
                <small {...{}}>{'14 px'}</small>
              </div>
              <div {...{}}>
                <i {...{ style: { borderRadius: '20px' } }}></i>
                <small {...{}}>{'20 px'}</small>
              </div>
            </div>
            <p {...{ className: 'ds-note' }}>
              {'ปุ่มและช่องกรอกใช้มุม 14 px · ปุ่มเล็ก 8 px · คงมุมใหญ่และ pill ขององค์ประกอบเดิม'}
            </p>
          </section>
          <section {...{ className: 'ds-demo', style: { gridColumn: '1/-1' } }}>
            <h2 {...{}}>{'โปรไฟล์ตัวอย่าง'}</h2>
            <div {...{ className: 'ds-portrait-grid' }}>
              <figure {...{}}>
                <img {...{ src: '/assets/profiles/self.png', alt: 'เจ้าของบัญชี' }} />
                <figcaption {...{}}>{'เจ้าของบัญชี'}</figcaption>
              </figure>
              <figure {...{}}>
                <img {...{ src: '/assets/profiles/mom.png', alt: 'คุณแม่' }} />
                <figcaption {...{}}>{'คุณแม่'}</figcaption>
              </figure>
              <figure {...{}}>
                <img {...{ src: '/assets/profiles/kid.png', alt: 'ลูก' }} />
                <figcaption {...{}}>{'ลูก'}</figcaption>
              </figure>
              <figure {...{}}>
                <img {...{ src: '/assets/profiles/pharmacist_f.png', alt: 'เภสัชกรหญิง' }} />
                <figcaption {...{}}>{'เภสัชกรหญิง'}</figcaption>
              </figure>
              <figure {...{}}>
                <img {...{ src: '/assets/profiles/pharmacist_m.png', alt: 'เภสัชกรชาย' }} />
                <figcaption {...{}}>{'เภสัชกรชาย'}</figcaption>
              </figure>
              <figure {...{}}>
                <img {...{ src: '/assets/profiles/doctor.png', alt: 'แพทย์' }} />
                <figcaption {...{}}>{'แพทย์'}</figcaption>
              </figure>
            </div>
            <p {...{ className: 'ds-note' }}>
              {'ภาพบุคคลสมมติสำหรับต้นแบบ ไม่ใช่บุคลากรหรือผู้รับบริการจริง'}
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

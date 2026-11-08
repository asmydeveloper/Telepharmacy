'use client';
import { useState } from 'react';
export default function SegmentedPreview() {
  const [selected, setSelected] = useState('all');
  const options = [
    ['all', 'ทั้งหมด'],
    ['paid', 'ซื้อยาแล้ว'],
    ['none', 'ไม่ได้ซื้อยา'],
  ];
  return (
    <section>
      <h2>ตัวเลือกแบบ Segmented</h2>
      <p>ใช้ร่วมกันทั้งแอป · ตัวอักษร 14px · พื้นที่กดอย่างน้อย 44px · active สี CI เข้ม</p>
      <div className="seg" role="group" aria-label="ตัวอย่างกรองการซื้อยา">
        {options.map(([value, label]) => (
          <button
            type="button"
            key={value}
            aria-pressed={selected === value}
            onClick={() => setSelected(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <p>ตัวเลือกที่ปิดใช้งาน</p>
      <div className="seg" role="group" aria-label="ตัวอย่างปิดใช้งาน">
        <button type="button" disabled aria-pressed="true">
          เลือกอยู่
        </button>
        <button type="button" disabled aria-pressed="false">
          ยังไม่พร้อม
        </button>
      </div>
    </section>
  );
}

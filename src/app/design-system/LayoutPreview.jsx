'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
const examples = [
  ['home', 'หน้าแรก · C201'],
  ['intake', 'แจ้งอาการ · C203'],
  ['history', 'ประวัติ · C403'],
  ['account', 'บัญชี · C501'],
  ['addressedit', 'ฟอร์มที่อยู่ · C515'],
  ['storeinfo', 'แผงข้อมูลร้าน · C212'],
  ['homeaddress', 'แผงเลือกที่อยู่ · C210'],
];
export default function LayoutPreview() {
  const [width, setWidth] = useState(393),
    [screen, setScreen] = useState('home'),
    [result, setResult] = useState(null);
  const frame = useRef(null);
  const [audit, setAudit] = useState(null),
    [auditing, setAuditing] = useState(false);
  const [state, setState] = useState('normal'),
    [states, setStates] = useState([]);
  const inspect = useCallback(() => {
    const doc = frame.current?.contentDocument,
      phone = doc?.querySelector('#phone');
    const current = doc?.querySelector('#stack>.scr:last-child');
    if (!phone || !current) return;
    const box = phone.getBoundingClientRect();
    const elements = [
      ...current.querySelectorAll('.app-page,.hm-content>*,.hm-updates>*,.field,.row,.btn'),
      ...doc.querySelectorAll('#sheet:not([hidden]) .sh-b>*,#sheet:not([hidden]) .sh-f>*'),
    ];
    const overflow = elements.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && (r.left < box.left - 1 || r.right > box.right + 1);
    });
    const scrolling = current.querySelector('.app-page');
    const definition = doc.defaultView?.TP?.def(screen);
    if (definition?.states)
      setStates((old) =>
        JSON.stringify(old) === JSON.stringify(definition.states) ? old : definition.states,
      );
    const gutter = scrolling
      ? getComputedStyle(scrolling).getPropertyValue('--page-gutter').trim()
      : '';
    setResult({ overflow: overflow.length, gutter });
  }, [screen]);
  useEffect(() => {
    setResult(null);
    const timer = setInterval(inspect, 750);
    return () => clearInterval(timer);
  }, [width, screen, state, inspect]);
  async function runAudit() {
    setAuditing(true);
    setAudit({ done: 0, total: 28, failures: [] });
    const failures = [];
    let done = 0;
    for (const [id, label] of examples)
      for (const size of [320, 360, 393, 430]) {
        const iframe = document.createElement('iframe');
        iframe.title = 'ตรวจ ' + label + ' ' + size;
        iframe.width = String(size);
        iframe.height = '740';
        iframe.style.cssText = 'position:fixed;left:-10000px;top:0;border:0;visibility:hidden';
        try {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('โหลดไม่สำเร็จ')), 12000);
            iframe.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            iframe.src = '/?bare=1&chrome=1&splash=0&screen=' + id + '&state=normal';
            document.body.appendChild(iframe);
          });
          const doc = iframe.contentDocument;
          await new Promise((resolve, reject) => {
            let tries = 0;
            const timer = setInterval(() => {
              if (doc.querySelector('#stack>.scr') && doc.defaultView?.TP) {
                clearInterval(timer);
                resolve();
              } else if (++tries > 80) {
                clearInterval(timer);
                reject(new Error('ไม่พบหน้าจอ'));
              }
            }, 50);
          });
          await doc.fonts.ready;
          const phone = doc.querySelector('#phone'),
            box = phone.getBoundingClientRect();
          const visible = [
            ...doc.querySelectorAll(
              '#stack>.scr:last-child .app-page,#stack>.scr:last-child .field,#stack>.scr:last-child .btn,#stack>.scr:last-child .hm-content>*,#sheet:not([hidden]) .sh-b>*,#sheet:not([hidden]) .sh-f>*',
            ),
          ];
          const overflow = visible.filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.left < box.left - 1 || r.right > box.right + 1);
          });
          if (overflow.length)
            failures.push({
              screen: label,
              width: size,
              reason: 'ล้นขอบ ' + overflow.length + ' จุด',
              elements: overflow
                .slice(0, 3)
                .map((el) => el.className)
                .join(', '),
            });
        } catch (error) {
          failures.push({ screen: label, width: size, reason: error.message });
        } finally {
          iframe.remove();
          done++;
          setAudit({ done, total: 28, failures: [...failures] });
        }
      }
    setAuditing(false);
  }
  return (
    <section className="layout-preview" aria-labelledby="layoutPreviewTitle">
      <h2 id="layoutPreviewTitle">ตรวจเลย์เอาต์หน้าจอจริง</h2>
      <p>เลือกหน้าและขนาดจอ แล้วลองเลื่อนหรือกดใช้งานเพื่อตรวจแนวขอบและระยะห่าง</p>
      <div className="layout-preview-controls">
        <label>
          หน้าจอ
          <select
            value={screen}
            onChange={(e) => {
              setScreen(e.target.value);
              setState('normal');
              setStates([]);
            }}
          >
            {examples.map(([id, label]) => (
              <option value={id} key={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          เคสทดสอบ
          <select value={state} onChange={(e) => setState(e.target.value)}>
            {(states.length ? states : [['normal', 'ปกติ']]).map(([id, label]) => (
              <option value={id} key={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div role="group" aria-label="ความกว้างจอ" className="layout-widths">
          {[320, 360, 393, 430].map((size) => (
            <button
              key={size}
              type="button"
              aria-pressed={width === size}
              onClick={() => setWidth(size)}
            >
              {size} px
            </button>
          ))}
        </div>
      </div>
      <p className="layout-preview-result" role="status">
        {result
          ? `${result.overflow ? 'พบส่วนล้นด้านข้าง ' + result.overflow + ' จุด' : 'ไม่พบเนื้อหาล้นด้านข้าง'} · ขอบหน้า ${result.gutter}`
          : 'กำลังโหลดหน้าจอ…'}
      </p>
      <div className="layout-audit">
        <button className="btn secondary sm" type="button" disabled={auditing} onClick={runAudit}>
          {auditing ? 'กำลังตรวจ…' : 'ตรวจ 7 หน้าที่ 4 ขนาดจอ'}
        </button>
        {audit && (
          <div role="status">
            <p>
              ตรวจแล้ว {audit.done}/{audit.total} · พบปัญหา {audit.failures.length} รายการ
            </p>
            {audit.failures.length > 0 && (
              <ul>
                {audit.failures.map((item, i) => (
                  <li key={i}>
                    {item.screen} · {item.width}px · {item.reason} {item.elements}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="layout-preview-stage">
        <iframe
          ref={frame}
          key={`${screen}-${width}-${state}`}
          title={`ตัวอย่าง ${screen} ที่ ${width}px`}
          src={`/?bare=1&chrome=1&splash=0&screen=${screen}&state=${encodeURIComponent(state)}`}
          width={width}
          height="740"
          onLoad={inspect}
        />
      </div>
    </section>
  );
}

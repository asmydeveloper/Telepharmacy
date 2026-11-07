'use client';

import { useState } from 'react';

export default function Preview({ title, cases, stateLabel = 'สถานะตัวอย่าง' }) {
  const [state, setState] = useState(cases[0]?.state);
  const selected = cases.find(item => item.state === state) ?? cases[0];
  if (!selected) return <p className="flow-caption">ไม่มีตัวอย่างหน้าจอ</p>;
  return <>
    {cases.length > 1 ? (
      <label className="flow-state">
        <span>{stateLabel}</span>
        <select value={selected.state} onChange={event => setState(event.target.value)}>
          {cases.map(item => <option key={item.state} value={item.state}>{item.label}</option>)}
        </select>
      </label>
    ) : <p className="flow-caption">{selected.label}</p>}
    <iframe key={selected.state} title={title + ' · ' + selected.label} loading="lazy"
      src={selected.url + '&bare=1&chrome=0&flowPreview=1'} />
    <div className="flow-actions">
      <a href={selected.url} target="_blank" rel="noopener">เปิดต้นแบบ ↗</a>
    </div>
  </>;
}

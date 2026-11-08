'use client';

import { useEffect, useRef, useState } from 'react';

export default function Preview({ title, cases = [], stateLabel = 'สถานะตัวอย่าง' }) {
  const [state, setState] = useState(cases[0]?.state);
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef(null);
  const visibleRef = useRef(false);
  const selected = cases.find((item) => item.state === state) ?? cases[0];

  function notifyVisibility() {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'telepharmacy:preview-visibility', visible: visibleRef.current },
      window.location.origin,
    );
  }

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (!('IntersectionObserver' in window)) {
      visibleRef.current = true;
      setLoaded(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) setLoaded(true);
      notifyVisibility();
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [Boolean(selected)]);

  if (!selected) return <p className="flow-caption">ไม่มีตัวอย่างหน้าจอ</p>;

  return (
    <>
      {cases.length > 1 ? (
        <label className="flow-state">
          <span>{stateLabel}</span>
          <select value={selected.state} onChange={(event) => setState(event.target.value)}>
            {cases.map((item) => (
              <option key={item.state} value={item.state}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="flow-caption">{selected.label}</p>
      )}
      {/* Keep loaded documents mounted so scrolling never discards form edits. */}
      <iframe
        ref={frameRef}
        title={`${title} · ${selected.label}`}
        loading="lazy"
        src={loaded ? `${selected.url}&bare=1&chrome=0&flowPreview=1` : undefined}
        onLoad={notifyVisibility}
      />
      <div className="flow-actions">
        <a href={selected.url} target="_blank" rel="noopener">
          เปิดต้นแบบ ↗
        </a>
      </div>
    </>
  );
}

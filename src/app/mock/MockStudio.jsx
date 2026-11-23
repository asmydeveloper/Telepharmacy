'use client';

import { useEffect, useState } from 'react';

const api = process.env.NEXT_PUBLIC_MOCK_API_URL || 'http://127.0.0.1:3101';

async function request(path, payload) {
  let response;
  try {
    response = await fetch(api + path, {
      ...(payload
        ? {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        : {}),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new Error('เชื่อมต่อ Mock API ไม่ได้ ตรวจว่าเซิร์ฟเวอร์จำลองเปิดอยู่แล้วลองอีกครั้ง');
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

export default function MockStudio() {
  const [catalog, setCatalog] = useState(null);
  const [run, setRun] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [catalogAttempt, setCatalogAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;
    request('/api/scenarios').then(
      ({ scenarios }) => {
        if (mounted) setCatalog(scenarios);
      },
      (failure) => {
        if (mounted) setError(failure.message);
      },
    );
    return () => {
      mounted = false;
    };
  }, [catalogAttempt]);

  async function update(path, payload) {
    setError('');
    setBusy(true);
    try {
      setRun(await request(path, payload));
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  function act(action, data) {
    return update(`/api/runs/${encodeURIComponent(run.runId)}/actions`, {
      revision: run.revision,
      action,
      ...data,
    });
  }

  const groups = Map.groupBy(catalog || [], (scenario) => scenario.group);

  return (
    <main className="mock-studio">
      <header>
        <nav aria-label="เครื่องมือทดสอบ">
          <a href="/screens">ผังทุกจอ</a>
          <a href="/?screen=history&state=tab-shipping&splash=0">ประวัติคำสั่งซื้อตัวอย่าง</a>
        </nav>
        <h1>Mock Studio</h1>
      </header>
      {error && <p role="alert">{error}</p>}
      {run ? (
        <section aria-busy={busy}>
          <button
            disabled={busy}
            onClick={() => {
              setRun(null);
              setError('');
            }}
          >
            เลือกโฟลว์ทดสอบ
          </button>
          <h2>{run.scenario.title}</h2>
          <label>
            ขั้นตอน
            <select
              disabled={busy}
              value={run.index}
              onChange={(event) => act('jump', { index: Number(event.target.value) })}
            >
              {run.steps.map((step, index) => (
                <option key={index} value={index}>
                  {step.screen} · {step.title}
                </option>
              ))}
            </select>
          </label>
          <h3>{run.step.title}</h3>
          <p>{run.step.detail}</p>
          {run.step.messages?.map((message, index) => (
            <p key={index}>
              <strong>{message.sender === 'patient' ? 'ผู้ทดสอบ' : 'เภสัชกร'} </strong>
              {message.text}
            </p>
          ))}
          <form
            key={run.revision}
            onSubmit={(event) => {
              event.preventDefault();
              act('next', { fields: Object.fromEntries(new FormData(event.currentTarget)) });
            }}
          >
            {run.step.fields.map((field) => (
              <label key={field.key}>
                {field.label}
                {field.options ? (
                  <select name={field.key} defaultValue={field.value} disabled={busy}>
                    {field.options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={field.key}
                    type={field.key === 'password' ? 'password' : 'text'}
                    defaultValue={field.value}
                    disabled={busy}
                  />
                )}
              </label>
            ))}
            <div className="mock-actions">
              <button
                type="button"
                disabled={busy || run.index === 0}
                onClick={() => act('previous')}
              >
                ย้อนกลับ
              </button>
              <button type="submit" disabled={busy || run.finished}>
                {run.step.button}
              </button>
              <button type="button" disabled={busy} onClick={() => act('restart')}>
                เริ่มโฟลว์ใหม่
              </button>
            </div>
          </form>
          <details>
            <summary>ข้อมูลจำลองจาก API</summary>
            <pre>
              {JSON.stringify(
                run,
                (key, value) =>
                  key === 'fields'
                    ? value.map((field) =>
                        ['password', 'otp'].includes(field.key)
                          ? { ...field, value: '••••' }
                          : field,
                      )
                    : value,
                2,
              )}
            </pre>
          </details>
          <button
            disabled={busy}
            onClick={() => update(`/api/runs/${encodeURIComponent(run.runId)}`)}
          >
            โหลดสถานะล่าสุด
          </button>
        </section>
      ) : catalog ? (
        [...groups].map(([group, scenarios]) => (
          <section key={group}>
            <h2>{group}</h2>
            <ul>
              {scenarios.map((scenario) => (
                <li key={scenario.id}>
                  <button
                    disabled={busy}
                    onClick={() => update('/api/runs', { scenario: scenario.id })}
                  >
                    {scenario.title} <small>{scenario.count} ขั้น</small>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      ) : error ? (
        <button
          onClick={() => {
            setError('');
            setCatalogAttempt((count) => count + 1);
          }}
        >
          เชื่อมต่อใหม่
        </button>
      ) : (
        <p role="status">กำลังโหลดชุดข้อมูลทดสอบ</p>
      )}
    </main>
  );
}

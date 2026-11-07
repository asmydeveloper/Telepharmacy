import entries from '@/data/change-log.json';
import './styles.css';

export const metadata = { title: 'บันทึกการแก้ไข · MITRAREE' };

const formatDate = (value) =>
  new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(`${value}T12:00:00+07:00`));

export default function ChangeLogPage() {
  return (
    <main className="change-log">
      <nav aria-label="ทางลัด">
        <a href="/">แอปลูกค้า</a>
        <a href="/console">คอนโซลร้าน</a>
        <a href="/screens">ดูรหัสหน้าจอ ↗</a>
      </nav>
      <header>
        <p className="log-brand">MITRAREE</p>
        <h1>บันทึกการแก้ไข</h1>
        <p>ดีไซน์และ UI · หน้าไหน · รหัสอะไร · ปรับอะไรไป</p>
      </header>
      <div className="log-entries">
        {entries.map((entry, index) => (
          <article key={`${entry.date}-${entry.path}-${index}`}>
            <div className="log-meta">
              <time dateTime={entry.date}>{formatDate(entry.date)}</time>
              {entry.codes.length ? (
                entry.codes.map((code) => (
                  <span className="log-code" key={code}>
                    {code}
                  </span>
                ))
              ) : (
                <span className="log-scope">UI ส่วนกลาง</span>
              )}
            </div>
            <h2>
              <a href={entry.path}>
                {entry.page} <span>{entry.path}</span>
              </a>
            </h2>
            <ul>
              {entry.changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </main>
  );
}

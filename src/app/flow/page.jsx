import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import Preview from './Preview';
import { journey, orderHistoryCases } from './journey.mjs';
import './styles.css';

export const metadata = { title: 'โฟลการทำงาน | MITRAREE' };

function readScreens() {
  const root = join(process.cwd(), 'design-system/screens');
  const manifests = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((group) =>
      readdirSync(join(root, group.name))
        .filter((file) => /^C\d+\.json$/.test(file))
        .map((file) => JSON.parse(readFileSync(join(root, group.name, file), 'utf8'))),
    );
  return new Map(manifests.map((screen) => [screen.code, screen]));
}

export default function Page() {
  const screens = readScreens();
  return (
    <main className="flow-page">
      <header className="flow-hero">
        <div className="flow-top">
          <strong>MITRAREE</strong>
          <a href="/screens">ผังทุกจอ ↗</a>
        </div>
        <h1>โฟลการทำงาน</h1>
        <p>ไล่ทีละขั้นจากการสมัครสมาชิกไปจนถึงรับยา ดูใบเสร็จ และติดตามการกินยา</p>
      </header>
      <nav className="flow-nav" aria-label="เลือกโฟลหลัก">
        {journey.map(([code, title]) => (
          <a key={code} href={'#' + code}>
            <b>{code}</b>
            {title}
          </a>
        ))}
      </nav>
      <p className="flow-legend">
        รหัส A คือลำดับในโฟล · รหัส C คือรหัสจอต้นแบบ · แต่ละตัวอย่างเปิดเป็นสถานะจำลองแยกกัน
      </p>
      {journey.map(([code, title, groups]) => (
        <section className="flow-section" key={code} id={code}>
          <h2>
            <span>{code}</span>
            {title}
          </h2>
          {groups.map(([group, steps, sequence]) => (
            <div className="flow-group" key={group}>
              <h3>{group}</h3>
              {sequence && <p className="flow-legend">{sequence}</p>}
              <ol className="flow-grid" tabIndex={0} aria-label={group}>
                {steps.map(([step, label, screen, initial, alternatives = []]) => {
                  const cases =
                    step === 'A302'
                      ? orderHistoryCases
                      : [initial, ...alternatives].map((state) => {
                          const example = screens
                            .get(screen)
                            ?.cases.find((item) => item.state === state);
                          if (!example)
                            throw new Error(
                              'Unknown journey state: ' + step + ' / ' + screen + ' / ' + state,
                            );
                          return example;
                        });
                  return (
                    <li
                      key={step}
                      id={step}
                      className={label.startsWith('การ์ดหน้าแรก') ? 'flow-home-card' : undefined}
                    >
                      <div className="flow-codes">
                        <b>{step}</b>
                        <span>{screen}</span>
                      </div>
                      <h4>{label}</h4>
                      <Preview
                        title={label}
                        cases={cases}
                        stateLabel={step === 'A302' ? 'สถานะประวัติ' : undefined}
                      />
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}


(() => {
'use strict';
const FILE = { cust: '/', con: '/console' };
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* the main path a new customer walks, from first open to the summary */
/* lean sign-up (owner 19/10/2026): no onboarding, consent sits on the profile screen, Face ID is offered on home after the first consult */
const MAIN = ['splash', 'login', 'loginphone', 'profile', 'registrationsuccess', 'intake', 'pushask', 'queue', 'room', 'pay', 'paid', 'summary'];
/* the store console's main path: sign in, start the shift, take the case, consult, medicine list, payment, close, packing */
const MAIN_CON = ['login', 'branch', 'queue', 'preview', 'room', 'order', 'pay', 'close', 'pack'];
const TXT = {
  cust: { h1: 'ผังทุกจอ แอปปรึกษาเภสัชกร (ฝั่งลูกค้า)', main: 'ลูกค้าใหม่ เปิดแอปครั้งแรก จนได้ใบสรุปหลังรับยา' },
  con: { h1: 'ผังทุกจอ คอนโซลร้าน (ฝั่งเภสัชกรและพนักงานร้าน)', main: 'เภสัชกรเข้ากะ รับเคส ปรึกษา ทำรายการยา รับชำระ ปิดเคส แล้วจัดยาและส่ง' }
};
const REGS = { cust: null, con: null };
let app = 'cust', REG = null, mode = 'one';
const url = (id, st, still) => app === 'con'
  ? FILE.con + '?bare=' + (still ? 1 : 0) + (id ? '&screen=' + encodeURIComponent(id) : '') + (st ? '&state=' + encodeURIComponent(st) : '')
  : FILE.cust + '?bare=' + (still ? 1 : 0) + '&chrome=1&splash=0' + (id ? '&screen=' + encodeURIComponent(id) : '') + (st ? '&state=' + encodeURIComponent(st) : '') + (still ? '&still=1' : '');
$('#openApp').href = FILE.cust;

/* lazy frames: load when near the viewport, at most 4 loading at once, unload when far away */
const queue = [], LIMIT = 4, loading = new Set();
function pump() {
  for (const f of loading) if (!f.isConnected) loading.delete(f);
  while (loading.size < LIMIT && queue.length) {
    const f = queue.shift(); if (!f.isConnected || f.dataset.want !== '1') continue;
    loading.add(f);
    const done = () => { loading.delete(f); f.removeEventListener('load', done); const ph = f.previousElementSibling; if (ph && ph.classList.contains('ph')) ph.remove(); pump(); };
    f.addEventListener('load', done);
    f.src = f.dataset.src;
  }
}
const near = new IntersectionObserver(es => es.forEach(e => {
  const f = $('iframe', e.target);
  if (e.isIntersecting) { if (!f.getAttribute('src') && f.dataset.want !== '1') { f.dataset.want = '1'; queue.push(f); pump(); } }
}), { rootMargin: '400px 600px' });
const far = new IntersectionObserver(es => es.forEach(e => {
  const f = $('iframe', e.target);
  if (!e.isIntersecting && f.getAttribute('src')) { f.removeAttribute('src'); f.dataset.want = ''; if (!f.previousElementSibling?.classList.contains('ph')) f.insertAdjacentHTML('beforebegin', '<div class="ph">กำลังโหลด</div>'); }
}), { rootMargin: '2400px 3000px' });

/* review codes (owner 19/10/2026): C303 per screen, C303.2 per state */
function codeFor(it, st) { const i = (it.states || []).length > 1 && st ? it.states.findIndex(x => x[0] === st) : -1; return it.code ? (i < 0 ? it.code : `${it.code}.${i + 1}`) : ''; }
function card(it, st, n) {
  const states = it.states || [], cur = st || (states[0] && states[0][0]) || '';
  const kind = it.kind === 'sheet' ? '<span class="tag">แผ่นเลื่อนขึ้น</span>' : '';
  const wait = it.wait ? `<span class="tag w">รอเคาะ ${it.wait}</span>` : '';
  const chips = mode === 'one' && states.length > 1 ? `<div class="chips" role="group" aria-label="สถานะของจอ ${esc(it.title)}">${states.filter(x=>x[2]!==false).map(([k, l]) => `<button type="button" data-st="${esc(k)}" aria-pressed="${k === cur}">${esc(l)}</button>`).join('')}</div>` : '';
  const label = mode === 'all' && st ? ' · ' + esc((states.find(s => s[0] === st) || [, st])[1]) : '';
  const code = codeFor(it, cur);
  return `<div class="card" data-id="${esc(it.id)}">
    <div class="shot">${n ? `<span class="num">${n}</span>` : ''}<div class="ph">กำลังโหลด</div><iframe tabindex="-1" aria-hidden="true" title="" data-src="${esc(url(it.id, cur, true))}"></iframe>
      <a href="${esc(url(it.id, cur, false))}" target="_blank" rel="noopener" aria-label="เปิดต้นแบบที่จอ ${esc(it.title)}"></a></div>
    <div class="meta"><b>${code ? `<span class="cd">${esc(code)}</span>` : ''}${esc(it.title)}${label}</b><small>${kind}${wait}</small></div>
    ${chips}
  </div>`;
}
const arrow = '<svg class="arrow" aria-hidden="true"><use href="#arr"/></svg>';
function render() {
  if (!REG) return;
  near.disconnect(); far.disconnect(); queue.length = 0; loading.clear();
  const by = id => REG.items.find(i => i.id === id);
  const main = (app === 'con' ? MAIN_CON : MAIN).map(by).filter(Boolean);
  let html = `<section class="lane"><div class="lh"><h2>เส้นทางหลัก</h2><small>${TXT[app].main} · ${main.length} จอ</small></div>
    <div class="row">${main.map((it, i) => (i ? arrow : '') + card(it, '', i + 1)).join('')}</div></section>`;
  for (const [g, gl] of REG.groups) {
    const items = REG.items.filter(i => i.group === g).sort((a, b) => a.code.localeCompare(b.code)); if (!items.length) continue;
    const cards = mode === 'all'
      ? items.flatMap(it => (it.states.length ? it.states.filter(s=>s[2]!==false).map(s => card(it, s[0])) : [card(it, '')])).join('')
      : items.map(it => card(it, '')).join('');
    const nState = items.reduce((a, i) => a + Math.max(1, i.states.filter(s=>s[2]!==false).length), 0);
    html += `<section class="lane"><div class="lh"><h2>${esc(gl)}</h2><small>${items.length} จอ · ${nState} สถานะ</small></div><div class="row">${cards}</div></section>`;
  }
  $('#lanes').innerHTML = html;
  document.querySelectorAll('.shot').forEach(s => { near.observe(s); far.observe(s); });
}
document.addEventListener('click', e => {
  const c = e.target.closest('.chips button');
  if (c) {
    const cardEl = c.closest('.card'), id = cardEl.dataset.id, st = c.dataset.st;
    cardEl.querySelectorAll('.chips button').forEach(b => b.setAttribute('aria-pressed', String(b === c)));
    const f = $('iframe', cardEl); f.dataset.src = url(id, st, true); $('a', cardEl).href = url(id, st, false);
    if (f.getAttribute('src')) f.src = f.dataset.src;
    const it = REG.items.find(i => i.id === id), cd = $('.cd', cardEl); if (it && cd) cd.textContent = codeFor(it, st);
    return;
  }
  const a = e.target.closest('[data-app]');
  if (a) { show(a.dataset.app); return; }
  const m = e.target.closest('[data-mode]');
  if (m) { mode = m.dataset.mode; document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b === m))); render(); return; }
  const k = e.target.closest('[data-k]');
  if (k) { document.documentElement.style.setProperty('--k', k.dataset.k); document.querySelectorAll('[data-k]').forEach(b => b.setAttribute('aria-pressed', String(b === k))); }
});

/* one board, two prototypes (owner 20/10/2026: "customer / staff / ผังรวมทุกจอ"). The switch at the top picks which */
function show(k) {
  app = k; REG = REGS[k];
  document.body.classList.toggle('con', k === 'con');
  document.querySelectorAll('[data-app]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.app === k)));
  $('#ttl').textContent = TXT[k].h1; document.title = k === 'con' ? 'ผังทุกจอ คอนโซลร้าน' : 'ผังทุกจอ ปรึกษาเภสัชกร';
  $('#openApp').href = FILE[k];
  try { history.replaceState(null, '', k === 'con' ? '#console' : location.pathname + location.search); } catch (e) { /* file:// may refuse */ }
  if (!REG) { $('#sub').textContent = 'กำลังโหลดรายการจอ'; $('#lanes').innerHTML = ''; return; }
  const nS = REG.items.filter(i => i.kind === 'screen').length, nSh = REG.items.length - nS;
  const nSt = REG.items.reduce((a, i) => a + Math.max(1, i.states.filter(s=>s[2]!==false).length), 0);
  $('#sub').textContent = `${nS} จอ${nSh ? ` + ${nSh} แผ่นเลื่อนขึ้น` : ''} · ${nSt} สถานะ${REG.version ? ' · ' + REG.version : ''}`;
  $('#foot').textContent = 'ผังนี้อ่านรายการจอจากไฟล์ต้นแบบ ' + FILE[k] + ' · หน้ากากอย่างเดียว ยังไม่ต่อระบบจริง · ข้อมูลในจอเป็นข้อมูลสมมติ';
  render();
}
/* the screen list comes from each prototype itself, so the board never goes stale */
addEventListener('message', e => {
  const d = e.data || {}, k = d.tpRegistry ? 'cust' : d.scRegistry ? 'con' : ''; if (!k || REGS[k]) return;
  REGS[k] = d.tpRegistry || d.scRegistry;
  $('#reg-' + k)?.remove();
  if (k === app) show(k);
});
for (const k of ['cust', 'con']) document.body.insertAdjacentHTML('beforeend', `<iframe id="reg-${k}" src="${esc(FILE[k] + '?registry=1&bare=1&still=1&splash=0')}" style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;border:0" tabindex="-1" aria-hidden="true" title=""></iframe>`);
if (location.hash === '#console') show('con');
setTimeout(() => { if (!REG) $('#lanes').innerHTML = `<div class="err">เปิดรายการจอไม่ได้ ให้วางไฟล์นี้ไว้โฟลเดอร์เดียวกับ ${esc(FILE[app])} แล้วเปิดใหม่</div>`; }, 8000);
})();

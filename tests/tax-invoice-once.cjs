// One tax-invoice request per order: checkout or receipt, never a second request.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('public/runtime/customer.js', 'utf8');
const slice = (from, to) => source.slice(source.indexOf(from), source.indexOf(to, source.indexOf(from)));

const acts = {};
const person = { name: 'สมใจ ใจดี', id: '1101700203450', phone: '0812345678', addr: 'กรุงเทพมหานคร' };
const TP = {
  S: { user: { full: 'สมใจ ใจดี', phone: '0812345678', email: 'somjai@example.com' } },
  support: ['https://line.me/ti/p/~@mitraree', 'LINE @mitraree'],
  NOW: { date: '08/11/2026', time: '14:30' },
  act: (id, fn) => { acts[id] = fn; },
  taxSelected: () => person,
  taxRecords: kind => kind==='me'?[person]:[],
  taxAddress: w => w.addr,
  wait: () => Promise.resolve(),
  notify: () => {},
  icons: () => {},
};
let order;
const ctx = vm.createContext({
  TP, FX: {demoInvoiceEmail:'somjai@example.com'}, ui: { btn: (label, o) => `<button data-a="${o.a || ''}">${label}</button>`, note: html => html, tag: (label) => `<span class="tag">${label}</span>` }, esc: String, ic: name => `<i data-icon="${name}"></i>`,
  A: () => {}, E: {}, $: () => null, rcCur: () => order,
});
vm.runInContext(slice('const taxWho = () =>', 'const T = o =>'), ctx);
vm.runInContext(slice('const T = o =>', '\n', ) + ';', ctx);
vm.runInContext(slice('const ymd = d =>', 'const rcCur ='), ctx);
vm.runInContext(slice('const invoiceKinds =', 'function payTaxHtml'), ctx);
vm.runInContext(slice('const whoOf = t =>', "TP.act('rcTaxPdf'"), ctx);

const button = () => ({ disabled: false, classList: { add() {} } });

// Receipt request: the form is offered, then sending twice records one request only.
order = { paid: { date: '08/11/2026' } };
order.tax = { want: true, who: 'me' };
assert.match(ctx.taxBox(order, false), /data-a="rcTaxWant"[\s\S]*ขอได้หนึ่งครั้งภายในเดือนที่ชำระเงิน[\s\S]*data-a="rcTaxSend"/);
assert.equal(vm.runInContext("isLate('01/11/2026')",ctx),false);
assert.equal(vm.runInContext("isLate('31/10/2026')",ctx),true);
assert.equal(vm.runInContext("isLate('09/11/2026')",ctx),true);
(async () => {
  await Promise.all([acts.rcTaxSend(button()), acts.rcTaxSend(button())]);
  assert.equal(JSON.stringify(order.tax.pending), JSON.stringify(person));
  const status = ctx.taxBox(order, false);
  assert.match(status, /ขอใบกำกับภาษีแล้ว/);assert.doesNotMatch(status, /โหมดทดสอบไม่มีการส่งอีเมล/);
  assert.match(status, /data-icon="mail"[\s\S]*so\*\*\*@example\.com/);
  assert.doesNotMatch(status, /somjai@example\.com|สมใจ ใจดี|กรุงเทพมหานคร|0812345678|3450/);
  assert.doesNotMatch(status, /rcTaxSend|rcTaxWant/, 'a requested order cannot be requested again');

  // Requested at checkout: the receipt opens in status-only mode.
  order = { paid: { date: '08/11/2026' }, tax: { who: 'me', pending: { ...person } } };
  assert.doesNotMatch(ctx.taxBox(order, false), /rcTaxSend|rcTaxWant/);
  const before = JSON.stringify(order.tax);
  await acts.rcTaxSend(button());
  assert.equal(JSON.stringify(order.tax), before, 'send is ignored once a request exists');

  // Issued invoice: download only, no re-issue path.
  order = { paid: { date: '08/11/2026' }, tax: { who: 'me', done: { ...person } } };
  const issued = ctx.taxBox(order, false);
  assert.match(issued, /ส่งใบกำกับภาษีทางอีเมลแล้ว/);
  TP.S.user.email = '';
  assert.match(ctx.taxBox(order, false), /อีเมลปลายทางตัวอย่าง so\*\*\*@example\.com/);
  assert.doesNotMatch(issued, /rcTaxPdf|rcTaxSend|rcTaxWant|rcTaxRe/, 'no in-app download; the invoice is e-mailed');
  assert.match(ctx.taxBox({ paid: { date: '01/10/2026' } }, true), /เลยรอบขอใบกำกับภาษีในแอป/);
  order = { paid: { date: '31/10/2026' }, tax: { want: true, who: 'me' } };
  await acts.rcTaxSend(button());
  assert.equal(order.tax.pending,undefined);
  assert(!source.includes("TP.act('rcTaxRe'"), 're-issue handler is removed');
  console.log('PASS: one tax-invoice request per order from checkout or receipt, duplicate sends ignored, e-mailed invoice status only, late orders cannot request');
})().catch(e => { console.error(e); process.exitCode = 1; });

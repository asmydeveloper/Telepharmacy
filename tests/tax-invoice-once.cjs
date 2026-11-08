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
  STORE: { cs: '098-035-8000', csHours: '10:00-18:00' },
  act: (id, fn) => { acts[id] = fn; },
  taxSelected: () => person,
  taxAddress: w => w.addr,
  wait: () => Promise.resolve(),
  notify: () => {},
  icons: () => {},
};
let order;
const ctx = vm.createContext({
  TP, ui: { btn: (label, o) => `<button data-a="${o.a || ''}">${label}</button>`, note: html => html }, esc: String, ic: () => '',
  A: () => {}, E: {}, $: () => null, rcCur: () => order, isLate: () => false,
});
vm.runInContext(slice('const taxWho = () =>', 'const T = o =>'), ctx);
vm.runInContext(slice('const T = o =>', '\n', ) + ';', ctx);
vm.runInContext(slice('const maskTax = v =>', '\n') + ';', ctx);
vm.runInContext(slice('const coTax = () =>', "TP.act('rcTaxPdf'"), ctx);

const button = () => ({ disabled: false, classList: { add() {} } });

// Receipt request: the form is offered, then sending twice records one request only.
order = { paid: { date: '08/11/2026' } };
order.tax = { want: true, who: 'me' };
assert.match(ctx.taxBox(order, false), /data-a="rcTaxSend"/);
(async () => {
  await Promise.all([acts.rcTaxSend(button()), acts.rcTaxSend(button())]);
  assert.equal(JSON.stringify(order.tax.pending), JSON.stringify(person));
  const status = ctx.taxBox(order, false);
  assert.match(status, /ส่งใบกำกับภาษีทางอีเมลแล้ว/);
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
  assert.doesNotMatch(issued, /rcTaxPdf|rcTaxSend|rcTaxWant|rcTaxRe/, 'no in-app download; the invoice is e-mailed');
  assert.match(ctx.taxBox({ paid: { date: '01/10/2026' } }, true), /ขอใบกำกับภาษีไม่ได้แล้ว/);
  assert(!source.includes("TP.act('rcTaxRe'"), 're-issue handler is removed');
  console.log('PASS: one tax-invoice request per order from checkout or receipt, duplicate sends ignored, e-mailed invoice status only, late orders cannot request');
})().catch(e => { console.error(e); process.exitCode = 1; });

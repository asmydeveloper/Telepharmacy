// C308 is a UI mockup: it always shows a payable sample order and never rewrites the real case.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('public/runtime/customer.js', 'utf8');
const real = { id: 'real-case', status: 'closed', branch: 'tw', pharm: 'kj', order: { status: 'expired', items: [{ name: 'A', price: 10 }], total: 10 } };
const TP = {
  S: { case: real, branch: 'tw' }, NOW: { date: '08/11/2026', time: '14:12' },
  ORDER_ITEMS: [{ name: 'A', price: 120 }, { name: 'B', price: 40 }],
  ensureCase() {}, makeOrder() {}, expireOrder() {}, homeAddress: () => null,
  orderNumber: c => 'MT-' + c.id,
  orderPayable: o => !!o && o.status === 'pending' && (o.awaitingCheckout || o.expiresAt > Date.now()),
};
const ctx = vm.createContext({ TP, structuredClone, C: () => TP.S._paymentCase || TP.S.case });
const start = source.indexOf('function mockCheckoutCase()');
vm.runInContext(source.slice(start, source.indexOf('\n};', source.indexOf('const ensureOrder =', start)) + 3) + ';this.ensureOrder=ensureOrder;', ctx);
const before = JSON.stringify(real);
for (const status of ['expired', 'paid', 'cancelled']) {
  real.order.status = status; TP.S._paymentCase = null;
  assert.equal(ctx.ensureOrder(), true);
  const shown = ctx.C();
  assert.notEqual(shown, real, status + ' order opens a separate mock checkout');
  assert(TP.orderPayable(shown.order), status + ' mock is payable');
  assert.equal(shown.order.total, 160);
}
real.order.status = 'expired';
assert.equal(JSON.stringify(real), before, 'the real case and its order stay unchanged');
real.order = { status: 'pending', awaitingCheckout: true, items: [], total: 0 }; TP.S._paymentCase = real;
ctx.ensureOrder();
assert.equal(ctx.C(), real, 'a payable real order is used as-is');
assert(!source.includes('รายการนี้ชำระไม่ได้แล้ว'), 'C308 no longer renders the blocked note');
console.log('PASS: C308 mock checkout always payable, real case untouched, real payable order kept');

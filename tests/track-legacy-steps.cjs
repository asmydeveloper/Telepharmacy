// C414 uses the legacy web 4 steps (mitraree order_progress_html) for every way of receiving medicine.
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const source = fs.readFileSync('public/runtime/customer.js', 'utf8');
const a = source.indexOf('TP.trackStepLabels ='), b = source.indexOf('\n};', source.indexOf('TP.trackSteps =')) + 3;
let info = null;
const TP = { fulfillmentInfo: () => info };
vm.runInNewContext(source.slice(a, b), { TP });
const order = (recv, extra = {}) => ({ order: { paid: { recv, ...extra } } });
const step = c => TP.trackStepLabels(c.order.paid.recv === 'pickup')[TP.trackStepIndex(c)];

assert.equal(JSON.stringify(TP.trackStepLabels(false)), JSON.stringify(['ยืนยันการสั่งซื้อสินค้า', 'เตรียมการจัดส่ง', 'อยู่ระหว่างการจัดส่ง', 'ลูกค้ารับสินค้าแล้ว']));
assert.equal(TP.trackStepLabels(true)[2], 'เตรียมสินค้าเรียบร้อยแล้ว');

info = { key: 'preparing' }; assert.equal(step(order('express')), 'เตรียมการจัดส่ง');
info = { key: 'calling' }; assert.equal(step(order('express')), 'เตรียมการจัดส่ง', 'finding a rider is not shipping yet');
info = { key: 'delivering' }; assert.equal(step(order('express')), 'อยู่ระหว่างการจัดส่ง');
info = { key: 'packed' }; assert.equal(step(order('parcel')), 'เตรียมการจัดส่ง', 'packing_complete is not shipping for delivery');
info = { key: 'transit' }; assert.equal(step(order('parcel')), 'อยู่ระหว่างการจัดส่ง');
info = { key: 'out' }; assert.equal(step(order('parcel')), 'อยู่ระหว่างการจัดส่ง');
info = { key: 'preparing', pickup: true }; assert.equal(step(order('pickup', { stage: 'preparing' })), 'เตรียมการจัดส่ง');
assert.equal(step(order('pickup', { stage: 'ready' })), 'เตรียมสินค้าเรียบร้อยแล้ว');
info = { key: 'delivered', done: true }; assert.equal(step(order('express')), 'ลูกค้ารับสินค้าแล้ว');

info = { key: 'transit' };
const steps = TP.trackSteps(order('parcel'));
assert.equal(JSON.stringify(steps.map(s => s[0])), JSON.stringify(['done', 'done', 'cur', '']));
assert(!/C414.*pickup-overdue|'parcel-packed'|'parcel-out'|'chat-calling'/.test(source.slice(source.indexOf("TP.screen('track'"), source.indexOf("TP.screen('track'") + 3000)), 'retired C414 cases removed');
console.log('PASS: C414 legacy 4 steps for pickup, express and parcel');

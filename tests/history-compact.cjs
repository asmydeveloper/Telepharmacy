const assert = require('node:assert/strict');
const {harness} = require('./health-harness.cjs');
const h = harness();
h.context.record = {id:'compact-order',who:'me',date:'18/10/2026',time:'13:10',branch:'tw',pharm:'kj',orderNo:'MT2026101801',topic:'ไอ',outcome:'customer-ended'};
const html = h.run('histItem(record)');
for (const text of ['MT2026101801','18/10/2026','13:10','ยกเลิก','ดูข้อมูลคำสั่งซื้อ']) assert(html.includes(text));
for (const text of ['history-detail-row','history-outcome-reason','ร้านยาที่ให้คำปรึกษา','history-card-extra','history-concern','history-card-store']) assert(!html.includes(text));
assert(html.includes('data-go="summary"'));assert(html.includes('compact-order'));
h.TP.money=n=>'฿'+n;
h.context.record.order={status:'paid',total:385,paid:{total:410}};assert(h.run('histItem(record)').includes('฿410'));assert(!h.run('histItem(record)').includes('฿385'));
h.context.record.order={status:'expired',total:385};assert(!h.run('histItem(record)').includes('history-order-price'));
h.TP.orderPayable=()=>true;h.TP.orderRemaining=()=> '14:59';h.context.record.order={status:'pending'};
const pending=h.run('histItem(record)');assert(pending.includes('data-a="openOrderPayment"'));assert(pending.includes('data-order-countdown'));assert(pending.includes('compact-order'));
console.log('PASS: compact order identity/date/status/detail route and retained pending-payment action');

// Reference layout retains real item counts and an independent copy control.
h.context.record.order={no:'MT2026101801',status:'paid',total:385,paid:{total:410},items:[{name:'ยา A'},{name:'ยา B'}]};
const reference=h.run('histItem(record)');
assert(reference.includes('2 รายการ'));assert(reference.includes('history-order-icon'));assert(reference.includes('data-a="historyCopyOrder"'));assert(reference.includes('data-order-no="MT2026101801"'));
assert(!reference.includes('history-open-hint'));assert(!reference.includes('topic'));
(async()=>{let copied='',notice='';h.context.navigator={clipboard:{writeText:async value=>{copied=value}}};h.TP.notify=text=>notice=text;await h.actions.historyCopyOrder({dataset:{orderNo:'MT2026101801'}});assert.equal(copied,'MT2026101801');assert.equal(notice,'คัดลอกเลขคำสั่งซื้อแล้ว');h.context.navigator={};await h.actions.historyCopyOrder({dataset:{orderNo:'MT2026101801'}});assert.equal(notice,'คัดลอกไม่ได้ กรุณาลองอีกครั้ง');console.log('PASS: real item count, independent order copy and clipboard failure feedback');})().catch(error=>{console.error(error);process.exitCode=1});

// The card reflects fulfillment independently from consultation outcomes.
h.TP.orderPayable=()=>false;
h.context.record={id:'status-order',who:'me',outcome:'completed',date:'18/10/2026',time:'13:10',order:{status:'paid',paid:{total:385},items:[]}};
assert(h.run('histItem(record)').includes('กำลังจัดส่ง'));
h.context.record.order.paid.got=true;
assert(h.run('histItem(record)').includes('คำสั่งซื้อสำเร็จ'));
for(const status of ['expired','cancelled']){h.context.record.order.status=status;assert(h.run('histItem(record)').includes('ยกเลิกคำสั่งซื้อ'));}
h.context.record.order.status='pending';h.context.record.outcome='customer-ended';assert(h.run('histItem(record)').includes('ยกเลิกคำสั่งซื้อ'));
console.log('PASS: paid awaiting receipt, fulfilled, expired and customer-cancelled order statuses');

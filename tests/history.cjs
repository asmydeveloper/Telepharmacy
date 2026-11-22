const assert=require('node:assert/strict'),{harness,source}=require('./health-harness.cjs');
const h=harness(),{S,run,screens,actions}=h;
S.history.find(h=>h.id==='self-old').outcome='completed';S.history.find(h=>h.id==='self-new').outcome='customer-ended';
const ids=()=>Array.from(run('historyItems(TP.S)').map(h=>h.id));
S.st.history='normal';S.case=null;const screen=screens.history.render({S,state:'normal',params:{}});assert(screen.includes('data-segname="histStatus"'));assert(!screen.includes('<legend>ประเภทการปรึกษา'));assert(!screen.includes('เก็บแชท'));assert(!screen.includes('id="histCount"'));assert(!screen.includes('รายการ · ล่าสุดก่อน'));assert(!screen.includes('history-card-link'));assert(screen.includes('history-order-head'));assert(!screen.includes('การซื้อยา'));assert(!screen.includes('ปรึกษาอย่างเดียว'));
const outcomeCases={completed:'สำเร็จ','customer-ended':'ยกเลิก','no-response':'สิ้นสุด'};
for(const [outcome,label] of Object.entries(outcomeCases))for(const orderStatus of ['paid','pending','expired','none']){h.context.record={id:'status',who:'me',outcome,orderStatus,bought:180};assert.equal(run('historyOutcome(TP.S,record).label'),label);S._histStatus='completed';assert.equal(run("historyItems(TP.S,'all',[record]).length"),run("(historyOrderStatus(TP.S,record)?.key||'completed')")==='completed'?1:0);const html=run('histItem(record)');const cardLabel=outcome==='customer-ended'||outcome==='no-response'||orderStatus==='expired'?'คำสั่งซื้อถูกยกเลิก':orderStatus==='paid'?'คำสั่งซื้อสำเร็จ':null;if(cardLabel)assert(html.includes(cardLabel));else assert(!html.includes('class="tag'));assert(!html.includes('การซื้อยา'));assert(!html.includes('ยอดเงินทั้งหมด'));if(outcome==='no-response')assert(run('historyOutcome(TP.S,record).reason').includes('5 นาที'));}

S.case=null;S._histWho='all';S._histStatus='all';S._histQuery='';
assert.deepEqual(ids(),['self-new','self-old']);
for(const legacyWho of ['all','mom','kid']){S._histWho=legacyWho;assert.deepEqual(ids(),['self-new','self-old']);assert.equal(run('historySelector(TP.S)'), '');}
S._histStatus='completed';assert.deepEqual(ids(),['self-old']);S._histStatus='cancelled';assert.deepEqual(ids(),['self-new']);S._histStatus='all';
S._histQuery='บุญเรือน';assert.equal(ids().length,0);S._histQuery='สาขาตลาด';assert.equal(ids().length,2);S._histQuery='';
assert.deepEqual(Array.from(run('historyFilterOptions(TP.S)'),p=>Array.from(p)),[['all','ทั้งหมด'],['shipping','ดำเนินการ'],['completed','สำเร็จ'],['cancelled','ยกเลิก']]);
const before=JSON.stringify([S.family,S.history]);actions.afHistWho({dataset:{v:'mom'}});assert.equal(S._histWho,'me');assert.equal(JSON.stringify([S.family,S.history]),before);
S.case={id:'foreign',who:'mom',status:'waiting',symptoms:['secret-family-case']};assert(!screens.history.render({S,state:'normal',params:{}}).includes('secret-family-case'));S.case=null;
for(const row of S.history.filter(r=>r.who==='me')){h.context.row=row;const html=run('histItem(row)');assert(html.includes(S.user.full));assert(!html.includes('history-card-store'));assert(html.includes('history-order-row'));assert(!html.includes('history-card-recipient'));assert(!html.includes('ผู้รับการปรึกษา'));assert(!html.includes('ใบเสร็จ'));}
assert(screens.history.states.every(([state])=>!state.includes('family')&&!state.includes('profile')&&!['mother','child'].includes(state)));
const fixture = JSON.stringify(S);
for (const [state] of screens.history.states) {
  Object.assign(S, JSON.parse(fixture));
  S.st.history = state;
  screens.history.prep(S);
  const html = screens.history.render({S, state, params: {}});
  assert.match(html, /class="history-status-tabs"[\s\S]*?<\/div><\/div><[^>]+class="scroll app-page history-list-scroll"/, state);
  assert(!html.includes('history-profile-list'));
}
Object.assign(S, JSON.parse(fixture));
const historyList = h.elements['.history-list-scroll'] = {scrollTop: 220};
const historyResults = h.elements['#afHL'] = {innerHTML: ''};
actions.afHistStatus({dataset: {v: 'cancelled'}});
assert.match(historyResults.innerHTML, /self-new/);
assert.doesNotMatch(historyResults.innerHTML, /self-old/);
assert.equal(historyList.scrollTop, 0);
const seed = run('FX.account()');
assert.equal(seed.family.length, 0);
assert.equal(new Set(seed.history.map(record => record.id)).size, seed.history.length);
const orders = seed.history.filter(record => record.id.startsWith('mock-history-flutter-'));
assert.equal(orders.length, 20);
const legacy = seed.history.filter(record => !record.id.startsWith('mock-history-flutter-'));
assert.equal(legacy.length, 8);
assert.equal(legacy.find(record => record.id === 'mock-history-paid').orderNo, 'MT2026101701');
assert.equal(legacy.find(record => record.id === 'mock-history-shipping').order.paid.total, 120);
assert.equal(legacy.find(record => record.id === 'mock-history-cancelled').orderNo, 'MT2026101301');
const preserved = { ...legacy[0], rated: 5 };
S.history = [preserved];
S.st.history = 'normal';
h.TP.fresh = () => seed;
screens.history.prep(S);
screens.history.prep(S);
assert.equal(S.history.length, seed.history.length);
assert.equal(S.history[0], preserved);
assert.equal(S.history[0].rated, 5);
const standardHistory = screens.history.render({S,state:'normal',params:{}});
assert.equal((standardHistory.match(/data-history-id=/g) || []).length, 20);
assert(!standardHistory.includes('MT2026101901'));
S.st.history = 'legacy';
screens.history.prep(S);
const legacyHistory = screens.history.render({S,state:'legacy',params:{}});
assert.equal((legacyHistory.match(/data-history-id=/g) || []).length, 8);
assert(legacyHistory.includes('MT2026101901'));
assert(!legacyHistory.includes('mock-history-flutter-'));
const fixtureBranches = {pickup: 'tw', dhl: 'on', flash: 'tw', express: 'on'};
const completeTotals = {pickup: 120, dhl: 80, flash: 250, express: 180};
for (const [method, branch] of Object.entries(fixtureBranches)) {
  const methodRows = orders.filter(record => record.id.startsWith(`mock-history-flutter-${method}-`));
  assert.deepEqual(Array.from(methodRows, record => record.order.items.length), [2, 1, 2, 1, 0]);
  assert(methodRows.every(record => record.branch === branch && record.note));
  assert.equal(methodRows[3].order.paid.total, completeTotals[method]);
  assert.equal(methodRows[3].time, `13:${String(5 + Object.keys(fixtureBranches).indexOf(method) * 8).padStart(2, '0')}`);
}
const orderById = id => orders.find(record => record.id === 'mock-history-flutter-' + id);
const dhl = orderById('dhl-3');
assert.equal(dhl.order.paid.methodLabel, 'Mobile Banking');
assert.equal(dhl.order.paid.at, '13:17');
assert.equal(dhl.order.deliveryLabel, 'DHL');
assert.equal(orderById('flash-3').order.deliveryLabel, 'FLASH');
assert.equal(orderById('pickup-0').order.statusLabel, 'ชำระแล้ว');
assert.equal(orderById('express-3').order.statusLabel, 'ส่งถึงแล้ว');
const recentPickup = orderById('pickup-0');
assert.equal(h.TP.fresh().history.find(record => record.id === recentPickup.id).orderNo, recentPickup.orderNo);
for (const [recv, courier] of [['pickup',null], ['parcel','dhl'], ['parcel','flash'], ['express',null]]) {
  const matching = orders.filter(record => record.recv === recv && record.courier === courier);
  assert.equal(matching.length, 5);
  for (const outcome of ['order-complete', 'order-cancelled', 'completed'])
    assert(matching.some(record => record.outcome === outcome), recv + ' ' + (courier || '') + ' ' + outcome);
}
assert(seed.history.some(record => record.outcome === 'customer-ended'));

console.log('PASS: account-only history, legacy family isolation, counts, search, cards and all active history states');

// Retained household implementation is inaccessible from preview/deep links.
for(const id of ['family','familyedit','memberdel'])assert(!source.includes("TP.screen('"+id+"'")&&!source.includes("TP.sheetDef('"+id+"'"),'household screens are removed');
const manifests=require('node:fs').readdirSync('design-system/screens/account');for(const code of ['C502','C503','C504'])assert(!manifests.includes(code+'.json'));
assert(source.includes("if(TP.def(id)?.disabled)return TP.go('account',{root:true})"));

// C403 tabs: each tab case renders its own selected tab; no search UI.
for(const [state,key] of [['normal','all'],['tab-shipping','shipping'],['tab-completed','completed'],['tab-cancelled','cancelled']]){const t=harness();t.S.st.history=state;t.screens.history.prep(t.S);const html=t.screens.history.render({S:t.S,state,params:{}});assert(new RegExp('data-v="'+key+'"[^>]*aria-pressed="true"|aria-pressed="true"[^>]*data-v="'+key+'"').test(html),state+' selects '+key);assert(!html.includes('histSearch'),'no search');}
{const t=harness();t.S.st.history='error';t.screens.history.prep(t.S);const html=t.screens.history.render({S:t.S,state:'error',params:{}});assert(html.includes('history-status-tabs'));assert(html.includes('/assets/empty/'));assert(html.includes('afHistRetry'));}
console.log('PASS: four status tabs select per case, error keeps tabs with empty-state art, no search');

const totals=harness();totals.context.paidRecord={id:'total-paid',who:'me',date:'01/10/2026',time:'12:00',topic:'ตัวอย่าง',pharm:'kj',branch:'tw',bought:265,order:{status:'paid',total:310.5}};
let totalHtml=totals.run('histItem(paidRecord)');assert(!totalHtml.includes('ยอดเงินทั้งหมด'));assert(totalHtml.includes('฿310.5'));assert(!totalHtml.includes('฿265'));assert(totalHtml.includes('history-order-price'));
for(const status of ['none','pending','cancelled','expired']){totals.context.paidRecord.order.status=status;totals.context.paidRecord.bought=0;assert(!totals.run('histItem(paidRecord)').includes('history-card-total'));}
console.log('PASS: twenty delivery fixtures, unique consultation IDs, mixed dates/times and consultation outcomes independent of purchases and compact paid totals');

// Pending payment uses the regular history card with the exact order id, not a duplicate reminder.
const pay=harness();pay.TP.orderPayable=o=>o.status==='pending'&&o.expiresAt>Date.now();pay.TP.orderRemaining=()=> '14:59';pay.TP.orderTime=()=> '18:00';
pay.context.record={id:'pay-history',who:'me',topic:'cough',date:'01/11/2026',time:'17:45',pharm:'kj',branch:'tw',outcome:'completed',_case:{id:'pay-history',order:{status:'pending',expiresAt:Date.now()+900000}}};
let pending=pay.run('histItem(record)');assert(pending.includes('history-card-payable'));assert(!pending.includes('รอชำระค่ายา'));assert(pending.includes('data-a="openOrderPayment"'));assert(pending.includes('pay-history'));assert(pending.includes('data-order-countdown'));assert(!pending.includes('ยอดเงินทั้งหมด'));
pay.context.record._case.order.expiresAt=Date.now()-1;pending=pay.run('histItem(record)');assert(!pending.includes('data-a="openOrderPayment"'));assert(!pending.includes('data-order-countdown'));assert(pending.includes('data-go="summary"'));
assert(!source.slice(source.indexOf("TP.screen('history',"),source.indexOf("TP.act('afHistStatus'")).includes('paymentReminderCard'));
// Load the real sample factory alongside the real history renderer.
pay.context.structuredClone = structuredClone;
pay.TP.ORDER_ITEMS = pay.run('FX.ORDER_ITEMS');
pay.TP.orderNumber = c => c.id;
pay.TP.orderPayable = o => o?.status === 'pending' && (o.awaitingCheckout || o.expiresAt > Date.now());
const factoryStart = source.indexOf('function mockCheckoutCase()');
pay.run(source.slice(factoryStart, source.indexOf('const ensureOrder =', factoryStart)));
const sampleStart = source.indexOf('function pendingSample()');
pay.run(source.slice(sampleStart, source.indexOf('const pendingContextCase', sampleStart)));
pay.S.history = pay.run('FX.account().history');
pay.S.st.history = 'tab-shipping';
pay.S._histStatus = 'shipping';
const sampleHistory = () => pay.screens.history.render({S:pay.S,state:'tab-shipping',params:{}});
const sampleHtml = sampleHistory();
assert.match(sampleHtml, /history-card[^>]*data-history-id="mock-pending-payment"[\s\S]*MT-DEMO-PENDING[\s\S]*รอชำระเงิน/);
assert.equal(/data-history-id="([^"]+)"/.exec(sampleHtml)?.[1], 'mock-pending-payment');
pay.S.history.unshift({id:'mock-pending-preview',who:'me',order:{status:'expired'}});
assert.match(sampleHistory(), /MT-DEMO-PENDING/);
let opened;
pay.TP.startOrderPayment = order => {
  order.awaitingCheckout = false;
  order.expiresAt = Date.now() + 900000;
};
pay.TP.go = (screen, options) => { opened = [screen, options.params.caseId]; };
pay.TP.openPendingSample();
assert.deepEqual(opened, ['pendingpayment', 'mock-pending-payment']);
assert.equal(pay.S.history[0]._case.order.no, 'MT-DEMO-PENDING');
console.log('PASS: pending history card countdown, case-bound checkout link, expiry route and no duplicate reminder');

// All four tabs use the same order status classification as the card badge.
h.context.tabRecords=[
{id:'awaiting',who:'me',date:'19/10/2026',order:{status:'paid',paid:{total:120}}},
{id:'received',who:'me',date:'18/10/2026',order:{status:'paid',paid:{got:true,total:120}}},
{id:'expired',who:'me',date:'17/10/2026',order:{status:'expired'}},
{id:'cancelled',who:'me',date:'16/10/2026',outcome:'customer-ended'},
{id:'advice',who:'me',date:'15/10/2026',outcome:'no-medicine'}
];
S._histQuery='';
for(const [tab,expected] of [['all',5],['shipping',1],['completed',2],['cancelled',2]]){
 S._histStatus=tab;
 assert.equal(run('historyItems(TP.S,"me",tabRecords).length'),expected,tab);
}
S._histStatus='shipping';S._histQuery='19/10/2026';assert.equal(run('historyItems(TP.S,"me",tabRecords).length'),1);
S._histQuery='18/10/2026';assert.equal(run('historyItems(TP.S,"me",tabRecords).length'),0);
console.log('PASS: four order status tabs and combined search filtering');

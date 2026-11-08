const assert=require('node:assert/strict'),{harness,source}=require('./health-harness.cjs');
const h=harness(),{S,run,screens,actions}=h;
S.history.find(h=>h.id==='self-old').outcome='completed';S.history.find(h=>h.id==='self-new').outcome='customer-ended';
const ids=()=>Array.from(run('historyItems(TP.S)').map(h=>h.id));
S.st.history='normal';S.case=null;const screen=screens.history.render({S,state:'normal',params:{}});assert(screen.includes('data-segname="histStatus"'));assert(!screen.includes('<legend>ประเภทการปรึกษา'));assert(!screen.includes('เก็บแชท'));assert(!screen.includes('id="histCount"'));assert(!screen.includes('รายการ · ล่าสุดก่อน'));assert(!screen.includes('history-card-link'));assert(screen.includes('history-order-head'));assert(!screen.includes('การซื้อยา'));assert(!screen.includes('ปรึกษาอย่างเดียว'));
const outcomeCases={completed:'สำเร็จ','customer-ended':'ยกเลิก','no-response':'สิ้นสุด'};
for(const [outcome,label] of Object.entries(outcomeCases))for(const orderStatus of ['paid','pending','expired','none']){h.context.record={id:'status',who:'me',outcome,orderStatus,bought:180};assert.equal(run('historyOutcome(TP.S,record).label'),label);S._histStatus='completed';assert.equal(run("historyItems(TP.S,'all',[record]).length"),run("(historyOrderStatus(TP.S,record)?.key||'completed')")==='completed'?1:0);const html=run('histItem(record)');const cardLabel=outcome==='customer-ended'||outcome==='no-response'||orderStatus==='expired'?'ยกเลิกคำสั่งซื้อ':orderStatus==='paid'?'คำสั่งซื้อสำเร็จ':null;if(cardLabel)assert(html.includes(cardLabel));else assert(!html.includes('class="tag'));assert(!html.includes('การซื้อยา'));assert(!html.includes('ยอดเงินทั้งหมด'));if(outcome==='no-response')assert(run('historyOutcome(TP.S,record).reason').includes('5 นาที'));}

S.case=null;S._histWho='all';S._histStatus='all';S._histQuery='';
assert.deepEqual(ids(),['self-new','self-old']);
for(const legacyWho of ['all','mom','kid']){S._histWho=legacyWho;assert.deepEqual(ids(),['self-new','self-old']);assert.equal(run('historySelector(TP.S)'), '');}
S._histStatus='completed';assert.deepEqual(ids(),['self-old']);S._histStatus='cancelled';assert.deepEqual(ids(),['self-new']);S._histStatus='all';
S._histQuery='บุญเรือน';assert.equal(ids().length,0);S._histQuery='สาขาตลาด';assert.equal(ids().length,2);S._histQuery='';
assert.deepEqual(Array.from(run('historyFilterOptions(TP.S)'),p=>Array.from(p)),[['all','ทั้งหมด'],['shipping','รอจัดส่ง'],['completed','สำเร็จ'],['cancelled','ยกเลิก']]);
const before=JSON.stringify([S.family,S.history]);actions.afHistWho({dataset:{v:'mom'}});assert.equal(S._histWho,'me');assert.equal(JSON.stringify([S.family,S.history]),before);
S.case={id:'foreign',who:'mom',status:'waiting',symptoms:['secret-family-case']};assert(!screens.history.render({S,state:'normal',params:{}}).includes('secret-family-case'));S.case=null;
for(const row of S.history.filter(r=>r.who==='me')){h.context.row=row;const html=run('histItem(row)');assert(html.includes(S.user.full));assert(!html.includes('history-card-store'));assert(html.includes('history-order-row'));assert(!html.includes('history-card-recipient'));assert(!html.includes('ผู้รับการปรึกษา'));assert(!html.includes('ใบเสร็จ'));}
assert(screens.history.states.every(([state])=>!state.includes('family')&&!state.includes('profile')&&!['mother','child'].includes(state)));
const fixture=JSON.stringify(S);for(const [state] of screens.history.states){Object.assign(S,JSON.parse(fixture));S.st.history=state;screens.history.prep(S);const html=screens.history.render({S,state,params:{}});assert(typeof html==='string'&&html.length>0,state);assert(!html.includes('history-profile-list'));}
const seed=run('FX.account()');assert.equal(seed.family.length,0);assert.equal(seed.history.length,8);assert.equal(new Set(seed.history.map(r=>r.id)).size,8);assert.equal(new Set(seed.history.map(r=>r.date)).size,8);assert(seed.history.some(r=>r.outcome==='customer-ended'));assert(seed.history.some(r=>r.outcome==='order-complete'));assert(seed.history.every(r=>r.who==='me'));
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
console.log('PASS: eight mock records, unique consultation IDs, mixed dates/times and consultation outcomes independent of purchases and compact paid totals');

// Pending payment uses the regular history card with the exact order id, not a duplicate reminder.
const pay=harness();pay.TP.orderPayable=o=>o.status==='pending'&&o.expiresAt>Date.now();pay.TP.orderRemaining=()=> '14:59';pay.TP.orderTime=()=> '18:00';
pay.context.record={id:'pay-history',who:'me',topic:'cough',date:'01/11/2026',time:'17:45',pharm:'kj',branch:'tw',outcome:'completed',_case:{id:'pay-history',order:{status:'pending',expiresAt:Date.now()+900000}}};
let pending=pay.run('histItem(record)');assert(pending.includes('history-card-payable'));assert(!pending.includes('รอชำระค่ายา'));assert(pending.includes('data-a="openOrderPayment"'));assert(pending.includes('pay-history'));assert(pending.includes('data-order-countdown'));assert(!pending.includes('ยอดเงินทั้งหมด'));
pay.context.record._case.order.expiresAt=Date.now()-1;pending=pay.run('histItem(record)');assert(!pending.includes('data-a="openOrderPayment"'));assert(!pending.includes('data-order-countdown'));assert(pending.includes('data-go="summary"'));
assert(!source.slice(source.indexOf("TP.screen('history',"),source.indexOf("TP.act('afHistStatus'")).includes('paymentReminderCard'));
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

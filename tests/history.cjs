const assert=require('node:assert/strict'),{harness,source}=require('./health-harness.cjs');
const h=harness(),{S,run,screens,actions}=h;
const ids=()=>Array.from(run('historyItems(TP.S)').map(h=>h.id));
S.st.history='normal';S.case=null;const screen=screens.history.render({S,state:'normal',params:{}});assert(screen.indexOf('data-segname="histStatus"')<screen.indexOf('id="histSearch"'));assert(!screen.includes('<legend>ประเภทการปรึกษา'));assert(!screen.includes('เก็บแชท'));assert(!screen.includes('id="histCount"'));assert(!screen.includes('รายการ · ล่าสุดก่อน'));assert(!screen.includes('history-card-link'));assert(screen.includes('ไม่ได้ซื้อยา'));assert(!screen.includes('ปรึกษาอย่างเดียว'));
const statusCases={pending:'รอชำระเงิน',paid:'ซื้อยาแล้ว',cancelled:'ยกเลิกรายการยา',expired:'รายการยาหมดอายุ'};for(const [status,label] of Object.entries(statusCases)){h.context.record={id:'status',who:'me',orderStatus:status,bought:0};assert.equal(run('historyPurchase(TP.S,record).label'),label);S._histStatus='paid';assert.equal(run('historyItems(TP.S,\'all\',[record]).length'),status==='paid'?1:0);}
S.case=null;S._histWho='all';S._histStatus='all';S._histQuery='';
assert.deepEqual(ids(),['self-new','self-old']);
for(const legacyWho of ['all','mom','kid']){S._histWho=legacyWho;assert.deepEqual(ids(),['self-new','self-old']);assert.equal(run('historySelector(TP.S)'), '');}
S._histStatus='paid';assert.deepEqual(ids(),['self-old']);S._histStatus='none';assert.deepEqual(ids(),['self-new']);S._histStatus='all';
S._histQuery='บุญเรือน';assert.equal(ids().length,0);S._histQuery='สาขาตลาด';assert.equal(ids().length,2);S._histQuery='';
assert.deepEqual(Array.from(run('historyFilterOptions(TP.S)'),p=>Array.from(p)),[['all','ทั้งหมด (2)'],['paid','ซื้อยาแล้ว (1)'],['none','ไม่ได้ซื้อยา (1)']]);
const before=JSON.stringify([S.family,S.history]);actions.afHistWho({dataset:{v:'mom'}});assert.equal(S._histWho,'me');assert.equal(JSON.stringify([S.family,S.history]),before);
S.case={id:'foreign',who:'mom',status:'waiting',symptoms:['secret-family-case']};assert(!screens.history.render({S,state:'normal',params:{}}).includes('secret-family-case'));S.case=null;
for(const row of S.history.filter(r=>r.who==='me')){h.context.row=row;const html=run('histItem(row)');assert(html.includes(S.user.full));assert(html.includes('history-card-store'));assert(!html.includes('history-card-recipient'));assert(!html.includes('ผู้รับการปรึกษา'));assert(!html.includes('ใบเสร็จ'));}
assert(screens.history.states.every(([state])=>!state.includes('family')&&!state.includes('profile')&&!['mother','child'].includes(state)));
const fixture=JSON.stringify(S);for(const [state] of screens.history.states){Object.assign(S,JSON.parse(fixture));S.st.history=state;screens.history.prep(S);const html=screens.history.render({S,state,params:{}});assert(typeof html==='string'&&html.length>0,state);assert(!html.includes('history-profile-list'));}
const freshStart=source.indexOf('TP.fresh = () => ('),freshEnd=source.indexOf('TP.S = TP.fresh();',freshStart);run(source.slice(freshStart,freshEnd));const seed=h.TP.fresh();assert.equal(seed.family.length,0);assert.equal(seed.history.length,10);assert.equal(new Set(seed.history.map(r=>r.id)).size,10);assert(seed.history.filter(r=>r.date==='28/10/2026').length===2);assert(seed.history.every(r=>r.who==='me'));
console.log('PASS: account-only history, legacy family isolation, counts, search, cards and all active history states');

// Retained household implementation is inaccessible from preview/deep links.
for(const id of ['family','familyedit']){const start=source.indexOf("TP.screen('"+id+"'");assert(start>=0);assert(/hidden:\s*true/.test(source.slice(start,start+230)));assert(/disabled:\s*true/.test(source.slice(start,start+230)));}
const manifests=require('node:fs').readdirSync('design-system/screens/account');for(const code of ['C502','C503','C504'])assert(!manifests.includes(code+'.json'));
assert(source.includes("if(TP.def(id)?.disabled)return TP.go('account',{root:true})"));

// Search disclosure: clear query without closing; close resets query but keeps purchase tab.
const search=harness(),events={};let focuses=0,blurs=0;
const input={value:'',focus(){focuses++},blur(){blurs++},addEventListener:(event,fn)=>events[event]=fn};
const toggle={attrs:{},setAttribute(key,value){this.attrs[key]=value},focus(){this.focused=true}};
search.elements['#histSearch']=input;search.elements['#histSearchPanel']={hidden:true};search.elements['#histSearchToggle']=toggle;search.elements['#histSearchClear']={hidden:true};search.elements['#histCount']={textContent:''};
search.S._histStatus='paid';search.S._histQuery='';
search.actions.afHistSearchToggle();assert.equal(search.elements['#histSearchPanel'].hidden,false);assert.equal(toggle.attrs['aria-expanded'],'true');assert.equal(focuses,1);
search.screens.history.mount({}, {S:search.S,state:'normal',later:()=>{}});
input.value='ไข้';events.input({target:input});assert.equal(search.S._histQuery,'ไข้');assert.equal(search.elements['#histSearchClear'].hidden,false);
search.actions.afHistSearchClear();assert.equal(input.value,'');assert.equal(search.S._histQuery,'');assert.equal(search.elements['#histSearchPanel'].hidden,false);assert.equal(search.S._histStatus,'paid');assert.equal(search.elements['#histSearchClear'].hidden,true);
input.value='ไม่พบ';events.input({target:input});search.actions.afHistSearchClose();assert.equal(search.elements['#histSearchPanel'].hidden,true);assert.equal(search.S._histQuery,'');assert.equal(search.S._histStatus,'paid');assert(toggle.focused);assert.equal(toggle.attrs['aria-expanded'],'false');
search.actions.afHistSearchToggle();let prevented=false;events.keydown({key:'Escape',preventDefault(){prevented=true}});assert(prevented);assert(search.elements['#histSearchPanel'].hidden);
search.actions.afHistSearchToggle();events.keydown({key:'Enter',preventDefault(){}});assert.equal(blurs,1);assert(!search.elements['#histSearchPanel'].hidden);search.actions.afHistSearchToggle();assert(search.elements['#histSearchPanel'].hidden);
search.S._histSearchOpen=false;const closedSearch=search.screens.history.render({S:search.S,state:'normal',params:{}});assert(closedSearch.includes('id="histSearchToggle"'));assert(closedSearch.includes('aria-controls="histSearchPanel"'));assert(closedSearch.includes('id="histSearchPanel" hidden'));assert(closedSearch.includes('placeholder="อาการ ร้านยา เภสัชกร หรือเลขการปรึกษา"'));assert(closedSearch.includes('aria-label="ล้างคำค้นหา"'));assert(closedSearch.includes('data-a="afHistSearchClose"'));
console.log('PASS: header search, focus, live query, clear versus close, retained tab, Escape/Enter and toggle');

const totals=harness();totals.context.paidRecord={id:'total-paid',who:'me',date:'01/10/2026',time:'12:00',topic:'ตัวอย่าง',pharm:'kj',branch:'tw',bought:265,order:{status:'paid',total:310.5}};
let totalHtml=totals.run('histItem(paidRecord)');assert(totalHtml.includes('ยอดเงินทั้งหมด'));assert(totalHtml.includes('310.50 บาท'));assert(!totalHtml.includes('265.00 บาท'));
for(const status of ['none','pending','cancelled','expired']){totals.context.paidRecord.order.status=status;totals.context.paidRecord.bought=0;assert(!totals.run('histItem(paidRecord)').includes('history-card-total'));}
console.log('PASS: ten mock records, unique consultation IDs, mixed dates/times and totals only for paid purchases');

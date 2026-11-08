const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('public/runtime/customer.js','utf8'),screens={},actions={},calls=[];
const S={st:{},inbox:[],history:[{id:'SUMMARY',summary:true}]};
let canBack=false;const TP={S,canBack:()=>canBack,SCREENS:screens,screen:(id,d)=>screens[id]=d,act:(id,fn)=>actions[id]=fn,emit(){},cur:()=>({id:'inbox'}),tab:id=>calls.push({id}),go:(id,o)=>calls.push({id,...o}),refresh:()=>calls.push({refresh:true})};
for(const id of ['summary','history','health','account','addressbook','home'])screens[id]={};
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const ui={nav:o=>`${o.back?'<button data-back>กลับ</button>':''}<h1>${o.title}</h1>`,page:s=>s,skel:()=>'<i></i>',empty:o=>o.title+o.body+(o.btn?.a||'')};
const ctx=vm.createContext({TP,ui,esc,ic:()=>'<svg></svg>',Date,Intl,Map});
vm.runInContext(source.slice(source.indexOf('TP.previewInbox ='),source.indexOf('TP.fresh =')),ctx);
vm.runInContext(source.slice(source.indexOf('const inboxVisible ='),source.indexOf('/* =====================================================================\n   Account (tab root)')),ctx);
const groups=(notes,date)=>TP.inboxGroups(notes,new Date(date));
S.inbox=TP.previewInbox(S.history);assert.equal(S.inbox.length,10);assert.equal(new Set(S.inbox.map(n=>n.id)).size,10);assert.equal(TP.inboxGroups(S.inbox).length,4);
for(const n of S.inbox){assert(screens[n.go]);if(n.go==='summary')assert.equal(n.p.id,'SUMMARY');}
assert(TP.previewInbox([]).filter(n=>n.kind==='summary').every(n=>n.go==='history'&&!n.p));
const notes=[{id:'old',time:'31/12/2025 23:59'},{id:'latest',time:'01/01/2026 03:00'},{id:'early',time:'01/01/2026 01:00'},{id:'bad',time:'31/02/2026 10:00'}],before=JSON.stringify(notes);
const g=groups(notes,'2025-12-31T20:30:00Z');assert.equal(g[0].label,'วันนี้');assert.equal(g[1].label,'เมื่อวาน');assert.equal(g[2].label,'ก่อนหน้านี้');assert.equal(g[0].items[0].note.id,'latest');assert.equal(JSON.stringify(notes),before);
const iso=groups([{id:'utc',createdAt:'2026-10-31T18:05:00Z'},{id:'local',time:'01/11/2026 00:30'}],'2026-10-31T23:00:00Z');assert.equal(iso.length,1);assert.equal(iso[0].key,'2026-11-01');assert.equal(iso[0].items[0].date.time,'01:05');assert.equal(iso[0].items[0].date.iso,'2026-11-01T01:05:00+07:00');
const render=state=>screens.inbox.render({S,state,params:{}});
S.st.inbox='normal';screens.inbox.prep(S);const html=render('normal');assert.equal((html.match(/class="inbox-item"/g)||[]).length,10);assert.equal((html.match(/<h2 /g)||[]).length,4);assert(!/อ่านทั้งหมด|อ่านครบแล้ว|afReadAll|dot/.test(html));assert(html.includes('datetime='));
S.inbox.push({kind:'address', title:'address change'});assert(!render('normal').includes('address change'));
S.inbox[0].title='<unsafe>';assert(render('normal').includes('&lt;unsafe>'));S.inbox[0].read=true;assert.equal(render('normal'),render('read'),'read flags do not change presentation');
const live={id:'live',kind:'msg',title:'live',time:'01/11/2026 10:00',go:'history',read:false};S.inbox.push(live);render('normal');assert(S.inbox.includes(live),'render must retain incoming notifications');actions.afOpenNote({dataset:{v:'live'}});assert(live.read);assert.equal(calls.at(-1).id,'history');
const summary=S.inbox.find(n=>n.go==='summary');actions.afOpenNote({dataset:{v:summary.id}});assert.equal(calls.at(-1).params.id,'SUMMARY');
S.st.inbox='same-day';screens.inbox.prep(S);assert.equal(S.inbox.length,4);assert.equal(TP.inboxGroups(S.inbox).length,1);
S.st.inbox='empty';screens.inbox.prep(S);assert(render('empty').includes('ยังไม่มีการแจ้งเตือน'));assert(render('loading').includes('aria-busy="true"'));assert(render('error').includes('afInboxRetry'));actions.afInboxRetry();assert.equal(S.inbox.length,10);assert.equal(S.st.inbox,'normal');
assert.deepEqual(Array.from(screens.inbox.states.slice(0,3),s=>s[0]),['normal','read','empty']);
assert(!render('normal').includes('data-back'));canBack=true;assert(render('normal').includes('data-back'));canBack=false;
assert(html.includes('class="inbox-item-time"'));assert(!html.includes('ร้านยากรุงเทพ'));
console.log('PASS: 10 linked fixtures, Bangkok calendar grouping, sorting/ISO/invalid dates, live items retained, safe rendering, same-day/empty/loading/error/retry and exact destination');

// Notices must keep their own record even when another order becomes current.
S.history=[{id:'older',summary:true},{id:'newer',summary:true}];
S.inbox=TP.previewInbox(S.history);
for(const note of S.inbox){assert(note.p.id);assert.equal(note.caseId,note.p.id);actions.afOpenNote({dataset:{v:note.id}});assert.equal(calls.at(-1).id,'summary');assert.equal(calls.at(-1).params.id,note.caseId);}
let info={done:false};TP.orderCases=()=>[{id:'older',order:{}}];TP.fulfillmentInfo=()=>info;TP.fulfillmentScreen=()=> 'track';TP.notify=()=>{};
actions.afOpenNote({dataset:{v:S.inbox[0].id}});assert.equal(calls.at(-1).id,'track');assert.equal(S._paymentCase.id,'older');
info={done:true};actions.afOpenNote({dataset:{v:S.inbox[0].id}});assert.equal(calls.at(-1).id,'summary');assert.equal(calls.at(-1).params.id,'older');
S.inbox.push({id:'missing',go:'summary',p:{id:'deleted'}});actions.afOpenNote({dataset:{v:'missing'}});assert(calls.at(-1).refresh);
S.inbox.push({id:'unbound',go:'summary'});actions.afOpenNote({dataset:{v:'unbound'}});assert.equal(calls.at(-1).id,'history');
console.log('PASS: exact multi-order notification destinations, live tracking, completed summary and missing-record fallback');

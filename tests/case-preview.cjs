const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
const TP={S:{st:{home:'active-next'}},newCase(){return this.S.case={branch:'tw',pharm:'kj',symptoms:[],msgs:[]};},refresh(){},go(id){this.destination=id;},emit(){},cur:()=>({id:'notifications'}),branch:()=>({name:'ร้านตัวอย่าง',short:'ร้านตัวอย่าง'}),PHARM:{kj:{short:'เภสัชตัวอย่าง'}}};
TP.startOrderPayment=()=>false;TP.NOW={time:'14:12'};TP.makeOrder=()=>{TP.S.case.order={status:'pending',items:[],total:180,expiresAt:Date.now()+900000};};TP.expireOrder=c=>{if(c.order.expiresAt<=Date.now())c.order.status='expired';};
const context=vm.createContext({TP,C:()=>TP.S.case,ph:()=>TP.PHARM.kj});
TP.ORDER_ITEMS=[{name:'A',price:120},{name:'B',price:40},{name:'C',price:225}];TP.ORDER_PAYMENT_MS=900000;TP.act=()=>{};TP.esc=String;TP.ic=()=>'';TP.fmtAddr=()=> 'Address';TP.orderCases=S=>S.case?[S.case]:[];
vm.runInContext(source.slice(source.indexOf('TP.chatConsult ='),source.indexOf('/* End chat order lifecycle */')),context);
let start=source.indexOf('TP.casePreview = {'),end=source.indexOf('\nTP.caseOpen =',start);vm.runInContext(source.slice(start,end),context);
start=source.indexOf('TP.miniInfo = () => {');end=source.indexOf('\n};',start)+3;vm.runInContext(source.slice(start,end),context);
const isOpen=c=>!['closed','cancelled','expired'].includes(c.status);
for(const [key] of TP.casePreview.states){TP.casePreview.apply(key);assert.equal(TP.S.st.home,'');assert.equal(TP.S._casePreview,key);if(key.startsWith('queue')){const count=Number(key.slice(5));assert.equal(TP.S.case.pos,count+1);assert.equal(TP.miniInfo().title,`รออีก ${count} คิว`);}if(['finished','cancelled','expired'].includes(key))assert(!isOpen(TP.S.case));}
TP.casePreview.apply('payment');assert.equal(TP.miniInfo().icon,'payment');TP.casePreview.apply('next');assert.equal(TP.S.case.order,null);assert.equal(TP.S.case.idle,false);assert.equal(TP.miniInfo().title,'คุณเป็นคิวถัดไป');
TP.casePreview.apply('matched');assert.equal(TP.miniInfo().title,'เภสัชกรรับคิวแล้ว');
TP.casePreview.apply('video-request');assert.equal(TP.destination,'room');assert.equal(TP.S.case.status,'room');assert.equal(TP.S.case.hold,true);assert.equal(TP.S.case.msgs.filter(m=>m.kind==='video-request'&&m.status==='pending').length,1);assert.equal(TP.S.call,null);
TP.casePreview.seed('reply');assert(Number.isFinite(TP.S.case.idle.until));
TP.casePreview.seed('payment');assert(TP.S.case.msgs.some(m=>m.kind==='order'));assert(TP.S.case.order.expiresAt>Date.now());
assert.equal(TP.casePreview.seed('invalid'),false);
console.log('PASS: all preview states, queues ahead, matched label, terminal states and stale payment/idle reset');

TP.casePreview.apply('payment');TP.S.call={active:true};TP.S._paymentCase=TP.S.case;TP.casePreview.apply('none');assert.equal(TP.S.case,null);assert.equal(TP.S.call,null);assert.equal(TP.S._paymentCase,null);assert.equal(TP.miniInfo(),null);console.log('PASS: no-consult preview clears case, call and pending order minibar');

// Exercise the exact prep and render reached by every home event button.
const acorn=require('next/dist/compiled/acorn/acorn.js');let homeDef;
function walk(n){if(!n||typeof n!=='object')return;if(n.type==='CallExpression'&&n.callee?.object?.name==='TP'&&n.callee.property?.name==='screen'&&n.arguments[0]?.value==='home')homeDef=n.arguments[1];for(const [k,v]of Object.entries(n)){if(k==='start'||k==='end')continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}
walk(acorn.parse(source,{ecmaVersion:'latest'}));
const property=name=>homeDef.properties.find(p=>p.key.name===name);
const homeStates=vm.runInContext(source.slice(property('states').value.start,property('states').value.end),context);
context.homePrep=vm.runInContext('({'+source.slice(property('prep').start,property('prep').end)+'}).prep',context);
context.homeRender=vm.runInContext('({'+source.slice(property('render').start,property('render').end)+'}).render',context);
Object.assign(context,{esc:String,ic:()=>'',brand:{guilloche:()=>'',halo:()=>'',heroArt:()=>''},homeBanner:()=>'',homeConsultBanner:()=>'',nearbyStoresHtml:()=>'',ui:{av:()=>'',btn:(label,o)=>`<button>${label}</button>`,tag:s=>s,page:s=>s,group:()=>''}});
Object.assign(TP,{homeScenario(S){S.branchState={tw:'open'};S.queueLen={tw:0}},homeAddress:()=>({}),addressName:()=> 'บ้าน',pickBranch:()=>({id:'tw',name:'ร้านตัวอย่าง'}),caseOpen:()=>!!TP.S.case&&isOpen(TP.S.case),money:n=>'฿'+n,orderTime:()=> '14:27',orderRemaining:()=> '15:00',orderPayable:o=>o.status==='pending',orderCases:()=>TP.S.case?[TP.S.case]:[]});
start=source.indexOf('function homeActiveCaseCard(');end=source.indexOf("TP.screen('home'",start);vm.runInContext(source.slice(start,end),context);
start=source.indexOf('TP.pendingPaymentCase =');end=source.indexOf("TP.act('openOrderPayment'",start);vm.runInContext(source.slice(start,end),context);
let current='home';TP.cur=()=>({id:current});
TP.ui=context.ui;const expected={'delivery-preparing':'กำลังเตรียมยา','delivery-calling':'กำลังเรียกไรเดอร์เข้ารับยา','delivery-delivering':'ไรเดอร์กำลังส่งยาให้คุณ','delivery-delivered':'จัดส่งยาเสร็จสิ้น',none:null,queue1:'มีผู้รอก่อนคุณ 1 คน',next:'คุณเป็นคิวถัดไป',paused:'คิวของคุณยังอยู่',matched:'เภสัชกรรับคิวแล้ว',chat:'กำลังสนทนา','video-request':'กำลังสนทนา',reply:'รอคำตอบจากคุณ',payment:'มีรายการยารอชำระ','closed-unpaid':'รายการยาของคุณพร้อมชำระแล้ว','payment-soon':'รายการยาของคุณพร้อมชำระแล้ว','closed-payexpired':'รายการยานี้ชำระไม่ได้แล้ว',finished:null,cancelled:null,expired:null};
for(const [key,label]of TP.casePreview.states.filter(([k])=>!['queue3','queue2'].includes(k))){
 const state='case-'+key;assert(homeStates.some(([k])=>k===state),key+' missing home fixture');TP.S.st.home=state;TP.S.call={stale:true};TP.S.netOff=true;TP.destination=null;context.homePrep(TP.S);assert.equal(TP.destination,null,'home event must not navigate to chat');assert.equal(TP.S.call,null,key+' stale call');assert.equal(TP.S.netOff,false,key+' stale offline');const html=context.homeRender({S:TP.S,state});if(expected[key])assert(html.includes(expected[key]),key+' home card');else {assert(!html.includes('hm-active-case'),key+' has no active card');assert(!html.includes('post-consult-payment'),key+' has no payable card');}assert.equal(TP.miniInfo(),null,'home uses card, not duplicate minibar');current='history';if(TP.S.case&&(isOpen(TP.S.case)||TP.S.case.order?.status==='pending'||TP.fulfillmentInfo(TP.S.case)&&!TP.fulfillmentInfo(TP.S.case).done))assert(TP.miniInfo()?.title,key+' minibar');current='home';}
console.log('PASS: all 19 home event fixtures render the expected card, stay on home, clear stale call/network and supply minibar info on other tabs');

TP.fresh=()=>({queueLen:{tw:0}});TP.flag=()=>false;TP.S.history=[{id:'archived-pay',_case:{id:'archived-pay',status:'closed',order:{status:'pending',items:[],total:999}}}];
for(const state of ['normal','loading','closed']){TP.casePreview.seed('closed-unpaid');TP.S._paymentCase=TP.S.case;TP.S.st.home=state;context.homePrep(TP.S);assert.equal(TP.S.case,null);assert.equal(TP.S._paymentCase,null);assert(TP.S._homeEventPreview);const html=context.homeRender({S:TP.S,state});assert(!html.includes('รายการยาของคุณพร้อมชำระแล้ว'));assert.equal(TP.S.history.length,1);}
console.log('PASS: pending payment → normal/loading/closed home events clears stale case and checkout pointer while preserving archived history');

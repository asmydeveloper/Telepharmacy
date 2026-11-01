const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
const TP={S:{st:{home:'active-next'}},newCase(){return this.S.case={branch:'tw',pharm:'kj',symptoms:[],msgs:[]};},refresh(){},emit(){},cur:()=>({id:'notifications'}),branch:()=>({name:'ร้านตัวอย่าง',short:'ร้านตัวอย่าง'}),PHARM:{kj:{short:'เภสัชตัวอย่าง'}}};
const context=vm.createContext({TP,C:()=>TP.S.case,ph:()=>TP.PHARM.kj});
let start=source.indexOf('TP.casePreview = {'),end=source.indexOf('\nTP.caseOpen =',start);vm.runInContext(source.slice(start,end),context);
start=source.indexOf('TP.miniInfo = () => {');end=source.indexOf('\n};',start)+3;vm.runInContext(source.slice(start,end),context);
const isOpen=c=>!['closed','cancelled','expired'].includes(c.status);
for(const [key] of TP.casePreview.states){TP.casePreview.apply(key);assert.equal(TP.S.st.home,'');assert.equal(TP.S._casePreview,key);if(key.startsWith('queue')){const count=Number(key.slice(5));assert.equal(TP.S.case.pos,count+1);assert.equal(TP.miniInfo().title,`รออีก ${count} คิว`);}if(['finished','cancelled','expired'].includes(key))assert(!isOpen(TP.S.case));}
TP.casePreview.apply('payment');assert.equal(TP.miniInfo().icon,'payment');TP.casePreview.apply('next');assert.equal(TP.S.case.order,null);assert.equal(TP.S.case.idle,false);assert.equal(TP.miniInfo().title,'คุณเป็นคิวถัดไป');
TP.casePreview.apply('matched');assert.equal(TP.miniInfo().title,'เภสัชกรรับคิวแล้ว');
assert.equal(TP.casePreview.seed('invalid'),false);
console.log('PASS: all 12 preview states, queues ahead, matched label, terminal states and stale payment/idle reset');

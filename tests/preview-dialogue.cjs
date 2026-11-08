const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
let el={};const c={status:'room',symptoms:['เจ็บคอ'],msgs:[{who:'me',text:'ข้อความเดิม'}]};
let typingCount=0;
const TP={casePreview:{},S:{},cur:()=>({id:'room',el}),async refresh(){await Promise.resolve();el={};},emit(){},casePlan:()=>({q:['เป็นมากี่วันคะ'],dx:'จากข้อมูลที่แจ้ง ขอแนะนำการดูแลอาการค่ะ'}),sim:{order(){c.order={status:'pending'};c.msgs.push({kind:'order'});}},receiveVideoRequest(m){c.msgs.push({kind:'video-request',id:m.id,status:'pending'});}};
const context=vm.createContext({TP,C:()=>c,P:()=>({short:'ภญ.ขวัญใจ'}),now:()=> '14:20',typing:async target=>{assert.equal(target,el,'typing must use the newly rendered chat');typingCount++;},push:(_,m)=>c.msgs.push(m),setTimeout:fn=>fn()});
vm.runInContext(source.slice(source.indexOf('TP.casePreview.playChat = async'),source.indexOf('\nTP.sim.order = () => {')),context);
(async()=>{
const first=c.msgs[0];await TP.casePreview.playChat('payment');
assert(c.msgs.includes(first),'existing messages are kept');assert.equal(c.msgs[0].kind,'intake','the symptom report stays the first message');assert.equal(c.msgs.filter(m=>m.kind==='intake').length,1);assert.equal(c.msgs.at(-1).kind,'order');assert(c.msgs.slice(1,-1).some(m=>m.who==='me'&&m.text));assert(c.msgs.slice(1,-1).some(m=>m.who==='ph'&&m.text));assert.equal(typingCount,2);assert.equal(c._previewPlaying,false);
const length=c.msgs.length;await TP.casePreview.playChat('payment');assert.equal(c.msgs.length,length);
await TP.casePreview.playChat('video-request');assert.equal(c.msgs.at(-1).kind,'video-request');assert(c.msgs.includes(first),'existing messages are kept');assert.equal(c.msgs[0].kind,'intake','the symptom report stays the first message');assert.equal(c.msgs.filter(m=>m.kind==='intake').length,1);
await TP.casePreview.playChat('reply');assert(Number.isFinite(c.idle.until));assert(c.idle.until>Date.now());
console.log('PASS: existing transcript retained, patient and pharmacist dialogue before medicine, typing, duplicate order guard and video invitation appended');
})().catch(e=>{console.error(e);process.exitCode=1;});

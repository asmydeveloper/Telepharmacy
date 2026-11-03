const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
const S={case:null,st:{},notif:true,netOff:false},screens={},elements={},actions={},calls=[];
let current={id:'queue',el:{}};
const fresh=()=>({id:'case-test',status:'queue',pos:4,branch:'tw',pharm:'kj',msgs:[],urgent:[],symptoms:['ไอ'],note:'',mode:'chat'});
S.case=fresh();
const TP={miniStatusIcon:kind=>`<svg data-status="${kind}"></svg>`,sheetOpen:()=>null,S,SCREENS:screens,NOW:{time:'14:12'},screen:(id,d)=>screens[id]=d,act:(id,fn)=>actions[id]=fn,cur:()=>current,branch:()=>({name:'ร้านตัวอย่าง',short:'ร้านตัวอย่าง'}),ensureCase:()=>S.case,emit:()=>{},live:t=>calls.push(['live',t]),mini:()=>{},refresh:()=>Promise.resolve(),go:(id,o)=>{calls.push(['go',id,o]);current.id=id;return Promise.resolve();},banner:()=>{},RED:()=>true,casePlan:()=>({}),demoProfiles:{}};
const ui={av:()=>'<avatar>',dock:s=>s,btn:s=>s},C=()=>S.case;
const context=vm.createContext({TP,ui,C,P:()=>({name:'เภสัชกรตัวอย่าง',short:'ภญ.ตัวอย่าง',lic:'12345',ini:'ต'}),esc:s=>String(s??''),ic:()=>'<icon>',now:()=> '14:12',qDanger:()=>'<aside>urgent</aside>',idleHtml:()=>'',msgHtml:m=>`<message>${m.text||m.kind||''}</message>`,ensureCase:status=>{if(status)S.case.status=status;return S.case;},$:selector=>elements[selector],$$:()=>[],wake:()=>{},push:(el,m)=>S.case.msgs.push(m),SCRIPT:()=>{throw Error('Pharmacist script must not run while waiting');},requestAnimationFrame:()=>{},Date,console});
const run=s=>vm.runInContext(s,context);
let a=source.indexOf('const waitingForPharmacist ='),b=source.indexOf('/* =====================================================================',a);run(source.slice(a,b));
a=source.indexOf("TP.screen('queue', {");b=source.indexOf("TP.act('queueMin'",a);run(source.slice(a,b));
a=source.indexOf("TP.screen('room', {");b=source.indexOf('/* play the pharmacist',a);run(source.slice(a,b));
a=source.indexOf('TP.sim = {');b=source.indexOf("TP.simAction({ id: 'next'",a);run(source.slice(a,b));
a=source.indexOf('async function sendText(text)');b=source.indexOf("TP.act('quickReply'",a);run(source.slice(a,b));
a=source.indexOf("TP.act('queueMin'");b=source.indexOf('\n',a);run(source.slice(a,b));
(async()=>{
const ctx={S,state:'q4',onLeave(){},later(){},every(){}};
let html=screens.queue.render(ctx);assert(html.includes('รออีก 3 คิว'));assert(html.includes('rmQueueLabel'));assert(html.includes('ภญ.ตัวอย่าง'));assert(html.includes('12345'));assert(!html.includes('ห้องปรึกษาเภสัช'));assert(html.includes('data-status="waiting"')); assert(html.includes('ยกเลิกคิว'));assert(!html.includes('data-a="startVideo"'));assert.equal(C().status,'queue');assert(!C().msgs.some(m=>m.kind==='provider-ready'));assert(!C().msgs.some(m=>m.kind==='intake'),'intake stays hidden until provider joins');assert.equal(C().msgs.filter(m=>m.kind==='waiting').length,1);
C().draft='ร่างอาการ';html=screens.queue.render(ctx);assert(html.includes('ร่างอาการ'));assert.equal(C().msgs.filter(m=>m.kind==='waiting').length,1);
elements['#rmQuick']={innerHTML:''};elements['#rmIn']={value:'',style:{}};
await run('sendText("เจ็บคอมาสองวัน")');assert.equal(C().msgs.at(-1).text,'เจ็บคอมาสองวัน');assert.equal(C().status,'queue');assert(!C().msgs.some(m=>m.who==='ph'));
elements['#rmList']={insertAdjacentHTML(){}};elements['#rmQueueLabel']={textContent:''};elements['#rmScroll']={scrollHeight:500,scrollTop:0,clientHeight:200};let scrolled=false;current.el._bottom=()=>scrolled=true;
TP.sim.next();assert.equal(C().pos,3);assert.equal(elements['#rmQueueLabel'].textContent,'รออีก 2 คิว');assert(!scrolled,'do not jump to latest while reading');assert.equal(C().draft,'ร่างอาการ');
const waitingCase=C();await actions.queueMin();assert.equal(current.id,'home');assert.equal(C(),waitingCase);assert.equal(C().draft,'ร่างอาการ');current.id='queue';
await TP.sim.accept();assert.equal(C().status,'room');assert.equal(current.id,'room');html=screens.room.render(ctx);assert(html.includes('provider-ready'));assert(!html.includes('rmQueueLabel'));assert(C().msgs.some(m=>m.text==='เจ็บคอมาสองวัน'));assert(html.includes('ร่างอาการ'));screens.room.render(ctx);assert.equal(C().msgs.filter(m=>m.kind==='provider-ready').length,1);assert.equal(C().msgs.findIndex(m=>m.kind==='intake'),C().msgs.findIndex(m=>m.kind==='provider-ready')+1,'intake directly follows provider card');
S.case=fresh();S.case.status='paused';html=screens.queue.render(ctx);assert(html.includes('คิวของคุณยังอยู่'));await run('sendText("เพิ่มเติมระหว่างพัก")');assert.equal(C().status,'paused');assert(!C().msgs.some(m=>m.who==='ph'));
for(const state of ['video-wait','video-next']){
  S.case=fresh();S.st.queue=state;screens.queue.prep(S);
  html=screens.queue.render(ctx);
  assert.match(html,/video-queue-cover-v1.jpg/);
  assert.match(html,/รอเภสัชกรพร้อมวิดีโอคอล/);
  assert.match(html,state==='video-next'?/คุณเป็นคิวถัดไป/:/รออีก 1 คิว/);
  assert.doesNotMatch(html,/class="rm-queue-bar"|data-a="startVideo"/);
}
S.case=fresh();S.case.status='closed';html=screens.room.render(ctx);assert(!html.includes('id="rmIn"'));
console.log('PASS: waiting/paused chat, pre-service messages, draft/reopen, queue updates without scroll jump, acceptance preserves messages, single provider card and closed composer');
})().catch(e=>{console.error(e);process.exitCode=1});

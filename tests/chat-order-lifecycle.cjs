const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('public/runtime/customer.js','utf8'),actions={},routes=[],sheets=[];let current={id:'room',el:{}};
const S={st:{},user:{full:'Test User'},history:[],inbox:[],case:{id:'chat-one',mode:'chat',status:'room',symptoms:['อาการตัวอย่าง'],msgs:[],joinedAt:'14:12',branch:'tw'}};
const ui={nav:()=>'',page:s=>s,dock:s=>s,btn:(label,o)=>`<button data-go="${o?.go||''}">${label}</button>`,tag:s=>s};
const TP={S,ui,sim:{},ORDER_ITEMS:[{name:'A',price:120},{name:'B',price:40},{name:'C',price:225}],ORDER_PAYMENT_MS:900000,NOW:{date:'02/11/2026',time:'00:30'},medicineImage:()=>'',money:n=>'฿'+n,esc:String,ic:()=>'',fmtAddr:()=> 'Address',branch:()=>({name:'Branch'}),emit(){},act:(k,f)=>actions[k]=f,cur:()=>current,refresh(){},banner(){},notify(){},sheet:async(id,p)=>{if(id==='pay')TP.startOrderPayment(S._paymentCase.order);sheets.push({id,p});},closeSheet:async()=>{},saveReceipt(){},casePlan:()=>({items:TP.ORDER_ITEMS,adv:['คำแนะนำเพิ่มเติมจากเภสัชกร']}),paidMsg:()=> 'Payment received',RED:()=>true};
require('./consultation-harness.cjs')(TP);
const context=vm.createContext({TP,C:()=>S._paymentCase||S.case,esc:String,ic:()=>'',ui,now:()=> '00:30',setInterval(){},clearInterval(){},clearTimeout(){},document:{querySelectorAll:()=>[]},$:()=>({innerHTML:''}),push:(_,m)=>S.case.msgs.push(m),typing:async()=>{},wake(){},waitingForPharmacist:()=>false,console});
const run=(a,b)=>vm.runInContext(source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a))),context);
run('TP.ORDER_PAYMENT_MS=','/* ---------- message html ---------- */');
vm.runInContext("let chain=Promise.resolve(),pending=null,cur=null,sheet=null,hist=[],running=[];const SCREENS={room:{},home:{},track:{},paid:{},paymentsuccess:{}};async function doGo(id,o){routeCapture(id,o)}",context);context.routeCapture=(id,o)=>{routes.push(id);current={id,el:{}}};
run('TP.go = (id, o = {}) => {','async function doGo(id, o)');run('TP.back = () => {','TP.canBack =');
run('TP.sim.closeCase =','TP.sim.idleWarn =');
TP.RED=()=>true;TP.wait=()=>Promise.resolve();TP.swapUnderSheet=id=>{routes.push(id);current={id,el:{}};return Promise.resolve();};run('TP.CHECKOUT_CLOSING =','/* the bubble flies up');run('async function sendText(text)','TP.act(\'quickReply\'');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
 TP.mini=()=>{};context.showQuick=()=>{};
 run('TP.sim.order = () => {',"TP.simAction({ id: 'msg'");
 TP.sim.order();assert.equal(S.case.msgs.at(-2).kind,'order');assert.equal(S.case.msgs.at(-1).who,'ph');assert(S.case.msgs.at(-1).text.includes('เพิ่มเติม'));
 const countBefore=S.case.msgs.length;TP.sim.order();assert.equal(S.case.msgs.length,countBefore);
 const c=S.case,order=c.order;assert.equal(order.expiresAt,null);assert.equal(TP.expireOrder(c),false);let deadline;
 // Final explicit patient answer leads the mock pharmacist to close and navigate.
 await vm.runInContext("sendText('ไม่มีคำถามเพิ่มเติม')",context);await tick();
 assert.equal(c.status,'closed');assert.equal(c.outcome,'completed');
 const texts=c.msgs.map(m=>m.text),sumAt=c.msgs.findIndex(m=>m.kind==='summary');for(const line of TP.CHECKOUT_CLOSING){const i=texts.indexOf(line);assert(i>=0&&i<sumAt,'closing message comes before the end marker: '+line);}assert(TP.checkoutHandoffRemaining(c)>0,'countdown starts together with the end marker');assert.equal(c.msgs[sumAt].handoff,true,'end marker stays a one-line notice, never the summary card');
 assert.equal(order.expiresAt,null);assert(TP.checkoutHandoffRemaining(c)>0);assert.equal(TP.closedChatRoute(c),null);assert.equal(sheets.length,0);
 await actions.continueCheckout();await tick();
 assert.equal(c.checkoutHandoffUntil,null);deadline=order.expiresAt;assert(!routes.slice(0,-1).includes('home'),'C308 opens over the chat; home only replaces the room underneath');assert(deadline>Date.now());assert(deadline<=Date.now()+900000);assert.equal(order.status,'pending');assert.equal(routes.at(-1),'home');assert.equal(sheets.at(-1).id,'pay');assert.equal(S._paymentCase,c);assert.equal(S.history.length,1);assert.equal(c.pharmacistAdvice,'คำแนะนำเพิ่มเติมจากเภสัชกร');
 const beforeRooms=routes.filter(x=>x==='room').length;await TP.go('room');assert.equal(routes.filter(x=>x==='room').length,beforeRooms);assert.equal(sheets.at(-1).id,'pay');
 vm.runInContext("hist.push({id:'room'})",context);await TP.back();assert.equal(routes.at(-1),'home');assert.equal(order.expiresAt,deadline);
 // Successful express payment starts the existing delivery view without reopening chat.
 vm.runInContext("let selectedRecv='express';const P=()=>({recv:selectedRecv,method:'promptpay'}),addr=()=>({first:'Test',last:'User',house:'123'}),totals=()=>({items:385,ship:89,fee:0,total:474});",context);
 run('async function paid()','TP.payPaid = paid;');await vm.runInContext('paid()',context);
 assert.equal(order.status,'paid');assert.equal(c.status,'closed');assert.equal(order.fulfillment.status,'preparing');assert.equal(routes.at(-1),'paymentsuccess');assert.equal(order.items.length,3);
 // Every checkout method must keep the same order and open its matching status page.
 run('TP.fulfillmentScreen =', "TP.screen('paid',");
 for (const [recv, destination] of [['pickup','paid'], ['express','track'], ['parcel','track']]) {
   order.status='pending';order.fulfillment=null;order.expiresAt=deadline;
   vm.runInContext(`selectedRecv='${recv}'`,context);
   await vm.runInContext('paid()',context);
   assert.equal(order.paid.recv,recv);assert.equal(routes.at(-1),'paymentsuccess');
   const no=order.no, paidSnapshot=order.paid;
   S.st.paid='rider';S.st.track='parcel-delivered';
   await actions.paymentResultStatus();
   assert.equal(routes.at(-1),destination);assert.equal(S._paymentCase,c);
   assert.equal(order.no,no);assert.equal(order.paid,paidSnapshot);assert.equal(order.fulfillment.status,'preparing');
   await actions.viewFulfillment({dataset:{p:JSON.stringify({caseId:c.id})}});
   assert.equal(routes.at(-1),destination);
 }
 order.paid.recv='express';
 TP.orderStatusCard=(steps,no)=>steps.map(x=>x[1]).join(' ')+no;TP.fulfillmentDetails=c=>c.pharmacistAdvice;TP.summaryForCase=c=>'history '+c.pharmacistAdvice;
 for(const phase of ['calling','delivering','delivered']){assert(TP.setFulfillment(c,phase));const page=TP.chatDeliveryPage(c);if(phase==='delivered'){assert(page.includes('history '));assert(!page.includes('สถานะการจัดส่งยา'));}else assert(page.includes(TP.fulfillmentInfo(c).title));assert(page.includes(c.pharmacistAdvice));assert.equal(TP.fulfillmentInfo(c).done,phase==='delivered');if(phase!=='delivered')assert(TP.fulfillmentCard(S).includes(TP.fulfillmentInfo(c).title));assert(!/tkGot|ได้รับยาแล้ว/.test(page));assert.equal(order.expiresAt,deadline);}
 assert.equal(TP.setFulfillment(c,'preparing'),false);assert.equal(TP.setFulfillment(c,'delivered'),false);assert.equal(order.picked,true);assert.equal(order.paid.got,undefined);assert(order.paid.deliv);assert.equal(TP.fulfillmentCard(S),'');assert(!source.includes("TP.act('tkGot'"));assert(!source.includes("TP.act('fuGot'"));assert(!source.includes("TP.sheetDef('gotask'"));
 await TP.go('room');assert.equal(routes.at(-1),'paid');assert.equal(c.status,'closed');
 const unpaid={id:'unpaid',status:'closed',mode:'chat',order:{status:'pending',expiresAt:Date.now()-1}};assert.equal(TP.closedChatRoute(unpaid).screen,'home');assert.equal(unpaid.order.status,'expired');assert.equal(TP.setFulfillment(unpaid,'preparing'),false);
 // Video-selected consultation retains its existing navigation behavior.
 c.mode='video';const count=sheets.length;await TP.go('room');assert.equal(routes.at(-1),'room');assert.equal(sheets.length,count);assert.equal(TP.closedChatRoute(c),null);
 console.log('PASS: final chat answer → pharmacist closure → exact-order checkout; closed-room/back guards; 15-minute deadline from first checkout; express payment → four delivery phases → completion; video route retained');
})().catch(e=>{console.error(e);process.exitCode=1});

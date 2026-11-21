const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('public/runtime/customer.js','utf8'),actions={},routes=[],sheets=[];let current={id:'room',el:{}};
const S={st:{},user:{full:'Test User'},history:[],inbox:[],case:{id:'chat-one',mode:'chat',status:'room',symptoms:['อาการตัวอย่าง'],msgs:[],joinedAt:'14:12',branch:'tw'}};
const ui={nav:()=>'',page:s=>s,dock:s=>s,btn:(label,o)=>`<button data-go="${o?.go||''}">${label}</button>`,tag:s=>s};
const TP={S,ui,sim:{},ORDER_ITEMS:[{name:'A',price:120},{name:'B',price:40},{name:'C',price:225}],ORDER_PAYMENT_MS:900000,NOW:{date:'02/11/2026',time:'00:30'},medicineImage:()=>'',money:n=>'฿'+n,esc:String,ic:()=>'',fmtAddr:()=> 'Address',branch:()=>({name:'Branch'}),emit(){},act:(k,f)=>actions[k]=f,cur:()=>current,refresh(){},banner(){},notify(){},sheet:async(id,p)=>{sheets.push({id,p});},closeSheet:async()=>{},saveReceipt(){},casePlan:()=>({items:TP.ORDER_ITEMS,adv:['คำแนะนำเพิ่มเติมจากเภสัชกร']}),paidMsg:()=> 'Payment received',RED:()=>true};
require('./consultation-harness.cjs')(TP);
const context=vm.createContext({TP,structuredClone,C:()=>S._paymentCase||S.case,esc:String,ic:()=>'',ui,now:()=> '00:30',setInterval(){},clearInterval(){},clearTimeout(){},document:{querySelectorAll:()=>[]},$:()=>({innerHTML:''}),push:(_,m)=>S.case.msgs.push(m),typing:async()=>{},wake(){},waitingForPharmacist:()=>false,console});
vm.runInContext(fs.readFileSync('public/runtime/order-clock.js','utf8'),context);
Object.assign(TP,context.MitrareeOrderClock);
const run=(a,b)=>vm.runInContext(source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a))),context);
run('TP.expireOrder =','/* ---------- message html ---------- */');
vm.runInContext("let chain=Promise.resolve(),pending=null,cur=null,sheet=null,hist=[],running=[];const SCREENS={room:{},home:{},track:{},paid:{},paymentsuccess:{},pendingpayment:{}};async function doGo(id,o){routeCapture(id,o)}",context);context.routeCapture=(id,o)=>{routes.push(id);current={id,el:{}}};
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
 assert.equal(c.checkoutHandoffUntil,null);assert.equal(order.expiresAt,null);assert(!routes.slice(0,-1).includes('home'),'C308 opens over the chat; home only replaces the room underneath');assert.equal(order.status,'pending');assert.equal(routes.at(-1),'home');assert.equal(sheets.at(-1).id,'pay');assert.equal(S._paymentCase,c);assert.equal(S.history.length,1);assert.equal(c.pharmacistAdvice,'คำแนะนำเพิ่มเติมจากเภสัชกร');
 const beforeRooms=routes.filter(x=>x==='room').length;await TP.go('room');assert.equal(routes.filter(x=>x==='room').length,beforeRooms);assert.equal(sheets.at(-1).id,'pay');
 vm.runInContext("hist.push({id:'room'})",context);await TP.back();assert.equal(routes.at(-1),'home');assert.equal(order.expiresAt,null);
 // Successful express payment starts the existing delivery view without reopening chat.
 vm.runInContext("let selectedRecv='express',selectedHouse='123';const P=()=>({recv:selectedRecv,method:'promptpay'}),addr=()=>({first:'Test',last:'User',house:selectedHouse}),totals=()=>({items:385,discount:0,ship:89,fee:0,total:474}),r2=n=>n;",context);
 run('function lockOrderPayment(', '/* what still stops payment');
 vm.runInContext('lockOrderPayment(C())',context);
 deadline=order.expiresAt;
 assert.equal(deadline-order.paymentStartedAt,900000);
 assert.equal(TP.orderRemaining(order,deadline-1),'0:01');
 assert.equal(TP.orderRemaining(order,deadline),'0:00');
 assert.equal(TP.orderPayable(order,deadline-1),true);
 assert.equal(TP.orderPayable(order,deadline),false);
 assert(order.paymentStartedAt<=Date.now());
 assert.equal(order.payment.addr.house,'123');
 assert.equal(TP.closedChatRoute(c).pay,false);
 await actions.openOrderPayment({dataset:{p:JSON.stringify({caseId:c.id})}});
 assert.equal(routes.at(-1),'pendingpayment');
 assert.match(TP.paymentReminderCard(S,c),/รอชำระเงิน/);

 const pendingSheet={id:'pay',ctx:{params:{pendingCaseId:c.id}}};
 run('const isCurrentPayment =', 'async function launchPayment(');
 context.paymentSheet=pendingSheet;
 TP.sheetOpen=()=>pendingSheet;
 assert.equal(vm.runInContext('isCurrentPayment(paymentSheet,C())',context),true);
 assert.equal(vm.runInContext('isCurrentPayment({id:"pay"},C())',context),false);
 TP.BANKS=[['SCB','SCB EASY','ไทยพาณิชย์']];
 run("TP.act('confirmCheckoutMethod'", 'const checkoutAddressBlocked');
 await actions.confirmCheckoutMethod({dataset:{v:'SCB'}});
 assert.equal(order.payment.method,'bank');
 assert.equal(order.payment.bank,'SCB');
 assert.equal(order.expiresAt,deadline);
 run('async function failedPayment(', "TP.act('otpGo'");
 await vm.runInContext("failedPayment('bank')",context);
 assert.equal(order.status,'pending');
 assert.equal(order.payment.failed,true);
 vm.runInContext("selectedHouse='999';lockOrderPayment(C())",context);
 assert.equal(order.expiresAt,deadline);
 assert.equal(order.payment.addr.house,'123');
 delete TP.sheetOpen;

 const screens={};
 TP.screen=(id,def)=>screens[id]=def;
 TP.sheetDef=()=>{};
 TP.simAction=()=>{};
 TP.deliveryMethodName=()=> 'จัดส่งด่วน';
 ui.kv=rows=> rows.map(([key,value])=>key+' '+value).join('');
 Object.assign(context,{fmtAddr:a=>a.house,fmtPhone:()=>''});
 run('function pickupBranchCard(', 'function recvExtra()');
 run('const bankLogos =', "TP.act('openCheckoutChild'");
 run('const bankOf =', 'function showStep(');
 const handoff = vm.runInContext("stepHtml('bankapp')",context);
 assert.match(handoff,/กำลังเปิดแอป SCB EASY…/);
 assert.match(handoff,/ไทยพาณิชย์/);
 assert.match(handoff,/assets\/payments\/scb-easy\.png/);
 assert.equal(vm.runInContext("stepFoot('bankapp')",context),'');
 run('function pendingSample()', '/* ---------- pay failed');
 const pendingCtx={S,params:{caseId:c.id}};
 const pendingPage=screens.pendingpayment.render(pendingCtx);
 assert.match(pendingPage,/ชำระเงินไม่สำเร็จ/);
 assert.match(pendingPage,/SCB EASY/);
 assert.match(pendingPage,/เปลี่ยนวิธีชำระเงิน/);
 assert.match(pendingPage,/ที่อยู่จัดส่ง[\s\S]*123/);
 assert.match(pendingPage,/assets\/couriers\/lalamove\.png/);
 assert.doesNotMatch(pendingPage,/<progress/);
 assert.match(pendingPage,/ที่อยู่จัดส่ง[\s\S]*การจัดส่ง[\s\S]*รายการยา[\s\S]*สรุปยอดชำระ[\s\S]*ยอดที่ต้องชำระ/);
 assert.doesNotMatch(pendingPage,/999|checkoutaddress|checkoutdelivery/);
 const pendingDelivery=order.payment;
 order.payment={...pendingDelivery,recv:'pickup',branch:'saved-branch',courier:null,addr:null};
 const defaultBranch=TP.branch;
 TP.branch=id=>({name:id==='saved-branch'?'สาขาที่เลือก':'สาขาอื่น',previewAddr:'ที่อยู่สาขา',hours:'09:00–21:00',photo:'/mock-store.png'});
 const pickupPage=screens.pendingpayment.render(pendingCtx);
 assert.match(pickupPage,/สาขารับยา[\s\S]*mock-store.png[\s\S]*สาขาที่เลือก[\s\S]*ที่อยู่สาขา[\s\S]*เวลาทำการ 09:00–21:00/);
 assert.doesNotMatch(pickupPage,/ที่อยู่จัดส่ง|data-v="checkoutdelivery"/);
 TP.branch=defaultBranch;
 order.payment=pendingDelivery;
 const future=order.expiresAt;
 order.expiresAt=Date.now()-1;
 const expiredPage=screens.pendingpayment.render(pendingCtx);
 assert.match(expiredPage,/หมดเวลาชำระเงิน/);
 assert.doesNotMatch(expiredPage,/ชำระเงินอีกครั้ง|เปลี่ยนวิธีชำระเงิน/);
 assert.equal(order.status,'expired');
 assert.equal(S.history[0].orderStatus,'expired');
 order.expiresAt=future;
 order.status='pending';

 run('async function paid(','TP.payPaid = paid;');await vm.runInContext('paid()',context);
 assert.equal(order.status,'paid');assert.equal(c.status,'closed');assert.equal(order.fulfillment.status,'preparing');assert.equal(routes.at(-1),'paymentsuccess');assert.equal(order.items.length,3);
 assert.equal(order.paid.addr.house,'123');
 assert.equal(order.paid.method,'bank');
 delete order.payment;
 // Every checkout method must keep the same order and open its matching status page.
 run('TP.fulfillmentScreen =', '/* C309 merged into C414');
 for (const [recv, destination] of [['pickup','track'], ['express','track'], ['parcel','track']]) {
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
 // Legacy history snapshots must not fall back to the latest consultation.
 for (const [recv,destination] of [['pickup','track'],['express','track'],['parcel','track']]) {
  const record={id:'legacy-'+recv,status:'closed',order:{status:'paid',paid:{recv},items:[]}};
  S.history=[record];
  await actions.viewFulfillment({dataset:{p:JSON.stringify({caseId:record.id})}});
  assert.equal(routes.at(-1),destination);assert.equal(S._paymentCase.id,record.id);assert.equal(S._paymentCase.order,record.order);
 }
 S.history=[];S._paymentCase=c;
 ui.route=o=>`data-a="${o.a}" data-case="${o.p.caseId}"`;
 const compact=TP.fulfillmentCard(S,{compact:true});assert(compact.includes('hm-fulfillment-banner'));assert(compact.includes(order.no));assert(compact.includes(c.id));assert(!compact.includes('case-progress-foot'));
 order.paid.recv='express';
 const pickup=structuredClone(c);pickup.id='pickup-two';pickup.order.no='MT202610180702';pickup.order.paid.recv='pickup';pickup.order.paid.stage='ready';pickup.order.fulfillment={status:'preparing'};
 S.history=[{id:pickup.id,_case:pickup}];
 const multiple=TP.fulfillmentCard(S,{compact:true});
 assert(multiple.includes('hm-fulfillment-group'));assert(multiple.includes('2 รายการ'));assert(multiple.includes('hm-fulfillment-carousel'),'multiple orders render as a carousel');assert.equal((multiple.match(/class="hm-fulfillment-slide"/g)||[]).length,2);assert.equal((multiple.match(/class="hm-fulfillment-dot[ "]/g)||[]).length,2);assert(multiple.includes('aria-current="true"'));
 assert.equal((multiple.match(/class="hm-fulfillment-banner"/g)||[]).length,2);
 assert(multiple.includes('ยาพร้อมรับที่สาขาแล้ว'));assert(multiple.includes('รับที่ร้าน'));assert(multiple.includes('ส่งด่วน'));
 await actions.viewFulfillment({dataset:{p:JSON.stringify({caseId:pickup.id})}});
 assert.equal(S._paymentCase.id,pickup.id);assert.equal(routes.at(-1),'track');
 pickup.order.picked=true;
 assert(!TP.fulfillmentCard(S,{compact:true}).includes('hm-fulfillment-group'));
 S.history=[];S._paymentCase=c;
 order.paid.recv='express';
 run('const paidStatusCard =','const orderChargeRows');
 run('function trkSteps(','TP.screen(\'track\'');
 context.courierOf=()=>({name:'DHL Express'});
 const parcelSteps=vm.runInContext('trkSteps',context);
 for(const [state,paid,active] of [
   ['prep',{},1], ['transit',{parcelStep:'packed'},2], ['transit',{},2], ['out',{out:'10:00'},2], ['delivered',{},3],
 ]) {
   const {steps,cur}=parcelSteps({recv:'parcel',...paid},state);
   assert.equal(steps.length,4);
   assert.equal(cur,active);
 }
 TP.fulfillmentDetails=c=>c.pharmacistAdvice;TP.summaryForCase=c=>'history '+c.pharmacistAdvice;TP.SCREENS={...(TP.SCREENS||{}),summary:{render:({params})=>'C401 '+params.id+' '+c.pharmacistAdvice}};
 const expressStatus=TP.chatDeliveryPage(c);
 assert.match(expressStatus,/\/assets\/couriers\/lalamove\.png/);
 assert.equal((expressStatus.match(/<li class=/g)||[]).length,4);
 const trackingDetails = source.slice(source.indexOf('TP.fulfillmentDetails = c =>'), source.indexOf('/* ---------- paid (C12)'));
 assert.match(trackingDetails, /title:'ดูใบเสร็จ'.*go:'receipt',p:\{id:c.id\}/);
 assert.doesNotMatch(trackingDetails, /ดูคำสั่งซื้อ|go:'summary'/);
 for(const phase of ['calling','delivering','delivered']){assert(TP.setFulfillment(c,phase));const page=TP.chatDeliveryPage(c);if(phase==='delivered'){/* a finished order has no status page: it shows the order summary C401 */assert(page.includes('C401 '+c.id));}else assert(page.includes(TP.fulfillmentInfo(c).title));assert(page.includes(c.pharmacistAdvice));assert.equal(TP.fulfillmentInfo(c).done,phase==='delivered');if(phase!=='delivered')assert(TP.fulfillmentCard(S).includes(TP.fulfillmentInfo(c).title));assert(!/tkGot|ได้รับยาแล้ว/.test(page));assert.equal(order.expiresAt,deadline);}
 assert.equal(TP.setFulfillment(c,'preparing'),false);assert.equal(TP.setFulfillment(c,'delivered'),false);assert.equal(order.picked,true);assert.equal(order.paid.got,undefined);assert(order.paid.deliv);assert.equal(TP.fulfillmentCard(S),'');assert.equal(TP.fulfillmentCard(S,{compact:true}),'');assert(!source.includes("TP.act('tkGot'"));assert(!source.includes("TP.act('fuGot'"));assert(!source.includes("TP.sheetDef('gotask'"));
 await TP.go('room');assert.equal(routes.at(-1),'track');assert.equal(c.status,'closed');
 const unpaid={id:'unpaid',status:'closed',mode:'chat',order:{status:'pending',expiresAt:Date.now()-1}};assert.equal(TP.closedChatRoute(unpaid).screen,'home');assert.equal(unpaid.order.status,'expired');assert.equal(TP.setFulfillment(unpaid,'preparing'),false);
 // Video-selected consultation retains its existing navigation behavior.
 c.mode='video';const count=sheets.length;await TP.go('room');assert.equal(routes.at(-1),'room');assert.equal(sheets.length,count);assert.equal(TP.closedChatRoute(c),null);
 console.log('PASS: final chat answer → pharmacist closure → exact-order checkout; closed-room/back guards; locked order and 15-minute deadline from first payment; express payment → four delivery phases → completion; video route retained');
})().catch(e=>{console.error(e);process.exitCode=1});

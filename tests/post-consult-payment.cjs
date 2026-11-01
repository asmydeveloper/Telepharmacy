const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
let clock=1800000000000,created=0,saved=0;
class Clock extends Date {static now(){return clock;}}
const actions={},S={history:[],inbox:[],case:{id:'one',status:'room',msgs:[],symptoms:['cough'],joinedAt:'14:12'}};
const TP={S,sim:{},NOW:{date:'2026-11-01',time:'14:12'},casePlan:()=>({items:[{price:180}]}),emit(){},act:(k,f)=>actions[k]=f,branch:()=>({name:'Branch'}),cur:()=>({id:'history'}),refresh(){},banner(){},sheet:()=> 'checkout',notify(){},sheetOpen:()=>null,ensureCase(){created++;throw Error('Must not create a consultation during payment');},closeSheet:async()=>{},go(){},saveReceipt(){saved++;},paidMsg:()=> 'Paid'};
const context=vm.createContext({TP,C:()=>S.case,Date:Clock,Intl,setInterval(){},document:{querySelectorAll:()=>[]},ui:{},ic:()=>'',esc:String,now:()=> '14:12',console});
const run=(a,b)=>{assert(a>=0&&b>a);vm.runInContext(source.slice(a,b),context);};
run(source.indexOf('TP.ORDER_PAYMENT_MS='),source.indexOf('/* ---------- message html ---------- */',source.indexOf('TP.ORDER_PAYMENT_MS=')));
run(source.indexOf('TP.sim.closeCase ='),source.indexOf('TP.sim.idleWarn ='));
for(const by of ['ph','me','auto']){
 S.case={id:by,status:'room',msgs:[],symptoms:[],joinedAt:'14:12'};
 TP.makeOrder();const order=S.case.order,deadline=order.expiresAt;assert.equal(deadline-clock,900000);
 clock+=60000;TP.sim.closeCase(by);assert.equal(S.case.status,'closed');assert.equal(S.case.order,order);assert.equal(order.status,'pending');assert.equal(order.expiresAt,deadline);
 TP.sim.closeCase(by);assert.equal(S.history.filter(h=>h.id===by).length,1);
 actions.openOrderPayment(null,{params:{caseId:by}});assert.equal(S._paymentCase,S.case);assert.equal(order.expiresAt,deadline);
}
// Reopening checkout for an archived case must not replace the active chat or renew the deadline.
const archived=S.case;S.case={id:'new-chat',status:'room'};
actions.openOrderPayment(null,{params:{caseId:archived.id}});assert.equal(S._paymentCase,archived);
vm.runInContext('const C=()=>TP.S._paymentCase||TP.S.case;',context);
let a=source.indexOf('const ensureOrder ='),b=source.indexOf('\n',a);run(a,b);
assert(vm.runInContext('ensureOrder()',context));assert.equal(created,0);assert.equal(S.case.id,'new-chat');assert.equal(archived.status,'closed');
// Successful payment updates the archived order once without reopening either consultation.
vm.runInContext("const P=()=>({recv:'pickup',method:'qr'}),addr=()=>({}),totals=()=>({total:180});",context);
context.clearTimeout=()=>{};context.clearInterval=()=>{};
a=source.indexOf('async function paid()');b=source.indexOf('TP.payPaid = paid;',a);run(a,b);
(async()=>{
 await vm.runInContext('paid()',context);assert.equal(archived.order.status,'paid');assert.equal(archived.status,'closed');assert.equal(S.case.status,'room');assert.equal(saved,1);
 await vm.runInContext('paid()',context);assert.equal(saved,1);
 archived.order.status='pending';archived.order.expiresAt=clock+1;clock+=2;
 await vm.runInContext('paid()',context);assert.equal(archived.order.status,'expired');assert.equal(saved,1);
 assert.equal(vm.runInContext('ensureOrder()',context),false);assert.equal(archived.order.status,'expired');assert.equal(created,0);
 assert.equal(TP.expireOrder(archived),false);assert.equal(S.inbox.filter(n=>n.id==='order-expired-'+archived.order.no).length,1);
 console.log('PASS: 15-minute deadline, all closure actors, archived checkout, one-time payment and expiry guard');
})().catch(e=>{console.error(e);process.exitCode=1;});

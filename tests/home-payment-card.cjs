const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
// Home shows a closed chat's medicine order only while it can be paid; an expired order lives in history only.
const expired={id:'x',status:'closed',branch:'tw',order:{status:'expired',items:[{name:'A',price:10}],total:10}};
const payable={id:'p',status:'closed',branch:'tw',order:{status:'pending',items:[{name:'A',price:10}],total:10}};
const TP={expireOrder(){},orderPayable:o=>o.status==='pending',branch:()=>({name:'สาขา'}),pendingPaymentCase:S=>S.cases.find(c=>c.order.status==='pending'),orderCases:S=>S.cases,money:n=>'฿'+n,orderTime:()=>'12:15',orderRemaining:()=>'15:00',ui:{btn:t=>t,tag:t=>t,route:()=>''}};
const ctx=vm.createContext({TP,ic:()=>'',esc:String,ui:TP.ui});
const a=source.indexOf('TP.paymentReminderCard = (S,c,opt={}) => {'),b=source.indexOf("TP.act('openOrderPayment'",a);
vm.runInContext(source.slice(a,b),ctx);
assert.equal(TP.paymentReminderCard({cases:[expired]},null,{pendingOnly:true}),'','expired order card is hidden on home');
assert.notEqual(TP.paymentReminderCard({cases:[expired]}),'','consultation summary still shows the expired order');
assert.notEqual(TP.paymentReminderCard({cases:[payable]},null,{pendingOnly:true}),'','payable order still shows on home');
assert.equal((source.match(/paymentReminderCard\?\.\((view|cardState), null, \{ pendingOnly: true \}\)/g)||[]).length,2,'both home call sites hide expired orders');
console.log('PASS: home hides expired medicine orders; history summary and payable orders keep their card');

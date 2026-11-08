const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('public/runtime/customer.js', 'utf8');
const c = { id:'case-one', branch:'branch-one', pharmacistAdvice:'คำแนะนำที่บันทึกจริง', order:{no:'MT202610180001',items:[{name:'ยาจริง',qty:2,how:'วิธีใช้จริง'}],paid:{total:410,items:385,ship:25}} };
const h = {id:c.id,who:'me',date:'18/10/2026',time:'14:12',pharm:'kj',bought:385,_case:c};
const TP = {S:{case:c,family:[]},PHARM:{kj:{name:'เภสัชกร',lic:'123'}},branch:()=>({name:'สาขา'}),followDocLine:()=>'',fulfillmentInfo:()=>({done:false,title:'กำลังนำส่ง'}),orderNumber:()=>c.order.no,consultationText:()=> 'อาการที่บันทึกจริง',orderMedicineList:o=>o.items.map(m=>m.name+':'+m.qty+':'+m.how).join(''),paymentHistoryCard:o=>'ยอดชำระ '+o.order.paid.total,completedMedicationOrder:()=>false,receiptSumRow:()=> 'ใบเสร็จ',followSumCard:()=>''};
const ctx=vm.createContext({TP,esc:String,ic:()=>'',historyIdentity:()=>({name:'ผู้รับบริการ'}),sumOf:()=>({meds:[{name:'ยาเก่า'}],advice:['คำแนะนำเก่า']}),plusYear:()=>'',ui:{btn:s=>s},rateHtml:()=> 'ให้คะแนน',allHistory:()=>[h],caseItem:()=>h});
function load(from,to){vm.runInContext(source.slice(source.indexOf(from),source.indexOf(to,source.indexOf(from))),ctx);}
load('function docHtml(S, h, options = {})','function rateHtml(h)');
load('TP.historyDetailContent =',"TP.screen('summary',");
const active = TP.summaryForCase(c);
assert.equal(active,TP.historyDetailContent(TP.S,h),'live and history must render the identical shared content');
for(const text of ['MT202610180001','อาการที่บันทึกจริง','ยาจริง:2:วิธีใช้จริง','คำแนะนำที่บันทึกจริง','ยอดชำระ 410','ใบเสร็จ'])assert(active.includes(text),text);
assert(!active.includes('ยาเก่า'));assert(!active.includes('คำแนะนำเก่า'));
TP.fulfillmentInfo=()=>({done:true,pickup:false,title:'ส่งถึงแล้ว'});
const complete=TP.summaryForCase(c);
assert(complete.includes('จัดส่งสำเร็จแล้ว'));assert(!complete.includes('pd-status-card'));assert(!complete.includes('รหัสรับยา'));assert(!complete.includes('ติดตามไรเดอร์'));
console.log('PASS: shared history/live content, exact order medicines/advice/payment, completed delivery removes live tracking');

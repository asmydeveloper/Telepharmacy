const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s=fs.readFileSync('public/runtime/customer.js','utf8'),TP={S:{pay:null,addrs:[]}};
let order={items:[{name:'Medicine',qty:'1 pack',price:40,how:'Instructions'}]},c={order};
const ctx=vm.createContext({TP,C:()=>c,addrs:()=>TP.S.addrs,esc:String,ic:()=>'',hasCold:o=>(o?.items||[]).some(i=>i.cold)});
function line(prefix){const a=s.indexOf(prefix),b=s.indexOf('\n',a);assert(a>=0);vm.runInContext(s.slice(a,b),ctx);}
line('const recvKeys =');line('const P = () => {const p=TP.S.pay');
assert.deepEqual(Array.from(vm.runInContext('recvKeys()',ctx)),['pickup','express']);
for(const legacy of ['cold','invalid']){TP.S.pay={recv:legacy};assert.equal(vm.runInContext('P().recv',ctx),'pickup');}
TP.S.pay={recv:'parcel'};assert.equal(vm.runInContext('P().recv',ctx),'pickup');
TP.S.pay={recv:'express'};assert.equal(vm.runInContext('P().recv',ctx),'express');order.items[0].cold=true;assert.deepEqual(Array.from(vm.runInContext('recvKeys()',ctx)),['pickup']);assert.equal(vm.runInContext('P().recv',ctx),'pickup');
order.items[0].cold=false;order.recvOff={express:true,parcel:true};assert.deepEqual(Array.from(vm.runInContext('recvKeys()',ctx)),['pickup']);
TP.medicineImage=()=>'<img>';TP.money=n=>'THB '+n;line('TP.orderMedicineList =');const list=TP.orderMedicineList(order);for(const text of ['Medicine','1 pack','40','Instructions'])assert(list.includes(text));
const a=s.indexOf("TP.sheetDef('pay',"),b=s.indexOf('/* ---------- live updates',a),checkout=s.slice(a,b);
assert(checkout.includes('TP.orderMedicineDetails(o)'));assert(checkout.indexOf("sec(4, 'เลือกวิธีชำระเงิน')")<checkout.indexOf("sec(5, 'สรุปยอดชำระ')"));
assert(s.includes("if(!recvKeys().includes(t.dataset.v)"));
console.log('PASS: pickup/express only, legacy values normalized, cold/restricted guard, shared chat medicine list and review order');

ctx.structuredClone=structuredClone;TP.homeAddress=()=>TP.S.addrs[0];TP.S.addrs=[{id:'home',first:'A',last:'B',phone:'0812345678',house:'123',dist:'D',amp:'A',prov:'P',zip:'10170'},{id:'other',house:'999'}];line('const addr = () => {const c=C()');const snapshot=vm.runInContext('addr()',ctx);assert.equal(snapshot.house,'123');TP.S.addrs[0].house='changed';TP.S.pay={addr:'other',recv:'express'};assert.equal(vm.runInContext('addr().house',ctx),'123');line('const fmtAddr =');line('const fmtPhone =');const ca=s.indexOf('function cardsHtml() {'),cb=s.indexOf('\nconst fld =',ca);vm.runInContext(s.slice(ca,cb),ctx);const html=vm.runInContext('cardsHtml()',ctx);assert(html.includes('123'));assert(!html.includes('999'));assert(!html.includes('button'));assert(!checkout.includes('data-a="payAddrNew"'));assert(checkout.includes('fullPage:true'));console.log('PASS: checkout full page and selected home address snapshot remains read-only after saved addresses or payment selection change');

const structured={house:'88/12',building:'อาคารบี ห้อง 12',alley:'ทวีวัฒนา 25',road:'ถ.เลียบคลองทวีวัฒนา',dist:'ทวีวัฒนา',amp:'ทวีวัฒนา',prov:'กรุงเทพมหานคร',zip:'10170'};ctx.structuredAddress=structured;const formatted=vm.runInContext('fmtAddr(structuredAddress)',ctx);for(const k of ['house','building','alley','road'])assert(formatted.includes(structured[k]));assert(!formatted.includes('ถ.ถ.'));console.log('PASS: checkout address includes building, alley, road without duplicate street prefix');

ctx.totals=()=>({total:385});TP.PAY_MIN=1;TP.money=String;ctx.zoneStop=()=>false;ctx.isFar=()=>false;ctx.quoted=()=>true;TP.S.pay={recv:'express'};ctx.TPAddressMap={valid:()=>false};const ms=s.indexOf('function missing() {'),me=s.indexOf('function requote()',ms);vm.runInContext(s.slice(ms,me),ctx);assert.equal(vm.runInContext('missing()',ctx),'','express checkout does not require pin while map is paused');assert(!s.includes('data-address-map="checkout"'));

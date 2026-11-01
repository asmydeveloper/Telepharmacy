const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s=fs.readFileSync('public/runtime/customer.js','utf8'),TP={S:{pay:null,addrs:[]}};
let order={items:[{name:'Medicine',qty:'1 pack',price:40,how:'Instructions'}]},c={order};
const ctx=vm.createContext({TP,C:()=>c,addrs:()=>TP.S.addrs,esc:String,ic:()=>'',hasCold:o=>(o?.items||[]).some(i=>i.cold)});
function line(prefix){const a=s.indexOf(prefix),b=s.indexOf('\n',a);assert(a>=0);vm.runInContext(s.slice(a,b),ctx);}
line('const recvKeys =');line('const P = () => {const p=TP.S.pay');
assert.deepEqual(Array.from(vm.runInContext('recvKeys()',ctx)),['pickup','express']);
for(const legacy of ['parcel','cold','invalid']){TP.S.pay={recv:legacy};assert.equal(vm.runInContext('P().recv',ctx),'pickup');}
TP.S.pay={recv:'express'};assert.equal(vm.runInContext('P().recv',ctx),'express');order.items[0].cold=true;assert.deepEqual(Array.from(vm.runInContext('recvKeys()',ctx)),['pickup']);assert.equal(vm.runInContext('P().recv',ctx),'pickup');
order.items[0].cold=false;order.recvOff={express:true};assert.deepEqual(Array.from(vm.runInContext('recvKeys()',ctx)),['pickup']);
TP.medicineImage=()=>'<img>';TP.money=n=>'THB '+n;line('TP.orderMedicineList =');const list=TP.orderMedicineList(order);for(const text of ['Medicine','1 pack','40','Instructions'])assert(list.includes(text));
const a=s.indexOf("TP.sheetDef('pay',"),b=s.indexOf('/* ---------- live updates',a),checkout=s.slice(a,b);
assert(checkout.includes('TP.orderMedicineDetails(o)'));assert(checkout.indexOf("sec(3, 'เลือกวิธีชำระเงิน')")<checkout.indexOf("sec(4, 'สรุปยอดชำระ')"));
assert(s.includes("if(!recvKeys().includes(t.dataset.v)"));
console.log('PASS: pickup/express only, legacy values normalized, cold/restricted guard, shared chat medicine list and review order');

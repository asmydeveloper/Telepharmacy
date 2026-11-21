const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s=fs.readFileSync('public/runtime/customer.js','utf8'),TP={S:{pay:null,addrs:[]}};
let order={items:[{name:'Medicine',qty:'1 pack',price:40,how:'Instructions'}]},c={order};
const ctx=vm.createContext({TP,C:()=>c,addrs:()=>TP.S.addrs,esc:String,ic:()=>'',hasCold:o=>(o?.items||[]).some(i=>i.cold)});
function line(prefix){const a=s.indexOf(prefix),b=s.indexOf('\n',a);assert(a>=0);vm.runInContext(s.slice(a,b),ctx);}
line('const recvKeys =');line('const P = () => {const p=TP.S.pay');
assert.deepEqual(Array.from(vm.runInContext('recvKeys()',ctx)),['pickup','express','parcel']);
for(const legacy of ['cold','invalid']){TP.S.pay={recv:legacy};assert.equal(vm.runInContext('P().recv',ctx),'pickup');}
TP.S.pay={recv:'pickup',method:'bank',bank:'SCB'};
assert.equal(vm.runInContext('P().method',ctx),'bank');
assert.equal(vm.runInContext('P().bank',ctx),'SCB');
TP.S.pay={recv:'parcel'};assert.equal(vm.runInContext('P().recv',ctx),'parcel');
TP.S.storeOpen=false;
TP.S.pay={recv:'express'};
assert.deepEqual(Array.from(vm.runInContext('recvKeys()',ctx)),['pickup','parcel']);
assert.equal(vm.runInContext('P().recv',ctx),'pickup');
TP.S.storeOpen=true;
TP.S.pay={recv:'express'};assert.equal(vm.runInContext('P().recv',ctx),'express');order.items[0].cold=true;assert.deepEqual(Array.from(vm.runInContext('recvKeys()',ctx)),['pickup']);assert.equal(vm.runInContext('P().recv',ctx),'pickup');
order.items[0].cold=false;order.recvOff={express:true,parcel:true};assert.deepEqual(Array.from(vm.runInContext('recvKeys()',ctx)),['pickup']);
TP.medicineImage=()=>'<img>';TP.money=n=>'THB '+n;line('TP.orderMedicineList =');const list=TP.orderMedicineList(order);for(const text of ['Medicine','1 pack','40','Instructions'])assert(list.includes(text));
const a=s.indexOf("TP.sheetDef('pay',"),b=s.indexOf('/* ---------- live updates',a),checkout=s.slice(a,b);
assert(checkout.includes('TP.orderMedicineList(o)'));
const sections=['checkout-order-section','payRecvX','payAddrSec','checkout-delivery','checkout-payment','checkout-tax','checkout-reference','checkout-review'];
for (let i=1;i<sections.length;i++) assert(checkout.indexOf(sections[i-1])<checkout.indexOf(sections[i]),sections[i]);
assert(s.includes("if(!recvKeys().includes(t.dataset.v)"));
console.log('PASS: pickup/express/parcel, legacy values normalized, cold/restricted guard, shared chat medicine list and review order');

ctx.structuredClone=structuredClone;TP.homeAddress=()=>TP.S.addrs[0];TP.S.addrs=[{id:'home',first:'A',last:'B',phone:'0812345678',house:'123',dist:'D',amp:'A',prov:'P',zip:'10170'},{id:'other',house:'999'}];line('const addr = () => {const c=C()');const snapshot=vm.runInContext('addr()',ctx);assert.equal(snapshot.house,'123');TP.S.addrs[0].house='changed';TP.S.pay={addr:'other',recv:'express'};assert.equal(vm.runInContext('addr().house',ctx),'123');line('const fmtAddr =');line('const fmtPhone = s =>');const ca=s.indexOf('function cardsHtml() {'),cb=s.indexOf('\nconst fld =',ca);vm.runInContext(s.slice(ca,cb),ctx);const html=vm.runInContext('cardsHtml()',ctx);assert(html.includes('123'));assert(!html.includes('999'));assert(!html.includes('button'));assert(!checkout.includes('data-a="payAddrNew"'));assert(checkout.includes('fullPage:true'));console.log('PASS: checkout full page and selected home address snapshot remains read-only after saved addresses or payment selection change');

const structured={house:'88/12',building:'อาคารบี ห้อง 12',alley:'ทวีวัฒนา 25',road:'ถ.เลียบคลองทวีวัฒนา',dist:'ทวีวัฒนา',amp:'ทวีวัฒนา',prov:'กรุงเทพมหานคร',zip:'10170'};ctx.structuredAddress=structured;const formatted=vm.runInContext('fmtAddr(structuredAddress)',ctx);for(const k of ['house','building','alley','road'])assert(formatted.includes(structured[k]));assert(!formatted.includes('ถ.ถ.'));console.log('PASS: checkout address includes building, alley, road without duplicate street prefix');

ctx.totals=()=>({total:385});TP.PAY_MIN=1;TP.money=String;ctx.zoneStop=()=>false;ctx.isFar=()=>false;ctx.quoted=()=>true;TP.S.pay={recv:'express'};ctx.TPAddressMap={valid:()=>false};const ms=s.indexOf('function missing() {'),me=s.indexOf('function requote()',ms);vm.runInContext(s.slice(ms,me),ctx);assert.equal(vm.runInContext('missing()',ctx),'','express checkout does not require pin while map is paused');assert(!s.includes('data-address-map="checkout"'));

(async () => {
  delete order.recvOff;
  const actions={}, sheets={}, params={fromPay:true,scroll:215};
  let closed=0, quotes=0;
  TP.act=(name,fn)=>actions[name]=fn;
  TP.sheetDef=(name,def)=>sheets[name]=def;
  TP.sheetOpen=()=>({id:'checkoutaddress',ctx:{params}});
  TP.closeSheet=async()=>{closed++;};
  TP.orderPayable=record=>record.status==='pending';
  ctx.zoneStop=address=>address.id==='outside';
  ctx.requote=()=>{quotes++;};
  ctx.reopenCheckout=()=>{};
  ctx.ui={tag:label=>label};
  vm.runInContext(s.slice(s.indexOf('const checkoutAddressBlocked'),s.indexOf("TP.sheetDef('checkoutcoupon'")),ctx);
  order.status='pending';
  TP.S.addrs.push({id:'outside',house:'outside'});
  TP.S.pay={recv:'express',method:'bank',bank:'SCB',q:{key:'previous'}};
  assert.match(sheets.checkoutaddress.render({state:'normal',params}),/data-v="outside"\s+aria-pressed="false" disabled/);
  await actions.confirmCheckoutAddress({dataset:{v:'outside'}});
  assert.equal(closed,0);
  await actions.confirmCheckoutAddress({dataset:{v:'other'}});
  assert.equal(closed,1);
  assert.equal(quotes,1);
  assert.equal(c.deliveryAddress.id,'other');
  assert.notEqual(c.deliveryAddress,TP.S.addrs[1]);
  assert.equal(TP.S.pay.method,'bank');
  assert.equal(TP.S.pay.q,null);
  assert.equal(params.scroll,215);
  let editor, reopened;
  TP.S.st={};
  TP.go=(id,opts)=>{assert.equal(id,'addressedit');editor=opts.params;};
  TP.back=async()=>{};
  TP.sheet=async(id,opts)=>{reopened={id,opts};};
  await actions.checkoutAddAddress();
  await editor.onCheckoutReturn();
  assert.equal(reopened.id,'checkoutaddress');
  assert.equal(reopened.opts.scroll,215);
  assert.equal(TP.S.pay.bank,'SCB');
  order.status='expired';
  await actions.confirmCheckoutAddress({dataset:{v:'home'}});
  assert.equal(c.deliveryAddress.id,'other');
  console.log('PASS: choosing a checkout address re-quotes only the current order and preserves payment details');
})().catch(error=>{console.error(error);process.exitCode=1;});

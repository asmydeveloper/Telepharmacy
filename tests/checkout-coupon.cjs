const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('public/runtime/customer.js','utf8'),actions={};
let c={order:{total:385,status:'pending'}},p={method:'promptpay'},ship=0,expired=0,syncs=0;
const input={value:'',focus(){}};
const TP={PAY_MIN:1,CARD_FEE:.0365,act:(id,fn)=>actions[id]=fn,money:n=>'฿'+n,icons(){},orderPayable:o=>o?.status==='pending',orderExpiryTick:()=>expired++};
const ctx=vm.createContext({TP,C:()=>c,P:()=>p,shipFee:()=>ship,r2:n=>Math.round(n*100)/100,esc:String,ic:()=>'',sync:()=>syncs++,$:s=>s==='#payCoupon'?input:null});
const start=source.indexOf('/* Preview-only promotion fixtures.'),end=source.indexOf('/* what still stops payment',start);
vm.runInContext(source.slice(start,end),ctx);
function totals(){return vm.runInContext('totals()',ctx)}
input.value=' test50 ';actions.payCouponApply();assert.equal(c.order.discount.code,'TEST50');assert.equal(totals().total,335);assert.equal(totals().discount,50);
actions.payCouponApply();assert.equal(totals().total,335,'repeated apply does not stack discounts');
ship=89;p.method='card';assert.equal(totals().fee,15.48);assert.equal(totals().total,439.48,'delivery remains full price and fee uses discounted subtotal');
assert(vm.runInContext('couponHtml()',ctx).includes('readonly'));actions.payCouponRemove();assert.equal(totals().discount,0);assert.equal(totals().total,491.30);
for(const [code,error] of [['','กรุณากรอก'],['@@@','3–32'],['WRONGCODE','ไม่พบ'],['EXPIRED50','หมดอายุ']]){input.value=code;actions.payCouponApply();assert(p.couponError.includes(error));assert.equal(totals().discount,0);}
input.value='TEST50';actions.payCouponApply();c.order.total=40;assert.equal(totals().discount,0,'changing medicine subtotal invalidates earlier discount');actions.payCouponApply();assert(p.couponError.includes('100 บาท'));
c={order:{total:385,status:'pending'}};vm.runInContext('couponState()',ctx);assert.equal(p.couponDraft,'');assert.equal(p.couponError,'');assert.equal(totals().discount,0,'new order never inherits prior discount');
c.order.status='expired';input.value='TEST50';actions.payCouponApply();assert.equal(expired,1);assert(!c.order.discount,'expired orders cannot accept coupons');
assert(!source.includes('หากต้องการแก้รายการยา กรุณาสอบถามเภสัชกรก่อนชำระ'));assert(source.includes('pd.discount||0'));
console.log('PASS: coupon normalization, non-stacking, remove, validation, expiry, minimum, changed order, shipping/card totals and receipt discount');

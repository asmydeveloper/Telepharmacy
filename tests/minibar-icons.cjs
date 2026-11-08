const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
const S={case:{status:'queue',pos:2,branch:'tw',pharm:'kj'}};
const TP={S,cur:()=>({id:'history'}),branch:()=>({name:'ร้านตัวอย่าง',short:'สาขาตัวอย่าง'}),PHARM:{kj:{short:'ภญ.ตัวอย่าง'}}};
const context=vm.createContext({TP,C:()=>S.case,ph:()=>TP.PHARM.kj});
const start=source.indexOf('TP.miniInfo = () => {'),end=source.indexOf('\n};',start)+3;
vm.runInContext(source.slice(start,end),context);
for(const [status,extra,expected] of [['queue',{pos:2},'waiting'],['queue',{pos:1},'waiting'],['paused',{},'paused'],['room',{},'chat'],['room',{idle:true},'reply'],['room',{order:{status:'pending'}},'payment']]){
 S.case={status,branch:'tw',pharm:'kj',...extra};const info=TP.miniInfo();assert.equal(info.icon,expected);assert(['room','queue'].includes(info.go));

}
for (const tab of ['history','inbox','account']) {
 TP.cur=()=>({id:tab});
 for (const recv of ['pickup','express','parcel']) {
  for (const stage of ['', 'ready', 'calling', 'delivering', 'delivered']) {
   S.case={status:'closed',branch:'tw',order:{status:'paid',paid:{recv,stage}}};
   assert.equal(TP.miniInfo(),null,`${tab}/${recv}/${stage}: paid orders never show a minibar`);
  }
 }
 S.case={status:'closed',branch:'tw',order:{status:'pending'}};
 assert.equal(TP.miniInfo().icon,'payment');
 S.case={status:'closed',branch:'tw',order:{status:'expired'}};
 assert.equal(TP.miniInfo(),null);
}
vm.runInContext(source.match(/function miniWanted\(\) \{[^\n]+/)[0],context);
S.case={status:'closed',order:{status:'paid',fulfillment:{status:'preparing'}}};
assert.equal(vm.runInContext('miniWanted()',context),false,'No reserved minibar space after payment');
S.case={status:'closed',order:{status:'pending'}};
assert.equal(vm.runInContext('miniWanted()',context),true);
TP.cur=()=>({id:'home'});assert.equal(TP.miniInfo(),null);
assert(!source.includes("mini.innerHTML = `${TP.brand.halo"));
const iconStart=source.indexOf('TP.miniStatusIcon = kind => {'),iconEnd=source.indexOf('\n};',iconStart)+3;
vm.runInContext(source.slice(iconStart,iconEnd),context);
const icons=['waiting','paused','chat','reply','payment'].map(kind=>TP.miniStatusIcon(kind));
assert.equal(new Set(icons).size,5);
icons.forEach(svg=>{assert(svg.includes('viewBox="0 0 32 32"'));assert(svg.includes('stroke="currentColor"'));});
assert(!source.includes('mountMiniAnimation'));
assert(!source.includes('/vendor/lottie/'));
const css=fs.readFileSync('src/styles/components.css','utf8');
assert(css.includes('mb-status-breathe'));assert(/prefers-reduced-motion:\s*reduce/.test(css));
console.log('PASS: all six minibar states, original SVG icons, no Lottie loading, reduced motion and home exclusion');

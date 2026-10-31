const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
const S={case:{status:'queue',pos:2,branch:'tw',pharm:'kj'}};
const TP={S,cur:()=>({id:'history'}),branch:()=>({name:'ร้านตัวอย่าง',short:'สาขาตัวอย่าง'}),PHARM:{kj:{short:'ภญ.ตัวอย่าง'}}};
const context=vm.createContext({TP,C:()=>S.case,ph:()=>TP.PHARM.kj});
const start=source.indexOf('TP.miniInfo = () => {'),end=source.indexOf('\n};',start)+3;
vm.runInContext(source.slice(start,end),context);
for(const [status,extra,expected] of [['queue',{pos:2},'waiting'],['queue',{pos:1},'waiting'],['paused',{},'paused'],['room',{},'chat'],['room',{idle:true},'reply'],['room',{order:{status:'pending'}},'payment']]){
 S.case={status,branch:'tw',pharm:'kj',...extra};const info=TP.miniInfo();assert.equal(info.icon,expected);assert(['room','queue'].includes(info.go));
 const data=JSON.parse(fs.readFileSync('public/assets/lottie/'+expected+'-white.json','utf8'));
 assert(data.layers.length>0);assert(data.op>data.ip);assert(!data.assets?.some(a=>a.p),'no raster or external assets');
 const visit=x=>{if(Array.isArray(x))x.forEach(visit);else if(x&&typeof x==='object'){if(['fl','st'].includes(x.ty)&&x.c?.a===0)assert.deepEqual(x.c.k.slice(0,3),[1,1,1]);Object.values(x).forEach(visit);}};visit(data);
}
TP.cur=()=>({id:'home'});assert.equal(TP.miniInfo(),null);
assert(!source.includes("mini.innerHTML = `${TP.brand.halo"));
assert(fs.statSync('public/vendor/lottie/lottie_light.min.js').size>10000);
console.log('PASS: all six minibar states, white vector assets, local player and home exclusion');

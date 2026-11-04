const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('public/runtime/customer.js','utf8');
const code = source.slice(source.indexOf('function followDisplayPlans(ctx)'), source.indexOf("TP.act('fuMultiTake'"));
const plan = {on:true,src:{id:'real-case',note:'ข้อความที่กรอกจริง'},days:5,today:3,times:{am:'08:00'},log:{'3|am|one':{t:'08:20'}},meds:[{id:'one',name:'ยาตัวแรก',dose:'ครั้งละ 1 เม็ด',slots:['am']},{id:'two',name:'ยาตัวที่สอง',dose:'ครั้งละ 2 เม็ด',slots:['am']}]};
const actions = {};
const context = vm.createContext({F:()=>plan,dateOf:()=> '20/10/2026',followPreviewPlans:()=>[{id:'preview-case',note:'ตัวอย่าง',days:4,today:1,date:'18/10/2026',med:plan.meds[0]}],SLOTS:['am'],SLOT:{am:['เช้า','sunrise']},multiReminderSettings:()=>({times:{am:'08:00'}}),lk:(d,s,m)=>`${d}|${s}|${m.id}`,esc:s=>String(s||''),ic:()=>'',TP:{act:(id,fn)=>actions[id]=fn,refresh:()=>Promise.resolve(),cur:()=>null,consultationHistory:s=>s.history||[],caseCode:()=> 'MR001',consultationText:p=>p.note,medicineImage:()=>'<img>'},ui:{route:r=>`data-source="${r.p.id}"`,btn:(label,o)=>`<button>${label}</button>`},addD:()=> '21/10/2026',allHistory:s=>s.history||[],toD:s=>new Date(String(s).split('/').reverse().join('-')),prnRow:()=>''});
const render = (state,params={})=>vm.runInContext(`followMultiHtml(${JSON.stringify({state,params,S:{history:[]}})})`,context);
vm.runInContext(code,context);
const meal=render('normal');
assert.match(meal,/fu-multi-card/);
assert.match(meal,/บันทึกแล้ว 1 จาก 2 รายการ/);
assert.match(meal,/ครั้งละ 2 เม็ด/);
assert.match(meal,/data-a="fuTake" data-v="3\|am"/);
assert.match(meal,/data-source="real-case"/);
assert.doesNotMatch(meal,/preview-case|fu-hero|multiLog/);
const info=render('normal',{medInfo:true});
assert.match(info,/fu-multi-plan/);
assert.match(info,/เหลือ 3 วัน/);
assert.match(info,/ข้อความที่กรอกจริง/);
assert.match(info,/ยาตัวแรก/);assert.match(info,/ยาตัวที่สอง/);
assert.match(info,/ยาที่ใช้อยู่/);assert.match(info,/ประวัติการใช้ยา/);
assert.match(info,/ยังไม่มีประวัติการใช้ยา/);
const history=[
 {id:'old-case',date:'01/10/2026',who:'me',note:'อาการเดิม',previewSummary:{meds:[{name:'ยาเดิม',how:'ใช้ตามฉลากเดิม'}]}},
 {id:'real-case',who:'me',previewSummary:{meds:[{name:'ห้ามซ้ำ'}]}},
 {id:'family-case',who:'mother',previewSummary:{meds:[{name:'ยาของคนอื่น'}]}},
 {id:'no-snapshot',who:'me',bought:100}
];
context.history=history;
const grouped=vm.runInContext("followMedicationSections({state:'normal',params:{medInfo:true},S:{history}})",context);
assert.match(grouped,/ยาเดิม/);assert.match(grouped,/ใช้ตามฉลากเดิม/);
assert.match(grouped,/เคยได้รับ/);
assert.doesNotMatch(grouped,/ห้ามซ้ำ|ยาของคนอื่น|ทานครบแล้ว/);
plan.on=false;
const stopped=render('normal',{medInfo:true});
assert.match(stopped,/ยังไม่มีรายการยาที่ใช้อยู่/);assert.match(stopped,/หยุดติดตามแล้ว/);
plan.on=true;
const tabContext={params:{medInfo:true,multiLog:{am:true}}};
actions.fuMedInfoTab({dataset:{v:'history'}},tabContext);
assert.equal(tabContext.params.medInfoTab,'history');
assert.equal(tabContext.params.multiLog.am,true);
const historySelected=render('normal',{medInfo:true,medInfoTab:'history'});
assert.match(historySelected,/id="fuMedTab-history"[^>]*aria-selected="true"/);
assert.match(historySelected,/id="fuMedPanel-current"[^>]*hidden/);
assert.doesNotMatch(historySelected,/id="fuMedPanel-history"[^>]*hidden/);
actions.fuMedInfoTab({dataset:{v:'bad'}},tabContext);
assert.equal(tabContext.params.medInfoTab,'history');
const preview=render('multi-plan');
assert.match(preview,/data-a="fuMultiTake"/);
assert.match(preview,/data-source="preview-case"/);
assert.equal(Object.keys(plan.log).length,1);
console.log('PASS: shared approved meal and case layouts, real medication directions/counts and actions, preview isolation');

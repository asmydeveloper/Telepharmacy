const fs=require('node:fs'),vm=require('node:vm');
const consultation=require('../public/runtime/consultation-data.js');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
function harness(){
 const screens={},actions={},simulations={},calls=[],elements={};
 const S={user:{name:'สมใจ',full:'สมใจ ใจดี',allergies:['แอสไพริน'],allergyState:'set'},family:[{id:'mom',name:'บุญเรือน ใจดี',rel:'แม่',allergies:['เพนิซิลลิน']},{id:'kid',name:'ข้าวหอม ใจดี',rel:'ลูก',allergies:[]}],branch:'tw',history:[{id:'self-old',who:'me',topic:'ไข้ ไอ',note:'ไข้ ไอ เป็นมา 2 วัน',date:'02/10/2026',time:'10:00',pharm:'kj',branch:'tw',bought:120,meds:[{name:'พาราเซตามอล 500 มก.'}]},{id:'mom-visit',who:'mom',topic:'ถามเรื่องยา',date:'12/04/2026',time:'16:22',pharm:'kj',branch:'tw',bought:100,meds:[{name:'ยาประจำของแม่'}]},{id:'kid-visit',who:'kid',topic:'ผื่น คัน',date:'14/09/2026',time:'10:05',pharm:'kj',branch:'tw',bought:0,meds:[]},{id:'self-new',who:'me',topic:'ปวดหัว',date:'03/10/2026',time:'12:00',pharm:'kj',branch:'tw',bought:0,meds:[]}],case:null,st:{},storeOpen:true,inbox:[],intake:{}};
 const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
 const ui={nav:()=>'',page:s=>s,dock:(s,o={})=>s+(o.note||''),btn:(label,o={})=>`<button data-a="${o.a||''}" ${o.disabled?'disabled':''}>${label}</button>`,av:n=>`<span>${esc(n)}</span>`,tag:(s,t)=>`<span class="tag ${t}">${s}</span>`,route:o=>`data-go="${o.go}" data-p="${esc(JSON.stringify(o.p||{}))}"`,field:o=>`<label>${o.label}<input id="${o.id}" value="${esc(o.value)}"></label>`,chips:()=>'',seg:()=>'',note:s=>`<aside>${s}</aside>`,skel:()=>'<div>loading</div>',group:s=>s.join(''),row:()=>'',empty:o=>o.title,chipVals:()=>[]};
 const TP={caseCode:consultation.codeFor,consultationText:consultation.description,S,healthConsentNeeded:s=>!s.consent,PHARM:{kj:{short:'ภญ.ขวัญใจ',name:'ขวัญใจ',ini:'ข'}},NOW:{date:'31/10/2026',time:'19:00'},SCREENS:screens,profileImage:()=>'',branch:()=>({photo:'/assets/stores/pharmacy-thumbnail-v1.png',name:'สาขาตลาดเวิลด์',short:'ตลาดเวิลด์',pharm:'kj',phone:'020000000'}),screen:(id,def)=>screens[id]=def,sheetDef:(id,def)=>screens[id]=def,sheet:(...args)=>calls.push(args),act:(id,fn)=>actions[id]=fn,simAction:s=>simulations[s.id]=s,cur:()=>({id:'adr',params:{},el:{}}),refresh:()=>Promise.resolve(),emit:()=>{},fresh:()=>({history:JSON.parse(JSON.stringify(S.history))}),flag:()=>true,setFlag:()=>{},wait:()=>Promise.resolve(),go:(...args)=>calls.push(args),notify:()=>{},banner:()=>{},live:()=>{},icons:()=>{},medicineImage:m=>m.name.includes('พารา')?'<img alt="ภาพประกอบ">':'',followHistRow:()=>'',receiptHistRow:h=>h.bought?`<button data-id="${h.id}">ใบเสร็จ</button>`:'',orderReadyRow:()=>''};
 const env={TP,ui,esc,ic:()=>'<svg></svg>',iniOf:()=>'',first:s=>s.split(' ')[0],backL:s=>s,curEl:()=>({}),allHistory:s=>s.history,sumOf:h=>({meds:h.meds}),caseOpen:()=>!!S.case&&S.case.status!=='closed',closedCase:()=>({id:'active',who:'me',symptoms:['ไอ'],status:'closed',order:{status:'paid',total:120}}),MON:['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'], $:sel=>elements[sel],$$:()=>[],rvHtml:(id,on,html)=>`<div id="${id}" ${on?'':'inert'}>${html}</div>`,rv:()=>{},RM:()=>true,setTimeout,personOf:who=>who==='me'?S.user:S.family.find(f=>f.id===who),openNote:()=>{},URL,Date};
 TP.consultationIdentity=record=>`<div class="consultation-identity"><b>รหัสเคส ${esc(TP.caseCode(record))}</b><p>${esc(TP.consultationText(record)||'ไม่มีข้อความอาการที่บันทึกไว้')}</p></div>`;
 env.MAX_FAMILY=6;
 const extraStart=source.indexOf('const EXTRA_FAMILY = '),extraEnd=source.indexOf('function memRow(',extraStart);
 const context=vm.createContext(env);vm.runInContext(source.slice(source.indexOf('TP.previewInbox ='),source.indexOf('TP.fresh =')),context);vm.runInContext(source.slice(extraStart,extraEnd),context);
 const initialFamily=JSON.parse(JSON.stringify(S.family));TP.fresh=()=>({addrs:[{id:'a1',house:'88/12',dist:'ทวีวัฒนา',amp:'ทวีวัฒนา',prov:'กรุงเทพมหานคร',zip:'10170',main:true}],family:JSON.parse(JSON.stringify(initialFamily)),history:JSON.parse(JSON.stringify(S.history))});
 const healthAdapterStart=source.indexOf('TP.healthRecord ='),healthAdapterEnd=source.indexOf('\n};',healthAdapterStart)+3;vm.runInContext(source.slice(healthAdapterStart,healthAdapterEnd),context);
 TP.esc=esc;TP.ic=env.ic;TP.brand={halo:()=>'<svg></svg>'};TP.demoProfiles={};TP.$$=()=>[];TP.$=env.$;
 const uiStart=source.indexOf('(() => {',source.indexOf('/* ===== 20-ui.js ===== */'));
 const uiEnd=source.indexOf('})();',uiStart)+5;
 vm.runInContext(source.slice(uiStart,uiEnd),context);env.ui=TP.ui;env.brand=TP.brand;
 const historySourceStart=source.indexOf('function caseItem(c)'),historySourceEnd=source.indexOf('function sumOf(h)',historySourceStart);vm.runInContext(source.slice(historySourceStart,historySourceEnd),context);
 const a=source.indexOf('/* Patient identity is explicit'),b=source.indexOf('const ADR_SYM',a);vm.runInContext(source.slice(a,b),context);
 const end=source.indexOf('/* =====================================================================',source.indexOf("id: 'afAdrReply'",b));vm.runInContext(source.slice(b,end),context);
 const dateStart=source.indexOf('function inboxDate('),dateEnd=source.indexOf('function openNote(',dateStart);
 vm.runInContext(source.slice(dateStart,dateEnd),context);
 return {S,TP,ui,screens,actions,simulations,calls,elements,context,run:s=>vm.runInContext(s,context)};
}
module.exports={harness,source};

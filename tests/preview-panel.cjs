const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
const manifest=JSON.parse(fs.readFileSync('design-system/screens/start/C102.json','utf8'));
const loginStates=vm.runInNewContext(source.match(/TP\.screen\('login', \{[\s\S]*?states:(\[[^\n]+\]),/)[1]);
const defs={login:{group:'start',code:'C102',title:'Login',states:loginStates},profile:{group:'start',code:'C105',title:'Signup'},home:{group:'before',code:'C201',title:'Home',states:[['normal','N'],['case-queue3','Q3'],['case-chat','Chat']]},registrationexit:{code:'C106',hidden:true,host:'profile'}};
let id='login',sheet=null,filled=0,mockable=false;const events={},prepared=[];
const panel={querySelectorAll:()=>[],querySelector:()=>null,addEventListener:(name,fn)=>events[name]=fn,getBoundingClientRect:()=>({top:0}),clientHeight:0,classList:{toggle(){},contains:()=>false},innerHTML:'',scrollTop:40};
const TP={S:{st:{}},SCREENS:defs,ORDER:Object.keys(defs),GROUPS:[['start','Start'],['before','Before']],brand:{logo:()=>''},def:k=>defs[k],sheetOpen:()=>sheet,cur:()=>({id,ctx:{params:{}}}),codeOf:k=>defs[k].code,stateOf:k=>TP.S.st[k]||defs[k].states?.[0]?.[0]||'normal',icons(){},prepState:d=>prepared.push(d),refresh(){},registrationPreview:{canFill:()=>mockable,fillCurrent:()=>filled++},casePreview:{playChat:k=>played.push(k)}};
const played=[],ran=[],SIM=[];
const context={TP,panel,SIM,badge:{innerHTML:''},fabCode:null,fab:{addEventListener(){},setAttribute(){},focus(){}},$:()=>null,esc:s=>String(s??''),ic:()=>'',tapped:null,anchorOf:()=>null,holdAnchor(){},keyOf:()=>'',document:{documentElement:{classList:{contains:()=>false}}},CSS:{escape:s=>s}};
vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('TP.previewEventPolicy='),source.indexOf('/* ===== End preview event metadata ===== */')),context);
const panelBody=source.slice(source.indexOf('/* ===== 40-panel.js'),source.indexOf("TP.on('screen', render);"));
vm.runInContext(panelBody.slice(panelBody.indexOf('const GLOBAL = ['),panelBody.indexOf('/* review codes (owner')),context);
vm.runInContext("function codeTag(code){return code?`<span>${code}</span>`:''}\nvar byCode=(a,b)=>(TP.def(a).code||'').localeCompare(TP.def(b).code||'');",context);
vm.runInContext(panelBody.slice(panelBody.indexOf('TP.previewAutofill={')),context);
const click=(pn,k)=>events.click({target:{closest:()=>({dataset:k==null?{pn}:{pn,k}})}});

context.render();
const codes=[...panel.innerHTML.matchAll(/data-pn="state"[^>]*><b class="pn-sc">([^<]+)</g)].map(m=>m[1]);
assert.deepEqual(codes,manifest.cases.map(c=>c.code));assert.equal(codes[0],'C102.1');assert.equal(codes.at(-1),'C102.14');
console.log('PASS: login panel lists visible login codes including filled and service errors, matching the screen manifest');

for(const text of ['จอนี้','ลองสถานะของจอนี้','ทั้งแอป','ไปจอ · ทั้งหมด 3 จอ','data-pn="jump" data-k="home"','data-pn="g" data-k="storeOpen"','data-pn="restart"','pn-foot'])assert(panel.innerHTML.includes(text),text);
assert(!panel.innerHTML.includes('data-k="registrationexit"'));for(const text of ['pnMainFlow','pnAutofill','EV-GLOBAL-'])assert(!panel.innerHTML.includes(text),text);
assert.match(fs.readFileSync('src/app/Shell.jsx','utf8'), /id:\s*['"]codeBadge['"],\s*['"]aria-hidden['"]:\s*['"]true['"]/);
console.log('PASS: panel has the reference sections, a code badge and no sidebar controls');

id='profile';context.render();assert(!panel.innerHTML.includes('ลองสถานะของจอนี้'));assert(context.badge.innerHTML.includes('C105'));
sheet={id:'registrationexit',def:defs.registrationexit,ctx:{params:{}}};context.render();assert(panel.innerHTML.includes('Signup'));sheet=null;
id='home';context.render();assert(panel.innerHTML.includes('data-k="case-chat"'));assert(!panel.innerHTML.includes('data-k="case-queue3"'));
console.log('PASS: panel follows the open screen, hosted sheets and hidden retired cases');

(async()=>{
 id='login';await click('state','error');assert.equal(TP.S.st.login,'error');assert.equal(prepared.at(-1),defs.login);
 context.render();assert(panel.innerHTML.includes('data-k="error" aria-pressed="true"'));
 SIM.push({id:'accept',label:'รับคิว',when:()=>true,run:()=>ran.push('accept')},{id:'order',label:'ส่งยา',when:()=>true,run:()=>ran.push('order')},{id:'off',label:'ซ่อน',when:()=>false,run:()=>ran.push('off')});
 context.render();assert(panel.innerHTML.includes('class="pn-btn ph" data-pn="sim" data-k="accept"'));assert(!panel.innerHTML.includes('data-k="off"'));
 await click('sim','accept');await click('sim','order');await click('sim','off');assert.deepEqual(ran,['accept']);assert.deepEqual(played,['payment']);
 SIM.length=0;mockable=true;context.render();assert(panel.innerHTML.includes('data-pn="mock"'));await click('mock');assert.equal(filled,1);
 console.log('PASS: state, simulation and mock buttons dispatch from the right panel');
 const videoDefault=source.match(/TP\.screen\('video', \{\s*previewDefaultState: '([^']+)'/)[1];
 defs.video={code:'C306',previewDefaultState:videoDefault};
 const jumps=[];TP.jump=k=>jumps.push([k,TP.S.st[k]]);
 TP.S.st.video='on';await click('jump','video');
 assert.deepEqual(jumps.at(-1),['video','waiting-provider']);
 await events.click({target:{closest:()=>({dataset:{pn:'jump-state',k:'video',state:'on'}})}});
 assert.deepEqual(jumps.at(-1),['video','on']);
 console.log('PASS: C306 main jump opens waiting cover while explicit active-call selection stays available');
})().catch(e=>{console.error(e);process.exitCode=1});

context.Event=class{constructor(type){this.type=type}};
const field=(id,value='',type='text')=>({id,value,type,dataset:{},closest:()=>null,dispatchEvent(e){(this.events||=[]).push(e.type)}});
const mail=field('loginEmail');TP.previewAutofill.fill({querySelectorAll:()=>[mail]},{});assert.equal(mail.value,'');
console.log('PASS: autofill stays off without a toggle');

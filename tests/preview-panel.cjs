const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
const defs={login:{group:'start',code:'C102',title:'Login',states:[['normal','Normal'],['error','Error']]},profile:{group:'start',code:'C105',title:'Signup'},home:{group:'before',code:'C201',title:'Home'},history:{group:'after',code:'C403',title:'History'},hidden:{group:'start',hidden:true}};
let id='login',sheet=null;const events={},jumps=[],panel={querySelectorAll:()=>[],addEventListener:(name,fn)=>events[name]=fn,innerHTML:'',scrollTop:40};
let mounts=0,cleanups=0;
const TP={mountDesignSelects(root,ctx){assert.equal(root,panel);mounts++;ctx.onLeave(()=>cleanups++);},S:{st:{}},SCREENS:defs,ORDER:Object.keys(defs),GROUPS:[['start','Start'],['before','Before'],['after','After']],def:k=>defs[k],sheetOpen:()=>sheet,cur:()=>({id,ctx:{params:{}}}),codeOf:k=>defs[k].code,stateOf:()=> 'normal',brand:{logo:()=>''},icons(){},jump:k=>jumps.push(k)};
const context={TP,panel,anchorOf:()=>null,holdAnchor(){},byCode:(a,b)=>defs[a].code.localeCompare(defs[b].code),codeTag:x=>x,SIM:[],GLOBAL:[],badge:null,fabCode:null,esc:s=>String(s||''),ic:()=>'',tapped:null};vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('TP.previewEventPolicy='),source.indexOf('/* ===== End preview event metadata ===== */')),context);
const start=source.indexOf('function render() {',source.indexOf('function holdAnchor'));
const end=source.indexOf("panel.addEventListener('click', async",start);
vm.runInContext(source.slice(source.indexOf('const PREVIEW_MAIN='),source.indexOf('/* Preview-only data adapter:')),context);
const adapterStart=source.indexOf('TP.previewAutofill={');
vm.runInContext(source.slice(adapterStart,start),context);
vm.runInContext(source.slice(start,end),context);
context.render();assert(panel.innerHTML.includes('data-k="login"'));assert(!panel.innerHTML.includes('data-k="profile"'));assert(!panel.innerHTML.includes('data-k="home"'));assert(!panel.innerHTML.includes('data-k="hidden"'));assert(panel.innerHTML.includes('data-panel-section="states"'));
id='home';context.render();assert(panel.innerHTML.includes('data-k="home"'));assert(!panel.innerHTML.includes('data-k="login"'));assert(panel.innerHTML.includes('value="home" selected'));
sheet={id:'profile',def:defs.profile,ctx:{params:{}}};context.render();assert(panel.innerHTML.includes('data-k="profile"'));assert(!panel.innerHTML.includes('data-k="login"'));
events.change({target:{id:'pnMainFlow',value:'history'}});assert.equal(jumps.at(-1),'history');assert.equal(panel.scrollTop,0);
events.change({target:{id:'unrelated',value:'start'}});assert.equal(jumps.length,1);
console.log('PASS: contextual panel filters by current screen/sheet flow, hides unrelated/hidden destinations and navigates Main selector');

// Auto mode fills only empty supported form fields; dispatches normal input events.
context.Event=class{constructor(type){this.type=type}};
const field=(id,value='',type='text')=>({id,value,type,dataset:{},closest:()=>null,dispatchEvent(e){(this.events||=[]).push(e.type)}});
const mail=field('loginEmail'),existing=field('phIn','0899999999'),search=field('ikNote','','search'),code=field('authCode'),note=field('ikNote');
const root={querySelectorAll:()=>[mail,existing,search,code,note]};
TP.previewAutofill.fill(root,{});assert.equal(mail.value,'');
TP.previewAutofill.enabled=true;TP.previewAutofill.fill(root,{});
assert.equal(mail.value,'somjai@example.com');assert.equal(existing.value,'0899999999');assert.equal(search.value,'');assert.equal(code.value,'');assert(note.value);assert.deepEqual(mail.events,['input','change']);
events.change({target:{id:'pnAutofill',checked:false}});assert.equal(TP.previewAutofill.enabled,false);
console.log('PASS: autofill toggle, empty-only fill, retained edits and excluded search/OTP fields');

TP.previewAutofill.enabled=true;TP.S._authFlows={email:{challenge:{expected:'482913',expiresAt:Date.now()+60000,attempts:0,used:false}}};
const otp=field('authCode');TP.previewAutofill.fill({querySelectorAll:()=>[otp]},{id:'loginemail'});assert.equal(otp.value,'482913');
const next=field('authCode');TP.S._authFlows.email.challenge.expected='615204';TP.previewAutofill.fill({querySelectorAll:()=>[next]},{id:'loginemail'});assert.equal(next.value,'615204');
const expired=field('authCode');TP.S._authFlows.email.challenge.expiresAt=0;TP.previewAutofill.fill({querySelectorAll:()=>[expired]},{id:'loginemail'});assert.equal(expired.value,'');
console.log('PASS: autofill uses current mock OTP challenge, follows resend and does not bypass expired codes');

assert.equal((panel.innerHTML.match(/<option value=/g)||[]).length,8);console.log('PASS: eight requested main pages and separate signup navigation');

assert(mounts>=3);assert.equal(cleanups,mounts-1);console.log('PASS: themed Main select mounts and cleans up handlers on each panel redraw');

id='login';sheet=null;context.render();assert(panel.innerHTML.includes('EV-C102-normal'));assert(panel.innerHTML.includes('เหตุการณ์ของหน้านี้'));assert(panel.innerHTML.includes('EV-GLOBAL-001'));assert(!panel.innerHTML.includes('pn-event-guide'));assert(!panel.innerHTML.includes('pn-event-search'));assert(panel.innerHTML.includes('<section class="pn-sec pn-page-events"')); console.log('PASS: page-specific event IDs, global event section and plain expanded event list');

context.badge={classList:{toggle(){}},innerHTML:''};context.SIM.push({id:'accept',label:'รับคิว',when:()=>true,run(){}});context.render();assert(context.badge.innerHTML.includes('data-preview-sim="accept"'));assert(!panel.innerHTML.includes('จำลองฝั่งเภสัชกร'));assert(panel.innerHTML.includes('data-panel-section="flow" ><summary>'));context.SIM.length=0;context.badge=null;
(async()=>{
 const match=source.match(/TP.casePreview = \{\s*states: (\[[^\n]+\]),/);TP.casePreview={states:vm.runInContext(match[1],context)};
 const homeMatch=source.match(/TP.screen\('home', \{[\s\S]*?states: (\[[^\n]+\]),/);defs.home.states=vm.runInContext(homeMatch[1],context);
 id='home';sheet=null;context.render();const html=panel.innerHTML;
 const visible=TP.casePreview.states.filter(([key])=>!['queue3','queue2'].includes(key));
 for(const [key] of visible)assert(html.includes(`data-k="case-${key}"`),key);
 assert(!html.includes('data-k="case-queue3"'));assert(!html.includes('data-k="case-queue2"'));assert(!source.includes('role="group" aria-label="จำลองสถานะการปรึกษา"'),'left sidebar group removed');
 context.document={documentElement:{classList:{contains:()=>false}}};context.keyOf=()=>'';
 let prepared=[],refreshes=0;TP.prepState=()=>prepared.push(TP.S.st.home);TP.refresh=()=>refreshes++;
 const clickStart=source.indexOf("panel.addEventListener('click', async",source.indexOf('function holdAnchor'));
 vm.runInContext(source.slice(clickStart,source.indexOf('/* start the app again;',clickStart)),context);
 for(const [key] of visible){await events.click({target:{closest:()=>({dataset:{pn:'state',k:'case-'+key}})}});assert.equal(prepared.at(-1),'case-'+key);assert.equal(id,'home');}
 assert.equal(refreshes,visible.length);
 console.log('PASS: all registered right-panel consultation buttons dispatch their exact home state and left sidebar group is removed');
})().catch(e=>{console.error(e);process.exitCode=1});

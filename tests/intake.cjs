const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('public/runtime/customer.js','utf8'),actions={},listeners={};
const input={value:'',focus(){this.focused=true},setAttribute(k,v){this[k]=v}},error={hidden:true},empty={hidden:true};
const chips=[{textContent:'ไข้',hidden:false},{textContent:'ปวดหัว',hidden:false},{textContent:'ไอ',hidden:false}];
let refreshed=0;
const TP={S:{intake:{symptoms:['ไข้','ไอ'],custom:[],otherOpen:true}},SYMPTOMS:['ไข้','ไอ','ปวดหัว'],act:(key,fn)=>actions[key]=fn,cur:()=>({el:{}}),refresh:()=>refreshed++,$$:()=>chips,$:()=>empty};
const context=vm.createContext({TP,esc:s=>String(s).replaceAll('<','&lt;'),ic:()=>'',document:{addEventListener:(type,fn)=>listeners[type]=fn},$:(sel)=>sel==='#ikOtherIn'?input:error});
const start=source.indexOf("TP.act('ikRemoveSym'");const end=source.indexOf("TP.act('symOther',",start);vm.runInContext(source.slice(start,end),context);
const add=source.indexOf("TP.act('symOtherAdd'");vm.runInContext(source.slice(add,source.indexOf("TP.act('pickWho'",add)),context);
actions.symOtherAdd();assert.equal(error.hidden,false);assert.equal(input['aria-invalid'],'true');
input.value='  เวียนหัว  ';actions.symOtherAdd();assert.equal(TP.S.intake.symptoms.at(-1),'เวียนหัว');input.value='เวียนหัว';actions.symOtherAdd();assert.equal(TP.S.intake.symptoms.filter(x=>x==='เวียนหัว').length,1);
actions.ikRemoveSym({dataset:{v:'ไข้'}});assert.deepEqual(Array.from(TP.S.intake.symptoms),['ไอ','เวียนหัว']);assert(refreshed>0);

const {harness}=require('./health-harness.cjs');const h=harness();
h.TP.URGENT=['หายใจลำบาก'];h.TP.SYMPTOMS=['ไข้','ไอ','เจ็บคอ','น้ำมูก','คัดจมูก','ผื่น','คัน'];h.TP.person=()=>h.S.user;h.TP.pickBranch=h.TP.branch;h.TP.fresh=()=>({addrs:[]});
h.run("const ackHtml=()=>'';const zoneNote=()=>'';const ACK_NEED='รับทราบ';const dockNote=()=>'';");
const begin=source.indexOf('TP.intakeReady ='),finish=source.indexOf('/* A2: one tick per case',begin);h.run(source.slice(begin,finish));
Object.assign(h.S.intake,{who:'me',symptoms:[],custom:[],urgent:[],note:'',mode:'chat',photos:0,otherOpen:false});
let html=h.screens.intake.render({S:h.S,state:'normal',params:{}});assert(!html.includes('ikSymSearch'));assert(!html.includes('id="ikOtherIn"'));assert(!html.includes('ik-selection'));assert(html.includes('เลือกอาการได้หลายข้อ'));assert(!html.includes('data-v="__other"'));assert(html.includes('aria-pressed="false"'));
h.S.intake.symptoms=['ไอ','น้ำมูก'];html=h.screens.intake.render({S:h.S,state:'multi',params:{}});assert(!html.includes('ik-selection'));assert.equal((html.slice(html.indexOf('id="ikSymOptions"'),html.indexOf('<div class="ik-extra-fields"')).match(/aria-pressed="true"/g)||[]).length,2);
h.S.intake.otherOpen=true;html=h.screens.intake.render({S:h.S,state:'other',params:{}});assert(!html.includes('id="ikOtherIn"'));assert(html.includes('<textarea'));assert(!html.includes('เพิ่มอาการ</span>'));assert(!html.includes('<details class="ik-extra"'));
h.S.intake.symptoms=['อาการเดิมจากร่าง'];html=h.screens.intake.render({S:h.S,state:'normal',params:{}});assert(html.includes('data-v="อาการเดิมจากร่าง"'));
const legacyNames=['น้ำมูก คัดจมูก','ผื่น คัน','ตาแดง แสบตา'];const symptomLine=source.match(/TP.SYMPTOMS = \[[^;]+/)[0];for(const name of legacyNames)assert(!symptomLine.includes(name));
const css=fs.readFileSync('src/styles/intake.css','utf8');assert(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));assert(css.includes('min-height:48px'));
console.log('PASS: multi-select rendering, empty summary, Other input, legacy draft preservation, split symptom labels and custom input validation');


const sections=harness(),sheets={};sections.TP.sheetDef=(id,def)=>sheets[id]=def;sections.TP.URGENT=['หายใจลำบาก','เจ็บแน่นหน้าอก'];sections.TP.SYMPTOMS=['ไข้','ไอ'];sections.TP.person=()=>sections.S.user;sections.TP.pickBranch=sections.TP.branch;sections.TP.riskHtml=()=>'<p>FULL SERVICE TERMS</p>';sections.run("const zoneNote=()=>'';");
sections.run(source.slice(begin,source.indexOf('/* A1: the main address',begin)));
Object.assign(sections.S.intake,{symptoms:['ไอ'],custom:[],urgent:[],note:'',mode:'video',photos:0,ack:false});
let page=sections.screens.intake.render({S:sections.S,state:'filled',params:{}});
assert.equal(sections.S.intake.mode,'chat');assert(page.includes('ปรึกษาเภสัช'));assert(!page.includes('ik-mode-change'));assert(!page.includes('ik-br'));assert(!page.includes('dock-note'));assert(page.includes('ฉันได้อ่านและรับทราบเงื่อนไข'));assert(page.includes('data-sheet="serviceterms"'));assert(page.includes('aria-haspopup="dialog"'));assert(/id="ikGo"[^>]*disabled|disabled[^>]*id="ikGo"/.test(page));
assert(/id="ikUrgentAlert"[^>]*hidden/.test(page));sections.S.intake.ack=true;sections.S.intake.urgent=['หายใจลำบาก'];page=sections.screens.intake.render({S:sections.S,state:'urgent',params:{}});assert(!/id="ikUrgentAlert"[^>]*hidden/.test(page));assert(page.includes('tel:1669'));assert(!/id="ikGo"[^>]*disabled|disabled[^>]*id="ikGo"/.test(page));
const snapshot=JSON.stringify(sections.S.intake);assert(sheets.serviceterms.render().includes('FULL SERVICE TERMS'));assert.equal(JSON.stringify(sections.S.intake),snapshot);assert.equal(sheets.serviceterms.code,'C215');
console.log('PASS: neutral urgent section, conditional emergency text, chat-first, compact service acknowledgment, read-only terms and button gating');

const blobs=[],revoked=[];sections.context.URL={createObjectURL:f=>{const url='blob:'+blobs.length;blobs.push(url);return url;},revokeObjectURL:u=>revoked.push(u)};
const I=sections.S.intake;I.attachments=[];const img=n=>({name:'private-name-'+n+'.jpg',type:'image/jpeg',size:1024});
assert.equal(sections.TP.intakePhotoBatch(I,[img(1),img(2),img(3)]),'');assert.equal(I.photos,3);assert.equal(I.attachments.length,3);
page=sections.screens.intake.render({S:sections.S,state:'photos',params:{}});assert.equal((page.match(/alt="รูปที่แนบ /g)||[]).length,3);assert(!page.includes('private-name'));assert(page.includes('aria-label="ลบรูปที่ 3"'));assert(!page.includes('ik-selection'));assert(!page.includes('data-a="addPhoto"'));
assert(sections.TP.intakePhotoBatch(I,[img(4)]));assert.equal(I.attachments.length,3);assert.equal(blobs.length,3);
const removeStart=source.indexOf("TP.act('addPhoto',");sections.run(source.slice(removeStart,source.indexOf('/* join:',removeStart)));
sections.actions.ikPhotoRemove({dataset:{v:'1'}});assert.equal(I.photos,2);assert(sections.screens.intake.render({S:sections.S,state:'photos',params:{}}).includes('data-a="addPhoto"'));assert.deepEqual(revoked,['blob:1']);assert.equal(I.attachments[1].file.name,'private-name-3.jpg');assert.equal(sections.TP.intakePhotoBatch(I,[img(4)]),'');assert.equal(I.photos,3);
I.attachments=[];assert(sections.TP.intakePhotoBatch(I,[{type:'application/pdf',size:10}]));assert(sections.TP.intakePhotoBatch(I,[{type:'image/png',size:6*1024*1024}]));assert.equal(I.attachments.length,0);
let picker=0,change;sections.elements['#ikPhotos']={click(){picker++},addEventListener:(type,fn)=>change=fn};sections.actions.addPhoto();assert.equal(picker,1);sections.screens.intake.mount({}, {S:sections.S});change({target:{files:[img(5)],value:'selected'}});assert.equal(I.attachments.length,1);change({target:{files:[],value:''}});assert.equal(I.attachments.length,1);
assert(css.includes('.ik-safety .chips {grid-template-columns:minmax(0,1fr)}'));assert(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'));
console.log('PASS: upload picker/change, 3-photo limit, hidden filenames, deletion/replacement, cancelled selection and type/size errors');

assert(!css.includes(":is(#ikSymOptions,.ik-safety)"),"shared styles must not inherit ID specificity and override the urgent single column");assert(css.includes(":where(#ikSymOptions,.ik-safety)"));assert(source.includes('class="note danger ik-urgent-message"'));

const ready=sections.TP.intakeReady;Object.assign(I,{symptoms:[],note:'',otherOpen:false,otherText:''});assert(!ready(I));I.note='ปวดหูข้างซ้าย\nเริ่มเมื่อวาน';assert(ready(I));
page=sections.screens.intake.render({S:sections.S,state:'other',params:{}});assert(page.includes('ปวดหูข้างซ้าย'));assert(!page.includes('data-v="__other"'));assert(!page.includes('id="ikOtherIn"'));assert(page.indexOf('ik-upload-help')<page.indexOf('</button>',page.indexOf('ik-upload-help')));
assert(page.includes('id="ikAckLabel"'));assert(page.includes('ฉันได้อ่านและรับทราบ'));assert(page.includes('ik-consent-copy'));assert(!page.includes('<details class="ik-extra"'));
sections.S.intake.ack=false;sections.actions.ikAck({checked:true});assert(sections.S.intake.ack);sections.actions.ikAck({checked:false});assert(!sections.S.intake.ack);
assert(css.includes('color-mix(in srgb,var(--semantic-error-background) 30%'));assert(css.includes('#ikUrgentAlert :is(b,a,span) {color:inherit}'));
assert(page.includes('แนบรูปเพิ่มเติม'));console.log('PASS: free-text readiness, inline acknowledgment, visible optional form and upload-area guidance');

const redflagStart=source.indexOf("TP.sheetDef('redflag'");sections.run(source.slice(redflagStart,source.indexOf("TP.act('call1669'",redflagStart)));
sections.S.intake.urgent=['หายใจลำบาก','เจ็บแน่นหน้าอก'];const warning=sheets.redflag.render({S:sections.S});assert(warning.includes('<li>หายใจลำบาก</li>'));assert(warning.includes('<li>เจ็บแน่นหน้าอก</li>'));assert(warning.includes('อย่ารอการตอบในแอป'));assert(warning.includes('class="btn danger"'));assert(warning.includes('href="tel:1669"'));assert(!warning.includes('ถ้ายังอยาก'));assert(!warning.includes('รับเคสของคุณก่อน'));
assert.equal(sheets.redflag.foot,undefined);assert(warning.includes('rf-message'));assert(warning.includes('role="alert"'));const confirm=warning.slice(warning.indexOf('rf-confirm'));assert(confirm.includes('ยืนยันปรึกษาเภสัช'));assert(confirm.includes('secondary'));assert(confirm.includes('data-a="urgentGo"'));
console.log('PASS: C205 symptom list, immediate-care instruction, emergency call and separate outline confirmation');

const assert = require('node:assert/strict'), fs = require('node:fs');
const { harness, source } = require('./health-harness.cjs');
const h = harness();
h.TP.person = () => h.S.user;
h.TP.pickBranch = h.TP.branch;
h.TP.fresh = () => ({ addrs: [] });
h.run("const ackHtml=()=>'';const zoneNote=()=>'';const ACK_NEED='รับทราบ';const dockNote=()=>'';");
const begin = source.indexOf('const symptomOptions =');
const finish = source.indexOf('/* A2: one tick per case', begin);
h.run(source.slice(begin, finish));
Object.assign(h.S.intake, { who:'me', symptoms:[], urgent:[], note:'', mode:'chat', photos:0 });
const render = () => h.screens.intake.render({ S:h.S, state:'normal', params:{} });
let html = render();
for (let step = 1; step <= 4; step++) assert(html.includes('id="intakeStep' + step + '"'));
assert.equal((html.match(/data-a="intakeSymptom"/g) || []).length, 8);
assert(!html.includes('type="checkbox"'));
assert.match(html, /เลือกได้มากกว่า 1 ข้อ/);
const css = fs.readFileSync('src/styles/flutter-customer.css','utf8');
assert.match(css, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
const chip = value => ({ dataset: {v:value}, setAttribute(key, value) { this[key] = value; } });
h.elements['#ikGo'] = { disabled:true };
const fever = chip('ไข้ หวัด'), cough = chip('ไอ เจ็บคอ');
h.actions.intakeSymptom(fever);
h.actions.intakeSymptom(cough);
assert.deepEqual(Array.from(h.S.intake.symptoms), ['ไข้ หวัด', 'ไอ เจ็บคอ']);
assert.equal(cough['aria-pressed'], 'true');
h.actions.intakeSymptom(fever);
assert.deepEqual(Array.from(h.S.intake.symptoms), ['ไอ เจ็บคอ']);
assert.equal(fever['aria-pressed'], 'false');
h.S.intake.note = 'อาการเดิมจากร่าง';
html = render();
assert.match(html, /อาการเดิมจากร่าง/);
assert.deepEqual(Array.from(h.S.intake.symptoms), ['ไอ เจ็บคอ']);
console.log('PASS: four numbered steps, independent symptom cards and retained text on re-render');

const sections=harness(),sheets={};sections.TP.sheetDef=(id,def)=>sheets[id]=def;sections.TP.URGENT=['หายใจลำบาก','เจ็บแน่นหน้าอก'];sections.TP.SYMPTOMS=['ไข้','ไอ'];sections.TP.person=()=>sections.S.user;sections.TP.pickBranch=sections.TP.branch;sections.TP.riskHtml=()=>'<p>FULL SERVICE TERMS</p>';sections.run("const zoneNote=()=>'';");
sections.run(source.slice(begin,source.indexOf('/* A1: the main address',begin)));
Object.assign(sections.S.intake,{symptoms:['ไอ'],custom:[],urgent:[],note:'',mode:'video',photos:0,ack:false});
let page=sections.screens.intake.render({S:sections.S,state:'filled',params:{}});
assert.equal(sections.S.intake.mode,'video');assert(!page.includes('ik-mode-options'));assert(!page.includes('ikConsultMode'));assert(!page.includes('ต้องการปรึกษาแบบไหน'));assert(page.includes('id="intakeStep1"'));assert(page.includes('id="intakeStep4"'));assert(page.includes('ปรึกษาเภสัช'));assert(!page.includes('ik-mode-change'));assert(!page.includes('ik-br'));assert(!page.includes('dock-note'));assert(page.includes('ฉันได้อ่านและรับทราบเงื่อนไข'));assert(page.includes('data-sheet="serviceterms"'));assert(page.includes('aria-haspopup="dialog"'));assert(/id="ikGo"[^>]*disabled|disabled[^>]*id="ikGo"/.test(page));
assert(!page.includes('ik-safety'));assert(!page.includes('ikUrgentAlert'));assert(page.includes('id="intakeStep4"'));sections.S.intake.ack=true;sections.S.intake.urgent=['หายใจลำบาก'];page=sections.screens.intake.render({S:sections.S,state:'filled',params:{}});assert.equal(sections.S.intake.urgent.length,0);assert(!/id="ikGo"[^>]*disabled|disabled[^>]*id="ikGo"/.test(page));
const snapshot=JSON.stringify(sections.S.intake);assert(sheets.serviceterms.render().includes('FULL SERVICE TERMS'));assert.equal(JSON.stringify(sections.S.intake),snapshot);assert.equal(sheets.serviceterms.code,'C215');
console.log('PASS: neutral urgent section, conditional emergency text, consultation preference, compact service acknowledgment, read-only terms and button gating');

const blobs=[],revoked=[];sections.context.URL={createObjectURL:f=>{const url='blob:'+blobs.length;blobs.push(url);return url;},revokeObjectURL:u=>revoked.push(u)};
const I=sections.S.intake;I.attachments=[];const img=n=>({name:'private-name-'+n+'.jpg',type:'image/jpeg',size:1024});
assert.equal(sections.TP.intakePhotoBatch(I,[img(1),img(2),img(3)]),'');assert.equal(I.photos,3);assert.equal(I.attachments.length,3);
page=sections.screens.intake.render({S:sections.S,state:'photos',params:{}});assert.equal((page.match(/alt="รูปที่แนบ /g)||[]).length,3);assert(!page.includes('private-name'));assert(page.includes('aria-label="ลบรูปที่ 3"'));assert(!page.includes('ik-selection'));assert(!page.includes('data-a="addPhoto"'));
assert(sections.TP.intakePhotoBatch(I,[img(4)]));assert.equal(I.attachments.length,3);assert.equal(blobs.length,3);
const removeStart=source.indexOf("TP.act('addPhoto',");sections.run(source.slice(removeStart,source.indexOf('/* join:',removeStart)));
sections.actions.ikPhotoRemove({dataset:{v:'1'}});assert.equal(I.photos,2);assert(sections.screens.intake.render({S:sections.S,state:'photos',params:{}}).includes('data-a="addPhoto"'));assert.deepEqual(revoked,['blob:1']);assert.equal(I.attachments[1].file.name,'private-name-3.jpg');assert.equal(sections.TP.intakePhotoBatch(I,[img(4)]),'');assert.equal(I.photos,3);
I.attachments=[];assert(sections.TP.intakePhotoBatch(I,[{type:'application/pdf',size:10}]));assert(sections.TP.intakePhotoBatch(I,[{type:'image/png',size:6*1024*1024}]));assert.equal(I.attachments.length,0);
let picker=0,change;sections.elements['#ikPhotos']={click(){picker++},addEventListener:(type,fn)=>change=fn};sections.actions.addPhoto();assert.equal(picker,1);sections.screens.intake.mount({}, {S:sections.S});assert.equal(I.mode,'video');change({target:{files:[img(5)],value:'selected'}});assert.equal(I.attachments.length,1);change({target:{files:[],value:''}});assert.equal(I.attachments.length,1);
console.log('PASS: upload picker/change, 3-photo limit, hidden filenames, deletion/replacement, cancelled selection and type/size errors');


const ready=sections.TP.intakeReady;Object.assign(I,{symptoms:[],note:'',otherOpen:false,otherText:''});assert(!ready(I));I.note='ปวดหูข้างซ้าย\nเริ่มเมื่อวาน';assert(!ready(I));
I.symptoms=['ปรึกษาเรื่องอื่น'];assert(ready(I));
sections.S.user.allergyState='unknown';sections.S.user.allergies=[];
assert(!ready(I));sections.actions.intakeConfirmAllergy();assert(ready(I));
page=sections.screens.intake.render({S:sections.S,state:'other',params:{}});assert(page.includes('ปวดหูข้างซ้าย'));assert(!page.includes('data-v="__other"'));assert(!page.includes('id="ikOtherIn"'));assert(page.indexOf('ik-upload-help')<page.indexOf('</button>',page.indexOf('ik-upload-help')));
assert(page.includes('id="ikAckLabel"'));assert(page.includes('ฉันได้อ่านและรับทราบ'));assert(page.includes('ik-consent-copy'));assert(!page.includes('<details class="ik-extra"'));
sections.S.intake.ack=false;sections.actions.ikAck({checked:true});assert(sections.S.intake.ack);sections.actions.ikAck({checked:false});assert(!sections.S.intake.ack);
assert(page.includes('แนบรูปเพิ่มเติม'));console.log('PASS: symptoms and allergy readiness, inline acknowledgment, visible optional form and upload-area guidance');

assert(!source.includes("TP.sheetDef('redflag'"));
assert(!source.includes("TP.sheetDef('allergy'"));
console.log('PASS: retired C204 and C205 sheets are not registered');

// Intake must reflect the saved health record, preserving unknown/none and text lines.
Object.assign(h.S.user,{allergyState:'set',allergies:['ยา ก\nยา ข'],allergySrc:'บันทึกโดย ภญ.ขวัญใจ',medState:'none',meds:[],conditions:[],conditionState:'unknown',condNone:false,food:'กุ้ง',foodState:'set',foodNone:false,weight:64.5,height:168});
const beforeHealth=JSON.stringify(h.S.user);html=h.screens.intake.render({S:h.S,state:'normal',params:{}});
assert(!html.includes('บันทึกโดย'));assert(html.includes('ยา ก\nยา ข'));assert(html.includes('ไม่มียาที่ใช้ประจำ'));assert(html.includes('ยังไม่ทราบ'));assert(!html.includes('กุ้ง'));assert(!html.includes('64.5 กก.'));assert(!html.includes('168 ซม.'));assert.equal((html.match(/data-a="afHdFieldOpen"/g)||[]).length,3);assert.equal(JSON.stringify(h.S.user),beforeHealth);
h.S.user.allergies=['ข้อมูลที่แก้จากสมุดสุขภาพ'];html=h.screens.intake.render({S:h.S,state:'normal',params:{}});assert(html.includes('ข้อมูลที่แก้จากสมุดสุขภาพ'));assert(!html.includes('ยา ก\nยา ข'));
console.log('PASS: intake shares health record categories and values, no pharmacist attribution, three individual edit actions and no mutation on render');

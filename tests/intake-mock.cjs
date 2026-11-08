const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
// C203 preview mock: fills only empty symptom fields and never ticks the acknowledgement.
let refreshes=0;const TP={refresh:()=>{refreshes++;}};
const a=source.indexOf('const intakeMock = {'),b=source.indexOf("TP.screen('intake', {",a);
const intakeMock=vm.runInNewContext(source.slice(a,b)+';intakeMock',{TP});
const S={intake:{who:'me',symptoms:[],note:'',ack:false}};
assert.equal(intakeMock.canFill({S}),true);
intakeMock.fill({S});
assert.deepEqual([...S.intake.symptoms],['ไข้','เจ็บคอ']);assert.equal(S.intake.note,'เป็นมา 2 วัน กลืนแล้วเจ็บ');assert.equal(S.intake.ack,false,'acknowledgement stays for the tester');assert.equal(refreshes,1);
assert.equal(intakeMock.canFill({S}),false,'nothing left to fill');
const kept={intake:{symptoms:['ปวดหัว'],note:'',ack:false}};intakeMock.fill({S:kept});assert.deepEqual(kept.intake.symptoms,['ปวดหัว'],'existing answers are kept');assert.equal(kept.intake.note,'เป็นมา 2 วัน กลืนแล้วเจ็บ');
assert.match(source,/TP\.screen\('intake', \{\n  previewMock: intakeMock,/);
assert.match(source,/screenMock \? !!screenMock\.canFill\(c\.ctx\)/,'panel shows the mock button for screens with previewMock');
assert.match(source,/else if \(screenMock\) await screenMock\.fill\(cur\.ctx\)/);
// Chat: the intake renders as the customer's first bubble from fixed mock content.
assert.match(source,/TP\.INTAKE_CHAT_MOCK = \['อาการเบื้องต้น', 'ไข้, เจ็บคอ', 'เป็นมา 2 วัน กลืนแล้วเจ็บ'\];/);assert.doesNotMatch(source,/INTAKE_CHAT_MOCK = \[[^\]]*(อาการ:|รายละเอียด:|ประวัติแพ้ยา:)/,'no labels or categories');
assert.doesNotMatch(source,/kind:'provider-ready'\},\{who:'me',kind:'intake'\}/,'intake is never placed after the provider marker');
console.log('PASS: C203 mock fills empty fields only without ticking acknowledgement; chat intake is the first message');

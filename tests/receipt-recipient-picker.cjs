const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('public/runtime/customer.js', 'utf8');
const fixtures = {window:{}};
vm.runInNewContext(fs.readFileSync('public/runtime/customer-fixtures.js', 'utf8'), fixtures);
const demoRecords = fixtures.window.MitrareeFixtures.account().taxProfiles.me;
assert.equal(demoRecords.length, 3);
assert.equal(new Set(demoRecords.map(record => record.profileKey)).size, 3);
assert.equal(new Set(demoRecords.map(record => record.addr)).size, 3);
const actions = {}, sheets = {}, rows = {me:[
  {profileKey:'person-1', name:'Person', id:'1234567890121', addr:'Saved address', phone:'0812345678'},
  {profileKey:'person-2', name:'Other person', id:'1234567890148', addr:'Other address', phone:'0812345679'},
],co:[]};
const order = {tax:{who:'me',want:false}}, calls = [];
const S = {_receiptTaxKind:'me',case:{order:{status:'pending',deadline:123}},pay:{taxWho:'me',taxKey:'person-1',method:'card'}};
let checkoutReturn;
const TP = {taxAddress:r=>r.addr||[r.detail,r.dist,r.amp,r.prov,r.zip].filter(Boolean).join(' '),S,cur:()=>({ctx:{rc:order}}),taxRecords:k=>rows[k],
act:(id,fn)=>actions[id]=fn,sheetDef:(id,def)=>sheets[id]=def,
go:(id,{params})=>{checkoutReturn=params.onCheckoutReturn;calls.push(['go',id]);},back:async()=>calls.push(['back']),
expireOrder:()=>{},orderPayable:order=>order.status==='pending',notify:message=>calls.push(['notice',message]),
sheet:id=>calls.push(['sheet',id]),sheetOpen:()=>({id:'pay'}),closeSheet:async()=>calls.push(['close']),refresh:async()=>calls.push(['refresh'])};
const draft = {drafts:{}};
const context = vm.createContext({TP,ui:{seg:()=>'',btn:(label,o)=>`${o.a} ${label}`,emptyArt:()=>'<svg></svg>'},ic:()=>'<svg></svg>',esc:s=>String(s??''),taxProfileDraft:()=>draft,taxProfileEntry:record=>({...record}),taxProfilePreview:()=>({}),$:()=>{},});
const a=source.indexOf('// Select from the same saved records'), b=source.indexOf('const taxProfileRecord =',a);
vm.runInContext(source.slice(source.indexOf('const invoiceKinds ='),source.indexOf('function payTaxHtml')),context);
vm.runInContext(source.slice(a,b),context);
(async()=>{
actions.rcTaxPickOpen(); assert.equal(order.tax.want,false,'opening selector must not request an invoice');
assert.deepEqual(calls.pop(),['sheet','receipttaxpicker']);
await actions.rcTaxPickerChoose({dataset:{v:'me',key:'missing'}});
assert.equal(order.tax.want,false,'invalid selection cannot enable request');
await actions.rcTaxPickerChoose({dataset:{v:'me',key:'person-2'}});
assert.equal(order.tax.want,true);assert.equal(order.tax.pending,undefined,'selection does not submit');
assert.equal(order.tax.who,'me');
assert.equal(order.tax.taxKey,'person-2');
assert.equal(S.pay.taxKey,'person-1','choosing on the receipt leaves checkout selection alone');
const html=vm.runInContext('receiptTaxPicker(TP.S)',context);
assert(html.includes('Saved address'));
assert.match(html,/data-key="person-2" aria-pressed="true"/);
assert(!html.includes('1234567890121'));
assert(!html.includes('0812345678'));
const selected=vm.runInContext("TP.invoiceOptions('me','person-2','rc')",context);
assert(selected.includes('xxxxxxxxx0148'));
assert(selected.includes('Other address'));
assert(!selected.includes('1234567890148'));
assert(!html.includes('taxProfileDelete'));
S._receiptTaxKind='co';assert(vm.runInContext('receiptTaxPicker(TP.S)',context).includes('rc-tax-empty'));
assert.equal(sheets.receipttaxpicker.code,'C421');assert.equal(sheets.receipttaxpicker.states.length,3);
const checkoutOptions = kind=>TP.invoiceOptions(kind,S.pay.taxKey,'pay');
assert.match(checkoutOptions('me'),/payTaxPickOpen/);
await actions.payTaxPickerChoose({dataset:{v:'me',key:'person-2'}});
assert.equal(S.pay.taxKey,'person-2');
assert.match(checkoutOptions('me'),/Other address/);
assert.match(checkoutOptions('co'),/class="invoice-recipient-card invoice-recipient-add" data-a="payTaxPickerAdd" data-v="co"[\s\S]*เพิ่มข้อมูลนิติบุคคล/);
assert.doesNotMatch(checkoutOptions('co'),/ยังไม่มีข้อมูลผู้รับประเภทนี้/);
assert.match(sheets.checkouttaxpicker.foot(),/payTaxManage จัดการข้อมูลภาษี/);
const payment = S.pay;
actions.payTaxManage();
assert.deepEqual(calls.pop(),['go','taxprofile']);
assert.equal(draft.kind,'me');
rows.me.push({profileKey:'person-3',addr:'New saved address'});
await checkoutReturn();
assert.deepEqual(calls.splice(-2),[['back'],['sheet','pay']]);
assert.equal(S.pay,payment);
assert.equal(S.case.order.deadline,123);
assert.match(checkoutOptions('me'),/Other address/);
S._receiptTaxKind='me';
assert.match(sheets.checkouttaxpicker.render({S}),/New saved address/);
rows.me.pop();
actions.payTaxManage();
S.case.order.status='expired';
await checkoutReturn();
assert.deepEqual(calls.splice(-3),[['go','taxprofile'],['back'],['notice','รายการนี้หมดเวลาชำระแล้ว']]);
rows.me.shift();
assert.match(checkoutOptions('me'),/class="invoice-recipient-card" data-a="payTaxPickOpen"/, 'single recipient: tapping the card opens the picker (user 24 Nov 2026)');
assert.doesNotMatch(checkoutOptions('me'),/เปลี่ยนที่อยู่ใบกำกับภาษี|payTaxPickerEdit/);
assert.doesNotMatch(TP.invoiceOptions('me','person-2','rc'),/TaxPickerEdit/);
actions.payTaxPickerEdit();
assert.deepEqual(calls.pop(),['sheet','checkouttaxedit']);
assert.equal(draft.editKey,'person-2');
assert.equal(draft.drafts.me.addr,'Other address');
actions.payTaxPickerAdd({dataset:{v:'co'}});
assert.deepEqual(calls.pop(),['sheet','checkouttaxedit']);
assert.equal(draft.kind,'co');
assert.equal(draft.editKey,null);
assert.equal(draft.drafts.co.addr,undefined);
console.log('PASS receipt recipient selection: shared records, invalid selection, explicit submission, masking and empty state');
})().catch(e=>{console.error(e);process.exitCode=1;});

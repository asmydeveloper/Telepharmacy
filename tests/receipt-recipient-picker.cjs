const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('public/runtime/customer.js', 'utf8');
const actions = {}, sheets = {}, rows = {me:[
  {profileKey:'person-1', name:'Person', id:'1234567890121', addr:'Saved address', phone:'0812345678'},
  {profileKey:'person-2', name:'Other person', id:'1234567890148', addr:'Other address', phone:'0812345679'},
],co:[]};
const order = {tax:{who:'me',want:false}}, calls = [];
const S = {_receiptTaxKind:'me',pay:{taxWho:'me',taxKey:'person-1'}};
const TP = {taxAddress:r=>r.addr||[r.detail,r.dist,r.amp,r.prov,r.zip].filter(Boolean).join(' '),S,cur:()=>({ctx:{rc:order}}),taxRecords:k=>rows[k],
act:(id,fn)=>actions[id]=fn,sheetDef:(id,def)=>sheets[id]=def,
sheet:id=>calls.push(['sheet',id]),closeSheet:async()=>calls.push(['close']),refresh:async()=>calls.push(['refresh'])};
const context = vm.createContext({TP,ui:{seg:()=>'',btn:()=>'',emptyArt:()=>'<svg></svg>'},ic:()=>'<svg></svg>',esc:s=>String(s??''),taxProfileDraft:()=>({drafts:{}}),taxProfileEntry:()=>({}),taxProfilePreview:()=>({}),$:()=>{},});
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
console.log('PASS receipt recipient selection: shared records, invalid selection, explicit submission, masking and empty state');
})().catch(e=>{console.error(e);process.exitCode=1;});

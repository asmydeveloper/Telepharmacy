const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('public/runtime/customer.js', 'utf8');
const actions = {}, sheets = {}, rows = {me:[{profileKey:'person-1', name:'Person', id:'1234567890121', addr:'Saved address', phone:'0812345678'}],co:[]};
const order = {tax:{who:'me',want:false}}, calls = [];
const S = {_receiptTaxKind:'me'};
const TP = {S,cur:()=>({ctx:{rc:order}}),taxRecords:k=>rows[k],taxSelected:k=>rows[k][0],
taxChoose:(k,key)=>calls.push(['choose',k,key]),act:(id,fn)=>actions[id]=fn,sheetDef:(id,def)=>sheets[id]=def,
sheet:id=>calls.push(['sheet',id]),closeSheet:async()=>calls.push(['close']),refresh:async()=>calls.push(['refresh'])};
const context = vm.createContext({TP,ui:{seg:()=>'',btn:()=>'',emptyArt:()=>'<svg></svg>'},ic:()=>'<svg></svg>',esc:s=>String(s??''),taxProfileDraft:()=>({drafts:{}}),taxProfileEntry:()=>({}),taxProfilePreview:()=>({}),$:()=>{},});
const a=source.indexOf('// Select from the same saved records'), b=source.indexOf('const taxProfileRecord =',a);
vm.runInContext(source.slice(a,b),context);
(async()=>{
actions.rcTaxPickOpen(); assert.equal(order.tax.want,false,'opening selector must not request an invoice');
assert.deepEqual(calls.pop(),['sheet','receipttaxpicker']);
await actions.rcTaxPickerChoose({dataset:{v:'me',key:'missing'}});
assert.equal(order.tax.want,false,'invalid selection cannot enable request');
await actions.rcTaxPickerChoose({dataset:{v:'me',key:'person-1'}});
assert.equal(order.tax.want,true);assert.equal(order.tax.pending,undefined,'selection does not submit');
assert.equal(order.tax.who,'me');assert(calls.some(c=>c[0]==='choose'&&c[2]==='person-1'));
const html=vm.runInContext('receiptTaxPicker(TP.S)',context);
assert(html.includes('Saved address')); assert(html.includes('xxxxxxxxx0121'));assert(!html.includes('1234567890121'));
assert(!html.includes('taxProfileDelete'));
S._receiptTaxKind='co';assert(vm.runInContext('receiptTaxPicker(TP.S)',context).includes('rc-tax-empty'));
assert.equal(sheets.receipttaxpicker.code,'C421');assert.equal(sheets.receipttaxpicker.states.length,3);
console.log('PASS receipt recipient selection: shared records, invalid selection, explicit submission, masking and empty state');
})().catch(e=>{console.error(e);process.exitCode=1;});

const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
const TP={S:{addrs:[{dist:'ทวีวัฒนา',main:true}],branchState:{tw:'open',on:'open'},st:{}},ZONE_KM:15,zoneOf:(a,id)=>({km:id==='tw'?2.4:41}),PHARM:{kj:{}},pickBranch:()=>TP.BRANCHES[0]};
const ui={tag:(text,tone)=>`<span class="${tone}">${text}</span>`};const c=vm.createContext({TP,ui,esc:String,ic:()=>''});
{const fx={};vm.runInContext(require('node:fs').readFileSync('public/runtime/customer-fixtures.js','utf8'),vm.createContext({window:fx}));TP.BRANCHES=fx.MitrareeFixtures.BRANCHES;}
vm.runInContext(source.slice(source.indexOf('TP.homeAddress ='),source.indexOf('/* Selection uses')),c);
vm.runInContext(source.slice(source.indexOf('function storeListHtml('),source.indexOf("TP.sheetDef('allbranches'")),c);
const html=vm.runInContext('nearbyStoresHtml(TP.S)',c);
assert.deepEqual(Array.from(TP.BRANCHES,b=>b.id),['tw','on']);
assert(html.includes('สาขาอ่อนนุช'));assert(html.includes('41 กม.'));assert(html.includes('นอกพื้นที่ให้บริการ'));
assert(html.indexOf('สาขาอ่อนนุช')>html.indexOf('สาขาตลาดเวิลด์'));assert(!TP.homeStores().some(b=>b.id==='on'));
TP.branch=id=>TP.BRANCHES.find(b=>b.id===id);TP.caseOpen=()=>false;
const sheets={};TP.sheetDef=(id,def)=>sheets[id]=def;TP.act=()=>{};
vm.runInContext(source.slice(source.indexOf("TP.sheetDef('storeinfo'"),source.indexOf("TP.act('hmConsultMode'")),c);
const foot=sheets.storeinfo.foot({S:TP.S,params:{branch:'on'}});assert.equal(foot,'');
assert(!sheets.storeinfo.states.some(([state])=>state==='paused'));
let action;TP.act=(id,fn)=>action=fn;let proceeded=false;TP.closeSheet=()=>{proceeded=true};TP.ACTS={hmStart:()=>{proceeded=true}};
vm.runInContext(source.slice(source.indexOf("TP.act('hmConsultMode'"),source.indexOf("TP.act('hmReturnCase'")),c);
(async()=>{await action({dataset:{v:'chat',branch:'on'}});assert.equal(proceeded,false);console.log('PASS: both branches show, and the outside branch cannot enter consultation');})();

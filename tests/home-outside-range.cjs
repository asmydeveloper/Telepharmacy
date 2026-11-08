const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
const TP={S:{addrs:[{dist:'ทวีวัฒนา',main:true}],branchState:{},st:{}},ZONE_KM:15,zoneOf:(a,id)=>({km:id==='tw'?2.4:id==='on'?41:TP.BRANCHES.find(b=>b.id===id).km}),PHARM:{kj:{}},pickBranch:()=>TP.BRANCHES[0]};
const ui={tag:(text,tone)=>`<span class="${tone}">${text}</span>`};const c=vm.createContext({TP,ui,esc:String,ic:()=>''});
{const fx={};vm.runInContext(require('node:fs').readFileSync('public/runtime/customer-fixtures.js','utf8'),vm.createContext({window:fx}));TP.BRANCHES=fx.MitrareeFixtures.BRANCHES;}
vm.runInContext(source.slice(source.indexOf('TP.homeAddress ='),source.indexOf('/* Selection uses')),c);
vm.runInContext(source.slice(source.indexOf('function storeListHtml('),source.indexOf("TP.sheetDef('allbranches'")),c);
const html=vm.runInContext('nearbyStoresHtml(TP.S)',c);
assert(html.includes('ร้านยาร่มเย็น'));assert(html.includes('22.8 กม.'));assert(html.includes('นอกพื้นที่ให้บริการ'));
assert(html.indexOf('ร้านยาร่มเย็น')>html.indexOf('ร้านยาพร้อมดูแล'));assert(!TP.homeStores().some(b=>b.id==='demo-6'));
TP.branch=id=>TP.BRANCHES.find(b=>b.id===id);TP.caseOpen=()=>false;
const sheets={};TP.sheetDef=(id,def)=>sheets[id]=def;TP.act=()=>{};
vm.runInContext(source.slice(source.indexOf("TP.sheetDef('storeinfo'"),source.indexOf("TP.act('hmConsultMode'")),c);
const foot=sheets.storeinfo.foot({S:TP.S,params:{branch:'demo-6'}});assert(!foot.includes('data-a="hmConsultMode"'));assert.equal(foot,'');
let action;TP.act=(id,fn)=>action=fn;let proceeded=false;TP.closeSheet=()=>{proceeded=true};TP.ACTS={hmStart:()=>{proceeded=true}};
vm.runInContext(source.slice(source.indexOf("TP.act('hmConsultMode'"),source.indexOf("TP.act('hmReturnCase'")),c);
(async()=>{await action({dataset:{v:'chat',branch:'demo-6'}});assert.equal(proceeded,false);console.log('PASS: 22.8 km demo appears after eligible stores, carries outside status and cannot enter consultation');})();

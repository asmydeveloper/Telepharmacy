const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
const slice=(from,to)=>source.slice(source.indexOf(from),source.indexOf(to,source.indexOf(from)));
const TP={thaiAddressData:{rows:[{province:'กรุงเทพมหานคร',amphoe:'คลองเตย',district:'คลองเตย',zipcode:10110}]}};
let redraws=0;const S={user:{},_taxProfile:null};
const context=vm.createContext({TP,taxProfileRedraw:async()=>{redraws++;},$:()=>null,esc:v=>String(v??''),ic:()=>'',ui:{btn:()=>''}});
vm.runInContext([source.match(/const taxProfileIdOk = [^\n]+/)[0],slice('const taxProfileEntry = ','function taxProfileForm(').replace(/\/\/ Select from[\s\S]*$/,''),slice('function taxProfileErrors(','function taxProfileFieldCheck('),slice('const TAX_LONG_FIELDS=','function taxProfileCard(')].join('\n'),context);
const run=code=>vm.runInContext(code,context);
const draft=(kind,record=null)=>({kind,addressState:'ready',errors:{},drafts:{[kind]:run('taxProfileEntry')(record,{},kind==='co')}});

let d=draft('me'),e=run('taxProfileErrors')(d);
for(const key of ['id','first','last','phone','detail','prov','amp','dist','zip'])assert(e[key],'person requires '+key);
d=draft('co');e=run('taxProfileErrors')(d);
for(const key of ['id','name','business','phone','detail','prov','amp','dist','zip'])assert(e[key],'company requires '+key);assert(!e.first);for(const key of ['village','alley','road'])assert(!e[key],key+' is optional');
d=draft('me',run('taxProfilePreview')('me'));assert.deepEqual({...run('taxProfileErrors')(d)},{});
Object.assign(d.drafts.me,{id:'1234567890123',phone:'12'});e=run('taxProfileErrors')(d);assert.deepEqual(Object.keys(e).sort(),['id','phone']);assert(e.id.includes('เลขประจำตัวประชาชน'));d.drafts.me.phone='812345678';assert(!run('taxProfileErrors')(d).phone,'9 digits are allowed');
let company=draft('co',run('taxProfilePreview')('co'));company.drafts.co.id='1234567890123';assert(!run('taxProfileErrors')(company).id,'company ID only needs 13 digits');company.drafts.co.id='123';assert(run('taxProfileErrors')(company).id);company.drafts.co.id='0105569024564';company.drafts.co.business='ก'.repeat(501);assert(run('taxProfileErrors')(company).business.includes('500'));
d.drafts.me.dist='';assert.equal(run('taxProfileErrors')(d).dist,'เลือกตำบล / แขวง');
d=draft('me');d.addressState='loading';assert(run('taxProfileErrors')(d).prov.includes('โหลดข้อมูล'));assert.equal(run('taxProfileErrors')(d,{skipLoad:true}).prov,'เลือกจังหวัด');
for(const [kind,mode] of [['me','select'],['co','select'],['me','manual'],['co','manual']]){
 const form=draft(kind);form.drafts[kind].mode=mode;const html=run('taxProfileForm')({_taxProfile:form},true,true),inputs=html.match(/<input [^>]*>/g);
 assert(inputs.length>=9);for(const input of inputs)assert(/placeholder="[^"]+"/.test(input),kind+' '+mode+' needs a placeholder: '+input.slice(0,60));
}
console.log('PASS: C519 validates required fields, formats and address selection');

(async()=>{
 for(const kind of ['me','co']){
  S._taxProfile=draft(kind);S._taxProfile.errors={id:'x'};const before=redraws;
  assert.equal(run('taxProfileMock').canFill({S}),true);await run('taxProfileMock').fill({S});
  assert.equal(redraws,before+1);assert.deepEqual({...S._taxProfile.errors},{});assert.deepEqual({...run('taxProfileErrors')(S._taxProfile)},{},kind+' sample passes validation');
 }
 S._taxProfile=draft('me');S._taxProfile.drafts.me.first='ชื่อเดิม';await run('taxProfileMock').fill({S});assert.equal(S._taxProfile.drafts.me.first,'ชื่อเดิม','mock keeps typed values');
 S._taxProfile=draft('co');await run('taxProfileMock').fill({S});assert.equal(S._taxProfile.drafts.co.business,'ร้านตัวอย่าง');
 assert(!source.includes('taxProfileBranch'),'the form has no branch field');
 S._taxProfile=draft('me');S._taxProfile.addressState='loading';await run('taxProfileMock').fill({S});assert.equal(S._taxProfile.drafts.me.prov,'','mock waits for address data');
 S._taxProfile=draft('me');S._taxProfile.editKey='saved';assert.equal(run('taxProfileMock').canFill({S}),false,'mock is for the add form only');
 assert(source.includes('previewMock:taxProfileMock'));assert(!slice('function taxProfileForm(','function taxProfileCard(').includes('taxProfileMock'),'mock stays out of customer UI');
 console.log('PASS: preview mock fills blanks only in the add form and never saves');
})().catch(e=>{console.error(e);process.exitCode=1});

const assert=require('node:assert/strict'),fs=require('node:fs');
const M=require('../public/runtime/address-map.js');
const rows=[{province:'กรุงเทพมหานคร',amphoe:'ทวีวัฒนา',district:'ทวีวัฒนา',zipcode:10170}];
const a={first:'สมใจ',last:'ใจดี',phone:'0812345678',house:'88/12 ซอยทวีวัฒนา',prov:'กรุงเทพมหานคร',amp:'ทวีวัฒนา',dist:'ทวีวัฒนา',zip:'10170'};
assert.deepEqual(M.errors(a,rows),{});
for(const k of Object.keys(a))assert(M.errors({...a,[k]:''},rows)[k],k+' is required');
for(const v of ['123','สมใจ123','<script>','   '])assert(M.errors({...a,first:v},rows).first);
for(const v of ['081234567','08123456789','0212345678','081234567x','+66812345678'])assert(M.errors({...a,phone:v},rows).phone);
assert(M.errors({...a,house:'---'},rows).house);assert(M.errors({...a,house:'1'.repeat(201)},rows).house);
assert(M.errors({...a,dist:'คลองเตย'},rows).dist);assert(M.errors({...a,zip:'10171'},rows).dist);assert(M.errors({...a,zip:'abcde'},rows).zip);
assert(M.errors({...a,label:'a'.repeat(41)},rows).label);assert(!M.complete({...a,first:'123'}));
const source=fs.readFileSync('public/runtime/customer.js','utf8'),editor=source.slice(source.indexOf("TP.screen('addressedit'"),source.indexOf("TP.screen('favorites'"));
assert(editor.includes('registration-page'));assert(editor.includes('reg-name-fields'));assert(editor.includes('reg-required'));assert(editor.includes('aria-describedby'));assert(editor.includes('role="alert"'));assert(source.includes('TPAddressMap.errors({...d,first:d.addressFirst'));
console.log('PASS: shared required address fields; invalid names, phone, house, postal and mismatched geography; matched registration layout and inline accessible errors');

for(const [k,max]of [['building',200],['alley',100],['road',100]]){assert(!M.errors({...a,[k]:''},rows)[k]);assert(!M.errors({...a,[k]:'ก'.repeat(max)},rows)[k]);assert(M.errors({...a,[k]:'ก'.repeat(max+1)},rows)[k]);assert(M.errors({...a,[k]:'---'},rows)[k]);}

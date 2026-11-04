const fs=require('node:fs'),vm=require('node:vm');
const data=require('../public/runtime/consultation-data.js');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
module.exports=TP=>{
 TP.caseCode=data.codeFor;TP.consultationText=data.description;
 TP.esc ||= value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
 const start=source.indexOf('TP.consultationIdentity =');
 vm.runInNewContext(source.slice(start,source.indexOf('TP.stateOf =',start)),{TP});
};

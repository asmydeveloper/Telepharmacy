const assert=require('node:assert/strict');
(async()=>{
 const {GET}=await import('../src/app/api/address-boundary/route.js');
 let calls=0;const original=global.fetch;global.fetch=async()=>{calls++;throw Error('offline');};
 try{
  for(const code of ['104801','104802','103301']){const r=await GET(new Request('http://localhost/api/address-boundary?code='+code));assert.equal(r.status,200);const d=await r.json();assert(d.features.every(f=>String(f.properties.TAM_CODE)===code));}
  const rows=JSON.parse(require('fs').readFileSync('public/assets/data/thailand/addresses.json'));
  for(const district of ['ทวีวัฒนา','ศาลาธรรมสพน์','คลองเตย']){
   const row=rows.find(r=>r.province==='กรุงเทพมหานคร'&&r.district===district&&r.amphoe===(district==='คลองเตย'?'คลองเตย':'ทวีวัฒนา'));
   const q=new URLSearchParams({code:String(row.district_code),province:row.province,amphoe:row.amphoe,district:row.district});
   const response=await GET(new Request('http://localhost/api/address-boundary?'+q));assert.equal(response.status,200);
   const feature=(await response.json()).features[0];assert.equal(feature.properties.TAM_NAM_T,district);assert.equal(feature.properties.AMP_NAM_T,row.amphoe);assert.notEqual(feature.properties.TAM_CODE,String(row.district_code));
  }
  assert.equal(calls,0,'bundled exact identity polygons work with real legacy postal codes even when upstream is offline');
  const incomplete=await GET(new Request('http://localhost/api/address-boundary?code=101906&district='+encodeURIComponent('ทวีวัฒนา')));assert.equal(incomplete.status,400);
  const bad=await GET(new Request('http://localhost/api/address-boundary?code=invalid'));assert.equal(bad.status,400);
  const unavailable=await GET(new Request('http://localhost/api/address-boundary?code=999999'));assert.equal(unavailable.status,503,'no substitution for unknown district');
  console.log('PASS: local exact district geometry survives upstream failure; invalid/unknown districts fail closed');
 }finally{global.fetch=original;}
})().catch(e=>{console.error(e);process.exitCode=1;});

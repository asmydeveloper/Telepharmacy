// Builds docs/screen-specs.md from the screen registry in public/runtime/customer.js.
// The registry is the only source: notes, wait and states are read from TP.screen / TP.sheetDef.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/screen-specs.md');
const runtime=fs.readFileSync(path.join(root,'public/runtime/customer.js'),'utf8');
const context={TP:{}};vm.createContext(context);
vm.runInContext(runtime.slice(runtime.indexOf('TP.previewEventPolicy='),runtime.indexOf('/* ===== End preview event metadata ===== */')),context);
vm.runInContext(runtime.match(/TP\.GROUPS = \[[^\n]+\];/)[0],context);
const {previewEventPolicy:policy,GROUPS:groups}=context.TP;

module.exports=function syncScreenSpecs(screens){
  const eventCount=s=>(s.cases||[]).length;
  const total=screens.reduce((sum,s)=>sum+eventCount(s),0);
  const lines=[
    '# สเปกหน้าจอและเหตุการณ์ · แอปลูกค้า','',
    '> ไฟล์นี้สร้างอัตโนมัติ ห้ามแก้ที่นี่ แก้ `notes`, `wait` หรือ `states` ของหน้านั้นใน `public/runtime/customer.js` แล้วรัน `npm run screens:sync`',
    '> `npm run screens:check` จะล้มเมื่อไฟล์นี้ไม่ตรงกับโค้ด','',
    `รวม ${screens.length} หน้า · ${total} เหตุการณ์`,'',
    'ข้อความสเปกเป็นบันทึกจากโค้ด ไม่ใช่ผลทดสอบ และยังไม่ยืนยันว่าเชื่อมระบบจริงแล้ว','',
    '## สารบัญ',''
  ];
  const ordered=groups.flatMap(([key,label])=>[[key,label,screens.filter(s=>s.group===key).sort((a,b)=>a.code.localeCompare(b.code))]]);
  for(const [,label,items] of ordered)if(items.length)lines.push(`- ${label}: ${items.map(s=>`[${s.code}](#${s.code.toLowerCase()})`).join(' · ')}`);
  lines.push('');
  for(const [,label,items] of ordered){
    if(!items.length)continue;
    lines.push(`## ${label}`,'');
    for(const s of items){
      const title=String(s.title);
      lines.push(`<a id="${s.code.toLowerCase()}"></a>`,`### ${s.code} · ${title}`,'',`Screen ID: \`${s.screen}\` · ${s.kind==='sheet'?'แผ่นเลื่อนขึ้น':'หน้าจอ'}${s.ref?` · อ้างอิงสเปกเดิม ${s.ref}`:''}`,'','**สเปก**','');
      if(s.notes?.length)s.notes.forEach(note=>lines.push(`- ${note}`));else lines.push('- ยังไม่มีบันทึกสเปกในโค้ด');
      if(s.wait?.length){lines.push('','**รอเจ้าของเคาะ**','');s.wait.forEach(note=>lines.push(`- ${note}`));}
      lines.push('',`**เหตุการณ์ (${eventCount(s)})**`,'');
      const shown=new Set(policy.pageStates(s.screen,s.states).map(x=>x[0]));
      for(const c of s.cases)lines.push(`- ${c.code} · ${c.label}${shown.has(c.state)?'':' _(ไม่แสดงในแผงทดสอบ)_'}`);
      lines.push('');
    }
  }
  const text=lines.join('\n').replace(/\n+$/,'')+'\n';
  if(process.argv.includes('--check')){if(!fs.existsSync(out)||fs.readFileSync(out,'utf8')!==text)throw Error('Stale screen spec: docs/screen-specs.md · run npm run screens:sync');}
  else fs.writeFileSync(out,text);
  console.log(`PASS ${screens.length} screen specs and ${total} events in docs/screen-specs.md`);
};

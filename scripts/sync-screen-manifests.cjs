const fs = require('node:fs');
const path = require('node:path');
const acorn = require('next/dist/compiled/acorn/acorn.js');
const root=path.resolve(__dirname,'..');
const ast=acorn.parse(fs.readFileSync(path.join(root,'public/runtime/customer.js'),'utf8'),{ecmaVersion:'latest',sourceType:'script'});
const screens=[];
function literal(node) {
  if (!node) return undefined;
  if (node.type==='Literal') return node.value;
  if (node.type==='ArrayExpression') return node.elements.map(literal);
  if (node.type==='ArrowFunctionExpression' && node.body.type==='LogicalExpression') return literal(node.body.right);
  throw Error('Expected static screen metadata at '+node.start);
}
function walk(node) {
  if (!node || typeof node!=='object') return;
  if (node.type==='CallExpression' && node.callee?.type==='MemberExpression' && node.callee.object.name==='TP' && ['screen','sheetDef'].includes(node.callee.property.name)) {
    const [id,def]=node.arguments;
    if(id?.type!=='Literal'||def?.type!=='ObjectExpression')throw Error('Unsupported registry definition');
    const fields=Object.fromEntries(def.properties.filter(p=>p.type==='Property' && ['group','title','code','states','hidden','host'].includes(p.key.name)).map(p=>[p.key.name,literal(p.value)]));
    if(fields.hidden){if(!fields.host)throw Error('Internal sheet needs owner: '+id.value);return;}
    if(!fields.code||!fields.group)throw Error('Missing code/group: '+id.value);
    screens.push({...fields,screen:id.value,kind:node.callee.property.name==='screen'?'screen':'sheet'});
  }
  for(const [key,value] of Object.entries(node)){if(key==='start'||key==='end')continue;if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value)}
}
walk(ast);
const codes=new Set();
let count=0;
const expectedFiles=new Set();
for(const screen of screens){
  if(codes.has(screen.code))throw Error('Duplicate screen code '+screen.code);codes.add(screen.code);
  const states=screen.states||[];
  const cases=(states.length?states:[['','ปกติ']]).map(([state,label],i)=>({code:screen.code+(states.length>1?'.'+(i+1):''),state,label,url:'/?screen='+screen.screen+(state?'&state='+encodeURIComponent(state):'')+'&splash=0'}));
  const manifest={code:screen.code,screen:screen.screen,title:screen.title,group:screen.group,kind:screen.kind,cases};
  const file=path.join(root,'design-system/screens',screen.group,screen.code+'.json');
  expectedFiles.add(file);
  if(process.argv.includes('--check')){const actual=JSON.parse(fs.readFileSync(file,'utf8'));if(JSON.stringify(actual)!==JSON.stringify(manifest))throw Error('Stale manifest: '+file)}
  else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n')}
  count+=cases.length;
}
for(const group of fs.readdirSync(path.join(root,'design-system/screens'),{withFileTypes:true}).filter(d=>d.isDirectory())){const dir=path.join(root,'design-system/screens',group.name);for(const name of fs.readdirSync(dir).filter(n=>/^C\d+\.json$/.test(n))){const file=path.join(dir,name);if(!expectedFiles.has(file)){if(process.argv.includes('--check'))throw Error('Retired manifest: '+file);fs.unlinkSync(file);}}}
console.log(`PASS ${screens.length} screen codes and ${count} case links match the live registry`);

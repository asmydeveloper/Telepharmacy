const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),postcss=require('postcss');
const files=['src/app/styles.css','src/styles/figma-tokens.css','src/styles/tokens.css','src/styles/customer-ui.css','src/styles/layout.css','src/styles/home.css','src/styles/components.css','src/styles/intake.css','src/styles/history.css','src/styles/adr.css'];
const definitions=new Map(),refs=[];
for(const file of files){const css=fs.readFileSync(file,'utf8'),ast=postcss.parse(css,{from:file});assert(!css.includes('https://www.figma.com/api/mcp/asset/'),`${file}: temporary asset URL`);ast.walkDecls(d=>{if(d.prop.startsWith('--'))definitions.set(d.prop,d.value);for(const m of d.value.matchAll(/var\((--[\w-]+)(\s*[,\)])/g))refs.push({name:m[1],fallback:m[2].trim()===',',file})});}
const missing=refs.filter(r=>!r.fallback&&/--(?:semantic-|type-|component-|layout-|motion-|radius-|space-)/.test(r.name)&&!definitions.has(r.name));assert.deepEqual(missing,[],'Undefined design-system tokens');
function visit(name,trail=[]){assert(!trail.includes(name),'Token cycle: '+[...trail,name].join(' → '));const value=definitions.get(name)||'';for(const m of value.matchAll(/var\((--[\w-]+)/g))if(definitions.has(m[1]))visit(m[1],[...trail,name]);}
for(const key of definitions.keys())visit(key);
const componentCss=fs.readFileSync('src/styles/components.css','utf8');
const assets=[...new Set([...componentCss.matchAll(/url\(['"]?(\/assets\/[^)'"\s]+)/g)].map(m=>m[1]))];
for(const asset of assets){const local=path.join('public',asset);assert(fs.statSync(local).size>0,asset+' is empty');const text=fs.readFileSync(local,'utf8');assert(/<svg[^>]+\bwidth="[\d.]+"[^>]+\bheight="[\d.]+"/.test(text),asset+' has invalid SVG geometry');}
console.log(`PASS: ${files.length} CSS files, ${definitions.size} tokens, no unresolved references/cycles; ${assets.length} local component SVGs`);

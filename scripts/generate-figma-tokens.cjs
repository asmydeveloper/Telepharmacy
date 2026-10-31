const fs=require('node:fs');
const data=JSON.parse(fs.readFileSync('src/design-system/figma-tokens.json','utf8'));
const lines=['/* Figma Telepharmacy foundations. Source: src/design-system/figma-tokens.json. */',':root {'];
for(const [key,raw] of Object.entries(data.variables)) {
 const value=/^(space-|radius-|layout-|component-)/.test(key)?raw+'px':key.startsWith('motion-')?raw+'ms':raw;
 lines.push(`  --${key}:${value};`);
}
lines.push('  --font-family-ui:"Noto Sans Thai","Leelawadee UI",system-ui,sans-serif;','  --font:var(--font-family-ui);','  --font-weight-regular:400; --font-weight-medium:500; --font-weight-semibold:600;');
for(const [key,value] of Object.entries(data.typography)) {
 const match=value.match(/size: (\d+), weight: (\d+), lineHeight: (\d+)/);if(!match)continue;
 const [,size,weight,line]=match,name=key.replaceAll('/','-');
 lines.push(`  --type-${name}-size:${size}px; --type-${name}-weight:${weight}; --type-${name}-line:${line}px;`);
}
lines.push('  --shadow-sm:0 2px 8px #0000000a; --shadow-md:0 8px 24px #0000001f; --shadow-lg:0 16px 48px #00000033;','  --motion-easing:cubic-bezier(.2,0,0,1);','  --color-primary-rgb:0 95 105; --color-primary-deep-rgb:0 77 85; --color-ink-rgb:23 23 23;','}');
const output=lines.join('\n')+'\n',file='src/styles/figma-tokens.css';
if(process.argv.includes('--check')) {if(fs.readFileSync(file,'utf8')!==output)throw Error('Figma tokens out of sync; run npm run design:sync');console.log('PASS: Figma token source matches generated CSS')}
else {fs.writeFileSync(file,output);console.log('Generated '+file)}

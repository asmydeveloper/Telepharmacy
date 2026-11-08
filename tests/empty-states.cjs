const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {harness,source} = require('./health-harness.cjs');
const h=harness();
const art=html=>{
  const images=[...html.matchAll(/<img[^>]*src="(\/assets\/empty\/[^"]+)"[^>]*>/g)];
  assert(images.length,'Empty state has a contextual illustration');
  for(const [tag,path] of images){assert(tag.includes('alt=""'));assert(tag.includes('aria-hidden="true"'));const svg=fs.readFileSync('public'+path,'utf8');assert(svg.includes('viewBox="0 0 120 96"'));assert(!/script|foreignObject|https?:\/\/(?!www.w3.org)/.test(svg));}
};
for(const state of ['empty','no-results']){const view=harness();view.S.st.history=state;view.screens.history.prep(view.S);art(view.screens.history.render({S:view.S,state,params:{}}));}
for(const topic of ['users','map-pin','store','heart','pill','history','receipt','bell','clipboard-list','file-search']) art(h.TP.ui.empty({icon:topic,title:'Empty test'}));
const consoleSource=fs.readFileSync('public/runtime/console.js','utf8');const context=vm.createContext({ui:{}});const a=consoleSource.indexOf('ui.emptyArt ='),b=consoleSource.indexOf('ui.empty =',a);vm.runInContext(consoleSource.slice(a,b),context);
for(const topic of [...consoleSource.matchAll(/ui.empty\(\{ icon: '([^']+)'/g)].map(m=>m[1])) art(context.ui.emptyArt(topic));
const fileSearch=fs.readFileSync('public/assets/empty/file-search.svg','utf8'),history=fs.readFileSync('public/assets/empty/history.svg','utf8');assert.notEqual(fileSearch,history);
console.log('PASS: empty/no-results, contextual assets for customer and console, decorative accessibility and safe local SVGs');

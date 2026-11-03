const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const data=JSON.parse(fs.readFileSync('public/assets/data/thailand/boundaries/104801.json'));
const source=fs.readFileSync('public/runtime/address-map.js','utf8'),engine=fs.readFileSync('public/runtime/address-map-engine.js','utf8');
const maps=[],markers=[],requests=[],nodes=Object.fromEntries(['canvas','status','save','edit','center','retry'].map(k=>['.address-map-'+k,{hidden:true,disabled:true,classList:{toggle(){}},textContent:''}]));
class NativeMap{constructor(){this.events={};this.layers=[];maps.push(this);}addControl(){}jumpTo(o){this.view=o;}on(k,cb){this.events[k]=cb;}once(k,cb){this.events[k]=cb;}isStyleLoaded(){return false;}addSource(){}addLayer(l){this.layers.push(l);}resize(){}remove(){}}
class NativeMarker{constructor(o){this.el=o.element;this.events={};markers.push(this);}setLngLat(p){this.p=p;return this;}getLngLat(){return{lng:this.p[0],lat:this.p[1]};}addTo(){return this;}on(k,cb){this.events[k]=cb;}setDraggable(v){this.draggable=v;}}
const document={createElement:()=>({classList:{toggle(){}}})};
const window={maplibregl:{Map:NativeMap,Marker:NativeMarker,AttributionControl:class{},NavigationControl:class{}},TP:{thaiAddressData:{load:async()=>JSON.parse(fs.readFileSync('public/assets/data/thailand/addresses.json'))}}};
const context=vm.createContext({window,document,console,setTimeout,clearTimeout,AbortController,URLSearchParams,fetch:async u=>{requests.push(u);return requests.length===1?{ok:false}:{ok:true,json:async()=>data};}});
vm.runInContext(engine,context);vm.runInContext(source,context);
const scope={addEventListener(){},removeEventListener(){}},host={dataset:{},isConnected:true,closest:()=>scope,querySelector:k=>nodes[k],set innerHTML(v){this.html=v;}};
const a={first:'สมใจ',last:'ใจดี',phone:'0812345678',house:'88/12',dist:'ทวีวัฒนา',amp:'ทวีวัฒนา',prov:'กรุงเทพมหานคร',zip:'10170'};
window.TPAddressMap.bind(host,{read:()=>a,onSave:p=>{a.pin=true;a.location=p;},onInvalid:()=>{a.pin=false;},ctx:{}});
setTimeout(()=>{try{
 assert.equal(requests.length,2);assert.equal(requests[0],'/assets/data/thailand/boundaries/104801.json','real postal dataset code 101906 must resolve by exact names');assert(requests[1].startsWith('/api/address-boundary'));assert.equal(markers.length,1);assert.equal(maps[0].view.zoom,18);assert(!nodes['.address-map-save'].disabled);maps[0].events.load();assert.equal(maps[0].layers.length,2);
 nodes['.address-map-save'].onclick();assert(a.pin);assert.equal(a.location.code,'104801','save canonical geometry code, not legacy postal code');assert(nodes['.address-map-save'].hidden);assert(!nodes['.address-map-edit'].hidden);nodes['.address-map-edit'].onclick();assert(markers[0].draggable);assert(!nodes['.address-map-save'].hidden);
 host._addressMap.cleanup();console.log('PASS: real adapter + controller, static boundary failure recovered via API, marker visible before style load, zoom 18, save/edit works');
}catch(e){console.error(e);process.exitCode=1;}},280);

const assert=require('node:assert/strict'),fs=require('node:fs');
const M=require('../public/runtime/address-map.js');
const fixture=JSON.parse(fs.readFileSync('tests/fixtures/tambon-104801.geojson'));
let failures=2,mapCount=0,removals=0,saved=0,invalid=0,marker;const zooms=[];
const a={first:'สมใจ',last:'ใจดี',phone:'0812345678',house:'88/12',dist:'ทวีวัฒนา',amp:'ทวีวัฒนา',prov:'กรุงเทพมหานคร',zip:'10170'};
const nodes=Object.fromEntries(['canvas','status','save','edit','center','retry'].map(k=>['.address-map-'+k,{disabled:true,hidden:true,textContent:'',className:''}]));
const scope={addEventListener(){},removeEventListener(){}};
const host={dataset:{},hidden:true,isConnected:true,closest:()=>scope,querySelector:k=>nodes[k],set innerHTML(v){this.html=v;for(const n of Object.values(nodes)){n.disabled=true;n.hidden=true;}}};
const bounds={getNorth:()=>14,getEast:()=>101,extend(){return this;}};
global.TP={thaiAddressData:{load:async()=>JSON.parse(fs.readFileSync('public/assets/data/thailand/addresses.json'))}};
global.L={map(){mapCount++;return{setView(p,z){zooms.push(z);return this;},fitBounds(){},remove(){removals++;},on(){},invalidateSize(){}};},tileLayer(){return{addTo(){return this;},on(){return this;}};},control:{zoom:()=>({addTo(){}})},geoJSON:()=>({addTo(){return this;},getBounds:()=>bounds}),divIcon:x=>x,marker(p){const events={};marker={point:p,events,addTo(){return this;},getLatLng(){return{lat:this.point[0],lng:this.point[1]};},setLatLng(p){this.point=p;},setDraggable(v){this.draggable=v;},getElement:()=>({classList:{toggle(){}}}),on(k,cb){events[k]=cb;return this;}};return marker;}};
global.fetch=async()=> failures-->0?{ok:false}:{ok:true,json:async()=>fixture};
const wait=()=>new Promise(r=>setTimeout(r,260));
(async()=>{
 const originalError=console.warn;console.warn=()=>{};
 try{
 M.bind(host,{read:()=>a,onSave:p=>{saved++;a.pin=true;a.location=p;},onInvalid:()=>{invalid++;a.pin=false;},ctx:{onLeave(){}}});await wait();
 assert.equal(mapCount,1,'base map must initialize even when boundary service fails');assert(nodes['.address-map-save'].disabled);assert(!nodes['.address-map-retry'].hidden);assert.match(nodes['.address-map-status'].textContent,/ขอบเขต/);
 nodes['.address-map-retry'].onclick();await wait();assert.equal(mapCount,2);assert.equal(removals,1,'retry removes previous map container');assert(!nodes['.address-map-save'].disabled);nodes['.address-map-save'].onclick();assert.equal(saved,1);
 assert.equal(zooms.at(-1),18);assert(nodes['.address-map-save'].hidden);assert(!nodes['.address-map-edit'].hidden);assert.equal(marker.draggable,false);
 nodes['.address-map-edit'].onclick();assert.equal(marker.draggable,true);assert(!nodes['.address-map-save'].hidden);assert.equal(zooms.at(-1),18);
 marker.point=[14.9,101];marker.events.dragend();assert(nodes['.address-map-save'].disabled);nodes['.address-map-save'].onclick();assert.equal(saved,1,'outside coordinates cannot save even through direct handler');assert(invalid>0);
 marker.point=[a.location.lat,a.location.lng];marker.events.dragend();nodes['.address-map-save'].onclick();assert.equal(saved,2,'can edit and save again after initial confirmation');assert(!nodes['.address-map-edit'].hidden);nodes['.address-map-center'].onclick();assert.equal(zooms.at(-1),18);
 host._addressMap.cleanup();assert.equal(removals,2);
 M.bind(host,{read:()=>a,onSave:p=>{a.pin=true;a.location=p;},onInvalid:()=>{a.pin=false;},ctx:{state:'map-error'}});await wait();assert.match(nodes['.address-map-status'].textContent,/ขอบเขต/);assert(!nodes['.address-map-retry'].hidden);nodes['.address-map-retry'].onclick();await wait();assert.equal(host.dataset.mapError,undefined);assert(!nodes['.address-map-edit'].hidden,'simulated failure must recover after retry');assert.equal(marker.draggable,false);host._addressMap.cleanup();
 console.log('PASS: map initializes before boundary request, failure blocks save, retry reinitializes cleanly, outside pin cannot save, cleanup removes map');
 }finally{console.warn=originalError;}
})().catch(e=>{console.error(e);process.exitCode=1;});

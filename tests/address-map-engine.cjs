const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const calls=[];class Map{constructor(o){calls.push(['map',o]);}jumpTo(o){calls.push(['jump',o]);}fitBounds(b,o){calls.push(['bounds',b,o]);}addControl(){}on(){}remove(){}resize(){}isStyleLoaded(){return true;}addSource(id,o){calls.push(['source',id,o]);}addLayer(o){calls.push(['layer',o]);}}
class Marker{constructor(o){this.element=o.element;}setLngLat(p){this.p=p;return this;}addTo(){}getLngLat(){return{lng:this.p[0],lat:this.p[1]};}on(){}setDraggable(v){this.draggable=v;}}
const window={maplibregl:{Map,Marker,AttributionControl:class{},NavigationControl:class{}}};
vm.runInNewContext(fs.readFileSync('public/runtime/address-map-engine.js','utf8'),{window,document:{createElement:()=>({})}});
const E=window.TPMapEngine,m=E.map({});m.setView([13.75,100.5],15);assert.deepEqual(Array.from(calls.find(c=>c[0]==='jump')[1].center),[100.5,13.75]);
const feature={type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[100,13],[101,13],[101,14],[100,14],[100,13]]]}};
const layer=E.geoJSON(feature).addTo(m);m.fitBounds(layer.getBounds());assert.equal(calls.filter(c=>c[0]==='layer').length,2);
const marker=E.marker([13.7,100.4],{icon:{className:'pin',html:''},title:'บ้าน'}).addTo(m);assert.equal(marker.getLatLng().lng,100.4);marker.setLatLng({lat:13.8,lng:100.6});assert.equal(marker.getLatLng().lat,13.8);assert.doesNotThrow(()=>marker.setDraggable(false));assert.equal(calls.find(c=>c[0]==='map')[1].maxZoom,20);
const style=JSON.parse(fs.readFileSync('public/assets/data/thailand/delivery-map-style.json'));assert(style.layers.filter(l=>l.type==='symbol').length<=6);assert(!style.layers.some(l=>l.id.includes('building')));assert(style.layers.some(l=>l.id==='highway-name-major'));
console.log('PASS: MapLibre renderer contract, lat/lng order, boundary overlay, movable marker and uncluttered local map style');

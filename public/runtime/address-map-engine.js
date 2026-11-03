/* MapLibre presentation adapter. Geometry validation stays in address-map.js. */
(function(root){
 'use strict';
 const gl=root.maplibregl;
 const boundsOf=f=>{const xy=[];function walk(c){if(typeof c[0]==='number')xy.push(c);else c.forEach(walk);}walk(f.geometry.coordinates);const xs=xy.map(p=>p[0]),ys=xy.map(p=>p[1]);const b={west:Math.min(...xs),east:Math.max(...xs),south:Math.min(...ys),north:Math.max(...ys),getNorth(){return this.north;},getEast(){return this.east;},extend(p){this.west=Math.min(this.west,p[1]);this.east=Math.max(this.east,p[1]);this.south=Math.min(this.south,p[0]);this.north=Math.max(this.north,p[0]);return this;}};return b;};
 const engine={
  map(container){
   const native=new gl.Map({container,style:'/assets/data/thailand/delivery-map-style.json',center:[100.5,13.75],zoom:11,maxZoom:20,attributionControl:false,dragRotate:false,pitchWithRotate:false,scrollZoom:false});
   native.addControl(new gl.AttributionControl({compact:true}),'bottom-right');
   const wrapper={native,setView(p,z){native.jumpTo({center:[p[1],p[0]],zoom:z});return this;},fitBounds(b,o={}){native.fitBounds([[b.west,b.south],[b.east,b.north]],{padding:12,maxZoom:o.maxZoom||17,duration:0});return this;},remove(){native.remove();},invalidateSize(){native.resize();},on(event,cb){native.on(event,e=>cb(event==='click'?{latlng:{lat:e.lngLat.lat,lng:e.lngLat.lng}}:e));return this;}};
   return wrapper;
  },
  tileLayer(){let callback;return{addTo(map){map.native.on('error',e=>{if(e.error?.status||e.error?.message?.includes('fetch'))callback?.();});return this;},on(event,fn){callback=fn;return this;}};},
  control:{zoom:()=>({addTo(map){map.native.addControl(new gl.NavigationControl({showCompass:false}),'top-right');}})},
  geoJSON(feature){return{addTo(map){const draw=()=>{map.native.addSource('delivery-area',{type:'geojson',data:feature});map.native.addLayer({id:'delivery-area-fill',type:'fill',source:'delivery-area',paint:{'fill-color':'#005c67','fill-opacity':.025}});map.native.addLayer({id:'delivery-area-border',type:'line',source:'delivery-area',paint:{'line-color':'#005c67','line-opacity':.45,'line-width':1.5,'line-dasharray':[3,3]}});};if(map.native.isStyleLoaded())draw();else map.native.once('load',draw);return this;},getBounds:()=>boundsOf(feature)};},
  divIcon:options=>options,
  marker(p,options){const element=document.createElement('div');element.className=options.icon.className;element.innerHTML=options.icon.html;element.title=options.title;const marker=new gl.Marker({element,draggable:true,anchor:'bottom'}).setLngLat([p[1],p[0]]);return{addTo(map){marker.addTo(map.native);return this;},on(k,fn){marker.on(k,fn);return this;},getLatLng(){const p=marker.getLngLat();return{lat:p.lat,lng:p.lng};},setLatLng(p){marker.setLngLat(Array.isArray(p)?[p[1],p[0]]:[p.lng,p.lat]);return this;},setDraggable(value){marker.setDraggable(value);return this;},getElement:()=>element};}
 };
 root.TPMapEngine=engine;
})(window);

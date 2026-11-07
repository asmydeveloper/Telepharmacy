/* Shared location adapter. Only administrative codes leave this module, never house addresses. */
(function(root){'use strict';
const key=a=>['house',...(a?.building?.trim()?['building']:[]),'alley','road','dist','amp','prov','zip'].map(k=>String(a?.[k]||'').trim()).join('|');
const complete=a=>!!a&&!Object.keys(errors(a)).length;
function ring(p,r){let inside=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[j],b=r[i],cross=(p[1]-a[1])*(b[0]-a[0])-(p[0]-a[0])*(b[1]-a[1]);if(Math.abs(cross)<1e-12&&p[0]>=Math.min(a[0],b[0])-1e-10&&p[0]<=Math.max(a[0],b[0])+1e-10&&p[1]>=Math.min(a[1],b[1])-1e-10&&p[1]<=Math.max(a[1],b[1])+1e-10)return true;if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function contains(g,p){if(!p.every(Number.isFinite))return false;return(g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[]).some(poly=>ring(p,poly[0])&&!poly.slice(1).some(h=>ring(p,h)));}
function interior(g,preferred){if(preferred?.every(Number.isFinite)&&contains(g,preferred))return preferred;const polygons=g.type==='Polygon'?[g.coordinates]:g.coordinates;for(const poly of polygons){const points=poly[0],xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);for(let n=1;n<32;n++)for(let m=1;m<32;m++){const p=[x0+(x1-x0)*n/32,y0+(y1-y0)*m/32];if(contains(g,p))return p;}if(contains(g,points[0]))return points[0];}throw Error('Boundary has no usable point');}
const valid=a=>!!(complete(a)&&a?.pin&&a.location?.verified&&a.location.addressKey===key(a)&&/^\d{6}$/.test(a.location.code)&&Number.isFinite(a.location.lat)&&Number.isFinite(a.location.lng));
function errors(a={},rows,requireLabel=false){
 const e={},name=/^[\p{L}\p{M}][\p{L}\p{M} .’'-]{0,49}$/u;
 if(requireLabel&&!String(a.label||'').trim())e.label='กรอกชื่อที่อยู่';
 for(const k of ['first','last'])if(!name.test(String(a[k]||'').trim()))e[k]='กรอก'+(k==='first'?'ชื่อ':'นามสกุล')+'ให้ถูกต้อง ไม่ใช้ตัวเลขหรือสัญลักษณ์พิเศษ';
 if(!/^0[689][0-9]{8}$/.test(String(a.phone||'')))e.phone='กรอกเบอร์มือถือ 10 หลัก ขึ้นต้นด้วย 06, 08 หรือ 09';
 if(!String(a.house||'').trim())e.house='กรอกบ้านเลขที่';
 else if(String(a.house).length>200||!/[\p{L}\p{N}]/u.test(a.house))e.house='กรอกรายละเอียดที่อยู่ให้ถูกต้อง ไม่เกิน 200 ตัวอักษร';
 for(const [k,label,max]of [['building','หมู่บ้าน / อาคาร / ห้อง / ชั้น',200],['alley','ซอย',100],['road','ถนน',100]]){const v=String(a[k]||'').trim();if(v&&(v.length>max||!/[\p{L}\p{N}]/u.test(v)))e[k]='กรอก'+label+'ให้ถูกต้อง ไม่เกิน '+max+' ตัวอักษร';}
 for(const [k,label]of [['prov','จังหวัด'],['amp','อำเภอ / เขต'],['dist','ตำบล / แขวง']])if(!String(a[k]||'').trim())e[k]='เลือก'+label;
 if(!/^[0-9]{5}$/.test(String(a.zip||'')))e.zip='เลือกตำบล / แขวง เพื่อเติมรหัสไปรษณีย์ 5 หลัก';
 if(rows&&a.prov&&a.amp&&a.dist&&!rows.some(r=>r.province===a.prov&&r.amphoe===a.amp&&r.district===a.dist&&String(r.zipcode)===String(a.zip)))e.dist='เลือกจังหวัด อำเภอ และตำบลให้สัมพันธ์กัน';
 if(a.label&&String(a.label).trim().length>40)e.label='ชื่อที่อยู่ต้องไม่เกิน 40 ตัวอักษร';
 return e;
}
function addressValues(scope){return Object.fromEntries(['label','first','last','phone','house','building','alley','road','prov','amp','dist','zip'].map(k=>[k,scope.querySelector('#home-address-'+k)?.value.trim()||'']));}
function mountValidation(scope,ctx){
 if(scope._validateAddressForm)return;const touched=new Set();
 function validate(all=false){const a=addressValues(scope),e=errors(a,root.TP.thaiAddressData.rows,true);if(!root.TP.thaiAddressData.rows)e.prov='กำลังโหลดข้อมูลพื้นที่ กรุณาลองอีกครั้ง';
  for(const k of Object.keys(a)){if(all)touched.add(k);const input=scope.querySelector('#home-address-'+k),msg=scope.querySelector('#home-address-'+k+'-error');if(!input||!msg)continue;const text=(all||touched.has(k))?e[k]||'':'';input.setAttribute('aria-invalid',String(!!text));input.closest('[data-address-field]')?.classList.toggle('err',!!text);msg.textContent=text;msg.hidden=!text;}
  const summary=scope.querySelector('#home-address-error');if(summary)summary.textContent='';
  if(all&&Object.keys(e).length){const k=Object.keys(e)[0];(scope.querySelector('#home-address-'+k+'-trigger')||scope.querySelector('#home-address-'+k))?.focus();}
  return !Object.keys(e).length;
 }
 scope._validateAddressForm=validate;
 const changed=e=>{const k=e.target.id?.replace('home-address-','');if(!e.target.id?.startsWith('home-address-'))return;if(e.type==='focusout'||e.type==='change')touched.add(k);validate();};
 if(ctx?.state==='invalid'||ctx?.state?.startsWith('form-'))setTimeout(()=>validate(true),0);
 scope.addEventListener('input',changed);scope.addEventListener('change',changed);scope.addEventListener('focusout',changed);
}
const assetVersion=(()=>{try{return new URL(document.currentScript.src,location.href).searchParams.get('v')||'2';}catch{return '2';}})();
let promise;
function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');const timer=setTimeout(()=>{script.remove();reject(Error('library'));},15000);script.src=src;script.onload=()=>{clearTimeout(timer);resolve();};script.onerror=()=>{clearTimeout(timer);script.remove();reject(Error('library'));};document.head.append(script);});}
function leaflet(){
 if(root.TPMapEngine)return Promise.resolve(root.TPMapEngine);
 // Unit harness supplies the same renderer contract without opening a browser.
 if(typeof module!=='undefined'&&root.L?.map)return Promise.resolve(root.L);
 if(promise)return promise;
 promise=(async()=>{if(!document.querySelector('link[data-delivery-map]')){const css=document.createElement('link');css.rel='stylesheet';css.href='/vendor/maplibre/maplibre-gl.css';css.dataset.deliveryMap='';document.head.append(css);}if(!root.maplibregl)await loadScript('/vendor/maplibre/maplibre-gl.js');await loadScript('/runtime/address-map-engine.js?v='+encodeURIComponent(assetVersion));if(!root.TPMapEngine)throw Error('library');return root.TPMapEngine;})().catch(e=>{promise=null;throw e;});return promise;
}
async function boundaryFor(row,signal){
 // Postal address codes can be legacy codes; resolve exact administrative identity.
 const localRows=[['กรุงเทพมหานคร','ทวีวัฒนา','ทวีวัฒนา','104801'],['กรุงเทพมหานคร','ทวีวัฒนา','ศาลาธรรมสพน์','104802'],['กรุงเทพมหานคร','คลองเตย','คลองเตย','103301']];
 const match=localRows.find(r=>r[0]===row.province&&r[1]===row.amphoe&&r[2]===row.district);
 const code=match?.[3]||row.district_code;
 const id=String(code),local=['104801','104802','103301'].includes(id);
 const query=new URLSearchParams({code:id,province:row.province,amphoe:row.amphoe,district:row.district});const api='/api/address-boundary?'+query;
 const urls=local?['/assets/data/thailand/boundaries/'+id+'.json',api]:[api];
 for(const url of urls){try{
  const r=await fetch(url,{signal,cache:'no-cache'});if(!r.ok)throw Error('boundary');
  const data=await r.json(),feature=data.features?.find(f=>/^\d{6}$/.test(String(f.properties?.TAM_CODE))&&f.properties.PROV_NAM_T===row.province&&f.properties.AMP_NAM_T===row.amphoe&&f.properties.TAM_NAM_T===row.district&&['Polygon','MultiPolygon'].includes(f.geometry?.type));
  if(!feature)throw Error('boundary');return feature;
 }catch(e){if(signal.aborted)throw e;}}
 throw Error('boundary');
}
function bind(host,{read,onSave,onInvalid,ctx}){if(host._addressMap)return;let map,marker,boundary,stage='address',editing=true,simulateBoundaryError=ctx?.state==='map-error',current='',last='',disposed=false,timer,controller;const scope=host.closest('.scr,#sheet');
const clear=()=>{controller?.abort();map?.remove();map=null;marker=null;boundary=null;};const cleanup=()=>{disposed=true;clearTimeout(timer);clear();host._addressMap=null;scope?.removeEventListener('input',schedule);scope?.removeEventListener('change',schedule);};host._addressMap={cleanup};ctx?.onLeave?.(cleanup);
const status=(text,tone='')=>{const n=host.querySelector('.address-map-status');if(n){n.textContent=text;n.className='address-map-status '+tone;}};
function evaluate(){if(!marker||!boundary)return false;const p=marker.getLatLng(),ok=contains(boundary,[p.lng,p.lat]);host.querySelector('.address-map-save').disabled=!ok||!editing;marker.getElement()?.classList.toggle('is-outside',!ok);status(ok?'หมุดอยู่ในเขตที่อยู่ กดยืนยันเมื่ออยู่ตรงบ้าน':'ระยะไม่สอดคล้องกับที่อยู่ปัจจุบัน กรุณาขยับหมุดกลับเข้าเขตตำบล/แขวง',ok?'':'is-error');return ok;}
async function show(){const a=read();if(!complete(a)){clear();host.hidden=true;current='';return;}const k=key(a);if(current===k)return;clear();current=k;host.hidden=false;host.innerHTML='<div class="address-map-heading"><b>ตำแหน่งสำหรับส่งยา</b><span>จำเป็น</span></div><p class="address-map-help">ขยับหมุดให้ตรงบ้าน ภายในตำบล/แขวงที่กรอกไว้</p><div class="address-map-canvas" tabindex="0" aria-label="แผนที่ตำแหน่งบ้าน ใช้ปุ่มลูกศรขยับหมุด"></div><p class="address-map-status" role="status" aria-live="polite">กำลังโหลดแผนที่และขอบเขตตำบล…</p><button type="button" class="btn primary address-map-save" disabled>บันทึกตำแหน่ง</button><button type="button" class="btn secondary address-map-edit" hidden>แก้ไขตำแหน่ง</button><button type="button" class="btn secondary address-map-center" hidden>กลับมาที่หมุด</button><button type="button" class="btn secondary address-map-retry" hidden>โหลดแผนที่อีกครั้ง</button>';const retryButton=host.querySelector('.address-map-retry');retryButton.onclick=()=>{current='';show();};controller=new AbortController();const signal=controller.signal;
try{const TP=root.TP,dataRows=await TP.thaiAddressData.load(),rows=Array.isArray(dataRows)?dataRows:TP.thaiAddressData.rows;const row=rows.find(r=>r.province===a.prov&&r.amphoe===a.amp&&r.district===a.dist&&String(r.zipcode)===String(a.zip));if(!row)throw Error('address');stage='library';const L=await leaflet();if(disposed||!host.isConnected||key(read())!==k)return;
stage='renderer';map=L.map(host.querySelector('.address-map-canvas'),{zoomControl:false,scrollWheelZoom:false}).setView([13.75,100.5],11);L.tileLayer(root.TP_MAP_TILE_URL||'https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(map).on('tileerror',()=>{status('โหลดถนนบางส่วนไม่ได้ กรุณาลองอีกครั้ง','is-error');retryButton.hidden=false;});L.control.zoom({position:'topright'}).addTo(map);status('กำลังตรวจสอบขอบเขตตำบล…');
stage='boundary';if(simulateBoundaryError){simulateBoundaryError=false;throw Error('boundary');}
const f=await boundaryFor(row,signal);if(disposed||!host.isConnected||key(read())!==k)return;boundary=f.geometry;
stage='marker';const layer=L.geoJSON(f,{style:{color:'#005c67',weight:2,fillOpacity:.035,dashArray:'5 5'}});const savedInside=valid(a)&&a.location.code===String(f.properties.TAM_CODE)&&contains(boundary,[a.location.lng,a.location.lat]);if(valid(a)&&!savedInside)onInvalid();let p=savedInside?[a.location.lat,a.location.lng]:[Number(f.properties.Centroid_y),Number(f.properties.Centroid_x)];const initial=interior(boundary,[p[1],p[0]]);p=[initial[1],initial[0]];
if(ctx?.state==='map-outside'){const b=layer.getBounds();p=[b.getNorth()+.003,b.getEast()+.003];onInvalid();}
editing=!savedInside||ctx?.state==='map-outside';
marker=L.marker(p,{draggable:true,keyboard:true,autoPan:true,title:'ตำแหน่งส่งยา',icon:L.divIcon({className:'address-marker',html:'<span></span>',iconSize:[32,42],iconAnchor:[16,42]})}).addTo(map);const editButton=host.querySelector('.address-map-edit'),saveButton=host.querySelector('.address-map-save'),centerButton=host.querySelector('.address-map-center');
const controls=()=>{marker.setDraggable?.(editing);saveButton.hidden=!editing;editButton.hidden=editing;centerButton.hidden=false;};
controls();map.setView(p,18);stage='overlay';layer.addTo(map);delete host.dataset.mapError;
editButton.onclick=()=>{editing=true;controls();const point=marker.getLatLng();map.setView([point.lat,point.lng],18);evaluate();status('ลากหมุดหรือแตะแผนที่ให้ตรงบ้าน แล้วกดบันทึกตำแหน่ง');};
centerButton.onclick=()=>{const point=marker.getLatLng();map.setView([point.lat,point.lng],18);};
const moved=()=>{if(!editing)return;onInvalid();saveButton.textContent='บันทึกตำแหน่ง';evaluate();};marker.on('dragstart',()=>{if(!editing)return;onInvalid();host.querySelector('.address-map-save').disabled=true;});marker.on('dragend',moved);map.on('click',e=>{if(!editing)return;marker.setLatLng(e.latlng);moved();});host.querySelector('.address-map-canvas').onkeydown=e=>{if(!editing)return;const d={ArrowUp:[.0001,0],ArrowDown:[-.0001,0],ArrowLeft:[0,-.0001],ArrowRight:[0,.0001]}[e.key];if(!d)return;e.preventDefault();const p=marker.getLatLng();marker.setLatLng([p.lat+d[0],p.lng+d[1]]);moved();};const inside=evaluate();if(inside)status(valid(a)?'บันทึกตำแหน่งแล้ว · กดแก้ไขตำแหน่งได้เสมอ':'ตำแหน่งเริ่มต้นจากตำบล/แขวง กรุณาขยับหมุดให้ตรงบ้าน');host.querySelector('.address-map-save').onclick=()=>{if(!editing||key(read())!==k||!evaluate())return;const p=marker.getLatLng();onSave({lat:p.lat,lng:p.lng,code:String(f.properties.TAM_CODE),addressKey:k,verified:true,source:'DDPM',confirmedAt:new Date().toISOString()});editing=false;controls();saveButton.disabled=true;status('บันทึกตำแหน่งแล้ว · กดแก้ไขตำแหน่งได้เสมอ','is-success');};setTimeout(()=>map?.invalidateSize(),100);
}catch(e){if(signal.aborted||disposed||key(read())!==k)return;status(e.message==='address'?'ข้อมูลจังหวัด อำเภอ ตำบล และรหัสไปรษณีย์ไม่สัมพันธ์กัน':stage==='library'?'โหลดตัวแผนที่ไม่ได้ กรุณาลองอีกครั้ง':stage==='boundary'?'โหลดขอบเขตตำบลไม่ได้ ยังบันทึกหมุดไม่ได้ กรุณาลองอีกครั้ง':'แสดงหมุดบนแผนที่ไม่สำเร็จ กรุณาลองอีกครั้ง','is-error');host.dataset.mapError=stage+': '+(e.message||e.name||'unknown');console.warn('[address-map]',stage,e.stack||e.message||e.name);host.querySelector('.address-map-save').disabled=true;const b=host.querySelector('.address-map-retry');b.hidden=false;b.onclick=()=>{current='';show();};}}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>{const k=key(read());if(last&&last!==k)onInvalid();last=k;show();},200);}scope?.addEventListener('input',schedule);scope?.addEventListener('change',schedule);schedule();}
function installAddressSelects(scope,ctx){
 if(scope._areaSelects)return;scope._areaSelects=true;
 const old=Object.fromEntries(['prov','amp','dist'].map(k=>[k,scope.querySelector('#home-address-'+k)]));if(!old.prov)return;
 const values=Object.fromEntries(Object.entries(old).map(([k,n])=>[k,n.value]));
 const controls=Object.fromEntries(Object.entries(old).map(([k,n])=>{const s=n.tagName==='SELECT'?n:document.createElement('select');s.id=n.id;s.name=n.name;s.className='input';s.required=true;s.disabled=true;if(s!==n)n.replaceWith(s);return[k,s];}));
 root.TP.thaiAddressData.load().then(rows=>{if(!scope.isConnected)return;
 const fill=(k,options)=>{const s=controls[k];s.replaceChildren();const ph=new Option('เลือก'+({prov:'จังหวัด',amp:'อำเภอ / เขต',dist:'ตำบล / แขวง'})[k],'');s.add(ph);options.forEach(v=>s.add(new Option(v,v)));s.value=options.includes(values[k])?values[k]:'';values[k]=s.value;s.disabled=!options.length;};
 const populate=()=>{fill('prov',[...new Set(rows.map(r=>r.province))].sort());const ps=rows.filter(r=>r.province===values.prov);fill('amp',[...new Set(ps.map(r=>r.amphoe))].sort());const ds=ps.filter(r=>r.amphoe===values.amp);fill('dist',[...new Set(ds.map(r=>r.district))].sort());const zip=scope.querySelector('#home-address-zip');zip.readOnly=true;zip.value=String(ds.find(r=>r.district===values.dist)?.zipcode||'');root.TP.mountDesignSelects(scope,ctx);};
 for(const [k,s]of Object.entries(controls))s.addEventListener('change',()=>{values[k]=s.value;if(k==='prov')values.amp=values.dist='';if(k==='amp')values.dist='';populate();});populate();controls.dist.dispatchEvent(new Event('change',{bubbles:true}));
 }).catch(()=>{const error=scope.querySelector('#home-address-error');if(error)error.textContent='โหลดข้อมูลพื้นที่ไม่ได้ กรุณากลับมาเปิดหน้านี้อีกครั้ง';});
}
// Address maps are paused by user request; keep select loading and form validation active.
function mount(scope,ctx){if(scope.querySelector('.hm-address-form')){installAddressSelects(scope,ctx);mountValidation(scope,ctx);}}
root.TPAddressMap={key,complete,errors,contains,interior,valid,mount,bind};if(typeof module!=='undefined')module.exports=root.TPAddressMap;
})(typeof window!=='undefined'?window:globalThis);

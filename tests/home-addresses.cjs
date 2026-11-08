const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('public/runtime/customer.js', 'utf8');
const registrations = {}, actions = {}, storage = new Map();
const addresses = [{id:'a1',first:'สมใจ',last:'ใจดี',house:'88/12',dist:'ทวีวัฒนา',prov:'กรุงเทพมหานคร',main:true},{id:'a2',first:'สมใจ',last:'ใจดี',house:'99/9',dist:'คลองเตย',prov:'กรุงเทพมหานคร',main:false}];
const TP = {
  S: {addrs:structuredClone(addresses),branch:'tw',branchState:{tw:'open',on:'pause'},st:{},user:{name:'สมใจ'}},
  BRANCHES:[{id:'tw',km:1.2},{id:'on',km:4.8}], ZONE_KM:15,
  fresh:()=>({addrs:structuredClone(addresses)}),
  screen:(id,def)=>registrations[id]=def, sheetDef:(id,def)=>registrations[id]=def,
  act:(id,fn)=>actions[id]=fn, branch(id){return this.BRANCHES.find(b=>b.id===(id||this.S.branch))},
  fmtAddr:a=>a.house+' '+a.dist, refresh:()=>{}, notify:()=>{}, closeSheet:()=>Promise.resolve(), go:()=>{}, sheet:()=>{},
};
const context = vm.createContext({TP,flowPreview:false,ui:{},esc:String,ic:()=>'',location:{search:''},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},URLSearchParams,structuredClone,document:{},console});
const emptyArtMethod=source.match(/  emptyArt\(icon = 'inbox'\) \{[^\n]+/)[0].trim().replace(/,$/,'');
vm.runInContext('Object.assign(ui, {'+emptyArtMethod+'})',context);
const zoneStart=source.indexOf('const ROAD_KM =');
const zoneEnd=source.indexOf('\n',source.indexOf('TP.zoneOf =',zoneStart));
vm.runInContext(source.slice(zoneStart,zoneEnd),context);
const start=source.indexOf('/* C210 / C514 / C515:');
const end=source.indexOf('/* C201: selected nearby pharmacy',start);
const feature=source.slice(start,end);
vm.runInContext(feature,context);
const pickStart=source.indexOf('TP.pickBranch = () => {');
vm.runInContext(source.slice(pickStart,source.indexOf('\n};',pickStart)+3),context);
(async()=>{
  assert.equal(TP.homeAddress().id,'a1');
  assert.equal(TP.homeDistance(TP.BRANCHES[0]),2.4);
  assert.equal(TP.homeStores().map(b=>b.id).join(','),'tw');
  await actions.hmSelectAddress({dataset:{v:'a2'}});
  assert.equal(TP.homeAddress().id,'a2');
  assert.equal(TP.S.addrs.find(a=>a.main).id,'a1','choosing an address must not change the default');
  assert.equal(TP.homeStores().map(b=>b.id).join(','),'on');
  assert.equal(TP.pickBranch().id,'on');
  actions.hmMainAddress({dataset:{v:'a2'}});
  assert.equal(TP.S.addrs.filter(a=>a.main).length,1);
  assert.equal(TP.homeAddress().id,'a2');

  TP.homeScenario(TP.S,'outarea');assert.equal(TP.homeStores().length,0);
  TP.homeScenario(TP.S,'unknownarea');assert.equal(TP.homeStores().length,0);
  TP.homeScenario(TP.S,'noaddress');assert.equal(TP.homeAddress(),null);
  TP.homeScenario(TP.S,'normal');assert.equal(TP.homeAddress().id,'a2');
  const inputs = {};
  for (const [key, value] of Object.entries({first:'ทดสอบ',last:'ผู้รับ',phone:'0812345678',house:'15/2',building:'อาคารบี ห้อง 12',alley:'สุขุมวิท 1',road:'สุขุมวิท',dist:'อ่อนนุช',amp:'สวนหลวง',prov:'กรุงเทพมหานคร',zip:'10250'})) {
    inputs['home-address-'+key] = {value,checkValidity:()=>true,focus:()=>{},reportValidity:()=>{}};
  }
  inputs['home-address-main']={checked:true}; inputs['home-address-error']={textContent:''};
  context.document.getElementById=id=>inputs[id];
  TP.S._homeEditAddress=null;
  inputs['home-address-phone'].checkValidity=()=>false;
  const before=TP.S.addrs.length; actions.hmSaveAddress();
  assert.equal(TP.S.addrs.length,before,'invalid form must not save');
  assert.ok(inputs['home-address-error'].textContent);
  inputs['home-address-phone'].checkValidity=()=>true;
  actions.hmSaveAddress();
  assert.equal(TP.S.addrs.length,before+1);
  assert.equal(TP.homeAddress().house,'15/2');
  assert.equal(TP.homeAddress().road,'สุขุมวิท');
  assert.equal(TP.addressName,undefined);
  assert.equal(JSON.parse(storage.get('mitraree.home.preferences.v1')).addrs.find(a=>a.main).house,'15/2');
  const savedParts=TP.homeAddress();assert(savedParts);for(const k of ['house','building','alley','road'])assert.equal(savedParts[k],inputs['home-address-'+k].value,'persist '+k);
  context.ui.nav=()=>'';context.ui.page=s=>s;context.ui.btn=s=>s;
  TP.S._homeEditAddress=savedParts.id;const editHtml=registrations.addressedit.render({S:TP.S});for(const k of ['house','building','alley','road'])assert(editHtml.includes('id="home-address-'+k+'"'));assert(editHtml.includes('value="อาคารบี ห้อง 12"'));assert(editHtml.includes('value="สุขุมวิท 1"'));
  savedParts.house='15/2 อาคารเก่า ซอยสุขุมวิท 1';savedParts.building='';savedParts.alley='';savedParts.road='';const oldHtml=registrations.addressedit.render({S:TP.S});assert(oldHtml.includes('value="15/2 อาคารเก่า ซอยสุขุมวิท 1"'));assert(oldHtml.includes('ข้อมูลเดิมยังอยู่ครบ'));
  Object.assign(savedParts,{house:'15/2',building:'อาคารบี ห้อง 12',alley:'สุขุมวิท 1',road:'สุขุมวิท'});

  TP.S._homeEditAddress=TP.homeAddress().id;
  inputs['home-address-house'].value='15/3';
  actions.hmSaveAddress();
  assert.equal(TP.S.addrs.length,before+1,'editing must not add another address');
  assert.equal(TP.homeAddress().house,'15/3');
  assert.equal(TP.homeAddress().main,true);
  assert.equal(TP.S.addrs.filter(a=>a.main).length,1);
  assert(!registrations.addressedit.render({S:TP.S}).includes('home-address-label'));
  for(const id of ['homeaddress','addressbook','addressedit']) assert.ok(registrations[id].code && registrations[id].states.length>1);
  assert.equal(new Set(Object.values(registrations).map(d=>d.code)).size,3);
  const modeStart=source.indexOf("TP.act('hmConsultMode'");
  vm.runInContext(source.slice(modeStart,source.indexOf("TP.act('hmChooseStore'",modeStart)),context);
  const startAction=source.indexOf("TP.act('hmStart'");
  vm.runInContext(source.slice(startAction,source.indexOf('\n});',startAction)+4),context);
  TP.ACTS=actions; TP.caseOpen=()=>false; TP.areaGate=()=>'';
  TP.S.intake={mode:'chat'}; TP.S.storeOpen=true; TP.S.sysOff=false; TP.S.case={status:'closed'};
  let navigated=null; TP.go=id=>{navigated=id};
  await actions.hmConsultMode({dataset:{v:'video',branch:'on'}});
  assert.equal(navigated,null,'paused store cannot start consultation');
  TP.S.branchState.on='open';
  await actions.hmConsultMode({dataset:{v:'video',branch:'on'}});
  assert.equal(TP.S.intake.mode,'video'); assert.equal(navigated,'intake');
  await actions.hmConsultMode({dataset:{v:'chat',branch:'on'}});
  assert.equal(TP.S.intake.mode,'chat');
  navigated=null; TP.S.storeOpen=false;
  await actions.hmConsultMode({dataset:{v:'video',branch:'on'}});
  assert.equal(navigated,null,'closed store cannot start consultation');
  const rowsStart=source.indexOf('function storeListHtml(');
  vm.runInContext(source.slice(rowsStart,source.indexOf("TP.sheetDef('allbranches'",rowsStart)),context);
  context.ui.nav=()=>''; context.ui.page=x=>x; context.ui.tag=(label,tone)=>`<span class="tag ${tone}">${label}</span>`; context.ui.btn=label=>label;
  TP.S.storeOpen=true;
  TP.homeScenario(TP.S,'unknownarea');
  const unknownHtml=vm.runInContext('nearbyStoresHtml(TP.S)',context);
  assert.equal((unknownHtml.match(/data-sheet="storeinfo"/g)||[]).length,TP.BRANCHES.length);
  assert.equal((unknownHtml.match(/ตรวจสอบพื้นที่ไม่ได้/g)||[]).length,TP.BRANCHES.length);assert.equal((unknownHtml.match(/ไม่ทราบระยะทาง/g)||[]).length,TP.BRANCHES.length);assert(unknownHtml.includes('ร้านยาใกล้ฉัน'));assert(!unknownHtml.includes('ร้านยาทุกสาขา'));assert(!unknownHtml.includes('นอกพื้นที่ให้บริการ'));
  assert(!unknownHtml.includes('hm-empty'));
  assert(!unknownHtml.includes('storeactions'));
  const detailStart=source.indexOf("TP.sheetDef('storeinfo'");
  vm.runInContext(source.slice(detailStart,source.indexOf("TP.act('hmConsultMode'",detailStart)),context);
  const detail={S:TP.S,params:{branch:'on'}};
  assert.equal(registrations.storeinfo.foot(detail),'','unknown distance cannot start consultation');
  TP.homeScenario(TP.S,'normal');
  TP.S.sysOff=true;
  assert.equal(registrations.storeinfo.foot(detail),'','closed consultation has no action');
  assert(vm.runInContext('storeListHtml(TP.S,[TP.branch("on")])',context).includes('ปิดรับบริการ'));
  TP.S.sysOff=false;
  // Central consult action: join the shortest queue among open branches in coverage; never create a case.
  const savedStores=TP.homeStores,savedAddress=TP.homeAddress;
  TP.homeAddress=()=>({id:'selected'});TP.homeStores=()=>[{id:'near',name:'ใกล้'},{id:'free',name:'ว่าง'},{id:'far',name:'ไกล'}];
  Object.assign(TP.S,{loggedIn:true,storeOpen:true,sysOff:false,branchState:{near:'open',free:'open',far:'open'},queueLen:{near:2,free:0,far:0},intake:{},case:null});
  assert.equal(TP.quickConsultBranch().branch.id,'free');
  TP.S.branchState.free='pause';assert.equal(TP.quickConsultBranch().branch.id,'far');
  TP.S.branchState.far='closed';assert.equal(TP.quickConsultBranch().branch.id,'near','a busy branch still accepts the queue');
  TP.S.branchState.free='open';TP.S.queueLen={near:null,free:3};assert.equal(TP.quickConsultBranch().branch.id,'free','a known queue is chosen before an unknown one');TP.S.queueLen={};assert.equal(TP.quickConsultBranch().branch.id,'near');TP.S.branchState={near:'pause',free:'pause',far:'closed'};assert.equal(TP.quickConsultBranch().reason,'unavailable');TP.S.branchState={near:'open',free:'open',far:'closed'};
  TP.S.queueLen={near:2,free:0,far:0};let routed=[],sheets=[],started=0;TP.go=(...x)=>routed.push(x);TP.sheet=(...x)=>sheets.push(x);TP.caseOpen=()=>false;TP.ACTS=actions;const previousHmStart=actions.hmStart;actions.hmStart=()=>started++;
  actions.quickConsult();assert.equal(TP.S.branch,'free');assert.equal(started,1);assert.equal(TP.S.case,null);
  TP.caseOpen=()=>true;TP.S.case={status:'room',branch:'near'};actions.quickConsult();assert.equal(routed.at(-1)[0],'room');assert.equal(TP.S.branch,'free');assert.equal(started,1);
  TP.caseOpen=()=>false;TP.S.case=null;TP.homeAddress=()=>null;actions.quickConsult();assert.equal(sheets.at(-1)[0],'homeaddress');
  TP.homeAddress=()=>({id:'selected'});TP.homeStores=()=>[];actions.quickConsult();assert.equal(routed.at(-1)[0],'home');assert(!sheets.some(x=>x[0]==='allbranches'));
  TP.homeStores=()=>[{id:'free'}];TP.S.queueLen={};actions.quickConsult();assert.equal(TP.S.branch,'free');assert.equal(started,2);assert(!sheets.some(x=>x[0]==='allbranches'));
  TP.S.sysOff=true;actions.quickConsult();assert.equal(sheets.at(-1)[0],'storeinfo');TP.S.sysOff=false;TP.S.storeOpen=false;actions.quickConsult();assert.equal(sheets.at(-1)[0],'storeinfo');
  TP.S.loggedIn=false;actions.quickConsult();assert.equal(routed.at(-1)[0],'login');actions.hmStart=previousHmStart;TP.homeStores=savedStores;TP.homeAddress=savedAddress;
  const shell=fs.readFileSync('src/app/Shell.jsx','utf8'),nav=shell.slice(shell.indexOf("id: 'tabbar'"),shell.indexOf('</nav>',shell.indexOf('"id": "tabbar"')));assert(nav.indexOf('history')<nav.indexOf('quickConsult'));assert(nav.indexOf('quickConsult')<nav.indexOf('inbox'));assert(nav.includes('aria-label="ปรึกษาเภสัชกร"'));
  {
    const book=registrations.addressbook,toasts=[],savedNotify=TP.notify;TP.notify=m=>toasts.push(m);TP.S.addrs=TP.fresh().addrs;
    TP.S.st.addressbook='main-changed';book.prep(TP.S);assert.equal(TP.S.addrs.find(x=>x.main).id,'a2');
    book.mount(null,{S:TP.S});book.mount(null,{S:TP.S});assert.deepEqual(toasts,['ตั้งเป็นที่อยู่หลักแล้ว'],'the alert shows once');
    TP.S.st.addressbook='normal';book.prep(TP.S);assert.equal(TP.S.addrs.find(x=>x.main).id,'a1','normal restores the primary address');
    TP.S.st.addressbook='address-saved';book.prep(TP.S);book.mount(null,{S:TP.S});assert.equal(toasts.at(-1),'บันทึกที่อยู่แล้ว');
    TP.S.st.addressbook=undefined;TP.notify=savedNotify;
  }
  console.log('PASS: selected address, nearby coverage, primary address, branch details, empty/outside/unknown cases and screen registrations');
})().catch(e=>{console.error(e);process.exitCode=1});

// Banner CTA uses the existing consultation action and stays above the store list.
const bannerStart=source.indexOf('function homeConsultBanner(S)'),bannerEnd=source.indexOf("TP.screen('home'",bannerStart);
vm.runInContext(source.slice(bannerStart,bannerEnd),context);
context.ui.btn=(label,o)=>`<button data-a="${o.a}">${label}</button>`;
TP.caseOpen=()=>false;let banner=vm.runInContext('homeConsultBanner(TP.S)',context);assert(banner.includes('ปรึกษาเภสัช'));assert(banner.includes('data-a="quickConsult"'));assert(banner.includes('/assets/banners/pharmacy-female-counter-v1.png'));assert(fs.existsSync('public/assets/banners/pharmacy-female-counter-v1.png'));
TP.caseOpen=()=>true;banner=vm.runInContext('homeConsultBanner(TP.S)',context);assert(banner.includes('คุยกับเภสัชต่อ'));
assert(source.includes("paymentCard || activeCase || (updates && !deliveryCard) ? '' : homeConsultBanner(S)"));
assert(source.includes('consultBanner+heroHtml(S,st)'));
assert(source.includes('heroHtml(S,st)+nearbyStoresHtml(S)'));

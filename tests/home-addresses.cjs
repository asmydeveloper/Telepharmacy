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
const context = vm.createContext({TP,ui:{},esc:String,ic:()=>'',location:{search:''},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},URLSearchParams,structuredClone,document:{},console});
const emptyArtMethod=source.match(/  emptyArt\(icon = 'inbox'\) \{[^\n]+/)[0].trim().replace(/,$/,'');
vm.runInContext('Object.assign(ui, {'+emptyArtMethod+'})',context);
const zoneStart=source.indexOf('const ROAD_KM =');
const zoneEnd=source.indexOf('\n',source.indexOf('TP.zoneOf =',zoneStart));
vm.runInContext(source.slice(zoneStart,zoneEnd),context);
const start=source.indexOf('/* C210 / C211 / C514 / C515:');
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
  actions.hmFavorite({dataset:{v:'on'}});
  assert.equal(TP.S.favoriteBranches.join(','),'on');
  actions.hmFavorite({dataset:{v:'on'}});
  assert.equal(TP.S.favoriteBranches.length,0);
  const favoriteButtons = [{attrs:{},setAttribute(k,v){this.attrs[k]=v}}, {attrs:{},setAttribute(k,v){this.attrs[k]=v}}];
  let refreshCount=0; const refreshBefore=TP.refresh;
  TP.refresh=()=>{refreshCount++}; TP.sheetOpen=()=>({id:'storeinfo'});
  context.document.querySelectorAll=()=>favoriteButtons;
  actions.hmFavorite({dataset:{v:'on'}});
  assert.equal(refreshCount,0,'toggling in store sheet must not refresh and close it');
  assert.ok(favoriteButtons.every(b=>b.attrs['aria-pressed']==='true'));
  assert.ok(JSON.parse(storage.get('mitraree.home.preferences.v1')).favoriteBranches.includes('on'));
  actions.hmFavorite({dataset:{v:'on'}});
  assert.ok(favoriteButtons.every(b=>b.attrs['aria-pressed']==='false'));
  assert.equal(TP.S.favoriteBranches.length,0);
  TP.sheetOpen=()=>null; TP.refresh=refreshBefore;

  TP.homeScenario(TP.S,'outarea');assert.equal(TP.homeStores().length,0);
  TP.homeScenario(TP.S,'unknownarea');assert.equal(TP.homeStores().length,0);
  TP.homeScenario(TP.S,'noaddress');assert.equal(TP.homeAddress(),null);
  TP.homeScenario(TP.S,'normal');assert.equal(TP.homeAddress().id,'a2');
  const inputs = {};
  for (const [key, value] of Object.entries({label:'บ้านแม่',first:'ทดสอบ',last:'ผู้รับ',phone:'0812345678',house:'15/2',building:'อาคารบี ห้อง 12',alley:'สุขุมวิท 1',road:'สุขุมวิท',dist:'อ่อนนุช',amp:'สวนหลวง',prov:'กรุงเทพมหานคร',zip:'10250'})) {
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
  assert.equal(TP.addressName(TP.homeAddress()),'บ้านแม่');
  assert.equal(JSON.parse(storage.get('mitraree.home.preferences.v1')).addrs.find(a=>a.main).label,'บ้านแม่');
  const savedParts=TP.S.addrs.find(a=>a.label==='บ้านแม่');assert(savedParts);for(const k of ['house','building','alley','road'])assert.equal(savedParts[k],inputs['home-address-'+k].value,'persist '+k);
  context.ui.nav=()=>'';context.ui.page=s=>s;context.ui.btn=s=>s;
  TP.S._homeEditAddress=savedParts.id;const editHtml=registrations.addressedit.render({S:TP.S});for(const k of ['house','building','alley','road'])assert(editHtml.includes('id="home-address-'+k+'"'));assert(editHtml.includes('value="อาคารบี ห้อง 12"'));assert(editHtml.includes('value="สุขุมวิท 1"'));
  savedParts.house='15/2 อาคารเก่า ซอยสุขุมวิท 1';savedParts.building='';savedParts.alley='';savedParts.road='';const oldHtml=registrations.addressedit.render({S:TP.S});assert(oldHtml.includes('value="15/2 อาคารเก่า ซอยสุขุมวิท 1"'));assert(oldHtml.includes('ข้อมูลเดิมยังอยู่ครบ'));
  Object.assign(savedParts,{house:'15/2',building:'อาคารบี ห้อง 12',alley:'สุขุมวิท 1',road:'สุขุมวิท'});

  TP.S._homeEditAddress=TP.homeAddress().id;
  inputs['home-address-label'].value='ที่ทำงาน';
  actions.hmSaveAddress();
  assert.equal(TP.S.addrs.length,before+1,'renaming must not add another address');
  assert.equal(TP.addressName(TP.homeAddress()),'ที่ทำงาน');
  assert.equal(TP.addressName({main:true}),'ที่อยู่หลัก');
  assert.equal(TP.homeAddress().main,true);
  assert.equal(TP.S.addrs.filter(a=>a.main).length,1);
  for(const id of ['homeaddress','addressbook','addressedit','favorites']) assert.ok(registrations[id].code && registrations[id].states.length>1);
  assert.equal(new Set(Object.values(registrations).map(d=>d.code)).size,4);
  const modeStart=source.indexOf("TP.act('hmConsultMode'");
  vm.runInContext(source.slice(modeStart,source.indexOf("TP.act('hmChooseStore'",modeStart)),context);
  const startAction=source.indexOf("TP.act('hmStart'");
  vm.runInContext(source.slice(startAction,source.indexOf('\n});',startAction)+4),context);
  TP.ACTS=actions; TP.caseOpen=()=>false; TP.areaGate=()=>'';
  TP.S.intake={mode:'chat'}; TP.S.storeOpen=true; TP.S.sysOff=false; TP.S.case={status:'closed'};
  let navigated=null; TP.go=id=>{navigated=id};
  await actions.hmConsultMode({dataset:{v:'video',branch:'on'}});
  assert.equal(TP.S.intake.mode,'video'); assert.equal(navigated,'intake');
  await actions.hmConsultMode({dataset:{v:'chat',branch:'on'}});
  assert.equal(TP.S.intake.mode,'chat');
  navigated=null; TP.S.storeOpen=false;
  await actions.hmConsultMode({dataset:{v:'video',branch:'on'}});
  assert.equal(navigated,null,'closed store cannot start consultation');
  const rowsStart=source.indexOf('function storeListHtml(');
  vm.runInContext(source.slice(rowsStart,source.indexOf('function nearbyStoresHtml(',rowsStart)),context);
  context.ui.nav=()=>''; context.ui.page=x=>x; context.ui.tag=(label,tone)=>`<span class="tag ${tone}">${label}</span>`; context.ui.btn=label=>label;
  TP.S.favoriteBranches=['tw']; TP.S.storeOpen=true; TP.S.sysOff=false;
  let favoriteHtml=registrations.favorites.render({S:TP.S});
  assert.ok(favoriteHtml.includes('data-sheet="storeinfo"'));
  assert.ok(favoriteHtml.includes('hm-branch-favorite'));
  assert.ok(favoriteHtml.includes('1 ร้านที่บันทึกไว้'));
  TP.S.favoriteBranches=[];
  assert.ok(registrations.favorites.render({S:TP.S}).includes('เก็บร้านที่คุณไว้ใจไว้ที่นี่'));
  const menuStart=source.indexOf("TP.sheetDef('storeactions'");
  vm.runInContext(source.slice(menuStart,source.indexOf("TP.sheetDef('allbranches'",menuStart)),context);
  TP.S.favoriteBranches=[];
  assert.ok(registrations.storeactions.render({S:TP.S,params:{branch:'tw'}}).includes('บันทึกร้านโปรด'));
  await actions.hmMenuFavorite({dataset:{v:'tw'}});
  assert.ok(TP.S.favoriteBranches.includes('tw'));
  assert.ok(registrations.storeactions.render({S:TP.S,params:{branch:'tw'}}).includes('นำออกจากร้านโปรด'));
  await actions.hmMenuFavorite({dataset:{v:'tw'}});
  assert.ok(!TP.S.favoriteBranches.includes('tw'));
  assert.ok(vm.runInContext('storeListHtml(TP.S,TP.BRANCHES)',context).includes('data-sheet="storeactions"'));
  // Central consult action: require known zero queue, open status and coverage; never create a case.
  const savedStores=TP.homeStores,savedAddress=TP.homeAddress;
  TP.homeAddress=()=>({id:'selected'});TP.homeStores=()=>[{id:'near',name:'ใกล้'},{id:'free',name:'ว่าง'},{id:'far',name:'ไกล'}];
  Object.assign(TP.S,{loggedIn:true,storeOpen:true,sysOff:false,branchState:{near:'open',free:'open',far:'open'},queueLen:{near:2,free:0,far:0},intake:{},case:null});
  assert.equal(TP.quickConsultBranch().branch.id,'free');
  TP.S.branchState.free='pause';assert.equal(TP.quickConsultBranch().branch.id,'far');
  TP.S.branchState.far='closed';assert.equal(TP.quickConsultBranch().reason,'busy');
  TP.S.branchState.free='open';TP.S.queueLen={};assert.equal(TP.quickConsultBranch().reason,'busy','unknown is not a zero queue');
  TP.S.queueLen={near:2,free:0,far:0};let routed=[],sheets=[],started=0;TP.go=(...x)=>routed.push(x);TP.sheet=(...x)=>sheets.push(x);TP.caseOpen=()=>false;TP.ACTS=actions;const previousHmStart=actions.hmStart;actions.hmStart=()=>started++;
  actions.quickConsult();assert.equal(TP.S.branch,'free');assert.equal(started,1);assert.equal(TP.S.case,null);
  TP.caseOpen=()=>true;TP.S.case={status:'room',branch:'near'};actions.quickConsult();assert.equal(routed.at(-1)[0],'room');assert.equal(TP.S.branch,'free');assert.equal(started,1);
  TP.caseOpen=()=>false;TP.S.case=null;TP.homeAddress=()=>null;actions.quickConsult();assert.equal(sheets.at(-1)[0],'homeaddress');
  TP.homeAddress=()=>({id:'selected'});TP.homeStores=()=>[];actions.quickConsult();assert.equal(routed.at(-1)[0],'home');assert(!sheets.some(x=>x[0]==='allbranches'));
  TP.homeStores=()=>[{id:'free'}];TP.S.queueLen={};actions.quickConsult();assert.equal(routed.at(-1)[0],'home');assert(!sheets.some(x=>x[0]==='allbranches'));
  TP.S.sysOff=true;actions.quickConsult();assert.equal(routed.at(-1)[0],'sysoff');TP.S.sysOff=false;TP.S.storeOpen=false;actions.quickConsult();assert.equal(routed.at(-1)[0],'offline');
  TP.S.loggedIn=false;actions.quickConsult();assert.equal(routed.at(-1)[0],'login');actions.hmStart=previousHmStart;TP.homeStores=savedStores;TP.homeAddress=savedAddress;
  const shell=fs.readFileSync('src/app/Shell.jsx','utf8'),nav=shell.slice(shell.indexOf('"id": "tabbar"'),shell.indexOf('</nav>',shell.indexOf('"id": "tabbar"')));assert(nav.indexOf('history')<nav.indexOf('quickConsult'));assert(nav.indexOf('quickConsult')<nav.indexOf('inbox'));assert(nav.includes('aria-label="ปรึกษาเภสัชกร"'));
  const originalBranches=TP.BRANCHES;vm.runInContext(source.slice(source.indexOf('TP.BRANCHES = ['),source.indexOf('/* store-level facts')),context);TP.S.addrs=structuredClone(addresses);TP.S.deliveryAddressId='a1';TP.S.st.favorites='normal';registrations.favorites.prep(TP.S);let fourFavorites=registrations.favorites.render({S:TP.S});assert.equal((fourFavorites.match(/class="hm-branch-tile"/g)||[]).length,4);assert(fourFavorites.includes('22.8 กม.'));assert(fourFavorites.includes('อยู่นอกระยะให้บริการ'));assert(fourFavorites.indexOf('สาขาตลาดเวิลด์')<fourFavorites.indexOf('ร้านยาร่มเย็น'));assert(!fourFavorites.includes('class="h1"'));TP.BRANCHES=originalBranches;
  console.log('PASS: selected address, nearby coverage, primary address, favorites, empty/outside/unknown cases and screen registrations');
})().catch(e=>{console.error(e);process.exitCode=1});

// Banner CTA uses the existing consultation action and stays above the store list.
const bannerStart=source.indexOf('function homeConsultBanner(S)'),bannerEnd=source.indexOf("TP.screen('home'",bannerStart);
vm.runInContext(source.slice(bannerStart,bannerEnd),context);
context.ui.btn=(label,o)=>`<button data-a="${o.a}">${label}</button>`;
TP.caseOpen=()=>false;let banner=vm.runInContext('homeConsultBanner(TP.S)',context);assert(banner.includes('ปรึกษาเภสัช'));assert(banner.includes('data-a="quickConsult"'));assert(banner.includes('/assets/banners/pharmacy-female-counter-v1.png'));assert(fs.existsSync('public/assets/banners/pharmacy-female-counter-v1.png'));
TP.caseOpen=()=>true;banner=vm.runInContext('homeConsultBanner(TP.S)',context);assert(banner.includes('คุยกับเภสัชต่อ'));
assert(source.includes('homeConsultBanner(S)+heroHtml(S,st)'));assert(source.includes('heroHtml(S,st)+homeConsultBanner(S)+nearbyStoresHtml'));

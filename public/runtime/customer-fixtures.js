/* =====================================================================
   Customer prototype fixtures (preview only, never exported with the app).
   Sanitised sample data: mock clock, pharmacists, branches, a sample order,
   the returning account, its addresses, history and inbox examples.
   The app reads these only through TP.NOW/PHARM/BRANCHES/STORE/ORDER_ITEMS/
   COLD_ITEM/demoProfiles/previewInbox/fresh in customer.js 00-core; replace
   that adapter with real services for production.
   ===================================================================== */
window.MitrareeFixtures = (() => {
const demoProfiles = {"doctor": "/assets/profiles/doctor.png", "kid": "/assets/profiles/kid.png", "mom": "/assets/profiles/mom.png", "pharmacist_f": "/assets/photos/pharmacist-v1.png", "pharmacist_m": "/assets/profiles/pharmacist_m.png", "self": "/assets/profiles/default-profile-2d-v1.png", "dad": "/assets/photos/family-dad-v1.png", "sp": "/assets/photos/family-spouse-v1.png", "kid2": "/assets/photos/family-younger-child-v1.png"};

const NOW = { date: '18/10/2026', time: '14:12' };
const PHARM = {
  kj: { id: 'kj', name: 'ภญ.ขวัญใจ เอื้อภราดร', short: 'ภญ.ขวัญใจ', lic: 'ภ.45279', ini: 'ขจ', shift: '08:55', photo: '/assets/288682665289edf4c6.jpg' },
  tp: { id: 'tp', name: 'ภก.ธัชพล', short: 'ภก.ธัชพล', lic: 'ภ.23577', ini: 'ธพ', shift: '08:58' }
};
const BRANCHES = [
  { id: 'tw', photo: '/assets/stores/pharmacy-thumbnail-v1.png', name: 'สาขาตลาดเวิลด์', short: 'ตลาดเวิลด์', lic: 'ข.ย.5 กท 29/2566', km: 1.2, hours: '09:00-21:00', phone: '082-053-9915', pharm: 'kj', area: 'ตลาดเวิลด์มาร์เก็ต ทวีวัฒนา',
    addr: '109/14 ตลาดเวิลด์มาร์เก็ต ถ.เลียบคลองทวีวัฒนา แขวงทวีวัฒนา เขตทวีวัฒนา กรุงเทพมหานคร 10170', map: 'https://maps.app.goo.gl/VT33qesgA1wKDnj57' },
  { id: 'on', photo: '/assets/stores/on-v1.png', name: 'สาขาอ่อนนุช', short: 'อ่อนนุช', lic: 'ข.ย.5 กท 52/2567', km: 4.8, hours: '09:00-21:00', phone: '080-235-3950', pharm: 'tp', area: 'ซอยสุขุมวิท 77',
    addr: '16 ซอยสุขุมวิท 77 แขวงพระโขนงเหนือ เขตวัฒนา กรุงเทพมหานคร 10110', map: 'https://maps.app.goo.gl/An74SFhk1YE56BNB7' }
];
/* Design preview stores: fictional records; no real licence or contact details. */
BRANCHES.push(...[
  ['demo-1','ร้านยาสุขใจ',3.1,'08:00-21:00'], ['demo-2','ร้านยาใกล้บ้าน',4.6,'09:00-22:00'],
  ['demo-3','ร้านยาอารีเฮลท์',6.2,'08:30-20:30'], ['demo-4','ร้านยาอบอุ่น',8.4,'09:00-20:00'],
  ['demo-5','ร้านยาพร้อมดูแล',10.2,'08:00-22:00'], ['demo-6','ร้านยาร่มเย็น',22.8,'09:00-21:00']
].map(([id,name,km,hours])=>({id,name,photo:`/assets/stores/${id==='demo-6'?'demo-5':id}-v1.png`,short:name,km,hours,demo:true,pharm:'kj',area:'ข้อมูลร้านตัวอย่าง',addr:'ที่อยู่ร้านตัวอย่าง',lic:'ข้อมูลตัวอย่าง',phone:'',map:''})));
/* store-level facts every error screen and the pharmacist pass can show (licence from the old LIFF mask, owner to confirm) */
const STORE = { lic: 'ข.ย.5 กท 29/2566', cs: '098-035-8000', csHours: '10:00-18:00' };

const ORDER_ITEMS = [
  { name: 'ยาอมบรรเทาอาการเจ็บคอ', qty: '1 กล่อง', type: 'ยาอันตราย', price: 120, how: 'อมครั้งละ 1 เม็ด ทุก 3 ชั่วโมง ไม่เกิน 8 เม็ดต่อวัน', schedule: [{time:'เมื่อมีอาการ',instruction:'อมครั้งละ 1 เม็ด ทุก 3 ชั่วโมง ไม่เกิน 8 เม็ดต่อวัน'}] },
  { name: 'พาราเซตามอล 500 มก.', qty: '1 แผง', type: 'ยาสามัญประจำบ้าน', price: 40, how: 'ครั้งละ 1 เม็ด เมื่อปวดหรือมีไข้ ห่างกันอย่างน้อย 6 ชั่วโมง', schedule: [{time:'เมื่อมีอาการ',instruction:'เมื่อปวดหรือมีไข้ ครั้งละ 1 เม็ด ห่างกันอย่างน้อย 6 ชั่วโมง'}] },
  { name: 'สเปรย์พ่นคอ', qty: '1 ขวด', type: 'ยาอันตราย', price: 225, how: 'พ่น 2 ครั้ง วันละ 3 ครั้ง หลังอาหาร' }
];

const COLD_ITEM = { name: 'จุลินทรีย์ชนิดแคปซูล (เก็บในตู้เย็น)', qty: '1 กล่อง', type: 'ยาอันตราย', price: 290, how: 'รับประทานครั้งละ 1 แคปซูล วันละ 2 ครั้ง ก่อนอาหาร · เก็บในตู้เย็น 2-8 องศา', cold: true };

/* Preview-only inbox examples; live notifications remain in S.inbox. */
const previewInbox = (history) => {
 const records=history===undefined?[{id:'TC-261002-0087',summary:true}]:history;
 const summaryId=records.find(h=>h.summary)?.id;
 const today=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date()),[d,m,y]=today.split('/').map(Number);
 const samples=[
 [0,'02:50','summary','สรุปการปรึกษาพร้อมแล้ว','เปิดดูข้อมูลยาและคำแนะนำจากเภสัชกร','summary'],
 [0,'02:30','delivery','ยาพร้อมรับที่สาขา','แสดงรหัสรับยาเมื่อไปรับที่ร้าน','history'],
 [0,'02:10','pay','ชำระเงินสำเร็จ','ร้านได้รับคำสั่งซื้อและจะเริ่มเตรียมยา','history'],
 [0,'01:45','pay','รอชำระค่ายา','ตรวจสอบรายการยาและชำระเงินเพื่อดำเนินการต่อ','history'],
 [1,'19:20','queue','เภสัชกรรับคิวแล้ว','กลับเข้าห้องปรึกษาเพื่อเริ่มพูดคุย','history'],
 [1,'18:40','delivery','กำลังเตรียมยา','ร้านกำลังจัดเตรียมยาตามคำสั่งซื้อ','history'],
 [3,'18:35','delivery','จัดส่งยาสำเร็จ','ตรวจสอบการรับยาและรายละเอียดคำสั่งซื้อ','history'],
 [3,'13:10','delivery','กำลังจัดส่งยา','ติดตามสถานะการส่งยาได้ในรายละเอียดคำสั่งซื้อ','history'],
 [3,'12:50','delivery','กำลังเรียกไรเดอร์','ร้านเตรียมยาพร้อมแล้ว กำลังรอไรเดอร์เข้ารับ','history'],
 [7,'17:25','msg','มีข้อความจากเภสัชกร','เปิดดูข้อความและรายละเอียดการปรึกษา','history'],
 ];
 return samples.map(([days,at,kind,title,body,go],index)=>{const date=new Date(Date.UTC(y,m-1,d-days)),dateText=[String(date.getUTCDate()).padStart(2,'0'),String(date.getUTCMonth()+1).padStart(2,'0'),date.getUTCFullYear()].join('/');return {id:'preview-note-'+index,kind,title,body,time:dateText+' '+at,read:true,go:records.length?'summary':'history',...(records.length?{caseId:go==='summary'&&summaryId?summaryId:records[index%records.length].id,p:{id:go==='summary'&&summaryId?summaryId:records[index%records.length].id}}:{})};});
};
const account = () => ({
  firstTime: false,          // true = new user: sign-up, then C108 and onboarding C112
  loggedIn: true,
  consent: true,             // Preview fixture: returning account already accepted the current policy.
  consentVer: 4,
  healthConsentRecord: {documentVersion:'health-care-2026-11-01-draft-2',controller:'บริษัท มิตรอารีแคร์ จำกัด',purpose:'pharmaceutical-care',acceptedAt:'2026-11-01T00:00:00+07:00',method:'preview-fixture',prototype:true},
  storeOpen: true,
  notifAsked: true,
  notif: true,               // returning user allowed app notifications
  branch: 'tw',
  branchState: { tw: 'open', on: 'pause', 'demo-2': 'closed', 'demo-3': 'pause' },  // open | pause | closed
  queueLen: { tw: 2, on: 1, 'demo-1':0, 'demo-2':0, 'demo-3':0, 'demo-4':1, 'demo-5':0 },
  user: { name: 'สมใจ', last: 'ใจดี', full: 'สมใจ ใจดี', nationalId: '1101700203450', birthDate: '1988-06-15', birthYear: 1988, sex: 'f', height: 160, phone: '081-234-5678', allergies: ['แอสไพริน'], allergySrc: 'บันทึกโดย ภญ.ขวัญใจ 02/10/2026', allergyState: 'set', meds: ['แอมโลดิพีน 5 มก. (ยาความดัน)'], weight: 58, born: '1988', foodNone: true },
  taxWho: {id:'1101700203450',name:'สมใจ ใจดี',first:'สมใจ',last:'ใจดี',phone:'0812345678',detail:'88/12 ซอยทวีวัฒนา 25',prov:'กรุงเทพมหานคร',amp:'ทวีวัฒนา',dist:'ทวีวัฒนา',zip:'10170',country:'ไทย',addr:'88/12 ซอยทวีวัฒนา 25 แขวงทวีวัฒนา เขตทวีวัฒนา กรุงเทพมหานคร 10170'},
  taxCo: null, _taxProfileMockInitialized: true,
  family: [], // Household feature paused; this app serves the account owner only.
  intake: { who: 'me', symptoms: [], custom: [], otherOpen: false, urgent: [], note: '', photos: 0, attachments: [], mode: 'chat' },
  zoneLock: true,   // zone lock = admin switch (default ON)
  case: null,                // see TP.newCase in 60-main
  /* the website account address book (customer_addresses): no labels like บ้าน/ที่ทำงาน, one main address, pin = has a confirmed map point */
  addrs: [
    { id: 'a1', first: 'สมใจ', last: 'ใจดี', phone: '0812345678', house: '88/12', alley: 'ซอยทวีวัฒนา 25', road: '', prov: 'กรุงเทพมหานคร', amp: 'ทวีวัฒนา', dist: 'ทวีวัฒนา', zip: '10170', main: true, pin: false },
    { id: 'a2', first: 'สมใจ', last: 'ใจดี', phone: '0812345678', house: '99/9', building: 'ชั้น 12', alley: '', road: 'พระรามที่ 4', prov: 'กรุงเทพมหานคร', amp: 'คลองเตย', dist: 'คลองเตย', zip: '10110', main: false, pin: true }
  ],
  history: [
    {id:'mock-history-shipping',date:'19/10/2026',time:'09:15',who:'me',topic:'เจ็บคอ',note:'ปรึกษาอาการเจ็บคอ',branch:'tw',pharm:'kj',orderNo:'MT2026101901',outcome:'completed',summary:true,order:{no:'MT2026101901',status:'paid',items:[{name:'ยาอมบรรเทาอาการเจ็บคอ',qty:'1 กล่อง',price:120}],total:120,paid:{total:120,items:120,ship:0,fee:0,recv:'pickup',method:'promptpay',date:'19/10/2026',at:'09:30',stage:'preparing'}},previewSummary:{meds:[{name:'ยาอมบรรเทาอาการเจ็บคอ',qty:'1 กล่อง',how:'ใช้ตามคำแนะนำบนฉลาก'}],advice:'ใช้ยาตามฉลากและคำแนะนำจากเภสัชกร'}} ,
    {id:'mock-history-expired',date:'18/10/2026',time:'13:10',who:'me',topic:'เจ็บคอ',note:'เจ็บคอมา 2 วัน กลืนแล้วเจ็บ',branch:'tw',pharm:'kj',orderNo:'MT2026101801',outcome:'payment-expired',summary:true,previewSummary:{meds:[],nomed:'ยังไม่ได้รับยา เนื่องจากไม่ได้ชำระเงินภายในเวลาที่กำหนด',advice:'เภสัชกรแนะนำให้พักผ่อน ดื่มน้ำ และสอบถามเภสัชกรหากอาการไม่ดีขึ้น'}} ,
    {id:'mock-history-paid',date:'17/10/2026',time:'10:20',who:'me',topic:'คัดจมูก น้ำมูก',note:'คัดจมูกและมีน้ำมูกมา 2 วัน',branch:'tw',pharm:'kj',orderNo:'MT2026101701',bought:160,order:{no:'MT2026101701',status:'paid',picked:true,items:[{name:'ยาอมบรรเทาอาการเจ็บคอ',qty:'1 กล่อง',price:120},{name:'พาราเซตามอล 500 มก.',qty:'1 แผง',price:40}],total:160,paid:{items:160,ship:0,fee:0,total:160,recv:'pickup',method:'promptpay',date:'17/10/2026',at:'10:45',got:'11:10'}},outcome:'order-complete',summary:true,previewSummary:{meds:[{name:'ยาอมบรรเทาอาการเจ็บคอ',qty:'1 กล่อง',how:'ใช้ตามคำแนะนำบนฉลาก'},{name:'พาราเซตามอล 500 มก.',qty:'1 แผง',how:'ใช้ตามคำแนะนำบนฉลาก'}],advice:'พักผ่อนให้เพียงพอ ดื่มน้ำสม่ำเสมอ และใช้ยาตามฉลาก หากอาการไม่ดีขึ้นให้ปรึกษาเภสัชกร',follow:'รับยาที่สาขาแล้ว'}} ,
    {id:'mock-history-silent',date:'16/10/2026',time:'14:35',who:'me',topic:'ปวดกล้ามเนื้อ',note:'ปวดกล้ามเนื้อหลังทำงาน',branch:'tw',pharm:'kj',outcome:'no-response',summary:true,previewSummary:{meds:[],nomed:'ไม่มีรายการยา เนื่องจากการสนทนาสิ้นสุดก่อนการสรุป',advice:'ไม่มีคำแนะนำที่บันทึกไว้ เนื่องจากการสนทนาสิ้นสุดก่อนเภสัชกรสรุป'}} ,
    {id:'mock-history-declined',date:'15/10/2026',time:'11:15',who:'me',topic:'สอบถามเรื่องยา',note:'สอบถามวิธีดูแลอาการเจ็บคอ',branch:'on',pharm:'tp',outcome:'declined-medicine',summary:true,previewSummary:{meds:[],nomed:'ไม่มีรายการยา ผู้รับบริการแจ้งว่าไม่รับยา',advice:'แนะนำให้พักผ่อนและดื่มน้ำ หากอาการไม่ดีขึ้นสามารถปรึกษาเภสัชกรได้อีกครั้ง'}} ,
    {id:'mock-history-no-meds',date:'14/10/2026',time:'09:30',who:'me',topic:'ปรึกษาการใช้ยา',note:'สอบถามวิธีใช้ยาที่มีอยู่',branch:'tw',pharm:'kj',outcome:'no-medicine',summary:true,previewSummary:{meds:[],nomed:'ไม่มีรายการยาในการปรึกษาครั้งนี้',advice:'เภสัชกรให้คำแนะนำการใช้ยาที่มีอยู่ และไม่มีการจ่ายยาเพิ่มเติม'}} ,
    {id:'mock-history-cancelled',date:'13/10/2026',time:'15:00',who:'me',topic:'ไอและระคายคอ',note:'ไอและระคายคอมา 1 วัน',branch:'tw',pharm:'kj',orderNo:'MT2026101301',outcome:'order-cancelled',summary:true,previewSummary:{meds:[],nomed:'ไม่ได้รับยา เนื่องจากยกเลิกคำสั่งซื้อ',advice:'ไม่มีคำแนะนำเพิ่มเติมที่บันทึกไว้'}} ,
    {id:'mock-history-ended',date:'12/10/2026',time:'13:00',who:'me',topic:'สอบถามเรื่องยา',note:'สอบถามเรื่องยาที่ใช้ประจำ',branch:'on',pharm:'tp',outcome:'customer-ended',summary:true,previewSummary:{meds:[],nomed:'ไม่มีรายการยา เนื่องจากการสนทนาสิ้นสุดก่อนสรุป',advice:'ไม่มีคำแนะนำที่บันทึกไว้ เนื่องจากผู้รับบริการจบการสนทนาก่อนเภสัชกรสรุป'}}
  ],
  inbox: previewInbox(),
  st: {}                     // per-screen scenario picked in the panel: st[screenId] = key
});

return { demoProfiles, NOW, PHARM, BRANCHES, STORE, ORDER_ITEMS, COLD_ITEM, previewInbox, account };
})();

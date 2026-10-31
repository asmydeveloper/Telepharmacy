const assert=require('node:assert/strict');
const {harness,source}=require('./health-harness.cjs');
const h=harness();h.ui.callHelp=()=>'<div>ติดต่อร้าน</div>';h.TP.STORE={cs:'020000000',csHours:'09:00–21:00'};h.TP.person=()=>h.S.user;h.TP.riskHtml=()=>'<p>ขั้นตอนและความเสี่ยง</p>';
h.S.case={status:'queue',pos:2,branch:'tw',joinedAt:'14:12',urgent:[],who:'me',symptoms:['ไอ'],note:'เป็นมา 2 วัน',mode:'chat',photos:0};
h.S.notif=true;
h.run('function ensureCase(){return TP.S.case;}');
const a=source.indexOf('const statusLine = c =>'),b=source.indexOf('/* A3 (FDA',a);h.run(source.slice(a,b));
h.TP.brand.halo=(n,o)=>'<svg class="'+o.cls+'"></svg>';h.TP.passHtml=()=>'<div class="pass">เภสัชกร</div>';
const start=source.indexOf("TP.screen('queue',"),end=source.indexOf("TP.act('queueMin'",start);h.run(source.slice(start,end));
function render(){return h.screens.queue.render({S:h.S,state:'q2'});}
let html=render();assert(html.includes('id="qNum"'));assert(html.includes('ลำดับคิว 2'));assert(html.includes('มีผู้รอก่อนคุณ 1 คน'));assert(html.includes('<canvas'));assert(html.includes('q-halo'));assert(html.includes('ย่อหน้านี้ได้'));
h.S.case.pos=1;html=render();assert(html.includes('คิวถัดไป'));assert(!html.includes('มีผู้รอก่อนคุณ'));
h.S.notif=false;html=render();assert(html.includes('data-a="qNotifOn"'));assert(!html.includes('เราจะแจ้งเตือนเมื่อเภสัชกรรับคิว'));
h.S.case.status='paused';html=render();assert(html.includes('คิวของคุณยังอยู่'));assert(html.includes('พักชั่วคราว'));
console.log('PASS: queue position, next/paused states, notification-off action and static number rendering');

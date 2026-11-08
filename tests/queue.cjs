const assert=require('node:assert/strict');
const {harness,source}=require('./health-harness.cjs');
const h=harness();h.ui.callHelp=()=>'<div>ติดต่อร้าน</div>';h.TP.STORE={cs:'020000000',csHours:'09:00–21:00'};h.TP.person=()=>h.S.user;h.TP.riskHtml=()=>'<p>ขั้นตอนและความเสี่ยง</p>';
h.S.case={status:'queue',pos:2,branch:'tw',joinedAt:'14:12',urgent:[],who:'me',symptoms:['ไอ'],note:'เป็นมา 2 วัน',mode:'chat',photos:0};
h.S.notif=true;
h.run('function ensureCase(status){if(status)TP.S.case.status=status;return TP.S.case;}');
const a=source.indexOf('const statusLine = c =>'),b=source.indexOf('/* A3 (FDA',a);h.run(source.slice(a,b));
h.TP.brand.halo=(n,o)=>'<svg class="'+o.cls+'"></svg>';h.TP.passHtml=()=>'<div class="pass">เภสัชกร</div>';
const start=source.indexOf("TP.screen('queue',"),end=source.indexOf("TP.act('queueMin'",start);h.run(source.slice(start,end));
// Preview states preserve permanent case suffixes; the waiting screen is independent of chat.
h.context.structuredClone=structuredClone;h.TP.ZONE_ADDR={};h.context.C=()=>h.S.case;h.TP.queueZoneNote=()=>'';h.ui.nav=()=>'';h.ui.page=s=>s;h.ui.dock=s=>s;h.ui.btn=s=>s;
for(const [state,pos]of [['q2',2],['q1',1],['q4',4],['paused',2],['outzone',2]]){
 h.S.st.queue=state;h.screens.queue.prep(h.S);assert.equal(h.S.case.pos,pos);
 assert.equal(h.S.case.status,state==='paused'?'paused':'queue');
 const html=h.screens.queue.render({S:h.S,state});
 assert.match(html,/queue-wait-summary/);assert.doesNotMatch(html,/รหัสคิวของคุณ|queue-ticket-code/);assert.doesNotMatch(html,/textarea|rmList/);
}
console.log('PASS: dedicated queue fixtures, positions, pause and outside delivery coverage');

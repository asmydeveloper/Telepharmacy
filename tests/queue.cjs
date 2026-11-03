const assert=require('node:assert/strict');
const {harness,source}=require('./health-harness.cjs');
const h=harness();h.ui.callHelp=()=>'<div>ติดต่อร้าน</div>';h.TP.STORE={cs:'020000000',csHours:'09:00–21:00'};h.TP.person=()=>h.S.user;h.TP.riskHtml=()=>'<p>ขั้นตอนและความเสี่ยง</p>';
h.S.case={status:'queue',pos:2,branch:'tw',joinedAt:'14:12',urgent:[],who:'me',symptoms:['ไอ'],note:'เป็นมา 2 วัน',mode:'chat',photos:0};
h.S.notif=true;
h.run('function ensureCase(status){if(status)TP.S.case.status=status;return TP.S.case;}');
const a=source.indexOf('const statusLine = c =>'),b=source.indexOf('/* A3 (FDA',a);h.run(source.slice(a,b));
h.TP.brand.halo=(n,o)=>'<svg class="'+o.cls+'"></svg>';h.TP.passHtml=()=>'<div class="pass">เภสัชกร</div>';
const start=source.indexOf("TP.screen('queue',"),end=source.indexOf("TP.act('queueMin'",start);h.run(source.slice(start,end));
// Queue is the existing room UI; assert delegation rather than the retired ring screen.
h.TP.SCREENS={room:{render:ctx=>'<div>waiting chat '+ctx.state+'</div>'}};
for(const [state,pos]of [['q2',2],['q1',1],['q4',4],['paused',2],['offline',2],['joined',2]]){
 h.S.st.queue=state;h.screens.queue.prep(h.S);assert.equal(h.S.case.pos,pos);
 assert.equal(h.S.netOff,state==='offline');assert.equal(h.S.case.status,state==='joined'?'room':state==='paused'?'paused':'queue');
 assert.equal(h.screens.queue.render({S:h.S,state}),'<div>waiting chat '+state+'</div>');
}
console.log('PASS: queue fixtures delegate to the same waiting chat, positions, paused, offline and pharmacist joined');

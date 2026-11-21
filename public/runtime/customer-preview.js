window.installMitrareeCustomerPreview = function (TP) {
TP.previewEventPolicy = window.MitrareePreviewEventPolicy;
/* Preview-only fault layer. No network requests, persisted flags or domain mutations. */
(() => {
 let active=null,layer=null;
 const policy=TP.previewEventPolicy;
 function paint(){
  layer?.remove();layer=null;if(!active||!TP.phone)return;
  layer=document.createElement('section');layer.className='preview-fault-message note warn';layer.setAttribute('role','status');layer.setAttribute('aria-live','polite');
  layer.innerHTML=`<small>เหตุการณ์จำลอง · ${TP.esc(active.id)}</small><div>${TP.ic(active.icon,20,2)}<div><b>${TP.esc(active.title)}</b><p>${TP.esc(active.body)}</p></div></div><div class="preview-fault-actions"><button type="button" class="btn secondary" data-fault-retry>ลองใหม่</button><button type="button" class="btn primary" data-fault-clear>จำลองกลับปกติ</button></div>`;
  layer.addEventListener('click',e=>{if(e.target.closest('[data-fault-clear]'))TP.previewEvents.clear();if(e.target.closest('[data-fault-retry]'))TP.notify('จำลอง: ยังพบเหตุการณ์เดิม เลือกจำลองกลับปกติเพื่อทดสอบการกู้คืน',{icon:'info'});});
  TP.phone.appendChild(layer);
 }
 TP.previewEvents={
  get active(){return active;},
  set(key){const event=policy.globals.find(x=>x.key===key);if(!event)return false;active=event;paint();TP.emit('state');return true;},
  clear(){active=null;paint();TP.emit('state');},
  blocked(e){if(!active||layer?.contains(e.target))return false;const action=e.target.closest?.('[data-a],button[type="submit"],input[type="submit"]');if(e.type!=='submit'&&!action)return false;e.preventDefault();e.stopImmediatePropagation();TP.notify('เหตุการณ์จำลองยังทำงานอยู่ ข้อมูลยังไม่ถูกส่ง',{icon:'info'});return true;}
 };
 TP.phone?.addEventListener('click',e=>TP.previewEvents.blocked(e),true);
 TP.phone?.addEventListener('submit',e=>TP.previewEvents.blocked(e),true);
 TP.on('screen',paint);TP.on('sheet',paint);
})();

/* ===== 40-panel.js ===== */
/* =====================================================================
   40 · Prototype panel (not part of the app): notes for the current screen,
   scenario toggles, pharmacist simulation, jump to any screen.
   Desktop: right column · phone: slide-over opened by the edge tab.
   ===================================================================== */
(() => {
const { $, $$, esc, ic } = TP;
const panel = $('#panel'), fab = $('#panelFab');
TP.DESIGN_VERSION = 'Design v1.2 · 19/10/2026';
const SIM = [];
/* 60-main registers pharmacist actions: {id, label, when:S=>bool, run()} */
TP.simAction = a => SIM.push(a);
const GLOBAL = [
  ['storeOpen', 'เวลาร้าน', [[true, 'ร้านเปิด'], [false, 'ร้านปิด']]],
  ['firstTime', 'ผู้ใช้ (กดแล้วเริ่มแอปใหม่)', [[false, 'เคยใช้แล้ว'], [true, 'ใช้ครั้งแรก']]],
  ['sysOff', 'ระบบปรึกษา', [[false, 'เปิด'], [true, 'ปิดชั่วคราว']]],
  ['oldApp', 'รุ่นแอปในเครื่อง', [[false, 'ล่าสุด'], [true, 'เก่า ต้องอัปเดต']]],
  ['zoneLock', 'ล็อกเขตส่งยา 15 กม. (สวิตช์ผู้ดูแลระบบ · แจ้ง อย.)', [[true, 'ล็อก (ค่าเริ่มต้น)'], [false, 'ปลดล็อก (เมื่อ อย. อนุญาต)']]],
];
/* said inside the phone when the open screen does not use the switch, so a tap never looks dead */
const WHERE = {
  storeOpen: { true: 'จำลองร้านเปิดแล้ว · เห็นผลที่หน้าแรกและจอแจ้งอาการ', false: 'จำลองร้านปิดแล้ว · เห็นผลที่หน้าแรก จอแจ้งอาการ และจอจ่ายเงิน' },
  sysOff: { true: 'จำลองปิดระบบปรึกษาแล้ว · เห็นผลที่หน้าแรกและตอนกดเริ่มปรึกษา', false: 'เปิดระบบปรึกษาแล้ว · เห็นผลที่หน้าแรก' },
  zoneLock: { true: 'ล็อกเขตแล้ว · ที่อยู่นอกเขตรับยาที่ร้านเท่านั้น (C308.18)', false: 'ปลดล็อกเขตแล้ว · เกิน 15 กม. ก็เริ่มปรึกษาได้ หน้าแจ้งอาการ C203 บอกว่าส่งด่วนไม่ได้ · ส่งพัสดุ Flash DHL และส่งเย็นได้ทุกที่อยู่ (C308.21)' },
};

function codeTag(code) { return code ? `<span class="pn-code">${esc(code)}</span>` : ''; }
/* review codes (owner 19/10/2026: "ระบุเลขหน้าให้ครบทุกหน้า ผมจะตรวจตามรหัสและให้แก้ตามหมายเลข"):
   C + group digit + 2 digits per screen or sheet; a state picked in the panel or opened by jump adds .n */
TP.codeOf = id => {
  const d = TP.def(id); if (d?.hidden && (d.owner || d.host)) return TP.codeOf(d.owner || d.host); if (!d?.code) return '';
  return stateCode(d, TP.S.st[id]);
};
const byCode = (a, b) => (TP.def(a).code || '').localeCompare(TP.def(b).code || '');
const badge = $('#codeBadge'), fabCode = $('#fabCode');
/* the panel never moves under the reviewer (owner 19/10/2026: "ถ้ากดดูอันไหนอย่าขยับจอสิ"):
   a redraw keeps the item just tapped, else the first item in view, at the same height */
let tapped = null;
const keyOf = el => `[data-pn="${el.dataset.pn}"][data-k="${CSS.escape(el.dataset.k)}"]`;
function anchorOf() {
  const top = panel.getBoundingClientRect().top, bot = top + panel.clientHeight;
  let el = tapped && panel.querySelector(tapped);
  if (!el) el = [...panel.querySelectorAll('[data-pn][data-k]')].find(x => { const r = x.getBoundingClientRect(); return r.bottom > top && r.top < bot; });
  return el ? { sel: keyOf(el), y: el.getBoundingClientRect().top } : null;
}
function holdAnchor(a) { const el = a && panel.querySelector(a.sel); if (el) panel.scrollTop += el.getBoundingClientRect().top - a.y; }
/* Reviewer navigation categories are separate from permanent screen code groups. */
/* Preview-only data adapter: never submit, opt into consent, or overwrite edits. */
TP.previewAutofill={enabled:false,
  valueFor(input){
    if(input.dataset.regHealthText)return 'ข้อมูลสุขภาพตัวอย่างสำหรับทดสอบ';
    const key=(input.name||input.dataset.tf||input.dataset.regInput||input.dataset.bind?.split('.').pop()||input.id||'').toLowerCase();
    const values={loginemail:'somjai@example.com',phin:'0812345678',iknote:'เจ็บคอมา 2 วัน กลืนแล้วเจ็บ มีไอเล็กน้อย',label:'บ้าน',name:'สมใจ ใจดี',first:'สมใจ',last:'ใจดี',phone:'0812345678',email:'somjai@example.com',house:'88/12',building:'',alley:'ซอยทวีวัฒนา',road:'',dist:'ทวีวัฒนา',amp:'ทวีวัฒนา',prov:'กรุงเทพมหานคร',zip:'10170',note:'ข้อมูลตัวอย่างสำหรับทดสอบ',afnote:'มีผื่นคันที่แขนทั้งสองข้างหลังใช้ยา',afother:'พาราเซตามอล',afalgin:'แอสไพริน',algin:'แอสไพริน',reason:'ปวดศีรษะ',doses:'ใช้ 1 ครั้ง',route:'รับประทาน',generic:'พาราเซตามอล',strength:'500 มก.',form:'ยาเม็ด',weight:'55',height:'160'};
    return values[key]||'';
  },
  fill(root,ctx){
    if(!this.enabled||!root)return;
    if(ctx?.id==='profile'&&TP.registrationPreview?.fillEmpty?.(ctx))return;
    root.querySelectorAll('input,textarea').forEach(input=>{
      if(input.dataset.noPreviewFill!==undefined||input.disabled||input.readOnly||input.value?.trim()||input.closest('[hidden]')||['search','checkbox','radio','file','hidden','password'].includes(input.type))return;
      const channel=ctx?.id==='loginemail'?'email':ctx?.id==='loginphone'?'phone':null;
      const challenge=channel&&TP.S._authFlows?.[channel]?.challenge;
      const value=input.id==='authCode'&&challenge&&!challenge.used&&challenge.expiresAt>Date.now()&&challenge.attempts<5?challenge.expected:this.valueFor(input);if(!value)return;
      input.value=input.maxLength>0?value.slice(0,input.maxLength):value;
      input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
    });
  }
};
/* the state list must match design-system/screens/<group>/<code>.json: C102 + .position in def.states */
/* Case suffix is permanent: a tuple's 4th element pins it after retired cases were deleted, else its position. */
TP.stateSuffix=(states,key)=>{const i=(states||[]).findIndex(x=>x[0]===key);return i<0?0:states[i][3]??i+1;};
/* Positional copy for consumers that index by array position (console, /screens): gaps become retired placeholders. */
TP.positionalStates = (states = []) => {
  const out = [];
  states.forEach((state, index) => {
    const suffix = state[3] ?? index + 1;
    if (!suffix) return;
    while (out.length < suffix - 1) out.push(['', '', false]);
    out.push(state.slice(0, 3));
  });
  const base = states.find(state => state[3] === 0);
  if (base) out.push(base.slice(0, 3));
  else if (out.length === 1 && states[0][3] != null) out.push(['', '', false]);
  return out;
};
TP.hasCaseSuffix=states=>(states||[]).length>1||(states||[]).some(x=>x[3]!=null);
function stateCode(def,key){const all=def.states||[],n=TP.stateSuffix(all,key);return TP.hasCaseSuffix(all)&&n?`${def.code}.${n}`:def.code||'';}
function render() {
  const s = TP.sheetOpen(), c = TP.cur(), keep = anchorOf();
  /* an internal sheet belongs to its owner page (e.g. the C308 tax picker is part of C308), else to its host screen */
  const internal = s?.def.hidden && (s.def.owner || s.def.host);
  const def = internal ? TP.def(internal) : s ? s.def : c && TP.SCREENS[c.id];
  const id = internal ? internal : s ? s.id : c?.id;
  const states = def ? TP.previewEventPolicy.pageStates(id,def.states) : [];
  const sims = SIM.filter(a => { try { return a.when(TP.S); } catch { return false; } });
  const visible = TP.ORDER.filter(i => !TP.def(i).hidden);
  const code = id ? TP.codeOf(id) : '', ttl = def ? (typeof def.title === 'function' ? def.title({ S: TP.S, params: s ? s.ctx.params : c?.ctx?.params || {} }) : def.title) : '';
  const screenMock = !s && c ? TP.SCREENS[c.id]?.previewMock : null;
  const canMock = s ? !!s.def?.previewMock?.canFill(s.ctx) : screenMock ? !!screenMock.canFill(c.ctx) : TP.registrationPreview?.canFill(c);
  if (badge) badge.innerHTML = code ? `<b>${esc(code)}</b><span>${esc(ttl)}</span>` : '';
  if (fabCode) fabCode.textContent = code;
  panel.innerHTML = `
    <div class="pn-top">${TP.brand.logo('wmen', { cls: 'sm' })}<button type="button" class="ibtn pn-x" data-pn="close" aria-label="ปิดแผง">${ic('x', 20, 2)}</button></div>
    <h1 class="mt12">ต้นแบบแอปลูกค้า · ปรึกษาเภสัชกร</h1>
    <p class="pn-sub">${esc(TP.DESIGN_VERSION)} · หน้ากากอย่างเดียว ยังไม่ต่อระบบจริง · ข้อมูลสมมติ</p>
    ${def ? `<section class="pn-sec"><h2 class="pn-h">จอนี้</h2><div class="pn-card">
      <h2>${codeTag(code)}${esc(ttl)}</h2>
      ${def.ref ? `<p class="pn-ref">อ้างอิงสเปกเดิม ${esc(def.ref)}</p>` : ''}
      ${def.notes?.length ? `<ul class="pn-list">${def.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
      ${def.wait?.length ? `<p class="pn-wait-h">รอเจ้าของเคาะ</p><ul class="pn-list wait">${def.wait.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
    </div></section>` : ''}
    ${def?.states?.length > 1 && states.length ? `<section class="pn-sec"><h2 class="pn-h">ลองสถานะของจอนี้</h2><div class="gap12">${(def.stateGroups || [{label: "", keys: states.map(([key]) => key)}]).map(group => `${group.label ? `<h3 class="pn-h">${esc(group.label)}</h3>` : ""}<div class="pn-row">${states.filter(([key]) => group.keys.includes(key)).map(([k, l]) => `<button type="button" class="pn-btn" data-pn="state" data-k="${esc(k)}" aria-pressed="${TP.stateOf(id) === k}"><b class="pn-sc">${esc(stateCode(def, k))}</b>${esc(l)}</button>`).join('')}</div>`).join('')}</div></section>` : ''}
    ${canMock ? '<section class="pn-sec"><button type="button" class="pn-btn wide" data-pn="mock">มอคข้อมูล</button></section>' : ''}
    ${sims.length ? `<section class="pn-sec"><h2 class="pn-h">${ic('stethoscope', 15, 2)}จำลองฝั่งเภสัชกร</h2><div class="pn-grid">${sims.map(a => `<button type="button" class="pn-btn ph" data-pn="sim" data-k="${esc(a.id)}">${esc(a.label)}</button>`).join('')}</div></section>` : ''}
    <section class="pn-sec"><h2 class="pn-h">ทั้งแอป</h2><div class="gap8">${GLOBAL.map(([k, l, opts]) => `<div><p class="small" style="margin:0 2px 4px">${esc(l)}</p><div class="pn-row">${opts.map(([v, t]) => `<button type="button" class="pn-btn" data-pn="g" data-k="${k}" data-v="${v}" aria-pressed="${(k === 'firstTime' ? TP.flag(k) : TP.S[k]) === v}">${esc(t)}</button>`).join('')}</div></div>`).join('')}</div></section>
    <section class="pn-sec"><h2 class="pn-h">ไปจอ · ทั้งหมด ${visible.length} จอ</h2>
      ${TP.GROUPS.map(([g, gl]) => { const ids = visible.filter(i => TP.def(i).group === g).sort(byCode); if (!ids.length) return ''; return `<div class="pn-grp"><b>${esc(gl)}</b><div class="pn-grid">${ids.flatMap(i => {
        const d = TP.def(i);
        const title = typeof d.title === 'function' ? d.title({ S: TP.S, params: {} }) : d.title;
        const entries = [{ code: d.code || '', html: `<button type="button" class="pn-btn" data-pn="jump" data-k="${i}" aria-current="${i === id}"><b class="pn-sc">${esc(d.code || '')}</b>${esc(title)}${d.kind === 'sheet' ? '<small>แผ่นเลื่อนขึ้น</small>' : ''}</button>` }];
        for (const state of d.previewShortcuts || []) {
          const index = d.states.findIndex(([key]) => key === state);
          if (index < 0) continue;
          const code = stateCode(d, state);
          entries.push({ code, html: `<button type="button" class="pn-btn" data-pn="jump-state" data-k="${i}" data-state="${esc(state)}" aria-current="${i === id && TP.stateOf(i) === state}"><b class="pn-sc">${esc(code)}</b>${esc(d.states[index][1])}</button>` });
        }
        return entries;
      }).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true })).map(entry => entry.html).join('')}</div></div>`; }).join('')}
    </section>
    <section class="pn-sec"><button type="button" class="pn-btn wide" data-pn="restart">${ic('rotate-ccw', 15, 2)} เริ่มใหม่ตั้งแต่เปิดแอป</button></section>
    <p class="pn-foot">กดในจอได้เหมือนแอปจริง · แผงนี้ไม่ใช่ส่วนของแอป · สี โลโก้ ฟอนต์จากชุด CI</p>`;
  TP.icons(panel);
  holdAnchor(keep);
}
panel.addEventListener('click', async e => {
  const b = e.target.closest('[data-pn]'); if (!b) return;
  if (b.dataset.k != null) tapped = keyOf(b);
  const k = b.dataset.k, mob = document.documentElement.classList.contains('mob');
  switch (b.dataset.pn) {
    case 'close': toggle(false); break;
    case 'state': {
      const s = TP.sheetOpen(), owner = s?.def.hidden && s.def.owner;
      if (owner) { await TP.closeSheet({ instant: true }); TP.S.st[owner] = k; TP.prepState(TP.def(owner)); TP.sheet(owner); }
      else if (s) { const p = s.ctx.params; await TP.closeSheet({ instant: true }); TP.S.st[s.id] = k; TP.prepState(s.def); TP.sheet(s.id, p); }
      else { const id = TP.cur().id; TP.S.st[id] = k; TP.prepState(TP.SCREENS[id]); TP.refresh(); }
      break;
    }
    case 'sim': {
      const action = SIM.find(a => a.id === k);
      if (action?.when(TP.S)) { if (action.id === 'order') TP.casePreview.playChat('payment'); else action.run(); }
      if (mob) toggle(false);
      break;
    }
    case 'mock': { const open = TP.sheetOpen(), cur = TP.cur(), screenMock = !open && cur ? TP.SCREENS[cur.id]?.previewMock : null; if (open?.def?.previewMock) await open.def.previewMock.fill(open.ctx); else if (screenMock) await screenMock.fill(cur.ctx); else TP.registrationPreview?.fillCurrent(); if (mob) toggle(false); break; }
    case 'g': {
      const raw = b.dataset.v, v = raw === 'true' ? true : raw === 'false' ? false : raw;
      if (k === 'firstTime') { TP.setFlag(k, v); restart(mob); break; }
      const shown = () => (TP.sheetOpen()?.el || TP.cur()?.el)?.innerText || '', was = shown();
      if (k in TP.FLAG0) TP.setFlag(k, v); else TP.S[k] = v;
      TP.emit('state');
      /* old-app switch shows its gate right away, not only on the next app start (QA R3) */
      if (k === 'oldApp' && v && TP.SCREENS.update) { if (mob) toggle(false); render(); TP.go('update', { via: 'fade', root: true }); break; }
      if (TP.sheetOpen()) { const s = TP.sheetOpen(); await TP.closeSheet({ instant: true }); await TP.sheet(s.id, s.ctx.params); } else TP.refresh();
      render();
      if (WHERE[k] && shown() === was) TP.notify(WHERE[k][v], { icon: 'info' });
      break;
    }
    case 'jump-state': TP.S.st[k] = b.dataset.state; if (mob) toggle(false); TP.jump(k); break;
    case 'jump': {
      const defaultState = TP.def(k)?.previewDefaultState;
      if (defaultState) TP.S.st[k] = defaultState;
      if (mob) toggle(false);
      TP.jump(k);
      break;
    }
    case 'restart': restart(mob); break;
  }
});
/* start the app again; the user type and the "ทั้งแอป" switches carry over.
   The reviewer's user type lives in S.g: finishing sign-up clears S.firstTime for the running app, not this choice. */
function restart(mob) {
  TP.previewEvents?.clear();
  const g = TP.S.g;
  TP.S = TP.fresh();
  if (g) { TP.S.g = { ...g }; Object.assign(TP.S, g); }
  if (TP.S.firstTime) Object.assign(TP.S, { loggedIn: false, consent: false, notifAsked: false, notif: false });
  TP.emit('state');
  if (mob) toggle(false);
  TP.go(TP.SCREENS.splash ? 'splash' : 'home', { via: 'fade', root: true, force: true });
}
function toggle(on) { panel.classList.toggle('open', on); fab.setAttribute('aria-expanded', String(on)); if (on) { render(); panel.scrollTop = 0; $('.pn-x', panel)?.focus({ preventScroll: true }); } else fab.focus({ preventScroll: true }); }
fab.addEventListener('click', () => toggle(!panel.classList.contains('open')));
TP.on('screen', render); TP.on('sheet', () => setTimeout(render, 0)); TP.on('state', render);
TP.panel = { render, toggle };
})();
};

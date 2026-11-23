
/* ===== 00-core.js ===== */
/* =====================================================================
   00 · Core: utilities, springs, icons, odometer, money, mock data
   Everything hangs off one global: window.TP
   ===================================================================== */
const TP = window.TP = { ...window.MitrareeOrderClock };
/* Prototype data lives in /runtime/customer-fixtures.js (loaded first); UI code reads it only through these TP fields. */
const FX = window.MitrareeFixtures;
const flowPreview = new URLSearchParams(location.search).get('flowPreview') === '1';
TP.caseCode = record => window.MitrareeConsultations.codeFor(record);
TP.consultationText = record => window.MitrareeConsultations.description(record);
/* Fictional generated portraits for the prototype. Doctor is an available asset,
   not a new clinical service or consultation route. */
TP.demoProfiles = FX.demoProfiles;
TP.profileImage = who => TP.demoProfiles[who === 'me' || !who ? 'self' : who] || '';

TP.$ = (s, r = document) => r.querySelector(s);
TP.$$ = (s, r = document) => [...r.querySelectorAll(s)];
TP.clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const RM = matchMedia('(prefers-reduced-motion: reduce)');
TP.RED = () => RM.matches;
TP.FINE = matchMedia('(hover: hover) and (pointer: fine)');

/* Rendering activity for the real app and embedded /flow previews. */
TP.previewActivity = (() => {
  let inViewport = true;
  let active = !document.hidden;
  const listeners = new Set();
  document.documentElement.classList.toggle('preview-inactive', !active);
  const update = () => {
    const next = !document.hidden && inViewport;
    if (next === active) return;
    active = next;
    document.documentElement.classList.toggle('preview-inactive', !active);
    listeners.forEach(listener => listener(active));
  };
  document.addEventListener('visibilitychange', update);
  if (new URLSearchParams(location.search).get('flowPreview') === '1') {
    window.addEventListener('message', event => {
      if (event.source !== window.parent || event.origin !== location.origin) return;
      if (event.data?.type !== 'telepharmacy:preview-visibility') return;
      if (typeof event.data.visible !== 'boolean') return;
      inViewport = event.data.visible;
      update();
    });
  }
  return {
    active: () => active,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
})();

TP.wait = ms => new Promise(r => setTimeout(r, ms));
TP.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
TP.rafT = fn => { let q = false; return (...a) => { if (q) return; q = true; requestAnimationFrame(() => { q = false; fn(...a); }); }; };

/* ---------- springs rendered as CSS linear() (real physics) ---------- */
function springLinear(k, c) {
  const dt = 1 / 240, h = [0]; let x = 0, v = 0;
  for (let i = 0; i < 2400; i++) { const a = -k * (x - 1) - c * v; v += a * dt; x += v * dt; h.push(x); if (i > 30 && Math.abs(x - 1) < 5e-4 && Math.abs(v) < 5e-3) break; }
  const N = Math.min(80, h.length - 1), pts = [];
  for (let j = 0; j <= N; j++) pts.push(+h[Math.round(j / N * (h.length - 1))].toFixed(4));
  pts[0] = 0; pts[N] = 1;
  return { e: `linear(${pts.join(', ')})`, d: Math.round((h.length - 1) * dt * 1000) };
}
/* Motion is read from the same Figma tokens as component CSS. */
const motionStyle = getComputedStyle(document.documentElement);
const motionMs = (name, fallback) => parseFloat(motionStyle.getPropertyValue(name)) || fallback;
TP.motion = { fast: motionMs('--motion-fast',120), normal: motionMs('--motion-default',180), slow: motionMs('--motion-slow',240), easing: motionStyle.getPropertyValue('--motion-easing').trim() || 'cubic-bezier(.2,0,0,1)' };
TP.E = Object.fromEntries(['ios','apple','out','in','std'].map(k=>[k,TP.motion.easing]));
TP.SP = Object.fromEntries(['spring','soft','bounce'].map(k=>[k,{e:TP.motion.easing,d:TP.motion.slow}]));
TP.A = (el, kf, o = {}) => {
  const reduced = TP.RED(), requested = o.d ?? TP.motion.normal;
  const duration = reduced ? 0 : requested <= TP.motion.fast ? TP.motion.fast : requested <= TP.motion.normal ? TP.motion.normal : TP.motion.slow;
  const delay = reduced ? 0 : Math.min(o.delay || 0, TP.motion.fast);
  const animation = el.animate(kf, { duration, easing: TP.motion.easing, delay, fill: o.fill || 'none', iterations: o.it || 1 });
  // Complete finite entry animations even when a browser pauses its rendering timeline.
  if (Number.isFinite(o.it || 1)) {
    const timer = setTimeout(() => { try { if (animation.playState !== 'idle' && animation.playState !== 'finished') animation.finish(); } catch {} }, (duration * (o.it || 1)) + delay + 80);
    animation.addEventListener('finish',()=>clearTimeout(timer),{once:true});
    animation.addEventListener('cancel',()=>clearTimeout(timer),{once:true});
  }
  return animation;
};
TP.fin = a => a.finished.catch(() => {});
TP.kill = el => el.getAnimations().forEach(a => a.cancel());

/* ---------- inline lucide icons (stroke 1.75) ---------- */
TP.PATH = {
  ruler: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M7 6h4M7 10h3M7 14h4M7 18h3"/>',
  weight: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 9a4 4 0 0 1 8 0Z"/><path d="m12 9 1-2"/>',
  utensils: '<path d="M5 3v5a3 3 0 0 0 6 0V3M8 3v18M20 3c-3 0-5 3-5 7v3h5M20 3v18"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>',
  house: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  'circle-user-round': '<path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  'bell-off': '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742"/><path d="m2 2 20 20"/><path d="M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05"/>',
  'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  navigation: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', 'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>', 'chevron-left': '<path d="m15 18-6-6 6-6"/>', 'chevron-down': '<path d="m6 9 6 6 6-6"/>', 'chevron-up': '<path d="m18 15-6-6-6 6"/>',
  snowflake: '<path d="M2 12h20"/><path d="M12 2v20"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  'badge-check': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  'clipboard-list': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
  stethoscope: '<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
  'heart': '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  'heart-pulse': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  thermometer: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
  hospital: '<path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  'circle-help': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  'triangle-alert': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'octagon-alert': '<path d="M12 16h.01"/><path d="M12 8v4"/><path d="M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z"/>',
  ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  'circle-pause': '<circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  'video-off': '<path d="M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196"/><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/><path d="m2 2 20 20"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
  'mic-off': '<line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  'phone-off': '<path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="22" x2="2" y1="2" y2="22"/>',
  'switch-camera': '<path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/><path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5"/><circle cx="12" cy="12" r="3"/><path d="m18 22-3-3 3-3"/><path d="m6 2 3 3-3 3"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  send: '<path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z"/><path d="M6 12h16"/>',
  paperclip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  'message-square-text': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7"/><path d="M17 12H7"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>', minus: '<path d="M5 12h14"/>',
  'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>', 'circle-x': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  'scan-face': '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
  baby: '<path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>',
  weight: '<circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  motorcycle: '<circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="m5 17 4-7h5l5 7M9 10l4 7H5m9-7-2-5h4m-8 5H5"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  store: '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/>',
  'qr-code': '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
  'credit-card': '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  landmark: '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
  smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  'server-off': '<path d="M7 2h13a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-5"/><path d="M10 10 2.5 2.5C2 2 2 2.5 2 5v3a2 2 0 0 0 2 2h6z"/><path d="M22 17v-1a2 2 0 0 0-2-2h-1"/><path d="M4 14a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16.5l1-.5.5.5-8-8H4z"/><path d="M6 18h.01"/><path d="m2 2 20 20"/>',
  'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  'wifi-off': '<path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  'eye-off': '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  headset: '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/>',
  'ellipsis-vertical': '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  sliders: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
  ticket: '<path d="M4 5h16a1 1 0 0 1 1 1v3a3 3 0 0 0 0 6v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a3 3 0 0 0 0-6V6a1 1 0 0 1 1-1Z"/><path d="M15 5v2m0 3v4m0 3v2"/>',
  basket: '<path d="m8 3-4 7m12-7 4 7"/><path d="M2 10h20l-2 10H4L2 10Z"/><path d="M9 14v3m6-3v3"/>',
  loader: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>'
};
TP.ic = (n, s = 20, sw = 1.75, cls = 'ic') => {
  if (!TP.PATH[n]) console.warn('icon missing:', n);
  return `<svg class="${cls}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${TP.PATH[n] || ''}</svg>`;
};
/* <i data-ic="name" data-s="20"></i> placeholders become inline SVG */
TP.icons = root => TP.$$('i[data-ic]', root).forEach(e => {
  const st = e.getAttribute('style'), cl = e.className;
  e.outerHTML = TP.ic(e.dataset.ic, +e.dataset.s || 20, +e.dataset.w || 1.75, 'ic' + (cl ? ' ' + cl : '')).replace('<svg ', st ? `<svg style="${st}" ` : '<svg ');
});

/* ---------- odometer: every digit rolls on its own spring ---------- */
const DIG = '0123456789'.split('').map(d => `<span>${d}</span>`).join('');
TP.odo = (host, str, { from = null } = {}) => {
  if (!host._o) { host.innerHTML = '<span class="sr"></span><span class="odo" aria-hidden="true"></span>'; host._o = TP.$('.odo', host); host._s = TP.$('.sr', host); }
  host._s.textContent = str;
  const box = host._o, ch = [...str], sig = ch.map(c => /\d/.test(c) ? '#' : c).join(''), build = box.dataset.sig !== sig;
  if (build) { box.dataset.sig = sig; box.innerHTML = ch.map(c => /\d/.test(c) ? `<span class="od"><span class="ods">${DIG}</span></span>` : `<span class="odc">${c}</span>`).join(''); }
  const cols = TP.$$('.ods', box), dg = ch.filter(c => /\d/.test(c));
  const f = from ? [...from].filter(c => /\d/.test(c)) : (build ? dg.map(() => '0') : null);
  if (f) { cols.forEach((c, i) => { c.style.transition = 'none'; c.style.transform = `translateY(${-(+f[i] || 0) * 10}%)`; }); box.getBoundingClientRect(); cols.forEach(c => { c.style.transition = ''; }); }
  cols.forEach((c, i) => { c.style.transitionDelay = TP.RED() ? '0ms' : ((cols.length - 1 - i) * 55) + 'ms'; c.style.transform = `translateY(${-dg[i] * 10}%)`; });
};
/* ฿1,290 · ฿1,290.50 (input in baht) */
TP.money = b => '฿' + Number(b).toLocaleString('en-US', b % 1 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {});

/* ---------- tiny event bus ---------- */
const BUS = {};
TP.on = (ev, fn) => { (BUS[ev] = BUS[ev] || []).push(fn); };
TP.emit = (ev, d) => (BUS[ev] || []).forEach(fn => { try { fn(d); } catch (err) { console.error(err); } });

/* =====================================================================
   Mock data (sanitised, no real customers). Date of the mock: 18/10/2026 14:12
   ===================================================================== */
TP.NOW = FX.NOW;
TP.PHARM = FX.PHARM;
TP.BRANCHES = FX.BRANCHES;
TP.STORE = FX.STORE;
/* item 70 (owner 20/10 "12.00 ดีกว่า"): a question left while the store is closed is answered by 12:00 on the day it opens */
TP.OF_REPLY = 'ภายใน 12:00 ของวันที่ร้านเปิด';
/* A2 (FDA notice 2.1(3), "before the service" = every case): steps and risks the customer ticks before joining the queue.
   Version goes with the tick to the console (B8). Draft wording: pharmacist + legal review before launch */
TP.RISK = { ver: 'ฉบับที่ 1' };
TP.SYMPTOMS = ['ไข้', 'ไอ', 'เจ็บคอ', 'น้ำมูก', 'คัดจมูก', 'ปวดหัว', 'ปวดท้อง', 'ท้องเสีย', 'ผื่น', 'คัน', 'ปวดกล้ามเนื้อ', 'ตาแดง', 'แสบตา', 'ถามเรื่องยา'];
TP.URGENT = ['หายใจลำบาก', 'เจ็บแน่นหน้าอก', 'ซึม สับสน หรือชัก', 'ปากบวม หน้าบวมหลังใช้ยา', 'อาเจียนหรือถ่ายเป็นเลือด', 'ไข้สูงในเด็กเล็กต่ำกว่า 3 เดือน'];
TP.ORDER_ITEMS = FX.ORDER_ITEMS;
/* Photo adapter: illustrative assets can be replaced by product.image from real data. */
TP.medicinePhoto = item => item.image || (/^อะม็อกซีซิลลิน 500 มก\.$/.test(item.name) ? '/assets/photos/amoxicillin-mock-v1.png' : /^ยาแก้ไอ ชนิดน้ำ$/.test(item.name) ? '/assets/photos/cough-syrup-mock-v1.png' : /^ยาแก้แพ้ ลดน้ำมูก$/.test(item.name) ? '/assets/photos/medicine-v1.png' : /ยาอม/.test(item.name) ? '/assets/photos/lozenges-v1.png' : /พาราเซตามอล 500/.test(item.name) ? '/assets/photos/medicine-v1.png' : /สเปรย์พ่นคอ/.test(item.name) ? '/assets/photos/spray-v1.png' : '');
TP.medicineImage = item => { const src = TP.medicinePhoto(item); return src ? `<img class="medicine-photo" src="${TP.esc(src)}" alt="ภาพประกอบ${TP.esc(item.name)}" width="56" height="56" loading="lazy">` : ''; };
/* 3 ways to receive, same order and words as the website checkout (cart-shipping-method.blade.php:407-457).
   delivery fees are mock quotes */
TP.DELIVERY = [
  { id: 'pickup', name: 'รับที่หน้าร้านสาขา', sub: '', fee: 0, icon: 'store' },
  { id: 'express', name: 'จัดส่งด่วน (Lalamove)', sub: '1-4 ชม. · ไม่เกิน 15 กม. จากสาขา', fee: 89, icon: 'zap' },
  { id: 'parcel', name: 'จัดส่งพัสดุ', sub: 'ส่งทั่วไทยผ่าน Flash Express หรือ DHL Express', fee: 25, icon: 'package' }
];
/* active couriers on the website today (CourierCompanySeeder + CourierCompany::getDeliveryTimeAttribute); fees = earlier real quotes */
TP.COURIERS = [
  { id: 'flash', name: 'Flash Express', ini: 'FLASH', time: '1-3 วัน', fee: 25, logo: '/assets/couriers/flash-express.svg' },
  { id: 'dhl', name: 'DHL Express', ini: 'DHL', time: '1-2 วัน', fee: 40, logo: '/assets/couriers/dhl.svg' }
];
/* website mobile banking list (CSM:1907-1911) · built but switched off on the website (features.mobile_banking_enabled=false) */
/* A7 (owner 20/10 "ส่ง inter express logistic ไปเรียกแบบ manual ไม่มี api"): a list with a cold-chain medicine goes by pickup
   or Inter Express only; the store books the van by phone and types the tracking number.
   Owner 20/10 "ค่าบริการคงที่ 300 บาท": one fixed fee, known before the address is checked · the days are a sample */
TP.COLD = { id: 'cold', name: 'Inter Express Logistics', short: 'Inter Express', time: '1-2 วัน', fee: 300 };
/* the console's cold-chain sample (TW-00977); a panel state adds it to the list and the total follows */
TP.COLD_ITEM = FX.COLD_ITEM;
TP.withCold = (o, on) => { if (!o) return; o.items = o.items.filter(i => !i.cold); if (on) o.items = [...o.items, { ...TP.COLD_ITEM }]; o.total = o.items.reduce((t, i) => t + i.price, 0); };
/* A1 drug delivery zone (FDA notice 22/06/2026 item 2.2(1); the FDA review 20/10 reads it as every way the medicine leaves the store,
   parcel included). Owner 21/10 "15 กม. ทุกที่อยู่": the real road distance from the dispensing branch is 15 km or less for every
   address, Bangkok included (stricter than the notice, which allows all of Bangkok) · anything else = pickup only.
   Mask: road km per subdistrict per branch. Real build: the map service's driving distance
   Express (owner 20/10 "lalamove ให้จัดส่ง ไม่เกิน 15 km อยู่แล้ว"): 15 km road distance from the branch, Bangkok included,
   so the drug zone and the Lalamove radius make one rule for express. Unknown distance = out, never a guess */
TP.ZONE_KM = 15;
TP.EXP_KM = 15;
TP.EXP_RULE = 'ส่งด่วนส่งได้ไม่เกิน 15 กม. จากสาขา วัดตามระยะทางถนน';
TP.ZONE_RULE = 'ส่งยาได้เฉพาะที่อยู่ที่ห่างสาขาไม่เกิน 15 กม. วัดตามระยะทางถนน รวมในกรุงเทพ';
const ROAD_KM = { 'ทวีวัฒนา': { tw: 2.4, on: 41 }, 'อ่อนนุช': { tw: 38, on: 2.5 }, 'สวนหลวง': { tw: 36, on: 4.2 }, 'พัฒนาการ': { tw: 34, on: 6.1 }, 'คลองเตย': { tw: 28, on: 7.4 }, 'คลองตัน': { tw: 30, on: 5.3 }, 'พระโขนง': { tw: 31, on: 3.1 }, 'บางจาก': { tw: 33, on: 3.6 }, 'พระโขนงใต้': { tw: 32, on: 4.4 }, 'ศาลาธรรมสพน์': { tw: 6.5, on: 44 }, 'ประเวศ': { tw: 42, on: 9.2 }, 'หนองบอน': { tw: 40, on: 8.3 }, 'ดอกไม้': { tw: 44, on: 11 }, 'กระทุ่มราย': { tw: 62, on: 32 }, 'หนองจอก': { tw: 66, on: 36 },
  'บางสีทอง': { tw: 12, on: 36 }, 'วัดชลอ': { tw: 17, on: 39 }, 'เสาธงหิน': { tw: 13, on: 41 }, 'สำโรงเหนือ': { tw: 41, on: 9.4 }, 'เทพารักษ์': { tw: 44, on: 12 }, 'บางพลีใหญ่': { tw: 52, on: 19 }, 'บางแก้ว': { tw: 47, on: 14 }, 'ศรีภูมิ': { tw: 690, on: 700 }, 'ช้างเผือก': { tw: 692, on: 702 } };
TP.zoneOf = (a, br) => { if (!a) return null; const km = ROAD_KM[a.dist]?.[br || TP.S.branch] ?? null; return { ok: km != null && km <= TP.ZONE_KM, bkk: a.prov === 'กรุงเทพมหานคร', km }; };
/* zone lock (owner 20/10 "ทำสวิตช์ไว้แต่บอก อย. ตรงๆ"): an admin switch in the console, ON by default and in the FDA filing.
   ON = the address at billing holds the drug zone (the C209 location check at consult start was removed 8 Nov 2026).
   OFF (only after the FDA allows it; owner 21/10 "lalamove บังคับ 15 km ส่วนที่เหลือไม่บังคับ") = only express keeps 15 km: consulting is open
   everywhere (C203 notes that express cannot reach), parcel by Flash or DHL and cold may leave the zone */
TP.zoneLock = () => TP.flag('zoneLock') !== false;
/* the one zone line the acknowledgement shows, following the switch (owner 21/10) */
TP.zoneLine = () => TP.zoneLock() ? 'ส่งยาได้เฉพาะที่อยู่ไม่เกิน 15 กม. จากสาขา นอกนั้นรับยาที่ร้าน' : 'ส่งด่วนส่งได้ไม่เกิน 15 กม. จากสาขา ส่งพัสดุและส่งเย็นได้ทุกที่';
/* No phone location (user 8 Nov 2026): the service area follows the address the customer selects. */
TP.expOk = (a, br) => { const z = TP.zoneOf(a, br); return !!z && z.ok && z.km != null && z.km <= TP.EXP_KM; };
TP.CARD_FEE = 0.0365;   /* card only, on drugs + delivery (paylink card_option) */
TP.PAY_MIN = 20;        /* Omise minimum for every method (CSM:2542) */

/* the one mutable state object; panel toggles and screens both write here */
/* panel "ทั้งแอป" switches: the reviewer's choice is the base. A screen state may force a value
   (pay "ร้านปิด"), every other state goes back to the base instead of a hard default */
TP.FLAG0 = { storeOpen: true, sysOff: false, zoneLock: true, firstTime: false };
TP.flag = k => (TP.S.g && k in TP.S.g ? TP.S.g[k] : TP.FLAG0[k]);
TP.setFlag = (k, v) => { TP.S[k] = v; (TP.S.g || (TP.S.g = {}))[k] = v; };
/* opening a state (panel or link) starts from the default zone lock, so an unlocked sample never leaks into later screens
   (QA 21/10); only states made for the unlocked case (C308.21) unlock it again in their prep. The panel switch still works on the open screen */
TP.prepState = (...defs) => { TP.setFlag('zoneLock', TP.FLAG0.zoneLock); defs.forEach(d => d?.prep?.(TP.S)); };
/* Preview fixtures (customer-fixtures.js) seed the prototype account; production replaces this adapter with the account service. */
TP.previewInbox = FX.previewInbox;
TP.fresh = () => FX.account();
TP.S = TP.fresh();
TP.branch = id => TP.BRANCHES.find(b => b.id === (id || TP.S.branch));
TP.person = id => id === 'me' || !id ? { id: 'me', name: TP.S.user.full, rel: 'ตัวเอง', ...TP.S.user } : TP.S.family.find(f => f.id === id);
/* Shared self-reported health view model; missing data remains unknown. */
TP.healthRecord = (u={}) => {
 const list=items=>(Array.isArray(items)?items:[]).map(v=>String(v).trim()).filter(Boolean);
 const field=(explicit,items,none=false)=>({mode:items.length?'set':none||explicit==='none'?'none':'unknown',text:items.join('\n')});
 const food=String(u.food||'').trim();
 return {allergies:field(u.allergyState,list(u.allergies)),meds:field(u.medState,list(u.meds)),conditions:field(u.conditionState,list(u.conditions),!!u.condNone),food:field(u.foodState,food?[food]:[],!!u.foodNone)};
};
TP.consultationIdentity = record => `<div class="consultation-identity"><b>รหัสเคส ${TP.esc(TP.caseCode(record))}</b><p>${TP.esc(TP.consultationText(record) || 'ไม่มีข้อความอาการที่บันทึกไว้')}</p></div>`;
TP.stateOf = id => TP.S.st[id] ?? TP.def?.(id)?.states?.[0]?.[0] ?? 'normal';

/* ===== 10-router.js ===== */
/* =====================================================================
   10 · Router: screens, transitions, sheets, notifications, tab bar, mini bar,
        scroll effects, reveals, entry cascade, generic toggles, action delegation
   ===================================================================== */
(() => {
const { $, $$, A, E, SP, fin, kill, clamp } = TP;
const SCREENS = TP.SCREENS = {}, SHEETS = TP.SHEETS = {}, ACTS = TP.ACTS = {};
TP.ORDER = [];
TP.GROUPS = [['start', 'เริ่มใช้แอป'], ['before', 'ก่อนปรึกษา'], ['during', 'ระหว่างปรึกษา'], ['after', 'หลังปรึกษา'], ['account', 'บัญชี'], ['edge', 'จอผิดปกติ']];

/* def: {group, title, code, tab, sb, cls, parent, states, notes, wait, prep(S), render(ctx), mount(el,ctx), enter(el,ctx), leave(el,ctx)} */
TP.screen = (id, def) => { SCREENS[id] = { id, kind: 'screen', ...def }; TP.ORDER.push(id); };
/* sheet def: {group, title, code, host, tall, states, notes, wait, prep(S), render(ctx), foot(ctx), mount(el,ctx), close(ctx)} */
TP.sheetDef = (id, def) => { SHEETS[id] = { id, kind: 'sheet', ...def }; TP.ORDER.push(id); };
TP.act = (name, fn) => { ACTS[name] = fn; };
TP.def = id => SCREENS[id] || SHEETS[id];

const phone = $('#phone'), stackEl = $('#stack'), tabbar = $('#tabbar'), mini = $('#minibar');
const scrim = $('#scrim'), island = $('#island'), banner = $('#banner'), ptoast = $('#ptoast'), liveEl = $('#live');
let sheetEl = $('#sheet');
TP.phone = phone;
let cur = null, sheet = null, chain = Promise.resolve(), running = [], pending = null;
const hist = [];
TP.cur = () => cur;
TP.hist = hist;

/* ---------- context handed to render/mount ---------- */
function mkCtx(id, params, entry) {
  return {
    id, params: params || {}, S: TP.S, get state() { return TP.stateOf(id); },
    later(fn, ms) { const t = setTimeout(() => { if (entry.alive) fn(); }, ms); entry.timers.push(t); return t; },
    every(fn, ms) { const t = setInterval(() => { if (entry.alive) fn(); }, ms); entry.timers.push(t); return t; },
    onLeave(fn) { entry.cleanups.push(fn); },
    refresh: () => TP.refresh()
  };
}
function mkEntry(id, params, via) { return { id, params: params || {}, via, timers: [], cleanups: [], alive: true, el: null, ctx: null }; }
function build(entry) {
  const def = SCREENS[entry.id];
  if (!def) throw new Error('no screen ' + entry.id);
  const el = document.createElement('section');
  el.className = 'scr' + (def.cls ? ' ' + def.cls : '') + (def.tab ? ' has-tab' : '');
  el.dataset.screen = entry.id;
  el.setAttribute('aria-label', def.title);
  entry.ctx = mkCtx(entry.id, entry.params, entry);
  el.innerHTML = def.render(entry.ctx) + '<i class="dimmer" aria-hidden="true"></i>';
  TP.icons(el);
  entry.el = el; el._entry = entry;
  return el;
}
function afterInsert(entry) {
  const el = entry.el, def = SCREENS[entry.id];
  const dock = $(':scope > .dock', el);
  if (dock) {
    el.classList.add('has-dock');
    const measureDock = () => { const value = dock.offsetHeight + 'px'; if (el.style.getPropertyValue('--dock-h') !== value) el.style.setProperty('--dock-h', value); };
    measureDock();
    const observer = new ResizeObserver(measureDock); observer.observe(dock);
    entry.cleanups.push(() => observer.disconnect());
  }
  if (def.tab && !miniWanted()) el.classList.add('no-mini');
  wireScroll(entry);
  def.mount?.(el, entry.ctx);
  TP.mountDesignSelects(el, entry.ctx);
  TP.previewAutofill?.fill(el, entry.ctx);
  globalThis.TPAddressMap?.mount(el, entry.ctx);
}
function teardown(entry) {
  if (!entry) return;
  entry.alive = false;
  entry.timers.forEach(t => { clearTimeout(t); clearInterval(t); });
  entry.cleanups.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
  entry.io?.disconnect();
  SCREENS[entry.id]?.leave?.(entry.el, entry.ctx);
}

/* ---------- scroll: glass nav, large title collapse, reveals ---------- */
function wireScroll(entry) {
  const el = entry.el, sc = $(':scope > .scroll', el), nav = $(':scope > .nav', el);
  if (!sc) return;
  const lt = $('.lt', sc);
  if (nav && lt) nav.classList.add('has-lt');
  const upd = TP.rafT(() => {
    const y = sc.scrollTop;
    if (nav && !nav.classList.contains('solid')) nav.style.setProperty('--nbo', clamp(y / 20).toFixed(3));
    if (lt) {
      const p = clamp(y / 44);
      lt.style.transform = y < 0 ? `scale(${1 + Math.min(-y, 80) / 900})` : `translateY(${p * 6}px) scale(${1 - p * .06})`;
      lt.style.opacity = (1 - p * 1.05).toFixed(3);
      nav?.classList.toggle('lt-gone', y > 34);
    }
  });
  sc.addEventListener('scroll', upd, { passive: true });
  upd();
  if (!TP.RED()) {
    el.classList.add('armed');
    entry.io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('seen'); entry.io.unobserve(e.target); } }), { root: sc, threshold: .12 });
    $$('[data-rv]', sc).forEach(n => entry.io.observe(n));
  }
}
/* entry cascade: [data-in] children rise in on a soft spring */
function cascade(el, base = 60) {
  if (TP.RED()) return;
  const items = $$('[data-in]', el).filter(n => !n.closest('[data-rv]:not(.seen)'));
  items.sort((a, b) => (+a.dataset.in || 0) - (+b.dataset.in || 0));
  items.forEach((n, i) => A(n, [{ opacity: 0, transform: 'translateY(16px) scale(.985)' }, { opacity: 1, transform: 'none' }], { d: SP.soft.d, e: SP.soft.e, delay: base + i * 45, fill: 'backwards' }));
}
TP.cascade = cascade;

/* ---------- navigation ---------- */
const INVERSE = { push: 'back', cover: 'uncover', morph: 'uncover', fade: 'fade', tab: 'fade', zoom: 'fade', none: 'none', back: 'push', uncover: 'cover' };
/* TP.go(id, {via:'push'|'cover'|'fade'|'tab'|'morph'|'zoom'|'none', params, replace, root, from:Element}) */
TP.go = (id, o = {}) => {
  if (!o.force && ['queue','paused'].includes(TP.S.case?.status)) {
    if (['room','video'].includes(id)) id='queue';
    if (cur?.id==='queue' && !['queue','home','queueclosed','declined','expired'].includes(id)) return chain;
  }
  if(id==='room'&&TP.closedChatRoute?.())return TP.finishChatNavigation(TP.S.case);
  if(SCREENS[id]?.disabled){id='account';o={root:true};}
  if(['queue','room','video','pay','shipping','receipt'].includes(id)&&TP.S.case?.who&&TP.S.case.who!=='me'){id='history';o={root:true};}
  if (!SCREENS[id]) { console.warn('unknown screen', id); return chain; }
  if (pending === id && !o.force) return chain;
  pending = id;
  running.forEach(a => { try { a.finish(); } catch (e) { /* already done */ } });
  chain = chain.then(() => doGo(id, o)).catch(e => console.error(e)).finally(() => { if (pending === id) pending = null; });
  return chain;
};
async function doGo(id, o) {
  if (sheet) await TP.closeSheet({ instant: o.via === 'none', restore: false });
  const via = o.via || 'push';
  const from = cur;
  if (from) from.scrollTop = $(':scope > .scroll', from.el)?.scrollTop || 0;
  if (o.root) hist.length = 0;
  else if (from && !o.replace) hist.push({ id: from.id, params: from.params, via: from.via, scrollTop: from.scrollTop });
  const entry = mkEntry(id, o.params, via);
  build(entry);
  cur = entry;
  await swap(from, entry, via, o);
}
TP.back = () => {
  if (!sheet && (cur?.id === 'consultationready' || (cur?.id === 'queue' && ['queue','paused'].includes(TP.S.case?.status)))) return TP.go('home',{via:'uncover',root:true});
  if(!sheet&&hist.at(-1)?.id==='room'&&TP.closedChatRoute?.()){
    if(cur?.id==='track'&&TP.closedChatRoute().screen==='track')return TP.go('home',{root:true,via:'uncover'});
    return TP.finishChatNavigation(TP.S.case);
  }
  if (sheet) return TP.closeSheet();
  if (!hist.length) {
    const parent=SCREENS[cur?.id]?.parent;
    return parent&&parent!==cur?.id&&SCREENS[parent]?TP.go(parent,{via:'back',replace:true}):chain;
  }
  running.forEach(a => { try { a.finish(); } catch (e) { /* done */ } });
  chain = chain.then(async () => {
    const prev = hist.pop(); if (!prev) return;
    const from = cur, via = INVERSE[from.via] || 'back';
    const entry = mkEntry(prev.id, prev.params, prev.via);
    build(entry);
    cur = entry;
    await swap(from, entry, via, { restore: prev.scrollTop });
  }).catch(e => console.error(e));
  return chain;
};
TP.canBack = () => hist.length > 0;
/* Replace the screen under an open full-page sheet without any visible transition (closed chat -> home under C308). */
TP.swapUnderSheet = id => {
  chain = chain.then(async () => {
    const from = cur; if (!from || !sheet || from.id === id) return;
    hist.length = 0;
    const entry = mkEntry(id, {}, 'none'); build(entry); cur = entry;
    stackEl.appendChild(entry.el); from.el.remove(); teardown(from);
    afterInsert(entry); chrome(entry, false);
    if (sheet.def.tall) { tabbar.hidden || A(tabbar, [{ opacity: 0 }, { opacity: 0 }], { d: 1, fill: 'forwards' }); mini.hidden || A(mini, [{ opacity: 0 }, { opacity: 0 }], { d: 1, fill: 'forwards' }); }
    TP.emit('screen', entry);
  }).catch(e => console.error(e));
  return chain;
};
/* re-render the current screen in place (panel scenarios, state changes) */
TP.refresh = (o = {}) => {
  if(cur?.id==='room'&&TP.closedChatRoute?.())return TP.finishChatNavigation(TP.S.case);
  chain = chain.then(async () => {
    if (!cur) return;
    if (sheet && !o.keepSheet) await TP.closeSheet({ instant: true });
    const old = cur, y = $(':scope > .scroll', old.el)?.scrollTop || 0;
    const entry = mkEntry(old.id, { ...old.params, ...(o.params || {}) }, old.via);
    build(entry);
    teardown(old);
    old.el.replaceWith(entry.el);
    cur = entry;
    afterInsert(entry);
    const sc = $(':scope > .scroll', entry.el); if (sc) sc.scrollTop = y;
    $$('[data-rv]', entry.el).forEach(n => n.classList.add('seen'));
    if (o.anim !== false && !TP.RED()) A(entry.el, [{ opacity: .4 }, { opacity: 1 }], { d: 260, e: E.apple });
    chrome(entry, false);
    SCREENS[entry.id].enter?.(entry.el, entry.ctx);
    TP.emit('screen', entry);
  }).catch(e => console.error(e));
  return chain;
};
TP.tab = name => {
  const target = { home: 'home', history: 'history', inbox: 'inbox', account: 'account' }[name];
  if (!target) return;
  if (cur?.id === target && !hist.length) { const sc = $(':scope > .scroll', cur.el); sc?.scrollTo({ top: 0, behavior: TP.RED() ? 'auto' : 'smooth' }); return; }
  return TP.go(target, { via: 'tab', root: true });
};
/* jump from the panel: prepares state, rebuilds a sensible back stack */
TP.jump = async (id, o = {}) => {
  if(TP.def(id)?.disabled)return TP.go('account',{root:true});
  const def = TP.def(id); if (!def) return;
  if (def.states?.length > 1 && !TP.S.st[id]) TP.S.st[id] = def.states[0][0];   /* review code shows .1 (owner 19/10/2026) */
  TP.prepState(def);
  if (def.kind === 'sheet') {
    const host = def.host || 'home';
    if (cur?.id !== host) { TP.prepState(SCREENS[host], def); await TP.go(host, { via: o.via || 'fade', root: true, force: true, params: def.hostParams }); if (SCREENS[host].parent) hist.push({ id: SCREENS[host].parent, params: {}, via: 'tab', scrollTop: 0 }); }
    await chain;
    return TP.sheet(id, o.params);
  }
  await TP.go(id, { via: o.via || 'fade', root: true, force: true, params: o.params });
  if (def.parent) hist.push({ id: def.parent, params: {}, via: 'tab', scrollTop: 0 });
};

async function swap(from, to, via, o = {}) {
  const el = to.el;
  if (!from || via === 'none') {
    stackEl.appendChild(el);
    if (from) { from.el.remove(); teardown(from); }
    afterInsert(to);
    if (o.restore) { const sc = $(':scope > .scroll', el); if (sc) sc.scrollTop = o.restore; }
    chrome(to, false);
    SCREENS[to.id].enter?.(el, to.ctx);
    cascade(el, 40);
    TP.emit('screen', to);
    return;
  }
  const under = via === 'back' || via === 'uncover';
  if (under) stackEl.insertBefore(el, from.el); else stackEl.appendChild(el);
  afterInsert(to);
  if (o.restore) { const sc = $(':scope > .scroll', el); if (sc) sc.scrollTop = o.restore; }
  chrome(to, true, via);
  const fd = $(':scope > .dimmer', from.el), td = $(':scope > .dimmer', el);
  const an = [];
  const W = phone.clientWidth, H = phone.clientHeight;
  switch (via) {
    case 'push':
      el.style.boxShadow = '-12px 0 32px rgba(12,21,20,.14)';
      an.push(A(el, [{ transform: 'translateX(100%)' }, { transform: 'none' }], { d: 540 }));
      an.push(A(from.el, [{ transform: 'none' }, { transform: 'translateX(-28%)' }], { d: 540, fill: 'forwards' }));
      an.push(A(fd, [{ opacity: 0 }, { opacity: .1 }], { d: 540, fill: 'forwards' }));
      cascade(el, 140);
      break;
    case 'back':
      from.el.style.boxShadow = '-12px 0 32px rgba(12,21,20,.14)';
      an.push(A(from.el, [{ transform: 'none' }, { transform: 'translateX(100%)' }], { d: 460, fill: 'forwards' }));
      an.push(A(el, [{ transform: 'translateX(-28%)' }, { transform: 'none' }], { d: 460 }));
      an.push(A(td, [{ opacity: .1 }, { opacity: 0 }], { d: 460 }));
      break;
    case 'cover':
      an.push(A(el, [{ transform: 'translateY(100%)' }, { transform: 'none' }], { d: 600 }));
      an.push(A(from.el, [{ transform: 'none', borderRadius: '0px' }, { transform: 'scale(.94)', borderRadius: '28px' }], { d: 600, fill: 'forwards' }));
      an.push(A(fd, [{ opacity: 0 }, { opacity: .25 }], { d: 600, fill: 'forwards' }));
      cascade(el, 220);
      break;
    case 'uncover':
      an.push(A(from.el, [{ transform: 'none' }, { transform: 'translateY(100%)' }], { d: 480, e: E.ios, fill: 'forwards' }));
      an.push(A(el, [{ transform: 'scale(.94)', borderRadius: '28px' }, { transform: 'none', borderRadius: '0px' }], { d: 480 }));
      an.push(A(td, [{ opacity: .25 }, { opacity: 0 }], { d: 480 }));
      break;
    case 'morph': {
      /* App Store style: the tapped card grows into the next screen */
      const pr = phone.getBoundingClientRect(), r = (o.from || from.el).getBoundingClientRect(), k = pr.width / phone.offsetWidth || 1;
      const t = (r.top - pr.top) / k, l = (r.left - pr.left) / k, rr = W - (r.right - pr.left) / k, b = H - (r.bottom - pr.top) / k;
      const rad = parseFloat(getComputedStyle(o.from || from.el).borderRadius) || 20;
      an.push(A(el, [{ clipPath: `inset(${t}px ${rr}px ${b}px ${l}px round ${rad}px)` }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }], { d: SP.soft.d, e: SP.soft.e }));
      const inner = [...el.children].filter(n => !n.classList.contains('dimmer'));
      inner.forEach(n => an.push(A(n, [{ opacity: 0, transform: `translateY(${Math.max(0, t - 60) * .25}px)` }, { opacity: 1, transform: 'none' }], { d: 520, e: E.out, delay: 120 })));
      an.push(A(from.el, [{ transform: 'none' }, { transform: 'scale(.96)' }], { d: SP.soft.d, e: SP.soft.e, fill: 'forwards' }));
      an.push(A(fd, [{ opacity: 0 }, { opacity: .3 }], { d: 500, fill: 'forwards' }));
      break;
    }
    case 'zoom':
      an.push(A(el, [{ opacity: 0, transform: 'scale(1.05)' }, { opacity: 1, transform: 'none' }], { d: 760, e: E.out }));
      an.push(A(from.el, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.97)' }], { d: 420, e: E.apple, fill: 'forwards' }));
      cascade(el, 260);
      break;
    case 'tab':
      an.push(A(el, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { d: 320, e: E.out }));
      an.push(A(from.el, [{ opacity: 1 }, { opacity: 0 }], { d: 160, e: E.apple, fill: 'forwards' }));
      cascade(el, 60);
      break;
    default: /* fade */
      an.push(A(el, [{ opacity: 0, transform: 'scale(1.015)' }, { opacity: 1, transform: 'none' }], { d: 380, e: E.apple }));
      an.push(A(from.el, [{ opacity: 1 }, { opacity: 0 }], { d: 260, e: E.apple, fill: 'forwards' }));
      cascade(el, 80);
  }
  running = an;
  await Promise.all(an.map(fin));
  running = [];
  from.el.remove();
  teardown(from);
  el.style.boxShadow = '';
  SCREENS[to.id].enter?.(el, to.ctx);
  TP.emit('screen', to);
}

/* ---------- chrome: status bar tone, tab bar, mini bar ---------- */
function chrome(entry, animate, via) {
  const def = SCREENS[entry.id];
  phone.dataset.sb = sheet?.def.fullPage ? 'dark' : sheet?.def.tall ? 'light' : (typeof def.sb === 'function' ? def.sb(entry.ctx) : (def.sb || 'dark'));
  const showTab = !!def.tab, was = !tabbar.hidden;
  if (showTab) {
    $$('.tb', tabbar).forEach((b, i) => { const on = b.dataset.tab === def.tab; b.toggleAttribute('aria-current', on); if (on) { b.setAttribute('aria-current', 'page'); tabbar.style.setProperty('--ti', i); } else b.removeAttribute('aria-current'); });
  }
  if (showTab !== was) {
    kill(tabbar);
    if (showTab) { tabbar.hidden = false; if (animate) A(tabbar, [{ transform: 'translateY(120%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { d: SP.soft.d, e: SP.soft.e, delay: 120 }); }
    else if (animate) { const a = A(tabbar, [{ transform: 'none', opacity: 1 }, { transform: via === 'push' ? 'translateX(-30%)' : 'translateY(120%)', opacity: 0 }], { d: 360, e: E.ios, fill: 'forwards' }); fin(a).then(() => { if (!SCREENS[cur.id].tab) { tabbar.hidden = true; kill(tabbar); } }); }
    else tabbar.hidden = true;
  }
  TP.mini(animate);
}
/* mini bar = the open case, visible above the tab bar (like a now-playing bar) */
/* Original vector artwork; portable to Flutter as SVG assets. */
TP.miniStatusIcon = kind => {
  const artwork = {
    waiting: '<circle cx="16" cy="16" r="11"/><path d="M16 9v7l4 3"/><path d="M7 5 4 8M25 5l3 3"/>',
    paused: '<path d="M5 12h17v8a6 6 0 0 1-6 6h-5a6 6 0 0 1-6-6Z"/><path d="M22 13h2a4 4 0 0 1 0 8h-2M4 29h21M10 8V4M17 8V3"/>',
    chat: '<path d="M7 6h18a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H13l-7 4v-4a3 3 0 0 1-3-3V10a4 4 0 0 1 4-4Z"/><circle cx="10" cy="15" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="15" r="1" fill="currentColor" stroke="none"/><circle cx="22" cy="15" r="1" fill="currentColor" stroke="none"/>',
    reply: '<path d="M10 8H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h3v4l6-4h10a3 3 0 0 0 3-3v-5"/><path d="m21 3-6 6 6 6M15 9h7a6 6 0 0 1 6 6"/>',
    delivery: '<path d="M3 7h16v17H3Z"/><path d="M19 13h5l5 6v5H19"/><circle cx="9" cy="25" r="3"/><circle cx="24" cy="25" r="3"/>',
    payment: '<rect x="3" y="7" width="26" height="19" rx="4"/><path d="M3 13h26M8 20h5"/><circle cx="24" cy="7" r="5" fill="var(--semantic-primary)"/><path d="M24 4v6M22 5h3M23 9h3"/>'
  };
  return `<svg class="mb-status-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false">${artwork[kind] || artwork.chat}</svg>`;
};
function miniWanted() { const c = TP.S.case; return !!(c && (!c.who||c.who==='me') && c.order?.status!=='paid' && (c.order?.status==='pending'||!['closed', 'cancelled', 'declined', 'expired'].includes(c.status))); }
TP.miniInfo = () => null; /* 60-main replaces this: () => ({title, sub, go}) */
TP.mini = (animate = true) => {
  const def = cur && SCREENS[cur.id], info = miniWanted() && def?.tab ? TP.miniInfo() : null, was = !mini.hidden;
  cur?.el.classList.toggle('no-mini', !info);
  if (info) {
    const kind = info.icon || 'chat';
    mini.innerHTML = `<span class="mb-icon" aria-hidden="true">${TP.miniStatusIcon(kind)}</span><span class="mb-t"><b>${TP.esc(info.title)}</b><span>${info.orderCase?`เหลือเวลาชำระ <b data-order-countdown data-order-case="${TP.esc(info.orderCase)}">${TP.esc(TP.orderRemaining(TP.S.case.order))}</b>`:TP.esc(info.sub)}</span></span><span class="mb-go">${TP.esc(info.cta || 'เปิด')}</span>`;
    mini.dataset.go = info.go; mini.dataset.via = 'cover';
    mini.dataset.statusIcon = kind;
    mini.setAttribute('aria-label', info.title + ' ' + info.sub);
    if (!was) { mini.hidden = false; if (animate) A(mini, [{ transform: 'translateY(30px) scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }], { d: SP.spring.d, e: SP.spring.e, delay: 160 }); }
  } else if (was) {
    if (animate) { const a = A(mini, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(30px) scale(.94)' }], { d: 260, e: E.apple, fill: 'forwards' }); fin(a).then(() => { mini.hidden = true; kill(mini); }); }
    else mini.hidden = true;
  }
};

/* ---------- sheets above the current page ---------- */
TP.sheet = async (id, params = {}) => {
  if(SHEETS[id]?.disabled)return;
  const def = SHEETS[id]; if (!def) return console.warn('unknown sheet', id);
  await chain;
  if (sheet?.closing) await sheet.closing;
  if (sheet?.id === id && sheet.underlay) return;
  const underlay = sheet && sheet.id === def.over ? sheet : null;
  if (sheet && !underlay) await TP.closeSheet({ instant: true });
  const prevFocus = document.activeElement;
  if (underlay) {
    const overlay = sheetEl.cloneNode(false);
    sheetEl.id = 'sheet-underlay';
    sheetEl.classList.add('sheet-underlay');
    sheetEl.inert = true;
    $('#sheetTitle', sheetEl).id = 'sheetUnderlayTitle';
    sheetEl.setAttribute('aria-labelledby', 'sheetUnderlayTitle');
    sheetEl.after(overlay);
    sheetEl = overlay;
    bindSheetDrag(sheetEl);
  }
  const entry = mkEntry(id, params, 'sheet');
  const ctx = entry.ctx = mkCtx(id, params, entry);
  const title = typeof def.title === 'function' ? def.title(ctx) : def.title;
  sheetEl.className = 'sheet' + (def.tall ? ' tall' : '') + (def.fullPage ? ' full-page' : '') + (def.cls ? ' ' + def.cls : '');
  sheetEl.innerHTML = `${def.fullPage?'':'<div class="grab" aria-hidden="true"></div>'}<header class="sh-h">${def.fullPage?`<button type="button" class="ibtn sh-back" data-close-sheet aria-label="ย้อนกลับ">${TP.ic(def.backIcon || 'chevron-left',24,2)}</button>`:''}<h2 id="sheetTitle" tabindex="-1">${TP.esc(def.sheetTitle ? def.sheetTitle(ctx) : title)}</h2>${def.hideClose||def.fullPage ? '' : `<button type="button" class="sh-x" data-close-sheet aria-label="ปิด">${TP.ic('x', 18, 2.2)}</button>`}</header><div class="sh-b">${def.render(ctx)}</div>${def.foot ? `<div class="sh-f">${def.foot(ctx)}</div>` : ''}`;
  TP.icons(sheetEl);
  sheet = { id, def, ctx, entry, el:sheetEl, prevFocus, underlay };
  sheetEl.hidden = false; scrim.hidden = !!def.fullPage;
  def.mount?.(sheetEl, ctx);
  sheetEl._addressMapCtx=ctx;
  globalThis.TPAddressMap?.mount(sheetEl, ctx);
  TP.previewAutofill?.fill(sheetEl, ctx);
  A(scrim, [{ opacity: 0 }, { opacity: 1 }], { d: 320, e: E.apple });
  const a = A(sheetEl, [{ transform: def.fullPage?'translateX(100%)':'translateY(100%)' }, { transform: 'none' }], { d: SP.soft.d, e: SP.soft.e });
  if (def.tall && cur) {
    phone.dataset.sb = def.fullPage?'dark':'light';
    tabbar.hidden || A(tabbar, [{ opacity: 1 }, { opacity: 0 }], { d: 200, fill: 'forwards' });
    mini.hidden || A(mini, [{ opacity: 1 }, { opacity: 0 }], { d: 200, fill: 'forwards' });
  }
  if (!TP.RED()) cascade(sheetEl, 120);
  const active = sheet;
  setTimeout(() => {
    if (sheet === active && !active.closing) ($('.sh-b [autofocus]', active.el) || $('#sheetTitle', active.el))?.focus({ preventScroll: true });
  }, 60);
  TP.emit('sheet', sheet);
  await fin(a);
};
TP.closeSheet = async ({ instant = false, restore = !instant } = {}) => {
  const s = sheet;
  if (!s) return;
  if (s.closing) {
    if (!restore) s.restore = false;
    return s.closing;
  }
  s.restore = restore;
  s.closing = hideSheet(s, instant);
  await s.closing;
  if (s.restore) await s.def.afterClose?.(s.ctx);
};
async function hideSheet(s, instant) {
  s.entry.alive = false; s.entry.timers.forEach(t => { clearTimeout(t); clearInterval(t); }); s.entry.cleanups.forEach(fn => fn());
  s.def.close?.(s.ctx);
  if (cur && !s.underlay) {
    const def = SCREENS[cur.id];
    phone.dataset.sb = typeof def.sb === 'function' ? def.sb(cur.ctx) : (def.sb || 'dark');
  }
  const back = [];
  if (s.def.tall && cur) {
    kill(tabbar); kill(mini);
  }
  if (!instant) {
    await Promise.all([fin(A(sheetEl, [{ transform: getComputedStyle(sheetEl).transform === 'none' ? 'none' : getComputedStyle(sheetEl).transform }, { transform: s.def.fullPage?'translateX(105%)':'translateY(105%)' }], { d: 380, e: E.ios, fill: 'forwards' })),
      fin(A(scrim, [{ opacity: 1 }, { opacity: 0 }], { d: 320, e: E.apple, fill: 'forwards' })), ...back.map(fin)]);
  }
  kill(sheetEl); kill(scrim);
  scrim.hidden = true;
  sheet = s.underlay;
  if (s.underlay) {
    sheetEl.remove();
    sheetEl = sheet.el;
    sheetEl.id = 'sheet';
    sheetEl.classList.remove('sheet-underlay');
    sheetEl.inert = false;
    $('#sheetUnderlayTitle', sheetEl).id = 'sheetTitle';
    sheetEl.setAttribute('aria-labelledby', 'sheetTitle');
    if (!s.restore) return TP.closeSheet({ instant: true, restore: false });
  } else {
    cur && kill(cur.el);
    sheetEl.hidden = true;
    sheetEl.innerHTML = '';
  }
  if (s.prevFocus && document.contains(s.prevFocus)) s.prevFocus.focus({ preventScroll: true });
  TP.emit('sheet', sheet);
}
TP.sheetOpen = () => sheet;
scrim.addEventListener('click', () => { if (sheet && !sheet.def.locked) TP.closeSheet(); });
/* drag the grab handle / header down to dismiss */
function bindSheetDrag(sheetEl) {
  let y0 = 0, t0 = 0, dy = 0, drag = false;
  sheetEl.addEventListener('pointerdown', e => {
    if (sheet?.el !== sheetEl || sheet.def.locked || sheet.def.fullPage || !e.target.closest('.grab,.sh-h') || e.target.closest('button')) return;
    drag = true; y0 = e.clientY; t0 = performance.now(); dy = 0; sheetEl.setPointerCapture(e.pointerId); kill(sheetEl);
  });
  sheetEl.addEventListener('pointermove', e => {
    if (!drag) return;
    const k = phone.getBoundingClientRect().height / phone.offsetHeight || 1;
    dy = (e.clientY - y0) / k;
    sheetEl.style.transform = `translateY(${dy > 0 ? dy : dy / 6}px)`;
  });
  const end = () => {
    if (!drag) return; drag = false;
    const v = dy / Math.max(1, performance.now() - t0);
    sheetEl.style.transform = '';
    if (dy > 110 || v > .6) { sheetEl.style.transform = `translateY(${dy}px)`; TP.closeSheet().then(() => { sheetEl.style.transform = ''; }); }
    else A(sheetEl, [{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { d: SP.spring.d, e: SP.spring.e });
  };
  sheetEl.addEventListener('pointerup', end); sheetEl.addEventListener('pointercancel', end);
}
bindSheetDrag(sheetEl);
/* focus trap + Escape */
document.addEventListener('keydown', e => {
  if (!sheet) return;
  if (e.key === 'Escape' && !sheet.def.locked) { e.preventDefault(); TP.closeSheet(); return; }
  if (e.key !== 'Tab') return;
  const f = $$('button:not([disabled]),[href],input:not([disabled]),textarea,select,[tabindex]:not([tabindex="-1"])', sheetEl).filter(n => n.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ---------- notifications: island (chrome) / pill toast / push banner ---------- */
TP.live = msg => { liveEl.textContent = ''; setTimeout(() => { liveEl.textContent = msg; }, 30); };
let islT = 0, toastT = 0, banT = 0, banTok = 0;
TP.notify = (msg, { icon = 'check', dismissible = false, title = '', description = '', image = '' } = {}) => {
  TP.live([title || msg, description].filter(Boolean).join(' '));
  ptoast.dataset.tone = /alert|x|error/.test(icon) ? 'error' : /info|clock/.test(icon) ? 'info' : 'success';
  if (!dismissible && document.documentElement.classList.contains('chrome') && !phone.closest('.device-real')) {
    const c = $('.isl-c', island);
    c.innerHTML = `<span class="isl-i">${TP.ic(icon, 16, 2.2)}</span><b>${TP.esc(msg)}</b>`;
    kill(island); kill(c); clearTimeout(islT);
    const w = Math.min(phone.clientWidth - 28, 340);
    A(island, [{ width: '120px', height: '34px', borderRadius: '20px' }, { width: w + 'px', height: '44px', borderRadius: '24px' }], { d: SP.spring.d, e: SP.spring.e, fill: 'forwards' });
    A(c, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { d: 280, delay: 140, fill: 'forwards' });
    islT = setTimeout(() => {
      A(c, [{ opacity: 1 }, { opacity: 0 }], { d: 160, fill: 'forwards' });
      A(island, [{ width: w + 'px', height: '44px', borderRadius: '24px' }, { width: '120px', height: '34px', borderRadius: '20px' }], { d: 520, e: SP.soft.e, delay: 100, fill: 'forwards' });
    }, 2400);
  } else {
    ptoast.classList.toggle('ptoast-rich',Boolean(title));
    ptoast.innerHTML = (title ? (image ? '<img class="ptoast-art" src="'+TP.esc(image)+'" alt="">' : '') + '<div class="ptoast-copy"><strong>'+TP.esc(title)+'</strong><p>'+TP.esc(description)+'</p></div>' : TP.ic(icon,20,2) + '<span>' + TP.esc(msg) + '</span>') + (dismissible ? '<button type="button" class="ptoast-close" aria-label="ปิดข้อความแจ้งเตือน">'+TP.ic('x',18,2)+'</button>' : ''); kill(ptoast); clearTimeout(toastT); ptoast.style.visibility = 'visible'; ptoast.setAttribute('aria-hidden','false'); ptoast.classList.toggle('dismissible',dismissible);
    if (dismissible) $('.ptoast-close',ptoast).onclick = () => { kill(ptoast); clearTimeout(toastT); ptoast.style.visibility='hidden'; ptoast.setAttribute('aria-hidden','true'); };
    A(ptoast, [{ transform: 'translate(-50%,-180%)' }, { transform: 'translate(-50%,0)' }], { d: SP.spring.d, e: SP.spring.e, fill: 'forwards' });
    if (!dismissible) toastT = setTimeout(() => fin(A(ptoast, [{ transform: 'translate(-50%,0)' }, { transform: 'translate(-50%,-180%)' }], { d: 320, e: E.in, fill: 'forwards' })).then(() => { ptoast.style.visibility = 'hidden'; }), 2400);
  }
};
/* push banner: neutral wording only (no symptom / drug / amount, PDPA) */
TP.banner = ({ title, body = '', time = 'ตอนนี้', onTap = null, go = null, via = 'cover' }) => {
  const tok = ++banTok;
  banner.innerHTML = `<span class="appicon">${TP.brand.plus(20)}</span><span class="bt"><small><span>MITRAREE</span><span>${TP.esc(time)}</span></small><b>${TP.esc(title)}</b>${body ? `<span>${TP.esc(body)}</span>` : ''}</span>`;
  banner.onclick = () => { hide(); if (onTap) onTap(); else if (go) TP.go(go, { via }); };
  kill(banner); clearTimeout(banT); banner.hidden = false;
  TP.live(title + ' ' + body);
  A(banner, [{ transform: 'translateY(-130%) scale(.96)', opacity: 0 }, { transform: 'none', opacity: 1 }], { d: SP.spring.d, e: SP.spring.e, fill: 'forwards' });
  banT = setTimeout(hide, 4600);
  function hide() { if (tok !== banTok) return; clearTimeout(banT); fin(A(banner, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-130%)', opacity: 0 }], { d: 340, e: E.in, fill: 'forwards' })).then(() => { if (tok === banTok) { kill(banner); banner.hidden = true; } }); }
};

/* ---------- pointer tilt + sheen on [data-tilt] ---------- */
phone.addEventListener('pointermove', e => {
  if (!TP.FINE.matches || TP.RED()) return;
  const t = e.target.closest('[data-tilt]'); if (!t) return;
  const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5, m = +t.dataset.tilt || 5;
  t.style.transition = 'transform .12s linear';
  t.style.transform = `perspective(700px) rotateX(${(-y * m).toFixed(2)}deg) rotateY(${(x * m).toFixed(2)}deg)`;
  t.style.setProperty('--sheen', '1'); t.style.setProperty('--shx', (x * 60).toFixed(1) + '%');
});
phone.addEventListener('pointerout', e => {
  const t = e.target.closest('[data-tilt]'); if (!t || t.contains(e.relatedTarget)) return;
  t.style.transition = `transform var(--spring-d) var(--spring)`; t.style.transform = ''; t.style.setProperty('--sheen', '0');
});

/* ---------- action delegation + generic toggles ---------- */
const parseP = s => { if (!s) return {}; try { return JSON.parse(s); } catch { return Object.fromEntries(s.split('&').map(kv => kv.split('='))); } };
function ctxOf(t) { if (sheet && sheetEl.contains(t)) return sheet.ctx; return cur?.ctx; }
phone.addEventListener('click', e => {
  const t = e.target.closest('[data-go],[data-back],[data-a],[data-sheet],[data-close-sheet],[data-tab],[data-toggle],[data-radio],[data-seg]');
  if (!t || !phone.contains(t)) return;
  if (t.disabled || t.getAttribute('aria-disabled') === 'true') return;
  if (t.dataset.toggle !== undefined) {
    const attr = t.hasAttribute('aria-checked') ? 'aria-checked' : 'aria-pressed';
    t.setAttribute(attr, String(t.getAttribute(attr) !== 'true'));
  }
  if (t.dataset.radio) {
    const scope = t.closest('[data-radio-scope]') || t.parentElement;
    $$(`[data-radio="${t.dataset.radio}"]`, scope).forEach(n => n.setAttribute('aria-checked', String(n === t)));
  }
  if (t.dataset.seg !== undefined) $$('button', t.closest('.seg')).forEach(n => n.setAttribute('aria-pressed', String(n === t)));
  if (t.dataset.tab) return TP.tab(t.dataset.tab);
  if (t.hasAttribute('data-close-sheet') && !t.dataset.go && !t.dataset.a) return TP.closeSheet();
  if (t.hasAttribute('data-back')) return TP.back();
  if (t.dataset.sheet) return TP.sheet(t.dataset.sheet, parseP(t.dataset.p));
  if (t.dataset.go) return TP.go(t.dataset.go, { via: t.dataset.via || 'push', params: parseP(t.dataset.p), from: t.dataset.via === 'morph' ? t : undefined, replace: t.hasAttribute('data-replace'), root: t.hasAttribute('data-root') });
  if (t.dataset.a) {
    const fn = ACTS[t.dataset.a];
    if (fn) fn(t, ctxOf(t), e); else console.warn('no action', t.dataset.a);
  }
});
/* inputs: data-bind="path.in.TP.S" keeps S in sync (prototype only) */
phone.addEventListener('input', e => {
  const t = e.target.closest('[data-bind]'); if (!t) return;
  const keys = t.dataset.bind.split('.'); let o = TP.S;
  keys.slice(0, -1).forEach(k => { o = o[k]; });
  o[keys[keys.length - 1]] = t.value;
  if (t.dataset.a) ACTS[t.dataset.a]?.(t, ctxOf(t), e);
});
})();

/* ===== 20-ui.js ===== */
/* =====================================================================
   20 · UI builders: return HTML strings. Screens compose these so every
   screen shares the same nav, buttons, rows, fields and states.
   ===================================================================== */
(() => {
const { esc, ic } = TP;
const attrs = o => Object.entries(o || {}).filter(([, v]) => v !== undefined && v !== null && v !== false).map(([k, v]) => v === true ? k : `${k}="${esc(v)}"`).join(' ');
/* data-* routing shorthand: {go, via, a, sheet, p, back} */
const route = o => attrs({ 'data-go': o.go, 'data-via': o.via, 'data-a': o.a, 'data-sheet': o.sheet, 'data-p': o.p ? (typeof o.p === 'string' ? o.p : JSON.stringify(o.p)) : undefined, 'data-back': o.back || undefined, 'data-close-sheet': o.closeSheet || undefined });

const ui = TP.ui = {
  attrs, route,
  /* top bar. {title, back:true|'label', large:bool, right:html, left:html, solid, onTeal, close:true} */
  nav(o = {}) {
    const left = o.left ?? (o.close ? `<button type="button" class="ibtn" data-back aria-label="ปิด">${ic('x', 22, 2)}</button>`
      : o.back ? `<button type="button" class="back" data-back>${ic('chevron-left', 22, 2.2)}<span>${esc(o.back === true ? 'กลับ' : o.back)}</span></button>` : '');
    return `<header class="nav${o.solid ? ' solid' : ''}${o.onTeal ? ' on-teal' : ''}"><div class="nb-l">${left}</div><h1 class="nb-t">${esc(o.title || '')}</h1><div class="nb-r">${o.right || ''}</div></header>`;
  },
  /* scrolling body. lt = large title, sub = line under it */
  page(inner, o = {}) {
    return `<div class="scroll app-page${o.nonav ? ' nonav' : ''}${o.cls ? ' ' + o.cls : ''}">${o.lt ? `<h2 class="lt" data-in="0">${esc(o.lt)}</h2>` : ''}${o.sub ? `<p class="lt-sub" data-in="0">${o.sub}</p>` : ''}${inner}</div>`;
  },
  dock(inner, o = {}) { return `<div class="dock${o.clear ? ' clear' : ''}">${inner}${o.note ? `<p class="dock-note">${o.note}</p>` : ''}</div>`; },
  /* button. kind: primary|secondary|tint|ghost|danger|danger-line|white|glass ; sm ; icon ; disabled ; + route props */
  btn(label, o = {}) {
    const cls = ['btn', o.kind || 'primary', (o.size === 'sm' || o.sm) && 'sm', o.size === 'lg' && 'lg', o.auto && 'auto', o.cls].filter(Boolean).join(' ');
    const icon = o.icon ? ic(o.icon, o.sm ? 18 : 20, 2) : '';
    const tail = o.iconRight ? ic(o.iconRight, o.sm ? 18 : 20, 2) : '';
    return `<button type="button" class="${cls}" ${route(o)} ${attrs({ disabled: o.disabled, id: o.id, 'aria-label': o.aria, 'data-in': o.din })}>${icon}<span>${esc(label)}</span>${tail}</button>`;
  },
  card(inner, o = {}) { return `<div class="card${o.cls ? ' ' + o.cls : ''}" ${attrs({ 'data-in': o.din, 'data-rv': o.rv ? '' : undefined, 'data-tilt': o.tilt })}>${inner}</div>`; },
  /* list row: {icon, iconCls, title, sub, value, chev, tag, danger, + route props, html (custom right)} */
  row(o) {
    /* o.href: external link row (e.g. add LINE Official Account), opens outside the app */
    if (o.href) return `<a class="row" href="${esc(o.href)}" target="_blank" rel="noopener noreferrer">${o.icon ? `<span class="r-ic">${ic(o.icon, 19, 1.9)}</span>` : ''}<span class="r-t"><b>${esc(o.title)}</b>${o.sub ? `<span>${esc(o.sub)}</span>` : ''}</span><span class="chev">${ic('external-link', 18, 2)}</span></a>`;
    const tag = o.go || o.a || o.sheet || o.back ? 'button' : 'div';
    const left = o.av ? o.av : o.icon ? `<span class="r-ic${o.iconCls ? ' ' + o.iconCls : ''}">${ic(o.icon, 19, 1.9)}</span>` : '';
    const right = (o.tag ? `<span class="tag ${o.tag[1] || ''}">${esc(o.tag[0])}</span>` : '') + (o.value ? `<span class="r-v">${esc(o.value)}</span>` : '') + (o.html || '') + (o.chev !== false && tag === 'button' ? `<span class="chev">${ic('chevron-right', 18, 2)}</span>` : '');
    return `<${tag} ${tag === 'button' ? 'type="button"' : ''} class="row${o.danger ? ' danger' : ''}" ${route(o)}>${left}<span class="r-t"><b>${esc(o.title)}</b>${o.sub ? `<span>${o.subHtml ? o.sub : esc(o.sub)}</span>` : ''}</span>${right}</${tag}>`;
  },
  group(rows, o = {}) {
    return `${o.title ? `<h3 class="group-h">${esc(o.title)}</h3>` : ''}<div class="group${rows.some(r => r.includes('r-ic')) ? ' ic-rows' : ''}" ${attrs({ 'data-in': o.din, 'data-rv': o.rv ? '' : undefined })}>${rows.join('')}</div>${o.foot ? `<p class="group-f">${o.foot}</p>` : ''}`;
  },
  tag(text, tone = '', o = {}) { return `<span class="tag ${tone}">${o.dot ? `<i class="dot${o.live ? ' live' : ''}"></i>` : ''}${esc(text)}</span>`; },
  note(html, o = {}) { return `<div class="note ${o.tone || ''}" ${attrs({ 'data-in': o.din, 'data-rv': o.rv ? '' : undefined, role: o.tone === 'danger' ? 'alert' : undefined })}>${ic(o.icon || (o.tone === 'warn' || o.tone === 'danger' ? 'triangle-alert' : 'info'), 18, 2)}<div>${html}</div></div>`; },
  /* every error / help screen ends with a way to reach a person: the case's branch + customer service */
  callHelp(o = {}) {
    const b = TP.branch(o.branch || TP.S.case?.branch || TP.S.branch || 'tw'), shut = TP.S.storeOpen === false;
    /* the mock clock says 14:12, so "store closed" stands for night: both lines are closed and say so */
    return ui.group([
      ui.row({ icon: 'phone', title: 'โทรหา' + b.name, sub: `${b.phone} · เปิด ${b.hours}`, a: 'callHelp', p: { tel: b.phone }, tag: shut ? ['ปิดอยู่', 'muted'] : null }),
      ui.row({ icon: 'headset', title: 'ฝ่ายบริการลูกค้า', sub: `${TP.support[1]} · ${TP.STORE.csHours}`, go: 'help', tag: shut ? ['ปิดอยู่', 'muted'] : null })
    ], { title: o.title ?? 'ต้องการคุยกับคน', din: o.din, foot: shut ? 'นอกเวลาทำการ ถ้าอาการรุนแรง ไปโรงพยาบาลได้เลย' : '' });
  },
  secH(title, o = {}) { return `<div class="sec-h" ${attrs({ 'data-in': o.din })}><h2>${esc(title)}</h2>${o.link ? `<button type="button" class="link" ${route(o.link)}>${esc(o.link.label)}</button>` : ''}</div>`; },
  /* field: {id, label, value, placeholder, type, hint, error, textarea, optional, bind, inputmode, autocomplete} */
  field(o) {
    const id = o.id || 'f' + Math.random().toString(36).slice(2, 7);
    const a = attrs({ id, class: 'input', type: o.textarea ? undefined : (o.type || 'text'), placeholder: o.placeholder, inputmode: o.inputmode, autocomplete: o.autocomplete, 'data-bind': o.bind, 'data-a': o.a, maxlength: o.max, 'aria-invalid': o.error ? 'true' : undefined, 'aria-describedby': o.error ? id + '-e' : o.hint ? id + '-h' : undefined });
    const ctl = o.textarea ? `<textarea ${a} rows="${o.rows || 3}">${esc(o.value || '')}</textarea>` : `<input ${a} value="${esc(o.value || '')}">`;
    return `<div class="field${o.error ? ' err' : ''}" ${attrs({ 'data-in': o.din })}><label for="${id}">${esc(o.label)}${o.optional ? ' <span class="opt-t">(ไม่บังคับ)</span>' : ''}</label>${ctl}${o.error ? `<p class="err-t" id="${id}-e">${ic('circle-x', 16, 2)}<span>${esc(o.error)}</span></p>` : o.hint ? `<p class="hint" id="${id}-h">${o.hint}</p>` : ''}</div>`;
  },
  /* chips: items = [label] or [[value,label]] ; selected = array ; o.a = action after toggle ; o.red */
  chips(name, items, selected = [], o = {}) {
    return `<div class="chips" role="group" aria-label="${esc(o.label || name)}" data-chips="${esc(name)}">${items.map(it => {
      const [v, l] = Array.isArray(it) ? it : [it, it];
      const on = selected.includes(v);
      return `<button type="button" class="chip${o.red ? ' red' : ''}" data-toggle data-v="${esc(v)}" ${o.a ? `data-a="${esc(o.a)}"` : ''} aria-pressed="${on}"><svg class="ck-i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>${esc(l)}</button>`;
    }).join('')}${o.add ? `<button type="button" class="chip add" ${route(o.add)}>${ic(o.add.icon || 'plus', 16, 2.2)}${esc(o.add.label)}</button>` : ''}</div>`;
  },
  chipVals(scope, name) { return TP.$$(`[data-chips="${name}"] .chip[aria-pressed=true]`, scope).map(n => n.dataset.v); },
  /* segmented: items [[value,label,icon?]] */
  seg(name, items, value, o = {}) {
    return `<div class="seg" role="group" aria-label="${esc(o.label || name)}" data-segname="${esc(name)}">${items.map(([v, l, i]) => `<button type="button" data-seg data-v="${esc(v)}" ${o.a ? `data-a="${esc(o.a)}"` : ''} aria-pressed="${v === value}">${i ? ic(i, 18, 2) : ''}${esc(l)}</button>`).join('')}</div>`;
  },
  segVal(scope, name) { return TP.$(`[data-segname="${name}"] [aria-pressed=true]`, scope)?.dataset.v; },
  /* switch row inside a group */
  switchRow(o) { return `<div class="row">${o.icon ? `<span class="r-ic">${ic(o.icon, 19, 1.9)}</span>` : ''}<span class="r-t"><b>${esc(o.title)}</b>${o.sub ? `<span>${esc(o.sub)}</span>` : ''}</span><button type="button" class="sw" role="switch" data-toggle aria-checked="${!!o.on}" aria-label="${esc(o.title)}" ${o.a ? `data-a="${esc(o.a)}"` : ''} ${o.id ? `id="${esc(o.id)}"` : ''}></button></div>`; },
  check(html, o = {}) { return `<button type="button" class="ck" role="checkbox" data-toggle aria-checked="${!!o.on}" ${attrs({ 'data-a': o.a, id: o.id, disabled: o.disabled ? '' : undefined })}><span class="box"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span><span>${html}</span></button>`; },
  radioMark: '<svg class="rd" viewBox="0 0 24 24" aria-hidden="true"><circle class="ring0" cx="12" cy="12" r="11"/><circle class="disc" cx="12" cy="12" r="11"/><path class="chk" d="M7 12.5l3.2 3.2L17 9"/></svg>',
  /* radio option card: {group, v, title, sub, price, on, disabled, a, icon} */
  opt(o) { return `<button type="button" class="opt" role="radio" data-radio="${esc(o.group)}" data-v="${esc(o.v)}" aria-checked="${!!o.on}" ${attrs({ disabled: o.disabled, 'data-a': o.a })}>${ui.radioMark}${o.icon ? `<span class="r-ic" style="width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--brand-tint);color:var(--brand)">${ic(o.icon, 19, 1.9)}</span>` : ''}<span class="tx"><b>${esc(o.title)}</b>${o.sub ? `<span>${esc(o.sub)}</span>` : ''}</span>${o.price != null ? `<span class="pz">${esc(o.price)}</span>` : ''}</button>`; },
  emptyArt(icon = 'inbox') { const topics = ["inbox", "map-pin", "store", "heart", "history", "file-text", "file-search", "search", "receipt", "users", "pill", "clipboard-list", "bell", "heart-pulse", "shield-check", "calendar", "shopping-bag", "circle-check", "moon", "ban"]; const topic = topics.includes(icon) ? icon : 'inbox'; return `<img class="empty-illustration" src="/assets/empty/${topic}.svg" width="120" height="96" alt="" aria-hidden="true">`; },
  empty(o) { return `<div class="empty" ${attrs({ 'data-in': o.din ?? 1 })}><div class="em-art">${o.art || ui.emptyArt(o.icon)}</div><h3>${esc(o.title)}</h3>${o.body ? `<p>${o.body}</p>` : ''}${o.btn ? ui.btn(o.btn.label, { auto: true, ...o.btn }) : ''}</div>`; },
  av(name, o = {}) {
    const t = o.ini || [...String(name).replace(/^(ภญ\.|ภก\.|คุณ)/, '')].slice(0, 1).join('');
    const pharm = Object.values(TP.PHARM || {}).find(p => (name && (p.name === name || p.short === name)) || (o.ini && p.ini === o.ini));
    const member = name && TP.S?.family?.find(f => f.name === name);
    const img = o.img || (pharm ? TP.demoProfiles[pharm.id === 'tp' ? 'pharmacist_m' : 'pharmacist_f'] : member ? TP.profileImage(member.id) : name && name === TP.S?.user?.full ? TP.profileImage('me') : '');
    return `<span class="av${o.size ? ' ' + o.size : ''}${o.solid ? ' solid' : ''}${img ? ' ph' : ''}" aria-hidden="true">${img ? `<img src="${esc(img)}" alt="" loading="lazy" onerror="this.hidden=true;this.parentElement.classList.remove('ph');this.parentElement.append(document.createTextNode(this.dataset.fallback))" data-fallback="${esc(t)}">` : esc(t)}</span>`;
  },
  kv(rows, o = {}) { return `<dl class="kv${o.cls ? ' ' + o.cls : ''}">${rows.map(([k, v, c]) => `<dt class="${c || ''}">${esc(k)}</dt><dd class="${c || ''}">${v}</dd>`).join('')}</dl>`; },
  skel(w = '100%', h = 16, r = 8) { return `<span class="skel" style="width:${w};height:${h}px;border-radius:${r}px"></span>`; },
  /* status text that never relies on colour alone */
  status(tone, text) { return ui.tag(text, tone, { dot: true, live: tone === 'ok' }); }
};
})();
TP.act('callHelp', t => { let tel = ''; try { tel = JSON.parse(t.dataset.p || '{}').tel || ''; } catch { tel = ''; } TP.notify('กำลังโทร ' + tel, { icon: 'phone' }); });

/* ===== 30-brand.js ===== */
/* =====================================================================
   30 · Brand: logo, app icon, orb, light field (Design v1.2: soft light, no pattern, owner 19/10/2026)
   The v1.1 "+" versions below are kept only for ?motif=plus comparison; the light versions are at the end.
   ===================================================================== */
(() => {
const { esc } = TP;
let uid = 0;
const brand = TP.brand = {};

/* real CI lockups (paths injected from the design system at build time) */
brand.logo = (kind = 'primary', o = {}) => {
  const id = { primary: 'logo', alt: 'logo-alt', wmen: 'wmen', wmth: 'wmth' }[kind];
  return `<svg class="logo ${kind}${o.white ? ' w' : ''}${o.cls ? ' ' + o.cls : ''}" role="img" aria-label="${esc(o.label || (kind === 'wmen' ? 'MITRAREE' : 'MITRAREE มิตรอารี'))}" ${o.style ? `style="${o.style}"` : ''}><use href="#${id}"/></svg>`;
};
brand.plus = (s = 20, color = '#fff', w = 2.6) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="${color}" stroke-width="${w}" stroke-linecap="round" fill="none"/></svg>`;
brand.appicon = (cls = '') => `<span class="appicon ${cls}" aria-hidden="true">${brand.plus(24)}</span>`;

/* Halo Plus: the logo "+" inside two hairline rings, a tick ring and an orbiting light.
   o: {cls, still, draw, check, mini, plusW} */
brand.halo = (size = 120, o = {}) => {
  const pw = o.plusW || (o.mini ? 7 : 4.6);
  const centre = o.check ? '<path class="h-chk" d="M45 61l10 10 20-21" stroke-width="' + pw + '"/>' : `<path class="h-plus" d="M60 ${o.mini ? 40 : 45}v${o.mini ? 40 : 30}M${o.mini ? 40 : 45} 60h${o.mini ? 40 : 30}" stroke-width="${pw}"/>`;
  const rings = o.mini
    ? `<circle class="h-r1" cx="60" cy="60" r="54" vector-effect="non-scaling-stroke" style="opacity:.5"/>`
    : `<circle class="h-r1" cx="60" cy="60" r="56" vector-effect="non-scaling-stroke"/><g class="h-tkg"><circle class="h-tk" cx="60" cy="60" r="51" stroke-dasharray=".5 3.5" vector-effect="non-scaling-stroke"/></g><circle class="h-r2" cx="60" cy="60" r="40" vector-effect="non-scaling-stroke"/>`;
  return `<svg class="halo${o.cls ? ' ' + o.cls : ''}${o.still ? ' still' : ''}${o.draw ? ' draw' : ''}" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true" focusable="false" ${o.style ? `style="${o.style}"` : ''}>
    ${rings}<g class="h-orbg"><circle class="h-orb tail" cx="60" cy="60" r="${o.mini ? 54 : 56}" stroke-dasharray="74 400" stroke-dashoffset="-30" vector-effect="non-scaling-stroke"/><circle class="h-orb" cx="60" cy="60" r="${o.mini ? 54 : 56}" stroke-dasharray="24 400" stroke-dashoffset="-80" vector-effect="non-scaling-stroke"/></g>${centre}</svg>`;
};

/* Guilloche: overlapping wavy circles (rosette) or woven sine bands.
   kind 'rosette': {w,h,cx,cy,r0,r1,n,k,a}   kind 'band': {w,h,y0,y1,n,lambda,a} */
brand.guilloche = (o = {}) => {
  const w = o.w || 360, h = o.h || 200, paths = [];
  if ((o.kind || 'rosette') === 'rosette') {
    const cx = o.cx ?? w * .82, cy = o.cy ?? h * .3, n = o.n || 16, k = o.k || 14, a = o.a || 9, r0 = o.r0 || 40, r1 = o.r1 || 150;
    for (let i = 0; i < n; i++) {
      const R = r0 + (r1 - r0) * i / (n - 1), ph = i * .42, pts = [];
      for (let s = 0; s <= 360; s++) { const t = s / 360 * Math.PI * 2, r = R + a * Math.sin(k * t + ph) * (0.6 + 0.4 * Math.cos(3 * t)); pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
      paths.push(pts);
    }
  } else {
    const n = o.n || 10, lam = o.lambda || 46, a = o.a || 7, y0 = o.y0 ?? h - 34, y1 = o.y1 ?? h - 8;
    for (let i = 0; i < n; i++) {
      const yc = y0 + (y1 - y0) * i / Math.max(1, n - 1), ph = i * .55, pts = [];
      for (let x = -10; x <= w + 10; x += 3) pts.push([x, yc + a * Math.sin(x / lam * Math.PI * 2 + ph) * Math.sin(x / (lam * 3.1) + i * .3)]);
      paths.push(pts);
    }
  }
  const d = paths.map(p => {
    let len = 0; for (let i = 1; i < p.length; i++) len += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    return `<path d="M${p.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L')}" style="--len:${Math.ceil(len)}"/>`;
  }).join('');
  return `<svg class="gl${o.draw ? ' draw' : ''}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" style="inset:0;width:100%;height:100%;${o.style || ''}" aria-hidden="true" focusable="false">${d}</svg>`;
};

/* Pattern trial (owner 19/10/2026 "ไม่ชอบ design ที่เป็นตัว +"): three replacements, picked with ?motif=
   curve = crescents: a circle minus a slightly smaller offset circle, thick to hair-thin like the curved arms of the
           logo's E; the thin side turns slowly so the light seems to breathe
   glow  = soft moving light in teal shades, no marks at all
   type  = a giant crop of the real wordmark (the RA ligature), bleeding off the edge */
brand.crescents = o => {
  const id = 'hx' + (++uid), { w, h, cx, cy, items, color = '#fff' } = o;
  const masks = items.map(([R, d, , a = 45], i) => {
    const r = a * Math.PI / 180, ix = cx + d * Math.cos(r), iy = cy + d * Math.sin(r);
    return `<mask id="${id}m${i}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#000"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff"/><g class="hx-orb" style="transform-origin:${cx}px ${cy}px;animation-delay:${i * -5}s"><circle cx="${ix.toFixed(1)}" cy="${iy.toFixed(1)}" r="${R - d}" fill="#000"/></g></mask>`;
  }).join('');
  return `<svg class="${o.cls || ''}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="${o.par || 'xMidYMid slice'}" aria-hidden="true" focusable="false"><defs>${masks}</defs>${items.map(([, , op], i) => `<rect width="${w}" height="${h}" fill="${color}" opacity="${op}" mask="url(#${id}m${i})"/>`).join('')}${o.ring ? `<circle cx="${cx}" cy="${cy}" r="${o.ring}" fill="none" stroke="${color}" stroke-width=".6" opacity="${o.ringO || .16}" vector-effect="non-scaling-stroke"/>` : ''}</svg>`;
};
const RA = cls => `<svg class="${cls}" viewBox="930 962 500 316" aria-hidden="true" focusable="false"><use href="#wmen" x="207" y="976" width="1836" height="289"/></svg>`;
brand.heroArt = kind => kind === 'curve' ? brand.crescents({ w: 360, h: 236, cx: 360, cy: 236, items: [[150, 18, .2], [222, 13, .13], [296, 9, .08]], ring: 352, par: 'xMaxYMax slice', cls: 'hero-bg hx-curve' })
  : kind === 'glow' ? '<span class="hero-bg hx-glow" aria-hidden="true"><i></i><i></i><i></i></span>'
  : kind === 'type' ? RA('hero-bg hx-type') : '';
brand.splashArt = kind => kind === 'curve' ? brand.crescents({ w: 400, h: 800, cx: 200, cy: 400, items: [[128, 20, .13, 40], [178, 15, .085, 210], [236, 11, .055, 120]], ring: 300, ringO: .12, color: '#035C67', cls: 'sp-art sp-curve' })
  : kind === 'glow' ? '<span class="sp-art sp-glow" aria-hidden="true"><i></i><i></i><i></i></span>'
  : kind === 'type' ? RA('sp-art sp-type') : '';

/* Plus Field on canvas: a grid of fine "+" marks; waves of light travel through it.
   brand.field(canvas, {color, gap, arm, lw, base, amp, origin:[fx,fy], every, speed, intro, sigma})
   returns {stop(), pulse(strength)} ; static frame when reduced motion */
brand.field = (cv, o = {}) => {
  const ctx = cv.getContext('2d');
  const col = o.color || '#035C67', gap = o.gap || 22, arm = o.arm || 3.4, lw = o.lw || 1.25;
  const base = o.base ?? .12, amp = o.amp ?? .55, speed = o.speed || .32, sigma = o.sigma || 34;
  let W = 0, H = 0, marks = [], raf = 0, alive = true, waves = [], t0 = performance.now(), lastEmit = -1e9;
  const ox = () => W * (o.origin?.[0] ?? .5), oy = () => H * (o.origin?.[1] ?? .5);
  function size() {
    const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.clientWidth || r.width; H = cv.clientHeight || r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    marks = [];
    const cols = Math.ceil(W / gap) + 1, rows = Math.ceil(H / gap) + 1, offx = (W - (cols - 1) * gap) / 2, offy = (H - (rows - 1) * gap) / 2;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const x = offx + i * gap, y = offy + j * gap; marks.push({ x, y, d: Math.hypot(x - ox(), y - oy()) }); }
  }
  function drawMark(x, y, s) { ctx.moveTo(x - arm * s, y); ctx.lineTo(x + arm * s, y); ctx.moveTo(x, y - arm * s); ctx.lineTo(x, y + arm * s); }
  function frame(now) {
    if (!alive || !TP.previewActivity.active()) return;
    const t = now - t0;
    if (o.every && now - lastEmit > o.every) { waves.push({ t: now, s: 1 }); lastEmit = now; }
    waves = waves.filter(w => (now - w.t) * speed < Math.hypot(W, H) + sigma * 3);
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
    const introR = o.intro ? t * speed * 1.1 : Infinity;
    ctx.globalAlpha = base; ctx.beginPath();
    const hot = [];
    for (const m of marks) {
      if (m.d > introR) continue;
      let I = 0;
      for (const w of waves) { const r = (now - w.t) * speed, dd = m.d - r; if (dd > -sigma * 3 && dd < sigma * 3) I += w.s * Math.exp(-(dd * dd) / (2 * sigma * sigma)) * Math.max(0, 1 - r / (Math.hypot(W, H) * .9)); }
      if (o.intro && m.d > introR - sigma * 2) I = Math.max(I, 1 - (introR - m.d) / (sigma * 2));
      if (I > .03) hot.push([m, Math.min(1, I)]); else drawMark(m.x, m.y, 1);
    }
    ctx.stroke();
    for (const [m, I] of hot) { ctx.globalAlpha = base + amp * I; ctx.beginPath(); drawMark(m.x, m.y, 1 + .7 * I); ctx.stroke(); }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }
  size();
  const ro = new ResizeObserver(() => { size(); if (TP.RED()) still(); });
  ro.observe(cv);
  function still() { ctx.clearRect(0, 0, W, H); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.globalAlpha = base; ctx.beginPath(); marks.forEach(m => drawMark(m.x, m.y, 1)); ctx.stroke(); ctx.globalAlpha = 1; }
  const unsubscribe = TP.previewActivity.subscribe(active => {
    cancelAnimationFrame(raf);
    if (active && alive && !TP.RED()) raf = requestAnimationFrame(frame);
  });
  if (TP.RED()) still(); else if (TP.previewActivity.active()) raf = requestAnimationFrame(frame);
  return {
    stop() { alive = false; unsubscribe(); cancelAnimationFrame(raf); ro.disconnect(); },
    pulse(s = 1) { waves.push({ t: performance.now(), s }); },
    retarget(fx, fy) { o.origin = [fx, fy]; size(); }
  };
};

/* ---------- Design v1.2 (owner 19/10/2026 picked option B "แสงนุ่ม ไม่มีลาย"): no "+" marks and no line patterns
   anywhere; only soft teal light. Every screen keeps calling halo / field / guilloche / appicon / plus, and gets the
   light version here. ?motif=plus brings the old v1.1 look back for comparison only. ---------- */
const v11 = { halo: brand.halo, field: brand.field, guilloche: brand.guilloche, appicon: brand.appicon, plus: brand.plus };
const old = () => TP.MOTIF === 'plus';
/* Orb: a soft light disc, one hairline ring, a slow arc of light while waiting, a tick when o.check */
brand.halo = (size = 120, o = {}) => {
  if (old()) return v11.halo(size, o);
  const id = 'ob' + (++uid), r = o.mini ? 52 : 42;
  const chk = o.check ? `<path class="h-chk" d="M45 61l10 10 20-21" stroke-width="${o.plusW || (o.mini ? 7 : 4.6)}"/>` : '';
  /* an empty orb reads as "still loading", so plain orbs carry a small icon that says what the screen is about */
  const is = size < 80 ? 46 : 34, ico = !o.check && o.icon ? `<svg class="o-ic" x="${60 - is / 2}" y="${60 - is / 2}" width="${is}" height="${is}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${TP.PATH[o.icon] || ''}</svg>` : '';
  return `<svg class="halo orb${o.cls ? ' ' + o.cls : ''}${o.still ? ' still' : ''}${o.draw ? ' draw' : ''}" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true" focusable="false" ${o.style ? `style="${o.style}"` : ''}>
    <defs><radialGradient id="${id}g"><stop offset="0" stop-color="currentColor" stop-opacity=".22"/><stop offset=".55" stop-color="currentColor" stop-opacity=".09"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient><filter id="${id}b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>
    <circle class="o-bg" cx="60" cy="60" r="59" fill="url(#${id}g)"/><circle class="h-r2" cx="60" cy="60" r="${r}" vector-effect="non-scaling-stroke"/>
    <g class="h-orbg"><circle class="o-arc" cx="60" cy="60" r="${o.mini ? 52 : 50}" stroke-dasharray="40 400" filter="url(#${id}b)"/></g>${chk}${ico}</svg>`;
};
/* Light field on canvas: three soft blobs drift slowly; pulse() sends one soft ring of light from the origin */
brand.field = (cv, o = {}) => {
  if (old()) return v11.field(cv, o);
  const ctx = cv.getContext('2d'), hex = (o.color || '#035C67').replace('#', '');
  const rgb = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)).join(',');
  const a0 = Math.min(.32, Math.max(.1, (o.base ?? .1) * 2.4)), amp = o.amp ?? .5, speed = (o.speed || .32) * .9;
  const blobs = [[.22, .28, .62, 0], [.82, .3, .55, 2.1], [.58, .82, .66, 4.2]];
  let W = 0, H = 0, raf = 0, alive = true, waves = [], t0 = performance.now(), lastEmit = -1e9;
  const ox = () => W * (o.origin?.[0] ?? .5), oy = () => H * (o.origin?.[1] ?? .5);
  function size() { const dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function paint(now) {
    const t = (now - t0) / 1000, R = Math.max(W, H);
    ctx.clearRect(0, 0, W, H);
    for (const [fx, fy, rf, ph] of blobs) {
      const x = W * (fx + .09 * Math.sin(t * .2 + ph)), y = H * (fy + .06 * Math.cos(t * .16 + ph)), r = R * rf;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a0})`); g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    if (o.every && now - lastEmit > o.every) { waves.push({ t: now, s: 1 }); lastEmit = now; }
    const far = Math.hypot(W, H);
    waves = waves.filter(w => (now - w.t) * speed < far);
    for (const w of waves) {
      const r = (now - w.t) * speed + 1, fade = Math.max(0, 1 - r / far) * w.s, band = 46;
      const g = ctx.createRadialGradient(ox(), oy(), Math.max(0, r - band), ox(), oy(), r + band);
      g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(.5, `rgba(${rgb},${(amp * .32 * fade).toFixed(3)})`); g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
  }
  function frame(now) { if (!alive || !TP.previewActivity.active()) return; paint(now); raf = requestAnimationFrame(frame); }
  size();
  const ro = new ResizeObserver(() => { size(); if (TP.RED()) paint(t0); }); ro.observe(cv);
  const unsubscribe = TP.previewActivity.subscribe(active => {
    cancelAnimationFrame(raf);
    if (active && alive && !TP.RED()) raf = requestAnimationFrame(frame);
  });
  if (TP.RED()) paint(t0); else if (TP.previewActivity.active()) raf = requestAnimationFrame(frame);
  return { stop() { alive = false; unsubscribe(); cancelAnimationFrame(raf); ro.disconnect(); }, pulse(s = 1) { waves.push({ t: performance.now(), s }); }, retarget(fx, fy) { o.origin = [fx, fy]; } };
};
/* line patterns become one soft light where the rosette used to sit; the thin band becomes a hairline fade */
brand.guilloche = (o = {}) => {
  if (old()) return v11.guilloche(o);
  if (o.kind === 'band') return '<span class="gl gl-band" aria-hidden="true"></span>';
  const w = o.w || 360, h = o.h || 200, gx = Math.round((o.cx ?? w * .82) / w * 100), gy = Math.round((o.cy ?? h * .3) / h * 100);
  return `<span class="gl gl-glow" aria-hidden="true" style="--gx:${gx}%;--gy:${gy}%;${o.style || ''}"></span>`;
};
/* app + notification icon: the M of the real wordmark (no "+") on a lit teal tile */
const mono = (s, color) => `<svg class="ai-m" width="${s}" height="${s}" viewBox="196 962 340 316" aria-hidden="true" style="color:${color}"><use href="#wmen" x="207" y="976" width="1836" height="289"/></svg>`;
brand.plus = (s = 20, color = '#fff', w = 2.6) => old() ? v11.plus(s, color, w) : mono(s, color);
brand.appicon = (cls = '') => old() ? v11.appicon(cls) : `<span class="appicon ${cls}" aria-hidden="true">${mono(24, '#fff')}</span>`;
})();

window.installMitrareeCustomerPreview(TP);

/* ===== 50-start.js ===== */
/* =====================================================================
   50 · Start: login, channel-specific in-page OTP, profile,
        update, sysoff. Styles: css/50-start.css (classes st-*).
   ===================================================================== */
(() => {
const { $, $$, esc, ic, ui, brand, A, E, SP, kill } = TP;

/* icons this file needs that core does not ship (lucide) */
const MORE = {
  fingerprint: '<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>',
  delete: '<path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><path d="m12 9 6 6"/><path d="m18 9-6 6"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'
};
Object.keys(MORE).forEach(k => { if (!TP.PATH[k]) TP.PATH[k] = MORE[k]; });

/* panel order: splash (registered later in 60-before) first in the start group */
queueMicrotask(() => { const o = TP.ORDER, s = o.indexOf('splash'), f = o.indexOf('onboard'); if (s > f && f > -1) { o.splice(s, 1); o.splice(f, 0, 'splash'); } });

const digits = s => String(s ?? '').replace(/\D/g, '');
const fmtPhone = d => d.length > 6 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : d.length > 3 ? `${d.slice(0, 3)} ${d.slice(3)}` : d;
const maskPhone = d => d.length === 10 ? `${d.slice(0, 3)}-XXX-${d.slice(6)}` : fmtPhone(d);
const kScale = () => TP.phone.getBoundingClientRect().width / TP.phone.offsetWidth || 1;
const shake = el => el && A(el, [{ transform: 'none' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(3px)' }, { transform: 'none' }], { d: 440, e: E.apple });
const sleep = (ctx, ms) => new Promise(r => ctx.later(r, TP.RED() ? Math.min(ms, 120) : ms));
const redraw = svg => { if (!svg) return; svg.classList.remove('draw'); svg.getBoundingClientRect(); svg.classList.add('draw'); };
const rise = (n, delay = 0, y = 14) => A(n, [{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: 'none' }], { d: SP.soft.d, e: SP.soft.e, delay, fill: 'backwards' });
const callIc = `<span class="st-call" aria-hidden="true">${ic('phone', 18, 2)}</span>`;
const callRows = () => [...TP.BRANCHES.map(b => ui.row({ icon: 'store', title: b.name, sub: `เปิด ${b.hours} · ${b.phone}`, a: 'stCall', p: { id: b.id }, chev: false, html: callIc })),
  ...(TP.STORE ? [ui.row({ icon: 'headset', title: 'ฝ่ายบริการลูกค้า', sub: `${TP.support[1]} · ${TP.STORE.csHours}`, go: 'help' })] : [])];
TP.callRows = callRows;
const policyDocs = {
  terms: ['ข้อตกลงและเงื่อนไขการใช้บริการ MITRAREE Online', 'service-terms'],
  privacy: ['นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)', 'privacy-policy'],
  notice: ['คำประกาศความเป็นส่วนตัวสำหรับลูกค้า/ผู้ใช้บริการ', 'customer-privacy-notice'],
  shipping: ['นโยบายการจัดส่ง คืนสินค้า และคืนเงิน', 'shipping-returns'],
  healthConsent: ['ความยินยอมข้อมูลสุขภาพ', 'health-data-consent'],
};
const support = ['https://line.me/ti/p/~@mitraree', 'LINE @mitraree'];
TP.support = support;
/* C111: one page, four collapsible policy documents (legacy web footer order). C116 list retired 23 Nov 2026. */
const POLICY_SECTIONS = ['terms', 'privacy', 'notice', 'shipping'];
const POLICY_SUMMARY = {
  terms: 'สิทธิและหน้าที่ในการใช้บริการ MITRAREE Online',
  privacy: 'วิธีเก็บ ใช้ เปิดเผย และคุ้มครองข้อมูลส่วนบุคคล',
  notice: 'ข้อมูลที่เก็บจากลูกค้าและสิทธิของเจ้าของข้อมูล',
  shipping: 'การจัดส่งสินค้า การคืนสินค้า และการคืนเงิน',
};
/* Section opened on entry: the document the user tapped, else the preview case; null = all collapsed. */
const policyOpenKey = ctx => {
  if (ctx.params.all) return null;
  if (POLICY_SECTIONS.includes(ctx.params.key)) return ctx.params.key;
  if (ctx.state === 'load-error') return 'terms';
  return POLICY_SECTIONS.includes(ctx.state) ? ctx.state : null;
};
TP.policyLinks = () => ui.row({ icon: 'file-text', title: 'ข้อตกลงและนโยบาย', sub: 'ข้อตกลง · PDPA · คำประกาศความเป็นส่วนตัว · การจัดส่งและคืนเงิน', a: 'stDoc', p: { key: 'all' } });
TP.act('stDoc', (t, ctx, event) => {
  event?.preventDefault();
  const params = JSON.parse(t.dataset.p || '{}');
  const key = params.key || t.dataset.v;
  if (key === 'all') { TP.S.st.doc = 'collapsed'; return TP.sheet('doc', { all: true }); }
  const docKey = Object.hasOwn(policyDocs, key) ? key : /ส่วนตัว/.test(key) ? 'privacy' : 'terms';
  /* Keep the preview case in step with the section actually opened (C111.1-.5). */
  TP.S.st.doc = docKey;
  return TP.sheet('doc', { key: docKey });
});
TP.policyDocumentBody = () => '<article class="policy-text" aria-busy="true"></article>';
TP.mountPolicyDocuments = (el, ctx, keys, simulateError = false, options = {}) => {
  const body = $('.policy-text', el);
  const controller = new AbortController();
  ctx.onLeave(() => controller.abort());
  const lines = value => value.split('\n').filter(line => line.trim()).map(line => {
    if (line.startsWith('# ')) return `<h3>${esc(line.slice(2))}</h3>`;
    if (line.startsWith('## ')) return `<h4>${esc(line.slice(3))}</h4>`;
    if (/^[-·] /.test(line)) return `<p class="policy-list-item">• ${esc(line.slice(2))}</p>`;
    return `<p>${esc(line)}</p>`;
  }).join('');
  async function read(key) {
    const [title, file] = policyDocs[key];
    const response = await fetch(`/assets/policies/${file}.txt`, {
      signal: controller.signal, cache: 'no-cache',
    });
    if (!response.ok) throw new Error('Document unavailable');
    return { title, text: await response.text() };
  }
  async function load() {
    body.setAttribute('aria-busy', 'true');
    body.textContent = 'กำลังโหลดเอกสาร';
    try {
      if (simulateError) { simulateError = false; throw new Error('Preview'); }
      const documents = await Promise.all(keys.map(read));
      if (controller.signal.aborted) return;
      body.innerHTML = documents.map(doc => `<section>
        ${documents.length > 1 ? `<h3 class="policy-document-title">${esc(doc.title)}</h3>` : ''}
        ${lines(doc.text)}
      </section>`).join('') +
        (options.support === false ? '' : `<a class="btn secondary" href="${support[0]}" target="_blank" rel="noopener noreferrer">ติดต่อผ่าน ${support[1]}</a>`);
    } catch {
      if (controller.signal.aborted) return;
      body.innerHTML = '<p role="alert">เปิดเอกสารไม่สำเร็จ กรุณาลองอีกครั้ง</p><button type="button" class="btn secondary">ลองอีกครั้ง</button>';
      $('button', body).addEventListener('click', load, { once: true });
    } finally {
      if (!controller.signal.aborted) body.setAttribute('aria-busy', 'false');
    }
  }
  return load();
};
TP.sheetDef('doc', {
  group: 'start', title: 'ข้อตกลงและนโยบาย',
  code: 'C111', ref: 'H07', host: 'login', tall: true, cls: 'policy-document',
  states: [['terms', 'เปิดหัวข้อข้อตกลงและเงื่อนไขการใช้บริการ', true, 1], ['privacy', 'เปิดหัวข้อนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)', true, 2], ['notice', 'เปิดหัวข้อคำประกาศความเป็นส่วนตัว', true, 3], ['load-error', 'เปิดเอกสารไม่สำเร็จ', true, 4], ['shipping', 'เปิดหัวข้อนโยบายการจัดส่ง คืนสินค้า และคืนเงิน', true, 5], ['collapsed', 'พับทุกหัวข้อ (เปิดจากเมนู)', true, 6]],
  notes: ['หน้าเดียวรวมเอกสาร 4 ฉบับแบบพับเปิดได้ ตามลำดับ footer เว็บเดิม: ข้อตกลง · PDPA · คำประกาศ · จัดส่ง/คืนสินค้า/คืนเงิน', 'เปิดหัวข้อตามลิงก์ที่กด (C105 อ่านข้อตกลงและนโยบาย → C111.1 หัวข้อแรก ตามที่ผู้ใช้สั่ง; C509/ฟอร์มใบกำกับ → คำประกาศ) เปิดจากเมนูทั่วไป (C102 C105 C501) พับทุกหัวข้อ เปิดได้หลายหัวข้อพร้อมกัน', 'โหลดเนื้อหาเมื่อเปิดหัวข้อครั้งแรก โหลดไม่สำเร็จแสดงข้อผิดพลาดและลองอีกครั้งในหัวข้อนั้น อ่านอย่างเดียว แยกจากความยินยอมสุขภาพ C107'],
  render: ctx => {
    const open = policyOpenKey(ctx);
    return `<div class="policy-accordion">${POLICY_SECTIONS.map(key => {
      const expanded = key === open;
      return `<section class="policy-acc" data-policy="${key}"><h3 class="policy-acc-h"><button type="button" class="policy-acc-head" id="policy-head-${key}" aria-expanded="${expanded}" aria-controls="policy-panel-${key}"><span class="policy-acc-copy"><strong>${esc(policyDocs[key][0])}</strong><small>${esc(POLICY_SUMMARY[key])}</small></span><span class="policy-acc-chevron" aria-hidden="true">${TP.ic('chevron-down', 20, 2)}</span></button></h3><div class="policy-acc-panel" id="policy-panel-${key}" role="region" aria-labelledby="policy-head-${key}"${expanded ? '' : ' hidden'}>${TP.policyDocumentBody()}</div></section>`;
    }).join('')}</div><a class="btn secondary policy-support" href="${support[0]}" target="_blank" rel="noopener noreferrer">ติดต่อผ่าน ${support[1]}</a>`;
  },
  mount(el, ctx) {
    let simulateError = ctx.state === 'load-error' && !ctx.params.key && !ctx.params.all;
    const loaded = new Set();
    const load = section => {
      const key = section.dataset.policy;
      if (loaded.has(key)) return;
      loaded.add(key);
      TP.mountPolicyDocuments(section, ctx, [key], simulateError, { support: false });
      simulateError = false;
    };
    $$('.policy-acc', el).forEach(section => {
      const head = $('.policy-acc-head', section), panel = $('.policy-acc-panel', section);
      if (head.getAttribute('aria-expanded') === 'true') load(section);
      head.addEventListener('click', () => {
        const open = head.getAttribute('aria-expanded') !== 'true';
        head.setAttribute('aria-expanded', String(open));
        panel.hidden = !open;
        if (open) load(section);
        else if (head.getBoundingClientRect?.().top < 0) head.scrollIntoView?.({ block: 'start' });
      });
    });
  },
  afterClose: ctx => ctx.params.onReturn?.(),
  foot: () => ui.btn('ปิด', { kind: 'secondary', closeSheet: true })
});
TP.act('stCall', t => { let p = {}; try { p = JSON.parse(t.dataset.p || '{}'); } catch { p = {}; } TP.notify('กำลังโทร ' + (p.tel || TP.branch(p.id).phone), { icon: 'phone' }); });
/* first run only: a phone number with no account yet fills "ข้อมูลของคุณ".
   S.newAccount undefined = follow firstTime (the natural first-run demo shows the form) */
const isNewNumber = S => S.newAccount ?? S.firstTime;
/* a brand-new number must never inherit the mock account (family, allergies, meds, history) */
const freshAccount = S => {
  Object.assign(S, { family: [], history: [], inbox: [], case: null, addrs: [], _clog: [] });
  Object.assign(S, { taxWho: null, taxCo: null, taxProfiles: {}, _taxProfile: null, _taxProfileMockInitialized: true });
  Object.assign(S.user, { allergies: [], allergyState: 'unknown', allergySrc: '', meds: [], weight: '', conditions: [], condNone: false });
};

const blankUser = (S, phone) => {
  Object.assign(S.user, { name: '', last: '', full: '', born: '', birthYear: '', age: '', sex: 'none' });
  if (phone?.length === 10) S.user.phone = `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
};
TP.blankUser = blankUser;
TP.freshAccount = freshAccount;

/* =====================================================================
   Onboard (ใหม่): 3 pages, pager, swipe, arrow keys
   ===================================================================== */
/* Thai has no spaces between words: keep key phrases on one line (static HTML, not user input) */
const nw = s => `<span class="st-nw">${s}</span>`;
const OB = [
  { t: 'อุ่นใจ คุยกับเภสัชกรตัวจริง', b: 'ปรึกษาเภสัชกรประจำร้านมิตรอารี พร้อมดูชื่อและเลขใบอนุญาตก่อนเริ่มคุย', l: 'เภสัชกรตัวจริง ตรวจสอบได้', image: 'pharmacist', alt: 'ภาพแนวถ่ายจริงของเภสัชกรในร้านยา', badge: 'เภสัชกรที่คุณตรวจสอบได้', icon: 'badge-check' },
  { t: 'เลือกร้านที่พร้อมดูแลคุณ', b: 'ดูเวลาและสถานะของแต่ละสาขา แล้วเริ่มปรึกษากับร้านที่เปิดรับบริการ', l: 'เลือกสาขาที่เปิดรับบริการ', image: 'pharmacy', alt: 'ภาพแนวถ่ายจริงของหน้าร้านยา', badge: 'เช็กความพร้อมก่อนเริ่มคุย', icon: 'store' },
  { t: 'เล่าอาการ รับคำแนะนำที่เข้าใจ', b: 'แจ้งอาการ เข้าคิว แล้วคุยผ่านแชทหรือวิดีโอคอล เภสัชกรจะแนะนำการดูแลและการใช้ยาที่เหมาะสม', l: 'ขั้นตอนและข้อจำกัดของการปรึกษา', image: 'consultation', alt: 'ภาพแนวถ่ายจริงของเภสัชกรอธิบายการใช้ยาให้ผู้รับคำปรึกษา', badge: 'คำแนะนำก่อนเริ่มใช้ยา', icon: 'message-circle' }
];
function onboardingCollage(page, index) {
  const photo = (name, alt = '') => `<img src="/assets/onboarding/${name}-photo-v3.webp" alt="${alt}" width="800" height="600" draggable="false">`;
  const captions = [
    ['รู้จักเภสัชกรของคุณ', 'ชื่อและใบอนุญาต ก่อนเริ่มคุย'],
    ['ร้านยาที่พร้อมดูแล', 'เลือกสาขา แล้วดูความพร้อม'],
    ['คำแนะนำสำหรับคุณ', 'คุยให้เข้าใจ ก่อนเริ่มใช้ยา']
  ];
  return `<div class="st-ob-collage st-ob-collage-${index + 1}" role="img" aria-label="${page.alt}">
    <div class="st-ob-glow" aria-hidden="true"></div>
    <div class="st-ob-photo st-ob-photo-back" aria-hidden="true">${photo(index === 1 ? 'consultation' : 'pharmacy')}</div>
    <div class="st-ob-photo st-ob-photo-side" aria-hidden="true">${photo(index === 2 ? 'pharmacist' : 'consultation')}</div>
    <div class="st-ob-photo st-ob-photo-main" aria-hidden="true">
      <div class="st-ob-photo-label">${ic(page.icon, 14, 2)} MITRAREE</div>
      ${photo(page.image)}
      <div class="st-ob-photo-caption"><strong>${captions[index][0]}</strong><span>${captions[index][1]}</span></div>
    </div>
    <div class="st-ob-float" aria-hidden="true">${ic(page.icon, 18, 2)}<span>${page.badge}</span></div>
    <span class="st-ob-spark" aria-hidden="true">✦</span>
  </div>`;
}
TP.screen('onboard', {
  group: 'start', title: 'แนะนำแอป', code: 'C112', cls: 'st-ob',
  states: [['p1', 'หน้า 1 เภสัชกรตัวจริง'], ['p2', 'หน้า 2 เวลาให้บริการ'], ['p3', 'หน้า 3 ขั้นตอนและความเสี่ยง']],
  notes: [
    'แนะนำแอป 3 หน้า ใช้การ์ดภาพซ้อนบนพื้นขาวแบบคอลลาจสีมิตรอารี: เภสัชกรที่ตรวจสอบได้ → เลือกสาขาที่พร้อมให้บริการ → ขั้นตอนและข้อจำกัดของการปรึกษา',
    'มาจากปุ่มเริ่มใช้งานบน C108 หลังสมัครสำเร็จ ปัดซ้ายขวา แตะจุด หรือกดลูกศรบนคีย์บอร์ดได้ ข้ามและเริ่มใช้งานไปหน้าหลัก C201 ถ้าเปิดเคสนี้โดยยังไม่เข้าสู่ระบบจะไป C102',
    'เวลาและสถานะบริการต้องอิงแต่ละสาขา ไม่มีการฝากคำถามนอกรอบบริการ',
    'ภาพประกอบเป็นภาพจำลอง ไม่ใช่ตัวตนเภสัชกรหรือการรับรองใบอนุญาตจริง ต้องตรวจข้อมูลผู้ให้คำปรึกษาจากระบบก่อนเริ่มคุย',
    'ใช้ภาพสื่อสารข้อความหลักควบคู่หัวข้อและคำอธิบายตามแนวทาง CDC Visual Communication ไม่ใส่ข้อความสำคัญไว้เฉพาะในภาพ'
  ],
  wait: ['ให้เภสัชกรผู้รับผิดชอบทบทวนข้อความข้อจำกัดก่อนนำไปใช้จริง'],
  prep(S) { Object.assign(S, { firstTime: true, loggedIn: false, consent: false, notifAsked: false, newAccount: undefined }); TP.emit('state'); },
  render(ctx) {
    return `
      <header class="st-ob-top" data-in="0">${brand.logo('wmen', { cls: 'sm' })}<button type="button" class="txtbtn st-skip">ข้าม</button></header>
      <div class="st-ob-vp" role="region" aria-roledescription="carousel" aria-label="แนะนำแอป">
        <div class="st-ob-track">${OB.map((p, n) => `<article class="st-ob-pg" role="group" aria-roledescription="slide" aria-label="${n + 1} จาก 3">
          ${onboardingCollage(p, n)}
          <div class="st-ob-tx"><h2>${p.t}</h2><p>${p.b}</p>${n === 2 ? '<p class="st-ob-caution">การปรึกษาไม่แทนการตรวจวินิจฉัยของแพทย์<br>หากมีอาการฉุกเฉิน ให้ไปโรงพยาบาลทันที</p>' : ''}</div>
        </article>`).join('')}</div>
      </div>
      <footer class="st-ob-foot" data-in="1"><div class="st-dots">${OB.map((p, n) => `<button type="button" class="st-dot" data-i="${n}" aria-label="หน้า ${n + 1} จาก 3"><i></i></button>`).join('')}</div>
        <button type="button" class="btn primary st-ob-next"></button></footer>`;
  },
  mount(el, ctx) {
    const vp = $('.st-ob-vp', el), track = $('.st-ob-track', el), pages = $$('.st-ob-pg', el), dots = $$('.st-dot', el);
    const next = $('.st-ob-next', el), skip = $('.st-skip', el), last = OB.length - 1;
    let i = { p2: 1, p3: 2 }[ctx.state] || 0, x = 0, drag = null, dragged = false;
    const W = () => vp.offsetWidth;
    const place = v => { x = v; track.style.transform = `translate3d(${v}px,0,0)`; };
    const finish = () => TP.S.loggedIn ? TP.go('home', { via: 'zoom', root: true }) : TP.go('login', { via: 'push' });
    function ui8(changed) {
      dots.forEach((d, n) => d.setAttribute('aria-current', n === i ? 'step' : 'false'));
      pages.forEach((p, n) => { p.setAttribute('aria-hidden', String(n !== i)); p.inert = n !== i; });
      next.innerHTML = i === last ? '<span>เริ่มใช้งาน</span>' : `<span>ถัดไป</span>${ic('arrow-right', 20, 2)}`;
      if (changed) A(next.firstElementChild, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { d: 280, e: E.out });
      skip.classList.toggle('gone', i === last); skip.tabIndex = i === last ? -1 : 0; skip.setAttribute('aria-hidden', String(i === last));
    }
    function enter(n, base = 90) {
      const p = pages[n];
      $$('.st-ob-tx > h2, .st-ob-tx > p, .st-ob-list li', p).forEach((t, k) => rise(t, base + 80 + k * 60));
    }
    function goTo(n, { anim = true } = {}) {
      n = Math.max(0, Math.min(last, n));
      const to = -n * W(), from = x, changed = n !== i;
      kill(track); place(to);
      if (anim && from !== to) A(track, [{ transform: `translate3d(${from}px,0,0)` }, { transform: `translate3d(${to}px,0,0)` }], { d: SP.soft.d, e: SP.soft.e });
      i = n; ui8(changed);
      if (changed) { enter(n); TP.live(OB[n].l); }
    }
    place(-i * W()); ui8(false); enter(i, 300);
    next.addEventListener('click', () => (i < last ? goTo(i + 1) : finish()));
    skip.addEventListener('click', finish);
    dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.i)));
    /* swipe: horizontal drag with edge resistance; vertical drags scroll the page */
    vp.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button !== 0) return; drag = { x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, lock: '' }; });
    vp.addEventListener('pointermove', e => {
      if (!drag) return;
      const k = kScale(), dx = (e.clientX - drag.x) / k, dy = (e.clientY - drag.y) / k;
      if (!drag.lock) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        drag.lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (drag.lock === 'x') { try { vp.setPointerCapture(e.pointerId); } catch { /* pointer gone */ } kill(track); vp.classList.add('dragging'); }
      }
      if (drag.lock !== 'x') return;
      const d = (i === 0 && dx > 0) || (i === last && dx < 0) ? dx / 3 : dx;
      drag.dx = d; place(-i * W() + d);
    });
    const end = () => {
      if (!drag) return;
      const d = drag; drag = null; vp.classList.remove('dragging');
      if (d.lock !== 'x') return;
      dragged = true; setTimeout(() => { dragged = false; }, 60);
      const v = d.dx / Math.max(1, performance.now() - d.t);
      if (d.dx < -50 || v < -.35) goTo(i + 1); else if (d.dx > 50 || v > .35) goTo(i - 1); else goTo(i);
    };
    vp.addEventListener('pointerup', end); vp.addEventListener('pointercancel', end);
    vp.addEventListener('click', e => { if (dragged) { e.stopPropagation(); e.preventDefault(); } }, true);
    const onKey = e => {
      if (TP.cur()?.el !== el || TP.sheetOpen() || e.altKey || /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(i + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(i - 1); }
    };
    document.addEventListener('keydown', onKey);
    const ro = new ResizeObserver(() => { kill(track); place(-i * W()); });
    ro.observe(vp);
    ctx.onLeave(() => { document.removeEventListener('keydown', onKey); ro.disconnect(); });
  }
});

/* =====================================================================
   Login (C02): phone + OTP only (A3)
   ===================================================================== */
const PH_ERR = 'เบอร์มือถือต้องมี 10 หลัก ขึ้นต้นด้วย 0 เช่น 081 234 5678';
function loginErr(el, on) {
  const f = $('.st-ph', el); if (!f) return;
  f.classList.toggle('err', on);
  $('#phE', el).hidden = !on;
  const inp = $('#phIn', el); inp.setAttribute('aria-invalid', String(on)); inp.setAttribute('aria-describedby', 'phE');
}
TP.screen('login', {
  group:'start',title:'เข้าสู่ระบบ',code:'C102',ref:'C02',cls:'auth-cover-screen',sb:'light',
  states:[['normal','เลือกวิธีเข้าสู่ระบบ'], ['error','ข้อความผิดพลาดการเข้าสู่ระบบ'], ['signedout','หลุดจากระบบ 30 วัน'], ['filled','กรอกอีเมลและรหัสผ่านแล้ว', true, 13], ['service-error','บริการเข้าสู่ระบบไม่พร้อมใช้งาน', true, 14], ['google-denied','ถูกปฏิเสธการเข้าสู่ระบบด้วย Google', true, 15], ['phone','เข้าสู่ระบบด้วยเบอร์โทรศัพท์', true, 16], ['required','ข้อผิดพลาดเมื่อเว้นช่องบังคับ', true, 17]],
  notes:['ดำเนินการด้วย Google C114 หรือกรอกอีเมลหรือเบอร์โทรศัพท์และรหัสผ่านบน C102','ลงทะเบียนเปิดฟอร์มสมาชิก C105 โดยตรง','ใต้รหัสผ่านมีจำไว้ในระบบและลืมรหัสผ่าน C115','Google และการตรวจรหัสผ่านเป็นต้นแบบ ต้องเชื่อมบริการยืนยันตัวตนจริงก่อนใช้งาน'],
  prep(S){S.loggedIn=false;},
  render(ctx){return '<div class="auth-cover auth-login-cover"><img class="auth-cover-photo" src="/assets/auth/login-storefront-white-v4.webp" alt="" fetchpriority="high"><div class="auth-cover-content auth-login-panel"><h1>ยินดีต้อนรับ</h1>'+(ctx.state==='signedout'?ui.note('ออกจากระบบอัตโนมัติหลังไม่ได้เปิดแอป 30 วัน กรุณาเข้าสู่ระบบอีกครั้ง',{tone:'info',icon:'info'}):'')+(ctx.state==='google-denied'?'<div role="alert">'+ui.note('<b>เข้าสู่ระบบด้วย Google ไม่สำเร็จ</b><br>บัญชี Google ไม่ได้อนุญาตให้ MITRAREE เข้าถึง หรือการลงชื่อเข้าใช้ถูกยกเลิก ลองดำเนินการด้วย Google อีกครั้ง หรือเข้าสู่ระบบด้วยอีเมล',{tone:'danger',icon:'triangle-alert'})+'</div>':'')+authSignInForm(ctx)+'<div class="auth-login-divider"><span>หรือ</span></div><div class="auth-cover-actions"><button type="button" class="btn secondary auth-google" data-a="authGoogleOpen">'+authGoogleIcon()+'<span>ดำเนินการด้วย Google</span></button></div><div class="auth-login-register"><span>ยังไม่ได้เป็นสมาชิก?</span><button type="button" class="txtbtn" data-a="authRegisterOpen">ลงทะเบียน</button></div>'+authTerms()+'</div></div>';},
  mount:authMountPassword
});
function authGoogleIcon(){return `<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>`;}
TP.act('authRegisterOpen',()=>{authNewAccount(TP.S,'email','');TP.S.st.profile='empty';return TP.go('profile',{root:true});});
TP.act('authGoogleOpen',()=>TP.sheet('googlelogin'));
/* C114 mock of the Google account chooser. Prototype only: no Google password is collected; the real app uses
   Google Identity Services (Google's own chooser) and verifies the token on the server. Accounts below are fixtures. */
const GOOGLE_MOCK_ACCOUNTS = { normal: { name: 'สมใจ ใจดี', email: 'somjai@example.com', ini: 'ส', tone: '#1a73e8' }, 'new-account': { name: 'สมาชิกใหม่', email: 'new.member@gmail.com', ini: 'ส', tone: '#188038' } };
TP.sheetDef('googlelogin',{group:'start',title:'ลงชื่อเข้าใช้ด้วย Google',code:'C114',host:'login',states:[['normal','เลือกบัญชี Google: สมาชิกเดิมหรือสมาชิกใหม่']],notes:['เคสเดียว: แตะบัญชีสมาชิกเดิมเข้าหน้าแรก แตะบัญชีสมาชิกใหม่ไปสมัคร C105 กรณีถูกปฏิเสธหรือยกเลิกสิทธิ์ Google แสดงที่ C102.15','หน้าตาแบบหน้าเลือกบัญชีของ Google: โลโก้ G หัวข้อ เลือกบัญชี ชื่อแอปที่จะเข้าใช้ รายการบัญชี (รูปย่อ ชื่อ อีเมล) และ ใช้บัญชีอื่น พร้อมข้อความว่าจะแชร์ชื่อ อีเมล และรูปโปรไฟล์','ต้นแบบเท่านั้น ไม่มีการรับรหัสผ่าน Google บัญชีเป็นข้อมูลตัวอย่าง ระบบจริงใช้ Google Identity Services (หน้าเลือกบัญชีของ Google เอง) และตรวจสอบ token ฝั่งเซิร์ฟเวอร์'],render(ctx){
  const head=`<header class="g-head"><span class="g-logo">${authGoogleIcon()}</span><h3 class="g-title">เลือกบัญชี</h3><p class="g-sub">เพื่อดำเนินการต่อไปยัง <b>MITRAREE</b></p></header>`;
  return `<div class="g-chooser">${head}<ul class="g-accounts" role="list">${Object.entries(GOOGLE_MOCK_ACCOUNTS).map(([key,acc])=>`<li><button type="button" class="g-account" data-a="authGoogleDemo" data-v="${key}"><span class="g-avatar" style="background:${acc.tone}" aria-hidden="true">${esc(acc.ini)}</span><span class="g-id"><b>${esc(acc.name)}</b><span>${esc(acc.email)}</span></span></button></li>`).join('')}<li><button type="button" class="g-account g-other" data-a="authGoogleOther"><span class="g-avatar g-avatar-other" aria-hidden="true">${ic('user',20,2)}</span><span class="g-id"><b>ใช้บัญชีอื่น</b></span></button></li></ul><p class="g-legal">Google จะแชร์ชื่อ อีเมล และรูปโปรไฟล์ของคุณกับ MITRAREE เพื่อดำเนินการต่อ ก่อนใช้แอปนี้ คุณดูนโยบายความเป็นส่วนตัวและข้อกำหนดการให้บริการของ MITRAREE ได้</p><p class="g-proto">ตัวอย่างสำหรับต้นแบบ ไม่ได้เชื่อมต่อ Google จริง</p></div>`;
},foot(){return ui.btn('ยกเลิก',{kind:'secondary',closeSheet:true});}});
TP.act('authGoogleOther',()=>TP.notify('ต้นแบบ: ระบบจริงจะเปิดหน้าลงชื่อเข้าใช้ของ Google ให้เลือกหรือเพิ่มบัญชี',{icon:'info'}));
function authSessionDemo(){Object.assign(TP.S,{loggedIn:true,firstTime:false,newAccount:false,_authFlows:{},_registration:null,_registrationComplete:false});TP.emit('state');return TP.go('home',{root:true,via:'zoom'});}
TP.act('authGoogleDemo',async button=>{if(button.dataset.v==='new-account'){authNewAccount(TP.S,'email','new.member@gmail.com');TP.S._registrationIdentity={provider:'google',email:'new.member@gmail.com'};TP.S.st.profile='empty';return TP.go('profile',{root:true,params:{email:'new.member@gmail.com'}});}return authSessionDemo();});
// Prototype adapter: production credentials must be verified by the server.
TP.passwordAuthDemo={async signIn(identifier,password){return {ok:['somjai@example.com', '0812345678'].includes(identifier)&&password==='Mitraree!2026Demo'};}};
function authSignInForm(ctx){const filled=['filled','error','service-error','phone'].includes(ctx.state);return `<form id="passwordLoginForm" novalidate><div class="field"><label for="signInEmail">อีเมลหรือเบอร์โทรศัพท์ <span class="req" aria-hidden="true">*</span></label><input class="input" id="signInEmail" aria-describedby="signInEmailError" inputmode="email" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" required value="${ctx.state==='phone'?'0812345678':filled?'somjai@example.com':''}" placeholder="กรอกอีเมลหรือเบอร์โทรศัพท์"><p class="err-t" id="signInEmailError" hidden></p></div><div class="field"><label for="signInPassword">รหัสผ่าน <span class="req" aria-hidden="true">*</span></label><div class="reg-password-input"><input class="input" id="signInPassword" aria-describedby="signInPasswordError" type="password" autocomplete="current-password" required value="${filled?'Mitraree!2026Demo':''}" placeholder="กรอกรหัสผ่าน"><button type="button" class="reg-password-toggle" id="signInEye" aria-label="แสดงรหัสผ่าน" aria-controls="signInPassword" aria-pressed="false">${ic('eye',20)}</button></div><p class="err-t" id="signInPasswordError" hidden></p></div><div class="auth-login-options"><label class="auth-remember" for="signInRemember"><input id="signInRemember" type="checkbox" name="remember"> <span>จำไว้ในระบบ</span></label><button type="button" class="txtbtn" data-a="authForgotOpen">ลืมรหัสผ่าน?</button></div><div id="signInError" class="note danger auth-login-alert" role="alert" ${['error','invalid','service-error'].includes(ctx.state)?'':'hidden'}>${ic('triangle-alert',18)}<span>${ctx.state==='service-error'?'ระบบไม่พร้อมใช้งาน กรุณาลองอีกครั้ง':'อีเมลหรือรหัสผ่านไม่ถูกต้อง'}</span></div><button type="submit" class="btn primary block" id="signInSubmit">เข้าสู่ระบบ</button></form>`;}
function authMountPassword(el, ctx) {
  const form = $('#passwordLoginForm', el), email = $('#signInEmail', el), password = $('#signInPassword', el);
  const error = $('#signInError', el), button = $('#signInSubmit', el), eye = $('#signInEye', el);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function fieldError(input, message) {
    input.closest('.field').classList.toggle('err', !!message);
    input.setAttribute('aria-invalid', String(!!message));
    const node = $('#' + input.id + 'Error', el);
    node.textContent = message;
    node.hidden = !message;
  }
  function validate() {
    const raw = email.value.trim();
    const identifier = raw.includes('@') ? raw.toLowerCase() : raw.replace(/[\s-]/g, '');
    const identifierError = !identifier ? 'กรุณากรอกอีเมลหรือเบอร์โทรศัพท์'
      : emailPattern.test(identifier) || /^0[0-9]{9}$/.test(identifier) ? '' : 'กรอกอีเมลหรือเบอร์โทรศัพท์ให้ถูกต้อง';
    const passwordError = password.value ? '' : 'กรุณากรอกรหัสผ่าน';
    fieldError(email, identifierError);
    fieldError(password, passwordError);
    return { identifier, invalid: identifierError ? email : passwordError ? password : null };
  }
  if (ctx.state === 'required') validate();
  eye.addEventListener('click', () => {
    const show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    eye.innerHTML = ic(show ? 'eye-off' : 'eye', 20);
    TP.icons(eye);
    eye.setAttribute('aria-label', show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน');
    eye.setAttribute('aria-pressed', String(show));
  });
  form.addEventListener('input', event => {
    error.hidden = true;
    if (event.target === email || event.target === password) fieldError(event.target, '');
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (button.disabled) return;
    const { identifier, invalid } = validate();
    if (invalid) { invalid.focus(); return; }
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    try {
      await TP.wait(TP.RED() ? 80 : 500);
      if (ctx.state === 'service-error') throw new Error('unavailable');
      const result = await TP.passwordAuthDemo.signIn(identifier, password.value, { remember: $('#signInRemember', el).checked });
      if (TP.cur()?.el !== el) return;
      if (result.ok) { password.value = ''; return authSessionDemo(); }
      $('span', error).textContent = 'อีเมล เบอร์โทรศัพท์ หรือรหัสผ่านไม่ถูกต้อง';
      error.hidden = false;
    } catch {
      $('span', error).textContent = 'ระบบไม่พร้อมใช้งาน กรุณาลองอีกครั้ง';
      error.hidden = false;
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  });
}
// Recovery is simulated here; production must issue a single-use, expiring email link.
TP.act('authForgotOpen',()=>{TP.S.st.forgotpassword='normal';return TP.go('forgotpassword',{params:{email:($('#signInEmail',TP.cur()?.el)?.value || '').trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)?.[0] || ''}});});
TP.act('authRecoveryLogin',()=>TP.go('login',{root:true}));
TP.screen('forgotpassword',{
 group:'start',title:'ลืมรหัสผ่าน',code:'C115',parent:'login',
 states:[['normal','กรอกอีเมลเพื่อขอลิงก์ตั้งรหัสผ่าน'],['sent','ส่งคำขอตั้งรหัสผ่านแล้ว']],
 notes:['หน้าส่งคำขอมีภาพซองจดหมาย ปุ่มส่งอีเมลอีกครั้งพร้อมรอ 60 วินาที และปุ่มกลับไปเข้าสู่ระบบ','ต้นแบบไม่ส่งอีเมลจริง ระบบจริงใช้ลิงก์ครั้งเดียวที่หมดอายุและตอบข้อความเดียวกันไม่ว่าอีเมลมีบัญชีหรือไม่','จำไว้ในระบบส่งเป็นตัวเลือก session ให้บริการยืนยันตัวตน ไม่เก็บรหัสผ่านใน browser storage'],
 render(ctx){const body=ctx.state==='sent'? `<section class="auth-recovery-sent"><img class="auth-recovery-art" src="/assets/auth/recovery-email-sent-v1.png" alt="" width="168" height="168"><h2>ตรวจสอบอีเมลของคุณ</h2><p class="body">หากอีเมลนี้มีบัญชีในระบบ คุณจะได้รับลิงก์สำหรับตั้งรหัสผ่านใหม่</p><div class="auth-recovery-hint"><p>ยังไม่พบอีเมล?</p><p class="small">ลองตรวจสอบจดหมายขยะ หรือส่งอีเมลอีกครั้ง</p></div><div class="auth-recovery-actions"><button type="button" id="recoveryResend" class="btn primary block">ส่งอีเมลอีกครั้ง</button><p class="small" id="recoveryResendStatus" role="status" aria-live="polite"></p><button type="button" class="btn secondary block" data-a="authRecoveryLogin">กลับไปเข้าสู่ระบบ</button></div></section>`:`<p class="body">กรอกอีเมลที่ใช้สมัครเพื่อขอลิงก์ตั้งรหัสผ่านใหม่</p><form id="forgotPasswordForm" class="auth-recovery-form"><div class="field"><label for="recoveryEmail">อีเมล</label><input class="input" id="recoveryEmail" type="email" autocomplete="email" required value="${TP.esc(ctx.params.email||'')}" placeholder="กรอกอีเมล"></div></form>`;return ui.nav({back:true,title:'ลืมรหัสผ่าน'})+ui.page(body)+(ctx.state==='sent'?'':ui.dock('<button type="submit" form="forgotPasswordForm" class="btn primary block">ส่งลิงก์ตั้งรหัสผ่านใหม่</button>'));},
 mount(el,ctx){const form=$('#forgotPasswordForm',el);form?.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity())return;ctx.params.email=$('#recoveryEmail',el).value.trim();TP.S._recoveryResendAt=Date.now()+60000;TP.S.st.forgotpassword='sent';await TP.refresh();});
 const resend=$('#recoveryResend',el),status=$('#recoveryResendStatus',el);if(!resend)return;
 const update=()=>{const seconds=Math.max(0,Math.ceil(((TP.S._recoveryResendAt||0)-Date.now())/1000));resend.disabled=seconds>0;resend.textContent=seconds>0?'ส่งอีกครั้งใน '+seconds+' วินาที':'ส่งอีเมลอีกครั้ง';};
 update();ctx.every(update,1000);
 resend.addEventListener('click',()=>{if(resend.disabled)return;TP.S._recoveryResendAt=Date.now()+60000;status.textContent='ส่งคำขออีกครั้งแล้ว กรุณาตรวจสอบอีเมล';update();});
 }
});
/* Shared channel form: one page panel, with in-place code verification. */
function authMaskedTarget(channel,value){
  if(channel==='phone'){const phone=digits(value);return '*'.repeat(Math.max(0,phone.length-4))+phone.slice(-4);}
  const [local,domain]=String(value||'').split('@');
  if(!domain)return '***';
  const chars=Array.from(local),prefix=chars.length>2?chars.slice(0,2).join(''):'';
  return `${prefix}***@${domain}`;
}
function authTerms() {
  return '<p class="auth-cover-terms"><button type="button" data-a="stDoc" data-v="all" aria-haspopup="dialog">ข้อตกลงและความเป็นส่วนตัว</button></p>';
}
function authFormPage(channel, body, action, extras='') {
  const f=authDraft(TP.S,channel),code=f.step==='code',title=code?'กรอกรหัส 6 หลัก':channel==='email'?'ยืนยันอีเมลของคุณ':'ยืนยันเบอร์โทรศัพท์';
  const description=code?`ส่ง${channel==='email'?'ทางอีเมล':'ทาง SMS'}ไปที่ <b>${esc(authMaskedTarget(channel,f.target))}</b>`:'รับรหัสยืนยันเพื่อเข้าสู่ระบบหรือสร้างบัญชี';
  return `<div class="auth-form-scene${code?' auth-code-step':''}"><img class="auth-form-cover" src="/assets/auth/login-consultation-header-v2.png" alt=""><button type="button" class="auth-form-back" data-a="authFormBack" aria-label="${code?'ย้อนกลับไปแก้ไข'+(channel==='email'?'อีเมล':'เบอร์โทรศัพท์'):'ย้อนกลับ'}">${ic('arrow-left',22,2)}<span>กลับ</span></button><section class="auth-form-panel" aria-label="${title}">${ui.page(`<header class="auth-panel-heading"><h1>${title}</h1><p>${description}</p></header>${code?authCodeBox(channel,f):body}${code?'':`<div class="auth-form-submit">${action}</div>${extras}`}${authTerms()}`,{cls:'auth-form-scroll'})}${code?`<div class="auth-form-verify-action">${action}</div>${authKeypadHtml()}`:''}</section></div>`;
}
TP.act('authFormBack',async()=>{
  const channel=TP.cur()?.id==='loginemail'?'email':TP.cur()?.id==='loginphone'?'phone':null,f=channel&&authDraft(TP.S,channel);
  if(f?.step==='code'){f.step='entry';f.challenge=null;f.code='';f.error='';f.requestError='';f.mode=null;return TP.refresh({anim:false});}
  return TP.canBack()?TP.back():TP.go('login',{root:true});
});
function authKeypadHtml(){return `<div class="auth-code-keyboard" role="group" aria-label="แป้นตัวเลข"><div class="st-keys">${KEYS.map(([key,letters])=>!key?'<span class="st-key blank" aria-hidden="true"></span>':key==='del'?`<button type="button" class="st-key fn" data-auth-key="del" aria-label="ลบ">${ic('delete',24,1.8)}</button>`:`<button type="button" class="st-key" data-auth-key="${key}" aria-label="${key}"><b>${key}</b><small>${letters}</small></button>`).join('')}</div></div>`;}
const loginEmailValid = value => value.length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value);
const authDraft = (S,channel) => ((S._authFlows ||= {})[channel] ||= {step:'entry',target:'',code:'',error:'',round:0,busy:false});
/* Prototype data adapter. Replace with a server challenge/session provider in app-core.
   Request responses do not disclose account existence. No real SMS/email is sent. */
TP.authDemo = {
  issue(channel,target,round,S,mode){return {channel,target,round,expiresAt:Date.now()+300000,resendAt:Date.now()+60000,attempts:0,used:false,expected:'123456',existing:mode?mode==='existing':channel==='email'?target.toLowerCase()===(S.user.email||'somjai@example.com').toLowerCase():target===digits(S.user.phone)};},
  verify(challenge,code){
    if(!challenge||challenge.used)return {ok:false,error:'รหัสนี้ใช้ไปแล้ว กรุณาขอรหัสใหม่'};
    if(Date.now()>=challenge.expiresAt)return {ok:false,error:'รหัสหมดอายุแล้ว กรุณาขอรหัสใหม่'};
    if(challenge.attempts>=5)return {ok:false,error:'ลองผิดครบ 5 ครั้งแล้ว กรุณาขอรหัสใหม่'};
    if(!/^\d{6}$/.test(code))return {ok:false,error:'กรอกรหัสยืนยันให้ครบ 6 หลัก'};
    if(code!==challenge.expected){challenge.attempts++;return {ok:false,error:challenge.attempts>=5?'ลองผิดครบ 5 ครั้งแล้ว กรุณาขอรหัสใหม่':`รหัสไม่ถูกต้อง ลองได้อีก ${5-challenge.attempts} ครั้ง`};}
    challenge.used=true;return {ok:true,existing:challenge.existing};
  }
};
function authNewAccount(S,channel,target){
  TP.freshAccount(S);TP.blankUser(S,channel==='phone'?target:'');
  S.user={name:'',last:'',full:'',phone:channel==='phone'?fmtPhone(target):'',email:channel==='email'?target:'',born:'',birthYear:'',age:'',sex:'none',allergies:[],allergyState:'unknown',allergySrc:'',meds:[],weight:'',conditions:[],condNone:false,food:'',foodNone:false};
  S.intake={who:'me',symptoms:[],custom:[],otherOpen:false,urgent:[],note:'',photos:0,mode:S.intake?.mode==='video'?'video':'chat'};
  Object.assign(S,{loggedIn:true,firstTime:true,newAccount:true,consent:false,consentVer:0,_gone:false,_authFlows:{},_registration:null,_registrationIdentity:{provider:channel,email:channel==='email'?target:'',phone:channel==='phone'?digits(target):''},_registrationComplete:false,healthConsentRecord:null,ofPending:null,deliveryAddressId:null});
}
function authPreview(S,channel,state){
  S.loggedIn=false;S._authFlows ||= {};delete S._authFlows[channel];const f=authDraft(S,channel);
  const codeState=['otp-sent','otp-filled','otp-wrong','otp-expired','otp-locked','resend','new-account','existing-account','otp-c103','masked-target'].includes(state);
  const value=channel==='email'?(state==='invalid'?'somjai@':state==='new-account'?'new@example.com':state==='filled'||state==='service-error'||codeState?'somjai@example.com':''):(state==='error'?'08123':state==='new-account'?'0899999999':['signedout','filled'].includes(state)||codeState?digits(S.user.phone):'');
  if(channel==='email')S._loginEmail=value;else S._ph=value;
  if(codeState){f.step='code';f.target=value;f.round=1;f.mode=state==='new-account'?'new':'existing';f.challenge=TP.authDemo.issue(channel,value,1,S,f.mode);if(['otp-filled','new-account','existing-account'].includes(state))f.code='123456';if(state==='otp-wrong'){f.code='000000';f.challenge.attempts=1;f.error='รหัสไม่ถูกต้อง ลองได้อีก 4 ครั้ง'}if(state==='otp-expired'){f.challenge.expiresAt=Date.now()-1;f.challenge.resendAt=0;f.error='รหัสหมดอายุแล้ว กรุณาขอรหัสใหม่'}if(state==='otp-locked'){f.challenge.attempts=5;f.challenge.resendAt=0;f.error='ลองผิดครบ 5 ครั้งแล้ว กรุณาขอรหัสใหม่'}if(state==='resend')f.challenge.resendAt=0;}
}
function authCodeBox(channel,f){
  if(f.step!=='code')return '';
  const cells=[0,1,2,3,4,5].map(index=>`${index===3?'<span class="st-sep" aria-hidden="true"></span>':''}<span class="st-cell${index===f.code.length?' cur':''}" aria-hidden="true"><b>${esc(f.code[index]||'')}</b><i class="st-caret"></i></span>`).join('');
  return `<section class="auth-code-box"><p class="st-ref auth-code-ref"><span>รหัสอ้างอิง (Ref)</span><b class="num">${f.challenge.round%2?'KXQP':'TMWD'}</b></p><div class="st-otp auth-inline-otp${f.error?' bad':''}" id="authCells">${cells}<input id="authCode" class="st-otp-in" type="text" inputmode="${document.documentElement.classList.contains('mob')?'none':'numeric'}" autocomplete="one-time-code" pattern="[0-9]*" maxlength="6" value="${esc(f.code)}" aria-label="รหัสยืนยัน 6 หลัก" aria-invalid="${!!f.error}" aria-describedby="authCodeTime authCodeError"></div><p class="hint" id="authCodeTime">รหัสใช้ได้ 5 นาที</p><p class="err-t" id="authCodeError" role="alert" ${f.error?'':'hidden'}>${esc(f.error)}</p><div class="auth-code-tools"><button type="button" class="txtbtn" id="authResend" data-a="authResendCode" data-v="${channel}" ${Date.now()<f.challenge.resendAt?'disabled':''}>ส่งรหัสใหม่</button></div></section>`;
}
function authSubmitButton(channel,value){const f=authDraft(TP.S,channel),code=f.step==='code',locked=f.challenge&&(f.challenge.attempts>=5||Date.now()>=f.challenge.expiresAt);return ui.btn(code?'ยืนยันและดำเนินการต่อ':'ส่งรหัสยืนยัน',{id:channel==='email'?'emailGo':'lgGo',a:channel==='email'?'authEmailSend':'stLgSend',disabled:f.busy||(code?!/^\d{6}$/.test(f.code)||locked:!value.trim())});}
async function authIssue(channel,button,resend=false){
  const current=TP.cur(),el=current?.el,S=TP.S,f=authDraft(S,channel),input=el&&$(channel==='email'?'#loginEmail':'#phIn',el);if((!input&&!resend)||f.busy)return;
  let value=resend?f.target:channel==='email'?input.value.trim():digits(input.value);if(channel==='phone'&&/^[689]\d{8}$/.test(value))value='0'+value;
  if(channel==='email'?!loginEmailValid(value):!/^0\d{9}$/.test(value)){
    if(channel==='email'){const error=$('#loginEmailError',el);error.hidden=false;input.setAttribute('aria-invalid','true');}else loginErr(el,true);input.focus();return;
  }
  if(resend&&Date.now()<(f.challenge?.resendAt||0))return;
  if(channel==='email')S._loginEmail=value;else S._ph=value;
  f.busy=true;button.disabled=true;button.setAttribute('aria-busy','true');await TP.wait(TP.RED()?80:700);
  f.busy=false;if(TP.cur()?.el!==el||authDraft(S,channel)!==f)return;
  button.removeAttribute('aria-busy');
  if(current.ctx?.state==='service-error'){button.disabled=false;f.requestError='ส่งรหัสไม่สำเร็จ กรุณาลองอีกครั้ง ข้อมูลที่กรอกยังอยู่';await TP.refresh({anim:false});return;}
  f.round++;f.target=value;f.code='';f.error='';f.requestError='';f.step='code';f.challenge=TP.authDemo.issue(channel,value,f.round,S,f.mode);await TP.refresh({anim:false});
}
async function authVerify(channel,button){
  const current=TP.cur(),el=current?.el,S=TP.S,f=authDraft(S,channel);if(!el||f.busy||f.step!=='code')return;
  f.code=digits($('#authCode',el)?.value ?? f.code).slice(0,6);f.busy=true;button.disabled=true;button.setAttribute('aria-busy','true');await TP.wait(TP.RED()?80:500);
  f.busy=false;if(TP.cur()?.el!==el||authDraft(S,channel)!==f)return;
  const result=TP.authDemo.verify(f.challenge,f.code);if(!result.ok){f.error=result.error;await TP.refresh({anim:false});return;}
  if(!result.existing){authNewAccount(S,channel,f.target);S.st.profile='empty';TP.emit('state');return TP.go('profile',{root:true,params:channel==='email'?{email:f.target}:{phone:f.target}});}
  Object.assign(S,{loggedIn:true,firstTime:false,newAccount:false,_authFlows:{},_registration:null,_registrationComplete:false});TP.emit('state');
  return TP.go('home',{root:true,via:'zoom'});
}
function authMountCode(el,ctx,channel){
  const S=TP.S,f=authDraft(S,channel);if(f.step!=='code')return;
  const input=$('#authCode',el),button=$(channel==='email'?'#emailGo':'#lgGo',el),error=$('#authCodeError',el),resend=$('#authResend',el),time=$('#authCodeTime',el),box=$('#authCells',el),keys=$('.auth-code-keyboard',el);
  const paint=()=>{$$('.st-cell',box).forEach((cell,index)=>{$('b',cell).textContent=f.code[index]||'';cell.classList.toggle('cur',index===f.code.length);});};
  const update=()=>{const now=Date.now(),remaining=Math.max(0,Math.ceil((f.challenge.expiresAt-now)/1000)),cooldown=Math.max(0,Math.ceil((f.challenge.resendAt-now)/1000));resend.disabled=f.busy||cooldown>0;resend.textContent=cooldown?`ส่งรหัสใหม่ใน ${cooldown} วินาที`:'ส่งรหัสใหม่';time.textContent=remaining?`รหัสใช้ได้อีก ${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`:'รหัสหมดอายุแล้ว กรุณาขอรหัสใหม่';button.disabled=f.busy||f.code.length!==6||!remaining||f.challenge.attempts>=5;input.readOnly=!remaining||f.challenge.attempts>=5;};
  const changed=()=>{if(input.readOnly||f.busy)return;input.value=digits(input.value).slice(0,6);f.code=input.value;f.error='';error.hidden=true;box.classList.remove('bad');input.setAttribute('aria-invalid','false');paint();update();};
  input.addEventListener('input',changed);input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!button.disabled){event.preventDefault();authVerify(channel,button);}});
  keys.addEventListener('mousedown',event=>{if(event.target.closest('button'))event.preventDefault();});
  keys.addEventListener('click',event=>{const key=event.target.closest('[data-auth-key]')?.dataset.authKey;if(!key||input.readOnly||f.busy)return;input.value=key==='del'?f.code.slice(0,-1):(f.code+key).slice(0,6);changed();input.focus({preventScroll:true});});
  update();paint();ctx.every(update,1000);ctx.later(()=>{input.focus({preventScroll:true});box.scrollIntoView({block:'nearest',behavior:'auto'});},100);
}
TP.act('authEditTarget',async target=>{const f=authDraft(TP.S,target.dataset.v);if(f.busy)return;f.step='entry';f.challenge=null;f.code='';f.error='';f.requestError='';f.mode=null;await TP.refresh({anim:false});});
TP.act('authResendCode',button=>authIssue(button.dataset.v,button,true));
TP.act('authEmailSend',button=>authDraft(TP.S,'email').step==='code'?authVerify('email',button):authIssue('email',button));
TP.act('stLgSend',button=>authDraft(TP.S,'phone').step==='code'?authVerify('phone',button):authIssue('phone',button));


/* =====================================================================
   OTP (C02): 6 cells + caret, simulated iOS number pad with QuickType
   ===================================================================== */
/* Ref = 4 letters printed in the same SMS, so the customer knows which SMS is current after asking for a new code */
const KEYS = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['', ''], ['0', ''], ['del', '']];
/* =====================================================================
   Profile (C02): new phone number with no account yet, after OTP
   ===================================================================== */
const SEXES = [['none', 'ไม่ระบุ'], ['f', 'หญิง'], ['m', 'ชาย']];
/* Registration draft: verified contact is carried from OTP, never requested twice. */
const REG_TOPICS=[['weight','น้ำหนัก'],['height','ส่วนสูง'],['conditions','โรคประจำตัว'],['meds','ยาที่ใช้ประจำ'],['allergies','ประวัติการแพ้ยา'],['documents','เอกสารการแพ้ยา'],['food','ประวัติการแพ้อาหาร'],['follow','ติดตามอาการป่วย']];
/* Single purpose, explicit health-data consent. Company details require owner confirmation. */
const REG_HEALTH_POLICY={version:'health-care-2026-11-01-draft-2',controller:'บริษัท มิตรอารีแคร์ จำกัด',address:null,contact:null,retention:null};
const regConsentAccepted=d=>d.healthConsentVersion===REG_HEALTH_POLICY.version&&REG_TOPICS.every(([key])=>d.consents[key]===true);
/* Privacy notice acknowledgement (legacy web register_customer_policy): not consent, kept separate from health consent. */
const REG_NOTICE_POLICY={version:'notice-2026-11-23-draft-2',documents:['notice']};
const regNoticeAccepted=d=>d.noticeAckVersion===REG_NOTICE_POLICY.version;
TP.healthConsentVersion=()=>REG_HEALTH_POLICY.version;
TP.healthConsentNeeded=S=>!(S.consent&&S.consentVer>=4&&S.healthConsentRecord?.documentVersion===REG_HEALTH_POLICY.version);
TP.saveHealthConsent=(S,version,method)=>{if(version!==REG_HEALTH_POLICY.version)return false;S.consent=true;S.consentVer=4;S.healthConsentRecord={documentVersion:version,controller:REG_HEALTH_POLICY.controller,purpose:'pharmaceutical-care',acceptedAt:new Date().toISOString(),method,categories:REG_TOPICS.map(([key])=>key),prototype:true};return true;};
TP.sheetDef('registrationconsent', {
  group: 'start', title: 'ความยินยอมข้อมูลสุขภาพ', code: 'C107', host: 'profile', tall: true,
  states: [['normal', 'อ่านความยินยอมข้อมูลสุขภาพ ไม่มีช่องติ๊ก']],
  notes: ['เอกสารความยินยอมข้อมูลสุขภาพ (ร่าง) เปิดจากช่องยินยอมข้อมูลสุขภาพใน C105 ขั้นตรวจทาน แยกจากคำประกาศความเป็นส่วนตัวและข้อตกลง (C111)', 'อ่านอย่างเดียว ปิดแล้วไม่เปลี่ยนความยินยอม ข้อความกฎหมายยังรอบริษัทยืนยัน'],
  render: () => TP.policyDocumentBody(),
  mount: (el, ctx) => TP.mountPolicyDocuments(el, ctx, ['healthConsent']),
  foot: () => ui.btn('ปิด', { kind: 'secondary', closeSheet: true }),
});
const REG_STEPS=['ข้อมูลส่วนตัว','ที่อยู่ปัจจุบัน','ข้อมูลสุขภาพ','ตรวจทานและยินยอม'];
function regDraft(S){return S._registration ||= {step:0,first:'',last:'',nationalId:'',day:'',month:'',year:'',sex:'none',weight:'',height:'',house:'',building:'',alley:'',road:'',dist:'',amp:'',prov:'',zip:'',health:{conditions:{mode:'unknown',items:[]},meds:{mode:'unknown',items:[]},allergies:{mode:'unknown',items:[]},food:{mode:'unknown',items:[]}},documents:[],queries:{},docError:'',consents:{},noticeAckVersion:null,errors:{},busy:false};}
/* Signup contact state; replace this demo adapter with server-bound SMS challenges. */
function regInitContact(ctx){
 const d=regDraft(ctx.S);if(d.contactInitialized)return d;
 const identity=ctx.S._registrationIdentity||{};
 d.email=identity.email||ctx.params.email||d.email||'';
 d.emailLocked=!!(identity.email||ctx.params.email);
 d.emailProvider=identity.provider||'email';
 d.phone=regPhoneDigits(identity.phone||ctx.params.phone||d.phone||'');
 if(identity.phone&&d.phone===regPhoneDigits(identity.phone)){d.verifiedPhone=d.phone;d.phoneVerifiedAt=new Date().toISOString();}
 d.contactInitialized=true;return d;
}
const regPhoneValid=value=>/^0[689][0-9]{8}$/.test(value||'');
const regPhoneVerified=d=>regPhoneValid(d.phone)&&d.verifiedPhone===d.phone;
function regChangePhone(d){d.phoneRequest=(d.phoneRequest||0)+1;d.verifiedPhone='';d.phoneVerifiedAt='';d.phoneChallenge=null;d.phoneCode='';d.phoneError='';d.phoneBusy=false;d.consents={};}
TP.registrationPhoneService={
 async send(phone,round,S){if(!regPhoneValid(phone))throw Error('invalid phone');if(S.st.profile==='phone-send-error')throw Error('demo SMS unavailable');return TP.authDemo.issue('phone',phone,round,S,'new');},
 async verify(challenge,code){return TP.authDemo.verify(challenge,code);}
};
async function regSendPhone(){
 const ctx=TP.cur()?.ctx;if(!ctx)return;const d=regInitContact(ctx);
 if(d.phoneBusy||regPhoneVerified(d))return;
 if(!regPhoneValid(d.phone)){d.phoneError='กรอกเบอร์มือถือ 10 หลัก ขึ้นต้นด้วย 06, 08 หรือ 09';return TP.refresh({anim:false});}
 if(d.phoneChallenge&&Date.now()<d.phoneChallenge.resendAt)return;
 const phone=d.phone,request=d.phoneRequest=(d.phoneRequest||0)+1;
 d.phoneBusy=true;d.phoneError='';await TP.refresh({anim:false});
 try{const challenge=await TP.registrationPhoneService.send(phone,(d.phoneRound||0)+1,ctx.S);
 if(d.phoneRequest!==request||d.phone!==phone)return;
 d.phoneRound=(d.phoneRound||0)+1;d.phoneChallenge=challenge;d.phoneCode='';d.focusPhoneCode=true;
 }catch{if(d.phoneRequest===request)d.phoneError='ส่งรหัสไม่สำเร็จ กรุณาลองอีกครั้ง เบอร์และข้อมูลที่กรอกยังอยู่';}
 finally{if(d.phoneRequest===request){d.phoneBusy=false;if(TP.cur()?.id==='profile')await TP.refresh({anim:false});}}
}
TP.act('regPhoneSend',regSendPhone);
TP.act('regPhoneChange',async()=>{const d=regDraft(TP.S);regChangePhone(d);await TP.refresh({anim:false});$('#reg-phone',TP.cur()?.el)?.focus();});
TP.act('regPhoneVerify',async()=>{
 const d=regDraft(TP.S);if(d.phoneBusy||!d.phoneChallenge)return;
 const request=d.phoneRequest,phone=d.phone;d.phoneBusy=true;await TP.refresh({anim:false});
 try{const result=await TP.registrationPhoneService.verify(d.phoneChallenge,d.phoneCode||'');
 if(d.phoneRequest!==request||d.phone!==phone)return;
 if(result.ok){d.verifiedPhone=phone;d.phoneVerifiedAt=new Date().toISOString();d.phoneChallenge=null;d.phoneCode='';d.phoneError='';delete d.errors.phone;}
 else d.phoneError=result.error?.includes('หมดอายุ')?'รหัสหมดอายุแล้ว กรุณาขอรหัสใหม่':result.error?.includes('ครบ')?'กรุณาขอรหัสใหม่เพื่อยืนยันเบอร์':'รหัสไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
 }catch{if(d.phoneRequest===request)d.phoneError='ยืนยันไม่สำเร็จ กรุณาลองอีกครั้ง';}
 finally{if(d.phoneRequest===request){d.phoneBusy=false;if(TP.cur()?.id==='profile')await TP.refresh({anim:false});}}
});
function regContactFields(d){
 const verified=regPhoneVerified(d),challenge=d.phoneChallenge,locked=verified||!!challenge;
 return '<section class="reg-signup-contact" aria-label="ข้อมูลติดต่อ">'+
 regField(d,'email','อีเมล',{ac:'email',max:254,readonly:d.emailLocked,placeholder:'กรอกอีเมล'})+
 (d.emailLocked?'<p class="hint reg-email-locked">'+ic('lock',16,1.8)+(d.emailProvider==='google'?'อีเมลจากบัญชี Google แก้ไขไม่ได้':'อีเมลที่ยืนยันแล้ว แก้ไขไม่ได้')+'</p>':'')+
 '<div class="reg-phone-control'+(locked?' is-locked':'')+'">'+regField(d,'phone','เบอร์โทรศัพท์มือถือ',{ac:'tel-national',max:10,numeric:true,readonly:locked,placeholder:'เช่น 0812345678'})+
 (!locked?'<button type="button" class="btn secondary" id="regPhoneSend" data-a="regPhoneSend" '+(d.phoneBusy||!regPhoneValid(d.phone)?'disabled':'')+'>'+(d.phoneBusy?'กำลังส่ง…':'ขอรหัส OTP')+'</button>':'<button type="button" class="txtbtn reg-phone-change" data-a="regPhoneChange">เปลี่ยนเบอร์</button>')+'</div>'+
 (!locked?'<p class="hint">รับรหัสยืนยันทาง SMS</p>':'')+
 (verified?'<div class="reg-phone-status"><span role="status">'+ic('circle-check',18,1.8)+'ยืนยันเบอร์โทรแล้ว</span></div>':'')+
 (challenge?'<div class="reg-phone-otp"><label class="reg-phone-otp-label" for="reg-phone-code">รหัส OTP 6 หลัก <span class="reg-required" aria-hidden="true">*</span></label><div class="reg-phone-code-row"><input class="input" id="reg-phone-code" type="text" required aria-required="true" inputmode="numeric" autocomplete="one-time-code" maxlength="12" value="'+esc(d.phoneCode||'')+'" aria-describedby="regPhoneExpiry regPhoneError" aria-invalid="'+!!d.phoneError+'"><button type="button" class="btn primary" id="regPhoneVerify" data-a="regPhoneVerify" '+(d.phoneBusy||!/^\d{6}$/.test(d.phoneCode||'')||Date.now()>=challenge.expiresAt||challenge.attempts>=5?'disabled':'')+'>ยืนยันเบอร์</button></div><div class="reg-phone-otp-meta"><p class="hint" id="regPhoneExpiry" role="status"></p><button type="button" class="txtbtn" id="regPhoneResend" data-a="regPhoneSend" hidden>ส่งรหัสใหม่</button></div></div>':'')+
 '<p class="err-t" id="regPhoneError" role="alert" '+(d.phoneError?'':'hidden')+'>'+esc(d.phoneError||'')+'</p></section>';
}
function regReadInputs(el,d){for(const input of $$('[data-reg-input]',el)){const key=input.dataset.regInput;if(input.readOnly)continue;d[key]=key==='nationalId'?regIdDigits(input.value):key==='addressPhone'||key==='phone'?regPhoneDigits(input.value):input.value;}}
function regToday(){const d=new Date();return {year:d.getFullYear(),month:d.getMonth()+1,day:d.getDate()};}
function regAge(d){const y=+d.year,m=+d.month,day=+d.day,t=regToday(),date=new Date(y,m-1,day);if(!/^\d{4}$/.test(d.year)||y<1900||y>t.year||date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==day)return null;const age=t.year-y-((t.month<m||(t.month===m&&t.day<day))?1:0);return age<0?null:age;}
function regIdDigits(v){return String(v||'').replace(/[^0-9]/g,'').slice(0,13);}
function regIdValid(v){if(!/^[1-8]\d{12}$/.test(v))return false;let sum=0;for(let i=0;i<12;i++)sum+=(13-i)*+v[i];return (11-sum%11)%10===+v[12];}
const REG_PASSWORD_RULES=[
  ['อย่างน้อย 15 ตัวอักษร',value=>Array.from(value).length>=15],
  ['ตัวพิมพ์ใหญ่ A–Z อย่างน้อย 1 ตัว',value=>/[A-Z]/.test(value)],
  ['ตัวพิมพ์เล็ก a–z อย่างน้อย 1 ตัว',value=>/[a-z]/.test(value)],
  ['ตัวเลข 0–9 อย่างน้อย 1 ตัว',value=>/[0-9]/.test(value)],
  ['อักขระพิเศษอย่างน้อย 1 ตัว เช่น ! @ #',value=>/[\p{P}\p{S}]/u.test(value)]
];
function regErrors(d,step=d.step){const e={};if(step===0){if(d.contactInitialized&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email||''))e.email='กรอกอีเมลให้ถูกต้อง';if(d.contactInitialized&&!regPhoneVerified(d))e.phone=regPhoneValid(d.phone)?'ยืนยันเบอร์โทรด้วยรหัส OTP ก่อนดำเนินการต่อ':'กรอกเบอร์มือถือ 10 หลัก ขึ้นต้นด้วย 06, 08 หรือ 09';if(!REG_PASSWORD_RULES.every(([,check])=>check(d.password||'')))e.password='ตั้งรหัสผ่านให้ครบตามเงื่อนไข';if(!d.passwordConfirm||d.passwordConfirm!==d.password)e.passwordConfirm='กรอกรหัสผ่านยืนยันให้ตรงกัน';if(!d.first.trim())e.first='กรอกชื่อจริง';if(!d.last.trim())e.last='กรอกนามสกุล';if(!/^[0-9]{13}$/.test(d.nationalId))e.nationalId='กรอกเลขบัตรประชาชนเป็นตัวเลขให้ครบ 13 หลัก';else if(!regIdValid(d.nationalId))e.nationalId='เลขบัตรประชาชนไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';if(regAge(d)===null)e.day='กรอกวัน เดือน และปีเกิด ค.ศ. ที่ถูกต้อง';if(!/^\d+(?:\.\d+)?$/.test(d.weight)||!Number.isFinite(+d.weight)||+d.weight<=0||+d.weight>500)e.weight='กรอกน้ำหนักมากกว่า 0 และไม่เกิน 500 กก.';if(!/^\d+(?:\.\d+)?$/.test(d.height)||!Number.isFinite(+d.height)||+d.height<=0||+d.height>300)e.height='กรอกส่วนสูงมากกว่า 0 และไม่เกิน 300 ซม.';}
if(step===1){for(const k of ['addressFirst','addressLast']){if(!/^[\p{L}\p{M}][\p{L}\p{M} .’'-]{0,49}$/u.test((d[k]||'').trim()))e[k]='กรอก'+(k==='addressFirst'?'ชื่อ':'นามสกุล')+'ให้ถูกต้อง ไม่ใช้ตัวเลขหรือสัญลักษณ์พิเศษ';}if(!/^0[689][0-9]{8}$/.test(d.addressPhone||''))e.addressPhone='กรอกเบอร์มือถือ 10 หลัก ขึ้นต้นด้วย 06, 08 หรือ 09';if(d.addressState==='loading'||d.addressState==='error')e.prov=d.addressState==='loading'?'กำลังโหลดข้อมูลที่อยู่':'กรุณาโหลดข้อมูลที่อยู่อีกครั้ง';for(const k of ['house','dist','amp','prov'])if(!d[k].trim())e[k]='กรอก'+({house:'บ้านเลขที่',dist:'ตำบล / แขวง',amp:'อำเภอ / เขต',prov:'จังหวัด'})[k];if(TP.thaiAddressData?.rows&&d.prov&&d.amp&&d.dist&&!TP.thaiAddressData.rows.some(r=>r.province===d.prov&&r.amphoe===d.amp&&r.district===d.dist&&String(r.zipcode)===d.zip))e.dist='เลือกจังหวัด อำเภอ และตำบลให้สัมพันธ์กัน';if(!/^\d{5}$/.test(d.zip))e.zip='กรอกรหัสไปรษณีย์ 5 หลัก';}
if(step===1&&globalThis.TPAddressMap?.errors){const fieldMap={first:'addressFirst',last:'addressLast',phone:'addressPhone'};for(const [k,v]of Object.entries(globalThis.TPAddressMap.errors({...d,first:d.addressFirst,last:d.addressLast,phone:d.addressPhone},TP.thaiAddressData?.rows)))e[fieldMap[k]||k]=v;}
if(step===2)for(const [k,v]of Object.entries(d.health)){if(v.mode==='set'&&!regHealthValues(v).length)e[k]='กรอก'+REG_HEALTH_LABELS[k]+' หรือเลือกไม่มี / ยังไม่ทราบ';if(v.text===undefined&&v.mode==='set'&&v.other&&!v.otherText?.trim())e[k]='กรอก'+REG_HEALTH_LABELS[k]+'อื่น ๆ หรือยกเลิกตัวเลือกอื่น ๆ';}return e;}
const regAllValid=d=>[0,1,2].every(n=>!Object.keys(regErrors(d,n)).length);
const regCanSubmit=d=>regAllValid(d)&&regNoticeAccepted(d)&&regConsentAccepted(d)&&!d.busy;
function regContact(ctx){if(!ctx.params.email&&!ctx.params.phone&&!ctx.S.user.email&&!ctx.S.user.phone)return {channel:'email',value:regDraft(ctx.S).email||''};if(ctx.params.email)return {channel:'email',value:ctx.params.email};if(ctx.params.phone)return {channel:'phone',value:digits(ctx.params.phone)};return ctx.S.user.email?{channel:'email',value:ctx.S.user.email}:{channel:'phone',value:digits(ctx.S.user.phone)};}
const REG_PLACEHOLDERS={first:'ชื่อจริง',last:'นามสกุล',nationalId:'เลขบัตรประชาชน 13 หลัก',day:'15',month:'6',year:'1988',weight:'เช่น 55',height:'เช่น 160',house:'เช่น 88/12',building:'ชื่อหมู่บ้าน อาคาร ห้อง หรือชั้น',alley:'เช่น ทวีวัฒนา 25',road:'เช่น เลียบคลองทวีวัฒนา',dist:'ค้นหาตำบล / แขวง',amp:'ค้นหาอำเภอ / เขต',prov:'ค้นหาจังหวัด',zip:'เช่น 10170'};
function regAddressContact(d,c){if(d.addressFirst===undefined)d.addressFirst=d.first;if(d.addressLast===undefined)d.addressLast=d.last;if(d.addressPhone===undefined)d.addressPhone=d.verifiedPhone||(c.channel==='phone'?regPhoneDigits(c.value):'');}
function regPhoneDigits(v){return String(v||'').replace(/[^0-9]/g,'').slice(0,10);}
function regAddressOptions(rows,d,key){const field={prov:'province',amp:'amphoe',dist:'district'}[key];return [...new Set(rows.filter(r=>key==='prov'||r.province===d.prov&&(key==='amp'||r.amphoe===d.amp)).map(r=>r[field]))].sort((a,b)=>a.localeCompare(b,'th'));}
function regAddressPick(d,key,value,rows){const options=regAddressOptions(rows,d,key);if(!options.includes(value))value='';d[key]=value;if(key==='prov'){d.amp='';d.dist='';d.zip='';}else if(key==='amp'){d.dist='';d.zip='';}else{const row=rows.find(r=>r.province===d.prov&&r.amphoe===d.amp&&r.district===d.dist);d.zip=row?String(row.zipcode):'';}d.consents={};}
const addressAreaKeys = ['prov', 'amp', 'dist'];
const addressAreaLabels = ['จังหวัด', 'อำเภอ / เขต', 'ตำบล / แขวง'];
const areaLabel = a => [a.dist, a.amp, a.prov].filter(Boolean).join(' · ');
TP.addressAreaField = (a, errors = {}, action='openAddressArea') => {
  const error = errors.prov || errors.amp || errors.dist;
  return `<div class="field address-area-field">
  <span class="f-l">จังหวัด / อำเภอ / ตำบล <span class="reg-required" aria-hidden="true">*</span></span>
  <button type="button" class="input address-area-open" data-a="${action}" aria-haspopup="dialog" aria-describedby="addressAreaError" aria-invalid="${!!error}">
    <span>${esc(areaLabel(a) || 'เลือกจังหวัด / อำเภอ / ตำบล')}</span>${ic('chevron-down',20)}
  </button>
  <p id="addressAreaError" class="err-t" role="alert"${error?'':' hidden'}>${esc(error||'')}</p>
</div>`;
};
TP.act('openAddressArea', () => {
  const editor = TP.cur();
  if (!['profile', 'addressedit'].includes(editor?.id)) return;
  const prefix = editor.id === 'profile' ? '#reg-' : '#home-address-';
  const fields = addressAreaKeys.map(key => $(prefix + key, editor.el));
  if (!fields.every(Boolean)) return;
  if (fields[0].disabled) return TP.notify('ข้อมูลพื้นที่ยังไม่พร้อม กรุณาลองอีกครั้ง', {icon:'map-pin'});
  return TP.sheet('addressarea', {
    area: Object.fromEntries(addressAreaKeys.map((key,index) => [key, fields[index].value])),
    onSelect(result) {
      fields.forEach((field,index) => {
        field.value = result[addressAreaKeys[index]];
        field.dispatchEvent(new Event('change', {bubbles:true}));
      });
      $('.address-area-open > span', editor.el).textContent = areaLabel(result);
      $('.address-area-open', editor.el).setAttribute('aria-invalid','false');
      $('#addressAreaError', editor.el).hidden = true;
    },
  });
});
/* C515 map variant (user 24 Nov 2026): read-only preview map in a button that opens C521. C105 keeps the plain button. */
TP.addressPinField = (action, location, options = {}) => options.map ? `<section class="address-pin-entry">
  <b>ตำแหน่งจัดส่ง</b><p class="small">เพิ่มหมุดให้ตรงกับที่อยู่เพื่อให้จัดส่งได้ถูกต้อง (ไม่บังคับ)</p>
  <button type="button" class="address-pin-map" data-a="${action}" data-state="empty" aria-haspopup="dialog" aria-describedby="addressPinNote">
    <span class="address-pin-canvas" aria-hidden="true"></span>
    <span class="address-pin-cta">${ic('map-pin',18)}<span data-address-pin-label>${location ? 'แก้ไขตำแหน่ง' : 'ปักหมุดบนแผนที่'}</span></span>
  </button>
  <p class="address-pin-note" id="addressPinNote" role="status">กรอกที่อยู่ให้ครบ แล้วแตะเพื่อปักหมุดบนแผนที่</p>
  <p id="homeAddressPinStatus" hidden></p>
</section>` : `<section class="address-pin-entry">
  <b>ตำแหน่งจัดส่ง</b><p class="small">เพิ่มหมุดให้ตรงกับที่อยู่เพื่อให้จัดส่งได้ถูกต้อง (ไม่บังคับ)</p>
  <button type="button" class="btn secondary address-pin-button" data-a="${action}" aria-haspopup="dialog">
    ${ic('map-pin',20)}<span data-address-pin-label>${location ? 'แก้ไขตำแหน่ง' : 'เพิ่มตำแหน่ง'}</span>
  </button>
  <p id="homeAddressPinStatus" role="status">${location ? 'บันทึกหมุดแล้ว' : ''}</p>
</section>`;
function regDeliveryAddress(d) {
  const address = {first:d.addressFirst.trim(), last:d.addressLast.trim(), phone:d.addressPhone,
    house:d.house.trim(), building:(d.building||'').trim(), alley:(d.alley||'').trim(), road:(d.road||'').trim(),
    dist:d.dist.trim(), amp:d.amp.trim(), prov:d.prov.trim(), zip:d.zip, pin:d.pin, location:d.location};
  if (!globalThis.TPAddressMap?.valid(address)) { address.pin = false; address.location = null; }
  return address;
}
TP.act('openRegDeliveryPin', () => {
  const editor = TP.cur(), d = regDraft(TP.S);
  if (editor?.id !== 'profile' || d.step !== 1) return;
  const errors = regErrors(d,1);
  if (Object.keys(errors).length) {
    d.errors = errors;
    return TP.refresh({anim:false});
  }
  return TP.sheet('deliverypin', {
    address: regDeliveryAddress(d),
    onConfirm(location) {
      d.pin = true;
      d.location = location;
      $('[data-address-pin-label]',editor.el).textContent = 'แก้ไขตำแหน่ง';
      $('#homeAddressPinStatus',editor.el).textContent = 'บันทึกหมุดแล้ว';
    },
  });
});
TP.sheetDef('addressarea', {
  group: 'account', title: 'เลือกพื้นที่จัดส่ง', code: 'C522', host: 'addressedit', tall: true, cls: 'address-area-sheet',
  sheetTitle: ctx => ctx.params.title || 'เลือกพื้นที่จัดส่ง',
  afterClose: ctx => ctx.params.onReturn?.(),
  states: [['normal', 'ค้นหาและเลือกจังหวัด อำเภอ ตำบล'], ['no-results', 'ค้นหาแล้วไม่พบพื้นที่'], ['load-error', 'โหลดพื้นที่ไม่สำเร็จ']],
  notes: ['ใช้ตัวเลือกเดียวกันในสมุดที่อยู่และสมัครสมาชิก เลือกครบสามระดับแล้วเติมรหัสไปรษณีย์ในฟอร์มเดิม'],
  render: () => `<div class="field"><label for="addressAreaSearch">ค้นหาจังหวัด</label>
    <input class="input" id="addressAreaSearch" type="search" autocomplete="off"></div>
    <button type="button" class="txtbtn" data-area-back hidden>ย้อนกลับ</button>
    <div class="area-results" aria-live="polite">กำลังโหลดพื้นที่…</div>
    <button type="button" class="btn secondary" data-area-retry hidden>โหลดข้อมูลอีกครั้ง</button>`,
  mount(el, ctx) {
    const search = $('#addressAreaSearch',el), results = $('.area-results',el);
    const back = $('[data-area-back]',el), retry = $('[data-area-retry]',el);
    const draft = {...ctx.params.area};
    let rows = [], options = [], step = 0, fail = ctx.state === 'load-error';
    let active = true;
    ctx.onLeave(() => { active = false; });
    const update = () => {
      const query = search.value.trim().toLocaleLowerCase('th');
      const matches = options.filter(value => value.toLocaleLowerCase('th').includes(query));
      results.innerHTML = matches.length ? matches.map(value =>
        `<button type="button" class="row" data-area-value="${esc(value)}"><span>${esc(value)}</span>${draft[addressAreaKeys[step]] === value ? ic('check',18) : ic('chevron-right',16)}</button>`
      ).join('') : '<p>ไม่พบพื้นที่ที่ค้นหา</p>';
      TP.icons(results);
    };
    const move = (next, query = '') => {
      step = next;
      search.value = query;
      search.previousElementSibling.textContent = 'ค้นหา' + addressAreaLabels[step];
      back.hidden = step === 0;
      options = regAddressOptions(rows,draft,addressAreaKeys[step]);
      update();
      $('.sh-b',el).scrollTop = 0;
    };
    const load = async () => {
      retry.hidden = true;
      search.disabled = true;
      results.textContent = 'กำลังโหลดพื้นที่…';
      try {
        if (fail) { fail = false; throw Error('Preview'); }
        rows = await TP.thaiAddressData.load();
        if (!active) return;
        search.disabled = false;
        move(0, ctx.state === 'no-results' ? 'ไม่พบพื้นที่ตัวอย่าง' : '');
      } catch {
        if (!active) return;
        results.textContent = 'โหลดพื้นที่ไม่สำเร็จ กรุณาลองอีกครั้ง';
        retry.hidden = false;
      }
    };
    retry.onclick = load;
    back.onclick = () => move(step - 1);
    search.oninput = update;
    results.onclick = event => {
      const value = event.target.closest('[data-area-value]')?.dataset.areaValue;
      if (!options.includes(value)) return;
      regAddressPick(draft,addressAreaKeys[step],value,rows);
      if (step < 2) return move(step + 1);
      ctx.params.onSelect?.(draft);
      TP.closeSheet();
    };
    load();
  },
});
function mountDesignSelects(root,ctx){
  root.querySelectorAll('select').forEach(select=>{
    if(select.dataset.dsSelect)return;
    select.dataset.dsSelect='true';
    const wrap=document.createElement('div'),button=document.createElement('button'),list=document.createElement('div');
    wrap.className='ds-select';button.type='button';button.className='input ds-select-trigger';
    button.id=select.id+'-trigger';list.id=select.id+'-options';list.className='ds-select-menu';list.hidden=true;
    button.setAttribute('role','combobox');button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',list.id);
    button.setAttribute('aria-label',select.labels?.[0]?.textContent.trim()||select.getAttribute('aria-label')||'Select');
    list.setAttribute('role','listbox');list.setAttribute('aria-label',button.getAttribute('aria-label'));
    select.before(wrap);wrap.append(select,button,list);select.hidden=true;select.tabIndex=-1;
    let active=0,search='',searchTimer;
    const options=()=>Array.from(select.options).filter(o=>!o.disabled);
    const close=()=>{list.hidden=true;button.setAttribute('aria-expanded','false');button.removeAttribute('aria-activedescendant');};
    const focusOption=()=>{Array.from(list.children).forEach((node,i)=>node.classList.toggle('is-active',i===active));const node=list.children[active];if(node){button.setAttribute('aria-activedescendant',node.id);node.scrollIntoView({block:'nearest'});}};
    const sync=()=>{button.disabled=select.disabled;button.innerHTML='<span>'+esc(select.selectedOptions[0]?.textContent||'')+'</span>'+ic('chevron-down',20,1.8);button.setAttribute('aria-required',String(select.required));button.setAttribute('aria-invalid',select.getAttribute('aria-invalid')||'false');if(select.getAttribute('aria-describedby'))button.setAttribute('aria-describedby',select.getAttribute('aria-describedby'));if(button.disabled)close();};
    const choose=i=>{const option=options()[i];if(!option)return;select.value=option.value;close();select.dispatchEvent(new Event('change',{bubbles:true}));sync();button.focus();};
    const open=()=>{
      if(button.disabled)return;
      root.querySelectorAll('.ds-select-trigger[aria-expanded="true"]').forEach(other=>{if(other!==button)other.click();});
      list.replaceChildren();options().forEach((option,i)=>{const item=document.createElement('div');item.id=list.id+'-'+i;item.setAttribute('role','option');item.setAttribute('aria-selected',String(option.selected));item.textContent=option.textContent;item.addEventListener('pointerdown',e=>e.preventDefault());item.addEventListener('click',()=>choose(i));list.append(item);});
      active=Math.max(0,options().findIndex(o=>o.selected));
      const rect=button.getBoundingClientRect(),bounds=(select.closest('.scroll')||root).getBoundingClientRect(),scale=rect.height/button.offsetHeight||1;
      const below=(bounds.bottom-rect.bottom)/scale-8,above=(rect.top-bounds.top)/scale-8,up=below<180&&above>below;
      wrap.classList.toggle('opens-up',up);list.style.maxHeight=Math.max(48,Math.min(280,up?above:below))+'px';
      list.hidden=false;button.setAttribute('aria-expanded','true');focusOption();
    };
    button.addEventListener('click',()=>list.hidden?open():close());
    button.addEventListener('keydown',e=>{
      if(e.key==='Tab'){close();return;}
      if(e.key==='Escape'){e.preventDefault();close();return;}
      if(['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(e.key)){
        e.preventDefault();if(list.hidden){open();return;}
        if(e.key==='Enter'||e.key===' '){choose(active);return;}
        active=e.key==='Home'?0:e.key==='End'?options().length-1:Math.max(0,Math.min(options().length-1,active+(e.key==='ArrowDown'?1:-1)));focusOption();
      }else if(e.key.length===1){clearTimeout(searchTimer);search+=e.key.toLocaleLowerCase();const i=options().findIndex(o=>o.textContent.toLocaleLowerCase().startsWith(search));if(i>=0){if(list.hidden)open();active=i;focusOption();}searchTimer=setTimeout(()=>search='',700);}
    });
    const outside=e=>{if(!wrap.contains(e.target))close();};document.addEventListener('pointerdown',outside);
    select.addEventListener('change',sync);select.addEventListener('invalid',()=>button.focus());
    const label=select.labels?.[0];const labelClick=e=>{e.preventDefault();button.focus();};label?.addEventListener('click',labelClick);
    const observer=new MutationObserver(()=>{close();sync();});observer.observe(select,{childList:true,subtree:true,attributes:true});sync();
    ctx.onLeave(()=>{observer.disconnect();document.removeEventListener('pointerdown',outside);label?.removeEventListener('click',labelClick);clearTimeout(searchTimer);});
  });
}
TP.mountDesignSelects = mountDesignSelects;
function regAddressSelect(d,key,label){return `<div class="field" data-reg-field="${key}"><label for="reg-${key}">${label} <span class="reg-required" aria-hidden="true">*</span></label><select class="input" id="reg-${key}" data-reg-address-select="${key}" required aria-required="true" aria-describedby="reg-${key}-error" disabled><option value="">${d[key]?esc(d[key]):'เลือก'+label}</option></select><p class="err-t" id="reg-${key}-error" role="alert" ${d.errors[key]?'':'hidden'}>${esc(d.errors[key]||'')}</p></div>`;}
function regMountAddressSelect(el,d,sync,ctx){let rows=[];const status=$('#regAddressLoadStatus',el);d.addressState='loading';sync();
const populate=()=>{for(const key of ['prov','amp','dist']){const input=$('#reg-'+key,el),label={prov:'จังหวัด',amp:'อำเภอ / เขต',dist:'ตำบล / แขวง'}[key];input.innerHTML=`<option value="">เลือก${label}</option>`+regAddressOptions(rows,d,key).map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');input.value=d[key];input.disabled=key==='amp'?!d.prov:key==='dist'?!d.amp:false;input.setAttribute('aria-invalid',String(!!d.errors[key]));const message=$('#reg-'+key+'-error',el);message.hidden=!d.errors[key];message.textContent=d.errors[key]||'';}$('#reg-zip',el).value=d.zip;const zipError=$('#reg-zip-error',el);zipError.hidden=!d.errors.zip;zipError.textContent=d.errors.zip||'';};
for(const key of ['prov','amp','dist'])$('#reg-'+key,el).addEventListener('change',e=>{regAddressPick(d,key,e.target.value,rows);for(const name of ['prov','amp','dist','zip'])delete d.errors[name];populate();sync();});
const load=async()=>{d.addressState='loading';$('#regAddressRetry',el).hidden=true;status.textContent='กำลังโหลดจังหวัดและพื้นที่';sync();try{if(ctx?.state==='address-error')throw Error('Preview address load failure');rows=await TP.thaiAddressData.load();if(!el.isConnected)return;d.addressState='ready';populate();status.textContent='เลือกจังหวัด ตามด้วยอำเภอและตำบล ระบบจะเติมรหัสไปรษณีย์ให้';sync();TP.previewAutofill?.fill(el,ctx);}catch{if(!el.isConnected)return;d.addressState='error';$('#regAddressRetry',el).hidden=false;status.textContent='โหลดข้อมูลที่อยู่ไม่สำเร็จ กรุณาลองอีกครั้ง';sync();}};
$('#regAddressRetry',el).addEventListener('click',load);load();}
// A valid number awaiting verification is a pending step, not an invalid phone field.
function regFieldError(d,key){return key==='phone'&&regPhoneValid(d.phone)?'':d.errors[key]||'';}
function regField(d,key,label,o={}){const error=regFieldError(d,key);return `<div class="field${error?' err':''}" data-reg-field="${key}"><label for="reg-${key}">${esc(label)}${o.optional?' <span class="opt-t">(ไม่บังคับ)</span>':' <span class="reg-required" aria-hidden="true">*</span>'}</label><input class="input" id="reg-${key}" data-reg-input="${key}" type="${key==='addressPhone'||key==='phone'?'tel':key==='email'?'email':'text'}" ${key==='addressPhone'?'pattern="0[689][0-9]{8}" minlength="10"':''} ${key==='nationalId'?'pattern="[0-9]{13}" minlength="13" spellcheck="false"':''} placeholder="${esc(o.placeholder||REG_PLACEHOLDERS[key]||label)}" value="${esc(d[key]||'')}" maxlength="${o.max||80}" ${o.numeric?'inputmode="'+(o.decimal?'decimal':'numeric')+'"':''} autocomplete="${o.ac||'off'}" ${o.readonly?'readonly':''} ${o.optional?'':'required aria-required="true"'} ${o.address?'role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="regAddressResults"':''} aria-invalid="${!!error}" aria-describedby="reg-${key}-error"><p class="err-t" id="reg-${key}-error" role="alert" ${error?'':'hidden'}>${esc(error||'')}</p></div>`;}
function regProgress(d){return `<section class="reg-progress" aria-label="ขั้นตอนสมัครสมาชิก"><div class="reg-step-meta"><h2>${REG_STEPS[d.step]}</h2><span class="reg-step-count">ขั้นตอน ${d.step+1} จาก ${REG_STEPS.length}</span></div><div class="reg-progress-track" aria-hidden="true">${REG_STEPS.map((_,n)=>`<i class="${n<d.step?'is-complete':n===d.step?'is-current':''}">${n<d.step?ic('check',16):n+1}</i>`).join('')}</div></section>`;}

function regKv(rows){return `<dl class="reg-kv">${rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v||'ไม่ได้ระบุ')}</dd></div>`).join('')}</dl>`;}
function regHealthText(v){return v.mode==='none'?'ไม่มี':v.mode==='unknown'?'ยังไม่ทราบ':regHealthValues(v).join(' · ');}
function regReview(ctx,d,editable=true){const c=regContact(ctx),change=n=>editable?`<button type="button" class="txtbtn" data-reg-step="${n}" aria-label="แก้ไข${REG_STEPS[n]}">แก้ไข</button>`:'';return `<section class="reg-summary"><div class="reg-section-head"><h3>${ic('user',20,1.8)}ข้อมูลส่วนตัว</h3>${change(0)}</div>${regKv([['ชื่อ–นามสกุล',d.first+' '+d.last],['เลขบัตรประชาชน','*********'+d.nationalId.slice(-4)],['วันเกิด',`${d.day}/${d.month}/${d.year} · ${regAge(d)} ปี`],['เพศ',SEXES.find(x=>x[0]===d.sex)?.[1]],['น้ำหนัก / ส่วนสูง',`${d.weight} กก. / ${d.height} ซม.`],['อีเมล',d.email||c.value],['เบอร์โทรที่ยืนยันแล้ว',d.verifiedPhone||c.value]])}</section><section class="reg-summary"><div class="reg-section-head"><h3>${ic('map-pin',20,1.8)}ที่อยู่ปัจจุบัน</h3>${change(1)}</div><p>${esc([d.addressFirst,d.addressLast,d.addressPhone].filter(Boolean).join(' '))}</p><p>${esc([d.house,d.building,d.alley,d.road,d.dist,d.amp,d.prov,d.zip].filter(Boolean).join(' '))}</p></section><section class="reg-summary"><div class="reg-section-head"><h3>${ic('heart-pulse',20,1.8)}ข้อมูลสุขภาพ</h3>${change(2)}</div>${regKv(Object.entries(d.health).map(([k,v])=>[{conditions:'โรคประจำตัว',meds:'ยาที่ใช้ประจำ',allergies:'ประวัติแพ้ยา',food:'ประวัติแพ้อาหาร'}[k],regHealthText(v)]))}<div class="reg-review-documents"><h4>เอกสารแพ้ยา${d.documents.length?` <span class="opt-t">(${d.documents.length} ไฟล์)</span>`:''}</h4>${d.documents.length?regDocumentList(d):'<p class="hint">ไม่ได้แนบเอกสาร</p>'}</div></section>`;}
const REG_HEALTH_LABELS={conditions:'โรคประจำตัว',meds:'ยาที่ใช้ประจำ',allergies:'ประวัติการแพ้ยา',food:'ประวัติแพ้อาหาร'};
function regHealthValues(h){if(h.mode!=='set')return [];if(h.text!==undefined)return h.text.trim()?[h.text.trim()]:[];return [...new Set([...h.items,...(h.other&&h.otherText?.trim()?[h.otherText.trim()]:[])])];}
function regHealthBlock(d,key,title){const h=d.health[key],placeholder={conditions:'เช่น โรคที่เป็นอยู่ ระยะเวลาที่เป็น และการรักษาปัจจุบัน',meds:'เช่น ชื่อยา ขนาดยา และความถี่ที่ใช้ตามฉลาก',allergies:'เช่น ชื่อยาที่เคยแพ้ และอาการที่เกิดขึ้น',food:'เช่น อาหารที่เคยแพ้ และอาการที่เกิดขึ้น'}[key];if(h.text===undefined)h.text=[...(h.items||[]),h.otherText||''].filter(Boolean).join('\n');return `<section class="reg-health-block"><h3 id="regHealthTitle-${key}">${title}</h3>${ui.seg('regMode-'+key,[['unknown','ยังไม่ทราบ'],['none','ไม่มี'],['set','ระบุข้อมูล']],h.mode,{a:'regHealthMode',label:title})}${h.mode==='set'?`<div class="field reg-health-other"><label class="f-l" for="reg-health-text-${key}">ระบุ${title} <span class="reg-required" aria-hidden="true">*</span></label><textarea class="input" id="reg-health-text-${key}" data-reg-health-text="${key}" rows="3" maxlength="1000" required aria-required="true" aria-invalid="${!!d.errors[key]}" aria-describedby="regHealthError-${key}" placeholder="${placeholder}">${esc(h.text)}</textarea></div>`:''}<p class="err-t" id="regHealthError-${key}" role="alert" ${d.errors[key]?'':'hidden'}>${esc(d.errors[key]||'')}</p></section>`;}

/* Date-of-birth zoom picker: scratch selection stays in the sheet until confirmed. */
const REG_MONTHS=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const REG_MONTH_SHORT=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
function regDobAllowed(year,month,day){const y=+year,m=+month,d=+day,t=regToday(),date=new Date(y,m-1,d);return y>=1900&&y<=t.year&&m>=1&&m<=12&&d>=1&&date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d&&(y<t.year||m<t.month||(m===t.month&&d<=t.day));}
function regDobClamp(p){const t=regToday();p.year=Math.max(1900,Math.min(t.year,+p.year||t.year-30));p.month=Math.max(1,Math.min(p.year===t.year?t.month:12,+p.month||1));const max=p.year===t.year&&p.month===t.month?t.day:new Date(p.year,p.month,0).getDate();p.day=Math.max(1,Math.min(max,+p.day||1));return p;}
function regDobInit(d,state='years'){const t=regToday(),valid=regAge(d)!==null,p={year:valid?+d.year:t.year-30,month:valid?+d.month:1,day:valid?+d.day:1};if(['months','days','selected','leap'].includes(state))Object.assign(p,{year:1988,month:2,day:29});if(state==='future')Object.assign(p,{year:t.year,month:t.month,day:t.day});if(state==='oldest')Object.assign(p,{year:1900,month:1,day:1});return regDobClamp(p);}
function regDobPick(p,kind,value){const n=+value,t=regToday();if(!Number.isInteger(n))return false;if(kind==='year'&&n>=1900&&n<=t.year){p.year=n;regDobClamp(p);return true;}if(kind==='month'&&n>=1&&n<=(p.year===t.year?t.month:12)){p.month=n;regDobClamp(p);return true;}if(kind==='day'&&regDobAllowed(p.year,p.month,n)){p.day=n;return true;}return false;}
function regDobField(d){const valid=regAge(d)!==null,label=valid?`${d.day} ${REG_MONTHS[+d.month-1]} ${d.year}`:'เลือกปี เดือน และวันเกิด',error=d.errors.day;return `<div class="field reg-birth"><span class="f-l" id="regBirthLabel">วันเกิด (ค.ศ.) <span class="reg-required" aria-hidden="true">*</span><span class="sr"> จำเป็น</span></span><button type="button" id="regBirth" class="input reg-date-trigger${valid?' has-value':''}" data-a="regDobOpen" aria-haspopup="dialog" aria-labelledby="regBirthLabel regBirthValue" aria-describedby="regBirthHint regBirthError" aria-invalid="${!!error}">${ic('calendar',22,1.8)}<span id="regBirthValue">${label}</span>${ic('chevron-down',18,1.8)}</button><p class="hint" id="regBirthHint" role="status" ${valid?'':'hidden'}>${valid?'อายุ '+regAge(d)+' ปี':''}</p><p class="err-t" id="regBirthError" role="alert" ${error?'':'hidden'}>${esc(error||'')}</p></div>`;}
function regDobCaption(p){return p.day&&regDobAllowed(p.year,p.month,p.day)?`${p.day} ${REG_MONTHS[p.month-1]} ${p.year}`:p.month?`${REG_MONTHS[p.month-1]} ${p.year}`:p.year?`ค.ศ. ${p.year}`:'ยังไม่ได้เลือกวันเกิด';}
function regDobValues(p,kind){const t=regToday();const max=kind==='year'?t.year:kind==='month'?(p.year===t.year?t.month:12):(p.year===t.year&&p.month===t.month?t.day:new Date(p.year,p.month,0).getDate()),start=kind==='year'?1900:1;return Array.from({length:max-start+1},(_,i)=>start+i);}
function regDobOptions(p,kind){return regDobValues(p,kind).map(n=>`<div class="reg-dob-option" id="dob-${kind}-${n}" role="option" aria-selected="${p[kind]===n}" data-dob-value="${n}">${kind==='month'?REG_MONTHS[n-1]:n}</div>`).join('');}
function regDobMarkup(p){return `<div class="reg-dob"><div class="reg-dob-wheel-labels" aria-hidden="true"><span>วัน</span><span>เดือน</span><span>ปี ค.ศ.</span></div><div class="reg-dob-wheels">${[['day','วันเกิด'],['month','เดือนเกิด'],['year','ปีเกิด ค.ศ.']].map(([kind,label])=>`<div class="reg-dob-wheel" data-dob-wheel="${kind}" role="listbox" tabindex="0" aria-label="${label}" aria-activedescendant="dob-${kind}-${p[kind]}">${regDobOptions(p,kind)}</div>`).join('')}</div><p class="sr" id="dobWheelStatus" role="status" aria-live="polite">${regDobCaption(p)}</p></div>`;}
TP.act('regDobOpen',()=>{const editing=TP.cur()?.id==='personaledit',p=regDobInit(editing?pfEditDraft(TP.S):regDraft(TP.S));TP.sheet('regdob',{picker:p,target:editing?'profile-edit':'registration'});});
function regDobState(ctx){return ctx.params.picker ||= regDobInit(regDraft(ctx.S),ctx.state);}
function regDobCommit(S,p,target){if(!regDobAllowed(p.year,p.month,p.day))return false;const d=target==='profile-edit'?pfEditDraft(S):regDraft(S);Object.assign(d,{year:String(p.year),month:String(p.month),day:String(p.day)});if(target!=='profile-edit')d.consents={};delete d.errors.day;delete d.errors.month;delete d.errors.year;return true;}
TP.sheetDef('regdob',{group:'start',title:'วันเดือนปีเกิด (ค.ศ)',hidden:true,host:'profile',cls:'reg-dob-sheet',hideClose:true,states:[['years','ล้อหมุนวัน เดือน ปี ค.ศ.'],['months','เลื่อนเลือกเดือน'],['days','เลื่อนเลือกวัน'],['selected','วันเกิดเดิมที่เลือกไว้'],['leap','กุมภาพันธ์ปีอธิกสุรทิน'],['future','เลือกได้ถึงวันนี้'],['oldest','ปีเก่าสุด 1900']],notes:['ล้อหมุนวัน เดือน ปี ค.ศ. ในแผ่นเลื่อนจากขอบล่าง ไม่มีช่องพิมพ์','เลื่อน แตะรายการ หรือใช้ลูกศรเพื่อเลือก แล้วกดยืนยันเพื่อเติมฟอร์ม','ปรับจำนวนวันตามเดือนและปีอธิกสุรทิน เลือกได้ไม่เกินวันนี้','ปิดก่อนยืนยันคงวันเดิม ไม่บันทึกวันที่เริ่มต้นให้เอง'],render(ctx){return regDobMarkup(regDobState(ctx));},foot(){return '<button type="button" class="btn primary" id="regDobApply">ยืนยัน</button>';},mount(el,ctx){
const p=regDobState(ctx),wheels={},tickets={day:0,month:0,year:0},apply=$('#regDobApply',el);let completing=false;
const rowHeight=wheel=>wheel.firstElementChild?.offsetHeight||44;
const position=kind=>{const wheel=wheels[kind],values=regDobValues(p,kind);wheel.scrollTop=values.indexOf(p[kind])*rowHeight(wheel);};
const mark=()=>{for(const kind of ['day','month','year']){const wheel=wheels[kind];wheel.setAttribute('aria-activedescendant',`dob-${kind}-${p[kind]}`);for(const option of wheel.children)option.setAttribute('aria-selected',String(+option.dataset.dobValue===p[kind]));}const status=$('#dobWheelStatus',el);if(status)status.textContent=regDobCaption(p);};
const update=(kind,value)=>{if(p[kind]===value)return;if(!regDobPick(p,kind,value))return;for(const dep of kind==='year'?['month','day']:kind==='month'?['day']:[]){tickets[dep]++;wheels[dep].innerHTML=regDobOptions(p,dep);position(dep);}mark();};
const settle=kind=>{const wheel=wheels[kind],values=regDobValues(p,kind),index=Math.max(0,Math.min(values.length-1,Math.round(wheel.scrollTop/rowHeight(wheel))));update(kind,values[index]);};
for(const kind of ['day','month','year'])wheels[kind]=$(`[data-dob-wheel="${kind}"]`,el);
for(const kind of ['day','month','year']){const wheel=wheels[kind];position(kind);
wheel.addEventListener('scroll',()=>{const ticket=++tickets[kind];ctx.later(()=>{if(ticket===tickets[kind]&&!completing)settle(kind);},120);},{passive:true});
wheel.addEventListener('click',e=>{const option=e.target.closest('[data-dob-value]');if(!option||!wheel.contains(option))return;tickets[kind]++;update(kind,+option.dataset.dobValue);position(kind);wheel.focus({preventScroll:true});});
wheel.addEventListener('keydown',e=>{const values=regDobValues(p,kind);let index=values.indexOf(p[kind]);if(e.key==='ArrowDown'||e.key==='ArrowRight')index++;else if(e.key==='ArrowUp'||e.key==='ArrowLeft')index--;else if(e.key==='PageDown')index+=10;else if(e.key==='PageUp')index-=10;else if(e.key==='Home')index=0;else if(e.key==='End')index=values.length-1;else return;e.preventDefault();tickets[kind]++;update(kind,values[Math.max(0,Math.min(values.length-1,index))]);position(kind);});}
mark();ctx.later(()=>{for(const kind of ['day','month','year'])position(kind);wheels.day.focus({preventScroll:true});},80);
apply.addEventListener('click',async()=>{if(completing)return;for(const kind of ['year','month','day'])settle(kind);if(!regDobCommit(ctx.S,p,ctx.params.target))return;completing=true;apply.disabled=true;await TP.closeSheet();await TP.refresh({anim:false});$('#regBirth',TP.cur()?.el)?.focus({preventScroll:true});TP.live('เลือกวันเกิด '+regDobCaption(p)+' แล้ว');});
}});

function regFileSize(size){return size>=1024*1024?`${(size/(1024*1024)).toFixed(1)} MB`:`${Math.max(1,Math.ceil(size/1024))} KB`;}
function regDocumentBatch(existing,files){const allowed=['image/jpeg','image/png','image/webp','application/pdf'];if(files.some(f=>!allowed.includes(f.type)))return {error:'ไฟล์นี้ไม่รองรับ เลือก JPG, PNG, WEBP หรือ PDF'};if(files.some(f=>f.size>5*1024*1024))return {error:'ไฟล์ใหญ่เกิน 5 MB กรุณาลดขนาดแล้วลองใหม่'};const added=[];for(const f of files)if(![...existing,...added].some(x=>x.name===f.name&&x.size===f.size&&x.type===f.type))added.push(f);if(existing.length+added.length>5)return {error:'แนบได้สูงสุด 5 ไฟล์ นำไฟล์เดิมออกก่อนเพิ่มไฟล์ใหม่'};return {added};}
function regDocumentList(d,editable=false){return `<ul class="reg-documents${editable?'':' is-review'}" aria-label="เอกสารที่แนบ">${d.documents.map((x,n)=>`<li><span class="reg-document-preview">${x.type.startsWith('image/')&&x.url?`<img src="${esc(x.url)}" alt="" loading="lazy">`:`${ic('file-text',26,1.7)}<small>PDF</small>`}</span><span class="reg-document-info"><b>${esc(x.name)}</b><small>${x.type==='application/pdf'?'PDF':'รูปภาพ'} · ${regFileSize(x.size)}</small><span class="reg-document-ready">${ic('check',14,2)}แนบแล้ว</span></span>${editable?`<button type="button" class="ibtn reg-document-remove" data-reg-doc-remove="${n}" aria-label="นำเอกสาร ${esc(x.name)} ออก">${ic('x',18,2)}</button>`:''}</li>`).join('')}</ul>`;}
function regDocumentBlock(d){const full=d.documents.length>=5;return `<section class="reg-health-block reg-document-block"><div class="reg-section-head"><h3>เอกสารการแพ้ยา <span class="opt-t">(ไม่บังคับ)</span></h3><span class="reg-document-count">${d.documents.length}/5</span></div>${full?`<p class="reg-upload-limit">${ic('circle-check',18,1.8)}แนบครบ 5 ไฟล์แล้ว</p>`:`<label class="reg-upload" for="regDocs"><span class="reg-upload-icon">${ic('upload',26,1.8)}</span><b>${d.documents.length?'เพิ่มเอกสาร':'แนบรูปบัตรแพ้ยา หรือเอกสาร'}</b><small id="regDocsHint">JPG, PNG, WEBP หรือ PDF<br>ไม่เกิน 5 MB ต่อไฟล์ · สูงสุด 5 ไฟล์</small><span class="reg-upload-action">${ic('plus',16,2)}เลือกไฟล์</span></label>`}<input type="file" id="regDocs" class="sr" multiple accept="image/jpeg,image/png,image/webp,application/pdf" aria-label="แนบเอกสารการแพ้ยา" aria-describedby="${full?'regDocError':'regDocsHint regDocError'}" ${full?'disabled':''}>${regDocumentList(d,true)}<p class="err-t" id="regDocError" role="alert" ${d.docError?'':'hidden'}>${esc(d.docError||'')}</p></section>`;}
function regPasswordFields(d){
  const input=(key,label,description='')=>`<div class="field${d.errors[key]?' err':''}" data-reg-field="${key}">
    <label for="reg-${key}">${label} <span class="reg-required" aria-hidden="true">*</span></label>
    <div class="reg-password-input">
      <input class="input" id="reg-${key}" data-reg-input="${key}" type="password" autocomplete="new-password" required aria-invalid="${!!d.errors[key]}" aria-describedby="${description}reg-${key}-error">
      <button type="button" class="reg-password-toggle" data-reg-password-toggle aria-controls="reg-${key}" aria-label="แสดง${key==='password'?'รหัสผ่าน':'รหัสผ่านยืนยัน'}">
        ${ic('eye',20,1.8)}
      </button>
    </div>
    <p class="err-t" id="reg-${key}-error" role="alert" ${d.errors[key]?'':'hidden'}>${esc(d.errors[key]||'')}</p>
  </div>`;
  return `<section class="reg-password" aria-labelledby="regPasswordTitle">
    <h3 id="regPasswordTitle">ตั้งรหัสผ่าน</h3>
    ${input('password','รหัสผ่าน','regPasswordRules ')}
    <ul id="regPasswordRules">${REG_PASSWORD_RULES.map(([label,check],index)=>`<li data-reg-password-rule="${index}">
      <span aria-hidden="true" class="reg-rule-mark"></span><span>${label}<span class="reg-rule-status"> ${check(d.password||'')?'ผ่านแล้ว':'ยังไม่ผ่าน'}</span></span>
    </li>`).join('')}</ul>
    ${input('passwordConfirm','ยืนยันรหัสผ่าน')}
  </section>`;
}
function regPersonalFields(d,{personalEdit=false}={}){return `<div class="reg-name-fields">${regField(d,'first','ชื่อ',{ac:'given-name',max:50})}${regField(d,'last','นามสกุล',{ac:'family-name',max:50})}</div>${personalEdit?`<div class="field"><label class="f-l" for="reg-nationalId">เลขบัตรประชาชน</label><input class="input" id="reg-nationalId" value="${esc(d.nationalId)}" disabled></div>`:regField(d,'nationalId','เลขบัตรประชาชน',{numeric:true,max:13})}${regDobField(d)}<fieldset class="reg-sex"><legend>เพศ <span class="opt-t">(ไม่บังคับ)</span></legend><div class="reg-sex-options">${SEXES.map(([value,label])=>`<label><input type="radio" name="regSex" value="${value}" data-reg-sex ${d.sex===value?'checked':''}><span>${label}</span></label>`).join('')}</div></fieldset>${personalEdit?'':`<div class="reg-grid">${regField(d,'weight','น้ำหนัก (กก.)',{numeric:true,decimal:true,max:6})}${regField(d,'height','ส่วนสูง (ซม.)',{numeric:true,decimal:true,max:6})}</div>`}`;}
/* Personal information editor reuses the registration field components. */
function pfEditDraft(S){if(S._profileEdit)return S._profileEdit;const u=S.user,[year='',month='',day='']=String(u.birthDate||'').split('-'),[first='',...last]=String(u.full||'').split(' ');return S._profileEdit={first:u.name||first,last:u.last||last.join(' '),nationalId:u.nationalId||'',year:year||String(u.birthYear||u.born||''),month,day,sex:u.sex||'none',weight:String(u.weight??''),height:String(u.height??''),errors:{},busy:false};}
function pfEditErrors(d){/* account edit: ID is locked, measurements live in C505, the password is set at sign-up only */const {nationalId,weight,height,password,passwordConfirm,...errors}=regErrors(d,0);return errors;}
function pfEditRender(ctx){
 const d=pfEditDraft(ctx.S),u=ctx.S.user,phone=digits(u.phone||''),contact=u.phone?(phone.length===10?`${phone.slice(0,3)}-${phone.slice(3,6)}-${phone.slice(6)}`:phone):u.email;
 return ui.nav({title:'ข้อมูลส่วนตัว',left:`<button type="button" class="back" data-a="pfEditCancel">${ic('chevron-left',22,2.2)}<span>กลับ</span></button>`})+ui.page(`<div class="registration-page">${contact?`<div class="field"><label class="f-l" for="pfAccountContact">${u.phone?'เบอร์โทรในบัญชี':'อีเมลในบัญชี'}</label><input class="input" id="pfAccountContact" type="${u.phone?'tel':'email'}" value="${esc(contact)}" disabled aria-describedby="pfAccountContactHint"><p class="hint" id="pfAccountContactHint">เปลี่ยนข้อมูลติดต่อได้ที่ฝ่ายบริการลูกค้า</p></div>`:''}${regPersonalFields(d,{personalEdit:true})}</div>`,{cls:'profile-edit-scroll'})+ui.dock(`<div class="reg-nav-actions">${ui.btn('ยกเลิก',{a:'pfEditCancel',kind:'secondary'})}${ui.btn('บันทึกข้อมูล',{a:'pfEditSave',id:'pfEditSave',disabled:!!Object.keys(pfEditErrors(d)).length||d.busy})}</div>`);
}
function pfEditMount(el,ctx){const d=pfEditDraft(ctx.S),button=$('#pfEditSave',el);el.addEventListener('input',e=>{const key=e.target.dataset?.regInput;if(!['first','last'].includes(key))return;d[key]=key==='nationalId'?regIdDigits(e.target.value):e.target.value;if(key==='nationalId')e.target.value=d[key];const error=pfEditErrors(d)[key],field=e.target.closest('[data-reg-field]');if(d.errors[key]||field?.dataset.touched){d.errors[key]=error||'';if(field){field.classList.toggle('err',!!error);e.target.setAttribute('aria-invalid',String(!!error));const message=$('#reg-'+key+'-error',el);message.hidden=!error;message.textContent=error||'';}}button.disabled=!!Object.keys(pfEditErrors(d)).length||d.busy;});el.addEventListener('focusout',e=>{const key=e.target.dataset?.regInput;if(!['first','last'].includes(key))return;const field=e.target.closest('[data-reg-field]');if(field)field.dataset.touched='1';const error=pfEditErrors(d)[key];d.errors[key]=error||'';e.target.setAttribute('aria-invalid',String(!!error));field?.classList.toggle('err',!!error);const message=$('#reg-'+key+'-error',el);if(message){message.hidden=!error;message.textContent=error||'';}});el.addEventListener('change',e=>{if(e.target.matches?.('[data-reg-sex]'))d.sex=e.target.value;});}
/* C520 personal details from the account (moved out of C105, 8 Nov 2026). ID and contact stay locked; weight/height live in C505. */
TP.screen('personaledit', {
  group: 'account', title: 'แก้ไขข้อมูลส่วนตัว', code: 'C520', parent: 'account',
  states: [['normal', 'แก้ไขข้อมูลส่วนตัว'], ['invalid', 'ข้อมูลไม่ครบ']],
  notes: ['เปิดจากบัญชี C501 › ข้อมูลส่วนตัว แก้ชื่อ นามสกุล วันเกิด เพศ เลขประชาชนและข้อมูลติดต่อปิดแก้ไข น้ำหนักและส่วนสูงแก้ใน C505', 'ข้อมูลไม่ครบ ปุ่มบันทึกปิดและแสดงข้อผิดพลาดข้างช่อง ยกเลิกไม่เขียนข้อมูล'],
  prep(S) { S._profileEdit = null; if (S.st.personaledit === 'invalid') { const d = pfEditDraft(S); d.first = ''; d.errors = pfEditErrors(d); } },
  render(ctx) { return pfEditRender(ctx); },
  mount(el, ctx) { return pfEditMount(el, ctx); }
});
TP.act('pfEditCancel',()=>{if(TP.S._profileEdit?.busy)return;TP.S._profileEdit=null;return TP.back();});
TP.act('pfEditSave',async()=>{const S=TP.S,d=pfEditDraft(S),entry=TP.cur();if(d.busy||entry?.id!=='personaledit')return;d.errors=pfEditErrors(d);if(Object.keys(d.errors).length){await TP.refresh({anim:false});$('[aria-invalid="true"]',TP.cur()?.el)?.focus();return;}d.busy=true;const first=d.first.trim(),last=d.last.trim();Object.assign(S.user,{name:first,last,full:first+' '+last,birthDate:`${d.year}-${d.month.padStart(2,'0')}-${d.day.padStart(2,'0')}`,birthYear:+d.year,born:d.year,age:regAge(d),sex:d.sex});S._profileEdit=null;TP.emit('state');await TP.back();TP.notify('บันทึกข้อมูลส่วนตัวแล้ว');});

function regRender(ctx){const d=regInitContact(ctx),c=regContact(ctx),step=d.step;d.directEmail=!d.emailLocked;let body='';if(step===0){body=`<p class="reg-help">กรอกช่องที่มีเครื่องหมาย * ให้ครบ ช่องที่ระบุว่าไม่บังคับเว้นได้</p>${regContactFields(d)}${regPersonalFields(d)}${regPasswordFields(d)}`;}
if(step===1){regAddressContact(d,c);body=`<p class="reg-help">กรอกข้อมูลติดต่อและที่อยู่ปัจจุบันในช่องที่มี * ให้ครบ</p><div class="reg-name-fields">${regField(d,'addressFirst','ชื่อ',{ac:'given-name',max:50,placeholder:'ชื่อผู้ติดต่อ'})}${regField(d,'addressLast','นามสกุล',{ac:'family-name',max:50,placeholder:'นามสกุลผู้ติดต่อ'})}</div>${regField(d,'addressPhone','เบอร์โทรศัพท์มือถือ',{numeric:true,max:10,ac:'tel-national',placeholder:'เช่น 0812345678'})}${regField(d,'house','บ้านเลขที่',{ac:'address-line1',max:200})}${regField(d,'building','หมู่บ้าน / อาคาร / ห้อง / ชั้น',{optional:true,ac:'address-line2',max:200})}${regField(d,'alley','ซอย',{optional:true,max:100})}${regField(d,'road','ถนน',{optional:true,max:100})}${/ซอย|ถนน|หมู่บ้าน|อาคาร|ชั้น|ห้อง/.test(d.house||'')?'<p class="hint">ข้อมูลเดิมยังอยู่ครบในช่องบ้านเลขที่ กรุณาตรวจและแยกลงช่องที่ตรงกัน</p>':''}${TP.addressAreaField(d,d.errors)}<div class="address-native-fields">${regAddressSelect(d,'prov','จังหวัด')}${regAddressSelect(d,'amp','อำเภอ / เขต')}${regAddressSelect(d,'dist','ตำบล / แขวง')}</div>${regField(d,'zip','รหัสไปรษณีย์',{numeric:true,max:5,readonly:true,placeholder:'ระบบจะเติมให้เมื่อเลือกตำบล'})}<p class="hint" id="regAddressLoadStatus" role="status">กำลังโหลดจังหวัดและพื้นที่</p><button type="button" class="txtbtn" id="regAddressRetry" hidden>โหลดข้อมูลที่อยู่อีกครั้ง</button>${TP.addressPinField('openRegDeliveryPin',regDeliveryAddress(d).location)}`;}


if(step===2)body=`<p class="reg-help">ข้อมูลของคุณช่วยให้เภสัชกรตรวจสอบความเหมาะสมของยา เลือก “ยังไม่ทราบ” ได้หากไม่แน่ใจ</p>${[['conditions','โรคประจำตัว'],['meds','ยาที่ใช้ประจำ'],['allergies','ประวัติการแพ้ยา']].map(([k,t])=>regHealthBlock(d,k,t)).join('')}${regHealthBlock(d,'food','ประวัติแพ้อาหาร')}${regDocumentBlock(d)}`;
if(step===3)body=`<p class="reg-help">ตรวจสอบข้อมูลก่อนสมัคร หากต้องการแก้ไข แตะ “แก้ไข” ในแต่ละส่วน</p>${regReview(ctx,d)}<section class="reg-consent-choices" aria-label="การรับทราบและความยินยอม"><div class="reg-consent-single"><input type="checkbox" id="regNoticeAck" required aria-required="true" aria-labelledby="regNoticeAckLabel" ${regNoticeAccepted(d)?'checked':''}><div><label id="regNoticeAckLabel" for="regNoticeAck"><span class="reg-required" aria-hidden="true">*</span> ข้าพเจ้าได้อ่านและเข้าใจคำประกาศความเป็นส่วนตัว (Privacy Notice) ของบริษัท ซึ่งมีรายละเอียดเกี่ยวกับการคุ้มครองข้อมูลส่วนบุคคลและสิทธิของเจ้าของข้อมูลส่วนบุคคลของข้าพเจ้าตามกฎหมายแล้ว</label> <button type="button" class="reg-consent-link" data-a="stDoc" data-v="terms" aria-haspopup="dialog">อ่านข้อตกลงและนโยบาย</button></div></div><div class="reg-consent-single"><input type="checkbox" id="regHealthConsent" required aria-required="true" aria-labelledby="regHealthConsentLabel" ${regConsentAccepted(d)?'checked':''}><div><label id="regHealthConsentLabel" for="regHealthConsent"><span class="reg-required" aria-hidden="true">*</span> ข้าพเจ้ายินยอมให้บริษัท มิตรอารีแคร์ จำกัด เก็บรวบรวม ใช้ และเปิดเผยข้อมูลสุขภาพของข้าพเจ้า เพื่อบริการเภสัชกรรมตามขอบเขตที่แจ้ง</label> <button type="button" class="reg-consent-link" data-sheet="registrationconsent" aria-haspopup="dialog" aria-label="อ่านความยินยอมข้อมูลสุขภาพ">อ่านเพิ่มเติม</button></div></div><button type="button" class="reg-consent-link reg-policy-index-link" data-a="stDoc" data-v="all" aria-haspopup="dialog">ดูข้อตกลงและนโยบายทั้งหมด</button></section>`;

const enabled=step===3?regCanSubmit(d):!d.busy;
return ui.nav({title:'สมัครสมาชิก',left:step===0?'':'<button type="button" class="ibtn" data-a="regBack" aria-label="ย้อนกลับ">'+ic('arrow-left',22)+'</button>',right:step===0?'<button type="button" class="txtbtn" data-a="regCancel">ยกเลิก</button>':''})+regProgress(d)+ui.page(`<div class="registration-page">${d.submitError?ui.note(d.submitError,{tone:'warn',icon:'circle-alert'}):''}${body}</div>`,{cls:'registration-scroll'})+ui.dock(`<div class="reg-nav-actions${step===0?' single':step===3?' review':''}">${step>0?`<button type="button" class="btn secondary" data-a="regBack" ${d.busy?'disabled':''}>${ic('chevron-left',20,2)}ย้อนกลับ</button>`:''}<button type="button" class="btn primary" id="regNext" data-a="regNext" ${enabled?'':'disabled'}>${d.busy?'กำลังบันทึก…':step===3?'ยืนยันและสมัครสมาชิก':'ถัดไป'}${ic('arrow-right',20,2)}</button></div>`,{});}
TP.act('regHealthMode',t=>{const d=regDraft(TP.S),key=t.closest('[data-segname]').dataset.segname.replace('regMode-',''),h=d.health[key];h.mode=t.dataset.v;if(h.mode!=='set'){h.items=[];h.other=false;h.otherText='';}d.consents={};TP.refresh({anim:false});});
TP.act('regSex',t=>{const d=regDraft(TP.S);d.sex=t.dataset.v;d.consents={};});
function regSetHealthConsent(d,on){d.consents=on?Object.fromEntries(REG_TOPICS.map(([key])=>[key,true])):{};d.healthConsentVersion=on?REG_HEALTH_POLICY.version:null;}
TP.act('regNoticeAck',t=>{regDraft(TP.S).noticeAckVersion=t.getAttribute('aria-checked')==='true'?REG_NOTICE_POLICY.version:null;TP.cur()?.el?._regSync?.();});
TP.act('regHealthConsent',t=>{regSetHealthConsent(regDraft(TP.S),t.getAttribute('aria-checked')==='true');TP.cur()?.el?._regSync?.();});
TP.act('regBack',()=>{const d=regDraft(TP.S);if(d.busy)return;if(d.step>0){d.step--;d.returnToReview=false;d.errors={};return TP.refresh({anim:false});}return TP.sheet('registrationexit');});
TP.act('regCancel',()=>{const c=TP.cur();if(c?.id!=='profile'||regDraft(TP.S).busy)return;return TP.sheet('registrationexit');});
TP.act('regDiscard',async()=>{const c=TP.cur();if(c?.id!=='profile'||regDraft(TP.S).busy)return;for(const f of regDraft(TP.S).documents)if(f.url?.startsWith('blob:'))URL.revokeObjectURL(f.url);await TP.closeSheet();authNewAccount(TP.S,'email','');Object.assign(TP.S,{loggedIn:false,newAccount:false,consent:false,consentVer:0,_registration:null,_registrationComplete:false,_authFlows:{},_pf:null});TP.emit('state');await TP.go('login',{root:true});});
TP.sheetDef('registrationexit',{group:'start',title:'ออกจากการสมัครสมาชิก?',code:'C106',host:'profile',hideClose:true,states:[['normal','ยืนยันก่อนออก']],notes:['ขั้นแรกมีลิงก์ยกเลิกมุมขวาบน ขั้น 2–4 ย้อนกลับได้จากหัวหน้าหรือปุ่มท้ายหน้า','กรอกต่อหรือปิดแผ่นนี้คงค่าที่กรอกไว้ทุกขั้น','ยืนยันออกจะทิ้งร่างและกลับหน้าเลือกช่องทาง ไม่สร้างบัญชีหรือยินยอมแทน'],render(){return '<p class="body">ข้อมูลที่กรอกยังไม่ได้บันทึก หากออกตอนนี้จะต้องเริ่มกรอกใหม่เมื่อกลับมาสมัครอีกครั้ง</p>';},foot(){return ui.btn('กรอกต่อ',{closeSheet:true})+ui.btn('ออกจากการสมัคร',{kind:'secondary',a:'regDiscard'});}});

TP.act('regNext',async t=>{const ctx=TP.cur()?.ctx;if(!ctx)return;const d=regInitContact(ctx);regReadInputs(TP.cur().el,d);d.errors=regErrors(d);if(Object.keys(d.errors).length){await TP.refresh({anim:false});const key=Object.keys(d.errors)[0],root=TP.cur()?.el;const input=(key==='phone'&&regPhoneValid(d.phone)?$('#reg-phone-code',root)||$('#regPhoneSend',root):null)||(['prov','amp','dist'].includes(key)?$('.address-area-open',root):null)||$('#reg-'+key,root)||$('#regBirth',root);input?.scrollIntoView?.({block:'center'});input?.focus?.();return;}if(d.step<3){if(d.step===0)regAddressContact(d,regContact(ctx));d.step=d.returnToReview?3:d.step+1;d.returnToReview=false;return TP.refresh({anim:false});}if(!regCanSubmit(d)||t.disabled)return;d.busy=true;t.disabled=true;t.setAttribute('aria-busy','true');try{await TP.registrationService.save(TP.S,d,regContact(ctx));d.busy=false;delete d.password;delete d.passwordConfirm;await TP.go('registrationsuccess',{root:true});}catch{d.busy=false;d.submitError='บันทึกข้อมูลไม่สำเร็จ ข้อมูลที่กรอกยังอยู่ ลองอีกครั้งได้';TP.refresh({anim:false});}});
/* Local prototype adapter; production must replace this with authenticated, server-validated storage. */
TP.registrationService={async save(S,d,contact){if(!regCanSubmit({...d,busy:false}))throw Error('Invalid registration');if(S.st.profile==='save-error')throw Error('Preview failure');const first=d.first.trim(),last=d.last.trim();TP.freshAccount(S);const address=regDeliveryAddress(d);S.addrs=[{id:'a1',...address,main:true}];S.deliveryAddressId=null;S.branchPicked=false;Object.assign(S.user,{name:first,last,full:first+' '+last,nationalId:d.nationalId,identityAddress:address,birthDate:`${d.year}-${d.month.padStart(2,'0')}-${d.day.padStart(2,'0')}`,birthYear:+d.year,born:d.year,age:regAge(d),sex:d.sex,weight:d.weight,height:d.height,conditions:regHealthValues(d.health.conditions),condNone:d.health.conditions.mode==='none',conditionState:d.health.conditions.mode,meds:regHealthValues(d.health.meds),medState:d.health.meds.mode,allergies:regHealthValues(d.health.allergies),allergyState:d.health.allergies.mode==='set'?'set':d.health.allergies.mode,allergySrc:'ผู้ใช้ระบุ · รอเภสัชกรตรวจสอบ',food:regHealthValues(d.health.food).join(', '),foodNone:d.health.food.mode==='none',foodState:d.health.food.mode,allergyDocuments:d.documents.map(({name,size,type})=>({name,size,type}))});S.user[contact.channel==='email'?'email':'phone']=contact.value;if(d.contactInitialized)Object.assign(S.user,{email:d.email.trim(),phone:d.verifiedPhone,phoneVerifiedAt:d.phoneVerifiedAt,registrationProvider:d.emailProvider});Object.assign(S,{consent:true,consentVer:CN_VER,consentTopics:{...d.consents},healthConsentRecord:{documentVersion:REG_HEALTH_POLICY.version,controller:REG_HEALTH_POLICY.controller,purpose:'pharmaceutical-care',acceptedAt:new Date().toISOString(),method:'registration-checkbox',categories:REG_TOPICS.map(([key])=>key),prototype:true},noticeAckRecord:{documentVersion:REG_NOTICE_POLICY.version,documents:[...REG_NOTICE_POLICY.documents],acknowledgedAt:new Date().toISOString(),method:'registration-checkbox',prototype:true},firstTime:false,newAccount:false,loggedIn:true});S._registrationComplete=true;TP.emit('state');}};
TP.thaiAddressData={rows:null,pending:null,async load(){if(this.rows)return this.rows;if(!this.pending)this.pending=fetch('/assets/data/thailand/addresses.json').then(r=>{if(!r.ok)throw Error('Address data');return r.json();}).then(rows=>this.rows=rows).catch(e=>{this.pending=null;throw e;});return this.pending;},search(rows,key,query){const mapped={dist:'district',amp:'amphoe',prov:'province',zip:'zipcode'}[key],q=query.trim();if(!q||(!mapped&&key!=='all'))return [];const fields=mapped?[mapped]:['district','amphoe','province','zipcode'],terms=q.split(/[\s\u00b7]+/).filter(Boolean);return rows.filter(r=>terms.every(term=>fields.some(k=>String(r[k]).includes(term)))).sort((a,b)=>Number(fields.some(k=>String(b[k])===q))-Number(fields.some(k=>String(a[k])===q))).slice(0,12);}};
function regMount(el,ctx){const d=regDraft(ctx.S),go=$('#regNext',el);const progress=$(':scope>.reg-progress',el);if(progress){const measure=()=>el.style.setProperty('--reg-progress-height',progress.offsetHeight+'px');measure();if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(measure);observer.observe(progress);ctx.onLeave(()=>observer.disconnect());}}const passwordRules=$$('[data-reg-password-rule]',el);
for(const toggle of $$('[data-reg-password-toggle]',el)){
  const input=$('#'+toggle.getAttribute('aria-controls'),el);
  const label=input.id==='reg-password'?'รหัสผ่าน':'รหัสผ่านยืนยัน';
  toggle.addEventListener('click',()=>{
    const reveal=input.type==='password';
    input.type=reveal?'text':'password';
    toggle.setAttribute('aria-label',(reveal?'ซ่อน':'แสดง')+label);
    toggle.innerHTML=ic(reveal?'eye-off':'eye',20,1.8);
  });
}
const syncPassword=()=>passwordRules.forEach((row,index)=>{
  const passed=REG_PASSWORD_RULES[index][1](d.password||'');
  row.classList.toggle('is-passed',passed);
  $('.reg-rule-status',row).textContent=passed?' ผ่านแล้ว':' ยังไม่ผ่าน';
});
syncPassword();
const sync=()=>{go.disabled=d.step===3?!regCanSubmit(d):!!d.busy;go.setAttribute('aria-disabled',String(go.disabled));};el._regSync=sync;
$('#regHealthConsent',el)?.addEventListener('change',e=>{regSetHealthConsent(d,e.target.checked);sync();});$('#regNoticeAck',el)?.addEventListener('change',e=>{d.noticeAckVersion=e.target.checked?REG_NOTICE_POLICY.version:null;sync();});
const clearConsent=()=>{d.consents={};d.submitError='';};const errors=key=>{const validation=regErrors(d)[key]||'',input=$('#reg-'+key,el),msg=$('#reg-'+key+'-error',el);if(validation)d.errors[key]=validation;else delete d.errors[key];const e=regFieldError(d,key);if(!input||!msg)return;input.setAttribute('aria-invalid',String(!!e));input.closest?.('[data-reg-field]')?.classList.toggle('err',!!e);msg.hidden=!e;msg.textContent=e;};
$$('[data-reg-input]',el).forEach(input=>{const key=input.dataset.regInput;if(key==='password'||key==='passwordConfirm')input.value=d[key]||'';const update=()=>{if(input.readOnly)return;if(key==='phone'){const value=regPhoneDigits(input.value);if(value!==d.phone)regChangePhone(d);input.value=value;}if(key==='nationalId')input.value=regIdDigits(input.value);if(key==='addressPhone')input.value=regPhoneDigits(input.value);d[key]=input.value;clearConsent();if(d.errors[key])errors(key);if(key==='password'){syncPassword();if(d.passwordConfirm)errors('passwordConfirm');}if(key==='passwordConfirm'&&d.passwordConfirm)errors(key);if(['day','month','year'].includes(key))$('#regAge',el).textContent=regAge(d)!==null?`อายุ ${regAge(d)} ปี`:'กรอกวัน เดือน และปีเกิด ค.ศ. ให้ครบ';sync();const send=$('#regPhoneSend',el);if(send)send.disabled=d.phoneBusy||!regPhoneValid(d.phone);};input.addEventListener('input',update);input.addEventListener('change',update);input.addEventListener('blur',()=>errors(key));});
$$('[data-reg-sex]',el).forEach(input=>input.addEventListener('change',()=>{if(input.checked){d.sex=input.value;clearConsent();sync();}}));
if(d.step===0){
 const code=$('#reg-phone-code',el),verify=$('#regPhoneVerify',el),resend=$('#regPhoneResend',el),expiry=$('#regPhoneExpiry',el);
 const tick=()=>{const ch=d.phoneChallenge;if(!ch)return;const seconds=Math.max(0,Math.ceil((ch.expiresAt-Date.now())/1000)),wait=Math.max(0,Math.ceil((ch.resendAt-Date.now())/1000));if(expiry){expiry.hidden=!seconds;expiry.textContent=seconds?'รหัสใช้ได้อีก '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+' นาที':'';}if(resend){resend.hidden=seconds>0;resend.disabled=!!d.phoneBusy||wait>0;resend.textContent='ส่งรหัสใหม่';}if(verify)verify.disabled=!!d.phoneBusy||!/^\d{6}$/.test(d.phoneCode||'')||!seconds||ch.attempts>=5;};
 code?.addEventListener('input',()=>{d.phoneCode=code.value.replace(/[^0-9]/g,'').slice(0,6);code.value=d.phoneCode;tick();});
 code?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(!verify.disabled)verify.click();}});
 tick();if(d.phoneChallenge)ctx.every(tick,1000);
 if(d.focusPhoneCode){d.focusPhoneCode=false;ctx.later(()=>{code?.focus({preventScroll:true});code?.scrollIntoView({block:'center'});},0);}
}
if(d.step===1)regMountAddressSelect(el,d,sync,ctx);
const healthSync=key=>{clearConsent();const error=$('#regHealthError-'+key,el);if(error){const text=regErrors(d)[key]||'';if(text)d.errors[key]=text;else delete d.errors[key];error.textContent=text;error.hidden=!text;}sync();};
el.addEventListener('input',e=>{const textKey=e.target.dataset.regHealthText;if(REG_HEALTH_LABELS[textKey]){d.health[textKey].text=e.target.value;healthSync(textKey);e.target.setAttribute('aria-invalid',String(!!regErrors(d)[textKey]));return;}const key=e.target.dataset.regHealthOther;if(!REG_HEALTH_LABELS[key]||d.busy)return;d.health[key].otherText=e.target.value;healthSync(key);});

el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||d.busy)return;if(b.dataset.regStep!==undefined){d.step=+b.dataset.regStep;d.returnToReview=true;d.errors={};return TP.refresh({anim:false});}if(b.dataset.regMode){const h=d.health[b.dataset.regMode];h.mode=b.dataset.v;if(h.mode!=='set')h.items=[];clearConsent();return TP.refresh({anim:false});}const key=b.dataset.regPick||b.dataset.regAdd;if(key){const input=$('#reg-search-'+key,el),value=(b.dataset.regPick?b.dataset.v:input.value).trim();if(!value)return;const h=d.health[key];if(h.items.some(v=>v.toLocaleLowerCase()===value.toLocaleLowerCase()))return TP.live('มีรายการนี้แล้ว');h.items.push(value.slice(0,120));d.queries[key]='';h.mode='set';clearConsent();return TP.refresh({anim:false});}if(b.dataset.regRemove){d.health[b.dataset.regRemove].items.splice(+b.dataset.n,1);clearConsent();return TP.refresh({anim:false});}if(b.dataset.regDocRemove!==undefined){const removed=d.documents.splice(+b.dataset.regDocRemove,1)[0];if(removed?.url?.startsWith('blob:'))URL.revokeObjectURL(removed.url);clearConsent();return TP.refresh({anim:false});}});

$('#regDocs',el)?.addEventListener('change',e=>{const result=regDocumentBatch(d.documents,Array.from(e.target.files||[])),error=$('#regDocError',el);e.target.value='';if(result.error){error.hidden=false;error.textContent=d.docError=result.error;return;}d.docError='';if(result.added.length){for(const f of result.added)d.documents.push({name:f.name,size:f.size,type:f.type,url:URL.createObjectURL(f),file:f});clearConsent();}TP.refresh({anim:false});});sync();if(ctx.state?.startsWith('dob-'))ctx.later?.(()=>TP.sheet('regdob',{picker:regDobInit(d,ctx.state.slice(4))}),0);}
function regAddressPlacement(anchor,bounds,contentHeight){const gap=8,edge=8;if(anchor.bottom<bounds.top||anchor.top>bounds.bottom)return null;const width=Math.min(Math.max(anchor.width,280),Math.max(0,bounds.right-bounds.left-edge*2)),left=Math.max(bounds.left+edge,Math.min(anchor.left,bounds.right-edge-width));const below=Math.max(0,bounds.bottom-anchor.bottom-gap),above=Math.max(0,anchor.top-bounds.top-gap),up=below<160&&above>below,height=Math.min(260,contentHeight,up?above:below);if(height<44)return null;return {left,width,top:up?anchor.top-gap-height:anchor.bottom+gap,maxHeight:height,side:up?'above':'below'};}
function regMountAddress(el,d,sync,ctx){const list=$('#regAddressResults',el),status=$('#regAddressStatus',el),keys=['dist','amp','prov','zip'];let results=[],active=-1,currentInput=null,request=0;
el.append?.(list);
const place=()=>{if(list.hidden||!list.style||!currentInput?.getBoundingClientRect||!el.getBoundingClientRect)return;const screen=el.getBoundingClientRect(),scale=screen.width/el.clientWidth||1,scroller=$('.registration-scroll',el)||$('.scroll',el),viewport=scroller?.getBoundingClientRect()||screen,dock=$(':scope>.dock',el)?.getBoundingClientRect(),rect=currentInput.getBoundingClientRect();const anchor={left:(rect.left-screen.left)/scale,right:(rect.right-screen.left)/scale,top:(rect.top-screen.top)/scale,bottom:(rect.bottom-screen.top)/scale,width:rect.width/scale},bounds={left:(viewport.left-screen.left)/scale,right:(viewport.right-screen.left)/scale,top:(viewport.top-screen.top)/scale,bottom:(Math.min(viewport.bottom,dock?.top??viewport.bottom)-screen.top)/scale};const position=regAddressPlacement(anchor,bounds,list.scrollHeight||260);if(!position){close();return;}Object.assign(list.style,{left:position.left+'px',top:position.top+'px',width:position.width+'px',maxHeight:position.maxHeight+'px'});list.dataset.side=position.side;};
el.addEventListener('scroll',e=>{if(e.target!==list)place();},true);
el.addEventListener('pointerdown',e=>{if(currentInput&&e.target!==currentInput&&!list.contains(e.target))close();});
if(typeof window!=='undefined'){window.addEventListener('resize',place);ctx?.onLeave?.(()=>window.removeEventListener('resize',place));}
const close=()=>{request++;list.hidden=true;if(currentInput){currentInput.setAttribute('aria-expanded','false');currentInput.removeAttribute('aria-activedescendant');}active=-1;};const choose=n=>{const r=results[n];if(!r)return;Object.assign(d,{dist:r.district,amp:r.amphoe,prov:r.province,zip:String(r.zipcode),consents:{}});for(const k of keys){const input=$('#reg-'+k,el);input.value=d[k];input.setAttribute('aria-invalid','false');$('#reg-'+k+'-error',el).hidden=true;delete d.errors[k];}d.submitError='';const query=$('#reg-address-query',el);if(query){query.value=d.addressQuery=`${r.district} · ${r.amphoe} · ${r.province} ${r.zipcode}`;}close();status.textContent='เติมตำบล อำเภอ จังหวัด และรหัสไปรษณีย์แล้ว';sync();};
for(const key of ['all',...keys]){const input=$(key==='all'?'#reg-address-query':'#reg-'+key,el);if(!input)continue;const search=async()=>{if(currentInput&&currentInput!==input){currentInput.setAttribute('aria-expanded','false');currentInput.removeAttribute('aria-activedescendant');}currentInput=input;if(key==='all')d.addressQuery=input.value;const id=++request,q=input.value.trim();if(!q){close();return;}status.textContent='กำลังค้นหาที่อยู่…';try{if(ctxAddressError())throw Error('Preview failure');const rows=await TP.thaiAddressData.load();if(id!==request||!input.isConnected)return;results=TP.thaiAddressData.search(rows,key,q);active=-1;list.innerHTML=results.map((r,n)=>`<div role="option" id="regAddress-${n}" aria-selected="false" data-address-index="${n}"><b>${esc(r.district)} · ${esc(r.amphoe)}</b><small>${esc(r.province)} ${esc(r.zipcode)}</small></div>`).join('');list.hidden=!results.length;place();input.setAttribute('aria-expanded',String(!list.hidden));status.textContent=results.length?`พบ ${results.length} ผลลัพธ์ เลือกเพื่อเติมที่อยู่`:'ไม่พบที่อยู่ที่ตรงกัน กรอกเองได้';}catch{if(id!==request)return;close();status.textContent='โหลดตัวช่วยที่อยู่ไม่สำเร็จ ยังกรอกที่อยู่เองได้';}};input.addEventListener('input',search);input.addEventListener('focus',()=>{if(input.value)search();});if(key==='all'&&TP.S.st.profile==='address-search'&&input.value)search();input.addEventListener('keydown',e=>{if(e.key==='Escape'){close();return;}if(list.hidden)return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();active=(active+(e.key==='ArrowDown'?1:-1)+results.length)%results.length;$$('[role=option]',list).forEach((n,i)=>n.setAttribute('aria-selected',String(i===active)));input.setAttribute('aria-activedescendant','regAddress-'+active);$('#regAddress-'+active,list)?.scrollIntoView?.({block:'nearest'});}if(e.key==='Enter'&&active>=0){e.preventDefault();choose(active);}});}
list.addEventListener('pointerdown',e=>e.preventDefault());list.addEventListener('click',e=>{const option=e.target.closest('[data-address-index]');if(option)choose(+option.dataset.addressIndex);});el.addEventListener('focusout',()=>setTimeout(()=>{if(currentInput!==document.activeElement&&!list.contains(document.activeElement))close();},0));function ctxAddressError(){return TP.S.st.profile==='address-error';}}
/* Preview-only fixtures and command: never exported with the patient UI. */
const REG_PREVIEW_PASSWORD='Demo-Registration42!';
function regMockInputs(d){
  if(d.busy || ![0,1].includes(d.step))return false;
  if(d.step===0){
    const base='110170020345';let sum=0;for(let i=0;i<12;i++)sum+=(13-i)*+base[i];
    Object.assign(d,{email:d.email||'somjai@example.com',phone:'0812345678',verifiedPhone:'0812345678',phoneVerifiedAt:new Date().toISOString(),contactInitialized:true,first:'สมใจ',last:'ใจดี',nationalId:base+((11-sum%11)%10),password:REG_PREVIEW_PASSWORD,passwordConfirm:REG_PREVIEW_PASSWORD,day:'15',month:'6',year:'1988',sex:'f',weight:'55',height:'160'});
  }else Object.assign(d,{addressFirst:'สมใจ',addressLast:'ใจดี',addressPhone:'0812345678',house:'88/12',building:'',alley:'ซอยทวีวัฒนา',road:'',dist:'ทวีวัฒนา',amp:'ทวีวัฒนา',prov:'กรุงเทพมหานคร',zip:'10170'});
  d.errors={};d.submitError='';d.consents={};return true;
}
TP.registrationPreview={
  fillEmpty(ctx){
    const d=regDraft(ctx.S);if(d.busy)return false;
    const demo={...d,errors:{},consents:{}};if(!regMockInputs(demo))return false;
    const rows=TP.thaiAddressData?.rows;
    if(d.step===1&&rows){const row=rows.find(r=>r.province===(d.prov||demo.prov)&&(!d.amp||r.amphoe===d.amp)&&(!d.dist||r.district===d.dist));if(row)Object.assign(demo,{prov:row.province,amp:row.amphoe,dist:row.district,zip:String(row.zipcode)});}
    const keys=d.step===0?['email','phone','first','last','nationalId','day','month','year','weight','height',...(!d.password&&!d.passwordConfirm?['password','passwordConfirm']:[])]:['addressFirst','addressLast','addressPhone','house','building','alley','road',...(rows?['prov','amp','dist','zip']:[])];
    let changed=false;for(const key of keys)if(!String(d[key]??'').trim()){d[key]=demo[key];changed=true;}
    if(changed){d.errors={};TP.refresh({anim:false});}return true;
  },
  canFill(c){return c?.id==='profile' && !c.ctx.S._registration?.busy && [0,1].includes(c.ctx.S._registration?.step??0);},
  fillCurrent(){const c=TP.cur();if(TP.sheetOpen?.() || !this.canFill(c))return false;if(!regMockInputs(regDraft(c.ctx.S)))return false;TP.refresh({anim:false});return true;}
};
TP.previewSavedAddressPin=function(a){a.pin=true;a.location={lat:13.7585281507793,lng:100.358974455533,code:'104801',addressKey:[a.house,...(a.building?.trim()?[a.building]:[]),a.alley,a.road,a.dist,a.amp,a.prov,a.zip].map(v=>String(v||'').trim()).join('|'),verified:true,source:'DDPM',confirmedAt:new Date().toISOString()};};
function regPreview(S,state='empty'){const d=regDraft(S);if(state==='google-new'||state.startsWith('phone-')){regPreview(S,'filled');d.email='new.member@gmail.com';d.emailLocked=true;d.emailProvider='google';if(state==='google-new'){d.verifiedPhone='';d.phone='';}else{d.verifiedPhone='';if(['phone-sent','phone-wrong','phone-expired'].includes(state)){d.phoneRound=1;d.phoneChallenge=TP.authDemo.issue('phone',d.phone,1,S,'new');if(state==='phone-wrong'){d.phoneCode='000000';d.phoneError='รหัสไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';d.phoneChallenge.attempts=1;}if(state==='phone-expired'){d.phoneChallenge.expiresAt=Date.now()-1;d.phoneChallenge.resendAt=0;}}if(state==='phone-send-error')d.phoneError='ส่งรหัสไม่สำเร็จ กรุณาลองอีกครั้ง';}return;}if(state==='password-partial'||state==='password-mismatch'){regPreview(S,'filled');d.passwordConfirm=state==='password-mismatch'?'Different-Preview42!':'';if(state==='password-partial')d.password='Demo';d.errors=regErrors(d);return;}if(['address-split','address-legacy'].includes(state)){regPreview(S,'address');Object.assign(d,{house:'88/12',building:'หมู่บ้านมิตรอารี อาคารบี ห้อง 1201 ชั้น 12',alley:'ทวีวัฒนา 25',road:'เลียบคลองทวีวัฒนา'});if(state==='address-legacy')Object.assign(d,{house:'88/12 หมู่บ้านมิตรอารี ซอยทวีวัฒนา 25 ถนนเลียบคลองทวีวัฒนา',building:'',alley:'',road:''});d.errors=regErrors(d);return;}if(state.startsWith('map-')){regPreview(S,'address');d.pin=false;d.location=null;if(state==='map-saved')TP.previewSavedAddressPin(d);return;}if(['national-id-short','national-id-format','national-id-checksum'].includes(state)){regPreview(S,'filled');d.step=0;d.nationalId=state==='national-id-short'?'110170020345':state==='national-id-format'?'11017002034AB':'1101700203459';d.errors=regErrors(d);return;}if(['address-select','address-missing-phone','address-invalid-phone','health-text'].includes(state)){regPreview(S,state==='health-text'?'health':'address');if(state==='address-select')Object.assign(d,{prov:'',amp:'',dist:'',zip:''});if(state==='address-missing-phone')d.addressPhone='';if(state==='address-invalid-phone')d.addressPhone='0212345678';if(state==='health-text')for(const [key,h]of Object.entries(d.health))Object.assign(h,{mode:'set',text:'ข้อมูลตัวอย่าง '+REG_HEALTH_LABELS[key]});d.errors=regErrors(d);return;}if(['filled','registration-back','address','address-search','address-no-results','address-error','health','health-empty','health-filled','review','consent-partial','consent-ready','save-error','health-none','health-no-results','health-documents','health-doc-error'].includes(state)||state.startsWith('conditions-')||state==='health-all-other'||state==='health-doc-limit'){Object.assign(d,{email:d.email||'somjai@example.com',phone:'0812345678',verifiedPhone:'0812345678',phoneVerifiedAt:new Date().toISOString(),contactInitialized:true,first:'สมใจ',last:'ใจดี',nationalId:'1101700203450',password:REG_PREVIEW_PASSWORD,passwordConfirm:REG_PREVIEW_PASSWORD,day:'15',month:'6',year:'1988',weight:'55',height:'160',addressFirst:'สมใจ',addressLast:'ใจดี',addressPhone:'0812345678',house:'88/12',building:'',alley:'ซอยทวีวัฒนา',road:'',dist:'ทวีวัฒนา',amp:'ทวีวัฒนา',prov:'กรุงเทพมหานคร',zip:'10170'});const base=d.nationalId.slice(0,12);let sum=0;for(let i=0;i<12;i++)sum+=(13-i)*+base[i];d.nationalId=base+((11-sum%11)%10);}
if(state==='error')Object.assign(d,{first:'สมใจ',last:'ใจดี',nationalId:'123',day:'31',month:'2',year:'2025',weight:'0',height:'160',errors:{nationalId:'ตรวจสอบเลขบัตรประชาชน 13 หลัก',day:'วันที่นี้ไม่มีในปฏิทิน',weight:'กรอกน้ำหนักมากกว่า 0'}});
if(state.startsWith('address'))d.step=1;if(state==='address-no-results')d.dist='ตำบลตัวอย่างที่ไม่มี';if(state.startsWith('health'))d.step=2;if(state==='health-empty')d.health.meds.mode='set';if(state==='health-none')for(const h of Object.values(d.health))h.mode='none';if(state==='health-documents'||state==='health-doc-limit'){d.documents=[{name:'บัตรแพ้ยา-ตัวอย่าง.png',type:'image/png',size:248832,url:'/assets/preview/allergy-document.svg'},{name:'เอกสารประกอบ-ตัวอย่าง.pdf',type:'application/pdf',size:524288}];if(state==='health-doc-limit')for(let n=3;n<=5;n++)d.documents.push({name:`เอกสารตัวอย่าง-${n}.pdf`,type:'application/pdf',size:n*102400});}if(state==='health-doc-error')d.docError='ไฟล์นี้ไม่รองรับ กรุณาเลือก JPG, PNG, WEBP หรือ PDF ไม่เกิน 5 MB';if(['review','consent-ready','save-error'].includes(state))d.step=3;if(['consent-ready','save-error','consent-notice-only','consent-health-only'].includes(state))d.step=3;if(['consent-ready','save-error','consent-notice-only'].includes(state))d.noticeAckVersion=REG_NOTICE_POLICY.version;if(['consent-ready','save-error','consent-health-only'].includes(state)){d.consents=Object.fromEntries(REG_TOPICS.map(([k])=>[k,true]));d.healthConsentVersion=REG_HEALTH_POLICY.version;}if(state==='save-error')d.submitError='บันทึกข้อมูลไม่สำเร็จ ข้อมูลที่กรอกยังอยู่ ลองอีกครั้งได้';if(state==='review-documents'){regPreview(S,'health-documents');d.step=3;}if(state.startsWith('dob-')){regPreview(S,'filled');d.step=0;}}
TP.screen('registrationsuccess',{group:'start',title:'สมัครสมาชิกสำเร็จ',code:'C108',cls:'auth-cover-screen registration-welcome-screen',sb:'dark',states:[['normal','สมัครสำเร็จด้วยเบอร์โทร'], ['long-name','ชื่อจริงยาว', true, 4]],notes:['หน้าต้อนรับหลังบันทึกข้อมูล แสดงชื่อจริงและปุ่มเริ่มใช้งาน ไปแนะนำแอป C112','ระบบยืนยันและบันทึกยังเป็นต้นแบบ ไม่ได้ส่งข้อมูลจริง'],prep(S){S._registrationComplete=true;S.loggedIn=S._registrationComplete;Object.assign(S.user,{name:'สมใจ',full:'สมใจ ใจดี',email:'',phone:'0812345678'});if(S.st.registrationsuccess==='long-name')S.user.name='กาญจนาภัทรวรรณ';},render(ctx){const S=ctx.S;if(!S._registrationComplete)return ui.nav({title:'สมัครสมาชิก'})+ui.page(ui.empty({title:'ยังสมัครสมาชิกไม่เสร็จ',body:'กลับไปตรวจสอบข้อมูลและความยินยอม',icon:'clipboard-list',btn:{label:'กลับไปสมัคร',go:'profile'}}));return `<div class="auth-cover registration-welcome" aria-label="สมัครสมาชิกสำเร็จ"><img class="auth-cover-photo reg-welcome-cover" src="/assets/auth/registration-welcome-full-v3.png" alt="" width="864" height="1824" fetchpriority="high"><div class="auth-cover-content reg-welcome-copy"><div class="reg-welcome-message"><p class="reg-welcome-status">สมัครสมาชิกเรียบร้อยแล้ว</p><h1>ยินดีต้อนรับ${S.user.name?`<br><span>คุณ${esc(S.user.name)}</span>`:''}</h1><p class="auth-cover-subtitle">พร้อมให้เภสัชกรดูแลคุณแล้ว</p><div class="auth-cover-actions">${ui.btn('เริ่มใช้งาน',{go:'onboard',root:true,iconRight:'arrow-right'})}</div></div></div></div>`;}});

TP.screen('profile', {
  group: 'start', title: 'ข้อมูลของคุณและความยินยอม', code: 'C105', ref: 'C02', cls: 'st-cn',
  states: [['empty','สมัครใหม่: ยังไม่กรอก'], ['filled','กรอกข้อมูลส่วนตัวครบ'], ['google-new','Google สมาชิกใหม่ อีเมลแก้ไม่ได้'], ['phone-entry','กรอกเบอร์ ขอ SMS OTP'], ['phone-sent','ส่ง SMS แล้ว กรอกรหัสในฟอร์ม'], ['phone-wrong','รหัส OTP ไม่ถูกต้อง'], ['phone-expired','OTP หมดอายุ ขอใหม่ได้'], ['phone-send-error','ส่ง SMS ไม่สำเร็จ ลองอีกครั้ง'], ['national-id-short','เลขประชาชนไม่ครบ 13 หลัก'], ['national-id-format','เลขประชาชนมีตัวอักษร'], ['national-id-checksum','เลขประชาชนครบแต่เลขตรวจสอบผิด'], ['dob-future','วันเกิด: จำกัดถึงวันนี้'], ['password-partial','รหัสผ่านยังไม่ครบเงื่อนไข'], ['password-mismatch','รหัสผ่านยืนยันไม่ตรงกัน'], ['address','ขั้นที่อยู่ พร้อมค้นหาอัตโนมัติ'], ['address-select','เลือกจังหวัด อำเภอ ตำบล'], ['address-no-results','ค้นหาที่อยู่ไม่พบ กรอกเองได้'], ['address-error','ตัวช่วยที่อยู่โหลดไม่สำเร็จ'], ['address-missing-phone','ที่อยู่ยังไม่กรอกเบอร์'], ['address-invalid-phone','รูปแบบเบอร์ติดต่อไม่ถูกต้อง'], ['address-split','ที่อยู่แยกบ้านเลขที่ อาคาร ซอย ถนน'], ['address-legacy','ที่อยู่เดิมยังอยู่ครบ ไม่แยกอัตโนมัติ'], ['health','ขั้นข้อมูลสุขภาพ ยังไม่ทราบ'], ['health-empty','ระบุข้อมูลสุขภาพ แต่ยังไม่มีรายการ'], ['health-none','ไม่มีประวัติสุขภาพ โดยผู้ใช้เลือกเอง'], ['health-text','ระบุสุขภาพด้วยข้อความ'], ['health-documents','แนบเอกสารแพ้ยาแล้ว'], ['health-doc-error','ไฟล์แนบไม่ผ่านเงื่อนไข'], ['health-doc-limit','แนบเอกสารครบ 5 ไฟล์'], ['review','ตรวจทานและความยินยอม ยังไม่ติ๊ก'], ['review-documents','ตรวจทานไฟล์แนบ รูปย่อและชื่อไฟล์'], ['consent-ready','ติ๊กครบ 2 ช่อง พร้อมสมัคร'], ['save-error','บันทึกไม่สำเร็จ ข้อมูลยังอยู่'], ['consent-notice-only','รับทราบประกาศแล้ว ยังไม่ยินยอมสุขภาพ'], ['consent-health-only','ยินยอมสุขภาพแล้ว ยังไม่รับทราบประกาศ']],
  stateGroups: [
    {label:'ข้อมูลส่วนตัว',keys:['empty','filled','google-new','phone-entry','phone-sent','phone-wrong','phone-expired','phone-send-error','national-id-short','national-id-format','national-id-checksum','dob-future','password-partial','password-mismatch']},
    {label:'ที่อยู่',keys:['address','address-select','address-no-results','address-error','address-missing-phone','address-invalid-phone','address-split','address-legacy']},
    {label:'ข้อมูลสุขภาพ',keys:['health','health-empty','health-none','health-text','health-documents','health-doc-error','health-doc-limit']},
    {label:'ตรวจทานและยินยอม',keys:['review','review-documents','consent-notice-only','consent-health-only','consent-ready','save-error']}
  ],
  notes:['สมัครใหม่: ข้อมูลส่วนตัว → ที่อยู่ปัจจุบัน → สุขภาพ → ตรวจทานและยินยอม → C108 สมัครสำเร็จ ไม่มีหน้าไม่ยินยอม','สมัครสำเร็จแล้วตั้งที่อยู่ปัจจุบันเป็นที่อยู่หลัก หน้าแรก C201 จึงมีที่อยู่จัดส่งทันที ต้นแบบใช้ที่อยู่จำลองแทนค่าที่กรอก','เบอร์โทรยืนยันด้วย SMS OTP ในฟอร์ม (C105.4–.8) อีเมลไม่มีการยืนยันตัวตน สมัครด้วย Google ใช้อีเมลจาก Google แก้ไม่ได้ (C105.3) ผู้สมัครใหม่ตั้งและยืนยันรหัสผ่านในขั้นข้อมูลส่วนตัว','ข้อมูลสุขภาพแต่ละหมวด (โรคประจำตัว ยาที่ใช้ประจำ แพ้ยา แพ้อาหาร) เลือก ยังไม่ทราบ / ไม่มี / ระบุข้อมูล แล้วพิมพ์ข้อความเอง ไม่มีรายการให้ติ๊ก แนบเอกสารแพ้ยาได้สูงสุด 5 ไฟล์','ไม่ตั้งค่าไม่มีโรคหรือไม่แพ้ยาให้เอง; ผู้ใช้เลือกยังไม่ทราบได้','ขั้นตรวจทานมี checkbox บังคับ 2 ช่องแยกกัน ไม่ติ๊กล่วงหน้า ตามเว็บเดิม: (1) รับทราบคำประกาศความเป็นส่วนตัว (Privacy Notice) ลิงก์เปิด C111.1 ตามที่ผู้ใช้สั่ง (2) ยินยอมข้อมูลสุขภาพเพื่อบริการเภสัชกรรม เปิด C107 ไม่รวมการตลาด บันทึกเวอร์ชันแยกกัน ใต้ทั้งสองช่องมีลิงก์ดูข้อตกลงและนโยบายทั้งหมด เปิด C111.6 พับทุกหัวข้อ; การบันทึกยังเป็นต้นแบบ','แก้ไขข้อมูลส่วนตัวจากบัญชีย้ายไป C520 แล้ว ไม่มีโหมดบัญชีเว็บเดิม', 'รหัสเคสเรียงตามขั้นของฟอร์ม: ข้อมูลส่วนตัว .1–.14 · ที่อยู่ .15–.22 · ข้อมูลสุขภาพ .23–.29 · ตรวจทานและยินยอม .30–.35 (เคส .34–.35 เพิ่มต่อท้ายเมื่อแยก checkbox รับทราบประกาศ; เทียบรหัสเก่าที่ design-system/c105-code-migration.json)'],
  prep(S) {
    const st = S.st.profile;
    S._registration=null;S._registrationComplete=false;
    Object.assign(S, { firstTime: true, newAccount: true, loggedIn: true, consent: false, consentVer: CN_VER });
    regPreview(S,st);
  },
  render(ctx) {
    return regRender(ctx);
  },
  mount(el, ctx) {
    /* registration only: web-account consent mode removed and personal edit moved to C520 (8 Nov 2026) */
    return regMount(el,ctx);
  }
});

/* =====================================================================
   Consent (C06 · A6 + C1): summary on top, full text, required + optional
   ===================================================================== */
const CN_VER = 4;
/* =====================================================================
   No consent (C06): owner 19/10/2026 consent is required to use the app at all
   ===================================================================== */
/* =====================================================================
   Forced update (ใหม่): minimum version gate, cannot be dismissed
   ===================================================================== */
TP.screen('update', {
  group: 'edge', title: 'บังคับอัปเดตแอป', code: 'C601',
  states: [['normal', 'บังคับอัปเดตแอป']],
  notes: [
    'ด่านรุ่นขั้นต่ำ: แอปรุ่นเก่าเรียกคืนไม่ได้ ระบบจึงต้องบังคับอัปเดตได้ · ไม่มีปุ่มปิดหรือย้อนกลับ',
    'แก้ส่วนปรึกษาเภสัชกร (telepharmacy) ต้องแจ้ง อย. ล่วงหน้า 30 วัน · ด่านนี้ใช้คุมให้ทุกเครื่องใช้รุ่นที่แจ้งไว้แล้ว',
    'บอกว่าข้อมูลอยู่ครบ เคสที่เปิดอยู่กลับเข้าได้หลังอัปเดต ลดความกังวล',
    'ช่องทางช่วยเหลือมีเฉพาะฝ่ายบริการลูกค้า: เปิดลิงก์เพิ่มเพื่อน LINE Official Account นอกแอป ไม่มีการ์ดโทรหาสาขา และไม่พาเข้าหน้าอื่นในแอป (ด่านบังคับอัปเดตยังปิดไม่ได้)'
  ],
  wait: ['มีแบบแนะนำให้อัปเดต (ปิดได้) สำหรับรุ่นที่ยังไม่บังคับด้วยไหม'],
  render(ctx) {
    const and = ctx.state === 'android';
    return ui.page(`<div class="st-vc"><div class="st-cen">
        <div class="st-upd-art" data-in="0">${brand.halo(176, { draw: true })}${brand.appicon('lg st-upd-ic')}</div>
        <h2 class="st-h1 c" data-in="1">อัปเดตแอปก่อนใช้งานต่อ</h2>
        <p class="st-sub c" data-in="2">รุ่นที่ติดตั้งอยู่เก่ากว่ารุ่นที่ใช้ปรึกษาเภสัชกรได้อย่างปลอดภัย อัปเดตใช้เวลาไม่ถึง 1 นาที</p></div>
      ${ui.card(ui.kv([['รุ่นในเครื่อง', '1.0.3'], ['รุ่นที่ต้องใช้', '1.1.0 ขึ้นไป'], ['ประวัติและใบสรุป', 'อยู่ครบ'], ['เคสที่เปิดอยู่', 'กลับเข้าได้หลังอัปเดต']]), { din: 3, cls: 'st-kvc' })}<div class="mt16">${ui.group([ui.row({ icon: 'message-circle', title: 'ฝ่ายบริการลูกค้า', sub: `เพิ่มเพื่อน ${TP.support[1]} · ${TP.STORE.csHours}`, href: TP.support[0] })], { title: 'อัปเดตไม่ได้ ติดต่อเรา', din: 4 })}</div></div>`, { nonav: true }) +
      ui.dock(ui.btn('อัปเดตแอป', { icon: 'download', a: 'stUpd', id: 'updGo' }) + `<p class="dock-note">เปิด${and ? ' Google Play' : ' App Store'}</p>`, { clear: true });
  }
});
/* C610 / C611 (user 8 Nov 2026): whole-app blocking states. Shown before any screen when the service is in
   maintenance or no API can be reached. Production reads these from a status endpoint / network layer. */
/* C610 / C611 content follows GOV.UK "service unavailable" and "problem with the service" patterns and NN/g error-message
   guidelines (8 Nov 2026): plain heading, when it is back, what happens to the customer's data, another way to get help,
   no jargon or error codes, no blame. Urgent symptoms keep the danger alert (project rule) because the app cannot reach a pharmacist. */
const stBlock = (ctx, o) => ui.page(`<div class="st-vc"><div class="st-cen">
    <div class="st-upd-art" data-in="0">${brand.halo(176, { draw: true })}<span class="st-block-ic" aria-hidden="true">${ic(o.icon, 56, 1.6)}</span></div>
    <h2 class="st-h1 c" data-in="1">${o.title}</h2>
    <p class="st-sub c" data-in="2">${o.body}</p></div>
    <div class="mt16" data-in="3">${ui.note('<b>มีอาการรุนแรงหรือฉุกเฉิน</b> เช่น หายใจลำบาก แน่นหน้าอก ปากหรือหน้าบวม ไปโรงพยาบาลใกล้บ้าน หรือ <a href="tel:1669">โทร 1669</a>', { tone: 'danger', icon: 'triangle-alert' })}</div></div>`, { nonav: true }) +
  ui.dock(ctx.state === 'retrying'
    ? ui.btn('กำลังตรวจสอบ…', { disabled: true, id: 'stRetryGo' })
    : ui.btn(o.retry, { icon: 'refresh-cw', a: 'stRetry', id: 'stRetryGo' }), { clear: true });
TP.screen('maintenance', {
  group: 'edge', title: 'ปิดให้บริการชั่วคราว', code: 'C610',
  states: [['normal', 'ปิดให้บริการชั่วคราวตามแผน'], ['retrying', 'กำลังตรวจสอบ']],
  notes: ['ใช้เฉพาะการปิดตามแผน (GOV.UK service unavailable): หัวข้อบอกตรง ๆ ว่าใช้งานไม่ได้ บอกวันและเวลาที่กลับมา ไม่ใช้คำกว้าง ๆ อย่าง ปรับปรุงระบบ', 'ข้อความสั้น: บอกว่าปิดตามแผน ข้อมูลและคำสั่งซื้ออยู่ครบ ไม่แสดงวันเวลา (ผู้ใช้ 8 พ.ย. 2569)', 'ไม่มีปุ่มย้อนกลับ ปุ่มตรวจสอบอีกครั้งด้านล่าง คงคำเตือนฉุกเฉิน 1669'],
  wait: ['ประกาศเวลาปิดล่วงหน้าผ่านแจ้งเตือนหรือไม่'],
  render(ctx) {
    return stBlock(ctx, { icon: 'wrench', title: 'แอปปิดให้บริการชั่วคราว', retry: 'ตรวจสอบอีกครั้ง',
      body: 'เรากำลังดูแลระบบตามแผน ข้อมูลและคำสั่งซื้อของคุณยังอยู่ครบ<br>กลับมาใช้งานได้อีกครั้งเร็ว ๆ นี้' });
  }
});
TP.screen('serverdown', {
  group: 'edge', title: 'ระบบมีปัญหาชั่วคราว', code: 'C611',
  states: [['normal', 'ระบบมีปัญหา เชื่อมต่อไม่ได้'], ['retrying', 'กำลังตรวจสอบ']],
  notes: ['ใช้กับปัญหาที่ไม่ได้วางแผน เมื่อเรียก API ใด ๆ ไม่ได้ (GOV.UK problem with the service) ใช้หน้าเดียวกับทุกสาเหตุ ไม่แสดงรหัสข้อผิดพลาดหรือคำว่าขัดข้องทางเทคนิค', 'ข้อความสั้น: กำลังแก้ไข ข้อมูลไม่สูญหาย ให้ลองอีกครั้ง ต่างจาก C608 ที่สัญญาณหลุดระหว่างวิดีโอคอล', 'ถ้าแก้นานควรเปลี่ยนเป็น C610 พร้อมเวลาที่กลับมา'],
  render(ctx) {
    return stBlock(ctx, { icon: 'server-off', title: 'เชื่อมต่อระบบไม่ได้ในขณะนี้', retry: 'ลองอีกครั้ง',
      body: 'เรากำลังเร่งแก้ไข ข้อมูลของคุณไม่สูญหาย<br>โปรดลองอีกครั้งในอีกสักครู่' });
  }
});
/* prototype: retrying shows the busy state, then returns to the same blocking screen */
TP.act('stRetry', () => { const id = TP.cur()?.id; if (!['maintenance', 'serverdown'].includes(id)) return; TP.S.st[id] = 'retrying'; TP.refresh({ anim: false }); setTimeout(() => { if (TP.cur()?.id !== id) return; TP.S.st[id] = 'normal'; TP.refresh({ anim: false }); TP.notify('ยังใช้งานไม่ได้ โปรดลองอีกครั้งภายหลัง', { icon: 'circle-alert' }); }, 1500); });
TP.act('stUpd', async () => {
  TP.notify(TP.stateOf('update') === 'android' ? 'เปิด Google Play' : 'เปิด App Store', { icon: 'download' });
  if (!TP.S.oldApp) return;
  await TP.wait(TP.RED() ? 80 : 1600);
  TP.S.oldApp = false; TP.emit('state');
  TP.ACTS.splashSkip();
});

/* =====================================================================
   Consultation switched off (C17)
   ===================================================================== */
})();

/* ===== 60-before.js ===== */
/* =====================================================================
   60 · Before the consult: splash, home, branch sheet, intake, allergy sheet,
        red-flag sheet, notification ask
   ===================================================================== */
(() => {
const { $, $$, esc, ic, ui, brand, A, E, SP, fin } = TP;

/* ---------- case model (shared by queue / room / pay) ---------- */
TP.newCase = () => {
  const S = TP.S, I = S.intake, b = TP.branch();
  S._paymentCase=null;S._homeEventPreview=false;
  const id='TC-'+Date.now().toString(36)+'-'+(TP._caseSerial=(TP._caseSerial||0)+1);
  S.case = {
    id, caseCode: TP.caseCode(id), who: 'me', symptoms: [...I.symptoms], urgent: [...I.urgent], note: [I.note,I.otherOpen?I.otherText:''].filter(v=>v?.trim()).join('\n'), photos: (I.attachments||[]).length, attachments:[...(I.attachments||[])], mode: I.mode,
    duration: I.duration || '', pregnancy: I.pregnancy || '',
    intakeAllergy: (() => {
      const allergy = TP.healthRecord(S.user).allergies;
      return allergy.mode === 'set' ? allergy.text : allergy.mode === 'none' ? 'ไม่มีประวัติแพ้ยา' : 'ยังไม่ทราบ';
    })(),
    deliveryAddress:TP.homeAddress?.()?structuredClone(TP.homeAddress()):null, branch: b.id, pharm: b.pharm, status: 'queue',
    pos: Math.max(1, (S.queueLen[b.id] || 0) + 1), joinedAt: TP.NOW.time, order: null, rated: 0, msgs: []
  };
  TP.emit('state');
  return S.case;
};
/* Preview-only fixture controls: never submitted or stored in preferences. */
TP.casePreview = {
  states: [["none", "ไม่มีปรึกษา"], ["queue3", "รออีก 3 คิว"], ["queue2", "รออีก 2 คิว"], ["queue1", "รออีก 1 คิว"], ["next", "คิวถัดไป"], ["paused", "เภสัชกรพัก"], ["matched", "รับคิวแล้ว"], ["chat", "สนทนา-จ่ายยา"], ["video-request", "เภสัชกรขอวิดีโอคอล"], ["reply", "รอคำตอบจากคุณ"], ["payment", "รอชำระเงิน"], ["closed-unpaid", "จบแชท · รอชำระค่ายา"], ["payment-soon", "เหลือชำระ 1 นาที"], ["closed-payexpired", "จบแชท · หมดเวลาชำระ"], ["finished", "จบการปรึกษา"], ["cancelled", "ยกเลิกคิว"], ["expired", "หมดเวลารอคำตอบ"],["delivery-preparing","ชำระแล้ว · เตรียมยา"],["delivery-calling","กำลังเรียกไรเดอร์"],["delivery-delivering","ไรเดอร์กำลังส่งยา"],["delivery-delivered","จัดส่งเสร็จสิ้น"],["pickup-preparing","รับที่สาขา · เตรียมยา"],["pickup-ready","รับที่สาขา · พร้อมรับยา"],["pickup-complete","รับยาที่สาขาแล้ว"]],
  seed(key) {
    if(!this.states.some(([k])=>k===key))return false;
    if(key==='none'){Object.assign(TP.S,{case:null,_paymentCase:null,call:null,netOff:false,_casePreview:'none'});return true;}
    const S=TP.S,c=TP.newCase();
    S.call=null;S.netOff=false;S._paymentCase=null;
    Object.assign(c,{status:'queue',pos:1,idle:false,order:null,msgs:[]});
    if(key.startsWith('delivery-') || key.startsWith('pickup-') || key.startsWith('parcel-')){TP.fulfillmentPreview(c,key);S._casePreview=key;return true;}
    if(key.startsWith('queue'))c.pos=Number(key.slice(5))+1;
    if(key==='paused')c.status='paused';
    if(['matched','chat','reply','payment'].includes(key))c.status=key==='matched'?'matched':'room';
    if(key==='reply')c.idle={until:Date.now()+120000};
    if(key==='payment'){TP.makeOrder();c.msgs=[{who:'me',kind:'intake'},{kind:'provider-ready'},{kind:'order'}];c.step=99;c.hold=true;}
    if(['finished','cancelled','expired'].includes(key))c.status=key==='finished'?'closed':key;
    if(['closed-unpaid','payment-soon','closed-payexpired'].includes(key)){c.date=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date());c.status='closed';TP.makeOrder();TP.startOrderPayment(c.order);if(TP.ORDER_ITEMS?.length===3){c.order.items=TP.ORDER_ITEMS.map(i=>({...i}));c.order.total=c.order.items.reduce((n,i)=>n+i.price,0);}if(key==='payment-soon')c.order.expiresAt=Date.now()+60000;if(key==='closed-payexpired'){c.order.expiresAt=Date.now()-1;TP.expireOrder(c);}c.msgs=[{who:'me',kind:'intake'},{kind:'provider-ready'},{kind:'order'},{kind:'summary',by:'ph',time:TP.NOW.time}];}
    if(key==='video-request'){S.call=null;c.status='room';c.hold=true;c.step=0;c.msgs=[{who:'me',kind:'intake'},{kind:'provider-ready'},{kind:'video-request',id:'preview-video-request',status:'pending',time:TP.NOW.time}];}
    if(['matched','chat','reply'].includes(key)){c.msgs=[{who:'me',kind:'intake'},{kind:'provider-ready'}];c.step=99;c.hold=true;}
    S._casePreview=key;return true;
  },
  apply(key) {
    if(['queue','room'].includes(TP.cur()?.id)&&TP.S.case&&!['closed','cancelled','expired'].includes(TP.S.case.status)&&['matched','chat','video-request','reply','payment'].includes(key))return this.playChat(key);
    if(!this.seed(key))return;
    TP.S.st.home='';
    if(['matched','chat','video-request','reply','payment'].includes(key)){TP.S.st.room='';TP.go('room');}
    else if(['queue','room','video'].includes(TP.cur()?.id)&&['none','finished','cancelled','expired'].includes(key))TP.go('home',{root:true});else TP.refresh({anim:false});TP.emit('state');
  }
};
TP.caseOpen = () => { const c = TP.S.case; return !!(c && (!c.who || c.who==='me') && !['closed', 'cancelled', 'declined', 'expired', 'branchclosed'].includes(c.status)); };
/* C03: prefer the nearest open branch. */
TP.pickBranch = () => {
  const S = TP.S, candidates = TP.homeStores ? TP.homeStores() : [...TP.BRANCHES].sort((a,b) => a.km - b.km);
  if (!S.branchPicked || !candidates.some(b => b.id === S.branch)) {
    const b = candidates.find(b => S.branchState[b.id] === 'open') || candidates[0];
    if (b) S.branch = b.id;
    S.autoReason = b && candidates[0]?.id !== b.id ? 'เลือกสาขาที่เปิดรับปรึกษาในบริเวณที่อยู่นี้ให้แล้ว' : '';
  }
  return TP.branch() || TP.BRANCHES[0];
};

/* =====================================================================
   Splash: plus field ripples out, the Halo draws itself, the real logo settles
   ===================================================================== */
TP.screen('splash', {
  group: 'start', title: 'เปิดแอป', code: 'C101', cls: 'splash',
  notes: ['Design v1.2: แสงนุ่มลอยช้า ๆ หลังโลโก้ ไม่มีลาย + แล้ว (เจ้าของเลือกแบบ B 19/10/2026)', 'โลโก้จริงจากชุด CI ไม่วาดใหม่ ไม่เปลี่ยนสี · ใช้ Wordmark EN อย่างเดียว ไม่มีภาษาไทยห้อยมุมขวาล่าง (เจ้าของสั่ง 19/10/2026)', 'แตะเพื่อข้ามได้ · ผู้ใช้ครั้งแรกไปหน้าเข้าสู่ระบบทันที ไม่มีหน้าแนะนำแอป (ขั้นสมัครแบบสั้น 19/10/2026) · เคยใช้แล้วเข้าหน้าแรกทันที'],
  render: () => `${TP.MOTIF === 'plus' ? '<canvas class="field" aria-hidden="true"></canvas>' : brand.splashArt(TP.MOTIF)}
    <button type="button" class="sp-c" data-a="splashSkip" aria-label="เข้าสู่แอป">
      ${TP.MOTIF === 'plus' ? brand.halo(156, { draw: true, cls: 'sp-halo' }) : ''}
      <span class="sp-logo">${brand.logo('wmen', { style: 'width:200px;height:31.5px' })}</span>
      <span class="sp-tag">ปรึกษาเภสัชกรผ่านแอป</span>
    </button>`,
  mount(el, ctx) {
    const plus = TP.MOTIF === 'plus', t0 = plus ? 900 : 350;
    if (plus) { const f = brand.field($('canvas', el), { color: '#035C67', base: .1, amp: .5, intro: true, sigma: 40, speed: .5, every: 2400 }); ctx.onLeave(f.stop); }
    const logo = $('.sp-logo', el), tag = $('.sp-tag', el);
    A(logo, [{ opacity: 0, transform: 'translateY(14px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { d: 900, e: E.out, delay: t0, fill: 'backwards' });
    A(tag, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { d: 700, e: E.out, delay: t0 + 350, fill: 'backwards' });
    ctx.later(() => TP.ACTS.splashSkip(), 2900);
  }
});
TP.act('splashSkip', () => {
  const S = TP.S;
  if (S.oldApp && TP.SCREENS.update) return TP.go('update', { via: 'zoom', root: true });
  const next = !S.loggedIn && TP.SCREENS.login ? 'login' : 'home';
  TP.go(next, { via: 'zoom', root: true });
});

/* =====================================================================
   Home (C01)
   ===================================================================== */
/* C210 / C514 / C515: address-based pharmacy discovery. */
TP.homeAddress = () => (TP.S.addrs || []).find(a => a.id === TP.S.deliveryAddressId) || (TP.S.addrs || []).find(a => a.main) || (TP.S.addrs || [])[0] || null;
TP.homeDistance = b => { const a = TP.homeAddress(); return a ? TP.zoneOf(a, b.id)?.km ?? null : null; };
TP.homeStores = () => TP.homeAddress() ? TP.BRANCHES.filter(b => TP.homeDistance(b) != null && TP.homeDistance(b) <= TP.ZONE_KM).sort((a,b) => TP.homeDistance(a) - TP.homeDistance(b)) : [];
const homeBranchClosed = (S, b) => S.sysOff || S.storeOpen === false || S.branchState[b.id] !== 'open';
const homeBranchOutside = b => !!TP.homeAddress() && (TP.homeDistance(b) ?? Infinity) > TP.ZONE_KM;
const homeBranchStatus = (S, b) => homeBranchOutside(b) ? [TP.homeDistance(b) == null ? 'ตรวจสอบพื้นที่ไม่ได้' : 'นอกพื้นที่ให้บริการ', 'muted']
  : homeBranchClosed(S, b) ? ['ปิดรับบริการ', 'muted'] : ['เปิดรับบริการ', 'ok'];
/* Selection uses the selected delivery address. A busy branch never blocks: the customer joins the shortest known queue among open branches, nearest first. */
TP.quickConsultBranch = () => {
  if (!TP.homeAddress()) return {reason:'address'};
  const stores=TP.homeStores();
  if (!stores.length) return {reason:TP.BRANCHES.some(b=>TP.homeDistance(b)!=null)?'area':'unknownarea'};
  if (TP.S.sysOff || TP.S.storeOpen===false) return {reason:'unavailable'};
  const open=stores.filter(b=>!homeBranchClosed(TP.S,b));
  if (!open.length) return {reason:'unavailable'};
  const queue=b=>Number.isFinite(TP.S.queueLen?.[b.id])?TP.S.queueLen[b.id]:Infinity;
  return {branch:open.reduce((best,b)=>queue(b)<queue(best)?b:best)};
};
TP.act('quickConsult',()=>{
  const S=TP.S;
  if (!S.loggedIn) return TP.go('login',{root:true});
  if (TP.caseOpen()) return TP.go(['room','matched'].includes(S.case?.status)?'room':'queue');
  const result=TP.quickConsultBranch();
  if (!result.branch){
    if(result.reason==='address'){TP.notify('เลือกที่อยู่จัดส่งเพื่อหาร้านยาใกล้คุณ',{icon:'map-pin'});return TP.sheet('homeaddress');}
    if(result.reason==='unavailable') return TP.sheet('storeinfo', { branch: TP.homeStores()[0].id });
    if(result.reason==='area') return TP.sheet('outsidearea');
    TP.notify('ยังตรวจสอบระยะจากที่อยู่นี้ไม่ได้ กรุณาตรวจสอบที่อยู่',{icon:'info',dismissible:true});
    return;
  }
  S.branch=result.branch.id;S.branchPicked=true;S.autoReason='';
  return TP.ACTS.hmStart({dataset:{mode:'chat'}});
});
TP.sheetDef('outsidearea', {
  group:'before', title:'อยู่นอกระยะการให้บริการ', code:'C216', host:'home', cls:'outside-area-sheet',
  states:[['normal','ไม่มีร้านยาในรัศมี 15 กม.']],
  notes:['เปิดจากปุ่มปรึกษาบนแบนเนอร์และเมนูเมื่อไม่มีร้านในรัศมี 15 กม. ไม่เริ่มเคสหรือเข้าคิว','ปิดด้วยปุ่มปิด กากบาท แตะพื้นหลัง หรือ Escape แล้วคงหน้าเดิม'],
  render(){return '<div class="outside-area-content"><img src="/assets/illustrations/outside-service-area-2d-v1.png" alt="" width="200" height="160"><div class="outside-area-copy"><p>ยังไม่มีร้านยาในรัศมี 15 กม. จากที่อยู่ที่เลือก<br>กรุณาเปลี่ยนที่อยู่เพื่อเริ่มปรึกษา</p></div></div>';},
  foot(){return ui.btn('ปิด',{closeSheet:true});}
});
TP.saveHomePreferences = () => {
  if (flowPreview || new URLSearchParams(location.search).has('state') || new URLSearchParams(location.search).get('registry') === '1') return;
  try { localStorage.setItem('mitraree.home.preferences.v1', JSON.stringify({ addrs: TP.S.addrs, deliveryAddressId: TP.S.deliveryAddressId })); } catch (_) { /* The current session remains usable when storage is unavailable. */ }
};
if (!flowPreview && !new URLSearchParams(location.search).has('state') && new URLSearchParams(location.search).get('registry') !== '1') {
  try {
    const saved = JSON.parse(localStorage.getItem('mitraree.home.preferences.v1') || 'null');
    if (saved && Array.isArray(saved.addrs) && saved.addrs.every(a => a && typeof a.id === 'string' && typeof a.dist === 'string')) {
      TP.S.addrs = saved.addrs;
      const primary = TP.S.addrs.find(a => a.main) || TP.S.addrs[0];
      TP.S.addrs.forEach(a => a.main = a.id === primary?.id);
      TP.S.deliveryAddressId = null;
    }
  } catch (_) {}
}
TP.homeScenario = (S, st) => {
  const scenarios = ['noaddress', 'outarea', 'unknownarea'];
  if (scenarios.includes(st)) {
    if (!TP._addressScenarioBase) TP._addressScenarioBase = { addrs: structuredClone(S.addrs), deliveryAddressId: S.deliveryAddressId };
    if (st === 'noaddress') { S.addrs = []; S.deliveryAddressId = null; }
    else {
      S.addrs = TP.fresh().addrs;
      { const a = { ...S.addrs[0], id: 'demo-area', dist: st === 'outarea' ? 'ศรีภูมิ' : 'พื้นที่ตัวอย่าง', amp: 'เมือง', prov: 'เชียงใหม่', main: false }; S.addrs.push(a); S.deliveryAddressId = a.id; }
    }
    S.branchPicked = false;
  } else if (TP._addressScenarioBase) { Object.assign(S, TP._addressScenarioBase); TP._addressScenarioBase = null; S.branchPicked = false; }
};
const homeAddressCards = (S, picker) => (S.addrs || []).map(a => {
  const selected = a.id === TP.homeAddress()?.id;
  const name = esc([a.first,a.last].filter(Boolean).join(' ')), address = esc(TP.fmtAddr(a));
  const details = `<span class="saved-address-copy"><span><b>${name}</b>${a.main ? ' <small>(ค่าเริ่มต้น)</small>' : ''}</span>
    <small>${address}</small><small>${esc(a.phone)}</small></span>`;
  if (picker) return `<button type="button" class="hm-address-card saved-address-choice${selected?' selected':''}" data-a="hmSelectAddress"
    data-v="${esc(a.id)}" aria-pressed="${selected}">${details}${selected ? ic('check',20) : ''}</button>`;
  return `<article class="card tax-summary tax-summary-compact"><header class="tax-summary-head"><div><strong>${name}</strong>${a.main ? '<span class="small">ที่อยู่หลัก</span>' : ''}</div>
    <button type="button" class="txtbtn tax-summary-edit" data-a="hmEditAddress" data-v="${esc(a.id)}" aria-label="แก้ไขที่อยู่ ${name}">${ic('pencil',16,1.8)} แก้ไข</button>
    </header><div class="tax-summary-content"><p class="tax-summary-address">${address}</p>${a.phone ? `<p class="small">โทรศัพท์ : ${esc(a.phone)}</p>` : ''}
    ${a.main ? '' : `<button type="button" class="txtbtn" data-a="hmMainAddress" data-v="${esc(a.id)}">ตั้งเป็นที่อยู่หลัก</button>`}</div></article>`;
}).join('');
const addressEmpty = () => `<div class="hm-empty">${ui.emptyArt('map-pin')}<h3>ยังไม่มีที่อยู่จัดส่ง</h3><p>เพิ่มที่อยู่เพื่อค้นหาร้านยาในบริเวณนั้น</p>${ui.btn('เพิ่มที่อยู่', { a: 'hmNewAddress', icon: 'plus' })}</div>`;
TP.sheetDef('homeaddress', {
  group: 'before', title: 'เลือกที่อยู่จัดส่ง', code: 'C210', host: 'home', tall: true, cls: 'home-address-sheet',
  states: [['normal', 'มีที่อยู่'], ['empty', 'ยังไม่มีที่อยู่']],
  prep(S) { if (S.st.homeaddress === 'empty') { S.addrs = []; S.deliveryAddressId = null; } },
  render(ctx) { return `<p class="small">เลือกที่อยู่เพื่อดูร้านยาใกล้คุณ</p><div class="hm-address-list">${ctx.S.addrs?.length ? homeAddressCards(ctx.S, true) : addressEmpty()}</div>`; },
  foot: () => ui.btn('จัดการสมุดที่อยู่', { a: 'hmAddressBook', kind: 'secondary', icon: 'map-pin' })
});
const ADDRESS_MAIN_ALERT = 'ตั้งเป็นที่อยู่หลักแล้ว', ADDRESS_SAVED_ALERT = 'บันทึกที่อยู่แล้ว';
TP.screen('addressbook', {
  group: 'account', title: 'ที่อยู่ที่บันทึกไว้', code: 'C514', parent: 'account',
  states: [['normal', 'มีที่อยู่หลัก'], ['empty', 'ไม่มีที่อยู่ที่บันทึกไว้', true, 7], ['main-changed', 'แจ้งเตือน ตั้งเป็นที่อยู่หลักแล้ว', true, 5], ['address-saved', 'แจ้งเตือน บันทึกที่อยู่แล้ว', true, 6]],
  prep(S) {
    const st = S.st.addressbook;
    S._addressAlert = { 'main-changed': ADDRESS_MAIN_ALERT, 'address-saved': ADDRESS_SAVED_ALERT }[st] || null;
    if (st === 'main-changed') {
      TP._addressBookBase ||= structuredClone({ addrs: S.addrs, deliveryAddressId: S.deliveryAddressId });
      S.addrs = TP.fresh().addrs; S.addrs.forEach(a => a.main = a.id === 'a2'); S.deliveryAddressId = null;
    } else if (TP._addressBookBase) { Object.assign(S, TP._addressBookBase); TP._addressBookBase = null; }
    if (st === 'empty') S.addrs = [];
  },
  /* Preview cases show the same toast as the real action, once per opening. */
  mount(el, ctx) { const message = ctx.S._addressAlert; if (!message) return; ctx.S._addressAlert = null; TP.notify(message, { icon: 'map-pin' }); },
  render(ctx) { return ui.nav({ back: true, title: 'ที่อยู่ที่บันทึกไว้' }) + ui.page(`<div class="hm-address-list">${ctx.S.addrs?.length ? homeAddressCards(ctx.S, false) : addressEmpty()}</div>`, {cls:'saved-address-page'}) + (ctx.S.addrs?.length ? ui.dock(ui.btn('เพิ่มที่อยู่ใหม่', { a: 'hmNewAddress', icon: 'plus' })) : ''); }
});
const addressFields = [['first','ชื่อ','text'],['last','นามสกุล','text'],['phone','เบอร์โทรศัพท์มือถือ','tel'],['house','บ้านเลขที่','text'],['building','หมู่บ้าน / อาคาร / ห้อง / ชั้น','text',true],['alley','ซอย','text',true],['road','ถนน','text',true],['prov','จังหวัด','text'],['amp','อำเภอ / เขต','text'],['dist','ตำบล / แขวง','text'],['zip','รหัสไปรษณีย์','text']];
TP.screen('addressedit', {
  group: 'account', title: 'เพิ่ม / แก้ไขที่อยู่', code: 'C515', parent: 'addressbook',
  states: [['normal', 'เพิ่มที่อยู่'], ['edit', 'แก้ไขที่อยู่'], ['form-required','ไม่กรอกข้อมูลบังคับ', true, 8], ['form-phone','เบอร์มือถือผิดรูปแบบ', true, 9], ['form-area','พื้นที่ยังเลือกไม่ครบ', true, 11], ['form-legacy','ที่อยู่เดิมยังอยู่ครบ ไม่แยกอัตโนมัติ', true, 14], ['map-unpinned','แผนที่ · ที่อยู่ครบ ยังไม่ปักหมุด', true, 15], ['map-saved','แผนที่ · ปักหมุดแล้ว', true, 16], ['map-error','แผนที่ · โหลดไม่สำเร็จ', true, 17]],
  notes: ['ตำแหน่งจัดส่งเป็นแผนที่ย่อแบบอ่านอย่างเดียว (24 พ.ย. 2569): ที่อยู่ยังไม่ครบแสดงพื้นว่างพร้อมคำแนะนำ ครบแล้วแสดงตำบลที่เลือก ปักหมุดแล้วแสดงหมุด แตะแผนที่เปิด C521 เพื่อลากหมุด หมุดไม่บังคับ', 'แผนที่ใช้ MapLibre + OpenFreeMap ไม่ใช่ Google Maps ระบบจริงเปลี่ยนผู้ให้บริการแผนที่ได้ที่ address-map adapter', 'ปุ่ม mock ในแผงทดสอบเติมเฉพาะช่องที่ว่างด้วยที่อยู่ตัวอย่าง (ทวีวัฒนา) ไม่บันทึกอัตโนมัติ'],
  prep(S) { if(S.st.addressedit?.startsWith('form-')){S.addrs=TP.fresh().addrs;const a=S.addrs[0];S._homeEditAddress=a.id;if(S.st.addressedit==='form-required')for(const k of ['first','last','phone','house','prov','amp','dist','zip'])a[k]='';if(S.st.addressedit==='form-phone')a.phone='0212345678';if(S.st.addressedit==='form-area'){a.amp='';a.dist='';a.zip='';}if(S.st.addressedit==='form-legacy')Object.assign(a,{house:'88/12 หมู่บ้านมิตรอารี ซอยทวีวัฒนา 25 ถนนเลียบคลองทวีวัฒนา',building:'',alley:'',road:''});a.pin=false;a.location=null;} if(S.st.addressedit?.startsWith('map-')){S.addrs=TP.fresh().addrs;S._homeEditAddress=S.addrs[0].id;S.addrs[0].pin=false;S.addrs[0].location=null;if(S.st.addressedit==='map-saved'){const a=S.addrs[0];TP.previewSavedAddressPin(a);}} if (S.st.addressedit === 'edit') S._homeEditAddress = S.addrs?.[0]?.id; if (S.st.addressedit === 'invalid') { S._homeAddressInvalid = true; S._homeEditAddress = S.addrs?.[0]?.id; if(S.addrs?.[0])S.addrs[0].phone=''; } },
  render(ctx) {
    const stored=(ctx.S.addrs||[]).find(a=>a.id===ctx.S._homeEditAddress)||{};
    const a={...stored};
    const field=([key,label,type,optional])=>{
      const id='home-address-'+key,area=['prov','amp','dist'].includes(key);
      const attrs=`required aria-required="true" aria-describedby="${id}-error" aria-invalid="false"`;
      return `<div class="field" data-address-field="${key}"><label for="${id}">${label} ${optional?'<span class="opt-t">(ไม่บังคับ)</span>':'<span class="reg-required" aria-hidden="true">*</span>'}</label>${area?`<select class="input" id="${id}" name="${key}" ${attrs} disabled><option value="${esc(a[key]||'')}">${esc(a[key]||'เลือก'+label)}</option></select>`:`<input class="input" id="${id}" name="${key}" type="${type}" value="${esc(a[key]||'')}" ${optional?`aria-describedby="${id}-error" aria-invalid="false"`:attrs} maxlength="${['house','building'].includes(key)?200:['alley','road'].includes(key)?100:key==='phone'?10:key==='zip'?5:50}" ${key==='phone'?'inputmode="numeric" autocomplete="tel-national" pattern="0[689][0-9]{8}" placeholder="เช่น 0812345678"':key==='zip'?'inputmode="numeric" pattern="[0-9]{5}" readonly placeholder="ระบบจะเติมให้เมื่อเลือกตำบล"':key==='first'?'autocomplete="given-name" placeholder="ชื่อผู้ติดต่อ"':key==='last'?'autocomplete="family-name" placeholder="นามสกุลผู้ติดต่อ"':key==='house'?'autocomplete="address-line1" placeholder="เช่น 88/12"':key==='building'?'autocomplete="address-line2" placeholder="ชื่อหมู่บ้าน อาคาร ห้อง หรือชั้น"':key==='alley'?'placeholder="เช่น ทวีวัฒนา 25"':key==='road'?'placeholder="เช่น เลียบคลองทวีวัฒนา"':''}>`}<p class="err-t" id="${id}-error" role="alert" hidden></p></div>`;
    };
    const onCheckoutReturn = ctx.params?.onCheckoutReturn;
    return ui.nav({back:!onCheckoutReturn,title:stored.id?'แก้ไขที่อยู่':'เพิ่มที่อยู่',
      left:onCheckoutReturn ? '<button type="button" class="ibtn" data-a="returnToCheckoutAddress" aria-label="ย้อนกลับ">'+ic('arrow-left',22)+'</button>' : undefined})+ui.page(`<div class="hm-address-form registration-page"><p class="reg-help">กรอกข้อมูลติดต่อและที่อยู่ปัจจุบันในช่องที่มี <span class="reg-required" aria-hidden="true">*</span> ให้ครบ</p>${/ซอย|ถนน|หมู่บ้าน|อาคาร|ชั้น|ห้อง/.test(a.house||'')?'<p class="hint">ข้อมูลเดิมยังอยู่ครบในช่องบ้านเลขที่ กรุณาตรวจและแยกลงช่องที่ตรงกัน</p>':''}<div class="reg-name-fields">${addressFields.slice(0,2).map(field).join('')}</div>${addressFields.slice(2,7).map(field).join('')}${TP.addressAreaField(a)}<div class="address-native-fields">${addressFields.slice(7,10).map(field).join('')}</div>${field(addressFields[10])}
    ${TP.addressPinField('openDeliveryPin',a.location,{map:true})}<label class="hm-primary-check reg-consent-single"><input type="checkbox" id="home-address-main" ${a.main||!ctx.S.addrs?.length?'checked':''}><span>ตั้งเป็นที่อยู่หลัก</span></label><p id="home-address-error" class="danger-t" role="alert">${ctx.state==='invalid'||ctx.S._homeAddressInvalid?'กรุณากรอกข้อมูลให้ครบและตรวจสอบเบอร์โทรกับรหัสไปรษณีย์':''}</p></div>`, {cls:'address-editor-page'})+ui.dock(ui.btn('บันทึกที่อยู่',{a:'hmSaveAddress'}));
  }

});
/* Preview panel only (C515 mock button): fills blank fields with FX.addressFormSample, never saves.
   The area is chosen through the same selects the picker uses, so the zip and validation stay real. */
/* the area keys and label helper live in the start module; this module keeps its own copies */
const mockAreaKeys = ['prov', 'amp', 'dist'];
const mockAreaLabel = a => [a.dist, a.amp, a.prov].filter(Boolean).join(' · ');
const addressEditPreviewMock = {
  canFill: () => !!TP.cur()?.el?.querySelector('#home-address-first'),
  fill() {
    const el = TP.cur()?.el, sample = FX.addressFormSample;
    if (!el || !sample) return false;
    for (const [key] of addressFields) {
      if (mockAreaKeys.includes(key) || key === 'zip') continue;
      const input = $('#home-address-' + key, el);
      if (!input || input.value.trim()) continue;
      input.value = sample[key] || '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const area = mockAreaKeys.map(key => $('#home-address-' + key, el));
    if (area.every(Boolean) && !area[0].disabled && !area.some(field => field.value)) {
      for (const [index, field] of area.entries()) {
        const value = sample[mockAreaKeys[index]];
        if (![...field.options].some(option => option.value === value)) break;
        field.value = value;
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const label = $('.address-area-open > span', el);
      if (label) label.textContent = mockAreaLabel(Object.fromEntries(area.map((field, index) => [mockAreaKeys[index], field.value])));
    }
    return true;
  }
};
if (TP.SCREENS?.addressedit) TP.SCREENS.addressedit.previewMock = addressEditPreviewMock;
/* C515 preview map reads the pin being edited: a pin confirmed in C521 first, else the saved address pin */
TP.addressEditPin = () => TP.S._homePinDraft || (TP.S.addrs || []).find(a => a.id === TP.S._homeEditAddress) || null;
TP.act('returnToCheckoutAddress', () => TP.cur()?.ctx.params.onCheckoutReturn?.());
TP.act('openDeliveryPin', () => {
  const el = TP.cur()?.el, api = globalThis.TPAddressMap;
  if (!api || !el?._validateAddressForm?.(true)) return;
  const draft = Object.fromEntries(addressFields.map(([key]) => [key, $('#home-address-' + key, el).value.trim()]));
  const saved = TP.S._homePinDraft || TP.S.addrs.find(a => a.id === TP.S._homeEditAddress);
  if (saved?.location && api.key(draft) === saved.location.addressKey)
    Object.assign(draft, { pin: true, location: saved.location });
  return TP.sheet('deliverypin', { address: draft, editor: el });
});
TP.sheetDef('deliverypin', {
  group: 'account', title: 'ปักหมุดตำแหน่งจัดส่ง', code: 'C521', host: 'addressedit', tall: true, cls: 'delivery-pin-sheet',
  states: [['normal', 'เลื่อนแผนที่หรือค้นหาจากตำแหน่งปัจจุบัน'], ['unavailable', 'ขอบเขตพื้นที่โหลดไม่สำเร็จ'], ['outside', 'หมุดอยู่นอกตำบลที่เลือก']],
  notes: ['ปักหมุดจากสมุดที่อยู่ได้เมื่อกรอกที่อยู่ครบ ค้นหาจากตำแหน่งปัจจุบันเป็นตัวเลือก ขอสิทธิ์เฉพาะเมื่อกดปุ่ม', 'การยืนยันหมุดไม่บันทึกที่อยู่ทันที ต้องกดบันทึกบนฟอร์มที่อยู่'],
  render(ctx) {
    const address = ctx.params.address || TP.fresh().addrs[0];
    return `<p class="small delivery-pin-address">${esc(TP.fmtAddr(address))}</p><div class="delivery-pin-map" data-address-map="picker"></div>`;
  },
  mount(el, ctx) {
    const address = ctx.params.address || TP.fresh().addrs[0];
    globalThis.TPAddressMap.bind($('.delivery-pin-map', el), {
      read: () => address, onInvalid() {},
      onSave(location) {
        if (ctx.params.editor) {
          TP.S._homePinDraft = { pin: true, location };
          const status = $('#homeAddressPinStatus', ctx.params.editor);
          if (status) status.textContent = 'บันทึกหมุดแล้ว';
          const label = $('[data-address-pin-label]', ctx.params.editor);
          if (label) label.textContent = 'แก้ไขตำแหน่ง';
          $('.address-pin-map', ctx.params.editor)?._addressPreview?.refresh();
        }
        ctx.params.onConfirm?.(location);
        ctx.later(() => TP.closeSheet(), 0);
      },
      ctx, picker: true,
    });
  },
});

TP.act('hmOpenAddress', () => TP.sheet('homeaddress'));
TP.act('hmSelectAddress', async t => {
  if (!(TP.S.addrs || []).some(a => a.id === t.dataset.v)) return;
  TP.S.deliveryAddressId = t.dataset.v; TP.S.branchPicked = false;
  TP.saveHomePreferences(); await TP.closeSheet({ instant: true }); TP.refresh({ anim: false });
});
TP.act('hmAddressBook', async () => { await TP.closeSheet({ instant: true }); TP.go('addressbook'); });
TP.act('hmNewAddress', async () => { TP.S._homeEditAddress = null; TP.S._homeAddressInvalid = false; TP.S._homePinDraft = null; TP.S.st.addressedit = undefined; await TP.closeSheet({ instant: true }); TP.go('addressedit'); });
TP.act('hmEditAddress', t => { TP.S._homeEditAddress = t.dataset.v; TP.S._homeAddressInvalid = false; TP.S._homePinDraft = null; TP.S.st.addressedit = undefined; TP.go('addressedit'); });
TP.act('hmMainAddress', t => {
  const a = (TP.S.addrs || []).find(a => a.id === t.dataset.v); if (!a) return;
  TP.S.addrs.forEach(x => x.main = x.id === a.id); TP.S.deliveryAddressId = null; TP.S.branchPicked = false;
  TP.saveHomePreferences(); TP.refresh({ anim: false }); TP.notify(ADDRESS_MAIN_ALERT, { icon: 'map-pin' });
});
TP.act('hmSaveAddress', () => {
  const formRoot=document.getElementById('home-address-house')?.closest?.('.scr');
  if(formRoot?._validateAddressForm&&!formRoot._validateAddressForm(true))return;
  const values = {}; let invalid = null;
  for (const [key,,,optional] of addressFields) { const input = document.getElementById('home-address-' + key); if (!input) return; values[key] = input.value.trim(); if (((!optional && !values[key]) || !input.checkValidity()) && !invalid) invalid = input; }
  if (invalid) { document.getElementById('home-address-error').textContent = 'กรุณากรอกข้อมูลให้ครบและตรวจสอบเบอร์โทรกับรหัสไปรษณีย์'; invalid.focus(); invalid.reportValidity(); return; }
  const list = TP.S.addrs || (TP.S.addrs = []); let a = list.find(a => a.id === TP.S._homeEditAddress);
  const pin = TP.S._homePinDraft || a;
  const keepPin = !!(pin && globalThis.TPAddressMap?.valid({ ...values, pin: pin.pin, location: pin.location }));
  values.location = keepPin ? pin.location : null;
  TP.S._homePinDraft = null;
  if (a) { Object.assign(a, values, { pin:keepPin }); } else { a = { id: 'a' + Date.now(), ...values, main: false, pin:keepPin }; list.push(a); }
  if (document.getElementById('home-address-main').checked || list.length === 1) { list.forEach(x => x.main = x.id === a.id); TP.S.deliveryAddressId = null; }
  else if (!list.some(x => x.main)) list[0].main = true;
  TP.S.branchPicked = false;
  TP.saveHomePreferences();
  const onCheckoutReturn = TP.cur?.()?.ctx?.params?.onCheckoutReturn;
  if (onCheckoutReturn) { TP.notify(ADDRESS_SAVED_ALERT, {icon:'map-pin'}); return onCheckoutReturn(); }
  TP.S.st.addressbook = undefined; TP.go('addressbook', { via: 'none' }); TP.notify(ADDRESS_SAVED_ALERT, { icon: 'map-pin' });
});
const homeBanner = S => { const a = TP.homeAddress(); return `<header class="hm-banner" data-in="0"><img class="hm-banner-image" src="/assets/banners/home-storefront-cover-v2.webp" alt="" aria-hidden="true" fetchpriority="high" width="1536" height="1024"><div class="hm-banner-copy"><h2 class="hm-greeting">สวัสดี${S.user.name ? ' คุณ' + esc(S.user.name) : S.user.full ? ' คุณ' + esc(String(S.user.full).trim().split(/\s+/)[0]) : ''}</h2><p class="hm-brand-message">MITRAREE ดูแลคุณ<br>ใกล้กว่าที่เคย</p></div></header>`; };

/* C201: selected nearby pharmacy, using the shared branch records and availability. */
function storeListHtml(S, stores) {
  return `<div class="hm-store-list">${stores.map(b => `<article class="hm-branch-tile">
      <button type="button" class="hm-branch-open" data-sheet="storeinfo" data-p='${esc(JSON.stringify({ branch: b.id }))}' aria-label="ดูข้อมูล${esc(b.name)}">
        <img src="${esc(b.photo || '/assets/stores/pharmacy-thumbnail-v1.png')}" alt="ภาพประกอบร้านยาจำลอง" width="96" height="96" loading="lazy">
        <span class="hm-branch-copy"><strong>${esc(b.name)}</strong><span class="hm-branch-status">${ui.tag(...homeBranchStatus(S,b), {dot:true})}</span><span class="hm-branch-meta"><span class="hm-branch-distance">${ic('map-pin',14,2)}${TP.homeDistance(b) == null ? 'ไม่ทราบระยะทาง' : TP.homeDistance(b) + ' กม.'}</span><span class="hm-branch-hours">${ic('clock',14,2)}${esc(b.hours)} น.</span></span></span>
        ${ic('chevron-right',16,2)}
      </button>
    </article>`).join('')}</div>`;
}

function nearbyStoresHtml(S) {
  const address = TP.homeAddress(), stores = TP.homeStores();
  const unknown = !!address && TP.BRANCHES.length > 0 && !TP.BRANCHES.some(b => TP.homeDistance(b) != null);
  if (!address) return `<section class="hm-nearby"><div class="hm-section-head"><h2>ร้านยาใกล้ฉัน</h2></div><div class="hm-empty">${ui.emptyArt(!address?'map-pin':'store')}<h3>${!address ? 'เลือกที่อยู่จัดส่งก่อน' : 'ยังไม่มีร้านยาในบริเวณนี้'}</h3><p>${!address ? 'เพิ่มหรือเลือกที่อยู่เพื่อค้นหาร้านยาใกล้คุณ' : 'เลือกที่อยู่อื่น หรือแก้ไขข้อมูลในสมุดที่อยู่'}</p>${ui.btn(address ? 'เปลี่ยนที่อยู่' : 'เลือกที่อยู่จัดส่ง', { sheet: 'homeaddress', a: 'hmOpenAddress' })}</div></section>`;
  return `<section class="hm-nearby" aria-labelledby="hmNearbyTitle" data-in="1">
    <div class="hm-section-head"><h2 id="hmNearbyTitle">ร้านยาใกล้ฉัน</h2></div>
    ${storeListHtml(S, unknown ? TP.BRANCHES : [...stores,...TP.BRANCHES.filter(x=>TP.homeDistance(x)>TP.ZONE_KM).sort((a,b)=>TP.homeDistance(a)-TP.homeDistance(b))])}
    ${S.autoReason ? `<p class="hm-store-notice">${ic('info', 16, 2)}<span>${esc(S.autoReason)}</span></p>` : ''}

  </section>`;
}
TP.sheetDef('allbranches', {
  group: 'before', title: 'สาขาทั้งหมด', code: 'C213', hidden: true, host: 'home', tall: true,
  states: [['normal', 'หลายสาขา'], ['noaddress', 'ยังไม่มีที่อยู่'], ['closed', 'ร้านปิด']],
  prep(S) { TP.homeScenario(S, S.st.allbranches === 'noaddress' ? 'noaddress' : 'normal'); if (S.st.allbranches === 'closed') S.storeOpen = false; },
  render(ctx) { const S = ctx.S, address = TP.homeAddress(); return `<p class="small">${address ? 'ระยะทางอ้างอิงจาก ' + esc(TP.fmtAddr(address)) : 'ดูข้อมูลได้ทุกสาขา เลือกที่อยู่บนหน้าแรกเพื่อดูสาขาที่จัดส่งได้'}</p><div class="hm-address-list">${[...TP.BRANCHES].sort((a,b) => (TP.homeDistance(a) ?? Infinity) - (TP.homeDistance(b) ?? Infinity)).map(b => {
    const km = TP.homeDistance(b), closed = homeBranchClosed(S,b), eligible = !closed && km != null && km <= TP.ZONE_KM;
    const [status] = homeBranchStatus(S,b);
    return `<article class="hm-address-card"><div class="all-branch-head"><h3>${esc(b.name)}</h3>${b.id === S.branch ? '<span class="tag">สาขาที่เลือก</span>' : ''}</div><p>${status}${km == null ? '' : ' · ' + km + ' กม.'}</p><p>${esc(b.area)} · ${esc(b.hours)} น.</p>${address && !eligible && !closed ? `<p class="all-branch-note">${km == null ? 'ยังตรวจสอบระยะทางจากที่อยู่นี้ไม่ได้' : 'อยู่นอกพื้นที่จัดส่งของที่อยู่ที่เลือก'}</p>` : ''}<div class="hm-address-actions">${ui.btn('ข้อมูลร้าน', { kind: 'secondary', sm: true, sheet: 'storeinfo', p: { branch: b.id } })}<button type="button" class="btn sm" data-a="hmSelectAllBranch" data-v="${b.id}" ${eligible ? '' : 'disabled'}>${!address ? 'เลือกที่อยู่ก่อน' : b.id === S.branch ? 'เลือกอยู่' : 'ใช้สาขานี้'}</button></div></article>`;
  }).join('')}</div>`; }
});
TP.act('hmSelectAllBranch', async t => {
  const b = TP.homeStores().find(b => b.id === t.dataset.v); if (!b || homeBranchClosed(TP.S,b)) return;
  TP.S.branch = b.id; TP.S.branchPicked = true; TP.S.autoReason = '';
  await TP.closeSheet({ instant: true }); TP.refresh({ anim: false });
});

TP.sheetDef('storeinfo', {
  group: 'before', title: 'ข้อมูลร้านและเภสัชกร', code: 'C212', host: 'home', tall: true,
  notes: ['เปิดจากแท็บรับที่ร้านใน C308 ได้ด้วย: ไม่แสดงปุ่มปรึกษา ปิดแล้วกลับหน้าสรุปคำสั่งซื้อเดิม', 'แสดงเปิดรับบริการหรือปิดรับบริการเหมือนหน้าแรก สาขานอกเขต 15 กม. แสดงนอกพื้นที่ให้บริการ ดูรายละเอียดร้านได้ทุกกรณี'],
  states: [['normal', 'เปิดรับบริการ'], ['closed', 'ปิดรับบริการ', true, 3], ['outside', 'ยังตรวจสอบระยะทางไม่ได้', true, 4], ['license', 'ตรวจใบอนุญาตร้านยา', true, 7], ['outside-known','สาขาอยู่ไกลเกิน 15 กม.', true, 9]],
  prep(S) {
    const st = S.st.storeinfo;
    if (!st) return;
    TP.homeScenario(S, st === 'outside' ? 'unknownarea' : st === 'outside-known' ? 'outarea' : 'normal');
    S.storeOpen = st !== 'closed';
    S.branchState[S.branch] = st === 'closed' ? 'closed' : 'open';
    S.sysOff = TP.flag('sysOff');
  },
  render(ctx) {
    const b = TP.branch(ctx.params?.branch) || TP.branch(), ph = TP.PHARM[b.pharm], S = ctx.S;
    const closed = homeBranchClosed(S,b);
    const outside = homeBranchOutside(b), km = TP.homeDistance(b);
    const [status, tone] = homeBranchStatus(S,b);
    return `<div class="bc-detail bc-organized">
      <section class="bc-overview" aria-label="ภาพรวมร้านยา">
        <img class="bc-detail-photo" src="${esc(b.photo || '/assets/stores/pharmacy-thumbnail-v1.png')}" alt="ภาพประกอบร้านยาจำลอง" width="1536" height="1024">
        <div class="bc-identity-head"><div class="bc-identity"><h3>${esc(b.name)}</h3><p>${esc(b.area)}</p></div></div>
        <div class="bc-availability">${ui.tag(status,tone,{dot:true})}<span>${outside ? (km == null ? 'ยังตรวจสอบระยะจากที่อยู่ที่เลือกไม่ได้' : 'สาขานี้อยู่ห่างเกิน 15 กม. จึงเริ่มปรึกษาไม่ได้') : closed ? 'ขณะนี้ยังเริ่มปรึกษาไม่ได้' : ''}</span></div>
        <dl class="bc-facts"><div><dt>${ic('clock',16,2)}เวลาทำการ</dt><dd>${esc(b.hours)} น.</dd></div><div><dt>${ic('map-pin',16,2)}ระยะจากที่อยู่จัดส่ง</dt><dd>${km == null ? 'ไม่ทราบระยะทาง' : esc(km)+' กม.'}</dd></div></dl>
      </section>
      <section class="bc-section" aria-labelledby="bcLocationTitle"><h4 id="bcLocationTitle">ที่ตั้งและติดต่อร้าน</h4><p class="bc-address">${esc(b.addr)}</p>${b.demo ? '<p class="bc-muted">ข้อมูลจำลองสำหรับแสดงหน้าจอ</p>' : `<div class="hm-store-links"><a href="${esc(b.map)}" target="_blank" rel="noopener noreferrer">${ic('map-pin',18,2)} ดูแผนที่</a><a href="tel:${esc(b.phone)}">${ic('phone',18,2)} โทรหาร้าน</a></div>`}</section>
      <section class="bc-section" aria-labelledby="bcPharmacistTitle"><h4 id="bcPharmacistTitle">เภสัชกรผู้ดูแล</h4><div class="bc-pharmacist-card">${ui.av('',{ini:ph.ini})}<div><b>${esc(ph.short)}</b><span>${closed ? 'ข้อมูลเภสัชกรประจำสาขา' : 'ให้คำปรึกษาประจำสาขานี้'}</span><small>ใบประกอบวิชาชีพ ${esc(ph.lic)}</small></div></div></section>
      <details class="bc-license" ${S.st.storeinfo === 'license' ? 'open' : ''}><summary>${ic('shield-check',18,2)} ข้อมูลใบอนุญาตร้านยา ${ic('chevron-down',16,2)}</summary><dl><div><dt>เลขใบอนุญาตร้านยา</dt><dd>${esc(b.lic)}</dd></div></dl></details>
    </div>`;
  },
  afterClose: ctx => ctx.params?.fromPay ? TP.reopenCheckout?.(ctx) : undefined,
  foot(ctx) {
    const b = TP.branch(ctx.params?.branch) || TP.branch();
    /* opened from the C308 pickup tab: read only, closing returns to the same checkout */
    if (ctx.params?.fromPay) return '';
    if (TP.caseOpen()) return ui.btn('กลับไปการปรึกษาที่ค้าง', { a: 'hmReturnCase', icon: 'message-circle' });
    if (homeBranchClosed(ctx.S,b) || !TP.homeStores().some(x => x.id === b.id)) return '';
    return `<div class="hm-consult-options"><div class="bc-action-heading"><p>ปรึกษาเภสัช</p><small>ไม่มีค่าปรึกษา · จ่ายเฉพาะเมื่อซื้อยา</small></div><div><button type="button" class="btn" data-a="hmConsultMode" data-v="chat" data-branch="${b.id}">${ic('message-circle',20,2)}<span>ปรึกษาเภสัช</span></button></div></div>`;
  }
});
TP.act('hmConsultMode', async t => {
  const mode = t.dataset.v, b = TP.homeStores().find(b => b.id === t.dataset.branch);
  if (!['chat','video'].includes(mode) || !b || homeBranchClosed(TP.S,b)) return;
  if (TP.caseOpen()) return;
  TP.S.branch = b.id; TP.S.branchPicked = true;
  await TP.closeSheet({ instant: true }); TP.ACTS.hmStart({ dataset: { mode } });
});
TP.act('hmReturnCase', async () => { await TP.closeSheet({ instant: true }); TP.go(['room','matched'].includes(TP.S.case?.status) ? 'room' : 'queue'); });
TP.act('hmChooseStore', t => {
  const b = TP.homeStores().find(b => b.id === t.dataset.v);
  if (!b || homeBranchClosed(TP.S,b)) return;
  TP.S.branch = b.id; TP.S.branchPicked = true; TP.S.autoReason = '';
  TP.refresh({ anim: false }); TP.notify('เลือก' + b.name + 'แล้ว', { icon: 'map-pin' });
});

function homeActiveCaseCard(S) {
  const c=S.case||{}, b=TP.branch(c.branch)||TP.pickBranch();
  /* User 8 Nov 2026: one waiting card (queue and paused look the same) and one consulting card
     (accepted, chatting, waiting for the customer's reply and an order still in the open chat). */
  const waiting=['queue','paused'].includes(c.status), paused=false, idle=false, pending=false;
  const ph=TP.PHARM[c.pharm||b.pharm]||TP.PHARM.kj;
  const pos=Number.isFinite(c.pos)?Math.max(1,c.pos):null;
  const accepted = c.status === 'matched';
  const status=waiting?'รอเภสัชกร':accepted?'เภสัชรับคิวแล้ว':'กำลังปรึกษา';
  const title=waiting?(pos===1?'คุณเป็นคิวถัดไป':pos?`มีผู้รอก่อนคุณ ${pos-1} คน`:'รอเภสัชกรรับคิว'):accepted?'ถึงคิวปรึกษาของคุณแล้ว':c.fromOf?'เภสัชกรตอบคำถามแล้ว':'กลับไปปรึกษาต่อได้เลย';
  const help=waiting?(S.notif===false?'เปิดแอปไว้เพื่อติดตามคิว การแจ้งเตือนปิดอยู่':'ออกจากหน้านี้ได้ เราจะแจ้งเตือนเมื่อเภสัชกรรับคิว'):'การปรึกษานี้ยังไม่จบ กลับไปคุยในห้องเดิมได้';
  const cta=waiting?'ดูคิวปรึกษา':accepted?'เข้าห้องปรึกษา':c.fromOf?'อ่านคำตอบ':'กลับไปปรึกษาต่อ';
  return `<article class="hm-active-case case-progress-card" aria-labelledby="hmActiveTitle" data-in="1">
    <div class="consult-status-hero"><span class="case-status-watermark" aria-hidden="true">${ic(paused?'pause':waiting?'clock':pending?'credit-card':idle?'message-circle':'stethoscope',160,1.4)}</span><header class="hm-active-top case-progress-head"><span class="case-progress-icon" aria-hidden="true">${ic(paused?'pause':waiting?'clock':pending?'credit-card':idle?'message-circle':'stethoscope',22,1.8)}</span><span class="hm-active-label">การปรึกษาของคุณ</span><span class="hm-active-status" data-tone="${waiting?'waiting':'active'}"><i class="hm-active-status-dot" aria-hidden="true"></i>${status}</span></header>
    <h2 id="hmActiveTitle" class="consult-status-title" aria-label="${esc(title)}">${esc(title)}</h2></div>
    <div class="case-progress-body"><div class="hm-active-provider">${ui.av('',{ini:ph.ini,img:TP.demoProfiles?.[ph.id==='tp'?'pharmacist_m':'pharmacist_f']})}<div><b>${esc(ph.short)}</b><span>${waiting?'เภสัชกรประจำสาขา':'เภสัชกรผู้ดูแล'} · ${esc(b.name)}</span></div></div>
    ${!waiting||paused||S.notif===false?`<p class="hm-active-help">${ic(waiting?'bell':'info',16,2)}<span>${esc(help)}</span></p>`:''}
    </div><footer class="case-progress-foot">${ui.btn(cta,{go:waiting?'queue':'room',via:waiting?'morph':'cover',iconRight:'arrow-right',cls:'hm-active-cta'})}</footer>
  </article>`;
}

TP.homeActiveCaseCard = homeActiveCaseCard;
function heroHtml(S) {
  if (TP.caseOpen()) return homeActiveCaseCard(S);
  TP.pickBranch();
  return nearbyStoresHtml(S);
}

function homeConsultBanner(S) {
  const active=TP.caseOpen();
  return `<article class="hm-consult-banner" aria-labelledby="homeConsultTitle"><img class="hm-consult-banner-art" src="/assets/banners/pharmacy-female-counter-v1.webp" alt="" width="1536" height="1024" decoding="async"><div class="hm-consult-banner-copy"><h2 id="homeConsultTitle">เรื่องยา<br>ถามเภสัชได้</h2><p>เล่าอาการหรือถามเรื่องยา<br>ให้เภสัชกรช่วยแนะนำ</p>${ui.btn(active?'คุยกับเภสัชต่อ':'ปรึกษาเภสัช',{a:'quickConsult',kind:'white',iconRight:'arrow-right',cls:'hm-consult-banner-cta'})}</div></article>`;
}

TP.screen('home', {
  group: 'before', title: 'หน้าแรก', code: 'C201', ref: 'C01', tab: 'home', sb: 'light',
  states: [['normal', 'ปกติ · 2 สาขา'], ['loading', 'กำลังโหลด'], ['outarea', 'นอกพื้นที่ให้บริการทุกสาขา', true, 8], ['unknownarea', 'ตรวจสอบพื้นที่ไม่ได้', true, 9], ["case-queue3", "จำลอง รออีก 3 คิว", true, 48], ["case-next", "จำลอง คิวถัดไป", true, 51], ["case-matched", "เภสัชรับคิวแล้ว · เปิดแชทจากหน้าแรก", true, 80], ["case-chat", "จำลอง กำลังปรึกษา", true, 54], ["case-closed-unpaid","จบแชท รอชำระค่ายา", true, 60], ["case-delivery-preparing","ส่งด่วน · เตรียมการจัดส่ง", true, 65], ["case-delivery-delivering","ส่งด่วน · อยู่ระหว่างการจัดส่ง", true, 67], ["case-pickup-preparing","รับที่ร้าน · เตรียมการจัดส่ง", true, 69], ["case-pickup-ready","รับที่ร้าน · เตรียมสินค้าเรียบร้อยแล้ว", true, 70], ['multiple-fulfillments', '2 คำสั่งซื้อ · ส่งด่วนและรับที่ร้าน', true, 79]],
  notes: ['C201.8 ไม่มีร้านในรัศมี 15 กม. ยังคงแสดงร้านพร้อมสถานะอยู่นอกพื้นที่ให้บริการ กดเมนูหรือแบนเนอร์ปรึกษาเปิด Bottom Sheet C216 พร้อมภาพ หัวข้อ คำอธิบาย และปุ่มปิด คงหน้าเดิม ไม่เข้าฟอร์มหรือคิว; ระยะเท่ากับ 15 กม. ยังอยู่ในเขต', 'คำสั่งซื้อที่ชำระแล้วหลายรายการ (C201.79) แสดงเป็น carousel การ์ดละ 1 คำสั่งซื้อ ปัดซ้ายขวา การ์ดถัดไปโผล่ให้เห็น จุดบอกตำแหน่งตามการเลื่อน แตะการ์ดเปิดสถานะคำสั่งซื้อนั้น', 'ระหว่างเตรียมยา เรียกไรเดอร์ กำลังส่งยา และรอรับยาที่ร้าน แสดงแบนเนอร์ปรึกษาใต้แถบสถานะยาเพื่อเริ่มปรึกษาครั้งใหม่ได้ ซ่อนเมื่อมีคิวหรือเคสปรึกษาที่ยังไม่จบ หรือรายการรอชำระเงิน', 'มีสาขาตลาดเวิลด์และสาขาอ่อนนุช ในเขต 15 กม. แสดงเปิดรับบริการหรือปิดรับบริการ นอกเขตแสดงนอกพื้นที่ให้บริการและยังเปิดดูรายละเอียดได้', 'C201: การ์ดร้านใกล้ฉันแสดงระยะทาง เวลาเปิด คิว และข้อมูลร้าน กดเปลี่ยนสาขาหรือเลือกจากสาขาอื่นได้', 'บอกว่าไม่มีค่าปรึกษา จ่ายเฉพาะเมื่อซื้อยา (ตัวเล็ก ไม่ชูคำว่าฟรี)', 'A8: ไม่มีเบอร์ 1669 บนหน้าแรก ข้อความน้อยที่สุด', 'มีเคสค้าง: แสดงสถานะเคสก่อนข้อมูลร้าน กลับเข้าการปรึกษาได้ทันที'],
  prep(S) {
    const st = S.st.home; delete S._homeFulfillmentPreviewCases; TP.homeScenario(S, st || 'normal'); if (!st) return;
    if(st==='multiple-fulfillments'){
      TP.casePreview.seed('pickup-ready');
      const pickup=structuredClone(S.case);pickup.id='preview-home-pickup';pickup.order.no='MT202610180701';
      TP.casePreview.seed('delivery-delivering');S.case.order.no='MT202610180702';
      S._homeFulfillmentPreviewCases=[pickup];S._homeEventPreview=true;return;
    }
    if(st.startsWith('case-')){if(st.startsWith('case-parcel-') && flowPreview && new URLSearchParams(location.search).get('cardPreview')==='1')TP.fulfillmentPreview(TP.newCase(),st.slice(5));else TP.casePreview.seed(st.slice(5));S._homeEventPreview=true;return;}
    S.case=null;S._paymentCase=null;S.pay=null;S.call=null;S._homeEventPreview=true;
    S.branchState = TP.fresh().branchState;
    S.storeOpen = TP.flag('storeOpen'); S.branchPicked = false;
    S.queueLen={...TP.fresh().queueLen};S.sysOff=TP.flag('sysOff');
    TP.emit('state');
  },
  render(ctx) {
    const S = ctx.S, st = ctx.state;
    // Isolated gallery adapter: reuse production renderers and existing preview fixtures.
    if (flowPreview && new URLSearchParams(location.search).get('cardPreview') === '1') {
      const view = {...S, history: []};
      const card = TP.paymentReminderCard?.(view, null, { pendingOnly: true }) || TP.fulfillmentCard?.(view, {compact:true}) || (TP.caseOpen() ? homeActiveCaseCard(view) : '');
      return ui.page('<div class="consultation-card-preview">' + card + '</div>', {nonav: true});
    }
    const head = homeBanner(S);
    if (st === 'loading') {
      return ui.page(`<div class="hm-content">${head}<div class="hm-loading" aria-busy="true" aria-label="กำลังโหลดหน้าหลัก"><div class="skel hm-loading-card"></div><div class="skel hm-loading-card"></div></div></div>`, { nonav: true });
    }
    const updates = [TP.orderReadyRow?.(S, { din: 2 }) || '',
      S.ofPending ? ui.group([ui.row({ icon: 'message-square-text', title: 'คำถามที่ฝากไว้', sub: `${S.ofPending.whoName} · ฝากไว้ ${S.ofPending.at} · เภสัชกรจะตอบ${TP.OF_REPLY}`, chev: false })]) : ''
    ].filter(Boolean).join('');
    const cardState = S._homeEventPreview ? {...S, history:(S._homeFulfillmentPreviewCases||[]).map(c=>({_case:c}))} : S;
    const paymentCard = TP.paymentReminderCard?.(cardState, null, { pendingOnly: true }) || '';
    const deliveryCard = TP.fulfillmentCard?.(cardState, {compact:true}) || '';
    const activeCase = TP.caseOpen();
    const consultBanner = paymentCard || activeCase || (updates && !deliveryCard) ? '' : homeConsultBanner(S);
    const address=TP.homeAddress();
    const delivery=address?`<button type="button" class="hm-delivery-bar" data-sheet="homeaddress" aria-haspopup="dialog" aria-label="เลือกที่อยู่จัดส่ง: ${esc(TP.fmtAddr(address))}">${ic('map-pin',20,1.8)}<span>ที่อยู่จัดส่ง</span><b>${esc(TP.fmtAddr(address))}</b>${ic('chevron-down',18,2)}</button>`:'';
    /* Quick menu under the address bar removed (user 8 Nov 2026); health, addresses and settings stay in the account tab. */
    return ui.page(`<div class="hm-content">${head}
      ${delivery}
      ${paymentCard}${deliveryCard}
      ${activeCase ? heroHtml(S)+nearbyStoresHtml(S) : consultBanner+heroHtml(S)}
      ${updates ? `<section class="hm-updates" aria-label="การดูแลของคุณ"><h2 class="hm-section-title">การดูแลของคุณ</h2>${updates}</section>` : ''}

      </div>`, { nonav: true });
  },
  mount(el) { TP.mountFulfillmentCarousel(el); }
});
/* consult switched off from the back office (C17): the start button leads to sysoff, the rest of the app still works */
/* asked once, after the first consult (owner 19/10/2026) */
TP.act('hmStart', t => {
  const S = TP.S;
  if (TP.caseOpen()) return TP.go(['room','matched'].includes(S.case?.status)?'room':'queue');
  if (!TP.homeAddress() || !TP.homeStores().length) return TP.ACTS.quickConsult();
  if (S.case && !TP.caseOpen()) Object.assign(S.intake, { who: 'me', symptoms: [], custom: [], otherOpen: false, urgent: [], note: '', photos: 0, attachments: [], duration: '', pregnancy: '', allergyReviewed: false });
  if (['chat','video'].includes(t?.dataset?.mode)) S.intake.mode = t.dataset.mode;
  TP.go('intake');
});
/* C209 service area screen removed (user 8 Nov 2026). Code C209 stays reserved; the delivery zone is still checked at checkout (C308). */

/* ---------- branch sheet (C03, A10 queue counts) ---------- */

/* =====================================================================
   Intake (C04): one screen, chips first, allergy prefilled not required
   ===================================================================== */
/* two relatives with the same first name show the full name, so the chips stay distinguishable */
const symptomOptions = ['ไข้ หวัด', 'ไอ เจ็บคอ', 'ปวดหัว', 'ปวดเมื่อย ปวดหลัง', 'ปวดท้อง ท้องเสีย', 'ผื่น คัน แผล', 'สุขภาพผู้หญิง', 'ปรึกษาเรื่องอื่น'];
const durationOptions = ['วันนี้', '1–3 วัน', '4–7 วัน', 'เกิน 1 สัปดาห์'];
const pregnancyOptions = ['ไม่ใช่', 'ตั้งครรภ์', 'ให้นมบุตร'];
const intakeHeading = (step, title, required = false, hint = '') => `<div class="ik-section-heading"><span aria-hidden="true">${step}</span><h2 class="ik-h" id="intakeStep${step}">${title}${required ? ' <span class="reg-required">*</span>' : ''}${hint ? ` <small class="ik-field-hint">${esc(hint)}</small>` : ''}</h2></div>`;
const intakeChoices = (options, selected, action, step, multi = false) => `<div class="${multi ? 'ik-symptom-grid' : 'ik-extra-choices'}" role="group" aria-labelledby="intakeStep${step}">
  ${options.map(value => `<button type="button" class="btn secondary" data-a="${action}" data-v="${esc(value)}" aria-pressed="${selected.includes(value)}">${esc(value)}</button>`).join('')}
</div>`;
TP.intakeReady = I => !!I.symptoms?.length && (I.allergyReviewed || TP.healthRecord(TP.S.user).allergies.mode !== 'unknown');
TP.intakeDetails = c => [
  c.symptoms?.join(', '),
  c.note,
  c.intakeAllergy && 'ประวัติแพ้ยา: ' + c.intakeAllergy,
  c.duration && 'ระยะเวลาที่มีอาการ: ' + c.duration,
  c.pregnancy && 'ตั้งครรภ์หรือให้นมบุตร: ' + c.pregnancy,
].filter(Boolean);
TP.urgentFor = p => TP.URGENT.filter(u => !/ต่ำกว่า 3 เดือน/.test(u) || (!!p?.child && (p.age ?? 99) < 1));
const intakePhotoItems = I => Array.isArray(I.attachments) ? I.attachments : (I.attachments=[]);
TP.intakePhotoBatch = (I,files) => {
  const current=intakePhotoItems(I);
  if(current.length+files.length>3)return 'แนบรูปได้สูงสุด 3 รูป กรุณาเลือกใหม่';
  if(files.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)))return 'เลือกรูป JPG, PNG หรือ WEBP';
  if(files.some(f=>f.size>5*1024*1024))return 'รูปต้องมีขนาดไม่เกิน 5 MB ต่อรูป';
  const added=[];
  try {for(const file of files)added.push({file,url:URL.createObjectURL(file)});}catch(_){for(const f of added)URL.revokeObjectURL(f.url);return 'เปิดรูปไม่สำเร็จ กรุณาเลือกใหม่';}
  I.attachments=[...current,...added];I.photos=I.attachments.length;I.photoError='';return '';
};
const intakePhotosHtml = I => {const images=intakePhotoItems(I);return `<div class="ik-photo-upload" role="group" aria-labelledby="intakeStep4"><input id="ikPhotos" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden>${images.length<3?`<button type="button" class="ik-photo" data-a="addPhoto"><span class="ik-upload-icon">${ic('upload',24,1.8)}</span><span class="ik-upload-title">แตะเพื่อแนบรูปอาการหรือฉลากยา</span><span class="ik-upload-help">สูงสุด 3 รูป · JPG, PNG, WEBP<br>ไม่เกิน 5 MB ต่อรูป</span></button>`:''}${images.length?`<div class="ik-photo-grid" aria-label="รูปที่แนบ">${images.map((f,i)=>`<figure><img src="${esc(f.url)}" alt="รูปที่แนบ ${i+1}"><button type="button" class="ik-photo-remove" data-a="ikPhotoRemove" data-v="${i}" aria-label="ลบรูปที่ ${i+1}">${ic('x',16,2)}</button></figure>`).join('')}</div>`:''}<p id="ikPhotoError" class="err-t" role="alert" ${I.photoError?'':'hidden'}>${esc(I.photoError||'')}</p></div>`;};

/* C203 preview mock: preview panel only, never part of the customer UI. */
const intakeMock = {
  canFill: ctx => { const I = ctx?.S?.intake; return !!I && (!I.symptoms?.length || !I.duration); },
  fill(ctx) {
    const I = ctx.S.intake;
    if (!I.symptoms?.length) I.symptoms = ['ไอ เจ็บคอ'];
    I.duration ||= '1–3 วัน';
    TP.refresh({ anim: false });
  }
};
TP.screen('intake', {
  previewMock: intakeMock,
  group: 'before', title: 'แจ้งอาการ', code: 'C203', ref: 'C04', parent: 'home', cls:'intake-cover-screen', sb:'dark',
  states: [["normal", "ว่าง"], ["filled", "กรอกแล้ว"], ["outzone", "ที่อยู่หลักนอกเขตส่งยา", true, 7], ["photos", "แนบรูป 3 รูป", true, 12], ["photo-error", "แนบไฟล์ไม่รองรับ", true, 13], ["multi-symptom", "หลายอาการ พร้อมระยะเวลาและให้นมบุตร", true, 14], ["allergy-unknown", "ยังไม่ทราบประวัติแพ้ยา · กดยืนยัน", true, 15]],
  notes: ['ตัวเลือกอาการ ระยะเวลา และตั้งครรภ์หรือให้นมบุตรใช้บล็อกสองคอลัมน์ อาการเลือกได้หลายข้อด้วยการกดทั้งกล่อง',
    'เลือกปรึกษาเรื่องอื่นเมื่อไม่มีอาการในรายการ และแนบรูปเพิ่มเติมได้', 'ดึงประวัติแพ้ยาจากบัญชี แก้ไขหรือยืนยันว่าไม่ทราบได้ก่อนส่ง', 'C203 ไม่มีหมวดตรวจอาการอันตรายแล้ว ไม่มีตัวเลือกวิธีปรึกษาในฟอร์ม ลำดับคือ 1 อาการที่ต้องการปรึกษา 2 ระยะเวลาที่มีอาการ 3 ตั้งครรภ์หรือให้นมบุตร 4 แนบรูปเพิ่มเติม 5 ข้อมูลก่อนปรึกษา รับวิธีปรึกษาจากทางเข้าเดิมและเปิดวิดีโอในห้องได้; คงคำแนะนำฉุกเฉินในบริบทอื่นตามเดิม', 'ข้อมูลยังอยู่ในเครื่องจนกด "เข้าคิวปรึกษา"', 'แผงทดสอบมีปุ่มมอคข้อมูล เติมอาการและรายละเอียดเฉพาะช่องที่ว่าง ไม่ติ๊กรับทราบให้',
    'A2 (ประกาศ อย. ข้อ 2.1(3) "ก่อนการให้บริการ" = ทุกเคส): ติ๊ก รับทราบขั้นตอนและความเสี่ยง ก่อนกดเข้าคิว · ครั้งแรกเปิดข้อความเต็มให้อ่าน ครั้งต่อไปพับไว้ แตะเปิดอ่านได้ · ไม่ติ๊กแล้วกดเข้าคิว = พาไปที่ช่องติ๊ก บอกว่าต้องติ๊กก่อน · เก็บเวลาและเลขฉบับข้อความกับเคส ส่งให้คอนโซล (B8) · อ่านซ้ำได้ที่ C207 (C203.7)',
    'A1 (C203.8): ที่อยู่หลักอยู่นอกเขตส่งยา บอกก่อนเข้าคิวว่าถ้าต้องซื้อยา รับที่ร้านได้อย่างเดียว ปรึกษาได้ตามปกติ · ไม่บังคับเปลี่ยนที่อยู่'],
  wait: ['ข้อความขั้นตอนและความเสี่ยง (A2) ให้เภสัชกรและฝ่ายกฎหมายตรวจก่อนใช้จริง', 'ฝากคำถามตอนร้านปิด ต้องติ๊กรับทราบด้วยไหม (ต้นแบบยังไม่ให้ติ๊ก)', 'ปรึกษาใหม่ต่อจากเคสที่ระบบปิดเพราะเงียบ และย้ายคิวไปสาขาอื่น ใช้การรับทราบของเคสเดิมได้ไหม (ต้นแบบใช้ของเคสเดิม ไม่ถามซ้ำ)'],
  prep(S) {
    const st = S.st.intake;
    if (st) Object.assign(S.intake, { attachments:[], photoError:'', otherText:'', custom: [], otherOpen: false, ack: false, duration: '', pregnancy: '', allergyReviewed: false });
    if (st) { S.addrs = TP.fresh().addrs; if (st === 'outzone') S.addrs = [{ ...TP.ZONE_ADDR, main: true }, ...S.addrs.map(a => ({ ...a, main: false }))]; }
    if (['filled', 'outzone', 'multi-symptom', 'allergy-unknown'].includes(st)) Object.assign(S.intake, {
      who: 'me', symptoms: st === 'multi-symptom' ? ['ไข้ หวัด', 'ไอ เจ็บคอ'] : ['ไอ เจ็บคอ'],
      note: '', urgent: [],
      duration: st === 'multi-symptom' ? '1–3 วัน' : '', pregnancy: st === 'multi-symptom' ? 'ให้นมบุตร' : ''
    });

    else if (st) Object.assign(S.intake, { who: 'me', symptoms: [], note: '', urgent: [], photos: 0 });
    if(st==='photos')S.intake.attachments=['/assets/stores/pharmacy-thumbnail-v1.png','/assets/photos/pharmacist-v1.png','/assets/photos/customer-v1.png'].map(url=>({url,preview:true}));
    if(st==='photo-error'){S.intake.photoError='เลือกรูป JPG, PNG หรือ WEBP';S.intake.attachments=[];}
    // Retired urgent preview suffix is preserved; this form no longer collects red flags.
    if (st) { S.user.allergyState = st === 'allergy-unknown' ? 'unknown' : 'set'; S.user.allergies = st === 'allergy-unknown' ? [] : ['แอสไพริน']; }
  },
  render(ctx) {
    const S = ctx.S, I = S.intake;I.urgent=[];I.who='me';if(!['chat','video'].includes(I.mode))I.mode='chat';if(I.otherOpen&&I.otherText?.trim()){I.note=[I.note,I.otherText].filter(Boolean).join('\n');I.otherOpen=false;I.otherText='';}
    const p = TP.person('me'), b = TP.pickBranch();
    const record=TP.healthRecord(p);
    const healthRows=[['allergies','ประวัติแพ้ยา','octagon-alert','ไม่มีประวัติแพ้ยา'],['meds','ยาที่ใช้ประจำ','pill','ไม่มียาที่ใช้ประจำ'],['conditions','โรคประจำตัว','heart-pulse','ไม่มีโรคประจำตัว']];
    const healthRow=(key,title,icon,text)=>`<button type="button" class="ik-health-row" data-a="afHdFieldOpen" data-v="${key}" aria-label="แก้ไข${esc(title)}"><span class="inbox-item-icon" aria-hidden="true">${ic(icon,20,1.8)}</span><span class="ik-health-copy"><b>${esc(title)}</b><span class="ik-health-value">${esc(text)}</span></span>${ic('pencil',18,1.8)}</button>`;
    const ready = TP.intakeReady(I), shut = S.storeOpen === false;
    return `<div class="auth-form-scene ik-scene"><img class="auth-form-cover ik-cover" src="/assets/banners/intake-consultation-cover-v1.webp" alt="" width="1536" height="1024"><button type="button" class="auth-form-back" data-back aria-label="ย้อนกลับ">${ic('arrow-left',22,2)}<span>กลับ</span></button><section class="auth-form-panel ik-form-panel" aria-labelledby="ikPageTitle">` + ui.page(`<header class="ik-intro"><h1 id="ikPageTitle">อยากปรึกษาเภสัชเรื่องอะไร</h1><p>เลือกอาการที่ต้องการคุยกับเภสัชกร</p></header>
      ${shut ? ui.note('<b>ร้านปิดรับปรึกษาอยู่</b><br>คุณยังฝากคำถามให้เภสัชกรตอบเมื่อร้านเปิดได้', {tone:'warn',icon:'moon'}) : ''}
      <section class="ik-sec ik-block">${intakeHeading(1, 'อาการที่ต้องการปรึกษา', true, 'เลือกได้มากกว่า 1 ข้อ')}
        ${intakeChoices(symptomOptions, I.symptoms, 'intakeSymptom', 1, true)}
      </section>
      <section class="ik-sec ik-block">${intakeHeading(2, 'ระยะเวลาที่มีอาการ <small>(ไม่บังคับ)</small>')}
        ${intakeChoices(durationOptions, [I.duration], 'intakeDuration', 2)}
      </section>
      <section class="ik-sec ik-block">${intakeHeading(3, 'ตั้งครรภ์หรือให้นมบุตร <small>(ไม่บังคับ)</small>')}
        ${intakeChoices(pregnancyOptions, [I.pregnancy], 'intakePregnancy', 3)}
      </section>
      <section class="ik-sec ik-block">${intakeHeading(4, 'แนบรูปเพิ่มเติม')}
        ${intakePhotosHtml(I)}
      </section>
      <section class="ik-sec ik-block">${intakeHeading(5, 'ข้อมูลก่อนปรึกษา')}
        ${record.allergies.mode === 'unknown' && !I.allergyReviewed ? ui.btn('ยืนยันว่าฉันยังไม่ทราบประวัติแพ้ยา', { a: 'intakeConfirmAllergy', kind: 'secondary' }) : ''}
        <div class="ik-health-summary">${healthRows.map(([key,title,icon,none])=>healthRow(key,title,icon,record[key].mode==='set'?record[key].text:record[key].mode==='none'?none:'ยังไม่ทราบ')).join('')}</div>

      </section>
      ${shut ? '' : ackHtml(S)}
      ${zoneNote(S, b)}`, {cls: 'ik-form-scroll'}) + `</section></div>` +
      ui.dock(shut ? ui.btn('ร้านปิดรับปรึกษาอยู่', { disabled: true, id: 'ikGo' }) : ui.btn('ปรึกษาเภสัช', { a: 'joinQueue', disabled: !ready || !I.ack, id: 'ikGo' }));
  },
  mount(el,ctx) {
    $('#ikAck',el)?.addEventListener('change',e=>TP.ACTS.ikAck(e.target));
    $('#ikPhotos',el)?.addEventListener('change',e=>{const files=Array.from(e.target.files||[]);e.target.value='';if(!files.length)return;const I=ctx.S.intake,error=TP.intakePhotoBatch(I,files);if(error){I.photoError=error;const message=$('#ikPhotoError',el);if(message){message.hidden=false;message.textContent=error;}return;}TP.refresh({anim:false});});
  }
});
TP.act('intakeSymptom', button => {
  const draft = TP.S.intake, value = button.dataset.v;
  if (!symptomOptions.includes(value)) return;
  const active = draft.symptoms.includes(value);
  draft.symptoms = active ? draft.symptoms.filter(symptom => symptom !== value) : [...draft.symptoms, value];
  button.setAttribute('aria-pressed', String(!active));
  $('#ikGo', TP.cur().el).disabled = !draft.ack || !TP.intakeReady(draft);
});
for (const [action, field, options] of [['intakeDuration', 'duration', durationOptions], ['intakePregnancy', 'pregnancy', pregnancyOptions]]) {
  TP.act(action, button => {
    const value = button.dataset.v;
    if (!options.includes(value)) return;
    TP.S.intake[field] = value;
    $$('button', button.parentElement).forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
  });
}
TP.act('intakeConfirmAllergy', () => {
  TP.S.intake.allergyReviewed = true;
  return TP.refresh({ anim: false });
});
/* A2: one tick per case, the full text opens by itself the first time; the tick, time and text version go with the case */
const ACK_NEED = 'กรุณารับทราบเงื่อนไขเข้ารับบริการก่อนปรึกษา';
const ackHtml = S => `<section class="ik-sec ik-ack" id="ikAckSec" aria-label="เงื่อนไขเข้ารับบริการ"><div class="ik-consent-box"><input type="checkbox" id="ikAck" required aria-labelledby="ikAckLabel" ${S.intake.ack?'checked':''}><div class="ik-consent-copy"><label for="ikAck" id="ikAckLabel">ฉันได้อ่านและรับทราบเงื่อนไขการใช้บริการปรึกษาออนไลน์กับเภสัชกรแล้ว <span class="reg-required" aria-hidden="true">*</span></label> <button type="button" class="reg-consent-link" data-sheet="serviceterms" aria-haspopup="dialog">อ่านเงื่อนไขเข้ารับบริการ</button></div></div></section>`;
TP.sheetDef('serviceterms', {
  group:'before',title:'เงื่อนไขเข้ารับบริการ',code:'C215',host:'intake',hideClose:true,cls:'ik-terms-sheet',
  states:[['normal','อ่านเงื่อนไขบริการ']],
  notes:['รวมข้อตกลงการใช้บริการและคำประกาศความเป็นส่วนตัวสำหรับลูกค้าในแผ่นเดียว','อ่านอย่างเดียว การเปิดหรือปิดแผ่นไม่เปลี่ยนสถานะรับทราบ'],
  render: () => TP.policyDocumentBody(),
  mount: (el, ctx) => TP.mountPolicyDocuments(el, ctx, ['terms', 'notice']),
  foot(){return ui.btn('ปิด',{kind:'secondary',closeSheet:true});}
});
const dockNote = el => { $('.dock .dock-note',el)?.remove(); };
TP.act('ikAck', t => { const I = TP.S.intake; I.ack = typeof t.checked==='boolean'?t.checked:t.getAttribute('aria-checked')==='true'; $('#ikAckSec', TP.cur().el)?.classList.remove('err'); const go=$('#ikGo',TP.cur().el);if(go)go.disabled=!TP.intakeReady(I)||!I.ack; dockNote(TP.cur().el); });
/* A1: the main address is out of the drug zone, said once before the queue (consulting is still fine) */
function zoneNote(S, b) {
  const a = (S.addrs || []).find(x => x.main), z = a && TP.zoneOf(a, b.id);
  if (!z || z.ok) return '';
  const where = esc(`(${a.dist} ${a.prov}${z.km != null ? ` ห่าง ${z.km} กม.` : ''})`);
  /* zone lock OFF (admin, only after the FDA allows it): parcel by Flash or DHL may leave the zone */
  if (!TP.zoneLock()) return `<div class="ik-zone" data-in="4">${ui.note(`<b>ปรึกษาได้ตามปกติ</b> ถ้าซื้อยา: รับยาที่ร้าน${esc(b.name)} · ที่อยู่หลัก ${where} ห่างสาขาเกิน 15 กม. ส่งด่วนไม่ได้`, { icon: 'map-pin' })}</div>`;
  return `<div class="ik-zone" data-in="4">${ui.note(`<b>ปรึกษาได้ตามปกติ</b> ถ้าซื้อยา: รับที่ร้าน${esc(b.name)} · ที่อยู่หลัก ${where} อยู่นอกเขตส่งยา ส่งยาได้ถ้าเลือกที่อยู่ที่ห่างสาขาไม่เกิน 15 กม. ตอนชำระเงิน`, { icon: 'map-pin' })}</div>`;
}
TP.act('addPhoto',()=>{if(intakePhotoItems(TP.S.intake).length<3)$('#ikPhotos',TP.cur()?.el)?.click();});
TP.act('ikPhotoRemove',t=>{const I=TP.S.intake,items=intakePhotoItems(I),index=Number(t.dataset.v);if(!Number.isInteger(index)||index<0||index>=items.length)return;const [removed]=items.splice(index,1);if(removed.url?.startsWith('blob:'))URL.revokeObjectURL(removed.url);I.photos=items.length;I.photoError='';TP.refresh({anim:false});});
/* join: red flag -> consent -> notification ask -> queue */
TP.act('joinQueue', async t => {
  const S = TP.S;
  if(!TP.intakeReady(S.intake))return;
  if (!S.intake.ack) {
    const sec = $('#ikAckSec', TP.cur()?.el), ck = $('#ikAck', sec || undefined); sec?.classList.add('err'); (ck || sec)?.scrollIntoView({ block: 'center', behavior: TP.RED() ? 'auto' : 'smooth' });
    if (ck) { ck.focus({ preventScroll: true }); ck.classList.remove('flash'); void ck.offsetWidth; ck.classList.add('flash'); }
    TP.live(ACK_NEED); TP.notify(ACK_NEED, { icon: 'info' }); return;
  }
  if (!S.consent && !S.user.name && TP.SCREENS.profile) return TP.go('profile', { via: 'cover', params: { phone: (S.user.phone || '').replace(/\D/g, '') } });
  if (!S.notifAsked) return TP.sheet('pushask');
  S._urgentOk = false; S.st.queue = undefined;
  t.classList.add('busy');
  await TP.wait(TP.RED() ? 50 : 650);
  TP.newCase();
  S.case.ack = { at: `${TP.NOW.date} ${TP.NOW.time}`, ver: TP.RISK.ver }; S.riskSeen = true; S.intake.ack = false;
  TP.go('queue', { via: 'morph', from: t, root: false, replace: true });
});
TP.resumeJoin = () => { const go = $('#ikGo', TP.cur()?.el); if (TP.cur()?.id === 'intake' && go) TP.ACTS.joinQueue(go); };

// C204 and C205 retired: health data is edited through the shared health form.
TP.act('call1669', (t, c, e) => { e.preventDefault(); TP.notify('กำลังโทร 1669', { icon: 'phone' }); });


/* ---------- notification ask (first queue join, not at app open) ---------- */
TP.sheetDef('pushask', {
  group: 'before', title: 'เปิดการแจ้งเตือน', code: 'C206', ref: 'K06', host: 'intake', locked: true,
  notes: ['ขอสิทธิ์ตอนเข้าคิวครั้งแรก ไม่ใช่ตอนเปิดแอป', 'ข้อความแจ้งเตือนเป็นคำกลาง ๆ ไม่มีอาการ ชื่อยา หรือยอดเงิน (PDPA)', 'ไม่อนุญาตก็เข้าคิวได้ แต่ต้องเปิดแอปค้างไว้'],
  render: () => `<div class="pa-demo" aria-hidden="true"><div class="pa-ban"><span class="appicon sm">${brand.plus(14)}</span><span><small>MITRAREE · ตอนนี้</small><b>เภสัชกรรับคิวของคุณแล้ว</b><span>แตะเพื่อเข้าห้องปรึกษา</span></span></div></div>
    <p class="body mt16">เราจะแจ้งเมื่อเภสัชกรรับคิว มีข้อความใหม่ หรือรายการยาพร้อมชำระ คุณไม่ต้องเปิดแอปค้างไว้</p>
    <p class="small mt8">${ic('lock', 14, 2)} ข้อความแจ้งเตือนไม่บอกอาการ ชื่อยา หรือยอดเงิน</p>`,
  foot: () => ui.btn('เปิดการแจ้งเตือน', { a: 'pushYes' }) + ui.btn('ไม่ตอนนี้', { kind: 'ghost', a: 'pushNo' })
});
TP.act('pushYes', async () => {
  const sh = TP.phone;
  sh.insertAdjacentHTML('beforeend', `<div class="sysalert" role="alertdialog" aria-label="ระบบขออนุญาต"><div class="sa-box"><b>"MITRAREE" ต้องการส่งการแจ้งเตือนถึงคุณ</b><p>การแจ้งเตือนอาจรวมถึงการแจ้งเตือน เสียง และป้ายไอคอน</p><div class="sa-bt"><button type="button" data-a="pushSys" data-v="0">ไม่อนุญาต</button><button type="button" data-a="pushSys" data-v="1"><b>อนุญาต</b></button></div></div></div>`);
  A($('.sa-box', sh), [{ opacity: 0, transform: 'scale(1.12)' }, { opacity: 1, transform: 'none' }], { d: 320, e: E.out });
});
TP.act('pushSys', async t => { $('.sysalert', TP.phone)?.remove(); TP.S.notifAsked = true; TP.S.notif = t.dataset.v === '1'; await TP.closeSheet(); TP.resumeJoin(); });
TP.act('pushNo', async () => { TP.S.notifAsked = true; TP.S.notif = false; await TP.closeSheet(); TP.resumeJoin(); });
})();

/* ===== 62-queue.js ===== */
/* =====================================================================
   62 · Queue: queue, lock screen, matched, and the queue edge screens
        (branch closed, expired, offline question, declined) + pharmacist sims
   ===================================================================== */
(() => {
const { $, $$, esc, ic, ui, brand, A, E, SP, fin } = TP;
const C = () => TP.S.case;
const ph = () => TP.PHARM[C()?.pharm || TP.branch().pharm];
const ensureCase = (status = 'queue') => { if (!TP.caseOpen()) TP.newCase(); const c = C(); if (status) c.status = status; if (!c.symptoms.length && !c.note) { c.symptoms = ['ไข้', 'เจ็บคอ']; c.note = 'เป็นมา 2 วัน กลืนแล้วเจ็บ'; } return c; };
TP.ensureCase = ensureCase;

/* mini bar above the tab bar while a case is open */
TP.miniInfo = () => {
  const c = C();
  if (!c || TP.cur()?.id === 'home' || c.order?.status === 'paid' || (c.status === 'closed' && c.order?.status !== 'pending')) return null;
  const b = TP.branch(c.branch);
  if (c.idle && c.status !== 'closed') return { icon:'reply', title: 'เภสัชกรรอคำตอบอยู่', sub: 'ไม่ตอบใน 2 นาที การปรึกษาจะปิด', go: 'room', cta: 'กลับไปตอบ' };
  if (c.order?.status === 'pending') return { icon:'payment', title: 'รายการยารอชำระ', sub: `เหลือเวลาชำระ ${TP.orderRemaining?.(c.order)||'15:00'}`, orderCase:c.id, go: 'room', cta: 'ชำระเงิน' };
  if (c.status === 'matched') return {icon:'chat',title:'เภสัชกรรับคิวแล้ว',sub:`${ph().short} · ${b.short}`,go:'room',cta:'เข้าห้องปรึกษา'};
  if (c.status === 'queue') return { icon:'waiting', title: c.pos <= 1 ? 'คุณเป็นคิวถัดไป' : `รออีก ${c.pos-1} คิว`, sub: b.name, go: 'queue', cta: 'ดูคิวปรึกษา' };
  if (c.status === 'paused') return { icon:'paused', title: 'เภสัชกรพักชั่วคราว', sub: 'คิวของคุณยังอยู่ ไม่เสียคิว', go: 'queue', cta: 'กลับเข้าแชท' };
  return { icon:'chat', title: 'กำลังปรึกษา', sub: `${ph().short} · ${b.short}`, go: 'room', cta: 'กลับเข้าห้อง' };
};

/* =====================================================================
   Queue (C08)
   ===================================================================== */
const statusLine = c => c.status === 'paused'
  ? `${ui.tag('พักชั่วคราว', 'on-teal', { dot: true })}<span>เภสัชกรดูแลหน้าร้านอยู่ คิวของคุณยังอยู่ ไม่เสียคิว</span>`
  : c.pos <= 1 ? `${ui.tag('คิวถัดไป', 'on-teal', { dot: true, live: true })}<span>รอเภสัชกรรับการปรึกษาของคุณ</span>`
  : `${ui.tag('รอเภสัชกรรับคิว', 'on-teal', { dot: true, live: true })}<span>มีผู้รอก่อนคุณ ${Math.max(0, c.pos - 1)} คน</span>`;
/* A3 (FDA notice 2.1(1), FDA review 20/10): the photo is the one the store camera took when the pharmacist started the shift
   (console S102), the tag says when, and the store licence belongs to the branch. Mask (owner 21/10): the Pharmacy Council photo stands in
   for the camera shot where the council has one (ขวัญใจ), initials where it has none (ธัชพล) */
TP.passHtml = (p, b, o = {}) => `<div class="pass${o.cls ? ' ' + o.cls : ''}" data-tilt="4" ${o.din ? `data-in="${o.din}"` : ''}>${brand.guilloche({ w: 360, h: 170, cx: 340, cy: 10, n: 14, r0: 20, r1: 170, k: 18, a: 6 })}
  <div class="ps-top"><span class="caps brand-t">${esc(o.label || 'เภสัชกรที่ปฏิบัติงานวันนี้')}</span>${ui.tag(`ยืนยันตัวตนเมื่อ ${p.shift || '08:55'}`, 'ok')}</div>
  <div class="ps-id"><span class="ps-ph" role="img" aria-label="รูปโปรไฟล์ตัวอย่างของ${esc(p.short)}">${ui.av('', { ini: p.ini, size: 'lg', solid: true, img: TP.demoProfiles[p.id === 'tp' ? 'pharmacist_m' : 'pharmacist_f'] })}<span class="ps-cam" aria-hidden="true">${ic('camera', 12, 2.2)}</span></span><div><p class="ps-name">${esc(p.name)}</p><p class="ps-lic">ใบอนุญาตประกอบวิชาชีพ <b>${esc(p.lic)}</b></p><p class="ps-shot">ภาพบุคคลสมมติสำหรับต้นแบบ</p></div></div>
  <div class="ps-foot"><span class="ps-br"><span>${esc(b.name)}</span><small>ใบอนุญาตร้าน ${esc(b.lic || TP.STORE.lic)}</small></span><span class="ps-links"><button type="button" class="link" data-a="verifyLic" data-v="${esc(p.lic)}">ตรวจสอบใบประกอบเภสัชกร ${ic('external-link', 14, 2)}</button><button type="button" class="link" data-a="verifyStore" data-v="${esc(b.lic || TP.STORE.lic)}">ตรวจสอบใบอนุญาตร้าน ${ic('external-link', 14, 2)}</button></span></div></div>`;
/* the FDA's licensed-pharmacy search; the real app opens it with this number (build time: confirm the FDA page and how it takes the number) */
TP.act('verifyStore', t => TP.notify('เปิดหน้าตรวจใบอนุญาตร้านขายยาของ อย. เลขที่ ' + (t.dataset.v || ''), { icon: 'external-link' }));
/* a red flag in the queue: say again what to do if it gets worse while waiting (QA R3-7) */
/* the Pharmacy Council search only answers its own form (POST), a link cannot carry the number:
   send that form into a new tab so the result page opens like a manual search.
   Real app: a small page on our website does the same hand-off */
TP.act('verifyLic', t => {
  let lic = t.dataset.v || ''; try { lic = lic || JSON.parse(t.dataset.p || '{}').lic || ''; } catch (e) { lic = ''; }
  const num = (lic || TP.PHARM.kj.lic).replace(/\D/g, '');
  const f = document.createElement('form');
  Object.assign(f, { method: 'post', enctype: 'multipart/form-data', target: '_blank', action: 'https://www.pharmacycouncil.org/index.php?option=com_pharmacist_list' });
  [['txtfind_type', '1'], ['txtfind_id', num], ['cmdFindPH', 'ค้นหา']].forEach(([n, v]) => { const i = document.createElement('input'); Object.assign(i, { type: 'hidden', name: n, value: v }); f.appendChild(i); });
  document.body.appendChild(f); f.submit(); f.remove();
  TP.notify('เปิดหน้าตรวจสอบของสภาเภสัชกรรม เลขที่ ' + num, { icon: 'external-link' });
});

TP.screen('queue', {
  group:'before',title:'รอคิวปรึกษาเภสัชกร',code:'C207',ref:'C08',cls:'queue-wait-screen',
  states:[['q2','รออีก 1 คิว'], ['q1','คิวถัดไป'], ['q4','รออีก 3 คิว', true, 7]],
  notes:['C207 เป็นหน้าค้นหาและรอคิวก่อนเข้าแชท แสดงเฉพาะจำนวนคิวก่อนหน้าเด่นชัด ไม่แสดงรหัสคิว ไม่ประมาณเวลารอ','ระหว่างรอไม่มีข้อความแชท ช่องพิมพ์ หรือกล้อง กดกลับหน้าแรกได้โดยคิวยังคงอยู่ และกดการ์ดคิวเพื่อกลับมารอ ยกเลิกคิวได้ผ่าน C208','เมื่อจำนวนคิวก่อนหน้าเป็นศูนย์ แสดงคุณเป็นคิวถัดไป และรอเภสัชกรรับคิว จากนั้นเปิด C302 ก่อนเข้า C303','เภสัชกรพักชั่วคราวแสดงว่าคิวยังอยู่ ไม่เสียลำดับ รหัสคิวไม่เปลี่ยนเมื่อคิวขยับหรือพัก','ข้อมูลอาการและรายงานหลังใช้ยาที่ส่งก่อนเข้าคิวยังคงอยู่ในเคส ส่งให้เภสัชกรในแชทหลังรับบริการ','สงวนเลข C207.4/.5/.6/.8/.9/.10/.11/.12 ที่เลิกใช้ ไม่แสดงเคสแชทระหว่างรอ','ตรวจระยะก่อนเริ่มปรึกษา หากไม่มีร้านในระยะ 15 กม. จะไม่เข้าคิว สงวน C207.13 ที่เลิกใช้'],
  prep(S){const st=S.st.queue||'q2',c=ensureCase(st==='paused'?'paused':'queue');c.mode='chat';c.pos=st==='q1'?1:st==='q4'?4:2;c.msgs=[];c.draft='';c.order=null;c.idle=null;c.urgent=[];S.netOff=false;c.deliveryAddress=TP.homeAddress?.()?structuredClone(TP.homeAddress()):null;if(st==='message'){c.msgs=[{who:'sys',kind:'waiting',text:'ระหว่างรอเภสัชกร\nคุณสามารถแจ้งอาการหรือสอบถามข้อมูลเพิ่มเติมไว้ได้เลย'},{who:'me',kind:'intake'},{who:'me',text:'เจ็บคอตั้งแต่เมื่อวาน และมีไอเล็กน้อยค่ะ',time:TP.NOW.time}];}if(st==='offline'){c.msgs=[{who:'sys',kind:'waiting',text:'ระหว่างรอเภสัชกร\nคุณสามารถแจ้งอาการหรือสอบถามข้อมูลเพิ่มเติมไว้ได้เลย'},{who:'me',text:'เจ็บคอตั้งแต่เมื่อวาน และมีไอเล็กน้อยค่ะ',time:TP.NOW.time,fail:true}];}if(st==='joined'){c.status='room';c.waitedInChat=true;}},
  render() {
    const c = C() || ensureCase('queue');
    const paused = c.status === 'paused';
    const ahead = Number.isFinite(c.pos) ? Math.max(0, c.pos - 1) : null;
    c.queueCode ||= 'Q-' + TP.caseCode(c).replace(/^MR/, '');
    return `<button type="button" class="ibtn queue-wait-back" data-a="queueMin" aria-label="กลับหน้าหลัก">${ic('chevron-left',24)}</button>` + ui.page(`
      <section class="queue-wait-content" aria-labelledby="queueWaitTitle">
        <div class="queue-wait-summary">
          <img class="queue-wait-art" src="/assets/illustrations/queue-wait-editorial-2d-v3.webp" width="220" height="220" alt="">
          <h2 id="queueWaitTitle">${paused?'เภสัชกรพักชั่วคราว':'กำลังรอคิวปรึกษา<span class="queue-wait-dots" aria-hidden="true">...</span>'}</h2>
          ${!paused?'<p class="queue-wait-subtitle">กรุณารอสักครู่ เภสัชกรกำลังให้บริการ<br>ผู้รับบริการก่อนหน้าคุณ</p>':''}
          <div class="queue-ticket-position" role="status" aria-live="polite" aria-atomic="true">
            ${ahead===null?'<b>กำลังตรวจสอบคิว</b>':ahead===0?'<b>คุณเป็นคิวถัดไป</b>':`<span>มีคิวก่อนหน้าคุณ</span><div><strong class="num">${ahead}</strong><span>คิว</span></div>`}
          </div>
          ${paused?'<p class="queue-wait-explanation">คิวของคุณยังอยู่</p>':''}
        </div>
      </section>`, {cls:'queue-wait-page'}) + ui.dock(ui.btn('ยกเลิกคิว',{sheet:'cancelq'}));
  },
  mount() {}

});
TP.act('queueMin', () => TP.go('home', {via:'uncover',root:true}));

TP.sheetDef('cancelq', {
  group: 'before', title: 'ยกเลิกคิวไหม', code: 'C208', ref: 'C08', host: 'queue',
  render: () => `<p class="body">ถ้ายกเลิก ข้อมูลอาการที่ส่งไปจะถูกปิดไว้กับเคสนี้ และต้องเข้าคิวใหม่ถ้าต้องการคุยอีกครั้ง</p>`,
  foot: () => ui.btn('ยกเลิกคิว', { kind: 'danger', a: 'cancelQueue' }) + ui.btn('รอต่อ', { kind: 'ghost', closeSheet: true })
});
TP.act('cancelQueue', async () => { TP.S.case.status = 'cancelled'; TP.emit('state'); await TP.closeSheet(); TP.go('home', { via: 'uncover', root: true }); TP.notify('ยกเลิกคิวแล้ว', { icon: 'x' }); });

/* C302 appears once when the pharmacist accepts while the queue is open. */
const readyDuration = 10000;
function joinAcceptedCase() {
  if (TP.cur()?.id !== 'consultationready' || C()?.status !== 'matched') return;
  delete TP.S.st.room;
  return TP.go('room', { via: 'fade', replace: true });
}
TP.act('joinAcceptedCase', joinAcceptedCase);
TP.screen('consultationready', {
  group: 'during', title: 'ถึงคิวปรึกษาแล้ว', code: 'C302', parent: 'home',
  cls: 'consultation-ready-screen',
  states: [['countdown', 'นับถอยหลัง 10 วินาทีแล้วเข้าแชท'], ['manual', 'หยุดเวลาไว้สำหรับทดสอบปุ่มเข้าแชทหรือย้อนกลับ']],
  notes: ['เมื่อเภสัชกรรับคิวใน C207 แสดงภาพตัวอย่าง ข้อมูลเภสัชกร และร้านที่รับเคสแยกกัน', 'แถบเวลาลดต่อเนื่องและเข้าห้อง C303 เมื่อครบ 10 วินาที หรือกดเข้าห้องทันที', 'ย้อนกลับไปหน้าแรกโดยไม่ยกเลิกคิว การ์ดเภสัชรับคิวแล้วเปิดแชทโดยตรง'],
  prep(S) {
    TP.casePreview.seed('matched');
    const branch = TP.branch('tw');
    Object.assign(S.case, { branch: branch.id, pharm: branch.pharm, pos: 0 });
  },
  render(ctx) {
    const p = ph(), b = TP.branch(C()?.branch);
    const portrait = p.id === 'kj' ? '/assets/profiles/pharmacist-chat-v2.webp' : TP.demoProfiles.pharmacist_m;
    const preview = p.previewPhoto || b.photo;
    return `<button type="button" class="ibtn queue-ready-back" data-a="queueMin" aria-label="กลับหน้าหลัก">${ic('chevron-left',22)}</button>` +
      ui.page(`<div class="queue-ready-cover">
        ${preview ? `<img src="${esc(preview)}" alt="" fetchpriority="high">` : ''}
        <span>ภาพตัวอย่าง</span>
      </div>
      <div class="queue-ready-details">
        <h1>ถึงคิวปรึกษาแล้ว</h1>
        <section aria-labelledby="queueReadyPharmacist">
          <h2 id="queueReadyPharmacist">เภสัชกรผู้ดูแล</h2>
          <div class="queue-ready-person">
            ${ui.av('', { img: portrait, ini: p.ini, size: 'lg' })}
            <div><b>${esc(p.name)}</b><p>เลขใบอนุญาต ${esc(p.lic)}</p></div>
          </div>
        </section>
        <section aria-labelledby="queueReadyBranch">
          <h2 id="queueReadyBranch">ร้านยาที่ให้บริการ</h2>
          <div class="queue-ready-branch">
            ${b.photo ? `<img src="${esc(b.photo)}" width="60" height="60" alt="">` : ''}
            <div><b>${esc(b.name)}</b><p>${esc(b.previewAddr || b.addr || 'ยังไม่มีข้อมูลที่อยู่สาขา')}</p>
            ${b.hours ? `<p>เวลาทำการ ${esc(b.hours)} น.</p>` : ''}</div>
          </div>
        </section>
      </div>`, { nonav: true, cls: 'queue-ready-page' }) +
      ui.dock(`<div class="queue-ready-timer"><span>${ctx.state === 'manual' ? 'ตัวอย่างการนับถอยหลัง' : 'จะเข้าห้องปรึกษาอัตโนมัติใน'}</span><b class="num"><span data-queue-seconds>10</span> วินาที</b></div>
        <div class="queue-ready-progress" aria-hidden="true"><i></i></div>` +
        ui.btn('เข้าห้องปรึกษา', { a: 'joinAcceptedCase', iconRight: 'arrow-right' }));
  },
  mount(el, ctx) {
    if (ctx.state === 'manual') return;
    const bar = $('.queue-ready-progress i', el), count = $('[data-queue-seconds]', el);
    const reduced = TP.RED();
    let remaining = readyDuration, resumedAt = null, frame = 0;
    const tick = now => {
      const left = Math.max(0, remaining - (now - resumedAt));
      const seconds = Math.ceil(left / 1000);
      if (count.textContent !== String(seconds)) count.textContent = String(seconds);
      bar.style.transform = `scaleX(${reduced ? seconds / 10 : left / readyDuration})`;
      if (!left) {
        resumedAt = null;
        unsubscribe();
        if (TP.cur()?.el === el) joinAcceptedCase();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const setActive = active => {
      if (active && resumedAt === null) {
        resumedAt = performance.now();
        frame = requestAnimationFrame(tick);
      } else if (!active && resumedAt !== null) {
        remaining = Math.max(0, remaining - (performance.now() - resumedAt));
        resumedAt = null;
        cancelAnimationFrame(frame);
      }
    };
    const unsubscribe = TP.previewActivity.subscribe(setActive);
    ctx.onLeave(() => { unsubscribe(); cancelAnimationFrame(frame); });
    setActive(TP.previewActivity.active());
  },
});

/* ---------- pharmacist simulation (panel + auto) ---------- */
const onQueue = () => TP.cur()?.id === 'queue' && !TP.sheetOpen();
TP.sim = {
  next() {
    const c = C(); if (!c || c.status !== 'queue' || c.pos <= 1) return;
    c.pos -= 1; TP.emit('state');
    TP.queueChatUpdate?.(`คิวอัปเดต · ${c.pos<=1?'คุณเป็นคิวถัดไป':`รออีก ${c.pos-1} คิว`}`);
  },
  async accept() {
    const c=C();if(!c||!['queue','paused'].includes(c.status))return;
    c.waitedInChat = true;
    c.status = 'matched';
    c.pos = 0;
    TP.emit('state');
    if (['queue', 'room'].includes(TP.cur()?.id)) {
      if (TP.sheetOpen()) await TP.closeSheet();
      if (['queue', 'room'].includes(TP.cur()?.id) && C() === c && c.status === 'matched') {
        delete TP.S.st.consultationready;
        await TP.go('consultationready', { via: 'fade', replace: true });
        TP.live('เภสัชกรรับคิวแล้ว');
      }
    }else{
      if(TP.cur()?.id==='home'&&!TP.sheetOpen())TP.refresh({anim:false});
      TP.mini(false);TP.banner({title:'เภสัชกรพร้อมให้บริการแล้ว',body:'แตะเพื่อกลับเข้าห้องแชท',go:'room'});
    }
  },
  pause(on = true) {
    const c = C(); if (!c) return; c.status = on ? 'paused' : 'queue'; TP.emit('state');
    TP.queueChatUpdate?.(on?'เภสัชกรพักชั่วคราว คิวของคุณยังอยู่':'เภสัชกรกลับมารับคิวแล้ว');if(['queue','room'].includes(TP.cur()?.id))TP.refresh({anim:false});else{if(TP.cur()?.id==='home')TP.refresh({anim:false});TP.mini(false);}
  },
  lock() { const c = ensureCase('matched'); TP.emit('state'); TP.go('lock', { via: 'fade' }); }
};
TP.simAction({ id: 'next', label: 'คิวขยับ', when: S => S.case?.status === 'queue' && S.case.pos > 1, run: () => TP.sim.next() });
TP.simAction({ id: 'accept', label: 'รับคิว', when: S => ['queue', 'paused'].includes(S.case?.status), run: () => TP.sim.accept() });
TP.simAction({ id: 'decline', label: 'ไม่รับเคส', when: S => ['queue', 'paused', 'matched'].includes(S.case?.status), run: () => TP.sim.decline() });
TP.simAction({ id: 'lock', label: 'รับคิวตอนจอล็อก', when: S => ['queue', 'paused'].includes(S.case?.status), run: () => TP.sim.lock() });

/* =====================================================================
   Lock screen notification (ใหม่)
   ===================================================================== */
// C300 merged into C303 (user 8 Nov 2026): accepting a queue opens the same chat; C303.14 shows the moment the pharmacist joins. C300 stays reserved.
TP.screen('lock', {
  group: 'during', title: 'แจ้งเตือนบนจอล็อก', code: 'C301', cls: 'dark lock-scr', sb: 'light',
  states: [['accept', 'รับคิว'], ['msg', 'ข้อความใหม่'], ['order', 'รายการยา'], ['payexp', 'รายการใกล้หมดเวลา'], ['summary', 'ใบสรุป', true, 6]],
  notes: ['แอปส่งแจ้งเตือนแทน LINE OA: รับคิว · ข้อความใหม่ · รายการยา · ใบสรุป', 'ข้อความกลาง ๆ ไม่มีอาการ ชื่อยา ข้อความแชท หรือยอดเงิน (PDPA, A15)', 'ข้อมูลที่ผ่าน Apple/Google มีแค่ชนิดเหตุการณ์ (อยู่ในย่อหน้า C1)'],
  prep(S) {
    const st = S.st.lock || 'accept';
    if (['order', 'payexp', 'msg'].includes(st) && TP.SCREENS.room) { S.st.room = 'order'; TP.SCREENS.room.prep(S); S.st.room = undefined; }
    else ensureCase(st === 'paused' ? 'paused' : 'matched');
  },
  render(ctx) {
    const m = { accept: ['เภสัชกรรับคิวของคุณแล้ว', 'แตะเพื่อเข้าห้องปรึกษา', 'room'], msg: ['มีข้อความใหม่จากเภสัชกร', 'แตะเพื่ออ่าน', 'room'], order: ['รายการยาพร้อมให้ชำระ', 'แตะเพื่อดูรายการ', 'room'], payexp: ['รายการยาใกล้หมดเวลาชำระ', 'ชำระได้อีก 15 นาที แตะเพื่อดู', 'room'], paused: ['เภสัชกรพักชั่วคราว', 'คิวของคุณยังอยู่ ไม่เสียคิว', 'queue'], summary: ['ใบสรุปการปรึกษาพร้อมแล้ว', 'แตะเพื่อเปิดดู', 'summary'] }[ctx.state] || [];
    return `<div class="lk-bg" aria-hidden="true"></div>
      <div class="lk-top"><p class="lk-date">วันอาทิตย์ที่ 18 ตุลาคม</p><p class="lk-time">14:16</p></div>
      <button type="button" class="lk-note" data-a="lockOpen" data-v="${m[2]}" data-in="2"><span class="appicon">${brand.plus(22)}</span><span class="bt"><small><span>MITRAREE</span><span>ตอนนี้</span></small><b>${esc(m[0])}</b><span>${esc(m[1])}</span></span></button>
      <p class="lk-hint">แตะการแจ้งเตือนเพื่อเปิดแอป</p>`;
  },
  mount(el) { const n = $('.lk-note', el); A(n, [{ opacity: 0, transform: 'translateY(-30px) scale(.94)' }, { opacity: 1, transform: 'none' }], { d: SP.spring.d, e: SP.spring.e, delay: 500, fill: 'backwards' }); }
});
TP.act('lockOpen', async t => {
  const v = t.dataset.v, to = TP.SCREENS[v] ? v : 'home';
  /* the app opens on home underneath the target, so back and "ย่อไว้" always land on a live home, never on a stale queue */
  await TP.go('home', { via: 'none', root: true });
  if (to !== 'home') TP.go(to, { via: 'zoom' });
});

TP.act('chatVideo', () => {
  const c = C();
  if (!c || c.status !== 'room') return;
  if (TP.S.call || c.msgs?.some(m => m.kind === 'video-request' && m.status === 'accepted')) return TP.ACTS.startVideo();
  TP.S.call = { t0: null, mic: true, cam: true, waitingProvider: true };
  TP.emit('state');
  return TP.go('video', { via: 'zoom', replace: true });
});
TP.simAction({ id: 'joinCustomerVideo', label: 'เภสัชกรเข้าห้องวิดีโอ', when: S => !!S.call?.waitingProvider, run: () => { TP.S.call.waitingProvider = false; TP.S.call.t0 = Date.now(); TP.emit('state'); if (TP.cur()?.id === 'video') TP.refresh({ anim: false }); } });
TP.act('startVideo', () => {
  const c=C();if(!c||c.status!=='room'||(!TP.S.call&&!c.msgs?.some(m=>m.kind==='video-request'&&m.status==='accepted')))return;
  TP.emit('state');return TP.go('video',{via:'zoom',replace:true});
});
TP.act('acceptVideoRequest', t => {
  const c=C(),m=c?.msgs?.find(m=>m.kind==='video-request'&&m.id===t.dataset.request);
  if(c?.status!=='room'||m?.status!=='pending'||TP.S.call)return;
  m.status='accepted';TP.emit('state');return TP.ACTS.startVideo();
});
TP.act('declineVideoRequest', t => {
  const c=C(),m=c?.msgs?.find(m=>m.kind==='video-request'&&m.id===t.dataset.request);
  if(c?.status!=='room'||m?.status!=='pending')return;
  m.status='declined';TP.emit('state');return TP.refresh({anim:false});
});
/* Incoming provider event; preview controls below supply mock events. */
TP.receiveVideoRequest = request => {
  const c=C();if(c?.status!=='room'||TP.S.call||c.msgs.some(m=>m.kind==='video-request'&&['pending','accepted'].includes(m.status)))return;
  c.msgs.push({kind:'video-request',id:String(request.id),status:'pending',time:TP.roomNow?.() || TP.NOW.time});TP.emit('state');
  if(['queue','room'].includes(TP.cur()?.id))return TP.refresh({anim:false});
  TP.banner({icon:'video',title:'เภสัชกรขอวิดีโอคอล',body:'เปิดแชทเพื่อดูคำขอ',go:'room'});
};
TP.simAction({id:'requestVideo',label:'เภสัชกรขอวิดีโอคอล',when:S=>S.case?.status==='room'&&!S.call&&!S.case.msgs?.some(m=>m.kind==='video-request'&&['pending','accepted'].includes(m.status)),run:()=>TP.receiveVideoRequest({id:'video-'+Date.now()})});
TP.simAction({id:'withdrawVideo',label:'ถอนคำขอวิดีโอคอล',when:S=>S.case?.msgs?.some(m=>m.kind==='video-request'&&m.status==='pending'),run:()=>{const c=C();c.msgs.filter(m=>m.kind==='video-request'&&m.status==='pending').forEach(m=>m.status='withdrawn');TP.emit('state');TP.refresh({anim:false});}});

/* =====================================================================
   Edge: branch closed (A9), expired, offline question, declined
   ===================================================================== */

TP.act('requeue', () => { TP.S.st.queue = undefined; const old = C(); TP.newCase(); if (old) Object.assign(C(), { symptoms: old.symptoms, note: old.note, who: old.who, ack: old.ack }); TP.go('queue', { via: 'fade', replace: true }); });

const ofDanger = () => `<div class="note danger mt12" role="alert">${ic('octagon-alert', 18, 2)}<div><b>อาการแบบนี้ไม่ควรรอถึงพรุ่งนี้</b><p class="mt8">ไปโรงพยาบาลใกล้บ้านทันที เภสัชกรจะตอบได้เมื่อร้านเปิด 09:00 เท่านั้น</p><a class="btn danger mt12" href="tel:1669" data-a="call1669">${ic('phone', 20, 2)}<span>โทร 1669</span></a></div></div>`;

})();

/* ===== 64-room.js ===== */
/* =====================================================================
   64 · Consult room: chat (live conversation), video call, no camera,
        connection lost. Chat and video share one case; switching never drops the call.
   ===================================================================== */
(() => {
const { $, $$, esc, ic, ui, brand, A, E, SP, fin } = TP;
const C = () => TP.S.case;
const P = () => TP.PHARM[C().pharm];
const now = () => { const c = C(), m = (c?.hh ?? 14) * 60 + (c?.hh != null ? 6 : 16) + Math.min(43, c?.msgs.length || 0); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
TP.roomNow = () => (C() ? now() : TP.NOW.time);
/* the mock pharmacist reads the case (real-user test 19/10/2026): who it is for, child dose by weight,
   symptoms already told are not asked again, regular medicines and allergies are checked out loud */
const first1 = n => String(n || '').trim().split(/\s+/)[0];
/* mock catalogue for the scripted pharmacist: one rule per symptom (QA R3: no duplicate lines, no throat spray for a stomach ache) */
const MED = {
  brom: { name: 'บรอมเฮกซีน 8 มก. (ละลายเสมหะ)', qty: '1 แผง', type: 'ยาสามัญประจำบ้าน', price: 35, how: 'ครั้งละ 1 เม็ด วันละ 3 ครั้ง หลังอาหาร' },
  cpm: { name: 'คลอร์เฟนิรามีน 4 มก. (ลดน้ำมูก)', qty: '1 แผง', type: 'ยาสามัญประจำบ้าน', price: 25, how: 'ครั้งละ 1 เม็ด วันละ 3 ครั้ง อาจทำให้ง่วง เลี่ยงการขับรถ' },
  antacid: { name: 'ยาลดกรดชนิดน้ำ', qty: '1 ขวด 240 มล.', type: 'ยาสามัญประจำบ้าน', price: 55, how: 'ครั้งละ 15 มล. หลังอาหารและก่อนนอน เมื่อมีอาการ' },
  ors: { name: 'ผงเกลือแร่ (ORS)', qty: '5 ซอง', type: 'ยาสามัญประจำบ้าน', price: 30, how: 'ละลายน้ำสะอาดตามฉลาก จิบบ่อย ๆ หลังถ่ายแต่ละครั้ง' },
  calamine: { name: 'คาลาไมน์โลชั่น', qty: '1 ขวด 60 มล.', type: 'ยาสามัญประจำบ้าน', price: 45, how: 'ทาบาง ๆ บริเวณที่คัน วันละ 3 ถึง 4 ครั้ง' },
  tears: { name: 'น้ำตาเทียม', qty: '1 ขวด', type: 'เวชภัณฑ์', price: 95, how: 'หยอดครั้งละ 1 หยด เมื่อตาแห้งหรือแสบตา' },
  gel: { name: 'แผ่นเจลลดไข้สำหรับเด็ก', qty: '1 กล่อง', type: 'เวชภัณฑ์', price: 89, how: 'แปะหน้าผากเมื่อตัวร้อน ร่วมกับเช็ดตัวด้วยน้ำอุ่น' },
  saline: { name: 'น้ำเกลือหยดจมูกสำหรับเด็ก', qty: '1 ขวด', type: 'เวชภัณฑ์', price: 65, how: 'หยดจมูกข้างละ 1 ถึง 2 หยด ก่อนเช็ดหรือดูดน้ำมูก วันละ 3 ถึง 4 ครั้ง' }
};
const kidPara = w => ({ name: 'พาราเซตามอลชนิดน้ำ 120 มก./5 มล.', qty: '1 ขวด 60 มล.', type: 'ยาสามัญประจำบ้าน', price: 45, how: `ครั้งละ ${Math.max(5, Math.min(15, Math.round(w / 2)))} มล. (คิดจากน้ำหนัก ${w} กก.) เมื่อมีไข้ ห่างกันอย่างน้อย 4 ชั่วโมง ไม่เกิน 5 ครั้งต่อวัน` });
TP.casePlan = c => {
  const p = TP.person(c?.who) || TP.person('me'), fam = !!c?.who && c.who !== 'me';
  const note = String(c?.note || ''), noFever = /ไม่(มี)?\s*ไข้/.test(note);
  const kid = !!p.child || (p.age && p.age < 12), sy = (c?.symptoms || []).join(' ') || note.replace(/ไม่(มี|ได้)?\s*[ก-๙]+/g, ' ');
  const has = re => re.test(sy), cough = has(/ไอ|เสมหะ/), fever = has(/ไข้/), throat = has(/เจ็บคอ/), ache = has(/ปวดหัว|ปวดกล้ามเนื้อ/);
  const nose = has(/น้ำมูก|คัดจมูก/), belly = has(/ปวดท้อง|แสบท้อง|ลิ้นปี่|จุกเสียด|กรดไหลย้อน/), loose = has(/ท้องเสีย/), rash = has(/ผื่น|คัน/), eye = has(/ตาแดง|แสบตา/);
  /* what the customer already told (chips or the note) is not asked again (real-user + QA R3) */
  const days = /\d+\s*วัน|เมื่อวาน|เมื่อคืน/.test(note), temp = /3[5-9](\.\d)?|องศา/.test(note), phlegm = /เสมหะ/.test(sy + note), fk = fever || noFever;
  const call = fam ? (kid ? `น้อง${first1(p.name)}` : `คุณ${first1(p.name)}`) : '';
  const items = [], add = (...xs) => xs.forEach(x => { if (!items.some(i => i.name === x.name)) items.push(x); });
  if (kid) {
    const w = +p.weight || 20;
    if (fever) add(kidPara(w), MED.gel);
    if (ache) add(kidPara(w));
    if (cough || nose) add(MED.saline);
    if (loose) add(MED.ors);
    if (rash) add(MED.calamine);
  } else {
    if (throat) add(TP.ORDER_ITEMS[0]);
    if (fever || ache || throat) add(TP.ORDER_ITEMS[1]);
    if (cough) add(MED.brom);
    if (throat && !cough) add(TP.ORDER_ITEMS[2]);
    if (nose) add(MED.cpm);
    if (belly) add(MED.antacid);
    if (loose) add(MED.ors);
    if (rash) add(MED.calamine);
    if (eye) add(MED.tears);
  }
  const q = kid && fever ? (temp ? ['ทานยาลดไข้ไปแล้วหรือยังคะ', ['ยังไม่ได้ทานยา', 'ทานไปแล้ว 1 ครั้ง']] : ['น้องมีไข้กี่องศาคะ ทานยาลดไข้ไปแล้วหรือยังคะ', ['38.5 องศา ยังไม่ได้ทานยา', 'ยังไม่ได้วัด ตัวร้อน']])
    : cough ? (!days && !fk ? ['ไอมากี่วันแล้วคะ มีไข้ร่วมด้วยไหมคะ', ['2 วัน ไม่มีไข้', '4 วัน มีไข้ต่ำ ๆ']]
      : !days ? [`ไอมากี่วันแล้วคะ${phlegm ? ' เสมหะสีอะไรคะ' : ' มีเสมหะไหมคะ'}`, phlegm ? ['2 วัน เสมหะใส', '4 วัน เสมหะเหลือง'] : ['2 วัน มีเสมหะ', '4 วัน ไอแห้ง ๆ']]
      : !fk ? ['มีไข้ร่วมด้วยไหมคะ เสมหะสีอะไรคะ', ['ไม่มีไข้ เสมหะใส', 'มีไข้ต่ำ ๆ เสมหะเหลือง']]
      : ['เสมหะสีอะไรคะ ใส หรือเหลืองเขียว', ['ใส ๆ', 'เหลืองเขียว']])
    : fever ? (temp && days ? ['ทานยาลดไข้ไปแล้วหรือยังคะ', ['ยังไม่ได้ทาน', 'ทานไปแล้ว 1 ครั้ง']]
      : temp ? ['เป็นมากี่วันแล้วคะ', ['1 วัน', '2 วัน']]
      : days ? ['มีไข้วัดได้กี่องศาคะ', ['38 องศา', 'ยังไม่ได้วัด']]
      : ['มีไข้วัดได้กี่องศาคะ เป็นมากี่วันแล้วคะ', ['38 องศา เป็นมา 1 วัน', 'ยังไม่ได้วัด เป็นมา 2 วัน']])
    : throat ? (days ? (fk ? ['กลืนแล้วเจ็บมากไหมคะ มีไอหรือเสมหะร่วมด้วยไหมคะ', ['เจ็บเวลากลืน ไม่ไอ', 'เจ็บนิดหน่อย ไอบ้าง']] : ['มีไข้ร่วมด้วยไหมคะ', ['ไม่มีไข้', 'มีไข้ต่ำ ๆ']]) : ['เจ็บคอมากี่วันแล้วคะ กลืนแล้วเจ็บไหมคะ', ['2 วัน กลืนแล้วเจ็บ', '1 วัน เจ็บนิดหน่อย']])
    : days ? ['มีอาการอื่นร่วมด้วยไหมคะ', ['ไม่มีค่ะ', 'มีนิดหน่อย']] : ['เป็นมากี่วันแล้วคะ มีอาการอื่นร่วมด้วยไหมคะ', ['1 วัน ไม่มีอาการอื่น', '3 วัน มีอาการอื่นด้วย']];
  /* advice only, never a named diagnosis (QA R3: onboarding says this is not a doctor's diagnosis) */
  const NOAB = 'ยังไม่จำเป็นต้องใช้ยาปฏิชีวนะ';
  const [dx, care] = kid && fever ? [`จากอาการที่เล่า ดูแลที่บ้านได้ก่อน ${NOAB}`, 'ให้ดื่มน้ำบ่อย ๆ และเช็ดตัวลดไข้ด้วยน้ำอุ่น']
    : kid && (cough || nose) ? ['จากอาการที่เล่า ดูแลที่บ้านได้ก่อน เด็กเล็กไม่แนะนำให้ใช้ยาแก้ไอหรือยาลดน้ำมูกเอง', 'ล้างจมูกด้วยน้ำเกลือ และให้ดื่มน้ำอุ่นบ่อย ๆ']
    : cough ? [`จากอาการที่เล่า ดูแลตามอาการได้ ${NOAB}`, 'ดื่มน้ำอุ่นบ่อย ๆ ช่วยให้เสมหะออกง่ายขึ้น']
    : fever || throat || ache ? [`จากอาการที่เล่า ดูแลตามอาการได้ ${NOAB}`, 'ดื่มน้ำมาก ๆ และพักผ่อนให้เพียงพอ']
    : nose ? ['จากอาการที่เล่า ดูแลตามอาการได้', 'ล้างจมูกด้วยน้ำเกลือช่วยได้มาก']
    : belly ? ['จากอาการที่เล่า ทานอาหารอ่อน ๆ เลี่ยงของเผ็ด ของมัน และกาแฟ', 'ถ้าปวดมากขึ้น หรือปวดท้องด้านขวาล่าง ให้ไปพบแพทย์ทันที']
    : loose ? ['จากอาการที่เล่า สำคัญที่สุดคือดื่มเกลือแร่ทดแทนน้ำที่เสียไป ยังไม่ต้องใช้ยาหยุดถ่าย', 'ถ้าถ่ายเป็นเลือด หรือมีไข้สูง ให้ไปพบแพทย์']
    : rash ? ['จากอาการที่เล่า ใช้ยาทาบรรเทาอาการคันได้ก่อน', 'ถ้าผื่นลามเร็ว ปาก หน้า หรือตาบวม ให้ไปโรงพยาบาลทันที']
    : eye ? ['จากอาการที่เล่า ใช้น้ำตาเทียมได้ก่อน และไม่ขยี้ตา', 'ถ้าตามัว ปวดตามาก หรือมีขี้ตาสีเขียว ให้ไปพบแพทย์']
    : ['จากที่เล่ามา ดิฉันแนะนำวิธีดูแลตามนี้นะคะ', 'ถ้าอาการไม่ดีขึ้นใน 3 วัน ให้ไปพบแพทย์'];
  const see = fever ? 'ถ้ามีไข้เกิน 3 วัน หรือหายใจเหนื่อย ให้ไปพบแพทย์' : cough ? 'ถ้าไอเกิน 1 สัปดาห์ มีไข้สูง หรือหายใจเหนื่อย ให้ไปพบแพทย์' : 'ถ้าอาการไม่ดีขึ้นใน 3 วัน ให้ไปพบแพทย์';
  const meds = (p.meds || []).filter(Boolean), alg = (p.allergies || []).filter(Boolean);
  const chk = meds.length || alg.length ? `ดิฉันดู${meds.length ? `ยาประจำ ${meds.join(', ')}` : ''}${meds.length && alg.length ? ' และ' : ''}${alg.length ? `ประวัติแพ้${alg.join(', ')}` : ''}${fam ? ` ของ${call}` : ''}แล้ว ยาที่จัดให้ใช้ร่วมกันได้ ไม่ต้องหยุดยาประจำนะคะ` : '';
  return { p, fam, kid, call, items, q, dx: `${dx} ${care}${/ๆ$/.test(care) ? ' ' : ''}นะคะ`, adv: [dx, care], see, chk };
};
const SCRIPT = c => {
  const k = TP.casePlan(c), n = k.items.length;
  return [
    { who: 'ph', text: `สวัสดีค่ะ คุณ${TP.S.user.name} ดิฉันเภสัชกร${P().short.replace(/^ภ[ญก]\./, '')} ดูแลเคส${k.fam ? 'ของ' + k.call : 'นี้'}นะคะ` },
    { who: 'ph', text: k.q[0], quick: k.q[1] },
    { who: 'ph', text: k.dx, wait: true },
    ...(k.chk && n ? [{ who: 'ph', text: k.chk }] : []),
    ...(n ? [{ who: 'ph', text: `ดิฉันจัดยาบรรเทาอาการให้ ${n} รายการ${k.kid && k.items.some(i => /น้ำหนัก/.test(i.how)) ? ` ขนาดยาคิดตามน้ำหนักของ${k.call || 'น้อง'}` : ''} วิธีใช้อยู่ในรายการด้านล่างค่ะ ${k.see}นะคะ` }, { kind: 'order' },...(TP.chatConsult(c)?[{who:'ph',text:'มีคำถามเกี่ยวกับรายการยาหรือวิธีใช้เพิ่มเติมไหมคะ',quick:['ไม่มีคำถามเพิ่มเติม','มีคำถามเพิ่มเติม']}]:[])]
      : [{ who: 'ph', text: `ตอนนี้ยังไม่ต้องใช้ยาค่ะ ${k.see}นะคะ ถ้ามีคำถามเพิ่ม พิมพ์ในห้องนี้ได้เลย` }])
  ];
};
TP.roomScript = SCRIPT;
/* the pharmacist's line after payment depends on how the medicine travels (real-user R2: parcel said "ready in 30 minutes") */
TP.paidMsg = recv => recv === 'parcel' ? 'ได้รับชำระแล้วค่ะ ร้านกำลังจัดยาและแพ็กส่งพัสดุ ได้เลขพัสดุแล้วจะแจ้งในแอปนะคะ'
  : recv === 'express' ? 'ได้รับชำระแล้วค่ะ ร้านกำลังจัดยา แล้วจะเรียกรถส่งด่วนให้ ติดตามได้ในแอปนะคะ'
  : recv === 'cold' ? 'ได้รับชำระแล้วค่ะ ร้านกำลังจัดยาใส่กล่องเย็นและโทรจองขนส่ง Inter Express ให้ ได้เลขพัสดุแล้วจะแจ้งในแอปนะคะ'
  : 'ได้รับชำระแล้วค่ะ ร้านกำลังจัดยาให้ พร้อมรับภายใน 30 นาทีนะคะ';
TP.expireOrder = c => {
  const o = c?.order;
  if (!TP.expirePayment(o)) return false;
  (TP.S.history||[]).filter(h=>h.id===c.id).forEach(h=>h.orderStatus='expired');
  return true;
};
// One order number per consultation/order, reused by all customer surfaces.
TP.orderNumber = c => {
  if(c?.order?.no) return c.order.no;
  if(c?.orderNo) return c.orderNo;
  const key=String(c?.id || 'preview-order');
  const hash=[...key].reduce((n,ch)=>(n*31+ch.charCodeAt(0))%10000,0);
  const [day,month,year]=String(c?.date || TP.NOW.date).split('/');
  return 'MT'+year+month+day+String(hash).padStart(4,'0');
};
TP.makeOrder = () => { const k=TP.casePlan(C()).items,items=k.length?k:[TP.ORDER_ITEMS[1]],issuedAt=Date.now();C().order={status:'pending',items,total:items.reduce((sum,i)=>sum+i.price,0),issuedAt,awaitingCheckout:true,expiresAt:null,no:TP.orderNumber(C())};C().order.expires=TP.orderTime(C().order);TP.emit('state'); };
TP.orderCases = S => [...new Map([S.case,...(S.history||[]).map(h=>h._case)].filter(Boolean).map(c=>[c.id,c])).values()];

TP.pendingPaymentCase = S => TP.orderCases(S).find(c=>c.status==='closed'&&TP.orderPayable(c.order));
/* Chat consultation: the existing order continues after the room is closed. */
TP.chatConsult = c => !!c && (c.mode||'chat')==='chat';
TP.checkoutHandoffRemaining = c => Math.max(0, Math.ceil(((c?.checkoutHandoffUntil || 0) - Date.now()) / 1000));
TP.act('continueCheckout', () => {
 const c = TP.S.case;
 if (!c || c.status !== 'closed' || !TP.orderPayable(c.order) || !c.checkoutHandoffUntil) return;
 c.checkoutHandoffUntil = null;
 return TP.finishChatNavigation(c);
});
TP.closedChatRoute = c => {
 c ||= TP.S.case;if(!TP.chatConsult(c)||c.status!=='closed')return null;
 TP.expireOrder(c);
 if (TP.checkoutHandoffRemaining(c) && TP.orderPayable(c.order)) return null;
 return c.order?.status==='pending'?{screen:'home',pay:!c.order.payment,case:c}:c.order?.status==='paid'?{screen:'track',case:c}:{screen:'home',case:c};
};
TP.finishChatNavigation = async c => {
 /* C308 and its tax sheets close back to home; never pull the customer into the closed chat while they are open */
 if(['pay','checkouttaxpicker','checkouttaxedit'].includes(TP.sheetOpen?.()?.id))return;
 const route=TP.closedChatRoute(c);if(!route)return;
 TP.S._paymentCase=c;
 /* From the chat, open C308 straight over the room; home replaces the room underneath, so closing C308 lands on home without flashing it first. */
 if(route.pay&&TP.cur()?.id==='room'&&TP.orderPayable(c.order)&&TP.swapUnderSheet){await TP.sheet('pay',{caseId:c.id});await TP.swapUnderSheet(route.screen);return;}
 await TP.go(route.screen,{root:true,force:true});
 if(route.pay&&TP.orderPayable(c.order))await TP.sheet('pay',{caseId:c.id});
};
TP.FULFILLMENT_PHASES=[['preparing','กำลังเตรียมยา','pill'],['calling','กำลังเรียกไรเดอร์เข้ารับยา','phone'],['delivering','ไรเดอร์กำลังส่งยาให้คุณ','truck'],['delivered','จัดส่งยาเสร็จสิ้น','circle-check']];
TP.fulfillmentInfo = c => {
 const o=c?.order;if(o?.status!=='paid'||!o.fulfillment)return null;
 if(o.paid?.recv==='parcel'){
  const pd=o.paid;
  const [key,title,icon]=pd.deliv?['delivered','ขนส่งแจ้งว่าส่งถึงแล้ว','package-check']:pd.out?['out','กำลังนำส่ง','truck']:pd.parcelStep==='packed'?['packed','แพ็กแล้ว ส่งให้บริษัทขนส่ง','truck']:pd.stage&&pd.stage!=='preparing'?['transit','กำลังขนส่ง','truck']:TP.FULFILLMENT_PHASES[0];
  return {key,title,icon,done:!!(pd.deliv||o.picked),pickup:false};
 }
 const phase=TP.FULFILLMENT_PHASES.find(x=>x[0]===o.fulfillment.status)||TP.FULFILLMENT_PHASES[0];
 return {key:phase[0],title:phase[1],icon:phase[2],done:!!(o.paid?.deliv||o.picked||o.fulfillment.status==='delivered'),pickup:o.paid?.recv==='pickup'};
};
/* C201 card and C414 steps match the legacy web order_progress_html (mitraree helpers.php, user 24 Nov 2026):
   one 4-step list for every way of receiving; only step 3 differs for pickup.
   new = step 1 · processing / packing / packing_complete (delivery) = step 2 · shipping, or packing_complete for pickup = step 3 · completed = step 4 */
TP.trackStepLabels = pickup => ['ยืนยันการสั่งซื้อสินค้า', 'เตรียมการจัดส่ง', pickup ? 'เตรียมสินค้าเรียบร้อยแล้ว' : 'อยู่ระหว่างการจัดส่ง', 'ลูกค้ารับสินค้าแล้ว'];
TP.trackStepIndex = c => {
  const pd = c?.order?.paid, f = TP.fulfillmentInfo(c);
  if (!pd) return 0;
  if (f?.done || pd.deliv || pd.got || c.order.picked) return 3;
  if (pd.recv === 'pickup') return pd.stage && pd.stage !== 'preparing' ? 2 : 1;
  if (pd.recv === 'express') return f?.key === 'delivering' ? 2 : 1;
  return ['transit', 'out'].includes(f?.key) ? 2 : 1;
};
TP.trackSteps = (c, details = []) => {
  const pickup = c.order.paid.recv === 'pickup', current = TP.trackStepIndex(c);
  return TP.trackStepLabels(pickup).map((label, i) => [i < current ? 'done' : i === current ? 'cur' : '', label, i === current ? details[i] || '' : '']);
};
TP.setFulfillment = (c,status) => {
 if(c?.order?.status!=='paid'||!TP.FULFILLMENT_PHASES.some(x=>x[0]===status))return false;
 const current=TP.FULFILLMENT_PHASES.findIndex(x=>x[0]===c.order.fulfillment?.status),next=TP.FULFILLMENT_PHASES.findIndex(x=>x[0]===status);if(current>=0&&next<=current)return false;
 c.order.fulfillment={...c.order.fulfillment,status,updatedAt:new Date().toISOString()};
 if(status==='delivered'){c.order.paid.deliv=TP.NOW.time;c.order.picked=true;}
 TP.emit('state');return true;
};
TP.fulfillmentPreview = (c,key) => {
 c.mode='chat';c.status='closed';const issuedAt=Date.now(),items=TP.ORDER_ITEMS.map(i=>({...i}));c.order={status:'pending',items,total:items.reduce((n,i)=>n+i.price,0),issuedAt,expiresAt:issuedAt+TP.ORDER_PAYMENT_MS,no:TP.orderNumber(c)};c.order.paid={recv:'express',method:'promptpay',items:c.order.total,ship:89,fee:0,total:c.order.total+89,date:TP.NOW.date,at:TP.NOW.time,addr:{...(TP.S.addrs?.[0]||{})}};c.order.status='paid';
 c.pharmacistAdvice='โปรดอ่านวิธีใช้ยาและคำแนะนำบนฉลาก หากมีข้อสงสัยให้ติดต่อสาขาที่ให้คำปรึกษา';
 if(key.startsWith('parcel-')){
  const pd=c.order.paid;
  pd.recv='parcel';pd.ship=TP.DELIVERY.find(d=>d.id==='parcel').fee;pd.total=pd.items+pd.ship;
  TP.setFulfillment(c,'preparing');
  if(key!=='parcel-preparing') TP.previewParcelStatus(pd,key.slice(7));
 } else if(key.startsWith('pickup-')) { c.order.paid.recv='pickup'; c.order.paid.addr=null; c.order.paid.ship=0; c.order.paid.total=c.order.total; TP.setFulfillment(c,'preparing'); if(key==='pickup-ready') { c.order.paid.stage='ready'; c.order.paid.packAt=TP.NOW.time; c.order.paid.packDate=TP.NOW.date; } if(key==='pickup-complete') c.order.picked=true; } else TP.setFulfillment(c,key.replace('delivery-',''));TP.saveReceipt?.(c);
};
TP.fulfillmentCard = (S, options = {}) => {
 const orders=TP.orderCases(S).filter(c=>{const f=TP.fulfillmentInfo(c);return f && !f.done;});
 const cardsHtml=orders.map(c=>{
 const f=TP.fulfillmentInfo(c),b=TP.branch(c.branch),step=TP.trackStepIndex(c),title=TP.trackStepLabels(f.pickup)[step];
 /* step icon: 2 = preparing, 3 = store ready / rider / truck (user 24 Nov 2026, legacy 4 steps) */
 const stepIcon=step<2?'pill':f.pickup?'store':c.order.paid?.recv==='express'?'motorcycle':'truck';
 /* C201 paid order cards name the way of receiving up front (user 24 Nov 2026): ส่งด่วน · Lalamove / จัดส่งปกติ · carrier / รับที่ร้าน */
 const pd=c.order.paid||{},carrier=pd.recv==='parcel'?TP.COURIERS?.find(x=>x.id===pd.courier):null;
 const method=f.pickup?['pickup','store','รับที่ร้าน']:pd.recv==='express'?['express','zap','ส่งด่วน · Lalamove']:['parcel','package','จัดส่งปกติ'+(carrier?' · '+carrier.name:'')];
 /* Mobbin research 24 Nov 2026 (Woolworths, Grubhub, Grill'd, Keeta): way as a plain eyebrow line, status as the title,
    no progress bar (removed by the user the same day). The left tile carries the way's icon so delivery and pickup differ at a glance. */
 const methodIcon=f.pickup?'store':pd.recv==='express'?'motorcycle':'truck';
 const methodTag=`<span class="hm-fulfillment-method" data-recv="${method[0]}">${method[2]}</span>`;
 if(options.compact){
  return `<button type="button" class="hm-fulfillment-banner" data-recv="${method[0]}" ${TP.ui.route({a:'viewFulfillment',p:{caseId:c.id}})} aria-label="${method[2]} ${TP.esc(title)} คำสั่งซื้อ ${TP.esc(c.order.no)}${f.pickup?` สาขา${TP.esc(b.short||b.name)}`:''}"><span class="hm-fulfillment-icon" aria-hidden="true">${TP.ic(methodIcon,24,1.8)}</span><span class="hm-fulfillment-copy">${methodTag}<strong>${TP.esc(title)}</strong>${f.pickup?`<small>สาขา : ${TP.esc(b.short||b.name)}</small>`:orders.length>1?`<small>สาขา : ${TP.esc(b.short||b.name)}</small>`:''}<small>คำสั่งซื้อ : ${TP.esc(c.order.no)}</small></span>${TP.ic('chevron-right',18,1.8)}</button>`;
 }
 return `<article class="post-consult-payment fulfillment-card case-progress-card"><header class="post-payment-heading case-progress-head"><span class="case-status-watermark" aria-hidden="true">${TP.ic(stepIcon,160,1.4)}</span><span class="case-progress-icon" aria-hidden="true">${TP.ic(stepIcon,22,1.8)}</span><span>สถานะคำสั่งซื้อ</span>${TP.ui.tag('ชำระแล้ว','ok')}</header><div class="case-progress-body">${methodTag}<h3>${TP.esc(title)}</h3><p class="case-progress-meta">${TP.ic('map-pin',16)}<span>${TP.esc(b.name)}</span></p><p class="case-progress-order">เลขคำสั่งซื้อ <span>${TP.esc(c.order.no)}</span></p></div><footer class="case-progress-foot">${TP.ui.btn('ติดตามสถานะยา',{a:'viewFulfillment',p:{caseId:c.id},iconRight:'arrow-right'})}</footer></article>`;

});
 const cards=cardsHtml.join('');
 if(!options.compact || orders.length<2)return cards;
 /* Several paid orders (C201.79): one card per order in a swipeable carousel; the next card peeks, dots follow the scroll. */
 const slides=orders.map((c,i)=>`<div class="hm-fulfillment-slide" role="group" aria-roledescription="slide" aria-label="คำสั่งซื้อที่ ${i+1} จาก ${orders.length}">${cardsHtml[i]}</div>`).join('');
 const dots=orders.map((c,i)=>`<button type="button" class="hm-fulfillment-dot${i?'':' is-active'}" data-slide="${i}" aria-label="ไปคำสั่งซื้อที่ ${i+1} จาก ${orders.length}"${i?'':' aria-current="true"'}></button>`).join('');
 return `<section class="hm-fulfillment-group" aria-roledescription="carousel" aria-label="คำสั่งซื้อที่กำลังดำเนินการ"><header class="hm-fulfillment-heading"><h2>คำสั่งซื้อที่กำลังดำเนินการ</h2><span>${orders.length} รายการ</span></header><div class="hm-fulfillment-carousel" tabindex="0" aria-label="ปัดซ้ายขวาเพื่อดูคำสั่งซื้อ">${slides}</div><div class="hm-fulfillment-dots">${dots}</div></section>`;
};
/* Carousel behaviour for the multi-order home card: dots + arrow keys scroll, scrolling updates the active dot. */
TP.mountFulfillmentCarousel = el => {
 const track=el?.querySelector('.hm-fulfillment-carousel'),dots=[...(el?.querySelectorAll('.hm-fulfillment-dot')||[])];
 if(!track||!dots.length)return;
 const slides=[...track.children];let current=0;
 const goTo=i=>{const slide=slides[Math.max(0,Math.min(slides.length-1,i))];if(slide)track.scrollTo({left:slide.offsetLeft-track.offsetLeft,behavior:TP.RED()?'auto':'smooth'});};
 const update=()=>{const left=track.scrollLeft;const i=slides.reduce((best,s,k)=>Math.abs(s.offsetLeft-track.offsetLeft-left)<Math.abs(slides[best].offsetLeft-track.offsetLeft-left)?k:best,0);if(i===current)return;current=i;dots.forEach((d,k)=>{d.classList.toggle('is-active',k===i);if(k===i)d.setAttribute('aria-current','true');else d.removeAttribute('aria-current');});};
 dots.forEach((d,i)=>d.addEventListener('click',()=>goTo(i)));
 track.addEventListener('keydown',e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;e.preventDefault();goTo(current+(e.key==='ArrowRight'?1:-1));});
 track.addEventListener('scroll',TP.rafT(update),{passive:true});
};
/* A finished order has no status screen (user 8 Nov 2026): it opens the order summary C401 directly. */
TP.openCompletedOrder = c => TP.go('summary', { replace: TP.cur()?.id==='track', params: { id: c.id } });
TP.act('viewFulfillment',(t,ctx)=>{let p=ctx?.params||{};try{p={...p,...JSON.parse(t?.dataset?.p||'{}')};}catch{}const record=TP.S.history?.find(h=>h.id===p.caseId);const c=TP.orderCases(TP.S).find(c=>c.id===p.caseId)||(TP.S._homeEventPreview?TP.S._homeFulfillmentPreviewCases?.find(c=>c.id===p.caseId):null)||(record?.order?{...record,order:record.order}:null)||(!p.caseId?TP.S.case:null);if(c?.order?.status!=='paid'||!c.order.paid)return;if(TP.fulfillmentInfo(c)?.done)return TP.openCompletedOrder(c);TP.S._paymentCase=c;TP.S._paidFromHome=false;return TP.go(TP.fulfillmentScreen(c),{via:'cover'});});
TP.chatDeliveryPage = c => {
  const f = TP.fulfillmentInfo(c), o = c.order;
  if (f.done) return TP.SCREENS.summary.render({ S: TP.S, state: '', params: { id: c.id } });
  const steps = TP.trackSteps(c), current = TP.trackStepIndex(c);
  const status = TP.orderStatusCard(steps, o.no, false, '', {
      artwork: current >= 2 ? 'delivery' : 'preparing',
      icons: ['receipt', 'pill', 'motorcycle', 'check'],
      carrier: 'Lalamove', carrierLogo: '/assets/couriers/lalamove.png'
    }
  );
  return TP.ui.nav({ title: 'ติดตามยา', right: `<button type="button" class="ibtn" data-a="paidClose" aria-label="ปิด">${TP.ic('x',22,2)}</button>` }) +
    TP.ui.page(status + TP.fulfillmentDetails(c), {cls:'order-tracking-page'});
};
/* End chat order lifecycle */

TP.paymentReminderCard = (S,c,opt={}) => {
  if(!c&&opt.pendingOnly){
    return TP.orderCases(S).filter(c=>c.status==='closed'&&TP.orderPayable(c.order))
      .map(c=>TP.paymentReminderCard(S,c,opt)).join('');
  }
  c ||= TP.pendingPaymentCase(S)||TP.orderCases(S).find(c=>c.status==='closed'&&c.order?.status==='expired');
  if(!c||c.status!=='closed'||!['pending','expired'].includes(c.order?.status))return '';
  TP.expireOrder(c);if(opt.pendingOnly&&!TP.orderPayable(c.order))return '';const o=c.order,pending=TP.orderPayable(o),b=TP.branch(c.branch);
  if(pending)return `<article class="post-consult-payment payment-reminder-card case-progress-card"><div class="consult-status-hero"><span class="case-status-watermark" aria-hidden="true">${ic('credit-card',160,1.4)}</span><header class="case-progress-head"><span class="case-progress-icon" aria-hidden="true">${ic('credit-card',22,1.8)}</span><span>การชำระเงิน</span>${ui.tag(o.payment?'รอชำระเงิน':'รอชำระ','warn')}</header><h3 class="consult-status-title payment-reminder-amount num">ต้องชำระ ${esc(TP.money(o.payment?.totals.total??o.total))}</h3><div class="payment-reminder-timing"><p class="post-payment-deadline">${ic('clock',16,2)}<span>${o.awaitingCheckout?'เริ่มนับเวลา 15 นาทีเมื่อกดชำระเงิน':`เหลือเวลาชำระ <b data-order-countdown data-order-case="${esc(c.id)}">${TP.orderRemaining(o)}</b> · ภายใน ${esc(TP.orderTime(o))} น.`}</span></p></div></div><div class="case-progress-body"><p class="payment-reminder-caption">รายการยาของคุณพร้อมชำระแล้ว</p><p class="case-progress-meta">${esc(b.name)} · ${o.items?.length||0} รายการ</p></div><footer class="case-progress-foot">${ui.btn('ดูรายการยาและชำระเงิน',{a:'openOrderPayment',p:{caseId:c.id},iconRight:'arrow-right'})}</footer></article>`;
  return `<article class="post-consult-payment case-progress-card"><header class="post-payment-heading case-progress-head"><span class="case-status-watermark" aria-hidden="true">${ic('clock',160,1.4)}</span><span class="case-progress-icon" aria-hidden="true">${ic(pending?'credit-card':'clock',22,1.8)}</span><span>${pending?'รอชำระค่ายา':'หมดเวลาชำระค่ายา'}</span>${ui.tag(pending?'รอชำระ':'สิ้นสุด',pending?'warn':'muted')}</header><div class="case-progress-body"><h3>${pending?'รายการยาของคุณพร้อมชำระแล้ว':'รายการยานี้ชำระไม่ได้แล้ว'}</h3><p>${esc(b.name)} · ${o.items?.length||0} รายการ</p><div class="post-payment-total"><span>รวมค่ายา</span><b>${esc(TP.money(o.total))}</b></div>${pending?`<p class="post-payment-deadline">${ic('clock',16,2)}<span>${o.awaitingCheckout?'เริ่มนับเวลา 15 นาทีเมื่อกดชำระเงิน':`ชำระภายใน ${esc(TP.orderTime(o))} น. · เหลือ <b data-order-countdown data-order-case="${esc(c.id)}">${TP.orderRemaining(o)}</b>`}</span></p></div><footer class="case-progress-foot">${ui.btn('ดูรายการยาและชำระเงิน',{a:'openOrderPayment',p:{caseId:c.id},icon:'credit-card'})}`:`<p class="post-payment-expired">ครบเวลาชำระ 15 นาทีแล้ว หากยังต้องการยา ให้เภสัชกรตรวจสอบรายการใหม่</p></div><footer class="case-progress-foot">${ui.btn('ปรึกษาเภสัชอีกครั้ง',{a:'requeue',kind:'secondary',icon:'message-circle'})}`}${ui.btn('ดูใบสรุปการปรึกษา',{go:'summary',p:{id:c.id},kind:'ghost'})}</footer></article>`;
};
TP.act('openOrderPayment',async (t,ctx)=>{

  let params=ctx?.params||{};try{params={...params,...JSON.parse(t?.dataset?.p||'{}')};}catch{}const id=params.caseId;if(id==='mock-pending-payment'&&!TP.S.history.some(h=>h.id===id))return TP.openPendingSample();
  const c=id?TP.orderCases(TP.S).find(c=>c.id===id):(TP.pendingPaymentCase(TP.S)||C());TP.expireOrder(c);
  if(TP.chatConsult(c)&&c.status!=='closed'){TP.notify('สอบถามเพิ่มเติมกับเภสัชกรได้ เมื่อสรุปการปรึกษาแล้วจึงชำระเงิน',{icon:'message-circle'});return;}
  if(!TP.orderPayable(c?.order)){TP.notify('รายการนี้หมดเวลาชำระแล้ว กรุณาให้เภสัชกรตรวจรายการใหม่',{icon:'clock'});return TP.refresh({anim:false});}
  if(c.order.payment)return TP.go('pendingpayment',{params:{caseId:c.id}});
  TP.S._paymentCase=c;TP.S.pay=null;return TP.sheet('pay');
});
/* Prototype clock only. A production backend owns expiration and payment reconciliation. */
TP.orderExpiryTick = () => {
  const cases = TP.orderCases(TP.S);
  let changed = false;
  for (const consultation of cases) {
    if (!TP.expireOrder(consultation)) continue;
    changed = true;
    TP.S.inbox?.unshift({
      id: 'order-expired-' + consultation.order.no,
      kind: 'order',
      title: 'รายการยาหมดเวลาชำระแล้ว',
      body: consultation.order.payment ? 'คำสั่งซื้อถูกยกเลิกอัตโนมัติ' : 'แชทและใบสรุปยังเปิดดูได้',
      time: TP.NOW.date + ' ' + TP.orderTime(consultation.order),
      read: false,
      go: 'summary',
      p: { id: consultation.id },
    });
  }
  if (changed) {
    TP.emit('state');
    const paymentCase = TP.S._paymentCase || TP.S.case;
    const sheet = TP.sheetOpen();
    const pendingId = sheet?.id === 'pendingcancel' ? sheet.ctx.params.caseId : sheet?.ctx?.params.pendingCaseId;
    if (pendingId && cases.some(c=>c.id===pendingId&&c.order?.status==='expired')) {
      TP.closeSheet({instant:true}).then(() => TP.refresh({anim:false}));
    } else if ((sheet?.id === 'pay' || sheet?.underlay?.id === 'pay') && paymentCase?.order?.status === 'expired') {
      const submitted = !!paymentCase.order.payment;
      TP.closeSheet({ instant: true }).then(() => submitted ? TP.go('home', {root:true}) : TP.sheet('pay', {caseId:paymentCase.id}));
    } else if (sheet?.id !== 'pay' && sheet?.underlay?.id !== 'pay') {
      TP.refresh({ anim: false });
    }
  }
  const byId = new Map(cases.map(consultation => [consultation.id, consultation]));
  document.querySelectorAll('[data-order-countdown]').forEach(element => {
    const consultation = element.dataset.orderCase
      ? byId.get(element.dataset.orderCase)
      : TP.S._paymentCase || TP.S.case;
    if (!consultation?.order) return;
    const remaining = TP.orderRemaining(consultation.order);
    if (element.textContent !== remaining) element.textContent = remaining;
  });
};
// Reconcile against the original deadline on return; never extend an order's life.
let orderExpiryTimer;
function syncOrderExpiryPolling(active) {
  clearInterval(orderExpiryTimer);
  if (!active) return;
  TP.orderExpiryTick();
  orderExpiryTimer = setInterval(() => TP.orderExpiryTick(), 1000);
}
if (TP.previewActivity) {
  TP.previewActivity.subscribe(syncOrderExpiryPolling);
  syncOrderExpiryPolling(TP.previewActivity.active());
} else {
  orderExpiryTimer = setInterval(() => TP.orderExpiryTick(), 1000);
}



TP.orderMedicineList = (o, { showPrice = true } = {}) => `<ul class="mo-l">${o.items.map(i => `<li>${TP.medicineImage(i)}<span class="medicine-copy"><b>${esc(i.name)}</b><small>จำนวน: ${esc(i.qty || "—")}</small><small>วิธีใช้: ${esc(i.how || "ใช้ตามคำแนะนำบนฉลาก")}</small></span>${showPrice && i.price != null ? `<span class="num">${TP.money(i.price)}</span>` : ""}</li>`).join('')}</ul>`;
/* The chat basket reads the same order snapshot as the proposal and receipt. */
TP.chatBasketBar = order => order?.items?.length && order.status !== 'cancelled' ? `<button type="button" class="rm-basket-bar" data-a="openMedicineBasket" aria-label="ดูตะกร้ายา ${order.items.length} รายการ">${ic('basket', 21, 1.8)}<span>ตะกร้ายา <b>${order.items.length} รายการ</b></span><span class="rm-basket-open">ดูรายการ ${ic('chevron-right',16,2)}</span></button>` : '';
TP.updateChatBasket = el => {
  const slot = $('#rmBasket', el);
  if (!slot) return;
  slot.innerHTML = TP.chatBasketBar(C()?.order);
  slot.hidden = !slot.firstElementChild;
  TP.icons(slot);
};

TP.act('openMedicineBasket', () => {
  if (TP.chatBasketBar(C()?.order)) return TP.sheet('medicinebasket');
});
TP.on?.('state', () => {
  const screen = TP.cur();
  if (screen?.id === 'room' && screen.el) TP.updateChatBasket(screen.el);
});

/* ---------- message html ---------- */
TP.orderMedicineDetails = o => `<div class="mo-h"><span class="mo-i">${ic('receipt',18,1.9)}</span><b>รายการยาจากเภสัชกร</b>${ui.tag(o.status==='paid'?'ชำระแล้ว':o.status==='expired'?'หมดอายุ':'รอชำระ',o.status==='paid'?'ok':o.status==='expired'?'muted':'warn')}</div>${TP.orderMedicineList(o)}<div class="mo-t"><span>รวมค่ายา</span><b class="num">${TP.money(o.total)}</b></div>`;
function orderCard(o) {
  TP.expireOrder?.(C());
  const cancelled = o.status === 'cancelled';
  return `<article class="msg-order rm-medicine-card${cancelled ? ' exp' : ''}" aria-label="รายการยาจากเภสัชกร">
    <header class="mo-h"><div><b>รายการยาจากเภสัชกร</b><small>${o.items.length} รายการ · รายการที่เสนอ</small></div></header>
    <div class="rm-medicine-body">${TP.orderMedicineList(o)}</div>
    <footer class="rm-medicine-footer"><div class="mo-t"><span>รวมค่ายา</span><b class="num">${TP.money(o.total)}</b></div><p class="${cancelled ? '' : 'rm-medicine-notice'}">${cancelled ? 'ยกเลิกรายการยาแล้ว ไม่มีการตัดเงิน' : 'โปรดแจ้งเภสัชกร หากต้องการแก้ไขรายการยา'}</p></footer>
  </article>`;
}

/* Mock first message: the symptom report sent automatically when the chat opens (prototype content, not the C203 state). */
/* Heading "อาการเบื้องต้น", then what the customer entered as typed (no labels or categories). */
TP.INTAKE_CHAT_MOCK = ['อาการเบื้องต้น', 'ไข้, เจ็บคอ', 'เป็นมา 2 วัน กลืนแล้วเจ็บ'];
function msgHtml(m) {
  if(m.kind==='provider-ready')return '<div class="msg-sys rm-provider-ready" role="status"><span><b>เภสัชกรเข้าร่วมห้องแล้ว</b><br>พิมพ์ข้อความเพื่อปรึกษาเภสัชกรได้เลย</span></div>';
  if(m.kind==='video-request'){
    const c=C(),pending=m.status==='pending'&&c.status==='room'&&!TP.S.call,inCall=m.status==='accepted'&&!!TP.S.call;
    const labels={declined:'คุณเลือกคุยทางแชทต่อ',withdrawn:'เภสัชกรยกเลิกคำขอนี้แล้ว',ended:'วิดีโอคอลจบแล้ว',accepted:inCall?'กำลังวิดีโอคอล':'รับคำขอแล้ว'};
    return `<article class="rm-video-request"><header><span class="rm-video-icon">${ic('video',24,1.8)}</span><div><h3>คำขอวิดีโอคอล</h3><p>${esc(P().short)} ขอคุยกับคุณผ่านวิดีโอ</p></div></header>${pending?`<p class="rm-video-help">กล้องและไมค์จะเริ่มใช้งานเมื่อคุณกดเข้าร่วม<br>ระหว่างคอล ย่อกลับมาพิมพ์แชทได้</p><div class="rm-video-actions"><button type="button" class="btn primary" data-a="acceptVideoRequest" data-request="${esc(m.id)}">${ic('video',18,2)}เข้าวิดีโอคอล</button><button type="button" class="btn secondary" data-a="declineVideoRequest" data-request="${esc(m.id)}">คุยแชทต่อ</button></div>`:m.status==='accepted'&&c.status==='room'?ui.btn('กลับเข้าวิดีโอคอล',{a:'startVideo',kind:'secondary',icon:'video'}):`<p class="rm-video-result">${esc(labels[m.status]||'คำขอนี้สิ้นสุดแล้ว')}</p>`}</article>`;
  }
  if (m.who === 'sys') return `<div class="msg-sys${m.move ? ' move' : ''}${m.kind === 'waiting' ? ' waiting' : ''}"><span>${m.move ? ic('map-pin', 14, 2) : ''}${m.text.includes('\n') ? (([head, ...rest]) => `<b>${esc(head)}</b><br>${rest.map(esc).join('<br>')}`)(m.text.split('\n')) : esc(m.text)}</span></div>`;
  if (m.kind === 'intake') return `<div class="msg me" data-kind="intake"><p>${(TP.intakeDetails(TP.S.case || {}).length ? TP.intakeDetails(TP.S.case) : TP.INTAKE_CHAT_MOCK).map(line => esc(line)).join('<br>')}</p><time>${esc(m.time || '')}</time></div>`;
  if (m.kind === 'order') return `<div class="msg ph wide">${orderCard(C().order)}</div>`;
  if (m.kind === 'summary' && (m.handoff || C()?.checkoutHandoffUntil)) return `<div class="msg-sys"><span>เภสัชกรสิ้นสุดสนทนาแล้ว ${esc(m.time || '')}</span></div>`;
  if (m.kind === 'summary') return `${m.by === 'auto' ? `<div class="msg-sys auto" role="status"><span>${ic('clock', 14, 2)}${esc(`ระบบปิดการปรึกษาให้ ${m.time || ''} เพราะไม่มีข้อความจากคุณ 5 นาที · ไม่มีค่าปรึกษา`)}</span></div>` : `<div class="msg-sys"><span>${m.by === 'me' ? 'คุณจบการปรึกษาแล้ว' : 'เภสัชกรปิดเคสแล้ว'} ${esc(m.time || '')}</span></div>`}<div class="msg ph wide"><button type="button" class="msg-sum" data-go="summary" data-p='{"id":"${C().id}"}'>${brand.halo(46, { check: true, still: true })}<span><b>ใบสรุปการปรึกษา</b><small class="consultation-note">${esc(TP.consultationText(C()) || 'ไม่มีข้อความอาการที่บันทึกไว้')}</small><small>${C().noAdvice ? 'ปิดก่อนได้รับคำแนะนำ · อาการที่ต้องไปพบแพทย์' : C().order?.status === 'paid' ? 'คำแนะนำ ยาที่ได้รับ และอาการที่ต้องไปพบแพทย์' : 'คำแนะนำ และอาการที่ต้องไปพบแพทย์'}</small></span>${ic('chevron-right', 18, 2)}</button></div>${TP.followCloseLine?.(C()) || ''}`;
  if (m.kind === 'image') return `<div class="msg ${m.who}"><div class="msg-img" role="img" aria-label="รูปที่ส่ง">${ic('image', 28, 1.5)}<small>รูปที่ส่ง</small></div><time>${esc(m.time || '')}</time></div>`;
  if (m.kind === 'call') return `<div class="msg-sys"><span>${ic('video', 14, 2)} ${esc(m.text)}</span></div>`;
  if (m.fail) return `<div class="msg ${m.who} fail"><p>${esc(m.text)}</p><button type="button" class="msg-retry" data-a="retryMsg">${ic('refresh-cw', 14, 2)}<span>ส่งไม่สำเร็จ แตะเพื่อลองส่งใหม่</span></button></div>`;
  return `<div class="msg ${m.who}"><p>${esc(m.text)}</p><time>${esc(m.time || '')}</time></div>`;
}
/* item 63 (owner 20/10): silent 15 minutes = the consult closes itself, warned 2 minutes before, one tap keeps it */
const IDLE_MS = 120000;
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const plusMin = (t, m) => { const [h, mm] = String(t || '14:20').split(':').map(Number), x = h * 60 + mm + m; return `${String(Math.floor(x / 60) % 24).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`; };
const quietAt = c => plusMin([...c.msgs].reverse().find(m => m.time)?.time, 5);
const idleLeft = c => Math.max(0, Math.ceil((c.idle.until - Date.now()) / 1000));
const idleHtml = c => (c.idle && c.status !== 'closed' ? `<section class="rm-idle" id="rmIdle" role="alert" aria-labelledby="rmIdleTitle"><header class="rm-idle-h"><span class="rm-idle-icon" aria-hidden="true">${ic('clock', 22, 1.8)}</span><h2 id="rmIdleTitle">ยังต้องการปรึกษาต่อไหม?</h2></header>`
  + `<div class="rm-idle-t">การปรึกษาจะสิ้นสุดใน <b class="num" id="rmIdleT">${mmss(idleLeft(c))}</b></div><p>เราไม่ได้รับข้อความจากคุณมา 3 นาที<br>กดปุ่มด้านล่างเพื่อคุยกับเภสัชกรต่อ</p><p class="rm-idle-footnote">หากหมดเวลา ระบบจะปิดการปรึกษานี้<br>ไม่มีค่าปรึกษา และเริ่มปรึกษาใหม่ได้ทุกเมื่อ</p>${ui.btn('ยังคุยอยู่ · ปรึกษาต่อ', { kind: 'secondary', cls: 'rm-idle-stay', a: 'idleStay', icon: 'message-circle' })}</section>` : '');

const wake = el => { const c = C(); if (!c?.idle) return; c.idle = null; $('#rmIdle', el)?.remove(); TP.emit('state'); };
const waitingForPharmacist = c => ['queue','paused'].includes(c.status);
const queueChatLabel = c => c.status==='paused'?'เภสัชกรพักชั่วคราว · คิวของคุณยังอยู่':c.pos<=1?'คุณเป็นคิวถัดไป':`รออีก ${Math.max(0,c.pos-1)} คิว`;
TP.queueChatLabel=queueChatLabel;
const seed = c => {
  c.msgs ||= [];
  if(c.status==='closed')return;
  if(waitingForPharmacist(c))return;
  /* Waiting happens on C207; retain submitted reports without obsolete chat prompts. */
  c.msgs=c.msgs.filter(m=>m.kind!=='waiting');
  if(c.waitedInChat&&!c.msgs.some(m=>m.kind==='provider-ready')){c.msgs.push({kind:'provider-ready',time:now()});c.step=0;}
  if(!c.msgs.length){c.msgs.push({who:'me',kind:'intake',time:now()},{kind:'provider-ready',time:now()});c.step=0;}
  if(!c.msgs.some(m=>m.kind==='intake'))c.msgs.splice(c.msgs[0]?.kind==='waiting'?1:0,0,{who:'me',kind:'intake',time:now()});
};
const videoQueueCard = c => `<section class="rm-video-wait" aria-labelledby="rmVideoWaitTitle">
  <img src="/assets/photos/video-queue-cover-v1.jpg" alt="" width="960" height="320">
  <div class="rm-video-wait-copy">
    <span>${ic('video',18,1.8)} วิดีโอคอล</span>
    <h2 id="rmVideoWaitTitle">รอเภสัชกรพร้อมวิดีโอคอล</h2>
    <b id="rmQueueLabel" role="status">${esc(queueChatLabel(c))}</b>
    <p>กรุณารอสักครู่ เมื่อเภสัชกรพร้อม คำเชิญจะขึ้นในห้องนี้</p>
  </div>
</section>`;

TP.queueChatUpdate = () => {
  const c=C(); if(!c)return;
  if(TP.cur()?.id==='queue') TP.refresh({anim:false});
  else if(TP.cur()?.id==='home') TP.refresh({anim:false});
  TP.live(queueChatLabel(c));
};


/* =====================================================================
   Room (C09)
   ===================================================================== */
TP.screen('room', {
  group: 'during', title: 'ห้องปรึกษา (แชท)', code: 'C303', ref: 'C09', parent: 'home',
  states: [['live', 'เล่นบทสนทนา'], ['order', 'เภสัชกรส่งรายละเอียดรายการยา'], ['checkout-handoff', 'เภสัชกรสิ้นสุดสนทนา · ไปชำระค่ายาใน 30 วินาที', true, 5], ['closed', 'ปิดเคส + ใบสรุป', true, 6], ['call', 'คุยวิดีโออยู่', true, 7], ['idle', 'เงียบ 3 นาที ใกล้ปิดเอง', true, 8], ['idleclosed', 'ปิดเองเพราะเงียบ 5 นาที', true, 9], ['offline','ไม่มีอินเทอร์เน็ต', true, 21]],
  notes: ['C303.8 แจ้งเตือนก่อนปิดเพราะเงียบ: กล่องอำพันอ่อน ขอบอำพัน แสดงเวลาที่เหลือและปุ่มปรึกษาต่อเต็มความกว้างสีน้ำตาลอำพันเข้ม ไม่ใช้ Primary; กดแล้วคงห้องและข้อความเดิม', 'C303.5 ลำดับปิดแชท: เภสัชกรพิมพ์ข้อความปิดท้าย 3 ข้อความ (ขออนุญาตจบ, วิธีรับยาและชำระภายใน 15 นาที, ขอบคุณ) พิมพ์ข้อความละประมาณ 2.4 วินาที เว้นระหว่างข้อความ 0.9 วินาที → เว้น 3 วินาที → เภสัชกรสิ้นสุดสนทนาแล้ว พร้อมปุ่มนับถอยหลัง 30 วินาทีไป C308 ทันที ใช้ลำดับเดียวกันเมื่อลูกค้าตอบไม่มีคำถามเพิ่มเติม และเมื่อกดปิดเคสจากแผง', 'เภสัชกรจบสนทนาและมียารอชำระ: ช่องพิมพ์เปลี่ยนเป็นปุ่มชำระค่ายานับถอยหลัง 30 วินาที กดทันทีหรือเปิดชำระอัตโนมัติเมื่อครบ เวลา 15 นาทีเริ่มเมื่อกดชำระเงินครั้งแรก', 'เมื่อเภสัชกรส่งรายการยา แสดงแถบตะกร้ายาเหนือช่องพิมพ์ กดเปิด C312 ตะกร้ายา เพื่อดูรูปยา จำนวน วิธีใช้ ราคา และยอดรวมจาก order เดียวกัน ไม่มีปุ่มจ่ายเงินในตะกร้า', 'หัวห้องแชทมีปุ่มจบสนทนาสีแดง เปิดยืนยันจบโดยตรง ไม่มีเมนูตัวเลือก C304; ขณะรอเภสัชแสดงยกเลิกสีแดงและยืนยันยกเลิกคิว', 'ข้อความแรกในแชทคือข้อมูลแจ้งอาการที่ส่งอัตโนมัติเป็นบับเบิ้ลของลูกค้า ใช้ข้อความตัวอย่างคงที่ ไม่ดึง state จาก C203 ข้อมูลอาการและสุขภาพจริงยังเก็บในเคสให้เภสัชกรใช้ดูแล', 'แตะรูปหรือชื่อเภสัชกรเปิดข้อมูลในป๊อปอัป C313 แล้วกลับแชทเดิมได้', 'ส่วนบนห้องแชทแสดงชื่อ ใบอนุญาต และสาขาจากเคส พร้อมปุ่มวิดีโอคอล ไม่มีปุ่มโทร ข้อความผู้ใช้สี Primary ข้อความเภสัชกรสีขาวบนพื้นเทาอ่อน ใช้ภาษาไทยทุกปุ่ม', 'เภสัชกรส่งการ์ดคำขอวิดีโอคอล ลูกค้ากดเข้าร่วมเอง ย่อคอลมาพิมพ์แชทและกลับเข้าคอลได้โดยสายไม่หลุด', 'แชทแสดงการ์ดรายการยารูปแบบหัว เนื้อหา ท้าย: รูปยา ชื่อ จำนวน วิธีใช้ ราคา และรวมค่ายา ใช้รายการเดียวกับบิลและใบสรุป ไม่มีปุ่มจ่ายเงินหรือปุ่มคำสั่งซื้อในการ์ด เมื่อจบแชทจึงเปิดหน้าชำระเงิน เวลาเริ่มเมื่อกดชำระครั้งแรก', 'ออกจากห้อง = เคสยังเปิด กลับเข้าได้จากหน้าแรก แถบด้านล่าง และประวัติ', 'ข้อความใหม่ตอนออกจากแอป = แจ้งเตือนแบบคำกลาง ๆ', 'A4 + A9 (20/10): แชทเก็บ 1 ปีนับจากวันปิดเคส',
    'นโยบายล่าสุด: ไม่มีการตอบกลับ 3 นาที แจ้งเตือนอีก 2 นาที ก่อนสิ้นสุดเมื่อครบ 5 นาที; แยกจากเวลาชำระยา 15 นาที และไม่ยกเลิกรายการยารอชำระเมื่อจบแชท'],
  wait: ['ลูกค้าเงียบระหว่างไปจ่ายเงิน (มีรายการรอชำระ) นับเวลาเงียบไหม · ต้นแบบนับเหมือนกัน ปิดแล้วรายการยกเลิก'],
  prep(S) {
    const st = S.st.room || 'live';
    if(['closed-unpaid','payment-soon','checkout-handoff'].includes(st)){TP.casePreview.seed(st==='checkout-handoff'?'closed-unpaid':st);if(st==='checkout-handoff'){const c=S.case;c.status='room';c.checkoutHandoffUntil=null;c.msgs=c.msgs.filter(m=>m.kind!=='summary');Object.assign(c.order,{awaitingCheckout:true,paymentStartedAt:null,expiresAt:null});c._handoffAuto=true;}return;}
    const c = TP.ensureCase('room');
    S.netOff = st === 'offline'; S.call = null; c.idle = null; c.endWhy = null; c.noAdvice = false;
    if(['video-request','video-declined','video-withdrawn','call'].includes(st)){
      c.msgs=[];c.step=99;c.order=null;c.quick=null;c.status='room';seed(c);
      c.msgs.push({kind:'video-request',id:'preview-video-request',status:({'video-request':'pending','video-declined':'declined','video-withdrawn':'withdrawn','call':'accepted'})[st],time:now()});
      if(st==='call')S.call={t0:Date.now()-74000,mic:true,cam:true};
      return;
    }

    if (st === 'idle' || st === 'idleclosed') {
      /* the pharmacist asked the first question, the customer never answered */
      c.msgs = []; c.order = null; c.quick = null; c.answered = false; seed(c);
      const sc = SCRIPT(c), qi = sc.findIndex(m => m.quick);
      sc.slice(0, qi + 1).forEach(m => c.msgs.push({ who: 'ph', text: m.text, time: now() }));
      c.step = qi + 1;
      if (st === 'idle') { c.quick = sc[qi].quick; c.idle = { until: Date.now() + IDLE_MS }; }
      else { c.status = 'closed'; c.endWhy = 'noreply'; c.noAdvice = true; c.msgs.push({ kind: 'summary', time: quietAt(c), by: 'auto' }); }
      return;
    }
    const real = c.msgs.some(m => m.who === 'me' && !m.kind && !m.canned);
    if (st === 'live' || !real) { c.msgs = []; c.step = 0; c.order = null; c.quick = null; }
    if (st === 'live') return;
    if (!real) {
      /* sample conversation built from this case's plan, the customer's answer is the first suggested reply */
      seed(c);
      const sc = SCRIPT(c), k = TP.casePlan(c), qi = sc.findIndex(m => m.quick);
      sc.slice(0, qi + 1).forEach(m => c.msgs.push({ who: 'ph', text: m.text, time: now() }));
      c.msgs.push({ who: 'me', text: k.q[1][0], time: now(), canned: true });
      sc.slice(qi + 1).filter(m => !m.kind).forEach(m => c.msgs.push({ who: 'ph', text: m.text, time: now() }));
    }
    c.step = 99; c.quick = null;
    if (!c.order) { TP.makeOrder(); c.msgs.push({ kind: 'order' }); }
    if ((st === 'paid' || st === 'closed') && c.order.status !== 'paid') { c.order.status = 'paid'; c.msgs.push({ who: 'ph', text: TP.paidMsg(c.order.paid?.recv || 'pickup'), time: now() }); }
    if (st === 'closed' && c.status !== 'closed') { c.status = 'closed'; c.msgs.push({ kind: 'summary', time: now() }); }
    if (st === 'call') S.call = { t0: Date.now() - 74000, mic: true, cam: true };
    if (st === 'offline') c.msgs.push({ who: 'me', text: 'ยาอมกับสเปรย์ใช้พร้อมกันได้ไหมคะ', fail: true });
  },
  render(ctx) {
    /* a closed case stays readable in the room (its summary card lives here); only a missing case gets a new one */
    const c = TP.S.case?.status === 'closed' ? TP.S.case : TP.ensureCase(null), p = P(), b = TP.branch(c.branch);
    if(c.status==='matched'){c.waitedInChat=true;c.status='room';}
    if (waitingForPharmacist(c)) return TP.SCREENS.queue.render(ctx);
    const waiting=waitingForPharmacist(c);
    const videoWaiting=waiting&&c.mode==='video';
    seed(c);
    const closed = c.status === 'closed';
    const call = TP.S.call ? `<button type="button" class="rm-call" data-a="startVideo">${ic('video', 16, 2)}<span>${TP.S.call.waitingProvider ? 'รอเภสัชกรเข้าห้องวิดีโอ' : 'กำลังวิดีโอคอล'} <b class="num" id="rmCallT">${TP.S.call.waitingProvider ? '' : '00:00'}</b></span><span class="rm-call-go">แตะเพื่อกลับ</span></button>` : '';
    return `<header class="nav solid rm-nav rm-waiting-nav"><div class="nb-l"><button type="button" class="back" data-a="queueMin" aria-label="ย่อห้อง">${ic('chevron-left',22,2)}</button></div><h1>แชทกับเภสัชกร</h1><div class="nb-r">${waiting?'<button type="button" class="txtbtn rm-cancel-wait" data-sheet="cancelq">ยกเลิก</button>':closed?'':'<button type="button" class="txtbtn rm-cancel-wait" data-sheet="endcase">จบสนทนา</button>'}</div></header>
      ${!waiting?`<div class="rm-provider-bar"><button type="button" class="rm-who" data-sheet="chatprovider" aria-label="ดูข้อมูลเภสัชกร" aria-haspopup="dialog">${ui.av('', {ini:p.ini,img:p.id==='tp'?TP.demoProfiles?.pharmacist_m:'/assets/profiles/pharmacist-chat-v2.webp',size:'sm',solid:true})}<span><b>${esc(p.short)} <span class="rm-provider-license">· ${esc(p.lic)}</span></b><small>${esc(b.name)}</small></span></button>${closed?'':`<button type="button" class="ibtn" data-a="chatVideo" aria-label="วิดีโอคอล">${ic('video',24,1.8)}</button>`}</div>`:''}
      ${waiting&&!videoWaiting?`<div class="rm-queue-bar" role="status" aria-live="polite" aria-atomic="true"><span class="rm-queue-icon" aria-hidden="true">${ic(c.status==='paused'?'clock':'search',24,2)}</span><span class="rm-queue-copy"><b>${c.status==='paused'?'รอเภสัชกรกลับมารับบริการ':'กำลังหาเภสัชกร...'}</b><small id="rmQueueLabel">${esc(queueChatLabel(c))}</small></span></div>`:''}
      ${call}${TP.S.netOff ? `<div class="rm-net" role="status">${ic('wifi-off', 16, 2)}<span>ไม่มีอินเทอร์เน็ต ข้อความจะส่งเมื่อกลับมาออนไลน์</span></div>` : ''}
      <div class="scroll rm-scroll${!waiting?' has-provider':''}${call ? ' has-call' : ''}${waiting&&!videoWaiting?' has-queue':''}${TP.S.netOff ? ' has-net' : ''}${closed ? (c.endWhy === 'noreply' ? ' end2' : ' ended') : ''}" id="rmScroll">${videoWaiting?videoQueueCard(c):''}<div class="rm-day">${esc(c.day0 || 'วันนี้')}</div><div class="rm-list" id="rmList">${c.msgs.map(msgHtml).join('')}</div><div class="rm-quick" id="rmQuick"></div>${idleHtml(c)}</div>
      ${closed && TP.checkoutHandoffRemaining(c) ? ui.dock(ui.btn(`ขั้นตอนต่อไป ชำระค่ายา (${TP.checkoutHandoffRemaining(c)} วิ)`,{a:'continueCheckout'})) : closed && c.order?.status==='pending' ? ui.dock(`${ui.btn('ดูรายการยาและชำระเงิน',{a:'openOrderPayment',icon:'credit-card'})}${ui.btn('เปิดใบสรุป',{kind:'ghost',go:'summary',p:{id:c.id}})}`,{note:`ปรึกษาเสร็จแล้ว · ชำระค่ายาภายใน ${esc(TP.orderTime(c.order))} น.`}) : closed && c.endWhy === 'noreply' ? ui.dock(`${TP.S.storeOpen ? ui.btn('ปรึกษาใหม่', { a: 'requeue', icon: 'message-circle' }) : ''}${ui.btn('เปิดใบสรุป', { kind: 'ghost', go: 'summary', p: { id: c.id } })}`, { note: TP.S.storeOpen ? 'ยังมีอาการ ปรึกษาใหม่ได้ทันทีที่สาขาเดิม ไม่ต้องกรอกอาการใหม่ · ไม่มีค่าปรึกษา' : `ร้านปิดแล้ว ฝากคำถามไว้ เภสัชกรตอบ${TP.OF_REPLY}` }) :
      closed ? ui.dock(`<p class="dock-note" style="margin:0">เคสนี้ปิดแล้ว · ดูย้อนหลังได้ในประวัติ 1 ปีนับจากวันปิดเคส</p>${ui.btn('เปิดใบสรุป', { go: 'summary', p: { id: c.id } })}`) :
      `<div id="rmBasket" class="rm-basket-strip"${TP.chatBasketBar(c.order) ? '' : ' hidden'}>${TP.chatBasketBar(c.order)}</div><div class="dock rm-comp"><div class="rm-compose-row"><button type="button" class="ibtn" data-a="sendPhoto" aria-label="ส่งรูป">${ic('camera', 22, 1.8)}</button><label class="sr" for="rmIn">พิมพ์ข้อความ</label><textarea id="rmIn" class="rm-in" rows="1" placeholder="${waiting?'พิมพ์อาการเพิ่มเติมไว้ระหว่างรอ':'พิมพ์ข้อความ'}">${esc(c.draft||'')}</textarea><button type="button" class="rm-send" data-a="sendMsg" aria-label="ส่ง" disabled>${ic('arrow-up', 20, 2.4)}</button></div></div>`}`;
  },
  mount(el, ctx) {
    if (waitingForPharmacist(C())) return TP.SCREENS.queue.mount(el,ctx);
    const c = C(), sc = $('#rmScroll', el), inp = $('#rmIn', el), send = $('.rm-send', el);
    const bottom = (smooth = true) => sc.scrollTo({ top: sc.scrollHeight, behavior: smooth && !TP.RED() ? 'smooth' : 'auto' });
    el._bottom = bottom;
    requestAnimationFrame(() => { if (!$('.rm-video-wait',el)) bottom(false); });
    if (ctx.state === 'checkout-handoff' && c._handoffAuto && c.status === 'room') { c._handoffAuto = false; ctx.later(() => TP.playCheckoutHandoff(el, c), 600); }
    if (c.status === 'closed' && c.checkoutHandoffUntil) {
      const next = el.querySelector('[data-a="continueCheckout"]');
      let navigating = false;
      const tickCheckout = () => {
        if (navigating || TP.cur()?.el !== el || TP.S.case !== c) return;
        const seconds = TP.checkoutHandoffRemaining(c);
        if (next) next.textContent = `ขั้นตอนต่อไป ชำระค่ายา (${seconds} วิ)`;
        if (!seconds) { navigating = true; TP.ACTS.continueCheckout(); }
      };
      tickCheckout(); ctx.every(tickCheckout, 1000);
    }
    if (inp) {
      send.disabled=!inp.value.trim();
      inp.addEventListener('input', () => { c.draft=inp.value;send.disabled = !inp.value.trim(); inp.style.height = 'auto'; inp.style.height = Math.min(110, inp.scrollHeight) + 'px'; });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (inp.value.trim()) TP.ACTS.sendMsg(send); } });
    }
    if (TP.S.call) { const t = $('#rmCallT', el); const tick = () => { if (!TP.S.call) return; if (TP.S.call.waitingProvider || !TP.S.call.t0) { t.textContent = ''; return; } const s = Math.floor((Date.now() - TP.S.call.t0) / 1000); t.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }; tick(); ctx.every(tick, 1000); }
    if (c.quick) showQuick(el, c.quick);
    if (c.idle) { const t = $('#rmIdleT', el); ctx.every(() => { if (!c.idle) return; const s = idleLeft(c); if (t) t.textContent = mmss(s); if (!s) TP.sim.idleClose(); }, 1000); }
    if (ctx.state!=='provider-joined'&&!waitingForPharmacist(c)&&c.status!=='closed')ctx.later(()=>play(el,ctx),700);
  }
});

/* play the pharmacist's side as a live conversation */
async function play(el, ctx) {
  const c = C();if(!c||waitingForPharmacist(c)||c.status==='closed')return;const script=SCRIPT(c);
  while (ctx && el.isConnected && c.step < script.length) {
    const m = script[c.step];
    if ((m.wait || c.hold) && !c.answered) return;   /* hold: the night-question answer waits for the customer's reply */
    await typing(el, m.kind === 'order' ? 1400 : 900 + m.text?.length * 14);
    if (!el.isConnected || TP.cur()?.el !== el || C()!==c || waitingForPharmacist(c) || c.status==='closed') return;
    if (m.kind === 'order') { if(!c.order){TP.makeOrder(); push(el, { kind: 'order' }); TP.mini(false);} }
    else push(el, { who: 'ph', text: m.text, time: now() });
    c.step++;
    if (m.quick) { c.quick = m.quick; showQuick(el, m.quick); return; }
  }
}
async function typing(el, ms) {
  const list = $('#rmList', el);
  list.insertAdjacentHTML('beforeend', '<div class="msg ph tp"><span class="typing" aria-label="เภสัชกรกำลังพิมพ์"><i></i><i></i><i></i></span></div>');
  const t = list.lastElementChild; el._bottom?.();
  A(t, [{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'none' }], { d: 300, e: SP.spring.e });
  await TP.wait(Math.min(2600, ms));
  t.remove();
}
function push(el, m) {
  C().msgs.push(m);
  if (m.kind === 'order') TP.updateChatBasket(el);
  const list = $('#rmList', el);
  list.insertAdjacentHTML('beforeend', msgHtml(m));
  const n = list.lastElementChild; TP.icons(n);
  A(n, [{ opacity: 0, transform: `translateY(14px) scale(.96)`, transformOrigin: m.who === 'me' ? '100% 100%' : '0 100%' }, { opacity: 1, transform: 'none' }], { d: SP.spring.d, e: SP.spring.e });
  el._bottom?.();
  if (m.who === 'ph') TP.live('ข้อความใหม่จากเภสัชกร');
}
function showQuick(el, q) {
  const box = $('#rmQuick', el);
  box.innerHTML = q.map(t => `<button type="button" class="chip" data-a="quickReply" data-v="${esc(t)}">${esc(t)}</button>`).join('');
  $$('.chip', box).forEach((n, i) => A(n, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { d: 420, e: SP.soft.e, delay: i * 70, fill: 'backwards' }));
  el._bottom?.();
}
/* Pharmacist closing messages before the chat ends with a payable order (prototype copy). */
TP.CHECKOUT_CLOSING = [
  'หากคุณลูกค้าไม่มีข้อสอบถามเพิ่มเติม เภสัชกรขออนุญาตบันทึกรายการยาและจบการสนทนา เพื่อพาคุณลูกค้าไปยังหน้าเลือกวิธีรับยาและชำระเงินค่ะ',
  'ในหน้าชำระเงิน คุณลูกค้าเลือกรับยาที่ร้านหรือจัดส่งด่วนได้ และชำระผ่านพร้อมเพย์หรือบัตรเครดิต/เดบิต ภายใน 15 นาทีหลังจากกดชำระเงินครั้งแรกค่ะ',
  'ขอบคุณที่ใช้บริการ ดูแลสุขภาพด้วยนะคะ'
];
TP.HANDOFF_TYPING_MS = 2400;   // each closing message types slowly enough to read
TP.HANDOFF_BEFORE_END_MS = 3000;   // pause after the last message before "ended"
TP.playCheckoutHandoff = async (el, c) => {
  if (!c || c._handoffPlaying || c.status !== 'room') return;
  c._handoffPlaying = true;
  const here = () => TP.cur()?.el === el && C() === c && c.status === 'room';
  try {
    $('#rmQuick', el) && ($('#rmQuick', el).innerHTML = ''); c.quick = null;
    for (const [i, text] of TP.CHECKOUT_CLOSING.entries()) {
      if (i) await TP.wait(TP.RED() ? 50 : 900);
      if (!here()) return;
      await typing(el, TP.RED() ? 50 : TP.HANDOFF_TYPING_MS);
      if (!here()) return;
      push(el, { who: 'ph', text, time: now() });
    }
    await TP.wait(TP.RED() ? 100 : TP.HANDOFF_BEFORE_END_MS);
    if (!here()) return;
    /* "ended" and the 30 s checkout countdown appear together */
    TP.sim.closeCase('ph');
  } finally { c._handoffPlaying = false; }
};
/* the bubble flies up out of the composer */
async function sendText(text) {
  if (!C() || ['closed','queue','paused'].includes(C().status)) return;
  const el = TP.cur().el, c = C();
  $('#rmQuick', el).innerHTML = ''; c.quick = null; wake(el);
  const inp = $('#rmIn', el);
  if (inp && !TP.RED()) {
    const r0 = inp.getBoundingClientRect(), k = TP.phone.getBoundingClientRect().width / TP.phone.offsetWidth || 1, pr = TP.phone.getBoundingClientRect();
    const ghost = document.createElement('div'); ghost.className = 'msg-fly'; ghost.textContent = text;
    ghost.style.left = (r0.left - pr.left) / k + 'px'; ghost.style.top = (r0.top - pr.top) / k + 'px';
    TP.phone.appendChild(ghost);
    const gw = ghost.offsetWidth, tx = TP.phone.offsetWidth - 16 - gw - (r0.left - pr.left) / k;
    await fin(A(ghost, [{ transform: 'none', opacity: 1 }, { transform: `translate(${tx}px,-90px) scale(.98)`, opacity: .2 }], { d: 360, e: E.out }));
    ghost.remove();
  }
  if (TP.S.netOff) { push(el, { who: 'me', text, time: now(), fail: true }); return; }
  push(el, { who: 'me', text, time: now() });
  if(waitingForPharmacist(c))return;
  if(TP.chatConsult(c)&&c.order&&text==='ไม่มีคำถามเพิ่มเติม'){await TP.playCheckoutHandoff(el,c);return;}

  if (c.fromOf && /ดีขึ้น|หายแล้ว/.test(text)) { c.step = 99; await typing(el, 1300); if (TP.cur()?.el === el) push(el, { who: 'ph', text: `ดีใจด้วยค่ะ ${TP.casePlan(c).see}นะคะ ถ้ากลับมามีอาการ ปรึกษาใหม่ได้ทุกเมื่อค่ะ`, time: now() }); return; }
  if (c.step < SCRIPT(c).length) { c.answered = true; play(el, TP.cur().ctx); }
  else { await typing(el, 1300); if (TP.cur()?.el === el) push(el, { who: 'ph', text: 'รับทราบค่ะ ถ้ามีอะไรเพิ่มเติมพิมพ์บอกได้เลยนะคะ', time: now() }); }
}
TP.act('quickReply', t => sendText(t.dataset.v));
TP.act('sendMsg', t => { const inp = $('#rmIn', TP.cur().el); const v = inp.value.trim(); if (!v) return; inp.value = ''; C().draft='';inp.style.height = ''; t.disabled = true; sendText(v); });
TP.act('sendPhoto', () => { const el = TP.cur().el; wake(el); push(el, { who: 'me', kind: 'image', time: now() }); TP.notify('ส่งรูปแล้ว', { icon: 'image' }); });

/* close the case (pharmacist side) */
TP.sim.closeCase = (by = 'ph', at) => {
  const c = C(); if (!c) return;
  if(c.status==='closed')return;
  c.outcome=by==='me'?'customer-ended':by==='auto'||c.endWhy==='noreply'?'no-response':'completed';
  if(TP.chatConsult(c)&&by==='ph'&&!c.pharmacistAdvice)c.pharmacistAdvice=(TP.casePlan(c).adv||[]).join('\n');
  c.status = 'closed'; c.quick = null;c.idle=null;TP.S.call=null;
  if (by === 'ph' && TP.chatConsult(c) && TP.cur()?.id === 'room' && c.order?.items?.length && TP.orderPayable(c.order)) c.checkoutHandoffUntil = Date.now() + 30000;
  c.msgs.filter(m=>m.kind==='video-request'&&['pending','accepted'].includes(m.status)).forEach(m=>m.status='ended');
  if(c.order?.status==='pending')TP.orderDeadline(c.order);
  TP.S._disSeen = true;
  const qk = TP.cur()?.id === 'room' && $('#rmQuick', TP.cur().el); if (qk) qk.innerHTML = '';
  c.msgs.push({ kind: 'summary', time: at || now(), by, ...(c.checkoutHandoffUntil ? { handoff: true } : {}) });
  TP.S.history.unshift({ id: c.id, caseCode: TP.caseCode(c), note: c.note, date: c.date || TP.NOW.date, time: c.joinedAt, who: c.who, topic: c.symptoms.join(' ') || 'ถามเรื่องยา', branch: c.branch, pharm: c.pharm, bought: c.order?.status === 'paid' ? c.order.total : 0, orderStatus: c.order?.status || 'none', outcome:c.outcome, rated: 0, summary: true, _case:c });
  if (by !== 'me') TP.S.inbox.unshift({ id: 'n' + Date.now(), kind: 'summary', title: 'ใบสรุปการปรึกษาพร้อมแล้ว', body: 'แตะเพื่อเปิดดู', time: TP.NOW.date + ' 14:41', read: false, go: 'summary', p:{id:c.id} });
  if(c.order?.status==='pending')TP.S.inbox.unshift({id:'order-pending-'+c.order.no,kind:'order',title:'มีรายการยารอชำระ',body:'การปรึกษาจบแล้ว เปิดแอปเพื่อดูรายการและเวลาชำระ',time:TP.NOW.date+' '+now(),read:false,go:'summary',p:{id:c.id}});
  TP.emit('state');
  if(TP.checkoutHandoffRemaining(c)){TP.refresh({anim:false});return;}
  if(TP.chatConsult(c)&&['room','queue'].includes(TP.cur()?.id)){TP.finishChatNavigation(c);return;}
  if (TP.cur()?.id === 'room') TP.refresh();
  else {
    if (TP.cur()?.id === 'home') TP.refresh({ anim: false });
    if (by === 'auto') TP.banner({ title: 'การปรึกษาปิดแล้ว', body: 'ไม่มีข้อความจากคุณ 5 นาที แตะเพื่อดูใบสรุปหรือปรึกษาใหม่', go: 'room' });
    else TP.banner({ title: 'ใบสรุปการปรึกษาพร้อมแล้ว', body: 'แตะเพื่อเปิดดู', go: 'summary' });
  }
};
TP.sim.idleWarn = () => {
  const c = C(); if (!c || c.idle || c.status === 'closed') return;
  c.idle = { until: Date.now() + IDLE_MS }; TP.emit('state');
  if (TP.cur()?.id === 'room') TP.refresh({ anim: false });
  else { if (TP.cur()?.id === 'home') TP.refresh({ anim: false }); TP.banner({ icon:'reply', title: 'เภสัชกรรอคำตอบอยู่', body: 'ถ้าไม่ตอบใน 2 นาที การปรึกษาจะปิด แตะเพื่อกลับไปคุย', go: 'room' }); }
  setTimeout(() => { if (C() === c && c.idle && idleLeft(c) === 0) TP.sim.idleClose(); }, IDLE_MS + 400);
};
TP.sim.idleClose = () => {
  const c = C(); if (!c?.idle || c.status === 'closed') return;
  /* real-user 20/10: only a consult that ended before the pharmacist's advice says so in the summary */
  c.idle = null; c.endWhy = 'noreply'; c.noAdvice = c.step <= SCRIPT(c).findIndex(m => m.wait);
  TP.sim.closeCase('auto', quietAt(c));
};
TP.act('idleStay', () => {
  const el = TP.cur().el, c = C(); wake(el);
  push(el, { who: 'me', text: 'ยังคุยอยู่', time: now() });
  setTimeout(async () => { if (TP.cur()?.el !== el) return; await typing(el, 900); if (TP.cur()?.el === el) push(el, { who: 'ph', text: c.quick ? 'ขอบคุณค่ะ เลือกคำตอบหรือพิมพ์บอกได้เลยนะคะ ไม่ต้องรีบค่ะ' : 'ขอบคุณค่ะ มีอะไรเพิ่มเติมพิมพ์บอกได้เลยนะคะ', time: now() }); }, 300);
});
TP.sheetDef('medicinebasket', {
  group: 'during', title: 'ตะกร้ายา', code: 'C312', host: 'room', tall: true, cls: 'medicine-basket-sheet',
  states: [['normal', 'รายการยาจากเภสัชกร'], ['empty', 'ยังไม่มีรายการยา · กรณีสำรอง']],
  notes: ['ข้อความแจ้งแก้ไขรายการยาใช้กล่องสีเทาอ่อน เป็นข้อมูลทั่วไป','ซ่อนแถบตะกร้าเมื่อยังไม่เพิ่มยาหรือลบยาทั้งหมด ไม่เปิดตะกร้าว่างในโฟลว์ปกติ หน้าว่างเป็นกรณีสำรองสำหรับ preview เท่านั้น', 'เปิดจากแถบตะกร้ายาเหนือช่องพิมพ์ใน C303 หลังเภสัชกรเพิ่มยา ใช้ order.items เดียวกับการ์ดแชทและใบเสร็จ', 'แสดงรูป ชื่อ จำนวน วิธีใช้ ราคา และยอดรวม อ่านอย่างเดียว ไม่มีปุ่มชำระเงินหรือแก้จำนวน ผู้ใช้แจ้งเภสัชกรในแชทหากต้องการแก้รายการ', 'ปิดด้วยปุ่มปิด กากบาท พื้นหลัง หรือ Escape แล้วกลับห้องเดิมพร้อมข้อความร่าง'],
  prep(S) { S.st.room = S.st.medicinebasket === 'empty' ? 'live' : 'order'; TP.SCREENS.room.prep(S); },
  render() {
    const o = C()?.order;
    if (!o?.items?.length || o.status === 'cancelled') return `<div class="rm-basket-empty"><img class="rm-basket-empty-illustration" src="/assets/illustrations/medicine-basket-empty-v1.png" alt=""><h3 class="h3">ยังไม่มีรายการยา</h3><p class="small">รายการยาจะแสดงเมื่อเภสัชกรเพิ่มยาให้คุณ</p></div>`;
    return `<section class="rm-basket-content"><header class="rm-basket-intro"><div><span class="rm-basket-eyebrow">ตะกร้ายาของคุณ</span><b>รายการยาที่เภสัชกรเพิ่มให้</b><p class="small">${o.items.length} รายการ</p></div></header><div class="rm-basket-items">${TP.orderMedicineList(o)}</div><div class="rm-basket-total"><span>รวมค่ายา</span><b class="num">${TP.money(o.total)}</b></div><div class="note neutral">${ic('message-circle',18,1.8)}<span>โปรดแจ้งเภสัชกร หากต้องการแก้ไขรายการยา</span></div><div class="note neutral">${ic('truck',18,1.8)}<span>ยอดนี้ยังไม่รวมค่าจัดส่ง คุณจะเห็นค่าจัดส่งตามช่องทางที่เลือกก่อนชำระเงิน</span></div></section>`;
  },
  foot: () => ui.btn('ปิด', { closeSheet: true })
});

TP.sheetDef('chatprovider', {
  group: 'during', title: 'ข้อมูลเภสัชกร', code: 'C313', host: 'room', cls: 'rm-provider-popup',
  states: [['normal', 'ข้อมูลเภสัชกรผู้ให้คำปรึกษา']],
  notes: ['แตะรูปหรือชื่อเภสัชกรในหัวห้องแชท เปิดป๊อปอัปกลางจอพร้อมพื้นหลังมืด', 'รูป ชื่อ เลขใบอนุญาต และสาขาอ้างอิงเภสัชกรและสาขาในเคสเดียวกัน ไม่สร้างเลขใบอนุญาตร้านหรือคุณวุฒิเพิ่มเอง', 'ปิดแล้วกลับห้องเดิม ข้อความร่างและการสนทนายังคงอยู่'],
  prep(S) { S.st.room = 'live'; TP.SCREENS.room.prep(S); },
  render() {
    const c = C(), p = P(), b = TP.branch(c?.branch);
    const img = p.id === 'tp' ? TP.demoProfiles.pharmacist_m : '/assets/profiles/pharmacist-chat-v2.webp';
    return `<article class="rm-provider-profile"><img class="rm-provider-portrait" src="${esc(img)}" alt="${esc(p.name)}"><h3 class="h3">${esc(p.name)}</h3><dl><div><dt>ตำแหน่ง</dt><dd>เภสัชกร</dd></div><div><dt>เลขใบอนุญาต</dt><dd>${esc(p.lic)}</dd></div><div><dt>สาขา</dt><dd>${esc(b.name)}</dd></div>${b.lic ? `<div><dt>ใบอนุญาตร้านยา</dt><dd>${esc(b.lic)}</dd></div>` : ''}</dl></article>`;
  },
  foot: () => ui.btn('ปิด', { closeSheet: true })
});

/* End consultation directly from the header, then confirm. */
TP.sheetDef('endcase', {
  group: 'during', title: 'ผู้ใช้กดจบสนทนา', code: 'C305', ref: 'C09', host: 'room',
  render: () => { const o = C()?.order; return `<p class="body">การปรึกษานี้จะถูกยกเลิก${o?.status === 'pending' ? ' รายการยาที่เภสัชกรส่งมาจะถูกยกเลิกด้วย' : ''} ถ้ายังมีอาการ เริ่มปรึกษาใหม่ได้ทันทีจากหน้าแรก</p>`; },
  foot: () => ui.btn('จบการปรึกษา', { kind: 'danger', a: 'endCase' }) + ui.btn('คุยต่อ', { kind: 'ghost', closeSheet: true })
});
/* User 8 Nov 2026: the customer ending the chat cancels the consultation. Any unpaid order is cancelled too,
   so no status or payment card remains; home is ready for a new consultation and history shows "ยกเลิก". */
TP.act('endCase', async () => {
  const c = C(); if (!c) return;
  await TP.closeSheet();
  if (c.order?.status === 'pending') { c.order.status = 'cancelled'; c.order.cancelledAt = Date.now(); c.order.cancelledBy = 'customer'; }
  TP.sim.closeCase('me');
  /* chat: closeCase already routes a closed chat to home; video and other screens go home here */
  if (!TP.chatConsult(c) && ['room', 'video'].includes(TP.cur()?.id)) await TP.go('home', { root: true, via: 'uncover' });
  TP.notify('ยกเลิกการปรึกษาแล้ว เริ่มปรึกษาใหม่ได้ทันที', { icon: 'circle-check' });
});
TP.act('retryMsg', () => {
  if (TP.S.netOff) { TP.notify('ยังไม่มีอินเทอร์เน็ต ลองอีกครั้งเมื่อสัญญาณกลับมา', { icon: 'wifi-off' }); return; }
  C().msgs.forEach(m => { if (m.fail) { m.fail = false; m.time = now(); } }); TP.refresh({ anim: false });
});
TP.simAction({ id: 'net', label: 'เน็ตหลุด / กลับมา', when: S => TP.cur()?.id === 'room', run: () => { TP.S.netOff = !TP.S.netOff; TP.refresh({ anim: false }); TP.notify(TP.S.netOff ? 'จำลอง: ไม่มีอินเทอร์เน็ต' : 'จำลอง: กลับมาออนไลน์', { icon: 'wifi-off' }); } });
TP.sim.msg = () => {
  const c = C(); if (!c) return;
  const m = { who: 'ph', text: 'อาการเป็นอย่างไรบ้างคะ ทานยาแล้วดีขึ้นไหม', time: now() };
  if (TP.cur()?.id === 'room') push(TP.cur().el, m); else { c.msgs.push(m); TP.banner({ title: 'มีข้อความใหม่จากเภสัชกร', body: 'แตะเพื่ออ่าน', go: 'room' }); }
};
/* Preview dialogue packs append to the current case instead of replacing its transcript. */
TP.casePreview.playChat = async key => {
  const c=C();if(!c||c._previewPlaying||c.status==='closed')return;
  if(key==='payment'&&c.order)return;
  if(key==='video-request'&&c.msgs.some(m=>m.kind==='video-request'&&['pending','accepted'].includes(m.status)))return;
  c._previewPlaying=true;c.status='room';c.idle=false;c.step=99;c.hold=true;c.quick=null;
  TP.S._casePreview=key;
  if(!c.msgs.some(m=>m.kind==='intake'))c.msgs.splice(c.msgs[0]?.kind==='waiting'?1:0,0,{who:'me',kind:'intake',time:now()});if(!c.msgs.some(m=>m.kind==='provider-ready'))c.msgs.push({kind:'provider-ready',time:now()});
  await TP.refresh({anim:false});TP.emit('state');
  if(C()!==c||!['queue','room'].includes(TP.cur()?.id)){c._previewPlaying=false;return;}
  const plan=TP.casePlan(c),symptoms=c.symptoms.join(' ')||'อาการที่แจ้งไว้';
  const packs={
    matched:[{who:'ph',text:'สวัสดีค่ะ ดิฉันเภสัชกร'+P().short.replace(/^ภ[ญก]\./,'')+' รับดูแลการปรึกษาครั้งนี้นะคะ ขอสอบถามอาการเพิ่มเติมค่ะ'}],
    chat:[{who:'ph',text:plan.q[0]},{who:'me',text:'มี'+symptoms+'ค่ะ อยากขอคำแนะนำเรื่องการดูแลตัวเองและการใช้ยาค่ะ'},{who:'ph',text:'รับทราบค่ะ ขอทบทวนข้อมูลอาการ ประวัติแพ้ยา และยาที่ใช้อยู่ก่อนนะคะ'}],
    payment:[{who:'me',text:'อาการยังรบกวนอยู่ค่ะ รบกวนแนะนำการรักษาและวิธีใช้ยาด้วยนะคะ'},{who:'ph',text:plan.dx},{who:'ph',text:'จากข้อมูลที่พูดคุยกัน ดิฉันจัดรายการยาพร้อมวิธีใช้ให้ตรวจสอบด้านล่างนะคะ หากมีข้อสงสัยสอบถามก่อนชำระเงินได้ค่ะ'}],
    'video-request':[{who:'ph',text:'ขอประเมินอาการเพิ่มเติมผ่านวิดีโอคอลนะคะ หากสะดวก กดเข้าร่วมจากการ์ดด้านล่างได้เลยค่ะ'}],
    reply:[{who:'ph',text:'สะดวกให้ข้อมูลเพิ่มเติมไหมคะ ดิฉันรอคำตอบเพื่อประเมินและแนะนำต่อค่ะ'}]
  };
  try{
    for(const m of packs[key]||[]){
      const el=TP.cur()?.el;if(C()!==c||!['queue','room'].includes(TP.cur()?.id))return;
      if(m.who==='ph')await typing(el,1000+Math.min(m.text.length*10,1400));
      else await new Promise(resolve=>setTimeout(resolve,700));
      if(C()!==c||TP.cur()?.el!==el||c.status!=='room')return;
      push(el,{...m,time:now()});
    }
    if(key==='payment')TP.sim.order();
    if(key==='video-request')await TP.receiveVideoRequest({id:'preview-video-'+Date.now()});
    if(key==='reply'){c.idle={until:Date.now()+120000};await TP.refresh({anim:false});}
  }finally{c._previewPlaying=false;TP.emit('state');}
};
TP.sim.order = () => {
  const c = C(); if (!c||!['matched','room'].includes(c.status)||c.order) return;
  TP.makeOrder();
  if(!TP.chatConsult(c)){if(TP.cur()?.id==='room')push(TP.cur().el,{kind:'order'});else c.msgs.push({kind:'order'});return;}
  c.quick=['ไม่มีคำถามเพิ่มเติม','มีคำถามเพิ่มเติม'];
  const question={who:'ph',text:'มีคำถามเกี่ยวกับรายการยาหรือวิธีใช้เพิ่มเติมไหมคะ',time:now()};
  if (TP.cur()?.id === 'room') {push(TP.cur().el,{kind:'order'});push(TP.cur().el,question);showQuick(TP.cur().el,c.quick);} else { c.msgs.push({kind:'order'},question); TP.mini(false); TP.banner({ title: 'เภสัชกรส่งรายการยาแล้ว', body: 'ตรวจสอบรายการและสอบถามเพิ่มเติมในแชท', go: 'room' }); }
};
TP.simAction({ id: 'msg', label: 'ส่งข้อความ', when: S => ['matched', 'room'].includes(S.case?.status), run: () => TP.sim.msg() });
TP.simAction({ id: 'order', label: 'ส่งรายการยา', when: S => ['matched', 'room'].includes(S.case?.status) && !S.case.order, run: () => TP.sim.order() });
TP.simAction({
  id: 'removeOrder', label: 'ลบยาทั้งหมดออกจากตะกร้า',
  when: S => ['matched', 'room'].includes(S.case?.status) && S.case.order?.status === 'pending' && !!S.case.order.items?.length,
  run() {
    const c = TP.S.case;
    c.order = null;
    c.msgs = c.msgs.filter(message => message.kind !== 'order');
    TP.emit('state');
    if (TP.cur()?.id === 'room') TP.refresh({ anim: false });
  }
});
TP.simAction({ id: 'idle', label: 'ลูกค้าเงียบ 3 นาที (ข้อ 63)', when: S => ['matched', 'room'].includes(S.case?.status) && !S.case.idle && !S.case.hold && !S.call, run: () => TP.sim.idleWarn() });
TP.simAction({ id: 'idleEnd', label: 'เงียบครบ 5 นาที ระบบปิดเคส', when: S => !!S.case?.idle && S.case.status !== 'closed', run: () => TP.sim.idleClose() });
TP.simAction({ id: 'close', label: 'ปิดเคส + ใบสรุป', when: S => ['matched', 'room'].includes(S.case?.status), run: () => { const c = C(), el = TP.cur()?.el; if (el && TP.cur()?.id === 'room' && TP.chatConsult(c) && c.order?.items?.length && TP.orderPayable(c.order)) return TP.playCheckoutHandoff(el, c); TP.sim.closeCase(); } });
TP.simAction({ id: 'paymentCard', label: 'การ์ดรอชำระเงิน', when: S => ['matched','room'].includes(S.case?.status)||(S.case?.status==='closed'&&S.case.order?.status==='pending'), run: async () => {TP.casePreview.seed('closed-unpaid');TP.S.st.home='case-closed-unpaid';if(TP.cur()?.id==='home')await TP.refresh({anim:false});else await TP.go('home',{root:true});TP.emit('state');} });
TP.simAction({ id: 'lost', label: 'สัญญาณหลุด', when: S => !!S.call, run: () => TP.go('lost', { via: 'fade' }) });
TP.simAction({ id: 'peerLost', label: 'เภสัชกรหลุดสาย', when: S => !!S.call && TP.cur()?.id === 'video', run: async () => { TP.S.st.lost = 'peer'; await TP.go('lost', { via: 'fade' }); TP.S.st.lost = undefined; } });
TP.simAction({ id: 'lostFail', label: 'ต่อสายใหม่ไม่สำเร็จ', when: () => TP.cur()?.id === 'lost', run: () => { TP.S.st.lost = 'fail'; TP.refresh(); } });
TP.simAction({ id: 'pcam', label: 'เภสัชกรปิดกล้อง', when: () => TP.cur()?.id === 'video', run: () => { TP.S.st.video = 'pcam'; TP.refresh({ anim: false }); } });
TP.simAction({ id: 'camDeny', label: 'ลูกค้าไม่อนุญาตกล้อง (ก่อนเริ่มวิดีโอ)', when: S => ['matched', 'room'].includes(S.case?.status) && !S.camDenied, run: () => { TP.S.camDenied = true; TP.notify('ตั้งค่าแล้ว: กดเริ่มวิดีโอจะไม่ได้รับอนุญาตกล้อง', { icon: 'video-off' }); } });

/* =====================================================================
   Video call (C10)
   ===================================================================== */
const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
TP.act('pcamWait', () => { TP.notify('แจ้งเภสัชกรแล้ว รอสักครู่', { icon: 'video' }); setTimeout(() => { if (TP.cur()?.id === 'video') { TP.S.st.video = 'on'; TP.refresh({ anim: false }); TP.S.st.video = undefined; } }, 2200); });
TP.screen('video', {
  previewDefaultState: 'waiting-provider',
  group: 'during', title: 'วิดีโอคอล', code: 'C306', ref: 'C10', cls: 'dark vd-scr', sb: 'light', parent: 'room',
  states: [['on', 'คุยอยู่'], ['connecting', 'กำลังเชื่อมต่อ'], ['camoff', 'ปิดกล้องตัวเอง'], ['weak', 'สัญญาณอ่อน'], ['pcam', 'กล้องเภสัชกรใช้ไม่ได้'], ['waiting-provider', 'รอเภสัชกรเข้าห้องวิดีโอ']],
  notes: ['ปุ่มไปจอ C306 เปิดหน้ารอเภสัชกรพร้อมคลื่นน้ำเสมอ เลือกคุยอยู่แยกได้จาก C306.1 โดยคงรหัสสถานะเดิม', 'หน้ารอสายแสดงรูปเภสัชกร วงแสงเคลื่อนไหว สาขา และสถานะกำลังโทร โดยไม่มีการ์ดยืนยันตัวตนกลางจอ', 'กดวิดีโอในหัวแชทเข้าห้องรอทันที ไม่ต้องรอคำขอจากเภสัชกร เริ่มจับเวลาเมื่อเภสัชกรเข้าร่วม ย่อไปแชทแล้วกลับมารอได้', 'ปุ่มไทย 3 ปุ่มตำแหน่งเดิม: ไมค์ · กล้อง · วางสาย · สลับกล้องอยู่ที่ภาพตัวเอง', 'แอปขอสิทธิ์กล้องเอง ไม่ต้องพาออกเบราว์เซอร์', 'ปุ่ม "แชท" = สายยังไม่วาง มีแถบกลับเข้าสาย (A15)', 'วางสายต้องถามยืนยันก่อน (A15) · ไม่มีการบันทึกวิดีโอ (A4)', 'ลากภาพตัวเองไปมุมไหนก็ได้', 'ไม่แสดงการ์ดข้อมูลเภสัชกรกลางวิดีโอ ดูข้อมูลผู้ให้บริการได้จากป๊อปอัปในหัวแชท C303.4'],
  prep(S) { TP.ensureCase('room'); S.call = S.st.video === 'waiting-provider' ? { t0: null, mic: true, cam: true, waitingProvider: true } : null; },
  render(ctx) {
    const c = TP.ensureCase(null), p = P(), st = TP.S.call?.waitingProvider ? 'waiting-provider' : ctx.state, call = TP.S.call || (TP.S.call = { t0: Date.now(), mic: true, cam: st !== 'camoff' });
    if (st === 'camoff') call.cam = false;
    const dialing = call.waitingProvider || st === 'connecting';
    const portrait = p.id === 'tp' ? TP.demoProfiles.pharmacist_m : '/assets/profiles/pharmacist-chat-v2.webp';
    return `<div class="vd-remote${dialing ? ' vd-dialing' : ''}" aria-label="${dialing ? 'กำลังโทรหา' : 'ภาพตัวอย่างจาก'}${esc(p.short)}"><canvas class="field" aria-hidden="true"></canvas><div class="vd-call-cover"><div class="vd-call-avatar">${dialing ? '<span class="vd-ripples" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' : ''}<img src="${esc(portrait)}" alt="${esc(p.short)}"><span class="vd-call-mark" aria-hidden="true">${ic('video',20,1.8)}</span></div><h2>${esc(p.short)}</h2><p>${esc(TP.branch(c.branch).name)}</p>${dialing ? `<div class="vd-dial-status" role="status"><span aria-hidden="true"></span>${call.waitingProvider ? 'กำลังโทรหาเภสัชกร' : 'กำลังเชื่อมต่อ'}</div><small>รอเภสัชกรรับสายสักครู่</small>` : '<small>ภาพตัวอย่างสำหรับต้นแบบ</small>'}</div></div>
      <div class="vd-top"><button type="button" class="vd-chat" data-a="toChat">${ic('message-circle', 18, 2)}<span>ย่อไปแชท</span></button>
        <div class="vd-meta"><b>${esc(p.short)}</b><span>${esc(p.lic)}</span></div>
        <span class="vd-t" id="vdT">${call.waitingProvider ? 'รอเภสัชกร' : st === 'connecting' ? 'กำลังเชื่อมต่อ' : '00:00'}</span></div>
      ${st === 'weak' ? `<div class="vd-weak" role="status">${ic('wifi-off', 16, 2)}<span>สัญญาณอ่อน ภาพอาจกระตุก</span><button type="button" class="vd-weak-c" data-a="callHelp" data-p='{"tel":"${TP.branch(C().branch).phone}"}'>โทรหาร้าน</button></div>` : ''}
      ${st === 'pcam' ? `<div class="vd-pcam" role="alert">${ic('video-off', 28, 1.6)}<b>กล้องของเภสัชกรใช้ไม่ได้ตอนนี้</b><p>คุณควรเห็นหน้าเภสัชกรเพื่อยืนยันว่าเป็นตัวจริง ระหว่างนี้ยังไม่ต้องตัดสินใจเรื่องยา</p><div class="gap8">${ui.btn('รอเภสัชกรเปิดกล้อง', { kind: 'white', sm: true, a: 'pcamWait' })}${ui.btn('คุยทางแชทแทน', { kind: 'glass', sm: true, a: 'toChat' })}${ui.btn('โทรหาร้าน', { kind: 'glass', sm: true, icon: 'phone', a: 'callHelp', p: { tel: TP.branch(c.branch).phone } })}</div></div>` : ''}
      <div class="vd-self${call.cam ? '' : ' off'}" id="vdSelf" tabindex="0" aria-label="ภาพของคุณ ลากเพื่อย้าย">${call.cam ? '<span>คุณ</span>' : ic('video-off', 24, 1.8)}<button type="button" class="vd-flip" data-a="flipCam" aria-label="สลับกล้องหน้าหลัง">${ic('switch-camera', 16, 2)}</button></div>
      <div class="vd-ctl">
        <button type="button" class="vd-b" data-a="vdMic" aria-pressed="${!call.mic}"><span>${ic(call.mic ? 'mic' : 'mic-off', 24, 1.9)}</span><small>${call.mic ? 'ปิดไมค์' : 'เปิดไมค์'}</small></button>
        <button type="button" class="vd-b" data-a="vdCam" aria-pressed="${!call.cam}"><span>${ic(call.cam ? 'video' : 'video-off', 24, 1.9)}</span><small>${call.cam ? 'ปิดกล้อง' : 'เปิดกล้อง'}</small></button>
        <button type="button" class="vd-b end" data-sheet="hangup"><span>${ic('phone-off', 26, 2)}</span><small>วางสาย</small></button>
      </div>
      <p class="vd-rec">${ic('lock', 13, 2)} ไม่มีการบันทึกวิดีโอ</p>`;
  },
  mount(el, ctx) {
    const st = ctx.state, f = brand.field($('canvas', el), { color: '#FFFFFF', base: .05, amp: .3, every: st === 'connecting' ? 1800 : 0, sigma: 40 });
    ctx.onLeave(f.stop);
    const t = $('#vdT', el);
    if (st === 'connecting') ctx.later(() => { TP.S.st.video = 'on'; TP.refresh(); TP.S.st.video = undefined; }, 2600);
    else { const tick = () => { if (TP.S.call && !TP.S.call.waitingProvider) t.textContent = fmt(Math.floor((Date.now() - TP.S.call.t0) / 1000)); }; tick(); ctx.every(tick, 1000); }
    /* drag self view, snap to the nearest corner on a spring */
    const s = $('#vdSelf', el); let sx = 0, sy = 0, ox = 0, oy = 0, drag = false;
    s.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; drag = true; sx = e.clientX; sy = e.clientY; const r = s.getBoundingClientRect(); ox = r.left; oy = r.top; s.setPointerCapture(e.pointerId); TP.kill(s); });
    s.addEventListener('pointermove', e => { if (!drag) return; const k = TP.phone.getBoundingClientRect().width / TP.phone.offsetWidth || 1; s.style.transform = `translate(${(e.clientX - sx) / k}px,${(e.clientY - sy) / k}px)`; });
    const up = () => {
      if (!drag) return; drag = false;
      const k = TP.phone.getBoundingClientRect().width / TP.phone.offsetWidth || 1, pr = TP.phone.getBoundingClientRect(), r = s.getBoundingClientRect();
      const cx = (r.left + r.width / 2 - pr.left) / k, cy = (r.top + r.height / 2 - pr.top) / k, W = TP.phone.offsetWidth, H = TP.phone.offsetHeight;
      s.classList.toggle('l', cx < W / 2); s.classList.toggle('b', cy > H / 2);
      const r2 = s.getBoundingClientRect(); const from = getComputedStyle(s).transform;
      s.style.transform = ''; const r3 = s.getBoundingClientRect();
      A(s, [{ transform: `translate(${(r2.left - r3.left) / k}px,${(r2.top - r3.top) / k}px)` }, { transform: 'none' }], { d: SP.spring.d, e: SP.spring.e });
    };
    s.addEventListener('pointerup', up); s.addEventListener('pointercancel', up);
  }
});
TP.act('toChat', () => {
  /* the failed call is over: no call bar in the chat */
  const el = TP.cur()?.el; if (el && el.querySelector('.ls-c') && !el.querySelector('#lsN')) TP.S.call = null;
  while (TP.hist.length && ['video', 'lost', 'room'].includes(TP.hist[TP.hist.length - 1].id)) TP.hist.pop();
  return TP.go('room', { via: 'fade', replace: true });
});
TP.act('vdMic', t => { TP.S.call.mic = !TP.S.call.mic; t.setAttribute('aria-pressed', String(!TP.S.call.mic)); t.querySelector('span').innerHTML = ic(TP.S.call.mic ? 'mic' : 'mic-off', 24, 1.9); t.querySelector('small').textContent = TP.S.call.mic ? 'ปิดไมค์' : 'เปิดไมค์'; TP.notify(TP.S.call.mic ? 'เปิดไมค์แล้ว' : 'ปิดไมค์แล้ว', { icon: TP.S.call.mic ? 'mic' : 'mic-off' }); });
TP.act('vdCam', () => { TP.S.call.cam = !TP.S.call.cam; TP.refresh({ anim: false }); });
TP.act('flipCam', () => TP.notify('สลับกล้องแล้ว', { icon: 'switch-camera' }));
TP.sheetDef('hangup', {
  group: 'during', title: 'วางสายไหม', code: 'C307', ref: 'A15', host: 'video',
  render: () => `<p class="body">แชทกับเภสัชกรยังคุยต่อได้หลังวางสาย เคสยังไม่ปิด</p>`,
  foot: () => ui.btn('วางสาย', { kind: 'danger', icon: 'phone-off', a: 'hangUp' }) + ui.btn('คุยต่อ', { kind: 'ghost', closeSheet: true })
});
TP.act('hangUp', async () => {
  const s = Math.floor((Date.now() - (TP.S.call?.t0 || Date.now())) / 1000);
  TP.S.call = null;
  C().msgs.filter(m=>m.kind==='video-request'&&m.status==='accepted').forEach(m=>m.status='ended');
  C().msgs.push({ kind: 'call', who: 'sys', text: `วิดีโอคอลจบแล้ว · ${fmt(s)}` });
  if (!C().order) C().msgs.push({ who: 'sys', text: 'เภสัชกรกำลังสรุปคำแนะนำ รายการยาจะส่งมาในแชทนี้' });
  await TP.closeSheet();
  TP.go('room', { via: 'fade', replace: true });
});

/* ---------- no camera permission ---------- */

/* ---------- connection lost / reconnect ---------- */
TP.screen('lost', {
  group: 'edge', title: 'สัญญาณหลุด', code: 'C608', ref: 'C10', cls: 'dark', sb: 'light', parent: 'room',
  states: [['me', 'เน็ตของคุณหลุด'], ['peer', 'เภสัชกรหลุด'], ['fail', 'ต่อไม่สำเร็จ']],
  notes: ['ต่อใหม่อัตโนมัติ เคสและแชทไม่หาย', 'ต่อไม่ได้ = กลับไปแชท ไม่ต้องเข้าคิวใหม่'],
  prep(S) { TP.ensureCase('room'); S.call = S.call || { t0: Date.now() - 90000, mic: true, cam: true }; },
  render(ctx) {
    const st = ctx.state, fail = st === 'fail';
    return `<canvas class="field" aria-hidden="true"></canvas><div class="ls-c">${brand.halo(150, { cls: 'w' + (fail ? ' still' : ''), icon: fail ? 'phone-off' : 'wifi-off' })}
      <h2 class="h2">${fail ? 'ต่อสายไม่สำเร็จ' : st === 'peer' ? 'เภสัชกรหลุดจากสาย' : 'สัญญาณหลุด กำลังต่อใหม่'}</h2>
      <p class="body" style="color:var(--on-brand-2)">${fail ? 'แชทและเคสของคุณยังอยู่ คุยต่อทางแชทได้ทันที' : st === 'peer' ? 'รอสักครู่ ระบบกำลังเชื่อมต่อเภสัชกรกลับเข้ามา' : 'ไม่ต้องทำอะไร เคสและแชทของคุณไม่หาย'}</p>
      ${fail ? '' : '<p class="ls-n num" id="lsN">0:15</p>'}</div>
      <div class="dock clear" style="background:none">${fail ? ui.btn('กลับไปแชท', { kind: 'white', a: 'toChat' }) + ui.btn('ลองวิดีโออีกครั้ง', { kind: 'glass', a: 'startVideo' }) + ui.btn('โทรหาร้าน', { kind: 'glass', icon: 'phone', a: 'callHelp', p: { tel: TP.branch(C()?.branch).phone } }) : ui.btn('กลับไปแชทระหว่างรอ', { kind: 'glass', a: 'toChat' }) + ui.btn('โทรหาร้าน', { kind: 'glass', icon: 'phone', a: 'callHelp', p: { tel: TP.branch(C()?.branch).phone } })}</div>`;
  },
  mount(el, ctx) {
    const f = brand.field($('canvas', el), { color: '#4FB3BF', base: .06, amp: .4, every: ctx.state === 'fail' ? 0 : 1500, origin: [.5, .38] });
    ctx.onLeave(f.stop);
    const n = $('#lsN', el); if (!n) return;
    let s = 15; ctx.every(() => { s--; n.textContent = '0:' + String(Math.max(0, s)).padStart(2, '0'); if (s === 10 && !TP.S.st.lost) TP.go('video', { via: 'fade', replace: true }); if (s <= 0) { TP.S.st.lost = 'fail'; TP.refresh(); TP.S.st.lost = undefined; } }, 1000);
  }
});
})();

/* ===== 66-pay.js ===== */
/* =====================================================================
   66 · Pay sheet (C308) + pay failed.
   19/10/2026 owner: "หน้า c308 เอาไปหน้า design website ปัจจุบันตอน payment มาเลย ผมทำไว้ดีแล้ว"
   so order, layout and words copy the pharmacist bill pay link frontend/pay/show.blade.php (PL)
   (design-ci.css + paylink-p3.css, words lang/th/paylink.php) and checking.blade.php for the QR.
   Express home pin = the pay link Google Maps block (PL "ยืนยันตำแหน่งบ้าน").
   App only: bank app as a 3rd method, store closed, out of express range, the phone's location permission.
   Paid + receipt screens live in 68-receipt.js
   ===================================================================== */
(() => {
const { $, $$, esc, ic, ui, A, E, SP, fin } = TP;
const C = () => TP.S._paymentCase||TP.S.case;
const r2 = x => Math.round(x * 100) / 100;
/* province > district > [subdistrict, zip]: a small sample of the website's province/amphure/district tables */
const GEO = {
  'กรุงเทพมหานคร': { 'ทวีวัฒนา': [['ทวีวัฒนา', '10170'], ['ศาลาธรรมสพน์', '10170']], 'สวนหลวง': [['อ่อนนุช', '10250'], ['สวนหลวง', '10250'], ['พัฒนาการ', '10250']], 'คลองเตย': [['คลองเตย', '10110'], ['คลองตัน', '10110'], ['พระโขนง', '10110']], 'พระโขนง': [['บางจาก', '10260'], ['พระโขนงใต้', '10260']], 'ประเวศ': [['ประเวศ', '10250'], ['หนองบอน', '10250'], ['ดอกไม้', '10250']], 'หนองจอก': [['กระทุ่มราย', '10530'], ['หนองจอก', '10530']] },
  'นนทบุรี': { 'บางกรวย': [['บางสีทอง', '11130'], ['วัดชลอ', '11130']], 'บางใหญ่': [['เสาธงหิน', '11140']] },
  'สมุทรปราการ': { 'เมืองสมุทรปราการ': [['สำโรงเหนือ', '10270'], ['เทพารักษ์', '10270']], 'บางพลี': [['บางพลีใหญ่', '10540'], ['บางแก้ว', '10540']] },
  'เชียงใหม่': { 'เมืองเชียงใหม่': [['ศรีภูมิ', '50200'], ['ช้างเผือก', '50300']] }
};
/* every subdistrict once, for the type-ahead (PL "ตำบล/แขวง"): [subdistrict, district, province, zip] */
const TAMBON = Object.entries(GEO).flatMap(([pv, am]) => Object.entries(am).flatMap(([a, ds]) => ds.map(([d, z]) => [d, a, pv, z])));
/* A1: the drug zone (TP.zoneOf) comes first and covers every way the medicine leaves the store, parcel included.
   Owner 21/10 "15 กม. ทุกที่อยู่": the zone is 15 km from the branch for every address, so with the lock ON express, parcel and cold
   share one radius. Lock OFF: parcel may leave it, express keeps Lalamove's 15 km (TP.expOk) and offers parcel instead. Real build: the Lalamove quote */
const zone = a => TP.zoneOf(a, C().branch);
const outZone = a => !!a && !zone(a).ok;
/* the zone stops this way of delivery here: lock ON = every delivery · lock OFF = none (owner 21/10: parcel and cold may leave, express is held by isFar) */
const zoneStop = (a, r = P().recv) => !!a && r !== 'pickup' && outZone(a) && TP.zoneLock();
const isFar = a => !!a && !TP.expOk(a, C().branch) && !(TP.zoneLock() && outZone(a));
/* Bangkok but 62 km by road from ตลาดเวิลด์: out of the zone since 21/10 (C308.17) */
/* 17 km by road from ตลาดเวิลด์ (mask table): out of the zone */
const ZONE_ADDR = { id: 'a3', first: 'สมใจ', last: 'ใจดี', phone: '0812345678', house: '45/2 หมู่ 3', alley: 'ซอยวัดชลอ', road: '', prov: 'นนทบุรี', amp: 'บางกรวย', dist: 'วัดชลอ', zip: '11130', main: false, pin: false };
TP.ZONE_ADDR = ZONE_ADDR;
/* express samples with their own pin state (the customer's home in ทวีวัฒนา is in range too since 21/10) */
const EXP_ADDR = { id: 'a4', first: 'สมใจ', last: 'ใจดี', phone: '0812345678', house: '59/3', alley: 'ซอยทวีวัฒนา 12', road: 'ถ.เลียบคลองทวีวัฒนา', prov: 'กรุงเทพมหานคร', amp: 'ทวีวัฒนา', dist: 'ทวีวัฒนา', zip: '10170', main: false, pin: false };
TP.EXP_ADDR = EXP_ADDR;
/* item 71: the pharmacist closes a way per list with a reason the customer sees · A7: a cold-chain list offers pickup + cold only */
const hasCold = o => (o?.items || []).some(i => i.cold);
const recvKeys = () => {const o=C().order,off=o?.recvOff||{};return ['pickup','express','parcel'].filter(k=>!off[k]&&(k==='pickup'||!hasCold(o))&&(k!=='express'||TP.S.storeOpen!==false));};
const addrs = () => TP.S.addrs || (TP.S.addrs = []);
/* same order as CustomerAddress::getFormattedAddressAttribute (ต./อ./จ. even in Bangkok, like the website) */
const fmtAddr = a => [a.house,a.building, a.alley, a.road && (/^(ถนน|ถ\.)/.test(a.road)?a.road:'ถ.'+a.road), 'ต.' + a.dist, 'อ.' + a.amp, 'จ.' + a.prov, a.zip].filter(Boolean).join(' ');
TP.fmtAddr = fmtAddr;
const fmtPhone = s => { const d = String(s || '').replace(/\D/g, ''); return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : d.length === 9 ? `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}` : String(s || ''); };
/* defaults: จัดส่ง Lalamove (defaultRecv, user 24 Nov 2026; was pickup per owner 19/10) · home-page address checked · PromptPay checked (PL:550) */
/* default receive way (user 24 Nov 2026): จัดส่ง by Lalamove to the address chosen on the home page before the consult.
   Out of express range: parcel. Delivery closed (cold chain, pharmacist, zone): pickup. */
const defaultRecv = () => {
  const keys = recvKeys(), a = addr();
  if (keys.includes('express') && !(a && (isFar(a) || zoneStop(a, 'express')))) return 'express';
  if (keys.includes('parcel') && !(a && zoneStop(a, 'parcel'))) return 'parcel';
  return 'pickup';
};
const P = () => {const p=TP.S.pay || (TP.S.pay = { recv: defaultRecv(), addr: (TP.homeAddress?.() || addrs().find(a => a.main) || addrs()[0])?.id || null, method: 'promptpay', bank: 'KBANK', form: null, q: null, geo: '', geoMsg: '', moved: false, pinXY: null, acc: 0 });if(!recvKeys().includes(p.recv))p.recv=defaultRecv();p.form=null;if(!['promptpay','card','bank'].includes(p.method))p.method='promptpay';return p;};
const addr = () => {const c=C();if(!Object.hasOwn(c,'deliveryAddress')){const a=TP.homeAddress?.()||addrs().find(x=>x.main)||addrs()[0];c.deliveryAddress=a?structuredClone(a):null;}return c.deliveryAddress;};
/* parcel quotes per carrier, so switching Flash/DHL recalculates the fee */
const qKey = () => P().recv + ':' + (addr()?.id || '') + (P().recv === 'parcel' ? ':' + courierId() : '');
const quoted = () => P().q?.st === 'done' && P().q.key === qKey();
const EXP_FEE = () => TP.DELIVERY.find(d => d.id === 'express').fee;
function shipFee() {
  const p = P();
  if (p.recv === 'pickup') return 0;
  if (p.recv === 'cold') return addr() && !zoneStop(addr(), 'cold') ? TP.COLD.fee : null;
  if (!quoted()) return null;
  if (p.recv === 'express') return EXP_FEE();
  return TP.COURIERS.find(c => c.id === courierId())?.fee ?? TP.DELIVERY.find(d => d.id === 'parcel').fee;
}
/* Preview-only promotion fixtures. Replace validate with a server adapter for production. */
TP.checkoutCouponAdapter={validate(code,order){
  if(code==='EXPIRED50')return {error:'โค้ดนี้หมดอายุแล้ว'};
  if(code!=='TEST50')return {error:'ไม่พบโค้ดส่วนลดนี้ กรุณาตรวจสอบอีกครั้ง'};
  if(order.total<100)return {error:'โค้ดนี้ใช้กับยอดค่ายาตั้งแต่ 100 บาท'};
  return {code,amount:50,itemsTotal:order.total};
}};
function couponState(){const p=P(),order=C().order;if(p.couponOrder!==order){p.couponOrder=order;p.couponDraft='';p.couponError='';}return p;}
function couponDiscount(){const o=C().order,d=o.discount;return d&&d.itemsTotal===o.total?Math.min(Math.max(0,Number(d.amount)||0),Math.max(0,o.total-TP.PAY_MIN)):0;}
function couponHtml(){
 const p=couponState(),d=C().order.discount,applied=couponDiscount()>0;
 return `<div class="pay-coupon field"><label for="payCoupon">${ic('ticket',18,1.8)}โค้ดส่วนลด <span class="small">(ถ้ามี)</span></label><div class="pay-coupon-row"><input class="input" id="payCoupon" value="${esc(applied?d.code:p.couponDraft)}" placeholder="กรอกโค้ดส่วนลด" maxlength="32" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-describedby="payCouponFeedback" aria-invalid="${!!p.couponError}"${applied?' readonly':''}><button type="button" class="btn ${applied?'secondary':'primary'}" data-a="${applied?'payCouponRemove':'payCouponApply'}">${applied?'นำออก':'ใช้โค้ด'}</button></div><p id="payCouponFeedback" class="${p.couponError?'err-t':'hint'}" role="status">${esc(p.couponError||(applied?'ใช้โค้ด '+d.code+' แล้ว ลด '+TP.money(couponDiscount()):''))}</p></div>`;
}
function updateCoupon(){const box=$('#payCouponBox');if(box){box.innerHTML=couponHtml();TP.icons(box);}sync();}
TP.act('payCouponApply',()=>{
 if(!TP.orderPayable(C()?.order))return TP.orderExpiryTick();
 const p=couponState(),code=String($('#payCoupon')?.value??p.couponDraft??'').trim().toUpperCase();p.couponDraft=code;
 if(!code)p.couponError='กรุณากรอกโค้ดส่วนลด';
 else if(!/^[A-Z0-9_-]{3,32}$/.test(code))p.couponError='ใช้ตัวอักษรภาษาอังกฤษ ตัวเลข ขีดกลาง หรือขีดล่าง 3–32 ตัว';
 else {const result=TP.checkoutCouponAdapter.validate(code,C().order);p.couponError=result.error||'';if(!result.error)C().order.discount=result;}
 updateCoupon();if (p.couponError) $('#payCoupon')?.focus({preventScroll:true});
 else if (TP.sheetOpen?.()?.id === 'checkoutcoupon') { TP.sheetOpen().ctx.params.fromPay = true; return TP.closeSheet(); }
});
TP.act('payCouponRemove',()=>{if(!TP.orderPayable(C()?.order))return TP.orderExpiryTick();delete C().order.discount;const p=couponState();p.couponDraft='';p.couponError='';updateCoupon();$('#payCoupon')?.focus({preventScroll:true});});
function totals() {
  if (C().order.payment) return C().order.payment.totals;
  const items = C().order.total, discount=couponDiscount(), ship = shipFee(), sub = items-discount + (ship || 0), fee = P().method === 'card' ? r2(sub * TP.CARD_FEE) : 0;
  return { items, discount, coupon:discount?C().order.discount.code:null, ship, fee, total: r2(sub + fee) };
}
function lockOrderPayment(c) {
  const o = c.order;
  if (o.payment) return;
  const p = P(), recipient = p.taxWant ? TP.taxRecipient(p.taxWho,p.taxKey) : null;
  o.payment = {
    branch:c.branch || TP.S.branch,
    recv:p.recv, courier:p.recv==='parcel' ? courierId() : p.recv==='cold' ? TP.COLD.id : null,
    addr:p.recv==='pickup' ? null : structuredClone(addr()),
    method:p.method, bank:p.bank, totals:totals(),
    tax:recipient ? {who:p.taxWho,pending:structuredClone(recipient)} : null,
    failed:false,
  };
  // Existing timed samples keep their original deadline.
  TP.startOrderPayment(o);
  c.status = 'closed';
  c.checkoutHandoffUntil = null;
  const record = TP.S.history?.find(h=>h.id===c.id);
  if (record) { record._case=c; record.orderStatus='pending'; }
  else if (TP.orderHistoryRecord) TP.S.history?.unshift(TP.orderHistoryRecord(c));
  TP.emit('state');
}
const submittedCase = id => TP.orderCases(TP.S).find(c=>c.id===id&&c.order?.payment);
/* what still stops payment, in the order the customer meets it; the pay button says it instead of going grey and silent */
function missing() {
  const p = P(), a = addr();
  if (totals().total < TP.PAY_MIN) return 'ยอดขั้นต่ำ ' + TP.money(TP.PAY_MIN);
  if (p.recv === 'pickup') return '';
  /* an open add/edit form is never dropped without a word (QA CD #9) */
  if (p.form) return 'บันทึกที่อยู่ก่อน';
  if (!addrs().length) return 'เพิ่มที่อยู่จัดส่งก่อน';
  if (!a) return 'เลือกที่อยู่จัดส่งก่อน';
  if (zoneStop(a)) return 'ที่อยู่นี้อยู่นอกเขตส่งยา';
  if (p.recv === 'express' && isFar(a)) return 'อยู่นอกระยะจัดส่งด่วน';
  if (!quoted()) return 'กำลังคำนวณค่าจัดส่ง...';
  return '';
}
/* the latest delivery quote wins */
function requote() {
  const p = P(), a = addr();
  if (p.recv === 'pickup' || !a || zoneStop(a) || (p.recv === 'express' && isFar(a))) return;
  const key = qKey(); if (p.q?.key === key) return;
  p.q = { key, st: 'loading' };
  setTimeout(() => { if (P().q?.key === key) { P().q.st = 'done'; sync(); } }, 900);
}
/* UI mockup (user 8 Nov 2026): C308 always shows a payable sample order. When the real case has no payable order
   (paid, expired by the 15-minute clock, cancelled, or closed without medicine) checkout switches to a separate
   preview case in S._paymentCase. The real case and history are never changed. Production uses the order service. */
function mockCheckoutCase() {
  const base = TP.S.case || {}, items = TP.ORDER_ITEMS.map(i => ({ ...i })), id = 'preview-checkout-' + Date.now().toString(36);
  const c = { id, mockCheckout: true, who: 'me', mode: 'chat', status: 'closed', branch: base.branch || TP.S.branch || 'tw', pharm: base.pharm || 'kj',
    date: TP.NOW.date, joinedAt: TP.NOW.time, symptoms: [], msgs: [], deliveryAddress: TP.homeAddress?.() ? structuredClone(TP.homeAddress()) : null };
  c.order = { status: 'pending', items, total: items.reduce((n, i) => n + i.price, 0), issuedAt: Date.now(), awaitingCheckout: true, expiresAt: null };
  c.order.no = TP.orderNumber(c);
  return c;
}
const ensureOrder = () => {
  if (!C()) TP.ensureCase('room');
  if (!C().order && C().status !== 'closed') TP.makeOrder();
  TP.expireOrder(C());
  if (!TP.orderPayable(C().order)) TP.S._paymentCase = mockCheckoutCase();
  return true;
};

/* ---------- blocks (PL order: 1 รายการยา · 2 การรับสินค้า + ที่อยู่ + ปักหมุด + สรุปยอด · 3 วิธีชำระเงิน) ---------- */
const sec = (n, t) => `<h3 class="pay-sec">${esc(t)}</h3>`;
const medHtml = i => `<div class="pay-med"><div class="pm-h">${TP.medicineImage(i)}<p class="pm-t"><b>${esc(i.name)}</b> <small>×${esc(i.qty)}</small>${i.cold ? `<span class="pm-cold">${ic('snowflake', 13, 2)}ยาเก็บเย็น</span>` : ''}</p><b class="num pm-p">${TP.money(i.price)}</b></div>${i.how ? `<p class="pm-n"><b>โน้ตจากเภสัช</b> ${esc(i.how)}</p>` : ''}</div>`;
/* one line under the choices says why some are missing (A7 cold chain, item 71 closed by the pharmacist) */
function whyHtml() {
 const o=C().order;
 if(hasCold(o))return `<p class="pay-why">${ic('snowflake',16,2)}<span>รายการนี้มียาเก็บเย็น กรุณารับที่ร้านเพื่อให้เภสัชกรแนะนำการเก็บรักษา</span></p>`;
 return o?.recvOff?.express&&o?.recvOff?.parcel?`<p class="pay-why">${ic('info',16,2)}<span>รายการนี้รับที่ร้านเท่านั้น${o.recvWhy?' · '+esc(o.recvWhy):''}</span></p>`:'';
}
const courierId = () => { const p = P(); if (!TP.COURIERS.some(c => c.id === p.courier)) p.courier = TP.COURIERS[0].id; return p.courier; };
function pickupBranchCard(b, interactive = false) {
  const tag = interactive ? 'button' : 'div';
  return `<${tag} class="checkout-pickup-preview"${interactive ? ' type="button" data-a="openCheckoutChild" data-v="checkoutdelivery"' : ''}>
    ${b.photo ? `<img src="${esc(b.photo)}" alt="" width="56" height="56">` : ic('store',24)}
    <span><b>${esc(b.name)}</b><small>${esc(b.previewAddr || b.addr || 'ยังไม่มีข้อมูลที่อยู่สาขา')}</small>
    ${b.phone ? `<small>โทร ${esc(fmtPhone(b.phone))}</small>` : ''}
    ${b.hours ? `<small>เวลาทำการ ${esc(b.hours)}</small>` : ''}</span>
    ${interactive ? ic('chevron-right',16) : ''}
  </${tag}>`;
}
/* PL saved-address rows inside one card; the pin tag only matters for express so it shows only there */
function cardsHtml() {
  const address = addr();
  const picker = 'type="button" data-a="openCheckoutChild" data-v="checkoutaddress"';
  if (!address) return `<button ${picker} class="link checkout-address-empty">เลือกที่อยู่จากสมุดที่อยู่</button>`;
  return `<button ${picker} class="pay-address-readonly"><b>${esc([address.first,address.last].filter(Boolean).join(' '))}</b><small>${esc(fmtAddr(address))}</small><small>${esc(fmtPhone(address.phone))}</small></button>`;
}

const fld = (id, label, val, o = {}) => `<div class="field"><label for="${id}">${esc(label)}${o.req ? '<span class="req" aria-hidden="true">*</span>' : ''}</label><input id="${id}" class="input" type="${o.type || 'text'}" value="${esc(val || '')}"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.im ? ` inputmode="${o.im}"` : ''}${o.ac ? ` autocomplete="${o.ac}"` : ''}${o.max ? ` maxlength="${o.max}"` : ''}${o.ro ? ' readonly tabindex="-1"' : ''}${o.req ? ' aria-required="true"' : ''}></div>`;
const ta = (id, label, val, o = {}) => `<div class="field"><label for="${id}">${esc(label)}${o.req ? '<span class="req" aria-hidden="true">*</span>' : ''}</label><textarea id="${id}" class="input pay-ta" rows="${o.rows || 3}"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.ac ? ` autocomplete="${o.ac}"` : ''}${o.req ? ' aria-required="true"' : ''}>${esc(val || '')}</textarea>${o.hint ? `<p class="hint">${esc(o.hint)}</p>` : ''}</div>`;
const lineOf = a => [a.house,a.building,a.alley,a.road].filter(Boolean).join(' ');
/* PL address form: paste box, one name, one address line, subdistrict type-ahead fills district / province / zip */
function formHtml() {
  const f = P().form, a = f.id ? addrs().find(x => x.id === f.id) : null, u = TP.S.user;
  const v = a ? { name: a.first + ' ' + a.last, phone: a.phone, house:a.house,building:a.building,alley:a.alley,road:a.road, dist: a.dist, amp: a.amp, prov: a.prov, zip: a.zip }
    : { name: u.full || '', phone: (u.phone || '').replace(/\D/g, ''), house:'',building:'',alley:'',road:'', dist: '', amp: '', prov: '', zip: '' };
  return `<div class="pay-form" role="group" aria-labelledby="naT"><h4 id="naT">${a ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}</h4>
    ${a ? '' : `${ta('na_paste', 'วางที่อยู่ที่คัดลอกไว้ (แนะนำ)', '', { rows: 3, ph: 'วางข้อความที่อยู่ที่คัดลอกจากแชทหรือโน้ต...', hint: 'วางแล้วระบบกรอกช่องด้านล่างให้ แก้ได้ทุกช่อง' })}<p class="pay-pok" id="naPok" role="status" hidden></p><p class="pay-sub">ตรวจ/แก้ที่อยู่</p>`}
    ${fld('na_name', 'ชื่อผู้รับ', v.name, { req: 1, ac: 'name' })}
    ${fld('na_phone', 'เบอร์โทรผู้รับ', v.phone, { req: 1, type: 'tel', im: 'numeric', max: 12, ac: 'tel' })}
    ${fld('na_house','บ้านเลขที่',v.house,{req:1,max:200,ac:'address-line1'})}${fld('na_building','หมู่บ้าน / อาคาร / ห้อง / ชั้น (ไม่บังคับ)',v.building,{max:200,ac:'address-line2'})}${fld('na_alley','ซอย (ไม่บังคับ)',v.alley,{max:100})}${fld('na_road','ถนน (ไม่บังคับ)',v.road,{max:100})}
    <div class="field pay-tb"><label for="na_dist">ตำบล/แขวง<span class="req" aria-hidden="true">*</span></label><input id="na_dist" class="input" value="${esc(v.dist)}" placeholder="พิมพ์ตำบล/แขวง" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="naSug" aria-required="true"><div class="pay-sug" id="naSug" role="listbox" aria-label="ตำบลที่ตรงกัน" hidden></div></div>
    <div class="pay-2">${fld('na_amp', 'อำเภอ/เขต', v.amp, { ro: true })}${fld('na_prov', 'จังหวัด', v.prov, { ro: true })}</div>
    <p class="pay-fh">อำเภอ จังหวัด และรหัสไปรษณีย์ เติมให้เองตามตำบลที่เลือก ถ้าต้องการเปลี่ยน ให้แก้ที่ช่องตำบล</p>
    ${fld('na_zip', 'รหัสไปรษณีย์', v.zip, { ro: true })}
    <p class="pay-err" id="naErr" role="alert" hidden></p>
    ${ui.btn(a ? 'บันทึกการแก้ไข' : 'บันทึกที่อยู่ใหม่', { a: 'payAddrSave', id: 'naSave' })}${ui.btn(a ? 'ยกเลิกการแก้ไข' : 'ยกเลิก', { kind: 'ghost', a: 'payAddrCancel' })}</div>`;
}
/* PL "ยืนยันตำแหน่งบ้าน": current location or a pin dragged on the map (Google Maps in the real app, zoom 17) */
const mapCard = (a, p, lock) => `<div class="pay-mapc">${p.geo === 'here' ? `<p class="pay-acc">${ic('navigation', 14, 2)}<span>ตำแหน่งปัจจุบันของคุณ (แม่นยำ ±${p.accNow} ม.)</span></p>` : `<p class="pay-acc">${ic('map-pin', 14, 2)}<span>เริ่มจาก ต.${esc(a.dist)} อ.${esc(a.amp)}</span></p>`}
  <div class="pay-map" id="payMap"><span class="pm-park" aria-hidden="true"></span><span class="pm-road r1" aria-hidden="true"></span><span class="pm-road r2" aria-hidden="true"></span><span class="pm-road r3" aria-hidden="true"></span>
    <span class="pay-pin" id="payPin" tabindex="0" role="button" aria-label="หมุดบ้าน ลากไปที่บ้านของคุณ หรือกดลูกศรเพื่อเลื่อน"${p.pinXY ? ` style="left:${p.pinXY[0]}%;top:${p.pinXY[1]}%"` : ''}>${ic('map-pin', 40, 2.2)}</span><span class="pm-g" aria-hidden="true">Google</span></div>
  <p class="pay-hint">${ic('info', 14, 2)}<span>แตะแผนที่ตรงบ้านของคุณ หรือลากหมุด แล้วกดยืนยัน</span></p>
  ${ui.btn('ยืนยันตำแหน่งนี้', { sm: true, a: 'payGeoOk', id: 'payGeoOk', disabled: lock })}${lock ? '<p class="pay-lock">แตะแผนที่ตรงบ้าน หรือลากหมุดก่อน ปุ่มยืนยันจะกดได้</p>' : ''}</div>`;
/* A1 out of the drug zone: one reason line, pickup is the way out (the customer can still pick another saved address) */
/* zone lock OFF: an out-of-zone address can still get a parcel, and the customer is told what is left */
const unlHtml = a => { const z = zone(a), b = TP.branch(C().branch);
  return `<div class="pay-unl" id="payUnl">${ui.note(`<b>ที่อยู่นี้ส่งได้ทางพัสดุเท่านั้น</b><br>${esc(`${z.km != null ? `ห่าง${b.name} ${z.km} กม. · ` : ''}จัดส่งปกติได้ภายใน 1-3 วันทำการ · ส่งด่วนส่งได้ไม่เกิน 15 กม. จากสาขา`)}`, { icon: 'package' })}</div>`; };
const zoneHtml = a => { const z = zone(a), b = TP.branch(C().branch);
  return `<div class="pay-far pay-zone" id="payZone" role="status">${ic('map-pin', 20, 2)}<div><b>ที่อยู่นี้อยู่นอกเขตส่งยา</b><p>${esc(`${z.km != null ? `ห่าง${b.name} ${z.km} กม. · ` : ''}ร้าน${TP.ZONE_RULE} · เลือกที่อยู่อื่น หรือรับยาที่ร้าน`)}</p>${ui.btn('เปลี่ยนเป็นรับที่ร้าน', { sm: true, icon: 'store', a: 'payToPickup' })}</div></div>`; };
function geoHtml() {return '';}

TP.checkoutMap={read:()=>addr(),save(location){const a=addr();a.location=location;a.pin=true;requote();payLbl();},invalidate(){const a=addr();if(a){a.pin=false;a.location=null;}P().q=null;payLbl();}};
const shipLabel = () => P().recv === 'express' ? 'ค่าจัดส่ง (Lalamove)' : P().recv === 'cold' ? 'ค่าส่งแบบเย็น (กล่องเก็บความเย็น)' : 'ค่าจัดส่ง';
/* PL summary card between section 2 and 3; the shipping row is hidden for pickup like the website */
function sumHtml(t) {
  const p = P(), a = addr(), oz = zoneStop(a), far = p.recv === 'express' && isFar(a);
  const shipping = t.ship === null ? `<span class="pay-pend">${oz ? 'นอกเขตส่งยา' : far ? 'ส่งด่วนไม่ได้' : 'คำนวณตามที่อยู่'}</span>` : TP.money(t.ship);
  const rows = [
    ['ยอดค่ายา', TP.money(t.items)],
    [shipLabel(), shipping],
    t.fee ? ['ค่าธรรมเนียมบัตร (3.65%)', TP.money(t.fee)] : ['ค่าบริการชำระเงิน', 'ฟรี'],
  ];
  if (t.discount) rows.push(['ส่วนลด', '−' + TP.money(t.discount)]);
  rows.push([t.ship === null ? 'ยอดรวม (ยังไม่รวมค่าส่ง)' : 'ยอดรวมสุทธิ', '<span id="payTot"></span>', 'tot']);
  return ui.kv(rows, { cls: 'pay-kv' });
}
/* real-user R4 P1: pickup is chosen by default (owner #48), so the pay bar always says how the medicine arrives */
const VIA_IC = { pickup: 'store', express: 'zap', parcel: 'package', cold: 'snowflake' };
const viaText = () => { const p = P(), b = TP.branch(C().branch); return p.recv === 'pickup' ? `รับยาเองที่ร้าน ${b.name}` : p.recv === 'express' ? 'ส่งด่วนถึงบ้าน (Lalamove)' : p.recv === 'cold' ? `ส่งแบบควบคุมความเย็น (${TP.COLD.short})` : TP.DELIVERY.find(d => d.id === 'parcel').name; };

/* Saved recipients share one collection across account, checkout and receipts. */
TP.taxRecords = (kind, S=TP.S) => {
  const d=S._taxProfile;
  if(d?.previewLists?.[kind]) return d.previewLists[kind];
  if(d?.preview?.[kind]) {const r=d.preview[kind];r.profileKey ||= 'preview-'+kind;d.previewLists ||= {};d.previewLists[kind]=[r];delete d.preview[kind];return d.previewLists[kind];}
  S.taxProfiles ||= {};
  if(!Array.isArray(S.taxProfiles[kind])) {const legacy=kind==='co'?S.taxCo:S.taxWho;S.taxProfiles[kind]=legacy?[{...legacy,profileKey:legacy.profileKey||'saved-'+kind}]:[];}
  return S.taxProfiles[kind];
};
TP.taxAddress = r => r.addr || [r.detail,r.village,r.alley,r.road,r.dist,r.amp,r.prov,r.zip].filter(Boolean).join(' ');
TP.taxSelected = (kind, S=TP.S) => {const rows=TP.taxRecords(kind,S),current=kind==='co'?S.taxCo:S.taxWho;return rows.find(r=>r.profileKey===current?.profileKey)||rows[0]||null;};
TP.taxChoose = (kind,key,S=TP.S) => {const r=TP.taxRecords(kind,S).find(r=>r.profileKey===key);if(r)S[kind==='co'?'taxCo':'taxWho']=r;return r;};
const invoiceKinds = [['me','บุคคลธรรมดา'],['co','นิติบุคคล']];
TP.taxRecipient = (kind, key, S=TP.S) => {
  if (!kind) return null;
  const records = TP.taxRecords(kind,S);
  return records.find(record=>record.profileKey===key) || records[0] || null;
};
TP.firstInvoiceKind = () => invoiceKinds.find(([kind])=>TP.taxRecords(kind).length)?.[0] || null;
TP.invoiceRecipientDetails = (record,kind) => `<div class="invoice-recipient-details">
  <b>${esc(record.name || [record.first,record.last].filter(Boolean).join(' '))}</b>
  ${record.business ? `<p>${esc(record.business)}</p>` : ''}
  <p>${esc(TP.taxAddress(record))}</p><p>${esc(record.phone || '—')}</p>
  <p>${kind==='co'?'เลขประจำตัวผู้เสียภาษี':'เลขประจำตัวประชาชน'} ${esc('xxxxxxxxx'+String(record.id||'').slice(-4))}</p>
</div>`;
/* C308 (user 24 Nov 2026): kind tabs like the receive tabs; the recipient card opens the picker; same fixed card height for both kinds */
function payInvoiceOptions(kind,key) {
  const record = TP.taxRecipient(kind,key);
  const tabs = ui.seg('payTaxKind', invoiceKinds, kind, { a: 'payTaxKind', label: 'ประเภทผู้รับใบกำกับภาษี' });
  if (!kind) return tabs;
  const label = kind === 'co' ? 'นิติบุคคล' : 'บุคคลธรรมดา';
  if (record) {
    const name = record.name || [record.first,record.last].filter(Boolean).join(' ');
    return tabs + `<button type="button" class="invoice-recipient-card" data-a="payTaxPickOpen" aria-haspopup="dialog" aria-label="ผู้รับใบกำกับภาษี ${esc(name)} แตะเพื่อเปลี่ยน">
      <span class="invoice-recipient-copy"><b>${esc(name)}</b>${record.business ? `<small>${esc(record.business)}</small>` : ''}
      <small class="invoice-recipient-addr">${esc(TP.taxAddress(record))}</small><small>${esc(record.phone || '—')}</small>
      <small>${kind==='co'?'เลขประจำตัวผู้เสียภาษี':'เลขประจำตัวประชาชน'} ${esc('xxxxxxxxx'+String(record.id||'').slice(-4))}</small></span>
      ${ic('chevron-right',16)}
    </button>`;
  }
  return tabs + `<button type="button" class="invoice-recipient-card invoice-recipient-add" data-a="payTaxPickerAdd" data-v="${kind}">
    <span class="invoice-add-icon" aria-hidden="true">${ic('plus',22,2)}</span>
    <span class="invoice-recipient-copy"><b>เพิ่มข้อมูล${label}</b><small>ชื่อ ที่อยู่ และเลขประจำตัว สำหรับออกใบกำกับภาษี</small></span>
  </button>`;
}
TP.invoiceOptions = (kind,key,prefix) => {
  if (prefix === 'pay') return payInvoiceOptions(kind,key);
  const record = TP.taxRecipient(kind,key);
  const choices = `<div class="invoice-kind-options" role="group" aria-label="ประเภทผู้รับใบกำกับภาษี">
    ${invoiceKinds.map(([value,label])=>`<button type="button" class="chip" data-a="${prefix}TaxKind" data-v="${value}" aria-pressed="${kind===value}">${label}</button>`).join('')}
  </div>`;
  if (record) {
    const details = choices + TP.invoiceRecipientDetails(record,kind);
    if (TP.taxRecords(kind).length > 1) {
      return details + ui.btn(prefix==='pay'?'เปลี่ยนที่อยู่ใบกำกับภาษี':'เปลี่ยนผู้รับใบกำกับภาษี',{kind:'ghost',a:prefix+'TaxPickOpen'});
    }
    if (prefix==='pay') {
      return details + `<div class="invoice-address-actions">
        ${ui.btn('แก้ไขที่อยู่',{kind:'ghost',a:'payTaxPickerEdit'})}
        ${ui.btn('เพิ่มที่อยู่',{kind:'ghost',a:'payTaxPickerAdd'})}
      </div>`;
    }
    return details;
  }
  if (!kind) return choices;
  if (prefix==='pay') {
    return choices + ui.btn(kind==='co'?'เพิ่มข้อมูลนิติบุคคล':'เพิ่มข้อมูลบุคคลธรรมดา',{kind:'secondary',a:'payTaxPickerAdd'});
  }
  return choices + `<p class="small invoice-recipient-empty">ยังไม่มีข้อมูลผู้รับประเภทนี้</p>${ui.btn('เพิ่มข้อมูลผู้รับ',{kind:'secondary',a:prefix+'TaxPickerAdd'})}`;
};
TP.invoiceCheckbox = (action, checked, hint = '', icon = '') => `<button type="button" class="rc-tax-check" role="checkbox" aria-checked="${!!checked}" data-a="${action}">
  ${icon ? ic(icon,20) : ''}
  <span class="rc-tax-choice-copy"><b>ต้องการใบกำกับภาษี</b>${hint ? `<span>${esc(hint)}</span>` : ''}</span>
  <span class="rc-tax-choice-check" aria-hidden="true">${checked ? ic('check',16) : ''}</span>
</button>`;
function payTaxHtml() {
  const p=P();
  return `<section class="rc-tax rc-tax-request-card invoice-options">
    ${TP.invoiceCheckbox('payTaxWant',p.taxWant,'','receipt')}
    ${p.taxWant ? TP.invoiceOptions(p.taxWho,p.taxKey,'pay') : ''}
  </section>`;
}
function redrawPayTax(){const el=$('#payTax');if(el){el.innerHTML=payTaxHtml();TP.icons(el)}}
TP.redrawPayTax = redrawPayTax;
TP.act('payTaxWant',()=>{const p=P();p.taxWant=!p.taxWant;if(p.taxWant&&p.taxWho===undefined)p.taxWho=TP.firstInvoiceKind();redrawPayTax();$('#payTax [data-a="payTaxWant"]')?.focus({preventScroll:true});});
TP.act('payTaxKind',b=>{const p=P();if(p.taxWho===b.dataset.v)return;p.taxWho=b.dataset.v;p.taxKey=null;redrawPayTax();$('#payTax [data-segname="payTaxKind"] [aria-pressed="true"]')?.focus({preventScroll:true});});

const checkoutImage = (src, width = 48, height = 28) => `<img src="${esc(src)}" alt="" width="${width}" height="${height}">`;
const checkoutChoice = (label, value, target, icon = '', action = 'openCheckoutChild') => {
  const tag = target ? 'button' : 'h2';
  return `<${tag} class="checkout-choice"${target ? ` type="button" data-a="${action}" data-v="${target}"` : ''}>
    ${icon ? ic(icon,20) : ''}<span>${label}</span>${value ? `<b>${esc(value)}</b>` : ''}${target ? ic('chevron-right',16) : ''}
  </${tag}>`;
};
const checkoutSelection = (title, detail, target, logo, action = 'openCheckoutChild') => {
  const tag = target ? 'button' : 'div';
  return `<${tag} class="checkout-selection"${target ? ` type="button" data-a="${action}" data-v="${target}"` : ''}>
    <span class="checkout-selection-logo">${logo}</span><span><b>${esc(title)}</b><small>${esc(detail)}</small></span>
  </${tag}>`;
};
function checkoutDeliverySelection(recv, courier, fee, target) {
  const pickup = recv === 'pickup';
  const carrier = recv === 'parcel' ? TP.COURIERS.find(option => option.id === courier) : null;
  const name = carrier?.name || (recv === 'express' ? 'Lalamove' : recv === 'cold' ? TP.COLD.name : '');
  const title = pickup ? 'รับยาที่ร้าน' : name ? 'จัดส่งด้วย ' + name : 'จัดส่งพัสดุ';
  /* C308 (target set) also names the expected time from the same data as C316 */
  const eta = target && !pickup ? (carrier ? 'ได้รับภายใน ' + carrier.time : recv === 'express' ? 'ได้รับภายใน 4 ชม.' : '') : '';
  const detail = pickup ? 'ไม่มีค่าจัดส่ง' : ['ค่าจัดส่ง ' + TP.money(fee), eta].filter(Boolean).join(' · ');
  const logo = pickup ? ic('store',24)
    : carrier?.logo ? checkoutImage(carrier.logo)
    : recv === 'express' ? checkoutImage('/assets/couriers/lalamove.png') : ic('truck',24);
  return checkoutSelection(title, detail, target, logo);
}
/* C308 receive tabs (user 24 Nov 2026): จัดส่ง = address (C319) + carrier (C316: Flash, DHL, Lalamove) · รับที่ร้าน = branch (C212) */
const shipKeys = () => recvKeys().filter(k => k !== 'pickup');
function checkoutRecvTabs() {
  const tabs = ui.seg('payRecvTab', [['ship', 'จัดส่ง'], ['pickup', 'รับที่ร้าน']], P().recv === 'pickup' ? 'pickup' : 'ship', { a: 'payRecvTab', label: 'วิธีรับยา' });
  return shipKeys().length ? tabs : tabs.replace('data-v="ship"', 'data-v="ship" disabled');
}
function checkoutShipPanel() {
  const { recv } = P(), a = addr(), km = a ? zone(a)?.km : null;
  const picker = 'type="button" data-a="openCheckoutChild" data-v="checkoutaddress"';
  const contact = a ? [[a.first, a.last].filter(Boolean).join(' '), fmtPhone(a.phone)].filter(Boolean).join(' | ') : '';
  const addressRow = a
    ? `<button ${picker} class="checkout-recv-row" aria-label="ที่อยู่จัดส่ง ${esc(fmtAddr(a))} แตะเพื่อเปลี่ยน">${ic('map-pin',20)}<span><b>${esc(fmtAddr(a))}</b>${contact ? `<small>${esc(contact)}</small>` : ''}${km != null ? `<small>ระยะทาง ${esc(km)} กม. จากสาขา</small>` : ''}</span>${ic('chevron-right',16)}</button>`
    : `<button ${picker} class="checkout-recv-row checkout-recv-empty">${ic('map-pin',20)}<span><b>เลือกที่อยู่จัดส่ง</b><small>ยังไม่ได้เลือกที่อยู่สำหรับคำสั่งซื้อนี้</small></span>${ic('chevron-right',16)}</button>`;
  const courier = recv === 'parcel' ? courierId() : null;
  const fee = courier ? TP.COURIERS.find(option => option.id === courier).fee : EXP_FEE();
  return addressRow + checkoutDeliverySelection(recv, courier, fee, 'checkoutdelivery');
}
function checkoutPickupPanel() {
  const b = TP.branch(C().branch);
  return `<button type="button" class="checkout-recv-row checkout-recv-branch" data-a="openCheckoutChild" data-v="storeinfo" data-p='${esc(JSON.stringify({ branch: b.id }))}' aria-haspopup="dialog" aria-label="ดูข้อมูลและที่ตั้ง${esc(b.name)}">
    ${ic('map-pin',20)}<span><b>${esc(b.name)}</b><small>${esc(b.previewAddr || b.addr || 'ยังไม่มีข้อมูลที่อยู่สาขา')}</small></span>
    ${b.photo ? `<img src="${esc(b.photo)}" alt="" width="56" height="56">` : ''}${ic('chevron-right',16)}
  </button>
  <ul class="checkout-recv-facts">
    ${b.hours ? `<li>${ic('clock',18)}<span>เวลาทำการ ${esc(b.hours)} น.</span></li>` : ''}
    <li>${ic('bell',18)}<span>รับยาเมื่อได้รับแจ้งว่ายาพร้อมรับ · ไม่มีค่าจัดส่ง</span></li>
  </ul>`;
}
function checkoutDeliverySummary() {
  return checkoutRecvTabs() + `<div class="checkout-recv-panel" data-recv="${P().recv === 'pickup' ? 'pickup' : 'ship'}">${P().recv === 'pickup' ? checkoutPickupPanel() : checkoutShipPanel()}</div>`;
}
function checkoutPaymentSummary(payment = P(), action = 'openCheckoutChild') {
  const { method } = payment;
  const qr = method === 'promptpay';
  const card = method === 'card';
  const target = action ? 'checkoutmethod' : null;
  /* C308 (user 24 Nov 2026): one tappable row "วิธีชำระเงิน · value", no method card; card adds the fee remark.
     Last digits come only from a card the payment adapter has saved (Omise customer card); none in the prototype. */
  if (action === 'openCheckoutChild') {
    const last4 = card ? TP.savedPaymentCard?.()?.last4 : null;
    const value = qr ? 'พร้อมเพย์' : card ? 'บัตรเครดิต/เดบิต' + (last4 ? ' *' + last4 : '') : 'เลือกวิธีชำระเงิน';
    return checkoutChoice('วิธีชำระเงิน', value, target, 'credit-card', action) +
      (card ? `<p class="small checkout-card-fee">${ic('info',16,2)}<span>ชำระผ่านบัตรมีค่าบริการ ${r2(TP.CARD_FEE * 100)}% ของยอดค่ายาและค่าจัดส่ง</span></p>` : '');
  }
  return (target ? checkoutChoice('วิธีชำระเงิน', qr ? 'พร้อมเพย์' : card ? 'บัตรเครดิต' : '', target, 'credit-card', action) : '') +
    checkoutSelection(qr ? 'QR PromptPay' : card ? 'บัตรเครดิต' : 'เลือกวิธีชำระเงินใหม่',
      qr ? 'สแกน QR ผ่านแอปธนาคาร' : card ? 'ผ่าน Omise' : 'วิธีเดิมไม่พร้อมใช้งาน',
      target, qr ? checkoutImage('/assets/payments/promptpay.png') : ic('credit-card',24), action);
}
TP.act('openCheckoutChild', button => {
  const extra = JSON.parse(button.dataset.p || '{}'), target = button.dataset.v || extra.target;
  if (!['shippingpolicy', 'checkoutdelivery', 'checkoutmethod', 'checkoutcoupon', 'checkoutaddress', 'storeinfo'].includes(target)) return;
  return TP.sheet(target, { ...(target === 'storeinfo' ? { branch: extra.branch } : {}), fromPay: true, scroll: $('.sh-b', $('#sheet')).scrollTop });
});
/* shared with C212 (other module) when it opens from the C308 pickup tab */
TP.reopenCheckout = ctx => reopenCheckout(ctx);
async function reopenCheckout(ctx) {
  if (!ctx.params.fromPay || !TP.orderPayable(C()?.order)) return;
  if (TP.sheetOpen()?.id === 'pay') return sync();
  await TP.sheet('pay');
  const body = $('.sh-b', $('#sheet'));
  if (body) body.scrollTop = ctx.params.scroll || 0;
}

TP.sheetDef('shippingpolicy', {
  group: 'during', title: 'นโยบายการจัดส่ง คืนสินค้า และคืนเงิน', code: 'C314', host: 'home', owner: 'pay', tall: true,
  states: [['normal', 'เปิดนโยบายใต้ปุ่มชำระเงิน']],
  notes: ['แสดงฉบับ 04/09/2026 จากไฟล์ที่ให้มา และปิดกลับหน้าสรุปคำสั่งซื้อ'],
  render: () => TP.policyDocumentBody(),
  mount: (el, ctx) => TP.mountPolicyDocuments(el, ctx, ['shipping']),
  foot: () => ui.btn('ปิด', { kind: 'secondary', closeSheet: true }),
  afterClose: reopenCheckout,
});

/* C316 lists the three carriers only; pickup is the second tab on C308 (user 24 Nov 2026) */
function deliveryChoices() {
  const keys = recvKeys();
  return [
    ...(keys.includes('parcel') ? [...TP.COURIERS].reverse().map(c => ({
      value: c.id, title: 'จัดส่งแบบ ' + c.name, sub: 'คาดว่าจะได้รับภายใน ' + c.time,
      cost: TP.money(c.fee), photo: c.logo
    })) : []),
    ...(keys.includes('express') ? [{
      value: 'express', title: 'จัดส่งด้วยเมสเซนเจอร์ Lalamove', sub: 'ส่งด่วนพิเศษ ได้รับภายใน 4 ชม.', photo: '/assets/couriers/lalamove.png',
      cost: addr() && isFar(addr()) ? 'นอกระยะ' : TP.money(EXP_FEE()),
      off: addr() && (isFar(addr()) || zoneStop(addr(), 'express')),
    }] : []),
  ];
}
TP.sheetDef('checkoutdelivery', {
  group: 'during', title: 'วิธีการจัดส่ง', code: 'C316', host: 'home', owner: 'pay', tall: true, fullPage: true, cls: 'checkout-delivery-page',
  states: [['dhl', 'จัดส่ง DHL', true, 2], ['flash', 'จัดส่ง Flash Express', true, 3], ['express', 'ส่งด่วน Lalamove', true, 4]],
  notes: ['เปิดจากแถวขนส่งในแท็บจัดส่งของ C308 เลือกได้ 3 แบบ: Flash Express, DHL Express หรือส่งด่วน Lalamove รับที่ร้านอยู่ในแท็บรับที่ร้านของ C308 (รหัส C316.1 สงวนไว้)'],
  prep() { ensureOrder(); },
  render(ctx) {
    ensureOrder();
    const p = P(), requested = ctx.params.fromPay ? (p.recv === 'parcel' ? courierId() : p.recv === 'pickup' ? p.lastShip : p.recv) : ctx.state;
    const options = deliveryChoices();
    const selected = options.find(o => o.value === requested && !o.off)?.value || options.find(o => !o.off)?.value;
    return `<fieldset class="checkout-delivery-choices"><legend class="sr">เลือกวิธีการจัดส่ง</legend>
      ${options.map(o => `<label class="checkout-delivery-choice">
        <input type="radio" name="checkout-delivery-choice" value="${esc(o.value)}" ${o.value === selected ? 'checked' : ''} ${o.off ? 'disabled' : ''}>
        <span class="checkout-delivery-choice-body">
          <span class="checkout-delivery-method">
            ${o.photo ? `<img src="${esc(o.photo)}" width="48" height="32" alt="">` : ic(o.branch ? 'store' : 'truck', 24)}
            <span><b>${esc(o.title)}</b><small>${esc(o.sub)}</small></span><b>${esc(o.cost)}</b>
          </span>
          ${o.branch ? `<span class="checkout-pickup-branch">${o.branch.photo ? `<img src="${esc(o.branch.photo)}" width="44" height="44" alt="">` : ''}
            <span><b>${esc(o.branch.name)}</b><small>${esc(o.branch.previewAddr || o.branch.addr || '')}</small>${o.branch.phone ? `<small>${esc(fmtPhone(o.branch.phone))}</small>` : ''}</span></span>` : ''}
        </span></label>`).join('')}
      </fieldset><p class="small mt8">ค่าจัดส่งขึ้นอยู่กับช่องทางที่เลือก</p>`;
  },
  foot: () => ui.btn('ยืนยัน', { a: 'confirmCheckoutDelivery' }),
  afterClose: reopenCheckout,
});
TP.act('confirmCheckoutDelivery', async () => {
  const sheet = TP.sheetOpen(), p = P(), value = $('input[name="checkout-delivery-choice"]:checked', sheet.el)?.value;
  if (!deliveryChoices().some(option => option.value === value && !option.off)) return;
  const isParcel = TP.COURIERS.some(c => c.id === value);
  p.recv = isParcel ? 'parcel' : value;
  if (isParcel) p.courier = value;
  requote();
  sheet.ctx.params.fromPay = true;
  await TP.closeSheet();
});

TP.sheetDef('checkoutmethod', {
  group: 'during', title: 'วิธีชำระเงิน', code: 'C317', host: 'home', owner: 'pay', over: 'pay', cls: 'checkout-method-sheet',
  states: [['promptpay', 'QR PromptPay'], ['card', 'บัตรเครดิต · ผ่าน Omise']],
  prep() { ensureOrder(); },
  render(ctx) {
    const c = ctx.params.pendingCaseId ? submittedCase(ctx.params.pendingCaseId) : null;
    if (!ctx.params.pendingCaseId) ensureOrder();
    const p = c?.order.payment || (ctx.params.pendingCaseId ? null : P());
    if (!p) return '';
    const method = (c || ctx.params.fromPay) ? p.method : ctx.state === 'card' ? 'card' : 'promptpay';
    const option = (key, label, detail, photo, checked) =>
      `<button type="button" class="checkout-method-option" data-a="confirmCheckoutMethod" data-v="${esc(key)}" aria-pressed="${checked}">
        <span class="checkout-method-logo">${photo}</span><span class="checkout-method-copy">${esc(label)}${detail ? `<small>${esc(detail)}</small>` : ''}</span><span class="checkout-method-mark" aria-hidden="true"></span>
      </button>`;
    const qr = option('promptpay', 'QR PromptPay', 'สแกน QR ผ่านแอปธนาคาร', checkoutImage('/assets/payments/promptpay.png',56,32), method === 'promptpay');
    const card = option('card', 'บัตรเครดิต/เดบิต', `ผ่าน Omise · ค่าบริการ ${r2(TP.CARD_FEE * 100)}%`, ic('credit-card',24), method === 'card');
    return `<div class="group">${qr}</div><div class="group checkout-card-option">${card}</div>`;
  },
  afterClose: reopenCheckout,
});
TP.act('confirmCheckoutMethod', async button => {
  const sheet = TP.sheetOpen(), value = button.dataset.v;
  if (sheet?.id !== 'checkoutmethod' || !['promptpay', 'card'].includes(value)) return;
  const id = sheet.ctx.params.pendingCaseId;
  if (id) {
    const c = submittedCase(id);
    if (!TP.orderPayable(c?.order)) return TP.orderExpiryTick();
    const payment = c.order.payment;
    payment.method = value;
    const totals = payment.totals, subtotal = totals.items - totals.discount + (totals.ship || 0);
    totals.fee = payment.method === 'card' ? r2(subtotal * TP.CARD_FEE) : 0;
    totals.total = r2(subtotal + totals.fee);
    TP.emit('state');
    await TP.closeSheet();
    return TP.refresh({anim:false});
  }
  P().method = value;
  sheet.ctx.params.fromPay = true;
  await TP.closeSheet();
});

const checkoutAddressBlocked = address => zoneStop(address) || (P().recv === 'express' && isFar(address));
TP.sheetDef('checkoutaddress', {
  group: 'during', title: 'เลือกที่อยู่จัดส่ง', code: 'C319', host: 'home', owner: 'pay', tall: true, cls: 'checkout-address-sheet',
  states: [['normal', 'เลือกจากที่อยู่ที่บันทึกไว้'], ['outside', 'ที่อยู่นอกพื้นที่จัดส่ง'], ['empty', 'ยังไม่มีที่อยู่จัดส่ง']],
  prep() { ensureOrder(); P().recv = 'express'; },
  render(ctx) {
    const previewState = ctx.params.fromPay ? '' : ctx.state;
    const addresses = previewState === 'empty' ? [] : [...addrs()];
    if (previewState === 'outside' && !addresses.some(address => address.id === ZONE_ADDR.id)) addresses.push(ZONE_ADDR);
    if (!addresses.length) return ui.empty({ icon: 'map-pin', title: 'ยังไม่มีที่อยู่จัดส่ง', body: 'เพิ่มที่อยู่เพื่อจัดส่งคำสั่งซื้อนี้' });
    const demoAddress = FX.checkoutOutsideAddress;
    addresses.push(demoAddress);
    return `<p class="small">เลือกที่อยู่สำหรับคำสั่งซื้อนี้</p><div class="checkout-address-choices">
      ${addresses.map(address => {
        const blocked = address === demoAddress || checkoutAddressBlocked(address);
        const selected = !blocked && addr()?.id === address.id;
        return `<button type="button" class="checkout-address-option" data-a="confirmCheckoutAddress" data-v="${esc(address.id)}"
          aria-pressed="${selected}"${blocked ? ' disabled' : ''}>
          ${ic('map-pin',22)}<span><b>${esc([address.first,address.last].filter(Boolean).join(' '))}</b>
          <small>${esc(fmtPhone(address.phone))}</small><small>${esc(fmtAddr(address))}</small>
          ${blocked ? ui.tag('อยู่นอกพื้นที่จัดส่ง','danger') : ''}</span>
          ${selected ? ic('check',18) : ''}
        </button>`;
      }).join('')}</div>`;
  },
  foot: () => ui.btn('เพิ่มที่อยู่ใหม่', { kind:'secondary', a:'checkoutAddAddress', icon:'plus' }),
  afterClose: reopenCheckout,
});
TP.act('checkoutAddAddress', async () => {
  const sheet = TP.sheetOpen(), consultation = C();
  if (sheet?.id !== 'checkoutaddress' || !TP.orderPayable(consultation?.order)) return;
  const payState = {...sheet.ctx.params, fromPay:true};
  await TP.closeSheet({instant:true});
  TP.S.st.addressedit = undefined;
  TP.S._homeEditAddress = null;
  TP.S._homePinDraft = null;
  return TP.go('addressedit', {params:{async onCheckoutReturn() {
    await TP.back();
    if (C() !== consultation || !TP.orderPayable(consultation.order)) return;
    await TP.sheet('checkoutaddress',payState);
  }}});
});
TP.act('confirmCheckoutAddress', async button => {
  const sheet = TP.sheetOpen();
  const address = addrs().find(entry => entry.id === button.dataset.v);
  if (sheet?.id !== 'checkoutaddress' || !address || checkoutAddressBlocked(address) || !TP.orderPayable(C()?.order)) return;
  C().deliveryAddress = structuredClone(address);
  P().q = null;
  requote();
  sheet.ctx.params.fromPay = true;
  await TP.closeSheet();
});

TP.sheetDef('checkoutcoupon', {
  group: 'during', title: 'โค้ดส่วนลด', code: 'C318', host: 'home', owner: 'pay', over: 'pay',
  states: [['normal', 'กรอกโค้ดส่วนลด'], ['valid', 'ใช้โค้ดสำเร็จ · ลบโค้ดได้'], ['invalid', 'โค้ดไม่ถูกต้อง']],
  prep(S) {
    ensureOrder();
    const p = couponState(), state = S.st.checkoutcoupon;
    delete C().order.discount;
    p.couponDraft = state === 'valid' ? 'TEST50' : state === 'invalid' ? 'WRONGCODE' : '';
    p.couponError = state === 'invalid' ? 'ไม่พบโค้ดส่วนลดนี้ กรุณาตรวจสอบอีกครั้ง' : '';
    if (state === 'valid') {
      const discount = TP.checkoutCouponAdapter.validate(p.couponDraft, C().order);
      if (!discount.error) C().order.discount = discount;
    }
  },
  render: () => `<div id="payCouponBox">${couponHtml()}</div>`,
  mount(el) {
    if (el._payWired) return;
    el._payWired = 1;
    el.addEventListener('input', onInput);
    el.addEventListener('pointerdown', pinDrag);
    el.addEventListener('keydown', onKey);
    el.addEventListener('focusin', () => requestAnimationFrame(unshift));
  },
  foot: () => ui.btn('ปิด', {kind:'secondary',closeSheet:true}),
  afterClose: reopenCheckout,
});

/* ---------- pay sheet ---------- */
TP.sheetDef('pay', {
  group: 'during', title: 'สรุปคำสั่งซื้อ', code: 'C308', ref: 'C11', host: 'home', tall: true, fullPage:true, backIcon: 'arrow-left', cls: 'checkout-page',
  /* C308.1-13 keep the numbers the owner already reviewed; states added 19/10 night go after them (14-17), 20/10 night 18-20 */
  states: [['normal', 'จัดส่ง Lalamove (ค่าเริ่มต้น)'], ['parcel', 'จัดส่งพัสดุ · เลือก Flash หรือ DHL'], ['express', 'ส่งด่วน'], ['closed', 'ร้านปิด', true, 6], ['card', 'จ่ายด้วยบัตร', true, 7], ['otp', 'บัตร: หน้ายืนยันของธนาคาร', true, 8], ['qr', 'หน้า QR พร้อมเพย์', true, 9], ['qrexp', 'QR หมดอายุ', true, 10], ['checking', 'กำลังตรวจสอบการชำระ', true, 13], ['outzone', 'ที่อยู่นอกเขตส่งยา', true, 18], ['recvoff', 'เภสัชกรปิดบางทาง', true, 19], ['unlock', 'ส่งด่วนเกินระยะ รับที่ร้านแทน', true, 21], ['coupon-valid','โค้ดส่วนลดใช้ได้', true, 26], ['coupon-invalid','โค้ดส่วนลดไม่ถูกต้อง', true, 27], ['tax-picker','เลือกข้อมูลใบกำกับภาษี', true, 30], ['pickup','รับที่ร้าน', true, 31]],
  notes:['วิธีรับยาเป็นแท็บ จัดส่ง / รับที่ร้าน (24 พ.ย. 2569) แท็บจัดส่ง: แถวที่อยู่ (ที่อยู่ ชื่อ | เบอร์ ระยะจากสาขา) เปิด C319 และแถวขนส่งพร้อมค่าส่งและเวลาที่คาดว่าได้รับ เปิด C316 เลือก Flash, DHL หรือ Lalamove แท็บรับที่ร้าน: แถวสาขา (ชื่อ ที่อยู่ รูปร้าน ไม่แสดงระยะทาง) เปิด C212 ดูที่ตั้ง พร้อมเวลาทำการ ยาเก็บเย็นหรือเภสัชกรปิดการจัดส่ง แท็บจัดส่งกดไม่ได้และมีเหตุผลใต้แท็บ','ใบกำกับภาษีใช้การ์ดเลือกผู้รับรูปแบบเดียวกับใบเสร็จ เปิดรายชื่อที่บันทึกไว้ก่อนเลือก ไม่มีแท็บซ้อนในหน้าชำระ อ่านนโยบายจัดส่ง คืนสินค้า และคืนเงิน C314 ใต้ปุ่มชำระ','ใบกำกับภาษี: แท็บ บุคคลธรรมดา / นิติบุคคล การ์ดผู้รับสูงเท่ากันทั้ง 2 แบบ แตะการ์ดเปิดรายชื่อเพื่อเปลี่ยน ไม่มีข้อมูลแสดงการ์ดเพิ่มข้อมูล','วิธีชำระเงินเป็นแถวเดียว วิธีชำระเงิน · พร้อมเพย์ หรือ บัตรเครดิต/เดบิต แตะเปิด C317 ไม่มีการ์ดวิธีชำระ เลือกบัตรแสดงหมายเหตุค่าบริการ 3.65% เลขท้ายบัตรแสดงเฉพาะเมื่อ adapter มีบัตรที่บันทึกไว้ (ต้นแบบไม่มี)','เปิดวิธีรับยา C316 และวิธีชำระเงิน C317 จากสรุปคำสั่งซื้อ เลือก DHL, Flash Express, Lalamove หรือรับที่ร้านตามที่รายการรองรับ','ลำดับ: ตรวจรายการยา เลือกวิธีรับยาและที่อยู่ เลือกวิธีชำระ ตรวจยอดรวมก่อนยืนยัน','การจัดส่งต้องมีที่อยู่ในเขตบริการและทราบค่าส่งก่อนชำระ ส่งด่วนต้องอยู่ในระยะส่งด่วน ยาเก็บเย็นรับที่ร้านเท่านั้น','เริ่มเวลาชำระ 15 นาทีเมื่อกดชำระครั้งแรก ใช้เวลาเดิมเมื่อชำระซ้ำหรือเปลี่ยนวิธีจ่าย','บัตรเครดิตเปิดแบบฟอร์มจำลอง Omise แล้วจำลอง 3-D Secure และตรวจผล สามารถกลับหน้าแรกและชำระต่อจากคำสั่งซื้อเดิมได้','ต้นแบบจำลองราคาและการจ่ายเงินจริงยังไม่เชื่อม gateway'],
  prep(S) {
    if (C()?.order?.payment) S._paymentCase = mockCheckoutCase();
    ensureOrder(); const st = S.st.pay || 'normal';
    S.payFailNext = false; S.locFailNext = false; S.storeOpen = st === 'closed' ? false : TP.flag('storeOpen');
    S.addrs = TP.fresh().addrs;
    /* same main address as C203.8 (real-user 21/10: the two screens disagreed) */
    if (st === 'outzone' || st === 'unlock') S.addrs = [{ ...ZONE_ADDR, main: true }, ...S.addrs.map(a => ({ ...a, main: false }))];
    if (st === 'outzone') TP.setFlag('zoneLock', true);
    if (st === 'unlock') TP.setFlag('zoneLock', false);
    const o = C().order;
    if(st==='normal'||st==='pickup'){o.items=TP.ORDER_ITEMS.map(i=>({...i}));o.total=o.items.reduce((n,i)=>n+i.price,0);} TP.withCold(o, false); o.recvOff = st === 'recvoff' ? { express: true, parcel: true } : null; o.recvWhy = st === 'recvoff' ? 'ต้องได้ยาวันนี้' : '';
    const previewAddress = { express: EXP_ADDR, outzone: ZONE_ADDR, unlock: ZONE_ADDR }[st];
    delete C().deliveryAddress;
    if (previewAddress) C().deliveryAddress = { ...previewAddress };
    delete o.discount;
    S.pay = null; const p = P();
    if(st.startsWith('coupon-')){o.items=TP.ORDER_ITEMS.map(i=>({...i}));o.total=o.items.reduce((n,i)=>n+i.price,0);couponState();p.couponDraft=st==='coupon-valid'?'TEST50':'WRONGCODE';if(st==='coupon-valid')o.discount=TP.checkoutCouponAdapter.validate(p.couponDraft,o);else p.couponError=TP.checkoutCouponAdapter.validate(p.couponDraft,o).error;}
    p.recv = { parcel: 'parcel', express: 'express', outzone: 'express', unlock: 'express', pickup: 'pickup' }[st] || defaultRecv();
    if (st === 'outzone' || st === 'unlock') p.addr = 'a3';
    p.method = ['card', 'otp', 'checking'].includes(st) ? 'card' : 'promptpay';
    if (['card', 'qr', 'qrexp', 'otp', 'checking'].includes(st)) p.auto = st === 'card' ? 'cardform' : st;
    if (st === 'tax-picker') {p.taxWant=true;p.taxWho='me';p.auto='tax-picker';}
  },
  render(ctx) {
    if (C()?.order?.payment) return '';
    ensureOrder();
    const o = C().order, p = P(), b = TP.branch(C().branch);
    requote();
    return `<div class="payw">
      <section class="checkout-block checkout-order-section">${sec(1, 'รายการยาจากเภสัชกร')}<p class="small checkout-store-name">${esc(b.name)}</p>
      <div class="checkout-medicine-list">${o.items.length ? TP.orderMedicineList(o) : '<p class="checkout-empty-medicines">ยังไม่มีรายการยาจากเภสัชกร</p>'}</div>
      </section>
      <section class="checkout-block checkout-delivery" aria-label="วิธีรับยา">
        <div id="payRecv">${checkoutDeliverySummary()}</div><div id="payWhy">${whyHtml()}</div>
        <div id="payForm"></div>
        <div id="payGeo">${geoHtml()}</div>
      </section>
      <section class="checkout-block checkout-payment">
        <div id="payMeth">${checkoutPaymentSummary()}</div>
      </section>
      <section class="checkout-block checkout-coupon">
        ${checkoutChoice('โค้ดส่วนลด', couponDiscount() ? o.discount.code : 'ใช้โค้ดส่วนลด', 'checkoutcoupon', 'ticket')}
      </section>
      <section class="checkout-block checkout-tax"><div id="payTax">${payTaxHtml()}</div></section>
      <section class="checkout-block checkout-reference">${ui.kv([['เลขคำสั่งซื้อ', esc(o.no || TP.orderNumber(C()))]])}</section>
      <section class="checkout-block checkout-review">${sec(5, 'สรุปยอดชำระ')}<div class="pay-sum" id="paySum">${sumHtml(totals())}</div>
        <p class="pay-exp">${o.awaitingCheckout ? 'เริ่มนับเวลา 15 นาทีเมื่อกดชำระเงิน' : `เหลือเวลาชำระ <b data-order-countdown>${TP.orderRemaining(o)}</b>`}</p></section>
      </div>`;
  },
  foot: () => C()?.order?.payment?'':!TP.orderPayable(C()?.order)?ui.btn('ปิด',{kind:'secondary',closeSheet:true}):`<button type="button" class="btn primary pay-go" data-a="payGo" id="payGo"><span id="payLbl"></span></button><p class="checkout-policy-line">เมื่อกดชำระเงิน ฉันได้อ่านและยอมรับ <button type="button" class="link checkout-policy-link" data-a="openCheckoutChild" data-v="shippingpolicy">นโยบายการจัดส่ง คืนสินค้า และคืนเงิน</button></p>`,
  close(ctx) {
    clearInterval(TP.S._qrI);
    if (ctx.params.paymentAttempt) TP.S.payFailNext = false;
  },
  afterClose(ctx) {
    const c = ctx.params.paymentAttempt;
    if (c?.order.status==='pending') {
      TP.expireOrder(c);
      return TP.go('home',{root:true});
    }
  },
  mount(el, ctx) {
    if (C()?.order?.payment) {
      const c = C();
      if (ctx.params.retry && TP.orderPayable(c.order)) return launchPayment(c);
      requestAnimationFrame(async () => {
        if (TP.sheetOpen()?.ctx !== ctx) return;
        await TP.closeSheet();
        if (TP.orderPayable(c.order)) TP.go('pendingpayment',{params:{caseId:c.id}});
      });
      return;
    }
    if(!TP.orderPayable(C()?.order))return;
    if (!el._payWired) { el._payWired = 1; el.addEventListener('input', onInput); el.addEventListener('pointerdown', pinDrag); el.addEventListener('keydown', onKey); el.addEventListener('focusin', () => requestAnimationFrame(unshift)); }
    TP.odo($('#payTot', el), TP.money(totals().total)); payLbl();
    const auto = P().auto; delete P().auto;
    if (auto === 'tax-picker') setTimeout(() => TP.ACTS.payTaxPickOpen?.(), 0);
    else if (auto) {
      lockOrderPayment(C());
      ctx.params.paymentAttempt = C();
      if (auto === 'qr' || auto === 'qrexp') showQR(auto === 'qrexp');
      else showStep(auto);
    }
  }
});

/* ---------- live updates (no full re-render, so a half-typed address form survives) ---------- */
const curTot = () => TP.money(totals().total);
/* swap a radio group's content in place, keeping each radio mark so its check animates instead of popping */
function patchOpts(box, html) {
  if (!box) return;
  const tmp = document.createElement('div'); tmp.innerHTML = html;
  const olds = [...box.children], news = [...tmp.children];
  if (olds.length !== news.length || olds.some((o, i) => o.dataset.v !== news[i].dataset.v)) { box.innerHTML = html; return; }
  const radio = el => el.matches('[role=radio]') ? el : $('[role=radio]', el);
  olds.forEach((o, i) => {
    const a = radio(o), b = radio(news[i]); if (!a || !b) { o.replaceWith(news[i]); return; }
    /* a wrapper row (address + edit button): refresh everything beside the radio too */
    if (a !== o) [...news[i].children].forEach((n, k) => { if (n !== b && o.children[k] && o.children[k] !== a) o.children[k].replaceWith(n.cloneNode(true)); });
    ['aria-checked', 'disabled'].forEach(k => b.hasAttribute(k) ? a.setAttribute(k, b.getAttribute(k)) : a.removeAttribute(k));
    [...a.childNodes].forEach(c => { if (!c.classList?.contains('rd')) c.remove(); });
    [...b.childNodes].forEach(c => { if (!c.classList?.contains('rd')) a.appendChild(c); });
  });
}
function sync(from) {
  const sh = $('#sheet'); if (!$('#payRecv', sh)) return;
  const f = document.activeElement, fk = f?.dataset?.radio && [f.dataset.radio, f.dataset.v], fid = f?.id;
  const fseg = f?.closest?.('[data-segname="payRecvTab"]') && f.dataset.v;
  const panelWas = $('.checkout-recv-panel', sh)?.dataset.recv;
  $('#payRecv', sh).innerHTML = checkoutDeliverySummary();
  $('#payWhy', sh).innerHTML = whyHtml();
  const panel = $('.checkout-recv-panel', sh);
  $('#payGeo', sh).querySelector('[data-address-map]')?._addressMap?.cleanup();
  $('#payGeo', sh).innerHTML = geoHtml();
  globalThis.TPAddressMap?.mount(sh,sh._addressMapCtx);
  $('#payMeth', sh).innerHTML = checkoutPaymentSummary();
  const couponValue = $('.checkout-coupon .checkout-choice > b', sh);
  if (couponValue) couponValue.textContent = couponDiscount() ? C().order.discount.code : 'ใช้โค้ดส่วนลด';
  $('#paySum', sh).innerHTML = sumHtml(totals());
  TP.icons(sh);
  const panelNow = P().recv === 'pickup' ? 'pickup' : 'ship';
  if (panel) { panel.dataset.recv = panelNow; if (panelWas && panelWas !== panelNow) A(panel, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { d: 320, e: E.out }); }
  if (fseg && !f.isConnected) $(`[data-segname="payRecvTab"] [data-v="${fseg}"]`, sh)?.focus({ preventScroll: true });
  else if (fk && !f.isConnected) $(`[data-radio="${fk[0]}"][data-v="${fk[1]}"]`, sh)?.focus({ preventScroll: true });
  else if (fid && !f.isConnected) $('#' + fid, sh)?.focus({ preventScroll: true });
  TP.odo($('#payTot', sh), curTot(), { from });
  payLbl();
}
function payLbl() {
  const sh = $('#sheet'), b = $('#payGo', sh); if (!b) return;
  /* not disabled on purpose: the label says what is missing and a tap scrolls to it (the router ignores aria-disabled taps) */
  const m = missing();
  b.classList.toggle('off', !!m);
  $('#payLbl', sh).textContent = m || 'ดำเนินการชำระเงิน ' + curTot();
  const v = $('#payVia', sh); if (v) v.innerHTML = `${ic(VIA_IC[P().recv], 15, 2)}<span>${esc(viaText())}</span><button type="button" class="link" data-a="payViaGo">เปลี่ยน</button>`;
}
/* small in-sheet dialog: the website uses SweetAlert popups for the same moments; [data-dlg-focus] gets focus first */
function dlg(html, label, cls = '') {
  return new Promise(res => {
    const sh = $('#sheet'), d = document.createElement('div');
    d.className = 'pay-dlg' + (cls ? ' ' + cls : ''); d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', label);
    d.innerHTML = `<div class="pay-dlg-c">${html}</div>`; sh.appendChild(d); TP.icons(d);
    const prev = document.activeElement;
    const done = v => { d.remove(); prev?.isConnected && prev.focus({ preventScroll: true }); res(v); };
    d.addEventListener('click', e => { const b = e.target.closest('[data-dlg]'); if (b) { e.stopPropagation(); done(b.dataset.dlg); } else if (e.target === d) done('cancel'); });
    d.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); done('cancel'); } });
    A($('.pay-dlg-c', d), [{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { d: SP.spring.d, e: SP.spring.e });
    setTimeout(() => ($('[data-dlg-focus]', d) || $('[data-dlg]', d))?.focus(), 40);
  });
}
const alertBox = (title, text) => dlg(`<span class="pay-dlg-i">${ic('triangle-alert', 26, 2)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p><button type="button" class="btn primary" data-dlg="ok"><span>ตกลง</span></button>`, title);
/* scroll only the sheet body: scrollIntoView also moved the phone frame around it (real-user R4) */
function scrollSheet(el, block = 'center') {
  const sb = el?.closest('.sh-b'); if (!sb) return;
  const r = el.getBoundingClientRect(), b = sb.getBoundingClientRect();
  const top = sb.scrollTop + r.top - b.top - (block === 'start' ? 12 : Math.max(0, (b.height - r.height) / 2));
  sb.scrollTo({ top, behavior: TP.RED() ? 'auto' : 'smooth' });
}
/* boxes that clip (overflow hidden) never scroll on purpose: put any that a focus jump moved back */
const unshift = () => { for (let n = $('#sheet'); n && n !== document.body; n = n.parentElement) if (n.scrollTop && getComputedStyle(n).overflowY === 'hidden') n.scrollTop = 0; };
const goTo = sel => { const t = $(sel, $('#sheet')); if (!t) return; scrollSheet(t); A(t, [{ boxShadow: '0 0 0 0 rgba(3,92,103,.0)' }, { boxShadow: '0 0 0 6px rgba(3,92,103,.18)' }, { boxShadow: '0 0 0 0 rgba(3,92,103,0)' }], { d: 900, e: E.out }); };

TP.act('payRecv', t => {
  if(!recvKeys().includes(t.dataset.v))return;
  const f = curTot(), p = P(); p.recv = t.dataset.v; p.geoMsg = ''; requote(); sync(f);
  /* nothing saved yet: open the form right away instead of a warning popup */
  if(p.recv!=='pickup'&&!addr())TP.notify('ยังไม่มีที่อยู่ที่เลือกจากหน้าแรก กรุณาเลือกรับที่ร้าน',{icon:'map-pin'});
});
TP.act('payRecvTab', t => {
  const p = P(), ship = shipKeys(), f = curTot();
  if (t.dataset.v === 'pickup') { if (p.recv !== 'pickup') p.lastShip = p.recv; p.recv = 'pickup'; }
  else if (t.dataset.v === 'ship' && ship.length) {
    if (p.recv !== 'pickup') return;
    const a = addr();
    p.recv = ship.includes(p.lastShip) ? p.lastShip : ship.includes('express') && !(a && isFar(a)) ? 'express' : ship.includes('parcel') ? 'parcel' : ship[0];
  } else return sync();
  p.geoMsg = ''; requote(); sync(f);
  if (p.recv !== 'pickup' && !addr()) TP.notify('ยังไม่ได้เลือกที่อยู่จัดส่ง แตะที่อยู่เพื่อเลือก', { icon: 'map-pin' });
});
TP.act('payCourier', t => { if (!TP.COURIERS.some(c => c.id === t.dataset.v)) return; const f = curTot(); P().courier = t.dataset.v; requote(); sync(f); });
TP.act('payViaGo', () => { goTo('#payRecv'); $('[data-radio="recv"][aria-checked="true"]')?.focus({ preventScroll: true }); });
TP.act('payMeth', t => {
  if(!['promptpay','card'].includes(t.dataset.v))return;
  const f = curTot(); P().method = t.dataset.v; sync(f);
  const x = $('#payExtra'); if (x.firstElementChild) A(x.firstElementChild, [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { d: 380, e: SP.soft.e });
});
TP.act('payBank', t => { P().bank = t.dataset.v; });
TP.act('payMapsGo', () => TP.notify('เปิด Google Maps นำทางไป ' + TP.branch(C().branch).name, { icon: 'navigation' }));
TP.act('payCallBr', () => TP.notify('กำลังโทร ' + TP.branch(C().branch).phone, { icon: 'phone' }));
TP.act('payToPickup', () => { const f = curTot(); P().recv = 'pickup'; sync(f); $('[data-radio="recv"][data-v="pickup"]')?.focus({ preventScroll: true }); goTo('#payRecv'); });
function openForm(id) {
  P().form = { id }; const box = $('#payForm'); box.innerHTML = formHtml(); sync(); TP.icons(box);
  A(box.firstElementChild, [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { d: 360, e: SP.soft.e });
  scrollSheet(box, 'start');
  setTimeout(() => $('#na_house', box)?.focus({ preventScroll: true }), 260);
}
TP.act('payAddrNew', () => TP.notify('ใช้ที่อยู่ที่เลือกจากหน้าแรก',{icon:'map-pin'}));
TP.act('payAddrCancel', () => { P().form = null; $('#payForm').innerHTML = ''; sync(); $('#payAdd')?.focus({ preventScroll: true }); });

/* subdistrict type-ahead: typing again clears district / province / zip, they only come from a picked row */
function suggest(inp) {
  const f = inp.closest('.pay-form'), q = inp.value.trim().replace(/^(ต\.|ตำบล|แขวง)\s*/, ''), box = $('#naSug', f);
  ['na_amp', 'na_prov', 'na_zip'].forEach(id => { $('#' + id, f).value = ''; });
  const hits = q ? TAMBON.filter(x => x[0].includes(q) || x[1].includes(q)).slice(0, 6) : [];
  box.innerHTML = hits.length ? hits.map(x => `<button type="button" role="option" class="sug" data-a="payTambon" data-v="${TAMBON.indexOf(x)}"><b>${esc(x[0])}</b><span>${esc(x[1])} · ${esc(x[2])} ${x[3]}</span></button>`).join('')
    : q ? `<p class="sug-none">${ui.emptyArt('map-pin')}ไม่พบตำบลนี้ ลองพิมพ์ให้สั้นลง</p>` : '';
  box.hidden = !box.innerHTML; inp.setAttribute('aria-expanded', String(!box.hidden));
}
function setTambon(f, x) {
  ['na_dist', 'na_amp', 'na_prov', 'na_zip'].forEach((id, i) => { const el = $('#' + id, f); el.value = x[i]; el.closest('.field').classList.remove('err'); });
  const box = $('#naSug', f); box.hidden = true; box.innerHTML = ''; $('#na_dist', f).setAttribute('aria-expanded', 'false');
  const fd = $('#na_dist', f).closest('.field'); fd.querySelector('.pay-farh')?.remove();
  const tb = { dist: x[0], amp: x[1], prov: x[2] }, z = zone(tb);
  if (zoneStop(tb)) fd.insertAdjacentHTML('beforeend', `<p class="hint pay-farh">${esc(`ตำบลนี้อยู่นอกเขตส่งยา${z.km != null ? ` ห่างสาขา ${z.km} กม.` : ''} ส่งยาไปไม่ได้ รับที่ร้านได้`)}</p>`);
  else if (P().recv === 'express' && isFar(tb)) fd.insertAdjacentHTML('beforeend', `<p class="hint pay-farh">${esc(`ตำบลนี้${z.km != null ? `ห่างสาขา ${z.km} กม.` : 'อยู่'} นอกระยะจัดส่งด่วน (ไม่เกิน 15 กม.) บันทึกแล้วเลือกส่งพัสดุได้`)}</p>`);
}
TP.act('payTambon', t => { const f = t.closest('.pay-form'); setTambon(f, TAMBON[+t.dataset.v]); $('#na_dist', f).focus({ preventScroll: true }); });
/* paste box: pull out phone, subdistrict (+ district / province / zip), the name before the first number, the rest is the address line */
const cut = (s, w, pre) => { const r = new RegExp(`(${pre})\\s*${w}`); return r.test(s) ? s.replace(r, ' ') : s.replace(w, ' '); };
function parseAddr(txt) {
  let s = ' ' + txt.replace(/\s+/g, ' ') + ' '; const o = {};
  const ph = s.match(/0\d{1,2}[-\s]?\d{3}[-\s]?\d{3,4}/);
  if (ph) { o.phone = ph[0].replace(/\D/g, ''); s = s.replace(ph[0], ' '); }
  const hits = TAMBON.filter(x => s.includes(x[0]));
  const tb = hits.find(x => new RegExp(`(ตำบล|แขวง|ต\\.)\\s*${x[0]}`).test(s) && s.includes(x[1])) || hits.find(x => s.includes(x[1])) || hits[0];
  if (tb) {
    [o.dist, o.amp, o.prov, o.zip] = tb;
    s = cut(s, tb[0], 'ตำบล|แขวง|ต\\.'); s = cut(s, tb[1], 'อำเภอ|เขต|อ\\.'); s = cut(s, tb[2], 'จังหวัด|จ\\.');
    s = s.replace(/กทม\.?|กรุงเทพฯ/, ' ').replace(/(^|\D)\d{5}(?=\D|$)/, '$1 ');
  }
  const m = s.trim().match(/^(?:คุณ\s*)?([^\d]+?)\s+(?=\d)/);
  if (m && m[1].length <= 40 && !/ซอย|ซ\.|ถนน|ถ\.|หมู่|บ้านเลขที่/.test(m[1])) { o.name = m[1].trim(); s = s.replace(m[0].trim(), ' '); }
  o.line = s.replace(/\s+/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '');
  return o;
}
function fillPaste(txt) {
  const f = $('.pay-form'); if (!f || !txt.trim()) return;
  const o = parseAddr(txt), set = (id, v) => { const el = $('#' + id, f); if (v && el) { el.value = v; el.closest('.field').classList.remove('err'); } };
  set('na_name', o.name); set('na_phone', o.phone); set('na_house', o.line);
  if (o.dist) setTambon(f, [o.dist, o.amp, o.prov, o.zip]);
  const ok = $('#naPok', f); ok.hidden = false; ok.className = 'pay-pok' + (o.dist ? '' : ' warn');
  ok.textContent = o.dist ? 'กรอกให้แล้ว ตรวจอีกครั้งก่อนบันทึก' : 'กรอกให้บางช่องแล้ว ยังหาตำบลไม่เจอ พิมพ์ในช่องตำบลด้านล่าง';
}
TP.simAction({ id: 'paypaste', label: 'จำลองวางที่อยู่ที่คัดลอกจากแชท', when: () => !!$('#na_paste'),
  run: () => { const t = $('#na_paste'); t.value = 'สมใจ ใจดี 089-555-1234 77/5 หมู่บ้านพฤกษา 8 แขวงศาลาธรรมสพน์ เขตทวีวัฒนา กรุงเทพมหานคร 10170'; fillPaste(t.value); } });
function onInput(e) {
  const t = e.target;
  if(t.id==='payCoupon'){const p=couponState();p.couponDraft=t.value;if(p.couponError){p.couponError='';t.setAttribute('aria-invalid','false');const f=$('#payCouponFeedback');if(f){f.textContent='';f.className='hint';}}return;}
  if (t.id === 'na_dist') { const fd = t.closest('.field'); fd.classList.remove('err'); fd.querySelector('.err-t')?.remove(); fd.querySelector('.pay-farh')?.remove(); return suggest(t); }
  if (t.id === 'na_paste') { clearTimeout(TP.S._pasteT); TP.S._pasteT = setTimeout(() => fillPaste(t.value), 350); return; }
  if (t.closest?.('.pay-form')) { const fd = t.closest('.field'); fd?.classList.remove('err'); fd?.querySelector('.err-t')?.remove(); }
}
function onKey(e) {
  if(e.target.closest?.('#payMeth')&&['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'].includes(e.key)){const opts=$$('#payMeth [role=radio]:not(:disabled)'),index=opts.indexOf(e.target.closest('[role=radio]'));if(index>=0){e.preventDefault();const next=opts[(index+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1)+opts.length)%opts.length];next.click();next.focus({preventScroll:true});}return;}
  if(e.target.id==='payCoupon'&&e.key==='Enter'){e.preventDefault();if(!e.target.readOnly)$('#payCouponBox [data-a=payCouponApply]')?.click();return;}
  if (e.target.id === 'na_dist' && e.key === 'Escape') { const b = $('#naSug'); if (b && !b.hidden) { e.stopPropagation(); b.hidden = true; e.target.setAttribute('aria-expanded', 'false'); } return; }
  if (e.target.id === 'na_dist' && e.key === 'ArrowDown') { const s = $('#naSug .sug'); if (s) { e.preventDefault(); s.focus(); } return; }
  if (e.target.id !== 'payPin') return;
  const d = { ArrowLeft: [-4, 0], ArrowRight: [4, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] }[e.key]; if (!d) return;
  e.preventDefault(); const p = P(), [x, y] = p.pinXY || [50, 50];
  movePin(e.target, TP.clamp(x + d[0], 8, 92), TP.clamp(y + d[1], 15, 95));
}
/* required list + message copy CSM:6036-6070 ("ยังไม่ได้กรอก: ชื่อ · ...") */
const fErr = (f, id, msg) => { const fd = $('#' + id, f).closest('.field'); fd.classList.add('err'); if (msg) fd.insertAdjacentHTML('beforeend', `<p class="err-t" role="alert">${ic('triangle-alert', 14, 2)}<span>${esc(msg)}</span></p>`); };
/* mobiles (06 / 08 / 09) have 10 digits, landlines 9 (real-user R4: 089123456 was saved and nobody could call) */
const phoneOk = d => /^0[689]\d{8}$/.test(d) || /^0[2-57]\d{7}$/.test(d);
const REQ = [['na_name', 'ชื่อผู้รับ'], ['na_phone', 'เบอร์โทรผู้รับ'], ['na_house', 'บ้านเลขที่'], ['na_dist', 'ตำบล/แขวง']];
TP.act('payAddrSave', async b => {
  const f = $('.pay-form'), val = id => $('#' + id, f).value.trim(), err = $('#naErr', f);
  $$('.field', f).forEach(x => x.classList.remove('err')); $$('.err-t', f).forEach(x => x.remove()); err.hidden = true;
  const miss = REQ.filter(([id]) => !val(id)), phone = val('na_phone').replace(/\D/g, '');
  const noTb = !miss.length && !val('na_amp');
  const bad = !miss.length && !noTb && !phoneOk(phone);
  if (miss.length || noTb || bad) {
    if (bad) fErr(f, 'na_phone', 'เบอร์มือถือต้องมี 10 หลัก เช่น 081-234-5678');
    else if (noTb) fErr(f, 'na_dist', 'เลือกตำบล/แขวงจากรายการที่ขึ้นมา');
    else { miss.forEach(([id, l]) => fErr(f, id, 'กรอก' + l)); err.textContent = 'ยังไม่ได้กรอก: ' + miss.map(m => m[1]).join(' · '); err.hidden = false; }
    const first = $('#' + (bad ? 'na_phone' : noTb ? 'na_dist' : miss[0][0]), f); first.focus({ preventScroll: true }); scrollSheet(first);
    if (noTb) suggest(first);
    return;
  }
  const [first, ...rest] = val('na_name').split(/\s+/);
  const data = { first, last: rest.join(' '), phone, house:val('na_house'),building:val('na_building'),alley:val('na_alley'),road:val('na_road'), prov: val('na_prov'), amp: val('na_amp'), dist: val('na_dist'), zip: val('na_zip') };
  const detailErrors=globalThis.TPAddressMap?.errors(data)||{};const badDetail=['house','building','alley','road'].find(k=>detailErrors[k]);if(badDetail){fErr(f,'na_'+badDetail,detailErrors[badDetail]);$('#na_'+badDetail,f).focus();return;}
  b.disabled = true; b.classList.add('busy'); $('span', b).textContent = 'กำลังบันทึก...';
  await TP.wait(600);

  const id = P().form?.id, from = curTot(); let a = id && addrs().find(x => x.id === id);
  if (a) { if (a.prov !== data.prov || a.amp !== data.amp || a.dist !== data.dist || lineOf(a) !== lineOf(data)) a.pin = false; Object.assign(a, data); }
  else { a = { id: 'a' + Date.now(), ...data, main: !addrs().length, pin: false }; addrs().push(a); }
  /* after saving, the new or edited card is the chosen one and every price is asked again */
  const p = P(); p.addr = a.id; p.form = null; p.q = null; p.geo = ''; p.geoMsg = ''; p.moved = false; p.pinXY = null; p.acc = 0; $('#payForm').innerHTML = '';
  requote(); sync(from);
  TP.notify('บันทึกที่อยู่แล้ว', { icon: 'map-pin' });
  $(`[data-radio="addr"][data-v="${a.id}"]`)?.focus({ preventScroll: true });
  if (zoneStop(a)) setTimeout(() => goTo('#payZone'), 80);
  else if (p.recv === 'express' && isFar(a)) setTimeout(() => goTo('#payFar'), 80);
});

/* ---------- 308.3 express home pin ---------- */
const pinned = acc => { const a = addr(), f = curTot(), p = P(); a.pin = true; p.acc = acc; p.geo = ''; p.geoMsg = ''; requote(); sync(f); TP.notify(acc ? `ได้ตำแหน่งแล้ว (±${acc} ม.)` : 'ยืนยันตำแหน่งแล้ว', { icon: 'map-pin' }); $('.pay-repin')?.focus({ preventScroll: true }); };
/* the phone asks once (iOS / Android location prompt); "ครั้งนี้เท่านั้น" asks again next time */
const osAsk = () => dlg(`<span class="os-i">${ic('navigation', 22, 2)}</span><h3>อนุญาตให้ "MITRAREE" ใช้ตำแหน่งของคุณไหม</h3><p>ใช้ตำแหน่งเพื่อปักหมุดบ้านสำหรับส่งด่วน ให้คนขับหาบ้านเจอ</p>
  <div class="os-b"><button type="button" class="os-btn" data-dlg="app" data-dlg-focus>ขณะใช้แอป</button><button type="button" class="os-btn" data-dlg="once">ครั้งนี้เท่านั้น</button><button type="button" class="os-btn" data-dlg="no">ไม่อนุญาต</button></div>`, 'ขอสิทธิ์ใช้ตำแหน่ง', 'os');
const openMap = (msg = '') => { const p = P(); p.geo = 'map'; p.geoMsg = msg; p.moved = false; p.pinXY = null; sync(); setTimeout(() => { goTo('#payMap'); $('#payPin')?.focus({ preventScroll: true }); }, 60); };
TP.act('payGeoOk', () => goTo('#payPinC'));
TP.simAction({ id: 'locfail', label: 'จำลองให้หาตำแหน่งปัจจุบันไม่สำเร็จ', when: () => TP.sheetOpen()?.id === 'pay' && !!$('#payGeoNow') && !TP.S.locFailNext,
  run: () => { TP.S.locFailNext = true; TP.notify('ครั้งถัดไปที่กด ใช้ตำแหน่งปัจจุบัน จะหาไม่สำเร็จ', { icon: 'info' }); } });
/* the mock map pin can be dragged (or moved with arrow keys), like the real Google Maps pin */
function movePin(pin, x, y) {
  const p = P(); p.pinXY = [Math.round(x), Math.round(y)]; pin.style.left = x + '%'; pin.style.top = y + '%';
  if (!p.moved) { p.moved = true; const ok = $('#payGeoOk'); if (ok) ok.disabled = false; $('.pay-lock')?.remove(); }
}
function pinDrag(e) {
  const map = e.target.closest('#payMap'); if (!map) return;
  const pin = $('#payPin', map), r = map.getBoundingClientRect(); e.preventDefault();
  const at = ev => movePin(pin, TP.clamp((ev.clientX - r.left) / r.width, .08, .92) * 100, TP.clamp((ev.clientY - r.top) / r.height, .15, .95) * 100);
  /* a tap on the map drops the pin there (real-user R4: she tapped her house and nothing moved) */
  if (!e.target.closest('#payPin')) at(e);
  map.setPointerCapture(e.pointerId);
  const up = () => { map.removeEventListener('pointermove', at); map.removeEventListener('pointerup', up); map.removeEventListener('pointercancel', up); };
  map.addEventListener('pointermove', at); map.addEventListener('pointerup', up); map.addEventListener('pointercancel', up);
}

/* PL "ยกเลิกบิลนี้": asks first, nothing is charged, the room card says the customer cancelled */

/* ---------- pay ---------- */
const takeFail = () => { const f = TP.S.payFailNext; TP.S.payFailNext = false; return f; };
const where = { 'บันทึกที่อยู่ก่อน': () => { goTo('.pay-form'); setTimeout(() => $('#naSave')?.focus({ preventScroll: true }), 300); }, 'เพิ่มที่อยู่จัดส่งก่อน': () => openForm(null), 'เลือกที่อยู่จัดส่งก่อน': () => $('.checkout-address .checkout-choice')?.click(), 'อยู่นอกระยะจัดส่งด่วน': () => $('.checkout-address .checkout-choice')?.click(), 'ที่อยู่นี้อยู่นอกเขตส่งยา': () => $('.checkout-address .checkout-choice')?.click() };
function beginPaymentLoading(b) {
  // Keep the button's dimensions stable while locking the payment choices.
  const body = $('.sh-b', $('#sheet')); if (body) body.inert = true;
  b.classList.add('busy');
  b.setAttribute('aria-busy', 'true');
}
TP.act('payGo', async b => {
  if(!TP.orderPayable(C()?.order)){TP.orderExpiryTick();return;}
  const m = missing(); if (m) { where[m]?.(); return; }
  if(P().taxWant && !TP.taxRecipient(P().taxWho,P().taxKey)){TP.notify('กรุณาเพิ่มข้อมูลออกใบกำกับภาษีก่อนชำระเงิน',{icon:'info'});return;}
  if (b.dataset.busy) return; b.dataset.busy = '1';
  const c = C();
  lockOrderPayment(c);
  beginPaymentLoading(b);
  return launchPayment(c);
});
const isCurrentPayment = (sheet, consultation) =>
  sheet?.id === 'pay' && TP.sheetOpen() === sheet && C() === consultation && TP.orderPayable(consultation?.order);

async function launchPayment(consultation) {
  const sheet = TP.sheetOpen();
  if (!isCurrentPayment(sheet, consultation)) return;
  sheet.ctx.params.paymentAttempt = consultation;
  const {method} = consultation.order.payment;
  return method === 'card' ? showStep('cardform') : showQR(false);
}

/* ---------- PromptPay QR (full page with the order's deadline) ---------- */
function qrStep() {
  const t = totals(), branch = TP.branch(C().branch);
  const amount = Number(t.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `<section class="card qr-box qr-promptpay" aria-label="ชำระเงินด้วยพร้อมเพย์">
      <header class="qr-brand-band"><img src="/assets/payments/thai-qr-symbol.png" alt="" width="44" height="44"><b>THAI QR<br>PAYMENT</b></header>
      <div class="qr-code" id="qrCode"><div class="qr-live">
        <img class="qr-pay-logo" src="/assets/payments/promptpay.png" alt="PromptPay" width="96" height="44">
        <img class="qr-graphic" src="/assets/payments/promptpay-demo-qr.png" alt="QR ตัวอย่าง" width="264" height="264">
        <div class="qr-order-total"><b>${esc(branch.name)}</b><div><p class="qr-amt num">฿${amount}</p><small>บาท (BAHT)</small></div></div>
        <footer class="qr-brand-footer"><span>MITRAREE Online</span><span>สำหรับทดสอบเท่านั้น</span></footer>
      </div>
        <p class="qr-dead" role="status">QR หมดอายุแล้ว กรุณาขอ QR ใหม่</p>
      </div>
    </section>
    <p class="qr-cd">${ic('clock',16)} QR หมดอายุใน <b class="num" id="qrCd">${TP.orderRemaining(C().order)}</b></p>
    <p class="small qr-c" id="qrSlow" hidden>ชำระแล้วแต่สถานะยังไม่เปลี่ยน กรุณาติดต่อร้านเพื่อตรวจสอบ</p>`;
}
const qrFoot = dead => {
  const back = ui.btn(C()?.order?.payment ? 'กลับหน้าแรก' : 'เปลี่ยนวิธีชำระเงิน', {kind:'ghost',a:'qrBack'});
  return dead ? ui.btn('ขอ QR ใหม่',{a:'qrNew',icon:'refresh-cw'}) + back
    : '<a class="btn secondary" href="/assets/payments/promptpay-demo-qr.png" download="MITRAREE-PromptPay-DEMO.png">ดาวน์โหลดภาพ QR</a>' + back;
};
function showQR(dead) {
  const sh = $('#sheet'); clearInterval(TP.S._qrI);
  $('.sh-b', sh).innerHTML = qrStep(); $('.sh-b', sh).scrollTop = 0; $('.sh-b', sh).inert = false; $('#sheetTitle').textContent = 'QR PromptPay';
  $('.sh-f', sh).innerHTML = qrFoot(false); TP.icons(sh);
  /* the sheet changed step without reopening: let the panel show the QR shortcuts (QA R3-9) */
  TP.emit('state');
  A($('.qr-box', sh), [{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { d: SP.spring.d, e: SP.spring.e });
  const c = C();
  const deadline = dead ? Date.now() : TP.orderDeadline(c.order);
  const cd = $('#qrCd', sh);
  const hint = $('#qrSlow', sh);
  const tick = () => {
    if (!cd.isConnected) return clearInterval(TP.S._qrI);
    const seconds = TP.secondsUntilPaymentDeadline(deadline, Date.now());
    cd.textContent = TP.formatPaymentCountdown(seconds);
    if (!seconds) { clearInterval(TP.S._qrI); qrDead(); }
  };
  TP.S._qrI = setInterval(tick, 1000); tick();
  setTimeout(() => { if (hint?.isConnected) hint.hidden = false; }, 120000);
}
function qrDead() {
  const sh = $('#sheet'), q = $('#qrCode', sh); if (!q) return;
  q.classList.add('dead'); $('.qr-cd', sh)?.setAttribute('hidden', '');
  $('.sh-f', sh).innerHTML = qrFoot(true); TP.icons($('.sh-f', sh)); TP.emit('state');
}
TP.act('qrNew', () => {
  if (!TP.orderPayable(C()?.order)) return TP.orderExpiryTick();
  return showQR(false);
});
TP.act('qrBack', () => backToPay());
function backToPay() {
  clearInterval(TP.S._qrI);
  if (C()?.order?.payment) return TP.closeSheet();
  const sh = $('#sheet'), def = TP.def('pay'), ctx = TP.sheetOpen()?.ctx;
  $('#sheetTitle').textContent = 'สรุปคำสั่งซื้อ';
  $('.sh-b', sh).innerHTML = def.render(ctx); $('.sh-b', sh).inert = false; $('.sh-f', sh).innerHTML = def.foot(ctx); TP.icons(sh);
  TP.odo($('#payTot', sh), curTot()); payLbl(); $('#payMeth [aria-checked=true]', sh)?.focus({ preventScroll: true }); TP.emit('state');
}

/* ---------- Omise hand-offs (card 3-D Secure, bank app) + "checking": the app counts a payment as done only after
   our server has asked Omise (webhook CartController.php:3620-3703), never because the customer came back ---------- */
function stepHtml(kind) {
  const t = totals();
  if (kind === 'cardform') return `<div class="hand"><div class="hand-card om-card-form">
    <p class="om-h"><b>Omise · แบบฟอร์มบัตรตัวอย่าง</b><small>MITRAREE Online · ยอดชำระ ${TP.money(t.total)}</small></p>
    <p class="om-card-networks">Visa · Mastercard · JCB</p>
    <div class="gap12">${fld('omName', 'ชื่อบนบัตร', 'SOMJAI JAIDEE', { ro:true })}${fld('omNo', 'หมายเลขบัตร', '4242 4242 4242 4242', { ro:true })}<div class="om-card-dates">${fld('omExp', 'วันหมดอายุ', '12/28', { ro:true })}${fld('omCvc', 'รหัสหลังบัตร', '•••', { ro:true })}</div></div>
    <p class="small mt12">โหมดทดสอบ · ใช้ข้อมูลจำลองและไม่มีการเรียกเก็บเงิน</p>
  </div></div>`;
  if (kind === 'otp') return `<div class="hand"><div class="hand-card">
    <p class="hand-bank">${ic('shield-check',20)}<b>ยืนยันตัวตนผู้ถือบัตร (3‑D Secure)</b></p>
    ${ui.kv([['ร้านค้า', 'MITRAREE Online'], ['ยอดชำระ', TP.money(t.total)], ['บัตร', 'ลงท้าย 4242']])}
    <p>ธนาคารขอยืนยันบัตรลงท้าย 4242 · รหัสจำลอง 482913</p>
    <p class="small mt12">โหมดทดสอบ · ใช้ข้อมูลจำลองและไม่มีการเรียกเก็บเงิน</p>
  </div></div>`;
  return `<div class="hand-chk" role="status"><i class="spin" aria-hidden="true"></i><b>กำลังตรวจสอบการชำระเงิน</b><p class="small">รอธนาคารยืนยันกับร้าน ปกติไม่เกิน 10 วินาที ไม่ต้องกดซ้ำ</p>
    <p class="small hand-chk-n">ถ้าปิดแอปไปก่อน ร้านจะส่งแจ้งเตือนเมื่อยืนยันแล้ว ไม่มีการตัดเงินซ้ำ</p></div>`;
}
const STEP_T = { cardform: 'ชำระด้วยบัตรเครดิต', otp: 'ยืนยันกับธนาคาร', checking: 'ตรวจสอบการชำระเงิน' };
const stepFoot = kind => {
  if (kind === 'cardform') return ui.btn('ชำระเงิน ' + curTot(), {a:'cardContinue'});
  if (kind === 'otp') return ui.btn('ยืนยัน 3‑D Secure', {a:'otpGo'});
  return '';
};
function showStep(kind) {
  const sh = $('#sheet'); if (!sh || !$('.sh-b', sh)) return;
  clearInterval(TP.S._qrI);
  const body = $('.sh-b', sh); body.innerHTML = stepHtml(kind); body.scrollTop = 0; body.inert = false;
  const title = $('#sheetTitle');
  title.textContent = STEP_T[kind];
  $('.sh-f', sh).innerHTML = stepFoot(kind);
  TP.icons(sh);
  title.focus({preventScroll:true});
  TP.emit('state');
  A(body.firstElementChild, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { d: 360, e: SP.soft.e });

}
async function check(why) {
  const active = TP.sheetOpen(), c = C();
  if (!isCurrentPayment(active, c)) return;
  showStep('checking');
  if (TP.S.st.pay === 'checking' && !c.order.payment) return;
  await TP.wait(1700);
  if (!isCurrentPayment(active, c) || !$('.hand-chk')) return;
  return takeFail() ? failedPayment(why, c) : paid(c);
}
async function failedPayment(why, consultation = C()) {
  if (!TP.orderPayable(consultation?.order)) return TP.orderExpiryTick();
  const p = consultation.order.payment;
  if (p) {
    p.failed = true;
    TP.emit('state');
    return TP.closeSheet();
  }
  await TP.closeSheet();
  return TP.go('payfail',{via:'cover',params:{why}});
}
TP.act('cardContinue', () => {
  if (isCurrentPayment(TP.sheetOpen(), C())) showStep('otp');
});
TP.act('otpGo', () => check('card'));
const inCardResult = () => TP.sheetOpen()?.id === 'pay' && !!$('.hand-chk');
TP.simAction({ id: 'handok', label: 'จำลองว่าธนาคารยืนยันแล้ว', when: inCardResult, run: () => paid() });
TP.simAction({ id: 'handno', label: 'จำลองว่าธนาคารปฏิเสธ', when: inCardResult, run: () => failedPayment('card') });
async function paid(c = C()) {
  if(!TP.orderPayable(c?.order)){TP.orderExpiryTick();return;}
  clearInterval(TP.S._qrI);
  const locked = c.order.payment, p = locked || P(), a = locked ? locked.addr : addr();
  c.order.status = 'paid';
  (TP.S.history||[]).filter(h=>h.id===c.id).forEach(h=>{h.orderStatus='paid';h.bought=c.order.total;h._case=c;});
  c.order.paid = { ...(locked?.totals ?? totals()), recv: p.recv, courier: p.recv === 'cold' ? TP.COLD.id : p.recv === 'parcel' ? (p.courier || TP.COURIERS?.[0]?.id || 'flash') : null, addr: p.recv === 'pickup' ? null : { ...a }, method: p.method, bank: p.bank, date: TP.NOW.date, at: TP.roomNow?.() || TP.NOW.time };
  if(locked?.tax)c.order.tax=locked.tax;
  else if(p.taxWant){const recipient=TP.taxRecipient(p.taxWho,p.taxKey);if(recipient)c.order.tax={who:p.taxWho,pending:{...recipient}};}
  TP.setFulfillment(c,'preparing');
  TP.saveReceipt?.(c);
  c.msgs.push({ who: 'ph', text: TP.paidMsg(p.recv), time: c.order.paid.at });
  /* inbox lines never carry drug names or amounts (contract) */
  TP.S.inbox.unshift({ id: 'r' + Date.now(), kind: 'pay', title: 'ชำระค่ายาแล้ว', body: 'ดูใบเสร็จ', time: TP.NOW.date + ' ' + TP.NOW.time, read: false, go: 'receipt', p: { id: c.id } });
  TP.emit('state');
  await TP.closeSheet();
  TP.go('paymentsuccess', { via: 'cover', root: true });
}
TP.payPaid = paid;
TP.simAction({ id: 'qrpaid', label: 'จำลองว่าจ่าย QR แล้ว', when: () => TP.sheetOpen()?.id === 'pay' && !!$('.qr-box') && !$('.qr-code.dead'), run: () => paid() });
TP.simAction({ id: 'payfailnext', label: 'จำลองให้บัตรเครดิตชำระไม่สำเร็จ', when: () => TP.sheetOpen()?.id === 'pay' && !$('.qr-box') && !TP.S.payFailNext,
  run: () => { TP.S.payFailNext = true; TP.notify('การชำระด้วยบัตรเครดิตครั้งนี้จะไม่สำเร็จ', { icon: 'info' }); } });
TP.simAction({ id: 'qrdead', label: 'จำลองว่า QR หมดเวลา', when: () => TP.sheetOpen()?.id === 'pay' && !!$('.qr-box') && !$('.qr-code.dead'), run: () => qrDead() });

function pendingSample() {
  const c = mockCheckoutCase();
  const now = new Date(c.order.issuedAt);
  const bangkok = {timeZone:'Asia/Bangkok'};
  c.id = 'mock-pending-payment';
  c.order.no = 'MT-DEMO-PENDING';
  c.date = new Intl.DateTimeFormat('en-GB', bangkok).format(now);
  c.joinedAt = new Intl.DateTimeFormat('en-GB', {...bangkok,hour:'2-digit',minute:'2-digit'}).format(now);
  c.branch = 'tw';
  c.deliveryAddress = structuredClone(TP.fresh().addrs[0]);
  const items = c.order.total;
  c.order.payment = {recv:'parcel',courier:'flash',addr:c.deliveryAddress,method:'promptpay',bank:'KBANK',
    totals:{items,discount:0,ship:25,fee:0,total:items+25},tax:null,failed:false};
  return c;
}
TP.pendingHistorySample = S => {
  const id = 'mock-pending-payment';
  return S.history.length && !S.history.some(h=>h.id===id) ? TP.orderHistoryRecord(pendingSample()) : null;
};
TP.openPendingSample = () => {
  const c = pendingSample();
  TP.startOrderPayment(c.order);
  TP.S.history.unshift(TP.orderHistoryRecord(c));
  TP.emit('state');
  return TP.go('pendingpayment',{params:{caseId:c.id}});
};
const pendingContextCase = ctx => submittedCase(ctx.params.caseId || ctx.S._pendingPreviewId);
TP.screen('pendingpayment', {
  group:'during', title:'รอชำระเงิน', code:'C320', parent:'home',
  states:[['normal','รอชำระ · QR PromptPay'],['card','รอชำระ · บัตรเครดิตผ่าน Omise'],['failed','ชำระไม่สำเร็จ'],['expired','หมดเวลาชำระเงิน'],['pickup','รอชำระ · รับยาที่ร้าน']],
  notes:['เริ่มนับ 15 นาทีเมื่อกดชำระครั้งแรก เปลี่ยนวิธีจ่ายหรือชำระอีกครั้งโดยใช้เวลาที่เหลือของคำสั่งซื้อเดิม','กลับจาก QR หรือ Omise ไปหน้าแรก เปิดคำสั่งซื้อเดิมจากการ์ดหรือประวัติ ตัวอย่างจ่ายผ่านและไม่ผ่านใช้แผงทดสอบ','แสดงเวลาที่เหลือและวิธีจ่ายด้านบน แยกที่อยู่และช่องทางจัดส่งพร้อมโลโก้เหนือรายการยา ยอดชำระอยู่ท้ายหน้า'],
  prep(S) {
    const c = pendingSample();
    c.id = 'mock-pending-preview';
    c.order.no = 'MT-DEMO-PREVIEW';
    S.history = S.history.filter(h=>h.id!==c.id);
    S._pendingPreviewId = c.id;
    TP.startOrderPayment(c.order);
    if (S.st.pendingpayment === 'pickup') {
      const payment = c.order.payment;
      payment.recv = 'pickup';
      payment.courier = null;
      payment.addr = null;
      payment.totals.ship = 0;
      payment.totals.total = payment.totals.items;
    }
    if (['card','failed'].includes(S.st.pendingpayment)) {
      c.order.payment.method='card';
      const totals = c.order.payment.totals;
      const subtotal = totals.items - totals.discount + (totals.ship || 0);
      totals.fee = r2(subtotal * TP.CARD_FEE);
      totals.total = r2(subtotal + totals.fee);
      c.order.payment.failed=S.st.pendingpayment==='failed';
    }
    S.history.unshift(TP.orderHistoryRecord(c));
    if(S.st.pendingpayment==='expired'){c.order.expiresAt=Date.now();TP.expireOrder(c);}
  },
  render(ctx) {
    const c = pendingContextCase(ctx);
    if (!c) return ui.nav({title:'รอชำระเงิน',back:true}) + ui.page(ui.empty({icon:'package',title:'ไม่พบคำสั่งซื้อ'}));
    TP.expireOrder(c);
    const o = c.order, p = o.payment, b = TP.branch(p.branch || c.branch), a = p.addr, t = p.totals;
    const payable = TP.orderPayable(o), pickup = p.recv==='pickup';
    const fees = [['ยอดค่ายา',TP.money(t.items)],['ค่าจัดส่ง',TP.money(t.ship || 0)],['ค่าบริการชำระเงิน',t.fee ? TP.money(t.fee) : 'ฟรี']];
    if(t.discount) fees.push(['ส่วนลด','−'+TP.money(t.discount)]);
    fees.push(['ยอดที่ต้องชำระ',TP.money(t.total),'tot']);
    const title = payable ? 'รอชำระเงิน' : o.status==='paid' ? 'ชำระเงินแล้ว' : 'ยกเลิกคำสั่งซื้อแล้ว';
    return ui.nav({title,back:true}) + ui.page(`<div class="payw pending-payment-content">
      <section class="checkout-block pending-payment-clock">
        ${payable ? `<div class="pending-payment-timer">
          <div class="pending-payment-time">${ic('clock',20)}<h2>เหลือเวลาชำระเงิน</h2>
            <strong class="num" data-order-countdown data-order-case="${esc(c.id)}">${TP.orderRemaining(o)}</strong></div>
          <p>ครบกำหนดแล้วคำสั่งซื้อจะถูกยกเลิก</p>
        </div>` : `<h2 class="pay-sec">${o.status==='expired' ? 'หมดเวลาชำระเงิน' : o.status==='cancelled' ? 'คุณยกเลิกคำสั่งซื้อนี้แล้ว' : title}</h2>`}
        <p class="small pending-payment-reference">เลขคำสั่งซื้อ ${esc(o.no)}</p>
      </section>
      <section class="checkout-block checkout-payment">
        ${checkoutPaymentSummary(p, payable ? 'pendingChangeMethod' : null)}
        ${payable && p.failed ? '<p class="danger-t pending-payment-failed">ชำระเงินไม่สำเร็จ</p>' : ''}
      </section>
      <section class="checkout-block ${pickup ? 'checkout-pickup' : 'checkout-address'}">
        ${checkoutChoice(pickup ? 'สาขารับยา' : 'ที่อยู่จัดส่ง', '', null, pickup ? 'store' : 'map-pin')}
        ${pickup ? pickupBranchCard(b) : a ? `<div class="pay-address-readonly">
          <p><b>${esc([a.first,a.last].filter(Boolean).join(' '))}</b></p>
          <p>${esc(fmtAddr(a))}</p>${a.phone ? `<p>${esc(fmtPhone(a.phone))}</p>` : ''}
        </div>` : ''}
      </section>
      <section class="checkout-block">
        ${checkoutChoice('ประเภทจัดส่ง', '', null, 'truck')}
        ${checkoutDeliverySelection(p.recv,p.courier,t.ship)}
      </section>
      <section class="checkout-block"><h2 class="pay-sec">รายการยา</h2>
        <div class="checkout-medicine-list">${TP.orderMedicineList(o)}</div>
      </section>
      <section class="checkout-block pending-payment-summary"><h2 class="pay-sec">สรุปยอดชำระ</h2>${ui.kv(fees,{cls:'pay-kv'})}</section>
      </div>`,{cls:'pending-payment-page'}) +
      (payable ? ui.dock(`<div class="pending-payment-actions">${ui.btn('ยกเลิกคำสั่งซื้อ',{kind:'secondary',a:'pendingCancel'})}${ui.btn('ชำระเงินอีกครั้ง',{a:'pendingRetry'})}</div>`) : '');
  }
});
TP.act('pendingChangeMethod',(_,ctx) => {
  const c = pendingContextCase(ctx);
  if (!TP.orderPayable(c?.order)) return TP.orderExpiryTick();
  return TP.sheet('checkoutmethod',{pendingCaseId:c.id});
});
TP.act('pendingRetry',(_,ctx) => {
  const c = pendingContextCase(ctx);
  if (!TP.orderPayable(c?.order)) return TP.orderExpiryTick();
  if (!['promptpay','card'].includes(c.order.payment.method)) return TP.sheet('checkoutmethod',{pendingCaseId:c.id});
  TP.S._paymentCase = c;
  return TP.sheet('pay',{caseId:c.id,retry:true});
});
TP.act('pendingCancel',(_,ctx) => {
  const c = pendingContextCase(ctx);
  if (!TP.orderPayable(c?.order)) return TP.orderExpiryTick();
  return TP.sheet('pendingcancel',{caseId:c.id});
});
TP.sheetDef('pendingcancel', {
  group:'during', code:'C321', host:'pendingpayment', owner:'pendingpayment',
  title:'ยกเลิกคำสั่งซื้อนี้หรือไม่',
  prep(S) { TP.def('pendingpayment').prep(S); },
  render:ctx=>`<p class="small">เลขคำสั่งซื้อ ${esc(pendingContextCase(ctx)?.order.no || '')}</p>`,
  foot:()=>ui.btn('เก็บคำสั่งซื้อไว้',{kind:'secondary',closeSheet:true})+ui.btn('ยืนยันยกเลิก',{kind:'danger',a:'pendingConfirmCancel'}),
});
TP.act('pendingConfirmCancel',async (_,ctx) => {
  const c = pendingContextCase(ctx);
  if (!TP.orderPayable(c?.order)) return TP.orderExpiryTick();
  c.order.status = 'cancelled';
  const record = TP.S.history.find(h=>h.id===c.id);
  if (record) record.orderStatus = 'cancelled';
  TP.emit('state');
  await TP.closeSheet();
  return TP.go('home',{root:true});
});
TP.simAction({id:'pendingexpire',label:'จำลองหมดเวลาชำระเงิน',when:()=>TP.cur()?.id==='pendingpayment'&&TP.orderPayable(pendingContextCase(TP.cur().ctx)?.order),run:()=>{
  pendingContextCase(TP.cur().ctx).order.expiresAt=Date.now();
  TP.orderExpiryTick();
}});

/* ---------- pay failed (cart/payment_failed.blade.php, wording made to say what to do next) ---------- */
TP.screen('payfail', {
  group: 'during', title: 'ชำระเงินไม่สำเร็จ', code: 'C609', ref: 'C11', parent: 'home',
  states: [['card', 'บัตรไม่ผ่าน']],
  notes: ['หัวเรื่อง ป้าย และรายละเอียดคำสั่งซื้อตามหน้าเว็บ payment_failed.blade.php:85-145',
    'เว็บไม่บอกสาเหตุ ทั้งที่ระบบมีข้อความ "ชำระเงินไม่สำเร็จ กรุณาตรวจสอบข้อมูลบัตรหรือติดต่อธนาคารผู้ออกบัตร" (CartController:3365) แอปแสดงข้อความนี้',
    'QR หมดเวลาไม่มาหน้านี้แล้ว อยู่ในหน้า QR เอง มีปุ่ม ขอ QR ใหม่ ตามหน้าจ่ายบิลเภสัชกร',
    'ลองชำระใหม่จากรายการเดิมโดยคง expiresAt เดิม ไม่เพิ่มเวลา และไม่กลับแชท หากหมดเวลาใช้โฟลว์หมดเวลาชำระเดิม'],
  prep() { ensureOrder(); },
  render(ctx) {
    const why = ctx.params?.why || ctx.state, o = C().order, p = P(), d = TP.DELIVERY.find(x => x.id === p.recv), a = addr();
    const msg = why === 'bank' ? 'ยกเลิกการชำระในแอปธนาคาร ยังไม่มีการตัดเงิน ลองอีกครั้ง หรือเลือกพร้อมเพย์' : 'ชำระเงินไม่สำเร็จ กรุณาตรวจสอบข้อมูลบัตรหรือติดต่อธนาคารผู้ออกบัตร หรือเลือกพร้อมเพย์แทน';
    const meth = why === 'bank' ? 'ชำระผ่านแอปธนาคาร' : 'บัตรเครดิต/เดบิต';
    return ui.nav({right: ''}) + ui.page(`<section class="payment-result payment-result-failed">
      <img class="payment-result-art" src="/assets/illustrations/payment-failed-vector-v2.webp" alt="ตะกร้ายาพร้อมสัญลักษณ์แจ้งเตือน">
      <h1>ชำระเงินไม่สำเร็จ</h1><p class="payment-result-message">${esc(msg)}</p>
      <p class="payment-result-order">เลขคำสั่งซื้อ <strong class="num">${esc(o.no)}</strong></p>
      <p class="payment-result-hint">ลองใหม่ได้ภายในเวลาชำระเงินที่เหลือของรายการเดิม</p>
      <div class="payment-result-actions">${ui.btn('ชำระเงินใหม่อีกครั้ง',{a:'payRetry'})}${ui.btn('กลับสู่หน้าหลัก',{kind:'secondary',go:'home'})}</div>
    </section>`);
  }
});
/* the room is usually right under paid / payfail: go back to it, so back from the room then leaves the room (QA E1) */
const toRoom = () => TP.closedChatRoute?.()?TP.go('home',{root:true}):TP.hist.length && TP.hist[TP.hist.length - 1].id === 'room' ? TP.back() : TP.go('room', { via: 'uncover', replace: true });
TP.act('payRetry', async () => { if(!TP.orderPayable(C()?.order)){TP.orderExpiryTick(); return;} TP.S.st.pay = undefined; await TP.go('home',{root:true}); TP.sheet('pay'); });
})();

/* ===== 68-receipt.js ===== */
/* =====================================================================
   68 · Paid (C12) + receipt (ใหม่). Copies the website:
        paid    = pharmacist bill pay link after paying  frontend/pay/receipt.blade.php (words lang/th/paylink.php:197-224)
        receipt = customer receipt  frontend/bill/receipt_new.blade.php (CartController::Receipt, /cart/receipt/{code})
                  + tax invoice request from frontend/account/account_order_history_detail.blade.php:353-397
   ===================================================================== */
(() => {
const { $, esc, ic, ui, brand, A, E } = TP;
const C = () => TP.S._paymentCase||TP.S.case;
const r2 = x => Math.round(x * 100) / 100;
/* panel jumps: put a paid order on the case (the pay sheet writes the same shape in 66-pay.js paid()) */
function mockPaid(recv, method = 'promptpay', date = TP.NOW.date) {
  TP.ensureCase('room'); if (!C().order) TP.makeOrder();
  TP.withCold(C().order, recv === 'cold');
  const o = C().order, ship = { pickup: 0, express: 89, parcel: TP.DELIVERY.find(d => d.id === 'parcel').fee, cold: TP.COLD.fee }[recv], fee = method === 'card' ? r2((o.total + ship) * TP.CARD_FEE) : 0;
  const a = recv === 'express' && TP.EXP_ADDR ? { ...TP.EXP_ADDR, pin: true } : (TP.S.addrs || [])[0] || TP.fresh().addrs[0];
  o.status = 'paid';
  o.paid = { items: o.total, ship, fee, total: r2(o.total + ship + fee), recv, courier: recv === 'cold' ? TP.COLD.id : null, addr: recv === 'pickup' ? null : { ...a }, method, date, at: '14:33' };
  TP.saveReceipt(C());
}
/* one receipt per consult, kept by consult id when it is paid, so history, summary and the inbox open the right one
   even after a new consult has replaced S.case (QA CD #1, #2) */
const RC = () => TP.S.receipts || (TP.S.receipts = {});
TP.saveReceipt = c => { if (c?.order?.paid) RC()[c.id] = c.order; };
/* website order codes: 11 random characters without look-alikes (mock: seeded by the consult id) */
const codeOf = id => TP.orderNumber(TP.orderCases(TP.S).find(c=>c.id===id) || (TP.S.history||[]).find(h=>h.id===id) || {id});
const addMin = (t, m) => { const [h, mm] = String(t || '00:00').split(':').map(Number), x = h * 60 + mm + m; return `${String(Math.floor(x / 60) % 24).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`; };
/* past consults have no order in the mask: rebuild it from the summary medicines, priced so it adds up to "ซื้อยา ฿x" in history */
function priced(meds, bought) {
  if (!meds.length) return [{ name: 'ยาและเวชภัณฑ์', qty: '1 รายการ', price: bought }];
  const out = meds.map(m => ({ name: m.name, qty: m.qty || '1', price: TP.ORDER_ITEMS.find(i => i.name === m.name)?.price ?? null }));
  const open = out.filter(i => i.price === null), rest = bought - out.reduce((s, i) => s + (i.price || 0), 0);
  if (!open.length) { out[out.length - 1].price += rest; return out; }
  const share = Math.floor(rest / open.length);
  open.forEach((i, n) => { i.price = n === open.length - 1 ? rest - share * (open.length - 1) : share; });
  return out;
}
const pastOrder = (id, date, time, items) => { const sum = items.reduce((s, i) => s + i.price, 0);
  return { no: codeOf(id), items, status: 'paid', total: sum, paid: { items: sum, ship: 0, fee: 0, total: sum, recv: 'pickup', courier: null, addr: null, method: 'promptpay', date, at: addMin(time, 25) } }; };
/* the order a receipt shows: by consult id when given, else the current case. Never opens or changes a consult */
function rcOf(id) {
  const S = TP.S, c = S.case;
  if (!id) return c?.order?.paid ? c.order : null;
  if (RC()[id]) return RC()[id];
  if (c?.id === id && c.order?.status === 'paid') return (RC()[id] = c.order.paid ? c.order : { ...pastOrder(id, TP.NOW.date, c.joinedAt, c.order.items), no: c.order.no || codeOf(id) });
  const h = (S.history || []).find(x => x.id === id);
  /* a history record's paid order may live on its archived case (_case), not only on h.bought */
  const ho = h?._case?.order?.status === 'paid' ? h._case.order : h?.order?.status === 'paid' || h?.order?.paid ? h.order : null;
  if (ho?.paid) return (RC()[id] = { ...ho, no: ho.no || codeOf(id) });
  if (!h?.bought) return null;
  const meds = h.previewSummary?.meds || TP.SUMMARY?.[id]?.meds || TP.ORDER_ITEMS.slice(0, 2);
  return (RC()[id] = pastOrder(id, h.date, h.time, priced(meds, h.bought)));
}
/* a receipt opened from the inbox after the case moved on still needs something to show */
const order = () => { const o = C()?.order; if (o?.paid) return o; const had = TP.caseOpen(); mockPaid('pickup'); if (!had) { C().status = 'closed'; TP.emit('state'); } return C().order; };
const methName = (m, label) => label || (m === 'card' ? 'บัตรเครดิต/เดบิต' : m === 'bank' ? 'ชำระผ่านแอปธนาคาร' : 'พร้อมเพย์');
const recvName = TP.deliveryMethodName = pd => pd.deliveryLabel || (pd.recv === 'pickup' ? 'รับที่ร้าน' : pd.recv === 'express' ? 'จัดส่งด่วน (Lalamove)' : pd.recv === 'cold' ? `ส่งแบบควบคุมความเย็น · ${TP.COLD.name}` : [TP.DELIVERY.find(d => d.id === 'parcel').name, TP.COURIERS.find(c => c.id === pd.courier)?.name].filter(Boolean).join(' · '));
const qty = q => parseInt(q, 10) || 1;
/* items 84 / 90 (owner 20/10): packed at the store = the next step happens at once and the customer is told in the app */
/* A7: Inter Express has no link to the store, so the store pastes what it got: a tracking number or a tracking link (owner 21/10) */
const TRACK = { flash: 'TH01245F9K2YA', dhl: 'THDHL10245877', cold: 'IE2610180042' };
const courierOf = pd => (pd.recv === 'express' ? {name:'Lalamove',short:'Lalamove'} : pd.recv === 'cold' ? TP.COLD : TP.COURIERS.find(c => c.id === pd.courier) || TP.COURIERS[0]);
const setStage = pd => { pd.stage = pd.recv === 'pickup' ? 'ready' : 'sent'; pd.packAt = '14:52'; pd.packDate = TP.NOW.date; if (pd.recv === 'parcel') { pd.courier ||= 'flash'; pd.track ||= TRACK[pd.courier] || TRACK.flash; } if (pd.recv === 'cold') { pd.track = TRACK.cold; pd.trackBy = 'ภญ.ขวัญใจ 15:05'; } };
/* owner 20/10: "30 วัน" the store keeps packed pickup medicine for 30 days, counted from the pack date (parcel and rider orders leave at once) */
const HOLD_DAYS = 30;
const addDays = (d, n) => { const [dd, mm, yy] = String(d).split('/').map(Number), x = new Date(yy, mm - 1, dd + n); return `${String(x.getDate()).padStart(2, '0')}/${String(x.getMonth() + 1).padStart(2, '0')}/${x.getFullYear()}`; };
const holdUntil = pd => addDays(pd.packDate || pd.date, HOLD_DAYS);
/* owner 21/10 "เฟสนี้ผมของ่ายๆหน่อย": no auto cancel or refund · remind on day 15 and day 30 · past the date the store calls */
const dnum = d => { const [dd, mm, yy] = String(d).split('/').map(Number); return yy * 10000 + mm * 100 + dd; };
const pickLate = pd => pd.recv === 'pickup' && pd.stage === 'ready' && dnum(holdUntil(pd)) < dnum(TP.NOW.date);
const LATE_PACK = '17/09/2026';
const pickNotes = (pd, br) => { const b = TP.branch(br), until = holdUntil(pd);
  return [{ id: 'nP30', kind: 'order', title: 'วันนี้เป็นวันสุดท้ายที่มารับยาได้', body: `ที่${b.name} เปิด ${b.hours} แตะเพื่อดูรหัสรับยา`, time: `${until} 09:00`, read: false, go: 'track' },
    { id: 'nP15', kind: 'order', title: 'ยายังรอรับที่ร้าน', body: `มารับได้ถึง ${until} ที่${b.name} แตะเพื่อดูรหัสรับยา`, time: `${addDays(pd.packDate || pd.date, 14)} 09:00`, read: false, go: 'track' }]; };
const trackTxt = pd => pd.track ? `เลขพัสดุ ${pd.track}` : pd.trackUrl ? 'มีลิงก์ติดตามพัสดุ' : '';
const SHIP_L = pd => pd.recv === 'cold' ? 'ค่าส่งแบบเย็น (กล่องเก็บความเย็น)' : 'ค่าจัดส่ง';
TP.act('paidClose',()=>{TP.S._paidFromHome=false;return TP.canBack()?TP.back():TP.go('home',{root:true,via:'uncover'});});
const paidCard = (title,body,footer='') => `<section class="card pad0 pd-section"><h3 class="pd-section-head">${title}</h3><div class="pd-section-body">${body}</div>${footer ? `<div class="pd-section-foot">${footer}</div>` : ''}</section>`;
const paidStatusCard = (steps, orderNumber, pickup, footer = '', visual = {}) => {
  const active = Math.max(0, steps.findIndex(([state]) => state === 'cur'));
  const [, stepTitle, detail] = steps[active];
  const title = visual.title || stepTitle;
  const icons = visual.icons || ['receipt', 'pill', pickup ? 'store' : 'motorcycle', 'check'];
  const artwork = visual.artwork || (active === steps.length - 1 ? 'delivered' : active < 2 ? 'preparing' : pickup ? 'ready' : 'delivery');
  return `<section class="pd-status-card" aria-label="${esc(title)}"><div class="pd-status-content">
    <div class="pd-status-overview"><div>
      <h2 class="pd-status-title" role="status">${esc(title)}</h2>
      <p class="pd-status-order">
        ${visual.carrierLogo ? `<img src="${esc(visual.carrierLogo)}" alt="" width="44" height="24">` : ''}
        <span>${visual.carrier ? esc(visual.carrier) : 'เลขคำสั่งซื้อ ' + esc(orderNumber)}</span>
      </p>
    </div><img class="pd-status-art" src="/assets/illustrations/order-status-${artwork}-vector-v4.webp" alt=""></div>
    <ol class="pd-status-steps" style="--status-steps:${steps.length}">${steps.map(([state, label], index) => `
      <li class="${state}" aria-label="${esc(label)}" ${index === active ? 'aria-current="step"' : ''}>
        <span class="pd-step-marker" aria-hidden="true">${ic(icons[index], 22, 1.8)}</span>
        <span class="pd-step-label" aria-hidden="true">${esc(visual.captions?.[index] || label)}</span>
      </li>`).join('')}</ol>${detail ? `<p class="pd-status-description">${esc(detail)}</p>` : ''}
    </div>${footer ? `<footer class="pd-section-foot">${footer}</footer>` : ''}</section>`;
};
TP.orderStatusCard = paidStatusCard;
const orderChargeRows = pd => [
  ['ยอดค่ายา', TP.money(pd.items)],
  [SHIP_L(pd), pd.ship ? TP.money(pd.ship) : 'ไม่มีค่าจัดส่ง'],
  ...(pd.discount ? [['ส่วนลด', TP.money(-pd.discount)]] : []),
  ...(pd.fee ? [['ค่าธรรมเนียมบัตร (3.65%)', TP.money(pd.fee)]] : []),
  ['ยอดชำระ', TP.money(pd.total), 'tot']
];
const totKv = pd => ui.kv(orderChargeRows(pd));

TP.paymentHistoryCard = (orderNumber, paid, receipt) => {
  const paymentTime = [paid.date, paid.at].filter(Boolean).join(' · ');
  return `<section class="card af-visit-section af-visit-payment">
    <h3>${ic('receipt',20,1.8)} ข้อมูลการชำระเงิน</h3>
    ${ui.kv([
      ['เลขคำสั่งซื้อ', esc(orderNumber)],
      ...(paymentTime ? [['วันและเวลาชำระ', esc(paymentTime)]] : []),
      ...(paid.method ? [['วิธีชำระเงิน', esc(methName(paid.method, paid.methodLabel))]] : []),
      ...orderChargeRows(paid)
    ])}
    ${receipt}
  </section>`;
};

const pickupCodeCard = (order, reminder = '') => {
  const orderNumber = String(order.no || '');
  if (!orderNumber) return '';
  const image = `<img src="/api/pickup-qr?code=${encodeURIComponent(orderNumber)}" alt="QR รหัสรับยา เลขคำสั่งซื้อ ${esc(orderNumber)}" width="92" height="92">`;
  return `<section class="card pad0 pd-section pd-pickup-code">
    <div class="pd-pickup-code-row">
      <div><h3>เลขคำสั่งซื้อ</h3><strong class="num">${esc(orderNumber)}</strong><p>แสดงเลขคำสั่งซื้อหรือ QR ที่เคาน์เตอร์เมื่อยาพร้อมรับ</p></div>
      <button class="pd-pickup-qr-button" type="button" data-a="showPickupQr" aria-haspopup="dialog" aria-label="ขยาย QR รหัสรับยา">${image}<span>ขยาย QR</span></button>
    </div>${reminder}
    <dialog class="pd-pickup-qr-dialog" aria-labelledby="pickupQrTitle">
      <header><h2 id="pickupQrTitle">QR รหัสรับยา</h2><form method="dialog"><button type="submit" class="ibtn" aria-label="ปิด QR รหัสรับยา" autofocus>${ic('x',22,2)}</button></form></header>
      <div class="pd-pickup-qr-body">
        ${image}
        <div class="pd-pickup-qr-number">
          <div><span>เลขคำสั่งซื้อ</span><strong class="num">${esc(orderNumber)}</strong></div>
          <button type="button" class="ibtn" data-a="copyPickupOrder" data-v="${esc(orderNumber)}" aria-label="คัดลอกเลขคำสั่งซื้อ" title="คัดลอกเลขคำสั่งซื้อ">${ic('copy',20)}</button>
        </div>
        <div class="pd-pickup-copy-status" role="status"></div>
      </div>
    </dialog>
  </section>`;
};
TP.act('showPickupQr', button => {
  const dialog = $('dialog', button.closest('.pd-pickup-code'));
  if (!dialog || dialog.open) return;
  const rect = TP.phone.getBoundingClientRect();
  dialog.style.left = `${rect.left + rect.width / 2}px`;
  dialog.style.top = `${rect.top + rect.height / 2}px`;
  dialog.style.maxWidth = `${rect.width - 32}px`;
  dialog.style.maxHeight = `${rect.height - 32}px`;
  dialog.showModal();
});
TP.act('copyPickupOrder', async button => {
  const status = $('.pd-pickup-copy-status', button.closest('dialog'));
  try {
    await navigator.clipboard.writeText(button.dataset.v);
    status.textContent = 'คัดลอกเลขคำสั่งซื้อแล้ว';
  } catch {
    status.textContent = 'คัดลอกไม่ได้ กรุณาลองอีกครั้ง';
  }
});

/* Shared order information uses the same header/body cards as C309. */
TP.fulfillmentDetails = c => {
  const o = c.order, pd = o.paid, a = pd.addr, branch = TP.branch(c.branch) || TP.branch();
  const address = a ? `<div class="pd-branch"><b>${esc([a.first,a.last].filter(Boolean).join(' ') || TP.S.user.full)}</b><p>${esc(TP.fmtAddr(a))}</p>${a.phone ? `<p>โทร ${esc(a.phone)}</p>` : ''}</div>` : '<p>ไม่มีข้อมูลที่อยู่จัดส่ง</p>';
  const pickup = pd.recv === 'pickup';
  const branchDetails = pickup ? `<div class="pd-branch pd-pickup-details">
    ${branch.photo ? `<img src="${esc(branch.photo)}" alt="" width="360" height="120">` : ''}
    <div><b>${esc(branch.name)}</b><p>${esc(branch.previewAddr || branch.addr || '')}</p>
    ${branch.phone ? `<p>โทร ${esc(branch.phone)}</p>` : ''}${branch.hours ? `<p>เปิด ${esc(branch.hours)}</p>` : ''}</div>
    ${branch.map ? ui.btn('นำทางด้วย Google Maps', {kind:'secondary', icon:'map-pin', a:'navStore'}) : ''}
  </div>` : '';
  const live = !TP.fulfillmentInfo(c)?.done;
  const track = live && pd.recv === 'express' ? ui.btn('ติดตามไรเดอร์', {kind:'secondary', sm:true, icon:'external-link', a:'openRiderTracking'}) : '';
  return paidCard(pickup ? 'สาขารับยา' : 'ที่อยู่จัดส่ง', pickup ? branchDetails : address, track) +
    paidCard('ข้อมูลคำสั่งซื้อ', ui.kv([['เลขคำสั่งซื้อ', esc(o.no)], ['ร้านยาที่สั่งซื้อ', esc(branch.name)], ['วิธีรับยา', esc(recvName(pd))]])) +
    paidCard('รายการยา', (o.items?.length ? TP.orderMedicineList(o) : '<p>ไม่มีรายการยา</p>') + totKv(pd)) +
    `<div class="pd-receipt-link">${ui.row({title:'ดูใบเสร็จ',icon:'receipt',go:'receipt',p:{id:c.id}})}</div>`;
};

/* ---------- paid (C12) ---------- */
TP.screen('paymentsuccess', {
  group: 'during', title: 'ชำระเงินสำเร็จ', code: 'C311', parent: 'home',
  states: [['pickup','รับที่ร้าน'],['express','ส่งด่วน'],['parcel','จัดส่งปกติ']],
  notes: ['แสดงหลังระบบยืนยันชำระสำเร็จ พร้อมเลขคำสั่งซื้อจากรายการจริง', 'ปุ่มดูสถานะจัดส่งยาอ่านวิธีรับยาที่บันทึกตอนชำระของคำสั่งซื้อเดิม: รับที่ร้านไป C309 ส่งด่วนและจัดส่งปกติไป C414 โดยไม่ใช้สถานะตัวอย่างเก่า กลับหน้าหลักยังติดตามคำสั่งซื้อเดิมได้'],
  prep(S) { mockPaid(S.st.paymentsuccess || 'pickup'); },
  render() {
    const o = C()?.order;
    return ui.page(`<section class="payment-result">
      <img class="payment-result-art" src="/assets/illustrations/payment-success-vector-v2.webp" alt="ตะกร้ายาพร้อมพลุฉลองชำระเงินสำเร็จ">
      <h1>ชำระเงินสำเร็จ</h1><p class="payment-result-message">ร้านได้รับคำสั่งซื้อของคุณแล้ว</p>
      <p class="payment-result-order">เลขคำสั่งซื้อ <strong class="num">${esc(o?.no || '')}</strong></p>
      <div class="payment-result-actions">${ui.btn(o?.paid?.recv==='pickup'?'ดูสถานะรับยา':'ดูสถานะจัดส่งยา',{a:'paymentResultStatus'})}${ui.btn('กลับสู่หน้าหลัก',{kind:'secondary',go:'home'})}</div>
    </section>`);
  }
});
// Route from the paid order snapshot, never a stale preview state or checkout choice.
TP.fulfillmentScreen = () => 'track';
TP.act('paymentResultStatus', () => {
  const c = C();
  if (!c?.order?.paid) return;
  TP.S._paymentCase = c;
  return TP.go(TP.fulfillmentScreen(c), { root: true });
});
/* C309 merged into C414 (user 8 Nov 2026): no separate registry entry; C414 uses this renderer for pickup. Codes C309.x reserved. */
const PAID_PAGE = ({
  group: 'during', title: 'สถานะยา', code: 'C309', ref: 'C12', parent: 'room',
  states: [['pickup', 'รับที่ร้าน'], ['parcel', 'จัดส่งปกติ'], ['express', 'ส่งด่วน'], ['ready', 'ยาพร้อมรับแล้ว', true, 5], ['rider', 'ไรเดอร์รับยาแล้ว', true, 7], ['overdue', 'เลยกำหนดรับยา', true, 9]],
  notes: ['ผู้ใช้ 8 พ.ย. 2569: C309 แสดงเฉพาะสถานะและข้อมูลวิธีรับยา รายละเอียดคำสั่งซื้อ (เรื่องที่ปรึกษา ข้อมูลบริการ ยา คำแนะนำ ยอดชำระ) ย้ายไปปุ่ม ดูคำสั่งซื้อ ที่เปิด C401 ของคำสั่งซื้อเดิม เมื่อรับยาหรือจัดส่งสำเร็จแล้วดูที่ C401 (ปิด C309.10) ไม่มีการยืนยันรับยาโดยผู้ใช้', 'สถานะยาแสดงภาพตรงกลางตามขั้นตอน ใต้ภาพเป็นสถานะล่าสุดและเลขคำสั่งซื้อ ตามด้วยแถบไอคอนแนวนอน ไม่มีข้อความใต้ไอคอน ใช้ข้อมูลคำสั่งซื้อเดิม', 'ลำดับและคำตามหน้าหลังจ่ายบิลเภสัชกรของเว็บ pay/receipt.blade.php: ชำระเงินสำเร็จ · สถานะ (ชำระแล้ว > กำลังเตรียมยา > พร้อมรับที่สาขา > รับแล้ว / จัดส่งแล้ว > สำเร็จ ป้าย "ตอนนี้") · เลขออเดอร์ · เวลาชำระ · วิธีชำระ · รายการยา · ยอด',
    'รับที่ร้าน: รหัสรับยาที่เคาน์เตอร์ (กติกาแอป) + การ์ดสาขา นำทาง (Google Maps) และโทร ตามเว็บ',
    '19/10 เจ้าของสั่ง: ที่อยู่ เบอร์ และหมุด Google Maps ของสาขาจริง (ตลาดเวิลด์ 082-053-9915 · อ่อนนุช 080-235-3950 เบอร์ที่เจ้าของให้ 01/10) · นำทาง เปิดหมุดจริงในแท็บใหม่',
    'เว็บบอก "ร้านจะแจ้งในแชท LINE" แอปเปลี่ยนเป็นแจ้งในแอป · 20/10 A6: ปุ่ม ติดตามการจัดส่ง ขึ้นทุกครั้งที่เลือกส่ง (C309.2 C309.3 C309.6-8) เปิดจอติดตามพัสดุ C414',
    'ดูใบเสร็จ เปิดหน้าใบเสร็จรับเงิน (ใหม่) · ใบเสร็จเข้ากล่องแจ้งเตือนด้วย ไม่บอกยอดเงินในแจ้งเตือน',
    '20/10 ข้อ 84 และ 90 (ตรงกับคอนโซล S404): ร้านยืนยันจัดยาครบ รับที่ร้าน = แจ้งลูกค้าทันทีว่ายาพร้อมรับ · พัสดุ = จองขนส่งทันที เลขพัสดุขึ้นในแอป · ส่งด่วน = เรียกไรเดอร์ทันที · แจ้งเตือนไม่บอกชื่อยาหรือยอดเงิน · หน้าแรกบอกสถานะเดียวกัน (สถานะ C309.5-7 · หรือกด ร้านจัดยาครบ ในแผงหลังชำระ)',
    '20/10 เจ้าของเคาะ "30 วัน": รับที่ร้าน ร้านเก็บยาที่จัดแล้วไว้ให้ 30 วัน นับจากวันที่จัดยา · จัดยา 18/10/2026 = มารับได้ถึง 17/11/2026 · บอกในกล่องรหัสรับยา (C309.5) แถวยาพร้อมรับบนหน้าแรกและใบสรุป และแจ้งเตือนยาพร้อมรับ · ส่งพัสดุและส่งด่วนไม่มีการเก็บ ของออกจากร้านทันที',
    '21/10 เจ้าของ "เด้งแจ้งเตือนลูกค้า 15 วันและ 30 วัน" + "เฟสนี้ผมของ่ายๆหน่อย ไม่อยากสร้างระบบมารองรับไว้จนหนัก": แจ้งเตือน 2 ครั้งในกล่องแจ้งเตือน (วันที่ 15 ยายังรอรับที่ร้าน มารับได้ถึง ... · วันที่ 30 วันนี้เป็นวันสุดท้าย) ลองจากแผงขวา · กล่อง 30 วันบอกว่าเลยกำหนดร้านจะโทรหา · เลยกำหนด (C309.9) ร้านโทรหาเพื่อตกลงเรื่องยาและการคืนเงิน มีปุ่มโทรหาร้าน ไม่มีปุ่มยกเลิกหรือขอคืนเงินเอง ไม่มีระบบยกเลิกบิลหรือคืนเงินอัตโนมัติ · ตัวอย่าง C309.9 จัดยา 17/09/2026 รับได้ถึง 17/10/2026'],
  wait: ['เวลาถึงโดยประมาณของไรเดอร์ ตอนสร้างจริงใช้ค่าจาก Lalamove (ต้นแบบใส่ 45 นาที)',
    'ทำตอนสร้างจริง: แจ้งเตือนวันที่ 15 และวันที่ 30 ส่งตามวันจัดยาจริง'],
  prep(S) {
    const st = S.st.paid || 'pickup', recv = { ready: 'pickup', overdue: 'pickup', sent: 'parcel', rider: 'express' }[st] || st;
    S.storeOpen = TP.flag('storeOpen'); mockPaid(recv);
    if (['ready', 'overdue', 'sent', 'rider', 'cold'].includes(st)) setStage(C().order.paid);
    if (st === 'overdue') { const pd = C().order.paid; pd.date = pd.packDate = LATE_PACK; S.inbox = [...pickNotes(pd, C().branch).map(n => ({ ...n, caseId:C().id, read: true })), ...TP.fresh().inbox]; }
  },
  render() {
    const c = C(), o = order(), pd = o.paid, pick = pd.recv === 'pickup', st = pd.stage && pd.stage !== 'preparing', cr = courierOf(pd), late = pick && pickLate(pd);
    const fulfillment = TP.fulfillmentInfo(c);
    if (fulfillment?.done) return TP.SCREENS.summary.render({ S: TP.S, state: '', params: { id: c.id } });
    /* legacy 4 steps (user 24 Nov 2026); the hold-until line stays under the pickup code */
    const steps = TP.trackSteps(c, ['', pick ? 'โดยปกติพร้อมรับใน 15-30 นาที เมื่อพร้อมร้านจะแจ้งในแอป' : '', '']);
    return ui.nav({title:pick?'สถานะรับยา':'ติดตามยา',right:`<button type="button" class="ibtn" data-a="paidClose" aria-label="ปิด">${ic('x',22,2)}</button>`}) + ui.page(`
      ${paidStatusCard(steps,o.no,pick,!pick && pd.recv!=='express'?`${ui.btn('ติดตามการจัดส่ง',{kind:'secondary',sm:true,icon:'map-pin',go:'track'})}${pd.track?ui.btn('คัดลอกเลขพัสดุ',{kind:'ghost',sm:true,icon:'copy',a:'copyTrack'}):pd.trackUrl?ui.btn('เปิดหน้าติดตามพัสดุ',{kind:'ghost',sm:true,icon:'external-link',a:'openTrackLink'}):''}`:'',{icons:!pick&&pd.recv!=='express'?['receipt','pill','truck','check']:undefined,artwork:fulfillment?.key==='calling'?'calling':pd.recv==='parcel'&&pd.stage?(pd.deliv?'delivered':'parcel'):undefined,carrier:recvName(pd),captions:pick?['ชำระแล้ว','เตรียมยา','พร้อมรับ','รับยาแล้ว']:undefined})}
      ${pick ? pickupCodeCard(o, late ? `<p class="pd-hold" id="pdLate">${ic('clock',16,2)}<span>ร้านเก็บยาไว้ให้ถึงวันที่ <b class="num">${holdUntil(pd)}</b> · ร้านจะโทรหาคุณ</span></p>` : st ? `<p class="pd-hold" id="pdHold">${ic('clock',16,2)}<span>มารับได้ถึงวันที่ <b class="num">${holdUntil(pd)}</b></span></p>` : '') : ''}

      ${TP.fulfillmentDetails(c)}
      `, {cls:'order-tracking-page'});
  },

});
const caseBranch = () => TP.branch(C()?.branch || TP.S.branch);
TP.act('navStore', () => { const b = caseBranch(); window.open(b.map, '_blank', 'noopener'); TP.notify('เปิด Google Maps ไปที่' + b.name, { icon: 'navigation' }); });
TP.act('copyTrack', async () => { const t = order().paid.track; try { await navigator.clipboard?.writeText(t); } catch (e) { /* the mask has no clipboard in some previews */ } TP.notify(`คัดลอกเลขพัสดุ ${t} แล้ว`, { icon: 'copy' }); });
/* the store pasted a tracking link: one button, the long link is never shown (ทำตอนสร้างจริง: เปิดลิงก์ที่ร้านแปะ) */
TP.act('openRiderTracking', () => {
  const pd = order()?.paid;
  const url = pd?.trackingUrl || pd?.trackUrl || '';
  try { const link = new URL(url); if (link.protocol === 'https:') { window.open(link.href, '_blank', 'noopener,noreferrer'); return; } } catch {}
  TP.notify('ยังไม่มีลิงก์ติดตามไรเดอร์จากผู้ให้บริการขนส่ง', { icon: 'circle-alert' });
});
TP.act('openTrackLink', () => TP.notify(`เปิดหน้าติดตามพัสดุของ ${TP.COLD.short}`, { icon: 'external-link' }));
TP.act('trackShip', () => { const pd = order().paid; TP.notify(pd.recv === 'express' ? 'เปิดหน้าติดตามไรเดอร์ของ Lalamove' : `เปิดหน้าติดตามพัสดุของ ${courierOf(pd).name}`, { icon: 'external-link' }); });
/* the store presses "จัดยาครบ" in S404: notified at once, never the medicine names or the amount */
TP.simAction({
  id: 'ordPacked', label: 'ร้านจัดยาครบ (ข้อ 84/90)', when: S => S.case?.order?.status === 'paid' && !!S.case.order.paid && !S.case.order.paid.stage && !S.case.order.picked && !(S.case.order.fulfillment && S.case.order.paid.recv==='express'),
  run() {
    const S = TP.S, c = S.case, pd = c.order.paid, b = TP.branch(c.branch); setStage(pd);
    const n = pd.recv === 'pickup' ? ['ยาพร้อมรับแล้ว', `ที่${b.name} รับได้ถึง ${holdUntil(pd)} แตะเพื่อดูรหัสรับยา`] : pd.recv === 'express' ? ['ไรเดอร์รับยาแล้ว', 'แตะเพื่อติดตามการจัดส่ง'] : ['ส่งยาแล้ว', 'มีเลขพัสดุแล้ว แตะเพื่อติดตาม'];
    const item = { id: 'n' + Date.now().toString(36), kind: 'order', title: n[0], body: n[1], time: `${TP.NOW.date} ${pd.packAt}`, read: false, go: 'track', caseId:c.id };
    S.inbox.unshift(item); TP.emit('state');
    if (TP.cur()?.id === 'track') { item.read = true; TP.refresh({ anim: false }); TP.notify(n[0], { icon: pd.recv === 'pickup' ? 'store' : 'package' }); }
    else { if (TP.cur()?.id === 'home') TP.refresh({ anim: false }); TP.banner({ title: n[0], body: n[1], onTap: () => { item.read = true; TP.emit('state'); TP.go(item.go); } }); }
  }
});
/* day 15 and day 30 reminders go where the ready notice goes: the inbox and a banner */
const pickRemind = day => ({
  id: 'pickD' + day, label: day === 15 ? 'ยังไม่มารับ ครบ 15 วัน (เตือนครั้งที่ 1)' : 'วันที่ 30 วันสุดท้าย (เตือนครั้งที่ 2)',
  when: S => { const pd = S.case?.order?.paid; return !!pd && pd.recv === 'pickup' && pd.stage === 'ready' && !S.case.order.picked && !pickLate(pd) && !S.inbox.some(n => n.id === 'nP' + day); },
  run() {
    const S = TP.S, c = S.case, item = { ...pickNotes(c.order.paid, c.branch)[day === 15 ? 1 : 0], caseId:c.id };
    S.inbox.unshift(item); TP.emit('state');
    if (TP.cur()?.id === 'track') { item.read = true; TP.emit('state'); TP.notify(item.title, { icon: 'store' }); }
    else { if (TP.cur()?.id === 'home') TP.refresh({ anim: false }); TP.banner({ title: item.title, body: item.body, onTap: () => { item.read = true; TP.emit('state'); TP.go('track'); } }); }
  }
});
TP.simAction(pickRemind(15)); TP.simAction(pickRemind(30));
TP.act('callStore', () => { const b = caseBranch(); TP.notify(`กำลังโทรหา${b.name} ${b.phone}`, { icon: 'phone' }); });

/* ---------- C414 parcel tracking (A6, FDA notice 2.2(4): traceable the whole way, completion is reported by the carrier) ---------- */
/* Parcel steps (user 8 Nov 2026): preparing → packed and handed to the courier (tracking number) → transit → out. Delivered opens C401. */
TP.previewParcelStatus = (pd, state) => {
  setStage(pd);
  pd.parcelStep = state;
  pd.out = state === 'out' || state === 'delivered';
  if(state==='delivered') pd.deliv='19/10/2026 11:20';
};
const trkState = pd => (pd.got ? 'received' : pd.deliv ? 'delivered' : !pd.stage || pd.stage === 'preparing' ? 'prep' : pd.recv === 'cold' ? 'cold' : pd.out ? 'out' : 'transit');
function trkSteps(pd, st) {
  const cold = pd.recv === 'cold';
  const preparing = st === 'prep';
  const complete = st === 'received' || st === 'delivered';
  let progress = '';
  if (!preparing && !complete) {
    if (pd.out) progress = 'กำลังนำส่ง';
    else if (pd.parcelStep === 'packed') progress = `ส่งให้ ${courierOf(pd).name} แล้ว`;
    else if (!cold) progress = 'กำลังขนส่ง';
  }
  return {
    steps: [
      ['ชำระแล้ว', ''],
      ['กำลังเตรียมยา', preparing && pd.recv==='parcel' ? 'เลขพัสดุจะแสดงเมื่อร้านส่งให้ขนส่ง' : ''],
      [cold ? `ส่งให้ ${courierOf(pd).short} แล้ว` : 'พัสดุอยู่ระหว่างจัดส่ง', progress],
      ['ส่งสำเร็จ', ''],
    ],
    cur: complete ? 3 : preparing ? 1 : 2,
  };
}
TP.screen('track', {
  group: 'after', title: 'ติดตามยา', code: 'C414', parent: 'paid',
  /* legacy 4 steps (user 24 Nov 2026): C414.9 .15 .20 .22 retired and reserved */
  states: [['chat-preparing','ส่งด่วน · เตรียมการจัดส่ง', true, 8], ['chat-delivering','ส่งด่วน · อยู่ระหว่างการจัดส่ง', true, 10], ['parcel-preparing','จัดส่งปกติ · เตรียมการจัดส่ง', true, 13], ['parcel-transit','จัดส่งปกติ · อยู่ระหว่างการจัดส่ง', true, 14], ['pickup-preparing','รับที่ร้าน · เตรียมการจัดส่ง', true, 17], ['pickup-ready','รับที่ร้าน · เตรียมสินค้าเรียบร้อยแล้ว', true, 18]],
  stateGroups: [
    {label:'รับยาที่ร้าน',keys:['pickup-preparing','pickup-ready']},
    {label:'ส่งด่วน',keys:['chat-preparing','chat-delivering']},
    {label:'จัดส่งปกติ',keys:['parcel-preparing','parcel-transit']}
  ],
  notes: ['ทุกวิธีรับยาใช้ 4 ขั้นตามเว็บเดิม (order_progress_html): ยืนยันการสั่งซื้อสินค้า → เตรียมการจัดส่ง → อยู่ระหว่างการจัดส่ง (รับที่ร้าน: เตรียมสินค้าเรียบร้อยแล้ว) → ลูกค้ารับสินค้าแล้ว ส่งด่วนหาไรเดอร์และจัดส่งปกติแพ็กแล้วยังอยู่ขั้นเตรียมการจัดส่ง ตามเว็บเดิมที่ packing_complete ยังไม่ใช่อยู่ระหว่างการจัดส่ง (24 พ.ย. 2569) รหัส C414.9 .15 .20 .22 สงวน', 'ไม่มีหน้าสถานะสำเร็จ: รับยาที่สาขาแล้ว ส่งด่วนเสร็จ หรือจัดส่งปกติส่งถึง จะเปิดใบคำสั่งซื้อ C401 ทันที (ลบ C414.11 .16 .19 สงวนรหัส .23)', 'ผู้ใช้ 8 พ.ย. 2569: C414 แสดงการ์ดสถานะและชื่อขั้น สาขาหรือที่อยู่จัดส่ง ข้อมูลคำสั่งซื้อ รายการยา และลิงก์ดูใบเสร็จ เมื่อรับยาหรือจัดส่งสำเร็จเปิด C401 ของคำสั่งซื้อเดิม', 'ใช้ข้อมูลรายละเอียดประวัติชุดเดียวกัน: เรื่องที่ปรึกษา ข้อมูลบริการ ยาและวิธีใช้ คำแนะนำ ยอดชำระและใบเสร็จ ระหว่างรับยา/จัดส่งแสดงสถานะกับข้อมูลเฉพาะวิธีรับยาไว้บนสุด เมื่อสาขาหรือขนส่งแจ้งสำเร็จจะตัดส่วนติดตามออก เหลือประวัติเดิม ไม่มีการยืนยันรับยาโดยผู้ใช้', 'A6 ตามประกาศ อย. ข้อ 2.2(4) สืบย้อนได้ตลอดการขนส่ง: เลขพัสดุ บริษัทขนส่ง สถานะจนถึงจัดส่งสำเร็จตามข้อมูลขนส่ง ไม่ให้ลูกค้ายืนยันรับยา · เปิดจากปุ่ม ติดตามการจัดส่ง ใน C309 แถวบนหน้าแรก ประวัติ C403 และแจ้งเตือนส่งยาแล้ว',
    'แสดงแถบความคืบหน้า 4 ขั้นตามวิธีรับยา แสดงโลโก้ DHL, Flash Express หรือ Lalamove ใต้ชื่อสถานะ',
    'รับยาที่ร้าน แสดงเลขคำสั่งซื้อเต็มทั้งบนการ์ดและใน QR กดขยาย QR ได้ พร้อมรูปสาขาและปุ่มนำทาง',
    'จัดส่งปกติ: เลขพัสดุแสดงพร้อมปุ่มคัดลอกตั้งแต่แพ็กแล้ว ส่งให้บริษัทขนส่ง (C414.22) ก่อนหน้านั้นแสดงว่าเลขพัสดุขึ้นเมื่อร้านส่งของ',
    'ไม่มีปุ่มยืนยันรับยาหรือแผ่น C415 เมื่อร้านบันทึกส่งมอบหรือขนส่งแจ้งส่งสำเร็จ รายการย้ายไปประวัติทันที'],
  wait: [],
  prep(S) {
    if(S.st.track?.startsWith('pickup-')){S.st.paid={'pickup-preparing':'pickup','pickup-ready':'ready'}[S.st.track];PAID_PAGE.prep(S);return;}
    if(S.st.track?.startsWith('parcel-')){TP.ensureCase('closed');TP.fulfillmentPreview(C(),S.st.track);return;}
    /* express uses the 4-phase chat delivery flow only (C414.1, .2, .5 legacy express timeline removed 8 Nov 2026; codes reserved) */
    const key = S.st.track?.startsWith('chat-') ? S.st.track.slice(5) : 'preparing';
    TP.ensureCase('closed'); TP.fulfillmentPreview(C(), 'delivery-' + key);
  },
  render() {
    if(C()?.order?.paid?.recv==='pickup')return PAID_PAGE.render();
    if(TP.fulfillmentInfo(C())?.done)return TP.SCREENS.summary.render({ S: TP.S, state: '', params: { id: C().id } });
    if(C()?.order?.paid?.recv==='express'&&TP.fulfillmentInfo(C()))return TP.chatDeliveryPage(C());
    const o = order(), pd = o.paid, cr = courierOf(pd), ex = pd.recv === 'express', cold = pd.recv === 'cold', st = trkState(pd), { steps, cur } = trkSteps(pd, st);
    const head = pd.track || pd.trackUrl || cold ? ui.card(`<div class="tk-h"><span class="tk-i">${ic(cold ? 'snowflake' : 'package', 22, 2)}</span><div class="grow"><b>ติดตามพัสดุ</b><small>${pd.track ? `<span class="num">${esc(pd.track)}</span>` : pd.trackUrl ? 'ร้านแปะลิงก์ติดตามพัสดุแล้ว' : 'เลขพัสดุขึ้นเมื่อร้านส่งของ'}</small></div>${pd.track ? `<button type="button" class="ibtn" data-a="copyTrack" aria-label="คัดลอกรหัสพัสดุ" title="คัดลอกรหัสพัสดุ">${ic('copy', 20, 2)}</button>` : ''}</div>
      ${cold ? `<p class="tk-n">${ic('snowflake', 14, 2)}<span>ยาอยู่ในกล่องคุมความเย็น 2-8 องศา · สถานะระหว่างทาง โทรถามร้านได้</span></p>${pd.track ? `<button type="button" class="link tk-web" data-a="trackShip">ติดตามบนเว็บ ${esc(TP.COLD.short)} ${ic('external-link', 14, 2)}</button>` : pd.trackUrl ? ui.btn('เปิดหน้าติดตามพัสดุ', { kind: 'secondary', sm: true, icon: 'external-link', a: 'openTrackLink', cls: 'mt12' }) : ''}` : ''}`, { din: 1, cls: 'mt8' }) : '';
    const current = TP.trackStepIndex(C());
    const tl = paidStatusCard(TP.trackSteps(C(), ['', pd.recv==='parcel' ? 'เลขพัสดุจะแสดงเมื่อร้านส่งให้บริษัทขนส่ง' : '', cur === 2 ? steps[2][1] : '']),o.no,false,'',{
      artwork:pd.deliv||pd.got?'delivered':current<2?'preparing':ex?'delivery':'parcel',
      carrier:pd.deliveryLabel || (ex ? 'Lalamove' : cr.ini || cr.name),
      carrierLogo:ex ? '/assets/couriers/lalamove.png' : cr.logo,
      icons:['receipt','pill',ex?'motorcycle':'truck','check']
    });
    const coldTip = cold && st !== 'prep' ? ui.card(`<div class="tk-cold">${ic('snowflake', 20, 2)}<div><b>ถึงแล้วเก็บเข้าตู้เย็นทันที</b><p>ถ้ากล่องไม่เย็นแล้ว อย่าใช้ยา โทรหาร้าน ${esc(caseBranch().phone)}</p></div></div>${ui.btn('โทรหาร้าน', { kind: 'secondary', sm: true, icon: 'phone', a: 'callStore', cls: 'mt8' })}`, { din: 2, cls: 'mt16' }) : '';
    return ui.nav({ title: 'ติดตามยา', right: `<button type="button" class="ibtn" data-a="paidClose" aria-label="ปิด">${ic('x',22,2)}</button>` }) +
      ui.page(`${tl}${head}${coldTip}${TP.fulfillmentDetails(C())}`, {cls:'order-tracking-page'});
  }
});
for(const [key,label,from,to]of [['chatCalling','ร้านเตรียมยาเสร็จ · เรียกไรเดอร์','preparing','calling'],['chatDelivering','ไรเดอร์รับยาแล้ว','calling','delivering'],['chatDelivered','ไรเดอร์ส่งยาสำเร็จ','delivering','delivered']])TP.simAction({id:key,label,when:S=>S.case?.order?.paid?.recv==='express'&&S.case?.order?.fulfillment?.status===from,run(){if(!TP.setFulfillment(TP.S.case,to))return;if(TP.fulfillmentInfo(TP.S.case)?.done&&TP.cur()?.id==='track')return TP.openCompletedOrder(TP.S.case);TP.refresh({anim:false});}});
// C415 retired: delivery completion comes from the carrier or branch, never a customer confirmation.

/* ---------- receipt (ใหม่) ---------- */
/* every receipt is an abbreviated tax invoice; the full one downloads in one tap (owner 19/10: "ผมไม่ต้องการให้กดขอ")
   in the account name and main address · a person needs no tax id, a company does (Revenue Code 86/4) */
const meTax = () => { const u = TP.S.user, a = TP.S.rcNoAddr ? null : (TP.S.addrs || TP.fresh().addrs).find(x => x.main); return a ? { name: u.full, kind: 'บุคคลธรรมดา', addr: TP.fmtAddr(a), phone: (a.phone || u.phone).replace(/\D/g, '') } : null; };
const taxWho = () => TP.taxSelected('me');
/* the name on the full invoice belongs to the account; form / done belong to each order */
const T = o => o.tax || (o.tax = { done: null, form: false, who: TP.firstInvoiceKind() || 'me' });
/* deadline = end of the purchase month (AccountController:524-577) */
const ymd = d => { const [dd, mm, yy] = String(d).split('/').map(Number); return yy * 10000 + mm * 100 + dd; };
const isLate = d => {
  const paid = ymd(d), today = ymd(TP.NOW.date);
  return paid > today || Math.floor(paid / 100) !== Math.floor(today / 100);
};
const rcCur = () => TP.cur()?.ctx?.rc;
const taxNo = o => 'TX' + o.no;
/* Thai tax id: 13 digits, last one is a check digit (same rule as the national id) */
const r2v = x => Math.round(x * 100) / 100;
TP.screen('receipt', {
  group: 'after', title: 'ใบเสร็จรับเงิน', code: 'C402', parent: 'paid',
  states: [['normal', 'ขอใบกำกับภาษี'], ['taxsent', 'ขอใบกำกับภาษีแล้ว', true, 4], ['late', 'เลยรอบขอใบกำกับภาษี', true, 6], ['missing', 'ไม่พบใบเสร็จ', true, 7]],
  notes: ['ใบเสร็จของคำสั่งซื้อที่ชำระแล้ว แสดงรายการยา รูปยา ค่าส่ง ค่าธรรมเนียม และยอดรวมตรงกับคำสั่งซื้อ',
    'ถ้าขอใบกำกับใน C308 แล้ว C402 แสดงสถานะคำขอเดิมและป้องกันการขอซ้ำ',
    'เมื่อส่งคำขอแสดงสถานะและอีเมลปลายทางแบบปิดบางส่วน โหมดทดสอบไม่มีการส่งอีเมล',
    'ติ๊กต้องการใบกำกับเพื่อเลือกประเภทผู้รับในใบเสร็จ หากมีหลายรายให้เลือกใน C421 หากไม่มีให้เพิ่มผ่านฟอร์มเดียวกับบัญชี',
    'ขอได้หนึ่งครั้งภายในเดือนที่ชำระเงิน เกินกำหนดแสดงช่องทางติดต่อ LINE (C402.6) คำขอเดิมยังเปิดดูสถานะได้',
    'ปิดบางส่วนของเลขผู้เสียภาษีขณะเลือกผู้รับ รายการเก่าที่เปิดจากประวัติหรือใบสรุปใช้คำสั่งซื้อเดิม'],
  wait: ['ฝ่ายบัญชียืนยันข้อกำหนดเอกสารและระยะเวลาขอใบกำกับภาษีก่อนนำระบบจริงไปใช้'],
  prep(S) {
    const st = S.st.receipt || 'normal'; if (st === 'missing') return;
    if (!S._taxProfileMockInitialized) { if (!S.taxWho) S.taxWho={id:'1234567890121',name:'สมใจ ใจดี',first:'สมใจ',last:'ใจดี',phone:'0812345678',detail:'88/12 ซอยตัวอย่าง',prov:'กรุงเทพมหานคร',amp:'คลองเตย',dist:'คลองเตย',zip:'10110',country:'ไทย',addr:'88/12 ซอยตัวอย่าง แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110'}; S._taxProfileMockInitialized=true; }
    mockPaid(st === 'parcel' ? 'parcel' : 'pickup', st === 'parcel' ? 'card' : 'promptpay', st === 'late' ? '18/09/2026' : TP.NOW.date);
    S.rcNoAddr = false;
    C().order.tax = { done: null, pending: st === 'taxsent' ? (taxWho() || meTax()) : null, sentAt: st === 'taxsent' ? `${TP.NOW.date} 14:30 น.` : '', form: false, who: 'me' };
  },
  render(ctx) {
    const id = ctx.params?.id;
    /* the C402.7 preview case applies only to the preview link, never to a receipt opened for a real order id */
    let o = ctx.state === 'missing' && !id ? null : id ? rcOf(id) : rcOf() || order();
    if (!id && o && ctx.state === 'normal') {
      const items = [...TP.ORDER_ITEMS.map(i => ({...i})), {name:'ยาแก้ไอ ชนิดน้ำ', qty:'1 ขวด', price:90}];
      const total = items.reduce((sum, i) => sum + i.price, 0);
      o = {...o, items, total, paid:{...o.paid, items:total, total:total + (o.paid.ship || 0) + (o.paid.fee || 0)}, preview:true};
    }
    if (o && !id && ctx.state === 'taxsent') o = { ...o, tax: { ...(o.tax || {}), done: null, pending: taxWho() || meTax() } };
    ctx.rc = o;
    if (!o) return ui.nav({ back: true, title: 'ใบเสร็จรับเงิน' }) + ui.page(ui.empty({ icon: 'receipt', title: 'ไม่พบใบเสร็จนี้', body: 'การปรึกษานี้ไม่ได้ซื้อยา หรือยังไม่ได้ชำระเงิน', btn: { label: 'ดูประวัติ', a: 'rcHistory' } }));
    const pd = o.paid, late = isLate(pd.date);
    const record = id && (TP.orderCases(ctx.S).find(c => c.id === id) || ctx.S.history.find(h => h.id === id));
    const branch = TP.branch(id ? record?.branch : C()?.branch);
    const charges = [
      ['ยอดค่ายา', TP.money(pd.items ?? o.total)],
      ...(pd.discount ? [['ส่วนลด', '−' + TP.money(pd.discount)]] : []),
      ...(pd.ship ? [[SHIP_L(pd), TP.money(pd.ship)]] : []),
      ...(pd.fee ? [['ค่าธรรมเนียมบัตร (3.65%)', TP.money(pd.fee)]] : []),
    ];
    const doc = `<article class="rc-doc receipt-document" data-in="1" aria-label="ใบเสร็จรับเงิน เลขที่ ${esc(o.no)}">
      <header class="rc-hd">
      <span class="rc-logo">${brand.logo('wmen',{style:'width:128px;height:20.1px'})}</span>
      <h2>ใบเสร็จรับเงิน</h2><p>เอกสารตัวอย่างสำหรับทดสอบ</p>
      </header>
      <section class="receipt-seller"><span>ข้อมูลร้าน</span><b>${esc(branch?.name || 'MITRAREE')}</b>
        ${branch?.addr ? `<small>${esc(branch.previewAddr || branch.addr)}</small>` : ''}
        ${branch?.phone ? `<small>โทร ${esc(branch.phone)}</small>` : ''}
      </section>
      ${ui.kv([['เลขคำสั่งซื้อ',esc(o.no)], ['วันและเวลาชำระ',esc([pd.date,pd.at].filter(Boolean).join(' · '))], ['วิธีชำระเงิน',esc(methName(pd.method, pd.methodLabel))]])}
      <table class="rc-items receipt-table"><thead><tr><th scope="col">รายการ</th><th scope="col">จำนวน</th><th scope="col">จำนวนเงิน</th></tr></thead>
        <tbody>${o.items.map(item=>`<tr><td>${esc(item.name)}</td><td>${esc(item.qty)}</td><td class="num">${TP.money(item.price)}</td></tr>`).join('')}</tbody></table>
      ${ui.kv(charges)}<p class="rc-tt"><span>รวมทั้งสิ้น</span><b class="num">${TP.money(pd.total)}</b></p>
      </article>`;
    return ui.nav({ back: true, title: 'ใบเสร็จรับเงิน' }) + ui.page(doc + `<div id="rcTax" class="mt12" data-in="2">${taxBox(o, late)}</div>`, {cls:'receipt-page'});
  },
  mount(el) {
    el.addEventListener('input', e => { const fd = e.target.closest('#rcTax .field.err'); if (fd && e.target.value.trim()) { fd.classList.remove('err'); $('.pay-err', fd)?.remove(); } });
  }
});
/* One tax-invoice request per order (user 8 Nov 2026): at checkout (C308) or later from the receipt (C402).
   Once requested or issued, the receipt shows status only; there is no second request or re-issue. */
const whoOf = t => TP.taxRecipient(t.who || 'me',t.taxKey);
function taxBox(o, late) {
  const t = T(o);
  const [supportUrl, supportLabel] = TP.support;
  if (t.done || t.pending) {
    const accountEmail = /^([^@\s]+)@([^@\s]+)$/u.exec((TP.S.user.email || '').trim());
    const [name, domain] = accountEmail ? accountEmail.slice(1) : FX.demoInvoiceEmail.split('@');
    const local = [...name];
    const masked = `${local.slice(0, Math.min(2, local.length - 1)).join('')}***@${domain}`;
    const deliveryLabel = accountEmail ? (t.done?'ส่งใบกำกับภาษีไปที่':'จะส่งใบกำกับภาษีไปที่') : 'อีเมลปลายทางตัวอย่าง';
    return `<section class="rc-tax invoice-options">
      <h3 class="invoice-requested" role="status"><span class="rc-tax-sent-ic">${ic('check',14)}</span>${t.done?'ส่งใบกำกับภาษีทางอีเมลแล้ว':'ขอใบกำกับภาษีแล้ว'}</h3>
      <p class="invoice-delivery-email">${ic('mail',18)}<span>${deliveryLabel} ${esc(masked)}</span></p>
    </section>`;
  }
  if (late) return `<section class="rc-tax invoice-options" aria-label="ใบกำกับภาษี">
      <h3>เลยรอบขอใบกำกับภาษีในแอป</h3>
      <p class="small">แจ้งเลขคำสั่งซื้อกับฝ่ายบริการลูกค้าเพื่อประสานร้านยา</p>
      <a class="btn secondary" href="${supportUrl}" target="_blank" rel="noopener noreferrer">ติดต่อผ่าน ${esc(supportLabel)}</a>
    </section>`;
  return `<section class="rc-tax rc-tax-request-card invoice-options">
    ${TP.invoiceCheckbox('rcTaxWant',t.want,'ขอได้หนึ่งครั้งภายในเดือนที่ชำระเงิน')}
    ${t.want ? TP.invoiceOptions(t.who || 'me',t.taxKey,'rc') + ui.btn('ส่งคำขอใบกำกับภาษี',{a:'rcTaxSend',id:'rcTaxSend',disabled:!whoOf(t)}) : ''}
  </section>`;
}
const redrawTax = () => { const box = $('#rcTax'), o = rcCur(); if (!box || !o) return; box.innerHTML = taxBox(o, isLate(o.paid.date)); TP.icons(box); A(box, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { d: 320, e: E.out }); };
async function issue(b, o, who) {
  if (T(o).pending || T(o).done || T(o).sending) return;
  T(o).sending = true; b.disabled = true; b.classList.add('busy');
  await TP.wait(300);
  const t = T(o); t.sending = false; t.want = false; t.pending = {...who}; t.sentAt = `${TP.NOW.date} ${TP.NOW.time} น.`;
  redrawTax(); TP.notify('ขอใบกำกับภาษีแล้ว', { icon: 'check' });
}
TP.act('rcTaxWant', () => {
  const o=rcCur(); if(!o)return;
  const t=T(o);t.want=!t.want;redrawTax();$('#rcTax [data-a="rcTaxWant"]')?.focus({preventScroll:true});
});
TP.act('rcTaxKind', b => {const o=rcCur();if(!o)return;const t=T(o);if(t.who===b.dataset.v)return;Object.assign(t,{who:b.dataset.v,taxKey:null});redrawTax();$('#rcTax [aria-pressed="true"]')?.focus({preventScroll:true});});
TP.redrawReceiptTax = redrawTax;
TP.act('rcTaxSend', b => { const o = rcCur(); if (!o || isLate(o.paid.date)) return; const w = whoOf(T(o)); if (!w) return; return issue(b, o, w); });
TP.act('rcTaxPdf', () => {
  const o = rcCur(), tax = o && T(o), file = tax?.done?.pdfUrl;
  if (!file) { TP.notify('ยังไม่มีไฟล์ใบกำกับภาษีในต้นแบบ', { icon: 'file-text' }); return; }
  const url = new URL(file, location.href);
  if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) { TP.notify('ไม่สามารถดาวน์โหลดไฟล์นี้ได้'); return; }
  const link = document.createElement('a'); link.href = url.href; link.download = `tax-invoice-${o.no}.pdf`; document.body.appendChild(link); link.click(); link.remove();
});
TP.act('rcHistory', () => TP.tab('history'));
/* hooks 70-after.js calls: a receipt link under a paid history row, and a receipt row in its summary */
/* the pickup code stays findable after the case closes: home and the summary (real-user R2: "รหัสรับยาอยู่ไหน") */
TP.orderReadyRow = (S, o = {}) => {
  const c = S.case; if(c?.order?.fulfillment)return ''; if (!c || c.order?.status !== 'paid' || c.order.picked || (c.status !== 'closed' && !c.order.paid?.stage)) return '';
  const pd = c.order.paid || {}, pick = (pd.recv || 'pickup') === 'pickup', b = TP.branch(c.branch);
  if (o.ship && pick) return '';
  const code = (c.order.no || 'MT7K2Q9XR4A').slice(-4), st = pd.stage;
  const late = pick && pickLate(pd), title = pick ? (late ? `เลยกำหนดรับยา · รหัส ${code}` : st ? `ยาพร้อมรับแล้ว · รหัส ${code}` : `รหัสรับยา ${code}`) : `${pd.recv === 'express' ? 'จัดส่งด่วน' : pd.recv === 'cold' ? 'ส่งแบบควบคุมความเย็น' : 'จัดส่งพัสดุ'} · ${st ? (pd.recv === 'express' ? 'ไรเดอร์รับยาแล้ว' : 'ส่งแล้ว') : 'กำลังเตรียมยา'}`;
  const sub = pick ? (late ? `${b.name} · ร้านจะโทรหาเพื่อตกลงเรื่องยาและการคืนเงิน` : st ? `${b.name} · รับได้ถึง ${holdUntil(pd)}` : `${b.name} · แตะเพื่อดู QR และสถานะ`) : st && trackTxt(pd) ? `${trackTxt(pd)} · แตะเพื่อติดตาม` : 'แตะเพื่อดูสถานะคำสั่งซื้อ';
  return ui.group([ui.row({ icon: pick ? 'store' : pd.recv === 'cold' ? 'snowflake' : 'package', title, sub, go: 'track' })], { din: o.din });
};
TP.receiptSumRow = h => (h?.bought || h?._case?.order?.status === 'paid' || h?.order?.status === 'paid')
  ? ui.btn('ใบเสร็จรับเงิน', { icon: 'receipt', kind: 'secondary', go: 'receipt', p: { id: h.id }, cls: 'af-summary-receipt' }) : '';
})();

/* ===== 70-after.js ===== */
/* =====================================================================
   70 · After the consult + account (helper B)
        summary, history, ADR report + sent, inbox, account, household members,
        member edit, health record, consents, delete account, deleted, help
   ===================================================================== */
(() => {
const { $, $$, esc, ic, ui, brand, A, E, SP } = TP;
const MON = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

/* ---------- small helpers ---------- */
const first = n => String(n || '').trim().split(/\s+/)[0] || '';
const caseOpen = () => !!(TP.caseOpen && TP.caseOpen());
const plusYear = d => { const p = String(d || '').split('/'); return p.length === 3 ? `${p[0]}/${p[1]}/${+p[2] + 1}` : ''; };
const maskPhone = p => String(p || '').replace(/^(\d{3})-\d{3}-/, '$1-XXX-');
const RM = () => TP.RED();
/* collapsible region: grid rows 0fr -> 1fr, inert while closed so hidden controls are not tabbable */
const rv = (el, on) => { if (!el) return; el.classList.toggle('open', !!on); el.toggleAttribute('inert', !on); };
const rvHtml = (id, on, inner, cls = '') => `<div class="af-rv${on ? ' open' : ''}${cls ? ' ' + cls : ''}" id="${id}" ${on ? '' : 'inert'}><div><div class="af-rv-in">${inner}</div></div></div>`;
const shake = el => el && A(el, [{ transform: 'none' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-4px)' }, { transform: 'none' }], { d: 420, e: E.apple });
const pop = (el, delay = 0) => el && A(el, [{ transform: 'scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { d: SP.spring.d, e: SP.spring.e, delay, fill: 'backwards' });
const curEl = () => TP.cur()?.el;
/* avatar initial = first Thai consonant (or Latin letter) of the first name, same everywhere */
const iniOf = n => { const m = first(n).match(/[ก-ฮA-Za-z]/); return m ? m[0] : first(n).slice(0, 1); };
/* back label follows where Back really goes (the previous screen, else the parent) */
const BACK_L = { home: 'หน้าแรก', account: 'บัญชี', history: 'ประวัติ', intake: 'แจ้งอาการ', summary: 'ใบสรุป', inbox: 'แจ้งเตือน', health: 'ข้อมูลสุขภาพ' };
const backL = fb => BACK_L[TP.hist?.[TP.hist.length - 1]?.id || fb] || 'กลับ';
const personOf = id => !id || id === 'me' ? TP.S.user : TP.S.family.find(f => f.id === id);
function algTag(p) {
  const a = p?.allergies || [];
  if (a.length) return ui.tag(a.length > 1 ? `แพ้ยา ${a[0]} และอีก ${a.length - 1}` : `แพ้ยา ${a[0]}`, 'danger');
  return p?.allergyState === 'none' ? ui.tag('ไม่มีประวัติแพ้ยา', 'ok') : ui.tag('ยังไม่ได้ระบุแพ้ยา', 'warn');
}
const algText = p => { const a = p?.allergies || []; return a.length ? 'แพ้ยา ' + a.join(', ') : p?.allergyState === 'none' ? 'ไม่มีประวัติแพ้ยา' : 'ยังไม่ได้ระบุแพ้ยา'; };
TP.act('afCall', (t, c, e) => { e?.preventDefault(); TP.notify('กำลังโทร ' + (t.dataset.v || ''), { icon: 'phone' }); });
TP.act('afMail', (t, c, e) => { e?.preventDefault(); TP.notify('เปิดแอปอีเมลถึง dpo@mitraree.com', { icon: 'send' }); });
TP.act('afTabHistory', () => TP.tab('history'));
TP.act('afHome', () => TP.tab('home'));
const dpoLink = () => `<a class="link" href="mailto:dpo@mitraree.com" data-a="afMail">dpo@mitraree.com</a>`;

/* =====================================================================
   Consultation summaries (mock content written by the pharmacist console)
   ===================================================================== */
TP.SUMMARY = {
  'TC-261002-0087': {
    sym: 'ไข้ต่ำ ๆ ไอ เจ็บคอ เป็นมา 2 วัน · กลืนแล้วเจ็บ · ไม่มีหอบเหนื่อย',
    advice: ['ดื่มน้ำอุ่นบ่อย ๆ พักผ่อนให้เพียงพอ', 'กลั้วคอด้วยน้ำเกลืออุ่น วันละ 3-4 ครั้ง', 'เลี่ยงอาหารทอด ของเย็น และการใช้เสียงมาก'],
    meds: [
      { name: 'พาราเซตามอล 500 มก.', qty: '1 แผง', how: 'ครั้งละ 1 เม็ด เมื่อมีไข้ ห่างกันอย่างน้อย 6 ชั่วโมง ไม่เกิน 8 เม็ดต่อวัน' },
      { name: 'อะม็อกซีซิลลิน 500 มก.', qty: '2 แผง', how: 'ครั้งละ 1 แคปซูล วันละ 3 ครั้ง หลังอาหาร ทานจนหมด' }
    ],
    warn: ['หายใจลำบาก หรือเจ็บแน่นหน้าอก', 'ไข้สูงเกิน 39 องศา หรือไข้ไม่ลดภายใน 3 วัน', 'กลืนน้ำลายไม่ได้ หรืออ้าปากได้น้อย', 'มีผื่นขึ้น ปาก หน้า หรือตาบวมหลังใช้ยา'],
    follow: 'ถ้าอาการไม่ดีขึ้นใน 3 วัน ปรึกษาใหม่ได้ทุกเมื่อ'
  },
  'TC-260914-0031': {
    sym: 'ผื่นแดงเป็นจุดเล็ก ๆ ที่แขนและลำตัว คันมากตอนกลางคืน เป็นมา 1 วัน · ไม่มีไข้',
    advice: ['อาบน้ำด้วยน้ำอุ่น ใช้สบู่อ่อนสำหรับเด็ก', 'ตัดเล็บให้สั้น เลี่ยงการเกา', 'ใส่เสื้อผ้าฝ้ายเนื้อบาง สังเกตอาหารหรือของใช้ใหม่ที่อาจทำให้แพ้'],
    meds: [],
    warn: ['ผื่นลามเร็ว หรือเป็นตุ่มน้ำ', 'มีไข้ ซึม หรือไม่ยอมกินอาหาร', 'ปาก ตา หรือหน้าบวม หายใจมีเสียงวี้ด'],
    follow: 'ถ้าผื่นไม่ยุบใน 2 วัน ปรึกษาใหม่ หรือพบแพทย์'
  },
  'TC-260412-0012': {
    sym: 'ถามว่ายาแก้แพ้ใช้ร่วมกับยาเบาหวานที่ใช้ประจำได้ไหม · มีน้ำมูกใส จาม เป็นมา 3 วัน',
    advice: ['ใช้ร่วมกับเมทฟอร์มินได้ ไม่มีปฏิกิริยาระหว่างยาที่สำคัญ', 'ยาที่ได้รับไม่มีส่วนผสมของเพนิซิลลินที่แพ้', 'วัดน้ำตาลตามปกติ ถ้าค่าผิดไปจากเดิมมาก ปรึกษาใหม่ได้'],
    meds: [
      { name: 'ลอราทาดีน 10 มก.', qty: '1 แผง', how: 'ครั้งละ 1 เม็ด วันละ 1 ครั้ง ก่อนนอน ใช้ 5-7 วัน' },
      { name: 'น้ำเกลือล้างจมูก', qty: '1 ขวด', how: 'ล้างจมูกเช้าและก่อนนอน ข้างละ 10-20 มล.' }
    ],
    warn: ['ใจสั่น เวียนหัวมาก หรือหน้ามืด', 'ไข้สูง ปวดบริเวณใบหน้า หรือน้ำมูกเขียวข้นเกิน 10 วัน', 'น้ำตาลในเลือดสูงหรือต่ำผิดปกติ'],
    follow: 'นำยาที่ใช้ประจำมาให้เภสัชกรดูได้ทุกครั้งที่ปรึกษา'
  }
};

/* history + the just-closed case (if the room has not added it yet) */
function caseItem(c) {
  return { id: c.id, caseCode: TP.caseCode(c), note: c.note, date: c.date || TP.NOW.date, time: c.joinedAt || TP.NOW.time, who: c.who, topic: (c.symptoms || []).join(' ') || 'ถามเรื่องยา', branch: c.branch, pharm: c.pharm || 'kj', bought: c.order?.status === 'paid' ? (c.order.total || 0) : 0, orderStatus: c.order?.status || 'none', outcome:c.outcome, rated: c.rated || 0, comment: c.comment, fbSent: c.fbSent, summary: true, _case: c };
}
TP.orderHistoryRecord = caseItem;
function allHistory(S) {
  const c = S.case, out = [...S.history];
  if (c && c.status === 'closed' && !out.some(h => h.id === c.id)) out.unshift(caseItem(c));
  const pending = TP.pendingHistorySample?.(S);
  if(pending)out.unshift(pending);
  return out.filter(h=>!h.who||h.who==='me');
}
TP.consultationHistory = allHistory;
function sumOf(h) {
  if (h.previewSummary) return h.previewSummary;
  if (TP.SUMMARY[h.id]) return TP.SUMMARY[h.id];
  const S = TP.S, c = h._case || (S.case && S.case.id === h.id ? S.case : null);
  const sy = c ? (c.symptoms || []) : String(h.topic || '').split(' ').filter(Boolean);
  const items = c?.order?.status === 'paid' ? (c.order.items || []) : h.bought ? TP.ORDER_ITEMS.slice(0, 2) : [];
  const k = TP.casePlan?.(c || { who: h.who || 'me', symptoms: sy, note: '' });
  /* item 63: closed by silence before any advice (real-user 20/10 P0: the summary must not claim advice that was never given) */
  const quiet = c?.endWhy === 'noreply' && !!c.noAdvice && !items.length;
  return {
    ...(quiet ? { nomed: 'ไม่มียาในการปรึกษาครั้งนี้' } : {}),
    sym: [sy.join(' · '), c?.note].filter(Boolean).join(' · ') || 'ปรึกษาเรื่องการใช้ยา',
    advice: quiet ? ['การปรึกษาปิดก่อนเภสัชกรให้คำแนะนำ เพราะไม่มีข้อความจากคุณ 5 นาที', 'ยังมีอาการ ปรึกษาใหม่ได้ทันที ไม่มีค่าปรึกษา'] : [...(k?.adv || ['พักผ่อนให้เพียงพอ ดื่มน้ำมาก ๆ']), ...(items.length ? ['ใช้ยาตามวิธีที่ระบุและอ่านฉลากก่อนใช้ทุกครั้ง'] : [])],
    meds: items.map(i => ({ name: i.name || i.n || 'ยา', qty: i.qty || '', how: i.how || i.u || '', image: i.image, schedule: i.schedule })),
    warn: ['หายใจลำบาก หรือเจ็บแน่นหน้าอก', 'ไข้สูงเกิน 39 องศา หรือไข้ไม่ลดภายใน 3 วัน', 'มีผื่นขึ้น ปาก หน้า หรือตาบวมหลังใช้ยา'],
    follow: quiet ? 'ปรึกษาใหม่ได้ทุกเมื่อ' : 'ถ้าอาการไม่ดีขึ้นใน 3 วัน ปรึกษาใหม่ได้ทุกเมื่อ'
  };
}
TP.consultationSummary = sumOf;
function closedCase() {
  const items = TP.ORDER_ITEMS;
  return { id: 'TC-261018-0142', who: 'me', symptoms: ['ไข้', 'เจ็บคอ'], urgent: [], note: 'เป็นมา 2 วัน กลืนแล้วเจ็บ', photos: 0, mode: 'chat', branch: 'tw', pharm: 'kj', status: 'closed', pos: 0, joinedAt: '14:12', order: { status: 'paid', items, total: items.reduce((s, i) => s + i.price, 0) }, rated: 0, msgs: [] };
}

/* =====================================================================
   Summary (C13): the document
   ===================================================================== */
const summaryRated = h => {
  if (h.rated || h.fbSent) return true;
  try { return !flowPreview && !!sessionStorage.getItem('mitraree.summary.rating.' + h.id); } catch (_) { return false; }
};
/* C401 preview cases (user 8 Nov 2026) map to one fixture record each; real navigation always passes params.id. */
const SUMMARY_PREVIEW = { shipping: 'mock-history-flutter-dhl-2', delivered: 'mock-history-flutter-dhl-3', rated: 'mock-history-flutter-dhl-3', nomeds: 'mock-history-no-meds', 'nomeds-rated': 'mock-history-no-meds', cancelled: 'mock-history-flutter-pickup-4' };
function summaryTarget(ctx) {
  const S = ctx.S, st = ctx.state, all = allHistory(S);
  if (st === 'missing') return null;
  if (ctx.params.historyOutcome) return all.find(h => h.summary && historyOutcome(S, h).key === ctx.params.historyOutcome) || null;
  let id = ctx.params.id || SUMMARY_PREVIEW[S.st.summary];
  if (!id && S.case?.status === 'closed') id = S.case.id;
  return id ? all.find(h => h.id === id) : all[0];
}
function docHtml(S, h, options = {}) {
  const P = TP.PHARM[h.pharm] || TP.PHARM.kj, b = TP.branch(h.branch) || TP.branch(), sm = sumOf(h);
  const who = historyIdentity(S,h.who,h).name;
  const visitCase = h._case || (S.case?.id === h.id ? S.case : null) || (h.order ? {order:h.order} : null);
  const order = visitCase?.order, paid = order?.paid;
  const fulfillment = TP.fulfillmentInfo?.(visitCase);
  const orderNumber = order?.no || h.orderNo || TP.orderNumber(h);
  const delivered = fulfillment?.done || order?.picked || paid?.got || paid?.deliv;
  const pickup = (paid?.recv || h.recv) === 'pickup';
  let deliveryStatus = order?.statusLabel || '';
  if (!deliveryStatus) {
    if (delivered) deliveryStatus = pickup ? 'รับยาที่สาขาแล้ว' : 'จัดส่งสำเร็จแล้ว';
    else if (pickup && paid) deliveryStatus = paid.stage === 'ready' ? 'พร้อมรับที่สาขา' : 'กำลังเตรียมยา';
    else if (fulfillment) deliveryStatus = fulfillment.title;
    else if (paid) deliveryStatus = paid.stage ? 'จัดส่งแล้ว' : 'กำลังเตรียมยา';
    else if (h.bought) deliveryStatus = 'ไม่มีข้อมูลสถานะ';
  }
  const cancelled = options.cancelled;
  const receipt = options.hideReceipt || cancelled ? '' : TP.receiptSumRow?.({...h, order}) || '';
  const payment = paid && !cancelled;
  const facts = [
    ['วันและเวลา',[h.date,h.time].filter(Boolean).join(' · ')],
    ['ผู้รับบริการ',who],['สาขา',b.name],['เภสัชกร',P.name],['เลขใบอนุญาต',P.lic],
    ['วิธีรับยา', order?.deliveryLabel || (paid && TP.deliveryMethodName ? TP.deliveryMethodName(paid) : h.recv === 'pickup' ? 'รับที่ร้าน' : h.recv === 'express' ? 'Lalamove' : h.courier === 'dhl' ? 'DHL' : h.courier === 'flash' ? 'Flash Express' : '')],
    ['สถานะจัดส่ง',cancelled ? '' : deliveryStatus]
  ];
  return `<article class="af-visit" aria-label="ใบสรุปการปรึกษา">
    ${options.hideHero ? '' : `<header class="af-visit-hero${cancelled ? ' af-visit-hero-cancelled' : ''}">
      <div><span>${cancelled ? 'ยกเลิกคำสั่งซื้อ' : delivered ? esc(deliveryStatus) : 'สรุปการรับบริการ'}</span>
      <h2>คำสั่งซื้อ #${esc(orderNumber)}</h2>
      <small>${esc(h.date)}${h.time?' · '+esc(h.time)+' น.':''}</small></div>
      <img src="/assets/illustrations/${cancelled ? 'order-cancelled-white-v2.png' : 'order-status-ready-vector-v4.webp'}" alt="" width="104" height="104">
    </header>`}
    <section class="card af-visit-section af-visit-concern"><h3>${ic('message-circle',20,1.8)} เรื่องที่ปรึกษา</h3>
      <p class="consultation-note">${esc(TP.consultationText(h) || 'ไม่มีข้อความอาการที่บันทึกไว้')}</p>
    </section>
    <section class="card af-visit-section"><h3>${ic('clipboard-list',20,1.8)} ข้อมูลการรับบริการ</h3>
      <dl class="af-visit-facts">${facts.filter(([,value])=>value).map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>

    </section>
    <section class="card af-visit-section"><h3>${ic('pill',20,1.8)} ข้อมูลยา</h3>
      ${paid && order.items?.length ? TP.orderMedicineList(order) : sm.meds.length ? TP.orderMedicineList({items: sm.meds.map(m => ({...m, how: m.schedule?.length ? m.schedule.map(row => [row.time === 'เมื่อมีอาการ' ? '' : row.time, row.instruction].filter(Boolean).join(' · ')).join(' / ') : m.how}))}, {showPrice: false}) : `<p>${esc(sm.nomed || 'ไม่มียาที่ได้รับในการปรึกษาครั้งนี้')}</p>`}
    </section>
    <section class="card af-visit-section af-visit-advice"><h3>${ic('file-text',20,1.8)} คำแนะนำจากเภสัชกร</h3><p class="af-advice-text">${esc([visitCase?.pharmacistAdvice || (Array.isArray(sm.advice) ? sm.advice.join("\n") : (sm.advice || "")), sm.follow].filter(Boolean).join("\n\n"))}</p>
    </section>

    ${payment ? TP.paymentHistoryCard(orderNumber, paid, receipt) : receipt}

  </article>`;
}
TP.summaryForCase = (c, options = {}) => {
  if (!c) return '';
  const record = allHistory(TP.S).find(item => item.id === c.id) || caseItem(c);
  const h = {...record, _case: c};
  return TP.historyDetailContent(TP.S, h, options);
};
function rateHtml(h) {
  if (summaryRated(h)) { const n = Math.max(0, Math.min(5, Number(h.rated) || 0)); return `<section class="card af-rate" data-in="2" aria-label="คะแนนที่ให้แล้ว"><h3 class="h3">ให้คะแนนแล้ว</h3><p class="small">${n ? `${n} จาก 5 ดาว · ` : ''}ขอบคุณที่ช่วยให้เราปรับปรุงบริการ</p></section>`; }
  return `<section class="card af-rate" data-in="2" aria-label="ให้คะแนนการปรึกษา">
    <h3 class="h3">ให้คะแนนการปรึกษาครั้งนี้</h3>
    <p class="small">แตะดาวเพื่อส่งคะแนน</p>
    <div class="af-stars">${[1,2,3,4,5].map(n=>`<button type="button" class="af-star" data-a="afRate" data-v="${n}" aria-label="ให้ ${n} ดาว จาก 5">${ic('star',26,1.6)}</button>`).join('')}</div>
  </section>`;
}
/* C401 (user 8 Nov 2026): every finished consultation can be rated; a paid order also links its receipt;
   a cancelled consultation (customer ended or no reply) shows only its cancelled status. */
TP.historyDetailContent = (S, h, options = {}) => {
  const cancelled = historyOrderStatus(S, h)?.key === 'cancelled';
  return docHtml(S, h, {...options, cancelled}) + (cancelled ? '' : rateHtml(h));
};
TP.screen('summary', {
  group: 'after', title: 'ใบสรุปการปรึกษา', code: 'C401', ref: 'C13', parent: 'history',
  states: [['shipping', 'มียา · กำลังจัดส่งยา'], ['delivered', 'มียา · จัดส่งสำเร็จแล้ว'], ['rated', 'มียา · ให้คะแนนแล้ว'], ['nomeds', 'ไม่มียา · ปรึกษาอย่างเดียว'], ['nomeds-rated', 'ไม่มียา · ให้คะแนนแล้ว'], ['cancelled', 'ยกเลิก'], ['missing', 'ไม่พบใบสรุป']],
  notes: ['ใช้ข้อมูลรายละเอียดประวัติชุดเดียวกัน: เรื่องที่ปรึกษา ข้อมูลบริการ ยาและวิธีใช้ คำแนะนำ ยอดชำระและใบเสร็จ ระหว่างรับยา/จัดส่งแสดงสถานะกับข้อมูลเฉพาะวิธีรับยาไว้บนสุด เมื่อสาขาหรือขนส่งแจ้งสำเร็จจะตัดส่วนติดตามออก เหลือประวัติเดิม ไม่มีการยืนยันรับยาโดยผู้ใช้', 'แยกข้อมูลรับบริการ ยาที่ได้รับ คำแนะนำ และการติดตาม','ได้ใบสรุปทุกครั้ง แม้ไม่ได้ซื้อยา','ให้ดาวได้ครั้งเดียวต่อเคสและซ่อนหลังส่ง','เก็บใบสรุป 1 ปีนับจากวันปิดเคส'],
  wait: ['ข้อความในใบสรุปจริงมาจากคอนโซลเภสัชกร (ตอนนี้เป็นตัวอย่าง)'],
  prep(S) {
    const st = S.st.summary; if (!st) return;
    const c = TP.cur(); if (c?.id === 'summary') delete c.params.id;
    if (!S.history.length) S.history = TP.fresh().history;
    S.history = TP.fresh().history;
    if (['rated','nomeds-rated'].includes(st)) Object.assign(S.history.find(h => h.id === SUMMARY_PREVIEW[st]) || {}, { rated: 5, fbSent: true });
  },
  render(ctx) {
    const S = ctx.S, h = ctx.h = summaryTarget(ctx);
    const nav = ui.nav({ title: 'ใบสรุปการปรึกษา', left: `<button type="button" class="back" data-back aria-label="ย้อนกลับ">${ic('chevron-left',22,2)}<span>${esc(backL('history'))}</span></button>` });
    if (!h) return nav + ui.page(ui.empty({ icon: 'file-text', title: 'ไม่พบใบสรุปนี้', body: 'ใบสรุปเก็บ 1 ปีนับจากวันปิดเคส', btn: { label: 'ดูประวัติ', a: 'afTabHistory' } }));
    const caseForSummary = h._case || (S.case?.id === h.id ? S.case : null);
    return nav + ui.page(TP.historyDetailContent(S,h) +
      (caseForSummary ? TP.paymentReminderCard?.(S, caseForSummary) || '' : ''),
      {cls:'order-summary-page'});
  }
});
TP.act('afRate', (t, ctx) => {
  const h = ctx?.h, n = Number(t.dataset.v);
  if (!h || !Number.isInteger(n) || n < 1 || n > 5 || summaryRated(h)) return;
  h.rated = n;
  const c = h._case || TP.S.case;
  if (c?.id === h.id) c.rated = n;
  try { if (!flowPreview) sessionStorage.setItem('mitraree.summary.rating.' + h.id, String(n)); } catch (_) {}
  const rating = t.closest('.af-rate');
  if (rating) rating.outerHTML = rateHtml(h);
  TP.emit('state');
  TP.notify('ขอบคุณสำหรับคะแนน', {icon:'check'});
});

/* =====================================================================
   History (C14): tab root
   ===================================================================== */
/* Patient identity is explicit even when a member has been removed. */
function historyIdentity(S, who = 'me', record = {}) {
  if (!who || who === 'me') return { id:'me', name:S.user.full || S.user.name || 'ตัวเอง', rel:'ตัวเอง', image:TP.profileImage('me') };
  const f = S.family.find(f=>f.id===who);
  return f ? {id:f.id,name:f.name,rel:f.rel || 'สมาชิกในครอบครัว',image:TP.profileImage(f.id)} : {id:who,name:record.whoName || record.patientName || 'สมาชิกเดิม',rel:'ไม่อยู่ในรายชื่อปัจจุบัน',image:''};
}
function historyStamp(h) {
  const [d,m,y] = String(h.date || '').split('/').map(Number), [hour,min] = String(h.time || '00:00').split(':').map(Number);
  return Date.UTC(y > 2400 ? y-543 : y,m-1,d,hour || 0,min || 0) || 0;
}
/* Consultation outcome never depends on medicine purchase or payment. */
function historyOutcome(S,h) {
  const c=h._case || (S.case?.id===h.id?S.case:null),last=c?.msgs?.filter(m=>m.kind==='summary').at(-1);
  const key=h.outcome || c?.outcome || (c?.endWhy==='noreply'?'no-response':last?.by==='me'?'customer-ended':last?.by==='auto'?'no-response':last?.by==='ph'?'completed':h.summary?'completed':'unknown');
  const order = c?.order || h.order;
  const finalKey = key === 'customer-ended' ? 'customer-ended'
    : order?.status === 'expired' ? 'payment-expired'
    : order?.status === 'cancelled' ? 'order-cancelled'
    : TP.completedMedicationOrder?.(S, h) ? 'order-complete'
    : key;
  const details = {
    'payment-expired': ['หมดเวลาชำระเงิน', 'ไม่ได้ชำระเงินภายในเวลาที่กำหนด'],
    'order-complete': ['รับยาแล้ว', 'ชำระเงินและรับยาเรียบร้อยแล้ว'],
    'declined-medicine': ['ปรึกษาสำเร็จ · ไม่รับยา', 'ปรึกษาเรียบร้อย ผู้รับบริการแจ้งว่าไม่รับยา'],
    'no-medicine': ['ปรึกษาสำเร็จ · ไม่มีรายการยา', 'เภสัชกรให้คำแนะนำโดยไม่มีการจ่ายยา'],
    'order-cancelled': ['ยกเลิกแล้ว', 'คำสั่งซื้อถูกยกเลิก'],
    completed: ['ปรึกษาสำเร็จ', 'เภสัชกรสรุปและจบการปรึกษาแล้ว'],
    'customer-ended': ['ยกเลิก', 'คุณยกเลิกการปรึกษานี้'],
    'no-response': ['สิ้นสุดการสนทนา', 'สิ้นสุดการสนทนา เนื่องจากไม่มีการตอบกลับภายใน 5 นาที'],
  };
  const [detailLabel, reason] = details[finalKey] || ['', 'ไม่มีข้อมูลผลการปรึกษาเดิม'];
  if (['order-complete', 'declined-medicine', 'no-medicine', 'completed'].includes(finalKey)) {
    return {key, label:'สำเร็จ', tone:'ok', detailLabel, reason};
  }
  return {key:Object.hasOwn(details, key) ? key : 'unknown', label:finalKey === 'customer-ended' ? 'ยกเลิก' : finalKey === 'order-cancelled' ? 'ยกเลิกแล้ว' : 'สิ้นสุด', tone:'muted', detailLabel, reason};
}
function historyOrderStatus(S,h) {
  const c=S.case?.id===h.id?S.case:h._case,o=c?.order||h.order;
  if(c)TP.expireOrder?.(c);
  if(o?.status==='pending'&&o.payment)return {key:'shipping',label:'รอชำระเงิน',tone:'warn'};
  const cancelled=['customer-ended','no-response','payment-expired','order-cancelled'].includes(h.outcome||c?.outcome)||['expired','cancelled'].includes(o?.status||h.orderStatus);
  if(cancelled)return {key:'cancelled',label:'คำสั่งซื้อถูกยกเลิก',tone:'danger'};
  const paid=o?o.status==='paid':h.orderStatus?h.orderStatus==='paid':Number(h.bought)>0;
  if(!paid)return null;
  const paidDetails = o?.paid, pickup = paidDetails?.recv === 'pickup';
  if (!historyInProgress(S,h)) return {key:'completed',label:o?.statusLabel || (pickup?'รับยาที่สาขาแล้ว':paidDetails?.recv?'จัดส่งสำเร็จ':'คำสั่งซื้อสำเร็จ'),tone:'ok'};
  const phase = paidDetails?.recv === 'express' ? o.fulfillment?.status || paidDetails.stage : paidDetails?.stage;
  const phaseLabel = { preparing: 'กำลังเตรียมยา', ready: 'ยาพร้อมรับที่สาขา', packed: 'ส่งให้บริษัทขนส่งแล้ว',
    out: 'กำลังนำส่ง', calling: 'กำลังเรียกไรเดอร์', delivering: 'กำลังจัดส่ง' }[phase];
  return {key:'shipping',label:o?.statusLabel || phaseLabel || TP.fulfillmentInfo?.(c)?.title || 'กำลังจัดส่ง',tone:'warn'};
}
function historyItems(S, who = S._histWho || 'all', list = allHistory(S)) {
  const q=String(S._histQuery||'').trim().toLocaleLowerCase('th'),type=['all','shipping','completed','cancelled'].includes(S._histStatus)?S._histStatus:'all';
  return list.filter(h => {
    if ((h.who || 'me') !== 'me') return false;
    const {key, label, detailLabel, reason} = historyOutcome(S, h);
    const order=(S.case?.id===h.id?S.case:h._case)?.order||h.order;
    if(order?.status==='pending'&&!order.payment)return false;
    if(type!=='all'&&(historyOrderStatus(S,h)?.key||'completed')!==type)return false;
    return !q || [TP.caseCode(h), TP.consultationText(h), h.topic, h.date, h.id,
      TP.PHARM[h.pharm]?.name, TP.PHARM[h.pharm]?.short, TP.branch(h.branch)?.name,
      label, detailLabel, reason].join(' ').toLocaleLowerCase('th').includes(q);
  }).sort((a,b) => historyStamp(b) - historyStamp(a));
}
function historyFilterOptions() {
 return [['all','ทั้งหมด'],['shipping','ดำเนินการ'],['completed','สำเร็จ'],['cancelled','ยกเลิก']];
}

function liveCard(c) {
  const room = ['matched','room'].includes(c.status), p = historyIdentity(TP.S,c.who,c), pharmacist = TP.PHARM[c.pharm || 'kj'] || TP.PHARM.kj;
  const status = c.status === 'room' ? 'กำลังปรึกษา' : c.status === 'matched' ? 'เภสัชกรรับเคสแล้ว' : c.status === 'paused' ? 'เภสัชกรพักชั่วคราว' : 'อยู่ในคิว';
  return `<button type="button" class="history-live" ${ui.route({go:room?'room':'queue',via:'cover'})}><span class="history-live-person">${ic('message-circle',20,2)}<b>${esc(p.name)} · ${esc(p.rel)}</b></span>${ui.tag(status,'info',{dot:true})}<span>${esc(pharmacist.short)} · กลับไป${room?'ห้องปรึกษา':'ดูคิว'} ${ic('arrow-right',16,2)}</span></button>`;
}
TP.completedMedicationOrder = (S, h) => {
  const c = S.case?.id === h.id ? S.case : h._case;
  const order = c?.order || h.order;
  if (order?.status !== 'paid' || historyInProgress(S, h)) return null;
  return order.picked || order.paid?.got || order.paid?.deliv || TP.fulfillmentInfo?.(c)?.done ? order : null;
};
function histItem(h) {
  const S=TP.S, person=historyIdentity(S,h.who,h);
  const c=S.case?.id===h.id?S.case:h._case,o=c?.order||h.order;
  if(c)TP.expireOrder?.(c);
  const outcome=historyOutcome(S,h);
  const payable=!!(o&&TP.orderPayable?.(o));
  const orderNumber=o?.no||h.orderNo||TP.orderNumber?.(c||h);
  const paid=o?o.status==='paid':h.orderStatus?h.orderStatus==='paid':Number(h.bought)>0;
  const status=historyOrderStatus(S,h);
  const matchesFlutter = FX.isAddedOrder(h);
  const awaiting=o?.status==='pending'&&o.payment;
  const paidAmount=awaiting ? o.payment.totals.total : paid && (!matchesFlutter || status?.key==='completed') ? (o?.paid?.total ?? o?.total ?? h.bought) : null;
  const destination=ui.route(awaiting ? {a:'openOrderPayment',p:{caseId:h.id}} : status?.key==='shipping'
    ? {a:'viewFulfillment',p:{caseId:h.id}}
    : {go:'summary',p:{id:h.id}});
  const items=o?.items || h.previewSummary?.meds;
  const itemText=Array.isArray(items)?items.length+' รายการ':'0 รายการ';
  const branchName=TP.branch(c?.branch||h.branch)?.name||'—';
  const snapshot = o?.paid || o?.payment;
  const recv = snapshot?.recv || h.recv, courier = snapshot?.courier || h.courier;
  const delivery = o?.deliveryLabel || (recv === 'pickup' ? 'รับที่ร้าน' : recv === 'express' ? 'Lalamove'
    : recv === 'parcel' ? ({ dhl: 'DHL', flash: 'Flash Express' }[courier] || 'จัดส่งพัสดุ') : '');
  return `<article class="history-card${payable?' history-card-payable':''}" data-history-id="${esc(h.id)}">
    <header class="history-order-head">
      <span class="history-order-icon" aria-hidden="true">${ic('package',23,1.8)}</span>
      <div class="history-order-identity"><span>เลขคำสั่งซื้อ</span><div><b class="num">${orderNumber?esc(orderNumber):'การปรึกษา'}</b></div></div>
      <span class="history-order-status">${status?ui.tag(status.label,status.tone):''}${ic('chevron-right',17,1.8)}</span>
    </header>
    <button type="button" class="history-card-open" ${destination} aria-label="ดูข้อมูลคำสั่งซื้อ ${esc(orderNumber || h.id)} ${esc(person.name)} วันที่ ${esc(h.date)}">
      <span class="history-order-row"><span>ร้านยาที่สั่งซื้อ</span><b>${esc(branchName)}</b></span>
      <span class="history-order-row"><span>วันที่สั่งซื้อ</span><b>${esc(h.date)} · ${esc(h.time)} น.</b></span>
      ${delivery ? `<span class="history-order-row"><span>วิธีรับยา</span><b>${esc(delivery)}</b></span>` : ''}
      ${!matchesFlutter || items?.length ? `<span class="history-order-row"><span>จำนวนที่สั่ง</span><b>${esc(itemText)}</b></span>` : ''}
      ${paidAmount!=null?`<span class="history-order-row history-order-price"><span>ราคา</span><b class="num">${esc(TP.money(paidAmount))}</b></span>`:''}
    </button>${payable&&!awaiting?`<div class="history-payment-action"><button type="button" class="btn primary history-payment-button" ${ui.route({a:'openOrderPayment',p:{caseId:h.id}})}>${ic('credit-card',19,1.8)}<span>ข้อมูลชำระเงิน</span><span class="history-payment-countdown">${ic('clock',16,1.8)}<b data-order-countdown data-order-case="${esc(h.id)}">${TP.orderRemaining(o)}</b></span>${ic('chevron-right',17,2)}</button></div>`:''}</article>`;
}

function historyInProgress(S,h) {
  const c = S.case?.id === h.id ? S.case : h._case, o = c?.order || h.order;
  if (c && !['closed','cancelled','declined','expired','branchclosed'].includes(c.status)) return true;
  if (o?.status === 'pending') { if(c) TP.expireOrder?.(c); return o.status === 'pending'; }
  if (o?.status !== 'paid') return false;
  const f = TP.fulfillmentInfo?.(c);
  if (f) return !f.done;
  return !!o.paid && !(o.picked || o.paid.got || o.paid.deliv);
}
function listHtml(S,who) {
  const legacy = S.st?.history === 'legacy';
  const records = allHistory(S).filter(record => FX.isLegacyOrder(record) === legacy);
  const items=historyItems(S,who,records);
  if(!items.length) return `<div class="history-empty">${ui.emptyArt('file-search')}<h3>ไม่พบประวัติที่ตรงกัน</h3><p>${who==='all'?'ลองเปลี่ยนคำค้นหาหรือตัวกรอง':'ยังไม่มีประวัติที่ตรงกับตัวกรอง'}</p><button type="button" class="txtbtn" data-a="afHistClear">ล้างคำค้นหาและตัวกรอง</button></div>`;
  const active = [], finished = [], groups = [];
  for (const record of items) {
    if (!historyInProgress(S, record)) finished.push(record);
    else if (record.id === 'mock-pending-payment') active.unshift(record);
    else active.push(record);
  }
  finished.forEach(h=>{const [,m,y]=String(h.date).split('/'),key=`${MON[+m-1] || ''} ${y || ''}`.trim();let g=groups.find(g=>g.key===key);if(!g)groups.push(g={key,items:[]});g.items.push(h)});
  return (active.length ? `<section class="history-month"><h3>คำสั่งซื้อกำลังดำเนินการ</h3><div>${active.map(h=>{const c=S.case?.id===h.id?S.case:h._case;if(!c)return histItem(h);if(c.order?.status==='paid')return histItem(h);if(c.status==='closed'&&c.order?.status==='pending')return histItem(h);return TP.homeActiveCaseCard?.({...S,case:c})||histItem(h)}).join('')}</div></section>` : '') + groups.map(g=>`<section class="history-month"><h3>${esc(g.key)}</h3><div>${g.items.map(histItem).join('')}</div></section>`).join('');
}
/* Maximum-family cases are view-only fixtures, never written to the account. */
function historyView(S) { return {...S,_histWho:'me'}; }
function historySelector(S) { S._histWho='me';return ''; }
function historyChoose(who) {
  const S=TP.S;who='me';
  if(who!=='all' && who!=='me' && !historyView(S).family.some(f=>f.id===who))return;
  const left=$('.history-profile-list',curEl())?.scrollLeft || 0;
  S._histWho=who;
  return TP.refresh({anim:false}).then(()=>{
    const el=curEl(),strip=$('.history-profile-list',el);
    if(strip)strip.scrollLeft=left;
    $$('.history-profile',el).find(button=>button.dataset.v===who)?.focus({preventScroll:true});
  });
}
function historyClampNotes(el) {
  const notes=$$('.history-detail-note',el);
  const measure=note=>note.classList.toggle('is-truncated',note.scrollHeight>note.clientHeight+1);
  el._historyNoteObserver?.disconnect();
  if(typeof ResizeObserver!=='undefined') {
    el._historyNoteObserver=new ResizeObserver(entries=>entries.forEach(entry=>measure(entry.target)));
    notes.forEach(note=>el._historyNoteObserver.observe(note));
  }
  notes.forEach(measure);
}
function historyUpdateResults(el,S) {
  const labels=new Map(historyFilterOptions(S));
  $$('[data-segname=histStatus] button',el).forEach(button=>{button.textContent=labels.get(button.dataset.v) || button.textContent;button.setAttribute('aria-pressed',String(button.dataset.v===S._histStatus))});
  const results = $('#afHL',el);
  if (results) {
    results.innerHTML = listHtml(S,S._histWho || 'all');
    TP.icons(results);
    historyClampNotes(el);
  }
  const list = $('.history-list-scroll',el);
  if (list) list.scrollTop = 0;
}
TP.screen('history', {
  group:'after',title:'ประวัติคำสั่งซื้อ',code:'C403',ref:'C14',tab:'history',
  // Order badges: paid awaiting receipt = กำลังจัดส่ง; received = คำสั่งซื้อสำเร็จ; customer-ended/expired = ยกเลิกคำสั่งซื้อ.
  states:[["normal", "ทั้งหมด"], ["tab-shipping", "ดำเนินการ"], ["tab-completed", "สำเร็จ"], ["tab-cancelled", "ยกเลิก"], ["empty", "ไม่มีข้อมูลการสั่งซื้อ"], ["loading", "กำลังโหลด"], ["error", "โหลดไม่สำเร็จ"], ["legacy", "ชุดข้อมูลทดสอบเดิม"]],
  notes:['แสดงประวัติของเจ้าของบัญชีเท่านั้น','แท็บบนสุดกรอง ทั้งหมด รอจัดส่ง สำเร็จ ยกเลิก ตามสถานะคำสั่งซื้อ ใช้ร่วมกับคำค้นหาได้ เรียงล่าสุดก่อน แบ่งตามเดือน','เคสที่กำลังดำเนินอยู่เปิดต่อจากแถบล่าง ส่วนประวัติแสดงการปรึกษาที่จบแล้ว','ใบสรุปและทางลัดติดตามยาใช้รหัสการปรึกษาเดิม','การ์ดคำสั่งซื้อแบบย่อ: ไอคอน เลขคำสั่งซื้อ สถานะ วันเวลา จำนวนรายการยาและยอดชำระจริง แสดงร้านยา วันที่สั่งซื้อ จำนวนรายการและราคาที่ชำระ ไม่มีอาการบนการ์ด กดการ์ดเปิดข้อมูลเต็ม; รายการรอจ่ายมีปุ่มชำระแยกต่างหาก'],
  prep(S) {
    const st=S.st.history;S._histStatus='all';
    if(!st)return;
    if (st === 'empty') {
      S.history = [];
      if (S.case && !caseOpen()) S.case = null;
    } else {
      const ids = new Set(S.history.map(record => record.id));
      S.history.push(...TP.fresh().history.filter(record => !ids.has(record.id)));
    }
    S._histWho='me';S._histStatus='all';S._histQuery='';S._histSearchOpen=false;
    if(['customer-ended','no-response'].includes(st)){S.history=TP.fresh().history.map((h,i)=>({...h,outcome:i===0?st:h.outcome}));S._histStatus='cancelled';}
    if(st.startsWith('tab-'))S._histStatus=st.slice(4);
    if(['pending-order','expired-order','cancelled-order'].includes(st)){S.case=closedCase();S.case.date=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date());S.case.order.awaitingCheckout=false;S.case.order.status=st==='pending-order'?'pending':st==='expired-order'?'expired':'cancelled';S.case.order.expiresAt=Date.now()+(st==='expired-order'?-1:15*60*1000)}
  },
  render(ctx) {
    /* C403 (user 8 Nov 2026): four status tabs, no search; tabs stay visible on loading and error */
    const S=historyView(ctx.S),st=ctx.state;
    const nav=ui.nav({title:'ประวัติคำสั่งซื้อ'});
    const tabs=`<div class="history-status-tabs">${ui.seg('histStatus',historyFilterOptions(S),S._histStatus||'all',{a:'afHistStatus',label:'กรองสถานะคำสั่งซื้อ'})}</div>`;
    let content;
    if (st === 'loading') content = `<div class="history-loading" aria-busy="true" aria-label="กำลังโหลดประวัติ">${ui.skel('100%',210,16)}${ui.skel('100%',210,16)}</div>`;
    else if (st === 'error') content = `<div class="history-empty history-error" role="alert">${ui.emptyArt('history')}<h3>โหลดประวัติคำสั่งซื้อไม่สำเร็จ</h3><p>ข้อมูลที่บันทึกไว้ยังอยู่ ลองโหลดอีกครั้ง</p>${ui.btn('ลองอีกครั้ง',{a:'afHistRetry'})}</div>`;
    else if (allHistory(S).length) content = `<div id="afHL">${listHtml(S,S._histWho)}</div>`;
    else content = `<div class="history-empty">${ui.emptyArt('history')}<h3>ไม่มีข้อมูลการสั่งซื้อ</h3><p>ใบสรุปการปรึกษาและคำสั่งซื้อยาจะแสดงที่นี่หลังปรึกษาเภสัชกร</p>${ui.btn('ดูร้านยาใกล้ฉัน',{a:'afHome',iconRight:'arrow-right'})}</div>`;
    return nav + tabs + ui.page(`<div class="history-page">${content}</div>`, {cls:'history-list-scroll'});
  },
  mount(el,ctx) {
    historyClampNotes(el);ctx.onLeave?.(()=>el._historyNoteObserver?.disconnect());
    if(ctx.state==='loading')ctx.later(()=>{ctx.S.st.history='normal';TP.refresh()},1800);
    else ctx.later(()=>{
      const strip=$('.history-profile-list',el);if(!strip)return;
      const selected=$('[aria-pressed=true]',strip);if(!selected)return;
      const item=selected.getBoundingClientRect(),box=strip.getBoundingClientRect();
      if(item.right>box.right)strip.scrollLeft+=item.right-box.right;
      else if(item.left<box.left)strip.scrollLeft-=box.left-item.left;
    },0);
  }
});
TP.act('afHistStatus',t=>{TP.S._histStatus=t.dataset.v;historyUpdateResults(curEl(),TP.S)});
TP.act('afHistWho',t=>historyChoose(t.dataset.v));
TP.act('afHistClear',()=>{TP.S._histQuery='';TP.S._histStatus='all';TP.refresh({anim:false})});
TP.act('afHistRetry',()=>{TP.S.st.history='normal';TP.refresh({anim:false})});

/* =====================================================================
   Inbox (A13): in-app notifications, neutral wording only
   ===================================================================== */
const inboxVisible = n => !['account','address','health','news'].includes(n.kind);
const KIND_IC = { summary:'file-text',news:'bell',queue:'clock',msg:'message-circle',order:'receipt',pay:'receipt',delivery:'truck',address:'map-pin',account:'user',health:'heart-pulse' };
function inboxDate(n){
 let text=String(n.time||''),match=text.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
 if(n.createdAt||/^\d{4}-\d{2}-\d{2}T/.test(text)){const instant=new Date(n.createdAt||text);if(Number.isFinite(instant.getTime())){text=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(instant).replace(',','');match=text.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);}}
 if(!match)return {key:'unknown',stamp:-Infinity,label:'ก่อนหน้านี้',time:text,iso:''};
 const [,d,m,y,hh='00',mm='00']=match,date=new Date(Date.UTC(+y,+m-1,+d));
 if(date.getUTCDate()!==+d||date.getUTCMonth()!==+m-1||+hh>23||+mm>59)return {key:'unknown',stamp:-Infinity,label:'ก่อนหน้านี้',time:text,iso:''};
 const key=`${y}-${m}-${d}`;
 return {key,stamp:date.getTime()+(+hh*60+ +mm)*60000,label:new Intl.DateTimeFormat('th-TH',{calendar:'gregory',timeZone:'UTC',day:'numeric',month:'long',year:'numeric'}).format(date),time:hh+':'+mm,iso:key+'T'+hh+':'+mm+':00+07:00'};
}
TP.inboxGroups = (notes,now=new Date()) => {
 const today=inboxDate({createdAt:now.toISOString()}),yesterday=new Date(today.key+'T00:00:00Z');yesterday.setUTCDate(yesterday.getUTCDate()-1);const yesterdayKey=yesterday.toISOString().slice(0,10),groups=new Map();
 notes.map(n=>({note:n,date:inboxDate(n)})).sort((a,b)=>b.date.stamp-a.date.stamp).forEach(({note,date})=>{if(!groups.has(date.key))groups.set(date.key,{key:date.key,label:date.key===today.key?'วันนี้':date.key===yesterdayKey?'เมื่อวาน':date.label,items:[]});groups.get(date.key).items.push({note,date});});
 return [...groups.values()];
};
function openNote(n) {
  if (!n) return;
  const S = TP.S; n.read = true; TP.emit('state');
  // Order notices carry a stable record id; never substitute the newest order.
  const caseId = n.caseId || (['summary','receipt','paid','track','history'].includes(n.go) ? n.p?.id : null);
  if (caseId) {
    const record = S.history.find(item => item.id === caseId);
    const c = TP.orderCases?.(S).find(item => item.id === caseId) || (record?.order ? record : null);
    const fulfillment = c && TP.fulfillmentInfo?.(c);
    if (fulfillment && !fulfillment.done) {
      S._paymentCase = c;
      S._paidFromHome = false;
      return TP.go(TP.fulfillmentScreen(c), { via:'cover' });
    }
    if (c || record) return TP.go('summary', { params:{id:caseId} });
    TP.notify('ไม่พบข้อมูลคำสั่งซื้อนี้', {icon:'info'});
    return TP.refresh({anim:false});
  }
  if (!n.go || !TP.SCREENS[n.go]) { if (TP.cur()?.id === 'inbox') TP.refresh({ anim: false }); return; }
  if (n.go === 'summary') return TP.tab('history');
  if (n.st) { S.st[n.go] = n.st; TP.SCREENS[n.go].prep?.(S); }
  if (['home', 'history', 'account'].includes(n.go)) return TP.tab(n.go);
  return TP.go(n.go, { params:n.p || {} });
}
TP.screen('inbox', {
 group:'after',title:'กล่องแจ้งเตือน',code:'C404',ref:'A13',tab:'inbox',
 states:[['normal','หลายรายการ แบ่งตามวัน'], ['empty','ยังไม่มี', true, 3], ['same-day','หลายรายการในวันเดียว', true, 5], ['loading','กำลังโหลดแจ้งเตือน', true, 6], ['error','โหลดแจ้งเตือนไม่สำเร็จ', true, 7], ['order-status','แจ้งเตือนตรงกับสถานะคำสั่งซื้อ', true, 8]],
 notes:['แสดงลิสต์ใหม่สุดก่อน แบ่งวันนี้ เมื่อวาน และวันที่ก่อนหน้า ตามเวลาไทย','ไม่มีข้อความอ่านแล้ว จำนวนยังไม่อ่าน หรือปุ่มอ่านทั้งหมดในหน้านี้','แสดงเฉพาะหัวข้อสถานะหลักของการปรึกษา การชำระเงิน และการรับยา เปิดรายละเอียดจากรายการแจ้งเตือน','รายการไม่มีพื้นสีหรือกรอบมน มี divider ใต้แต่ละรายการ ไอคอนทางซ้าย หัวข้อสถานะหลัก ข้อความสั้นด้านล่าง และเวลาด้านขวา ไม่ใช้ชื่อร้านแทนหัวข้อ','เคสเดิมมีข้อมูลตัวอย่าง 10 รายการ เคสสถานะคำสั่งซื้อเพิ่มจาก Flutter แยกทดสอบใน C404.8','แจ้งเตือนคำสั่งซื้อผูกกับ id ของรายการนั้น เปิดสถานะการรับยาระหว่างจัดส่ง หรือรายละเอียดคำสั่งซื้อเมื่อสิ้นสุด ไม่เลือกคำสั่งซื้อล่าสุดแทน'],
 prep(S) {
  const st = S.st.inbox;
  if (!st) return;
  if (st === 'empty') { S.inbox = []; return; }
  if (st === 'order-status') {
    const ids = new Set(S.history.map(record => record.id));
    S.history.push(...TP.fresh().history.filter(record => FX.isAddedOrder(record) && !ids.has(record.id)));
    S.inbox = FX.orderInbox(S.history);
    return;
  }
  S.inbox = TP.previewInbox(S.history.filter(record => !FX.isAddedOrder(record)));
  if (st === 'normal') S.inbox[0].read = false;
  if (st === 'same-day') {
    const first = inboxDate(S.inbox[0]).key;
    S.inbox = S.inbox.filter(note => inboxDate(note).key === first);
  }
 },
 render(ctx){
  const S=ctx.S,nav=ui.nav({title:'การแจ้งเตือน',back:TP.canBack()});
  if(ctx.state==='loading')return nav+ui.page(`<div class="inbox-page inbox-loading" aria-busy="true" aria-label="กำลังโหลดการแจ้งเตือน">${ui.skel('30%',20)}${ui.skel('100%',94,16)}${ui.skel('100%',94,16)}${ui.skel('100%',94,16)}</div>`);
  if(ctx.state==='error')return nav+ui.page(ui.empty({icon:'bell',title:'ยังโหลดการแจ้งเตือนไม่ได้',body:'ลองอีกครั้งเพื่อดูรายการล่าสุด',btn:{label:'ลองใหม่',a:'afInboxRetry'}}));
  const visible = S.inbox.filter(inboxVisible);
  if(!visible.length)return nav+ui.page(ui.empty({icon:'bell',title:'ยังไม่มีการแจ้งเตือน',body:'เมื่อมีข้อมูลจากเภสัชกรหรือรายการของคุณ จะแจ้งไว้ที่นี่'}));
  return nav+ui.page(`<div class="inbox-page">${TP.inboxGroups(visible).map((group,index)=>`<section class="inbox-day" aria-labelledby="inboxDay${index}"><h2 id="inboxDay${index}">${esc(group.label)}</h2><ul class="inbox-list">${group.items.map(({note:n,date})=>`<li><button type="button" class="inbox-item" data-a="afOpenNote" data-v="${esc(n.id)}"><span class="inbox-item-icon" aria-hidden="true">${ic(KIND_IC[n.kind]||'bell',22,1.8)}</span><span class="inbox-item-copy"><b>${esc(n.title)}</b>${n.body?`<span>${esc(n.body)}</span>`:''}</span><time class="inbox-item-time"${date.iso?` datetime="${esc(date.iso)}"`:''}>${esc(date.time)}${date.iso?' น.':''}</time></button></li>`).join('')}</ul></section>`).join('')}</div>`);
 }
});
TP.act('afOpenNote',t=>{const n=TP.S.inbox.find(x=>x.id===t.dataset.v);if(n)openNote(n);});
TP.act('afInboxRetry',()=>{TP.S.st.inbox='normal';TP.SCREENS.inbox.prep(TP.S);return TP.refresh({anim:false});});

/* =====================================================================
   Account (tab root)
   ===================================================================== */
TP.screen('account', {
  group: 'account', title: 'บัญชี', code: 'C501', tab: 'account', sb: 'dark',
  states: [['normal', 'ปกติ', true, 1]],
  notes: ['รูปโปรไฟล์เริ่มต้น 2D โทน CI ไม่มีปุ่มอัปโหลดรูป แก้ข้อมูลส่วนตัวได้จากเมนูด้านล่าง', 'บัญชีเดียวกับเว็บ mitraree.com (A3) · เบอร์โทรแสดงแบบซ่อนกลาง', 'ข้อมูลสุขภาพเจ้าของบัญชี ใช้เติมจอแจ้งอาการ', 'ออกจากระบบกลับหน้าเลือกช่องทางเข้าสู่ระบบทันที', 'ฝ่ายบริการลูกค้า 10:00-18:00 ติดป้ายแยกจากเวลาร้าน'],
  render(ctx) {
    const S = ctx.S, u = S.user, unread = S.inbox.filter(n => !n.read && inboxVisible(n)).length;
    const prof = `<header class="account-profile account-profile-clean" data-in="1"><div class="account-profile-body"><div class="account-avatar-wrap"><div class="account-avatar">${ui.av(u.full, { ini: iniOf(u.full), img: TP.profileImage('me'), size: 'xl', solid: true })}</div></div><h2>${esc(u.full)}</h2><p class="account-phone num">${esc(maskPhone(u.phone))}</p></div></header>`;
    return ui.page(`${ui.nav({ title: 'บัญชี' })}${prof}<div class="account-menu">
      ${ui.group([
        ui.row({ icon: 'user', title: 'ข้อมูลส่วนตัว', sub: 'ชื่อ นามสกุล ปีเกิด เพศ', a: 'afEditProf' }),
        ui.row({ icon: 'clipboard-list', title: 'ข้อมูลสุขภาพของฉัน', sub: algText(u), go: 'health' }),
        ui.row({ icon: 'map-pin', title: 'สมุดที่อยู่', sub: 'เพิ่ม แก้ไข และตั้งที่อยู่หลัก', go: 'addressbook' }),
        ui.row({ icon: 'receipt', title: 'ข้อมูลออกใบกำกับภาษี', sub: 'จัดการข้อมูลผู้รับใบกำกับภาษี', go: 'taxprofile' })
      ], { din: 2 })}
      ${ui.group([
        ui.row({ icon: 'inbox', title: 'กล่องแจ้งเตือน', sub: unread ? `ยังไม่ได้อ่าน ${unread} รายการ` : 'อ่านครบแล้ว', go: 'inbox', tag: unread ? [`ใหม่ ${unread}`, 'solid'] : undefined }),
        ui.switchRow({ icon: 'bell', title: 'การแจ้งเตือน', sub: 'ตั้งค่าการแจ้งเตือนในแอป', on: S.notif, a: 'afNotif' })
      ], { din: 4 })}
      ${ui.group([ui.row({ icon: 'headset', title: 'ติดต่อฝ่ายบริการลูกค้า', sub: 'LINE @mitraree · ทุกวัน 10:00–18:00', go: 'help' }), TP.policyLinks()], { din: 5 })}
      <div class="group account-actions" data-in="6">
        ${ui.row({ icon: 'log-out', title: 'ออกจากระบบ', sheet: 'logout' })}
        ${ui.row({ icon: 'trash', iconCls: 'danger', title: 'ลบบัญชี', a: 'afDeleteOpen' })}
      </div>
      <p class="af-ver">แอปเวอร์ชัน 1.1.0</p></div>`);
  }
});

/* Invoice recipients: preserve structured address separately from delivery addresses. */
const taxProfileIdOk = v => { if (!/^\d{13}$/.test(v)) return false; const sum = [...v].slice(0,12).reduce((a,n,i)=>a + Number(n)*(13-i),0); return (11-sum%11)%10 === Number(v[12]); };
const taxProfileEntry = (record, user, company) => {
  const parts = String(record?.name || (company ? '' : user.full || '')).trim().split(/\s+/);
  return {
    id: record?.id || '', name: company ? record?.name || '' : '', business: company ? record?.business || '' : '',
    first: company ? '' : record?.first || parts.shift() || '',
    last: company ? '' : record?.last || parts.join(' '),
    phone: record?.phone || (company ? '' : user.phone || ''),
    mode: record?.addressMode || 'select', country: record?.country || 'ไทย',
    prov: record?.prov || '', amp: record?.amp || '', dist: record?.dist || '', zip: record?.zip || '',
    detail: record?.detail || record?.addr || '', village: record?.village || '', alley: record?.alley || '', road: record?.road || ''
  };
};
const taxProfileDraft = S => S._taxProfile ||= {kind:'me', errors:{}, addressState:'loading', drafts:{me:taxProfileEntry(S.taxWho,S.user,false),co:taxProfileEntry(S.taxCo,S.user,true)}};
function taxProfilePreview(kind) { return kind==='co'
  ? {id:'0105569024564',name:'บริษัท ตัวอย่าง จำกัด',business:'ร้านตัวอย่าง',phone:'021234567',detail:'99',road:'ถนนตัวอย่าง',prov:'กรุงเทพมหานคร',amp:'คลองเตย',dist:'คลองเตย',zip:'10110',country:'ไทย'}
  : {id:'1234567890121',name:'สมใจ ใจดี',first:'สมใจ',last:'ใจดี',phone:'0812345678',detail:'88/12',alley:'ซอยตัวอย่าง',prov:'กรุงเทพมหานคร',amp:'คลองเตย',dist:'คลองเตย',zip:'10110',country:'ไทย'}; }
// Select from the same saved records as C518. Choosing never submits a request.
function receiptTaxPicker(S,source='rc') {
  const kind=S._receiptTaxKind||'me';
  const current=source==='pay' ? S.pay : TP.cur()?.ctx?.rc?.tax;
  const selected=TP.taxRecipient(kind,current?.taxKey,S);
  const rows=TP.taxRecords(kind,S);
  return `<div class="rc-tax-picker" role="group" aria-label="เลือกผู้รับใบกำกับภาษี">
    ${rows.length ? rows.map(record => {
      const active=record.profileKey===selected?.profileKey;
      return `<button type="button" class="rc-tax-pick-card" data-a="${source}TaxPickerChoose" data-v="${kind}" data-key="${esc(record.profileKey)}" aria-pressed="${active}">
        <span><b>${esc(record.name)}</b><small>${esc(TP.taxAddress(record))}</small></span>
        <span class="invoice-choice-mark" aria-hidden="true">${active?ic('check',16):''}</span>
      </button>`;
    }).join('') : `<div class="rc-tax-empty">${ui.emptyArt('file-text')}<b>ยังไม่มีข้อมูลผู้รับประเภทนี้</b></div>
      <button type="button" class="btn secondary" data-a="${source}TaxPickerAdd" data-v="${kind}">เพิ่มข้อมูลผู้รับ</button>`}
  </div>`;
}
// Checkout uses the same saved-recipient cards and visual pattern as the receipt.
/* C308 keeps showing behind the picker: it is a bottom panel inside the payment sheet, not a separate sheet. */
const payPickerBody = () => receiptTaxPicker(TP.S,'pay');
const payPickerManage = () => ui.btn('จัดการข้อมูลภาษี',{kind:'secondary',a:'payTaxManage'});
const payPickerClose = () => { const o = $('#payTaxPicker', $('#sheet')); if (!o) return; const prev = o._prev; o.remove(); if (prev?.isConnected) prev.focus({ preventScroll: true }); };
TP.act('payTaxPickOpen',()=>{
  TP.S._receiptTaxKind=TP.S.pay?.taxWho||'me';
  TP.S._checkoutTaxScroll=$('.sh-b',TP.sheetOpen()?.el)?.scrollTop||0;
  const sh=$('#sheet');
  if(TP.sheetOpen()?.id!=='pay'||!sh)return TP.sheet('checkouttaxpicker');
  payPickerClose();
  const o=document.createElement('div');o.id='payTaxPicker';o.className='pay-picker';o._prev=document.activeElement;
  o.innerHTML=`<div class="pay-picker-scrim" data-a="payTaxPickerClose"></div><section class="pay-picker-panel" role="dialog" aria-modal="true" aria-labelledby="payTaxPickerTitle"><header class="pay-picker-head"><h2 id="payTaxPickerTitle">เลือกผู้รับใบกำกับภาษี</h2><button type="button" class="ibtn" data-a="payTaxPickerClose" aria-label="ปิด">${ic('x',22,2)}</button></header><div class="pay-picker-body" id="payTaxPickerBody">${payPickerBody()}</div><footer class="pay-picker-foot">${payPickerManage()}</footer></section>`;
  o.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();payPickerClose();}});
  sh.appendChild(o);TP.icons(o);
  if(!TP.RED())A($('.pay-picker-panel',o),[{transform:'translateY(100%)'},{transform:'none'}],{d:SP.soft.d,e:SP.soft.e});
  setTimeout(()=>$('.pay-picker-head .ibtn',o)?.focus({preventScroll:true}),60);
});
TP.act('payTaxPickerClose',()=>payPickerClose());
TP.act('payTaxManage',()=>{
  const S=TP.S, active=TP.sheetOpen();
  if(!['pay','checkouttaxpicker'].includes(active?.id)) return;
  const consultation=S._paymentCase||S.case, payment=S.pay;
  if(!consultation?.order || !payment) return;
  const scroll=active.id==='pay' ? $('.sh-b',active.el)?.scrollTop : S._checkoutTaxScroll;
  taxProfileDraft(S).kind=payment.taxWho||'me';
  payPickerClose();
  return TP.go('taxprofile',{params:{async onCheckoutReturn(){
    await TP.back();
    if(TP.S!==S || (S._paymentCase||S.case)!==consultation || S.pay!==payment) return;
    TP.expireOrder(consultation);
    if(!TP.orderPayable(consultation.order)) {
      TP.notify('รายการนี้หมดเวลาชำระแล้ว',{icon:'clock'});
      return;
    }
    await TP.sheet('pay');
    const body=$('.sh-b',TP.sheetOpen()?.el);
    if(body) body.scrollTop=scroll||0;
  }}});
});
TP.act('returnToCheckoutTax',()=>TP.cur()?.ctx.params.onCheckoutReturn?.());
TP.act('payTaxPickerChoose',async b=>{
  const record=TP.taxRecords(b.dataset.v).find(row=>row.profileKey===b.dataset.key);if(!record)return;
  Object.assign(TP.S.pay,{taxWho:b.dataset.v,taxWant:true,taxKey:record.profileKey});
  if($('#payTaxPicker',$('#sheet'))){payPickerClose();TP.redrawPayTax?.();return;}
  await TP.closeSheet();
});
function openCheckoutTaxEditor(kind, record) {
  const d=taxProfileDraft(TP.S);
  d.kind=kind;
  d.editKey=record?.profileKey||null;
  d.errors={};
  d.drafts[kind]=taxProfileEntry(record,{},kind==='co');
  if(TP.sheetOpen()?.id==='pay') TP.S._checkoutTaxScroll=$('.sh-b',TP.sheetOpen().el)?.scrollTop||0;
  payPickerClose();
  return TP.sheet('checkouttaxedit');
}
TP.act('payTaxPickerAdd',b=>openCheckoutTaxEditor(b?.dataset?.v||TP.S.pay?.taxWho||'me'));
TP.act('payTaxPickerEdit',()=>{
  const {taxWho,taxKey}=TP.S.pay;
  const record=TP.taxRecipient(taxWho,taxKey);
  if(record) return openCheckoutTaxEditor(taxWho,record);
});
TP.sheetDef('checkouttaxpicker',{
  group:'during',title:'เลือกผู้รับใบกำกับภาษี',hidden:true,host:'home',owner:'pay',
  render:ctx=>receiptTaxPicker(ctx.S,'pay'),
  foot:payPickerManage,
  async afterClose(ctx){await TP.sheet('pay');const body=$('.sh-b',TP.sheetOpen()?.el);if(body)body.scrollTop=ctx.S._checkoutTaxScroll||0;}
});
TP.act('rcTaxPickOpen',()=>{TP.S._receiptTaxKind=TP.cur()?.ctx?.rc?.tax?.who||'me';return TP.sheet('receipttaxpicker');});
TP.act('rcTaxPickerChoose',async b=>{
  const o=TP.cur()?.ctx?.rc,kind=b.dataset.v,record=TP.taxRecords(kind).find(r=>r.profileKey===b.dataset.key);
  if(!o||!record)return;
  Object.assign(o.tax,{who:kind,want:true,taxKey:record.profileKey});
  await TP.closeSheet();TP.redrawReceiptTax?.();
});
TP.act('rcTaxPickerAdd',b=>{const d=taxProfileDraft(TP.S);d.kind=b?.dataset?.v||TP.cur()?.ctx?.rc?.tax?.who||'me';d.editKey=null;d.errors={};d.drafts[d.kind]=taxProfileEntry(null,{},d.kind==='co');return TP.sheet('taxprofileedit',{fromReceipt:true});});
TP.sheetDef('receipttaxpicker',{
  group:'after',title:'เลือกผู้รับใบกำกับภาษี',code:'C421',host:'receipt',
  states:[['person','เลือกบุคคลธรรมดา'],['company','เลือกนิติบุคคล'],['empty','ยังไม่มีข้อมูลผู้รับ']],
  notes:['เลือกประเภทในหน้าใบเสร็จหรือหน้าชำระเงินก่อนเปิดรายการผู้รับประเภทนั้น','แผ่นเลือกแสดงชื่อ ที่อยู่ และเครื่องหมายผู้รับที่เลือก กดเลือกแล้วกลับมาโดยยังไม่ส่งคำขอ','ประเภทที่ไม่มีผู้รับสามารถเพิ่มข้อมูลในฟอร์มเดียวกับหน้าบัญชี'],
  prep(S) {
    const state = S.st.receipttaxpicker, kind = state === 'company' ? 'co' : 'me';
    S._receiptTaxKind = kind;
    const records = state === 'empty' ? [] : kind === 'me' ? FX.demoTaxRecipients.map(record => ({...record})) : [
      {...taxProfilePreview(kind), profileKey:'picker-1'},
      {...taxProfilePreview(kind), profileKey:'picker-2', detail:'12 ถนนสุขใจ', addr:'12 ถนนสุขใจ คลองเตย กรุงเทพมหานคร 10110'},
    ];
    taxProfileDraft(S).previewLists = {[kind]: records};
  },
  render:ctx=>receiptTaxPicker(ctx.S)
});
const taxProfileRecord = (S,d) => TP.taxRecords(d.kind,S).find(r=>r.profileKey===d.editKey) || TP.taxSelected(d.kind,S);
const TAX_LONG_FIELDS=['name','business','first','last','detail'];
const TAX_PLACEHOLDERS={name:'กรอกชื่อนิติบุคคล',business:'กรอกชื่อธุรกิจ',first:'กรอกชื่อ',last:'กรอกนามสกุล',phone:'กรอกเบอร์โทรศัพท์',detail:'กรอกเลขที่',village:'ระบุหมู่บ้านหรืออาคาร',alley:'ระบุตรอกหรือซอย',road:'ระบุถนน',prov:'กรอกจังหวัด',amp:'กรอกอำเภอหรือเขต',dist:'กรอกตำบลหรือแขวง',zip:'กรอกรหัสไปรษณีย์ 5 หลัก'};
function taxProfileForm(S, sheet=false, allowDelete=false) {
  const d=taxProfileDraft(S), co=d.kind==='co', f=d.drafts[d.kind], bind=key=>`_taxProfile.drafts.${d.kind}.${key}`;
    const field=(key,label,o={})=>{
      const id='tax-profile-'+key,error=d.errors[key],attrs=`id="${id}" class="input" data-bind="${bind(key)}" aria-invalid="${!!error}" aria-describedby="${id}-error" ${o.optional?'':'required aria-required="true"'}`;
      return `<div class="field${error?' err':''}"><label for="${id}">${esc(label)} ${o.optional?'<span class="opt-t">(ไม่บังคับ)</span>':'<span class="reg-required" aria-hidden="true">*</span>'}</label><input ${attrs} value="${esc(f[key])}" placeholder="${key==='zip'&&o.readonly?'ระบบจะเติมให้เมื่อเลือกตำบล':key==='id'?`กรอก${co?'เลขประจำตัวผู้เสียภาษี':'เลขประจำตัวประชาชน'} 13 หลัก`:TAX_PLACEHOLDERS[key]}" ${key==='id'?'inputmode="numeric" maxlength="17"':key==='phone'?'type="tel" inputmode="tel" maxlength="15"':key==='zip'?'inputmode="numeric" maxlength="5"':TAX_LONG_FIELDS.includes(key)?'maxlength="500"':''} ${o.readonly?'readonly':''}><p class="err-t" id="${id}-error" role="alert" ${error?'':'hidden'}>${esc(error||'')}</p></div>`;
    };
    const area=f.mode==='select'?`${TP.addressAreaField(f,d.errors,'openTaxAddressArea')}${field('zip','รหัสไปรษณีย์',{readonly:true})}
      <p class="hint" id="taxAddressStatus" role="status">กำลังโหลดข้อมูลพื้นที่</p>
      <button type="button" class="txtbtn" id="taxAddressRetry" hidden>โหลดข้อมูลที่อยู่อีกครั้ง</button>
      <button type="button" class="txtbtn" id="taxAddressManual" data-a="taxProfileAddressMode" data-v="manual" hidden>กรอกข้อมูลที่อยู่เอง</button>`
      :`${field('prov','จังหวัด')}${field('amp','อำเภอ / เขต')}${field('dist','ตำบล / แขวง')}${field('zip','รหัสไปรษณีย์')}`;
    return `<div class="registration-page tax-profile">
      ${d.editKey ? `<div class="tax-profile-intro"><p>ออกใบกำกับภาษีในนาม ${co?'นิติบุคคล':'บุคคลธรรมดา'}</p>
        <p>ใช้ข้อมูลนี้เพื่อเตรียมข้อมูลผู้รับใบกำกับภาษี</p>
        <button type="button" class="txtbtn" data-a="taxProfilePrivacy">คำประกาศความเป็นส่วนตัวสำหรับลูกค้า/ผู้ใช้บริการ</button>
      </div>` : ''}
      ${co?`${field('name','ชื่อนิติบุคคล')}${field('business','ชื่อธุรกิจ')}`:`${field('first','ชื่อ')}${field('last','นามสกุล')}`}
      ${field('id',co?'เลขประจำตัวผู้เสียภาษี':'เลขประจำตัวประชาชน')}${field('phone','เบอร์โทรศัพท์')}
      ${field('detail','ที่อยู่ (เลขที่)')}${field('village','หมู่บ้าน / อาคาร',{optional:true})}
      ${field('alley','ตรอก / ซอย',{optional:true})}${field('road','ถนน',{optional:true})}${area}
      <div class="tax-form-actions">${sheet?ui.btn('ยกเลิก',{kind:'secondary',closeSheet:true}):''}${ui.btn('บันทึกข้อมูล',{a:'taxProfileSave',id:'taxProfileSave'})}</div>
      ${allowDelete&&d.editKey?`<div class="tax-edit-delete">${d.deleteConfirm?`<p>ลบข้อมูลผู้รับรายการนี้หรือไม่?</p>
        ${ui.btn('ยืนยันลบข้อมูล',{kind:'danger',a:'taxProfileDelete'})}
        ${ui.btn('ยกเลิกการลบ',{kind:'ghost',a:'taxProfileDeleteCancel'})}`
        :ui.btn('ลบข้อมูลนี้',{kind:'danger-line',icon:'trash',a:'taxProfileDeleteAsk'})}</div>`:''}
    </div>`;
}
function taxProfileCard(record, co) {
  const name=record.name||[record.first,record.last].filter(Boolean).join(' '),addr=TP.taxAddress(record);
  return `<section class="card tax-summary tax-summary-compact"><header class="tax-summary-head"><div><strong>${esc(name)}</strong>${co&&record.business?`<span class="small">${esc(record.business)}</span>`:''}</div><button type="button" class="txtbtn tax-summary-edit" data-a="taxProfileEdit" data-p="${esc(record.profileKey)}" aria-label="แก้ไขข้อมูล ${esc(name)}">${ic('pencil',16,1.8)} แก้ไข</button></header><div class="tax-summary-content"><p class="tax-summary-address">${esc(addr)}</p><p class="small">โทรศัพท์ : ${esc(record.phone||'—')}</p><p class="small">${co?'เลขประจำตัวผู้เสียภาษี':'เลขประจำตัวประชาชน'} : ${esc('xxxxxxxxx'+String(record.id||'').slice(-4))}</p></div></section>`;
}
function taxProfileErrors(d,{skipLoad=false}={}) {
  const co=d.kind==='co',f=d.drafts[d.kind],id=f.id.replace(/\D/g,''),phone=f.phone.replace(/\D/g,''),choose=f.mode==='select',e={};
  if(!/^\d{13}$/.test(id))e.id='ใส่ตัวเลข 13 หลัก';else if(!co&&!taxProfileIdOk(id))e.id='เลขประจำตัวประชาชนไม่ถูกต้อง ตรวจอีกครั้ง';
  const titles={name:'ชื่อนิติบุคคล',business:'ชื่อธุรกิจ',first:'ชื่อ',last:'นามสกุล',detail:'ที่อยู่ (เลขที่)'};
  for(const key of [...(co?['name','business']:['first','last']),'detail']){const text=f[key].trim();if(!text)e[key]='กรอก'+titles[key];else if(text.length>500)e[key]=titles[key]+'ต้องไม่เกิน 500 ตัวอักษร';}
  if(!/^\d{9,10}$/.test(phone))e.phone='กรอกเบอร์โทรศัพท์ 9–10 หลัก';
  for(const [key,label] of [['prov','จังหวัด'],['amp','อำเภอ / เขต'],['dist','ตำบล / แขวง']])if(!f[key].trim())e[key]=(choose?'เลือก':'กรอก')+label;
  if(!/^\d{5}$/.test(f.zip))e.zip=choose?'เลือกตำบล / แขวง เพื่อเติมรหัสไปรษณีย์':'กรอกรหัสไปรษณีย์ 5 หลัก';
  if(choose&&!skipLoad&&d.addressState!=='ready')e.prov='โหลดข้อมูลพื้นที่ให้สำเร็จ หรือเลือกกรอกเอง';
  if(choose&&d.addressState==='ready'&&f.prov&&f.amp&&f.dist&&!TP.thaiAddressData.rows.some(r=>r.province===f.prov&&r.amphoe===f.amp&&r.district===f.dist&&String(r.zipcode)===f.zip))e.dist='เลือกจังหวัด อำเภอ และตำบลให้สัมพันธ์กัน';
  return e;
}
/* Preview panel only: fills blank fields of the add form with sample data. Never saves. */
const taxProfileMock={
  canFill(ctx){const d=taxProfileDraft(ctx.S);return !d.editKey;},
  async fill(ctx){
    const d=taxProfileDraft(ctx.S),co=d.kind==='co',f=d.drafts[d.kind],sample=taxProfileEntry(taxProfilePreview(d.kind),ctx.S.user,co),area=f.mode!=='select'||d.addressState==='ready';
    for(const key of ['id','phone','detail','village','alley','road',...(co?['name','business']:['first','last']),...(area?['prov','amp','dist','zip']:[])])if(!String(f[key]||'').trim())f[key]=sample[key];
    d.errors={};return taxProfileRedraw();
  }
};
function taxProfileFieldCheck(el,d) {
  const f=d.drafts[d.kind],form=$('.tax-profile',el);if(!form)return;
  const check=(e,onlyExisting)=>{
    const input=e.target,key=input.id?.replace('tax-profile-','');if(!input.id?.startsWith('tax-profile-')||input.tagName==='SELECT'||!(key in f))return;
    f[key]=input.value;if(onlyExisting&&!d.errors[key])return;
    const error=taxProfileErrors(d)[key];if(error)d.errors[key]=error;else delete d.errors[key];
    const message=$('#'+input.id+'-error',form);input.setAttribute('aria-invalid',String(!!error));input.closest('.field')?.classList.toggle('err',!!error);if(message){message.hidden=!error;message.textContent=error||'';}
  };
  form.addEventListener('focusout',e=>check(e,false));form.addEventListener('input',e=>check(e,true));
}
function taxProfileMount(el,ctx) {
  const d=taxProfileDraft(ctx.S);
  taxProfileFieldCheck(el,d);
  const status=$('#taxAddressStatus',el);
  if(!status)return;
  const retry=$('#taxAddressRetry',el),manual=$('#taxAddressManual',el);
  const area=$('[data-a="openTaxAddressArea"]',el),save=$('#taxProfileSave',el);
  async function load() {
    d.addressState='loading';retry.hidden=true;manual.hidden=true;area.disabled=true;save.disabled=true;
    status.textContent='กำลังโหลดข้อมูลพื้นที่';
    try {
      if(ctx.params?.addressError){ctx.params.addressError=false;throw Error('Preview');}
      await TP.thaiAddressData.load();
      if(!status.isConnected)return;
      d.addressState='ready';area.disabled=false;save.disabled=false;
      status.textContent='เลือกพื้นที่ ระบบจะเติมรหัสไปรษณีย์ให้';
    } catch {
      if(!status.isConnected)return;
      d.addressState='error';retry.hidden=false;manual.hidden=false;
      status.textContent='โหลดข้อมูลพื้นที่ไม่สำเร็จ ลองอีกครั้งหรือเลือกกรอกเอง';
    }
  }
  retry.addEventListener('click',load);load();
}
function openTaxEditorChild(child,params,focus) {
  const editor=TP.sheetOpen();
  if(!['taxprofileedit','checkouttaxedit'].includes(editor?.id))return;
  const top=$('.sh-b',editor.el).scrollTop;
  editor.ctx.params.preserveDraft=true;
  const resume={...editor.ctx.params,preserveDraft:false};
  return TP.sheet(child,{...params,async onReturn(){
    await TP.sheet(editor.id,resume);
    const el=TP.sheetOpen()?.el;
    if(el){$('.sh-b',el).scrollTop=top;$(focus,el)?.focus({preventScroll:true});}
  }});
}
TP.act('openTaxAddressArea',()=>{
  const d=taxProfileDraft(TP.S),area=d.drafts[d.kind];
  return openTaxEditorChild('addressarea',{title:'เลือกพื้นที่',area,onSelect(result){
    for(const key of ['prov','amp','dist','zip']){area[key]=result[key];delete d.errors[key];}
  }},'[data-a="openTaxAddressArea"]');
});
TP.act('taxProfilePrivacy',()=>openTaxEditorChild('doc',{key:'notice'},'[data-a="taxProfilePrivacy"]'));
TP.screen('taxprofile', {
  group:'account', title:'ข้อมูลออกใบกำกับภาษี', code:'C518', parent:'account',
  states:[['normal','บุคคลธรรมดา'],['company','นิติบุคคล'],['empty','ยังไม่มีข้อมูล'],['address-error','โหลดข้อมูลที่อยู่ไม่สำเร็จ'],['saved-person','บันทึกบุคคลธรรมดาแล้ว'],['saved-company','บันทึกนิติบุคคลแล้ว'],['multiple-person','บุคคลธรรมดาหลายรายการ'],['multiple-company','นิติบุคคลหลายรายการ']],
  notes:['เมื่อไม่มีข้อมูลแสดง Empty พร้อมไอคอน กดเพิ่มข้อมูลจึงเปิดฟอร์ม ทั้งสองประเภทใช้รูปแบบเดียวกัน','การ์ดเรียงที่อยู่ โทรศัพท์ และเลขประจำตัวตามลำดับ','แต่ละประเภทเพิ่มผู้รับได้หลายรายการ แสดงการ์ดสั้นและเพิ่ม แก้ไข หรือลบเฉพาะรายการที่เลือก','ใช้ผู้รับชุดเดียวกับหน้าชำระเงินและใบเสร็จ โดยคำขอที่ส่งแล้วเก็บสำเนาข้อมูล ณ เวลาส่ง','ข้อมูลตัวอย่างในต้นแบบยังไม่ส่งให้ร้านหรือออกใบกำกับภาษีจริง'],
  prep(S) {
    const state=S.st.taxprofile; if(state==='normal' && !S._taxProfileMockInitialized){if(!S.taxWho) S.taxWho=taxProfilePreview('me'); S._taxProfileMockInitialized=true;} S._taxProfile=null; const d=taxProfileDraft(S);
    if(state==='company'||state==='saved-company'||state==='multiple-company')d.kind='co';
    if(state==='empty'){d.previewLists={me:[],co:[]};d.drafts.me=taxProfileEntry(null,{},false);}
    if(state==='saved-person'||state==='saved-company'){d.preview={[d.kind]:taxProfilePreview(d.kind)};d.drafts[d.kind]=taxProfileEntry(d.preview[d.kind],S.user,d.kind==='co');}
    if(state==='multiple-person') d.previewLists={me: FX.demoTaxRecipients.map(record => ({...record}))};
    if(state==='multiple-company'){const base=taxProfilePreview('co');d.previewLists={co:[{...base,profileKey:'example-1'},{...base,profileKey:'example-2',name:'บริษัท มิตรสุข จำกัด',detail:'12',alley:'',road:'ถนนสุขใจ',addr:'12 ถนนสุขใจ แขวงคลองตัน เขตคลองเตย กรุงเทพมหานคร 10110'}]};}
  },
  render(ctx) {
    const d=taxProfileDraft(ctx.S), records=TP.taxRecords(d.kind,ctx.S);
    const fromCheckout=!!ctx.params.onCheckoutReturn;
    const back=fromCheckout?'<button type="button" class="ibtn" data-a="returnToCheckoutTax" aria-label="ย้อนกลับ">'+ic('arrow-left',22)+'</button>':undefined;
    const footer=(fromCheckout?ui.btn('กลับไปชำระเงิน',{kind:'secondary',a:'returnToCheckoutTax'}):'')+ui.btn('เพิ่มข้อมูล',{a:'taxProfileAdd',icon:'plus'});
    return ui.nav({back:true,left:back,title:'ข้อมูลออกใบกำกับภาษี'})+ui.page(`<div class="tax-profile-page">${ui.seg('taxProfileKind',[['me','บุคคลธรรมดา'],['co','นิติบุคคล']],d.kind,{a:'taxProfileKind',label:'ประเภทผู้รับใบกำกับภาษี'})}<div class="tax-profile-list-head"><h3 class="h3">ข้อมูลที่บันทึกไว้ <span class="small">(${records.length})</span></h3></div><div class="tax-profile-list">${records.length?records.map(rec=>taxProfileCard(rec,d.kind==='co')).join(''):`<div class="rc-tax-empty tax-profile-empty">${ui.emptyArt('file-text')}<b>ยังไม่มีข้อมูล${d.kind==='co'?'นิติบุคคล':'บุคคลธรรมดา'}</b><p class="small">กดเพิ่มข้อมูลเพื่อบันทึกผู้รับใบกำกับภาษี</p></div>`}</div></div>`) + ui.dock(footer);
  },
  mount(el,ctx){taxProfileMount(el,ctx);if(!ctx.params.onCheckoutReturn&&ctx.state==='address-error'){const d=taxProfileDraft(ctx.S);d.editKey=null;d.drafts[d.kind]=taxProfileEntry(null,ctx.S.user,d.kind==='co');TP.sheet('taxprofileedit',{addressError:true});}}
});
TP.sheetDef('taxprofileedit',{
  group:'account',title:'แก้ไขข้อมูลออกใบกำกับภาษี',sheetTitle:ctx=>(taxProfileDraft(ctx.S).editKey?'แก้ไข':'เพิ่ม')+'ข้อมูลออกใบกำกับภาษี',code:'C519',host:'taxprofile',tall:true,
  states:[['person','แก้ไขบุคคลธรรมดา'],['company','แก้ไขนิติบุคคล'],['add-person','เพิ่มบุคคลธรรมดา'],['add-company','เพิ่มนิติบุคคล'],['invalid-person','ไม่กรอกข้อมูลบังคับ · บุคคลธรรมดา'],['invalid-company','ไม่กรอกข้อมูลบังคับ · นิติบุคคล'],['invalid-format','เลขประจำตัวประชาชนและเบอร์ผิดรูปแบบ']],
  previewMock:taxProfileMock,
  notes:['ช่องตามสเปกเว็บเดิม: นิติบุคคลใช้ชื่อนิติบุคคล ชื่อธุรกิจ เลขผู้เสียภาษี 13 หลัก ส่วนบุคคลธรรมดาใช้ชื่อ นามสกุล เลขประจำตัวประชาชนที่ถูกต้อง','ไม่มีช่องสาขาตามสเปก ต้องให้นักบัญชียืนยันก่อนใช้จริง','กดเพิ่มข้อมูลใน C518 เปิดฟอร์มว่าง กดแก้ไขบนการ์ดเปิดฟอร์มพร้อมข้อมูลเดิม','ตรวจแต่ละช่องเมื่อออกจากช่องและก่อนบันทึก แก้ถูกแล้วข้อความหายทันที ข้อมูลที่กรอกไม่หาย','แก้ไขเฉพาะข้อมูลประเภทที่เลือก','ยกเลิกหรือปิดหน้าต่างโดยไม่เปลี่ยนข้อมูลที่บันทึกไว้'],
  prep(S){const d=taxProfileDraft(S),st=S.st.taxprofileedit;d.kind=['company','add-company','invalid-company'].includes(st)?'co':'me';d.errors={};if(st?.startsWith('add-')||st?.startsWith('invalid-')){d.editKey=null;const f=d.drafts[d.kind]=taxProfileEntry(st==='invalid-format'?taxProfilePreview(d.kind):null,{},d.kind==='co');if(st==='invalid-format')Object.assign(f,{id:'1234567890123',phone:'12'});if(st.startsWith('invalid-'))d.errors=taxProfileErrors(d,{skipLoad:true});return;}d.preview={[d.kind]:{...taxProfilePreview(d.kind),profileKey:'preview-'+d.kind}};d.editKey=d.preview[d.kind].profileKey;d.drafts[d.kind]=taxProfileEntry(d.preview[d.kind],S.user,d.kind==='co');},
  render:ctx=>taxProfileForm(ctx.S,true,true),mount:taxProfileMount,
  close(ctx){if(ctx.params.preserveDraft)return;const d=taxProfileDraft(ctx.S);d.errors={};d.drafts[d.kind]=taxProfileEntry(taxProfileRecord(ctx.S,d),ctx.S.user,d.kind==='co');}
});
TP.sheetDef('checkouttaxedit',{
  group:'during',title:'เพิ่มข้อมูลออกใบกำกับภาษี',hidden:true,host:'home',owner:'pay',tall:true,
  sheetTitle:ctx=>`${taxProfileDraft(ctx.S).editKey?'แก้ไข':'เพิ่ม'}ข้อมูลออกใบกำกับภาษี`,
  render:ctx=>taxProfileForm(ctx.S,true),mount:taxProfileMount,
  async afterClose(ctx){await TP.sheet('pay');const body=$('.sh-b',TP.sheetOpen()?.el);if(body)body.scrollTop=ctx.S._checkoutTaxScroll||0;}
});
TP.sheetDef('receiptprofile',{group:'after',title:'ข้อมูลออกใบกำกับภาษี',hidden:true,host:'receipt',tall:true,render:ctx=>`${ui.seg('receiptProfileKind',[['me','บุคคลธรรมดา'],['co','นิติบุคคล']],taxProfileDraft(ctx.S).kind,{a:'receiptProfileKind',label:'ประเภทผู้รับใบกำกับภาษี'})}${taxProfileForm(ctx.S,true)}`,mount:taxProfileMount,close(ctx){const d=taxProfileDraft(ctx.S);d.errors={};d.drafts[d.kind]=taxProfileEntry(d.kind==='co'?ctx.S.taxCo:ctx.S.taxWho,ctx.S.user,d.kind==='co');}});
TP.act('receiptProfileKind',b=>{const d=taxProfileDraft(TP.S);d.kind=b.dataset.v;d.errors={};const sheet=TP.sheetOpen(),body=$('.sh-b',sheet.el);body.innerHTML=`${ui.seg('receiptProfileKind',[['me','บุคคลธรรมดา'],['co','นิติบุคคล']],d.kind,{a:'receiptProfileKind',label:'ประเภทผู้รับใบกำกับภาษี'})}${taxProfileForm(TP.S,true)}`;TP.icons(body);taxProfileMount(sheet.el,sheet.ctx);});
async function taxProfileRedraw(){
  const sheet=TP.sheetOpen();
  if(sheet?.id==='receiptprofile'){const body=$('.sh-b',sheet.el),top=body.scrollTop;body.innerHTML=`${ui.seg('receiptProfileKind',[['me','บุคคลธรรมดา'],['co','นิติบุคคล']],taxProfileDraft(TP.S).kind,{a:'receiptProfileKind',label:'ประเภทผู้รับใบกำกับภาษี'})}${taxProfileForm(TP.S,true)}`;TP.icons(body);taxProfileMount(sheet.el,sheet.ctx);body.scrollTop=top;return;}
  if(['taxprofileedit','checkouttaxedit'].includes(sheet?.id)){const body=$('.sh-b',sheet.el),top=body.scrollTop;body.innerHTML=taxProfileForm(TP.S,true,sheet.id==='taxprofileedit');TP.icons(body);taxProfileMount(sheet.el,sheet.ctx);body.scrollTop=top;return;}
  return TP.refresh({anim:false});
}
TP.sheetDef('taxprofiledelete',{group:'account',title:'ลบข้อมูลออกใบกำกับภาษี?',hidden:true,host:'taxprofile',render:()=>'<p>ลบข้อมูลผู้รับรายการนี้หรือไม่? ข้อมูลในใบกำกับภาษีที่ขอไว้แล้วจะยังคงเดิม</p>',foot:()=>ui.btn('ยกเลิก',{kind:'secondary',closeSheet:true})+ui.btn('ยืนยันลบข้อมูล',{kind:'danger',a:'taxProfileDelete'})});
TP.act('taxProfileDeleteAsk',()=>{taxProfileDraft(TP.S).deleteConfirm=true;return taxProfileRedraw();});
TP.act('taxProfileDeleteCancel',()=>{taxProfileDraft(TP.S).deleteConfirm=false;return taxProfileRedraw();});
TP.act('taxProfileDelete',async()=>{const S=TP.S,d=taxProfileDraft(S),rows=TP.taxRecords(d.kind,S),index=rows.findIndex(r=>r.profileKey===d.editKey);if(index<0)return;const removed=rows.splice(index,1)[0];if(S[d.kind==='co'?'taxCo':'taxWho']?.profileKey===removed.profileKey)S[d.kind==='co'?'taxCo':'taxWho']=rows[0]||null;d.editKey=null;d.errors={};TP.emit('state');await TP.closeSheet();await TP.refresh({anim:false});TP.notify('ลบข้อมูลแล้ว',{icon:'circle-check'});});
TP.act('taxProfileAdd',()=>{const S=TP.S,d=taxProfileDraft(S);d.editKey=null;d.deleteConfirm=false;d.errors={};d.drafts[d.kind]=taxProfileEntry(null,{},d.kind==='co');return TP.sheet('taxprofileedit');});
TP.act('taxProfileEdit',b=>{const S=TP.S,d=taxProfileDraft(S);d.editKey=b.dataset.p;d.deleteConfirm=false;d.errors={};d.drafts[d.kind]=taxProfileEntry(taxProfileRecord(S,d),S.user,d.kind==='co');return TP.sheet('taxprofileedit');});
TP.act('taxProfileKind',b=>{const d=taxProfileDraft(TP.S);d.kind=b.dataset.v;d.errors={};return TP.refresh({anim:false});});
TP.act('taxProfileAddressMode',b=>{const d=taxProfileDraft(TP.S),f=d.drafts[d.kind];f.mode=b.dataset.v;d.errors={};return taxProfileRedraw();});
TP.act('taxProfileSave',async()=>{
  const S=TP.S,d=taxProfileDraft(S),co=d.kind==='co',f=d.drafts[d.kind],id=f.id.replace(/\D/g,''),phone=f.phone.replace(/\D/g,''); d.errors=taxProfileErrors(d);
  if(Object.keys(d.errors).length){await taxProfileRedraw();$('[aria-invalid="true"]',TP.sheetOpen()?.el || TP.cur()?.el)?.focus();return;}
  const name=co?f.name.trim():`${f.first.trim()} ${f.last.trim()}`;
  const bangkok=f.prov.trim()==='กรุงเทพมหานคร',manual=f.mode==='manual';
  const district=(manual?'':bangkok?'เขต':'อำเภอ')+f.amp.trim();
  const subdistrict=(manual?'':bangkok?'แขวง':'ตำบล')+f.dist.trim();
  const addr=[f.detail,f.village,f.alley,f.road,subdistrict,district,f.prov,f.zip].map(part=>part.trim()).filter(Boolean).join(' ');
  const rec={profileKey:d.editKey||('tax-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)),name,business:f.business.trim(),id,phone,kind:co?'นิติบุคคล':'บุคคลธรรมดา',first:f.first.trim(),last:f.last.trim(),addressMode:f.mode,country:f.country.trim(),prov:f.prov.trim(),amp:f.amp.trim(),dist:f.dist.trim(),zip:f.zip.trim(),detail:f.detail.trim(),village:f.village.trim(),alley:f.alley.trim(),road:f.road.trim(),addr};
  const rows=TP.taxRecords(d.kind,S),index=rows.findIndex(r=>r.profileKey===d.editKey);if(index>=0)rows[index]=rec;else rows.push(rec);if(d.preview?.[d.kind]){d.previewLists||={};d.previewLists[d.kind]=rows;delete d.preview[d.kind];}TP.taxChoose(d.kind,rec.profileKey,S);d.editKey=rec.profileKey;S.rcNoAddr=false;S._taxProfileMockInitialized=true;
  const editor=TP.sheetOpen();
  const receipt=editor?.id==='receiptprofile'||editor?.ctx?.params?.fromReceipt;
  if(receipt){const order=TP.cur()?.ctx?.rc;if(order?.tax)Object.assign(order.tax,{who:d.kind,want:true,taxKey:rec.profileKey});}
  if(editor?.id==='checkouttaxedit')Object.assign(S.pay,{taxWho:d.kind,taxWant:true,taxKey:rec.profileKey});
  TP.emit('state');
  if(['taxprofileedit','receiptprofile','checkouttaxedit'].includes(editor?.id))await TP.closeSheet();
  if(receipt)TP.redrawReceiptTax?.();
  else if(editor?.id!=='checkouttaxedit')await TP.refresh({anim:false});
  TP.notify('บันทึกข้อมูลแล้ว',{icon:'circle-check'});
});

TP.act('afNotif', t => {
  const on = t.getAttribute('aria-checked') === 'true';
  TP.S.notif = on; TP.S.notifAsked = true;
  TP.notify(on ? 'เปิดการแจ้งเตือนแล้ว' : 'ปิดการแจ้งเตือนแล้ว', { icon: on ? 'bell' : 'bell-off' });
});
TP.sheetDef('logout', {
  group: 'account', title: 'ออกจากระบบ', code: 'C510', host: 'account',
  notes: ['ยืนยันก่อนออก · ประวัติและใบสรุปยังอยู่ในบัญชี', 'มีเคสค้าง = เตือนว่าจะไม่ได้รับแจ้งเตือนจนกว่าจะเข้าใหม่'],
  render: () => `<div class="af-sh-top">${brand.halo(60, { still: true, icon: 'log-out' })}<p class="body">ออกจากระบบบนเครื่องนี้ ประวัติการปรึกษาและใบสรุปยังอยู่ในบัญชี เข้าใหม่ได้ด้วย Google หรืออีเมลและรหัสผ่าน</p></div>
    ${caseOpen() ? `<div class="mt12">${ui.note('มีการปรึกษาที่ยังไม่จบ ออกจากระบบแล้วจะไม่ได้รับแจ้งเตือนจนกว่าจะเข้าใหม่', { tone: 'warn' })}</div>` : ''}`,
  foot: () => ui.btn('ออกจากระบบ', { kind: 'danger', a: 'afLogout', icon: 'log-out' }) + ui.btn('ยกเลิก', { kind: 'ghost', closeSheet: true })
});
TP.act('afLogout',async t=>{if(t?.disabled)return;if(t){t.disabled=true;t.classList.add('busy');}TP.S.loggedIn=false;TP.S.st.login='normal';TP.S._authFlows={};TP.emit('state');await TP.closeSheet({instant:true});return TP.go('login',{via:'fade',root:true});});

/* Household members (C502-C504) and the pharmacist-allergy delete sheet (C513) removed 8 Nov 2026: single-account app. Codes stay reserved. */
/* shared form helpers (health record C505/C517) */
const newKey = () => 'k' + Math.random().toString(36).slice(2, 8);
const cleanMeds = a => [...new Set(a.map(x => String(x).trim()).filter(Boolean))];

/* =====================================================================
   My health record · view first, explicit editing
   ===================================================================== */
const CONDS = ['ความดันโลหิตสูง', 'เบาหวาน', 'ไขมันในเลือดสูง', 'หอบหืด', 'โรคหัวใจ', 'โรคไต', 'โรคตับ', 'ตั้งครรภ์ หรือให้นมบุตร'];
const HD_SECTIONS = [
 ['meds','ยาที่ใช้ประจำ','pill','เช่น ชื่อยา ขนาดยา และวิธีใช้ตามฉลาก'],
 ['conditions','โรคประจำตัว','heart-pulse','เช่น โรคที่เป็นอยู่ รวมการตั้งครรภ์หรือให้นมบุตร'],
 ['food','ประวัติแพ้อาหาร','utensils','เช่น อาหารที่เคยแพ้ และอาการที่เกิดขึ้น']
];
const HD_EDIT_SECTIONS=[['allergies','ประวัติแพ้ยา','octagon-alert','เช่น ชื่อยาที่เคยแพ้ และอาการที่เกิดขึ้น'],...HD_SECTIONS];
/* Keep unknown distinct from a person's explicit “none”; never infer a diagnosis. */
function hdMode(explicit,items,none){return items.length?'set':none||explicit==='none'?'none':'unknown';}
function hdRecord(u){return TP.healthRecord(u);}

const hdAllergySources=u=>Object.fromEntries((u.allergies||[]).map(a=>[a,u.allergySources?.[a]||u.allergySrc||'ผู้ใช้ระบุ']));
function hdDraft(S,ctx){
 if(!ctx.params._k)ctx.params._k=newKey();
 if(S._dr?.form==='health'&&S._dr._k===ctx.params._k)return S._dr;
 const u=S.user,algPhSources=Object.fromEntries(Object.entries(hdAllergySources(u)).filter(([,source])=>/^บันทึกโดย ภ/.test(source)));
 return S._dr={_k:ctx.params._k,form:'health',allergies:[...(u.allergies||[])],algSrc:u.allergySrc||'',algPh:[...(u.allergies||[])],algPhSources,allergyState:u.allergyState||'unknown',algIn:'',weight:u.weight??'',height:u.height??'',health:hdRecord(u),errors:{},busy:false};
}
const hdTextValues=text=>String(text||'').trim()?[String(text).trim()]:[];
function hdErrors(d){
 const errors={},w=String(d.weight??'').trim(),height=String(d.height??'').trim();
 if(height&&(!/^\d{1,3}(\.\d)?$/.test(height)||+height<=0||+height>300))errors.height='กรอกส่วนสูงมากกว่า 0 ถึง 300 ซม. ทศนิยมได้ 1 ตำแหน่ง';
 if(w&&(!/^\d{1,3}(\.\d)?$/.test(w)||+w<=0||+w>500))errors.weight='กรอกน้ำหนักมากกว่า 0 ถึง 500 กก. ทศนิยมได้ 1 ตำแหน่ง';
 for(const [key,title]of HD_EDIT_SECTIONS){const v=d.health[key];if(v.mode==='set'&&!v.text.trim())errors[key]='ระบุ'+title+' หรือเลือก “ไม่มี” / “ยังไม่ทราบ”';else if(v.text.length>1000)errors[key]='กรอกไม่เกิน 1,000 ตัวอักษร';}
 return errors;
}
function hdCard(key,title,icon,body,highlight=false){
 return `<section class="health-summary${highlight?' health-summary-alert':''}" aria-labelledby="hdTitle-${key}"><header class="health-card-header"><div class="health-section-heading"><span class="health-section-icon" aria-hidden="true">${ic(icon,21,1.8)}</span><h2 id="hdTitle-${key}">${esc(title)}</h2><button type="button" class="ibtn health-card-edit" data-a="afHdFieldOpen" data-v="${key}" aria-label="แก้ไข${esc(title)}">${ic('pencil',19,1.8)}</button></div></header><div class="health-card-body">${body}</div></section>`;
}
function hdViewCard({key,title,icon,mode,values=[],none}){
 const body=mode==='set'?`<p class="health-text">${esc(values.join('\n'))}</p>`:`<p class="health-value-muted">${esc(mode==='none'?none:'ยังไม่ทราบ')}</p>`;
 return hdCard(key,title,icon,body,key==='allergies'&&mode==='set'&&values.length>0);
}
function hdOverview(S){
 const u=S.user,record=hdRecord(u),allergies=cleanMeds(u.allergies||[]),allergyMode=hdMode(u.allergyState,allergies,false);
 return `<div class="health-page health-overview">
 <section class="health-overview-group" aria-labelledby="hdConsultGroup"><h2 id="hdConsultGroup" class="health-group-title">ข้อมูลก่อนปรึกษา</h2>
 ${hdViewCard({key:'allergies',title:'ประวัติแพ้ยา',icon:'octagon-alert',mode:allergyMode,values:allergies,none:'ไม่มีประวัติแพ้ยา'})}
 ${HD_SECTIONS.map(([key,title,icon])=>hdViewCard({key,title,icon,mode:record[key].mode,values:hdTextValues(record[key].text),none:{meds:'ไม่มียาที่ใช้ประจำ',conditions:'ไม่มีโรคประจำตัว',food:'ไม่มีประวัติแพ้อาหาร'}[key]})).join('')}
 </section>
 <section class="health-overview-group health-measurements" aria-labelledby="hdMeasurementsGroup"><h2 id="hdMeasurementsGroup" class="health-group-title">น้ำหนักและส่วนสูง</h2>
 ${hdCard('weight','น้ำหนัก','weight',`<p class="health-measurement-value">${u.weight!==''&&u.weight!=null?`${esc(u.weight)} <small>กก.</small>`:'<span class="health-unknown">ยังไม่ระบุ</span>'}</p>`)}
 ${hdCard('height','ส่วนสูง','ruler',`<p class="health-measurement-value">${u.height!==''&&u.height!=null?`${esc(u.height)} <small>ซม.</small>`:'<span class="health-unknown">ยังไม่ระบุ</span>'}</p>`)}
 </section>
 <p class="health-privacy">${ic('lock',16,1.8)}<span>ข้อมูลนี้ใช้ในการปรึกษาที่คุณยินยอม ตรวจสอบให้เป็นปัจจุบันก่อนเริ่มปรึกษา</span></p></div>`;
}
function hdEditBlock(d,key,title,icon,placeholder){
 const value=d.health[key],error=d.errors[key];
 return `<section class="health-edit-section" aria-labelledby="hdEdit-${key}"><h2 id="hdEdit-${key}">${ic(icon,21,1.8)}${esc(title)}</h2>${ui.seg('hd-'+key,[['unknown','ยังไม่ทราบ'],['none','ไม่มี'],['set','ระบุข้อมูล']],value.mode,{a:'afHdMode',label:title})}${value.mode==='set'?`<div class="field ${error?'err':''}"><label class="f-l" for="hdText-${key}">ระบุ${esc(title)} <span class="reg-required" aria-hidden="true">*</span></label><textarea class="input" id="hdText-${key}" data-hd-text="${key}" rows="3" maxlength="1000" required aria-required="true" aria-invalid="${!!error}" aria-describedby="hdError-${key}" placeholder="${esc(placeholder)}">${esc(value.text)}</textarea></div>`:''}<p class="err-t" id="hdError-${key}" role="alert" ${error?'':'hidden'}>${esc(error||'')}</p></section>`;
}
function hdEdit(S,ctx){
 const d=hdDraft(S,ctx);
 return `<div class="health-page health-edit"><p class="health-edit-intro">กรอกข้อมูลตามที่ทราบ หากไม่แน่ใจเลือก “ยังไม่ทราบ” ได้</p>${hdEditBlock(d,...HD_EDIT_SECTIONS[0])}${HD_SECTIONS.map(args=>hdEditBlock(d,...args)).join('')}<section class="health-edit-section"><h2>${ic('weight',21,1.8)}น้ำหนัก</h2>${ui.field({id:'afHdW',label:'น้ำหนัก (กก.)',optional:true,value:String(d.weight??''),inputmode:'decimal',placeholder:'เช่น 58',bind:'_dr.weight',error:d.errors.weight,max:5})}</section><section class="health-edit-section"><h2>${ic('ruler',21,1.8)}ส่วนสูง</h2>${ui.field({id:'afHdH',label:'ส่วนสูง (ซม.)',optional:true,value:String(d.height??''),inputmode:'decimal',placeholder:'เช่น 160',bind:'_dr.height',error:d.errors.height,max:5})}</section><p class="health-privacy">${ic('lock',16,1.8)}<span>การแก้ไขจะเปลี่ยนข้อมูลของคุณเมื่อกดบันทึก</span></p></div>`;
}
TP.screen('health',{
 group:'account',title:'ข้อมูลสุขภาพของฉัน',code:'C505',ref:'A11',parent:'account',
 states:[['normal','ดูข้อมูลสุขภาพ'], ['unknown','ยังไม่ระบุ'], ['none','ระบุว่าไม่มี', true, 5], ['long-text','ข้อมูลหลายรายการ', true, 7]],
 notes:['หน้าสรุปเป็นรายการพื้นขาวแบ่งหมวดด้วยเส้นบาง น้ำหนักและส่วนสูงแยกคนละบรรทัด กดดินสอเพื่อแก้เฉพาะหมวดในแผ่นแก้ไข','แสดงเฉพาะข้อมูลสุขภาพที่ผู้ใช้กรอกเอง ไม่มีการ์ดบันทึกจากเภสัชกร','ยังไม่ทราบต่างจากไม่มี ไม่เติมโรคประจำตัวเมื่อไม่มีข้อมูล','ยาที่ใช้ประจำ โรคประจำตัว แพ้อาหาร ใช้ไม่มี/ยังไม่ทราบ/ระบุข้อมูลแบบตอนสมัคร','ข้อมูลแพ้ยาเป็นข้อมูลที่ผู้ใช้พิมพ์เอง แก้ไขและบันทึกได้เหมือนหมวดอื่น ไม่ขึ้นกล่องยืนยันเภสัชกร'],
 prep(S){
  const st=S.st.health;if(!st)return;
  const f=TP.fresh().user;
  Object.assign(S.user,{allergies:[...(f.allergies||[])],allergySrc:f.allergySrc||'',allergySources:undefined,allergyState:f.allergyState||'unknown',meds:[...(f.meds||[])],medState:f.meds?.length?'set':'unknown',conditions:['ความดันโลหิตสูง'],conditionState:'set',condNone:false,food:'',foodNone:true,foodState:'none',weight:f.weight??'',height:f.height??160,sfx:[]});
  if(st==='unknown'||st==='none'){const mode=st==='none'?'none':'unknown';Object.assign(S.user,{allergies:[],allergySrc:'',allergyState:mode,meds:[],medState:mode,conditions:[],conditionState:mode,condNone:mode==='none',food:'',foodState:mode,foodNone:mode==='none',weight:'',height:''});}
  if(st==='long-text')Object.assign(S.user,{meds:['แอมโลดิพีน 5 มก. วันละ 1 ครั้ง หลังอาหารเช้า','ยาตามที่แพทย์สั่งเพิ่มเติม กรุณาตรวจฉลากยาร่วมกับเภสัชกร'],conditions:['ความดันโลหิตสูง','ติดตามอาการกับแพทย์เป็นประจำ'],food:'กุ้ง เคยมีผื่นหลังรับประทาน',foodNone:false,foodState:'set'});
  S._dr=null;const entry=TP.cur();if(entry?.id==='health'){entry.params.healthEdit=['edit','invalid'].includes(st);delete entry.params._k;if(st==='invalid'){const d=hdDraft(S,entry);d.weight='abc';d.health.meds={mode:'set',text:''};d.errors=hdErrors(d);}}
 },
 render(ctx){
  if(ctx.params.healthEdit===undefined){ctx.params.healthEdit=['edit','invalid'].includes(ctx.state);if(ctx.state==='invalid'){const d=hdDraft(ctx.S,ctx);d.weight='abc';d.health.meds={mode:'set',text:''};d.errors=hdErrors(d);}}
  const editing=!!ctx.params.healthEdit;
  const left=editing?`<button type="button" class="back" data-a="afHdCancel">${ic('chevron-left',22,2.2)}<span>กลับ</span></button>`:undefined;
  return ui.nav({back:backL('account'),left,title:editing?'แก้ไขข้อมูลสุขภาพ':'ข้อมูลสุขภาพของฉัน'})+ui.page(editing?hdEdit(ctx.S,ctx):hdOverview(ctx.S))+(editing?ui.dock(`<div class="reg-nav-actions">${ui.btn('ยกเลิก',{a:'afHdCancel',kind:'secondary'})}${ui.btn('บันทึกข้อมูล',{a:'afHdSave',id:'afHdSave',disabled:!!ctx.S._dr?.busy})}</div>`):'' );
 },
 mount(el){el.addEventListener('input',event=>{const key=event.target.dataset?.hdText,d=TP.S._dr;if(key&&d?.form==='health'&&d.health[key])d.health[key].text=event.target.value;});}
});
TP.act('afHdEdit',async()=>{const entry=TP.cur();if(entry?.id!=='health')return;TP.S._dr=null;delete entry.params._k;entry.params.healthEdit=true;await TP.refresh({anim:false});});
TP.act('afHdCancel',async()=>{const entry=TP.cur();if(entry?.id!=='health'||TP.S._dr?.busy)return;TP.S._dr=null;delete entry.params._k;entry.params.healthEdit=false;await TP.refresh({anim:false});});
TP.act('afHdMode',async t=>{const d=TP.S._dr,key=t.closest('[data-segname]')?.dataset.segname.replace(/^hd-/,'');if(d?.form!=='health'||!d.health[key]||!['unknown','none','set'].includes(t.dataset.v))return;d.health[key].mode=t.dataset.v;delete d.errors[key];await TP.refresh({anim:false});});
/* Legacy household controls still use the shared draft helpers. */
TP.act('afCond',()=>{const d=TP.S._dr,el=curEl();if(!d||!el)return;d.conds=ui.chipVals(el,'afCond');if(d.conds.length&&d.condNone){d.condNone=false;$('#afCondNone',el)?.setAttribute('aria-checked','false');}});
TP.act('afHdSave',async()=>{
 const S=TP.S,d=S._dr,entry=TP.cur();if(d?.form!=='health'||d.busy||entry?.id!=='health'||!entry.params.healthEdit)return;
 d.allergies=d.health.allergies.mode==='set'?hdTextValues(d.health.allergies.text):[];d.allergyState=d.health.allergies.mode;d.errors=hdErrors(d);
 if(Object.keys(d.errors).length){await TP.refresh({anim:false});const field=$('[aria-invalid="true"]',curEl());field?.focus({preventScroll:true});field?.scrollIntoView({block:'center',behavior:RM()?'auto':'smooth'});TP.live(Object.values(d.errors)[0]);return;}
 d.busy=true;
 const allergyChanged=JSON.stringify(S.user.allergies||[])!==JSON.stringify(d.allergies)||S.user.allergyState!==d.allergyState;
 Object.assign(S.user,{allergies:[...d.allergies],allergyState:d.allergies.length?'set':d.allergyState,height:String(d.height??'').trim()===''?'':+d.height,weight:String(d.weight??'').trim()===''?'':+d.weight,meds:d.health.meds.mode==='set'?hdTextValues(d.health.meds.text):[],medState:d.health.meds.mode,conditions:d.health.conditions.mode==='set'?hdTextValues(d.health.conditions.text):[],conditionState:d.health.conditions.mode,condNone:d.health.conditions.mode==='none',food:d.health.food.mode==='set'?d.health.food.text.trim():'',foodState:d.health.food.mode,foodNone:d.health.food.mode==='none'});
 if(allergyChanged){S.user.allergySources=Object.fromEntries(d.allergies.map(a=>[a,d.algPhSources[a]||'ผู้ใช้ระบุ · รอเภสัชกรตรวจสอบ']));S.user.allergySrc='ผู้ใช้ปรับปรุงข้อมูล · รอเภสัชกรตรวจสอบ';if(d.algRmReq?.length)S.user.allergyRemovalRequests=[...new Set([...(S.user.allergyRemovalRequests||[]),...d.algRmReq])];}
 S._dr=null;entry.params.healthEdit=false;delete entry.params._k;TP.emit('state');await TP.refresh({anim:false});TP.notify('บันทึกข้อมูลสุขภาพแล้ว');
});

/* C517: edit only the selected patient-entered field. Dismissal never writes. */
const HD_FIELDS={...Object.fromEntries(HD_EDIT_SECTIONS.map(([key,title,icon,placeholder])=>[key,{title,icon,placeholder}])),weight:{title:'น้ำหนัก',icon:'weight',unit:'กก.',max:500},height:{title:'ส่วนสูง',icon:'ruler',unit:'ซม.',max:300}};
function hdFieldDraft(S,key){if(!HD_FIELDS[key])key='allergies';const record=hdRecord(S.user),numeric=!!HD_FIELDS[key].unit;return {key,mode:numeric?'set':record[key].mode,value:numeric?String(S.user[key]??''):record[key].text,error:'',busy:false};}
function hdFieldError(d){const spec=HD_FIELDS[d.key],text=String(d.value||'').trim();if(spec.unit)return text&&(!/^\d{1,3}(\.\d)?$/.test(text)||+text<=0||+text>spec.max)?`กรอก${spec.title}มากกว่า 0 ถึง ${spec.max} ${spec.unit} ทศนิยมได้ 1 ตำแหน่ง`:'';return d.mode==='set'&&!text?'กรอกข้อมูล หรือเลือก “ไม่มี” / “ยังไม่ทราบ”':text.length>1000?'กรอกไม่เกิน 1,000 ตัวอักษร':'';}
TP.sheetDef('healthfield',{
 group:'account',title:'แก้ไขข้อมูลสุขภาพ',sheetTitle:ctx=>'แก้ไข'+HD_FIELDS[(ctx.S._healthField||{}).key||'allergies'].title,code:'C517',host:'health',
 states:[['allergies','แก้ไขประวัติแพ้ยา'],['meds','แก้ไขยาที่ใช้ประจำ'],['conditions','แก้ไขโรคประจำตัว'],['food','แก้ไขประวัติแพ้อาหาร'],['weight','แก้ไขน้ำหนัก'],['height','แก้ไขส่วนสูง'],['unknown','ยังไม่ทราบ'],['none','ระบุว่าไม่มี'],['invalid','กรอกข้อมูลไม่ครบ']],
 notes:['แก้ไขทีละกล่องจากไอคอนบนหัวการ์ด','ข้อมูลที่คนไข้ระบุเอง ข้อความหลายบรรทัดเป็นข้อความเดียว','บันทึกเปลี่ยนเฉพาะหมวดที่เปิด ปิดหรือยกเลิกคงข้อมูลเดิม'],
 prep(S){const st=S.st.healthfield;S._healthField=hdFieldDraft(S,HD_FIELDS[st]?st:'allergies');if(['unknown','none'].includes(st))S._healthField.mode=st;if(st==='invalid'){S._healthField.mode='set';S._healthField.value='';S._healthField.error=hdFieldError(S._healthField);}},
 render(ctx){const d=ctx.S._healthField||=(hdFieldDraft(ctx.S,ctx.params.key)),spec=HD_FIELDS[d.key];return `<div class="health-field-editor">${spec.unit?'':ui.seg('hd-field-mode',[['unknown','ยังไม่ทราบ'],['none','ไม่มี'],['set','ระบุข้อมูล']],d.mode,{a:'afHdFieldMode',label:spec.title})}<div class="field" id="hdFieldInput" ${!spec.unit&&d.mode!=='set'?'hidden':''}><label for="hdFieldValue">${spec.title}${spec.unit?' ('+spec.unit+') <span class="opt-t">(ไม่บังคับ)</span>':' <span class="reg-required" aria-hidden="true">*</span>'}</label>${spec.unit?`<input class="input" id="hdFieldValue" data-bind="_healthField.value" inputmode="decimal" maxlength="5" value="${esc(d.value)}">`:`<textarea class="input" id="hdFieldValue" data-bind="_healthField.value" rows="5" maxlength="1000" placeholder="${esc(spec.placeholder)}" ${d.mode==='set'?'required aria-required="true"':''}>${esc(d.value)}</textarea>`}</div><p class="err-t" id="hdFieldError" role="alert" ${d.error?'':'hidden'}>${esc(d.error)}</p></div>`;},
 foot:()=>`<div class="reg-nav-actions">${ui.btn('ยกเลิก',{kind:'secondary',closeSheet:true})}${ui.btn('บันทึกข้อมูล',{a:'afHdFieldSave',id:'hdFieldSave'})}</div>`,
 mount(el,ctx){const input=$('#hdFieldValue',el),error=$('#hdFieldError',el);input?.setAttribute('aria-describedby','hdFieldError');input?.setAttribute('aria-invalid',String(!!ctx.S._healthField.error));el.addEventListener('input',()=>{if(ctx.S._healthField){ctx.S._healthField.error='';error.hidden=true;input.setAttribute('aria-invalid','false');}});},
 close(){TP.S._healthField=null;}
});
TP.act('afHdFieldOpen',t=>{const key=t.dataset.v;if(!HD_FIELDS[key])return;TP.S._healthField=hdFieldDraft(TP.S,key);return TP.sheet('healthfield',{key});});
TP.act('afHdFieldMode',t=>{const d=TP.S._healthField;if(!d||!['unknown','none','set'].includes(t.dataset.v))return;d.mode=t.dataset.v;d.error='';const el=TP.sheetOpen()?.el,wrap=$('#hdFieldInput',el),input=$('#hdFieldValue',el),error=$('#hdFieldError',el);if(wrap)wrap.hidden=d.mode!=='set';if(input){input.required=d.mode==='set';input.setAttribute('aria-required',String(input.required));input.setAttribute('aria-invalid','false');if(input.required)input.focus();}if(error)error.hidden=true;});
TP.act('afHdFieldSave',async()=>{const S=TP.S,d=S._healthField;if(!d||d.busy)return;d.error=hdFieldError(d);if(d.error){const el=TP.sheetOpen()?.el,error=$('#hdFieldError',el),input=$('#hdFieldValue',el);if(error){error.textContent=d.error;error.hidden=false;}input?.setAttribute('aria-invalid','true');input?.focus();TP.live(d.error);return;}d.busy=true;const u=S.user,key=d.key,values=d.mode==='set'?hdTextValues(d.value):[];if(HD_FIELDS[key].unit)u[key]=String(d.value).trim()===''?'':+d.value;else if(key==='allergies'){u.allergies=values;u.allergyState=d.mode;u.allergySources=Object.fromEntries(values.map(v=>[v,'ผู้ใช้ระบุ']));u.allergySrc='ผู้ใช้ระบุ';}else if(key==='meds'){u.meds=values;u.medState=d.mode;}else if(key==='conditions'){u.conditions=values;u.conditionState=d.mode;u.condNone=d.mode==='none';}else{u.food=d.mode==='set'?d.value.trim():'';u.foodState=d.mode;u.foodNone=d.mode==='none';}S._dr=null;TP.emit('state');await TP.closeSheet();await TP.refresh({anim:false});TP.notify('บันทึก'+HD_FIELDS[key].title+'แล้ว');});

/* =====================================================================
   Delete account (N3) + deleted
   ===================================================================== */
/* Destructive account action stays in a typed-confirmation sheet (C511). */
TP.deleteAccountBlocked=S=>caseOpen()?'open':S.case?.order?.status==='pending'?'unpaid':'';
TP.accountService={async remove(){await TP.wait(RM()?50:600);if(TP.S.st.deleteacc==='save-error')throw Error('Preview deletion failure');}};
TP.sheetDef('deleteacc',{
 group:'account',title:'ลบบัญชี',code:'C511',ref:'N3',host:'account',
 states:[['normal','พิมพ์ยืนยันก่อนลบ'],['blocked','มีการปรึกษาค้าง'],['unpaid','มีรายการรอชำระ'],['typed','พิมพ์ยืนยันครบ'],['wrong-text','พิมพ์ไม่ตรง'],['save-error','ลบไม่สำเร็จ']],
 notes:['เปิดกล่องยืนยันจากหน้าบัญชี แสดงผลที่จะเกิดขึ้นก่อนช่องกรอก','พิมพ์คำว่า ยืนยัน ตรงกันเท่านั้นจึงลบได้ ไม่กรอกให้จากระบบ autofill','คงตัวกันลบระหว่างปรึกษาหรือมีรายการยาค้างชำระ','ต้นแบบจำลองการลบและการล้มเหลว ยังไม่มีการลบบัญชีบนเซิร์ฟเวอร์'],
 prep(S){const st=S.st.deleteacc;if(!st)return;S._delTxt=['typed','save-error'].includes(st)?'ยืนยัน':st==='wrong-text'?'ลบบัญชี':'';S._delBusy=false;S._delError=st==='save-error'?'ยังลบบัญชีไม่สำเร็จ ข้อมูลยังอยู่ กรุณาลองอีกครั้ง':'';S._delAttempt=null;if(st==='blocked'){if(!caseOpen()&&TP.newCase)TP.newCase();}else if(st==='unpaid'){const c=closedCase();c.order.status='pending';S.case=c;}else S.case=null;},
 render(ctx){
  const S=ctx.S,block=TP.deleteAccountBlocked(S),ready=!block&&String(S._delTxt||'').trim()==='ยืนยัน';
  return `<div class="account-delete-info">${ic('trash',36,1.8)}<p>ลบบัญชีถาวรและกู้คืนไม่ได้</p><p class="hint">ข้อมูลและประวัติการปรึกษาจะหายจากแอป</p></div>${block?ui.note(block==='open'?'มีการปรึกษาที่ยังไม่จบ กรุณาจบการปรึกษาหรือออกจากคิวก่อนลบบัญชี':'มีรายการยารอชำระ กรุณาจัดการรายการให้เรียบร้อยก่อนลบบัญชี',{tone:'warn',icon:'circle-alert'})+ui.btn(block==='open'?'ไปที่การปรึกษา':'ดูรายการรอชำระ',{a:'afDeleteResolve',kind:'secondary'}):''}<div class="field account-delete-confirm"><label for="afDelTxt">พิมพ์คำว่า <b>ยืนยัน</b> เพื่อลบบัญชี <span class="reg-required" aria-hidden="true">*</span></label><input class="input" id="afDelTxt" data-bind="_delTxt" data-a="afDelType" data-no-preview-fill autocomplete="off" spellcheck="false" maxlength="20" required aria-required="true" aria-describedby="afDelHint" value="${esc(S._delTxt||'')}" ${block?'disabled':''}><p class="hint" id="afDelHint">${ready?'ตรวจสอบรายละเอียดแล้วจึงกดลบบัญชี':'พิมพ์ “ยืนยัน” ให้ตรงกันเพื่อเปิดปุ่มลบ'}</p><p class="err-t" id="afDelError" role="alert" ${S._delError?'':'hidden'}>${esc(S._delError||'')}</p></div>`;
 },
 foot(ctx){return ui.btn('ลบบัญชี',{kind:'danger',a:'afDelGo',id:'afDelGo',icon:'trash',disabled:!!TP.deleteAccountBlocked(ctx.S)||String(ctx.S._delTxt||'').trim()!=='ยืนยัน'||!!ctx.S._delBusy})+ui.btn('ยกเลิก',{kind:'ghost',closeSheet:true});},
 close(){TP.S._delError='';TP.S._delAttempt=null;TP.S._delBusy=false;}
});
TP.act('afDeleteOpen',()=>{TP.S._delTxt='';TP.S._delBusy=false;TP.S._delError='';TP.S._delAttempt=null;TP.S.st.deleteacc='normal';return TP.sheet('deleteacc');});
TP.act('afDeleteResolve',async t=>{const block=TP.deleteAccountBlocked(TP.S),c=TP.S.case;await TP.closeSheet({instant:true});if(block==='open')return TP.go(['matched','room'].includes(c?.status)?'room':'queue',{via:'cover'});if(block==='unpaid')return TP.ACTS.openOrderPayment(t,{params:{caseId:c.id}});});
TP.act('afEditProf', () => {
  TP.S._profileEdit=null;
  const u = TP.S.user, [first, ...rest] = String(u.full || u.name || '').trim().split(/\s+/);
  TP.go('personaledit');
});
TP.act('afDelType',t=>{
 if(t?.value!==undefined)TP.S._delTxt=t.value;
 const el=t?.closest?.('#sheet')||TP.sheetOpen()?.el||curEl(),button=$('#afDelGo',el),ready=!TP.deleteAccountBlocked(TP.S)&&String(TP.S._delTxt||'').trim()==='ยืนยัน';
 if(button)button.disabled=!ready||!!TP.S._delBusy;
 const hint=$('#afDelHint',el);if(hint)hint.textContent=ready?'ตรวจสอบรายละเอียดแล้วจึงกดลบบัญชี':'พิมพ์ “ยืนยัน” ให้ตรงกันเพื่อเปิดปุ่มลบ';
});
TP.act('afDelGo',async t=>{
 const S=TP.S;if(S._delBusy||TP.deleteAccountBlocked(S)||String(S._delTxt||'').trim()!=='ยืนยัน')return;
 const attempt={};S._delAttempt=attempt;S._delBusy=true;if(t){t.disabled=true;t.classList.add('busy');}
 try{
  await TP.accountService.remove();if(S._delAttempt!==attempt)return;
  Object.assign(S,{loggedIn:false,consent:false,history:[],family:[],inbox:[],case:null,notif:false,_delTxt:'',_dr:null,_clog:[],addrs:[],_gone:true});
  TP.freshAccount?.(S);S.user={name:'',last:'',full:'',phone:'',email:'',allergies:[],allergyState:'unknown',meds:[],conditions:[],food:'',weight:'',height:''};S._authFlows={};
  TP.emit('state');await TP.closeSheet({instant:true});return TP.go('deleted',{via:'fade',root:true});
 }catch{S._delError='ยังลบบัญชีไม่สำเร็จ ข้อมูลยังอยู่ กรุณาลองอีกครั้ง';const el=TP.sheetOpen()?.el,error=$('#afDelError',el);if(error){error.hidden=false;error.textContent=S._delError;}TP.live(S._delError);}
 finally{S._delBusy=false;if(t){t.classList.remove('busy');t.disabled=!!TP.deleteAccountBlocked(S)||String(S._delTxt||'').trim()!=='ยืนยัน';}}
});
TP.screen('deleted', {
  group: 'account', title: 'ลบบัญชีแล้ว', code: 'C512', ref: 'N3',
  notes: ['ยืนยันแบบสงบ บอกสิ่งที่เกิดต่อจากนี้', 'สอบถามเรื่องข้อมูลส่วนบุคคล dpo@mitraree.com', 'ปุ่มกลับไปหน้าเข้าสู่ระบบ (ล้างประวัติการย้อนกลับ)'],
  render: () => ui.page(`<div class="fill af-done">
      <div class="af-done-c" data-in="0">${brand.halo(112, { check: true, draw: true, still: true })}<h2 class="h2">ลบบัญชีแล้ว</h2><p class="body">ขอบคุณที่ใช้บริการมิตรอารี</p></div>
      <div class="card" data-in="1"><h3 class="h3">ต่อจากนี้</h3><ul class="af-bl mt8">
        <li>${ic('circle-check', 18, 2)}<span>ข้อมูลที่ระบุตัวคุณถูกลบหรือปิดแล้ว และออกจากระบบบนเครื่องนี้</span></li>
        <li>${ic('file-text', 18, 2)}<span>เอกสารที่จำเป็นต้องเก็บรักษาเป็นไปตามนโยบายความเป็นส่วนตัว</span></li>
        <li>${ic('user-plus', 18, 2)}<span>สมัครใหม่ได้ทุกเมื่อด้วยเบอร์โทร แต่ประวัติเดิมจะไม่กลับมา</span></li></ul></div>
      <p class="af-foot" data-in="2">${ic('shield-check', 14, 2)}<span>สอบถามเรื่องข้อมูลส่วนบุคคล ${dpoLink()}</span></p>
    </div>`, { nonav: true }) + ui.dock(ui.btn('กลับสู่หน้าเข้าสู่ระบบ', { a: 'afAfterDel' }), { clear: true })
});
TP.act('afAfterDel', () => TP.go(TP.SCREENS.login ? 'login' : TP.SCREENS.splash ? 'splash' : 'home', { via: 'fade', root: true }));

/* =====================================================================
   Help: customer service + FAQ
   ===================================================================== */
const FAQ = [
  ['ปรึกษาเภสัชกรมีค่าใช้จ่ายไหม', 'ไม่มีค่าปรึกษา จ่ายเฉพาะเมื่อซื้อยาที่เภสัชกรจัดให้ และเลือกได้ว่าจะซื้อหรือไม่'],
  ['ปรึกษาได้เวลาไหน', 'ทุกวัน 09:00-21:00 ตามเวลาเปิดของสาขาที่เปิดรับ นอกเวลาฝากคำถามไว้ได้ เภสัชกรตอบ' + TP.OF_REPLY],
  ['วิดีโอคอลถูกบันทึกไหม', 'ไม่มีการบันทึกวิดีโอ ส่วนแชท ใบสรุป และบันทึกการจ่ายยาเก็บ 1 ปีนับจากวันปิดเคส ตามที่ อย. กำหนด'],
  ['มีอาการผิดปกติหลังใช้ยา ทำอย่างไร', 'เริ่มปรึกษาเภสัชกรในแอปแล้วเล่าอาการและชื่อยาที่ใช้ ถ้าหายใจลำบาก ปากหรือหน้าบวม ไปโรงพยาบาลทันที']
];
TP.screen('help', {
  group: 'account', title: 'ช่วยเหลือ', code: 'C509', parent: 'account',
  states: [['open', 'ในเวลาทำการ'], ['closed', 'นอกเวลาทำการ']],
  notes: ['ฝ่ายบริการลูกค้า 10:00-18:00 ติดป้ายแยกจากเวลาร้าน 09:00-21:00', 'คำถามที่พบบ่อย 5 ข้อ แตะเพื่อเปิด', 'เปิดคำประกาศความเป็นส่วนตัวสำหรับลูกค้าในแอป'],
  render(ctx) {
    const closed = ctx.state === 'closed';
    return ui.nav({ back: backL('account'), title: 'ช่วยเหลือ' }) + ui.page(`
      <div class="card af-cc" data-in="1">
        <div class="af-cc-h"><span class="af-cc-i">${ic('headset', 24, 1.8)}</span><div class="grow"><b>ฝ่ายบริการลูกค้า</b><span>บัญชี การชำระเงิน และการจัดส่ง</span></div>${closed ? ui.tag('ปิดอยู่', 'muted', { dot: true }) : ui.status('ok', 'เปิดอยู่')}</div>
        <a class="btn ${closed ? 'secondary' : 'primary'} mt16" href="${TP.support[0]}" target="_blank" rel="noopener noreferrer">${ic('message-circle', 20, 2)}<span>ติดต่อผ่าน ${TP.support[1]}</span></a>
        ${closed ? '<p class="small mt8">เปิดอีกครั้ง 10:00 · เรื่องยาและอาการ ปรึกษาเภสัชกรในแอปได้ถึง 21:00</p>' : ''}
      </div>
      <div class="card af-hours" data-in="2">${ui.kv([['ฝ่ายบริการลูกค้า', 'ทุกวัน 10:00-18:00'], ['ร้านและเภสัชกรในแอป', 'ทุกวัน 09:00-21:00']])}<p class="small mt8">เวลาเภสัชกรเป็นไปตามเวลาเปิดของแต่ละสาขา</p></div>
      <h3 class="group-h">คำถามที่พบบ่อย</h3>
      <div class="group af-faq" data-in="3">${FAQ.map(([q, a], i) => `<div class="af-faq-i"><h4><button type="button" class="af-faq-q" id="afFaqQ${i}" aria-expanded="false" aria-controls="afFaq${i}" data-a="afFaq"><span>${esc(q)}</span>${ic('chevron-down', 18, 2.2)}</button></h4>${rvHtml('afFaq' + i, false, `<p class="af-faq-a">${esc(a)}</p>`)}</div>`).join('')}</div>
      <div class="card af-dpo" data-in="4"><span class="af-cs-i">${ic('shield-check', 20, 1.9)}</span><div class="grow"><b>เรื่องข้อมูลส่วนบุคคล</b><span>เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล</span><button type="button" class="txtbtn" data-a="stDoc" data-v="notice" aria-haspopup="dialog">คำประกาศความเป็นส่วนตัวสำหรับลูกค้า/ผู้ใช้บริการ</button></div></div>
      `, { lt: 'ช่วยเหลือ' });
  }
});
TP.act('afFaq', t => {
  const on = t.getAttribute('aria-expanded') !== 'true';
  t.setAttribute('aria-expanded', String(on));
  rv(document.getElementById(t.getAttribute('aria-controls')), on);
});
})();

/* ===== 99-boot.js ===== */
/* =====================================================================
   99 · Boot. URL: ?screen=<id> jump straight to a screen · ?chrome=1|0 status bar
   · ?bare=1 phone only · ?first=1 start as a first-time user · ?splash=0 skip splash
   · ?state=<k> open the screen in that state · ?still=1 freeze on the first screen (flow board
   thumbnails: timers that would move to the next screen are ignored) · ?registry=1 post the
   screen list to the parent page (flow board reads it, works from file:// too)
   ===================================================================== */
(() => {
const Q = new URLSearchParams(location.search), R = document.documentElement;
const bare = Q.get('bare') === '1';
const isMob = () => !bare && matchMedia('(max-width: 760px)').matches;
function mode() {
  const mob = isMob();
  R.classList.toggle('bare', bare);
  R.classList.toggle('mob', mob);
  const c = Q.get('chrome');
  R.classList.toggle('chrome', c ? c === '1' : !mob && !bare);
  fit();
}
function fit() {
  const dv = TP.$('#device'), st = TP.$('#stage');
  if (R.classList.contains('mob') || bare) { dv.style.removeProperty('--k'); return; }
  const frame = TP.$('.device-frame-image', dv);
  const density = Math.max(1, window.devicePixelRatio || 1);
  const rasterLimit = (frame?.naturalWidth || 1520) / (dv.offsetWidth * density);
  const k = Math.max(0, Math.min(rasterLimit, (st.clientHeight - 24) / dv.offsetHeight, (st.clientWidth - 24) / dv.offsetWidth));
  dv.style.setProperty('--k', k.toFixed(4));
}
mode();
addEventListener('resize', TP.rafT(mode));
// The preview also follows workspace/panel resizing without a window resize.
const previewSizeObserver = new ResizeObserver(TP.rafT(fit));
previewSizeObserver.observe(TP.$('#stage'));
TP.icons(document.getElementById('app'));
/* ?motif=curve|glow|type : trial replacements for the "+" pattern (home hero only for now) */
TP.MOTIF = ['plus', 'curve', 'glow', 'type'].includes(Q.get('motif')) ? Q.get('motif') : 'glow';   /* v1.2 default = glow (owner 19/10/2026) */
document.documentElement.dataset.motif = TP.MOTIF;
if (Q.get('first') === '1') TP.setFlag('firstTime', true);
if (Q.get('first') === '1') Object.assign(TP.S, { firstTime: true, loggedIn: false, consent: false, notifAsked: false, notif: false });
TP.panel.render();
if (Q.get('registry') === '1' && parent !== window) {
  const title = d => typeof d.title === 'function' ? d.title({ S: TP.S, params: {} }) : d.title;
  parent.postMessage({ tpRegistry: {
    version: TP.DESIGN_VERSION, groups: TP.GROUPS,
    items: TP.ORDER.map(TP.def).filter(d => !d.hidden).map(d => ({ id: d.id, kind: d.kind, group: d.group, title: title(d), code: d.code || '', states: TP.positionalStates(d.states), retiredStates:[], parent: d.parent || '', host: d.host || '', notes: (d.notes || []).length, wait: (d.wait || []).length }))
  } }, '*');
}
const requested = Q.get('screen'), want = requested === 'branch' ? 'home' : requested === 'otp' ? 'login' : requested, st = ['branch','otp'].includes(requested) ? null : Q.get('state');
if (['branch','otp'].includes(requested)) { Q.set('screen', want); Q.delete('state'); history.replaceState(null, '', location.pathname + '?' + Q.toString() + location.hash); }
if (want && st) TP.S.st[want] = st;
let boot;
if (want && TP.def(want)) {
  const historyOutcome = want === 'summary' ? Q.get('historyOutcome') : null;
  boot = TP.jump(want, { via: 'none', params: historyOutcome ? { historyOutcome } : undefined });
}
else if (Q.get('splash') === '0' || !TP.SCREENS.splash) boot = TP.go(!TP.S.loggedIn && TP.SCREENS.login ? 'login' : 'home', { via: 'none', root: true });
else boot = TP.go('splash', { via: 'none', root: true });
if (Q.get('still') === '1') Promise.resolve(boot).then(() => setTimeout(() => {
  const no = () => Promise.resolve();
  TP.go = TP.back = TP.sheet = TP.closeSheet = TP.jump = TP.tab = no;
}, 0));
/* keyboard back on desktop (Alt+Left) for quick testing */
addEventListener('keydown', e => { if (e.altKey && e.key === 'ArrowLeft') TP.back(); });
window.__tp = TP; /* for QA scripts */
})();


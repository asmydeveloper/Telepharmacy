
/* ===== 00-core.js ===== */
/* =====================================================================
   00 · Core: utilities, springs, icons, odometer, money, mock data
   Everything hangs off one global: window.TP
   ===================================================================== */
const TP = window.TP = {};
/* Fictional generated portraits for the prototype. Doctor is an available asset,
   not a new clinical service or consultation route. */
TP.demoProfiles = {"doctor": "/assets/2e859134738f7da9b2.png", "kid": "/assets/29f3f6d06e939b6966.png", "mom": "/assets/e8e22abc6ab0e8d75d.png", "pharmacist_f": "/assets/photos/pharmacist-v1.png", "pharmacist_m": "/assets/667d2683bb4711f58c.png", "self": "/assets/photos/customer-v1.png", "dad": "/assets/photos/family-dad-v1.png", "sp": "/assets/photos/family-spouse-v1.png", "kid2": "/assets/photos/family-younger-child-v1.png"};
TP.profileImage = who => TP.demoProfiles[who === 'me' || !who ? 'self' : who] || '';

TP.$ = (s, r = document) => r.querySelector(s);
TP.$$ = (s, r = document) => [...r.querySelectorAll(s)];
TP.clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const RM = matchMedia('(prefers-reduced-motion: reduce)');
TP.RED = () => RM.matches;
TP.FINE = matchMedia('(hover: hover) and (pointer: fine)');
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
  'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  'wifi-off': '<path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  headset: '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/>',
  'ellipsis-vertical': '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  sliders: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
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
TP.NOW = { date: '18/10/2026', time: '14:12' };
TP.PHARM = {
  kj: { id: 'kj', name: 'ภญ.ขวัญใจ เอื้อภราดร', short: 'ภญ.ขวัญใจ', lic: 'ภ.45279', ini: 'ขจ', shift: '08:55', photo: '/assets/288682665289edf4c6.jpg' },
  tp: { id: 'tp', name: 'ภก.ธัชพล', short: 'ภก.ธัชพล', lic: 'ภ.23577', ini: 'ธพ', shift: '08:58' }
};
TP.BRANCHES = [
  { id: 'tw', photo: '/assets/stores/pharmacy-thumbnail-v1.png', name: 'สาขาตลาดเวิลด์', short: 'ตลาดเวิลด์', lic: 'ข.ย.5 กท 29/2566', km: 1.2, hours: '09:00-21:00', phone: '082-053-9915', pharm: 'kj', area: 'ตลาดเวิลด์มาร์เก็ต ทวีวัฒนา',
    addr: '109/14 ตลาดเวิลด์มาร์เก็ต ถ.เลียบคลองทวีวัฒนา แขวงทวีวัฒนา เขตทวีวัฒนา กรุงเทพมหานคร 10170', map: 'https://maps.app.goo.gl/VT33qesgA1wKDnj57' },
  { id: 'on', photo: '/assets/stores/on-v1.png', name: 'สาขาอ่อนนุช', short: 'อ่อนนุช', lic: 'ข.ย.5 กท 52/2567', km: 4.8, hours: '09:00-21:00', phone: '080-235-3950', pharm: 'tp', area: 'ซอยสุขุมวิท 77',
    addr: '16 ซอยสุขุมวิท 77 แขวงพระโขนงเหนือ เขตวัฒนา กรุงเทพมหานคร 10110', map: 'https://maps.app.goo.gl/An74SFhk1YE56BNB7' }
];
/* Design preview stores: fictional records; no real licence or contact details. */
TP.BRANCHES.push(...[
  ['demo-1','ร้านยาสุขใจ',3.1,'08:00-21:00'], ['demo-2','ร้านยาใกล้บ้าน',4.6,'09:00-22:00'],
  ['demo-3','ร้านยาอารีเฮลท์',6.2,'08:30-20:30'], ['demo-4','ร้านยาอบอุ่น',8.4,'09:00-20:00'],
  ['demo-5','ร้านยาพร้อมดูแล',10.2,'08:00-22:00']
].map(([id,name,km,hours])=>({id,name,photo:`/assets/stores/${id}-v1.png`,short:name,km,hours,demo:true,pharm:'kj',area:'ข้อมูลร้านตัวอย่าง',addr:'ที่อยู่ร้านตัวอย่าง',lic:'ข้อมูลตัวอย่าง',phone:'',map:''})));
/* store-level facts every error screen and the pharmacist pass can show (licence from the old LIFF mask, owner to confirm) */
TP.STORE = { lic: 'ข.ย.5 กท 29/2566', cs: '098-035-8000', csHours: '10:00-18:00' };
/* item 70 (owner 20/10 "12.00 ดีกว่า"): a question left while the store is closed is answered by 12:00 on the day it opens */
TP.OF_REPLY = 'ภายใน 12:00 ของวันที่ร้านเปิด';
/* A2 (FDA notice 2.1(3), "before the service" = every case): steps and risks the customer ticks before joining the queue.
   Version goes with the tick to the console (B8). Draft wording: pharmacist + legal review before launch */
TP.RISK = {
  ver: 'ฉบับที่ 1',
  steps: ['แจ้งอาการ แล้วรอคิว เภสัชกรของสาขาที่เลือกรับเคส', 'คุยทางแชทหรือวิดีโอ เภสัชกรอาจถามเพิ่มหรือขอดูรูป', 'เภสัชกรแนะนำการดูแล ถ้าต้องใช้ยา ส่งรายการยาให้ชำระในแอป', 'รับยาที่ร้าน หรือให้ร้านส่ง เฉพาะในเขตส่งยา', 'ได้ใบสรุปการปรึกษาทุกครั้ง แม้ไม่ได้ซื้อยา'],
  risks: ['เภสัชกรไม่ได้ตรวจร่างกายคุณ คำแนะนำมาจากสิ่งที่คุณเล่าและรูปที่ส่ง', 'ข้อมูลที่ไม่ครบหรือไม่ตรง อาจทำให้คำแนะนำคลาดเคลื่อน', 'บางอาการ เภสัชกรจะแนะนำให้ไปโรงพยาบาลแทนการจ่ายยา', 'สัญญาณอินเทอร์เน็ตอาจหลุดระหว่างคุย เคสและแชทไม่หาย ต่อใหม่ได้', 'การส่งยาอาจช้ากว่าที่แจ้ง ตามบริษัทขนส่ง', 'อาการฉุกเฉิน ไปโรงพยาบาลหรือโทร 1669 ทันที ไม่ต้องรอคิว'],
  data: 'บันทึกการปรึกษาเก็บ 1 ปีนับจากวันปิดเคส · ไม่มีการบันทึกวิดีโอ'
};
/* step 4 names the zone, so it follows the switch too */
TP.riskHtml = () => `<div class="risk"><p class="risk-h">ขั้นตอน</p><ol class="risk-l">${TP.RISK.steps.map((x, i) => `<li>${TP.esc(i === 3 ? 'รับยาที่ร้าน หรือให้ร้านส่ง · ' + TP.zoneLine() : x)}</li>`).join('')}</ol><p class="risk-h">ความเสี่ยงที่ควรรู้</p><ul class="risk-l">${TP.RISK.risks.map(x => `<li>${TP.esc(x)}</li>`).join('')}</ul><p class="risk-d">${TP.esc(TP.RISK.data)}</p></div>`;
TP.SYMPTOMS = ['ไข้', 'ไอ', 'เจ็บคอ', 'น้ำมูก', 'คัดจมูก', 'ปวดหัว', 'ปวดท้อง', 'ท้องเสีย', 'ผื่น', 'คัน', 'ปวดกล้ามเนื้อ', 'ตาแดง', 'แสบตา', 'ถามเรื่องยา'];
TP.URGENT = ['หายใจลำบาก', 'เจ็บแน่นหน้าอก', 'ซึม สับสน หรือชัก', 'ปากบวม หน้าบวมหลังใช้ยา', 'อาเจียนหรือถ่ายเป็นเลือด', 'ไข้สูงในเด็กเล็กต่ำกว่า 3 เดือน'];
TP.ORDER_ITEMS = [
  { name: 'ยาอมบรรเทาอาการเจ็บคอ', qty: '1 กล่อง', type: 'ยาอันตราย', price: 120, how: 'อมครั้งละ 1 เม็ด ทุก 3 ชั่วโมง ไม่เกิน 8 เม็ดต่อวัน' },
  { name: 'พาราเซตามอล 500 มก.', qty: '1 แผง', type: 'ยาสามัญประจำบ้าน', price: 40, how: 'ครั้งละ 1 เม็ด เมื่อปวดหรือมีไข้ ห่างกันอย่างน้อย 6 ชั่วโมง' },
  { name: 'สเปรย์พ่นคอ', qty: '1 ขวด', type: 'ยาอันตราย', price: 225, how: 'พ่น 2 ครั้ง วันละ 3 ครั้ง หลังอาหาร' }
];
/* Photo adapter: illustrative assets can be replaced by product.image from real data. */
TP.medicinePhoto = item => item.image || (/ยาอม/.test(item.name) ? '/assets/photos/lozenges-v1.png' : /พาราเซตามอล 500/.test(item.name) ? '/assets/photos/medicine-v1.png' : /สเปรย์พ่นคอ/.test(item.name) ? '/assets/photos/spray-v1.png' : '');
TP.medicineImage = item => { const src = TP.medicinePhoto(item); return src ? `<img class="medicine-photo" src="${TP.esc(src)}" alt="ภาพประกอบ${TP.esc(item.name)}" width="56" height="56" loading="lazy">` : ''; };
/* 3 ways to receive, same order and words as the website checkout (cart-shipping-method.blade.php:407-457).
   express fee = mock Lalamove quote (the real one is asked after an address + pin); parcel fee comes from TP.COURIERS */
TP.DELIVERY = [
  { id: 'pickup', name: 'รับที่หน้าร้านสาขา', sub: '', fee: 0, icon: 'store' },
  { id: 'express', name: 'จัดส่งด่วน', sub: '1-4 ชม. · ไม่เกิน 15 กม. จากสาขา · ต้องยืนยันตำแหน่ง', fee: 89, icon: 'zap' },
  { id: 'parcel', name: 'จัดส่งพัสดุ', sub: '1-3 วัน · กรุงเทพ หรือไม่เกิน 15 กม. จากสาขา', fee: null, icon: 'package' }
];
/* active couriers on the website today (CourierCompanySeeder + CourierCompany::getDeliveryTimeAttribute); fees = earlier real quotes */
TP.COURIERS = [
  { id: 'flash', name: 'Flash Express', ini: 'FLASH', time: '1-3 วัน', fee: 25 },
  { id: 'dhl', name: 'DHL Express', ini: 'DHL', time: '1-2 วัน', fee: 20 }
];
/* website mobile banking list (CSM:1907-1911) · built but switched off on the website (features.mobile_banking_enabled=false) */
/* A7 (owner 20/10 "ส่ง inter express logistic ไปเรียกแบบ manual ไม่มี api"): a list with a cold-chain medicine goes by pickup
   or Inter Express only; the store books the van by phone and types the tracking number.
   Owner 20/10 "ค่าบริการคงที่ 300 บาท": one fixed fee, known before the address is checked · the days are a sample */
TP.COLD = { id: 'cold', name: 'Inter Express Logistics', short: 'Inter Express', time: '1-2 วัน', fee: 300 };
/* the console's cold-chain sample (TW-00977); a panel state adds it to the list and the total follows */
TP.COLD_ITEM = { name: 'จุลินทรีย์ชนิดแคปซูล (เก็บในตู้เย็น)', qty: '1 กล่อง', type: 'ยาอันตราย', price: 290, how: 'รับประทานครั้งละ 1 แคปซูล วันละ 2 ครั้ง ก่อนอาหาร · เก็บในตู้เย็น 2-8 องศา', cold: true };
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
TP.zoneOf = (a, br) => { if (!a) return null; const branch = br || TP.S.branch, known = ROAD_KM[a.dist]; const km = branch?.startsWith('demo-') && known && Math.min(...Object.values(known)) <= TP.ZONE_KM ? TP.BRANCHES.find(b=>b.id===branch)?.km ?? null : known?.[branch] ?? null; return { ok: km != null && km <= TP.ZONE_KM, bkk: a.prov === 'กรุงเทพมหานคร', km }; };
/* zone lock (owner 20/10 "ทำสวิตช์ไว้แต่บอก อย. ตรงๆ"): an admin switch in the console, ON by default and in the FDA filing.
   ON = layer 1 (location at the start of a consult) and layer 2 (address at billing) both hold the drug zone.
   OFF (only after the FDA allows it; owner 21/10 "lalamove บังคับ 15 km ส่วนที่เหลือไม่บังคับ") = only express keeps 15 km: consulting is open
   everywhere (C209.4 warns first that express cannot reach), parcel by Flash or DHL and cold may leave the zone */
TP.zoneLock = () => TP.flag('zoneLock') !== false;
/* the one zone line the acknowledgement shows, following the switch (owner 21/10) */
TP.zoneLine = () => TP.zoneLock() ? 'ส่งยาได้เฉพาะที่อยู่ไม่เกิน 15 กม. จากสาขา นอกนั้นรับยาที่ร้าน' : 'ส่งด่วนส่งได้ไม่เกิน 15 กม. จากสาขา ส่งพัสดุและส่งเย็นได้ทุกที่';
/* mock phone positions for layer 1 (real build: the phone's GPS once, at the start of a consult) */
TP.LOCS = { near: { label: 'ทวีวัฒนา กรุงเทพ', dist: 'ทวีวัฒนา', prov: 'กรุงเทพมหานคร' }, out: { label: 'วัดชลอ นนทบุรี', dist: 'วัดชลอ', prov: 'นนทบุรี' } };
TP.locZone = () => {
  const l = TP.homeAddress?.() || TP.LOCS[TP.S.loc]; if (!l) return null;
  const per = TP.BRANCHES.map(b => ({ b, z: TP.zoneOf(l, b.id) })), near = per.filter(x => x.z.km != null).sort((x, y) => x.z.km - y.z.km)[0];
  return { ok: per.some(x => x.z.ok), loc: l, km: near?.z.km ?? null, br: near?.b || TP.branch() };
};
TP.expOk = (a, br) => { const z = TP.zoneOf(a, br); return !!z && z.ok && z.km != null && z.km <= TP.EXP_KM; };
TP.BANKS = [['KBANK', 'K PLUS', 'กสิกรไทย'], ['SCB', 'SCB EASY', 'ไทยพาณิชย์'], ['BAY', 'Krungsri', 'กรุงศรี'], ['BBL', 'Bualuang', 'กรุงเทพ'], ['KTB', 'Krungthai NEXT', 'กรุงไทย']];
TP.CARD_FEE = 0.0365;   /* card only, on drugs + delivery (paylink card_option) */
TP.PAY_MIN = 20;        /* Omise minimum for every method (CSM:2542) */

/* the one mutable state object; panel toggles and screens both write here */
/* panel "ทั้งแอป" switches: the reviewer's choice is the base. A screen state may force a value
   (pay "ร้านปิด"), every other state goes back to the base instead of a hard default */
TP.FLAG0 = { storeOpen: true, sysOff: false, zoneLock: true };
TP.flag = k => (TP.S.g && k in TP.S.g ? TP.S.g[k] : TP.FLAG0[k]);
TP.setFlag = (k, v) => { TP.S[k] = v; (TP.S.g || (TP.S.g = {}))[k] = v; };
/* opening a state (panel or link) starts from the default zone lock, so an unlocked sample never leaks into later screens
   (QA 21/10); only states made for the unlocked case (C209.4, C308.21) unlock it again in their prep. The panel switch still works on the open screen */
TP.prepState = (...defs) => { TP.setFlag('zoneLock', TP.FLAG0.zoneLock); defs.forEach(d => d?.prep?.(TP.S)); };
TP.fresh = () => ({
  firstTime: false,          // true = onboarding + consent flow from splash
  loggedIn: true,
  consent: true,             // Preview fixture: returning account already accepted the current policy.
  consentVer: 4,
  healthConsentRecord: {documentVersion:'health-care-2026-11-01-draft-2',controller:'บริษัท มิตรอารีแคร์ จำกัด',purpose:'pharmaceutical-care',acceptedAt:'2026-11-01T00:00:00+07:00',method:'preview-fixture',prototype:true},
  storeOpen: true,
  notifAsked: true,
  notif: true,               // returning user allowed app notifications
  faceId: false,
  branch: 'tw',
  branchState: { tw: 'open', on: 'pause' },  // open | pause | closed
  queueLen: { tw: 2, on: 1, 'demo-1':0, 'demo-2':0, 'demo-3':0, 'demo-4':1, 'demo-5':0 },
  user: { name: 'สมใจ', full: 'สมใจ ใจดี', phone: '081-234-5678', allergies: ['แอสไพริน'], allergySrc: 'บันทึกโดย ภญ.ขวัญใจ 02/10/2026', allergyState: 'set', meds: ['แอมโลดิพีน 5 มก. (ยาความดัน)'], weight: 58, born: '1988', foodNone: true },
  family: [], // Household feature paused; this app serves the account owner only.
  intake: { who: 'me', symptoms: [], custom: [], otherOpen: false, urgent: [], note: '', photos: 0, attachments: [], mode: 'chat' },
  zoneLock: true, loc: 'near', locDenySeen: false, locWarnSeen: false,   // zone lock = admin switch (default ON) · loc = mock phone position / permission
  case: null,                // see TP.newCase in 60-main
  /* the website account address book (customer_addresses): no labels like บ้าน/ที่ทำงาน, one main address, pin = has a confirmed map point */
  addrs: [
    { id: 'a1', label: 'บ้าน', first: 'สมใจ', last: 'ใจดี', phone: '0812345678', house: '88/12', alley: 'ซอยทวีวัฒนา 25', road: '', prov: 'กรุงเทพมหานคร', amp: 'ทวีวัฒนา', dist: 'ทวีวัฒนา', zip: '10170', main: true, pin: false },
    { id: 'a2', label: 'ที่ทำงาน', first: 'สมใจ', last: 'ใจดี', phone: '0812345678', house: '99/9 ชั้น 12', alley: '', road: 'พระรามที่ 4', prov: 'กรุงเทพมหานคร', amp: 'คลองเตย', dist: 'คลองเตย', zip: '10110', main: false, pin: true }
  ],
  history: [
    { id: 'TC-261002-0087', date: '02/10/2026', time: '19:40', who: 'me', topic: 'ไข้ ไอ เจ็บคอ', branch: 'tw', pharm: 'kj', bought: 265, rated: 5, summary: true , outcome:'completed' },
    {"id": "TC-261028-0102", "date": "28/10/2026", "time": "18:15", "topic": "ปรึกษาวิธีใช้ยาประจำ", "branch": "on", "pharm": "tp", "bought": 0, "who": "me", "summary": true, outcome:'customer-ended' },
    {"id": "TC-261028-0098", "date": "28/10/2026", "time": "09:20", "topic": "คัดจมูก น้ำมูก", "branch": "tw", "pharm": "kj", "bought": 180, "who": "me", "summary": true, outcome:'completed' },
    {"id": "TC-261017-0091", "date": "17/10/2026", "time": "12:45", "topic": "ปวดกล้ามเนื้อ", "branch": "demo-1", "pharm": "kj", "bought": 220, "who": "me", "summary": true, outcome:'no-response' },
    {"id": "TC-260922-0074", "date": "22/09/2026", "time": "20:10", "topic": "ผื่น คัน", "branch": "on", "pharm": "tp", "bought": 145, "who": "me", "summary": true, outcome:'completed' },
    {"id": "TC-260905-0069", "date": "05/09/2026", "time": "10:30", "topic": "ถามเรื่องยาที่ใช้อยู่", "branch": "tw", "pharm": "kj", "bought": 0, "who": "me", "summary": true, outcome:'completed' },
    {"id": "TC-260818-0060", "date": "18/08/2026", "time": "16:05", "topic": "ปวดท้อง ท้องอืด", "branch": "demo-2", "pharm": "kj", "bought": 120, "who": "me", "summary": true, outcome:'customer-ended' },
    {"id": "TC-260818-0058", "date": "18/08/2026", "time": "09:10", "topic": "ขอคำแนะนำการอ่านฉลากยา", "branch": "on", "pharm": "tp", "bought": 0, "who": "me", "summary": true, outcome:'completed' },
    {"id": "TC-260630-0043", "date": "30/06/2026", "time": "14:50", "topic": "ไอ ระคายคอ", "branch": "tw", "pharm": "kj", "bought": 95, "who": "me", "summary": true, outcome:'no-response' },
    {"id": "TC-260412-0021", "date": "12/04/2026", "time": "11:25", "topic": "ปรึกษาการดูแลสุขภาพ", "branch": "demo-3", "pharm": "kj", "bought": 0, "who": "me", "summary": true, outcome:'completed' },
  ],
  inbox: [
    { id: 'n3', kind: 'summary', title: 'ใบสรุปการปรึกษาพร้อมแล้ว', body: 'เปิดดูในประวัติ', time: '02/10/2026 20:05', read: true, go: 'summary' },
    { id: 'n2', kind: 'adr', title: 'เภสัชกรตอบเรื่องอาการหลังใช้ยาแล้ว', body: 'แตะเพื่ออ่าน', time: '16/09/2026 11:20', read: true, go: 'adrsent' },
    { id: 'n1', kind: 'news', title: 'ปรึกษาเภสัชกรในแอปได้แล้ว', body: 'ทุกวัน 09:00-21:00 ที่สาขาที่เปิดรับ', time: '01/09/2026 09:00', read: true, go: 'home' }
  ],
  st: {}                     // per-screen scenario picked in the panel: st[screenId] = key
});
TP.S = TP.fresh();
TP.branch = id => TP.BRANCHES.find(b => b.id === (id || TP.S.branch));
TP.person = id => id === 'me' || !id ? { id: 'me', name: TP.S.user.full, rel: 'ตัวเอง', ...TP.S.user } : TP.S.family.find(f => f.id === id);
TP.stateOf = id => TP.S.st[id] || (TP.SCREENS?.[id]?.states?.[0]?.[0]) || 'normal';

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
const scrim = $('#scrim'), sheetEl = $('#sheet'), island = $('#island'), banner = $('#banner'), ptoast = $('#ptoast'), liveEl = $('#live');
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
  if (sheet) await TP.closeSheet({ instant: o.via === 'none' });
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
  if (sheet) return TP.closeSheet();
  if (!hist.length) return chain;
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
/* re-render the current screen in place (panel scenarios, state changes) */
TP.refresh = (o = {}) => {
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
    if (cur?.id !== host) { TP.prepState(SCREENS[host], def); await TP.go(host, { via: o.via || 'fade', root: true, force: true }); if (SCREENS[host].parent) hist.push({ id: SCREENS[host].parent, params: {}, via: 'tab', scrollTop: 0 }); }
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
  phone.dataset.sb = sheet?.def.tall ? 'light' : (typeof def.sb === 'function' ? def.sb(entry.ctx) : (def.sb || 'dark'));
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
    payment: '<rect x="3" y="7" width="26" height="19" rx="4"/><path d="M3 13h26M8 20h5"/><circle cx="24" cy="7" r="5" fill="var(--semantic-primary)"/><path d="M24 4v6M22 5h3M23 9h3"/>'
  };
  return `<svg class="mb-status-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false">${artwork[kind] || artwork.chat}</svg>`;
};
function miniWanted() { const c = TP.S.case; return !!(c && (!c.who||c.who==='me') && (c.order?.status==='pending'||!['closed', 'cancelled', 'declined', 'expired'].includes(c.status))); }
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

/* ---------- sheets: a single overlay above a dimmed, stationary page ---------- */
TP.sheet = async (id, params = {}) => {
  if(SHEETS[id]?.disabled)return;
  const def = SHEETS[id]; if (!def) return console.warn('unknown sheet', id);
  await chain;
  if (sheet) await TP.closeSheet({ instant: true });
  const entry = mkEntry(id, params, 'sheet');
  const ctx = entry.ctx = mkCtx(id, params, entry);
  const title = typeof def.title === 'function' ? def.title(ctx) : def.title;
  sheetEl.className = 'sheet' + (def.tall ? ' tall' : '') + (def.cls ? ' ' + def.cls : '');
  sheetEl.innerHTML = `<div class="grab" aria-hidden="true"></div><header class="sh-h"><h2 id="sheetTitle" tabindex="-1">${TP.esc(def.sheetTitle ? def.sheetTitle(ctx) : title)}</h2>${def.hideClose ? '' : `<button type="button" class="sh-x" data-close-sheet aria-label="ปิด">${TP.ic('x', 18, 2.2)}</button>`}</header><div class="sh-b">${def.render(ctx)}</div>${def.foot ? `<div class="sh-f">${def.foot(ctx)}</div>` : ''}`;
  TP.icons(sheetEl);
  sheet = { id, def, ctx, entry, prevFocus: document.activeElement };
  sheetEl.hidden = false; scrim.hidden = false;
  def.mount?.(sheetEl, ctx);
  A(scrim, [{ opacity: 0 }, { opacity: 1 }], { d: 320, e: E.apple });
  const a = A(sheetEl, [{ transform: 'translateY(100%)' }, { transform: 'none' }], { d: SP.soft.d, e: SP.soft.e });
  if (def.tall && cur) {
    phone.dataset.sb = 'light';
    tabbar.hidden || A(tabbar, [{ opacity: 1 }, { opacity: 0 }], { d: 200, fill: 'forwards' });
    mini.hidden || A(mini, [{ opacity: 1 }, { opacity: 0 }], { d: 200, fill: 'forwards' });
  }
  if (!TP.RED()) cascade(sheetEl, 120);
  setTimeout(() => ($('.sh-b [autofocus]', sheetEl) || $('#sheetTitle', sheetEl))?.focus({ preventScroll: true }), 60);
  TP.emit('sheet', sheet);
  await fin(a);
};
TP.closeSheet = async ({ instant = false } = {}) => {
  if (!sheet) return;
  const s = sheet; sheet = null;
  s.entry.alive = false; s.entry.timers.forEach(t => { clearTimeout(t); clearInterval(t); }); s.entry.cleanups.forEach(fn => fn());
  s.def.close?.(s.ctx);
  if (cur) {
    const def = SCREENS[cur.id];
    phone.dataset.sb = typeof def.sb === 'function' ? def.sb(cur.ctx) : (def.sb || 'dark');
  }
  const back = [];
  if (s.def.tall && cur) {
    kill(tabbar); kill(mini);
  }
  if (!instant) {
    await Promise.all([fin(A(sheetEl, [{ transform: getComputedStyle(sheetEl).transform === 'none' ? 'none' : getComputedStyle(sheetEl).transform }, { transform: 'translateY(105%)' }], { d: 380, e: E.ios, fill: 'forwards' })),
      fin(A(scrim, [{ opacity: 1 }, { opacity: 0 }], { d: 320, e: E.apple, fill: 'forwards' })), ...back.map(fin)]);
  }
  cur && kill(cur.el);
  kill(sheetEl); kill(scrim);
  sheetEl.hidden = true; scrim.hidden = true; sheetEl.innerHTML = '';
  if (s.prevFocus && document.contains(s.prevFocus)) s.prevFocus.focus({ preventScroll: true });
  TP.emit('sheet', null);
};
TP.sheetOpen = () => sheet;
scrim.addEventListener('click', () => { if (sheet && !sheet.def.locked) TP.closeSheet(); });
/* drag the grab handle / header down to dismiss */
(() => {
  let y0 = 0, t0 = 0, dy = 0, drag = false;
  sheetEl.addEventListener('pointerdown', e => {
    if (!sheet || sheet.def.locked || !e.target.closest('.grab,.sh-h') || e.target.closest('button')) return;
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
})();
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
TP.notify = (msg, { icon = 'check' } = {}) => {
  TP.live(msg);
  ptoast.dataset.tone = /alert|x|error/.test(icon) ? 'error' : /info|clock/.test(icon) ? 'info' : 'success';
  if (document.documentElement.classList.contains('chrome') && !phone.closest('.device-real')) {
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
    ptoast.innerHTML = TP.ic(icon,20,2) + '<span>' + TP.esc(msg) + '</span>'; kill(ptoast); clearTimeout(toastT); ptoast.style.visibility = 'visible';
    A(ptoast, [{ transform: 'translate(-50%,-180%)' }, { transform: 'translate(-50%,0)' }], { d: SP.spring.d, e: SP.spring.e, fill: 'forwards' });
    toastT = setTimeout(() => fin(A(ptoast, [{ transform: 'translate(-50%,0)' }, { transform: 'translate(-50%,-180%)' }], { d: 320, e: E.in, fill: 'forwards' })).then(() => { ptoast.style.visibility = 'hidden'; }), 2400);
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
      : o.back ? `<button type="button" class="back" data-back>${ic('chevron-down', 22, 2.2)}<span>${esc(o.back === true ? 'กลับ' : o.back)}</span></button>` : '');
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
      ui.row({ icon: 'headset', title: 'ฝ่ายบริการลูกค้า', sub: `${TP.STORE.cs} · ${TP.STORE.csHours}`, a: 'callHelp', p: { tel: TP.STORE.cs }, tag: shut ? ['ปิดอยู่', 'muted'] : null })
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
    if (!alive) return;
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
  if (TP.RED()) still(); else raf = requestAnimationFrame(frame);
  return {
    stop() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); },
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
  function frame(now) { if (!alive) return; paint(now); raf = requestAnimationFrame(frame); }
  size();
  const ro = new ResizeObserver(() => { size(); if (TP.RED()) paint(t0); }); ro.observe(cv);
  if (TP.RED()) paint(t0); else raf = requestAnimationFrame(frame);
  return { stop() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); }, pulse(s = 1) { waves.push({ t: performance.now(), s }); }, retarget(fx, fy) { o.origin = [fx, fy]; } };
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
  ['loc', 'ตำแหน่งโทรศัพท์ (จำลอง)', [['near', 'ใกล้สาขา'], ['out', 'นอกพื้นที่'], ['deny', 'ไม่ให้ตำแหน่ง'], ['ask', 'ยังไม่เคยถาม']]]
];
/* said inside the phone when the open screen does not use the switch, so a tap never looks dead */
const WHERE = {
  storeOpen: { true: 'จำลองร้านเปิดแล้ว · เห็นผลที่หน้าแรกและจอแจ้งอาการ', false: 'จำลองร้านปิดแล้ว · เห็นผลที่หน้าแรก จอแจ้งอาการ และจอจ่ายเงิน' },
  sysOff: { true: 'จำลองปิดระบบปรึกษาแล้ว · เห็นผลที่หน้าแรกและตอนกดเริ่มปรึกษา', false: 'เปิดระบบปรึกษาแล้ว · เห็นผลที่หน้าแรก' },
  zoneLock: { true: 'ล็อกเขตแล้ว · นอกพื้นที่เริ่มปรึกษาไม่ได้ (C209) ที่อยู่นอกเขตรับยาที่ร้านเท่านั้น (C308.18)', false: 'ปลดล็อกเขตแล้ว · เกิน 15 กม. ก็เริ่มปรึกษาได้ แต่เตือนก่อนว่าส่งด่วนไม่ได้ (C209.4) · ส่งพัสดุ Flash DHL และส่งเย็นได้ทุกที่อยู่ (C308.21)' },
  loc: { near: 'ตำแหน่งใกล้สาขาแล้ว · กดเริ่มปรึกษาได้ตามปกติ', out: 'ตำแหน่งนอกพื้นที่แล้ว (วัดชลอ นนทบุรี) · กดเริ่มปรึกษาที่หน้าแรกเพื่อดู C209.2', deny: 'ไม่ให้ตำแหน่งแล้ว · กดเริ่มปรึกษาที่หน้าแรกเพื่อดู C209.3', ask: 'ยังไม่เคยถามตำแหน่ง · กดเริ่มปรึกษาที่หน้าแรกเพื่อดู C209.1' }
};

function codeTag(code) { return code ? `<span class="pn-code">${esc(code)}</span>` : ''; }
/* review codes (owner 19/10/2026: "ระบุเลขหน้าให้ครบทุกหน้า ผมจะตรวจตามรหัสและให้แก้ตามหมายเลข"):
   C + group digit + 2 digits per screen or sheet; a state picked in the panel or opened by jump adds .n */
TP.codeOf = id => {
  const d = TP.def(id); if (d?.hidden && d.host) return TP.codeOf(d.host); if (!d?.code) return '';
  const st = d.states || [], k = TP.S.st[id];
  const i = st.length > 1 && k ? st.findIndex(x => x[0] === k) : -1;
  return i < 0 ? d.code : `${d.code}.${i + 1}`;
};
const byCode = (a, b) => (TP.def(a).code || '').localeCompare(TP.def(b).code || '');
const badge = $('#codeBadge'), fabCode = $('#fabCode');
badge?.addEventListener('click', e => {
  if(e.target.closest('[data-preview-send-order]'))TP.casePreview.playChat('payment');
  const videoButton=e.target.closest('[data-preview-request-video]');
  if(videoButton&&!videoButton.disabled)TP.casePreview.playChat('video-request');
  if (e.target.closest('.preview-mock-button')) TP.registrationPreview?.fillCurrent();
  const simulation=e.target.closest('[data-preview-case]');
  if(simulation) TP.casePreview?.apply(simulation.dataset.previewCase);
});
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
function render() {
  const s = TP.sheetOpen(), c = TP.cur(), keep = anchorOf();
  const internal = s?.def.hidden && s.def.host;
  const def = internal ? TP.SCREENS[s.def.host] : s ? s.def : c && TP.SCREENS[c.id];
  const id = internal ? s.def.host : s ? s.id : c?.id;
  const states = def?.states || [];
  const sims = SIM.filter(a => { try { return a.when(TP.S); } catch { return false; } });
  const total = TP.ORDER.filter(id => !TP.def(id).hidden).length;
  const code = id ? TP.codeOf(id) : '', ttl = def ? (typeof def.title === 'function' ? def.title({ S: TP.S, params: s ? s.ctx.params : c?.ctx?.params || {} }) : def.title) : '';
  const canMock = !s && TP.registrationPreview?.canFill(c);
  const canSimulate = !s && (!!TP.SCREENS[c?.id]?.tab||['queue','room'].includes(c?.id)) && TP.casePreview;
  if (badge) {
    badge.classList.toggle('has-mock', !!(canMock || canSimulate));
    badge.innerHTML = code ? `<b>${esc(code)}</b><span>${esc(ttl)}</span>${canMock ? '<button type="button" class="preview-mock-button">มอคข้อมูล</button>' : ''}${!s&&['queue','room'].includes(c?.id)&&['matched','room'].includes(TP.S.case?.status)?`<div class="preview-case-controls"><button type="button" data-preview-send-order ${TP.S.case.order?'disabled':''}>เภสัชกรส่งรายการยา</button><button type="button" data-preview-request-video ${TP.S.case.status!=='room'||TP.S.call||TP.S.case.msgs?.some(m=>m.kind==='video-request'&&['pending','accepted'].includes(m.status))?'disabled':''}>เภสัชกรขอวิดีโอคอล</button></div>`:''}${canSimulate ? `<div class="preview-case-controls" role="group" aria-label="จำลองสถานะการปรึกษา">${TP.casePreview.states.map(([key,label])=>`<button type="button" data-preview-case="${key}" aria-pressed="${TP.S._casePreview===key}">${esc(label)}</button>`).join('')}</div>` : ''}` : '';
  }
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
    ${states.length > 1 ? `<section class="pn-sec"><h2 class="pn-h">ลองสถานะของจอนี้</h2><div class="pn-row">${states.map(([k, l], i) => `<button type="button" class="pn-btn" data-pn="state" data-k="${esc(k)}" aria-pressed="${TP.stateOf(id) === k}"><b class="pn-sc">${esc(def.code)}.${i + 1}</b>${esc(l)}</button>`).join('')}</div></section>` : ''}
    ${sims.length ? `<section class="pn-sec"><h2 class="pn-h">${ic('stethoscope', 15, 2)}จำลองฝั่งเภสัชกร</h2><div class="pn-grid">${sims.map(a => `<button type="button" class="pn-btn ph" data-pn="sim" data-k="${esc(a.id)}">${esc(a.label)}</button>`).join('')}</div></section>` : ''}
    <section class="pn-sec"><h2 class="pn-h">ทั้งแอป</h2><div class="gap8">${GLOBAL.map(([k, l, opts]) => `<div><p class="small" style="margin:0 2px 4px">${esc(l)}</p><div class="pn-row">${opts.map(([v, t]) => `<button type="button" class="pn-btn" data-pn="g" data-k="${k}" data-v="${v}" aria-pressed="${TP.S[k] === v}">${esc(t)}</button>`).join('')}</div></div>`).join('')}</div></section>
    <section class="pn-sec"><h2 class="pn-h">ไปจอ · ทั้งหมด ${total} จอ</h2>
      ${TP.GROUPS.map(([g, gl]) => { const ids = TP.ORDER.filter(i => TP.def(i).group === g && !TP.def(i).hidden).sort(byCode); if (!ids.length) return ''; return `<div class="pn-grp"><b>${esc(gl)}</b><div class="pn-grid">${ids.map(i => { const d = TP.def(i); return `<button type="button" class="pn-btn" data-pn="jump" data-k="${i}" aria-current="${i === id}"><b class="pn-sc">${esc(d.code || '')}</b>${esc(typeof d.title === 'function' ? d.title({ S: TP.S, params: {} }) : d.title)}${d.kind === 'sheet' ? '<small>แผ่นเลื่อนขึ้น</small>' : ''}</button>`; }).join('')}</div></div>`; }).join('')}
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
      const s = TP.sheetOpen();
      if (s) { TP.S.st[s.id] = k; TP.prepState(s.def); const p = s.ctx.params; await TP.closeSheet({ instant: true }); TP.sheet(s.id, p); }
      else { const id = TP.cur().id; TP.S.st[id] = k; TP.prepState(TP.SCREENS[id]); TP.refresh(); }
      break;
    }
    case 'sim': SIM.find(a => a.id === k)?.run(); if (mob) toggle(false); break;
    case 'g': {
      const raw = b.dataset.v, v = raw === 'true' ? true : raw === 'false' ? false : raw;
      if (k === 'loc' || k === 'zoneLock') TP.S.locDenySeen = TP.S.locWarnSeen = false;
      if (k === 'firstTime') { TP.S.firstTime = v; restart(mob); break; }
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
    case 'jump': if (mob) toggle(false); TP.jump(k); break;
    case 'restart': restart(mob); break;
  }
});
/* start the app again; the user type and the "ทั้งแอป" switches carry over */
function restart(mob) {
  const ft = TP.S.firstTime, g = TP.S.g;
  TP.S = TP.fresh(); TP.S.firstTime = ft;
  if (g) { TP.S.g = { ...g }; Object.assign(TP.S, g); }
  if (ft) Object.assign(TP.S, { loggedIn: false, consent: false, notifAsked: false, notif: false, follow: null });
  TP.emit('state');
  if (mob) toggle(false);
  TP.go(TP.SCREENS.splash ? 'splash' : 'home', { via: 'fade', root: true, force: true });
}
function toggle(on) { panel.classList.toggle('open', on); fab.setAttribute('aria-expanded', String(on)); if (on) { render(); panel.scrollTop = 0; $('.pn-x', panel)?.focus({ preventScroll: true }); } else fab.focus({ preventScroll: true }); }
fab.addEventListener('click', () => toggle(!panel.classList.contains('open')));
TP.on('screen', render); TP.on('sheet', () => setTimeout(render, 0)); TP.on('state', render);
TP.panel = { render, toggle };
})();

/* ===== 50-start.js ===== */
/* =====================================================================
   50 · Start: login, channel-specific in-page OTP, profile, faceid, consent, noconsent,
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
  ...(TP.STORE ? [ui.row({ icon: 'headset', title: 'ฝ่ายบริการลูกค้า', sub: `${TP.STORE.csHours} · ${TP.STORE.cs}`, a: 'stCall', p: { tel: TP.STORE.cs }, chev: false, html: callIc })] : [])];
TP.callRows = callRows;
/* after the Face ID question (asked once, after the first consult): back to home */
const afterBio = () => {
  const S = TP.S;
  Object.assign(S, { _fidOffer: false, _fidAsked: true });
  if (TP.healthConsentNeeded(S) && S.firstTime && TP.SCREENS.consents) return TP.go('consents', { via: 'push', root: true });
  S.firstTime = false;
  return TP.go('home', { via: 'zoom', root: true });
};

TP.act('stDoc', t => TP.sheet('doc', { t: t.dataset.v }));
TP.sheetDef('doc', {
  group: 'start', title: ctx => ctx?.params?.t || 'ข้อกำหนดการใช้งาน', code: 'C111', ref: 'H07', host: 'login', tall: true,
  notes: ['เปิดอ่านได้ในแอป ไม่พาออกไปเว็บ', 'ข้อความจริงรอฝ่ายกฎหมาย ในต้นแบบเป็นหัวข้อตัวอย่าง'],
  render: ctx => `<p class="small af-ct-meta">ฉบับที่ 3 · มีผล 18/10/2026</p>${/ส่วนตัว/.test(ctx.params.t || '') && TP.consentDoc ? `<div class="st-doc">${TP.consentDoc()}</div>` : `<div class="st-doc">${[
    ['การใช้บริการ', 'บริการปรึกษาเภสัชกรผ่านแอปใช้สำหรับอาการเล็กน้อยและคำถามเรื่องยา ไม่ใช่การรักษาฉุกเฉิน ถ้าอาการรุนแรงให้ไปโรงพยาบาล'],
    ['บัญชีของคุณ', 'ใช้บัญชีเดียวกับเว็บไซต์ MITRAREE เข้าสู่ระบบด้วยเบอร์มือถือและรหัส OTP ดูแลเครื่องของคุณไม่ให้ผู้อื่นใช้'],
    ['การสั่งซื้อและชำระเงิน', 'รายการยาที่เภสัชกรจัดให้ ชำระในแอปภายในเวลาที่กำหนด ราคาตามที่แสดงในรายการ'],
    ['การคืนสินค้า', 'เป็นไปตามนโยบายคืนสินค้าของ MITRAREE'],
    ['ติดต่อเรา', `ฝ่ายบริการลูกค้า ${TP.STORE.cs} · ${TP.STORE.csHours}`]
  ].map(([h, p], n) => `<section class="st-sec"><h4>${n + 1}. ${esc(h)}</h4><p>${esc(p)}</p></section>`).join('')}</div>`}`,
  foot: () => ui.btn('ปิด', { kind: 'secondary', closeSheet: true })
});
TP.act('stCall', t => { let p = {}; try { p = JSON.parse(t.dataset.p || '{}'); } catch { p = {}; } TP.notify('กำลังโทร ' + (p.tel || TP.branch(p.id).phone), { icon: 'phone' }); });
/* first run only: a phone number with no account yet fills "ข้อมูลของคุณ" before Face ID.
   S.newAccount undefined = follow firstTime (the natural first-run demo shows the form) */
const isNewNumber = S => S.newAccount ?? S.firstTime;
/* a brand-new number must never inherit the mock account (family, allergies, meds, history) */
const freshAccount = S => {
  Object.assign(S, { family: [], history: [], inbox: [], case: null, addrs: [], follow: null, _clog: [] });
  Object.assign(S.user, { allergies: [], allergyState: 'unknown', allergySrc: '', meds: [], weight: '', conditions: [], condNone: false });
};

const blankUser = (S, phone) => {
  Object.assign(S.user, { name: '', last: '', full: '', born: '', birthYear: '', age: '', sex: 'none' });
  if (phone?.length === 10) S.user.phone = `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
  S._pf = null;
};
TP.blankUser = blankUser;
TP.freshAccount = freshAccount;

/* =====================================================================
   Onboard (ใหม่): 3 pages, pager, swipe, arrow keys
   ===================================================================== */
/* Thai has no spaces between words: keep key phrases on one line (static HTML, not user input) */
const nw = s => `<span class="st-nw">${s}</span>`;
const OB = [
  { t: `${nw('เภสัชกรตัวจริง')} ${nw('ตรวจสอบได้')}`, b: `คุยกับ${nw('เภสัชกร')}ประจำร้าน${nw('มิตรอารี')} เห็นชื่อและ${nw('เลขใบอนุญาต')}ก่อนเริ่มคุยทุกครั้ง`, l: 'เภสัชกรตัวจริง ตรวจสอบได้' },
  { t: `ปรึกษาได้ทุกวัน ${nw('09:00-21:00')}`, b: `ที่สาขาที่${nw('เปิดรับ')}อยู่ตอนนั้น นอกเวลา${nw('ฝากคำถาม')}ไว้ได้ ${nw('เภสัชกร')}ตอบ${nw('ภายใน 12:00')}ของวันที่ร้านเปิด`, l: 'ปรึกษาได้ทุกวัน 09:00-21:00' },
  { t: `${nw('คำแนะนำจากเภสัชกร')} ${nw('ไม่ใช่การวินิจฉัย')}${nw('ของแพทย์')}`, b: 'ก่อนเริ่มใช้บริการ รู้ไว้ 3 เรื่อง', l: 'คำแนะนำจากเภสัชกร ไม่ใช่การวินิจฉัยของแพทย์' }
];
const OB_LIST = [
  ['message-circle', '', 'ขั้นตอน', `แจ้งอาการ เข้าคิว แล้วคุยกับ${nw('เภสัชกร')}ทาง${nw('แชท')}หรือ${nw('วิดีโอคอล')}`],
  ['pill', '', 'ผลที่อาจได้', `${nw('คำแนะนำการใช้ยา')} ${nw('รายการยา')}ให้ชำระในแอป หรือคำแนะนำให้${nw('ไปพบแพทย์')}`],
  ['triangle-alert', 'w', 'ความเสี่ยง', `${nw('เภสัชกร')}ไม่ได้ตรวจร่างกาย ข้อมูลที่ไม่ครบอาจทำให้คำแนะนำ${nw('คลาดเคลื่อน')} ${nw('อาการฉุกเฉินควรไปโรงพยาบาล')}`]
];
function obPass() {
  const p = TP.PHARM.kj;
  return `<div class="st-art st-art1">${brand.halo(256, { draw: true, cls: 'st-a-halo' })}
    <div class="st-float"><div class="pass st-pass" data-tilt="7">${brand.guilloche({ w: 300, h: 190, cx: 282, cy: 18, n: 14, r0: 24, r1: 196, k: 14, a: 7 })}
      <div class="ps-top">${brand.logo('wmen', { cls: 'sm' })}${ui.tag('เภสัชกร', 'solid')}</div>
      <div class="ps-id">${ui.av('', { ini: p.ini, size: 'lg', solid: true })}<span><b class="ps-name">${esc(p.name)}</b><span class="ps-lic st-nw">ใบอนุญาต <b>${esc(p.lic)}</b></span></span></div>
      <div class="ps-foot"><span>${esc(TP.BRANCHES[0].name)}</span><span class="tag ok">${ic('badge-check', 14, 2.2)}ตรวจสอบได้</span></div>
    </div></div></div>`;
}
/* 24-hour dial, noon at the top: service arc 09:00-21:00, "now" marker, moon at midnight */
function obDial(S) {
  const C = 120, R = 96, f = n => n.toFixed(1);
  const P = (h, r) => { const a = (h - 12) / 24 * Math.PI * 2; return [C + r * Math.sin(a), C - r * Math.cos(a)]; };
  let ticks = '';
  for (let h = 0; h < 24; h += .5) {
    const mj = h % 6 === 0, whole = h % 1 === 0, [x1, y1] = P(h, R - 9), [x2, y2] = P(h, R - (mj ? 18 : whole ? 14 : 11));
    ticks += `<line class="tk${mj ? ' mj' : ''}" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
  }
  const [ax, ay] = P(9, R), [mx, my] = P(15, R), [bx, by] = P(21, R);
  const open = S.storeOpen !== false, [nx, ny] = P(open ? 14.2 : 21.67, R);
  const [l1x, l1y] = P(9, R + 18), [l2x, l2y] = P(21, R + 18), [qx, qy] = P(0, R - 36);
  return `<div class="st-art st-art2"><div class="st-dial"><svg viewBox="0 0 240 240" aria-hidden="true" focusable="false">
      <circle class="rg" cx="${C}" cy="${C}" r="${R}"/>${ticks}
      <path class="arc" d="M${f(ax)} ${f(ay)}A${R} ${R} 0 0 1 ${f(mx)} ${f(my)}A${R} ${R} 0 0 1 ${f(bx)} ${f(by)}" pathLength="100"/>
      <text class="lb" x="${f(l1x)}" y="${f(l1y)}" text-anchor="end">09:00</text>
      <text class="lb" x="${f(l2x)}" y="${f(l2y + 10)}" text-anchor="start">21:00</text>
      <g class="moon" transform="translate(${f(qx - 9)} ${f(qy - 9)}) scale(.75)"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></g>
      <circle class="now-r" cx="${f(nx)}" cy="${f(ny)}" r="9"/><circle class="now" cx="${f(nx)}" cy="${f(ny)}" r="5.5"/>
    </svg>
    <div class="st-dial-c"><small>ตอนนี้</small><b class="num">${open ? TP.NOW.time : '21:40'}</b>${open ? ui.tag('เปิดรับปรึกษา', 'ok', { dot: true, live: true }) : ui.tag('นอกเวลา ฝากคำถามได้', 'muted', { dot: true })}</div>
  </div></div>`;
}
TP.screen('onboard', {
  group: 'start', title: 'แนะนำแอป', code: 'C112', cls: 'st-ob',
  states: [['p1', 'หน้า 1 เภสัชกรตัวจริง'], ['p2', 'หน้า 2 เวลาให้บริการ'], ['p3', 'หน้า 3 ขั้นตอนและความเสี่ยง']],
  notes: [
    'ไม่อยู่ในขั้นสมัครแล้ว: เจ้าของเลือกขั้นสมัครแบบสั้น 19/10/2026 เปิดแอปแล้วไปหน้าเข้าสู่ระบบทันที · เก็บจอนี้ไว้เผื่อใช้ภายหลัง · ข้อมูลกฎ อย. ข้อ 2.1 ของหน้า 3 อยู่บนจอรอคิว (เปิดให้เห็นในการปรึกษาครั้งแรก)',
    'ปัดซ้ายขวา แตะจุด หรือกดลูกศรบนคีย์บอร์ดได้ · "ข้าม" ไปหน้าเข้าสู่ระบบ',
    'หน้า 1: บัตรเภสัชกรแบบเดียวกับที่เห็นในห้องปรึกษา ชื่อ + เลขใบอนุญาต ตรวจสอบได้',
    'หน้า 2: เวลาให้บริการ 09:00-21:00 ที่สาขาที่เปิดรับ · นอกเวลาฝากคำถามได้ · หน้าปัดบอกเวลาตอนนี้ตามสถานะร้าน (ลองสลับ "ร้านปิด" ในแผง)',
    'หน้า 3: กฎ อย. ข้อ 2.1 บอกขั้นตอน ผลที่อาจได้ และความเสี่ยง ในรายการสั้นรายการเดียว · บอกชัดว่าไม่ใช่การวินิจฉัยของแพทย์',
    'Design v1.2: พื้นหลังเป็นแสงนุ่มสีเขียวมิตรอารี ไม่มีลาย (เจ้าของเลือกแบบ B 19/10/2026)'
  ],
  wait: ['ข้อความความเสี่ยงหน้า 3 ให้เภสัชกรผู้มีหน้าที่ปฏิบัติการและฝ่ายกฎหมายตรวจ', 'เวลาให้บริการ "ทุกวัน 09:00-21:00" ตรงกับทุกสาขาจริงไหม (ถ้าต่างกัน หน้า 2 จะบอกว่า "ตามเวลาของแต่ละสาขา")'],
  prep(S) { Object.assign(S, { firstTime: true, loggedIn: false, consent: false, notifAsked: false, newAccount: undefined }); TP.emit('state'); },
  render(ctx) {
    const arts = [obPass(), obDial(ctx.S), `<div class="st-art st-art3">${brand.halo(132, { draw: true, cls: 'st-a-halo', icon: 'badge-check' })}</div>`];
    const list = `<ul class="st-ob-list">${OB_LIST.map(([i, tone, h, t]) => `<li><span class="st-li-i${tone ? ' ' + tone : ''}">${ic(i, 18, 2)}</span><span><b>${esc(h)}</b>${t}</span></li>`).join('')}</ul>`;
    return `<canvas class="field st-ob-field" aria-hidden="true"></canvas>
      <header class="st-ob-top" data-in="0">${brand.logo('wmen', { cls: 'sm' })}<button type="button" class="txtbtn st-skip">ข้าม</button></header>
      <div class="st-ob-vp" role="region" aria-roledescription="carousel" aria-label="แนะนำแอป">
        <div class="st-ob-track">${OB.map((p, n) => `<article class="st-ob-pg" role="group" aria-roledescription="slide" aria-label="${n + 1} จาก 3">${arts[n]}<div class="st-ob-tx"><h2>${p.t}</h2><p>${p.b}</p>${n === 2 ? list : ''}</div></article>`).join('')}</div>
      </div>
      <footer class="st-ob-foot" data-in="1"><div class="st-dots">${OB.map((p, n) => `<button type="button" class="st-dot" data-i="${n}" aria-label="หน้า ${n + 1} จาก 3"><i></i></button>`).join('')}</div>
        <button type="button" class="btn primary st-ob-next"></button></footer>`;
  },
  mount(el, ctx) {
    const vp = $('.st-ob-vp', el), track = $('.st-ob-track', el), pages = $$('.st-ob-pg', el), dots = $$('.st-dot', el);
    const next = $('.st-ob-next', el), skip = $('.st-skip', el), last = OB.length - 1;
    const fld = brand.field($('canvas', el), { color: '#035C67', base: .07, amp: .42, every: 3800, sigma: 38, speed: .38, origin: [.5, .3] });
    ctx.onLeave(fld.stop);
    let i = { p2: 1, p3: 2 }[ctx.state] || 0, x = 0, drag = null, dragged = false;
    const W = () => vp.offsetWidth;
    const place = v => { x = v; track.style.transform = `translate3d(${v}px,0,0)`; };
    const finish = () => TP.go('login', { via: 'push' });
    function ui8(changed) {
      dots.forEach((d, n) => d.setAttribute('aria-current', n === i ? 'step' : 'false'));
      pages.forEach((p, n) => { p.setAttribute('aria-hidden', String(n !== i)); p.inert = n !== i; });
      next.innerHTML = i === last ? '<span>เริ่มใช้งาน</span>' : `<span>ถัดไป</span>${ic('arrow-right', 20, 2)}`;
      if (changed) A(next.firstElementChild, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { d: 280, e: E.out });
      skip.classList.toggle('gone', i === last); skip.tabIndex = i === last ? -1 : 0; skip.setAttribute('aria-hidden', String(i === last));
    }
    function enter(n, base = 90) {
      const p = pages[n];
      if (n === 0) { redraw($('.st-a-halo', p)); A($('.st-pass', p), [{ opacity: 0, transform: 'translateY(26px) scale(.95)' }, { opacity: 1, transform: 'none' }], { d: SP.soft.d, e: SP.soft.e, delay: base, fill: 'backwards' }); }
      if (n === 1) {
        A($('.arc', p), [{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], { d: 1200, e: E.out, delay: base, fill: 'backwards' });
        $$('.now, .now-r', p).forEach(c => A(c, [{ opacity: 0 }, { opacity: 1 }], { d: 300, delay: base + 900, fill: 'backwards' }));
        rise($('.st-dial-c', p), base + 120, 10);
      }
      if (n === 2) redraw($('.st-a-halo', p));
      $$('.st-ob-tx > h2, .st-ob-tx > p, .st-ob-list li', p).forEach((t, k) => rise(t, base + 80 + k * 60));
    }
    function goTo(n, { anim = true } = {}) {
      n = Math.max(0, Math.min(last, n));
      const to = -n * W(), from = x, changed = n !== i;
      kill(track); place(to);
      if (anim && from !== to) A(track, [{ transform: `translate3d(${from}px,0,0)` }, { transform: `translate3d(${to}px,0,0)` }], { d: SP.soft.d, e: SP.soft.e });
      i = n; ui8(changed);
      if (changed) { enter(n); fld.pulse(.9); TP.live(OB[n].l); }
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
  states:[['normal','เลือกวิธีเข้าสู่ระบบ'],['error','ข้อความผิดพลาดการเข้าสู่ระบบ'],['signedout','หลุดจากระบบ 30 วัน'],['cover','ภาพปกหน้าร้าน'],['platform-cover','ปกแพลตฟอร์มร้านยา ไม่มีคน'],['storefront-cover','ปกหน้าร้าน ตัดป้ายร้านข้างเคียง'],['no-logo-overlay','ปกหน้าร้าน ไม่มีโลโก้และกล่องทับ'],['compact-terms','ข้อกำหนดและนโยบายระยะกระชับ'],['white-fade','เฟดขาว ปุ่มสี Primary'],['white-image','ภาพปกด้านล่างขาว ไม่มีเฟด CSS'],['simple-cover','ปกไม่มีข้อความรอง'],['cover-heading','หัวข้อและคำอธิบายบรรทัดเดียว']],
  notes:['หน้าแรกเลือกช่องทางเท่านั้น ไม่มีช่องกรอกข้อมูล','อีเมล → C104 / เบอร์โทร → C103 → ยืนยันรหัสในหน้าเดิม','อีเมลใช้บัญชีที่ผูกไว้ ขั้นตอนส่งและยืนยันรหัสยังเป็นต้นแบบ ต้องเชื่อมบริการยืนยันตัวตนจริงก่อนใช้งาน'],
  prep(S){S.loggedIn=false;},
  render(ctx){return `<div class="auth-cover"><img class="auth-cover-photo" src="/assets/auth/login-storefront-white-v4.png" alt="" fetchpriority="high"><div class="auth-cover-content">${ctx.state==='signedout'?ui.note('ออกจากระบบอัตโนมัติหลังไม่ได้ใช้งาน 30 วัน กรุณาเข้าสู่ระบบอีกครั้ง',{icon:'lock'}):ctx.state==='error'?ui.note('เข้าสู่ระบบไม่สำเร็จ กรุณาเลือกช่องทางเพื่อลองอีกครั้ง',{tone:'warn',icon:'circle-alert'}):''}<h1>ดูแลคุณ<br><span>ใกล้กว่าที่เคย</span></h1><p class="auth-cover-subtitle">ปรึกษาเภสัชกรใกล้บ้าน อุ่นใจเรื่องยา</p><div class="auth-cover-actions">${ui.btn('เข้าสู่ระบบด้วยอีเมล',{go:'loginemail',icon:'mail',kind:'primary'})}${ui.btn('เข้าสู่ระบบด้วยเบอร์โทรศัพท์',{go:'loginphone',icon:'smartphone',kind:'primary'})}</div><p class="auth-cover-terms">การเข้าสู่ระบบเป็นไปตาม <button type="button" data-a="stDoc" data-v="ข้อกำหนดการใช้งาน">ข้อกำหนดการใช้งาน</button><br>และ <button type="button" data-a="stDoc" data-v="นโยบายความเป็นส่วนตัว">นโยบายความเป็นส่วนตัว</button></p></div></div>`;}
});
/* Shared channel form: one page panel, with in-place code verification. */
function authMaskedTarget(channel,value){
  if(channel==='phone'){const phone=digits(value);return '*'.repeat(Math.max(0,phone.length-4))+phone.slice(-4);}
  const [local,domain]=String(value||'').split('@');
  if(!domain)return '***';
  const chars=Array.from(local),prefix=chars.length>2?chars.slice(0,2).join(''):'';
  return `${prefix}***@${domain}`;
}
function authFormPage(channel, body, action, extras='') {
  const f=authDraft(TP.S,channel),code=f.step==='code',title=code?'กรอกรหัส 6 หลัก':channel==='email'?'ยืนยันอีเมลของคุณ':'ยืนยันเบอร์โทรศัพท์';
  const description=code?`ส่ง${channel==='email'?'ทางอีเมล':'ทาง SMS'}ไปที่ <b>${esc(authMaskedTarget(channel,f.target))}</b>`:'รับรหัสยืนยันเพื่อเข้าสู่ระบบหรือสร้างบัญชี';
  return `<div class="auth-form-scene${code?' auth-code-step':''}"><img class="auth-form-cover" src="/assets/auth/login-consultation-header-v2.png" alt=""><button type="button" class="auth-form-back" data-a="authFormBack" aria-label="${code?'ย้อนกลับไปแก้ไข'+(channel==='email'?'อีเมล':'เบอร์โทรศัพท์'):'ย้อนกลับ'}">${ic('arrow-left',22,2)}<span>กลับ</span></button><section class="auth-form-panel" aria-label="${title}">${ui.page(`<header class="auth-panel-heading"><h1>${title}</h1><p>${description}</p></header>${code?authCodeBox(channel,f):body}${code?'':`<div class="auth-form-submit">${action}</div>${extras}`}`,{cls:'auth-form-scroll'})}${code?`<div class="auth-form-verify-action">${action}</div>${authKeypadHtml()}`:''}</section></div>`;
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
  issue(channel,target,round,S,mode){return {channel,target,round,expiresAt:Date.now()+300000,resendAt:Date.now()+60000,attempts:0,used:false,expected:round%2?'482913':'615204',existing:mode?mode==='existing':channel==='email'?target.toLowerCase()===(S.user.email||'somjai@example.com').toLowerCase():target===digits(S.user.phone)};},
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
  Object.assign(S,{loggedIn:true,firstTime:true,newAccount:true,consent:false,consentVer:0,faceId:false,marketing:false,_gone:false,_pf:null,_authFlows:{},_registration:null,_registrationComplete:false,healthConsentRecord:null,adrReports:[],_adrDrafts:{},_adr:null,_adrSent:null,ofPending:null,favoriteBranches:[],deliveryAddressId:null});
}
function authPreview(S,channel,state){
  S.loggedIn=false;S._authFlows ||= {};delete S._authFlows[channel];const f=authDraft(S,channel);
  const codeState=['otp-sent','otp-filled','otp-wrong','otp-expired','otp-locked','resend','new-account','existing-account','otp-c103','masked-target'].includes(state);
  const value=channel==='email'?(state==='invalid'?'somjai@':state==='new-account'?'new@example.com':state==='filled'||state==='service-error'||codeState?'somjai@example.com':''):(state==='error'?'08123':state==='new-account'?'0899999999':['signedout','filled'].includes(state)||codeState?digits(S.user.phone):'');
  if(channel==='email')S._loginEmail=value;else S._ph=value;
  if(codeState){f.step='code';f.target=value;f.round=1;f.mode=state==='new-account'?'new':'existing';f.challenge=TP.authDemo.issue(channel,value,1,S,f.mode);if(['otp-filled','new-account','existing-account'].includes(state))f.code='482913';if(state==='otp-wrong'){f.code='000000';f.challenge.attempts=1;f.error='รหัสไม่ถูกต้อง ลองได้อีก 4 ครั้ง'}if(state==='otp-expired'){f.challenge.expiresAt=Date.now()-1;f.challenge.resendAt=0;f.error='รหัสหมดอายุแล้ว กรุณาขอรหัสใหม่'}if(state==='otp-locked'){f.challenge.attempts=5;f.challenge.resendAt=0;f.error='ลองผิดครบ 5 ครั้งแล้ว กรุณาขอรหัสใหม่'}if(state==='resend')f.challenge.resendAt=0;}
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
  if(TP.healthConsentNeeded?TP.healthConsentNeeded(S):!(S.consent&&S.consentVer>=CN_VER))return TP.go('consents',{root:true});
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

TP.screen('loginemail',{
  group:'start',title:'ยืนยันอีเมล',code:'C104',parent:'login',cls:'auth-form-screen',sb:'dark',
  states:[['normal','ยังไม่กรอก'],['filled','กรอกอีเมลแล้ว'],['invalid','รูปแบบอีเมลไม่ถูกต้อง'],['service-error','ส่งรหัสไม่สำเร็จ'],['panel-layout','กล่องล็อกอิน 70% พร้อมปก CI'],['consultation-cover','ปกเภสัชกร ไม่มีข้อความ'],["otp-sent", "กล่องกรอกรหัสในหน้าเดิม"], ["otp-filled", "รหัสครบ พร้อมยืนยัน"], ["otp-wrong", "รหัสไม่ถูกต้อง"], ["otp-expired", "รหัสหมดอายุ"], ["otp-locked", "ลองผิดครบกำหนด"], ["resend", "ส่งรหัสใหม่ได้"], ["new-account", "ยืนยันแล้วไปสมัครใหม่"], ["existing-account", "ยืนยันแล้วไปหน้าหลัก"],["plain-panel","ไม่มีโลโก้และกล่องทับ"],["otp-c103","กรอกรหัสในหน้าเดิม กลับแก้ปลายทางได้"],["masked-target","ซ่อนปลายทางและแป้นตัวเลขพอดีปุ่ม"]],
  notes:['ส่งรหัสแล้วแสดงช่อง6หลักในหน้าเดิม ปุ่มยืนยันและดำเนินการต่อใช้ทั้งบัญชีเดิมและใหม่','บัญชีใหม่ไป C104 กรอกข้อมูลและความยินยอม บัญชีเดิมไปหน้าหลักเมื่อความยินยอมปัจจุบันครบ','ต้นแบบยังไม่ส่งอีเมลจริง รหัสครั้งแรก482913 ส่งใหม่615204 ไม่เปิดเผยว่ามีบัญชีหรือไม่ก่อนยืนยัน','ตัวอย่าง somjai@example.com เป็นบัญชีเดิม new@example.com เป็นบัญชีใหม่ ในการใช้งานจริงต้องให้ server ตัดสินหลังยืนยันรหัส'],
  prep(S){authPreview(S,'email',S.st.loginemail);},
  render(ctx){const S=ctx.S,f=authDraft(S,'email'),value=S._loginEmail||'',invalid=ctx.state==='invalid'&&f.step==='entry';return authFormPage('email',`<div class="field"><label for="loginEmail">อีเมล</label><input id="loginEmail" class="input" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" maxlength="254" value="${esc(value)}" ${f.step==='code'?'readonly':''} aria-invalid="${invalid}" placeholder="somjai@example.com" aria-describedby="loginEmailError"><p class="err-t" id="loginEmailError" role="alert" ${invalid?'':'hidden'}>กรอกอีเมลให้ครบ เช่น somjai@example.com</p></div>${f.requestError?ui.note(f.requestError,{tone:'warn',icon:'circle-alert'}):''}${authCodeBox('email',f)}`,authSubmitButton('email',value));},
  mount(el,ctx){if(authDraft(TP.S,'email').step==='code'){authMountCode(el,ctx,'email');return;}const input=$('#loginEmail',el),button=$('#emailGo',el),error=$('#loginEmailError',el),f=authDraft(TP.S,'email');input.addEventListener('input',()=>{if(f.step!=='entry')return;TP.S._loginEmail=input.value;button.disabled=!input.value.trim();error.hidden=true;input.setAttribute('aria-invalid','false');});input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!button.disabled){event.preventDefault();TP.ACTS.authEmailSend(button);}});authMountCode(el,ctx,'email');}
});
TP.screen('loginphone',{
  group:'start',title:'ยืนยันเบอร์โทรศัพท์',code:'C103',parent:'login',cls:'auth-form-screen',sb:'dark',
  states:[['normal','ปกติ'],['error','เบอร์ไม่ถูกต้อง'],['signedout','หลุดจากระบบ 30 วัน'],['filled','กรอกเบอร์แล้ว'],['panel-layout','กล่องล็อกอิน 70% พร้อมปก CI'],['consultation-cover','ปกเภสัชกร ไม่มีข้อความ'],["otp-sent", "กล่องกรอกรหัสในหน้าเดิม"], ["otp-filled", "รหัสครบ พร้อมยืนยัน"], ["otp-wrong", "รหัสไม่ถูกต้อง"], ["otp-expired", "รหัสหมดอายุ"], ["otp-locked", "ลองผิดครบกำหนด"], ["resend", "ส่งรหัสใหม่ได้"], ["new-account", "ยืนยันแล้วไปสมัครใหม่"], ["existing-account", "ยืนยันแล้วไปหน้าหลัก"],["plain-panel","ไม่มีโลโก้และกล่องทับ"],["otp-c103","กรอกรหัสในหน้าเดิม กลับแก้ปลายทางได้"],["masked-target","ซ่อนปลายทางและแป้นตัวเลขพอดีปุ่ม"]],
  notes:['ใช้กล่องยืนยัน6หลักในหน้าเดิมเหมือนอีเมล ไม่เปลี่ยนข้อมูลคนไข้ก่อนยืนยัน','ต้นแบบยังไม่ส่ง SMS จริง รหัสครั้งแรก482913 ส่งใหม่615204','บัญชีเดิมคงข้อมูลครอบครัวและประวัติ บัญชีใหม่เริ่มข้อมูลว่างและไปสมัคร C104'],
  prep(S){authPreview(S,'phone',S.st.loginphone);},
  render(ctx){const S=ctx.S,f=authDraft(S,'phone'),d=S._ph||'',err=ctx.state==='error'&&f.step==='entry';return authFormPage('phone',`${ctx.state==='signedout'?ui.note('ออกจากระบบอัตโนมัติหลังไม่ได้เปิดแอป 30 วัน กรุณายืนยันเบอร์เดิม',{icon:'lock'}):''}<div class="field st-ph${err?' err':''}"><label for="phIn">เบอร์โทรศัพท์มือถือ</label><div class="st-phbox"><span class="st-cc" aria-hidden="true">+66</span><input id="phIn" class="st-phin" type="tel" inputmode="numeric" autocomplete="tel" placeholder="08X XXX XXXX" maxlength="12" value="${esc(fmtPhone(d))}" ${f.step==='code'?'readonly':''} aria-invalid="${err}" aria-describedby="phE"></div><p class="err-t" id="phE" role="alert" ${err?'':'hidden'}>${ic('circle-x',16,2)}<span>${PH_ERR}</span></p></div>${authCodeBox('phone',f)}`,authSubmitButton('phone',d),`<div class="st-help auth-form-help"><button type="button" class="link st-inl" id="lgHelpBtn" aria-expanded="false" aria-controls="lgHelp">เปลี่ยนเบอร์มือถือแล้ว?</button><div id="lgHelp" hidden>${ui.note('ติดต่อฝ่ายบริการลูกค้า (10:00-18:00) เพื่อย้ายบัญชีไปเบอร์ใหม่ โดยยืนยันตัวตนก่อน',{icon:'headset'})}</div></div>`);},
  mount(el,ctx){if(authDraft(TP.S,'phone').step==='code'){authMountCode(el,ctx,'phone');return;}const input=$('#phIn',el),button=$('#lgGo',el),help=$('#lgHelpBtn',el),content=$('#lgHelp',el),f=authDraft(TP.S,'phone');input.addEventListener('input',()=>{if(f.step!=='entry')return;let raw=digits(input.value);if(/^\s*\+?66/.test(input.value)&&raw.length>=11)raw='0'+raw.slice(2);TP.S._ph=raw.slice(0,10);input.value=fmtPhone(TP.S._ph);button.disabled=!TP.S._ph;if($('.st-ph',el).classList.contains('err'))loginErr(el,false);});input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!button.disabled){event.preventDefault();TP.ACTS.stLgSend(button);}});help.addEventListener('click',()=>{content.hidden=!content.hidden;help.setAttribute('aria-expanded',String(!content.hidden));});authMountCode(el,ctx,'phone');}
});

/* =====================================================================
   OTP (C02): 6 cells + caret, simulated iOS number pad with QuickType
   ===================================================================== */
/* Ref = 4 letters printed in the same SMS, so the customer knows which SMS is current after asking for a new code */
const KEYS = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['', ''], ['0', ''], ['del', '']];
/* =====================================================================
   Profile (C02): new phone number with no account yet, after OTP, before Face ID
   ===================================================================== */
const NOW_Y = +TP.NOW.date.slice(-4);
const PF_CHECK = {
  first: v => v.trim() ? '' : 'ใส่ชื่อ',
  last: v => v.trim() ? '' : 'ใส่นามสกุล',
  house: v => (v || '').trim() ? '' : 'ใส่บ้านเลขที่ / ซอย / ถนน',
  dist: v => (v || '').trim() ? '' : 'ใส่ตำบล / แขวง',
  amp: v => (v || '').trim() ? '' : 'ใส่อำเภอ / เขต',
  prov: v => (v || '').trim() ? '' : 'ใส่จังหวัด',
  zip: v => /^\d{5}$/.test(v || '') ? '' : 'ใส่รหัสไปรษณีย์ 5 หลัก',
  year: v => {
    if (!/^\d{4}$/.test(v)) return 'ใส่ปีเกิดเป็น ค.ศ. 4 หลัก เช่น 1988';
    const y = +v;
    if (y >= 2443 && y <= NOW_Y + 543) return `เลขนี้น่าจะเป็นปี พ.ศ. ปี ค.ศ. คือ ${y - 543}`;
    if (y < 1900 || y > NOW_Y) return `ปีเกิดต้องอยู่ระหว่าง 1900 ถึง ${NOW_Y}`;
    return '';
  }
};
const SEXES = [['none', 'ไม่ระบุ'], ['f', 'หญิง'], ['m', 'ชาย']];
function pfField(k, o, d, err) {
  const id = 'pf-' + k, e = err ? PF_CHECK[k](d[k]) : '';
  const be = k === 'year' && /^\d{4}$/.test(d.year) && +d.year >= 2443 && +d.year <= NOW_Y + 543 ? +d.year - 543 : 0;
  return `<div class="field st-pf-f${e ? ' err' : ''}" data-k="${k}">
    <label for="${id}">${o.label}</label>
    <input id="${id}" class="input" type="text" value="${esc(d[k] || '')}" placeholder="${o.ph}" autocomplete="${o.ac}"${o.im ? ` inputmode="${o.im}"` : ''} maxlength="${o.max}" aria-invalid="${!!e}" aria-describedby="${id}-h ${id}-e">
    <p class="hint" id="${id}-h"${e ? ' hidden' : ''}>${o.hint || ''}</p>
    <p class="err-t" id="${id}-e" role="alert"${e ? '' : ' hidden'}>${ic('circle-x', 16, 2)}<span>${esc(e)}</span>${be ? `<button type="button" class="link st-inl st-fix" data-fix="${be}">ใช้ ${be}</button>` : ''}</p>
  </div>`;
}
/* a full 4-digit year that is wrong (e.g. Thai calendar 2511) explains itself while typing, not only on blur */
const ageText = v => { const e = PF_CHECK.year(v); return !e ? `<b class="st-age">อายุ ${NOW_Y - +v} ปี</b>` : /^\d{4}$/.test(v) ? `<b class="warn-t">${e}</b>` : 'ปี ค.ศ. 4 หลัก เช่น 1988'; };
const pfMode = ctx => ctx.params.edit ? 'edit' : ctx.params.acct || ctx.state === 'acct' ? 'acct' : 'new';
const pfAcctCard = (S, ph) => `<div class="st-acct" id="pfAcct" data-in="1" role="group" aria-labelledby="pfAcctT">
    <p class="st-acct-t" id="pfAcctT">${ic('circle-user-round', 20, 1.9)}<span>พบบัญชีเว็บของ <b>คุณ${esc(S.user.full)}</b> <span class="num st-nw">(${esc(ph)})</span> ใช่คุณไหม</span></p>
    <div class="st-acct-b"><button type="button" class="btn tint sm" data-x="yes">ใช่</button><button type="button" class="btn ghost sm" data-x="no">ไม่ใช่ ติดต่อฝ่ายบริการลูกค้า</button></div></div>`;
const pfAcctOk = (S, ph) => `<p class="st-pf-ok" data-in="1">${ui.tag('บัญชีของคุณ', 'ok', { dot: true })}<span>คุณ${esc(S.user.full)} <span class="num st-nw">${esc(ph)}</span></span></p>`;
/* consent sits on the same screen (owner 19/10/2026): short summary, link to the full text, a box that is never pre-ticked */
const pfConsent = acct => `<h3 class="group-h st-pf-cnh" data-in="5">ความยินยอมในการใช้ข้อมูล</h3>
    <div class="card st-pf-cn" id="pfCnBox" data-in="5">
      <ul class="st-pf-cnl">${CN_SUM.map(([i, t, x]) => `<li>${ic(i, 16, 2)}<span><b>${esc(t)}</b> ${esc(x)}</span></li>`).join('')}</ul>
      <p class="st-pf-cnv">${ic('file-text', 15, 2)}<span>ฉบับที่ ${CN_VER} · มีผล 18/10/2026${acct ? ' · เพิ่มหัวข้อบริการปรึกษาผ่านแอปจากฉบับที่คุณยินยอมไว้บนเว็บ' : ''} <button type="button" class="link st-inl" data-sheet="consenttext">อ่านฉบับเต็ม</button></span></p>
      <div class="st-pf-cnk">${ui.check('<b>ยินยอมให้ใช้ข้อมูลสุขภาพเพื่อการปรึกษาและจ่ายยา</b><small>จำเป็นสำหรับการปรึกษา · ข้อมูลอ่อนไหวตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล</small>', { id: 'pfCn', a: 'pfCn' })}
        <p class="st-req-e" id="pfCnE" hidden>${ic('circle-x', 16, 2)}<span>ติ๊กยินยอมก่อน จึงจะเริ่มปรึกษาได้</span></p></div>
    </div>`;
TP.act('pfCn', () => TP.cur()?.el?._pfSync?.());
/* Registration draft: verified contact is carried from OTP, never requested twice. */
const REG_TOPICS=[['weight','น้ำหนัก'],['height','ส่วนสูง'],['conditions','โรคประจำตัว'],['meds','ยาที่ใช้ประจำ'],['allergies','ประวัติการแพ้ยา'],['documents','เอกสารการแพ้ยา'],['food','ประวัติการแพ้อาหาร'],['follow','ติดตามอาการป่วย']];
/* Single purpose, explicit health-data consent. Company details require owner confirmation. */
const REG_HEALTH_POLICY={version:'health-care-2026-11-01-draft-2',controller:'บริษัท มิตรอารีแคร์ จำกัด',address:null,contact:null,retention:null};
const regConsentAccepted=d=>d.healthConsentVersion===REG_HEALTH_POLICY.version&&REG_TOPICS.every(([key])=>d.consents[key]===true);
function regConsentDocument(){const p=REG_HEALTH_POLICY;return `<article class="reg-consent-document"><p class="reg-policy-meta">ฉบับร่าง · 1 พฤศจิกายน 2569</p>${ui.note('รอระบุที่อยู่และช่องทางติดต่อผู้ควบคุมข้อมูล รวมถึงยืนยันระยะเวลาเก็บรักษา ก่อนนำเอกสารไปใช้จริง',{tone:'warn',icon:'info'})}<p class="reg-policy-intro">เอกสารนี้อธิบายการขอความยินยอมใช้ข้อมูลสุขภาพเพื่อให้บริการเภสัชกรรมผ่าน MITRAREE โปรดอ่านก่อนตัดสินใจให้ความยินยอม</p>
<section><h3>1. ผู้ควบคุมข้อมูลและวัตถุประสงค์</h3><p>${esc(p.controller)} ขอความยินยอมในการเก็บรวบรวม ใช้ และเปิดเผยข้อมูลสุขภาพของท่าน เฉพาะเพื่อให้เภสัชกรประเมินอาการและความเหมาะสมของยา ตรวจสอบการแพ้ยาและความเสี่ยงจากการใช้ยา ให้คำปรึกษา จ่ายยาเมื่อเหมาะสม และติดตามความปลอดภัยในการใช้ยาที่เกี่ยวเนื่องกับการปรึกษานั้น</p><p>ที่อยู่ผู้ควบคุมข้อมูล: ${esc(p.address||'[รอบริษัทระบุที่อยู่]')}<br>ช่องทางติดต่อเรื่องข้อมูลส่วนบุคคล: ${esc(p.contact||'[รอบริษัทยืนยันช่องทางติดต่อ]')}</p></section>
<section><h3>2. ข้อมูลที่อยู่ในขอบเขตความยินยอม</h3><p>น้ำหนัก ส่วนสูง โรคประจำตัว ยาที่ใช้ประจำ ประวัติการแพ้ยา เอกสารการแพ้ยา ประวัติการแพ้อาหาร อาการที่แจ้ง และข้อมูลติดตามอาการหลังใช้ยา รวมถึงข้อความหรือรูปที่ท่านส่งเพื่อการปรึกษา บันทึกการปรึกษา ใบสรุป และบันทึกการจ่ายยา เฉพาะส่วนที่จำเป็นต่อบริการดังกล่าว</p><p>ข้อมูลทั่วไป เช่น ชื่อ ข้อมูลติดต่อ และที่อยู่ ต้องประมวลผลตามฐานกฎหมายและประกาศความเป็นส่วนตัวที่เกี่ยวข้อง ความยินยอมนี้ไม่ใช้แทนฐานกฎหมายของข้อมูลทุกประเภท</p><p>เมื่อมีการซื้อยา ข้อมูลที่จำเป็นต่อการจัดส่งและรับชำระเงิน เช่น ผู้รับ ที่อยู่จัดส่ง และรายการธุรกรรม จะดำเนินการตามฐานกฎหมายและประกาศความเป็นส่วนตัวของบริการนั้น แยกจากความยินยอมใช้ข้อมูลสุขภาพนี้</p></section>
<section><h3>3. ผู้ที่อาจได้รับข้อมูล</h3><p>เภสัชกรและร้านยาที่ให้บริการท่าน รวมถึงผู้ปฏิบัติงานหรือผู้ประมวลผลข้อมูลที่ได้รับมอบหมาย เฉพาะที่จำเป็นต่อวัตถุประสงค์ข้างต้น โดยต้องมีหน้าที่รักษาความลับและมาตรการคุ้มครองที่เหมาะสม การเปิดเผยตามหน้าที่กฎหมายให้ดำเนินการตามเงื่อนไขของกฎหมายนั้น</p><p>หากมีการส่งข้อมูลไปต่างประเทศ บริษัทต้องแจ้งรายละเอียดที่เกี่ยวข้องและจัดให้มีฐานกฎหมายและมาตรการคุ้มครองตามที่กฎหมายกำหนด ความยินยอมนี้ไม่ใช่การอนุญาตให้โอนข้อมูลไปต่างประเทศโดยไม่มีขอบเขต</p><p>ผู้ให้บริการขนส่งและรับชำระเงินควรได้รับเฉพาะข้อมูลที่จำเป็นต่องานของตน ไม่ได้รับประวัติสุขภาพทั้งหมดเพียงเพราะท่านซื้อยา</p></section>
<section><h3>4. การตัดสินใจของท่าน</h3><p>ท่านเลือกให้หรือไม่ให้ความยินยอมได้โดยสมัครใจ ความยินยอมนี้ไม่รวมการโฆษณา การตลาด การขายข้อมูล การวิจัย หรือการใช้ข้อมูลของบุคคลอื่น หากมีวัตถุประสงค์อื่นที่ต้องอาศัยความยินยอม บริษัทต้องขอแยกต่างหาก</p><p>หากไม่มีข้อมูลสุขภาพที่จำเป็น เภสัชกรอาจประเมินหรือให้บริการบางส่วนได้ไม่ครบถ้วน บริษัทต้องแจ้งผลกระทบและพิจารณาฐานกฎหมายที่ใช้กับบริการนั้น ไม่ใช้ความยินยอมนี้บังคับให้ท่านยอมรับการใช้ข้อมูลที่ไม่เกี่ยวข้องกับบริการ</p></section>
<section><h3>5. ระยะเวลาเก็บและความปลอดภัย</h3><p>${esc(p.retention||'เก็บข้อมูลเท่าที่จำเป็นต่อการให้บริการเภสัชกรรมและการติดตามความปลอดภัย รวมถึงระยะเวลาที่จำเป็นตามหน้าที่กฎหมายหรือการใช้สิทธิเรียกร้อง เมื่อหมดความจำเป็นให้ลบ ทำลาย หรือทำให้ไม่สามารถระบุตัวบุคคลได้ โดยบริษัทต้องกำหนดและแจ้งระยะเวลาหรือเกณฑ์เก็บรักษาของข้อมูลแต่ละประเภทก่อนใช้จริง')}</p><p>บริษัทต้องจำกัดสิทธิการเข้าถึงและจัดให้มีมาตรการรักษาความมั่นคงปลอดภัยที่เหมาะสมกับความเสี่ยงของข้อมูลสุขภาพ</p></section>
<section><h3>6. ถอนความยินยอมและใช้สิทธิ</h3><p>ท่านถอนความยินยอมได้ผ่านเมนูบัญชี → ความยินยอม หรือช่องทางติดต่อผู้ควบคุมข้อมูลที่ระบุในเอกสารนี้ โดยต้องทำได้ง่าย การถอนจะไม่กระทบความชอบด้วยกฎหมายของการดำเนินการที่ได้ทำไปก่อนถอน บริษัทจะแจ้งผลกระทบต่อบริการก่อนดำเนินการ และอาจเก็บหรือใช้ข้อมูลบางส่วนต่อได้เมื่อมีฐานกฎหมายอื่นรองรับ</p><p>ท่านมีสิทธิขอเข้าถึงหรือรับสำเนา แก้ไข ขอให้ลบหรือจำกัดการใช้ คัดค้าน หรือขอรับและโอนข้อมูลเมื่อเข้าเงื่อนไขกฎหมาย และมีสิทธิร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล การใช้สิทธิแต่ละประเภทอาจมีเงื่อนไขหรือข้อยกเว้นตามกฎหมาย</p></section>
<section><h3>7. ข้อมูลของผู้เยาว์หรือบุคคลอื่น</h3><p>ความยินยอมนี้ใช้กับข้อมูลของเจ้าของบัญชีตามขอบเขตที่ระบุ ไม่ถือเป็นความยินยอมแทนบุคคลอื่นโดยอัตโนมัติ หากกฎหมายกำหนดให้ต้องได้รับความยินยอมจากผู้ใช้อำนาจปกครอง ผู้อนุบาล หรือผู้พิทักษ์ บริษัทต้องตรวจสอบและดำเนินการให้ถูกต้องก่อนอาศัยความยินยอมดังกล่าว</p></section>
<section><h3>8. การแสดงเจตนา</h3><p>เมื่อท่านเลือกช่องยินยอมที่หน้าตรวจทานและกดยืนยันสมัครสมาชิก หรือเลือกช่องยินยอมและกดบันทึกที่เมนูความยินยอม จะถือเป็นการแสดงเจตนาให้ความยินยอมตามขอบเขตเอกสารฉบับที่แสดงให้ท่านอ่าน การเปิด อ่าน หรือปิดเอกสารนี้เพียงอย่างเดียวไม่ถือเป็นการให้ความยินยอม</p></section>
<section><h3>9. การปรึกษาและติดตามผ่านแอป</h3><p>ท่านอาจปรึกษาทางแชทหรือวิดีโอคอล ข้อความ รูปที่ท่านส่ง ใบสรุป และข้อมูลการจ่ายยาอาจเป็นส่วนหนึ่งของบันทึกบริการตามวัตถุประสงค์ข้างต้น สำหรับการบันทึกภาพหรือเสียงวิดีโอ บริษัทต้องแจ้งให้ทราบอย่างชัดเจนและมีฐานกฎหมายที่เหมาะสมก่อนดำเนินการ เอกสารนี้ไม่ถือเป็นการยินยอมให้บันทึกวิดีโอคอลโดยอัตโนมัติ</p><p>เภสัชกรอาจแนะนำให้ติดตามการใช้ยาหรืออาการหลังปรึกษา คำตอบของท่านใช้เพื่อดูแลความปลอดภัย หากรายงานอาการผิดปกติ ข้อมูลจะถูกส่งให้ผู้เกี่ยวข้องประเมิน ไม่ใช่การยืนยันว่าแพ้ยาหรือรับประกันการตอบกลับทันที</p><p>การแจ้งเตือนผ่านระบบของอุปกรณ์อาจอาศัยผู้ให้บริการภายนอก เช่น Apple หรือ Google บริษัทต้องจำกัดข้อมูลที่ส่งและที่แสดงบนหน้าจอล็อกให้เหมาะสม พร้อมแจ้งผู้ให้บริการและการโอนข้อมูลตามการใช้งานจริง การอนุญาตแจ้งเตือนของอุปกรณ์แยกจากความยินยอมใช้ข้อมูลสุขภาพ</p></section>
<section id="careConsentContacts" class="reg-consent-contacts"><h3>10. ติดต่อสาขาและช่องทางอื่น</h3><p>หากยังไม่พร้อมให้ความยินยอมหรือถอนความยินยอม ท่านสอบถามเรื่องบริการและทางเลือกในการปรึกษาที่ร้านได้ตามข้อมูลติดต่อด้านล่าง ช่องทางนี้ไม่ใช่ช่องทางติดต่อผู้ควบคุมข้อมูลเรื่อง PDPA แทนรายละเอียดที่บริษัทยังต้องยืนยัน</p>${TP.callRows?ui.group(TP.callRows()):'<p class="hint">ยังไม่มีข้อมูลติดต่อสาขา</p>'}</section></article>`;}
TP.registrationConsentDocument=regConsentDocument;
function marketingConsentDocument(){return `<article class="reg-consent-document"><p class="reg-policy-meta">ฉบับร่าง · 1 พฤศจิกายน 2569</p>${ui.note('รอยืนยันที่อยู่ ช่องทางติดต่อด้านข้อมูลส่วนบุคคล ผู้ให้บริการส่งข้อความ และระยะเวลาเก็บข้อมูลก่อนใช้จริง',{tone:'warn',icon:'info'})}<section><h3>ผู้ควบคุมข้อมูลและวัตถุประสงค์</h3><p>บริษัท มิตรอารีแคร์ จำกัด ขอความยินยอมใช้ชื่อและช่องทางติดต่อที่ท่านยืนยัน เพื่อส่งข่าวสารบริการ ข้อเสนอและสิทธิพิเศษของ MITRAREE ผ่านอีเมลหากยืนยันอีเมล หรือ SMS หากยืนยันเบอร์โทรศัพท์ ไม่รวมการโทรเสนอขายหรือการนำข้อมูลสุขภาพมาเลือกกลุ่มโฆษณา</p></section><section><h3>เลือกได้โดยไม่กระทบการใช้บริการ</h3><p>การรับข่าวสารเป็นทางเลือก ช่องนี้ไม่ถูกเลือกไว้ล่วงหน้า การไม่ยินยอมหรือถอนความยินยอมไม่มีผลต่อการสมัครสมาชิก การปรึกษาเภสัชกร หรือการรับบริการ ข้อความยืนยันตัวตนและข้อความจำเป็นเกี่ยวกับบริการแยกจากข่าวสารการตลาด</p></section><section><h3>ผู้รับข้อมูลและการเก็บรักษา</h3><p>จำกัดการเข้าถึงเฉพาะผู้รับผิดชอบและผู้ให้บริการส่งข้อความที่ได้รับมอบหมายเท่าที่จำเป็น บริษัทต้องยืนยันและแจ้งผู้รับข้อมูล การส่งไปต่างประเทศถ้ามี และระยะเวลาเก็บรักษาก่อนเปิดใช้จริง เมื่อถอนความยินยอมจะยุติการใช้ข้อมูลเพื่อส่งข่าวสาร และอาจเก็บหลักฐานการเลือกหรือรายการระงับการส่งเท่าที่จำเป็นตามฐานกฎหมายที่เกี่ยวข้อง</p></section><section><h3>ถอนความยินยอมและสิทธิของท่าน</h3><p>เปลี่ยนการเลือกรับข่าวสารได้ที่ บัญชี → การตั้งค่า → ข่าวสารและสิทธิพิเศษ การถอนความยินยอมไม่กระทบการใช้ข้อมูลที่ชอบด้วยกฎหมายก่อนถอน บริษัทต้องจัดให้มีช่องทางใช้สิทธิและติดต่อผู้ควบคุมข้อมูลที่ยืนยันแล้วก่อนใช้จริง</p></section><p class="hint">การเปิดอ่านหรือปิดเอกสารนี้ไม่ถือเป็นการยินยอม</p></article>`;}
TP.sheetDef('marketingconsent',{group:'start',title:'ความยินยอมรับข่าวสาร',code:'C113',host:'profile',tall:true,hideClose:true,states:[['normal','อ่านรายละเอียด ไม่เปลี่ยนการเลือก']],notes:['ข่าวสารเป็นทางเลือก แยกจากข้อมูลสุขภาพและไม่บังคับสมัคร','เอกสารอ่านอย่างเดียว ไม่ติ๊กแทนผู้ใช้','ฉบับร่าง รอยืนยันข้อมูลผู้ควบคุมและการส่งข้อความก่อนใช้จริง'],render:marketingConsentDocument,foot:()=>ui.btn('ปิด',{kind:'secondary',closeSheet:true})});

TP.healthConsentVersion=()=>REG_HEALTH_POLICY.version;
TP.healthConsentNeeded=S=>!(S.consent&&S.consentVer>=4&&S.healthConsentRecord?.documentVersion===REG_HEALTH_POLICY.version);
TP.saveHealthConsent=(S,version,method)=>{if(version!==REG_HEALTH_POLICY.version)return false;S.consent=true;S.consentVer=4;S.healthConsentRecord={documentVersion:version,controller:REG_HEALTH_POLICY.controller,purpose:'pharmaceutical-care',acceptedAt:new Date().toISOString(),method,categories:REG_TOPICS.map(([key])=>key),prototype:true};return true;};
TP.sheetDef('registrationconsent',{group:'start',title:'ความยินยอมข้อมูลสุขภาพ',code:'C107',host:'profile',tall:true,hideClose:true,states:[['normal','อ่านความยินยอม ไม่มีช่องติ๊ก']],notes:['อ่านอย่างเดียว ปิดแล้วไม่เปลี่ยนความยินยอม','ผู้ควบคุมข้อมูล บริษัท มิตรอารีแคร์ จำกัด ตามเจ้าของโครงการยืนยัน','ฉบับร่าง รอที่อยู่ ช่องทางติดต่อ ระยะเวลา และตรวจฐานกฎหมายก่อนใช้จริง'],render:regConsentDocument,foot:()=>ui.btn('ปิด',{kind:'secondary',closeSheet:true})});
const REG_LISTS={conditions:['ความดันโลหิตสูง','ไขมันในเลือดสูง','โรคเบาหวาน','โรคหัวใจ','โรคไตเรื้อรัง','โรคหลอดเลือดสมอง'],meds:['Activelle 28s','Aerius 5 mg','Air-X 40 mg','Air-X 80 mg','Air-X 120 mg'],allergies:['Activelle 28s','Aerius 5 mg','Air-X 40 mg','Air-X 80 mg','Air-X 120 mg'],food:['ไข่','นม','แป้งสาลี','ถั่ว','อาหารทะเล']};
const REG_STEPS=['ข้อมูลส่วนตัว','ที่อยู่ตามบัตร','ข้อมูลสุขภาพ','ตรวจทานและยินยอม'];
function regDraft(S){return S._registration ||= {step:0,first:'',last:'',nationalId:'',day:'',month:'',year:'',sex:'none',weight:'',height:'',house:'',dist:'',amp:'',prov:'',zip:'',health:{conditions:{mode:'unknown',items:[]},meds:{mode:'unknown',items:[]},allergies:{mode:'unknown',items:[]},food:{mode:'unknown',items:[]}},documents:[],queries:{},docError:'',consents:{},marketing:false,errors:{},busy:false};}
function regToday(){const d=new Date();return {year:d.getFullYear(),month:d.getMonth()+1,day:d.getDate()};}
function regAge(d){const y=+d.year,m=+d.month,day=+d.day,t=regToday(),date=new Date(y,m-1,day);if(!/^\d{4}$/.test(d.year)||y<1900||y>t.year||date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==day)return null;const age=t.year-y-((t.month<m||(t.month===m&&t.day<day))?1:0);return age<0?null:age;}
function regIdDigits(v){return String(v||'').replace(/[^0-9]/g,'').slice(0,13);}
function regIdValid(v){if(!/^[1-8]\d{12}$/.test(v))return false;let sum=0;for(let i=0;i<12;i++)sum+=(13-i)*+v[i];return (11-sum%11)%10===+v[12];}
function regErrors(d,step=d.step){const e={};if(step===0){if(!d.first.trim())e.first='กรอกชื่อจริง';if(!d.last.trim())e.last='กรอกนามสกุล';if(!/^[0-9]{13}$/.test(d.nationalId))e.nationalId='กรอกเลขบัตรประชาชนเป็นตัวเลขให้ครบ 13 หลัก';else if(!regIdValid(d.nationalId))e.nationalId='เลขบัตรประชาชนไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';if(regAge(d)===null)e.day='กรอกวัน เดือน และปีเกิด ค.ศ. ที่ถูกต้อง';if(!/^\d+(?:\.\d+)?$/.test(d.weight)||!Number.isFinite(+d.weight)||+d.weight<=0||+d.weight>500)e.weight='กรอกน้ำหนักมากกว่า 0 และไม่เกิน 500 กก.';if(!/^\d+(?:\.\d+)?$/.test(d.height)||!Number.isFinite(+d.height)||+d.height<=0||+d.height>300)e.height='กรอกส่วนสูงมากกว่า 0 และไม่เกิน 300 ซม.';}
if(step===1){for(const k of ['house','dist','amp','prov'])if(!d[k].trim())e[k]='กรอก'+({house:'บ้านเลขที่ / ซอย / ถนน',dist:'ตำบล / แขวง',amp:'อำเภอ / เขต',prov:'จังหวัด'})[k];if(!/^\d{5}$/.test(d.zip))e.zip='กรอกรหัสไปรษณีย์ 5 หลัก';}
if(step===2)for(const [k,v]of Object.entries(d.health)){if(v.mode==='set'&&!regHealthValues(v).length)e[k]='เลือกอย่างน้อย 1 รายการ หรือเลือกไม่มี / ยังไม่ทราบ';if(v.mode==='set'&&v.other&&!v.otherText?.trim())e[k]='กรอก'+REG_HEALTH_LABELS[k]+'อื่น ๆ หรือยกเลิกตัวเลือกอื่น ๆ';}return e;}
const regAllValid=d=>[0,1,2].every(n=>!Object.keys(regErrors(d,n)).length);
const regCanSubmit=d=>regAllValid(d)&&regConsentAccepted(d)&&!d.busy;
function regContact(ctx){if(ctx.params.email)return {channel:'email',value:ctx.params.email};if(ctx.params.phone)return {channel:'phone',value:digits(ctx.params.phone)};return ctx.S.user.email?{channel:'email',value:ctx.S.user.email}:{channel:'phone',value:digits(ctx.S.user.phone)};}
const REG_PLACEHOLDERS={first:'ชื่อจริง',last:'นามสกุล',nationalId:'เลขบัตรประชาชน 13 หลัก',day:'15',month:'6',year:'1988',weight:'เช่น 55',height:'เช่น 160',house:'บ้านเลขที่ หมู่บ้าน ซอย ถนน',dist:'ค้นหาตำบล / แขวง',amp:'ค้นหาอำเภอ / เขต',prov:'ค้นหาจังหวัด',zip:'เช่น 10170'};
function regField(d,key,label,o={}){const error=d.errors[key];return `<div class="field${error?' err':''}" data-reg-field="${key}"><label for="reg-${key}">${esc(label)}${o.optional?' <span class="opt-t">(ไม่บังคับ)</span>':''}</label><input class="input" id="reg-${key}" data-reg-input="${key}" type="text" ${key==='nationalId'?'pattern="[0-9]{13}" minlength="13" spellcheck="false"':''} placeholder="${esc(o.placeholder||REG_PLACEHOLDERS[key]||label)}" value="${esc(d[key])}" maxlength="${o.max||80}" ${o.numeric?'inputmode="'+(o.decimal?'decimal':'numeric')+'"':''} autocomplete="${o.ac||'off'}" aria-required="true" ${o.address?'role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="regAddressResults"':''} aria-invalid="${!!error}" aria-describedby="reg-${key}-error"><p class="err-t" id="reg-${key}-error" role="alert" ${error?'':'hidden'}>${esc(error||'')}</p></div>`;}
function regProgress(d){return `<section class="reg-progress" aria-label="ขั้นตอนสมัครสมาชิก"><div class="reg-step-meta"><span class="reg-step-count">ขั้นตอน ${d.step+1} จาก ${REG_STEPS.length}</span>${d.step<REG_STEPS.length-1?`<span class="reg-step-next">ถัดไป: ${REG_STEPS[d.step+1]}</span>`:''}</div><div class="reg-progress-track" aria-hidden="true">${REG_STEPS.map((_,n)=>`<i class="${n<d.step?'is-complete':n===d.step?'is-current':''}"></i>`).join('')}</div></section>`;}

function regKv(rows){return `<dl class="reg-kv">${rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v||'ไม่ได้ระบุ')}</dd></div>`).join('')}</dl>`;}
function regHealthText(v){return v.mode==='none'?'ไม่มี':v.mode==='unknown'?'ยังไม่ทราบ':regHealthValues(v).join(' · ');}
function regReview(ctx,d,editable=true){const c=regContact(ctx),change=n=>editable?`<button type="button" class="txtbtn" data-reg-step="${n}" aria-label="แก้ไข${REG_STEPS[n]}">แก้ไข</button>`:'';return `<section class="reg-summary"><div class="reg-section-head"><h3>${ic('user',20,1.8)}ข้อมูลส่วนตัว</h3>${change(0)}</div>${regKv([['ชื่อ–นามสกุล',d.first+' '+d.last],['เลขบัตรประชาชน','*********'+d.nationalId.slice(-4)],['วันเกิด',`${d.day}/${d.month}/${d.year} · ${regAge(d)} ปี`],['เพศ',SEXES.find(x=>x[0]===d.sex)?.[1]],['น้ำหนัก / ส่วนสูง',`${d.weight} กก. / ${d.height} ซม.`],[c.channel==='email'?'อีเมลที่ยืนยันแล้ว':'เบอร์ที่ยืนยันแล้ว',authMaskedTarget(c.channel,c.value)]])}</section><section class="reg-summary"><div class="reg-section-head"><h3>${ic('map-pin',20,1.8)}ที่อยู่ตามบัตร</h3>${change(1)}</div><p>${esc([d.house,d.dist,d.amp,d.prov,d.zip].join(' '))}</p></section><section class="reg-summary"><div class="reg-section-head"><h3>${ic('heart-pulse',20,1.8)}ข้อมูลสุขภาพ</h3>${change(2)}</div>${regKv(Object.entries(d.health).map(([k,v])=>[{conditions:'โรคประจำตัว',meds:'ยาที่ใช้ประจำ',allergies:'ประวัติแพ้ยา',food:'ประวัติแพ้อาหาร'}[k],regHealthText(v)]))}<div class="reg-review-documents"><h4>เอกสารแพ้ยา${d.documents.length?` <span class="opt-t">(${d.documents.length} ไฟล์)</span>`:''}</h4>${d.documents.length?regDocumentList(d):'<p class="hint">ไม่ได้แนบเอกสาร</p>'}</div></section>`;}
const REG_HEALTH_LABELS={conditions:'โรคประจำตัว',meds:'ยาที่ใช้ประจำ',allergies:'ประวัติการแพ้ยา',food:'ประวัติแพ้อาหาร'};
function regHealthValues(h){return [...new Set([...h.items,...(h.other&&h.otherText?.trim()?[h.otherText.trim()]:[])])];}
function regHealthToggle(h,value,checked){if(value==='__other'){h.other=checked;if(!checked)h.otherText='';return;}h.items=checked?[...new Set([...h.items,value])]:h.items.filter(x=>x!==value);}
function regHealthOptions(d,key){const h=d.health[key],items=[...new Set([...REG_LISTS[key],...h.items])];return items.map(v=>`<label class="reg-health-choice"><input type="checkbox" data-reg-health-choice="${key}" data-v="${esc(v)}" ${h.items.includes(v)?'checked':''}><span>${esc(v)}</span></label>`).join('');}
function regHealthBlock(d,key,title){const h=d.health[key],placeholder={conditions:'พิมพ์ชื่อโรค หรือข้อมูลที่ต้องการแจ้งเภสัชกร',meds:'พิมพ์ชื่อยาตามฉลาก หรือรายละเอียดเพิ่มเติม',allergies:'พิมพ์ชื่อยาที่เคยแพ้ และอาการที่เกิดขึ้นหากทราบ',food:'พิมพ์อาหารที่เคยแพ้ และอาการที่เกิดขึ้นหากทราบ'}[key];return `<section class="reg-health-block"><h3 id="regHealthTitle-${key}">${title}</h3>${ui.seg('regMode-'+key,[['unknown','ยังไม่ทราบ'],['none','ไม่มี'],['set','ระบุข้อมูล']],h.mode,{a:'regHealthMode',label:title})}${h.mode==='set'?`<p class="hint">เลือกได้หลายข้อ</p><div class="reg-health-options" role="group" aria-labelledby="regHealthTitle-${key}">${regHealthOptions(d,key)}</div><label class="reg-health-choice"><input type="checkbox" data-reg-health-choice="${key}" data-v="__other" aria-controls="regHealthOther-${key}" aria-expanded="${!!h.other}" ${h.other?'checked':''}><span>อื่น ๆ</span></label><div class="field reg-health-other" id="regHealthOther-${key}" ${h.other?'':'hidden'}><label class="f-l" for="reg-health-other-${key}">${title}อื่น ๆ</label><textarea class="input" id="reg-health-other-${key}" data-reg-health-other="${key}" rows="3" maxlength="500" placeholder="${placeholder}">${esc(h.otherText||'')}</textarea></div>`:''}<p class="err-t" id="regHealthError-${key}" role="alert" ${d.errors[key]?'':'hidden'}>${esc(d.errors[key]||'')}</p></section>`;}
/* Date-of-birth zoom picker: scratch selection stays in the sheet until confirmed. */
const REG_MONTHS=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const REG_MONTH_SHORT=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
function regDobAllowed(year,month,day){const y=+year,m=+month,d=+day,t=regToday(),date=new Date(y,m-1,d);return y>=1900&&y<=t.year&&m>=1&&m<=12&&d>=1&&date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d&&(y<t.year||m<t.month||(m===t.month&&d<=t.day));}
function regDobClamp(p){const t=regToday();p.year=Math.max(1900,Math.min(t.year,+p.year||t.year-30));p.month=Math.max(1,Math.min(p.year===t.year?t.month:12,+p.month||1));const max=p.year===t.year&&p.month===t.month?t.day:new Date(p.year,p.month,0).getDate();p.day=Math.max(1,Math.min(max,+p.day||1));return p;}
function regDobInit(d,state='years'){const t=regToday(),valid=regAge(d)!==null,p={year:valid?+d.year:t.year-30,month:valid?+d.month:1,day:valid?+d.day:1};if(['months','days','selected','leap'].includes(state))Object.assign(p,{year:1988,month:2,day:29});if(state==='future')Object.assign(p,{year:t.year,month:t.month,day:t.day});if(state==='oldest')Object.assign(p,{year:1900,month:1,day:1});return regDobClamp(p);}
function regDobPick(p,kind,value){const n=+value,t=regToday();if(!Number.isInteger(n))return false;if(kind==='year'&&n>=1900&&n<=t.year){p.year=n;regDobClamp(p);return true;}if(kind==='month'&&n>=1&&n<=(p.year===t.year?t.month:12)){p.month=n;regDobClamp(p);return true;}if(kind==='day'&&regDobAllowed(p.year,p.month,n)){p.day=n;return true;}return false;}
function regDobField(d){const valid=regAge(d)!==null,label=valid?`${d.day} ${REG_MONTHS[+d.month-1]} ${d.year}`:'เลือกปี เดือน และวันเกิด',error=d.errors.day;return `<div class="field reg-birth"><span class="f-l" id="regBirthLabel">วันเกิด (ค.ศ.)</span><button type="button" id="regBirth" class="input reg-date-trigger${valid?' has-value':''}" data-a="regDobOpen" aria-haspopup="dialog" aria-labelledby="regBirthLabel regBirthValue" aria-describedby="regBirthHint regBirthError" aria-invalid="${!!error}">${ic('calendar',22,1.8)}<span id="regBirthValue">${label}</span>${ic('chevron-down',18,1.8)}</button><p class="hint" id="regBirthHint" role="status" ${valid?'':'hidden'}>${valid?'อายุ '+regAge(d)+' ปี':''}</p><p class="err-t" id="regBirthError" role="alert" ${error?'':'hidden'}>${esc(error||'')}</p></div>`;}
function regDobCaption(p){return p.day&&regDobAllowed(p.year,p.month,p.day)?`${p.day} ${REG_MONTHS[p.month-1]} ${p.year}`:p.month?`${REG_MONTHS[p.month-1]} ${p.year}`:p.year?`ค.ศ. ${p.year}`:'ยังไม่ได้เลือกวันเกิด';}
function regDobValues(p,kind){const t=regToday();const max=kind==='year'?t.year:kind==='month'?(p.year===t.year?t.month:12):(p.year===t.year&&p.month===t.month?t.day:new Date(p.year,p.month,0).getDate()),start=kind==='year'?1900:1;return Array.from({length:max-start+1},(_,i)=>start+i);}
function regDobOptions(p,kind){return regDobValues(p,kind).map(n=>`<div class="reg-dob-option" id="dob-${kind}-${n}" role="option" aria-selected="${p[kind]===n}" data-dob-value="${n}">${kind==='month'?REG_MONTHS[n-1]:n}</div>`).join('');}
function regDobMarkup(p){return `<div class="reg-dob"><div class="reg-dob-wheel-labels" aria-hidden="true"><span>วัน</span><span>เดือน</span><span>ปี ค.ศ.</span></div><div class="reg-dob-wheels">${[['day','วันเกิด'],['month','เดือนเกิด'],['year','ปีเกิด ค.ศ.']].map(([kind,label])=>`<div class="reg-dob-wheel" data-dob-wheel="${kind}" role="listbox" tabindex="0" aria-label="${label}" aria-activedescendant="dob-${kind}-${p[kind]}">${regDobOptions(p,kind)}</div>`).join('')}</div><p class="sr" id="dobWheelStatus" role="status" aria-live="polite">${regDobCaption(p)}</p></div>`;}
TP.act('regDobOpen',()=>{const p=regDobInit(regDraft(TP.S));TP.sheet('regdob',{picker:p});});
function regDobState(ctx){return ctx.params.picker ||= regDobInit(regDraft(ctx.S),ctx.state);}
function regDobCommit(S,p){if(!regDobAllowed(p.year,p.month,p.day))return false;const d=regDraft(S);Object.assign(d,{year:String(p.year),month:String(p.month),day:String(p.day),consents:{}});delete d.errors.day;delete d.errors.month;delete d.errors.year;return true;}
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
apply.addEventListener('click',async()=>{if(completing)return;for(const kind of ['year','month','day'])settle(kind);if(!regDobCommit(ctx.S,p))return;completing=true;apply.disabled=true;await TP.closeSheet();await TP.refresh({anim:false});$('#regBirth',TP.cur()?.el)?.focus({preventScroll:true});TP.live('เลือกวันเกิด '+regDobCaption(p)+' แล้ว');});
}});

function regFileSize(size){return size>=1024*1024?`${(size/(1024*1024)).toFixed(1)} MB`:`${Math.max(1,Math.ceil(size/1024))} KB`;}
function regDocumentBatch(existing,files){const allowed=['image/jpeg','image/png','image/webp','application/pdf'];if(files.some(f=>!allowed.includes(f.type)))return {error:'ไฟล์นี้ไม่รองรับ เลือก JPG, PNG, WEBP หรือ PDF'};if(files.some(f=>f.size>5*1024*1024))return {error:'ไฟล์ใหญ่เกิน 5 MB กรุณาลดขนาดแล้วลองใหม่'};const added=[];for(const f of files)if(![...existing,...added].some(x=>x.name===f.name&&x.size===f.size&&x.type===f.type))added.push(f);if(existing.length+added.length>5)return {error:'แนบได้สูงสุด 5 ไฟล์ นำไฟล์เดิมออกก่อนเพิ่มไฟล์ใหม่'};return {added};}
function regDocumentList(d,editable=false){return `<ul class="reg-documents${editable?'':' is-review'}" aria-label="เอกสารที่แนบ">${d.documents.map((x,n)=>`<li><span class="reg-document-preview">${x.type.startsWith('image/')&&x.url?`<img src="${esc(x.url)}" alt="" loading="lazy">`:`${ic('file-text',26,1.7)}<small>PDF</small>`}</span><span class="reg-document-info"><b>${esc(x.name)}</b><small>${x.type==='application/pdf'?'PDF':'รูปภาพ'} · ${regFileSize(x.size)}</small><span class="reg-document-ready">${ic('check',14,2)}แนบแล้ว</span></span>${editable?`<button type="button" class="ibtn reg-document-remove" data-reg-doc-remove="${n}" aria-label="นำเอกสาร ${esc(x.name)} ออก">${ic('x',18,2)}</button>`:''}</li>`).join('')}</ul>`;}
function regDocumentBlock(d){const full=d.documents.length>=5;return `<section class="reg-health-block reg-document-block"><div class="reg-section-head"><h3>เอกสารการแพ้ยา <span class="opt-t">(ไม่บังคับ)</span></h3><span class="reg-document-count">${d.documents.length}/5</span></div>${full?`<p class="reg-upload-limit">${ic('circle-check',18,1.8)}แนบครบ 5 ไฟล์แล้ว</p>`:`<label class="reg-upload" for="regDocs"><span class="reg-upload-icon">${ic('upload',26,1.8)}</span><b>${d.documents.length?'เพิ่มเอกสาร':'แนบรูปบัตรแพ้ยา หรือเอกสาร'}</b><small id="regDocsHint">JPG, PNG, WEBP หรือ PDF<br>ไม่เกิน 5 MB ต่อไฟล์ · สูงสุด 5 ไฟล์</small><span class="reg-upload-action">${ic('plus',16,2)}เลือกไฟล์</span></label>`}<input type="file" id="regDocs" class="sr" multiple accept="image/jpeg,image/png,image/webp,application/pdf" aria-label="แนบเอกสารการแพ้ยา" aria-describedby="${full?'regDocError':'regDocsHint regDocError'}" ${full?'disabled':''}>${regDocumentList(d,true)}<p class="err-t" id="regDocError" role="alert" ${d.docError?'':'hidden'}>${esc(d.docError||'')}</p></section>`;}
function regRender(ctx){const d=regDraft(ctx.S),c=regContact(ctx),step=d.step;let body='';if(step===0){body=`<p class="reg-help">กรอกข้อมูลให้ครบ ยกเว้นรายการที่ระบุว่าไม่บังคับ</p><p class="reg-contact">${ic(c.channel==='email'?'mail':'smartphone',20,1.8)}<span>${c.channel==='email'?'อีเมล':'เบอร์โทร'}ยืนยันแล้ว <b>${esc(authMaskedTarget(c.channel,c.value))}</b></span></p><div class="reg-name-fields">${regField(d,'first','ชื่อ',{ac:'given-name',max:50})}${regField(d,'last','นามสกุล',{ac:'family-name',max:50})}</div>${regField(d,'nationalId','เลขบัตรประชาชน',{numeric:true,max:13})}${regDobField(d)}<fieldset class="reg-sex"><legend>เพศ <span class="opt-t">(ไม่บังคับ)</span></legend><div class="reg-sex-options">${SEXES.map(([value,label])=>`<label><input type="radio" name="regSex" value="${value}" data-reg-sex ${d.sex===value?'checked':''}><span>${label}</span></label>`).join('')}</div></fieldset><div class="reg-grid">${regField(d,'weight','น้ำหนัก (กก.)',{numeric:true,decimal:true,max:6})}${regField(d,'height','ส่วนสูง (ซม.)',{numeric:true,decimal:true,max:6})}</div>`;}
if(step===1)body=`<p class="reg-help">ค้นหาแล้วเลือกที่อยู่ ระบบจะเติมตำบล อำเภอ จังหวัด และรหัสไปรษณีย์ให้</p><div class="field reg-address-search"><label class="f-l" for="reg-address-query">ค้นหาที่อยู่</label><input class="input" id="reg-address-query" type="search" placeholder="เช่น ทวีวัฒนา หรือ 10170" value="${esc(d.addressQuery||'')}" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="regAddressResults" aria-describedby="regAddressStatus" autocomplete="off"><div id="regAddressResults" class="reg-address-results" role="listbox" aria-label="ที่อยู่ที่ตรงกัน" hidden></div><p class="hint" id="regAddressStatus" role="status">ค้นหาจากตำบล อำเภอ จังหวัด หรือรหัสไปรษณีย์</p></div>${regField(d,'house','บ้านเลขที่ / หมู่บ้าน / ซอย / ถนน',{ac:'street-address',max:200})}<div class="reg-grid">${regField(d,'dist','ตำบล / แขวง',{address:true})}${regField(d,'amp','อำเภอ / เขต',{address:true})}${regField(d,'prov','จังหวัด',{address:true})}${regField(d,'zip','รหัสไปรษณีย์',{numeric:true,max:5,address:true})}</div>`;

if(step===2)body=`<p class="reg-help">ข้อมูลของคุณช่วยให้เภสัชกรตรวจสอบความเหมาะสมของยา เลือก “ยังไม่ทราบ” ได้หากไม่แน่ใจ</p>${[['conditions','โรคประจำตัว'],['meds','ยาที่ใช้ประจำ'],['allergies','ประวัติการแพ้ยา']].map(([k,t])=>regHealthBlock(d,k,t)).join('')}${regHealthBlock(d,'food','ประวัติแพ้อาหาร')}${regDocumentBlock(d)}`;
if(step===3)body=`<p class="reg-help">ตรวจสอบข้อมูลก่อนสมัคร หากต้องการแก้ไข แตะ “แก้ไข” ในแต่ละส่วน</p>${regReview(ctx,d)}<section class="reg-consent-choices" aria-label="ความยินยอม"><div class="reg-consent-single"><input type="checkbox" id="regHealthConsent" aria-labelledby="regHealthConsentLabel" ${regConsentAccepted(d)?'checked':''}><div><label id="regHealthConsentLabel" for="regHealthConsent">ข้าพเจ้ายินยอมให้บริษัท มิตรอารีแคร์ จำกัด เก็บรวบรวม ใช้ และเปิดเผยข้อมูลสุขภาพของข้าพเจ้า เพื่อบริการเภสัชกรรมตามขอบเขตที่แจ้ง</label> <button type="button" class="reg-consent-link" data-sheet="registrationconsent" aria-haspopup="dialog">อ่านเพิ่มเติม</button></div></div><div class="reg-consent-single"><input type="checkbox" id="regMarketingConsent" aria-labelledby="regMarketingConsentLabel" ${d.marketing?'checked':''}><div><label id="regMarketingConsentLabel" for="regMarketingConsent">ข้าพเจ้ายินยอมรับข่าวสารและสิทธิพิเศษจากบริษัท มิตรอารีแคร์ จำกัด ผ่านช่องทางติดต่อที่ยืนยันแล้ว <span class="opt-t">(ไม่บังคับ)</span></label> <button type="button" class="reg-consent-link" data-sheet="marketingconsent" aria-haspopup="dialog">อ่านเพิ่มเติม</button></div></div></section>`;
const enabled=step===3?regCanSubmit(d):!Object.keys(regErrors(d)).length;return ui.nav({title:'สมัครสมาชิก',left:step===0?'<button type="button" class="back" data-a="regCancel">ยกเลิก</button>':''})+regProgress(d)+ui.page(`<div class="registration-page"><h2 class="reg-body-heading">${REG_STEPS[step]}</h2>${d.submitError?ui.note(d.submitError,{tone:'warn',icon:'circle-alert'}):''}${body}</div>`,{cls:'registration-scroll'})+ui.dock(`<div class="reg-nav-actions${step===0?' single':''}">${step>0?`<button type="button" class="btn secondary" data-a="regBack" ${d.busy?'disabled':''}>${ic('chevron-left',20,2)}ย้อนกลับ</button>`:''}<button type="button" class="btn primary" id="regNext" data-a="regNext" ${enabled?'':'disabled'}>${d.busy?'กำลังบันทึก…':step===3?'ยืนยันและสมัครสมาชิก':'ถัดไป'}${ic('arrow-right',20,2)}</button></div>`,{note:step===3?'ยังไม่สมัครจนกว่าคุณจะกดยืนยัน':undefined});}
TP.act('regHealthMode',t=>{const d=regDraft(TP.S),key=t.closest('[data-segname]').dataset.segname.replace('regMode-',''),h=d.health[key];h.mode=t.dataset.v;if(h.mode!=='set'){h.items=[];h.other=false;h.otherText='';}d.consents={};TP.refresh({anim:false});});
TP.act('regSex',t=>{const d=regDraft(TP.S);d.sex=t.dataset.v;d.consents={};});
function regSetHealthConsent(d,on){d.consents=on?Object.fromEntries(REG_TOPICS.map(([key])=>[key,true])):{};d.healthConsentVersion=on?REG_HEALTH_POLICY.version:null;}
TP.act('regHealthConsent',t=>{regSetHealthConsent(regDraft(TP.S),t.getAttribute('aria-checked')==='true');TP.cur()?.el?._regSync?.();});
TP.act('regBack',()=>{const d=regDraft(TP.S);if(d.busy)return;if(d.step>0){d.step--;d.returnToReview=false;d.errors={};return TP.refresh({anim:false});}return TP.sheet('registrationexit');});
TP.act('regCancel',()=>{const c=TP.cur();if(c?.id!=='profile'||pfMode(c.ctx)!=='new'||regDraft(TP.S).busy)return;return TP.sheet('registrationexit');});
TP.act('regDiscard',async()=>{const c=TP.cur();if(c?.id!=='profile'||pfMode(c.ctx)!=='new'||regDraft(TP.S).busy)return;for(const f of regDraft(TP.S).documents)if(f.url?.startsWith('blob:'))URL.revokeObjectURL(f.url);await TP.closeSheet();authNewAccount(TP.S,'email','');Object.assign(TP.S,{loggedIn:false,newAccount:false,consent:false,consentVer:0,_registration:null,_registrationComplete:false,_authFlows:{},_pf:null});TP.emit('state');await TP.go('login',{root:true});});
TP.sheetDef('registrationexit',{group:'start',title:'ออกจากการสมัครสมาชิก?',code:'C106',host:'profile',hideClose:true,states:[['normal','ยืนยันก่อนออก']],notes:['ขั้นแรกยกเลิกที่มุมบน ขั้น2–4ย้อนกลับที่ด้านล่าง ไม่มีปุ่มกลับซ้ำ','กรอกต่อหรือปิดแผ่นนี้คงค่าที่กรอกไว้ทุกขั้น','ยืนยันออกจะทิ้งร่างและกลับหน้าเลือกช่องทาง ไม่สร้างบัญชีหรือยินยอมแทน'],render(){return '<p class="body">ข้อมูลที่กรอกยังไม่ได้บันทึก หากออกตอนนี้จะต้องเริ่มกรอกใหม่เมื่อกลับมาสมัครอีกครั้ง</p>';},foot(){return ui.btn('กรอกต่อ',{closeSheet:true})+ui.btn('ออกจากการสมัคร',{kind:'secondary',a:'regDiscard'});}});

TP.act('regNext',async t=>{const ctx=TP.cur()?.ctx;if(!ctx)return;const d=regDraft(TP.S);d.errors=regErrors(d);if(Object.keys(d.errors).length)return TP.refresh({anim:false});if(d.step<3){d.step=d.returnToReview?3:d.step+1;d.returnToReview=false;return TP.refresh({anim:false});}if(!regCanSubmit(d)||t.disabled)return;d.busy=true;t.disabled=true;t.setAttribute('aria-busy','true');try{await TP.registrationService.save(TP.S,d,regContact(ctx));d.busy=false;await TP.go('registrationsuccess',{root:true});}catch{d.busy=false;d.submitError='บันทึกข้อมูลไม่สำเร็จ ข้อมูลที่กรอกยังอยู่ ลองอีกครั้งได้';TP.refresh({anim:false});}});
/* Local prototype adapter; production must replace this with authenticated, server-validated storage. */
TP.registrationService={async save(S,d,contact){if(!regCanSubmit({...d,busy:false}))throw Error('Invalid registration');if(S.st.profile==='save-error')throw Error('Preview failure');const first=d.first.trim(),last=d.last.trim();TP.freshAccount(S);Object.assign(S.user,{name:first,last,full:first+' '+last,nationalId:d.nationalId,identityAddress:{house:d.house.trim(),dist:d.dist.trim(),amp:d.amp.trim(),prov:d.prov.trim(),zip:d.zip},birthDate:`${d.year}-${d.month.padStart(2,'0')}-${d.day.padStart(2,'0')}`,birthYear:+d.year,born:d.year,age:regAge(d),sex:d.sex,weight:d.weight,height:d.height,conditions:regHealthValues(d.health.conditions),condNone:d.health.conditions.mode==='none',conditionState:d.health.conditions.mode,meds:regHealthValues(d.health.meds),medState:d.health.meds.mode,allergies:regHealthValues(d.health.allergies),allergyState:d.health.allergies.mode==='set'?'set':d.health.allergies.mode,allergySrc:'ผู้ใช้ระบุ · รอเภสัชกรตรวจสอบ',food:regHealthValues(d.health.food).join(', '),foodNone:d.health.food.mode==='none',foodState:d.health.food.mode,allergyDocuments:d.documents.map(({name,size,type})=>({name,size,type}))});S.user[contact.channel==='email'?'email':'phone']=contact.value;Object.assign(S,{consent:true,consentVer:CN_VER,consentTopics:{...d.consents},healthConsentRecord:{documentVersion:REG_HEALTH_POLICY.version,controller:REG_HEALTH_POLICY.controller,purpose:'pharmaceutical-care',acceptedAt:new Date().toISOString(),method:'registration-checkbox',categories:REG_TOPICS.map(([key])=>key),prototype:true},firstTime:false,newAccount:false,loggedIn:true,marketing:!!d.marketing,marketingConsentRecord:{documentVersion:'marketing-2026-11-01-draft-1',accepted:!!d.marketing,channel:contact.channel,recordedAt:new Date().toISOString(),method:'registration-checkbox',prototype:true},_appNew:true});S._registrationComplete=true;TP.emit('state');}};
TP.thaiAddressData={rows:null,pending:null,async load(){if(this.rows)return this.rows;if(!this.pending)this.pending=fetch('/assets/data/thailand/addresses.json').then(r=>{if(!r.ok)throw Error('Address data');return r.json();}).then(rows=>this.rows=rows).catch(e=>{this.pending=null;throw e;});return this.pending;},search(rows,key,query){const mapped={dist:'district',amp:'amphoe',prov:'province',zip:'zipcode'}[key],q=query.trim();if(!q||(!mapped&&key!=='all'))return [];const fields=mapped?[mapped]:['district','amphoe','province','zipcode'],terms=q.split(/[\s\u00b7]+/).filter(Boolean);return rows.filter(r=>terms.every(term=>fields.some(k=>String(r[k]).includes(term)))).sort((a,b)=>Number(fields.some(k=>String(b[k])===q))-Number(fields.some(k=>String(a[k])===q))).slice(0,12);}};
function regMount(el,ctx){const d=regDraft(ctx.S),go=$('#regNext',el);const progress=$(':scope>.reg-progress',el);if(progress){const measure=()=>el.style.setProperty('--reg-progress-height',progress.offsetHeight+'px');measure();if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(measure);observer.observe(progress);ctx.onLeave(()=>observer.disconnect());}}const sync=()=>{go.disabled=d.step===3?!regCanSubmit(d):!!Object.keys(regErrors(d)).length;go.setAttribute('aria-disabled',String(go.disabled));};el._regSync=sync;
$('#regHealthConsent',el)?.addEventListener('change',e=>{regSetHealthConsent(d,e.target.checked);sync();});
$('#regMarketingConsent',el)?.addEventListener('change',e=>{d.marketing=e.target.checked;sync();});
const clearConsent=()=>{d.consents={};d.submitError='';};const errors=key=>{const e=regErrors(d)[key]||'',input=$('#reg-'+key,el),msg=$('#reg-'+key+'-error',el);if(e)d.errors[key]=e;else delete d.errors[key];if(!input||!msg)return;input.setAttribute('aria-invalid',String(!!e));input.closest?.('[data-reg-field]')?.classList.toggle('err',!!e);msg.hidden=!e;msg.textContent=e;};
$$('[data-reg-input]',el).forEach(input=>{const key=input.dataset.regInput;input.addEventListener('input',()=>{if(key==='nationalId')input.value=regIdDigits(input.value);d[key]=input.value;clearConsent();if(d.errors[key])errors(key);if(['day','month','year'].includes(key))$('#regAge',el).textContent=regAge(d)!==null?`อายุ ${regAge(d)} ปี`:'กรอกวัน เดือน และปีเกิด ค.ศ. ให้ครบ';sync();});input.addEventListener('blur',()=>errors(key));});
$$('[data-reg-sex]',el).forEach(input=>input.addEventListener('change',()=>{if(input.checked){d.sex=input.value;clearConsent();sync();}}));
if(d.step===1)regMountAddress(el,d,sync,ctx);
const healthSync=key=>{clearConsent();const error=$('#regHealthError-'+key,el);if(error){const text=regErrors(d)[key]||'';error.textContent=text;error.hidden=!text;}sync();};
el.addEventListener('change',e=>{const input=e.target,key=input.dataset.regHealthChoice;if(!REG_HEALTH_LABELS[key]||d.busy)return;const h=d.health[key];regHealthToggle(h,input.dataset.v,input.checked);if(input.dataset.v==='__other'){const area=$('#regHealthOther-'+key,el),text=$('#reg-health-other-'+key,el);area.hidden=!h.other;input.setAttribute('aria-expanded',String(!!h.other));if(h.other)text.focus({preventScroll:true});else text.value='';}healthSync(key);});
el.addEventListener('input',e=>{const key=e.target.dataset.regHealthOther;if(!REG_HEALTH_LABELS[key]||d.busy)return;d.health[key].otherText=e.target.value;healthSync(key);});

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
function regMockInputs(d){
  if(d.busy || ![0,1].includes(d.step))return false;
  if(d.step===0){
    const base='110170020345';let sum=0;for(let i=0;i<12;i++)sum+=(13-i)*+base[i];
    Object.assign(d,{first:'สมใจ',last:'ใจดี',nationalId:base+((11-sum%11)%10),day:'15',month:'6',year:'1988',sex:'f',weight:'55',height:'160'});
  }else Object.assign(d,{house:'88/12 ซอยทวีวัฒนา',dist:'ทวีวัฒนา',amp:'ทวีวัฒนา',prov:'กรุงเทพมหานคร',zip:'10170'});
  d.errors={};d.submitError='';d.consents={};return true;
}
TP.registrationPreview={
  canFill(c){return c?.id==='profile' && pfMode(c.ctx)==='new' && !c.ctx.S._registration?.busy && [0,1].includes(c.ctx.S._registration?.step??0);},
  fillCurrent(){const c=TP.cur();if(TP.sheetOpen?.() || !this.canFill(c))return false;if(!regMockInputs(regDraft(c.ctx.S)))return false;TP.refresh({anim:false});return true;}
};
function regPreview(S,state='empty'){const d=regDraft(S);if(state==='marketing-opt-in'||state==='marketing-opt-out'){regPreview(S,'consent-ready');d.marketing=state==='marketing-opt-in';return;}if(['filled','registration-back','address','address-search','address-no-results','address-error','health','health-empty','health-filled','review','consent-partial','consent-ready','save-error','health-none','health-no-results','health-documents','health-doc-error'].includes(state)||state.startsWith('conditions-')||state==='health-all-other'||state==='health-doc-limit'){Object.assign(d,{first:'สมใจ',last:'ใจดี',nationalId:'1101700203450',day:'15',month:'6',year:'1988',weight:'55',height:'160',house:'88/12 ซอยทวีวัฒนา',dist:'ทวีวัฒนา',amp:'ทวีวัฒนา',prov:'กรุงเทพมหานคร',zip:'10170'});const base=d.nationalId.slice(0,12);let sum=0;for(let i=0;i<12;i++)sum+=(13-i)*+base[i];d.nationalId=base+((11-sum%11)%10);}
if(state==='error')Object.assign(d,{first:'สมใจ',last:'ใจดี',nationalId:'123',day:'31',month:'2',year:'2025',weight:'0',height:'160',errors:{nationalId:'ตรวจสอบเลขบัตรประชาชน 13 หลัก',day:'วันที่นี้ไม่มีในปฏิทิน',weight:'กรอกน้ำหนักมากกว่า 0'}});
if(state==='registration-back')d.step=1;if(state.startsWith('address'))d.step=1;if(state==='address-search')d.addressQuery='10170';if(state==='address-no-results')d.dist='ตำบลตัวอย่างที่ไม่มี';if(state.startsWith('health'))d.step=2;if(state==='health-empty')d.health.meds.mode='set';if(state==='health-none')for(const h of Object.values(d.health))h.mode='none';if(state==='health-no-results')Object.assign(d.health.meds,{mode:'set',other:true,otherText:''});if(state==='health-documents'||state==='health-doc-limit'){d.documents=[{name:'บัตรแพ้ยา-ตัวอย่าง.png',type:'image/png',size:248832,url:'/assets/preview/allergy-document.svg'},{name:'เอกสารประกอบ-ตัวอย่าง.pdf',type:'application/pdf',size:524288}];if(state==='health-doc-limit')for(let n=3;n<=5;n++)d.documents.push({name:`เอกสารตัวอย่าง-${n}.pdf`,type:'application/pdf',size:n*102400});}if(state==='health-doc-error')d.docError='ไฟล์นี้ไม่รองรับ กรุณาเลือก JPG, PNG, WEBP หรือ PDF ไม่เกิน 5 MB';if(state==='health-all-other')for(const [key,h]of Object.entries(d.health))Object.assign(h,{mode:'set',items:[REG_LISTS[key][0]],other:true,otherText:'ข้อมูลเพิ่มเติมที่ผู้ใช้ระบุ'});if(state==='health-filled'){d.health.conditions={mode:'set',items:['ความดันโลหิตสูง']};d.health.food={mode:'set',items:['ไข่']};}if(['review','consent-partial','consent-ready','save-error'].includes(state))d.step=3;if(state==='consent-partial')d.consents={weight:true,height:true};if(['consent-ready','save-error'].includes(state)){d.consents=Object.fromEntries(REG_TOPICS.map(([k])=>[k,true]));d.healthConsentVersion=REG_HEALTH_POLICY.version;}if(state==='save-error')d.submitError='บันทึกข้อมูลไม่สำเร็จ ข้อมูลที่กรอกยังอยู่ ลองอีกครั้งได้';if(state.startsWith('conditions-')){d.step=2;d.health.conditions={mode:'set',items:['ความดันโลหิตสูง','โรคเบาหวาน']};if(state.includes('other'))Object.assign(d.health.conditions,{other:true,otherText:state==='conditions-other'?'โรคหอบหืด':''});if(state==='conditions-other-empty')d.errors.conditions='กรอกโรคประจำตัวอื่น ๆ';if(state==='conditions-no-results')Object.assign(d.health.conditions,{other:true,otherText:''});}if(state==='review-documents'){regPreview(S,'health-documents');d.step=3;}if(state.startsWith('dob-')){regPreview(S,'filled');d.step=0;}}
TP.screen('registrationsuccess',{group:'start',title:'สมัครสมาชิกสำเร็จ',code:'C108',cls:'auth-cover-screen registration-welcome-screen',sb:'dark',states:[['normal','สมัครสำเร็จด้วยเบอร์โทร'],['email','สมัครสำเร็จด้วยอีเมล'],['unavailable','ยังสมัครไม่เสร็จ'],['long-name','ชื่อจริงยาว'],['no-name','ไม่มีชื่อแสดง'],['full-cover','ปกเต็มจอและปุ่มใต้คำต้อนรับ']],notes:['หน้าต้อนรับหลังบันทึกข้อมูล แสดงชื่อจริงและปุ่มเริ่มใช้งาน','ระบบยืนยันและบันทึกยังเป็นต้นแบบ ไม่ได้ส่งข้อมูลจริง'],prep(S){S._registrationComplete=S.st.registrationsuccess!=='unavailable';Object.assign(S.user,{name:'สมใจ',full:'สมใจ ใจดี',email:S.st.registrationsuccess==='email'?'somjai@example.com':'',phone:S.st.registrationsuccess==='email'?'':'0812345678'});if(S.st.registrationsuccess==='long-name')S.user.name='กาญจนาภัทรวรรณ';if(S.st.registrationsuccess==='no-name')S.user.name='';},render(ctx){const S=ctx.S;if(!S._registrationComplete)return ui.nav({title:'สมัครสมาชิก'})+ui.page(ui.empty({title:'ยังสมัครสมาชิกไม่เสร็จ',body:'กลับไปตรวจสอบข้อมูลและความยินยอม',icon:'clipboard-list',btn:{label:'กลับไปสมัคร',go:'profile'}}));return `<div class="auth-cover registration-welcome" aria-label="สมัครสมาชิกสำเร็จ"><img class="auth-cover-photo reg-welcome-cover" src="/assets/auth/registration-welcome-full-v3.png" alt="" width="864" height="1824" fetchpriority="high"><div class="auth-cover-content reg-welcome-copy"><div class="reg-welcome-message"><p class="reg-welcome-status">สมัครสมาชิกเรียบร้อยแล้ว</p><h1>ยินดีต้อนรับ${S.user.name?`<br><span>คุณ${esc(S.user.name)}</span>`:''}</h1><p class="auth-cover-subtitle">พร้อมให้เภสัชกรดูแลคุณแล้ว</p><div class="auth-cover-actions">${ui.btn('เริ่มใช้งาน',{go:'home',root:true,iconRight:'arrow-right'})}</div></div></div></div>`;}});

TP.screen('profile', {
  group: 'start', title: 'ข้อมูลของคุณและความยินยอม', code: 'C105', ref: 'C02', cls: 'st-cn',
  states: [['empty', 'เบอร์ใหม่: ยังไม่กรอก'], ['filled', 'เบอร์ใหม่: กรอกแล้ว'], ['error', 'ปีเกิดไม่ถูกต้อง'], ['acct', 'มีบัญชีเว็บ: ความยินยอมฉบับใหม่'], ['email', 'สมัครใหม่ด้วยอีเมลที่ยืนยันแล้ว'],['address','ขั้นที่อยู่ พร้อมค้นหาอัตโนมัติ'],['address-no-results','ค้นหาที่อยู่ไม่พบ กรอกเองได้'],['address-error','ตัวช่วยที่อยู่โหลดไม่สำเร็จ'],['health','ขั้นข้อมูลสุขภาพ ยังไม่ทราบ'],['health-empty','ระบุข้อมูลสุขภาพ แต่ยังไม่มีรายการ'],['health-filled','ข้อมูลสุขภาพหลายรายการ'],['review','ตรวจทานและความยินยอม ยังไม่ติ๊ก'],['consent-partial','ความยินยอมเก่าไม่แทนการเลือกฉบับใหม่'],['consent-ready','เลือกยินยอมแล้ว พร้อมสมัคร'],['save-error','บันทึกไม่สำเร็จ ข้อมูลยังอยู่'],['health-none','ไม่มีประวัติสุขภาพ โดยผู้ใช้เลือกเอง'],['health-no-results','ยาไม่อยู่ในลิสต์ ใช้อื่น ๆ'],['health-documents','แนบเอกสารแพ้ยาแล้ว'],['health-doc-error','ไฟล์แนบไม่ผ่านเงื่อนไข'],['quick-fill','ปุ่มมอคข้อมูลใต้ป้ายชื่อหน้า'],['address-search','ค้นหาที่อยู่และเติมอัตโนมัติ'],['conditions-multi','เลือกโรคได้หลายข้อ'],['conditions-other','ระบุโรคอื่น ๆ'],['conditions-other-empty','เลือกอื่น ๆ แต่ยังไม่กรอก'],['conditions-no-results','โรคที่ไม่มีในลิสต์ ใช้อื่น ๆ'],['registration-back','ย้อนกลับเพื่อแก้ไขข้อมูล'],['health-all-other','เลือกหลายข้อและอื่น ๆ ทุกกลุ่มสุขภาพ'],['health-doc-limit','แนบเอกสารครบ 5 ไฟล์'],['review-documents','ตรวจทานไฟล์แนบ รูปย่อและชื่อไฟล์'],["dob-years", "วันเกิด: ล้อหมุน"], ["dob-months", "วันเกิด: เลือกเดือน"], ["dob-days", "วันเกิด: เลือกวัน"], ["dob-selected", "วันเกิด: ค่าเดิม"], ["dob-leap", "วันเกิด: ปีอธิกสุรทิน"], ["dob-future", "วันเกิด: จำกัดถึงวันนี้"], ["dob-oldest", "วันเกิด: ปี 1900"],['marketing-opt-in','ยินยอมรับข่าวสาร'],['marketing-opt-out','ไม่รับข่าวสาร สมัครได้']],
  notes:['สมัครใหม่: ข้อมูลส่วนตัว → ที่อยู่ตามบัตร → สุขภาพ → ตรวจทานและยินยอม → C108 สมัครสำเร็จ ไม่มีหน้าไม่ยินยอม','อีเมล/เบอร์ที่ผ่าน OTP แล้วแสดงสถานะยืนยัน ไม่ถามซ้ำ ไม่มีรหัสผ่าน','อ้างอิงช่องฟอร์มจากภาพเว็บที่ผู้ใช้ส่ง 1 พ.ย. 2026; ตัวเลือกยาเป็นรายการตัวอย่าง กรอกเองได้','ไม่ตั้งค่าไม่มีโรคหรือไม่แพ้ยาให้เอง; ผู้ใช้เลือกยังไม่ทราบได้','ที่อยู่ตามบัตรไม่ถูกนำไปบันทึกเป็นที่อยู่จัดส่งโดยอัตโนมัติ','ความยินยอม1ช่องสำหรับบริการเภสัชกรรม ไม่ติ๊กล่วงหน้า เปิดC115อ่านอย่างเดียว ไม่รวมการตลาด; การบันทึกยังเป็นต้นแบบ','มีบัญชีเดิม/แก้ไขข้อมูลใช้เส้นทางเดิม คงข้อมูลและความยินยอม'],
  prep(S) {
    const st = S.st.profile;
    S._registration=null;S._registrationComplete=false;
    if(st==='email')authNewAccount(S,'email','new@example.com');
    S._pf = st === 'filled' ? { first: 'สมศรี', last: 'มีสุข', year: '1968', sex: 'f' } : st === 'error' ? { first: 'สมศรี', last: 'มีสุข', year: '2511', sex: 'none' } : { first: '', last: '', year: '', sex: 'none' };
    Object.assign(S, { firstTime: true, newAccount: st !== 'acct', loggedIn: true, consent: false, consentVer: st === 'acct' ? 2 : CN_VER });
    if(st!=='acct')regPreview(S,st);
    if(st==='quick-fill')regMockInputs(regDraft(S));
  },
  render(ctx) {
    const S = ctx.S, d = S._pf || (S._pf = { first: '', last: '', year: '', sex: 'none' }), err = ctx.state === 'error', m = pfMode(ctx);
    if(m==='new')return regRender(ctx);
    const ph = ctx.params.email || (ctx.state==='email'?S.user.email:'') || maskPhone(ctx.params.phone || ctx.params.acct || digits(S.user.phone));
    const form = m === 'acct' ? pfAcctOk(S, ph) : `
      <p class="st-pf-ok" data-in="1">${ui.tag(m === 'edit' ? 'เบอร์ในบัญชี' : ctx.params.email||ctx.state==='email' ? 'ยืนยันอีเมลแล้ว' : 'ยืนยันเบอร์แล้ว', 'ok', { dot: true })}<span class="num">${esc(ph)}</span></p>
      <div class="st-pf-name" data-in="2">${pfField('first', { label: 'ชื่อ', ph: 'ชื่อจริง', ac: 'given-name', max: 50 }, d)}${pfField('last', { label: 'นามสกุล', ph: 'นามสกุล', ac: 'family-name', max: 50 }, d)}</div>
      <div class="mt16" data-in="3">${pfField('year', { label: 'ปีเกิด (ค.ศ.)', ph: 'เช่น 1988', ac: 'bday-year', im: 'numeric', max: 4, hint: ageText(d.year) }, d, err)}</div>
      <div class="field mt16" data-in="4"><span class="f-l" id="pf-sex-l">เพศ <span class="opt-t">(ไม่บังคับ)</span></span>
        <div class="chips st-sex" role="radiogroup" aria-labelledby="pf-sex-l" data-radio-scope>${SEXES.map(([v, l]) => `<button type="button" class="chip" role="radio" data-radio="sex" data-v="${v}" aria-checked="${d.sex === v}"><svg class="ck-i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>${l}</button>`).join('')}</div></div>`;
    const address = m === 'new' ? `<section class="ds-form-section" aria-labelledby="pfAddressTitle"><h3 class="group-h" id="pfAddressTitle">ที่อยู่ของคุณ</h3><p class="hint">บันทึกไว้สำหรับจัดส่งยา แก้ไขได้ภายหลัง</p><div class="mt16">${pfField('house',{label:'บ้านเลขที่ / ซอย / ถนน',ph:'เช่น 88/12 ซอยทวีวัฒนา 25',ac:'street-address',max:150},d)}</div><div class="ds-form-grid">${[['dist','ตำบล / แขวง','address-level3',60],['amp','อำเภอ / เขต','address-level2',60],['prov','จังหวัด','address-level1',60],['zip','รหัสไปรษณีย์','postal-code',5]].map(([k,label,ac,max]) => pfField(k,{label,ph:label,ac,max,im:k === 'zip' ? 'numeric' : ''},d)).join('')}</div></section>` : '';
    const tail = m === 'edit' ? `<p class="st-pf-fine" data-in="5">${ic('lock', 14, 2)}<span>ใช้ในบัญชีและการปรึกษาของคุณเท่านั้น</span></p>` : pfConsent(m === 'acct');
    const head = m === 'edit' ? { lt: 'ข้อมูลส่วนตัว', sub: 'เปลี่ยนเบอร์โทรได้ที่ฝ่ายบริการลูกค้า' }
      : m === 'acct' ? { lt: 'ยินดีต้อนรับ', sub: 'ใช้บัญชีเดียวกับเว็บไซต์ MITRAREE · ให้ความยินยอมฉบับปัจจุบันก่อนเข้าสู่หน้าหลัก' }
      : { lt: 'ข้อมูลของคุณ', sub: `เภสัชกรต้องรู้ชื่อและอายุเพื่อแนะนำและคำนวณขนาดยาให้ปลอดภัย · บันทึกการปรึกษาเก็บ 1 ปีนับจากวันปิดเคส ${nw('ตามกฎ อย.')}` };
    const dock = m === 'edit' ? ui.btn('บันทึก', { id: 'pfGo' })
      : `<div class="btn-row st-cn-row">${ui.btn('ยังไม่ยินยอม', { kind: 'secondary', id: 'pfNo' })}<button type="button" class="btn primary st-cn-go" id="pfGo" aria-disabled="true"><span>ยินยอมและเข้าสู่หน้าหลัก</span></button></div>`;
    return ui.nav(m === 'edit' ? { back: true, title: 'ข้อมูลส่วนตัว' } : { title: m === 'acct' ? 'ความยินยอม' : 'ข้อมูลของคุณ' }) + ui.page((m === 'acct' ? form : `<section class="ds-form-section" aria-labelledby="pfDetailsTitle"><h3 class="group-h" id="pfDetailsTitle">ข้อมูลส่วนตัว</h3>${form}</section>`) + address + tail, head) + ui.dock(dock);
  },
  mount(el, ctx) {
    const S = ctx.S, d = S._pf, m = pfMode(ctx), go = $('#pfGo', el), no = $('#pfNo', el), cn = $('#pfCn', el), cnE = $('#pfCnE', el);
    if(m==='new')return regMount(el,ctx);
    const ph = ctx.params.email || (ctx.state==='email'?S.user.email:'') || maskPhone(ctx.params.phone || ctx.params.acct || digits(S.user.phone));
    const ok = () => m === 'acct' || (m === 'new' ? Object.keys(PF_CHECK) : ['first','last','year']).every(k => !PF_CHECK[k](d[k]));
    const ticked = () => cn?.getAttribute('aria-checked') === 'true';
    const show = (k, on) => {
      const f = $(`.st-pf-f[data-k="${k}"]`, el), e = on ? PF_CHECK[k](d[k]) : '', inp = $('input', f);
      f.classList.toggle('err', !!e); inp.setAttribute('aria-invalid', String(!!e));
      $('.hint', f).hidden = !!e; $('.err-t', f).hidden = !e;
      if (e) {
        $('.err-t span', f).textContent = e;
        $('.st-fix', f)?.remove();
        const y = +d.year;
        if (k === 'year' && /^\d{4}$/.test(d.year) && y >= 2443 && y <= NOW_Y + 543) $('.err-t', f).insertAdjacentHTML('beforeend', `<button type="button" class="link st-inl st-fix" data-fix="${y - 543}">ใช้ ${y - 543}</button>`);
      }
      return !!e;
    };
    const sync = () => {
      go.disabled = !ok() || !!(cn && !ticked());
      if (cn) { go.setAttribute('aria-disabled', String(!ticked())); if (ticked()) { cnE.hidden = true; cn.classList.remove('st-nudge'); } }
    };
    el._pfSync = sync;
    $$('.st-pf-f', el).forEach(f => {
      const k = f.dataset.k, inp = $('input', f);
      inp.addEventListener('input', () => {
        if (k === 'year') { const v = digits(inp.value).slice(0, 4); if (inp.value !== v) inp.value = v; }
        d[k] = inp.value; f.dataset.touched = '1';
        if (k === 'year') { $('.hint', f).innerHTML = ageText(d.year); if (/^\d{4}$/.test(d.year) && +d.year > NOW_Y) show(k, true); }
        if (f.classList.contains('err')) show(k, true);
        sync();
      });
      inp.addEventListener('blur', () => { if (d[k] || f.dataset.touched) show(k, true); f.dataset.touched = '1'; });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const n = $$('.st-pf-f input', el)[$$('.st-pf-f input', el).indexOf(inp) + 1]; if (n) n.focus(); else inp.blur(); } });
      /* tapping the fix must not blur the field first: the blur redraws the error line and the button under the finger */
      f.addEventListener('pointerdown', e => { if (e.target.closest('.st-fix')) e.preventDefault(); });
      f.addEventListener('mousedown', e => { if (e.target.closest('.st-fix')) e.preventDefault(); });
      f.addEventListener('click', e => {
        const b = e.target.closest('.st-fix'); if (!b) return;
        inp.value = d.year = b.dataset.fix; show('year', true); $('.hint', f).innerHTML = ageText(d.year); sync(); inp.focus();
        TP.live('เปลี่ยนเป็น ค.ศ. ' + d.year + ' แล้ว');
      });
    });
    $('.st-sex', el)?.addEventListener('click', e => { const c = e.target.closest('[data-v]'); if (c) d.sex = c.dataset.v; });
    /* web account: confirm it is theirs first */
    const card = $('#pfAcct', el);
    card?.addEventListener('click', async e => {
      const b = e.target.closest('[data-x]'); if (!b) return;
      if (b.dataset.x === 'yes') {
        ctx.params.acctOk = 1; TP.live('ยืนยันบัญชีแล้ว');
        await TP.fin(A(card, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px) scale(.98)' }], { d: 220, e: E.apple, fill: 'forwards' }));
        card.insertAdjacentHTML('afterend', pfAcctOk(S, ph)); const n = card.nextElementSibling; card.remove(); rise(n, 0, 6);
        return;
      }
      if (b.dataset.x === 'no') {
        go.disabled = true; no.disabled = true;
        [$('#pfCnBox', el), $('.st-pf-cnh', el)].forEach(n => { if (n) n.style.display = 'none'; });
        card.classList.add('no');
        card.innerHTML = `<p class="st-acct-t">${ic('headset', 20, 1.9)}<span>ติดต่อฝ่ายบริการลูกค้า <b class="num st-nw">${esc(TP.STORE?.cs || '')}</b> <span class="st-nw">(${esc(TP.STORE?.csHours || '')})</span> เพื่อตรวจสอบบัญชีที่ผูกกับเบอร์นี้ ระหว่างนี้ยังไม่ต้องใช้งานต่อ</span></p>
          <div class="st-acct-b"><button type="button" class="btn tint sm" data-x="call">${ic('phone', 18, 2)}<span>โทรหาฝ่ายบริการลูกค้า</span></button><button type="button" class="btn ghost sm" data-x="out">ออกจากระบบ</button></div>`;
        rise(card, 0, 6); $('[data-x="call"]', card).focus();
        return;
      }
      if (b.dataset.x === 'call') TP.notify('กำลังโทร ' + (TP.STORE?.cs || ''), { icon: 'phone' });
      if (b.dataset.x === 'out') { S.loggedIn = false; TP.emit('state'); TP.go('login', { via: 'fade', root: true }); }
    });
    sync();
    const fieldsBad = () => m !== 'acct' && (m === 'new' ? Object.keys(PF_CHECK) : ['first','last','year']).map(k => show(k, true)).some(Boolean);
    const save = () => {
      if (m === 'acct') return;
      const first = d.first.trim(), last = d.last.trim(), y = +d.year, p = ctx.params.phone;
      if (m === 'new') freshAccount(S);
      Object.assign(S.user, { name: first, last, full: `${first} ${last}`, birthYear: y, born: String(y), age: NOW_Y - y, sex: d.sex });
      if (m === 'new') S.addrs = [{ id: 'a1', first, last, phone: p || digits(S.user.phone), house: d.house.trim(), alley: '', road: '', dist: d.dist.trim(), amp: d.amp.trim(), prov: d.prov.trim(), zip: d.zip, main: true, pin: false }];
      if (m === 'new' && p && p.length === 10) S.user.phone = `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`;
    };
    go.addEventListener('click', async () => {
      if (go.disabled || go.classList.contains('busy')) return;
      if (fieldsBad()) return;
      if (cn && !ticked()) {
        shake(cn); cn.classList.remove('st-nudge'); cn.getBoundingClientRect(); cn.classList.add('st-nudge');
        cnE.hidden = false; TP.live(cnE.textContent); rise(cnE, 0, 4);
        cn.scrollIntoView({ block: 'center', behavior: TP.RED() ? 'auto' : 'smooth' }); cn.focus({ preventScroll: true });
        return;
      }
      go.classList.add('busy'); go.setAttribute('aria-busy', 'true'); if (no) no.disabled = true;
      await sleep(ctx, 650);
      save();
      if (m === 'edit') { TP.emit('state'); TP.back(); TP.notify('บันทึกข้อมูลส่วนตัวแล้ว', { icon: 'circle-check' }); return; }
      TP.saveHealthConsent(S,TP.healthConsentVersion(),'profile-checkbox');
      Object.assign(S, { firstTime: false, newAccount: false, _appNew: true });
      TP.emit('state');
      await TP.go('home', { via: 'none', root: true });
      /* store closed or consult switched off: home offers the night question or the alternatives (real-user R2) */
      const shut = S.storeOpen === false || S.sysOff;
      // Stay on home after registration or updated consent.
      TP.notify(shut ? 'บันทึกแล้ว · ตอนนี้นอกเวลาทำการ ฝากคำถามได้' : m === 'acct' ? 'บันทึกความยินยอมแล้ว' : 'บันทึกข้อมูลและความยินยอมแล้ว', { icon: 'circle-check' });
    });
    /* "ยังไม่ยินยอม" always works, even with an empty form: a worried user is not asked for a name first (real-user R2) */
    no?.addEventListener('click', () => {
      if (go.classList.contains('busy')) return;
      if (m !== 'acct' && ok()) save();
      else if (m === 'new') { freshAccount(S); blankUser(S, ctx.params.phone); }
      Object.assign(S, { consent: false, firstTime: false, newAccount: false, _appNew: true }); TP.emit('state');
      TP.go('noconsent', { via: 'push' });
    });
    if (ctx.state === 'empty' && m === 'new') ctx.later(() => $('#pf-first', el)?.focus({ preventScroll: true }), 650);
  }
});

/* =====================================================================
   Face ID / fingerprint (ใหม่): optional, A3
   ===================================================================== */
const FACE = `<svg class="st-face" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <g class="cr"><path d="M5 19v-6a8 8 0 0 1 8-8h6"/><path d="M45 5h6a8 8 0 0 1 8 8v6"/><path d="M59 45v6a8 8 0 0 1-8 8h-6"/><path d="M19 59h-6a8 8 0 0 1-8-8v-6"/></g>
  <g class="ft"><path d="M22 23v5M42 23v5"/><path d="M32 23v13h-3"/><path d="M23 43c5 4 13 4 18 0"/></g>
  <path class="ok" d="M20 33l8 8 16-17" pathLength="40"/></svg>`;
const FP = () => `<svg class="st-face st-fp" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><g class="ft">${TP.PATH.fingerprint}</g><path class="ok" d="M6.5 12.5l3.5 3.5 7.5-7.5" stroke-width="2.2" pathLength="40"/></svg>`;
TP.screen('faceid', {
  group: 'start', title: 'Face ID / ลายนิ้วมือ', code: 'C110',
  states: [['ios', 'iPhone (Face ID)'], ['android', 'Android (ลายนิ้วมือ)']],
  notes: [
    'A3: เลือกเปิดได้ ไม่บังคับ · ปุ่ม "ไว้ทีหลัง" เห็นชัดเท่ากัน ไม่ซ่อน',
    'ใช้ล็อกแอปในเครื่องนี้ กันคนอื่นเปิดดูข้อมูล · ไม่เปิดก็ไม่ต้องใส่ OTP ทุกครั้ง แอปจำการเข้าระบบไว้ ใช้ OTP เฉพาะตอนหลุดจากระบบ (ไม่ได้เปิดแอป 30 วัน) หรือเปลี่ยนเครื่อง',
    'ข้อมูลใบหน้าและลายนิ้วมืออยู่ในเครื่อง แอปได้แค่ผลว่าผ่านหรือไม่ผ่าน',
    'ถามหลังปรึกษาครั้งแรกเสร็จ (เจ้าของเลือก 19/10/2026): การ์ด "เปิดแอปด้วย Face ID" บนหน้าแรก แตะแล้วมาจอนี้ · ตอบแล้วไม่ถามซ้ำ · ปิด/เปิดภายหลังได้ที่หน้าบัญชี',
    'ยืนยันบัญชีเว็บย้ายไปอยู่จอข้อมูลของคุณ (สถานะ "มีบัญชีเว็บ") ไม่อยู่บนจอนี้แล้ว'
  ],
  wait: ['ใช้ Face ID ยืนยันก่อนชำระเงินด้วยไหม'],
  prep(S) { S.faceId = false; },
  render(ctx) {
    const S = ctx.S, and = ctx.state === 'android', what = and ? 'ลายนิ้วมือ' : 'ใบหน้า', name = and ? 'ลายนิ้วมือ' : ' Face ID';
    return ui.page(`<div class="st-fid">
        <div class="st-fid-art" data-in="0">${brand.halo(196, { draw: true })}<span class="st-fid-g">${and ? FP() : FACE}</span></div>
        <h2 class="st-h1 c" data-in="1">เปิดแอปด้วย${name}</h2>
        <p class="st-sub c" data-in="2">คนอื่นที่ใช้เครื่องนี้เปิดดูประวัติการปรึกษาของคุณไม่ได้</p>
        <p class="st-fid-no" data-in="2">${ic('info', 15, 2)}<span>ไม่เปิดก็ได้ แอปจำการเข้าระบบไว้ ใช้รหัสทาง SMS เฉพาะตอนหลุดจากระบบ (ไม่ได้เปิดแอป 30 วัน)</span></p>
      </div>
      ${ui.group([
        ui.row({ icon: 'lock', title: `ข้อมูล${what}อยู่ในเครื่องของคุณ`, sub: 'แอปได้รับแค่ผลว่าผ่านหรือไม่ผ่าน ไม่ได้เก็บไว้' }),
        ui.row({ icon: 'smartphone', title: 'ใช้ได้เฉพาะเครื่องนี้', sub: 'เข้าจากเครื่องใหม่ยังต้องใช้รหัส OTP' }),
        ui.row({ icon: 'sliders', title: 'ปิดได้ทุกเมื่อ', sub: 'ที่หน้าบัญชี' })
      ], { din: 3 })}`, { nonav: true }) +
      ui.dock(ui.btn(`เปิดใช้${name}`, { id: 'fidGo', icon: and ? 'fingerprint' : 'scan-face' }) + ui.btn('ไว้ทีหลัง', { kind: 'ghost', id: 'fidLater' }));
  },
  mount(el, ctx) {
    const and = ctx.state === 'android', go = $('#fidGo', el), later = $('#fidLater', el);
    later.addEventListener('click', () => { if (go.classList.contains('busy')) return; afterBio(); TP.notify('เปิดได้ภายหลังที่หน้าบัญชี', { icon: 'info' }); });
    go.addEventListener('click', async () => {
      if (go.classList.contains('busy')) return;
      go.classList.add('busy'); go.setAttribute('aria-busy', 'true'); later.disabled = true;
      const hud = document.createElement('div');
      hud.className = 'st-hud'; hud.setAttribute('role', 'status');
      hud.innerHTML = `<div class="st-hud-b"><span class="st-hud-g">${and ? FP() : FACE}<i class="st-scan" aria-hidden="true"></i></span><b>${and ? 'แตะเซ็นเซอร์ลายนิ้วมือ' : 'Face ID'}</b></div>`;
      el.appendChild(hud);
      A(hud, [{ opacity: 0 }, { opacity: 1 }], { d: 220, e: E.apple });
      A(hud.firstElementChild, [{ opacity: 0, transform: 'scale(.86)' }, { opacity: 1, transform: 'none' }], { d: SP.spring.d, e: SP.spring.e });
      hud.classList.add('scan');
      await sleep(ctx, 1400);
      hud.classList.remove('scan'); hud.classList.add('done');
      $('b', hud).textContent = and ? 'ยืนยันแล้ว' : 'Face ID';
      TP.live('ยืนยันตัวตนแล้ว');
      await sleep(ctx, 750);
      await TP.fin(A(hud, [{ opacity: 1 }, { opacity: 0 }], { d: 240, e: E.apple, fill: 'forwards' }));
      TP.S.faceId = true; TP.emit('state');
      afterBio();
      TP.notify(and ? 'เปิดใช้ลายนิ้วมือแล้ว' : 'เปิดใช้ Face ID แล้ว', { icon: and ? 'fingerprint' : 'scan-face' });
    });
  }
});

/* =====================================================================
   Consent (C06 · A6 + C1): summary on top, full text, required + optional
   ===================================================================== */
const CN_VER = 4;
const CN_SUM = [
 ['clipboard-list','ข้อมูลที่ใช้','ข้อมูลสุขภาพที่จำเป็นต่อการประเมินอาการและความเหมาะสมของยา'],
 ['stethoscope','วัตถุประสงค์','บริการเภสัชกรรมและติดตามความปลอดภัยที่เกี่ยวข้อง'],
 ['clock','ระยะเวลาเก็บ','ตามระยะเวลาหรือเกณฑ์ที่บริษัทต้องแจ้งในประกาศความเป็นส่วนตัว'],
 ['shield-check','สิทธิของคุณ','อ่านรายละเอียด ถอนความยินยอม หรือขอใช้สิทธิผ่านเมนูบัญชี']
];
TP.consentDoc=()=>TP.registrationConsentDocument();
/* =====================================================================
   No consent (C06): owner 19/10/2026 consent is required to use the app at all
   ===================================================================== */
TP.screen('noconsent', {
  group: 'account', title: 'ไม่ยินยอม', code: 'C516', ref: 'C06', parent: 'consents',
  states: [['decline', 'ยังไม่ยินยอมข้อมูลสุขภาพ'], ['withdrawn', 'ถอนความยินยอมแล้ว']],
  notes: [
    'เจ้าของ 19/10/2026: "ต้องยินยอมเท่านั้น ไม่งั้นไม่มีอะไรให้ใช้งานเลย" · ไม่ยินยอม = ใช้แอปไม่ได้ ไม่มีทางไปหน้าแรก',
    'ทางออก: กลับไปจัดการความยินยอม C506 หรือออกจากระบบ อ่านรายละเอียดและติดต่อสาขาได้จากท้ายเอกสาร C507',
    'ถอนความยินยอมจากหน้าบัญชี (C508) มาที่จอนี้ทันที · เข้าสู่ระบบหรือเปิดแอปครั้งถัดไปโดยยังไม่ยินยอม = ขึ้นจอยินยอมก่อนเสมอ',
    'ข้อมูลติดต่อและเวลาเปิดสาขาอยู่ท้ายเอกสารอ่านเพิ่มเติม ไม่แสดงซ้ำบนหน้านี้'
  ],
  render(ctx) {
    const wd = ctx.state === 'withdrawn' || !!ctx.params?.wd;
    return ui.nav({ back: !wd && TP.canBack() }) + ui.page(`
      <div class="st-cen" data-in="0"><div class="st-nc-art">${brand.halo(104, { still: true, icon: 'lock' })}</div>
        <h2 class="st-h1 c">${wd ? 'ถอนความยินยอมแล้ว' : 'ต้องยินยอมก่อนจึงใช้แอปได้'}</h2>
        <p class="st-sub c">แอปนี้ใช้ข้อมูลสุขภาพเพื่อให้เภสัชกรดูแลคุณ จึงใช้งานได้เมื่อคุณยินยอมเท่านั้น</p></div>
      <button type="button" class="reg-consent-link" data-sheet="consenttext" aria-haspopup="dialog">อ่านรายละเอียดความยินยอมและติดต่อสาขา</button>`) +
      ui.dock(ui.btn(wd ? 'ยินยอมอีกครั้ง' : 'กลับไปยินยอม', { a: 'stNcReread', icon: 'shield-check' }) + ui.btn('ออกจากระบบ', { kind: 'ghost', a: 'stNcOut' }));
  }
});
TP.act('stNcReread', () => TP.go('consents', { via:'push',replace:true,params:{then:TP.cur()?.ctx?.params?.then||''} }));
TP.act('stNcOut', () => { TP.S.loggedIn = false; TP.emit('state'); TP.go('login', { via: 'fade', root: true }); });

/* =====================================================================
   Forced update (ใหม่): minimum version gate, cannot be dismissed
   ===================================================================== */
TP.screen('update', {
  group: 'edge', title: 'บังคับอัปเดตแอป', code: 'C601',
  states: [['ios', 'iPhone'], ['android', 'Android']],
  notes: [
    'ด่านรุ่นขั้นต่ำ: แอปรุ่นเก่าเรียกคืนไม่ได้ ระบบจึงต้องบังคับอัปเดตได้ · ไม่มีปุ่มปิดหรือย้อนกลับ',
    'แก้ส่วนปรึกษาเภสัชกร (telepharmacy) ต้องแจ้ง อย. ล่วงหน้า 30 วัน · ด่านนี้ใช้คุมให้ทุกเครื่องใช้รุ่นที่แจ้งไว้แล้ว',
    'บอกว่าข้อมูลอยู่ครบ เคสที่เปิดอยู่กลับเข้าได้หลังอัปเดต ลดความกังวล'
  ],
  wait: ['มีแบบแนะนำให้อัปเดต (ปิดได้) สำหรับรุ่นที่ยังไม่บังคับด้วยไหม'],
  render(ctx) {
    const and = ctx.state === 'android';
    return ui.page(`<div class="st-vc"><div class="st-cen">
        <div class="st-upd-art" data-in="0">${brand.halo(176, { draw: true })}${brand.appicon('lg st-upd-ic')}</div>
        <h2 class="st-h1 c" data-in="1">อัปเดตแอปก่อนใช้งานต่อ</h2>
        <p class="st-sub c" data-in="2">รุ่นที่ติดตั้งอยู่เก่ากว่ารุ่นที่ใช้ปรึกษาเภสัชกรได้อย่างปลอดภัย อัปเดตใช้เวลาไม่ถึง 1 นาที</p></div>
      ${ui.card(ui.kv([['รุ่นในเครื่อง', '1.0.3'], ['รุ่นที่ต้องใช้', '1.1.0 ขึ้นไป'], ['ประวัติและใบสรุป', 'อยู่ครบ'], ['เคสที่เปิดอยู่', 'กลับเข้าได้หลังอัปเดต']]), { din: 3, cls: 'st-kvc' })}<div class="mt16">${ui.callHelp({ title: 'อัปเดตไม่ได้ ติดต่อเรา', din: 4 })}</div></div>`, { nonav: true }) +
      ui.dock(ui.btn('อัปเดตแอป', { icon: 'download', a: 'stUpd', id: 'updGo' }) + `<p class="dock-note">เปิด${and ? ' Google Play' : ' App Store'}</p>`, { clear: true });
  }
});
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
TP.screen('sysoff', {
  group: 'edge', title: 'ปิดรับปรึกษาชั่วคราว', code: 'C602', ref: 'C17',
  states: [['off', 'ไม่มีเคสค้าง'], ['case', 'มีเคสค้างตอนปิด']],
  notes: [
    'C17 / E16: สวิตช์ปิดรับปรึกษาจากหลังบ้านต้องถึงแอปด้วย',
    'ปิดเฉพาะการปรึกษา ส่วนอื่นของแอปยังใช้ได้ · บอกทางโทรหาร้านแทน',
    'ปุ่ม "ลองใหม่" ตรวจสถานะอีกครั้ง ไม่ต้องปิดเปิดแอป'
  ],
  wait: ['เคสที่คุยอยู่ตอนปิดระบบเป็นอย่างไร (ทีมเสนอ: ไม่ยกเลิก กลับเข้าห้องเดิมได้เมื่อระบบเปิด ดูสถานะ "มีเคสค้างตอนปิด")', 'แจ้งเตือนลูกค้าเมื่อเปิดระบบอีกครั้งไหม'],
  render(ctx) {
    const hasCase = ctx.state === 'case';
    return ui.nav({ back: TP.canBack() }) + ui.page(`
      <div class="st-cen" data-in="0"><div class="st-off-art">${brand.halo(120, { still: true })}<span class="st-off-i">${ic('circle-pause', 30, 1.8)}</span></div>
        ${ui.tag('ปิดชั่วคราว', 'muted', { dot: true })}
        <h2 class="st-h1 c mt12">ปิดรับปรึกษาผ่านแอปชั่วคราว</h2>
        <p class="st-sub c">ทีมงานกำลังปรับปรุงระบบ หน้าร้านทั้ง 2 สาขาเปิดตามปกติ ประวัติและใบสรุปยังเปิดดูได้</p></div>
      ${hasCase ? `<div class="st-gap" data-in="1">${ui.note('<b>เคสที่คุยค้างไว้ยังไม่ถูกยกเลิก</b><br>เมื่อระบบเปิด กลับเข้าห้องเดิมได้ทันที ไม่ต้องแจ้งอาการใหม่ · ถ้าเร่งด่วน โทรหาสาขาด้านล่าง', { icon: 'info' })}</div>` : ''}
      ${ui.group([ui.row({ icon: 'message-circle', title: 'ฝากคำถามถึงเภสัชกร', sub: 'เภสัชกรจะตอบในแอปเมื่อระบบกลับมาเปิด', go: 'offline' })], { title: 'ฝากคำถามไว้ก่อน', din: 2 })}
      ${ui.group(callRows(), { title: 'ปรึกษาเภสัชกรที่ร้าน', din: 3 })}
      <p class="st-chk" id="offChk" role="status">ตรวจสถานะล่าสุด ${TP.NOW.time}</p>`) +
      ui.dock(ui.btn('ลองใหม่', { kind: 'secondary', icon: 'refresh-cw', a: 'stOffRetry' }) + `<button type="button" class="btn ghost" data-tab="history">${ic('history', 20, 2)}<span>ดูประวัติการปรึกษา</span></button>`);
  }
});
TP.act('stOffRetry', async t => {
  const el = TP.cur()?.el;
  if (!el || t.classList.contains('busy')) return;
  t.classList.add('busy'); t.setAttribute('aria-busy', 'true');
  await TP.wait(TP.RED() ? 80 : 900);
  if (TP.cur()?.el !== el) return;
  t.classList.remove('busy'); t.removeAttribute('aria-busy');
  if (!TP.S.sysOff) { TP.notify('เปิดรับปรึกษาแล้ว', { icon: 'circle-check' }); TP.go('intake', { via: 'fade', replace: true }); return; }
  const c = $('#offChk', el); if (c) { c.textContent = `ตรวจสถานะล่าสุด ${TP.NOW.time} · ยังปิดอยู่`; rise(c, 0, 6); }
  TP.notify('ยังปิดอยู่ ลองใหม่ภายหลัง', { icon: 'info' });
});
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
  S._paymentCase=null;
  S.case = {
    id: 'TC-'+Date.now().toString(36)+'-'+(TP._caseSerial=(TP._caseSerial||0)+1), who: 'me', symptoms: [...I.symptoms], urgent: [...I.urgent], note: [I.note,I.otherOpen?I.otherText:''].filter(v=>v?.trim()).join('\n'), photos: (I.attachments||[]).length, attachments:[...(I.attachments||[])], mode: I.mode,
    branch: b.id, pharm: b.pharm, status: S.branchState[b.id] === 'pause' ? 'paused' : 'queue',
    pos: Math.max(1, (S.queueLen[b.id] || 0) + 1), joinedAt: TP.NOW.time, order: null, rated: 0, msgs: []
  };
  TP.emit('state');
  return S.case;
};
/* Preview-only fixture controls: never submitted or stored in preferences. */
TP.casePreview = {
  states: [["queue3", "รออีก 3 คิว"], ["queue2", "รออีก 2 คิว"], ["queue1", "รออีก 1 คิว"], ["next", "คิวถัดไป"], ["paused", "เภสัชกรพัก"], ["matched", "รับคิวแล้ว"], ["chat", "สนทนา-จ่ายยา"], ["video-request", "เภสัชกรขอวิดีโอคอล"], ["reply", "รอคำตอบจากคุณ"], ["payment", "รอชำระเงิน"], ["closed-unpaid", "จบแชท · รอชำระค่ายา"], ["payment-soon", "เหลือชำระ 1 นาที"], ["closed-payexpired", "จบแชท · หมดเวลาชำระ"], ["finished", "จบการปรึกษา"], ["cancelled", "ยกเลิกคิว"], ["expired", "หมดเวลารอคำตอบ"]],
  seed(key) {
    if(!this.states.some(([k])=>k===key))return false;
    const S=TP.S,c=TP.newCase();
    Object.assign(c,{status:'queue',pos:1,idle:false,order:null,msgs:[]});
    if(key.startsWith('queue'))c.pos=Number(key.slice(5))+1;
    if(key==='paused')c.status='paused';
    if(['matched','chat','reply','payment'].includes(key))c.status=key==='matched'?'matched':'room';
    if(key==='reply')c.idle={until:Date.now()+120000};
    if(key==='payment'){TP.makeOrder();c.msgs=[{kind:'provider-ready'},{who:'me',kind:'intake'},{kind:'order'}];c.step=99;c.hold=true;}
    if(['finished','cancelled','expired'].includes(key))c.status=key==='finished'?'closed':key;
    if(['closed-unpaid','payment-soon','closed-payexpired'].includes(key)){c.date=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date());c.status='closed';TP.makeOrder();if(TP.ORDER_ITEMS?.length===3){c.order.items=TP.ORDER_ITEMS.map(i=>({...i}));c.order.total=c.order.items.reduce((n,i)=>n+i.price,0);}if(key==='payment-soon')c.order.expiresAt=Date.now()+60000;if(key==='closed-payexpired'){c.order.expiresAt=Date.now()-1;TP.expireOrder(c);}c.msgs=[{kind:'provider-ready'},{who:'me',kind:'intake'},{kind:'order'},{kind:'summary',by:'ph',time:TP.NOW.time}];}
    if(key==='video-request'){S.call=null;c.status='room';c.hold=true;c.step=0;c.msgs=[{kind:'provider-ready'},{who:'me',kind:'intake'},{kind:'video-request',id:'preview-video-request',status:'pending',time:TP.NOW.time}];}
    if(['matched','chat','reply'].includes(key)){c.msgs=[{kind:'provider-ready'},{who:'me',kind:'intake'}];c.step=99;c.hold=true;}
    S._casePreview=key;return true;
  },
  apply(key) {
    if(['queue','room'].includes(TP.cur()?.id)&&TP.S.case&&!['closed','cancelled','expired'].includes(TP.S.case.status)&&['matched','chat','video-request','reply','payment'].includes(key))return this.playChat(key);
    if(!this.seed(key))return;
    TP.S.st.home='';
    if(['matched','chat','video-request','reply','payment'].includes(key)){TP.S.st.room='';TP.go('room');}
    else if(['queue','room'].includes(TP.cur()?.id)&&['finished','cancelled','expired'].includes(key))TP.go('home',{root:true});else TP.refresh({anim:false});TP.emit('state');
  }
};
TP.caseOpen = () => { const c = TP.S.case; return !!(c && (!c.who || c.who==='me') && !['closed', 'cancelled', 'declined', 'expired', 'branchclosed'].includes(c.status)); };
const stateTag = st => st === 'open' ? ui.tag('เปิดรับ', 'ok', { dot: true, live: true }) : st === 'pause' ? ui.tag('พักชั่วคราว', 'warn', { dot: true }) : ui.tag('ปิดรับวันนี้', 'muted', { dot: true });
/* C03: nearest open branch picked for the customer; paused/closed nearest -> next one, with the reason */
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
  const next = !S.loggedIn && TP.SCREENS.login ? 'login' : TP.healthConsentNeeded(S) && TP.SCREENS.consents ? 'consents' : 'home';
  TP.go(next, { via: 'zoom', root: true });
});

/* =====================================================================
   Home (C01)
   ===================================================================== */
/* C210 / C211 / C514 / C515: address-based discovery and saved pharmacies. */
TP.homeAddress = () => (TP.S.addrs || []).find(a => a.id === TP.S.deliveryAddressId) || (TP.S.addrs || []).find(a => a.main) || (TP.S.addrs || [])[0] || null;
TP.addressName = a => a ? String(a.label || '').trim() || (a.main ? 'ที่อยู่หลัก' : 'ที่อยู่จัดส่ง') : 'เพิ่มที่อยู่จัดส่ง';
TP.homeDistance = b => { const a = TP.homeAddress(); return a ? TP.zoneOf(a, b.id)?.km ?? null : null; };
TP.homeStores = () => TP.homeAddress() ? TP.BRANCHES.filter(b => TP.homeDistance(b) != null && TP.homeDistance(b) <= TP.ZONE_KM).sort((a,b) => TP.homeDistance(a) - TP.homeDistance(b)) : [];
/* Selection uses the selected delivery address; unknown queue counts are never treated as zero. */
TP.quickConsultBranch = () => {
  if (!TP.homeAddress()) return {reason:'address'};
  const stores=TP.homeStores();
  if (!stores.length) return {reason:'area'};
  if (TP.S.sysOff || TP.S.storeOpen===false) return {reason:'unavailable'};
  const branch=stores.find(b=>(TP.S.branchState[b.id]||(b.demo?'open':'closed'))==='open' && Number.isFinite(TP.S.queueLen?.[b.id]) && TP.S.queueLen[b.id]===0);
  return branch?{branch}:{reason:'busy'};
};
TP.act('quickConsult',()=>{
  const S=TP.S;
  if (!S.loggedIn) return TP.go('login',{root:true});
  if (TP.caseOpen()) return TP.go(['room','matched'].includes(S.case?.status)?'room':'queue');
  const result=TP.quickConsultBranch();
  if (!result.branch){
    if(result.reason==='address'){TP.notify('เลือกที่อยู่จัดส่งเพื่อหาร้านยาใกล้คุณ',{icon:'map-pin'});return TP.sheet('homeaddress');}
    if(result.reason==='unavailable')return TP.go(S.sysOff?'sysoff':'offline');
    TP.notify(result.reason==='area'?'ยังไม่พบร้านในพื้นที่ที่เลือก':'ขณะนี้ไม่มีร้านที่ว่าง เลือกดูสาขาอื่นได้',{icon:'info'});
    return TP.sheet('allbranches');
  }
  S.branch=result.branch.id;S.branchPicked=true;S.autoReason='';
  return TP.ACTS.hmStart({dataset:{mode:'chat'}});
});
TP.saveHomePreferences = () => {
  if (new URLSearchParams(location.search).has('state') || new URLSearchParams(location.search).get('registry') === '1') return;
  try { localStorage.setItem('mitraree.home.preferences.v1', JSON.stringify({ addrs: TP.S.addrs, deliveryAddressId: TP.S.deliveryAddressId, favoriteBranches: TP.S.favoriteBranches || [] })); } catch (_) { /* The current session remains usable when storage is unavailable. */ }
};
if (!new URLSearchParams(location.search).has('state') && new URLSearchParams(location.search).get('registry') !== '1') {
  try {
    const saved = JSON.parse(localStorage.getItem('mitraree.home.preferences.v1') || 'null');
    if (saved && Array.isArray(saved.addrs) && saved.addrs.every(a => a && typeof a.id === 'string' && typeof a.dist === 'string')) {
      TP.S.addrs = saved.addrs;
      const primary = TP.S.addrs.find(a => a.main) || TP.S.addrs[0];
      TP.S.addrs.forEach(a => a.main = a.id === primary?.id);
      TP.S.deliveryAddressId = null;
      TP.S.favoriteBranches = Array.isArray(saved.favoriteBranches) ? saved.favoriteBranches.filter(id => TP.BRANCHES.some(b => b.id === id)) : [];
    }
  } catch (_) {}
}
TP.homeScenario = (S, st) => {
  const scenarios = ['address-alt', 'noaddress', 'outarea', 'unknownarea'];
  if (scenarios.includes(st)) {
    if (!TP._addressScenarioBase) TP._addressScenarioBase = { addrs: structuredClone(S.addrs), deliveryAddressId: S.deliveryAddressId };
    if (st === 'noaddress') { S.addrs = []; S.deliveryAddressId = null; }
    else {
      S.addrs = TP.fresh().addrs;
      if (st === 'address-alt') S.deliveryAddressId = 'a2';
      else { const a = { ...S.addrs[0], id: 'demo-area', dist: st === 'outarea' ? 'ศรีภูมิ' : 'พื้นที่ตัวอย่าง', amp: 'เมือง', prov: 'เชียงใหม่', main: false }; S.addrs.push(a); S.deliveryAddressId = a.id; }
    }
    S.branchPicked = false;
  } else if (TP._addressScenarioBase) { Object.assign(S, TP._addressScenarioBase); TP._addressScenarioBase = null; S.branchPicked = false; }
};
const homeAddressCards = (S, picker) => (S.addrs || []).map(a => `<article class="hm-address-card${a.id === TP.homeAddress()?.id ? ' selected' : ''}">
  <div class="hm-address-card-head"><b>${esc(TP.addressName(a))}</b>${a.main ? '<span class="tag">ที่อยู่หลัก</span>' : ''}</div>
  <p>${esc(a.first)} ${esc(a.last)} · ${esc(a.phone)}</p><p>${esc(TP.fmtAddr(a))}</p>
  <div class="hm-address-actions">${picker ? `<button type="button" class="btn sm ${a.id === TP.homeAddress()?.id ? 'secondary' : ''}" data-a="hmSelectAddress" data-v="${esc(a.id)}">${a.id === TP.homeAddress()?.id ? 'เลือกอยู่' : 'ใช้ที่อยู่นี้'}</button>` : `<button type="button" class="btn secondary sm" data-a="hmEditAddress" data-v="${esc(a.id)}">แก้ไข</button><button type="button" class="btn sm ${a.main ? 'secondary' : ''}" data-a="hmMainAddress" data-v="${esc(a.id)}" ${a.main ? 'disabled' : ''}>${a.main ? 'ที่อยู่หลัก' : 'ตั้งเป็นที่อยู่หลัก'}</button>`}</div>
</article>`).join('');
const addressEmpty = () => `<div class="hm-empty">${ui.emptyArt('map-pin')}<h3>ยังไม่มีที่อยู่จัดส่ง</h3><p>เพิ่มที่อยู่เพื่อค้นหาร้านยาในบริเวณนั้น</p>${ui.btn('เพิ่มที่อยู่', { a: 'hmNewAddress', icon: 'plus' })}</div>`;
TP.sheetDef('homeaddress', {
  group: 'before', title: 'เลือกที่อยู่จัดส่ง', code: 'C210', host: 'home', tall: true,
  states: [['normal', 'มีที่อยู่'], ['empty', 'ยังไม่มีที่อยู่'], ['named', 'ที่อยู่ตั้งชื่อเอง']],
  prep(S) { if (S.st.homeaddress === 'empty') { S.addrs = []; S.deliveryAddressId = null; } else if (S.st.homeaddress === 'named') { S.addrs = TP.fresh().addrs; S.addrs[0].label = 'บ้านแม่'; S.deliveryAddressId = null; } },
  render(ctx) { return `<p class="small">เลือกรายการเพื่อดูร้านยาใกล้ฉันนี้ การเลือกไม่เปลี่ยนที่อยู่หลัก</p><div class="hm-address-list">${ctx.S.addrs?.length ? homeAddressCards(ctx.S, true) : addressEmpty()}</div>`; },
  foot: () => ui.btn('จัดการสมุดที่อยู่', { a: 'hmAddressBook', kind: 'secondary', icon: 'map-pin' })
});
TP.screen('addressbook', {
  group: 'account', title: 'สมุดที่อยู่', code: 'C514', parent: 'account',
  states: [['normal', 'มีที่อยู่หลัก'], ['empty', 'ยังไม่มีที่อยู่'], ['alternate', 'เปลี่ยนที่อยู่หลัก'], ['named', 'ชื่อที่อยู่ บ้านแม่']],
  prep(S) { if (S.st.addressbook === 'named') { S.addrs = TP.fresh().addrs; S.addrs[0].label = 'บ้านแม่'; } else if (S.st.addressbook === 'empty') S.addrs = []; else if (S.st.addressbook === 'alternate') { S.addrs = TP.fresh().addrs; S.addrs.forEach(a => a.main = a.id === 'a2'); S.deliveryAddressId = null; } },
  render(ctx) { return ui.nav({ back: true, title: 'สมุดที่อยู่' }) + ui.page(`<p class="lt-sub">ที่อยู่หลักจะใช้เป็นค่าเริ่มต้นเมื่อเปิดหน้าแรก</p><div class="hm-address-list">${ctx.S.addrs?.length ? homeAddressCards(ctx.S, false) : addressEmpty()}</div>${ctx.S.addrs?.length ? `<div class="mt16">${ui.btn('เพิ่มที่อยู่ใหม่', { a: 'hmNewAddress', icon: 'plus' })}</div>` : ''}`, { lt: 'สมุดที่อยู่' }); }
});
const addressFields = [['label','ชื่อที่อยู่ (เช่น บ้าน ที่ทำงาน บ้านแม่)','text',true],['first','ชื่อผู้รับ','text'],['last','นามสกุล','text'],['phone','เบอร์โทร','tel'],['house','บ้านเลขที่ / อาคาร / ชั้น','text'],['alley','ซอย (ถ้ามี)','text',true],['road','ถนน (ถ้ามี)','text',true],['dist','แขวง / ตำบล','text'],['amp','เขต / อำเภอ','text'],['prov','จังหวัด','text'],['zip','รหัสไปรษณีย์','text']];
TP.screen('addressedit', {
  group: 'account', title: 'เพิ่ม / แก้ไขที่อยู่', code: 'C515', parent: 'addressbook',
  states: [['normal', 'เพิ่มที่อยู่'], ['edit', 'แก้ไขที่อยู่'], ['invalid', 'ข้อมูลไม่ครบ'], ['named', 'แก้ไขชื่อที่อยู่']],
  prep(S) { if (S.st.addressedit === 'named') { S.addrs = TP.fresh().addrs; S.addrs[0].label = 'บ้านแม่'; S._homeEditAddress = S.addrs[0].id; } if (S.st.addressedit === 'edit') S._homeEditAddress = S.addrs?.[0]?.id; if (S.st.addressedit === 'invalid') S._homeAddressInvalid = true; },
  render(ctx) { const a = (ctx.S.addrs || []).find(a => a.id === ctx.S._homeEditAddress) || {}; return ui.nav({ back: true, title: a.id ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่' }) + ui.page(`<div class="hm-address-form">${addressFields.map(([key,label,type,optional]) => `<div class="field"><label for="home-address-${key}">${label}</label><input class="input" id="home-address-${key}" name="${key}" type="${type}" value="${esc(a[key] || '')}" ${key === 'label' ? 'maxlength="40" placeholder="ตั้งชื่อที่อยู่"' : ''} ${optional ? '' : 'required'} ${key === 'phone' ? 'inputmode="tel" pattern="0[0-9]{8,9}" maxlength="10"' : key === 'zip' ? 'inputmode="numeric" pattern="[0-9]{5}" maxlength="5"' : ''}></div>`).join('')}<label class="hm-primary-check"><input type="checkbox" id="home-address-main" ${a.main || !ctx.S.addrs?.length ? 'checked' : ''}> ตั้งเป็นที่อยู่หลัก</label><p id="home-address-error" class="danger-t" role="alert">${ctx.S._homeAddressInvalid ? 'กรุณากรอกข้อมูลให้ครบและตรวจสอบเบอร์โทรกับรหัสไปรษณีย์' : ''}</p>${ui.btn('บันทึกที่อยู่', { a: 'hmSaveAddress' })}</div>`, { lt: a.id ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่' }); }
});
TP.screen('favorites', {
  group: 'before', title: 'ร้านยาโปรด', code: 'C211', parent: 'home',
  states: [['normal', 'มีร้านโปรด'], ['empty', 'ยังไม่มีร้านโปรด'], ['many', 'ร้านโปรดหลายร้าน'], ['noaddress', 'ยังไม่มีที่อยู่จัดส่ง'], ['closed', 'ร้านโปรดปิด'], ['paused', 'เภสัชกรพัก']],
  prep(S) {
    const st = S.st.favorites;
    if (st === 'empty') S.favoriteBranches = [];
    else if (st) S.favoriteBranches = st === 'many' ? TP.BRANCHES.slice(0,5).map(b=>b.id) : ['tw'];
    if (st === 'noaddress') { S.addrs = []; S.deliveryAddressId = null; }
    if (st === 'closed') S.storeOpen = false;
    if (st === 'paused') S.branchState.tw = 'pause';
  },
  render(ctx) {
    const S = ctx.S, stores = TP.BRANCHES.filter(b => (S.favoriteBranches || []).includes(b.id)).sort((a,b)=>(TP.homeDistance(a) ?? Infinity)-(TP.homeDistance(b) ?? Infinity));
    const content = stores.length ? `<div class="fav-content"><div class="fav-intro"><p><b>${stores.length} ร้านที่บันทึกไว้</b></p><span>แตะร้านเพื่อดูข้อมูลและเลือกวิธีปรึกษา</span></div>${!TP.homeAddress() ? `<div class="fav-address-note">${ic('map-pin',20,2)}<div><b>เลือกที่อยู่เพื่อดูระยะทาง</b><button type="button" class="hm-text-action" data-sheet="homeaddress">เลือกที่อยู่จัดส่ง ${ic('chevron-right',16,2)}</button></div></div>` : ''}${storeListHtml(S,stores,{directFavorite:true})}</div>` : `<div class="fav-empty">${ui.emptyArt('heart')}<h2>เก็บร้านที่คุณไว้ใจไว้ที่นี่</h2><p>แตะหัวใจที่ร้านยา เพื่อกลับมาดูข้อมูลหรือปรึกษาครั้งถัดไปได้ง่ายขึ้น</p>${ui.btn('ดูร้านยาใกล้ฉัน', { go: 'home', iconRight:'arrow-right' })}</div>`;
    return ui.nav({ back: true, title: 'ร้านยาโปรด' }) + ui.page(content, { lt: 'ร้านยาโปรด' });
  }
});

TP.act('hmOpenAddress', () => TP.sheet('homeaddress'));
TP.act('hmSelectAddress', async t => {
  if (!(TP.S.addrs || []).some(a => a.id === t.dataset.v)) return;
  TP.S.deliveryAddressId = t.dataset.v; TP.S.branchPicked = false;
  TP.saveHomePreferences(); await TP.closeSheet({ instant: true }); TP.refresh({ anim: false });
});
TP.act('hmAddressBook', async () => { await TP.closeSheet({ instant: true }); TP.go('addressbook'); });
TP.act('hmNewAddress', async () => { TP.S._homeEditAddress = null; TP.S._homeAddressInvalid = false; TP.S.st.addressedit = undefined; await TP.closeSheet({ instant: true }); TP.go('addressedit'); });
TP.act('hmEditAddress', t => { TP.S._homeEditAddress = t.dataset.v; TP.S._homeAddressInvalid = false; TP.S.st.addressedit = undefined; TP.go('addressedit'); });
TP.act('hmMainAddress', t => {
  const a = (TP.S.addrs || []).find(a => a.id === t.dataset.v); if (!a) return;
  TP.S.addrs.forEach(x => x.main = x.id === a.id); TP.S.deliveryAddressId = null; TP.S.branchPicked = false;
  TP.saveHomePreferences(); TP.refresh({ anim: false }); TP.notify('ตั้งเป็นที่อยู่หลักแล้ว', { icon: 'map-pin' });
});
TP.act('hmSaveAddress', () => {
  const values = {}; let invalid = null;
  for (const [key,,,optional] of addressFields) { const input = document.getElementById('home-address-' + key); if (!input) return; values[key] = input.value.trim(); if (((!optional && !values[key]) || !input.checkValidity()) && !invalid) invalid = input; }
  if (invalid) { document.getElementById('home-address-error').textContent = 'กรุณากรอกข้อมูลให้ครบและตรวจสอบเบอร์โทรกับรหัสไปรษณีย์'; invalid.focus(); invalid.reportValidity(); return; }
  const list = TP.S.addrs || (TP.S.addrs = []); let a = list.find(a => a.id === TP.S._homeEditAddress);
  if (a) { Object.assign(a, values, { pin: false }); } else { a = { id: 'a' + Date.now(), ...values, main: false, pin: false }; list.push(a); }
  if (document.getElementById('home-address-main').checked || list.length === 1) { list.forEach(x => x.main = x.id === a.id); TP.S.deliveryAddressId = null; }
  else if (!list.some(x => x.main)) list[0].main = true;
  TP.S.branchPicked = false; TP.saveHomePreferences(); TP.S.st.addressbook = undefined; TP.go('addressbook', { via: 'none' }); TP.notify('บันทึกที่อยู่แล้ว', { icon: 'map-pin' });
});
TP.act('hmFavorite', t => {
  const id = t.dataset.v; if (!TP.BRANCHES.some(b => b.id === id)) return;
  const favorites = TP.S.favoriteBranches || []; TP.S.favoriteBranches = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
  TP.saveHomePreferences();
  if (TP.sheetOpen?.()?.id === 'storeinfo') {
    const saved = TP.S.favoriteBranches.includes(id);
    document.querySelectorAll(`[data-a="hmFavorite"][data-v="${id}"]`).forEach(button => {
      button.setAttribute('aria-pressed', String(saved));
      button.setAttribute('aria-label', saved ? 'นำออกจากร้านโปรด' : 'บันทึกร้านโปรด');
    });
    TP.notify(saved ? 'บันทึกร้านโปรดแล้ว' : 'นำออกจากร้านโปรดแล้ว', { icon: 'heart' });
  } else TP.refresh({ anim: false });
});
const homeBanner = S => { const a = TP.homeAddress(); return `<header class="hm-banner" data-in="0"><img class="hm-banner-image" src="/assets/banners/home-storefront-cover-v2.png" alt="" aria-hidden="true" fetchpriority="high" width="1536" height="1024"><div class="hm-banner-tools"><button type="button" class="hm-delivery-select" data-sheet="homeaddress" aria-haspopup="dialog" aria-label="เลือกที่อยู่จัดส่ง: ${esc(TP.addressName(a))}">${ic('map-pin', 20, 1.8)}<span><small>ที่อยู่จัดส่ง</small><b class="hm-delivery-name"><span>${esc(TP.addressName(a))}</span>${ic('chevron-down', 16, 2)}</b></span></button><button type="button" class="ibtn hm-banner-heart" data-go="favorites" aria-label="ร้านยาโปรด">${ic('heart', 24, 1.8)}</button></div><div class="hm-banner-copy"><h2 class="hm-greeting">สวัสดี${S.user.name ? ' คุณ' + esc(S.user.name) : S.user.full ? ' คุณ' + esc(String(S.user.full).trim().split(/\s+/)[0]) : ''}</h2><p class="hm-brand-message">MITRAREE ดูแลคุณ<br>ใกล้กว่าที่เคย</p></div></header>`; };

/* C201: selected nearby pharmacy, using the shared branch records and availability. */
function storeListHtml(S, stores, { directFavorite = false } = {}) {
  const branchStatus = b => S.storeOpen === false ? 'closed' : S.branchState[b.id] || (b.demo ? 'open' : 'closed');
  const branchAvailability = b => branchStatus(b) === 'closed' ? 'ปิดรับปรึกษา' : branchStatus(b) === 'pause' ? 'เภสัชกรพักชั่วคราว' : 'เปิดรับปรึกษา';
  return `<div class="hm-store-list">${stores.map(b => `<article class="hm-branch-tile">
      <button type="button" class="hm-branch-open" data-sheet="storeinfo" data-p='${esc(JSON.stringify({ branch: b.id }))}' aria-label="ดูข้อมูล${esc(b.name)}และเลือกวิธีปรึกษา">
        <img src="${esc(b.photo || '/assets/stores/pharmacy-thumbnail-v1.png')}" alt="ภาพประกอบร้านยาจำลอง" width="96" height="96" loading="lazy">
        <span class="hm-branch-copy"><strong>${esc(b.name)}</strong><span class="hm-branch-status">${ui.tag(S.sysOff && branchStatus(b) !== 'closed' ? 'ปิดปรึกษาชั่วคราว' : branchAvailability(b), branchStatus(b) === 'closed' || S.sysOff ? 'muted' : branchStatus(b) === 'pause' ? 'warn' : 'ok', {dot:true})}</span><span class="hm-branch-meta"><span class="hm-branch-distance">${ic('map-pin',14,2)}${TP.homeDistance(b) == null ? 'ยังไม่ทราบระยะทาง' : TP.homeDistance(b) + ' กม.'}</span><span class="hm-branch-hours">${ic('clock',14,2)}${esc(b.hours)} น.</span></span></span>
      </button>
      ${directFavorite ? `<button type="button" class="hm-branch-favorite" data-a="hmFavorite" data-v="${b.id}" aria-pressed="${(S.favoriteBranches || []).includes(b.id)}" aria-label="${(S.favoriteBranches || []).includes(b.id) ? 'นำออกจากร้านโปรด' : 'บันทึกร้านโปรด'}">${ic('heart',20,1.8)}</button>` : `<button type="button" class="hm-branch-favorite hm-branch-more" data-sheet="storeactions" data-p='${esc(JSON.stringify({branch:b.id}))}' aria-haspopup="dialog" aria-label="ตัวเลือกร้าน ${esc(b.name)}">${ic('ellipsis-vertical',16,1.5)}</button>`}
    </article>`).join('')}</div>`;
}

function nearbyStoresHtml(S, { hideAction = false } = {}) {
  const b = TP.pickBranch(), ph = TP.PHARM[b.pharm];
  const address = TP.homeAddress(), located = !!address;
  const distance = branch => TP.homeDistance(branch);
  const distanceText = branch => { const km = distance(branch); return km == null ? '' : `${km} กม.`; };
  const status = branch => S.storeOpen === false ? 'closed' : S.branchState[branch.id] || (branch.demo ? 'open' : 'closed');
  const state = status(b), offline = state === 'closed', paused = state === 'pause';
  const stores = TP.homeStores(), others = stores.filter(x => x.id !== b.id);
  if (!address || !stores.length) return `<section class="hm-nearby"><div class="hm-section-head"><h2>ร้านยาใกล้ฉัน</h2></div><div class="hm-empty">${ui.emptyArt(!address?'map-pin':'store')}<h3>${!address ? 'เลือกที่อยู่จัดส่งก่อน' : TP.BRANCHES.some(b => distance(b) != null) ? 'ยังไม่มีร้านยาในบริเวณนี้' : 'ยังตรวจสอบพื้นที่นี้ไม่ได้'}</h3><p>${!address ? 'เพิ่มหรือเลือกที่อยู่เพื่อค้นหาร้านยาใกล้คุณ' : 'เลือกที่อยู่อื่น หรือแก้ไขข้อมูลในสมุดที่อยู่'}</p>${ui.btn(address ? 'เปลี่ยนที่อยู่' : 'เลือกที่อยู่จัดส่ง', { sheet: 'homeaddress', a: 'hmOpenAddress' })}</div></section>`;
  const availability = branch => status(branch) === 'closed' ? 'ปิดรับปรึกษา' : status(branch) === 'pause' ? 'เภสัชกรพักชั่วคราว' : 'เปิดรับปรึกษา';
  return `<section class="hm-nearby" aria-labelledby="hmNearbyTitle" data-in="1">
    <div class="hm-section-head"><h2 id="hmNearbyTitle">ร้านยาใกล้ฉัน</h2></div>
    ${storeListHtml(S, stores.slice(0,6))}
    ${S.autoReason ? `<p class="hm-store-notice">${ic('info', 16, 2)}<span>${esc(S.autoReason)}</span></p>` : ''}

  </section>`;
}
TP.sheetDef('storeactions', {
  group: 'before', title: 'ตัวเลือกร้านยา', code: 'C214', host: 'home', hideClose: true,
  states: [['normal', 'เพิ่มร้านโปรด'], ['saved', 'นำออกจากร้านโปรด']],
  prep(S) { const st = S.st.storeactions; if (st === 'saved') S.favoriteBranches = [...new Set([...(S.favoriteBranches || []),S.branch])]; else if (st === 'normal') S.favoriteBranches = (S.favoriteBranches || []).filter(id=>id!==S.branch); },
  render(ctx) {
    const b = TP.branch(ctx.params?.branch) || TP.branch(), saved = (ctx.S.favoriteBranches || []).includes(b.id);
    return `<div class="hm-store-actions"><button type="button" class="hm-store-action" data-a="hmMenuFavorite" data-v="${esc(b.id)}">${ic('heart',22,1.8)}<span>${saved ? 'นำออกจากร้านโปรด' : 'บันทึกร้านโปรด'}</span></button></div>`;
  }
});
TP.act('hmMenuFavorite', async t => {
  const id = t.dataset.v; if (!TP.BRANCHES.some(b=>b.id===id)) return;
  const saved = !(TP.S.favoriteBranches || []).includes(id);
  await TP.closeSheet({instant:true});
  TP.ACTS.hmFavorite({dataset:{v:id}});
  TP.notify(saved ? 'บันทึกร้านโปรดแล้ว' : 'นำออกจากร้านโปรดแล้ว', {icon:'heart'});
});
TP.sheetDef('allbranches', {
  group: 'before', title: 'สาขาทั้งหมด', code: 'C213', host: 'home', tall: true,
  states: [['normal', 'หลายสาขา'], ['noaddress', 'ยังไม่มีที่อยู่'], ['closed', 'ร้านปิด']],
  prep(S) { TP.homeScenario(S, S.st.allbranches === 'noaddress' ? 'noaddress' : 'normal'); if (S.st.allbranches === 'closed') S.storeOpen = false; },
  render(ctx) { const S = ctx.S, address = TP.homeAddress(); return `<p class="small">${address ? 'ระยะทางอ้างอิงจาก ' + esc(TP.addressName(address)) : 'ดูข้อมูลได้ทุกสาขา เลือกที่อยู่บนหน้าแรกเพื่อดูสาขาที่จัดส่งได้'}</p><div class="hm-address-list">${[...TP.BRANCHES].sort((a,b) => (TP.homeDistance(a) ?? Infinity) - (TP.homeDistance(b) ?? Infinity)).map(b => {
    const km = TP.homeDistance(b), closed = S.storeOpen === false || S.branchState[b.id] === 'closed', eligible = !closed && km != null && km <= TP.ZONE_KM;
    const status = closed ? 'ปิดรับปรึกษา' : S.branchState[b.id] === 'pause' ? 'พักรับปรึกษาชั่วคราว' : 'เปิดรับปรึกษา';
    return `<article class="hm-address-card"><div class="all-branch-head"><h3>${esc(b.name)}</h3>${b.id === S.branch ? '<span class="tag">สาขาที่เลือก</span>' : ''}</div><p>${status}${km == null ? '' : ' · ' + km + ' กม.'}</p><p>${esc(b.area)} · ${esc(b.hours)} น.</p>${address && !eligible && !closed ? `<p class="all-branch-note">${km == null ? 'ยังตรวจสอบระยะทางจากที่อยู่นี้ไม่ได้' : 'อยู่นอกพื้นที่จัดส่งของที่อยู่ที่เลือก'}</p>` : ''}<div class="hm-address-actions">${ui.btn('ข้อมูลร้าน', { kind: 'secondary', sm: true, sheet: 'storeinfo', p: { branch: b.id } })}<button type="button" class="btn sm" data-a="hmSelectAllBranch" data-v="${b.id}" ${eligible ? '' : 'disabled'}>${!address ? 'เลือกที่อยู่ก่อน' : b.id === S.branch ? 'เลือกอยู่' : 'ใช้สาขานี้'}</button></div></article>`;
  }).join('')}</div>`; }
});
TP.act('hmSelectAllBranch', async t => {
  const b = TP.homeStores().find(b => b.id === t.dataset.v); if (!b || TP.S.storeOpen === false || TP.S.branchState[b.id] === 'closed') return;
  TP.S.branch = b.id; TP.S.branchPicked = true; TP.S.autoReason = '';
  await TP.closeSheet({ instant: true }); TP.refresh({ anim: false });
});

TP.sheetDef('storeinfo', {
  group: 'before', title: 'ข้อมูลร้านและเภสัชกร', code: 'C212', host: 'home', tall: true,
  states: [['normal', 'เปิดรับปรึกษา'], ['paused', 'เภสัชกรพัก'], ['closed', 'ร้านปิด'], ['choose-mode', 'เลือกสนทนาหรือวิดีโอ'], ['system-off', 'ระบบปรึกษาปิด'], ['grouped', 'รายละเอียดแบ่งหมวด'], ['license', 'ตรวจใบอนุญาตร้านยา'], ['favorite', 'บันทึกร้านโปรดแล้ว'], ['unfavorite', 'ยังไม่บันทึกร้านโปรด'], ['neutral-sections', 'หมวดข้อมูลพื้นเทาอ่อน']],
  prep(S) { const st = S.st.storeinfo; if (!st) return; S.storeOpen = st !== 'closed'; S.branchState[S.branch] = st === 'paused' ? 'pause' : 'open'; S.sysOff = st === 'system-off'; if (st === 'favorite') S.favoriteBranches = [...new Set([...(S.favoriteBranches || []), S.branch])]; if (st === 'unfavorite') S.favoriteBranches = (S.favoriteBranches || []).filter(id => id !== S.branch); },
  render(ctx) {
    const b = TP.branch(ctx.params?.branch) || TP.branch(), ph = TP.PHARM[b.pharm], S = ctx.S;
    const closed = S.storeOpen === false || S.branchState[b.id] === 'closed', paused = S.branchState[b.id] === 'pause', unavailable = S.sysOff;
    const status = closed ? 'ปิดรับปรึกษา' : unavailable ? 'ปิดปรึกษาชั่วคราว' : paused ? 'เภสัชกรพักชั่วคราว' : 'เปิดรับปรึกษา';
    const tone = closed || unavailable ? 'muted' : paused ? 'warn' : 'ok', km = TP.homeDistance(b);
    return `<div class="bc-detail bc-organized">
      <section class="bc-overview" aria-label="ภาพรวมร้านยา">
        <img class="bc-detail-photo" src="${esc(b.photo || '/assets/stores/pharmacy-thumbnail-v1.png')}" alt="ภาพประกอบร้านยาจำลอง" width="1536" height="1024">
        <div class="bc-identity-head"><div class="bc-identity"><h3>${esc(b.name)}</h3><p>${esc(b.area)}</p></div><button type="button" class="ibtn hm-favorite-button bc-favorite" data-a="hmFavorite" data-v="${esc(b.id)}" aria-pressed="${(S.favoriteBranches || []).includes(b.id)}" aria-label="${(S.favoriteBranches || []).includes(b.id) ? 'นำออกจากร้านโปรด' : 'บันทึกร้านโปรด'}">${ic('heart',22,1.8)}</button></div>
        <div class="bc-availability">${ui.tag(status,tone,{dot:true})}<span>${closed || unavailable ? 'ขณะนี้ยังเริ่มปรึกษาไม่ได้' : paused ? 'เลือกวิธีปรึกษาเพื่อเข้าคิวรอ' : ''}</span></div>
        <dl class="bc-facts"><div><dt>${ic('clock',16,2)}เวลาทำการ</dt><dd>${esc(b.hours)} น.</dd></div><div><dt>${ic('map-pin',16,2)}ระยะจากที่อยู่จัดส่ง</dt><dd>${km == null ? 'ยังระบุระยะไม่ได้' : esc(km)+' กม.'}</dd></div></dl>
      </section>
      <section class="bc-section" aria-labelledby="bcLocationTitle"><h4 id="bcLocationTitle">ที่ตั้งและติดต่อร้าน</h4><p class="bc-address">${esc(b.addr)}</p>${b.demo ? '<p class="bc-muted">ข้อมูลจำลองสำหรับแสดงหน้าจอ</p>' : `<div class="hm-store-links"><a href="${esc(b.map)}" target="_blank" rel="noopener noreferrer">${ic('map-pin',18,2)} ดูแผนที่</a><a href="tel:${esc(b.phone)}">${ic('phone',18,2)} โทรหาร้าน</a></div>`}</section>
      <section class="bc-section" aria-labelledby="bcPharmacistTitle"><h4 id="bcPharmacistTitle">เภสัชกรผู้ดูแล</h4><div class="bc-pharmacist-card">${ui.av('',{ini:ph.ini})}<div><b>${esc(ph.short)}</b><span>${closed || unavailable ? 'ข้อมูลเภสัชกรประจำสาขา' : paused ? 'พักรับปรึกษาชั่วคราว' : 'ให้คำปรึกษาประจำสาขานี้'}</span><small>ใบประกอบวิชาชีพ ${esc(ph.lic)}</small></div></div></section>
      <details class="bc-license" ${S.st.storeinfo === 'license' ? 'open' : ''}><summary>${ic('shield-check',18,2)} ข้อมูลใบอนุญาตร้านยา ${ic('chevron-down',16,2)}</summary><dl><div><dt>เลขใบอนุญาตร้านยา</dt><dd>${esc(b.lic)}</dd></div></dl></details>
    </div>`;
  },
  foot(ctx) {
    const b = TP.branch(ctx.params?.branch) || TP.branch(), closed = ctx.S.storeOpen === false || ctx.S.branchState[b.id] === 'closed';
    const available = TP.homeStores().some(x => x.id === b.id);
    if (TP.caseOpen()) return ui.btn('กลับไปการปรึกษาที่ค้าง', { a: 'hmReturnCase', icon: 'message-circle' });
    if (!available) return `<p class="small">สาขานี้อยู่นอกพื้นที่ของที่อยู่ที่เลือก กรุณาเลือกที่อยู่อื่นก่อนเริ่มปรึกษา</p>`;
    if (closed) return ui.btn('ฝากคำถามถึงเภสัชกร', { a: 'hmStoreOffline', p: { branch: b.id } });
    if (ctx.S.sysOff) return ui.btn('ดูช่องทางติดต่อร้าน', { a: 'hmStoreContact' });
    return `<div class="hm-consult-options"><div class="bc-action-heading"><p>ปรึกษาเภสัช</p><small>ไม่มีค่าปรึกษา · จ่ายเฉพาะเมื่อซื้อยา</small></div><div><button type="button" class="btn" data-a="hmConsultMode" data-v="chat" data-branch="${b.id}">${ic('message-circle',20,2)}<span>ปรึกษาเภสัช</span></button></div></div>`;
  }
});
TP.act('hmConsultMode', async t => {
  const mode = t.dataset.v, b = TP.homeStores().find(b => b.id === t.dataset.branch);
  if (!['chat','video'].includes(mode) || !b || TP.S.storeOpen === false || TP.S.branchState[b.id] === 'closed' || TP.S.sysOff) return;
  if (TP.caseOpen()) return;
  TP.S.branch = b.id; TP.S.branchPicked = true;
  await TP.closeSheet({ instant: true }); TP.ACTS.hmStart({ dataset: { mode } });
});
TP.act('hmReturnCase', async () => { await TP.closeSheet({ instant: true }); TP.go(['room','matched'].includes(TP.S.case?.status) ? 'room' : 'queue'); });
TP.act('hmStoreOffline', async (t,ctx) => { const b = TP.branch(ctx.params?.branch) || TP.branch(); TP.S.branch = b.id; TP.S.branchPicked = true; await TP.closeSheet({ instant: true }); TP.go('offline'); });
TP.act('hmStoreContact', async () => { await TP.closeSheet({ instant: true }); TP.go('sysoff'); });
TP.act('hmChooseStore', t => {
  const b = TP.BRANCHES.find(b => b.id === t.dataset.v);
  if (!b || TP.S.storeOpen === false || TP.S.branchState[b.id] === 'closed') return;
  TP.S.branch = b.id; TP.S.branchPicked = true; TP.S.autoReason = '';
  TP.refresh({ anim: false }); TP.notify('เลือก' + b.name + 'แล้ว', { icon: 'map-pin' });
});

function homeActiveCaseCard(S) {
  const c=S.case||{}, b=TP.branch(c.branch)||TP.pickBranch();
  const waiting=['queue','paused'].includes(c.status), paused=c.status==='paused';
  const idle=!waiting&&!!c.idle, pending=!waiting&&c.order?.status==='pending';
  const ph=TP.PHARM[c.pharm||b.pharm]||TP.PHARM.kj;
  const pos=Number.isFinite(c.pos)?Math.max(1,c.pos):null;
  const status=paused?'พักรับคิวชั่วคราว':waiting?'รอเภสัชกร':idle?'รอคำตอบจากคุณ':pending?'รอชำระเงิน':c.status==='matched'?'เภสัชกรรับคิวแล้ว':'กำลังสนทนา';
  const title=paused?'คิวของคุณยังอยู่':waiting?(pos===1?'คุณเป็นคิวถัดไป':pos?`มีผู้รอก่อนคุณ ${pos-1} คน`:'รอเภสัชกรรับคิว'):c.fromOf?'เภสัชกรตอบคำถามแล้ว':idle?'เภสัชกรรอคุณตอบกลับ':pending?'มีรายการยารอชำระ':'กลับไปปรึกษาต่อได้เลย';
  const help=paused?'เภสัชกรดูแลหน้าร้านอยู่ คุณยังไม่เสียคิว':waiting?(S.notif===false?'เปิดแอปไว้เพื่อติดตามคิว การแจ้งเตือนปิดอยู่':'ออกจากหน้านี้ได้ เราจะแจ้งเตือนเมื่อเภสัชกรรับคิว'):idle?'หากไม่ตอบภายใน 2 นาที การปรึกษาจะปิด':pending?'ตรวจสอบรายการยาและชำระเงินในห้องปรึกษา':'การปรึกษานี้ยังไม่จบ กลับไปคุยในห้องเดิมได้';
  const cta=waiting?'กลับเข้าห้องแชท':c.fromOf?'อ่านคำตอบ':idle?'กลับไปตอบ':pending?'ดูรายการยาและชำระเงิน':'กลับไปปรึกษาต่อ';
  return `<article class="hm-active-case" aria-labelledby="hmActiveTitle" data-in="1">
    <div class="hm-active-top"><span class="hm-active-label">${ic('message-circle',18,2)} การปรึกษาของคุณ</span><span class="hm-active-status" data-tone="${paused?'muted':c.status==='room'&&!idle&&!pending?'active':'waiting'}"><i class="hm-active-status-dot" aria-hidden="true"></i>${status}</span></div>
    <h2 id="hmActiveTitle">${esc(title)}</h2>
    <div class="hm-active-provider">${ui.av('',{ini:ph.ini,img:TP.demoProfiles?.[ph.id==='tp'?'pharmacist_m':'pharmacist_f']})}<div><b>${esc(ph.short)}</b><span>${waiting?'เภสัชกรประจำสาขา':'เภสัชกรผู้ดูแล'} · ${esc(b.name)}</span></div></div>
    ${!waiting||paused||S.notif===false?`<p class="hm-active-help">${ic(waiting?'bell':'info',16,2)}<span>${esc(help)}</span></p>`:''}
    ${ui.btn(cta,{go:waiting?'queue':'room',via:waiting?'morph':'cover',iconRight:'arrow-right',cls:'hm-active-cta'})}
  </article>`;
}

function heroHtml(S, st) {
  if (TP.caseOpen()) return homeActiveCaseCard(S);
  const b = TP.pickBranch(), bs = S.branchState[b.id], q = S.queueLen[b.id] || 0;
  const gl = brand.guilloche({ w: 360, h: 236, cx: 330, cy: 40, n: 18, r0: 30, r1: 210, k: 16, a: 8 });
  const halo = brand.halo(150, { cls: 'w', style: 'right:-38px;bottom:-40px;opacity:.5' });
  const plus = TP.MOTIF === 'plus', art = plus ? gl + halo : brand.heroArt(TP.MOTIF), hcls = plus ? 'hero pf hm-hero' : `hero hm-hero hx-${TP.MOTIF}`;
  const head = `<button type="button" class="hr-branch" data-sheet="allbranches">${ic('map-pin', 16, 2)}<span>${esc(b.name)} · ${b.km}&nbsp;กม.</span>${ic('chevron-down', 16, 2.2)}</button>`;
  return nearbyStoresHtml(S);
}

function homeConsultBanner(S) {
  const active=TP.caseOpen();
  return `<article class="hm-consult-banner" aria-labelledby="homeConsultTitle"><img class="hm-consult-banner-art" src="/assets/banners/pharmacy-female-counter-v1.png" alt="" width="1536" height="1024" decoding="async"><div class="hm-consult-banner-copy"><h2 id="homeConsultTitle">เรื่องยา<br>ถามเภสัชได้</h2><p>เล่าอาการหรือถามเรื่องยา<br>ให้เภสัชกรช่วยแนะนำ</p>${ui.btn(active?'คุยกับเภสัชต่อ':'ปรึกษาเภสัช',{a:'quickConsult',kind:'white',iconRight:'arrow-right',cls:'hm-consult-banner-cta'})}</div></article>`;
}

TP.screen('home', {
  group: 'before', title: 'หน้าแรก', code: 'C201', ref: 'C01', tab: 'home', sb: 'light',
  states: [['normal', 'ปกติ'], ['loading', 'กำลังโหลด'], ['active', 'มีเคสค้าง'], ['busy', 'สาขาใกล้สุดพัก'], ['closed', 'ร้านปิด'], ['address-alt', 'เลือกที่อยู่คลองเตย'], ['noaddress', 'ไม่มีที่อยู่'], ['outarea', 'ไม่พบร้านในพื้นที่'], ['unknownarea', 'พื้นที่ยังตรวจสอบไม่ได้'], ['banner-edge', 'แบนเนอร์เต็มขอบ'], ['blue-canvas', 'พื้นหลังเทาอมฟ้าอ่อน'], ['pharmacy-banner', 'ภาพร้านยาและเฟดข้อความ'], ['mini-menu', 'มินิเมนูสุขภาพใต้แบนเนอร์'], ['compact-store', 'การ์ดสาขาแบบกระชับ'], ['named-address', 'ชื่อที่อยู่และดรอปดาวน์'], ['plain-mini-menu', 'มินิเมนูไม่มีกรอบ'], ['branch-tile', 'การ์ดรูปซ้ายและเลือกวิธีปรึกษา'], ['white-canvas', 'พื้นหลังสีขาว'], ['layout-system', 'กริดและระยะกลางทั้งแอป'], ['store-list', 'ลิสต์ร้านยา 6 ร้าน'], ['care-shortcuts', 'ติดตามยาและประวัติในมินิเมนู'], ['figma-system', 'Figma tokens และ component กลาง'], ['real-photos', 'ภาพถ่ายและรูปมุมมน'], ['pastel-icons', 'ไอคอนภาพประกอบพาสเทล'], ['banner-actions', 'ปุ่มแบนเนอร์เสมอกัน ไม่มี badge'], ['refined-store-list', 'ลิสต์ร้านจัดลำดับข้อมูลใหม่'], ['distinct-store-photos', 'ภาพจำลองแต่ละร้านต่างกัน'], ['soft-status', 'แท็กเปิดรับปรึกษาพื้นเขียวอ่อน'], ['store-more', 'เมนูจุดสามจุดของร้าน'], ['bear-banner', 'ปกหมีเภสัชกร 3D'], ['banner-safe-area', 'ภาพปกเต็ม safe area เฟดต่อเนื่อง'], ['bright-bear', 'หมีสดใส เฟดเฉพาะด้านบน'], ['tritone-icons', 'ไอคอน Flat 3 สี CI'], ['personal-greeting', 'ทักทายชื่อจริงและหัวใจขาวเต็ม'], ['counter-bear', 'หมีอยู่หลังเคาน์เตอร์เป็นธรรมชาติ'], ['soft-rounded-icons', 'ไอคอนมนสี CI อ่อนและแนวปุ่มที่อยู่'], ['glass-tabs', 'เมนูล่าง Liquid Glass'], ['female-pharmacist-banner', 'ปกเภสัชกรหญิงหลังเคาน์เตอร์'],['quick-consult','ปุ่มกลาง เลือกร้านว่างใกล้สุด'],['quick-busy','ไม่มีร้านคิวว่าง'],['quick-unknown','ยังไม่ทราบจำนวนคิว'],['quick-address','ปรึกษาโดยยังไม่มีที่อยู่'],['quick-system-off','ระบบปรึกษาปิด'],['consult-banner','แบนเนอร์ชวนปรึกษาเหนือร้านยา'],['active-next','การปรึกษา คิวถัดไป'],['active-room','การปรึกษา ยังไม่จบ'],['active-paused','การปรึกษา พักรับคิว'],['active-payment','การปรึกษา รอชำระ'],['active-idle','การปรึกษา รอคำตอบ'],["case-queue3", "จำลอง รออีก 3 คิว"],["case-queue2", "จำลอง รออีก 2 คิว"],["case-queue1", "จำลอง รออีก 1 คิว"],["case-next", "จำลอง คิวถัดไป"],["case-paused", "จำลอง เภสัชกรพัก"],["case-matched", "จำลอง รับคิวแล้ว"],["case-chat", "จำลอง กำลังสนทนา"],["case-reply", "จำลอง รอคำตอบจากคุณ"],["case-payment", "จำลอง รอชำระเงิน"],["case-finished", "จำลอง จบการปรึกษา"],["case-cancelled", "จำลอง ยกเลิกคิว"],["case-expired", "จำลอง หมดเวลารอคำตอบ"],["case-closed-unpaid","จบแชท รอชำระค่ายา"],["case-payment-soon","เหลือชำระ 1 นาที"],["case-closed-payexpired","จบแชท หมดเวลาชำระ"],["case-video-request","เภสัชกรขอวิดีโอคอล"]],
  notes: ['C201: การ์ดร้านใกล้ฉันแสดงระยะทาง เวลาเปิด คิว และข้อมูลร้าน กดเปลี่ยนสาขาหรือเลือกจากสาขาอื่นได้', 'บอกว่าไม่มีค่าปรึกษา จ่ายเฉพาะเมื่อซื้อยา (ตัวเล็ก ไม่ชูคำว่าฟรี)', 'A8: ไม่มีเบอร์ 1669 บนหน้าแรก ข้อความน้อยที่สุด', 'มีเคสค้าง: แสดงสถานะเคสก่อนข้อมูลร้าน กลับเข้าการปรึกษาได้ทันที'],
  prep(S) {
    const st = S.st.home; TP.homeScenario(S, st || 'normal'); if (!st) return;
    if(st.startsWith('case-')){TP.casePreview.seed(st.slice(5));return;}
    if (st === 'active' || st.startsWith('active-')) { TP.newCase(); const c=S.case;if(st==='active-next'){c.status='queue';c.pos=1;}if(st==='active-paused')c.status='paused';if(st==='active-room'||st==='active-payment'||st==='active-idle'){c.status='room';c.idle=st==='active-idle';if(st==='active-payment')c.order={...(c.order||{}),status:'pending'};} } else if (TP.caseOpen()) S.case = null;
    S.branchState.tw = st === 'busy' ? 'pause' : 'open'; S.branchState.on = 'pause';
    S.storeOpen = st === 'closed' ? false : TP.flag('storeOpen'); S.branchPicked = false;
    S.queueLen={...TP.fresh().queueLen};S.sysOff=TP.flag('sysOff');
    if(st==='quick-busy')for(const b of TP.BRANCHES)S.queueLen[b.id]=1;
    if(st==='quick-unknown')S.queueLen={};
    if(st==='quick-address')TP.homeScenario(S,'noaddress');
    if(st==='quick-system-off')S.sysOff=true;
    TP.emit('state');
  },
  render(ctx) {
    const S = ctx.S, st = ctx.state;
    const head = homeBanner(S);
    if (st === 'loading') {
      return ui.page(`<div class="hm-content">${head}<div class="hm-loading" aria-busy="true" aria-label="กำลังโหลดหน้าหลัก"><div class="hm-loading-shortcuts">${Array.from({length:4}, () => '<span class="skel"></span>').join('')}</div><div class="skel hm-loading-card"></div><div class="skel hm-loading-card"></div></div></div>`, { nonav: true });
    }
    const quick = [
      ['adrcare', 'allergy', 'บันทึกแพ้ยา'],
      ['health', 'health', 'ข้อมูลสุขภาพ'],
      ['follow', 'medication', 'การกินยา'],
      ['history', 'history', 'ประวัติ']
    ];
    const updates = [TP.orderReadyRow?.(S, { din: 2 }) || '',
      S._fidOffer && !S.faceId && !TP.caseOpen() ? fidCard() : '',
      S.ofPending ? ui.group([ui.row({ icon: 'message-square-text', title: 'คำถามที่ฝากไว้', sub: `${S.ofPending.whoName} · ฝากไว้ ${S.ofPending.at} · เภสัชกรจะตอบ${TP.OF_REPLY}`, chev: false })]) : ''
    ].filter(Boolean).join('');
    const shortcuts = `<nav class="hm-mini-menu" aria-label="ดูแลสุขภาพของคุณ">${quick.map(([go, icon, label]) => `<button type="button" class="hm-mini-item" ${go === 'adrcare' ? 'aria-label="บันทึกแพ้ยา / ผลข้างเคียง"' : ''} ${go === 'history' ? 'data-tab="history"' : `data-go="${go}"`}><span class="hm-mini-icon hm-mini-art hm-mini-art-${icon}"><img src="/assets/menu-icons/${icon}-rounded-v3.svg" alt="" width="48" height="48" decoding="async"></span><span>${esc(label)}</span></button>`).join('')}</nav>`;
    return ui.page(`<div class="hm-content">${head}
      ${shortcuts}
      ${TP.paymentReminderCard?.(S)||''}
      ${(st === 'active' || TP.caseOpen()) ? heroHtml(S,st)+homeConsultBanner(S)+nearbyStoresHtml(S,{hideAction:true}) : homeConsultBanner(S)+heroHtml(S,st)}
      ${updates ? `<section class="hm-updates" aria-label="การดูแลของคุณ"><h2 class="hm-section-title">การดูแลของคุณ</h2>${updates}</section>` : ''}

      </div>`, { nonav: true });
  }
});
TP.act('tabHistory', () => TP.tab('history'));
/* consult switched off from the back office (C17): the start button leads to sysoff, the rest of the app still works */
/* asked once, after the first consult (owner 19/10/2026) */
const fidCard = () => `<article class="card hm-fid" data-in="2"><div class="hm-fid-h"><span class="hm-fid-i">${ic('scan-face', 22, 1.9)}</span><div class="grow"><b>เปิดแอปด้วย Face ID หรือลายนิ้วมือ</b><span>คนอื่นที่ใช้เครื่องนี้เปิดดูประวัติการปรึกษาของคุณไม่ได้</span></div></div>
  <div class="btn-row mt12">${ui.btn('ไม่ใช่ตอนนี้', { kind: 'secondary', sm: true, a: 'hmFidNo' })}${ui.btn('เปิดใช้', { sm: true, go: 'faceid', via: 'push' })}</div></article>`;
TP.act('hmFidNo', () => { Object.assign(TP.S, { _fidOffer: false, _fidAsked: true }); TP.refresh({ anim: false }); TP.notify('เปิดได้ภายหลังที่หน้าบัญชี', { icon: 'info' }); });
TP.act('hmStart', t => {
  const S = TP.S;
  if (S.case && !TP.caseOpen()) Object.assign(S.intake, { who: 'me', symptoms: [], custom: [], otherOpen: false, urgent: [], note: '', photos: 0, attachments: [] });
  if (['chat','video'].includes(t?.dataset?.mode)) S.intake.mode = t.dataset.mode;
  const g = !TP.caseOpen() && TP.areaGate?.();
  if (g) { S.st.area = g; TP.go('area'); return; }
  TP.go(S.sysOff && TP.SCREENS.sysoff ? 'sysoff' : 'intake');
});
/* =====================================================================
   C209 service area (owner 20/10 "ให้จับ location ตั้งแต่แรก ถ้าเกิน 15 km ใช้บริการไม่ได้"):
   layer 1 = the phone position once, when a consult starts · layer 2 = the address at billing (C308.18)
   ===================================================================== */
TP.areaGate = () => {
  const S = TP.S;
  if (!TP.homeAddress?.() && S.loc === 'ask') return 'ask';
  if (!TP.homeAddress?.() && S.loc === 'deny') return S.locDenySeen ? '' : 'deny';
  const z = TP.locZone(); if (!z || z.ok) return '';
  /* owner 21/10: lock ON = no consult beyond 15 km · lock OFF = consult anyway, told once first that express cannot reach */
  return TP.zoneLock() ? 'out' : S.locWarnSeen ? '' : 'warn';
};
/* owner 21/10 "15 กม. ทุกที่อยู่": one radius per branch, Bangkok included */
const areaCard = din => ui.group(TP.BRANCHES.map(b => ui.row({ icon: 'map-pin', title: `ไม่เกิน 15 กม. จาก${b.name}`, sub: `${b.area} · วัดตามระยะทางถนน`, chev: false })),
  { title: 'พื้นที่ให้บริการ ใช้กับทุกที่ รวมในกรุงเทพ', din });
TP.screen('area', {
  group: 'before', title: 'ตรวจพื้นที่ให้บริการ', code: 'C209', parent: 'home',
  states: [['ask', 'ขอใช้ตำแหน่ง'], ['out', 'นอกพื้นที่ให้บริการ'], ['deny', 'ไม่ให้ตำแหน่ง'], ['warn', 'ปลดล็อกเขต เกิน 15 กม.']],
  notes: [
    'เจ้าของ 20/10 "ผมแนะนำว่าให้จับ location ตั้งแต่แรก ถ้าเกิน 15 km ใช้บริการไม่ได้ และ ต่อให้เข้ามาได้ก็จับที่อยู่อีกทีถ้าเกิน 15 km ก็ไม่สามารถทำบิลจัดส่งได้": ชั้นที่ 1 ตรวจตำแหน่งโทรศัพท์ครั้งเดียวตอนกดเริ่มปรึกษา · ชั้นที่ 2 ตรวจที่อยู่ตอนชำระเงิน (C308.18)',
    'เขต = เขตส่งยาเดียวกับ A1 · เจ้าของ 21/10 "ให้ lock distant 15 km ตาม ปุ่ม 15 km ใน console ได้เลย ให้มีผลกับทั้งการใช้บริการเข้าห้องในตอนแรก และล้อคอีกชั้นตอนเลือกจัดส่ง lalamove or dhl flash" และเลือก "15 กม. ทุกที่อยู่": ตำแหน่งต้องห่างสาขาใดสาขาหนึ่งไม่เกิน 15 กม. ตามระยะวิ่งจริง ใช้กับทุกที่ รวมในกรุงเทพ (เข้มกว่าประกาศ อย. ที่ให้กรุงเทพทุกเขต) · ชั้นที่ 2 ตอนเลือกจัดส่ง (C308) ใช้ 15 กม. เดียวกันทั้งส่งด่วน Lalamove ส่งพัสดุ Flash DHL และส่งเย็น · เดิม 20/10 อ่านว่ากรุงเทพทุกเขต หรือนอกกรุงเทพไม่เกิน 15 กม.',
    'C209.1 ถามก่อนหน้าต่างขอสิทธิ์ของมือถือ บอกว่าใช้ทำอะไร · C209.2 นอกพื้นที่ เริ่มปรึกษาไม่ได้ บอกเหตุผล พื้นที่ที่ให้บริการ เบอร์ร้าน และบรรทัด 1669 เสมอ ปุ่มตรวจตำแหน่งอีกครั้ง · C209.3 ไม่ให้ตำแหน่ง เข้าใช้ได้ บอกว่าจะตรวจที่อยู่ตอนชำระเงิน (ขึ้นครั้งเดียวต่อครั้งที่เปิดแอป)',
    'สวิตช์ล็อกเขต (คอนโซล ผู้ดูแลระบบ ค่าเริ่มต้นล็อก แจ้ง อย. ตรงๆ): ล็อก = นอกพื้นที่เข้า C209.2 · ปลดล็อก = ไม่บล็อกตอนเข้า ที่อยู่นอกเขตส่งพัสดุ Flash DHL ได้ (C308.21) ส่งด่วนยังไม่เกิน 15 กม. · ลองที่แผง ทั้งแอป',
    'เจ้าของ 21/10 "ถ้าเปิดปุ่ม 15 km ใน console หมายถึง บังคับทุกอย่างเป็น 15 km แตถ้า off หมายถึง lalamove บังคับ 15 km ส่วนที่เหลือไม่บังคับ · ปรึกษาไม่บังคับเขต · จัดส่ง dhl flash ไม่บังคับ · แต่เตือนก่อนเริ่มคำปรึกษาด้วยว่าไม่สามารถส่ง instant delivery ได้": เปิดสวิตช์ = ทุกอย่าง 15 กม. (C209.2 เริ่มปรึกษาไม่ได้) · ปิดสวิตช์ = เริ่มปรึกษาได้ทุกที่ ถ้าตำแหน่งเกิน 15 กม. ขึ้น C209.4 ครั้งเดียวก่อนแจ้งอาการ บอกว่าส่งด่วนไปไม่ถึง รับยาได้ทางส่งพัสดุหรือรับที่ร้าน · ส่งพัสดุ Flash DHL และส่งเย็นไม่บังคับเขต ส่งด่วน Lalamove ยัง 15 กม.',
    'ลอง: แผง ทั้งแอป > ตำแหน่งโทรศัพท์ > นอกพื้นที่ แล้วกด เริ่มปรึกษา ที่หน้าแรก',
    'ทำตอนสร้างจริง: ขอสิทธิ์ตำแหน่งแบบครั้งนี้เท่านั้น ใช้ตรวจพื้นที่แล้วไม่เก็บพิกัด · ระยะวิ่งจริงจากบริการแผนที่'],
  wait: ['ข้อความยินยอม (C105) ต้องบอกเรื่องใช้ตำแหน่งตรวจพื้นที่ไหม (ฝ่ายกฎหมาย)', 'ลูกค้าที่อยู่นอกพื้นที่แต่จะมารับยาที่ร้านเอง ให้เริ่มปรึกษาได้ไหม (ตอนนี้ไม่ได้ ตามคำเจ้าของ)'],
  prep(S) { const st = S.st.area || 'ask'; S.loc = st === 'out' || st === 'warn' ? 'out' : st === 'deny' ? 'deny' : 'ask'; S.locDenySeen = S.locWarnSeen = false; if (st === 'out') TP.setFlag('zoneLock', true); if (st === 'warn') TP.setFlag('zoneLock', false); },
  render(ctx) {
    const st = ctx.state, z = TP.locZone();
    const art = (icon, cls) => `<div class="st-off-art">${brand.halo(120, { still: true })}<span class="st-off-i ${cls || ''}">${ic(icon, 30, 1.8)}</span></div>`;
    if (st === 'out') {
      return ui.nav({ back: TP.canBack() }) + ui.page(`
        <div class="st-cen" data-in="0">${art('map-pin')}${ui.tag('นอกพื้นที่ให้บริการ', 'warn', { dot: true })}
          <h2 class="st-h1 c mt12">ตอนนี้ให้บริการเฉพาะพื้นที่ใกล้สาขา</h2>
          <p class="st-sub c">${esc(`ตำแหน่งของคุณ (${z?.loc.label || 'ไม่ทราบ'})${z?.km != null ? ` ห่าง${z.br.name} ${z.km} กม.` : ''} จึงยังเริ่มปรึกษาผ่านแอปไม่ได้ ร้านให้บริการเฉพาะที่ห่างสาขาไม่เกิน 15 กม. รวมในกรุงเทพ`)}</p></div>
        <div class="st-gap" data-in="1">${ui.note('<b>ถ้าอาการรุนแรง ไปโรงพยาบาลหรือโทร 1669 ทันที</b>', { tone: 'danger', icon: 'octagon-alert' })}<a class="btn danger-line sm mt8" style="display:inline-flex" href="tel:1669" data-a="call1669">${ic('phone', 20, 2)}<span>โทร 1669 สายด่วนฉุกเฉิน</span></a></div>
        ${areaCard(2)}
        ${ui.group(TP.callRows(), { title: 'ปรึกษาเภสัชกรทางโทรศัพท์ หรือที่ร้าน', din: 3 })}
        <p class="st-chk" id="arChk" role="status">ตรวจตำแหน่งล่าสุด ${TP.NOW.time}</p>`) +
        ui.dock(ui.btn('ตรวจตำแหน่งอีกครั้ง', { kind: 'secondary', icon: 'refresh-cw', a: 'arRecheck' }) + ui.btn('กลับหน้าแรก', { kind: 'ghost', a: 'goHome' }));
    }
    if (st === 'warn') {
      return ui.nav({ back: TP.canBack() }) + ui.page(`
        <div class="st-cen" data-in="0">${art('zap', 'muted')}${ui.tag('ส่งด่วนส่งไม่ถึง', 'warn', { dot: true })}
          <h2 class="st-h1 c mt12">ปรึกษาได้ แต่ส่งด่วนไปไม่ถึง</h2>
          <p class="st-sub c">${esc(`ตำแหน่งของคุณ (${z?.loc.label || 'ไม่ทราบ'})${z?.km != null ? ` ห่าง${z.br.name} ${z.km} กม.` : ''} ส่งด่วนส่งได้ไม่เกิน 15 กม. จากสาขา`)}</p></div>
        ${ui.group([ui.row({ icon: 'package', title: 'ส่งพัสดุ Flash หรือ DHL', sub: 'ถึงใน 1-3 วัน', chev: false }), ui.row({ icon: 'store', title: 'รับที่ร้าน', sub: TP.BRANCHES.map(b => b.name).join(' หรือ '), chev: false })], { title: 'ถ้าซื้อยา รับยาได้ทาง', din: 1 })}`) +
        ui.dock(ui.btn('แจ้งอาการต่อ', { a: 'arWarnGo' }) + ui.btn('กลับหน้าแรก', { kind: 'ghost', a: 'goHome' }));
    }
    if (st === 'deny') {
      return ui.nav({ back: TP.canBack() }) + ui.page(`
        <div class="st-cen" data-in="0">${art('map-pin', 'muted')}
          <h2 class="st-h1 c mt12">ไม่ได้เปิดตำแหน่ง ไม่เป็นไร</h2>
          <p class="st-sub c">ปรึกษาเภสัชกรได้ตามปกติ ถ้าต้องส่งยา ระบบตรวจที่อยู่จัดส่งอีกครั้งตอนชำระเงิน ส่งได้เฉพาะในพื้นที่ให้บริการ</p></div>
        ${areaCard(1)}`) +
        ui.dock(ui.btn('แจ้งอาการต่อ', { a: 'arGo' }) + ui.btn('เปิดตำแหน่ง', { kind: 'ghost', icon: 'map-pin', a: 'arAllow' }));
    }
    return ui.nav({ back: TP.canBack() }) + ui.page(`
      <div class="st-cen" data-in="0">${art('map-pin')}
        <h2 class="st-h1 c mt12">ขอใช้ตำแหน่งของคุณ</h2>
        <p class="st-sub c">เพื่อตรวจว่าคุณอยู่ในพื้นที่ให้บริการ และเลือกสาขาที่ใกล้ที่สุดให้ · ใช้ตอนเริ่มปรึกษาเท่านั้น ไม่ติดตามตำแหน่ง</p></div>
      ${areaCard(1)}`) +
      ui.dock(ui.btn('อนุญาตตำแหน่ง', { icon: 'map-pin', a: 'arAllow' }) + ui.btn('ไม่อนุญาต', { kind: 'ghost', a: 'arDeny' }));
  }
});
const areaNext = () => TP.go(TP.S.sysOff && TP.SCREENS.sysoff ? 'sysoff' : 'intake', { via: 'fade', replace: true });
TP.act('arAllow', () => {
  const S = TP.S; if (S.loc === 'ask' || S.loc === 'deny') S.loc = 'near';
  const g = TP.areaGate();
  if (!g) { TP.notify('อยู่ในพื้นที่ให้บริการ', { icon: 'circle-check' }); areaNext(); return; }
  S.st.area = g; TP.refresh();
});
TP.act('arDeny', () => { TP.S.loc = 'deny'; TP.S.st.area = 'deny'; TP.refresh(); });
TP.act('arGo', () => { TP.S.locDenySeen = true; areaNext(); });
TP.act('arWarnGo', () => { TP.S.locWarnSeen = true; areaNext(); });
TP.act('arRecheck', async t => {
  const el = TP.cur()?.el;
  if (!el || t.classList.contains('busy')) return;
  t.classList.add('busy'); t.setAttribute('aria-busy', 'true');
  await TP.wait(TP.RED() ? 80 : 900);
  if (TP.cur()?.el !== el) return;
  t.classList.remove('busy'); t.removeAttribute('aria-busy');
  if (!TP.areaGate()) { TP.notify('อยู่ในพื้นที่ให้บริการแล้ว', { icon: 'circle-check' }); areaNext(); return; }
  const c = $('#arChk', el); if (c) c.textContent = `ตรวจตำแหน่งล่าสุด ${TP.NOW.time} · ยังอยู่นอกพื้นที่`;
  TP.notify('ตำแหน่งยังอยู่นอกพื้นที่ให้บริการ', { icon: 'info' });
});

/* ---------- branch sheet (C03, A10 queue counts) ---------- */

/* =====================================================================
   Intake (C04): one screen, chips first, allergy prefilled not required
   ===================================================================== */
/* two relatives with the same first name show the full name, so the chips stay distinguishable */
TP.intakeReady = I => !!(I.symptoms.length || I.note.trim());
TP.urgentFor = p => TP.URGENT.filter(u => !/ต่ำกว่า 3 เดือน/.test(u) || (!!p?.child && (p.age ?? 99) < 1));
const who = S => { const f1 = n => n.split(' ')[0], dup = n => S.family.filter(g => f1(g.name) === f1(n)).length > 1; return [{ id: 'me', name: 'ตัวเอง', sub: '', ini: [...S.user.name][0] }, ...S.family.map(f => ({ id: f.id, name: dup(f.name) ? f.name : f1(f.name), sub: f.rel }))]; };
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
const intakePhotosHtml = I => {const images=intakePhotoItems(I);return `<div class="ik-photo-upload" role="group" aria-labelledby="ikPhotosLabel"><label class="f-l" id="ikPhotosLabel" for="ikPhotos">แนบรูปเพิ่มเติม</label><input id="ikPhotos" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden>${images.length<3?`<button type="button" class="ik-photo" data-a="addPhoto"><span class="ik-upload-icon">${ic('upload',24,1.8)}</span><span class="ik-upload-title">แตะเพื่อแนบรูปอาการหรือฉลากยา</span><span class="ik-upload-help">สูงสุด 3 รูป · JPG, PNG, WEBP<br>ไม่เกิน 5 MB ต่อรูป</span></button>`:''}${images.length?`<div class="ik-photo-grid" aria-label="รูปที่แนบ">${images.map((f,i)=>`<figure><img src="${esc(f.url)}" alt="รูปที่แนบ ${i+1}"><button type="button" class="ik-photo-remove" data-a="ikPhotoRemove" data-v="${i}" aria-label="ลบรูปที่ ${i+1}">${ic('x',16,2)}</button></figure>`).join('')}</div>`:''}<p id="ikPhotoError" class="err-t" role="alert" ${I.photoError?'':'hidden'}>${esc(I.photoError||'')}</p></div>`;};

TP.screen('intake', {
  group: 'before', title: 'แจ้งอาการ', code: 'C203', ref: 'C04', parent: 'home', cls:'intake-cover-screen', sb:'dark',
  states: [["normal", "ว่าง"], ["filled", "กรอกแล้ว"], ["other", "พิมพ์อาการเอง"], ["noallergy", "ยังไม่ระบุแพ้ยา"], ["fail", "เข้าคิวไม่สำเร็จ"], ["ack", "ติ๊กรับทราบแล้ว"], ["outzone", "ที่อยู่หลักนอกเขตส่งยา"], ["search", "ตัวเลือกอาการ 2 คอลัมน์"], ["urgent", "แจ้งเตือนอาการอันตราย"], ["multi", "เลือกหลายอาการ"], ["custom-error", "ยังไม่ได้เล่ารายละเอียด"], ["photos", "แนบรูป 3 รูป"], ["photo-error", "แนบไฟล์ไม่รองรับ"], ["cover", "ปกเล่าอาการและฟอร์มซ้อน"]],
  notes: ['C04: ตัวเลือก 2 คอลัมน์ มีช่องติ๊ก เลือกได้หลายอาการ ไม่มีช่องค้นหา',
    'ไม่มีอาการในรายการ: พิมพ์ในช่องรายละเอียดเพิ่มเติมใต้รายการอาการ', 'A11: แพ้ยาไม่บังคับ ดึงจากบัญชีมาให้ แก้ได้ในที่ · ไม่มีข้อมูล = "ยังไม่ได้ระบุ" ไม่ใช่ "ไม่แพ้"', 'อาการอันตราย: เข้าคิวต่อได้พร้อมธงด่วน (A7) จะถามตอนกดเข้าคิว ไม่ขัดตอนแตะชิป', 'ข้อมูลยังอยู่ในเครื่องจนกด "เข้าคิวปรึกษา"',
    'A2 (ประกาศ อย. ข้อ 2.1(3) "ก่อนการให้บริการ" = ทุกเคส): ติ๊ก รับทราบขั้นตอนและความเสี่ยง ก่อนกดเข้าคิว · ครั้งแรกเปิดข้อความเต็มให้อ่าน ครั้งต่อไปพับไว้ แตะเปิดอ่านได้ · ไม่ติ๊กแล้วกดเข้าคิว = พาไปที่ช่องติ๊ก บอกว่าต้องติ๊กก่อน · เก็บเวลาและเลขฉบับข้อความกับเคส ส่งให้คอนโซล (B8) · อ่านซ้ำได้ที่ C207 (C203.7)',
    'A1 (C203.8): ที่อยู่หลักอยู่นอกเขตส่งยา บอกก่อนเข้าคิวว่าถ้าต้องซื้อยา รับที่ร้านได้อย่างเดียว ปรึกษาได้ตามปกติ · ไม่บังคับเปลี่ยนที่อยู่'],
  wait: ['ข้อความขั้นตอนและความเสี่ยง (A2) ให้เภสัชกรและฝ่ายกฎหมายตรวจก่อนใช้จริง', 'ฝากคำถามตอนร้านปิด ต้องติ๊กรับทราบด้วยไหม (ต้นแบบยังไม่ให้ติ๊ก)', 'ปรึกษาใหม่ต่อจากเคสที่ระบบปิดเพราะเงียบ และย้ายคิวไปสาขาอื่น ใช้การรับทราบของเคสเดิมได้ไหม (ต้นแบบใช้ของเคสเดิม ไม่ถามซ้ำ)'],
  prep(S) {
    const st = S.st.intake;
    if (st) Object.assign(S.intake, { attachments:[], photoError:'', otherText:'', custom: [], otherOpen: false, ack: st === 'ack' || st === 'fail' });
    if (st) { S.addrs = TP.fresh().addrs; if (st === 'outzone') S.addrs = [{ ...TP.ZONE_ADDR, main: true }, ...S.addrs.map(a => ({ ...a, main: false }))]; }
    if (st === 'other') Object.assign(S.intake, { who: 'me', symptoms: ['ไข้', 'เวียนหัว'], custom: ['เวียนหัว'], otherOpen: true, otherText:'', note: 'เวียนหัวเมื่อเปลี่ยนท่า', urgent: [] });
    else if (st === 'filled' || st === 'fail' || st === 'ack' || st === 'outzone') Object.assign(S.intake, { who: 'me', symptoms: ['ไข้', 'เจ็บคอ'], note: 'เป็นมา 2 วัน กลืนแล้วเจ็บ', urgent: [] });
    
    else if (st) Object.assign(S.intake, { who: 'me', symptoms: [], note: '', urgent: [], photos: 0 });
    if(st==='photos')S.intake.attachments=['/assets/stores/pharmacy-thumbnail-v1.png','/assets/photos/pharmacist-v1.png','/assets/photos/customer-v1.png'].map(url=>({url,preview:true}));
    if(st==='photo-error'){S.intake.note='';S.intake.photoError='เลือกรูป JPG, PNG หรือ WEBP';S.intake.attachments=[];}
    if (st === 'multi') S.intake.symptoms=['น้ำมูก','คัดจมูก','เจ็บคอ'];
    if (st === 'custom-error') S.intake.note='';
    if (st === 'urgent') S.intake.urgent = [TP.urgentFor(TP.person(S.intake.who))[0]];
    if (st === 'noallergy') { S.user.allergyState = 'unknown'; S.user.allergies = []; } else if (st) { S.user.allergyState = 'set'; S.user.allergies = ['แอสไพริน']; }
  },
  render(ctx) {
    const S = ctx.S, I = S.intake;I.who='me';I.mode='chat';if(I.otherOpen&&I.otherText?.trim()){I.note=[I.note,I.otherText].filter(Boolean).join('\n');I.otherOpen=false;I.otherText='';}
    const p = TP.person('me'), b = TP.pickBranch();
    const alg = p.allergyState === 'none' ? 'ไม่มีประวัติแพ้ยา' : p.allergies?.length ? p.allergies.join(', ') + (p.allergySrc ? ' · ' + p.allergySrc : '') : 'ยังไม่ได้ระบุ';
    const meds = p.meds?.length ? p.meds.join(', ') : 'ยังไม่ได้ระบุ';
    const ready = TP.intakeReady(I), shut = S.storeOpen === false;
    const prev = TP.hist?.[TP.hist.length - 1]?.id;
    return `<div class="auth-form-scene ik-scene"><img class="auth-form-cover ik-cover" src="/assets/banners/intake-consultation-cover-v1.png" alt="" width="1536" height="1024"><button type="button" class="auth-form-back" data-back aria-label="ย้อนกลับ">${ic('arrow-left',22,2)}<span>กลับ</span></button><section class="auth-form-panel ik-form-panel" aria-labelledby="ikPageTitle">` + ui.page(`<header class="ik-intro"><h1 id="ikPageTitle">อยากปรึกษาเภสัชเรื่องอะไร</h1><p>บอกอาการหรือคำถามเรื่องยา ก่อนเริ่มคุยกับเภสัชกร</p></header>
      ${ctx.state === 'fail' ? ui.note('<b>ยังส่งข้อมูลไม่สำเร็จ</b><br>ข้อมูลยังอยู่ครบ ลองเข้าคิวอีกครั้งได้เลย', { tone: 'danger' }) : ''}
      ${shut ? ui.note('<b>ร้านปิดรับปรึกษาอยู่</b><br>คุณยังฝากคำถามให้เภสัชกรตอบเมื่อร้านเปิดได้', {tone:'warn',icon:'moon'}) : ''}
      <section class="ik-sec ik-block"><div class="ik-section-heading"><span>1</span><h3 class="ik-h">อาการที่ต้องการปรึกษา</h3></div><p class="ik-help">เลือกได้หลายข้อ หากไม่มีในรายการ เล่าเพิ่มเติมด้านล่าง</p>
        <div id="ikSymOptions">${ui.chips('sym', [...new Set([...TP.SYMPTOMS,...(I.custom || []),...I.symptoms])], I.symptoms, {a:'symChange',label:'เลือกอาการได้หลายข้อ'})}</div>

        <div class="ik-extra-fields">${ui.field({id:'ikNote',label:'รายละเอียดเพิ่มเติม',optional:true,textarea:true,rows:2,value:I.note,placeholder:'เช่น เริ่มเป็นเมื่อไร มีอะไรทำให้อาการดีขึ้นหรือแย่ลง',bind:'intake.note',a:'symChange'})}${intakePhotosHtml(I)}</div>
      </section>
      <section class="ik-sec ik-block ik-safety"><div class="ik-section-heading"><span>2</span><h3 class="ik-h">ตรวจอาการอันตราย</h3></div><p class="ik-help">ถ้ามีอาการต่อไปนี้ ให้เลือกไว้เพื่อแจ้งเภสัชกร</p>${ui.chips('urg',TP.urgentFor(p),I.urgent,{a:'symChange',label:'เลือกอาการอันตรายได้หลายข้อ'})}<div id="ikUrgentAlert" class="note danger ik-urgent-message" role="alert" ${I.urgent.length ? '' : 'hidden'}>${ic('triangle-alert',20,2)}<span><b>หากมีอาการเหล่านี้ ควรรับการดูแลทันที</b><br>ไปโรงพยาบาลหรือโทร <a href="tel:1669">1669</a> โดยไม่รอการตอบในแอป</span></div></section>
      <section class="ik-sec ik-block"><div class="ik-section-heading"><span>3</span><h3 class="ik-h">ข้อมูลก่อนปรึกษา</h3></div>
        ${p.allergyState !== 'none' && !p.allergies?.length ? ui.note('<b>ยังไม่ได้ระบุประวัติแพ้ยา</b><br>แจ้งเภสัชกรได้แม้จำชื่อยาไม่ได้', {tone:'warn',icon:'triangle-alert'}) : ''}
        <div class="group">${ui.row({icon:'triangle-alert',iconCls:p.allergies?.length?'danger':'',title:'ประวัติแพ้ยา',sub:alg,sheet:'allergy'})}${ui.row({icon:'pill',title:'ยาที่ใช้ประจำ',sub:meds,sheet:'allergy',p:{focus:'meds'}})}</div>

      </section>
      ${shut ? '' : ackHtml(S)}
      ${zoneNote(S, b)}`, {cls: 'ik-form-scroll'}) + `</section></div>` +
      ui.dock(shut ? ui.btn('ฝากคำถามถึงเภสัชกร', { go: 'offline', disabled: !ready, id: 'ikGo' }) : ui.btn('ปรึกษาเภสัช', { a: 'joinQueue', disabled: !ready || !I.ack, id: 'ikGo' }));
  },
  mount(el,ctx) {
    $('#ikAck',el)?.addEventListener('change',e=>TP.ACTS.ikAck(e.target));
    $('#ikPhotos',el)?.addEventListener('change',e=>{const files=Array.from(e.target.files||[]);e.target.value='';if(!files.length)return;const I=ctx.S.intake,error=TP.intakePhotoBatch(I,files);if(error){I.photoError=error;const message=$('#ikPhotoError',el);if(message){message.hidden=false;message.textContent=error;}return;}TP.refresh({anim:false});});
  }
});
TP.act('ikRemoveSym' , t => { TP.S.intake.symptoms = TP.S.intake.symptoms.filter(name=>name!==t.dataset.v); TP.refresh({anim:false}); });
TP.act('symOther', async () => { TP.S.intake.otherOpen = true; await TP.refresh({ anim: false }); setTimeout(() => $('#ikOtherIn', TP.cur()?.el)?.focus(), 40); });
TP.act('symOtherAdd', () => {
  const I = TP.S.intake, inp = $('#ikOtherIn', TP.cur().el), v = (inp?.value || '').replace(/\s+/g, ' ').trim();
  if (!v) { const error = $('#ikOtherError',TP.cur().el); if(error){error.hidden=false;error.textContent='พิมพ์อาการก่อนกดเพิ่ม';} inp?.setAttribute('aria-invalid','true'); inp?.focus(); return; }
  I.custom = I.custom || [];
  if (!TP.SYMPTOMS.includes(v) && !I.custom.includes(v)) I.custom.push(v);
  if (!I.symptoms.includes(v)) I.symptoms.push(v);
  I.otherOpen = false; TP.refresh({ anim: false });
});
TP.act('pickWho', t => { TP.S.intake.who = 'me'; TP.refresh({ anim: false }); });
TP.act('symChange', (t, ctx) => {
  const el = TP.cur().el, I = TP.S.intake;
  if(t?.dataset?.v==='__other'){I.otherOpen=t.getAttribute('aria-pressed')==='true';TP.refresh({anim:false}).then(()=>{if(I.otherOpen)$('#ikOtherIn',TP.cur()?.el)?.focus();});return;}
  I.symptoms = ui.chipVals(el, 'sym').filter(v=>v!=='__other'); I.urgent = ui.chipVals(el, 'urg');
  const alert = $('#ikUrgentAlert',el);if(alert)alert.hidden=!I.urgent.length;
  const ready = TP.intakeReady(I);
  const go = $('#ikGo', el); go.disabled = !ready || (TP.S.storeOpen !== false && !I.ack);
  dockNote(el);
});
/* A2: one tick per case, the full text opens by itself the first time; the tick, time and text version go with the case */
const ACK_NEED = 'กรุณารับทราบเงื่อนไขเข้ารับบริการก่อนปรึกษา';
/* real-user 21/10: the full text was too long to read before a consult; 3 key risks stay visible, the rest one tap away · the version stays in case.ack only */
const KEY_RISKS = ['เภสัชกรไม่ได้ตรวจร่างกายคุณ คำแนะนำมาจากสิ่งที่คุณเล่าและรูปที่ส่ง', 'อาการฉุกเฉิน ไปโรงพยาบาลหรือโทร 1669 ทันที ไม่ต้องรอคิว'];
const ackHtml = S => `<section class="ik-sec ik-ack" id="ikAckSec" aria-label="เงื่อนไขเข้ารับบริการ"><div class="ik-consent-box"><input type="checkbox" id="ikAck" aria-labelledby="ikAckLabel" ${S.intake.ack?'checked':''}><div class="ik-consent-copy"><label for="ikAck" id="ikAckLabel">ฉันได้อ่านและรับทราบเงื่อนไขและข้อจำกัดของการปรึกษาออนไลน์กับเภสัชกรแล้ว</label> <button type="button" class="reg-consent-link" data-sheet="serviceterms" aria-haspopup="dialog">อ่านเพิ่มเติม</button></div></div></section>`;
TP.sheetDef('serviceterms', {
  group:'before',title:'เงื่อนไขเข้ารับบริการ',code:'C215',host:'intake',hideClose:true,cls:'ik-terms-sheet',
  states:[['normal','อ่านเงื่อนไขบริการ']],
  notes:['อ่านขั้นตอน ความเสี่ยง และขอบเขตบริการจากข้อความฉบับเดียวกับการรับทราบก่อนปรึกษา','อ่านอย่างเดียว การเปิดหรือปิดแผ่นไม่เปลี่ยนสถานะรับทราบ'],
  render(){return TP.riskHtml();},
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
  if (!TP.zoneLock()) return `<div class="ik-zone" data-in="4">${ui.note(`<b>ปรึกษาได้ตามปกติ</b> ถ้าซื้อยา: ส่งพัสดุ (Flash หรือ DHL) หรือรับที่ร้าน${esc(b.name)} · ที่อยู่หลัก ${where} ห่างสาขาเกิน 15 กม. ส่งด่วนไม่ได้`, { icon: 'map-pin' })}</div>`;
  return `<div class="ik-zone" data-in="4">${ui.note(`<b>ปรึกษาได้ตามปกติ</b> ถ้าซื้อยา: รับที่ร้าน${esc(b.name)} · ที่อยู่หลัก ${where} อยู่นอกเขตส่งยา ส่งยาได้ถ้าเลือกที่อยู่ที่ห่างสาขาไม่เกิน 15 กม. ตอนชำระเงิน`, { icon: 'map-pin' })}</div>`;
}
TP.act('modeChange', t => { TP.S.intake.mode = t.dataset.v; const label = $('#ikModeLabel',TP.cur().el); if(label) label.textContent = 'ปรึกษาผ่าน' + (t.dataset.v === 'video' ? 'วิดีโอคอล' : 'การสนทนา'); const details = t.closest?.('.ik-mode-change'); if(details) details.open = false; const s = $('#ikModeHint', TP.cur().el); if (s) s.textContent = t.dataset.v === 'video' ? 'ไม่มีการบันทึกวิดีโอ · สลับเป็นแชทได้ตลอด' : 'ส่งรูปในแชทได้ · ขอวิดีโอคอลภายหลังได้'; });
TP.act('addPhoto',()=>{if(intakePhotoItems(TP.S.intake).length<3)$('#ikPhotos',TP.cur()?.el)?.click();});
TP.act('ikPhotoRemove',t=>{const I=TP.S.intake,items=intakePhotoItems(I),index=Number(t.dataset.v);if(!Number.isInteger(index)||index<0||index>=items.length)return;const [removed]=items.splice(index,1);if(removed.url?.startsWith('blob:'))URL.revokeObjectURL(removed.url);I.photos=items.length;I.photoError='';TP.refresh({anim:false});});
/* join: red flag -> consent -> notification ask -> queue */
TP.act('joinQueue', async t => {
  const S = TP.S;S.intake.mode='chat';
  if(!TP.intakeReady(S.intake))return;
  if (!S.intake.ack) {
    const sec = $('#ikAckSec', TP.cur()?.el), ck = $('#ikAck', sec || undefined); sec?.classList.add('err'); (ck || sec)?.scrollIntoView({ block: 'center', behavior: TP.RED() ? 'auto' : 'smooth' });
    if (ck) { ck.focus({ preventScroll: true }); ck.classList.remove('flash'); void ck.offsetWidth; ck.classList.add('flash'); }
    TP.live(ACK_NEED); TP.notify(ACK_NEED, { icon: 'info' }); return;
  }
  if (S.intake.urgent.length && !S._urgentOk) return TP.sheet('redflag');
  if (!S.consent && !S.user.name && TP.SCREENS.profile) return TP.go('profile', { via: 'cover', params: { phone: (S.user.phone || '').replace(/\D/g, '') } });
  if (TP.healthConsentNeeded(S) && TP.SCREENS.consents) return TP.go('consents', { via: 'cover', params: { then: 'join' } });
  if (!S.notifAsked) return TP.sheet('pushask');
  S._urgentOk = false; S.st.queue = undefined;
  t.classList.add('busy');
  await TP.wait(TP.RED() ? 50 : 650);
  TP.newCase();
  S.case.ack = { at: `${TP.NOW.date} ${TP.NOW.time}`, ver: TP.RISK.ver }; S.riskSeen = true; S.intake.ack = false;
  TP.go('queue', { via: 'morph', from: t, root: false, replace: true });
});
TP.resumeJoin = () => { const go = $('#ikGo', TP.cur()?.el); if (TP.cur()?.id === 'intake' && go) TP.ACTS.joinQueue(go); };

/* ---------- allergy + regular meds (edit in place) ---------- */
TP.sheetDef('allergy', {
  group: 'before', title: 'แพ้ยาและยาประจำ', code: 'C204', ref: 'C04', host: 'intake',
  notes: ['แก้ในที่ ไม่ต้องออกจากหน้าแจ้งอาการ · บันทึกกลับเข้าบัญชีของคนนั้น', '"ไม่มีประวัติแพ้ยา" ต้องกดยืนยันเอง ระบบไม่เดาให้'],
  render(ctx) {
    const p = TP.person(TP.S.intake.who);
    const al = p.allergies || [], md = p.meds || [];
    return `<p class="small" style="margin:0 4px 12px">${p.id === 'me' ? 'ข้อมูลของคุณเอง' : 'ข้อมูลของ ' + esc(p.name)}</p>
      <h3 class="ik-h">แพ้ยา</h3>
      <div class="chips" id="algList">${al.map(a => `<span class="chip" style="cursor:default">${esc(a)}<button type="button" class="chip-x" data-a="rmAlg" data-v="${esc(a)}" aria-label="ลบ ${esc(a)}">${ic('x', 14, 2.4)}</button></span>`).join('') || `<span class="small">${p.allergyState === 'none' ? 'ไม่มีประวัติแพ้ยา' : 'ยังไม่ได้ระบุ'}</span>`}</div>
      <div class="hrow mt12"><input class="input grow" id="algIn" placeholder="พิมพ์ชื่อยาที่แพ้" aria-label="ชื่อยาที่แพ้">${ui.btn('เพิ่ม', { kind: 'tint', sm: true, a: 'addAlg' })}</div>
      ${ui.check('ไม่มีประวัติแพ้ยา', { on: p.allergyState === 'none', a: 'noAlg' })}
      <h3 class="ik-h mt16">ยาที่ใช้ประจำ</h3>
      ${ui.field({ id: 'medIn', label: 'ชื่อยาที่ทานประจำ (หลายตัวใส่ , คั่น)', value: md.join(', '), placeholder: 'เช่น ยาความดัน ยาเบาหวาน', autofocus: ctx.params.focus === 'meds' })}`;
  },
  foot: () => ui.btn('บันทึก', { a: 'saveAlg' }),
  mount(el, ctx) { if (ctx.params.focus === 'meds') setTimeout(() => $('#medIn', el)?.focus(), 80); }
});
TP.act('addAlg', () => {
  const v = $('#algIn').value.trim(); if (!v) { A($('#algIn'), [{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { d: 260 }); return; }
  const p = TP.person(TP.S.intake.who), tgt = p.id === 'me' ? TP.S.user : TP.S.family.find(f => f.id === p.id);
  tgt.allergies = [...(tgt.allergies || []), v]; tgt.allergyState = 'set';
  TP.closeSheet({ instant: true }).then(() => TP.sheet('allergy'));
});
TP.act('rmAlg', t => { const p = TP.person(TP.S.intake.who), tgt = p.id === 'me' ? TP.S.user : TP.S.family.find(f => f.id === p.id); tgt.allergies = tgt.allergies.filter(a => a !== t.dataset.v); if (!tgt.allergies.length) tgt.allergyState = 'unknown'; TP.closeSheet({ instant: true }).then(() => TP.sheet('allergy')); });
TP.act('noAlg', t => { const p = TP.person(TP.S.intake.who), tgt = p.id === 'me' ? TP.S.user : TP.S.family.find(f => f.id === p.id); if (t.getAttribute('aria-checked') === 'true') { tgt.allergies = []; tgt.allergyState = 'none'; const l = document.getElementById('algList'); if (l) l.innerHTML = ''; } else tgt.allergyState = 'unknown'; });
TP.act('saveAlg', () => {
  const p = TP.person(TP.S.intake.who), tgt = p.id === 'me' ? TP.S.user : TP.S.family.find(f => f.id === p.id);
  tgt.meds = $('#medIn').value.split(',').map(s => s.trim()).filter(Boolean);
  TP.closeSheet().then(() => { TP.refresh({ anim: false }); TP.notify('บันทึกแล้ว'); });
});

/* ---------- red flag (C05 / A7: continue with urgent flag allowed) ---------- */
TP.sheetDef('redflag', {
  group: 'before', title: 'อาการที่ควรไปโรงพยาบาล', code: 'C205', ref: 'C05', host: 'intake', cls: 'rf',
  prep(S) { if (!S.intake.urgent.length) S.intake.urgent = ['หายใจลำบาก']; },
  notes: ['ขึ้นตอนกดเข้าคิว ไม่ขัดจังหวะตอนแตะชิป', 'ปุ่มโทร 1669 อยู่ที่จอนี้ (ไม่อยู่หน้าแรก ตาม A8) · ไม่มีปุ่มโรงพยาบาลใกล้ฉัน (เจ้าของตัดออก 19/10/2026)', 'คงธงอาการอันตรายส่งให้เภสัชกร ปุ่มปรึกษาเป็น outline แยกจากการโทรฉุกเฉิน ไม่รับรองว่าจะได้รับบริการก่อน'],
  wait: ['รายการอาการรุนแรงจริงจากเภสัชกร (ตอนนี้เป็นรายการตัวอย่าง)'],
  render(ctx) {
    const u = TP.S.intake.urgent;
    return `<div class="rf-content"><section class="rf-symptoms" aria-labelledby="rfSymptomsLabel"><p id="rfSymptomsLabel">อาการที่คุณเลือก</p><ul>${u.map(sym=>`<li>${esc(sym)}</li>`).join('')}</ul></section>
      <div class="rf-message" role="alert"><div class="rf-advice">${ic('triangle-alert',24,2)}<div><h3>ควรรับการดูแลทันที</h3><p>ไปโรงพยาบาลหรือโทร 1669<br>อย่ารอการตอบในแอป</p></div></div>
      <a class="btn danger" href="tel:1669" data-a="call1669">${ic('phone',20,2)}<span>โทร 1669 สายด่วนฉุกเฉิน</span></a></div></div><div class="rf-confirm">${ui.btn('ยืนยันปรึกษาเภสัช', { kind: 'secondary', a: 'urgentGo' })}</div>`;
  }
});
TP.act('call1669', (t, c, e) => { e.preventDefault(); TP.notify('กำลังโทร 1669', { icon: 'phone' }); });

TP.act('urgentGo', async () => { TP.S._urgentOk = true; await TP.closeSheet(); TP.resumeJoin(); });

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
  const c = C(); if (!c || TP.cur()?.id === 'home') return null;
  const b = TP.branch(c.branch);
  if (c.idle && c.status !== 'closed') return { icon:'reply', title: 'เภสัชกรรอคำตอบอยู่', sub: 'ไม่ตอบใน 2 นาที การปรึกษาจะปิด', go: 'room', cta: 'กลับไปตอบ' };
  if (c.order?.status === 'pending') return { icon:'payment', title: 'รายการยารอชำระ', sub: `เหลือเวลาชำระ ${TP.orderRemaining?.(c.order)||'15:00'}`, orderCase:c.id, go: 'room', cta: 'ชำระเงิน' };
  if (c.status === 'matched') return {icon:'chat',title:'เภสัชกรรับคิวแล้ว',sub:`${ph().short} · ${b.short}`,go:'room',cta:'เข้าห้องปรึกษา'};
  if (c.status === 'queue') return { icon:'waiting', title: c.pos <= 1 ? 'คุณเป็นคิวถัดไป' : `รออีก ${c.pos-1} คิว`, sub: b.name, go: 'queue', cta: 'กลับเข้าแชท' };
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
const qDanger = () => `<div class="note danger q-dg" role="alert" data-in="4">${ic('octagon-alert', 18, 2)}<div><b>คุณแจ้งอาการรุนแรงไว้</b><p class="mt8">ถ้าแย่ลงระหว่างรอ ไม่ต้องรอเภสัชกร ไปโรงพยาบาลทันที</p></div></div>`;
TP.act('qNotifOn', () => { TP.S.notif = true; TP.notify('เปิดการแจ้งเตือนแล้ว', { icon: 'bell' }); TP.refresh({ anim: false }); });
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
  group:'before',title:'ห้องแชท · รอเภสัชกร',code:'C207',ref:'C08',parent:'home',
  states:[['q2','รออีก 1 คิว'],['q1','คิวถัดไป'],['paused','เภสัชกรพัก'],['urgent','มีธงด่วน'],['notifoff','ปิดการแจ้งเตือนไว้'],['refined','รอในห้องแชท'],['q4','รออีก 3 คิว'],['message','พิมพ์ข้อมูลระหว่างรอ'],['joined','เภสัชกรพร้อมให้บริการ'],['offline','อินเทอร์เน็ตขาดระหว่างรอ']],
  notes:['เข้าห้องแชททันทีหลังแจ้งอาการ พิมพ์ข้อมูลไว้ระหว่างรอได้ เภสัชกรยังไม่ได้อ่านข้อความจนรับเคส','แถบบนแสดงคิวปัจจุบันและข้อความระบบบอกเมื่อคิวขยับ ไม่ประมาณเวลารอ','ย่อห้องแล้วกลับมาได้ คิว ข้อความ และร่างข้อความยังอยู่','เมื่อรับเคสแสดงบัตรเภสัชกรพร้อมให้บริการในห้องเดิม เปิดวิดีโอคอลหลังรับเคสเท่านั้น'],
  prep(S){const st=S.st.queue||'q2',c=ensureCase(st==='paused'?'paused':'queue');c.pos=st==='q1'?1:st==='q4'?4:2;c.msgs=[];c.draft='';c.order=null;c.idle=null;c.urgent=st==='urgent'?['หายใจลำบาก']:[];S.netOff=st==='offline';S.notif=st!=='notifoff';if(st==='message'){c.msgs=[{who:'sys',kind:'waiting',text:'ส่งข้อมูลเบื้องต้นแล้ว คุณสามารถพิมพ์อาการเพิ่มเติมไว้ระหว่างรอเภสัชกรได้'},{who:'me',kind:'intake'},{who:'me',text:'เจ็บคอตั้งแต่เมื่อวาน และมีไอเล็กน้อยค่ะ',time:TP.NOW.time}];}if(st==='joined'){c.status='room';c.waitedInChat=true;}},
  render(ctx){return TP.SCREENS.room.render(ctx);},
  mount(el,ctx){TP.SCREENS.room.mount(el,ctx);}
});
TP.act('queueMin', () => TP.go('home', {via:'uncover',root:true}));

TP.sheetDef('cancelq', {
  group: 'before', title: 'ยกเลิกคิวไหม', code: 'C208', ref: 'C08', host: 'queue',
  render: () => `<p class="body">ถ้ายกเลิก ข้อมูลอาการที่ส่งไปจะถูกปิดไว้กับเคสนี้ และต้องเข้าคิวใหม่ถ้าต้องการคุยอีกครั้ง</p>`,
  foot: () => ui.btn('ยกเลิกคิว', { kind: 'danger', a: 'cancelQueue' }) + ui.btn('รอต่อ', { kind: 'ghost', closeSheet: true })
});
TP.act('cancelQueue', async () => { TP.S.case.status = 'cancelled'; TP.emit('state'); await TP.closeSheet(); TP.go('home', { via: 'uncover', root: true }); TP.notify('ยกเลิกคิวแล้ว', { icon: 'x' }); });

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
    c.waitedInChat=true;c.status='room';c.pos=0;TP.emit('state');
    if(['queue','room'].includes(TP.cur()?.id)&&!TP.sheetOpen()){
      await TP.go('room',{via:'fade',replace:true});
      TP.live('เภสัชกรเข้าห้องและพร้อมให้บริการแล้ว');
    }else{
      if(TP.cur()?.id==='home'&&!TP.sheetOpen())TP.refresh({anim:false});
      TP.mini(false);TP.banner({title:'เภสัชกรพร้อมให้บริการแล้ว',body:'แตะเพื่อกลับเข้าห้องแชท',go:'room'});
    }
  },
  pause(on = true) {
    const c = C(); if (!c) return; c.status = on ? 'paused' : 'queue'; TP.emit('state');
    TP.queueChatUpdate?.(on?'เภสัชกรพักชั่วคราว คิวของคุณยังอยู่':'เภสัชกรกลับมารับคิวแล้ว');if(['queue','room'].includes(TP.cur()?.id))TP.refresh({anim:false});else{if(TP.cur()?.id==='home')TP.refresh({anim:false});TP.mini(false);}
  },
  closeBranch() {
    const c = C(); if (!c) return; c.status = 'branchclosed'; TP.emit('state');
    if (['queue', 'room', 'matched'].includes(TP.cur()?.id)) TP.go('queueclosed', { via: 'fade', replace: true });
    else TP.banner({ title: 'สาขาปิดรับปรึกษาแล้ว', body: 'แตะเพื่อดูทางเลือก', go: 'queueclosed' });
  },
  decline() {
    const c = C(); if (!c) return; c.status = 'declined'; TP.emit('state');
    if (['queue', 'room', 'matched'].includes(TP.cur()?.id)) TP.go('declined', { via: 'fade', replace: true });
    else TP.banner({ title: 'เภสัชกรตอบกลับเคสของคุณ', body: 'แตะเพื่ออ่าน', go: 'declined' });
  },
  lock() { const c = ensureCase('matched'); TP.emit('state'); TP.go('lock', { via: 'fade' }); }
};
TP.simAction({ id: 'next', label: 'คิวขยับ', when: S => S.case?.status === 'queue' && S.case.pos > 1, run: () => TP.sim.next() });
TP.simAction({ id: 'accept', label: 'รับคิว', when: S => ['queue', 'paused'].includes(S.case?.status), run: () => TP.sim.accept() });
TP.simAction({ id: 'pause', label: 'พักรับเคส', when: S => S.case?.status === 'queue', run: () => TP.sim.pause(true) });
TP.simAction({ id: 'resume', label: 'กลับมารับเคส', when: S => S.case?.status === 'paused', run: () => TP.sim.pause(false) });
TP.simAction({ id: 'closeBr', label: 'ปิดรับเคสสาขา', when: S => ['queue', 'paused'].includes(S.case?.status), run: () => TP.sim.closeBranch() });
TP.simAction({ id: 'expire', label: 'รอครบ 30 นาที (ปิดอัตโนมัติ)', when: S => ['queue', 'paused'].includes(S.case?.status), run: () => { const c = C(); c.status = 'expired'; TP.emit('state'); if (['queue','room'].includes(TP.cur()?.id)) TP.go('expired', { via: 'fade', replace: true }); else TP.banner({ title: 'คิวของคุณปิดอัตโนมัติ', body: 'แตะเพื่อดูทางเลือก', go: 'expired' }); } });
TP.simAction({ id: 'storeShut', label: 'ร้านปิดระหว่างรอคิว', when: S => ['queue', 'paused'].includes(S.case?.status), run: () => { TP.S.st.queueclosed = 'store'; TP.setFlag('storeOpen', false); TP.sim.closeBranch(); } });
TP.simAction({ id: 'ofReply', label: 'เภสัชกรตอบคำถามที่ฝากไว้ (เช้า)', when: S => !!S.ofPending, run: () => {
  const S = TP.S, o = S.ofPending; S.ofPending = null; TP.setFlag('storeOpen', true);
  Object.assign(S.intake, { who: o.who, symptoms: [], note: o.q }); TP.newCase(); const c = C(); c.status = 'room'; c.pos = 0;
  c.day0 = 'เมื่อวาน'; c.fromOf = true; c.hh = 9;
  const k = TP.casePlan(c), nm = TP.PHARM[c.pharm || 'kj'].short.replace(/^ภ[ญก]\./, '');
  c.msgs = [{ who: 'sys', text: `ฝากคำถามไว้ ${o.at}` }, { kind: 'intake', time: o.at }, { who: 'sys', text: 'วันนี้' },
    { who: 'ph', text: `สวัสดีค่ะ ดิฉันเภสัชกร${nm} อ่านคำถามที่ฝากไว้เมื่อคืนแล้วค่ะ ${k.dx}`, time: '09:05' },
    { who: 'ph', text: `ตอนนี้อาการเป็นอย่างไรบ้างคะ${k.items.length ? ' ถ้ายังมีอาการ ดิฉันจัดยาให้ได้เลยค่ะ' : ''}`, time: '09:06' }];
  c.quick = ['ยังมีอาการอยู่', 'ดีขึ้นแล้ว']; c.hold = true;
  c.step = TP.roomScript(c).findIndex(m => m.wait) + 1;
  S.inbox.unshift({ id: 'ofr' + Date.now(), kind: 'msg', title: 'เภสัชกรตอบคำถามที่คุณฝากไว้', body: 'แตะเพื่อคุยต่อ', time: TP.NOW.date + ' 09:05', read: false, go: 'room' });
  TP.emit('state'); TP.banner({ title: 'เภสัชกรตอบคำถามที่คุณฝากไว้', body: 'แตะเพื่อคุยต่อ', go: 'room' });
  if (TP.cur()?.id === 'home' && !TP.sheetOpen()) TP.refresh({ anim: false });
} });
TP.simAction({ id: 'decline', label: 'ไม่รับเคส', when: S => ['queue', 'paused', 'matched'].includes(S.case?.status), run: () => TP.sim.decline() });
TP.simAction({ id: 'lock', label: 'รับคิวตอนจอล็อก', when: S => ['queue', 'paused'].includes(S.case?.status), run: () => TP.sim.lock() });

/* =====================================================================
   Lock screen notification (ใหม่)
   ===================================================================== */
TP.screen('lock', {
  group: 'during', title: 'แจ้งเตือนบนจอล็อก', code: 'C301', cls: 'dark lock-scr', sb: 'light',
  states: [['accept', 'รับคิว'], ['msg', 'ข้อความใหม่'], ['order', 'รายการยา'], ['payexp', 'รายการใกล้หมดเวลา'], ['paused', 'เภสัชกรพัก'], ['summary', 'ใบสรุป'], ['adr', 'ตอบเรื่องอาการหลังใช้ยา'], ['fudose', 'เตือนกินยา'], ['fucheck', 'ถามอาการระหว่างใช้ยา']],
  notes: ['แอปส่งแจ้งเตือนแทน LINE OA: รับคิว · ข้อความใหม่ · รายการยา · ใบสรุป · ตอบเรื่องอาการหลังใช้ยา', 'ข้อความกลาง ๆ ไม่มีอาการ ชื่อยา ข้อความแชท หรือยอดเงิน (PDPA, A15)', 'ข้อมูลที่ผ่าน Apple/Google มีแค่ชนิดเหตุการณ์ (อยู่ในย่อหน้า C1)'],
  prep(S) {
    const st = S.st.lock || 'accept';
    if (['order', 'payexp', 'msg'].includes(st) && TP.SCREENS.room) { S.st.room = 'order'; TP.SCREENS.room.prep(S); S.st.room = undefined; }
    else ensureCase(st === 'paused' ? 'paused' : 'matched');
  },
  render(ctx) {
    const m = { accept: ['เภสัชกรรับคิวของคุณแล้ว', 'แตะเพื่อเข้าห้องปรึกษา', 'matched'], msg: ['มีข้อความใหม่จากเภสัชกร', 'แตะเพื่ออ่าน', 'room'], order: ['รายการยาพร้อมให้ชำระ', 'แตะเพื่อดูรายการ', 'room'], payexp: ['รายการยาใกล้หมดเวลาชำระ', 'ชำระได้อีก 15 นาที แตะเพื่อดู', 'room'], paused: ['เภสัชกรพักชั่วคราว', 'คิวของคุณยังอยู่ ไม่เสียคิว', 'queue'], summary: ['ใบสรุปการปรึกษาพร้อมแล้ว', 'แตะเพื่อเปิดดู', 'summary'], adr: ['เภสัชกรตอบเรื่องที่คุณแจ้งแล้ว', 'แตะเพื่ออ่าน', 'adrsent'], ...(TP.FOLLOW_LOCK || {}) }[ctx.state] || [];
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

/* =====================================================================
   Matched (C09): who you are about to talk to
   ===================================================================== */
TP.screen('matched', {
  group: 'during', title: 'เภสัชกรรับคิว', code: 'C302', ref: 'C09', parent: 'home',
  states: [['chat', 'ขอแชท'], ['video', 'ขอวิดีโอ']],
  notes: ['ป้ายชื่อ + เลขใบอนุญาตอยู่บนการ์ด พร้อมลิงก์ตรวจสอบ (กฎ อย. ข้อ 2.1)', 'บอกชัดว่ากล้องและไมค์ของคุณปิดอยู่ จนกว่าจะกดเริ่มวิดีโอเอง', 'A3 (20/10): บัตรเดียวกับ C207 รูปจากกล้องร้านตอนเข้ากะ ยืนยันตัวตนเมื่อ 08:55 ใบอนุญาตร้านของสาขานี้ ปุ่มตรวจใบอนุญาตร้าน',
    '21/10 เจ้าของ "ในรูปให้แสดงรูปเภสัชด้วย ไป copy มาจาก website สภาเภสัชก่อนเอามาใส่ในวงกลมๆ": วงกลมใช้รูปของ ภญ.ขวัญใจ จากหน้าตรวจสอบของสภาเภสัชกรรม (เลข 45279 รูปมีลายน้ำของสภาฯ) · ภก.ธัชพล สภาฯ ไม่มีรูป ใช้ตัวย่อชื่อ · ปุ่มเปลี่ยนชื่อเป็น ตรวจสอบใบประกอบเภสัชกร และ ตรวจสอบใบอนุญาตร้าน · บัตรเดียวกันจึงเปลี่ยนที่ C207 และ C306.2 ด้วย'],
  wait: ['ทำตอนสร้างจริง: รูปในวงกลมเป็นรูปที่กล้องร้านถ่ายตอนเข้ากะ (คอนโซล S102) ไม่ใช้รูปจากเว็บสภาฯ ที่มีลายน้ำ · ขอความยินยอมเภสัชกรก่อนโชว์รูป'],
  prep(S) { const c = ensureCase('matched'); c.mode = S.st.matched === 'video' ? 'video' : (S.st.matched ? 'chat' : c.mode); },
  render(ctx) {
    const c = ensureCase(null), b = TP.branch(c.branch), p = TP.PHARM[c.pharm];
    if (c.status === 'queue' || c.status === 'paused') c.status = 'matched';
    return ui.nav({ left: `<button type="button" class="back" data-a="queueMin">${ic('chevron-down', 24, 2.2)}<span>ย่อไว้</span></button>` }) + ui.page(`
      <div class="mt-top" data-in="0">${brand.halo(92, { check: true, draw: true, cls: 'mt-seal' })}<h2 class="h2">${esc(p.short)} รับคิวของคุณแล้ว</h2><p class="small">${esc(b.name)} · เลขเคส ${esc(c.id)}</p></div>
      ${TP.passHtml(p, b, { label: 'เภสัชกรที่ดูแลคุณ', din: 1 })}
      <div class="mt16">${ui.note('เริ่มปรึกษาผ่านแชท ส่งรูปได้ หากต้องดูอาการเพิ่มเติม เภสัชกรจะส่งคำขอวิดีโอคอลในห้องนี้',{icon:'message-circle',din:2})}</div>`) + ui.dock(ui.btn('เข้าห้องปรึกษา',{icon:'message-circle',a:'enterRoom'}));
  }
});
TP.act('enterRoom', () => { C().status = 'room'; TP.emit('state'); TP.go('room', { via: 'push', replace: true }); });
TP.act('startVideo', () => {
  const c=C();if(!c||c.status!=='room'||(!TP.S.call&&!c.msgs?.some(m=>m.kind==='video-request'&&m.status==='accepted')))return;
  TP.emit('state');return TP.go(TP.S.camDenied?'nocam':'video',{via:'zoom',replace:true});
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
  c.msgs.push({kind:'video-request',id:String(request.id),status:'pending',time:now()});TP.emit('state');
  if(TP.cur()?.id==='room')return TP.refresh({anim:false});
  TP.banner({icon:'video',title:'เภสัชกรขอวิดีโอคอล',body:'เปิดแชทเพื่อดูคำขอ',go:'room'});
};
TP.simAction({id:'requestVideo',label:'เภสัชกรขอวิดีโอคอล',when:S=>S.case?.status==='room'&&!S.call&&!S.case.msgs?.some(m=>m.kind==='video-request'&&['pending','accepted'].includes(m.status)),run:()=>TP.receiveVideoRequest({id:'video-'+Date.now()})});
TP.simAction({id:'withdrawVideo',label:'ถอนคำขอวิดีโอคอล',when:S=>S.case?.msgs?.some(m=>m.kind==='video-request'&&m.status==='pending'),run:()=>{const c=C();c.msgs.filter(m=>m.kind==='video-request'&&m.status==='pending').forEach(m=>m.status='withdrawn');TP.emit('state');TP.refresh({anim:false});}});

/* =====================================================================
   Edge: branch closed (A9), expired, offline question, declined
   ===================================================================== */
TP.screen('queueclosed', {
  group: 'edge', title: 'สาขาปิดรับปรึกษา', code: 'C603', ref: 'A9', parent: 'home',
  states: [['branch', 'สาขาปิดรับก่อนเวลา'], ['store', 'ร้านปิด']],
  notes: ['A9: ปิดรับ/ร้านปิด = ยกเลิกคิวพร้อมเหตุผล + ปุ่มย้ายไปสาขาที่เปิด / ฝากคำถาม', 'ย้ายสาขา = ใช้ข้อมูลอาการเดิม ไม่ต้องกรอกใหม่'],
  prep(S) { ensureCase('branchclosed'); S.branchState.on = S.st.queueclosed === 'store' ? 'closed' : 'open'; },
  render(ctx) {
    const c = C() || ensureCase('branchclosed'), b = TP.branch(c.branch), store = ctx.state === 'store';
    const other = TP.BRANCHES.find(x => x.id !== c.branch && TP.S.branchState[x.id] !== 'closed');
    return ui.nav({ close: true }) + ui.page(`<div class="ec-top" data-in="0">${brand.halo(96, { still: true, icon: 'store' })}<h2 class="h2">${store ? 'ร้านปิดแล้ว คิวนี้จึงถูกยกเลิก' : `${esc(b.name)} ปิดรับปรึกษาแล้ว`}</h2>
        <p class="body">${store ? 'ร้านปิดเวลา 21:00 เภสัชกรยังไม่ได้รับคิวของคุณ' : 'เภสัชกรต้องดูแลลูกค้าหน้าร้าน จึงปิดรับปรึกษาก่อนเวลา'} ข้อมูลอาการของคุณยังอยู่ ไม่ต้องกรอกใหม่</p></div>
      <div class="gap8 mt24">${!store && other ? `<button type="button" class="opt" data-a="moveBranch" data-v="${other.id}" data-in="1"><span class="r-ic" style="width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--brand-tint);color:var(--brand)">${ic('map-pin', 20, 1.9)}</span><span class="tx"><b>ย้ายไป${esc(other.name)}</b><span>${other.km} กม. · คิวรอ ${TP.S.queueLen[other.id]} คน · ${TP.S.branchState[other.id] === 'pause' ? 'พักชั่วคราว รอได้' : 'เปิดรับ'}</span></span>${ic('chevron-right', 18, 2)}</button>` : ''}
      <button type="button" class="opt" data-go="offline" data-in="2"><span class="r-ic" style="width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--brand-tint);color:var(--brand)">${ic('message-square-text', 20, 1.9)}</span><span class="tx"><b>ฝากคำถามถึงเภสัชกร</b><span>เภสัชกรตอบ${TP.OF_REPLY} · แจ้งเตือนในแอป</span></span>${ic('chevron-right', 18, 2)}</button></div><div class="mt24">${ui.callHelp({ din: 4 })}</div>`) +
      ui.dock(ui.btn('กลับหน้าแรก', { kind: 'secondary', a: 'goHome' }));
  }
});
TP.act('goHome', () => TP.go('home', { via: 'fade', root: true }));
TP.act('moveBranch', t => { TP.S.st.queue = undefined; TP.S.branch = t.dataset.v; TP.S.branchPicked = true; const old = C(); TP.newCase(); Object.assign(C(), { symptoms: old.symptoms, note: old.note, who: old.who, mode: old.mode, ack: old.ack }); TP.go('queue', { via: 'fade', replace: true }); TP.notify('ย้ายคิวไป' + TP.branch().name, { icon: 'map-pin' }); });

TP.screen('expired', {
  group: 'edge', title: 'คิวหมดเวลา', code: 'C604', ref: 'C08', parent: 'home',
  notes: ['อาการไม่หาย เข้าคิวใหม่ได้ทันที ด้วยข้อมูลเดิม'], wait: ['กฎ 30 นาที ใช้ตอนรอคิวด้วยไหม · ตอนนี้แสดงเป็นตัวอย่าง'],
  prep() { ensureCase('expired'); },
  render: () => ui.nav({ close: true }) + ui.page(`<div class="ec-top" data-in="0">${brand.halo(96, { still: true, icon: 'clock' })}<h2 class="h2">คิวนี้ปิดอัตโนมัติแล้ว</h2><p class="body">รอนานเกิน 30 นาทีโดยยังไม่มีเภสัชกรว่าง ขออภัยที่ให้รอ ถ้ายังมีอาการ เข้าคิวใหม่ได้ทันทีด้วยข้อมูลเดิม</p></div><div class="mt24">${ui.callHelp({ din: 4 })}</div>`) +
    ui.dock(ui.btn('เข้าคิวใหม่', { a: 'requeue' }) + ui.btn('ฝากคำถามแทน', { kind: 'ghost', go: 'offline' }))
});
TP.act('requeue', () => { TP.S.st.queue = undefined; const old = C(); TP.newCase(); if (old) Object.assign(C(), { symptoms: old.symptoms, note: old.note, who: old.who, ack: old.ack }); TP.go('queue', { via: 'fade', replace: true }); });

TP.screen('offline', {
  group: 'edge', title: 'นอกเวลา: ฝากคำถาม', code: 'C605', parent: 'home',
  states: [["form", "ฝากคำถาม"], ["sent", "ส่งแล้ว"]],
  notes: ['ของเดิม (กล่องรับเรื่องฝั่งเภสัชกร) · ตอบแล้วแจ้งเตือนในแอป', 'อาการอันตราย = ไม่ให้รอถึงพรุ่งนี้ กล่องแดง 1669 ขึ้นทันที', 'เวลาร้าน 09:00-21:00 แยกจากฝ่ายบริการลูกค้า 10:00-18:00 · เบอร์ที่ปิดอยู่ติดป้ายบอก',
    'เจ้าของเคาะ 20/10 ข้อ 70 "12.00 ดีกว่า": คำถามที่ฝากตอนร้านปิด เภสัชกรตอบภายใน 12:00 ของวันที่ร้านเปิด · ใช้ข้อความเดียวกันทุกจอ (หน้าแรก ประวัติ ฝากคำถาม แจ้งเตือน ห้องปรึกษา ช่วยเหลือ) · อาการอันตรายยังบอกให้ไปโรงพยาบาลทันที ไม่รอ · ตรงกับคอนโซล S203'],
  prep(S) { const st = S.st.offline; S.storeOpen = false; S.ofSent = st === 'sent'; S.ofWho = 'me'; S.ofUrg = []; },
  render(ctx) {
    const S = TP.S;
    if (S.ofSent) return ui.nav({ close: true }) + ui.page(`<div class="ec-top" data-in="0">${brand.halo(104, { check: true, draw: true })}<h2 class="h2">ส่งคำถามแล้ว</h2><p class="body">เภสัชกรจะตอบ${S.sysOff ? 'เมื่อระบบกลับมาเปิด' : S.storeOpen ? 'เมื่อว่าง' : TP.OF_REPLY} ${S.notif === false ? `คุณปิดการแจ้งเตือนไว้ เข้ามาดูคำตอบในแอป${S.storeOpen ? 'ภายหลัง' : 'หลัง 12:00'}` : 'เราจะแจ้งเตือนในแอปเมื่อมีคำตอบ'} ถ้าอาการแย่ลงก่อนหน้านั้น ให้ไปโรงพยาบาลทันที</p>${S.notif === false ? `<button type="button" class="btn tint sm mt12" data-a="qNotifOn">${ic('bell', 18, 2)}<span>เปิดการแจ้งเตือน</span></button>` : ''}</div><div class="mt24">${ui.callHelp({ din: 4 })}</div>`) + ui.dock(ui.btn('กลับหน้าแรก', { a: 'goHome' }));
    const I = S.intake;
    const wsel = S.ofWho = 'me', pp = TP.person(wsel), urg = S.ofUrg || [];
    return ui.nav({ back: true, title: 'ฝากคำถาม' }) + ui.page(`${S.sysOff ? ui.note('ปิดรับปรึกษาผ่านแอปชั่วคราว · ฝากคำถามไว้ เภสัชกรจะตอบในแอปเมื่อระบบกลับมาเปิด', { icon: 'circle-pause', din: 1 }) : S.storeOpen ? ui.note('ตอนนี้สาขานี้ยังรับเคสไม่ได้ · ฝากคำถามไว้ เภสัชกรจะตอบในแอปเมื่อว่าง', { icon: 'clock', din: 1 }) : ui.note(`ร้านปิดอยู่ เปิดอีกครั้ง <b>09:00</b> · เภสัชกรจะตอบ${TP.OF_REPLY}`, { icon: 'moon', din: 1 })}
      <section class="ik-sec" data-in="3"><h3 class="ik-h">มีอาการอันตรายเหล่านี้ไหม <span class="ik-hint">ถ้าไม่มี ข้ามได้</span></h3>
        ${ui.chips('ofurg', TP.urgentFor ? TP.urgentFor(TP.person(S.ofWho || 'me')) : TP.URGENT, urg, { red: true, a: 'ofUrg', label: 'อาการอันตราย' })}
        <div id="ofDanger">${urg.length ? ofDanger() : ''}</div>
      </section>
      <div class="gap16 mt16" data-in="4">${ui.field({ id: 'ofQ', label: 'คำถามของคุณ', textarea: true, rows: 4, value: [I.symptoms.join(', '), I.note, I.otherOpen?I.otherText:''].filter(Boolean).join(' · '), placeholder: 'เช่น ยาที่กินอยู่กินคู่กับยาแก้แพ้ได้ไหม' })}
      <button type="button" class="ik-photo" data-a="ofPhoto">${ic('camera', 19, 1.9)}<span>แนบรูป เช่น ฉลากยา</span></button></div>
      <div class="mt24">${ui.callHelp({ din: 5 })}</div>`, { lt: 'ฝากคำถาม' }) + ui.dock(ui.btn('ส่งคำถาม', { a: 'ofSend' }));
  },
  leave() {
    const S = TP.S; if (!S.ofSent) return;
    Object.assign(S, { ofSent: false, ofWho: 'me', ofUrg: [] });
    Object.assign(S.intake, { who: 'me', symptoms: [], custom: [], otherOpen: false, urgent: [], note: '', photos: 0, attachments: [] });
  }
});
const ofDanger = () => `<div class="note danger mt12" role="alert">${ic('octagon-alert', 18, 2)}<div><b>อาการแบบนี้ไม่ควรรอถึงพรุ่งนี้</b><p class="mt8">ไปโรงพยาบาลใกล้บ้านทันที เภสัชกรจะตอบได้เมื่อร้านเปิด 09:00 เท่านั้น</p><a class="btn danger mt12" href="tel:1669" data-a="call1669">${ic('phone', 20, 2)}<span>โทร 1669</span></a></div></div>`;
TP.act('ofWho', t => { TP.S.ofWho = 'me'; TP.refresh({ anim: false }); });
TP.act('ofUrg', () => { const el = TP.cur().el; TP.S.ofUrg = ui.chipVals(el, 'ofurg'); const box = $('#ofDanger', el); box.innerHTML = TP.S.ofUrg.length ? ofDanger() : ''; TP.icons(box); });
TP.act('ofPhoto', t => { t.querySelector('span').textContent = 'แนบรูปแล้ว 1 รูป'; TP.notify('แนบรูปแล้ว', { icon: 'image' }); });
TP.act('ofSend', async t => {
  const q = $('#ofQ'), f = q.closest('.field');
  if (!q.value.trim()) { f.classList.add('err'); if (!$('.err-t', f)) f.insertAdjacentHTML('beforeend', `<p class="err-t">${ic('circle-x', 16, 2)}<span>พิมพ์คำถามก่อนส่ง</span></p>`); q.focus(); return; }
  /* the sent page is a flag on the state, not a panel state, so it survives the redraw */
  t.classList.add('busy'); await TP.wait(700);
  const S = TP.S, w = TP.person(S.ofWho || 'me');
  S.ofPending = { who: 'me', whoName: w?.id === 'me' ? 'ตัวเอง' : w?.name || '', q: q.value.trim().slice(0, 120), at: S.storeOpen === false ? '21:40' : TP.NOW.time };
  S.inbox.unshift({ id: 'of' + Date.now(), kind: 'adr', title: 'ฝากคำถามแล้ว', body: `เภสัชกรจะตอบ${TP.OF_REPLY} เราจะแจ้งเตือนเมื่อมีคำตอบ`, time: TP.NOW.date + ' ' + TP.NOW.time, read: true, go: 'home' });
  S.ofSent = true; TP.emit('state'); TP.refresh();
});

TP.screen('declined', {
  group: 'edge', title: 'เภสัชกรไม่รับเคส', code: 'C606', ref: 'C09', parent: 'home',
  notes: ['มีเหตุผลจากเภสัชกร + ชื่อ/ใบอนุญาตผู้ตัดสินเสมอ (กฎเดิม)', 'อาการที่ควรพบแพทย์ = พาไปหาโรงพยาบาล ไม่ปล่อยให้ตัน'],
  prep() { ensureCase('declined'); },
  render() {
    const c = C() || ensureCase('declined'), p = TP.PHARM[c.pharm];
    return ui.nav({ close: true }) + ui.page(`<div class="ec-top" data-in="0">${brand.halo(96, { still: true, icon: 'stethoscope' })}<h2 class="h2">เภสัชกรแนะนำให้พบแพทย์</h2><p class="body">อาการที่แจ้งควรได้รับการตรวจร่างกายโดยแพทย์ จึงไม่เหมาะกับการปรึกษาผ่านแอป</p></div>
      ${ui.card(`<p class="small">ข้อความจากเภสัชกร</p><p class="body mt8">"มีไข้สูงร่วมกับหายใจเหนื่อย แนะนำให้ไปโรงพยาบาลใกล้บ้านวันนี้ค่ะ ถ้าหายใจลำบากมากขึ้นโทร 1669 ได้ทันที"</p><div class="hrow mt12">${ui.av('', { ini: p.ini, size: 'sm', solid: true })}<span class="small"><b class="brand-t">${esc(p.name)}</b> · ${esc(p.lic)}</span></div>`, { din: 1, cls: 'mt24' })}<div class="mt24">${ui.callHelp({ din: 4 })}</div>`) +
      ui.dock(ui.btn('กลับหน้าแรก', { a: 'goHome' }));
  }
});
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
    ...(n ? [{ who: 'ph', text: `ดิฉันจัดยาบรรเทาอาการให้ ${n} รายการ${k.kid && k.items.some(i => /น้ำหนัก/.test(i.how)) ? ` ขนาดยาคิดตามน้ำหนักของ${k.call || 'น้อง'}` : ''} วิธีใช้อยู่ในรายการด้านล่างค่ะ ${k.see}นะคะ` }, { kind: 'order' }]
      : [{ who: 'ph', text: `ตอนนี้ยังไม่ต้องใช้ยาค่ะ ${k.see}นะคะ ถ้ามีคำถามเพิ่ม พิมพ์ในห้องนี้ได้เลย` }])
  ];
};
TP.roomScript = SCRIPT;
/* the pharmacist's line after payment depends on how the medicine travels (real-user R2: parcel said "ready in 30 minutes") */
TP.paidMsg = recv => recv === 'parcel' ? 'ได้รับชำระแล้วค่ะ ร้านกำลังจัดยาและแพ็กส่งพัสดุ ได้เลขพัสดุแล้วจะแจ้งในแอปนะคะ'
  : recv === 'express' ? 'ได้รับชำระแล้วค่ะ ร้านกำลังจัดยา แล้วจะเรียกรถส่งด่วนให้ ติดตามได้ในแอปนะคะ'
  : recv === 'cold' ? 'ได้รับชำระแล้วค่ะ ร้านกำลังจัดยาใส่กล่องเย็นและโทรจองขนส่ง Inter Express ให้ ได้เลขพัสดุแล้วจะแจ้งในแอปนะคะ'
  : 'ได้รับชำระแล้วค่ะ ร้านกำลังจัดยาให้ พร้อมรับภายใน 30 นาทีนะคะ';
TP.ORDER_PAYMENT_MS=15*60*1000;
TP.orderDeadline = o => {
  if(!o)return 0;
  if(o.status==='pending'&&!Number.isFinite(o.expiresAt))o.expiresAt=Date.now()+TP.ORDER_PAYMENT_MS;
  return o.expiresAt||0;
};
TP.orderPayable = o => !!o&&o.status==='pending'&&TP.orderDeadline(o)>Date.now();
TP.orderRemaining = o => {const seconds=Math.max(0,Math.ceil((TP.orderDeadline(o)-Date.now())/1000));return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;};
TP.orderTime = o => Number.isFinite(o?.expiresAt)?new Intl.DateTimeFormat('th-TH',{timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(o.expiresAt)):o?.expires||'';
TP.expireOrder = c => {
  const o=c?.order;if(!o||o.status!=='pending'||TP.orderDeadline(o)>Date.now())return false;
  o.status='expired';
  (TP.S.history||[]).filter(h=>h.id===c.id).forEach(h=>h.orderStatus='expired');
  return true;
};
TP.makeOrder = () => { const k=TP.casePlan(C()).items,items=k.length?k:[TP.ORDER_ITEMS[1]],issuedAt=Date.now();C().order={status:'pending',items,total:items.reduce((sum,i)=>sum+i.price,0),issuedAt,expiresAt:issuedAt+TP.ORDER_PAYMENT_MS,no:'MT'+issuedAt.toString(36).toUpperCase()};C().order.expires=TP.orderTime(C().order);TP.emit('state'); };
TP.orderCases = S => [...new Map([S.case,...(S.history||[]).map(h=>h._case)].filter(Boolean).map(c=>[c.id,c])).values()];
TP.pendingPaymentCase = S => TP.orderCases(S).find(c=>c.order?.status==='pending');
TP.paymentReminderCard = (S,c) => {
  c ||= TP.pendingPaymentCase(S)||TP.orderCases(S).find(c=>c.status==='closed'&&c.order?.status==='expired');
  if(!c||c.status!=='closed'||!['pending','expired'].includes(c.order?.status))return '';
  TP.expireOrder(c);const o=c.order,pending=TP.orderPayable(o),b=TP.branch(c.branch);
  return `<article class="post-consult-payment"><div class="post-payment-heading">${ic(pending?'credit-card':'clock',22,1.8)}<span>${pending?'รอชำระค่ายา':'หมดเวลาชำระค่ายา'}</span>${ui.tag('ปรึกษาเสร็จแล้ว','ok')}</div><h3>${pending?'รายการยาของคุณพร้อมชำระแล้ว':'รายการยานี้ชำระไม่ได้แล้ว'}</h3><p>${esc(b.name)} · ${o.items?.length||0} รายการ</p><div class="post-payment-total"><span>รวมค่ายา</span><b>${esc(TP.money(o.total))}</b></div>${pending?`<p class="post-payment-deadline">${ic('clock',16,2)}<span>ชำระภายใน ${esc(TP.orderTime(o))} น. · เหลือ <b data-order-countdown data-order-case="${esc(c.id)}">${TP.orderRemaining(o)}</b></span></p>${ui.btn('ดูรายการยาและชำระเงิน',{a:'openOrderPayment',p:{caseId:c.id},icon:'credit-card'})}`:`<p class="post-payment-expired">ครบเวลาชำระ 15 นาทีแล้ว หากยังต้องการยา ให้เภสัชกรตรวจสอบรายการใหม่</p>${ui.btn('ปรึกษาเภสัชอีกครั้ง',{a:'requeue',kind:'secondary',icon:'message-circle'})}`}${ui.btn('ดูใบสรุปการปรึกษา',{go:'summary',p:{id:c.id},kind:'ghost'})}</article>`;
};
TP.act('openOrderPayment',(t,ctx)=>{
  const id=ctx?.params?.caseId,c=id?TP.orderCases(TP.S).find(c=>c.id===id):(TP.pendingPaymentCase(TP.S)||C());TP.expireOrder(c);
  if(!TP.orderPayable(c?.order)){TP.notify('รายการนี้หมดเวลาชำระแล้ว กรุณาให้เภสัชกรตรวจรายการใหม่',{icon:'clock'});return TP.refresh({anim:false});}
  TP.S._paymentCase=c;TP.S.pay=null;return TP.sheet('pay');
});
/* Prototype clock only. A production backend owns expiration and payment reconciliation. */
TP.orderExpiryTick = () => {
  let changed=false;
  for(const c of TP.orderCases(TP.S)){
    if(TP.expireOrder(c)){
      changed=true;
      TP.S.inbox?.unshift({id:'order-expired-'+c.order.no,kind:'order',title:'รายการยาหมดเวลาชำระแล้ว',body:'แชทและใบสรุปยังเปิดดูได้',time:TP.NOW.date+' '+TP.orderTime(c.order),read:false,go:'summary',p:{id:c.id}});
    }
  }
  if(changed){
    TP.emit('state');
    if(TP.sheetOpen()?.id==='pay'&&!TP.orderPayable((TP.S._paymentCase||TP.S.case)?.order))TP.closeSheet().then(()=>TP.refresh({anim:false}));
    else if(TP.sheetOpen()?.id!=='pay')TP.refresh({anim:false});
  }
  document.querySelectorAll('[data-order-countdown]').forEach(el=>{
    const c=el.dataset.orderCase?TP.orderCases(TP.S).find(c=>c.id===el.dataset.orderCase):(TP.S._paymentCase||TP.S.case);
    if(c?.order)el.textContent=TP.orderRemaining(c.order);
  });
};
setInterval(()=>TP.orderExpiryTick(),1000);


TP.orderMedicineList = o => `<ul class="mo-l">${o.items.map(i => `<li>${TP.medicineImage(i)}<span class="medicine-copy"><b>${esc(i.name)}</b><small>${esc(i.qty)}${i.type ? ` · <i class="mo-ty">${esc(i.type === 'ยาอันตราย' ? 'ต้องจ่ายโดยเภสัชกร' : i.type)}</i>` : ''}</small><small>${esc(i.how)}</small></span><span class="num">${TP.money(i.price)}</span></li>`).join('')}</ul>`;
/* ---------- message html ---------- */
TP.orderMedicineDetails = o => `<div class="mo-h"><span class="mo-i">${ic('receipt',18,1.9)}</span><b>รายการยาจากเภสัชกร</b>${ui.tag(o.status==='paid'?'ชำระแล้ว':o.status==='expired'?'หมดอายุ':'รอชำระ',o.status==='paid'?'ok':o.status==='expired'?'muted':'warn')}</div>${TP.orderMedicineList(o)}<div class="mo-t"><span>รวมค่ายา</span><b class="num">${TP.money(o.total)}</b></div>`;
function orderCard(o) {
  TP.expireOrder?.(C());const st = o.status;
  return `<div class="msg-order${st === 'paid' ? ' paid' : st === 'expired' || st === 'cancelled' ? ' exp' : ''}">
    <div class="mo-h"><span class="mo-i">${ic('receipt', 18, 1.9)}</span><b>รายการยาจากเภสัชกร</b>${st === 'cancelled' ? ui.tag('ยกเลิกแล้ว', 'muted') : st === 'paid' ? ui.tag('ชำระแล้ว', 'ok') : st === 'expired' ? ui.tag('หมดอายุ', 'muted') : ui.tag('รอชำระ', 'warn')}</div>
    ${TP.orderMedicineList(o)}
    <div class="mo-t"><span>รวมค่ายา</span><b class="num">${TP.money(o.total)}</b></div>
    ${st === 'pending' ? `${ui.btn('ดูและชำระเงิน', { a: 'openOrderPayment', p:{caseId:C().id}, icon: 'credit-card' })}<p class="mo-x">ชำระภายใน ${esc(TP.orderTime(o))} น. · เหลือ <b data-order-countdown>${TP.orderRemaining(o)}</b></p>` : st === 'paid' ? ui.btn('ดูสถานะคำสั่งซื้อ', { kind: 'tint', go: 'paid', via: 'cover' }) : st === 'cancelled' ? (o.cancelBy === 'me' ? `${ui.btn('ขอรายการใหม่', { kind: 'secondary', a: 'askReorder' })}<p class="mo-x">คุณยกเลิกรายการนี้แล้ว ไม่มีการตัดเงิน</p>` : '<p class="mo-x">ยกเลิกแล้ว เพราะจบการปรึกษาก่อนชำระ ไม่มีการตัดเงิน</p>') : `${ui.btn('ขอรายการใหม่', { kind: 'secondary', a: 'askReorder' })}<p class="mo-x">รายการนี้หมดเวลาชำระแล้ว</p>`}
  </div>`;
}
function msgHtml(m) {
  if(m.kind==='provider-ready'){
    const p=P(),b=TP.branch(C().branch);
    return `<article class="rm-provider-ready"><div class="rm-provider-status">${ic('circle-check',18,2)}<span>เข้าห้องแล้ว · พร้อมให้คำปรึกษา</span></div><header class="rm-provider-identity">${ui.av('',{ini:p.ini,img:TP.demoProfiles?.[p.id==='tp'?'pharmacist_m':'pharmacist_f']})}<div><small>เภสัชกรผู้ดูแลคุณ</small><h3>${esc(p.name)}</h3><p>${esc(b.name)}</p></div></header><div class="rm-provider-license">${ic('badge-check',17,1.8)}<span>ใบอนุญาตประกอบวิชาชีพ <b>${esc(p.lic)}</b></span></div></article>`;
  }
  if(m.kind==='video-request'){
    const c=C(),pending=m.status==='pending'&&c.status==='room',inCall=m.status==='accepted'&&!!TP.S.call;
    const labels={declined:'คุณเลือกคุยทางแชทต่อ',withdrawn:'เภสัชกรยกเลิกคำขอนี้แล้ว',ended:'วิดีโอคอลจบแล้ว',accepted:inCall?'กำลังวิดีโอคอล':'รับคำขอแล้ว'};
    return `<article class="rm-video-request"><header><span class="rm-video-icon">${ic('video',24,1.8)}</span><div><h3>คำขอวิดีโอคอล</h3><p>${esc(P().short)} ขอคุยกับคุณผ่านวิดีโอ</p></div></header>${pending?`<p class="rm-video-help">กล้องและไมค์จะเริ่มใช้งานเมื่อคุณกดเข้าร่วม<br>ระหว่างคอล ย่อกลับมาพิมพ์แชทได้</p><div class="rm-video-actions"><button type="button" class="btn primary" data-a="acceptVideoRequest" data-request="${esc(m.id)}">${ic('video',18,2)}เข้าวิดีโอคอล</button><button type="button" class="btn secondary" data-a="declineVideoRequest" data-request="${esc(m.id)}">คุยแชทต่อ</button></div>`:m.status==='accepted'&&c.status==='room'?ui.btn('กลับเข้าวิดีโอคอล',{a:'startVideo',kind:'secondary',icon:'video'}):`<p class="rm-video-result">${esc(labels[m.status]||'คำขอนี้สิ้นสุดแล้ว')}</p>`}</article>`;
  }
  if (m.who === 'sys') return `<div class="msg-sys${m.move ? ' move' : ''}"><span>${m.move ? ic('map-pin', 14, 2) : ''}${esc(m.text)}</span></div>`;
  if (m.kind === 'intake') {
    const c=C(),p=TP.casePlan(c).p;
    const row=(icon,label,value,tone='')=>`<div class="msg-intake-row ${tone}"><dt>${ic(icon,18,1.8)}<span>${esc(label)}</span></dt><dd>${esc(value)}</dd></div>`;
    return `<div class="msg me wide"><article class="msg-intake"><header>${ic('clipboard-list',20,1.8)}<b>ข้อมูลก่อนปรึกษา</b></header><dl>${row('message-circle','อาการที่แจ้ง',c.symptoms.join(', ')||c.note||'เล่าเพิ่มเติม')}${c.note&&c.symptoms.length?row('file-text','รายละเอียดเพิ่มเติม',c.note):''}${p.allergies?.length?row('triangle-alert','ประวัติแพ้ยา',p.allergies.join(', '),'msg-intake-allergy'):''}${p.meds?.length?row('pill','ยาที่ใช้ประจำ',p.meds.join(', ')):''}${c.urgent?.length?row('triangle-alert','อาการที่ควรดูแลทันที',c.urgent.join(', '),'msg-intake-allergy'):''}</dl></article></div>`;
  }
  if (m.kind === 'order') return `<div class="msg ph wide">${orderCard(C().order)}</div>`;
  if (m.kind === 'summary') return `${m.by === 'auto' ? `<div class="msg-sys auto" role="status"><span>${ic('clock', 14, 2)}${esc(`ระบบปิดการปรึกษาให้ ${m.time || ''} เพราะไม่มีข้อความจากคุณ 5 นาที · ไม่มีค่าปรึกษา`)}</span></div>` : `<div class="msg-sys"><span>${m.by === 'me' ? 'คุณจบการปรึกษาแล้ว' : 'เภสัชกรปิดเคสแล้ว'} ${esc(m.time || '')}</span></div>`}<div class="msg ph wide"><button type="button" class="msg-sum" data-go="summary" data-p='{"id":"${C().id}"}'>${brand.halo(46, { check: true, still: true })}<span><b>ใบสรุปการปรึกษาพร้อมแล้ว</b><small>${C().noAdvice ? 'ปิดก่อนได้รับคำแนะนำ · อาการที่ต้องไปพบแพทย์' : C().order?.status === 'paid' ? 'คำแนะนำ ยาที่ได้รับ และอาการที่ต้องไปพบแพทย์' : 'คำแนะนำ และอาการที่ต้องไปพบแพทย์'}</small></span>${ic('chevron-right', 18, 2)}</button></div>${TP.followCloseLine?.(C()) || ''}`;
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
const idleHtml = c => (c.idle && c.status !== 'closed' ? `<div class="rm-idle" id="rmIdle" role="alert"><p class="rm-idle-h">${ic('clock', 18, 2)}<b>ยังคุยต่อไหม</b><span class="rm-idle-t">ปิดใน <b class="num" id="rmIdleT">${mmss(idleLeft(c))}</b></span></p>`
  + `<p>ไม่มีข้อความจากคุณ 3 นาที ถ้าไม่ตอบภายใน 2 นาที ระบบจะปิดการปรึกษานี้ให้ ไม่มีค่าปรึกษา ปรึกษาใหม่ได้ทุกเมื่อ</p>${ui.btn('ยังคุยอยู่', { sm: true, a: 'idleStay', icon: 'message-circle' })}</div>` : '');
/* any message or photo from the customer ends the silence */
const wake = el => { const c = C(); if (!c?.idle) return; c.idle = null; $('#rmIdle', el)?.remove(); TP.emit('state'); };
const waitingForPharmacist = c => ['queue','paused'].includes(c.status);
const queueChatLabel = c => c.status==='paused'?'เภสัชกรพักชั่วคราว · คิวของคุณยังอยู่':c.pos<=1?'คุณเป็นคิวถัดไป':`รออีก ${Math.max(0,c.pos-1)} คิว`;
TP.queueChatLabel=queueChatLabel;
const seed = c => {
  c.msgs ||= [];
  if(c.status==='closed')return;
  if(waitingForPharmacist(c)){
    c.waitedInChat=true;
    if(!c.msgs.some(m=>m.kind==='waiting'))c.msgs.unshift({who:'sys',kind:'waiting',text:'ส่งข้อมูลเบื้องต้นแล้ว คุณสามารถพิมพ์อาการเพิ่มเติมไว้ระหว่างรอเภสัชกรได้'});
    c.msgs=c.msgs.filter(m=>m.kind!=='intake');
    return;
  }
  if(c.waitedInChat&&!c.msgs.some(m=>m.kind==='provider-ready')){c.msgs=c.msgs.filter(m=>m.kind!=='intake');c.msgs.push({kind:'provider-ready',time:now()},{who:'me',kind:'intake'});c.step=0;}
  if(!c.msgs.length){c.msgs.push({kind:'provider-ready',time:now()},{who:'me',kind:'intake'});c.step=0;}
};
TP.queueChatUpdate = text => {
  const c=C();if(!c)return;
  const current=TP.cur(),el=current?.el,inChat=['queue','room'].includes(current?.id);
  if(inChat&&$('#rmList',el)){
    const sc=$('#rmScroll',el),nearBottom=sc.scrollHeight-sc.scrollTop-sc.clientHeight<80;
    const bar=$('#rmQueueLabel',el);if(bar)bar.textContent=queueChatLabel(c);
    if(text){c.msgs.push({who:'sys',kind:'queue-update',text});$('#rmList',el).insertAdjacentHTML('beforeend',msgHtml(c.msgs.at(-1)));if(nearBottom)el._bottom?.();}
    TP.live(queueChatLabel(c));
  }else{if(text)c.msgs.push({who:'sys',kind:'queue-update',text});if(current?.id==='home')TP.refresh({anim:false});TP.mini(false);}
};


/* =====================================================================
   Room (C09)
   ===================================================================== */
TP.screen('room', {
  group: 'during', title: 'ห้องปรึกษา (แชท)', code: 'C303', ref: 'C09', parent: 'home',
  states: [['live', 'เล่นบทสนทนา'], ['order', 'มีรายการยารอชำระ'], ['paid', 'ชำระแล้ว'], ['expired', 'รายการหมดอายุ'], ['offline', 'ไม่มีอินเทอร์เน็ต'], ['closed', 'ปิดเคส + ใบสรุป'], ['call', 'คุยวิดีโออยู่'], ['idle', 'เงียบ 3 นาที ใกล้ปิดเอง'], ['idleclosed', 'ปิดเองเพราะเงียบ 5 นาที'], ['moved', 'เภสัชกรย้ายไปสาขาอื่น'],['waiting','รอในแชท อีก 3 คิว'],['waiting-message','ส่งอาการไว้ระหว่างรอ'],['waiting-paused','พักชั่วคราวในห้องแชท'],['provider-joined','เภสัชกรเข้าห้องแล้ว'],['video-request','เภสัชกรขอวิดีโอคอล'],['video-declined','เลือกคุยแชทต่อ'],['video-withdrawn','เภสัชกรถอนคำขอวิดีโอ'],['closed-unpaid','จบแชท รอชำระค่ายา'],['payment-soon','จบแชท เหลือชำระ 1 นาที'],['closed-payexpired','จบแชท หมดเวลาชำระ']],
  notes: ['เภสัชกรส่งการ์ดคำขอวิดีโอคอล ลูกค้ากดเข้าร่วมเอง ย่อคอลมาพิมพ์แชทและกลับเข้าคอลได้โดยสายไม่หลุด', 'การ์ดรายการยา 3 สถานะ: รอชำระ / ชำระแล้ว / หมดอายุ (A16: บิลหน้าร้านเดิม)', 'ออกจากห้อง = เคสยังเปิด กลับเข้าได้จากหน้าแรก แถบด้านล่าง และประวัติ', 'ข้อความใหม่ตอนออกจากแอป = แจ้งเตือนแบบคำกลาง ๆ', 'A4 + A9 (20/10): แชทเก็บ 1 ปีนับจากวันปิดเคส',
    'เจ้าของเคาะ 20/10 ข้อ 69 "ใช่ให้ย้ายได้แล้วแจ้งลูกค้าด้วย": เภสัชกรย้ายเคสไปสาขาอื่นได้ ลูกค้าเห็นข้อความระบบ 1 บรรทัดในแชท "ย้ายการปรึกษาไปสาขาอ่อนนุชแล้ว ภก.ธัชพล ดูแลต่อ · ถ้าซื้อยา รับยาหรือส่งจากสาขาอ่อนนุช" · หัวห้องเปลี่ยนเป็นเภสัชกรและสาขาใหม่ แชทเดิมอยู่ครบ ไม่ต้องเล่าอาการใหม่ · อยู่หน้าอื่น = แจ้งเตือนเด้ง (C303.10 · ลองปุ่ม เภสัชกรย้ายเคส ในแผง) · ข้อความตรงกับคอนโซล S202',
    'นโยบายล่าสุด: ไม่มีการตอบกลับ 3 นาที แจ้งเตือนอีก 2 นาที ก่อนสิ้นสุดเมื่อครบ 5 นาที; แยกจากเวลาชำระยา 15 นาที และไม่ยกเลิกรายการยารอชำระเมื่อจบแชท'],
  wait: ['ลูกค้าเงียบระหว่างไปจ่ายเงิน (มีรายการรอชำระ) นับเวลาเงียบไหม · ต้นแบบนับเหมือนกัน ปิดแล้วรายการยกเลิก'],
  prep(S) {
    const st = S.st.room || 'live';
    if(['closed-unpaid','payment-soon','closed-payexpired'].includes(st)){TP.casePreview.seed(st);return;}
    if(['waiting','waiting-message','waiting-paused','provider-joined'].includes(st)){S.st.queue=({'waiting':'q4','waiting-message':'message','waiting-paused':'paused','provider-joined':'joined'})[st];TP.SCREENS.queue.prep(S);return;}
    const c = TP.ensureCase('room');
    S.netOff = st === 'offline'; S.call = null; c.idle = null; c.endWhy = null; c.noAdvice = false;
    if(['video-request','video-declined','video-withdrawn','call'].includes(st)){
      c.msgs=[];c.step=99;c.order=null;c.quick=null;c.status='room';seed(c);
      c.msgs.push({kind:'video-request',id:'preview-video-request',status:({'video-request':'pending','video-declined':'declined','video-withdrawn':'withdrawn','call':'accepted'})[st],time:now()});
      if(st==='call')S.call={t0:Date.now()-74000,mic:true,cam:true};
      return;
    }

    if (st === 'moved') {
      /* item 69: ภญ.ขวัญใจ asked the first question, the customer answered, then the case moved to อ่อนนุช */
      const home = TP.BRANCHES[0]; c.branch = home.id; c.pharm = home.pharm;
      c.msgs = []; c.order = null; c.quick = null; c.status = 'room'; seed(c);
      const sc = SCRIPT(c), k = TP.casePlan(c), qi = sc.findIndex(m => m.quick);
      sc.slice(0, qi + 1).forEach(m => c.msgs.push({ who: 'ph', text: m.text, time: now() }));
      c.msgs.push({ who: 'me', text: k.q[1][0], time: now(), canned: true });
      moveTo(c, 'on'); return;
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
    if (st === 'expired') c.order.status = 'expired';
    if (st === 'closed' && c.status !== 'closed') { c.status = 'closed'; c.msgs.push({ kind: 'summary', time: now() }); }
    if (st === 'call') S.call = { t0: Date.now() - 74000, mic: true, cam: true };
    if (st === 'offline') c.msgs.push({ who: 'me', text: 'ยาอมกับสเปรย์ใช้พร้อมกันได้ไหมคะ', fail: true });
  },
  render(ctx) {
    /* a closed case stays readable in the room (its summary card lives here); only a missing case gets a new one */
    const c = TP.S.case?.status === 'closed' ? TP.S.case : TP.ensureCase(null), p = P(), b = TP.branch(c.branch);
    if(c.status==='matched'){c.waitedInChat=true;c.status='room';}
    const waiting=waitingForPharmacist(c);
    seed(c);
    const closed = c.status === 'closed';
    const call = TP.S.call ? `<button type="button" class="rm-call" data-a="startVideo">${ic('video', 16, 2)}<span>กำลังวิดีโอคอล <b class="num" id="rmCallT">01:14</b></span><span class="rm-call-go">แตะเพื่อกลับ</span></button>` : '';
    return `<header class="nav solid rm-nav${waiting?' rm-waiting-nav':''}"><div class="nb-l"><button type="button" class="back" data-a="queueMin">${ic('chevron-down', 22, 2.2)}<span class="sr">ย่อห้อง</span></button></div>
      <div class="rm-who">${ui.av('', { ini: p.ini, img: TP.demoProfiles?.[p.id==='tp'?'pharmacist_m':'pharmacist_f'], size: 'sm', solid: true })}<span><b>${esc(p.short)}</b><small>${esc(p.lic+' · '+b.short)}</small></span></div>
      <div class="nb-r">${closed ? '' : waiting ? `<button type="button" class="txtbtn rm-cancel-wait" data-sheet="cancelq">ยกเลิกคิว</button>` : `<button type="button" class="ibtn" data-sheet="roommenu" aria-label="ตัวเลือกเพิ่มเติม">${ic('ellipsis', 22, 1.9)}</button>`}</div></header>
      ${waiting?`<div class="rm-queue-bar" role="status" aria-live="polite"><span class="rm-queue-icon" aria-hidden="true">${TP.miniStatusIcon(c.status==='paused'?'paused':'waiting')}</span><span class="rm-queue-copy"><small>รอเภสัชกร</small><b id="rmQueueLabel">${esc(queueChatLabel(c))}</b></span></div>`:''}
      ${call}${TP.S.netOff ? `<div class="rm-net" role="status">${ic('wifi-off', 16, 2)}<span>ไม่มีอินเทอร์เน็ต ข้อความจะส่งเมื่อกลับมาออนไลน์</span></div>` : ''}
      <div class="scroll rm-scroll${call ? ' has-call' : ''}${waiting?' has-queue':''}${TP.S.netOff ? ' has-net' : ''}${closed ? (c.endWhy === 'noreply' ? ' end2' : ' ended') : ''}" id="rmScroll"><div class="rm-day">${esc(c.day0 || 'วันนี้')}</div>${waiting&&c.urgent?.length?`<div class="rm-wait-safety">${qDanger()}</div>`:''}<div class="rm-list" id="rmList">${c.msgs.map(msgHtml).join('')}</div><div class="rm-quick" id="rmQuick"></div>${idleHtml(c)}</div>
      ${closed && c.order?.status==='pending' ? ui.dock(`${ui.btn('ดูรายการยาและชำระเงิน',{a:'openOrderPayment',icon:'credit-card'})}${ui.btn('เปิดใบสรุป',{kind:'ghost',go:'summary',p:{id:c.id}})}`,{note:`ปรึกษาเสร็จแล้ว · ชำระค่ายาภายใน ${esc(TP.orderTime(c.order))} น.`}) : closed && c.endWhy === 'noreply' ? ui.dock(`${TP.S.storeOpen ? ui.btn('ปรึกษาใหม่', { a: 'requeue', icon: 'message-circle' }) : ui.btn('ฝากคำถามถึงเภสัชกร', { go: 'offline', icon: 'message-circle' })}${ui.btn('เปิดใบสรุป', { kind: 'ghost', go: 'summary', p: { id: c.id } })}`, { note: TP.S.storeOpen ? 'ยังมีอาการ ปรึกษาใหม่ได้ทันทีที่สาขาเดิม ไม่ต้องกรอกอาการใหม่ · ไม่มีค่าปรึกษา' : `ร้านปิดแล้ว ฝากคำถามไว้ เภสัชกรตอบ${TP.OF_REPLY}` }) :
      closed ? ui.dock(`<p class="dock-note" style="margin:0">เคสนี้ปิดแล้ว · ดูย้อนหลังได้ในประวัติ 1 ปีนับจากวันปิดเคส</p>${ui.btn('เปิดใบสรุป', { go: 'summary', p: { id: c.id } })}`) :
      `<div class="dock rm-comp"><button type="button" class="ibtn" data-a="sendPhoto" aria-label="ส่งรูป">${ic('camera', 22, 1.8)}</button><label class="sr" for="rmIn">พิมพ์ข้อความ</label><textarea id="rmIn" class="rm-in" rows="1" placeholder="${waiting?'พิมพ์อาการเพิ่มเติมไว้ระหว่างรอ':'พิมพ์ข้อความ'}">${esc(c.draft||'')}</textarea><button type="button" class="rm-send" data-a="sendMsg" aria-label="ส่ง" disabled>${ic('arrow-up', 20, 2.4)}</button></div>`}`;
  },
  mount(el, ctx) {
    const c = C(), sc = $('#rmScroll', el), inp = $('#rmIn', el), send = $('.rm-send', el);
    const bottom = (smooth = true) => sc.scrollTo({ top: sc.scrollHeight, behavior: smooth && !TP.RED() ? 'smooth' : 'auto' });
    el._bottom = bottom;
    requestAnimationFrame(() => bottom(false));
    if (inp) {
      send.disabled=!inp.value.trim();
      inp.addEventListener('input', () => { c.draft=inp.value;send.disabled = !inp.value.trim(); inp.style.height = 'auto'; inp.style.height = Math.min(110, inp.scrollHeight) + 'px'; });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (inp.value.trim()) TP.ACTS.sendMsg(send); } });
    }
    if (TP.S.call) { const t = $('#rmCallT', el); const tick = () => { if (!TP.S.call) return; const s = Math.floor((Date.now() - TP.S.call.t0) / 1000); t.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }; tick(); ctx.every(tick, 1000); }
    if (c.quick) showQuick(el, c.quick);
    if (c.idle) { const t = $('#rmIdleT', el); ctx.every(() => { if (!c.idle) return; const s = idleLeft(c); if (t) t.textContent = mmss(s); if (!s) TP.sim.idleClose(); }, 1000); }
    if (!waitingForPharmacist(c)&&c.status!=='closed')ctx.later(()=>play(el,ctx),700);
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
/* the bubble flies up out of the composer */
async function sendText(text) {
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
  if (c.fromOf && /ดีขึ้น|หายแล้ว/.test(text)) { c.step = 99; await typing(el, 1300); if (TP.cur()?.el === el) push(el, { who: 'ph', text: `ดีใจด้วยค่ะ ${TP.casePlan(c).see}นะคะ ถ้ากลับมามีอาการ ปรึกษาใหม่ได้ทุกเมื่อค่ะ`, time: now() }); return; }
  if (c.step < SCRIPT(c).length) { c.answered = true; play(el, TP.cur().ctx); }
  else { await typing(el, 1300); if (TP.cur()?.el === el) push(el, { who: 'ph', text: 'รับทราบค่ะ ถ้ามีอะไรเพิ่มเติมพิมพ์บอกได้เลยนะคะ', time: now() }); }
}
TP.act('quickReply', t => sendText(t.dataset.v));
TP.act('sendMsg', t => { const inp = $('#rmIn', TP.cur().el); const v = inp.value.trim(); if (!v) return; inp.value = ''; C().draft='';inp.style.height = ''; t.disabled = true; sendText(v); });
TP.act('sendPhoto', () => { const el = TP.cur().el; wake(el); push(el, { who: 'me', kind: 'image', time: now() }); TP.notify('ส่งรูปแล้ว', { icon: 'image' }); });
TP.act('askReorder', () => { if(C()?.status==='closed')return TP.ACTS.requeue();const el = TP.cur().el; push(el, { who: 'me', text: 'ขอรายการยาใหม่ได้ไหมคะ', time: now() }); setTimeout(async () => { if (TP.cur()?.el !== el) return; await typing(el, 1200); TP.makeOrder(); push(el, { kind: 'order' }); }, 400); });

/* close the case (pharmacist side) */
TP.sim.closeCase = (by = 'ph', at) => {
  const c = C(); if (!c) return;
  if(c.status==='closed')return;
  c.outcome=by==='me'?'customer-ended':by==='auto'||c.endWhy==='noreply'?'no-response':'completed';
  c.status = 'closed'; c.quick = null;c.idle=null;TP.S.call=null;
  c.msgs.filter(m=>m.kind==='video-request'&&['pending','accepted'].includes(m.status)).forEach(m=>m.status='ended');
  if(c.order?.status==='pending')TP.orderDeadline(c.order);
  if (TP.S._appNew && !TP.S.faceId && !TP.S._fidAsked) TP.S._fidOffer = true;
  TP.S._disSeen = true;
  const qk = TP.cur()?.id === 'room' && $('#rmQuick', TP.cur().el); if (qk) qk.innerHTML = '';
  c.msgs.push({ kind: 'summary', time: at || now(), by });
  TP.followCaseClosed?.(c);
  TP.S.history.unshift({ id: c.id, date: c.date || TP.NOW.date, time: c.joinedAt, who: c.who, topic: c.symptoms.join(' ') || 'ถามเรื่องยา', branch: c.branch, pharm: c.pharm, bought: c.order?.status === 'paid' ? c.order.total : 0, orderStatus: c.order?.status || 'none', outcome:c.outcome, rated: 0, summary: true, _case:c });
  TP.S.inbox.unshift({ id: 'n' + Date.now(), kind: 'summary', title: 'ใบสรุปการปรึกษาพร้อมแล้ว', body: 'แตะเพื่อเปิดดู', time: TP.NOW.date + ' 14:41', read: false, go: 'summary' });
  if(c.order?.status==='pending')TP.S.inbox.unshift({id:'order-pending-'+c.order.no,kind:'order',title:'มีรายการยารอชำระ',body:'การปรึกษาจบแล้ว เปิดแอปเพื่อดูรายการและเวลาชำระ',time:TP.NOW.date+' '+now(),read:false,go:'summary',p:{id:c.id}});
  TP.emit('state');
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
/* customer ends the consult (old FL C12): menu in the room header, then a confirm sheet */
TP.sheetDef('roommenu', {
  group: 'during', title: 'ตัวเลือกในห้องปรึกษา', code: 'C304', ref: 'C09', host: 'room',
  render: () => { const b = TP.branch(C()?.branch); return ui.group([
    ui.row({ icon: 'phone', title: 'โทรหา' + b.name, sub: b.phone, a: 'callHelp', p: { tel: b.phone } }),
    ui.row({ icon: 'badge-check', title: 'ตรวจใบอนุญาตเภสัชกร', sub: P().lic, a: 'verifyLic', p: { lic: P().lic } }),
    ui.row({ icon: 'log-out', iconCls: 'danger', title: 'จบการปรึกษา', sub: 'เคสจะปิด และได้ใบสรุปทันที', a: 'askEnd' })
  ]); }
});
TP.sheetDef('endcase', {
  group: 'during', title: 'จบการปรึกษานี้ไหม', code: 'C305', ref: 'C09', host: 'room',
  render: () => { const o = C()?.order; return `<p class="body">${o?.status === 'pending' ? 'รายการยายังชำระได้ภายในเวลาที่กำหนด แม้จบการสนทนาแล้ว ' : ''}เคสนี้จะปิด และคุณจะได้ใบสรุปจากเภสัชกร ถ้ายังมีอาการ ปรึกษาใหม่ได้ทุกเมื่อ</p>`; },
  foot: () => ui.btn('จบการปรึกษา', { kind: 'danger', a: 'endCase' }) + ui.btn('คุยต่อ', { kind: 'ghost', closeSheet: true })
});
TP.act('askEnd', async () => { await TP.closeSheet({ instant: true }); TP.sheet('endcase'); });
TP.act('endCase', async () => {
  const c = C(); if (!c) return;
  await TP.closeSheet();
  TP.sim.closeCase('me');
  TP.notify('จบการปรึกษาแล้ว ใบสรุปอยู่ในห้องนี้', { icon: 'circle-check' });
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
  if(!c.msgs.some(m=>m.kind==='provider-ready'))c.msgs.push({kind:'provider-ready',time:now()},{who:'me',kind:'intake'});
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
    if(key==='video-request')TP.receiveVideoRequest({id:'preview-video-'+Date.now()});
    if(key==='reply'){c.idle={until:Date.now()+120000};await TP.refresh({anim:false});}
  }finally{c._previewPlaying=false;TP.emit('state');}
};
TP.sim.order = () => {
  const c = C(); if (!c||!['matched','room'].includes(c.status)||c.order) return;
  TP.makeOrder();
  if (TP.cur()?.id === 'room') push(TP.cur().el, { kind: 'order' }); else { c.msgs.push({ kind: 'order' }); TP.mini(false); TP.banner({ title: 'รายการยาพร้อมให้ชำระ', body: 'แตะเพื่อดูรายการ', go: 'room' }); }
};
/* item 69 (owner 20/10 "ใช่ให้ย้ายได้แล้วแจ้งลูกค้าด้วย"): one system line in the chat, worded like the console's S202 preview.
   The new pharmacist greets once; the scripted chat stops there (use the panel to send medicine from the new branch) */
const moveLine = b => `ย้ายการปรึกษาไป${b.name}แล้ว ${TP.PHARM[b.pharm].short} ดูแลต่อ · ถ้าซื้อยา รับยาหรือส่งจาก${b.name}`;
function moveTo(c, to) {
  const b = TP.branch(to), ph = TP.PHARM[b.pharm], from = TP.branch(c.branch);
  c.branch = b.id; c.pharm = b.pharm; c.step = 99; c.quick = null; c.answered = true;
  const f = /^ภญ/.test(ph.short), pp = f ? 'ค่ะ' : 'ครับ';
  const hi = `สวัสดี${pp} ${f ? 'ดิฉัน' : 'ผม'}เภสัชกร${ph.short.replace(/^ภ[ญก]\./, '')} ${b.name} รับเคสต่อจาก${from.name}แล้ว${pp} อ่านอาการและข้อความก่อนหน้าครบแล้ว ไม่ต้องเล่าใหม่${pp}`;
  return [{ who: 'sys', move: true, text: moveLine(b) }, { who: 'ph', text: hi, time: now() }].map(m => (c.msgs.push(m), m));
}
TP.sim.move = () => {
  const c = C(); if (!c) return;
  const to = TP.BRANCHES.find(b => b.id !== c.branch).id, el = TP.cur()?.id === 'room' ? TP.cur().el : null;
  if (el) $('#rmQuick', el).innerHTML = '';
  const ms = moveTo(c, to); TP.emit('state');
  if (el) { TP.refresh({ anim: false }); TP.live(ms[0].text); }
  else TP.banner({ title: `ย้ายการปรึกษาไป${TP.branch(to).name}แล้ว`, body: `${TP.PHARM[c.pharm].short} ดูแลต่อ แตะเพื่อเปิดห้องปรึกษา`, go: 'room' });
};
TP.simAction({ id: 'move', label: 'เภสัชกรย้ายเคสไปอีกสาขา (ข้อ 69)', when: S => ['matched', 'room'].includes(S.case?.status) && !S.case.order, run: () => TP.sim.move() });
TP.simAction({ id: 'msg', label: 'ส่งข้อความ', when: S => ['matched', 'room'].includes(S.case?.status), run: () => TP.sim.msg() });
TP.simAction({ id: 'order', label: 'ส่งรายการยา', when: S => ['matched', 'room'].includes(S.case?.status) && !S.case.order, run: () => TP.sim.order() });
TP.simAction({ id: 'idle', label: 'ลูกค้าเงียบ 3 นาที (ข้อ 63)', when: S => ['matched', 'room'].includes(S.case?.status) && !S.case.idle && !S.case.hold && !S.call, run: () => TP.sim.idleWarn() });
TP.simAction({ id: 'idleEnd', label: 'เงียบครบ 5 นาที ระบบปิดเคส', when: S => !!S.case?.idle && S.case.status !== 'closed', run: () => TP.sim.idleClose() });
TP.simAction({ id: 'close', label: 'ปิดเคส + ใบสรุป', when: S => ['matched', 'room'].includes(S.case?.status), run: () => TP.sim.closeCase() });
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
  group: 'during', title: 'วิดีโอคอล', code: 'C306', ref: 'C10', cls: 'dark vd-scr', sb: 'light', parent: 'room',
  states: [['on', 'คุยอยู่'], ['connecting', 'กำลังเชื่อมต่อ'], ['camoff', 'ปิดกล้องตัวเอง'], ['weak', 'สัญญาณอ่อน'], ['pcam', 'กล้องเภสัชกรใช้ไม่ได้']],
  notes: ['ปุ่มไทย 3 ปุ่มตำแหน่งเดิม: ไมค์ · กล้อง · วางสาย · สลับกล้องอยู่ที่ภาพตัวเอง', 'แอปขอสิทธิ์กล้องเอง ไม่ต้องพาออกเบราว์เซอร์', 'ปุ่ม "แชท" = สายยังไม่วาง มีแถบกลับเข้าสาย (A15)', 'วางสายต้องถามยืนยันก่อน (A15) · ไม่มีการบันทึกวิดีโอ (A4)', 'ลากภาพตัวเองไปมุมไหนก็ได้', 'A3 (20/10): ตอนกำลังเชื่อมต่อ (C306.2) บัตรเภสัชกรขึ้นกลางจอ รูปจากกล้องร้านตอนเข้ากะ ชื่อ เลขใบอนุญาต และใบอนุญาตร้านของสาขา'],
  prep(S) { TP.ensureCase('room'); S.call = null; },
  render(ctx) {
    const c = TP.ensureCase(null), p = P(), st = ctx.state, call = TP.S.call || (TP.S.call = { t0: Date.now(), mic: true, cam: st !== 'camoff' });
    if (st === 'camoff') call.cam = false;
    return `<div class="vd-remote${st === 'connecting' ? ' conn' : ''}" aria-label="ภาพจาก${esc(p.short)}"><canvas class="field" aria-hidden="true"></canvas><span class="vd-face">${esc(p.ini)}</span></div>
      <div class="vd-top"><button type="button" class="vd-chat" data-a="toChat">${ic('message-circle', 18, 2)}<span>ย่อไปแชท</span></button>
        <div class="vd-meta"><b>${esc(p.short)}</b><span>${esc(p.lic)}</span></div>
        <span class="vd-t" id="vdT">${st === 'connecting' ? 'กำลังเชื่อมต่อ' : '00:00'}</span></div>
      ${st === 'connecting' ? `<div class="vd-pass">${TP.passHtml(p, TP.branch(c.branch), { label: 'กำลังต่อสายกับ' })}</div>` : ''}
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
    else { const tick = () => { if (TP.S.call) t.textContent = fmt(Math.floor((Date.now() - TP.S.call.t0) / 1000)); }; tick(); ctx.every(tick, 1000); }
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
TP.screen('nocam', {
  group: 'edge', title: 'ไม่ให้สิทธิ์กล้อง', code: 'C607', ref: 'C10', parent: 'room',
  notes: ['ไม่ตัน: เปิดการตั้งค่า · คุยด้วยเสียงอย่างเดียว · คุยทางแชท', 'แอปถามสิทธิ์เองตอนกดเริ่มวิดีโอครั้งแรก'],
  prep() { TP.ensureCase('room'); },
  render: () => ui.nav({ back: 'ห้องปรึกษา' }) + ui.page(`<div class="ec-top" data-in="0"><span class="ec-ic">${ic('video-off', 40, 1.5)}</span><h2 class="h2">ยังไม่ได้อนุญาตให้ใช้กล้อง</h2><p class="body">เปิดสิทธิ์กล้องและไมค์ในการตั้งค่าของมือถือ แล้วกลับมาที่แอป หรือคุยด้วยวิธีอื่นได้เลย</p></div><div class="mt24">${ui.callHelp({ din: 4 })}</div>`) +
    ui.dock(ui.btn('เปิดการตั้งค่า', { a: 'openSettings' }) + `<div class="btn-row">${ui.btn('เสียงอย่างเดียว', { kind: 'secondary', icon: 'phone', a: 'voiceOnly' })}${ui.btn('คุยทางแชท', { kind: 'secondary', icon: 'message-circle', a: 'toChat' })}</div>`)
});
TP.act('openSettings', () => { TP.S.camDenied = false; TP.notify('เปิดหน้าตั้งค่าของมือถือ', { icon: 'external-link' }); });
TP.act('voiceOnly', () => { TP.S.call = { t0: Date.now(), mic: true, cam: false }; TP.S.st.video = 'camoff'; TP.go('video', { via: 'zoom', replace: true }).then(() => { TP.S.st.video = undefined; }); });

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
const FAR_ADDR = { id: 'a3', first: 'สมใจ', last: 'ใจดี', phone: '0812345678', house: '120/8', alley: 'ซอยเลียบวารี 55', road: '', prov: 'กรุงเทพมหานคร', amp: 'หนองจอก', dist: 'กระทุ่มราย', zip: '10530', main: false, pin: false };
/* 17 km by road from ตลาดเวิลด์ (mask table): out of the zone */
const ZONE_ADDR = { id: 'a3', first: 'สมใจ', last: 'ใจดี', phone: '0812345678', house: '45/2 หมู่ 3', alley: 'ซอยวัดชลอ', road: '', prov: 'นนทบุรี', amp: 'บางกรวย', dist: 'วัดชลอ', zip: '11130', main: false, pin: false };
TP.ZONE_ADDR = ZONE_ADDR;
/* express samples with their own pin state (the customer's home in ทวีวัฒนา is in range too since 21/10) */
const EXP_ADDR = { id: 'a4', first: 'สมใจ', last: 'ใจดี', phone: '0812345678', house: '59/3', alley: 'ซอยทวีวัฒนา 12', road: 'ถ.เลียบคลองทวีวัฒนา', prov: 'กรุงเทพมหานคร', amp: 'ทวีวัฒนา', dist: 'ทวีวัฒนา', zip: '10170', main: false, pin: false };
TP.EXP_ADDR = EXP_ADDR;
/* item 71: the pharmacist closes a way per list with a reason the customer sees · A7: a cold-chain list offers pickup + cold only */
const hasCold = o => (o?.items || []).some(i => i.cold);
const recvKeys = () => {const o=C().order,off=o?.recvOff||{};return ['pickup','express'].filter(k=>!off[k]&&!(k==='express'&&hasCold(o)));};
const RECV_NAME = { pickup: 'รับที่ร้าน', express: 'ส่งด่วน', parcel: 'ส่งพัสดุ', cold: 'ส่งแบบควบคุมความเย็น' };
const addrs = () => TP.S.addrs || (TP.S.addrs = []);
/* same order as CustomerAddress::getFormattedAddressAttribute (ต./อ./จ. even in Bangkok, like the website) */
const fmtAddr = a => [a.house, a.alley, a.road && 'ถ.' + a.road, 'ต.' + a.dist, 'อ.' + a.amp, 'จ.' + a.prov, a.zip].filter(Boolean).join(' ');
TP.fmtAddr = fmtAddr;
const fmtPhone = s => { const d = String(s || '').replace(/\D/g, ''); return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : d.length === 9 ? `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}` : String(s || ''); };
/* defaults: pickup checked (owner 19/10, website checkout CSM:409) · main address checked · PromptPay checked (PL:550) · Flash checked (PL courier block) */
const P = () => {const p=TP.S.pay || (TP.S.pay = { recv: 'pickup', courier: 'flash', addr: (TP.homeAddress?.() || addrs().find(a => a.main) || addrs()[0])?.id || null, method: 'promptpay', bank: 'KBANK', form: null, q: null, geo: '', geoMsg: '', moved: false, pinXY: null, acc: 0 });if(!['pickup','express'].includes(p.recv)||(p.recv==='express'&&hasCold(C()?.order)))p.recv='pickup';return p;};
const addr = () => addrs().find(a => a.id === P().addr) || null;
const qKey = () => P().recv + ':' + (addr()?.id || '');
const quoted = () => P().q?.st === 'done' && P().q.key === qKey();
const courier = () => TP.COURIERS.find(c => c.id === P().courier);
const EXP_FEE = () => TP.DELIVERY.find(d => d.id === 'express').fee;
function shipFee() {
  const p = P();
  if (p.recv === 'pickup') return 0;
  if (p.recv === 'cold') return addr() && !zoneStop(addr(), 'cold') ? TP.COLD.fee : null;
  if (!quoted()) return null;
  if (p.recv === 'express') return EXP_FEE();
  return courier()?.fee ?? null;
}
function totals() {
  const items = C().order.total, ship = shipFee(), sub = items + (ship || 0), fee = P().method === 'card' ? r2(sub * TP.CARD_FEE) : 0;
  return { items, ship, fee, total: r2(sub + fee) };
}
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
  if (p.recv === 'express' && !a.pin) return 'ปักหมุดบ้านด้านบนก่อน';
  if (!quoted()) return 'กำลังคำนวณค่าส่ง...';
  if (p.recv === 'parcel' && !p.courier) return 'เลือกบริษัทขนส่งก่อน';
  return '';
}
/* the website asks every courier at once after an address is known and Lalamove after the pin; the latest ask wins */
function requote() {
  const p = P(), a = addr();
  if (p.recv === 'pickup' || !a || zoneStop(a) || (p.recv === 'express' && (!a.pin || isFar(a)))) return;
  const key = qKey(); if (p.q?.key === key) return;
  p.q = { key, st: 'loading' };
  setTimeout(() => { if (P().q?.key === key) { P().q.st = 'done'; sync(); } }, 900);
}
const ensureOrder = () => { if(!C())TP.ensureCase('room');if(!C().order&&C().status!=='closed')TP.makeOrder();TP.expireOrder(C());return TP.orderPayable(C().order); };

/* ---------- blocks (PL order: 1 รายการยา · 2 การรับสินค้า + ที่อยู่ + ปักหมุด + สรุปยอด · 3 วิธีชำระเงิน) ---------- */
const sec = (n, t) => `<h3 class="pay-sec">${n===4?ic('receipt',21,1.8):''}${esc(t)}</h3>`;
const medHtml = i => `<div class="pay-med"><div class="pm-h">${TP.medicineImage(i)}<p class="pm-t"><b>${esc(i.name)}</b> <small>×${esc(i.qty)}</small>${i.cold ? `<span class="pm-cold">${ic('snowflake', 13, 2)}ยาเก็บเย็น</span>` : ''}</p><b class="num pm-p">${TP.money(i.price)}</b></div>${i.how ? `<p class="pm-n"><b>โน้ตจากเภสัช</b> ${esc(i.how)}</p>` : ''}</div>`;
/* radio card with a fee on the right (PL .opt: radio · icon · title + line · fee) */
const optCard = o => `<button type="button" class="opt po" role="radio" data-radio="${o.group}" data-v="${o.v}" data-a="${o.a}" aria-checked="${!!o.on}"${o.off ? ' disabled' : ''}>${ui.radioMark}${o.icon ? `<span class="po-i">${ic(o.icon, 20, 1.9)}</span>` : ''}<span class="tx"><b>${esc(o.title)}</b><span>${o.sub}</span></span>${o.fee ? `<span class="po-f ${o.tone || ''}">${o.fee}</span>` : ''}</button>`;
function recvOpts() {
  const S = TP.S, p = P(), b = TP.branch(C().branch), a = addr(), q = quoted(), keys = recvKeys();
  if (!S.storeOpen && p.recv === 'express') p.recv = 'pickup';
  if (!keys.includes(p.recv)) p.recv = keys[0];
  const dl = p.recv !== 'pickup' && !!a, ozE = dl && zoneStop(a, 'express'), ozP = dl && zoneStop(a, 'parcel'), ozC = dl && zoneStop(a, 'cold'), farNow = dl && isFar(a), next = S.storeOpen ? '' : ' · เริ่มส่งวันทำการถัดไป 19/10/2026';
  const opts = {
    pickup: () => optCard({ group: 'recv', v: 'pickup', a: 'payRecv', icon: 'store', title: 'รับที่ร้าน', on: p.recv === 'pickup', sub: esc(S.storeOpen?'รับยาที่สาขานี้':'รับวันเปิดทำการถัดไป'), fee: 'ฟรี', tone: 'free' }),
    express: () => optCard({ group: 'recv', v: 'express', a: 'payRecv', icon: 'zap', title: 'ส่งด่วน', on: p.recv === 'express', off: !S.storeOpen,
      sub: esc(S.storeOpen ? '1–4 ชม. · ในระยะ 15 กม.' : `ส่งด่วนใช้ได้ช่วงร้านเปิด ${b.hours}`),
      fee: !S.storeOpen ? '' : ozE ? 'นอกเขต' : farNow ? 'นอกระยะ' : p.recv === 'express' && q ? TP.money(EXP_FEE()) : 'ตามระยะทาง', tone: ozE || farNow ? 'warn' : p.recv === 'express' && q ? '' : 'pend' }),
    parcel: () => optCard({ group: 'recv', v: 'parcel', a: 'payRecv', icon: 'package', title: 'ส่งพัสดุ', on: p.recv === 'parcel',
      sub: esc('ถึงใน 1-3 วัน' + next),
      fee: ozP ? 'นอกเขต' : p.recv === 'parcel' && q && courier() ? TP.money(courier().fee) : 'คำนวณตามที่อยู่', tone: ozP ? 'warn' : p.recv === 'parcel' && q && courier() ? '' : 'pend' }),
    cold: () => optCard({ group: 'recv', v: 'cold', a: 'payRecv', icon: 'snowflake', title: RECV_NAME.cold, on: p.recv === 'cold',
      sub: esc(`${TP.COLD.short} ถึงใน ${TP.COLD.time} · ค่าบริการคงที่ · ร้านจองขนส่งให้หลังชำระ${next}`),
      fee: ozC ? 'นอกเขต' : TP.money(TP.COLD.fee), tone: ozC ? 'warn' : '' })
  };
  return keys.map(k => opts[k]()).join('');
}
/* one line under the choices says why some are missing (A7 cold chain, item 71 closed by the pharmacist) */
function whyHtml() {
 const o=C().order;
 if(hasCold(o))return `<p class="pay-why">${ic('snowflake',16,2)}<span>รายการนี้มียาเก็บเย็น กรุณารับที่ร้านเพื่อให้เภสัชกรแนะนำการเก็บรักษา</span></p>`;
 return o?.recvOff?.express?`<p class="pay-why">${ic('info',16,2)}<span>รายการนี้รับที่ร้านเท่านั้น${o.recvWhy?' · '+esc(o.recvWhy):''}</span></p>`:'';
}
/* PL courier block: indented under the options, Flash checked, prices come once an address is known */
function courRows() {
  const p = P(), a = addr(), st = !a ? 'need' : zoneStop(a, 'parcel') ? 'zone' : quoted() ? 'ok' : 'load';
  return TP.COURIERS.map(c => optCard({ group: 'cour', v: c.id, a: 'payCour', title: c.name, sub: esc(c.time), on: p.courier === c.id, off: st !== 'ok',
    fee: st === 'ok' ? TP.money(c.fee) : st === 'load' ? '<i class="spin" aria-hidden="true"></i>' : '', tone: st === 'ok' ? '' : 'pend' })).join('');
}
const courHtml = () => `<div class="pay-cour"><p class="pay-lb">เลือกบริษัทขนส่ง</p><p class="pay-hint" id="courNeed"${addr() ? ' hidden' : ''}>${ic('info', 14, 2)}<span>กรอกหรือเลือกที่อยู่จัดส่งก่อน แล้วราคาของแต่ละเจ้าจะขึ้นมาให้เลือก</span></p>
  <div class="opts" data-radio-scope role="radiogroup" aria-label="เลือกบริษัทขนส่ง" id="payCourOpts">${courRows()}</div></div>`;
/* PL pickup: the branch card with directions and a call button */
function recvExtra() {
  const p = P(), b = TP.branch(C().branch);
  if (p.recv === 'parcel') return courHtml();
  if (p.recv !== 'pickup') return '';
  return `<div class="pay-br"><div class="pay-branch-heading">${b.photo?`<img src="${esc(b.photo)}" alt="${esc(b.name)}" width="72" height="72" loading="lazy">`:`<span class="pay-branch-placeholder">${ic('store',28,1.8)}</span>`}<div><span class="pay-branch-eyebrow">สาขารับยา</span><h4>${esc(b.name)}</h4><p>${ic('clock',14,1.8)} เปิด ${esc(b.hours)}</p></div></div><div class="pay-branch-address">${ic('map-pin',18,1.8)}<p>${esc(b.addr || 'ยังไม่มีข้อมูลที่อยู่สาขา')}</p></div><p class="small pay-br-n">ชำระแล้วได้ QR รับยาในแอป แสดงที่เคาน์เตอร์ · ร้านแจ้งในแอปเมื่อยาพร้อม</p>
    <div class="pay-br-b">${ui.btn('นำทาง (Google Maps)', { kind: 'secondary', sm: true, icon: 'navigation', a: 'payMapsGo' })}${ui.btn('โทร ' + b.phone, { kind: 'secondary', sm: true, icon: 'phone', a: 'payCallBr' })}</div></div>`;
}
/* PL saved-address rows inside one card; the pin tag only matters for express so it shows only there */
function cardsHtml() {
  const list = addrs(), p = P(), ex = p.recv === 'express';
  if (!list.length) return '<p class="pay-none">ยังไม่มีที่อยู่ที่บันทึกไว้</p>';
  return `<div class="pay-ads" data-radio-scope role="radiogroup" aria-label="ที่อยู่จัดส่ง">${list.map(x => `<div class="pay-ad" data-v="${x.id}"><button type="button" class="pad" role="radio" data-radio="addr" data-v="${x.id}" data-a="payAddrPick" aria-checked="${p.addr === x.id}">${ui.radioMark}<span class="tx"><span class="pad-n"><b>${esc(x.first + ' ' + x.last)}</b>${x.main ? '<span class="pin-t">ที่อยู่หลัก</span>' : ''}${ex ? (x.pin ? '<span class="pin-t on">ปักหมุดแล้ว</span>' : '<span class="pin-t">ยังไม่ปักหมุด</span>') : ''}</span><span>${esc(fmtAddr(x))}</span><span>โทร ${esc(fmtPhone(x.phone))}</span></span></button><button type="button" class="pay-ad-e" data-a="payAddrEdit" data-v="${x.id}" aria-label="แก้ไขที่อยู่ ${esc(x.house)}">แก้ไข</button></div>`).join('')}</div>`;
}
const fld = (id, label, val, o = {}) => `<div class="field"><label for="${id}">${esc(label)}${o.req ? '<span class="req" aria-hidden="true">*</span>' : ''}</label><input id="${id}" class="input" type="${o.type || 'text'}" value="${esc(val || '')}"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.im ? ` inputmode="${o.im}"` : ''}${o.ac ? ` autocomplete="${o.ac}"` : ''}${o.max ? ` maxlength="${o.max}"` : ''}${o.ro ? ' readonly tabindex="-1"' : ''}${o.req ? ' aria-required="true"' : ''}></div>`;
const ta = (id, label, val, o = {}) => `<div class="field"><label for="${id}">${esc(label)}${o.req ? '<span class="req" aria-hidden="true">*</span>' : ''}</label><textarea id="${id}" class="input pay-ta" rows="${o.rows || 3}"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.ac ? ` autocomplete="${o.ac}"` : ''}${o.req ? ' aria-required="true"' : ''}>${esc(val || '')}</textarea>${o.hint ? `<p class="hint">${esc(o.hint)}</p>` : ''}</div>`;
const lineOf = a => [a.house, a.alley, a.road && 'ถ.' + a.road].filter(Boolean).join(' ');
/* PL address form: paste box, one name, one address line, subdistrict type-ahead fills district / province / zip */
function formHtml() {
  const f = P().form, a = f.id ? addrs().find(x => x.id === f.id) : null, u = TP.S.user;
  const v = a ? { name: a.first + ' ' + a.last, phone: a.phone, line: lineOf(a), dist: a.dist, amp: a.amp, prov: a.prov, zip: a.zip }
    : { name: u.full || '', phone: (u.phone || '').replace(/\D/g, ''), line: '', dist: '', amp: '', prov: '', zip: '' };
  return `<div class="pay-form" role="group" aria-labelledby="naT"><h4 id="naT">${a ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}</h4>
    ${a ? '' : `${ta('na_paste', 'วางที่อยู่ที่คัดลอกไว้ (แนะนำ)', '', { rows: 3, ph: 'วางข้อความที่อยู่ที่คัดลอกจากแชทหรือโน้ต...', hint: 'วางแล้วระบบกรอกช่องด้านล่างให้ แก้ได้ทุกช่อง' })}<p class="pay-pok" id="naPok" role="status" hidden></p><p class="pay-sub">ตรวจ/แก้ที่อยู่</p>`}
    ${fld('na_name', 'ชื่อผู้รับ', v.name, { req: 1, ac: 'name' })}
    ${fld('na_phone', 'เบอร์โทรผู้รับ', v.phone, { req: 1, type: 'tel', im: 'numeric', max: 12, ac: 'tel' })}
    ${ta('na_line', 'ที่อยู่ (บ้านเลขที่ / ซอย / ถนน)', v.line, { req: 1, rows: 2, ac: 'street-address', hint: 'ใส่บ้านเลขที่ หมู่ ซอย ถนน ให้ครบ เพื่อให้พนักงานส่งของหาบ้านเจอ' })}
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
  return `<div class="pay-unl" id="payUnl">${ui.note(`<b>ที่อยู่นี้ส่งได้ทางพัสดุเท่านั้น</b><br>${esc(`${z.km != null ? `ห่าง${b.name} ${z.km} กม. · ` : ''}ส่งพัสดุ Flash หรือ DHL ได้ 1-3 วัน · ส่งด่วนส่งได้ไม่เกิน 15 กม. จากสาขา`)}`, { icon: 'package' })}</div>`; };
const zoneHtml = a => { const z = zone(a), b = TP.branch(C().branch);
  return `<div class="pay-far pay-zone" id="payZone" role="status">${ic('map-pin', 20, 2)}<div><b>ที่อยู่นี้อยู่นอกเขตส่งยา</b><p>${esc(`${z.km != null ? `ห่าง${b.name} ${z.km} กม. · ` : ''}ร้าน${TP.ZONE_RULE} · เลือกที่อยู่อื่น หรือรับยาที่ร้าน`)}</p>${ui.btn('เปลี่ยนเป็นรับที่ร้าน', { sm: true, icon: 'store', a: 'payToPickup' })}</div></div>`; };
function geoHtml() {
  const p = P(), a = addr();
  if (p.recv === 'pickup' || !a || p.form) return '';
  if (zoneStop(a)) return zoneHtml(a);
  if (outZone(a) && p.recv === 'parcel') return unlHtml(a);
  if (p.recv !== 'express') return '';
  if (isFar(a)) return `<div class="pay-far" id="payFar" role="status">${ic('triangle-alert', 20, 2)}<div><b>ที่อยู่นี้อยู่นอกระยะจัดส่งด่วน</b><p>${esc(`${zone(a).km != null ? `ห่าง${TP.branch(C().branch).name} ${zone(a).km} กม. · ` : ''}${TP.EXP_RULE} เลือกส่งพัสดุแทน (ถึงใน 1-3 วัน) หรือเลือกที่อยู่อื่น`)}</p>${ui.btn('เปลี่ยนเป็นส่งพัสดุ', { sm: true, icon: 'package', a: 'payToParcel' })}</div></div>`;
  if (a.pin) return `<div class="pay-pinc" id="payPinC"><p class="pay-lb">ยืนยันตำแหน่งบ้าน</p><div class="pay-geo-ok" role="status">${ic('circle-check', 20, 2)}<span><b>${p.acc ? `ได้ตำแหน่งแล้ว (±${p.acc} ม.)` : 'ยืนยันตำแหน่งแล้ว'}</b>${quoted() ? 'ค่าส่งขึ้นแล้วในสรุปยอดด้านล่าง' : 'กำลังคำนวณค่าส่ง...'}</span></div><button type="button" class="link pay-repin" data-a="payRepin">ปักหมุดใหม่</button></div>`;
  const busy = p.geo === 'locating', map = p.geo === 'map' || p.geo === 'here', lock = p.geo === 'map' && !p.moved;
  const msg = p.geoMsg === 'deny' ? 'ไม่ได้รับอนุญาตใช้ตำแหน่ง ปักหมุดบ้านของคุณบนแผนที่ด้านล่างแทนได้ หรือเปิดสิทธิ์ตำแหน่งในการตั้งค่าของมือถือ'
    : p.geoMsg === 'fail' ? 'ระบุตำแหน่งไม่สำเร็จ ลองใหม่ หรือปักหมุดเองบนแผนที่' : '';
  return `<div class="pay-pinc" id="payPinC"><p class="pay-lb">ยืนยันตำแหน่งบ้าน</p>
    ${msg ? `<p class="pay-warn" role="alert">${ic('triangle-alert', 16, 2)}<span>${msg}</span></p>` : ''}
    ${ui.btn(busy ? 'กำลังหาตำแหน่ง...' : 'ใช้ตำแหน่งปัจจุบัน', { kind: 'secondary', icon: 'map-pin', a: 'payGeoNow', id: 'payGeoNow', disabled: busy, cls: 'pay-now' + (busy ? ' busy' : '') })}
    ${map ? mapCard(a, p, lock) : `<p class="pay-hint">${ic('info', 14, 2)}<span>ส่งด่วนต้องระบุตำแหน่งบ้าน เพื่อให้คนขับหาที่อยู่เจอแม่นยำ</span></p>${ui.btn(`หรือปักหมุดเองบนแผนที่ (เริ่มจาก ต.${a.dist})`, { kind: 'ghost', sm: true, a: 'payGeoMap', cls: 'pay-man' })}`}</div>`;
}
function methodOpts() {
  const p = P(), t = totals(), est = r2((t.items + (t.ship || 0)) * TP.CARD_FEE);
  if (!['promptpay', 'card', 'bank'].includes(p.method)) p.method = 'promptpay';
  return [
    optCard({ group: 'meth', v: 'promptpay', a: 'payMeth', icon: 'qr-code', title: 'พร้อมเพย์', sub: '<em class="free">ฟรี</em>', on: p.method === 'promptpay' }),
    optCard({ group: 'meth', v: 'card', a: 'payMeth', icon: 'credit-card', title: 'บัตรเครดิต/เดบิต', sub: `<em class="amb">+3.65% (≈${TP.money(est)})</em>`, on: p.method === 'card' }),
    optCard({ group: 'meth', v: 'bank', a: 'payMeth', icon: 'landmark', title: 'ชำระผ่านแอปธนาคาร', sub: '<em class="free">ฟรี</em> · เปิดแอปธนาคารในเครื่องให้', on: p.method === 'bank' })
  ].join('');
}
const bankRow = () => `<div class="pay-banks" data-radio-scope role="radiogroup" aria-label="เลือกธนาคาร">${TP.BANKS.map(([k, app, n]) => `<button type="button" class="bank" role="radio" data-radio="bank" data-v="${k}" data-a="payBank" aria-checked="${P().bank === k}" aria-label="${esc(app + ' ' + n)}"><span class="bank-l">${esc(k)}</span><small>${esc(app)}</small></button>`).join('')}</div>`;
const shipLabel = () => P().recv === 'express' ? 'ค่าจัดส่ง (Lalamove)' : P().recv === 'cold' ? 'ค่าส่งแบบเย็น (กล่องเก็บความเย็น)' : P().recv === 'parcel' && courier() ? `ค่าจัดส่ง (${courier().name})` : 'ค่าจัดส่ง';
/* PL summary card between section 2 and 3; the shipping row is hidden for pickup like the website */
function sumHtml(t) {
  const p = P(), a = addr(), oz = zoneStop(a), far = p.recv === 'express' && isFar(a), rows = [['ยอดค่ายา', TP.money(t.items)]];
  if (p.recv !== 'pickup') rows.push([shipLabel(), t.ship === null ? `<span class="pay-pend">${oz ? 'นอกเขตส่งยา' : far ? 'ส่งด่วนไม่ได้' : 'คำนวณตามที่อยู่'}</span>` : TP.money(t.ship)]);
  if (t.fee) rows.push(['ค่าธรรมเนียมบัตร (3.65%)', TP.money(t.fee)]);
  rows.push([t.ship === null ? 'ยอดรวม (ยังไม่รวมค่าส่ง)' : 'ยอดชำระรวม', '<span id="payTot"></span>', 'tot']);
  const hint = p.recv === 'express' && a && !a.pin && !far && !oz ? `<p class="pay-hint mt8">${ic('info', 14, 2)}<span>ยืนยันตำแหน่งบ้านแล้ว ค่าส่งจะขึ้นเอง</span></p>` : '';
  return ui.kv(rows, { cls: 'pay-kv' }) + hint;
}
/* real-user R4 P1: pickup is chosen by default (owner #48), so the pay bar always says how the medicine arrives */
const VIA_IC = { pickup: 'store', express: 'zap', parcel: 'package', cold: 'snowflake' };
const viaText = () => { const p = P(), b = TP.branch(C().branch); return p.recv === 'pickup' ? `รับยาเองที่ร้าน ${b.name}` : p.recv === 'express' ? 'ส่งด่วนถึงบ้าน (Lalamove)' : p.recv === 'cold' ? `ส่งแบบควบคุมความเย็น (${TP.COLD.short})` : `ส่งพัสดุ ${courier()?.name || ''}`.trim(); };
const expLine = o => `ชำระภายใน ${TP.orderTime(o)} น. · เหลือ <b data-order-countdown>${TP.orderRemaining(o)}</b>`;

/* ---------- pay sheet ---------- */
TP.sheetDef('pay', {
  group: 'during', title: 'ชำระเงิน', code: 'C308', ref: 'C11', host: 'room', tall: true,
  /* C308.1-13 keep the numbers the owner already reviewed; states added 19/10 night go after them (14-17), 20/10 night 18-20 */
  states: [['normal', 'รับที่ร้าน (ค่าเริ่มต้น)'], ['parcel', 'ส่งด่วน (แทนตัวเลือกเดิม)'], ['express', 'ส่งด่วน ยังไม่ปักหมุด'], ['noaddr', 'ยังไม่มีที่อยู่'], ['form', 'กำลังเพิ่มที่อยู่'], ['closed', 'ร้านปิด'], ['card', 'จ่ายด้วยบัตร'], ['otp', 'บัตร: หน้ายืนยันของธนาคาร'], ['qr', 'หน้า QR พร้อมเพย์'], ['qrexp', 'QR หมดอายุ'], ['bankon', 'เลือกแอปธนาคาร'], ['bankapp', 'หน้าแอปธนาคาร'], ['checking', 'กำลังตรวจสอบการชำระ'],
    ['expmap', 'ส่งด่วน ปักหมุดเองบนแผนที่'], ['exppin', 'ส่งด่วน ยืนยันตำแหน่งแล้ว'], ['locdeny', 'ส่งด่วน ไม่ให้สิทธิ์ตำแหน่ง'], ['far', 'กรุงเทพแต่เกิน 15 กม.'],
    ['outzone', 'ที่อยู่นอกเขตส่งยา'], ['recvoff', 'เภสัชกรปิดบางทาง'], ['cold', 'มียาเก็บเย็น'], ['unlock', 'ส่งด่วนเกินระยะ รับที่ร้านแทน']],
  notes:['นโยบายล่าสุด 1/11: รับที่ร้านและส่งด่วนเท่านั้น ไม่มีส่งพัสดุหรือขนส่งเย็น','ลำดับ: ตรวจรายการยา เลือกวิธีรับยาและที่อยู่ เลือกวิธีชำระ ตรวจยอดรวมก่อนยืนยัน','ส่งด่วนต้องยืนยันหมุด อยู่ในระยะบริการ และรู้ค่าส่งก่อนชำระ; ยาเก็บเย็นรับที่ร้านเท่านั้นจนกว่าจะมีบริการที่รองรับ','เวลาชำระ 15 นาทีตั้งแต่ส่งรายการยา ไม่เริ่มใหม่เมื่อเปิดหน้า เปลี่ยนวิธีรับ หรือจบแชท','ต้นแบบจำลองราคาและการจ่ายเงินจริงยังไม่เชื่อม gateway'],
  prep(S) {
    ensureOrder(); const st = S.st.pay || 'normal';
    S.payFailNext = false; S.locFailNext = false; S.storeOpen = st === 'closed' ? false : TP.flag('storeOpen');
    S.addrs = st === 'noaddr' ? [] : TP.fresh().addrs;
    if (st === 'far') S.addrs.push({ ...FAR_ADDR });
    S.locPerm = st === 'locdeny' ? 'deny' : undefined;
    /* same main address as C203.8 (real-user 21/10: the two screens disagreed) */
    if (st === 'outzone' || st === 'unlock') S.addrs = [{ ...ZONE_ADDR, main: true }, ...S.addrs.map(a => ({ ...a, main: false }))];
    if (st === 'outzone' || st === 'far') TP.setFlag('zoneLock', true);
    if (st === 'unlock') TP.setFlag('zoneLock', false);
    if (['express', 'expmap', 'exppin', 'locdeny'].includes(st)) S.addrs.push({ ...EXP_ADDR, pin: st === 'exppin' });
    const o = C().order;if(st==='normal'){o.items=TP.ORDER_ITEMS.map(i=>({...i}));o.total=o.items.reduce((n,i)=>n+i.price,0);} TP.withCold(o, st === 'cold'); o.recvOff = st === 'recvoff' ? { express: true } : null; o.recvWhy = st === 'recvoff' ? 'ต้องได้ยาวันนี้' : '';
    S.pay = null; const p = P();
    p.recv = { parcel: 'express', express: 'express', expmap: 'express', exppin: 'express', locdeny: 'express', far: 'express', noaddr: 'express', form: 'express', outzone: 'express', cold: 'pickup', unlock: 'express' }[st] || 'pickup';
    if (['express', 'expmap', 'exppin', 'locdeny'].includes(st)) p.addr = 'a4';
    if (st === 'far' || st === 'outzone' || st === 'unlock') p.addr = 'a3';
    if (st === 'expmap' || st === 'locdeny') p.geo = 'map';
    if (st === 'locdeny') p.geoMsg = 'deny';
    p.method = ['card', 'otp'].includes(st) ? 'card' : ['bankon', 'bankapp', 'checking'].includes(st) ? 'bank' : 'promptpay';
    if (st === 'form' || st === 'noaddr') p.form = { id: null };
    if (['qr', 'qrexp', 'otp', 'bankapp', 'checking'].includes(st)) p.auto = st;
  },
  render(ctx) {
    if(!ensureOrder())return ui.note('รายการนี้ชำระไม่ได้แล้ว กรุณาปิดหน้าต่างและตรวจสอบสถานะรายการยา',{icon:'clock'});
    const o = C().order, p = P(), b = TP.branch(C().branch);
    requote();
    return `<div class="payw"><p class="pay-store" data-in="1">${ic('store', 18, 2)}<b>${esc(b.name)}</b></p>
      <p class="pay-exp">${ic('clock', 13, 2)}<span>${expLine(o)}</span></p>
      <section class="checkout-block checkout-order-section"><div class="msg-order checkout-order-card">${TP.orderMedicineDetails(o)}</div>
      <p class="pay-ask">${ic('message-circle', 14, 2)}<span>หากต้องการแก้รายการยา กรุณาสอบถามเภสัชกรก่อนชำระ</span></p>
      </section><section class="checkout-block">${sec(2, 'เลือกวิธีรับยา')}
      <div class="opts" data-radio-scope role="radiogroup" aria-label="เลือกวิธีรับยา" id="payRecv">${recvOpts()}</div>
      <div id="payWhy">${whyHtml()}</div>
      <div id="payRecvX">${recvExtra()}</div>
      <div id="payAddrSec"${p.recv === 'pickup' ? ' hidden' : ''}>
        <div class="pay-adc"><p class="pay-lb">ที่อยู่จัดส่ง</p><div id="payCards">${cardsHtml()}</div>
          <button type="button" class="btn secondary sm pay-add" data-a="payAddrNew" id="payAdd"${p.form ? ' hidden' : ''}>${ic('plus', 18, 2)}<span>เพิ่มที่อยู่ใหม่</span></button></div>
        <div id="payForm">${p.form ? formHtml() : ''}</div>
        <div id="payGeo">${geoHtml()}</div></div>
      </section><section class="checkout-block">${sec(3, 'เลือกวิธีชำระเงิน')}
      <div class="opts" data-radio-scope role="radiogroup" aria-label="วิธีชำระเงิน" id="payMeth">${methodOpts()}</div>
      <div id="payExtra">${p.method === 'bank' ? bankRow() : ''}</div>
      <p class="pay-safe">${ic('shield-check', 15, 2)}<span>ชำระเงินปลอดภัยผ่าน</span><b class="omise">OMISE</b></p>
      </section><section class="checkout-block checkout-review">${sec(4, 'สรุปยอดชำระ')}<div class="pay-sum" id="paySum">${sumHtml(totals())}</div></section>
      <div class="pay-cx"><button type="button" class="link" data-a="payCancel">ยกเลิกรายการยานี้</button></div><p class="checkout-privacy"><button type="button" class="link" data-a="payPdpa">นโยบายความเป็นส่วนตัว</button></p></div>`;
  },
  foot: () => !TP.orderPayable(C()?.order)?ui.btn('ปิด',{kind:'secondary',closeSheet:true}):`<button type="button" class="btn primary pay-go" data-a="payGo" id="payGo"><span id="payLbl"></span></button>`,
  mount(el) {
    if(!TP.orderPayable(C()?.order))return;
    if (!el._payWired) { el._payWired = 1; el.addEventListener('input', onInput); el.addEventListener('pointerdown', pinDrag); el.addEventListener('keydown', onKey); el.addEventListener('focusin', () => requestAnimationFrame(unshift)); }
    TP.odo($('#payTot', el), TP.money(totals().total)); payLbl();
    const auto = P().auto; delete P().auto;
    if (auto === 'qr' || auto === 'qrexp') { P().method = 'promptpay'; showQR(auto === 'qrexp'); }
    else if (auto) showStep(auto);
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
  const p = P(), sec = $('#payAddrSec', sh), was = sec.hidden, f = document.activeElement, fk = f?.dataset?.radio && [f.dataset.radio, f.dataset.v], fid = f?.id;
  patchOpts($('#payRecv', sh), recvOpts());
  $('#payWhy', sh).innerHTML = whyHtml();
  const x = $('#payRecvX', sh), co = $('#payCourOpts', x);
  if (p.recv === 'parcel' && co) { patchOpts(co, courRows()); $('#courNeed', x).hidden = !!addr(); } else x.innerHTML = recvExtra();
  sec.hidden = p.recv === 'pickup';
  const ads = $('.pay-ads', sh);
  if (ads && addrs().length) patchOpts(ads, cardsHtml().replace(/^<div[^>]*>|<\/div>$/g, '')); else $('#payCards', sh).innerHTML = cardsHtml();
  $('#payAdd', sh).hidden = !!p.form;
  $('#payGeo', sh).innerHTML = geoHtml();
  patchOpts($('#payMeth', sh), methodOpts());
  $('#payExtra', sh).innerHTML = p.method === 'bank' ? bankRow() : '';
  $('#paySum', sh).innerHTML = sumHtml(totals());
  TP.icons(sh);
  if (was && !sec.hidden) A(sec, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { d: 320, e: E.out });
  if (fk && !f.isConnected) $(`[data-radio="${fk[0]}"][data-v="${fk[1]}"]`, sh)?.focus({ preventScroll: true });
  else if (fid && !f.isConnected) $('#' + fid, sh)?.focus({ preventScroll: true });
  TP.odo($('#payTot', sh), curTot(), { from });
  payLbl();
}
function payLbl() {
  const sh = $('#sheet'), b = $('#payGo', sh); if (!b) return;
  /* not disabled on purpose: the label says what is missing and a tap scrolls to it (the router ignores aria-disabled taps) */
  const m = missing();
  b.classList.toggle('off', !!m);
  $('#payLbl', sh).textContent = m || 'ชำระเงิน ' + curTot();
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
  if(!recvKeys().includes(t.dataset.v)||(t.dataset.v==='express'&&!TP.S.storeOpen))return;
  const f = curTot(), p = P(); p.recv = t.dataset.v; p.geoMsg = ''; requote(); sync(f);
  /* nothing saved yet: open the form right away instead of a warning popup */
  if (p.recv !== 'pickup' && !addrs().length && !p.form) openForm(null);
});
TP.act('payViaGo', () => { goTo('#payRecv'); $('[data-radio="recv"][aria-checked="true"]')?.focus({ preventScroll: true }); });
TP.act('payCour', t => { const f = curTot(); P().courier = t.dataset.v; sync(f); });
TP.act('payMeth', t => {
  const f = curTot(); P().method = t.dataset.v; sync(f);
  const x = $('#payExtra'); if (x.firstElementChild) A(x.firstElementChild, [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { d: 380, e: SP.soft.e });
});
TP.act('payBank', t => { P().bank = t.dataset.v; });
TP.act('payPdpa', () => TP.notify('เปิดนโยบายความเป็นส่วนตัว', { icon: 'file-text' }));
TP.act('payMapsGo', () => TP.notify('เปิด Google Maps นำทางไป ' + TP.branch(C().branch).name, { icon: 'navigation' }));
TP.act('payCallBr', () => TP.notify('กำลังโทร ' + TP.branch(C().branch).phone, { icon: 'phone' }));
TP.act('payAddrPick', t => { const f = curTot(), p = P(); p.addr = t.dataset.v; p.geo = ''; p.geoMsg = ''; p.moved = false; p.pinXY = null; p.acc = 0; requote(); sync(f); });
TP.act('payToPickup', () => { const f = curTot(); P().recv = 'pickup'; sync(f); $('[data-radio="recv"][data-v="pickup"]')?.focus({ preventScroll: true }); goTo('#payRecv'); });
TP.act('payToParcel', () => { const f = curTot(); P().recv = 'parcel'; requote(); sync(f); $('[data-radio="recv"][data-v="parcel"]')?.focus({ preventScroll: true }); goTo('.pay-cour'); });
function openForm(id) {
  P().form = { id }; const box = $('#payForm'); box.innerHTML = formHtml(); sync(); TP.icons(box);
  A(box.firstElementChild, [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { d: 360, e: SP.soft.e });
  scrollSheet(box, 'start');
  setTimeout(() => $('#na_line', box)?.focus({ preventScroll: true }), 260);
}
TP.act('payAddrNew', () => openForm(null));
TP.act('payAddrEdit', t => openForm(t.dataset.v));
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
  set('na_name', o.name); set('na_phone', o.phone); set('na_line', o.line);
  if (o.dist) setTambon(f, [o.dist, o.amp, o.prov, o.zip]);
  const ok = $('#naPok', f); ok.hidden = false; ok.className = 'pay-pok' + (o.dist ? '' : ' warn');
  ok.textContent = o.dist ? 'กรอกให้แล้ว ตรวจอีกครั้งก่อนบันทึก' : 'กรอกให้บางช่องแล้ว ยังหาตำบลไม่เจอ พิมพ์ในช่องตำบลด้านล่าง';
}
TP.simAction({ id: 'paypaste', label: 'จำลองวางที่อยู่ที่คัดลอกจากแชท', when: () => !!$('#na_paste'),
  run: () => { const t = $('#na_paste'); t.value = 'สมใจ ใจดี 089-555-1234 77/5 หมู่บ้านพฤกษา 8 แขวงศาลาธรรมสพน์ เขตทวีวัฒนา กรุงเทพมหานคร 10170'; fillPaste(t.value); } });
function onInput(e) {
  const t = e.target;
  if (t.id === 'na_dist') { const fd = t.closest('.field'); fd.classList.remove('err'); fd.querySelector('.err-t')?.remove(); fd.querySelector('.pay-farh')?.remove(); return suggest(t); }
  if (t.id === 'na_paste') { clearTimeout(TP.S._pasteT); TP.S._pasteT = setTimeout(() => fillPaste(t.value), 350); return; }
  if (t.closest?.('.pay-form')) { const fd = t.closest('.field'); fd?.classList.remove('err'); fd?.querySelector('.err-t')?.remove(); }
}
function onKey(e) {
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
const REQ = [['na_name', 'ชื่อผู้รับ'], ['na_phone', 'เบอร์โทรผู้รับ'], ['na_line', 'ที่อยู่'], ['na_dist', 'ตำบล/แขวง']];
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
  b.disabled = true; b.classList.add('busy'); $('span', b).textContent = 'กำลังบันทึก...';
  await TP.wait(600);
  const [first, ...rest] = val('na_name').split(/\s+/);
  const data = { first, last: rest.join(' '), phone, house: val('na_line').replace(/\s+/g, ' '), alley: '', road: '', prov: val('na_prov'), amp: val('na_amp'), dist: val('na_dist'), zip: val('na_zip') };
  const id = P().form?.id, from = curTot(); let a = id && addrs().find(x => x.id === id);
  if (a) { if (a.prov !== data.prov || a.amp !== data.amp || a.dist !== data.dist || lineOf(a) !== data.house) a.pin = false; Object.assign(a, data); }
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
TP.act('payGeoNow', async () => {
  const p = P(), S = TP.S;
  if (S.locPerm === 'deny') {
    const r = await dlg(`<span class="pay-dlg-i">${ic('map-pin', 26, 2)}</span><h3>ยังไม่ได้อนุญาตให้ใช้ตำแหน่ง</h3><p>เปิดได้ที่ การตั้งค่าของมือถือ > MITRAREE > ตำแหน่ง หรือปักหมุดบ้านบนแผนที่แทนก็ได้</p>
      <button type="button" class="btn primary" data-dlg="map" data-dlg-focus><span>ปักหมุดบนแผนที่แทน</span></button><button type="button" class="btn secondary" data-dlg="set"><span>เปิดการตั้งค่ามือถือ</span></button>`, 'ยังไม่ได้อนุญาตตำแหน่ง');
    if (r === 'set') TP.notify('เปิดการตั้งค่าของมือถือ', { icon: 'sliders' });
    return r === 'map' ? openMap('deny') : undefined;
  }
  if (S.locPerm !== 'app') {
    const r = await osAsk();
    if (r === 'cancel') return;
    if (r === 'no') { S.locPerm = 'deny'; return openMap('deny'); }
    S.locPerm = r === 'app' ? 'app' : undefined;
  }
  p.geo = 'locating'; p.geoMsg = ''; sync(); await TP.wait(1200);
  if (P().geo !== 'locating') return;
  if (S.locFailNext) { S.locFailNext = false; p.geo = ''; p.geoMsg = 'fail'; sync(); return; }
  /* accuracy within 100 m: confirm right away (PL) */
  p.geo = 'here'; p.accNow = 35; p.moved = true; p.pinXY = null; sync(); setTimeout(() => goTo('#payMap'), 60);
});
TP.act('payGeoMap', () => openMap(P().geoMsg));
TP.act('payGeoOk', () => { const p = P(); if (p.geo === 'map' && !p.moved) return; pinned(p.geo === 'here' ? p.accNow : 0); });
TP.act('payRepin', () => { const a = addr(), f = curTot(), p = P(); a.pin = false; p.acc = 0; p.q = null; p.geo = ''; p.moved = false; p.pinXY = null; sync(f); $('#payGeoNow')?.focus({ preventScroll: true }); });
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
TP.act('payCancel', async () => {
  const r = await dlg(`<span class="pay-dlg-i">${ic('triangle-alert', 26, 2)}</span><h3>ยกเลิกรายการยานี้ไหม</h3><p>ยังไม่มีการตัดเงิน เภสัชกรจะเห็นว่าคุณยกเลิก ถ้าต้องการยาภายหลัง ขอรายการใหม่ในห้องปรึกษาได้</p>
    <button type="button" class="btn danger" data-dlg="ok"><span>ยกเลิกรายการยา</span></button><button type="button" class="btn secondary" data-dlg="cancel" data-dlg-focus><span>กลับไปชำระเงิน</span></button>`, 'ยกเลิกรายการยา');
  if (r !== 'ok') return;
  const c = C(), o = c.order; o.status = 'cancelled'; o.cancelBy = 'me';
  if (!c.msgs.some(m => m.kind === 'order')) c.msgs.push({ kind: 'order' });
  TP.emit('state');
  await TP.closeSheet(); TP.refresh({ anim: false });
  TP.notify('ยกเลิกรายการยาแล้ว ไม่มีการตัดเงิน', { icon: 'info' });
});

/* ---------- pay ---------- */
const takeFail = () => { const f = TP.S.payFailNext; TP.S.payFailNext = false; return f; };
const where = { 'บันทึกที่อยู่ก่อน': () => { goTo('.pay-form'); setTimeout(() => $('#naSave')?.focus({ preventScroll: true }), 300); }, 'เพิ่มที่อยู่จัดส่งก่อน': () => openForm(null), 'เลือกที่อยู่จัดส่งก่อน': () => goTo('#payCards'), 'อยู่นอกระยะจัดส่งด่วน': () => goTo('#payFar'), 'ที่อยู่นี้อยู่นอกเขตส่งยา': () => { goTo('#payZone'); setTimeout(() => $('#payZone [data-a="payToPickup"]')?.focus({ preventScroll: true }), 300); }, 'ปักหมุดบ้านด้านบนก่อน': () => goTo('#payPinC'), 'เลือกบริษัทขนส่งก่อน': () => goTo('.pay-cour') };
async function shrink(b) {
  /* lock the choices while the button turns into a spinner, so the amount cannot change under the QR */
  const body = $('.sh-b', $('#sheet')); if (body) body.inert = true;
  const w = b.offsetWidth; b.classList.add('busy');
  await fin(A(b, [{ width: w + 'px', borderRadius: '14px' }, { width: '54px', borderRadius: '27px' }], { d: 420, e: E.ios, fill: 'forwards' }));
}
TP.act('payGo', async b => {
  if(!TP.orderPayable(C()?.order)){TP.orderExpiryTick();return;}
  const m = missing(); if (m) { where[m]?.(); return; }
  if (b.dataset.busy) return; b.dataset.busy = '1';
  const p = P();
  if (p.method === 'card') {
    const ok = await omise(); if (ok !== 'ok') { delete b.dataset.busy; return; }
    await shrink(b); await TP.wait(500);
    return showStep('otp');
  }
  await shrink(b);
  if (p.method === 'promptpay') { await TP.wait(400); return showQR(false); }
  const bank = TP.BANKS.find(x => x[0] === p.bank);
  TP.notify('กำลังเปิดแอป ' + bank[1], { icon: 'landmark' }); await TP.wait(900);
  showStep('bankapp');
});
/* card number goes into Omise's own window (OmiseCard popup, frameLabel MITRAREE, submitLabel ชำระเงิน); the shop never sees it */
const omise = () => dlg(`<p class="om-h"><b>MITRAREE</b><small>หน้าต่างกรอกบัตรของ Omise</small></p>
  <div class="gap12">${fld('omNo', 'หมายเลขบัตร', '4242 4242 4242 4242', { im: 'numeric', ac: 'cc-number' })}${fld('omName', 'ชื่อบนบัตร', 'SOMJAI JAIDEE', { ac: 'cc-name' })}<div class="btn-row">${fld('omExp', 'วันหมดอายุ', '12/28', { im: 'numeric', ac: 'cc-exp' })}${fld('omCvc', 'รหัสหลังบัตร', '123', { im: 'numeric', type: 'password', ac: 'cc-csc' })}</div></div>
  <button type="button" class="btn primary mt16" data-dlg="ok"><span>ชำระเงิน ${curTot()}</span></button><button type="button" class="btn ghost" data-dlg="cancel"><span>ยกเลิก</span></button>
  <p class="small">${ic('lock', 13, 2)} ข้อมูลบัตรส่งตรงถึง Omise ร้านไม่เห็นเลขบัตร</p>`, 'หน้าต่างกรอกบัตร');

/* ---------- PromptPay QR (pay link checking.blade.php): 10 minutes, save, new QR, change method ---------- */
let qrSeed = 7;
const qrSvg = () => { let seed = qrSeed, cells = ''; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) { const f = (x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17); if (f ? ((x % 6 === 0 || y % 6 === 0 || (x % 6 > 1 && x % 6 < 5 && y % 6 > 1 && y % 6 < 5)) && !(x === 6 && y > 17)) : rnd() > .52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`; }
  return cells; };
function qrStep() {
  const t = totals(), b = TP.branch(C().branch);
  return `<div class="qr-box"><p class="qr-mer"><span class="qr-av">${ic('store', 16, 2)}</span>${esc(b.name)}</p>
    <p class="small qr-via">${ic(VIA_IC[P().recv], 14, 2)} ${esc(viaText())}</p><p class="small">ยอดที่ต้องชำระ</p><p class="qr-amt num">${TP.money(t.total)}</p>
    <details class="qr-why"><summary>ยอดนี้มาจากไหน</summary>${ui.kv([['ยอดค่ายา', TP.money(t.items)], ['ค่าจัดส่ง', t.ship ? TP.money(t.ship) : 'ไม่มีค่าจัดส่ง'], ...(t.fee ? [['ค่าธรรมเนียมบัตร (3.65%)', TP.money(t.fee)]] : [])])}</details>
    <p class="small">สแกนด้วยแอปธนาคารเพื่อจ่าย</p>
    <div class="qr-code" id="qrCode"><svg viewBox="-1 -1 27 27" aria-label="QR พร้อมเพย์ สำหรับชำระ ${TP.money(t.total)}" role="img">${qrSvg()}</svg><p class="qr-dead" role="status">QR หมดอายุแล้ว กรุณาขอ QR ใหม่เพื่อสแกนอีกครั้ง</p></div>
    <p class="qr-cd">หมดอายุใน <b class="num" id="qrCd">10:00</b></p>
    ${ui.btn('บันทึก QR', { kind: 'secondary', sm: true, auto: true, icon: 'download', a: 'qrSave', id: 'qrSaveBtn' })}
    <p class="small">อยู่บนมือถือเครื่องเดียว? กด "บันทึก QR" แล้วเปิดแอปธนาคาร เลือกสแกนจากรูปในเครื่อง</p></div>
    <div class="qr-wait" role="status"><i class="spin" aria-hidden="true"></i><b>รอชำระเงิน...</b></div><p class="small qr-c">ยืนยันอัตโนมัติเมื่อได้รับเงิน</p>
    <p class="small qr-c" id="qrSlow" hidden>จ่ายแล้วแต่หน้ายังไม่เปลี่ยน? บอกเภสัชกรในห้องปรึกษา</p>`;
}
const qrFoot = dead => (dead ? ui.btn('ขอ QR ใหม่', { a: 'qrNew', icon: 'refresh-cw' }) : '') + ui.btn('เปลี่ยนวิธีชำระเงิน', { kind: dead ? 'ghost' : 'secondary', a: 'qrBack' });
function showQR(dead) {
  const sh = $('#sheet'); clearTimeout(TP.S._qrT); clearInterval(TP.S._qrI);
  $('.sh-b', sh).innerHTML = qrStep(); $('.sh-b', sh).scrollTop = 0; $('.sh-b', sh).inert = false; $('#sheetTitle').textContent = 'สแกนเพื่อชำระ';
  $('.sh-f', sh).innerHTML = qrFoot(false); TP.icons(sh);
  /* the sheet changed step without reopening: let the panel show the QR shortcuts (QA R3-9) */
  TP.emit('state');
  A($('.qr-box', sh), [{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { d: SP.spring.d, e: SP.spring.e });
  let s = dead ? 0 : 600; const cd = $('#qrCd', sh);
  const tick = () => { if (!cd.isConnected) return clearInterval(TP.S._qrI); cd.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; if (s <= 0) { clearInterval(TP.S._qrI); qrDead(); } s--; };
  TP.S._qrI = setInterval(tick, 1000); tick();
  setTimeout(() => { const h = $('#qrSlow'); if (h?.isConnected) h.hidden = false; }, 120000);
  /* the mask pays by itself after a few seconds in the normal flow; review states wait for the panel button */
  if (!dead && !['qr', 'qrexp'].includes(TP.S.st.pay)) TP.S._qrT = setTimeout(() => { if (TP.sheetOpen()?.id === 'pay' && $('.qr-box') && !$('.qr-code.dead')) paid(); }, 5200);
}
function qrDead() {
  const sh = $('#sheet'), q = $('#qrCode', sh); if (!q) return;
  clearTimeout(TP.S._qrT); q.classList.add('dead'); $('.qr-wait', sh)?.setAttribute('hidden', '');
  const sv = $('#qrSaveBtn', sh); if (sv) sv.disabled = true;
  $('.sh-f', sh).innerHTML = qrFoot(true); TP.icons($('.sh-f', sh)); TP.emit('state');
}
TP.act('qrSave', b => { $('span', b).textContent = 'บันทึก QR แล้ว'; TP.notify('บันทึก QR แล้ว', { icon: 'download' }); });
TP.act('qrNew', () => { qrSeed += 11; showQR(false); });
TP.act('qrBack', () => backToPay());
function backToPay() {
  clearTimeout(TP.S._qrT); clearInterval(TP.S._qrI);
  const sh = $('#sheet'), def = TP.def('pay'), ctx = TP.sheetOpen()?.ctx;
  $('#sheetTitle').textContent = 'ชำระเงิน';
  $('.sh-b', sh).innerHTML = def.render(ctx); $('.sh-b', sh).inert = false; $('.sh-f', sh).innerHTML = def.foot(ctx); TP.icons(sh);
  TP.odo($('#payTot', sh), curTot()); payLbl(); $('#payMeth [aria-checked=true]', sh)?.focus({ preventScroll: true }); TP.emit('state');
}

/* ---------- Omise hand-offs (card 3-D Secure, bank app) + "checking": the app counts a payment as done only after
   our server has asked Omise (webhook CartController.php:3620-3703), never because the customer came back ---------- */
const bankOf = () => TP.BANKS.find(x => x[0] === P().bank) || TP.BANKS[0];
function stepHtml(kind) {
  const t = totals(), bk = bankOf();
  if (kind === 'otp') return `<div class="hand"><p class="hand-from">${ic('shield-check', 16, 2)}<span>หน้านี้เป็นของธนาคารผู้ออกบัตร (3-D Secure) ร้านไม่เห็นข้อมูลในหน้านี้</span></p>
    <div class="hand-card"><p class="hand-bank"><span class="bank-l">VISA</span><b>ยืนยันตัวตนผู้ถือบัตร</b></p>
      ${ui.kv([['ร้านค้า', 'MITRAREE'], ['ยอดชำระ', TP.money(t.total)], ['บัตร', 'ลงท้าย 4242']])}
      <div class="field mt12"><label for="otpIn">รหัส OTP 6 หลัก</label><input id="otpIn" class="input num" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="ส่งทาง SMS ไปที่ 08x-xxx-5678"></div>
      <p class="pay-err" id="otpErr" role="alert" hidden></p><p class="small mt8">รหัสอ้างอิง QX7P · หมดอายุใน 5 นาที</p></div></div>`;
  if (kind === 'bankapp') return `<div class="hand"><p class="hand-from">${ic('smartphone', 16, 2)}<span>แอป ${esc(bk[1])} เปิดขึ้นมาแทนแอปเรา ลูกค้ายืนยันในแอปธนาคาร แล้วกลับมาที่แอปเราเอง</span></p>
    <div class="hand-card"><p class="hand-bank"><span class="bank-l">${esc(bk[0])}</span><b>${esc(bk[1])}</b></p>
      <p class="small mt8">ชำระเงินให้</p><p class="hand-to">MITRAREE (ผ่าน Omise)</p><p class="qr-amt num">${TP.money(t.total)}</p>
      ${ui.kv([['ตัดเงินจากบัญชี', 'ออมทรัพย์ ลงท้าย 1234']])}</div></div>`;
  return `<div class="hand-chk" role="status"><i class="spin" aria-hidden="true"></i><b>กำลังตรวจสอบการชำระเงิน</b><p class="small">รอธนาคารยืนยันกับร้าน ปกติไม่เกิน 10 วินาที ไม่ต้องกดซ้ำ</p>
    <p class="small hand-chk-n">ถ้าปิดแอปไปก่อน ร้านจะส่งแจ้งเตือนเมื่อยืนยันแล้ว ไม่มีการตัดเงินซ้ำ</p></div>`;
}
const STEP_T = { otp: 'ยืนยันกับธนาคาร', bankapp: 'แอปธนาคาร', checking: 'กำลังตรวจสอบ' };
const stepFoot = k => k === 'otp' ? ui.btn('ยืนยัน OTP', { a: 'otpGo', id: 'otpGo' }) + ui.btn('ยกเลิก', { kind: 'ghost', a: 'handCancel', v: 'card' })
  : k === 'bankapp' ? ui.btn('ยืนยันการชำระ', { a: 'bankGo' }) + ui.btn('ยกเลิก', { kind: 'ghost', a: 'handCancel', v: 'bank' }) : '';
function showStep(kind) {
  const sh = $('#sheet'); if (!sh || !$('.sh-b', sh)) return;
  clearTimeout(TP.S._qrT); clearInterval(TP.S._qrI); clearTimeout(TP.S._otpT);
  const body = $('.sh-b', sh); body.innerHTML = stepHtml(kind); body.scrollTop = 0; body.inert = false;
  $('#sheetTitle').textContent = STEP_T[kind]; $('.sh-f', sh).innerHTML = stepFoot(kind); TP.icons(sh);
  TP.emit('state');
  A(body.firstElementChild, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { d: 360, e: SP.soft.e });
  /* the phone offers the SMS code by itself, like iOS / Android one-time-code autofill */
  if (kind === 'otp') TP.S._otpT = setTimeout(() => { const i = $('#otpIn'); if (i?.isConnected && !i.value) i.value = '482913'; }, 1400);
}
async function check(why) {
  showStep('checking');
  if (TP.S.st.pay === 'checking') return;
  await TP.wait(1700);
  if (TP.sheetOpen()?.id !== 'pay' || !$('.hand-chk')) return;
  if (takeFail()) { await TP.closeSheet(); return TP.go('payfail', { via: 'cover', params: { why } }); }
  paid();
}
TP.act('otpGo', () => {
  const i = $('#otpIn'), e = $('#otpErr');
  if (!/^\d{6}$/.test(i.value.trim())) { e.textContent = 'ใส่รหัส OTP 6 หลักจาก SMS'; e.hidden = false; i.closest('.field').classList.add('err'); i.focus(); return; }
  check('card');
});
TP.act('bankGo', () => { TP.notify('กลับมาที่แอป MITRAREE แล้ว', { icon: 'smartphone' }); check('bank'); });
TP.act('handCancel', t => {
  if (t.dataset.v === 'bank') { TP.S.payFailNext = true; return check('bank'); }
  backToPay(); TP.notify('ยกเลิกการยืนยันกับธนาคารแล้ว ยังไม่มีการตัดเงิน', { icon: 'info' });
});
TP.simAction({ id: 'handok', label: 'จำลองว่าธนาคารยืนยันแล้ว', when: () => TP.sheetOpen()?.id === 'pay' && !!$('.hand-chk'), run: () => paid() });
TP.simAction({ id: 'handno', label: 'จำลองว่าธนาคารปฏิเสธ', when: () => TP.sheetOpen()?.id === 'pay' && !!$('.hand-chk'), run: async () => { await TP.closeSheet(); TP.go('payfail', { via: 'cover', params: { why: P().method === 'bank' ? 'bank' : 'card' } }); } });
async function paid() {
  if(!TP.orderPayable(C()?.order)){TP.orderExpiryTick();return;}
  clearTimeout(TP.S._qrT); clearInterval(TP.S._qrI); clearTimeout(TP.S._otpT);
  const c = C(), p = P(), a = addr();
  c.order.status = 'paid';
  (TP.S.history||[]).filter(h=>h.id===c.id).forEach(h=>{h.orderStatus='paid';h.bought=c.order.total;h._case=c;});
  c.order.paid = { ...totals(), recv: p.recv, courier: p.recv === 'parcel' ? p.courier : p.recv === 'cold' ? TP.COLD.id : null, addr: p.recv === 'pickup' ? null : { ...a }, method: p.method, bank: p.bank, date: TP.NOW.date, at: TP.roomNow?.() || TP.NOW.time };
  TP.saveReceipt?.(c);
  c.msgs.push({ who: 'ph', text: TP.paidMsg(p.recv), time: c.order.paid.at });
  /* inbox lines never carry drug names or amounts (contract) */
  TP.S.inbox.unshift({ id: 'r' + Date.now(), kind: 'pay', title: 'ใบเสร็จรับเงิน ' + c.order.no, body: 'แตะเพื่อดูใบเสร็จ', time: TP.NOW.date + ' ' + TP.NOW.time, read: false, go: 'receipt', p: { id: c.id } });
  TP.emit('state');
  await TP.closeSheet();
  TP.go('paid', { via: 'cover' });
}
TP.payPaid = paid;
TP.simAction({ id: 'qrpaid', label: 'จำลองว่าจ่าย QR แล้ว', when: () => TP.sheetOpen()?.id === 'pay' && !!$('.qr-box') && !$('.qr-code.dead'), run: () => paid() });
TP.simAction({ id: 'payfailnext', label: 'จำลองให้ครั้งนี้จ่ายไม่ผ่าน (บัตร / แอปธนาคาร)', when: () => TP.sheetOpen()?.id === 'pay' && !$('.qr-box') && !TP.S.payFailNext,
  run: () => { TP.S.payFailNext = true; TP.notify('ครั้งนี้จะจ่ายไม่ผ่าน เลือกบัตรหรือแอปธนาคาร แล้วกดชำระ', { icon: 'info' }); } });
TP.simAction({ id: 'qrdead', label: 'จำลองว่า QR หมดเวลา', when: () => TP.sheetOpen()?.id === 'pay' && !!$('.qr-box') && !$('.qr-code.dead'), run: () => qrDead() });

/* ---------- pay failed (cart/payment_failed.blade.php, wording made to say what to do next) ---------- */
TP.screen('payfail', {
  group: 'edge', title: 'จ่ายไม่ผ่าน', code: 'C609', ref: 'C11', parent: 'room',
  states: [['card', 'บัตรไม่ผ่าน'], ['bank', 'ยกเลิกในแอปธนาคาร']],
  notes: ['หัวเรื่อง ป้าย และรายละเอียดคำสั่งซื้อตามหน้าเว็บ payment_failed.blade.php:85-145',
    'เว็บไม่บอกสาเหตุ ทั้งที่ระบบมีข้อความ "ชำระเงินไม่สำเร็จ กรุณาตรวจสอบข้อมูลบัตรหรือติดต่อธนาคารผู้ออกบัตร" (CartController:3365) แอปแสดงข้อความนี้',
    'QR หมดเวลาไม่มาหน้านี้แล้ว อยู่ในหน้า QR เอง มีปุ่ม ขอ QR ใหม่ ตามหน้าจ่ายบิลเภสัชกร',
    'ยังไม่ถูกตัดเงิน รายการยายังอยู่ในห้องจนหมดเวลา'],
  prep() { ensureOrder(); },
  render(ctx) {
    const why = ctx.params?.why || ctx.state, o = C().order, p = P(), d = TP.DELIVERY.find(x => x.id === p.recv), a = addr();
    const msg = why === 'bank' ? 'ยกเลิกการชำระในแอปธนาคาร ยังไม่มีการตัดเงิน ลองอีกครั้ง หรือเลือกพร้อมเพย์' : 'ชำระเงินไม่สำเร็จ กรุณาตรวจสอบข้อมูลบัตรหรือติดต่อธนาคารผู้ออกบัตร หรือเลือกพร้อมเพย์แทน';
    const meth = why === 'bank' ? 'ชำระผ่านแอปธนาคาร' : 'บัตรเครดิต/เดบิต';
    return ui.nav({ close: true }) + ui.page(`<div class="ec-top" data-in="0"><span class="ec-ic warn">${ic('circle-x', 40, 1.5)}</span><h2 class="h2">การชำระเงินไม่สำเร็จ</h2><p class="body">${esc(msg)}</p>${ui.tag('การชำระเงินล้มเหลว', 'danger', { dot: true })}</div>
      ${ui.card(`<h3 class="h3">รายละเอียดคำสั่งซื้อ</h3>${ui.kv([['ร้านค้า', esc(TP.branch(C().branch).name)], ['หมายเลขคำสั่งซื้อ', `<span class="num">${esc(o.no)}</span>`], ['วันที่สั่งซื้อ', TP.NOW.date], ['สถานะการชำระเงิน', ui.tag('ไม่สำเร็จ', 'danger')], ['ยอดรวม', TP.money(totals().total)], ['วิธีการชำระเงิน', meth], ['วิธีการจัดส่ง', esc(d ? d.name : RECV_NAME[p.recv])], ...(p.recv !== 'pickup' && a ? [['ที่อยู่จัดส่ง', esc(fmtAddr(a))]] : [])], { cls: 'pay-fk' })}`, { din: 1, cls: 'mt24 gap12' })}
      ${ui.note(`รายการนี้ยังไม่เสร็จสมบูรณ์ คุณลองชำระเงินได้อีกครั้งทันที · ชำระได้ถึง ${o.expires}`, { icon: 'clock', din: 2 })}<div class="mt24">${ui.callHelp({ din: 3 })}</div>`) +
      ui.dock(ui.btn('ลองชำระเงินอีกครั้ง', { a: 'payRetry' }) + ui.btn('กลับไปที่ห้องปรึกษา', { kind: 'ghost', a: 'backRoom' }));
  }
});
/* the room is usually right under paid / payfail: go back to it, so back from the room then leaves the room (QA E1) */
const toRoom = () => TP.hist.length && TP.hist[TP.hist.length - 1].id === 'room' ? TP.back() : TP.go('room', { via: 'uncover', replace: true });
TP.act('payRetry', async () => { TP.S.st.pay = undefined; await toRoom(); TP.sheet('pay'); });
TP.act('backRoom', () => toRoom());
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
  const o = C().order, ship = { pickup: 0, express: 89, parcel: 25, cold: TP.COLD.fee }[recv], fee = method === 'card' ? r2((o.total + ship) * TP.CARD_FEE) : 0;
  const a = recv === 'express' && TP.EXP_ADDR ? { ...TP.EXP_ADDR, pin: true } : (TP.S.addrs || [])[0] || TP.fresh().addrs[0];
  o.status = 'paid';
  o.paid = { items: o.total, ship, fee, total: r2(o.total + ship + fee), recv, courier: recv === 'parcel' ? 'flash' : recv === 'cold' ? TP.COLD.id : null, addr: recv === 'pickup' ? null : { ...a }, method, date, at: '14:33' };
  TP.saveReceipt(C());
}
/* one receipt per consult, kept by consult id when it is paid, so history, summary and the inbox open the right one
   even after a new consult has replaced S.case (QA CD #1, #2) */
const RC = () => TP.S.receipts || (TP.S.receipts = {});
TP.saveReceipt = c => { if (c?.order?.paid) RC()[c.id] = c.order; };
/* website order codes: 11 random characters without look-alikes (mock: seeded by the consult id) */
const codeOf = id => { let h = [...id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 233280, 7); const AB = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 11 }, () => AB[(h = (h * 9301 + 49297) % 233280) % AB.length]).join(''); };
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
  if (!h?.bought) return null;
  const meds = TP.SUMMARY?.[id]?.meds || TP.ORDER_ITEMS.slice(0, 2);
  return (RC()[id] = pastOrder(id, h.date, h.time, priced(meds, h.bought)));
}
/* a receipt opened from the inbox after the case moved on still needs something to show */
const order = () => { const o = C()?.order; if (o?.paid) return o; const had = TP.caseOpen(); mockPaid('pickup'); if (!had) { C().status = 'closed'; TP.emit('state'); } return C().order; };
const methName = m => m === 'card' ? 'บัตรเครดิต/เดบิต' : m === 'bank' ? 'ชำระผ่านแอปธนาคาร' : 'พร้อมเพย์';
const recvName = pd => pd.recv === 'pickup' ? 'รับที่หน้าร้านสาขา' : pd.recv === 'express' ? 'จัดส่งด่วน (Lalamove)' : pd.recv === 'cold' ? `ส่งแบบควบคุมความเย็น · ${TP.COLD.name}` : 'จัดส่งพัสดุ · ' + (TP.COURIERS.find(c => c.id === pd.courier)?.name || '');
const qty = q => parseInt(q, 10) || 1;
/* items 84 / 90 (owner 20/10): packed at the store = the next step happens at once and the customer is told in the app */
/* A7: Inter Express has no link to the store, so the store pastes what it got: a tracking number or a tracking link (owner 21/10) */
const TRACK = { flash: 'TH01245F9K2YA', dhl: 'THDHL10245877', cold: 'IE2610180042' };
const courierOf = pd => (pd.recv === 'cold' ? TP.COLD : TP.COURIERS.find(c => c.id === pd.courier) || TP.COURIERS[0]);
const setStage = pd => { pd.stage = pd.recv === 'pickup' ? 'ready' : 'sent'; pd.packAt = '14:52'; pd.packDate = TP.NOW.date; if (pd.recv === 'parcel') pd.track = TRACK[pd.courier] || TRACK.flash; if (pd.recv === 'cold') { pd.track = TRACK.cold; pd.trackBy = 'ภญ.ขวัญใจ 15:05'; } };
/* owner 20/10: "30 วัน" the store keeps packed pickup medicine for 30 days, counted from the pack date (parcel and rider orders leave at once) */
const HOLD_DAYS = 30;
const addDays = (d, n) => { const [dd, mm, yy] = String(d).split('/').map(Number), x = new Date(yy, mm - 1, dd + n); return `${String(x.getDate()).padStart(2, '0')}/${String(x.getMonth() + 1).padStart(2, '0')}/${x.getFullYear()}`; };
const holdUntil = pd => addDays(pd.packDate || pd.date, HOLD_DAYS);
/* owner 21/10 "เฟสนี้ผมของ่ายๆหน่อย": no auto cancel or refund · remind on day 15 and day 30 · past the date the store calls */
const dnum = d => { const [dd, mm, yy] = String(d).split('/').map(Number); return yy * 10000 + mm * 100 + dd; };
const pickLate = pd => pd.recv === 'pickup' && pd.stage === 'ready' && dnum(holdUntil(pd)) < dnum(TP.NOW.date);
const LATE_PACK = '17/09/2026';
const pickNotes = (pd, br) => { const b = TP.branch(br), until = holdUntil(pd);
  return [{ id: 'nP30', kind: 'order', title: 'วันนี้เป็นวันสุดท้ายที่มารับยาได้', body: `ที่${b.name} เปิด ${b.hours} แตะเพื่อดูรหัสรับยา`, time: `${until} 09:00`, read: false, go: 'paid' },
    { id: 'nP15', kind: 'order', title: 'ยายังรอรับที่ร้าน', body: `มารับได้ถึง ${until} ที่${b.name} แตะเพื่อดูรหัสรับยา`, time: `${addDays(pd.packDate || pd.date, 14)} 09:00`, read: false, go: 'paid' }]; };
const trackTxt = pd => pd.track ? `เลขพัสดุ ${pd.track}` : pd.trackUrl ? 'มีลิงก์ติดตามพัสดุ' : '';
/* small pickup QR for the counter (mock pattern seeded by the order no) */
const qrMini = no => { let seed = [...no].reduce((a, ch) => a + ch.charCodeAt(0), 0), cells = ''; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) { const f = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13); if (f ? (x % 6 === 0 || y % 6 === 0 || (x % 7 > 1 && x % 7 < 5 && y % 7 > 1 && y % 7 < 5)) : rnd() > .5) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`; }
  return `<svg class="pd-qr" viewBox="-1 -1 23 23" role="img" aria-label="QR สำหรับรับยา">${cells}</svg>`; };
const SHIP_L = pd => pd.recv === 'cold' ? 'ค่าส่งแบบเย็น (กล่องเก็บความเย็น)' : 'ค่าจัดส่ง';
const totKv = pd => ui.kv([['ยอดค่ายา', TP.money(pd.items)], [SHIP_L(pd), pd.ship ? TP.money(pd.ship) : 'ไม่มีค่าจัดส่ง'], ...(pd.fee ? [['ค่าธรรมเนียมบัตร (3.65%)', TP.money(pd.fee)]] : []), ['ยอดชำระ', TP.money(pd.total), 'tot']]);

/* ---------- paid (C12) ---------- */
TP.screen('paid', {
  group: 'during', title: 'ชำระสำเร็จ', code: 'C309', ref: 'C12', parent: 'room',
  states: [['pickup', 'รับที่ร้าน'], ['parcel', 'ส่งด่วน (แทนตัวเลือกเดิม)'], ['express', 'ส่งด่วน'], ['night', 'จ่ายตอนร้านปิด'], ['ready', 'ยาพร้อมรับแล้ว'], ['sent', 'ส่งพัสดุแล้ว มีเลขพัสดุ'], ['rider', 'ไรเดอร์รับยาแล้ว'], ['cold', 'ส่งเย็น Inter Express มีเลขพัสดุ'], ['overdue', 'เลยกำหนดรับยา']],
  notes: ['ลำดับและคำตามหน้าหลังจ่ายบิลเภสัชกรของเว็บ pay/receipt.blade.php: ชำระเงินสำเร็จ · สถานะ (ชำระแล้ว > กำลังเตรียมยา > พร้อมรับที่สาขา > รับแล้ว / จัดส่งแล้ว > สำเร็จ ป้าย "ตอนนี้") · เลขออเดอร์ · เวลาชำระ · วิธีชำระ · รายการยา · ยอด',
    'รับที่ร้าน: รหัสรับยา + QR ที่เคาน์เตอร์ (กติกาแอป) + การ์ดสาขา นำทาง (Google Maps) และโทร ตามเว็บ',
    '19/10 เจ้าของสั่ง: ที่อยู่ เบอร์ และหมุด Google Maps ของสาขาจริง (ตลาดเวิลด์ 082-053-9915 · อ่อนนุช 080-235-3950 เบอร์ที่เจ้าของให้ 01/10) · นำทาง เปิดหมุดจริงในแท็บใหม่',
    'เว็บบอก "ร้านจะแจ้งในแชท LINE" แอปเปลี่ยนเป็นแจ้งในแอป · 20/10 A6: ปุ่ม ติดตามการจัดส่ง ขึ้นทุกครั้งที่เลือกส่ง (C309.2 C309.3 C309.6-8) เปิดจอติดตามพัสดุ C414',
    'A7 (C309.8): ส่งแบบควบคุมความเย็น Inter Express · เลขพัสดุเป็นเลขที่ร้านพิมพ์เองในคอนโซล ไม่มีระบบเชื่อม · ยังไม่มีเลข = บอกว่าร้านโทรจองรถให้ · 21/10 ร้านแปะลิงก์ติดตามแทนเลขได้ (ดู C414.7)',
    'ดูใบเสร็จ เปิดหน้าใบเสร็จรับเงิน (ใหม่) · ใบเสร็จเข้ากล่องแจ้งเตือนด้วย ไม่บอกยอดเงินในแจ้งเตือน',
    '20/10 ข้อ 84 และ 90 (ตรงกับคอนโซล S404): ร้านยืนยันจัดยาครบ รับที่ร้าน = แจ้งลูกค้าทันทีว่ายาพร้อมรับ · พัสดุ = จองขนส่งทันที เลขพัสดุขึ้นในแอป · ส่งด่วน = เรียกไรเดอร์ทันที · แจ้งเตือนไม่บอกชื่อยาหรือยอดเงิน · หน้าแรกบอกสถานะเดียวกัน (สถานะ C309.5-7 · หรือกด ร้านจัดยาครบ ในแผงหลังชำระ)',
    '20/10 เจ้าของเคาะ "30 วัน": รับที่ร้าน ร้านเก็บยาที่จัดแล้วไว้ให้ 30 วัน นับจากวันที่จัดยา · จัดยา 18/10/2026 = มารับได้ถึง 17/11/2026 · บอกในกล่องรหัสรับยา (C309.5) แถวยาพร้อมรับบนหน้าแรกและใบสรุป และแจ้งเตือนยาพร้อมรับ · ส่งพัสดุและส่งด่วนไม่มีการเก็บ ของออกจากร้านทันที',
    '21/10 เจ้าของ "เด้งแจ้งเตือนลูกค้า 15 วันและ 30 วัน" + "เฟสนี้ผมของ่ายๆหน่อย ไม่อยากสร้างระบบมารองรับไว้จนหนัก": แจ้งเตือน 2 ครั้งในกล่องแจ้งเตือน (วันที่ 15 ยายังรอรับที่ร้าน มารับได้ถึง ... · วันที่ 30 วันนี้เป็นวันสุดท้าย) ลองจากแผงขวา · กล่อง 30 วันบอกว่าเลยกำหนดร้านจะโทรหา · เลยกำหนด (C309.9) ร้านโทรหาเพื่อตกลงเรื่องยาและการคืนเงิน มีปุ่มโทรหาร้าน ไม่มีปุ่มยกเลิกหรือขอคืนเงินเอง ไม่มีระบบยกเลิกบิลหรือคืนเงินอัตโนมัติ · ตัวอย่าง C309.9 จัดยา 17/09/2026 รับได้ถึง 17/10/2026'],
  wait: ['เวลาถึงโดยประมาณของไรเดอร์ ตอนสร้างจริงใช้ค่าจาก Lalamove (ต้นแบบใส่ 45 นาที)',
    'ทำตอนสร้างจริง: แจ้งเตือนวันที่ 15 และวันที่ 30 ส่งตามวันจัดยาจริง'],
  prep(S) {
    const st = S.st.paid || 'pickup', recv = { night: 'pickup', ready: 'pickup', overdue: 'pickup', sent: 'parcel', rider: 'express' }[st] || st;
    S.storeOpen = st === 'night' ? false : TP.flag('storeOpen'); mockPaid(recv);
    if (['ready', 'overdue', 'sent', 'rider', 'cold'].includes(st)) setStage(C().order.paid);
    if (st === 'overdue') { const pd = C().order.paid; pd.date = pd.packDate = LATE_PACK; S.inbox = [...pickNotes(pd, C().branch).map(n => ({ ...n, read: true })), ...TP.fresh().inbox]; }
  },
  render() {
    const c = C(), o = order(), pd = o.paid, b = TP.branch(c.branch), night = !TP.S.storeOpen, pick = pd.recv === 'pickup', st = pd.stage, cr = courierOf(pd), late = pick && pickLate(pd);
    const now = ui.tag('ตอนนี้', 'ok', { dot: true });
    const packed = ['done', 'เตรียมยาแล้ว', `จัดยาครบ ${pd.packAt || ''}`];
    const steps = late ? [['done', 'ชำระแล้ว', `${pd.date} ${pd.at}`], ['done', 'เตรียมยาแล้ว', `จัดยาครบ ${pd.packDate} ${pd.packAt}`], ['cur', 'เลยกำหนดรับ', `ร้านเก็บยาไว้ให้ถึง ${holdUntil(pd)} · ร้านจะโทรหาคุณ`], ['', 'รับแล้ว', '']]
      : st && pick ? [['done', 'ชำระแล้ว', `${pd.date} ${pd.at}`], packed, ['cur', 'พร้อมรับที่สาขา', `ร้านแจ้งเมื่อ ${pd.packAt} · แสดงรหัสรับยาที่เคาน์เตอร์`], ['', 'รับแล้ว', '']]
      : st ? [['done', 'ชำระแล้ว', `${pd.date} ${pd.at}`], packed, ['cur', 'จัดส่งแล้ว', pd.recv === 'express' ? `ไรเดอร์ Lalamove รับยาแล้ว ${pd.packAt} · ถึงประมาณ ${addMin(pd.packAt, 45)} ติดตามตำแหน่งได้จากปุ่มด้านล่าง` : `${cr.name}${trackTxt(pd) ? ' · ' + trackTxt(pd) : ''} · ถึงใน ${cr.time}`], ['', 'สำเร็จ', 'เมื่อคุณได้รับยา']]
      : pick
      ? [['done', 'ชำระแล้ว', `${pd.date} ${pd.at}`], ['cur', 'กำลังเตรียมยา', night ? 'เริ่มเตรียมยาเมื่อร้านเปิด 09:00' : 'โดยปกติพร้อมรับใน 15-30 นาที เมื่อพร้อมร้านจะแจ้งในแอป'], ['', 'พร้อมรับที่สาขา', ''], ['', 'รับแล้ว', '']]
      : [['done', 'ชำระแล้ว', `${pd.date} ${pd.at}`], ['cur', 'กำลังเตรียมยา', night ? 'เริ่มเตรียมวันทำการถัดไป 19/10/2026' : 'วันนี้'], ['', 'จัดส่งแล้ว', pd.recv === 'express' ? 'ไรเดอร์ Lalamove ถึงใน 1-4 ชม. หลังร้านเตรียมยาเสร็จ' : pd.recv === 'cold' ? `ร้านโทรจองรถ ${TP.COLD.short} ให้ เลขพัสดุขึ้นในแอปเมื่อร้านส่งของ` : 'เลขพัสดุจะขึ้นในแอปเมื่อส่งของแล้ว'], ['', 'สำเร็จ', '']];
    return ui.nav({ close: true }) + ui.page(`<div class="pd-top"><span class="pd-ok${late ? ' late' : ''}">${ic(late ? 'clock' : 'check', 46, 2.4)}</span>
        <h2 class="h2" data-in="1">${late ? 'เลยกำหนดรับยาแล้ว' : st ? (pick ? 'ยาพร้อมรับแล้ว' : 'ส่งยาแล้ว') : 'ชำระเงินสำเร็จ'}</h2><p class="pd-amt num" data-in="2" id="pdAmt"></p><p class="small" data-in="2">${esc(b.name)}</p></div>
      ${late ? ui.card(`<p class="pd-late" id="pdLate">${ic('clock', 18, 2)}<span><b>ร้านเก็บยาไว้ให้ถึงวันที่ <span class="num">${holdUntil(pd)}</span></b>ร้านจะโทรหาคุณเพื่อตกลงเรื่องยาและการคืนเงิน</span></p>${ui.btn('โทรหาร้าน', { icon: 'phone', a: 'callStore', cls: 'mt12' })}`, { din: 3, cls: 'mt24' }) : pick ? ui.card(`<div class="pd-code"><div><small>รหัสรับยา</small><b class="num">${esc(o.no.slice(-4))}</b><span>แสดงรหัสนี้ที่เคาน์เตอร์${esc(b.name)} พร้อมบอกชื่อผู้สั่งซื้อ (${esc(TP.S.user.full)})</span></div>${qrMini(o.no)}</div>${st ? `<p class="pd-hold" id="pdHold">${ic('clock', 16, 2)}<span>ร้านเก็บยาไว้ให้ ${HOLD_DAYS} วัน มารับได้ถึงวันที่ <b class="num">${holdUntil(pd)}</b> · ถ้าเลยกำหนด ร้านจะโทรหา</span></p>` : ''}`, { din: 3, cls: 'mt24' }) : ''}
      ${ui.card(`<h3 class="h3">สถานะ</h3><ol class="tl mt12">${steps.map(([s, t, d]) => `<li class="${s}"><b>${esc(t)}${s === 'cur' ? ' ' + now : ''}</b>${d ? `<span>${esc(d)}</span>` : ''}</li>`).join('')}</ol>${!pick ? `<div class="mt12">${ui.btn(pd.recv === 'express' ? 'ติดตามไรเดอร์' : 'ติดตามการจัดส่ง', { kind: 'secondary', sm: true, icon: 'map-pin', go: 'track' })}${pd.track ? ui.btn('คัดลอกเลขพัสดุ', { kind: 'ghost', sm: true, icon: 'copy', a: 'copyTrack' }) : pd.trackUrl ? ui.btn('เปิดหน้าติดตามพัสดุ', { kind: 'ghost', sm: true, icon: 'external-link', a: 'openTrackLink' }) : ''}</div>` : ''}`, { din: 3, cls: 'mt16' })}
      ${pick ? ui.group([ui.row({ icon: 'store', title: b.name, sub: `${b.addr} · เปิด ${b.hours}` }), ui.row({ icon: 'phone', title: `โทร ${b.phone}`, a: 'callStore' })], { title: 'รับที่สาขา', din: 4 }) + (late ? '' : `<div class="mt12" data-in="4">${ui.btn('นำทางไปร้าน (Google Maps)', { icon: 'navigation', a: 'navStore' })}</div>`) : ''}
      ${ui.card(ui.kv([['เลขออเดอร์', `<span class="num">${esc(o.no)}</span>`], ['เวลาชำระ', `${pd.date} ${pd.at}`], ['วิธีชำระ', methName(pd.method)], ['การรับสินค้า', esc(recvName(pd))], ...(pd.addr ? [['ส่งไปที่', esc([pd.addr.house, pd.addr.alley, pd.addr.road, pd.addr.dist, pd.addr.amp, pd.addr.prov, pd.addr.zip].filter(Boolean).join(' '))]] : [])]), { din: 4, cls: 'mt16' })}
      ${ui.card(`<h3 class="h3">รายการยา</h3><div class="pd-items mt8">${o.items.map(i => `<p><span>${esc(i.name)} ×${esc(i.qty)}</span><b class="num">${TP.money(i.price)}</b></p>`).join('')}</div><div class="hr"></div>${totKv(pd)}`, { din: 5, cls: 'mt16' })}
      ${ui.group([ui.row({ icon: 'receipt', title: 'ดูใบเสร็จ', sub: 'ใบกำกับภาษีอย่างย่อ · ดาวน์โหลดตัวเต็มได้เอง', go: 'receipt', p: { id: c.id } })], { din: 5 })}
      <p class="small pd-ask">${ic('message-circle', 13, 2)} สงสัยเรื่องยา ถามในห้องปรึกษา</p>`) +
      ui.dock(ui.btn('กลับไปที่ห้องปรึกษา', { a: 'backRoom' }) + ui.btn('กลับหน้าแรก', { kind: 'ghost', a: 'goHome' }));
  },
  mount(el) {
    const pd = order().paid;
    setTimeout(() => TP.odo($('#pdAmt', el), TP.money(pd.total)), 360);
    const ok = $('.pd-ok', el); if (ok) A(ok, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'none', opacity: 1 }], { d: TP.SP.bounce.d, e: TP.SP.bounce.e });
  }
});
const caseBranch = () => TP.branch(C()?.branch || TP.S.branch);
TP.act('navStore', () => { const b = caseBranch(); window.open(b.map, '_blank', 'noopener'); TP.notify('เปิด Google Maps ไปที่' + b.name, { icon: 'navigation' }); });
TP.act('copyTrack', async () => { const t = order().paid.track; try { await navigator.clipboard?.writeText(t); } catch (e) { /* the mask has no clipboard in some previews */ } TP.notify(`คัดลอกเลขพัสดุ ${t} แล้ว`, { icon: 'copy' }); });
/* the store pasted a tracking link: one button, the long link is never shown (ทำตอนสร้างจริง: เปิดลิงก์ที่ร้านแปะ) */
TP.act('openTrackLink', () => TP.notify(`เปิดหน้าติดตามพัสดุของ ${TP.COLD.short}`, { icon: 'external-link' }));
TP.act('trackShip', () => { const pd = order().paid; TP.notify(pd.recv === 'express' ? 'เปิดหน้าติดตามไรเดอร์ของ Lalamove' : `เปิดหน้าติดตามพัสดุของ ${courierOf(pd).name}`, { icon: 'external-link' }); });
/* the store presses "จัดยาครบ" in S404: notified at once, never the medicine names or the amount */
TP.simAction({
  id: 'ordPacked', label: 'ร้านจัดยาครบ (ข้อ 84/90)', when: S => S.case?.order?.status === 'paid' && !!S.case.order.paid && !S.case.order.paid.stage && !S.case.order.picked,
  run() {
    const S = TP.S, c = S.case, pd = c.order.paid, b = TP.branch(c.branch); setStage(pd);
    const n = pd.recv === 'pickup' ? ['ยาพร้อมรับแล้ว', `ที่${b.name} รับได้ถึง ${holdUntil(pd)} แตะเพื่อดูรหัสรับยา`] : pd.recv === 'express' ? ['ไรเดอร์รับยาแล้ว', 'แตะเพื่อติดตามการจัดส่ง'] : ['ส่งยาแล้ว', 'มีเลขพัสดุแล้ว แตะเพื่อติดตาม'];
    const item = { id: 'n' + Date.now().toString(36), kind: 'order', title: n[0], body: n[1], time: `${TP.NOW.date} ${pd.packAt}`, read: false, go: pd.recv === 'pickup' ? 'paid' : 'track' };
    S.inbox.unshift(item); TP.emit('state');
    if (TP.cur()?.id === 'paid') { item.read = true; TP.refresh({ anim: false }); TP.notify(n[0], { icon: pd.recv === 'pickup' ? 'store' : 'package' }); }
    else { if (TP.cur()?.id === 'home') TP.refresh({ anim: false }); TP.banner({ title: n[0], body: n[1], onTap: () => { item.read = true; TP.emit('state'); TP.go(item.go); } }); }
  }
});
/* day 15 and day 30 reminders go where the ready notice goes: the inbox and a banner */
const pickRemind = day => ({
  id: 'pickD' + day, label: day === 15 ? 'ยังไม่มารับ ครบ 15 วัน (เตือนครั้งที่ 1)' : 'วันที่ 30 วันสุดท้าย (เตือนครั้งที่ 2)',
  when: S => { const pd = S.case?.order?.paid; return !!pd && pd.recv === 'pickup' && pd.stage === 'ready' && !S.case.order.picked && !pickLate(pd) && !S.inbox.some(n => n.id === 'nP' + day); },
  run() {
    const S = TP.S, c = S.case, item = { ...pickNotes(c.order.paid, c.branch)[day === 15 ? 1 : 0] };
    S.inbox.unshift(item); TP.emit('state');
    if (TP.cur()?.id === 'paid') { item.read = true; TP.emit('state'); TP.notify(item.title, { icon: 'store' }); }
    else { if (TP.cur()?.id === 'home') TP.refresh({ anim: false }); TP.banner({ title: item.title, body: item.body, onTap: () => { item.read = true; TP.emit('state'); TP.go('paid'); } }); }
  }
});
TP.simAction(pickRemind(15)); TP.simAction(pickRemind(30));
TP.act('callStore', () => { const b = caseBranch(); TP.notify(`กำลังโทรหา${b.name} ${b.phone}`, { icon: 'phone' }); });

/* ---------- C414 parcel tracking (A6, FDA notice 2.2(4): traceable the whole way, the customer confirms it arrived) ---------- */
const TRK_AT = { hand: '18/10/2026 16:10', hub: '18/10/2026 22:40', out: '19/10/2026 09:15', deliv: '19/10/2026 11:20', got: '19/10/2026 11:42' };
const trkState = pd => (pd.got ? 'received' : pd.deliv ? 'delivered' : !pd.stage ? 'prep' : pd.recv === 'express' ? 'rider' : pd.recv === 'cold' ? 'cold' : 'transit');
function trkSteps(pd, st) {
  const cr = courierOf(pd), paid = ['ชำระแล้ว', `${pd.date} ${pd.at}`], end = ['ส่งถึงแล้ว', pd.deliv || (pd.recv === 'express' ? `ถึงประมาณ ${addMin(pd.packAt || pd.at, 45)}` : `ถึงใน ${cr.time}`)];
  if (st === 'prep') return { steps: [paid, ['ร้านกำลังจัดยา', pd.recv === 'cold' ? `แล้วโทรจองรถ ${TP.COLD.short} ให้` : pd.recv === 'express' ? 'แล้วเรียกไรเดอร์ให้' : 'แล้วแพ็กส่งให้วันนี้'], [pd.recv === 'express' ? 'ไรเดอร์รับยา' : `ส่งให้ ${cr.name}`, ''], end], cur: 1 };
  const packed = [pd.recv === 'cold' ? 'ร้านจัดยาใส่กล่องเย็นแล้ว' : 'ร้านจัดยาและแพ็กแล้ว', `${pd.packDate} ${pd.packAt}`];
  if (pd.recv === 'express') return { steps: [paid, packed, ['ไรเดอร์ Lalamove รับยาแล้ว', `${pd.packDate} ${pd.packAt}`], end], cur: pd.deliv ? 3 + !!pd.got : 2 };
  if (pd.recv === 'cold') return { steps: [paid, packed, [`ส่งให้ ${cr.short} แล้ว`, pd.track ? `เลขพัสดุ ${pd.track} · สถานะระหว่างทาง โทรถามร้านได้` : 'ร้านแปะลิงก์ติดตามพัสดุแล้ว · ดูสถานะได้ที่หน้าติดตามพัสดุ'], end], cur: pd.deliv ? 3 + !!pd.got : 2 };
  const steps = [paid, packed, [`ส่งให้ ${cr.name} แล้ว`, TRK_AT.hand], ['กำลังขนส่ง', `ถึงศูนย์คัดแยก ${TRK_AT.hub}`], ['กำลังนำส่ง', pd.deliv ? TRK_AT.out : ''], end];
  return { steps, cur: pd.deliv ? 5 + !!pd.got : 3 };
}
TP.screen('track', {
  group: 'after', title: 'ติดตามพัสดุ', code: 'C414', parent: 'paid',
  states: [['transit', 'กำลังขนส่ง'], ['delivered', 'ส่งถึงแล้ว'], ['received', 'กดได้รับยาแล้ว'], ['cold', 'ส่งเย็น Inter Express'], ['rider', 'ส่งด่วน Lalamove'], ['prep', 'ร้านยังไม่ส่งของ'], ['coldlink', 'ส่งเย็น ร้านแปะลิงก์ติดตาม']],
  notes: ['A6 ตามประกาศ อย. ข้อ 2.2(4) สืบย้อนได้ตลอดการขนส่ง: เลขพัสดุ บริษัทขนส่ง สถานะจนถึง ส่งถึงแล้ว · ลูกค้ากด ได้รับยาแล้ว (ร้านเห็นในคอนโซล) · เปิดจากปุ่ม ติดตามการจัดส่ง ใน C309 แถวบนหน้าแรก ประวัติ C403 และแจ้งเตือนส่งยาแล้ว',
    'พัสดุ Flash DHL: สถานะดึงจากบริษัทขนส่ง (ทำตอนสร้างจริง) · ส่งด่วน: ปุ่มดูตำแหน่งไรเดอร์เปิดหน้าของ Lalamove · ส่งเย็น Inter Express ไม่มีระบบเชื่อม: ร้านแปะเลขพัสดุหรือลิงก์ติดตาม ระหว่างทางถามร้าน ส่งถึงแล้ว = ลูกค้ากด หรือร้านบันทึก',
    '21/10 เจ้าของ "เอาเลขติดตามพัสดุหรือลิ้งติดตามพัสดุมาแปะ": เลข = แสดงเลขพร้อมปุ่มคัดลอก (C414.4) · ลิงก์ = ปุ่ม เปิดหน้าติดตามพัสดุ ไม่โชว์ลิงก์ยาว (C414.7 คอนโซลลิงก์มาที่นี่) · C309.8 ใช้ตัวอย่างแบบเลข',
    'ได้รับยาแล้ว กดได้ตั้งแต่ส่งของแล้ว (บางครั้งของถึงก่อนสถานะขยับ) · กดแล้วแถวยาบนหน้าแรกหายไป'],
  wait: ['ลูกค้าไม่กด ได้รับยาแล้ว ระบบถือว่าได้รับเมื่อขนส่งแจ้งส่งถึงหลังกี่วัน (ต้นแบบยังไม่ปิดเอง)'],
  prep(S) {
    const st = S.st.track || 'transit', recv = { cold: 'cold', coldlink: 'cold', rider: 'express' }[st] || 'parcel';
    mockPaid(recv); const o = C().order, pd = o.paid;
    if (st !== 'prep') setStage(pd);
    if (st === 'coldlink') { pd.track = ''; pd.trackUrl = 'link-pasted-by-store'; }
    pd.deliv = ['delivered', 'received'].includes(st) ? TRK_AT.deliv : ''; pd.got = st === 'received' ? TRK_AT.got : ''; o.picked = st === 'received';
  },
  render() {
    const o = order(), pd = o.paid, cr = courierOf(pd), ex = pd.recv === 'express', cold = pd.recv === 'cold', st = trkState(pd), { steps, cur } = trkSteps(pd, st), a = pd.addr;
    const head = ui.card(`<div class="tk-h"><span class="tk-i">${ic(ex ? 'zap' : cold ? 'snowflake' : 'package', 22, 2)}</span><div class="grow"><b>${esc(ex ? 'ส่งด่วน Lalamove' : cr.name)}</b><small>${pd.track ? `เลขพัสดุ <span class="num">${esc(pd.track)}</span>` : pd.trackUrl ? 'ร้านแปะลิงก์ติดตามพัสดุแล้ว' : ex ? 'ไรเดอร์ส่งถึงบ้าน' : 'เลขพัสดุขึ้นเมื่อร้านส่งของ'}</small></div>${pd.track ? ui.btn('คัดลอก', { kind: 'ghost', sm: true, icon: 'copy', a: 'copyTrack' }) : ''}</div>
      ${cold ? `<p class="tk-n">${ic('snowflake', 14, 2)}<span>ยาอยู่ในกล่องคุมความเย็น 2-8 องศา · สถานะระหว่างทาง โทรถามร้านได้</span></p>${pd.track ? `<button type="button" class="link tk-web" data-a="trackShip">ติดตามบนเว็บ ${esc(TP.COLD.short)} ${ic('external-link', 14, 2)}</button>` : pd.trackUrl ? ui.btn('เปิดหน้าติดตามพัสดุ', { kind: 'secondary', sm: true, icon: 'external-link', a: 'openTrackLink', cls: 'mt12' }) : ''}` : ''}`, { din: 1, cls: 'mt8' });
    const tl = ui.card(`<h3 class="h3">สถานะ</h3><ol class="tl mt12">${steps.map(([t, d], i) => `<li class="${i < cur ? 'done' : i === cur ? 'cur' : ''}"><b>${esc(t)}${i === cur ? ' ' + ui.tag('ตอนนี้', 'ok', { dot: true }) : ''}</b>${d ? `<span>${esc(d)}</span>` : ''}</li>`).join('')}</ol>`, { din: 2, cls: 'mt16' });
    const coldTip = cold && st !== 'prep' ? ui.card(`<div class="tk-cold">${ic('snowflake', 20, 2)}<div><b>ถึงแล้วเก็บเข้าตู้เย็นทันที</b><p>ถ้ากล่องไม่เย็นแล้ว อย่าใช้ยา โทรหาร้าน ${esc(caseBranch().phone)}</p></div></div>${ui.btn('โทรหาร้าน', { kind: 'secondary', sm: true, icon: 'phone', a: 'callStore', cls: 'mt8' })}`, { din: 2, cls: 'mt16' }) : '';
    const got = pd.got ? `<div class="tk-got mt16" data-in="2" role="status">${ic('circle-check', 22, 2)}<span><b>คุณยืนยันว่าได้รับยาแล้ว</b>${esc(pd.got)} · ร้านเห็นแล้ว</span></div>` : '';
    const to = a ? ui.card(ui.kv([['ส่งไปที่', esc(TP.fmtAddr ? TP.fmtAddr(a) : a.dist)], ['ผู้รับ', esc(`${a.first} ${a.last}`.trim())], ['เลขออเดอร์', `<span class="num">${esc(o.no)}</span>`]]), { din: 3, cls: 'mt16' }) : '';
    const ask = pd.deliv && !pd.got ? `<p class="tk-ask" data-in="3">${ic('package', 15, 2)}<span>${esc(cr.name || 'ขนส่ง')} แจ้งว่าส่งถึงแล้ว ได้รับยาครบแล้ว กด ได้รับยาแล้ว · ยังไม่ได้รับ โทรถามร้านได้</span></p>` : '';
    const side = ex ? ui.btn('ดูตำแหน่งไรเดอร์ (Lalamove)', { kind: 'ghost', a: 'trackShip', icon: 'external-link' }) : cold ? ui.btn('ถามสถานะกับร้าน', { kind: 'ghost', a: 'callStore', icon: 'phone' }) : ui.btn(`เปิดหน้าติดตามของ ${cr.name}`, { kind: 'ghost', a: 'trackShip', icon: 'external-link' });
    const dock = pd.got ? ui.btn('กลับหน้าแรก', { a: 'goHome' }) : st === 'prep' ? ui.btn('กลับ', { kind: 'secondary', a: 'tkBack' }) : ui.btn('ได้รับยาแล้ว', { kind: pd.deliv ? 'primary' : 'secondary', a: 'tkGot', icon: 'circle-check' }) + side;
    return ui.nav({ back: true, title: 'ติดตามพัสดุ' }) + ui.page(`${head}${got}${coldTip}${ask}${tl}${to}<div class="mt16">${ui.callHelp({ din: 4, branch: C().branch })}</div>`) + ui.dock(dock);
  }
});
TP.act('tkBack', () => (TP.canBack() ? TP.back() : TP.go('paid')));
TP.act('tkGot', () => TP.sheet('gotask'));
TP.sheetDef('gotask', {
  group: 'after', title: 'ยืนยันได้รับยา', code: 'C415', host: 'track',
  notes: ['ผู้ใช้จริง 21/10: กดได้รับยาแล้วพลาดได้ จึงถามก่อน · เวลาได้รับต้องหลังส่งของ (เดิมใช้เวลาตอนนี้ของต้นแบบ ซึ่งก่อนเวลาชำระ)'],
  render: () => `<p class="body">ได้รับยาครบแล้วใช่ไหม</p><p class="body mt8">กดยืนยันแล้ว ร้านจะเห็นว่าคุณได้รับยาแล้ว · ถ้าของไม่ครบหรือกล่องเสียหาย โทรหาร้านก่อน</p>`,
  foot: () => ui.btn('ได้รับครบแล้ว', { a: 'tkGotOk', icon: 'circle-check' }) + ui.btn('ยังไม่ได้รับ', { kind: 'ghost', closeSheet: true })
});
TP.act('tkGotOk', () => {
  const o = order(), pd = o.paid; pd.got = TRK_AT.got; if (!pd.deliv) pd.deliv = TRK_AT.deliv; o.picked = true; TP.emit('state'); TP.closeSheet().then(() => { TP.refresh({ anim: false }); TP.notify('บันทึกว่าได้รับยาแล้ว', { icon: 'circle-check' }); });
});

/* ---------- receipt (ใหม่) ---------- */
/* every receipt is an abbreviated tax invoice; the full one downloads in one tap (owner 19/10: "ผมไม่ต้องการให้กดขอ")
   in the account name and main address · a person needs no tax id, a company does (Revenue Code 86/4) */
const meTax = () => { const u = TP.S.user, a = TP.S.rcNoAddr ? null : (TP.S.addrs || TP.fresh().addrs).find(x => x.main); return a ? { name: u.full, kind: 'บุคคลธรรมดา', addr: TP.fmtAddr(a), phone: (a.phone || u.phone).replace(/\D/g, '') } : null; };
const taxWho = () => TP.S.taxWho || meTax();
/* the name on the full invoice belongs to the account; form / done belong to each order */
const T = o => o.tax || (o.tax = { done: null, form: false, who: 'me' });
/* deadline = end of the purchase month (AccountController:524-577) */
const ymd = d => { const [dd, mm, yy] = String(d).split('/').map(Number); return yy * 10000 + mm * 100 + dd; };
const monthEnd = d => { const [, mm, yy] = String(d).split('/').map(Number), last = new Date(yy, mm, 0).getDate(); return `${last}/${String(mm).padStart(2, '0')}/${yy}`; };
const isLate = d => ymd(TP.NOW.date) > ymd(monthEnd(d));
const rcCur = () => TP.cur()?.ctx?.rc;
const maskTax = v => 'xxxxxxxxx' + String(v).slice(-4);
const taxNo = o => 'TX' + o.no;
/* Thai tax id: 13 digits, last one is a check digit (same rule as the national id) */
const taxIdOk = v => { if (!/^\d{13}$/.test(v)) return false; const s = [...v].slice(0, 12).reduce((a, d, i) => a + +d * (13 - i), 0); return (11 - s % 11) % 10 === +v[12]; };
const r2v = x => Math.round(x * 100) / 100;
TP.screen('receipt', {
  group: 'after', title: 'ใบเสร็จรับเงิน', code: 'C402', parent: 'paid',
  states: [['normal', 'รับที่ร้าน พร้อมเพย์'], ['parcel', 'ส่งพัสดุ จ่ายบัตร'], ['notax', 'บัญชียังไม่มีที่อยู่'], ['taxdone', 'ดาวน์โหลดตัวเต็มแล้ว'], ['late', 'เลยกำหนดออกตัวเต็ม'], ['missing', 'ไม่พบใบเสร็จ']],
  notes: ['19/10 เจ้าของเคาะ "โชว์อย่างย่อ … ถ้าต้องการตัวเต็มก็กดดาวน์โหลดได้เองเลย ผมไม่ต้องการให้กดขอ": ใบบนจอ = ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ ทุกใบ · ปุ่ม ดาวน์โหลดใบกำกับภาษีเต็มรูป แตะเดียวได้ไฟล์ ในชื่อและที่อยู่หลักของบัญชี (บุคคลธรรมดาไม่ต้องมีเลขผู้เสียภาษี) · ออกในนามบริษัทหรือแก้ที่อยู่ กดลิงก์ใต้ปุ่ม (บริษัทต้องมีเลข 13 หลัก ตรวจเลขให้ + สาขา)',
    'บัญชีที่ยังไม่มีที่อยู่ (สถานะ บัญชียังไม่มีที่อยู่) ใบเต็มรูปต้องมีที่อยู่ผู้ซื้อ จึงขอที่อยู่ครั้งเดียวก่อนดาวน์โหลด',
    'ผู้ใช้จริง 19/10: เลือก ในนามตัวเอง / ในนามบริษัท ก่อนกดดาวน์โหลด · บริษัทเริ่มที่ช่องว่าง ที่อยู่ตามทะเบียนบริษัท ไม่ใส่เบอร์ส่วนตัว · เลขผู้เสียภาษีพิมพ์มีขีดได้ ระบบเก็บเฉพาะตัวเลข · ดาวน์โหลดแล้วชื่อผิด กด ออกใบใหม่ ใบเดิมยกเลิก · ปุ่มล่างบอกชัดว่าเป็นใบเสร็จหรือใบกำกับภาษี',
    '21/10 เจ้าของ "ใบเสร็จรับเงินอย่างย่อ ขอย่อกว่านี้ ย่อมากๆ": ใบอย่างย่อเหลือ ชื่อบริษัทและเลขผู้เสียภาษี · เลขที่และวันเวลา · รายการยา ค่าส่ง ค่าธรรมเนียมบัตร · รวมทั้งสิ้น (รวมภาษีมูลค่าเพิ่มแล้ว) · นโยบายคืนยา 1 บรรทัด · ตัดข้อมูลผู้ซื้อ ราคาต่อหน่วย ส่วนลด ฿0 และแถวติดต่อ · ใบเต็มรูปยังเป็นแบบเต็ม (ต้องมีชื่อ ที่อยู่ เลขผู้เสียภาษีผู้ซื้อ) · ทำตอนสร้างจริง: ฝ่ายบัญชียืนยันว่าใบอย่างย่อแบบนี้ครบตามสรรพากร',
    '19/10 แถวติดต่อท้ายใบเสร็จ: เว็บไซต์ อีเมล โทร แยกเป็นก้อน ไม่ตัดกลางเบอร์',
    '19/10 เจ้าของสั่ง "หน้าใบเสร็จด้วย" · หน้าตาและคำตามใบเสร็จบนเว็บ bill/receipt_new.blade.php: ใบเสร็จรับเงิน RECEIPT · ข้อมูลร้าน · ผู้ซื้อ · รายการ · หมายเหตุ · ยอด · ปุ่ม ดาวน์โหลด PDF และ พิมพ์',
    'ขอใบกำกับภาษีตามหน้ารายละเอียดคำสั่งซื้อของเว็บ (account_order_history_detail.blade.php:353-397): ขอได้เฉพาะที่จ่ายแล้ว ถึงสิ้นเดือนที่ซื้อ ต้องมีที่อยู่ออกใบที่มีเลขผู้เสียภาษี',
    'ต่างจากเว็บ: ช่องยอดของเว็บเป็นอังกฤษ (Total, PRO/DISC., Net Total) และไม่มีค่าจัดส่ง/ค่าธรรมเนียมบัตร ทำให้บวกไม่ตรงยอดจ่าย แอปใช้คำไทยจากหน้าจ่ายบิลเภสัชกร และใส่ 2 แถวนี้ให้ครบ',
    'ต่างจากเว็บ: เลขผู้เสียภาษีในตัวเลือกปิดไว้เหลือ 4 ตัวท้าย (เว็บโชว์เต็ม) · แก้คำผิดในหมายเหตุของเว็บ (เงือนไข / ระเอียด)',
    'ไม่ใส่ปุ่ม ซื้ออีกครั้ง (ยาอันตรายต้องผ่านเภสัชกร) และ รีวิวสินค้า (มีให้คะแนนการปรึกษาแล้ว)',
    'เปิดได้จาก: หน้าชำระสำเร็จ · กล่องแจ้งเตือน (ใบเสร็จรับเงิน) · ประวัติ (ปุ่มใต้แถวที่ซื้อยา) · ใบสรุปการปรึกษา · ทุกทางเปิดใบเสร็จของการปรึกษานั้นตามเลขเคส ไม่เปิดหรือเปลี่ยนการปรึกษา',
    'ต่างจากเว็บ: ยอดเขียนสตางค์เฉพาะเมื่อไม่เป็นศูนย์ (฿385, ฿399.05) ตามรูปแบบเงินของแอป · เว็บเขียน .00 ทุกยอด',
    '19/10 เจ้าของเคาะ "ตามนโยบาย": หมายเหตุคืนสินค้าเปลี่ยนเป็น ยาไม่รับคืน ยกเว้นร้านจัดยาผิด แจ้งภายใน 3 วัน (นโยบายคืนเงิน 04/09) · เว็บยังเขียน สินค้าซื้อแล้วไม่สามารถเปลี่ยนคืนได้',
    'การปรึกษาเก่าในต้นแบบไม่มีรายการสั่งซื้อจริง ใบเสร็จสร้างจากยาในใบสรุป ราคารวมเท่ายอด "ซื้อยา" ในประวัติ'],
  wait: ['ใบเสร็จบนเว็บไม่มีแถวค่าจัดส่งและค่าธรรมเนียมบัตร ให้แก้ฝั่งเว็บตามแอปไหม',
    'ในแอปมือถือ ปุ่ม พิมพ์ ควรเป็น แชร์ (ส่งต่อ/พิมพ์จากเมนูเครื่อง) ไหม',
    'ฝ่ายบัญชียืนยันก่อนทำจริง: ออกใบกำกับภาษีอย่างย่อได้ในธุรกิจขายปลีก · เลขที่ใบเต็มรูปแยกชุดจากเลขบิล'],
  prep(S) {
    const st = S.st.receipt || 'normal'; if (st === 'missing') return;
    mockPaid(st === 'parcel' ? 'parcel' : 'pickup', st === 'parcel' ? 'card' : 'promptpay', st === 'late' ? '18/09/2026' : TP.NOW.date);
    S.taxWho = null; S.taxCo = null; S.rcNoAddr = st === 'notax';
    C().order.tax = { done: st === 'taxdone' ? meTax() : null, form: false, who: 'me' };
  },
  render(ctx) {
    const id = ctx.params?.id, o = ctx.rc = ctx.state === 'missing' ? null : id ? rcOf(id) : rcOf() || order();
    if (!o) return ui.nav({ back: true, title: 'ใบเสร็จรับเงิน' }) + ui.page(ui.empty({ icon: 'receipt', title: 'ไม่พบใบเสร็จนี้', body: 'การปรึกษานี้ไม่ได้ซื้อยา หรือยังไม่ได้ชำระเงิน', btn: { label: 'ดูประวัติ', a: 'rcHistory' } }));
    const pd = o.paid, u = TP.S.user, t = T(o), late = isLate(pd.date);
    const buyerAddr = pd.addr || (TP.S.rcNoAddr ? null : (TP.S.addrs || []).find(a => a.main));
    const done = t.done;
    const nItems = o.items.reduce((s, i) => s + qty(i.qty), 0);
    /* owner 21/10 "ใบเสร็จรับเงินอย่างย่อ ขอย่อกว่านี้ ย่อมากๆ": only what an abbreviated tax invoice needs (seller + tax id, number, date, items, total incl. VAT) · the full invoice keeps the long layout */
    const shortDoc = `<article class="rc-doc rc-short" data-in="1" aria-label="ใบเสร็จรับเงิน เลขที่ ${esc(o.no)}">
      <header class="rc-hd"><h2><span class="rc-nw">ใบเสร็จรับเงิน/</span><span class="rc-nw">ใบกำกับภาษีอย่างย่อ</span></h2><span class="rc-logo">${brand.logo('wmen', { style: 'width:96px;height:15.1px' })}</span></header>
      <p class="rc-sl">บริษัท มิตรอารีแคร์ จำกัด (สำนักงานใหญ่)<br>เลขประจำตัวผู้เสียภาษี <span class="num">0105569024564</span></p>
      <p class="rc-sl">เลขที่ <span class="num">${esc(o.no)}</span> · <span class="num">${esc(pd.date)} ${esc(pd.at)}</span></p>
      <div class="rc-ln">${o.items.map(i => `<p><span>${esc(i.name)} ×${esc(i.qty)}</span><b class="num">${TP.money(i.price)}</b></p>`).join('')}${pd.ship ? `<p><span>${esc(SHIP_L(pd))}</span><b class="num">${TP.money(pd.ship)}</b></p>` : ''}${pd.fee ? `<p><span>ค่าธรรมเนียมบัตร (3.65%)</span><b class="num">${TP.money(pd.fee)}</b></p>` : ''}</div>
      <p class="rc-tt"><span>รวมทั้งสิ้น<small>รวมภาษีมูลค่าเพิ่ม 7% แล้ว</small></span><b class="num">${TP.money(pd.total)}</b></p>
      <p class="rc-ft">ยาไม่รับคืน ยกเว้นร้านจัดยาผิด แจ้งภายใน 3 วัน</p></article>`;
    const doc = !done ? shortDoc : `<article class="rc-doc" data-in="1" aria-label="ใบเสร็จรับเงิน เลขที่ ${esc(o.no)}">
      <header class="rc-hd"><div><h2><span>ใบเสร็จรับเงิน/</span><span>${done ? 'ใบกำกับภาษี' : 'ใบกำกับภาษีอย่างย่อ'}</span></h2><p>${done ? 'RECEIPT/TAX INVOICE' : 'RECEIPT/ABBREVIATED TAX INVOICE'}</p></div><span class="rc-logo">${brand.logo('wmen', { style: 'width:150px;height:23.6px' })}</span></header>
      <div class="rc-seller"><b>บริษัท มิตรอารีแคร์ จำกัด</b><span>สำนักงานใหญ่</span><span>123/120 หมู่ที่ 1 ซ.8 ถ.เทศบาลบางแก้ว 1 ต.บางพลีใหญ่ อ.บางพลี จ.สมุทรปราการ 10540 โทร: ${esc(TP.STORE.cs)}</span><span>เลขประจำตัวผู้เสียภาษีอากร: 0105569024564</span></div>
      <dl class="rc-buyer"><dt>ชื่อผู้ซื้อ/Name:</dt><dd>${esc(done ? done.name : u.full)}${done?.branch ? ` (${esc(done.branch)})` : ''}</dd><dt>เลขที่บิล:</dt><dd class="num">${esc(o.no)}</dd>${done ? `<dt>เลขที่ใบกำกับภาษี:</dt><dd class="num">${esc(taxNo(o))}</dd>` : ''}
        <dt>ที่อยู่/Address:</dt><dd>${done ? esc(done.addr) : buyerAddr ? esc(TP.fmtAddr(buyerAddr)) : '-'}</dd><dt>โทร:</dt><dd class="num">${esc(done ? done.phone || '-' : buyerAddr?.phone || u.phone)}</dd>
        ${done?.id ? `<dt>เลขประจำตัวผู้เสียภาษีอากร:</dt><dd class="num">${esc(done.id)}</dd>` : ''}<dt>รหัสลูกค้า:</dt><dd class="num">000142</dd><dt>วันที่:</dt><dd class="num">${esc(pd.date)}</dd></dl>
      <table class="rc-items"><thead><tr><th scope="col">ลำดับ</th><th scope="col">รายการ</th><th scope="col">จำนวน</th><th scope="col">จำนวนเงิน</th></tr></thead>
        <tbody>${o.items.map((i, n) => `<tr><td class="num">${n + 1}</td><td>${esc(i.name)}<small>ราคาต่อหน่วย ${TP.money(i.price / qty(i.qty))}</small></td><td>${esc(i.qty)}</td><td class="num">${TP.money(i.price)}</td></tr>`).join('')}</tbody></table>
      <div class="rc-sum">${ui.kv([['จำนวนชิ้น', String(nItems)], ['ยอดค่ายา', TP.money(pd.items)], ['ส่วนลด', TP.money(0)], [SHIP_L(pd), TP.money(pd.ship || 0)], ...(pd.fee ? [['ค่าธรรมเนียมบัตร (3.65%)', TP.money(pd.fee)]] : []), ...(done ? [['มูลค่าก่อนภาษี', TP.money(r2v(pd.total / 1.07))], ['ภาษีมูลค่าเพิ่ม 7%', TP.money(r2v(pd.total - r2v(pd.total / 1.07)))]] : []), ['ยอดชำระ', TP.money(pd.total), 'tot']])}${done ? '' : '<p class="rc-vat">ราคานี้รวมภาษีมูลค่าเพิ่ม 7% แล้ว</p>'}</div>
      <div class="rc-note"><b>หมายเหตุ</b><p>- กรุณาตรวจสอบรายการและเงื่อนไขอย่างละเอียด</p><p>- ยาไม่รับคืน ยกเว้นร้านจัดยาผิด แจ้งภายใน 3 วัน</p></div>
      <p class="rc-contact"><span>www.mitraree.com</span><span>hello@mitraree.com</span><span>โทร ${esc(TP.STORE.cs)}</span></p></article>`;
    return ui.nav({ back: true, title: 'ใบเสร็จรับเงิน' }) + ui.page(doc + `<div id="rcTax" class="mt24" data-in="2">${taxBox(o, late)}</div>`, {}) +
      ui.dock(`<div class="btn-row rc-acts">${ui.btn(done ? 'ดาวน์โหลดใบกำกับภาษี' : 'ดาวน์โหลดใบเสร็จ', { icon: 'download', a: 'rcPdf' })}${ui.btn('พิมพ์', { kind: 'secondary', a: 'rcPrint' })}</div>`);
  },
  mount(el) {
    el.addEventListener('input', e => { const fd = e.target.closest('#rcTax .field.err'); if (fd && e.target.value.trim()) { fd.classList.remove('err'); $('.pay-err', fd)?.remove(); } });
  }
});
/* full invoice in your own name (one tap) or a company (filled once, real-user R 19/10: pick before the tap)
   a wrong name after download = issue a new one, the old one is cancelled (as a shop does on paper) */
const coTax = () => TP.S.taxCo || null;
const whoOf = t => (t.who === 'co' ? coTax() : taxWho());
function taxForm(t, until) {
  const co = t.who === 'co', w = whoOf(t);
  const f = t.f && t.f.co === co ? t.f : (t.f = { co, name: w?.name || (co ? '' : TP.S.user.full), id: w?.id || '', branch: w?.branch || 'สำนักงานใหญ่', addr: w?.addr || '', err: {} });
  const fld = (id, label, v, o = {}) => `<div class="field${f.err[o.k] ? ' err' : ''}"><label for="${id}">${esc(label)}${o.opt ? '' : '<span class="req" aria-hidden="true">*</span>'}</label>${o.area ? `<textarea id="${id}" class="input" rows="2" data-tf="${o.k}">${esc(v)}</textarea>` : `<input id="${id}" class="input" data-tf="${o.k}" value="${esc(v)}"${o.im ? ` inputmode="${o.im}"` : ''}${o.max ? ` maxlength="${o.max}"` : ''}>`}${f.err[o.k] ? `<p class="pay-err" role="alert">${esc(f.err[o.k])}</p>` : ''}</div>`;
  const lead = co ? 'กรอกครั้งเดียว ครั้งหน้าใช้ข้อมูลบริษัทนี้ให้เลย' : w ? 'แก้ชื่อหรือที่อยู่ที่จะพิมพ์ ครั้งหน้าใช้ข้อมูลนี้ให้เลย' : 'บัญชียังไม่มีที่อยู่ ใบเต็มรูปต้องมีที่อยู่ผู้ซื้อ กรอกครั้งเดียว';
  return `<p class="small">${lead}</p>
    ${fld('rcTfName', co ? 'ชื่อบริษัท' : 'ชื่อ-นามสกุล', f.name, { k: 'name' })}
    ${fld('rcTfId', co ? 'เลขประจำตัวผู้เสียภาษี 13 หลัก' : 'เลขประจำตัวผู้เสียภาษี 13 หลัก (ถ้ามี)', f.id, { k: 'id', im: 'numeric', max: 17, opt: !co })}
    ${co ? fld('rcTfBr', 'สาขา', f.branch, { k: 'branch' }) : ''}
    ${fld('rcTfAddr', co ? 'ที่อยู่ตามทะเบียนบริษัท' : 'ที่อยู่ที่จะพิมพ์บนใบกำกับภาษี', f.addr, { k: 'addr', area: true })}
    ${ui.btn('บันทึกและดาวน์โหลด (PDF)', { a: 'rcTaxSave', icon: 'download' })}${w ? ui.btn('ยกเลิก', { kind: 'ghost', a: 'rcTaxFormX' }) : ''}`;
}
function taxBox(o, late) {
  const t = T(o), until = monthEnd(o.paid.date);
  if (late) return ui.note(`ใบนี้ใช้เป็นใบกำกับภาษีอย่างย่อได้ ส่วนใบเต็มรูปดาวน์โหลดได้ถึง ${until} (สิ้นเดือนที่ซื้อ) ซึ่งเลยมาแล้ว หากยังต้องการ กรุณาติดต่อร้าน`, { icon: 'clock' }) + `<div class="mt16">${ui.callHelp({ title: '' })}</div>`;
  if (t.done) return `<div class="rc-ok" role="status">${ic('circle-check', 20, 2)}<span>ดาวน์โหลดใบกำกับภาษีเต็มรูปแล้ว ในนาม ${esc(t.done.name)} เลขที่ ${esc(taxNo(o))}${t.n > 1 ? ' (ใบใหม่ ใบเดิมยกเลิกแล้ว)' : ''} · ไฟล์ PDF อยู่ในเครื่องแล้ว</span></div>
    <div class="rc-tdone mt12">${ui.btn('ดาวน์โหลดอีกครั้ง', { kind: 'secondary', icon: 'download', a: 'rcTaxPdf' })}<button type="button" class="link rc-tnew" data-a="rcTaxRe">${ic('refresh-cw', 16, 2.2)}<span>ชื่อผิด หรือต้องการในนามบริษัท ออกใบใหม่</span></button></div>`;
  const co = t.who === 'co', w = whoOf(t);
  const body = t.form || !w ? taxForm(t, until) : `<dl class="rc-twho"><dt>ในนาม</dt><dd>${esc(w.name)}${w.branch ? ` (${esc(w.branch)})` : ''}${w.id ? `<small class="num">เลขผู้เสียภาษี ${esc(maskTax(w.id))}</small>` : ''}</dd><dt>ที่อยู่</dt><dd>${esc(w.addr)}</dd></dl>
    ${ui.btn('ดาวน์โหลดใบกำกับภาษีเต็มรูป (PDF)', { a: 'rcTaxSend', id: 'rcTaxSend', icon: 'download', kind: 'secondary' })}
    <button type="button" class="link rc-tnew" data-a="rcTaxNew">${ic('pencil', 16, 2.2)}<span>${co ? 'แก้ข้อมูลบริษัท' : 'แก้ชื่อหรือที่อยู่'}</span></button>`;
  return `<div class="rc-tax"><h3 class="h3">ใบกำกับภาษีเต็มรูป</h3><p class="small">ใช้เบิกบริษัทหรือยื่นภาษี · ดาวน์โหลดได้ถึง ${until} (สิ้นเดือนที่ซื้อ)</p>
    ${ui.seg('rcTaxWho', [['me', 'ในนามตัวเอง'], ['co', 'ในนามบริษัท']], co ? 'co' : 'me', { a: 'rcTaxWho', label: 'ออกใบกำกับภาษีในนาม' })}
    ${body}</div>`;
}
const redrawTax = () => { const box = $('#rcTax'), o = rcCur(); if (!box || !o) return; box.innerHTML = taxBox(o, isLate(o.paid.date)); TP.icons(box); A(box, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { d: 320, e: E.out }); };
async function issue(b, o, who) {
  b.disabled = true; b.classList.add('busy'); $('span', b).textContent = 'กำลังเตรียมไฟล์...';
  await TP.wait(900);
  const t = T(o); t.form = false; t.done = who; TP.refresh({ anim: false });
  TP.notify(t.n > 1 ? 'ออกใบใหม่แล้ว ใบเดิมยกเลิก บันทึก PDF ลงเครื่องแล้ว' : 'บันทึกใบกำกับภาษีเต็มรูป PDF ลงเครื่องแล้ว', { icon: 'download' });
}
TP.act('rcTaxWho', b => { const o = rcCur(); if (!o) return; const t = T(o); t.who = b.dataset.v; t.form = false; t.f = null; redrawTax(); if (t.who === 'co' && !coTax()) $('#rcTfName')?.focus({ preventScroll: true }); });
TP.act('rcTaxSend', b => { const o = rcCur(); if (!o) return; const w = whoOf(T(o)); if (!w) return; return issue(b, o, w); });
TP.act('rcTaxNew', () => { const o = rcCur(); if (!o) return; T(o).form = true; redrawTax(); $('#rcTfName')?.focus(); });
TP.act('rcTaxFormX', () => { const o = rcCur(); if (!o) return; const t = T(o); t.form = false; t.f = null; redrawTax(); });
TP.act('rcTaxRe', () => { const o = rcCur(); if (!o) return; const t = T(o); t.done = null; t.n = (t.n || 1) + 1; t.form = false; TP.refresh({ anim: false }); });
/* a tax id is printed with dashes on company papers: keep the digits only */
const readTf = f => document.querySelectorAll('#rcTax [data-tf]').forEach(x => { f[x.dataset.tf] = x.dataset.tf === 'id' ? x.value.replace(/\D/g, '') : x.value.trim(); });
TP.act('rcTaxSave', async b => {
  const o = rcCur(); if (!o) return; const t = T(o), f = t.f, co = f.co; readTf(f);
  f.err = {};
  if (!f.name) f.err.name = co ? 'ใส่ชื่อบริษัท' : 'ใส่ชื่อ-นามสกุล';
  if ((f.id || co) && !taxIdOk(f.id)) f.err.id = /^\d{13}$/.test(f.id) ? 'เลขนี้ไม่ถูกต้อง ตรวจอีกครั้ง' : 'ใส่ตัวเลข 13 หลัก';
  if (!f.addr) f.err.addr = co ? 'ใส่ที่อยู่ตามทะเบียนบริษัท' : 'ใส่ที่อยู่ที่จะพิมพ์บนใบกำกับภาษี';
  if (co && !f.branch) f.err.branch = 'ใส่สาขา เช่น สำนักงานใหญ่';
  if (Object.keys(f.err).length) { redrawTax(); $('#rcTax .field.err input, #rcTax .field.err textarea')?.focus(); return; }
  const rec = { name: f.name, kind: co ? 'นิติบุคคล' : 'บุคคลธรรมดา', id: f.id, addr: f.addr, phone: co ? '' : TP.S.user.phone.replace(/\D/g, ''), branch: co ? f.branch : '' };
  if (co) TP.S.taxCo = rec; else { TP.S.taxWho = rec; TP.S.rcNoAddr = false; }
  t.f = null;
  return issue(b, o, rec);
});
TP.act('rcTaxPdf', () => TP.notify('บันทึกใบกำกับภาษีเต็มรูป PDF อีกครั้งแล้ว', { icon: 'download' }));
TP.act('rcPdf', () => TP.notify(rcCur()?.tax?.done ? 'บันทึกใบกำกับภาษีเต็มรูป PDF ลงเครื่องแล้ว' : 'บันทึกใบเสร็จ/ใบกำกับภาษีอย่างย่อ PDF ลงเครื่องแล้ว', { icon: 'download' }));
TP.act('rcPrint', () => TP.notify('เปิดหน้าพิมพ์ใบเสร็จ', { icon: 'file-text' }));
TP.act('rcHistory', () => TP.tab('history'));
/* hooks 70-after.js calls: a receipt link under a paid history row, and a receipt row in its summary */
/* the pickup code stays findable after the case closes: home and the summary (real-user R2: "รหัสรับยาอยู่ไหน") */
TP.orderReadyRow = (S, o = {}) => {
  const c = S.case; if (!c || c.order?.status !== 'paid' || c.order.picked || (c.status !== 'closed' && !c.order.paid?.stage)) return '';
  const pd = c.order.paid || {}, pick = (pd.recv || 'pickup') === 'pickup', b = TP.branch(c.branch);
  if (o.ship && pick) return '';
  const code = (c.order.no || 'MT7K2Q9XR4A').slice(-4), st = pd.stage;
  const late = pick && pickLate(pd), title = pick ? (late ? `เลยกำหนดรับยา · รหัส ${code}` : st ? `ยาพร้อมรับแล้ว · รหัส ${code}` : `รหัสรับยา ${code}`) : `${pd.recv === 'express' ? 'จัดส่งด่วน' : pd.recv === 'cold' ? 'ส่งแบบควบคุมความเย็น' : 'จัดส่งพัสดุ'} · ${st ? (pd.recv === 'express' ? 'ไรเดอร์รับยาแล้ว' : 'ส่งแล้ว') : 'กำลังเตรียมยา'}`;
  const sub = pick ? (late ? `${b.name} · ร้านจะโทรหาเพื่อตกลงเรื่องยาและการคืนเงิน` : st ? `${b.name} · รับได้ถึง ${holdUntil(pd)}` : `${b.name} · แตะเพื่อดู QR และสถานะ`) : st && trackTxt(pd) ? `${trackTxt(pd)} · แตะเพื่อติดตาม` : 'แตะเพื่อดูสถานะคำสั่งซื้อ';
  return ui.group([ui.row({ icon: pick ? 'store' : pd.recv === 'cold' ? 'snowflake' : 'package', title, sub, go: pick ? 'paid' : 'track' })], { din: o.din });
};
TP.receiptSumRow = h => h?.bought ? ui.group([ui.row({ icon: 'receipt', title: 'ใบเสร็จรับเงิน', sub: `ซื้อยา ${TP.money(h.bought)} · ใบกำกับภาษีอย่างย่อ ดาวน์โหลดตัวเต็มได้เอง`, go: 'receipt', p: { id: h.id } })], { din: 3 }) : '';
})();

/* ===== 70-after.js ===== */
/* =====================================================================
   70 · After the consult + account (helper B)
        summary, history, ADR report + sent, inbox, account, household members,
        member edit, health record, consents, delete account, deleted, help
   ===================================================================== */
(() => {
const { $, $$, esc, ic, ui, brand, A, E, SP } = TP;
const MAX_FAMILY = 6;
const MON = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const CS_TEL = '098-035-8000';

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
const BACK_L = { home: 'หน้าแรก', account: 'บัญชี', history: 'ประวัติ', intake: 'แจ้งอาการ', family: 'สมาชิก', summary: 'ใบสรุป', inbox: 'แจ้งเตือน', health: 'ข้อมูลสุขภาพ', consents: 'ความยินยอม', adrsent: 'กลับ' };
const backL = fb => BACK_L[TP.hist?.[TP.hist.length - 1]?.id || fb] || 'กลับ';
const personOf = id => !id || id === 'me' ? TP.S.user : TP.S.family.find(f => f.id === id);
const whoLabel = id => { if (!id || id === 'me') return 'ตัวเอง'; const p = TP.S.family.find(f => f.id === id); return p ? `${first(p.name)} (${p.rel})` : 'สมาชิกในบ้าน'; };
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
  return { id: c.id, date: c.date || TP.NOW.date, time: c.joinedAt || TP.NOW.time, who: c.who, topic: (c.symptoms || []).join(' ') || 'ถามเรื่องยา', branch: c.branch, pharm: c.pharm || 'kj', bought: c.order?.status === 'paid' ? (c.order.total || 0) : 0, orderStatus: c.order?.status || 'none', outcome:c.outcome, rated: c.rated || 0, comment: c.comment, fbSent: c.fbSent, summary: true, _case: c };
}
function allHistory(S) {
  const c = S.case, out = [...S.history];
  if (c && c.status === 'closed' && !out.some(h => h.id === c.id)) out.unshift(caseItem(c));
  return out.filter(h=>!h.who||h.who==='me');
}
function sumOf(h) {
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
    advice: quiet ? ['การปรึกษาปิดก่อนเภสัชกรให้คำแนะนำ เพราะไม่มีข้อความจากคุณ 5 นาที', 'ยังมีอาการ ปรึกษาใหม่ได้ทันที ไม่มีค่าปรึกษา'] : [...(k?.adv || ['พักผ่อนให้เพียงพอ ดื่มน้ำมาก ๆ']), ...(items.length ? ['ใช้ยาตามวิธีในข้อ 3 อ่านฉลากก่อนใช้ทุกครั้ง'] : [])],
    meds: items.map(i => ({ name: i.name || i.n || 'ยา', qty: i.qty || '', how: i.how || i.u || '' })),
    warn: ['หายใจลำบาก หรือเจ็บแน่นหน้าอก', 'ไข้สูงเกิน 39 องศา หรือไข้ไม่ลดภายใน 3 วัน', 'มีผื่นขึ้น ปาก หน้า หรือตาบวมหลังใช้ยา'],
    follow: quiet ? 'ปรึกษาใหม่ได้ทุกเมื่อ' : 'ถ้าอาการไม่ดีขึ้นใน 3 วัน ปรึกษาใหม่ได้ทุกเมื่อ'
  };
}
function closedCase() {
  const items = TP.ORDER_ITEMS;
  return { id: 'TC-261018-0142', who: 'me', symptoms: ['ไข้', 'เจ็บคอ'], urgent: [], note: 'เป็นมา 2 วัน กลืนแล้วเจ็บ', photos: 0, mode: 'chat', branch: 'tw', pharm: 'kj', status: 'closed', pos: 0, joinedAt: '14:12', order: { status: 'paid', items, total: items.reduce((s, i) => s + i.price, 0) }, rated: 0, msgs: [] };
}

/* =====================================================================
   Summary (C13): the document
   ===================================================================== */
const RATE_L = ['', 'ต้องปรับปรุง', 'พอใช้', 'ดี', 'ดีมาก', 'ดีเยี่ยม'];
function summaryTarget(ctx) {
  const S = ctx.S, st = ctx.state, all = allHistory(S);
  if (st === 'missing') return null;
  let id = ctx.params.id;
  if (!id && st === 'nomeds') id = all.find(h => !h.bought)?.id;
  if (!id && st === 'closed' && S.case?.status === 'closed') id = S.case.id;
  return id ? all.find(h => h.id === id) : all[0];
}
function docHtml(S, h) {
  const P = TP.PHARM[h.pharm] || TP.PHARM.kj, b = TP.branch(h.branch) || TP.branch(), sm = sumOf(h);
  const p = h.who && h.who !== 'me' ? S.family.find(f => f.id === h.who) : null;
  const identity = historyIdentity(S,h.who,h);
  const who = `${identity.name} · ${identity.rel}${p?.age ? ` · ${p.age} ปี` : ''}`;
  const band = () => brand.guilloche({ kind: 'band', w: 360, h: 26, y0: 6, y1: 21, n: 6, lambda: 40, a: 4 });
  const meds = sm.meds.length
    ? `<ul class="af-meds">${sm.meds.map(m => `<li><span class="af-med-i">${TP.medicineImage(m) || ic('pill', 18, 2)}</span><div class="grow"><b>${esc(m.name)}</b>${m.qty ? `<small>${esc(m.qty)}</small>` : ''}${m.how ? `<p>${esc(m.how)}</p>` : ''}</div></li>`).join('')}</ul>`
    : `<p class="af-nomed">${ic('circle-check', 18, 2)}<span>${esc(sm.nomed || 'ไม่มียาในการปรึกษาครั้งนี้ ดูแลตามคำแนะนำข้อ 2')}</span></p>`;
  return `<article class="af-doc" data-in="1" aria-label="ใบสรุปการปรึกษา">
    <header class="af-doc-h">${brand.guilloche({ w: 360, h: 230, cx: 350, cy: 0, n: 16, r0: 24, r1: 250, k: 18, a: 7 })}
      <div class="af-doc-cap"><span class="caps">ใบสรุปการปรึกษา</span><span class="af-doc-no">${esc(h.id)}</span></div>
      <h2 class="af-doc-t">${esc(h.topic)}</h2>
      <p class="af-doc-m">${ic('calendar', 15, 2)}<span>${esc(h.date)} · ${esc(h.time)}</span></p>
      <p class="af-doc-m">${ic('store', 15, 2)}<span>${esc(b.name)}</span></p>
      <p class="af-doc-m">${ic('user', 15, 2)}<span>${esc(who)}</span></p>
      <div class="af-band">${band()}</div>
    </header>
    <div class="af-ph">${ui.av('', { ini: P.ini, size: 'lg' })}<div class="grow"><b>${esc(P.name)}</b><span>เภสัชกรผู้ให้คำปรึกษา</span><span class="af-lic">${ic('badge-check', 15, 2)}ใบอนุญาตประกอบวิชาชีพ ${esc(P.lic)}</span></div></div>
    <section class="af-sec"><h3><i>1</i>อาการที่แจ้ง</h3><p>${esc(sm.sym)}</p></section>
    <section class="af-sec"><h3><i>2</i>คำแนะนำ</h3><ul class="af-ul">${sm.advice.map(a => `<li>${esc(a)}</li>`).join('')}</ul></section>
    <section class="af-sec"><h3><i>3</i>ยาที่ได้รับ</h3>${meds}</section>
    <section class="af-summary-alert" aria-label="อาการที่ควรพบแพทย์">${ui.note(`<b>ไปพบแพทย์ทันทีถ้า</b><ul class="af-ul">${sm.warn.map(a => `<li>${esc(a)}</li>`).join('')}</ul>`, {tone:'danger'})}</section>
    ${(f => f ? `<p class="af-follow">${ic('rotate-ccw', 15, 2)}<span>${esc(f)}</span></p>` : '')(TP.followDocLine?.(h) || sm.follow)}
    <footer class="af-doc-f"><div class="grow"><span class="af-sig">${esc(P.name)}</span><small>ลงชื่อเภสัชกร · ${esc(P.lic)}</small><small>เก็บไว้ถึง ${plusYear(h.date)}</small></div>${brand.halo(64, { cls: 'af-seal', draw: true, still: true, check: true })}</footer>
    <div class="af-band b">${band()}</div>
  </article>`;
}
function rateHtml(h) {
  const r = h.rated || 0;
  return `<section class="card af-rate" data-in="2" aria-label="ให้คะแนนการปรึกษา">
    <h3 class="h3">การปรึกษาครั้งนี้เป็นอย่างไร</h3>
    <p class="small">${r ? 'แตะดาวเพื่อเปลี่ยนคะแนนได้' : 'คะแนนของคุณช่วยให้เราดูแลได้ดีขึ้น'}</p>
    <div class="af-stars">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="af-star${n <= r ? ' on' : ''}" data-a="afRate" data-v="${n}" aria-pressed="${n === r}" aria-label="ให้ ${n} ดาว จาก 5">${ic('star', 30, 1.6)}</button>`).join('')}</div>
    <p class="af-rate-l" aria-live="polite">${r ? `${r} ดาว · ${RATE_L[r]}` : ''}</p>
    ${rvHtml('afRateMore', false, `${ui.field({ id: 'afCmt', label: 'อยากบอกอะไรเพิ่มเติม', optional: true, textarea: true, rows: 3, placeholder: 'เช่น เภสัชกรอธิบายเข้าใจง่าย', max: 300 })}${ui.btn('ส่งความเห็น', { kind: 'tint', a: 'afRateSend', cls: 'mt12' })}`)}
    <p class="af-thanks"${h.fbSent ? '' : ' hidden'}>${ic('circle-check', 16, 2)}<span>ขอบคุณสำหรับความเห็น</span></p>
  </section>`;
}
TP.screen('summary', {
  group: 'after', title: 'ใบสรุปการปรึกษา', code: 'C401', ref: 'C13', parent: 'history',
  states: [['normal', 'มียา'], ['nomeds', 'ไม่ได้ซื้อยา'], ['closed', 'เพิ่งจบเคส'], ['rated', 'ให้คะแนนแล้ว'], ['missing', 'ไม่พบใบสรุป']],
  notes: ['C13: 4 หัวข้อ · ช่อง "ไปพบแพทย์ทันทีถ้า" เด่นที่สุด', 'ได้ใบสรุปทุกครั้ง แม้ไม่ได้ซื้อยา', 'หัวใบ: เภสัชกร + เลขใบอนุญาต สาขา วันเวลา เลขเคส · ตราประทับ Halo', 'K08: ให้ดาว 1-5 + ความเห็น (ไม่บังคับ) บันทึกกับเคสนี้', 'A4: เก็บ 1 ปีนับจากวันปิดเคส · บันทึกเป็นรูปลงเครื่องได้'],
  wait: ['ข้อความในใบสรุปจริงมาจากคอนโซลเภสัชกร (ตอนนี้เป็นตัวอย่าง)'],
  prep(S) {
    const st = S.st.summary; if (!st) return;
    const c = TP.cur(); if (c?.id === 'summary') delete c.params.id;
    if (!S.history.length) S.history = TP.fresh().history;
    if (st === 'closed' && S.case?.status !== 'closed') S.case = closedCase();
    if (st === 'normal') Object.assign(S.history[0], { rated: 0, fbSent: false });
    if (st === 'rated') Object.assign(S.history[0], { rated: 5, fbSent: true });
  },
  render(ctx) {
    const S = ctx.S, h = ctx.h = summaryTarget(ctx);
    const nav = ui.nav({ back: backL('history'), title: 'ใบสรุปการปรึกษา', right: h ? `<button type="button" class="ibtn" data-a="afSaveImg" aria-label="บันทึกเป็นรูปลงเครื่อง">${ic('download', 22, 1.9)}</button>` : '' });
    if (!h) return nav + ui.page(ui.empty({ icon: 'file-text', title: 'ไม่พบใบสรุปนี้', body: 'ใบสรุปเก็บ 1 ปีนับจากวันปิดเคส', btn: { label: 'ดูประวัติ', a: 'afTabHistory' } }));
    return nav + ui.page(`${docHtml(S, h)}${h&&(h._case||S.case?.id===h.id)?TP.paymentReminderCard?.(S,h._case||S.case)||'':''}${TP.followSumCard?.(h) || ''}${h && TP.S.case?.id === h.id ? TP.orderReadyRow?.(TP.S, { din: 3 }) || '' : ''}${TP.receiptSumRow?.(h) || ''}${rateHtml(h)}
      <div class="af-acts" data-in="3">${ui.btn('แจ้งอาการหลังใช้ยา', { kind: 'tint', icon: 'heart-pulse', go: 'adr', p: { from: h.id } })}${ui.btn('บันทึกเป็นรูปลงเครื่อง', { kind: 'secondary', icon: 'download', a: 'afSaveImg' })}</div>
      <p class="af-foot">${ic('lock', 14, 2)}<span>ได้ใบสรุปทุกครั้งที่ปรึกษา แม้ไม่ได้ซื้อยา · เก็บไว้ 1 ปีนับจากวันปิดเคส</span></p>`);
  }
});
TP.act('afSaveImg', async t => {
  if (t.classList.contains('btn')) { t.classList.add('busy'); await TP.wait(RM() ? 50 : 600); t.classList.remove('busy'); }
  TP.notify('บันทึกใบสรุปเป็นรูปลงเครื่องแล้ว', { icon: 'download' });
});
TP.act('afRate', (t, ctx) => {
  const h = ctx?.h, el = curEl(); if (!h || !el) return;
  const n = +t.dataset.v;
  h.rated = n; if (h._case) h._case.rated = n;
  $$('.af-star', el).forEach((s, i) => {
    s.classList.toggle('on', i < n); s.setAttribute('aria-pressed', String(i + 1 === n));
    if (i < n && !RM()) A($('svg', s), [{ transform: 'scale(.4) rotate(-20deg)' }, { transform: 'none' }], { d: SP.spring.d, e: SP.spring.e, delay: i * 55, fill: 'backwards' });
  });
  $('.af-rate-l', el).textContent = `${n} ดาว · ${RATE_L[n]}`;
  if (!h.fbSent) rv($('#afRateMore', el), true);
  TP.emit('state');
});
TP.act('afRateSend', async (t, ctx) => {
  const h = ctx?.h, el = curEl(); if (!h || !el) return;
  t.classList.add('busy'); await TP.wait(RM() ? 50 : 550);
  h.comment = ($('#afCmt', el)?.value || '').trim(); h.fbSent = true;
  if (h._case) Object.assign(h._case, { comment: h.comment, fbSent: true });
  rv($('#afRateMore', el), false);
  const th = $('.af-thanks', el); th.hidden = false; pop(th, 120);
  TP.notify('ขอบคุณสำหรับความเห็น', { icon: 'check' });
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
  return ({completed:{key:'completed',label:'ปรึกษาสำเร็จ',tone:'ok',reason:'เภสัชกรสรุปและจบการปรึกษาแล้ว'},'customer-ended':{key:'customer-ended',label:'คุณจบการสนทนา',tone:'muted',reason:'คุณเลือกจบการสนทนาก่อนเภสัชกรสรุป'},'no-response':{key:'no-response',label:'ไม่ได้รับการตอบกลับ',tone:'warn',reason:'สิ้นสุดการสนทนา เนื่องจากไม่มีการตอบกลับภายใน 5 นาที'}})[key] || {key:'unknown',label:'สิ้นสุดการสนทนา',tone:'muted',reason:'ไม่มีข้อมูลผลการปรึกษาเดิม'};
}
function historyItems(S, who = S._histWho || 'all', list = allHistory(S)) {
  const q=String(S._histQuery||'').trim().toLocaleLowerCase('th'),type=['all','completed','ended'].includes(S._histStatus)?S._histStatus:'all';
  return list.filter(h=>(h.who||'me')==='me'&&(type==='all'||(type==='completed'?historyOutcome(S,h).key==='completed':historyOutcome(S,h).key!=='completed'))&&(!q||[h.topic,h.date,h.id,TP.PHARM[h.pharm]?.name,TP.PHARM[h.pharm]?.short,TP.branch(h.branch)?.name,historyOutcome(S,h).label].join(' ').toLocaleLowerCase('th').includes(q))).sort((a,b)=>historyStamp(b)-historyStamp(a));
}
function historyFilterOptions(S) {
 const items=historyItems({...S,_histStatus:'all'}),done=items.filter(h=>historyOutcome(S,h).key==='completed').length;
 return [['all',`ทั้งหมด (${items.length})`],['completed',`สำเร็จ (${done})`],['ended',`สิ้นสุดก่อนสรุป (${items.length-done})`]];
}
function liveCard(c) {
  const room = ['matched','room'].includes(c.status), p = historyIdentity(TP.S,c.who,c), pharmacist = TP.PHARM[c.pharm || 'kj'] || TP.PHARM.kj;
  const status = c.status === 'room' ? 'กำลังปรึกษา' : c.status === 'matched' ? 'เภสัชกรรับเคสแล้ว' : c.status === 'paused' ? 'เภสัชกรพักชั่วคราว' : 'อยู่ในคิว';
  return `<button type="button" class="history-live" ${ui.route({go:room?'room':'queue',via:'cover'})}><span class="history-live-person">${ic('message-circle',20,2)}<b>${esc(p.name)} · ${esc(p.rel)}</b></span>${ui.tag(status,'info',{dot:true})}<strong>${esc((c.symptoms || []).join(' ') || 'การปรึกษาที่กำลังดำเนินอยู่')}</strong><span>${esc(pharmacist.short)} · กลับไป${room?'ห้องปรึกษา':'ดูคิว'} ${ic('arrow-right',16,2)}</span></button>`;
}
function histItem(h) {
  const S=TP.S, person=historyIdentity(S,h.who,h), P=TP.PHARM[h.pharm] || TP.PHARM.kj, b=TP.branch(h.branch),outcome=historyOutcome(S,h);
  const c=h._case || (S.case?.id===h.id?S.case:null),o=h.order||c?.order;
  if(c)TP.expireOrder?.(c);
  const payable=!!(o&&TP.orderPayable?.(o));
  const destination=payable?ui.route({a:'openOrderPayment',p:{caseId:h.id}}):ui.route({go:'summary',p:{id:h.id}});
  const extra=TP.followHistRow?.(h) || '';
  return `<article class="history-card${payable?' history-card-payable':''}" data-history-id="${esc(h.id)}">
    <header class="history-card-store"><span class="history-store-picture">${b?.photo?`<img src="${esc(b.photo)}" alt="" width="40" height="40" loading="lazy">`:ic('store',22,1.8)}</span><div><b>${esc(b?.name || 'ไม่ระบุร้านยา')}</b><span>ร้านยาที่ให้คำปรึกษา</span></div><time>${esc(h.date)}<small>${esc(h.time)} น.</small></time></header>
    <button type="button" class="history-card-open" ${destination} aria-label="${payable?'ดูรายการยาและชำระเงิน':'ดูสรุปการปรึกษา'} ${esc(person.name)} เรื่อง ${esc(h.topic)} วันที่ ${esc(h.date)}">
      <span class="history-details">
        <span class="history-detail-row"><span class="history-detail-label"><span class="history-detail-icon">${ic('message-circle',17,1.8)}</span><span>เรื่องที่ปรึกษา</span></span><span class="history-detail-value history-detail-topic">${esc(h.topic || 'ปรึกษาเรื่องยา')}</span></span>
        <span class="history-detail-row"><span class="history-detail-label"><span class="history-detail-icon">${ic('stethoscope',17,1.8)}</span><span>เภสัชกร</span></span><span class="history-detail-value">${esc(P.short)}</span></span>
        <span class="history-detail-row"><span class="history-detail-label"><span class="history-detail-icon">${ic('clipboard-list',17,1.8)}</span><span>ผลการปรึกษา</span></span><span class="history-detail-value">${ui.tag(payable?'รอชำระค่ายา':outcome.label,payable?'warn':outcome.tone)}</span></span>
      </span>
    </button>${payable?`<div class="history-payment-action"><button type="button" class="btn primary history-payment-button" ${ui.route({a:'openOrderPayment',p:{caseId:h.id}})}>${ic('credit-card',19,1.8)}<span>ข้อมูลชำระเงิน</span><span class="history-payment-countdown">${ic('clock',16,1.8)}<b data-order-countdown data-order-case="${esc(h.id)}">${TP.orderRemaining(o)}</b></span>${ic('chevron-right',17,2)}</button></div>`:`<p class="history-outcome-reason">${esc(outcome.reason)}</p>`}${extra?`<div class="history-card-extra">${extra}</div>`:''}</article>`;
}
function listHtml(S,who) {
  const items=historyItems(S,who);
  if(!items.length) return `<div class="history-empty">${ui.emptyArt('file-search')}<h3>ไม่พบประวัติที่ตรงกัน</h3><p>${who==='all'?'ลองเปลี่ยนคำค้นหาหรือตัวกรอง':'ยังไม่มีประวัติที่ตรงกับตัวกรอง'}</p><button type="button" class="txtbtn" data-a="afHistClear">ล้างคำค้นหาและตัวกรอง</button></div>`;
  const groups=[];
  items.forEach(h=>{const [,m,y]=String(h.date).split('/'),key=`${MON[+m-1] || ''} ${y || ''}`.trim();let g=groups.find(g=>g.key===key);if(!g)groups.push(g={key,items:[]});g.items.push(h)});
  return groups.map(g=>`<section class="history-month"><h3>${esc(g.key)}</h3><div>${g.items.map(histItem).join('')}</div></section>`).join('');
}
/* Maximum-family cases are view-only fixtures, never written to the account. */
function historyView(S) { return {...S,_histWho:'me',_histStatus:'all'}; }
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
function historyUpdateResults(el,S) {
  const labels=new Map(historyFilterOptions(S));
  $$('[data-segname=histStatus] button',el).forEach(button=>{button.textContent=labels.get(button.dataset.v) || button.textContent});
  const results=$('#afHL',el); if(results){results.innerHTML=listHtml(S,S._histWho || 'all');TP.icons(results)}
  const status=$('#histSearchStatus',el);if(status)status.textContent=`พบ ${historyItems(S).length} รายการ`;
}
function historySearchClear(el,S,focus=true) {
  S._histQuery='';const input=$('#histSearch',el);if(input)input.value='';
  const clear=$('#histSearchClear',el);if(clear)clear.hidden=true;
  historyUpdateResults(el,S);if(focus)input?.focus({preventScroll:true});
}
function historySearchSetOpen(el,S,open) {
  S._histSearchOpen=open;
  const panel=$('#histSearchPanel',el),toggle=$('#histSearchToggle',el);
  if(panel){panel.hidden=!open;panel.parentElement?.classList.contains('history-filters')&&(panel.parentElement.hidden=!open);}
  if(toggle){toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'ปิดการค้นหาประวัติ':'ค้นหาประวัติ');}
  if(open)$('#histSearch',el)?.focus({preventScroll:true});
  else {historySearchClear(el,S,false);toggle?.focus({preventScroll:true});}
}
TP.screen('history', {
  group:'after',title:'ประวัติ',code:'C403',ref:'C14',tab:'history',
  states:[["normal", "มีรายการ"], ["empty", "ยังไม่มี"], ["loading", "กำลังโหลด"], ["self", "เฉพาะตัวเอง"], ["paid", "ปรึกษาสำเร็จ"], ["no-medication", "สิ้นสุดก่อนสรุป"], ["search", "ค้นหาประวัติ"], ["no-results", "ค้นหาไม่พบ"], ["error", "โหลดไม่สำเร็จ"], ["dark-filters", "แท็บประเภทสี CI เข้ม"], ["shared-tabs", "แท็บกลาง ตัวอักษร 14px"], ["store-recipient-card", "หัวการ์ดร้านยา ท้ายการ์ดผู้รับการปรึกษา"], ["receipt-inside", "ดูใบเสร็จในใบสรุป"], ["detail-rows", "รายละเอียดเรียงแถวพร้อมไอคอน"], ["purchase-status", "ป้ายตามข้อมูลซื้อยา"], ["pending-order", "รายการยารอชำระ"], ["expired-order", "รายการยาหมดอายุ"], ["cancelled-order", "ยกเลิกรายการยา"], ["tap-card", "แตะการ์ด ไม่มีข้อความลิงก์"], ["search-below-tabs", "ช่องค้นหาอยู่ใต้แท็บ"], ["tab-counts", "จำนวนรายการในแต่ละแท็บ"], ["search-open", "เปิดช่องค้นหาจากหัวหน้า"], ["search-cleared", "ช่องค้นหาหลังล้างคำ"], ["ten-records", "ประวัติ 10 รายการ หลายวันและเดือน"],["completed","ปรึกษาสำเร็จ"],["ended","สิ้นสุดก่อนสรุป"],["customer-ended","คุณจบการสนทนา"],["no-response","ไม่มีการตอบกลับ 5 นาที"]],
  notes:['แสดงประวัติของเจ้าของบัญชีเท่านั้น','เรียงล่าสุดก่อน แบ่งตามเดือน ค้นหาอาการ ร้าน เภสัชกร หรือเลขเรื่องได้','เคสที่กำลังดำเนินอยู่เปิดต่อจากแถบล่าง ส่วนประวัติแสดงการปรึกษาที่จบแล้ว','ใบสรุปและทางลัดติดตามยาใช้รหัสการปรึกษาเดิม'],
  prep(S) {
    const st=S.st.history;S._histStatus='all';if(!st)return;
    if(st==='ten-records')S.history=TP.fresh().history;
    if(st==='empty'){S.history=[];if(S.case&&!caseOpen())S.case=null}else if(!S.history.length)S.history=TP.fresh().history;
    S._histWho='me';S._histStatus='all';S._histQuery='';S._histSearchOpen=['search','no-results','search-open','search-cleared','search-below-tabs'].includes(st);
    if(st==='paid'||st==='completed')S._histStatus='completed';if(st==='no-medication'||st==='ended')S._histStatus='ended';
    if(['customer-ended','no-response'].includes(st)){S.history=TP.fresh().history.map((h,i)=>({...h,outcome:i===0?st:h.outcome}));S._histStatus='ended';}
    if(st==='search')S._histQuery='ไข้';if(st==='no-results')S._histQuery='ไม่พบรายการตัวอย่าง';
    if(['pending-order','expired-order','cancelled-order'].includes(st)){S.case=closedCase();S.case.date=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date());S.case.order.status=st==='pending-order'?'pending':st==='expired-order'?'expired':'cancelled';S.case.order.expiresAt=Date.now()+(st==='expired-order'?-1:15*60*1000)}
  },
  render(ctx) {
    const S=historyView(ctx.S),st=ctx.state,searchOpen=!!(S._histSearchOpen||S._histQuery),canSearch=!['loading','error'].includes(st)&&allHistory(S).length>0;
    const nav=ui.nav({title:'ประวัติการปรึกษา',right:canSearch?`<button type="button" id="histSearchToggle" class="ibtn history-search-toggle" data-a="afHistSearchToggle" aria-label="${searchOpen?'ปิดการค้นหาประวัติ':'ค้นหาประวัติ'}" aria-expanded="${searchOpen}" aria-controls="histSearchPanel">${ic('search',22,1.9)}</button>`:''});
    if(st==='loading')return nav+ui.page(`<div class="history-loading" aria-busy="true" aria-label="กำลังโหลดประวัติ">${ui.skel('100%',88,16)}${ui.skel('50%',20)}${ui.skel('100%',210,16)}${ui.skel('100%',210,16)}</div>`,{});
    if(st==='error')return nav+ui.page(`<div class="history-empty history-error" role="alert">${ic('circle-alert',32,2)}<h2>โหลดประวัติไม่สำเร็จ</h2><p>ข้อมูลที่บันทึกไว้ยังอยู่ ลองโหลดอีกครั้ง</p>${ui.btn('ลองอีกครั้ง',{a:'afHistRetry'})}</div>`,{});
    const selector=historySelector(S),sel=S._histWho;
    const matches=who=>!who||who==='me';
    const pending=S.ofPending&&matches(S.ofPending.who)?ui.group([ui.row({icon:'message-square-text',title:'คำถามที่ฝากไว้',sub:`${historyIdentity(S,S.ofPending.who).name} · รอเภสัชกรตอบ`,tag:['รอตอบ','warn'],chev:false})]):'';
    const live=(caseOpen()&&matches(S.case?.who)?liveCard(S.case):'')+(matches(S.case?.who)?TP.orderReadyRow?.(S,{din:1,ship:true})||'':'')+pending;
    const all=allHistory(S);
    const filters=all.length?`<div class="history-filters" ${searchOpen?'':'hidden'}><div class="history-search-panel" id="histSearchPanel" ${searchOpen?'':'hidden'}><div class="history-search" role="search" aria-label="ค้นหาประวัติการปรึกษา">${ic('search',20,1.8)}<label class="sr" for="histSearch">ค้นหาอาการ ร้านยา เภสัชกร หรือเลขการปรึกษา</label><input id="histSearch" type="search" value="${esc(S._histQuery || '')}" placeholder="อาการ ร้านยา เภสัชกร หรือเลขการปรึกษา" maxlength="100" autocomplete="off" enterkeyhint="search"><button type="button" id="histSearchClear" class="history-search-clear" data-a="afHistSearchClear" aria-label="ล้างคำค้นหา" ${S._histQuery?'':'hidden'}>${ic('x',18,2)}</button></div><button type="button" class="txtbtn history-search-close" data-a="afHistSearchClose">ปิด</button></div></div>`:'';
    const content=all.length?`<span class="sr" id="histSearchStatus" role="status" aria-live="polite"></span><div id="afHL">${listHtml(S,sel)}</div>`:`<div class="history-empty">${ui.emptyArt('history')}<h3>ยังไม่มีประวัติการปรึกษา</h3><p>กลับมาดูใบสรุปและยาที่ได้รับหลังปรึกษาเภสัชกรได้ที่นี่</p>${ui.btn('ดูร้านยาใกล้ฉัน',{a:'afHome',iconRight:'arrow-right'})}</div>`;
    return nav+ui.page(`<div class="history-page">${selector}${filters}${content}</div>`,{});
  },
  mount(el,ctx) {
    const input=$('#histSearch',el);
    input?.addEventListener('input',e=>{ctx.S._histQuery=e.target.value;ctx.S._histSearchOpen=true;const clear=$('#histSearchClear',el);if(clear)clear.hidden=!e.target.value;historyUpdateResults(el,ctx.S)});
    input?.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();historySearchSetOpen(el,ctx.S,false);}else if(e.key==='Enter'){e.preventDefault();input.blur();}});
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
TP.act('afHistSearchToggle',()=>{const el=curEl();historySearchSetOpen(el,TP.S,$('#histSearchPanel',el)?.hidden!==false)});
TP.act('afHistSearchClose',()=>historySearchSetOpen(curEl(),TP.S,false));
TP.act('afHistSearchClear',()=>historySearchClear(curEl(),TP.S));
TP.act('afHistStatus',t=>{TP.S._histStatus=t.dataset.v;historyUpdateResults(curEl(),TP.S)});
TP.act('afHistWho',t=>historyChoose(t.dataset.v));
TP.act('afHistAll',()=>historyChoose('all'));
TP.act('afHistClear',()=>{TP.S._histQuery='';TP.S._histStatus='all';TP.refresh({anim:false})});
TP.act('afHistRetry',()=>{TP.S.st.history='normal';TP.refresh({anim:false})});

/* =====================================================================
   ADR report (C15): no money words on this screen
   ===================================================================== */
const ADR_SYM = ['ผื่น คัน', 'บวม', 'คลื่นไส้', 'เวียนหัว', 'ใจสั่น', 'อื่น ๆ'];
const ADR_SEV = ['หายใจลำบาก', 'ปาก หน้า หรือตาบวม', 'ผื่นลามทั้งตัว หรือเป็นตุ่มน้ำ', 'หน้ามืด จะเป็นลม'];
const SINCE = [['today', 'วันนี้'], ['yday', 'เมื่อวาน'], ['few', '2-3 วันก่อน'], ['long', 'นานกว่านั้น']];
const LEVEL = [['mild', 'เล็กน้อย'], ['mid', 'ปานกลาง'], ['high', 'มาก']];
const LEVEL_HINT = { mild: 'ไม่รบกวนชีวิตประจำวัน', mid: 'รบกวนบ้าง ยังทำกิจวัตรได้', high: 'รบกวนการกิน การนอน หรือการทำงาน' };
const ADR_OK = 'เภสัชกรจะติดต่อกลับเพื่อประเมินอาการก่อนเสมอ', ADR_NEED = 'เลือกอาการอย่างน้อย 1 ข้อ หรือเล่าเพิ่มเติม', ADR_LVL = 'เลือกว่าอาการมากแค่ไหน';
function medsFor(S, who) {
  if(who && who!=='me')return [];
  const out = [];
  allHistory(S).filter(h => (h.who || 'me') === who && h.bought).forEach(h => sumOf(h).meds.forEach((m, i) => out.push({ ...m, v: `${h.id}:${i}`, name: m.name, sub: `ได้รับ ${h.date} · ${(TP.PHARM[h.pharm] || TP.PHARM.kj).short}`, pharm: h.pharm, branch: h.branch, hid: h.id })));
  return out;
}
function adrPeople(S) { return [historyIdentity(S,'me')]; }
function adrPerson(S,who) { return adrPeople(S).some(p=>p.id===who)?who:'me'; }
function adrNewDraft(who,from='') { return {from,who,drug:'',other:'',unknown:false,generic:'',strength:'',form:'',reason:'',doses:'',route:'',onset:'',sym:[],sev:[],since:'',level:'',note:'',photos:0,attachments:[],query:'',step:1}; }
function adrDraft(S,params={}) {
  S._adrDrafts ||= {};
  const h=params.from?allHistory(S).find(h=>h.id===params.from):null;
  const who=adrPerson(S,params.who || h?.who || S._adr?.who || S._adrWho || 'me');
  let d=S._adrDrafts[who];
  if(!d || (h && d.from!==h.id)) { d=adrNewDraft(who,h?.id || ''); if(h)adrSelectDrug(S,d,medsFor(S,who).find(m=>m.hid===h.id)?.v || ''); S._adrDrafts[who]=d; }
  S._adrWho=who;return S._adr=d;
}
function adrMedicineResults(S,d) { const q=(d.query||'').trim().toLocaleLowerCase('th');return medsFor(S,d.who).filter(m=>!q||[m.name,m.genericName,m.brandName,m.strength,m.form].filter(Boolean).join(' ').toLocaleLowerCase('th').includes(q)); }
function adrSelectDrug(S,d,v) { const m=medsFor(S,d.who).find(m=>m.v===v); d.drug=v;d.generic=m?.genericName||'';d.strength=m?.strength||'';d.form=m?.form||''; }
function adrMedicineName(S,d) { return medsFor(S,d.who).find(m=>m.v===d.drug)?.name || (d.drug==='store'?(d.unknown?'ไม่ทราบชื่อยา':d.other.trim()):''); }
const adrHas=d=>!!(d.sym.some(v=>v!=='อื่น ๆ') || d.sev.length || d.note.trim());
const adrDrugReady=d=>!!d.drug && (d.drug!=='store' || !!d.other.trim() || d.unknown);
const adrReady=d=>adrDrugReady(d) && adrHas(d) && !!d.level && !!d.since;
const adrNote=d=>!adrDrugReady(d)?'เลือกยา หรือระบุว่าไม่ทราบชื่อยา':!adrHas(d)?ADR_NEED:!d.since?'ระบุว่าเริ่มมีอาการเมื่อไร':!d.level?ADR_LVL:'ตรวจข้อมูลก่อนส่งให้เภสัชกร';
const LEVEL_PICK='เลือกตามผลต่อการใช้ชีวิตของผู้มีอาการ';
function adrPersonSelect() { return ''; }
function adrReports(S,who) { return who==='me'?(S.adrReports||[]).filter(r=>!r.who||r.who==='me'):[]; }
function adrStoreReport(S,d) {
  if(d.who!=='me')throw Error('Only the account owner can submit a report');
  const m=medsFor(S,d.who).find(m=>m.v===d.drug),b=m?.branch || S.branch;
  const r={id:'AR-'+Date.now().toString(36)+'-'+((S.adrReports||[]).length+1),patientReport:true,who:d.who,whoName:historyIdentity(S,d.who).name,drug:adrMedicineName(S,d),known:!!m,sym:[...d.sev,...d.sym],since:d.since,level:d.level,note:d.note.trim(),generic:d.generic.trim(),strength:d.strength.trim(),form:d.form.trim(),reason:d.reason.trim(),doses:d.doses.trim(),route:d.route.trim(),onset:d.onset,attachments:[...(d.attachments||[])],pharm:m?.pharm || TP.branch(b)?.pharm || 'kj',branch:b,at:TP.NOW.time,date:TP.NOW.date,severe:!!d.sev.length,replied:false};
  S.adrReports=[r,...(S.adrReports||[])]; S._adrSent=r; delete S._adrDrafts?.[d.who];S._adr=null;return r;
}
TP.screen('adrcare',{
  group:'after',title:'แพ้ยาและอาการหลังใช้ยา',code:'C416',parent:'home',
  states:[["normal", "ข้อมูลของตัวเอง"], ["empty", "ยังไม่มีรายงาน"], ["reported", "มีรายงานรอประเมิน"], ["loading", "กำลังโหลด"], ["error", "โหลดไม่สำเร็จ"]],
  notes:['ดูประวัติและแจ้งอาการของเจ้าของบัญชีเท่านั้น','ข้อมูลแพ้ยาเดิมและอาการที่รายงานเป็นคนละส่วน ไม่วินิจฉัยแพ้ยาอัตโนมัติ','ค้นหาจากยาที่เจ้าของบัญชีเคยได้รับ รูปยาเป็นภาพประกอบ ไม่ใช้ยืนยันชนิดยา'],
  prep(S){const st=S.st.adrcare;S._adrWho='me'; if(st==='empty')S.adrReports=[];if(st==='reported'){S.adrReports=[];for(const who of ['me']){const d=adrNewDraft(who);Object.assign(d,{drug:'store',other:'ชื่อยาจากฉลาก (ตัวอย่าง)',sym:['ผื่น คัน'],since:'today',level:'mild'});adrStoreReport(S,d)}}},
  render(ctx){const S=ctx.S,who=S._adrWho=adrPerson(S,S._adrWho),person=who==='me'?S.user:S.family.find(f=>f.id===who),identity=historyIdentity(S,who),reports=adrReports(S,who),nav=ui.nav({back:backL('home'),title:'แพ้ยา / อาการหลังใช้ยา'});
    if(ctx.state==='loading')return nav+ui.page(ui.skel('100%',220,16));
    if(ctx.state==='error')return nav+ui.page(`<div class="history-empty" role="alert"><h2>โหลดข้อมูลไม่สำเร็จ</h2><p>ลองโหลดข้อมูลของคุณอีกครั้ง</p>${ui.btn('ลองอีกครั้ง',{a:'adrCareRetry'})}</div>`);
    const allergies=person?.allergies||[];
    return nav+ui.page(`<div class="adr-care">${adrPersonSelect(S,who,'adrCareWho','care')}<section class="adr-start"><span class="adr-section-icon">${ic('heart-pulse',24,1.8)}</span><h2>มีอาการผิดปกติหลังใช้ยา?</h2><p>แจ้งอาการของ ${esc(identity.name)} ให้เภสัชกรช่วยประเมิน</p>${ui.btn('แจ้งอาการหลังใช้ยา',{go:'adr',p:{who},icon:'plus'})}</section><section class="adr-block"><h2>ข้อมูลแพ้ยาที่บันทึกไว้</h2><p class="adr-help">ข้อมูลสุขภาพของ ${esc(identity.name)}</p>${allergies.length?`<ul class="adr-allergies">${allergies.map(a=>`<li>${ic('triangle-alert',18,2)}<b>${esc(a)}</b></li>`).join('')}</ul>`:`<p>${person?.allergyState==='none'?'ระบุว่าไม่มีประวัติแพ้ยา':'ยังไม่ได้ระบุประวัติแพ้ยา'}</p>`}<p class="adr-help">หากข้อมูลไม่ครบหรือไม่ถูกต้อง แจ้งเภสัชกรก่อนรับยา</p></section><section class="adr-block"><h2>รายงานอาการหลังใช้ยา <span>${reports.length}</span></h2><p class="adr-help">รายงานอาการยังไม่ใช่การยืนยันว่าแพ้ยา</p>${reports.length?reports.map(r=>`<button type="button" class="adr-report" data-a="adrOpenReport" data-v="${esc(r.id)}"><span>${ui.tag(r.replied?'ประเมินแล้ว':'รอเภสัชกรประเมิน',r.replied?'info':'warn')}<b>${esc(r.drug)}</b><span>${esc(r.sym.join(' · ') || r.note)}</span><small>${esc(r.date||'')} ${esc(r.at)}</small></span>${ic('chevron-right',18,2)}</button>`).join(''):`<div class="adr-empty">${ui.emptyArt('clipboard-list')}<b>ยังไม่มีรายงานอาการหลังใช้ยาของคุณ</b><p>เมื่อแจ้งอาการแล้ว กลับมาดูรายงานและการประเมินได้ที่นี่</p></div>`}</section></div>`,{});
  },mount(el,ctx){$('#adrCareWho',el)?.addEventListener('change',e=>{ctx.S._adrWho=e.target.value;TP.refresh({anim:false})});if(ctx.state==='loading')ctx.later(()=>{ctx.S.st.adrcare='normal';TP.refresh()},1400)}
});
TP.act('adrCareRetry',()=>{TP.S.st.adrcare='normal';TP.refresh()});
TP.act('adrOpenReport',t=>{const r=(TP.S.adrReports||[]).find(r=>r.id===t.dataset.v&&(!r.who||r.who==='me'));if(!r)return;TP.S._adrSent=r;TP.S.st.adrsent=r.replied?'replied':r.severe?'severe':'sent';TP.go('adrsent',{params:{id:r.id}})});
function adrMedicineList(S,d){const meds=adrMedicineResults(S,d);return `<p class="adr-help" role="status">${meds.length} รายการจากยาที่ ${esc(historyIdentity(S,d.who).name)} เคยได้รับ</p><div class="adr-medicines">${meds.map(m=>`<button type="button" class="adr-medicine" data-a="afAdrDrug" data-v="${esc(m.v)}" aria-pressed="${d.drug===m.v}">${TP.medicineImage(m)||`<span class="adr-medicine-placeholder">${ic('pill',24,1.8)}</span>`}<span><b>${esc(m.name)}</b><small>${esc(m.sub)}</small></span>${ic(d.drug===m.v?'circle-check':'circle',20,1.8)}</button>`).join('')||`<div class="adr-empty">${ui.emptyArt('pill')}<p>ไม่พบยาในประวัติของคุณ ใช้ช่องระบุยาเองด้านล่างได้</p></div>`}</div>`;}
TP.screen('adr',{
  group:'after',title:'แจ้งอาการหลังใช้ยา',code:'C412',ref:'C15',parent:'adrcare',
  states:[["normal", "เลือกยา"], ["filled", "ตรวจทานก่อนส่ง"], ["severe", "อาการเร่งด่วน"], ["search", "ค้นหายา"], ["no-results", "ค้นหาไม่พบ"], ["manual", "ระบุยาจากที่อื่น"], ["unknown", "ไม่ทราบชื่อยา"], ["symptoms", "ระบุอาการ"], ["submit-error", "ส่งไม่สำเร็จ ข้อมูลยังอยู่"]],
  notes:['เลือกยาที่สงสัย → ระบุอาการ → ตรวจทานก่อนส่ง','รูปยาเป็นภาพประกอบ ไม่ยืนยันชนิดยา ไม่เติมชื่อสามัญหรือขนาดยาที่ไม่มีข้อมูล','ร่างและรายงานเป็นของเจ้าของบัญชี ส่งแล้วไม่เพิ่มประวัติแพ้ยาอัตโนมัติ','คำเตือนฉุกเฉินแสดงก่อนกรอกและเมื่อเลือกอาการรุนแรง'],
  prep(S){const st=S.st.adr;const cur=TP.cur();if(cur?.id==='adr')cur.params={};S._adrDrafts={};const who='me';const d=adrNewDraft(who);S._adrDrafts[who]=S._adr=d;S._adrWho=who;
    if(['filled','severe','symptoms','submit-error'].includes(st))Object.assign(d,{drug:medsFor(S,who)[0]?.v||'store',other:'ชื่อยาจากฉลาก',sym:['ผื่น คัน'],since:'yday',level:'mid',step:st==='filled'||st==='submit-error'?3:2});
    if(st==='severe')Object.assign(d,{sev:['หายใจลำบาก'],level:'high'});if(st==='search')d.query='พารา';if(st==='no-results')d.query='ไม่พบยานี้';if(st==='manual'||st==='unknown'){d.drug='store';d.unknown=st==='unknown'}
  },
  render(ctx){const S=ctx.S,d=adrDraft(S,ctx.params),identity=historyIdentity(S,d.who),severe=!!d.sev.length;
    const emergency=ui.note('<b>หากหายใจลำบาก ปากหรือหน้าบวม หรือเป็นลม</b> ไปโรงพยาบาลทันที อย่ารอส่งรายงาน <a href="tel:1669">โทร 1669</a>',{tone:severe?'danger':'warn',icon:'triangle-alert'});
    const selected=adrMedicineName(S,d);
    let body='';
    if(d.step===1)body=`<section class="adr-block"><h2>ยาที่สงสัยว่าเกี่ยวข้อง</h2><p class="adr-help">เลือกยาจากประวัติ หรือระบุชื่อจากฉลากยา</p><label class="history-search" for="adrMedSearch">${ic('search',20,1.8)}<span class="sr">ค้นหาชื่อยาในประวัติ</span><input type="search" id="adrMedSearch" placeholder="ค้นหาชื่อยา" value="${esc(d.query)}" maxlength="100"></label><div id="adrMedicineResults">${adrMedicineList(S,d)}</div><p class="adr-help">รูปเป็นภาพประกอบ ตรวจชื่อยาและขนาดจากฉลากทุกครั้ง</p><button type="button" class="adr-manual btn secondary" data-a="afAdrDrug" data-v="store" aria-pressed="${d.drug==='store'}">${ic('plus',18,2)}ยาจากที่อื่น / ไม่พบในรายการ</button>${d.drug==='store'?`<div class="adr-manual-fields">${ui.field({id:'afOther',label:'ชื่อยาตามฉลาก (ชื่อสามัญหรือชื่อการค้า)',value:d.other,bind:'_adr.other',a:'afAdrCheck',max:120,hint:'หากไม่ทราบ ให้เลือกช่องด้านล่าง'})}<label class="adr-checkbox"><input type="checkbox" id="adrUnknown" ${d.unknown?'checked':''}>ไม่ทราบชื่อยา ขอให้เภสัชกรช่วยตรวจสอบ</label><details><summary>เพิ่มข้อมูลจากฉลาก (ไม่บังคับ)</summary>${['generic|ชื่อสามัญของยา','strength|ความแรง เช่น ตัวเลขและหน่วยบนฉลาก','form|รูปแบบยา เช่น เม็ด น้ำ ครีม'].map(v=>{const [key,label]=v.split('|');return ui.field({id:'adr-'+key,label,value:d[key],bind:'_adr.'+key,optional:true,max:100})}).join('')}</details><label class="adr-upload">${ic('camera',20,1.8)}<span>แนบรูปฉลากหรือซองยา (ไม่บังคับ)</span><input id="adrFiles" type="file" accept="image/*" multiple></label><p class="adr-help" id="adrFileCount">${d.photos?`แนบแล้ว ${d.photos} รูป`:''}</p></div>`:''}</section>`;
    if(d.step===2)body=`<section class="adr-block"><h2>มีอาการอะไรหลังใช้ยา?</h2><p class="adr-selected-drug">${ic('pill',18,2)}${esc(selected)}</p><fieldset><legend>อาการที่พบ · เลือกได้หลายข้อ</legend>${ui.chips('afSym',ADR_SYM,d.sym,{a:'afAdrCheck',label:'อาการที่พบ'})}</fieldset>${ui.field({id:'afNote',label:'อาการอื่นหรือรายละเอียดเพิ่มเติม',optional:!d.sym.includes('อื่น ๆ'),textarea:true,rows:3,value:d.note,bind:'_adr.note',a:'afAdrCheck',max:500,placeholder:'เช่น ผื่นขึ้นที่แขนทั้งสองข้าง'})}<fieldset class="adr-urgent"><legend>มีอาการเร่งด่วนเหล่านี้ไหม? (ถ้าไม่มี ข้ามได้)</legend>${ui.chips('afSev',ADR_SEV,d.sev,{red:true,a:'afAdrCheck',label:'อาการเร่งด่วน'})}</fieldset>${rvHtml('afDanger',severe,ui.note('<b>ไปโรงพยาบาลทันที ไม่ต้องรอเภสัชกร</b> <a href="tel:1669">โทร 1669</a>',{tone:'danger',icon:'octagon-alert'}))}<fieldset><legend>เริ่มมีอาการเมื่อไร</legend>${ui.seg('afSince',SINCE,d.since,{a:'afAdrSeg',label:'เริ่มมีอาการเมื่อไร'})}</fieldset><fieldset><legend>อาการรบกวนมากแค่ไหน</legend>${ui.seg('afLevel',LEVEL,d.level,{a:'afAdrSeg',label:'อาการมากแค่ไหน'})}<p class="adr-help" id="afLevelHint">${d.level?LEVEL_HINT[d.level]:LEVEL_PICK}</p></fieldset><details><summary>เวลาและวิธีใช้ยา (ไม่บังคับ)</summary>${ui.field({id:'adr-onset',label:'วันและเวลาที่เริ่มมีอาการ',type:'datetime-local',value:d.onset,bind:'_adr.onset',optional:true})}${[['reason','ใช้ยาเพราะอาการอะไร'],['doses','ใช้ไปกี่ครั้งหรือกี่วันก่อนมีอาการ'],['route','ใช้ยาอย่างไร เช่น กิน ทา หยอด']].map(([key,label])=>ui.field({id:'adr-'+key,label,value:d[key],bind:'_adr.'+key,optional:true,max:160})).join('')}</details></section>`;
    if(d.step===3)body=`<section class="adr-block"><h2>ตรวจทานรายงาน</h2><p class="adr-help">ส่งข้อมูลนี้ให้เภสัชกรประเมิน ไม่ใช่การยืนยันว่าแพ้ยา</p><dl class="adr-review">${[['ผู้มีอาการ',identity.name+' · '+identity.rel],['ยาที่สงสัย',selected],['อาการ',[...d.sev,...d.sym].join(' · ')],['เริ่มมีอาการ',SINCE.find(x=>x[0]===d.since)?.[1]],['ความรุนแรง',LEVEL.find(x=>x[0]===d.level)?.[1]],['รายละเอียด',d.note],['ชื่อสามัญ',d.generic],['ความแรง',d.strength],['รูปแบบยา',d.form],['เวลาเริ่ม',d.onset],['เหตุผลที่ใช้ยา',d.reason],['จำนวนครั้ง/วันก่อนมีอาการ',d.doses],['วิธีใช้ยา',d.route],['รูปฉลาก',d.photos?d.photos+' รูป':'']].filter(([,v])=>v).map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>`;
    const allowed=d.step===1?adrDrugReady(d):adrReady(d);
    return ui.nav({back:backL('adrcare'),title:'แจ้งอาการหลังใช้ยา'})+ui.page(`<div class="adr-form">${adrPersonSelect(S,d.who,'adrFormWho','form')}<ol class="adr-steps" aria-label="ขั้นตอนรายงาน">${['เลือกยา','อาการ','ตรวจทาน'].map((label,i)=>`<li ${d.step===i+1?'aria-current="step"':''}><span>${i+1}</span>${label}</li>`).join('')}</ol>${emergency}${ctx.state==='submit-error'?ui.note('<b>ยังส่งรายงานไม่สำเร็จ</b> ข้อมูลที่กรอกยังอยู่ ลองส่งอีกครั้ง',{tone:'danger'}):''}${body}</div>`,{})+ui.dock(`${d.step>1?ui.btn('ย้อนกลับ',{a:'adrPrevious',kind:'secondary'}):''}${ui.btn(d.step===3?'ส่งให้เภสัชกร':'ถัดไป',{a:d.step===3?'afAdrSend':'adrNext',id:'afAdrGo',disabled:!allowed,iconRight:d.step===3?'send':'arrow-right'})}`,{note:d.step===1?(allowed?'เลือกยาที่ต้องการรายงานแล้ว':'เลือกยา หรือระบุว่าไม่ทราบชื่อยา'):adrNote(d)});
  },
  mount(el,ctx){$('#adrFormWho',el)?.addEventListener('change',e=>{adrDraft(ctx.S,{who:e.target.value});const cur=TP.cur();if(cur)cur.params={who:e.target.value};TP.refresh({anim:false})});$('#adrMedSearch',el)?.addEventListener('input',e=>{const d=ctx.S._adr;d.query=e.target.value;const box=$('#adrMedicineResults',el);box.innerHTML=adrMedicineList(ctx.S,d);TP.icons(box)});$('#adrUnknown',el)?.addEventListener('change',e=>{ctx.S._adr.unknown=e.target.checked;adrSync()});$('#adrFiles',el)?.addEventListener('change',e=>{const d=ctx.S._adr,files=Array.from(e.target.files||[]).filter(f=>f.type.startsWith('image/')).slice(0,3);d.attachments=files.map(f=>({name:f.name,type:f.type,url:URL.createObjectURL(f)}));d.photos=files.length;$('#adrFileCount',el).textContent=files.length?`แนบแล้ว ${files.length} รูป (ข้อมูลตัวอย่างบนเครื่องนี้)`:''})}
});
TP.act('adrNext',()=>{const d=TP.S._adr;if(!d || !(d.step===1?adrDrugReady(d):adrReady(d)))return;d.step=Math.min(3,d.step+1);TP.refresh({anim:false}).then(()=>{const el=curEl();$('.scroll',el)?.scrollTo({top:0});$('.adr-block h2',el)?.setAttribute('tabindex','-1');$('.adr-block h2',el)?.focus()})});
TP.act('adrPrevious',()=>{const d=TP.S._adr;if(d)d.step=Math.max(1,d.step-1);TP.refresh({anim:false})});
function setLevel(el, d, v) {
  d.level = v;
  $$('[data-segname="afLevel"] button', el).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
  const hnt = $('#afLevelHint', el); if (hnt) hnt.textContent = v ? LEVEL_HINT[v] : LEVEL_PICK;
}
function adrSync() {
  const el = curEl(), d = TP.S._adr; if (!el || !d) return;
  if(d.step===2){ d.sym = ui.chipVals(el, 'afSym'); d.sev = ui.chipVals(el, 'afSev'); }
  if (d.sev.length && d.level !== 'high') setLevel(el, d, 'high');
  const ready = d.step===1?adrDrugReady(d):adrReady(d), go = $('#afAdrGo', el); if (go) go.disabled = !ready;
  const note = $(':scope > .dock .dock-note', el); if (note) note.textContent = adrNote(d);
  const box = $('#afDanger', el), was = box?.classList.contains('open');
  rv(box, d.sev.length > 0);
  if (!was && d.sev.length) { TP.live('อาการรุนแรง ไปโรงพยาบาลก่อน หรือโทร 1669'); setTimeout(() => box?.scrollIntoView({ block: 'nearest', behavior: RM() ? 'auto' : 'smooth' }), 260); }
}
TP.act('afAdrCheck', adrSync);
TP.act('afAdrWho',t=>{adrDraft(TP.S,{who:t.dataset.v});TP.refresh({anim:false})});
TP.act('afAdrDrug',t=>{const d=TP.S._adr;if(!d)return;adrSelectDrug(TP.S,d,t.dataset.v);TP.refresh({anim:false})});
TP.act('afAdrSeg', t => {
  const d = TP.S._adr, name = t.closest('.seg')?.dataset.segname; if (!d) return;
  if (name === 'afSince') { d.since = t.dataset.v; adrSync(); }
  if (name === 'afLevel') { setLevel(curEl(), d, t.dataset.v); adrSync(); }
});
TP.act('afAdrSend', async t => {
  const S = TP.S, d = S._adr; if (!d || d.step!==3 || !adrReady(d) || d.sending) return;
  d.sending=true;t.disabled=true;t.classList.add('busy');
  await TP.wait(RM() ? 50 : 700);
  const report=adrStoreReport(S,d);
  S.st.adrsent = S.storeOpen ? 'sent' : 'closed';
  TP.emit('state');
  TP.go('adrsent', { replace: true, params:{id:report.id} });
});

/* =====================================================================
   ADR sent (C15)
   ===================================================================== */
function sentMock(S) {
  const h = S.history[0] || {};
  return S._adrSent = { id: 'AR-261018-0007', who: 'me', drug: 'อะม็อกซีซิลลิน 500 มก.', known: true, sym: ['ผื่น คัน'], since: 'yday', level: 'mid', note: '', pharm: h.pharm || 'kj', branch: h.branch || 'tw', at: TP.NOW.time, severe: false, replied: false };
}
TP.screen('adrsent', {
  group: 'after', title: 'รายงานอาการหลังใช้ยา', code: 'C413', ref: 'C15', parent: 'adrcare',
  states: [["sent", "ส่งแล้ว รอติดต่อ"], ["severe", "อาการรุนแรง"], ["replied", "เภสัชกรตอบแล้ว"], ["closed", "ส่งตอนร้านปิด"], ["sfx", "ตอบว่าเป็นผลข้างเคียง"], ["patient-report", "รายงานใหม่รอประเมิน"], ["patient-reply", "ข้อความตอบกลับรายงานใหม่"], ["unknown-drug", "ไม่ทราบชื่อยา"]],
  notes: ['บอกว่าใครติดต่อกลับ เมื่อไร ทางไหน และถ้าแย่ลงต้องทำอะไร', 'ข้อ 74 (C413.5): เภสัชกรประเมินว่าเป็นผลข้างเคียง คำตอบบอกชัดว่าไม่ใช่การแพ้ยา ยังใช้ยาได้ และบันทึกไว้ที่ ผลข้างเคียงที่เคยมี (C505.3) · ลูกค้าไม่เห็นคะแนน Naranjo · คำตอบตรงกับคอนโซล S401.13', 'ปุ่ม "อยากคุยตอนนี้" พาไปแจ้งอาการพร้อมเติมข้อมูลให้ · ร้านปิด = ฝากคำถาม', 'เภสัชกรตอบ = แจ้งเตือนในแอป (ลองกด "จำลองฝั่งเภสัชกร" ในแผงนี้)', 'เภสัชกรบันทึกยาที่แพ้ลงประวัติ ทุกสาขาเห็นก่อนจ่ายยา'],
  wait: ['เวลาที่สัญญาว่าจะติดต่อกลับ (ตอนนี้: ภายในวันนี้ก่อน 21:00 · ร้านปิด = พรุ่งนี้ 09:00)'],
  prep(S) {
    const st = S.st.adrsent; if (!st) return;
    if(['patient-report','patient-reply','unknown-drug'].includes(st)) {
      const d=adrNewDraft('me');Object.assign(d,{drug:'store',other:'ชื่อยาจากฉลาก (ตัวอย่าง)',unknown:st==='unknown-drug',sym:['ผื่น คัน'],since:'today',level:'mild'});
      const record=adrStoreReport(S,d);record.replied=st==='patient-reply';return;
    }
    const r = (!S._adrSent?.who||S._adrSent.who==='me')&&S._adrSent || sentMock(S);
    if(r.patientReport)return;
    r.replied = st === 'replied' || st === 'sfx'; r.type = st === 'sfx' ? 'sfx' : ''; S.storeOpen = st === 'closed' ? false : TP.flag('storeOpen');
    if (st === 'sfx') { Object.assign(r, { drug: 'คลอร์เฟนิรามีน 4 มก.', sym: ['ง่วงมาก'], known: false, level: 'low' }); S.user.sfx = [SFX_CPM]; } else if (r.drug === 'คลอร์เฟนิรามีน 4 มก.') { r.drug = 'อะม็อกซีซิลลิน 500 มก.'; r.sym = ['ผื่น คัน']; r.known = true; }
    r.severe = st === 'severe'; r.who = 'me'; r.id = r.severe ? 'AR-261018-0008' : 'AR-261018-0007'; if (r.severe) { r.sym = ['ปาก หน้า หรือตาบวม']; r.level = 'high'; r.drug = 'พาราเซตามอลชนิดน้ำ'; } else if (r.drug === 'พาราเซตามอลชนิดน้ำ') r.drug = 'อะม็อกซีซิลลิน 500 มก.';
    TP.emit('state');
  },
  render(ctx) {
    const S = ctx.S, requested=(S.adrReports||[]).find(r=>r.id===ctx.params.id);
    if((requested?.who&&requested.who!=='me')||(!requested&&S._adrSent?.who&&S._adrSent.who!=='me'))return ui.nav({back:backL('adrcare'),title:'รายงานอาการหลังใช้ยา'})+ui.page(ui.empty({icon:'clipboard-list',title:'ไม่พบรายงานของคุณ'}));
    const r = requested || S._adrSent || sentMock(S), P = TP.PHARM[r.pharm] || TP.PHARM.kj, b = TP.branch(r.branch) || TP.branch();
    S._adrSent=r;
    if(r.patientReport) {
      const person=historyIdentity(S,r.who,r);
      const facts=[['ผู้มีอาการ',person.name+' · '+person.rel],['เลขรายงาน',r.id],['ยาที่สงสัย',r.drug],['อาการ',r.sym.join(' · ')],['เริ่มมีอาการ',SINCE.find(x=>x[0]===r.since)?.[1]],['ความรุนแรง',LEVEL.find(x=>x[0]===r.level)?.[1]],['เล่าเพิ่มเติม',r.note],['ชื่อสามัญ',r.generic],['ความแรง',r.strength],['รูปแบบยา',r.form],['วันและเวลาเริ่ม',r.onset],['เหตุผลที่ใช้ยา',r.reason],['จำนวนครั้ง/วันก่อนมีอาการ',r.doses],['วิธีใช้ยา',r.route]];
      return ui.nav({back:backL('adrcare'),title:'รายงานอาการหลังใช้ยา'})+ui.page(`<div class="adr-care"><section class="adr-block"><h2>${esc(person.name)}</h2>${ui.tag(r.replied?'มีข้อความจากเภสัชกร':'รอเภสัชกรประเมิน',r.replied?'info':'warn')}<p class="adr-help">${esc(r.date||'')} ${esc(r.at)} · ${esc(b.name)}</p></section>${r.severe?ui.note('<b>ไปโรงพยาบาลทันที อย่ารอตอบกลับ</b> หากหายใจลำบาก ปากหรือหน้าบวม หรือเป็นลม <a href="tel:1669">โทร 1669</a>',{tone:'danger',icon:'octagon-alert'}):ui.note('รายงานอาการนี้ยังไม่ใช่การยืนยันว่าแพ้ยา เภสัชกรต้องประเมินข้อมูลก่อน',{icon:'info'})}${r.replied?ui.note('<b>ข้อความตอบกลับ (ตัวอย่าง)</b><br>เภสัชกรได้รับรายงานแล้ว กรุณาเตรียมฉลากยาและข้อมูลอาการเพื่อประเมินต่อ',{icon:'message-circle'}):''}<section class="adr-block"><h2>ข้อมูลที่ส่ง</h2><dl class="adr-review">${facts.filter(([,v])=>v).map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${r.attachments?.length?`<h3>รูปฉลากที่แนบ</h3><div class="adr-attachments">${r.attachments.map(f=>`<figure><img src="${esc(f.url)}" alt="${esc(f.name)}"><figcaption>${esc(f.name)}</figcaption></figure>`).join('')}</div>`:''}</section></div>`)+ui.dock(`${ui.btn('ปรึกษาเภสัชกร',{a:'afAdrTalk',icon:'message-circle'})}${ui.btn('ดูบันทึกของฉัน',{a:'adrBackRecords',kind:'secondary'})}`);
    }
    const closed = !S.storeOpen, rep = !!r.replied, sev = !!r.severe && !rep;
    const whose = !r.who || r.who === 'me' ? 'ของคุณ' : 'ของ ' + whoLabel(r.who);
    const when = rep ? 'ตอบแล้ว 14:40' : sev ? 'โทรหาคุณโดยเร็วที่สุด' : closed ? 'พรุ่งนี้ ตั้งแต่ 09:00' : 'ภายในวันนี้ ก่อน 21:00';
    const tl = `<ol class="tl af-tl">
      <li class="done"><b>ส่งรายงานแล้ว</b><span>วันนี้ ${esc(r.at)}</span></li>
      <li class="${rep ? 'done' : 'cur'}"><b>เภสัชกรประเมินอาการ</b><span>ดูประวัติยาและอาการที่แจ้ง</span></li>
      <li class="${rep ? 'done' : ''}"><b>ติดต่อกลับ</b><span>${esc(when)}</span></li></ol>`;
    const reply = rep ? `<div class="card af-reply" data-in="2"><div class="hrow">${ui.av('', { ini: P.ini, size: 'sm' })}<div class="grow"><b>${esc(P.short)}</b><small>วันนี้ 14:40 · ${esc(b.short)}</small></div></div>
        <p class="body mt12">${r.type === 'sfx' ? `อาการ${esc(r.sym.join(' '))}เป็นผลข้างเคียงที่พบได้ของยาตัวนี้ ไม่ใช่การแพ้ยา ถ้ารบกวนมาก หยุดยาไว้ก่อนแล้วทักมาปรึกษาได้ ครั้งหน้าเภสัชกรจะเลือกยาหรือวิธีใช้ที่เหมาะกว่า` : 'จากอาการที่แจ้ง แนะนำให้หยุดใช้ยาตัวนี้ไว้ก่อน อาการควรค่อย ๆ ดีขึ้นใน 2-3 วัน ถ้าไม่ดีขึ้นหรือมีบวม ไปพบแพทย์ได้เลย'}</p>
        ${r.type === 'sfx' ? `<p class="af-recorded sfx">${ic('triangle-alert', 15, 2)}<span>บันทึกเป็นผลข้างเคียงที่เคยมีแล้ว ไม่ใช่การแพ้ยา · <button type="button" class="link" data-a="goHealth">ดูที่ข้อมูลสุขภาพของฉัน</button></span></p>` : ''}
        ${r.known ? `<p class="af-recorded">${ic('shield-check', 15, 2)}<span>บันทึก ${esc(r.drug)} ในประวัติแพ้ยาแล้ว · เภสัชกรเห็นประวัติแพ้ยาของคุณก่อนจ่ายยา</span></p>` : ''}</div>` : '';
    return ui.nav({ back: true, title: '' }) + ui.page(`
      ${sev ? `<div class="af-danger af-sev" data-in="0" role="alert">
        <p class="af-danger-h">${ic('octagon-alert', 24, 2)}<b>ไปโรงพยาบาลทันที ไม่ต้องรอเภสัชกร</b></p>
        <p>อาการที่แจ้ง${esc(whose)} อาจเป็นการแพ้ยารุนแรง หยุดใช้ยาตัวที่สงสัย แล้วไปโรงพยาบาลใกล้ที่สุด</p>
        <a class="btn danger" href="tel:1669" data-a="afCall" data-v="1669">${ic('phone', 20, 2)}<span>โทร 1669 สายด่วนฉุกเฉิน</span></a></div>
      <div class="af-sent" data-in="1"><span class="af-sent-i">${ic('send', 18, 2)}</span><div><b>ส่งรายงาน${esc(whose)} ให้เภสัชกรแล้ว</b><span>${esc(P.short)} จะโทรหาคุณโดยเร็วที่สุดจากเบอร์ร้าน <b class="num nowrap">${esc(b.phone)}</b> แต่อย่ารอ ไปโรงพยาบาลก่อนได้เลย</span></div></div>` : `<div class="af-ok" data-in="0">${brand.halo(92, { check: true, draw: true, still: rep, cls: 'af-ok-h' })}
        <h2 class="h2">${rep ? 'เภสัชกรตอบแล้ว' : 'ส่งรายงานแล้ว'}</h2>
        <p class="af-whose">อาการ${esc(whose)}</p>
        <p class="body">${rep ? `${esc(P.short)} ประเมินอาการที่คุณแจ้งแล้ว` : `${esc(P.short)} จะติดต่อกลับเพื่อประเมินอาการ ทางข้อความในแอปหรือโทรศัพท์`}</p></div>`}
      ${reply}
      <div class="card af-kvc" data-in="2">${ui.kv([['เลขเรื่อง', `<span class="num">${esc(r.id)}</span>`], ['ผู้มีอาการ', esc(historyIdentity(S,r.who,r).name)], ['ยาที่สงสัย', esc(r.drug)], ['ผู้ดูแล', esc(P.name)], ['ติดต่อกลับ', esc(when)], ['ช่องทาง', `ข้อความในแอป หรือโทร ${esc(maskPhone(S.user.phone))}`], ...(rep ? [] : [['ร้านโทรจากเบอร์', `<span class="num nowrap">${esc(b.phone)}</span>`]])])}<div class="hr"></div>${tl}</div>
      ${rep ? '' : `<div class="mt12" data-in="3">${ui.note('<b>ระหว่างรอ</b> ยังไม่ต้องใช้ยาตัวที่สงสัยเพิ่ม จนกว่าเภสัชกรจะติดต่อกลับ', { icon: 'info' })}</div>`}
      ${sev ? '' : `<div class="mt12" data-in="4">${ui.note(`<b>ถ้าอาการแย่ลง</b> เช่น หายใจลำบาก ปากหรือหน้าบวม ไปโรงพยาบาลทันที`, { tone: 'danger', icon: 'octagon-alert' })}</div>`}
      ${rep ? '' : `<p class="af-foot">${ic('bell', 14, 2)}<span>เมื่อเภสัชกรตอบ จะมีแจ้งเตือนในแอปและในกล่องแจ้งเตือน</span></p>`}<div class="mt16">${ui.callHelp({ din: 5, branch: r.branch })}</div>`, { nonav: false }) +
      ui.dock(`${ui.btn('อยากคุยตอนนี้', { a: 'afAdrTalk', icon: 'message-circle' })}${ui.btn('ดูบันทึกของฉัน', { kind: 'ghost', a: 'adrBackRecords' })}`, { note: closed ? `ร้านปิดอยู่ ฝากคำถามไว้ได้ เภสัชกรตอบ${TP.OF_REPLY}` : '' });
  }
});
TP.act('adrBackRecords',()=>{TP.S._adrWho=TP.S._adrSent?.who||'me';TP.go('adrcare')});
TP.act('afAdrTalk', () => {
  const S = TP.S, r = S._adrSent || sentMock(S);
  const since = (SINCE.find(s => s[0] === r.since) || SINCE[0])[1];
  const urgent = [];
  if (r.sym.includes('หายใจลำบาก')) urgent.push('หายใจลำบาก');
  if (r.sym.includes('ปาก หน้า หรือตาบวม')) urgent.push('ปากบวม หน้าบวมหลังใช้ยา');
  Object.assign(S.intake, { who: r.who, symptoms: ['ถามเรื่องยา'], urgent, note: `แจ้งอาการหลังใช้ยา ${r.drug} · ${r.sym.join(', ') || 'อาการผิดปกติ'} · เริ่ม${since}${r.note ? ' · ' + r.note : ''}`, photos: 0 });
  if (S.storeOpen) TP.go('intake');
  else if (TP.SCREENS.offline) TP.go('offline');
  else TP.notify('ร้านปิดอยู่ เปิดอีกครั้ง 09:00', { icon: 'moon' });
});
/* pharmacist reply arrives as an in-app notification (panel simulation) */
TP.simAction?.({
  id: 'afAdrReply', label: 'ตอบเรื่องแจ้งอาการหลังใช้ยา', when: S => !!S._adrSent && !S._adrSent.replied,
  run() {
    const S = TP.S, r = S._adrSent; if (!r) return;
    r.replied = true; S.st.adrsent = 'replied'; TP.setFlag('storeOpen', true);
    const p = personOf(r.who);
    if (!r.patientReport && p && r.known && !(p.allergies || []).includes(r.drug)) { p.allergies = [...(p.allergies || []), r.drug]; p.allergyState = 'set'; }
    const n = { id: 'n' + Date.now().toString(36), kind: 'adr', title: 'มีข้อความใหม่จากเภสัชกร', body: 'แตะเพื่ออ่าน', time: `${TP.NOW.date} 14:40`, read: false, go: 'adrsent', st: 'replied', p:{id:r.id} };
    S.inbox.unshift(n);
    TP.emit('state');
    if (TP.cur()?.id === 'adrsent') { n.read = true; TP.refresh(); TP.notify('เภสัชกรตอบแล้ว', { icon: 'message-circle' }); }
    else TP.banner({ title: n.title, body: n.body, onTap: () => openNote(n) });
  }
});

/* =====================================================================
   Inbox (A13): in-app notifications, neutral wording only
   ===================================================================== */
const KIND_IC = { summary: 'file-text', adr: 'message-square-text', news: 'bell', queue: 'clock', msg: 'message-circle', order: 'receipt', pay: 'receipt' };
function openNote(n) {
  if (!n) return;
  const S = TP.S; n.read = true; TP.emit('state');
  if (!n.go || !TP.SCREENS[n.go]) { if (TP.cur()?.id === 'inbox') TP.refresh({ anim: false }); return; }
  if (n.st) { S.st[n.go] = n.st; TP.SCREENS[n.go].prep?.(S); }
  if (['home', 'history', 'account'].includes(n.go)) return TP.tab(n.go);
  const params = n.p || (n.go === 'summary' && S.history[0] ? { id: S.history[0].id } : {});
  return TP.go(n.go, { params });
}
TP.screen('inbox', {
  group: 'after', title: 'กล่องแจ้งเตือน', code: 'C404', ref: 'A13', tab: 'inbox',
  states: [['normal', 'มีรายการใหม่'], ['read', 'อ่านหมดแล้ว'], ['empty', 'ยังไม่มี']],
  notes: ['A13: รอบแรกไม่มี SMS / LINE flex ใช้กล่องแจ้งเตือนในแอปแทน', 'ข้อความเป็นคำกลาง ๆ ไม่มีอาการ ชื่อยา หรือยอดเงิน (PDPA)', 'ยังไม่อ่าน = จุด + ตัวหนา ไม่ใช้สีอย่างเดียว', 'แตะแล้วไปจอที่เกี่ยวข้อง · อ่านทั้งหมดได้ในครั้งเดียว'],
  prep(S) {
    const st = S.st.inbox; if (!st) return;
    if (st === 'empty') { S.inbox = []; return; }
    S.inbox = TP.fresh().inbox;
    if (st === 'normal') {
      S.inbox[0].read = false;
      S.inbox.unshift({ id: 'n5', kind: 'adr', title: 'มีข้อความใหม่จากเภสัชกร', body: 'แตะเพื่ออ่าน', time: `${TP.NOW.date} 14:40`, read: false, go: 'adrsent', st: 'replied', p:{id:r.id} });
    }
  },
  render(ctx) {
    const S = ctx.S, unread = S.inbox.filter(n => !n.read).length;
    const nav = ui.nav({ back: backL('home'), title: 'การแจ้งเตือน', right: `<button type="button" class="txtbtn" data-a="afReadAll" ${unread ? '' : 'disabled'}>อ่านทั้งหมด</button>` });
    if (!S.inbox.length) return nav + ui.page(ui.empty({ icon: 'bell', title: 'ยังไม่มีการแจ้งเตือน', body: 'เมื่อเภสัชกรรับคิว ตอบข้อความ หรือใบสรุปพร้อม จะแจ้งไว้ที่นี่' }), { lt: 'การแจ้งเตือน' });
    return nav + ui.page(`<div class="group" data-in="1">${S.inbox.map(n => `<button type="button" class="af-nt${n.read ? '' : ' unread'}" data-a="afOpenNote" data-v="${esc(n.id)}">
        <span class="af-nt-i">${ic(KIND_IC[n.kind] || 'bell', 19, 1.9)}</span>
        <span class="af-nt-t"><b>${esc(n.title)}</b>${n.body ? `<span>${esc(n.body)}</span>` : ''}<small>${esc(n.time || '')}</small></span>
        <span class="af-nt-dot" aria-hidden="true"></span>${n.read ? '' : '<span class="sr">ยังไม่ได้อ่าน</span>'}
      </button>`).join('')}</div>
      <p class="af-foot">${ic('lock', 14, 2)}<span>ข้อความแจ้งเตือนไม่บอกอาการ ชื่อยา หรือยอดเงิน เปิดแอปเพื่อดูรายละเอียด</span></p>`, { lt: 'การแจ้งเตือน', sub: unread ? `ยังไม่ได้อ่าน ${unread} รายการ` : 'อ่านครบแล้ว' });
  }
});
TP.act('afOpenNote', async t => {
  const n = TP.S.inbox.find(x => x.id === t.dataset.v); if (!n) return;
  if (!n.read) { t.classList.remove('unread'); $('.sr', t)?.remove(); await TP.wait(RM() ? 0 : 160); }
  openNote(n);
});
TP.act('afReadAll', t => {
  const S = TP.S, el = curEl(); if (!el) return;
  S.inbox.forEach(n => { n.read = true; }); TP.emit('state');
  $$('.af-nt.unread', el).forEach((n, i) => setTimeout(() => n.classList.remove('unread'), RM() ? 0 : i * 70));
  $$('.af-nt .sr', el).forEach(s => s.remove());
  t.disabled = true;
  const sub = $('.lt-sub', el); if (sub) sub.textContent = 'อ่านครบแล้ว';
  TP.live('อ่านทั้งหมดแล้ว');
});

/* =====================================================================
   Account (tab root)
   ===================================================================== */
TP.screen('account', {
  group: 'account', title: 'บัญชี', code: 'C501', tab: 'account', sb: 'dark',
  states: [['normal', 'ปกติ'], ['withdrawn', 'ถอนความยินยอมแล้ว'], ['profile-cover', 'ปกบัญชีและโปรไฟล์ตรงกลาง'], ['abstract-cover', 'ปก Abstract CI เต็ม safe area'], ['clean-profile', 'โปรไฟล์พื้นเทาและเมนูพื้นขาว']],
  notes: ['บัญชีเดียวกับเว็บ mitraree.com (A3) · เบอร์โทรแสดงแบบซ่อนกลาง', 'ข้อมูลสุขภาพเจ้าของบัญชี ใช้เติมจอแจ้งอาการ', 'ความยินยอมเปิดอ่านเอกสารทันที ไม่มีช่องติ๊กซ้ำ · ข่าวสารเปิดปิดได้ในการตั้งค่า', 'ออกจากระบบต้องยืนยันก่อน', 'ฝ่ายบริการลูกค้า 10:00-18:00 ติดป้ายแยกจากเวลาร้าน'],
  prep(S) { const st = S.st.account; if (!st) return; S.consent = st !== 'withdrawn'; TP.emit('state'); },
  render(ctx) {
    const S = ctx.S, u = S.user, unread = S.inbox.filter(n => !n.read).length;
    const prof = `<header class="account-profile account-profile-clean" data-in="1"><div class="account-profile-body"><div class="account-avatar-wrap"><div class="account-avatar">${ui.av(u.full, { ini: iniOf(u.full), size: 'xl', solid: true })}</div><button type="button" class="account-edit-avatar" data-a="afEditProf" aria-label="แก้ไขข้อมูลส่วนตัว">${ic('pencil',16,2)}</button></div><h2>${esc(u.full)}</h2><p class="account-phone num">${esc(maskPhone(u.phone))}</p></div></header>`;
    return ui.nav({ title: 'บัญชี' }) + ui.page(`${prof}<div class="account-menu">
      ${S.consent ? '' : `<div class="mt12" data-in="1">${ui.note('<b>คุณถอนความยินยอมแล้ว</b><br>ปรึกษาเภสัชกรผ่านแอปไม่ได้จนกว่าจะยินยอมอีกครั้ง <button type="button" class="link" data-go="consents">ดูรายละเอียด</button>', { tone: 'warn' })}</div>`}
      ${ui.group([
        ui.row({ icon: 'user', title: 'ข้อมูลส่วนตัว', sub: 'ชื่อ นามสกุล ปีเกิด เพศ', a: 'afEditProf' }),
        ui.row({ icon: 'clipboard-list', title: 'ข้อมูลสุขภาพของฉัน', sub: algText(u), go: 'health' }),
        ui.row({ icon: 'map-pin', title: 'สมุดที่อยู่', sub: 'เพิ่ม แก้ไข และตั้งที่อยู่หลัก', go: 'addressbook' })
      ], { title: 'ข้อมูลของฉัน', din: 2 })}
      ${ui.group([ui.row({ icon: 'shield-check', title: 'ความยินยอม', sub: 'อ่านรายละเอียดการใช้ข้อมูลสุขภาพ', go: 'consents' })], { title: 'ความเป็นส่วนตัว', din: 3 })}
      ${ui.group([
        ui.row({ icon: 'inbox', title: 'กล่องแจ้งเตือน', sub: unread ? `ยังไม่ได้อ่าน ${unread} รายการ` : 'อ่านครบแล้ว', go: 'inbox', tag: unread ? [`ใหม่ ${unread}`, 'solid'] : undefined }),
        ui.switchRow({ icon: 'bell', title: 'การแจ้งเตือน', sub: 'ข้อความไม่บอกอาการ ชื่อยา หรือยอดเงิน', on: S.notif, a: 'afNotif' }),
        ui.switchRow({ icon: 'bell', title: 'ข่าวสารและสิทธิพิเศษ', sub: 'เลือกเปิดหรือปิดได้ ไม่กระทบการใช้บริการ', on: !!S.marketing, a: 'afMkt' }),
        ui.switchRow({ icon: 'scan-face', title: 'Face ID หรือลายนิ้วมือ', sub: 'ใช้ปลดล็อกแอปบนเครื่องนี้', on: S.faceId, a: 'afFace' })
      ], { title: 'การตั้งค่า', din: 4 })}
      ${ui.group([ui.row({ icon: 'headset', title: 'ติดต่อฝ่ายบริการลูกค้า', sub: 'ทุกวัน 10:00-18:00', go: 'help' })], { title: 'ช่วยเหลือ', din: 5 })}
      <div class="mt24">${ui.group([
        ui.row({ icon: 'log-out', title: 'ออกจากระบบ', sheet: 'logout', chev: false }),
        ui.row({ icon: 'trash', iconCls: 'danger', title: 'ลบบัญชี', go: 'deleteacc', danger: true })
      ], { din: 6 })}</div>
      <p class="af-ver">แอปเวอร์ชัน 1.1.0</p></div>`);
  }
});
TP.act('afNotif', t => {
  const on = t.getAttribute('aria-checked') === 'true';
  TP.S.notif = on; TP.S.notifAsked = true;
  TP.notify(on ? 'เปิดการแจ้งเตือนแล้ว' : 'ปิดการแจ้งเตือนแล้ว', { icon: on ? 'bell' : 'bell-off' });
});
TP.act('afFace', t => {
  const on = t.getAttribute('aria-checked') === 'true';
  TP.S.faceId = on;
  TP.notify(on ? 'เปิดปลดล็อกด้วย Face ID แล้ว' : 'ปิด Face ID แล้ว', { icon: 'scan-face' });
});
TP.sheetDef('logout', {
  group: 'account', title: 'ออกจากระบบ', code: 'C510', host: 'account',
  notes: ['ยืนยันก่อนออก · ประวัติและใบสรุปยังอยู่ในบัญชี', 'มีเคสค้าง = เตือนว่าจะไม่ได้รับแจ้งเตือนจนกว่าจะเข้าใหม่'],
  render: () => `<div class="af-sh-top">${brand.halo(60, { still: true, icon: 'log-out' })}<p class="body">ออกจากระบบบนเครื่องนี้ ประวัติการปรึกษาและใบสรุปยังอยู่ในบัญชี เข้าใหม่ได้ด้วยเบอร์โทรและรหัส OTP</p></div>
    ${caseOpen() ? `<div class="mt12">${ui.note('มีการปรึกษาที่ยังไม่จบ ออกจากระบบแล้วจะไม่ได้รับแจ้งเตือนจนกว่าจะเข้าใหม่', { tone: 'warn' })}</div>` : ''}`,
  foot: () => ui.btn('ออกจากระบบ', { kind: 'danger', a: 'afLogout', icon: 'log-out' }) + ui.btn('ยกเลิก', { kind: 'ghost', closeSheet: true })
});
TP.act('afLogout', async t => {
  t.classList.add('busy'); await TP.wait(RM() ? 50 : 500);
  TP.S.loggedIn = false; TP.emit('state');
  await TP.closeSheet({ instant: true });
  if (TP.SCREENS.login) TP.go('login', { via: 'fade', root: true });
  else { TP.go('home', { via: 'fade', root: true }); TP.notify('ออกจากระบบแล้ว', { icon: 'log-out' }); }
});

/* =====================================================================
   Household members (C2)
   ===================================================================== */
const EXTRA_FAMILY = [
  { id: 'dad', name: 'สมศักดิ์ ใจดี', rel: 'พ่อ', age: 71, weight: 64, allergies: [], allergyState: 'none', meds: ['ยาลดไขมัน'], attest: true },
  { id: 'sp', name: 'วิชัย ใจดี', rel: 'คู่สมรส', age: 39, weight: 72, allergies: ['ไอบูโพรเฟน'], allergyState: 'set', meds: [], attest: true },
  { id: 'kid2', name: 'ข้าวปุ้น ใจดี', rel: 'ลูก', age: 3, weight: 14, allergies: [], allergyState: 'unknown', meds: [], attest: true, child: true },
  { id: 'aunt', name: 'สมพร ใจงาม', rel: 'อื่น ๆ', age: 55, weight: '', allergies: [], allergyState: 'unknown', meds: [], attest: true }
];
function fullFamilyPreview() {
  const base=TP.fresh().family;
  return JSON.parse(JSON.stringify([...base,...EXTRA_FAMILY.filter(f=>!base.some(person=>person.id===f.id))])).slice(0,MAX_FAMILY);
}
function memRow(f) {
  const meta = [f.rel, f.age !== '' && f.age != null ? `${f.age} ปี` : '', f.weight ? `${f.weight} กก.` : ''].filter(Boolean).join(' · ');
  return `<button type="button" class="af-mem" ${ui.route({ go: 'familyedit', p: { id: f.id } })}>${ui.av(f.name, { ini: iniOf(f.name), img: TP.profileImage(f.id) })}<span class="af-mem-t"><b>${esc(f.name)}</b><span>${esc(meta)}</span><span class="af-tags">${algTag(f)}${f.child ? ui.tag('เด็ก', 'muted') : ''}</span></span><span class="chev">${ic('chevron-right', 18, 2)}</span></button>`;
}
TP.screen('family', {
  group: 'account', title: 'สมาชิกในบ้าน', code: 'C502', hidden:true, disabled:true, ref: 'C2', parent: 'account', host:'account',
  states: [['normal', 'สมาชิก 5 คน รวมตัวเองเป็น 6'], ['empty', 'ยังไม่มี'], ['full', 'ครบ 6 คน'], ['generated-members', 'รูปโปรไฟล์สมาชิกใหม่ 3 คน']],
  notes: ['C2: ใช้สมาชิกในบ้านจาก LMA เป็นฐาน ผู้ใช้เพิ่มเองได้ (A12)', 'สูงสุด 6 คน ครบแล้วปุ่มเพิ่มกดไม่ได้ พร้อมเหตุผล', 'แต่ละคนบอกสถานะแพ้ยา: แพ้ / ไม่มีประวัติ / ยังไม่ระบุ (ไม่เท่ากัน)'],
  prep(S) {
    const st = S.st.family; if (!st) return;
    S.family = st === 'empty' ? [] : st === 'full' ? fullFamilyPreview() : TP.fresh().family;
    TP.emit('state');
  },
  render(ctx) {
    const S = ctx.S, n = S.family.length, full = n >= MAX_FAMILY;
    const list = n ? `<div class="group" data-in="2">${S.family.map(memRow).join('')}</div>` : ui.empty({ icon: 'users', title: 'ยังไม่มีสมาชิกในบ้าน', body: 'เพิ่มคนในบ้านไว้ เพื่อปรึกษาเภสัชกรแทนได้ เช่น ลูก หรือพ่อแม่', din: 2 });
    return ui.nav({ back: backL('account'), title: 'สมาชิกในบ้าน' }) + ui.page(`
      <div class="af-count" data-in="1"><span>สมาชิก <b class="num">${n}/${MAX_FAMILY}</b> คน</span><span class="af-slots" aria-hidden="true">${Array.from({ length: MAX_FAMILY }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span></div>
      ${list}
      <div class="mt16" data-in="3">${ui.btn('เพิ่มสมาชิก', { kind: n ? 'secondary' : 'primary', icon: 'user-plus', go: 'familyedit', p: { new: 1 }, disabled: full })}</div>
      ${full ? `<p class="af-reason">${ic('info', 15, 2)}<span>ครบ 6 คนแล้ว ลบสมาชิกที่ไม่ได้ปรึกษาแทนแล้วก่อน จึงเพิ่มคนใหม่ได้</span></p>` : ''}
      <p class="af-foot">${ic('lock', 14, 2)}<span>ข้อมูลสมาชิกใช้เฉพาะตอนปรึกษาเภสัชกรแทนคนนั้น</span></p>`, { lt: 'สมาชิกในบ้าน', sub: 'ปรึกษาเภสัชกรแทนคนในบ้านได้ เพิ่มได้สูงสุด 6 คน' });
  }
});

/* ---------- shared form draft (bound through data-bind="_dr.x") ---------- */
const newKey = () => 'k' + Math.random().toString(36).slice(2, 8);
/* an allergy the pharmacist recorded shows who recorded it (as C203 does); removing it asks first and is reported, never silent */
const phAlg = d => /^บันทึกโดย ภ/.test(d.algSrc || '') ? (d.algPh || []) : [];
function algEditor(d) {
  const none = d.allergyState === 'none', ph = phAlg(d);
  return `<div class="chips af-algs">${d.allergies.map(a => `<span class="chip af-chip${ph.includes(a) ? ' af-chip-ph' : ''}"><span>${esc(a)}${ph.includes(a) ? `<small>${esc(d.algSrc)}</small>` : ''}</span><button type="button" class="af-x" data-a="afAlgRm" data-v="${esc(a)}" aria-label="ลบ ${esc(a)}">${ic('x', 14, 2.4)}</button></span>`).join('') || (none ? ui.tag('ไม่มีประวัติแพ้ยา', 'ok') : ui.tag('ยังไม่ได้ระบุ', 'warn'))}</div>
    <div class="hrow mt12"><input class="input grow" id="afAlgIn" placeholder="พิมพ์ชื่อยาที่แพ้" aria-label="ชื่อยาที่แพ้" data-bind="_dr.algIn" value="${esc(d.algIn || '')}" maxlength="60" enterkeyhint="done" ${none ? 'disabled' : ''}>${ui.btn('เพิ่ม', { kind: 'tint', sm: true, a: 'afAlgAdd', disabled: none, cls: 'af-add' })}</div>
    ${ui.check('ไม่มีประวัติแพ้ยา', { on: none, a: 'afAlgNone', disabled: d.allergies.length > 0 })}
    ${d.allergies.length ? '<p class="hint">มีรายการแพ้ยาอยู่ จึงเลือก ไม่มีประวัติแพ้ยา ไม่ได้</p>' : ''}
    ${d.algRmReq?.length ? `<p class="hint af-rmreq">${ic('info', 14, 2)}<span>${esc(`แจ้งลบ ${d.algRmReq.join(', ')} แล้ว · เภสัชกรจะเห็นตอนปรึกษาครั้งหน้า`)}</span></p>` : ''}
    <p class="hint">ไม่แน่ใจ เว้นว่างไว้ได้ "ยังไม่ได้ระบุ" ไม่เท่ากับ "ไม่แพ้ยา" เภสัชกรจะถามก่อนจ่ายยาทุกครั้ง</p>`;
}
/* an allergy typed but not added with "เพิ่ม" is kept on save, never dropped silently (real-user R 19/10) */
const keepTypedAlg = d => { const v = String(d.algIn || $('#afAlgIn', curEl())?.value || '').trim(); if (v && d.allergyState !== 'none') { if (!d.allergies.includes(v)) d.allergies.push(v); d.allergyState = 'set'; d.algIn = ''; } };
/* regular medicine, typed one per row (owner 19/10 "ให้พิมพ์ได้เองทีละช่อง ไม่เอาแบบเลือก") · blank rows are dropped on save */
const cleanMeds = a => [...new Set(a.map(x => String(x).trim()).filter(Boolean))];
function medsEditor(d) {
  const rows = d.meds.length ? d.meds : [''];
  return `<div class="af-mlist" role="list" aria-label="ยาที่ใช้ประจำ">${rows.map((m, i) => `<div class="af-mrow" role="listitem"><input class="input grow" data-mi="${i}" value="${esc(m)}" placeholder="${i ? 'ยาอีกตัว' : 'เช่น ยาความดัน หรือชื่อบนกล่องยา'}" aria-label="ยาที่ใช้ประจำ ตัวที่ ${i + 1}" maxlength="60" enterkeyhint="next" autocomplete="off"><button type="button" class="af-x" data-a="afMedRm" data-v="${i}" aria-label="ลบยาตัวที่ ${i + 1}">${ic('x', 16, 2.4)}</button></div>`).join('')}</div>
    <button type="button" class="link af-medmore mt8" data-a="afMedRow">${ic('plus', 16, 2.2)}<span>เพิ่มยาอีกตัว</span></button>
    <p class="hint">ช่องละ 1 ตัว ไม่รู้ชื่อยา พิมพ์ว่าเป็นยาอะไรก็ได้ เช่น ยาความดัน เภสัชกรจะถามต่อเอง</p>`;
}
const medRows = d => (d.meds.length ? d.meds : (d.meds = ['']));
async function medFocus(i) { await TP.refresh({ anim: false }); const x = $(`[data-mi="${i}"]`, curEl()); if (x) { x.focus({ preventScroll: true }); x.scrollIntoView({ block: 'nearest' }); } }
function wireEnter(el) {
  el.addEventListener('input', e => { const i = e.target.dataset?.mi, d = TP.S._dr; if (i === undefined || !d) return; medRows(d)[+i] = e.target.value; });
  el.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (e.target.id === 'afAlgIn') { e.preventDefault(); TP.ACTS.afAlgAdd($('.af-add', el)); }
    const i = e.target.dataset?.mi, d = TP.S._dr;
    if (i === undefined || !d) return;
    e.preventDefault();
    if (!e.target.value.trim()) return;
    const rows = medRows(d), next = +i + 1;
    if (next >= rows.length || rows[next].trim()) rows.splice(next, 0, '');
    medFocus(next);
  });
}
TP.act('afMedRow', () => { const d = TP.S._dr; if (!d) return; const rows = medRows(d); if (rows[rows.length - 1].trim()) rows.push(''); return medFocus(rows.length - 1); });
/* the next row slides under the finger: a quick second tap must not delete it too (real-user R 19/10) */
let medRmAt = 0;
TP.act('afMedRm', async t => {
  const d = TP.S._dr; if (!d || Date.now() - medRmAt < 600) return; medRmAt = Date.now(); const rows = medRows(d), i = +t.dataset.v;
  rows.splice(i, 1); if (!rows.length) rows.push('');
  await TP.refresh({ anim: false });
  $(`[data-mi="${Math.min(i, rows.length - 1)}"]`, curEl())?.focus({ preventScroll: true });
});
TP.act('afAlgAdd', async () => {
  const d = TP.S._dr, el = curEl(); if (!d || !el) return;
  const v = String(d.algIn || $('#afAlgIn', el)?.value || '').trim();
  if (!v) { shake($('#afAlgIn', el)); $('#afAlgIn', el)?.focus(); return; }
  if (!d.allergies.includes(v)) d.allergies.push(v);
  d.allergyState = 'set'; d.algIn = '';
  await TP.refresh({ anim: false });
  const e2 = curEl(), chips = $$('.af-chip', e2); pop(chips[chips.length - 1]);
  $('#afAlgIn', e2)?.focus({ preventScroll: true });
});
const algRm = (d, v) => { d.allergies = d.allergies.filter(a => a !== v); if (!d.allergies.length) d.allergyState = 'unknown'; };
TP.act('afAlgRm', t => { const d = TP.S._dr; if (!d) return; const v = t.dataset.v; if (phAlg(d).includes(v)) { TP.sheet('algdel', { v }); return; } algRm(d, v); TP.refresh({ anim: false }); });
TP.sheetDef('algdel', {
  group: 'account', title: 'ลบแพ้ยาที่เภสัชกรบันทึก', code: 'C513', host: 'health',
  notes: ['ผู้ใช้จริง 21/10: กดกากบาทแล้วแพ้ยาที่เภสัชกรบันทึกหายเงียบ · ตอนนี้ถามก่อน และเภสัชกรเห็นว่าลูกค้าแจ้งลบ (ทำตอนสร้างจริง: ส่งเป็นคำขอให้เภสัชกรยืนยัน ไม่ลบจากประวัติการจ่ายยา)'],
  render(ctx) {
    const v = ctx.params?.v || 'ยานี้', d = TP.S._dr;
    return `<p class="body"><b>${esc(v)}</b> เภสัชกรบันทึกไว้${d?.algSrc ? ` (${esc(d.algSrc.replace(/^บันทึกโดย /, ''))})` : ''}</p>
      <p class="body mt8">ถ้าลบ เภสัชกรจะเห็นว่าคุณแจ้งลบ และอาจถามยืนยันตอนปรึกษาครั้งหน้า</p>
      <p class="small mt8">ไม่แน่ใจว่าแพ้หรือไม่ เก็บไว้ก่อนปลอดภัยกว่า</p>`;
  },
  foot: () => ui.btn('แจ้งลบ', { kind: 'danger', a: 'afAlgRmOk', icon: 'trash' }) + ui.btn('เก็บไว้', { kind: 'ghost', closeSheet: true })
});
TP.act('afAlgRmOk', (t, ctx) => {
  const d = TP.S._dr, v = ctx?.params?.v; if (!d || !v) return TP.closeSheet();
  algRm(d, v); d.algRmReq = [...new Set([...(d.algRmReq || []), v])];
  TP.closeSheet().then(() => { TP.refresh({ anim: false }); TP.notify(`แจ้งลบ ${v} แล้ว เภสัชกรจะเห็น`, { icon: 'info' }); });
});
TP.act('afAlgNone', t => { const d = TP.S._dr; if (!d) return; if (t.getAttribute('aria-checked') === 'true') { d.allergies = []; d.allergyState = 'none'; } else d.allergyState = 'unknown'; TP.refresh({ anim: false }); });

/* =====================================================================
   Member add / edit (C2)
   ===================================================================== */
const RELS = [['พ่อแม่', 'พ่อแม่'], ['ลูก', 'ลูก'], ['คู่สมรส', 'คู่สมรส'], ['อื่น ๆ', 'อื่น ๆ']];
const relKey = r => ['พ่อ', 'แม่', 'พ่อแม่'].includes(r) ? 'พ่อแม่' : ['ลูก', 'คู่สมรส', 'อื่น ๆ'].includes(r) ? r : r ? 'อื่น ๆ' : '';
const isChild = d => { const a = String(d.age ?? '').trim(); return a !== '' && /^\d+$/.test(a) ? +a < 18 : d.rel === 'ลูก'; };
const attestText = d => {
  const nm = first(d.name);
  return isChild(d)
    ? `ฉันเป็นพ่อแม่หรือผู้ปกครองตามกฎหมายของ${nm ? ' ' + nm : 'เด็กคนนี้'} และยินยอมให้เก็บและใช้ข้อมูลสุขภาพของเด็กเพื่อการปรึกษาเภสัชกร`
    : `ฉันได้รับความยินยอมจาก${nm ? ' ' + nm + ' ' : 'เจ้าของข้อมูล'}แล้ว ให้เก็บและใช้ข้อมูลสุขภาพนี้เพื่อการปรึกษาเภสัชกร`;
};
const mergeText = d => { const nm = first(d.name); return `ถ้า${nm ? ' ' + nm + ' ' : 'สมาชิก'}มีบัญชีแอปของตัวเอง ข้อมูลในบัญชีนั้นจะแยกจากที่บันทึกไว้ที่นี่`;
};
function validate(d) {
  const e = {}, age = String(d.age ?? '').trim(), w = String(d.weight ?? '').trim();
  if (!String(d.name || '').trim()) e.name = 'กรอกชื่อของสมาชิก';
  if (!d.rel) e.rel = 'เลือกความสัมพันธ์';
  if (age && (!/^\d{1,3}$/.test(age) || +age > 120)) e.age = 'กรอกเป็นตัวเลข 0-120';
  if (w && (!/^\d{1,3}(\.\d)?$/.test(w) || +w <= 0 || +w > 250)) e.weight = 'กรอกเป็นตัวเลข เช่น 20';
  if (!d.attest) e.attest = 'ติ๊กรับรองก่อนบันทึก';
  return e;
}
/* 20/10 console round 5: the pharmacist sees โรคประจำตัว and แพ้อาหาร with the allergies, so the customer keeps them here too */
const condCard = (d, din, kid) => `<section class="card af-card" data-in="${din}"><h3 class="af-h">โรคประจำตัว${kid ? '' : ' <span class="af-hint">รวมการตั้งครรภ์หรือให้นมบุตร</span>'}</h3>
  ${ui.chips('afCond', kid ? CONDS.filter(c => !/ตั้งครรภ์/.test(c)) : CONDS, d.conds, { a: 'afCond', label: 'โรคประจำตัว' })}
  ${ui.check('ไม่มีโรคประจำตัว', { on: d.condNone, a: 'afCondNone', id: 'afCondNone' })}</section>`;
/* item 74 (owner 20/10 "แพ้ยากับผลข้างเคียงมันไม่เหมือนกันนะ"): a side effect is not an allergy. The pharmacist records it,
   the customer can read it but not edit it, it never blocks the medicine, and the Naranjo score stays in the console */
TP.act('goHealth', () => { const S = TP.S; S.st.health = 'sfx'; TP.SCREENS.health?.prep?.(S); TP.go('health'); });
const SFX_CPM = { ing: 'คลอร์เฟนิรามีน', sym: 'ง่วงมาก', by: 'ภญ.ขวัญใจ', at: '18/10/2026' };
const sfxCard = (list = []) => list.length ? `<section class="card af-card af-sfx" data-in="1"><h3 class="af-h">${ic('triangle-alert', 17, 2)}<span>ผลข้างเคียงที่เคยมี</span>${ui.tag('ไม่ใช่การแพ้ยา', 'warn')}</h3>
  <ul class="af-sfxl">${list.map(x => `<li><b>${esc(x.sym)} จาก${esc(x.ing)}</b><small>${esc(x.at)} · บันทึกโดย ${esc(x.by)}</small></li>`).join('')}</ul>
  <p class="hint">เภสัชกรจะดูประกอบทุกครั้ง เพื่อเลือกยาหรือวิธีใช้ที่เหมาะกว่า · คิดว่าเป็นการแพ้ แจ้งเภสัชกรในการปรึกษาครั้งหน้า</p></section>` : '';
const foodCard = (d, din) => `<section class="card af-card" data-in="${din}"><h3 class="af-h">แพ้อาหาร</h3>
  ${ui.field({ id: 'afFood', label: 'อาหารที่แพ้', value: d.food || '', placeholder: 'เช่น ไข่ กุ้ง ถั่วลิสง', bind: '_dr.food', a: 'afFoodLive', hint: 'เภสัชกรใช้ประกอบการเลือกยา', max: 80 })}
  ${ui.check('ไม่แพ้อาหาร', { on: d.foodNone, a: 'afFoodNone', id: 'afFoodNone' })}</section>`;
const foodOf = d => (d.foodNone ? '' : String(d.food || '').trim());
function feDraft(S, ctx) {
  if (!ctx.params._k) ctx.params._k = newKey();
  if (S._dr && S._dr._k === ctx.params._k) return S._dr;
  let src = null, err = false;
  if (ctx.params.id) src = S.family.find(f => f.id === ctx.params.id);
  else if (!ctx.params.new) {
    const st = ctx.state;
    if (st === 'kid') src = S.family.find(f => f.child) || null;
    else if (st === 'edit') src = S.family.find(f => !f.child) || S.family[0] || null;
    err = st === 'error';
  }
  const d = S._dr = { _k: ctx.params._k, form: 'member', id: src?.id || '', isNew: !src, name: src?.name || '', rel: src ? relKey(src.rel) : '', relRaw: src?.rel || '', age: src?.age ?? '', weight: src?.weight ?? '', allergies: [...(src?.allergies || [])], algSrc: src?.allergySrc || '', algPh: [...(src?.allergies || [])], allergyState: src?.allergyState || 'unknown', meds: [...(src?.meds || [])], conds: [...(src?.conditions || [])], condNone: !!src?.condNone, food: src?.food || '', foodNone: !!src?.foodNone, attest: !!src?.attest, algIn: '', errors: {} };
  if (err) d.errors = validate(d);
  return d;
}
const errP = (id, msg) => msg ? `<p class="af-err" id="${id}">${ic('circle-x', 16, 2)}<span>${esc(msg)}</span></p>` : '';
TP.screen('familyedit', {
  group: 'account', title: 'เพิ่ม / แก้ไขสมาชิก', code: 'C503', hidden:true, disabled:true, ref: 'C2', parent: 'family', host:'account',
  states: [['edit', 'แก้ไข (ผู้ใหญ่)'], ['kid', 'แก้ไข (เด็ก)'], ['new', 'เพิ่มใหม่'], ['error', 'กรอกไม่ครบ']],
  notes: ['19/10 เจ้าของสั่ง "ให้พิมพ์ได้เองทีละช่อง ไม่เอาแบบเลือก": ยาที่ใช้ประจำพิมพ์ช่องละ 1 ตัว · กด Enter หรือ เพิ่มยาอีกตัว ได้ช่องใหม่ · ปุ่ม x ลบทีละตัว · ช่องว่างไม่ถูกบันทึก · ใช้แบบเดียวกันในข้อมูลสุขภาพของฉัน (C505)', 'C2: ชื่อ · ความสัมพันธ์ (พ่อแม่ / ลูก / คู่สมรส / อื่น ๆ) · อายุและน้ำหนักไม่บังคับ', 'น้ำหนักใช้คิดขนาดยาเด็ก', 'แพ้ยารายคน · "ยังไม่ระบุ" ไม่เท่ากับ "ไม่แพ้"', 'ข้อความรับรองต่างกัน: เด็ก = ผู้ปกครอง · ผู้ใหญ่ = ได้รับความยินยอมแล้ว (เปลี่ยนเองตามอายุ / ความสัมพันธ์)', 'สมาชิกสมัครแอปเองภายหลัง รวมบัญชีได้ในรุ่นถัดไป', '20/10 ตามคอนโซลรอบ 5 (เภสัชกรเห็นโรคประจำตัวและแพ้อาหารคู่กับแพ้ยาและยาประจำ): เพิ่มโรคประจำตัวและแพ้อาหารของสมาชิกแต่ละคน ไม่บังคับ · เด็กไม่มีตัวเลือกตั้งครรภ์', 'เจ้าของเคาะ 20/10: อยู่ใต้ความยินยอมเดิม เพิ่มในข้อความแล้ว · ข้อความรับรองของสมาชิกพูดถึงข้อมูลสุขภาพทั้งหมดอยู่แล้ว ไม่ต้องแก้'],
  wait: ['ฝ่ายกฎหมายตรวจข้อความรับรองของผู้ปกครองเด็ก', 'อายุกี่ปีนับเป็นเด็ก (ตอนนี้ใช้ต่ำกว่า 18 ปี)'],
  prep(S) { const st = S.st.familyedit; if (!st) return; if (!S.family.length) S.family = TP.fresh().family; const c = TP.cur(); if (c?.id === 'familyedit') { delete c.params.id; delete c.params.new; delete c.params._k; } },
  render(ctx) {
    const S = ctx.S, d = feDraft(S, ctx), e = d.errors || {}, full = d.isNew && S.family.length >= MAX_FAMILY;
    return ui.nav({ back: backL('family'), title: d.isNew ? 'เพิ่มสมาชิก' : 'แก้ไขข้อมูลสมาชิก' }) + ui.page(`
      ${full ? `<div class="af-mb16">${ui.note('ครบ 6 คนแล้ว ลบสมาชิกที่ไม่ได้ปรึกษาแทนแล้วก่อน จึงเพิ่มคนใหม่ได้', { tone: 'warn' })}</div>` : ''}
      <section class="af-form" data-in="1">
        ${ui.field({ id: 'afFeName', label: 'ชื่อ-นามสกุล', value: d.name, placeholder: 'เช่น ข้าวหอม ใจดี', bind: '_dr.name', a: 'afFeLive', error: e.name, autocomplete: 'off', max: 60 })}
        <div class="field af-relf${e.rel ? ' err' : ''}"><span class="f-l">ความสัมพันธ์กับคุณ</span>${ui.seg('afRel', RELS, d.rel, { a: 'afFeRel', label: 'ความสัมพันธ์กับคุณ' })}${errP('afRelE', e.rel)}</div>
        <div class="af-2col">
          ${ui.field({ id: 'afFeAge', label: 'อายุ (ปี)', value: d.age === '' ? '' : String(d.age), inputmode: 'numeric', placeholder: 'เช่น 6', bind: '_dr.age', a: 'afFeLive', error: e.age, max: 3 })}
          ${ui.field({ id: 'afFeW', label: 'น้ำหนัก (กก.)', value: d.weight === '' ? '' : String(d.weight), inputmode: 'decimal', placeholder: 'เช่น 20', bind: '_dr.weight', error: e.weight, max: 5 })}
        </div>
        <p class="af-hint2">${ic('weight', 14, 2)}<span>ไม่บังคับทั้งสองช่อง · น้ำหนักใช้คำนวณขนาดยาสำหรับเด็ก</span></p>
      </section>
      <section class="card af-card" data-in="2"><h3 class="af-h">แพ้ยา</h3>${algEditor(d)}</section>
      <section class="card af-card" data-in="3"><h3 class="af-h">ยาที่ใช้ประจำ <span class="af-hint">ไม่บังคับ</span></h3>${medsEditor(d)}</section>
      ${condCard(d, 4, isChild(d))}${foodCard(d, 5)}
      <section class="af-attest${e.attest ? ' err' : ''}" data-in="6">
        <p class="af-attest-h" id="afAttestH">${isChild(d) ? 'สำหรับผู้ปกครองของเด็ก' : 'การรับรอง'}</p>
        ${ui.check(`<span id="afAttestTx">${esc(attestText(d))}</span>`, { on: d.attest, a: 'afFeAttest', id: 'afAttestCk' })}
        ${errP('afAttestE', e.attest)}
      </section>
      <p class="af-foot af-left">${ic('info', 14, 2)}<span id="afMergeTx">${esc(mergeText(d))}</span></p>
      ${d.isNew ? '' : `<div class="mt16" data-in="7">${ui.btn('ลบสมาชิก', { kind: 'danger-line', icon: 'trash', sheet: 'memberdel', p: { id: d.id } })}</div>`}`) +
      ui.dock(ui.btn(d.isNew ? 'เพิ่มสมาชิก' : 'บันทึก', { a: 'afFeSave', id: 'afFeSave', disabled: full }));
  },
  mount(el) { wireEnter(el); }
});
function feLive() {
  const d = TP.S._dr, el = curEl(); if (!d || !el) return;
  const tx = $('#afAttestTx', el); if (tx) tx.textContent = attestText(d);
  const mg = $('#afMergeTx', el); if (mg) mg.textContent = mergeText(d);
  const h = $('#afAttestH', el); if (h) h.textContent = isChild(d) ? 'สำหรับผู้ปกครองของเด็ก' : 'การรับรอง';
}
TP.act('afFeLive', feLive);
TP.act('afFeRel', t => {
  const d = TP.S._dr; if (!d) return; d.rel = t.dataset.v;
  if (d.errors?.rel) { delete d.errors.rel; const f = $('.af-relf', curEl()); f?.classList.remove('err'); $('#afRelE', curEl())?.remove(); }
  feLive();
});
TP.act('afFeAttest', t => {
  const d = TP.S._dr; if (!d) return; d.attest = t.getAttribute('aria-checked') === 'true';
  if (d.attest && d.errors?.attest) { delete d.errors.attest; $('.af-attest', curEl())?.classList.remove('err'); $('#afAttestE', curEl())?.remove(); }
});
TP.act('afFeSave', async t => {
  const S = TP.S, d = S._dr; if (!d || d.form !== 'member') return;
  keepTypedAlg(d);
  d.errors = validate(d);
  const keys = Object.keys(d.errors);
  if (keys.length) {
    await TP.refresh({ anim: false });
    const el = curEl(), bad = $('.field.err, .af-attest.err', el);
    bad?.scrollIntoView({ block: 'center', behavior: RM() ? 'auto' : 'smooth' });
    setTimeout(() => shake(bad), RM() ? 0 : 280);
    TP.live('ยังกรอกไม่ครบ ' + d.errors[keys[0]]);
    return;
  }
  t.classList.add('busy'); await TP.wait(RM() ? 50 : 600);
  const rel = d.rel === 'พ่อแม่' && ['พ่อ', 'แม่'].includes(d.relRaw) ? d.relRaw : d.rel;
  const rec = { name: d.name.trim(), rel, age: String(d.age).trim() === '' ? '' : +d.age, weight: String(d.weight).trim() === '' ? '' : +d.weight, allergies: [...d.allergies], allergyState: d.allergies.length ? 'set' : d.allergyState, meds: cleanMeds(d.meds), conditions: [...d.conds], condNone: d.condNone, food: foodOf(d), foodNone: d.foodNone, attest: true, child: isChild(d) };
  if (d.isNew) S.family.push({ id: 'm' + Date.now().toString(36), ...rec });
  else Object.assign(S.family.find(f => f.id === d.id) || {}, rec);
  S._dr = null; TP.emit('state');
  if (TP.canBack()) await TP.back(); else await TP.go('family', { via: 'fade', root: true });
  TP.notify(d.isNew ? 'เพิ่มสมาชิกแล้ว' : 'บันทึกแล้ว');
});
TP.sheetDef('memberdel', {
  group: 'account', title: 'ลบสมาชิก', code: 'C504', hidden:true, disabled:true, ref: 'C2', host: 'familyedit',
  notes: ['ยืนยันก่อนลบ บอกว่าอะไรหาย อะไรยังเก็บ'],
  render(ctx) {
    const id = ctx.params.id || TP.S._dr?.id, f = TP.S.family.find(x => x.id === id) || TP.S.family[0];
    const nm = first(f?.name) || 'สมาชิกคนนี้';
    return `<p class="body">ลบ <b>${esc(f?.name || nm)}</b> ออกจากสมาชิกในบ้าน</p>
      <ul class="af-bl mt8"><li>${ic('ban', 18, 2)}<span>ปรึกษาเภสัชกรแทน ${esc(nm)} ไม่ได้ จนกว่าจะเพิ่มใหม่</span></li>
      <li>${ic('trash', 18, 2)}<span>ข้อมูลแพ้ยา ยาประจำ โรคประจำตัว และแพ้อาหารของ ${esc(nm)} จะถูกลบ</span></li>
      <li>${ic('file-text', 18, 2)}<span>ประวัติการปรึกษาที่ผ่านมายังเก็บไว้ 1 ปีนับจากวันปิดเคส ตามที่ อย. กำหนด</span></li></ul>`;
  },
  foot: () => ui.btn('ลบสมาชิก', { kind: 'danger', a: 'afMemDel', icon: 'trash' }) + ui.btn('ยกเลิก', { kind: 'ghost', closeSheet: true })
});
TP.act('afMemDel', async (t, ctx) => {
  const S = TP.S, id = ctx?.params?.id || S._dr?.id || S.family[0]?.id;
  t.classList.add('busy'); await TP.wait(RM() ? 50 : 500);
  S.family = S.family.filter(f => f.id !== id); S._dr = null;
  if (S.intake.who === id) S.intake.who = 'me';
  TP.emit('state');
  await TP.closeSheet({ instant: true });
  if (TP.canBack()) await TP.back(); else await TP.go('family', { via: 'fade', root: true });
  TP.notify('ลบสมาชิกแล้ว', { icon: 'trash' });
});

/* =====================================================================
   My health record
   ===================================================================== */
const CONDS = ['ความดันโลหิตสูง', 'เบาหวาน', 'ไขมันในเลือดสูง', 'หอบหืด', 'โรคหัวใจ', 'โรคไต', 'โรคตับ', 'ตั้งครรภ์ หรือให้นมบุตร'];
function hdDraft(S, ctx) {
  if (!ctx.params._k) ctx.params._k = newKey();
  if (S._dr && S._dr._k === ctx.params._k) return S._dr;
  const u = S.user;
  return S._dr = { _k: ctx.params._k, form: 'health', allergies: [...(u.allergies || [])], algSrc: u.allergySrc || '', algPh: [...(u.allergies || [])], allergyState: u.allergyState || 'unknown', meds: [...(u.meds || [])], weight: u.weight ?? '', conds: [...(u.conditions ?? ['ความดันโลหิตสูง'])], condNone: !!u.condNone, food: u.food || '', foodNone: !!u.foodNone, algIn: '', errors: {} };
}
TP.screen('health', {
  group: 'account', title: 'ข้อมูลสุขภาพของฉัน', code: 'C505', ref: 'A11', parent: 'account',
  states: [['normal', 'มีข้อมูล'], ['unknown', 'ยังไม่ระบุ'], ['sfx', 'มีผลข้างเคียงที่เคยมี']],
  notes: ['19/10 ยาที่ใช้ประจำพิมพ์ช่องละ 1 ตัว แบบเดียวกับ C503', 'ใช้เติมจอแจ้งอาการให้อัตโนมัติ ไม่ต้องกรอกซ้ำ', 'A11: ไม่บังคับ · "ยังไม่ได้ระบุ" ไม่เท่ากับ "ไม่แพ้"', 'A21: เภสัชกรเห็นและแก้ได้เฉพาะในเคสที่คุณยินยอม มีบันทึก', '20/10 ตามคอนโซลรอบ 5: เพิ่มแพ้อาหาร (เภสัชกรเห็นคู่กับแพ้ยา ยาประจำ และโรคประจำตัว) · พิมพ์เองหรือติ๊ก ไม่แพ้อาหาร',
    'เจ้าของ 20/10 ข้อ 74 "แพ้ยากับผลข้างเคียงมันไม่เหมือนกันนะ": แยกเป็น 2 กลุ่ม แพ้ยา กับ ผลข้างเคียงที่เคยมี (C505.3) มีหัวข้อและไอคอนกำกับ ไม่ใช้สีอย่างเดียว · ผลข้างเคียงเภสัชกรเป็นคนบันทึก ลูกค้าดูได้ แก้เองไม่ได้ ไม่ห้ามใช้ยา · ไม่แสดงคะแนน Naranjo ให้ลูกค้า · ตรงกับคอนโซล S401.13',
    'เจ้าของเคาะ 20/10: อยู่ใต้ความยินยอมเดิม เพิ่มในข้อความแล้ว · แพ้อาหารและโรคประจำตัวเป็นหัวข้อในความยินยอมเว็บเดิมอยู่แล้ว ข้อความยินยอมในแอป (C104 C105 C507) เขียนชื่อไว้ครบ · บัญชีเดียวกับเว็บ แก้ที่ไหนก็เห็นตรงกัน'],
  prep(S) {
    const st = S.st.health; if (!st) return;
    const f = TP.fresh().user;
    S.user.sfx = st === 'sfx' ? [SFX_CPM] : [];
    if (st === 'unknown') Object.assign(S.user, { allergies: [], allergyState: 'unknown', meds: [], weight: '', conditions: [], condNone: false, food: '', foodNone: false });
    else Object.assign(S.user, { allergies: f.allergies, allergyState: f.allergyState, meds: f.meds, weight: f.weight, conditions: ['ความดันโลหิตสูง'], condNone: false, food: '', foodNone: true });
    const c = TP.cur(); if (c?.id === 'health') delete c.params._k;
  },
  render(ctx) {
    const S = ctx.S, d = hdDraft(S, ctx), e = d.errors || {};
    return ui.nav({ back: backL('account'), title: 'ข้อมูลสุขภาพของฉัน' }) + ui.page(`
      <section class="card af-card" data-in="1"><h3 class="af-h">${ic('octagon-alert', 17, 2)}<span>แพ้ยา</span></h3>${algEditor(d)}</section>
      ${sfxCard(S.user.sfx)}
      <section class="card af-card" data-in="2"><h3 class="af-h">ยาที่ใช้ประจำ</h3>${medsEditor(d)}</section>
      <section class="card af-card" data-in="3"><h3 class="af-h">น้ำหนัก</h3>
        ${ui.field({ id: 'afHdW', label: 'น้ำหนัก (กก.)', optional: true, value: d.weight === '' ? '' : String(d.weight), inputmode: 'decimal', placeholder: 'เช่น 58', bind: '_dr.weight', error: e.weight, hint: 'ใช้ประกอบการคำนวณขนาดยาบางชนิด', max: 5 })}</section>
      <section class="card af-card" data-in="4"><h3 class="af-h">โรคประจำตัว <span class="af-hint">รวมการตั้งครรภ์หรือให้นมบุตร</span></h3>
        ${ui.chips('afCond', CONDS, d.conds, { a: 'afCond', label: 'โรคประจำตัว' })}
        ${ui.check('ไม่มีโรคประจำตัว', { on: d.condNone, a: 'afCondNone', id: 'afCondNone' })}</section>
      ${foodCard(d, 5)}
      <div class="mt16" data-in="6">${ui.note('ใช้เติมหน้าแจ้งอาการให้อัตโนมัติ เภสัชกรเห็นข้อมูลนี้เฉพาะในการปรึกษาที่คุณยินยอม และแก้ไขให้ได้ในเคสนั้นเท่านั้น', { icon: 'lock' })}</div>`,
      { lt: 'ข้อมูลสุขภาพของฉัน', sub: 'กรอกครั้งเดียว ไม่ต้องกรอกซ้ำทุกครั้งที่ปรึกษา' }) +
      ui.dock(ui.btn('บันทึก', { a: 'afHdSave', id: 'afHdSave' }));
  },
  mount(el) { wireEnter(el); }
});
TP.act('afCond', () => {
  const d = TP.S._dr, el = curEl(); if (!d || !el) return;
  d.conds = ui.chipVals(el, 'afCond');
  if (d.conds.length && d.condNone) { d.condNone = false; $('#afCondNone', el)?.setAttribute('aria-checked', 'false'); }
});
TP.act('afCondNone', t => {
  const d = TP.S._dr, el = curEl(); if (!d || !el) return;
  d.condNone = t.getAttribute('aria-checked') === 'true';
  if (d.condNone) { d.conds = []; $$('[data-chips="afCond"] .chip', el).forEach(c => c.setAttribute('aria-pressed', 'false')); }
});
TP.act('afFoodLive', () => { const d = TP.S._dr, el = curEl(); if (!d || !el) return; if (String(d.food || '').trim() && d.foodNone) { d.foodNone = false; $('#afFoodNone', el)?.setAttribute('aria-checked', 'false'); } });
TP.act('afFoodNone', t => { const d = TP.S._dr, el = curEl(); if (!d || !el) return; d.foodNone = t.getAttribute('aria-checked') === 'true'; if (d.foodNone) { d.food = ''; const i = $('#afFood', el); if (i) i.value = ''; } });
TP.act('afHdSave', async t => {
  const S = TP.S, d = S._dr; if (!d || d.form !== 'health') return;
  keepTypedAlg(d);
  const w = String(d.weight ?? '').trim();
  d.errors = w && (!/^\d{1,3}(\.\d)?$/.test(w) || +w <= 0 || +w > 250) ? { weight: 'กรอกเป็นตัวเลข เช่น 58' } : {};
  if (d.errors.weight) { await TP.refresh({ anim: false }); const f = $('.field.err', curEl()); f?.scrollIntoView({ block: 'center', behavior: RM() ? 'auto' : 'smooth' }); setTimeout(() => shake(f), RM() ? 0 : 280); TP.live(d.errors.weight); return; }
  t.classList.add('busy'); await TP.wait(RM() ? 50 : 600);
  Object.assign(S.user, { allergies: [...d.allergies], allergyState: d.allergies.length ? 'set' : d.allergyState, meds: cleanMeds(d.meds), weight: w === '' ? '' : +w, conditions: [...d.conds], condNone: d.condNone, food: foodOf(d), foodNone: d.foodNone });
  S._dr = null; TP.emit('state');
  if (TP.canBack()) await TP.back(); else t.classList.remove('busy');
  TP.notify('บันทึกข้อมูลสุขภาพแล้ว');
});

/* =====================================================================
   Consents (A6)
   ===================================================================== */
const CLOG_BASE = () => [{ v: 3, act: 'ยินยอม', at: '18/10/2026 09:02' }, { v: 2, act: 'ยินยอม', at: '11/08/2026 18:20' }];
/* the log follows S.consent even when another screen (consent / noconsent) changed it */
const clog = S => {
  const L = S._clog || (S._clog = CLOG_BASE()), okTop = L[0]?.act === 'ยินยอม';
  if (!!S.consent !== okTop) L.unshift({ v: S.consentVer, act: S.consent ? 'ยินยอม' : 'ถอนความยินยอม', at: `${TP.NOW.date} ${TP.NOW.time}` });
  return L;
};
TP.screen('consents',{
 group:'account',title:'ความยินยอม',code:'C506',parent:'account',
 states:[['normal','อ่านเอกสารความยินยอม'],['withdrawn','อ่านเอกสารหลังถอน'],['reconsent','อ่านเอกสารฉบับปัจจุบัน'],['join','อ่านเอกสารจากการปรึกษา'],['unchecked','อ่านอย่างเดียว ไม่มีช่องติ๊ก']],
 notes:['เปิดอ่านรายละเอียดเอกสารเดียวกับตอนสมัครทันที','ไม่มีปุ่มยินยอม ไม่ยินยอม ถอน หรือช่องติ๊กบนหน้าอ่าน','การเปิดอ่านไม่เปลี่ยนบันทึกความยินยอม','สวิตช์ข่าวสารและสิทธิพิเศษอยู่ในหน้าบัญชี'],
 render(){return ui.nav({back:backL('account'),title:'ความยินยอม'})+ui.page(TP.registrationConsentDocument());}
});
TP.act('afMkt',t=>{TP.S.marketing=t.getAttribute('aria-checked')==='true';TP.emit('state');TP.refresh({anim:false});});
TP.sheetDef('consenttext',{group:'account',title:'ข้อความความยินยอม',code:'C507',host:'consents',tall:true,notes:['เอกสารเดียวกับตอนสมัคร รวมข้อมูลติดต่อสาขาไว้ท้ายเอกสาร','อ่านอย่างเดียว ไม่ยินยอมให้อัตโนมัติ'],render:()=>TP.registrationConsentDocument(),foot:()=>ui.btn('ปิด',{kind:'secondary',closeSheet:true})});
TP.sheetDef('consentwd', {
  group: 'account', title: 'ถอนความยินยอม', code: 'C508', ref: 'A6', host: 'consents',
  notes: ['เจ้าของ 19/10/2026: ต้องยินยอมเท่านั้น ถอนแล้วใช้แอปไม่ได้ ไปจอ C106 ทันที', 'บอกผลก่อน แล้วค่อยให้ยืนยัน (ติ๊กว่าเข้าใจ ปุ่มถึงกดได้)', 'บันทึกที่ อย. กำหนดยังเก็บต่อจนครบ 1 ปีนับจากวันปิดเคส'],
  render: () => `<p class="body">ก่อนถอน โปรดอ่านผลที่จะเกิดขึ้น</p>
    <ul class="af-cq">
      <li><span class="af-cq-i">${ic('ban', 18, 2)}</span><div><b>ใช้แอปไม่ได้จนกว่าจะยินยอมอีกครั้ง</b><span>ทุกส่วนของแอป · ยังโทรหาร้านได้ตามปกติ</span></div></li>
      <li><span class="af-cq-i">${ic('lock', 18, 2)}</span><div><b>ข้อมูลบางส่วนอาจต้องเก็บต่อเมื่อมีฐานกฎหมายรองรับ</b><span>ระยะเวลาและเกณฑ์เก็บรักษาเป็นไปตามประกาศความเป็นส่วนตัวที่ต้องยืนยันก่อนใช้จริง</span></div></li>
      <li><span class="af-cq-i">${ic('rotate-ccw', 18, 2)}</span><div><b>ยินยอมอีกครั้งได้ทุกเมื่อ</b><span>กดได้จากหน้าที่ขึ้นหลังถอน หรือเมื่อเปิดแอปครั้งถัดไป</span></div></li>
    </ul>
    ${ui.check('ฉันเข้าใจผลของการถอนความยินยอม', { a: 'afWdCk', id: 'afWdCk' })}`,
  foot: () => ui.btn('ถอนความยินยอม', { kind: 'danger', a: 'afWithdraw', disabled: true, id: 'afWdGo' }) + ui.btn('ยกเลิก', { kind: 'ghost', closeSheet: true })
});
TP.act('afWdCk', t => { const go = $('#afWdGo', $('#sheet')); if (go) go.disabled = t.getAttribute('aria-checked') !== 'true'; });
TP.act('afWithdraw', async t => {
  const S = TP.S; t.classList.add('busy'); await TP.wait(RM() ? 50 : 600);
  S.consent = false; S._careConsentChoice=null; clog(S);
  S.st.consents = 'withdrawn'; S.st.noconsent = 'withdrawn'; TP.emit('state');
  await TP.closeSheet({ instant: true });
  /* owner 19/10/2026: no consent = no app use, so withdrawing leaves the app straight away */
  TP.go('noconsent', { via: 'fade', root: true, params: { wd: true } });
});

/* =====================================================================
   Delete account (N3) + deleted
   ===================================================================== */
TP.screen('deleteacc', {
  group: 'account', title: 'ลบบัญชี', code: 'C511', ref: 'N3', parent: 'account',
  states: [['normal', 'ลบได้'], ['blocked', 'มีการปรึกษาค้าง'], ['unpaid', 'มีรายการรอชำระ']],
  notes: ['Apple และ Google บังคับให้ลบบัญชีได้ในแอป', 'A5: ข้อมูลระบุตัวตนลบ/ปิด ยกเว้นบันทึกที่ อย. บังคับเก็บ 1 ปีนับจากวันปิดเคส · การตลาดเก็บแบบไม่ระบุตัวตน', 'มีการปรึกษาค้างหรือรายการรอชำระ = ลบไม่ได้ บอกเหตุผล + ทางไปต่อ', 'ยืนยันด้วยการพิมพ์คำว่า ลบบัญชี กันกดพลาด', 'บัญชีเดียวกับเว็บ ลบแล้วเข้าเว็บด้วยบัญชีนี้ไม่ได้ด้วย'],
  wait: ['ระยะเวลาลบจริงหลังกดยืนยัน (ทันที หรือภายในกี่วัน)', 'ใบเสร็จและเอกสารภาษีเก็บต่อนานเท่าไร (ฝ่ายบัญชี/กฎหมาย)'],
  prep(S) {
    const st = S.st.deleteacc; if (!st) return;
    S._delTxt = '';
    if (st === 'blocked') { if (!caseOpen() && TP.newCase) TP.newCase(); }
    else if (st === 'unpaid') { const c = closedCase(); c.order.status = 'pending'; c.order.expires = '16:20'; S.case = c; }
    else if (S.case) S.case = null;
    TP.emit('state');
  },
  render(ctx) {
    const S = ctx.S, open = caseOpen(), unpaid = !open && S.case?.order?.status === 'pending', block = open || unpaid;
    const last = allHistory(S)[0], ok = !block && String(S._delTxt || '').trim() === 'ลบบัญชี';
    const blockNote = open
      ? ui.note(`<b>ยังลบบัญชีไม่ได้</b><br>มีการปรึกษาที่ยังไม่จบ จบการปรึกษาหรือออกจากคิวก่อน แล้วกลับมาลบได้<div class="mt8">${ui.btn('ไปที่การปรึกษา', { kind: 'secondary', sm: true, go: ['matched', 'room'].includes(S.case.status) ? 'room' : 'queue', via: 'cover' })}</div>`, { tone: 'warn', icon: 'octagon-alert' })
      : ui.note(`<b>ยังลบบัญชีไม่ได้</b><br>มีรายการยารอชำระถึง ${esc(S.case?.order?.expires || '16:20')} ชำระเงินหรือรอให้รายการหมดอายุก่อน แล้วกลับมาลบได้<div class="mt8">${ui.btn('ดูรายการรอชำระ', { kind: 'secondary', sm: true, go: 'room', via: 'cover' })}</div>`, { tone: 'warn', icon: 'octagon-alert' });
    return ui.nav({ back: backL('account'), title: 'ลบบัญชี' }) + ui.page(`
      <div class="af-del-top" data-in="1"><span class="af-del-i">${ic('trash', 24, 1.9)}</span><p class="body">ลบได้ที่นี่ทันที บัญชีนี้ใช้ร่วมกับเว็บ mitraree.com ลบแล้วจะเข้าแอปและเว็บด้วยบัญชีนี้ไม่ได้อีก</p></div>
      ${block ? `<div class="mt16" data-in="1">${blockNote}</div>` : ''}
      <h3 class="group-h">สิ่งที่ลบ</h3>
      <div class="card af-lc" data-in="2"><ul class="af-bl">
        <li>${ic('user', 18, 2)}<span>ชื่อ เบอร์โทร ที่อยู่ และการเข้าสู่ระบบ</span></li>
        <li>${ic('users', 18, 2)}<span>แพ้ยา แพ้อาหาร ยาประจำ โรคประจำตัว และข้อมูลสุขภาพของคุณ</span></li>
        <li>${ic('bell', 18, 2)}<span>การตั้งค่า การแจ้งเตือน และ Face ID บนเครื่องนี้</span></li></ul></div>
      <h3 class="group-h">สิ่งที่เก็บต่อตามกฎหมาย</h3>
      <div class="card af-lc" data-in="3"><ul class="af-bl">
        <li>${ic('file-text', 18, 2)}<span>บันทึกการปรึกษา ใบสรุป และบันทึกการจ่ายยา เก็บจนครบ 1 ปีนับจากวันปิดเคส ตามที่ อย. กำหนด แล้วจึงลบ${last ? ` <b>(ล่าสุดถึง ${plusYear(last.date)})</b>` : ''}</span></li>
        <li>${ic('sliders', 18, 2)}<span>ข้อมูลการตลาด เก็บเฉพาะแบบไม่ระบุตัวตน</span></li></ul></div>
      <section class="af-confirm${block ? ' off' : ''}" data-in="4" ${block ? 'inert' : ''}>
        ${ui.field({ id: 'afDelTxt', label: 'พิมพ์คำว่า ลบบัญชี เพื่อยืนยัน', value: S._delTxt || '', placeholder: 'ลบบัญชี', bind: '_delTxt', a: 'afDelType', autocomplete: 'off', max: 20 })}
      </section>
      <p class="group-f">มีคำถามเรื่องข้อมูลส่วนบุคคล ติดต่อ ${dpoLink()}</p>`, { lt: 'ลบบัญชี' }) +
      ui.dock(ui.btn('ลบบัญชีถาวร', { kind: 'danger', a: 'afDelGo', id: 'afDelGo', disabled: !ok }) + ui.btn('ยกเลิก', { kind: 'ghost', back: true }), { note: block ? 'ทำรายการที่ค้างให้เสร็จก่อน' : ok ? '' : '<span id="afDelNote">พิมพ์คำว่า ลบบัญชี ในช่องด้านบนก่อน ปุ่มจึงจะกดได้</span>' });
  }
});
TP.act('afEditProf', () => {
  const u = TP.S.user, [first, ...rest] = String(u.full || u.name || '').trim().split(/\s+/);
  TP.S._pf = { first: u.name || first || '', last: u.last || rest.join(' '), year: String(u.born || u.birthYear || ''), sex: u.sex || 'none' };
  TP.go('profile', { params: { edit: 1 } });
});
TP.act('afDelType', () => {
  const el = curEl(), go = $('#afDelGo', el); if (!go) return;
  const block = caseOpen() || TP.S.case?.order?.status === 'pending';
  go.disabled = block || String(TP.S._delTxt || '').trim() !== 'ลบบัญชี';
  const n = $('#afDelNote', el); if (n) n.closest('.dock-note').hidden = !go.disabled;
});
TP.act('afDelGo', async t => {
  const S = TP.S; if (String(S._delTxt || '').trim() !== 'ลบบัญชี') return;
  t.classList.add('busy'); await TP.wait(RM() ? 50 : 900);
  Object.assign(S, { loggedIn: false, consent: false, history: [], family: [], inbox: [], case: null, faceId: false, notif: false, marketing: false, _delTxt: '', _dr: null, _adr: null, _adrSent: null, _adrDrafts: {}, adrReports: [], _clog: [], addrs: [], follow: null, _gone: true });
  TP.freshAccount?.(S); TP.blankUser?.(S, String(S.user.phone).replace(/\D/g, ''));
  TP.emit('state');
  TP.go('deleted', { via: 'fade', root: true });
});
TP.screen('deleted', {
  group: 'account', title: 'ลบบัญชีแล้ว', code: 'C512', ref: 'N3',
  notes: ['ยืนยันแบบสงบ บอกสิ่งที่เกิดต่อจากนี้', 'สอบถามเรื่องข้อมูลส่วนบุคคล dpo@mitraree.com', 'ปุ่มกลับไปหน้าเข้าสู่ระบบ (ล้างประวัติการย้อนกลับ)'],
  render: () => ui.page(`<div class="fill af-done">
      <div class="af-done-c" data-in="0">${brand.halo(112, { check: true, draw: true, still: true })}<h2 class="h2">ลบบัญชีแล้ว</h2><p class="body">ขอบคุณที่ใช้บริการมิตรอารี</p></div>
      <div class="card" data-in="1"><h3 class="h3">ต่อจากนี้</h3><ul class="af-bl mt8">
        <li>${ic('circle-check', 18, 2)}<span>ข้อมูลที่ระบุตัวคุณถูกลบหรือปิดแล้ว และออกจากระบบบนเครื่องนี้</span></li>
        <li>${ic('file-text', 18, 2)}<span>บันทึกการปรึกษาที่ อย. กำหนด เก็บจนครบ 1 ปีนับจากวันปิดเคส แล้วจึงลบ</span></li>
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
  ['มีอาการผิดปกติหลังใช้ยา ทำอย่างไร', 'แจ้งในแอปที่ "แจ้งอาการหลังใช้ยา" เภสัชกรจะติดต่อกลับเพื่อประเมิน ถ้าหายใจลำบาก ปากหรือหน้าบวม ไปโรงพยาบาลทันที']
];
TP.screen('help', {
  group: 'account', title: 'ช่วยเหลือ', code: 'C509', parent: 'account',
  states: [['open', 'ในเวลาทำการ'], ['closed', 'นอกเวลาทำการ']],
  notes: ['ฝ่ายบริการลูกค้า 10:00-18:00 ติดป้ายแยกจากเวลาร้าน 09:00-21:00', 'คำถามที่พบบ่อย 5 ข้อ แตะเพื่อเปิด', 'เรื่องข้อมูลส่วนบุคคล dpo@mitraree.com'],
  render(ctx) {
    const closed = ctx.state === 'closed';
    return ui.nav({ back: backL('account'), title: 'ช่วยเหลือ' }) + ui.page(`
      <div class="card af-cc" data-in="1">
        <div class="af-cc-h"><span class="af-cc-i">${ic('headset', 24, 1.8)}</span><div class="grow"><b>ฝ่ายบริการลูกค้า</b><span>บัญชี การชำระเงิน และการจัดส่ง</span></div>${closed ? ui.tag('ปิดอยู่', 'muted', { dot: true }) : ui.status('ok', 'เปิดอยู่')}</div>
        <a class="btn ${closed ? 'secondary' : 'primary'} mt16" href="tel:${CS_TEL.replace(/-/g, '')}" data-a="afCall" data-v="${CS_TEL}">${ic('phone', 20, 2)}<span>โทร ${CS_TEL}</span></a>
        ${closed ? '<p class="small mt8">เปิดอีกครั้ง 10:00 · เรื่องยาและอาการ ปรึกษาเภสัชกรในแอปได้ถึง 21:00</p>' : ''}
      </div>
      <div class="card af-hours" data-in="2">${ui.kv([['ฝ่ายบริการลูกค้า', 'ทุกวัน 10:00-18:00'], ['ร้านและเภสัชกรในแอป', 'ทุกวัน 09:00-21:00']])}<p class="small mt8">เวลาเภสัชกรเป็นไปตามเวลาเปิดของแต่ละสาขา</p></div>
      <h3 class="group-h">คำถามที่พบบ่อย</h3>
      <div class="group af-faq" data-in="3">${FAQ.map(([q, a], i) => `<div class="af-faq-i"><h4><button type="button" class="af-faq-q" id="afFaqQ${i}" aria-expanded="false" aria-controls="afFaq${i}" data-a="afFaq"><span>${esc(q)}</span>${ic('chevron-down', 18, 2.2)}</button></h4>${rvHtml('afFaq' + i, false, `<p class="af-faq-a">${esc(a)}</p>`)}</div>`).join('')}</div>
      <div class="card af-dpo" data-in="4"><span class="af-cs-i">${ic('shield-check', 20, 1.9)}</span><div class="grow"><b>เรื่องข้อมูลส่วนบุคคล</b><span>เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล</span>${dpoLink()}</div></div>
      `, { lt: 'ช่วยเหลือ' });
  }
});
TP.act('afFaq', t => {
  const on = t.getAttribute('aria-expanded') !== 'true';
  t.setAttribute('aria-expanded', String(on));
  rv(document.getElementById(t.getAttribute('aria-controls')), on);
});
})();

/* ===== 72-follow.js ===== */
/* =====================================================================
   72 · Follow-up after a consult where medicine was bought.
        ทำใหม่ 19/10/2026 ตามเจ้าของ: แอปเตือนกินยา + แตะ "กินแล้ว" ครั้งเดียวต่อมื้อ ·
        เภสัชกรถามอาการแค่กลางคอร์สและตอนครบคอร์ส (ตอบแตะเดียว แบบการ์ด LINE ของ LMA)
        follow C405 · fucheck C406 · furesult C407 · fulog C408 · fudone C409 ·
        sheets fureminder C410, fuoff C411. Mock state: TP.S.follow (one plan, or null).
        Hooks other files call: TP.followHomeCard(S, {din}) · TP.followSumCard(h) ·
        TP.followHistRow(h) · TP.FOLLOW_LOCK. Plain lucide icons, no "+" texture here.
        20/10/2026 item 82 (owner "ใช่ทำได้"): a consult with no medicine can be followed too:
        one question at 19:00, tomorrow or in 3 days (the pharmacist picks on S305), no reminders (plan.sym).
   ===================================================================== */
(() => {
const { $, $$, esc, ic, ui, A, E, SP } = TP;

/* lucide icons only this module uses (added when missing, 00-core untouched) */
const MORE = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  sunrise: '<path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
  sunset: '<path d="M12 10V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
  meh: '<circle cx="12" cy="12" r="10"/><line x1="8" x2="16" y1="15" y2="15"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
  frown: '<circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
  'alarm-clock': '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/>',
  'calendar-check': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  'bell-ring': '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M22 8c0-2.3-.8-4.3-2-6"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/><path d="M4 2C2.8 3.7 2 5.7 2 8"/>',
  check: '<path d="M20 6 9 17l-5-5"/>'
};
Object.entries(MORE).forEach(([k, v]) => { if (!TP.PATH[k]) TP.PATH[k] = v; });

const SLOTS = ['m', 'n', 'e', 'b'];
const SLOT = { m: ['เช้า', 'sunrise'], n: ['กลางวัน', 'sun'], e: ['เย็น', 'sunset'], b: ['ก่อนนอน', 'moon'] };
/* one tap answers, like the LMA LINE card (ดีขึ้น / ยังไม่หาย / แย่ลง answered inside the card) + one danger row */
const ANS = {
  better: ['ดีขึ้น', 'smile', 'อาการเบาลง'],
  same: ['เหมือนเดิม', 'meh', 'ยังไม่ต่างจากเดิม'],
  worse: ['แย่ลง', 'frown', 'อาการมากขึ้น หรือมีอาการใหม่'],
  danger: ['มีอาการรุนแรง', 'octagon-alert', 'หายใจลำบาก เจ็บแน่นหน้าอก ปาก หน้า หรือตาบวม ผื่นลามเป็นตุ่มน้ำ']
};
const END = { healed: ['หายดีแล้ว', 'smile', 'ไม่มีอาการแล้ว'], still: ['ยังมีอาการ', 'meh', 'ยังไม่หาย หรือกลับมาเป็นอีก'] };
/* answer label + tag tone (text always, never colour alone) */
const MOOD = { better: ['ดีขึ้น', 'ok'], same: ['เหมือนเดิม', 'muted'], worse: ['แย่ลง', 'warn'], danger: ['มีอาการรุนแรง', 'danger'], healed: ['หายดีแล้ว', 'ok'], still: ['ยังมีอาการ', 'warn'] };
const AT = { mid: 'กลางคอร์ส', end: 'หลังครบคอร์ส', self: 'บอกเอง', once: 'ถามอาการหลังปรึกษา' };
/* generic wording, the pharmacist must confirm it (some medicines need their own rule) */
const MISSED = 'ลืมกิน ให้กินทันทีที่นึกได้ ถ้าใกล้มื้อถัดไปให้ข้ามไป ห้ามกินเพิ่มเป็น 2 เท่า';
const HOURS = '09:00-21:00';
/* owner 19/10/2026: "worse" answers get a call back within 2 hours in opening hours (closed: counted from 09:00, by 11:00) */
const BACK = `ภายใน 2 ชั่วโมง ในเวลาทำการ ${HOURS}`;

/* ---------- small helpers ---------- */
const RM = () => TP.RED();
const curEl = () => TP.cur()?.el;
const pad = n => String(n).padStart(2, '0');
const toD = s => { const [d, m, y] = String(s).split('/').map(Number); return new Date(y, m - 1, d); };
const addD = (s, n) => { const d = toD(s); d.setDate(d.getDate() + n); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };
const toM = t => { const [a, b] = String(t).split(':').map(Number); return a * 60 + b; };
const addH = (t, h) => { const m = toM(t) + h * 60; return m >= 1440 ? '' : `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };
/* the follow module's own mock clock: the reminder simulation moves it to the dose time (TP.NOW stays 14:12) */
const now = () => TP.S.follow?.clock || TP.NOW.time;
const firstN = n => String(n || '').trim().split(/\s+/)[0];
const fam = id => (id && id !== 'me' ? TP.S.family.find(f => f.id === id) : null);
const ph = p => TP.PHARM[p.src.pharm] || TP.PHARM.kj;
const shake = el => el && A(el, [{ transform: 'none' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-4px)' }, { transform: 'none' }], { d: 420, e: E.apple });
const pop = el => el && A(el, [{ transform: 'scale(.85)' }, { transform: 'none' }], { d: SP.spring.d, e: SP.spring.e });
const rvHtml = (id, on, inner) => `<div class="fu-rv${on ? ' open' : ''}" id="${id}" ${on ? '' : 'inert'}><div><div class="fu-rv-in">${inner}</div></div></div>`;
const rv = (el, on) => { if (!el) return; el.classList.toggle('open', !!on); el.toggleAttribute('inert', !on); };
const emArt = n => ui.emptyArt(n);
const BACK_L = { home: 'หน้าแรก', history: 'ประวัติ', summary: 'ใบสรุป', inbox: 'แจ้งเตือน', follow: 'ติดตามยา', fulog: 'บันทึก' };
const backL = fb => { const id = TP.hist?.[TP.hist.length - 1]?.id || fb; return id === 'follow' && TP.S.follow?.sym ? 'ติดตามอาการ' : BACK_L[id] || 'กลับ'; };
const moodTag = (k, pre = '') => ui.tag(pre + MOOD[k][0], MOOD[k][1]);

/* =====================================================================
   Plan model. log "day|slot|med" -> {t}; prn "day|med" -> [times];
   checks [{at: mid|end|self, day, date, time, mood}]
   ===================================================================== */
const SRC = { id: 'TC-261016-0058', date: '16/10/2026', time: '10:20', topic: 'ไข้ ไอ น้ำมูก', sym: ['ไข้', 'ไอ', 'น้ำมูก คัดจมูก'], branch: 'tw', pharm: 'kj', who: 'me', bought: 190 };
/* the summary for the mock consult, so its document matches the plan (registered only if missing) */
if (TP.SUMMARY && !TP.SUMMARY[SRC.id]) TP.SUMMARY[SRC.id] = {
  sym: 'ไข้ต่ำ ๆ ไอมีเสมหะ น้ำมูกใส เป็นมา 2 วัน · ไม่มีหอบเหนื่อย',
  advice: ['ดื่มน้ำอุ่นบ่อย ๆ พักผ่อนให้เพียงพอ', 'ยาแก้แพ้อาจทำให้ง่วง เลี่ยงการขับรถหลังกินยา', 'เภสัชกรจะถามอาการในแอปกลางคอร์ส และเมื่อครบคอร์ส'],
  meds: [
    { name: 'ยาแก้ไอ ชนิดน้ำ', qty: '1 ขวด', how: 'ครั้งละ 10 มล. วันละ 3 ครั้ง หลังอาหาร เช้า กลางวัน เย็น ใช้ 5 วัน' },
    { name: 'ยาแก้แพ้ ลดน้ำมูก', qty: '1 แผง', how: 'ครั้งละ 1 เม็ด ก่อนนอน ใช้ 5 วัน อาจทำให้ง่วง' },
    { name: 'พาราเซตามอล 500 มก.', qty: '1 แผง', how: 'ครั้งละ 1 เม็ด เมื่อมีไข้ ห่างกันอย่างน้อย 6 ชั่วโมง ไม่เกิน 4 ครั้งต่อวัน' }
  ],
  warn: ['หายใจลำบาก หรือเจ็บแน่นหน้าอก', 'ไข้สูงเกิน 39 องศา หรือไข้ไม่ลดภายใน 3 วัน', 'มีผื่นขึ้น ปาก หน้า หรือตาบวมหลังใช้ยา'],
  follow: 'แอปเตือนเวลากินยา และเภสัชกรจะถามอาการกลางคอร์สกับตอนครบคอร์ส ถ้าไม่ดีขึ้น ปรึกษาใหม่ได้ทุกเมื่อ'
};
/* the pharmacist picks on close (S305): ask only after the course ('end') or mid-course too ('both') · mid = that day, 0 = none */
function basePlan(src, meds, o = {}) {
  const days = o.days || 5;
  return { src: { ...src }, start: src.date, startAt: o.startAt || '', days, today: o.today || 1, on: true, end: '',
    remind: true, times: { m: '08:00', n: '12:30', e: '18:00', b: '21:30' }, askAt: '19:00', ask: o.ask === 'both' ? 'both' : 'end', mid: o.ask === 'both' ? Math.ceil(days / 2) : 0,
    meds, log: {}, prn: {}, checks: [], contact: null, offline: false, clock: '' };
}
/* mock: consult 16/10 10:20, today 18/10 14:12 = day 3 of 5 (mid-course question today), day 2 lunch was missed */
function mockPlan(st) {
  const p = basePlan(SRC, [
    { id: 'cough', name: 'ยาแก้ไอ ชนิดน้ำ', dose: 'ครั้งละ 10 มล.', slots: ['m', 'n', 'e'], meal: 'หลังอาหาร' },
    { id: 'allergy', name: 'ยาแก้แพ้ ลดน้ำมูก', dose: 'ครั้งละ 1 เม็ด', slots: ['b'], meal: '', tip: 'อาจทำให้ง่วง' },
    { id: 'para', name: 'พาราเซตามอล 500 มก.', dose: 'ครั้งละ 1 เม็ด', prn: 'เมื่อมีไข้', gap: 6, max: 4 }
  ], { today: 3, startAt: '10:30', ask: st === 'endonly' ? 'end' : 'both' });
  const take = (d, s, m, t) => { p.log[`${d}|${s}|${m}`] = { t }; };
  take(1, 'n', 'cough', '12:40'); take(1, 'e', 'cough', '18:20'); take(1, 'b', 'allergy', '21:40');
  take(2, 'm', 'cough', '08:10'); take(2, 'e', 'cough', '18:30'); take(2, 'b', 'allergy', '21:35');
  take(3, 'm', 'cough', '08:20'); if (st !== 'missed') take(3, 'n', 'cough', '12:45');
  Object.assign(p.prn, { '1|para': ['10:40', '17:00'], '2|para': ['08:00'], '3|para': ['07:50'] });
  return p;
}
/* item 82: no medicine given, the pharmacist (S305) picks one question at 19:00, tomorrow (d1) or in 3 days (d3).
   No medicine list, no reminders. today = days since the consult (0 = consult day); the question is due when today >= n */
function symPlan(src, ask, today = 0) {
  const n = ask === 'd3' ? 3 : 1;
  return { ...basePlan(src, [], { days: n }), sym: true, ask, n, today, remind: false };
}
const srcOf = c => ({ id: c.id, date: TP.NOW.date, time: c.joinedAt || TP.NOW.time, topic: (c.symptoms || []).join(' ') || 'ถามเรื่องยา', sym: [...(c.symptoms || [])], branch: c.branch || 'tw', pharm: c.pharm || 'kj', who: c.who || 'me', bought: 0 });
/* panel mocks: d3 = consulted this morning, asks in 3 days · d1 = consulted yesterday, asks today 19:00 */
const SYM_SRC = {
  d3: { id: 'TC-261018-0098', date: '18/10/2026', time: '10:40', topic: 'ปวดหัว', sym: ['ปวดหัว'], branch: 'tw', pharm: 'kj', who: 'me', bought: 0 },
  d1: { id: 'TC-261017-0063', date: '17/10/2026', time: '18:30', topic: 'ท้องเสีย', sym: ['ท้องเสีย'], branch: 'tw', pharm: 'kj', who: 'me', bought: 0 }
};
const SYM_IDS = Object.values(SYM_SRC).map(s => s.id);
const SYM_SUM = {
  'TC-261018-0098': { sym: 'ปวดศีรษะตื้อ ๆ ช่วงบ่าย นอนน้อย 2 คืน · ไม่มีไข้ ไม่อาเจียน', advice: ['นอนพักให้เพียงพอ ดื่มน้ำมาก ๆ', 'เลี่ยงการจ้องจอนาน ๆ และกาแฟช่วงเย็น', 'เภสัชกรแนะนำให้ดูอาการก่อน ยังไม่ต้องใช้ยา'],
    warn: ['ปวดศีรษะรุนแรงทันที หรือปวดมากที่สุดเท่าที่เคยเป็น', 'แขนขาอ่อนแรง พูดไม่ชัด หรือตามัว', 'ไข้สูงร่วมกับคอแข็ง'], follow: 'เภสัชกรจะถามอาการในแอปอีก 3 วัน ถ้าแย่ลงก่อนนั้น ปรึกษาใหม่ได้ทุกเมื่อ' },
  'TC-261017-0063': { sym: 'ถ่ายเหลว 2 ครั้งตั้งแต่เช้า ยังกินได้ · ไม่มีไข้ ไม่มีเลือดปน', advice: ['จิบน้ำเกลือแร่บ่อย ๆ ครั้งละน้อย', 'กินอาหารอ่อน ย่อยง่าย เลี่ยงของมัน', 'เภสัชกรแนะนำให้ดูอาการก่อน ยังไม่ต้องใช้ยา'],
    warn: ['ถ่ายเป็นน้ำบ่อยมาก หรือมีเลือดปน', 'ปากแห้ง ปัสสาวะน้อย อ่อนเพลียมาก', 'ไข้สูง หรือปวดท้องมาก'], follow: 'เภสัชกรจะถามอาการในแอปพรุ่งนี้ ถ้าแย่ลงก่อนนั้น ปรึกษาใหม่ได้ทุกเมื่อ' }
};
Object.entries(SYM_SUM).forEach(([id, s]) => { if (TP.SUMMARY && !TP.SUMMARY[id]) TP.SUMMARY[id] = { ...s, meds: [] }; });
function mockSym(st) {
  if (st === 'sym') return symPlan(SYM_SRC.d3, 'd3', 0);
  const p = symPlan(SYM_SRC.d1, 'd1', 1), said = (mood, time) => { p.checks.push({ at: 'once', day: 1, date: TP.NOW.date, time, mood }); p.end = mood; };
  if (st === 'symworse') said('worse', '13:40');
  if (st === 'symdone') said('better', '13:20');
  return p;
}
/* order items the pharmacist sold -> schedule (the real one comes from the pharmacist console) */
const KNOWN = {
  'ยาอมบรรเทาอาการเจ็บคอ': { dose: 'ครั้งละ 1 เม็ด', prn: 'เมื่อเจ็บคอ', gap: 3, max: 8 },
  'พาราเซตามอล 500 มก.': { dose: 'ครั้งละ 1 เม็ด', prn: 'เมื่อปวดหรือมีไข้', gap: 6, max: 4 },
  'สเปรย์พ่นคอ': { dose: 'พ่น 2 ครั้ง', slots: ['m', 'n', 'e'], meal: 'หลังอาหาร' }
};
const medFrom = (it, i) => { const k = KNOWN[it.name]; return k ? { id: 'm' + i, name: it.name, ...k } : { id: 'm' + i, name: it.name, info: it.how || 'ใช้ตามฉลาก' }; };
function dayOnePlan(c) {
  const items = c?.order?.items?.length ? c.order.items : TP.ORDER_ITEMS;
  const src = c ? { id: c.id, date: TP.NOW.date, time: c.joinedAt || TP.NOW.time, topic: (c.symptoms || []).join(' ') || 'ถามเรื่องยา', sym: [...(c.symptoms || [])], branch: c.branch || 'tw', pharm: c.pharm || 'kj', who: c.who || 'me' }
    : { id: 'TC-261018-0142', date: TP.NOW.date, time: TP.NOW.time, topic: 'ไข้ เจ็บคอ', sym: ['ไข้', 'เจ็บคอ'], branch: 'tw', pharm: 'kj', who: 'me' };
  const pl = basePlan(src, items.map(medFrom), { today: 1, startAt: TP.NOW.time, ask: c?.followAsk || 'end' });
  const recv = c?.order?.paid?.recv; if (recv && recv !== 'pickup') pl.waitRecv = recv;
  return pl;
}
/* the active plan; a newly closed + paid consult replaces it once (the pharmacist sets it on close) */
function F() {
  const S = TP.S, c = S.case;
  if (c && (!c.who||c.who==='me') && c.status === 'closed' && S._fuSeen !== c) {
    if (c.order?.status === 'paid' && c.order.items?.length) { S._fuSeen = c; S.follow = dayOnePlan(c); }
    /* no medicine: only when the pharmacist switched follow-up on at closing (S305 sends d1 or d3) */
    else if (c.followAsk === 'd1' || c.followAsk === 'd3') { S._fuSeen = c; S.follow = symPlan(srcOf(c), c.followAsk); }
  }
  if (S.follow === undefined) S.follow = S.firstTime || !S.user?.name ? null : mockPlan('normal');
  return S.follow?.src?.who && S.follow.src.who!=='me' ? null : S.follow;
}
const ensure = S => F() || (S.follow = mockPlan('normal'));
/* panel scenarios only: put the mock consult in history so summary + history links resolve */
function ensureSrc(S, src) {
  if (!(src.id === SRC.id || SYM_IDS.includes(src.id)) || !Array.isArray(S.history) || S.history.some(h => h.id === src.id)) return;
  S.history.unshift({ id: src.id, date: src.date, time: src.time, who: src.who, topic: src.topic, branch: src.branch, pharm: src.pharm, bought: src.bought || 0, rated: 0, summary: true });
}

/* ---------- derived status ---------- */
const dateOf = (p, day) => addD(p.start, day - 1);
const cday = p => Math.min(p.today, p.days);
const active = p => !!p && p.on && !p.end && p.today <= p.days;
const medsAt = (p, s) => p.meds.filter(m => m.slots?.includes(s));
const slotsOn = (p, day) => SLOTS.filter(s => medsAt(p, s).length && !(day === 1 && p.startAt && p.times[s] < p.startAt));
const lk = (day, s, m) => `${day}|${s}|${m.id}`;
/* a meal time is one tap: taken when every medicine of that time is ticked */
function slotState(p, day, s) {
  if (medsAt(p, s).every(m => p.log[lk(day, s, m)]?.t)) return 'taken';
  if (day < p.today) return 'missed';
  if (day > p.today) return 'future';
  const late = toM(now()) - toM(p.times[s]);
  return late < 0 ? 'due' : late < 60 ? 'now' : 'late';
}
const takenAt = (p, day, s) => medsAt(p, s).map(m => p.log[lk(day, s, m)]?.t).filter(Boolean).sort().pop() || '';
const daySlots = (p, day) => slotsOn(p, day).map(s => ({ s, st: slotState(p, day, s) }));
const hasSched = p => p.meds.some(m => m.slots);
/* the next meal time still to come: later today, else the first one of the coming days */
function upNext(p) {
  if (!active(p) || p.waitRecv) return null;
  const t = daySlots(p, p.today).find(x => x.st === 'due');
  if (t) return { day: p.today, s: t.s };
  for (let d = p.today + 1; d <= p.days; d++) { const f = slotsOn(p, d)[0]; if (f) return { day: d, s: f }; }
  return null;
}
const whenPre = (p, day) => (day === p.today ? '' : day === p.today + 1 ? 'พรุ่งนี้ ' : `วันที่ ${day} `);
const chk = (p, at) => p?.checks.filter(c => c.at === at).pop();
const midDue = p => active(p) && !p.waitRecv && !!p.mid && p.today >= p.mid && !chk(p, 'mid');
const endDue = p => !!p && !p.sym && p.on && !p.end && p.today > p.days;
const lastCheck = p => p?.checks[p.checks.length - 1];
const isBad = c => !!c && (c.mood === 'worse' || c.mood === 'danger');
/* a "worse" answer stays on top of C405 the day it was sent */
const recentBad = p => { const c = lastCheck(p); return isBad(c) && !c.talked && c.day === (p.sym ? p.today : cday(p)) ? c : null; };
/* item 58 (owner 20/10): the pharmacist talked about this report in a new consult and ticked it at close (S305) */
const recentTalked = p => { const c = lastCheck(p); return isBad(c) && c.talked && c.day === (p.sym ? p.today : cday(p)) ? c : null; };
const kindOf = c => (c.mood === 'danger' ? 'danger' : c.mood === 'worse' ? (TP.S.storeOpen ? 'worse' : 'closed') : c.mood);
const inHist = (S, id) => S.history.some(h => h.id === id) || (S.case?.status === 'closed' && S.case.id === id);
/* no-medicine plan (item 82): waiting for its one question / the question is due */
const symDate = p => addD(p.start, p.n);
const symWait = p => !!p?.sym && p.on && !p.end;
const symDue = p => symWait(p) && p.today >= p.n;
const symWhen = p => (p.today >= p.n ? 'วันนี้' : p.n - p.today === 1 ? 'พรุ่งนี้' : `อีก ${p.n - p.today} วัน`);
const symGo = p => (symDue(p) && !recentBad(p) ? 'fucheck' : 'follow');
/* the call back after "worse" as a clock time (real-user 20/10: "within 2 hours" left people unsure when to give up waiting) */
/* console round 5: the pharmacist calls from the shop phone, show that number so the call is picked up */
const telLine = (p, cls = '') => { const t = TP.branch(p?.src?.branch)?.phone; return t ? `<p class="fu-tel${cls}">${ic('phone', 14, 2)}<span>ร้านโทรจากเบอร์ <b class="num nowrap">${esc(t)}</b></span></p>` : ''; };
/* item 72 (owner 20/10 "ให้กรอบเวลามันเป็นไปได้จริงหน่อยกับเวลาเปิดปิดร้าน"): the 2 hours count only while the store is open.
   13:40 -> 15:40 · 20:15 -> 45 minutes today, the rest from 09:00 tomorrow = 10:15 พรุ่งนี้ · reported while closed -> 11:00 */
const OPEN_M = 540, SHUT_M = 1260, hm = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const backAt = c => { const m = toM(c.time); if (m < OPEN_M) return { t: '11:00', day: '' }; if (m >= SHUT_M) return { t: '11:00', day: 'พรุ่งนี้' }; const left = SHUT_M - m; return left >= 120 ? { t: hm(m + 120), day: '' } : { t: hm(OPEN_M + 120 - left), day: 'พรุ่งนี้' }; };
const backBy = c => { const b = backAt(c); return b.day ? `${b.t} ${b.day}` : b.t; };
const backLate = c => !!backAt(c).day && toM(c.time) < SHUT_M;
const backTxt = c => (!TP.S.storeOpen ? 'ร้านเปิด 09:00 จะติดต่อกลับภายใน 11:00' : backBy(c) ? `ร้านจะติดต่อกลับก่อน ${backBy(c)}` : 'ร้านจะติดต่อกลับภายใน 2 ชั่วโมง ในเวลาทำการ');
/* a severe answer always says hospital, never "wait for the store" (real-user 20/10 P1) */
const badTag = c => [c.mood === 'danger' ? 'มีอาการรุนแรง' : 'แจ้งว่าแย่ลง', 'danger'];
/* real-user 20/10: after "consult now" the customer is in a new consult, the card says so instead of the call-back time */
const inNew = () => !!TP.S._fuTalk && !!TP.caseOpen?.();
const badLine = c => (c.mood === 'danger' ? 'คุณแจ้งว่ามีอาการรุนแรง · ไปโรงพยาบาลทันที แตะเพื่อโทร 1669' : inNew() ? `คุณแจ้งว่าแย่ลง ${c.time} · คุยเรื่องนี้ในการปรึกษาที่เปิดอยู่ได้เลย` : `คุณแจ้งว่าแย่ลง ${c.time} · ${backTxt(c)}`);
/* the severe row for a no-medicine consult: that consult's own warning signs (real-user 20/10 P1: drug-allergy signs only) */
const symDanger = p => { const w = TP.SUMMARY?.[p.src.id]?.warn; return w ? `${w.join(' · ')} (ข้อ 4 ในใบสรุป)` : 'หายใจลำบาก เจ็บแน่นหน้าอก ซึม สับสน อาเจียนหรือถ่ายเป็นเลือด หรืออาการในข้อ 4 ของใบสรุป'; };
/* what the pharmacist asks next, in plain words */
function nextAsk(p) {
  if (p.sym) return chk(p, 'once') ? 'เภสัชกรถามครั้งเดียว ปิดการติดตามของการปรึกษานี้แล้ว' : chk(p, 'self') ? `เภสัชกรยังจะถามตามนัด ${symWhen(p)} ${symDate(p)} ${p.askAt} เพื่อดูว่าหายดีไหม` : `เภสัชกรจะถามอาการ${symWhen(p)} ${symDate(p)} ${p.askAt}`;
  if (p.mid && !chk(p, 'mid') && p.today <= p.mid) return `เภสัชกรจะถามอาการกลางคอร์ส ${dateOf(p, p.mid)}`;
  return `เภสัชกรจะถาม${p.mid ? 'อีกครั้ง' : 'อาการ'}หลังครบคอร์ส ${dateOf(p, p.days + 1)}`;
}
function statusOf(p) {
  if (p.sym) {
    const c = chk(p, 'once'), bad = recentBad(p), tk = recentTalked(p), d = symDate(p);
    if (bad) return { line: badLine(bad), short: c ? 'ติดตามอาการ · ตอบแล้ว' : `ติดตามอาการ · ถาม ${d.slice(0, 5)}`, tag: badTag(bad) };
    if (tk) return { line: `คุยเรื่องนี้กับเภสัชกรแล้ว ${tk.talked.at}`, short: c ? 'ติดตามอาการ · ตอบแล้ว' : `ติดตามอาการ · ถาม ${d.slice(0, 5)}`, tag: null };
    if (c) return { line: `ตอบเภสัชกรแล้ว · ${MOOD[c.mood][0]}`, short: 'ติดตามอาการ · ตอบแล้ว', tag: null };
    if (!p.on) return { line: 'หยุดติดตามแล้ว · เปิดอีกครั้งได้', short: 'หยุดติดตามแล้ว', tag: null };
    if (p.today > p.n) return { line: 'ยังไม่ได้ตอบเภสัชกรเรื่องอาการ · แตะเพื่อตอบ ไม่ถึงนาที', short: 'ยังไม่ได้ตอบเภสัชกร', tag: ['ยังไม่ได้ตอบ', 'warn'] };
    if (symDue(p)) return { line: now() < p.askAt ? `เภสัชกรขอถามอาการวันนี้ ${p.askAt} · ตอบได้เลยตอนนี้` : 'เภสัชกรขอถามอาการ · แตะเพื่อตอบ ไม่ถึงนาที', short: `ตอบเภสัชกร ${d.slice(0, 5)}`, tag: ['ถามอาการวันนี้', 'solid'] };
    return { line: `เภสัชกรจะถามอาการ${symWhen(p)} ${d} ${p.askAt}`, short: `ติดตามอาการ · ถาม ${d.slice(0, 5)}`, tag: null };
  }
  if (p.end) return { line: p.end === 'healed' ? 'ปิดการติดตามแล้ว · แจ้งว่าหายดีแล้ว' : 'ครบคอร์สแล้ว · แจ้งว่ายังมีอาการ', short: 'ติดตามยา · จบแล้ว', tag: null };
  if (!p.on) return { line: 'หยุดติดตามแล้ว · เปิดอีกครั้งได้', short: 'หยุดติดตามแล้ว', tag: null };
  if (p.waitRecv) return { line: 'รอรับยา · เริ่มนับวันที่ 1 เมื่อได้รับยา', short: 'ติดตามยา · รอรับยา', tag: ['รอรับยา', 'muted'] };
  if (p.today > p.days) return { line: `ครบคอร์สแล้ว ${dateOf(p, p.days)} · บอกเภสัชกรว่าตอนนี้เป็นอย่างไร`, short: `ตอบเภสัชกร ${dateOf(p, p.days + 1).slice(0, 5)}`, tag: ['รอบอกอาการ', 'solid'] };
  const late = daySlots(p, p.today).filter(x => x.st === 'late' || x.st === 'now').length, nx = upNext(p), bad = recentBad(p);
  const tag = bad ? badTag(bad) : midDue(p) ? ['ถามอาการวันนี้', 'solid'] : late ? [`ยังไม่ได้กิน ${late} มื้อ`, 'warn'] : null;
  const next = !hasSched(p) ? 'กินยาเมื่อมีอาการ' : nx ? `มื้อถัดไป ${whenPre(p, nx.day)}${SLOT[nx.s][0]} ${p.times[nx.s]}` : 'วันนี้กินครบทุกมื้อแล้ว';
  return { line: bad?.mood === 'danger' ? badLine(bad) : `วันที่ ${p.today} จาก ${p.days} · ${next}`, short: `ติดตามการใช้ยา · ${p.today}/${p.days}`, tag };
}
const adrRow = (S, p) => ui.row({ icon: 'heart-pulse', title: 'สงสัยว่าเป็นผลจากยา', sub: 'แจ้งอาการหลังใช้ยา เช่น ผื่น บวม ใจสั่น', go: 'adr', p: inHist(S, p.src.id) ? { from: p.src.id } : undefined });
const dangerNote = () => ui.note('<b>ถ้ามีอาการรุนแรง</b> เช่น หายใจลำบาก เจ็บแน่นหน้าอก ปากหรือหน้าบวม ไปโรงพยาบาลหรือโทร 1669 ทันที', { tone: 'danger', icon: 'octagon-alert' });
const footHtml = p => `<p class="fu-foot" data-rv>${ic('lock', 14, 2)}<span>${p?.sym ? 'ข้อมูลอาการ' : 'ข้อมูลการกินยาและอาการ'} ใช้เพื่อการดูแลของเภสัชกรเท่านั้น อยู่ภายใต้ความยินยอมการปรึกษา</span></p>`;
const call1669 = () => `<a class="btn danger" href="tel:1669" data-a="fuCall" data-v="1669">${ic('phone', 20, 2)}<span>โทร 1669 สายด่วนฉุกเฉิน</span></a>`;
/* finished course for panel scenarios: every remaining dose taken, mid-course answer "better" */
function finish(p) {
  for (let d = p.today; d <= p.days; d++) slotsOn(p, d).forEach(s => medsAt(p, s).forEach(m => { const k = lk(d, s, m); if (!p.log[k]) p.log[k] = { t: p.times[s] }; }));
  if (p.mid && !chk(p, 'mid')) p.checks.push({ at: 'mid', day: p.mid, date: dateOf(p, p.mid), time: '19:05', mood: 'better' });
  p.today = p.days + 1; p.clock = '';
}
/* meal times whose time has come (a dose taken early counts too) */
function doseStats(p) {
  let tk = 0, n = 0;
  for (let d = 1; d <= cday(p); d++) daySlots(p, d).forEach(x => { if (x.st === 'due' || x.st === 'future') return; n++; if (x.st === 'taken') tk++; });
  return { tk, n };
}

/* =====================================================================
   Hooks for other screens (they call these; '' when there is nothing to show)
   ===================================================================== */
const entryHtml = (icon, title, line, tag, go, din) => `<button type="button" class="card fu-entry" data-go="${go}"${din != null ? ` data-in="${din}"` : ''}>
  <span class="fu-ic">${ic(icon, 22, 1.9)}</span>
  <span class="fu-entry-t"><b>${esc(title)}</b><span>${esc(line)}</span>${tag ? `<span class="fu-tags">${ui.tag(tag[0], tag[1])}</span>` : ''}</span>
  <span class="chev">${ic('chevron-right', 18, 2)}</span></button>`;
/* home (C201): under the hero card */
TP.followHomeCard = (S, o = {}) => {
  const p = F(); if (!p || !p.on || (p.end && !(p.sym && recentBad(p)))) return '';
  ensureSrc(S, p.src);
  const st = statusOf(p), w = fam(p.src.who);
  if (p.sym) return entryHtml('message-circle', 'ติดตามอาการ' + (w ? ' · ' + firstN(w.name) : ''), st.line, st.tag, symGo(p), o.din);
  return entryHtml('pill', 'ติดตามการใช้ยา' + (w ? ' · ' + firstN(w.name) : ''), st.line, st.tag, p.today > p.days ? 'fudone' : 'follow', o.din);
};
/* summary (C401) of the consult the plan came from */
TP.followSumCard = h => {
  const p = h ? F() : null; if (!p || p.src.id !== h.id) return '';
  const st = statusOf(p), fresh = p.today === 1 && p.on && !p.end;
  if (p.sym) return entryHtml('calendar-check', 'ติดตามอาการ', symWait(p) && !symDue(p) && !recentBad(p) ? `ครั้งนี้ไม่มียา เภสัชกรจะถามอาการในแอป${symWhen(p)} ${symDate(p)} ${p.askAt} ครั้งเดียว` : st.line, st.tag, symGo(p), 2).replace('fu-entry"', 'fu-entry fu-sum"');
  return entryHtml('calendar-check', 'ติดตามการใช้ยาและอาการ', fresh ? `แอปเตือนเวลากินยา และเภสัชกรจะถามอาการ${p.mid ? 'กลางคอร์สกับตอนครบคอร์ส' : 'เมื่อครบคอร์ส'}` : st.line, st.tag, 'follow', 2).replace('fu-entry"', 'fu-entry fu-sum"');
};
/* history (C403): one short chip under that consult (coordinator 19/10: one button, chip under ~22 chars, at most one tag) */
TP.followHistRow = h => {
  const p = h ? F() : null; if (!p || p.src.id !== h.id) return '';
  const st = statusOf(p), tag = st.tag && ['danger', 'warn'].includes(st.tag[1]) ? st.tag : null;
  return `<button type="button" class="fu-hrow" data-go="${p.sym ? symGo(p) : p.today > p.days && !p.end && p.on ? 'fudone' : 'follow'}"><span class="fu-hchip">${ic(p.sym ? 'message-circle' : 'pill', 15, 2)}<span>${esc(st.short)}</span>${ic('chevron-right', 15, 2.2)}</span>${tag ? ui.tag(tag[0], tag[1]) : ''}</button>`;
};
/* lock-screen notification text [title, body, screen]: neutral, no drug names or symptoms */
/* room (C303) under "ใบสรุปพร้อมแล้ว" and the summary document (C401): when the one no-medicine question comes (real-user 20/10) */
TP.followCloseLine = c => { const p = c ? F() : null; return p?.sym && p.src.id === c.id && symWait(p) ? `<div class="msg-sys"><span>เภสัชกรจะถามอาการในแอป${symWhen(p)} ${symDate(p)} ${p.askAt}</span></div>` : ''; };
TP.followDocLine = h => { const p = h ? F() : null; return p?.sym && p.src.id === h.id && symWait(p) ? `เภสัชกรจะถามอาการในแอป${symWhen(p)} ${symDate(p)} ${p.askAt} ครั้งเดียว ถ้าแย่ลงก่อนนั้น ปรึกษาใหม่ได้ทุกเมื่อ` : ''; };
TP.FOLLOW_LOCK = { fudose: ['ถึงเวลากินยามื้อเย็น', 'แตะเพื่อดูรายการยา', 'follow'], fucheck: ['เภสัชกรขอถามอาการ', 'แตะเพื่อตอบ ใช้เวลาไม่ถึงนาที', 'fucheck'] };

/* =====================================================================
   C405 Follow: next dose + reminder · when the pharmacist asks · today's doses
   ===================================================================== */
function heroHtml(S, p) {
  const sched = hasSched(p), nx = upNext(p), on = p.remind && S.notif, ds = daySlots(p, p.today);
  const cur = ds.find(x => x.st === 'now'), left = ds.filter(x => x.st !== 'taken').length;
  const segs = Array.from({ length: p.days }, (_, i) => `<i class="${i + 1 < p.today ? 'on' : i + 1 === p.today ? 'cur' : ''}"></i>`).join('');
  const offTxt = !p.remind ? 'ปิดเตือนกินยาอยู่ จะไม่มีแจ้งเตือน' : 'การแจ้งเตือนของแอปปิดอยู่ จะไม่มีเสียงเตือน';
  let k, big, sub, act = sched ? ui.btn('ตั้งเวลาเตือน', { kind: 'tint', sm: true, icon: 'alarm-clock', sheet: 'fureminder' }) : '';
  if (!sched) { k = 'ยาชุดนี้'; big = 'กินเมื่อมีอาการ'; sub = 'ไม่ต้องกินตามเวลา จึงไม่มีแจ้งเตือน'; }
  else if (cur) {
    /* the reminder just went off: one tap right here too */
    k = 'ถึงเวลากินยาแล้ว'; big = `${SLOT[cur.s][0]} ${p.times[cur.s]}`; sub = 'กินแล้วแตะปุ่มนี้ หรือที่มื้อนี้ด้านล่าง';
    act = `<button type="button" class="fu-take go fu-take-l" data-a="fuTake" data-v="${p.today}|${cur.s}" aria-pressed="false" aria-label="${esc(`มื้อ${SLOT[cur.s][0]} ${p.times[cur.s]} แตะเมื่อกินแล้ว`)}">${ic('check', 18, 2.4)}<span>กินแล้ว</span></button>`;
  } else if (nx) {
    k = `มื้อถัดไป${nx.day === p.today ? '' : nx.day === p.today + 1 ? ' · พรุ่งนี้' : ` · วันที่ ${nx.day}`}`;
    big = `${SLOT[nx.s][0]} ${p.times[nx.s]}`;
    sub = on ? `แอปจะแจ้งเตือนเวลา ${p.times[nx.s]} กดปุ่ม "กินแล้ว" ในแจ้งเตือนได้เลย` : offTxt;
  } else if (left) { k = 'วันสุดท้ายของคอร์ส'; big = `เหลืออีก ${left} มื้อ`; sub = 'กินแล้วแตะ กินแล้ว ที่มื้อนั้นด้านล่าง'; }
  else { k = 'วันนี้'; big = 'กินครบทุกมื้อแล้ว'; sub = 'วันนี้เป็นวันสุดท้ายของคอร์ส'; }
  return `<section class="card fu-hero${cur ? ' now' : ''}" data-in="1" aria-label="${esc(k)}">
    <div class="fu-hero-h"><span class="fu-ic${!sched || on ? '' : ' muted'}">${ic(!sched ? 'pill' : on ? 'bell-ring' : 'bell-off', 22, 1.9)}</span>
      <div class="grow"><span class="fu-k">${esc(k)}</span><b class="fu-big">${esc(big)}</b><span class="fu-s1">${esc(sub)}</span>
      ${act ? `<div class="fu-hero-a">${act}</div>` : ''}</div></div>
    <div class="fu-segs" aria-hidden="true">${segs}</div>
    <p class="fu-hero-f">วันที่ <b class="num">${p.today}</b> จาก ${p.days} · ครบคอร์ส ${esc(dateOf(p, p.days))}</p>
  </section>`;
}
function checkHtml(S, p) {
  const li = (cls, title, sub, tag) => `<li class="${cls}"><i class="fu-dot" aria-hidden="true"></i><span class="grow"><b>${esc(title)}</b><span>${esc(sub)}</span></span>${tag}</li>`;
  const rows = [];
  if (p.mid) {
    const c = chk(p, 'mid'), due = midDue(p), over = p.today > p.mid;
    rows.push(li(c ? 'done' : due ? 'on' : '', 'กลางคอร์ส', `วันที่ ${p.mid} · ${dateOf(p, p.mid)}${c ? ` · ตอบ ${c.time}` : ` · ${p.askAt}`}`,
      c ? moodTag(c.mood, 'ตอบแล้ว ') : due ? ui.tag(over ? 'ยังไม่ได้ตอบ' : 'วันนี้', over ? 'warn' : 'solid') : ''));
  }
  rows.push(li('', 'หลังครบคอร์ส', `${dateOf(p, p.days + 1)} · ${p.askAt}`, ''));
  const due = midDue(p);
  return `<section class="card fu-ask" data-in="2" aria-labelledby="fuAskH">
    <p class="fu-cap" id="fuAskH">${ic('message-circle', 16, 2)}<span>${esc(ph(p).short)} จะถามอาการ ${p.mid ? 2 : 1} ครั้ง</span></p>
    <ol class="fu-ckl">${rows.join('')}</ol>
    ${due ? `<div class="mt12">${ui.btn('บอกอาการกลางคอร์ส', { a: 'fuAsk', p: { at: 'mid' }, icon: 'message-circle' })}</div><p class="small mt8">${now() < p.askAt ? `แจ้งเตือนเวลา ${p.askAt} ตอบก่อนได้ · ` : ''}แตะคำตอบเดียว ใช้เวลาไม่ถึงนาที</p>` : `<p class="small mt8">แจ้งเตือนในแอปตามเวลานี้ แตะคำตอบเดียว ไม่ถึงนาที</p>`}
  </section>`;
}
function slotRow(p, s) {
  const st = slotState(p, p.today, s), ms = medsAt(p, s), at = takenAt(p, p.today, s), k = `${p.today}|${s}`;
  const meds = ms.map(m => `<span class="fu-med">${esc(`${m.name} ${m.dose}${m.meal ? ' ' + m.meal : ''}${m.tip ? ' · ' + m.tip : ''}`)}</span>`).join('');
  const line = st === 'taken' ? `<span class="fu-st ok">${ic('clock', 15, 2.2)}กินตอน ${esc(at)}</span>`
    : st === 'now' ? `<span class="fu-st now">${ic('bell-ring', 15, 2.2)}ถึงเวลาแล้ว</span>`
    : st === 'late' ? `<span class="fu-st warn">${ic('triangle-alert', 15, 2.2)}เลยเวลาแล้ว ยังไม่ได้กิน</span>` : '';
  const lbl = st === 'taken' ? `มื้อ${SLOT[s][0]} กินแล้ว ${at} แตะเพื่อยกเลิก` : `มื้อ${SLOT[s][0]} ${p.times[s]} แตะเมื่อกินแล้ว`;
  return `<div class="fu-srow ${st}"><span class="fu-slot-i">${ic(SLOT[s][1], 18, 2)}</span>
    <div class="grow"><b>${SLOT[s][0]} <span class="num">${esc(p.times[s])}</span></b>${meds}${line}</div>
    <button type="button" class="fu-take${st === 'now' || st === 'late' ? ' go' : ''}" data-a="fuTake" data-v="${k}" aria-pressed="${st === 'taken'}" aria-label="${esc(lbl)}">${st === 'taken' ? ic('check', 17, 2.6) : ''}<span>กินแล้ว</span></button>${st === 'late' ? `<p class="fu-miss">${ic('info', 15, 2.2)}<span>${esc(MISSED)}</span></p>` : ''}</div>`;
}
function prnRow(p, m) {
  const k = `${p.today}|${m.id}`, list = p.prn[k] || [], last = list[list.length - 1];
  const nextT = last ? addH(last, m.gap) : '', full = list.length >= m.max, wait = !!last && (!nextT || toM(nextT) > toM(now()));
  const why = full ? `ครบ ${m.max} ครั้งของวันนี้แล้ว` : wait ? (nextT ? `กินครั้งถัดไปได้หลัง ${nextT}` : 'กินครั้งถัดไปได้พรุ่งนี้') : '';
  /* as-needed: the text gets the full width, the button sits under it */
  return `<div class="fu-srow prn"><span class="fu-slot-i">${ic(/ไข้/.test(m.prn) ? 'thermometer' : 'pill', 18, 2)}</span>
    <div class="grow"><b>${esc(m.name)}</b><span class="fu-med">${esc(`${m.dose} ${m.prn}`)}</span><span class="fu-med">${esc(`ห่างกันอย่างน้อย ${m.gap} ชั่วโมง ไม่เกิน ${m.max} ครั้งต่อวัน`)}</span>
      <span class="fu-st muted">${ic('clock', 15, 2.2)}<span>${list.length ? `วันนี้กิน ${list.length} ครั้ง · ล่าสุด ${esc(last)}` : 'วันนี้ยังไม่ได้กิน'}${why ? ` · ${esc(why)}` : ''}</span></span>
      <div class="fu-prn-a"><button type="button" class="fu-take" data-a="fuPrn" data-v="${esc(k)}"${full || wait ? ' disabled' : ''} aria-label="${esc(`${m.name} ${why || 'แตะเมื่อกินแล้ว'}`)}"><span>กินแล้ว</span></button>${list.length ? `<button type="button" class="fu-undo" data-a="fuPrnUndo" data-v="${esc(k)}">ลบครั้งล่าสุด</button>` : ''}</div></div></div>`;
}
function todayHtml(p) {
  const slots = slotsOn(p, p.today), prn = p.meds.filter(m => m.prn), info = p.meds.filter(m => m.info);
  const tk = daySlots(p, p.today).filter(x => x.st === 'taken').length;
  const start = p.today === 1 && p.startAt && slots.length ? ` · เริ่มมื้อ${SLOT[slots[0]][0]}วันนี้` : '';
  return `${ui.secH('ยาวันนี้', { din: 3 })}<p class="fu-date" data-in="3">${esc(dateOf(p, p.today))}${slots.length ? ` · กินแล้ว ${tk} จาก ${slots.length} มื้อ` : ''}${esc(start)}</p>
    ${slots.length ? `<div class="fu-list" data-in="4">${slots.map(s => slotRow(p, s)).join('')}</div>` : ''}
    ${prn.length ? `<h3 class="group-h">กินเมื่อมีอาการ</h3><div class="fu-list" data-in="5">${prn.map(m => prnRow(p, m)).join('')}</div>` : ''}
    ${info.length ? ui.group(info.map(m => ui.row({ icon: 'pill', title: m.name, sub: m.info })), { title: 'ยาอื่นในชุดนี้' }) : ''}`;
}
function worseCard(S, p, c) {
  const P = ph(p), red = c.mood === 'danger', open = S.storeOpen;
  const by = open ? backBy(c) : '';
  const txt = red ? `ไปโรงพยาบาลทันที ไม่ต้องรอเภสัชกร ${open ? 'ร้านจะโทรหาคุณโดยเร็วที่สุด' : 'ร้านปิดอยู่ เภสัชกรจะเห็นเมื่อร้านเปิด 09:00'}`
    : by ? `${backLate(c) ? 'ร้านปิด 21:00 จึงนับเวลาต่อตอนร้านเปิด ' : ''}${P.short} จะติดต่อกลับก่อน ${by} ทางโทรศัพท์หรือข้อความในแอป ถ้าเลยเวลานี้ยังไม่มีใครติดต่อ กดปรึกษาตอนนี้ได้เลย` : open ? `${P.short} จะติดต่อกลับ${BACK}` : 'ร้านปิดอยู่ เภสัชกรจะเห็นเมื่อร้านเปิด 09:00 และติดต่อกลับภายใน 11:00';
  const reply = p.contact ? `<div class="fu-reply">${ui.av('', { ini: P.ini, size: 'sm' })}<div class="grow"><b>${esc(P.short)}</b><small>วันนี้ ${esc(p.contact.at)}</small><p>${esc(p.contact.text)}</p></div></div>` : '';
  const now2 = !red && inNew();
  const act = red ? call1669() : now2 ? ui.btn('ไปที่การปรึกษา', { kind: 'secondary', a: 'fuConsult', icon: 'message-circle' }) : ui.btn(open ? 'ไม่อยากรอ ปรึกษาตอนนี้' : 'ฝากคำถามถึงเภสัชกร', { kind: 'secondary', a: 'fuConsult', icon: 'message-circle' });
  const wait = red ? '' : `<p class="fu-tel d">${ic('octagon-alert', 14, 2)}<span>ระหว่างรอ ถ้าหายใจลำบาก เจ็บแน่นหน้าอก หรือหน้าบวม ไปโรงพยาบาลทันที</span></p>`;
  return `<section class="fu-alert${red ? ' red' : ''}" data-in="1" role="${red ? 'alert' : 'status'}"><p class="fu-alert-h">${ic(red ? 'octagon-alert' : 'triangle-alert', 20, 2)}<b>${red ? 'คุณแจ้งว่ามีอาการรุนแรง' : 'คุณแจ้งว่าอาการแย่ลง'} ${esc(c.time)}</b></p><p>${esc(now2 ? 'คุณเข้าปรึกษาใหม่แล้ว เล่าเรื่องนี้กับเภสัชกรได้เลย คุยแล้วร้านไม่ต้องโทรอีก' : txt)}</p>${now2 ? '' : telLine(p)}${wait}${reply}<div class="fu-alert-a">${act}</div></section>`;
}
function talkedCard(S, p, c) {
  const t = c.talked, more = p.sym ? '' : active(p) ? ' · ติดตามการใช้ยาต่อตามเดิม' : '';
  return stateCard('circle-check', 'คุยกับเภสัชกรแล้ว ไม่ต้องรอโทร', `คุณแจ้งว่า${c.mood === 'danger' ? 'มีอาการรุนแรง' : 'อาการแย่ลง'} ${c.time} · เภสัชกรคุยเรื่องนี้ในการปรึกษาเมื่อ ${t.at} แล้ว${more}`,
    inHist(S, t.id) ? ui.btn('ดูใบสรุปครั้งนั้น', { kind: 'tint', sm: true, go: 'summary', p: { id: t.id } }) : '');
}
function stateCard(icon, title, body, btn, muted) {
  return `<div class="card fu-state" data-in="1"><span class="fu-ic${muted ? ' muted' : ''}">${ic(icon, 22, 1.9)}</span><div class="grow"><b>${esc(title)}</b><p class="small">${esc(body)}</p>${btn}</div></div>`;
}
function endCard(p) {
  const end = dateOf(p, p.days);
  if (!p.on && !p.end) return stateCard('bell-off', 'หยุดติดตามแล้ว', 'ไม่มีการเตือนกินยาและไม่ถามอาการของแผนนี้ บันทึกที่ผ่านมายังอยู่', ui.btn('เปิดติดตามอีกครั้ง', { kind: 'tint', sm: true, icon: 'bell', a: 'fuOn' }), true);
  if (p.end === 'healed') return stateCard('calendar-check', 'ปิดการติดตามแล้ว', `คุณแจ้งว่าหายดีแล้ว · ครบคอร์ส ${end}`, ui.btn('ดูสรุปคอร์ส', { kind: 'tint', sm: true, go: 'fudone' }));
  if (p.end === 'still') return stateCard('calendar-check', 'ครบคอร์สแล้ว ยังมีอาการ', 'ควรปรึกษาเภสัชกรอีกครั้ง หรือพบแพทย์', ui.btn('ปรึกษาเภสัชกรอีกครั้ง', { sm: true, a: 'fuConsult', icon: 'message-circle' }));
  return stateCard('calendar-check', 'ครบคอร์สยาแล้ว', `ครบ ${p.days} วันเมื่อ ${end} · ${ph(p).short} ขอถามอาการครั้งสุดท้าย`, ui.btn('บอกอาการหลังครบคอร์ส', { sm: true, go: 'fudone', iconRight: 'arrow-right' }));
}
function linksHtml(S, p) {
  const rows = [ui.row({ icon: 'history', title: 'บันทึกการกินยา', sub: 'กินครบกี่มื้อ และคำตอบเรื่องอาการ', go: 'fulog' })];
  if (active(p) && !p.waitRecv) rows.push(ui.row({ icon: 'message-circle', title: 'บอกอาการเอง', sub: 'แย่ลงหรือมีอาการใหม่ บอกเภสัชกรได้ทุกเมื่อ', a: 'fuAsk' }));
  if (inHist(S, p.src.id)) rows.push(ui.row({ icon: 'file-text', title: 'ใบสรุปการปรึกษา', sub: `${p.src.date} · วิธีใช้ยาทุกตัว`, go: 'summary', p: { id: p.src.id } }));
  rows.push(adrRow(S, p));
  if (p.on && !p.end) rows.push(ui.row({ icon: 'bell-off', title: 'หยุดติดตาม', sub: 'ปิดการเตือนกินยาและการถามอาการ', sheet: 'fuoff', chev: false }));
  return ui.group(rows, { title: 'เพิ่มเติม', rv: true });
}
const remNote = (html, label, a) => `<div class="fu-mb" data-in="1">${ui.note(html, { icon: 'bell-off' })}<div class="mt8">${ui.btn(label, { kind: 'tint', sm: true, icon: 'bell', a })}</div></div>`;
function bodyHtml(S, p) {
  const out = [];
  if (p.offline) out.push(`<div class="fu-mb" data-in="1">${ui.note('<b>ไม่มีอินเทอร์เน็ต</b><br>กด กินแล้ว ได้ตามปกติ บันทึกไว้ในเครื่องก่อน แล้วส่งให้เภสัชกรเมื่อกลับมาออนไลน์', { tone: 'warn', icon: 'wifi-off' })}</div>`);
  if (!active(p)) out.push(endCard(p));
  else {
    if (!S.notif) out.push(remNote('<b>การแจ้งเตือนของแอปปิดอยู่</b><br>ตั้งเวลาไว้แล้ว แต่จะไม่มีแจ้งเตือนกินยา', 'เปิดการแจ้งเตือน', 'fuNotifOn'));
    else if (hasSched(p) && !p.remind) out.push(remNote('<b>ปิดเตือนกินยาอยู่</b><br>กด กินแล้ว ได้ตามปกติ แต่จะไม่มีแจ้งเตือน', 'เปิดเตือนกินยา', 'fuRemOn'));
    const bad = recentBad(p), tk = recentTalked(p); if (bad) out.push(worseCard(S, p, bad)); else if (tk) out.push(talkedCard(S, p, tk));
    if (p.waitRecv) out.push(`<div class="card fu-wait" data-in="2"><p class="fu-exp">${ic('package', 18, 2)}<span>${p.waitRecv === 'express' ? 'ยากำลังส่งด่วนถึงคุณ' : 'ยากำลังส่งเป็นพัสดุ'} · เริ่มนับวันที่ 1 และเตือนกินยาเมื่อได้รับยา</span></p>${ui.btn('ได้รับยาแล้ว', { a: 'fuGot', icon: 'check', cls: 'mt12' })}</div>`);
    else out.push(heroHtml(S, p), checkHtml(S, p), todayHtml(p));
  }
  out.push(linksHtml(S, p), footHtml());
  return out.join('');
}
/* item 82: C405 for the no-medicine plan - when the one question comes and how to answer, nothing about doses */
function symHero(S, p) {
  const due = symDue(p), late = p.today > p.n, on = S.notif, s = p.checks.filter(x => x.at === 'self').pop();
  const k = due ? (late ? 'ยังไม่ได้ตอบเภสัชกร' : 'เภสัชกรขอถามอาการวันนี้') : 'เภสัชกรจะถามอาการ 1 ครั้ง';
  const big = due ? 'ตอนนี้อาการเป็นอย่างไร' : `${symWhen(p)} ${p.askAt}`;
  const sub = due ? `${!late && now() < p.askAt ? `แจ้งเตือนเวลา ${p.askAt} ตอบก่อนได้ · ` : ''}แตะคำตอบเดียว ใช้เวลาไม่ถึงนาที` : `${symDate(p)} · ตอนนี้ไม่ต้องทำอะไร ${on ? 'แอปจะแจ้งเตือนเมื่อถึงเวลา' : 'เปิดการแจ้งเตือนด้านบน เพื่อไม่พลาดคำถาม'}`;
  return `<section class="card fu-hero sym${due ? ' now' : ''}" data-in="1" aria-label="${esc(k)}">
    <div class="fu-hero-h"><span class="fu-ic${due || on ? '' : ' muted'}">${ic(due ? 'message-circle' : on ? 'bell-ring' : 'bell-off', 22, 1.9)}</span>
      <div class="grow"><span class="fu-k">${esc(k)}</span><b class="fu-big">${esc(big)}</b><span class="fu-s1">${esc(sub)}</span>${s ? `<span class="fu-s1 fu-self">${ic('check', 15, 2.4)}<span>${esc(`คุณบอกเองแล้ว${s.day === p.today ? ' วันนี้' : ` ${s.date}`} ${s.time} · ${MOOD[s.mood][0]} · เภสัชกรยังจะถามตามนัด`)}</span></span>` : ''}
      ${due ? `<div class="fu-hero-a">${ui.btn('บอกอาการ', { a: 'fuAsk', p: { at: 'once' }, icon: 'message-circle' })}</div>` : ''}</div></div>
    <p class="fu-hero-f">ครั้งนี้ไม่มียา จึงไม่มีเตือนกินยา</p>
  </section>`;
}
function symBodyHtml(S, p) {
  const out = [], c = chk(p, 'once'), bad = recentBad(p), tk = recentTalked(p), rows = [];
  if (symWait(p) && !S.notif) out.push(remNote('<b>การแจ้งเตือนของแอปปิดอยู่</b><br>จะไม่มีแจ้งเตือนตอนเภสัชกรถามอาการ', 'เปิดการแจ้งเตือน', 'fuNotifOn'));
  if (bad) out.push(worseCard(S, p, bad)); else if (tk) out.push(talkedCard(S, p, tk));
  if (c) { if (!bad && !tk) out.push(stateCard('calendar-check', 'ตอบเภสัชกรแล้ว', `คุณตอบว่า${MOOD[c.mood][0]} ${c.date} ${c.time} · เภสัชกรถามครั้งเดียว ปิดการติดตามของการปรึกษานี้แล้ว`,
    c.mood === 'same' ? ui.btn(S.storeOpen ? 'ปรึกษาเภสัชกรอีกครั้ง' : 'ฝากคำถามถึงเภสัชกร', { kind: 'tint', sm: true, a: 'fuConsult', icon: 'message-circle' }) : '')); }
  else if (!p.on) out.push(stateCard('bell-off', 'หยุดติดตามแล้ว', 'เภสัชกรจะไม่ถามอาการของการปรึกษานี้ ใบสรุปยังอยู่', ui.btn('เปิดติดตามอีกครั้ง', { kind: 'tint', sm: true, icon: 'bell', a: 'fuOn' }), true));
  else out.push(symHero(S, p));
  if (symWait(p) && !symDue(p)) rows.push(ui.row({ icon: 'message-circle', title: 'บอกอาการเอง', sub: 'แย่ลงหรือมีอาการใหม่ บอกเภสัชกรได้ทุกเมื่อ', a: 'fuAsk' }));
  if (inHist(S, p.src.id)) rows.push(ui.row({ icon: 'file-text', title: 'ใบสรุปการปรึกษา', sub: `${p.src.date} · คำแนะนำ และอาการที่ต้องไปพบแพทย์`, go: 'summary', p: { id: p.src.id } }));
  if (symWait(p)) rows.push(ui.row({ icon: 'bell-off', title: 'หยุดติดตาม', sub: 'เภสัชกรจะไม่ถามอาการของการปรึกษานี้', sheet: 'fuoff', chev: false }));
  if (rows.length) out.push(ui.group(rows, { title: 'เพิ่มเติม', rv: true }));
  out.push(footHtml(p));
  return out.join('');
}
TP.screen('follow', {
  group: 'after', title: 'ติดตามการใช้ยา', code: 'C405', parent: 'home',
  states: [['normal', 'วันที่ 3 ปกติ'], ['missed', 'ลืมมื้อกลางวัน'], ['checked', 'ตอบกลางคอร์สแล้ว'], ['endonly', 'เภสัชกรเลือกถามหลังครบคอร์สอย่างเดียว'], ['worse', 'แจ้งว่าแย่ลง'], ['day1', 'เพิ่งเริ่มวันนี้'], ['done', 'ครบคอร์ส'], ['remoff', 'ปิดเตือนกินยา'], ['off', 'หยุดติดตาม'], ['offline', 'ไม่มีเน็ต'], ['empty', 'ไม่มีแผน'], ['loading', 'กำลังโหลด'],
    ['sym', 'ไม่มียา ถามอีก 3 วัน'], ['symdue', 'ไม่มียา ถึงวันถามอาการ'], ['symworse', 'ไม่มียา แจ้งว่าแย่ลง'], ['symdone', 'ไม่มียา ตอบแล้ว'], ['talked', 'แจ้งว่าแย่ลง คุยในการปรึกษาใหม่แล้ว']],
  notes: ['19/10 เจ้าของสั่ง "ทำให้ simple กว่านี้": เหลือ 3 อย่าง คือ มื้อถัดไปและเวลาเตือน · เภสัชกรจะถามอาการเมื่อไร · ยาวันนี้ แตะ "กินแล้ว" มื้อละครั้งเดียว',
    '19/10 เจ้าของสั่ง "ตั้งเวลาเตือนต้องมีผลแจ้งเตือนในแอปได้จริง": ตั้งเวลาที่ C410 แล้วกด "จำลองว่าถึงเวลากินยา" ในแผง จะมีแจ้งเตือนบนจอพร้อมปุ่ม กินแล้ว แตะแล้วจอนี้อัปเดตทันที กดซ้ำได้ เวลาเดินไปมื้อถัดไป',
    '"กินแล้ว" ต่อมื้อ บันทึกยาทุกตัวของมื้อนั้นพร้อมกัน · แตะซ้ำเพื่อยกเลิก · เลยเวลา 1 ชั่วโมง = บอกวิธีทำเมื่อลืมกิน',
    '19/10 เจ้าของสั่ง "ตามระหว่างทาง หรือตามทีเดียวตอนจบคอร์สก็ได้": ไม่ถามทุกวันแล้ว · บอกเองได้ทุกเมื่อจาก "บอกอาการเอง"',
    '19/10 เจ้าของเคาะ "ให้เภสัชเลือกได้ตั้งแต่ต้น": ตอนปิดเคส (S305) เภสัชกรเลือก ถามหลังครบคอร์สอย่างเดียว (ค่าตั้งต้น) หรือ ถามกลางคอร์สด้วย · จอนี้บอกจำนวนครั้งตามที่เลือก (ดูสถานะ เภสัชกรเลือกถามหลังครบคอร์สอย่างเดียว)',
    'ตัดออก: รายการยาในแผน (ดูในใบสรุป) · ข้ามมื้อ · ปุ่มนาฬิกาบนแถบบน',
    'ยากินเมื่อมีอาการ บอกเวลาที่กินครั้งถัดไปได้ และจำนวนครั้งต่อวัน กันกินถี่เกิน',
    'สถานะทุกอย่างมีข้อความ + ไอคอน ไม่ใช้สีอย่างเดียว · จำลองวันที่ 3 = 18/10/2026 14:12',
    '20/10 ข้อ 82 เจ้าของเคาะ "ใช่ทำได้": ปรึกษาแล้วไม่ได้จ่ายยา เภสัชกรเปิดติดตามได้ แอปถามอาการ 1 ครั้ง เวลา 19:00 พรุ่งนี้หรืออีก 3 วัน ตามที่เภสัชกรเลือกตอนปิดเคส (S305) · ไม่มีรายการยาและเตือนกินยา · ถึงวันถาม การ์ดหน้าแรกพาไปตอบได้เลย · ตอบแล้วปิดการติดตาม แย่ลง = ร้านติดต่อกลับเหมือนเดิม (สถานะ C405.13-16 · ลองปุ่ม ปิดเคส ไม่จ่ายยา ในแผงตอนอยู่ในห้องปรึกษา)',
    'ผู้ใช้จริง 20/10 (docs/qa/2026-10-20-real-user-82-follow-nomeds.md): ตอบว่ามีอาการรุนแรง การ์ดหน้าแรกบอกให้ไปโรงพยาบาล ไม่ใช่รอร้านโทร (ใช้กับแบบมียาด้วย) · แย่ลง บอกเวลาที่ร้านจะติดต่อกลับเป็นนาฬิกา · ไม่มียา: บอกว่าตอนนี้ไม่ต้องทำอะไร · บอกอาการเองแล้วขึ้นบนการ์ด · ห้องปรึกษาและใบสรุปบอกวันเวลาที่จะถาม',
    '20/10 ข้อ 58 เจ้าของเคาะ (ตามที่แนะนำ): แจ้งว่าแย่ลงแล้วกด ไม่อยากรอ ปรึกษาตอนนี้ เภสัชกรคุยเรื่องนั้นในเคสใหม่ แล้วติ๊กตอนปิดเคส (S305) = นับว่าติดต่อแล้ว · การ์ดเปลี่ยนจาก ร้านจะติดต่อกลับ เป็น คุยเรื่องนี้กับเภสัชกรแล้ว ไม่ต้องรอโทร (สถานะ C405.17 · หรือเล่นต่อจาก C405.5: ปรึกษาตอนนี้ แล้วกด ปิดเคส ในแผง)'],
  wait: ['ข้อมูลการกินยาและอาการเป็นข้อมูลสุขภาพ ตอนนี้ถือว่าอยู่ใต้ความยินยอมการปรึกษา ของจริงต้องผ่านการตรวจ PDPA ก่อน',
    'ข้อความ "ลืมกิน" ต้องให้เภสัชกรยืนยัน และยาบางกลุ่ม (เช่น ยาปฏิชีวนะ) ต้องมีข้อความเฉพาะ',
    'มีหลายแผนพร้อมกันได้ไหม (หลายการปรึกษา) ตัวอย่างนี้มีแผนเดียว'],
  prep(S) {
    const st = S.st.follow; if (!st) return;
    S._fuSeen = S.case; /* the panel scenario wins over a closed consult */
    if (st === 'empty') { S.follow = null; return; }
    if (st.startsWith('sym')) { const p = mockSym(st); S.follow = p; ensureSrc(S, p.src); return; }
    if (st === 'day1') { S.follow = dayOnePlan(S.case?.status === 'closed' && S.case.order?.status === 'paid' ? S.case : null); return; }
    const p = mockPlan(st);
    if (st === 'checked') p.checks.push({ at: 'mid', day: 3, date: TP.NOW.date, time: '13:05', mood: 'better' });
    if (st === 'worse') p.checks.push({ at: 'mid', day: 3, date: TP.NOW.date, time: '13:40', mood: 'worse' });
    if (st === 'talked') p.checks.push({ at: 'mid', day: 3, date: TP.NOW.date, time: '13:40', mood: 'worse', talked: { at: '14:05', id: '' } });
    if (st === 'done') finish(p);
    if (st === 'remoff') p.remind = false;
    if (st === 'off') p.on = false;
    if (st === 'offline') p.offline = true;
    S.follow = p; ensureSrc(S, p.src);
  },
  render(ctx) {
    const S = ctx.S, p = F(), nav = ui.nav({ back: backL('home'), title: p?.sym ? 'ติดตามอาการ' : 'ติดตามการใช้ยา' });
    if (ctx.state === 'loading') {
      return nav + ui.page(`<div aria-busy="true" aria-label="กำลังโหลดการติดตาม">${ui.skel('100%', 170, 14)}<div class="mt12">${ui.skel('100%', 120, 14)}</div><div class="mt24">${ui.skel('36%', 18)}</div><div class="mt12">${ui.skel('100%', 220, 14)}</div></div>`, { lt: 'ติดตามการใช้ยา' });
    }
    if (!p) return nav + ui.page(ui.empty({ title: 'ยังไม่มีการติดตาม', body: 'เมื่อเภสัชกรนัดติดตามหลังปรึกษา แอปจะถามอาการให้ที่นี่ ถ้าได้ยาไป จะเตือนเวลากินยาด้วย', btn: { label: 'ดูประวัติการปรึกษา', a: 'fuHistory' }, art: emArt('pill') }), { lt: 'ติดตามการใช้ยา' });
    const b = TP.branch(p.src.branch) || TP.branch(), w = fam(p.src.who);
    const sub = `${w ? `ของ${esc(firstN(w.name))} (${esc(w.rel)}) · ` : ''}จากการปรึกษา ${esc(p.src.date)} · ${esc(ph(p).short)} · ${esc(b.short)}`;
    return nav + ui.page(`<div class="tp-person card">${ui.av('', { ini: (w?.name || S.user.full || 'ค').trim().slice(0,1), img: TP.profileImage(p.src.who) })}<span><small>${p.sym ? 'ติดตามอาการของ' : 'ติดตามการใช้ยาของ'}</small><b>${esc(w?.name || S.user.full)} · ${esc(w?.rel || 'ตัวเอง')}</b></span></div>` + (p.sym ? symBodyHtml(S, p) : bodyHtml(S, p)), { lt: p.sym ? 'ติดตามอาการ' : 'ติดตามการใช้ยา', sub });
  },
  mount(el, ctx) { if (ctx.state === 'loading') ctx.later(() => { ctx.S.st.follow = 'normal'; TP.refresh(); }, 1200); }
});
const refreshPop = sel => TP.refresh({ anim: false }).then(() => { const el = curEl(); if (el && !RM()) pop($(sel, el)); });
/* one tap per meal time: every medicine of that time, at the follow clock */
function takeSlot(p, day, s, t) {
  const ms = medsAt(p, s), was = ms.every(m => p.log[lk(day, s, m)]?.t);
  ms.forEach(m => { if (was) delete p.log[lk(day, s, m)]; else p.log[lk(day, s, m)] = { t }; });
  return !was;
}
TP.act('fuTake', t => {
  const p = F(), [d, s] = String(t.dataset.v || '').split('|'); if (!p || !SLOT[s]) return;
  const on = takeSlot(p, +d, s, now());
  TP.notify(!on ? 'ยกเลิกแล้ว มื้อนี้ยังไม่ได้กิน' : p.offline ? 'บันทึกไว้ในเครื่องแล้ว จะส่งเมื่อออนไลน์' : `บันทึกแล้ว กินยามื้อ${SLOT[s][0]}`, { icon: on ? 'check' : 'rotate-ccw' });
  TP.emit('state'); refreshPop(`.fu-take[data-v="${t.dataset.v}"]`);
});
TP.act('fuPrn', t => {
  const p = F(), k = t.dataset.v; if (!p || !k) return;
  p.prn[k] = [...(p.prn[k] || []), now()]; TP.emit('state');
  TP.notify('บันทึกเวลากินยาแล้ว', { icon: 'check' }); refreshPop(`.fu-take[data-v="${k}"]`);
});
TP.act('fuPrnUndo', t => {
  const p = F(), k = t.dataset.v; if (!p || !p.prn[k]?.length) return;
  p.prn[k] = p.prn[k].slice(0, -1); TP.emit('state');
  TP.notify('ลบครั้งล่าสุดแล้ว', { icon: 'rotate-ccw' }); TP.refresh({ anim: false });
});
TP.act('fuGot', () => { const p = F(); if (!p) return; p.waitRecv = ''; p.start = TP.NOW.date; p.startAt = TP.NOW.time; TP.emit('state'); TP.refresh({ anim: false }); TP.notify('เริ่มติดตามการใช้ยาแล้ว', { icon: 'circle-check' }); });
TP.act('fuOn', () => { const p = F(); if (!p) return; p.on = true; TP.emit('state'); TP.notify('เปิดติดตามอีกครั้งแล้ว', { icon: 'bell' }); TP.refresh({ anim: false }); });
TP.act('fuRemOn', () => { const p = F(); if (!p) return; p.remind = true; TP.emit('state'); TP.notify('เปิดเตือนกินยาแล้ว', { icon: 'bell' }); TP.refresh({ anim: false }); });
TP.act('fuNotifOn', t => {
  TP.S.notif = true; TP.S.notifAsked = true; TP.emit('state');
  TP.notify('เปิดการแจ้งเตือนแล้ว', { icon: 'bell' });
  if (TP.sheetOpen()) t.closest('.fu-mb')?.remove(); else TP.refresh({ anim: false });
});
TP.act('fuAsk', t => {
  const p = F(); if (!p) return;
  let at = ''; try { at = JSON.parse(t.dataset.p || '{}').at || ''; } catch { at = ''; }
  TP.go('fucheck', { params: { at: at || (midDue(p) ? 'mid' : symDue(p) ? 'once' : 'self') } });
});
TP.act('fuHistory', () => TP.tab('history'));
TP.act('fuHome', () => TP.tab('home'));
TP.act('fuCall', (t, c, e) => { e?.preventDefault(); TP.notify('กำลังโทร ' + (t.dataset.v || ''), { icon: 'phone' }); });
TP.act('fuBackFollow', () => (TP.hist[TP.hist.length - 1]?.id === 'follow' ? TP.back() : TP.go('follow', { replace: true })));
/* consult again: prefill intake with what the customer reported (store closed -> leave a question) */
TP.act('fuConsult', () => {
  const S = TP.S, p = F(); if (!p) return;
  if (TP.caseOpen?.()) { TP.notify('มีการปรึกษาที่ยังไม่จบ พากลับไปที่เดิม', { icon: 'message-circle' }); TP.go(['matched', 'room'].includes(S.case.status) ? 'room' : 'queue', { via: 'cover' }); return; }
  const over = !!p.end || p.today > p.days, c = over ? null : lastCheck(p);
  const said = c ? ` · ${c.day === p.today ? 'วันนี้' : `วันที่ ${c.day}`} แจ้งว่า${MOOD[c.mood][0]}` : '';
  const sc = p.sym ? lastCheck(p) : null;
  const what = p.sym ? `ไม่ได้รับยา${sc ? ` · ${sc.day === p.today ? 'วันนี้' : sc.date} แจ้งว่า${MOOD[sc.mood][0]}` : ''}` : over ? 'กินยาครบคอร์สแล้วยังมีอาการ' : `วันที่ ${p.today} ของคอร์สยา${said}`;
  S._fuTalk = !!recentBad(p);
  Object.assign(S.intake, { who: p.src.who || 'me', symptoms: (p.src.sym || []).filter(x => TP.SYMPTOMS.includes(x)), custom: [], urgent: [], note: `ติดตามหลังปรึกษา ${p.src.date} · ${what}`, photos: 0 });
  if (S.storeOpen) TP.go('intake');
  else if (TP.SCREENS.offline) TP.go('offline');
  else TP.notify('ร้านปิดอยู่ เปิดอีกครั้ง 09:00', { icon: 'moon' });
});

/* =====================================================================
   C406 Check-in: one tap sends (LMA card style) · danger row goes straight to hospital + 1669
   ===================================================================== */
const ansBtn = (k, at, map = ANS, a = 'fuAns') => `<button type="button" class="fu-ans ${k}" data-a="${a}" data-v="${k}" data-at="${at}">
  <span class="fu-ans-i">${ic(map[k][1], 26, 1.8)}</span><span class="fu-ans-t"><b>${esc(map[k][0])}</b><span>${esc(map[k][2])}</span></span><span class="chev">${ic('chevron-right', 18, 2)}</span></button>`;
const checkNote = (S, p) => (S.storeOpen ? `แตะคำตอบเดียว ส่งถึง ${ph(p).short} ทันที · ถ้าแย่ลง ร้านจะติดต่อกลับ${BACK}` : 'ร้านปิดอยู่ เภสัชกรจะเห็นคำตอบเมื่อร้านเปิด 09:00 ถ้าอาการรุนแรง ไปโรงพยาบาลได้เลย');
TP.screen('fucheck', {
  group: 'after', title: 'บอกอาการ', code: 'C406', parent: 'follow',
  states: [['normal', 'กลางคอร์ส ยังไม่ตอบ'], ['self', 'บอกเองระหว่างคอร์ส'], ['closed', 'ตอนร้านปิด'], ['error', 'ส่งไม่สำเร็จ'], ['sym', 'ไม่มียา ถามครั้งเดียว']],
  notes: ['19/10 เจ้าของสั่ง "icon โดนบรรทัดเลื่อน จัด UI ใหม่": เปลี่ยนเป็นแถวใหญ่ ไอคอนซ้าย ข้อความขวา ไอคอนตรงกับบรรทัดแรกทุกแถว ข้อความยาวกี่บรรทัดไอคอนก็ไม่เลื่อน',
    'สั้นลงแบบการ์ด LINE ของ LMA: แตะคำตอบเดียวส่งเลย ไม่มีปุ่มส่ง · ตัดช่องเล่าเพิ่มและรายการอาการอันตราย 6 ปุ่ม',
    'มีอาการรุนแรง = ไปจอ "ไปโรงพยาบาลทันที + โทร 1669" ทันที ไม่รอส่ง (ส่งให้ร้านตามหลัง)',
    'บอกชัดว่าเภสัชกรเห็นเมื่อไร: ในเวลาทำการ 09:00-21:00 · ร้านปิด = เห็นตอน 09:00',
    'ส่งไม่สำเร็จ = บอกว่ายังไม่ถึงเภสัชกร แตะคำตอบอีกครั้งเพื่อส่งใหม่ (สถานะนี้ แตะอีกครั้งจะส่งได้)',
    '20/10 ข้อ 82: ไม่มียา (C406.5) ใช้คำตอบ 4 แถวเดิม ไม่มีแถว สงสัยว่าเป็นผลจากยา · แถว มีอาการรุนแรง ใช้อาการที่ต้องไปพบแพทย์ของการปรึกษานั้น (ผู้ใช้จริง: อาการแพ้ยาอย่างเดียว คนท้องเสียหาอาการตัวเองไม่เจอ) · ตอบแล้วปิดการติดตาม ตอบผิดแก้ได้ในวันเดียวกันที่ C407'],
  wait: ['รายการอาการรุนแรงจริงจากเภสัชกร (ตอนนี้เป็นตัวอย่าง)'],
  prep(S) {
    const st = S.st.fucheck; if (!st) return;
    if (st === 'sym') { S._fuSeen = S.case; const q = mockSym('symdue'); S.follow = q; ensureSrc(S, q.src); S._fuErrShow = false; S.storeOpen = TP.flag('storeOpen'); TP.emit('state'); return; }
    if (F()?.sym) { S._fuSeen = S.case; S.follow = mockPlan('normal'); }
    const p = ensure(S); p.on = true; p.end = ''; if (p.today > p.days) p.today = 3;
    p.checks = p.checks.filter(x => x.at !== 'mid');
    /* "ส่งไม่สำเร็จ" opens as the moment after a failed send: the note shows once, the next tap goes through */
    S._fuErrShow = st === 'error';
    S.storeOpen = st === 'closed' ? false : TP.flag('storeOpen'); TP.emit('state');
  },
  mount(el) { if (!TP.S._fuErrShow) return; TP.S._fuErrShow = false; const box = $('#fuErr', el); if (box) box.hidden = false; },
  render(ctx) {
    const S = ctx.S, p = ensure(S), w = fam(p.src.who), day = cday(p);
    const at = AT[ctx.params.at] ? ctx.params.at : S.st.fucheck === 'self' ? 'self' : midDue(p) ? 'mid' : symDue(p) ? 'once' : 'self';
    return ui.nav({ back: backL('follow'), title: 'บอกอาการ' }) + ui.page(`
      <div class="fu-anss" data-in="1">${['better', 'same', 'worse'].map(k => ansBtn(k, at)).join('')}</div>
      <div class="fu-anss mt16" data-in="2">${ansBtn('danger', at, p.sym ? { danger: [ANS.danger[0], ANS.danger[1], symDanger(p)] } : ANS)}</div>
      <p class="fu-exp fu-exp-s" data-in="3">${ic('send', 16, 2)}<span>${esc(checkNote(S, p))}</span></p>
      <div id="fuErr" class="mt12" hidden>${ui.note('<b>ส่งไม่สำเร็จ ยังไม่ถึงเภสัชกร</b><br>ตรวจอินเทอร์เน็ตแล้วแตะคำตอบอีกครั้ง', { tone: 'danger', icon: 'wifi-off' })}</div>
      ${p.sym ? '' : `<div class="mt16" data-in="4">${ui.group([adrRow(S, p)])}</div>`}
      ${footHtml(p)}`, { lt: `ตอนนี้${w ? firstN(w.name) : ''}อาการเป็นอย่างไร`, sub: p.sym ? `${AT[at]} · ปรึกษาเมื่อ ${esc(p.src.date)} · ส่งให้ ${esc(ph(p).short)}` : `${AT[at]} · วันที่ ${day} จาก ${p.days} · ส่งให้ ${esc(ph(p).short)}` });
  }
});
TP.act('fuAns', async t => {
  const S = TP.S, p = F(), el = curEl(), k = t.dataset.v, at = AT[t.dataset.at] ? t.dataset.at : 'self';
  if (!p || !el || !ANS[k] || t.classList.contains('busy')) return;
  /* danger never waits for the network: the hospital + 1669 screen shows at once, the answer is sent behind it */
  if (k !== 'danger') {
    const all = $$('.fu-ans', el); all.forEach(b => { if (b !== t) b.disabled = true; });
    t.classList.add('busy'); t.setAttribute('aria-busy', 'true');
    await TP.wait(RM() ? 50 : 650);
    /* no internet (C405 "ไม่มีเน็ต"): the answer cannot reach the pharmacist, say so and let them tap again */
    if (p.offline) {
      t.classList.remove('busy'); t.removeAttribute('aria-busy'); all.forEach(b => { b.disabled = false; });
      const box = $('#fuErr', el); if (box) { box.hidden = false; shake(box); box.scrollIntoView({ block: 'nearest', behavior: RM() ? 'auto' : 'smooth' }); }
      TP.live('ส่งไม่สำเร็จ ยังไม่ถึงเภสัชกร แตะคำตอบอีกครั้ง'); return;
    }
  }
  const day = p.sym ? p.today : cday(p), c = { at, day, date: p.sym ? addD(p.start, p.today) : dateOf(p, day), time: now(), mood: k };
  if (at === 'mid' || at === 'once') p.checks = p.checks.filter(x => x.at !== at);
  /* the one no-medicine question ends the follow-up (item 82) */
  if (at === 'once') p.end = k;
  p.checks.push(c); p.contact = null; S.st.furesult = (p.sym && (k === 'better' || k === 'same') ? 'sym' : '') + kindOf(c); TP.emit('state');
  TP.go('furesult', { replace: true, via: k === 'danger' ? 'fade' : 'push' });
});

/* =====================================================================
   C407 Answer sent: lean like the LMA reply (one line per answer) + who got it, when
   ===================================================================== */
const resTop = (tone, icon, title, body, sent, tel = '') => `<div class="fu-res" data-in="0"><span class="fu-badge ${tone}">${ic(icon, 36, 1.8)}</span><h2 class="h2">${esc(title)}</h2><p class="body">${esc(body)}</p>${tel}${sent ? `<p class="fu-sentl">${ic('send', 14, 2)}<span>${esc(sent)}</span></p>` : ''}</div>`;
TP.screen('furesult', {
  group: 'after', title: 'ส่งคำตอบแล้ว', code: 'C407', parent: 'follow',
  states: [['better', 'ดีขึ้น'], ['same', 'เหมือนเดิม'], ['worse', 'แย่ลง'], ['danger', 'มีอาการรุนแรง'], ['closed', 'แย่ลง ตอนร้านปิด'], ['symbetter', 'ไม่มียา ดีขึ้น'], ['symsame', 'ไม่มียา เหมือนเดิม'], ['late', 'แย่ลง ก่อนร้านปิดไม่ถึง 2 ชั่วโมง']],
  notes: ['19/10 เจ้าของสั่ง "เอา lma เดิมมาดูว่าเราวาง flow ไว้ยังไง ขอ lean": LMA ตอบกลับข้อความเดียวต่อคำตอบ จึงเหลือ ไอคอน + 1 ประโยค + ส่งถึงใครเมื่อไร + ปุ่มกลับ · ตัดตารางสรุปคำตอบออก',
    'ดีขึ้น = ขอบคุณ กินต่อให้ครบ · เหมือนเดิม = กินต่อตามเวลา บอกได้ทุกเมื่อ · ทั้งสองบอกว่าเภสัชกรจะถามครั้งถัดไปเมื่อไร',
    'แย่ลง = ร้านติดต่อกลับภายใน 2 ชั่วโมงในเวลาทำการ (เจ้าของเคาะ) · ร้านปิด = เห็นตอน 09:00 ติดต่อกลับภายใน 11:00 · ไม่อยากรอ ปรึกษาใหม่ได้ (เติมอาการให้แล้ว)',
    'เจ้าของเคาะ 20/10 ข้อ 72 "ให้กรอบเวลามันเป็นไปได้จริงหน่อยกับเวลาเปิดปิดร้าน": 2 ชั่วโมงนับเฉพาะเวลาร้านเปิด 09:00-21:00 · แจ้ง 13:40 ติดต่อกลับก่อน 15:40 · แจ้ง 20:15 วันนี้เหลือ 45 นาที นับต่อพรุ่งนี้ ติดต่อกลับก่อน 10:15 พรุ่งนี้ (C407.8) · แจ้งตอนร้านปิด ก่อน 11:00 · ทุกจอบอกให้ไปโรงพยาบาลหรือโทร 1669 ถ้าอาการรุนแรง · ตรงกับคอนโซล S401.12',
    'มีอาการรุนแรง = ไปโรงพยาบาลทันที + โทร 1669 + โทรหาร้าน · 1669 อยู่เฉพาะจออาการรุนแรง',
    '20/10 ข้อ 82 ไม่ได้จ่ายยา (C407.6-7): ไม่พูดเรื่องกินยา ให้ดูแลตามใบสรุป · ปุ่มกลับหน้าแรก เพราะปิดการติดตามแล้ว · แย่ลง/รุนแรง ใช้จอเดิม'],
  wait: ['คำแนะนำตอน "เหมือนเดิม" ต้องให้เภสัชกรยืนยันถ้อยคำ'],
  prep(S) {
    const st = S.st.furesult; if (!st) return;
    if (st === 'symbetter' || st === 'symsame') { S._fuSeen = S.case; const q = mockSym('symdue'), m = st.slice(3); q.checks.push({ at: 'once', day: 1, date: TP.NOW.date, time: '14:10', mood: m }); q.end = m; S.follow = q; ensureSrc(S, q.src); S.storeOpen = TP.flag('storeOpen'); TP.emit('state'); return; }
    if (F()?.sym) { S._fuSeen = S.case; S.follow = mockPlan('normal'); }
    const p = ensure(S); p.on = true; p.end = ''; if (p.today > p.days) p.today = 3;
    const day = cday(p); p.checks = p.checks.filter(x => x.at !== 'mid'); p.contact = null;
    p.checks.push({ at: 'mid', day, date: dateOf(p, day), time: { danger: '14:05', worse: '13:40', closed: '22:05', late: '20:15' }[st] || now(), mood: ['better', 'same', 'danger'].includes(st) ? st : 'worse' });
    S.storeOpen = st === 'closed' ? false : TP.flag('storeOpen'); TP.emit('state');
  },
  render(ctx) {
    const S = ctx.S, p = ensure(S), c = lastCheck(p) || { at: 'self', day: cday(p), time: now(), mood: 'better' };
    const kind = String(S.st.furesult || kindOf(c)).replace(/^sym/, ''), P = ph(p), sent = `ส่งถึง ${P.short} แล้ว ${c.time}`;
    const nav = ui.nav({ back: backL('follow'), title: '' }), back = (k = 'primary') => ui.btn('กลับไปหน้าติดตาม', { kind: k, a: 'fuBackFollow' });
    const next = `<p class="fu-foot" data-in="1">${ic('calendar-check', 14, 2)}<span>${esc(nextAsk(p))}</span></p>`;
    if (p.sym && (kind === 'better' || kind === 'same')) {
      /* item 82: no medicine to keep taking; the one question closes the follow-up, so home is the way out */
      const out = c.at === 'once' ? ui.btn('กลับหน้าแรก', { a: 'fuHome' }) : back();
      const body = kind === 'better' ? 'ดีใจที่อาการดีขึ้น ดูแลตัวเองตามคำแนะนำในใบสรุปต่อ ถ้ามีอาการอีก ปรึกษาเภสัชกรได้ทุกเมื่อ' : 'ดูแลตัวเองตามคำแนะนำในใบสรุปต่อ ถ้าอาการไม่ดีขึ้น หรืออยากให้เภสัชกรดูอีกครั้ง ปรึกษาได้เลย';
      /* real-user 20/10: one tap closes the follow-up, so a wrong tap can be taken back the same day */
      const fix = c.at === 'once' && c.day === p.today ? `<div class="fu-fix" data-in="2">${ui.btn('ตอบผิด แก้คำตอบ', { kind: 'ghost', sm: true, a: 'fuReAns', icon: 'rotate-ccw' })}</div>` : '';
      return nav + ui.page(`${resTop(kind === 'better' ? 'ok' : '', ANS[kind][1], 'ขอบคุณที่บอกอาการ', body, sent)}${next}${fix}`) +
        ui.dock(out + (kind === 'same' ? ui.btn(S.storeOpen ? 'ปรึกษาเภสัชกรตอนนี้' : 'ฝากคำถามถึงเภสัชกร', { kind: 'ghost', a: 'fuConsult', icon: 'message-circle' }) : inHist(S, p.src.id) ? ui.btn('ดูใบสรุปการปรึกษา', { kind: 'ghost', go: 'summary', p: { id: p.src.id } }) : ''));
    }
    if (kind === 'better') return nav + ui.page(`${resTop('ok', 'smile', 'ขอบคุณที่บอกอาการ', 'ดีใจที่อาการดีขึ้น กินยาต่อให้ครบตามที่เภสัชกรแนะนำ', sent)}${next}`) + ui.dock(back());
    if (kind === 'same') {
      return nav + ui.page(`${resTop('', 'meh', 'ขอบคุณที่บอกอาการ', 'กินยาต่อตามเวลา บางอาการใช้เวลา 2-3 วันกว่าจะดีขึ้น ถ้าแย่ลง บอกเภสัชกรได้ทุกเมื่อ', sent)}${next}`) +
        ui.dock(back() + ui.btn(S.storeOpen ? 'ปรึกษาเภสัชกรตอนนี้' : 'ฝากคำถามถึงเภสัชกร', { kind: 'ghost', a: 'fuConsult', icon: 'message-circle' }));
    }
    if (kind === 'danger') {
      return nav + ui.page(`<div class="fu-danger fu-sev" data-in="0" role="alert">
          <p class="fu-danger-h">${ic('octagon-alert', 24, 2)}<b>ไปโรงพยาบาลทันที ไม่ต้องรอเภสัชกร</b></p>
          <p>อาการที่แจ้งอาจรุนแรง ไปโรงพยาบาลใกล้ที่สุด ถ้าไปเองไม่ไหว โทรสายด่วนฉุกเฉิน</p>${call1669()}</div>
        <p class="fu-sentl fu-left" data-in="1">${ic('send', 14, 2)}<span>${esc(sent)} · ${S.storeOpen ? 'ร้านจะโทรหาคุณโดยเร็วที่สุด แต่อย่ารอ' : 'ร้านปิดอยู่ เภสัชกรจะเห็นเมื่อร้านเปิด 09:00 อย่ารอ'}</span></p>${telLine(p)}
        ${ui.callHelp({ branch: p.src.branch, din: 2 })}`) + ui.dock(back('secondary'));
    }
    const closed = kind === 'closed' || !S.storeOpen;
    const late = !closed && backLate(c);
    return nav + ui.page(`${resTop('warn', closed ? 'moon' : 'phone', closed ? 'เภสัชกรจะเห็นเมื่อร้านเปิด 09:00' : late ? `ร้านจะติดต่อกลับภายใน ${backBy(c)}` : 'ร้านจะติดต่อกลับภายใน 2 ชั่วโมง',
        closed ? 'และจะติดต่อกลับภายใน 11:00 ทางโทรศัพท์หรือข้อความในแอป' : late ? `ร้านปิด 21:00 จึงนับเวลาต่อตอนร้านเปิด 09:00 ${P.short} จะโทรหรือส่งข้อความในแอปก่อน ${backBy(c)}` : backBy(c) ? `${P.short} จะโทรหรือส่งข้อความในแอปก่อน ${backBy(c)} ถ้าเลยเวลานี้ยังไม่มีใครติดต่อ กดปรึกษาตอนนี้ได้เลย` : `${P.short} จะโทรหรือส่งข้อความในแอป ในเวลาทำการ ${HOURS}`, sent, telLine(p, ' c'))}
      <div class="mt16" data-in="1">${dangerNote()}</div>`) +
      ui.dock(back() + ui.btn(closed ? 'ฝากคำถามถึงเภสัชกร' : 'ไม่อยากรอ ปรึกษาตอนนี้', { kind: 'ghost', a: 'fuConsult', icon: 'message-circle' }));
  }
});

TP.act('fuReAns', () => { const p = F(); if (!p?.sym) return; p.checks = p.checks.filter(x => x.at !== 'once'); p.end = ''; TP.emit('state'); TP.go('fucheck', { replace: true, params: { at: 'once' } }); });

/* =====================================================================
   C408 Log: one line per day + the one or two answers (owner: not a detailed diary)
   ===================================================================== */
function logHtml(p) {
  const { tk, n } = doseStats(p), last = cday(p), dayRows = [];
  for (let d = 1; d <= last; d++) {
    const ds = daySlots(p, d), t = ds.filter(x => x.st === 'taken').length, miss = ds.filter(x => x.st === 'missed' || x.st === 'late');
    const today = d === p.today, title = `วันที่ ${d} · ${dateOf(p, d)}${today ? ' · วันนี้' : ''}`;
    if (!ds.length) { dayRows.push(ui.row({ icon: 'pill', title, sub: 'กินเมื่อมีอาการ' })); continue; }
    const sub = miss.length ? `${today ? 'ยังไม่ได้กิน' : 'ลืม'}มื้อ${miss.map(x => SLOT[x.s][0]).join(' ')} · กิน ${t} จาก ${ds.length} มื้อ` : today ? `กินแล้ว ${t} จาก ${ds.length} มื้อ ถึงตอนนี้` : `กิน ${t} จาก ${ds.length} มื้อ`;
    dayRows.push(ui.row({ icon: 'pill', title, sub, tag: miss.length ? [today ? `ยังไม่ได้กิน ${miss.length} มื้อ` : `ลืม ${miss.length} มื้อ`, 'warn'] : today && t < ds.length ? null : ['ครบทุกมื้อ', 'ok'] }));
  }
  if (p.today < p.days) dayRows.push(ui.row({ icon: 'calendar', title: `วันที่ ${p.today + 1}${p.today + 1 < p.days ? ` ถึง ${p.days}` : ''}`, sub: 'ยังไม่ถึง' }));
  p.meds.filter(m => m.prn).forEach(m => { const tot = Object.entries(p.prn).filter(([k]) => k.endsWith('|' + m.id)).reduce((a, [, l]) => a + l.length, 0); if (tot) dayRows.push(ui.row({ icon: /ไข้/.test(m.prn) ? 'thermometer' : 'pill', title: m.name, sub: `กิน${m.prn} รวม ${tot} ครั้ง` })); });
  const ck = (at, day, date) => { const c = chk(p, at), due = at === 'mid' ? midDue(p) : endDue(p); return ui.row({ icon: 'message-circle', title: AT[at], sub: `${day ? `วันที่ ${day} · ` : ''}${date}${c ? ` · ตอบ ${c.time}` : ''}`, tag: c ? [MOOD[c.mood][0], MOOD[c.mood][1]] : !due ? ['ยังไม่ถึง', 'muted'] : at === 'mid' && p.today > p.mid ? ['ยังไม่ได้ตอบ', 'warn'] : [at === 'mid' ? 'วันนี้' : 'ถึงเวลาแล้ว', 'solid'] }); };
  const ckRows = [...(p.mid ? [ck('mid', p.mid, dateOf(p, p.mid))] : []), ...p.checks.filter(c => c.at === 'self').map(c => ui.row({ icon: 'message-circle', title: 'บอกเอง', sub: `วันที่ ${c.day} · ${c.date} · ${c.time}`, tag: [MOOD[c.mood][0], MOOD[c.mood][1]] })), ck('end', 0, dateOf(p, p.days + 1))];
  const asked = p.checks.filter(c => c.at !== 'self').length, plan = p.mid ? 2 : 1;
  return `<div class="card fu-stats" data-in="1"><div><b class="num">${tk}<small> / ${n}</small></b><span>มื้อที่กินแล้ว</span></div><div><b class="num">${asked}<small> / ${plan}</small></b><span>ครั้งที่ตอบเภสัชกร</span></div></div>
    <div data-in="2">${ui.group(dayRows, { title: 'การกินยา' })}</div><div data-in="3">${ui.group(ckRows, { title: 'เภสัชกรถามอาการ' })}</div>${footHtml()}`;
}
TP.screen('fulog', {
  group: 'after', title: 'บันทึกการกินยา', code: 'C408', parent: 'follow',
  states: [['normal', 'ระหว่างคอร์ส'], ['done', 'ครบคอร์สแล้ว'], ['empty', 'เพิ่งเริ่ม ยังไม่มี'], ['loading', 'กำลังโหลด']],
  notes: ['19/10 เจ้าของสั่ง "ไม่ต้องตามละเอียดขนาดนั้น": เหลือวันละบรรทัด (ครบทุกมื้อ หรือลืมมื้อไหน) + คำตอบเภสัชกร 1-2 ครั้ง · ตัดไทม์ไลน์รายมื้อและข้อความที่เล่าออก',
    'ลืม / ครบ / ยังไม่ถึง เป็นข้อความ ไม่ใช้สีอย่างเดียว',
    'เภสัชกรเห็นสรุปเดียวกันนี้ในคอนโซล (S401)'],
  wait: ['เก็บบันทึกการกินยาและอาการนานเท่าไร'],
  prep(S) {
    const st = S.st.fulog; if (!st) return;
    S._fuSeen = S.case;
    if (st === 'empty') { S.follow = dayOnePlan(null); return; }
    const p = mockPlan('normal');
    if (st === 'done') { finish(p); p.end = 'healed'; p.checks.push({ at: 'end', day: p.days + 1, date: dateOf(p, p.days + 1), time: '19:10', mood: 'healed' }); }
    S.follow = p; ensureSrc(S, p.src);
  },
  render(ctx) {
    const p = F(), nav = ui.nav({ back: backL('follow'), title: 'บันทึกการกินยา' });
    if (ctx.state === 'loading') return nav + ui.page(`<div aria-busy="true" aria-label="กำลังโหลดบันทึก">${ui.skel('100%', 84, 14)}<div class="mt24">${ui.skel('100%', 230, 14)}</div><div class="mt24">${ui.skel('100%', 120, 14)}</div></div>`, { lt: 'บันทึกการกินยา' });
    const any = p && (Object.keys(p.log).length || Object.values(p.prn).some(a => a.length) || p.checks.length);
    if (!any) return nav + ui.page(ui.empty({ title: 'ยังไม่มีบันทึก', body: 'เมื่อกด กินแล้ว หรือตอบเภสัชกรเรื่องอาการ จะเก็บไว้ที่นี่', btn: p ? { label: 'กลับไปหน้าติดตาม', a: 'fuBackFollow' } : undefined, art: emArt('history') }), { lt: 'บันทึกการกินยา' });
    return nav + ui.page(logHtml(p), { lt: 'บันทึกการกินยา', sub: `จากการปรึกษา ${esc(p.src.date)} · ${esc(ph(p).short)}` });
  },
  mount(el, ctx) { if (ctx.state === 'loading') ctx.later(() => { ctx.S.st.fulog = 'normal'; TP.refresh(); }, 1200); }
});

/* =====================================================================
   C409 Course finished: the pharmacist's last question (2 big rows, same as C406)
   ===================================================================== */
TP.screen('fudone', {
  group: 'after', title: 'ครบคอร์สยาแล้ว', code: 'C409', parent: 'follow',
  states: [['ask', 'ถามหลังครบคอร์ส'], ['healed', 'หายดีแล้ว'], ['still', 'ยังมีอาการ']],
  notes: ['19/10 เจ้าของสั่ง "ตามทีเดียวตอนจบคอร์สก็ได้": คำถามสุดท้ายของเภสัชกร 2 ทางเลือก หายดีแล้ว / ยังมีอาการ แถวใหญ่แบบเดียวกับ C406 แตะเดียวส่ง',
    'หายดี = ปิดการติดตาม หยุดเตือน + วิธีเก็บยาที่เหลือ · ยังมีอาการ = ชวนปรึกษาใหม่ + ช่องทางติดต่อคน',
    'ไม่ถามซ้ำหลังจบคอร์สแล้ว · จำลองวันที่ 21/10/2026'],
  wait: ['คำแนะนำเรื่องยาที่เหลือ ต้องให้เภสัชกรยืนยัน'],
  prep(S) {
    const st = S.st.fudone; if (!st) return;
    S._fuSeen = S.case;
    const p = mockPlan('normal'); finish(p);
    if (st !== 'ask') { p.end = st; p.checks.push({ at: 'end', day: p.days + 1, date: dateOf(p, p.days + 1), time: '19:10', mood: st }); }
    S.follow = p; ensureSrc(S, p.src);
  },
  render(ctx) {
    const S = ctx.S, p = ensure(S), st = p.end || 'ask', w = fam(p.src.who), { tk, n } = doseStats(p), mc = chk(p, 'mid');
    S.st.fudone = st;
    const stats = din => `<div class="card fu-said" data-in="${din}">${ui.kv([['กินยาตามเวลา', `${tk} จาก ${n} มื้อ`], ...(mc ? [['กลางคอร์สตอบว่า', esc(MOOD[mc.mood][0])]] : []), ['ผู้ดูแล', esc(ph(p).name)]])}</div>`;
    const nav = ui.nav({ back: backL('follow'), title: '' });
    if (st === 'healed') {
      return nav + ui.page(`${resTop('ok', 'circle-check', 'ขอบคุณที่บอก', 'ปิดการติดตามของแผนนี้แล้ว ไม่มีแจ้งเตือนกินยาอีก')}${stats(1)}
        <div class="mt12" data-in="2">${ui.note('<b>ยาที่เหลือ</b> เก็บในที่แห้ง พ้นแสงและมือเด็ก ไม่แบ่งให้คนอื่นใช้ ถ้ามีอาการอีก ปรึกษาเภสัชกรได้ทุกเมื่อ', { icon: 'info' })}</div>${footHtml()}`) +
        ui.dock(ui.btn('กลับหน้าแรก', { a: 'fuHome' }) + ui.btn('ดูบันทึกการกินยา', { kind: 'ghost', go: 'fulog' }));
    }
    if (st === 'still') {
      return nav + ui.page(`${resTop('warn', 'triangle-alert', 'ควรปรึกษาเภสัชกรอีกครั้ง', 'กินยาครบแล้วยังมีอาการ อาจต้องเปลี่ยนยา หรือควรพบแพทย์')}
        <div class="mt12" data-in="1">${dangerNote()}</div>${ui.callHelp({ branch: p.src.branch, din: 2 })}<div class="mt16" data-in="3">${ui.group([adrRow(S, p)])}</div>`) +
        ui.dock(ui.btn(S.storeOpen ? 'เริ่มปรึกษาใหม่' : 'ฝากคำถามถึงเภสัชกร', { a: 'fuConsult', icon: 'message-circle' }) + ui.btn('กลับหน้าแรก', { kind: 'ghost', a: 'fuHome' }));
    }
    return nav + ui.page(`${resTop('', 'calendar-check', 'ครบคอร์สยาแล้ว', `ยาจากการปรึกษาวันที่ ${p.src.date} ครบ ${p.days} วันเมื่อ ${dateOf(p, p.days)}`)}${stats(1)}
      <h3 class="fu-h mt24" data-in="2">ตอนนี้${w ? esc(firstN(w.name)) : ''}อาการเป็นอย่างไร</h3>
      <div class="fu-anss" data-in="2">${['healed', 'still'].map(k => ansBtn(k, 'end', END, 'fuEnd')).join('')}</div>
      <p class="fu-exp fu-exp-s" data-in="3">${ic('send', 16, 2)}<span>${esc(S.storeOpen ? `แตะคำตอบเดียว ส่งถึง ${ph(p).short} ทันที นี่เป็นคำถามสุดท้ายของคอร์สนี้` : 'ร้านปิดอยู่ เภสัชกรจะเห็นคำตอบเมื่อร้านเปิด 09:00')}</span></p>${footHtml()}`);
  }
});
TP.act('fuEnd', async t => {
  const S = TP.S, p = F(), el = curEl(), v = t.dataset.v; if (!p || !END[v] || t.classList.contains('busy')) return;
  $$('.fu-ans', el).forEach(b => { if (b !== t) b.disabled = true; }); t.classList.add('busy'); t.setAttribute('aria-busy', 'true');
  await TP.wait(RM() ? 50 : 550);
  p.end = v; p.clock = ''; p.checks = p.checks.filter(x => x.at !== 'end');
  p.checks.push({ at: 'end', day: p.days + 1, date: dateOf(p, p.days + 1), time: TP.NOW.time, mood: v });
  S.st.fudone = v; TP.emit('state');
  TP.notify(v === 'healed' ? 'ปิดการติดตามแล้ว' : 'ส่งให้เภสัชกรแล้ว', { icon: 'check' });
  TP.refresh();
});

/* =====================================================================
   C410 Reminder sheet: one switch + meal times · C411 stop follow-up
   ===================================================================== */
TP.sheetDef('fureminder', {
  group: 'after', title: 'ตั้งเวลาเตือน', code: 'C410', host: 'follow', tall: true,
  states: [['normal', 'เปิดเตือน'], ['off', 'ปิดเตือนอยู่'], ['notifoff', 'ปิดแจ้งเตือนของแอป'], ['error', 'เวลาไม่เรียง']],
  notes: ['19/10 เจ้าของสั่ง "พอมีไอคอนติ้กถูกแล้ว บันทึกมันเลื่อนไม่กึ่งกลาง": คำว่า บันทึก อยู่กึ่งกลางปุ่มพอดีเหมือน ยกเลิก ไอคอนอยู่ข้างซ้ายโดยไม่ดันข้อความ (ปุ่มหยุดติดตาม C411 แก้แบบเดียวกัน)',
    '19/10 เจ้าของสั่ง "ตั้งเวลาเตือนต้องมีผลจริง": สวิตช์เดียว เตือนกินยา + เวลามื้อ · บันทึกแล้วกด "จำลองว่าถึงเวลากินยา" ในแผง จะเห็นแจ้งเตือนพร้อมปุ่ม กินแล้ว',
    'ปิดเตือน = ซ่อนเวลามื้อ ยังกด กินแล้ว ในหน้าติดตามได้ · ตัดสวิตช์เตือนทีละยาและเตือนตอบคำถามออก (คำถามเภสัชกรแจ้งเตือนเสมอ)',
    'เวลามื้อต้องเรียงจากเช้าไปก่อนนอน ผิด = บอกเหตุผล · ข้อความเตือนไม่บอกชื่อยาหรืออาการ (PDPA)'],
  wait: ['ข้อความเตือน "ถึงเวลากินยามื้อเย็น" พอไหม หรือต้องกลางกว่านี้'],
  prep(S) {
    if (F()?.sym) { S._fuSeen = S.case; S.follow = mockPlan('normal'); }
    const st = S.st.fureminder, p = ensure(S); p.on = true; p.end = ''; if (p.today > p.days) p.today = 3;
    if (!st) return;
    S.notif = st !== 'notifoff'; p.remind = st !== 'off';
    S._fuRemBad = st === 'error'; /* shown once by mount: lunch typed before breakfast */
    TP.emit('state');
  },
  render() {
    const S = TP.S, p = ensure(S), used = SLOTS.filter(s => medsAt(p, s).length);
    const timeRows = used.map(s => `<label class="row fu-trow" for="fuT-${s}"><span class="r-ic">${ic(SLOT[s][1], 19, 1.9)}</span><span class="r-t"><b>${SLOT[s][0]}</b><span>${esc(medsAt(p, s).map(m => m.name + (m.meal ? ' ' + m.meal : '')).join(' · '))}</span></span><input type="time" class="fu-time" id="fuT-${s}" value="${esc(p.times[s])}" step="300"></label>`);
    return `${S.notif ? '' : `<div class="fu-mb">${ui.note('<b>การแจ้งเตือนของแอปปิดอยู่</b><br>ตั้งเวลาไว้ได้ แต่จะไม่มีแจ้งเตือนจนกว่าจะเปิด', { tone: 'warn', icon: 'bell-off' })}<div class="mt8">${ui.btn('เปิดการแจ้งเตือน', { kind: 'tint', sm: true, a: 'fuNotifOn', icon: 'bell' })}</div></div>`}
      ${ui.group([ui.switchRow({ icon: 'bell', title: 'เตือนกินยา', sub: remSub(p.remind), on: p.remind, id: 'fuR-on', a: 'fuRemSw' })])}
      ${used.length ? rvHtml('fuTimes', p.remind, ui.group(timeRows, { title: 'เวลามื้อของคุณ', foot: 'ปรับให้ตรงกับเวลากินข้าวจริง แอปจะเตือนตามเวลานี้' })) : ''}
      <p class="fu-err" id="fuRemErr" role="alert" hidden>${ic('circle-x', 16, 2)}<span></span></p>
      <p class="fu-foot fu-left">${ic('message-circle', 14, 2)}<span>คำถามอาการจากเภสัชกร แจ้งเตือนเวลา ${esc(p.askAt)} ของวันที่ถามเสมอ</span></p>
      <p class="fu-foot fu-left">${ic('lock', 14, 2)}<span>ข้อความเตือนไม่บอกชื่อยาหรืออาการ เช่น "ถึงเวลากินยามื้อเย็น"</span></p>`;
  },
  foot: () => ui.btn('บันทึก', { a: 'fuRemSave', icon: 'check', cls: 'fu-cbtn' }) + ui.btn('ยกเลิก', { kind: 'ghost', closeSheet: true }),
  mount(el) {
    if (!TP.S._fuRemBad) return;
    TP.S._fuRemBad = false;
    const n = $('#fuT-n', el); if (n) { n.value = '07:30'; checkTimes(el, false); }
  }
});
const remSub = on => (on ? 'แจ้งเตือนในแอปตามเวลามื้อ แตะ กินแล้ว ในแจ้งเตือนได้เลย' : 'ปิดอยู่ ไม่มีแจ้งเตือน ยังกด กินแล้ว ในหน้าติดตามได้');
const badTimes = vals => vals.map((v, i) => !v || (i > 0 && !!vals[i - 1] && v <= vals[i - 1]));
const timeMsg = vals => (vals.some(v => !v) ? 'ใส่เวลาให้ครบทุกมื้อ' : 'เวลามื้อต้องเรียงจากเช้าไปก่อนนอน และไม่ซ้ำกัน');
/* marks wrong meal times and says why; returns the values when they are fine */
function checkTimes(sh, loud = true) {
  const used = SLOTS.filter(s => $('#fuT-' + s, sh)), vals = used.map(s => $('#fuT-' + s, sh).value), bad = badTimes(vals);
  used.forEach((s, i) => { const inp = $('#fuT-' + s, sh); inp.classList.toggle('err', bad[i]); if (bad[i]) inp.setAttribute('aria-invalid', 'true'); else inp.removeAttribute('aria-invalid'); });
  const err = $('#fuRemErr', sh);
  if (bad.some(Boolean)) { const msg = timeMsg(vals); $('span', err).textContent = msg; err.hidden = false; if (loud) { shake(err); TP.live(msg); } return null; }
  if (err) err.hidden = true;
  return { used, vals };
}
TP.act('fuRemSw', t => {
  const on = t.getAttribute('aria-checked') === 'true', sub = t.closest('.row')?.querySelector('.r-t span');
  rv($('#fuTimes', $('#sheet')), on); if (sub) sub.textContent = remSub(on);
  if (!on) { const err = $('#fuRemErr', $('#sheet')); if (err) err.hidden = true; }
});
TP.act('fuRemSave', async t => {
  const S = TP.S, p = F(), sh = $('#sheet'); if (!p || !sh) return;
  const on = $('#fuR-on', sh)?.getAttribute('aria-checked') === 'true';
  const ok = on ? checkTimes(sh) : { used: [], vals: [] }; if (!ok) return;
  ok.used.forEach((s, i) => { p.times[s] = ok.vals[i]; });
  p.remind = on; S._fuRemBad = false;
  t.classList.add('busy'); await TP.wait(RM() ? 50 : 450);
  TP.emit('state'); await TP.closeSheet();
  const nx = upNext(p);
  TP.notify(!on ? 'ปิดเตือนกินยาแล้ว' : nx ? `ตั้งเวลาแล้ว จะเตือนมื้อ${SLOT[nx.s][0]} ${p.times[nx.s]}` : 'บันทึกเวลาเตือนแล้ว', { icon: on ? 'alarm-clock' : 'bell-off' });
  if (TP.cur()?.id === 'follow') TP.refresh({ anim: false });
});
TP.sheetDef('fuoff', {
  group: 'after', title: 'หยุดติดตาม', code: 'C411', host: 'follow',
  notes: ['ยืนยันก่อนหยุด · ไม่ลบบันทึกเดิม · เปิดอีกครั้งได้จากหน้าติดตาม', 'ย้ำว่ายังกินยาตามที่เภสัชกรแนะนำ และปรึกษาได้ทุกเมื่อ', '19/10: ข้อความปุ่ม หยุดติดตาม อยู่กึ่งกลางพอดีเหมือน ยกเลิก (แก้แบบเดียวกับ C410)'],
  prep(S) { const p = ensure(S); p.on = true; if (p.sym) return; p.end = ''; if (p.today > p.days) p.today = 3; },
  render: () => F()?.sym ? `<div class="fu-sh-top"><span class="fu-ic">${ic('bell-off', 22, 1.9)}</span><p class="body">เภสัชกรจะไม่ถามอาการของการปรึกษานี้ ใบสรุปยังอยู่ เปิดติดตามอีกครั้งได้ทุกเมื่อ</p></div>
    <div class="mt12">${ui.note('ดูแลตัวเองตามคำแนะนำในใบสรุป ถ้าอาการแย่ลง ปรึกษาเภสัชกรได้ทุกเมื่อ', { icon: 'info' })}</div>` : `<div class="fu-sh-top"><span class="fu-ic">${ic('bell-off', 22, 1.9)}</span><p class="body">ไม่มีการเตือนกินยาและไม่ถามอาการของแผนนี้อีก บันทึกที่ผ่านมายังอยู่ เปิดติดตามอีกครั้งได้ทุกเมื่อ</p></div>
    <div class="mt12">${ui.note('ยังกินยาตามที่เภสัชกรแนะนำต่อ ถ้าอาการแย่ลง ปรึกษาเภสัชกรได้ทุกเมื่อ', { icon: 'info' })}</div>`,
  foot: () => ui.btn('หยุดติดตาม', { a: 'fuOff', icon: 'bell-off', cls: 'fu-cbtn' }) + ui.btn('ยกเลิก', { kind: 'ghost', closeSheet: true })
});
TP.act('fuOff', async t => {
  const p = F(); if (!p) return;
  t.classList.add('busy'); await TP.wait(RM() ? 50 : 450);
  p.on = false; TP.emit('state'); await TP.closeSheet();
  TP.notify('หยุดติดตามแล้ว', { icon: 'bell-off' });
  if (TP.cur()?.id === 'follow') TP.refresh({ anim: false });
});

/* =====================================================================
   In-app dose reminder: the app's push banner look (10-shell .banner) with a "กินแล้ว" action.
   #banner itself is one button, so this is its own element next to it.
   ===================================================================== */
let banEl = null, banT = 0;
function hideBan(instant) {
  clearTimeout(banT); const el = banEl; banEl = null; if (!el) return;
  if (instant || RM()) { el.remove(); return; }
  const a = A(el, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-130%)', opacity: 0 }], { d: 320, e: E.in, fill: 'forwards' });
  if (a?.finished) a.finished.then(() => el.remove(), () => el.remove()); else el.remove();
}
const reRender = () => { const id = TP.cur()?.id; if (!TP.sheetOpen() && ['follow', 'home', 'fulog'].includes(id)) return TP.refresh({ anim: false }); return Promise.resolve(); };
function doseBanner(p, day, s) {
  hideBan(true);
  const at = p.times[s], el = document.createElement('div');
  el.className = 'banner fu-ban'; el.setAttribute('role', 'alertdialog'); el.setAttribute('aria-label', `แจ้งเตือน ถึงเวลากินยามื้อ${SLOT[s][0]}`);
  el.innerHTML = `<button type="button" class="fu-ban-o" data-fuban="open"><span class="appicon">${TP.brand.plus(20)}</span><span class="bt"><small><span>MITRAREE</span><span>${esc(at)}</span></small><b>${esc(`ถึงเวลากินยามื้อ${SLOT[s][0]}`)}</b><span>แตะเพื่อดูรายการยา</span></span></button>
    <div class="fu-ban-a"><button type="button" class="btn primary sm" data-fuban="take">${ic('check', 18, 2.4)}<span>กินแล้ว</span></button><button type="button" class="btn secondary sm" data-fuban="later"><span>ไว้ทีหลัง</span></button></div>`;
  el.addEventListener('click', async e => {
    const b = e.target.closest('[data-fuban]'); if (!b) return;
    e.stopPropagation();
    const what = b.dataset.fuban; hideBan();
    if (what === 'take') {
      if (!medsAt(p, s).every(m => p.log[lk(day, s, m)]?.t)) takeSlot(p, day, s, at);
      TP.emit('state'); TP.notify(`บันทึกแล้ว กินยามื้อ${SLOT[s][0]} ${at}`, { icon: 'check' });
      await reRender(); if (TP.cur()?.id === 'follow' && !RM()) pop($(`.fu-take[data-v="${day}|${s}"]`, curEl()));
    } else if (what === 'open') { if (TP.cur()?.id === 'follow') reRender(); else TP.go('follow', { via: 'cover' }); }
    else TP.notify('กด กินแล้ว ได้ที่หน้าติดตามการใช้ยา', { icon: 'info' });
  });
  ($('#banner')?.parentElement || TP.phone).appendChild(el); banEl = el;
  TP.live(`ถึงเวลากินยามื้อ${SLOT[s][0]} ${at}`);
  if (!RM()) A(el, [{ transform: 'translateY(-130%) scale(.96)', opacity: 0 }, { transform: 'none', opacity: 1 }], { d: SP.spring.d, e: SP.spring.e, fill: 'backwards' });
  banT = setTimeout(() => hideBan(), 15000);
  setTimeout(() => el.querySelector('[data-fuban="take"]')?.focus({ preventScroll: true }), 60);
}
TP.on('screen', () => { if (banEl && !TP.S.follow) hideBan(true); });

/* =====================================================================
   Panel simulation: dose reminders, the pharmacist's question, course end, reply to "worse"
   ===================================================================== */
const doseLabel = () => { const p = TP.S.follow, nx = p && upNext(p); return nx ? `จำลองว่าถึงเวลากินยา (${whenPre(p, nx.day)}${SLOT[nx.s][0]} ${p.times[nx.s]})` : 'จำลองว่าถึงเวลากินยา'; };
TP.simAction?.({
  id: 'fuDose', get label() { return doseLabel(); }, when: S => !!upNext(S.follow),
  run() {
    const S = TP.S, p = S.follow, nx = p && upNext(p); if (!nx) return;
    /* the follow clock moves to that meal time (and to the next day when today is done) */
    p.today = nx.day; p.clock = p.times[nx.s]; TP.emit('state');
    reRender();
    if (!p.remind) { TP.notify('ปิดเตือนกินยาอยู่ แอปจึงไม่แจ้งเตือน', { icon: 'bell-off' }); return; }
    if (!S.notif) { TP.notify('การแจ้งเตือนของแอปปิดอยู่ จึงไม่มีแจ้งเตือน', { icon: 'bell-off' }); return; }
    doseBanner(p, nx.day, nx.s);
  }
});
TP.simAction?.({
  id: 'fuAskNow', label: 'จำลองแจ้งเตือนเภสัชกรถามอาการ', when: S => midDue(S.follow) || endDue(S.follow) || symWait(S.follow),
  run: () => {
    const p = TP.S.follow;
    /* no-medicine plan: the clock moves to the day of the question, then the notification */
    if (symWait(p)) { if (p.today < p.n) p.today = p.n; p.clock = p.askAt; TP.emit('state'); reRender(); TP.banner({ title: TP.FOLLOW_LOCK.fucheck[0], body: TP.FOLLOW_LOCK.fucheck[1], onTap: () => TP.go('fucheck', { params: { at: 'once' } }) }); return; }
    const end = endDue(p); TP.banner({ title: end ? 'ครบคอร์สยาแล้ว' : TP.FOLLOW_LOCK.fucheck[0], body: TP.FOLLOW_LOCK.fucheck[1], onTap: () => (end ? TP.go('fudone') : TP.go('fucheck', { params: { at: 'mid' } })) }); }
});
TP.simAction?.({
  id: 'fuEndNow', label: 'จำลองว่าครบคอร์สแล้ว (วันที่ 6)', when: S => active(S.follow) && !S.follow.waitRecv && !S.follow.sym,
  run() { const p = TP.S.follow; p.today = p.days + 1; p.clock = ''; hideBan(true); TP.emit('state'); reRender(); TP.notify('จำลอง: ครบคอร์ส 5 วันแล้ว', { icon: 'calendar-check' }); }
});
TP.simAction?.({
  id: 'fuReply', label: 'ตอบเรื่องอาการแย่ลง (ติดตามยา)', when: S => !!S.follow && !!recentBad(S.follow) && !S.follow.contact,
  run() {
    const S = TP.S, p = S.follow; if (!p) return;
    p.contact = { at: '14:40', text: 'ได้รับคำตอบแล้วค่ะ ขอสอบถามอาการเพิ่มอีกนิด จะโทรหาภายใน 15 นาที หรือเริ่มปรึกษาในแอปได้เลยค่ะ' };
    const n = { id: 'n' + Date.now().toString(36), kind: 'msg', title: 'มีข้อความใหม่จากเภสัชกร', body: 'แตะเพื่ออ่าน', time: `${TP.NOW.date} 14:40`, read: false, go: 'follow' };
    S.inbox.unshift(n); TP.emit('state');
    if (TP.cur()?.id === 'follow') { n.read = true; TP.refresh({ anim: false }); TP.notify('เภสัชกรตอบแล้ว', { icon: 'message-circle' }); }
    else TP.banner({ title: n.title, body: n.body, onTap: () => { n.read = true; TP.emit('state'); TP.go('follow'); } });
  }
});

/* item 82: the pharmacist closes without medicine and switches follow-up on (S305 default: ask tomorrow) */
TP.simAction?.({
  id: 'fuSymClose', label: 'ปิดเคส ไม่จ่ายยา + นัดถามอาการพรุ่งนี้', when: S => ['matched', 'room'].includes(S.case?.status) && (!S.case.order || S.case.order.status === 'cancelled'),
  run() { TP.S.case.followAsk = 'd1'; TP.sim.closeCase(); F(); TP.emit('state'); }
});

/* item 58: the pharmacist ticks the open report at close (prototype: always ticked when the consult came from the follow card) */
TP.followCaseClosed = c => {
  const S = TP.S, p = S.follow, b = recentBad(p); if (!S._fuTalk) return;
  S._fuTalk = false; if (!b) return;
  b.talked = { at: TP.roomNow?.() || now(), id: c.id }; p.contact = null;
};
F(); /* TP.S.follow exists from the start (panel restart: created again on first use) */
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
if (Q.get('first') === '1') Object.assign(TP.S, { firstTime: true, loggedIn: false, consent: false, notifAsked: false, notif: false, follow: null });
TP.panel.render();
if (Q.get('registry') === '1' && parent !== window) {
  const title = d => typeof d.title === 'function' ? d.title({ S: TP.S, params: {} }) : d.title;
  parent.postMessage({ tpRegistry: {
    version: TP.DESIGN_VERSION, groups: TP.GROUPS,
    items: TP.ORDER.map(TP.def).filter(d => !d.hidden).map(d => ({ id: d.id, kind: d.kind, group: d.group, title: title(d), code: d.code || '', states: d.states || [], parent: d.parent || '', host: d.host || '', notes: (d.notes || []).length, wait: (d.wait || []).length }))
  } }, '*');
}
const requested = Q.get('screen'), want = requested === 'branch' ? 'home' : requested === 'otp' ? 'login' : requested === 'consent' ? 'consents' : requested, st = ['branch','otp','consent'].includes(requested) ? null : Q.get('state');
if (['branch','otp','consent'].includes(requested)) { Q.set('screen', want); Q.delete('state'); history.replaceState(null, '', location.pathname + '?' + Q.toString() + location.hash); }
if (want && st) TP.S.st[want] = st;
let boot;
if (want && TP.def(want)) boot = TP.jump(want, { via: 'none' });
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


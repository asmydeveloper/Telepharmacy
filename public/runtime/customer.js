
/* ===== 00-core.js ===== */
/* =====================================================================
   00 · Core: utilities, springs, icons, odometer, money, mock data
   Everything hangs off one global: window.TP
   ===================================================================== */
const TP = window.TP = {};
const flowPreview = new URLSearchParams(location.search).get('flowPreview') === '1';
TP.caseCode = record => window.MitrareeConsultations.codeFor(record);
TP.consultationText = record => window.MitrareeConsultations.description(record);
/* Fictional generated portraits for the prototype. Doctor is an available asset,
   not a new clinical service or consultation route. */
TP.demoProfiles = {"doctor": "/assets/profiles/doctor.png", "kid": "/assets/profiles/kid.png", "mom": "/assets/profiles/mom.png", "pharmacist_f": "/assets/photos/pharmacist-v1.png", "pharmacist_m": "/assets/profiles/pharmacist_m.png", "self": "/assets/profiles/default-profile-2d-v1.png", "dad": "/assets/photos/family-dad-v1.png", "sp": "/assets/photos/family-spouse-v1.png", "kid2": "/assets/photos/family-younger-child-v1.png"};
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
  ['demo-5','ร้านยาพร้อมดูแล',10.2,'08:00-22:00'], ['demo-6','ร้านยาร่มเย็น',22.8,'09:00-21:00']
].map(([id,name,km,hours])=>({id,name,photo:`/assets/stores/${id==='demo-6'?'demo-5':id}-v1.png`,short:name,km,hours,demo:true,pharm:'kj',area:'ข้อมูลร้านตัวอย่าง',addr:'ที่อยู่ร้านตัวอย่าง',lic:'ข้อมูลตัวอย่าง',phone:'',map:''})));
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
  { name: 'ยาอมบรรเทาอาการเจ็บคอ', qty: '1 กล่อง', type: 'ยาอันตราย', price: 120, how: 'อมครั้งละ 1 เม็ด ทุก 3 ชั่วโมง ไม่เกิน 8 เม็ดต่อวัน', schedule: [{time:'เมื่อมีอาการ',instruction:'อมครั้งละ 1 เม็ด ทุก 3 ชั่วโมง ไม่เกิน 8 เม็ดต่อวัน'}] },
  { name: 'พาราเซตามอล 500 มก.', qty: '1 แผง', type: 'ยาสามัญประจำบ้าน', price: 40, how: 'ครั้งละ 1 เม็ด เมื่อปวดหรือมีไข้ ห่างกันอย่างน้อย 6 ชั่วโมง', schedule: [{time:'เมื่อมีอาการ',instruction:'เมื่อปวดหรือมีไข้ ครั้งละ 1 เม็ด ห่างกันอย่างน้อย 6 ชั่วโมง'}] },
  { name: 'สเปรย์พ่นคอ', qty: '1 ขวด', type: 'ยาอันตราย', price: 225, how: 'พ่น 2 ครั้ง วันละ 3 ครั้ง หลังอาหาร' }
];
/* Photo adapter: illustrative assets can be replaced by product.image from real data. */
TP.medicinePhoto = item => item.image || (/^อะม็อกซีซิลลิน 500 มก\.$/.test(item.name) ? '/assets/photos/amoxicillin-mock-v1.png' : /^ยาแก้ไอ ชนิดน้ำ$/.test(item.name) ? '/assets/photos/cough-syrup-mock-v1.png' : /^ยาแก้แพ้ ลดน้ำมูก$/.test(item.name) ? '/assets/photos/medicine-v1.png' : /ยาอม/.test(item.name) ? '/assets/photos/lozenges-v1.png' : /พาราเซตามอล 500/.test(item.name) ? '/assets/photos/medicine-v1.png' : /สเปรย์พ่นคอ/.test(item.name) ? '/assets/photos/spray-v1.png' : '');
TP.medicineImage = item => { const src = TP.medicinePhoto(item); return src ? `<img class="medicine-photo" src="${TP.esc(src)}" alt="ภาพประกอบ${TP.esc(item.name)}" width="56" height="56" loading="lazy">` : ''; };
/* 3 ways to receive, same order and words as the website checkout (cart-shipping-method.blade.php:407-457).
   delivery fees are mock quotes */
TP.DELIVERY = [
  { id: 'pickup', name: 'รับที่หน้าร้านสาขา', sub: '', fee: 0, icon: 'store' },
  { id: 'express', name: 'จัดส่งด่วน', sub: '1-4 ชม. · ไม่เกิน 15 กม. จากสาขา', fee: 89, icon: 'zap' },
  { id: 'parcel', name: 'จัดส่งปกติ', sub: 'ได้รับสินค้าภายใน 1-3 วันทำการ', fee: 25, icon: 'package' }
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
TP.FLAG0 = { storeOpen: true, sysOff: false, zoneLock: true, firstTime: false };
TP.flag = k => (TP.S.g && k in TP.S.g ? TP.S.g[k] : TP.FLAG0[k]);
TP.setFlag = (k, v) => { TP.S[k] = v; (TP.S.g || (TP.S.g = {}))[k] = v; };
/* opening a state (panel or link) starts from the default zone lock, so an unlocked sample never leaks into later screens
   (QA 21/10); only states made for the unlocked case (C209.4, C308.21) unlock it again in their prep. The panel switch still works on the open screen */
TP.prepState = (...defs) => { TP.setFlag('zoneLock', TP.FLAG0.zoneLock); defs.forEach(d => d?.prep?.(TP.S)); };
/* Preview-only inbox examples; live notifications remain in S.inbox. */
TP.previewInbox = (history) => {
 const summaryId=history===undefined?'TC-261002-0087':history.find(h=>h.summary)?.id;
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
 return samples.map(([days,at,kind,title,body,go],index)=>{const date=new Date(Date.UTC(y,m-1,d-days)),dateText=[String(date.getUTCDate()).padStart(2,'0'),String(date.getUTCMonth()+1).padStart(2,'0'),date.getUTCFullYear()].join('/');return {id:'preview-note-'+index,kind,title,body,time:dateText+' '+at,read:true,go:go==='summary'&&!summaryId?'history':go,...(go==='summary'&&summaryId?{p:{id:summaryId}}:{})};});
};
TP.fresh = () => ({
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
  zoneLock: true, loc: 'near', locDenySeen: false, locWarnSeen: false,   // zone lock = admin switch (default ON) · loc = mock phone position / permission
  case: null,                // see TP.newCase in 60-main
  /* the website account address book (customer_addresses): no labels like บ้าน/ที่ทำงาน, one main address, pin = has a confirmed map point */
  addrs: [
    { id: 'a1', first: 'สมใจ', last: 'ใจดี', phone: '0812345678', house: '88/12', alley: 'ซอยทวีวัฒนา 25', road: '', prov: 'กรุงเทพมหานคร', amp: 'ทวีวัฒนา', dist: 'ทวีวัฒนา', zip: '10170', main: true, pin: false },
    { id: 'a2', first: 'สมใจ', last: 'ใจดี', phone: '0812345678', house: '99/9', building: 'ชั้น 12', alley: '', road: 'พระรามที่ 4', prov: 'กรุงเทพมหานคร', amp: 'คลองเตย', dist: 'คลองเตย', zip: '10110', main: false, pin: true }
  ],
  history: [
    {id:'mock-history-expired',date:'18/10/2026',time:'13:10',who:'me',topic:'เจ็บคอ',note:'เจ็บคอมา 2 วัน กลืนแล้วเจ็บ',branch:'tw',pharm:'kj',orderNo:'MT2026101801',outcome:'payment-expired',summary:true,previewSummary:{meds:[],nomed:'ยังไม่ได้รับยา เนื่องจากไม่ได้ชำระเงินภายในเวลาที่กำหนด',advice:'เภสัชกรแนะนำให้พักผ่อน ดื่มน้ำ และสอบถามเภสัชกรหากอาการไม่ดีขึ้น'}} ,
    {id:'mock-history-paid',date:'17/10/2026',time:'10:20',who:'me',topic:'คัดจมูก น้ำมูก',note:'คัดจมูกและมีน้ำมูกมา 2 วัน',branch:'tw',pharm:'kj',orderNo:'MT2026101701',bought:160,order:{no:'MT2026101701',status:'paid',picked:true,items:[{name:'ยาอมบรรเทาอาการเจ็บคอ',qty:'1 กล่อง',price:120},{name:'พาราเซตามอล 500 มก.',qty:'1 แผง',price:40}],total:160,paid:{items:160,ship:0,fee:0,total:160,recv:'pickup',method:'promptpay',date:'17/10/2026',at:'10:45',got:'11:10'}},outcome:'order-complete',summary:true,previewSummary:{meds:[{name:'ยาอมบรรเทาอาการเจ็บคอ',qty:'1 กล่อง',how:'ใช้ตามคำแนะนำบนฉลาก'},{name:'พาราเซตามอล 500 มก.',qty:'1 แผง',how:'ใช้ตามคำแนะนำบนฉลาก'}],advice:'พักผ่อนให้เพียงพอ ดื่มน้ำสม่ำเสมอ และใช้ยาตามฉลาก หากอาการไม่ดีขึ้นให้ปรึกษาเภสัชกร',follow:'รับยาที่สาขาแล้ว'}} ,
    {id:'mock-history-silent',date:'16/10/2026',time:'14:35',who:'me',topic:'ปวดกล้ามเนื้อ',note:'ปวดกล้ามเนื้อหลังทำงาน',branch:'tw',pharm:'kj',outcome:'no-response',summary:true,previewSummary:{meds:[],nomed:'ไม่มีรายการยา เนื่องจากการสนทนาสิ้นสุดก่อนการสรุป',advice:'ไม่มีคำแนะนำที่บันทึกไว้ เนื่องจากการสนทนาสิ้นสุดก่อนเภสัชกรสรุป'}} ,
    {id:'mock-history-declined',date:'15/10/2026',time:'11:15',who:'me',topic:'สอบถามเรื่องยา',note:'สอบถามวิธีดูแลอาการเจ็บคอ',branch:'on',pharm:'tp',outcome:'declined-medicine',summary:true,previewSummary:{meds:[],nomed:'ไม่มีรายการยา ผู้รับบริการแจ้งว่าไม่รับยา',advice:'แนะนำให้พักผ่อนและดื่มน้ำ หากอาการไม่ดีขึ้นสามารถปรึกษาเภสัชกรได้อีกครั้ง'}} ,
    {id:'mock-history-no-meds',date:'14/10/2026',time:'09:30',who:'me',topic:'ปรึกษาการใช้ยา',note:'สอบถามวิธีใช้ยาที่มีอยู่',branch:'tw',pharm:'kj',outcome:'no-medicine',summary:true,previewSummary:{meds:[],nomed:'ไม่มีรายการยาในการปรึกษาครั้งนี้',advice:'เภสัชกรให้คำแนะนำการใช้ยาที่มีอยู่ และไม่มีการจ่ายยาเพิ่มเติม'}} ,
    {id:'mock-history-cancelled',date:'13/10/2026',time:'15:00',who:'me',topic:'ไอและระคายคอ',note:'ไอและระคายคอมา 1 วัน',branch:'tw',pharm:'kj',orderNo:'MT2026101301',outcome:'order-cancelled',summary:true,previewSummary:{meds:[],nomed:'ไม่ได้รับยา เนื่องจากยกเลิกคำสั่งซื้อ',advice:'ไม่มีคำแนะนำเพิ่มเติมที่บันทึกไว้'}} ,
    {id:'mock-history-ended',date:'12/10/2026',time:'13:00',who:'me',topic:'สอบถามเรื่องยา',note:'สอบถามเรื่องยาที่ใช้ประจำ',branch:'on',pharm:'tp',outcome:'customer-ended',summary:true,previewSummary:{meds:[],nomed:'ไม่มีรายการยา เนื่องจากการสนทนาสิ้นสุดก่อนสรุป',advice:'ไม่มีคำแนะนำที่บันทึกไว้ เนื่องจากผู้รับบริการจบการสนทนาก่อนเภสัชกรสรุป'}}
  ],
  inbox: TP.previewInbox(),
  st: {}                     // per-screen scenario picked in the panel: st[screenId] = key
});
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
  if(!sheet&&hist.at(-1)?.id==='room'&&TP.closedChatRoute?.()){
    if(cur?.id==='paid'&&TP.closedChatRoute().screen==='paid')return TP.go('home',{root:true,via:'uncover'});
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
function miniWanted() { const c = TP.S.case; return !!(c && (!c.who||c.who==='me') && ((c.order?.status==='paid'&&c.order.fulfillment&&c.order.fulfillment.status!=='delivered')||c.order?.status==='pending'||!['closed', 'cancelled', 'declined', 'expired'].includes(c.status))); }
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
  sheetEl.className = 'sheet' + (def.tall ? ' tall' : '') + (def.fullPage ? ' full-page' : '') + (def.cls ? ' ' + def.cls : '');
  sheetEl.innerHTML = `${def.fullPage?'':'<div class="grab" aria-hidden="true"></div>'}<header class="sh-h">${def.fullPage?`<button type="button" class="ibtn sh-back" data-close-sheet aria-label="ย้อนกลับ">${TP.ic('chevron-left',24,2)}</button>`:''}<h2 id="sheetTitle" tabindex="-1">${TP.esc(def.sheetTitle ? def.sheetTitle(ctx) : title)}</h2>${def.hideClose||def.fullPage ? '' : `<button type="button" class="sh-x" data-close-sheet aria-label="ปิด">${TP.ic('x', 18, 2.2)}</button>`}</header><div class="sh-b">${def.render(ctx)}</div>${def.foot ? `<div class="sh-f">${def.foot(ctx)}</div>` : ''}`;
  TP.icons(sheetEl);
  sheet = { id, def, ctx, entry, el:sheetEl, prevFocus: document.activeElement };
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
    await Promise.all([fin(A(sheetEl, [{ transform: getComputedStyle(sheetEl).transform === 'none' ? 'none' : getComputedStyle(sheetEl).transform }, { transform: s.def.fullPage?'translateX(105%)':'translateY(105%)' }], { d: 380, e: E.ios, fill: 'forwards' })),
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
    if (!sheet || sheet.def.locked || sheet.def.fullPage || !e.target.closest('.grab,.sh-h') || e.target.closest('button')) return;
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

/* ===== Preview event metadata: shared by runtime and Markdown generator ===== */
TP.previewEventPolicy={
 code:(code,state)=>`EV-${code}-${state||'default'}`,
 pageStates(id,states){
  // Every case of the page in registry order; retired cases, the paused map and removed queue cases stay hidden.
  return (states?.length?states:[['','ปกติ']]).filter(([key,label,enabled])=>enabled!==false&&!(['profile','addressedit','pay'].includes(id)&&(key.startsWith('map-')||['expmap','exppin','locdeny'].includes(key)))&&!(id==='home'&&['case-queue3','case-queue2'].includes(key)));
 },
 category(state,label){const text=state+' '+label;return /error|invalid|wrong|fail|national-id|ไม่ถูก|ผิด|ไม่สำเร็จ/.test(text)?'ข้อผิดพลาด':/empty|missing|ยังไม่กรอก|ไม่มีข้อมูล|ไม่ครบ/.test(text)?'ข้อมูลไม่ครบ / ว่าง':/expired|timeout|หมดเวลา|หมดอายุ/.test(text)?'เวลา / หมดอายุ':/consent|ยินยอม/.test(text)?'ความยินยอม':/loading|โหลด/.test(text)?'กำลังโหลด':/offline|เน็ต|สัญญาณ/.test(text)?'การเชื่อมต่อ': 'สถานะ / การใช้งาน';},
 describe(code,state,label){
 const specific={
 'C105:personal-edit':['เปิดข้อมูลส่วนตัวจากบัญชี','แสดงชื่อ วันเกิด เพศจากข้อมูลสมัคร เบอร์และเลขประชาชนปิดแก้ไข น้ำหนักและส่วนสูงแก้ในสมุดสุขภาพ บันทึกกลับต้นทางโดยไม่เปลี่ยนข้อมูลที่ล็อก'],
 'C105:personal-edit-invalid':['เว้นข้อมูลจำเป็นในหน้าแก้ข้อมูลส่วนตัว','ปุ่มบันทึกยังปิดอยู่ ข้อผิดพลาดอยู่ข้างช่อง และยกเลิกไม่เขียนข้อมูล'],
 'C511:normal':['พิมพ์คำยืนยันด้วยตนเอง','ปุ่มลบบัญชีสีแดงเปิดเมื่อพิมพ์ ยืนยัน ตรงกัน และปิดทันทีเมื่อแก้เป็นคำอื่น'],
 'C511:typed':['พิมพ์คำยืนยันครบ','ปุ่มลบเปิดเมื่อไม่มีเคสหรือรายการค้าง กดยกเลิกไม่ล้างข้อมูล'],
 'C511:save-error':['จำลองลบบัญชีไม่สำเร็จ','ข้อมูลยังอยู่ครบ แสดงข้อผิดพลาดในแผ่นเดิมและลองซ้ำได้'],
 'C211:normal':['ร้านโปรดตัวอย่าง 4 สาขา','มีรูป ชื่อ สถานะ ระยะทาง เรียงใกล้ก่อนไกล และไม่ซ้ำหัวข้อใหญ่'],
 'C211:outside':['มีร้านไกลเกิน 15 กม.','ร้านนอกระยะแสดงท้ายรายการ เปิดดูข้อมูลได้แต่เริ่มปรึกษาไม่ได้'],
 'C517:invalid':['เลือกระบุข้อมูลแต่ไม่กรอกข้อความ','แสดงข้อผิดพลาดข้างช่อง ไม่บันทึกหรือแตะหมวดอื่น'],
 'C517:allergies':['แก้ประวัติแพ้ยาที่ผู้ใช้ระบุ','คงข้อความหลายบรรทัด เปิดแก้เฉพาะแพ้ยา บันทึกเปลี่ยนเฉพาะแพ้ยา ยกเลิกไม่เปลี่ยนข้อมูล'],
 'C517:meds':['แก้ยาที่ใช้ประจำ','บันทึกข้อความต่อเนื่องเฉพาะยาประจำ ไม่แก้แพ้ยา โรค หรือข้อมูลส่วนอื่น'],
 'C517:conditions':['แก้โรคประจำตัว','ไม่มีและยังไม่ทราบแยกกัน ไม่อนุมานโรคจากช่องว่าง บันทึกเฉพาะหมวดนี้'],
 'C517:food':['แก้ประวัติแพ้อาหาร','คงการขึ้นบรรทัดในข้อความเดิม ยกเลิกไม่เขียนข้อมูล'],
 'C517:weight':['แก้น้ำหนัก','ช่องไม่บังคับ ถ้ากรอกต้องเป็นตัวเลขมากกว่า 0 ถึง 500 กก. ทศนิยม 1 ตำแหน่ง'],
 'C517:height':['แก้ส่วนสูง','ช่องไม่บังคับ ถ้ากรอกต้องเป็นตัวเลขมากกว่า 0 ถึง 300 ซม. ทศนิยม 1 ตำแหน่ง'],
 'C517:unknown':['เลือกยังไม่ทราบ','บันทึก unknown ไม่แปลงเป็นไม่มีประวัติ'],
 'C517:none':['เลือกไม่มี','บันทึก none เฉพาะหมวดที่เปิด โดยไม่เปลี่ยนหมวดอื่น'],
 'C105:empty':['เว้นข้อมูลจำเป็นในขั้นข้อมูลส่วนตัว','ปุ่มถัดไปยังใช้งานไม่ได้ กรอกข้อมูลจำเป็นให้ครบก่อน'],
 'C105:national-id-short':['เลขประชาชนมีเพียง 12 หลัก','แสดงข้อผิดพลาดใกล้ช่องเลขประชาชนและไม่ให้ไปขั้นถัดไป'],
 'C105:national-id-format':['เลขประชาชนมีตัวอักษรปน','แสดงข้อผิดพลาดรูปแบบ เมื่อแก้เป็นตัวเลขที่ถูกต้องข้อความผิดพลาดต้องหาย'],
 'C105:national-id-checksum':['เลขประชาชนครบ 13 หลัก แต่เลขตรวจสอบผิด','แจ้งว่าเลขประชาชนไม่ถูกต้อง แยกจากกรณีกรอกไม่ครบ'],
 'C105:address-missing-phone':['ไม่กรอกเบอร์ติดต่อในที่อยู่','แสดงข้อผิดพลาดเบอร์ที่จำเป็นและไม่ให้ผ่านขั้นที่อยู่'],
 'C105:address-invalid-phone':['กรอกเบอร์ติดต่อไม่ตรงรูปแบบมือถือ','แจ้งรูปแบบที่ถูกต้อง แก้แล้วผ่านได้โดยไม่ล้างชื่อและที่อยู่'],
 'C519:invalid-person':['กดบันทึกโดยไม่กรอกข้อมูลบุคคลธรรมดา','แสดงข้อความใต้ทุกช่องบังคับ ไม่บันทึก และยังอยู่ในฟอร์ม'],
 'C519:invalid-company':['กดบันทึกโดยไม่กรอกข้อมูลนิติบุคคล','แสดงข้อความใต้ทุกช่องบังคับรวมชื่อธุรกิจ ไม่บันทึก และยังอยู่ในฟอร์ม'],
 'C519:invalid-format':['กรอกเลขประจำตัวประชาชนและเบอร์ผิดรูปแบบ','แสดงข้อความเฉพาะสองช่องนั้น ข้อมูลอื่นยังอยู่ แก้ถูกแล้วข้อความหาย'],
 'C514:main-changed':['กดตั้งเป็นที่อยู่หลักบนการ์ดอีกใบ','ป้ายที่อยู่หลักย้ายไปการ์ดนั้น และแสดงแจ้งเตือนตั้งเป็นที่อยู่หลักแล้ว'],
 'C514:address-saved':['บันทึกที่อยู่จาก C515 สำเร็จ','กลับมาสมุดที่อยู่ และแสดงแจ้งเตือนบันทึกที่อยู่แล้ว'],
 'C105:consent-ready':['ข้อมูลครบและเลือกความยินยอมสุขภาพแล้ว','กดยืนยันจึงสมัคร ข่าวสารเป็นทางเลือก ไม่ยืนยันให้อัตโนมัติ'],
 'C105:review':['ข้อมูลครบแต่ยังไม่เลือกความยินยอมสุขภาพ','ปุ่มสมัครยังใช้งานไม่ได้จนกว่าจะยินยอมด้วยตนเอง'],
 'C105:save-error':['จำลองบันทึกสมัครไม่สำเร็จ','ข้อมูลต้องอยู่ครบและลองบันทึกซ้ำได้ ไม่ไปหน้าสมัครสำเร็จ']
 }[code+':'+state];
 const auth=['C103','C104'].includes(code)?{
  'otp-wrong':['กรอกรหัสยืนยันที่ไม่ตรงกับรอบปัจจุบัน','แสดงรหัสไม่ถูกต้องในหน้าเดิม ไม่เข้าสู่ระบบ และนับจำนวนครั้งที่ผิด'],
  'otp-expired':['ปล่อยรหัสยืนยันจนหมดอายุ','ยืนยันด้วยรหัสเก่าไม่ได้ ต้องขอรหัสใหม่ และไม่มีการเข้าสู่ระบบเงียบ ๆ'],
  'otp-locked':['ยืนยันรหัสผิดครบจำนวนที่กำหนด','ระงับการลองรอบนี้ แสดงทางขอรหัสใหม่ ไม่ให้ใช้รหัสเดิมผ่านได้'],
  'resend':['ถึงเวลาขอรหัสใหม่','รหัสและ reference ต้องเป็นรอบใหม่ รหัสเก่าใช้ไม่ได้ และยังต้องกดยืนยันเอง'],
  'new-account':['ยืนยันปลายทางที่ยังไม่มีบัญชี','ไปกรอกสมัครใหม่ ไม่สืบทอดประวัติหรือความยินยอมของบัญชีตัวอย่าง'],
  'existing-account':['ยืนยันปลายทางที่มีบัญชีแล้ว','เปิดหน้าแรกของบัญชีเดิม รักษาประวัติและไม่ถามสมัครซ้ำ']
 }[state]:null;
 const payment=code==='C308'?{
  'qrexp':['เปิด QR ที่หมดอายุ','ชำระด้วย QR เก่าไม่ได้ ไม่ต่อเส้นตายรายการยาเอง'],
  'checking':['กำลังตรวจสอบผลชำระ','ป้องกันการส่งซ้ำ ยังไม่แสดงชำระสำเร็จก่อนผลยืนยัน'],
  'far':['ที่อยู่ส่งด่วนไกลกว่า 15 กิโลเมตร','เลือกส่งด่วนไม่ได้ ต้องเปลี่ยนที่อยู่ที่รองรับหรือรับที่ร้าน'],
  'normal':['รับยาที่ร้าน','แสดงสาขาและที่อยู่ ไม่มีค่าจัดส่ง รวมยอดตรงกับรายการในแชท'],
  'express':['เลือกส่งด่วนแต่ยังไม่ยืนยันหมุด','ยังยืนยันชำระไม่ได้จนระบุตำแหน่งและทราบค่าส่ง']
 }[state]:null;
 const history=code==='C403'?{
  'pending-order':['ปรึกษาจบแล้วและยังมียาค้างชำระ','แสดงปุ่มข้อมูลชำระเงินพร้อม countdown เปิดคำสั่งซื้อเดียวกันโดยไม่เปิดเคสปรึกษาใหม่'],
  'expired-order':['ปล่อยรายการยาจนหมดเวลาชำระ','แสดงหมดอายุและปิดการชำระเดิม ผลการปรึกษายังคงเดิม'],
  'customer-ended':['ผู้ปรึกษาจบการสนทนาเอง','ระบุว่าคุณจบการสนทนา ไม่ตีความเป็นปรึกษาล้มเหลว และไม่ยกเลิกรายการยาที่ค้างชำระ'],
  'no-response':['ไม่มีการตอบกลับครบ 5 นาที','ระบุเหตุผลปิดการสนทนาจากการไม่ตอบกลับ แยกจากสำเร็จและผู้ใช้กดจบเอง']
 }[state]:null;
 const home=code==='C201'?{
  'case-delivery-preparing':['ชำระรายการยาจากแชทแล้ว','แสดงกำลังเตรียมยา เปิด C414 ของคำสั่งซื้อเดิมและคำแนะนำเภสัชกร'],
  'case-delivery-calling':['ร้านเตรียมยาเสร็จ','แสดงกำลังเรียกไรเดอร์เข้ารับยา ไม่เปิดห้องแชทที่จบแล้ว'],
  'case-delivery-delivering':['ไรเดอร์รับยาจากร้านแล้ว','แสดงไรเดอร์กำลังส่งยา และรายการยาสามรายการเดิม'],
  'case-delivery-delivered':['ไรเดอร์ส่งยาสำเร็จ','แสดงการ์ดเสร็จสิ้น ไม่แสดงแถบย่อส่งยาที่ค้าง'],
  'case-none':['ไม่มีการปรึกษาค้าง','ไม่แสดงการ์ดเคสค้างหรือแถบย่อ และเริ่มการปรึกษาใหม่ได้'],
  'case-queue1':['มีผู้รออยู่ก่อน 1 คน','การ์ดระบุมีผู้รอก่อนคุณ 1 คน กดกลับเข้าห้องแชทแล้วเป็นเคสเดียวกัน'],
  'case-next':['ถึงลำดับคิวถัดไป','การ์ดระบุคุณเป็นคิวถัดไป สถานะรอเภสัชกร และยังไม่เริ่มวิดีโอคอล'],
  'case-paused':['เภสัชกรพักรับคิวชั่วคราว','แสดงคิวของคุณยังอยู่ กลับเข้าห้องรอเดิมได้ ไม่สร้างคิวใหม่'],
  'case-matched':['เภสัชกรรับคิวแล้ว','แสดงสถานะรับคิวพร้อมชื่อเภสัชกร ปุ่มกลับไปปรึกษาต่อเปิดห้องเดิม'],
  'case-chat':['กำลังสนทนาและเภสัชกรสามารถส่งรายการยา','แสดงกำลังสนทนา กดกลับห้องแล้วมีการ์ดผู้ให้บริการและข้อมูลก่อนปรึกษา'],
  'case-video-request':['เภสัชกรส่งคำขอวิดีโอคอล','หน้าแรกยังเป็นการปรึกษาที่ค้าง กดกลับห้องแล้วพบการ์ดคำขอ ต้องตอบรับก่อนเริ่มสาย'],
  'case-reply':['เภสัชกรรอคำตอบจากผู้ปรึกษา','แสดงรอคำตอบและทางกลับไปตอบ ตรวจเวลาปิดจากการไม่ตอบแยกจากเวลาชำระยา'],
  'case-payment':['ส่งรายการยาระหว่างแชท','แสดงมีรายการยารอชำระ โดยการปรึกษายังไม่จบ และรายการตรงกับห้องแชท'],
  'case-closed-unpaid':['จบการปรึกษาแต่มียารอชำระ','แสดงรายการยาพร้อมชำระและเวลาคงเหลือ เปิดชำระรายการเดิม ไม่เปิดเคสปรึกษาใหม่'],
  'case-payment-soon':['รายการยาเหลือเวลาชำระประมาณ 1 นาที','แสดง countdown ประมาณ 01:00 และใช้ deadline เดียวกันกับประวัติ/หน้าชำระ'],
  'case-closed-payexpired':['จบแชทและหมดเวลาชำระยา','แสดงรายการยาชำระไม่ได้แล้ว ไม่มีปุ่มชำระรายการหมดอายุ'],
  'case-finished':['จบการปรึกษาและไม่มีรายการค้างชำระ','ไม่แสดงการ์ดปรึกษาค้าง ตรวจใบสรุปจากประวัติได้'],
  'case-cancelled':['ยกเลิกคิวก่อนปรึกษา','ไม่แสดงการ์ดคิวค้างหรือแถบย่อ เริ่มปรึกษาใหม่ได้'],
  'case-expired':['หมดเวลารอคำตอบและปิดเคส','ไม่แสดงการ์ดเคสที่ยังดำเนินอยู่ ประวัติต้องแยกเหตุผลจากปรึกษาสำเร็จ']
 }[state]:null;
 const health=code==='C505'?{
  normal:['เปิดข้อมูลสุขภาพที่มีบันทึก','เห็นหน้าสรุปอย่างเดียว ไม่มี input กดแก้ไขจึงเข้าฟอร์ม และบันทึกกลับมาเห็นค่าใหม่'],
  unknown:['ไม่มีข้อมูลสุขภาพที่ระบุ','แสดงยังไม่ทราบ ไม่ตีความว่าไม่มีโรคหรือไม่แพ้ยา ไม่เติมโรคตัวอย่างในหน้าดู'],
  none:['ผู้ใช้ระบุว่าไม่มี','แสดงไม่มีตามแต่ละหมวด แยกจากยังไม่ทราบ'],
  sfx:['มีผลข้างเคียงที่เภสัชกรบันทึก','แสดงแยกจากแพ้ยา อ่านได้แต่แก้ไขผลข้างเคียงเองไม่ได้'],
  edit:['เปิดแบบร่างแก้ไขจากข้อมูลเดิม','ยกเลิกไม่เปลี่ยนข้อมูล บันทึกแล้วกลับมาหน้าสรุปของคนเดิม'],
  invalid:['น้ำหนักผิดรูปแบบและเลือกมียาประจำแต่ไม่กรอก','แจ้งข้อผิดพลาดตรงช่อง ไม่บันทึกจนแก้ครบ ข้อมูลร่างยังอยู่'],
  'long-text':['ข้อมูลหลายรายการและมีรายละเอียด','อ่านครบไม่ตัดข้อมูล ใช้หลายบรรทัดและไม่ล้นจอ']
 }[state]:null;
 const inbox=code==='C404'?{
  normal:['เปิดรายการแจ้งเตือนจำลอง 14 รายการ','แบ่งวันนี้ เมื่อวาน และวันก่อนหน้า เรียงใหม่ก่อน ไม่มีสถานะอ่านหรือปุ่มอ่านทั้งหมด'],
  many:['หลายแจ้งเตือนข้ามวัน','วันที่ใช้เวลาไทย หัวข้อวันและเวลาของแต่ละรายการชัด กดปลายทางที่ตรงกับข้อความ'],
  'same-day':['หลายแจ้งเตือนในวันเดียว','มีหัวข้อวันนี้กลุ่มเดียวและเรียงเวลาล่าสุดก่อน'],
  error:['โหลดแจ้งเตือนไม่สำเร็จ','เห็นปุ่มลองใหม่ กดแล้วแสดงรายการได้'],
  loading:['กำลังโหลดแจ้งเตือน','แสดง skeleton ไม่แสดงว่าไม่มีแจ้งเตือนก่อนโหลดเสร็จ']
 }[state]:null;
 const contract=specific||auth||payment||history||home||health||inbox;
 const category=this.category(state,label);
 const expected=contract?.[1]||({
 'ข้อผิดพลาด':'แสดงสาเหตุและทางแก้ในบริบทนี้ ไม่แสดงผลสำเร็จ และไม่ล้างข้อมูลที่ยังแก้ต่อได้',
 'ข้อมูลไม่ครบ / ว่าง':'แสดงข้อมูลว่างหรือรายการที่ขาดอย่างชัดเจน ไม่สร้างข้อมูลแทนผู้ใช้ และตรวจเงื่อนไขปุ่มดำเนินการ',
 'เวลา / หมดอายุ':'แสดงเวลาหรือสถานะหมดอายุให้ตรงกันทุกจุด ห้ามต่อเวลาเองหรือส่งรายการเดิมซ้ำ',
 'ความยินยอม':'การอ่านเอกสารไม่เปลี่ยนความยินยอม ตรวจเงื่อนไขตามบริบทและไม่เลือกให้ผู้ใช้อัตโนมัติ',
 'กำลังโหลด':'แสดงว่ากำลังทำงานและป้องกันการส่งซ้ำ ผลสำเร็จต้องปรากฏหลังทำงานเสร็จ',
 'การเชื่อมต่อ':'แจ้งว่าส่งหรือโหลดไม่ได้ เก็บข้อมูลเดิม และให้ลองใหม่เมื่อการเชื่อมต่อกลับมา',
 'สถานะ / การใช้งาน':`แสดง “${label}” ตามเคสจำลอง ตรวจข้อความ ปุ่มที่กดได้ และหน้าปลายทางให้ตรงกับบริบท`
 }[category]);
 return {category,setup:contract?.[0]||`เปิดสถานการณ์ “${label}”`,expected,steps:'กดปุ่มเคส ตรวจข้อมูลและข้อความ แล้วลองแก้ข้อมูลหรือกดปุ่มหลักตามสถานการณ์'};
 },
 globals:[
 {id:'EV-GLOBAL-001',key:'offline',label:'ไม่มีอินเทอร์เน็ต',icon:'wifi-off',title:'ไม่มีการเชื่อมต่ออินเทอร์เน็ต',body:'ตรวจสอบสัญญาณแล้วลองอีกครั้ง ข้อมูลที่กรอกยังอยู่',expected:'อยู่หน้าเดิม เก็บแบบร่าง ไม่ส่งคำสั่งขณะจำลองออฟไลน์'},
 {id:'EV-GLOBAL-002',key:'server',label:'เซิร์ฟเวอร์ขัดข้อง',icon:'server',title:'ระบบยังไม่พร้อมใช้งาน',body:'ขณะนี้ทำรายการไม่ได้ กรุณาลองอีกครั้งภายหลัง',expected:'แสดงข้อผิดพลาด เก็บข้อมูล ไม่แจ้งว่าบันทึกหรือชำระสำเร็จ'},
 {id:'EV-GLOBAL-003',key:'timeout',label:'การตอบกลับหมดเวลา',icon:'clock',title:'ยังไม่ได้รับผลการทำรายการ',body:'ยังยืนยันผลไม่ได้ กรุณาตรวจสอบสถานะก่อนทำรายการซ้ำ',expected:'ไม่สรุปว่าการชำระล้มเหลวหรือสำเร็จ ระบบจริงต้องตรวจผลด้วยรหัสรายการก่อนส่งซ้ำ'},
 {id:'EV-GLOBAL-004',key:'slow',label:'ระบบตอบกลับช้า',icon:'loader',title:'กำลังรอการตอบกลับ',body:'กรุณารอสักครู่ ระบบยังไม่ได้ยืนยันผลรายการ',expected:'แสดงสถานะรอ ป้องกันการกดยืนยันซ้ำและรักษาแบบร่าง'}
 ]
};
/* ===== End preview event metadata ===== */
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
function stateCode(def,key){const all=def.states||[],i=all.findIndex(x=>x[0]===key);return all.length>1&&i>=0?`${def.code}.${i+1}`:def.code||'';}
function render() {
  const s = TP.sheetOpen(), c = TP.cur(), keep = anchorOf();
  const internal = s?.def.hidden && s.def.host;
  const def = internal ? TP.SCREENS[s.def.host] : s ? s.def : c && TP.SCREENS[c.id];
  const id = internal ? s.def.host : s ? s.id : c?.id;
  const states = def ? TP.previewEventPolicy.pageStates(id,def.states) : [];
  const sims = SIM.filter(a => { try { return a.when(TP.S); } catch { return false; } });
  const visible = TP.ORDER.filter(i => !TP.def(i).hidden);
  const code = id ? TP.codeOf(id) : '', ttl = def ? (typeof def.title === 'function' ? def.title({ S: TP.S, params: s ? s.ctx.params : c?.ctx?.params || {} }) : def.title) : '';
  const canMock = s ? !!s.def?.previewMock?.canFill(s.ctx) : TP.registrationPreview?.canFill(c);
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
          const code = `${d.code}.${index + 1}`;
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
      const s = TP.sheetOpen();
      if (s) { TP.S.st[s.id] = k; TP.prepState(s.def); const p = s.ctx.params; await TP.closeSheet({ instant: true }); TP.sheet(s.id, p); }
      else { const id = TP.cur().id; TP.S.st[id] = k; TP.prepState(TP.SCREENS[id]); TP.refresh(); }
      break;
    }
    case 'sim': {
      const action = SIM.find(a => a.id === k);
      if (action?.when(TP.S)) { if (action.id === 'order') TP.casePreview.playChat('payment'); else action.run(); }
      if (mob) toggle(false);
      break;
    }
    case 'mock': { const open = TP.sheetOpen(); if (open?.def?.previewMock) await open.def.previewMock.fill(open.ctx); else TP.registrationPreview?.fillCurrent(); if (mob) toggle(false); break; }
    case 'g': {
      const raw = b.dataset.v, v = raw === 'true' ? true : raw === 'false' ? false : raw;
      if (k === 'loc' || k === 'zoneLock') TP.S.locDenySeen = TP.S.locWarnSeen = false;
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
  if (TP.S.firstTime) Object.assign(TP.S, { loggedIn: false, consent: false, notifAsked: false, notif: false, follow: null });
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
  ...(TP.STORE ? [ui.row({ icon: 'headset', title: 'ฝ่ายบริการลูกค้า', sub: `${TP.STORE.csHours} · ${TP.STORE.cs}`, a: 'stCall', p: { tel: TP.STORE.cs }, chev: false, html: callIc })] : [])];
TP.callRows = callRows;
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
/* first run only: a phone number with no account yet fills "ข้อมูลของคุณ".
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
  states:[['normal','เลือกวิธีเข้าสู่ระบบ'],['error','ข้อความผิดพลาดการเข้าสู่ระบบ'],['signedout','หลุดจากระบบ 30 วัน'],['cover','ภาพปกหน้าร้าน', false],['platform-cover','ปกแพลตฟอร์มร้านยา ไม่มีคน', false],['storefront-cover','ปกหน้าร้าน ตัดป้ายร้านข้างเคียง', false],['no-logo-overlay','ปกหน้าร้าน ไม่มีโลโก้และกล่องทับ', false],['compact-terms','ข้อกำหนดและนโยบายระยะกระชับ', false],['white-fade','เฟดขาว ปุ่มสี Primary', false],['white-image','ภาพปกด้านล่างขาว ไม่มีเฟด CSS', false],['simple-cover','ปกไม่มีข้อความรอง', false],['cover-heading','หัวข้อและคำอธิบายบรรทัดเดียว', false],['filled','กรอกอีเมลและรหัสผ่านแล้ว'],['service-error','บริการเข้าสู่ระบบไม่พร้อมใช้งาน']],
  notes:['ดำเนินการด้วย Google C114 หรือกรอกอีเมลและรหัสผ่านบน C102','ลงทะเบียนเปิดฟอร์มสมาชิก C105 โดยตรง','ใต้รหัสผ่านมีจำไว้ในระบบและลืมรหัสผ่าน C115','Google และการตรวจรหัสผ่านเป็นต้นแบบ ต้องเชื่อมบริการยืนยันตัวตนจริงก่อนใช้งาน'],
  prep(S){S.loggedIn=false;},
  render(ctx){return '<div class="auth-cover auth-login-cover"><img class="auth-cover-photo" src="/assets/auth/login-storefront-white-v4.png" alt="" fetchpriority="high"><div class="auth-cover-content auth-login-panel"><h1>ยินดีต้อนรับ</h1>'+(ctx.state==='signedout'?ui.note('ออกจากระบบอัตโนมัติหลังไม่ได้เปิดแอป 30 วัน กรุณาเข้าสู่ระบบอีกครั้ง',{icon:'lock'}):'')+authSignInForm(ctx)+'<div class="auth-login-divider"><span>หรือ</span></div><div class="auth-cover-actions"><button type="button" class="btn secondary auth-google" data-a="authGoogleOpen">'+authGoogleIcon()+'<span>ดำเนินการด้วย Google</span></button></div><div class="auth-login-register"><span>ยังไม่ได้เป็นสมาชิก?</span><button type="button" class="txtbtn" data-a="authRegisterOpen">ลงทะเบียน</button></div>'+authTerms()+'</div></div>';},
  mount:authMountPassword
});
function authGoogleIcon(){return `<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>`;}
TP.act('authRegisterOpen',()=>{authNewAccount(TP.S,'email','');TP.S.st.profile='empty';return TP.go('profile',{root:true});});
TP.act('authGoogleOpen',()=>TP.sheet('googlelogin'));
TP.sheetDef('googlelogin',{group:'start',title:'ดำเนินการด้วย Google',code:'C114',host:'login',states:[['normal','จำลอง Google บัญชีสมาชิก'],['new-account','จำลอง Google สมาชิกใหม่'],['error','Google เข้าสู่ระบบไม่สำเร็จ']],notes:['ต้นแบบเท่านั้น ไม่มีการรับรหัสผ่าน Google; ระบบจริงใช้ Google Identity Services และตรวจสอบ token ฝั่งเซิร์ฟเวอร์'],render(ctx){return `${ui.note('ตัวอย่างการเชื่อมต่อ Google สำหรับต้นแบบ',{icon:'info'})}<p class="body">${ctx.state==='error'?'เชื่อมต่อไม่สำเร็จ กรุณาลองอีกครั้ง':ctx.state==='new-account'?'สมาชิกใหม่ต้องกรอกข้อมูลและยอมรับเงื่อนไขการสมัครก่อนใช้งาน':'ดำเนินการต่อด้วยบัญชีสมาชิกตัวอย่าง'}</p>`;},foot(ctx){return ui.btn(ctx.state==='new-account'?'ดำเนินการลงทะเบียน':'ดำเนินการต่อ',{a:'authGoogleDemo',v:ctx.state})+ui.btn('ยกเลิก',{kind:'secondary',closeSheet:true});}});
function authSessionDemo(){Object.assign(TP.S,{loggedIn:true,firstTime:false,newAccount:false,_authFlows:{},_registration:null,_registrationComplete:false});TP.emit('state');return TP.go('home',{root:true,via:'zoom'});}
TP.act('authGoogleDemo',async button=>{if(button.dataset.v==='error'){await TP.closeSheet();return TP.sheet('googlelogin');}if(button.dataset.v==='new-account'){authNewAccount(TP.S,'email','new.member@gmail.com');TP.S._registrationIdentity={provider:'google',email:'new.member@gmail.com'};TP.S.st.profile='empty';return TP.go('profile',{root:true,params:{email:'new.member@gmail.com'}});}return authSessionDemo();});
// Prototype adapter: production credentials must be verified by the server.
TP.passwordAuthDemo={async signIn(email,password){return {ok:email.toLowerCase()==='somjai@example.com'&&password==='Mitraree!2026Demo'};}};
function authSignInForm(ctx){const filled=['filled','error','service-error'].includes(ctx.state);return `<form id="passwordLoginForm"><div class="field"><label for="signInEmail">อีเมล</label><input class="input" id="signInEmail" type="email" autocomplete="username" autocapitalize="none" spellcheck="false" required value="${filled?'somjai@example.com':''}" placeholder="กรอกอีเมล"></div><div class="field"><label for="signInPassword">รหัสผ่าน</label><div class="reg-password-input"><input class="input" id="signInPassword" type="password" autocomplete="current-password" required value="${filled?'Mitraree!2026Demo':''}" placeholder="กรอกรหัสผ่าน"><button type="button" class="reg-password-toggle" id="signInEye" aria-label="แสดงรหัสผ่าน" aria-controls="signInPassword" aria-pressed="false">${ic('eye',20)}</button></div></div><div class="auth-login-options"><label class="auth-remember" for="signInRemember"><input id="signInRemember" type="checkbox" name="remember"> <span>จำไว้ในระบบ</span></label><button type="button" class="txtbtn" data-a="authForgotOpen">ลืมรหัสผ่าน?</button></div><p id="signInError" class="err-t" role="alert" ${['error','invalid','service-error'].includes(ctx.state)?'':'hidden'}>${ctx.state==='service-error'?'ระบบไม่พร้อมใช้งาน กรุณาลองอีกครั้ง':'อีเมลหรือรหัสผ่านไม่ถูกต้อง'}</p><button type="submit" class="btn primary block" id="signInSubmit">เข้าสู่ระบบ</button></form>`;}
function authMountPassword(el,ctx){const form=$('#passwordLoginForm',el),email=$('#signInEmail',el),password=$('#signInPassword',el),error=$('#signInError',el),button=$('#signInSubmit',el),eye=$('#signInEye',el);eye.addEventListener('click',()=>{const show=password.type==='password';password.type=show?'text':'password';eye.innerHTML=ic(show?'eye-off':'eye',20);TP.icons(eye);eye.setAttribute('aria-label',show?'ซ่อนรหัสผ่าน':'แสดงรหัสผ่าน');eye.setAttribute('aria-pressed',String(show));});form.addEventListener('input',()=>{error.hidden=true;});form.addEventListener('submit',async event=>{event.preventDefault();if(button.disabled||!form.reportValidity())return;button.disabled=true;button.setAttribute('aria-busy','true');try{await TP.wait(TP.RED()?80:500);if(ctx.state==='service-error')throw new Error('unavailable');const result=await TP.passwordAuthDemo.signIn(email.value.trim(),password.value,{remember:!!$('#signInRemember',el)?.checked});if(TP.cur()?.el!==el)return;if(result.ok){password.value='';return authSessionDemo();}error.textContent='อีเมลหรือรหัสผ่านไม่ถูกต้อง';error.hidden=false;}catch{error.textContent='ระบบไม่พร้อมใช้งาน กรุณาลองอีกครั้ง';error.hidden=false;}finally{button.disabled=false;button.removeAttribute('aria-busy');}});}
// Recovery is simulated here; production must issue a single-use, expiring email link.
TP.act('authForgotOpen',()=>{TP.S.st.forgotpassword='normal';return TP.go('forgotpassword',{params:{email:$('#signInEmail',TP.cur()?.el)?.value||''}});});
TP.act('authRecoveryLogin',()=>TP.go('login',{root:true}));
TP.screen('forgotpassword',{
 group:'start',title:'ลืมรหัสผ่าน',code:'C115',parent:'login',
 states:[['normal','กรอกอีเมลเพื่อขอลิงก์ตั้งรหัสผ่าน'],['sent','ส่งคำขอตั้งรหัสผ่านแล้ว']],
 notes:['หน้าส่งคำขอมีภาพซองจดหมาย ปุ่มส่งอีเมลอีกครั้งพร้อมรอ 60 วินาที และปุ่มกลับไปเข้าสู่ระบบ','ต้นแบบไม่ส่งอีเมลจริง ระบบจริงใช้ลิงก์ครั้งเดียวที่หมดอายุและตอบข้อความเดียวกันไม่ว่าอีเมลมีบัญชีหรือไม่','จำไว้ในระบบส่งเป็นตัวเลือก session ให้บริการยืนยันตัวตน ไม่เก็บรหัสผ่านใน browser storage'],
 render(ctx){const body=ctx.state==='sent'? `<section class="auth-recovery-sent"><img class="auth-recovery-art" src="/assets/auth/recovery-email-sent-v1.png" alt="" width="168" height="168"><h2>ตรวจสอบอีเมลของคุณ</h2><p class="body">หากอีเมลนี้มีบัญชีในระบบ คุณจะได้รับลิงก์สำหรับตั้งรหัสผ่านใหม่</p><div class="auth-recovery-hint"><p>ยังไม่พบอีเมล?</p><p class="small">ลองตรวจสอบจดหมายขยะ หรือส่งอีเมลอีกครั้ง</p></div><div class="auth-recovery-actions"><button type="button" id="recoveryResend" class="btn primary block">ส่งอีเมลอีกครั้ง</button><p class="small" id="recoveryResendStatus" role="status" aria-live="polite"></p><button type="button" class="btn secondary block" data-a="authRecoveryLogin">กลับไปเข้าสู่ระบบ</button></div></section>`:`<p class="body">กรอกอีเมลที่ใช้สมัครเพื่อขอลิงก์ตั้งรหัสผ่านใหม่</p><form id="forgotPasswordForm" class="auth-recovery-form"><div class="field"><label for="recoveryEmail">อีเมล</label><input class="input" id="recoveryEmail" type="email" autocomplete="email" required value="${TP.esc(ctx.params.email||'')}" placeholder="กรอกอีเมล"></div><button type="submit" class="btn primary block">ส่งลิงก์ตั้งรหัสผ่าน</button></form>`;return ui.nav({back:true,title:'ลืมรหัสผ่าน'})+ui.page(body);},
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
function authTerms(){return `<p class="auth-cover-terms"><button type="button" data-a="stDoc" data-v="ข้อกำหนดการใช้งาน">ข้อกำหนดการใช้งาน</button> และ <button type="button" data-a="stDoc" data-v="นโยบายความเป็นส่วนตัว">นโยบายความเป็นส่วนตัว</button></p>`;}
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
  Object.assign(S,{loggedIn:true,firstTime:true,newAccount:true,consent:false,consentVer:0,_gone:false,_pf:null,_authFlows:{},_registration:null,_registrationIdentity:{provider:channel,email:channel==='email'?target:'',phone:channel==='phone'?digits(target):''},_registrationComplete:false,healthConsentRecord:null,adrReports:[],_adrDrafts:{},_adr:null,_adrSent:null,ofPending:null,deliveryAddressId:null});
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
const NOW_Y = +TP.NOW.date.slice(-4);
const PF_CHECK = {
  first: v => v.trim() ? '' : 'ใส่ชื่อ',
  last: v => v.trim() ? '' : 'ใส่นามสกุล',
  house: v => (v || '').trim() ? '' : 'ใส่บ้านเลขที่',
  building: v => String(v||'').length<=200?'':'รายละเอียดอาคารต้องไม่เกิน 200 ตัวอักษร',
  alley: v => String(v||'').length<=100?'':'ซอยต้องไม่เกิน 100 ตัวอักษร',
  road: v => String(v||'').length<=100?'':'ถนนต้องไม่เกิน 100 ตัวอักษร',
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
const pfMode = ctx => ctx.params.edit || ctx.state?.startsWith('personal-edit') ? 'edit' : ctx.params.acct || ctx.state === 'acct' ? 'acct' : 'new';
const pfAcctCard = (S, ph) => `<div class="st-acct" id="pfAcct" data-in="1" role="group" aria-labelledby="pfAcctT">
    <p class="st-acct-t" id="pfAcctT">${ic('circle-user-round', 20, 1.9)}<span>พบบัญชีเว็บของ <b>คุณ${esc(S.user.full)}</b> <span class="num st-nw">(${esc(ph)})</span> ใช่คุณไหม</span></p>
    <div class="st-acct-b"><button type="button" class="btn tint sm" data-x="yes">ใช่</button><button type="button" class="btn ghost sm" data-x="no">ไม่ใช่ ติดต่อฝ่ายบริการลูกค้า</button></div></div>`;
const pfAcctOk = (S, ph) => `<p class="st-pf-ok" data-in="1">${ui.tag('บัญชีของคุณ', 'ok', { dot: true })}<span>คุณ${esc(S.user.full)} <span class="num st-nw">${esc(ph)}</span></span></p>`;
/* consent sits on the same screen (owner 19/10/2026): short summary, link to the full text, a box that is never pre-ticked */
const pfConsent = acct => `<h3 class="group-h st-pf-cnh" data-in="5">ความยินยอมในการใช้ข้อมูล</h3>
    <div class="card st-pf-cn" id="pfCnBox" data-in="5">
      <ul class="st-pf-cnl">${CN_SUM.map(([i, t, x]) => `<li>${ic(i, 16, 2)}<span><b>${esc(t)}</b> ${esc(x)}</span></li>`).join('')}</ul>
      <p class="st-pf-cnv">${ic('file-text', 15, 2)}<span>ฉบับที่ ${CN_VER} · มีผล 18/10/2026${acct ? ' · เพิ่มหัวข้อบริการปรึกษาผ่านแอปจากฉบับที่คุณยินยอมไว้บนเว็บ' : ''} <button type="button" class="link st-inl" data-sheet="registrationconsent">อ่านฉบับเต็ม</button></span></p>
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

TP.healthConsentVersion=()=>REG_HEALTH_POLICY.version;
TP.healthConsentNeeded=S=>!(S.consent&&S.consentVer>=4&&S.healthConsentRecord?.documentVersion===REG_HEALTH_POLICY.version);
TP.saveHealthConsent=(S,version,method)=>{if(version!==REG_HEALTH_POLICY.version)return false;S.consent=true;S.consentVer=4;S.healthConsentRecord={documentVersion:version,controller:REG_HEALTH_POLICY.controller,purpose:'pharmaceutical-care',acceptedAt:new Date().toISOString(),method,categories:REG_TOPICS.map(([key])=>key),prototype:true};return true;};
TP.sheetDef('registrationconsent',{group:'start',title:'ความยินยอมข้อมูลสุขภาพ',code:'C107',host:'profile',tall:true,hideClose:true,states:[['normal','อ่านความยินยอม ไม่มีช่องติ๊ก']],notes:['อ่านอย่างเดียว ปิดแล้วไม่เปลี่ยนความยินยอม','ผู้ควบคุมข้อมูล บริษัท มิตรอารีแคร์ จำกัด ตามเจ้าของโครงการยืนยัน','ฉบับร่าง รอที่อยู่ ช่องทางติดต่อ ระยะเวลา และตรวจฐานกฎหมายก่อนใช้จริง'],render:regConsentDocument,foot:()=>ui.btn('ปิด',{kind:'secondary',closeSheet:true})});
const REG_LISTS={conditions:['ความดันโลหิตสูง','ไขมันในเลือดสูง','โรคเบาหวาน','โรคหัวใจ','โรคไตเรื้อรัง','โรคหลอดเลือดสมอง'],meds:['Activelle 28s','Aerius 5 mg','Air-X 40 mg','Air-X 80 mg','Air-X 120 mg'],allergies:['Activelle 28s','Aerius 5 mg','Air-X 40 mg','Air-X 80 mg','Air-X 120 mg'],food:['ไข่','นม','แป้งสาลี','ถั่ว','อาหารทะเล']};
const REG_STEPS=['ข้อมูลส่วนตัว','ที่อยู่ปัจจุบัน','ข้อมูลสุขภาพ','ตรวจทานและยินยอม'];
function regDraft(S){return S._registration ||= {step:0,first:'',last:'',nationalId:'',day:'',month:'',year:'',sex:'none',weight:'',height:'',house:'',building:'',alley:'',road:'',dist:'',amp:'',prov:'',zip:'',health:{conditions:{mode:'unknown',items:[]},meds:{mode:'unknown',items:[]},allergies:{mode:'unknown',items:[]},food:{mode:'unknown',items:[]}},documents:[],queries:{},docError:'',consents:{},errors:{},busy:false};}
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
 '<div class="reg-phone-control">'+regField(d,'phone','เบอร์โทรศัพท์มือถือ',{ac:'tel-national',max:10,numeric:true,readonly:locked,placeholder:'เช่น 0812345678'})+
 (!locked?'<button type="button" class="btn secondary" id="regPhoneSend" data-a="regPhoneSend" '+(d.phoneBusy||!regPhoneValid(d.phone)?'disabled':'')+'>'+(d.phoneBusy?'กำลังส่ง…':'ขอรหัส OTP')+'</button>':'')+'</div>'+
 '<p class="hint">ใช้รับ SMS ยืนยันเบอร์ และติดต่อเรื่องการรับบริการ</p>'+
 (locked?'<div class="reg-phone-status"><span role="status">'+(verified?ic('circle-check',18,1.8)+'ยืนยันเบอร์โทรแล้ว':'ส่งรหัส SMS ไปที่ '+esc(d.phone))+'</span><button type="button" class="txtbtn" data-a="regPhoneChange">เปลี่ยนเบอร์</button></div>':'')+
 (challenge?'<div class="reg-phone-otp"><label class="f-l" for="reg-phone-code">รหัส OTP 6 หลัก</label><div class="reg-phone-code-row"><input class="input" id="reg-phone-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="12" value="'+esc(d.phoneCode||'')+'" aria-describedby="regPhoneExpiry regPhoneError" aria-invalid="'+!!d.phoneError+'"><button type="button" class="btn primary" id="regPhoneVerify" data-a="regPhoneVerify" '+(d.phoneBusy||!/^\d{6}$/.test(d.phoneCode||'')||Date.now()>=challenge.expiresAt||challenge.attempts>=5?'disabled':'')+'>ยืนยันเบอร์</button></div><p class="hint" id="regPhoneExpiry" role="status"></p><button type="button" class="txtbtn" id="regPhoneResend" data-a="regPhoneSend">ส่งรหัสใหม่</button></div>':'')+
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
const regCanSubmit=d=>regAllValid(d)&&regConsentAccepted(d)&&!d.busy;
function regContact(ctx){if(!ctx.params.email&&!ctx.params.phone&&!ctx.S.user.email&&!ctx.S.user.phone)return {channel:'email',value:regDraft(ctx.S).email||''};if(ctx.params.email)return {channel:'email',value:ctx.params.email};if(ctx.params.phone)return {channel:'phone',value:digits(ctx.params.phone)};return ctx.S.user.email?{channel:'email',value:ctx.S.user.email}:{channel:'phone',value:digits(ctx.S.user.phone)};}
const REG_PLACEHOLDERS={first:'ชื่อจริง',last:'นามสกุล',nationalId:'เลขบัตรประชาชน 13 หลัก',day:'15',month:'6',year:'1988',weight:'เช่น 55',height:'เช่น 160',house:'เช่น 88/12',building:'ชื่อหมู่บ้าน อาคาร ห้อง หรือชั้น',alley:'เช่น ทวีวัฒนา 25',road:'เช่น เลียบคลองทวีวัฒนา',dist:'ค้นหาตำบล / แขวง',amp:'ค้นหาอำเภอ / เขต',prov:'ค้นหาจังหวัด',zip:'เช่น 10170'};
function regAddressContact(d,c){if(d.addressFirst===undefined)d.addressFirst=d.first;if(d.addressLast===undefined)d.addressLast=d.last;if(d.addressPhone===undefined)d.addressPhone=d.verifiedPhone||(c.channel==='phone'?regPhoneDigits(c.value):'');}
function regPhoneDigits(v){return String(v||'').replace(/[^0-9]/g,'').slice(0,10);}
function regAddressOptions(rows,d,key){const field={prov:'province',amp:'amphoe',dist:'district'}[key];return [...new Set(rows.filter(r=>key==='prov'||r.province===d.prov&&(key==='amp'||r.amphoe===d.amp)).map(r=>r[field]))].sort((a,b)=>a.localeCompare(b,'th'));}
function regAddressPick(d,key,value,rows){const options=regAddressOptions(rows,d,key);if(!options.includes(value))value='';d[key]=value;if(key==='prov'){d.amp='';d.dist='';d.zip='';}else if(key==='amp'){d.dist='';d.zip='';}else{const row=rows.find(r=>r.province===d.prov&&r.amphoe===d.amp&&r.district===d.dist);d.zip=row?String(row.zipcode):'';}d.consents={};}
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
function regField(d,key,label,o={}){const error=d.errors[key];return `<div class="field${error?' err':''}" data-reg-field="${key}"><label for="reg-${key}">${esc(label)}${o.optional?' <span class="opt-t">(ไม่บังคับ)</span>':' <span class="reg-required" aria-hidden="true">*</span>'}</label><input class="input" id="reg-${key}" data-reg-input="${key}" type="${key==='addressPhone'||key==='phone'?'tel':key==='email'?'email':'text'}" ${key==='addressPhone'?'pattern="0[689][0-9]{8}" minlength="10"':''} ${key==='nationalId'?'pattern="[0-9]{13}" minlength="13" spellcheck="false"':''} placeholder="${esc(o.placeholder||REG_PLACEHOLDERS[key]||label)}" value="${esc(d[key]||'')}" maxlength="${o.max||80}" ${o.numeric?'inputmode="'+(o.decimal?'decimal':'numeric')+'"':''} autocomplete="${o.ac||'off'}" ${o.readonly?'readonly':''} ${o.optional?'':'required aria-required="true"'} ${o.address?'role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="regAddressResults"':''} aria-invalid="${!!error}" aria-describedby="reg-${key}-error"><p class="err-t" id="reg-${key}-error" role="alert" ${error?'':'hidden'}>${esc(error||'')}</p></div>`;}
function regProgress(d){return `<section class="reg-progress" aria-label="ขั้นตอนสมัครสมาชิก"><div class="reg-step-meta"><span class="reg-step-count">ขั้นตอน ${d.step+1} จาก ${REG_STEPS.length}</span>${d.step<REG_STEPS.length-1?`<span class="reg-step-next">ถัดไป: ${REG_STEPS[d.step+1]}</span>`:''}</div><div class="reg-progress-track" aria-hidden="true">${REG_STEPS.map((_,n)=>`<i class="${n<d.step?'is-complete':n===d.step?'is-current':''}"></i>`).join('')}</div></section>`;}

function regKv(rows){return `<dl class="reg-kv">${rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v||'ไม่ได้ระบุ')}</dd></div>`).join('')}</dl>`;}
function regHealthText(v){return v.mode==='none'?'ไม่มี':v.mode==='unknown'?'ยังไม่ทราบ':regHealthValues(v).join(' · ');}
function regReview(ctx,d,editable=true){const c=regContact(ctx),change=n=>editable?`<button type="button" class="txtbtn" data-reg-step="${n}" aria-label="แก้ไข${REG_STEPS[n]}">แก้ไข</button>`:'';return `<section class="reg-summary"><div class="reg-section-head"><h3>${ic('user',20,1.8)}ข้อมูลส่วนตัว</h3>${change(0)}</div>${regKv([['ชื่อ–นามสกุล',d.first+' '+d.last],['เลขบัตรประชาชน','*********'+d.nationalId.slice(-4)],['วันเกิด',`${d.day}/${d.month}/${d.year} · ${regAge(d)} ปี`],['เพศ',SEXES.find(x=>x[0]===d.sex)?.[1]],['น้ำหนัก / ส่วนสูง',`${d.weight} กก. / ${d.height} ซม.`],['อีเมล',d.email||c.value],['เบอร์โทรที่ยืนยันแล้ว',d.verifiedPhone||c.value]])}</section><section class="reg-summary"><div class="reg-section-head"><h3>${ic('map-pin',20,1.8)}ที่อยู่ปัจจุบัน</h3>${change(1)}</div><p>${esc([d.addressFirst,d.addressLast,d.addressPhone].filter(Boolean).join(' '))}</p><p>${esc([d.house,d.building,d.alley,d.road,d.dist,d.amp,d.prov,d.zip].filter(Boolean).join(' '))}</p></section><section class="reg-summary"><div class="reg-section-head"><h3>${ic('heart-pulse',20,1.8)}ข้อมูลสุขภาพ</h3>${change(2)}</div>${regKv(Object.entries(d.health).map(([k,v])=>[{conditions:'โรคประจำตัว',meds:'ยาที่ใช้ประจำ',allergies:'ประวัติแพ้ยา',food:'ประวัติแพ้อาหาร'}[k],regHealthText(v)]))}<div class="reg-review-documents"><h4>เอกสารแพ้ยา${d.documents.length?` <span class="opt-t">(${d.documents.length} ไฟล์)</span>`:''}</h4>${d.documents.length?regDocumentList(d):'<p class="hint">ไม่ได้แนบเอกสาร</p>'}</div></section>`;}
const REG_HEALTH_LABELS={conditions:'โรคประจำตัว',meds:'ยาที่ใช้ประจำ',allergies:'ประวัติการแพ้ยา',food:'ประวัติแพ้อาหาร'};
function regHealthValues(h){if(h.mode!=='set')return [];if(h.text!==undefined)return h.text.trim()?[h.text.trim()]:[];return [...new Set([...h.items,...(h.other&&h.otherText?.trim()?[h.otherText.trim()]:[])])];}
function regHealthToggle(h,value,checked){if(value==='__other'){h.other=checked;if(!checked)h.otherText='';return;}h.items=checked?[...new Set([...h.items,value])]:h.items.filter(x=>x!==value);}
function regHealthOptions(d,key){const h=d.health[key],items=[...new Set([...REG_LISTS[key],...h.items])];return items.map(v=>`<label class="reg-health-choice"><input type="checkbox" data-reg-health-choice="${key}" data-v="${esc(v)}" ${h.items.includes(v)?'checked':''}><span>${esc(v)}</span></label>`).join('');}
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
TP.act('regDobOpen',()=>{const editing=TP.cur()?.id==='profile'&&pfMode(TP.cur().ctx)==='edit',p=regDobInit(editing?pfEditDraft(TP.S):regDraft(TP.S));TP.sheet('regdob',{picker:p,target:editing?'profile-edit':'registration'});});
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
function pfEditErrors(d){const {nationalId,weight,height,...errors}=regErrors(d,0);return errors;}
function pfEditRender(ctx){
 const d=pfEditDraft(ctx.S),u=ctx.S.user,phone=digits(u.phone||''),contact=u.phone?(phone.length===10?`${phone.slice(0,3)}-${phone.slice(3,6)}-${phone.slice(6)}`:phone):u.email;
 return ui.nav({title:'ข้อมูลส่วนตัว',left:`<button type="button" class="back" data-a="pfEditCancel">${ic('chevron-left',22,2.2)}<span>กลับ</span></button>`})+ui.page(`<div class="registration-page">${contact?`<div class="field"><label class="f-l" for="pfAccountContact">${u.phone?'เบอร์โทรในบัญชี':'อีเมลในบัญชี'}</label><input class="input" id="pfAccountContact" type="${u.phone?'tel':'email'}" value="${esc(contact)}" disabled aria-describedby="pfAccountContactHint"><p class="hint" id="pfAccountContactHint">เปลี่ยนข้อมูลติดต่อได้ที่ฝ่ายบริการลูกค้า</p></div>`:''}${regPersonalFields(d,{personalEdit:true})}</div>`,{cls:'profile-edit-scroll'})+ui.dock(`<div class="reg-nav-actions">${ui.btn('ยกเลิก',{a:'pfEditCancel',kind:'secondary'})}${ui.btn('บันทึกข้อมูล',{a:'pfEditSave',id:'pfEditSave',disabled:!!Object.keys(pfEditErrors(d)).length||d.busy})}</div>`);
}
function pfEditMount(el,ctx){const d=pfEditDraft(ctx.S),button=$('#pfEditSave',el);el.addEventListener('input',e=>{const key=e.target.dataset?.regInput;if(!['first','last'].includes(key))return;d[key]=key==='nationalId'?regIdDigits(e.target.value):e.target.value;if(key==='nationalId')e.target.value=d[key];const error=pfEditErrors(d)[key],field=e.target.closest('[data-reg-field]');if(d.errors[key]||field?.dataset.touched){d.errors[key]=error||'';if(field){field.classList.toggle('err',!!error);e.target.setAttribute('aria-invalid',String(!!error));const message=$('#reg-'+key+'-error',el);message.hidden=!error;message.textContent=error||'';}}button.disabled=!!Object.keys(pfEditErrors(d)).length||d.busy;});el.addEventListener('focusout',e=>{const key=e.target.dataset?.regInput;if(!['first','last'].includes(key))return;const field=e.target.closest('[data-reg-field]');if(field)field.dataset.touched='1';const error=pfEditErrors(d)[key];d.errors[key]=error||'';e.target.setAttribute('aria-invalid',String(!!error));field?.classList.toggle('err',!!error);const message=$('#reg-'+key+'-error',el);if(message){message.hidden=!error;message.textContent=error||'';}});el.addEventListener('change',e=>{if(e.target.matches?.('[data-reg-sex]'))d.sex=e.target.value;});}
TP.act('pfEditCancel',()=>{if(TP.S._profileEdit?.busy)return;TP.S._profileEdit=null;return TP.back();});
TP.act('pfEditSave',async()=>{const S=TP.S,d=pfEditDraft(S),entry=TP.cur();if(d.busy||entry?.id!=='profile'||pfMode(entry.ctx)!=='edit')return;d.errors=pfEditErrors(d);if(Object.keys(d.errors).length){await TP.refresh({anim:false});$('[aria-invalid="true"]',TP.cur()?.el)?.focus();return;}d.busy=true;const first=d.first.trim(),last=d.last.trim();Object.assign(S.user,{name:first,last,full:first+' '+last,birthDate:`${d.year}-${d.month.padStart(2,'0')}-${d.day.padStart(2,'0')}`,birthYear:+d.year,born:d.year,age:regAge(d),sex:d.sex});S._profileEdit=null;TP.emit('state');await TP.back();TP.notify('บันทึกข้อมูลส่วนตัวแล้ว');});

function regRender(ctx){const d=regInitContact(ctx),c=regContact(ctx),step=d.step;d.directEmail=!d.emailLocked;let body='';if(step===0){body=`<p class="reg-help">กรอกช่องที่มีเครื่องหมาย * ให้ครบ ช่องที่ระบุว่าไม่บังคับเว้นได้</p>${regContactFields(d)}${regPersonalFields(d)}${regPasswordFields(d)}`;}
if(step===1){regAddressContact(d,c);body=`<p class="reg-help">กรอกข้อมูลติดต่อและที่อยู่ปัจจุบันในช่องที่มี * ให้ครบ</p><div class="reg-name-fields">${regField(d,'addressFirst','ชื่อ',{ac:'given-name',max:50,placeholder:'ชื่อผู้ติดต่อ'})}${regField(d,'addressLast','นามสกุล',{ac:'family-name',max:50,placeholder:'นามสกุลผู้ติดต่อ'})}</div>${regField(d,'addressPhone','เบอร์โทรศัพท์มือถือ',{numeric:true,max:10,ac:'tel-national',placeholder:'เช่น 0812345678'})}${regField(d,'house','บ้านเลขที่',{ac:'address-line1',max:200})}${regField(d,'building','หมู่บ้าน / อาคาร / ห้อง / ชั้น',{optional:true,ac:'address-line2',max:200})}${regField(d,'alley','ซอย',{optional:true,max:100})}${regField(d,'road','ถนน',{optional:true,max:100})}${/ซอย|ถนน|หมู่บ้าน|อาคาร|ชั้น|ห้อง/.test(d.house||'')?'<p class="hint">ข้อมูลเดิมยังอยู่ครบในช่องบ้านเลขที่ กรุณาตรวจและแยกลงช่องที่ตรงกัน</p>':''}${regAddressSelect(d,'prov','จังหวัด')}${regAddressSelect(d,'amp','อำเภอ / เขต')}${regAddressSelect(d,'dist','ตำบล / แขวง')}${regField(d,'zip','รหัสไปรษณีย์',{numeric:true,max:5,readonly:true,placeholder:'ระบบจะเติมให้เมื่อเลือกตำบล'})}<p class="hint" id="regAddressLoadStatus" role="status">กำลังโหลดจังหวัดและพื้นที่</p><button type="button" class="txtbtn" id="regAddressRetry" hidden>โหลดข้อมูลที่อยู่อีกครั้ง</button>`;}


if(step===2)body=`<p class="reg-help">ข้อมูลของคุณช่วยให้เภสัชกรตรวจสอบความเหมาะสมของยา เลือก “ยังไม่ทราบ” ได้หากไม่แน่ใจ</p>${[['conditions','โรคประจำตัว'],['meds','ยาที่ใช้ประจำ'],['allergies','ประวัติการแพ้ยา']].map(([k,t])=>regHealthBlock(d,k,t)).join('')}${regHealthBlock(d,'food','ประวัติแพ้อาหาร')}${regDocumentBlock(d)}`;
if(step===3)body=`<p class="reg-help">ตรวจสอบข้อมูลก่อนสมัคร หากต้องการแก้ไข แตะ “แก้ไข” ในแต่ละส่วน</p>${regReview(ctx,d)}<section class="reg-consent-choices" aria-label="ความยินยอม"><div class="reg-consent-single"><input type="checkbox" id="regHealthConsent" required aria-required="true" aria-labelledby="regHealthConsentLabel" ${regConsentAccepted(d)?'checked':''}><div><label id="regHealthConsentLabel" for="regHealthConsent"><span class="reg-required" aria-hidden="true">*</span> ข้าพเจ้ายินยอมให้บริษัท มิตรอารีแคร์ จำกัด เก็บรวบรวม ใช้ และเปิดเผยข้อมูลสุขภาพของข้าพเจ้า เพื่อบริการเภสัชกรรมตามขอบเขตที่แจ้ง</label> <button type="button" class="reg-consent-link" data-sheet="registrationconsent" aria-haspopup="dialog">อ่านเพิ่มเติม</button></div></div></section>`;

const enabled=step===3?regCanSubmit(d):!d.busy;return ui.nav({title:'สมัครสมาชิก',left:step===0?'<button type="button" class="back" data-a="regCancel">ยกเลิก</button>':''})+regProgress(d)+ui.page(`<div class="registration-page"><h2 class="reg-body-heading">${REG_STEPS[step]}</h2>${d.submitError?ui.note(d.submitError,{tone:'warn',icon:'circle-alert'}):''}${body}</div>`,{cls:'registration-scroll'})+ui.dock(`<div class="reg-nav-actions${step===0?' single':''}">${step>0?`<button type="button" class="btn secondary" data-a="regBack" ${d.busy?'disabled':''}>${ic('chevron-left',20,2)}ย้อนกลับ</button>`:''}<button type="button" class="btn primary" id="regNext" data-a="regNext" ${enabled?'':'disabled'}>${d.busy?'กำลังบันทึก…':step===3?'ยืนยันและสมัครสมาชิก':'ถัดไป'}${ic('arrow-right',20,2)}</button></div>`,{});}
TP.act('regHealthMode',t=>{const d=regDraft(TP.S),key=t.closest('[data-segname]').dataset.segname.replace('regMode-',''),h=d.health[key];h.mode=t.dataset.v;if(h.mode!=='set'){h.items=[];h.other=false;h.otherText='';}d.consents={};TP.refresh({anim:false});});
TP.act('regSex',t=>{const d=regDraft(TP.S);d.sex=t.dataset.v;d.consents={};});
function regSetHealthConsent(d,on){d.consents=on?Object.fromEntries(REG_TOPICS.map(([key])=>[key,true])):{};d.healthConsentVersion=on?REG_HEALTH_POLICY.version:null;}
TP.act('regHealthConsent',t=>{regSetHealthConsent(regDraft(TP.S),t.getAttribute('aria-checked')==='true');TP.cur()?.el?._regSync?.();});
TP.act('regBack',()=>{const d=regDraft(TP.S);if(d.busy)return;if(d.step>0){d.step--;d.returnToReview=false;d.errors={};return TP.refresh({anim:false});}return TP.sheet('registrationexit');});
TP.act('regCancel',()=>{const c=TP.cur();if(c?.id!=='profile'||pfMode(c.ctx)!=='new'||regDraft(TP.S).busy)return;return TP.sheet('registrationexit');});
TP.act('regDiscard',async()=>{const c=TP.cur();if(c?.id!=='profile'||pfMode(c.ctx)!=='new'||regDraft(TP.S).busy)return;for(const f of regDraft(TP.S).documents)if(f.url?.startsWith('blob:'))URL.revokeObjectURL(f.url);await TP.closeSheet();authNewAccount(TP.S,'email','');Object.assign(TP.S,{loggedIn:false,newAccount:false,consent:false,consentVer:0,_registration:null,_registrationComplete:false,_authFlows:{},_pf:null});TP.emit('state');await TP.go('login',{root:true});});
TP.sheetDef('registrationexit',{group:'start',title:'ออกจากการสมัครสมาชิก?',code:'C106',host:'profile',hideClose:true,states:[['normal','ยืนยันก่อนออก']],notes:['ขั้นแรกยกเลิกที่มุมบน ขั้น2–4ย้อนกลับที่ด้านล่าง ไม่มีปุ่มกลับซ้ำ','กรอกต่อหรือปิดแผ่นนี้คงค่าที่กรอกไว้ทุกขั้น','ยืนยันออกจะทิ้งร่างและกลับหน้าเลือกช่องทาง ไม่สร้างบัญชีหรือยินยอมแทน'],render(){return '<p class="body">ข้อมูลที่กรอกยังไม่ได้บันทึก หากออกตอนนี้จะต้องเริ่มกรอกใหม่เมื่อกลับมาสมัครอีกครั้ง</p>';},foot(){return ui.btn('กรอกต่อ',{closeSheet:true})+ui.btn('ออกจากการสมัคร',{kind:'secondary',a:'regDiscard'});}});

TP.act('regNext',async t=>{const ctx=TP.cur()?.ctx;if(!ctx)return;const d=regInitContact(ctx);regReadInputs(TP.cur().el,d);d.errors=regErrors(d);if(Object.keys(d.errors).length){await TP.refresh({anim:false});const key=Object.keys(d.errors)[0],root=TP.cur()?.el;const input=$('#reg-'+key,root)||$('#regBirth',root);input?.scrollIntoView?.({block:'center'});input?.focus?.();return;}if(d.step<3){if(d.step===0)regAddressContact(d,regContact(ctx));d.step=d.returnToReview?3:d.step+1;d.returnToReview=false;return TP.refresh({anim:false});}if(!regCanSubmit(d)||t.disabled)return;d.busy=true;t.disabled=true;t.setAttribute('aria-busy','true');try{await TP.registrationService.save(TP.S,d,regContact(ctx));d.busy=false;delete d.password;delete d.passwordConfirm;await TP.go('registrationsuccess',{root:true});}catch{d.busy=false;d.submitError='บันทึกข้อมูลไม่สำเร็จ ข้อมูลที่กรอกยังอยู่ ลองอีกครั้งได้';TP.refresh({anim:false});}});
/* Local prototype adapter; production must replace this with authenticated, server-validated storage. */
TP.registrationService={async save(S,d,contact){if(!regCanSubmit({...d,busy:false}))throw Error('Invalid registration');if(S.st.profile==='save-error')throw Error('Preview failure');const first=d.first.trim(),last=d.last.trim();TP.freshAccount(S);/* Prototype: mock default address until the real adapter saves the C105 current address. */S.addrs=[{...TP.fresh().addrs[0],first,last,phone:d.addressPhone,main:true}];S.deliveryAddressId=null;S.branchPicked=false;Object.assign(S.user,{name:first,last,full:first+' '+last,nationalId:d.nationalId,identityAddress:{first:d.addressFirst.trim(),last:d.addressLast.trim(),phone:d.addressPhone,house:d.house.trim(),building:(d.building||'').trim(),alley:(d.alley||'').trim(),road:(d.road||'').trim(),dist:d.dist.trim(),amp:d.amp.trim(),prov:d.prov.trim(),zip:d.zip,pin:d.pin,location:d.location},birthDate:`${d.year}-${d.month.padStart(2,'0')}-${d.day.padStart(2,'0')}`,birthYear:+d.year,born:d.year,age:regAge(d),sex:d.sex,weight:d.weight,height:d.height,conditions:regHealthValues(d.health.conditions),condNone:d.health.conditions.mode==='none',conditionState:d.health.conditions.mode,meds:regHealthValues(d.health.meds),medState:d.health.meds.mode,allergies:regHealthValues(d.health.allergies),allergyState:d.health.allergies.mode==='set'?'set':d.health.allergies.mode,allergySrc:'ผู้ใช้ระบุ · รอเภสัชกรตรวจสอบ',food:regHealthValues(d.health.food).join(', '),foodNone:d.health.food.mode==='none',foodState:d.health.food.mode,allergyDocuments:d.documents.map(({name,size,type})=>({name,size,type}))});S.user[contact.channel==='email'?'email':'phone']=contact.value;if(d.contactInitialized)Object.assign(S.user,{email:d.email.trim(),phone:d.verifiedPhone,phoneVerifiedAt:d.phoneVerifiedAt,registrationProvider:d.emailProvider});Object.assign(S,{consent:true,consentVer:CN_VER,consentTopics:{...d.consents},healthConsentRecord:{documentVersion:REG_HEALTH_POLICY.version,controller:REG_HEALTH_POLICY.controller,purpose:'pharmaceutical-care',acceptedAt:new Date().toISOString(),method:'registration-checkbox',categories:REG_TOPICS.map(([key])=>key),prototype:true},firstTime:false,newAccount:false,loggedIn:true});S._registrationComplete=true;TP.emit('state');}};
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
$('#regHealthConsent',el)?.addEventListener('change',e=>{regSetHealthConsent(d,e.target.checked);sync();});
const clearConsent=()=>{d.consents={};d.submitError='';};const errors=key=>{const e=regErrors(d)[key]||'',input=$('#reg-'+key,el),msg=$('#reg-'+key+'-error',el);if(e)d.errors[key]=e;else delete d.errors[key];if(!input||!msg)return;input.setAttribute('aria-invalid',String(!!e));input.closest?.('[data-reg-field]')?.classList.toggle('err',!!e);msg.hidden=!e;msg.textContent=e;};
$$('[data-reg-input]',el).forEach(input=>{const key=input.dataset.regInput;if(key==='password'||key==='passwordConfirm')input.value=d[key]||'';const update=()=>{if(input.readOnly)return;if(key==='phone'){const value=regPhoneDigits(input.value);if(value!==d.phone)regChangePhone(d);input.value=value;}if(key==='nationalId')input.value=regIdDigits(input.value);if(key==='addressPhone')input.value=regPhoneDigits(input.value);d[key]=input.value;clearConsent();if(d.errors[key])errors(key);if(key==='password'){syncPassword();if(d.passwordConfirm)errors('passwordConfirm');}if(key==='passwordConfirm'&&d.passwordConfirm)errors(key);if(['day','month','year'].includes(key))$('#regAge',el).textContent=regAge(d)!==null?`อายุ ${regAge(d)} ปี`:'กรอกวัน เดือน และปีเกิด ค.ศ. ให้ครบ';sync();const send=$('#regPhoneSend',el);if(send)send.disabled=d.phoneBusy||!regPhoneValid(d.phone);};input.addEventListener('input',update);input.addEventListener('change',update);input.addEventListener('blur',()=>errors(key));});
$$('[data-reg-sex]',el).forEach(input=>input.addEventListener('change',()=>{if(input.checked){d.sex=input.value;clearConsent();sync();}}));
if(d.step===0){
 const code=$('#reg-phone-code',el),verify=$('#regPhoneVerify',el),resend=$('#regPhoneResend',el),expiry=$('#regPhoneExpiry',el);
 const tick=()=>{const ch=d.phoneChallenge;if(!ch)return;const seconds=Math.max(0,Math.ceil((ch.expiresAt-Date.now())/1000)),wait=Math.max(0,Math.ceil((ch.resendAt-Date.now())/1000));if(expiry)expiry.textContent=seconds?'รหัสใช้ได้อีก '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+' นาที':'รหัสหมดอายุแล้ว กรุณาขอรหัสใหม่';if(resend){resend.disabled=!!d.phoneBusy||wait>0;resend.textContent=wait?'ส่งรหัสใหม่ได้ใน '+wait+' วินาที':'ส่งรหัสใหม่';}if(verify)verify.disabled=!!d.phoneBusy||!/^\d{6}$/.test(d.phoneCode||'')||!seconds||ch.attempts>=5;};
 code?.addEventListener('input',()=>{d.phoneCode=code.value.replace(/[^0-9]/g,'').slice(0,6);code.value=d.phoneCode;tick();});
 code?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(!verify.disabled)verify.click();}});
 tick();if(d.phoneChallenge)ctx.every(tick,1000);
 if(d.focusPhoneCode){d.focusPhoneCode=false;ctx.later(()=>{code?.focus({preventScroll:true});code?.scrollIntoView({block:'center'});},0);}
}
if(d.step===1)regMountAddressSelect(el,d,sync,ctx);
const healthSync=key=>{clearConsent();const error=$('#regHealthError-'+key,el);if(error){const text=regErrors(d)[key]||'';if(text)d.errors[key]=text;else delete d.errors[key];error.textContent=text;error.hidden=!text;}sync();};
el.addEventListener('change',e=>{const input=e.target,key=input.dataset.regHealthChoice;if(!REG_HEALTH_LABELS[key]||d.busy)return;const h=d.health[key];regHealthToggle(h,input.dataset.v,input.checked);if(input.dataset.v==='__other'){const area=$('#regHealthOther-'+key,el),text=$('#reg-health-other-'+key,el);area.hidden=!h.other;input.setAttribute('aria-expanded',String(!!h.other));if(h.other)text.focus({preventScroll:true});else text.value='';}healthSync(key);});
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
    if(pfMode(ctx)!=='new')return false;
    const d=regDraft(ctx.S);if(d.busy)return false;
    const demo={...d,errors:{},consents:{}};if(!regMockInputs(demo))return false;
    const rows=TP.thaiAddressData?.rows;
    if(d.step===1&&rows){const row=rows.find(r=>r.province===(d.prov||demo.prov)&&(!d.amp||r.amphoe===d.amp)&&(!d.dist||r.district===d.dist));if(row)Object.assign(demo,{prov:row.province,amp:row.amphoe,dist:row.district,zip:String(row.zipcode)});}
    const keys=d.step===0?['email','phone','first','last','nationalId','day','month','year','weight','height',...(!d.password&&!d.passwordConfirm?['password','passwordConfirm']:[])]:['addressFirst','addressLast','addressPhone','house','building','alley','road',...(rows?['prov','amp','dist','zip']:[])];
    let changed=false;for(const key of keys)if(!String(d[key]??'').trim()){d[key]=demo[key];changed=true;}
    if(changed){d.errors={};TP.refresh({anim:false});}return true;
  },
  canFill(c){return c?.id==='profile' && pfMode(c.ctx)==='new' && !c.ctx.S._registration?.busy && [0,1].includes(c.ctx.S._registration?.step??0);},
  fillCurrent(){const c=TP.cur();if(TP.sheetOpen?.() || !this.canFill(c))return false;if(!regMockInputs(regDraft(c.ctx.S)))return false;TP.refresh({anim:false});return true;}
};
TP.previewSavedAddressPin=function(a){a.pin=true;a.location={lat:13.7585281507793,lng:100.358974455533,code:'104801',addressKey:[a.house,...(a.building?.trim()?[a.building]:[]),a.alley,a.road,a.dist,a.amp,a.prov,a.zip].map(v=>String(v||'').trim()).join('|'),verified:true,source:'DDPM',confirmedAt:new Date().toISOString()};};
function regPreview(S,state='empty'){const d=regDraft(S);if(state==='google-new'||state.startsWith('phone-')){regPreview(S,'filled');d.email='new.member@gmail.com';d.emailLocked=true;d.emailProvider='google';if(state==='google-new'){d.verifiedPhone='';d.phone='';}else if(state!=='phone-verified'){d.verifiedPhone='';if(state==='phone-change')d.phone='0899999999';if(['phone-sent','phone-wrong','phone-expired','phone-locked','phone-resend'].includes(state)){d.phoneRound=1;d.phoneChallenge=TP.authDemo.issue('phone',d.phone,1,S,'new');if(state==='phone-wrong'){d.phoneCode='000000';d.phoneError='รหัสไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';d.phoneChallenge.attempts=1;}if(state==='phone-expired'){d.phoneChallenge.expiresAt=Date.now()-1;d.phoneChallenge.resendAt=0;}if(state==='phone-locked'){d.phoneChallenge.attempts=5;d.phoneChallenge.resendAt=0;d.phoneError='กรุณาขอรหัสใหม่เพื่อยืนยันเบอร์';}if(state==='phone-resend')d.phoneChallenge.resendAt=0;}if(state==='phone-send-error')d.phoneError='ส่งรหัสไม่สำเร็จ กรุณาลองอีกครั้ง';}return;}if(state==='password-partial'||state==='password-mismatch'){regPreview(S,'filled');d.passwordConfirm=state==='password-mismatch'?'Different-Preview42!':'';if(state==='password-partial')d.password='Demo';d.errors=regErrors(d);return;}if(['address-split','address-legacy','address-details-invalid'].includes(state)){regPreview(S,'address');Object.assign(d,{house:'88/12',building:'หมู่บ้านมิตรอารี อาคารบี ห้อง 1201 ชั้น 12',alley:'ทวีวัฒนา 25',road:'เลียบคลองทวีวัฒนา'});if(state==='address-legacy')Object.assign(d,{house:'88/12 หมู่บ้านมิตรอารี ซอยทวีวัฒนา 25 ถนนเลียบคลองทวีวัฒนา',building:'',alley:'',road:''});if(state==='address-details-invalid')d.building='ก'.repeat(201);d.errors=regErrors(d);return;}if(state.startsWith('map-')){regPreview(S,'address');d.pin=false;d.location=null;if(state==='map-saved')TP.previewSavedAddressPin(d);return;}if(['national-id-short','national-id-format','national-id-checksum'].includes(state)){regPreview(S,'filled');d.step=0;d.nationalId=state==='national-id-short'?'110170020345':state==='national-id-format'?'11017002034AB':'1101700203459';d.errors=regErrors(d);return;}if(['address-select','address-missing-phone','address-invalid-phone','health-text'].includes(state)){regPreview(S,state==='health-text'?'health':'address');if(state==='address-select')Object.assign(d,{prov:'',amp:'',dist:'',zip:''});if(state==='address-missing-phone')d.addressPhone='';if(state==='address-invalid-phone')d.addressPhone='0212345678';if(state==='health-text')for(const [key,h]of Object.entries(d.health))Object.assign(h,{mode:'set',text:'ข้อมูลตัวอย่าง '+REG_HEALTH_LABELS[key]});d.errors=regErrors(d);return;}if(['filled','registration-back','address','address-search','address-no-results','address-error','health','health-empty','health-filled','review','consent-partial','consent-ready','save-error','health-none','health-no-results','health-documents','health-doc-error'].includes(state)||state.startsWith('conditions-')||state==='health-all-other'||state==='health-doc-limit'){Object.assign(d,{email:d.email||'somjai@example.com',phone:'0812345678',verifiedPhone:'0812345678',phoneVerifiedAt:new Date().toISOString(),contactInitialized:true,first:'สมใจ',last:'ใจดี',nationalId:'1101700203450',password:REG_PREVIEW_PASSWORD,passwordConfirm:REG_PREVIEW_PASSWORD,day:'15',month:'6',year:'1988',weight:'55',height:'160',addressFirst:'สมใจ',addressLast:'ใจดี',addressPhone:'0812345678',house:'88/12',building:'',alley:'ซอยทวีวัฒนา',road:'',dist:'ทวีวัฒนา',amp:'ทวีวัฒนา',prov:'กรุงเทพมหานคร',zip:'10170'});const base=d.nationalId.slice(0,12);let sum=0;for(let i=0;i<12;i++)sum+=(13-i)*+base[i];d.nationalId=base+((11-sum%11)%10);}
if(state==='error')Object.assign(d,{first:'สมใจ',last:'ใจดี',nationalId:'123',day:'31',month:'2',year:'2025',weight:'0',height:'160',errors:{nationalId:'ตรวจสอบเลขบัตรประชาชน 13 หลัก',day:'วันที่นี้ไม่มีในปฏิทิน',weight:'กรอกน้ำหนักมากกว่า 0'}});
if(state==='registration-back')d.step=1;if(state.startsWith('address'))d.step=1;if(state==='address-search')d.addressQuery='10170';if(state==='address-no-results')d.dist='ตำบลตัวอย่างที่ไม่มี';if(state.startsWith('health'))d.step=2;if(state==='health-empty')d.health.meds.mode='set';if(state==='health-none')for(const h of Object.values(d.health))h.mode='none';if(state==='health-no-results')Object.assign(d.health.meds,{mode:'set',other:true,otherText:''});if(state==='health-documents'||state==='health-doc-limit'){d.documents=[{name:'บัตรแพ้ยา-ตัวอย่าง.png',type:'image/png',size:248832,url:'/assets/preview/allergy-document.svg'},{name:'เอกสารประกอบ-ตัวอย่าง.pdf',type:'application/pdf',size:524288}];if(state==='health-doc-limit')for(let n=3;n<=5;n++)d.documents.push({name:`เอกสารตัวอย่าง-${n}.pdf`,type:'application/pdf',size:n*102400});}if(state==='health-doc-error')d.docError='ไฟล์นี้ไม่รองรับ กรุณาเลือก JPG, PNG, WEBP หรือ PDF ไม่เกิน 5 MB';if(state==='health-all-other')for(const [key,h]of Object.entries(d.health))Object.assign(h,{mode:'set',items:[REG_LISTS[key][0]],other:true,otherText:'ข้อมูลเพิ่มเติมที่ผู้ใช้ระบุ'});if(state==='health-filled'){d.health.conditions={mode:'set',items:['ความดันโลหิตสูง']};d.health.food={mode:'set',items:['ไข่']};}if(['review','consent-partial','consent-ready','save-error'].includes(state))d.step=3;if(state==='consent-partial')d.consents={weight:true,height:true};if(['consent-ready','save-error'].includes(state)){d.consents=Object.fromEntries(REG_TOPICS.map(([k])=>[k,true]));d.healthConsentVersion=REG_HEALTH_POLICY.version;}if(state==='save-error')d.submitError='บันทึกข้อมูลไม่สำเร็จ ข้อมูลที่กรอกยังอยู่ ลองอีกครั้งได้';if(state.startsWith('conditions-')){d.step=2;d.health.conditions={mode:'set',items:['ความดันโลหิตสูง','โรคเบาหวาน']};if(state.includes('other'))Object.assign(d.health.conditions,{other:true,otherText:state==='conditions-other'?'โรคหอบหืด':''});if(state==='conditions-other-empty')d.errors.conditions='กรอกโรคประจำตัวอื่น ๆ';if(state==='conditions-no-results')Object.assign(d.health.conditions,{other:true,otherText:''});}if(state==='review-documents'){regPreview(S,'health-documents');d.step=3;}if(state.startsWith('dob-')){regPreview(S,'filled');d.step=0;}}
TP.screen('registrationsuccess',{group:'start',title:'สมัครสมาชิกสำเร็จ',code:'C108',cls:'auth-cover-screen registration-welcome-screen',sb:'dark',states:[['normal','สมัครสำเร็จด้วยเบอร์โทร'],['email','สมัครสำเร็จด้วยอีเมล', false],['unavailable','ยังสมัครไม่เสร็จ',false],['long-name','ชื่อจริงยาว'],['no-name','ไม่มีชื่อแสดง',false],['full-cover','ปกเต็มจอและปุ่มใต้คำต้อนรับ', false]],notes:['หน้าต้อนรับหลังบันทึกข้อมูล แสดงชื่อจริงและปุ่มเริ่มใช้งาน ไปแนะนำแอป C112','ระบบยืนยันและบันทึกยังเป็นต้นแบบ ไม่ได้ส่งข้อมูลจริง'],prep(S){S._registrationComplete=S.st.registrationsuccess!=='unavailable';S.loggedIn=S._registrationComplete;Object.assign(S.user,{name:'สมใจ',full:'สมใจ ใจดี',email:S.st.registrationsuccess==='email'?'somjai@example.com':'',phone:S.st.registrationsuccess==='email'?'':'0812345678'});if(S.st.registrationsuccess==='long-name')S.user.name='กาญจนาภัทรวรรณ';if(S.st.registrationsuccess==='no-name')S.user.name='';},render(ctx){const S=ctx.S;if(!S._registrationComplete)return ui.nav({title:'สมัครสมาชิก'})+ui.page(ui.empty({title:'ยังสมัครสมาชิกไม่เสร็จ',body:'กลับไปตรวจสอบข้อมูลและความยินยอม',icon:'clipboard-list',btn:{label:'กลับไปสมัคร',go:'profile'}}));return `<div class="auth-cover registration-welcome" aria-label="สมัครสมาชิกสำเร็จ"><img class="auth-cover-photo reg-welcome-cover" src="/assets/auth/registration-welcome-full-v3.png" alt="" width="864" height="1824" fetchpriority="high"><div class="auth-cover-content reg-welcome-copy"><div class="reg-welcome-message"><p class="reg-welcome-status">สมัครสมาชิกเรียบร้อยแล้ว</p><h1>ยินดีต้อนรับ${S.user.name?`<br><span>คุณ${esc(S.user.name)}</span>`:''}</h1><p class="auth-cover-subtitle">พร้อมให้เภสัชกรดูแลคุณแล้ว</p><div class="auth-cover-actions">${ui.btn('เริ่มใช้งาน',{go:'onboard',root:true,iconRight:'arrow-right'})}</div></div></div></div>`;}});

TP.screen('profile', {
  group: 'start', title: 'ข้อมูลของคุณและความยินยอม', code: 'C105', ref: 'C02', cls: 'st-cn',
  states: [['empty', 'สมัครใหม่: ยังไม่กรอก'], ['filled', 'เบอร์ใหม่: กรอกแล้ว'], ['error', 'ปีเกิดไม่ถูกต้อง'], ['acct', 'มีบัญชีเว็บ: ความยินยอมฉบับใหม่'], ['email', 'สมัครใหม่ด้วยอีเมลที่ยืนยันแล้ว'],['address','ขั้นที่อยู่ พร้อมค้นหาอัตโนมัติ'],['address-no-results','ค้นหาที่อยู่ไม่พบ กรอกเองได้'],['address-error','ตัวช่วยที่อยู่โหลดไม่สำเร็จ'],['health','ขั้นข้อมูลสุขภาพ ยังไม่ทราบ'],['health-empty','ระบุข้อมูลสุขภาพ แต่ยังไม่มีรายการ'],['health-filled','ข้อมูลสุขภาพหลายรายการ'],['review','ตรวจทานและความยินยอม ยังไม่ติ๊ก'],['consent-partial','ความยินยอมเก่าไม่แทนการเลือกฉบับใหม่', false],['consent-ready','เลือกยินยอมแล้ว พร้อมสมัคร'],['save-error','บันทึกไม่สำเร็จ ข้อมูลยังอยู่'],['health-none','ไม่มีประวัติสุขภาพ โดยผู้ใช้เลือกเอง'],['health-no-results','ยาไม่อยู่ในลิสต์ ใช้อื่น ๆ', false],['health-documents','แนบเอกสารแพ้ยาแล้ว'],['health-doc-error','ไฟล์แนบไม่ผ่านเงื่อนไข'],['quick-fill','ปุ่มมอคข้อมูลใต้ป้ายชื่อหน้า', false],['address-search','ค้นหาที่อยู่และเติมอัตโนมัติ', false],['conditions-multi','ระบุโรคประจำตัว'],['conditions-other','ระบุโรคอื่น ๆ'],['conditions-other-empty','เลือกอื่น ๆ แต่ยังไม่กรอก'],['conditions-no-results','โรคที่ไม่มีในลิสต์ ใช้อื่น ๆ', false],['registration-back','ย้อนกลับเพื่อแก้ไขข้อมูล', false],['health-all-other','เลือกหลายข้อและอื่น ๆ ทุกกลุ่มสุขภาพ'],['health-doc-limit','แนบเอกสารครบ 5 ไฟล์'],['review-documents','ตรวจทานไฟล์แนบ รูปย่อและชื่อไฟล์'],["dob-years", "วันเกิด: ล้อหมุน"], ["dob-months", "วันเกิด: เลือกเดือน", false], ["dob-days", "วันเกิด: เลือกวัน", false], ["dob-selected", "วันเกิด: ค่าเดิม", false], ["dob-leap", "วันเกิด: ปีอธิกสุรทิน"], ["dob-future", "วันเกิด: จำกัดถึงวันนี้"], ["dob-oldest", "วันเกิด: ปี 1900"],['address-select','เลือกจังหวัด อำเภอ ตำบล'],['address-missing-phone','ที่อยู่ยังไม่กรอกเบอร์'],['address-invalid-phone','รูปแบบเบอร์ติดต่อไม่ถูกต้อง'],['health-text','ระบุสุขภาพด้วยข้อความ'],['national-id-short','เลขประชาชนไม่ครบ 13 หลัก'],['national-id-format','เลขประชาชนมีตัวอักษร'],['national-id-checksum','เลขประชาชนครบแต่เลขตรวจสอบผิด'],['map-ready', '', false],['map-outside', '', false],['map-error', '', false],['map-saved', '', false],['address-split','ที่อยู่แยกบ้านเลขที่ อาคาร ซอย ถนน'],['address-legacy','ที่อยู่เดิมยังอยู่ครบ ไม่แยกอัตโนมัติ'],['address-details-invalid','รายละเอียดอาคารยาวเกินกำหนด'],['personal-edit','แก้ไขข้อมูลส่วนตัว'],['personal-edit-invalid','แก้ไขข้อมูลส่วนตัวไม่ครบ'],['password-partial','รหัสผ่านยังไม่ครบเงื่อนไข'],['password-mismatch','รหัสผ่านยืนยันไม่ตรงกัน'],['google-new','Google สมาชิกใหม่ อีเมลแก้ไม่ได้'],['phone-entry','กรอกเบอร์ ขอ SMS OTP'],['phone-sent','ส่ง SMS แล้ว กรอกรหัสในฟอร์ม'],['phone-wrong','รหัส OTP ไม่ถูกต้อง'],['phone-expired','OTP หมดอายุ ขอใหม่ได้'],['phone-locked','OTP ผิดครบจำนวน ขอใหม่'],['phone-resend','ส่งรหัสใหม่ได้'],['phone-verified','ยืนยันเบอร์แล้ว ไปขั้นที่อยู่'],['phone-change','เปลี่ยนเบอร์ ต้องยืนยันใหม่'],['phone-send-error','ส่ง SMS ไม่สำเร็จ ลองอีกครั้ง']],
  notes:['สมัครใหม่: ข้อมูลส่วนตัว → ที่อยู่ปัจจุบัน → สุขภาพ → ตรวจทานและยินยอม → C108 สมัครสำเร็จ ไม่มีหน้าไม่ยินยอม','สมัครสำเร็จแล้วตั้งที่อยู่ปัจจุบันเป็นที่อยู่หลัก หน้าแรก C201 จึงมีที่อยู่จัดส่งทันที ต้นแบบใช้ที่อยู่จำลองแทนค่าที่กรอก','อีเมล/เบอร์ที่ผ่าน OTP แล้วแสดงสถานะยืนยัน ผู้สมัครใหม่ตั้งและยืนยันรหัสผ่านในขั้นข้อมูลส่วนตัว','อ้างอิงช่องฟอร์มจากภาพเว็บที่ผู้ใช้ส่ง 1 พ.ย. 2026; ตัวเลือกยาเป็นรายการตัวอย่าง กรอกเองได้','ไม่ตั้งค่าไม่มีโรคหรือไม่แพ้ยาให้เอง; ผู้ใช้เลือกยังไม่ทราบได้','ที่อยู่ปัจจุบันไม่ถูกนำไปบันทึกเป็นที่อยู่จัดส่งโดยอัตโนมัติ','ความยินยอม1ช่องสำหรับบริการเภสัชกรรม ไม่ติ๊กล่วงหน้า เปิดC107อ่านอย่างเดียว ไม่รวมการตลาด; การบันทึกยังเป็นต้นแบบ','มีบัญชีเดิม/แก้ไขข้อมูลใช้เส้นทางเดิม คงข้อมูลและความยินยอม'],
  prep(S) {
    const st = S.st.profile;
    if(st?.startsWith('personal-edit')){S._profileEdit=null;if(st==='personal-edit-invalid'){const d=pfEditDraft(S);d.first='';d.errors=pfEditErrors(d);}return;}
    S._registration=null;S._registrationComplete=false;
    if(st==='email')authNewAccount(S,'email','new@example.com');
    S._pf = st === 'filled' ? { first: 'สมศรี', last: 'มีสุข', year: '1968', sex: 'f' } : st === 'error' ? { first: 'สมศรี', last: 'มีสุข', year: '2511', sex: 'none' } : { first: '', last: '', year: '', sex: 'none' };
    Object.assign(S, { firstTime: true, newAccount: st !== 'acct', loggedIn: true, consent: false, consentVer: st === 'acct' ? 2 : CN_VER });
    if(st!=='acct')regPreview(S,st);
    if(st==='quick-fill')regMockInputs(regDraft(S));
  },
  render(ctx) {
    const S = ctx.S, d = S._pf || (S._pf = { first: '', last: '', year: '', sex: 'none' }), err = ctx.state === 'error', m = pfMode(ctx);
    if(m==='new')return regRender(ctx);if(m==='edit')return pfEditRender(ctx);
    const ph = ctx.params.email || (ctx.state==='email'?S.user.email:'') || maskPhone(ctx.params.phone || ctx.params.acct || digits(S.user.phone));
    const form = m === 'acct' ? pfAcctOk(S, ph) : `
      <p class="st-pf-ok" data-in="1">${ui.tag(m === 'edit' ? 'เบอร์ในบัญชี' : ctx.params.email||ctx.state==='email' ? 'ยืนยันอีเมลแล้ว' : 'ยืนยันเบอร์แล้ว', 'ok', { dot: true })}<span class="num">${esc(ph)}</span></p>
      <div class="st-pf-name" data-in="2">${pfField('first', { label: 'ชื่อ', ph: 'ชื่อจริง', ac: 'given-name', max: 50 }, d)}${pfField('last', { label: 'นามสกุล', ph: 'นามสกุล', ac: 'family-name', max: 50 }, d)}</div>
      <div class="mt16" data-in="3">${pfField('year', { label: 'ปีเกิด (ค.ศ.)', ph: 'เช่น 1988', ac: 'bday-year', im: 'numeric', max: 4, hint: ageText(d.year) }, d, err)}</div>
      <div class="field mt16" data-in="4"><span class="f-l" id="pf-sex-l">เพศ <span class="opt-t">(ไม่บังคับ)</span></span>
        <div class="chips st-sex" role="radiogroup" aria-labelledby="pf-sex-l" data-radio-scope>${SEXES.map(([v, l]) => `<button type="button" class="chip" role="radio" data-radio="sex" data-v="${v}" aria-checked="${d.sex === v}"><svg class="ck-i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>${l}</button>`).join('')}</div></div>`;
    const address = m === 'new' ? `<section class="ds-form-section" aria-labelledby="pfAddressTitle"><h3 class="group-h" id="pfAddressTitle">ที่อยู่ของคุณ</h3><p class="hint">บันทึกไว้สำหรับจัดส่งยา แก้ไขได้ภายหลัง</p><div class="mt16">${pfField('house',{label:'บ้านเลขที่',ph:'เช่น 88/12',ac:'address-line1',max:200},d)}${pfField('building',{label:'หมู่บ้าน / อาคาร / ห้อง / ชั้น (ไม่บังคับ)',ph:'ชื่อหมู่บ้าน อาคาร ห้อง หรือชั้น',ac:'address-line2',max:200},d)}${pfField('alley',{label:'ซอย (ไม่บังคับ)',ph:'เช่น ทวีวัฒนา 25',ac:'off',max:100},d)}${pfField('road',{label:'ถนน (ไม่บังคับ)',ph:'เช่น เลียบคลองทวีวัฒนา',ac:'off',max:100},d)}</div><div class="ds-form-grid">${[['dist','ตำบล / แขวง','address-level3',60],['amp','อำเภอ / เขต','address-level2',60],['prov','จังหวัด','address-level1',60],['zip','รหัสไปรษณีย์','postal-code',5]].map(([k,label,ac,max]) => pfField(k,{label,ph:label,ac,max,im:k === 'zip' ? 'numeric' : ''},d)).join('')}</div></section>` : '';
    const tail = m === 'edit' ? `<p class="st-pf-fine" data-in="5">${ic('lock', 14, 2)}<span>ใช้ในบัญชีและการปรึกษาของคุณเท่านั้น</span></p>` : pfConsent(m === 'acct');
    const head = m === 'edit' ? { lt: 'ข้อมูลส่วนตัว', sub: 'เปลี่ยนเบอร์โทรได้ที่ฝ่ายบริการลูกค้า' }
      : m === 'acct' ? { lt: 'ยินดีต้อนรับ', sub: 'ใช้บัญชีเดียวกับเว็บไซต์ MITRAREE · ให้ความยินยอมฉบับปัจจุบันก่อนเข้าสู่หน้าหลัก' }
      : { lt: 'ข้อมูลของคุณ', sub: `เภสัชกรต้องรู้ชื่อและอายุเพื่อแนะนำและคำนวณขนาดยาให้ปลอดภัย · บันทึกการปรึกษาเก็บ 1 ปีนับจากวันปิดเคส ${nw('ตามกฎ อย.')}` };
    const dock = m === 'edit' ? ui.btn('บันทึก', { id: 'pfGo' })
      : `<div class="btn-row st-cn-row"><button type="button" class="btn primary st-cn-go" id="pfGo" aria-disabled="true"><span>ยินยอมและเข้าสู่หน้าหลัก</span></button></div>`;
    return ui.nav(m === 'edit' ? { back: true, title: 'ข้อมูลส่วนตัว' } : { title: m === 'acct' ? 'ความยินยอม' : 'ข้อมูลของคุณ' }) + ui.page((m === 'acct' ? form : `<section class="ds-form-section" aria-labelledby="pfDetailsTitle"><h3 class="group-h" id="pfDetailsTitle">ข้อมูลส่วนตัว</h3>${form}</section>`) + address + tail, head) + ui.dock(dock);
  },
  mount(el, ctx) {
    const S = ctx.S, d = S._pf, m = pfMode(ctx), go = $('#pfGo', el), cn = $('#pfCn', el), cnE = $('#pfCnE', el);
    if(m==='new')return regMount(el,ctx);if(m==='edit')return pfEditMount(el,ctx);
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
        go.disabled = true;
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
      if (m === 'new') S.addrs = [{ id: 'a1', first, last, phone: p || digits(S.user.phone), house: d.house.trim(), building:(d.building||'').trim(),alley:(d.alley||'').trim(),road:(d.road||'').trim(), dist: d.dist.trim(), amp: d.amp.trim(), prov: d.prov.trim(), zip: d.zip, main: true, pin: false }];
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
      go.classList.add('busy'); go.setAttribute('aria-busy', 'true');
      await sleep(ctx, 650);
      save();
      if (m === 'edit') { TP.emit('state'); TP.back(); TP.notify('บันทึกข้อมูลส่วนตัวแล้ว', { icon: 'circle-check' }); return; }
      TP.saveHealthConsent(S,TP.healthConsentVersion(),'profile-checkbox');
      Object.assign(S, { firstTime: false, newAccount: false });
      TP.emit('state');
      await TP.go('home', { via: 'none', root: true });
      // Stay on home after registration or updated consent.
      TP.notify(m === 'acct' ? 'บันทึกความยินยอมแล้ว' : 'บันทึกข้อมูลและความยินยอมแล้ว', { icon: 'circle-check' });
    });
    if (ctx.state === 'empty' && m === 'new') ctx.later(() => $('#pf-first', el)?.focus({ preventScroll: true }), 650);
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
  S._paymentCase=null;S._homeEventPreview=false;
  const id='TC-'+Date.now().toString(36)+'-'+(TP._caseSerial=(TP._caseSerial||0)+1);
  S.case = {
    id, caseCode: TP.caseCode(id), who: 'me', symptoms: [...I.symptoms], urgent: [...I.urgent], note: [I.note,I.otherOpen?I.otherText:''].filter(v=>v?.trim()).join('\n'), photos: (I.attachments||[]).length, attachments:[...(I.attachments||[])], mode: I.mode,
    deliveryAddress:TP.homeAddress?.()?structuredClone(TP.homeAddress()):null, branch: b.id, pharm: b.pharm, status: S.branchState[b.id] === 'pause' ? 'paused' : 'queue',
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
    if(key==='payment'){TP.makeOrder();c.msgs=[{kind:'provider-ready'},{who:'me',kind:'intake'},{kind:'order'}];c.step=99;c.hold=true;}
    if(['finished','cancelled','expired'].includes(key))c.status=key==='finished'?'closed':key;
    if(['closed-unpaid','payment-soon','closed-payexpired'].includes(key)){c.date=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date());c.status='closed';TP.makeOrder();TP.startOrderPayment(c.order);if(TP.ORDER_ITEMS?.length===3){c.order.items=TP.ORDER_ITEMS.map(i=>({...i}));c.order.total=c.order.items.reduce((n,i)=>n+i.price,0);}if(key==='payment-soon')c.order.expiresAt=Date.now()+60000;if(key==='closed-payexpired'){c.order.expiresAt=Date.now()-1;TP.expireOrder(c);}c.msgs=[{kind:'provider-ready'},{who:'me',kind:'intake'},{kind:'order'},{kind:'summary',by:'ph',time:TP.NOW.time}];}
    if(key==='video-request'){S.call=null;c.status='room';c.hold=true;c.step=0;c.msgs=[{kind:'provider-ready'},{who:'me',kind:'intake'},{kind:'video-request',id:'preview-video-request',status:'pending',time:TP.NOW.time}];}
    if(['matched','chat','reply'].includes(key)){c.msgs=[{kind:'provider-ready'},{who:'me',kind:'intake'}];c.step=99;c.hold=true;}
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
const stateTag = st => st === 'open' ? ui.tag('เปิดรับบริการ', 'ok', { dot: true, live: true }) : st === 'pause' ? ui.tag('ปิดรับชั่วคราว', 'warn', { dot: true }) : ui.tag('ปิดรับบริการ', 'muted', { dot: true });
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
const homeBranchClosed = (S, b) => S.sysOff || S.storeOpen === false || (S.branchState[b.id] || (b.demo ? 'open' : 'closed')) === 'closed';
const homeBranchOutside = b => !!TP.homeAddress() && (TP.homeDistance(b) ?? Infinity) > TP.ZONE_KM;
const homeBranchStatus = (S, b) => homeBranchOutside(b) ? [TP.homeDistance(b) == null ? 'ตรวจสอบพื้นที่ไม่ได้' : 'นอกพื้นที่ให้บริการ', 'muted']
  : homeBranchClosed(S, b) ? ['ปิดรับบริการ', 'muted']
  : S.branchState[b.id] === 'pause' ? ['ปิดรับชั่วคราว', 'warn'] : ['เปิดรับบริการ', 'ok'];
/* Selection uses the selected delivery address. A busy branch never blocks: the customer joins the shortest known queue among open branches, nearest first. */
TP.quickConsultBranch = () => {
  if (!TP.homeAddress()) return {reason:'address'};
  const stores=TP.homeStores();
  if (!stores.length) return {reason:'area'};
  if (TP.S.sysOff || TP.S.storeOpen===false) return {reason:'unavailable'};
  const open=stores.filter(b=>!homeBranchClosed(TP.S,b)&&(TP.S.branchState[b.id]||(b.demo?'open':'closed'))==='open');
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
    TP.notify('ยังไม่พบร้านในพื้นที่ที่เลือก',{icon:'info'});
    return TP.go('home',{root:true});
  }
  S.branch=result.branch.id;S.branchPicked=true;S.autoReason='';
  return TP.ACTS.hmStart({dataset:{mode:'chat'}});
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
  <div class="hm-address-card-head"><b>${esc(a.first)} ${esc(a.last)}</b>${a.main ? '<span class="tag">ที่อยู่หลัก</span>' : ''}</div>
  <p>${esc(a.phone)}</p><p>${esc(TP.fmtAddr(a))}</p>
  <div class="hm-address-actions">${picker ? `<button type="button" class="btn sm ${a.id === TP.homeAddress()?.id ? 'secondary' : ''}" data-a="hmSelectAddress" data-v="${esc(a.id)}">${a.id === TP.homeAddress()?.id ? 'เลือกอยู่' : 'ใช้ที่อยู่นี้'}</button>` : `<button type="button" class="btn secondary sm" data-a="hmEditAddress" data-v="${esc(a.id)}">แก้ไข</button><button type="button" class="btn sm ${a.main ? 'secondary' : ''}" data-a="hmMainAddress" data-v="${esc(a.id)}" ${a.main ? 'disabled' : ''}>${a.main ? 'ที่อยู่หลัก' : 'ตั้งเป็นที่อยู่หลัก'}</button>`}</div>
</article>`).join('');
const addressEmpty = () => `<div class="hm-empty">${ui.emptyArt('map-pin')}<h3>ยังไม่มีที่อยู่จัดส่ง</h3><p>เพิ่มที่อยู่เพื่อค้นหาร้านยาในบริเวณนั้น</p>${ui.btn('เพิ่มที่อยู่', { a: 'hmNewAddress', icon: 'plus' })}</div>`;
TP.sheetDef('homeaddress', {
  group: 'before', title: 'เลือกที่อยู่จัดส่ง', code: 'C210', host: 'home', tall: true,
  states: [['normal', 'มีที่อยู่'], ['empty', 'ยังไม่มีที่อยู่'], ['named', 'ที่อยู่ตั้งชื่อเอง', false]],
  prep(S) { if (S.st.homeaddress === 'empty') { S.addrs = []; S.deliveryAddressId = null; } },
  render(ctx) { return `<p class="small">เลือกรายการเพื่อดูร้านยาใกล้ฉันนี้ การเลือกไม่เปลี่ยนที่อยู่หลัก</p><div class="hm-address-list">${ctx.S.addrs?.length ? homeAddressCards(ctx.S, true) : addressEmpty()}</div>`; },
  foot: () => ui.btn('จัดการสมุดที่อยู่', { a: 'hmAddressBook', kind: 'secondary', icon: 'map-pin' })
});
const ADDRESS_MAIN_ALERT = 'ตั้งเป็นที่อยู่หลักแล้ว', ADDRESS_SAVED_ALERT = 'บันทึกที่อยู่แล้ว';
TP.screen('addressbook', {
  group: 'account', title: 'สมุดที่อยู่', code: 'C514', parent: 'account',
  states: [['normal', 'มีที่อยู่หลัก'], ['empty', 'ยังไม่มีที่อยู่', false], ['alternate', 'เปลี่ยนที่อยู่หลัก', false], ['named', 'ชื่อที่อยู่ บ้านแม่', false], ['main-changed', 'แจ้งเตือน ตั้งเป็นที่อยู่หลักแล้ว'], ['address-saved', 'แจ้งเตือน บันทึกที่อยู่แล้ว']],
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
  render(ctx) { return ui.nav({ back: true, title: 'สมุดที่อยู่' }) + ui.page(`<div class="hm-address-list">${ctx.S.addrs?.length ? homeAddressCards(ctx.S, false) : addressEmpty()}</div>${ctx.S.addrs?.length ? `<div class="mt16">${ui.btn('เพิ่มที่อยู่ใหม่', { a: 'hmNewAddress', icon: 'plus' })}</div>` : ''}`); }
});
const addressFields = [['first','ชื่อ','text'],['last','นามสกุล','text'],['phone','เบอร์โทรศัพท์มือถือ','tel'],['house','บ้านเลขที่','text'],['building','หมู่บ้าน / อาคาร / ห้อง / ชั้น','text',true],['alley','ซอย','text',true],['road','ถนน','text',true],['prov','จังหวัด','text'],['amp','อำเภอ / เขต','text'],['dist','ตำบล / แขวง','text'],['zip','รหัสไปรษณีย์','text']];
TP.screen('addressedit', {
  group: 'account', title: 'เพิ่ม / แก้ไขที่อยู่', code: 'C515', parent: 'addressbook',
  states: [['normal', 'เพิ่มที่อยู่'], ['edit', 'แก้ไขที่อยู่'], ['invalid', 'ข้อมูลไม่ครบ', false], ['named', 'แก้ไขชื่อที่อยู่', false],['map-ready', '', false],['map-outside', '', false],['map-error', '', false],['form-required','ไม่กรอกข้อมูลบังคับ'],['form-phone','เบอร์มือถือผิดรูปแบบ'],['form-name','ชื่อมีตัวเลข', false],['form-area','พื้นที่ยังเลือกไม่ครบ'],['map-saved', '', false],['form-split','ที่อยู่แยกบ้านเลขที่ อาคาร ซอย ถนน', false],['form-legacy','ที่อยู่เดิมยังอยู่ครบ ไม่แยกอัตโนมัติ'],['form-details','รายละเอียดอาคารยาวเกินกำหนด', false],['form-address-label','ยังไม่กรอกชื่อที่อยู่', false]],
  prep(S) { if(S.st.addressedit?.startsWith('form-')){S.addrs=TP.fresh().addrs;const a=S.addrs[0];S._homeEditAddress=a.id;if(S.st.addressedit==='form-required')for(const k of ['first','last','phone','house','prov','amp','dist','zip'])a[k]='';if(S.st.addressedit==='form-phone')a.phone='0212345678';if(S.st.addressedit==='form-area'){a.amp='';a.dist='';a.zip='';}if(S.st.addressedit==='form-legacy')Object.assign(a,{house:'88/12 หมู่บ้านมิตรอารี ซอยทวีวัฒนา 25 ถนนเลียบคลองทวีวัฒนา',building:'',alley:'',road:''});a.pin=false;a.location=null;} if(S.st.addressedit?.startsWith('map-')){S.addrs=TP.fresh().addrs;S._homeEditAddress=S.addrs[0].id;S.addrs[0].pin=false;S.addrs[0].location=null;if(S.st.addressedit==='map-saved'){const a=S.addrs[0];TP.previewSavedAddressPin(a);}} if (S.st.addressedit === 'edit') S._homeEditAddress = S.addrs?.[0]?.id; if (S.st.addressedit === 'invalid') { S._homeAddressInvalid = true; S._homeEditAddress = S.addrs?.[0]?.id; if(S.addrs?.[0])S.addrs[0].phone=''; } },
  render(ctx) {
    const stored=(ctx.S.addrs||[]).find(a=>a.id===ctx.S._homeEditAddress)||{};
    const a={...stored};
    const field=([key,label,type,optional])=>{
      const id='home-address-'+key,area=['prov','amp','dist'].includes(key);
      const attrs=`required aria-required="true" aria-describedby="${id}-error" aria-invalid="false"`;
      return `<div class="field" data-address-field="${key}"><label for="${id}">${label} ${optional?'<span class="opt-t">(ไม่บังคับ)</span>':'<span class="reg-required" aria-hidden="true">*</span>'}</label>${area?`<select class="input" id="${id}" name="${key}" ${attrs} disabled><option value="${esc(a[key]||'')}">${esc(a[key]||'เลือก'+label)}</option></select>`:`<input class="input" id="${id}" name="${key}" type="${type}" value="${esc(a[key]||'')}" ${optional?`aria-describedby="${id}-error" aria-invalid="false"`:attrs} maxlength="${['house','building'].includes(key)?200:['alley','road'].includes(key)?100:key==='phone'?10:key==='zip'?5:50}" ${key==='phone'?'inputmode="numeric" autocomplete="tel-national" pattern="0[689][0-9]{8}" placeholder="เช่น 0812345678"':key==='zip'?'inputmode="numeric" pattern="[0-9]{5}" readonly placeholder="ระบบจะเติมให้เมื่อเลือกตำบล"':key==='first'?'autocomplete="given-name" placeholder="ชื่อผู้ติดต่อ"':key==='last'?'autocomplete="family-name" placeholder="นามสกุลผู้ติดต่อ"':key==='house'?'autocomplete="address-line1" placeholder="เช่น 88/12"':key==='building'?'autocomplete="address-line2" placeholder="ชื่อหมู่บ้าน อาคาร ห้อง หรือชั้น"':key==='alley'?'placeholder="เช่น ทวีวัฒนา 25"':key==='road'?'placeholder="เช่น เลียบคลองทวีวัฒนา"':''}>`}<p class="err-t" id="${id}-error" role="alert" hidden></p></div>`;
    };
    return ui.nav({back:true,title:stored.id?'แก้ไขที่อยู่':'เพิ่มที่อยู่'})+ui.page(`<div class="hm-address-form registration-page"><p class="reg-help">กรอกข้อมูลติดต่อและที่อยู่ปัจจุบันในช่องที่มี <span class="reg-required" aria-hidden="true">*</span> ให้ครบ</p>${/ซอย|ถนน|หมู่บ้าน|อาคาร|ชั้น|ห้อง/.test(a.house||'')?'<p class="hint">ข้อมูลเดิมยังอยู่ครบในช่องบ้านเลขที่ กรุณาตรวจและแยกลงช่องที่ตรงกัน</p>':''}<div class="reg-name-fields">${addressFields.slice(0,2).map(field).join('')}</div>${addressFields.slice(2).map(field).join('')}<p class="hint" id="homeAddressLoadStatus" role="status">เลือกจังหวัด ตามด้วยอำเภอและตำบล ระบบจะเติมรหัสไปรษณีย์ให้</p><label class="hm-primary-check reg-consent-single"><input type="checkbox" id="home-address-main" ${a.main||!ctx.S.addrs?.length?'checked':''}><span>ตั้งเป็นที่อยู่หลัก</span></label><p id="home-address-error" class="danger-t" role="alert">${ctx.state==='invalid'||ctx.S._homeAddressInvalid?'กรุณากรอกข้อมูลให้ครบและตรวจสอบเบอร์โทรกับรหัสไปรษณีย์':''}</p>${ui.btn('บันทึกที่อยู่',{a:'hmSaveAddress'})}</div>`);
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
  TP.saveHomePreferences(); TP.refresh({ anim: false }); TP.notify(ADDRESS_MAIN_ALERT, { icon: 'map-pin' });
});
TP.act('hmSaveAddress', () => {
  const formRoot=document.getElementById('home-address-house')?.closest?.('.scr');
  if(formRoot?._validateAddressForm&&!formRoot._validateAddressForm(true))return;
  const values = {}; let invalid = null;
  for (const [key,,,optional] of addressFields) { const input = document.getElementById('home-address-' + key); if (!input) return; values[key] = input.value.trim(); if (((!optional && !values[key]) || !input.checkValidity()) && !invalid) invalid = input; }
  if (invalid) { document.getElementById('home-address-error').textContent = 'กรุณากรอกข้อมูลให้ครบและตรวจสอบเบอร์โทรกับรหัสไปรษณีย์'; invalid.focus(); invalid.reportValidity(); return; }
  const root=document.getElementById('home-address-house')?.closest?.('.scr');
  const list = TP.S.addrs || (TP.S.addrs = []); let a = list.find(a => a.id === TP.S._homeEditAddress);
  const keepPin=!!(a&&globalThis.TPAddressMap?.valid({...values,pin:a.pin,location:a.location}));values.location=keepPin?a.location:null;
  if (a) { Object.assign(a, values, { pin:keepPin }); } else { a = { id: 'a' + Date.now(), ...values, main: false, pin:false }; list.push(a); }
  if (document.getElementById('home-address-main').checked || list.length === 1) { list.forEach(x => x.main = x.id === a.id); TP.S.deliveryAddressId = null; }
  else if (!list.some(x => x.main)) list[0].main = true;
  TP.S.branchPicked = false; TP.saveHomePreferences(); TP.S.st.addressbook = undefined; TP.go('addressbook', { via: 'none' }); TP.notify(ADDRESS_SAVED_ALERT, { icon: 'map-pin' });
});
const homeBanner = S => { const a = TP.homeAddress(); return `<header class="hm-banner" data-in="0"><img class="hm-banner-image" src="/assets/banners/home-storefront-cover-v2.png" alt="" aria-hidden="true" fetchpriority="high" width="1536" height="1024"><div class="hm-banner-copy"><h2 class="hm-greeting">สวัสดี${S.user.name ? ' คุณ' + esc(S.user.name) : S.user.full ? ' คุณ' + esc(String(S.user.full).trim().split(/\s+/)[0]) : ''}</h2><p class="hm-brand-message">MITRAREE ดูแลคุณ<br>ใกล้กว่าที่เคย</p></div></header>`; };

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
  notes: ['สถานะร้านมี 3 แบบ: เปิดรับบริการ (เขียว), ปิดรับบริการ (เทา), ปิดรับชั่วคราว (เหลือง) ใช้ร่วมกับหน้าแรก; ห่างเกิน 15 กม. แสดงแท็กนอกพื้นที่ให้บริการแทนสถานะเปิด/ปิด; ในระยะ 15 กม. แสดงเปิดรับบริการ/ปิดรับบริการ/ปิดรับชั่วคราว ดูข้อมูลร้านได้ทุกสถานะ; ปิดรับชั่วคราวไม่มีปุ่มเริ่มปรึกษาและไม่รับคิวใหม่'],
  states: [['normal', 'เปิดรับบริการ'], ['paused', 'ปิดรับชั่วคราว'], ['closed', 'ปิดรับบริการ'], ['outside', 'ยังตรวจสอบระยะทางไม่ได้'], ['choose-mode', 'เลือกสนทนาหรือวิดีโอ', false], ['grouped', 'รายละเอียดแบ่งหมวด', false], ['license', 'ตรวจใบอนุญาตร้านยา'], ['neutral-sections', 'หมวดข้อมูลพื้นเทาอ่อน', false],['outside-known','สาขาอยู่ไกลเกิน 15 กม.']],
  prep(S) {
    const st = S.st.storeinfo;
    if (!st) return;
    TP.homeScenario(S, st === 'outside' ? 'unknownarea' : st === 'outside-known' ? 'outarea' : 'normal');
    S.storeOpen = st !== 'closed';
    S.branchState[S.branch] = st === 'paused' ? 'pause' : 'open';
    S.sysOff = TP.flag('sysOff');
  },
  render(ctx) {
    const b = TP.branch(ctx.params?.branch) || TP.branch(), ph = TP.PHARM[b.pharm], S = ctx.S;
    const closed = homeBranchClosed(S,b), paused = S.branchState[b.id] === 'pause';
    const outside = homeBranchOutside(b), km = TP.homeDistance(b);
    const [status, tone] = homeBranchStatus(S,b);
    return `<div class="bc-detail bc-organized">
      <section class="bc-overview" aria-label="ภาพรวมร้านยา">
        <img class="bc-detail-photo" src="${esc(b.photo || '/assets/stores/pharmacy-thumbnail-v1.png')}" alt="ภาพประกอบร้านยาจำลอง" width="1536" height="1024">
        <div class="bc-identity-head"><div class="bc-identity"><h3>${esc(b.name)}</h3><p>${esc(b.area)}</p></div></div>
        <div class="bc-availability">${ui.tag(status,tone,{dot:true})}<span>${outside ? (km == null ? 'ยังตรวจสอบระยะจากที่อยู่ที่เลือกไม่ได้' : 'สาขานี้อยู่ห่างเกิน 15 กม. จึงเริ่มปรึกษาไม่ได้') : closed ? 'ขณะนี้ยังเริ่มปรึกษาไม่ได้' : paused ? 'ขณะนี้ยังเริ่มปรึกษาไม่ได้ โปรดเลือกสาขาที่เปิดรับบริการ' : ''}</span></div>
        <dl class="bc-facts"><div><dt>${ic('clock',16,2)}เวลาทำการ</dt><dd>${esc(b.hours)} น.</dd></div><div><dt>${ic('map-pin',16,2)}ระยะจากที่อยู่จัดส่ง</dt><dd>${km == null ? 'ไม่ทราบระยะทาง' : esc(km)+' กม.'}</dd></div></dl>
      </section>
      <section class="bc-section" aria-labelledby="bcLocationTitle"><h4 id="bcLocationTitle">ที่ตั้งและติดต่อร้าน</h4><p class="bc-address">${esc(b.addr)}</p>${b.demo ? '<p class="bc-muted">ข้อมูลจำลองสำหรับแสดงหน้าจอ</p>' : `<div class="hm-store-links"><a href="${esc(b.map)}" target="_blank" rel="noopener noreferrer">${ic('map-pin',18,2)} ดูแผนที่</a><a href="tel:${esc(b.phone)}">${ic('phone',18,2)} โทรหาร้าน</a></div>`}</section>
      <section class="bc-section" aria-labelledby="bcPharmacistTitle"><h4 id="bcPharmacistTitle">เภสัชกรผู้ดูแล</h4><div class="bc-pharmacist-card">${ui.av('',{ini:ph.ini})}<div><b>${esc(ph.short)}</b><span>${closed ? 'ข้อมูลเภสัชกรประจำสาขา' : paused ? 'พักรับปรึกษาชั่วคราว' : 'ให้คำปรึกษาประจำสาขานี้'}</span><small>ใบประกอบวิชาชีพ ${esc(ph.lic)}</small></div></div></section>
      <details class="bc-license" ${S.st.storeinfo === 'license' ? 'open' : ''}><summary>${ic('shield-check',18,2)} ข้อมูลใบอนุญาตร้านยา ${ic('chevron-down',16,2)}</summary><dl><div><dt>เลขใบอนุญาตร้านยา</dt><dd>${esc(b.lic)}</dd></div></dl></details>
    </div>`;
  },
  foot(ctx) {
    const b = TP.branch(ctx.params?.branch) || TP.branch();
    if (TP.caseOpen()) return ui.btn('กลับไปการปรึกษาที่ค้าง', { a: 'hmReturnCase', icon: 'message-circle' });
    if (homeBranchClosed(ctx.S,b) || ctx.S.branchState[b.id] === 'pause' || !TP.homeStores().some(x => x.id === b.id)) return '';
    return `<div class="hm-consult-options"><div class="bc-action-heading"><p>ปรึกษาเภสัช</p><small>ไม่มีค่าปรึกษา · จ่ายเฉพาะเมื่อซื้อยา</small></div><div><button type="button" class="btn" data-a="hmConsultMode" data-v="chat" data-branch="${b.id}">${ic('message-circle',20,2)}<span>ปรึกษาเภสัช</span></button></div></div>`;
  }
});
TP.act('hmConsultMode', async t => {
  const mode = t.dataset.v, b = TP.homeStores().find(b => b.id === t.dataset.branch);
  if (!['chat','video'].includes(mode) || !b || homeBranchClosed(TP.S,b) || TP.S.branchState[b.id] === 'pause') return;
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
  const waiting=['queue','paused'].includes(c.status), paused=c.status==='paused';
  const idle=!waiting&&!!c.idle, pending=!waiting&&c.order?.status==='pending';
  const ph=TP.PHARM[c.pharm||b.pharm]||TP.PHARM.kj;
  const pos=Number.isFinite(c.pos)?Math.max(1,c.pos):null;
  const status=paused?'พักรับคิวชั่วคราว':waiting?'รอเภสัชกร':idle?'รอคำตอบจากคุณ':pending?'รอชำระเงิน':c.status==='matched'?'เภสัชกรรับคิวแล้ว':'กำลังสนทนา';
  const title=paused?'คิวของคุณยังอยู่':waiting?(pos===1?'คุณเป็นคิวถัดไป':pos?`มีผู้รอก่อนคุณ ${pos-1} คน`:'รอเภสัชกรรับคิว'):c.fromOf?'เภสัชกรตอบคำถามแล้ว':idle?'เภสัชกรรอคุณตอบกลับ':pending?'มีรายการยารอชำระ':'กลับไปปรึกษาต่อได้เลย';
  const help=paused?'เภสัชกรดูแลหน้าร้านอยู่ คุณยังไม่เสียคิว':waiting?(S.notif===false?'เปิดแอปไว้เพื่อติดตามคิว การแจ้งเตือนปิดอยู่':'ออกจากหน้านี้ได้ เราจะแจ้งเตือนเมื่อเภสัชกรรับคิว'):idle?'หากไม่ตอบภายใน 2 นาที การปรึกษาจะปิด':pending?'ตรวจสอบรายการยาและชำระเงินในห้องปรึกษา':'การปรึกษานี้ยังไม่จบ กลับไปคุยในห้องเดิมได้';
  const cta=waiting?'กลับเข้าห้องแชท':c.fromOf?'อ่านคำตอบ':idle?'กลับไปตอบ':pending?'ดูรายการยาและชำระเงิน':'กลับไปปรึกษาต่อ';
  return `<article class="hm-active-case case-progress-card" aria-labelledby="hmActiveTitle" data-in="1">
    <header class="hm-active-top case-progress-head"><span class="case-progress-icon" aria-hidden="true">${ic(paused?'pause':waiting?'clock':pending?'credit-card':idle?'message-circle':'stethoscope',22,1.8)}</span><span class="hm-active-label">การปรึกษาของคุณ</span><span class="hm-active-status" data-tone="${paused?'muted':c.status==='room'&&!idle&&!pending?'active':'waiting'}"><i class="hm-active-status-dot" aria-hidden="true"></i>${status}</span></header>
    <div class="case-progress-body"><h2 id="hmActiveTitle">${esc(title)}</h2>
    <div class="hm-active-provider">${ui.av('',{ini:ph.ini,img:TP.demoProfiles?.[ph.id==='tp'?'pharmacist_m':'pharmacist_f']})}<div><b>${esc(ph.short)}</b><span>${waiting?'เภสัชกรประจำสาขา':'เภสัชกรผู้ดูแล'} · ${esc(b.name)}</span></div></div>
    ${!waiting||paused||S.notif===false?`<p class="hm-active-help">${ic(waiting?'bell':'info',16,2)}<span>${esc(help)}</span></p>`:''}
    </div><footer class="case-progress-foot">${ui.btn(cta,{go:waiting?'queue':'room',via:waiting?'morph':'cover',iconRight:'arrow-right',cls:'hm-active-cta'})}</footer>
  </article>`;
}

TP.homeActiveCaseCard = homeActiveCaseCard;
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
  states: [['normal', 'ปกติ · ร้านยาหลายสถานะ'], ['loading', 'กำลังโหลด'], ['active', 'มีเคสค้าง', false], ['busy', 'สาขาใกล้สุดพัก', false], ['closed', 'ร้านปิด', false], ['address-alt', 'เลือกที่อยู่คลองเตย', false], ['noaddress', 'ไม่มีที่อยู่', false], ['outarea', 'นอกพื้นที่ให้บริการทุกสาขา'], ['unknownarea', 'ตรวจสอบพื้นที่ไม่ได้'], ['banner-edge', 'แบนเนอร์เต็มขอบ', false], ['blue-canvas', 'พื้นหลังเทาอมฟ้าอ่อน', false], ['pharmacy-banner', 'ภาพร้านยาและเฟดข้อความ', false], ['mini-menu', 'มินิเมนูสุขภาพใต้แบนเนอร์', false], ['compact-store', 'การ์ดสาขาแบบกระชับ', false], ['named-address', 'ชื่อที่อยู่และดรอปดาวน์', false], ['plain-mini-menu', 'มินิเมนูไม่มีกรอบ', false], ['branch-tile', 'การ์ดรูปซ้ายและเลือกวิธีปรึกษา', false], ['white-canvas', 'พื้นหลังสีขาว', false], ['layout-system', 'กริดและระยะกลางทั้งแอป', false], ['store-list', 'ลิสต์ร้านยา 6 ร้าน', false], ['care-shortcuts', 'ติดตามยาและประวัติในมินิเมนู', false], ['figma-system', 'Figma tokens และ component กลาง', false], ['real-photos', 'ภาพถ่ายและรูปมุมมน', false], ['pastel-icons', 'ไอคอนภาพประกอบพาสเทล', false], ['banner-actions', 'ปุ่มแบนเนอร์เสมอกัน ไม่มี badge', false], ['refined-store-list', 'ลิสต์ร้านจัดลำดับข้อมูลใหม่', false], ['distinct-store-photos', 'ภาพจำลองแต่ละร้านต่างกัน', false], ['soft-status', 'แท็กเปิดรับปรึกษาพื้นเขียวอ่อน', false],  ['bear-banner', 'ปกหมีเภสัชกร 3D', false], ['banner-safe-area', 'ภาพปกเต็ม safe area เฟดต่อเนื่อง', false], ['bright-bear', 'หมีสดใส เฟดเฉพาะด้านบน', false], ['tritone-icons', 'ไอคอน Flat 3 สี CI', false], ['personal-greeting', 'ทักทายชื่อจริงและหัวใจขาวเต็ม', false], ['counter-bear', 'หมีอยู่หลังเคาน์เตอร์เป็นธรรมชาติ', false], ['soft-rounded-icons', 'ไอคอนมนสี CI อ่อนและแนวปุ่มที่อยู่', false], ['glass-tabs', 'เมนูล่าง Liquid Glass', false], ['female-pharmacist-banner', 'ปกเภสัชกรหญิงหลังเคาน์เตอร์', false],['quick-consult','ปุ่มกลาง เลือกร้านว่างใกล้สุด', false],['quick-busy','ไม่มีร้านคิวว่าง', false],['quick-unknown','ยังไม่ทราบจำนวนคิว', false],['quick-address','ปรึกษาโดยยังไม่มีที่อยู่', false],['consult-banner','แบนเนอร์ชวนปรึกษาเหนือร้านยา', false],['active-next','การปรึกษา คิวถัดไป', false],['active-room', 'การปรึกษา ยังไม่จบ', false],['active-paused','การปรึกษา พักรับคิว', false],['active-payment','การปรึกษา รอชำระ', false],['active-idle','การปรึกษา รอคำตอบ', false],["case-queue3", "จำลอง รออีก 3 คิว"],['case-queue2', "จำลอง รออีก 2 คิว", false],['case-queue1', "จำลอง รออีก 1 คิว", false],["case-next", "จำลอง คิวถัดไป"],["case-paused", "จำลอง เภสัชกรพัก"],["case-matched", "จำลอง รับคิวแล้ว"],["case-chat", "สนทนา-จ่ายยา"],["case-reply", "จำลอง รอคำตอบจากคุณ"],["case-payment", "จำลอง รอชำระเงิน"],["case-finished", "จำลอง จบการปรึกษา", false],["case-cancelled", "จำลอง ยกเลิกคิว", false],["case-expired", "จำลอง หมดเวลารอคำตอบ", false],["case-closed-unpaid","จบแชท รอชำระค่ายา"],['case-payment-soon', "เหลือชำระ 1 นาที", false],["case-closed-payexpired","จบแชท หมดเวลาชำระ"],['case-video-request', "เภสัชกรขอวิดีโอคอล", false],["case-none","ไม่มีปรึกษา", false],["case-delivery-preparing","ชำระแล้ว · เตรียมยา"],["case-delivery-calling","กำลังเรียกไรเดอร์"],["case-delivery-delivering","ไรเดอร์กำลังส่งยา"],["case-delivery-delivered","จัดส่งเสร็จสิ้น", false],["case-pickup-preparing","รับที่ร้าน · ร้านกำลังเตรียมยา"],["case-pickup-ready","รับที่ร้าน · พร้อมรับยา"],["case-pickup-complete","รับยาที่สาขาแล้ว", false],["case-parcel-preparing","จัดส่งปกติ · ร้านกำลังเตรียมยา", false],["case-parcel-transit","จัดส่งปกติ · กำลังขนส่ง", false],["case-parcel-out","จัดส่งปกติ · กำลังนำส่ง", false],["case-parcel-delivered","จัดส่งปกติ · ส่งถึงแล้ว รอยืนยันรับยา", false],['branch-statuses', 'สาขาครบทุกสถานะ', false]],
  notes: ['สาขาในระยะไม่เกิน 15 กม. มีเปิดรับบริการ (เขียว), ปิดรับบริการ (เทา), ปิดรับชั่วคราว (เหลือง); เกิน 15 กม. แสดงนอกพื้นที่ให้บริการแทนสถานะร้าน กดดูรายละเอียดได้ทุกสถานะ ข้อมูลจำลองเริ่มต้นมีครบทั้ง 4 แบบ', 'C201: การ์ดร้านใกล้ฉันแสดงระยะทาง เวลาเปิด คิว และข้อมูลร้าน กดเปลี่ยนสาขาหรือเลือกจากสาขาอื่นได้', 'บอกว่าไม่มีค่าปรึกษา จ่ายเฉพาะเมื่อซื้อยา (ตัวเล็ก ไม่ชูคำว่าฟรี)', 'A8: ไม่มีเบอร์ 1669 บนหน้าแรก ข้อความน้อยที่สุด', 'มีเคสค้าง: แสดงสถานะเคสก่อนข้อมูลร้าน กลับเข้าการปรึกษาได้ทันที'],
  prep(S) {
    const st = S.st.home; TP.homeScenario(S, st || 'normal'); if (!st) return;
    if(st.startsWith('case-')){if(st.startsWith('case-parcel-') && flowPreview && new URLSearchParams(location.search).get('cardPreview')==='1')TP.fulfillmentPreview(TP.newCase(),st.slice(5));else TP.casePreview.seed(st.slice(5));S._homeEventPreview=true;return;}
    S.case=null;S._paymentCase=null;S.pay=null;S.call=null;S._homeEventPreview=true;
    if (st === 'active' || st.startsWith('active-')) { TP.newCase(); S._homeEventPreview=true;const c=S.case;if(st==='active-next'){c.status='queue';c.pos=1;}if(st==='active-paused')c.status='paused';if(st==='active-room'||st==='active-payment'||st==='active-idle'){c.status='room';c.idle=st==='active-idle';if(st==='active-payment')c.order={...(c.order||{}),status:'pending'};} } else if (TP.caseOpen()) S.case = null;
    S.branchState = { ...TP.fresh().branchState, tw: st === 'busy' ? 'pause' : 'open', on: 'pause', 'demo-2': 'closed', 'demo-3': 'pause' };
    S.storeOpen = st === 'closed' ? false : TP.flag('storeOpen'); S.branchPicked = false;
    S.queueLen={...TP.fresh().queueLen};S.sysOff=TP.flag('sysOff');
    if(st==='quick-address')TP.homeScenario(S,'noaddress');
    TP.emit('state');
  },
  render(ctx) {
    const S = ctx.S, st = ctx.state;
    // Isolated gallery adapter: reuse production renderers and existing preview fixtures.
    if (flowPreview && new URLSearchParams(location.search).get('cardPreview') === '1') {
      const view = {...S, history: []};
      const card = TP.paymentReminderCard?.(view) || TP.fulfillmentCard?.(view) || (TP.caseOpen() ? homeActiveCaseCard(view) : '');
      return ui.page('<div class="consultation-card-preview">' + card + '</div>', {nonav: true});
    }
    const head = homeBanner(S);
    if (st === 'loading') {
      return ui.page(`<div class="hm-content">${head}<div class="hm-loading" aria-busy="true" aria-label="กำลังโหลดหน้าหลัก"><div class="hm-loading-shortcuts">${Array.from({length:3}, () => '<span class="skel"></span>').join('')}</div><div class="skel hm-loading-card"></div><div class="skel hm-loading-card"></div></div></div>`, { nonav: true });
    }
    const quick = [
      ['health', 'health', 'ข้อมูลสุขภาพ'],
      ['medhub', 'medication', 'ข้อมูลยา'],
      ['addressbook', 'addressbook', 'สมุดที่อยู่']
    ];
    const updates = [TP.orderReadyRow?.(S, { din: 2 }) || '',
      S.ofPending ? ui.group([ui.row({ icon: 'message-square-text', title: 'คำถามที่ฝากไว้', sub: `${S.ofPending.whoName} · ฝากไว้ ${S.ofPending.at} · เภสัชกรจะตอบ${TP.OF_REPLY}`, chev: false })]) : ''
    ].filter(Boolean).join('');
    const address=TP.homeAddress();
    const delivery=address?`<button type="button" class="hm-delivery-bar" data-sheet="homeaddress" aria-haspopup="dialog" aria-label="เลือกที่อยู่จัดส่ง: ${esc(TP.fmtAddr(address))}">${ic('map-pin',20,1.8)}<span>ที่อยู่จัดส่ง</span><b>${esc(TP.fmtAddr(address))}</b>${ic('chevron-down',18,2)}</button>`:'';
    const shortcuts = `<nav class="hm-mini-menu" aria-label="ดูแลสุขภาพของคุณ">${quick.map(([go, icon, label]) => `<button type="button" class="hm-mini-item" data-go="${go}"><span class="hm-mini-icon hm-mini-art hm-mini-art-${icon}"><img src="/assets/menu-icons/${icon}-rounded-v3.svg" alt="" width="48" height="48" decoding="async"></span><span>${esc(label)}</span></button>`).join('')}</nav>`;
    return ui.page(`<div class="hm-content">${head}
      ${delivery}
      ${shortcuts}
      ${TP.paymentReminderCard?.(S._homeEventPreview?{...S,history:[]}:S)||''}${TP.fulfillmentCard?.(S._homeEventPreview?{...S,history:[]}:S)||''}
      ${(st === 'active' || TP.caseOpen()) ? heroHtml(S,st)+homeConsultBanner(S)+nearbyStoresHtml(S) : homeConsultBanner(S)+heroHtml(S,st)}
      ${updates ? `<section class="hm-updates" aria-label="การดูแลของคุณ"><h2 class="hm-section-title">การดูแลของคุณ</h2>${updates}</section>` : ''}

      </div>`, { nonav: true });
  }
});
TP.act('tabHistory', () => TP.tab('history'));
/* consult switched off from the back office (C17): the start button leads to sysoff, the rest of the app still works */
/* asked once, after the first consult (owner 19/10/2026) */
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
        ${ui.group([ui.row({ icon: 'package', title: 'ส่งด่วน', sub: 'ส่งเร็วใน 1–4 ชม. เมื่ออยู่ในระยะให้บริการ', chev: false }), ui.row({ icon: 'store', title: 'รับที่ร้าน', sub: TP.BRANCHES.map(b => b.name).join(' หรือ '), chev: false })], { title: 'ถ้าซื้อยา รับยาได้ทาง', din: 1 })}`) +
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
TP.intakeReady = I => !!I.note?.trim();
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
  states: [["normal", "ว่าง"], ["filled", "กรอกแล้ว"], ["other", "พิมพ์อาการเอง"], ["noallergy", "ยังไม่ระบุแพ้ยา"], ["fail", "เข้าคิวไม่สำเร็จ"], ["ack", "ติ๊กรับทราบแล้ว"], ["outzone", "ที่อยู่หลักนอกเขตส่งยา"], ["search", "ตัวเลือกอาการ 2 คอลัมน์", false], ["urgent", "แจ้งเตือนอาการอันตราย", false], ["multi", "เลือกหลายอาการ"], ["custom-error", "ยังไม่ได้เล่ารายละเอียด"], ["photos", "แนบรูป 3 รูป"], ["photo-error", "แนบไฟล์ไม่รองรับ"], ["cover", "ปกเล่าอาการและฟอร์มซ้อน", false]],
  notes: ['C04: ตัวเลือก 2 คอลัมน์ มีช่องติ๊ก เลือกได้หลายอาการ ไม่มีช่องค้นหา',
    'ไม่มีอาการในรายการ: พิมพ์ในช่องรายละเอียดเพิ่มเติมใต้รายการอาการ', 'A11: แพ้ยาไม่บังคับ ดึงจากบัญชีมาให้ แก้ได้ในที่ · ไม่มีข้อมูล = "ยังไม่ได้ระบุ" ไม่ใช่ "ไม่แพ้"', 'C203 ไม่มีหมวดตรวจอาการอันตรายแล้ว ลำดับฟอร์มคือ 1 วิธีปรึกษา 2 อาการที่ต้องการปรึกษา 3 ข้อมูลก่อนปรึกษา; คงคำแนะนำฉุกเฉินในบริบทอื่นตามเดิม', 'ข้อมูลยังอยู่ในเครื่องจนกด "เข้าคิวปรึกษา"',
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
    // Retired urgent preview suffix is preserved; this form no longer collects red flags.
    if (st === 'noallergy') { S.user.allergyState = 'unknown'; S.user.allergies = []; } else if (st) { S.user.allergyState = 'set'; S.user.allergies = ['แอสไพริน']; }
  },
  render(ctx) {
    const S = ctx.S, I = S.intake;I.urgent=[];I.who='me';if(!['chat','video'].includes(I.mode))I.mode='chat';if(I.otherOpen&&I.otherText?.trim()){I.note=[I.note,I.otherText].filter(Boolean).join('\n');I.otherOpen=false;I.otherText='';}
    if(I.symptoms?.length){I.note=[I.symptoms.join(', '),I.note].filter(Boolean).join('\n');I.symptoms=[];}
    const p = TP.person('me'), b = TP.pickBranch();
    const record=TP.healthRecord(p);
    const healthRows=[['allergies','ประวัติแพ้ยา','octagon-alert','ไม่มีประวัติแพ้ยา'],['meds','ยาที่ใช้ประจำ','pill','ไม่มียาที่ใช้ประจำ'],['conditions','โรคประจำตัว','heart-pulse','ไม่มีโรคประจำตัว']];
    const healthRow=(key,title,icon,text)=>`<button type="button" class="ik-health-row" data-a="afHdFieldOpen" data-v="${key}" aria-label="แก้ไข${esc(title)}"><span class="inbox-item-icon" aria-hidden="true">${ic(icon,20,1.8)}</span><span class="ik-health-copy"><b>${esc(title)}</b><span class="ik-health-value">${esc(text)}</span></span>${ic('pencil',18,1.8)}</button>`;
    const ready = TP.intakeReady(I), shut = S.storeOpen === false;
    const prev = TP.hist?.[TP.hist.length - 1]?.id;
    return `<div class="auth-form-scene ik-scene"><img class="auth-form-cover ik-cover" src="/assets/banners/intake-consultation-cover-v1.png" alt="" width="1536" height="1024"><button type="button" class="auth-form-back" data-back aria-label="ย้อนกลับ">${ic('arrow-left',22,2)}<span>กลับ</span></button><section class="auth-form-panel ik-form-panel" aria-labelledby="ikPageTitle">` + ui.page(`<header class="ik-intro"><h1 id="ikPageTitle">อยากปรึกษาเภสัชเรื่องอะไร</h1><p>บอกอาการหรือคำถามเรื่องยา ก่อนเริ่มคุยกับเภสัชกร</p></header>
      ${ctx.state === 'fail' ? ui.note('<b>ยังส่งข้อมูลไม่สำเร็จ</b><br>ข้อมูลยังอยู่ครบ ลองเข้าคิวอีกครั้งได้เลย', { tone: 'danger' }) : ''}
      ${shut ? ui.note('<b>ร้านปิดรับปรึกษาอยู่</b><br>คุณยังฝากคำถามให้เภสัชกรตอบเมื่อร้านเปิดได้', {tone:'warn',icon:'moon'}) : ''}
      <section class="ik-sec ik-block ik-mode-section"><div class="ik-section-heading"><span>1</span><h3 class="ik-h" id="ikModeTitle">ต้องการปรึกษาแบบไหน <span class="reg-required" aria-hidden="true">*</span></h3></div><div class="ik-mode-options" role="radiogroup" aria-labelledby="ikModeTitle">${[['chat','สนทนา','message-square-text'],['video','วิดีโอคอล','video']].map(([value,label,icon])=>`<label class="ik-mode-option"><input type="radio" name="ikConsultMode" required value="${value}" ${I.mode===value?'checked':''}><span>${ic(icon,24,1.8)}<b>${label}</b></span></label>`).join('')}</div></section>
      <section class="ik-sec ik-block"><div class="ik-section-heading"><span>2</span><h3 class="ik-h"><label for="ikNote">อาการที่ต้องการปรึกษา <span class="reg-required" aria-hidden="true">*</span></label></h3></div>
        <div class="ik-extra-fields"><div class="field"><textarea class="input" id="ikNote" rows="4" required data-bind="intake.note" data-a="symChange" placeholder="เช่น เจ็บคอมา 2 วัน กลืนแล้วเจ็บ มีไอเล็กน้อย หรือพิมพ์คำถามเรื่องยาที่ต้องการปรึกษา">${esc(I.note||'')}</textarea></div>${ctx.state==='custom-error'?ui.note('กรุณาบอกอาการหรือคำถามเรื่องยาก่อนปรึกษาเภสัชกร',{tone:'danger',icon:'triangle-alert'}):''}${intakePhotosHtml(I)}</div>
      </section>
      <section class="ik-sec ik-block"><div class="ik-section-heading"><span>3</span><h3 class="ik-h">ข้อมูลก่อนปรึกษา</h3></div>
        ${p.allergyState !== 'none' && !p.allergies?.length ? ui.note('<b>ยังไม่ได้ระบุประวัติแพ้ยา</b><br>แจ้งเภสัชกรได้แม้จำชื่อยาไม่ได้', {tone:'warn',icon:'triangle-alert'}) : ''}
        <div class="ik-health-summary">${healthRows.map(([key,title,icon,none])=>healthRow(key,title,icon,record[key].mode==='set'?record[key].text:record[key].mode==='none'?none:'ยังไม่ทราบ')).join('')}</div>

      </section>
      ${shut ? '' : ackHtml(S)}
      ${zoneNote(S, b)}`, {cls: 'ik-form-scroll'}) + `</section></div>` +
      ui.dock(shut ? ui.btn('ฝากคำถามถึงเภสัชกร', { go: 'offline', disabled: !ready, id: 'ikGo' }) : ui.btn('ปรึกษาเภสัช', { a: 'joinQueue', disabled: !ready || !I.ack, id: 'ikGo' }));
  },
  mount(el,ctx) {
    el.addEventListener('change',e=>{if(e.target.name==='ikConsultMode'&&['chat','video'].includes(e.target.value))ctx.S.intake.mode=e.target.value;});
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
const ackHtml = S => `<section class="ik-sec ik-ack" id="ikAckSec" aria-label="เงื่อนไขเข้ารับบริการ"><div class="ik-consent-box"><input type="checkbox" id="ikAck" required aria-labelledby="ikAckLabel" ${S.intake.ack?'checked':''}><div class="ik-consent-copy"><label for="ikAck" id="ikAckLabel">ฉันได้อ่านและรับทราบเงื่อนไขและข้อจำกัดของการปรึกษาออนไลน์กับเภสัชกรแล้ว <span class="reg-required" aria-hidden="true">*</span></label> <button type="button" class="reg-consent-link" data-sheet="serviceterms" aria-haspopup="dialog">อ่านเพิ่มเติม</button></div></div></section>`;
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
  if (!TP.zoneLock()) return `<div class="ik-zone" data-in="4">${ui.note(`<b>ปรึกษาได้ตามปกติ</b> ถ้าซื้อยา: รับยาที่ร้าน${esc(b.name)} · ที่อยู่หลัก ${where} ห่างสาขาเกิน 15 กม. ส่งด่วนไม่ได้`, { icon: 'map-pin' })}</div>`;
  return `<div class="ik-zone" data-in="4">${ui.note(`<b>ปรึกษาได้ตามปกติ</b> ถ้าซื้อยา: รับที่ร้าน${esc(b.name)} · ที่อยู่หลัก ${where} อยู่นอกเขตส่งยา ส่งยาได้ถ้าเลือกที่อยู่ที่ห่างสาขาไม่เกิน 15 กม. ตอนชำระเงิน`, { icon: 'map-pin' })}</div>`;
}
TP.act('modeChange', t => { TP.S.intake.mode = t.dataset.v; const label = $('#ikModeLabel',TP.cur().el); if(label) label.textContent = 'ปรึกษาผ่าน' + (t.dataset.v === 'video' ? 'วิดีโอคอล' : 'การสนทนา'); const details = t.closest?.('.ik-mode-change'); if(details) details.open = false; const s = $('#ikModeHint', TP.cur().el); if (s) s.textContent = t.dataset.v === 'video' ? 'ไม่มีการบันทึกวิดีโอ · สลับเป็นแชทได้ตลอด' : 'ส่งรูปในแชทได้ · ขอวิดีโอคอลภายหลังได้'; });
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
  if (S.intake.urgent.length && !S._urgentOk) return TP.sheet('redflag');
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
  const fulfillment=TP.fulfillmentInfo?.(c);if(fulfillment&&!fulfillment.done)return {icon:'delivery',title:fulfillment.title,sub:b.name,go:'paid',cta:'ดูสถานะ'};
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
const qDanger = TP.queueDanger = () => `<div class="note danger q-dg" role="alert" data-in="4">${ic('octagon-alert', 18, 2)}<div><b>คุณแจ้งอาการรุนแรงไว้</b><p class="mt8">ถ้าแย่ลงระหว่างรอ ไม่ต้องรอเภสัชกร ไปโรงพยาบาลทันที</p></div></div>`;
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
  states:[['q2','รออีก 1 คิว'],['q1','คิวถัดไป'],['paused','เภสัชกรพัก'],['urgent','มีธงด่วน'],['notifoff','ปิดการแจ้งเตือนไว้'],['refined','รอในห้องแชท', false],['q4','รออีก 3 คิว'],['message','พิมพ์ข้อมูลระหว่างรอ'],['joined','เภสัชกรพร้อมให้บริการ'],['offline','อินเทอร์เน็ตขาดระหว่างรอ'],['video-wait','รอเภสัชกรวิดีโอคอล'],['video-next','วิดีโอคอล · คิวถัดไป']],
  notes:['ระหว่างค้นหาและรอคิวแชท แสดงหัวข้อแชทกับเภสัชกร แถบสถานะสี Primary พร้อมแสงไล่ผ่านเบา ๆ และไอคอนค้นหา ไม่แสดงชื่อเภสัชกรก่อนรับเคส ใช้จำนวนคิวจริง ไม่ประมาณเวลารอ ปุ่มกล้องอยู่ล่างซ้าย ไม่มีปุ่มแจ้งอาการลอย','เข้าห้องแชททันทีหลังแจ้งอาการ พิมพ์ข้อมูลไว้ระหว่างรอได้ เภสัชกรยังไม่ได้อ่านข้อความจนรับเคส','แถบบนแสดงคิวปัจจุบันและข้อความระบบบอกเมื่อคิวขยับ ไม่ประมาณเวลารอ','ย่อห้องแล้วกลับมาได้ คิว ข้อความ และร่างข้อความยังอยู่','เมื่อรับเคสคุยต่อในห้องเดิม ไม่แสดงการ์ดข้อมูลก่อนปรึกษา เปิดวิดีโอคอลหลังรับเคสเท่านั้น'],
  prep(S){const st=S.st.queue||'q2',c=ensureCase(st==='paused'?'paused':'queue');c.mode=['video-wait','video-next'].includes(st)?'video':'chat';c.pos=['q1','video-next'].includes(st)?1:st==='q4'?4:2;c.msgs=[];c.draft='';c.order=null;c.idle=null;c.urgent=st==='urgent'?['หายใจลำบาก']:[];S.netOff=st==='offline';S.notif=st!=='notifoff';if(st==='message'){c.msgs=[{who:'sys',kind:'waiting',text:'ส่งข้อมูลเบื้องต้นแล้ว คุณสามารถพิมพ์อาการเพิ่มเติมไว้ระหว่างรอเภสัชกรได้'},{who:'me',kind:'intake'},{who:'me',text:'เจ็บคอตั้งแต่เมื่อวาน และมีไอเล็กน้อยค่ะ',time:TP.NOW.time}];}if(st==='joined'){c.status='room';c.waitedInChat=true;}},
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

TP.act('queueEnableNotifications',()=>{TP.S.notif=true;TP.emit('state');return TP.refresh({anim:false});});
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
    const m = { accept: ['เภสัชกรรับคิวของคุณแล้ว', 'แตะเพื่อเข้าห้องปรึกษา', 'room'], msg: ['มีข้อความใหม่จากเภสัชกร', 'แตะเพื่ออ่าน', 'room'], order: ['รายการยาพร้อมให้ชำระ', 'แตะเพื่อดูรายการ', 'room'], payexp: ['รายการยาใกล้หมดเวลาชำระ', 'ชำระได้อีก 15 นาที แตะเพื่อดู', 'room'], paused: ['เภสัชกรพักชั่วคราว', 'คิวของคุณยังอยู่ ไม่เสียคิว', 'queue'], summary: ['ใบสรุปการปรึกษาพร้อมแล้ว', 'แตะเพื่อเปิดดู', 'summary'], adr: ['เภสัชกรตอบเรื่องที่คุณแจ้งแล้ว', 'แตะเพื่ออ่าน', 'adrsent'], ...(TP.FOLLOW_LOCK || {}) }[ctx.state] || [];
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
  return TP.go(TP.S.camDenied ? 'nocam' : 'video', { via: 'zoom', replace: true });
});
TP.simAction({ id: 'joinCustomerVideo', label: 'เภสัชกรเข้าห้องวิดีโอ', when: S => !!S.call?.waitingProvider, run: () => { TP.S.call.waitingProvider = false; TP.S.call.t0 = Date.now(); TP.emit('state'); if (TP.cur()?.id === 'video') TP.refresh({ anim: false }); } });
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
  c.msgs.push({kind:'video-request',id:String(request.id),status:'pending',time:TP.roomNow?.() || TP.NOW.time});TP.emit('state');
  if(['queue','room'].includes(TP.cur()?.id))return TP.refresh({anim:false});
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
TP.ORDER_PAYMENT_MS=15*60*1000;
TP.orderDeadline = o => {
  if(!o||o.awaitingCheckout)return 0;
  if(o.status==='pending'&&!Number.isFinite(o.expiresAt))o.expiresAt=Date.now()+TP.ORDER_PAYMENT_MS;
  return o.expiresAt||0;
};
TP.orderPayable = o => !!o&&o.status==='pending'&&(o.awaitingCheckout||TP.orderDeadline(o)>Date.now());
TP.startOrderPayment = o => {if(!o||o.status!=='pending'||!o.awaitingCheckout)return false;o.awaitingCheckout=false;o.paymentStartedAt=Date.now();o.expiresAt=o.paymentStartedAt+TP.ORDER_PAYMENT_MS;o.expires=TP.orderTime(o);return true;};
TP.orderRemaining = o => {if(o?.awaitingCheckout)return 'ยังไม่เริ่มนับ';const seconds=Math.max(0,Math.ceil((TP.orderDeadline(o)-Date.now())/1000));return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;};
TP.orderTime = o => Number.isFinite(o?.expiresAt)?new Intl.DateTimeFormat('th-TH',{timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(o.expiresAt)):o?.expires||'';
TP.expireOrder = c => {
  const o=c?.order;if(!o||o.status!=='pending'||o.awaitingCheckout||TP.orderDeadline(o)>Date.now())return false;
  o.status='expired';
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
TP.makeOrder = () => { const k=TP.casePlan(C()).items,items=k.length?k:[TP.ORDER_ITEMS[1]],issuedAt=Date.now();C().order={status:'pending',items,total:items.reduce((sum,i)=>sum+i.price,0),issuedAt,awaitingCheckout:(C().mode||'chat')==='chat',expiresAt:(C().mode||'chat')==='chat'?null:issuedAt+TP.ORDER_PAYMENT_MS,no:TP.orderNumber(C())};C().order.expires=TP.orderTime(C().order);TP.emit('state'); };
TP.orderCases = S => [...new Map([S.case,...(S.history||[]).map(h=>h._case)].filter(Boolean).map(c=>[c.id,c])).values()];
TP.pendingPaymentCase = S => TP.orderCases(S).find(c=>c.order?.status==='pending');
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
 return c.order?.status==='pending'?{screen:'home',pay:true,case:c}:c.order?.status==='paid'?{screen:'paid',case:c}:{screen:'home',case:c};
};
TP.finishChatNavigation = async c => {
 const route=TP.closedChatRoute(c);if(!route)return;
 TP.S._paymentCase=c;
 await TP.go(route.screen,{root:true,force:true});
 if(route.pay&&TP.orderPayable(c.order))await TP.sheet('pay',{caseId:c.id});
};
TP.FULFILLMENT_PHASES=[['preparing','กำลังเตรียมยา','pill'],['calling','กำลังเรียกไรเดอร์เข้ารับยา','phone'],['delivering','ไรเดอร์กำลังส่งยาให้คุณ','truck'],['delivered','จัดส่งยาเสร็จสิ้น','circle-check']];
TP.fulfillmentInfo = c => {
 const o=c?.order;if(o?.status!=='paid'||!o.fulfillment)return null;
 if(o.paid?.recv==='parcel'){
  const pd=o.paid;
  const [key,title,icon]=pd.deliv?['delivered','ขนส่งแจ้งว่าส่งถึงแล้ว','package-check']:pd.out?['out','กำลังนำส่ง','truck']:pd.stage?['transit','กำลังขนส่ง','truck']:TP.FULFILLMENT_PHASES[0];
  return {key,title,icon,done:!!(pd.got||o.picked),pickup:false};
 }
 const phase=TP.FULFILLMENT_PHASES.find(x=>x[0]===o.fulfillment.status)||TP.FULFILLMENT_PHASES[0];
 return {key:phase[0],title:phase[1],icon:phase[2],done:!!(o.paid?.got||o.picked),pickup:o.paid?.recv==='pickup'};
};
TP.setFulfillment = (c,status) => {
 if(c?.order?.status!=='paid'||!TP.FULFILLMENT_PHASES.some(x=>x[0]===status))return false;
 const current=TP.FULFILLMENT_PHASES.findIndex(x=>x[0]===c.order.fulfillment?.status),next=TP.FULFILLMENT_PHASES.findIndex(x=>x[0]===status);if(current>=0&&next<=current)return false;
 c.order.fulfillment={...c.order.fulfillment,status,updatedAt:new Date().toISOString()};
 if(status==='delivered'){c.order.paid.deliv=TP.NOW.time;}
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
TP.fulfillmentCard = S => TP.orderCases(S).filter(c=>{const f=TP.fulfillmentInfo(c);return f && !f.done;}).map(c=>{
 const f=TP.fulfillmentInfo(c),b=TP.branch(c.branch),title=f.pickup?(c.order.paid?.stage==='ready'?'ยาพร้อมรับที่สาขาแล้ว':'กำลังเตรียมยาสำหรับรับที่สาขา'):f.title;
 return `<article class="post-consult-payment fulfillment-card case-progress-card"><header class="post-payment-heading case-progress-head"><span class="case-progress-icon" aria-hidden="true">${TP.ic(f.pickup?'store':['calling','delivering','out','transit'].includes(f.key)?'truck':'package',22,1.8)}</span><span>สถานะคำสั่งซื้อ</span>${TP.ui.tag('ชำระแล้ว','ok')}</header><div class="case-progress-body"><h3>${TP.esc(title)}</h3><p class="case-progress-meta">${TP.ic('map-pin',16)}<span>${TP.esc(b.name)}</span></p><p class="case-progress-order">เลขคำสั่งซื้อ <span>${TP.esc(c.order.no)}</span></p></div><footer class="case-progress-foot">${TP.ui.btn('ติดตามสถานะยา',{a:'viewFulfillment',p:{caseId:c.id},iconRight:'arrow-right'})}</footer></article>`;

}).join('');
TP.act('viewFulfillment',(t,ctx)=>{let p=ctx?.params||{};try{p={...p,...JSON.parse(t?.dataset?.p||'{}')};}catch{}const c=TP.orderCases(TP.S).find(c=>c.id===p.caseId)||TP.S.case;if(!TP.fulfillmentInfo(c))return;TP.S._paymentCase=c;TP.S._paidFromHome=false;return TP.go(c.order.paid?.recv==='parcel'?'track':'paid',{via:'cover'});});
TP.chatDeliveryPage = c => {
  const f = TP.fulfillmentInfo(c), o = c.order;
  const phase = TP.FULFILLMENT_PHASES.findIndex(([key]) => key === f.key);
  const status = TP.orderStatusCard(
    TP.FULFILLMENT_PHASES.map(([key, label], i) => [i < phase ? 'done' : i === phase ? 'cur' : '', label, '']),
    o.no, false, '', {
      artwork: f.key === 'preparing' ? 'preparing' : f.key === 'calling' ? 'calling' : f.key === 'delivered' ? 'delivered' : 'delivery',
      icons: ['pill', 'search', 'motorcycle', 'check']
    }
  );
  return TP.ui.nav({ title: 'สถานะการจัดส่งยา', right: `<button type="button" class="ibtn" data-a="paidClose" aria-label="ปิด">${TP.ic('x',22,2)}</button>` }) +
    TP.ui.page(status + (f.key === 'delivered' ? (o.paid.got ? '<p class="tk-got" role="status">คุณยืนยันว่าได้รับยาแล้ว</p>' : TP.ui.btn('ได้รับยาแล้ว', { a: 'tkGot', icon: 'circle-check', cls: 'mb16' })) : '') + TP.fulfillmentDetails(c));
};
/* End chat order lifecycle */

TP.paymentReminderCard = (S,c) => {
  c ||= TP.pendingPaymentCase(S)||TP.orderCases(S).find(c=>c.status==='closed'&&c.order?.status==='expired');
  if(!c||c.status!=='closed'||!['pending','expired'].includes(c.order?.status))return '';
  TP.expireOrder(c);const o=c.order,pending=TP.orderPayable(o),b=TP.branch(c.branch);
  return `<article class="post-consult-payment case-progress-card"><header class="post-payment-heading case-progress-head"><span class="case-progress-icon" aria-hidden="true">${ic(pending?'credit-card':'clock',22,1.8)}</span><span>${pending?'รอชำระค่ายา':'หมดเวลาชำระค่ายา'}</span>${ui.tag(pending?'รอชำระ':'สิ้นสุด',pending?'warn':'muted')}</header><div class="case-progress-body"><h3>${pending?'รายการยาของคุณพร้อมชำระแล้ว':'รายการยานี้ชำระไม่ได้แล้ว'}</h3><p>${esc(b.name)} · ${o.items?.length||0} รายการ</p><div class="post-payment-total"><span>รวมค่ายา</span><b>${esc(TP.money(o.total))}</b></div>${pending?`<p class="post-payment-deadline">${ic('clock',16,2)}<span>${o.awaitingCheckout?'เริ่มนับเวลา 15 นาทีเมื่อเปิดหน้าชำระเงิน':`ชำระภายใน ${esc(TP.orderTime(o))} น. · เหลือ <b data-order-countdown data-order-case="${esc(c.id)}">${TP.orderRemaining(o)}</b>`}</span></p></div><footer class="case-progress-foot">${ui.btn('ดูรายการยาและชำระเงิน',{a:'openOrderPayment',p:{caseId:c.id},icon:'credit-card'})}`:`<p class="post-payment-expired">ครบเวลาชำระ 15 นาทีแล้ว หากยังต้องการยา ให้เภสัชกรตรวจสอบรายการใหม่</p></div><footer class="case-progress-foot">${ui.btn('ปรึกษาเภสัชอีกครั้ง',{a:'requeue',kind:'secondary',icon:'message-circle'})}`}${ui.btn('ดูใบสรุปการปรึกษา',{go:'summary',p:{id:c.id},kind:'ghost'})}</footer></article>`;
};
TP.act('openOrderPayment',async (t,ctx)=>{

  let params=ctx?.params||{};try{params={...params,...JSON.parse(t?.dataset?.p||'{}')};}catch{}const id=params.caseId,c=id?TP.orderCases(TP.S).find(c=>c.id===id):(TP.pendingPaymentCase(TP.S)||C());TP.expireOrder(c);
  if(TP.chatConsult(c)&&c.status!=='closed'){TP.notify('สอบถามเพิ่มเติมกับเภสัชกรได้ เมื่อสรุปการปรึกษาแล้วจึงชำระเงิน',{icon:'message-circle'});return;}
  if(!TP.orderPayable(c?.order)){TP.notify('รายการนี้หมดเวลาชำระแล้ว กรุณาให้เภสัชกรตรวจรายการใหม่',{icon:'clock'});return TP.refresh({anim:false});}
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
      body: 'แชทและใบสรุปยังเปิดดูได้',
      time: TP.NOW.date + ' ' + TP.orderTime(consultation.order),
      read: false,
      go: 'summary',
      p: { id: consultation.id },
    });
  }
  if (changed) {
    TP.emit('state');
    const paymentCase = TP.S._paymentCase || TP.S.case;
    if (TP.sheetOpen()?.id === 'pay' && paymentCase?.order?.status === 'expired') {
      TP.closeSheet({ instant: true }).then(() => TP.sheet('pay', { caseId: paymentCase.id }));
    } else if (TP.sheetOpen()?.id !== 'pay') {
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

function msgHtml(m) {
  if(m.kind==='provider-ready')return '<div class="msg-sys rm-provider-ready" role="status"><span>เภสัชกรเข้าร่วมห้องแล้ว<br>พิมพ์ข้อความเพื่อปรึกษาเภสัชกรได้เลย</span></div>';
  if(m.kind==='video-request'){
    const c=C(),pending=m.status==='pending'&&c.status==='room'&&!TP.S.call,inCall=m.status==='accepted'&&!!TP.S.call;
    const labels={declined:'คุณเลือกคุยทางแชทต่อ',withdrawn:'เภสัชกรยกเลิกคำขอนี้แล้ว',ended:'วิดีโอคอลจบแล้ว',accepted:inCall?'กำลังวิดีโอคอล':'รับคำขอแล้ว'};
    return `<article class="rm-video-request"><header><span class="rm-video-icon">${ic('video',24,1.8)}</span><div><h3>คำขอวิดีโอคอล</h3><p>${esc(P().short)} ขอคุยกับคุณผ่านวิดีโอ</p></div></header>${pending?`<p class="rm-video-help">กล้องและไมค์จะเริ่มใช้งานเมื่อคุณกดเข้าร่วม<br>ระหว่างคอล ย่อกลับมาพิมพ์แชทได้</p><div class="rm-video-actions"><button type="button" class="btn primary" data-a="acceptVideoRequest" data-request="${esc(m.id)}">${ic('video',18,2)}เข้าวิดีโอคอล</button><button type="button" class="btn secondary" data-a="declineVideoRequest" data-request="${esc(m.id)}">คุยแชทต่อ</button></div>`:m.status==='accepted'&&c.status==='room'?ui.btn('กลับเข้าวิดีโอคอล',{a:'startVideo',kind:'secondary',icon:'video'}):`<p class="rm-video-result">${esc(labels[m.status]||'คำขอนี้สิ้นสุดแล้ว')}</p>`}</article>`;
  }
  if (m.who === 'sys') return `<div class="msg-sys${m.move ? ' move' : ''}"><span>${m.move ? ic('map-pin', 14, 2) : ''}${esc(m.text)}</span></div>`;
  if (m.kind === 'intake') return '';
  if (m.kind === 'order') return `<div class="msg ph wide">${orderCard(C().order)}</div>`;
  if (m.kind === 'summary' && C()?.checkoutHandoffUntil) return `<div class="msg-sys"><span>เภสัชกรสิ้นสุดสนทนาแล้ว ${esc(m.time || '')}</span></div>`;
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
const videoQueueCard = c => `<section class="rm-video-wait" aria-labelledby="rmVideoWaitTitle">
  <img src="/assets/photos/video-queue-cover-v1.jpg" alt="" width="960" height="320">
  <div class="rm-video-wait-copy">
    <span>${ic('video',18,1.8)} วิดีโอคอล</span>
    <h2 id="rmVideoWaitTitle">รอเภสัชกรพร้อมวิดีโอคอล</h2>
    <b id="rmQueueLabel" role="status">${esc(queueChatLabel(c))}</b>
    <p>กรุณารอสักครู่ เมื่อเภสัชกรพร้อม คำเชิญจะขึ้นในห้องนี้</p>
  </div>
</section>`;

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
  previewShortcuts: ['order', 'checkout-handoff'],
  states: [['live', 'เล่นบทสนทนา'], ['order', 'เภสัชกรส่งรายละเอียดรายการยา'], ['paid', 'ย้ายสถานะชำระแล้วไปหน้าคำสั่งซื้อ', false], ['expired', 'ยกเลิกเคสทดสอบหมดเวลาชำระในแชท', false], ['checkout-handoff', 'เภสัชกรสิ้นสุดสนทนา · ไปชำระค่ายาใน 30 วินาที'], ['closed', 'ปิดเคส + ใบสรุป'], ['call', 'คุยวิดีโออยู่'], ['idle', 'เงียบ 3 นาที ใกล้ปิดเอง'], ['idleclosed', 'ปิดเองเพราะเงียบ 5 นาที'], ['moved', 'ยกเลิกเคสทดสอบย้ายสาขา', false],['waiting','รอในแชท อีก 3 คิว'],['waiting-message','ส่งอาการไว้ระหว่างรอ'],['waiting-paused','พักชั่วคราวในห้องแชท'],['provider-joined','เภสัชกรเข้าห้องแล้ว', false],['video-request','เภสัชกรขอวิดีโอคอล'],['video-declined','เลือกคุยแชทต่อ'],['video-withdrawn','เภสัชกรถอนคำขอวิดีโอ'],['closed-unpaid','จบแชท รอชำระค่ายา'],['payment-soon','จบแชท เหลือชำระ 1 นาที'],['closed-payexpired','ยกเลิกเคสทดสอบหมดเวลาชำระหลังจบแชท', false],['offline','ไม่มีอินเทอร์เน็ต']],
  notes: ['เภสัชกรจบสนทนาและมียารอชำระ: ช่องพิมพ์เปลี่ยนเป็นปุ่มชำระค่ายานับถอยหลัง 30 วินาที กดทันทีหรือเปิดชำระอัตโนมัติเมื่อครบ เวลา 15 นาทีเริ่มเมื่อเข้าชำระจริง', 'เมื่อเภสัชกรส่งรายการยา แสดงแถบตะกร้ายาเหนือช่องพิมพ์ กดเปิด C303.3 เพื่อดูรูปยา จำนวน วิธีใช้ ราคา และยอดรวมจาก order เดียวกัน ไม่มีปุ่มจ่ายเงินในตะกร้า', 'หัวห้องแชทมีปุ่มจบสนทนาสีแดง เปิดยืนยันจบโดยตรง ไม่มีเมนูตัวเลือก C304; ขณะรอเภสัชแสดงยกเลิกสีแดงและยืนยันยกเลิกคิว', 'ไม่แสดงการ์ดข้อมูลก่อนปรึกษาในแชท ข้อมูลอาการและสุขภาพยังเก็บในเคสให้เภสัชกรใช้ดูแล', 'แตะรูปหรือชื่อเภสัชกรเปิดข้อมูลในป๊อปอัป C303.4 แล้วกลับแชทเดิมได้', 'ส่วนบนห้องแชทแสดงชื่อ ใบอนุญาต และสาขาจากเคส พร้อมปุ่มวิดีโอคอล ไม่มีปุ่มโทร ข้อความผู้ใช้สี Primary ข้อความเภสัชกรสีขาวบนพื้นเทาอ่อน ใช้ภาษาไทยทุกปุ่ม', 'เภสัชกรส่งการ์ดคำขอวิดีโอคอล ลูกค้ากดเข้าร่วมเอง ย่อคอลมาพิมพ์แชทและกลับเข้าคอลได้โดยสายไม่หลุด', 'แชทแสดงการ์ดรายการยารูปแบบหัว เนื้อหา ท้าย: รูปยา ชื่อ จำนวน วิธีใช้ ราคา และรวมค่ายา ใช้รายการเดียวกับบิลและใบสรุป ไม่มีปุ่มจ่ายเงินหรือปุ่มคำสั่งซื้อในการ์ด เมื่อจบแชทจึงเปิดหน้าชำระเงินและเริ่มนับเวลา', 'ออกจากห้อง = เคสยังเปิด กลับเข้าได้จากหน้าแรก แถบด้านล่าง และประวัติ', 'ข้อความใหม่ตอนออกจากแอป = แจ้งเตือนแบบคำกลาง ๆ', 'A4 + A9 (20/10): แชทเก็บ 1 ปีนับจากวันปิดเคส',
    'นโยบายล่าสุด: ไม่มีการตอบกลับ 3 นาที แจ้งเตือนอีก 2 นาที ก่อนสิ้นสุดเมื่อครบ 5 นาที; แยกจากเวลาชำระยา 15 นาที และไม่ยกเลิกรายการยารอชำระเมื่อจบแชท'],
  wait: ['ลูกค้าเงียบระหว่างไปจ่ายเงิน (มีรายการรอชำระ) นับเวลาเงียบไหม · ต้นแบบนับเหมือนกัน ปิดแล้วรายการยกเลิก'],
  prep(S) {
    const st = S.st.room === 'moved' ? (S.st.room='live') : ['expired','closed-payexpired'].includes(S.st.room) ? (S.st.room='order') : S.st.room || 'live';
    if(['closed-unpaid','payment-soon','closed-payexpired','checkout-handoff'].includes(st)){TP.casePreview.seed(st==='checkout-handoff'?'closed-unpaid':st);if(st==='checkout-handoff'){S.case.checkoutHandoffUntil=Date.now()+30000;Object.assign(S.case.order,{awaitingCheckout:true,paymentStartedAt:null,expiresAt:null});}return;}
    if(['waiting','waiting-message','waiting-paused','provider-joined'].includes(st)){S.st.queue=({'waiting':'q4','waiting-message':'message','waiting-paused':'paused','provider-joined':'joined'})[st];TP.SCREENS.queue.prep(S);return;}
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
    const waiting=waitingForPharmacist(c);
    const videoWaiting=waiting&&c.mode==='video';
    seed(c);
    const closed = c.status === 'closed';
    const call = TP.S.call ? `<button type="button" class="rm-call" data-a="startVideo">${ic('video', 16, 2)}<span>${TP.S.call.waitingProvider ? 'รอเภสัชกรเข้าห้องวิดีโอ' : 'กำลังวิดีโอคอล'} <b class="num" id="rmCallT">${TP.S.call.waitingProvider ? '' : '00:00'}</b></span><span class="rm-call-go">แตะเพื่อกลับ</span></button>` : '';
    return `<header class="nav solid rm-nav rm-waiting-nav"><div class="nb-l"><button type="button" class="back" data-a="queueMin" aria-label="ย่อห้อง">${ic('chevron-left',22,2)}</button></div><h1>แชทกับเภสัชกร</h1><div class="nb-r">${waiting?'<button type="button" class="txtbtn rm-cancel-wait" data-sheet="cancelq">ยกเลิก</button>':closed?'':'<button type="button" class="txtbtn rm-cancel-wait" data-sheet="endcase">จบสนทนา</button>'}</div></header>
      ${!waiting?`<div class="rm-provider-bar"><button type="button" class="rm-who" data-sheet="chatprovider" aria-label="ดูข้อมูลเภสัชกร" aria-haspopup="dialog">${ui.av('', {ini:p.ini,img:p.id==='tp'?TP.demoProfiles?.pharmacist_m:'/assets/profiles/pharmacist-chat-v2.png',size:'sm',solid:true})}<span><b>${esc(p.short)} <span class="rm-provider-license">· ${esc(p.lic)}</span></b><small>${esc(b.name)}</small></span></button>${closed?'':`<button type="button" class="ibtn" data-a="chatVideo" aria-label="วิดีโอคอล">${ic('video',24,1.8)}</button>`}</div>`:''}
      ${waiting&&!videoWaiting?`<div class="rm-queue-bar" role="status" aria-live="polite" aria-atomic="true"><span class="rm-queue-icon" aria-hidden="true">${ic(c.status==='paused'?'clock':'search',24,2)}</span><span class="rm-queue-copy"><b>${c.status==='paused'?'รอเภสัชกรกลับมารับบริการ':'กำลังหาเภสัชกร...'}</b><small id="rmQueueLabel">${esc(queueChatLabel(c))}</small></span></div>`:''}
      ${call}${TP.S.netOff ? `<div class="rm-net" role="status">${ic('wifi-off', 16, 2)}<span>ไม่มีอินเทอร์เน็ต ข้อความจะส่งเมื่อกลับมาออนไลน์</span></div>` : ''}
      <div class="scroll rm-scroll${!waiting?' has-provider':''}${call ? ' has-call' : ''}${waiting&&!videoWaiting?' has-queue':''}${TP.S.netOff ? ' has-net' : ''}${closed ? (c.endWhy === 'noreply' ? ' end2' : ' ended') : ''}" id="rmScroll">${waiting&&c.urgent?.length?`<div class="rm-wait-safety">${TP.queueDanger()}</div>`:''}${videoWaiting?videoQueueCard(c):''}${waiting&&!TP.S.notif?ui.note('ปิดการแจ้งเตือนอยู่ เปิดไว้เพื่อรับแจ้งเมื่อถึงคิว',{icon:'bell-off'})+ui.btn('เปิดการแจ้งเตือน',{a:'queueEnableNotifications',kind:'secondary',icon:'bell'}):''}${waiting&&!videoWaiting?'':`<div class="rm-day">${esc(c.day0 || 'วันนี้')}</div>`}<div class="rm-list" id="rmList">${c.msgs.map(msgHtml).join('')}</div><div class="rm-quick" id="rmQuick"></div>${idleHtml(c)}</div>
      ${closed && TP.checkoutHandoffRemaining(c) ? ui.dock(ui.btn(`ขั้นตอนต่อไป ชำระค่ายา (${TP.checkoutHandoffRemaining(c)} วิ)`,{a:'continueCheckout'})) : closed && c.order?.status==='pending' ? ui.dock(`${ui.btn('ดูรายการยาและชำระเงิน',{a:'openOrderPayment',icon:'credit-card'})}${ui.btn('เปิดใบสรุป',{kind:'ghost',go:'summary',p:{id:c.id}})}`,{note:`ปรึกษาเสร็จแล้ว · ชำระค่ายาภายใน ${esc(TP.orderTime(c.order))} น.`}) : closed && c.endWhy === 'noreply' ? ui.dock(`${TP.S.storeOpen ? ui.btn('ปรึกษาใหม่', { a: 'requeue', icon: 'message-circle' }) : ui.btn('ฝากคำถามถึงเภสัชกร', { go: 'offline', icon: 'message-circle' })}${ui.btn('เปิดใบสรุป', { kind: 'ghost', go: 'summary', p: { id: c.id } })}`, { note: TP.S.storeOpen ? 'ยังมีอาการ ปรึกษาใหม่ได้ทันทีที่สาขาเดิม ไม่ต้องกรอกอาการใหม่ · ไม่มีค่าปรึกษา' : `ร้านปิดแล้ว ฝากคำถามไว้ เภสัชกรตอบ${TP.OF_REPLY}` }) :
      closed ? ui.dock(`<p class="dock-note" style="margin:0">เคสนี้ปิดแล้ว · ดูย้อนหลังได้ในประวัติ 1 ปีนับจากวันปิดเคส</p>${ui.btn('เปิดใบสรุป', { go: 'summary', p: { id: c.id } })}`) :
      `<div id="rmBasket" class="rm-basket-strip"${TP.chatBasketBar(c.order) ? '' : ' hidden'}>${TP.chatBasketBar(c.order)}</div><div class="dock rm-comp"><div class="rm-compose-row"><button type="button" class="ibtn" data-a="sendPhoto" aria-label="ส่งรูป">${ic('camera', 22, 1.8)}</button><label class="sr" for="rmIn">พิมพ์ข้อความ</label><textarea id="rmIn" class="rm-in" rows="1" placeholder="${waiting?'พิมพ์อาการเพิ่มเติมไว้ระหว่างรอ':'พิมพ์ข้อความ'}">${esc(c.draft||'')}</textarea><button type="button" class="rm-send" data-a="sendMsg" aria-label="ส่ง" disabled>${ic('arrow-up', 20, 2.4)}</button></div></div>`}`;
  },
  mount(el, ctx) {
    const c = C(), sc = $('#rmScroll', el), inp = $('#rmIn', el), send = $('.rm-send', el);
    const bottom = (smooth = true) => sc.scrollTo({ top: sc.scrollHeight, behavior: smooth && !TP.RED() ? 'smooth' : 'auto' });
    el._bottom = bottom;
    requestAnimationFrame(() => { if (!$('.rm-video-wait',el)) bottom(false); });
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
/* the bubble flies up out of the composer */
async function sendText(text) {
  if (C()?.status === 'closed') return;
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
  if(TP.chatConsult(c)&&c.order&&text==='ไม่มีคำถามเพิ่มเติม'){await typing(el,1000);if(C()!==c||c.status!=='room')return;push(el,{who:'ph',text:'รับทราบค่ะ ดิฉันสรุปการปรึกษาแล้ว ระบบจะพาไปตรวจสอบข้อมูลและชำระค่ายานะคะ',time:now()});TP.sim.closeCase('ph');return;}

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
  c.msgs.push({ kind: 'summary', time: at || now(), by });
  TP.followCaseClosed?.(c);
  TP.S.history.unshift({ id: c.id, caseCode: TP.caseCode(c), note: c.note, date: c.date || TP.NOW.date, time: c.joinedAt, who: c.who, topic: c.symptoms.join(' ') || 'ถามเรื่องยา', branch: c.branch, pharm: c.pharm, bought: c.order?.status === 'paid' ? c.order.total : 0, orderStatus: c.order?.status || 'none', outcome:c.outcome, rated: 0, summary: true, _case:c });
  TP.S.inbox.unshift({ id: 'n' + Date.now(), kind: 'summary', title: 'ใบสรุปการปรึกษาพร้อมแล้ว', body: 'แตะเพื่อเปิดดู', time: TP.NOW.date + ' 14:41', read: false, go: 'summary' });
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
  group: 'during', title: 'ตะกร้ายา', code: 'C303.3', host: 'room', tall: true,
  states: [['normal', 'รายการยาจากเภสัชกร'], ['empty', 'ยังไม่มีรายการยา · กรณีสำรอง']],
  notes: ['ซ่อนแถบตะกร้าเมื่อยังไม่เพิ่มยาหรือลบยาทั้งหมด ไม่เปิดตะกร้าว่างในโฟลว์ปกติ หน้าว่างเป็นกรณีสำรองสำหรับ preview เท่านั้น', 'เปิดจากแถบตะกร้ายาเหนือช่องพิมพ์ใน C303 หลังเภสัชกรเพิ่มยา ใช้ order.items เดียวกับการ์ดแชทและใบเสร็จ', 'แสดงรูป ชื่อ จำนวน วิธีใช้ ราคา และยอดรวม อ่านอย่างเดียว ไม่มีปุ่มชำระเงินหรือแก้จำนวน ผู้ใช้แจ้งเภสัชกรในแชทหากต้องการแก้รายการ', 'ปิดด้วยปุ่มปิด กากบาท พื้นหลัง หรือ Escape แล้วกลับห้องเดิมพร้อมข้อความร่าง'],
  prep(S) { S.st.room = S.st.medicinebasket === 'empty' ? 'live' : 'order'; TP.SCREENS.room.prep(S); },
  render() {
    const o = C()?.order;
    if (!o?.items?.length || o.status === 'cancelled') return `<div class="rm-basket-empty"><img class="rm-basket-empty-illustration" src="/assets/illustrations/medicine-basket-empty-v1.png" alt=""><h3 class="h3">ยังไม่มีรายการยา</h3><p class="small">รายการยาจะแสดงเมื่อเภสัชกรเพิ่มยาให้คุณ</p></div>`;
    return `<section class="rm-basket-content"><header class="rm-basket-intro"><div><span class="rm-basket-eyebrow">ตะกร้ายาของคุณ</span><b>รายการยาที่เภสัชกรเพิ่มให้</b><p class="small">${o.items.length} รายการ</p></div></header><div class="rm-basket-items">${TP.orderMedicineList(o)}</div><div class="rm-basket-total"><span>รวมค่ายา</span><b class="num">${TP.money(o.total)}</b></div><div class="note warn">${ic('info',18,1.8)}<span>โปรดแจ้งเภสัชกร หากต้องการแก้ไขรายการยา</span></div></section>`;
  },
  foot: () => ui.btn('ปิด', { closeSheet: true })
});

TP.sheetDef('chatprovider', {
  group: 'during', title: 'ข้อมูลเภสัชกร', code: 'C303.4', host: 'room', cls: 'rm-provider-popup',
  states: [['normal', 'ข้อมูลเภสัชกรผู้ให้คำปรึกษา']],
  notes: ['แตะรูปหรือชื่อเภสัชกรในหัวห้องแชท เปิดป๊อปอัปกลางจอพร้อมพื้นหลังมืด', 'รูป ชื่อ เลขใบอนุญาต และสาขาอ้างอิงเภสัชกรและสาขาในเคสเดียวกัน ไม่สร้างเลขใบอนุญาตร้านหรือคุณวุฒิเพิ่มเอง', 'ปิดแล้วกลับห้องเดิม ข้อความร่างและการสนทนายังคงอยู่'],
  prep(S) { S.st.room = 'live'; TP.SCREENS.room.prep(S); },
  render() {
    const c = C(), p = P(), b = TP.branch(c?.branch);
    const img = p.id === 'tp' ? TP.demoProfiles.pharmacist_m : '/assets/profiles/pharmacist-chat-v2.png';
    return `<article class="rm-provider-profile"><img class="rm-provider-portrait" src="${esc(img)}" alt="${esc(p.name)}"><h3 class="h3">${esc(p.name)}</h3><dl><div><dt>ตำแหน่ง</dt><dd>เภสัชกร</dd></div><div><dt>เลขใบอนุญาต</dt><dd>${esc(p.lic)}</dd></div><div><dt>สาขา</dt><dd>${esc(b.name)}</dd></div>${b.lic ? `<div><dt>ใบอนุญาตร้านยา</dt><dd>${esc(b.lic)}</dd></div>` : ''}</dl></article>`;
  },
  foot: () => ui.btn('ปิด', { closeSheet: true })
});

/* End consultation directly from the header, then confirm. */
TP.sheetDef('endcase', {
  group: 'during', title: 'ผู้ใช้กดจบสนทนา', code: 'C305', ref: 'C09', host: 'room',
  render: () => { const o = C()?.order; return `<p class="body">${o?.status === 'pending' ? 'รายการยายังชำระได้ภายในเวลาที่กำหนด แม้จบการสนทนาแล้ว ' : ''}เคสนี้จะปิด และคุณจะได้ใบสรุปจากเภสัชกร ถ้ายังมีอาการ ปรึกษาใหม่ได้ทุกเมื่อ</p>`; },
  foot: () => ui.btn('จบการปรึกษา', { kind: 'danger', a: 'endCase' }) + ui.btn('คุยต่อ', { kind: 'ghost', closeSheet: true })
});
TP.act('askEnd', async () => { await TP.closeSheet({ instant: true }); TP.sheet('endcase'); });
TP.act('endCase', async () => {
  const c = C(); if (!c) return;
  await TP.closeSheet();
  TP.sim.closeCase('me');
  TP.notify('จบการปรึกษาแล้ว ดูใบสรุปได้ในประวัติ', { icon: 'circle-check' });
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
TP.simAction({ id: 'close', label: 'ปิดเคส + ใบสรุป', when: S => ['matched', 'room'].includes(S.case?.status), run: () => TP.sim.closeCase() });
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
    const portrait = p.id === 'tp' ? TP.demoProfiles.pharmacist_m : '/assets/profiles/pharmacist-chat-v2.png';
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
const recvKeys = () => {const o=C().order,off=o?.recvOff||{};return ['pickup','express','parcel'].filter(k=>!off[k]&&(k==='pickup'||!hasCold(o)));};
const RECV_NAME = { pickup: 'รับที่ร้าน', express: 'ส่งด่วน', cold: 'ส่งแบบควบคุมความเย็น' };
const addrs = () => TP.S.addrs || (TP.S.addrs = []);
/* same order as CustomerAddress::getFormattedAddressAttribute (ต./อ./จ. even in Bangkok, like the website) */
const fmtAddr = a => [a.house,a.building, a.alley, a.road && (/^(ถนน|ถ\.)/.test(a.road)?a.road:'ถ.'+a.road), 'ต.' + a.dist, 'อ.' + a.amp, 'จ.' + a.prov, a.zip].filter(Boolean).join(' ');
TP.fmtAddr = fmtAddr;
const fmtPhone = s => { const d = String(s || '').replace(/\D/g, ''); return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : d.length === 9 ? `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}` : String(s || ''); };
/* defaults: pickup checked (owner 19/10, website checkout CSM:409) · main address checked · PromptPay checked (PL:550) */
const P = () => {const p=TP.S.pay || (TP.S.pay = { recv: 'pickup', addr: (TP.homeAddress?.() || addrs().find(a => a.main) || addrs()[0])?.id || null, method: 'promptpay', bank: 'KBANK', form: null, q: null, geo: '', geoMsg: '', moved: false, pinXY: null, acc: 0 });if(!recvKeys().includes(p.recv))p.recv=recvKeys()[0]||'pickup';p.form=null;if(!['promptpay','card'].includes(p.method))p.method='promptpay';return p;};
const addr = () => {const c=C();if(!Object.hasOwn(c,'deliveryAddress')){const a=TP.homeAddress?.()||addrs().find(x=>x.main)||addrs()[0];c.deliveryAddress=a?structuredClone(a):null;}return c.deliveryAddress;};
const qKey = () => P().recv + ':' + (addr()?.id || '');
const quoted = () => P().q?.st === 'done' && P().q.key === qKey();
const EXP_FEE = () => TP.DELIVERY.find(d => d.id === 'express').fee;
function shipFee() {
  const p = P();
  if (p.recv === 'pickup') return 0;
  if (p.recv === 'cold') return addr() && !zoneStop(addr(), 'cold') ? TP.COLD.fee : null;
  if (!quoted()) return null;
  if (p.recv === 'express') return EXP_FEE();
  return TP.DELIVERY.find(d => d.id === 'parcel').fee;
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
 updateCoupon();if(p.couponError)$('#payCoupon')?.focus({preventScroll:true});
});
TP.act('payCouponRemove',()=>{if(!TP.orderPayable(C()?.order))return TP.orderExpiryTick();delete C().order.discount;const p=couponState();p.couponDraft='';p.couponError='';updateCoupon();$('#payCoupon')?.focus({preventScroll:true});});
function totals() {
  const items = C().order.total, discount=couponDiscount(), ship = shipFee(), sub = items-discount + (ship || 0), fee = P().method === 'card' ? r2(sub * TP.CARD_FEE) : 0;
  return { items, discount, coupon:discount?C().order.discount.code:null, ship, fee, total: r2(sub + fee) };
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
  if (!quoted()) return 'กำลังคำนวณค่าส่ง...';
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
const ensureOrder = () => { if(!C())TP.ensureCase('room');if(!C().order&&C().status!=='closed')TP.makeOrder();TP.expireOrder(C());return TP.orderPayable(C().order); };

/* ---------- blocks (PL order: 1 รายการยา · 2 การรับสินค้า + ที่อยู่ + ปักหมุด + สรุปยอด · 3 วิธีชำระเงิน) ---------- */
const sec = (n, t) => `<h3 class="pay-sec">${esc(t)}</h3>`;
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
      sub: esc(S.storeOpen ? 'ส่งเร็วใน 1–4 ชม.' : `ส่งด่วนใช้ได้ช่วงร้านเปิด ${b.hours}`),
      fee: !S.storeOpen ? '' : ozE ? 'นอกเขต' : farNow ? 'นอกระยะ' : p.recv === 'express' && q ? TP.money(EXP_FEE()) : 'ตามระยะทาง', tone: ozE || farNow ? 'warn' : p.recv === 'express' && q ? '' : 'pend' }),
    parcel: () => optCard({ group: 'recv', v: 'parcel', a: 'payRecv', icon: 'package', title: TP.DELIVERY.find(d => d.id === 'parcel').name, on: p.recv === 'parcel',
      sub: esc('ได้รับสินค้าภายใน 1-3 วันทำการ' + next),
      fee: ozP ? 'นอกเขต' : p.recv === 'parcel' && q ? TP.money(shipFee()) : 'คำนวณตามที่อยู่', tone: ozP ? 'warn' : p.recv === 'parcel' && q ? '' : 'pend' }),
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
 return o?.recvOff?.express&&o?.recvOff?.parcel?`<p class="pay-why">${ic('info',16,2)}<span>รายการนี้รับที่ร้านเท่านั้น${o.recvWhy?' · '+esc(o.recvWhy):''}</span></p>`:'';
}
/* PL pickup: the branch card with directions and a call button */
function recvExtra() {
  const p = P(), b = TP.branch(C().branch);
  if (p.recv !== 'pickup') return '';
  return `<div class="pay-br"><div class="pay-branch-heading">${b.photo?`<img src="${esc(b.photo)}" alt="${esc(b.name)}" width="72" height="72" loading="lazy">`:`<span class="pay-branch-placeholder">${ic('store',28,1.8)}</span>`}<div><span class="pay-branch-eyebrow">สาขารับยา</span><h4>${esc(b.name)}</h4><p>${ic('clock',14,1.8)} เปิด ${esc(b.hours)}</p></div></div><div class="pay-branch-address">${ic('map-pin',18,1.8)}<p>${esc(b.addr || 'ยังไม่มีข้อมูลที่อยู่สาขา')}</p></div><p class="small pay-br-n">แสดงรหัสรับยาที่เคาน์เตอร์เมื่อร้านแจ้งว่ายาพร้อม</p>
    <div class="pay-br-b">${ui.btn('แผนที่', { kind: 'secondary', sm: true, icon: 'navigation', a: 'payMapsGo' })}${ui.btn('โทรหาร้าน', { kind: 'secondary', sm: true, icon: 'phone', a: 'payCallBr' })}</div></div>`;
}
/* PL saved-address rows inside one card; the pin tag only matters for express so it shows only there */
function cardsHtml() {
 const x=addr();if(!x)return `<p class="pay-none">${ui.emptyArt('map-pin')}<span>ยังไม่มีที่อยู่ที่เลือกจากหน้าแรก กรุณาเลือกรับที่ร้าน</span></p>`;
 return `<article class="pay-address-readonly"><p><b>${esc([x.first,x.last].filter(Boolean).join(' '))}</b></p><p>${esc(fmtAddr(x))}</p><p>โทร ${esc(fmtPhone(x.phone))}</p><small>ที่อยู่ที่เลือกจากหน้าแรก</small></article>`;
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
function methodOpts() {
  const p = P();
  if (!['promptpay', 'card'].includes(p.method)) p.method = 'promptpay';
  const choice=(value,title,art,description)=>`<button type="button" class="opt po pay-method-option" role="radio" data-radio="meth" data-v="${value}" data-a="payMeth" aria-checked="${p.method===value}" tabindex="${p.method===value?0:-1}"><span class="pay-method-art" aria-hidden="true">${art}</span><span class="tx"><b>${title}</b><span class="pay-method-description">${description}</span></span>${ui.radioMark}</button>`;
  return [
    choice('promptpay','พร้อมเพย์','<img src="/assets/payments/thai-qr-symbol.png" alt="" width="48" height="48">','สแกน QR ผ่านแอปธนาคาร'),
    choice('card','บัตรเครดิต/เดบิต',`<svg viewBox="0 0 48 48" width="48" height="48" fill="none" focusable="false"><rect width="48" height="48" rx="12" fill="var(--brand-soft)"/><rect x="6" y="9" width="32" height="22" rx="4" transform="rotate(-9 6 9)" fill="var(--brand-deep)"/><rect x="9" y="17" width="33" height="23" rx="4" fill="var(--brand)"/><path d="M9 23h33" stroke="var(--semantic-on-primary)" stroke-width="4" opacity=".9"/><rect x="14" y="29" width="7" height="5" rx="1.5" fill="var(--semantic-warning-background)"/><path d="M27 33h9" stroke="var(--semantic-on-primary)" stroke-width="2" stroke-linecap="round"/></svg>`,'ค่าธรรมเนียม 3.65%')
  ].join('');
}
const bankRow = () => `<div class="pay-banks" data-radio-scope role="radiogroup" aria-label="เลือกธนาคาร">${TP.BANKS.map(([k, app, n]) => `<button type="button" class="bank" role="radio" data-radio="bank" data-v="${k}" data-a="payBank" aria-checked="${P().bank === k}" aria-label="${esc(app + ' ' + n)}"><span class="bank-l">${esc(k)}</span><small>${esc(app)}</small></button>`).join('')}</div>`;
const shipLabel = () => P().recv === 'express' ? 'ค่าจัดส่ง (Lalamove)' : P().recv === 'cold' ? 'ค่าส่งแบบเย็น (กล่องเก็บความเย็น)' : 'ค่าจัดส่ง';
/* PL summary card between section 2 and 3; the shipping row is hidden for pickup like the website */
function sumHtml(t) {
  const p = P(), a = addr(), oz = zoneStop(a), far = p.recv === 'express' && isFar(a), rows = [['ยอดค่ายา', TP.money(t.items)]];
  if(t.discount)rows.push(['ส่วนลด ('+t.coupon+')','−'+TP.money(t.discount)]);
  if (p.recv !== 'pickup') rows.push([shipLabel(), t.ship === null ? `<span class="pay-pend">${oz ? 'นอกเขตส่งยา' : far ? 'ส่งด่วนไม่ได้' : 'คำนวณตามที่อยู่'}</span>` : TP.money(t.ship)]);
  if (t.fee) rows.push(['ค่าธรรมเนียมบัตร (3.65%)', TP.money(t.fee)]);
  rows.push([t.ship === null ? 'ยอดรวม (ยังไม่รวมค่าส่ง)' : 'ยอดชำระรวม', '<span id="payTot"></span>', 'tot']);
  const hint = '';
  return ui.kv(rows, { cls: 'pay-kv' }) + hint;
}
/* real-user R4 P1: pickup is chosen by default (owner #48), so the pay bar always says how the medicine arrives */
const VIA_IC = { pickup: 'store', express: 'zap', parcel: 'package', cold: 'snowflake' };
const viaText = () => { const p = P(), b = TP.branch(C().branch); return p.recv === 'pickup' ? `รับยาเองที่ร้าน ${b.name}` : p.recv === 'express' ? 'ส่งด่วนถึงบ้าน (Lalamove)' : p.recv === 'cold' ? `ส่งแบบควบคุมความเย็น (${TP.COLD.short})` : TP.DELIVERY.find(d => d.id === 'parcel').name; };
const expLine = o => `ชำระภายใน ${TP.orderTime(o)} น. · เหลือ <b data-order-countdown>${TP.orderRemaining(o)}</b>`;

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
TP.taxRecipientPicker = (kind,action) => {const rows=TP.taxRecords(kind),selected=TP.taxSelected(kind);return rows.length>1?`<div class="tax-recipient-picker" role="group" aria-label="เลือกผู้รับใบกำกับภาษี">${rows.map(r=>`<button type="button" class="rc-tax-type-option${r.profileKey===selected?.profileKey?' selected':''}" data-a="${action}" data-key="${esc(r.profileKey)}" data-v="${kind}" aria-pressed="${r.profileKey===selected?.profileKey}">${esc(r.name)} · ${esc(String(r.id).slice(-4))}</button>`).join('')}</div>`:'';};
const maskCheckoutTax = v => 'xxxxxxxxx' + String(v).slice(-4);
function payTaxHtml() {
  const p=P(), who=p.taxWho||'me', record=p.taxWant?TP.taxSelected(who):null;
  return `<section class="rc-tax rc-tax-request-card"><header class="rc-tax-request-head rc-tax-choice-head"><button type="button" class="rc-tax-check" role="checkbox" aria-checked="${!!p.taxWant}" data-a="payTaxWant" data-v="${p.taxWant?'no':'yes'}" aria-label="ต้องการใบกำกับภาษี"><span class="rc-tax-choice-icon" aria-hidden="true">${ic('file-text',22)}</span><span class="rc-tax-choice-copy"><b>ต้องการใบกำกับภาษี</b></span><span class="rc-tax-choice-check" aria-hidden="true">${p.taxWant?ic('check',16):''}</span></button></header>${record?`<div class="rc-tax-recipient-heading"><b>ข้อมูลผู้รับ</b><button type="button" class="txtbtn" data-a="payTaxPickOpen">${ic('pencil',16)} เปลี่ยนผู้รับ</button></div><div class="rc-tax-selected"><b>ชื่อและที่อยู่ใบกำกับภาษี</b><p>${esc(record.name||[record.first,record.last].filter(Boolean).join(' '))}</p><p>${esc(TP.taxAddress(record))}</p>${who==='co'&&record.business?`<p>ชื่อธุรกิจ : ${esc(record.business)}</p>`:''}<p>โทรศัพท์ : ${esc(record.phone||'—')}</p><p>${who==='co'?'เลขประจำตัวผู้เสียภาษี':'เลขประจำตัวประชาชน'} : ${esc(maskCheckoutTax(record.id||''))}</p></div>`:''}</section>`;
}
function redrawPayTax(){const el=$('#payTax');if(el){el.innerHTML=payTaxHtml();TP.icons(el)}}
TP.act('payTaxWant',b=>{if(b.dataset.v==='no'){P().taxWant=false;redrawPayTax();return;}return TP.ACTS.payTaxPickOpen();});
TP.act('payTaxSelectProfile',b=>{TP.taxChoose(b.dataset.v,b.dataset.key);redrawPayTax()});
TP.act('payTaxWho',b=>{P().taxWho=b.dataset.v;redrawPayTax()});
TP.act('payTaxAddProfile',async()=>{const who=P().taxWho||'me';await TP.closeSheet({instant:true});TP.S.st.taxprofile=who==='co'?'company':undefined;await TP.go('taxprofile');});

/* ---------- pay sheet ---------- */
TP.sheetDef('pay', {
  group: 'during', title: 'ชำระเงิน', code: 'C308', ref: 'C11', host: 'room', tall: true, fullPage:true,
  /* C308.1-13 keep the numbers the owner already reviewed; states added 19/10 night go after them (14-17), 20/10 night 18-20 */
  states: [['normal', 'รับที่ร้าน (ค่าเริ่มต้น)'], ['parcel', 'จัดส่งปกติ'], ['express', 'ส่งด่วน'], ['noaddr', 'ยังไม่มีที่อยู่'], ['form', 'กำลังเพิ่มที่อยู่'], ['closed', 'ร้านปิด'], ['card', 'จ่ายด้วยบัตร'], ['otp', 'บัตร: หน้ายืนยันของธนาคาร'], ['qr', 'หน้า QR พร้อมเพย์'], ['qrexp', 'QR หมดอายุ'], ['bankon', 'พร้อมเพย์ (แทนแอปธนาคารเดิม)', false], ['bankapp', 'QR พร้อมเพย์ (แทนแอปธนาคารเดิม)', false], ['checking', 'กำลังตรวจสอบการชำระ'],
    ['expmap', '', false], ['exppin', '', false], ['locdeny', '', false], ['far', 'กรุงเทพแต่เกิน 15 กม.'],
    ['outzone', 'ที่อยู่นอกเขตส่งยา'], ['recvoff', 'เภสัชกรปิดบางทาง'], ['cold', 'มียาเก็บเย็น'], ['unlock', 'ส่งด่วนเกินระยะ รับที่ร้านแทน'], ['map-ready', '', false], ['map-outside', '', false], ['map-error', '', false],['map-saved', '', false], ['coupon-valid','โค้ดส่วนลดใช้ได้'], ['coupon-invalid','โค้ดส่วนลดไม่ถูกต้อง'], ['coupon-expired','โค้ดส่วนลดหมดอายุ'], ['order-expired','หมดเวลาชำระค่ายา']],
  notes:['วิธีรับยาเรียงแนวตั้งแบบ radio 3 แถว แสดงเวลาและค่าส่ง ไม่มีเส้นคั่นท้ายส่วนรับยาและใบกำกับภาษี','ใบกำกับภาษีใช้การ์ดเลือกผู้รับรูปแบบเดียวกับใบเสร็จ เปิดรายชื่อที่บันทึกไว้ก่อนเลือก ไม่มีแท็บซ้อนในหน้าชำระ และไม่แสดงลิงก์ยกเลิกรายการหรือนโยบายท้ายฟอร์ม','เลือกได้ระหว่างรับที่ร้าน ส่งด่วน และจัดส่งปกติ โดยจัดส่งปกติร้านจัดขนส่งให้ ได้รับสินค้าภายใน 1-3 วันทำการ','ลำดับ: ตรวจรายการยา เลือกวิธีรับยาและที่อยู่ เลือกวิธีชำระ ตรวจยอดรวมก่อนยืนยัน','การจัดส่งต้องมีที่อยู่ในเขตบริการและทราบค่าส่งก่อนชำระ ส่งด่วนต้องอยู่ในระยะส่งด่วน ยาเก็บเย็นรับที่ร้านเท่านั้น','โหมดสนทนาเริ่มเวลาชำระ 15 นาทีเมื่อเปิดหน้าชำระครั้งแรก ไม่เริ่มใหม่เมื่อเปิดซ้ำหรือเปลี่ยนวิธีรับ','ต้นแบบจำลองราคาและการจ่ายเงินจริงยังไม่เชื่อม gateway'],
  prep(S) {
    ensureOrder(); const st = S.st.pay || 'normal';
    S.payFailNext = false; S.locFailNext = false; S.storeOpen = st === 'closed' ? false : TP.flag('storeOpen');
    S.addrs = st === 'noaddr' ? [] : TP.fresh().addrs;
    if (st === 'far') S.addrs.push({ ...FAR_ADDR });
    /* same main address as C203.8 (real-user 21/10: the two screens disagreed) */
    if (st === 'outzone' || st === 'unlock') S.addrs = [{ ...ZONE_ADDR, main: true }, ...S.addrs.map(a => ({ ...a, main: false }))];
    if (st === 'outzone' || st === 'far') TP.setFlag('zoneLock', true);
    if (st === 'unlock') TP.setFlag('zoneLock', false);
    const o = C().order;
    if(st==='order-expired'){TP.startOrderPayment(o);o.expiresAt=Date.now()-1;TP.expireOrder(C());}
    if(st==='normal'){o.items=TP.ORDER_ITEMS.map(i=>({...i}));o.total=o.items.reduce((n,i)=>n+i.price,0);} TP.withCold(o, st === 'cold'); o.recvOff = st === 'recvoff' ? { express: true, parcel: true } : null; o.recvWhy = st === 'recvoff' ? 'ต้องได้ยาวันนี้' : '';
    const previewAddress = { express: EXP_ADDR, far: FAR_ADDR, outzone: ZONE_ADDR, unlock: ZONE_ADDR }[st];
    delete C().deliveryAddress;
    if (st === 'noaddr' || previewAddress) C().deliveryAddress = previewAddress ? { ...previewAddress } : null;
    delete o.discount;
    S.pay = null; const p = P();
    if(st.startsWith('coupon-')){o.items=TP.ORDER_ITEMS.map(i=>({...i}));o.total=o.items.reduce((n,i)=>n+i.price,0);couponState();p.couponDraft=st==='coupon-valid'?'TEST50':st==='coupon-expired'?'EXPIRED50':'WRONGCODE';if(st==='coupon-valid')o.discount=TP.checkoutCouponAdapter.validate(p.couponDraft,o);else p.couponError=TP.checkoutCouponAdapter.validate(p.couponDraft,o).error;}
    p.recv = { parcel: 'parcel', express: 'express', far: 'express', noaddr: 'express', form: 'express', outzone: 'express', cold: 'pickup', unlock: 'express' }[st] || 'pickup';
    if (st === 'far' || st === 'outzone' || st === 'unlock') p.addr = 'a3';
    p.method = ['card', 'otp'].includes(st) ? 'card' : 'promptpay';
    if (st === 'form' || st === 'noaddr') p.form = { id: null };
    if (['qr', 'qrexp', 'otp', 'bankapp', 'checking'].includes(st)) p.auto = st==='bankapp'?'qr':st;
  },
  render(ctx) {
    if(!ensureOrder())return ui.note(C()?.order?.status==='expired'?'รายการนี้หมดเวลาชำระแล้ว':'รายการนี้ชำระไม่ได้แล้ว',{icon:'clock'});
    const o = C().order, p = P(), b = TP.branch(C().branch);
    const summary = TP.consultationSummary?.({ id: C().id, _case: C() });
    const advice = C().pharmacistAdvice || summary?.advice;
    const adviceText = Array.isArray(advice) ? advice.join("\n") : (advice || "");
    TP.startOrderPayment(o);
    requote();
    return `<div class="payw"><p class="pay-store" data-in="1">${ic('store', 18, 2)}<b>${esc(b.name)}</b></p>
      <p class="pay-exp">${ic('clock', 13, 2)}<span>${expLine(o)}</span></p>
      <section class="checkout-block checkout-order-section"><div class="msg-order checkout-order-card">${TP.orderMedicineDetails(o)}</div>
      ${adviceText ? `<section class="card af-visit-section checkout-advice"><h3>${ic('file-text',20,1.8)} คำแนะนำจากเภสัชกร</h3><p class="af-advice-text">${esc(adviceText)}</p></section>` : ''}
      <div id="payCouponBox">${couponHtml()}</div>
      </section><section class="checkout-block checkout-delivery">${sec(2, 'เลือกวิธีรับยา')}
      <div class="opts" data-radio-scope role="radiogroup" aria-label="เลือกวิธีรับยา" id="payRecv">${recvOpts()}</div>
      <div id="payWhy">${whyHtml()}</div>
      <div id="payRecvX">${recvExtra()}</div>
      <div id="payAddrSec"${p.recv === 'pickup' ? ' hidden' : ''}>
        <section class="card af-visit-section checkout-address"><h3>${ic('map-pin',20,1.8)} ที่อยู่จัดส่ง</h3><div id="payCards">${cardsHtml()}</div></section>
        <div id="payForm"></div>
        <div id="payGeo">${geoHtml()}</div></div>
      </section><section class="checkout-block checkout-tax"><div id="payTax">${payTaxHtml()}</div></section><section class="checkout-block">${sec(4, 'เลือกวิธีชำระเงิน')}
      <div class="opts" data-radio-scope role="radiogroup" aria-label="วิธีชำระเงิน" id="payMeth">${methodOpts()}</div>
      <div id="payExtra">${p.method === 'bank' ? bankRow() : ''}</div>
      </section><section class="checkout-block checkout-review">${sec(5, 'สรุปยอดชำระ')}<div class="pay-sum" id="paySum">${sumHtml(totals())}</div></section>
      </div>`;
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
  $('#payRecvX', sh).innerHTML = recvExtra();
  sec.hidden = p.recv === 'pickup';
  const ads = $('.pay-ads', sh);
  if (ads && addrs().length) patchOpts(ads, cardsHtml().replace(/^<div[^>]*>|<\/div>$/g, '')); else $('#payCards', sh).innerHTML = cardsHtml();
  const addButton=$('#payAdd',sh);if(addButton)addButton.hidden=true;
  $('#payGeo', sh).querySelector('[data-address-map]')?._addressMap?.cleanup();
  $('#payGeo', sh).innerHTML = geoHtml();
  globalThis.TPAddressMap?.mount(sh,sh._addressMapCtx);
  patchOpts($('#payMeth', sh), methodOpts());
  $$('#payMeth [role=radio]',sh).forEach(b=>b.tabIndex=b.getAttribute('aria-checked')==='true'?0:-1);
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
  if(p.recv!=='pickup'&&!addr())TP.notify('ยังไม่มีที่อยู่ที่เลือกจากหน้าแรก กรุณาเลือกรับที่ร้าน',{icon:'map-pin'});
});
TP.act('payViaGo', () => { goTo('#payRecv'); $('[data-radio="recv"][aria-checked="true"]')?.focus({ preventScroll: true }); });
TP.act('payMeth', t => {
  if(!['promptpay','card'].includes(t.dataset.v))return;
  const f = curTot(); P().method = t.dataset.v; sync(f);
  const x = $('#payExtra'); if (x.firstElementChild) A(x.firstElementChild, [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { d: 380, e: SP.soft.e });
});
TP.act('payBank', t => { P().bank = t.dataset.v; });
TP.act('payPdpa', () => TP.notify('เปิดนโยบายความเป็นส่วนตัว', { icon: 'file-text' }));
TP.act('payMapsGo', () => TP.notify('เปิด Google Maps นำทางไป ' + TP.branch(C().branch).name, { icon: 'navigation' }));
TP.act('payCallBr', () => TP.notify('กำลังโทร ' + TP.branch(C().branch).phone, { icon: 'phone' }));
TP.act('payAddrPick', () => TP.notify('ใช้ที่อยู่ที่เลือกจากหน้าแรก',{icon:'map-pin'}));
TP.act('payToPickup', () => { const f = curTot(); P().recv = 'pickup'; sync(f); $('[data-radio="recv"][data-v="pickup"]')?.focus({ preventScroll: true }); goTo('#payRecv'); });
TP.act('payToParcel', () => TP.ACTS.payToPickup());
function openForm(id) {
  P().form = { id }; const box = $('#payForm'); box.innerHTML = formHtml(); sync(); TP.icons(box);
  A(box.firstElementChild, [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { d: 360, e: SP.soft.e });
  scrollSheet(box, 'start');
  setTimeout(() => $('#na_house', box)?.focus({ preventScroll: true }), 260);
}
TP.act('payAddrNew', () => TP.notify('ใช้ที่อยู่ที่เลือกจากหน้าแรก',{icon:'map-pin'}));
TP.act('payAddrEdit', () => TP.notify('ใช้ที่อยู่ที่เลือกจากหน้าแรก',{icon:'map-pin'}));
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
TP.act('payGeoNow', () => goTo('#payPinC'));
TP.act('payGeoMap', () => goTo('#payPinC'));
TP.act('payGeoOk', () => goTo('#payPinC'));
TP.act('payRepin', () => goTo('#payPinC'));
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
  const r = await dlg(`<span class="pay-dlg-i">${ic('triangle-alert', 26, 2)}</span><h3>ยกเลิกรายการยานี้ไหม</h3><p>ยังไม่มีการตัดเงิน เภสัชกรจะเห็นว่าคุณยกเลิก</p>
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
const where = { 'บันทึกที่อยู่ก่อน': () => { goTo('.pay-form'); setTimeout(() => $('#naSave')?.focus({ preventScroll: true }), 300); }, 'เพิ่มที่อยู่จัดส่งก่อน': () => openForm(null), 'เลือกที่อยู่จัดส่งก่อน': () => goTo('#payCards'), 'อยู่นอกระยะจัดส่งด่วน': () => goTo('#payFar'), 'ที่อยู่นี้อยู่นอกเขตส่งยา': () => { goTo('#payZone'); setTimeout(() => $('#payZone [data-a="payToPickup"]')?.focus({ preventScroll: true }), 300); } };
async function shrink(b) {
  /* lock the choices while the button turns into a spinner, so the amount cannot change under the QR */
  const body = $('.sh-b', $('#sheet')); if (body) body.inert = true;
  const w = b.offsetWidth; b.classList.add('busy');
  await fin(A(b, [{ width: w + 'px', borderRadius: '14px' }, { width: '54px', borderRadius: '27px' }], { d: 420, e: E.ios, fill: 'forwards' }));
}
TP.act('payGo', async b => {
  if(!TP.orderPayable(C()?.order)){TP.orderExpiryTick();return;}
  const m = missing(); if (m) { where[m]?.(); return; }
  if(P().taxWant && !TP.taxSelected(P().taxWho||'me')){TP.notify('กรุณาเพิ่มข้อมูลออกใบกำกับภาษีก่อนชำระเงิน',{icon:'info'});return;}
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
  return `<section class="card qr-box" aria-label="ชำระเงินด้วยพร้อมเพย์">
    <header class="qr-bill-head"><span class="qr-av">${ic('store',20,1.8)}</span><div><h3>${esc(b.name)}</h3><p>${esc(viaText())}</p></div>${ui.tag('รอชำระ','warn')}</header>
    <div class="qr-bill-summary"><p class="small">ยอดที่ต้องชำระ</p><p class="qr-amt num">${TP.money(t.total)}</p><p class="qr-order-number">เลขคำสั่งซื้อ ${esc(C().order.no || '—')}</p>
      <div class="qr-breakdown">${ui.kv([['ยอดค่ายา', TP.money(t.items)], ...(t.discount?[['ส่วนลด ('+t.coupon+')','−'+TP.money(t.discount)]]:[]), ['ค่าจัดส่ง', t.ship ? TP.money(t.ship) : 'ไม่มีค่าจัดส่ง'], ...(t.fee ? [['ค่าธรรมเนียมบัตร (3.65%)', TP.money(t.fee)]] : [])])}</div>
    </div>
    <div class="qr-scan-body"><h4>สแกนจ่ายด้วยแอปธนาคาร</h4><p class="small">พร้อมเพย์</p>
      <div class="qr-code" id="qrCode"><svg viewBox="-1 -1 27 27" aria-label="QR พร้อมเพย์ สำหรับชำระ ${TP.money(t.total)}" role="img">${qrSvg()}</svg><p class="qr-dead" role="status">QR หมดอายุแล้ว กรุณาขอ QR ใหม่เพื่อสแกนอีกครั้ง</p></div>
      <p class="qr-cd">${ic('clock',16,1.8)} QR หมดอายุใน <b class="num" id="qrCd">10:00</b></p>
      ${ui.btn('บันทึก QR', { kind: 'secondary', sm: true, icon: 'download', a: 'qrSave', id: 'qrSaveBtn' })}
    </div>
    <footer class="qr-bill-foot"><h4>ชำระบนมือถือเครื่องเดียวกัน</h4><ol><li>บันทึก QR แล้วเปิดแอปธนาคาร</li><li>เลือกสแกนจากรูป และตรวจสอบผู้รับกับยอดเงินก่อนยืนยัน</li></ol></footer>
    </section>
    <div class="qr-payment-status"><div class="qr-wait" role="status"><i class="spin" aria-hidden="true"></i><b>รอการชำระเงิน</b></div><p class="small qr-c">ระบบจะอัปเดตเมื่อธนาคารยืนยันการชำระเงิน</p></div>
    <p class="small qr-c" id="qrSlow" hidden>ชำระแล้วแต่สถานะยังไม่เปลี่ยน กรุณาติดต่อร้านเพื่อตรวจสอบ</p>`;
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
  c.order.paid = { ...totals(), recv: p.recv, courier: p.recv === 'cold' ? TP.COLD.id : null, addr: p.recv === 'pickup' ? null : { ...a }, method: p.method, bank: p.bank, date: TP.NOW.date, at: TP.roomNow?.() || TP.NOW.time };
  if(p.taxWant){const recipient=TP.taxSelected(p.taxWho||'me');if(recipient)c.order.tax={who:p.taxWho||'me',pending:{...recipient}};}
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
    'ลองชำระใหม่จากรายการเดิมโดยคง expiresAt เดิม ไม่เพิ่มเวลา และไม่กลับแชท หากหมดเวลาใช้โฟลว์หมดเวลาชำระเดิม'],
  prep() { ensureOrder(); },
  render(ctx) {
    const why = ctx.params?.why || ctx.state, o = C().order, p = P(), d = TP.DELIVERY.find(x => x.id === p.recv), a = addr();
    const msg = why === 'bank' ? 'ยกเลิกการชำระในแอปธนาคาร ยังไม่มีการตัดเงิน ลองอีกครั้ง หรือเลือกพร้อมเพย์' : 'ชำระเงินไม่สำเร็จ กรุณาตรวจสอบข้อมูลบัตรหรือติดต่อธนาคารผู้ออกบัตร หรือเลือกพร้อมเพย์แทน';
    const meth = why === 'bank' ? 'ชำระผ่านแอปธนาคาร' : 'บัตรเครดิต/เดบิต';
    return ui.nav({right: ''}) + ui.page(`<section class="payment-result payment-result-failed">
      <img class="payment-result-art" src="/assets/illustrations/payment-failed-v1.png" alt="ตะกร้ายาพร้อมสัญลักษณ์แจ้งเตือน">
      <h1>ชำระเงินไม่สำเร็จ</h1><p class="payment-result-message">${esc(msg)}</p>
      <p class="payment-result-order">เลขคำสั่งซื้อ <strong class="num">${esc(o.no)}</strong></p>
      <p class="small">ลองใหม่ได้ภายในเวลาชำระเงินที่เหลือของรายการเดิม</p>
      <div class="payment-result-actions">${ui.btn('ชำระเงินอีกครั้ง',{a:'payRetry'})}${ui.btn('กลับสู่หน้าหลัก',{kind:'ghost',go:'home'})}</div>
    </section>`);
  }
});
/* the room is usually right under paid / payfail: go back to it, so back from the room then leaves the room (QA E1) */
const toRoom = () => TP.closedChatRoute?.()?TP.go('home',{root:true}):TP.hist.length && TP.hist[TP.hist.length - 1].id === 'room' ? TP.back() : TP.go('room', { via: 'uncover', replace: true });
TP.act('payRetry', async () => { if(!TP.orderPayable(C()?.order)){TP.orderExpiryTick(); return;} TP.S.st.pay = undefined; await TP.go('home',{root:true}); TP.sheet('pay'); });
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
function rcOf(id, followPreview = false) {
  const S = TP.S, c = S.case;
  if (followPreview) {
    const h = TP.followPreviewPlan?.(id);
    if (!h?.bought) return null;
    const meds = h.previewSummary?.meds || [];
    const base = Math.floor(h.bought / Math.max(meds.length, 1));
    const items = meds.map((m, i) => ({ name: m.name, qty: m.qty || '1 รายการ', price: i === meds.length - 1 ? h.bought - base * i : base }));
    return RC()[id] || (RC()[id] = { ...pastOrder(id, h.date, h.time, items), preview: true });
  }
  if (!id) return c?.order?.paid ? c.order : null;
  if (RC()[id]) return RC()[id];
  if (c?.id === id && c.order?.status === 'paid') return (RC()[id] = c.order.paid ? c.order : { ...pastOrder(id, TP.NOW.date, c.joinedAt, c.order.items), no: c.order.no || codeOf(id) });
  const h = (S.history || []).find(x => x.id === id) || TP.followSummaryRecord?.(id);
  if (!h?.bought) return null;
  if (h.order?.paid) return (RC()[id] = h.order);
  const meds = h.previewSummary?.meds || TP.SUMMARY?.[id]?.meds || TP.ORDER_ITEMS.slice(0, 2);
  return (RC()[id] = pastOrder(id, h.date, h.time, priced(meds, h.bought)));
}
/* a receipt opened from the inbox after the case moved on still needs something to show */
const order = () => { const o = C()?.order; if (o?.paid) return o; const had = TP.caseOpen(); mockPaid('pickup'); if (!had) { C().status = 'closed'; TP.emit('state'); } return C().order; };
const methName = m => m === 'card' ? 'บัตรเครดิต/เดบิต' : m === 'bank' ? 'ชำระผ่านแอปธนาคาร' : 'พร้อมเพย์';
const recvName = pd => pd.recv === 'pickup' ? 'รับที่หน้าร้านสาขา' : pd.recv === 'express' ? 'จัดส่งด่วน (Lalamove)' : pd.recv === 'cold' ? `ส่งแบบควบคุมความเย็น · ${TP.COLD.name}` : [TP.DELIVERY.find(d => d.id === 'parcel').name, TP.COURIERS.find(c => c.id === pd.courier)?.name].filter(Boolean).join(' · ');
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
  return [{ id: 'nP30', kind: 'order', title: 'วันนี้เป็นวันสุดท้ายที่มารับยาได้', body: `ที่${b.name} เปิด ${b.hours} แตะเพื่อดูรหัสรับยา`, time: `${until} 09:00`, read: false, go: 'paid' },
    { id: 'nP15', kind: 'order', title: 'ยายังรอรับที่ร้าน', body: `มารับได้ถึง ${until} ที่${b.name} แตะเพื่อดูรหัสรับยา`, time: `${addDays(pd.packDate || pd.date, 14)} 09:00`, read: false, go: 'paid' }]; };
const trackTxt = pd => pd.track ? `เลขพัสดุ ${pd.track}` : pd.trackUrl ? 'มีลิงก์ติดตามพัสดุ' : '';
const SHIP_L = pd => pd.recv === 'cold' ? 'ค่าส่งแบบเย็น (กล่องเก็บความเย็น)' : 'ค่าจัดส่ง';
TP.act('paidClose',()=>{TP.S._paidFromHome=false;return TP.canBack()?TP.back():TP.go('home',{root:true,via:'uncover'});});
const paidCard = (title,body,footer='') => `<section class="card pad0 pd-section"><h3 class="pd-section-head">${title}</h3><div class="pd-section-body">${body}</div>${footer ? `<div class="pd-section-foot">${footer}</div>` : ''}</section>`;
const paidStatusCard = (steps, orderNumber, pickup, footer = '', visual = {}) => {
  const active = Math.max(0, steps.findIndex(([state]) => state === 'cur'));
  const [, title, detail] = steps[active];
  const icons = visual.icons || ['receipt', 'pill', pickup ? 'store' : 'motorcycle', 'check'];
  const artwork = visual.artwork || (active === steps.length - 1 ? 'delivered' : active < 2 ? 'preparing' : pickup ? 'ready' : 'delivery');
  return `<section class="pd-status-card" aria-label="${esc(title)}"><div class="pd-status-content">
    <img class="pd-status-art" src="/assets/illustrations/order-status-${artwork}-v1.png" alt="">
    <h2 class="pd-status-title" role="status">${esc(title)}</h2>
    <p class="pd-status-order">เลขคำสั่งซื้อ <strong class="num">${esc(orderNumber)}</strong></p>
    ${detail ? `<p class="pd-status-description">${esc(detail)}</p>` : ''}
    <ol class="pd-status-steps" style="--status-steps:${steps.length}">${steps.map(([state, label], index) => `
      <li class="${state}" aria-label="${esc(label)}" ${index === active ? 'aria-current="step"' : ''}>
        <span class="pd-step-marker" aria-hidden="true">${ic(icons[index], 22, 1.8)}</span>
      </li>`).join('')}</ol>
    </div>${footer ? `<footer class="pd-section-foot">${footer}</footer>` : ''}</section>`;
};
TP.orderStatusCard = paidStatusCard;
const totKv = pd => ui.kv([['ยอดค่ายา', TP.money(pd.items)], [SHIP_L(pd), pd.ship ? TP.money(pd.ship) : 'ไม่มีค่าจัดส่ง'], ...(pd.fee ? [['ค่าธรรมเนียมบัตร (3.65%)', TP.money(pd.fee)]] : []), ['ยอดชำระ', TP.money(pd.total), 'tot']]);

/* Shared order information uses the same header/body cards as C309. */
TP.fulfillmentDetails = c => {
  const o = c.order, pd = o.paid, a = pd.addr;
  const address = a ? `<div class="pd-branch"><b>${esc([a.first,a.last].filter(Boolean).join(' ') || TP.S.user.full)}</b><p>${esc(TP.fmtAddr(a))}</p>${a.phone ? `<p>โทร ${esc(a.phone)}</p>` : ''}</div>` : '<p>ไม่มีข้อมูลที่อยู่จัดส่ง</p>';
  return paidCard('ที่อยู่จัดส่ง', address, pd.recv === 'express' ? ui.btn('ติดตามไรเดอร์', {kind:'secondary', sm:true, icon:'external-link', a:'openRiderTracking'}) : '') +
    paidCard('ข้อมูลคำสั่งซื้อ', ui.kv([
      ['เลขคำสั่งซื้อ', `<span class="num">${esc(o.no)}</span>`],
      ['เวลาชำระ', esc(pd.date + ' ' + pd.at)],
      ['วิธีชำระ', methName(pd.method)],
      ['การรับสินค้า', esc(recvName(pd))]
    ])) +
    paidCard('รายการยา', TP.orderMedicineList(o) + '<div class="hr"></div>' + totKv(pd)) +
    (c.pharmacistAdvice ? paidCard('คำแนะนำจากเภสัชกร', `<p>${esc(c.pharmacistAdvice)}</p>`) : '') +
    `<div class="group ic-rows mt16">${ui.row({icon:'receipt',title:'ดูใบเสร็จ',sub:'ใบเสร็จรับเงินและใบกำกับภาษี',go:'receipt'})}</div>`;
};

/* ---------- paid (C12) ---------- */
TP.screen('paymentsuccess', {
  group: 'during', title: 'ชำระเงินสำเร็จ', code: 'C311', parent: 'home',
  states: [['pickup','รับที่ร้าน'],['express','ส่งด่วน'],['parcel','จัดส่งปกติ']],
  notes: ['แสดงหลังระบบยืนยันชำระสำเร็จ พร้อมเลขคำสั่งซื้อจากรายการจริง', 'ดูสถานะยาเปิด C309 หรือ C414 ตามวิธีรับยา กลับหน้าหลักยังติดตามคำสั่งซื้อเดิมได้'],
  prep(S) { mockPaid(S.st.paymentsuccess || 'pickup'); },
  render() {
    const o = C()?.order;
    return ui.page(`<section class="payment-result">
      <img class="payment-result-art" src="/assets/illustrations/payment-success-v1.png" alt="ตะกร้ายาพร้อมพลุฉลองชำระเงินสำเร็จ">
      <h1>ชำระเงินสำเร็จ</h1><p class="payment-result-message">ร้านได้รับคำสั่งซื้อของคุณแล้ว</p>
      <p class="payment-result-order">เลขคำสั่งซื้อ <strong class="num">${esc(o?.no || '')}</strong></p>
      <div class="payment-result-actions">${ui.btn('ดูสถานะจัดส่งยา',{a:'paymentResultStatus'})}${ui.btn('กลับสู่หน้าหลัก',{kind:'ghost',go:'home'})}</div>
    </section>`);
  }
});
TP.act('paymentResultStatus', () => { const recv=C()?.order?.paid?.recv || 'pickup'; TP.S.st.paid=recv; return TP.go(recv==='parcel'?'track':'paid',{root:true}); });
TP.screen('paid', {
  group: 'during', title: 'สถานะยา', code: 'C309', ref: 'C12', parent: 'room',
  states: [['pickup', 'รับที่ร้าน'], ['parcel', 'จัดส่งปกติ'], ['express', 'ส่งด่วน'], ['night', 'จ่ายตอนร้านปิด'], ['ready', 'ยาพร้อมรับแล้ว'], ['sent', 'ส่งพัสดุแล้ว มีเลขพัสดุ', false], ['rider', 'ไรเดอร์รับยาแล้ว'], ['cold', '', false], ['overdue', 'เลยกำหนดรับยา'], ['pickup-complete', 'รับยาที่สาขาแล้ว']],
  notes: ['สถานะยาแสดงภาพตรงกลางตามขั้นตอน ใต้ภาพเป็นสถานะล่าสุดและเลขคำสั่งซื้อ ตามด้วยแถบไอคอนแนวนอน ไม่มีข้อความใต้ไอคอน ใช้ข้อมูลคำสั่งซื้อเดิม', 'ลำดับและคำตามหน้าหลังจ่ายบิลเภสัชกรของเว็บ pay/receipt.blade.php: ชำระเงินสำเร็จ · สถานะ (ชำระแล้ว > กำลังเตรียมยา > พร้อมรับที่สาขา > รับแล้ว / จัดส่งแล้ว > สำเร็จ ป้าย "ตอนนี้") · เลขออเดอร์ · เวลาชำระ · วิธีชำระ · รายการยา · ยอด',
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
    if(S.st.paid==='pickup-complete'){TP.casePreview.seed('pickup-complete');return;}
    const st = S.st.paid || 'pickup', recv = { night: 'pickup', ready: 'pickup', overdue: 'pickup', sent: 'parcel', rider: 'express' }[st] || st;
    S.storeOpen = st === 'night' ? false : TP.flag('storeOpen'); mockPaid(recv);
    if (['ready', 'overdue', 'sent', 'rider', 'cold'].includes(st)) setStage(C().order.paid);
    if (st === 'overdue') { const pd = C().order.paid; pd.date = pd.packDate = LATE_PACK; S.inbox = [...pickNotes(pd, C().branch).map(n => ({ ...n, read: true })), ...TP.fresh().inbox]; }
  },
  render() {
    const c = C(), o = order(), pd = o.paid, b = TP.branch(c.branch), night = !TP.S.storeOpen, pick = pd.recv === 'pickup', st = pd.stage, cr = courierOf(pd), late = pick && pickLate(pd);
    const now = ui.tag('ตอนนี้', 'ok', { dot: true });
    const fulfillment = TP.fulfillmentInfo(c);
    if (fulfillment?.done && TP.summaryForCase) return ui.nav({right:`<button type="button" class="ibtn" data-a="paidClose" aria-label="ปิด">${ic('x',22,2)}</button>`}) + ui.page(TP.summaryForCase(c));
    const packed = ['done', 'เตรียมยาแล้ว', `จัดยาครบ ${pd.packAt || ''}`];
    const steps = !pick && ['calling','delivering'].includes(fulfillment?.key) ? [['done', 'ชำระแล้ว', `${pd.date} ${pd.at}`], packed, ['cur', fulfillment.title, ''], ['', 'จัดส่งสำเร็จ', '']] : late ? [['done', 'ชำระแล้ว', `${pd.date} ${pd.at}`], ['done', 'เตรียมยาแล้ว', `จัดยาครบ ${pd.packDate} ${pd.packAt}`], ['cur', 'เลยกำหนดรับ', `ร้านเก็บยาไว้ให้ถึง ${holdUntil(pd)} · ร้านจะโทรหาคุณ`], ['', 'รับแล้ว', '']]
      : st && pick ? [['done', 'ชำระแล้ว', `${pd.date} ${pd.at}`], packed, ['cur', 'พร้อมรับที่สาขา', `ร้านแจ้งเมื่อ ${pd.packAt} · แสดงรหัสรับยาที่เคาน์เตอร์`], ['', 'รับแล้ว', '']]
      : st ? [['done', 'ชำระแล้ว', `${pd.date} ${pd.at}`], packed, ['cur', 'จัดส่งแล้ว', pd.recv === 'express' ? `ไรเดอร์ Lalamove รับยาแล้ว ${pd.packAt} · ถึงประมาณ ${addMin(pd.packAt, 45)} ติดตามตำแหน่งได้จากปุ่มด้านล่าง` : `${cr.name}${trackTxt(pd) ? ' · ' + trackTxt(pd) : ''} · ถึงใน ${cr.time}`], ['', 'สำเร็จ', 'เมื่อคุณได้รับยา']]
      : pick
      ? [['done', 'ชำระแล้ว', `${pd.date} ${pd.at}`], ['cur', 'กำลังเตรียมยา', night ? 'เริ่มเตรียมยาเมื่อร้านเปิด 09:00' : 'โดยปกติพร้อมรับใน 15-30 นาที เมื่อพร้อมร้านจะแจ้งในแอป'], ['', 'พร้อมรับที่สาขา', ''], ['', 'รับแล้ว', '']]
      : [['done', 'ชำระแล้ว', `${pd.date} ${pd.at}`], ['cur', 'กำลังเตรียมยา', night ? 'เริ่มเตรียมวันทำการถัดไป 19/10/2026' : 'วันนี้'], ['', 'จัดส่งแล้ว', pd.recv === 'express' ? 'ไรเดอร์ Lalamove ถึงใน 1-4 ชม. หลังร้านเตรียมยาเสร็จ' : pd.recv === 'cold' ? `ร้านโทรจองรถ ${TP.COLD.short} ให้ เลขพัสดุขึ้นในแอปเมื่อร้านส่งของ` : 'เลขพัสดุจะขึ้นในแอปเมื่อส่งของแล้ว'], ['', 'สำเร็จ', '']];
    return ui.nav({right:`<button type="button" class="ibtn" data-a="paidClose" aria-label="ปิด">${ic('x',22,2)}</button>`}) + ui.page(`
      ${paidStatusCard(steps,o.no,pick,!pick && pd.recv!=='express'?`${ui.btn('ติดตามการจัดส่ง',{kind:'secondary',sm:true,icon:'map-pin',go:'track'})}${pd.track?ui.btn('คัดลอกเลขพัสดุ',{kind:'ghost',sm:true,icon:'copy',a:'copyTrack'}):pd.trackUrl?ui.btn('เปิดหน้าติดตามพัสดุ',{kind:'ghost',sm:true,icon:'external-link',a:'openTrackLink'}):''}`:'',{icons:!pick&&pd.recv!=='express'?['receipt','pill','truck','check']:undefined,artwork:fulfillment?.key==='calling'?'calling':pd.recv==='parcel'&&pd.stage?(pd.deliv?'delivered':'parcel'):undefined})}
      ${late ? paidCard('การรับยา',`<p class="pd-late" id="pdLate">${ic('clock',18,2)}<span><b>ร้านเก็บยาไว้ให้ถึงวันที่ <span class="num">${holdUntil(pd)}</span></b>ร้านจะโทรหาคุณเพื่อตกลงเรื่องยาและการคืนเงิน</span></p>`,ui.btn('โทรหาร้าน',{icon:'phone',a:'callStore'})) : pick ? paidCard('รหัสรับยา',`<div class="pd-code"><div><b class="num">${esc(o.no.slice(-4))}</b><span>แสดงรหัสนี้ที่เคาน์เตอร์${esc(b.name)} พร้อมบอกชื่อผู้สั่งซื้อ (${esc(TP.S.user.full)})</span></div></div>${st ? `<p class="pd-hold" id="pdHold">${ic('clock',16,2)}<span>ร้านเก็บยาไว้ให้ ${HOLD_DAYS} วัน มารับได้ถึงวันที่ <b class="num">${holdUntil(pd)}</b> · ถ้าเลยกำหนด ร้านจะโทรหา</span></p>` : ''}`) : ''}

      ${pd.recv==='express'?paidCard('ที่อยู่จัดส่ง',pd.addr ? `<div class="pd-branch"><b>${esc([pd.addr.first,pd.addr.last].filter(Boolean).join(' ') || TP.S.user.full)}</b>${pd.addr.phone?`<p>${esc(pd.addr.phone)}</p>`:''}<p>${esc([pd.addr.house,pd.addr.building,pd.addr.alley,pd.addr.road,pd.addr.dist,pd.addr.amp,pd.addr.prov,pd.addr.zip].filter(Boolean).join(' '))}</p></div>` : '<p>ไม่มีข้อมูลที่อยู่จัดส่ง</p>',ui.btn('ติดตามไรเดอร์',{kind:'secondary',sm:true,icon:'external-link',a:'openRiderTracking'})):''}
      ${pick?paidCard('รับที่สาขา',`<div class="pd-branch"><b>${esc(b.name)}</b><p>${esc(b.addr)} · เปิด ${esc(b.hours)}</p></div>`,`${ui.btn('โทรหาร้าน',{kind:'secondary',icon:'phone',a:'callStore'})}${late?'':ui.btn('นำทางไปร้าน',{icon:'navigation',a:'navStore'})}`):''}
      ${paidCard('ข้อมูลคำสั่งซื้อ',ui.kv([['เลขคำสั่งซื้อ',`<span class="num">${esc(o.no)}</span>`],['เวลาชำระ',`${pd.date} ${pd.at}`],['วิธีชำระ',methName(pd.method)],['การรับสินค้า',esc(recvName(pd))],...(pd.addr && pd.recv!=='express'?[['ส่งไปที่',esc([pd.addr.house,pd.addr.building,pd.addr.alley,pd.addr.road,pd.addr.dist,pd.addr.amp,pd.addr.prov,pd.addr.zip].filter(Boolean).join(' '))]]:[])]))}
      ${paidCard('รายการยา',`${TP.orderMedicineList(o)}<div class="hr"></div>${totKv(pd)}`)}
      <div class="mt16">${ui.group([ui.row({icon:'receipt',title:'ดูใบเสร็จ',sub:'ใบกำกับภาษีอย่างย่อ · ดาวน์โหลดตัวเต็มได้เอง',go:'receipt',p:{id:c.id}})],{din:5})}</div>
      <details class="pd-consultation mt16"><summary style="cursor:pointer;font-weight:600;padding:8px 0">สรุปการปรึกษา</summary><div class="mt16">${TP.summaryForCase?.(c,{hideHero:true,hideReceipt:true}) || ''}</div></details>
      `);
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
TP.previewParcelStatus = (pd, state) => {
  setStage(pd);
  pd.out = state === 'out' || state === 'delivered';
  if(state==='delivered') pd.deliv=TRK_AT.deliv;
};
const trkState = pd => (pd.got ? 'received' : pd.deliv ? 'delivered' : !pd.stage ? 'prep' : pd.recv === 'express' ? 'rider' : pd.recv === 'cold' ? 'cold' : pd.out ? 'out' : 'transit');
function trkSteps(pd, st) {
  const cr = courierOf(pd), paid = ['ชำระแล้ว', `${pd.date} ${pd.at}`], end = ['ส่งถึงแล้ว', pd.deliv || (pd.recv === 'express' ? `ถึงประมาณ ${addMin(pd.packAt || pd.at, 45)}` : pd.recv === 'parcel' ? 'ภายใน 1-3 วันทำการ' : `ถึงใน ${cr.time}`)];
  if (st === 'prep') return { steps: [paid, ['ร้านกำลังจัดยา', pd.recv === 'cold' ? `แล้วโทรจองรถ ${TP.COLD.short} ให้` : pd.recv === 'express' ? 'แล้วเรียกไรเดอร์ให้' : 'แล้วแพ็กส่งให้วันนี้'], [pd.recv === 'express' ? 'ไรเดอร์รับยา' : pd.courier ? `ส่งให้ ${cr.name}` : 'ส่งให้ขนส่ง', ''], end], cur: 1 };
  const packed = [pd.recv === 'cold' ? 'ร้านจัดยาใส่กล่องเย็นแล้ว' : 'ร้านจัดยาและแพ็กแล้ว', `${pd.packDate} ${pd.packAt}`];
  if (pd.recv === 'express') return { steps: [paid, packed, ['ไรเดอร์ Lalamove รับยาแล้ว', `${pd.packDate} ${pd.packAt}`], end], cur: pd.deliv ? 3 + !!pd.got : 2 };
  if (pd.recv === 'cold') return { steps: [paid, packed, [`ส่งให้ ${cr.short} แล้ว`, pd.track ? `เลขพัสดุ ${pd.track} · สถานะระหว่างทาง โทรถามร้านได้` : 'ร้านแปะลิงก์ติดตามพัสดุแล้ว · ดูสถานะได้ที่หน้าติดตามพัสดุ'], end], cur: pd.deliv ? 3 + !!pd.got : 2 };
  const steps = [paid, packed, [`ส่งให้ ${cr.name} แล้ว`, TRK_AT.hand], ['กำลังขนส่ง', `ถึงศูนย์คัดแยก ${TRK_AT.hub}`], ['กำลังนำส่ง', pd.out || pd.deliv ? TRK_AT.out : ''], end];
  return { steps, cur: pd.deliv ? 5 + !!pd.got : pd.out ? 4 : 3 };
}
TP.screen('track', {
  group: 'after', title: 'สถานะการจัดส่งยา', code: 'C414', parent: 'paid',
  states: [['transit', 'ส่งด่วน · กำลังจัดส่ง'], ['delivered', 'ขนส่งแจ้งว่าส่งถึงแล้ว'], ['received', 'ลูกค้ายืนยันว่าได้รับยาแล้ว'], ['cold', '', false], ['rider', 'ส่งด่วน · ไรเดอร์กำลังจัดส่ง'], ['prep', 'จัดส่งปกติ · ร้านกำลังเตรียมยา', false], ['coldlink', '', false],['chat-preparing','สนทนา: กำลังเตรียมยา'],['chat-calling','สนทนา: กำลังเรียกไรเดอร์'],['chat-delivering','สนทนา: ไรเดอร์กำลังส่งยา'],['chat-delivered','สนทนา: จัดส่งเสร็จสิ้น'], ['out', 'จัดส่งปกติ · กำลังนำส่ง', false],['parcel-preparing','จัดส่งปกติ · กำลังเตรียมยา'],['parcel-transit','จัดส่งปกติ · กำลังขนส่ง'],['parcel-out','จัดส่งปกติ · กำลังนำส่ง'],['parcel-delivered','จัดส่งปกติ · ส่งถึงแล้ว รอยืนยันรับยา'],['pickup-preparing','กำลังเตรียมยา'],['pickup-ready','พร้อมรับยาที่สาขา'],['pickup-complete','รับยาที่สาขาแล้ว'],['pickup-overdue','เลยกำหนดรับยา'],['pickup-night','รอร้านเปิดเพื่อเตรียมยา'],['parcel-received','ยืนยันได้รับยาแล้ว']],
  stateGroups: [
    {label:'รับยาที่ร้าน',keys:['pickup-preparing','pickup-night','pickup-ready','pickup-complete','pickup-overdue']},
    {label:'ส่งด่วน',keys:['chat-preparing','chat-calling','chat-delivering','chat-delivered','transit','rider','delivered','received']},
    {label:'จัดส่งปกติ',keys:['parcel-preparing','parcel-transit','parcel-out','parcel-delivered','parcel-received']}
  ],
  notes: ['A6 ตามประกาศ อย. ข้อ 2.2(4) สืบย้อนได้ตลอดการขนส่ง: เลขพัสดุ บริษัทขนส่ง สถานะจนถึง ส่งถึงแล้ว · ลูกค้ากด ได้รับยาแล้ว (ร้านเห็นในคอนโซล) · เปิดจากปุ่ม ติดตามการจัดส่ง ใน C309 แถวบนหน้าแรก ประวัติ C403 และแจ้งเตือนส่งยาแล้ว',
    'รองรับรับที่ร้าน ส่งด่วน และจัดส่งปกติ ใช้ภาพสถานะล่าสุดกับแถบไอคอนแนวนอนร่วมกัน ส่งด่วนใช้ภาพไรเดอร์ จัดส่งปกติใช้ภาพพัสดุและรถขนส่ง',
    '21/10 เจ้าของ "เอาเลขติดตามพัสดุหรือลิ้งติดตามพัสดุมาแปะ": เลข = แสดงเลขพร้อมปุ่มคัดลอก (C414.4) · ลิงก์ = ปุ่ม เปิดหน้าติดตามพัสดุ ไม่โชว์ลิงก์ยาว (C414.7 คอนโซลลิงก์มาที่นี่) · C309.8 ใช้ตัวอย่างแบบเลข',
    'ปุ่มได้รับยาแล้วแสดงเมื่อขนส่งแจ้งว่าส่งถึงแล้ว · กดแล้วแถวยาบนหน้าแรกหายไป'],
  wait: ['ลูกค้าไม่กด ได้รับยาแล้ว ระบบถือว่าได้รับเมื่อขนส่งแจ้งส่งถึงหลังกี่วัน (ต้นแบบยังไม่ปิดเอง)'],
  prep(S) {
    if(S.st.track?.startsWith('pickup-')){S.st.paid={'pickup-preparing':'pickup','pickup-ready':'ready','pickup-complete':'pickup-complete','pickup-overdue':'overdue','pickup-night':'night'}[S.st.track];TP.SCREENS.paid.prep(S);return;}
    if(S.st.track?.startsWith('parcel-')){TP.ensureCase('closed');TP.fulfillmentPreview(C(),S.st.track==='parcel-received'?'parcel-delivered':S.st.track);if(S.st.track==='parcel-received'){C().order.paid.got=TRK_AT.got;C().order.picked=true;}return;}
    if(S.st.track?.startsWith('chat-')){TP.ensureCase('closed');TP.fulfillmentPreview(C(),'delivery-'+S.st.track.slice(5));return;}
    const st = S.st.track || 'transit', recv = 'express';
    mockPaid(recv); const o = C().order, pd = o.paid;
    if (st !== 'prep') setStage(pd);
    pd.out = st === 'out';
    pd.deliv = ['delivered', 'received'].includes(st) ? TRK_AT.deliv : ''; pd.got = st === 'received' ? TRK_AT.got : ''; o.picked = st === 'received';
  },
  render() {
    if(C()?.order?.paid?.recv==='pickup')return TP.SCREENS.paid.render();
    if(C()?.order?.paid?.recv==='express'&&TP.fulfillmentInfo(C()))return TP.chatDeliveryPage(C());
    const o = order(), pd = o.paid, cr = courierOf(pd), ex = pd.recv === 'express', cold = pd.recv === 'cold', st = trkState(pd), { steps, cur } = trkSteps(pd, st), a = pd.addr;
    const head = ui.card(`<div class="tk-h"><span class="tk-i">${ic(ex ? 'zap' : cold ? 'snowflake' : 'package', 22, 2)}</span><div class="grow"><b>${esc(ex ? 'ส่งด่วน Lalamove' : pd.courier ? cr.name : TP.DELIVERY.find(d => d.id === 'parcel').name)}</b><small>${pd.track ? `<span class="num">${esc(pd.track)}</span>` : pd.trackUrl ? 'ร้านแปะลิงก์ติดตามพัสดุแล้ว' : ex ? 'ไรเดอร์ส่งถึงบ้าน' : 'เลขพัสดุขึ้นเมื่อร้านส่งของ'}</small></div>${pd.track ? `<button type="button" class="ibtn" data-a="copyTrack" aria-label="คัดลอกรหัสพัสดุ" title="คัดลอกรหัสพัสดุ">${ic('copy', 20, 2)}</button>` : ''}</div>
      ${cold ? `<p class="tk-n">${ic('snowflake', 14, 2)}<span>ยาอยู่ในกล่องคุมความเย็น 2-8 องศา · สถานะระหว่างทาง โทรถามร้านได้</span></p>${pd.track ? `<button type="button" class="link tk-web" data-a="trackShip">ติดตามบนเว็บ ${esc(TP.COLD.short)} ${ic('external-link', 14, 2)}</button>` : pd.trackUrl ? ui.btn('เปิดหน้าติดตามพัสดุ', { kind: 'secondary', sm: true, icon: 'external-link', a: 'openTrackLink', cls: 'mt12' }) : ''}` : ''}`, { din: 1, cls: 'mt8' });
    const current = Math.min(cur, steps.length - 1);
    const tl = paidStatusCard(steps.map(([title,detail],i)=>[i<current?'done':i===current?'cur':'',title,detail]),o.no,false,'',{
      artwork:pd.deliv||pd.got?'delivered':st==='prep'?'preparing':ex?'delivery':'parcel',
      icons:steps.length===6?['receipt','pill','package','truck','truck','check']:['receipt','pill',ex?'motorcycle':'truck','check']
    });
    const coldTip = cold && st !== 'prep' ? ui.card(`<div class="tk-cold">${ic('snowflake', 20, 2)}<div><b>ถึงแล้วเก็บเข้าตู้เย็นทันที</b><p>ถ้ากล่องไม่เย็นแล้ว อย่าใช้ยา โทรหาร้าน ${esc(caseBranch().phone)}</p></div></div>${ui.btn('โทรหาร้าน', { kind: 'secondary', sm: true, icon: 'phone', a: 'callStore', cls: 'mt8' })}`, { din: 2, cls: 'mt16' }) : '';
    const got = pd.got ? `<div class="tk-got mt16" data-in="2" role="status">${ic('circle-check', 22, 2)}<span><b>คุณยืนยันว่าได้รับยาแล้ว</b>${esc(pd.got)} · ร้านเห็นแล้ว</span></div>` : '';
    const to = a ? ui.card(ui.kv([['ส่งไปที่', esc(TP.fmtAddr ? TP.fmtAddr(a) : a.dist)], ['ผู้รับ', esc(`${a.first} ${a.last}`.trim())], ['เลขคำสั่งซื้อ', `<span class="num">${esc(o.no)}</span>`]]), { din: 3, cls: 'mt16' }) : '';
    const ask = pd.deliv && !pd.got ? `<p class="tk-ask" data-in="3">${ic('package', 15, 2)}<span>${esc(cr.name || 'ขนส่ง')} แจ้งว่าส่งถึงแล้ว ได้รับยาครบแล้ว กด ได้รับยาแล้ว · ยังไม่ได้รับ โทรถามร้านได้</span></p>` : '';
    const side = ex ? ui.btn('ดูตำแหน่งไรเดอร์ (Lalamove)', { kind: 'ghost', a: 'trackShip', icon: 'external-link' }) : cold ? ui.btn('ถามสถานะกับร้าน', { kind: 'ghost', a: 'callStore', icon: 'phone' }) : ui.btn(`เปิดหน้าติดตามของ ${cr.name}`, { kind: 'ghost', a: 'trackShip', icon: 'external-link' });
    const dock = pd.got ? ui.btn('กลับหน้าแรก', { a: 'goHome' }) : pd.deliv ? ui.btn('ได้รับยาแล้ว', { a: 'tkGot', icon: 'circle-check' }) + side : st === 'prep' ? ui.btn('กลับ', { kind: 'secondary', a: 'tkBack' }) : side;
    return ui.nav({ title: 'ติดตามพัสดุ', right: `<button type="button" class="ibtn" data-a="paidClose" aria-label="ปิด">${ic('x',22,2)}</button>` }) + ui.page(`${tl}${head}${got}${coldTip}${ask}${to}<div class="mt16">${ui.callHelp({ din: 4, branch: C().branch })}</div>`) + ui.dock(dock);
  }
});
for(const [key,label,from,to]of [['chatCalling','ร้านเตรียมยาเสร็จ · เรียกไรเดอร์','preparing','calling'],['chatDelivering','ไรเดอร์รับยาแล้ว','calling','delivering'],['chatDelivered','ไรเดอร์ส่งยาสำเร็จ','delivering','delivered']])TP.simAction({id:key,label,when:S=>S.case?.order?.paid?.recv==='express'&&S.case?.order?.fulfillment?.status===from,run(){if(TP.setFulfillment(TP.S.case,to))TP.refresh({anim:false});}});
TP.act('tkBack', () => (TP.canBack() ? TP.back() : TP.go('paid')));
TP.act('tkGot', () => { const pd = C()?.order?.paid; if (pd?.deliv && !pd.got) return TP.sheet('gotask'); });
TP.sheetDef('gotask', {
  group: 'after', title: 'ยืนยันได้รับยา', code: 'C415', host: 'track',
  notes: ['ผู้ใช้จริง 21/10: กดได้รับยาแล้วพลาดได้ จึงถามก่อน · เวลาได้รับต้องหลังส่งของ (เดิมใช้เวลาตอนนี้ของต้นแบบ ซึ่งก่อนเวลาชำระ)'],
  render: () => `<p class="body">ได้รับยาครบแล้วใช่ไหม</p><p class="body mt8">กดยืนยันแล้ว ร้านจะเห็นว่าคุณได้รับยาแล้ว · ถ้าของไม่ครบหรือกล่องเสียหาย โทรหาร้านก่อน</p>`,
  foot: () => ui.btn('ได้รับครบแล้ว', { a: 'tkGotOk', icon: 'circle-check' }) + ui.btn('ยังไม่ได้รับ', { kind: 'ghost', closeSheet: true })
});
TP.act('tkGotOk', () => {
  const o = C()?.order, pd = o?.paid; if (!pd?.deliv || pd.got) return; pd.got = TRK_AT.got; o.picked = true; TP.emit('state'); TP.closeSheet().then(() => { TP.refresh({ anim: false }); TP.notify('บันทึกว่าได้รับยาแล้ว', { icon: 'circle-check' }); });
});

/* ---------- receipt (ใหม่) ---------- */
/* every receipt is an abbreviated tax invoice; the full one downloads in one tap (owner 19/10: "ผมไม่ต้องการให้กดขอ")
   in the account name and main address · a person needs no tax id, a company does (Revenue Code 86/4) */
const meTax = () => { const u = TP.S.user, a = TP.S.rcNoAddr ? null : (TP.S.addrs || TP.fresh().addrs).find(x => x.main); return a ? { name: u.full, kind: 'บุคคลธรรมดา', addr: TP.fmtAddr(a), phone: (a.phone || u.phone).replace(/\D/g, '') } : null; };
const taxWho = () => TP.taxSelected('me');
/* the name on the full invoice belongs to the account; form / done belong to each order */
const T = o => o.tax || (o.tax = { done: null, form: false, who: 'me' });
/* deadline = end of the purchase month (AccountController:524-577) */
const ymd = d => { const [dd, mm, yy] = String(d).split('/').map(Number); return yy * 10000 + mm * 100 + dd; };
const monthEnd = d => { const [, mm, yy] = String(d).split('/').map(Number), last = new Date(yy, mm, 0).getDate(); return `${last}/${String(mm).padStart(2, '0')}/${yy}`; };
const isLate = d => {
  const parse = value => { const [day, month, year] = String(value).split('/').map(Number); return Date.UTC(year, month - 1, day); };
  const paid = parse(d), now = parse(TP.NOW.date);
  return Number.isFinite(paid) && Number.isFinite(now) && now - paid > 7 * 86400000;
};
const rcCur = () => TP.cur()?.ctx?.rc;
const maskTax = v => 'xxxxxxxxx' + String(v).slice(-4);
const taxNo = o => 'TX' + o.no;
/* Thai tax id: 13 digits, last one is a check digit (same rule as the national id) */
const taxIdOk = v => { if (!/^\d{13}$/.test(v)) return false; const s = [...v].slice(0, 12).reduce((a, d, i) => a + +d * (13 - i), 0); return (11 - s % 11) % 10 === +v[12]; };
const r2v = x => Math.round(x * 100) / 100;
TP.screen('receipt', {
  group: 'after', title: 'ใบเสร็จรับเงิน', code: 'C402', parent: 'paid',
  states: [['normal', 'รับที่ร้าน พร้อมเพย์'], ['parcel', 'ส่งพัสดุ จ่ายบัตร', false], ['notax', 'ยังไม่มีข้อมูลใบกำกับภาษี'], ['taxpending', 'ส่งคำขอแล้ว · รอดำเนินการ'], ['taxdone', 'ออกใบกำกับภาษีแล้ว'], ['late', 'เลยกำหนดขอใบกำกับภาษี'], ['missing', 'ไม่พบใบเสร็จ'], ['tax-selected','เลือกผู้รับแล้ว ยังไม่ส่งคำขอ']],
  notes: ['ใบเสร็จของคำสั่งซื้อที่ชำระแล้ว แสดงรายการยา รูปยา ค่าส่ง ค่าธรรมเนียม และยอดรวมตรงกับคำสั่งซื้อ',
    'ถ้าขอใบกำกับใน C308 แล้ว C402 แสดงการ์ดสถานะรอดำเนินการทันที ใช้ข้อมูลผู้รับจากคำสั่งซื้อเดียวกัน ไม่แสดงฟอร์มขอซ้ำ',
    'ออกใบแล้วแสดงสถานะออกใบกำกับแล้วและปุ่มดาวน์โหลด PDF ในท้ายการ์ด ใช้ไฟล์จากระบบเอกสาร ไม่มีหน้าใบกำกับแยก; ต้นแบบยังไม่ออกเอกสารจริง',
    'ยังไม่ขอ: กดต้องการใบกำกับ เปิด C421 เลือกการ์ดผู้รับจาก C518 แล้วกลับมาดูข้อมูลก่อนส่งคำขอ;  เลือกบุคคลธรรมดาหรือนิติบุคคล ตรวจการ์ดผู้รับ แก้ไขในแผ่นข้อมูล แล้วส่งคำขอ; ยังไม่มีข้อมูลให้เพิ่มผ่านฟอร์มร่วมกับบัญชี',
    'ขอใหม่ได้ภายใน 7 วันหลังชำระเงินตามนโยบายผลิตภัณฑ์ เกินกำหนดซ่อนส่วนขอใหม่ แต่คำขอเดิมยังแสดงสถานะและปุ่ม PDF เมื่อออกแล้ว',
    'ข้อมูลผู้รับเลขผู้เสียภาษีแสดงปิดบางส่วน; รายการเก่าเปิดจากประวัติหรือใบสรุปต้องใช้คำสั่งซื้อเดิม ไม่สร้างการปรึกษาใหม่'],
  wait: ['ฝ่ายบัญชียืนยันข้อกำหนดเอกสารและนโยบายขอย้อนหลัง 7 วันก่อนนำระบบจริงไปใช้'],
  prep(S) {
    const st = S.st.receipt || 'normal'; if (st === 'missing') return;
    if (st !== 'notax' && !S._taxProfileMockInitialized) { if (!S.taxWho) S.taxWho={id:'1234567890121',name:'สมใจ ใจดี',first:'สมใจ',last:'ใจดี',phone:'0812345678',detail:'88/12 ซอยตัวอย่าง',prov:'กรุงเทพมหานคร',amp:'คลองเตย',dist:'คลองเตย',zip:'10110',country:'ไทย',addr:'88/12 ซอยตัวอย่าง แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110'}; S._taxProfileMockInitialized=true; }
    mockPaid(st === 'parcel' ? 'parcel' : 'pickup', st === 'parcel' ? 'card' : 'promptpay', st === 'late' ? '18/09/2026' : TP.NOW.date);
    S.rcNoAddr = st === 'notax';
    C().order.tax = { done: st === 'taxdone' ? meTax() : null, pending: st === 'taxpending' ? (taxWho() || meTax()) : null, form: false, who: 'me', want:st==='tax-selected' };
  },
  render(ctx) {
    const id = ctx.params?.id;
    let o = ctx.state === 'missing' ? null : id ? rcOf(id, !!ctx.params?.followPreview) : rcOf() || order();
    if (!id && o && ctx.state === 'normal') {
      const items = [...TP.ORDER_ITEMS.map(i => ({...i})), {name:'ยาแก้ไอ ชนิดน้ำ', qty:'1 ขวด', price:90}];
      const total = items.reduce((sum, i) => sum + i.price, 0);
      o = {...o, items, total, paid:{...o.paid, items:total, total:total + (o.paid.ship || 0) + (o.paid.fee || 0)}, preview:true};
    }
    if (o && ctx.state === 'taxdone') o = { ...o, tax: { ...(o.tax || {}), done: taxWho() || meTax(), pending: null } };
    if (o && ctx.state === 'taxpending') o = { ...o, tax: { ...(o.tax || {}), done: null, pending: taxWho() || meTax() } };
    ctx.rc = o;
    if (!o) return ui.nav({ back: true, title: 'ใบเสร็จรับเงิน' }) + ui.page(ui.empty({ icon: 'receipt', title: 'ไม่พบใบเสร็จนี้', body: 'การปรึกษานี้ไม่ได้ซื้อยา หรือยังไม่ได้ชำระเงิน', btn: { label: 'ดูประวัติ', a: 'rcHistory' } }));
    const pd = o.paid, u = TP.S.user, t = T(o), late = isLate(pd.date);
    const buyerAddr = pd.addr || (TP.S.rcNoAddr ? null : (TP.S.addrs || []).find(a => a.main));
    const done = t.done;
    const nItems = o.items.reduce((s, i) => s + qty(i.qty), 0);
    const receiptHeader = (title, subtitle) => `<header class="rc-hd">
      <span class="rc-logo">${brand.logo('wmen',{style:'width:128px;height:20.1px'})}</span>
      <h2>${title}</h2><p>${subtitle}</p>
    </header>`;
    const shortRows = [
      ...o.items.map(i=>[`<div class="rc-med">${TP.medicineImage(i) || `<span class="rc-med-placeholder">${ic('pill',20,1.8)}</span>`}<span><b>${esc(i.name)}</b><small>จำนวน: ${esc(i.qty)}</small></span></div>`,TP.money(i.price)]),
      ...(pd.discount? [['ส่วนลด','−'+TP.money(pd.discount)]] : []),
      ...(pd.ship? [[esc(SHIP_L(pd)),TP.money(pd.ship)]] : []),
      ...(pd.fee? [['ค่าธรรมเนียมบัตร (3.65%)',TP.money(pd.fee)]] : [])
    ];
    const shortDoc = `<article class="rc-doc rc-short" data-in="1" aria-label="ใบเสร็จรับเงิน เลขที่ ${esc(o.no)}">
      ${receiptHeader('ใบเสร็จรับเงิน', o.preview ? 'ใบกำกับภาษีอย่างย่อ · ข้อมูลตัวอย่าง' : 'ใบกำกับภาษีอย่างย่อ')}
      <div class="rc-seller"><b>บริษัท มิตรอารีแคร์ จำกัด (สำนักงานใหญ่)</b><span>เลขประจำตัวผู้เสียภาษี <span class="num">0105569024564</span></span></div>
      <dl class="rc-meta"><div><dt>เลขที่ใบเสร็จ</dt><dd class="num">${esc(o.no)}</dd></div><div><dt>วันและเวลา</dt><dd class="num">${esc(pd.date)} · ${esc(pd.at)}</dd></div></dl>
      <table class="rc-items rc-short-items"><thead><tr><th scope="col">รายการ</th><th scope="col">จำนวนเงิน</th></tr></thead>
        <tbody>${shortRows.map(([label,amount])=>`<tr><td>${label}</td><td class="num">${amount}</td></tr>`).join('')}</tbody></table>
      <p class="rc-tt"><span>รวมทั้งสิ้น<small>รวมภาษีมูลค่าเพิ่ม 7% แล้ว</small></span><b class="num">${TP.money(pd.total)}</b></p>
      <p class="rc-ft">ยาไม่รับคืน ยกเว้นร้านจัดยาผิด แจ้งภายใน 3 วัน</p></article>`;
    const doc = shortDoc;
    return ui.nav({ back: true, title: 'ใบเสร็จรับเงิน' }) + ui.page(doc + `<div id="rcTax" class="mt24" data-in="2">${taxBox(o, late)}</div>`, {});
  },
  mount(el) {
    el.addEventListener('input', e => { const fd = e.target.closest('#rcTax .field.err'); if (fd && e.target.value.trim()) { fd.classList.remove('err'); $('.pay-err', fd)?.remove(); } });
  }
});
/* full invoice in your own name (one tap) or a company (filled once, real-user R 19/10: pick before the tap)
   a wrong name after download = issue a new one, the old one is cancelled (as a shop does on paper) */
const coTax = () => TP.taxSelected('co');
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
    ${ui.btn('ส่งคำขอใบกำกับภาษี', { a: 'rcTaxSave' })}${ui.btn('ยกเลิก', { kind: 'ghost', a: 'rcTaxCancel' })}`;
}
function taxBox(o, late) {
  const t = T(o);
  if (t.done || t.pending) {
    const issued = !!t.done, recipient = issued ? t.done : t.pending;
    return `<section class="rc-tax rc-tax-status-card" aria-label="สถานะใบกำกับภาษี">
      <header class="rc-tax-status-head"><span class="rc-tax-pending-icon">${ic('file-text',22,1.8)}</span><div><h3 class="h3">ใบกำกับภาษีเต็มรูป</h3><span class="rc-tax-pending-status">${ic('circle-check',15,1.8)} ${issued?'ออกใบกำกับแล้ว':'ส่งคำขอแล้ว'}</span></div></header>
      <div class="rc-tax-status-body"><div class="rc-tax-status-line"><span>ผู้ขอ</span><b>${esc(recipient.name)}</b></div><div class="rc-tax-status-line"><span>สถานะ</span><span class="rc-tax-status-tag${issued?' issued':''}">${issued?'ออกใบกำกับแล้ว':'รอดำเนินการ'}</span></div></div>
      ${issued?`<footer class="rc-tax-status-footer">${ui.btn('ดาวน์โหลดใบกำกับภาษี (PDF)', { kind: 'primary', icon: 'download', a: 'rcTaxPdf' })}</footer>`:''}</section>`;
  }
  if (late) return '';
  const w=t.want?whoOf(t):null;
  const choice=`<header class="rc-tax-request-head rc-tax-choice-head"><button type="button" class="rc-tax-check" role="checkbox" aria-checked="${!!t.want}" data-a="rcTaxWant" data-v="${t.want?'no':'yes'}" aria-label="ต้องการใบกำกับภาษี" aria-describedby="rcTaxDeadline"><span class="rc-tax-choice-icon" aria-hidden="true">${ic('file-text',22)}</span><span class="rc-tax-choice-copy"><b>ต้องการใบกำกับภาษี</b><span id="rcTaxDeadline">ขอย้อนหลังได้ภายใน 7 วันหลังชำระเงิน</span></span><span class="rc-tax-choice-check" aria-hidden="true">${t.want?ic('check',16):''}</span></button></header>`;
  const body=w?`<div class="rc-tax-selected"><b>ชื่อและที่อยู่ใบกำกับภาษี</b><p>${esc(w.name)}</p><p>${esc(TP.taxAddress(w))}</p>${w.business?`<p>ชื่อธุรกิจ : ${esc(w.business)}</p>`:''}<p>โทรศัพท์ : ${esc(w.phone||'—')}</p><p>${w.business?'เลขประจำตัวผู้เสียภาษี':'เลขประจำตัวประชาชน'} : ${esc(maskTax(w.id||''))}</p></div>`:'';
  return `<section class="rc-tax rc-tax-request-card">${choice}${w?`<div class="rc-tax-recipient-heading"><b>ข้อมูลผู้รับ</b><button type="button" class="txtbtn" data-a="rcTaxPickOpen">${ic('pencil',16)} เปลี่ยนผู้รับ</button></div>`:''}${body}${w?`<footer class="rc-tax-status-footer">${ui.btn('ส่งคำขอใบกำกับภาษี',{a:'rcTaxSend',id:'rcTaxSend'})}</footer>`:''}</section>`;
}
const redrawTax = () => { const box = $('#rcTax'), o = rcCur(); if (!box || !o) return; box.innerHTML = taxBox(o, isLate(o.paid.date)); TP.icons(box); A(box, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { d: 320, e: E.out }); };
async function issue(b, o, who) {
  b.disabled = true; b.classList.add('busy');
  await TP.wait(300);
  const t = T(o); t.form = false; t.requesting = false; t.pending = {...who};
  redrawTax(); TP.notify('ส่งคำขอแล้ว รอร้านตรวจสอบข้อมูล', { icon: 'circle-check' });
}
TP.act('rcTaxRequest', () => { const o = rcCur(); if (!o) return; T(o).requesting = true; redrawTax(); });
TP.act('rcTaxCancel', () => { const o = rcCur(); if (!o) return; const t = T(o); t.requesting = false; t.form = false; t.f = null; redrawTax(); });
TP.act('rcTaxWant', b => {
  const o=rcCur(); if(!o)return;
  if(b.dataset.v==='no'){T(o).want=false;redrawTax();return;}
  return TP.ACTS.rcTaxPickOpen();
});
TP.act('rcTaxSelectProfile',b=>{TP.taxChoose(b.dataset.v,b.dataset.key);redrawTax()});
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
TP.act('rcTaxPdf', () => {
  const o = rcCur(), tax = o && T(o), file = tax?.done?.pdfUrl;
  if (!file) { TP.notify('ยังไม่มีไฟล์ใบกำกับภาษีในต้นแบบ', { icon: 'file-text' }); return; }
  const url = new URL(file, location.href);
  if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) { TP.notify('ไม่สามารถดาวน์โหลดไฟล์นี้ได้'); return; }
  const link = document.createElement('a'); link.href = url.href; link.download = `tax-invoice-${o.no}.pdf`; document.body.appendChild(link); link.click(); link.remove();
});
TP.act('rcPdf', () => TP.notify('บันทึกใบเสร็จ/ใบกำกับภาษีอย่างย่อ PDF ลงเครื่องแล้ว', { icon: 'download' }));
TP.act('rcPrint', () => TP.notify('เปิดหน้าพิมพ์ใบเสร็จ', { icon: 'file-text' }));
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
  return ui.group([ui.row({ icon: pick ? 'store' : pd.recv === 'cold' ? 'snowflake' : 'package', title, sub, go: pick ? 'paid' : 'track' })], { din: o.din });
};
TP.receiptSumRow = (h, followPreview = false) => h?.bought ? ui.group([ui.row({ icon: 'receipt', title: 'ใบเสร็จรับเงิน', sub: `ยอดชำระ ${TP.money(h.bought)} · ดูใบเสร็จและใบกำกับภาษี`, go: 'receipt', p: { id: h.id, ...(followPreview ? { followPreview: true } : {}) } })], { din: 3 }) : '';
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
const BACK_L = { medhub: 'เมนูยา', home: 'หน้าแรก', account: 'บัญชี', history: 'ประวัติ', intake: 'แจ้งอาการ', family: 'สมาชิก', summary: 'ใบสรุป', inbox: 'แจ้งเตือน', health: 'ข้อมูลสุขภาพ', adrsent: 'กลับ' };
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
  return { id: c.id, caseCode: TP.caseCode(c), note: c.note, date: c.date || TP.NOW.date, time: c.joinedAt || TP.NOW.time, who: c.who, topic: (c.symptoms || []).join(' ') || 'ถามเรื่องยา', branch: c.branch, pharm: c.pharm || 'kj', bought: c.order?.status === 'paid' ? (c.order.total || 0) : 0, orderStatus: c.order?.status || 'none', outcome:c.outcome, rated: c.rated || 0, comment: c.comment, fbSent: c.fbSent, summary: true, _case: c };
}
function allHistory(S) {
  const c = S.case, out = [...S.history];
  if (c && c.status === 'closed' && !out.some(h => h.id === c.id)) out.unshift(caseItem(c));
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
function summaryTarget(ctx) {
  const S = ctx.S, st = ctx.state, all = allHistory(S);
  if (ctx.params.followPreview) return TP.followPreviewPlan(ctx.params.id);
  if (st === 'missing') return null;
  if (ctx.params.historyOutcome) return all.find(h => h.summary && historyOutcome(S, h).key === ctx.params.historyOutcome) || null;
  let id = ctx.params.id;
  if (!id && (st === 'normal' || st === 'nomeds')) {
    const withMedicine = st === 'normal';
    return all.find(h => h.summary && Boolean(sumOf(h).meds?.length) === withMedicine) || null;
  }
  if (!id && st === 'closed' && S.case?.status === 'closed') id = S.case.id;
  return id ? all.find(h => h.id === id) || TP.followSummaryRecord?.(id) : all[0];
}
function docHtml(S, h, options = {}) {
  const P = TP.PHARM[h.pharm] || TP.PHARM.kj, b = TP.branch(h.branch) || TP.branch(), sm = sumOf(h);
  const p = h.who && h.who !== 'me' ? S.family.find(f => f.id === h.who) : null;
  const identity = historyIdentity(S,h.who,h);
  const who = identity.name;
  const follow = TP.followDocLine?.(h) || sm.follow;
  const expiry = plusYear(h.date);
  const list = items => `<ul class="af-ul">${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;
  const visitCase = h._case || (S.case?.id === h.id ? S.case : null) || (h.order ? {order:h.order} : null);
  const fulfillment = TP.fulfillmentInfo?.(visitCase), paid = visitCase?.order?.paid;
  const deliveryStatus = fulfillment ? (fulfillment.done ? (fulfillment.pickup ? 'รับยาที่สาขาแล้ว' : 'จัดส่งสำเร็จแล้ว') : fulfillment.pickup ? (paid?.stage === 'ready' ? 'พร้อมรับที่สาขา' : 'กำลังเตรียมยา') : fulfillment.title) : paid ? (visitCase.order.picked || paid.got ? (paid.recv === 'pickup' ? 'รับยาที่สาขาแล้ว' : 'จัดส่งสำเร็จแล้ว') : paid.stage ? (paid.recv === 'pickup' ? 'พร้อมรับที่สาขา' : 'จัดส่งแล้ว') : 'กำลังเตรียมยา') : h.bought ? 'ไม่มีข้อมูลสถานะ' : '';
  const facts = [
    ['วันและเวลา',[h.date,h.time].filter(Boolean).join(' · ')],
    ['ผู้รับบริการ',who],['สาขา',b.name],['เภสัชกร',P.name],['เลขใบอนุญาต',P.lic],
    ['สถานะจัดส่ง',deliveryStatus]
  ];
  return `<article class="af-visit" aria-label="ใบสรุปการปรึกษา">
    ${options.hideHero ? '' : `<header class="af-visit-hero">
      <span>สรุปการรับบริการ</span>
      <h2>คำสั่งซื้อ #${esc(visitCase?.order?.no || h.orderNo || TP.orderNumber(h))}</h2>
      <small>${esc(h.date)}${h.time?' · '+esc(h.time)+' น.':''}</small>
    </header>`}
    ${options.fulfillmentCard || ''}
    <section class="card af-visit-section af-visit-concern"><h3>${ic('message-circle',20,1.8)} เรื่องที่ปรึกษา</h3>
      <p class="consultation-note">${esc(TP.consultationText(h) || 'ไม่มีข้อความอาการที่บันทึกไว้')}</p>
    </section>
    <section class="card af-visit-section"><h3>${ic('clipboard-list',20,1.8)} ข้อมูลการรับบริการ</h3>
      <dl class="af-visit-facts">${facts.filter(([,value])=>value).map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>

    </section>
    <section class="card af-visit-section"><h3>${ic('pill',20,1.8)} ข้อมูลยา</h3>
      ${sm.meds.length ? `<div class="af-medicine-list">${TP.orderMedicineList({items: sm.meds.map(m => ({...m, how: m.schedule?.length ? m.schedule.map(row => [row.time === 'เมื่อมีอาการ' ? '' : row.time, row.instruction].filter(Boolean).join(' · ')).join(' / ') : m.how}))}, {showPrice: false})}</div>` : `<p>${esc(sm.nomed || 'ไม่มียาที่ได้รับในการปรึกษาครั้งนี้')}</p>`}
    </section>
    <section class="card af-visit-section af-visit-advice"><h3>${ic('file-text',20,1.8)} คำแนะนำจากเภสัชกร</h3><p class="af-advice-text">${esc([Array.isArray(sm.advice) ? sm.advice.join("\n") : (sm.advice || ""), follow].filter(Boolean).join("\n\n"))}</p>
    </section>

  </article>`;
}
TP.summaryForCase = (c, options = {}) => {
  if (!c) return '';
  const h = allHistory(TP.S).find(item => item.id === c.id) || caseItem(c);
  const f = TP.fulfillmentInfo(c);
  const status = f?.done ? `<section class="card af-visit-section"><h3>${ic(f.pickup?'store':'truck',20,1.8)} สถานะการรับยา</h3><p>${f.pickup?'รับยาที่สาขาแล้ว':'จัดส่งยาสำเร็จแล้ว'}</p></section>` : '';
  return docHtml(TP.S,h,{hideHero:options.hideHero,fulfillmentCard:status}) + (options.hideReceipt?'':TP.receiptSumRow?.(h)||'');
};
function rateHtml(h) {
  if (summaryRated(h)) return '';
  return `<section class="card af-rate" data-in="2" aria-label="ให้คะแนนการปรึกษา">
    <h3 class="h3">ให้คะแนนการปรึกษาครั้งนี้</h3>
    <p class="small">แตะดาวเพื่อส่งคะแนน</p>
    <div class="af-stars">${[1,2,3,4,5].map(n=>`<button type="button" class="af-star" data-a="afRate" data-v="${n}" aria-label="ให้ ${n} ดาว จาก 5">${ic('star',26,1.6)}</button>`).join('')}</div>
  </section>`;
}
TP.screen('summary', {
  group: 'after', title: 'ใบสรุปการปรึกษา', code: 'C401', ref: 'C13', parent: 'history',
  states: [['normal', 'มียา'], ['nomeds', 'ไม่ได้ซื้อยา'], ['closed', 'เพิ่งจบเคส'], ['rated', 'ให้คะแนนแล้ว'], ['missing', 'ไม่พบใบสรุป']],
  notes: ['แยกข้อมูลรับบริการ ยาที่ได้รับ คำแนะนำ และการติดตาม','ได้ใบสรุปทุกครั้ง แม้ไม่ได้ซื้อยา','ให้ดาวได้ครั้งเดียวต่อเคสและซ่อนหลังส่ง','เก็บใบสรุป 1 ปีนับจากวันปิดเคส'],
  wait: ['ข้อความในใบสรุปจริงมาจากคอนโซลเภสัชกร (ตอนนี้เป็นตัวอย่าง)'],
  prep(S) {
    const st = S.st.summary; if (!st || TP.cur()?.params?.followPreview) return;
    const c = TP.cur(); if (c?.id === 'summary') delete c.params.id;
    if (!S.history.length) S.history = TP.fresh().history;
    if (st === 'closed' && S.case?.status !== 'closed') S.case = closedCase();
    if (st === 'rated') Object.assign(S.history[0], { rated: 5, fbSent: true });
  },
  render(ctx) {
    const S = ctx.S, h = ctx.h = summaryTarget(ctx);
    const nav = ui.nav({ title: 'ใบสรุปการปรึกษา', left: `<button type="button" class="back" ${ctx.params.adrReportId?'data-a="adrSummaryBack"':'data-back'} aria-label="ย้อนกลับ">${ic('chevron-left',22,2)}<span>${ctx.params.adrReportId?'รายงานอาการ':esc(backL('history'))}</span></button>` });
    if (!h) return nav + ui.page(ui.empty({ icon: 'file-text', title: 'ไม่พบใบสรุปนี้', body: 'ใบสรุปเก็บ 1 ปีนับจากวันปิดเคส', btn: { label: 'ดูประวัติ', a: 'afTabHistory' } }));
    const caseForSummary = h._case || (S.case?.id === h.id ? S.case : null);
    const fulfillment = TP.fulfillmentInfo(caseForSummary);
    if (fulfillment && !fulfillment.done) { S._paymentCase = caseForSummary; S._paidFromHome = false; return TP.SCREENS.paid.render(ctx); }
    const assessment = TP.completedMedicationOrder(S, h)
      ? ui.btn('ประเมินอาการ', { kind: 'secondary', sheet: 'historyassessment', p: { id: h.id }, icon: 'clipboard-list' })
      : '';
    const statusCard = fulfillment?.done ? `<section class="card af-visit-section"><h3>${ic(fulfillment.pickup?'store':'truck',20,1.8)} สถานะการรับยา</h3><p>${fulfillment.pickup?'รับยาที่สาขาแล้ว':'จัดส่งยาสำเร็จแล้ว'}</p></section>` : '';
    return nav + ui.page(`${docHtml(S, h, {fulfillmentCard:statusCard})}${h&&(h._case||S.case?.id===h.id)?TP.paymentReminderCard?.(S,h._case||S.case)||'':''}${TP.followSumCard?.(h) || ''}${h && TP.S.case?.id === h.id ? TP.orderReadyRow?.(TP.S, { din: 3 }) || '' : ''}${TP.receiptSumRow?.(h, !!ctx.params.followPreview) || ''}${ctx.params.followPreview?'':rateHtml(h)}
      <div class="af-visit-actions" data-in="3">${ui.btn('แจ้งอาการหลังใช้ยา', { kind: 'secondary', icon: 'heart-pulse', go: 'adr', p: { from: h.id } })}</div>
      ${assessment ? `<div class="af-visit-actions">${assessment}</div>` : ''}
`);
  }
});
TP.act('afRate', (t, ctx) => {
  const h = ctx?.h, n = Number(t.dataset.v);
  if (!h || ctx.params?.followPreview || !Number.isInteger(n) || n < 1 || n > 5 || summaryRated(h)) return;
  h.rated = n;
  const c = h._case || TP.S.case;
  if (c?.id === h.id) c.rated = n;
  try { if (!flowPreview) sessionStorage.setItem('mitraree.summary.rating.' + h.id, String(n)); } catch (_) {}
  t.closest('.af-rate')?.remove();
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
  const finalKey = order?.status === 'expired' ? 'payment-expired'
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
    'customer-ended': ['คุณจบการสนทนา', 'คุณเลือกจบการสนทนาก่อนเภสัชกรสรุป'],
    'no-response': ['สิ้นสุดการสนทนา', 'สิ้นสุดการสนทนา เนื่องจากไม่มีการตอบกลับภายใน 5 นาที'],
  };
  const [detailLabel, reason] = details[finalKey] || ['', 'ไม่มีข้อมูลผลการปรึกษาเดิม'];
  if (['order-complete', 'declined-medicine', 'no-medicine', 'completed'].includes(finalKey)) {
    return {key, label:'สำเร็จ', tone:'ok', detailLabel, reason};
  }
  return {key:Object.hasOwn(details, key) ? key : 'unknown', label:finalKey === 'order-cancelled' ? 'ยกเลิกแล้ว' : 'สิ้นสุด', tone:'muted', detailLabel, reason};
}
function historyItems(S, who = S._histWho || 'all', list = allHistory(S)) {
  const q=String(S._histQuery||'').trim().toLocaleLowerCase('th'),type=['all','completed','ended'].includes(S._histStatus)?S._histStatus:'all';
  return list.filter(h => {
    if ((h.who || 'me') !== 'me') return false;
    const {key, label, detailLabel, reason} = historyOutcome(S, h);
    if (type !== 'all' && (type === 'completed') !== (key === 'completed')) return false;
    return !q || [TP.caseCode(h), TP.consultationText(h), h.topic, h.date, h.id,
      TP.PHARM[h.pharm]?.name, TP.PHARM[h.pharm]?.short, TP.branch(h.branch)?.name,
      label, detailLabel, reason].join(' ').toLocaleLowerCase('th').includes(q);
  }).sort((a,b) => historyStamp(b) - historyStamp(a));
}
function historyFilterOptions(S) {
 const items=historyItems({...S,_histStatus:'all'}),done=items.filter(h=>historyOutcome(S,h).key==='completed').length;
 return [['all',`ทั้งหมด (${items.length})`],['completed',`สำเร็จ (${done})`],['ended',`สิ้นสุดก่อนสรุป (${items.length-done})`]];
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
  const S=TP.S, person=historyIdentity(S,h.who,h), P=TP.PHARM[h.pharm] || TP.PHARM.kj, b=TP.branch(h.branch);
  const c=S.case?.id===h.id?S.case:h._case,o=c?.order||h.order;
  if(c)TP.expireOrder?.(c);
  const outcome=historyOutcome(S,h);
  const payable=!!(o&&TP.orderPayable?.(o));
  const orderNumber=o?.no||h.orderNo;
  const destination=payable?ui.route({a:'openOrderPayment',p:{caseId:h.id}}):ui.route({go:'summary',p:{id:h.id}});
  const f=TP.fulfillmentInfo?.(c), active=historyInProgress(S,h);
  const activeStatus=payable?'รอชำระค่ายา':f?(f.pickup?(o.paid?.stage==='ready'?'พร้อมรับที่สาขา':'กำลังเตรียมยา'):f.title):'กำลังดำเนินการ';
  const fulfillmentAction=(c?.order?.fulfillment?`<button type="button" class="btn primary" ${ui.route({a:'viewFulfillment',p:{caseId:h.id}})}>${ic('truck',19,1.8)}${TP.fulfillmentInfo(c)?.done?'ดูรายละเอียดการรับยา':'ติดตามสถานะรับยา'}</button>`:'');
  return `<article class="history-card${payable?' history-card-payable':''}" data-history-id="${esc(h.id)}">
    <header class="history-card-store"><span class="history-store-picture">${b?.photo?`<img src="${esc(b.photo)}" alt="" width="40" height="40" loading="lazy">`:ic('store',22,1.8)}</span><div><b>${esc(b?.name || 'ไม่ระบุร้านยา')}</b><span>ร้านยาที่ให้คำปรึกษา</span></div><time>${esc(h.date)}<small>${esc(h.time)} น.</small></time></header>
    <button type="button" class="history-card-open" ${destination} aria-label="${payable?'ดูรายการยาและชำระเงิน':'ดูสรุปการปรึกษา'} ${esc(person.name)} เรื่อง ${esc(h.topic)} วันที่ ${esc(h.date)}">
      <span class="history-details">
        ${orderNumber?`<span class="history-detail-row"><span class="history-detail-label"><span class="history-detail-icon">${ic('receipt',17,1.8)}</span><span>รหัสคำสั่งซื้อ</span></span><span class="history-detail-value">${esc(orderNumber)}</span></span>`:''}
        <span class="history-detail-row"><span class="history-detail-label"><span class="history-detail-icon">${ic('message-circle',17,1.8)}</span><span>ข้อมูลปรึกษา</span></span><span class="history-detail-value"><span class="history-detail-note">${esc(TP.consultationText(h) || 'ไม่มีข้อความอาการที่บันทึกไว้')}</span></span></span>
        <span class="history-detail-row"><span class="history-detail-label"><span class="history-detail-icon">${ic('stethoscope',17,1.8)}</span><span>เภสัชกร</span></span><span class="history-detail-value">${esc(P.short)}</span></span>
        <span class="history-detail-row"><span class="history-detail-label"><span class="history-detail-icon">${ic('clipboard-list',17,1.8)}</span><span>สถานะ</span></span><span class="history-detail-value">${ui.tag(active?activeStatus:outcome.label,active?'info':outcome.tone)}</span></span>
      </span>
    </button>${payable?`<div class="history-payment-action"><button type="button" class="btn primary history-payment-button" ${ui.route({a:'openOrderPayment',p:{caseId:h.id}})}>${ic('credit-card',19,1.8)}<span>ข้อมูลชำระเงิน</span><span class="history-payment-countdown">${ic('clock',16,1.8)}<b data-order-countdown data-order-case="${esc(h.id)}">${TP.orderRemaining(o)}</b></span>${ic('chevron-right',17,2)}</button></div>`:`<p class="history-outcome-reason">${esc(active?'ติดตามสถานะการรับยาได้ที่นี่':outcome.reason)}</p>`}${fulfillmentAction?`<div class="history-card-extra">${fulfillmentAction}</div>`:''}</article>`;
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
  const items=historyItems(S,who);
  if(!items.length) return `<div class="history-empty">${ui.emptyArt('file-search')}<h3>ไม่พบประวัติที่ตรงกัน</h3><p>${who==='all'?'ลองเปลี่ยนคำค้นหาหรือตัวกรอง':'ยังไม่มีประวัติที่ตรงกับตัวกรอง'}</p><button type="button" class="txtbtn" data-a="afHistClear">ล้างคำค้นหาและตัวกรอง</button></div>`;
  const active=items.filter(h=>historyInProgress(S,h)), finished=items.filter(h=>!historyInProgress(S,h)), groups=[];
  finished.forEach(h=>{const [,m,y]=String(h.date).split('/'),key=`${MON[+m-1] || ''} ${y || ''}`.trim();let g=groups.find(g=>g.key===key);if(!g)groups.push(g={key,items:[]});g.items.push(h)});
  return (active.length ? `<section class="history-month"><h3>กำลังดำเนินการ</h3><div>${active.map(h=>{const c=S.case?.id===h.id?S.case:h._case;if(!c)return histItem(h);if(c.order?.status==='paid')return TP.fulfillmentCard?.({...S,case:c,history:[]})||histItem(h);if(c.status==='closed'&&c.order?.status==='pending')return TP.paymentReminderCard?.(S,c)||histItem(h);return TP.homeActiveCaseCard?.({...S,case:c})||histItem(h)}).join('')}</div></section>` : '') + groups.map(g=>`<section class="history-month"><h3>${esc(g.key)}</h3><div>${g.items.map(histItem).join('')}</div></section>`).join('');
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
  $$('[data-segname=histStatus] button',el).forEach(button=>{button.textContent=labels.get(button.dataset.v) || button.textContent});
  const results=$('#afHL',el); if(results){results.innerHTML=listHtml(S,S._histWho || 'all');TP.icons(results);historyClampNotes(el)}
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
  states:[["normal", "มีรายการ"], ["empty", "ยังไม่มี"], ["loading", "กำลังโหลด"], ["self", "เฉพาะตัวเอง", false], ["paid", "ปรึกษาสำเร็จ", false], ["no-medication", "สิ้นสุดก่อนสรุป", false], ["search", "ค้นหาประวัติ"], ["no-results", "ค้นหาไม่พบ"], ["error", "โหลดไม่สำเร็จ"], ["dark-filters", "แท็บประเภทสี CI เข้ม", false], ["shared-tabs", "แท็บกลาง ตัวอักษร 14px", false], ["store-recipient-card", "หัวการ์ดร้านยา ท้ายการ์ดผู้รับการปรึกษา", false], ["receipt-inside", "ดูใบเสร็จในใบสรุป", false], ["detail-rows", "รายละเอียดเรียงแถวพร้อมไอคอน", false], ["purchase-status", "ป้ายตามข้อมูลซื้อยา", false], ["pending-order", "รายการยารอชำระ"], ["expired-order", "รายการยาหมดอายุ"], ["cancelled-order", "ยกเลิกรายการยา"], ["tap-card", "แตะการ์ด ไม่มีข้อความลิงก์", false], ["search-below-tabs", "ช่องค้นหาอยู่ใต้แท็บ", false], ["tab-counts", "จำนวนรายการในแต่ละแท็บ", false], ["search-open", "เปิดช่องค้นหาจากหัวหน้า"], ["search-cleared", "ช่องค้นหาหลังล้างคำ", false], ["ten-records", "ประวัติ 10 รายการ หลายวันและเดือน", false],["completed","ปรึกษาสำเร็จ", false],["ended","สิ้นสุดก่อนสรุป", false],["customer-ended","คุณจบการสนทนา"],["no-response","ไม่มีการตอบกลับ 5 นาที"],["long-note","ข้อความปรึกษายาว แสดงไม่เกิน 3 บรรทัด", false]],
  notes:['แสดงประวัติของเจ้าของบัญชีเท่านั้น','เรียงล่าสุดก่อน แบ่งตามเดือน ค้นหาอาการ ร้าน เภสัชกร หรือเลขเรื่องได้','เคสที่กำลังดำเนินอยู่เปิดต่อจากแถบล่าง ส่วนประวัติแสดงการปรึกษาที่จบแล้ว','ใบสรุปและทางลัดติดตามยาใช้รหัสการปรึกษาเดิม'],
  prep(S) {
    const st=S.st.history;S._histStatus='all';
    // Replace the original built-in examples while preserving actual consultation records.
    if(st!=='empty' && !S.history.some(h=>String(h.id).startsWith('mock-history-'))) {
      const oldExamples=new Set(['TC-261002-0087','TC-261028-0102','TC-261028-0098','TC-261017-0091','TC-260922-0074','TC-260905-0069','TC-260818-0060','TC-260818-0058','TC-260630-0043','TC-260412-0021']);
      S.history=[...TP.fresh().history,...S.history.filter(h=>!oldExamples.has(h.id))];
    }
    if(st!=='empty') {
      const fixtures = new Map(TP.fresh().history.map(h => [h.id, h]));
      S.history = S.history.map(h => fixtures.has(h.id) ? { ...h, ...fixtures.get(h.id), rated:h.rated, comment:h.comment, fbSent:h.fbSent } : h);
      if (S.receipts?.['mock-history-paid']?.no !== 'MT2026101701') delete S.receipts?.['mock-history-paid'];
    }
    if(!st)return;
    if(['ten-records','long-note'].includes(st))S.history=TP.fresh().history;
    if(st==='empty'){S.history=[];if(S.case&&!caseOpen())S.case=null}else if(!S.history.length)S.history=TP.fresh().history;
    S._histWho='me';S._histStatus='all';S._histQuery='';S._histSearchOpen=['search','no-results','search-open','search-cleared','search-below-tabs'].includes(st);
    if(st==='paid'||st==='completed')S._histStatus='completed';if(st==='no-medication'||st==='ended')S._histStatus='ended';
    if(['customer-ended','no-response'].includes(st)){S.history=TP.fresh().history.map((h,i)=>({...h,outcome:i===0?st:h.outcome}));S._histStatus='ended';}
    if(st==='search')S._histQuery='ไข้';if(st==='no-results')S._histQuery='ไม่พบรายการตัวอย่าง';
    if(['pending-order','expired-order','cancelled-order'].includes(st)){S.case=closedCase();S.case.date=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date());S.case.order.awaitingCheckout=false;S.case.order.status=st==='pending-order'?'pending':st==='expired-order'?'expired':'cancelled';S.case.order.expiresAt=Date.now()+(st==='expired-order'?-1:15*60*1000)}
  },
  render(ctx) {
    const S=historyView(ctx.S),st=ctx.state,searchOpen=!!(S._histSearchOpen||S._histQuery),canSearch=!['loading','error'].includes(st)&&allHistory(S).length>0;
    const nav=ui.nav({title:'ประวัติคำสั่งซื้อ',right:canSearch?`<button type="button" id="histSearchToggle" class="ibtn history-search-toggle" data-a="afHistSearchToggle" aria-label="${searchOpen?'ปิดการค้นหาประวัติ':'ค้นหาประวัติ'}" aria-expanded="${searchOpen}" aria-controls="histSearchPanel">${ic('search',22,1.9)}</button>`:''});
    if(st==='loading')return nav+ui.page(`<div class="history-loading" aria-busy="true" aria-label="กำลังโหลดประวัติ">${ui.skel('100%',88,16)}${ui.skel('50%',20)}${ui.skel('100%',210,16)}${ui.skel('100%',210,16)}</div>`,{});
    if(st==='error')return nav+ui.page(`<div class="history-empty history-error" role="alert">${ic('circle-alert',32,2)}<h2>โหลดประวัติไม่สำเร็จ</h2><p>ข้อมูลที่บันทึกไว้ยังอยู่ ลองโหลดอีกครั้ง</p>${ui.btn('ลองอีกครั้ง',{a:'afHistRetry'})}</div>`,{});
    const selector=historySelector(S),sel=S._histWho;
    const matches=who=>!who||who==='me';
    const pending=S.ofPending&&matches(S.ofPending.who)?ui.group([ui.row({icon:'message-square-text',title:'คำถามที่ฝากไว้',sub:`${historyIdentity(S,S.ofPending.who).name} · รอเภสัชกรตอบ`,tag:['รอตอบ','warn'],chev:false})]):'';
    const live=(caseOpen()&&matches(S.case?.who)?liveCard(S.case):'')+(matches(S.case?.who)?TP.orderReadyRow?.(S,{din:1,ship:true})||'':'')+pending;
    const all=allHistory(S);
    const filters=all.length?`<div class="history-filters" ${searchOpen?'':'hidden'}><div class="history-search-panel" id="histSearchPanel" ${searchOpen?'':'hidden'}><div class="history-search" role="search" aria-label="ค้นหาประวัติการปรึกษา">${ic('search',20,1.8)}<label class="sr" for="histSearch">ค้นหาอาการ ร้านยา เภสัชกร หรือเลขการปรึกษา</label><input id="histSearch" type="search" value="${esc(S._histQuery || '')}" placeholder="อาการ ร้านยา เภสัชกร หรือเลขการปรึกษา" maxlength="100" autocomplete="off" enterkeyhint="search"><button type="button" id="histSearchClear" class="history-search-clear" data-a="afHistSearchClear" aria-label="ล้างคำค้นหา" ${S._histQuery?'':'hidden'}>${ic('x',18,2)}</button></div><button type="button" class="txtbtn history-search-close" data-a="afHistSearchClose">ปิด</button></div></div>`:'';
    const content=all.length?`<span class="sr" id="histSearchStatus" role="status" aria-live="polite"></span><div id="afHL">${listHtml(S,sel)}</div>`:`<div class="history-empty">${ui.emptyArt('history')}<h3>ยังไม่มีประวัติการปรึกษา</h3><p>กลับมาดูใบสรุปและยาที่ได้รับหลังปรึกษาเภสัชกรได้ที่นี่</p>${ui.btn('ดูร้านยาใกล้ฉัน',{a:'afHome',iconRight:'arrow-right'})}</div>`;
    return nav+ui.page(`<div class="history-page">${selector}${filters}${caseOpen() && !all.some(h=>h.id===S.case?.id) && matches(S.case?.who) ? `<section class="history-month"><h3>กำลังดำเนินการ</h3>${TP.homeActiveCaseCard?.(S) || liveCard(S.case)}</section>` : ''}${content}</div>`,{});
  },
  mount(el,ctx) {
    historyClampNotes(el);ctx.onLeave?.(()=>el._historyNoteObserver?.disconnect());
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
const ADR_OK = 'เภสัชกรจะติดต่อกลับเพื่อประเมินอาการก่อนเสมอ';
function medsFor(S, who) {
  if(who && who!=='me')return [];
  const out = [];
  allHistory(S).filter(h => (h.who || 'me') === who && h.bought).forEach(h => sumOf(h).meds.forEach((m, i) => out.push({ ...m, v: `${h.id}:${i}`, name: m.name, sub: `ได้รับ ${h.date} · ${(TP.PHARM[h.pharm] || TP.PHARM.kj).short}`, pharm: h.pharm, branch: h.branch, hid: h.id })));
  return out;
}
function adrPeople(S) { return [historyIdentity(S,'me')]; }
function adrPerson(S,who) { return adrPeople(S).some(p=>p.id===who)?who:'me'; }
function adrNewDraft(who,from='') { return {from,who,drug:'',other:'',unknown:false,generic:'',strength:'',form:'',reason:'',doses:'',route:'',onset:'',sym:[],sev:[],since:'',level:'',note:'',photos:0,attachments:[],query:'',entries:{}}; }
function adrDraft(S,params={}) {
  S._adrDrafts ||= {};
  const h=params.from?allHistory(S).find(h=>h.id===params.from):null;
  const who=adrPerson(S,params.who || h?.who || S._adr?.who || S._adrWho || 'me');
  let d=S._adrDrafts[who];
  if(!d || (!d.preview && (d.from!==(h?.id || '') || !!d.multiPlan!==!!params.multiPlan))) { d=adrNewDraft(who,h?.id || ''); S._adrDrafts[who]=d; }
  d.multiPlan=!!params.multiPlan;
  S._adrWho=who;return S._adr=d;
}
function adrMedicineName(S,d) { return d.medicine?.name || medsFor(S,d.who).find(m=>m.v===d.drug)?.name || (d.drug==='store'?(d.unknown?'ไม่ทราบชื่อยา':d.other.trim()):''); }
const adrHas=d=>!!(d.sym.some(v=>v!=='อื่น ๆ') || d.sev.length || d.note.trim());
const adrDrugReady=d=>!!d.drug && (d.drug!=='store' || !!d.other.trim() || d.unknown);
const adrReady=d=>adrDrugReady(d) && adrHas(d) && !!d.level && !!d.since;
function adrPersonSelect() { return ''; }
function adrReports(S,who) { return who==='me'?(S.adrReports||[]).filter(r=>!r.who||r.who==='me'):[]; }
function adrStoreReport(S,d) {
  if(d.who!=='me')throw Error('Only the account owner can submit a report');
  const m=d.medicine || medsFor(S,d.who).find(m=>m.v===d.drug),b=m?.branch || S.branch;
  const r={id:'AR-'+Date.now().toString(36)+'-'+((S.adrReports||[]).length+1),patientReport:true,who:d.who,whoName:historyIdentity(S,d.who).name,drug:adrMedicineName(S,d),image:m?.image,known:!!m,consultationId:m?.hid || '',consultationPreview:!!m?.followPreview,sym:[...d.sev,...d.sym],since:d.since,level:d.level,note:d.note.trim(),generic:d.generic.trim(),strength:d.strength.trim(),form:d.form.trim(),reason:d.reason.trim(),doses:d.doses.trim(),route:d.route.trim(),onset:d.onset,attachments:[...(d.attachments||[])],pharm:m?.pharm || TP.branch(b)?.pharm || 'kj',branch:b,at:TP.NOW.time,date:TP.NOW.date,severe:!!d.sev.length,replied:false};
  S.adrReports=[r,...(S.adrReports||[])]; S._adrSent=r; delete S._adrDrafts?.[d.who];S._adr=null;return r;
}
function adrCaseReports(S, report) {
  return report.batchId ? adrReports(S,'me').filter(item=>item.batchId===report.batchId) : [report];
}
function adrReplyCard(report, message = report.reply) {
  if (!report.replied && !(report.reviewStatus==='more-info' && report.reply)) return '';
  const pharmacist = TP.PHARM[report.replyPharm || report.pharm];
  const name = pharmacist?.name || pharmacist?.short || 'เภสัชกรผู้ตอบ';
  const photo = pharmacist?.photo || (pharmacist?.id ? TP.demoProfiles?.[pharmacist.id === 'tp' ? 'pharmacist_m' : 'pharmacist_f'] : '');
  return `<section class="card pad0 adr-reply-card" aria-label="คำตอบจากเภสัชกร">
    <header class="adr-reply-author">
      ${ui.av(name, { ini: pharmacist?.ini || '', img: photo })}
      <div><span>คำตอบจากเภสัชกร</span><h3>${esc(name)}</h3>
        ${report.replyAt ? `<small>${esc([report.replyDate, report.replyAt].filter(Boolean).join(' · '))}</small>` : ''}
      </div>
    </header>
    <div class="adr-reply-body">
      <p>${esc(message || 'เภสัชกรได้รับรายงานแล้ว กรุณาเตรียมฉลากยาและข้อมูลอาการเพื่อประเมินต่อ')}</p>
      ${report.replySample || !message ? '<small class="adr-reply-sample">ข้อความตัวอย่างสำหรับต้นแบบ</small>' : ''}
    </div>
  </section>`;
}
function adrReportConsultation(S,report) {
  if (!report.consultationId) return null;
  const source = report.consultationPreview
    ? TP.followPreviewPlan?.(report.consultationId)
    : allHistory(S).find(visit=>visit.id===report.consultationId);
  return source && (source.who || 'me') === (report.who || 'me') ? source : null;
}
function adrConsultationLink(S,report) {
  const source=adrReportConsultation(S,report);
  if (!source) return `<div class="adr-consultation-missing">${ic('file-text',18,1.8)}<span>ไม่มีข้อมูลการปรึกษาต้นทางของยานี้</span></div>`;
  return `<button type="button" class="adr-consultation-link" data-a="adrOpenSource" data-v="${esc(report.id)}" aria-label="ดูใบสรุปการปรึกษาที่ได้รับ ${esc(report.drug)} วันที่ ${esc(source.date)}">
    ${ic('file-text',20,1.8)}
    <span><b>ดูใบสรุปการปรึกษา</b><small>รหัสเคส ${esc(TP.caseCode(source))} · ${esc(source.date)}</small></span>
    ${ic('chevron-right',18,2)}
  </button>`;
}
// Preview statuses describe the report workflow; an assessment never proves a drug allergy.
function adrReportStatus(r) {
  if (r.replied) return {label:'เภสัชกรตอบแล้ว',tone:'info'};
  if (r.reviewStatus==='more-info') return {label:'ต้องการข้อมูลเพิ่มเติม',tone:'warn'};
  if (r.reviewStatus==='reviewing') return {label:'กำลังประเมิน',tone:'info'};
  return {label:'รอเภสัชกรประเมิน',tone:'warn'};
}
function adrBatchStatus(reports) {
  if (reports.every(r=>r.replied)) return {label:'เภสัชกรตอบแล้ว',tone:'info'};
  if (reports.some(r=>r.replied)) return {label:'ตอบแล้วบางรายการ',tone:'info'};
  return adrReportStatus(reports.find(r=>r.reviewStatus==='more-info') || reports.find(r=>r.reviewStatus==='reviewing') || reports[0]);
}
function adrCaseDetails(S,r,sheetView=false) {
  const b=TP.branch(r.branch)||TP.branch();
  const person=historyIdentity(S,r.who,r);
  const rows = items => `<dl class="adr-result-facts">${items.filter(([,value])=>value).map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;
  const reports = adrCaseReports(S,r).slice().reverse();
  const allReplied = reports.every(item=>item.replied);
  const anyReplied = reports.some(item=>item.replied);
  const branches = [...new Set(reports.map(item=>(TP.branch(item.branch)||b).name))];
  const reportStatus = adrBatchStatus(reports);
  const cards = reports.map(item=>{
    const symptoms = [
      ['อาการ',item.sym.join(' · ')],
      ['เริ่มมีอาการ',SINCE.find(([value])=>value===item.since)?.[1]],
      ['ระดับที่รบกวน',LEVEL.find(([value])=>value===item.level)?.[1]],
      ['รายละเอียดเพิ่มเติม',item.note]
    ];
    const medicineDetails = [['ชื่อสามัญ',item.generic],['ความแรง',item.strength],['รูปแบบยา',item.form],['วันและเวลาเริ่ม',item.onset],['เหตุผลที่ใช้ยา',item.reason],['จำนวนครั้ง/วันก่อนมีอาการ',item.doses],['วิธีใช้ยา',item.route]];
    return `<section class="card pad0 adr-result-section">
      <header class="adr-result-drug">
        ${TP.medicineImage({name:item.drug,image:item.image})||`<span class="adr-section-icon">${ic('pill',24,1.8)}</span>`}
        <div><span>ยาที่แจ้ง</span><h3>${esc(item.drug)}</h3>
          ${reports.length>1&&anyReplied?ui.tag(adrReportStatus(item).label,adrReportStatus(item).tone):''}
        </div>
      </header>
      ${rows(symptoms)}
      ${medicineDetails.some(([,value])=>value)?`<details><summary>รายละเอียดการใช้ยา</summary>${rows(medicineDetails)}</details>`:''}
      ${item.attachments?.length?`<div class="adr-result-attachments"><h3>รูปฉลากที่แนบ</h3><div class="adr-attachments">${item.attachments.map(f=>`<figure><img src="${esc(f.url)}" alt="${esc(f.name)}"><figcaption>${esc(f.name)}</figcaption></figure>`).join('')}</div></div>`:''}
      ${sheetView?'':item.replied?`<div class="adr-result-reply">${ui.note('<b>ข้อความตอบกลับ (ตัวอย่าง)</b><br>เภสัชกรได้รับรายงานแล้ว กรุณาเตรียมฉลากยาและข้อมูลอาการเพื่อประเมินต่อ',{icon:'message-circle'})}</div>`:''}
    </section>${sheetView?`<div class="adr-consultation card">${adrConsultationLink(S,item)}</div>${adrReplyCard(item)}`:''}`;
  }).join('');
  return `<div class="adr-result${sheetView?' adr-report-details':''}">
    ${reports.some(item=>item.severe)?ui.note('<b>ไปโรงพยาบาลทันที อย่ารอตอบกลับ</b> <a href="tel:1669">โทร 1669</a>',{tone:'danger',icon:'octagon-alert'}):''}
    <section class="card pad0 adr-result-section adr-result-overview">
${sheetView?`      <header class="adr-result-status">
        <h2>${ic('clipboard-list',20,1.8)} ข้อมูลรายงาน</h2>
        ${ui.tag(reportStatus.label,reportStatus.tone)}
      </header>`:`      <header class="adr-result-status">
        <span class="adr-section-icon">${ic(allReplied?'message-circle':'clipboard-list',24,1.8)}</span>
        <div><h2>${allReplied?'เภสัชกรตอบแล้ว':'ส่งรายงานแล้ว'}</h2>
          ${ui.tag(reportStatus.label,reportStatus.tone)}
        </div>
      </header>`}
      ${rows([['ผู้มีอาการ',person.name+' · '+person.rel],['ส่งเมื่อ',[r.date,r.at].filter(Boolean).join(' ')],['ร้านยา',branches.join(' · ')],['เลขรายงาน',reports.map(item=>item.id).join('\n')]])}
      ${!allReplied?`<p class="adr-help">เภสัชกรจะประเมินว่าอาการเกี่ยวข้องกับยาหรือไม่</p>`:''}
    </section>
    <h2 class="adr-result-heading">${sheetView?'ยาและอาการที่แจ้ง':'ข้อมูลที่ส่ง'} <span>${reports.length} รายการ</span></h2>
    ${cards}
  </div>`;
}
function adrCaseCards(S,reports) {
  const seen=new Set();
  const unique = reports.filter(report=>{
    const key=report.batchId ? 'batch:'+report.batchId : 'report:'+report.id;
    if(seen.has(key))return false;
    seen.add(key);
    return true;
  });
  const groups = TP.inboxGroups(unique.map(report=>({report,time:[report.date,report.at].filter(Boolean).join(' ')})));
  return groups.map((group,index)=>`<section class="adr-report-day" aria-labelledby="adrReportDay${index}">
    <h3 id="adrReportDay${index}">${esc(group.label)}</h3>
    <div class="adr-day-cards">${group.items.map(({note,date})=>{
    const report=note.report;
    const items=adrCaseReports(S,report);
    const allReplied=items.every(item=>item.replied),anyReplied=items.some(item=>item.replied);
    const names=[...new Set(items.map(item=>item.drug))].join(' · ');
    const symptoms=[...new Set(items.flatMap(item=>item.sym||[]))].join(' · ');
    const medicinePhoto = TP.medicineImage({name:report.drug,image:report.image});
    const reportStatus = adrBatchStatus(items);
    return `<button type="button" class="adr-report" data-a="adrOpenReport" data-v="${esc(report.id)}" aria-haspopup="dialog">
      <span class="adr-report-main">
        <span class="adr-report-icon" aria-hidden="true">${medicinePhoto||ic('pill',22,1.8)}</span>
        <span class="adr-report-copy"><b>${esc(names)}</b>${symptoms?`<span>${esc(symptoms)}</span>`:''}</span>
        ${ic('chevron-right',18,2)}
      </span>
      <span class="adr-report-meta">
        <small>${esc(date.time || report.at || '')}</small>
        ${ui.tag(reportStatus.label,reportStatus.tone)}
      </span>
    </button>`;
  }).join('')}</div></section>`).join('');
}
TP.screen('adrcare',{
  group:'after',title:'แพ้ยาและอาการหลังใช้ยา',code:'C416',parent:'medhub',
  states:[["normal", "ยังไม่มีรายงาน"], ["empty", "ยังไม่มีรายงาน", false], ["reported", "มีรายงานรอประเมิน"], ["loading", "กำลังโหลด"], ["error", "โหลดไม่สำเร็จ"], ["grouped-days", "หลายรายงาน แบ่งตามวัน"], ["report-statuses", "ตัวอย่างสถานะรายงาน", false]],
  notes:['ดูประวัติและแจ้งอาการของเจ้าของบัญชีเท่านั้น','การส่งรายงานยังไม่ยืนยันว่าแพ้ยา','ค้นหาจากยาที่เจ้าของบัญชีเคยได้รับ รูปยาเป็นภาพประกอบ ไม่ใช้ยืนยันชนิดยา'],
  prep(S){const st=S.st.adrcare;S._adrWho='me'; if(st==='grouped-days'||st==='report-statuses'){
    S.adrReports=[];
    const medicines=TP.adrActiveMedicines?.({multiPlan:true}) || [];
    const examples=[
      {med:0,date:'18/10/2026',at:'14:12',sym:['ผื่น คัน']},
      {med:1,date:'18/10/2026',at:'10:30',sym:['ระคายคอ'],reviewStatus:'reviewing'},
      {med:2,date:'17/10/2026',at:'16:00',sym:['ง่วงนอน'],reviewStatus:'more-info'},
      {med:0,date:'15/10/2026',at:'09:20',sym:['คลื่นไส้'],replied:true},
      {med:2,date:'12/10/2026',at:'18:45',sym:['เวียนหัว'],replied:true}
    ];
    examples.forEach(example=>{
      const medicine=medicines[example.med]; if(!medicine)return;
      const draft=adrNewDraft('me');
      Object.assign(draft,{drug:medicine.v,medicine,sym:example.sym,since:'today',level:'mild'});
      const report=adrStoreReport(S,draft);
      Object.assign(report,{date:example.date,at:example.at,replied:!!example.replied,reviewStatus:example.reviewStatus||'',...(example.reviewStatus==='more-info'?{reply:'เพื่อประกอบการประเมิน รบกวนแจ้งเวลาเริ่มมีอาการและยาที่ใช้ร่วมกันเพิ่มเติมค่ะ',replyPharm:report.pharm,replyDate:example.date,replyAt:'16:20',replySample:true}:{}),...(example.replied?{reply:'ได้รับข้อมูลอาการแล้วค่ะ กรุณาติดต่อเภสัชกรหากอาการยังรบกวนหรือมีอาการเพิ่มเติม',replyPharm:report.pharm,replyDate:example.date,replyAt:'16:30',replySample:true}:{})});
    });
  } if(st==='empty'||st==='normal')S.adrReports=[];if(st==='reported'){S.adrReports=[];for(const who of ['me']){const d=adrNewDraft(who);Object.assign(d,{drug:'store',other:'ชื่อยาจากฉลาก (ตัวอย่าง)',sym:['ผื่น คัน'],since:'today',level:'mild'});const report=adrStoreReport(S,d);const med=TP.adrActiveMedicines?.({multiPlan:true})[0];if(med)Object.assign(report,{drug:med.name,image:med.image,known:true});}}},
  render(ctx){const S=ctx.S,who=S._adrWho=adrPerson(S,S._adrWho),identity=historyIdentity(S,who),reports=adrReports(S,who),nav=ui.nav({title:'แพ้ยา / อาการหลังใช้ยา',left:`<button type="button" class="back" data-a="adrCareBack">${ic('chevron-left',22,2.2)}<span>เมนูยา</span></button>`});
    if(ctx.state==='loading')return nav+ui.page(ui.skel('100%',220,16));
    if(ctx.state==='error')return nav+ui.page(`<div class="history-empty" role="alert"><h2>โหลดข้อมูลไม่สำเร็จ</h2><p>ลองโหลดข้อมูลของคุณอีกครั้ง</p>${ui.btn('ลองอีกครั้ง',{a:'adrCareRetry'})}</div>`);
    return nav+ui.page(`<div class="adr-care">
      ${adrPersonSelect(S,who,'adrCareWho','care')}
      <section class="adr-records" aria-labelledby="adrRecordsTitle">
        <header class="adr-records-heading">
          <div><h2 id="adrRecordsTitle">รายงานที่ส่งแล้ว</h2><p class="adr-help">${esc(identity.name)}</p></div>
          ${ui.btn('แจ้งอาการ',{go:'adr',p:{who},icon:'plus',kind:'secondary'})}
        </header>
        <div class="adr-records-list">${reports.length?adrCaseCards(S,reports):`
          <div class="adr-empty">${ui.emptyArt('clipboard-list')}<b>ยังไม่มีรายงานอาการหลังใช้ยา</b><p>รายงานที่ส่งและผลประเมินจะแสดงที่นี่</p></div>`}</div>
        <p class="adr-records-note adr-help">${ic('info',16,1.8)}<span>การส่งรายงานยังไม่ยืนยันว่าแพ้ยา</span></p>
      </section>
    </div>`,{});
  },mount(el,ctx){$('#adrCareWho',el)?.addEventListener('change',e=>{ctx.S._adrWho=e.target.value;TP.refresh({anim:false})});if(ctx.state==='loading')ctx.later(()=>{ctx.S.st.adrcare='normal';TP.refresh()},1400)}
});
TP.act('adrCareBack',()=>{
  if(!TP.hist?.length||TP.hist.at(-1)?.id==='medhub')return TP.back();
  return TP.go('medhub',{via:'back',replace:true});
});
TP.act('adrCareRetry',()=>{TP.S.st.adrcare='normal';TP.refresh()});
TP.act('adrOpenReport',t=>{
  if(adrReports(TP.S,'me').some(report=>report.id===t.dataset.v))return TP.sheet('adrreport',{id:t.dataset.v});
});
TP.act('adrOpenSource',t=>{
  const report=adrReports(TP.S,'me').find(item=>item.id===t.dataset.v);
  const source=report && adrReportConsultation(TP.S,report);
  if (!source) return TP.notify('ไม่พบใบสรุปการปรึกษาของยานี้',{icon:'info'});
  return TP.go('summary',{params:{id:source.id,followPreview:!!report.consultationPreview,adrReportId:report.id}});
});
TP.act('adrSummaryBack',async(t,ctx)=>{
  const reportId=ctx.params.adrReportId;
  await TP.back();
  if (adrReports(TP.S,'me').some(item=>item.id===reportId))return TP.sheet('adrreport',{id:reportId});
});
TP.sheetDef('adrreport',{
  group:'after',title:'รายละเอียดรายงานอาการ',code:'C419',host:'adrcare',tall:true,
  states:[['pending','รอเภสัชกรประเมิน'],['replied','ประเมินแล้ว'],['reply-long','คำตอบหลายบรรทัด'],['source-missing','ไม่มีข้อมูลการปรึกษาต้นทาง']],
  notes:['แสดงรายละเอียดแยกตามยาที่แจ้งในเคสเดียวกัน','เปิดใบสรุปจากเคสที่จ่ายยาแต่ละตัว และย้อนกลับมารายงานเดิม','ไม่มีข้อมูลต้นทางจะแสดงข้อความ ไม่เชื่อมไปเคสอื่นแทน'],
  prep(S){
    const draft=adrNewDraft('me');
    Object.assign(draft,{drug:'store',other:'ชื่อยาจากฉลาก (ตัวอย่าง)',sym:['ผื่น คัน'],since:'today',level:'mild'});
    const medicine=TP.adrActiveMedicines?.({multiPlan:true})?.[0];
    if(medicine && S.st.adrreport!=='source-missing')Object.assign(draft,{drug:medicine.v,medicine});
    const report=adrStoreReport(S,draft);
    report.replied=['replied','reply-long'].includes(S.st.adrreport);
    if (report.replied) Object.assign(report, {reply:'เภสัชกรได้รับรายงานแล้ว กรุณาเตรียมฉลากยาและข้อมูลอาการเพื่อประเมินต่อ',replyPharm:report.pharm,replyDate:TP.NOW.date,replyAt:'14:40',replySample:true});
    if (S.st.adrreport==='reply-long') report.reply+='\n\nหากมีรายละเอียดเพิ่มเติม กรุณาแจ้งเวลาที่เริ่มมีอาการและวิธีใช้ยาตามฉลาก เพื่อให้ข้อมูลการประเมินครบถ้วน';
    S._adrReportPreviewId=report.id;
  },
  render({S,params}){
    const report=adrReports(S,'me').find(item=>item.id===(params.id??S._adrReportPreviewId));
    return report?adrCaseDetails(S,report,true):ui.empty({icon:'clipboard-list',title:'ไม่พบรายงานของคุณ'});
  },
  foot:()=>ui.btn('ปิด',{kind:'secondary',closeSheet:true})
});
function adrChoices(params) {
  return TP.adrActiveMedicines?.(params) || [];
}
function adrSelected(d) {
  return Object.values(d.entries).filter(entry => entry.selected);
}
function adrDetails(entry, index) {
  const field = (key, label, options = {}) => ui.field({ id: `adr-${key}-${index}`, label, value: entry[key], ...options });
  const question = (number, label) => `<legend><span class="adr-question-number" aria-hidden="true">${number}</span>${label} <span class="reg-required" aria-hidden="true">*</span><span class="sr"> (จำเป็น)</span></legend>`;
  return `<div class="adr-entry-fields">
    <fieldset>${question(1,'มีอาการอะไรบ้าง?')}<p class="adr-help">เลือกได้หลายข้อ หรือพิมพ์อาการของคุณ</p>${ui.chips('adrSymptoms', ADR_SYM.filter(v => v !== 'อื่น ๆ'), entry.sym, {a:'adrEntryCheck',label:'อาการที่พบ'})}
      ${field('note','เล่าอาการเพิ่มเติม',{optional:true,textarea:true,rows:2,max:500,placeholder:'เช่น ผื่นขึ้นที่แขนทั้งสองข้าง'})}</fieldset>
    <fieldset>${question(2,'เริ่มมีอาการเมื่อไร?')}${ui.seg('adrSince', SINCE, entry.since, {a:'adrEntrySegment',label:'เริ่มมีอาการเมื่อไร'})}</fieldset>
    <fieldset>${question(3,'อาการรบกวนมากแค่ไหน?')}${ui.seg('adrLevel', LEVEL, entry.level, {a:'adrEntrySegment',label:'อาการรบกวนมากแค่ไหน'})}</fieldset>
    <fieldset class="adr-urgent"><legend>อาการเร่งด่วน (เลือกถ้ามี)</legend>${ui.chips('adrUrgent', ADR_SEV, entry.sev, {a:'adrEntryCheck',red:true,label:'อาการเร่งด่วน'})}</fieldset>
    <div data-adr-danger ${entry.sev.length?'':'hidden'}>${ui.note('<b>ไปโรงพยาบาลทันที อย่ารอส่งรายงาน</b> <a href="tel:1669">โทร 1669</a>',{tone:'danger',icon:'octagon-alert'})}</div>
    <details><summary>ข้อมูลการใช้ยาเพิ่มเติม (ไม่บังคับ)</summary>
      ${field('onset','วันและเวลาที่เริ่มมีอาการ',{type:'datetime-local',optional:true})}
      ${field('reason','ใช้ยาเพราะอาการอะไร',{max:160,optional:true})}
      ${field('doses','ใช้ไปกี่ครั้งหรือกี่วันก่อนมีอาการ',{max:160,optional:true})}
      ${field('route','วิธีใช้ยา เช่น กิน ทา หยอด',{max:160,optional:true})}
    </details>
  </div>`;
}
function adrFormStatus(el, d) {
  const selected = adrSelected(d);
  $('#afAdrGo',el).disabled = !!d.sending || !selected.length || !selected.every(adrReady);
  const note = $('.dock-note',el);
  if (note) note.textContent = adrProgress(d);
}
function adrProgress(d) {
  const selected = adrSelected(d);
  return selected.length ? `กรอกครบ ${selected.filter(adrReady).length} จาก ${selected.length} รายการ` : 'เลือกยาที่สงสัยเพื่อเริ่มกรอกอาการ';
}
TP.screen('adr',{
  group:'after',title:'แจ้งอาการหลังใช้ยา',code:'C412',ref:'C15',parent:'adrcare',
  states:[["normal","เลือกยาที่ใช้อยู่"],["filled","กรอกครบหลายรายการ"],["severe","อาการเร่งด่วน"],["search","ค้นหายา"],["no-results","ค้นหาไม่พบ"],["symptoms","กรอกอาการในกล่องยา"],["submit-error","ส่งไม่สำเร็จ ข้อมูลยังอยู่"],["no-active","ไม่มียาที่ใช้อยู่"]],
  notes:['เลือกยาได้หลายรายการและกรอกอาการในกล่องยาแต่ละตัวบนหน้าเดียว','แสดงยาจากแผนที่ยังใช้อยู่ เท่านั้น','รายงานเป็นของเจ้าของบัญชีและไม่เพิ่มประวัติแพ้ยาอัตโนมัติ','แสดงคำเตือนฉุกเฉินก่อนกรอกและเมื่อเลือกอาการเร่งด่วน'],
  prep(S) {
    S._adrDrafts={};
    const d=adrDraft(S);
    const state=S.st.adr;
    d.preview=true;
    d.noActive=state==='no-active';
    const choices=adrChoices({multiPlan:true});
    const targets=state==='filled'?choices.slice(0,2):choices.slice(0,1);
    if (['filled','severe','symptoms','submit-error'].includes(state)) {
      for (const med of targets) {
        d.entries[med.v]={...adrNewDraft(d.who),drug:med.v,medicine:med,selected:true,sym:['ผื่น คัน'],since:state==='symptoms'?'':'yday',level:'mid',sev:state==='severe'?[ADR_SEV[0]]:[]};
        if (state==='severe') d.entries[med.v].level='high';
      }
    }
    if (state==='search') d.query=choices[0]?.name || '';
    if (state==='no-results') d.query='ไม่พบยานี้';
    d.failNext=state==='submit-error';
  },
  render(ctx) {
    const S=ctx.S,d=adrDraft(S,ctx.params);
    const current=d.noActive?[]:adrChoices({...ctx.params,multiPlan:ctx.params.multiPlan||d.preview});
    const history=TP.adrHistoryMedicines?.(ctx) || [];
    const meds=[...current.map(m=>({...m,adrTab:'current'})),...history.map(m=>({...m,adrTab:'history'}))]; d.medTab ||= 'current';
    const available=new Set(meds.map(med=>med.v));
    Object.values(d.entries).forEach(entry=>{if(!available.has(entry.drug)) entry.selected=false;});
    const cards=meds.map((med,i)=>{
      const entry=d.entries[med.v] ||= {...adrNewDraft(d.who),drug:med.v,medicine:med,generic:med.genericName||'',strength:med.strength||'',form:med.form||'',selected:false};
      return `<section class="adr-entry" data-adr-index="${i}" data-adr-key="${esc(med.v)}" data-adr-name="${esc(med.name)}" data-adr-tab="${med.adrTab}" ${med.adrTab!==d.medTab || !entry.selected&&!med.name.toLocaleLowerCase('th').includes(d.query.trim().toLocaleLowerCase('th'))?'hidden':''}>
        <button type="button" class="adr-medicine" data-a="adrEntryToggle" aria-expanded="${entry.selected}" aria-controls="adr-fields-${i}">${TP.medicineImage(med)||`<span class="adr-medicine-placeholder">${ic('pill',24,1.8)}</span>`}<span><b>${esc(med.name)}</b><small>${esc(med.sub)}</small></span><i data-adr-mark aria-hidden="true">${ic(entry.selected?'circle-check':'circle',20,1.8)}</i></button>
        <div id="adr-fields-${i}" ${entry.selected?'':'hidden'}>${entry.selected?adrDetails(entry,i):''}</div>
      </section>`;
    }).join('');
    const selected=adrSelected(d);
    const searchOpen=!!(d.searchOpen||d.query);
    const searchButton=meds.length?`<button type="button" id="adrSearchToggle" class="ibtn history-search-toggle" data-a="adrSearchToggle" aria-label="${searchOpen?'ปิดการค้นหายา':'ค้นหายา'}" aria-expanded="${searchOpen}" aria-controls="adrSearchPanel">${ic('search',22,1.9)}</button>`:'';
    return ui.nav({back:backL('adrcare'),title:'แจ้งอาการหลังใช้ยา',right:searchButton})+ui.page(`<div class="adr-form">
      ${ui.note('<b>อาการฉุกเฉิน</b><br>หายใจลำบาก ปากหรือหน้าบวม หรือเป็นลม ให้ไปโรงพยาบาลทันที หรือ <a href="tel:1669">โทร 1669</a>',{tone:'warn',icon:'triangle-alert'})}
      <div id="adrSendError" role="alert" ${d.error?'':'hidden'}>${ui.note('ยังส่งรายงานไม่สำเร็จ ข้อมูลที่กรอกยังอยู่ ลองส่งอีกครั้ง',{tone:'danger'})}</div>
      <section class="adr-block">${ui.seg('adrMedTab',[['current','ยาที่ใช้อยู่'],['history','ยาที่ใช้ใน 7 วัน']],d.medTab,{a:'adrMedTab',label:'รายการยา'})}<header class="adr-med-heading"><p class="adr-help">เลือกยาที่สงสัยได้หลายตัว</p></header>
      ${meds.length?`<div class="history-search-panel" id="adrSearchPanel" ${searchOpen?'':'hidden'}><label class="history-search" for="adrMedSearch">${ic('search',20,1.8)}<span class="sr">ค้นหายาที่ใช้อยู่</span><input type="search" id="adrMedSearch" placeholder="ค้นหาชื่อยา" value="${esc(d.query)}" autocomplete="off" enterkeyhint="search"></label></div>`:''}
      <p id="adrNoMatches" class="adr-empty" role="status" ${meds.length&&meds.some(m=>m.name.toLocaleLowerCase('th').includes(d.query.trim().toLocaleLowerCase('th'))||d.entries[m.v]?.selected)?'hidden':''}>${ui.emptyArt(meds.length?'search':'pill')}<span>${meds.length?'ไม่พบยาที่ค้นหา':'ไม่มียาที่กำลังติดตาม'}</span></p><div class="adr-medicines">${cards}</div></section></div>`)+ui.dock(ui.btn('ส่งให้เภสัชกร',{a:'afAdrSend',id:'afAdrGo',disabled:!selected.length||!selected.every(adrReady),iconRight:'send'}),{note:adrProgress(d)});
  },
  mount(el,ctx) {
    const d=ctx.S._adr;
    const search=$('#adrMedSearch',el);
    search?.addEventListener('input', e=>{
      d.query=e.target.value;
      const query=d.query.trim().toLocaleLowerCase('th');
      const cards=$$('.adr-entry',el);
      cards.forEach(card=>{card.hidden=card.dataset.adrTab!==d.medTab || (!d.entries[card.dataset.adrKey].selected&&!card.dataset.adrName.toLocaleLowerCase('th').includes(query));});
      $('#adrNoMatches',el).hidden=cards.some(card=>!card.hidden);
    });
    search?.addEventListener('keydown',e=>{
      if (e.key==='Escape') {e.preventDefault();adrSetSearch(el,d,false);}
      if (e.key==='Enter') {e.preventDefault();search.blur();}
    });
    el.addEventListener('input',e=>{
      const card=e.target.closest('.adr-entry');
      if (!card) return;
      const entry=d.entries[card.dataset.adrKey];
      const key=['note','onset','reason','doses','route'].find(key=>e.target.id===`adr-${key}-${card.dataset.adrIndex}`);
      if (key) entry[key]=e.target.value;
      adrFormStatus(el,d);
    });
  }
});
function adrSetSearch(el,d,open) {
  const panel=$('#adrSearchPanel',el), toggle=$('#adrSearchToggle',el), input=$('#adrMedSearch',el);
  d.searchOpen=open;
  panel.hidden=!open;
  toggle.setAttribute('aria-expanded',String(open));
  toggle.setAttribute('aria-label',open?'ปิดการค้นหายา':'ค้นหายา');
  if (open) input.focus();
  else {
    input.value='';
    input.dispatchEvent(new Event('input'));
    toggle.focus({preventScroll:true});
  }
}
TP.act('adrMedTab',t=>{const d=TP.S._adr;d.medTab=t.dataset.v;const el=curEl();$$('[data-a=adrMedTab]',el).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===d.medTab)));const q=d.query.trim().toLocaleLowerCase('th');$$('.adr-entry',el).forEach(card=>{card.hidden=card.dataset.adrTab!==d.medTab||(!d.entries[card.dataset.adrKey].selected&&!card.dataset.adrName.toLocaleLowerCase('th').includes(q));});const empty=$('#adrNoMatches',el);empty.hidden=$$('.adr-entry',el).some(card=>!card.hidden);if(!empty.hidden)empty.querySelector('span').textContent=d.medTab==='history'?'ไม่พบรายการยาใน 7 วันที่ผ่านมา':'ไม่มียาที่กำลังติดตาม';});
TP.act('adrSearchToggle',()=>{
  const el=curEl();
  adrSetSearch(el,TP.S._adr,$('#adrSearchPanel',el).hidden);
});
TP.act('adrEntryToggle',t=>{
  const d=TP.S._adr,card=t.closest('.adr-entry'),entry=d.entries[card.dataset.adrKey];
  entry.selected=!entry.selected;
  const fields=$('#'+t.getAttribute('aria-controls'),card);
  if (entry.selected&&!fields.hasChildNodes()) {fields.innerHTML=adrDetails(entry,card.dataset.adrIndex);TP.icons(fields);}
  fields.hidden=!entry.selected;
  t.setAttribute('aria-expanded',String(entry.selected));
  const mark=$('[data-adr-mark]',t);
  mark.innerHTML=ic(entry.selected?'circle-check':'circle',20,1.8);
  TP.icons(mark);
  adrFormStatus(curEl(),d);
});
TP.act('adrEntryCheck',t=>{
  const d=TP.S._adr,card=t.closest('.adr-entry'),entry=d.entries[card.dataset.adrKey];
  entry.sym=ui.chipVals(card,'adrSymptoms');
  entry.sev=ui.chipVals(card,'adrUrgent');
  $('[data-adr-danger]',card).hidden=!entry.sev.length;
  if (entry.sev.length) {
    entry.level='high';
    $$('[data-segname="adrLevel"] button',card).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v==='high')));
    TP.live('ไปโรงพยาบาลทันที อย่ารอส่งรายงาน');
  }
  adrFormStatus(curEl(),d);
});
TP.act('adrEntrySegment',t=>{
  const d=TP.S._adr,card=t.closest('.adr-entry'),entry=d.entries[card.dataset.adrKey];
  if (t.closest('.seg').dataset.segname==='adrSince') entry.since=t.dataset.v;
  else {
    entry.level=entry.sev.length?'high':t.dataset.v;
    $$('[data-segname="adrLevel"] button',card).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===entry.level)));
  }
  adrFormStatus(curEl(),d);
});
TP.act('afAdrSend',async t=>{
  const S=TP.S,d=S._adr;
  if (!d||d.sending) return;
  const selected=adrSelected(d);
  if (!selected.length||!selected.every(adrReady)) return;
  if (d.failNext) {
    d.failNext=false;
    d.error=true;
    const notice=$('#adrSendError',curEl());
    notice.hidden=false;
    notice.scrollIntoView({block:'nearest'});
    return;
  }
  d.sending=true;
  t.disabled=true;
  t.classList.add('busy');
  const form=$('.adr-form',curEl());
  if (form) form.inert=true;
  await TP.wait(RM()?50:700);
  if (S._adr!==d) return;
  const reports=selected.map(entry=>adrStoreReport(S,entry));
  if (reports.length>1) reports.forEach(item=>{item.batchId=reports[0].id;});
  const report=reports.find(item=>item.severe)||reports[0];
  S._adrSent=report;
  S.st.adrsent=report.severe?'severe':S.storeOpen?'sent':'closed';
  TP.emit('state');
  TP.go('adrsent',{replace:true,params:{id:report.id}});
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
      return ui.nav({back:backL('adrcare'),title:'รายงานอาการหลังใช้ยา'})+ui.page(adrCaseDetails(S,r))+ui.dock(`${ui.btn('ปรึกษาเภสัชกร',{a:'afAdrTalk',icon:'message-circle'})}${ui.btn('ดูบันทึกของฉัน',{a:'adrBackRecords',kind:'secondary'})}`);
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
const inboxVisible = n => !['account','address','health','news'].includes(n.kind);
const KIND_IC = { summary:'file-text',adr:'message-square-text',news:'bell',queue:'clock',msg:'message-circle',order:'receipt',pay:'receipt',delivery:'truck',address:'map-pin',account:'user',health:'heart-pulse' };
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
  if (!n.go || !TP.SCREENS[n.go]) { if (TP.cur()?.id === 'inbox') TP.refresh({ anim: false }); return; }
  if (n.st) { S.st[n.go] = n.st; TP.SCREENS[n.go].prep?.(S); }
  if (['home', 'history', 'account'].includes(n.go)) return TP.tab(n.go);
  const params = n.p || (n.go === 'summary' && S.history[0] ? { id: S.history[0].id } : {});
  return TP.go(n.go, { params });
}
TP.screen('inbox', {
 group:'after',title:'กล่องแจ้งเตือน',code:'C404',ref:'A13',tab:'inbox',
 states:[['normal','หลายรายการ แบ่งตามวัน'],['read','รายการเดิม', false],['empty','ยังไม่มี'],['many','แจ้งเตือนหลายวัน', false],['same-day','หลายรายการในวันเดียว'],['loading','กำลังโหลดแจ้งเตือน'],['error','โหลดแจ้งเตือนไม่สำเร็จ']],
 notes:['แสดงลิสต์ใหม่สุดก่อน แบ่งวันนี้ เมื่อวาน และวันที่ก่อนหน้า ตามเวลาไทย','ไม่มีข้อความอ่านแล้ว จำนวนยังไม่อ่าน หรือปุ่มอ่านทั้งหมดในหน้านี้','แสดงเฉพาะหัวข้อสถานะหลักของการปรึกษา การชำระเงิน และการรับยา เปิดรายละเอียดจากรายการแจ้งเตือน','การ์ดมุมมนแสดงไอคอนทางซ้าย หัวข้อสถานะหลัก ข้อความสั้นด้านล่าง และเวลาด้านขวา ไม่ใช้ชื่อร้านแทนหัวข้อ','ข้อมูลตัวอย่าง 10 รายการแยกจากรายการแจ้งเตือนที่เข้ามาระหว่างใช้ต้นแบบ'],
 prep(S){const st=S.st.inbox;if(!st)return;if(st==='empty'){S.inbox=[];return;}S.inbox=TP.previewInbox(S.history);if(st==='normal')S.inbox[0].read=false;if(st==='same-day'){const first=inboxDate(S.inbox[0]).key;S.inbox=S.inbox.filter(n=>inboxDate(n).key===first);}},
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
  states: [['normal', 'ปกติ'], ['profile-cover', 'ปกบัญชีและโปรไฟล์ตรงกลาง', false], ['abstract-cover', 'ปก Abstract CI เต็ม safe area', false], ['clean-profile', 'โปรไฟล์พื้นเทาและเมนูพื้นขาว', false]],
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
        ui.switchRow({ icon: 'bell', title: 'การแจ้งเตือน', sub: 'ซ่อนข้อมูลสุขภาพและยอดเงิน', on: S.notif, a: 'afNotif' })
      ], { din: 4 })}
      ${ui.group([ui.row({ icon: 'headset', title: 'ติดต่อฝ่ายบริการลูกค้า', sub: 'ทุกวัน 10:00-18:00', go: 'help' })], { din: 5 })}
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
function receiptTaxPicker(S) {
  const kind=S._receiptTaxKind||'me', rows=TP.taxRecords(kind,S), selected=TP.taxSelected(kind,S);
  return `<div class="tax-profile-page rc-tax-picker">${ui.seg('receiptTaxKind',[['me','บุคคลธรรมดา'],['co','นิติบุคคล']],kind,{a:'receiptTaxKind',label:'ประเภทผู้รับใบกำกับภาษี'})}<div class="tax-profile-list-head"><h3 class="h3">ข้อมูลที่บันทึกไว้ <span class="small">(${rows.length})</span></h3>${ui.btn('เพิ่มข้อมูล',{kind:'secondary',icon:'plus',a:'rcTaxPickerAdd'})}</div><div class="tax-profile-list">${rows.length?rows.map(r=>`<button type="button" class="card tax-summary tax-summary-compact rc-tax-pick-card" data-a="rcTaxPickerChoose" data-v="${kind}" data-key="${esc(r.profileKey)}" aria-label="เลือก ${esc(r.name)}"><header class="tax-summary-head"><b>${esc(r.name)}</b>${r.profileKey===selected?.profileKey?ic('circle-check',20):ic('chevron-right',20)}</header><div class="tax-summary-content"><p>${esc(TP.taxAddress(r))}</p>${kind==='co'&&r.business?`<p>ชื่อธุรกิจ : ${esc(r.business)}</p>`:''}<p>โทรศัพท์ : ${esc(r.phone||'—')}</p><p>${kind==='co'?'เลขประจำตัวผู้เสียภาษี':'เลขประจำตัวประชาชน'} : ${esc(('xxxxxxxxx'+String(r.id||'').slice(-4)))}</p></div></button>`).join(''):`<div class="rc-tax-empty">${ui.emptyArt('file-text')}<b>ยังไม่มีข้อมูล${kind==='co'?'นิติบุคคล':'บุคคลธรรมดา'}</b><p class="small">กดเพิ่มข้อมูลเพื่อบันทึกผู้รับใบกำกับภาษี</p></div>`}</div></div>`;
}
// Checkout uses the same saved-recipient cards and visual pattern as the receipt.
TP.act('payTaxPickOpen',()=>{
  TP.S._receiptTaxKind=TP.S.pay?.taxWho||'me';
  TP.S._checkoutTaxScroll=$('.sh-b',TP.sheetOpen()?.el)?.scrollTop||0;
  return TP.sheet('checkouttaxpicker');
});
TP.act('payTaxPickerChoose',async b=>{
  const record=TP.taxChoose(b.dataset.v,b.dataset.key);if(!record)return;
  Object.assign(TP.S.pay,{taxWho:b.dataset.v,taxWant:true});
  await TP.closeSheet();
});
TP.act('payTaxPickerAdd',()=>{
  const d=taxProfileDraft(TP.S);d.kind=TP.S._receiptTaxKind||'me';d.editKey=null;d.errors={};d.drafts[d.kind]=taxProfileEntry(null,{},d.kind==='co');
  TP.sheetOpen().ctx.params.editing=true;
  return TP.sheet('checkouttaxedit');
});
TP.sheetDef('checkouttaxpicker',{
  group:'during',title:'เลือกข้อมูลใบกำกับภาษี',hidden:true,host:'room',tall:true,
  render:ctx=>receiptTaxPicker(ctx.S).replaceAll('rcTaxPickerChoose','payTaxPickerChoose').replaceAll('rcTaxPickerAdd','payTaxPickerAdd'),
  close(ctx){if(!ctx.params.editing)setTimeout(async()=>{await TP.sheet('pay');const body=$('.sh-b',TP.sheetOpen()?.el);if(body)body.scrollTop=ctx.S._checkoutTaxScroll||0;},450);}
});
TP.act('rcTaxPickOpen',()=>{TP.S._receiptTaxKind=TP.cur()?.ctx?.rc?.tax?.who||'me';return TP.sheet('receipttaxpicker');});
TP.act('receiptTaxKind',b=>{TP.S._receiptTaxKind=b.dataset.v;const sheet=TP.sheetOpen(),body=$('.sh-b',sheet.el);body.innerHTML=receiptTaxPicker(TP.S);if(sheet.id==='checkouttaxpicker')body.innerHTML=body.innerHTML.replaceAll('rcTaxPickerChoose','payTaxPickerChoose').replaceAll('rcTaxPickerAdd','payTaxPickerAdd');TP.icons(body);});
TP.act('rcTaxPickerChoose',async b=>{
  const o=TP.cur()?.ctx?.rc,kind=b.dataset.v,record=TP.taxRecords(kind).find(r=>r.profileKey===b.dataset.key);
  if(!o||!record)return;
  TP.taxChoose(kind,record.profileKey);Object.assign(o.tax,{who:kind,want:true});
  await TP.closeSheet();await TP.refresh({anim:false});
});
TP.act('rcTaxPickerAdd',()=>{const d=taxProfileDraft(TP.S);d.kind=TP.S._receiptTaxKind||'me';d.editKey=null;d.errors={};d.drafts[d.kind]=taxProfileEntry(null,{},d.kind==='co');return TP.sheet('receiptprofile');});
TP.sheetDef('receipttaxpicker',{
  group:'after',title:'เลือกข้อมูลใบกำกับภาษี',code:'C421',host:'receipt',tall:true,
  states:[['person','เลือกบุคคลธรรมดา'],['company','เลือกนิติบุคคล'],['empty','ยังไม่มีข้อมูลผู้รับ']],
  notes:['ใช้รายการผู้รับเดียวกับ C518 แยกบุคคลธรรมดาและนิติบุคคล','กดการ์ดเพื่อเลือกและกลับมาแสดงข้อมูลใน C402 ยังไม่ส่งคำขอจนกดส่งคำขอ','เพิ่มข้อมูลด้วยฟอร์มเดิม ไม่มีปุ่มลบในจุดเลือกผู้รับ','ปิดโดยไม่เลือก คงผู้รับและคำขอเดิม'],
  prep(S){const kind=S.st.receipttaxpicker==='company'?'co':'me';S._receiptTaxKind=kind;const d=taxProfileDraft(S);d.previewLists={[kind]:S.st.receipttaxpicker==='empty'?[]:[{...taxProfilePreview(kind),profileKey:'picker-1'},{...taxProfilePreview(kind),profileKey:'picker-2',detail:'12 ถนนสุขใจ',addr:'12 ถนนสุขใจ คลองเตย กรุงเทพมหานคร 10110'}]};},
  render:ctx=>receiptTaxPicker(ctx.S)
});
const taxProfileRecord = (S,d) => TP.taxRecords(d.kind,S).find(r=>r.profileKey===d.editKey) || TP.taxSelected(d.kind,S);
const TAX_LONG_FIELDS=['name','business','first','last','detail'];
const TAX_PLACEHOLDERS={name:'เช่น บริษัท ตัวอย่าง จำกัด',business:'เช่น ร้านตัวอย่าง',first:'เช่น สมใจ',last:'เช่น ใจดี',id:'ตัวเลข 13 หลัก',phone:'เช่น 0812345678',detail:'เช่น 88/12',village:'เช่น หมู่บ้านตัวอย่าง อาคาร A',alley:'เช่น ซอยตัวอย่าง',road:'เช่น ถนนตัวอย่าง',prov:'เช่น กรุงเทพมหานคร',amp:'เช่น คลองเตย',dist:'เช่น คลองเตย',zip:'เช่น 10110'};
function taxProfileForm(S, sheet=false, allowDelete=false) {
  const d=taxProfileDraft(S), co=d.kind==='co', f=d.drafts[d.kind], bind=key=>`_taxProfile.drafts.${d.kind}.${key}`;
    const field=(key,label,o={})=>{
      const id='tax-profile-'+key,error=d.errors[key],attrs=`id="${id}" class="input" data-bind="${bind(key)}" aria-invalid="${!!error}" aria-describedby="${id}-error" ${o.optional?'':'required aria-required="true"'}`;
      return `<div class="field${error?' err':''}"><label for="${id}">${esc(label)} ${o.optional?'<span class="opt-t">(ไม่บังคับ)</span>':'<span class="reg-required" aria-hidden="true">*</span>'}</label><input ${attrs} value="${esc(f[key])}" placeholder="${key==='zip'&&o.readonly?'ระบบจะเติมให้เมื่อเลือกตำบล':TAX_PLACEHOLDERS[key]}" ${key==='id'?'inputmode="numeric" maxlength="17"':key==='phone'?'type="tel" inputmode="tel" maxlength="15"':key==='zip'?'inputmode="numeric" maxlength="5"':TAX_LONG_FIELDS.includes(key)?'maxlength="500"':''} ${o.readonly?'readonly':''}><p class="err-t" id="${id}-error" role="alert" ${error?'':'hidden'}>${esc(error||'')}</p></div>`;
    };
    const select=(key,label)=>`<div class="field${d.errors[key]?' err':''}"><label for="tax-profile-${key}">${label} <span class="reg-required" aria-hidden="true">*</span></label><select class="input" id="tax-profile-${key}" required aria-required="true" aria-describedby="tax-profile-${key}-error" aria-invalid="${!!d.errors[key]}" disabled><option value="">เลือก${label}</option></select><p class="err-t" id="tax-profile-${key}-error" role="alert" ${d.errors[key]?'':'hidden'}>${esc(d.errors[key]||'')}</p></div>`;
    const area=f.mode==='select'?`${select('prov','จังหวัด')}${select('amp','อำเภอ / เขต')}${select('dist','ตำบล / แขวง')}${field('zip','รหัสไปรษณีย์',{readonly:true})}<p class="hint" id="taxAddressStatus" role="status">กำลังโหลดข้อมูลพื้นที่</p><button type="button" class="txtbtn" id="taxAddressRetry" hidden>โหลดข้อมูลที่อยู่อีกครั้ง</button><button type="button" class="txtbtn" id="taxAddressManual" data-a="taxProfileAddressMode" data-v="manual" hidden>กรอกข้อมูลที่อยู่เอง</button>`:`${field('prov','จังหวัด')}${field('amp','อำเภอ / เขต')}${field('dist','ตำบล / แขวง')}${field('zip','รหัสไปรษณีย์')}`;
    return `<div class="registration-page tax-profile">${allowDelete?`<p class="hint">ออกใบกำกับภาษีในนาม <b>${co?'นิติบุคคล':'บุคคลธรรมดา'}</b></p>`:''}${co?`${field('name','ชื่อนิติบุคคล')}${field('business','ชื่อธุรกิจ')}`:`${field('first','ชื่อ')}${field('last','นามสกุล')}`}${field('id',co?'เลขประจำตัวผู้เสียภาษี':'เลขประจำตัวประชาชน')}${field('phone','เบอร์โทรศัพท์')}${field('detail','ที่อยู่ (เลขที่)')}${field('village','หมู่บ้าน / อาคาร',{optional:true})}${field('alley','ตรอก / ซอย',{optional:true})}${field('road','ถนน',{optional:true})}${area}<div class="tax-form-actions">${sheet?ui.btn('ยกเลิก',{kind:'secondary',closeSheet:true}):''}${ui.btn('บันทึกข้อมูล',{a:'taxProfileSave'})}</div>${allowDelete&&d.editKey?`<div class="tax-edit-delete">${d.deleteConfirm?`<p>ลบข้อมูลผู้รับรายการนี้หรือไม่?</p><p class="small">ใบกำกับภาษีที่ขอไว้แล้วจะยังคงเดิม</p><div class="tax-form-actions">${ui.btn('ยกเลิก',{kind:'secondary',a:'taxProfileDeleteCancel'})}${ui.btn('ยืนยันลบ',{kind:'danger',a:'taxProfileDelete'})}</div>`:ui.btn('ลบข้อมูลผู้รับนี้',{kind:'danger-line',icon:'trash',a:'taxProfileDeleteAsk'})}</div>`:''}</div>`;
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
  const d=taxProfileDraft(ctx.S), f=d.drafts[d.kind]; taxProfileFieldCheck(el,d); if(f.mode!=='select'||!$('#taxAddressStatus',el))return;
    const status=$('#taxAddressStatus',el), retry=$('#taxAddressRetry',el), manual=$('#taxAddressManual',el); let rows=[];
    const populate=()=>{
      for(const [key,label,column] of [['prov','จังหวัด','province'],['amp','อำเภอ / เขต','amphoe'],['dist','ตำบล / แขวง','district']]){
        const input=$('#tax-profile-'+key,el), choices=[...new Set(rows.filter(r=>key==='prov'||r.province===f.prov&&(key==='amp'||r.amphoe===f.amp)).map(r=>r[column]))].sort((a,b)=>a.localeCompare(b,'th'));
        input.innerHTML=`<option value="">เลือก${label}</option>`+choices.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join(''); input.value=f[key]; input.disabled=key==='amp'?!f.prov:key==='dist'?!f.amp:false; input.setAttribute('aria-invalid',String(!!d.errors[key])); const message=$('#tax-profile-'+key+'-error',el); message.hidden=!d.errors[key]; message.textContent=d.errors[key]||'';
      }
      const zip=$('#tax-profile-zip',el), zipError=$('#tax-profile-zip-error',el); zip.value=f.zip; zip.setAttribute('aria-invalid',String(!!d.errors.zip)); zipError.hidden=!d.errors.zip; zipError.textContent=d.errors.zip||'';
    };
    for(const key of ['prov','amp','dist'])$('#tax-profile-'+key,el).addEventListener('change',e=>{
      f[key]=e.target.value;
      if(key==='prov'){f.amp='';f.dist='';f.zip='';}else if(key==='amp'){f.dist='';f.zip='';}else{const row=rows.find(r=>r.province===f.prov&&r.amphoe===f.amp&&r.district===f.dist);f.zip=row?String(row.zipcode):'';}
      for(const k of ['prov','amp','dist','zip'])delete d.errors[k]; populate();
    });
    const load=async()=>{d.addressState='loading';retry.hidden=true;manual.hidden=true;status.textContent='กำลังโหลดข้อมูลพื้นที่';try{if(ctx.state==='address-error'||ctx.params?.addressError)throw Error('preview');rows=await TP.thaiAddressData.load();if(!el.isConnected)return;d.addressState='ready';populate();status.textContent='เลือกจังหวัด อำเภอ และตำบล ระบบจะเติมรหัสไปรษณีย์ให้';}catch{if(!el.isConnected)return;d.addressState='error';retry.hidden=false;manual.hidden=false;status.textContent='โหลดข้อมูลพื้นที่ไม่สำเร็จ ลองอีกครั้งหรือเลือกกรอกเอง';}};
    retry.addEventListener('click',load);load();
}
TP.screen('taxprofile', {
  group:'account', title:'ข้อมูลออกใบกำกับภาษี', code:'C518', parent:'account',
  states:[['normal','บุคคลธรรมดา'],['company','นิติบุคคล'],['empty','ยังไม่มีข้อมูล'],['address-error','โหลดข้อมูลที่อยู่ไม่สำเร็จ'],['saved-person','บันทึกบุคคลธรรมดาแล้ว'],['saved-company','บันทึกนิติบุคคลแล้ว'],['multiple-person','บุคคลธรรมดาหลายรายการ'],['multiple-company','นิติบุคคลหลายรายการ']],
  notes:['เมื่อไม่มีข้อมูลแสดง Empty พร้อมไอคอน กดเพิ่มข้อมูลจึงเปิดฟอร์ม ทั้งสองประเภทใช้รูปแบบเดียวกัน','การ์ดเรียงที่อยู่ โทรศัพท์ และเลขประจำตัวตามลำดับ','แต่ละประเภทเพิ่มผู้รับได้หลายรายการ แสดงการ์ดสั้นและเพิ่ม แก้ไข หรือลบเฉพาะรายการที่เลือก','ใช้ผู้รับชุดเดียวกับหน้าชำระเงินและใบเสร็จ โดยคำขอที่ส่งแล้วเก็บสำเนาข้อมูล ณ เวลาส่ง','ข้อมูลตัวอย่างในต้นแบบยังไม่ส่งให้ร้านหรือออกใบกำกับภาษีจริง'],
  prep(S) {
    const state=S.st.taxprofile; if(state==='normal' && !S._taxProfileMockInitialized){if(!S.taxWho) S.taxWho=taxProfilePreview('me'); S._taxProfileMockInitialized=true;} S._taxProfile=null; const d=taxProfileDraft(S);
    if(state==='company'||state==='saved-company'||state==='multiple-company')d.kind='co';
    if(state==='empty'){d.previewLists={me:[],co:[]};d.drafts.me=taxProfileEntry(null,{},false);}
    if(state==='saved-person'||state==='saved-company'){d.preview={[d.kind]:taxProfilePreview(d.kind)};d.drafts[d.kind]=taxProfileEntry(d.preview[d.kind],S.user,d.kind==='co');}
    if(state==='multiple-person'||state==='multiple-company'){const kind=d.kind,base=taxProfilePreview(kind);d.previewLists={[kind]:[{...base,profileKey:'example-1'},{...base,profileKey:'example-2',name:kind==='co'?'บริษัท มิตรสุข จำกัด':'สมใจ ใจดี',detail:'12',alley:'',road:'ถนนสุขใจ',addr:'12 ถนนสุขใจ แขวงคลองตัน เขตคลองเตย กรุงเทพมหานคร 10110'}]};}
  },
  render(ctx) {
    const d=taxProfileDraft(ctx.S), records=TP.taxRecords(d.kind,ctx.S);
    return ui.nav({back:true,title:'ข้อมูลออกใบกำกับภาษี'})+ui.page(`<div class="tax-profile-page">${ui.seg('taxProfileKind',[['me','บุคคลธรรมดา'],['co','นิติบุคคล']],d.kind,{a:'taxProfileKind',label:'ประเภทผู้รับใบกำกับภาษี'})}<div class="tax-profile-list-head"><h3 class="h3">ข้อมูลที่บันทึกไว้ <span class="small">(${records.length})</span></h3>${ui.btn('เพิ่มข้อมูล',{kind:'secondary',icon:'plus',a:'taxProfileAdd'})}</div><div class="tax-profile-list">${records.length?records.map(rec=>taxProfileCard(rec,d.kind==='co')).join(''):`<div class="rc-tax-empty tax-profile-empty">${ui.emptyArt('file-text')}<b>ยังไม่มีข้อมูล${d.kind==='co'?'นิติบุคคล':'บุคคลธรรมดา'}</b><p class="small">กดเพิ่มข้อมูลเพื่อบันทึกผู้รับใบกำกับภาษี</p></div>`}</div></div>`);
  },
  mount(el,ctx){taxProfileMount(el,ctx);if(ctx.state==='address-error'){const d=taxProfileDraft(ctx.S);d.editKey=null;d.drafts[d.kind]=taxProfileEntry(null,ctx.S.user,d.kind==='co');TP.sheet('taxprofileedit',{addressError:true});}}
});
TP.sheetDef('taxprofileedit',{
  group:'account',title:'แก้ไขข้อมูลออกใบกำกับภาษี',sheetTitle:ctx=>(taxProfileDraft(ctx.S).editKey?'แก้ไข':'เพิ่ม')+'ข้อมูลออกใบกำกับภาษี',code:'C519',host:'taxprofile',tall:true,
  states:[['person','แก้ไขบุคคลธรรมดา'],['company','แก้ไขนิติบุคคล'],['add-person','เพิ่มบุคคลธรรมดา'],['add-company','เพิ่มนิติบุคคล'],['invalid-person','ไม่กรอกข้อมูลบังคับ · บุคคลธรรมดา'],['invalid-company','ไม่กรอกข้อมูลบังคับ · นิติบุคคล'],['invalid-format','เลขประจำตัวประชาชนและเบอร์ผิดรูปแบบ']],
  previewMock:taxProfileMock,
  notes:['ช่องตามสเปกเว็บเดิม: นิติบุคคลใช้ชื่อนิติบุคคล ชื่อธุรกิจ เลขผู้เสียภาษี 13 หลัก ส่วนบุคคลธรรมดาใช้ชื่อ นามสกุล เลขประจำตัวประชาชนที่ถูกต้อง','ไม่มีช่องสาขาตามสเปก ต้องให้นักบัญชียืนยันก่อนใช้จริง','กดเพิ่มข้อมูลใน C518 เปิดฟอร์มว่าง กดแก้ไขบนการ์ดเปิดฟอร์มพร้อมข้อมูลเดิม','ตรวจแต่ละช่องเมื่อออกจากช่องและก่อนบันทึก แก้ถูกแล้วข้อความหายทันที ข้อมูลที่กรอกไม่หาย','แก้ไขเฉพาะข้อมูลประเภทที่เลือก','ยกเลิกหรือปิดหน้าต่างโดยไม่เปลี่ยนข้อมูลที่บันทึกไว้'],
  prep(S){const d=taxProfileDraft(S),st=S.st.taxprofileedit;d.kind=['company','add-company','invalid-company'].includes(st)?'co':'me';d.errors={};if(st?.startsWith('add-')||st?.startsWith('invalid-')){d.editKey=null;const f=d.drafts[d.kind]=taxProfileEntry(st==='invalid-format'?taxProfilePreview(d.kind):null,{},d.kind==='co');if(st==='invalid-format')Object.assign(f,{id:'1234567890123',phone:'12'});if(st.startsWith('invalid-'))d.errors=taxProfileErrors(d,{skipLoad:true});return;}d.preview={[d.kind]:{...taxProfilePreview(d.kind),profileKey:'preview-'+d.kind}};d.editKey=d.preview[d.kind].profileKey;d.drafts[d.kind]=taxProfileEntry(d.preview[d.kind],S.user,d.kind==='co');},
  render:ctx=>taxProfileForm(ctx.S,true,true),mount:taxProfileMount,
  close(ctx){const d=taxProfileDraft(ctx.S);d.errors={};d.drafts[d.kind]=taxProfileEntry(taxProfileRecord(ctx.S,d),ctx.S.user,d.kind==='co');}
});
TP.act('payTaxEditProfile',()=>{const S=TP.S,d=taxProfileDraft(S),pay=S.pay;d.kind=pay?.taxWho||'me';d.editKey=TP.taxSelected(d.kind)?.profileKey;d.errors={};d.drafts[d.kind]=taxProfileEntry(TP.taxSelected(d.kind),S.user,d.kind==='co');S._checkoutTaxScroll=$('.sh-b',TP.sheetOpen()?.el)?.scrollTop||0;return TP.sheet('checkouttaxedit');});
TP.sheetDef('checkouttaxedit',{group:'during',title:'แก้ไขข้อมูลออกใบกำกับภาษี',hidden:true,host:'room',tall:true,render:ctx=>taxProfileForm(ctx.S,true),mount:taxProfileMount,close(ctx){const d=taxProfileDraft(ctx.S);d.errors={};d.drafts[d.kind]=taxProfileEntry(d.kind==='co'?ctx.S.taxCo:ctx.S.taxWho,ctx.S.user,d.kind==='co');setTimeout(async()=>{await TP.sheet('pay');const body=$('.sh-b',TP.sheetOpen()?.el);if(body)body.scrollTop=ctx.S._checkoutTaxScroll||0;},450);}});
TP.act('rcProfileNew',()=>{const d=taxProfileDraft(TP.S),o=TP.cur()?.ctx?.rc;d.kind=o?.tax?.who||'me';d.editKey=null;d.errors={};d.drafts.me=taxProfileEntry(TP.S._taxProfile?.preview?.me||TP.S.taxWho,TP.S.user,false);d.drafts.co=taxProfileEntry(TP.S._taxProfile?.preview?.co||TP.S.taxCo,TP.S.user,true);return TP.sheet('receiptprofile');});
TP.act('rcProfileEdit',b=>{const S=TP.S,d=taxProfileDraft(S);d.kind=b.dataset.v;d.editKey=TP.taxSelected(d.kind)?.profileKey;d.errors={};d.drafts[d.kind]=taxProfileEntry(TP.taxSelected(d.kind),S.user,d.kind==='co');return TP.sheet('receiptprofile');});
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
  const name=co?f.name.trim():`${f.first.trim()} ${f.last.trim()}`,addr=[f.detail.trim(),f.village.trim(),f.alley.trim(),f.road.trim(),f.dist.trim(),f.amp.trim(),f.prov.trim(),f.zip.trim(),f.country.trim()].filter(Boolean).join(' ');
  const rec={profileKey:d.editKey||('tax-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)),name,business:f.business.trim(),id,phone,kind:co?'นิติบุคคล':'บุคคลธรรมดา',first:f.first.trim(),last:f.last.trim(),addressMode:f.mode,country:f.country.trim(),prov:f.prov.trim(),amp:f.amp.trim(),dist:f.dist.trim(),zip:f.zip.trim(),detail:f.detail.trim(),village:f.village.trim(),alley:f.alley.trim(),road:f.road.trim(),addr};
  const rows=TP.taxRecords(d.kind,S),index=rows.findIndex(r=>r.profileKey===d.editKey);if(index>=0)rows[index]=rec;else rows.push(rec);if(d.preview?.[d.kind]){d.previewLists||={};d.previewLists[d.kind]=rows;delete d.preview[d.kind];}TP.taxChoose(d.kind,rec.profileKey,S);d.editKey=rec.profileKey;S.rcNoAddr=false;S._taxProfileMockInitialized=true;
  if(TP.sheetOpen()?.id==='receiptprofile'){const order=TP.cur()?.ctx?.rc;if(order?.tax)Object.assign(order.tax,{who:d.kind,want:true});}
  if(TP.sheetOpen()?.id==='checkouttaxedit')Object.assign(S.pay,{taxWho:d.kind,taxWant:true});
  TP.emit('state');if(['taxprofileedit','receiptprofile','checkouttaxedit'].includes(TP.sheetOpen()?.id))await TP.closeSheet();await TP.refresh({anim:false});TP.notify('บันทึกข้อมูลแล้ว',{icon:'circle-check'});
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
const phAlg = d => d.algPhSources ? Object.keys(d.algPhSources).filter(a=>d.allergies.includes(a)) : /^บันทึกโดย ภ/.test(d.algSrc || '') ? (d.algPh || []) : [];
function algEditor(d) {
  const none = d.allergyState === 'none', ph = phAlg(d);
  return `<div class="chips af-algs">${d.allergies.map(a => `<span class="chip af-chip${ph.includes(a) ? ' af-chip-ph' : ''}"><span>${esc(a)}${ph.includes(a) ? `<small>${esc(d.algPhSources?.[a]||d.algSrc)}</small>` : ''}</span><button type="button" class="af-x" data-a="afAlgRm" data-v="${esc(a)}" aria-label="ลบ ${esc(a)}">${ic('x', 14, 2.4)}</button></span>`).join('') || (none ? ui.tag('ไม่มีประวัติแพ้ยา', 'ok') : ui.tag('ยังไม่ได้ระบุ', 'warn'))}</div>
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
  group: 'account', title: 'ลบแพ้ยาที่เภสัชกรบันทึก', code: 'C513', hidden:true, disabled:true, host: 'health',
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
 states:[['normal','ดูข้อมูลสุขภาพ'],['unknown','ยังไม่ระบุ'],['sfx','ข้อมูลเดิมที่ผู้ใช้ระบุ', false],['edit','แก้ไขข้อมูล',false],['none','ระบุว่าไม่มี'],['invalid','แก้ไขข้อมูลไม่ครบ',false],['long-text','ข้อมูลหลายรายการ']],
 notes:['หน้าสรุปเป็นรายการพื้นขาวแบ่งหมวดด้วยเส้นบาง น้ำหนักและส่วนสูงแยกคนละบรรทัด กดดินสอเพื่อแก้เฉพาะหมวดในแผ่นแก้ไข','แสดงเฉพาะข้อมูลสุขภาพที่ผู้ใช้กรอกเอง ไม่มีการ์ดบันทึกจากเภสัชกร','ยังไม่ทราบต่างจากไม่มี ไม่เติมโรคประจำตัวเมื่อไม่มีข้อมูล','ยาที่ใช้ประจำ โรคประจำตัว แพ้อาหาร ใช้ไม่มี/ยังไม่ทราบ/ระบุข้อมูลแบบตอนสมัคร','ข้อมูลแพ้ยาเป็นข้อมูลที่ผู้ใช้พิมพ์เอง แก้ไขและบันทึกได้เหมือนหมวดอื่น ไม่ขึ้นกล่องยืนยันเภสัชกร'],
 prep(S){
  const st=S.st.health;if(!st)return;
  const f=TP.fresh().user;
  Object.assign(S.user,{allergies:[...(f.allergies||[])],allergySrc:f.allergySrc||'',allergySources:undefined,allergyState:f.allergyState||'unknown',meds:[...(f.meds||[])],medState:f.meds?.length?'set':'unknown',conditions:['ความดันโลหิตสูง'],conditionState:'set',condNone:false,food:'',foodNone:true,foodState:'none',weight:f.weight??'',height:f.height??160,sfx:st==='sfx'?[SFX_CPM]:[]});
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
 mount(el){wireEnter(el);el.addEventListener('input',event=>{const key=event.target.dataset?.hdText,d=TP.S._dr;if(key&&d?.form==='health'&&d.health[key])d.health[key].text=event.target.value;});}
});
TP.act('afHdEdit',async()=>{const entry=TP.cur();if(entry?.id!=='health')return;TP.S._dr=null;delete entry.params._k;entry.params.healthEdit=true;await TP.refresh({anim:false});});
TP.act('afHdCancel',async()=>{const entry=TP.cur();if(entry?.id!=='health'||TP.S._dr?.busy)return;TP.S._dr=null;delete entry.params._k;entry.params.healthEdit=false;await TP.refresh({anim:false});});
TP.act('afHdMode',async t=>{const d=TP.S._dr,key=t.closest('[data-segname]')?.dataset.segname.replace(/^hd-/,'');if(d?.form!=='health'||!d.health[key]||!['unknown','none','set'].includes(t.dataset.v))return;d.health[key].mode=t.dataset.v;delete d.errors[key];await TP.refresh({anim:false});});
/* Legacy household controls still use the shared draft helpers. */
TP.act('afCond',()=>{const d=TP.S._dr,el=curEl();if(!d||!el)return;d.conds=ui.chipVals(el,'afCond');if(d.conds.length&&d.condNone){d.condNone=false;$('#afCondNone',el)?.setAttribute('aria-checked','false');}});
TP.act('afCondNone',t=>{const d=TP.S._dr,el=curEl();if(!d||!el)return;d.condNone=t.getAttribute('aria-checked')==='true';if(d.condNone){d.conds=[];$$('[data-chips="afCond"] .chip',el).forEach(c=>c.setAttribute('aria-pressed','false'));}});
TP.act('afFoodLive',()=>{const d=TP.S._dr,el=curEl();if(!d||!el)return;if(String(d.food||'').trim()&&d.foodNone){d.foodNone=false;$('#afFoodNone',el)?.setAttribute('aria-checked','false');}});
TP.act('afFoodNone',t=>{const d=TP.S._dr,el=curEl();if(!d||!el)return;d.foodNone=t.getAttribute('aria-checked')==='true';if(d.foodNone){d.food='';const i=$('#afFood',el);if(i)i.value='';}});
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
  TP.S._pf = { first: u.name || first || '', last: u.last || rest.join(' '), year: String(u.born || u.birthYear || ''), sex: u.sex || 'none' };
  TP.go('profile', { params: { edit: 1 } });
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
  Object.assign(S,{loggedIn:false,consent:false,history:[],family:[],inbox:[],case:null,notif:false,_delTxt:'',_dr:null,_adr:null,_adrSent:null,_adrDrafts:{},adrReports:[],_clog:[],addrs:[],follow:null,_gone:true});
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
const SRC = { id: 'TC-261016-0058', date: '16/10/2026', time: '10:20', note: 'มีไข้ ไอ และน้ำมูกมา 2 วัน', topic: 'ไข้ ไอ น้ำมูก', sym: ['ไข้', 'ไอ', 'น้ำมูก คัดจมูก'], branch: 'tw', pharm: 'kj', who: 'me', bought: 190 };
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
    { id: 'cough', image: '/assets/photos/cough-syrup-mock-v1.png', name: 'ยาแก้ไอ ชนิดน้ำ', dose: 'ครั้งละ 10 มล.', slots: ['m', 'n', 'e'], meal: 'หลังอาหาร' },
    { id: 'spray', name: 'สเปรย์พ่นคอ', dose: 'ใช้ตามฉลากตัวอย่าง', slots: ['m', 'n', 'e'] },
    { id: 'allergy', image: '/assets/photos/medicine-v1.png', name: 'ยาแก้แพ้ ลดน้ำมูก', dose: 'ครั้งละ 1 เม็ด', slots: ['b'], meal: '', tip: 'อาจทำให้ง่วง' },
    { id: 'para', name: 'พาราเซตามอล 500 มก.', dose: 'ครั้งละ 1 เม็ด', prn: 'เมื่อมีไข้', gap: 6, max: 4 }
  ], { today: 3, startAt: '10:30', ask: st === 'endonly' ? 'end' : 'both' });
  const take = (d, s, m, t) => { p.log[`${d}|${s}|${m}`] = { t }; if (m === 'cough') p.log[`${d}|${s}|spray`] = { t }; };
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
const srcOf = c => ({ id: c.id, caseCode: TP.caseCode(c), note: c.note, date: TP.NOW.date, time: c.joinedAt || TP.NOW.time, topic: (c.symptoms || []).join(' ') || 'ถามเรื่องยา', sym: [...(c.symptoms || [])], branch: c.branch || 'tw', pharm: c.pharm || 'kj', who: c.who || 'me', bought: 0 });
/* panel mocks: d3 = consulted this morning, asks in 3 days · d1 = consulted yesterday, asks today 19:00 */
const SYM_SRC = {
  d3: { id: 'TC-261018-0098', date: '18/10/2026', time: '10:40', note: 'ปวดหัวช่วงบ่าย นอนน้อยมา 2 คืน', topic: 'ปวดหัว', sym: ['ปวดหัว'], branch: 'tw', pharm: 'kj', who: 'me', bought: 0 },
  d1: { id: 'TC-261017-0063', date: '17/10/2026', time: '18:30', note: 'ถ่ายเหลว 2 ครั้งตั้งแต่เช้า', topic: 'ท้องเสีย', sym: ['ท้องเสีย'], branch: 'tw', pharm: 'kj', who: 'me', bought: 0 }
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
const medFrom = (it, i) => { const k = KNOWN[it.name]; const med = { id: 'm' + i, name: it.name, image: it.image }; return k ? { ...med, ...k } : { ...med, info: it.how || 'ใช้ตามฉลาก' }; };
function dayOnePlan(c) {
  const items = c?.order?.items?.length ? c.order.items : TP.ORDER_ITEMS;
  const src = c ? { id: c.id, caseCode: TP.caseCode(c), note: c.note, date: TP.NOW.date, time: c.joinedAt || TP.NOW.time, topic: (c.symptoms || []).join(' ') || 'ถามเรื่องยา', sym: [...(c.symptoms || [])], branch: c.branch || 'tw', pharm: c.pharm || 'kj', who: c.who || 'me' }
    : { id: 'TC-261018-0142', date: TP.NOW.date, time: TP.NOW.time, note: 'มีไข้และเจ็บคอมา 2 วัน', topic: 'ไข้ เจ็บคอ', sym: ['ไข้', 'เจ็บคอ'], branch: 'tw', pharm: 'kj', who: 'me' };
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
  S.history.unshift({ id: src.id, caseCode: TP.caseCode(src), note: src.note, date: src.date, time: src.time, who: src.who, topic: src.topic, branch: src.branch, pharm: src.pharm, bought: src.bought || 0, rated: 0, summary: true });
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
  return '';
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
function followHeroHtml(S, p) {
  const sched = hasSched(p), nx = upNext(p), on = p.remind && S.notif, ds = daySlots(p, p.today);
  const cur = ds.find(x => x.st === 'now'), left = ds.filter(x => x.st !== 'taken').length;
  const segs = Array.from({ length: p.days }, (_, i) => `<i class="${i + 1 < p.today ? 'on' : i + 1 === p.today ? 'cur' : ''}"></i>`).join('');
  const offTxt = !p.remind ? 'ปิดเตือนกินยาอยู่ จะไม่มีแจ้งเตือน' : 'การแจ้งเตือนของแอปปิดอยู่ จะไม่มีเสียงเตือน';
  let k, big, sub, act = '';
  if (!sched) { k = 'ยาชุดนี้'; big = 'กินเมื่อมีอาการ'; sub = 'ไม่ต้องกินตามเวลา จึงไม่มีแจ้งเตือน'; }
  else if (cur) {
    /* the reminder just went off: one tap right here too */
    k = 'ถึงเวลาตามแผน'; big = `${SLOT[cur.s][0]} ${p.times[cur.s]}`; sub = 'แตะ “กินแล้ว” หลังใช้ยามื้อนี้';
    act = `<button type="button" class="fu-take go fu-take-l" data-a="fuTake" data-v="${p.today}|${cur.s}" aria-pressed="false" aria-label="${esc(`มื้อ${SLOT[cur.s][0]} ${p.times[cur.s]} แตะเมื่อกินแล้ว`)}">${ic('check', 18, 2.4)}<span>กินแล้ว</span></button>`;
  } else if (nx) {
    k = `มื้อถัดไป${nx.day === p.today ? '' : nx.day === p.today + 1 ? ' · พรุ่งนี้' : ` · วันที่ ${nx.day}`}`;
    big = `${SLOT[nx.s][0]} ${p.times[nx.s]}`;
    sub = on ? '' : offTxt;
  } else if (left) { k = 'วันสุดท้ายของคอร์ส'; big = `ยังไม่ได้บันทึก ${left} มื้อ`; sub = 'กินแล้วแตะ กินแล้ว ที่มื้อนั้นด้านล่าง'; }
  else { k = 'วันนี้'; big = 'บันทึกครบทุกมื้อ'; sub = 'วันนี้เป็นวันสุดท้ายของคอร์ส'; }
  return `<section class="card fu-hero fu-dose-overview${cur ? ' now' : ''}" data-in="1" aria-label="${esc(k)}">
    <div class="fu-dose-main">
      <img class="fu-dose-art" src="/assets/follow/medication-dose-illustration.png" alt="" width="360" height="360">
      <div class="fu-dose-copy">
        <span class="fu-k">${esc(k)}</span>
        <b class="fu-big">${esc(big)}</b>
        ${sub ? `<span class="fu-s1">${ic(!sched ? 'pill' : on ? 'bell-ring' : 'bell-off', 15, 2)}<span>${esc(sub)}</span></span>` : ''}
        ${act ? `<div class="fu-hero-a">${act}</div>` : ''}
      </div>
    </div>
    <div class="fu-dose-progress">
      <div class="fu-dose-progress-label"><b>วันที่ ${p.today} จาก ${p.days}</b><span>วันสุดท้าย ${esc(dateOf(p, p.days))}</span></div>
      <div class="fu-segs" aria-hidden="true">${segs}</div>
    </div>
    <button type="button" class="fu-source-link" data-a="fuOpenSummary">
      ${ic('file-text', 18, 2)}<span>ดูใบสรุปการปรึกษา</span>${ic('chevron-right', 18, 2)}
    </button>
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
    <p class="fu-cap" id="fuAskH">${ic('message-circle', 16, 2)}<span>${esc(ph(p).short)} · นัดติดตามอาการ</span></p>
    <ol class="fu-ckl">${rows.join('')}</ol>
    ${due ? `<div class="mt12">${ui.btn('บอกอาการกลางคอร์ส', { a: 'fuAsk', p: { at: 'mid' }, icon: 'message-circle' })}</div><p class="small mt8">${now() < p.askAt ? `แจ้งเตือนเวลา ${p.askAt} ตอบก่อนได้ · ` : ''}เลือกคำตอบที่ตรงกับอาการตอนนี้</p>` : `<p class="small mt8">ดูวันและเวลานัดด้านบน</p>`}
  </section>`;
}
function slotRow(p, s) {
  const st = slotState(p, p.today, s), ms = medsAt(p, s), at = takenAt(p, p.today, s), k = `${p.today}|${s}`;
  const meds = ms.map(m => `<span class="fu-med fu-med-with-photo">${TP.medicineImage(m) || `<span class="fu-med-placeholder" aria-hidden="true">${ic(m.id === 'cough' ? 'flask-conical' : 'pill',18,1.8)}</span>`}<span><strong>${esc(m.name)}</strong><span>${esc(`${m.dose}${m.meal ? ' ' + m.meal : ''}${m.tip ? ' · ' + m.tip : ''}`)}</span></span></span>`).join('');
  const line = st === 'taken' ? `<span class="fu-st ok">${ic('clock', 15, 2.2)}กินตอน ${esc(at)}</span>`
    : st === 'now' ? `<span class="fu-st now">${ic('bell-ring', 15, 2.2)}ถึงเวลาแล้ว</span>`
    : st === 'late' ? `<span class="fu-st warn">${ic('triangle-alert', 15, 2.2)}เลยเวลา · ยังไม่ได้บันทึก</span>` : '';
  const lbl = st === 'taken' ? `มื้อ${SLOT[s][0]} กินแล้ว ${at} แตะเพื่อยกเลิก` : `มื้อ${SLOT[s][0]} ${p.times[s]} แตะเมื่อกินแล้ว`;
  return `<div class="fu-srow fu-meal ${st}" data-meal="${s}"><span class="fu-slot-i">${ic(SLOT[s][1], 18, 2)}</span>
    <div class="grow"><b>มื้อ${SLOT[s][0]} <span class="num">· ${esc(p.times[s])}</span></b>${line}</div>
    <button type="button" class="fu-take${st === 'now' || st === 'late' ? ' go' : ''}" data-a="fuTake" data-v="${k}" aria-pressed="${st === 'taken'}" aria-label="${esc(lbl)}">${st === 'taken' ? ic('check', 17, 2.6) : ''}<span>กินแล้ว</span></button><div class="fu-meal-meds">${meds}</div>${st === 'late' ? `<p class="fu-miss">${ic('info', 15, 2.2)}<span>ดูคำแนะนำเฉพาะยาบนฉลาก หรือสอบถามเภสัชกร</span></p>` : ''}</div>`;
}
function prnRow(p, m) {
  const k = `${p.today}|${m.id}`, list = p.prn[k] || [], last = list[list.length - 1];
  const nextT = last ? addH(last, m.gap) : '', full = list.length >= m.max, wait = !!last && (!nextT || toM(nextT) > toM(now()));
  const why = full ? `ครบ ${m.max} ครั้งของวันนี้แล้ว` : wait ? (nextT ? `กินครั้งถัดไปได้หลัง ${nextT}` : 'กินครั้งถัดไปได้พรุ่งนี้') : '';
  return `<section class="card pad0 fu-prn-card">
    <header class="fu-prn-header"><span class="fu-slot-i">${ic('pill',18,2)}</span><b>${esc(m.name)}</b></header>
    <div class="fu-prn-body">${TP.medicineImage(m) || ic('pill',20,2)}<div><p>${esc(`${m.dose} ${m.prn}`)}</p><p>${esc(`ห่างกันอย่างน้อย ${m.gap} ชั่วโมง ไม่เกิน ${m.max} ครั้งต่อวัน`)}</p>
    <p class="small">${ic('clock',15,2)} ${list.length ? `วันนี้กิน ${list.length} ครั้ง · ล่าสุด ${esc(last)}` : 'วันนี้ยังไม่ได้กิน'}${why ? ` · ${esc(why)}` : ''}</p></div></div>
    ${list.length ? `<div class="fu-prn-body"><button type="button" class="fu-undo" data-a="fuPrnUndo" data-v="${esc(k)}">ลบครั้งล่าสุด</button></div>` : ''}<footer class="fu-multi-actions">${ui.btn('แจ้งอาการ', { go: 'adr', kind: 'secondary', icon: 'triangle-alert' })}<button type="button" class="btn secondary" data-a="fuPrn" data-v="${esc(k)}"${full || wait ? ' disabled' : ''} aria-label="${esc(`${m.name} ${why || 'แตะเมื่อกินแล้ว'}`)}"><span>กินแล้ว</span></button></footer></section>`;
}
function todayHtml(p) {
  const slots = slotsOn(p, p.today), prn = p.meds.filter(m => m.prn), info = p.meds.filter(m => m.info);
  const tk = daySlots(p, p.today).filter(x => x.st === 'taken').length;
  const start = p.today === 1 && p.startAt && slots.length ? ` · เริ่มมื้อ${SLOT[slots[0]][0]}วันนี้` : '';
  return `${ui.secH('รายการยาวันนี้', { din: 3 })}<p class="fu-date" data-in="3">${esc(dateOf(p, p.today))}${slots.length ? ` · กินแล้ว ${tk} จาก ${slots.length} มื้อ` : ''}${esc(start)}</p>
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
  const rows = [ui.row({ icon: 'history', title: 'บันทึกการกินยา', sub: 'ดูมื้อที่บันทึกและคำตอบเรื่องอาการ', go: 'fulog' })];

  if (inHist(S, p.src.id)) rows.push(ui.row({ icon: 'file-text', title: 'ใบสรุปการปรึกษา', sub: `${p.src.date} · วิธีใช้ยาทุกตัว`, go: 'summary', p: { id: p.src.id } }));
  const settings = p.on && !p.end ? ui.group([
    ui.row({ icon: 'bell-off', title: 'หยุดติดตาม', sub: 'ปิดการเตือนกินยาและการถามอาการ', sheet: 'fuoff', chev: false })
  ], { title: 'จัดการการติดตาม', rv: true }) : '';
  const symptomRows = active(p) && !p.waitRecv ? [
    ui.row({ icon: 'message-circle', title: 'บอกอาการเพิ่มเติม', sub: 'แจ้งเมื่ออาการเปลี่ยนหรือมีอาการใหม่', a: 'fuAsk' })
  ] : [];
  return ui.group([...symptomRows, adrRow(S, p)], { title: 'แจ้งอาการ', rv: true })
    + ui.group(rows, { title: 'บันทึกและคำแนะนำ', rv: true }) + settings;
}
const remNote = (html, label, a) => `<div class="fu-mb" data-in="1">${ui.note(html, { icon: 'bell-off' })}<div class="mt8">${ui.btn(label, { kind: 'tint', sm: true, icon: 'bell', a })}</div></div>`;
function bodyHtml(S, p, ctx) {
  const out = [];
  if (p.offline) out.push(`<div class="fu-mb" data-in="1">${ui.note('<b>ไม่มีอินเทอร์เน็ต</b><br>ยังบันทึกการใช้ยาในเครื่องได้ การส่งคำตอบต้องเชื่อมต่ออินเทอร์เน็ต', { tone: 'warn', icon: 'wifi-off' })}</div>`);
  if (!active(p)) out.push(endCard(p));
  else {
    if (!S.notif) out.push(remNote('<b>การแจ้งเตือนของแอปปิดอยู่</b><br>ตั้งเวลาไว้แล้ว แต่จะไม่มีแจ้งเตือนกินยา', 'เปิดการแจ้งเตือน', 'fuNotifOn'));
    else if (hasSched(p) && !p.remind) out.push(remNote('<b>ปิดเตือนกินยาอยู่</b><br>กด กินแล้ว ได้ตามปกติ แต่จะไม่มีแจ้งเตือน', 'เปิดเตือนกินยา', 'fuRemOn'));
    const bad = recentBad(p), tk = recentTalked(p); if (bad) out.push(worseCard(S, p, bad)); else if (tk) out.push(talkedCard(S, p, tk));
    if (p.waitRecv) out.push(`<div class="card fu-wait" data-in="2"><p class="fu-exp">${ic('package', 18, 2)}<span>รอรับยา · เริ่มนับวันที่ 1 และเตือนกินยาเมื่อได้รับยา</span></p>${ui.btn('ได้รับยาแล้ว', { a: 'fuGot', icon: 'check', cls: 'mt12' })}</div>`);
    else {
      out.push(followMultiHtml(ctx));
    }
  }
  return out.join('');
}
/* item 82: C405 for the no-medicine plan - when the one question comes and how to answer, nothing about doses */
function symHero(S, p) {
  const due = symDue(p), late = p.today > p.n, on = S.notif, s = p.checks.filter(x => x.at === 'self').pop();
  const k = due ? (late ? 'ยังไม่ได้ตอบเภสัชกร' : 'เภสัชกรขอถามอาการวันนี้') : 'เภสัชกรจะถามอาการ 1 ครั้ง';
  const big = due ? 'ตอนนี้อาการเป็นอย่างไร' : `${symWhen(p)} ${p.askAt}`;
  const sub = due ? `${!late && now() < p.askAt ? `แจ้งเตือนเวลา ${p.askAt} ตอบก่อนได้ · ` : ''}เลือกคำตอบที่ตรงกับอาการตอนนี้` : `${symDate(p)} · ตอนนี้ไม่ต้องทำอะไร ${on ? 'แอปจะแจ้งเตือนเมื่อถึงเวลา' : 'เปิดการแจ้งเตือนด้านบน เพื่อไม่พลาดคำถาม'}`;
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
// Preview fixtures stay separate from the patient's saved plan and consultation history.
function followPreviewPlans() {
  const { meds, times } = mockPlan('normal');
  return [
    { id: 'preview-follow-1', date: '16/10/2026', days: 5, today: 3, note: 'ไอมีเสมหะมา 2 วัน รู้สึกระคายคอ', topic: 'ไอมีเสมหะ', med: meds[0] },
    { id: 'preview-follow-2', date: '17/10/2026', days: 3, today: 2, note: 'เจ็บคอ เวลากลืนแล้วเจ็บ อยากปรึกษาวิธีใช้ยา', topic: 'เจ็บคอ', med: meds[1] },
    { id: 'preview-follow-3', date: '18/10/2026', days: 4, today: 1, note: 'มีน้ำมูกใสและจามตั้งแต่เช้า', topic: 'น้ำมูกไหล', med: meds[2] }
  ].map(plan => ({
    ...SRC, ...plan, times, bought: ({'preview-follow-1':90,'preview-follow-2':225,'preview-follow-3':60})[plan.id],
    previewSummary: {
      sym: plan.topic, advice: 'จากอาการที่เล่ามา แนะนำให้พักผ่อนให้เพียงพอและดื่มน้ำสม่ำเสมอ ใช้ยาตามฉลากที่ได้รับ หากมีข้อสงสัยเกี่ยวกับการใช้ยา สามารถสอบถามเภสัชกรได้ค่ะ\nหากอาการไม่ดีขึ้นหรือแย่ลง ควรปรึกษาเภสัชกรหรือพบแพทย์เพื่อประเมินเพิ่มเติมค่ะ',
      meds: [{ ...plan.med, how: [plan.med.dose, plan.med.meal, plan.med.tip, `แผน ${plan.days} วัน`].filter(Boolean).join(' · ') }],
      warn: [], follow: 'สังเกตอาการระหว่างใช้ยา หากอาการไม่ดีขึ้นหรือมีอาการใหม่ สามารถปรึกษาเภสัชกรได้ค่ะ'
    }
  }));
}
TP.adrActiveMedicines = params => {
  if (params.multiPlan) return followPreviewPlans().map(plan => ({
    ...plan.med, v: plan.id, hid: plan.id, followPreview: true, pharm: plan.pharm, branch: plan.branch, sub: plan.topic
  }));
  const plan = F();
  if (!active(plan) || plan.sym || plan.waitRecv) return [];
  return plan.meds.map((med,index) => ({
    ...med, v: `${plan.src.id}:${index}`, hid: plan.src.id, pharm: plan.src.pharm, branch: plan.src.branch,
    sub: [med.dose,med.meal].filter(Boolean).join(' · ')
  }));
};
TP.followPreviewPlan = id => followPreviewPlans().find(plan => plan.id === id);
TP.followSummaryRecord = id => {
  const plan = F();
  if (!plan?.src || plan.src.id !== id) return null;
  const snapshot = TP.SUMMARY?.[id];
  if (!snapshot) return null;
  return {...plan.src, previewSummary: {...snapshot, meds: plan.meds.map(med => ({...med, how: [med.dose,med.meal,med.prn,med.tip,(med.slots || []).map(slot => SLOT[slot][0]).join(' / ')].filter(Boolean).join(' · ')}))}};
};
const followReminderButton = `<button type="button" class="ibtn" data-sheet="fureminder" aria-label="ตั้งเวลาเตือนกินยา" aria-haspopup="dialog">${ic('alarm-clock', 22, 2)}</button>`;
const multiReminderSettings = ctx => (ctx.params.multiReminder ||= { times: { ...followPreviewPlans()[0].times }, remind: true });
// Both ordinary navigation and multi-plan previews use the approved card layout.
// Preview medicines never replace the patient's saved plan.
function followDisplayPlans(ctx) {
  if (ctx.state === 'multi-plan') return followPreviewPlans().map(plan => ({ ...plan, meds: [plan.med], preview: true }));
  const plan = F();
  return plan?.meds?.length ? [{ ...plan.src, days: plan.days, today: plan.today, times: plan.times,
    endDate: dateOf(plan, plan.days), meds: plan.meds, savedPlan: plan }] : [];
}
const followDirections = med => [med.dose, med.meal, med.prn, med.tip, med.how].filter(Boolean).join(' · ');
const followPastPlan = plan => !!plan.savedPlan && (!plan.savedPlan.on || !!plan.savedPlan.end || plan.today > plan.days);
function followMedicationHistory(ctx, displayed) {
  const ids = new Set(displayed.map(plan => plan.id));
  const ended = displayed.filter(followPastPlan).map(plan => ({ ...plan,
    historyLabel: !plan.savedPlan.on && !plan.savedPlan.end ? 'หยุดติดตามแล้ว' : 'สิ้นสุดแผนแล้ว' }));
  // Only use medicine snapshots tied to this patient's exact case, never a generic fallback list.
  const previous = TP.consultationHistory(ctx.S).filter(record => (!record.who || record.who === 'me') && !ids.has(record.id)).flatMap(record => {
    const snapshot = record.previewSummary || TP.SUMMARY?.[record.id];
    const paid = record._case?.order?.status === 'paid' ? record._case.order.items : [];
    const meds = snapshot?.meds || paid || [];
    return meds.length ? [{ ...record, meds, historyLabel: 'เคยได้รับ' }] : [];
  });
  return [...ended, ...previous].sort((a,b) => toD(b.date) - toD(a.date));
}
TP.adrHistoryMedicines = ctx => followMedicationHistory(ctx, followDisplayPlans(ctx)).filter(plan => { const last = plan.endDate || (plan.days && plan.date ? addD(plan.date, plan.days - 1) : plan.date); const elapsed = (toD(TP.NOW.date) - toD(last)) / 86400000; return Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 7; }).flatMap(plan => plan.meds.map((med,index)=>({...med,v:`history:${plan.id}:${index}`,hid:plan.id,followPreview:!!plan.preview,pharm:plan.pharm,branch:plan.branch,sub:`ปรึกษา ${plan.date || ''}`})));
function followPlanCard(plan, historical = false) {
  return `<section class="card pad0 fu-multi-card fu-multi-plan">
    <header class="fu-multi-head"><span class="fu-multi-icon">${ic('file-text', 20, 2)}</span>
      <div class="fu-plan-identity"><h2>รหัสเคส ${esc(TP.caseCode(plan))}</h2><p class="small">ปรึกษา ${esc(plan.date)}</p></div>
      <b class="fu-multi-chip">${historical ? (plan.historyLabel || 'เคยได้รับ') : `เหลือ ${Math.max(0, plan.days - plan.today + 1)} วัน`}</b>
      <p class="consultation-note"><span>เรื่องที่ปรึกษา</span>${esc(TP.consultationText(plan) || 'ไม่มีข้อความอาการที่บันทึกไว้')}</p>
    </header>
    <div class="fu-plan-body">${plan.meds.map(med => `<div class="fu-multi-plan-med">${TP.medicineImage(med) || ic('pill', 20, 2)}<div><b>${esc(med.name)}</b>
      <p class="small">${esc([followDirections(med), (med.slots || []).map(slot => SLOT[slot][0]).join(' / ')].filter(Boolean).join(' · '))}</p>
    </div></div>`).join('')}</div>
    <footer class="fu-plan-footer">${plan.days ? `<div class="fu-multi-progress">
      <div><b>${historical ? `ระยะเวลาตามแผน ${plan.days} วัน` : `วันที่ ${plan.today} จาก ${plan.days}`}</b><span>สิ้นสุด ${esc(plan.endDate || addD(plan.date, plan.days - 1))}</span></div>
      ${historical ? '' : `<progress aria-label="วันที่ของแผนการใช้ยา" value="${plan.today}" max="${plan.days}"></progress>`}
    </div>` : ''}
    ${ui.btn('ดูใบสรุปการปรึกษา', { go: 'summary', p: { id: plan.id, ...(plan.preview ? {followPreview: true} : {}) }, kind: 'tint', sm: true, icon: 'file-text' })}
  </footer></section>`;
}
function followMedicationSections(ctx) {
  const plans = followDisplayPlans(ctx);
  const current = plans.filter(plan => !followPastPlan(plan));
  const history = followMedicationHistory(ctx, plans);
  const selected = ctx.params.medInfoTab === 'history' ? 'history' : 'current';
  const section = (key,id,title,sub,items,past,empty) => `<section class="fu-info-section" id="fuMedPanel-${key}" role="tabpanel" aria-labelledby="fuMedTab-${key}" tabindex="0" ${selected === key ? '' : 'hidden'}>
    ${items.length ? items.map(plan => followPlanCard(plan,past)).join('') : `<p class="fu-info-empty small">${empty}</p>`}
  </section>`;
  const tabs = [['current','ยาที่ใช้อยู่'],['history','ประวัติการใช้ยา']].map(([key,label]) => `<button type="button" role="tab" id="fuMedTab-${key}" aria-controls="fuMedPanel-${key}" aria-selected="${selected === key}" tabindex="${selected === key ? '0' : '-1'}" data-a="fuMedInfoTab" data-v="${key}">${label}</button>`).join('');
  return `<div class="fu-multi fu-medication-sections"><div class="fu-info-tabs" role="tablist" aria-label="ข้อมูลใช้ยา">${tabs}</div>${section('current','fuCurrentTitle','ยาที่ใช้อยู่','แยกตามเคส พร้อมวิธีใช้และระยะเวลาตามแผน',current,false,'ยังไม่มีรายการยาที่ใช้อยู่')}
    ${section('history','fuHistoryTitle','ประวัติการใช้ยา','รายการยาที่เคยได้รับจากการปรึกษา',history,true,'ยังไม่มีประวัติการใช้ยา')}</div>`;
}
function followMultiHtml(ctx) {
  if (ctx.params.medInfo) return followMedicationSections(ctx);
  const plans = followDisplayPlans(ctx);
  const log = ctx.params.multiLog || {};
  const entries = plans.flatMap(plan => plan.meds.map(med => ({ plan, med })));
  const slots = SLOTS.filter(slot => entries.some(({med}) => med.slots?.includes(slot)));
  const summary = plan => ({ go: 'summary', p: { id: plan.id, ...(plan.preview ? {followPreview: true} : {}) } });
  const directions = followDirections;
  const today = slots.map(slot => {
    const due = entries.filter(({med}) => med.slots?.includes(slot));
    const count = due.filter(({plan,med}) => plan.preview ? log[slot] : plan.savedPlan.log[lk(plan.today, slot, med)]?.t).length;
    const taken = count === due.length;
    const plan = due[0].plan;
    const time = plan.preview ? multiReminderSettings(ctx).times[slot] : plan.times[slot];
    const action = plan.preview ? 'fuMultiTake' : 'fuTake';
    const value = plan.preview ? slot : `${plan.today}|${slot}`;
    return `<section class="card pad0 fu-multi-card fu-meal-card"><header class="fu-multi-head">
      <span class="fu-multi-icon">${ic(SLOT[slot][1], 20, 2)}</span>
      <div><h2>มื้อ${SLOT[slot][0]}</h2><p class="small">บันทึกแล้ว ${count} จาก ${due.length} รายการ</p></div>
      <b class="fu-multi-chip">${esc(time)}</b>
    </header><div class="fu-meal-body">
      ${due.map(({plan,med}) => `<div class="fu-multi-med">${TP.medicineImage(med) || ic('pill', 20, 2)}<div><b>${esc(med.name)}</b><p class="small">${esc(directions(med))}</p>
        <button type="button" class="fu-multi-origin" ${ui.route(summary(plan))} aria-label="ดูสรุปการปรึกษา ${esc(TP.caseCode(plan))}">${ic('file-text', 14, 2)}<span>ดูสรุปการปรึกษา · ${esc(TP.caseCode(plan))}</span>${ic('chevron-right', 14, 2)}</button>
      </div></div>`).join('')}
      </div><footer class="fu-multi-actions">
        ${ui.btn('แจ้งอาการ', { go: 'adr', p: plan.preview ? { multiPlan: true } : {}, kind: 'secondary', icon: 'triangle-alert' })}
        <button type="button" class="btn ${taken ? 'primary' : 'secondary'}" data-a="${action}" data-v="${value}" aria-pressed="${taken}" aria-label="${taken ? 'ยกเลิกบันทึก' : 'บันทึกว่าทานแล้ว'}ทั้งมื้อ${SLOT[slot][0]}">${taken ? ic('check', 16, 2) : ''}<span>ทานแล้ว</span></button>
      </footer></section>`;
  }).join('');
  const saved = plans.find(plan => plan.savedPlan)?.savedPlan;
  const prn = saved?.meds.filter(med => med.prn) || [];
  return `<div class="fu-multi">${today}${!ctx.params.medInfo && prn.length ? `<h3>กินเมื่อมีอาการ</h3><div class="fu-list">${prn.map(med => prnRow(saved,med)).join('')}</div>` : ''}</div>`;
}
TP.act('fuMedInfoTab', (button, ctx) => {
  const key = button.dataset.v;
  if (!['current','history'].includes(key)) return;
  ctx.params.medInfoTab = key;
  return TP.refresh({anim:false}).then(() => TP.cur()?.el?.querySelector(`#fuMedTab-${key}`)?.focus({preventScroll:true}));
});
function mountMedicationTabs(el) {
  el.addEventListener('keydown', event => {
    const tab = event.target.closest('[data-a="fuMedInfoTab"]');
    if (!tab || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const key = event.key === 'Home' ? 'current' : event.key === 'End' ? 'history' : tab.dataset.v === 'current' ? 'history' : 'current';
    el.querySelector(`#fuMedTab-${key}`)?.click();
  });
}
TP.act('fuMultiTake', (button, ctx) => {
  const log = ctx.params.multiLog ||= {};
  const key = button.dataset.v;
  log[key] = !log[key];
  TP.refresh({ anim: false });
});

TP.screen('medhub', {
  group: 'after', title: 'เมนูยา', code: 'C418', parent: 'home',
  states: [['normal', 'เมนูยา 3 รายการ']],
  notes: ['เข้าจากทางลัดข้อมูลยาบนหน้าแรก แตะแบนเนอร์เพื่อเปิดหน้าที่เกี่ยวข้อง'],
  render() {
    const items = [
      {title:'การกินยา', subtitle:'ดูมื้อยาและบันทึกการกิน', go:'follow', image:'schedule'},
      {title:'ข้อมูลใช้ยา', subtitle:'ดูวิธีใช้ยาตามแผน', go:'follow', p:{medInfo:true}, image:'instructions'},
      {title:'บันทึกการแพ้ยา', subtitle:'ดูประวัติและแจ้งอาการ', go:'adrcare', image:'allergy'}
    ];
    return ui.nav({back:backL('home'),title:'เมนูยา'})+ui.page(`<nav class="medhub-banners" aria-label="เมนูยา">${items.map(item=>`
      <button type="button" class="medhub-banner" ${ui.route(item)}>
        <img src="/assets/photos/medhub-${item.image}-v1.jpg" alt="" width="1080" height="360">
        <span class="medhub-copy"><strong>${item.title}</strong><span>${item.subtitle}</span>
      </button>`).join('')}</nav>`);
  }
});
function followMedicineInfo(ctx) {
  const nav = ui.nav({back:backL('medhub'),title:'ข้อมูลใช้ยา'});
  return nav+ui.page(followMultiHtml(ctx));
}

TP.screen('follow', {
  group: 'after', title: 'ติดตามการใช้ยา', code: 'C405', parent: 'home',
  states: [['normal', 'วันที่ 3 ปกติ'], ['missed', 'ลืมมื้อกลางวัน'], ['checked', 'ตอบกลางคอร์สแล้ว'], ['endonly', 'เภสัชกรเลือกถามหลังครบคอร์สอย่างเดียว'], ['worse', 'แจ้งว่าแย่ลง'], ['day1', 'เพิ่งเริ่มวันนี้'], ['done', 'ครบคอร์ส'], ['remoff', 'ปิดเตือนกินยา'], ['off', 'หยุดติดตาม'], ['offline', 'ไม่มีเน็ต'], ['empty', 'ไม่มีแผน'], ['loading', 'กำลังโหลด'],
    ['sym', 'ไม่มียา ถามอีก 3 วัน'], ['symdue', 'ไม่มียา ถึงวันถามอาการ'], ['symworse', 'ไม่มียา แจ้งว่าแย่ลง'], ['symdone', 'ไม่มียา ตอบแล้ว'], ['talked', 'แจ้งว่าแย่ลง คุยในการปรึกษาใหม่แล้ว'], ['multi-plan', '3 แผนยา ระยะเวลาแตกต่างกัน']],
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
    'มีหลายแผนพร้อมกันได้ไหม (หลายการปรึกษา) ตัวอย่างหลายแผนดูได้ในสถานะ multi-plan'],
  prep(S) {
    const st = S.st.follow; if (!st || st === 'multi-plan') return;
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
    if (ctx.params.medInfo) return followMedicineInfo(ctx);
    if (ctx.state === 'multi-plan') return ui.nav({ back: backL('home'), title: 'ติดตามการใช้ยา', right: followReminderButton }) + ui.page(followMultiHtml(ctx));
    const S = ctx.S, p = F();
    const canSetReminder = ctx.state !== 'loading' && p && !p.sym && active(p) && !p.waitRecv && hasSched(p);
    const nav = ui.nav({
      back: backL('home'),
      title: p?.sym ? 'ติดตามอาการ' : 'ติดตามการใช้ยา',
      right: canSetReminder ? followReminderButton : ''
    });
    if (ctx.state === 'loading') {
      return nav + ui.page(`<div aria-busy="true" aria-label="กำลังโหลดการติดตาม">${ui.skel('100%', 170, 14)}<div class="mt12">${ui.skel('100%', 120, 14)}</div><div class="mt24">${ui.skel('36%', 18)}</div><div class="mt12">${ui.skel('100%', 220, 14)}</div></div>`);
    }
    if (!p) return nav + ui.page(ui.empty({ title: 'ยังไม่มีการติดตาม', body: 'เมื่อเภสัชกรนัดติดตามหลังปรึกษา แอปจะถามอาการให้ที่นี่ ถ้าได้ยาไป จะเตือนเวลากินยาด้วย', btn: { label: 'ดูประวัติการปรึกษา', a: 'fuHistory' }, art: emArt('pill') }));
    const checkNote=ctx.state==='checked'?ui.note('ตอบประเมินอาการกลางคอร์สแล้ว',{icon:'circle-check'}):ctx.state==='endonly'?ui.note('เภสัชกรนัดประเมินอาการหลังครบคอร์สเท่านั้น',{icon:'calendar'}):'';
    return nav + ui.page(checkNote+(p.sym ? symBodyHtml(S, p) : bodyHtml(S, p, ctx)));
  },
  mount(el, ctx) { if (ctx.params.medInfo) mountMedicationTabs(el); if (ctx.state === 'loading') ctx.later(() => { ctx.S.st.follow = 'normal'; TP.refresh(); }, 1200); }
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
  TP.notify(!on ? 'ยกเลิกบันทึกมื้อนี้แล้ว' : p.offline ? 'บันทึกในเครื่องแล้ว' : `บันทึกแล้ว กินยามื้อ${SLOT[s][0]}`, { icon: on ? 'check' : 'rotate-ccw' });
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
TP.act('fuOpenSummary', () => {
  const p = F();
  if (!p?.src?.id) return;
  ensureSrc(TP.S, p.src);
  TP.go('summary', { params: { id: p.src.id } });
});
TP.act('fuHistory', () => TP.tab('history'));
TP.act('fuHome', () => TP.tab('home'));
TP.act('fuCall', (t, c, e) => { e?.preventDefault(); TP.notify('กำลังโทร ' + (t.dataset.v || ''), { icon: 'phone' }); });
TP.act('fuBackFollow', () => (TP.hist[TP.hist.length - 1]?.id === 'follow' ? TP.back() : TP.go('follow', { replace: true })));
/* consult again: prefill intake with what the customer reported (store closed -> leave a question) */
TP.act('fuConsult', () => {
  const S = TP.S, p = assessmentResultPlan(S, TP.cur()?.ctx.params.assessmentId) || F(); if (!p) return;
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
function assessmentPlan(S, id) {
  const record = TP.consultationHistory(S).find(h => h.id === id);
  const order = record && TP.completedMedicationOrder(S, record);
  if (!order) return null;
  if (S.follow?.src?.id === id) return S.follow;
  S.historyAssessmentPlans ||= {};
  if (!S.historyAssessmentPlans[id]) {
    const plan = dayOnePlan({ ...record, order });
    plan.src.date = record.date || plan.src.date;
    plan.src.time = record.time || plan.src.time;
    S.historyAssessmentPlans[id] = plan;
  }
  return S.historyAssessmentPlans[id];
}
const assessmentResultPlan = (S, id) => id
  ? S.historyAssessmentPlans?.[id] || (S.follow?.src?.id === id ? S.follow : null)
  : null;

TP.sheetDef('historyassessment', {
  group: 'after', title: 'ประเมินอาการ', code: 'C420', host: 'summary', hostParams: { historyOutcome: 'order-complete' },
  states: [['normal', 'เลือกอาการจากคำสั่งซื้อที่สำเร็จ']],
  render(ctx) {
    const id = ctx.params.id || TP.cur()?.ctx.h?.id;
    const p = assessmentPlan(ctx.S, id);
    ctx.assessmentPlan = p;
    if (!p) return '<p>ไม่พบคำสั่งซื้อที่ประเมินอาการได้</p>';
    return `<div class="history-assessment"><p class="body">ตอนนี้อาการเป็นอย่างไร</p>
      <div class="fu-anss mt12">${['better', 'same', 'worse', 'danger'].map(k => ansBtn(k, 'self')).join('')}</div>
      <p class="fu-exp fu-exp-s">${ic('send', 16, 2)}<span>${esc(checkNote(ctx.S, p))}</span></p>
      <div id="fuErr" class="mt12" hidden>${ui.note('ส่งไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง', { tone: 'danger', icon: 'wifi-off' })}</div></div>`;
  }
});
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
  const assessment = TP.sheetOpen()?.id === 'historyassessment' ? TP.sheetOpen() : null;
  const S = TP.S, p = assessment ? assessment.ctx.assessmentPlan : F(), el = assessment?.el || curEl(), k = t.dataset.v, at = AT[t.dataset.at] ? t.dataset.at : 'self';
  if (!p || !el || !ANS[k] || t.classList.contains('busy')) return;
  /* danger never waits for the network: the hospital + 1669 screen shows at once, the answer is sent behind it */
  if (k !== 'danger') {
    const all = $$('.fu-ans', el); all.forEach(b => { if (b !== t) b.disabled = true; });
    t.classList.add('busy'); t.setAttribute('aria-busy', 'true');
    await TP.wait(RM() ? 50 : 650);
    if (assessment && TP.sheetOpen() !== assessment) return;
    /* no internet (C405 "ไม่มีเน็ต"): the answer cannot reach the pharmacist, say so and let them tap again */
    if (p.offline) {
      t.classList.remove('busy'); t.removeAttribute('aria-busy'); all.forEach(b => { b.disabled = false; });
      const box = $('#fuErr', el); if (box) { box.hidden = false; shake(box); box.scrollIntoView({ block: 'nearest', behavior: RM() ? 'auto' : 'smooth' }); }
      TP.live('ส่งไม่สำเร็จ ยังไม่ถึงเภสัชกร แตะคำตอบอีกครั้ง'); return;
    }
  }
  const day = p.sym ? p.today : cday(p), c = { at, day, date: assessment ? TP.NOW.date : p.sym ? addD(p.start, p.today) : dateOf(p, day), time: now(), mood: k };
  if (at === 'mid' || at === 'once') p.checks = p.checks.filter(x => x.at !== at);
  /* the one no-medicine question ends the follow-up (item 82) */
  if (at === 'once') p.end = k;
  p.checks.push(c); p.contact = null;
  if (!assessment) S.st.furesult = (p.sym && (k === 'better' || k === 'same') ? 'sym' : '') + kindOf(c);
  TP.emit('state');
  if (assessment) await TP.closeSheet({ instant: true });
  TP.go('furesult', { replace: !assessment, params: assessment ? { assessmentId: p.src.id } : {}, via: k === 'danger' ? 'fade' : 'push' });
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
    const S = ctx.S, assessment = assessmentResultPlan(S, ctx.params.assessmentId), p = assessment || ensure(S), c = lastCheck(p) || { at: 'self', day: cday(p), time: now(), mood: 'better' };
    const kind = String((assessment ? '' : S.st.furesult) || kindOf(c)).replace(/^sym/, ''), P = ph(p), sent = `ส่งถึง ${P.short} แล้ว ${c.time}`;
    const nav = ui.nav({ back: backL('follow'), title: '' }), back = (k = 'primary') => assessment ? ui.btn('กลับไปหน้ารายละเอียด', { kind: k, back: true }) : ui.btn('กลับไปหน้าติดตาม', { kind: k, a: 'fuBackFollow' });
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
    const S = TP.S, host = TP.cur()?.ctx;
    const multi = host?.id === 'follow' && host.state === 'multi-plan';
    const p = multi ? multiReminderSettings(host) : ensure(S);
    const used = SLOTS.filter(s => multi ? followPreviewPlans().some(plan => plan.med.slots.includes(s)) : medsAt(p, s).length);
    const timeRows = used.map(slot => {
      const time = p.times[slot];
      const [hour, minute] = time.split(':');
      return `<details class="fu-time-picker" name="fu-reminder-time">
        <summary class="row fu-trow"><span class="r-ic">${ic(SLOT[slot][1], 19, 1.9)}</span><span class="r-t"><b>${SLOT[slot][0]}</b><span>แจ้งเตือนกินยา</span></span><span class="fu-time"><span data-fu-time>${esc(time)}</span>${ic('chevron-down', 16)}</span></summary>
        <input type="hidden" id="fuT-${slot}" value="${esc(time)}">
        <div class="fu-time-options">
          ${reminderTimeOptions(slot, 'hour', 'ชั่วโมง', 24, hour)}
          ${reminderTimeOptions(slot, 'minute', 'นาที', 60, minute)}
        </div>
      </details>`;
    });
    return `${S.notif ? '' : `<div class="fu-mb">${ui.note('<b>การแจ้งเตือนของแอปปิดอยู่</b><br>ตั้งเวลาไว้ได้ แต่จะไม่มีแจ้งเตือนจนกว่าจะเปิด', { tone: 'warn', icon: 'bell-off' })}<div class="mt8">${ui.btn('เปิดการแจ้งเตือน', { kind: 'tint', sm: true, a: 'fuNotifOn', icon: 'bell' })}</div></div>`}
      ${ui.group([ui.switchRow({ icon: 'bell', title: 'เตือนกินยา', sub: remSub(p.remind), on: p.remind, id: 'fuR-on', a: 'fuRemSw' })])}
      ${used.length ? rvHtml('fuTimes', p.remind, ui.group(timeRows, { title: 'เวลาแจ้งเตือนแต่ละมื้อ', foot: 'ตั้งเวลาแจ้งเตือนตามแผนการใช้ยาของคุณ' })) : ''}
      <p class="fu-err" id="fuRemErr" role="alert" hidden>${ic('circle-x', 16, 2)}<span></span></p>
      ${multi ? '' : `<p class="fu-foot fu-left">${ic('message-circle', 14, 2)}<span>คำถามอาการจากเภสัชกร แจ้งเตือนเวลา ${esc(p.askAt)} ของวันที่ถามเสมอ</span></p>`}
      <p class="fu-foot fu-left">${ic('lock', 14, 2)}<span>ข้อความเตือนไม่บอกชื่อยาหรืออาการ เช่น "ถึงเวลากินยามื้อเย็น"</span></p>`;
  },
  foot: () => ui.btn('บันทึก', { a: 'fuRemSave', icon: 'check', cls: 'fu-cbtn' }) + ui.btn('ยกเลิก', { kind: 'ghost', closeSheet: true }),
  mount(el) {
    const body = $('.sh-b', el);
    el.querySelectorAll('.fu-time-picker').forEach(picker => {
      picker.addEventListener('toggle', () => {
        if (!picker.open) return;
        const options = $('.fu-time-options', picker);
        const overflow = options.getBoundingClientRect().bottom - body.getBoundingClientRect().bottom;
        if (overflow > 0) body.scrollTop += overflow + 8;
      });
    });
    el.addEventListener('click', event => {
      const picker = $('.fu-time-picker[open]', el);
      if (picker && !picker.contains(event.target)) picker.open = false;
    });
    el.addEventListener('keydown', event => {
      const picker = $('.fu-time-picker[open]', el);
      if (event.key !== 'Escape' || !picker) return;
      event.stopPropagation();
      picker.open = false;
      $('summary', picker).focus();
    });
    if (!TP.S._fuRemBad) return;
    TP.S._fuRemBad = false;
    const n = $('#fuT-n', el); if (n) { setReminderTime(n.closest('details'), '07:30'); checkTimes(el, false); }
  }
});
function reminderTimeOptions(slot, part, label, count, selected) {
  const options = Array.from({length: count}, (_, index) => {
    const value = String(part === 'hour' ? (index + 1) % count : index).padStart(2, '0');
    return `<button type="button" aria-label="${label} ${value}" aria-pressed="${value === selected}" data-a="fuRemTime" data-slot="${slot}" data-part="${part}" data-v="${value}">${value}</button>`;
  }).join('');
  return `<div class="fu-time-part" role="group" aria-label="${label}"><b>${label}</b><div class="fu-time-values">${options}</div></div>`;
}
function setReminderTime(picker, time) {
  $('input', picker).value = time;
  $('[data-fu-time]', picker).textContent = time;
  const [hour, minute] = time.split(':');
  picker.querySelectorAll('[data-part]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.v === (button.dataset.part === 'hour' ? hour : minute)));
  });
}
TP.act('fuRemTime', button => {
  const picker = button.closest('.fu-time-picker');
  const time = $('input', picker).value.split(':');
  time[button.dataset.part === 'hour' ? 0 : 1] = button.dataset.v;
  setReminderTime(picker, time.join(':'));
  const sheet = $('#sheet');
  if (!$('#fuRemErr', sheet).hidden) checkTimes(sheet, false);
});
const remSub = on => (on ? 'แจ้งเตือนในแอปตามเวลามื้อ แตะ กินแล้ว ในแจ้งเตือนได้เลย' : 'ปิดอยู่ ไม่มีแจ้งเตือน ยังกด กินแล้ว ในหน้าติดตามได้');
const badTimes = vals => vals.map((v, i) => !v || (i > 0 && !!vals[i - 1] && v <= vals[i - 1]));
const timeMsg = vals => (vals.some(v => !v) ? 'ใส่เวลาให้ครบทุกมื้อ' : 'เวลามื้อต้องเรียงจากเช้าไปก่อนนอน และไม่ซ้ำกัน');
/* marks wrong meal times and says why; returns the values when they are fine */
function checkTimes(sh, loud = true) {
  const used = SLOTS.filter(s => $('#fuT-' + s, sh)), vals = used.map(s => $('#fuT-' + s, sh).value), bad = badTimes(vals);
  used.forEach((s, i) => { const inp = $('summary', $('#fuT-' + s, sh).closest('details')); inp.classList.toggle('err', bad[i]); if (bad[i]) inp.setAttribute('aria-invalid', 'true'); else inp.removeAttribute('aria-invalid'); });
  const err = $('#fuRemErr', sh);
  if (bad.some(Boolean)) { const msg = timeMsg(vals); $('span', err).textContent = msg; err.hidden = false; if (loud) { shake(err); TP.live(msg); } return null; }
  if (err) err.hidden = true;
  return { used, vals };
}
TP.act('fuRemSw', t => {
  const on = t.getAttribute('aria-checked') === 'true', sub = t.closest('.row')?.querySelector('.r-t span');
  rv($('#fuTimes', $('#sheet')), on); if (sub) sub.textContent = remSub(on);
  if (!on) { $('#sheet').querySelectorAll('.fu-time-picker[open]').forEach(picker => { picker.open = false; }); const err = $('#fuRemErr', $('#sheet')); if (err) err.hidden = true; }
});
TP.act('fuRemSave', async t => {
  const S = TP.S, host = TP.cur()?.ctx;
  const multi = host?.id === 'follow' && host.state === 'multi-plan';
  const p = multi ? multiReminderSettings(host) : F(), sh = $('#sheet'); if (!p || !sh || t.classList.contains('busy')) return;
  const on = $('#fuR-on', sh)?.getAttribute('aria-checked') === 'true';
  const ok = on ? checkTimes(sh) : { used: [], vals: [] }; if (!ok) return;
  ok.used.forEach((s, i) => { p.times[s] = ok.vals[i]; });
  p.remind = on; S._fuRemBad = false;
  t.classList.add('busy'); await TP.wait(RM() ? 50 : 450);
  TP.emit('state'); await TP.closeSheet();
  const nx = multi ? null : upNext(p);
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
if (Q.get('first') === '1') TP.setFlag('firstTime', true);
if (Q.get('first') === '1') Object.assign(TP.S, { firstTime: true, loggedIn: false, consent: false, notifAsked: false, notif: false, follow: null });
TP.panel.render();
if (Q.get('registry') === '1' && parent !== window) {
  const title = d => typeof d.title === 'function' ? d.title({ S: TP.S, params: {} }) : d.title;
  parent.postMessage({ tpRegistry: {
    version: TP.DESIGN_VERSION, groups: TP.GROUPS,
    items: TP.ORDER.map(TP.def).filter(d => !d.hidden).map(d => ({ id: d.id, kind: d.kind, group: d.group, title: title(d), code: d.code || '', states: d.states || [], retiredStates:(d.states||[]).filter(x=>x[2]===false).map(x=>x[0]), parent: d.parent || '', host: d.host || '', notes: (d.notes || []).length, wait: (d.wait || []).length }))
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


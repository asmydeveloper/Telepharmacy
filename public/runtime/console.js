
/* ===== 00-core.js ===== */
/* =====================================================================
   00 · Core: utilities, icons, money, mock data. One global: window.SC (staff console).
   Mock data = the same story as the customer app (src-05/js/00-core.js, 60-before.js, 64-room.js,
   66-pay.js, 70-after.js, 72-follow.js): same people, case ids, prices and times. Sanitised, no real customers.
   ===================================================================== */
const SC = window.SC = {};
SC.caseCode = record => { const id=typeof record==='string'?record:record?.id; return /^(TC-|MR[0-9])/.test(id||'') ? window.MitrareeConsultations.codeFor(record) : id || ''; };
SC.$ = (s, r = document) => r.querySelector(s);
SC.$$ = (s, r = document) => [...r.querySelectorAll(s)];
SC.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
SC.wait = ms => new Promise(r => setTimeout(r, ms));
SC.RED = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
/* ฿1,290 · ฿1,290.50 (satang only when not zero) */
SC.money = b => '฿' + Number(b).toLocaleString('en-US', b % 1 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {});
SC.r2 = x => Math.round(x * 100) / 100;
SC.pad = n => String(n).padStart(2, '0');
SC.mmss = s => `${Math.floor(s / 60)}:${SC.pad(Math.max(0, s) % 60)}`;
SC.hhmm = m => `${SC.pad(Math.floor(m / 60) % 24)}:${SC.pad(m % 60)}`;
SC.toMin = t => { const [h, m] = String(t).split(':').map(Number); return h * 60 + m; };

/* ---------- inline lucide icons (stroke 1.75) ---------- */
SC.PATH = {
  'layout-list': '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><path d="M14 4h7"/><path d="M14 9h7"/><path d="M14 15h7"/><path d="M14 20h7"/>',
  download: '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
  snowflake: '<path d="M2 12h20"/><path d="M12 2v20"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', 'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  'arrow-right-left': '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>', 'chevron-left': '<path d="m15 18-6-6 6-6"/>', 'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  'badge-check': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  'clipboard-check': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
  stethoscope: '<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
  'heart-pulse': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  thermometer: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
  hospital: '<path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  'triangle-alert': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'octagon-alert': '<path d="M12 16h.01"/><path d="M12 8v4"/><path d="M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z"/>',
  ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  'circle-pause': '<circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/>',
  'circle-play': '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  'video-off': '<path d="M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196"/><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/><path d="m2 2 20 20"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
  'mic-off': '<line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  'phone-off': '<path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="22" x2="2" y1="2" y2="22"/>',
  'phone-call': '<path d="M13 2a9 9 0 0 1 9 9"/><path d="M13 6a5 5 0 0 1 5 5"/><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  'switch-camera': '<path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/><path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5"/><circle cx="12" cy="12" r="3"/><path d="m18 22-3-3 3-3"/><path d="m6 2 3 3-3 3"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  send: '<path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z"/><path d="M6 12h16"/>',
  'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  'message-square-text': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7"/><path d="M17 12H7"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>', minus: '<path d="M5 12h14"/>',
  'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>', 'circle-x': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
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
  'log-in': '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  wifi: '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
  'wifi-off': '<path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  sliders: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  power: '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/>',
  'scan-barcode': '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 7v10"/><path d="M12 7v10"/><path d="M17 7v10"/>',
  lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  'volume-2': '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
  meh: '<circle cx="12" cy="12" r="10"/><line x1="8" x2="16" y1="15" y2="15"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
  frown: '<circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
  'calendar-check': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  'panel-right': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/>',
  plusmark: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  'shield-alert': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  'circle-help': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  'qr-code': '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>'
};
SC.ic = (n, s = 18, sw = 1.75, cls = 'ic') => {
  if (!SC.PATH[n]) console.warn('icon missing:', n);
  return `<svg class="${cls}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${SC.PATH[n] || ''}</svg>`;
};
SC.logo = (o = {}) => `<svg class="logo${o.cls ? ' ' + o.cls : ''}" role="img" aria-label="MITRAREE"${o.style ? ` style="${o.style}"` : ''}><use href="#wmen"/></svg>`;

/* =====================================================================
   Mock data. "Now" of the mock = 18/10/2026 14:15 (the customer joined the queue at 14:12)
   ===================================================================== */
SC.NOW = { date: '18/10/2026', time: '14:15', day: 'อาทิตย์' };
SC.PHARM = {
  kj: { id: 'kj', name: 'ภญ.ขวัญใจ เอื้อภราดร', short: 'ภญ.ขวัญใจ', first: 'ขวัญใจ', lic: 'ภ.45279', ini: 'ขจ', staff: 'MT-0457', home: 'tw', since: '08:55' },
  tp: { id: 'tp', name: 'ภก.ธัชพล', short: 'ภก.ธัชพล', first: 'ธัชพล', lic: 'ภ.23577', ini: 'ธพ', staff: 'MT-0312', home: 'on', since: '08:52', male: true },
  pc: { id: 'pc', name: 'ภญ.พิมพ์ชนก สายใจ', short: 'ภญ.พิมพ์ชนก', first: 'พิมพ์ชนก', lic: 'ภ.51820', ini: 'พช', staff: 'MT-0518', home: 'tw', since: '' },
  /* owner 20/10/2026: accounts are bound to one branch; only superadmin reaches every branch. Not a pharmacist on duty */
  admin: { id: 'admin', name: 'ผู้ดูแลระบบ', short: 'ผู้ดูแลระบบ', first: 'ผู้ดูแลระบบ', lic: 'ทุกสาขา', ini: 'ดร', staff: 'MT-0001', home: null, admin: true },
  /* owner 20/10/2026 (item 67): store staff. Packs, ships and hands over paid orders; sees nothing medical, no licence */
  st: { id: 'st', name: 'สุนิสา แก้วมณี', short: 'คุณสุนิสา', first: 'สุนิสา', lic: '', ini: 'สน', staff: 'MT-0581', home: 'tw', since: '', role: 'staff' }
};
SC.me = () => SC.PHARM[SC.S.me] || SC.PHARM.kj;
SC.isAdmin = () => !!SC.me().admin;
SC.isStaff = () => SC.me().role === 'staff';
/* who customers see as today's pharmacist: whoever signed in and confirmed at that branch (owner 20/10: "ขึ้นกับ login") */
SC.duty = bid => { const S = SC.S, id = bid || S.branch; if (S.dutyBy?.[id] !== undefined) return S.dutyBy[id] ? SC.PHARM[S.dutyBy[id]] : null; return SC.PHARM[SC.BRANCHES.find(b => b.id === id).pharm]; };
/* ready-made messages follow the pharmacist who is signed in: ดิฉัน ... ค่ะ / ผม ... ครับ */
SC.say = t => !SC.me().male ? String(t) : String(t).replace(/ดิฉัน/g, 'ผม').replace(/นะคะ/g, 'นะครับ').replace(/ค่ะ/g, 'ครับ').replace(/คะ(?=[\s.,]|$)/g, 'ครับ');
SC.BRANCHES = [
  { id: 'tw', name: 'สาขาตลาดเวิลด์', short: 'ตลาดเวิลด์', en: 'Talad World', hours: '09:00-21:00', phone: '082-053-9915', pharm: 'kj', lic: 'ข.ย.5 กท 29/2566', licTmp: true },
  { id: 'on', name: 'สาขาอ่อนนุช', short: 'อ่อนนุช', en: 'On Nut', hours: '09:00-21:00', phone: '080-235-3950', pharm: 'tp', lic: 'ข.ย.5 กท 29/2566', licTmp: true }
];
SC.STORE = { lic: 'ข.ย.5 กท 29/2566', cs: '098-035-8000', csHours: '10:00-18:00' };
SC.branch = id => SC.BRANCHES.find(b => b.id === (id || SC.S.branch));

/* account holder + household (customer app TP.fresh().user / family) */
SC.PEOPLE = {
  me: { id: 'me', name: 'สมใจ ใจดี', first: 'สมใจ', rel: 'ตัวเอง', age: 38, weight: 58, phone: '08x-xxx-5678', allergies: ['แอสไพริน'], allergySrc: 'บันทึกโดย ภญ.ขวัญใจ 02/10/2026', allergyState: 'set', meds: ['แอมโลดิพีน 5 มก. (ยาความดัน)'] },
  mom: { id: 'mom', name: 'บุญเรือน ใจดี', first: 'บุญเรือน', rel: 'แม่', age: 68, weight: 52, allergies: ['เพนิซิลลิน'], allergySrc: 'ระบุเอง 14/09/2026', allergyState: 'set', meds: ['เมทฟอร์มิน 500 มก.'] },
  kid: { id: 'kid', name: 'ข้าวหอม ใจดี', first: 'ข้าวหอม', rel: 'ลูก', age: 6, weight: 20, allergies: [], allergyState: 'unknown', meds: [], child: true }
};
SC.person = id => SC.PEOPLE[id || 'me'];

/* the waiting cases at ตลาดเวิลด์ (customer app: case TC-261018-0142 joined 14:12, "คิวถัดไป").
   answers = what the scripted customer replies to the usual questions (fever, allergy, anything else) */
SC.CASES = {
  smj: { key: 'smj', id: 'TC-261018-0142', acct: 'สมใจ ใจดี', who: 'me', symptoms: ['ไข้', 'เจ็บคอ'], note: 'เป็นมา 2 วัน กลืนแล้วเจ็บ', urgent: [], mode: 'chat', photos: 0, joined: '14:12', waitS: 190, member: 'สมาชิก · ปรึกษา 3 ครั้งใน 12 เดือน',
    answers: { temp: '38 องศา ไม่มีไอ', alg: 'แพ้แอสไพรินค่ะ นอกนั้นไม่มี', more: 'กลืนแล้วเจ็บมากตอนเช้าค่ะ' } },
  kid: { key: 'kid', id: 'TC-261018-0142', acct: 'สมใจ ใจดี', who: 'kid', symptoms: ['ไข้', 'น้ำมูก คัดจมูก'], note: '', urgent: [], mode: 'chat', photos: 0, joined: '14:12', waitS: 190, member: 'สมาชิก · ปรึกษาให้คนในบ้าน',
    answers: { temp: '38.5 องศา ยังไม่ได้ทานยา', alg: 'ไม่เคยแพ้ยาค่ะ', more: 'น้องยังเล่นได้ กินนมได้ค่ะ' } },
  ort: { key: 'ort', id: 'TC-261018-0143', acct: 'อรทัย พ.', who: null, person: { name: 'อรทัย พ.', first: 'อรทัย', rel: 'ตัวเอง', age: 41, weight: null, phone: '08x-xxx-2219', allergies: [], allergyState: 'unknown', meds: [] }, symptoms: ['ไข้', 'ไอ'], note: 'ไข้สูงมา 3 วัน เหนื่อยตอนเดิน', urgent: ['หายใจลำบาก'], mode: 'video', photos: 0, joined: '14:13', waitS: 130, member: 'ลูกค้าใหม่ · ปรึกษาครั้งแรก',
    answers: { temp: '39 องศา ไอมาก เดินแล้วเหนื่อย', alg: 'ไม่แน่ใจค่ะ จำไม่ได้', more: 'พูดยาว ๆ แล้วเหนื่อยด้วยค่ะ' } },
  psr: { key: 'psr', id: 'TC-261018-0144', acct: 'ประเสริฐ ม.', who: null, person: { name: 'ประเสริฐ ม.', first: 'ประเสริฐ', rel: 'ตัวเอง', age: 52, weight: 70, phone: '08x-xxx-4410', allergies: [], allergyState: 'none', meds: [] }, symptoms: ['ปวดหัว', 'ปวดกล้ามเนื้อ'], note: 'ยกของหนักเมื่อวาน', urgent: [], mode: 'chat', photos: 1, joined: '14:14', waitS: 55, member: 'สมาชิก · ปรึกษา 1 ครั้งใน 12 เดือน',
    answers: { temp: 'ไม่มีไข้ครับ ปวดหลังกับต้นแขน', alg: 'ไม่แพ้ยาครับ', more: 'ปวดมากตอนขยับแขนครับ' } }
};
/* allergy recorded in this session (by the pharmacist) sits on top of what the account already has */
SC.pkey = c => c.who || c.key;
SC.withAlg = (pk, base) => { const r = SC.S.alg?.[pk]; return r ? { ...base, ...r } : base; };
SC.casePerson = c => SC.withAlg(SC.pkey(c), c.who ? SC.person(c.who) : c.person);
SC.isFam = c => c.who ? c.who !== 'me' : !!c.person && c.person.rel !== 'ตัวเอง';
SC.acctFirst = c => c.af || (c.who ? SC.PEOPLE.me.first : c.person.first);
/* owner 21/10/2026: "ยังไม่ทำระบบนี้ เอาไว้เฟสถัดไป เพราะต้องทำ data ข้อมูลยาเยอะมาก". This phase never matches the medicines
   of an order against allergies, side effects or reaction reports: S303 shows the history, the pharmacist checks it */

/* reports of a reaction after using medicine (customer app C412/C413). S.adr says which one is open */
SC.ADR = {
  me: { id: 'AR-261018-0007', pk: 'me', drug: 'อะม็อกซีซิลลิน 500 มก.', ing: 'อะม็อกซีซิลลิน (ยาปฏิชีวนะ)', sku: 'TW-00655', from: 'TC-261002-0087 · 02/10/2026 · ภญ.ขวัญใจ', sym: ['ผื่น คัน'], since: 'ตั้งแต่เมื่อวาน', level: 'ปานกลาง', at: '14:12', want: 'ภายในวันนี้ ก่อน 21:00' },
  kid: { id: 'AR-261018-0008', pk: 'kid', drug: 'พาราเซตามอลชนิดน้ำ', ing: 'พาราเซตามอล (ชนิดน้ำ)', sku: 'TW-00530', from: 'ยาที่มีอยู่ที่บ้าน ไม่ได้ผูกกับเคสปรึกษา', sym: ['ปาก หน้า หรือตาบวม'], since: 'วันนี้', level: 'รุนแรง', at: '14:12', want: 'ทันที', severe: true }
};
/* item 74 (owner 20/10 "แพ้ยากับผลข้างเคียงมันไม่เหมือนกันนะ"): a side effect is recorded apart from allergies.
   It shows in the history on S303 and never blocks the medicine. ประเสริฐ had one on 09/10 (AR-261009-0002) */
const SFX_SEED = { psr: [{ ing: 'คลอร์เฟนิรามีน', sym: 'ง่วงมาก', by: 'ภญ.ขวัญใจ', at: '09/10/2026', nj: 'อาจจะใช่ 3' }] };
SC.sfxOf = pk => [...(SFX_SEED[pk] || []), ...((SC.S.sfx || {})[pk] || [])];
SC.adrOpen = pk => { const a = SC.S.adr; return a && a.st !== 'done' && a.who === pk ? SC.ADR[a.who] : null; };
/* antibiotics in an order: the drafted advice must not say "no antibiotics needed" next to one (real-user test 21/10) */
SC.isAbx = it => /ยาปฏิชีวนะ|อะม็อกซี|อะซิโทร|ด็อกซี|คลินดา|เซฟาเล็กซิน|ไดคล็อกซา|โรซิโทร/.test(it.name || '');
SC.abxIn = o => o && o.status !== 'cancelled' ? (o.items || []).filter(SC.isAbx).map(i => i.name) : [];
SC.NOAB_RE = /ไม่(?:จำเป็น)?ต้องใช้ยาปฏิชีวนะ|ไม่ใช้ยาปฏิชีวนะ/;

/* ---------- FDA round (owner decisions 20/10/2026 via the FDA review room, docs/2026-10-20-fda-approval-review.md) ---------- */
/* B8: the customer accepts the steps and risks before joining the queue (customer app A2): version and time per case */
SC.ACK_V = '1.0';
SC.ackTxt = c => `${SC.isFam(c) ? 'เจ้าของบัญชี' : 'ลูกค้า'}รับทราบขั้นตอนและความเสี่ยงแล้ว ฉบับ ${SC.ACK_V} · ${SC.NOW.date} ${SC.hhmm(SC.toMin(SC.S.joined?.[c.key] || c.joined) - 1)}`;
/* B14: who looked at, printed, exported or changed what. Kept 1 year, nobody can edit or delete it */
SC.logEv = (kind, what, ref = '', br) => {
  const S = SC.S, l = (S.audit = S.audit || []), t = SC.clockStr(), z = l[l.length - 1];
  if (z && z.kind === kind && z.ref === ref && z.by === S.me && z.t === t) return;
  l.push({ d: SC.NOW.date, t, by: S.me, br: br ?? S.branch, kind, what, ref });
};
/* delivery zone. Owner 21/10/2026 ("ให้ lock distant 15 km ตาม ปุ่ม 15 km ใน console ได้เลย", picked "15 กม. ทุกที่อยู่"): every
   address, Bangkok included, within 15 km of the branch by road distance, for Lalamove, Flash, DHL and Inter Express. Held twice
   in the customer app: the location when joining the queue and the address when choosing delivery. Stricter than FDA 2.2(1)
   (Bangkok, or within 15 km outside Bangkok), which it replaces. Outside it the customer can only pick up at the store.
   Switched off at S501 (owner 21/10): only Lalamove keeps the 15 km; consulting, Flash, DHL and cold have no limit */
/* owner 20/10 night: "ส่วน console จะมี switch สำหรับ admin control ตรงนี้ว่า lock 15 km มั้ย on off". ON by default and declared
   to the FDA; OFF only after written FDA permission. OFF = outside the zone may get parcel (Flash, DHL) only; Lalamove stays
   within 15 km, Inter Express stays inside the zone */
SC.zoneLocked = () => SC.S.zoneLock !== false;
SC.OUT_TAG = 'นอกเขต (ปลดล็อก)';
SC.ZONE_RULE = 'ส่งได้เฉพาะที่อยู่ที่ห่างสาขาไม่เกิน 15 กม. ตามระยะวิ่งจริง รวมในกรุงเทพ';
SC.zoneTxt = (to, km) => km == null ? 'ยังไม่ได้ตรวจระยะ' : km > 15 ? `ห่างสาขา ${km} กม. ตามระยะวิ่งจริง · นอกเขตส่งยา` : `ห่างสาขา ${km} กม. ตามระยะวิ่งจริง (ไม่เกิน 15) · อยู่ในเขตส่งยา`;
/* B5 (FDA 2.1(4)(ฉ)): each medicine line keeps generic name, trade name, strength, indication and warning. Filled from
   the picked label (S405) or the product data, the pharmacist can change them. A medical supply (เวชภัณฑ์) needs none */
const STR_RE = /\d[\d.,]*\s*(?:mg|mcg|g|ml|%|IU)(?:\s*\/\s*[\d.]*\s*(?:ml|g))?/gi;
SC.splitGen = g => { const s = String(g || ''); return { gen: s.replace(STR_RE, '').replace(/\s+/g, ' ').replace(/\s*\+\s*/g, ' + ').replace(/^\s*\+\s*|\s*\+\s*$/g, '').trim(), str: (s.match(STR_RE) || []).map(x => x.trim()).join(' + ') }; };
SC.isDrug = it => it.type !== 'เวชภัณฑ์';
SC.drugInfo = it => {
  const l = SC.labelOf?.(it), sp = SC.splitGen(l?.generic || it.gen);
  const base = { trade: l ? String(l.trade).replace(/\s*\[[^\]]*\]\s*$/, '') : it.name, gen: sp.gen, str: it.str || sp.str, ind: l?.ind || it.ind || '', warn: l?.warn || it.warn || '' };
  return { ...base, ...(it.info || {}), src: l ? 'label' : it.gen ? 'master' : 'none', lbl: l ? `${l.v.name} ฉบับ ${l.v.ver || 1}` : '' };
};
SC.INFO_NEED = [['gen', 'ชื่อสามัญ'], ['str', 'ความแรง'], ['ind', 'ข้อบ่งใช้']];
SC.infoMiss = it => SC.isDrug(it) ? SC.INFO_NEED.filter(([k]) => !String(SC.drugInfo(it)[k] || '').trim()).map(x => x[1]) : [];
/* B10: a cold-chain medicine goes by Inter Express (the store books by phone, no system link) or is picked up */
SC.hasCold = o => (o?.items || []).some(i => i.cold);
SC.COLD_TO = 'ต.เสาธงหิน อ.บางใหญ่ จ.นนทบุรี 11140';
SC.COLD_KM = 13;
/* the story customer's home, as in the customer app since 21/10 (88/12 ซอยทวีวัฒนา 25): 2.4 km from ตลาดเวิลด์ */
SC.HOME_TO = 'ต.ทวีวัฒนา อ.ทวีวัฒนา จ.กรุงเทพมหานคร 10170';
SC.HOME_KM = 2.4;

/* past consults (customer app history + follow-up source) */
SC.HISTORY = [
  { id: 'TC-261016-0058', date: '16/10/2026', time: '10:20', who: 'me', topic: 'ไข้ ไอ น้ำมูก', branch: 'tw', pharm: 'kj', bought: 190, mode: 'แชท', dur: '14 นาที', close: 'จ่ายยาแล้ว', follow: true },
  { id: 'TC-261002-0087', date: '02/10/2026', time: '19:40', who: 'me', topic: 'ไข้ ไอ เจ็บคอ', branch: 'tw', pharm: 'kj', bought: 265, mode: 'แชท', dur: '18 นาที', close: 'จ่ายยาแล้ว' },
  { id: 'TC-260914-0031', date: '14/09/2026', time: '10:05', who: 'kid', topic: 'ผื่น คัน', branch: 'on', pharm: 'tp', bought: 0, mode: 'วิดีโอ', dur: '09 นาที', close: 'ให้คำแนะนำ ไม่ต้องจ่ายยา' },
  { id: 'TC-260412-0012', date: '12/04/2026', time: '16:22', who: 'mom', topic: 'ถามเรื่องยา', branch: 'tw', pharm: 'kj', bought: 80, mode: 'แชท', dur: '11 นาที', close: 'จ่ายยาแล้ว' }
];

SC.SYMPTOMS = ['ไข้', 'ไอ', 'เจ็บคอ', 'น้ำมูก คัดจมูก', 'ปวดหัว', 'ปวดท้อง', 'ท้องเสีย', 'ผื่น คัน', 'ปวดกล้ามเนื้อ', 'ตาแดง แสบตา', 'ถามเรื่องยา'];
SC.URGENT = ['หายใจลำบาก', 'เจ็บแน่นหน้าอก', 'ซึม สับสน หรือชัก', 'ปากบวม หน้าบวมหลังใช้ยา', 'อาเจียนหรือถ่ายเป็นเลือด', 'ไข้สูงในเด็กเล็กต่ำกว่า 3 เดือน'];

/* drug classes: "ยาอันตราย" is shown to customers as "ต้องจ่ายโดยเภสัชกร" (customer app 64-room.js orderCard) */
SC.CLASS = { 'ยาอันตราย': ['ต้องจ่ายโดยเภสัชกร', 'warn'], 'ยาสามัญประจำบ้าน': ['ยาสามัญประจำบ้าน', 'ok'], 'เวชภัณฑ์': ['เวชภัณฑ์', 'muted'], 'ยาควบคุมพิเศษ': ['ยาควบคุมพิเศษ', 'danger'] };
SC.clsName = t => (SC.CLASS[t] || [t])[0];

/* ---------- casePlan: one rule per symptom (port of src-05/js/64-room.js TP.casePlan, keep in sync) ---------- */
SC.ORDER_ITEMS = [
  { sku: 'TW-10234', name: 'ยาอมบรรเทาอาการเจ็บคอ', qty: 1, unit: 'กล่อง', type: 'ยาอันตราย', price: 120, how: 'อมครั้งละ 1 เม็ด ทุก 3 ชั่วโมง ไม่เกิน 8 เม็ดต่อวัน', stock: 14 },
  { sku: 'TW-00512', name: 'พาราเซตามอล 500 มก.', qty: 1, unit: 'แผง', type: 'ยาสามัญประจำบ้าน', price: 40, how: 'ครั้งละ 1 เม็ด เมื่อมีไข้ ห่างกันอย่างน้อย 6 ชั่วโมง', stock: 86, has: ['พาราเซตามอล'] },
  { sku: 'TW-20871', name: 'สเปรย์พ่นคอ', qty: 1, unit: 'ขวด', type: 'ยาอันตราย', price: 225, how: 'พ่น 2 ครั้ง วันละ 3 ครั้ง หลังอาหาร', stock: 6, has: ['เบนซิดามีน'] }
];
SC.MED = {
  brom: { sku: 'TW-00733', name: 'บรอมเฮกซีน 8 มก. (ละลายเสมหะ)', qty: 1, unit: 'แผง', type: 'ยาสามัญประจำบ้าน', price: 35, how: 'ครั้งละ 1 เม็ด วันละ 3 ครั้ง หลังอาหาร', stock: 40 },
  cpm: { sku: 'TW-00418', name: 'คลอร์เฟนิรามีน 4 มก. (ลดน้ำมูก)', qty: 1, unit: 'แผง', type: 'ยาสามัญประจำบ้าน', price: 25, how: 'ครั้งละ 1 เม็ด วันละ 3 ครั้ง อาจทำให้ง่วง เลี่ยงการขับรถ', stock: 52 },
  antacid: { sku: 'TW-01120', name: 'ยาลดกรดชนิดน้ำ', qty: 1, unit: 'ขวด 240 มล.', type: 'ยาสามัญประจำบ้าน', price: 55, how: 'ครั้งละ 15 มล. หลังอาหารและก่อนนอน เมื่อมีอาการ', stock: 18 },
  ors: { sku: 'TW-00901', name: 'ผงเกลือแร่ (ORS)', qty: 5, unit: 'ซอง', type: 'ยาสามัญประจำบ้าน', price: 30, how: 'ละลายน้ำสะอาดตามฉลาก จิบบ่อย ๆ หลังถ่ายแต่ละครั้ง', stock: 120 },
  calamine: { sku: 'TW-01544', name: 'คาลาไมน์โลชั่น', qty: 1, unit: 'ขวด 60 มล.', type: 'ยาสามัญประจำบ้าน', price: 45, how: 'ทาบาง ๆ บริเวณที่คัน วันละ 3 ถึง 4 ครั้ง', stock: 22 },
  tears: { sku: 'TW-03310', name: 'น้ำตาเทียม', qty: 1, unit: 'ขวด', type: 'เวชภัณฑ์', price: 95, how: 'หยอดครั้งละ 1 หยด เมื่อตาแห้งหรือแสบตา', stock: 9 },
  gel: { sku: 'TW-05102', name: 'แผ่นเจลลดไข้สำหรับเด็ก', qty: 1, unit: 'กล่อง', type: 'เวชภัณฑ์', price: 89, how: 'แปะหน้าผากเมื่อตัวร้อน ร่วมกับเช็ดตัวด้วยน้ำอุ่น', stock: 11 },
  saline: { sku: 'TW-05230', name: 'น้ำเกลือหยดจมูกสำหรับเด็ก', qty: 1, unit: 'ขวด', type: 'เวชภัณฑ์', price: 65, how: 'หยดจมูกข้างละ 1 ถึง 2 หยด ก่อนเช็ดหรือดูดน้ำมูก วันละ 3 ถึง 4 ครั้ง', stock: 7 }
};
SC.kidParaMl = w => Math.max(5, Math.min(15, Math.round(w / 2)));
SC.kidPara = w => ({ sku: 'TW-00530', name: 'พาราเซตามอลชนิดน้ำ 120 มก./5 มล.', qty: 1, unit: 'ขวด 60 มล.', type: 'ยาสามัญประจำบ้าน', price: 45, how: `ครั้งละ ${SC.kidParaMl(w)} มล. (คิดจากน้ำหนัก ${w} กก.) เมื่อมีไข้ ห่างกันอย่างน้อย 4 ชั่วโมง ไม่เกิน 5 ครั้งต่อวัน`, stock: 15, has: ['พาราเซตามอล'], kidDose: { ml: SC.kidParaMl(w), w, mgPerMl: 24 } });
SC.casePlan = c => {
  const p = SC.casePerson(c), fam = SC.isFam(c);
  const kid = !!p.child || (p.age && p.age < 12), sy = (c.symptoms || []).join(' '), note = String(c.note || '');
  const has = re => re.test(sy), cough = has(/ไอ|เสมหะ/), fever = has(/ไข้/), throat = has(/เจ็บคอ/), ache = has(/ปวดหัว|ปวดกล้ามเนื้อ/);
  const nose = has(/น้ำมูก|คัดจมูก/), belly = has(/ปวดท้อง/), loose = has(/ท้องเสีย/), rash = has(/ผื่น|คัน/), eye = has(/ตาแดง|แสบตา/);
  const days = /\d+\s*วัน|เมื่อวาน|เมื่อคืน/.test(note), temp = /3[5-9](\.\d)?|องศา/.test(note);
  const items = [], add = (...xs) => xs.forEach(x => { if (!items.some(i => i.name === x.name)) items.push({ ...x }); });
  if (kid) {
    const w = +p.weight || 20;
    if (fever) add(SC.kidPara(w), SC.MED.gel);
    if (ache) add(SC.kidPara(w));
    if (cough || nose) add(SC.MED.saline);
    if (loose) add(SC.MED.ors);
    if (rash) add(SC.MED.calamine);
  } else {
    if (throat) add(SC.ORDER_ITEMS[0]);
    if (fever || ache || throat) add(SC.ORDER_ITEMS[1]);
    if (cough) add(SC.MED.brom);
    if (throat && !cough) add(SC.ORDER_ITEMS[2]);
    if (nose) add(SC.MED.cpm);
    if (belly) add(SC.MED.antacid);
    if (loose) add(SC.MED.ors);
    if (rash) add(SC.MED.calamine);
    if (eye) add(SC.MED.tears);
  }
  const q = kid && fever ? (temp ? 'ทานยาลดไข้ไปแล้วหรือยังคะ' : 'น้องมีไข้กี่องศาคะ ทานยาลดไข้ไปแล้วหรือยังคะ')
    : cough ? (!days ? 'ไอมากี่วันแล้วคะ มีเสมหะไหมคะ' : !fever ? 'มีไข้ร่วมด้วยไหมคะ เสมหะสีอะไรคะ' : 'เสมหะสีอะไรคะ ใส หรือเหลืองเขียว')
    : fever ? (temp && days ? 'ทานยาลดไข้ไปแล้วหรือยังคะ' : temp ? 'เป็นมากี่วันแล้วคะ' : days ? 'มีไข้วัดได้กี่องศาคะ' : 'มีไข้วัดได้กี่องศาคะ เป็นมากี่วันแล้วคะ')
    : throat ? (days ? 'มีไข้ร่วมด้วยไหมคะ' : 'เจ็บคอมากี่วันแล้วคะ กลืนแล้วเจ็บไหมคะ')
    : days ? 'มีอาการอื่นร่วมด้วยไหมคะ' : 'เป็นมากี่วันแล้วคะ มีอาการอื่นร่วมด้วยไหมคะ';
  const NOAB = 'ยังไม่จำเป็นต้องใช้ยาปฏิชีวนะ';
  const [dx, care] = kid && fever ? [`จากอาการที่เล่า ดูแลที่บ้านได้ก่อน ${NOAB}`, 'ให้ดื่มน้ำบ่อย ๆ และเช็ดตัวลดไข้ด้วยน้ำอุ่น']
    : kid && (cough || nose) ? ['จากอาการที่เล่า ดูแลที่บ้านได้ก่อน เด็กเล็กไม่แนะนำให้ใช้ยาแก้ไอหรือยาลดน้ำมูกเอง', 'ล้างจมูกด้วยน้ำเกลือ และให้ดื่มน้ำอุ่นบ่อย ๆ']
    : cough ? [`จากอาการที่เล่า ดูแลตามอาการได้ ${NOAB}`, 'ดื่มน้ำอุ่นบ่อย ๆ ช่วยให้เสมหะออกง่ายขึ้น']
    : fever || throat ? [`จากอาการที่เล่า ดูแลตามอาการได้ ${NOAB}`, 'ดื่มน้ำมาก ๆ และพักผ่อนให้เพียงพอ']
    : ache ? ['จากอาการที่เล่า ดูแลตามอาการได้ พักการใช้งานส่วนที่ปวด', 'ประคบเย็นช่วงแรก ดื่มน้ำมาก ๆ และพักผ่อนให้เพียงพอ']
    : nose ? ['จากอาการที่เล่า ดูแลตามอาการได้', 'ล้างจมูกด้วยน้ำเกลือช่วยได้มาก']
    : belly ? ['จากอาการที่เล่า ทานอาหารอ่อน ๆ เลี่ยงของเผ็ด ของมัน และกาแฟ', 'ถ้าปวดมากขึ้น หรือปวดท้องด้านขวาล่าง ให้ไปพบแพทย์ทันที']
    : loose ? ['จากอาการที่เล่า สำคัญที่สุดคือดื่มเกลือแร่ทดแทนน้ำที่เสียไป ยังไม่ต้องใช้ยาหยุดถ่าย', 'ถ้าถ่ายเป็นเลือด หรือมีไข้สูง ให้ไปพบแพทย์']
    : rash ? ['จากอาการที่เล่า ใช้ยาทาบรรเทาอาการคันได้ก่อน', 'ถ้าผื่นลามเร็ว ปาก หน้า หรือตาบวม ให้ไปโรงพยาบาลทันที']
    : eye ? ['จากอาการที่เล่า ใช้น้ำตาเทียมได้ก่อน และไม่ขยี้ตา', 'ถ้าตามัว ปวดตามาก หรือมีขี้ตาสีเขียว ให้ไปพบแพทย์']
    : ['จากที่เล่ามา แนะนำวิธีดูแลตามนี้', 'ถ้าอาการไม่ดีขึ้นใน 3 วัน ให้ไปพบแพทย์'];
  const see = fever || cough ? 'ถ้ามีไข้เกิน 3 วัน หรือหายใจเหนื่อย ให้ไปพบแพทย์' : 'ถ้าอาการไม่ดีขึ้นใน 3 วัน ให้ไปพบแพทย์';
  const meds = (p.meds || []).filter(Boolean), alg = (p.allergies || []).filter(Boolean);
  const call = fam ? (kid ? `น้อง${p.first}` : `คุณ${p.first}`) : '';
  const chk = meds.length || alg.length ? `ดิฉันดู${meds.length ? `ยาประจำ ${meds.join(', ')}` : ''}${meds.length && alg.length ? ' และ' : ''}${alg.length ? `ประวัติแพ้${alg.join(', ')}` : ''}${fam ? ` ของ${call}` : ''}แล้ว ยาที่จัดให้ใช้ร่วมกันได้ ไม่ต้องหยุดยาประจำนะคะ` : '';
  const algQ = `${fam ? call : 'คุณ' + SC.acctFirst(c)}เคยแพ้ยาอะไรไหมคะ`;
  /* staff-only cases: headache or muscle pain without fever gets its own warning signs (the customer app has no such case) */
  const warn = ache && !fever && !throat && !cough ? ['ปวดหัวรุนแรงทันที หรือปวดร่วมกับคอแข็ง อาเจียน', 'แขนขาอ่อนแรง ชา หรือพูดไม่ชัด', 'มีผื่นขึ้น ปาก หน้า หรือตาบวมหลังใช้ยา']
    : ['หายใจลำบาก หรือเจ็บแน่นหน้าอก', 'ไข้สูงเกิน 39 องศา หรือไข้ไม่ลดภายใน 3 วัน', 'มีผื่นขึ้น ปาก หน้า หรือตาบวมหลังใช้ยา'];
  return { p, fam, kid, call, items, q, dx, care, see, chk, warn, algQ };
};

/* words that name a condition: advice and chat text must not diagnose (owner decision, legal guidance).
   A word list plus patterns (โรค..., ...อักเสบ, ติดเชื้อ, หวัด) so new names are caught too */
SC.DX_WORDS = ['ไข้หวัดใหญ่', 'ไข้หวัด', 'หวัดลงคอ', 'คออักเสบ', 'ทอนซิลอักเสบ', 'ต่อมทอนซิล', 'หลอดลมอักเสบ', 'ปอดอักเสบ', 'ปอดบวม', 'ไซนัสอักเสบ', 'ภูมิแพ้', 'กรดไหลย้อน', 'กระเพาะอักเสบ', 'ลำไส้อักเสบ', 'โควิด', 'ไข้เลือดออก', 'อาหารเป็นพิษ', 'กล้ามเนื้ออักเสบ', 'ไมเกรน', 'เบาหวาน', 'หอบหืด', 'ความดันโลหิตสูง', 'ความดันสูง', 'ไทรอยด์'];
SC.DX_WORDS.push('โรคกระเพาะ', 'โรคหัวใจ', 'โรคหวัด', 'เป็นหวัด', 'ติดเชื้อแบคทีเรีย', 'ติดเชื้อไวรัส');
SC.DX_WORDS.push('เริม', 'งูสวัด', 'มะเร็ง', 'เอชไอวี', 'HIV', 'covid', 'COVID', 'Covid');   // QA R3B-08
SC.DX_ROOTS = ['โรค', 'อักเสบ', 'ติดเชื้อ', 'หวัด'];
SC.dxHits = s => {
  const t = String(s || ''); let h = SC.DX_WORDS.filter(w => t.includes(w));
  h = h.filter(w => !h.some(x => x !== w && x.includes(w)));
  SC.DX_ROOTS.forEach(r => { if (t.includes(r) && !h.some(w => w.includes(r))) h.push(r); });
  return h;
};

/* ---------- tiny event bus ---------- */
const BUS = {};
SC.on = (ev, fn) => { (BUS[ev] = BUS[ev] || []).push(fn); };
SC.emit = (ev, d) => (BUS[ev] || []).forEach(fn => { try { fn(d); } catch (err) { console.error(err); } });

/* the one mutable state object (panel toggles and screens both write here) */
SC.fresh = () => ({
  branch: 'tw', me: 'kj',
  dutyBy: {},                                    // branch -> pharmacist on duty, when someone else signed in (login decides)
  intake: { tw: 'open', on: 'open' },            // open | pause | closed (customer app branchState: อ่อนนุช เปิดรับ รอ 1 คน)
  q: { tw: ['smj', 'ort', 'psr'], on: ['on1'] },  // queue per branch, in order of joining
  pause: null,                                   // { min, until } while paused
  sysOff: false, sysInfo: null,                  // { why, msg, at, by } as entered in the switch-off dialog
  activeCase: null, accT: 0, accAt: '',          // the one open consult of this branch, when it was accepted (real ms, story time)
  clk: null, clkS: 0, joined: {},                // the one story clock (minutes since midnight, seconds) and late joiners
  algLog: {},                                    // allergy changes per person: { from, to, why, at, by }
  chats: {}, orders: {}, closeForm: null, prefill: {},
  alg: {},                                       // allergy recorded by the pharmacist, per person
  adr: { who: 'me', st: 'new' },                 // the open reaction report
  nq: {}, fu: {}, closed: [], lastClosed: null,
  ov: null,                                      // a dialog not tied to a screen state (confirm, pickup code, pause length)
  st: {}                                         // st[screenId] = state key
});
SC.S = SC.fresh();

/* one story clock for the whole session. Each screen suggests a time; the clock only moves forward and also runs in
   real time. A state picked in the review panel starts a new story at that screen's time */
SC.clk = () => SC.S.clk ?? SC.toMin(SC.NOW.time);
SC.clockStr = () => SC.hhmm(SC.clk());
SC.bump = m => { SC.S.clk = Math.max(SC.clk(), m); };
/* a screen's own sample time applies on a review-panel jump; walking the story keeps the running clock (lead 21/10) */
SC.at = t => SC.S._reseed || SC.S.clk == null ? t : SC.clockStr();
SC.waitS = c => Math.max(0, (SC.clk() - SC.toMin(SC.S.joined?.[c.key] || c.joined)) * 60 + (SC.S.clkS || 0));
/* "ยาประจำ" is only known once the allergy question was asked: never print "ไม่มี" for someone not asked yet */
SC.medsTxt = p => (p.meds || []).filter(Boolean).join(', ') || (p.allergyState === 'unknown' && !(p.allergies || []).length ? 'ยังไม่ได้ระบุ' : 'ไม่มี');
/* allergies a pharmacist removed: listed in the S303 history */
SC.algRemoved = pk => (SC.S.algLog?.[pk] || []).filter(x => x.removed?.length);

/* ===== 10-router.js ===== */
/* =====================================================================
   10 · Router: screen registry, state per screen, shell (side bar + top bar), overlays,
   actions, toasts, timers. Review codes: S + group digit + 2 digits; a state adds .n
   ===================================================================== */
(() => {
const { $, $$, esc, ic } = SC;
const SCREENS = SC.SCREENS = {}, ORDER = SC.ORDER = [], ACTS = SC.ACTS = {};
SC.GROUPS = [[1, 'เริ่มกะ'], [2, 'คิว'], [3, 'ระหว่างปรึกษา'], [4, 'หลังปรึกษา'], [5, 'ตั้งค่าร้าน'], [6, 'จอผิดปกติ']];

/* def: { code, group, title, nav, shell:false, fill, states:[[key,label,{cust,back,notes}]], cust, notes, wait,
          head(ctx)->{title,sub}, now(ctx), prep(S,st,p)->state to use instead (optional), render(ctx), overlay(ctx),
          mount(el,ctx), sims(ctx)->[{label,run}] }  back may be a function of the current screen */
SC.screen = (id, def) => { def.id = id; SCREENS[id] = def; ORDER.push(id); };
SC.act = (name, fn) => { ACTS[name] = fn; };
SC.stOf = id => SC.S.st[id] || SCREENS[id]?.states?.[0]?.[0] || 'normal';
SC.stDef = (id, k) => (SCREENS[id]?.states || []).find(s => s[0] === k);
SC.backOf = (c = cur) => { const b = SC.stDef(c.id, c.st)?.[2]?.back; return typeof b === 'function' ? b(c) : b; };
SC.codeOf = (id, k) => {
  const d = SCREENS[id]; if (!d) return '';
  const st = d.states || [], i = st.findIndex(s => s[0] === (k || SC.stOf(id)));
  return st.length > 1 && i >= 0 ? `${d.code}.${i + 1}` : d.code;
};
SC.titleOf = (id, k) => {
  const d = SCREENS[id]; if (!d) return '';
  const s = SC.stDef(id, k || SC.stOf(id));
  return d.title + (d.states?.length > 1 && s ? ' · ' + s[1] : '');
};
/* a state picked in the review panel starts the story fresh (keeps who is signed in and where) */
SC.reseed = () => { const o = SC.S; SC.S = { ...SC.fresh(), me: o.me, branch: o.branch, st: o.st }; SC.S._reseed = true; };

const con = $('#con'), ovl = $('#ovl'), toasts = $('#toasts'), badge = $('#codeBadge');
let cur = null, timers = [], leaves = [];
SC.cur = () => cur;
const clearTimers = () => { timers.forEach(t => clearInterval(t)); timers = []; leaves.forEach(f => { try { f(); } catch (e) { console.error(e); } }); leaves = []; };
const ctxOf = () => ({
  id: cur.id, st: cur.st, p: cur.p || {}, S: SC.S,
  every(fn, ms) { timers.push(setInterval(fn, ms)); },
  later(fn, ms) { timers.push(setTimeout(fn, ms)); },
  onLeave(fn) { leaves.push(fn); }
});

/* ---------- navigation ---------- */
/* S402 was merged into S401 on 20/10/2026 (owner: "S401 402 น่าจะรวมเป็นก้อนเดียว"): old links still land there */
const ALIAS = SC.ALIAS = { adr: ['follow', { new: 'adr', severe: 'adrsevere', reply: 'adrreply', done: 'adrdone', empty: 'empty' }] };
SC.go = (id, o = {}) => {
  if (ALIAS[id]) { const [to, m] = ALIAS[id]; o = { ...o, st: m[o.st] || 'adr', p: { ...(o.p || {}), k: o.p?.k || (o.p?.r === 'psr' ? 'adr-psr' : 'adr-cur') } }; id = to; }
  let def = SCREENS[id]; if (!def) return console.warn('no screen', id);
  /* store staff (item 67) open S404 and S603 only. A review-panel jump opens the screen as the pharmacist on duty, like
     superadmin below; anything else shows S603.2 "ไม่มีสิทธิ์" */
  if (SC.isStaff() && !def.staff) {
    if (!SC.S._reseed) { id = 'denied'; def = SCREENS.denied; o = { st: 'role', p: {} }; }
    else if (!def.admin) { const d = SC.duty(SC.S.branch) || SC.PHARM.kj; SC.S.me = d.id; SC.S.branch = d.home || SC.S.branch; SC.toast(`แผงตรวจ: เปิดในชื่อ ${d.short} พนักงานร้านเปิดจอนี้ไม่ได้`, 'user-check'); }
  }
  /* who is signed in decides what can be opened. Only the review panel or a link can reach these, so it switches and says so */
  if (def.admin && !SC.isAdmin()) { SC.S.me = 'admin'; SC.toast('แผงตรวจ: สลับเป็นผู้ดูแลระบบ จอนี้เห็นเฉพาะผู้ดูแลระบบ', 'lock'); }
  if (def.duty && SC.isAdmin()) { const d = SC.duty(SC.S.branch) || SC.PHARM.kj; SC.S.me = d.id; SC.S.branch = d.home || SC.S.branch; SC.toast(`แผงตรวจ: เปิดในชื่อ ${d.short} ผู้ดูแลระบบรับเคสไม่ได้`, 'user-check'); }
  let st = o.st || (o.keep && SC.S.st[id]) || def.states?.[0]?.[0] || 'normal';
  const p = { ...(o.p || {}) };
  const alt = def.prep?.(SC.S, st, p);
  if (typeof alt === 'string' && SC.stDef(id, alt)) st = alt;
  SC.S.st[id] = st;
  if (!o.keepOv) SC.S.ov = null;
  cur = { id, st, p };
  render(o);
  try { const u = new URL(location.href); u.searchParams.set('screen', id); u.searchParams.set('state', st); history.replaceState(null, '', u); } catch (e) { /* file:// may refuse; the badge still says where we are */ }
  SC.emit('screen', cur);
};
SC.setSt = (k, o = {}) => SC.go(cur.id, { st: k, p: o.p || cur.p, focus: o.focus });
SC.refresh = () => render({ keepScroll: true });
/* a field committed by leaving it (change) must not redraw the page under the button being pressed: the redraw waits for the click
   (real user 20/10: the first tap on a language tab after typing in "วิธีใช้" did nothing) */
let ptr = false;
document.addEventListener('pointerdown', () => { ptr = true; }, true);
document.addEventListener('pointerup', () => setTimeout(() => { ptr = false; }, 0), true);
SC.afterTap = fn => {
  if (!ptr) return fn();
  let done = false; const go = () => { if (!done) { done = true; setTimeout(fn, 0); } };
  document.addEventListener('click', go, { once: true }); document.addEventListener('pointerup', () => setTimeout(go, 60), { once: true });
};
/* a dialog that is not a screen state (confirm, pickup code, pause length): Esc and the scrim close it */
SC.openOv = fn => { SC.S.ov = fn; render({ keepScroll: true }); };
SC.closeOv = () => { SC.S.ov = null; render({ keepScroll: true }); };

/* the urgent case stays in sight on every screen once it has joined the queue, the queue included, always in the same
   place (UX review 20/10 UX-02). Calling is one tap from here, and everyone in the store sees who already called (UX-04) */
const urgMin = c => Math.max(1, Math.floor(SC.waitS(c) / 60)), URG_LONG = 10;
function urgentStrip(def, ctx) {
  /* superadmin watches every branch (real user 20/10: switching to อ่อนนุช hid the urgent case waiting at ตลาดเวิลด์) */
  const S = SC.S, brs = SC.isAdmin() ? SC.BRANCHES.map(b => b.id) : [S.branch];
  const list = brs.flatMap(b => (S.q[b] || []).map(k => SC.CASES[k] && { c: SC.CASES[k], b })).filter(x => x && x.c.urgent?.length && SC.clk() >= SC.toMin(S.joined?.[x.c.key] || x.c.joined));
  if (!list.length || def.shell === false || SC.isStaff()) return '';   // staff never see symptoms (item 67)
  const { c, b: cb } = list[0], other = cb !== S.branch, p = SC.casePerson(c), m = urgMin(c);
  if (def.id === 'preview' && ctx.p.k === c.key) return '';
  const call = S.urgCalled?.[c.key], by = call && SC.PHARM[call.by], long = !call && m >= URG_LONG;
  /* from 10 minutes with no call the strip turns dark red with white words (real user 20/10: "หน้าตาเหมือนเดิม ไม่ได้ดังขึ้น"). Colour + words, no flashing */
  const wait = call ? `<span class="urg-ok">${ic('phone-call', 14, 2)}โทรแล้ว ${esc(call.at)} โดย ${esc(by?.short || 'เภสัชกร')}</span>`
    : `รอ <b class="num" data-urgk="${c.key}">${m}</b> นาที<span class="urg-none"${long ? '' : ' hidden'}> <b>ยังไม่มีใครโทร</b></span>`;
  return `<div class="sys-strip urg-strip${long ? ' long' : ''}" role="alert">${ic('octagon-alert', 16, 2)}<span>เคสธงด่วน${other ? `ที่${esc(SC.branch(cb).name)}` : ''}: ${esc(p.name)} แจ้ง "${esc(c.urgent.join(', '))}" · ${wait}</span><span class="sp"></span>
    ${call || SC.isAdmin() ? '' : `<button type="button" class="btn danger sm" data-a="callCust" data-v="${c.key}" aria-label="ดูเบอร์โทรของ ${esc(p.name)}">${ic('phone', 15, 2)}<span>ดูเบอร์ ${esc(p.first || p.name)}</span></button>`}${other ? `<button type="button" class="btn secondary sm" data-a="urgView" data-v="${c.key}" data-b="${cb}">${ic('eye', 15, 2)}<span>ดูเคส</span></button>` : `<button type="button" class="btn secondary sm" data-go="preview" data-st="urgent" data-p='{"k":"${c.key}"}'>${ic('eye', 15, 2)}<span>ดูเคส</span></button>`}</div>`;
}
function shell(def, ctx, inner) {
  const S = SC.S, b = SC.branch(), me = SC.me(), h = def.head?.(ctx) || {};
  const ns = typeof def.nav === 'function' ? def.nav(ctx) : def.nav, badges = SC.badges();
  const item = (key, label, short, icon, go, bd, red) => `<button type="button" class="sb-i" data-go="${go}" ${ns === key ? 'aria-current="page"' : ''} title="${esc(label)}">${ic(icon, 19, 1.9)}<span class="l">${esc(label)}</span><span class="ls" aria-hidden="true">${esc(short)}</span>${bd ? `<span class="sb-b${red ? ' red' : ''}">${bd}</span>` : ''}</button>`;
  const ac = S.activeCase && SC.CASES[S.activeCase], acMode = ac && (S.modeNow?.[ac.key] || ac.mode);
  const staff = SC.isStaff(), acCard = ac && !staff ? `<button type="button" class="sb-case" data-go="room" data-st="talk" data-p='{"k":"${ac.key}"}' title="กลับเข้าห้องปรึกษา">
      <small>กำลังปรึกษา</small><b>${ic(acMode === 'video' ? 'video' : 'message-circle', 16, 2)}<span class="sr">ห้องปรึกษา</span>${esc(SC.casePerson(ac).name)}</b><span class="sb-cm">${acMode === 'video' ? 'วิดีโอคอล' : 'แชท'}</span><i class="sb-cs" aria-hidden="true" title="${esc(SC.casePerson(ac).name)}">${esc(SC.casePerson(ac).first || SC.casePerson(ac).name)}</i></button>` : '';
  const nq = S.nightOpen && SC.CASES[S.nightOpen], nqCard = nq && !staff && SC.nqOf?.(nq.key)?.st !== 'closed' ? `<button type="button" class="sb-case" data-go="room" data-st="night" data-p='{"k":"${nq.key}"}' title="กลับไปตอบคำถาม">
      <small>กำลังตอบคำถาม</small><b>${ic('moon', 16, 2)}${esc(nq.acct)}</b><span class="sb-cm">คำถามนอกเวลา</span><i class="sb-cs" aria-hidden="true" title="${esc(nq.acct)}">${esc(nq.af || nq.acct)}</i></button>` : '';
  const intake = S.intake[S.branch], admin = SC.isAdmin();
  /* superadmin reaches every branch: the branch name becomes a switch. A branch account only ever sees its own */
  const brSel = admin ? `<label class="tb-sel" title="เปลี่ยนสาขาที่ดู">${ic('store', 16, 2)}<span class="tb-sel-l">ดูสาขา</span><select id="brSwitch" aria-label="ดูสาขา">${SC.BRANCHES.map(x => `<option value="${x.id}"${x.id === S.branch ? ' selected' : ''}>${esc(x.short)} (รอ ${SC.qlen(x.id)})</option>`).join('')}</select>${ic('chevron-down', 14, 2)}</label>` : `<span>${esc(b.short)}</span>`;
  const seg = `<div class="seg" role="group" aria-label="รับเคสของ${esc(b.name)}">
      <button type="button" class="s-ok" data-a="intake" data-v="open" aria-pressed="${intake === 'open'}"${S.sysOff ? ' disabled' : ''}>${ic('circle-play', 15, 2)}เปิดรับ</button>
      <button type="button" class="s-warn" data-a="intake" data-v="pause" aria-pressed="${intake === 'pause'}"${S.sysOff ? ' disabled' : ''}>${ic('circle-pause', 15, 2)}พัก</button>
      <button type="button" class="s-off" data-a="intake" data-v="closed" aria-pressed="${intake === 'closed'}"${S.sysOff ? ' disabled' : ''}>${ic('ban', 15, 2)}ปิดรับ</button></div>`;
  const now = { date: SC.NOW.date, time: SC.clockStr() };
  return `<a class="skip" href="#content" data-a="skip">ข้ามไปเนื้อหา</a>
    <aside class="sb on-teal" aria-label="เมนูคอนโซล">
      <div class="sb-logo">${SC.logo()}</div>
      <p class="sb-app">คอนโซลร้าน · ปรึกษาเภสัชกร</p>
      <nav class="sb-nav">
        ${acCard}${nqCard}
        ${staff ? `${item('pack', 'จัดยาและส่ง', 'จัดส่ง', 'package', 'pack', badges.pack)}
        ${item('products', 'สินค้าในสาขา', 'สินค้า', 'pill', 'products')}` : `${item('queue', 'คิวปรึกษา', 'คิว', 'layout-list', 'queue', badges.queue, badges.qRed)}
        ${item('night', 'คำถามนอกเวลา', 'นอกเวลา', 'moon', 'night', badges.night)}
        ${item('follow', 'ติดตามหลังปรึกษา', 'ติดตาม', 'heart-pulse', 'follow', badges.follow, badges.fRed)}
        ${item('pack', 'จัดยาและส่ง', 'จัดส่ง', 'package', 'pack', badges.pack)}
        ${item('products', 'สินค้าในสาขา', 'สินค้า', 'pill', 'products')}
        ${item('labels', 'ฉลากยา', 'ฉลาก', 'tag', 'labels')}
        ${item('log', 'ประวัติเคส', 'ประวัติ', 'history', 'log')}`}
        ${admin ? `<p class="sb-h">ผู้ดูแลระบบ</p>
        ${item('settings', 'สาขาและเวลาทำการ', 'สาขา', 'settings', 'settings')}
        ${item('pharm', 'เภสัชกรและใบอนุญาต', 'ใบอนุญาต', 'badge-check', 'pharm')}
        ${item('roster', 'เภสัชกรที่เข้าระบบ', 'เภสัชกร', 'user-check', 'roster')}
        ${item('audit', 'ตรวจสอบย้อนหลัง', 'ตรวจสอบ', 'file-text', 'audit')}
        ${item('access', 'บันทึกการเข้าถึง', 'บันทึก', 'shield-check', 'access')}` : ''}
      </nav>
      <div class="sb-me"><span class="av sm">${esc(me.ini)}</span><div class="grow"><b class="ell">${esc(me.short)}</b><span>${admin ? `${esc(me.staff)} · ดูได้ทุกสาขา` : staff ? `พนักงานร้าน · ${esc(b.short)}` : `${esc(me.lic)} · ${esc(b.short)}`}</span></div></div>
    </aside>
    <div class="main">
      ${S.sysOff ? `<div class="sys-strip" role="status">${ic('power', 16, 2)}<span>ผู้ดูแลระบบปิดระบบปรึกษาชั่วคราว ลูกค้าใหม่เข้าคิวไม่ได้ · เคสที่เปิดอยู่คุยต่อได้</span><span class="sp"></span>${admin && ctx.id !== 'settings' ? '<button type="button" class="link" data-go="settings" data-st="sysoff">ดูการตั้งค่า</button>' : ''}</div>` : ''}
      ${urgentStrip(def, ctx)}${SC.zoneLocked() || def.shell === false ? '' : `<div class="sys-strip warn zone-strip" role="status">${ic('map-pin', 16, 2)}<span>ปลดล็อกเขตส่งยาอยู่ · ปรึกษาได้ทุกที่ · ส่งพัสดุและส่งเย็นนอกเขตได้ · ส่งด่วนยังไม่เกิน 15 กม. · ตั้งแต่ ${esc(SC.S.zoneInfo?.at || '')} โดย ${esc(SC.PHARM[SC.S.zoneInfo?.by]?.short || 'ผู้ดูแลระบบ')}</span></div>`}
      <header class="tb">
        <div class="tb-t"><h1 tabindex="-1">${esc(h.title || def.title)}</h1>${h.sub ? `<p>${esc(h.sub)}</p>` : ''}</div>
        <div class="tb-br">${brSel}${staff ? '' : seg}${admin ? '' : `<button type="button" class="btn secondary tb-pick" data-a="pickCode" aria-label="รับยาด้วยรหัส" title="ลูกค้ามารับยาที่เคาน์เตอร์">${ic('store', 16, 2)}<span class="tb-pl">รับยาด้วยรหัส</span><span class="tb-ps" aria-hidden="true">รหัสรับยา</span></button>`}</div>
        <div class="tb-clock" aria-label="เวลาร้าน"><span class="num">${esc(now.time)}</span><small>${esc(now.date)}</small></div>
        <button type="button" class="tb-ib" data-a="soundInfo" aria-label="เสียงแจ้งเตือนเปิดอยู่" title="เสียงแจ้งเตือนเปิดอยู่">${ic('volume-2', 19, 1.9)}</button>
        <button type="button" class="tb-ib" data-a="logout" aria-label="ออกจากระบบ" title="ออกจากระบบ">${ic('log-out', 19, 1.9)}</button>
      </header>
      <div class="content${def.fill ? ' fill' : ''}" id="content" tabindex="-1">${inner}</div>
    </div>`;
}
/* side bar counts come from the data on screen, so they move with the work */
SC.badges = () => {
  const S = SC.S, b = S.branch, q = (S.q[b] || []).length, urg = (S.q[b] || []).some(k => SC.CASES[k]?.urgent?.length);
  return { queue: q || '', qRed: urg, pack: SC.packLeft?.() || '', night: SC.nightLeft?.() || '', follow: (SC.followLeft?.() || 0) + (SC.adrLeft?.() || 0) || '', fRed: !!SC.followHot?.() };
};
/* superadmin switches the branch being viewed; the screen stays, its data follows the branch */
document.addEventListener('change', e => {
  if (e.target.id !== 'brSwitch') return;
  const S = SC.S, b = SC.branch(e.target.value); S.branch = b.id; S.pickBr = b.id;
  const c = SC.cur(), keep = ['queue', 'night', 'follow', 'pack', 'products', 'labels', 'log', 'settings', 'roster'].includes(c.id);
  SC.go(keep ? c.id : 'queue', { st: keep && !['detail', 'record', 'edit', 'change'].includes(c.st) ? c.st : undefined, p: {} });
  SC.toast(`ดู${b.name}อยู่`, 'store');
});

/* focus (QA3-11): a dialog opens on its first sensible control; when it closes, focus goes back to the control that
   opened it, else the page heading. The page is drawn again on every change, so the opener is found again by its data-* */
let hit = null, retTo = null, shown = null;
const sigOf = el => {
  if (!el?.closest?.('#frame') || el.closest('#ovl')) return '';
  if (el.id) return '#' + CSS.escape(el.id);
  const a = ['data-a', 'data-v', 'data-go', 'data-st', 'data-p', 'aria-label'].filter(k => el.hasAttribute(k)).map(k => `[${k}="${CSS.escape(el.getAttribute(k))}"]`).join('');
  return a && el.tagName.toLowerCase() + a;
};
const firstIn = d => $('[data-focus]', d) || $('input:not([type=hidden]):not(:disabled), textarea:not(:disabled), select:not(:disabled)', d) || $('h2[tabindex]', d)
  || $('.modal-b button:not(:disabled), .drawer-b button:not(:disabled)', d) || $('.modal-f button:not(:disabled), .drawer-f button:not(:disabled)', d) || $('button:not(:disabled)', d);
const heading = () => { const h = $('.tb-t h1', con) || $('h1, h2', con); if (h && !h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); return h; };
const findBack = sel => {
  let t = sel ? $(sel, con) : null;
  if (t && !t.matches('button, [href], input, select, textarea, [tabindex]')) t = $('button, [href]', t);
  return t && !t.disabled && t.offsetParent !== null ? t : null;
};
function render(o = {}) {
  const def = SCREENS[cur.id];
  const had = !!topDialog(), was = shown, from = had ? '' : sigOf(hit && Date.now() - hit.t < 1500 ? hit.el : document.activeElement);
  const sc = o.keepScroll ? $('#content', con)?.scrollTop : 0;
  /* lists that scroll inside the page (S303 medicine list, chat thread) keep their place too (real user 20/10: the list jumped to the top after every tap in a medicine card) */
  const keepIn = o.keepScroll ? $$('[id]', con).filter(e => e.id !== 'content' && e.scrollTop > 0).map(e => [e.id, e.scrollTop]) : [];
  clearTimers();
  const ctx = ctxOf();
  /* the story clock: a panel jump starts at this screen's time, moving between screens never goes back */
  const S = SC.S, hint = SC.toMin((def.now?.(ctx) || SC.NOW).time);
  if (S._reseed || S.clk == null) { S.clk = hint; S.clkS = 0; } else if (hint > S.clk) { S.clk = hint; S.clkS = 0; }
  if (S.fuNext && S.clk >= 12 * 60) S.fuNext = false;   // the morning follow-up scene is over once the day moves on
  const inner = def.render(ctx);
  SC.S._reseed = false;
  con.className = 'con' + (def.shell === false ? ' bare' : '');
  con.innerHTML = def.shell === false ? inner : shell(def, ctx, inner);
  const ov = (SC.S.ov && SC.S.ov(ctx)) || def.overlay?.(ctx) || '';
  ovl.innerHTML = ov; ovl.classList.toggle('on', !!ov);
  if (o.keepScroll && sc) { const c = $('#content', con); if (c) c.scrollTop = sc; }
  keepIn.forEach(([id, t]) => { const e = document.getElementById(id); if (e) e.scrollTop = t; });
  def.mount?.(con, ctx);
  markCur();
  SC.emit('rendered', cur);
  updateBadge();
  placeToasts();
  const has = !!topDialog(), closed = had && !has, ret = closed && retTo?.id === cur.id ? retTo.sel : null;
  if (has && !had) retTo = { sel: from, id: was }; else if (!has) retTo = null;
  shown = cur.id;
  /* focus: the top dialog's [data-focus], else its first field, its heading, its first button; a drawer never lands on "รับเคส".
     A dialog that closed on the same page hands focus back to its opener; one that moved to another page uses that page's [data-focus] */
  requestAnimationFrame(() => {
    if (o.focus === false) return;
    const dlg = topDialog();
    const t = dlg ? firstIn(dlg) : closed ? (findBack(ret) || (ret === null && $('[data-focus]', con)) || heading()) : (o.keepScroll && findBack(from)) || $('[data-focus]', con);
    if (t) t.focus({ preventScroll: true });
  });
}
/* lead 21/10: a control that leads to exactly the item already open shows as current ("กำลังดู") and does nothing */
function markCur() {
  const k = cur.p?.k; if (k == null || !cur.st) return;
  [con, ovl].forEach(root => $$('[data-go][data-p]', root).forEach(el => {
    if (el.dataset.go !== cur.id || el.dataset.st !== cur.st) return;
    let p = {}; try { p = JSON.parse(el.dataset.p); } catch { return; }
    if (p.k !== k || Object.keys(p).some(x => String(p[x]) !== String(cur.p[x]))) return;
    const name = el.getAttribute('aria-label') || el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-current', 'true'); el.setAttribute('aria-label', `${name} (กำลังดู)`); el.classList.add('is-cur'); el.title = 'กำลังดูอยู่';
    const lb = el.classList.contains('btn') && $('span', el);
    if (lb) lb.textContent = 'กำลังดู';
    else if (!el.parentElement?.closest('.is-cur')) (el.tagName === 'TR' ? $('td', el) : el).insertAdjacentHTML('beforeend', '<span class="cur-t" aria-hidden="true">กำลังดู</span>');
  }));
}
const topDialog = () => { const d = $$('.modal, .drawer, [role=alertdialog]', ovl); return ovl.classList.contains('on') ? d[d.length - 1] : null; };
function updateBadge() {
  const code = SC.codeOf(cur.id), t = SC.titleOf(cur.id);
  badge.innerHTML = `<b>${esc(code)}</b><span>${esc(t)}</span>`;
  const f = $('#fabCode'); if (f) f.textContent = code;
}

/* the clock also runs in real time: the top bar and the urgent wait move without a re-render */
setInterval(() => {
  const S = SC.S; if (S.clk == null) return;
  S.clkS = (S.clkS || 0) + 1; if (S.clkS < 60) return;
  S.clkS = 0; S.clk++;
  const n = $('.tb-clock .num', con); if (n) n.textContent = SC.clockStr();
  $$('[data-urgk]', con).forEach(b => {
    const m = urgMin(SC.CASES[b.dataset.urgk]), s = b.closest('.urg-strip'), w = s && $('.urg-none', s);
    b.textContent = m; if (s && m >= URG_LONG) { s.classList.add('long'); if (w) w.hidden = false; }
  });
}, 1000);

/* ---------- toasts ---------- */
/* bottom centre of the work area (css/65-fixes.css), lifted above a footer that stays at the bottom of the screen
   (S202 drawer, S305 close, S401 detail, S303 summary) so it never covers the buttons people are about to press.
   With a drawer open the eyes are on the drawer, so the toast centres on it. k = review-panel zoom of the frame */
function placeToasts() {
  if (!toasts.children.length) return;
  const f = $('#frame'), fr = f.getBoundingClientRect(), k = fr.height / f.offsetHeight || 1, dr = ovl.classList.contains('on') && $('.drawer', ovl);
  let lift = 0;
  $$('.drawer-f, .cl-foot, .fu-act, .osum-f', f).forEach(x => { const r = x.getBoundingClientRect(); if (r.height && fr.bottom - r.bottom < 48 * k && r.top > fr.top + fr.height / 2) lift = Math.max(lift, (fr.bottom - r.top) / k); });
  toasts.style.bottom = lift ? `${Math.round(lift + 12)}px` : '';
  toasts.style.left = dr ? `${dr.offsetLeft + dr.offsetWidth / 2}px` : '';
  toasts.style.maxWidth = dr ? `${dr.offsetWidth - 32}px` : '';
}
SC.toast = (text, icon = 'check') => {
  const n = document.createElement('div'); n.className = 'toast'; n.setAttribute('role', 'status');
  n.innerHTML = `${ic(icon, 16, 2)}<span>${esc(text)}</span>`;
  toasts.appendChild(n); placeToasts();
  while (toasts.children.length > 2) toasts.firstElementChild.remove();   // at most two at a time, so they cover little
  setTimeout(() => { n.style.transition = 'opacity .3s'; n.style.opacity = '0'; setTimeout(() => n.remove(), 320); }, 2800);
};
SC.busy = async (btn, ms = 600) => { if (!btn) return; btn.classList.add('busy'); btn.setAttribute('aria-busy', 'true'); await SC.wait(SC.RED() ? 60 : ms); btn.classList.remove('busy'); btn.removeAttribute('aria-busy'); };

/* ---------- delegated clicks ---------- */
document.addEventListener('click', e => {
  const host = e.target.closest('#frame'); if (!host) return;
  const h = e.target.closest('[data-go], [data-st], [data-a]'); if (h) hit = { el: h, t: Date.now() };
  const g = e.target.closest('[data-go]');
  if (g && g.getAttribute('aria-current') === 'true') { e.preventDefault(); return; }
  if (g && !g.disabled) { e.preventDefault(); let p = {}; try { p = JSON.parse(g.dataset.p || '{}'); } catch { /* ignore */ } SC.go(g.dataset.go, { st: g.dataset.st, p }); return; }
  const s = e.target.closest('[data-st]:not([data-go])');
  if (s && !s.disabled) { e.preventDefault(); let p; try { p = s.dataset.p ? JSON.parse(s.dataset.p) : undefined; } catch { /* ignore */ } SC.setSt(s.dataset.st, { p }); return; }
  const a = e.target.closest('[data-a]');
  if (a && !a.disabled && ACTS[a.dataset.a]) { e.preventDefault(); ACTS[a.dataset.a](a, e); }
  const t = e.target.closest('[data-toggle]');
  if (t && !t.disabled) { const k = ['switch', 'checkbox'].includes(t.getAttribute('role')) || t.classList.contains('sw') ? 'aria-checked' : 'aria-pressed'; t.setAttribute(k, String(t.getAttribute(k) !== 'true')); }
  const r = e.target.closest('[data-radio]');
  if (r && !r.disabled) { const scope = r.closest('[data-radio-scope]') || host; $$(`[data-radio="${r.dataset.radio}"]`, scope).forEach(x => x.setAttribute('aria-checked', String(x === r))); r.closest('.opts')?.classList.remove('err'); }
});
document.addEventListener('keydown', e => {
  const g = e.target.closest?.('#frame [data-go][tabindex]:not(button)');
  if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); g.click(); return; }
  /* keep Tab inside the open dialog */
  if (e.key === 'Tab') {
    const dlg = topDialog(); if (!dlg) return;
    const f = $$('button:not(:disabled), [href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])', dlg).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
    return;
  }
  if (e.key !== 'Escape' || !cur) return;
  if (SC.S.ov) { e.preventDefault(); SC.closeOv(); return; }
  const back = SC.backOf();
  if (back) { e.preventDefault(); if (back === 'board') ACTS.closeOvBoard?.(); else SC.setSt(back); }
});

/* ---------- shared actions ---------- */
const addMin = (t, m) => SC.hhmm(SC.toMin(t) + m);
SC.act('intake', t => {
  const v = t.dataset.v, S = SC.S, b = SC.branch();
  if (v === 'closed') return SC.go('queue', { st: 'closeask' });
  if (v === 'pause') return SC.openOv(() => `<div class="scrim" data-a="ovClose"></div><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mdT">
    <div class="modal-h"><span class="warn-t">${ic('circle-pause', 24, 2)}</span><div class="grow"><h2 id="mdT">พักรับเคส${esc(b.short)}</h2><p>ลูกค้าที่รออยู่เห็นว่า "เภสัชกรพักชั่วคราว" รอต่อได้ ไม่เสียคิว</p></div>${SC.ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
    <div class="modal-b"><p class="label">พักนานเท่าไร</p><div class="opts mt8" data-radio-scope>${[[15, '15 นาที'], [30, '30 นาที'], [60, '1 ชั่วโมง'], [0, 'จนกว่าจะกดเปิดรับ']].map(([m, l]) => SC.ui.opt({ group: 'pz', v: m, title: l, sub: m ? `ถึง ${addMin(SC.clockStr(), m)} · ระบบเตือนเมื่อครบเวลา` : 'ไม่มีเตือน ต้องกดเปิดรับเอง' })).join('')}</div>
      <p class="err-t mt8" id="pzErr" hidden>${ic('circle-x', 14, 2)}<span>เลือกระยะเวลาพักก่อน</span></p></div>
    <div class="modal-f">${SC.ui.btn('ยกเลิก', { kind: 'secondary', a: 'ovClose' })}${SC.ui.btn('พักรับเคส', { kind: 'primary', a: 'pauseGo', icon: 'circle-pause' })}</div></div>`);
  S.intake[S.branch] = v; S.pause = null;
  if (cur.id === 'queue') SC.go('queue', { st: 'live' }); else SC.refresh();
  SC.toast(`เปิดรับเคส${b.short}แล้ว`, 'circle-play');
});
SC.act('pauseGo', () => {
  const on = $('[data-radio="pz"][aria-checked="true"]', ovl); if (!on) { $('#pzErr', ovl).hidden = false; return; }
  const S = SC.S, m = +on.dataset.v, b = SC.branch();
  S.intake[S.branch] = 'pause'; S.pause = { min: m, until: m ? addMin(SC.clockStr(), m) : '' };
  S.ov = null;
  if (cur.id === 'queue') SC.go('queue', { st: 'pause' }); else SC.refresh();
  SC.toast(m ? `พักรับเคส${b.short}ถึง ${S.pause.until} · ลูกค้ารอต่อได้ ไม่เสียคิว` : `พักรับเคส${b.short} · ลูกค้ารอต่อได้ ไม่เสียคิว`, 'circle-pause');
});
SC.act('ovClose', () => SC.closeOv());
SC.act('urgView', t => { const S = SC.S; S.branch = t.dataset.b; S.pickBr = t.dataset.b; SC.go('preview', { st: 'urgent', p: { k: t.dataset.v } }); SC.toast(`ดู${SC.branch().name}อยู่`, 'store'); });
SC.act('skip', (t, e) => { e.preventDefault(); $('#content', con)?.focus(); });
SC.act('soundInfo', () => SC.toast('เสียงแจ้งเตือนเปิดอยู่ ดังเมื่อมีเคสใหม่และเมื่อลูกค้าตอบ', 'volume-2'));
SC.act('logout', () => {
  const S = SC.S, ac = S.activeCase && SC.CASES[S.activeCase], b = SC.branch();
  if (SC.isAdmin() || SC.isStaff()) { SC.S = SC.fresh(); return SC.go('login'); }   // neither holds the shift
  /* signing out ends the shift (the on-duty pharmacist follows who is signed in), so it asks first */
  SC.openOv(() => `<div class="scrim" data-a="ovClose"></div><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mdT">
    <div class="modal-h"><span class="warn-t">${ic('log-out', 24, 2)}</span><div class="grow"><h2 id="mdT">ออกจากระบบและออกกะ</h2><p>${ac ? `ยังมีเคสที่เปิดอยู่: ${esc(SC.casePerson(ac).name)}` : esc(b.name)}</p></div>${SC.ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
    <div class="modal-b">${ac ? '<p>เคสยังไม่ปิด ลูกค้ายังรอคำตอบในห้อง ถ้าออกจากระบบ ลูกค้าจะไม่มีใครดูแลจนกว่าคุณกลับเข้ามา</p>' : ''}<p${ac ? ' class="mt8"' : ''}>ถ้าไม่มีเภสัชกรคนอื่นเข้าสู่ระบบที่${esc(b.name)} สาขาจะปิดรับเคสให้อัตโนมัติ ลูกค้าที่รออยู่ได้รับแจ้ง</p></div>
    <div class="modal-f">${SC.ui.btn('ออกจากระบบ', { kind: 'danger-line', a: 'logoutGo' })}${ac ? SC.ui.btn('กลับไปที่เคส', { kind: 'primary', go: 'room', st: 'talk', p: { k: ac.key }, focus: true }) : SC.ui.btn('ยกเลิก', { kind: 'secondary', a: 'ovClose', focus: true })}</div></div>`);
});
SC.act('logoutGo', () => {
  /* the pharmacist on duty leaves and nobody else is signed in: the branch closes and stays closed for whoever signs in next,
     superadmin included (real user 20/10: settings still showed ขวัญใจ on duty after she signed out) */
  const S = SC.S, me = SC.me(), d = SC.duty(S.branch);
  const off = cur?.id !== 'branch' && d && d.id === me.id ? { b: S.branch, who: me.id, at: SC.clockStr(), k: S.activeCase || null } : null;
  SC.S = SC.fresh(); if (off) SC.S.off = off; SC.go('login');
});
SC.act('closeOv', t => SC.setSt(t.dataset.v || SC.backOf() || SCREENS[cur.id].states[0][0]));
})();

/* ===== 20-ui.js ===== */
/* =====================================================================
   20 · UI builders (all return HTML strings)
   ===================================================================== */
(() => {
const { esc, ic } = SC;
const attrs = o => [
  o.go ? `data-go="${o.go}"` : '', o.st ? `data-st="${o.st}"` : '', o.a ? `data-a="${o.a}"` : '',
  o.v != null ? `data-v="${esc(o.v)}"` : '', o.p ? `data-p='${esc(JSON.stringify(o.p))}'` : '',
  o.id ? `id="${o.id}"` : '', o.disabled ? 'disabled' : '', o.title ? `title="${esc(o.title)}"` : '',
  o.label ? `aria-label="${esc(o.label)}"` : '', o.focus ? 'data-focus' : ''
].filter(Boolean).join(' ');
const ui = SC.ui = {};
ui.attrs = attrs;
ui.btn = (label, o = {}) => `<button type="button" class="btn ${o.kind || 'primary'}${o.sm ? ' sm' : ''}${o.lg ? ' lg' : ''}${o.block ? ' block' : ''}${o.busy ? ' busy' : ''}${o.cls ? ' ' + o.cls : ''}" ${attrs(o)}${o.busy ? ' aria-busy="true"' : ''}>${o.icon ? ic(o.icon, o.sm ? 16 : 18, 2) : ''}<span>${esc(label)}</span>${o.iconRight ? ic(o.iconRight, 16, 2) : ''}</button>`;
ui.ib = (icon, label, o = {}) => `<button type="button" class="ib${o.cls ? ' ' + o.cls : ''}" aria-label="${esc(label)}" title="${esc(label)}" ${attrs(o)}>${ic(icon, o.s || 18, 1.9)}</button>`;
ui.tag = (text, tone = '', o = {}) => `<span class="tag ${tone}">${o.icon ? ic(o.icon, 13, 2.2) : o.dot ? `<i class="dot${o.live ? ' live' : ''}"></i>` : ''}${esc(text)}</span>`;
ui.note = (html, o = {}) => `<div class="note ${o.tone || ''}${o.cls ? ' ' + o.cls : ''}" ${o.role ? `role="${o.role}"` : ''}>${ic(o.icon || (o.tone === 'danger' ? 'octagon-alert' : o.tone === 'warn' ? 'triangle-alert' : o.tone === 'ok' ? 'circle-check' : 'info'), 18, 2)}<div class="grow">${html}</div></div>`;
ui.card = (inner, o = {}) => `<section class="card${o.cls ? ' ' + o.cls : ''}"${o.label ? ` aria-label="${esc(o.label)}"` : ''}>${inner}</section>`;
ui.cardH = (title, right = '', o = {}) => `<div class="card-h${o.cls ? ' ' + o.cls : ''}">${o.icon ? `<span class="brand-t">${ic(o.icon, 18, 2)}</span>` : ''}<h3>${esc(title)}</h3><span class="sp"></span>${right}</div>`;
ui.kv = (rows, o = {}) => `<dl class="kv${o.left ? ' left' : ''}">${rows.map(([k, v, c]) => `<dt class="${c || ''}">${esc(k)}</dt><dd class="${c || ''}">${v}</dd>`).join('')}</dl>`;
ui.field = o => {
  const id = o.id || 'f' + Math.random().toString(36).slice(2, 7);
  const ctl = o.textarea
    ? `<textarea id="${id}" class="input" rows="${o.rows || 3}" ${o.ph ? `placeholder="${esc(o.ph)}"` : ''}${o.max ? ` maxlength="${o.max}"` : ''}${o.req ? ' aria-required="true"' : ''}${o.error ? ` aria-invalid="true" aria-describedby="${id}-e"` : ''}${o.a ? ` data-in="${o.a}"` : ''}${o.focus ? ' data-focus' : ''}${o.ro ? ' readonly' : ''}>${esc(o.value || '')}</textarea>`
    : o.select
      ? `<select id="${id}" class="input"${o.req ? ' aria-required="true"' : ''}>${o.select.map(x => `<option${x === o.value ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>`
      : `<input id="${id}" class="input" type="${o.type || 'text'}" value="${esc(o.value || '')}" ${o.ph ? `placeholder="${esc(o.ph)}"` : ''}${o.max ? ` maxlength="${o.max}"` : ''}${o.ac ? ` autocomplete="${o.ac}"` : ''}${o.req ? ' aria-required="true"' : ''}${o.error ? ` aria-invalid="true" aria-describedby="${id}-e"` : ''}${o.a ? ` data-in="${o.a}"` : ''}${o.focus ? ' data-focus' : ''}${o.ro ? ' readonly' : ''}${o.disabled ? ' disabled' : ''}>`;
  return `<div class="field${o.error ? ' err' : ''}${o.cls ? ' ' + o.cls : ''}"><label for="${id}">${esc(o.label)}${o.req ? '<span class="req" aria-hidden="true">*</span>' : ''}${o.optional ? ' <span class="opt-t">(ไม่บังคับ)</span>' : ''}</label>${ctl}${o.error ? `<p class="err-t" id="${id}-e">${ic('circle-x', 14, 2)}<span>${esc(o.error)}</span></p>` : ''}${o.hint ? `<p class="hint">${esc(o.hint)}</p>` : ''}</div>`;
};
ui.seg = (items, val, o = {}) => `<div class="seg" role="group"${o.label ? ` aria-label="${esc(o.label)}"` : ''}>${items.map(([v, l, icon]) => `<button type="button" ${o.a ? `data-a="${o.a}"` : ''} ${o.st ? `data-st="${v}"` : ''} data-v="${esc(v)}" aria-pressed="${v === val}">${icon ? ic(icon, 15, 2) : ''}${esc(l)}</button>`).join('')}</div>`;
ui.opt = o => `<button type="button" class="opt" role="${o.multi ? 'checkbox' : 'radio'}" ${o.multi ? 'data-toggle' : `data-radio="${o.group}"`} data-v="${esc(o.v)}" aria-checked="${!!o.on}"${o.disabled ? ' disabled' : ''}${o.a ? ` data-a="${o.a}"` : ''}>${o.multi ? `<span class="ck">${ic('check', 13, 3)}</span>` : '<span class="rd"></span>'}<span class="tx"><b>${esc(o.title)}</b>${o.sub ? `<span>${esc(o.sub)}</span>` : ''}</span>${o.right || ''}</button>`;
ui.sw = o => `<div class="sw-row">${o.icon ? `<span class="brand-t">${ic(o.icon, 20, 1.9)}</span>` : ''}<span class="tx"><b>${esc(o.title)}</b>${o.sub ? `<span>${esc(o.sub)}</span>` : ''}</span><button type="button" class="sw" role="switch" ${o.a ? `data-a="${o.a}"` : 'data-toggle'} aria-checked="${!!o.on}" aria-label="${esc(o.title)}"${o.disabled ? ' disabled' : ''}${o.id ? ` id="${o.id}"` : ''}></button></div>`;
ui.av = (ini, o = {}) => `<span class="av${o.size ? ' ' + o.size : ''}${o.solid ? ' solid' : ''}" aria-hidden="true">${esc(ini)}</span>`;
ui.emptyArt = function(icon = 'inbox') { const topics = ["inbox", "map-pin", "store", "heart", "history", "file-text", "file-search", "search", "receipt", "users", "pill", "clipboard-list", "bell", "heart-pulse", "shield-check", "calendar", "shopping-bag", "circle-check", "moon", "ban"]; const topic = topics.includes(icon) ? icon : 'inbox'; return `<img class="empty-illustration" src="/assets/empty/${topic}.svg" width="120" height="96" alt="" aria-hidden="true">`; };
ui.empty = o => `<div class="empty">${ui.emptyArt(o.icon)}<h3>${esc(o.title)}</h3>${o.body ? `<p>${esc(o.body)}</p>` : ''}${o.btn ? `<div class="mt8">${o.btn}</div>` : ''}</div>`;
ui.skel = (w, h = 14, r = 6) => `<span class="skel" style="width:${w};height:${h}px;border-radius:${r}px"></span>`;
ui.modal = o => `<div class="scrim" ${o.back ? `data-a="closeOv" data-v="${o.back}"` : ''}></div><div class="modal${o.wide ? ' wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="mdT"><div class="modal-h">${o.icon ? `<span class="${o.tone === 'danger' ? 'danger-t' : o.tone === 'warn' ? 'warn-t' : 'brand-t'}">${ic(o.icon, 24, 2)}</span>` : ''}<div class="grow"><h2 id="mdT">${esc(o.title)}</h2>${o.sub ? `<p>${esc(o.sub)}</p>` : ''}</div>${o.back ? SC.ui.ib('x', 'ปิด', { a: 'closeOv', v: o.back }) : ''}</div><div class="modal-b">${o.body}</div><div class="modal-f">${o.foot}</div></div>`;
ui.drawer = o => `<div class="scrim" ${o.back ? `data-a="closeOv" data-v="${o.back}"` : ''}></div><div class="drawer" role="dialog" aria-modal="true" aria-labelledby="drT"><div class="drawer-h">${o.head || ''}<div class="grow"><h2 id="drT" class="h3" tabindex="-1">${esc(o.title)}</h2>${o.sub ? `<p class="small">${esc(o.sub)}</p>` : ''}</div>${o.back ? SC.ui.ib('x', 'ปิด', { a: 'closeOv', v: o.back }) : ''}</div><div class="drawer-b">${o.body}</div>${o.foot ? `<div class="drawer-f">${o.foot}</div>` : ''}</div>`;
/* allergy line: "ยังไม่ได้ระบุ" is never shown as "ไม่แพ้" (customer app A11). muted = someone else in the household */
ui.allergy = (p, o = {}) => {
  const a = (p.allergies || []).filter(Boolean), m = o.muted;
  /* each name stays whole when a narrow column wraps the list (Thai breaks inside unknown drug names otherwise) */
  if (a.length) return `<span class="tag ${m ? 'muted' : 'danger'}">${ic('triangle-alert', 13, 2.2)}<span>แพ้ ${a.map(x => `<span class="nowrap">${esc(x)}</span>`).join(', ')}</span></span>${o.src && p.allergySrc ? `<span class="small">${esc(p.allergySrc)}</span>` : ''}`;
  if (p.allergyState === 'none') return `<span class="tag ${m ? 'muted' : 'ok'}">${ic('check', 13, 2.4)}ไม่แพ้ยา (${p.algBy === 'ph' ? 'เภสัชกรบันทึก' : 'ลูกค้าระบุ'})</span>`;
  if (p.allergyState === 'asked') return `<span class="tag warn">${ic('info', 13, 2.2)}ถามแล้ว ลูกค้าไม่ทราบ</span>`;
  return `<span class="tag warn">${ic('circle-pause', 13, 2.2)}ยังไม่ได้ระบุ</span>`;
};
/* side effects the person had before (item 74): amber, never the red allergy tag */
ui.sfx = pk => { const l = SC.sfxOf(pk); return l.length ? `<span class="tag warn">${ic('pill', 13, 2.2)}<span>ผลข้างเคียง ${l.map(x => `<span class="nowrap">${esc(x.sym)} จาก${esc(x.ing)}</span>`).join(', ')}</span></span>` : ''; };
/* chat vs video call (owner 20/10/2026): icon + word always, never colour alone. Same words as the customer app.
   chat = light teal pill, video call = light indigo pill (owner 20/10, item 61). { lg: true } = the bigger pill for the case drawer.
   Also takes the history strings ('วิดีโอ' / 'วิดีโอคอล'), so callers need not convert */
ui.isVideo = m => m === 'video' || m === 'วิดีโอ' || m === 'วิดีโอคอล';
ui.modeName = m => ui.isVideo(m) ? 'วิดีโอคอล' : 'แชท';
ui.modeIcon = m => ui.isVideo(m) ? 'video' : 'message-circle';
ui.mode = (m, o) => { const v = ui.isVideo(m); return `<span class="chn ${v ? 'video' : 'chat'}${o && o.lg ? ' lg' : ''}">${ic(ui.modeIcon(m), o && o.lg ? 17 : 15, 2)}${ui.modeName(m)}</span>`; };
ui.urgent = c => (c.urgent || []).length ? `<span class="tag red">${ic('octagon-alert', 13, 2.2)}ธงด่วน</span>` : '';
/* drug group = a neutral label (white, grey border): green / orange / red are for status only (UX-07). Icon keeps it from being a bare word */
ui.cls = t => { const [n] = SC.CLASS[t] || [t]; const i = t === 'ยาอันตราย' ? 'badge-check' : t === 'ยาควบคุมพิเศษ' ? 'lock' : ''; return `<span class="tag line cls">${i ? ic(i, 13, 2.2) : ''}${esc(n)}</span>`; };
ui.who = c => { const p = SC.casePerson(c); return SC.isFam(c) ? `${esc(p.name)} <span class="muted">(${esc(p.rel)} ${p.age} ปี · บัญชี ${esc(c.acct)})</span>` : esc(p.name); };
})();

/* ===== 25-phone.js ===== */
/* =====================================================================
   25 · Phone number pop-up. The console runs on the shop computer, which cannot dial (owner 20/10: "เอาปุ่มโทรออกดีกว่า
   ใช้งาน pc โทรออกไม่ได้ แต่ให้เด้งเป็นเบอร์โทรขึ้นแทน"): every call button opens the full number to dial on the shop
   phone. Boards and cards keep the hidden number; every opening is logged (who, when). Mock numbers.
   ===================================================================== */
(() => {
const { $, esc, ic, ui } = SC;
/* mock: the hidden digits filled in, so the full number is fictional */
SC.fullPhone = m => { let i = 0; return String(m || '08x-xxx-0000').replace(/x/g, () => '1234567'[i++ % 7]); };
/* o = { name, phone, id, callee, tone, hint, done: { label, icon, run } } */
SC.phoneShow = o => {
  const S = SC.S, at = SC.clockStr();
  S.phoneLog = [...(S.phoneLog || []), { id: o.id || '', at, by: S.me }];
  SC.logEv('phone', `ดูเบอร์${o.callee || 'ลูกค้า'}`, o.id || '');
  S.phone = { ...o, at };
  SC.openOv(phoneOv);
  requestAnimationFrame(() => $('#phNum')?.focus());
};
SC.casePhone = (c, o = {}) => { const p = SC.casePerson(c), fam = SC.isFam(c); SC.phoneShow({ name: fam ? `${c.acct} · ปรึกษาให้${p.rel} ${p.first || p.name}` : p.name, phone: p.phone, id: c.id, callee: fam ? 'เจ้าของบัญชี' : 'ลูกค้า', ...o }); };
const phoneOv = () => {
  const o = SC.S.phone; if (!o) return '';
  const b = SC.branch(), danger = o.tone === 'danger';
  return `<div class="scrim" data-a="ovClose"></div><div class="modal ph-m" role="dialog" aria-modal="true" aria-labelledby="phT">
    <div class="modal-h"><span class="${danger ? 'danger-t' : 'brand-t'}">${ic('phone', 24, 2)}</span><div class="grow"><h2 id="phT">เบอร์${esc(o.callee || 'ลูกค้า')}</h2><p>${esc(o.name)}${o.id ? ` · ${esc(o.id)}` : ''}</p></div>${ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
    <div class="modal-b">
      <div class="ph-box"><span class="ph-num num" id="phNum" tabindex="-1">${esc(SC.fullPhone(o.phone))}</span>${ui.btn('คัดลอกเบอร์', { kind: 'secondary', sm: true, icon: 'copy', a: 'phCopy' })}</div>
      <p class="mt12">โทรจากโทรศัพท์ร้าน${b.phone ? ` <span class="num nowrap">${esc(b.phone)}</span>` : ''} · คอมพิวเตอร์ของร้านโทรออกไม่ได้</p>
      ${o.hint ? `<p class="small mt8">${esc(o.hint)}</p>` : ''}
      <p class="small mt12">${ic('lock', 12, 2)} เปิดดูเบอร์ ${esc(o.at)} โดย ${esc(SC.me().short)} · ระบบบันทึกทุกครั้ง</p></div>
    <div class="modal-f">${ui.btn('ปิด', { kind: 'secondary', a: 'ovClose' })}${o.done ? ui.btn(o.done.label, { a: 'phDone', icon: o.done.icon || 'check', kind: danger ? 'danger' : 'primary' }) : ''}</div></div>`;
};
/* data-v carries the number when the pop-up is part of another dialog (S203 call back) */
SC.act('phCopy', async t => {
  const n = t.dataset.v || SC.fullPhone(SC.S.phone?.phone);
  try { await navigator.clipboard.writeText(n.replace(/-/g, '')); } catch (e) { /* the prototype may run without clipboard access */ }
  SC.toast(`คัดลอก ${n} แล้ว`, 'copy');
});
SC.act('phDone', () => { const d = SC.S.phone?.done; SC.S.phone = null; SC.closeOv(); d?.run?.(); });
SC.act('phCase', t => SC.casePhone(SC.CASES[t.dataset.v]));
})();

/* ===== 30-panel.js ===== */
/* =====================================================================
   30 · Review panel (prototype only, not part of the console)
   Current code (big), matching customer screen with a live iframe of the customer app,
   customer-side simulations, states of this screen, notes, owner decisions, jump list.
   Also fits the console frame to the stage (1280x800 / 1024x768 scaled, or fill).
   ===================================================================== */
(() => {
const { $, $$, esc, ic } = SC;
const Q = new URLSearchParams(location.search), R = document.documentElement;
const APP = '/';
SC.DESIGN_VERSION = 'คอนโซลร้าน v1.1 · 20/10/2026';
const rv = $('#rv'), panel = $('#panel'), frame = $('#frame'), stage = $('#stage'), fab = $('#panelFab');

/* customer app screens (codes from the review list 19/10/2026); replaced by the live registry the app posts */
const CUST = { splash: ['C101', 'เปิดแอป'], login: ['C102', 'เข้าสู่ระบบ'], otp: ['C103', 'กรอกรหัส OTP'], profile: ['C104', 'ข้อมูลของคุณและความยินยอม'], consent: ['C105', 'ยินยอมให้ใช้ข้อมูล'], noconsent: ['C106', 'ไม่ยินยอม'], faceid: ['C107', 'Face ID / ลายนิ้วมือ'], doc: ['C108', 'ข้อกำหนดการใช้งาน'], onboard: ['C109', 'แนะนำแอป'],
  home: ['C201', 'หน้าแรก'], branch: ['C202', 'เลือกสาขา'], intake: ['C203', 'แจ้งอาการ'], allergy: ['C204', 'แพ้ยาและยาประจำ'], redflag: ['C205', 'อาการที่ควรไปโรงพยาบาล'], pushask: ['C206', 'เปิดการแจ้งเตือน'], queue: ['C207', 'รอคิว'], cancelq: ['C208', 'ยกเลิกคิวไหม'],
  lock: ['C301', 'แจ้งเตือนบนจอล็อก'], room: ['C303', 'ห้องปรึกษา (แชท)'], roommenu: ['C304', 'ตัวเลือกในห้องปรึกษา'], endcase: ['C305', 'จบการปรึกษานี้ไหม'], video: ['C306', 'วิดีโอคอล'], hangup: ['C307', 'วางสายไหม'], pay: ['C308', 'ชำระเงิน'], paid: ['C309', 'ชำระสำเร็จ'],
  summary: ['C401', 'ใบสรุปการปรึกษา'], receipt: ['C402', 'ใบเสร็จรับเงิน'], history: ['C403', 'ประวัติ'], inbox: ['C404', 'กล่องแจ้งเตือน'], follow: ['C405', 'ติดตามการใช้ยา'], fucheck: ['C406', 'บอกอาการวันนี้'], furesult: ['C407', 'ส่งคำตอบแล้ว'], fulog: ['C408', 'บันทึกการติดตาม'], fudone: ['C409', 'ครบคอร์สยาแล้ว'], fureminder: ['C410', 'ตั้งเวลาเตือน'], fuoff: ['C411', 'หยุดติดตาม'], adr: ['C412', 'แจ้งอาการหลังใช้ยา'], adrsent: ['C413', 'ส่งรายงานแล้ว'],
  account: ['C501', 'บัญชี'], family: ['C502', 'สมาชิกในบ้าน'], familyedit: ['C503', 'เพิ่ม / แก้ไขสมาชิก'], memberdel: ['C504', 'ลบสมาชิก'], health: ['C505', 'ข้อมูลสุขภาพของฉัน'], consents: ['C506', 'ความยินยอม'], consenttext: ['C507', 'ข้อความความยินยอม'], consentwd: ['C508', 'ถอนความยินยอม'], help: ['C509', 'ช่วยเหลือ'], logout: ['C510', 'ออกจากระบบ'], deleteacc: ['C511', 'ลบบัญชี'], deleted: ['C512', 'ลบบัญชีแล้ว'],
  update: ['C601', 'บังคับอัปเดตแอป'], sysoff: ['C602', 'ปิดรับปรึกษาชั่วคราว'], queueclosed: ['C603', 'สาขาปิดรับปรึกษา'], expired: ['C604', 'คิวหมดเวลา'], offline: ['C605', 'นอกเวลา: ฝากคำถาม'], declined: ['C606', 'เภสัชกรไม่รับเคส'], nocam: ['C607', 'ไม่ให้สิทธิ์กล้อง'], lost: ['C608', 'สัญญาณหลุด'], payfail: ['C609', 'จ่ายไม่ผ่าน'] };
/* state keys of the customer screens this console points at (src-05, 19/10/2026) */
const CST = { home: ['normal', 'loading', 'active', 'busy', 'closed'], branch: ['normal', 'noloc'], intake: ['normal', 'filled', 'kid', 'other', 'noallergy', 'fail'],
  queue: ['q2', 'q1', 'paused', 'urgent', 'notifoff'], lock: ['accept', 'msg', 'order', 'payexp', 'paused', 'summary', 'adr', 'fudose', 'fucheck'],
  room: ['live', 'order', 'paid', 'expired', 'offline', 'closed', 'call'], video: ['on', 'connecting', 'camoff', 'weak', 'pcam'],
  pay: ['normal', 'parcel', 'express', 'noaddr', 'form', 'closed', 'card', 'otp', 'qr', 'qrexp', 'bankon', 'bankapp', 'checking'], receipt: ['normal', 'parcel', 'notax', 'taxdone', 'late'], paid: ['pickup', 'parcel', 'express', 'night'],
  summary: ['normal', 'nomeds', 'closed', 'rated'], history: ['normal', 'empty', 'loading'], inbox: ['normal', 'read', 'empty'],
  follow: ['normal', 'missed', 'checked', 'endonly', 'worse', 'day1', 'done', 'remoff', 'off', 'offline', 'empty', 'loading'], fucheck: ['normal', 'self', 'closed', 'error'], furesult: ['better', 'same', 'worse', 'danger', 'closed'], fulog: ['normal', 'done', 'empty', 'loading'], fudone: ['ask', 'healed', 'still'], fureminder: ['normal', 'off', 'notifoff', 'error'],
  adr: ['normal', 'filled', 'severe'], adrsent: ['sent', 'severe', 'replied', 'closed'], health: ['normal', 'unknown'], sysoff: ['off', 'case'], queueclosed: ['branch', 'store'],
  offline: ['form', 'kid', 'sent'], lost: ['me', 'peer', 'fail'], payfail: ['card', 'bank'] };
let REG = null;   /* live registry from the customer app: {id: {code, title, states:[[k,label]]}} */
addEventListener('message', e => {
  const r = e.data?.tpRegistry; if (!r || REG) return;
  REG = {}; (r.items || []).forEach(i => { REG[i.id] = { code: i.code, title: i.title, states: i.states || [] }; });
  render();
});
SC.custCode = (id, st) => {
  const g = REG?.[id], code = g?.code || CUST[id]?.[0] || id;
  const keys = g ? g.states.map(s => s[0]) : (CST[id] || []);
  const i = st ? keys.indexOf(st) : -1;
  return keys.length > 1 && i >= 0 ? `${code}.${i + 1}` : code;
};
SC.custTitle = (id, st) => {
  const g = REG?.[id], t = g?.title || CUST[id]?.[1] || id, s = st && g?.states.find(x => x[0] === st);
  return t + (s ? ' · ' + s[1] : '');
};
const custOf = (id, st) => { const d = SC.SCREENS[id], s = SC.stDef(id, st); return s?.[2]?.cust !== undefined ? s[2].cust : (d.cust || []); };
let pick = 0, lastKey = '';
const appUrl = (id, st) => `${encodeURI(APP)}?screen=${encodeURIComponent(id)}&bare=1&splash=0&still=1&registry=1${st ? '&state=' + encodeURIComponent(st) : ''}`;

/* ---------- stage fit ---------- */
let size = ['1024', 'fit'].includes(Q.get('size')) ? Q.get('size') : '1280';
const bare = Q.get('bare') === '1';
R.classList.toggle('bare', bare);
function fit() {
  if (bare) return;
  frame.classList.toggle('fit', size === 'fit');
  if (size === 'fit') { frame.style.width = frame.style.height = ''; frame.style.transform = ''; return; }
  const W = size === '1024' ? 1024 : 1280, H = size === '1024' ? 768 : 800;
  frame.style.width = W + 'px'; frame.style.height = H + 'px';
  const k = Math.min(1, (stage.clientWidth - 32) / W, (stage.clientHeight - 32) / H);
  frame.style.transform = `translate(-50%,-50%) scale(${k.toFixed(4)})`;
}
addEventListener('resize', fit);

/* ---------- render (the phone iframe is built once and only re-pointed, so it does not reload for nothing) ---------- */
let built = false;
function build() {
  panel.innerHTML = `
    <div class="pn-top">${SC.logo()}<span class="sp"></span><button type="button" class="pn-ib" data-pn="hide" aria-label="ซ่อนแผงตรวจ" title="ซ่อนแผงตรวจ">${ic('panel-right', 18, 1.9)}</button></div>
    <p class="pn-t">ต้นแบบคอนโซลร้าน (ฝั่งเภสัชกร)</p>
    <p class="pn-sub">${esc(SC.DESIGN_VERSION)} · หน้ากากอย่างเดียว ไม่ต่อระบบจริง · ข้อมูลสมมติ</p>
    <div class="pn-now" id="pnNow"></div>
    <section class="pn-sec"><h2 class="pn-h">${ic('smartphone', 14, 2)}จอลูกค้าที่ตรงกัน<span class="sp"></span><a class="link pn-open" id="pnOpen" target="_blank" rel="noopener">เปิดแอปลูกค้า ${ic('external-link', 12, 2)}</a></h2>
      <div class="pn-cust" id="pnCust"><div class="pn-phone"><iframe id="custFrame" title="จอลูกค้าที่ตรงกัน"></iframe></div><div class="pn-cl" id="pnCl"></div></div>
      <p class="pn-none" id="pnNone" hidden>ลูกค้าไม่เห็นจอนี้ (งานภายในร้าน)</p>
    </section>
    <div id="pnRest"></div>`;
  built = true;
}
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
  const c = SC.cur(); if (!c) return;
  if (!built) build();
  const keep = anchorOf();
  const def = SC.SCREENS[c.id], st = c.st, sdef = SC.stDef(c.id, st);
  const code = SC.codeOf(c.id, st), list = custOf(c.id, st);
  const key = c.id + ':' + st; if (key !== lastKey) { pick = 0; lastKey = key; }
  if (pick >= list.length) pick = 0;
  const sel = list[pick];
  const sims = (def.sims?.({ id: c.id, st, S: SC.S }) || []).filter(Boolean);
  const notes = [...(def.notes || []), ...(sdef?.[2]?.notes || [])], wait = def.wait || [];
  const byGroup = SC.GROUPS.map(([g, gl]) => [g, gl, SC.ORDER.filter(i => SC.SCREENS[i].group === g).sort((a, b) => SC.SCREENS[a].code.localeCompare(SC.SCREENS[b].code))]);
  $('#pnNow', panel).innerHTML = `<div class="pn-code-big"><b>${esc(code)}</b><span>${esc(def.title)}</span><small>${def.states?.length > 1 ? 'สถานะ: ' + esc(sdef?.[1] || '') : 'จอนี้มีสถานะเดียว'}</small></div>`;
  $('#pnCust', panel).hidden = !list.length; $('#pnNone', panel).hidden = !!list.length;
  $('#pnOpen', panel).href = appUrl(sel?.[0] || 'home', sel?.[1]).replace('&bare=1', '').replace('&still=1', '').replace('&registry=1', '');
  if (sel) {
    const f = $('#custFrame', panel), u = appUrl(sel[0], sel[1]);
    if (f.dataset.u !== u) { f.dataset.u = u; f.src = u; }
    f.title = 'จอลูกค้า ' + SC.custCode(sel[0], sel[1]);
    $('#pnCl', panel).innerHTML = list.map(([id, s2, n], i) => `<button type="button" class="pn-btn" data-pn="cust" data-k="${i}" aria-pressed="${i === pick}"><span class="c">${esc(SC.custCode(id, s2))}</span>${esc(SC.custTitle(id, s2))}${n ? `<small>${esc(n)}</small>` : ''}</button>`).join('');
  }
  const who = SC.S.me, WHO = [['kj', 'ภญ.ขวัญใจ', 'เภสัชกรสาขา · ตลาดเวิลด์'], ['tp', 'ภก.ธัชพล', 'เภสัชกรสาขา · อ่อนนุช'], ['st', 'คุณสุนิสา', 'พนักงานร้าน · ตลาดเวิลด์'], ['admin', 'ผู้ดูแลระบบ', 'superadmin · ทุกสาขา']];
  $('#pnRest', panel).innerHTML = `
    <section class="pn-sec"><h2 class="pn-h">${ic('user-check', 14, 2)}ผู้ที่เข้าสู่ระบบ</h2><div class="pn-grid">${WHO.map(([k, n, sub]) => `<button type="button" class="pn-btn" data-pn="who" data-k="${k}" aria-pressed="${who === k}">${esc(n)}<small>${esc(sub)}</small></button>`).join('')}</div>
      <p class="pn-foot">เภสัชกรสาขาเห็นเฉพาะสาขาตัวเอง ไม่เห็นเมนูตั้งค่าร้าน · พนักงานร้านเห็นแค่ S404 จัดยาและส่ง กับรับยาด้วยรหัส · ผู้ดูแลระบบสลับสาขาได้ที่แถบบน เห็น S501 S502 แต่รับเคสไม่ได้</p></section>
    ${sims.length ? `<section class="pn-sec"><h2 class="pn-h">${ic('users', 14, 2)}จำลองฝั่งลูกค้า</h2><div class="pn-grid">${sims.map((s, i) => `<button type="button" class="pn-btn sim" data-pn="sim" data-k="${i}">${esc(s.label)}</button>`).join('')}</div></section>` : ''}
    ${def.states?.length > 1 ? `<section class="pn-sec"><h2 class="pn-h">สถานะของจอนี้</h2><div class="pn-row">${def.states.map(([k, l]) => `<button type="button" class="pn-btn" data-pn="state" data-k="${esc(k)}" aria-pressed="${k === st}"><span class="c">${esc(SC.codeOf(c.id, k))}</span>${esc(l)}</button>`).join('')}</div></section>` : ''}
    ${notes.length || wait.length ? `<section class="pn-sec"><h2 class="pn-h">บันทึกของจอนี้</h2><div class="pn-card">
      ${notes.length ? `<ul class="pn-list">${notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
      ${wait.length ? `<p class="pn-wait-h">รอเจ้าของเคาะ</p><ul class="pn-list wait">${wait.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}</div></section>` : ''}
    <section class="pn-sec"><h2 class="pn-h">ขนาดจอร้าน</h2><div class="pn-seg" role="group" aria-label="ขนาดจอ">${[['1280', '1280 x 800'], ['1024', '1024 x 768'], ['fit', 'เต็มพื้นที่']].map(([v, l]) => `<button type="button" data-pn="size" data-k="${v}" aria-pressed="${size === v}">${l}</button>`).join('')}</div></section>
    <section class="pn-sec"><h2 class="pn-h">ไปจอ · ทั้งหมด ${SC.ORDER.length} จอ</h2>
      ${byGroup.map(([g, gl, ids]) => ids.length ? `<div class="pn-grp"><b>${g} · ${esc(gl)}</b><div class="pn-grid">${ids.map(i => `<button type="button" class="pn-btn" data-pn="jump" data-k="${i}" aria-current="${i === c.id}"><span class="c">${esc(SC.SCREENS[i].code)}</span>${esc(SC.SCREENS[i].title)}</button>`).join('')}</div></div>` : '').join('')}
    </section>
    <section class="pn-sec"><button type="button" class="pn-btn wide" data-pn="restart">${ic('rotate-ccw', 14, 2)} เริ่มใหม่ตั้งแต่เข้าสู่ระบบ</button></section>
    <p class="pn-foot">กดในจอได้เหมือนใช้จริง · แผงนี้ไม่ใช่ส่วนของคอนโซล · รหัสจอ S = คอนโซลร้าน · C = แอปลูกค้า · เปิดจอตรงได้ด้วย ?screen=&lt;id&gt;&amp;state=&lt;k&gt;</p>`;
  holdAnchor(keep);
}
panel.addEventListener('click', e => {
  const b = e.target.closest('[data-pn]'); if (!b) return;
  if (b.dataset.k != null) tapped = keyOf(b);
  const k = b.dataset.k, c = SC.cur();
  switch (b.dataset.pn) {
    case 'hide': toggle(false); break;
    case 'state': SC.reseed(); SC.go(c.id, { st: k, p: {} }); break;
    case 'jump': SC.reseed(); SC.go(k, { p: {} }); break;
    case 'cust': pick = +k; render(); break;
    case 'sim': { const def = SC.SCREENS[c.id]; (def.sims?.({ id: c.id, st: c.st, S: SC.S }) || []).filter(Boolean)[+k]?.run(); break; }
    case 'size': size = k; fit(); render(); break;
    case 'restart': SC.S = SC.fresh(); SC.go('login'); break;
    case 'who': {
      /* sign in as someone else without going through S101: stays on this screen when that account may see it */
      const S = SC.S, P = SC.PHARM[k], def = SC.SCREENS[c.id];
      S.me = k; if (!P.admin) S.branch = P.home;
      if (c.id === 'branch') { const s = SC.startSt(k); if (s) SC.go('branch', { st: s }); else SC.adminIn(); }
      else if (c.id === 'login') SC.refresh();
      else if (P.role === 'staff') SC.go(def.staff ? c.id : 'pack', def.staff ? { st: c.st, p: c.p } : {});
      else if (P.admin ? !def.duty : !def.admin) SC.go(c.id, { st: c.st, p: c.p });
      else SC.go('queue', { st: 'live' });
      SC.toast(`แผงตรวจ: เข้าสู่ระบบเป็น ${P.short}${P.admin ? ' (ทุกสาขา)' : ' · ' + SC.branch(P.home).short}`, 'user-check');
      break;
    }
  }
});
function toggle(on) { rv.classList.toggle('pn-off', !on); fab.setAttribute('aria-expanded', String(on)); requestAnimationFrame(fit); if (on) render(); }
fab.addEventListener('click', () => toggle(true));
SC.on('screen', render);
SC.panel = { render, fit, toggle };
if (Q.get('panel') === '0') rv.classList.add('pn-off');
})();

/* ===== 40-start.js ===== */
/* =====================================================================
   40 · Group 1 เริ่มกะ: S101 login (mock, Protected Area) · S102 start the shift.
   Owner 20/10/2026: "User ยกผูกอยู่กับสาขาเลยไม่ต้องเลือก ยกเว้น superadmin ที่ access ได้ทุกสาขา"
   = a branch account goes straight to its own branch; only superadmin picks (and switches) a branch.
   Owner 20/10/2026: "502 ขึ้นกับ login ว่าเภสัชคนไหนล้อคอิน" = the pharmacist customers see is whoever
   signed in and confirmed; a second pharmacist signing in at the same branch takes over the shift.
   ===================================================================== */
(() => {
const { $, esc, ic, ui } = SC;

/* ---------- S101 login (mock only: no real auth logic, nothing is checked or stored) ----------
   Owner 20/10/2026 (FDA review B1): "เดี๋ยวต้องแจ้ง console ให้ทำเลย" + "ยืนยันตอนล็อคอินทีเดียว" = the website's three
   gates, once at sign-in: password, then the QR on this screen scanned with the pharmacist's own phone (the phone must be
   within 200 m of the branch; the branch comes from where the phone is), then an SMS OTP. The session starts only after
   the third gate (the website learned this the hard way: a session made before the gates is no gate). No re-check per case */
const GATES = ['รหัสผ่าน', 'ยืนยันว่าอยู่ที่ร้าน', 'รหัส OTP'];
const gates = n => `<ol class="gt mt16" aria-label="ขั้นตอนเข้าสู่ระบบ">${GATES.map((g, i) => `<li class="${i < n ? 'done' : i === n ? 'cur' : ''}"${i === n ? ' aria-current="step"' : ''}><span class="gt-n">${i < n ? ic('check', 12, 3) : i + 1}</span><span>${g}</span></li>`).join('')}</ol>`;
const QR_ST = ['qr', 'far', 'nogps', 'wrongbr'], OTP_ST = ['otp', 'otperr'];
const pend = () => SC.S.lgPend || { me: 'kj' };
/* a fixed fake QR: three corner squares and a made-up pattern, nothing encoded */
const QR = (() => {
  const n = 25, fin = [[0, 0], [n - 7, 0], [0, n - 7]];
  const on = (x, y) => {
    const f = fin.find(([a, b]) => x - a >= 0 && x - a < 7 && y - b >= 0 && y - b < 7);
    if (f) { const u = x - f[0], v = y - f[1]; return u === 0 || u === 6 || v === 0 || v === 6 || (u > 1 && u < 5 && v > 1 && v < 5); }
    if ((x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)) return false;
    return (x * 7 + y * 13 + x * y) % 5 < 2;
  };
  let d = ''; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (on(x, y)) d += `M${x} ${y}h1v1h-1z`;
  return `<svg class="qr" viewBox="-2 -2 ${n + 4} ${n + 4}" role="img" aria-label="QR สำหรับยืนยันว่าอยู่ที่ร้าน (จำลอง)"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="currentColor"/></svg>`;
})();
const head = () => `<div class="solo-logo">${SC.logo()}<p>คอนโซลร้าน · ปรึกษาเภสัชกร</p></div>
      <div class="mock-flag mt16" role="note">${ic('info', 16, 2)}<span><b>จำลอง</b> ไม่มีการตรวจรหัสจริง ระบบจริงใช้บัญชีพนักงานของร้าน</span></div>`;
function gateCard(st) {
  const S = SC.S, me = SC.PHARM[pend().me], b = SC.branch(me.home || 'tw'), other = SC.BRANCHES.find(x => x.id !== b.id);
  if (QR_ST.includes(st)) {
    const msg = st === 'far' ? ui.note(`<b>โทรศัพท์อยู่ห่างจาก${esc(b.name)} 1,240 เมตร</b><p>ต้องอยู่ในร้าน ไม่เกิน 200 เมตร จึงเข้าระบบได้ · เข้าไปในร้านแล้วสแกน QR อีกครั้ง</p>`, { tone: 'danger', role: 'alert', icon: 'map-pin' })
      : st === 'nogps' ? ui.note('<b>โทรศัพท์ไม่ให้ใช้ตำแหน่ง</b><p>ระบบตรวจไม่ได้ว่าคุณอยู่ที่ร้าน · เปิดการใช้ตำแหน่งให้เบราว์เซอร์ในโทรศัพท์ แล้วสแกน QR อีกครั้ง</p>', { tone: 'warn', role: 'alert', icon: 'map-pin' })
      : st === 'wrongbr' ? ui.note(`<b>โทรศัพท์อยู่ที่${esc(other.name)} (ห่าง 30 เมตร)</b><p>บัญชีของคุณผูกกับ${esc(b.name)} เข้าระบบได้เฉพาะที่สาขาของบัญชี · ถ้าวันนี้ต้องช่วยสาขาอื่น ให้ผู้ดูแลระบบเปลี่ยนสาขาของบัญชีก่อน</p>`, { tone: 'warn', role: 'alert', icon: 'store' }) : '';
    return `<div class="solo"><div class="solo-card">${head()}${gates(1)}
      <h1 class="h2 mt16">ยืนยันว่าอยู่ที่ร้าน</h1><p class="small">${esc(me.short)} · บัญชีผูกกับ${esc(b.name)}</p>
      <div class="qr-w mt16">${QR}<ol class="qr-s"><li>เปิดกล้องโทรศัพท์ของคุณ สแกน QR นี้</li><li>กดอนุญาตให้ใช้ตำแหน่ง ระบบตรวจว่าอยู่ในร้าน ไม่เกิน 200 เมตร</li><li>รอรหัส OTP ทาง SMS แล้วใส่ที่จอนี้</li></ol></div>
      ${msg ? `<div class="mt16">${msg}</div>` : `<p class="small mt12" role="status">${ic('clock', 13, 2)} รอสแกน · QR นี้ใช้ได้ 5 นาที</p>`}
      <div class="btn-row mt16">${ui.btn('ยกเลิก', { kind: 'secondary', a: 'lgCancel' })}${ui.btn(msg ? 'สร้าง QR ใหม่ แล้วสแกนอีกครั้ง' : 'สร้าง QR ใหม่', { kind: msg ? 'primary' : 'ghost', a: 'lgQrNew', icon: 'refresh-cw' })}<span class="sp"></span>${msg ? '' : ui.btn('จำลอง: สแกนแล้ว อยู่ในร้าน', { kind: 'ghost', sm: true, a: 'lgScan', v: 'ok', icon: 'smartphone' })}</div>
    </div></div>`;
  }
  const err = st === 'otperr' ? (S.otpErr || 'bad') : '';
  return `<div class="solo"><div class="solo-card">${head()}${gates(2)}
    <h1 class="h2 mt16">ใส่รหัส OTP</h1><p class="small">ส่ง SMS ไปที่เบอร์ของ ${esc(me.short)} ลงท้าย ${esc(me.staff.slice(-4))} แล้ว · รหัสใช้ได้ 5 นาที</p>
    ${me.admin ? `<p class="small mt4">${ic('info', 13, 2)} ผู้ดูแลระบบไม่ได้ประจำร้าน ข้ามขั้นยืนยันที่ร้าน (รอเจ้าของเคาะ)</p>` : ''}
    <form class="gap12 mt16" id="otpForm" onsubmit="return false">
      ${ui.field({ id: 'lgOtp', label: 'รหัส OTP 6 หลัก', max: 6, req: true, ac: 'one-time-code', ph: 'เช่น 482913', focus: true, error: err === 'empty' ? 'ใส่รหัส 6 หลักจาก SMS' : err === 'short' ? 'รหัส OTP มี 6 หลัก ใส่ให้ครบก่อน (ยังไม่นับว่าใส่ผิด)' : err ? 'รหัสไม่ถูกต้องหรือหมดอายุ ลองอีกครั้ง หรือกดส่งรหัสใหม่ · ใส่ผิดได้อีก 2 ครั้ง' : '' })}
      ${ui.btn('ยืนยันและเข้าสู่ระบบ', { a: 'lgOtp', block: true, lg: true, icon: 'log-in' })}</form>
    <div class="btn-row mt12">${ui.btn('ยกเลิก', { kind: 'ghost', sm: true, a: 'lgCancel' })}<span class="sp"></span><button type="button" class="link small" data-a="lgOtpRe">ส่งรหัสใหม่</button></div>
    <p class="small mt12">ไม่ได้รับ SMS ภายใน 1 นาที กดส่งรหัสใหม่ · ส่งได้ 3 ครั้ง · ใส่ผิด 3 ครั้ง ต้องเริ่มใหม่ที่รหัสผ่าน</p>
  </div></div>`;
}
SC.screen('login', {
  code: 'S101', group: 1, staff: true, title: 'เข้าสู่ระบบ', shell: false,
  states: [['normal', 'ปกติ'], ['error', 'รหัสไม่ถูกต้อง'], ['loading', 'กำลังเข้าสู่ระบบ'],
    ['qr', 'ขั้น 2: สแกน QR ยืนยันว่าอยู่ที่ร้าน'], ['far', 'อยู่นอกระยะร้าน'], ['nogps', 'โทรศัพท์ไม่ให้ใช้ตำแหน่ง'], ['wrongbr', 'อยู่ที่สาขาอื่น'],
    ['otp', 'ขั้น 3: ใส่รหัส OTP'], ['otperr', 'OTP ไม่ถูกต้องหรือหมดอายุ'], ['idle', 'ออกจากระบบเพราะไม่ได้ใช้งาน']],
  cust: [],
  notes: ['เจ้าของ 20/10 (B1): "เดี๋ยวต้องแจ้ง console ให้ทำเลย" · "ไม่เอา ยืนยันตอนล็อคอินทีเดียว" · เข้าสู่ระบบ 3 ขั้นแบบหลังบ้านเว็บ: รหัสผ่าน → สแกน QR บนจอนี้ด้วยโทรศัพท์ของตัวเอง ระบบตรวจว่าโทรศัพท์อยู่ในร้าน ไม่เกิน 200 เมตร → รหัส OTP ทาง SMS · เข้าระบบจริงหลังผ่านขั้นที่ 3 เท่านั้น · ไม่ยืนยันซ้ำตอนรับเคส (แทนข้อ 37)',
    'สาขามาจากตำแหน่งตอนสแกน ต้องตรงกับสาขาของบัญชี · โทรศัพท์อยู่สาขาอื่น เข้าไม่ได้ (S101.7)',
    'พนักงานร้านผ่าน 3 ขั้นเหมือนเภสัชกร · ผู้ดูแลระบบไม่ได้ประจำร้าน ในต้นแบบใช้รหัสผ่านกับ OTP (รอเจ้าของเคาะ)',
    'ไม่ได้ใช้งาน 30 นาที ออกจากระบบเอง (S101.10) · ถ้าเป็นเภสัชกรประจำวัน ระบบพักรับเคสให้ ลูกค้าในคิวยังรอ (รอเจ้าของเคาะเวลา)',
    'Protected Area: จอนี้เป็นของจำลอง ไม่มีการตรวจรหัสจริง ไม่เก็บอะไร (ติดป้ายจำลองไว้บนจอ)', 'เคาะแล้ว 19/10: ใช้บัญชีเดียวกับหลังบ้านเว็บ (/backend) (ข้อ 37)', 'ช่องว่างทุกครั้ง เครื่องร้านใช้ร่วมกัน ไม่จำรหัสของคนก่อน', 'บัญชีจำลอง (รหัสผ่านอะไรก็ได้ OTP 6 หลักอะไรก็ได้): MT-0457 ภญ.ขวัญใจ (ตลาดเวิลด์) · MT-0312 ภก.ธัชพล (อ่อนนุช) · MT-0518 ภญ.พิมพ์ชนก (ตลาดเวิลด์ ยังไม่เข้ากะ) · MT-0581 คุณสุนิสา พนักงานร้าน (ตลาดเวิลด์) · MT-0001 ผู้ดูแลระบบ (ทุกสาขา)', 'เคาะแล้ว 20/10: พนักงานร้านไม่ผ่าน S102 เข้าจอ S404 จัดยาและส่งเลย (ข้อ 67)', 'เจ้าของสั่ง 20/10: บัญชีผูกกับสาขา เข้าสู่ระบบแล้วไปสาขาของตัวเองเลย ไม่ต้องเลือก · ผู้ดูแลระบบเท่านั้นที่เลือกได้ทุกสาขา', 'บัญชีผูกกับเภสัชกรหนึ่งคน ชื่อและเลขใบอนุญาตที่ลูกค้าเห็นมาจากบัญชีนี้ ไม่มีช่องให้พิมพ์ชื่อเอง', 'รหัสไม่ถูกไม่บอกว่าช่องไหนผิด (กันเดารหัส) และบอกทางไปต่อ'],
  wait: ['ผู้ดูแลระบบเข้าสู่ระบบจากที่ไหน (ตอนนี้: รหัสผ่านกับ OTP ไม่ต้องอยู่ที่ร้าน)', 'ไม่ได้ใช้งานนานเท่าไรจึงออกจากระบบเอง (ตอนนี้: 30 นาที แล้วพักรับเคสของสาขาให้)'],
  prep(S, st) { if (S._reseed || st !== 'error') S.lgErr = st === 'error' ? 'bad' : null; if (S._reseed) S.otpErr = st === 'otperr' ? 'bad' : null; },
  render(ctx) {
    const S = SC.S, st = ctx.st;
    if (QR_ST.includes(st) || OTP_ST.includes(st)) return gateCard(st);
    const err = st === 'error' ? (S.lgErr || 'bad') : '', busy = st === 'loading';
    const uErr = err === 'user' || err === 'both' ? 'ใส่รหัสพนักงาน' : '', pErr = err === 'pass' || err === 'both' ? 'ใส่รหัสผ่าน' : err === 'bad' ? 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง ลองอีกครั้ง ถ้าจำไม่ได้ ติดต่อผู้จัดการสาขาเพื่อตั้งรหัสใหม่' : '';
    return `<div class="solo"><div class="solo-card">${head()}
      ${st === 'idle' ? `<div class="mt16">${ui.note('<b>ออกจากระบบแล้ว เพราะไม่ได้ใช้งาน 30 นาที</b><p>เข้าสู่ระบบอีกครั้งต้องผ่าน 3 ขั้นเหมือนเดิม · ระบบพักรับเคสของสาขาให้แล้ว ลูกค้าในคิวยังรอ ไม่เสียคิว</p>', { tone: 'warn', role: 'status', icon: 'clock' })}</div>` : ''}
      ${gates(0)}
      <h1 class="h2 mt16">เข้าสู่ระบบ</h1>
      <p class="small">สำหรับเภสัชกรและพนักงานร้าน MITRAREE</p>
      <form class="gap12 mt16" id="lgForm" onsubmit="return false">
        ${ui.field({ id: 'lgUser', label: 'รหัสพนักงาน', value: S.lgUser || '', ph: 'เช่น MT-0457', ac: 'username', req: true, disabled: busy, error: uErr, focus: !err || err === 'user' || err === 'both' })}
        ${ui.field({ id: 'lgPass', label: 'รหัสผ่าน', type: 'password', value: '', ac: 'current-password', req: true, disabled: busy, error: pErr, focus: err === 'pass' || err === 'bad' })}
        ${ui.btn(busy ? 'กำลังตรวจรหัส' : 'เข้าสู่ระบบ', { a: 'login', block: true, lg: true, icon: 'log-in', busy })}
      </form>
      <p class="small mt16">${ic('lock', 13, 2)} ขั้นถัดไป: สแกน QR ด้วยโทรศัพท์ของคุณที่ร้าน แล้วใส่รหัส OTP · การเข้าใช้งานทุกครั้งถูกบันทึก · ออกจากระบบเองเมื่อไม่ได้ใช้ 30 นาที</p>
    </div></div>`;
  },
  mount(el) {
    $('#lgForm', el)?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); SC.ACTS.login($('[data-a="login"]', el)); } });
    $('#otpForm', el)?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); SC.ACTS.lgOtp($('[data-a="lgOtp"]', el)); } });
  },
  sims: ({ st }) => QR_ST.includes(st) ? [{ label: 'สแกนแล้ว โทรศัพท์อยู่ในร้าน (ห่าง 25 เมตร)', run: () => SC.go('login', { st: 'otp' }) }, { label: 'สแกนแล้ว อยู่นอกร้าน (ห่าง 1.2 กม.)', run: () => SC.go('login', { st: 'far' }) }, { label: 'โทรศัพท์ไม่ให้ใช้ตำแหน่ง', run: () => SC.go('login', { st: 'nogps' }) }, { label: 'สแกนที่สาขาอื่น', run: () => SC.go('login', { st: 'wrongbr' }) }]
    : OTP_ST.includes(st) ? [{ label: 'ใส่รหัส OTP ผิด', run: () => { SC.S.otpErr = 'bad'; SC.go('login', { st: 'otperr' }); } }, { label: 'ใส่รหัส OTP ถูก', run: () => { $('#lgOtp').value = '482913'; SC.ACTS.lgOtp($('[data-a="lgOtp"]')); } }]
    : [{ label: 'ลองใส่รหัสผิด', run: () => { SC.S.lgErr = 'bad'; SC.setSt('error'); } },
      ...[['MT-0457', 'เข้าในชื่อ ภญ.ขวัญใจ (ตลาดเวิลด์)'], ['MT-0518', 'เข้าในชื่อ ภญ.พิมพ์ชนก (รับกะต่อ)'], ['MT-0581', 'เข้าในชื่อ พนักงานร้าน (ตลาดเวิลด์)'], ['MT-0001', 'เข้าในชื่อ ผู้ดูแลระบบ']].map(([u, label]) => ({ label: label + ' ข้าม 3 ขั้น', run: () => { SC.S.lgPend = { me: ACCTS[u] }; finish(); } }))]
});
const ACCTS = { 'MT-0457': 'kj', 'MT-0312': 'tp', 'MT-0518': 'pc', 'MT-0581': 'st', 'MT-0001': 'admin' };
/* where a fresh sign-in lands: a branch account confirms its shift at its own branch; superadmin skips S102 and
   goes straight into the queue, the branch is picked in the top bar (owner 20/10: "ให้ไปเลือกสาขาด้านในดีกว่า") */
SC.startSt = me => { const P = SC.PHARM[me]; if (P.admin || P.role === 'staff') return null; const d = SC.duty(P.home); return d && d.id !== me ? 'takeover' : 'confirm'; };
/* store staff skip S102 as well: they never become the pharmacist on duty, they land on S404 (item 67) */
SC.adminIn = () => { if (SC.isStaff()) return SC.go('pack'); SC.go('queue', { st: 'live' }); SC.toast(`ดู${SC.branch().name}อยู่ · เปลี่ยนสาขาได้ที่ปุ่ม "ดูสาขา" บนแถบบน`, 'store'); };
SC.act('login', async t => {
  const u = $('#lgUser'), p = $('#lgPass'), S = SC.S, id = u.value.trim().toUpperCase();
  S.lgUser = u.value.trim();
  const e = !id && !p.value ? 'both' : !id ? 'user' : !p.value ? 'pass' : !ACCTS[id] ? 'bad' : '';
  if (e) { S.lgErr = e; SC.go('login', { st: 'error' }); return; }
  await SC.busy(t, 700);
  /* password passed: nothing is signed in yet, the next two gates decide */
  S.lgPend = { me: ACCTS[id] }; S.otpErr = null;
  SC.go('login', { st: SC.PHARM[ACCTS[id]].admin ? 'otp' : 'qr' });
});
SC.act('lgScan', t => SC.go('login', { st: t.dataset.v === 'ok' ? 'otp' : t.dataset.v }));
SC.act('lgQrNew', () => { SC.go('login', { st: 'qr' }); SC.toast('สร้าง QR ใหม่แล้ว สแกนด้วยโทรศัพท์ของคุณ', 'qr-code'); });
SC.act('lgCancel', () => { SC.S.lgPend = null; SC.go('login', { st: 'normal' }); });
SC.act('lgOtpRe', () => SC.toast('ส่งรหัส OTP ใหม่ทาง SMS แล้ว รหัสเดิมใช้ไม่ได้', 'send'));
SC.act('lgOtp', async t => {
  const v = ($('#lgOtp')?.value || '').trim();
  /* real-user test 21/10: a code shorter than 6 digits is not counted as a wrong try */
  if (!/^\d{6}$/.test(v)) { SC.S.otpErr = v ? 'short' : 'empty'; SC.go('login', { st: 'otperr' }); return; }
  await SC.busy(t, 600); finish();
});
/* all three gates passed: the session starts here and only here */
function finish() {
  const me = pend().me, gate = SC.PHARM[me].admin ? 'รหัสผ่านและ OTP' : 'QR ที่ร้าน ห่าง 25 เมตร และ OTP';
  const off = SC.S.off;
  SC.S = { ...SC.fresh(), me, branch: SC.PHARM[me].home || 'tw', st: {} };
  if (off) {
    const S = SC.S; S.off = off; S.dutyBy[off.b] = null; S.intake[off.b] = 'closed';
    if (off.k) { S.q[off.b] = (S.q[off.b] || []).filter(k => k !== off.k); if (off.who === me) { S.activeCase = off.k; S.caseBr = { [off.k]: off.b }; } }
  }
  SC.logEv('signin', `เข้าสู่ระบบ ผ่าน${gate}`);
  const st = SC.startSt(me);
  if (st) SC.go('branch', { st }); else SC.adminIn();
}

/* ---------- S102 start the shift ---------- */
/* B2 (owner 20/10: "ทำระบบกล้องให้เห็น card เภสัชให้ลูกค้าเห็นระหว่างรอหน่อย"): one photo from the store computer's camera at
   the start of the shift goes on the pharmacist card customers see while they wait, and on S502. No camera: the photo
   from the pharmacist register is used instead, and that is logged. Mock: the photo is a drawn silhouette */
const SHOT0 = { kj: { at: '08:55' }, tp: { at: '08:52' } };
SC.shotOf = id => SC.S.shot?.[id] || SHOT0[id] || null;
SC.shotImg = (s, size) => `<span class="shot${size ? ' ' + size : ''}" role="img" aria-label="รูปถ่ายเข้ากะ${s.reg ? ' (รูปจากทะเบียน)' : ' ' + s.at}"><span class="ph-sil"></span><i>${s.reg ? 'ทะเบียน' : esc(s.at)}</i></span>`;
const pass = (p, b, shot) => `<div class="pass">
  <div class="hrow"><span class="label brand-t">เภสัชกรที่ปฏิบัติงานวันนี้</span><span class="sp"></span>${ui.tag('ตรวจสอบแล้ว', 'ok', { icon: 'badge-check' })}</div>
  <div class="hrow mt12">${shot ? SC.shotImg(shot, 'lg') : ui.av(p.ini, { size: 'lg', solid: true })}<div><p class="ps-n">${esc(p.name)}</p><p class="small">ใบอนุญาตประกอบวิชาชีพ <b>${esc(p.lic)}</b></p></div></div>
  <div class="hrow mt12 small"><span>${esc(b.name)} · ใบอนุญาตร้าน ${esc(b.lic)}</span></div></div>`;
const camBox = (st, shot) => {
  const cam = st === 'camoff' ? 'off' : st === 'camdeny' ? 'deny' : 'on';
  return `<div class="cam"><div class="cam-v${cam !== 'on' ? ' off' : ''}" role="img" aria-label="${cam === 'on' ? 'ภาพจากกล้องเครื่องร้าน' : 'กล้องใช้ไม่ได้'}">${cam === 'on' ? `<span class="ph-sil"></span><span class="cam-live">${ic('camera', 13, 2)}กล้องเครื่องร้าน</span>` : `<span class="cam-x">${ic('video-off', 28, 1.8)}</span>`}</div>
    <div class="grow"><p><b>${shot ? (shot.reg ? 'ใช้รูปจากทะเบียนเภสัชกร' : `ถ่ายรูปแล้ว ${esc(shot.at)}`) : 'ถ่ายรูปตอนเข้ากะ 1 รูป'}</b></p><p class="small">ลูกค้าเห็นรูปนี้บนบัตรเภสัชกรระหว่างรอคิว</p>
      ${cam === 'off' ? '<p class="small warn-t mt4">กล้องของเครื่องนี้ใช้ไม่ได้</p>' : cam === 'deny' ? '<p class="small warn-t mt4">ยังไม่ได้อนุญาตให้ใช้กล้อง กด "อนุญาต" ที่แถบบนของเบราว์เซอร์ แล้วกดลองอีกครั้ง</p>' : ''}
      <div class="btn-row mt8">${cam === 'on' ? ui.btn(shot && !shot.reg ? 'ถ่ายใหม่' : 'ถ่ายรูป', { kind: shot ? 'ghost' : 'secondary', sm: true, a: 'shiftShot', icon: 'camera', focus: !shot }) : `${cam === 'deny' ? ui.btn('ลองอีกครั้ง', { kind: 'secondary', sm: true, a: 'shiftCam', icon: 'refresh-cw' }) : ''}${shot ? '' : ui.btn('ใช้รูปจากทะเบียนเภสัชกร', { kind: 'secondary', sm: true, a: 'shiftReg', icon: 'image' })}`}</div></div></div>`;
};
const intakeTxt = id => { const S = SC.S, v = S.intake[id]; return S.sysOff ? 'ปิดระบบอยู่' : v === 'open' ? 'เปิดรับ' : v === 'pause' ? 'พักชั่วคราว' : 'ปิดรับ'; };
SC.screen('branch', {
  code: 'S102', group: 1, title: 'เริ่มกะ', shell: false,
  states: [['confirm', 'ยืนยันเข้ากะ (บัญชีผูกกับสาขา)', { cust: [['queue', 'q2', 'ชื่อและเลขใบอนุญาตนี้ขึ้นบนบัตรในหน้ารอคิว'], ['room', 'live']] }],
    ['takeover', 'มีเภสัชกรประจำอยู่แล้ว: รับกะต่อ', { cust: [['queue', 'q2', 'บัตรในหน้ารอคิวเปลี่ยนเป็นชื่อคนที่รับกะต่อ']] }],
    ['camoff', 'กล้องใช้ไม่ได้', { cust: [['queue', 'q2', 'บัตรใช้รูปจากทะเบียนเภสัชกร']] }],
    ['camdeny', 'ไม่ได้อนุญาตให้ใช้กล้อง', { cust: [['queue', 'q2']] }]],
  notes: ['เจ้าของ 20/10 (B2): "ทำระบบกล้องให้เห็น card เภสัชให้ลูกค้าเห็นระหว่างรอหน่อย" · ตีความว่า ถ่ายรูปเภสัชกรด้วยกล้องเครื่องร้านตอนเข้ากะ 1 รูป รูปนี้ขึ้นบนบัตรเภสัชกรที่ลูกค้าเห็นระหว่างรอคิว และในจอ S502 (รอเจ้าของยืนยันว่าหมายถึงแบบนี้) · ยืนยันเข้ากะได้เมื่อมีรูปแล้ว · กล้องใช้ไม่ได้ ใช้รูปจากทะเบียนเภสัชกรแทน ระบบบันทึกไว้',
    'เคาะแล้ว 20/10: คนใหม่เข้าสู่ระบบแล้วรับกะต่อได้เลย คนเดิมไม่ต้องกดส่งต่อ ระบบแจ้งคนเดิมและบันทึกการเปลี่ยนคน (ข้อ 52)', 'เคาะแล้ว 20/10: ผู้ดูแลระบบรับเคสและจ่ายยาไม่ได้ ดูและตั้งค่าอย่างเดียว ถ้าเป็นเภสัชกรด้วยให้เข้าด้วยบัญชีเภสัชกรของสาขา (ข้อ 53)', 'เจ้าของสั่ง 20/10: บัญชีผูกกับสาขา เข้าสู่ระบบแล้วไม่ต้องเลือกสาขา (S102.1) · ผู้ดูแลระบบไม่ผ่านจอนี้ เข้าคิวเลย แล้วเลือกสาขาที่ปุ่ม "ดูสาขา" บนแถบบน (เจ้าของ 20/10: "ผู้ดูแลระบบให้ไปเลือกสาขาด้านในดีกว่า")', 'เจ้าของสั่ง 20/10: เภสัชกรประจำวัน = คนที่เข้าสู่ระบบและยืนยันเข้ากะ ลูกค้าเห็นชื่อและเลขใบอนุญาตนี้ในหน้ารอคิว', 'มีคนประจำอยู่แล้ว (S102.2): คนใหม่กดรับกะต่อได้เลย ไม่ต้องรอคนเดิมกดส่งต่อ · คนเดิมได้รับแจ้ง เคสที่เปิดอยู่ดูแลต่อจนปิด', 'เจ้าของ 20/10: "102 จะให้เลือก ฉันอยู่ประจำสาขา xxx ทำไม ?" · เอาช่องติ๊กออกแล้ว บัญชีผูกกับสาขาอยู่แล้ว ปุ่มยืนยันเข้ากะคือการยืนยันว่าอยู่ประจำร้านตลอดเวลาที่เปิดรับ (กฎ อย.) ระบบบันทึกชื่อและเวลา · อยู่ที่ร้านจริงพิสูจน์แล้วตอนเข้าสู่ระบบ (S101: QR ที่ร้าน ไม่เกิน 200 เมตร และ OTP)', 'ภก.ธัชพล เข้ากะอ่อนนุชไว้แล้วตั้งแต่ 08:52 · เข้าระบบใหม่ = กลับเข้ากะเดิม', 'ผู้ดูแลระบบไม่ใช่เภสัชกรประจำวัน: ดูคิวและเคสได้ทุกสาขา ตั้งค่าร้านได้ แต่รับเคสไม่ได้'],
  wait: [],
  prep(S, st) {
    if (!S._reseed) return;
    S.me = st === 'takeover' ? 'pc' : SC.PHARM[S.me]?.admin || S.me === 'pc' ? 'kj' : S.me;
    S.branch = SC.me().home;
  },
  render(ctx) {
    const S = SC.S, st = ctx.st, me = SC.me();
    const b = SC.branch(me.home), back = me.id === 'tp' && !S.shiftAt?.on, take = st === 'takeover', cur = SC.duty(b.id), shot = S.shot?.[me.id] || (back ? SHOT0[me.id] : null);
    return `<div class="solo"><div class="solo-card wide">
      <div class="hrow"><span class="label">สวัสดี ${esc(me.short)}</span><span class="sp"></span>${ui.btn('ไม่ใช่คุณ ออกจากระบบ', { kind: 'ghost', sm: true, a: 'logoutGo' })}</div>
      <h1 class="h2 mt8">${take ? `รับกะต่อที่${esc(b.name)}` : back ? 'กลับเข้ากะเดิม' : `เข้ากะที่${esc(b.name)}`}</h1>
      <p class="small">${back ? `คุณเป็นเภสัชกรประจำ${esc(b.name)}อยู่แล้วตั้งแต่ ${esc(me.since)} · ` : ''}บัญชีของคุณผูกกับ${esc(b.name)} · ลูกค้าจะเห็นบัตรนี้ในหน้ารอคิว</p>
      ${take && cur ? `<div class="mt16">${ui.note(`<b>ตอนนี้ ${esc(cur.short)} ประจำอยู่ตั้งแต่ ${esc(cur.since)}</b><p>ถ้ารับกะต่อ ลูกค้าจะเห็นชื่อคุณแทนทันที · ${esc(cur.short)} ได้รับแจ้ง และดูแลเคสที่เปิดอยู่ต่อจนปิด</p>`, { tone: 'warn', role: 'status', icon: 'arrow-right-left' })}</div>` : ''}
      <div class="br-grid mt16">${pass(me, b, shot)}
        <div class="gap12">${camBox(st, shot)}
          ${ui.kv([['วันที่', `${SC.NOW.date} (วัน${SC.NOW.day})`], ['เวลาทำการ', esc(b.hours)], ['ลูกค้ารอในคิว', `${SC.qlen(b.id)} คน`]])}
          <p class="small duty-l">${ic('badge-check', 14, 2)}<span>กดยืนยันเข้ากะ = ยืนยันว่าอยู่ประจำ${esc(b.name)}ตลอดเวลาที่เปิดรับปรึกษา (กฎ อย.) · ระบบบันทึกชื่อและเวลาเข้ากะ</span></p>
        </div></div>
      <div class="btn-row mt24" style="justify-content:flex-end">${shot ? '' : `<p class="small grow">${ic('camera', 13, 2)} ถ่ายรูปก่อน จึงยืนยันเข้ากะได้</p>`}${ui.btn(take ? 'รับกะต่อ แต่ยังพักรับเคส' : 'ยืนยัน แต่ยังพักรับเคส', { kind: 'secondary', a: 'startShift', v: 'pause', lg: true, icon: 'circle-pause', disabled: !shot, title: shot ? '' : 'ถ่ายรูปก่อน' })}${ui.btn(take ? 'รับกะต่อและเปิดรับเคส' : 'ยืนยันและเปิดรับเคส', { a: 'startShift', v: 'open', lg: true, icon: take ? 'arrow-right-left' : 'user-check', focus: !!shot, disabled: !shot, title: shot ? '' : 'ถ่ายรูปก่อน' })}</div>
    </div></div>`;
  }
});
SC.act('shiftShot', async t => { await SC.busy(t, 400); const S = SC.S; S.shot = { ...(S.shot || {}), [S.me]: { at: SC.clockStr() } }; SC.refresh(); SC.toast('ถ่ายรูปแล้ว ลูกค้าเห็นรูปนี้เมื่อยืนยันเข้ากะ', 'camera'); });
SC.act('shiftReg', () => { const S = SC.S; S.shot = { ...(S.shot || {}), [S.me]: { at: SC.clockStr(), reg: true } }; SC.refresh(); SC.toast('ใช้รูปจากทะเบียนเภสัชกรแทน ระบบบันทึกว่ากล้องใช้ไม่ได้', 'image'); });
SC.act('shiftCam', () => SC.setSt('confirm'));
SC.act('startShift', async t => {
  const S0 = SC.S, back = S0.me === 'tp' && !S0.shiftAt?.on;
  if (!S0.shot?.[S0.me] && !back) return SC.toast('ถ่ายรูปก่อนยืนยันเข้ากะ', 'camera');
  await SC.busy(t, 650);
  const S = SC.S, mode = t.dataset.v === 'pause' ? 'pause' : 'open', me = SC.me(), b = SC.branch(me.home), prev = SC.duty(b.id);
  if (S.shot?.[me.id]) SC.logEv('photo', S.shot[me.id].reg ? 'เข้ากะ ใช้รูปจากทะเบียน (กล้องใช้ไม่ได้)' : 'ถ่ายรูปเข้ากะ');
  S.branch = b.id; S.intake[b.id] = mode; S.pause = mode === 'pause' ? { min: 0, until: '' } : null;
  if (!prev || prev.id !== me.id) S.dutyBy[b.id] = me.id;
  if (prev && prev.id !== me.id) S.handFrom = { [b.id]: { who: prev.id, at: SC.clockStr() } };
  if (!(me.id === 'tp' && !S.shiftAt?.on)) S.shiftAt = { ...(S.shiftAt || {}), [b.id]: SC.clockStr() };
  SC.go('queue', { st: mode === 'pause' ? 'pause' : 'live' });
  SC.toast(prev && prev.id !== me.id ? `รับกะต่อจาก ${prev.short} แล้ว · ลูกค้าเห็นชื่อคุณในหน้ารอคิว` : mode === 'pause' ? `เริ่มกะแล้ว พักรับเคสที่${b.name}ไว้ก่อน` : `เริ่มกะแล้ว เปิดรับเคสที่${b.name}`, 'user-check');
});
})();

/* ===== 50-queue.js ===== */
/* =====================================================================
   50 · Group 2 คิว: S201 queue board · S202 case preview (accept / move / decline)
        · S203 questions left outside opening hours
   Every action works on the case that is open on screen (ctx.p.k), never on a fixed person.
   UX review 20/10/2026: no KPI cards, one notice slot, channel pill under the name, whole-row targets,
   accept button named by channel, work-order buttons on S203, pickup by code from any screen.
   ===================================================================== */
(() => {
const { $, $$, esc, ic, ui } = SC;
SC.CASES.new1 = { key: 'new1', id: 'TC-261018-0145', acct: 'กมล ศ.', who: null, person: { name: 'กมล ศ.', first: 'กมล', rel: 'ตัวเอง', age: 29, weight: 61, phone: '08x-xxx-0932', allergies: ['ไอบูโพรเฟน'], allergySrc: 'ระบุเอง 03/08/2026', allergyState: 'set', meds: [] }, symptoms: ['ท้องเสีย'], note: 'ถ่ายเหลว 4 ครั้งตั้งแต่เช้า', urgent: [], mode: 'chat', photos: 0, joined: '14:15', waitS: 4, member: 'สมาชิก · ปรึกษาครั้งแรก',
  answers: { temp: 'ไม่มีไข้ค่ะ ถ่ายเหลว 4 ครั้ง', alg: 'แพ้ไอบูโพรเฟนค่ะ', more: 'ยังกินข้าวได้ค่ะ' } };
SC.CASES.on1 = { key: 'on1', id: 'TC-261018-0140', acct: 'ปรีชา ท.', who: null, person: { name: 'ปรีชา ท.', first: 'ปรีชา', rel: 'ตัวเอง', age: 45, weight: 72, phone: '08x-xxx-6620', allergies: [], allergyState: 'none', meds: [] }, symptoms: ['ปวดท้อง'], note: 'แสบท้องหลังอาหาร 2 วัน', urgent: [], mode: 'chat', photos: 0, joined: '14:09', waitS: 370, member: 'สมาชิก · ปรึกษา 2 ครั้งใน 12 เดือน',
  answers: { temp: 'ไม่มีไข้ครับ', alg: 'ไม่แพ้ยาครับ', more: 'ปวดแสบหลังกินข้าวครับ' } };
const qk = (b = SC.S.branch) => SC.S.q[b] || (SC.S.q[b] = []);
SC.qk = qk;
SC.qlen = b => qk(b).length;
const drawerSt = c => c.urgent.length ? 'urgent' : c.who === 'kid' ? 'family' : 'normal';
const branchOther = () => SC.BRANCHES.find(b => b.id !== SC.S.branch);
const total = o => o.items.reduce((s, i) => s + i.price * i.qty, 0);
/* closed-today counts already in the case history (S403) before this session */
const BASE_CLOSED = { tw: 5, on: 2 }, BASE_UNPAID = { tw: 1, on: 0 };
SC.closedToday = b => BASE_CLOSED[b] + SC.S.closed.filter(x => x.branch === b).length;
/* the one customer from an earlier case who has not paid yet (ตลาดเวิลด์). Becomes a real order the moment the review panel
   says she paid, so the box, the pickup dialog and "รับยาด้วยรหัส" all work on her like on any other order */
const WIP = { key: 'wip', name: 'วิภา ส.', no: 'K4P8XWQ2MNA', id: 'TC-261018-0131', until: '15:40', amt: 480 };
const wipOrder = () => SC.S.orders.wip || (SC.S.orders.wip = { key: 'wip', no: WIP.no, status: 'sent', sent: '14:05', paid: null, ready: null, handed: null, booked: false, items: [SC.ORDER_ITEMS[2], SC.ORDER_ITEMS[0], SC.MED.tears, SC.ORDER_ITEMS[1]].map(i => ({ ...i, qty: 1 })) });
SC.unpaidRows = () => {
  const S = SC.S, rows = [];
  if (S.branch === 'tw') {
    const w = S.orders.wip;
    if (!w) rows.push({ key: 'wip', name: WIP.name, amt: WIP.amt, no: WIP.no, id: WIP.id, status: 'sent', until: WIP.until });
    else if (w.status === 'sent' || (w.status === 'paid' && w.paid?.recv === 'pickup' && !w.handed)) rows.push({ key: 'wip', name: WIP.name, amt: total(w), no: w.no, id: WIP.id, status: w.status, until: WIP.until, ready: w.ready, paidAt: w.paid?.at });
  }
  S.closed.filter(x => x.branch === S.branch && x.no).forEach(x => { const o = S.orders[x.key]; if (o && (o.status === 'sent' || (o.status === 'paid' && o.paid?.recv === 'pickup' && !o.handed))) rows.push({ key: x.key, name: x.who, amt: total(o), no: o.no, id: x.id, status: o.status, until: '16:20', ready: o.ready, paidAt: o.paid?.at }); });
  return rows;
};

/* ---------- board pieces ---------- */
/* status of a branch as a short tag (used where another branch has to be shown: close-early dialog) */
const stTag = v => v === 'open' ? ui.tag('เปิดรับ', 'ok', { icon: 'circle-play' }) : v === 'pause' ? ui.tag('พักชั่วคราว', 'warn', { icon: 'circle-pause' }) : ui.tag('ปิดรับวันนี้', 'muted', { icon: 'ban' });
SC.custSees = b => {
  const S = SC.S, v = S.intake[b], n = SC.qlen(b);
  return S.sysOff ? 'ปิดรับปรึกษาชั่วคราว · ฝากคำถามได้' : v === 'open' ? `เปิดรับ · รอ ${n} คน` : v === 'pause' ? `เภสัชกรพักชั่วคราว · รอ ${n} คน รอต่อได้` : 'ปิดรับวันนี้ · ฝากคำถามได้';
};
/* the one line under the page title (replaces the branch card): "สาขาตลาดเวิลด์ · ภญ.ขวัญใจ ประจำ · ลูกค้าเห็น: เปิดรับ" */
SC.queueLine = (bid = SC.S.branch) => {
  const S = SC.S, b = SC.branch(bid), d = SC.duty(bid), v = S.intake[bid];
  const sees = S.sysOff ? 'ปิดรับปรึกษาชั่วคราว' : v === 'open' ? 'เปิดรับ' : v === 'pause' ? 'เภสัชกรพักชั่วคราว' : 'ปิดรับวันนี้';
  return `${b.name} · ${d ? `${d.short} ประจำ` : 'ไม่มีเภสัชกรเข้าสู่ระบบ'} · ลูกค้าเห็น: ${sees}`;
};
/* wait as minutes, never "3:00" (reads as a clock time); over 10 minutes an orange tag with icon + words */
const waitTxt = s => s < 60 ? 'ไม่ถึง 1 นาที' : `${Math.floor(s / 60)} นาที`;
const waitKey = s => (s > 600 ? 'L' : 'n') + Math.floor(s / 60);
const waitHtml = c => { const s = SC.waitS(c); return s > 600 ? ui.tag(`รอนาน ${Math.floor(s / 60)} นาที`, 'warn', { icon: 'clock' }) : `<span class="clock">${ic('clock', 14, 2)}<span class="num">${waitTxt(s)}</span></span>`; };
const row = (c, i, nextKey) => {
  const p = SC.casePerson(c), urg = c.urgent.length, st = drawerSt(c), next = c.key === nextKey, called = SC.S.urgCalled?.[c.key];
  return `<tr class="click${urg ? ' urg' : ''}" data-go="preview" data-st="${st}" data-p='{"k":"${c.key}"}'>
    <td class="qn"><b class="num">${i + 1}</b>${urg ? '<span class="small danger-t">ดูก่อน</span>' : next ? '<span class="small">คิวถัดไป</span>' : ''}</td>
    <td><b>${ui.who(c)}</b><div class="qn-ch">${ui.mode(c.mode)}<span class="sub" title="${esc(c.member)}">${esc(c.member)}</span></div></td>
    <td><div class="hrow wrap">${ui.urgent(c)}<span class="qb-clamp" title="${esc(c.symptoms.join(' · '))}">${esc(c.symptoms.join(' · '))}</span></div>${urg ? `<span class="sub danger-t">แจ้ง ${esc(c.urgent.join(', '))} · แอปบอกให้โทร 1669 แล้ว${called ? ` · <span class="ok-t">โทรแล้ว ${esc(called.at)}</span>` : ''}</span>` : c.note ? `<span class="sub qb-clamp" title="${esc(c.note)}">${esc(c.note)}</span>` : ''}</td>
    <td>${ui.allergy(p)}</td>
    <td class="r"><span data-wait="${c.key}" data-w="${waitKey(SC.waitS(c))}">${waitHtml(c)}</span><span class="sub">เข้าคิว ${esc(c.joined)}</span></td>
    <td class="r">${ui.btn('ดูเคส', { kind: urg ? 'danger' : next ? 'primary' : 'secondary', go: 'preview', st, p: { k: c.key }, label: 'ดูเคส ' + p.name })}</td></tr>`;
};
/* ONE in-page notice for the secondary matters, most specific first; the rest are one tap away ("และอีก N เรื่อง").
   The urgent-case strip and the system-off strip are in the top bar on every screen, so they are not repeated here.
   A severe call-back goes first (safety); then what this page itself is about (paused / closed, with its button on the right);
   then an ordinary call-back; then a late payer who starts follow-up */
function noticeSlot(S, st) {
  const fu = S.branch === 'tw' && SC.followDue?.(), late = SC.lateFollow?.() || [], fname = SC.SCREENS.follow?.title || 'ติดต่อกลับ';
  const sev = !!fu && fu.what === 'มีอาการรุนแรง', L = [];
  /* real user 20/10: "จะโทรหาเขาหรือรับแชทเขาเลย" when the same person is waiting in the queue: say where they are */
  const inQ = fu && !sev && !['closed', 'empty'].includes(st) ? qk().findIndex(k => SC.CASES[k] && SC.pkey(SC.CASES[k]) === fu.pk) + 1 : 0;
  const cb = fu && { id: 'cb', tone: sev ? 'danger' : 'warn', icon: 'heart-pulse', html: inQ ? `<b>${esc(fu.name)} อยู่ในคิวแล้ว (คิว ${inQ}) คุยเรื่องนี้ในเคสได้เลย</b> · แจ้งว่า${esc(fu.what)} ${esc(fu.at)} · ${esc(fu.due)}` : `<b>ต้องโทรกลับ: ${esc(fu.name)}</b> · แจ้งว่า${esc(fu.what)} ${esc(fu.at)} · ${esc(fu.due)}`, btn: inQ ? ui.btn(`ดูเคส คิว ${inQ}`, { kind: 'secondary', go: 'preview', st: drawerSt(SC.CASES[qk()[inQ - 1]]), p: { k: qk()[inQ - 1] }, icon: 'eye' }) : ui.btn(`ไปที่${fname}`, { kind: 'secondary', go: 'follow', st: fu.st, p: { k: fu.k }, icon: 'arrow-right' }) };
  if (sev) L.push(cb);
  if (st === 'closed') L.push({ id: 'closed', tone: 'quiet', icon: 'ban', html: `<b>ปิดรับเคสวันนี้แล้ว ${esc(S.closedAt || SC.clockStr())}</b> · ลูกค้า ${S.closedQ ?? 0} คนในคิวได้รับแจ้งพร้อมทางเลือก ย้ายสาขาหรือฝากคำถาม · ลูกค้าใหม่เห็นว่าปิดรับวันนี้`, btn: ui.btn('เปิดรับอีกครั้ง', { kind: 'primary', a: 'intake', v: 'open', icon: 'circle-play' }) });
  else if (!S.sysOff && S.intake[S.branch] === 'pause') L.push({ id: 'pause', tone: 'warn', icon: 'circle-pause', html: `<b>พักรับเคสอยู่${S.pause?.until ? ` ถึง ${esc(S.pause.until)}` : ''}${S.pause?.over ? ' · ครบเวลาแล้ว' : ''}</b> · ลูกค้าเห็นว่าเภสัชกรพักชั่วคราว รอต่อได้ไม่เสียคิว · ยังรับเคสได้ตามปกติ`, btn: ui.btn('กลับมารับเคส', { kind: 'secondary', a: 'intake', v: 'open', icon: 'circle-play' }) });
  if (cb && !sev) L.push(cb);
  late.forEach(x => L.push({ id: 'late-' + x.key, tone: '', icon: 'heart-pulse', html: `<b>เริ่มติดตามอาการ: ${esc(x.who)}</b> · ชำระหลังปิดเคส ${esc(x.paidAt)} · ถามอาการตามที่เลือกไว้ตอนปิดเคส`, btn: ui.btn(`ดูใน${fname}`, { kind: 'secondary', go: 'follow', p: { k: 'late-' + x.key } }) }));
  if (!L.length) return '';
  const sig = L.map(x => x.id).join('|');
  if (S.qnSig !== sig) { S.qnSig = sig; S.qnI = 0; }
  S.qnN = L.length;
  const n = L[(S.qnI || 0) % L.length];
  return `<div class="qnote ${n.tone}" role="status">${ic(n.icon, 18, 2)}<div class="grow">${n.html}</div>${L.length > 1 ? `<button type="button" class="link qn-more" data-a="qnNext" title="ดูเรื่องถัดไป">และอีก ${L.length - 1} เรื่อง</button>` : ''}${n.btn}</div>`;
}
SC.act('qnNext', () => { const S = SC.S; S.qnI = ((S.qnI || 0) + 1) % (S.qnN || 1); SC.refresh(); });
/* o.notice === false: a screen that shows its own notice (S602) can leave the slot out */
function board(S, st, o = {}) {
  const loading = st === 'loading', closedSt = st === 'closed';
  const list = closedSt || st === 'empty' ? [] : qk().map(k => SC.CASES[k]), empty = !loading && !list.length;
  const nextKey = list.find(c => !c.urgent.length)?.key;
  const longest = list.length ? Math.max(...list.map(c => SC.waitS(c))) : 0;
  const slot = loading || o.notice === false ? '' : noticeSlot(S, st);
  const body = loading ? Array.from({ length: 3 }, () => `<tr><td>${ui.skel('20px')}</td><td>${ui.skel('70%')}<span class="sub mt4">${ui.skel('45%', 10)}</span></td><td>${ui.skel('80%')}</td><td>${ui.skel('86px', 22, 12)}</td><td class="r">${ui.skel('64px')}</td><td class="r">${ui.skel('72px', 40, 10)}</td></tr>`).join('')
    : list.map((c, i) => row(c, i, nextKey)).join('');
  const head = loading ? '<h3>รอรับ</h3><span class="sp"></span><span class="small"><i class="spin" style="width:12px;height:12px;vertical-align:-1px"></i> กำลังโหลดคิว</span>'
    : `<h3>รอรับ ${list.length} คน${list.length ? ` <span class="qb-sep">·</span> <span class="qb-ch">แชท ${list.filter(c => !ui.isVideo(c.mode)).length} · วิดีโอคอล ${list.filter(c => ui.isVideo(c.mode)).length}</span> <span class="qb-sep">·</span> รอนานสุด <span id="kLong" class="num${longest > 600 ? ' warn-t' : ''}">${waitTxt(longest)}</span>` : ''}</h3>`;
  const table = `<section class="card pad0 qb-card" aria-label="คิวรอรับ"><div class="card-h qb-h">${head}</div>
    ${empty ? ui.empty({ icon: closedSt ? 'ban' : 'inbox', title: closedSt ? 'ไม่มีเคสใหม่จนกว่าจะเปิดรับ' : 'ยังไม่มีลูกค้าในคิว', body: closedSt ? '' : 'เคสใหม่จะขึ้นเองพร้อมเสียงแจ้งเตือน', btn: closedSt ? '' : ui.btn('ดูคำถามนอกเวลา', { kind: 'secondary', go: 'night', icon: 'moon' }) })
      : `<table class="tbl qb-t"><thead><tr><th>#</th><th>ลูกค้า / ผู้มีอาการ</th><th>อาการที่แจ้ง</th><th>แพ้ยา</th><th class="r">รอ</th><th class="r"><span class="sr">ทำรายการ</span></th></tr></thead><tbody>${body}</tbody></table>`}</section>`;
  const ur = SC.unpaidRows(), nSent = ur.filter(r => r.status === 'sent').length;
  const unpaid = ur.length ? `<section class="card qb-card" aria-label="รอชำระและรอรับที่ร้าน"><div class="card-h"><h3>ปิดเคสแล้ว รอชำระ / รอรับที่ร้าน (${ur.length})</h3><span class="sp"></span><span class="small">รอลูกค้าชำระ ${nSent} · รอรับที่ร้าน ${ur.length - nSent}</span></div>
    ${ur.map(r => `<div class="qb-unp mt12">${r.status === 'paid' ? ui.tag('ชำระแล้ว รอรับ', 'ok', { icon: 'store' }) : ui.tag('รอชำระ', 'warn', { icon: 'clock' })}<div class="grow"><b>${esc(r.name)} · ${SC.money(r.amt)}</b><span class="small"> · รายการ <span class="mono">${esc(r.no)}</span> · เคส <span class="mono">${esc(SC.caseCode(r))}</span>${r.status === 'paid' ? ' · รหัสรับยา 4 ตัวท้ายของเลขรายการ' : ` · ชำระได้ถึง ${esc(r.until)}`}</span></div>
      ${r.status === 'paid' ? `${r.ready ? `<span class="small ok-t">แจ้งลูกค้าแล้ว ${esc(r.ready)}</span>` : ui.btn('ยาพร้อมรับแล้ว แจ้งลูกค้า', { a: 'readyRow', v: r.key, icon: 'bell' })}${ui.btn('ลูกค้ามารับยา', { kind: r.ready ? 'primary' : 'secondary', a: 'pickupOv', v: r.key, icon: 'store' })}` : ui.btn('ส่งข้อความเตือนในแชท', { kind: 'ghost', a: 'remindPay' })}</div>`).join('')}</section>` : '';
  return `${slot}${table}${unpaid}`;
}
SC.act('readyRow', async t => { await SC.busy(t, 450); SC.S.orders[t.dataset.v].ready = SC.clockStr(); SC.refresh(); SC.toast('แจ้งลูกค้าแล้ว ยาพร้อมรับที่ร้าน', 'bell'); });
SC.act('remindPay', t => { SC.busy(t, 450); SC.toast('ส่งข้อความเตือนในแชทแล้ว ลูกค้าได้รับแจ้งเตือนในแอป', 'send'); });
SC.queueBoard = board;
const tick = (el, ctx) => ctx.every(() => {
  $$('[data-wait]', el).forEach(n => {
    const c = SC.CASES[n.dataset.wait]; if (!c) return;
    const k = waitKey(SC.waitS(c)); if (n.dataset.w !== k) { n.dataset.w = k; n.innerHTML = waitHtml(c); }
  });
  const l = $('#kLong', el); if (l && qk().length) { const s = Math.max(...qk().map(k => SC.waitS(SC.CASES[k]))); l.textContent = waitTxt(s); l.classList.toggle('warn-t', s > 600); }
}, 1000);
SC.qTick = tick;

/* ---------- S201 queue board ---------- */
SC.screen('queue', {
  code: 'S201', group: 2, title: 'คิวปรึกษา', nav: 'queue',
  states: [['live', 'มีเคสรอ', { cust: [['queue', 'q1', 'สมใจ: คิวถัดไป'], ['branch', 'normal', 'ลูกค้าเห็นคิวรอของแต่ละสาขา'], ['queue', 'urgent', 'ตัวอย่างลูกค้าที่ติดธงด่วน (ฝั่งลูกค้าใช้เคสของสมใจ)']] }],
    ['empty', 'คิวว่าง', { cust: [['home', 'normal', 'ลูกค้าเห็นเปิดรับ รอ 0 คน']] }],
    ['loading', 'กำลังโหลด', { cust: [['queue', 'q2']] }],
    ['pause', 'พักรับเคส', { cust: [['queue', 'paused', 'คิวยังอยู่ ไม่เสียคิว'], ['home', 'busy']] }],
    ['closeask', 'ปิดรับก่อนเวลา: ยืนยัน', { back: 'live', cust: [['queue', 'q1']] }],
    ['closed', 'ปิดรับแล้ว', { cust: [['queueclosed', 'branch', 'คนที่รออยู่ได้รับแจ้งพร้อมทางเลือก'], ['home', 'closed']] }]],
  notes: ['เคาะแล้ว 20/10 ข้อ 68 (เจ้าของ: "เอา 15 30 60 และจนกว่าจะเปิดเอง"): พักรับเคสได้ 15 / 30 / 60 นาที หรือจนกว่าจะเปิดเอง · ลูกค้าในแอปยังรอได้ ไม่เสียคิว · ครบเวลาระบบเตือนให้เปิด', 'เจ้าของ 20/10: "เอาปุ่มโทรออกดีกว่า ใช้งาน pc โทรออกไม่ได้ แต่ให้เด้งเป็นเบอร์โทรขึ้นแทน" (S201) · "s203 แก้เรื่องปุ่มโทรเช่นกัน" · ทุกปุ่มโทรในคอนโซลเปลี่ยนเป็น "ดูเบอร์" เด้งเบอร์เต็มให้โทรจากโทรศัพท์ร้าน มีปุ่มคัดลอกเบอร์ · บอร์ดและการ์ดยังซ่อนเบอร์ · ทุกการเปิดดูเบอร์ถูกบันทึก (ชื่อ เวลา)', 'เคาะแล้ว 20/10 ข้อ 83: ผู้ดูแลระบบเห็นอาการและแพ้ยาในรายการคิวได้เลย (เจ้าของ: "ได้เลย") · การเปิดดูเคสถูกบันทึก', 'ผู้ใช้จริง 20/10 (รอบ 3b): หัวคิวบอกจำนวนแชทกับวิดีโอคอล · แถบเคสด่วนบอกชื่อคนที่ต้องโทร · ผู้ดูแลระบบเห็นเคสด่วนของทุกสาขา', 'เคาะแล้ว 19/10: เคสธงด่วนไม่ลัดคิว ใช้ป้าย "ดูก่อน" และแถบแดงบนสุดตามทุกจอ (ข้อ 36)', 'ลำดับตามเวลาเข้าคิว ตรงกับลำดับที่ลูกค้าเห็น · ธงด่วนไม่ลัดคิว แต่มีป้าย "ดูก่อน" และแถบแดงซ้ายแถว · คนแรกที่ไม่ใช่ธงด่วนมีป้าย "คิวถัดไป" (เดิม "รับก่อน" อ่านแล้วขัดกับ "ดูก่อน") และปุ่ม "ดูเคส" ทึบ ปุ่มอื่นเป็นเส้นขอบ · กดได้ทั้งแถว', 'แถบเหลืองต้องโทรกลับ: ถ้าคนนั้นรออยู่ในคิวแล้ว บอกว่า "อยู่ในคิวแล้ว (คิว N) คุยเรื่องนี้ในเคสได้เลย" ปุ่มไปหน้าติดตามยังอยู่', 'ป้ายช่องทางอยู่ใต้ชื่อลูกค้า: แชท = ทะเลอ่อน · วิดีโอคอล = ครามอ่อน (เคาะแล้ว 20/10 แบบ ก ทะเล + คราม ข้อ 61) มีไอคอนและคำเสมอ (ไม่ใช้สีอย่างเดียว)', 'หัวตารางบอกจำนวนคนรอและ "รอนานสุด" · รอเกิน 10 นาทีขึ้นป้ายส้ม "รอนาน N นาที"', 'ช่องแจ้งในหน้ามีช่องเดียว ทีละเรื่อง (ต้องโทรกลับ · พัก · ปิดรับ · เริ่มติดตามอาการ) ปุ่มอยู่ขวา ถ้ามีหลายเรื่องกด "และอีก N เรื่อง" เพื่อดูเรื่องถัดไป · แถบเคสธงด่วนและระบบปิดอยู่แถบบนสุดของทุกจอ', 'บรรทัดใต้ชื่อจอบอกสาขา เภสัชกรประจำ และสิ่งที่ลูกค้าเห็น · สถานะสาขาอื่นดูได้เฉพาะในหน้าต่างปิดรับก่อนเวลา (S201.5) และย้ายเคส (S202.5)', 'เปิดรับ / พัก / ปิดรับ อยู่บนแถบบนทุกจอ · พักต้องเลือกระยะเวลา ระบบเตือนเมื่อครบ · ปิดรับก่อนเวลาต้องยืนยันพร้อมเหตุผล', 'กล่องล่าง: เคสที่ปิดแล้วแต่ยังรอชำระหรือรอรับยาที่ร้าน กด "ลูกค้ามารับยา" แล้วใส่รหัสรับยา · ปุ่ม "รับยาด้วยรหัส" บนแถบบนใช้ได้ทุกจอ', 'ตัวเลขบนกระดานนับจากข้อมูลในต้นแบบ ขยับตามงานที่ทำ'],
  wait: [],
  head: () => ({ title: 'คิวปรึกษา', sub: SC.queueLine() }),
  prep(S, st) {
    const b = S.branch;
    if (S._reseed) {
      S.intake[b] = st === 'pause' ? 'pause' : st === 'closed' ? 'closed' : 'open';
      if (st === 'pause') S.pause = { min: 15, until: '14:30' };
      if (st === 'empty' || st === 'closed') S.q[b] = [];
      if (st === 'closed') { S.closedQ = 3; S.closedAt = SC.clockStr(); }
      return;
    }
    if (['live', 'pause', 'closed', 'empty'].includes(st)) return S.intake[b] === 'pause' ? 'pause' : S.intake[b] === 'closed' ? 'closed' : 'live';
  },
  render: ctx => board(ctx.S, ctx.st),
  overlay(ctx) {
    if (ctx.st !== 'closeask') return '';
    const n = qk().length, o = branchOther(), od = SC.duty(o.id), can = !SC.S.sysOff && !!od && SC.S.intake[o.id] !== 'closed';
    return ui.modal({ title: 'ปิดรับเคสวันนี้ก่อนเวลา', icon: 'ban', tone: 'danger', back: 'live',
      body: `<p>${n ? `ลูกค้า <b>${n} คน</b>ในคิวของ${esc(SC.branch().name)}จะได้รับแจ้งทันที ${can ? `พร้อมทางเลือก ย้ายไป${esc(o.name)} หรือฝากคำถามไว้` : `ฝากคำถามไว้ได้ (${esc(o.name)}รับย้ายไม่ได้ตอนนี้)`} ข้อมูลอาการไม่หาย` : 'ตอนนี้ไม่มีลูกค้าในคิว ลูกค้าใหม่จะเห็นว่าปิดรับวันนี้ และฝากคำถามได้'}</p>
        <div class="qo mt12"><span class="muted">${ic('store', 18, 1.9)}</span><div class="grow"><b>${esc(o.name)}</b><span class="sub">${od ? `${esc(od.short)} ประจำ` : 'ไม่มีเภสัชกรเข้าสู่ระบบ'} · รอ ${SC.qlen(o.id)} คน</span></div>${SC.S.sysOff ? ui.tag('ปิดระบบอยู่', 'danger', { icon: 'power' }) : stTag(od ? SC.S.intake[o.id] : 'closed')}</div>
        <div class="mt16">${ui.field({ id: 'clR', label: 'เหตุผล (บันทึกในระบบ ลูกค้าไม่เห็น)', select: ['ดูแลลูกค้าหน้าร้าน', 'เภสัชกรต้องออกจากร้าน', 'ระบบหรืออุปกรณ์มีปัญหา', 'อื่น ๆ'], req: true })}</div>
        <p class="small mt12">ถ้าแค่ไม่ว่างชั่วคราว ใช้ "พัก" แทน ลูกค้ารอต่อได้ ไม่เสียคิว</p>`,
      foot: `${ui.btn('พักแทน', { kind: 'ghost', a: 'intake', v: 'pause' })}${ui.btn('ยกเลิก', { kind: 'secondary', st: 'live' })}${ui.btn('ปิดรับเคส', { kind: 'danger', a: 'closeIntake', icon: 'ban' })}` });
  },
  mount(el, ctx) { if (['live', 'pause'].includes(ctx.st)) tick(el, ctx); },
  sims: ({ st }) => [
    ['live', 'pause', 'empty'].includes(st) && { label: 'ลูกค้าใหม่เข้าคิว', run: () => { if (SC.S.branch === 'tw' && !qk().includes('new1')) { SC.S.joined.new1 = SC.clockStr(); qk().push('new1'); } SC.go('queue', { st: 'live' }); SC.toast('มีลูกค้าเข้าคิวใหม่: กมล ศ. · ท้องเสีย', 'bell'); } },
    ['live', 'pause'].includes(st) && { label: 'ลูกค้ายกเลิกคิว', run: () => { const k = qk(); if (k.length) { const c = SC.CASES[k[k.length - 1]]; k.splice(k.length - 1, 1); SC.refresh(); SC.toast(`${SC.casePerson(c).name} ยกเลิกคิว`, 'x'); } } },
    ['live', 'pause'].includes(st) && { label: 'ผ่านไป 10 นาที (ดูป้ายรอนาน)', run: () => { SC.S.clk = SC.clk() + 10; SC.refresh(); SC.toast('ผ่านไป 10 นาที ลูกค้าที่รออยู่รอนานขึ้น', 'clock'); } },
    st === 'pause' && SC.S.pause?.until && { label: 'ครบเวลาพัก', run: () => { SC.S.pause.over = true; SC.refresh(); SC.toast('ครบเวลาพักแล้ว ลูกค้ายังรออยู่ กดเปิดรับเมื่อพร้อม', 'bell'); } },
    SC.unpaidRows().some(r => r.status === 'sent') && { label: 'ลูกค้าชำระรายการที่ปิดเคสไปแล้ว', run: () => { const rows = SC.unpaidRows().filter(x => x.status === 'sent'), r = rows.find(x => x.key !== 'wip') || rows[0]; const o = r.key === 'wip' ? wipOrder() : SC.S.orders[r.key]; o.status = 'paid'; o.paid = { recv: 'pickup', ship: 0, method: 'พร้อมเพย์', at: SC.clockStr() }; SC.refresh(); SC.toast(`${r.name} ชำระแล้ว ${SC.money(r.amt)} · รับที่ร้าน`, 'circle-check'); } }
  ]
});
SC.act('closeIntake', async t => {
  await SC.busy(t, 600);
  const S = SC.S; S.closedQ = qk().length; S.closedAt = SC.clockStr(); S.q[S.branch] = []; S.intake[S.branch] = 'closed';
  SC.go('queue', { st: 'closed' }); SC.toast('ปิดรับเคสแล้ว แจ้งลูกค้าในคิวพร้อมทางเลือกแล้ว', 'ban');
});

/* ---------- pickup at the counter: the customer shows the 4-character code ---------- */
/* the branch of an order = where its case was closed, else where it was accepted, else the queue it started in.
   The medicine sits at that branch, so only that branch hands it over (QA3-06) */
const HOME_Q = SC.fresh().q;
const orderBr = SC.orderBr = key => SC.S.orders[key]?.br || SC.S.closed.filter(x => x.key === key).pop()?.branch || SC.S.caseBr?.[key] || (key === 'wip' ? 'tw' : Object.keys(HOME_Q).find(b => HOME_Q[b].includes(key))) || 'tw';
/* owner 21/10/2026 ("เฟสนี้ผมของ่ายๆหน่อย ... ไม่อยากสร้างระบบมารองรับไว้จนหนัก"): the customer is reminded on day 15 and day 30.
   A pickup order still waiting more than 30 days after it was packed is only tagged: no automatic cancel or refund,
   the store calls the customer */
SC.PICK_DAYS = 30;
SC.PICK_CALL = 'โทรหาลูกค้า ตกลงเรื่องยาและการคืนเงินเอง';
const dayNo = d => { const [a, b, y] = String(d).split('/').map(Number); return Date.UTC(y, b - 1, a) / 864e5; };
SC.daysAgo = d => Math.round(dayNo(SC.NOW.date) - dayNo(d));
/* one record per order, read the same way by the box on the queue page and by "รับยาด้วยรหัส" (top bar, every screen) */
SC.pickRec = pickRec;
function pickRec(key) {
  const o = SC.S.orders[key], c = SC.CASES[key], branch = orderBr(key), here = branch === SC.S.branch;
  if (!o) return { key, branch, here, who: esc(WIP.name), name: WIP.name, no: WIP.no, items: null, amt: WIP.amt, status: 'sent', until: WIP.until, can: false };
  /* orders paid before the story (S404 seed) have no case: their record carries the name */
  const nm = c ? SC.casePerson(c).name : o.who || WIP.name;
  const readyD = o.ready ? o.readyD || SC.NOW.date : '', days = readyD ? SC.daysAgo(readyD) : 0;
  return { key, branch, here, who: c ? ui.who(c) : esc(nm), name: nm, no: o.no, items: o.items, amt: total(o), status: o.status, recv: o.paid?.recv, paidAt: o.paid?.at, ready: o.ready, readyD, days, over: o.status === 'paid' && o.paid?.recv === 'pickup' && !o.handed && days > SC.PICK_DAYS, handed: o.handed, until: key === 'wip' ? WIP.until : '16:20', can: here && o.status === 'paid' && o.paid?.recv === 'pickup' && !o.handed };
}
const deliver = key => { const o = SC.S.orders[key]; o.handed = SC.clockStr(); if (!o.ready) o.ready = o.handed; return o.handed; };
SC.act('pickupOv', t => {
  const key = t.dataset.v; SC.S.pkErr = false;
  SC.openOv(() => {
    const r = pickRec(key), err = SC.S.pkErr;
    return `<div class="scrim" data-a="ovClose"></div><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mdT">
      <div class="modal-h"><span class="brand-t">${ic('store', 24, 2)}</span><div class="grow"><h2 id="mdT">ลูกค้ามารับยา</h2><p>${esc(r.name)} · รายการ ${esc(r.no)}</p></div>${ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
      <div class="modal-b"><ul class="cl-meds">${(r.items || []).map(i => `<li><b>${esc(i.name)}</b> ${i.qty} ${esc(i.unit)}</li>`).join('')}</ul>
        <div class="mt16">${ui.field({ id: 'pkCode2', label: 'รหัสรับยาที่ลูกค้าแสดง (4 ตัว)', max: 4, req: true, focus: true, error: err === 'empty' ? 'ใส่รหัสรับยา 4 ตัวที่ลูกค้าแสดง' : err ? 'รหัสไม่ตรง ตรวจกับจอของลูกค้าอีกครั้ง' : '' })}</div>
        ${r.ready ? '' : `<div class="mt12">${ui.note('<b>ยังไม่ได้จัดยาและสแกนบาร์โค้ด</b><p>จัดยาให้ครบก่อน แล้วจึงส่งมอบ</p>', { tone: 'warn' })}</div>`}<p class="small mt8">ตรวจชื่อผู้รับให้ตรงกับเคสก่อนส่งมอบยา</p></div>
      <div class="modal-f">${ui.btn('ยกเลิก', { kind: 'secondary', a: 'ovClose' })}${r.ready ? ui.btn('ยืนยันส่งมอบยา', { a: 'pickupDone', v: key, icon: 'check' }) : ui.btn('จัดยา', { a: 'pcOpen', v: key, icon: 'scan-barcode' })}</div></div>`;
  });
});
SC.act('pickupDone', t => {
  const key = t.dataset.v, o = SC.S.orders[key], v = $('#pkCode2')?.value.trim().toUpperCase();
  if (!pickRec(key).can || !pickRec(key).ready) return;
  if (!v || v !== o.no.slice(-4)) { SC.S.pkErr = v ? 'bad' : 'empty'; SC.refresh(); return; }
  SC.S.pkErr = false; const at = deliver(key); SC.S.ov = null; SC.refresh();
  SC.toast(`บันทึกแล้ว ${pickRec(key).name} รับยาเรียบร้อย ${at}`, 'check');
});

/* "รับยาด้วยรหัส" (top-bar button on every screen): type the 4 characters, see name + medicines + paid status, hand over.
   Looks the code up among all orders, so it works for a customer of the case still open too. State lives in S.pc */
const PC_OK = ['sent', 'paid', 'expired', 'cancelled'];
function pcFind(code) {
  const v = code.trim().toUpperCase(); if (v.length < 4) return null;
  const hit = o => o.no && (o.no.slice(-4) === v || o.no === v), recs = [];
  Object.entries(SC.S.orders).forEach(([k, o]) => { if (o && PC_OK.includes(o.status) && hit(o)) recs.push(pickRec(k)); });
  if (!SC.S.orders.wip && hit(WIP)) recs.push(pickRec('wip'));
  return recs.find(r => r.can) || recs.find(r => r.here) || recs[0] || null;
}
function pcResHtml() {
  const pc = SC.S.pc || {}, r = pc.res;
  if (pc.err) return `<p class="err-t mt8" id="pcErr">${ic('circle-x', 14, 2)}<span>${esc(pc.err).replace(/0\d{1,2}-\d{3}-\d{4}/g, '<span class="nowrap">$&</span>')}</span></p>`;
  if (!r) return '<p class="small mt8">ลูกค้าเปิดแอปแล้วแตะ "รหัสรับยา" ที่หน้าแรก</p>';
  const unpk = r.can && !r.ready, over = r.can && r.over, tag = unpk ? ui.tag('ชำระแล้ว ยังไม่ได้จัดยา', 'warn', { icon: 'scan-barcode' }) : over ? ui.tag('เลยกำหนดรับ', 'warn', { icon: 'clock' }) : r.can ? ui.tag('ชำระแล้ว รับที่ร้าน', 'ok', { icon: 'circle-check' }) : r.handed ? ui.tag(`ส่งมอบแล้ว ${r.handed}`, 'ok', { icon: 'check' }) : r.status === 'sent' ? ui.tag('ยังไม่ชำระ', 'warn', { icon: 'clock' })
    : r.status === 'paid' ? ui.tag('ชำระแล้ว ไม่ได้รับที่ร้าน', 'muted', { icon: 'truck' }) : ui.tag(r.status === 'expired' ? 'หมดเวลา' : 'ยกเลิกแล้ว', 'muted', { icon: 'x' });
  const why = unpk ? 'ยังไม่ได้จัดยาและสแกนบาร์โค้ด ส่งมอบไม่ได้ กด "จัดยา" สแกนให้ครบก่อน แล้วค้นรหัสอีกครั้ง' : r.can ? '' : r.handed ? 'รายการนี้ส่งมอบแล้ว ไม่ต้องส่งมอบซ้ำ ถ้าลูกค้ายืนยันว่ายังไม่ได้รับยา ให้ตรวจกับเภสัชกรประจำวัน'
    : r.status === 'sent' ? `ส่งมอบยาไม่ได้จนกว่าลูกค้าจะชำระ (ชำระได้ถึง ${r.until}) ให้ลูกค้าชำระในแอปก่อน แล้วค้นรหัสอีกครั้ง`
    : r.status === 'paid' ? 'รายการนี้จัดส่งให้ลูกค้า ไม่ได้ให้มารับที่ร้าน ตรวจกับลูกค้าว่าเป็นรายการอื่นหรือไม่'
    : 'รายการนี้ใช้ไม่ได้แล้ว ส่งมอบยาไม่ได้ ให้เภสัชกรออกรายการใหม่ในแอป';
  return `<div class="pc-card${r.can && !unpk ? '' : ' no'} mt12"><div class="hrow wrap"><b>${r.who}</b><span class="sp"></span>${tag}</div>
    <p class="small mt4">รายการ <span class="mono">${esc(r.no)}</span> · ${SC.money(r.amt)}</p>
    ${r.items ? `<ul class="cl-meds">${r.items.map(i => `<li><b>${esc(i.name)}</b> ${i.qty} ${esc(i.unit)}</li>`).join('')}</ul>` : ''}
    ${over ? `<p class="mt8">แจ้งยาพร้อมรับ ${esc(r.readyD)} · ค้างรับ ${r.days} วัน · ${esc(SC.PICK_CALL)}</p><div class="btn-row mt8">${ui.btn('ดูเบอร์', { kind: 'secondary', sm: true, a: 'pkTel', v: r.key, icon: 'phone' })}</div>` : ''}
    ${why ? `<p class="mt8">${esc(why)}</p>` : '<p class="small mt8">ตรวจชื่อผู้รับให้ตรงกับรายการก่อนส่งมอบยา</p>'}</div>`;
}
function pcFootHtml() {
  const r = (SC.S.pc || {}).res, cancel = ui.btn('ยกเลิก', { kind: 'secondary', a: 'ovClose' });
  if (r && r.can && !r.ready) return `${cancel}${ui.btn('จัดยา', { a: 'pcOpen', v: r.key, icon: 'scan-barcode' })}`;
  if (r) return `${cancel}${ui.btn('ส่งมอบยา', { a: 'pcDeliver', v: r.key, icon: 'check', disabled: !r.can, title: r.can ? '' : 'ส่งมอบไม่ได้ ดูเหตุผลด้านบน' })}`;
  return `${cancel}${ui.btn('ตรวจรหัส', { a: 'pcCheck', icon: 'search' })}`;
}
const pcModal = () => {
  const pc = SC.S.pc || {};
  return `<div class="scrim" data-a="ovClose"></div><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mdT">
    <div class="modal-h"><span class="brand-t">${ic('store', 24, 2)}</span><div class="grow"><h2 id="mdT">รับยาด้วยรหัส</h2><p>ลูกค้ามารับยาที่ร้าน · ไม่ต้องออกจากห้องที่คุยอยู่</p></div>${ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
    <div class="modal-b">${ui.field({ id: 'pcCode', label: 'รหัสรับยา 4 ตัวที่ลูกค้าแสดง', max: 11, req: true, ph: 'เช่น K7P2', focus: true, value: pc.code || '', ac: 'off', cls: 'pc-fld' + (pc.err ? ' err' : '') })}<div id="pcRes" aria-live="polite">${pcResHtml()}</div></div>
    <div class="modal-f" id="pcFoot">${pcFootHtml()}</div></div>`;
};
/* the result and the buttons are repainted in place, so the box keeps its focus and caret while the code is typed */
function pcPaint() {
  const a = $('#pcRes'), b = $('#pcFoot'), i = $('#pcCode'), pc = SC.S.pc || {};
  if (a) a.innerHTML = pcResHtml();
  if (b) b.innerHTML = pcFootHtml();
  if (i) { i.closest('.field').classList.toggle('err', !!pc.err); i.setAttribute('aria-invalid', pc.err ? 'true' : 'false'); }
}
function pcLook() {
  const pc = SC.S.pc || (SC.S.pc = {}), v = (pc.code || '').trim();
  if (v.length < 4) { pc.res = null; pc.err = 'ใส่รหัสรับยา 4 ตัวที่ลูกค้าแสดง'; }
  else {
    const r = pcFind(v), b = r && !r.here && SC.branch(r.branch);
    /* another branch's order: say where it belongs and what to tell the customer; its name and medicines stay hidden */
    pc.res = b ? null : r;
    pc.err = b ? `รายการนี้เป็นของ${b.name} ส่งมอบยาที่สาขานั้น แจ้งลูกค้าให้ไปรับที่${b.name} (โทร ${b.phone})` : r ? '' : `ไม่พบรหัส ${v} ตรวจรหัสกับจอของลูกค้าอีกครั้ง ถ้ายังไม่พบ ให้ลูกค้าเปิดแอปแล้วแตะ "รหัสรับยา" ที่หน้าแรก`;
  }
  pcPaint();
}
SC.act('pickCode', () => {
  /* opening a dialog draws the screen again: keep a half-typed chat message (the room reads its composer back from S.prefill) */
  const m = $('#msgIn'), k = $('#thread')?.dataset.k;
  if (m && k) { if (m.value.trim()) SC.S.prefill[k] = m.value; else delete SC.S.prefill[k]; }
  SC.S.pc = { code: '', res: null, err: '' }; SC.openOv(pcModal);
});
SC.act('pcCheck', () => pcLook());
SC.act('pkTel', t => {
  const k = t.dataset.v, c = SC.CASES[k], o = SC.S.orders[k], hint = 'ระบบไม่ยกเลิกบิลและไม่คืนเงินให้เอง · ถ้าตกลงคืนเงิน เภสัชกรหรือผู้ดูแลระบบเป็นคนทำ';
  if (c) return SC.casePhone(c, { hint });
  SC.phoneShow({ name: o.who || '', phone: o.tel || '08x-xxx-3108', id: o.no, callee: 'ลูกค้า', hint });
});
SC.act('pcDeliver', async t => {
  const key = t.dataset.v; if (!pickRec(key).can || !pickRec(key).ready) return;
  await SC.busy(t, 450);
  const at = deliver(key); SC.S.ov = null; SC.S.pc = null; SC.refresh();
  SC.toast(`บันทึกแล้ว ${pickRec(key).name} รับยาเรียบร้อย ${at}`, 'check');
});
document.addEventListener('input', e => {
  if (e.target.id !== 'pcCode') return;
  const el = e.target, v = el.value.toUpperCase().replace(/\s/g, ''), pc = SC.S.pc || (SC.S.pc = {});
  if (el.value !== v) el.value = v;
  pc.code = v;
  if (v.length === 4 || v.length === 11) pcLook(); else if (pc.res || pc.err) { pc.res = null; pc.err = ''; pcPaint(); }
});
document.addEventListener('keydown', e => {
  if (e.target.id !== 'pcCode' || e.key !== 'Enter') return;
  e.preventDefault();
  const pc = SC.S.pc || {};
  if (pc.res?.can) $('#pcFoot [data-a="pcDeliver"]')?.focus(); else pcLook();
});

/* ---------- S202 case preview (drawer over the board) ---------- */
const caseOf = ctx => SC.CASES[ctx.p.k] || SC.CASES[{ family: 'kid', urgent: 'ort', decline: 'ort' }[ctx.st] || 'smj'];
function preview(c) {
  const p = SC.casePerson(c), fam = SC.isFam(c);
  return `${c.urgent.length ? `<div class="pv-urg" role="alert">${ic('octagon-alert', 20, 2)}<div><b>ลูกค้าแจ้งอาการอันตราย: ${esc(c.urgent.join(', '))}</b><p>แอปแนะนำให้ไปโรงพยาบาลหรือโทร 1669 แล้ว แต่ลูกค้ายังเข้าคิว · โทรหาลูกค้าเพื่อประเมินก่อนได้ · ถ้าไม่เหมาะกับการปรึกษาผ่านแอป กด "ไม่รับเคส" แล้วแนะนำโรงพยาบาล</p></div></div>` : ''}
    ${(() => { const pend = SC.pendingFor(c); return pend.length ? `<div class="pt-pend pv-pend" role="status"><p class="label">${ic('triangle-alert', 13, 2.2)} มีเรื่องค้างของคนนี้</p>${pend.map(x => `<button type="button" class="pt-pi" data-go="${x.go}" data-st="${x.st}">${ic(x.icon, 15, 2)}<span>${esc(x.text)}</span></button>`).join('')}</div>` : ''; })()}
    <section class="pv-sec"><h3 class="label">ผู้มีอาการ</h3>
      <div class="hrow mt8">${ui.av(fam ? p.first.slice(0, 2) : p.name.slice(0, 2), { size: 'lg' })}<div class="grow"><b class="pv-n">${esc(p.name)}</b><p class="small">${esc(p.rel)} · ${p.age} ปี${p.weight ? ` · ${p.weight} กก.` : ' · ไม่ได้ระบุน้ำหนัก'}${fam ? ` · ปรึกษาผ่านบัญชี ${esc(c.acct)}` : ''}</p></div></div>
      ${fam ? `<p class="small mt8">${ic('shield-check', 13, 2)} ผู้ปกครองยืนยันว่าเป็นผู้ดูแลและข้อมูลถูกต้อง (บันทึกตอนเพิ่มสมาชิกในบ้าน)</p>` : ''}</section>
    <section class="pv-sec"><h3 class="label">อาการที่แจ้ง</h3><div class="chips mt8">${c.symptoms.map(s => `<span class="chip static">${esc(s)}</span>`).join('')}${c.urgent.map(s => `<span class="chip static urg">${ic('octagon-alert', 13, 2)}${esc(s)}</span>`).join('')}</div>
      ${c.note ? `<p class="mt8">"${esc(c.note)}"</p>` : ''}<p class="small mt8">${c.photos ? `แนบรูป ${c.photos} รูป` : 'ไม่ได้แนบรูป'} · ขอคุยทาง${ui.modeName(c.mode)}</p></section>
    ${SC.pvHealth(c)}
    <p class="small mt16">${ic('lock', 13, 2)} ลูกค้ายินยอมให้ใช้ข้อมูลสุขภาพเพื่อการปรึกษาแล้ว · การเปิดดูเคสถูกบันทึก</p>
    <p class="small mt4 pv-ack">${ic('clipboard-check', 13, 2)} ${esc(SC.ackTxt(c))}</p>`;
}
const ADM_NO = 'ผู้ดูแลระบบรับเคสไม่ได้';
const drawer = (c, ctx) => {
  const S = SC.S, urg = c.urgent.length, off = S.sysOff, video = ui.isVideo(c.mode);
  const adm = SC.isAdmin(), d = SC.duty(), called = S.urgCalled?.[c.key];
  /* this pharmacist already has an open case: accept is grey from the start (the S202.6 dialog is only for "someone took a case at the same moment") */
  const open = S.activeCase && S.activeCase !== c.key && ctx.st !== 'busy' ? SC.CASES[S.activeCase] : null;
  const accept = ui.btn(`รับเคส · ${ui.modeName(c.mode)}`, { a: 'accept', v: c.key, icon: ui.modeIcon(c.mode), lg: true, kind: urg ? 'secondary' : video ? 'acc-video' : 'primary', cls: urg && video ? 'vid-l' : '', disabled: off || adm || !!open, title: off ? 'ปิดระบบอยู่ รับเคสได้เมื่อเปิดระบบ' : adm ? ADM_NO : open ? `ปิดเคสของ ${SC.casePerson(open).name} ก่อน` : '' });
  const acc = open && !off && !adm ? `<div class="acc-grp">${accept}<p class="small acc-why">ปิดเคสของ ${esc(SC.casePerson(open).name)} ก่อน</p>${ui.btn('ไปที่เคสที่เปิดอยู่', { kind: 'secondary', go: 'room', st: 'talk', p: { k: open.key }, icon: 'arrow-right' })}</div>` : accept;
  const foot = urg
    ? `${SC.isAdmin() ? '' : ui.btn('ดูเบอร์ลูกค้า', { kind: 'danger', a: 'callCust', v: c.key, icon: 'phone', lg: true })}${acc}<span class="sp"></span>${ui.btn('ไม่รับเคส แนะนำโรงพยาบาล', { kind: 'danger-line', st: 'decline', p: { k: c.key }, icon: 'ban', lg: true, disabled: adm, title: adm ? ADM_NO : '' })}`
    : `${acc}${ui.btn('ย้ายสาขา', { kind: 'secondary', st: 'move', p: { k: c.key }, icon: 'arrow-right-left', disabled: off })}<span class="sp"></span>${ui.btn('ไม่รับเคส', { kind: 'danger-line', st: 'decline', p: { k: c.key }, icon: 'ban', disabled: adm, title: adm ? ADM_NO : '' })}`;
  const notes = `${off ? `<p class="small danger-t pv-off">${ic('power', 13, 2)} ปิดระบบอยู่ ดูเคสได้ รับเคสได้เมื่อเปิดระบบอีกครั้ง</p>` : adm ? `<p class="small pv-off">${ic('lock', 13, 2)} ผู้ดูแลระบบดูเคสได้ รับหรือไม่รับเคสได้เฉพาะเภสัชกรประจำวันของสาขา${d ? ` (${esc(d.short)})` : ''}</p>` : ''}${urg && called ? `<p class="small ok-t pv-off">${ic('phone-call', 13, 2)} โทรแล้ว ${esc(called.at)} โดย ${esc((SC.PHARM[called.by] || SC.me()).short)}</p>` : ''}`;
  return ui.drawer({ back: 'board', title: SC.casePerson(c).name, sub: `เคส ${SC.caseCode(c)} · เข้าคิว ${SC.S.joined?.[c.key] || c.joined} · รอ ${Math.floor(SC.waitS(c) / 60)} นาที`,
    head: `<div class="pv-hd">${ui.urgent(c)}${ui.mode(c.mode, { lg: true })}</div>`, body: preview(c),
    foot: `<div class="pv-foot">${notes}${foot}</div>` });
};
/* decline: the reason fills a message about this case; the pharmacist edits before sending */
const DR = [['doctor', 'อาการควรได้รับการตรวจจากแพทย์'], ['er', 'อาการอันตราย ควรไปโรงพยาบาลทันที'], ['store', 'ข้อมูลไม่พอ ต้องให้มาที่ร้าน'], ['other', 'อื่น ๆ']];
const drMsg = (v, c) => {
  const sy = (c.urgent.length ? c.urgent : c.symptoms).join(' '), b = SC.branch();
  return SC.say(v === 'doctor' ? `จากอาการที่แจ้ง (${sy}) ควรให้แพทย์ตรวจร่างกาย แนะนำไปคลินิกหรือโรงพยาบาลใกล้บ้านค่ะ ถ้าอาการแย่ลงไปโรงพยาบาลได้ทันที`
    : v === 'er' ? `อาการที่แจ้ง (${sy}) ควรไปโรงพยาบาลทันทีค่ะ ถ้ามีอาการรุนแรงขึ้น โทร 1669 ได้เลย`
    : v === 'store' ? `ขอดูอาการเพิ่มเพื่อแนะนำยาให้ถูกต้อง เชิญที่${b.name} เปิด ${b.hours} หรือโทร ${b.phone} ค่ะ` : '');
};
SC.screen('preview', {
  code: 'S202', group: 2, title: 'ดูเคสก่อนรับ', nav: 'queue',
  states: [['normal', 'เคสปกติ', { back: 'board', cust: [['queue', 'q1', 'ลูกค้ายังเห็นคิวถัดไป จนกว่าจะกดรับ']] }],
    ['family', 'ปรึกษาให้ลูก', { back: 'board', cust: [['intake', 'kid', 'ลูกค้าเลือกถามแทนลูก'], ['queue', 'q1']] }],
    ['urgent', 'ธงด่วน', { back: 'board', cust: [['queue', 'urgent', 'กล่องแดง 1669 ในหน้ารอคิว'], ['redflag', '', 'ลูกค้าเห็นตอนกดเข้าคิว']] }],
    ['decline', 'ไม่รับเคส: เลือกเหตุผล', { back: cur => drawerSt(caseOf(cur)), cust: [['declined', '', 'ลูกค้าเห็นข้อความนี้ พร้อมชื่อและเลขใบอนุญาต']] }],
    ['move', 'ย้ายไปสาขาอื่น', { back: cur => drawerSt(caseOf(cur)), cust: [['room', 'moved', 'ลูกค้าเห็นข้อความในแชท 1 บรรทัด ย้ายไปสาขาไหน ใครดูแลต่อ (C303.10)'], ['branch', 'normal']] }],
    ['busy', 'รับเคสซ้อนไม่ได้', { back: cur => drawerSt(caseOf(cur)), cust: [['queue', 'q1', 'ลูกค้ายังรอในคิว ไม่หาย']] }]],
  notes: ['เคาะแล้ว 20/10 ข้อ 69 (เจ้าของ: "ใช่ให้ย้ายได้แล้วแจ้งลูกค้าด้วย"): ย้ายเคสได้ และลูกค้าเห็นข้อความในแชท 1 บรรทัด "ย้ายการปรึกษาไปสาขา... เภสัชกร... ดูแลต่อ" เพราะที่รับยาเปลี่ยน', 'เจ้าของ 20/10: "202 อยากดูรายการบันทึกเกี่ยวกับโรคได้มากกว่านี้ กด hover เปิดรายละเอียดได้ รวมถึง รายการซื้อย้อนหลัง อาจจะ 3-5 ครั้งล่าสุดไม่ให้มันรกเกินไป" · เพิ่มโรคประจำตัวและแพ้อาหาร · อาการครั้งก่อน 5 ครั้งล่าสุด กดแล้วเห็นบันทึกของเภสัชกร (อาการ เป็นมา ยาที่ใช้อยู่ โน้ต ผล) · ซื้อย้อนหลัง 5 ครั้งล่าสุดทุกช่องทาง กดแล้วเห็นรายการยา',
    'เจ้าของ 21/10: "s202 ถ้ากดลูกศรลงถึงเปิดรายการ ถ้าแค่เอาเม้าลากผ่านแล้วโชว์รายการเลยมันบัง" · แถวอาการครั้งก่อนและซื้อย้อนหลังเปิดรายละเอียดเมื่อกดเท่านั้น (ลูกศรหมุนขึ้นตอนเปิด) กดซ้ำหรือกด Esc ปิด (Esc ครั้งแรกปิดแค่รายละเอียด ยังอยู่ในแผงเดิม · Esc อีกครั้งถอยออกตามปกติ) · ชี้เมาส์ผ่านแค่เปลี่ยนสีแถว ไม่เปิด', 'เจ้าของ 20/10: "เอาปุ่มโทรออกดีกว่า ใช้งาน pc โทรออกไม่ได้ แต่ให้เด้งเป็นเบอร์โทรขึ้นแทน" (S201) · "s203 แก้เรื่องปุ่มโทรเช่นกัน" · ทุกปุ่มโทรในคอนโซลเปลี่ยนเป็น "ดูเบอร์" เด้งเบอร์เต็มให้โทรจากโทรศัพท์ร้าน มีปุ่มคัดลอกเบอร์ · บอร์ดและการ์ดยังซ่อนเบอร์ · ทุกการเปิดดูเบอร์ถูกบันทึก (ชื่อ เวลา)', 'เคาะแล้ว 20/10: สาขาละ 1 เคสพร้อมกัน เภสัชกรรับทีละเคส (เจ้าของ: "ใช่ทีละเคส")', 'เปิดดูก่อนรับ: ผู้มีอาการ (ตัวเองหรือคนในบ้าน) อาการ ธงด่วน แพ้ยา ยาประจำ ประวัติปรึกษา', 'ป้ายช่องทางหัวแผงใหญ่กว่าในแถว · ปุ่มรับเคสเขียนช่องทางเสมอ: "รับเคส · แชท" ทะเลทึบ / "รับเคส · วิดีโอคอล" ครามทึบ (เคาะแล้ว 20/10 ข้อ 61)', 'เคสธงด่วน: ปุ่ม "โทรหาลูกค้า" เด่นสุด (หลังโทรขึ้น "โทรแล้ว เวลา โดยใคร") ปุ่มรับเคสเป็นเส้นขอบแต่ยังมีไอคอนและคำตามช่องทาง เหตุผลเริ่มที่ "อาการอันตราย"', 'ไม่รับเคส: ทำกับเคสที่เปิดดูอยู่เท่านั้น ข้อความเติมตามเหตุผลและอาการของเคสนั้น แก้ได้ก่อนส่ง', 'ย้ายสาขา: ข้อมูลอาการย้ายไปด้วย ลูกค้าไม่ต้องกรอกใหม่ · ต้องใส่เหตุผล (ห้องรีวิว อย. B13) บันทึกในประวัติเคส S403 และบันทึกการเข้าถึง S504 เรื่อง "ย้ายสาขา"', 'สาขาหนึ่งรับได้ครั้งละ 1 เคส: มีเคสเปิดอยู่แล้ว ปุ่มรับเคสเป็นสีเทาตั้งแต่แรก พร้อมบอก "ปิดเคสของ ... ก่อน" และปุ่มไปที่เคสนั้น · หน้าต่าง S202.6 ใช้เฉพาะตอนมีคนรับเคสอื่นไปพร้อมกัน', 'ปิดระบบอยู่: ดูเคสได้ แต่ปุ่มรับเคสกดไม่ได้', 'ข้อความในหน้าต่างของเคส C606 ฝั่งลูกค้า ยังเป็นหัวเรื่องเดียวทุกเหตุผล (เรื่องของแอปลูกค้า)'],
  head: () => ({ title: 'คิวปรึกษา', sub: `${SC.branch().name} · ดูเคสก่อนรับ` }),
  prep(S, st, p) {
    if (S._reseed && st === 'busy') { S.activeCase = 'psr'; S.q.tw = ['smj', 'ort']; }
    if (!p.k) p.k = caseOf({ p, st }).key;
  },
  render: ctx => board(ctx.S, ctx.S.intake[ctx.S.branch] === 'pause' ? 'pause' : 'live'),
  overlay(ctx) {
    const c = caseOf(ctx), st = ctx.st, p = SC.casePerson(c);
    const base = drawer(c, ctx), back = drawerSt(c);
    if (st === 'decline') {
      const pre = c.urgent.length ? 'er' : '';
      return base + ui.modal({ title: 'ไม่รับเคสนี้', sub: `${p.name} · เคส ${SC.caseCode(c)}`, icon: 'ban', tone: 'danger', back,
        body: `<p class="label">เหตุผล (บันทึกในประวัติเคส)</p><div class="opts mt8" data-radio-scope id="drOpts">${DR.map(([v, l]) => ui.opt({ group: 'dr', v, title: l, on: v === pre, a: 'drPick' })).join('')}</div>
          <p class="err-t mt8" id="drErr" hidden>${ic('circle-x', 14, 2)}<span>เลือกเหตุผลก่อน</span></p>
          <div class="dr-ref mt16" id="drRef"${['doctor', 'er'].includes(pre) ? '' : ' hidden'}><p class="label">ส่งต่อสถานพยาบาล (บันทึกในประวัติเคส)</p>
            <div class="mt8">${ui.field({ id: 'drTo', label: 'ส่งต่อไปที่', value: 'โรงพยาบาลใกล้บ้าน', req: true, max: 80 })}</div>
            <div class="field mt8" id="drUBox"><span class="f-l">ความเร่ง<span class="req" aria-hidden="true">*</span></span><div class="mt4">${ui.seg(SC.REF_U, pre === 'er' ? 'now' : '', { a: 'drU', label: 'ความเร่ง' })}</div><p class="err-t" id="drUErr" hidden>${ic('circle-x', 14, 2)}<span>เลือกความเร่ง</span></p></div></div>
          <div class="mt16">${ui.field({ id: 'drMsg', label: 'ข้อความถึงลูกค้า (ลูกค้าเห็น)', textarea: true, rows: 3, req: true, value: pre ? drMsg(pre, c) : '', ph: 'เลือกเหตุผลแล้วระบบเติมให้ แก้ได้ก่อนส่ง' })}</div>
          <p class="small mt8">ลูกค้าเห็นข้อความนี้พร้อมชื่อและเลขใบอนุญาตของคุณ ปุ่มดูโรงพยาบาลใกล้ฉัน และเบอร์ร้าน</p>`,
        foot: `${ui.btn('กลับ', { kind: 'secondary', st: back, p: { k: c.key } })}${ui.btn('ยืนยันไม่รับเคส', { kind: 'danger', a: 'decline', v: c.key, icon: 'ban', disabled: SC.isAdmin(), title: SC.isAdmin() ? ADM_NO : '' })}` });
    }
    if (st === 'move') {
      const o = branchOther(), v = SC.duty(o.id) ? SC.S.intake[o.id] : 'closed', can = !SC.S.sysOff && v !== 'closed';
      return base + ui.modal({ title: 'ย้ายเคสไปสาขาอื่น', sub: `${p.name} · เคส ${SC.caseCode(c)}`, icon: 'arrow-right-left', back,
        body: `<div class="opts" data-radio-scope>${ui.opt({ group: 'mv', v: o.id, title: o.name, sub: `${v === 'open' ? 'เปิดรับ' : v === 'pause' ? 'พักชั่วคราว รอได้' : 'ปิดรับวันนี้ ย้ายไม่ได้'} · รอ ${SC.qlen(o.id)} คน · ${SC.duty(o.id)?.short || 'ไม่มีเภสัชกรประจำ'}`, on: can, disabled: !can })}</div>
          <div class="mt16">${ui.field({ id: 'mvWhy', label: 'เหตุผล (บันทึกในระบบ)', req: true, max: 120, ph: 'เช่น ลูกค้าอยากรับยาที่' + o.short })}</div>
          <p class="small mt8">ข้อมูลอาการย้ายไปด้วย ลูกค้าไม่ต้องกรอกใหม่ · ลำดับคิวที่สาขาใหม่นับต่อท้าย</p>
          <div class="mt12">${ui.note(`<b>ลูกค้าเห็นในแชท</b><p>"${esc(SC.moveMsg(o))}"</p>`, { icon: 'message-circle' })}</div>`,
        foot: `${ui.btn('ยกเลิก', { kind: 'secondary', st: back, p: { k: c.key } })}${ui.btn('ย้ายเคส', { a: 'moveCase', v: c.key, icon: 'arrow-right-left', disabled: !can })}` });
    }
    if (st === 'busy') {
      const ac = SC.CASES[SC.S.activeCase] || SC.CASES.psr;
      return base + ui.modal({ title: 'รับเคสนี้ไม่ได้ตอนนี้', icon: 'triangle-alert', tone: 'warn', back,
        body: `<p>ระหว่างที่คุณเปิดดูเคสนี้ ${esc(SC.branch().name)}เพิ่งรับเคส <b class="mono">${esc(SC.caseCode(ac))}</b> (${esc(SC.casePerson(ac).name)}) ไป · สาขารับได้ครั้งละ 1 เคส</p><p class="mt8">ปิดเคสนั้นก่อน แล้วกลับมารับได้ทันที ไม่ต้องรอลูกค้าชำระเงิน · ${esc(p.name)} ยังรอในคิว ไม่หาย</p>`,
        foot: `${ui.btn('กลับไปหน้าคิว', { kind: 'secondary', go: 'queue', st: 'live' })}${ui.btn('ไปที่เคสที่เปิดอยู่', { go: 'room', st: 'talk', p: { k: ac.key }, icon: 'arrow-right' })}` });
    }
    return base;
  },
  sims: ctx => [
    { label: 'ลูกค้ายกเลิกคิวระหว่างเปิดดู', run: () => { const c = caseOf(SC.cur()); SC.S.q[SC.S.branch] = qk().filter(k => k !== c.key); SC.go('queue', { st: 'live' }); SC.toast(`${SC.casePerson(c).name} ยกเลิกคิวแล้ว`, 'x'); } },
    !SC.S.activeCase && ctx.st !== 'busy' && { label: 'เพื่อนร่วมร้านรับเคสอื่นไปพร้อมกัน', run: () => { const c = caseOf(SC.cur()), k = c.key === 'psr' ? 'smj' : 'psr'; SC.S.activeCase = k; SC.toast(`จำลอง: มีคนรับเคสของ ${SC.casePerson(SC.CASES[k]).name} ไปแล้ว กดรับเคสนี้เพื่อดูข้อความ`, 'users'); } }
  ]
});
SC.act('closeOvBoard', () => SC.go('queue', { st: 'live' }));
const _close = SC.ACTS.closeOv;
SC.act('closeOv', t => (t.dataset.v === 'board' ? SC.ACTS.closeOvBoard() : _close(t)));
SC.act('drPick', t => {
  const c = SC.CASES[$('[data-a="decline"]')?.dataset.v] || caseOf(SC.cur()), m = $('#drMsg'); if (!m) return;
  if (!m.dataset.dirty) m.value = drMsg(t.dataset.v, c);
  $('#drErr').hidden = true; m.closest('.field').classList.remove('err');
  const ref = ['doctor', 'er'].includes(t.dataset.v), box = $('#drRef');
  if (box) { box.hidden = !ref; if (t.dataset.v === 'er' && !$('#drRef [data-a="drU"][aria-pressed="true"]')) $('#drRef [data-a="drU"][data-v="now"]')?.setAttribute('aria-pressed', 'true'); }
});
document.addEventListener('input', e => { if (e.target.id === 'drMsg') e.target.dataset.dirty = e.target.value ? '1' : ''; });
SC.act('drU', t => { t.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === t))); $('#drUErr').hidden = true; $('#drUBox').classList.remove('err'); });
/* the call is recorded so the top-bar strip can say who called and when ("โทรแล้ว 14:20 โดย ภญ.ขวัญใจ") */
SC.act('callCust', t => {
  const key = t.dataset.v, c = SC.CASES[key];
  SC.casePhone(c, { tone: 'danger', hint: `แจ้งว่า "${c.urgent.join(', ')}" · ประเมินว่าต้องไปโรงพยาบาลไหม`, done: { label: 'โทรแล้ว', icon: 'phone-call', run: () => {
    SC.S.urgCalled = { ...(SC.S.urgCalled || {}), [key]: { at: SC.clockStr(), by: SC.S.me } };
    SC.refresh(); SC.toast(`บันทึกแล้ว: โทรหา ${SC.casePerson(c).name} ${SC.clockStr()}`, 'phone-call');
  } } });
});
SC.act('accept', async t => {
  const S = SC.S, c = SC.CASES[t.dataset.v] || caseOf(SC.cur());
  if (S.sysOff) return SC.toast('ปิดระบบอยู่ รับเคสได้เมื่อเปิดระบบอีกครั้ง', 'power');
  if (SC.isAdmin()) return SC.toast('ผู้ดูแลระบบรับเคสไม่ได้ ให้เภสัชกรประจำวันของสาขารับ', 'lock');
  if (S.activeCase && S.activeCase !== c.key) return SC.go('preview', { st: 'busy', p: { k: c.key } });
  await SC.busy(t, 650);
  SC.logEv('take', 'รับเคส', c.id);
  S.q[S.branch] = qk().filter(k => SC.CASES[k].id !== c.id);
  S.activeCase = c.key; S.accT = Date.now(); S.accAt = SC.clockStr(); S.caseBr = { ...(S.caseBr || {}), [c.key]: S.branch };
  SC.seedChat('start', c.key);
  SC.go(c.mode === 'video' ? 'video' : 'room', { st: c.mode === 'video' ? 'on' : 'start', p: { k: c.key } });
  SC.toast(`รับเคสของ ${SC.casePerson(c).name} แล้ว ลูกค้าได้รับแจ้งเตือน`, 'check');
});
SC.act('decline', async t => {
  const S = SC.S, c = SC.CASES[t.dataset.v], r = $('[data-radio="dr"][aria-checked="true"]'), m = $('#drMsg');
  if (SC.isAdmin()) return SC.toast('ผู้ดูแลระบบรับเคสไม่ได้ การไม่รับเคสต้องทำโดยเภสัชกรประจำวันของสาขา', 'lock');
  if (!r) { $('#drErr').hidden = false; $('#drOpts').classList.add('err'); return; }
  if (!m.value.trim()) { m.closest('.field').classList.add('err'); m.focus(); return; }
  if (SC.dxHits(m.value).length) { SC.toast(`ข้อความมีคำที่เป็นชื่อโรค: ${SC.dxHits(m.value).join(', ')} · แก้ก่อนส่ง`, 'info'); m.focus(); return; }
  const refd = ['doctor', 'er'].includes(r.dataset.v), to = $('#drTo'), u = $('#drRef [data-a="drU"][aria-pressed="true"]');
  if (refd && !to.value.trim()) { to.closest('.field').classList.add('err'); to.focus(); SC.toast('ใส่ชื่อสถานพยาบาลที่แนะนำ หรือ "โรงพยาบาลใกล้บ้าน"', 'info'); return; }
  if (refd && !u) { $('#drUErr').hidden = false; $('#drUBox').classList.add('err'); return; }
  await SC.busy(t, 600);
  S.q[S.branch] = qk().filter(k => k !== c.key);
  S.closed.push({ key: c.key, id: c.id, who: SC.casePerson(c).name, topic: c.symptoms.join(' '), mode: c.mode === 'video' ? 'วิดีโอ' : 'แชท', t: SC.NOW.time, dur: '1 นาที', res: r.dataset.v === 'er' ? 'ไม่รับเคส แนะนำโรงพยาบาล' : 'ไม่รับเคส · ' + DR.find(x => x[0] === r.dataset.v)[1], tone: 'danger', branch: S.branch, ph: S.me, ref: refd ? { to: to.value.trim(), why: DR.find(x => x[0] === r.dataset.v)[1], u: u.dataset.v } : null });
  SC.go('queue', { st: 'live' }); SC.toast(`ไม่รับเคสของ ${SC.casePerson(c).name} แล้ว ลูกค้าได้รับข้อความของคุณ`, 'ban');
});
/* item 69 (owner 20/10 "ใช่ให้ย้ายได้แล้วแจ้งลูกค้าด้วย"): one line in the customer's chat, because where they get
   the medicine changes */
SC.moveMsg = o => { const d = SC.duty(o.id); return `ย้ายการปรึกษาไป${o.name}แล้ว${d ? ` ${d.short} ดูแลต่อ` : ''} · ถ้าซื้อยา รับยาหรือส่งจาก${o.name}`; };
SC.act('moveCase', async t => {
  const S = SC.S, c = SC.CASES[t.dataset.v], o = branchOther(), w = $('#mvWhy');
  /* B13 (FDA review 20/10): every move needs a reason, kept in the case record and the access log */
  if (!w.value.trim()) { w.closest('.field').classList.add('err'); w.focus(); return SC.toast('ใส่เหตุผลที่ย้ายเคสก่อน', 'info'); }
  const why = w.value.trim(), from = SC.branch(S.branch).name;
  await SC.busy(t, 600);
  S.q[S.branch] = qk().filter(x => x !== c.key); qk(o.id).push(c.key);
  S.moved = { ...(S.moved || {}), [c.key]: { from: S.branch, to: o.id, by: SC.me().short, at: SC.clockStr(), msg: SC.moveMsg(o), why } };
  SC.logEv('move', `ย้ายเคสจาก${from}ไป${o.name} · ${why}`, c.id);
  SC.go('queue', { st: 'live' }); SC.toast(`ย้ายเคสของ ${SC.casePerson(c).name} ไป${o.name}แล้ว · ลูกค้าเห็นข้อความในแชท`, 'arrow-right-left');
});

/* ---------- S203 questions left outside opening hours ---------- */
const NIGHT = (k, o) => (SC.CASES[k] = { key: k, mode: 'chat', photos: 0, note: '', urgent: [], member: '', ...o });
NIGHT('nmal', { id: 'TC-261017-0151', acct: 'มาลัย ร.', af: 'มาลัย', who: null, person: { name: 'น้องภูมิ', first: 'ภูมิ', rel: 'ลูก', age: 4, weight: 16, phone: '08x-xxx-7731', allergies: [], allergyState: 'unknown', meds: [], child: true }, symptoms: ['ปากบวม หน้าบวมหลังใช้ยา'], urgent: ['ปากบวม หน้าบวมหลังใช้ยา'], joined: '22:15',
  night: { q: 'น้องกินยาแก้ไอแล้วปากบวม ตาบวมเล็กน้อย ต้องทำอย่างไรคะ', at: '17/10/2026 22:15' }, answers: { more: 'ตอนนี้ปากยังบวมนิดหน่อยค่ะ หายใจปกติ', alg: 'ไม่เคยแพ้ยาค่ะ' } });
NIGHT('nsmj', { id: 'TC-261017-0148', acct: 'สมใจ ใจดี', who: 'me', symptoms: ['ถามเรื่องยา'], joined: '21:40',
  night: { q: 'ยาที่กินอยู่กินคู่กับยาแก้แพ้ได้ไหม', at: '17/10/2026 21:40' }, answers: { more: 'ยังคันจมูก จามบ่อยตอนเช้าค่ะ', alg: 'แพ้แอสไพรินค่ะ' } });
NIGHT('nwer', { id: 'TC-261018-0101', acct: 'วีระ ก.', who: null, person: { name: 'วีระ ก.', first: 'วีระ', rel: 'ตัวเอง', age: 63, weight: 68, phone: '08x-xxx-3302', allergies: [], allergyState: 'unknown', meds: ['แอมโลดิพีน 5 มก. (ยาความดัน)'] }, symptoms: ['ถามเรื่องยา'], joined: '06:50',
  night: { q: 'ยาลดกรดกินพร้อมยาลดความดันได้ไหมครับ', at: '18/10/2026 06:50' }, answers: { more: 'กินยาความดันตอนเช้าครับ ยาลดกรดกินหลังอาหาร', alg: 'ไม่แพ้ยาครับ' } });
const NQ = ['nmal', 'nsmj', 'nwer'];
const nqOf = k => SC.S.nq[k] || (SC.S.nq[k] = { st: 'open' });
SC.nqOf = nqOf;
SC.nightLeft = () => SC.S.branch === 'tw' ? NQ.filter(k => nqOf(k).st !== 'closed').length : 0;
const RES = { er: 'แนะนำให้ไปโรงพยาบาลแล้ว', ok: 'อาการดีขึ้น ให้คำแนะนำแล้ว', no: 'ติดต่อไม่ได้' };
/* "answered in the app" = the pharmacist sent a message in that question's room (the room itself marks an ordinary question the same way) */
const answered = k => (SC.S.chats[k]?.msgs || []).find(m => m.who === 'ph');
const nqTag = (k, q) => q.st === 'closed' ? ui.tag('ปิดเรื่องแล้ว ' + (q.closedAt || ''), 'ok', { icon: 'check' })
  : q.st === 'called' ? ui.tag(`โทรกลับแล้ว ${q.at} · ${RES[q.res]}`, 'ok', { icon: 'phone-call' }) + (answered(k) ? ui.tag(`ตอบในแอปแล้ว ${answered(k).time || ''}`.trim(), 'ok', { icon: 'message-circle' }) : '')
  : q.st === 'noans' ? ui.tag(`โทรไม่ติด ${q.at} · โทรอีกครั้ง`, 'warn', { icon: 'phone-off' })
  : q.st === 'replied' ? ui.tag(`ตอบในแอปแล้ว ${q.at}`, 'ok', { icon: 'message-circle' }) : ui.tag('ยังไม่ตอบ', 'warn', { icon: 'clock' });
/* buttons follow the work order, one solid button per card, and never a button that would be refused:
   urgent: call back (or call again) > reply in the app > close · normal: reply in the app > close */
function nqBtns(k, c, q) {
  if (q.st === 'closed') return '';
  const reply = ui.btn('ตอบในแอป', { icon: 'message-circle', go: 'room', st: 'night', p: { k } }), close = ui.btn('ปิดเรื่อง', { icon: 'check', a: 'nqClose', v: k });
  if (c.urgent.length) return q.st === 'called' ? (answered(k) ? close : reply) : ui.btn(q.st === 'noans' ? 'ดูเบอร์ โทรอีกครั้ง' : 'ดูเบอร์ โทรกลับ', { kind: 'danger', icon: 'phone', st: 'call', p: { k } });
  return ['replied', 'called'].includes(q.st) ? close : reply;
}
const NQ_DUE = '12:00';
SC.screen('night', {
  code: 'S203', group: 2, title: 'คำถามนอกเวลา', nav: 'night',
  states: [['list', 'มีคำถามค้าง', { cust: [['offline', 'sent', 'ลูกค้าเห็นว่าเภสัชกรจะตอบภายใน 12:00 ของวันที่ร้านเปิด']] }],
    ['call', 'ธงด่วน: บันทึกการโทรกลับ', { back: 'list', cust: [['offline', 'kid', 'ถามแทนลูก อาการอันตราย: แอปขึ้นกล่องแดง 1669 ทันที']] }],
    ['answered', 'ตอบครบแล้ว', { cust: [['inbox', 'normal', 'ลูกค้าได้รับแจ้งเตือน เภสัชกรตอบคำถามที่ฝากไว้'], ['room', 'live']] }],
    ['empty', 'ไม่มีคำถามค้าง', { cust: [['home', 'closed', 'ตอนร้านปิด ลูกค้าเห็นปุ่มฝากคำถาม']] }]],
  notes: ['เจ้าของ 20/10: "เอาปุ่มโทรออกดีกว่า ใช้งาน pc โทรออกไม่ได้ แต่ให้เด้งเป็นเบอร์โทรขึ้นแทน" (S201) · "s203 แก้เรื่องปุ่มโทรเช่นกัน" · ทุกปุ่มโทรในคอนโซลเปลี่ยนเป็น "ดูเบอร์" เด้งเบอร์เต็มให้โทรจากโทรศัพท์ร้าน มีปุ่มคัดลอกเบอร์ · บอร์ดและการ์ดยังซ่อนเบอร์ · ทุกการเปิดดูเบอร์ถูกบันทึก (ชื่อ เวลา)', 'เคาะแล้ว 20/10 ข้อ 70 (เจ้าของ: "12.00 ดีกว่า"): ตอบคำถามที่ฝากไว้ให้ครบภายใน 12:00 ของวันที่ร้านเปิด · เรื่องด่วนโทรกลับทันทีที่เปิดร้าน · ลูกค้าเห็นเวลา 12:00 ตอนฝากคำถาม', 'เจ้าของเคาะ: คำถามที่ฝากไว้ตอนร้านปิด เภสัชกรตอบเช้าวันถัดไปเมื่อร้านเปิด 09:00 (จอนี้เป็นเช้าวันที่ 18 เวลา 09:05)', 'ธงด่วนขึ้นก่อนเสมอ ต้องโทรกลับและบันทึกผลก่อนจึงปิดเรื่องได้', 'ปุ่มในการ์ดเรียงตามลำดับงาน ทีละปุ่ม: เรื่องด่วน "โทรกลับ" > "ตอบในแอป" > "ปิดเรื่อง" · เรื่องปกติ "ตอบในแอป" > "ปิดเรื่อง" · ไม่แสดงปุ่มที่กดแล้วถูกปฏิเสธ', 'ตอบในแอป = เปิดห้องของคำถามนั้น เห็นคำถาม แพ้ยา และยาประจำ ไม่มีตัวช่วยจัดยา', 'ไม่มีคำเรื่องเงินในจอนี้'],
  head: () => { const [o, c] = SC.branch().hours.split('-'); return { title: 'คำถามนอกเวลา', sub: `ลูกค้าฝากไว้ตอนร้านปิด (${c}-${o}) · ตอบภายใน ${NQ_DUE}` }; },
  now: () => ({ date: SC.NOW.date, time: '09:05' }),
  prep(S, st) {
    if (!S._reseed) return;
    if (st === 'answered') { S.nq = { nmal: { st: 'closed', res: 'er', at: '09:01', closedAt: '09:02' }, nsmj: { st: 'closed', at: '09:02', closedAt: '09:03' }, nwer: { st: 'closed', at: '09:03', closedAt: '09:04' } }; }
  },
  render(ctx) {
    if (ctx.st === 'empty' || SC.S.branch !== 'tw') return ui.card(ui.empty({ icon: 'moon', title: 'ไม่มีคำถามค้าง', body: 'คำถามที่ลูกค้าฝากไว้ตอนร้านปิดจะมาอยู่ที่นี่ เรื่องด่วนขึ้นก่อนเสมอ', btn: ui.btn('ไปที่คิวปรึกษา', { kind: 'secondary', sm: true, go: 'queue' }) }));
    const left = SC.nightLeft();
    return `${ui.note(!left ? '<b>ตอบครบทุกเรื่องแล้ว</b><p>ลูกค้าได้รับแจ้งเตือนในแอป คุยต่อในห้องของแต่ละเรื่องได้</p>' : `<b>ค้าง ${left} เรื่อง · ตอบให้ครบภายใน ${NQ_DUE}</b><p>เรื่องด่วนขึ้นก่อนเสมอ ต้องโทรกลับก่อนปิดเรื่อง ลูกค้าได้รับแจ้งเตือนเมื่อคุณตอบ</p>`, { tone: !left ? 'ok' : '', icon: !left ? 'circle-check' : 'moon' })}
      <div class="nq mt16">${NQ.map(k => {
        const c = SC.CASES[k], p = SC.casePerson(c), q = nqOf(k), urg = c.urgent.length, done = q.st === 'closed';
        return `<article class="card nq-i${urg && !done ? ' urg' : ''}">
        <div class="hrow wrap">${urg ? ui.tag('ธงด่วน', 'red', { icon: 'octagon-alert' }) : ''}<b>${esc(c.acct)}</b><span class="small">ถามให้ ${esc(SC.isFam(c) ? `${p.rel} (${p.name} ${p.age} ปี)` : 'ตัวเอง')}</span><span class="sp"></span>${nqTag(k, q)}</div>
        <p class="nq-q mt8">"${esc(c.night.q)}"</p>
        <p class="small mt8">ฝากเมื่อ ${esc(c.night.at)}${done ? '' : urg ? ' · <b class="danger-t">โทรกลับทันที</b>' : ` · <b>ตอบภายใน ${NQ_DUE}</b>`}${urg ? ` · เลือกอาการอันตราย: ${esc(c.urgent.join(', '))} · แอปแนะนำให้ไปโรงพยาบาลหรือโทร 1669 แล้ว` : ''}</p>
        ${done ? '' : `<div class="btn-row mt12">${nqBtns(k, c, q)}</div>`}
      </article>`;
      }).join('')}</div>`;
  },
  overlay(ctx) {
    if (ctx.st !== 'call') return '';
    const k = ctx.p.k || 'nmal', c = SC.CASES[k], p = SC.casePerson(c);
    return ui.modal({ title: 'โทรกลับ ' + c.acct, sub: `ฝากไว้ ${c.night.at} · ถามให้ ${SC.isFam(c) ? p.rel + ' (' + p.name + ' ' + p.age + ' ปี)' : 'ตัวเอง'}`, icon: 'phone', tone: c.urgent.length ? 'danger' : '', back: 'list',
      body: `<blockquote class="fu-q">"${esc(c.night.q)}"</blockquote>
        <div class="ph-box mt12"><span class="ph-num num">${esc(SC.fullPhone(p.phone))}</span>${ui.btn('คัดลอกเบอร์', { kind: 'secondary', sm: true, icon: 'copy', a: 'phCopy', v: SC.fullPhone(p.phone) })}</div>
        <p class="small mt8">โทรจากโทรศัพท์ร้าน <span class="num nowrap">${esc(SC.branch().phone)}</span> · คอมพิวเตอร์ของร้านโทรออกไม่ได้ · เปิดดูเบอร์ถูกบันทึกชื่อและเวลา</p>
        <p class="label mt16">ผลการติดต่อ</p><div class="opts mt8" data-radio-scope id="crOpts">
          ${ui.opt({ group: 'cr', v: 'er', title: 'ติดต่อได้ แนะนำให้ไปโรงพยาบาลแล้ว' })}${ui.opt({ group: 'cr', v: 'ok', title: 'ติดต่อได้ อาการดีขึ้นแล้ว ให้คำแนะนำ' })}${ui.opt({ group: 'cr', v: 'no', title: 'ติดต่อไม่ได้ จะโทรอีกครั้งใน 15 นาที' })}</div>
        <p class="err-t mt8" id="crErr" hidden>${ic('circle-x', 14, 2)}<span>เลือกผลการติดต่อก่อน</span></p>
        <div class="mt12">${ui.field({ id: 'crNote', label: 'บันทึก', optional: true, textarea: true, rows: 2, ph: 'เช่น แนะนำให้หยุดยาแก้ไอและไปโรงพยาบาลใกล้บ้าน' })}</div>
        ${SC.isFam(c) ? `<p class="small mt8">ถ้าผลคือแพ้ยา บันทึกยาที่แพ้ในห้องของคำถามนี้ ทุกสาขาจะเห็นก่อนจ่ายยา</p>` : ''}`,
      foot: `${ui.btn('ยกเลิก', { kind: 'secondary', st: 'list' })}${ui.btn('บันทึกผลการติดต่อ', { a: 'nqSaved', v: k, icon: 'check' })}` });
  }
});
SC.act('nqClose', t => {
  const k = t.dataset.v, c = SC.CASES[k], q = nqOf(k);
  if (c.urgent.length && q.st !== 'called') return SC.toast('เรื่องด่วน ต้องโทรกลับและบันทึกผลก่อนปิดเรื่อง', 'info');
  if (!c.urgent.length && !['replied', 'called'].includes(q.st)) return SC.toast('ตอบในแอปก่อน แล้วค่อยปิดเรื่อง', 'info');
  q.st = 'closed'; q.closedAt = SC.clockStr();
  SC.go('night', { st: 'list' }); SC.toast(`ปิดเรื่องของ ${c.acct} แล้ว`, 'check');
});
SC.act('nqSaved', async t => {
  const k = t.dataset.v, r = $('[data-radio="cr"][aria-checked="true"]');
  if (!r) { $('#crErr').hidden = false; $('#crOpts').classList.add('err'); return; }
  await SC.busy(t, 500);
  const q = nqOf(k); q.res = r.dataset.v; q.at = SC.clockStr(); q.st = r.dataset.v === 'no' ? 'noans' : 'called'; q.note = $('#crNote').value.trim();
  SC.go('night', { st: 'list' });
  SC.toast(q.st === 'noans' ? `บันทึกแล้ว: โทรไม่ติด · เตือนให้โทร${SC.CASES[k].acct}อีกครั้งใน 15 นาที` : `บันทึกผลการโทร${SC.CASES[k].acct}แล้ว ตอบในแอปแล้วปิดเรื่องได้`, 'check');
});
})();

/* ===== 60-consult.js ===== */
/* =====================================================================
   60 · Group 3 ระหว่างปรึกษา: S301 consult room (chat) · S302 video call
        + the shared workspace pieces: case bar, patient card, helper column, chat thread.
   The pharmacist side of the same conversation the customer app plays in C303 (64-room.js).
   Names, answers and ready-made messages always come from the case that is open (ctx.p.k)
   and from the pharmacist who is signed in.
   ===================================================================== */
(() => {
const { $, $$, esc, ic, ui } = SC;
const keyFor = ctx => ctx.p.k || (ctx.st === 'night' ? 'nsmj' : { kid: 'kid', allergy: 'kid' }[ctx.st]) || SC.S.activeCase || 'smj';
SC.wsCase = ctx => SC.CASES[keyFor(ctx)];

/* ---------- chat model: one conversation per case ---------- */
const greet = c => { const k = SC.casePlan(c), me = SC.me(); return SC.say(`สวัสดีค่ะ คุณ${SC.acctFirst(c)} ดิฉันเภสัชกร${me.first} ดูแลเคส${k.fam ? 'ของ' + k.call : 'นี้'}นะคะ`); };
const nightGreet = c => SC.say(`สวัสดีค่ะ คุณ${SC.acctFirst(c)} ดิฉันเภสัชกร${SC.me().first} อ่านคำถามที่ฝากไว้แล้วค่ะ ตอนนี้อาการเป็นอย่างไรบ้างคะ คุยต่อในห้องนี้ได้เลย`);
SC.seedChat = (st, key) => {
  const c = SC.CASES[key], k = SC.casePlan(c), a = c.answers || {}, m = [];
  const sys = text => m.push({ who: 'sys', text });
  if (c.night) {
    sys(`ลูกค้าฝากคำถามไว้ ${c.night.at}`); m.push({ who: 'cu', kind: 'intake', night: c.night.q, time: c.joined }); sys(`วันนี้ ${SC.clockStr()}`);
  } else {
    sys(`${SC.me().short} รับเคสแล้ว ${SC.S.accAt || '14:16'} · เลขเคส ${SC.caseCode(c)}`); m.push({ who: 'cu', kind: 'intake', time: c.joined });
    if (st !== 'start') {
      m.push({ who: 'ph', text: greet(c), time: '14:17' }, { who: 'ph', text: SC.say(k.q), time: '14:17' });
      if (a.temp) m.push({ who: 'cu', text: a.temp, time: '14:18' });
    }
    if (st === 'allergy') m.push({ who: 'ph', text: SC.say(k.algQ), time: '14:19' }, { who: 'cu', text: a.alg, time: '14:19' });
    if (st === 'photo') m.push({ who: 'ph', text: SC.say('ส่งรูปยาที่ใช้อยู่ให้ดูได้ไหมคะ'), time: '14:19' }, { who: 'cu', kind: 'photo', cap: 'รูปยาที่ใช้อยู่', time: '14:20' }, { who: 'cu', text: 'ยาที่กินอยู่ตอนนี้ค่ะ', time: '14:20' });
    if (st === 'idle') m.push({ who: 'ph', text: SC.say('มีอาการอื่นอยากเล่าเพิ่มไหมคะ'), time: '14:31' });
  }
  const live = c.night || st === 'start', now = SC.clk() + 1;
  const ch = { key, st, msgs: m, t: live ? now % 60 : 20, h: live ? SC.pad(Math.floor(now / 60)) : '14', typing: false, said: {} };
  m.filter(x => x.who === 'cu' && x.text).forEach(x => { ch.said[x.text] = true; });
  SC.S.chats[key] = ch;
  return ch;
};
SC.chatOf = key => SC.S.chats[key] || SC.seedChat('start', key);
/* the conversation survives moving between room, video and order; a state picked in the review panel starts it fresh */
const chat = ctx => { const key = keyFor(ctx), ch = SC.S.chats[key]; if (ch && !SC.S._reseed) return ch; return SC.seedChat(SC.S._reseed ? ctx.st : 'start', key); };
const nowT = ch => `${ch.h}:${SC.pad(Math.min(59, ch.t++))}`;
SC.nowT = nowT;

function intakeCard(c, m) {
  const p = c.who ? SC.person(c.who) : c.person, fam = SC.isFam(c);
  const alg = esc((p.allergies || []).join(', ') || (p.allergyState === 'none' ? 'ไม่แพ้' : 'ยังไม่ได้ระบุ'));
  if (m.night) return `<div class="m-intake"><small>คำถามที่ฝากไว้ · ${fam ? `${esc(p.name)} (${esc(p.rel)} ${p.age} ปี)` : esc(p.name)}</small><b>"${esc(m.night)}"</b><span>แพ้ยา: ${alg} · ยาประจำ: ${esc(SC.medsTxt(p))}</span></div>`;
  return `<div class="m-intake"><small>ข้อมูลที่ลูกค้าแจ้ง · ${fam ? `${esc(p.name)} (${esc(p.rel)} ${p.age} ปี${p.weight ? ' ' + p.weight + ' กก.' : ''})` : 'ตัวเอง'}</small><b>${esc(c.symptoms.join(', '))}</b>${c.note ? `<span>${esc(c.note)}</span>` : ''}<span>แพ้ยา: ${alg} · ยาประจำ: ${esc(SC.medsTxt(p))}</span>${c.urgent.length ? `<span class="tag red mt4">${ic('octagon-alert', 13, 2.2)}ธงด่วน: ${esc(c.urgent.join(', '))}</span>` : ''}</div>`;
}
const msgHtml = (c, m) => m.who === 'sys' ? `<div class="m-sys"><span>${esc(m.text)}</span></div>`
  : m.kind === 'intake' ? `<div class="m cu">${intakeCard(c, m)}<time>${esc(m.time || '')}</time></div>`
  : m.kind === 'photo' ? `<div class="m ${m.who}"><button type="button" class="m-photo" data-a="photoView" data-v="${esc(m.cap)}" data-w="${m.who}" aria-label="ดูรูป ${esc(m.cap)}"><span class="m-ph-img">${ic('pill', 34, 1.5)}</span><span class="m-ph-cap">${ic('image', 13, 2)} ${esc(m.cap)}</span></button><time>${esc(m.time || '')}${m.who === 'ph' ? ' · อ่านแล้ว' : ''}</time></div>`
  : m.kind === 'order' ? `<div class="m ph wide"><div class="m-order"><div class="hrow">${ic('receipt', 16, 2)}<b>ส่งรายการยาแล้ว ${esc(m.no)}</b><span class="sp"></span>${ui.tag(m.status || 'รอชำระ', m.status === 'ชำระแล้ว' ? 'ok' : 'warn')}</div><span class="small">${esc(m.sum)}</span></div><time>${esc(m.time || '')}</time></div>`
  : `<div class="m ${m.who}"><p>${esc(m.text)}</p><time>${esc(m.time || '')}${m.who === 'ph' ? ' · อ่านแล้ว' : ''}</time></div>`;
SC.thread = (c, ch) => `${ch.msgs.map(m => msgHtml(c, m)).join('')}${ch.typing ? '<div class="m cu tp"><span class="typing" aria-label="ลูกค้ากำลังพิมพ์"><i></i><i></i><i></i></span></div>' : ''}`;
function redrawThread(key) {
  const el = $('#thread'); if (!el || el.dataset.k !== key) return;
  el.innerHTML = SC.thread(SC.CASES[key], SC.S.chats[key]); el.scrollTop = el.scrollHeight; SC.markSeen(key);
}
SC.redrawThread = redrawThread;
/* the scripted customer of THIS case answers the questions a pharmacist usually asks */
async function customerReply(text, key) {
  const ch = SC.S.chats[key], a = SC.CASES[key].answers || {}; if (!ch) return;
  const ans = /องศา|ไข้/.test(text) ? a.temp : /แพ้/.test(text) ? a.alg : /อาการเป็นอย่างไร|ตอนนี้|อาการอื่น|เล่าเพิ่ม/.test(text) ? a.more : null;
  if (!ans || ch.said[ans]) return;
  ch.said[ans] = true;
  await SC.wait(500); ch.typing = true; redrawThread(key);
  await SC.wait(SC.RED() ? 100 : 1400); ch.typing = false;
  if (SC.S.chats[key] !== ch) return;
  ch.msgs.push({ who: 'cu', text: ans, time: nowT(ch) }); redrawThread(key);
  SC.toast('ลูกค้าตอบแล้ว', 'message-circle');
}
SC.act('send', () => {
  const inp = $('#msgIn'), v = inp?.value.trim(), key = $('#thread')?.dataset.k; if (!v || !key) return;
  const hits = SC.dxHits(v), err = $('#cmpErr');
  if (hits.length) { err.hidden = false; err.querySelector('span').textContent = `มีคำที่เป็นชื่อโรค: ${hits.join(', ')} · ใช้คำบรรยายอาการหรือคำแนะนำการดูแลแทน`; inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
  const ch = SC.chatOf(key); ch.msgs.push({ who: 'ph', text: v, time: nowT(ch) });
  if (SC.CASES[key].night) { const q = SC.nqOf(key); if (q.st === 'open') { q.st = 'replied'; q.at = '09:05'; } }
  delete SC.S.prefill[key];
  inp.value = ''; $('#sendBtn').disabled = true; redrawThread(key); inp.focus();
  customerReply(v, key);
});
SC.act('put', t => { const inp = $('#msgIn'); if (!inp) return; const cur = inp.value.trim(); inp.value = cur && !cur.includes(t.dataset.v) ? `${cur} ${t.dataset.v}` : t.dataset.v; inp.dispatchEvent(new Event('input')); inp.focus(); SC.toast('ใส่ข้อความในช่องพิมพ์แล้ว ตรวจก่อนกดส่ง', 'pencil'); });
/* B15 (FDA review 20/10): photos either side sends stay in the chat and in the case record, kept 1 year from the day
   the case closes. The mock sends a sample photo of a medicine label */
SC.act('attach', async t => {
  const key = $('#thread')?.dataset.k; if (!key) return SC.toast('เปิดห้องแชทก่อนแนบรูป', 'info');
  await SC.busy(t, 500); const ch = SC.chatOf(key); ch.msgs.push({ who: 'ph', kind: 'photo', cap: 'รูปฉลากยา', time: nowT(ch) }); redrawThread(key);
  SC.toast('ส่งรูปแล้ว · ลูกค้าเห็นในแชท', 'image');
});
SC.act('photoView', t => { const cap = t.dataset.v, cu = t.dataset.w === 'cu'; SC.openOv(() => `<div class="scrim" data-a="ovClose"></div><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mdT">
  <div class="modal-h"><span class="brand-t">${ic('image', 24, 2)}</span><div class="grow"><h2 id="mdT">${esc(cap)}</h2><p>${cu ? 'ลูกค้าส่งในแชท' : 'คุณส่งในแชท'}</p></div>${ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
  <div class="modal-b"><div class="ph-big" role="img" aria-label="${esc(cap)} (ภาพตัวอย่าง)">${ic('pill', 64, 1.3)}</div><p class="small mt8">${ic('lock', 13, 2)} รูปเก็บในเคสนี้ 1 ปีนับจากวันปิดเคส · เห็นเฉพาะเภสัชกรและผู้ดูแลระบบ</p></div>
  <div class="modal-f">${ui.btn('ปิด', { kind: 'secondary', a: 'ovClose' })}</div></div>`); });
SC.wireComposer = el => {
  const inp = $('#msgIn', el), b = $('#sendBtn', el); if (!inp) return;
  const dk = $('#thread', el)?.dataset.k;
  inp.addEventListener('input', () => { if (dk) SC.S.prefill[dk] = inp.value; b.disabled = !inp.value.trim(); const e = $('#cmpErr', el); if (e && !e.hidden && !SC.dxHits(inp.value).length) { e.hidden = true; inp.removeAttribute('aria-invalid'); } });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); SC.ACTS.send(); } });
  /* owner 21/10 "S301 กรอบให้พิมพ์ข้อความมีความสูงน้อยไป": starts at about 3 lines and grows with the text up to about 7 */
  const fit = () => { inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight + 2, 168) + 'px'; };
  inp.addEventListener('input', fit); fit();
  const th = $('#thread', el); if (th) th.scrollTop = th.scrollHeight;
};
/* keyboard jumps between the three things done at once (owner 20/10: multitask): Alt+1 chat · Alt+2 symptom record · Alt+3 medicine search */
document.addEventListener('keydown', e => {
  if (!e.altKey || e.ctrlKey || e.metaKey || !['1', '2', '3'].includes(e.key) || SC.S.ov) return;
  const cur = SC.cur(); if (!['room', 'video', 'order'].includes(cur?.id)) return;
  if (cur.id === 'video' && e.key !== '2') { const tab = e.key === '1' ? 'chat' : 'med'; if ((SC.S.vdTab || 'chat') !== tab) { e.preventDefault(); SC.S.vdTab = tab; SC.refresh(); return requestAnimationFrame(() => (tab === 'chat' ? $('#msgIn') : $('#mq'))?.focus()); } }
  const t = e.key === '1' ? $('#msgIn') : e.key === '2' ? $('#vr-add') || $('.vr textarea') : $('#mq') || $('#oq');
  if (!t) return; e.preventDefault(); t.focus(); t.scrollIntoView({ block: 'nearest' });
});
SC.composer = (c, o = {}) => {
  const k = SC.casePlan(c), pre = SC.S.prefill[c.key] || '';
  /* a silent customer: one tap to ask if they are still there (real user 20/10) */
  const still = SC.cur()?.st === 'idle' ? [['ถามว่ายังอยู่ไหม', SC.say(`คุณ${SC.casePerson(c).first || ''} ยังสะดวกคุยต่อไหมคะ ถ้ามีอาการอื่น พิมพ์บอกได้เลยค่ะ`)]] : [];
  const quick = c.night ? [['ทักทาย', nightGreet(c)], ['ถามเรื่องแพ้ยา', SC.say(k.algQ)]] : [...still, ['ทักทาย', greet(c)], ['ถามอาการ', SC.say(k.q)], ['ถามเรื่องแพ้ยา', SC.say(k.algQ)], ['คำแนะนำการดูแล', SC.say(`${k.dx} ${k.care}นะคะ`)], ['ไปพบแพทย์ถ้า', SC.say(k.see)]];
  return `<div class="cmp">${o.compact ? '' : `<div class="chips cmp-q">${quick.map(([l, v]) => `<button type="button" class="chip" data-a="put" data-v="${esc(v)}">${ic('plusmark', 12, 2.4)}${esc(l)}</button>`).join('')}</div>`}
    <p class="err-t cmp-err" id="cmpErr" role="alert" hidden>${ic('circle-x', 14, 2)}<span></span></p>
    <div class="cmp-r">${ui.ib('image', 'แนบรูป', { a: 'attach' })}<label class="sr" for="msgIn">พิมพ์ข้อความถึงลูกค้า</label><textarea id="msgIn" class="input" rows="1" placeholder="${o.compact ? 'พิมพ์ข้อความถึงลูกค้า' : 'พิมพ์ข้อความถึงลูกค้า (Enter ส่ง · Alt+1 กลับมาที่ช่องนี้)'}">${esc(pre)}</textarea><button type="button" class="btn primary cmp-send" id="sendBtn" data-a="send" aria-label="ส่งข้อความ"${pre ? '' : ' disabled'}>${ic('send', 17, 2)}<span>ส่ง</span></button></div></div>`;
};

/* ---------- workspace pieces ---------- */
/* from the accept time on the story clock, so every screen says the same (real user 20/10: "คุยมาแล้ว" went 28, 24, 3) */
const elapsed0 = () => Math.max(0, (SC.clk() - SC.toMin(SC.S.accAt || '14:16')) * 60 + (SC.S.clkS || 0));
const fmtEl = s => s < 60 ? 'ไม่ถึง 1 นาที' : `${Math.floor(s / 60)} นาที`;
/* one case bar on every in-case screen S301-S305 (UX review 20/10/2026 UX-03): who, allergy, regular medicine,
   open matters, and the 4 steps. "ปิดเคส" lives at step 4 only, one name on every screen */
const STEPS = [['talk', 'คุย'], ['order', 'จัดยา'], ['pay', 'ชำระ'], ['close', 'ปิดเคส']];
/* owner 21/10 "S303 ถ้ากดเปิดรายการยาแล้วจะกลับไปหน้า vdo ทำไง ?": the call stays on while the pharmacist is on another step */
SC.onVideo = key => SC.S.modeNow?.[key] === 'video';
/* messages the customer sent while the pharmacist was on another step (UX-11) */
SC.unread = key => { const ch = SC.S.chats[key], seen = SC.S.seen?.[key]; return ch && seen != null ? ch.msgs.slice(seen).filter(m => m.who === 'cu').length : 0; };
SC.markSeen = key => { const ch = SC.S.chats[key]; if (ch) SC.S.seen = { ...(SC.S.seen || {}), [key]: ch.msgs.length }; };
SC.modeSeg = mode => `<div class="mode-seg">${ui.seg([['room', 'แชท', 'message-circle'], ['video', 'วิดีโอคอล', 'video']], mode, { a: 'mode', label: 'ช่องทางที่คุยกับลูกค้า' })}</div>`;
function cbSteps(c, step) {
  const o = SC.S.orders[c.key], sent = !!o && o.status !== 'draft', paid = o?.status === 'paid', i0 = STEPS.findIndex(s => s[0] === step), kid = c.key === 'kid';
  const next = step === 'talk' ? (sent ? 'close' : 'order') : step === 'order' ? (sent ? 'pay' : '') : step === 'pay' ? 'close' : '';
  const vd = SC.onVideo(c.key), to = { talk: vd ? ['video', 'on'] : ['room', kid ? 'kid' : 'talk'], order: ['order', kid ? 'kid' : 'plan'], pay: sent ? ['pay', paid ? o.paid.recv : o.status === 'sent' ? 'wait' : 'expired'] : null, close: ['close', 'draft'] };
  const done = { talk: i0 > 0, order: sent, pay: paid, close: false }, nNew = step === 'talk' ? 0 : SC.unread(c.key);
  return `<ol class="cb-steps" aria-label="ขั้นของเคส">${STEPS.map(([k, l], i) => {
    const cur = k === step, ok = done[k] && !cur, t = to[k];
    const inner = `<span class="cb-n" aria-hidden="true">${ok ? ic('check', 13, 3) : i + 1}</span><span>${k === 'talk' && vd ? 'วิดีโอคอล' : l}</span>${k === 'talk' && nNew ? `<span class="cb-new">${nNew} ใหม่</span>` : ''}${ok ? '<span class="sr"> เสร็จแล้ว</span>' : ''}`;
    if (cur) return `<li><span class="cb-s cur" aria-current="step">${inner}</span></li>`;
    if (!t) return `<li><span class="cb-s off" title="ส่งรายการยาก่อน จึงดูการชำระได้">${inner}</span></li>`;
    return `<li><button type="button" class="cb-s${ok ? ' done' : k === next ? ' next' : ''}" data-go="${t[0]}" data-st="${t[1]}" data-p='${esc(JSON.stringify({ k: c.key }))}'>${inner}</button></li>`;
  }).join('')}</ol>`;
}
const cbAlg = (c, p, from) => { const ask = SC.algUnknown(p); return `<button type="button" class="cb-alg${ask ? ' ask' : ''}" ${from === 'video' ? `data-a="algOv" data-v="${c.key}"` : `data-go="room" data-st="allergy" data-p='${esc(JSON.stringify({ k: c.key, from }))}'`}>${ui.allergy(p)}<span class="cb-alg-a">${ic(ask ? 'shield-check' : 'pencil', 13, 2)}${ask ? 'บันทึกแพ้ยา' : 'แก้แพ้ยา'}</span></button>`; };
SC.caseBar = (c, o = {}) => {
  const p = SC.casePerson(c), fam = SC.isFam(c), pend = SC.pendingFor(c);
  const av = ui.av((fam ? p.first : p.name).slice(0, 2), { solid: true });
  const tags = `<div class="cb-tags">${cbAlg(c, p, o.step === 'order' ? 'order' : o.video ? 'video' : '')}<span class="tag line cb-med" title="ยาประจำ: ${esc(SC.medsTxt(p))}">${ic('pill', 13, 2)}ยาประจำ: ${esc(SC.medsTxt(p))}</span>${pend.length ? `<button type="button" class="tag warn cb-pend" data-a="cbPend" data-v="${c.key}">${ic('triangle-alert', 13, 2.2)}เรื่องค้าง ${pend.length}</button>` : ''}</div>`;
  const body = `<div class="cb-l1"><b class="ell">${ui.who(c)}</b>`;
  if (c.night) return `<div class="cb">${av}<div class="cb-who">${body}<span class="small">ฝากคำถามไว้ ${esc(c.night.at)} · ตอบเมื่อร้านเปิด</span></div>${tags}</div>
    <div class="cb-r">${ui.btn('กลับไปรายการคำถาม', { kind: 'secondary', go: 'night', st: 'list', icon: 'moon' })}${ui.btn('ปิดเรื่อง', { kind: 'secondary', a: 'nqClose', v: c.key, icon: 'check' })}</div></div>`;
  const acc = SC.S.activeCase === c.key && SC.S.accAt ? SC.S.accAt : '14:16';
  const aw = `${fam ? '' : `${p.age} ปี · `}${p.weight ? p.weight + ' กก.' : 'ไม่ได้ระบุน้ำหนัก'}`;
  const meta = o.closed ? `${aw} · เคส ${esc(SC.caseCode(c))}` : `${aw} · เคส ${esc(SC.caseCode(c))} · รับ ${esc(acc)} · คุยมาแล้ว <span class="num" id="elapsed">${fmtEl(elapsed0(o.start || 0))}</span>`;
  const nNew = !o.closed && o.step && o.step !== 'talk' ? SC.unread(c.key) : 0, last = nNew ? SC.S.chats[c.key].msgs.filter(m => m.who === 'cu').pop() : null;
  const fresh = nNew ? SC.caseNote('new', 'message-circle', `<b>ลูกค้าพิมพ์มาใหม่${nNew > 1 ? ` ${nNew} ข้อความ` : ''}:</b> "${esc(last.text || 'ส่งรูปหรือข้อมูลอาการ')}" <span class="small">${esc(last.time || '')}</span>`, ui.btn('ไปตอบในแชท', { sm: true, go: 'room', st: c.key === 'kid' ? 'kid' : 'talk', p: { k: c.key }, icon: 'message-circle' })) : '';
  const vdNote = !o.closed && o.step && o.step !== 'talk' && SC.onVideo(c.key) ? SC.caseNote('new', 'video', '<b>วิดีโอคอลยังต่ออยู่</b> ลูกค้ายังเห็นและได้ยินคุณ', ui.btn('กลับไปวิดีโอคอล', { sm: true, go: 'video', st: 'on', p: { k: c.key }, icon: 'video' })) : '';
  return `<div class="cb">${av}<div class="cb-who">${body}<span class="small">${meta}</span></div>${tags}</div>
    ${o.closed ? `<div class="cb-r">${ui.tag('ปิดเคสแล้ว', 'muted', { icon: 'check' })}</div>` : cbSteps(c, o.step || 'talk')}</div>${vdNote}${fresh}`;
};
/* a one-line notice under the case bar for what is happening right now (UX-13): never inside the narrow chat column */
SC.caseNote = (tone, icon, html, btns = '') => `<div class="cb-note ${tone}" role="status">${ic(icon, 18, 2)}<p class="grow">${html}</p>${btns}</div>`;
SC.act('cbPend', t => {
  const box = $('.pt-pend');
  if (box) { box.scrollIntoView({ block: 'nearest', behavior: SC.RED() ? 'auto' : 'smooth' }); $('button', box)?.focus(); return; }
  const x = SC.pendingFor(SC.CASES[t.dataset.v])[0]; if (x) SC.go(x.go, { st: x.st });
});
SC.act('algOv', t => { const k = t.dataset.v; SC.openOv(() => SC.SCREENS.room.overlay({ id: 'room', st: 'allergy', p: { k, from: 'video' } })); });
SC.act('mode', t => { const k = $('#thread')?.dataset.k || SC.S.activeCase || 'smj'; if (t.dataset.v === 'video') SC.go('video', { st: 'on', p: { k } }); else SC.go('room', { st: 'talk', p: { k } }); });
SC.tickElapsed = (el, ctx, start = 0) => { let s = elapsed0(start); ctx.every(() => { s++; const n = $('#elapsed', el); if (n) n.textContent = fmtEl(s); }, 1000); };

/* other open matters about the same person: shown in the patient card so nothing is missed */
SC.pendingFor = c => {
  const pk = SC.pkey(c), out = [], rep = SC.adrOpen(pk), fu = SC.followDue?.();
  if (rep) out.push({ kind: 'adr', icon: 'message-square-text', text: `รายงานอาการหลังใช้ยารอตอบ: ${rep.drug} · ${rep.sym.join(', ')} (แจ้ง ${rep.at})`, go: 'adr', st: rep.severe ? 'severe' : 'new' });
  if (fu && fu.pk === pk) out.push({ kind: 'fu', k: fu.k, icon: 'heart-pulse', text: `ติดตามอาการ: แจ้งว่า${fu.what} ${fu.at} ยังไม่ได้ติดต่อกลับ`, go: 'follow', st: fu.st });
  return out;
};
SC.ptCard = (c, o = {}) => {
  const p = SC.casePerson(c), fam = SC.isFam(c);
  const pend = SC.pendingFor(c), ask = ['unknown', undefined].includes(p.allergyState) && !(p.allergies || []).length;
  return `<div class="pt">
    ${pend.length ? `<div class="pt-pend" role="status"><p class="label">${ic('triangle-alert', 13, 2.2)} มีเรื่องค้างของคนนี้</p>${pend.map(x => `<button type="button" class="pt-pi" data-go="${x.go}" data-st="${x.st}">${ic(x.icon, 15, 2)}<span>${esc(x.text)}</span></button>`).join('')}</div>` : ''}
    <div class="pt-sec"><p class="label">ผู้มีอาการ</p><b class="pt-n">${esc(p.name)}</b><p class="small">${esc(p.rel)} · ${p.age} ปี${fam ? ` · บัญชี ${esc(c.acct)}` : ''}</p>
      <div class="pt-kv mt8"><span>${ic('weight', 14, 2)}น้ำหนัก</span><b>${p.weight ? p.weight + ' กก.' : 'ไม่ได้ระบุ'}</b></div></div>
    <div class="pt-sec${ask ? ' ask' : ''}"><div class="hrow"><p class="label">แพ้ยา</p><span class="sp"></span><button type="button" class="link small" data-go="room" data-st="allergy" data-p='${esc(JSON.stringify({ k: c.key, from: o.from || '' }))}'>${ask ? 'บันทึก' : 'แก้ไข'}</button></div>
      <div class="hrow wrap mt4">${ui.allergy(p)}${ui.sfx(SC.pkey(c))}</div><p class="small mt4">${esc(p.allergySrc || (p.allergyState === 'none' ? 'ลูกค้าระบุตอนเข้าคิวว่าไม่แพ้ยา' : p.allergyState === 'asked' ? 'ถามแล้ว ลูกค้าไม่ทราบ' : 'ลูกค้าไม่ได้ระบุตอนเข้าคิว ต้องถามและบันทึกก่อนจ่ายยา'))}</p>
      ${(SC.S.algLog[SC.pkey(c)] || []).slice(-2).reverse().map(x => `<p class="small mt4 alg-log${x.removed?.length ? ' warn-t' : ''}">${ic('history', 12, 2)} ${esc(x.at)} ${esc(x.by)}: ${esc(x.from)} เป็น ${esc(x.to)}${x.why ? ` · เหตุผล: ${esc(x.why)}` : ''}</p>`).join('')}</div>
    <div class="pt-sec"><p class="label">ยาประจำ</p><p>${esc(SC.medsTxt(p))}</p></div>
    <p class="small pt-ack">${ic('clipboard-check', 13, 2)} ${esc(SC.ackTxt(c))}</p>
    ${SC.infoBtns(c)}
    ${o.compact ? SC.visitBox(c) : `<div class="pt-sec"><p class="label">${c.night ? 'เรื่องที่ถาม' : 'อาการที่แจ้ง'}</p><div class="chips mt4">${c.symptoms.map(s => `<span class="chip static sm">${esc(s)}</span>`).join('')}</div>${c.note ? `<p class="small mt4">"${esc(c.note)}"</p>` : ''}${c.urgent.length ? `<p class="mt4">${ui.tag('ธงด่วน: ' + c.urgent.join(', '), 'red', { icon: 'octagon-alert' })}</p>` : ''}</div>
    ${SC.visitBox(c)}
    ${c.who ? `<div class="pt-sec"><p class="label">คนอื่นในบ้านในบัญชีนี้</p><ul class="pt-fam">${['me', 'mom', 'kid'].filter(id => id !== c.who).map(id => { const f = SC.withAlg(id, SC.person(id)); return `<li><b>${esc(f.first)}</b> <span class="small">${esc(f.rel)} ${f.age} ปี</span> ${ui.allergy(f, { muted: true })}</li>`; }).join('')}</ul></div>` : ''}`}</div>`;
};
SC.assist = c => {
  const p = SC.casePerson(c), put = (txt, l = 'ใส่ในแชท') => `<button type="button" class="link small" data-a="put" data-v="${esc(txt)}">${ic('plusmark', 12, 2.4)} ${l}</button>`;
  if (c.night) return `<div class="as">
    <div class="as-h"><span class="brand-t">${ic('moon', 18, 2)}</span><div><b>คำถามที่ฝากไว้</b><p class="small">ฝากเมื่อ ${esc(c.night.at)}</p></div></div>
    <div class="as-sec"><p>"${esc(c.night.q)}"</p></div>
    <div class="as-sec"><p class="label">ตรวจก่อนตอบ</p><ul class="as-chk"><li>แพ้ยา: ${ui.allergy(p)}</li><li>ยาประจำ: ${esc(SC.medsTxt(p))}</li>${c.urgent.length ? `<li class="danger-t">ธงด่วน: ${esc(c.urgent.join(', '))} · โทรกลับก่อน</li>` : ''}</ul></div>
    <div class="as-sec"><p class="small">ตอบในแชทแล้วกด "ปิดเรื่อง" ที่แถบบน · ถ้าต้องดูอาการเพิ่ม ชวนลูกค้าเริ่มปรึกษาใหม่ในแอปได้</p></div></div>`;
  if (!(c.urgent || []).length) return '';
  const ref = SC.say(`จากอาการ${c.urgent.join(' ')}ที่แจ้ง แนะนำให้ไปโรงพยาบาลใกล้บ้านตอนนี้เลยค่ะ ถ้าอาการแย่ลงระหว่างทาง โทร 1669 ได้ทันทีนะคะ`);
  return `<div class="as-sec as-urg" role="alert"><p class="label">${ic('octagon-alert', 14, 2.2)}ธงด่วน: ${esc(c.urgent.join(', '))}</p><p><b>ควรไปโรงพยาบาล</b> ประเมินก่อนว่าเข้าข่ายฉุกเฉินไหม ถ้าใช่ แนะนำให้ไปโรงพยาบาลหรือโทร 1669 ไม่ต้องจัดยา</p>${put(ref, 'ใส่ข้อความแนะนำโรงพยาบาลในแชท')}</div>`;
};

/* ---------- S301 consult room (chat) ---------- */
const roomBody = (ctx, o = {}) => {
  const c = SC.wsCase(ctx), ch = chat(ctx), st = ctx.st, ext = st !== 'idle' && !c.night && SC.S.idleExt?.[c.key];
  const banner = st === 'idle' ? SC.caseNote('warn', 'timer', `<b>ลูกค้าเงียบ 13 นาที</b> · ระบบปิดเคสเองใน <b class="num" id="idleT">2:00</b> นาที (เหตุผล "ลูกค้าไม่ตอบกลับ")`, `${ui.btn('ยังไม่ปิด ต่ออีก 15 นาที', { sm: true, kind: 'secondary', a: 'extend', icon: 'timer' })}${ui.btn('ปิดเคสตอนนี้', { sm: true, kind: 'ghost', go: 'close', st: 'draft', p: { k: c.key, reason: 'noreply' } })}`)
    : o.banner || '';
  if (!c.night) SC.markSeen(c.key);
  return `${SC.caseBar(c, { step: 'talk', start: st === 'idle' ? 1680 : st === 'start' ? 0 : 192 })}${banner}
    <div class="ws">
      <aside class="ws-col ws-pt" aria-label="ข้อมูลผู้มีอาการ">${SC.ptCard(c)}</aside>
      <section class="ws-col ws-mid" aria-label="การสนทนา">
        <div class="ws-mh"><b>การสนทนา</b>${o.peer || (st === 'idle' ? `<span class="tag warn">${ic('timer', 13, 2.2)}ไม่ตอบ 13 นาที</span>` : `<span class="tag ok"><i class="dot live"></i>ลูกค้าออนไลน์</span>`)}${ext ? `<span class="small ws-ext">${ic('timer', 13, 2)}ปิดเคสเองถ้าเงียบถึง ${esc(ext)}</span>` : ''}<span class="sp"></span>${c.night ? '' : SC.modeSeg('room')}</div>
        <div class="thread" id="thread" data-k="${c.key}" aria-live="polite">${SC.thread(c, ch)}</div>
        ${SC.composer(c)}
      </section>
      ${c.night ? `<aside class="ws-col ws-side" aria-label="ตัวช่วย">${SC.assist(c)}</aside>` : `<aside class="ws-col ws-side ws-med" aria-label="รายการยา">${SC.assist(c)}${SC.medPanel(c)}</aside>`}
    </div>`;
};
SC.roomBody = roomBody;
const roomBack = cur => { const c = SC.CASES[keyFor(cur)]; return c.night ? 'night' : c.key === 'kid' ? 'kid' : 'talk'; };
SC.screen('room', {
  code: 'S301', group: 3, duty: true, title: 'ห้องปรึกษา (แชท)', nav: ctx => SC.wsCase(ctx).night ? 'night' : 'queue', fill: true,
  states: [['start', 'เพิ่งรับเคส', { cust: [['room', 'live', 'ลูกค้าเข้าห้องปรึกษาเมื่อเภสัชกรรับคิว'], ['lock', 'accept']] }],
    ['talk', 'คุยอยู่', { cust: [['room', 'live', 'บทสนทนาเดียวกันฝั่งลูกค้า']] }],
    ['kid', 'ปรึกษาให้ลูก', { cust: [['intake', 'kid', 'ลูกค้าแจ้งอาการแทนลูก']] }],
    ['allergy', 'บันทึกแพ้ยา', { back: roomBack, cust: [['health', 'normal', 'ลูกค้าเห็นว่าใครบันทึกแพ้ยา'], ['familyedit', 'kid']] }],
    ['idle', 'ลูกค้าเงียบนาน', { cust: [['room', 'live']] }],
    ['night', 'ตอบคำถามที่ฝากไว้', { cust: [['inbox', 'normal', 'แจ้งเตือน เภสัชกรตอบคำถามที่คุณฝากไว้'], ['lock', 'msg']] }],
    ['photo', 'ลูกค้าส่งรูป', { cust: [['room', 'live', 'ลูกค้าแนบรูปจากห้องแชทฝั่งลูกค้า']] }]],
  notes: ['ห้องรีวิว อย. 20/10 (B15): รูปที่ลูกค้าส่งขึ้นในแชท กดดูรูปใหญ่ได้ · ปุ่มแนบรูปส่งรูปให้ลูกค้าได้ (เช่น ฉลากยา) · รูปเก็บในเคส 1 ปีนับจากวันปิดเคส เห็นเฉพาะเภสัชกรและผู้ดูแลระบบ · รูปในต้นแบบเป็นภาพตัวอย่าง', 'เจ้าของ 20/10: "ยาที่เข้ากับอาการ (3) ตรงนี้ไม่เอา แนะนำ ให้ manual add เอง เพราะงั้นอยากดูหน้าจอ add รายการยาด้วย" · "fx ตรง 3xx ต้องให้ UX friendly กับเภสัชด้วยที่ต้อง multitask ทั้งบันทึกข้อมูล พิมพ์คุย คีย์รายการยา" · ไม่มียาที่ระบบเสนอให้แล้ว เภสัชกรค้นและเพิ่มยาเองที่ช่องขวา โดยไม่ต้องออกจากแชท', 'เจ้าของ 20/10: "มีปุ่มให้กดไปดูอาการก่อนหน้า, ประวัติซื้อ, ข้อมูลอื่นๆ ได้มั้ย ?" · การ์ดผู้มีอาการมี 3 ปุ่ม เปิดแผงข้าง: อาการครั้งก่อน (โน้ตของเภสัชกรแต่ละครั้ง) · ประวัติซื้อ (3 รายการล่าสุด มีปุ่ม "เพิ่มยาชุดเดิม") · ข้อมูลอื่น (โรคประจำตัว แพ้อาหาร ส่วนสูง สมาชิก ความยินยอม)',
    'เคาะแล้ว 20/10 ข้อ 93 94 (เจ้าของ: "ข้อ 85-94 ใช้ตามค่าที่ต้นแบบใส่ไว้ได้เลย") · ข้อ 93: บันทึกอาการรอบนี้เป็นข้อมูลสุขภาพ เก็บกับเคส 1 ปีเหมือนแชท เภสัชกรเท่านั้นเห็น พนักงานร้านและลูกค้าไม่เห็น · ข้อ 94: ประวัติซื้อแสดง 3 รายการล่าสุดทุกช่องทาง ทุกสาขา ทุกการเปิดดูถูกบันทึก',
    'เคาะแล้ว 20/10 ข้อ 85 (เจ้าของ: "ข้อ 85 ตรวจคำชื่อโรคเฉพาะข้อความที่ลูกค้าเห็นตามที่แนะนำ") · บันทึกอาการรอบนี้ลูกค้าไม่เห็น จึงไม่ตรวจ เขียนชื่อโรคได้ · ข้อความแชทที่ส่งถึงลูกค้ายังตรวจ',
    'เจ้าของ 20/10: "ขณะคุยสามารถบันทึกข้อมูลอาการป่วยรอบนี้ได้เลยมั้ย พร้อมๆกับเลือกยา" · "บันทึกอาการรอบนี้" อยู่ในการ์ดผู้มีอาการทั้งตอนแชท วิดีโอ และทำรายการยา ช่องเดียวกับหน้าเปิดบิลของเว็บ (ปุ่มอาการ + พิมพ์เพิ่ม · เป็นมานานเท่าไร · ยาที่ใช้อยู่ · โน้ต) บันทึกเองทุกครั้งที่พิมพ์ · ลูกค้าไม่เห็น',
    'เคาะแล้ว 20/10: ลูกค้าเงียบ 15 นาที ระบบปิดเคสเอง (เตือนก่อน 2 นาที มีปุ่ม "ยังไม่ปิด ต่ออีก 15 นาที" ตามที่เจ้าของสั่ง "มีปุ่มยังไม่ปิดให้ด้วยนะ") · เภสัชกรกดปิดเคสเองได้ทุกเมื่อที่ขั้น 4 หรือปุ่ม "ปิดเคสตอนนี้" (เจ้าของ: "15 นาที ปิดเคสเองหรือเภสัชกดปิดได้เลย")', 'เคาะแล้ว 20/10: ห้องปรึกษายังเป็น 3 ช่อง (ข้อ 56) · ช่องขวาเปลี่ยนจากตัวช่วยเป็นรายการยา (เจ้าของ 20/10)', 'รีวิว UX 20/10: แถบเคสหน้าตาเดียวกันทุกจอระหว่างเคส (ชื่อ อายุ น้ำหนัก แพ้ยา ยาประจำ เรื่องค้าง + 4 ขั้น คุย · จัดยา · ชำระ · ปิดเคส) · "ปิดเคส" อยู่ที่ขั้น 4 ที่เดียว · ปุ่มสลับแชท/วิดีโอคอลอยู่หัวช่องการสนทนา · แจ้งเตือนลูกค้าเงียบเป็นบรรทัดเดียวใต้แถบเคส', '3 ช่องทำพร้อมกันได้: ซ้าย = ผู้มีอาการ + บันทึกอาการรอบนี้ · กลาง = แชท · ขวา = รายการยา (ค้นแล้วกด Enter เพิ่ม · จำนวน · เอาออก · ป้ายเตือนแพ้ยา ยังไม่เลือกฉลาก ยังไม่ใส่วิธีใช้) · วิธีใช้ ฉลาก และหน่วย เขียนในหน้ารายการยา (S303) ซึ่งมีแชทอยู่ข้างๆ · พิมพ์ค้างในช่องแชทไม่หายเมื่อเพิ่มยา · กระโดดช่อง Alt+1 แชท · Alt+2 บันทึกอาการ · Alt+3 ค้นยา', 'ชื่อ คำตอบจำลองของลูกค้า และข้อความสำเร็จรูป มาจากเคสที่เปิดอยู่และเภสัชกรที่เข้าสู่ระบบ (ดิฉัน/ค่ะ หรือ ผม/ครับ)', 'ข้อความสำเร็จรูปเหนือช่องพิมพ์ (ทักทาย ถามอาการ ถามเรื่องแพ้ยา คำแนะนำการดูแล ไปพบแพทย์ถ้า) กดแล้วลงช่องพิมพ์ให้ตรวจก่อนส่ง ไม่ส่งเอง · เคสธงด่วนมีกล่องแนะนำโรงพยาบาลบนสุดของช่องขวา', 'ข้อความที่มีชื่อโรคส่งไม่ได้ (เจ้าของเคาะ ตามคำแนะนำฝ่ายกฎหมาย)', 'แพ้ยา: บันทึกได้ 3 แบบ แพ้ (ต้องใส่ชื่อยา) · ไม่แพ้ · ถามแล้วลูกค้าไม่ทราบ ไม่มีตัวเลือกที่เลือกไว้ให้', 'แชทเก็บ 1 ปี · ไม่บันทึกวิดีโอ (เจ้าของสั่ง)'],
  wait: [],
  head: ctx => ({ title: SC.wsCase(ctx).night ? 'ตอบคำถามที่ฝากไว้' : 'ห้องปรึกษา', sub: SC.branch().name }),
  now: ctx => SC.wsCase(ctx).night ? { date: SC.NOW.date, time: '09:05' } : { date: SC.NOW.date, time: ctx.st === 'idle' ? '14:44' : ctx.st === 'start' ? (SC.S.accAt || '14:16') : SC.at('14:19') },
  prep(S, st, p) {
    p.k = p.k || (S._reseed ? (st === 'night' ? 'nsmj' : { kid: 'kid', allergy: 'kid' }[st] || 'smj') : st === 'night' ? 'nsmj' : S.activeCase) || 'smj';
    if (!SC.CASES[p.k].night) { S.activeCase = p.k; S.modeNow = { ...(S.modeNow || {}), [p.k]: 'chat' }; } else S.nightOpen = p.k;
    if (S._reseed && st === 'start') S.accAt = '14:19';
    if (st !== 'allergy') S.algDraft = null;
    if (st === 'night' && !SC.CASES[p.k].night) return 'talk';
  },
  render: ctx => roomBody(ctx),
  overlay(ctx) {
    if (ctx.st !== 'allergy') return '';
    const c = SC.wsCase(ctx), p = SC.casePerson(c), me = SC.me(), ch = SC.S.chats[c.key];
    const said = ch?.msgs.find(m => m.who === 'cu' && m.text && m.text === c.answers?.alg);
    const now = (p.allergies || []).length ? 'แพ้ ' + p.allergies.join(', ') : p.allergyState === 'none' ? 'ไม่แพ้ยา' : p.allergyState === 'asked' ? 'ถามแล้ว ลูกค้าไม่ทราบ' : 'ยังไม่ได้ระบุ';
    const back = roomBack(ctx), from = ctx.p.from === 'order', vid = ctx.p.from === 'video', d = SC.S.algDraft?.key === c.key ? SC.S.algDraft : null;
    const cur = d ? d.v : (p.allergies || []).length ? 'has' : '';
    const m = ui.modal({ title: 'บันทึกแพ้ยา', sub: `${p.name}${SC.isFam(c) ? ` (${p.rel} ${p.age} ปี) · บัญชี ${c.acct}` : ''}`, icon: 'shield-check', back,
      body: `<p class="small">ตอนนี้: <b>${esc(now)}</b>${p.allergySrc ? ` · ${esc(p.allergySrc)}` : ''}</p>
        ${said ? `<p class="small mt4">ลูกค้าตอบในแชท ${esc(said.time)}: "${esc(said.text)}"</p>` : ''}
        <div class="opts mt12" data-radio-scope id="alOpts">${ui.opt({ group: 'al', v: 'has', title: 'แพ้ยา', sub: 'ใส่ชื่อยาหรือส่วนประกอบที่แพ้', on: cur === 'has' })}${ui.opt({ group: 'al', v: 'none', title: 'ไม่แพ้ยา', sub: (p.allergies || []).length ? `ลบประวัติแพ้ ${p.allergies.join(', ')} ต้องยืนยันและใส่เหตุผล` : 'ลูกค้ายืนยันว่าไม่เคยแพ้ยา', on: cur === 'none' })}${ui.opt({ group: 'al', v: 'asked', title: 'ถามแล้ว ลูกค้าไม่ทราบ', sub: 'จ่ายยาได้ ระวังยาที่แพ้บ่อย และถามซ้ำครั้งหน้า', on: cur === 'asked' })}</div>
        <p class="err-t mt8" id="alErr" hidden>${ic('circle-x', 14, 2)}<span>เลือกสถานะแพ้ยาก่อน</span></p>
        <div class="mt12">${ui.field({ id: 'alName', label: 'ชื่อยาหรือส่วนประกอบที่แพ้', ph: 'เช่น เพนิซิลลิน · ใส่เมื่อเลือก "แพ้ยา"', value: d ? d.names.join(', ') : (p.allergies || []).join(', ') })}</div>
        <div class="mt12">${ui.field({ id: 'alRx', label: 'อาการที่เคยเป็น', optional: true, ph: 'เช่น ผื่นขึ้น ปากบวม', value: d?.rx || '' })}</div>
        <div class="note mt12">${ic('info', 18, 2)}<div class="grow"><p>บันทึกเป็น <b>"บันทึกโดย ${esc(me.short)} ${SC.NOW.date}"</b> · ทุกสาขาเห็นก่อนจ่ายยา · ลูกค้าเห็นในข้อมูลสุขภาพในแอปและแก้ได้ ระบบแจ้งเภสัชกรเมื่อมีการแก้</p></div></div>`,
      foot: `${ui.btn('ยกเลิก', from ? { kind: 'secondary', go: 'order', st: c.key === 'kid' ? 'kid' : 'plan', p: { k: c.key } } : vid ? { kind: 'secondary', a: 'ovClose' } : { kind: 'secondary', st: back, p: { k: c.key } })}${ui.btn('บันทึก', { a: 'saveAllergy', v: c.key, icon: 'check' })}` });
    return vid ? m.replace(/data-a="closeOv" data-v="[^"]*"/g, 'data-a="ovClose"') : m;
  },
  mount(el, ctx) { SC.wireComposer(el); SC.wireMedPanel(el); SC.tickElapsed(el, ctx, ctx.st === 'idle' ? 1680 : ctx.st === 'start' ? 0 : 192); if (ctx.st === 'idle') { let s = 120; const k = SC.wsCase(ctx).key; ctx.every(() => { s = Math.max(0, s - 1); const n = $('#idleT', el); if (n) n.textContent = SC.mmss(s); if (!s && SC.cur()?.st === 'idle') { SC.go('close', { st: 'draft', p: { k, reason: 'noreply' } }); SC.toast('ลูกค้าเงียบครบ 15 นาที ระบบปิดเคสให้ ตรวจใบสรุปแล้วกดส่ง', 'timer'); } }, 1000); } },
  sims: ({ st }) => [
    { label: 'ลูกค้าพิมพ์ตอบ', run: async () => { const key = $('#thread')?.dataset.k || 'smj', ch = SC.chatOf(key), a = SC.CASES[key].answers || {}; ch.typing = true; redrawThread(key); await SC.wait(900); ch.typing = false; ch.msgs.push({ who: 'cu', text: a.more || 'ค่ะ', time: nowT(ch) }); redrawThread(key); } },
    { label: 'ลูกค้าส่งรูป', run: () => { const key = $('#thread')?.dataset.k || 'smj', ch = SC.chatOf(key); ch.msgs.push({ who: 'cu', kind: 'photo', cap: 'รูปผื่นที่แขน', time: nowT(ch) }); redrawThread(key); } },
    st !== 'night' && { label: 'ลูกค้าขอวิดีโอคอล', run: () => SC.go('video', { st: 'ask', p: { k: $('#thread')?.dataset.k || 'smj' } }) },
    st !== 'night' && { label: 'ลูกค้าหลุดจากแอป', run: () => SC.go('dropped', { st: 'wait', p: { k: $('#thread')?.dataset.k || 'smj' } }) },
    !['idle', 'night'].includes(st) && { label: 'ลูกค้าเงียบ 13 นาที', run: () => SC.setSt('idle') },
    st !== 'night' && { label: 'ไปหน้าจัดยา แล้วลูกค้าพิมพ์มา', run: async () => { const key = $('#thread')?.dataset.k || 'smj', ch = SC.chatOf(key); SC.go('order', { st: key === 'kid' ? 'kid' : 'plan', p: { k: key } }); await SC.wait(600); ch.msgs.push({ who: 'cu', text: 'ขอถามเพิ่มนิดนึงค่ะ ยาอมกินคู่กับยาความดันได้ไหมคะ', time: nowT(ch) }); SC.refresh(); SC.toast(`${SC.casePerson(SC.CASES[key]).first || 'ลูกค้า'} ส่งข้อความใหม่ในแชท`, 'message-circle'); } }
  ]
});
SC.act('extend', () => {
  const k = SC.cur().p.k || SC.S.activeCase || 'smj', until = SC.hhmm(SC.clk() + 15);
  SC.S.idleExt = { ...(SC.S.idleExt || {}), [k]: until }; SC.setSt('talk');
  SC.toast(`ยังไม่ปิดเคส นับเวลาใหม่ 15 นาที (ถึง ${until})`, 'timer');
});
const algLabel = (v, names) => v === 'has' ? 'แพ้ ' + names.join(', ') : v === 'none' ? 'ไม่แพ้ยา' : v === 'asked' ? 'ถามแล้ว ลูกค้าไม่ทราบ' : 'ยังไม่ได้ระบุ';
const algNow = p => (p.allergies || []).length ? 'has' : p.allergyState === 'none' ? 'none' : p.allergyState === 'asked' ? 'asked' : '';
function applyAllergy(key, d, why) {
  const c = SC.CASES[key], pk = SC.pkey(c), me = SC.me(), p0 = SC.casePerson(c), prev = (p0.allergies || []).filter(Boolean);
  const at = `${SC.NOW.date} ${SC.clockStr()}`, by = `บันทึกโดย ${me.short} ${at}`;
  SC.S.alg[pk] = d.v === 'has' ? { allergies: d.names, allergyState: 'set', allergySrc: by + (d.rx ? ` · อาการ: ${d.rx}` : ''), algBy: 'ph' }
    : d.v === 'none' ? { allergies: [], allergyState: 'none', allergySrc: by, algBy: 'ph' }
    : { allergies: [], allergyState: 'asked', allergySrc: `ถามแล้ว ลูกค้าไม่ทราบ · ${by}`, algBy: 'ph' };
  const removed = prev.filter(a => d.v !== 'has' || !d.names.includes(a));
  (SC.S.algLog[pk] = SC.S.algLog[pk] || []).push({ from: algLabel(algNow(p0), prev), to: algLabel(d.v, d.names), why: why || '', at, by: me.short, removed });
  SC.S.algDraft = null; SC.S.ov = null;
  const p = SC.casePerson(c);
  if (SC.cur().id === 'video') SC.refresh();
  else if (SC.cur().p.from === 'order') SC.go('order', { st: key === 'kid' ? 'kid' : 'plan', p: { k: key } });
  else SC.go('room', { st: c.night ? 'night' : key === 'kid' ? 'kid' : 'talk', p: { k: key } });
  SC.toast(`บันทึกแพ้ยาของ ${p.name} แล้ว: ${algLabel(d.v, d.names)}${removed.length ? ` · ลบประวัติแพ้ ${removed.join(', ')} แล้ว เก็บบันทึกไว้` : ''}`, 'shield-check');
}
SC.act('saveAllergy', async t => {
  const key = t.dataset.v, c = SC.CASES[key], r = $('[data-radio="al"][aria-checked="true"]'), nm = $('#alName');
  if (!r) { $('#alErr').hidden = false; $('#alOpts').classList.add('err'); return; }
  const names = nm.value.split(/[,\n]/).map(x => x.trim()).filter(Boolean);
  if (r.dataset.v === 'has' && !names.length) { const f = nm.closest('.field'); f.classList.add('err'); nm.setAttribute('aria-invalid', 'true'); if (!$('.err-t', f)) f.insertAdjacentHTML('beforeend', `<p class="err-t">${ic('circle-x', 14, 2)}<span>ใส่ชื่อยาที่แพ้ก่อนบันทึก</span></p>`); nm.focus(); return; }
  const d = { key, v: r.dataset.v, names: r.dataset.v === 'has' ? names : [], rx: $('#alRx').value.trim() };
  const prev = (SC.casePerson(c).allergies || []).filter(Boolean), removed = prev.filter(a => d.v !== 'has' || !d.names.includes(a));
  if (!removed.length) { await SC.busy(t, 500); return applyAllergy(key, d); }
  /* removing a recorded allergy is never one tap: name what goes, ask why, keep a record */
  SC.S.algDraft = d;
  const p = SC.casePerson(c);
  SC.openOv(() => `<div class="scrim" data-a="ovClose"></div><div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="mdT">
    <div class="modal-h"><span class="danger-t">${ic('triangle-alert', 24, 2)}</span><div class="grow"><h2 id="mdT">ลบประวัติแพ้ ${esc(removed.join(', '))} ของ${esc(p.name)}?</h2><p>เปลี่ยนจาก "${esc(algLabel(algNow(p), prev))}" เป็น "${esc(algLabel(d.v, d.names))}"</p></div>${ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
    <div class="modal-b"><p>${esc(p.allergySrc || '')}</p><p class="mt8">ทุกสาขาจะไม่เห็นว่า${esc(p.first || p.name)}แพ้${esc(removed.join(', '))}อีก · ระบบเก็บบันทึกการเปลี่ยนนี้ไว้ เภสัชกรยังเห็นในประวัติแพ้ยาตอนสั่งยา</p>
      <div class="mt12">${ui.field({ id: 'algWhy', label: 'เหตุผลที่ลบ (บันทึกในระบบ)', req: true, ph: 'เช่น ลูกค้ายืนยันว่าเคยกินแล้วไม่แพ้ แพทย์ตรวจแล้ว', focus: true })}</div></div>
    <div class="modal-f">${ui.btn('ไม่ลบ กลับไปแก้', { kind: 'secondary', a: 'ovClose' })}${ui.btn('ยืนยันลบประวัติแพ้ยา', { kind: 'danger', a: 'algConfirm', v: key, icon: 'triangle-alert' })}</div></div>`);
});
SC.act('algConfirm', async t => {
  const w = $('#algWhy'); if (!w.value.trim()) { w.closest('.field').classList.add('err'); w.focus(); SC.toast('ใส่เหตุผลที่ลบก่อน', 'info'); return; }
  await SC.busy(t, 500); applyAllergy(t.dataset.v, SC.S.algDraft, w.value.trim());
});
/* from the order screen: put the allergy question in the composer, the pharmacist sends it */
SC.act('askAlg', t => { const key = t.dataset.v, c = SC.CASES[key]; SC.S.prefill[key] = SC.say(SC.casePlan(c).algQ); SC.go('room', { st: key === 'kid' ? 'kid' : 'talk', p: { k: key } }); SC.toast('ใส่คำถามเรื่องแพ้ยาในช่องพิมพ์แล้ว ตรวจแล้วกดส่ง', 'pencil'); });

/* ---------- S302 video call ---------- */
/* every call button says what it does under the icon (UX-17); the red one ends the video only, the case stays open */
const vdBtn = (icon, word, label, a) => `<span class="vd-bw">${ui.ib(icon, label, { a, cls: 'vd-b' })}<span aria-hidden="true">${word}</span></span>`;
SC.screen('video', {
  code: 'S302', group: 3, duty: true, title: 'วิดีโอคอล', nav: 'queue', fill: true,
  states: [['on', 'คุยอยู่', { cust: [['video', 'on']] }],
    ['ask', 'ลูกค้าขอวิดีโอ', { cust: [['room', 'live', 'ห้องปรึกษาสำหรับเริ่มวิดีโอคอล']] }],
    ['weak', 'สัญญาณอ่อน', { cust: [['video', 'weak']] }],
    ['drop', 'ลูกค้าหลุดสาย', { cust: [['lost', 'me', 'ฝั่งลูกค้ากำลังต่อใหม่ เคสและแชทไม่หาย']] }],
    ['mycam', 'กล้องของคุณใช้ไม่ได้', { cust: [['video', 'pcam', 'ลูกค้าเห็นว่ากล้องเภสัชกรใช้ไม่ได้']] }]],
  notes: ['เจ้าของ 20/10: "fx ตรง 3xx ต้องให้ UX friendly กับเภสัชด้วยที่ต้อง multitask" · ช่องขวาสลับ แชท | รายการยา (ค้นและเพิ่มยาได้ระหว่างวิดีโอ) · Alt+1 แชท · Alt+3 รายการยา · บันทึกอาการอยู่ช่องซ้าย (Alt+2)', 'วิดีโอกับแชทเป็นเคสเดียวกัน สลับแล้วข้อความอยู่ครบ (A15) · รับเคสแล้วแชทเริ่มว่าง ไม่มีข้อความของใครค้างอยู่', 'ไม่มีการบันทึกวิดีโอ ป้ายอยู่บนภาพตลอด (เจ้าของสั่ง)', 'ภาพตัวเองอยู่มุมขวาบน ไม่บังแถบแจ้งเตือนและปุ่มด้านล่าง', 'ลูกค้าควรเห็นหน้าเภสัชกรเพื่อยืนยันตัวตน: กล้องเราใช้ไม่ได้ = บอกชัด และยังไม่ตัดสินใจเรื่องยา', 'เจ้าของ 21/10: "S303 ถ้ากดเปิดรายการยาแล้วจะกลับไปหน้า vdo ทำไง ?" · ไปหน้ารายการยาเต็ม (S303) ชำระ (S304) หรือปิดเคส (S305) ระหว่างวิดีโอ สายยังต่ออยู่ · ใต้แถบเคสขึ้น "วิดีโอคอลยังต่ออยู่" พร้อมปุ่ม "กลับไปวิดีโอคอล" · ขั้นที่ 1 ของแถบเคสเปลี่ยนเป็น "วิดีโอคอล" กดแล้วกลับเข้าสาย · วางสายแล้วกลับเป็นแชทตามเดิม', 'ปุ่มไมค์ กล้อง วางสาย ตำแหน่งเดียวกับฝั่งลูกค้า · รีวิว UX 20/10: มีคำใต้ไอคอนทุกปุ่ม ตัดปุ่มสลับกล้อง (เครื่องร้านมีกล้องเดียว) ปุ่มแดงเขียน "วางสาย กลับไปแชท" เคสยังเปิดอยู่'],
  head: () => ({ title: 'วิดีโอคอล', sub: SC.branch().name }),
  now: () => ({ date: SC.NOW.date, time: '14:22' }),
  prep(S, st, p) { p.k = p.k || (S._reseed ? 'smj' : S.activeCase) || 'smj'; S.activeCase = p.k; S.modeNow = { ...(S.modeNow || {}), [p.k]: st === 'ask' ? 'chat' : 'video' }; },
  render(ctx) {
    const c = SC.wsCase(ctx), st = ctx.st, p = SC.casePerson(c), ch = chat({ ...ctx, st: 'talk' });
    SC.markSeen(c.key);
    const stage = st === 'ask' ? `<div class="vd-ask">${ic('video', 40, 1.5)}<h2 class="h2">${esc(p.name)} ขอวิดีโอคอล</h2><p>กล้องของคุณยังปิดอยู่ จะเปิดเมื่อกด "เข้าร่วมวิดีโอ" · ถ้าตอนนี้ไม่สะดวก คุยแชทต่อได้ ลูกค้าเห็นเหตุผล</p><div class="btn-row mt16" style="justify-content:center">${ui.btn('เข้าร่วมวิดีโอ', { kind: 'white', st: 'on', icon: 'video', focus: true })}${ui.btn('คุยแชทต่อ', { kind: 'glass', a: 'mode', v: 'room', icon: 'message-circle' })}</div></div>`
      : `<div class="vd-remote${st === 'drop' ? ' off' : ''}"><span class="vd-face">${esc(SC.isFam(c) ? p.first.slice(0, 2) : p.name.slice(0, 2))}</span><span class="vd-cap">${esc(p.name)}</span></div>
        <div class="vd-top"><span class="tag on-dark">${ic('lock', 12, 2)}ไม่มีการบันทึกวิดีโอ</span><span class="sp"></span><span class="vd-t num" id="vdT">${st === 'drop' ? 'รอเชื่อมต่อ' : '02:41'}</span></div>
        ${st === 'weak' ? `<div class="vd-msg warn" role="status">${ic('wifi-off', 18, 2)}<span>สัญญาณของลูกค้าอ่อน ภาพอาจกระตุก · ถ้าไม่ดีขึ้น ชวนคุยทางแชทแทน</span>${ui.btn('ชวนคุยทางแชท', { kind: 'white', sm: true, a: 'putWeak', v: c.key })}</div>` : ''}
        ${st === 'drop' ? `<div class="vd-msg" role="status"><span class="spin" style="border-color:#fff;border-right-color:transparent"></span><span>ลูกค้าหลุดจากสาย กำลังรอเชื่อมต่อใหม่ <b class="num" id="dropT">0:15</b> · เคสและแชทไม่หาย</span>${ui.btn('กลับไปแชท', { kind: 'white', sm: true, a: 'mode', v: 'room' })}</div>` : ''}
        ${st === 'mycam' ? `<div class="vd-msg bad" role="alert">${ic('video-off', 18, 2)}<span>กล้องของคุณใช้ไม่ได้ ลูกค้าเห็นข้อความว่ากล้องเภสัชกรใช้ไม่ได้ และได้รับคำแนะนำให้ยังไม่ตัดสินใจเรื่องยา</span>${ui.btn('ลองเปิดกล้องอีกครั้ง', { kind: 'white', sm: true, a: 'camRetry' })}</div>` : ''}
        <div class="vd-self${st === 'mycam' ? ' off' : ''}">${st === 'mycam' ? ic('video-off', 22, 1.8) : '<span>คุณ</span>'}</div>
        <div class="vd-ctl">${vdBtn('mic', 'ไมค์', 'ปิดไมค์', 'vdMic')}${vdBtn(st === 'mycam' ? 'video-off' : 'video', 'กล้อง', st === 'mycam' ? 'เปิดกล้อง' : 'ปิดกล้อง', 'vdCam')}<span class="vd-bw"><button type="button" class="vd-b end" data-a="hangup" data-v="${c.key}" aria-label="วางสาย กลับไปแชท" title="วางสาย กลับไปแชท">${ic('phone-off', 20, 2)}</button><span aria-hidden="true">วางสาย กลับไปแชท</span></span></div>`;
    return `${SC.caseBar(c, { step: 'talk', start: 341, video: true })}
      <div class="ws vd">
        <aside class="ws-col ws-pt" aria-label="ข้อมูลผู้มีอาการ">${SC.ptCard(c)}</aside>
        <section class="ws-col vd-stage" aria-label="วิดีโอคอล">${stage}</section>
        <aside class="ws-col ws-chat" aria-label="แชทและรายการยา">
          <div class="ws-mh vd-tab">${ui.seg([['chat', 'แชท', 'message-circle'], ['med', `รายการยา${SC.S.orders[c.key]?.items.length ? ` (${SC.S.orders[c.key].items.length})` : ''}`, 'pill']], SC.S.vdTab === 'med' ? 'med' : 'chat', { a: 'vdTab', label: 'แชทหรือรายการยา' })}</div>
          ${SC.S.vdTab === 'med' ? `<div class="ws-med vd-med">${SC.medPanel(c)}</div>` : `<div class="thread" id="thread" data-k="${c.key}">${SC.thread(c, ch)}</div>${SC.composer(c, { compact: true })}`}</aside>
      </div>`;
  },
  mount(el, ctx) {
    SC.wireComposer(el); SC.wireMedPanel(el); SC.tickElapsed(el, ctx, 341);
    const t = $('#vdT', el); if (t && ctx.st !== 'drop' && ctx.st !== 'ask') { let s = SC.S.accT ? Math.floor((Date.now() - SC.S.accT) / 1000) : 161; t.textContent = `${SC.pad(Math.floor(s / 60))}:${SC.pad(s % 60)}`; ctx.every(() => { s++; t.textContent = `${SC.pad(Math.floor(s / 60))}:${SC.pad(s % 60)}`; }, 1000); }
    const d = $('#dropT', el); if (d) { let s = 15; ctx.every(() => { s = Math.max(0, s - 1); d.textContent = SC.mmss(s); }, 1000); }
  },
  sims: ({ st }) => [st !== 'weak' && { label: 'สัญญาณลูกค้าอ่อน', run: () => SC.setSt('weak') }, st !== 'drop' && { label: 'ลูกค้าหลุดสาย', run: () => SC.setSt('drop') }, st === 'drop' && { label: 'ลูกค้ากลับเข้าสาย', run: () => { SC.setSt('on'); SC.toast('ลูกค้ากลับเข้าสายแล้ว', 'video'); } }]
});
SC.act('vdTab', t => { SC.S.vdTab = t.dataset.v; SC.refresh(); requestAnimationFrame(() => (t.dataset.v === 'med' ? $('#mq') : $('#msgIn'))?.focus()); });
SC.act('putWeak', t => { const key = t.dataset.v, ch = SC.chatOf(key); ch.msgs.push({ who: 'ph', text: SC.say('สัญญาณภาพไม่ค่อยดี คุยทางแชทต่อได้เลยนะคะ'), time: nowT(ch) }); SC.go('room', { st: 'talk', p: { k: key } }); });
SC.act('camRetry', async t => { await SC.busy(t, 700); SC.setSt('on'); SC.toast('เปิดกล้องได้แล้ว', 'video'); });
SC.act('vdMic', t => { const on = t.getAttribute('aria-label') === 'ปิดไมค์'; t.setAttribute('aria-label', on ? 'เปิดไมค์' : 'ปิดไมค์'); t.title = t.getAttribute('aria-label'); t.innerHTML = ic(on ? 'mic-off' : 'mic', 18, 1.9); SC.toast(on ? 'ปิดไมค์แล้ว' : 'เปิดไมค์แล้ว', on ? 'mic-off' : 'mic'); });
SC.act('vdCam', () => SC.toast('จำลอง: สลับเปิดปิดกล้อง', 'video'));
SC.act('hangup', t => { const key = t.dataset.v, ch = SC.chatOf(key); ch.msgs.push({ who: 'sys', text: 'วิดีโอคอลจบแล้ว · ' + ($('#vdT')?.textContent || '') }); SC.go('room', { st: 'talk', p: { k: key } }); SC.toast('วางสายแล้ว เคสยังเปิด คุยต่อทางแชทได้', 'phone-off'); });
})();

/* ===== 61-visit.js ===== */
/* =====================================================================
   61 · In the consult (S301 chat, S302 video, S303 medicine list): the person card gets
   (1) three buttons that open what the pharmacist needs about this customer: symptoms of earlier visits, what they bought,
       other information (owner 20/10: "มีปุ่มให้กดไปดูอาการก่อนหน้า, ประวัติซื้อ, ข้อมูลอื่นๆ ได้มั้ย ?")
   (2) "บันทึกอาการรอบนี้", written while talking and while picking medicine, saved as it is typed
       (owner 20/10: "ขณะคุยสามารถบันทึกข้อมูลอาการป่วยรอบนี้ได้เลยมั้ย พร้อมๆกับเลือกยา").
   Same fields as the website's "บันทึกอาการ" on เปิดบิล (symptom chips + add your own, who has it, how long, medicines in
   use for it, a note): per visit, pharmacists only, never shown to store staff or to the customer.
   Mock data. Built for real: visits and purchases come from the shop's records (website orders + SS), every opening logged.
   ===================================================================== */
(() => {
const { $, esc, ic, ui } = SC;
/* what the pharmacist wrote at earlier visits (by case of SC.HISTORY) */
const PAST = {
  'TC-261016-0058': { chips: ['ไข้', 'ไอ', 'น้ำมูก คัดจมูก'], dur: '2 วัน', meds: 'พาราเซตามอลที่บ้าน', note: 'ไข้ 37.8 องศา ไม่หอบ ให้ยาตามอาการ นัดถามอาการ 3 วัน', res: 'จ่ายยา 3 รายการ · ติดตามแล้ว อาการดีขึ้น' },
  'TC-261002-0087': { chips: ['ไข้', 'ไอ', 'เจ็บคอ'], dur: '1 วัน', meds: 'ไม่มี', note: 'คอแดง ไม่มีจุดหนอง กลืนเจ็บเล็กน้อย แนะนำอมยาอม ดื่มน้ำอุ่น', res: 'จ่ายยา 2 รายการ' },
  'TC-260914-0031': { chips: ['ผื่น คัน'], dur: '3 วัน', meds: 'คาลาไมน์', note: 'ผื่นแดงเล็กที่แขนหลังเล่นสนาม ไม่มีไข้ ไม่ลาม', res: 'ให้คำแนะนำ ไม่ต้องจ่ายยา' },
  'TC-260412-0012': { chips: ['ถามเรื่องยา'], dur: '', meds: 'เมทฟอร์มิน', note: 'ถามว่ากินยาแก้ปวดคู่ยาเบาหวานได้ไหม', res: 'จ่ายยา 1 รายการ' }
};
/* the account's paid orders, every channel, newest first: the last 5 (owner 20/10 S202: "อาจจะ 3-5 ครั้งล่าสุดไม่ให้มันรกเกินไป") */
const BUYS = {
  me: [
    { at: '16/10/2026', no: 'MT9F2K7QW1B', ch: 'แอปปรึกษาเภสัชกร', br: 'tw', items: [['TW-00512', 2], ['TW-00733', 1], ['TW-00418', 3]] },
    { at: '02/10/2026', no: 'MT4H8N2RT6C', ch: 'แอปปรึกษาเภสัชกร', br: 'tw', items: [['TW-00512', 1], ['TW-20871', 1]] },
    { at: '21/09/2026', no: 'W2609210417', ch: 'เว็บไซต์', br: 'tw', items: [['TW-03310', 2], ['TW-00901', 1]] },
    { at: '05/09/2026', no: 'TW2609050233', ch: 'หน้าร้าน', br: 'tw', items: [['TW-00512', 1], ['TW-03310', 1]] },
    { at: '18/08/2026', no: 'W2608180112', ch: 'เว็บไซต์', br: 'on', items: [['TW-00901', 2]] }
  ],
  mom: [{ at: '12/04/2026', no: 'MT7J3P9LX2D', ch: 'แอปปรึกษาเภสัชกร', br: 'tw', items: [['TW-00512', 2]] }],
  kid: []
};
/* what the customer's profile holds (website: โรคประจำตัว from the shop's list, food allergy, consent) */
const MORE = {
  me: { dis: ['ความดันโลหิตสูง'], food: 'ไม่มี', h: 160, member: 'สมาชิก · ส่วนลดยา 4%', pts: 320, consent: 'ยินยอมใช้ข้อมูลสุขภาพ 03/08/2026 (ฉบับ 2)' },
  mom: { dis: ['เบาหวาน'], food: 'ไม่มี', h: 155, member: 'ในบัญชีของสมใจ ใจดี', pts: null, consent: 'ยินยอมโดยเจ้าของบัญชี 14/09/2026' },
  kid: { dis: [], food: 'ไข่', h: 115, member: 'ในบัญชีของสมใจ ใจดี', pts: null, consent: 'ยินยอมโดยผู้ปกครอง 14/09/2026' }
};
const prod = sku => SC.CATALOG.find(i => i.sku === sku);
const buysOf = c => c.who ? BUYS[c.who === 'me' ? 'me' : c.who] || [] : [];
const pastOf = c => c.who ? SC.HISTORY.filter(h => h.who === c.who) : [];
const total = b => b.items.reduce((n, [s, q]) => n + (prod(s)?.price || 0) * q, 0);
const BUY_N = 5;

/* ---------- rows that open their details on a click only (owner 21/10 S202: "ถ้ากดลูกศรลงถึงเปิดรายการ ถ้าแค่เอาเม้าลากผ่าน
   แล้วโชว์รายการเลยมันบัง", replaces opening on hover from 20/10). Enter or Space on the row opens it from the keyboard ---------- */
let hvN = 0;
const hv = (top, sub, pop) => { const id = 'hv' + (++hvN); return `<li class="hv"><button type="button" class="hv-t" aria-expanded="false" aria-controls="${id}"><span class="hv-top">${top}<span class="hv-more">${ic('chevron-down', 14, 2)}</span></span>${sub ? `<span class="small">${sub}</span>` : ''}</button><div class="hv-p" id="${id}" role="region">${pop}</div></li>`; };
const hvShut = () => document.querySelectorAll('.hv.on').forEach(x => { x.classList.remove('on'); x.firstElementChild.setAttribute('aria-expanded', 'false'); });
/* open upwards when the scrolling panel has no room below the row */
const hvPlace = h => {
  const p = h.querySelector('.hv-p'), sc = h.closest('.drawer-b, .modal-b, .ws-col') || document.documentElement, box = sc.getBoundingClientRect(), r = h.getBoundingClientRect();
  p.style.display = 'block'; const need = p.offsetHeight + 8; p.style.display = '';
  h.classList.toggle('up', box.bottom - r.bottom < need && r.top - box.top > box.bottom - r.bottom);
};
document.addEventListener('click', e => {
  if (e.target.closest('.hv-p')) return;
  const t = e.target.closest('.hv-t'), was = t?.parentElement.classList.contains('on');
  hvShut();
  if (t && !was) { hvPlace(t.parentElement); t.parentElement.classList.add('on'); t.setAttribute('aria-expanded', 'true'); }
});
/* Esc closes an open row first and stays on the screen; the next Esc goes back as usual. Capture phase, so it runs before the
   router's Esc (lead QA 21/10: the first Esc used to close the whole S202 panel) */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const h = document.querySelector(SC.S.ov ? '.modal .hv.on' : '.hv.on'); if (!h) return;
  e.preventDefault(); e.stopPropagation(); hvShut(); h.firstElementChild.focus();
}, true);
/* S202 (case preview): what the pharmacist needs before taking the case, kept short; each row opens its details */
SC.pvHealth = c => {
  const p = SC.casePerson(c), m = c.who ? MORE[c.who] : null, past = pastOf(c).slice(0, BUY_N), buys = buysOf(c).slice(0, BUY_N);
  const dis = m ? (m.dis.length ? m.dis.map(esc).join(', ') : 'ไม่มี') : 'ไม่ได้ระบุ';
  return `<section class="pv-sec"><h3 class="label">แพ้ยา ยาประจำ โรคประจำตัว</h3>
      <div class="hrow wrap mt8">${ui.allergy(p, { src: true })}${ui.sfx(SC.pkey(c))}</div>
      ${p.allergyState === 'unknown' ? '<p class="small mt8">ลูกค้าไม่ได้ระบุ (ไม่บังคับตอนเข้าคิว) ต้องถามและบันทึกในห้องปรึกษาก่อนจ่ายยา</p>' : ''}
      <p class="mt8"><span class="muted">ยาประจำ:</span> ${esc(SC.medsTxt(p))}</p>
      <p class="mt4"><span class="muted">โรคประจำตัว:</span> ${dis}${m?.food && m.food !== 'ไม่มี' ? ` · <span class="muted">แพ้อาหาร:</span> ${esc(m.food)}` : ''}</p></section>
    <section class="pv-sec"><h3 class="label">อาการครั้งก่อน${past.length ? ` (${pastOf(c).length})` : ''}</h3>
      ${past.length ? `<p class="small pv-hint">ชี้หรือกดที่รายการเพื่อดูบันทึกของเภสัชกร</p><ul class="pv-h hvl mt4">${past.map(h => { const x = PAST[h.id] || {};
        return hv(`<span class="num">${esc(h.date)}</span><b>${esc((x.chips || [h.topic]).join(' · '))}</b>`, `${esc(SC.PHARM[h.pharm].short)} · ${esc(SC.branch(h.branch).short)} · ${h.bought ? 'ซื้อยา ' + SC.money(h.bought) : 'ไม่ได้ซื้อยา'}`,
          `${visitKv({ chips: x.chips || [h.topic], dur: x.dur, meds: x.meds, note: x.note })}<p class="small mt4">${esc(x.res || h.close || '')}</p>`); }).join('')}</ul>` : `<p class="small mt8">${c.who ? 'ยังไม่เคยปรึกษา' : 'ลูกค้าใหม่ ยังไม่มีบันทึกอาการในระบบ'}</p>`}</section>
    <section class="pv-sec"><h3 class="label">ซื้อย้อนหลัง${buys.length ? ` (${buys.length} ครั้งล่าสุด)` : ''}</h3>
      ${buys.length ? `<ul class="pv-h hvl mt8">${buys.map(b => hv(`<span class="num">${esc(b.at)}</span><b>${b.items.length} รายการ · ${SC.money(total(b))}</b>`, `${esc(b.ch)} · ${esc(SC.branch(b.br).short)}`,
          `<ul class="ci-items">${b.items.map(([s, q]) => { const pr = prod(s); return `<li><span>${esc(pr?.name || s)}</span><span class="num">${q} ${esc(pr?.unit || '')}</span></li>`; }).join('')}</ul><p class="small mono mt4">${esc(b.no)}</p>`)).join('')}</ul>`
        : `<p class="small mt8">${c.who ? 'บัญชีนี้ยังไม่เคยซื้อยา' : 'ลูกค้าใหม่ ยังไม่มีประวัติในระบบ'}</p>`}</section>`;
};

/* ---------- (1) the three buttons ---------- */
SC.infoBtns = c => {
  const nPast = pastOf(c).length, nBuy = buysOf(c).length;
  const b = (tab, label, n, icon) => `<button type="button" class="pt-ib" data-a="ciOpen" data-v="${c.key}|${tab}">${ic(icon, 15, 2)}<span>${label}</span>${n != null ? `<span class="num">${n}</span>` : ''}</button>`;
  return `<div class="pt-sec pt-ibs" aria-label="ข้อมูลลูกค้า">${b('past', 'อาการครั้งก่อน', nPast, 'history')}${b('buy', 'ประวัติซื้อ', nBuy, 'shopping-bag')}${b('more', 'ข้อมูลอื่น', null, 'user')}</div>`;
};
const TABS = [['past', 'อาการครั้งก่อน'], ['buy', 'ประวัติซื้อ'], ['more', 'ข้อมูลอื่น']];
const pastTab = c => {
  const v = SC.S.visit?.[c.key], rows = pastOf(c);
  const now = v && (v.chips.length || v.note) ? `<li class="ci-it now"><div class="hrow wrap"><b>รอบนี้</b>${ui.tag('กำลังปรึกษา', 'ok')}</div>${visitKv(v)}</li>` : '';
  if (!rows.length && !now) return ui.empty({ icon: 'history', title: 'ยังไม่เคยปรึกษา', body: c.who ? '' : 'ลูกค้าใหม่ ยังไม่มีบันทึกอาการในระบบ' });
  return `<ul class="ci-list">${now}${rows.map(h => { const x = PAST[h.id] || {}; return `<li class="ci-it"><div class="hrow wrap"><b class="num">${esc(h.date)}</b><span class="small">${esc(SC.PHARM[h.pharm].short)} · ${esc(SC.branch(h.branch).short)} · ${esc(h.mode)}</span></div>
      ${visitKv({ chips: x.chips || [h.topic], dur: x.dur, meds: x.meds, note: x.note })}<p class="small mt4">${esc(x.res || h.close)} · <button type="button" class="link small" data-go="${h.branch === SC.S.branch ? 'log' : 'denied'}" data-st="${h.branch === SC.S.branch ? 'detail' : 'branch'}" data-p='{"id":"${h.id}"}'>ดูเคสเต็ม</button></p></li>`; }).join('')}</ul>`;
};
const visitKv = v => `<div class="chips mt8">${v.chips.map(s => `<span class="chip static sm">${esc(s)}</span>`).join('')}</div>
  ${ui.kv([['เป็นมา', esc(v.dur || 'ไม่ได้ระบุ')], ['ยาที่ใช้อยู่', esc(v.meds || 'ไม่ได้ระบุ')], ['โน้ตเภสัชกร', esc(v.note || '-')]], { left: true })}`;
const buyTab = c => {
  const rows = buysOf(c), duty = !SC.isAdmin() && !SC.isStaff();
  if (!rows.length) return ui.empty({ icon: 'shopping-bag', title: 'ยังไม่มีประวัติซื้อ', body: c.who ? 'บัญชีนี้ยังไม่เคยซื้อยา' : 'ลูกค้าใหม่ ยังไม่มีประวัติในระบบ' });
  return `<p class="small">${BUY_N} ครั้งล่าสุดที่ชำระแล้ว ทุกช่องทาง ทุกสาขา</p><ul class="ci-list mt8">${rows.slice(0, BUY_N).map((b, n) => `<li class="ci-it"><div class="hrow wrap"><b class="num">${esc(b.at)}</b><span class="small mono">${esc(b.no)}</span><span class="small">${esc(b.ch)} · ${esc(SC.branch(b.br).short)}</span><span class="sp"></span><b class="num">${SC.money(total(b))}</b></div>
      <ul class="ci-items">${b.items.map(([s, q]) => { const p = prod(s); return `<li><span>${esc(p?.name || s)}</span><span class="num">${q} ${esc(p?.unit || '')}</span></li>`; }).join('')}</ul>
      ${duty && !c.night ? ui.btn('เพิ่มยาชุดเดิม', { kind: 'secondary', sm: true, a: 'ciAgain', v: `${c.key}|${n}`, icon: 'plus', cls: 'mt8' }) : ''}</li>`).join('')}</ul>
    <p class="small mt8">${ic('info', 13, 2)} เพิ่มยาชุดเดิม = ใส่ยาเหล่านี้ลงรายการยาของเคสนี้ ราคาและสต็อกของสาขานี้ตอนนี้ · ตัวที่หมดหรือแพ้ ระบบบอกและไม่ใส่</p>`;
};
const moreTab = c => {
  const p = SC.casePerson(c), m = c.who ? MORE[c.who] : null;
  return ui.kv([
    ['ผู้มีอาการ', `${esc(p.name)} · ${esc(p.rel)} · ${p.age} ปี`],
    ['น้ำหนัก ส่วนสูง', `${p.weight ? p.weight + ' กก.' : 'ไม่ได้ระบุ'}${m?.h ? ` · ${m.h} ซม.` : ''}`],
    ['โรคประจำตัว', m ? (m.dis.length ? m.dis.map(esc).join(', ') : 'ไม่มี') : 'ไม่ได้ระบุ'],
    ['แพ้ยา', `${ui.allergy(p)}<span class="small"> ${esc(p.allergySrc || '')}</span>`],
    ['แพ้อาหาร', esc(m?.food || 'ไม่ได้ระบุ')],
    ['ยาประจำ', esc(SC.medsTxt(p))],
    ['สมาชิก', esc(m?.member || 'ยังไม่เป็นสมาชิก')],
    ...(m?.pts != null ? [['แต้มสะสม', `${m.pts} แต้ม`]] : []),
    ['เบอร์', `${esc(p.phone || '08x-xxx-0000')} ${SC.isAdmin() || SC.isStaff() ? '' : `<button type="button" class="link small" data-a="phCase" data-v="${c.key}">ดูเบอร์เต็ม</button>`}`],
    ['ความยินยอม', esc(m?.consent || 'ยินยอมใช้ข้อมูลสุขภาพตอนเข้าคิว 18/10/2026')],
    ['รับทราบขั้นตอน', esc(SC.ackTxt(c))]
  ], { left: true });
};
const ciOv = () => {
  const { k, tab } = SC.S.ci, c = SC.CASES[k], p = SC.casePerson(c);
  return `<div class="scrim" data-a="ovClose"></div><div class="drawer" role="dialog" aria-modal="true" aria-labelledby="drT"><div class="drawer-h"><div class="grow"><h2 id="drT" class="h3" tabindex="-1">ข้อมูลของ${esc(p.first || p.name)}</h2><p class="small">${esc(p.name)}${SC.isFam(c) ? ` · บัญชี ${esc(c.acct)}` : ''} · การเปิดดูถูกบันทึก</p></div>${ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
    <div class="drawer-b">${ui.seg(TABS.map(([t, l]) => [`${k}|${t}`, l]), `${k}|${tab}`, { a: 'ciOpen', label: 'ข้อมูลลูกค้า' })}<div class="mt16">${tab === 'past' ? pastTab(c) : tab === 'buy' ? buyTab(c) : moreTab(c)}</div></div></div>`;
};
SC.act('ciOpen', t => { const [k, tab] = t.dataset.v.split('|'); SC.S.ci = { k, tab }; SC.openOv(ciOv); });
SC.act('ciAgain', t => {
  const [k, n] = t.dataset.v.split('|'), c = SC.CASES[k], b = buysOf(c)[+n]; if (!b) return;
  const o = SC.S.orders[k] || SC.seedOrder('empty', k);
  if (o.status !== 'draft') return SC.toast('ส่งรายการยาของเคสนี้แล้ว เพิ่มยาชุดเดิมไม่ได้', 'info');
  const added = [], skip = [];
  b.items.forEach(([s, q]) => {
    const it = prod(s); if (!it) return skip.push(`${s} ไม่มีในระบบแล้ว`);
    if (o.items.some(x => x.sku === s)) return skip.push(`${it.name} มีในรายการแล้ว`);
    if (!(it.stock > 0)) return skip.push(`${it.name} หมด`);
    o.items.push({ ...it, qty: Math.min(q, it.stock), how: it.how || '', lbl: SC.labelsOf(s)[0]?.id }); added.push(it.name);
  });
  SC.S.ov = null;
  SC.go('order', { st: k === 'kid' ? 'kid' : 'plan', p: { k } });
  SC.toast(`${added.length ? `เพิ่ม ${added.length} รายการจากชุดวันที่ ${b.at}` : 'ไม่ได้เพิ่มยา'}${skip.length ? ` · ไม่ได้ใส่: ${skip.join(', ')}` : ''} · ตรวจวิธีใช้และฉลากก่อนส่ง`, added.length ? 'plus' : 'info');
});

/* ---------- (2) บันทึกอาการรอบนี้ ---------- */
const COMMON = ['ไข้', 'ไอ', 'เจ็บคอ', 'น้ำมูก คัดจมูก', 'ปวดหัว', 'ปวดท้อง', 'ท้องเสีย', 'ผื่น คัน', 'นอนไม่หลับ'];
const chipBtn = (k, s, on, ro) => `<button type="button" class="chip sm" data-a="vrChip" data-v="${esc(k)}|${esc(s)}" aria-pressed="${on}"${ro ? ' disabled' : ''}>${esc(s)}</button>`;
const visitOf = c => { const S = SC.S; S.visit = S.visit || {}; return (S.visit[c.key] = S.visit[c.key] || { chips: [...(c.symptoms || []).filter(s => s !== 'ถามเรื่องยา')], extra: [], dur: '', meds: '', note: '', at: null }); };
SC.visitOf = visitOf;
SC.visitBox = (c, o = {}) => {
  if (c.night) return '';
  const v = visitOf(c), all = [...new Set([...v.chips, ...COMMON, ...v.extra])], ro = SC.isAdmin();
  const fld = (k, label, ph, ta) => `<div class="field vr-f"><label for="vr-${k}">${label}</label>${ta ? `<textarea id="vr-${k}" class="input" rows="2" data-vr="${k}" data-k="${c.key}" maxlength="500" placeholder="${esc(ph)}"${ro ? ' readonly' : ''}>${esc(v[k])}</textarea>` : `<input id="vr-${k}" class="input" data-vr="${k}" data-k="${c.key}" maxlength="${k === 'dur' ? 60 : 200}" value="${esc(v[k])}" placeholder="${esc(ph)}"${ro ? ' readonly' : ''}>`}</div>`;
  return `<div class="pt-sec vr" aria-label="บันทึกอาการรอบนี้"><div class="hrow"><p class="label">${ic('notebook-pen', 13, 2)} บันทึกอาการรอบนี้</p><kbd class="kbd" title="กด Alt+2 เพื่อไปช่องบันทึกอาการ">Alt+2</kbd><span class="sp"></span><span class="small" id="vrAt-${c.key}">${v.at ? `บันทึกแล้ว ${esc(v.at)}` : 'บันทึกอัตโนมัติ'}</span></div>
    <p class="small mt4">ผู้มีอาการ: ${SC.isFam(c) ? `คนในบ้าน (${esc(SC.casePerson(c).rel)})` : 'ตนเอง'} · ลูกค้าไม่เห็นบันทึกนี้</p>
    <div class="chips mt8" role="group" aria-label="อาการ">${all.map(s => chipBtn(c.key, s, v.chips.includes(s), ro)).join('')}</div>
    ${ro ? '' : `<input class="input sm mt8" id="vr-add" data-vr="add" data-k="${c.key}" maxlength="80" placeholder="พิมพ์อาการเพิ่ม แล้วกด Enter" aria-label="เพิ่มอาการ">`}
    ${fld('dur', 'เป็นมานานเท่าไร', 'เช่น 2 วัน')}${fld('meds', 'ยาที่ใช้อยู่ (เกี่ยวกับอาการนี้)', 'เช่น พาราเซตามอลที่บ้าน')}${fld('note', 'โน้ตเภสัชกร', 'สิ่งที่ประเมิน ตรวจ หรือแนะนำ', true)}</div>`;
};
const stamp = k => { const v = SC.S.visit[k]; v.at = SC.clockStr(); const n = document.getElementById('vrAt-' + k); if (n) n.textContent = `บันทึกแล้ว ${v.at}`; };
SC.act('vrChip', t => { const [k, s] = t.dataset.v.split('|'), v = SC.S.visit[k], on = !v.chips.includes(s); v.chips = on ? [...v.chips, s] : v.chips.filter(x => x !== s); t.setAttribute('aria-pressed', String(on)); stamp(k); });
document.addEventListener('input', e => { const f = e.target.dataset?.vr; if (!f || f === 'add') return; const v = SC.S.visit?.[e.target.dataset.k]; if (!v) return; v[f] = e.target.value; stamp(e.target.dataset.k); });
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || e.target.dataset?.vr !== 'add') return;
  e.preventDefault();
  const k = e.target.dataset.k, v = SC.S.visit?.[k], s = e.target.value.trim().replace(/\s+/g, ' '); if (!v || !s) return;
  if (!v.extra.includes(s) && !COMMON.includes(s) && !v.chips.includes(s)) v.extra.push(s);
  if (!v.chips.includes(s)) v.chips.push(s);
  const box = e.target.closest('.vr')?.querySelector('.chips'), b = box && [...box.querySelectorAll('button')].find(x => x.dataset.v === `${k}|${s}`);
  if (b) b.setAttribute('aria-pressed', 'true'); else box?.insertAdjacentHTML('beforeend', chipBtn(k, s, true));
  e.target.value = ''; stamp(k);
});
})();

/* ===== 62-order.js ===== */
/* =====================================================================
   62 · Group 3 (cont.): S303 build the medicine list. One order per case (S.orders[key]).
   Safety gates before sending: allergy must be known (แพ้ / ไม่แพ้ / ถามแล้วไม่ทราบ), no adult tablet for a child
   under 12, child dose inside 10-15 mg/kg, no disease names in the how-to text.
   Owner 21/10/2026: medicines are not matched against the allergy history in this phase. A read-only strip shows
   allergies, side effects and reaction reports; the pharmacist checks them.
   ===================================================================== */
(() => {
const { $, $$, esc, ic, ui } = SC;
const NOS = { smj: 'MT7K2Q9XR4A', kid: 'MT7K2Q9XR4A', ort: 'MT3H8W2KD7P', psr: 'MT9C4N6TB2M', new1: 'MT5R1J8VQ3E', on1: 'MT2F6L9PX8D' };
/* branch stock the search reads (mock) */
SC.CATALOG = [...SC.ORDER_ITEMS, ...Object.values(SC.MED), SC.kidPara(20),
  { sku: 'TW-00611', name: 'ยาแก้ไอ ชนิดน้ำ', qty: 1, unit: 'ขวด 60 มล.', type: 'ยาสามัญประจำบ้าน', price: 85, how: 'ครั้งละ 10 มล. วันละ 3 ครั้ง หลังอาหาร', stock: 12 },
  { sku: 'TW-30044', name: 'ยาแก้ปวด แอสไพริน 300 มก.', qty: 1, unit: 'แผง', type: 'ยาสามัญประจำบ้าน', price: 30, how: 'ครั้งละ 1 เม็ด หลังอาหารทันที เมื่อปวด', stock: 25, has: ['แอสไพริน'] },
  { sku: 'TW-00658', name: 'ยาแก้แพ้ ลอราทาดีน 10 มก.', qty: 1, unit: 'แผง', type: 'ยาอันตราย', price: 60, how: 'ครั้งละ 1 เม็ด วันละ 1 ครั้ง', stock: 0 },
  { sku: 'TW-00655', name: 'อะม็อกซีซิลลิน 500 มก.', qty: 2, unit: 'แผง', type: 'ยาอันตราย', price: 90, how: 'ครั้งละ 1 แคปซูล วันละ 3 ครั้ง หลังอาหาร ทานจนหมด', stock: 14, has: ['อะม็อกซีซิลลิน'] },
  { sku: 'TW-40210', name: 'ยาแก้ปวดทรามาดอล 50 มก.', qty: 1, unit: 'แผง', type: 'ยาควบคุมพิเศษ', price: 0, how: '', stock: 30, rx: true },
  /* B10: kept at 2-8 degrees (mock product) */
  { sku: 'TW-00977', name: 'จุลินทรีย์ชนิดแคปซูล (เก็บในตู้เย็น)', qty: 1, unit: 'กล่อง', type: 'ยาอันตราย', price: 290, how: 'รับประทานครั้งละ 1 แคปซูล วันละ 2 ครั้ง ก่อนอาหาร', stock: 5, cold: true, str: '1,000 ล้านตัวต่อแคปซูล', has: ['แลคโตบาซิลลัส'] }];
/* units the branch sells each medicine in (owner 20/10/2026: "S303 เลือกหน่วยได้ด้วยสิ"). Mock stock list, real one comes
   from the branch stock: [unit, what is inside, price, how many of the first unit]. The first unit is what the helper
   suggests and what the customer app shows (3 items ฿385), so the story stays the same until the pharmacist changes it */
SC.UNITS = {
  'TW-10234': [['กล่อง', '2 แผง 16 เม็ด', 120, 1], ['แผง', '8 เม็ด', 65, 0.5]],
  'TW-00512': [['แผง', '10 เม็ด', 40, 1], ['เม็ด', '', 4, 0.1], ['กล่อง', '10 แผง', 380, 10]],
  'TW-00733': [['แผง', '10 เม็ด', 35, 1], ['เม็ด', '', 4, 0.1], ['กล่อง', '10 แผง', 330, 10]],
  'TW-00418': [['แผง', '10 เม็ด', 25, 1], ['เม็ด', '', 3, 0.1], ['กระปุก', '100 เม็ด', 220, 10]],
  'TW-05102': [['กล่อง', '6 แผ่น', 89, 1], ['แผ่น', '', 16, 1 / 6]],
  'TW-30044': [['แผง', '10 เม็ด', 30, 1], ['เม็ด', '', 3, 0.1]],
  'TW-00658': [['แผง', '10 เม็ด', 60, 1], ['เม็ด', '', 6, 0.1]],
  'TW-00655': [['แผง', '10 แคปซูล', 90, 1], ['แคปซูล', '', 9, 0.1]]
};
const unitsOf = it => SC.UNITS[it.sku] || [[it.unit, '', it.price, 1]];
const unitOf = it => unitsOf(it).find(u => u[0] === it.unit) || unitsOf(it)[0];
/* stock is counted in the first unit; a smaller unit has more of it */
const availOf = it => Math.floor(it.stock / unitOf(it)[3] + 1e-9);
SC.unitOf = unitOf;
SC.availOf = availOf;
/* the store's existing drug label (BIGYA Label: one label per SKU, 90 x 65 mm, fields from its product_labels table).
   Owner 20/10/2026: "เดี๋ยวผมเพิ่มข้อมูลฉลากยาเดิมมาใส่ให้จาก ss อันนี้ติดไว้ก่อน" = real data comes from SS later.
   These are sample rows so the layout is ready; SKUs without a row show that the data is still to come */
SC.LABEL = {
  'TW-00512': { trade: 'พาราเซตามอล 500 มก. [แผง 10 เม็ด]', generic: 'Paracetamol 500 mg', how: 'รับประทานครั้งละ 1 เม็ด ทุก 4 ถึง 6 ชั่วโมง เมื่อมีไข้หรือปวด ไม่เกิน 8 เม็ดต่อวัน', ind: 'ลดไข้ บรรเทาปวด', warn: 'ห้ามใช้เกินขนาดที่ระบุ ระวังในผู้ที่ดื่มสุราเป็นประจำ', store: 'เก็บที่อุณหภูมิห้อง พ้นแสงแดด' },
  'TW-10234': { trade: 'ยาอมบรรเทาอาการเจ็บคอ [กล่อง 16 เม็ด]', generic: 'Amylmetacresol 0.6 mg + Dichlorobenzyl alcohol 1.2 mg', how: 'อมครั้งละ 1 เม็ด ทุก 2 ถึง 3 ชั่วโมง ไม่เกิน 8 เม็ดต่อวัน', ind: 'บรรเทาอาการเจ็บคอ', warn: 'ไม่ใช้ในเด็กอายุต่ำกว่า 6 ปี', store: 'เก็บที่อุณหภูมิห้อง' },
  'TW-20871': { trade: 'สเปรย์พ่นคอ [ขวด 15 มล.]', generic: 'Benzydamine HCl 0.15%', how: 'พ่นในลำคอครั้งละ 2 ถึง 4 ครั้ง วันละ 3 ถึง 4 ครั้ง', ind: 'บรรเทาอาการเจ็บคอ คอแห้ง', warn: 'อาจรู้สึกชาในปากชั่วคราว', store: 'เก็บที่อุณหภูมิห้อง' },
  'TW-00733': { trade: 'บรอมเฮกซีน 8 มก. [แผง 10 เม็ด]', generic: 'Bromhexine HCl 8 mg', how: 'รับประทานครั้งละ 1 เม็ด วันละ 3 ครั้ง หลังอาหาร เช้า กลางวัน เย็น', ind: 'ละลายเสมหะ', warn: 'ดื่มน้ำมาก ๆ ระหว่างใช้ยา', store: 'เก็บที่อุณหภูมิห้อง' },
  'TW-00418': { trade: 'คลอร์เฟนิรามีน 4 มก. [แผง 10 เม็ด]', generic: 'Chlorpheniramine maleate 4 mg', how: 'รับประทานครั้งละ 1 เม็ด วันละ 3 ครั้ง หลังอาหาร', ind: 'บรรเทาอาการแพ้ ลดน้ำมูก', warn: 'อาจทำให้ง่วง ห้ามขับขี่หรือทำงานกับเครื่องจักร', store: 'เก็บที่อุณหภูมิห้อง' },
  'TW-00655': { trade: 'อะม็อกซีซิลลิน 500 มก. [แผง 10 แคปซูล]', generic: 'Amoxicillin 500 mg', how: 'รับประทานครั้งละ 1 แคปซูล วันละ 3 ครั้ง หลังอาหาร ทานติดต่อกันจนหมด', ind: 'ยาปฏิชีวนะ ใช้ตามที่เภสัชกรแนะนำ', warn: 'ห้ามใช้ในผู้ที่แพ้ยากลุ่มเพนิซิลลิน ทานให้หมดแม้อาการดีขึ้น', store: 'เก็บที่อุณหภูมิห้อง พ้นความชื้น' },
  'TW-00530': { trade: 'พาราเซตามอลชนิดน้ำ 120 มก./5 มล. [ขวด 60 มล.]', generic: 'Paracetamol 120 mg/5 ml', how: 'รับประทานตามน้ำหนักตัว ทุก 4 ถึง 6 ชั่วโมง เมื่อมีไข้ เขย่าขวดก่อนใช้', ind: 'ลดไข้ บรรเทาปวด สำหรับเด็ก', warn: 'ใช้ช้อนหรือหลอดตวงที่ให้มาเท่านั้น', store: 'เก็บที่อุณหภูมิห้อง เปิดแล้วใช้ภายใน 1 เดือน' },
  'TW-00977': { trade: 'จุลินทรีย์ชนิดแคปซูล [กล่อง 10 แคปซูล]', generic: 'Bifidobacterium bifidum + Lactobacillus acidophilus', how: 'รับประทานครั้งละ 1 แคปซูล วันละ 2 ครั้ง ก่อนอาหาร', ind: 'ปรับสมดุลลำไส้ ช่วยลดอาการถ่ายเหลว', warn: 'ห้ามรับประทานพร้อมน้ำร้อน', store: 'เก็บในตู้เย็น 2 ถึง 8 องศา ห้ามแช่แข็ง' }
};
/* the drug label of one line of the order: the picked label of the shop's label list (63-labels.js), folded to what it
   says about how to use it. Opened, it is the label's name and fields with quick edit; the real sticker (90 x 65 mm)
   shows only to print (owner 20/10). A child: the label is the adult dose, so it is never copied, the weight box decides */
/* words of the label that are not in what is written now get a mark, so a change of a few words is easy to see.
   When most of it differs, marks would only be noise: the text is shown plain */
const diffHow = (lbl, now) => {
  const have = new Set(String(now || '').split(/\s+/)), ws = String(lbl).split(/(\s+)/), off = w => w.trim() && !have.has(w);
  if (!String(now || '').trim() || ws.filter(off).length > 4) return esc(lbl);
  return ws.map(w => off(w) ? `<mark class="lbl-dif">${esc(w)}</mark>` : esc(w)).join('');
};
const lblTrade = SC.lblTrade = (l, it) => { const u = unitOf(it); return l.trade.replace(/\[[^\]]*\]\s*$/, `[${it.unit}${u[1] ? ' ' + u[1] : ''}]`); };
const LBL_SRC = v => (v.src === 'bigya' ? 'ฉลากเดิมของร้าน (ข้อมูล 06/05/2025)' : v.src === 'added' ? `ฉลากที่เพิ่มโดย ${v.by} ${v.at}` : 'ข้อมูลตัวอย่าง ยาตัวนี้ยังไม่มีในระบบฉลาก') + (v.ed ? ` · แก้โดย ${v.ed.by} ${v.ed.at}` : '');
const lkOf = it => `${keyFor(SC.cur())}:${it.sku}`;
function labelBox(it, i, p) {
  const lk = lkOf(it), ls = SC.labelsOf(it.sku), l = SC.labelOf(it), open = !!SC.S.lblOpen?.[lk], kid = p.child || p.age < 12;
  const can = SC.canLabel();
  if (!l) return `<div class="oi-lbl none">${ic('file-text', 15, 2)}<p class="grow"><b>ฉลากยา:</b> ยาตัวนี้ยังไม่มีฉลากในระบบ</p>${can ? ui.btn('เพิ่มฉลาก', { kind: 'secondary', sm: true, a: 'lblNew', v: i, icon: 'plus' }) : '<span class="small">ให้เภสัชกรเพิ่ม</span>'}</div>`;
  /* several labels: none is taken for granted until the pharmacist picks (real user 20/10 got "เริมที่ปาก" for a skin case) */
  if (ls.length > 1 && !it.lbl) return `<div class="oi-lbl need"><div class="oi-lbl-h"><p class="grow lbl-which">${ic('file-text', 15, 2)}<b>ฉลาก:</b> ยังไม่ได้เลือก · ยานี้มีฉลาก ${ls.length} แบบตามอาการ</p><div class="oi-lbl-a">${ui.btn(`เลือกฉลาก (${ls.length} แบบ)`, { kind: 'secondary', sm: true, a: 'lblPick', v: i, icon: 'file-text' })}</div></div></div>`;
  const langs = Object.keys(l.v.tx), lang = langs.includes(SC.S.lblLang?.[lk]) ? SC.S.lblLang[lk] : 'th', th = lang === 'th';
  const lt = l.v.tx[lang] || l.v.tx.th, ln = SC.LABEL_HEAD[lang][0];
  /* "ใช้ข้อความนี้" takes the language on show, so a customer who reads English gets English in the app (real user 20/10) */
  const undo = SC.S.howUndo?.k === lk ? `<button type="button" class="link small" data-a="howUndo" data-v="${esc(lk)}">ย้อนข้อความเดิม</button>` : '';
  /* R3B-16: a medicine made for children keeps its weight-based text; only an adult label gets the adult warning */
  const use = kid ? `<span class="small oi-lbl-kid">${ic('baby', 13, 2)}${it.kidDose ? 'วิธีใช้ตามน้ำหนักอยู่ในช่องวิธีใช้' : 'ฉลากเป็นขนาดผู้ใหญ่ ใช้ขนาดตามน้ำหนัก'}</span>`
    : it.how.trim() === lt.how ? `<span class="small ok-t oi-lbl-ok">${ic('check', 13, 2.4)}ใช้ข้อความนี้อยู่</span>${undo}`
    : ui.btn(th ? 'ใช้ข้อความนี้' : `ใช้ข้อความ${ln}`, { kind: 'secondary', sm: true, a: 'useLabel', v: i, icon: 'copy' });
  const dif = it.how.trim() && it.how.trim() !== lt.how && /lbl-dif/.test(diffHow(lt.how, it.how));
  const pick = ls.length > 1 || can ? ui.btn(ls.length > 1 ? `เลือกฉลาก (${ls.length} แบบ)` : 'แก้หรือเพิ่มฉลาก', { kind: 'ghost', sm: true, a: 'lblPick', v: i, icon: 'file-text' }) : '';
  const head = `<div class="oi-lbl-h"><p class="grow lbl-which"><b>ฉลาก:</b> ${esc(l.v.name)}${ls.length > 1 ? ` <span class="small">(1 ใน ${ls.length} แบบ)</span>` : ''}${l.v.ed ? ` <span class="small">แก้โดย ${esc(l.v.ed.by)} ${esc(l.v.ed.at)}</span>` : ''}</p><div class="oi-lbl-a">${pick}<button type="button" class="btn ghost sm oi-lbl-t" data-a="lblTog" data-v="${esc(lk)}" aria-expanded="${open}"><span>${open ? 'ซ่อนฉลาก' : 'ดูฉลาก'}</span>${ic('chevron-down', 14, 2, 'ic chev')}</button></div></div>
    <div class="oi-lbl-h"><p class="grow"${dif ? ' title="คำที่ขีดเส้น = ต่างจากวิธีใช้ที่เขียนอยู่"' : ''}>${ic('file-text', 15, 2)}<b>วิธีใช้ตามฉลาก${th ? '' : ` (${esc(ln)})`}:</b> ${diffHow(lt.how, it.how)}</p><div class="oi-lbl-a">${use}</div></div>`;
  if (!open) return `<div class="oi-lbl">${head}</div>`;
  /* item 77 (owner 20/10): the sticker prints the label's own text, so a how-to written only for this customer is flagged */
  const hw = !kid && it.how.trim() && it.how.trim() !== l.v.tx.th.how;
  return `<div class="oi-lbl on" data-lblbox>${head}
    ${SC.lblLangSeg(l.v, lang, 'lblLang', lk)}
    ${SC.lblBody(l.v, lang, { printA: 'lblPrintLine', printV: `${i}|${lang}`, acts: can ? ui.btn('เพิ่มฉลากใหม่', { kind: 'ghost', sm: true, a: 'lblNew', v: i, icon: 'plus' }) : '' })}
    <div class="lbl-meas" aria-hidden="true">${SC.sticker(l.v, lang, it)}</div>
    <p class="small warn-t oi-lbl-src lbl-cut" hidden>${ic('triangle-alert', 13, 2)}<span></span></p>
    ${hw ? `<p class="small warn-t oi-lbl-src">${ic('triangle-alert', 13, 2)}วิธีใช้ที่ลูกค้าเห็นในแอปต่างจากฉลากที่พิมพ์ · ให้ตรงกันด้วย "ใช้ข้อความนี้" หรือแก้ฉลาก หรือเพิ่มฉลากใหม่</p>` : ''}
    <p class="small oi-lbl-src">${ic('info', 13, 2)}${esc(LBL_SRC(l.v))} · ฉลากที่พิมพ์ใช้ข้อความของฉลากนี้จากเมนูฉลากยา ขนาดจริง 90 x 65 มม.</p></div>`;
}
const keyFor = ctx => ctx.p.k || (ctx.st === 'kid' ? 'kid' : null) || SC.S.activeCase || 'smj';
SC.orderOf = ctx => SC.S.orders[keyFor(ctx)];
const total = o => o.items.reduce((s, i) => s + i.price * i.qty, 0);
SC.orderTotal = total;
/* mirror = the order the customer app shows (C303 / C308 / C309): 3 items ฿385 */
SC.seedOrder = (st, key, mirror) => {
  const c = SC.CASES[key];
  const items = (st === 'empty' ? [] : st === 'cold' ? [SC.CATALOG.find(i => i.sku === 'TW-00977')] : mirror ? SC.ORDER_ITEMS : SC.casePlan(c).items).map(i => ({ ...i, lbl: SC.labelsOf(i.sku)[0]?.id }));
  return (SC.S.orders[key] = { key, items, q: st === 'search' ? 'ยาแก้' : '', status: 'draft', no: NOS[key] || 'MT8H3K5W1QZ', sent: null, paid: null, ready: null, handed: null, booked: false });
};
const order = ctx => { const key = keyFor(ctx), o = SC.S.orders[key]; if (o && !SC.S._reseed) return o; return SC.seedOrder(SC.S._reseed ? ctx.st : 'empty', key, SC.S._reseed && ctx.st === 'confirm' && key === 'smj'); };
SC.orderOf = order;
/* the child dose is ONE value: the box and the ml written in "วิธีใช้" (what the customer reads) must agree,
   and the over-dose check reads both, so typing 20 มล. in the text can never pass */
const textMl = it => [...String(it.how || '').matchAll(/([\d.]+)\s*มล/g)].map(m => +m[1]).filter(n => n > 0);
const perKg = (it, p, ml = it.kidDose.ml) => SC.r2(ml * it.kidDose.mgPerMl / (p.weight || it.kidDose.w));
const maxMl = it => Math.max(it.kidDose.ml, ...textMl(it));
const over = (o, p) => o.items.filter(i => i.kidDose && perKg(i, p, maxMl(i)) > 15);
const doseOff = it => { const t = textMl(it); return !t.length ? 'none' : t.some(n => n !== it.kidDose.ml) ? 'diff' : ''; };
const kidBox = (it, p) => {
  if (!it.kidDose) return '';
  const w = p.weight || it.kidDose.w, ml = it.kidDose.ml, mg = SC.r2(ml * it.kidDose.mgPerMl), k = perKg(it, p), lv = perKg(it, p, maxMl(it)) > 15 ? 'bad' : k < 10 ? 'warn' : 'ok';
  return `<div class="oi-dose ${lv}" role="status">${ic(lv === 'ok' ? 'circle-check' : lv === 'bad' ? 'octagon-alert' : 'triangle-alert', 16, 2)}<div class="grow"><b>ขนาดยาตามน้ำหนัก ${w} กก.</b>
    <span>แนะนำ 10-15 มก./กก./ครั้ง = ${w * 10}-${w * 15} มก. · ตั้งไว้ครั้งละ <input class="input dose-in" type="number" min="1" max="15" step="0.5" value="${ml}" data-in="dose" aria-label="ปริมาณต่อครั้ง (มล.)"> มล. = ${mg} มก. (${k} มก./กก.)</span>
    ${lv === 'bad' ? '<span class="danger-t"><b>เกินขนาด ส่งรายการไม่ได้</b> ลดปริมาณให้อยู่ในช่วงก่อน</span>' : lv === 'warn' ? '<span>ต่ำกว่าช่วงที่แนะนำ อาจลดไข้ได้ไม่ดี ตรวจอีกครั้ง</span>' : ''}
    ${doseOff(it) === 'diff' ? `<span class="danger-t"><b>วิธีใช้เขียน ${textMl(it).join(', ')} มล. ไม่ตรงกับกล่อง ${ml} มล.</b> แก้ให้ตรงกันก่อนส่ง</span>` : doseOff(it) === 'none' ? '<span class="danger-t"><b>วิธีใช้ยังไม่บอกปริมาณต่อครั้ง</b> เขียน เช่น "ครั้งละ 10 มล."</span>' : ''}</div>${ui.tag(lv === 'ok' ? 'อยู่ในช่วง' : lv === 'bad' ? 'เกินขนาด' : 'ต่ำกว่าช่วง', lv === 'ok' ? 'ok' : lv === 'bad' ? 'danger' : 'warn', { icon: lv === 'ok' ? 'check' : lv === 'bad' ? 'octagon-alert' : 'triangle-alert' })}</div>`;
};
function itemRow(it, i, p, flash) {
  const dx = SC.dxHits(it.how), adult = adultForKid(it, p), blank = !String(it.how || '').trim();
  return `<div class="oi${adult ? ' clash' : ''}${flash === it.sku ? ' flash' : ''}" id="oi-${it.sku}">
    <div class="oi-h"><span class="oi-pic" role="img" aria-label="รูปยา ${esc(it.name)}">${ic(it.cold ? 'snowflake' : 'pill', 18, 1.6)}</span><b class="grow">${esc(it.name)}</b><b class="oi-p num">${SC.money(it.price * it.qty)}</b>${ui.ib('trash', 'เอาออก', { a: 'rmItem', v: i, cls: 'danger' })}</div>
    <div class="oi-m">${ui.cls(it.type)}${it.cold ? ui.tag('ยาเก็บเย็น', 'line', { icon: 'snowflake' }) : ''}</div>
    <div class="oi-q"><div class="qty" role="group" aria-label="จำนวน ${esc(it.name)}">${ui.ib('minus', 'ลดจำนวน', { a: 'qty', v: i + ':-1', disabled: it.qty <= 1 })}<span class="num">${it.qty}</span>${ui.ib('plus', 'เพิ่มจำนวน', { a: 'qty', v: i + ':1', disabled: it.qty >= availOf(it) })}</div>
      ${unitsOf(it).length > 1 ? `<label class="sr" for="unit${i}">หน่วยของ ${esc(it.name)}</label><select id="unit${i}" class="input unit-sel" data-in="unit" data-i="${i}">${unitsOf(it).map(([u, n, pr]) => `<option value="${esc(u)}"${u === it.unit ? ' selected' : ''}>${esc(u)}${n ? ` (${esc(n)})` : ''} · ${SC.money(pr)}</option>`).join('')}</select>` : `<span class="unit-one">${esc(it.unit)}${unitOf(it)[1] ? ` (${esc(unitOf(it)[1])})` : ''}</span>`}
      <span class="small oi-stk">คงเหลือ ${availOf(it)} ${esc(it.unit)}</span></div>
    ${adult ? `<div class="oi-clash" role="alert">${ic('baby', 16, 2)}<div class="grow"><b>ยาขนาดผู้ใหญ่ ลูกค้าเป็นเด็ก${p.age ? ` ${p.age} ปี` : ''}${p.weight ? ` ${p.weight} กก.` : ''}</b><span>จ่ายยาเม็ดขนาดผู้ใหญ่ให้เด็กต่ำกว่า 12 ปีผ่านช่องทางนี้ไม่ได้ · ใช้ชนิดน้ำที่มีช่องขนาดยาตามน้ำหนัก</span></div>${ui.btn('เอาออก', { kind: 'danger', sm: true, a: 'rmItem', v: i })}</div>` : ''}
    <div class="field${dx.length ? ' err' : ''}"><label class="oi-l" for="how${i}">วิธีใช้ <span class="muted">(ลูกค้าเห็นและพิมพ์บนฉลาก)</span></label><textarea id="how${i}" class="input oi-how" rows="1" data-in="how" data-i="${i}"${dx.length ? ' aria-invalid="true"' : ''}>${esc(it.how)}</textarea>${blank && !dx.length ? `<p class="small oi-hint">${ic('info', 13, 2)}<span>ยังไม่ได้เขียน · เลือกฉลากแล้วกด "ใช้ข้อความนี้" หรือพิมพ์เอง</span></p>` : ''}${dx.length ? `<p class="err-t">${ic('circle-x', 14, 2)}<span>มีคำที่เป็นชื่อโรค: ${esc(dx.join(', '))}</span></p>` : ''}</div>
    ${kidBox(it, p)}${labelBox(it, i, p)}${infoBox(it, i)}</div>`;
}
/* B5: what the dispensing record keeps for this line. Folded to one line when complete; open (and required) when the
   medicine has no label and no product data, so it must be typed */
const INF = [['gen', 'ชื่อสามัญ', 'เช่น Paracetamol'], ['str', 'ความแรง', 'เช่น 500 mg'], ['ind', 'ข้อบ่งใช้', 'ใช้บรรเทาอาการอะไร'], ['warn', 'คำเตือน', 'ถ้ามี']];
function infoBox(it, i) {
  if (!SC.isDrug(it)) return '';
  const d = SC.drugInfo(it), miss = SC.infoMiss(it), lk = lkOf(it), open = miss.length || SC.S.infOpen?.[lk];
  const src = d.src === 'label' ? `เติมจากฉลาก "${d.lbl}"` : d.src === 'master' ? 'เติมจากข้อมูลสินค้า' : 'ยาตัวนี้ยังไม่มีฉลาก พิมพ์เอง';
  if (!open) return `<div class="oi-inf"><p class="grow">${ic('clipboard-check', 14, 2)}<b>ข้อมูลยา:</b> ${esc(d.gen)} · ${esc(d.str)} · ${esc(d.ind)}${d.warn ? ` <span class="small">· คำเตือน ${esc(d.warn)}</span>` : ''}</p><button type="button" class="link small" data-a="infTog" data-v="${esc(lk)}">แก้</button></div>`;
  return `<div class="oi-inf on${miss.length ? ' need' : ''}"><div class="hrow"><p class="grow"><b>ข้อมูลยาในบันทึกการจ่ายยา</b> <span class="small">${esc(src)} · แก้ได้</span></p>${miss.length ? '' : `<button type="button" class="link small" data-a="infTog" data-v="${esc(lk)}">เสร็จ</button>`}</div>
    <div class="oi-inf-g">${INF.map(([k, l, ph]) => `<label class="oi-inf-f${k === 'ind' || k === 'warn' ? ' w' : ''}"><span>${l}${k === 'warn' ? ' <span class="opt-t">(ถ้ามี)</span>' : '<span class="req" aria-hidden="true">*</span>'}</span><input class="input${k !== 'warn' && !String(d[k] || '').trim() ? ' bad' : ''}" data-in="inf" data-i="${i}" data-f="${k}" data-lk="${esc(lk)}" value="${esc(d[k] || '')}" placeholder="${esc(ph)}"${k !== 'warn' ? ' aria-required="true"' : ''}></label>`).join('')}</div>
    ${miss.length ? `<p class="small warn-t mt4">${ic('info', 13, 2)}ใส่${esc(miss.join(' '))}ก่อนส่งรายการ</p>` : ''}</div>`;
}
SC.act('infTog', t => { const S = SC.S, k = t.dataset.v; S.infOpen = { ...(S.infOpen || {}), [k]: !S.infOpen?.[k] }; SC.refresh(); });
function results(o, p, act = 'addItem') {
  const q = o.q.trim(); if (!q) return '';
  const ql = q.toLowerCase(), hay = i => [i.name, i.sku, ...(i.has || []), ...SC.labelsOf(i.sku).flatMap(v => [v.tx.th.trade, v.tx.th.generic, v.tx.en?.trade])].filter(Boolean).join(' ').toLowerCase();
  const r = SC.CATALOG.filter(i => hay(i).includes(ql)).slice(0, 6);
  return `<div class="sr-list" role="listbox" aria-label="ผลค้นหา">${r.length ? r.map(i => {
    const po = SC.prodOff?.(i.sku), off = i.rx || !i.stock || !!po, inList = o.items.some(x => x.sku === i.sku);
    return `<div class="sr-i${off ? ' off' : ''}" role="option" aria-disabled="${off}"><div class="grow"><b>${esc(i.name)}</b><div class="hrow wrap mt4">${ui.cls(i.type)}<span class="small mono">${esc(i.sku)}</span>${i.rx ? '<span class="small danger-t">ต้องมีใบสั่งแพทย์ สั่งผ่านช่องทางนี้ไม่ได้</span>' : po ? `<span class="small warn-t">ร้านพักขาย: ${esc(po.why)} (${esc(po.by)} ${esc(po.at)})</span>` : !i.stock ? '<span class="small warn-t">หมดที่สาขานี้</span>' : `<span class="small">คงเหลือ ${i.stock}</span>`}</div></div>
      ${i.price ? `<span class="num">${SC.money(i.price)}</span>` : ''}${ui.btn(inList ? 'อยู่ในรายการแล้ว' : 'เพิ่ม', { kind: 'secondary', sm: true, a: act, v: i.sku, disabled: off || inList, icon: inList ? 'check' : 'plus' })}</div>`;
  }).join('') : `<p class="small sr-none">${ui.emptyArt('search')}<span>ไม่พบ "${esc(q)}" ในสต๊อก${esc(SC.branch().name)} ลองค้นด้วยชื่อสามัญหรือรหัสสินค้า</span></p>`}</div>`;
}
/* QA 20/10: under 12 = only medicines with a weight dose box or no dose strength (gel, saline, ORS, lotion).
   A tablet or capsule with a strength in มก. is an adult dose and blocks the send (owner 20/10, item 57) */
const isKid = p => !!p.child || (p.age && p.age < 12);
const adultForKid = (it, p) => isKid(p) && !it.kidDose && /\d\s*มก\./.test(it.name) && !/มล\./.test(it.name);
SC.algUnknown = p => !(p.allergies || []).length && !['none', 'asked'].includes(p.allergyState);
const blockReason = (o, p) => {
  if (!o.items.length) return { why: 'เพิ่มยาอย่างน้อย 1 รายการก่อน' };
  if (SC.algUnknown(p)) return { why: `ยังไม่รู้ว่า ${p.name} แพ้ยาไหม ถามและบันทึกแพ้ยาก่อนส่ง`, alg: true };
  const ad = o.items.filter(i => adultForKid(i, p));
  if (ad.length) return { why: `ยาขนาดผู้ใหญ่ ใช้กับเด็กไม่ได้: ${ad.map(i => i.name).join(', ')} · เอาออกแล้วเลือกชนิดน้ำตามน้ำหนัก` };
  if (over(o, p).length) return { why: 'ขนาดยาเด็กเกินช่วงที่แนะนำ ลดปริมาณก่อนส่ง' };
  const off = o.items.find(i => i.kidDose && doseOff(i));
  if (off) return { why: doseOff(off) === 'none' ? 'วิธีใช้ของยาเด็กต้องบอกปริมาณต่อครั้งเป็น มล.' : 'ตัวเลข มล. ในวิธีใช้ไม่ตรงกับกล่องขนาดยา แก้ให้ตรงกันก่อนส่ง' };
  const np = o.items.filter(i => SC.labelsOf(i.sku).length > 1 && !i.lbl);
  if (np.length) return { why: `เลือกฉลากของ ${np.map(i => i.name).join(', ')} ก่อนส่ง ยานี้มีฉลากหลายแบบ` };
  const ni = o.items.filter(i => SC.infoMiss(i).length);
  if (ni.length) return { why: `ใส่ข้อมูลยาของ ${ni.map(i => i.name).join(', ')} ก่อนส่ง: ${SC.infoMiss(ni[0]).join(' ')}` };
  const blank = o.items.filter(i => !String(i.how || '').trim());
  if (blank.length) return { why: `เขียนวิธีใช้ของ ${blank.map(i => i.name).join(', ')} ก่อนส่ง ลูกค้าต้องเห็นวิธีใช้ทุกตัว` };
  const dx = SC.dxHits(o.items.map(i => i.how).join(' '));
  if (dx.length) return { why: `วิธีใช้มีคำที่เป็นชื่อโรค: ${dx.join(', ')}` };
  if (total(o) < 20) return { why: 'ยอดขั้นต่ำในการชำระ ฿20' };
  return null;
};
SC.orderBlock = blockReason;
/* owner 21/10/2026: "ยังไม่ทำระบบนี้ เอาไว้เฟสถัดไป เพราะต้องทำ data ข้อมูลยาเยอะมาก". Nothing is matched against the
   medicines in the list and nothing blocks the send: the history is shown here, read only, the pharmacist checks it */
const algStrip = (c, hi) => {
  const p = SC.casePerson(c), pk = SC.pkey(c), sfx = SC.sfxOf(pk), rep = SC.adrOpen(pk), rm = SC.algRemoved(pk);
  const li = (icn, k, v) => `<li>${ic(icn, 14, 2)}<b>${k}</b><span>${v}</span></li>`;
  return `<section class="ord-alg${hi ? ' hi' : ''}" id="ordAlg" aria-label="ประวัติแพ้ยาและอาการจากยา">
    <div class="hrow"><p class="label">ประวัติแพ้ยาและอาการจากยา</p><span class="sp"></span><span class="small">ดูอย่างเดียว</span></div>
    <ul class="ord-alg-l mt8">${li('shield-alert', 'แพ้ยา', `${ui.allergy(p)}${p.allergySrc ? `<span class="small">${esc(p.allergySrc)}</span>` : ''}`)}
      ${li('pill', 'ผลข้างเคียง', sfx.length ? esc(sfx.map(x => `${x.sym} จาก${x.ing} (${x.at})`).join(', ')) : '<span class="muted">ไม่มีบันทึก</span>')}
      ${li('triangle-alert', 'รายงานอาการ', rep ? `<span>${esc(`${rep.sym.join(', ')} หลังใช้${rep.drug} · แจ้ง ${rep.at} · ยังไม่ได้ตอบ`)}</span>${ui.btn('ดูรายงาน', { kind: 'secondary', sm: true, go: 'adr', st: rep.severe ? 'severe' : 'new' })}` : '<span class="muted">ไม่มีรายงานที่ค้างตอบ</span>')}
      ${rm.length ? li('history', 'เคยลบประวัติแพ้', esc(rm.map(x => `${x.removed.join(', ')} ลบเมื่อ ${x.at} โดย ${x.by}`).join(' · '))) : ''}</ul>
    <p class="small mt8 ord-alg-n">${ic('info', 13, 2)}<span>เภสัชกรตรวจเองก่อนสั่งยา · ระบบไม่เทียบยาในรายการกับประวัตินี้ และไม่ห้ามส่ง</span></p></section>`;
};
/* ---------- the chat beside the medicine list (S303) ---------- */
const miniChat = c => `<div class="ord-chat"><div class="ws-mh"><b>แชท</b><span class="small">${esc(SC.casePerson(c).first || SC.casePerson(c).name)}</span><span class="sp"></span><kbd class="kbd" title="กด Alt+1 เพื่อไปช่องพิมพ์">Alt+1</kbd></div>
  <div class="thread" id="thread" data-k="${c.key}" aria-live="polite">${SC.thread(c, SC.chatOf(c.key))}</div>${SC.composer(c, { compact: true })}</div>`;

/* ---------- the medicine list beside the chat (S301 chat, S302 video): search, add, quantity, remove without leaving
   the conversation · how-to-use, label and unit are written on S303 ---------- */
const flagsOf = (it, p) => [
  adultForKid(it, p) ? ui.tag('ขนาดผู้ใหญ่', 'danger', { icon: 'baby' }) : '',
  SC.labelsOf(it.sku).length > 1 && !it.lbl ? '<span class="small warn-t">ยังไม่เลือกฉลาก</span>' : '',
  it.cold ? ui.tag('ยาเก็บเย็น', 'line', { icon: 'snowflake' }) : '',
  SC.infoMiss(it).length ? '<span class="small warn-t">ยังไม่ใส่ข้อมูลยา</span>' : '',
  String(it.how || '').trim() ? '' : '<span class="small muted">ยังไม่ใส่วิธีใช้</span>'].join('');
SC.medPanel = c => {
  const o = SC.S.orders[c.key], p = SC.casePerson(c), items = o?.items || [], q = SC.S.mpQ?.[c.key] || '';
  const head = `<div class="ws-mh mp-h"><b>รายการยา</b>${items.length ? `<span class="small">${items.length} รายการ</span>` : ''}<span class="sp"></span><kbd class="kbd" title="กด Alt+3 เพื่อไปช่องค้นยา">Alt+3</kbd></div>`;
  if (o && o.status !== 'draft') return `${head}<div class="mp-b"><div class="mp-e">${ic('send', 22, 1.8)}<p><b>ส่งรายการแล้ว</b> ${SC.money(total(o))}</p><p class="small">${esc(o.no)} · ${o.status === 'paid' ? 'ชำระแล้ว' : o.status === 'sent' ? 'รอลูกค้าชำระ' : 'ยกเลิกหรือหมดเวลา'}</p></div></div>
    <div class="mp-ft">${ui.btn('ดูการชำระเงิน', { kind: 'secondary', block: true, go: 'pay', st: o.status === 'paid' ? (o.paid?.recv || 'pickup') : o.status === 'sent' ? 'wait' : 'expired', p: { k: c.key }, icon: 'receipt' })}</div>`;
  const b = items.length ? blockReason(o, p) : null;
  return `${head}
    <div class="mp-s"><div class="search grow">${ic('search', 16, 2)}<label class="sr" for="mq">ค้นยาเพื่อเพิ่มในรายการ</label><input id="mq" class="input" type="search" placeholder="ค้นชื่อยา ชื่อสามัญ หรือรหัส" value="${esc(q)}" autocomplete="off" data-k="${c.key}"></div>${ui.ib('scan-barcode', 'สแกนบาร์โค้ด', { a: 'scan' })}</div>
    <div id="mqBox" class="mp-r">${results({ key: c.key, items, q }, p, 'mpAdd')}</div>
    <div class="mp-b">${items.length ? `<ul class="mp-l">${items.map((it, i) => `<li class="mp-it${adultForKid(it, p) ? ' bad' : ''}${SC.S.mpFlash === it.sku ? ' flash' : ''}" aria-live="polite"><div class="mp-n"><b>${esc(it.name)}</b>${ui.ib('trash', 'เอาออก ' + it.name, { a: 'mpRm', v: i, cls: 'danger' })}</div>
        <div class="mp-q"><div class="qty" role="group" aria-label="จำนวน ${esc(it.name)}">${ui.ib('minus', 'ลดจำนวน', { a: 'qty', v: i + ':-1', disabled: it.qty <= 1 })}<span class="num">${it.qty}</span>${ui.ib('plus', 'เพิ่มจำนวน', { a: 'qty', v: i + ':1', disabled: it.qty >= availOf(it) })}</div><span class="small">${esc(it.unit)}</span><span class="sp"></span><b class="num">${SC.money(it.price * it.qty)}</b></div>
        <div class="hrow wrap mp-f">${flagsOf(it, p)}</div></li>`).join('')}</ul>`
      : `<div class="mp-e">${ic('pill', 22, 1.8)}<p>ค้นยาด้านบน แล้วกด Enter หรือ "เพิ่ม"</p><p class="small">หรือยิงบาร์โค้ดที่กล่องยา · พิมพ์คุยและบันทึกอาการต่อได้ระหว่างนี้</p></div>`}</div>
    <div class="mp-ft">${items.length ? `<div class="hrow"><span>ค่ายา ${items.length} รายการ</span><span class="sp"></span><b class="num">${SC.money(total(o))}</b></div>${b ? `<p class="small warn-t mt4">${ic('info', 13, 2)} ${esc(b.why)}</p>` : ''}` : ''}
      ${ui.btn(items.length ? 'ใส่วิธีใช้และฉลาก แล้วส่ง' : 'เปิดหน้ารายการยาเต็ม', { kind: items.length ? 'primary' : 'secondary', block: true, go: 'order', st: c.key === 'kid' ? 'kid' : items.length ? 'plan' : 'empty', p: { k: c.key }, icon: 'pill', cls: 'mt8' })}
      ${items.length ? '' : ui.btn('ไม่ต้องจ่ายยา ปิดเคสพร้อมคำแนะนำ', { kind: 'ghost', block: true, sm: true, go: 'close', st: 'nomeds', p: { k: c.key }, cls: 'mt4' })}</div>`;
};
SC.wireMedPanel = el => {
  const q = $('#mq', el); if (!q) return;
  const k = q.dataset.k, p = SC.casePerson(SC.CASES[k]), box = $('#mqBox', el);
  if (SC.S.mpFlash) { $('.mp-it.flash', el)?.scrollIntoView({ block: 'nearest' }); SC.S.mpFlash = null; }
  const draw = () => { SC.S.mpQ = { ...(SC.S.mpQ || {}), [k]: q.value }; box.innerHTML = results({ key: k, items: SC.S.orders[k]?.items || [], q: q.value }, p, 'mpAdd'); };
  q.addEventListener('input', draw);
  q.addEventListener('keydown', e => {
    if (e.key === 'Escape' && q.value) { e.preventDefault(); q.value = ''; draw(); }
    if (e.key !== 'Enter') return;
    e.preventDefault(); const b = $('[data-a="mpAdd"]:not([disabled])', box);
    if (b) b.click(); else if (q.value.trim()) SC.toast('ไม่มียาที่เพิ่มได้จากคำค้นนี้', 'info');
  });
  if (SC.S.mpFocus) { SC.S.mpFocus = false; q.focus(); }
};
SC.act('mpAdd', t => {
  const c = SC.wsCase(SC.cur()), it = SC.CATALOG.find(i => i.sku === t.dataset.v); if (!it) return;
  const o = SC.S.orders[c.key] || SC.seedOrder('empty', c.key);
  if (o.status !== 'draft' || o.items.some(x => x.sku === it.sku)) return;
  o.items.push({ ...it }); SC.S.mpQ = { ...(SC.S.mpQ || {}), [c.key]: '' }; SC.S.mpFocus = true; SC.S.mpFlash = it.sku;
  /* no toast: a toast over the message box gets in the way of typing (owner 20/10: multitask) */
  SC.refresh();
});
SC.act('mpRm', t => { const c = SC.wsCase(SC.cur()), o = SC.S.orders[c.key], it = o?.items[+t.dataset.v]; if (!it) return; o.items.splice(+t.dataset.v, 1); SC.refresh(); SC.toast(`เอา ${it.name} ออกแล้ว`, 'trash'); });

const recvList = () => `<ul class="rc-l">
  <li>${ic('store', 16, 2)}<span><b>รับที่หน้าร้านสาขา</b>ไม่มีค่าจัดส่ง · ลูกค้าแสดงรหัสรับยา 4 ตัว</span></li>
  <li>${ic('zap', 16, 2)}<span><b>จัดส่งด่วน (Lalamove)</b>ประมาณ ${SC.money(89)} · ไม่เกิน 15 กม. · ช่วงร้านเปิดเท่านั้น · 1-4 ชม.</span></li>
  <li>${ic('package', 16, 2)}<span><b>จัดส่งพัสดุ</b>Flash ${SC.money(25)} · DHL ${SC.money(20)} · 1-3 วัน</span></li>
  <li>${ic('snowflake', 16, 2)}<span><b>ส่งเย็น Inter Express</b>เฉพาะรายการที่มียาเก็บเย็น · ร้านจองเอง · ${SC.money(300)} คงที่ · ในเขตส่งยาเท่านั้น</span></li>
  <li>${ic('map-pin', 16, 2)}<span><b>เขตส่งยา</b>${SC.ZONE_RULE} · ${SC.zoneLocked() ? 'ใช้กับทุกวิธีส่ง · นอกเขตรับที่ร้านเท่านั้น' : `<span class="warn-t">ปลดล็อกอยู่: นอกเขตส่งพัสดุ Flash DHL หรือส่งเย็นได้ ติดป้าย "${SC.OUT_TAG}"</span> · ส่งด่วนยังไม่เกิน 15 กม.`}</span></li></ul>`;
/* item 71 (20/10, the owner kept the recommendation): the pharmacist can close a way to get the medicine for this list,
   e.g. a cold-chain medicine never goes by parcel (1-3 days). At least one way stays open. The customer sees why */
const RECV = [['pickup', 'รับที่ร้าน', 'store'], ['express', 'ส่งด่วน', 'zap'], ['parcel', 'พัสดุ', 'package']];
const RECV_WHY = ['ยาต้องเก็บเย็น', 'ต้องสอนวิธีใช้ที่ร้าน', 'ต้องได้ยาวันนี้'];
/* B10: a list with a cold-chain medicine offers pickup and Inter Express only, nothing to switch */
const COLD = ['cold', 'ส่งเย็น Inter Express', 'snowflake'];
SC.recvAll = o => SC.hasCold(o) ? [RECV[0], COLD] : RECV;
SC.recvOpen = o => SC.recvAll(o).filter(([k]) => !(o.recvOff || {})[k]).map(([k]) => k);
function recvBox(o) {
  const off = o.recvOff || {}, cold = SC.hasCold(o), all = SC.recvAll(o);
  return `<div class="rcv mt12"><p class="label">วิธีรับยาที่ลูกค้าเลือกได้</p>
    <div class="chips mt8" role="group" aria-label="วิธีรับยาที่ลูกค้าเลือกได้">${all.map(([k, l, icn]) => `<button type="button" class="chip${off[k] ? ' off' : ''}" data-a="rcvT" data-v="${k}" aria-pressed="${!off[k]}">${ic(off[k] ? 'ban' : icn, 14, 2)}${l}</button>`).join('')}</div>
    ${cold ? `<p class="small mt8 rcv-cold">${ic('snowflake', 13, 2)}<span>มียาเก็บเย็น: ส่งด่วนและพัสดุปิดให้เอง · ส่งเย็นด้วย Inter Express (ร้านจองเอง ไม่มีระบบเชื่อม) หรือรับที่ร้าน</span></p>` : ''}
    ${Object.keys(off).length ? `<p class="small mt8">ปิดเพราะ</p><div class="chips mt4" role="group" aria-label="เหตุผลที่ปิด">${RECV_WHY.map(x => `<button type="button" class="chip" data-a="rcvWhy" data-v="${esc(x)}" aria-pressed="${o.recvWhy === x}">${esc(x)}</button>`).join('')}</div>
    <p class="small mt8">${ic('eye', 13, 2)} ลูกค้าเห็น: เลือกได้เฉพาะ ${SC.recvOpen(o).map(k => all.find(x => x[0] === k)[1]).join(' · ')}${o.recvWhy ? ` (เภสัชกรแจ้ง: ${esc(o.recvWhy)})` : ''}</p>` : ''}</div>`;
}
SC.act('rcvT', t => {
  const c = SC.wsCase(SC.cur()), o = SC.S.orders[c.key]; if (!o) return;
  const k = t.dataset.v, off = { ...(o.recvOff || {}) };
  if (!SC.recvAll(o).some(x => x[0] === k)) return;
  if (off[k]) delete off[k]; else { if (SC.recvOpen(o).length <= 1) return SC.toast('ต้องเปิดไว้อย่างน้อย 1 วิธี', 'info'); off[k] = true; }
  o.recvOff = off; if (!Object.keys(off).length) o.recvWhy = ''; SC.refresh();
});
SC.act('rcvWhy', t => { const c = SC.wsCase(SC.cur()), o = SC.S.orders[c.key]; if (!o) return; o.recvWhy = o.recvWhy === t.dataset.v ? '' : t.dataset.v; SC.refresh(); });
function summaryCol(o, p, c) {
  const b = blockReason(o, p), t = total(o), me = SC.me();
  return `<div class="osum">
    <h3 class="h3">สรุปรายการ</h3>
    ${c.urgent.length ? `<div class="mt8">${ui.note(`<b>เคสนี้ติดธงด่วน: ${esc(c.urgent.join(', '))}</b><p>ประเมินว่าดูแลที่บ้านได้จริงก่อนจ่ายยา ถ้าไม่ได้ แนะนำโรงพยาบาลแทน</p>`, { tone: 'danger' })}</div>` : ''}
    <div class="mt12">${ui.kv([[`ค่ายา (${o.items.length} รายการ)`, `<span class="num">${SC.money(t)}</span>`], ['ยอดที่ลูกค้าเห็นในแชท', `<span class="num">${SC.money(t)}</span>`, 'tot']])}</div>
    ${recvBox(o)}
    <p class="small mt8">${ic('clock', 13, 2)} ลูกค้าเลือกวิธีรับยาและจ่ายเงินเองในแอป · ค่าส่งคิดตอนชำระ · ชำระได้ภายใน 2 ชม.</p>
    <div class="osum-f">${ui.btn('ส่งรายการให้ลูกค้าชำระ', { lg: true, block: true, icon: 'send', st: 'confirm', p: { k: c.key }, disabled: !!b })}
    ${b ? `<p class="err-t mt8" role="status">${ic('info', 14, 2)}<span>${esc(b.why)}</span></p>` : ''}
    ${b?.alg ? `<div class="btn-row mt8">${ui.btn('บันทึกแพ้ยา', { kind: 'secondary', sm: true, icon: 'shield-check', go: 'room', st: 'allergy', p: { k: c.key, from: 'order' } })}${ui.btn('ถามลูกค้าในแชท', { kind: 'secondary', sm: true, icon: 'message-circle', a: 'askAlg', v: c.key })}</div>` : ''}</div>
    ${!o.items.length ? ui.btn('ไม่ต้องจ่ายยา ปิดเคสพร้อมคำแนะนำ', { kind: 'ghost', block: true, go: 'close', st: 'nomeds', p: { k: c.key }, cls: 'mt8' }) : ''}
    <p class="osum-by mt12">${ic('badge-check', 15, 2)}<span>จ่ายยาโดย ${esc(me.name)} · ${esc(me.lic)}</span></p>
    <details class="mgr osum-more mt12"><summary>วิธีรับยาและค่าส่งที่ลูกค้าเห็น</summary>${recvList()}<p class="small mt8">จ่ายในแอป: พร้อมเพย์ · บัตรเครดิต/เดบิต (+3.65% ลูกค้าจ่าย) · แอปธนาคาร 5 ธนาคาร</p></details></div>`;
}

/* ---------- S303 build the medicine list ---------- */
SC.screen('order', {
  code: 'S303', group: 3, duty: true, title: 'สร้างรายการยา', nav: 'queue', fill: true,
  states: [['plan', 'เพิ่มยาแล้ว 3 รายการ', { cust: [['room', 'live', 'ลูกค้ายังคุยอยู่ ยังไม่เห็นรายการ']] }],
    ['search', 'ค้นหายาในสต๊อก', { cust: [['room', 'live']] }],
    ['kid', 'ยาเด็กตามน้ำหนัก', { cust: [['intake', 'kid', 'น้ำหนัก 20 กก. มาจากข้อมูลสมาชิกในบ้าน']] }],
    ['clash', 'ประวัติแพ้ยา เภสัชกรตรวจเอง', { cust: [['health', 'normal', 'แพ้แอสไพริน บันทึกโดย ภญ.ขวัญใจ']] }],
    ['empty', 'ยังไม่มีรายการ', { cust: [['room', 'live']] }],
    ['confirm', 'ยืนยันส่งรายการ', { back: 'plan', cust: [['room', 'order', 'การ์ดรายการยาในแชทของลูกค้า'], ['pay', 'normal', 'ลูกค้ากดดูและชำระเงิน']] }],
    ['cold', 'ยาเก็บเย็น: ส่งได้ 2 ทาง', { cust: [['pay', 'cold', 'ลูกค้าเห็นเฉพาะรับที่ร้านและส่งเย็น Inter Express (C308.20)']] }]],
  notes: ['ห้องรีวิว อย. 20/10 (B15): ทุกรายการยามีช่องรูปยา (ต้นแบบใช้ภาพตัวอย่าง ของจริงดึงรูปจากข้อมูลสินค้า)', 'เจ้าของ 20/10 (ห้องรีวิว อย. ส่งต่อ B5): ยาแต่ละรายการเก็บ ชื่อสามัญ ชื่อการค้า ความแรง ข้อบ่งใช้ คำเตือน · เติมจากฉลากให้ แก้ได้ · ชื่อสามัญ ความแรง ข้อบ่งใช้ต้องมีก่อนส่ง · ยาที่ไม่มีฉลากต้องพิมพ์เอง · คำเตือนใส่ถ้ามี · เวชภัณฑ์ไม่ต้องใส่',
    'เจ้าของ 20/10 (B10): "ส่ง inter express logistic ไปเรียกแบบ manual ไม่มี api" · รายการที่มียาเก็บเย็น ลูกค้าเลือกได้ 2 ทาง: รับที่ร้าน หรือส่งเย็น Inter Express (ร้านจองเอง) · ส่งด่วนและพัสดุปิดให้เอง · ค่าส่ง ฿300 คงที่ (เจ้าของ 20/10: "เพิ่มช่องทางจัดส่งเย็นด้วย inter express logistic ค่าบริการคงที่ 300 บาท")',
    'เจ้าของ 20/10: "lalamove ให้จัดส่ง ไม่เกิน 15 km อยู่แล้ว" · ส่งด่วนไม่เกิน 15 กม. · ผู้ดูแลระบบปลดล็อกเขตส่งยาได้ที่ S501 เมื่อ อย. อนุญาตเป็นหนังสือ ตอนปลดล็อกจอนี้บอกในรายการวิธีส่ง',
    'เจ้าของ 20/10 (B9) แก้ 21/10: ตัดคำว่า "ส่งทั่วไทย" · เขตส่งยา: ทุกที่อยู่รวมกรุงเทพห่างสาขาไม่เกิน 15 กม. ตามระยะวิ่งจริง ใช้กับทุกวิธีส่ง รวมพัสดุ (เจ้าของ 21/10 "15 กม. ทุกที่อยู่")',
    'เคาะแล้ว 20/10 ข้อ 71 (ใช้ตามที่แนะนำ): เภสัชกรปิดวิธีรับยาบางทางได้ต่อรายการ เช่น ยาต้องเก็บเย็นไม่ส่งพัสดุ (1-3 วัน) · เปิดไว้อย่างน้อย 1 วิธี · ลูกค้าเห็นเฉพาะวิธีที่เปิด พร้อมเหตุผลที่เภสัชกรเลือก', 'เจ้าของ 21/10: "ยังไม่ทำระบบนี้ เอาไว้เฟสถัดไป เพราะต้องทำ data ข้อมูลยาเยอะมาก" · เฟสนี้ระบบไม่เทียบยาในรายการกับประวัติแพ้ยา ผลข้างเคียง และรายงานอาการ ไม่ขึ้นป้ายที่ยา และไม่ห้ามส่ง · แถบ "ประวัติแพ้ยาและอาการจากยา" บนสุดของรายการยาแสดงให้ดูอย่างเดียว เภสัชกรตรวจเองก่อนสั่งยา · S303.4 เดิม "ชนกับยาที่แพ้" ตอนนี้เป็นแถบนี้ (เลขเดิม) · แทนข้อ 38 (19/10) และป้ายผลข้างเคียงข้อ 74 · ทำตอนสร้างจริงเฟสถัดไป: ข้อมูลตัวยาของทุกสินค้าก่อน แล้วค่อยเทียบให้อัตโนมัติ', 'เจ้าของ 20/10: "ยาที่เข้ากับอาการ (3) ตรงนี้ไม่เอา แนะนำ ให้ manual add เอง เพราะงั้นอยากดูหน้าจอ add รายการยาด้วย" · "fx ตรง 3xx ต้องให้ UX friendly กับเภสัชด้วยที่ต้อง multitask ทั้งบันทึกข้อมูล พิมพ์คุย คีย์รายการยา" · ไม่มีรายการที่ระบบเสนอให้แล้ว เภสัชกรค้นและเพิ่มยาเองทุกตัว (ค้นแล้วกด Enter เพิ่มตัวแรก หรือยิงบาร์โค้ด) · จอนี้มี 3 ช่องทำพร้อมกันได้: ซ้าย = ผู้มีอาการ + บันทึกอาการรอบนี้ · กลาง = รายการยา (วิธีใช้ ฉลาก หน่วย) · ขวา = แชทกับลูกค้า + ยอดและปุ่มส่ง · กระโดดช่องด้วยแป้น Alt+1 แชท · Alt+2 บันทึกอาการ · Alt+3 ค้นยา',
    'เคาะแล้ว 20/10 ข้อ 85 (เจ้าของ: "ข้อ 85 ตรวจคำชื่อโรคเฉพาะข้อความที่ลูกค้าเห็นตามที่แนะนำ") · จอนี้ตรวจวิธีใช้ (ลูกค้าเห็นและพิมพ์บนฉลาก) · บันทึกอาการรอบนี้ไม่ตรวจ',
    'เคาะแล้ว 20/10 ข้อ 77: ฉลากที่พิมพ์ใช้ข้อความของฉลากจากเมนูฉลากยา (เจ้าของ: "ใช้ข้อมูลเดิมของฉลากที่มีจากระบบจัดการฉลากยา และสามารถ quick add, edit ได้") · วิธีใช้ที่เขียนให้ลูกค้าคนนี้ต่างจากฉลาก ขึ้นเตือนให้ทำให้ตรงกัน', 'เคาะแล้ว 20/10: ข้อ 78 ยาที่มีฉลากหลายแบบต้องเลือกก่อนส่ง ("ใช่") · ข้อ 79 ยังไม่มีชื่อลูกค้าบนฉลาก ("ยังไม่ต้อง") · ข้อ 80 แก้ได้เฉพาะภาษาไทย ภาษาอื่น AI แปลแล้วเภสัชกรกดตรวจก่อนพิมพ์ · ข้อ 81 มีเมนูฉลากยา (S405)', 'เจ้าของ 20/10: "ฉลากเนี่ยไม่ต้องโชว์ของจริงในหน้า UI หรอก แค่โชว์ชื่อฉลากและรายละเอียดก็พอ" · "ดูฉลาก" เปิดชื่อฉลากและช่องข้อมูล แก้ไขด่วนได้ในที่ · ฉลากจริง 90 x 65 มม. เห็นตอน "ดูก่อนพิมพ์"', 'QA และผู้ใช้จริง 20/10 (รอบ 3b): รายการไม่เด้งขึ้นบนเมื่อกดในการ์ดยา · ค้นหาไม่สนตัวพิมพ์เล็กใหญ่ และค้นด้วยชื่อสามัญได้ · ยาที่มีฉลากหลายแบบต้องเลือกก่อนส่ง · "ใช้ข้อความนี้" ใช้ภาษาที่เปิดดูอยู่ มีปุ่มย้อนข้อความเดิม · ฉลากที่ยาวเกินช่องบอกว่าจะถูกตัด', 'เจ้าของสั่ง 20/10: เลือกหน่วยได้ (เม็ด แผง กล่อง ขวด ฯลฯ) ข้างปุ่มจำนวน บอกขนาดบรรจุและราคาต่อหน่วยในตัวเลือก · ราคาและคงเหลือเปลี่ยนตามหน่วย · เปลี่ยนหน่วยแล้วจำนวนกลับเป็น 1 (กัน 2 แผง กลายเป็น 2 กล่อง) · หน่วยแรกตรงกับที่ลูกค้าเห็น', 'เจ้าของสั่ง 20/10: "ต้องการให้เลือกฉลากยาระบบได้ แล้วมีตัวเพิ่มฉลากยาได้" · ใต้วิธีใช้มี 2 บรรทัด: ฉลากที่ใช้อยู่ (ยาหนึ่งตัวมีได้หลายแบบตามอาการ เช่น Valtrex 3 แบบ) และวิธีใช้ตามฉลาก · "เลือกฉลาก" เปิดรายการให้เลือก · "เพิ่มฉลากใหม่" กรอกช่องเดียวกับระบบฉลาก ตรวจช่องว่าง ชื่อซ้ำ และคำที่เป็นชื่อโรค · ยาที่ยังไม่มีฉลากมีปุ่ม "เพิ่มฉลาก" เลย', 'เจ้าของสั่ง 20/10: "ต้องเป็นไซส์ 90x65 mm" · หน้าดูก่อนพิมพ์แสดงขนาดจริง 90 x 65 มม. วางช่องตามโปรแกรมพิมพ์ BIGYA Label 2025 (หัวร้าน โทร วันที่ / ชื่อการค้า / ชื่อยา / วิธีใช้ / ข้อบ่งใช้ / ข้อควรระวัง / เก็บรักษา / โลโก้) · ฉลากที่มีหลายภาษาเลือกภาษาได้ 6 ภาษาเหมือนระบบเดิม', 'เลือกฉลากแล้วใส่วิธีใช้ให้เฉพาะเมื่อช่องว่าง หรือยังเป็นข้อความของฉลากเดิม ข้อความที่เภสัชกรเขียนเองไม่ถูกแทน', 'เคสเด็ก: ฉลากเป็นขนาดผู้ใหญ่ ไม่มีปุ่ม "ใช้ข้อความนี้" และเลือกฉลากแล้วไม่ใส่วิธีใช้ให้ ใช้ขนาดตามน้ำหนักเท่านั้น', 'เคาะแล้ว 20/10: เภสัชกรขึ้นไปเพิ่มและแก้ฉลากได้ทุกฉลาก รวมฉลากเดิมของระบบ ระดับ staff เพิ่มหรือแก้ไม่ได้ ทุกการแก้มีชื่อคนแก้และวันที่ (ข้อ 59)', 'เคาะแล้ว 20/10: หัวฉลาก "มิตรอารี ตลาดเวิลด์" / "มิตรอารี อ่อนนุช" ไม่มีคำว่าสาขา (บิ๊กยาในฉลากเดิมเป็นข้อมูลเก่า) (ข้อ 60)', 'เคาะแล้ว 20/10: ข้อควรระวังบนฉลาก ลูกค้าไม่เห็น ลูกค้าเห็นแค่วิธีใช้ที่เภสัชกรเขียน (ข้อ 54)', 'เคาะแล้ว 20/10: เด็กต่ำกว่า 12 ปี ส่งยาเม็ดหรือแคปซูลขนาดผู้ใหญ่ไม่ได้ ให้ใช้ชนิดน้ำที่มีช่องขนาดตามน้ำหนัก (ข้อ 57)', 'รีวิว UX 20/10: การ์ดยาเตี้ยลง (ตัดรหัสสินค้า คงเหลืออยู่ข้างหน่วย ช่องวิธีใช้เริ่ม 1 บรรทัด) · การ์ดที่ติดล็อก (ยาผู้ใหญ่สำหรับเด็ก เกินขนาด) ขึ้นบนสุด · ช่องสรุปเหลือยอดกับปุ่มส่ง วิธีรับยาและค่าส่งพับไว้', 'ข้อมูลฉลาก: 6 ตัวจากระบบ BIGYA Label (ชุดข้อมูล 06/05/2025 ค้นได้ เช่น Valtrex Muclear Sonap) + 7 ตัวของเรื่องในต้นแบบเป็นตัวอย่าง มีป้ายบอกที่มาทุกฉลาก · ทำตอนสร้างจริง: ดึงฉลากทั้งหมดจากระบบฉลาก', 'ราคาและคงเหลือมาจากสต๊อกสาขา แก้ราคาเองไม่ได้ · ไม่มีค่าปรึกษา', 'ส่งไม่ได้ถ้า: ยังไม่รู้ว่าแพ้ยาไหม (มีปุ่มบันทึกแพ้ยาและปุ่มถามลูกค้าในแชท) · ยาเม็ดผู้ใหญ่ให้เด็กต่ำกว่า 12 ปี · ยาเด็กเกิน 15 มก./กก./ครั้ง · วิธีใช้มีชื่อโรค', 'ยาเด็ก: ระบบคิดขนาดตามน้ำหนัก เกินช่วง = แดง "เกินขนาด" ส่งไม่ได้ ไม่มีทางข้าม · ต่ำกว่าช่วง = เหลือง เตือนอย่างเดียว', 'รายงานอาการที่ยังไม่ได้ตอบอยู่ในแถบประวัติ พร้อมปุ่มดูรายงาน', 'เพิ่มยาจากผลค้นแล้วเลื่อนไปที่ยานั้นทันที', 'หน้าต่างยืนยันบอกแพ้ยา ผลข้างเคียง รายงานอาการ ยาประจำ และน้ำหนัก เหนือช่องติ๊ก', 'สถานะ "ยืนยันส่งรายการ" ในแผงตรวจใช้รายการ 3 ตัวแบบเดียวกับแอปลูกค้า (฿385)'],
  wait: [],
  head: () => ({ title: 'สร้างรายการยา', sub: SC.branch().name }),
  now: () => ({ date: SC.NOW.date, time: '14:20' }),
  prep(S, st, p) { p.k = p.k || (S._reseed ? (st === 'kid' ? 'kid' : st === 'cold' ? 'new1' : 'smj') : S.activeCase) || 'smj'; S.activeCase = p.k; },
  render(ctx) {
    const c = SC.CASES[keyFor(ctx)], p = SC.casePerson(c), o = order(ctx);
    if (o.status === 'draft') SC.markSeen(c.key);
    const bar = SC.caseBar(c, { step: 'order', start: 248 });
    /* a card the pharmacist must fix (adult tablet for a child, child over-dose) goes to the top of the list (UX-10) */
    const lock = it => adultForKid(it, p) || (it.kidDose && perKg(it, p, maxMl(it)) > 15) ? 1 : 0;
    const rows = o.items.map((it, i) => [it, i]).sort((a, b) => lock(b[0]) - lock(a[0]));
    if (o.status !== 'draft') return `${bar}<div class="solo-in">${ui.card(`${ui.cardH('ส่งรายการนี้แล้ว', ui.tag(o.status === 'paid' ? 'ชำระแล้ว' : o.status === 'sent' ? 'รอชำระ' : o.status === 'cancelled' ? 'ยกเลิกแล้ว' : 'หมดเวลา', o.status === 'paid' ? 'ok' : 'warn'))}<p class="mt8">รายการ <span class="mono">${esc(o.no)}</span> · ${SC.money(total(o))} · ส่งเข้าแชท ${esc(o.sent || '')}</p><p class="small mt8">จะแก้ ให้ยกเลิกรายการเดิมแล้วออกใหม่ที่หน้าการชำระเงิน ลูกค้าจะได้ไม่จ่ายยอดเก่า</p><div class="btn-row mt16">${ui.btn('ดูการชำระเงิน', { go: 'pay', st: o.status === 'paid' ? (o.paid?.recv || 'pickup') : o.status === 'sent' ? 'wait' : 'expired', p: { k: c.key }, icon: 'receipt' })}</div>`)}</div>`;
    return `${bar}
      <div class="ws ord">
        <aside class="ws-col ws-pt" aria-label="ตรวจก่อนจ่าย"><p class="label pt-top">ตรวจก่อนจ่าย</p>${SC.ptCard(c, { compact: true, from: 'order' })}</aside>
        <section class="ws-col ws-mid ord-mid" aria-label="รายการยา">
          ${algStrip(c, ctx.st === 'clash')}
          <div class="ord-s"><div class="search grow">${ic('search', 18, 2)}<label class="sr" for="oq">ค้นหายา</label><input id="oq" class="input" type="search" placeholder="ค้นชื่อยาหรือรหัส แล้วกด Enter" aria-description="ค้นในสต๊อก${esc(SC.branch().name)}" value="${esc(o.q)}" autocomplete="off"${ctx.st === 'search' || ctx.st === 'empty' ? ' data-focus' : ''}></div>${ui.btn('สแกนบาร์โค้ด', { kind: 'secondary', icon: 'scan-barcode', a: 'scan' })}</div>
          <div id="srBox">${results(o, p)}</div>
          <div class="ord-list" id="ordList">${o.items.length ? rows.map(([it, i]) => itemRow(it, i, p, SC.S.flash)).join('') : ui.empty({ icon: 'pill', title: 'ยังไม่มีรายการยา', body: 'ค้นชื่อยา ชื่อสามัญ หรือรหัสด้านบน แล้วกด Enter หรือยิงบาร์โค้ดที่กล่องยา · คุยกับลูกค้าต่อได้ที่ช่องแชทด้านขวา' })}</div>
        </section>
        <aside class="ws-col ws-side ord-side" aria-label="แชทและสรุป">${miniChat(c)}${summaryCol(o, p, c)}</aside>
      </div>`;
  },
  overlay(ctx) {
    if (ctx.st !== 'confirm') return '';
    const o = order(ctx), c = SC.CASES[o.key], p = SC.casePerson(c), t = total(o), pk = SC.pkey(c), rep = SC.adrOpen(pk), sfx = SC.sfxOf(pk);
    return ui.modal({ title: 'ส่งรายการยาให้ลูกค้า', sub: `${p.name} · เคส ${SC.caseCode(c)}`, icon: 'send', back: 'plan',
      body: `<table class="tbl"><thead><tr><th>ยา</th><th>จำนวน</th><th class="r">ราคา</th></tr></thead><tbody>${o.items.map(i => `<tr><td><b>${esc(i.name)}</b><span class="sub">${esc(i.how)}</span></td><td class="nowrap">${i.qty} ${esc(i.unit)}</td><td class="r num">${SC.money(i.price * i.qty)}</td></tr>`).join('')}<tr><td colspan="2"><b>รวมค่ายา</b></td><td class="r"><b class="num">${SC.money(t)}</b></td></tr></tbody></table>
        <div class="cf-chk mt16"><p class="label">ตรวจกับข้อมูลของ${esc(p.name)}</p>${ui.kv([['แพ้ยา', ui.allergy(p)], ['ผลข้างเคียง', sfx.length ? esc(sfx.map(x => `${x.sym} จาก${x.ing}`).join(', ')) : 'ไม่มีบันทึก'], ['รายงานอาการ', rep ? esc(`${rep.sym.join(', ')} หลังใช้${rep.drug} · ยังไม่ได้ตอบ`) : 'ไม่มีที่ค้างตอบ'], ['ยาประจำ', esc(SC.medsTxt(p))], ['น้ำหนัก', p.weight ? p.weight + ' กก.' : 'ไม่ได้ระบุ']], { left: true })}
          <p class="small mt8">${ic('info', 13, 2)} เภสัชกรตรวจเองก่อนสั่งยา ระบบไม่เทียบยาในรายการกับประวัตินี้</p></div>
        <button type="button" class="opt mt16" role="checkbox" data-toggle aria-checked="false" id="chkOk"><span class="ck">${ic('check', 13, 3)}</span><span class="tx"><b>ตรวจกับแพ้ยา ยาประจำ และขนาดยาแล้ว</b><span>ระบบบันทึกชื่อและเลขใบอนุญาตของคุณเป็นผู้จ่ายยา</span></span></button>
        <p class="err-t mt8" id="chkErr" hidden>${ic('circle-x', 14, 2)}<span>ติ๊กยืนยันการตรวจก่อนส่ง</span></p>
        <p class="mt12"><b>ลูกค้าชำระได้ถึง 16:20</b> <span class="small">· ลูกค้าเห็นรายการนี้ในแชท · ถ้าต้องแก้หลังส่ง ระบบยกเลิกรายการเดิมแล้วออกใหม่</span></p>`,
      foot: `${ui.btn('กลับไปแก้', { kind: 'secondary', st: 'plan' })}${ui.btn('ส่งรายการ', { a: 'sendOrder', icon: 'send' })}` });
  },
  sims: () => [{ label: 'ลูกค้าพิมพ์มาในแชท (ขึ้นในช่องแชทข้างรายการยา)', run: () => { const key = keyFor(SC.cur()), ch = SC.chatOf(key); if (SC.S.seen?.[key] == null) SC.markSeen(key); ch.msgs.push({ who: 'cu', text: 'ขอถามเพิ่มนิดนึงค่ะ ยาอมกินคู่กับยาความดันได้ไหมคะ', time: SC.nowT(ch) }); SC.refresh(); SC.toast(`${SC.casePerson(SC.CASES[key]).first || 'ลูกค้า'} ส่งข้อความใหม่ในแชท`, 'message-circle'); } }],
  mount(el, ctx) {
    SC.tickElapsed(el, ctx, 248);
    const o = order(ctx), c = SC.CASES[o.key], p = SC.casePerson(c), q = $('#oq', el);
    SC.wireComposer(el);
    q?.addEventListener('input', () => { o.q = q.value; $('#srBox', el).innerHTML = results(o, p); });
    /* Enter adds the first medicine that can be added, so the hands stay on the keyboard */
    q?.addEventListener('keydown', e => { if (e.key !== 'Enter') return; e.preventDefault(); const b = $('#srBox [data-a="addItem"]:not([disabled])', el); if (b) b.click(); else if (q.value.trim()) SC.toast('ไม่มียาที่เพิ่มได้จากคำค้นนี้', 'info'); });
    const mid = $('.ord-mid', el);
    const fit = t => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; };
    $$('.oi-how', el).forEach(fit);
    mid?.addEventListener('input', e => {
      const t = e.target; if (t.dataset.in === 'how') { o.items[+t.dataset.i].how = t.value; fit(t); }
      if (t.dataset.in === 'inf') { const it = o.items[+t.dataset.i]; it.info = { ...(it.info || {}), [t.dataset.f]: t.value }; SC.S.infOpen = { ...(SC.S.infOpen || {}), [t.dataset.lk]: true }; }
    });
    /* recheck when a field is committed (change), so typing is not interrupted */
    mid?.addEventListener('change', e => {
      const t = e.target;
      if (t.dataset.in === 'how') {
        /* the ml typed in "วิธีใช้" moves the dose box, so the over-dose check runs on what the customer will read */
        const it = o.items[+t.dataset.i], n = it?.kidDose ? [...new Set(textMl(it))] : [];
        if (n.length === 1) it.kidDose.ml = n[0];
        return SC.afterTap(SC.refresh);
      }
      if (t.dataset.in === 'inf') return SC.afterTap(() => { SC.refresh(); requestAnimationFrame(() => $(`[data-in="inf"][data-i="${t.dataset.i}"][data-f="${t.dataset.f}"]`)?.focus()); });
      if (t.dataset.in === 'unit') {
        /* a new unit brings its own price and stock; the quantity goes back to 1 so "2 แผง" never turns into "2 กล่อง" */
        const it = o.items[+t.dataset.i], u = unitsOf(it).find(x => x[0] === t.value); if (!it || !u) return;
        it.unit = u[0]; it.price = u[2]; it.qty = 1;
        SC.refresh(); SC.toast(`เปลี่ยนเป็น ${it.qty} ${u[0]} · ${SC.money(it.price * it.qty)}`, 'check');
        return requestAnimationFrame(() => $('#unit' + t.dataset.i)?.focus());
      }
      if (t.dataset.in !== 'dose') return;
      const it = o.items.find(x => x.kidDose); if (!it || !(+t.value > 0)) return;
      it.kidDose.ml = +t.value; it.how = it.how.replace(/ครั้งละ [\d.]+ มล\./, `ครั้งละ ${+t.value} มล.`);
      SC.refresh(); requestAnimationFrame(() => $('.dose-in')?.focus());
    });
    if (SC.S.flash) { const f = $('#oi-' + SC.S.flash, el); SC.S.flash = null; if (f) requestAnimationFrame(() => f.scrollIntoView({ block: 'center', behavior: SC.RED() ? 'auto' : 'smooth' })); }
  }
});
SC.act('qty', t => { const [i, d] = t.dataset.v.split(':').map(Number), o = SC.S.orders[keyFor(SC.cur())]; o.items[i].qty = Math.max(1, Math.min(availOf(o.items[i]), o.items[i].qty + d)); SC.refresh(); });
SC.act('rmItem', t => {
  const cur = SC.cur(), o = SC.S.orders[keyFor(cur)], it = o.items[+t.dataset.v];
  o.items.splice(+t.dataset.v, 1);
  const st = cur.st === 'clash' || cur.st === 'empty' ? (o.items.length ? 'plan' : 'empty') : cur.st;
  SC.go('order', { st, p: cur.p }); SC.toast(`เอา ${it.name} ออกแล้ว`, 'trash');
});
SC.act('addItem', t => {
  const cur = SC.cur(), o = SC.S.orders[keyFor(cur)], it = SC.CATALOG.find(i => i.sku === t.dataset.v);
  o.items.push({ ...it }); o.q = ''; SC.S.flash = it.sku;
  SC.go('order', { st: cur.st === 'kid' ? 'kid' : 'plan', p: cur.p });
  SC.toast(`เพิ่ม ${it.name} แล้ว`, 'plus');
});
SC.act('lblTog', t => { const S = SC.S; S.lblOpen = { ...(S.lblOpen || {}), [t.dataset.v]: !S.lblOpen?.[t.dataset.v] }; SC.refresh(); });
SC.act('lblLang', t => { const [lk, k] = t.dataset.v.split('|'); SC.S.lblLang = { ...(SC.S.lblLang || {}), [lk]: k }; SC.refresh(); });
SC.act('useLabel', t => {
  const o = SC.S.orders[keyFor(SC.cur())], it = o.items[+t.dataset.v], l = SC.labelOf(it), p = SC.casePerson(SC.CASES[o.key]); if (!l || p.child || p.age < 12) return;
  const lk = lkOf(it), lang = l.v.tx[SC.S.lblLang?.[lk]] ? SC.S.lblLang[lk] : 'th';
  /* what was written before is kept for one undo (real user 20/10: it was overwritten with no way back) */
  SC.S.howUndo = String(it.how || '').trim() ? { k: lk, how: it.how } : null;
  it.how = l.v.tx[lang].how; SC.refresh(); SC.toast(`ใส่วิธีใช้ตามฉลาก${lang === 'th' ? '' : SC.LABEL_HEAD[lang][0]}แล้ว อ่านและแก้ให้ตรงกับลูกค้าคนนี้ก่อนส่ง`, 'copy');
});
SC.act('lblPrintLine', t => { const [i, k] = t.dataset.v.split('|'), it = SC.S.orders[keyFor(SC.cur())].items[+i], l = it && SC.labelOf(it); if (l) SC.lblPrint([{ id: l.v.id, lang: k, it, title: `${it.name} · ฉลาก ${l.v.name}` }]); });
SC.act('howUndo', t => { const u = SC.S.howUndo, o = SC.S.orders[keyFor(SC.cur())], it = u && o.items.find(x => lkOf(x) === u.k); if (!it || u.k !== t.dataset.v) return; it.how = u.how; SC.S.howUndo = null; SC.refresh(); SC.toast('ย้อนเป็นข้อความเดิมแล้ว', 'rotate-ccw'); });
SC.act('scan', () => SC.toast('จำลอง: ยิงบาร์โค้ดที่กล่องยา ระบบเพิ่มลงรายการให้', 'scan-barcode'));
SC.act('sendOrder', async t => {
  const ok = $('#chkOk'), cur = SC.cur(), o = SC.S.orders[keyFor(cur)], p = SC.casePerson(SC.CASES[o.key]), b = blockReason(o, p);
  if (b) { SC.go('order', { st: 'plan', p: cur.p }); SC.toast(b.why, 'info'); return; }
  if (ok.getAttribute('aria-checked') !== 'true') { $('#chkErr').hidden = false; ok.focus(); return; }
  await SC.busy(t, 700);
  o.status = 'sent'; o.sent = '14:20';
  SC.chatOf(o.key).msgs.push({ who: 'ph', kind: 'order', no: o.no, sum: `${o.items.length} รายการ · ${SC.money(total(o))} · ชำระได้ถึง 16:20`, time: '14:20' });
  SC.go('pay', { st: 'wait', p: { k: o.key } });
  SC.toast('ส่งรายการยาเข้าแชทแล้ว ลูกค้าได้รับแจ้งเตือน', 'send');
});
})();

/* ===== 63-labels.js ===== */
/* =====================================================================
   63 · ฉลากยา: the shop's label list (BIGYA Label database dump 06/05/2025, Thai + 5 languages, typos kept as in the
   source) + the labels added here. One medicine can have several labels (Valtrex: 3, one per use).
   Owner 20/10/2026: "ฉลากเนี่ยไม่ต้องโชว์ของจริงในหน้า UI หรอก แค่โชว์ชื่อฉลากและรายละเอียดก็พอ รวมถึงให้แก้ไข quick edit ได้
   แต่ตอนพิมพ์ให้ใช้ format จริง" · "การเพิ่มฉลากใหม่ต้องทำได้ง่าย และมี AI แปลภาษาด้วย และสามารถดึง generic เดิมมาทำฉลากได้" ·
   item 80 "แก้ภาษาไทยเท่านั้น" · item 77 the printed label uses the label's own text from the label system.
   Who: pharmacists and up add and edit every label; store staff neither (item 59)
   ===================================================================== */
(() => {
const { $, $$, esc, ic, ui } = SC;
SC.LABEL_HEAD = {"th": ["ภาษาไทย", "ชื่อการค้า", "ชื่อยา", "วิธีใช้", "ข้อบ่งใช้", "ข้อควรระวัง", "เก็บรักษา"], "en": ["อังกฤษ", "BRAND NAME", "GENERIC NAME", "DIRECTION FOR USE", "INDICATIONS", "PRECAUTIONS", "STORAGE"], "ch": ["จีน", "商品名", "药品名称", "用法用量", "适应症", "注意事项", "贮藏方法"], "jp": ["ญี่ปุ่น", "販売名", "医薬品名", "用法・用量", "効能・効果", "注意事項", "保管方法"], "my": ["พม่า", "ကုမ္ပဏီအမှတ်တံဆိပ်အမည်", "ဆေးအမည်", "အသုံးပြုရန်နည်းလမ်", "သုံးစွဲရန်အညွှန်", "သတိပြုရန်အချက်မျာ", "သိမ်းဆည်းရန်နည်းလမ်"], "kh": ["กัมพูชา", "ឈ្មោះពាណិជ្ជកម្ម", "ឈ្មោះថ្នាំ", "វិធីប្រើប្រាស់", "សញ្ញានាំឱ្យប្រើប្រាស់", "ការប្រុងប្រយ័ត្", "វិធីរក្សាទុក"]};
const BIGYA = {"100596": [{"id": "100596-1", "sku": "100596", "name": "ทั่วไป", "src": "bigya", "tx": {"th": {"trade": "Muclear", "generic": "Acetylcysteine 600 mg", "how": "รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง (ละลายในน้ำ 1 แก้ว รอให้ละลายจนหมดแล้วดื่มรวดเดียว)", "ind": "ละลายเสมหะ", "warn": "ระวังในผู้มีประวัติแพ้ยากลุ่ม sulfhydryl", "store": "เก็บรักษาในอุณหภูมิห้อง"}, "en": {"trade": "Muclear", "generic": "Acetylcysteine 600 mg", "how": "Take 1 tablet once daily (Dissolve in a glass of water. Wait until fully dissolved and drink immediately.)", "ind": "Mucolytic agent", "warn": "Use with caution in patients with a history of allergy to sulfhydryl compounds.", "store": "Store at room temperature."}, "ch": {"trade": "Muclear", "generic": "Acetylcysteine 600 mg", "how": "每天服用一次，每次一片（请将药片溶于一杯水中，完全溶解后立即饮用）", "ind": "化痰药 / 祛痰药", "warn": "如对含硫化物（巯基）过敏，请在医生指导下使用", "store": "请存放于室温阴凉处，避免阳光直射"}, "jp": {"trade": "Muclear", "generic": "Acetylcysteine 600 mg", "how": "１日１回、１回１錠を服用してください（コップ１杯の水に溶かし、完全に溶けてからすぐにお飲みください）", "ind": "痰をやわらかくして出しやすくする薬", "warn": "チオール基（-SH）を含む薬剤にアレルギーのある方は使用に注意してください", "store": "室温で保存してください"}, "my": {"trade": "Muclear", "generic": "Acetylcysteine 600 mg", "how": "တစ်နေ့တစ်ကြိမ်၊ တစ်ကြိမ်လျှင် တစ်လုံး服用ပါ။ (ရေတစ်ခွက်အတွင်း ဖြေနှင့် ပြည့်စုံအောင်ဖြေနောက်မွေးပြီးသောက်ပါ။)", "ind": "သွေးချောင်းဖျောက်ဆေး", "warn": "Sulfhydryl အုပ်စုဝင် ဆေးများအပေါ် မှုန်ထူမှုနဲ့ ငြင်းဆန်မှုရှိသူများ အသုံးပြုရာတွင် သတိပြုပါ။", "store": "အခန်းအပင်ချိန်တွင် သိမ်းဆည်းပါ။"}, "kh": {"trade": "Muclear", "generic": "Acetylcysteine 600 mg", "how": "ឱសថ ១គ្រាប់ ក្នុងមួយថ្ងៃ ១លើក (លាយក្នុងទឹកមួយកែវ រង់ចាំរហូតដល់ឱសថលាយរួចហើយ បន្ទាប់មកផឹកអស់ភ្លាមៗ)", "ind": "ឱសថព្យាបាលស្អិតកស្អិតខាងកសើរ", "warn": "សូមប្រុងប្រយ័ត្នប្រសិនបើអ្នកមានប្រវត្តិអាលែកស៊ីនឹងឱសថក្រុម sulfhydryl", "store": "ទុកឱសថនៅសីតុណ្ហភាពបន្ទប់"}}}], "100750": [{"id": "100750-1", "sku": "100750", "name": "ทั่วไป", "src": "bigya", "tx": {"th": {"trade": "Solufen 400 mg 10's", "generic": "Ibuprofen 400 mg", "how": "รับประทานครั้งละ 1 แคปซูล วันละ 3 ครั้ง พร้อมอาหาร เช้า กลางวัน เย็น\n หากมีอาการปวดรุนแรงสามารถทานได้ทันทีโดยไม่ต้องรอพร้อมมื้ออาหาร", "ind": "บรรเทาอาการปวด เช่น ปวดฟัน ปวดกล้ามเนื้อ และลดไข้", "warn": "ควรระวังการใช้ในผู้ป่วยหอบหืดหรือผู้แพ้ยา NSAIDs", "store": "เก็บรักษาที่อุณหภูมิห้อง"}, "en": {"trade": "Solufen 400 mg 10's", "generic": "Ibuprofen 400 mg", "how": "Take 1 capsule, 3 times daily with meals (morning, noon, and evening). For severe pain, may be taken immediately without food.", "ind": "For relief of pain such as toothache, muscle pain, and fever reduction.", "warn": "Use with caution in patients with asthma or those allergic to NSAIDs.", "store": "Store at room temperature."}, "ch": {"trade": "Solufen 400 mg 10's", "generic": "Ibuprofen 400 mg", "how": "每日三次，每次一粒，随餐服用（早、中、晚）。\n如疼痛严重，可立即服用，无需等到饭后。", "ind": "缓解牙痛、肌肉痛，退烧。", "warn": "哮喘患者或对NSAIDs过敏者慎用。", "store": "常温保存。"}, "jp": {"trade": "Solufen 400 mg 10's", "generic": "Ibuprofen 400 mg", "how": "1回1カプセル、1日3回、食後（朝・昼・夕）に服用。\n強い痛みがある場合は、食後を待たずに服用可。", "ind": "歯痛、筋肉痛の緩和、解熱。", "warn": "喘息のある方やNSAIDsにアレルギーのある方は注意。", "store": "室温で保管。"}, "my": {"trade": "Solufen 400 mg 10's", "generic": "Ibuprofen 400 mg", "how": "နေ့ละ ၃ ကြိမ်၊ တစ်ကြိမ်လျှင် မျှတစွာ ၁ လုံး၊ အစာစားပြီး မနက်၊ မွန်းတည့်၊ ညနေတွင်服用ပါ။ အရေးပင်မယ်သောအနေအထား (အကြပ်အနဲ့) တွင် အစာမစားသေးဘဲ服用နိုင်သည်။", "ind": "သွားကိုက်ခြင်း၊ ကြွက်သားနာခြင်း၊ ကိုယ်အပူချိန်ကျဆင်းစေခြင်း။", "warn": "ရှဉ့်သက်ခတ်သူများ၊ NSAIDs နှင့်အာရုံပြုသူများသည် သတိပြုပါ။", "store": "အခန်းအပူချိန်၌သိမ်းဆည်းပါ။"}, "kh": {"trade": "Solufen 400 mg 10's", "generic": "Ibuprofen 400 mg", "how": "ញុំានមួយបំពង់ថ្ងៃបីដង បន្ទាប់ពីបាយពេលព្រឹក ថ្ងៃត្រង់ និងល្ងាច។\nបើមានការឈឺចាប់ខ្លាំង អាចញុំានភ្លាម ដោយមិនចាំបាច់រង់ចាំបាយ។", "ind": "បំបាត់ការឈឺធ្មេញ ឈឺសាច់ដុំ និងបន្ថយក្ដៅខ្លួន។", "warn": "ប្រុងប្រយ័ត្នប្រើប្រាស់សម្រាប់អ្នកមានជម្ងឺហឺត ឬមានអាឡែស៊ីនឹងថ្នាំ NSAIDs។", "store": "រក្សាទុកនៅសីតុណ្ហភាពបន្ទប់។"}}}], "100827": [{"id": "100827-1", "sku": "100827", "name": "single dose เริมที่ปาก", "src": "bigya", "tx": {"th": {"trade": "Valtrex 500 mg 1x10's", "generic": "Valaciclovir 500 mg", "how": "รับประทาน 4 เม็ด วันละ 2 ครั้ง ห่างกัน 12 ชั่วโมง (ใช้เพียง 1 วันเท่านั้น)", "ind": "รักษาเริมที่ปาก (Herpes labialis)", "warn": "แนะนำให้ดื่มน้ำมากๆ ระวังในผู้ป่วยที่มีภาวะไตเสื่อม\nแม้จะใช้ยาแล้ว ยังสามารถแพร่เชื้อเริมได้ในช่วงมีตุ่มพอง", "store": "เก็บรักษาที่อุณหภูมิห้อง"}}}, {"id": "100827-2", "sku": "100827", "name": "เริมที่ผิวหนัง", "src": "bigya", "tx": {"th": {"trade": "Valtrex 500 mg 1x10's", "generic": "Valaciclovir", "how": "รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง เช้า-เย็น", "ind": "รักษาเริมที่ผิวหนังแบบกลับมาเป็นซ้ำ", "warn": "อาจทำให้คลื่นไส้ อาเจียน ดื่มน้ำตามมากๆ", "store": "เก็บรักษาที่อุณหภูมิห้อง"}, "en": {"trade": "Valtrex 500 mg 1x10's", "generic": "Valaciclovir", "how": "Take 1 tablet twice daily, morning and evening.", "ind": "Used for the treatment of recurrent cutaneous herpes simplex infections.", "warn": "May cause nausea and vomiting. Drink plenty of water.", "store": "Store at room temperature."}, "ch": {"trade": "Valtrex 500 mg 1x10's", "generic": "Valaciclovir", "how": "每日早晚各服用1片。", "ind": "用于治疗反复发作的皮肤单纯疱疹感染。", "warn": "可能引起恶心和呕吐，请多喝水。", "store": "请在室温下保存。"}, "jp": {"trade": "Valtrex 500 mg 1x10's", "generic": "Valaciclovir", "how": "朝と夕方に1錠ずつ、1日2回服用してください。", "ind": "再発性皮膚単純ヘルペス感染症の治療に使用されます。", "warn": "吐き気や嘔吐を引き起こすことがあります。水をたくさん飲んでください。", "store": "室温で保管してください。"}, "my": {"trade": "Valtrex 500 mg 1x10's", "generic": "Valaciclovir", "how": "နံနက်နှင့်ညတွင် တစ်နေ့လျှင်နှစ်ကြိမ် တစ်ကြိမ်တစ်လုံး服用ပါ။", "ind": "အသားအရေ ပေါ်တွင် ပြန်လည်ထပ်မံဖြစ်ပွားသော herpes simplex ကိုကုသရန် အသုံးပြုသည်။", "warn": "အန်ခြင်း၊ ဝမ်းပျက်ခြင်း ဖြစ်နိုင်ပါသည်။ ရေများများ သောက်ပါ။", "store": "အခန်းအပူချိန်တွင်သိမ်းဆည်းပါ။"}, "kh": {"trade": "Valtrex 500 mg 1x10's", "generic": "Valaciclovir", "how": "服用មួយគ្រាប់ ពេលព្រឹក និង ពេលល្ងាច រៀងរាល់ថ្ងៃ (២ដងក្នុង១ថ្ងៃ)។", "ind": "ប្រើសម្រាប់ព្យាបាលការឆ្លងវីរុសហឺពីសដែលកើតឡើងជាប្រចាំលើស្បែក។", "warn": "អាចបណ្តាលអោយមានអាការៈក្អក និង ស្រួយចិត្ត។ សូមផឹកទឹកច្រើន។", "store": "សូមរក្សាទុកនៅសីតុណ្ហភាពបន្ទប់ធម្មតា។"}}}, {"id": "100827-3", "sku": "100827", "name": "เริมครั้งแรก", "src": "bigya", "tx": {"th": {"trade": "Valtrex 500 mg 1x10's", "generic": "Valaciclovir", "how": "รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง เช้า-เย็น ติดต่อกัน 10 วัน", "ind": "รักษาเริมผิวหนัง แบบเป็นครั้งแรก", "warn": "อาจทำให้คลื่นไส้ อาเจียน ดื่มน้ำตามมากๆ ทานจนครบ 10 วัน", "store": "เก็บรักษาที่อุณหภูมิห้อง"}, "en": {"trade": "Valtrex 500 mg 1x10's", "generic": "Valaciclovir", "how": "Take 1 tablet twice daily, in the morning and evening, for 10 consecutive days.", "ind": "Used for the treatment of primary cutaneous herpes simplex infection.", "warn": "May cause nausea and vomiting. Drink plenty of water.", "store": "Store at room temperature."}, "ch": {"trade": "Valtrex 500 mg 1x10's", "generic": "Valaciclovir", "how": "每次服用1片，每天2次，早晚各一次，连续服用10天。", "ind": "用于治疗初发性皮肤单纯疱疹感染。", "warn": "可能引起恶心和呕吐，请多喝水。", "store": "请在室温下保存。"}, "jp": {"trade": "Valtrex 500 mg 1x10's", "generic": "Valaciclovir", "how": "朝と夕方に1錠ずつ、1日2回、10日間連続して服用してください。", "ind": "初めて発症した皮膚の単純ヘルペスの治療に使用されます。", "warn": "吐き気や嘔吐を引き起こすことがあります。水をたくさん飲んでください。", "store": "室温で保管してください。"}, "my": {"trade": "Valtrex 500 mg 1x10's", "generic": "Valaciclovir", "how": "နံနက်နှင့်ညအချိန်၌ တစ်နေ့လျှင် နှစ်ကြိမ်၊ တစ်ကြိမ်လျှင် တစ်လုံးစီ服用ပါ။ ဆေး服用ချိန်မှာ ဆက်တိုက် ၁၀ ရက်ကြာ服用ပါ။", "ind": "အသားအရေ ပေါ်တွင် ပထမဆုံးဖြစ်ပွားသော herpes simplex ကို ကုသရန် အသုံးပြုသည်။", "warn": "အန်ခြင်း၊ ဝမ်းပျက်ခြင်း ဖြစ်နိုင်ပါသည်။ ရေများများ သောက်ပါ။", "store": "အခန်းအပူချိန်တွင်သိမ်းဆည်းပါ။"}, "kh": {"trade": "Valtrex 500 mg 1x10's", "generic": "Valaciclovir", "how": "服用មួយគ្រាប់ ពេលព្រឹក និង ពេលល្ងាច រៀងរាល់ថ្ងៃ រយៈពេល ១០ថ្ងៃជាប់ៗគ្នា។", "ind": "ប្រើសម្រាប់ព្យាបាលរោគមេរោគហឺពីសលើស្បែកដែលកើតឡើងជាលើកដំបូង។", "warn": "អាចបណ្តាលអោយមានអាការៈក្អក និង ស្រួយចិត្ត។ សូមផឹកទឹកច្រើន។", "store": "សូមរក្សាទុកនៅសីតុណ្ហភាពបន្ទប់ធម្មតា។"}}}], "100831": [{"id": "100831-1", "sku": "100831", "name": "ทั่วไป", "src": "bigya", "tx": {"th": {"trade": "Vemium", "generic": "Aluhydroxide/Glycryrrhiza/Perppermint Oil", "how": "รับประทานครั้งละ 2 เม็ด หลังอาหาร เช้า-กลางวัน-เย็น", "ind": "ลดจุกเสียดแน่นท้อง ลดกรด ช่วยขับลม ลดแน่นท้อง", "warn": "", "store": "เก็บรักษาที่อุณหภูมิห้อง"}, "en": {"trade": "Vemium", "generic": "Aluhydroxide/Glycryrrhiza/Perppermint Oil", "how": "Take 2 tablets after meals, morning, noon, and evening.", "ind": "For relief of indigestion, acid reduction, and bloating. Helps expel gas.", "warn": "", "store": "Keep at room temperature."}, "ch": {"trade": "Vemium", "generic": "氢氧化铝 / 甘草 / 薄荷油", "how": "每次饭后服用 2 片，早上、中午、晚上各一次。", "ind": "缓解腹胀、胃酸过多、消化不良，帮助排气。", "warn": "", "store": "室温保存。"}}}], "101181": [{"id": "101181-1", "sku": "101181", "name": "ทั่วไป", "src": "bigya", "tx": {"th": {"trade": "Sonap Forte 550 mg", "generic": "Naproxen Sodium 550 mg", "how": "รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง", "ind": "บรรเทาอาการปวด บวม การอักเสบของข้อและกล้ามเนื้อ บรรเทาอาการเจ็บคอ", "warn": "ห้ามใช้ในผู้ที่แพ้ยานี้ หรือผู้ที่มีอาการหอบหืด สตรีตั้งครรภ์ไตรมาศสุดท้าย\nผู้ที่เป็นโรคตับและไตอย่างรุนแรง ติดเชื้อไข้เลือดออก ติดเชื้อไข้เลือดออก ss", "store": "เก็บรักษาที่อุณหภูมิห้อง"}}}], "101325": [{"id": "101325-1", "sku": "101325", "name": "ทั่วไป", "src": "bigya", "tx": {"th": {"trade": "Levocitin 5 mg 1x10's", "generic": "Levocetirizine HCl 5 mg", "how": "รับประทาณครั้งละ 1 เม็ด วันละครั้ง เมื่อมีอาการ", "ind": "บรรเทาอาการแพ้จากภูมิแพ้ เช่น จาม คัดจมูก น้ำมูกไหล ผื่นลมพิษ", "warn": "อาจทำให้ง่วงซึม ควรหลีกเลี่ยงการขับรถหรือทำกิจกรรมที่ต้องใช้สมาธิ", "store": "เก็บรักษาที่อุณหภูมิห้อง"}, "en": {"trade": "Levocitin 5 mg 1x10's", "generic": "Levocetericine HCl 5 mg", "how": "Take 1 tablet once a day when symptoms occur.", "ind": "Relieves allergy symptoms such as sneezing, nasal congestion, runny nose, and hives.", "warn": "May cause drowsiness. Avoid driving or engaging in activities that require concentration.", "store": "Store at room temperature."}, "ch": {"trade": "Levocitin 5 mg 1x10's", "generic": "Levocetirizine HCl 5 mg", "how": "每次服用 1 片，每天 1 次，出现症状时服用。", "ind": "缓解过敏症状，如打喷嚏、鼻塞、流鼻涕和荨麻疹。", "warn": "可能导致嗜睡，避免驾驶或从事需要集中注意力的活动。", "store": "存放在室温下。"}, "jp": {"trade": "Levocitin 5 mg 1x10's", "generic": "Levocetirizine HCl 5 mg", "how": "症状が現れた場合、1回1錠を1日1回服用してください。", "ind": "アレルギー症状（くしゃみ、鼻づまり、鼻水、蕁麻疹）を和らげます。", "warn": "眠気を引き起こすことがありますので、運転や集中を必要とする作業は避けてください。", "store": "室温で保管してください。"}, "my": {"trade": "Levocitin 5 mg 1x10's", "generic": "Levocetirizine HCl 5 mg", "how": "အနာဂတ်တွင်အလားအလာရှိသည့်ရောဂါလက္ခဏာများဖြစ်သည့်အခါ တစ်နေ့တစ်ကြိမ် ၁ ဗုံးကို သောက်ပါ။", "ind": "အလרגီရောဂါလက္ခဏာများ၊ ရာသီဉတုပြောင်းလဲမှုများ၊ မျက်နှာအပေါ်အဆုတ်ဖွဲ့ချိန်နှင့်အဆုတ်ထွက်တက်ခြင်းကိုဖြေရှင်းပါ။", "warn": "အိပ်စက်မိရန်ဖြစ်နိုင်ပါသည်။ ကားမောင်းခြင်း သို့မဟုတ် အာရုံစိုက်မှုလိုအပ်သော လုပ်ဆောင်မှုများကိုရှောင်ကြဉ်ပါ။", "store": "အခန်းအတွင်းအပူချိန်တွင်သိမ်းဆည်းပါ။"}, "kh": {"trade": "Levocitin 5 mg 1x10's", "generic": "Levocetirizine HCl 5 mg", "how": "ទទួលយ៉ាងហោចណាស់ ១ គ្រាប់ក្នុងមួយថ្ងៃ នៅពេលមានរោគសញ្ញា។", "ind": "បន្ថយរោគសញ្ញាអាឡែជីដូចជា ចាប់ខ្យល់ កំពុងមានដៃសំណាញ់ ក្តៅកាត់ និងមាត់មើលកន្រ្តី។", "warn": "អាចបណ្តាលឲ្យមានការអស់កម្លាំង សូមជៀសវាងការបើកបរឬអនុវត្តសកម្មភាពដែលតម្រូវឲ្យមានការផ្តោតអារម្មណ៍។", "store": "សូមរក្សាទុកនៅក្នុងសីតុណ្ហភាពបន្ទប់។"}}}]};
/* products of the same list that have a label, so the search can reach them (price tag data of the dump) */
const PRODUCTS = [{"sku": "100596", "name": "Muclear 600 มก. (อะเซทิลซิสเทอีน ละลายเสมหะ)", "unit": "กล่อง", "price": 209, "units": [["กล่อง", "10 เม็ดฟู่", 209, 1]], "stock": 12}, {"sku": "100750", "name": "Solufen 400 มก. (ไอบูโพรเฟน)", "unit": "แผง", "price": 104, "units": [["แผง", "10 แคปซูล", 104, 1], ["กล่อง", "10 แผง", 702, 10]], "stock": 40}, {"sku": "100827", "name": "Valtrex 500 มก. (วาลาไซโคลเวียร์ ยาต้านไวรัสเริม)", "unit": "กล่อง", "price": 948, "units": [["กล่อง", "10 เม็ด", 948, 1]], "stock": 6}, {"sku": "101181", "name": "Sonap Forte 550 มก. (นาพรอกเซน)", "unit": "แผง", "price": 82, "units": [["แผง", "10 เม็ด", 82, 1]], "stock": 25}, {"sku": "101325", "name": "Levocitin 5 มก. (ลีโวเซทิริซีน แก้แพ้)", "unit": "แผง", "price": 150, "units": [["แผง", "10 เม็ด", 150, 1]], "stock": 18}];
const HAS = { 100596: ['อะเซทิลซิสเทอีน', 'Acetylcysteine'], 100750: ['ไอบูโพรเฟน', 'Ibuprofen'], 100827: ['วาลาไซโคลเวียร์', 'Valaciclovir'], 101181: ['นาพรอกเซน', 'Naproxen'], 101325: ['ลีโวเซทิริซีน', 'Levocetirizine'] };
/* Vemium (100831) has labels in the dump but no product row in this stock sample, so it cannot be searched (QA R3B-13) */
PRODUCTS.forEach(x => { if (!SC.CATALOG.some(i => i.sku === x.sku)) SC.CATALOG.push({ sku: x.sku, name: x.name, qty: 1, unit: x.unit, type: 'ยาอันตราย', price: x.price, how: '', stock: x.stock, has: HAS[x.sku] || [] }); SC.UNITS[x.sku] = x.units; });
/* item 81 changed 20/10 (owner: "มีเมนูจัดการฉลากยาในระบบด้วย" + "สามารถดึง generic เดิมมาทำฉลากได้"): a generic Valaciclovir
   with no label yet, so a label can be started from Valtrex's (same medicine, all languages) */
const GEN_ONLY = { sku: 'TW-00702', name: 'วาลาไซโคลเวียร์ 500 มก. (ยาสามัญ)', qty: 1, unit: 'กล่อง', type: 'ยาอันตราย', price: 420, how: '', stock: 6, has: ['วาลาไซโคลเวียร์', 'Valaciclovir'], gen: 'Valaciclovir 500 mg' };
if (!SC.CATALOG.some(i => i.sku === GEN_ONLY.sku)) SC.CATALOG.push(GEN_ONLY);
SC.UNITS[GEN_ONLY.sku] = [['กล่อง', '10 เม็ด', 420, 1]];
Object.assign(SC.PATH, {
  printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  'clipboard-list': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  'notebook-pen': '<path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>',
  'shopping-bag': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  'package-check': '<path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/>',
  'eye-off': '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>'
});
/* the sample labels of the story's medicines become one label each, marked as samples */
const SAMPLE = Object.fromEntries(Object.entries(SC.LABEL).map(([sku, l]) => [sku, [{ id: sku + '-1', sku, name: 'ทั่วไป', src: 'sample', tx: { th: l } }]]));
SAMPLE['TW-00512'].push({ id: 'TW-00512-2', sku: 'TW-00512', name: 'ปวดฟัน ปวดกล้ามเนื้อ', src: 'sample', tx: { th: { ...SC.LABEL['TW-00512'], how: 'รับประทานครั้งละ 1 ถึง 2 เม็ด ทุก 6 ชั่วโมง เมื่อมีอาการปวด ไม่เกิน 8 เม็ดต่อวัน', ind: 'บรรเทาอาการปวดฟัน ปวดกล้ามเนื้อ' } } });
SC.LABELS = { ...SAMPLE, ...BIGYA };

/* ---------- languages, fields, who may edit ---------- */
SC.LANGS = ['th', 'en', 'ch', 'jp', 'my', 'kh'];
const HL = SC.HTML_LANG = { th: 'th', en: 'en', ch: 'zh', jp: 'ja', my: 'my', kh: 'km' };
const FIELDS = [['trade', 'ชื่อการค้า'], ['generic', 'ชื่อยา'], ['how', 'วิธีใช้'], ['ind', 'ข้อบ่งใช้'], ['warn', 'ข้อควรระวัง'], ['store', 'เก็บรักษา']];
const FH = Object.fromEntries([['name', 'ชื่อฉลาก'], ...FIELDS]);
const MAX = { name: 40, trade: 80, generic: 80, how: 160, ind: 160, warn: 200, store: 80 };
const NEED = ['name', 'trade', 'generic', 'how'];
const TXT = ['generic', 'how', 'ind', 'warn', 'store'];
const lname = SC.lname = k => SC.LABEL_HEAD[k][0];
const tidy = s => String(s || '').trim();
SC.canLabel = () => { const m = SC.me(); return !!m.admin || /^ภ\./.test(m.lic || ''); };
/* an edit sits on top of the label: who and when, the languages written again, what AI wrote and what was left behind */
const withEdit = v => {
  const e = (SC.S.lblEdit || {})[v.id];
  return e ? { ...v, name: e.name || v.name, tx: { ...v.tx, ...e.tx }, ai: { ...(v.ai || {}), ...e.ai }, miss: { ...(v.miss || {}), ...e.miss }, stale: e.stale || [], ed: { by: e.by, at: e.at }, hist: e.hist || [], ver: 1 + (e.hist || []).length } : v;
};
SC.labelsOf = sku => [...(SC.LABELS[sku] || []), ...((SC.S.lblAdd || {})[sku] || [])].map(withEdit);
const lblSkus = SC.lblSkus = () => [...new Set([...Object.keys(SC.LABELS), ...Object.keys(SC.S.lblAdd || {})])];
SC.labelById = id => { for (const s of lblSkus()) { const v = SC.labelsOf(s).find(x => x.id === id); if (v) return v; } return null; };
SC.lblLangs = v => SC.LANGS.filter(k => v.tx[k]);
/* the label picked for this line of the order (the first one until the pharmacist picks), in Thai */
SC.labelOf = it => { const ls = SC.labelsOf(it.sku), v = ls.find(x => x.id === it.lbl) || ls[0]; return v ? { ...v.tx.th, v } : null; };
SC.labelTx = (it, lang) => { const l = SC.labelOf(it); return l ? (l.v.tx[lang] || l.v.tx.th) : null; };
SC.prodOf = sku => SC.CATALOG.find(i => i.sku === sku) || null;
/* the medicine inside, to find labels of the same medicine under another brand (Valaciclovir = Valacyclovir) */
const norm = s => String(s || '').toLowerCase().replace(/[^a-z]/g, '').replace(/y/g, 'i');
const genOf = sku => SC.prodOf(sku)?.gen || SC.labelsOf(sku)[0]?.tx.th.generic || (SC.prodOf(sku)?.has || []).find(x => /^[A-Za-z]/.test(x)) || '';
SC.ingOf = sku => norm(genOf(sku).split(/\s+/)[0]);
const strength = g => String(g || '').split(/\s+/).slice(1).join(' ');
const srcTag = v => (v.src === 'bigya' ? ui.tag('ฉลากเดิมของร้าน', 'line', { icon: 'file-text' }) : v.src === 'added' ? ui.tag(`เพิ่มโดย ${v.by} ${v.at}`, 'ok', { icon: 'plus' }) : ui.tag('ตัวอย่าง', 'muted')) + (v.ed ? ui.tag(`แก้โดย ${v.ed.by} ${v.ed.at}`, 'ok', { icon: 'pencil' }) : '');
SC.lblSrcTag = srcTag;

/* ---------- AI translation (owner 20/10: "มี AI แปลภาษาด้วย") ----------
   Simulated in the prototype: it knows the phrases the shop's labels use most. A phrase it does not know stays in Thai
   and the field is marked, so nothing half-translated reaches a sticker unseen. Built for real this is a translation
   model; whoever runs it, a pharmacist reads each language and presses "ตรวจคำแปลแล้ว" before it can be printed */
const N = '(\\d+(?:\\.\\d+)?)';
const UN = { 'เม็ด': ['tablet', '片', '錠', 'လုံး', 'គ្រាប់'], 'แคปซูล': ['capsule', '粒', 'カプセル', 'တောင့်', 'គ្រាប់'], 'ซอง': ['sachet', '袋', '包', 'ထုပ်', 'កញ្ចប់'] };
const LI = { en: 0, ch: 1, jp: 2, my: 3, kh: 4 };
const un = (w, k, n) => k === 'en' ? UN[w][0] + (+n === 1 ? '' : 's') : UN[w][LI[k]];
const PH = [
  [`รับประทานครั้งละ ${N} ถึง ${N} (เม็ด|แคปซูล|ซอง)`, (m, k) => ({ en: `take ${m[1]} to ${m[2]} ${un(m[3], k, 2)}`, ch: `口服，每次${m[1]}至${m[2]}${un(m[3], k)}`, jp: `1回${m[1]}〜${m[2]}${un(m[3], k)}を服用`, my: `တစ်ကြိမ်လျှင် ${m[1]} မှ ${m[2]} ${un(m[3], k)} သောက်ပါ`, kh: `លេបម្ដង ${m[1]} ទៅ ${m[2]} ${un(m[3], k)}` })[k]],
  [`รับประทานครั้งละ ${N} (เม็ด|แคปซูล|ซอง)`, (m, k) => ({ en: `take ${m[1]} ${un(m[2], k, m[1])}`, ch: `口服，每次${m[1]}${un(m[2], k)}`, jp: `1回${m[1]}${un(m[2], k)}を服用`, my: `တစ်ကြိမ်လျှင် ${m[1]} ${un(m[2], k)} သောက်ပါ`, kh: `លេបម្ដង ${m[1]} ${un(m[2], k)}` })[k]],
  [`(?:รับประทาน)?ครั้งละ ${N} มล\\.`, (m, k) => ({ en: `take ${m[1]} ml`, ch: `每次${m[1]}毫升`, jp: `1回${m[1]}mL`, my: `တစ်ကြိမ်လျှင် ${m[1]} မီလီလီတာ`, kh: `ម្ដង ${m[1]} មីលីលីត្រ` })[k]],
  [`อมครั้งละ ${N} เม็ด`, (m, k) => ({ en: `dissolve ${m[1]} lozenge${+m[1] === 1 ? '' : 's'} in the mouth`, ch: `每次含服${m[1]}片`, jp: `1回${m[1]}錠を口の中で溶かす`, my: `တစ်ကြိမ်လျှင် ${m[1]} လုံး ပါးစပ်ထဲတွင် ငုံပါ`, kh: `បៀមម្ដង ${m[1]} គ្រាប់` })[k]],
  [`ครั้งละ ${N} (เม็ด|แคปซูล|ซอง)`, (m, k) => ({ en: `${m[1]} ${un(m[2], k, m[1])} each time`, ch: `每次${m[1]}${un(m[2], k)}`, jp: `1回${m[1]}${un(m[2], k)}`, my: `တစ်ကြိမ်လျှင် ${m[1]} ${un(m[2], k)}`, kh: `ម្ដង ${m[1]} ${un(m[2], k)}` })[k]],
  [`วันละ ${N} ครั้ง`, (m, k) => ({ en: +m[1] === 1 ? 'once daily' : +m[1] === 2 ? 'twice daily' : `${m[1]} times daily`, ch: `每日${m[1]}次`, jp: `1日${m[1]}回`, my: `တစ်နေ့ ${m[1]} ကြိမ်`, kh: `ថ្ងៃ ${m[1]} ដង` })[k]],
  [`ทุก ${N} ถึง ${N} ชั่วโมง`, (m, k) => ({ en: `every ${m[1]} to ${m[2]} hours`, ch: `每${m[1]}至${m[2]}小时一次`, jp: `${m[1]}〜${m[2]}時間ごと`, my: `${m[1]} မှ ${m[2]} နာရီခြား တစ်ကြိမ်`, kh: `រៀងរាល់ ${m[1]} ទៅ ${m[2]} ម៉ោង` })[k]],
  [`ทุก ${N} ชั่วโมง`, (m, k) => ({ en: `every ${m[1]} hours`, ch: `每${m[1]}小时一次`, jp: `${m[1]}時間ごと`, my: `${m[1]} နာရီခြား တစ်ကြိမ်`, kh: `រៀងរាល់ ${m[1]} ម៉ោង` })[k]],
  [`ติดต่อกัน ${N} วัน`, (m, k) => ({ en: `for ${m[1]} days`, ch: `连续${m[1]}天`, jp: `${m[1]}日間続けて`, my: `${m[1]} ရက် ဆက်တိုက်`, kh: `រយៈពេល ${m[1]} ថ្ងៃ` })[k]],
  [`ไม่เกิน ${N} (เม็ด|แคปซูล) ?ต่อวัน`, (m, k) => ({ en: `not more than ${m[1]} ${un(m[2], k, m[1])} a day`, ch: `每日不超过${m[1]}${un(m[2], k)}`, jp: `1日${m[1]}${un(m[2], k)}まで`, my: `တစ်နေ့ ${m[1]} ${un(m[2], k)} ထက် မပိုရ`, kh: `មិនលើសពី ${m[1]} ${un(m[2], k)} ក្នុងមួយថ្ងៃ` })[k]]
];
const FX = [
  ['หลังอาหารทันที', 'immediately after meals', '饭后立即服用', '食直後', 'အစာစားပြီး ချက်ချင်း', 'ភ្លាមៗក្រោយអាហារ'],
  ['หลังอาหาร', 'after meals', '饭后', '食後', 'အစာစားပြီးနောက်', 'ក្រោយអាហារ'],
  ['ก่อนอาหาร', 'before meals', '饭前', '食前', 'အစာမစားမီ', 'មុនអាហារ'],
  ['ก่อนนอน', 'at bedtime', '睡前', '就寝前', 'အိပ်ရာဝင်ချိန်', 'មុនចូលគេង'],
  ['เช้า กลางวัน เย็น', 'morning, noon and evening', '早、中、晚', '朝・昼・夕', 'မနက် နေ့လယ် ညနေ', 'ព្រឹក ថ្ងៃត្រង់ ល្ងាច'],
  ['เช้า-เย็น|เช้า เย็น', 'morning and evening', '早晚各一次', '朝・夕', 'မနက်နှင့် ညနေ', 'ព្រឹក និង ល្ងាច'],
  ['เมื่อมีไข้หรือปวด', 'for fever or pain', '发烧或疼痛时', '発熱・痛みのある時', 'အဖျား သို့မဟုတ် နာကျင်သည့်အခါ', 'ពេលក្ដៅខ្លួន ឬឈឺចាប់'],
  ['เมื่อมีอาการปวด|เมื่อปวด', 'when in pain', '疼痛时', '痛む時', 'နာကျင်သည့်အခါ', 'ពេលឈឺចាប់'],
  ['เมื่อมีอาการ', 'when needed', '必要时', '症状がある時', 'လိုအပ်သည့်အခါ', 'ពេលមានរោគសញ្ញា'],
  ['ทานติดต่อกันจนหมด|ทานจนหมด', 'finish all the medicine', '须服完全部药量', '飲み切ること', 'ဆေးကုန်သည်အထိ သောက်ပါ', 'លេបរហូតដល់អស់'],
  ['เก็บรักษาที่อุณหภูมิห้อง|เก็บที่อุณหภูมิห้อง|เก็บรักษาในอุณหภูมิห้อง', 'store at room temperature', '室温保存', '室温で保管', 'အခန်းအပူချိန်တွင် သိမ်းဆည်းပါ', 'រក្សាទុកនៅសីតុណ្ហភាពបន្ទប់'],
  ['พ้นแสงแดด', 'away from sunlight', '避光', '直射日光を避ける', 'နေရောင်နှင့် ဝေးရာတွင်', 'ឆ្ងាយពីពន្លឺថ្ងៃ'],
  ['พ้นความชื้น', 'away from moisture', '防潮', '湿気を避ける', 'စိုထိုင်းဆနှင့် ဝေးရာတွင်', 'ឆ្ងាយពីសំណើម'],
  ['ลดไข้', 'reduces fever', '退烧', '解熱', 'အဖျားကျစေသည်', 'បញ្ចុះកំដៅ'],
  ['บรรเทาอาการปวด|บรรเทาปวด', 'relieves pain', '止痛', '鎮痛', 'နာကျင်မှု သက်သာစေသည်', 'បំបាត់ការឈឺចាប់'],
  ['ละลายเสมหะ', 'loosens phlegm', '化痰', '去痰', 'သလိပ် ပျော်စေသည်', 'រំលាយស្លេស្ម'],
  ['บรรเทาอาการแพ้', 'relieves allergy symptoms', '缓解过敏症状', 'アレルギー症状を和らげる', 'ဓာတ်မတည့်မှု လက္ခဏာ သက်သာစေသည်', 'បំបាត់រោគសញ្ញាអាឡែកហ្ស៊ី'],
  ['ลดน้ำมูก', 'reduces runny nose', '减少流涕', '鼻水を抑える', 'နှာရည်ယိုခြင်း သက်သာစေသည်', 'កាត់បន្ថយសំបោរ'],
  ['บรรเทาอาการเจ็บคอ', 'relieves sore throat', '缓解咽喉痛', 'のどの痛みを和らげる', 'လည်ချောင်းနာ သက်သာစေသည်', 'បំបាត់ការឈឺបំពង់ក'],
  ['อาจทำให้ง่วงซึม|อาจทำให้ง่วง', 'may cause drowsiness', '可能引起嗜睡', '眠気を催すことがある', 'အိပ်ငိုက်စေနိုင်သည်', 'អាចធ្វើឱ្យងងុយគេង'],
  ['ห้ามขับขี่หรือทำงานกับเครื่องจักร', 'do not drive or operate machinery', '服药期间勿驾驶或操作机器', '車の運転や機械の操作をしないこと', 'ကားမောင်းခြင်း စက်ကိုင်ခြင်း မပြုရ', 'កុំបើកបរ ឬប្រើគ្រឿងម៉ាស៊ីន'],
  ['ดื่มน้ำมาก ๆ', 'drink plenty of water', '多喝水', '水分を多くとること', 'ရေများများ သောက်ပါ', 'ផឹកទឹកឱ្យបានច្រើន'],
  ['ระหว่างใช้ยา', 'while taking this medicine', '用药期间', '服用中は', 'ဆေးသောက်နေစဉ်', 'ពេលកំពុងប្រើថ្នាំ'],
  ['ห้ามใช้เกินขนาดที่ระบุ', 'do not exceed the stated dose', '勿超过规定剂量', '用量を守ること', 'သတ်မှတ်ထားသော ပမာဏထက် မပိုရ', 'កុំប្រើលើសកម្រិតដែលបានកំណត់']
].map(([p, ...t]) => [new RegExp('^(?:' + p + ')'), t]);
const PHR = PH.map(([p, f]) => [new RegExp('^(?:' + p + ')'), f]);
const SEP = { en: ', ', ch: '，', jp: '、', my: ' ', kh: ' ' };
const trTxt = (s, k) => {
  let rest = tidy(s), miss = false; const out = [];
  while (rest) {
    let hit = null;
    for (const [re, f] of PHR) { const m = rest.match(re); if (m) { hit = [m[0], f(m, k)]; break; } }
    if (!hit) for (const [re, t] of FX) { const m = rest.match(re); if (m) { hit = [m[0], t[LI[k]]]; break; } }
    if (!hit) { const w = rest.match(/^\S+/)[0]; hit = [w, w]; miss = miss || /[฀-๿]/.test(w); }
    out.push(hit[1]); rest = rest.slice(hit[0].length).trim();
  }
  const t = out.join(SEP[k]);
  return [k === 'en' && t ? t[0].toUpperCase() + t.slice(1) : t, miss];
};
SC.aiTx = (th, k) => {
  const t = {}, miss = [], thai = /[฀-๿]/;
  t.generic = tidy(th.generic);
  t.trade = thai.test(th.trade || '') ? t.generic : tidy(th.trade).replace(/\s*\[[^\]]*\]\s*$/, '');
  ['how', 'ind', 'warn', 'store'].forEach(f => { const [x, m] = trTxt(th[f], k); t[f] = x; if (m) miss.push(f); });
  if (thai.test(t.generic)) miss.push('generic');
  return { t, miss };
};
const thOf = f => Object.fromEntries(FIELDS.map(([x]) => [x, tidy(f[x])]));

/* ---------- state of one language: "" written or checked by a person · ai = AI wrote it, not checked · stale = Thai changed after ---------- */
SC.lblState = (v, k) => k === 'th' ? '' : (v.stale || []).includes(k) ? 'stale' : v.ai?.[k] === 'ai' ? 'ai' : '';
const stTag = (v, k) => {
  const s = SC.lblState(v, k), a = v.ai?.[k];
  return s === 'ai' ? ui.tag('แปลด้วย AI ยังไม่ตรวจ', 'warn', { icon: 'sparkles' }) : s === 'stale' ? ui.tag('ยังเป็นข้อความเดิม ไม่ตรงกับภาษาไทย', 'warn', { icon: 'triangle-alert' })
    : a?.by ? ui.tag(`แปลด้วย AI ตรวจแล้ว โดย ${a.by}`, 'ok', { icon: 'check' }) : '';
};
SC.lblStTag = stTag;

/* ---------- one label, read (owner 20/10: "ฉลากเนี่ยไม่ต้องโชว์ของจริงในหน้า UI หรอก แค่โชว์ชื่อฉลากและรายละเอียดก็พอ
   รวมถึงให้แก้ไข quick edit ได้ แต่ตอนพิมพ์ให้ใช้ format จริง") ---------- */
SC.lblDetail = (v, k) => {
  const t = v.tx[k] || v.tx.th, miss = (v.miss || {})[k] || [];
  return `<dl class="lb-dl" lang="${HL[k]}">${FIELDS.map(([f, h]) => `<div class="lb-r${miss.includes(f) ? ' miss' : ''}"><dt lang="th">${h}</dt><dd>${t[f] ? esc(t[f]) : '<span class="small" lang="th">ไม่ได้ระบุ</span>'}${miss.includes(f) ? '<span class="small warn-t" lang="th"> · มีคำที่ AI แปลไม่ได้ แก้เอง</span>' : ''}</dd></div>`).join('')}</dl>`;
};
SC.lblBody = (v, k, o = {}) => {
  const Q = SC.S.lblQE, can = SC.canLabel(), st = SC.lblState(v, k);
  if (Q && Q.id === v.id && Q.lang === k) return SC.lblQuick(v);
  /* owner 20/10 item 80: "แก้ภาษาไทยเท่านั้น": other languages come from the Thai text through AI and a pharmacist's check */
  const b = [can && k === 'th' ? ui.btn('แก้ไขด่วน', { kind: 'secondary', sm: true, a: 'qeOpen', v: `${v.id}|th`, icon: 'pencil' }) : '',
    can && st === 'ai' ? ui.btn('ตรวจคำแปลแล้ว', { kind: 'secondary', sm: true, a: 'aiOk', v: `${v.id}|${k}`, icon: 'check' }) : '',
    can && st === 'stale' ? ui.btn('แปลใหม่ด้วย AI', { kind: 'secondary', sm: true, a: 'aiRe', v: `${v.id}|${k}`, icon: 'sparkles' }) : '',
    ui.btn('ดูก่อนพิมพ์', { kind: 'ghost', sm: true, a: o.printA || 'lblPrintOne', v: o.printV || `${v.id}|${k}`, icon: 'printer' }), o.acts || '',
    can && k !== 'th' ? `<span class="small lb-hint">${ic('info', 13, 2)}ภาษา${lname(k)}แก้ไม่ได้ แก้ภาษาไทยแล้ว AI แปลให้</span>` : ''].join('');
  return `${st || v.ai?.[k]?.by ? `<div class="hrow wrap mt8">${stTag(v, k)}</div>` : ''}${SC.lblDetail(v, k)}<div class="btn-row lb-acts">${b}</div>`;
};
SC.lblLangSeg = (v, k, a, key) => { const ls = SC.lblLangs(v); return ls.length > 1 ? `<div class="lbl-lang"><span class="small">ภาษาฉลาก</span>${ui.seg(ls.map(x => [`${key}|${x}`, lname(x)]), `${key}|${k}`, { a, label: 'ภาษาฉลาก' })}</div>` : ''; };

/* ---------- quick edit, in place ---------- */
SC.lblQuick = v => {
  const Q = SC.S.lblQE, k = 'th', err = Q.err || {}, th = true, others = SC.lblLangs(v).filter(x => x !== 'th');
  const fld = (f, ta) => { const req = th && NEED.includes(f); return ui.field({ id: 'qe-' + f, label: f === 'name' ? 'ชื่อฉลาก (ใช้กับอาการไหน)' : FH[f], value: Q.f[f] || '', req, optional: !req, textarea: !!ta, rows: ta || undefined, error: err[f] || '', a: 'qe_' + f, max: MAX[f], cls: 'lf-f' + (ta || f === 'name' ? ' lf-full' : '') }); };
  return `<div class="lb-qe" id="qeBody">
    ${ui.note(`<b>แก้ไขด่วน: ฉลาก${th ? '' : lname(k)} "${esc(v.name)}"</b><p>บันทึกแล้วทุกสาขาเห็นทันที</p>`, { tone: 'warn' })}
    <div class="lf-g mt12" lang="${HL[k]}">${th ? fld('name') : ''}${fld('trade')}${fld('generic')}${fld('how', 2)}${fld('ind', 2)}${fld('warn', 2)}${fld('store')}</div>
    ${others.length ? `<p class="small mt12">${ic('sparkles', 13, 2)} บันทึกแล้ว AI แปลภาษา${others.map(lname).join(' ')}ตามภาษาไทยให้ · พิมพ์ภาษาอื่นได้เมื่อเภสัชกรกด "ตรวจคำแปลแล้ว"</p>` : ''}
    <div class="btn-row mt12">${ui.btn('ยกเลิก', { kind: 'secondary', sm: true, a: 'qeCancel' })}${ui.btn('บันทึก ทุกสาขา', { sm: true, a: 'qeSave', icon: 'check' })}</div></div>`;
};
document.addEventListener('input', e => {
  const k = e.target.dataset?.in; if (!k) return;
  if (k.startsWith('qe_') && SC.S.lblQE) SC.S.lblQE.f[k.slice(3)] = e.target.value;
  if (k.startsWith('nl_') && k !== 'nl_sku' && SC.S.lblNew) SC.S.lblNew.f[k.slice(3)] = e.target.value;
});
SC.act('qeOpen', t => {
  const [id] = t.dataset.v.split('|'), k = 'th', v = SC.labelById(id); if (!v || !SC.canLabel()) return;
  const x = v.tx[k] || {};
  SC.S.lblQE = { id, lang: k, err: {}, f: { name: v.name, ...Object.fromEntries(FIELDS.map(([f]) => [f, x[f] || ''])) } };
  SC.refresh(); requestAnimationFrame(() => $('#qe-name')?.focus());
});
SC.act('qeCancel', () => { SC.S.lblQE = null; SC.refresh(); });
const editOf = v => { const S = SC.S; return ((S.lblEdit = S.lblEdit || {})[v.id] = S.lblEdit[v.id] || { tx: {}, ai: {}, miss: {}, stale: [...(v.stale || [])] }); };
/* a line of the open order that still carries the label's old text follows the edit (never a child's weight-based text) */
const followHow = (v, was, now) => {
  const c = SC.cur(); if (c?.id !== 'order' || was === now) return;
  const o = SC.orderOf(c), p = SC.casePerson(SC.CASES[o.key]); if (p.child || p.age < 12) return;
  o.items.forEach(it => { if (it.sku === v.sku && (it.lbl === v.id || (!it.lbl && SC.labelsOf(v.sku).length === 1)) && tidy(it.how) === tidy(was)) it.how = now; });
};
SC.act('qeSave', () => {
  const Q = SC.S.lblQE, v = SC.labelById(Q.id), k = Q.lang, th = k === 'th', f = Q.f, err = {}, was = v.tx[k] || {};
  if (th) NEED.forEach(x => { if (!tidy(f[x])) err[x] = `ใส่${FH[x]}`; });
  if (th) ['how', 'ind'].forEach(x => { if (err[x] || tidy(f[x]) === tidy(was[x])) return; const d = SC.dxHits(f[x]); if (d.length) err[x] = `มีคำที่เป็นชื่อโรค: ${d.join(', ')} · เปลี่ยนเป็นคำบรรยายอาการ`; });
  const nm = s => tidy(s).replace(/\s+/g, ' ').toLowerCase();
  if (th && !err.name && SC.labelsOf(v.sku).some(x => x.id !== v.id && nm(x.name) === nm(f.name))) err.name = 'ยาตัวนี้มีฉลากชื่อนี้แล้ว ตั้งชื่อให้ต่างกัน เช่น บอกอาการที่ใช้';
  Q.err = err;
  if (Object.keys(err).length) { SC.refresh(); requestAnimationFrame(() => $('#qe-' + Object.keys(err)[0])?.focus()); return; }
  const e = editOf(v), nt = thOf(f), others = SC.lblLangs(v).filter(x => x !== 'th');
  /* log 1 (FDA review, owner 20/10 "ต้องเก็บ log ด้วย"): who, when, what it said before and after. Old versions are never deleted */
  const ch = [...(th && tidy(f.name) !== tidy(v.name) ? [['ชื่อฉลาก', v.name, tidy(f.name)]] : []), ...FIELDS.filter(([x]) => tidy(was[x]) !== nt[x]).map(([x, h]) => [h, tidy(was[x]), nt[x]])];
  if (ch.length) { e.hist = [...(e.hist || []), { by: SC.me().short, at: `${SC.NOW.date} ${SC.clockStr()}`, ch }]; SC.logEv('label', `แก้ฉลาก "${tidy(f.name) || v.name}" เป็นฉบับ ${1 + e.hist.length}`, v.sku); }
  e.tx[k] = nt; e.by = SC.me().short; e.at = SC.NOW.date; e.ai[k] = ''; e.miss[k] = []; e.stale = e.stale.filter(x => x !== k);
  let note = '';
  if (th) {
    e.name = tidy(f.name);
    if (others.length && TXT.some(x => nt[x] !== tidy(was[x]))) {
      others.forEach(x => { const r = SC.aiTx(nt, x); e.tx[x] = r.t; e.ai[x] = 'ai'; e.miss[x] = r.miss; }); e.stale = []; note = ` · AI แปลภาษาอื่นตามแล้ว ${others.length} ภาษา รอเภสัชกรตรวจ`;
    }
    followHow(v, was.how, nt.how);
  }
  SC.S.lblQE = null; SC.refresh();
  SC.toast(`บันทึกฉลาก "${e.name || v.name}"${th ? '' : ` ภาษา${lname(k)}`} แล้ว ทุกสาขาเห็น${note}`, 'pencil');
});
SC.act('aiOk', t => { const [id, k] = t.dataset.v.split('|'), v = SC.labelById(id); if (!v || !SC.canLabel()) return; const e = editOf(v); e.ai[k] = { by: SC.me().short, at: SC.NOW.date }; e.by = e.by || SC.me().short; e.at = e.at || SC.NOW.date; SC.refresh(); SC.toast(`ตรวจคำแปลภาษา${lname(k)}แล้ว พิมพ์ได้`, 'check'); });
const aiFill = async (t, v, langs) => {
  await SC.busy(t, 800);
  const e = editOf(v), th = v.tx.th;
  langs.forEach(x => { const r = SC.aiTx(th, x); e.tx[x] = r.t; e.ai[x] = 'ai'; e.miss[x] = r.miss; });
  e.stale = e.stale.filter(x => !langs.includes(x)); e.by = SC.me().short; e.at = SC.NOW.date;
  SC.refresh(); SC.toast(`AI แปล ${langs.map(lname).join(' ')} แล้ว ตรวจก่อนพิมพ์`, 'sparkles');
};
SC.act('aiRe', t => { const [id, k] = t.dataset.v.split('|'), v = SC.labelById(id); if (v && SC.canLabel()) aiFill(t, v, [k]); });
SC.act('aiAdd', t => { const v = SC.labelById(t.dataset.v); if (v && SC.canLabel()) aiFill(t, v, SC.LANGS.filter(k => !v.tx[k])); });

/* ---------- the real sticker, only to print: 90 x 65 mm, layout, lines, fields and point sizes of PrintPageLabel in
   BIGYA Label 2025 (1/100 inch units turned into mm). Owner 20/10 item 77: the text is the label's own, from the label
   system ("ใช้ข้อมูลเดิมของฉลากที่มีจากระบบจัดการฉลากยา"); a line of an order only brings its unit ---------- */
SC.sticker = (v, lang, it) => {
  const b = SC.branch(), H = SC.LABEL_HEAD[lang] || SC.LABEL_HEAD.th, t = v.tx[lang] || v.tx.th, th = lang === 'th';
  const trade = th && it && SC.lblTrade ? SC.lblTrade(t, it) : t.trade, how = t.how;
  return `<div class="lbl-wrap"><div class="lbl lg-${lang}" lang="${HL[lang] || 'th'}" role="img" aria-label="ฉลากยา ขนาดจริง 90 x 65 มม.">
      <b class="lbl-b1">มิตรอารี ${esc(b.short)}</b><i class="lbl-l1"></i><b class="lbl-b2">MITRAREE ${esc(b.en)}</b>
      <span class="lbl-r lbl-ph">${ic('phone', 11, 2.2)}${esc(b.phone)}</span><span class="lbl-r lbl-web">www.mitraree.com</span>
      <span class="lbl-r lbl-dt">${th ? 'วันที่' : 'Date'} : ${SC.NOW.date}</span><i class="lbl-l2"></i>
      <p class="lbl-tr">${esc(H[1])}: ${esc(trade)}</p>
      <p class="lbl-gn lbl-2">${esc(H[2])}: ${esc(t.generic)}</p><i class="lbl-l3"></i>
      <b class="lbl-dh">${esc(H[3])}:</b><i class="lbl-l4"></i>
      <p class="lbl-hw lbl-2">${esc(how)}</p><i class="lbl-l5"></i>
      <p class="lbl-in lbl-2"><b>${esc(H[4])}:</b> ${esc(t.ind)}</p>
      <p class="lbl-wn lbl-2"><b>${esc(H[5])}:</b> ${esc(t.warn)}</p>
      <p class="lbl-st"><b>${esc(H[6])}:</b> ${esc(t.store)}</p>${SC.logo({ cls: 'lbl-lg' })}
    </div></div>`;
};
/* text longer than its box is cut when printed: every sticker on the page (shown or kept off-screen to measure) says so */
const CUT = [['.lbl-tr', 'ชื่อการค้า'], ['.lbl-gn', 'ชื่อยา'], ['.lbl-hw', 'วิธีใช้'], ['.lbl-in', 'ข้อบ่งใช้'], ['.lbl-wn', 'ข้อควรระวัง'], ['.lbl-st', 'เก็บรักษา']];
SC.lblCutCheck = root => $$('[data-lblbox]', root).forEach(box => {
  const L = $('.lbl', box), w = $('.lbl-cut', box); if (!L || !w) return;
  /* Thai marks reach a pixel or two above and below the line box: only a hidden word or a hidden line counts */
  const cut = CUT.filter(([s]) => { const e = $(s, L); return e && (e.scrollHeight > e.clientHeight + 6 || e.scrollWidth > e.clientWidth + 1); }).map(x => x[1]);
  w.hidden = !cut.length; $('span', w).textContent = `ข้อความยาวเกินช่องฉลาก พิมพ์จริงจะถูกตัด: ${cut.join(', ')} · ย่อข้อความหรือแก้ฉลาก`;
});
SC.on('rendered', () => SC.lblCutCheck(document));

/* ---------- print preview: the real format, one or several stickers ---------- */
SC.lblPrint = (list, title, back) => { SC.S.lblPrint = { list, title, back }; SC.openOv(printOv); };
const printOv = () => {
  const P = SC.S.lblPrint, kOf = (v, x) => SC.lblLangs(v).includes(x.lang) ? x.lang : 'th';
  const rows = P.list.map((x, n) => {
    const v = SC.labelById(x.id); if (!v) return '';
    const k = kOf(v, x), st = SC.lblState(v, k);
    return `<section class="lp-item" data-lblbox><div class="hrow wrap lp-h"><b class="grow">${esc(x.title || v.name)}</b>${SC.lblLangSeg(v, k, 'lpLang', n)}</div>
      ${st ? `<p class="small warn-t mt8">${ic('triangle-alert', 13, 2)}${st === 'ai' ? 'คำแปลนี้ AI เขียน ยังไม่มีเภสัชกรตรวจ' : 'ภาษาไทยแก้แล้ว ฉลากภาษานี้ยังเป็นข้อความเดิม'}</p>` : ''}
      ${SC.sticker(v, k, x.it)}<p class="small warn-t lbl-cut" hidden>${ic('triangle-alert', 13, 2)}<span></span></p></section>`;
  }).join('');
  const ai = P.list.some(x => { const v = SC.labelById(x.id); return v && SC.lblState(v, kOf(v, x)) === 'ai'; });
  return `<div class="scrim" data-a="lpClose"></div><div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="mdT">
    <div class="modal-h"><span class="brand-t">${ic('printer', 24, 2)}</span><div class="grow"><h2 id="mdT">${esc(P.title || 'ดูก่อนพิมพ์ฉลากยา')}</h2><p>ขนาดจริง 90 x 65 มม. รูปแบบเดียวกับฉลากที่ร้านพิมพ์ตอนนี้ · ${P.list.length} ดวง</p></div>${ui.ib('x', 'ปิด', { a: 'lpClose' })}</div>
    <div class="modal-b lp-b">${rows}</div>
    <div class="modal-f">${ai ? `<p class="small warn-t grow">${ic('lock', 13, 2)} มีคำแปลที่ AI เขียนยังไม่ตรวจ ให้เภสัชกรกด "ตรวจคำแปลแล้ว" ก่อน หรือเลือกภาษาไทย</p>` : '<span class="sp"></span>'}${ui.btn(P.back ? 'กลับ' : 'ปิด', { kind: 'secondary', a: 'lpClose' })}${ui.btn(`พิมพ์ฉลาก (${P.list.length} ดวง)`, { a: 'lblPrintGo', icon: 'printer', disabled: ai, title: ai ? 'ตรวจคำแปลก่อนพิมพ์' : '' })}</div></div>`;
};
SC.act('lpLang', t => { const [n, k] = t.dataset.v.split('|'); SC.S.lblPrint.list[+n].lang = k; SC.refresh(); });
SC.act('lblPrintOne', t => { const [id, k] = t.dataset.v.split('|'); SC.lblPrint([{ id, lang: k }]); });
const lpBack = () => { const b = SC.S.lblPrint?.back; SC.S.lblPrint = null; if (b) SC.openOv(b); else SC.closeOv(); };
SC.act('lpClose', lpBack);
SC.act('lblPrintGo', async t => { const n = SC.S.lblPrint.list.length; await SC.busy(t, 600); lpBack(); SC.toast(`จำลอง: ส่งฉลาก ${n} ดวงไปเครื่องพิมพ์ฉลากแล้ว`, 'printer'); });

/* ---------- pick a label (S303) ---------- */
const ordItem = i => SC.orderOf(SC.cur()).items[+i];
const pickOv = () => {
  const P = SC.S.lblPick, it = ordItem(P.i), ls = SC.labelsOf(it.sku), cur = P.sel || it.lbl || ls[0]?.id, can = SC.canLabel(), Q = SC.S.lblQE;
  return `<div class="scrim" data-a="ovClose"></div><div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="mdT">
    <div class="modal-h"><span class="brand-t">${ic('file-text', 24, 2)}</span><div class="grow"><h2 id="mdT">เลือกฉลากยา</h2><p>${esc(it.name)} · ${ls.length ? `มี ${ls.length} แบบในระบบ` : 'ยังไม่มีฉลากในระบบ'}</p></div>${ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
    <div class="modal-b">${ls.length ? `<div class="opts" data-radio-scope role="radiogroup" aria-label="ฉลากของ ${esc(it.name)}">${ls.map(v => {
      if (Q && Q.id === v.id) return `<div class="lp-row qe">${SC.lblQuick(v)}</div>`;
      const t = v.tx.th, langs = SC.lblLangs(v).filter(k => k !== 'th');
      return `<div class="lp-row"><button type="button" class="opt lp-opt" role="radio" data-radio="lp" data-v="${esc(v.id)}" aria-checked="${v.id === cur}"><span class="rd"></span><span class="tx">
          <span class="lp-h"><b>${esc(v.name)}</b>${srcTag(v)}</span>
          <span><b>ข้อบ่งใช้:</b> ${esc(t.ind || 'ไม่ได้ระบุ')}</span><span><b>วิธีใช้:</b> ${esc(t.how)}</span>${t.warn ? `<span><b>ข้อควรระวัง:</b> ${esc(t.warn)}</span>` : ''}
          ${langs.length ? `<span class="small">มีฉลากภาษา${langs.map(lname).join(' ')}ด้วย${langs.some(k => SC.lblState(v, k)) ? ' · <span class="warn-t">บางภาษายังไม่ได้ตรวจหรือไม่ตรงกับภาษาไทย</span>' : ''}</span>` : ''}</span></button>${can ? ui.btn('แก้ไขด่วน', { kind: 'ghost', sm: true, a: 'qeOpen', v: `${v.id}|th`, icon: 'pencil', cls: 'lp-ed' }) : ''}</div>`; }).join('')}</div>`
      : ui.empty({ icon: 'file-text', title: 'ยาตัวนี้ยังไม่มีฉลากในระบบ', body: can ? 'เพิ่มฉลากได้เลย ฉลากที่เพิ่มเข้าระบบฉลากของร้าน สาขาอื่นใช้ได้ด้วย' : 'ให้เภสัชกรเพิ่มฉลาก' })}</div>
    <div class="modal-f">${can ? ui.btn('เพิ่มฉลากใหม่', { kind: 'ghost', a: 'lblNew', icon: 'plus' }) : ''}<span class="sp"></span>${ui.btn('ยกเลิก', { kind: 'secondary', a: 'ovClose' })}${ls.length ? ui.btn('ใช้ฉลากนี้', { a: 'lblUse', icon: 'check' }) : ''}</div></div>`;
};
SC.act('lblPick', t => { SC.S.lblQE = null; SC.S.lblPick = { i: +t.dataset.v }; SC.openOv(pickOv); });
document.addEventListener('click', e => { const o = e.target.closest('[data-radio="lp"]'); if (o && SC.S.lblPick) SC.S.lblPick.sel = o.dataset.v; });
SC.act('lblUse', () => {
  const P = SC.S.lblPick, it = ordItem(P.i), ls = SC.labelsOf(it.sku), before = SC.labelOf(it), id = $('[data-radio="lp"][aria-checked="true"]')?.dataset.v || P.sel || ls[0]?.id;
  const v = ls.find(x => x.id === id); if (!v) return;
  it.lbl = v.id; SC.S.ov = null; SC.S.lblPick = null; SC.S.lblQE = null;
  const p = SC.casePerson(SC.CASES[SC.orderOf(SC.cur()).key]), kid = !!p.child || (p.age && p.age < 12);
  /* the text the customer reads follows the label only when nothing of the pharmacist's own was written yet */
  const fill = !kid && (!tidy(it.how) || (before && tidy(it.how) === before.how));
  if (fill) it.how = v.tx.th.how;
  SC.refresh(); SC.toast(`ใช้ฉลาก "${v.name}" กับ ${it.name}${fill ? ' · ใส่วิธีใช้ตามฉลากแล้ว อ่านแล้วแก้ให้ตรงกับลูกค้าได้' : ''}`, 'file-text');
});

/* ---------- add a label (owner 20/10: "การเพิ่มฉลากใหม่ต้องทำได้ง่าย และมี AI แปลภาษาด้วย และสามารถดึง generic เดิมมาทำฉลากได้" ·
   "ยาตัวนึงมีได้หลายฉลาก"). One form for S303 and S405: the medicine, where to start from, the Thai text, the other languages ---------- */
const tradeOf = p => { const u = (SC.UNITS[p.sku] || [[p.unit, '']])[0]; return `${p.name.replace(/\s*\(.*\)\s*$/, '')} [${u[0]}${u[1] ? ' ' + u[1] : ''}]`; };
const blank = p => ({ name: '', trade: p ? tradeOf(p) : '', generic: p?.gen || genOf(p?.sku) || '', how: '', ind: '', warn: '', store: 'เก็บรักษาที่อุณหภูมิห้อง' });
const srcList = sku => { const g = SC.ingOf(sku); return { same: g ? lblSkus().filter(s => s !== sku && SC.ingOf(s) === g).flatMap(s => SC.labelsOf(s)) : [], own: SC.labelsOf(sku) }; };
SC.lblSrcList = srcList;
/* the label of the same medicine at the same strength (or with no strength written), most languages first; none when the medicine has labels of its own */
const bestSrc = sku => { const s = srcList(sku), g = norm(strength(genOf(sku))); if (s.own.length) return null; return s.same.filter(v => { const x = norm(strength(v.tx.th.generic)); return !x || !g || x === g; }).sort((a, b) => SC.lblLangs(b).length - SC.lblLangs(a).length)[0] || null; };
const changed = (a, b) => !!b && TXT.some(x => tidy(a[x]) !== tidy(b[x]));
const pickSrc = id => {
  const F = SC.S.lblNew, p = SC.prodOf(F.sku);
  F.tx = {}; F.st = {}; F.miss = {}; F.aiBase = null; F.from = id;
  if (id === 'blank') { F.f = { ...blank(p), how: F.f?.how || '' }; F.base = null; return; }
  const v = SC.labelById(id); if (!v) return;
  const other = v.sku !== F.sku, th = v.tx.th;
  F.f = { name: other ? v.name : '', trade: other && p ? tradeOf(p) : th.trade, generic: th.generic, how: th.how, ind: th.ind || '', warn: th.warn || '', store: th.store || '' };
  /* another brand's label: its name never goes on this medicine, in any language */
  SC.lblLangs(v).filter(k => k !== 'th').forEach(k => { F.tx[k] = { ...v.tx[k], ...(other ? { trade: v.tx[k].generic || th.generic } : {}) }; F.st[k] = SC.lblState(v, k) === 'ai' ? 'ai' : 'copy'; F.miss[k] = v.miss?.[k] || []; });
  F.base = { ...F.f };
};
SC.lblNewOpen = (o = {}) => {
  const p = o.sku ? SC.prodOf(o.sku) : null, it = o.i != null ? ordItem(o.i) : null;
  SC.S.lblQE = null;
  SC.S.lblNew = { sku: o.sku || '', i: o.i ?? null, back: o.back || null, from: 'blank', f: { ...blank(p), how: it?.how || '' }, tx: {}, st: {}, miss: {}, base: null, err: {} };
  /* the same medicine at the same strength under another brand is the quickest start: picked for the pharmacist */
  if (o.sku) { const s = bestSrc(o.sku); if (s) pickSrc(s.id); }
  SC.openOv(newOv);
};
const newOv = () => {
  const F = SC.S.lblNew, err = F.err || {}, p = F.sku ? SC.prodOf(F.sku) : null, src = F.sku ? srcList(F.sku) : { same: [], own: [] };
  const opt = (val, title, sub) => `<button type="button" class="opt" role="radio" data-a="nlFrom" data-v="${esc(val)}" aria-checked="${F.from === val}"><span class="rd"></span><span class="tx"><b>${title}</b>${sub ? `<span>${sub}</span>` : ''}</span></button>`;
  const ln = v => SC.lblLangs(v).map(lname).join(' '), sg = strength(genOf(F.sku));
  const prods = SC.CATALOG.filter(i => i.type && i.type !== 'ยาควบคุมพิเศษ');
  const fld = (f, o = {}) => ui.field({ id: 'nl-' + f, label: f === 'name' ? 'ชื่อฉลาก (ใช้กับอาการไหน)' : f === 'generic' ? 'ชื่อยา (ชื่อสามัญและความแรง)' : FH[f], value: F.f[f] || '', req: NEED.includes(f), optional: !NEED.includes(f), textarea: !!o.ta, rows: o.ta || undefined, ph: o.ph || '', error: err[f] || '', a: 'nl_' + f, max: MAX[f], cls: 'lf-f' + (o.full ? ' lf-full' : '') });
  const chg = changed(F.f, F.base), chgAi = changed(F.f, F.aiBase);
  const lrow = k => {
    const s = F.st[k], miss = (F.miss[k] || []).length, old = (s === 'copy' && chg) || (s === 'ai' && F.aiBase && chgAi);
    const txt = !s ? 'ยังไม่มี' : old ? 'ภาษาไทยเปลี่ยนแล้ว ข้อความนี้ยังเป็นของเดิม' : s === 'copy' ? 'คัดลอกจากฉลากต้นทาง' : 'แปลด้วย AI · เภสัชกรตรวจก่อนพิมพ์';
    return `<li><b>${lname(k)}</b><span class="small${!s || old || miss ? ' warn-t' : ''}">${txt}${miss ? ' · มีคำที่แปลไม่ได้' : ''}</span>${F.tx[k] ? `<span class="nl-how" lang="${HL[k]}">${esc(F.tx[k].how)}</span>` : ''}</li>`;
  };
  const from = !F.sku ? '<p class="small">เลือกยาก่อน</p>' : `<div class="opts" role="radiogroup" aria-label="เริ่มจาก">
      ${src.same.map(v => { const s2 = strength(v.tx.th.generic), dif = sg && s2 && norm(sg) !== norm(s2); return opt(v.id, `ใช้ฉลากของ ${esc(SC.prodOf(v.sku)?.name || v.tx.th.trade)} · ${esc(v.name)}`, `ตัวยาเดียวกัน (${esc(v.tx.th.generic)}) · มีภาษา${ln(v)}${dif ? ' · <span class="warn-t">ความแรงต่างกัน ตรวจชื่อยาและวิธีใช้</span>' : ''}`); }).join('')}
      ${src.own.map(v => opt(v.id, `ทำต่อจากฉลาก "${esc(v.name)}" ของยาตัวนี้`, `มีภาษา${ln(v)} · ตั้งชื่อใหม่ให้ต่างจากเดิม`)).join('')}
      ${opt('blank', 'เริ่มใหม่', 'กรอกภาษาไทยเอง แล้วให้ AI แปลภาษาอื่น')}</div>${!src.same.length && !src.own.length ? '<p class="small mt8">ยังไม่มีฉลากของตัวยานี้ในระบบ</p>' : ''}`;
  return `<div class="scrim" data-a="ovClose"></div><div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="mdT">
    <div class="modal-h"><span class="brand-t">${ic('plus', 24, 2)}</span><div class="grow"><h2 id="mdT">เพิ่มฉลากยา</h2><p>${p ? esc(p.name) : 'ฉลากใหม่เข้าระบบฉลากของร้าน'} · ทุกสาขาใช้ได้ · ยาตัวหนึ่งมีได้หลายฉลาก</p></div>${ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
    <div class="modal-b nl-b" id="nlBody">
      <section class="nl-s"><h3 class="label">1 ยา</h3>${F.i != null || F.lock ? `<p><b>${esc(p.name)}</b> <span class="small mono">${esc(p.sku)}</span></p>`
        : `<div class="field"><label for="nlSku">ยาที่จะเพิ่มฉลาก<span class="req" aria-hidden="true">*</span></label><select id="nlSku" class="input" data-in="nl_sku"${err.sku ? ' aria-invalid="true"' : ''}><option value="">เลือกยา</option>${prods.map(x => `<option value="${esc(x.sku)}"${x.sku === F.sku ? ' selected' : ''}>${esc(x.name)} (${esc(x.sku)})</option>`).join('')}</select>${err.sku ? `<p class="err-t">${ic('circle-x', 14, 2)}<span>${esc(err.sku)}</span></p>` : ''}</div>`}</section>
      <section class="nl-s"><h3 class="label">2 เริ่มจาก</h3>${from}</section>
      <section class="nl-s"><h3 class="label">3 ข้อความภาษาไทย</h3><div class="lf-g">
        ${fld('name', { full: true, ph: 'เช่น ทั่วไป · เริมที่ผิวหนัง · ปวดฟัน' })}${fld('trade')}${fld('generic', { ph: 'เช่น Ibuprofen 400 mg' })}
        ${fld('how', { ta: 2, full: true, ph: 'เช่น รับประทานครั้งละ 1 เม็ด วันละ 3 ครั้ง หลังอาหาร' })}${fld('ind', { ta: 2, ph: 'บอกอาการ ไม่ระบุชื่อโรค' })}${fld('warn', { ta: 2 })}${fld('store', { full: true })}</div></section>
      <section class="nl-s"><div class="hrow wrap"><h3 class="label grow">4 ภาษาอื่น</h3>${ui.btn('แปลภาษาอื่นด้วย AI', { kind: 'secondary', sm: true, a: 'nlAI', icon: 'sparkles' })}</div>
        <ul class="nl-langs">${SC.LANGS.filter(k => k !== 'th').map(lrow).join('')}</ul>
        <p class="small mt8">${ic('info', 13, 2)} AI แปลจากข้อความภาษาไทยด้านบน เฉพาะภาษาที่ยังไม่มีหรือไม่ตรงกับภาษาไทย · คำแปลของ AI พิมพ์ได้เมื่อเภสัชกรกด "ตรวจคำแปลแล้ว"</p></section></div>
    <div class="modal-f">${F.back === 'pick' ? ui.btn('กลับไปเลือกฉลาก', { kind: 'secondary', a: 'lblBack' }) : ui.btn('ยกเลิก', { kind: 'secondary', a: 'ovClose' })}<span class="sp"></span>${ui.btn(F.i != null ? 'บันทึกและใช้ฉลากนี้' : 'บันทึกฉลาก', { a: 'nlSave', icon: 'check' })}</div></div>`;
};
SC.lblNewOv = newOv;
document.addEventListener('change', e => {
  if (e.target.dataset?.in !== 'nl_sku' || !SC.S.lblNew) return;
  const F = SC.S.lblNew; F.sku = e.target.value; F.err = {}; F.f = blank(SC.prodOf(F.sku)); pickSrc('blank');
  const s = F.sku && bestSrc(F.sku); if (s) pickSrc(s.id);
  SC.openOv(newOv);
});
SC.act('nlFrom', t => { pickSrc(t.dataset.v); SC.S.lblNew.err = {}; SC.openOv(newOv); });
SC.act('nlAI', async t => {
  const F = SC.S.lblNew, chg = changed(F.f, F.base), chgAi = changed(F.f, F.aiBase);
  if (!tidy(F.f.how)) { F.err = { ...F.err, how: 'ใส่วิธีใช้ภาษาไทยก่อน AI แปล' }; SC.openOv(newOv); return requestAnimationFrame(() => $('#nl-how')?.focus()); }
  const todo = SC.LANGS.filter(k => k !== 'th' && (!F.st[k] || (F.st[k] === 'copy' && chg) || (F.st[k] === 'ai' && (!F.aiBase || chgAi))));
  if (!todo.length) return SC.toast('ภาษาอื่นตรงกับภาษาไทยอยู่แล้ว ไม่ต้องแปลใหม่', 'check');
  await SC.busy(t, 900);
  const th = thOf(F.f);
  todo.forEach(k => { const r = SC.aiTx(th, k); F.tx[k] = r.t; F.st[k] = 'ai'; F.miss[k] = r.miss; });
  F.aiBase = { ...F.f }; if (chg) F.base = { ...F.f };
  SC.openOv(newOv); SC.toast(`AI แปล ${todo.map(lname).join(' ')} แล้ว เภสัชกรตรวจก่อนพิมพ์`, 'sparkles');
});
SC.act('lblNew', t => {
  if (!SC.canLabel()) return;
  const v = t?.dataset.v ?? '';
  if (SC.cur().id === 'labels') return SC.lblNewOpen({ sku: v.startsWith('sku:') ? v.slice(4) : null });
  if (v !== '') SC.S.lblPick = { i: +v };
  const P = SC.S.lblPick || {}; SC.lblNewOpen({ sku: ordItem(P.i).sku, i: P.i, back: v === '' ? 'pick' : null });
});
SC.act('lblBack', () => { SC.S.lblNew = null; SC.openOv(pickOv); });
SC.act('nlSave', () => {
  const F = SC.S.lblNew, err = {}, base = F.base || {};
  if (!F.sku) err.sku = 'เลือกยาที่จะเพิ่มฉลาก';
  NEED.forEach(x => { if (!tidy(F.f[x])) err[x] = `ใส่${FH[x]}`; });
  /* the shop's own wording that came along unchanged passes; what is written here is checked */
  ['how', 'ind'].forEach(x => { if (err[x] || (F.base && tidy(F.f[x]) === tidy(base[x]))) return; const d = SC.dxHits(F.f[x]); if (d.length) err[x] = `มีคำที่เป็นชื่อโรค: ${d.join(', ')} · เปลี่ยนเป็นคำบรรยายอาการ`; });
  const nm = s => tidy(s).replace(/\s+/g, ' ').toLowerCase();
  if (F.sku && !err.name && SC.labelsOf(F.sku).some(v => nm(v.name) === nm(F.f.name))) err.name = 'ยาตัวนี้มีฉลากชื่อนี้แล้ว ตั้งชื่อให้ต่างกัน เช่น บอกอาการที่ใช้';
  F.err = err;
  if (Object.keys(err).length) { SC.openOv(newOv); const k = Object.keys(err)[0]; requestAnimationFrame(() => $(k === 'sku' ? '#nlSku' : '#nl-' + k)?.focus()); return; }
  const S = SC.S, list = (S.lblAdd = S.lblAdd || {})[F.sku] = S.lblAdd[F.sku] || [], chg = changed(F.f, F.base), chgAi = changed(F.f, F.aiBase);
  const others = Object.keys(F.tx), stale = others.filter(k => (F.st[k] === 'copy' && chg) || (F.st[k] === 'ai' && F.aiBase && chgAi));
  const v = { id: `${F.sku}-n${list.length + 1}`, sku: F.sku, name: tidy(F.f.name), src: 'added', by: SC.me().short, at: SC.NOW.date, from: F.from === 'blank' ? null : F.from,
    tx: { th: thOf(F.f), ...F.tx }, ai: Object.fromEntries(others.filter(k => F.st[k] === 'ai').map(k => [k, 'ai'])), miss: { ...F.miss }, stale };
  list.push(v);
  const nAi = others.filter(k => F.st[k] === 'ai').length, p = SC.prodOf(F.sku);
  if (F.i != null) {
    const it = ordItem(F.i), c = SC.casePerson(SC.CASES[SC.orderOf(SC.cur()).key]), kid = !!c.child || (c.age && c.age < 12);
    it.lbl = v.id; if (!kid && !tidy(it.how)) it.how = v.tx.th.how;
  }
  S.lmSel = F.sku; S.lmFlash = v.id; S.ov = null; S.lblNew = null; S.lblPick = null; SC.refresh();
  SC.toast(`เพิ่มฉลาก "${v.name}" ให้ ${p?.name || F.sku} แล้ว ทุกสาขาใช้ได้${nAi ? ` · คำแปล AI ${nAi} ภาษารอเภสัชกรตรวจ` : ''}`, 'check');
});
})();

/* ===== 64-pay.js ===== */
/* =====================================================================
   64 · Group 3 (cont.): S304 payment and fulfilment · S305 close the case + summary editor.
   Words and numbers match the customer side: paid C309 (PromptPay 14:33, pickup code = last 4 of the
   order no), summary C401. The summary lists only medicine that was actually paid for.
   ===================================================================== */
(() => {
const { $, esc, ic, ui } = SC;
const keyFor = ctx => ctx.p.k || SC.S.activeCase || 'smj';
const total = o => SC.orderTotal(o);
/* customer app mockPaid: PromptPay at 14:33 · pickup ฿385 · parcel +฿25 (Flash) = ฿410 · express +฿89 = ฿474 */
const PAY = {
  pickup: { recv: 'pickup', method: 'พร้อมเพย์', at: '14:33', ship: 0 },
  parcel: { recv: 'parcel', method: 'พร้อมเพย์', at: '14:33', ship: 25, courier: 'Flash Express' },
  express: { recv: 'express', method: 'พร้อมเพย์', at: '14:33', ship: 89, courier: 'Lalamove' },
  cold: { recv: 'cold', method: 'พร้อมเพย์', at: '14:33', ship: 300, courier: 'Inter Express' }
};
SC.PAY = PAY;
const recvName = r => r === 'pickup' ? `รับที่หน้าร้าน${SC.branch().name}` : r === 'express' ? 'จัดส่งด่วน (Lalamove)' : r === 'cold' ? 'ส่งเย็น · Inter Express (ร้านจองเอง)' : 'จัดส่งพัสดุ · Flash Express';
const payTotals = o => { const items = total(o), ship = o.paid?.ship || 0; return { items, ship, total: items + ship }; };
const isOpen = key => SC.S.activeCase === key;
const payLeftS = () => Math.max(0, (SC.toMin('16:20') - SC.clk()) * 60);
const payLeftTxt = s => `${Math.floor(s / 3600)} ชม. ${Math.floor(s % 3600 / 60)} นาที`;
function fulfil(st, o) {
  /* QA3-17: no order sent yet = nothing to pay, say where to go */
  if (o.status === 'draft') return `<div class="card">${ui.note('<b>ยังไม่ได้ส่งรายการยาให้ลูกค้า</b><p>ส่งรายการที่ขั้น 2 จัดยาก่อน จึงดูการชำระได้</p>')}<div class="mt12">${ui.btn('ไปที่จัดยา', { kind: 'secondary', go: 'order', st: o.key === 'kid' ? 'kid' : 'plan', p: { k: o.key }, icon: 'pill' })}</div></div>`;
  const closeBtn = isOpen(o.key) ? `<p class="small pay-next">${ic('clipboard-check', 14, 2)}<span>ปิดเคสได้เลย ไม่ต้องรอ กด <b>4 ปิดเคส</b> ที่แถบด้านบน</span></p>` : `<p class="small">${ic('check', 13, 2)} ปิดเคสแล้ว รายการนี้อยู่ในกล่องรอชำระ / รอรับที่ร้านบนหน้าคิว</p>`;
  if (o.status === 'sent' && st !== 'failed') return `<div class="card"><div class="card-h"><h3>รอลูกค้าชำระ</h3>${ui.tag('รอชำระ', 'warn', { icon: 'clock' })}</div>
      <p class="clock mt12">${ic('timer', 18, 2)}<span>ชำระได้อีก <b id="payLeft">${payLeftTxt(payLeftS())}</b> (ถึง 16:20)</span></p><p class="pay-amt mt8">ยอดที่รอ <b class="num">${SC.money(total(o))}</b> · รายการ <span class="mono">${esc(o.no)}</span></p><p class="small mt4">ลูกค้าเห็นปุ่ม "ดูและชำระเงิน" ในแชท</p>
      <div class="gap8 mt16">${ui.btn('ส่งข้อความเตือนในแชท', { kind: 'secondary', block: true, a: 'remindPay', icon: 'bell' })}<button type="button" class="link small pay-fix" data-a="editOrCancel" data-v="${o.key}">${ic('pencil', 13, 2)}แก้หรือยกเลิกรายการ</button></div></div>
    <div class="card mt12">${ui.note('<b>ปิดเคสได้เลย ไม่ต้องรอลูกค้าชำระ</b><p>รายการไปรอในกล่องรอชำระบนหน้าคิว</p>')}<div class="mt8">${closeBtn}</div></div>`;
  if (st === 'failed') return `<div class="card"><div class="card-h"><h3>ลูกค้าจ่ายไม่ผ่าน</h3>${ui.tag('ชำระไม่ผ่าน', 'danger', { icon: 'circle-x' })}</div>
      <p class="mt8">บัตรถูกปฏิเสธ 14:31 · ไม่มีการตัดเงิน</p><p class="small mt8">ลูกค้าเห็นจอ "จ่ายไม่ผ่าน" ลองใหม่หรือเปลี่ยนเป็นพร้อมเพย์ได้เอง · รายการยังรอชำระถึง 16:20</p>
      <div class="gap8 mt16">${ui.btn('ส่งข้อความช่วยในแชท', { kind: 'secondary', block: true, a: 'helpPay', icon: 'message-circle' })}</div></div><div class="card mt12">${closeBtn}</div>`;
  if (o.status === 'expired' || o.status === 'cancelled') return `<div class="card"><div class="card-h"><h3>${o.status === 'expired' ? 'รายการหมดเวลา' : 'ยกเลิกรายการแล้ว'}</h3>${ui.tag(o.status === 'expired' ? 'หมดเวลา' : 'ยกเลิกแล้ว', 'muted', { icon: 'clock' })}</div>
      <p class="mt8">${o.status === 'expired' ? 'ลูกค้าไม่ได้ชำระภายใน 16:20' : 'ปุ่มชำระของรายการนี้ใช้ไม่ได้แล้ว'} · ไม่มีการตัดเงิน</p><p class="small mt8">ลูกค้าเห็นการ์ดรายการในแชทว่าใช้ไม่ได้แล้ว และขอรายการใหม่ได้</p>
      ${isOpen(o.key) ? `<div class="gap8 mt16">${ui.btn('ออกรายการใหม่', { block: true, a: 'reorder', v: o.key, icon: 'receipt' })}</div>` : ''}</div>`;
  const tagPaid = o.handed ? ui.tag('รับยาแล้ว', 'ok', { icon: 'check' }) : ui.tag('ชำระแล้ว', 'ok', { icon: 'circle-check' });
  if (o.paid.recv === 'pickup') return `<div class="card"><div class="card-h"><h3>รับที่หน้าร้าน</h3>${tagPaid}</div>
      ${o.handed ? `<div class="mt12">${ui.note(`<b>ลูกค้ารับยาแล้ว ${esc(o.handed)}</b><p>ตรวจรหัสรับยาแล้ว · บันทึกโดย ${esc(SC.me().short)}</p>`, { tone: 'ok' })}</div>`
        : !o.ready ? `<p class="small mt12">จัดยาให้ครบแล้วกดแจ้งลูกค้า ลูกค้าได้รับแจ้งเตือนว่ายาพร้อมรับ</p><div class="gap8 mt12">${ui.btn('ยาพร้อมรับแล้ว แจ้งลูกค้า', { block: true, a: 'ready', v: o.key, icon: 'bell' })}</div>`
        : `<div class="mt12">${ui.note(`<b>แจ้งลูกค้าแล้ว ${esc(o.ready)} ยาพร้อมรับ</b>`, { tone: 'ok' })}</div>
          <p class="label mt16">ลูกค้ามารับยา</p>
          <p class="pk-or small">หรือพิมพ์รหัส</p>
          <div>${ui.field({ id: 'pkCode', label: 'รหัสรับยา 4 ตัวที่ลูกค้าแสดง', max: 11, req: true, ph: 'เช่น K7P2', error: SC.S.pkErr === 'empty' ? 'ใส่รหัสรับยา 4 ตัวที่ลูกค้าแสดง' : SC.S.pkErr ? 'รหัสไม่ตรง ตรวจกับจอของลูกค้าอีกครั้ง' : '' })}</div>
          ${ui.btn('ยืนยันส่งมอบยา', { kind: 'secondary', block: true, a: 'handOver', v: o.key, icon: 'check', cls: 'mt8' })}<p class="small mt8">ตรวจชื่อผู้รับให้ตรงกับเคสก่อนส่งมอบ</p>`}
      </div><div class="card mt12"><p class="small">ร้านจัดยาต่อได้หลังปิดเคส ไม่ต้องรอ · ใบสรุปส่งให้ลูกค้าทันทีที่ปิดเคส</p>${closeBtn}</div>`;
  if (o.paid.recv === 'parcel') return `<div class="card"><div class="card-h"><h3>จัดส่งพัสดุ</h3>${tagPaid}</div>
      ${ui.kv([['ขนส่ง', 'Flash Express · 1-3 วัน'], ['ส่งไปที่', esc(SC.HOME_TO)], ['เขตส่งยา', esc(SC.zoneTxt(SC.HOME_TO, SC.HOME_KM))]])}
      <p class="small mt8">ที่อยู่เต็มพิมพ์บนใบปะหน้าเท่านั้น</p>
      ${o.booked ? `<div class="pk mt12"><span class="label">เลขพัสดุ</span><b class="num mono">TH2610183NQ7</b><span class="small">ลูกค้าเห็นปุ่มติดตามการจัดส่งในแอปแล้ว</span></div>${ui.btn('พิมพ์ใบปะหน้า', { kind: 'secondary', block: true, a: 'printLabel', icon: 'file-text', cls: 'mt12' })}`
        : ui.btn('จองขนส่ง Flash Express', { block: true, a: 'book', v: o.key, icon: 'package', cls: 'mt16' })}</div><div class="card mt12">${closeBtn}</div>`;
  if (o.paid.recv === 'cold') return `<div class="card"><div class="card-h"><h3>ส่งเย็น Inter Express</h3>${tagPaid}</div>
      ${ui.kv([['ขนส่ง', 'Inter Express Logistics · ร้านจองเอง ไม่มีระบบเชื่อม'], ['ค่าส่ง', `${SC.money(300)} คงที่`], ['ส่งไปที่', esc(SC.COLD_TO)], ['เขตส่งยา', esc(SC.zoneTxt(SC.COLD_TO, SC.COLD_KM))]])}
      <p class="small mt8">${ic('snowflake', 13, 2)} ใส่กล่องเย็นและเจลเย็น ติ๊กตรวจตอนจัดยา (จัดยาและส่ง)</p>
      ${o.coldTrk ? `<div class="pk mt12"><span class="label">ติดตามพัสดุ Inter Express</span><b class="${o.coldTrk.link ? '' : 'num mono'}">${o.coldTrk.link ? SC.coldTrkView(o.coldTrk) : esc(o.coldTrk.no)}</b><span class="small">ใส่โดย ${esc(o.coldTrk.by)} ${esc(o.coldTrk.at)} · ลูกค้าเห็นในแอปแล้ว</span></div>` : `<div class="mt12">${SC.coldTrkForm(o)}</div>`}</div><div class="card mt12">${closeBtn}</div>`;
  return `<div class="card"><div class="card-h"><h3>จัดส่งด่วน</h3>${tagPaid}</div>
      ${ui.kv([['ผู้ให้บริการ', 'Lalamove · ไม่เกิน 15 กม.'], ['ส่งไปที่', esc(SC.HOME_TO)], ['ตำแหน่ง', 'ลูกค้ายืนยันหมุดแล้ว'], ['เขตส่งยา', esc(SC.zoneTxt(SC.HOME_TO, SC.HOME_KM))]])}
      ${o.booked ? `<div class="pk mt12"><span class="label">ไรเดอร์</span><b>คุณสมชาย · รถจักรยานยนต์</b><span class="small">ถึงร้านประมาณ 14:52 · ลูกค้าเห็นสถานะในแอป</span></div>` : ui.btn('เรียกไรเดอร์ Lalamove', { block: true, a: 'book', v: o.key, icon: 'zap', cls: 'mt16' })}</div><div class="card mt12">${closeBtn}</div>`;
}
SC.screen('pay', {
  code: 'S304', group: 3, duty: true, title: 'ชำระเงินและจัดยา', nav: 'queue',
  states: [['wait', 'รอชำระ', { cust: [['room', 'order', 'การ์ดรายการยา รอชำระ'], ['pay', 'normal']] }],
    ['pickup', 'ชำระแล้ว รับที่ร้าน', { cust: [['paid', 'pickup', 'รหัสรับยา · พร้อมเพย์ ฿385 เวลา 14:33'], ['room', 'paid']] }],
    ['parcel', 'ชำระแล้ว ส่งพัสดุ', { cust: [['paid', 'parcel', 'พร้อมเพย์ ฿410 (ค่ายา ฿385 + ค่าส่ง ฿25)'], ['pay', 'parcel']] }],
    ['express', 'ชำระแล้ว ส่งด่วน', { cust: [['paid', 'express', 'พร้อมเพย์ ฿474 (ค่ายา ฿385 + ค่าส่ง ฿89)'], ['pay', 'express']] }],
    ['failed', 'ลูกค้าจ่ายไม่ผ่าน', { cust: [['payfail', 'card']] }],
    ['expired', 'รายการหมดเวลา', { cust: [['room', 'expired']] }],
    ['edit', 'แก้รายการ ออกใหม่', { back: 'wait', cust: [['room', 'order', 'ลิงก์เดิมใช้ไม่ได้ทันทีเมื่อยกเลิก']] }],
    ['cold', 'ชำระแล้ว ส่งเย็น Inter Express', { cust: [['paid', 'cold', 'ลูกค้าเห็นเลขพัสดุ Inter Express เมื่อร้านใส่เลข (C309.8)'], ['pay', 'cold', 'ค่าส่งเย็น ฿300 คงที่']] }]],
  notes: ['เคาะแล้ว 20/10: เรียกไรเดอร์และจองขนส่งใช้ขั้นตอนเดิมของระบบเว็บ หรืออาจนำระบบเดิมมาสร้างใหม่ ตัดสินตอนสร้างจริง ปุ่มในจอนี้เป็นตัวแทนของขั้นตอนนั้น (เจ้าของ: "ต่อ api จากระบบ website มี flow ตรงนั้นอยู่แล้ว" · "หรืออาจจะต้องเอาระบบเดิมมาสร้างใหม่")', 'รีวิว UX 20/10: หัวจอ "ชำระเงินและจัดยา" + แถบเคส (ชื่อ แพ้ยา ยาประจำ + 4 ขั้น) · ปุ่มทึบปุ่มเดียวคืองานจัดยาขั้นถัดไป · ปิดเคสอยู่ที่ขั้น 4 ของแถบเคสที่เดียว · แก้หรือยกเลิกรายการรวมเป็นปุ่มข้อความเล็กปุ่มเดียว เปิดหน้าต่างเลือก 2 ทาง', 'ยอดและเวลาตรงกับแอปลูกค้า: พร้อมเพย์ 14:33 · รับที่ร้าน ฿385 · ส่งพัสดุ ฿410 · ส่งด่วน ฿474 (จ่ายด้วยบัตรมีแค่ในหน้าชำระ C308 ฿399.05)', 'วิธีรับยา 3 ทาง: รับที่ร้าน · ส่งด่วน Lalamove · ส่งพัสดุ Flash (1-3 วัน) หรือ DHL (1-2 วัน) ตามแอปลูกค้า', 'รับที่ร้าน: กดแจ้งยาพร้อม แล้วใส่รหัสรับยา 4 ตัวท้ายของเลขรายการ (XR4A) ไทม์ไลน์ขยับเป็น "ลูกค้ารับยาแล้ว"', 'ปิดเคสก่อนลูกค้าจ่ายได้ รายการไปรอที่กล่องรอชำระ / รอรับที่ร้านบนหน้าคิว', 'ที่อยู่จัดส่งแสดงแค่ตำบล อำเภอ จังหวัด ที่อยู่เต็มอยู่บนใบปะหน้า (ใช้ข้อมูลเท่าที่จำเป็น)', 'สถานะในแผงตรวจใช้รายการ 3 ตัวแบบเดียวกับแอปลูกค้า (฿385)'],
  wait: [],
  head: () => ({ title: 'ชำระเงินและจัดยา', sub: SC.branch().name }),
  now: ctx => ({ date: SC.NOW.date, time: { wait: SC.at('14:20'), edit: SC.at('14:24'), failed: '14:31', expired: '16:21' }[ctx.st] || '14:34' }),
  prep(S, st, p) {
    p.k = p.k || (S._reseed ? (st === 'cold' ? 'new1' : 'smj') : S.activeCase) || 'smj';
    if (S._reseed) S.activeCase = p.k;
    let o = S.orders[p.k];
    if (!o || S._reseed) { o = SC.seedOrder(st === 'cold' && S._reseed ? 'cold' : 'plan', p.k, S._reseed && st !== 'cold'); o.status = 'sent'; o.sent = '14:20'; }
    if (PAY[st] && o.status !== 'paid') { o.status = 'paid'; o.paid = { ...PAY[st] }; }
    if (st === 'expired' && o.status === 'sent') o.status = 'expired';
    S.pkErr = false;
    if (o.status === 'paid' && !PAY[st]) return o.paid.recv;
  },
  render(ctx) {
    const st = ctx.st, o = SC.S.orders[keyFor(ctx)], c = SC.CASES[o.key], t = payTotals(o), me = SC.me();
    const paid = o.status === 'paid', pd = o.paid, pk = paid && pd.recv === 'pickup';
    const steps = [
      ['done', 'ส่งรายการเข้าแชท', `${SC.NOW.date} ${o.sent || '14:20'} · โดย ${me.short}`],
      [paid ? 'done' : st === 'failed' || ['expired', 'cancelled'].includes(o.status) ? 'bad' : 'cur', paid ? `ชำระแล้ว · ${pd.method}` : st === 'failed' ? 'ชำระไม่ผ่าน (ลูกค้าลองใหม่ได้)' : o.status === 'expired' ? 'หมดเวลาชำระ 16:20' : o.status === 'cancelled' ? 'ยกเลิกรายการแล้ว' : 'รอลูกค้าชำระ', paid ? `${SC.NOW.date} ${pd.at}` : 'ชำระได้ถึง 16:20'],
      [paid ? (o.ready || o.booked ? 'done' : 'cur') : '', 'กำลังเตรียมยา', paid && !o.ready && !o.booked ? 'ตอนนี้' : ''],
      [o.ready || o.booked ? (o.handed ? 'done' : 'cur') : '', pk ? 'พร้อมรับที่สาขา' : 'จัดส่งแล้ว', o.ready ? `แจ้งลูกค้า ${o.ready}` : ''],
      [o.handed ? 'done' : '', pk ? 'ลูกค้ารับยาแล้ว' : 'สำเร็จ', o.handed ? `${SC.NOW.date} ${o.handed} · ตรวจรหัสรับยาแล้ว` : '']];
    return `${SC.caseBar(c, isOpen(o.key) ? { step: 'pay', start: 360 } : { closed: true })}<div class="pay-g mt12">
      <div class="gap12">
        <section class="card"><div class="card-h"><h3>สถานะ</h3><span class="sp"></span>${paid ? (o.handed ? ui.tag('รับยาแล้ว', 'ok', { icon: 'check' }) : ui.tag('ชำระแล้ว', 'ok', { icon: 'circle-check' })) : st === 'failed' ? ui.tag('ชำระไม่ผ่าน', 'danger', { icon: 'circle-x' }) : o.status === 'sent' ? ui.tag('รอชำระ', 'warn', { icon: 'clock' }) : ui.tag(o.status === 'expired' ? 'หมดเวลา' : 'ยกเลิกแล้ว', 'muted', { icon: 'clock' })}</div>
          <ol class="tl mt12">${steps.map(([s, b, d]) => `<li class="${s}"><b>${esc(b)}</b>${d ? `<span>${esc(d)}</span>` : ''}</li>`).join('')}</ol></section>
        <section class="card"><div class="card-h"><h3>รายการยา</h3><span class="sp"></span><span class="small">เลขรายการ <span class="mono">${esc(o.no)}</span></span></div>
          <table class="tbl mt8"><thead><tr><th>ยา</th><th>กลุ่ม</th><th>จำนวน</th><th class="r">ราคา</th></tr></thead><tbody>${o.items.map(i => `<tr><td><b>${esc(i.name)}</b><span class="sub">${esc(i.how)}</span></td><td>${ui.cls(i.type)}</td><td class="nowrap">${i.qty} ${esc(i.unit)}</td><td class="r num">${SC.money(i.price * i.qty)}</td></tr>`).join('')}</tbody></table>
          <div class="pay-tot mt12">${ui.kv([['ยอดค่ายา', SC.money(t.items)], [pd?.courier ? `ค่าจัดส่ง (${pd.courier})` : 'ค่าจัดส่ง', paid ? (t.ship ? SC.money(t.ship) : 'ไม่มีค่าจัดส่ง') : 'ลูกค้าเลือกตอนชำระ'], [paid ? 'ยอดชำระ' : 'ยอดค่ายา (ยังไม่รวมค่าส่ง)', `<span class="num">${SC.money(t.total)}</span>`, 'tot']])}</div>
          ${paid ? `<div class="mt12">${ui.kv([['วิธีชำระ', esc(pd.method)], ['เวลาชำระ', `${SC.NOW.date} ${pd.at}`], ['การรับยา', esc(recvName(pd.recv))], ['เลขอ้างอิงการชำระ (Omise)', '<span class="mono">chrg_61kq9xr4a7m3p8w5z</span>']])}</div>` : ''}
          <p class="osum-by mt12">${ic('badge-check', 15, 2)}<span>จ่ายยาโดย ${esc(me.name)} · ${esc(me.lic)} · ${esc(SC.caseCode(c))}</span></p></section>
      </div>
      <div>${fulfil(st, o)}</div></div>`;
  },
  overlay(ctx) {
    if (ctx.st !== 'edit') return '';
    const o = SC.S.orders[keyFor(ctx)];
    return ui.modal({ title: 'แก้รายการที่ส่งไปแล้ว', sub: `รายการ ${o.no} · ${SC.money(total(o))}`, icon: 'pencil', tone: 'warn', back: 'wait',
      body: `<p>ระบบจะ<b>ยกเลิกรายการเดิม</b>แล้วเปิดรายการใหม่ให้ ปุ่มชำระของรายการเดิมใช้ไม่ได้ทันที กันลูกค้าจ่ายยอดเก่า · ยาเดิมใส่ไว้ให้ครบ แก้แล้วกดส่งใหม่</p>
        <div class="mt16">${ui.field({ id: 'edWhy', label: 'เหตุผลที่แก้ (บันทึกในระบบ ลูกค้าไม่เห็น)', ph: 'เช่น ลูกค้าขอเปลี่ยนเป็นขวดเล็ก', req: true })}</div>
        <p class="small mt8">ประวัติเก็บทั้งรายการเดิม (ยกเลิก: แก้รายการ) และรายการใหม่ที่อ้างถึงรายการเดิม</p>`,
      foot: `${ui.btn('กลับ', { kind: 'secondary', st: 'wait' })}${ui.btn('ยกเลิกรายการเดิมแล้วแก้', { kind: 'danger', a: 'reissue', v: o.key, icon: 'pencil' })}` });
  },
  mount(el, ctx) {
    SC.tickElapsed(el, ctx, 360);
    const n = $('#payLeft', el); if (n) { let s = payLeftS(); ctx.every(() => { s = Math.max(0, s - 1); n.textContent = payLeftTxt(s); }, 1000); }
  },
  sims: ({ st }) => {
    const o = SC.S.orders[SC.cur()?.p?.k || 'smj'];
    if (!o || o.status !== 'sent') return [];
    const paidAs = (r, label) => ({ label, run: () => { SC.go('pay', { st: r, p: { k: o.key } }); SC.toast(`ลูกค้าชำระแล้ว ${SC.money(total(o) + PAY[r].ship)} ทางพร้อมเพย์`, 'circle-check'); } });
    /* item 71: a way the pharmacist closed for this list cannot be chosen by the customer */
    return [...[['pickup', 'ลูกค้าชำระแล้ว (รับที่ร้าน)'], ['parcel', 'ลูกค้าชำระแล้ว (ส่งพัสดุ)'], ['express', 'ลูกค้าชำระแล้ว (ส่งด่วน)'], ['cold', 'ลูกค้าชำระแล้ว (ส่งเย็น Inter Express)']].filter(([r]) => SC.recvOpen(o).includes(r)).map(([r, l]) => paidAs(r, l)),
      st !== 'failed' && { label: 'ลูกค้าจ่ายไม่ผ่าน', run: () => SC.go('pay', { st: 'failed', p: { k: o.key } }) },
      { label: 'ครบ 2 ชั่วโมง ไม่ได้ชำระ', run: () => SC.go('pay', { st: 'expired', p: { k: o.key } }) }];
  }
});
SC.act('editOrCancel', t => {
  const key = t.dataset.v, o = SC.S.orders[key];
  SC.openOv(() => `<div class="scrim" data-a="ovClose"></div><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mdT">
    <div class="modal-h"><span class="brand-t">${ic('pencil', 24, 2)}</span><div class="grow"><h2 id="mdT">แก้หรือยกเลิกรายการ</h2><p>${esc(o.no)} · ${SC.money(total(o))} · ยังไม่ชำระ</p></div>${ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
    <div class="modal-b"><div class="opts">
      <button type="button" class="opt" data-st="edit"><span class="tx"><b>แก้รายการ</b><span>ยกเลิกรายการเดิมแล้วออกใหม่ ยาเดิมใส่ไว้ให้ครบ</span></span></button>
      <button type="button" class="opt" data-a="cancelOrder" data-v="${key}"><span class="tx"><b>ยกเลิกรายการ</b><span>ปุ่มชำระในแชทใช้ไม่ได้ทันที ไม่มีการตัดเงิน</span></span></button></div></div>
    <div class="modal-f">${ui.btn('ปิด', { kind: 'secondary', a: 'ovClose' })}</div></div>`);
});
SC.act('helpPay', t => { SC.busy(t, 450); SC.toast(SC.say('ส่งข้อความในแชทแล้ว: ลองพร้อมเพย์แทนได้ค่ะ'), 'send'); });
SC.act('cancelOrder', t => {
  const key = t.dataset.v, o = SC.S.orders[key];
  SC.openOv(() => `<div class="scrim" data-a="ovClose"></div><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mdT">
    <div class="modal-h"><span class="danger-t">${ic('x', 24, 2)}</span><div class="grow"><h2 id="mdT">ยกเลิกรายการ ${esc(o.no)}</h2><p>${SC.money(total(o))} · ยังไม่ชำระ</p></div>${ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
    <div class="modal-b"><p>ปุ่มชำระในแชทของลูกค้าใช้ไม่ได้ทันที ไม่มีการตัดเงิน · ออกรายการใหม่ได้ภายหลัง</p></div>
    <div class="modal-f">${ui.btn('ไม่ยกเลิก', { kind: 'secondary', a: 'ovClose' })}${ui.btn('ยกเลิกรายการ', { kind: 'danger', a: 'cancelGo', v: key, icon: 'x' })}</div></div>`);
});
SC.act('cancelGo', t => { const o = SC.S.orders[t.dataset.v]; o.status = 'cancelled'; SC.S.ov = null; SC.go('pay', { st: 'expired', p: { k: o.key } }); SC.toast(`ยกเลิกรายการ ${o.no} แล้ว`, 'x'); });
SC.act('reorder', t => { const key = t.dataset.v; SC.seedOrder('plan', key); SC.go('order', { st: key === 'kid' ? 'kid' : 'plan', p: { k: key } }); });
SC.act('reissue', async t => { const w = $('#edWhy'); if (!w.value.trim()) { w.closest('.field').classList.add('err'); w.focus(); SC.toast('ใส่เหตุผลที่แก้ก่อน', 'info'); return; } await SC.busy(t, 600); const o = SC.S.orders[t.dataset.v]; o.status = 'draft'; o.sent = null; SC.go('order', { st: o.key === 'kid' ? 'kid' : 'plan', p: { k: o.key } }); SC.toast('ยกเลิกรายการเดิมแล้ว แก้แล้วกดส่งใหม่', 'pencil'); });
SC.act('ready', async t => { await SC.busy(t, 500); SC.S.orders[t.dataset.v].ready = SC.clockStr(); SC.refresh(); requestAnimationFrame(() => $('#pkCode')?.focus()); SC.toast('แจ้งลูกค้าแล้ว ยาพร้อมรับ', 'bell'); });
SC.act('handOver', async t => {
  const o = SC.S.orders[t.dataset.v], v = $('#pkCode');
  const val = v.value.trim().toUpperCase();
  /* Accept the pickup code or full order number for this order. */
  if (val !== o.no.slice(-4) && val !== o.no) { SC.S.pkErr = val ? 'bad' : 'empty'; SC.refresh(); requestAnimationFrame(() => $('#pkCode')?.focus()); return; }
  await SC.busy(t, 500); SC.S.pkErr = false; o.handed = SC.clockStr(); SC.refresh(); SC.toast(`บันทึกแล้ว ลูกค้ารับยาเรียบร้อย ${o.handed}`, 'check');
});
SC.act('book', async t => { await SC.busy(t, 800); Object.assign(SC.S.orders[t.dataset.v], { booked: true, bookedAt: SC.clockStr() }); SC.refresh(); SC.toast('จองขนส่งแล้ว ลูกค้าได้รับแจ้งในแอป', 'package'); });
SC.act('printLabel', () => SC.toast('จำลอง: ส่งใบปะหน้า 4x6 ไปที่เครื่องพิมพ์ร้าน', 'file-text'));

/* ---------- S305 close the case + summary ---------- */
const REASONS = [['sold', 'จ่ายยาแล้ว'], ['waitpay', 'ส่งรายการแล้ว รอชำระ'], ['advice', 'ให้คำแนะนำ ไม่ต้องจ่ายยา'], ['doctor', 'แนะนำให้พบแพทย์'], ['noreply', 'ลูกค้าไม่ตอบกลับ'], ['adr', 'พบอาการไม่พึงประสงค์จากยา']];
const advDraft = (k, o) => {
  const ab = SC.abxIn(o), dx = k.dx.replace('จากอาการที่เล่า ', '');
  return `${ab.length ? dx.replace(/ ?ยังไม่จำเป็นต้องใช้ยาปฏิชีวนะ/, '').trim() : dx}\n${k.care}${ab.length ? `\nทาน${ab.join(', ')}ให้ครบตามจำนวนที่จ่าย แม้อาการดีขึ้นแล้ว` : ''}`;
};
const CF0 = (key, st) => {
  const c = SC.CASES[key], k = SC.casePlan(c), o = SC.S.orders[key], ch = SC.S.chats[key];
  const told = c.answers?.temp && ch?.msgs.some(m => m.who === 'cu' && m.text === c.answers.temp) ? c.answers.temp : '';
  return {
    reason: st === 'nomeds' ? 'advice' : o?.status === 'paid' ? 'sold' : o?.status === 'sent' ? 'waitpay' : 'advice',
    sym: [c.symptoms.join(' '), c.note, told].filter(Boolean).join(' · '),
    adv: st === 'lint' ? 'อาการเข้าได้กับคออักเสบ ดูแลตามอาการได้ ยังไม่จำเป็นต้องใช้ยาปฏิชีวนะ\nดื่มน้ำมาก ๆ และพักผ่อนให้เพียงพอ' : advDraft(k, o),
    warn: st === 'missing' ? '' : k.warn.join('\n'),
    follow: o?.status === 'paid', ask: 'end', note: '',
    refOn: false, refTo: '', refWhy: c.urgent.length ? c.urgent.join(' ') : '', refU: ''
  };
};
/* B6 (FDA 2.1(4)(ซ)): referral to a hospital or clinic. Required when the result is "แนะนำให้พบแพทย์" or the case
   carries an urgent flag; then "ไม่ส่งต่อ" is not offered */
const REF_U = SC.REF_U = [['now', 'ไปทันที'], ['24h', 'ภายใน 24 ชม.'], ['routine', 'ตามนัดปกติ']];
const refNeed = (f, c) => f.reason === 'doctor' || !!c.urgent.length;
const refOn = f => refNeed(f, SC.CASES[f.key]) || f.refOn;
const refMiss = f => refOn(f) ? [['refTo', 'cfRefTo', 'ส่งต่อไปที่'], ['refWhy', 'cfRefWhy', 'เหตุผลที่ส่งต่อ'], ['refU', 'cfRefU', 'ความเร่ง']].filter(([k]) => !String(f[k] || '').trim()) : [];
function refBox(f, c, missing) {
  const need = refNeed(f, c), on = need || f.refOn, bad = k => missing && !String(f[k] || '').trim();
  return `<div class="cl-ref" id="cfRefBox"><p class="label">ส่งต่อสถานพยาบาล${need ? '<span class="req" aria-hidden="true">*</span>' : ''}</p>
    ${need ? `<p class="small mt4">${c.urgent.length ? 'เคสนี้มีธงด่วน' : 'ผลคือแนะนำให้พบแพทย์'} ต้องบันทึกการส่งต่อ</p>` : `<div class="mt8">${ui.seg([['no', 'ไม่ส่งต่อ'], ['yes', 'ส่งต่อสถานพยาบาล']], on ? 'yes' : 'no', { a: 'cfRef', label: 'ส่งต่อสถานพยาบาล' })}</div>`}
    ${on ? `<div class="cl-ref-g mt8">${ui.field({ id: 'cfRefTo', label: 'ส่งต่อไปที่', value: f.refTo, req: true, a: 'refTo', ph: 'เช่น โรงพยาบาลหรือคลินิกใกล้บ้าน', error: bad('refTo') ? 'ใส่ชื่อสถานพยาบาล หรือ "โรงพยาบาลใกล้บ้าน"' : '' })}
      ${ui.field({ id: 'cfRefWhy', label: 'เหตุผลที่ส่งต่อ', value: f.refWhy, req: true, a: 'refWhy', ph: 'เช่น ไข้สูง 3 วัน ควรให้แพทย์ตรวจ', error: bad('refWhy') ? 'ใส่เหตุผลที่ส่งต่อ' : '' })}
      <div class="field${bad('refU') ? ' err' : ''}"><span class="f-l" id="cfRefU" tabindex="-1">ความเร่ง<span class="req" aria-hidden="true">*</span></span><div class="mt4">${ui.seg(REF_U, f.refU, { a: 'cfRefU', label: 'ความเร่ง' })}</div>${bad('refU') ? `<p class="err-t">${ic('circle-x', 14, 2)}<span>เลือกความเร่ง</span></p>` : ''}</div></div>` : ''}</div>`;
}
SC.act('cfRef', t => { const f = SC.S.closeForm; f.refOn = t.dataset.v === 'yes'; if (f.refOn && !f.refWhy) f.refWhy = SC.CASES[f.key].symptoms.join(' '); SC.refresh(); });
SC.act('cfRefU', t => { SC.S.closeForm.refU = t.dataset.v; SC.refresh(); });
/* the draft survives a round trip to the chat; a state picked in the review panel (or switching to "no medicine") starts it fresh */
const cfOf = ctx => {
  const key = keyFor(ctx), f = SC.S.closeForm, rs = ctx.p.reason;
  if (!f || f.key !== key || SC.S._reseed || (f.st === 'nomeds') !== (ctx.st === 'nomeds')) return (SC.S.closeForm = { key, st: ctx.st, ...CF0(key, ctx.st), ...(rs ? { reason: rs, preset: rs } : {}) });
  if (rs && f.preset !== rs) { f.reason = rs; f.preset = rs; }
  return f;
};
const paidMeds = key => { const o = SC.S.orders[key]; return o?.status === 'paid' ? o.items : []; };
function medsNote(o) {
  if (!o || o.status === 'draft') return 'ไม่ได้จ่ายยาในเคสนี้';
  if (o.status === 'sent') return `รายการ ${o.no} ${SC.money(total(o))} ยังไม่ชำระ (ชำระได้ถึง 16:20) · ใบสรุปนี้ยังไม่มีรายการยา ลูกค้าเห็นรายการในแชท`;
  if (o.status === 'cancelled') return `รายการ ${o.no} ยกเลิกแล้ว · ไม่ได้จ่ายยา`;
  if (o.status === 'expired') return `รายการ ${o.no} หมดเวลา ลูกค้าไม่ได้ชำระ · ไม่ได้จ่ายยา`;
  return '';
}
function sumDoc(f, c, meds, o) {
  const p = SC.casePerson(c), me = SC.me(), lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
  return `<article class="doc" aria-label="ตัวอย่างใบสรุปที่ลูกค้าเห็น">
    <div class="doc-h"><div><b>ใบสรุปการปรึกษา</b><span>${esc(me.name)} · ${esc(me.lic)}</span><span>${esc(SC.branch().name)} · ${SC.NOW.date} 14:16 · <span class="mono">${esc(SC.caseCode(c))}</span></span></div>${ic('badge-check', 26, 1.8)}</div>
    <p class="doc-for">สำหรับ ${esc(p.name)}${SC.isFam(c) ? ` (${esc(p.rel)})` : ''}</p>
    <h4>1 อาการที่แจ้ง</h4><p id="pvSym">${esc(f.sym) || '<i class="muted">ยังไม่ได้กรอก</i>'}</p>
    <h4>2 คำแนะนำ</h4><ul id="pvAdv">${lines(f.adv).map(x => `<li>${esc(x)}</li>`).join('') || '<li class="muted">ยังไม่ได้กรอก</li>'}</ul>
    <h4>3 ยาที่ได้รับ</h4>${meds.length ? `<ul>${meds.map(i => `<li><b>${esc(i.name)}</b> ${i.qty} ${esc(i.unit)}<br><span class="small">${esc(i.how)}</span></li>`).join('')}</ul>` : `<p class="muted">${o?.status === 'sent' ? 'รอลูกค้าชำระ' : 'ไม่ได้ซื้อยา'}</p>`}
    <div class="doc-warn"><h4>${ic('octagon-alert', 15, 2)}ไปพบแพทย์ทันทีถ้า</h4><ul id="pvWarn">${lines(f.warn).map(x => `<li>${esc(x)}</li>`).join('') || '<li class="muted">ยังไม่ได้กรอก</li>'}</ul></div>
    ${refOn(f) && f.refTo ? `<h4>ส่งต่อสถานพยาบาล</h4><p>${esc(f.refTo)}${f.refU ? ` · ${esc(REF_U.find(x => x[0] === f.refU)[1])}` : ''}${f.refWhy ? `<br><span class="small">${esc(f.refWhy)}</span>` : ''}</p>` : ''}
    ${f.follow && (meds.length || o?.status !== 'sent') ? `<h4>ติดตามอาการ</h4><p>${meds.length ? 'แอปเตือนกินยาทุกมื้อ · ' : ''}เภสัชกร${esc(askWhen(askOf(f, meds)))}</p>` : ''}
    <p class="small mt8">ใบสรุปนี้ไม่ใช่การวินิจฉัยของแพทย์ · เก็บ 1 ปีนับจากวันปิดเคส</p></article>`;
}
const doneRec = () => SC.S.lastClosed;
/* when the app will ask, as real dates (real-user R 19/10: "ครบคอร์สเมื่อไร") · the mock course is 5 days from today; the real length comes from the order lines */
const COURSE_DAYS = 5;
const addDay = (d, n) => { const [dd, mm, yy] = d.split('/').map(Number), x = new Date(yy, mm - 1, dd + n); return `${String(x.getDate()).padStart(2, '0')}/${String(x.getMonth() + 1).padStart(2, '0')}/${x.getFullYear()}`; };
/* item 82 (owner 20/10 "ใช่ทำได้"): no medicine given, the app asks once, tomorrow or in 3 days, and sends no medicine reminders */
const askOf = (f, meds) => meds.length ? (f.ask === 'both' ? 'both' : 'end') : (f.ask === 'd3' ? 'd3' : 'd1');
const askWhen = ask => { if (ask === 'd1' || ask === 'd3') return `ถาม ${addDay(SC.NOW.date, ask === 'd3' ? 3 : 1)} 19:00 (${ask === 'd3' ? 'อีก 3 วัน' : 'พรุ่งนี้'}) ครั้งเดียว`; const end = addDay(SC.NOW.date, COURSE_DAYS), mid = addDay(SC.NOW.date, Math.ceil(COURSE_DAYS / 2) - 1); return ask === 'both' ? `ถาม ${mid} 19:00 และ ${end} 19:00 (คอร์ส ${COURSE_DAYS} วัน)` : `ถาม ${end} 19:00 วันถัดจากครบคอร์ส ${COURSE_DAYS} วัน`; };
SC.screen('close', {
  code: 'S305', group: 3, duty: true, title: 'ปิดเคสและใบสรุป', nav: 'queue',
  states: [['draft', 'ใบสรุปจากตัวช่วย', { cust: [['room', 'paid', 'ลูกค้ายังอยู่ในห้อง รอใบสรุป']] }],
    ['lint', 'มีคำที่เป็นชื่อโรค', { cust: [['summary', 'closed']] }],
    ['missing', 'กรอกไม่ครบ', { cust: [['room', 'paid']] }],
    ['nomeds', 'ไม่ได้จ่ายยา', { cust: [['summary', 'nomeds', 'ได้ใบสรุปทุกครั้ง แม้ไม่ได้ซื้อยา'], ['follow', 'sym', 'นัดติดตามแบบไม่มียา: แอปถามอาการ (ข้อ 82)'], ['follow', 'symdue', 'ถึงวันถามอาการ']] }],
    ['done', 'ปิดเคสแล้ว', { cust: [['summary', 'closed', 'ใบสรุปที่ลูกค้าได้รับ'], ['room', 'closed'], ['follow', 'day1', 'เริ่มติดตามอาการวันนี้']] }]],
  notes: ['เคาะแล้ว 20/10 ข้อ 82: นัดติดตามอาการได้แม้ไม่ได้จ่ายยา (เจ้าของ: "ใช่ทำได้") · ไม่ได้จ่ายยา: เภสัชกรเลือกให้แอปถามอาการ 1 ครั้ง พรุ่งนี้ หรืออีก 3 วัน · ไม่มีเตือนกินยา · รายการยังไม่ชำระ: เริ่มเองเมื่อลูกค้าชำระ', 'เคาะแล้ว 20/10 ข้อ 85 (เจ้าของ: "ข้อ 85 ตรวจคำชื่อโรคเฉพาะข้อความที่ลูกค้าเห็นตามที่แนะนำ") · ใบสรุปตรวจอาการที่แจ้ง คำแนะนำ และอาการที่ต้องพบแพทย์ (ลูกค้าเห็นทั้งหมด)', 'เคาะแล้ว 20/10: รายการคำที่นับเป็นชื่อโรค ให้เภสัชกรดูแล ไม่ต้องส่งฝ่ายกฎหมาย เพราะลูกค้าที่ใช้แอปนี้คุยกับเภสัชกรเท่านั้น (เจ้าของ: "เข้าเภสัชเท่านั้นเวลาลูกค้าใช้งานแอพนี้") · ตอนนี้ใช้รายการตัวอย่าง 30 คำ', 'เคาะแล้ว 20/10: ลูกค้าที่รอโทรกลับมาปรึกษาใหม่ ติ๊กตอนปิดเคสแล้วนับว่าติดต่อแล้ว บันทึกว่า "คุยในเคสนี้แล้ว" · รายงานแพ้ยายังต้องตอบในติดตามหลังปรึกษา (ข้อ 58)', 'รีวิว UX 20/10: แถบเคสอยู่บนสุด (ขั้น 4 ปิดเคส) · แถบล่างติดจอ บอกว่ายังขาดช่องไหน กดแล้วเลื่อนไปช่องนั้น หรือบอกว่า "พร้อมปิดเคส" · ปุ่มปิดเคสไม่ตกขอบจออีก', 'เคาะแล้ว 19/10: ลูกค้าที่ชำระหลังปิดเคส เริ่มติดตามอาการเมื่อชำระ เหมือนเคสปกติ (ข้อ 42)', '4 หัวข้อเดียวกับใบสรุปที่ลูกค้าเห็น (C401): อาการที่แจ้ง · คำแนะนำ · ยาที่ได้รับ · ไปพบแพทย์ทันทีถ้า', 'ทุกช่องเติมจากเคสที่เปิดอยู่ (อาการ คำตอบในแชท กติกาตามอาการ) แก้ได้', 'ยาที่ได้รับ = เฉพาะรายการที่ชำระแล้ว · ยังไม่ชำระ: ถามก่อนปิดว่าเก็บรายการไว้ให้ลูกค้าชำระ หรือยกเลิก', '"จ่ายยาแล้ว" เลือกได้เมื่อชำระแล้วเท่านั้น', '19/10 เจ้าของเคาะ "ให้เภสัชเลือกได้ตั้งแต่ต้น": เปิดติดตามแล้วเลือก ถามหลังครบคอร์สอย่างเดียว (ค่าตั้งต้น) หรือ กลางคอร์ส และหลังครบคอร์ส · แอปเตือนทานยาทุกมื้อเหมือนกันทั้งสองแบบ', 'คำแนะนำห้ามระบุชื่อโรค (เจ้าของเคาะ ตามฝ่ายกฎหมาย) ระบบหาคำที่เป็นชื่อโรคและไม่ให้ปิดจนกว่าจะแก้', 'หน้าปิดเคสแล้วอ่านค่าจริงของเคส: เหตุผล ยอด สถานะชำระ ติดตามอาการ'],
  wait: [],
  head: () => ({ title: 'ปิดเคสและใบสรุป', sub: SC.branch().name }),
  /* paid 14:33 like the customer app, closed 14:35; an unpaid case closes on the running clock */
  now: ctx => { const t = ctx.st === 'done' ? '14:36' : '14:35'; return { date: SC.NOW.date, time: SC.S.orders[ctx.p.k]?.status === 'paid' ? t : SC.at(t) }; },
  prep(S, st, p) {
    p.k = p.k || (S._reseed ? 'smj' : S.activeCase || S.lastClosed?.key) || 'smj';
    if (S._reseed && st !== 'nomeds') { const o = SC.seedOrder('plan', p.k, true); o.status = 'paid'; o.paid = { ...PAY.pickup }; o.sent = '14:20'; }
    if (S._reseed && st === 'done') { S.clk = SC.toMin('14:36'); S.closeForm = { key: p.k, st, ...CF0(p.k, st) }; record(S.closeForm); return; }
    if (st !== 'done') S.activeCase = p.k;
  },
  render(ctx) {
    const st = ctx.st, key = keyFor(ctx), c = SC.CASES[key];
    if (st === 'done') {
      const r = doneRec() || {}, o = SC.S.orders[r.key];
      const ordTxt = !r.no ? 'ไม่มี' : r.pay === 'paid' ? `<span class="mono">${esc(r.no)}</span> · ชำระแล้ว ${SC.money(r.amt)} · ${esc(o?.paid?.method || 'พร้อมเพย์')} ${esc(o?.paid?.at || '')}` : r.pay === 'sent' ? `<span class="mono">${esc(r.no)}</span> · ยังไม่ชำระ ${SC.money(r.amt)} · ชำระได้ถึง 16:20 · รออยู่ในกล่องรอชำระบนหน้าคิว` : `<span class="mono">${esc(r.no)}</span> · ยกเลิกแล้ว`;
      return `<div class="done-w"><section class="card done">
        <span class="done-ic">${ic('check', 40, 2.4)}</span><h2 class="h2 mt12">ปิดเคสแล้ว ${esc(r.t || '14:41')}</h2>
        <p class="mt8">ส่งใบสรุปให้ ${esc(r.who || '')} แล้ว · ลูกค้าได้รับแจ้งเตือนในแอป</p>
        <div class="done-kv mt16">${ui.kv([['เคส', `<span class="mono">${esc(r.id || '')}</span>`], ['ระยะเวลา', `${esc(r.dur || '')} (${esc(r.start || '14:16')}-${esc(r.t || '14:41')})`], ['เหตุผลที่ปิด', esc(r.res || '')], ['รายการยา', ordTxt], ['ติดตามอาการ', r.follow ? `เปิด · ${r.ask === 'both' ? 'ถามกลางคอร์ส และหลังครบคอร์ส' : r.ask === 'end' ? 'ถามหลังครบคอร์สอย่างเดียว' : `ไม่ได้จ่ายยา ${askWhen(r.ask)}`}` : r.pay === 'sent' ? 'เริ่มเมื่อลูกค้าชำระ · ถ้าไม่ชำระภายใน 16:20 จะไม่เปิด' : 'ไม่ได้เปิด'], ['บันทึกโดย', `${esc(SC.me().name)} · ${esc(SC.me().lic)}`]])}</div>
        <div class="btn-row mt24" style="justify-content:center">${ui.btn('รับเคสถัดไป', { go: 'queue', st: 'live', icon: 'layout-list', lg: true, focus: true })}${r.pay === 'paid' && o?.paid?.recv === 'pickup' && !o.handed ? ui.btn('ไปที่ชำระเงินและจัดยา', { kind: 'secondary', go: 'pay', st: 'pickup', p: { k: r.key }, icon: 'store', lg: true }) : ''}</div></section></div>`;
    }
    const f = cfOf(ctx), o = SC.S.orders[key], meds = paidMeds(key), wait = o?.status === 'sent', ask = askOf(f, meds), hits = SC.dxHits(f.adv + ' ' + f.sym + ' ' + f.warn), missing = st === 'missing';
    const can = v => v === 'sold' ? o?.status === 'paid' : v === 'waitpay' ? o?.status === 'sent' : true;
    return `${SC.caseBar(c, { step: 'close', start: 1440 })}<div class="cl-g mt12">
      <section class="card gap16" aria-label="แก้ใบสรุป">
        <div><p class="label">เหตุผลที่ปิดเคส</p><div class="chips mt8" role="radiogroup" aria-label="เหตุผลที่ปิดเคส">${REASONS.filter(([v]) => v !== 'waitpay' || o?.status === 'sent').map(([v, l]) => `<button type="button" class="chip" role="radio" data-a="cfReason" data-v="${v}" aria-pressed="${f.reason === v}" aria-checked="${f.reason === v}"${can(v) ? '' : ' disabled title="ลูกค้ายังไม่ได้ชำระ"'}>${esc(l)}</button>`).join('')}</div></div>
        ${refBox(f, c, missing)}
        ${ui.field({ id: 'cfSym', label: '1 อาการที่แจ้ง', textarea: true, rows: 2, value: f.sym, req: true, a: 'sym', error: missing && !f.sym.trim() ? 'กรอกอาการที่ลูกค้าแจ้ง' : '' })}
        ${ui.field({ id: 'cfAdv', label: '2 คำแนะนำ (บรรทัดละข้อ ห้ามระบุชื่อโรค)', textarea: true, rows: 3, value: f.adv, req: true, a: 'adv', error: missing && !f.adv.trim() ? 'กรอกคำแนะนำอย่างน้อย 1 ข้อ' : hits.length ? `พบคำที่เป็นชื่อโรค: ${hits.join(', ')} · เปลี่ยนเป็นคำบรรยายอาการหรือคำแนะนำการดูแล` : '' })}
        <div class="field"><span class="f-l">3 ยาที่ได้รับ <span class="opt-t">(เฉพาะที่ชำระแล้ว)</span></span>${meds.length ? `<ul class="cl-meds">${meds.map(i => `<li><b>${esc(i.name)}</b> ${i.qty} ${esc(i.unit)} ${ui.cls(i.type)}<span class="small">${esc(i.how)}</span></li>`).join('')}</ul>` : `<p class="small${o?.status === 'sent' ? ' warn-t' : ''}">${esc(medsNote(o))}</p>`}</div>
        ${ui.field({ id: 'cfWarn', label: '4 ไปพบแพทย์ทันทีถ้า (บรรทัดละข้อ)', textarea: true, rows: 3, value: f.warn, req: true, a: 'warn', error: missing && !f.warn.trim() ? 'กรอกอาการที่ต้องไปพบแพทย์ทันทีอย่างน้อย 1 ข้อ ลูกค้าต้องเห็นช่องนี้ทุกครั้ง' : '' })}
        ${ui.sw({ title: 'ติดตามอาการหลังปรึกษา', sub: wait ? 'เริ่มเองเมื่อลูกค้าชำระ' : meds.length ? 'แอปเตือนทานยาทุกมื้อ · ลูกค้าปิดเองได้ · ถ้าแจ้งว่าแย่ลง ร้านติดต่อกลับภายใน 2 ชั่วโมงในเวลาทำการ' : 'ไม่ได้จ่ายยา แอปถามอาการลูกค้า 1 ครั้ง · ถ้าแจ้งว่าแย่ลง ร้านติดต่อกลับภายใน 2 ชั่วโมงในเวลาทำการ', on: f.follow && !wait, disabled: wait, id: 'cfFollow', icon: 'heart-pulse' })}
        ${wait ? '' : `<div class="cl-ask" id="cfAskBox"${f.follow ? '' : ' hidden'}><p class="label">ถามอาการลูกค้า</p><div class="mt8">${meds.length ? ui.seg([['end', 'หลังครบคอร์สอย่างเดียว'], ['both', 'กลางคอร์ส และหลังครบคอร์ส']], ask, { a: 'cfAsk', label: 'ถามอาการลูกค้าเมื่อไร' }) : ui.seg([['d1', 'พรุ่งนี้'], ['d3', 'อีก 3 วัน']], ask, { a: 'cfAsk', label: 'ถามอาการลูกค้าเมื่อไร' })}</div><p class="small mt8"><b id="cfAskWhen">${esc(askWhen(ask))}</b> · ลูกค้าตอบแตะเดียว · ${meds.length ? 'กลางคอร์สเหมาะกับยาที่ต้องดูผลระหว่างทาง เช่น ยาปฏิชีวนะ หรือมีไข้' : 'ไม่มีเตือนกินยา เพราะไม่ได้จ่ายยา'}</p></div>`}
        ${pendBox(c, f)}
        ${ui.field({ id: 'cfNote', label: 'บันทึกของเภสัชกร (ลูกค้าไม่เห็น)', optional: true, textarea: true, rows: 2, value: f.note, a: 'note' })}
        <div class="cl-foot"><p class="grow" id="cfState" role="status">${cfState(f, hits)}</p>${ui.btn('กลับไปแชท', { kind: 'secondary', go: 'room', st: key === 'kid' ? 'kid' : 'talk', p: { k: key } })}${ui.btn('ปิดเคสและส่งใบสรุป', { a: 'closeCase', icon: 'clipboard-check', disabled: !!hits.length, id: 'cfGo' })}</div>
      </section>
      <aside><p class="label">ลูกค้าจะเห็น</p><div id="docBox">${sumDoc(f, c, meds, o)}</div></aside></div>`;
  },
  mount(el, ctx) {
    if (ctx.st === 'done') return;
    SC.tickElapsed(el, ctx, 1440);
    const f = cfOf(ctx), c = SC.CASES[f.key];
    $('.cl-g', el)?.addEventListener('input', e => {
      const k = e.target.dataset.in; if (!k) return;
      f[k] = e.target.value;
      if (k !== 'adv' && e.target.value.trim()) { const fd = e.target.closest('.field'); fd.classList.remove('err'); e.target.removeAttribute('aria-invalid'); $('.err-t', fd)?.remove(); }
      $('#docBox', el).innerHTML = sumDoc(f, c, paidMeds(f.key), SC.S.orders[f.key]);
      const hits = SC.dxHits(f.adv + ' ' + f.sym + ' ' + f.warn), go = $('#cfGo', el);
      if (go) go.disabled = !!hits.length;
      const sEl = $('#cfState', el); if (sEl) sEl.innerHTML = cfState(f, hits);
      const fa = $('#cfAdv', el).closest('.field'); fa.classList.toggle('err', !!hits.length);
      let et = $('.err-t', fa); if (hits.length) { if (!et) { fa.insertAdjacentHTML('beforeend', `<p class="err-t">${ic('circle-x', 14, 2)}<span></span></p>`); et = $('.err-t', fa); } et.querySelector('span').textContent = `พบคำที่เป็นชื่อโรค: ${hits.join(', ')} · เปลี่ยนเป็นคำบรรยายอาการหรือคำแนะนำการดูแล`; } else if (et) et.remove();
    });
    $('#cfFollow', el)?.addEventListener('click', e => { f.follow = e.currentTarget.getAttribute('aria-checked') !== 'true'; const b = $('#cfAskBox', el); if (b) b.hidden = !f.follow; $('#docBox', el).innerHTML = sumDoc(f, c, paidMeds(f.key), SC.S.orders[f.key]); });
  }
});
/* the footer says in words why the case cannot close yet, and jumps to the field */
const NEED = [['sym', 'cfSym', 'อาการที่แจ้ง'], ['adv', 'cfAdv', 'คำแนะนำ'], ['warn', 'cfWarn', 'ไปพบแพทย์ทันทีถ้า']];
function cfState(f, hits) {
  const miss = [...refMiss(f), ...NEED.filter(([k]) => !String(f[k] || '').trim())];
  if (hits.length) return `<span class="danger-t">${ic('circle-x', 14, 2)} มีคำที่เป็นชื่อโรค: ${esc(hits.join(', '))} · แก้ก่อนจึงปิดเคสได้</span> <button type="button" class="link" data-a="cfJump" data-v="cfAdv">ไปที่ช่องคำแนะนำ</button>`;
  if (miss.length) return `<span class="warn-t">${ic('triangle-alert', 14, 2)} ยังกรอกไม่ครบ ${miss.length} ช่อง:</span> ${miss.map(([, id, l]) => `<button type="button" class="link" data-a="cfJump" data-v="${id}">${l}</button>`).join(' · ')}`;
  return `<span class="ok-t">${ic('circle-check', 14, 2)} พร้อมปิดเคส</span> <span class="small">ลูกค้าได้รับใบสรุปทันที · แชทและบันทึกเก็บ 1 ปีนับจากวันปิดเคส · ไม่บันทึกวิดีโอ</span>`;
}
SC.act('cfJump', t => { const x = $('#' + t.dataset.v); if (x) { x.scrollIntoView({ block: 'center', behavior: SC.RED() ? 'auto' : 'smooth' }); x.focus({ preventScroll: true }); } });
SC.act('cfReason', t => { const f = SC.S.closeForm; f.reason = t.dataset.v; if (f.reason === 'doctor' && !f.refWhy) f.refWhy = SC.CASES[f.key].symptoms.join(' '); SC.refresh(); });
/* the pharmacist picks when the app asks (owner 19/10 "ให้เภสัชเลือกได้ตั้งแต่ต้น") */
SC.act('cfAsk', t => { const f = SC.S.closeForm; f.ask = t.dataset.v; t.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === t))); const w = $('#cfAskWhen'); if (w) w.textContent = askWhen(askOf(f, paidMeds(f.key))); const d = $('#docBox'); if (d) d.innerHTML = sumDoc(f, SC.CASES[f.key], paidMeds(f.key), SC.S.orders[f.key]); });
/* the record of a closed case: drives the done screen, the queue box, the history and the counters */
function record(f) {
  const S = SC.S, c = SC.CASES[f.key], o = S.orders[f.key], paid = o?.status === 'paid', live = o && ['sent', 'paid'].includes(o.status);
  const res = (REASONS.find(r => r[0] === f.reason) || [])[1] || '';
  const start = S.accAt || '14:16', t = SC.clockStr(), mins = SC.toMin(t) - SC.toMin(start);
  const rec = { key: f.key, id: c.id, who: SC.casePerson(c).name, topic: c.symptoms.join(' '), mode: c.mode === 'video' ? 'วิดีโอ' : 'แชท', start, t, dur: mins > 0 ? `${mins} นาที` : 'ไม่ถึง 1 นาที',
    res: f.reason === 'waitpay' ? 'ส่งรายการแล้ว ยังไม่ชำระ' : res, tone: paid ? 'ok' : o?.status === 'sent' ? 'warn' : 'muted', amt: live || o?.status === 'cancelled' ? total(o) : 0,
    no: o && o.status !== 'draft' ? o.no : '', pay: o && o.status !== 'draft' ? o.status : 'none', code: live ? o.no.slice(-4) : '', follow: !!(f.follow && o?.status !== 'sent'), ask: askOf(f, paid ? o.items : []), branch: S.branch, ph: S.me,
    doc: { sym: f.sym, adv: String(f.adv).split('\n').map(x => x.trim()).filter(Boolean), meds: paid ? o.items.map(i => `${i.name} ${i.qty} ${i.unit}`) : [], medsNote: paid ? '' : medsNote(o), warn: String(f.warn).split('\n').map(x => x.trim()).filter(Boolean) },
    ref: refOn(f) ? { to: f.refTo, why: f.refWhy, u: f.refU } : null, snap: SC.snapOf ? SC.snapOf(c, o, f) : null };
  S.closed = S.closed.filter(x => x.key !== f.key).concat(rec); S.lastClosed = rec;
  return rec;
}
/* a closed case read together with its order as it is NOW: paid after closing = medicine given, summary lists it,
   follow-up starts the same as a case paid before closing; expired or cancelled after closing = no medicine */
SC.closedView = x => {
  const o = SC.S.orders[x.key];
  if (!x.no || !o || o.no !== x.no) return x;
  const meds = o.items.map(i => `${i.name} ${i.qty} ${i.unit}`), more = { paidAt: o.paid?.at || '', recv: o.paid?.recv || '', ready: o.ready, handed: o.handed };
  if (o.status === 'paid' && x.pay === 'paid') return { ...x, ...more };
  if (o.status === 'paid') return { ...x, ...more, res: 'จ่ายยาแล้ว (ชำระหลังปิดเคส)', tone: 'ok', pay: 'paid', late: true, amt: total(o), follow: true, doc: { ...x.doc, meds, medsNote: '' } };
  if (x.pay === 'sent' && ['expired', 'cancelled'].includes(o.status)) return { ...x, res: o.status === 'expired' ? 'ไม่ได้จ่ายยา (รายการหมดเวลา)' : 'ไม่ได้จ่ายยา (ยกเลิกรายการ)', tone: 'muted', pay: o.status, doc: { ...x.doc, meds: [], medsNote: medsNote(o) } };
  return x;
};
SC.lateFollow = () => SC.S.closed.filter(x => x.branch === SC.S.branch).map(SC.closedView).filter(x => x.late && x.follow);
/* the follow-up call this person is waiting for can be ticked as talked about in this case (owner 20/10, item 58).
   A reaction report still needs its own reply in S401 (the pharmacist decides there whether it goes in the allergy record) */
function pendBox(c, f) {
  const pend = SC.pendingFor(c); if (!pend.length) return '';
  return `<div class="cl-pend"><p class="label">${ic('triangle-alert', 13, 2.2)} เรื่องค้างของ ${esc(SC.casePerson(c).name)} (${pend.length})</p>
    ${pend.map(x => x.kind === 'fu' ? `<button type="button" class="opt mt8" role="checkbox" data-a="cfPend" data-v="${esc(x.k)}" aria-checked="${!!f.pend?.[x.k]}"><span class="ck">${ic('check', 13, 3)}</span><span class="tx"><b>${esc(x.text)}</b><span>ติ๊กถ้าคุยเรื่องนี้ในเคสนี้แล้ว ระบบบันทึกว่าติดต่อแล้วตอนปิดเคส ไม่ต้องโทรซ้ำ</span></span></button>`
      : `<div class="cl-pend-i mt8">${ic(x.icon, 16, 2)}<p class="grow"><b>${esc(x.text)}</b><span class="small">ตอบในติดตามหลังปรึกษา และเลือกว่าจะบันทึกในประวัติแพ้ยาไหม · ปิดเคสนี้ได้ เรื่องไม่หาย</span></p>${ui.btn('ไปตอบ', { kind: 'secondary', sm: true, go: x.go, st: x.st })}</div>`).join('')}</div>`;
}
SC.act('cfPend', t => { const f = SC.S.closeForm, k = t.dataset.v, on = t.getAttribute('aria-checked') !== 'true'; f.pend = { ...(f.pend || {}), [k]: on }; t.setAttribute('aria-checked', String(on)); });
async function doClose(btn) {
  const S = SC.S, f = S.closeForm;
  await SC.busy(btn, 700);
  SC.bump(SC.clk() + 1);
  const rec = record(f), at = SC.clockStr(); SC.logEv('take', 'ปิดเคส', rec.id || SC.CASES[f.key]?.id || '');
  const talked = Object.keys(f.pend || {}).filter(k => f.pend[k]);
  talked.forEach(k => { S.fu[k] = { st: 'called', res: 'ok', at, note: `คุยในเคส ${rec.id ? rec.id.slice(-4) : ''} แล้ว` }; });
  S.activeCase = null; S.accT = 0; S.ov = null;
  SC.go('close', { st: 'done', p: { k: f.key } });
  SC.toast(`ปิดเคสของ ${rec.who} แล้ว ส่งใบสรุปให้ลูกค้าแล้ว${talked.length ? ' · บันทึกเรื่องติดตามอาการว่าติดต่อแล้ว' : ''}`, 'clipboard-check');
}
SC.act('closeCase', t => {
  const S = SC.S, f = S.closeForm, need = [['cfSym', f.sym], ['cfAdv', f.adv], ['cfWarn', f.warn]].filter(([, v]) => !String(v || '').trim());
  if (need.length || refMiss(f).length) { SC.go('close', { st: 'missing', p: { k: f.key } }); return; }
  const o = S.orders[f.key], ab = SC.abxIn(o);
  /* real-user test 21/10: the advice may not tell the customer "no antibiotics needed" while one is on the order */
  if (ab.length && SC.NOAB_RE.test(f.adv)) return SC.openOv(() => `<div class="scrim" data-a="ovClose"></div><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mdT">
    <div class="modal-h"><span class="danger-t">${ic('octagon-alert', 24, 2)}</span><div class="grow"><h2 id="mdT">คำแนะนำขัดกับยาที่จ่าย</h2><p>ปิดเคสไม่ได้จนกว่าจะแก้</p></div>${ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
    <div class="modal-b"><p>คำแนะนำเขียนว่า <b>"${esc((f.adv.match(SC.NOAB_RE) || [''])[0])}"</b> แต่รายการยามี <b>${esc(ab.join(', '))}</b></p><p class="mt8">แก้คำแนะนำให้ตรงกับยาที่จ่าย หรือยกเลิกรายการยาก่อนปิดเคส</p></div>
    <div class="modal-f">${ui.btn('กลับไปแก้คำแนะนำ', { a: 'ovClose', icon: 'pencil' })}</div></div>`);
  if (o?.status === 'sent' && f.reason !== 'waitpay') return SC.openOv(() => `<div class="scrim" data-a="ovClose"></div><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mdT">
    <div class="modal-h"><span class="warn-t">${ic('clock', 24, 2)}</span><div class="grow"><h2 id="mdT">รายการยายังไม่ชำระ</h2><p>${esc(o.no)} · ${SC.money(total(o))} · ชำระได้ถึง 16:20</p></div>${ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
    <div class="modal-b"><div class="opts">
      <button type="button" class="opt" data-a="cfPay" data-v="keep"><span class="tx"><b>เก็บรายการไว้ให้ลูกค้าชำระ</b><span>ปิดเคสได้เลย รายการไปรอที่กล่องรอชำระบนหน้าคิว ใบสรุปยังไม่มีรายการยาจนกว่าจะชำระ</span></span></button>
      <button type="button" class="opt" data-a="cfPay" data-v="cancel"><span class="tx"><b>ยกเลิกรายการ แล้วปิดเคส</b><span>ปุ่มชำระในแชทใช้ไม่ได้ทันที ใบสรุปบอกว่าไม่ได้จ่ายยา</span></span></button></div></div>
    <div class="modal-f">${ui.btn('กลับไปแก้ใบสรุป', { kind: 'secondary', a: 'ovClose' })}</div></div>`);
  doClose(t);
});
SC.act('cfPay', t => {
  const S = SC.S, f = S.closeForm, o = S.orders[f.key];
  if (t.dataset.v === 'cancel') { o.status = 'cancelled'; if (f.reason === 'waitpay') f.reason = 'advice'; }
  doClose(t);
});
})();

/* ===== 65-labels-mgr.js ===== */
/* =====================================================================
   65 · Group 4 (cont.): S405 ฉลากยา. The shop's label list on its own (item 81, owner 20/10: "ต้องมี" + "มีเมนูจัดการ
   ฉลากยาในระบบด้วย"): find a medicine, read its labels, quick edit the Thai text, check what AI translated, print, add.
   A medicine with no label yet can start from a label of the same medicine under another brand.
   Pharmacists and superadmin; store staff never (item 59). Every branch reads and edits the same list.
   ===================================================================== */
(() => {
const { $, esc, ic, ui } = SC;
const items = () => {
  const skus = new Set([...SC.CATALOG.map(i => i.sku), ...SC.lblSkus()]);
  return [...skus].map(sku => {
    const p = SC.prodOf(sku), ls = SC.labelsOf(sku);
    return { sku, p, ls, name: p?.name || ls[0]?.tx.th.trade || sku, gen: ls[0]?.tx.th.generic || p?.gen || (p?.has || []).find(x => /^[A-Za-z]/.test(x)) || '' };
  });
};
const flags = x => ({ none: !x.ls.length, check: x.ls.some(v => SC.lblLangs(v).some(k => SC.lblState(v, k))), edit: x.ls.some(v => v.ed || v.src === 'added') });
const FILTERS = [['all', 'ทั้งหมด'], ['none', 'ยังไม่มีฉลาก'], ['check', 'คำแปลรอตรวจ'], ['edit', 'แก้หรือเพิ่มแล้ว']];
const view = () => {
  const S = SC.S, all = items(), q = String(S.lmQ || '').trim().toLowerCase(), f = S.lmF || 'all';
  const hit = x => !q || [x.name, x.sku, x.gen, ...(x.p?.has || []), ...x.ls.map(v => v.name)].some(s => String(s).toLowerCase().includes(q));
  /* owner 20/10: "405 default แบบไม่มีฉลากขึ้นเลยก็ได้นะจนกว่าจะกดเสิชชื่อ" · a work filter (no label, AI to check) also lists */
  const open = !!q || f !== 'all', picked = all.find(x => x.sku === S.lmSel);
  const list = open ? all.filter(x => (f === 'all' || flags(x)[f]) && hit(x)).sort((a, b) => a.name.localeCompare(b.name, 'th')) : picked ? [picked] : [];
  return { all, list, open, sel: list.find(x => x.sku === S.lmSel) || list[0] };
};
const card = v => {
  const S = SC.S, ls = SC.lblLangs(v), k = ls.includes(S.lmLang?.[v.id]) ? S.lmLang[v.id] : 'th', miss = SC.LANGS.filter(x => !v.tx[x]);
  const add = SC.canLabel() && miss.length ? ui.btn(`แปลภาษาที่ยังไม่มีด้วย AI (${miss.length})`, { kind: 'ghost', sm: true, a: 'aiAdd', v: v.id, icon: 'sparkles' }) : '';
  return `<section class="card lm-card${S.lmFlash === v.id ? ' flash' : ''}" id="lm-${esc(v.id)}" aria-label="ฉลาก ${esc(v.name)}">
    <div class="lm-h"><h3>${esc(v.name)}</h3>${SC.lblSrcTag(v)}<span class="sp"></span><span class="small">${ls.length} ภาษา</span></div>
    ${SC.lblLangSeg(v, k, 'lmLang', v.id)}${SC.lblBody(v, k, { acts: add })}${hist(v)}</section>`;
};
/* every edit is a version: who, when, before and after, and the first version stays readable */
const hist = v => !v.hist?.length ? `<p class="small muted mt8">${ic('history', 12, 2)} ฉบับ 1 · ยังไม่เคยแก้</p>`
  : `<details class="lb-hist mt8"><summary>${ic('history', 13, 2)} ฉบับ ${v.ver} · แก้มาแล้ว ${v.hist.length} ครั้ง ดูของเดิม</summary><ol class="mt8">${v.hist.map((h, i) => `<li><b>ฉบับ ${i + 2}</b> · ${esc(h.by)} ${esc(h.at)}<ul>${h.ch.map(([f, a, b]) => `<li>${esc(f)}: <s>${esc(a || 'ว่าง')}</s> เป็น ${esc(b || 'ว่าง')}</li>`).join('')}</ul></li>`).reverse().join('')}<li><b>ฉบับ 1</b> · ${esc(v.src === 'bigya' ? 'ฉลากเดิมของร้าน' : v.src === 'added' ? `เพิ่มโดย ${v.by} ${v.at}` : 'ข้อมูลตัวอย่าง')}</li></ol></details>`;
const panel = x => {
  if (!x) return ui.empty({ icon: 'search', title: 'ไม่พบยาที่ค้น', body: 'ลองค้นด้วยชื่อสามัญ รหัสสินค้า หรือชื่อฉลาก' });
  const can = SC.canLabel(), same = x.ls.length ? [] : SC.lblSrcList(x.sku).same;
  return `<section class="card" aria-label="${esc(x.name)}"><div class="lm-h"><h3>${esc(x.name)}</h3><span class="small mono">${esc(x.sku)}</span><span class="sp"></span>${can ? ui.btn('เพิ่มฉลากให้ยานี้', { kind: x.ls.length ? 'secondary' : 'primary', sm: true, a: 'lblNew', v: 'sku:' + x.sku, icon: 'plus' }) : ''}</div>
      <p class="small mt4">${x.gen ? `ชื่อยา ${esc(x.gen)} · ` : ''}${x.p ? `คงเหลือในสาขา ${x.p.stock} ${esc(x.p.unit)}` : 'ไม่มีในสต็อกสาขานี้ ฉลากยังใช้ได้เมื่อมีของ'} · ${x.ls.length ? `ฉลาก ${x.ls.length} แบบ ใช้กับอาการต่างกัน` : 'ยังไม่มีฉลาก'}</p></section>
    ${x.ls.length ? x.ls.map(card).join('') : `<div class="card mt12">${ui.empty({ icon: 'file-text', title: 'ยาตัวนี้ยังไม่มีฉลาก', body: same.length ? `มีฉลากของตัวยาเดียวกัน ${same.length} แบบในระบบ ดึงมาทำฉลากได้ทุกภาษา` : 'เพิ่มฉลากภาษาไทย แล้วให้ AI แปลภาษาอื่น', btn: can ? ui.btn('เพิ่มฉลาก', { a: 'lblNew', v: 'sku:' + x.sku, icon: 'plus' }) : '' })}</div>`}`;
};
const body = () => {
  const S = SC.S, { all, list, sel, open } = view();
  if (!open && !sel) return `<section class="card lm-start mt16">${ui.empty({ icon: 'search', title: 'ค้นยาเพื่อดูฉลาก', body: `พิมพ์ชื่อยา ชื่อสามัญ รหัสสินค้า หรือชื่อฉลาก · ยาหนึ่งตัวมีได้หลายฉลาก ผลค้นแสดงทุกฉลากของยานั้น · มียา ${all.length} ตัว ฉลาก ${all.reduce((n, x) => n + x.ls.length, 0)} แบบ` })}</section>`;
  return `<div class="lm-g"><section class="card pad0" aria-label="รายการยา"><ul class="lm-list">${list.map(x => {
      const fl = flags(x);
      return `<li><button type="button" class="lm-it" data-a="lmSel" data-v="${esc(x.sku)}" aria-current="${x === sel}"><b>${esc(x.name)}</b><span class="small">${esc(x.sku)}${x.gen ? ` · ${esc(x.gen)}` : ''}</span>${x.ls.length ? `<span class="small lm-ls">${ic('file-text', 12, 2)} ${x.ls.map(v => esc(v.name)).join(' · ')}</span>` : ''}
        <span class="hrow wrap">${fl.none ? ui.tag('ยังไม่มีฉลาก', 'warn', { icon: 'triangle-alert' }) : ui.tag(`${x.ls.length} ฉลาก`, 'line', { icon: 'file-text' })}${fl.check ? ui.tag('คำแปลรอตรวจ', 'warn', { icon: 'sparkles' }) : ''}</span></button></li>`; }).join('') || `<li class="small" style="padding:12px">ไม่พบยาที่ค้น</li>`}</ul></section>
    <div>${panel(sel)}</div></div>`;
};
SC.screen('labels', {
  code: 'S405', group: 4, title: 'ฉลากยา', nav: 'labels',
  states: [['list', 'ยังไม่ค้น (ค่าเริ่มต้น)'], ['none', 'ยาที่ยังไม่มีฉลาก'], ['check', 'คำแปล AI รอตรวจ'], ['add', 'เพิ่มฉลากใหม่'], ['search', 'ค้นไม่เจอ'], ['found', 'ค้นแล้ว: ยาหนึ่งตัวหลายฉลาก']],
  notes: ['เจ้าของ 20/10: "405 default แบบไม่มีฉลากขึ้นเลยก็ได้นะจนกว่าจะกดเสิชชื่อ" · "แล้วยา 1 ตัวมีได้หลายฉลาก" · เปิดจอมาไม่มีรายการ ขึ้นช่องค้นอย่างเดียว · ค้นแล้วรายการบอกชื่อทุกฉลากของยาแต่ละตัว กดยาแล้วเห็นฉลากทุกแบบของยานั้น · ปุ่ม "ยังไม่มีฉลาก" และ "คำแปลรอตรวจ" ยังเปิดรายการงานค้างได้โดยไม่ต้องค้น',
    'เคาะแล้ว 20/10 ข้อ 85 (เจ้าของ: "ข้อ 85 ตรวจคำชื่อโรคเฉพาะข้อความที่ลูกค้าเห็นตามที่แนะนำ") · ฉลากตรวจวิธีใช้และข้อบ่งใช้ภาษาไทย · ชื่อฉลากใช้ในร้าน ไม่พิมพ์บนฉลาก จึงไม่ตรวจ',
    'เคาะแล้ว 20/10 ข้อ 81: มีเมนูจัดการฉลากแยก (เจ้าของ: "ต้องมี") · เพิ่มหรือแก้ฉลากได้โดยไม่ต้องใส่ยาในรายการ เช่น ยาที่ของหมด',
    'เจ้าของ 20/10: "ไม่ต้องโชว์ของจริงในหน้า UI แค่โชว์ชื่อฉลากและรายละเอียดก็พอ รวมถึงให้แก้ไข quick edit ได้ แต่ตอนพิมพ์ให้ใช้ format จริง" · ฉลากจริง 90 x 65 มม. เห็นตอนกด "ดูก่อนพิมพ์" เท่านั้น',
    'เพิ่มฉลาก (เจ้าของ: "ต้องทำได้ง่าย และมี AI แปลภาษาด้วย และสามารถดึง generic เดิมมาทำฉลากได้"): เลือกยา · เริ่มจากฉลากของตัวยาเดียวกัน ฉลากเดิมของยาตัวนี้ หรือเริ่มใหม่ · กรอกภาษาไทย · AI แปลภาษาอื่น',
    'ข้อ 80 (เจ้าของ: "แก้ภาษาไทยเท่านั้น"): แก้ไขด่วนได้เฉพาะภาษาไทย บันทึกแล้ว AI แปลภาษาอื่นตาม · คำแปลของ AI พิมพ์ได้เมื่อเภสัชกรกด "ตรวจคำแปลแล้ว"',
    'ยาตัวหนึ่งมีได้หลายฉลาก (เจ้าของ: "ยาตัวนึงมีได้หลายฉลาก") ตั้งชื่อตามอาการที่ใช้ · ชื่อซ้ำในยาตัวเดียวกันไม่ได้',
    'เจ้าของ 20/10 (ห้องรีวิว อย.): "ต้องเก็บ log ด้วย" · แก้ฉลากทุกครั้งเป็นฉบับใหม่ เก็บ ใคร เมื่อไร ของเดิม ของใหม่ · ฉบับเก่าไม่ถูกลบ เปิดดูได้ใต้ฉลาก · เคสที่ปิดแล้วจำฉบับที่พิมพ์ไว้ แก้ฉลากทีหลังไม่กระทบเคสเก่า · ทุกการแก้ขึ้นในบันทึกการเข้าถึง (S504)',
    'ใครทำได้: เภสัชกรและผู้ดูแลระบบเพิ่มและแก้ได้ทุกฉลาก (ข้อ 59) · พนักงานร้านเปิดจอนี้ไม่ได้ · แก้แล้วทุกสาขาเห็นทันที',
    'AI แปลในต้นแบบเป็นการจำลอง รู้จักวลีที่ฉลากของร้านใช้บ่อย คำที่ไม่รู้จักค้างเป็นภาษาไทยและขึ้นเตือน · ตอนสร้างจริงใช้บริการแปล'],
  wait: [],
  head: () => { const { all } = view(); return { title: 'ฉลากยา', sub: `ใช้ร่วมกันทุกสาขา · ยา ${all.length} ตัว · ฉลาก ${all.reduce((n, x) => n + x.ls.length, 0)} แบบ` }; },
  prep(S, st) {
    if (!S._reseed) return;
    S.lmQ = st === 'search' ? 'ไม่มียานี้' : st === 'found' ? SC.labelsOf('100827')[0].tx.th.generic.split(' ')[0] : ''; S.lmF = st === 'none' ? 'none' : st === 'check' ? 'check' : 'all'; S.lblQE = null; S.lmLang = {};
    S.lmSel = st === 'none' || st === 'add' ? 'TW-00702' : st === 'check' ? '101325' : st === 'found' ? '100827' : null;
    if (st === 'check') {
      /* ภก.ธัชพล changed the Thai how-to this morning; AI wrote the other 5 languages, nobody has checked them yet */
      const v = SC.labelsOf('101325')[0], th = { ...v.tx.th, how: 'รับประทานครั้งละ 1 เม็ด วันละ 1 ครั้ง ก่อนนอน' }, others = SC.LANGS.filter(k => k !== 'th'), tr = Object.fromEntries(others.map(k => [k, SC.aiTx(th, k)]));
      S.lblEdit = { [v.id]: { name: v.name, tx: { th, ...Object.fromEntries(others.map(k => [k, tr[k].t])) }, ai: Object.fromEntries(others.map(k => [k, 'ai'])), miss: Object.fromEntries(others.map(k => [k, tr[k].miss])), stale: [], by: SC.PHARM.tp.short, at: SC.NOW.date, hist: [{ by: SC.PHARM.tp.short, at: `${SC.NOW.date} 10:12`, ch: [['วิธีใช้', v.tx.th.how, th.how]] }] } };
    }
    S.lmOpenAdd = st === 'add';
  },
  render() {
    const S = SC.S, { all } = view(), n = k => all.filter(x => flags(x)[k]).length;
    return `<section class="card" aria-label="ค้นฉลาก"><div class="lm-bar">
        <input id="lmQ" class="input" type="search" placeholder="ค้นชื่อยา ชื่อสามัญ รหัสสินค้า หรือชื่อฉลาก" value="${esc(S.lmQ || '')}" aria-label="ค้นฉลาก">
        ${ui.seg(FILTERS.map(([k, t]) => [k, k === 'all' ? t : `${t} ${n(k)}`]), S.lmF || 'all', { a: 'lmF', label: 'กรองรายการ' })}
        <span class="sp"></span>${SC.canLabel() ? ui.btn('เพิ่มฉลากใหม่', { a: 'lblNew', icon: 'plus' }) : ''}</div></section>
      <div id="lmBody">${body()}</div>`;
  },
  mount(el) {
    const S = SC.S, q = $('#lmQ', el);
    q?.addEventListener('input', () => { S.lmQ = q.value; S.lblQE = null; $('#lmBody', el).innerHTML = body(); });
    if (S.lmFlash) { const c = document.getElementById('lm-' + S.lmFlash); S.lmFlash = null; if (c) requestAnimationFrame(() => c.scrollIntoView({ block: 'center', behavior: SC.RED() ? 'auto' : 'smooth' })); }
    if (S.lmOpenAdd) { S.lmOpenAdd = false; SC.lblNewOpen({ sku: 'TW-00702' }); }
  }
});
SC.act('lmF', t => { SC.S.lmF = t.dataset.v; SC.S.lblQE = null; SC.refresh(); });
SC.act('lmSel', t => { SC.S.lmSel = t.dataset.v; SC.S.lblQE = null; SC.refresh(); });
SC.act('lmLang', t => { const [id, k] = t.dataset.v.split('|'); SC.S.lmLang = { ...(SC.S.lmLang || {}), [id]: k }; SC.refresh(); });
})();

/* ===== 66-pack.js ===== */
/* =====================================================================
   66 · Group 4 (cont.): S404 จัดยาและส่ง. Paid orders that still need hands in the store: prepare and tell the
   customer (pickup), book the courier, print the label and hand the parcel over (parcel), call the rider (express).
   Owner 20/10/2026 (item 67): "บัญชี staff ทำตามขอบเขตที่เสนอเลย". A store-staff account sees this screen and
   "รับยาด้วยรหัส" only: name, order no, medicines and how the order leaves the store. It never sees symptoms, chat,
   allergies or case history, and cannot accept a case, build a medicine list, close a case, touch labels or settings.
   Booking a courier or a rider follows the website's existing flow (item 64): the buttons here stand in for it.
   ===================================================================== */
(() => {
const { esc, ic, ui } = SC;
/* orders paid earlier today, before this story starts: fictional customers with no case attached (nothing medical to show) */
const m = (x, qty) => ({ ...x, qty: qty || x.qty });
const SEED = () => ({
  /* real-user test 21/10: one cold order in the default list, booked by phone, waiting for the courier */
  f9: { key: 'f9', who: 'มาลี ก.', br: 'tw', no: 'MT4D7H2CW9P', status: 'paid', sent: '12:40', paid: { ...SC.PAY.cold, at: '12:52' }, to: SC.COLD_TO, km: SC.COLD_KM, ready: null, handed: null, booked: true, bookedAt: '13:30', packed: { at: '13:20', by: 'คุณสุนิสา', hand: 0, cold: { box: true, gel: true } }, coldTrk: { no: 'IX2610180042', by: 'คุณสุนิสา', at: '13:30' }, items: [m(SC.CATALOG.find(i => i.sku === 'TW-00977'))] },
  f1: { key: 'f1', who: 'ประภา ว.', br: 'tw', no: 'MT6P3W8KT4B', status: 'paid', sent: '12:58', paid: { ...SC.PAY.pickup, at: '13:06' }, ready: null, handed: null, booked: false, items: [m(SC.MED.cpm), m(SC.ORDER_ITEMS[1], 2)] },
  f2: { key: 'f2', who: 'ณัฐพล ก.', br: 'tw', no: 'MT8D2N5HQ7R', status: 'paid', sent: '12:30', paid: { ...SC.PAY.parcel, at: '12:41' }, to: 'แขวงศาลาธรรมสพน์ เขตทวีวัฒนา กรุงเทพมหานคร 10170', km: 6.5, ready: null, handed: null, booked: false, items: [m(SC.MED.ors), m(SC.MED.antacid)] },
  f3: { key: 'f3', who: 'อรุณี ส.', br: 'tw', no: 'MT4V9C1LF6S', status: 'paid', sent: '13:52', paid: { ...SC.PAY.express, at: '14:02' }, to: 'ต.บางสีทอง อ.บางกรวย จ.นนทบุรี 11130', km: 12, ready: null, handed: null, booked: false, items: [m(SC.MED.tears)] },
  f4: { key: 'f4', who: 'สมศักดิ์ ป.', br: 'tw', no: 'MT1B7X3ZM9C', status: 'paid', sent: '10:48', paid: { ...SC.PAY.pickup, at: '10:55' }, ready: '11:05', handed: '11:20', booked: false, items: [m(SC.MED.calamine)] },
  f5: { key: 'f5', who: 'ชไมพร ร.', br: 'on', no: 'MT5G8R2YW3N', status: 'paid', sent: '13:15', paid: { ...SC.PAY.parcel, at: '13:30' }, to: 'แขวงบางจาก เขตพระโขนง กรุงเทพมหานคร 10260', km: 3.6, ready: null, handed: null, booked: false, items: [m(SC.MED.brom)] }
});
const fresh0 = SC.fresh;
SC.fresh = () => { const s = fresh0(); s.orders = { ...SEED(), ...s.orders }; return s; };
if (!SC.S.orders.f1) Object.assign(SC.S.orders, SEED());

/* the same destination lines S304 shows for the story case: district and province only, the full address is on the label */
const TO = { parcel: SC.HOME_TO, express: SC.HOME_TO };
const RECV = { pickup: ['รับที่ร้าน', 'store'], parcel: ['พัสดุ Flash Express', 'truck'], express: ['ส่งด่วน Lalamove', 'zap'], cold: ['ส่งเย็น Inter Express', 'snowflake'] };
const NOW_STEPS = ['prep', 'book', 'ship'];
const stepOf = o => !o || o.status !== 'paid' ? 'unpaid' : o.paid?.recv === 'pickup' ? (o.handed ? 'done' : o.ready ? 'wait' : 'prep') : o.shipped ? 'done' : (o.paid?.recv === 'cold' ? o.coldTrk : o.booked) ? 'ship' : 'book';
/* every order of this branch that is waiting for payment or for the store, read through the same record as "รับยาด้วยรหัส" */
const rows = (bid = SC.S.branch) => {
  const keys = Object.keys(SC.S.orders); if (!SC.S.orders.wip) keys.push('wip');
  return keys.map(k => SC.pickRec(k)).filter(r => r.branch === bid && ['sent', 'paid'].includes(r.status)).map(r => ({ ...r, o: SC.S.orders[r.key], step: stepOf(SC.S.orders[r.key]) }));
};
SC.packLeft = () => rows().filter(r => NOW_STEPS.includes(r.step)).length;

const track = SC.trackNo = r => r.key === 'smj' ? 'TH2610183NQ7' : 'TH261018' + r.no.slice(-4);
SC.RECV = RECV;
SC.packTo = r => r.o?.to || TO[r.recv] || '';
const recvTag = r => { const [t, i] = RECV[r.recv] || RECV.pickup; return `<span class="tag line">${ic(i, 13, 2.2)}${esc(t)}</span>`; };
const meds = items => `<ul class="pk-meds">${(items || []).map(i => `<li><b>${esc(i.name)}</b><span class="num">${i.qty} ${esc(i.unit)}</span></li>`).join('')}</ul>`;
const ADM = 'ผู้ดูแลระบบดูอย่างเดียว ให้คนในสาขากด';
/* real-user test 21/10: a cold order has no label step, so the card carries the fixed fee, the full address and the
   receiver's phone (opened through the logged phone pop-up). Owner 21/10: "ระบบจอง IEL ไม่ต้องทำอะไรทั้งนั้น ผมจะโทรจองเอง",
   so no booking number or channel is shown. Sample address */
SC.coldAddr = o => `${o.addr || '88/15 ถนนกาญจนาภิเษก'} ${o.to || SC.COLD_TO}`;
const coldBook = r => `<span class="cold-bk"><span>ค่าส่ง ${SC.money(300)} คงที่ ลูกค้าชำระแล้ว</span>
  <span>ผู้รับ ${esc(r.name || r.o.who || '')} · ${esc(SC.coldAddr(r.o))}</span>
  <span class="btn-row">${ui.btn('คัดลอกที่อยู่', { kind: 'secondary', sm: true, icon: 'copy', a: 'coldCopy', v: r.key })}${ui.btn('ดูเบอร์ผู้รับ', { kind: 'secondary', sm: true, icon: 'phone', a: 'coldTel', v: r.key })}</span></span>`;
SC.act('coldCopy', async t => {
  const o = SC.S.orders[t.dataset.v], a = SC.coldAddr(o);
  try { await navigator.clipboard.writeText(a); } catch (e) { /* the prototype may run without clipboard access */ }
  SC.toast('คัดลอกที่อยู่แล้ว', 'copy');
});
SC.act('coldTel', t => { const o = SC.S.orders[t.dataset.v]; SC.phoneShow({ name: o.who || '', phone: o.tel || '08x-xxx-5521', id: o.no, callee: 'ผู้รับ', hint: 'ให้ Inter Express ใช้เบอร์นี้ติดต่อผู้รับ' }); });
const next = r => {
  const o = r.o, d = SC.isAdmin() ? { disabled: true, title: ADM } : {}, exp = r.recv === 'express';
  /* every order is checked piece by piece first (67-pack-check.js); confirming does what the old buttons did */
  const by = o.packed ? ` · จัดโดย ${esc(o.packed.by)} ${esc(o.packed.at)}${o.packed.hand ? ` (กดเอง ${o.packed.hand} ชิ้น)` : ''}` : '';
  const pack = then => [`ชำระแล้ว ${esc(o.paid.at)} · ยังไม่ได้จัด<br>จัดครบแล้ว ${then}`, ui.btn('จัดยา', { a: 'pcOpen', v: r.key, icon: 'scan-barcode', ...d })];
  if (r.step === 'prep') return pack('ระบบแจ้งลูกค้าว่ายาพร้อมรับ');
  const hand = ui.btn('ลูกค้ามารับ ส่งมอบยา', { kind: 'secondary', a: 'pickupOv', v: r.key, icon: 'store', ...d });
  /* owner 21/10: past 30 days only a tag and a call. Nothing is cancelled or refunded by the system, hand-over still works */
  if (r.step === 'wait' && r.over) return [`แจ้งยาพร้อมรับ ${esc(r.readyD)} ${esc(o.ready)} · ค้างรับ ${r.days} วัน${by}<br>แจ้งเตือนลูกค้าแล้ววันที่ 15 และวันที่ 30 · ${esc(SC.PICK_CALL)}`, ui.btn('ดูเบอร์', { kind: 'secondary', a: 'pkTel', v: r.key, icon: 'phone', ...d }) + hand];
  if (r.step === 'wait') return [`แจ้งลูกค้าแล้ว ${esc(o.ready)} · รอลูกค้ามารับ${by}`, hand];
  /* B10: Inter Express has no system link. Packed with the cold box and gel ticked, the store books it and pastes the number or link */
  if (r.recv === 'cold' && r.step === 'book') return o.packed ? [`จัดครบ ${esc(o.packed.at)} · ใส่กล่องเย็นและเจลเย็นแล้ว${by}<br>จอง Inter Express แล้ว แปะเลขหรือลิงก์ติดตามพัสดุ${coldBook(r)}`, SC.coldTrkForm(o)] : pack('ใส่กล่องเย็น แล้วจอง Inter Express');
  if (r.recv === 'cold') return [`Inter Express · ${SC.coldTrkView(o.coldTrk)} · ใส่โดย ${esc(o.coldTrk.by)} ${esc(o.coldTrk.at)}${o.coldTrk.was ? ` · แก้จาก ${esc(o.coldTrk.was)}` : ''}`, ui.btn('แก้เลขหรือลิงก์', { kind: 'secondary', a: 'coldTrkEdit', v: r.key, icon: 'pencil', ...d }) + ui.btn('ส่งให้ขนส่งแล้ว', { a: 'shipped', v: r.key, icon: 'check', ...d })];
  if (r.step === 'book') return pack(exp ? 'ระบบเรียกไรเดอร์' : 'ระบบจองขนส่งและเปิดใบปะหน้า');
  if (exp) return [`ไรเดอร์คุณสมชาย ถึงร้านประมาณ ${esc(SC.hhmm(SC.toMin(o.bookedAt || '14:37') + 15))}${by}`, ui.btn('ส่งให้ไรเดอร์แล้ว', { a: 'shipped', v: r.key, icon: 'check', ...d })];
  return [`จองแล้ว · เลขพัสดุ <span class="mono">${track(r)}</span>${by}`, `${ui.btn('ใบปะหน้า', { kind: 'secondary', a: 'shipOv', v: r.key, icon: 'printer', ...d })}${ui.btn('ส่งให้ขนส่งแล้ว', { a: 'shipped', v: r.key, icon: 'check', ...d })}`];
};
const rowHtml = r => {
  const [st, btns] = next(r), to = r.recv && r.recv !== 'pickup' ? r.o.to || TO[r.recv] : '';
  return `<li class="pk-row"><div class="pk-main"><div class="hrow wrap"><b>${r.who}</b><span class="small mono">${esc(r.no)}</span>${recvTag(r)}${r.over ? ui.tag('เลยกำหนดรับ', 'warn', { icon: 'clock' }) : ''}</div>
    ${meds(r.items)}${to ? `<p class="small mt8">ส่งไปที่ ${esc(to)} · ${r.o.out ? `${ui.tag(SC.OUT_TAG, 'warn', { icon: 'map-pin' })} ห่างสาขา ${esc(r.o.km)} กม.` : esc(SC.zoneTxt(to, r.o.to ? r.o.km : SC.HOME_KM))} · ที่อยู่เต็มพิมพ์บนใบปะหน้า</p>` : ''}</div>
    <div class="pk-side"><p class="small">${st}</p><div class="btn-row">${btns}</div></div></li>`;
};
const doneTxt = r => r.recv === 'pickup' ? ['ลูกค้ารับยาแล้ว', r.o.handed] : [r.recv === 'express' ? 'ส่งให้ไรเดอร์แล้ว' : 'ส่งให้ขนส่งแล้ว', r.o.shipped];

SC.screen('pack', {
  code: 'S404', group: 4, staff: true, title: 'จัดยาและส่ง', nav: 'pack',
  /* after the case closes (14:35); the customer app shows the cold order packed 14:52 */
  now: ctx => ({ date: SC.NOW.date, time: ctx.st === 'cold' || ctx.st === 'coldlink' ? '14:52' : '14:50' }),
  states: [['todo', 'มีรายการต้องจัด', { cust: [['paid', 'pickup', 'ลูกค้าได้รับแจ้งเมื่อร้านกด "ยาพร้อมรับแล้ว"'], ['paid', 'parcel', 'ลูกค้าเห็นเลขพัสดุเมื่อร้านจองขนส่ง']] }],
    ['check', 'จัดยา (ยิงบาร์โค้ด)', { cust: [] }],
    ['label', 'จัดครบ ใบปะหน้าพัสดุ', { cust: [['paid', 'parcel', 'ลูกค้าเห็นเลขพัสดุทันทีที่ร้านจัดครบ']] }],
    ['empty', 'จัดครบแล้ว', { cust: [] }],
    ['cold', 'ยาเก็บเย็น: จองเอง Inter Express', { cust: [['track', 'cold', 'ลูกค้าเห็นเลขพัสดุ Inter Express เมื่อร้านแปะเลข (C414.4)']] }],
    ['outzone', 'ปลดล็อกเขต: พัสดุนอกเขต', { cust: [] }],
    ['coldlink', 'ยาเก็บเย็น: แปะลิงก์ติดตามพัสดุ', { cust: [['track', 'coldlink', 'ลูกค้าเห็นปุ่มลิงก์ติดตามพัสดุ ไม่เห็นที่อยู่ลิงก์เต็ม']] }],
    ['overdue', 'ยาค้างรับเกิน 30 วัน', { cust: [['paid', 'overdue', 'ลูกค้าเห็นว่าเลยกำหนดรับ ร้านจะโทรตกลงเรื่องยาและการคืนเงิน']] }]],
  notes: ['เจ้าของ 21/10: "ระบบจอง IEL ไม่ต้องทำอะไรทั้งนั้น ผมจะโทรจองเอง" · "เอาเลขติดตามพัสดุหรือลิ้งติดตามพัสดุมาแปะ" · จอนี้ไม่มีเบอร์และไม่บอกวิธีจอง Inter Express · จองแล้วแปะเลขพัสดุ (ตัวอักษรหรือตัวเลข 6-30 ตัว) หรือลิงก์ติดตามพัสดุ (ขึ้นต้น https://) ในช่องเดียวกัน · ลิงก์แสดงเป็น "ลิงก์ติดตามพัสดุ" ไม่โชว์ที่อยู่เต็ม · ระบบบันทึกใครแปะ เมื่อไร · แก้ได้ เก็บของเดิมไว้ · ลูกค้าเห็นในแอป',
    'ทำตอนสร้างจริง: รับเฉพาะลิงก์ https ของ Inter Express เท่านั้น กันลิงก์จากที่อื่นส่งถึงลูกค้า',
    'เจ้าของ 21/10: "เฟสนี้ผมของ่ายๆหน่อย ... ไม่อยากสร้างระบบมารองรับไว้จนหนัก" · ยารับที่ร้าน: ระบบแจ้งเตือนลูกค้าวันที่ 15 และวันที่ 30 นับจากวันที่จัดยาเสร็จ · เกิน 30 วัน ขึ้นป้าย "เลยกำหนดรับ" ในรอลูกค้ามารับ และในรับยาด้วยรหัส · ร้านโทรหาลูกค้า ตกลงเรื่องยาและการคืนเงินเอง (ปุ่มดูเบอร์ บันทึกทุกครั้ง) · ระบบไม่ยกเลิกบิลและไม่คืนเงินให้เอง · ยังส่งมอบยาได้ตามปกติ',
    'เจ้าของ 20/10 (B10): "ส่ง inter express logistic ไปเรียกแบบ manual ไม่มี api" · ยาเก็บเย็น: ตอนจัดยาติ๊ก ใส่กล่องเย็น และ ใส่เจลเย็น ก่อนยืนยัน',
    'เจ้าของ 20/10: "ส่วน console จะมี switch สำหรับ admin control ตรงนี้ว่า lock 15 km มั้ย on off" · ตอนผู้ดูแลระบบปลดล็อก (S501) ทุกจอมีแถบ "ปลดล็อกเขตส่งยาอยู่" · พัสดุที่ส่งนอกเขตติดป้าย "นอกเขต (ปลดล็อก)" ในจอนี้ และในบันทึกเคส (S403 S407)',
    'เจ้าของ 20/10 (B9) แก้ 21/10: ทุกรายการที่ส่งบอกระยะจากสาขา ไม่เกิน 15 กม. ตามระยะวิ่งจริง ทุกที่อยู่ รวมกรุงเทพ · ใช้กับพัสดุด้วย',
    'เคาะแล้ว 20/10 ข้อ 88-91 (เจ้าของ: "ข้อ 85-94 ใช้ตามค่าที่ต้นแบบใส่ไว้ได้เลย") · ข้อ 88: ยิงบาร์โค้ดครบทุกชิ้นก่อนยืนยัน กด +1 เองได้เมื่อบาร์โค้ดอ่านไม่ได้ บันทึกจำนวนที่กดเอง · ข้อ 89: พนักงานร้านพิมพ์ฉลากยาตอนจัดยาได้ แก้ไม่ได้ · ข้อ 90: พัสดุจองขนส่งทันทีเมื่อยืนยันจัดครบ · ข้อ 91: พนักงานร้านยกเลิกรายการหรือคืนเงินไม่ได้ เภสัชกรและผู้ดูแลระบบเท่านั้น',
    'เคาะแล้ว 20/10 ข้อ 84: พนักงานร้านกดแจ้งยาพร้อม จองขนส่ง เรียกไรเดอร์ และกดว่าส่งแล้วได้ ส่งมอบยาต้องตรวจรหัสรับยาทุกครั้ง', 'เคาะแล้ว 20/10: บัญชีพนักงานร้าน (staff) เห็นจอนี้กับปุ่ม "รับยาด้วยรหัส" เท่านั้น (เจ้าของ: "บัญชี staff ทำตามขอบเขตที่เสนอเลย" ข้อ 67)',
    'พนักงานร้านเห็น: ชื่อลูกค้า เลขรายการ ยาและจำนวน วิธีรับยา และเขตที่ส่ง · ไม่เห็น: อาการ แชท แพ้ยา ประวัติเคส',
    'พนักงานร้านทำไม่ได้: รับเคส ทำรายการยา ปิดเคส เพิ่มหรือแก้ฉลาก ตั้งค่า · เปิดจออื่นแล้วเห็น S603.2',
    'เภสัชกรเห็นจอนี้ด้วย (เมนู "จัดยาและส่ง") ใช้ตอนไม่มีพนักงาน · ผู้ดูแลระบบดูอย่างเดียว',
    'เจ้าของ 20/10: "staff ต้องจัดการสินค้าได้ แพค ส่ง ลองเช็กใน lma กับ website" · จัดยาแบบเดียวกับหน้าจัดของของเว็บ: ยิงบาร์โค้ดทุกชิ้น กด +1 เองได้เมื่อบาร์โค้ดอ่านไม่ได้ (บันทึกจำนวนไว้) ยืนยันได้เมื่อครบทุกรายการ',
    'ยืนยันจัดครบ: พัสดุ = จองขนส่งและเปิดใบปะหน้า 4x6 ทันที (เหมือนเว็บ) พิมพ์ซ้ำได้ · ไรเดอร์ = เรียกไรเดอร์ · รับที่ร้าน = แจ้งลูกค้าว่ายาพร้อมรับ',
    'ฉลากยาพิมพ์จากหน้าจัดยาได้ ข้อความตามที่เภสัชกรเลือก แก้ไม่ได้ (ข้อ 59) · คำแปลที่ยังไม่ตรวจพิมพ์ไม่ได้',
    'เรียกไรเดอร์และจองขนส่งใช้ขั้นตอนเดิมของระบบเว็บ (ข้อ 64) ปุ่มในจอนี้เป็นตัวแทน',
    'ต้องทำตอนนี้ = ชำระแล้วแต่ยังไม่ได้จัด จอง หรือส่ง · รอลูกค้ามารับ = แจ้งแล้ว รอลูกค้า · รอลูกค้าชำระ = ยังไม่ต้องจัด',
    'ส่งมอบยาทุกครั้งต้องตรวจรหัสรับยา 4 ตัวของลูกค้า เหมือนปุ่ม "รับยาด้วยรหัส"'],
  wait: [],
  head: () => ({ title: 'จัดยาและส่ง', sub: `${SC.branch().name} · ต้องทำตอนนี้ ${SC.packLeft()} รายการ` }),
  prep(S, st) {
    if (!S._reseed) return;
    if (st === 'check') { const o = S.orders.f2; S.pk = { k: 'f2', n: { [o.items[0].sku]: 2 }, hand: {}, err: '' }; S.pkAuto = 'check'; return; }
    const f7 = () => ({ key: 'f7', who: 'วรรณา ท.', br: 'tw', no: 'MT2C9K4RX5L', status: 'paid', sent: '14:20', paid: { ...SC.PAY.cold, at: '14:33' }, to: SC.COLD_TO, km: SC.COLD_KM, ready: null, handed: null, booked: false, items: [m(SC.CATALOG.find(i => i.sku === 'TW-00977'))] });
    if (st === 'cold') { S.orders.f7 = f7(); S.pkAuto = 'cold'; return; }
    /* owner 21/10: a pasted link (sample address, not a real one) */
    if (st === 'coldlink') { S.orders.f7 = { ...f7(), booked: true, bookedAt: '14:52', packed: { at: '14:50', by: 'คุณสุนิสา', hand: 0, cold: { box: true, gel: true } }, coldTrk: { link: 'https://track.interexpress.example/IX2610180051', by: 'คุณสุนิสา', at: '14:52' } }; return; }
    /* the story order picked up at the store, packed 17/09/2026 like the customer app (C309 เลยกำหนดรับ): 31 days today */
    if (st === 'overdue') { Object.assign(SC.seedOrder('confirm', 'smj', true), { br: 'tw', status: 'paid', sent: '14:20', paid: { ...SC.PAY.pickup, at: '14:33' }, ready: '14:52', readyD: '17/09/2026', packed: { at: '14:52', by: 'คุณสุนิสา', hand: 0 } }); return; }
    if (st === 'outzone') { S.zoneLock = false; S.zoneInfo = { at: '10:30', by: 'admin', why: 'หนังสือ อย. ที่ สธ 1011/0000 (ตัวอย่าง)' }; S.orders.f8 = { key: 'f8', who: 'อรุณี ช.', br: 'tw', no: 'MT8V3QW2K7D', status: 'paid', sent: '11:02', paid: { ...SC.PAY.parcel, at: '11:10' }, to: 'ต.สุเทพ อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50200', km: 690, out: true, ready: null, handed: null, booked: false, items: [m(SC.CATALOG.find(i => i.sku === 'TW-00611'))] }; return; }
    if (st === 'label') { Object.assign(S.orders.f2, { packed: { at: '14:31', by: SC.me().short, hand: 0 }, booked: true, bookedAt: '14:31' }); S.pkAuto = 'label'; return; }
    if (st !== 'empty') return;
    Object.values(S.orders).forEach(o => {
      if (o.status !== 'paid') return;
      if (o.paid.recv === 'pickup') { o.ready = o.ready || '13:40'; o.handed = o.handed || '14:05'; } else { o.booked = true; o.shipped = o.shipped || '14:00'; }
    });
  },
  render() {
    const all = rows(), now = all.filter(r => NOW_STEPS.includes(r.step)), wait = all.filter(r => r.step === 'wait').sort((a, b) => b.over - a.over);
    const unpaid = all.filter(r => r.step === 'unpaid'), done = all.filter(r => r.step === 'done').sort((a, b) => doneTxt(b)[1].localeCompare(doneTxt(a)[1]));
    return `<section class="card" aria-label="ต้องทำตอนนี้">${ui.cardH('ต้องทำตอนนี้', now.length ? ui.tag(`${now.length} รายการ`, 'warn', { icon: 'package' }) : '', { icon: 'package' })}
        ${now.length ? `<ul class="pk-list">${now.map(rowHtml).join('')}</ul>` : ui.empty({ icon: 'circle-check', title: 'จัดครบแล้ว', body: 'รายการใหม่ขึ้นที่นี่ทันทีที่ลูกค้าชำระ' })}</section>
      ${wait.length ? `<section class="card mt12" aria-label="รอลูกค้ามารับ">${ui.cardH('รอลูกค้ามารับ', ui.tag(`${wait.length} รายการ`, 'muted'), { icon: 'store' })}<ul class="pk-list">${wait.map(rowHtml).join('')}</ul></section>` : ''}
      ${unpaid.length ? `<section class="card mt12" aria-label="รอลูกค้าชำระ">${ui.cardH('รอลูกค้าชำระ', '', { icon: 'clock' })}<p class="small">ยังไม่ต้องจัด · ลูกค้ามาก่อนชำระ ให้ชำระในแอปก่อน</p>
        <ul class="pk-mini mt8">${unpaid.map(r => `<li><b>${r.who}</b><span class="small mono">${esc(r.no)}</span><span class="num">${SC.money(r.amt)}</span><span class="small">ชำระได้ถึง ${esc(r.until)}</span></li>`).join('')}</ul></section>` : ''}
      ${done.length ? `<section class="card mt12" aria-label="เสร็จแล้ววันนี้">${ui.cardH(`เสร็จแล้ววันนี้ (${done.length})`, '', { icon: 'circle-check' })}
        <ul class="pk-mini">${done.map(r => { const [w, t] = doneTxt(r); return `<li><span class="num">${esc(t)}</span><b>${r.who}</b><span class="small mono">${esc(r.no)}</span><span class="small">${esc(w)}</span></li>`; }).join('')}</ul></section>` : ''}
      ${SC.isStaff() ? `<p class="small mt12 pk-scope">${ic('lock', 13, 2)}<span>บัญชีพนักงานร้านเห็นชื่อ เลขรายการ และยาที่ต้องจัดเท่านั้น · อาการ แชท และประวัติแพ้ยาเปิดได้เฉพาะเภสัชกร</span></p>` : ''}`;
  },
  mount() { const a = SC.S.pkAuto; if (!a) return; SC.S.pkAuto = null; if (a === 'check') SC.pcShow('f2'); else if (a === 'cold') SC.pcShow('f7'); else SC.shipShow('f2'); },
  sims: () => [{ label: 'ลูกค้าคนใหม่ชำระแล้ว (รับที่ร้าน)', run: () => {
    const S = SC.S; if (S.orders.f6) return SC.toast('มีรายการนี้แล้ว', 'info');
    S.orders.f6 = { key: 'f6', who: 'กิตติ ม.', br: S.branch, no: 'MT3K7Q2WN8D', status: 'paid', sent: SC.clockStr(), paid: { ...SC.PAY.pickup, at: SC.clockStr() }, ready: null, handed: null, booked: false, items: [m(SC.ORDER_ITEMS[0])] };
    SC.refresh(); SC.toast('ลูกค้าชำระแล้ว รายการขึ้นในต้องทำตอนนี้', 'circle-check');
  } }]
});
SC.act('shipped', async t => {
  const o = SC.S.orders[t.dataset.v]; await SC.busy(t, 450); o.shipped = SC.clockStr(); SC.refresh();
  SC.toast(`${o.paid.recv === 'express' ? 'ส่งให้ไรเดอร์' : 'ส่งให้ขนส่ง'}แล้ว ${o.shipped} · ลูกค้าติดตามได้ในแอป`, 'truck');
});
})();

/* ===== 67-pack-check.js ===== */
/* =====================================================================
   67 · S404 (cont.): จัดยา, the check before an order leaves the store. Owner 20/10/2026: "staff ต้องจัดการสินค้าได้
   แพค ส่ง ลองเช็กใน lma กับ website ว่าต้องทำอะไรได้อีก". Same steps as the website's packing screen (F11): scan the
   barcode of every piece, +1 by hand only when a barcode will not read (kept with the order), confirm opens only when
   every line matches. Confirming a parcel books the courier and opens its 4x6 label, as the website does; a rider order
   calls the rider; a pickup order tells the customer the medicine is ready. The drug labels print from here, print only
   (item 59: store staff never edit a label).
   ===================================================================== */
(() => {
const { $, esc, ic, ui } = SC;
/* the mock barcode on each box: the real one comes from the store system's barcode list */
const BC = sku => '885' + sku.replace(/\D/g, '').padStart(10, '0');
const ADM = 'ผู้ดูแลระบบดูอย่างเดียว ให้คนในสาขากด';
const recvOf = o => o.paid?.recv || 'pickup';
const GO = { pickup: ['จัดครบ แจ้งลูกค้าว่ายาพร้อมรับ', 'bell'], parcel: ['จัดครบ จองขนส่งและพิมพ์ใบปะหน้า', 'truck'], express: ['จัดครบ เรียกไรเดอร์', 'zap'], cold: ['จัดครบ ใส่กล่องเย็นแล้ว', 'snowflake'] };
/* B10: the packing checks of a cold-chain order, both must be ticked before confirming */
const COLD_CK = [['box', 'ใส่ในกล่องเก็บความเย็นแล้ว'], ['gel', 'ใส่เจลเย็นแล้ว']];
const lines = (o, P) => o.items.map(it => ({ it, need: it.qty, got: P.n[it.sku] || 0 }));
/* the labels the pharmacist picked for the order lines, in the language picked on S303 */
SC.packLabels = o => o.items.map(it => { const l = SC.labelOf(it); return l && { id: l.v.id, lang: SC.S.lblLang?.[`${o.key}:${it.sku}`] || 'th', it, title: `${it.name} · ฉลาก ${l.v.name}` }; }).filter(Boolean);

const pcOv = () => {
  const P = SC.S.pk, o = SC.S.orders[P.k], r = SC.pickRec(P.k), L = lines(o, P), ro = SC.isAdmin();
  const need = L.reduce((n, x) => n + x.need, 0), got = L.reduce((n, x) => n + Math.min(x.got, x.need), 0), all = L.every(x => x.got === x.need);
  const cold = recvOf(o) === 'cold', coldOk = !cold || COLD_CK.every(([k]) => P.cold?.[k]), ok = all && coldOk;
  const lbl = SC.packLabels(o), [gt, gi] = GO[recvOf(o)] || GO.pickup;
  const row = x => {
    const s = x.it.sku, h = P.hand[s] || 0;
    const st = x.got === x.need ? ui.tag('ครบ', 'ok', { icon: 'check' }) : x.got > x.need ? ui.tag(`เกิน ${x.got - x.need}`, 'red', { icon: 'circle-x' }) : ui.tag(`ขาด ${x.need - x.got}`, 'warn');
    return `<li class="pc-r${x.got === x.need ? ' ok' : ''}"><div class="grow"><b>${esc(x.it.name)}</b><span class="small mono">${esc(s)} · ${BC(s)}</span>${h ? `<span class="small warn-t">กดเพิ่มเอง ${h} ชิ้น (บาร์โค้ดอ่านไม่ได้)</span>` : ''}</div>
      <b class="num pc-n">${x.got} / ${x.need} <span class="small">${esc(x.it.unit)}</span></b>${st}
      <span class="pc-b">${ui.ib('minus', `เอา ${x.it.name} ออก 1`, { a: 'pcMinus', v: s, disabled: !x.got || ro })}${ui.btn('+1', { kind: 'secondary', sm: true, a: 'pcHand', v: s, disabled: ro || x.got >= x.need, label: `เพิ่ม ${x.it.name} 1 ชิ้นเอง เมื่อบาร์โค้ดอ่านไม่ได้` })}</span></li>`;
  };
  return `<div class="scrim" data-a="ovClose"></div><div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="mdT">
    <div class="modal-h"><span class="brand-t">${ic('scan-barcode', 24, 2)}</span><div class="grow"><h2 id="mdT">จัดยา ${esc(r.who)}</h2><p>รายการ <span class="mono">${esc(o.no)}</span> · ${esc((SC.RECV[recvOf(o)] || SC.RECV.pickup)[0])}</p></div>${ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
    <div class="modal-b">
      <div class="field"><label for="pcBc">ยิงบาร์โค้ดที่กล่องยาทีละชิ้น</label><div class="hrow"><input id="pcBc" class="input grow" autocomplete="off" inputmode="numeric" placeholder="ยิงบาร์โค้ด หรือพิมพ์รหัสสินค้า แล้วกด Enter"${ro ? ' disabled' : ''}>${ui.btn('จำลองยิงบาร์โค้ด', { kind: 'ghost', sm: true, a: 'pcSim', icon: 'scan-barcode', disabled: ro || ok })}</div>
        ${P.err ? `<p class="err-t" role="alert">${ic('circle-x', 14, 2)}<span>${esc(P.err)}</span></p>` : ''}</div>
      <ul class="pc-list mt12">${L.map(row).join('')}</ul>
      <p class="small mt8" id="pcSum" role="status">${all ? `<span class="ok-t">${ic('circle-check', 13, 2)} ครบทุกรายการ ${need} ชิ้น</span>` : `จัดแล้ว ${got} จาก ${need} ชิ้น`}</p>
      ${cold ? `<div class="pc-cold mt16"><p class="label">${ic('snowflake', 14, 2)} ยาเก็บเย็น ตรวจการบรรจุ</p>${COLD_CK.map(([k, l]) => `<button type="button" class="opt mt8" role="checkbox" data-a="pcCold" data-v="${k}" aria-checked="${!!P.cold?.[k]}"${ro ? ' disabled' : ''}><span class="ck">${ic('check', 13, 3)}</span><span class="tx"><b>${l}</b></span></button>`).join('')}</div>` : ''}
      ${lbl.length ? `<div class="pc-lbl mt16"><span class="brand-t">${ic('tag', 18, 2)}</span><div class="grow"><b>ฉลากยา ${lbl.length} ดวง</b><p class="small">ติดฉลากก่อนใส่ถุง · ข้อความตามที่เภสัชกรเลือกไว้ พิมพ์ได้ แก้ไม่ได้</p></div>${ui.btn('ดูและพิมพ์ฉลากยา', { kind: 'secondary', sm: true, a: 'pcLbl', icon: 'printer', disabled: ro })}</div>` : ''}
    </div>
    <div class="modal-f">${ok ? '<span class="sp"></span>' : `<p class="small grow">${ic('lock', 13, 2)} ${all && !coldOk ? 'ติ๊กกล่องเย็นและเจลเย็นก่อนยืนยัน' : 'ปุ่มยืนยันกดได้เมื่อจัดครบทุกรายการ'}</p>`}${ui.btn('ปิด', { kind: 'secondary', a: 'ovClose' })}${ui.btn(gt, { a: 'pcGo', icon: gi, disabled: !ok || ro, title: ro ? ADM : '' })}</div></div>`;
};
const reopen = () => { SC.openOv(pcOv); requestAnimationFrame(() => $('#pcBc')?.focus()); };
/* one piece scanned: its barcode or its product code */
const hit = val => {
  const P = SC.S.pk, o = SC.S.orders[P.k], v = String(val || '').trim().toUpperCase(); if (!v) return;
  const it = o.items.find(i => i.sku.toUpperCase() === v || BC(i.sku) === v);
  if (!it) { P.err = `บาร์โค้ด ${v} ไม่ใช่ยาในรายการนี้ ตรวจกล่องยาอีกครั้ง`; return reopen(); }
  P.n[it.sku] = (P.n[it.sku] || 0) + 1;
  P.err = P.n[it.sku] > it.qty ? `${it.name} เกินจำนวน เอาออก ${P.n[it.sku] - it.qty} ชิ้น` : '';
  reopen();
};
document.addEventListener('keydown', e => { if (e.key !== 'Enter' || e.target.id !== 'pcBc') return; e.preventDefault(); hit(e.target.value); });
SC.pcShow = k => { if (SC.S.pk?.k !== k) SC.S.pk = { k, n: {}, hand: {}, err: '' }; reopen(); };
SC.act('pcOpen', t => SC.pcShow(t.dataset.v));
SC.act('pcSim', () => { const P = SC.S.pk, o = SC.S.orders[P.k], x = lines(o, P).find(l => l.got < l.need); if (x) hit(BC(x.it.sku)); });
SC.act('pcHand', t => { const P = SC.S.pk, s = t.dataset.v; P.n[s] = (P.n[s] || 0) + 1; P.hand[s] = (P.hand[s] || 0) + 1; P.err = ''; reopen(); });
SC.act('pcMinus', t => { const P = SC.S.pk, s = t.dataset.v, o = SC.S.orders[P.k], it = o.items.find(i => i.sku === s); P.n[s] = Math.max(0, (P.n[s] || 0) - 1); P.hand[s] = Math.min(P.hand[s] || 0, P.n[s]); P.err = it && P.n[s] > it.qty ? P.err : ''; reopen(); });
SC.act('pcCold', t => { const P = SC.S.pk; P.cold = { ...(P.cold || {}), [t.dataset.v]: !P.cold?.[t.dataset.v] }; reopen(); });
SC.act('pcLbl', () => { const o = SC.S.orders[SC.S.pk.k]; SC.lblPrint(SC.packLabels(o), `ฉลากยา รายการ ${o.no}`, pcOv); });
SC.act('pcGo', async t => {
  const P = SC.S.pk, o = SC.S.orders[P.k], rv = recvOf(o);
  await SC.busy(t, 600);
  o.packed = { at: SC.clockStr(), by: SC.me().short, hand: Object.values(P.hand).reduce((a, b) => a + b, 0), cold: P.cold ? { ...P.cold } : null };
  SC.S.pk = null;
  if (rv === 'cold') { SC.closeOv(); return SC.toast('จัดครบแล้ว ใส่กล่องเย็นและเจลเย็นแล้ว · จอง Inter Express แล้วแปะเลขหรือลิงก์ติดตามพัสดุ', 'snowflake'); }
  if (rv === 'pickup') { o.ready = SC.clockStr(); SC.closeOv(); return SC.toast(`จัดครบแล้ว แจ้งลูกค้าว่ายาพร้อมรับ ${o.ready}`, 'bell'); }
  Object.assign(o, { booked: true, bookedAt: SC.clockStr() });
  if (rv === 'express') { SC.closeOv(); return SC.toast('จัดครบแล้ว เรียกไรเดอร์ Lalamove แล้ว ลูกค้าได้รับแจ้งในแอป', 'zap'); }
  SC.S.ship = o.key; SC.openOv(shipOv); SC.toast('จัดครบแล้ว จองขนส่ง Flash Express แล้ว ลูกค้าเห็นเลขพัสดุในแอป', 'truck');
});

/* the parcel label the website prints after booking (F11, 4 x 6 inch). Name, address and phone are short here; the
   printed one carries them in full */
const shipOv = () => {
  const o = SC.S.orders[SC.S.ship], r = SC.pickRec(o.key), b = SC.branch(), trk = SC.trackNo(r), n = o.items.reduce((a, i) => a + i.qty, 0);
  return `<div class="scrim" data-a="ovClose"></div><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mdT">
    <div class="modal-h"><span class="brand-t">${ic('truck', 24, 2)}</span><div class="grow"><h2 id="mdT">ใบปะหน้าพัสดุ</h2><p>Flash Express · จองแล้ว ${esc(o.bookedAt || '')} · ขนาด 4 x 6 นิ้ว</p></div>${ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
    <div class="modal-b"><div class="sl" role="img" aria-label="ใบปะหน้าพัสดุ เลขพัสดุ ${trk}">
      <div class="sl-h"><b>Flash Express</b><span>${SC.NOW.date}</span></div>
      <div class="sl-bc" aria-hidden="true"></div><p class="sl-trk mono">${trk}</p>
      <div class="sl-p"><span>ผู้รับ</span><b>${esc(r.who)}</b><p>${esc(o.to || SC.packTo(r))}</p><p class="mono">08x-xxx-xxxx</p></div>
      <div class="sl-p"><span>ผู้ส่ง</span><b>MITRAREE ${esc(b.name)}</b><p class="mono">${esc(b.phone)}</p></div>
      <div class="sl-f"><span class="mono">${esc(o.no)}</span><span>${n} ชิ้น</span><span>ไม่เก็บเงินปลายทาง</span></div></div>
      <p class="small mt12">${ic('info', 13, 2)} ใบที่พิมพ์จริงมีชื่อ ที่อยู่ และเบอร์เต็มของลูกค้า ในต้นแบบย่อไว้</p></div>
    <div class="modal-f"><span class="sp"></span>${ui.btn('ปิด', { kind: 'secondary', a: 'ovClose' })}${ui.btn('พิมพ์ใบปะหน้า', { a: 'shipPrint', icon: 'printer', disabled: SC.isAdmin(), title: SC.isAdmin() ? ADM : '' })}</div></div>`;
};
/* B10: what the store pastes after booking Inter Express itself (no system link). Owner 21/10: "เอาเลขติดตามพัสดุหรือลิ้งติดตามพัสดุมาแปะ".
   A number (letters or digits, 6-30) shows as typed; a link (https:// only) shows as one short "ลิงก์ติดตามพัสดุ", never
   the whole address. Who and when are kept; the customer sees it in the app. Built for real: Inter Express links only */
SC.coldTrkView = t => t.link ? `<a class="link" href="${esc(t.link)}" target="_blank" rel="noopener noreferrer" title="เปิดหน้าติดตามพัสดุของ Inter Express">ลิงก์ติดตามพัสดุ</a>` : `เลขพัสดุ <span class="mono">${esc(t.no)}</span>`;
SC.coldTrkPlain = t => t.link ? 'ลิงก์ติดตามพัสดุ' : `เลขพัสดุ ${t.no}`;
SC.coldTrkForm = o => `<div class="ct-f"><label class="sr" for="ctNo-${o.key}">เลขหรือลิงก์ติดตามพัสดุ Inter Express</label><input id="ctNo-${o.key}" class="input" placeholder="เลขพัสดุ หรือลิงก์ https://" maxlength="300" autocomplete="off" value="${esc(o.coldEdit?.link || o.coldEdit?.no || '')}"${SC.isAdmin() ? ' disabled' : ''}>${ui.btn('บันทึก', { kind: 'secondary', sm: true, a: 'coldTrk', v: o.key, icon: 'check', disabled: SC.isAdmin(), title: SC.isAdmin() ? ADM : '' })}</div>`;
SC.act('coldTrkEdit', t => { const o = SC.S.orders[t.dataset.v]; o.coldEdit = o.coldTrk; o.coldTrk = null; SC.refresh(); requestAnimationFrame(() => $('#ctNo-' + o.key)?.focus()); });
SC.act('coldTrk', async t => {
  const o = SC.S.orders[t.dataset.v], n = $('#ctNo-' + o.key), raw = (n?.value || '').trim();
  const bad = m => { n?.classList.add('bad'); n?.focus(); SC.toast(m, 'info'); };
  let rec;
  if (/^[a-z]+:\/\//i.test(raw)) {
    let u = null; try { u = new URL(raw); } catch (e) { /* not a link */ }
    if (!u || u.protocol !== 'https:' || !u.hostname.includes('.') || /\s/.test(raw)) return bad('ลิงก์ไม่ถูกต้อง ใช้ลิงก์ติดตามพัสดุที่ขึ้นต้นด้วย https://');
    rec = { link: u.href };
  } else {
    const v = raw.toUpperCase();
    if (!/^[A-Z0-9-]{6,30}$/.test(v)) return bad(v ? 'เลขพัสดุไม่ถูกต้อง ใส่ตัวอักษรหรือตัวเลข 6-30 ตัว หรือแปะลิงก์ที่ขึ้นต้นด้วย https://' : 'แปะเลขพัสดุหรือลิงก์ติดตามพัสดุที่ได้จาก Inter Express');
    rec = { no: v };
  }
  await SC.busy(t, 450);
  /* a correction keeps what was there and is logged (real-user test 21/10). A link is never written into the log */
  const p = o.coldEdit, was = p && (p.link || p.no) !== (rec.link || rec.no) ? (p.link ? 'ลิงก์เดิม' : p.no) : '';
  o.coldTrk = { ...rec, by: SC.me().short, at: SC.clockStr(), ...(was ? { was } : {}) }; o.booked = true; o.bookedAt = o.bookedAt || o.coldTrk.at; delete o.coldEdit;
  if (was) SC.logEv('fix', `แก้${rec.link || p.link ? 'การติดตามพัสดุ' : 'เลขพัสดุ'} Inter Express ${was} เป็น ${rec.no || 'ลิงก์ใหม่'}`, o.no);
  SC.refresh(); SC.toast(was ? `แก้เป็น${SC.coldTrkPlain(o.coldTrk)}แล้ว · บันทึกการแก้ไว้` : `บันทึก${SC.coldTrkPlain(o.coldTrk)}แล้ว · ลูกค้าเห็นในแอป`, 'snowflake');
});
SC.shipShow = k => { SC.S.ship = k; SC.openOv(shipOv); };
SC.act('shipOv', t => SC.shipShow(t.dataset.v));
SC.act('shipPrint', async t => { await SC.busy(t, 500); SC.closeOv(); SC.toast('จำลอง: ส่งใบปะหน้า 4x6 ไปที่เครื่องพิมพ์ร้าน', 'printer'); });
})();

/* ===== 68-products.js ===== */
/* =====================================================================
   68 · Group 4 (cont.): S406 สินค้าในสาขา. Owner 20/10/2026 (round 5): "406 สินค้าในสาขาให้ระบบจัดการทั้งหมดเป็นการเชื่อม
   api เข้ากับ stock จริง รวมถึงเขียนบิลขายกลับลง ss ด้วย". Nobody manages products by hand here: name, price and count
   come from the store system (SS) over its API, and every paid order of the app goes back to SS as a sale bill, which
   takes the medicine off the stock. This screen only shows both. Customers never browse products in this app: the
   pharmacist picks from the branch stock (S303); a medicine at 0 cannot be added.
   Store staff and pharmacists of the branch; superadmin too. Store staff never see controlled medicines (as on the website).
   Mock: the API, the sync clock and the SS bill numbers are made up.
   ===================================================================== */
(() => {
const { $, esc, ic, ui } = SC;
const LOW = 10;
const stOf = i => !i.stock ? 'out' : i.stock <= LOW ? 'low' : 'ok';
const FILTERS = [['all', 'ทั้งหมด'], ['low', 'ใกล้หมด'], ['out', 'หมด'], ['cold', 'ยาเก็บเย็น']];
const isF = (i, f) => f === 'all' || (f === 'cold' ? !!i.cold : stOf(i) === f);
const all = () => SC.CATALOG.filter(i => !(SC.isStaff() && i.type === 'ยาควบคุมพิเศษ'));
const view = () => {
  const S = SC.S, q = String(S.prQ || '').trim().toLowerCase(), f = S.prF || 'all';
  const hay = i => [i.name, i.sku, ...(i.has || [])].join(' ').toLowerCase();
  return all().filter(i => isF(i, f) && (!q || hay(i).includes(q))).sort((a, b) => a.name.localeCompare(b.name, 'th'));
};
const price = i => (SC.UNITS[i.sku] || [[i.unit, '', i.price, 1]]).map(([u, , p]) => `${esc(u)} ${p ? SC.money(p) : '-'}`).join(' · ');
const stock = i => { const s = stOf(i), n = `<b class="num">${i.stock}</b> <span class="small">${esc(i.unit)}</span>`; return s === 'out' ? ui.tag('หมด', 'red', { icon: 'circle-x' }) : s === 'low' ? `${n} ${ui.tag('ใกล้หมด', 'warn', { icon: 'triangle-alert' })}` : n; };
const row = i => `<tr><td><b>${esc(i.name)}</b><span class="sub mono">${esc(i.sku)}</span><span class="mt4 hrow wrap">${ui.cls(i.type)}${i.cold ? ui.tag('ยาเก็บเย็น 2-8 องศา', 'line', { icon: 'snowflake' }) : ''}</span></td>
    <td>${stock(i)}</td><td class="small">${price(i)}</td><td>${i.rx ? '<span class="small">สั่งผ่านแอปไม่ได้ (ต้องมีใบสั่งแพทย์)</span>' : !i.stock ? '<span class="small">เพิ่มในรายการยาไม่ได้จนของเข้า</span>' : ui.tag('ขายในแอป', 'ok', { dot: true })}</td></tr>`;
const stockBody = () => {
  const list = view();
  return list.length ? `<div class="pr-w"><table class="tbl pr-t"><thead><tr><th>ยา</th><th>คงเหลือ</th><th>ราคาขาย</th><th>ในแอป</th></tr></thead><tbody>${list.map(row).join('')}</tbody></table></div>`
    : `<div style="padding:16px">${ui.empty({ icon: 'search', title: 'ไม่พบยาที่ค้น', body: 'ลองค้นด้วยชื่อสามัญหรือรหัสสินค้า หรือเลือก "ทั้งหมด"' })}</div>`;
};

/* ---------- sale bills written back to SS: one per paid order of the app ---------- */
const ssNo = SC.ssNo = (o, b) => `${b.toUpperCase()}${SC.NOW.date.slice(8)}${SC.NOW.date.slice(3, 5)}${SC.NOW.date.slice(0, 2)}${o.paid.at.replace(':', '')}`;
const plus1 = t => { const [h, m] = t.split(':').map(Number), n = h * 60 + m + 1; return `${SC.pad(Math.floor(n / 60))}:${SC.pad(n % 60)}`; };
const bills = () => {
  const S = SC.S, b = S.branch;
  return Object.values(S.orders).filter(o => o.status === 'paid' && o.paid?.at && (o.br || b) === b)
    .map(o => { const f = S.ssFail?.[o.key]; return { o, no: f ? '' : ssNo(o, b), at: f ? '' : plus1(o.paid.at), st: f ? 'retry' : 'sent', n: o.items.reduce((s, i) => s + i.qty, 0), t: SC.orderTotal(o) }; })
    .sort((x, y) => y.o.paid.at.localeCompare(x.o.paid.at));
};
const billBody = () => {
  const L = bills(), bad = L.filter(x => x.st !== 'sent');
  return `${bad.length ? `<div style="padding:12px 16px 0">${ui.note(`<b>ส่งบิลเข้าระบบหน้าร้านไม่สำเร็จ ${bad.length} ใบ · ระบบลองส่งใหม่เองทุก 5 นาที</b><p>สต๊อกในระบบหน้าร้านยังไม่ถูกตัดสำหรับรายการนี้ · ถ้าไม่สำเร็จใน 30 นาที ระบบแจ้งผู้ดูแลระบบ · ร้านไม่ต้องคีย์บิลเอง</p>`, { tone: 'warn', icon: 'triangle-alert' })}</div>` : ''}
    ${L.length ? `<div class="pr-w"><table class="tbl pr-t"><thead><tr><th>ชำระในแอป</th><th>รายการ</th><th>บิลในระบบหน้าร้าน</th><th class="r">ยอด</th></tr></thead><tbody>${L.map(x => `<tr${x.st !== 'sent' ? ' class="pr-off"' : ''}>
      <td class="num">${esc(x.o.paid.at)}<span class="sub">${esc(x.o.who || (SC.CASES[x.o.key] ? SC.casePerson(SC.CASES[x.o.key]).name : ''))}</span></td>
      <td><span class="mono">${esc(x.o.no)}</span><span class="sub">${x.n} ชิ้น</span></td>
      <td>${x.st === 'sent' ? `${ui.tag('ส่งแล้ว', 'ok', { icon: 'check' })}<span class="sub mono">${esc(x.no)} · ${esc(x.at)}</span>` : `${ui.tag('กำลังลองส่งใหม่', 'warn', { icon: 'refresh-cw' })}<span class="sub">ลองครั้งที่ 2 · ครั้งถัดไป ${esc(plus1(SC.clockStr()))}</span>`}</td>
      <td class="r num">${SC.money(x.t)}</td></tr>`).join('')}</tbody></table></div>`
      : `<div style="padding:16px">${ui.empty({ icon: 'receipt', title: 'วันนี้ยังไม่มีรายการชำระในแอป', body: 'เมื่อลูกค้าชำระ ระบบเขียนบิลขายเข้าระบบหน้าร้านให้เองและตัดสต๊อก' })}</div>`}`;
};

SC.screen('products', {
  code: 'S406', group: 4, staff: true, title: 'สินค้าในสาขา', nav: 'products',
  states: [['list', 'สต๊อกจากระบบหน้าร้าน'], ['low', 'ใกล้หมดและหมด'], ['bills', 'บิลขายที่ส่งเข้าระบบหน้าร้าน'], ['billfail', 'ส่งบิลไม่สำเร็จ ระบบลองใหม่'], ['search', 'ค้นไม่เจอ'], ['cold', 'ยาเก็บเย็น']],
  notes: ['เจ้าของ 20/10 (B10): ยาเก็บเย็นมีป้าย "ยาเก็บเย็น 2-8 องศา" ต่อสินค้า มาจากข้อมูลสินค้าหลัก ไม่มีใครติ๊กเองในจอนี้ · รายการที่มียานี้ ลูกค้าเลือกได้แค่รับที่ร้าน หรือส่งเย็น Inter Express',
    'เจ้าของ 20/10: "406 สินค้าในสาขาให้ระบบจัดการทั้งหมดเป็นการเชื่อม api เข้ากับ stock จริง รวมถึงเขียนบิลขายกลับลง ss ด้วย" · จอนี้ดูอย่างเดียว ไม่มีปุ่มพักขายหรือแก้อะไรแล้ว (แทนข้อ 86-87 ที่เคยให้พนักงานร้านพักขาย)',
    'สต๊อก: ชื่อ ราคา และคงเหลือดึงจากระบบหน้าร้าน (SS) ผ่านการเชื่อมต่อ อัปเดตเอง · ของหมด (0) เภสัชกรเพิ่มในรายการยาไม่ได้ · ของบนชั้นไม่ตรงกับระบบ ให้ปรับยอดที่ระบบหน้าร้าน แอปตามเอง',
    'บิลขาย: ลูกค้าชำระในแอปแล้ว ระบบเขียนบิลขายเข้าระบบหน้าร้านให้เองทุกรายการ (ตัดสต๊อก) · ร้านไม่ต้องคีย์บิลซ้ำ · ส่งไม่สำเร็จ ระบบลองใหม่ทุก 5 นาที เกิน 30 นาทีแจ้งผู้ดูแลระบบ',
    'พนักงานร้านไม่เห็นยาควบคุมพิเศษในรายการ (เหมือนเว็บ) · เภสัชกรเห็นทุกตัว',
    'ทำตอนสร้างจริง: เชื่อมต่อสต๊อกและบิลขายกับระบบหน้าร้าน (ต้องได้รูปแบบเชื่อมต่อจากผู้ให้บริการ SS) · เลขบิลในต้นแบบเป็นตัวอย่าง',
    'ใกล้หมด = เหลือไม่เกิน 10 หน่วย (ตัวเลขตัวอย่าง)'],
  wait: [],
  head: () => { const a = all(), n = k => a.filter(i => stOf(i) === k).length; return { title: 'สินค้าในสาขา', sub: `${SC.branch().name} · ${a.length} รายการ · ใกล้หมด ${n('low')} · หมด ${n('out')}` }; },
  prep(S, st) {
    if (!S._reseed) return;
    S.prQ = st === 'search' ? 'ไม่มียานี้' : ''; S.prF = st === 'low' ? 'low' : st === 'cold' ? 'cold' : 'all';
    S.prTab = st === 'bills' || st === 'billfail' ? 'bills' : 'stock'; S.ssFail = st === 'billfail' ? { f3: true } : {};
  },
  render() {
    const S = SC.S, a = all(), n = k => a.filter(i => stOf(i) === k).length, tab = S.prTab === 'bills' ? 'bills' : 'stock', nb = bills(), bad = nb.filter(x => x.st !== 'sent').length;
    const sync = `<span class="small pr-sync">${ic('refresh-cw', 13, 2)} เชื่อมกับระบบหน้าร้านอยู่ · อัปเดตล่าสุด ${esc(SC.clockStr())}</span>`;
    return `<section class="card" aria-label="สินค้าในสาขา"><div class="lm-bar">
        ${ui.seg([['stock', 'สต๊อก', 'package'], ['bills', `บิลขายเข้าระบบหน้าร้าน ${nb.length}${bad ? ` (ค้าง ${bad})` : ''}`, 'receipt']], tab, { a: 'prTab', label: 'ดูสต๊อกหรือบิลขาย' })}
        <span class="sp"></span>${sync}</div>
        ${tab === 'stock' ? `<div class="lm-bar mt12"><input id="prQ" class="input" type="search" placeholder="ค้นชื่อยา ชื่อสามัญ หรือรหัสสินค้า" value="${esc(S.prQ || '')}" aria-label="ค้นสินค้า">
        ${ui.seg(FILTERS.map(([k, t]) => [k, k === 'all' ? t : `${t} ${a.filter(i => isF(i, k)).length}`]), S.prF || 'all', { a: 'prF', label: 'กรองรายการ' })}</div>` : ''}</section>
      <section class="card pad0 mt12" aria-label="${tab === 'stock' ? 'รายการสินค้า' : 'บิลขาย'}" id="prBody">${tab === 'stock' ? stockBody() : billBody()}</section>`;
  },
  mount(el) {
    const S = SC.S, q = $('#prQ', el);
    q?.addEventListener('input', () => { S.prQ = q.value; $('#prBody', el).innerHTML = stockBody(); });
  },
  sims: ({ st }) => [{ label: 'ระบบหน้าร้านอัปเดต: บรอมเฮกซีนเหลือ 3 แผง', run: () => { const i = SC.CATALOG.find(x => x.sku === 'TW-00733'); i.stock = 3; SC.refresh(); SC.toast('อัปเดตคงเหลือจากระบบหน้าร้านแล้ว', 'refresh-cw'); } },
    st === 'billfail' && { label: 'ระบบลองส่งบิลใหม่สำเร็จ', run: () => { SC.S.ssFail = {}; SC.refresh(); SC.toast('ส่งบิลเข้าระบบหน้าร้านแล้ว ตัดสต๊อกแล้ว', 'check'); } }]
});
SC.act('prF', t => { SC.S.prF = t.dataset.v; SC.refresh(); });
SC.act('prTab', t => { SC.S.prTab = t.dataset.v; SC.refresh(); });
})();

/* ===== 70-after.js ===== */
/* =====================================================================
   70 · Group 4 หลังปรึกษา: S401 one inbox for what customers report after the consult (merged 20/10/2026):
        follow-up check-ins (worse = call back within 2 hours in opening
        hours) + reports of reactions after using medicine (was S402) · S403 case history of this branch.
   Data matches the customer app: plan TC-261016-0058 day 3 of 5, "worse" 13:40, "danger" 14:05,
   reply 14:40 (72-follow.js); report AR-261018-0007 อะม็อกซีซิลลิน 500 มก. from TC-261002-0087 (70-after.js).
   Every dialog and every save works on the row the pharmacist picked (ctx.p.k).
   ===================================================================== */
(() => {
const { $, esc, ic, ui } = SC;
const ME = SC.PEOPLE.me;
const FU_REPLY = () => SC.say('ได้รับคำตอบแล้วค่ะ ขอสอบถามอาการเพิ่มอีกนิด จะโทรหาภายใน 15 นาที หรือเริ่มปรึกษาในแอปได้เลยค่ะ');

/* ---------- S401 follow-up ---------- */
const MNP = { name: 'มานพ ร.', first: 'มานพ', rel: 'ตัวเอง', age: 47, phone: '08x-xxx-8821', allergies: [], allergyState: 'none', meds: [] };
const ROWS = {
  smj: { k: 'smj', pk: 'me', name: ME.name, id: 'TC-261016-0058', topic: 'ไข้ ไอ น้ำมูก', day: 'วันที่ 3 จาก 5', when: 'ปรึกษา 16/10/2026 10:20 · ภญ.ขวัญใจ', act: true, phone: ME.phone,
    meds: [['ยาแก้ไอ ชนิดน้ำ', 'ครั้งละ 10 มล. เช้า กลางวัน เย็น · วันที่ 2 ลืมมื้อกลางวัน'], ['ยาแก้แพ้ ลดน้ำมูก', 'ครั้งละ 1 เม็ด ก่อนนอน · ทานครบ'], ['พาราเซตามอล 500 มก.', 'เมื่อมีไข้ · วันนี้ทาน 1 ครั้ง 07:50']],
    hist: [] },
  mnp: { k: 'mnp', pk: 'mnp', name: 'มานพ ร.', id: 'TC-261017-0121', topic: 'ไอ เสมหะ', day: 'วันที่ 1 จาก 5', when: 'ปรึกษา 17/10/2026 15:30 · ภญ.ขวัญใจ', act: true, phone: MNP.phone, last: 'worse', at: '17/10/2026 22:05',
    meds: [['บรอมเฮกซีน 8 มก. (ละลายเสมหะ)', 'ครั้งละ 1 เม็ด วันละ 3 ครั้ง หลังอาหาร'], ['ยาแก้ไอ ชนิดน้ำ', 'ครั้งละ 10 มล. วันละ 3 ครั้ง หลังอาหาร']], hist: [] },
  tnw: { k: 'tnw', name: 'ธนวัฒน์ พ.', id: 'TC-261017-0102', topic: 'ผื่น คัน', day: 'วันที่ 2 จาก 5', last: 'better', at: 'บอกเองว่าดีขึ้น 17/10/2026 19:04' },
  ldw: { k: 'ldw', name: 'ลำดวน ก.', id: 'TC-261015-0077', topic: 'ปวดกล้ามเนื้อ', day: 'วันที่ 4 จาก 5', last: 'missed', at: 'ถามกลางคอร์สแล้วไม่ตอบ' },
  sda: { k: 'sda', name: 'สุดา ม.', id: 'TC-261018-0119', topic: 'ตาแดง แสบตา', day: 'วันที่ 1 จาก 3', last: 'wait', at: 'ถามครั้งเดียวหลังครบคอร์ส 21/10/2026' }
};
const S_ = () => SC.S;
const variant = () => { const S = S_(); return S.fuEmpty ? 'empty' : S.fuNext ? 'after' : S.fuDanger ? 'danger' : S.fuLate ? 'late' : S.fuSoon ? 'soon' : 'worse'; };
/* item 72 (owner 20/10 "ให้กรอบเวลามันเป็นไปได้จริงหน่อยกับเวลาเปิดปิดร้าน"): the 2 hours count only while the store is open.
   Reported less than 2 hours before closing: what is left carries over to the next opening. Reported while closed: 2 hours
   from opening. The system tells superadmin when 30 opening minutes are left */
SC.openDue = (at, mins = 120, hours = SC.branch().hours) => {
  const [o, c] = hours.split('-').map(SC.toMin); let t = SC.toMin(at), next = false;
  if (t >= c) { t = o; next = true; } else if (t < o) t = o;
  const today = c - t;
  return mins <= today ? { t: SC.hhmm(t + mins), next, today } : { t: SC.hhmm(o + mins - today), next: true, today };
};
const dueTxt = r => { const d = SC.openDue(r.at); return `ภายใน ${d.t}${d.next ? ' พรุ่งนี้' : ''}`; };
const adminAt = r => SC.hhmm(SC.toMin(SC.openDue(r.at).t) - 30);
const lateTxt = r => { const d = SC.openDue(r.at), [op, cl] = SC.branch().hours.split('-');
  return `ลูกค้าแจ้งว่าแย่ลง ${r.at} ร้านปิด ${cl} · วันนี้เหลือ ${d.today} นาที ที่เหลือนับต่อเมื่อร้านเปิด ${op} · โทรได้ก่อนปิดร้านยิ่งดี · แอปบอกลูกค้าแล้วว่าร้านจะติดต่อกลับ${dueTxt(r)} และถ้าอาการรุนแรงให้ไปโรงพยาบาลหรือโทร 1669 ทันที`; };
/* a customer who paid after the case was closed starts follow-up like any paid case */
const lateRows = () => (SC.lateFollow?.() || []).map(x => ({ k: 'late-' + x.key, name: x.who, id: x.id, topic: x.topic, day: 'วันที่ 1 จาก 5', last: 'wait', at: 'ถามตามที่เลือกตอนปิดเคส', note: `เริ่มติดตามเมื่อชำระ ${x.paidAt} (ชำระหลังปิดเคส)` }));
const rowsNow = () => { const S = S_(); return [...lateRows(), ...(S.fuNext ? ['mnp', 'tnw', 'ldw', 'sda'] : ['smj', 'tnw', 'ldw', 'sda']).map(k => ROWS[k])].filter(r => !S.fuEmpty || !r.act); };
const liveOf = r => {
  const S = S_(), f = S.fu[r.k];
  const base = r.k === 'smj' ? { last: S.fuDanger ? 'danger' : 'worse', at: S.fuDanger ? '14:05' : S.fuLate ? '20:15' : '13:40', note: '' } : { last: r.last, at: r.at, note: r.note };
  const early = r.k === 'smj' && SC.clk() < SC.toMin(base.at);
  return { ...r, ...base, f, pending: !!r.act && f?.st !== 'called' && !early };
};
SC.followLeft = () => S_().branch === 'tw' ? rowsNow().map(liveOf).filter(r => r.pending).length : 0;
/* the follow-up that needs a call now (shown on the queue board and in that person's patient card) */
SC.followDue = () => {
  const S = S_(); if (S.fuEmpty || S.branch !== 'tw') return null;
  if (S.fuNext) { const m = liveOf(ROWS.mnp); return m.pending ? { k: 'mnp', pk: 'mnp', name: m.name, what: 'แย่ลง', at: 'เมื่อคืน 22:05', due: m.f?.st === 'retry' ? 'โทรอีกครั้ง' : 'ภายใน 11:00 วันนี้', st: 'after' } : null; }
  const r = liveOf(ROWS.smj); if (!r.pending) return null;
  return { k: 'smj', pk: 'me', name: r.name, what: r.last === 'danger' ? 'มีอาการรุนแรง' : 'แย่ลง', at: r.at, due: r.last === 'danger' ? 'โทรตามทันที' : dueTxt(r), st: variant() };
};
const lastTag = r => r.f?.st === 'called' ? ui.tag(`ติดต่อแล้ว ${r.f.at}`, 'ok', { icon: 'phone-call' }) : r.f?.st === 'retry' ? ui.tag(`โทรไม่ติด ${r.f.at}`, 'warn', { icon: 'phone-off' })
  : r.last === 'danger' ? ui.tag('อาการรุนแรง', 'red', { icon: 'octagon-alert' }) : r.last === 'worse' ? ui.tag('แย่ลง', 'danger', { icon: 'frown' })
  : r.last === 'better' ? ui.tag('ดีขึ้น', 'ok', { icon: 'smile' }) : r.last === 'missed' ? ui.tag('ไม่ตอบ', 'muted', { icon: 'clock' }) : ui.tag('ยังไม่ถึงเวลาถาม', 'line', { icon: 'calendar-check' });
const leftTxt = s => s >= 3600 ? `เหลือ ${Math.floor(s / 3600)} ชม. ${Math.floor(s % 3600 / 60)} นาที` : `เหลือ ${Math.max(0, Math.floor(s / 60))} นาที`;
const leftS = () => S_().fuNext ? 118 * 60 : S_().fuSoon ? 18 * 60 : S_().fuLate ? 115 * 60 : 85 * 60;
function dueCell(r) {
  if (!r.act) return '<span class="small">ไม่ต้องติดต่อ</span>';
  if (r.f?.st === 'called') return `<span class="small">ติดต่อแล้ว ${esc(r.f.at)}</span>`;
  if (r.f?.st === 'retry') return `<b class="warn-t">โทรอีกครั้ง ภายใน ${esc(SC.hhmm(SC.toMin(r.f.at) + 30))}</b><span class="sub">ส่งข้อความในแอปให้แล้ว</span>`;
  if (r.last === 'danger') return `<b class="danger-t">โทรตามทันที</b><span class="sub">แอปบอกให้ไปโรงพยาบาลหรือโทร 1669 แล้ว</span>`;
  const S = S_(), red = S.fuSoon, due = S.fuNext ? 'ภายใน 11:00 วันนี้' : dueTxt(r), cl = SC.branch().hours.split('-')[1];
  return `<b class="${red ? 'danger-t' : 'warn-t'}">${due}</b><span class="sub${red ? ' danger-t' : ''}" data-left="${leftS()}">${leftTxt(leftS())}</span><span class="sub">${S.fuNext ? 'แจ้งตอนร้านปิด นับ 2 ชั่วโมงจากร้านเปิด 09:00' : S.fuLate ? `แจ้ง ${esc(r.at)} · ร้านปิด ${cl} ที่เหลือนับต่อตอนร้านเปิด` : `แจ้ง ${esc(r.at)} · 2 ชั่วโมงในเวลาทำการ`}${red ? ' · แจ้งผู้ดูแลระบบแล้ว' : ''}</span>`;
}
function fuDetail(r) {
  if (!r) return ui.empty({ icon: 'heart-pulse', title: 'ไม่มีลูกค้าที่ต้องติดต่อกลับตอนนี้', body: 'เมื่อลูกค้าแจ้งว่าอาการแย่ลงหรือมีอาการรุนแรง จะขึ้นที่นี่พร้อมเวลาที่ต้องติดต่อกลับ และมีเสียงเตือน' });
  const S = S_(), me = SC.me(), danger = r.last === 'danger', called = r.f?.st === 'called', sumOk = !!SUM[r.id];
  if (!r.act) return `<div class="fu-d"><div class="hrow"><h3 class="h3">${esc(r.name)}</h3><span class="sp"></span>${lastTag(r)}</div>
    <p class="small mt4"><span class="mono">${esc(SC.caseCode(r))}</span> · ${esc(r.topic)} · ${esc(r.day)}</p>
    <div class="mt12">${ui.note(`<b>ไม่ต้องติดต่อตอนนี้</b><p>${esc(r.at)}${r.note ? ` · ${esc(r.note)}` : ''}</p>`)}</div>
    ${r.last === 'missed' ? `<div class="btn-row mt16">${ui.btn('ส่งข้อความถามอาการในแอป', { kind: 'secondary', icon: 'message-circle', a: 'fuMsg', v: r.k })}</div>` : ''}</div>`;
  const p = r.k === 'smj' ? SC.withAlg('me', ME) : MNP;
  const timeline = [...(r.hist || []),
    ['bad', `${r.day.split(' จาก')[0]} · ${danger ? 'มีอาการรุนแรง' : r.k === 'smj' ? 'กลางคอร์ส ตอบว่าแย่ลง' : 'บอกเองว่าแย่ลง'}`, r.k === 'mnp' ? r.at : SC.NOW.date + ' ' + r.at],
    ...(S.fuMsg?.[r.k] ? [['done', `${me.short} ส่งข้อความในแอป`, `${typeof S.fuMsg[r.k] === 'string' ? S.fuMsg[r.k] : S.fuNext ? '09:03' : '14:40'} · "${FU_REPLY()}"`]] : []),
    ...(r.f ? [[r.f.st === 'called' ? 'done' : 'bad', `${me.short} ${r.f.st === 'called' ? 'โทรติดต่อได้' : r.f.res === 'bad' ? 'ติดต่อไม่ได้ เบอร์ใช้ไม่ได้' : 'โทรแล้วไม่รับสาย'}`, `${r.f.at}${r.f.note ? ' · ' + r.f.note : ''}${r.f.adv?.length ? ` · แนะนำ: ${r.f.adv.join(', ')}${r.f.refU ? ` (${uTxt(r.f.refU)})` : ''}` : ''}`]] : [])];
  return `<div class="fu-d">
    <div class="hrow"><h3 class="h3">${esc(r.name)}</h3><span class="sp"></span>${lastTag(r)}</div>
    <p class="small mt4"><span class="mono">${esc(SC.caseCode(r))}</span> · ${esc(r.topic)} · ${esc(r.when)} · ${esc(r.day)}</p>
    ${called ? '' : danger ? `<div class="fu-ban red mt12" role="alert">${ic('octagon-alert', 20, 2)}<div class="grow"><b>ลูกค้าเลือก "มีอาการรุนแรง" 14:05</b><span>แอปบอกลูกค้าให้ไปโรงพยาบาลทันทีหรือโทร 1669 แล้ว ไม่ต้องรอเภสัชกร · โทรตามเพื่อยืนยันว่าลูกค้าได้รับความช่วยเหลือ</span></div></div>`
      : `<div class="fu-ban${S.fuSoon ? ' red' : ''} mt12" role="status">${ic('timer', 20, 2)}<div class="grow"><b>ต้องติดต่อกลับ${S.fuNext ? 'ภายใน 11:00 วันนี้' : dueTxt(r)}${r.f?.st === 'retry' ? ' · โทรครั้งแรกไม่ติด' : ''}</b><span>${S.fuNext ? 'ลูกค้าแจ้งตอนร้านปิด 17/10/2026 22:05 · แอปบอกลูกค้าแล้วว่าเภสัชกรจะเห็นเมื่อร้านเปิด 09:00 และถ้าอาการรุนแรงให้ไปโรงพยาบาลหรือโทร 1669' : S.fuLate ? esc(lateTxt(r)) : `ลูกค้าแจ้งว่าแย่ลง ${esc(r.at)} · แอปบอกลูกค้าว่าร้านจะติดต่อกลับ${dueTxt(r)} (2 ชั่วโมงในเวลาทำการ ${SC.branch().hours})${S.fuSoon ? ` · เหลือ 30 นาทีเมื่อ ${adminAt(r)} ระบบแจ้งผู้ดูแลระบบแล้ว` : ''}`}</span></div></div>`}
    <p class="label mt16">คำตอบของลูกค้าและการติดต่อ</p>
    <ol class="tl mt8">${timeline.map(([s, b, d]) => `<li class="${s}"><b>${esc(b)}</b><span>${esc(d)}</span></li>`).join('')}</ol>
    ${r.f?.adv?.includes(FR_DOC) ? `<div class="fu-went mt12"><p class="label">ลูกค้าไปพบแพทย์แล้วหรือยัง</p><div class="mt4">${ui.seg([['', 'ยังไม่ทราบ'], ['yes', 'ไปแล้ว'], ['no', 'ยังไม่ไป']], r.f.went || '', { a: 'fuWent', label: 'ลูกค้าไปพบแพทย์แล้วหรือยัง' })}</div>${r.f.wentAt ? `<p class="small mt4">บันทึก ${esc(r.f.wentAt)} โดย ${esc(r.f.wentBy)}</p>` : '<p class="small mt4">ถามตอนโทรครั้งถัดไป หรือเมื่อลูกค้าตอบติดตามอาการ</p>'}</div>` : ''}
    <p class="label mt16">ยาที่ทานอยู่ (จากเคสเดิม)</p>
    <ul class="fu-meds mt8">${r.meds.map(([n, h]) => `<li><b>${esc(n)}</b><span>${esc(h)}</span></li>`).join('')}</ul>
    <div class="hrow wrap mt8"><span class="small">แพ้ยา:</span>${ui.allergy(p)}<span class="small">· ยาประจำ: ${esc((p.meds || []).join(', ') || 'ไม่มี')}</span></div>
    <div class="btn-row fu-act mt16">${sumOk ? ui.btn('ดูใบสรุปเคสเดิม', { kind: 'secondary', icon: 'file-text', go: 'log', st: 'detail', p: { id: r.id } }) : ''}
      ${called ? '' : `${ui.btn(r.f?.st === 'retry' ? 'ดูเบอร์ โทรอีกครั้ง' : 'ดูเบอร์ลูกค้า', { kind: danger ? 'danger' : 'primary', icon: 'phone', a: 'fuDial', v: r.k })}${ui.btn('ส่งข้อความในแอป', { kind: 'secondary', icon: 'message-circle', a: 'fuMsg', v: r.k, disabled: !!S.fuMsg?.[r.k] })}${ui.btn('บันทึกผลการติดต่อ', { kind: 'ghost', icon: 'pencil', st: 'record', p: { k: r.k } })}`}</div>
    ${called ? '' : `<p class="small mt8">${ic('lock', 12, 2)} เบอร์ ${esc(r.phone)} · เบอร์เต็มแสดงเมื่อกด "ดูเบอร์ลูกค้า" · การเปิดดูเบอร์ถูกบันทึก</p>`}
  </div>`;
}
/* ---------- S401 merged inbox (owner 20/10/2026: "S401 402 น่าจะรวมเป็นก้อนเดียว"):
   everything a customer reported after the consult, in one list: "แย่ลง" / "มีอาการรุนแรง" from follow-up
   and reports of a reaction after using medicine. Urgent first, then what is due, then what needs nothing */
const fuSt = () => { const v = variant(); return v === 'worse' && S_().fu.smj?.st === 'called' ? 'called' : v; };
const adrSt = () => { const S = S_(); return S.adr.st === 'done' ? 'adrdone' : S.adr.who === 'kid' ? 'adrsevere' : 'adr'; };
const fuItem = r => ({ kind: 'fu', k: r.k, r, pk: r.pk || r.k, name: r.name, id: r.id, what: r.topic, sub: r.day, urg: r.last === 'danger' && r.pending, tag: lastTag(r), at: r.at, due: dueCell(r), pending: r.pending, rank: !r.pending ? 2 : r.last === 'danger' ? 0 : 1, grp: r.pending ? 'todo' : r.f?.st === 'called' ? 'done' : 'watch' });
function adrItem(key) {
  const S = S_();
  if (key === 'adr-psr') return { kind: 'adr', k: key, pk: 'psr', name: PSR_ADR.name, id: PSR_ADR.id, what: PSR_ADR.drug, sub: PSR_ADR.sym.join(', '), tag: ui.tag('ตอบแล้ว', 'ok', { icon: 'check' }), at: PSR_ADR.at.split(' ')[0], due: '<span class="small">ไม่ต้องทำอะไร</span>', pending: false, rank: 3, grp: 'done' };
  const r = repNow(), p = repPerson(r), done = S.adr.st === 'done', cl = calls();
  return { kind: 'adr', k: key, pk: r.pk, grp: done ? 'done' : 'todo', name: p.name, id: r.id, what: r.drug, sub: r.sym.join(', '), urg: r.severe && !done,
    tag: done ? ui.tag(`ตอบแล้ว ${S.adr.at}`, 'ok', { icon: 'check' }) : r.severe ? ui.tag('อาการรุนแรง', 'red', { icon: 'octagon-alert' }) : ui.tag('รอตอบ', 'warn', { icon: 'clock' }),
    at: `แจ้ง ${r.at}${!done && cl.length ? ` · โทรแล้ว ${cl[cl.length - 1].at}` : ''}`,
    due: done ? '<span class="small">ไม่ต้องทำอะไร</span>' : r.severe ? `<b class="danger-t">${cl.length ? 'ส่งคำตอบในแอป' : 'โทรตามทันที'}</b><span class="sub">${cl.length ? 'โทรแล้ว ' + esc(cl[cl.length - 1].at) : 'แอปบอกให้ไปโรงพยาบาลแล้ว'}</span>` : `<b class="warn-t">ตอบ${esc(r.want)}</b><span class="sub">ต้องตอบทุกเรื่อง</span>`,
    pending: !done, rank: done ? 3 : r.severe ? 0 : 1 };
}
const inbox = () => { const S = S_(), mine = S.branch === 'tw'; return [...(mine ? rowsNow() : lateRows()).map(liveOf).map(fuItem), ...(mine ? [...(S.adrEmpty ? [] : ['adr-cur']), 'adr-psr'] : []).map(adrItem)].sort((a, b) => a.rank - b.rank); };
const selOf = ctx => { const rows = inbox(), k = ctx.p.k; return rows.find(x => x.k === k) || (String(ctx.st).startsWith('adr') ? rows.find(x => x.k === 'adr-cur') : null) || rows.find(x => x.pending) || (S_().fuEmpty ? null : rows[0]); };
const rowSel = ctx => { const x = selOf(ctx); return x && x.kind === 'fu' ? x.r : null; };
const KIND = { fu: ['ติดตามอาการ', 'heart-pulse'], adr: ['อาการหลังใช้ยา', 'pill'] };
/* two matters about the same person sit next to each other: one call covers both (UX review 2.4) */
const adj = list => { const out = []; list.forEach(x => { if (!out.includes(x)) out.push(x, ...list.filter(y => y !== x && y.pk === x.pk && !out.includes(y))); }); return out; };
/* the side bar number turns red only when something inside is urgent or close to its deadline (UX-20) */
SC.followHot = () => S_().branch === 'tw' && inbox().some(x => x.pending && (x.urg || (x.kind === 'fu' && S_().fuSoon)));
SC.act('fuGrp', t => { const S = S_(); S.fuOpen = { ...(S.fuOpen || {}), [t.dataset.v]: t.getAttribute('aria-expanded') !== 'true' }; SC.refresh(); });
SC.screen('follow', {
  code: 'S401', group: 4, title: 'ติดตามหลังปรึกษา', nav: 'follow',
  states: [['worse', 'ลูกค้าแจ้งว่าแย่ลง', { cust: [['furesult', 'worse', 'ลูกค้าเห็นว่าร้านจะติดต่อกลับภายใน 2 ชั่วโมง'], ['follow', 'worse']] }],
    ['soon', 'ใกล้ครบ 2 ชั่วโมง', { cust: [['follow', 'worse']] }],
    ['danger', 'มีอาการรุนแรง', { cust: [['furesult', 'danger', 'แอปบอกให้ไปโรงพยาบาลหรือโทร 1669 และร้านจะโทรหาโดยเร็วที่สุด'], ['fucheck', 'normal']] }],
    ['record', 'บันทึกผลการติดต่อ', { back: () => variant(), cust: [['follow', 'worse']] }],
    ['called', 'ติดต่อแล้ว', { cust: [['follow', 'worse', 'ลูกค้าเห็นข้อความตอบของเภสัชกร']] }],
    ['after', 'แจ้งตอนร้านปิด', { cust: [['furesult', 'closed', 'แจ้งนอกเวลา ร้านเห็นเมื่อเปิด 09:00']] }],
    ['empty', 'ไม่มีเรื่องต้องติดต่อ', { cust: [['follow', 'normal']] }],
    ['adr', 'อาการหลังใช้ยา: รายงานใหม่', { cust: [['adrsent', 'sent', 'ลูกค้ารอให้ร้านติดต่อ']] }],
    ['adrsevere', 'อาการหลังใช้ยา: รุนแรง (ลูก)', { cust: [['adrsent', 'severe', 'แอปบอกให้ไปโรงพยาบาลหรือโทร 1669 · ร้านจะโทรหาโดยเร็วที่สุด'], ['adr', 'severe']] }],
    ['adrreply', 'อาการหลังใช้ยา: เขียนคำตอบ', { cust: [['adrsent', 'sent']] }],
    ['adrdone', 'อาการหลังใช้ยา: ตอบแล้ว', { cust: [['adrsent', 'replied', 'คำตอบของเภสัชกรที่ลูกค้าเห็น'], ['health', 'normal']] }],
    ['late', 'แจ้งก่อนร้านปิดไม่ถึง 2 ชม.', { cust: [['furesult', 'late', 'ลูกค้าเห็นว่าร้านจะติดต่อกลับภายใน 10:15 พรุ่งนี้ และถ้าอาการรุนแรงให้ไปโรงพยาบาลหรือโทร 1669 (C407.8)'], ['follow', 'worse']] }],
    ['adrassess', 'อาการหลังใช้ยา: ประเมินแล้ว', { cust: [['adrsent', 'sent', 'ลูกค้าไม่เห็นการประเมิน เห็นแค่คำตอบ'], ['adrsent', 'sfx', 'ผลข้างเคียง: ลูกค้าเห็นว่าไม่ใช่การแพ้ (C413.5)']] }]],
  notes: ['เจ้าของ 21/10: "ยังไม่ทำระบบนี้ เอาไว้เฟสถัดไป เพราะต้องทำ data ข้อมูลยาเยอะมาก" · บันทึกแพ้ยาหรือผลข้างเคียงจากรายงานยังทำเหมือนเดิม · ระบบไม่ห้ามจ่ายยาที่บันทึกไว้ ประวัติขึ้นให้เภสัชกรดูตอนสั่งยา (S303) · คำตอบตัวอย่างเปลี่ยนเป็น "บันทึกในประวัติแพ้ยาแล้ว เภสัชกรทุกสาขาเห็นก่อนจ่ายยา"',
    'เจ้าของ 20/10 ข้อ 73: "เกณฑ์ อย. ไม่บังคับให้รายงาน ไม่บังคับไม่ทำ ข้าม บันทึกไว้ในระบบเราพอ" · ไม่มีกล่องรายงาน อย. · รายงานและคำตอบเก็บในระบบเรา (ประวัติแพ้ยา ผลข้างเคียง ประวัติเคส)',
    'เจ้าของ 20/10 ข้อ 74: "เรื่องแยกแพ้ยากับผลข้างเคียง ใบสมัครไม่ได้ถาม ให้ user บันทึกให้ง่ายที่สุดพอ" · เภสัชกรแตะครั้งเดียว: แพ้ยา (ติ๊กบันทึกประวัติแพ้ยาให้) · ผลข้างเคียง (ติ๊กบันทึกเป็นคำเตือนให้ ไม่ห้ามจ่าย) · ยังไม่แน่ใจ (ไม่บันทึก) · เอาติ๊กออกได้ · Naranjo พับไว้ ไม่บังคับ ไม่มีผลกับการติ๊ก',
    'เจ้าของ 20/10 (B6): ปุ่ม "แนะนำให้ไปพบแพทย์" ตอนบันทึกผลการติดต่อ บันทึกได้จริง พร้อมความเร่ง (ไปทันที ภายใน 24 ชม. ตามนัดปกติ) · แล้วถาม "ลูกค้าไปพบแพทย์แล้วหรือยัง" ต่อในเคส',
    'เจ้าของ 20/10 ข้อ 72: "ให้กรอบเวลามันเป็นไปได้จริงหน่อยกับเวลาเปิดปิดร้าน" · 2 ชั่วโมงนับเฉพาะเวลาร้านเปิด: แจ้ง 13:40 ครบ 15:40 · แจ้ง 20:15 (ร้านปิด 21:00) วันนี้นับ 45 นาที ที่เหลือนับต่อพรุ่งนี้ ครบ 10:15 · แจ้งตอนร้านปิด ครบ 11:00 · เหลือ 30 นาทีในเวลาร้านเปิด ระบบแจ้งผู้ดูแลระบบ · แอปบอกลูกค้าเวลาที่คำนวณได้จริง และถ้ารุนแรงให้ไปโรงพยาบาลหรือโทร 1669', 'เจ้าของ 20/10 ข้อ 74: "แพ้ยากับผลข้างเคียงมันไม่เหมือนกันนะ ไปเช็ก naranjo score มาสิ แล้วจะทำยังไงให้ UX and lean" · เภสัชกรเลือกว่าเป็น แพ้ยา / ผลข้างเคียง / ยังไม่แน่ใจ (ไม่มีค่าที่เลือกไว้ให้) · คะแนน Naranjo 10 ข้อ ระบบเติมข้อที่รู้จากเคสให้ ข้อ 6-7 ร้านยาทำไม่ได้นับ 0 ที่เหลือแตะครั้งเดียวต่อข้อ ไม่ทราบ = 0 · 9+ ใช่แน่นอน 5-8 น่าจะใช่ 1-4 อาจจะใช่ 0- ไม่น่าใช่ · แพ้ยา: ติ๊กบันทึกไว้ให้เมื่อ 5 คะแนนขึ้นไป หรืออาการรุนแรง ระบบไม่ให้จ่ายยานั้นอีก · ผลข้างเคียง: บันทึกแยก ทุกสาขาเห็นเป็นคำเตือน ไม่ห้ามจ่าย · ยังไม่แน่ใจ: ไม่บันทึก ประเมินใหม่ตอนติดตามอาการ', 'เจ้าของ 20/10: "เอาปุ่มโทรออกดีกว่า ใช้งาน pc โทรออกไม่ได้ แต่ให้เด้งเป็นเบอร์โทรขึ้นแทน" (S201) · "s203 แก้เรื่องปุ่มโทรเช่นกัน" · ทุกปุ่มโทรในคอนโซลเปลี่ยนเป็น "ดูเบอร์" เด้งเบอร์เต็มให้โทรจากโทรศัพท์ร้าน มีปุ่มคัดลอกเบอร์ · บอร์ดและการ์ดยังซ่อนเบอร์ · ทุกการเปิดดูเบอร์ถูกบันทึก (ชื่อ เวลา)', 'เคาะแล้ว 20/10: คำถามนอกเวลายังแยกเมนูของตัวเอง ไม่รวมเข้ากล่องนี้ (ข้อ 55)', 'เจ้าของสั่ง 20/10: รวม S401 ติดตามอาการ กับ S402 อาการหลังใช้ยา เป็นจอเดียว (รหัส S402 เดิมยุบเข้ามาเป็น S401.8 ถึง S401.11)', 'รีวิว UX 20/10: รายการโชว์เฉพาะเรื่องที่ต้องทำ · เรื่องที่ติดต่อหรือตอบแล้ว และลูกค้าที่ติดตามอยู่เฉย ๆ พับไว้ท้ายตาราง · คนเดียวมี 2 เรื่องอยู่ติดกัน บอกว่าโทรครั้งเดียวคุยได้ครบ · ปุ่มส่งคำตอบติดล่างจอ · เลขบนเมนูแดงเฉพาะเมื่อมีเรื่องรุนแรงหรือใกล้ครบเวลา', 'รายการเดียว เรื่องด่วนขึ้นก่อน (มีอาการรุนแรง อาการหลังใช้ยารุนแรง) ตามด้วยเรื่องที่ต้องติดต่อตามเวลา แล้วจึงเรื่องที่ไม่ต้องทำอะไร · ป้ายบอกประเภททุกแถว ไม่ใช้สีอย่างเดียว', 'เมนูซ้ายเหลือ "ติดตามหลังปรึกษา" ช่องเดียว ตัวเลขนับทั้งสองประเภทที่ยังต้องทำ', 'ติดตามอาการ: แอปเตือนกินยาทุกมื้อ ถามอาการหลังครบคอร์ส หรือกลางคอร์สด้วย ตามที่เภสัชกรเลือกตอนปิดเคส (S305) · ลูกค้าตอบแตะเดียว ไม่มีข้อความให้อ่าน', 'เจ้าของเคาะ: ลูกค้าตอบว่า "แย่ลง" = ร้านติดต่อกลับภายใน 2 ชั่วโมง ในเวลาทำการ 09:00-21:00 · แจ้งตอนร้านปิด นับจาก 09:00 ครบ 11:00 (ข้อ 39)', 'อาการรุนแรง: แอปบอกลูกค้าให้ไปโรงพยาบาลหรือโทร 1669 ก่อน คอนโซลขึ้นแดงให้โทรตามทันที', 'เจ้าของเคาะ: รายงานอาการหลังใช้ยาต้องมีคำตอบจากเภสัชกรทุกเรื่อง · รุนแรง: ส่งคำตอบได้หลังบันทึกผลการโทร', 'บันทึกแพ้ยาเป็นชื่อตัวยา ไม่ใช่ชื่อสินค้า · หลังบันทึก จอสร้างรายการยาไม่ให้จ่ายยานี้กับคนนี้อีก', 'บันทึกผล: ไม่มีตัวเลือกที่เลือกไว้ให้ · ไม่รับสายหรือเบอร์ใช้ไม่ได้ = ยังอยู่ในรายการ พร้อมเวลาโทรอีกครั้ง', 'เบอร์ลูกค้าปิดไว้ แสดงเต็มตอนกดโทรเท่านั้น'],
  wait: ['ข้อ 74 "ให้ user บันทึกให้ง่ายที่สุดพอ": ตีความว่า user = เภสัชกรในคอนโซล · เลือก 1 ใน 3 (แพ้ยา ผลข้างเคียง ยังไม่แน่ใจ) แล้วระบบติ๊กบันทึกให้ · แบบประเมิน Naranjo พับไว้ ไม่บังคับ · ใช่ไหม'],
  head: () => ({ title: 'ติดตามหลังปรึกษา', sub: `${SC.branch().name} · ลูกค้าแจ้งว่าแย่ลง มีอาการรุนแรง หรือมีอาการหลังใช้ยา` }),
  now: ctx => ({ date: SC.NOW.date, time: ctx.st === 'record' ? (S_().fuNext ? '09:10' : '14:52') : { soon: '15:22', danger: '14:06', called: '14:53', after: '09:02', adrdone: '14:40', late: '20:20' }[ctx.st] || '14:15' }),
  prep(S, st, p) {
    if (S._reseed) {
      S.fuNext = st === 'after'; S.fuDanger = st === 'danger'; S.fuSoon = st === 'soon'; S.fuEmpty = st === 'empty'; S.fuLate = st === 'late';
      if (st === 'called') { S.fu.smj = { st: 'called', res: 'ok', at: '14:52', note: 'แนะนำให้ไปพบแพทย์ถ้าไอจนนอนไม่หลับอีกคืน ปรับเวลาทานยาแก้แพ้เป็นก่อนนอน 30 นาที', adv: ['แนะนำให้ไปพบแพทย์', 'ปรับวิธีทานยา'], refU: '24h' }; S.fuMsg = { smj: '14:40' }; }
      /* the morning scene (09:02) comes before today's 14:12 report, so that report is not there yet */
      S.adrEmpty = st === 'empty' || st === 'after';
      S.adr = { who: st === 'adrsevere' ? 'kid' : 'me', st: st === 'adrdone' ? 'done' : 'new', calls: [] };
      if (st === 'adrdone') { const r = SC.ADR.me; Object.assign(S.adr, { type: 'alg', nj: { 3: 'y', 5: 'n' }, rec: true, recSet: true, ing: r.ing, at: '14:40' }); S.adr.score = njScore(njAns(r)); S.adr.reply = ADR_SAMPLE(r, r.ing, 'alg', true); recAlg(r.pk, r.ing, S.adr.score); }
      if (st === 'adrassess') Object.assign(S.adr, { type: 'alg', nj: { 3: 'u', 5: 'n' } });
    } else if (st === 'worse') { const v = fuSt(); if (v !== 'worse') return v; }
    else if (['adr', 'adrsevere'].includes(st)) { const v = adrSt(); if (v !== st) return v; }
    if (!p.k) p.k = st.startsWith('adr') ? 'adr-cur' : (selOf({ p, st }) || {}).k || '';
  },
  render(ctx) {
    const S = S_(), rows = inbox(), sel = selOf(ctx);
    const todo = adj(rows.filter(x => x.grp === 'todo')), done = rows.filter(x => x.grp === 'done'), watch = rows.filter(x => x.grp === 'watch');
    const open = { done: !!S.fuOpen?.done || sel?.grp === 'done', watch: !!S.fuOpen?.watch || sel?.grp === 'watch' };
    const twins = x => todo.filter(y => y.pk === x.pk).length;
    const stFor = x => x.kind === 'fu' ? fuSt() : adrSt();
    const tr = x => {
      const on = sel && x.k === sel.k, go = `data-go="follow" data-st="${stFor(x)}" data-p='{"k":"${x.k}"}'`, two = x.grp === 'todo' && twins(x) > 1;
      return `<tr class="click${on ? ' sel' : ''}${x.urg ? ' urg' : ''}${x.pending ? '' : ' quiet'}${two ? ' twin' : ''}" ${go}${on ? ' aria-selected="true"' : ''}>
        <td><span class="kind ${x.kind}">${ic(KIND[x.kind][1], 13, 2.2)}${KIND[x.kind][0]}</span><button type="button" class="link-row" ${go}>${esc(x.name)}</button>${two ? `<span class="sub">${ic('users', 12, 2)} คนเดียวกัน ${twins(x)} เรื่อง โทรครั้งเดียวคุยได้ครบ</span>` : ''}</td>
        <td>${esc(x.what)}<span class="sub">${esc(x.sub)}</span></td><td>${x.tag}<span class="sub">${esc(x.at)}</span></td><td>${x.due}</td></tr>`;
    };
    const grp = (k, label, list) => list.length ? `<tr class="fu-grp"><td colspan="4"><button type="button" class="fu-grp-b" data-a="fuGrp" data-v="${k}" aria-expanded="${open[k]}">${ic('chevron-down', 15, 2, 'ic chev')}<span>${label} (${list.length})</span></button></td></tr>${open[k] ? list.map(tr).join('') : ''}` : '';
    const twin = sel?.grp === 'todo' ? todo.find(x => x.k !== sel.k && x.pk === sel.pk) : null;
    const twinNote = twin ? `<div class="fu-twin" role="status">${ic('users', 16, 2)}<p class="grow"><b>${esc(sel.name)} มีอีก 1 เรื่อง:</b> ${KIND[twin.kind][0]} · ${esc(twin.what)}</p><button type="button" class="link" data-go="follow" data-st="${stFor(twin)}" data-p='{"k":"${twin.k}"}'>ดูเรื่องนั้น</button></div>` : '';
    const detail = !sel ? `<section class="card">${fuDetail(null)}</section>` : sel.kind === 'adr' ? adrDetail({ ...ctx, p: { ...ctx.p, k: sel.k } }) : `<section class="card" aria-label="รายละเอียด">${fuDetail(sel.r)}</section>`;
    return `<div class="fu-g">
      <section class="card pad0" aria-label="รายการติดตามหลังปรึกษา">
        <div class="card-h qb-h"><h3>ต้องติดต่อ (${todo.length})</h3><span class="sp"></span><span class="small">เรื่องด่วนขึ้นก่อน</span></div>
        <table class="tbl fu-t"><thead><tr><th>ลูกค้า</th><th>เรื่อง</th><th>ล่าสุด</th><th>ต้องทำ</th></tr></thead><tbody>${todo.length ? todo.map(tr).join('') : `<tr><td colspan="4" class="fu-none">${ic('circle-check', 16, 2)}ไม่มีเรื่องต้องติดต่อตอนนี้</td></tr>`}${grp('done', 'ติดต่อหรือตอบแล้ว', done)}${grp('watch', 'กำลังติดตามการใช้ยา ไม่ต้องติดต่อตอนนี้', watch)}</tbody></table></section>
      <div class="gap12">${twinNote}${detail}</div></div>`;
  },
  overlay(ctx) {
    if (ctx.st !== 'record') return '';
    const r = rowSel(ctx); if (!r) return '';
    return ui.modal({ title: 'บันทึกผลการติดต่อ', sub: `${r.name} · ${r.id} · แจ้งว่า${r.last === 'danger' ? 'มีอาการรุนแรง' : 'แย่ลง'} ${r.at}`, icon: 'phone-call', back: variant(),
      body: `<p class="label">ผลการติดต่อ</p><div class="opts mt8" data-radio-scope id="frOpts">${ui.opt({ group: 'fr', v: 'ok', title: 'ติดต่อได้ คุยกับลูกค้าแล้ว' })}${ui.opt({ group: 'fr', v: 'noans', title: 'ไม่รับสาย', sub: 'ระบบส่งข้อความในแอปให้ และเตือนให้โทรอีกครั้งใน 30 นาที' })}${ui.opt({ group: 'fr', v: 'bad', title: 'ติดต่อไม่ได้ เบอร์ใช้ไม่ได้', sub: 'ส่งข้อความในแอปแทน และยังอยู่ในรายการต้องติดต่อ' })}</div>
        <p class="err-t mt8" id="frErr" hidden>${ic('circle-x', 14, 2)}<span>เลือกผลการติดต่อก่อน</span></p>
        <p class="label mt16">สิ่งที่แนะนำ</p><div class="chips mt8" id="frAdv">${FR_ADV.map(x => `<button type="button" class="chip" ${x === FR_DOC ? 'data-a="frDoc"' : 'data-toggle'} data-v="${esc(x)}" aria-pressed="false">${esc(x)}</button>`).join('')}</div>
        <div class="field mt8" id="frDocU" hidden><span class="f-l">ไปพบแพทย์เมื่อไร<span class="req" aria-hidden="true">*</span></span><div class="mt4">${ui.seg(SC.REF_U, '', { a: 'frU', label: 'ไปพบแพทย์เมื่อไร' })}</div></div>
        <div class="mt16">${ui.field({ id: 'crNote', label: 'บันทึกสั้น ๆ (ลูกค้าไม่เห็น)', textarea: true, rows: 3, req: true, ph: 'เช่น แนะนำให้ไปพบแพทย์ถ้าไอจนนอนไม่หลับอีกคืน' })}</div>`,
      foot: `${ui.btn('ยกเลิก', { kind: 'secondary', st: variant(), p: { k: r.k } })}${ui.btn('บันทึก', { a: 'fuSave', v: r.k, icon: 'check' })}` });
  },
  mount(el, ctx) {
    const n = $('[data-left]', el); if (!n) return;
    let s = +n.dataset.left;
    ctx.every(() => { s = Math.max(0, s - 1); n.textContent = leftTxt(s); }, 1000);
  },
  sims: ({ st }) => [
    !S_().fuDanger && !S_().fuNext && !st.startsWith('adr') && { label: 'ลูกค้าเลือกอาการรุนแรง', run: () => { S_().fuDanger = true; SC.go('follow', { st: 'danger', p: { k: 'smj' } }); } },
    st === 'worse' && { label: 'เวลาผ่านไปใกล้ครบ 2 ชั่วโมง', run: () => { S_().fuSoon = true; SC.go('follow', { st: 'soon', p: { k: 'smj' } }); } },
    st === 'worse' && { label: 'ลูกค้าแจ้งว่าแย่ลงตอน 20:15 (ใกล้ร้านปิด)', run: () => { S_().fuLate = true; SC.go('follow', { st: 'late', p: { k: 'smj' } }); } }]
});
SC.act('fuDial', t => {
  const k = t.dataset.v, r = ROWS[k] || {};
  SC.phoneShow({ name: r.name || 'ลูกค้า', phone: r.phone, id: r.id, tone: r.last === 'danger' ? 'danger' : '', done: { label: 'โทรแล้ว บันทึกผล', icon: 'pencil', run: () => SC.go('follow', { st: 'record', p: { k } }) } });
});
SC.act('fuMsg', async t => { await SC.busy(t, 500); const S = S_(); S.fuMsg = { ...(S.fuMsg || {}), [t.dataset.v]: SC.clockStr() }; SC.refresh(); SC.toast(`ส่งข้อความในแอปถึง ${ROWS[t.dataset.v]?.name || 'ลูกค้า'} แล้ว`, 'send'); });
/* B6 (FDA 2.1(4)(ซ)): "แนะนำให้ไปพบแพทย์" is kept with how soon, then "went yet?" is asked on the case */
const FR_DOC = 'แนะนำให้ไปพบแพทย์', FR_ADV = [FR_DOC, 'ปรับวิธีทานยา', 'ชวนเริ่มปรึกษาใหม่ในแอป', 'อาการดีขึ้นแล้ว'];
const uTxt = u => (SC.REF_U.find(x => x[0] === u) || [])[1] || '';
SC.act('frDoc', t => { const on = t.getAttribute('aria-pressed') !== 'true'; t.setAttribute('aria-pressed', String(on)); $('#frDocU').hidden = !on; });
SC.act('frU', t => t.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === t))));
SC.act('fuWent', t => { const k = SC.cur().p.k, f = S_().fu[k]; if (!f) return; Object.assign(f, { went: t.dataset.v, wentAt: SC.clockStr(), wentBy: SC.me().short }); SC.refresh(); SC.toast(t.dataset.v === 'yes' ? 'บันทึกแล้ว: ลูกค้าไปพบแพทย์แล้ว' : t.dataset.v === 'no' ? 'บันทึกแล้ว: ลูกค้ายังไม่ไป' : 'บันทึกแล้ว: ยังไม่ทราบ', 'check'); });
SC.act('fuSave', async t => {
  const k = t.dataset.v, r = $('[data-radio="fr"][aria-checked="true"]'), n = $('#crNote'), S = S_();
  const adv = [...document.querySelectorAll('#frAdv .chip[aria-pressed="true"]')].map(b => b.dataset.v), u = $('#frDocU [aria-pressed="true"]')?.dataset.v || '';
  if (adv.includes(FR_DOC) && !u) { $('#frDocU').classList.add('err'); SC.toast('เลือกว่าแนะนำให้ไปพบแพทย์เมื่อไร', 'info'); return; }
  if (!r) { $('#frErr').hidden = false; $('#frOpts').classList.add('err'); return; }
  if (!n.value.trim()) { n.closest('.field').classList.add('err'); n.focus(); SC.toast('ใส่บันทึกสั้น ๆ ก่อนบันทึก', 'info'); return; }
  await SC.busy(t, 600);
  const at = SC.clockStr(), ok = r.dataset.v === 'ok';
  S.fu[k] = { st: ok ? 'called' : 'retry', res: r.dataset.v, at, note: n.value.trim(), adv, refU: u };
  if (!ok) S.fuMsg = { ...(S.fuMsg || {}), [k]: S.fuMsg?.[k] || at };
  SC.go('follow', { st: ok && k === 'smj' && !S.fuNext ? 'called' : variant(), p: { k } });
  SC.toast(ok ? `บันทึกแล้ว: ติดต่อ${ROWS[k].name}ได้ ${at}` : `บันทึกแล้ว: ${r.dataset.v === 'bad' ? 'เบอร์ใช้ไม่ได้' : 'ไม่รับสาย'} · ส่งข้อความในแอปแล้ว เตือนให้โทรอีกครั้งใน 30 นาที`, ok ? 'check' : 'phone-off');
});

/* ---------- S402 reactions after using medicine ---------- */
/* the sample reply follows how bad the report is: a severe one never gets the "wait 2-3 days" text */
const ingName = s => String(s || '').split(' (')[0].trim();
/* item 74: Naranjo 1981, 10 questions, yes / no / don't know (don't know = 0). 9+ ใช่แน่นอน · 5-8 น่าจะใช่ · 1-4 อาจจะใช่ ·
   0 or less ไม่น่าใช่. Lean: the system fills what the case already tells, 6 and 7 cannot be done in a pharmacy, the rest is
   one tap each and can wait (question 3 is usually answered on the call) */
const NJ = [
  [1, 'มีรายงานว่ายานี้ทำให้เกิดอาการนี้', 1, 0], [2, 'เกิดหลังเริ่มใช้ยา', 2, -1], [3, 'หยุดยาแล้วดีขึ้น', 1, 0],
  [4, 'ใช้ยาซ้ำแล้วเป็นอีก', 2, -1], [5, 'มีสาเหตุอื่นทำให้เกิดได้', -1, 2], [6, 'ได้ยาหลอกแล้วเป็นเหมือนกัน', -1, 1],
  [7, 'ระดับยาในเลือดสูงถึงขั้นเป็นพิษ', 1, 0], [8, 'ขนาดยามากขึ้นแล้วเป็นมากขึ้น', 1, 0],
  [9, 'เคยเป็นแบบนี้กับยานี้หรือยากลุ่มเดียวกัน', 1, 0], [10, 'มีหลักฐานที่เห็นได้ (รูป ผลตรวจ)', 1, 0]];
const NJ_FIXED = [6, 7];
const NJ_PRE = {
  'AR-261018-0007': { 1: ['y', 'ผื่นเป็นอาการที่มีรายงานของยานี้'], 2: ['y', 'ได้ยา 02/10/2026 เริ่มเป็นเมื่อวาน'], 9: ['n', 'ประวัติแพ้ยาไม่มียากลุ่มนี้'] },
  'AR-261018-0008': { 2: ['y', 'ใช้ยาวันนี้ บวมวันนี้'] }
};
const njAns = r => { const a = {}; Object.entries(NJ_PRE[r.id] || {}).forEach(([n, [v]]) => { a[n] = v; }); NJ_FIXED.forEach(n => { a[n] = 'u'; }); return { ...a, ...(S_().adr.nj || {}) }; };
const njScore = a => NJ.reduce((s, [n, , y, no]) => s + (a[n] === 'y' ? y : a[n] === 'n' ? no : 0), 0);
SC.njLevel = s => s >= 9 ? ['ใช่แน่นอน', 'red'] : s >= 5 ? ['น่าจะใช่', 'danger'] : s >= 1 ? ['อาจจะใช่', 'warn'] : ['ไม่น่าใช่', 'muted'];
const TYPE_TXT = { alg: 'แพ้ยา', sfx: 'ผลข้างเคียง', unsure: 'ยังไม่แน่ใจ' };
/* item 74 (owner 20/10 "ให้ user บันทึกให้ง่ายที่สุดพอ"): the type the pharmacist taps decides the tick. Allergy = recorded as
   an allergy, side effect = recorded as a warning, unsure = nothing. The tick can be taken off. Naranjo is optional */
const recNow = () => { const A = S_().adr; return A.type === 'alg' || A.type === 'sfx' ? (A.recSet ? !!A.rec : true) : false; };
const njUsed = () => Object.keys(S_().adr.nj || {}).length > 0;
/* the sample reply follows the assessment: only an allergy that is recorded says it is in the allergy history (owner 21/10: nothing blocks it) */
const ADR_SAMPLE = (r = repNow(), ing = r.ing, type = S_().adr.type, rec = recNow(r)) => {
  const p = repPerson(r), who = p.child ? `น้อง${p.first}` : `คุณ${p.first}`, saved = type === 'alg' && rec ? ` ร้านบันทึกว่า${who}แพ้${ingName(ing)}ในประวัติแพ้ยาแล้ว เภสัชกรทุกสาขาเห็นก่อนจ่ายยาค่ะ` : '';
  if (r.severe) return SC.say(`${p.child ? `หยุดให้${who}ใช้` : 'หยุดใช้'}${r.drug}ทันทีค่ะ ${p.child ? `พา${who}ไปโรงพยาบาลใกล้บ้านตอนนี้เลย` : 'ไปโรงพยาบาลใกล้บ้านตอนนี้เลย'} ถ้าหายใจลำบากหรือบวมมากขึ้น โทร 1669 ได้ทันที${saved}`);
  if (type === 'sfx') return SC.say(`อาการ${r.sym.join(' ')}เป็นผลข้างเคียงที่พบได้ของ${r.drug} ไม่ใช่การแพ้ยาค่ะ ถ้ารบกวนมาก หยุดยาไว้ก่อนแล้วทักมาปรึกษาได้ค่ะ ร้านบันทึกไว้แล้ว ครั้งหน้าเภสัชกรจะเลือกยาหรือวิธีใช้ที่เหมาะกว่าค่ะ`);
  if (type === 'unsure') return SC.say('ขอบคุณที่แจ้งค่ะ แนะนำให้หยุดใช้ยาตัวนี้ไว้ก่อน ถ้ามีบวมหรือหายใจลำบาก ไปโรงพยาบาลทันทีค่ะ เภสัชกรจะสอบถามอาการอีกครั้งค่ะ');
  return SC.say(`จากอาการที่แจ้ง แนะนำให้หยุดใช้ยาตัวนี้ไว้ก่อนค่ะ อาการควรค่อย ๆ ดีขึ้นใน 2-3 วัน ถ้าไม่ดีขึ้นหรือมีบวม ไปพบแพทย์ได้เลยค่ะ${saved}`);
};
const callee = p => p.child ? 'ผู้ปกครอง' : 'ลูกค้า';
const calls = () => S_().adr.calls || [];
const CALL_RES = [['hosp', 'คุยแล้ว กำลังไปโรงพยาบาล'], ['at', 'คุยแล้ว ถึงโรงพยาบาลแล้ว'], ['wait', 'คุยแล้ว ยังไม่ไปโรงพยาบาล', 'แนะนำซ้ำให้ไปทันที และเขียนว่าคุยอะไร'], ['noans', 'ไม่รับสาย', 'ส่งคำตอบในแอปได้ และโทรอีกครั้ง']];
const callTxt = c => `${CALL_RES.find(x => x[0] === c.res)[1]} ${c.at}${c.note ? ' · ' + c.note : ''}`;
const PSR_ADR = { id: 'AR-261009-0002', name: 'ประเสริฐ ม.', drug: 'ยาแก้แพ้ ลดน้ำมูก (คลอร์เฟนิรามีน)', sym: ['ง่วงมาก'], at: '09/10/2026 10:12', reply: 'อาการง่วงเป็นผลข้างเคียงที่พบได้ของยาตัวนี้ ไม่ใช่การแพ้ แนะนำให้ทานก่อนนอน และเลี่ยงการขับรถหลังทานยา', by: 'ภญ.ขวัญใจ 09/10/2026 10:40', rec: false, type: 'sfx', nj: 'อาจจะใช่ 3' };
SC.adrLeft = () => S_().branch === 'tw' && !S_().adrEmpty && S_().adr.st !== 'done' ? 1 : 0;
const repNow = () => SC.ADR[S_().adr.who];
const repPerson = r => SC.withAlg(r.pk, SC.person(r.pk));
function adrDetail(ctx) {
  const S = S_(), me = SC.me();
  if (ctx.p.k === 'adr-psr') return `<section class="card adr-d" aria-label="รายละเอียดรายงาน"><div class="hrow"><h3 class="h3">${esc(PSR_ADR.name)}</h3><span class="sp"></span><span class="small mono">${PSR_ADR.id}</span></div>
    <div class="mt12">${ui.kv([['ยาที่สงสัย', `<b>${esc(PSR_ADR.drug)}</b>`], ['อาการ', 'ง่วงมาก'], ['แจ้งเมื่อ', esc(PSR_ADR.at)], ['ประเมิน', `ผลข้างเคียง · Naranjo ${esc(PSR_ADR.nj)} คะแนน`], ['บันทึก', 'เป็นผลข้างเคียง ไม่ใช่การแพ้ · ทุกสาขาเห็นในประวัติก่อนจ่ายยา ไม่ห้ามจ่าย']])}</div>
    <div class="mt16">${ui.note(`<b>ตอบแล้ว · ${esc(PSR_ADR.by)}</b><p>"${esc(PSR_ADR.reply)}"</p>`, { tone: 'ok' })}</div></section>`;
  if (S.adrEmpty) return `<section class="card">${ui.empty({ icon: 'circle-check', title: 'ตอบครบทุกรายงานแล้ว', body: 'รายงานที่ตอบแล้วดูได้ในประวัติเคส' })}</section>`;
  const r = repNow(), p = repPerson(r), done = S.adr.st === 'done', fam = r.pk !== 'me', cl = calls(), lock = r.severe && !cl.length;
  return `<section class="card adr-d" aria-label="รายละเอียดรายงาน">
    <div class="hrow"><h3 class="h3">${esc(p.name)}${fam ? ` <span class="muted">(${esc(p.rel)} ${p.age} ปี · บัญชี ${esc(ME.name)})</span>` : ''}</h3><span class="sp"></span><span class="small mono">${esc(SC.caseCode(r))}</span></div>
    ${r.severe && !done ? `<div class="fu-ban red mt12" role="alert">${ic('octagon-alert', 20, 2)}<div class="grow"><b>อาการรุนแรง: ${esc(r.sym.join(', '))}</b><span>แอปบอก${callee(p)}ให้ไปโรงพยาบาลทันทีหรือโทร 1669 แล้ว และบอกว่าร้านจะโทรหาโดยเร็วที่สุด · โทรตามทันทีแล้วบันทึกผลการโทร ก่อนส่งคำตอบ</span></div></div>` : ''}
    <div class="mt12">${ui.kv([['ยาที่สงสัย', `<b>${esc(r.drug)}</b>`], ['จากเคส', `<span class="mono">${esc(r.from)}</span>`], ['อาการ', esc(r.sym.join(', '))], ['เริ่มเป็น', esc(r.since)], ['ลูกค้าบอกว่ารุนแรง', esc(r.level)], ['อยากให้ติดต่อ', esc(r.want)], ['แพ้ยาที่บันทึกไว้', ui.allergy(p)]])}</div>
    ${cl.length ? `<p class="label mt16">การโทร</p><ol class="tl mt8">${cl.map(c => `<li class="${c.res === 'noans' ? 'bad' : 'done'}"><b>${esc(me.short)} โทรหา${callee(p)}</b><span>${esc(callTxt(c))}</span></li>`).join('')}</ol>` : ''}
    ${done ? `<div class="mt16">${ui.note(`<b>ตอบแล้ว ${esc(S.adr.at)} · ${esc(me.short)}</b><p>"${esc(S.adr.reply)}"</p>${doneRec(p, me)}`, { tone: 'ok' })}</div>`
      : `<div class="btn-row mt12">${ui.btn(cl.length ? `ดูเบอร์ โทรหา${callee(p)}อีกครั้ง` : `ดูเบอร์${callee(p)}`, { kind: r.severe ? 'danger' : 'secondary', sm: true, icon: 'phone', a: 'adrDial' })}${r.severe ? ui.btn('บันทึกผลการโทร', { kind: 'ghost', sm: true, icon: 'pencil', a: 'adrCallOv' }) : ''}</div>
        ${assessBox(r)}
        <div class="mt16">${ui.field({ id: 'adrMsg', label: 'ตอบลูกค้า (ลูกค้าเห็นในแอป)', textarea: true, rows: 3, req: true, value: S.adr.draft ? S.adr.draft.msg : ctx.st === 'adrreply' ? ADR_SAMPLE(r) : '', focus: ctx.st === 'adrreply', ph: 'เขียนคำตอบเอง หรือกด "ใส่คำตอบตัวอย่าง" แล้วแก้ให้ตรงกับเคส' })}</div>
        <div class="btn-row mt8">${ui.btn('ใส่คำตอบตัวอย่าง', { kind: 'ghost', sm: true, icon: 'pencil', a: 'adrSample' })}</div>
        ${recBox(r, p)}
        <div class="btn-row fu-act mt16">${lock ? `<span class="small grow danger-t" id="adrLock">${ic('phone', 13, 2)} โทรหา${callee(p)}และบันทึกผลการโทรก่อน จึงส่งคำตอบได้</span>` : '<span class="small grow">เรื่องนี้ไม่มีการขายหรือเสนอยาใหม่</span>'}${ui.btn('ส่งคำตอบ', { a: 'adrSend', icon: 'send', disabled: lock })}</div>`}
  </section>`;
}
function recAlg(pk, ing, sc) {
  const base = SC.withAlg(pk, SC.person(pk)), me = SC.me();
  SC.S.alg[pk] = { allergies: [...new Set([...(base.allergies || []), ing])], allergyState: 'set', allergySrc: `บันทึกโดย ${me.short} ${SC.NOW.date}${sc === undefined ? '' : ` · Naranjo ${SC.njLevel(sc)[0]} ${sc}`}`, algBy: 'ph' };
}
function recSfx(pk, ing, sym, sc) {
  const S = SC.S; S.sfx = { ...(S.sfx || {}), [pk]: [...((S.sfx || {})[pk] || []), { ing: ingName(ing), sym, by: SC.me().short, at: SC.NOW.date, nj: sc === undefined ? '' : `${SC.njLevel(sc)[0]} ${sc}` }] };
}
function assessBox(r) {
  const A = S_().adr, a = njAns(r), sc = njScore(a), [lv, tone] = SC.njLevel(sc), pre = NJ_PRE[r.id] || {}, kw = r.sym.join(' ');
  const hint = /ผื่น|คัน|ลมพิษ|บวม|หายใจ/.test(kw) ? `"${esc(kw)}" มักเป็นการแพ้ยา · ` : /ง่วง|คลื่นไส้|ปากแห้ง|ใจสั่น|มึน/.test(kw) ? `"${esc(kw)}" มักเป็นผลข้างเคียงตามฤทธิ์ยา · ` : '';
  const auto = n => pre[n] && !(A.nj || {})[n];
  const row = ([n, q, y, no]) => {
    const v = a[n] || '', pts = v === 'y' ? y : v === 'n' ? no : 0;
    return `<li class="nj-r"><span class="nj-q"><b class="num">${n}</b> ${esc(q)}${auto(n) ? `<span class="small muted"> · ระบบเติม: ${esc(pre[n][1])}</span>` : ''}</span>
      <div class="seg nj-s" role="group" aria-label="ข้อ ${n} ${esc(q)}">${[['y', 'ใช่'], ['n', 'ไม่ใช่'], ['u', 'ไม่ทราบ']].map(([k, l]) => `<button type="button" data-a="njSet" data-v="${n}:${k}" aria-pressed="${v === k}">${l}</button>`).join('')}</div>
      <span class="nj-pt num">${pts > 0 ? '+' + pts : pts}</span></li>`;
  };
  /* lean: only what is left to answer is open. System-filled answers fold into one line ("แก้" opens them), 6-7 never show */
  const open = NJ.filter(([n]) => !NJ_FIXED.includes(n) && (A.njAll || !auto(n))), filled = Object.keys(pre).filter(auto);
  return `<section class="adr-as mt16" aria-label="ประเมินอาการ">
    <div class="hrow wrap"><p class="label">ประเมินอาการ (ลูกค้าไม่เห็น)</p></div>
    <p class="small mt8">อาการนี้เป็น</p>
    <div class="mt4" id="adrType">${ui.seg([['alg', 'แพ้ยา', 'shield-alert'], ['sfx', 'ผลข้างเคียง', 'pill'], ['unsure', 'ยังไม่แน่ใจ', 'circle-help']], A.type || '', { a: 'adrType', label: 'อาการนี้เป็น' })}</div>
    <p class="small mt4">${hint}แพ้ยา = ร่างกายต่อต้านยา (ผื่น ลมพิษ บวม หายใจลำบาก) · ผลข้างเคียง = ฤทธิ์ของยาเอง คาดได้ (ง่วง คลื่นไส้ ปากแห้ง)</p>
    <details class="nj-opt mt12"${A.njAll || njUsed() ? ' open' : ''}><summary>ช่วยประเมินด้วย Naranjo (ไม่บังคับ) <span class="sp"></span>${njUsed() ? ui.tag(`${lv} ${sc} คะแนน`, tone, { icon: 'scale' }) : ''}</summary>
    ${filled.length && !A.njAll ? `<p class="small mt8 nj-pre">${ic('check', 12, 2.4)} ระบบเติมจากเคส: ${filled.map(n => `ข้อ ${n} ${pre[n][0] === 'y' ? 'ใช่' : 'ไม่ใช่'} (${esc(pre[n][1])})`).join(' · ')} <button type="button" class="link small" data-a="njAll">แก้</button></p>` : ''}
    <ol class="nj mt8">${open.map(row).join('')}</ol>
    <p class="small mt8 muted">ไม่มีผลกับการบันทึก · ข้อ 6-7 (ยาหลอก ระดับยาในเลือด) ร้านยาทำไม่ได้ นับ 0 · ไม่ทราบ = 0 · 9 ขึ้นไป ใช่แน่นอน · 5-8 น่าจะใช่ · 1-4 อาจจะใช่ · 0 หรือน้อยกว่า ไม่น่าใช่</p></details>
  </section>`;
}
function recBox(r, p) {
  const A = S_().adr, t = A.type, rec = recNow(r), sc = njScore(njAns(r)), [lv] = SC.njLevel(sc), ing = A.draft ? A.draft.ing : r.ing;
  if (!t) return `<p class="small mt12 muted" id="adrRecHint">${ic('info', 13, 2)} เลือกก่อนว่าอาการนี้เป็นแพ้ยา ผลข้างเคียง หรือยังไม่แน่ใจ ระบบจะบอกว่าบันทึกอะไร</p>`;
  if (t === 'unsure') return `<div class="mt12">${ui.note('<b>ยังไม่บันทึกอะไร</b><p>ประเมินอีกครั้งตอนโทรคุย หรือเมื่อลูกค้าตอบติดตามอาการ</p>')}</div>`;
  const alg = t === 'alg', why = '';
  return `<div class="mt12">${ui.field({ id: 'adrIng', label: alg ? 'ตัวยาที่จะบันทึกว่าแพ้ (ชื่อตัวยา ไม่ใช่ชื่อสินค้า)' : 'ตัวยาที่ทำให้เกิดผลข้างเคียง (ชื่อตัวยา)', value: ing, req: true })}</div>
    <button type="button" class="opt mt12" role="checkbox" data-a="adrRecT" aria-checked="${rec}" id="adrRec"><span class="ck">${ic('check', 13, 3)}</span><span class="tx"><b>${alg ? `บันทึกตัวยานี้ในประวัติแพ้ยาของ${esc(p.first)}` : `บันทึกเป็นผลข้างเคียงของ${esc(p.first)}`}</b><span>${alg ? `ทุกสาขาเห็นในประวัติแพ้ยาก่อนจ่ายยา${why ? ' · ' + why : ''}` : 'ทุกสาขาเห็นในประวัติก่อนจ่ายยา ไม่ห้ามจ่าย'}</span></span></button>`;
}
function doneRec(p, me) {
  const A = S_().adr, sc = A.score ?? njScore(njAns(repNow())), [lv] = SC.njLevel(sc);
  return `<p class="small mt4">ประเมิน: ${TYPE_TXT[A.type] || 'แพ้ยา'}${njUsed() ? ` · Naranjo ${lv} ${sc} คะแนน` : ''}</p><p class="small mt4">${A.rec && A.type === 'sfx' ? `บันทึก "${esc(A.ing)}" เป็นผลข้างเคียงของ${esc(p.first)}แล้ว · ทุกสาขาเห็นในประวัติ ไม่ห้ามจ่าย` : A.rec ? `บันทึก "${esc(A.ing)}" ในประวัติแพ้ยาของ${esc(p.first)}แล้ว · บันทึกโดย ${esc(me.short)} ${SC.NOW.date} · ทุกสาขาเห็นก่อนจ่ายยา` : 'ไม่ได้บันทึก'}</p>`;
}
const keepDraft = () => { const m = $('#adrMsg'), g = $('#adrIng'), A = S_().adr; if (m) A.draft = { msg: m.value, ing: g ? g.value : (A.draft?.ing ?? repNow().ing) }; };
SC.act('adrType', t => { keepDraft(); const A = S_().adr; A.type = t.dataset.v; A.recSet = false; SC.refresh(); });
SC.act('njAll', () => { keepDraft(); S_().adr.njAll = true; SC.refresh(); });
SC.act('njSet', t => { keepDraft(); const [n, v] = t.dataset.v.split(':'), A = S_().adr; A.nj = { ...(A.nj || {}), [n]: v }; SC.refresh(); });
SC.act('adrRecT', t => { keepDraft(); const A = S_().adr; A.recSet = true; A.rec = t.getAttribute('aria-checked') !== 'true'; SC.refresh(); });
SC.act('adrSample', () => { const m = $('#adrMsg'); if (!m) return; m.value = ADR_SAMPLE(repNow(), $('#adrIng')?.value); m.focus(); SC.toast('ใส่คำตอบตัวอย่างแล้ว อ่านและแก้ให้ตรงกับเคสก่อนส่ง', 'pencil'); });
SC.act('adrDial', () => {
  const r = repNow(), p = repPerson(r);
  SC.phoneShow({ name: p.child ? `${ME.name} · ${callee(p)}ของ${p.name}` : ME.name, phone: ME.phone, id: r.id, callee: callee(p), tone: r.severe ? 'danger' : '',
    done: r.severe ? { label: 'โทรแล้ว บันทึกผล', icon: 'pencil', run: openCall } : null });
});
/* call result for a severe report: nothing chosen for the pharmacist, sending unlocks once a call is logged */
function openCall() {
  const r = repNow(), p = repPerson(r), m = $('#adrMsg'), g = $('#adrIng');
  if (m) S_().adr.draft = { msg: m.value, ing: g?.value ?? (S_().adr.draft?.ing ?? r.ing) };
  SC.openOv(() => `<div class="scrim" data-a="ovClose"></div><div class="modal" role="dialog" aria-modal="true" aria-labelledby="acT">
    <div class="modal-h"><span class="danger-t">${ic('phone-call', 24, 2)}</span><div class="grow"><h2 id="acT">บันทึกผลการโทร</h2><p>${esc(ME.name)} (${callee(p)}${p.child ? 'ของ' + esc(p.name) : ''}) · ${esc(SC.caseCode(r))}</p></div>${ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
    <div class="modal-b"><p class="label">ผลการโทร</p><div class="opts mt8" data-radio-scope id="acOpts">${CALL_RES.map(([v, title, sub]) => ui.opt({ group: 'ac', v, title, sub })).join('')}</div>
      <p class="err-t mt8" id="acErr" hidden>${ic('circle-x', 14, 2)}<span>เลือกผลการโทรก่อน</span></p>
      <div class="mt16">${ui.field({ id: 'acNote', label: 'บันทึกสั้น ๆ (ลูกค้าไม่เห็น)', textarea: true, rows: 2, ph: 'เช่น แม่กำลังพาน้องไปโรงพยาบาลใกล้บ้าน' })}</div></div>
    <div class="modal-f">${ui.btn('ยกเลิก', { kind: 'secondary', a: 'ovClose' })}${ui.btn('บันทึกผลการโทร', { a: 'adrCallSave', icon: 'check' })}</div></div>`);
}
SC.act('adrCallOv', () => openCall());
SC.act('adrCallSave', async t => {
  const r = $('[data-radio="ac"][aria-checked="true"]'), n = $('#acNote'), S = S_();
  if (!r) { $('#acErr').hidden = false; $('#acOpts').classList.add('err'); return; }
  if (r.dataset.v === 'wait' && !n.value.trim()) { n.closest('.field').classList.add('err'); n.focus(); SC.toast('เขียนสั้น ๆ ว่าคุยอะไร และแนะนำอะไร', 'info'); return; }
  await SC.busy(t, 500);
  S.adr.calls = [...calls(), { res: r.dataset.v, at: SC.clockStr(), note: n.value.trim() }];
  S.ov = null; SC.refresh();
  SC.toast(r.dataset.v === 'noans' ? 'บันทึกแล้ว: ไม่รับสาย · ส่งคำตอบในแอปได้ และโทรอีกครั้ง' : 'บันทึกผลการโทรแล้ว ส่งคำตอบได้', r.dataset.v === 'noans' ? 'phone-off' : 'check');
});
SC.act('adrSend', async t => {
  const m = $('#adrMsg'), ing = $('#adrIng'), S = S_(), r = repNow(), ty = S.adr.type, rec = !!$('#adrRec') && $('#adrRec').getAttribute('aria-checked') === 'true';
  if (!ty) { $('#adrType button')?.focus(); SC.toast('เลือกก่อนว่าอาการนี้เป็นแพ้ยา ผลข้างเคียง หรือยังไม่แน่ใจ', 'info'); return; }
  if (!m.value.trim()) { m.closest('.field').classList.add('err'); m.focus(); SC.toast('เขียนคำตอบก่อนส่ง', 'info'); return; }
  if (SC.dxHits(m.value).length) { SC.toast(`คำตอบมีคำที่เป็นชื่อโรค: ${SC.dxHits(m.value).join(', ')} · แก้ก่อนส่ง`, 'info'); m.focus(); return; }
  if (rec && !ing.value.trim()) { ing.closest('.field').classList.add('err'); ing.focus(); SC.toast(ty === 'sfx' ? 'ใส่ชื่อตัวยาที่ทำให้เกิดผลข้างเคียง' : 'ใส่ชื่อตัวยาที่จะบันทึกว่าแพ้', 'info'); return; }
  if (r.severe && !calls().length) { SC.toast(`โทรหา${callee(repPerson(r))}และบันทึกผลการโทรก่อนส่งคำตอบ`, 'phone'); return; }
  if (!(rec && ty === 'alg') && /ในประวัติแพ้ยาแล้ว|ทุกสาขาจะไม่จ่ายยานี้/.test(m.value)) { m.focus(); SC.toast('คำตอบบอกว่าบันทึกแพ้ยาแล้ว แต่ยังไม่ได้ติ๊กบันทึก · แก้คำตอบหรือติ๊กบันทึก', 'info'); return; }
  await SC.busy(t, 600);
  const sc = njScore(njAns(r));
  Object.assign(S.adr, { st: 'done', reply: m.value.trim(), rec, ing: ing ? ing.value.trim() : '', at: SC.clockStr(), score: sc });
  if (rec && ty === 'alg') recAlg(r.pk, S.adr.ing, njUsed() ? sc : undefined);
  if (rec && ty === 'sfx') recSfx(r.pk, S.adr.ing, r.sym.join(' '), njUsed() ? sc : undefined);
  SC.go('follow', { st: 'adrdone', p: { k: 'adr-cur' } });
  SC.toast(`ส่งคำตอบถึง${SC.isFam({ who: r.pk }) ? 'ผู้ปกครองของ ' + repPerson(r).name : ' ' + repPerson(r).name}แล้ว${rec ? (ty === 'sfx' ? ' · บันทึกผลข้างเคียงแล้ว' : ' · บันทึกแพ้ยาแล้ว') : ''}`, 'send');
});

/* ---------- S403 case history of this branch ---------- */
const LOG = bb => {
  const S = S_(), b = bb || S.branch, ac = b === S.branch && S.activeCase && SC.CASES[S.activeCase];
  const live = ac ? [{ id: ac.id, d: SC.NOW.date, t: '14:16', who: SC.casePerson(ac).name, note: ac.note, topic: ac.symptoms.join(' '), mode: ac.mode === 'video' ? 'วิดีโอ' : 'แชท', ph: S.me, res: 'กำลังปรึกษา', tone: 'warn', amt: 0, dur: '' }] : [];
  const closed = S.closed.filter(x => x.branch === b).slice().reverse().map(SC.closedView).map(x => ({ ...x, d: SC.NOW.date, t: x.start || x.t }));
  const base = b === 'tw' ? [
    { id: 'TC-261018-0138', d: SC.NOW.date, t: '13:40', who: 'ธนวัฒน์ พ.', topic: 'ปวดหัว', mode: 'วิดีโอ', ph: 'kj', res: 'ให้คำแนะนำ ไม่ต้องจ่ายยา', tone: 'muted', amt: 0, dur: '12 นาที' },
    { id: 'TC-261018-0131', d: SC.NOW.date, t: '12:55', who: 'วิภา ส.', topic: 'ปวดท้อง', mode: 'แชท', ph: 'kj', res: 'ส่งรายการแล้ว ยังไม่ชำระ', tone: 'warn', amt: 480, pay: 'sent', code: '2MNA', dur: '16 นาที' },
    { id: 'TC-261018-0126', d: SC.NOW.date, t: '11:30', who: 'นภา ว.', topic: 'ไอ', mode: 'แชท', ph: 'kj', res: 'ลูกค้าไม่ตอบกลับ', tone: 'muted', amt: 0, dur: '31 นาที' },
    { id: 'TC-261018-0119', d: SC.NOW.date, t: '10:05', who: 'สุดา ม.', topic: 'ตาแดง แสบตา', mode: 'แชท', ph: 'kj', res: 'จ่ายยาแล้ว', tone: 'ok', amt: 95, dur: '08 นาที' },
    { id: 'TC-261018-0112', d: SC.NOW.date, t: '09:20', who: 'ชาญ ป.', topic: 'ไข้ ไอ', mode: 'แชท', ph: 'kj', res: 'ไม่รับเคส แนะนำโรงพยาบาล', tone: 'danger', amt: 0, dur: '04 นาที' },
    { id: 'TC-261017-0121', d: '17/10/2026', t: '15:30', who: 'มานพ ร.', topic: 'ไอ เสมหะ', mode: 'แชท', ph: 'kj', res: 'จ่ายยาแล้ว', tone: 'ok', amt: 120, dur: '11 นาที' }] : [];
  const hist = SC.HISTORY.filter(h => h.branch === b).map(h => ({ id: h.id, d: h.date, t: h.time, who: SC.person(h.who).name, topic: h.topic, mode: h.mode, ph: h.pharm, res: h.close, tone: h.bought ? 'ok' : 'muted', amt: h.bought, dur: h.dur }));
  return [...live, ...closed, ...base, ...hist];
};
SC.logAll = LOG;
const SUM = SC.SUM = {
  'TC-261016-0058': { sym: 'ไข้ต่ำ ๆ ไอมีเสมหะ น้ำมูกใส เป็นมา 2 วัน · ไม่มีหอบเหนื่อย', adv: ['ดื่มน้ำอุ่นบ่อย ๆ พักผ่อนให้เพียงพอ', 'ยาแก้แพ้อาจทำให้ง่วง เลี่ยงการขับรถหลังทานยา', 'เภสัชกรจะถามอาการในแอปวันที่ 1 และวันที่ 3'], meds: ['ยาแก้ไอ ชนิดน้ำ 1 ขวด', 'ยาแก้แพ้ ลดน้ำมูก 1 แผง', 'พาราเซตามอล 500 มก. 1 แผง'], warn: ['หายใจลำบาก หรือเจ็บแน่นหน้าอก', 'ไข้สูงเกิน 39 องศา หรือไข้ไม่ลดภายใน 3 วัน', 'มีผื่นขึ้น ปาก หน้า หรือตาบวมหลังใช้ยา'], follow: 'ติดตามอาการ วันที่ 3 จาก 5 · แจ้งว่าแย่ลง 13:40' },
  'TC-261002-0087': { sym: 'ไข้ต่ำ ๆ ไอ เจ็บคอ เป็นมา 2 วัน · กลืนแล้วเจ็บ · ไม่มีหอบเหนื่อย', adv: ['ดื่มน้ำอุ่นบ่อย ๆ พักผ่อนให้เพียงพอ', 'กลั้วคอด้วยน้ำเกลืออุ่น วันละ 3-4 ครั้ง', 'เลี่ยงอาหารทอด ของเย็น และการใช้เสียงมาก'], meds: ['พาราเซตามอล 500 มก. 1 แผง', 'อะม็อกซีซิลลิน 500 มก. 2 แผง'], warn: ['หายใจลำบาก หรือเจ็บแน่นหน้าอก', 'ไข้สูงเกิน 39 องศา หรือไข้ไม่ลดภายใน 3 วัน', 'กลืนน้ำลายไม่ได้ หรืออ้าปากได้น้อย', 'มีผื่นขึ้น ปาก หน้า หรือตาบวมหลังใช้ยา'], follow: 'ไม่ได้ติดตามอาการ · ลูกค้าแจ้งอาการหลังใช้ยา AR-261018-0007' },
  'TC-261017-0121': { sym: 'ไอมีเสมหะ เป็นมา 3 วัน · ไม่มีไข้ · ไม่มีหอบเหนื่อย', adv: ['ดื่มน้ำอุ่นบ่อย ๆ ช่วยให้เสมหะออกง่ายขึ้น', 'เลี่ยงควันบุหรี่และอากาศเย็น', 'เภสัชกรจะถามอาการในแอปวันที่ 1 และวันที่ 3'], meds: ['บรอมเฮกซีน 8 มก. 1 แผง', 'ยาแก้ไอ ชนิดน้ำ 1 ขวด'], warn: ['หายใจลำบาก หรือเจ็บแน่นหน้าอก', 'ไอเป็นเลือด', 'ไข้สูงเกิน 39 องศา หรือไข้ไม่ลดภายใน 3 วัน'], follow: 'ติดตามอาการ วันที่ 1 จาก 5 · แจ้งว่าแย่ลง 17/10/2026 22:05' }
};
const match = (r, q) => SC.caseCode(r).toUpperCase().includes(q.toUpperCase()) || r.id.includes(q) || r.who.includes(q) || (r.code && r.code.toUpperCase() === q.toUpperCase());
function logDetail(id) {
  const rows = LOG(), r = rows.find(x => x.id === id) || rows.find(x => x.id === 'TC-261016-0058') || rows[0];
  const s = r.doc ? { sym: r.doc.sym, adv: r.doc.adv, meds: r.doc.meds, warn: r.doc.warn, medsNote: r.doc.medsNote } : SUM[r.id];
  const doc = s ? `<h4>อาการที่แจ้ง</h4><p>${esc(s.sym)}</p><h4>คำแนะนำ</h4><ul>${s.adv.map(x => `<li>${esc(x)}</li>`).join('')}</ul><h4>ยาที่ได้รับ</h4>${s.meds.length ? `<ul>${s.meds.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p class="muted">${esc(s.medsNote || 'ไม่ได้ซื้อยา')}</p>`}<div class="doc-warn"><h4>${ic('octagon-alert', 15, 2)}ไปพบแพทย์ทันทีถ้า</h4><ul>${s.warn.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`
    : `<h4>อาการที่แจ้ง</h4><p>${esc(r.topic)}</p><p class="small mt8">${r.res === 'กำลังปรึกษา' ? 'ยังไม่ได้ปิดเคส ใบสรุปออกเมื่อปิดเคส' : 'ใบสรุปของเคสนี้เปิดดูได้ในระบบจริง'}</p>`;
  const pay = r.pay === 'sent' ? ` · ${SC.money(r.amt)} ยังไม่ชำระ` : r.amt ? ` · ${SC.money(r.amt)}` : '';
  return { r, html: `<div class="gap16">
    ${ui.kv([['ผู้มีอาการ', esc(r.who)], ['วันที่', `${esc(r.d)} ${esc(r.t)}${r.dur ? ' · ' + esc(r.dur) : ''}`], ['ช่องทาง', ui.mode(/วิดีโอ|video/.test(r.mode) ? 'video' : 'chat')], ['เภสัชกร', `${esc(SC.PHARM[r.ph].name)} · ${esc(SC.PHARM[r.ph].lic)}`], ['ผล', esc(r.res) + pay],
      ...(r.pay === 'paid' && r.paidAt ? [['การชำระ', `ชำระแล้ว ${SC.money(r.amt)} · พร้อมเพย์ ${esc(r.paidAt)}${r.late ? ' (หลังปิดเคส)' : ''}`]] : []),
      ...(r.recv === 'pickup' ? [['การรับยา', r.handed ? `รับที่ร้านแล้ว ${esc(r.handed)} · ตรวจรหัสรับยาแล้ว` : r.ready ? `ยาพร้อมรับ แจ้งลูกค้าแล้ว ${esc(r.ready)}` : 'รอรับที่ร้าน']] : []),
      ...(r.code ? [['รหัสรับยา', `<span class="mono">${esc(r.code)}</span>`]] : []), ...(SC.recOf(r)?.ack ? [['รับทราบขั้นตอน', esc(SC.recOf(r).ack)]] : []), ...(SUM[r.id]?.follow ? [['ติดตามอาการ', esc(SUM[r.id].follow)]] : r.follow ? [['ติดตามอาการ', r.late ? `เปิด · เริ่มเมื่อชำระ ${esc(r.paidAt)} · ถามวันที่ 1 และวันที่ 3` : 'เปิด · ถามวันที่ 1 และวันที่ 3']] : [])])}
    <article class="doc sm" aria-label="ใบสรุปที่ลูกค้าได้รับ"><div class="doc-h"><div><b>ใบสรุปการปรึกษา</b><span class="mono">${esc(SC.caseCode(r))}</span></div></div>${doc}</article>
    <div class="card tint"><p class="label">บทสนทนา</p><p class="small mt4">อ่านอย่างเดียว · เก็บ 1 ปีนับจากวันปิดเคส · ไม่มีการบันทึกวิดีโอ</p>${ui.btn('เปิดดูบทสนทนา', { kind: 'secondary', sm: true, icon: 'message-circle', a: 'logChat', cls: 'mt8' })}</div>
    ${r.res === 'กำลังปรึกษา' ? '' : `<details class="rec-snap"><summary>${ic('file-text', 15, 2)} สำเนาบันทึก ณ วันปิดเคส (อ่านอย่างเดียว)</summary>${SC.recSnap(r)}</details>`}
    ${SC.recFixes(r)}${SC.recAccess(r)}</div>` };
}
SC.screen('log', {
  code: 'S403', group: 4, title: 'ประวัติเคส', nav: 'log',
  states: [['all', 'ทั้งหมด'], ['search', 'ค้นหาเจอ'], ['none', 'ค้นหาไม่เจอ'], ['detail', 'ดูเคส', { back: 'all', cust: [['summary', 'normal', 'ใบสรุปเดียวกับที่ลูกค้าเห็น'], ['history', 'normal']] }], ['loading', 'กำลังโหลด'], ['error', 'โหลดไม่สำเร็จ'],
    ['fix', 'เพิ่มบันทึกแก้ไข', { back: 'detail', cust: [] }]],
  cust: [],
  notes: ['เจ้าของ 20/10 (B7 ห้องรีวิว อย.): "ต้องเก็บ log ด้วย" · ตอนปิดเคส ระบบเก็บสำเนา: ข้อมูลยาแต่ละตัว ฉลากที่พิมพ์พร้อมฉบับ แพ้ยา ยาประจำ น้ำหนัก บันทึกอาการ การส่งต่อ การส่งยา เลขบิลหน้าร้าน · แก้ฉลากหรือข้อมูลลูกค้าทีหลังไม่กระทบเคสเก่า',
    'เคสที่ปิดแล้วแก้ทับไม่ได้ · ต้องแก้ใช้ "เพิ่มบันทึกแก้ไข" พร้อมเหตุผล เก็บ ใคร เมื่อไร ของเดิมยังเห็น · ใบสรุปที่ลูกค้าได้ไม่เปลี่ยน · การเปิดดู พิมพ์ ส่งออก แก้ไข ขึ้นใน "การเข้าถึงเคสนี้" และรวมทุกคนที่ S504 · เก็บ 1 ปีนับจากวันปิดเคส',
    'เคาะแล้ว 20/10: เภสัชกรเห็นเคสของเภสัชกรคนอื่นในสาขาเดียวกันได้ ทุกการเปิดดูถูกบันทึก (เจ้าของ: "ได้")', 'เห็นเฉพาะเคสของสาขาที่ประจำอยู่ เคสสาขาอื่นเห็นแค่สรุปสั้นจากการ์ดผู้มีอาการ (S603)', 'เคสที่รับและปิดในรอบนี้ขึ้นในตารางทันที พร้อมสถานะชำระจริง (ยังไม่ชำระ / ชำระแล้ว)', 'ค้นด้วยเลขเคส ชื่อ หรือรหัสรับยา 4 ตัว · ไม่แสดงเบอร์เต็มในตาราง', 'แชทเก็บ 1 ปี · ไม่มีวิดีโอ · การเปิดดูทุกครั้งถูกบันทึก (เจ้าของสั่ง: บันทึกงานรายเภสัชกร)'],
  wait: [],
  head: () => ({ title: 'ประวัติเคส', sub: `${SC.branch().name} · บันทึกงานรายเภสัชกร` }),
  prep(S, st, p) { if (st === 'detail' || st === 'fix') { p.id = p.id || 'TC-261016-0058'; if (st === 'detail') SC.logEv('case', 'เปิดดูเคส', p.id); } },
  render(ctx) {
    const st = ctx.st === 'detail' || ctx.st === 'fix' ? 'all' : ctx.st, q = st === 'search' ? (SC.S.logQ || '0058') : st === 'none' ? (SC.S.logQ || 'TC-261099') : '';
    const rows = LOG().filter(r => !q || match(r, q));
    const body = st === 'loading' ? Array.from({ length: 5 }, () => `<tr><td>${ui.skel('70%')}</td><td>${ui.skel('80%')}</td><td>${ui.skel('60%')}</td><td>${ui.skel('50%')}</td><td>${ui.skel('70%')}</td><td>${ui.skel('40%')}</td></tr>`).join('')
      : rows.map(r => `<tr class="click" data-go="log" data-st="detail" data-p='{"id":"${r.id}"}' tabindex="0" aria-label="ดูเคส ${esc(SC.caseCode(r))} ${esc(r.who)}"${ctx.st === 'detail' && ctx.p.id === r.id ? ' aria-selected="true"' : ''}><td><span class="mono">${esc(SC.caseCode(r))}</span><span class="sub">${esc(r.d)} ${esc(r.t)}</span></td><td><b>${esc(r.who)}</b></td><td>${esc(r.topic)}<span class="sub log-m">${ui.mode(/วิดีโอ|video/.test(r.mode) ? 'video' : 'chat')}${r.dur ? ' ' + esc(r.dur) : ''}</span></td><td>${esc(SC.PHARM[r.ph].short)}</td><td>${ui.tag(r.res, r.tone)}</td><td class="r"><span class="num">${r.amt ? SC.money(r.amt) : '-'}</span>${r.pay === 'sent' ? '<span class="sub warn-t">ยังไม่ชำระ</span>' : ''}</td></tr>`).join('');
    return `<div class="log-f">
        <div class="search grow">${ic('search', 18, 2)}<label class="sr" for="logQ">ค้นหาเคส</label><input id="logQ" class="input" type="search" placeholder="ค้นด้วยเลขเคส ชื่อ หรือรหัสรับยา 4 ตัว" value="${esc(q)}" autocomplete="off"></div>
        ${ui.seg([['today', 'วันนี้'], ['7d', '7 วัน'], ['30d', '30 วัน']], '30d', { a: 'logRange', label: 'ช่วงเวลา' })}
        <button type="button" class="chip" data-toggle aria-pressed="false">${ic('user', 13, 2)}เฉพาะของฉัน</button>
        ${ui.btn('ตรวจสอบย้อนหลัง', { kind: 'ghost', sm: true, go: 'audit', icon: 'file-text', title: 'จอสำหรับเจ้าหน้าที่ตรวจ ค้นย้อนหลัง 1 ปี พิมพ์และส่งออกได้' })}</div>
      ${st === 'error' ? `<div class="mt16">${ui.note('<b>โหลดประวัติไม่สำเร็จ</b><p>อาจเป็นเพราะเน็ตของร้าน ลองอีกครั้ง ถ้ายังไม่ได้ แจ้งผู้จัดการสาขา · เคสที่กำลังเปิดอยู่ไม่ได้รับผลกระทบ</p>', { tone: 'danger', role: 'alert' })}<div class="mt12">${ui.btn('ลองอีกครั้ง', { kind: 'secondary', icon: 'refresh-cw', st: 'all' })}</div></div>`
        : `<section class="card pad0 mt16"><table class="tbl"><thead><tr><th>เคส</th><th>ลูกค้า</th><th>อาการที่แจ้ง</th><th>เภสัชกร</th><th>ผล</th><th class="r">ยอดค่ายา</th></tr></thead><tbody>${body}</tbody></table>
          ${st === 'none' ? `<div class="pad16">${ui.empty({ icon: 'search', title: `ไม่พบเคส "${q}"`, body: 'ตรวจเลขเคสอีกครั้ง หรือค้นด้วยชื่อหรือรหัสรับยา · เคสของสาขาอื่นไม่แสดงที่นี่', btn: ui.btn('ล้างคำค้น', { kind: 'secondary', sm: true, st: 'all' }) })}</div>` : ''}</section>`}`;
  },
  overlay(ctx) {
    if (ctx.st !== 'detail' && ctx.st !== 'fix') return '';
    const d = logDetail(ctx.p.id || 'TC-261016-0058'), live = d.r.res === 'กำลังปรึกษา';
    const foot = live ? '' : `${SC.isAdmin() ? '' : ui.btn('เพิ่มบันทึกแก้ไข', { kind: 'secondary', sm: true, st: 'fix', p: { id: d.r.id }, icon: 'pencil' })}<span class="sp"></span>${ui.btn('บันทึกเต็มสำหรับตรวจ', { kind: 'ghost', sm: true, go: 'audit', st: 'detail', p: { id: d.r.id }, icon: 'file-text' })}`;
    const dr = ui.drawer({ title: `เคส ${d.r.id}`, sub: `${d.r.who} · ${d.r.topic}`, back: 'all', body: d.html, foot });
    return ctx.st === 'fix' ? dr + SC.fixModal(d.r) : dr;
  },
  mount(el) {
    const q = $('#logQ', el); if (!q) return;
    /* the list follows what is typed, no Enter needed; the cursor stays in the box */
    let t0;
    q.addEventListener('input', () => { clearTimeout(t0); t0 = setTimeout(() => { const v = q.value.trim(); SC.S.logQ = v; SC.go('log', { st: !v ? 'all' : LOG().some(r => match(r, v)) ? 'search' : 'none' }); requestAnimationFrame(() => { const n = $('#logQ'); if (n) { n.value = v; n.focus(); n.setSelectionRange(v.length, v.length); } }); }, 250); });
  }
});
SC.act('logRange', t => { t.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === t))); SC.toast('จำลอง: กรองตามช่วงเวลา', 'calendar-check'); });
SC.act('logChat', () => SC.toast('จำลอง: เปิดบทสนทนาแบบอ่านอย่างเดียว การเปิดดูถูกบันทึก', 'message-circle'));
})();

/* ===== 75-fda.js ===== */
/* =====================================================================
   75 · FDA round (owner 20/10/2026 via the FDA review room, docs/2026-10-20-fda-approval-review.md)
        B7 the copy kept when a case closes (read-only) + corrections + who opened it ·
        S407 full record for an inspector: search back 1 year, print, export ·
        S504 access log: who looked at, printed, exported or changed what (case no. only, never customer names)
   ===================================================================== */
(() => {
const { $, esc, ic, ui } = SC;
const algTxt = p => (p.allergies || []).length ? p.allergies.join(', ') : p.allergyState === 'unknown' ? 'ยังไม่ได้ระบุ' : 'ไม่มี';
const uTxt = u => (SC.REF_U.find(x => x[0] === u) || [])[1] || '';
const RECV_TXT = { pickup: 'รับที่ร้าน', parcel: 'พัสดุ Flash Express', express: 'ส่งด่วนโดยไรเดอร์', cold: 'ส่งเย็น Inter Express' };

/* ---------- the copy taken at closing: later edits to labels or the customer record never change it ---------- */
SC.snapOf = (c, o, f) => {
  const p = SC.casePerson(c), live = o && ['sent', 'paid'].includes(o.status), rv = o?.paid?.recv || '';
  return { at: `${SC.NOW.date} ${SC.clockStr()}`, who: { name: p.name, age: p.age, weight: p.weight, alg: algTxt(p), meds: SC.medsTxt(p) }, ack: SC.ackTxt(c), sym: f.sym,
    items: live ? o.items.map(it => { const d = SC.drugInfo(it); return { name: it.name, qty: `${it.qty} ${it.unit}`, how: it.how || '', drug: SC.isDrug(it), gen: d.gen, str: d.str, ind: d.ind, warn: d.warn, lbl: d.lbl || (d.src === 'none' ? 'กรอกเอง' : 'ข้อมูลสินค้า'), cold: !!it.cold }; }) : [],
    recv: rv ? RECV_TXT[rv] + (rv === 'cold' && o.coldTrk ? ` · ${SC.coldTrkPlain(o.coldTrk)}` : '') : '', zone: rv && rv !== 'pickup' ? (o.out ? `${SC.OUT_TAG} · ${o.to || ''}` : SC.zoneTxt(o.to, o.to ? o.km : SC.HOME_KM)) : '',
    bill: o?.status === 'paid' && o.paid?.at && SC.ssNo ? SC.ssNo(o, SC.S.branch) : '' };
};
/* sample copies of the cases the mock already has (built on first use so the label versions are read live) */
let SNAP0;
const snap0 = () => SNAP0 || (SNAP0 = {
  'TC-261016-0058': { at: '16/10/2026 10:34', who: { name: 'สมใจ ใจดี', age: 38, weight: 58, alg: 'แอสไพริน', meds: 'แอมโลดิพีน 5 มก. (ยาความดัน)' }, ack: 'ลูกค้ารับทราบขั้นตอนและความเสี่ยงแล้ว ฉบับ 1.0 · 16/10/2026 10:19', sym: 'ไข้ต่ำ ๆ ไอมีเสมหะ น้ำมูกใส เป็นมา 2 วัน · ไม่มีหอบเหนื่อย',
    items: [{ name: 'ยาแก้ไอ ชนิดน้ำ', qty: '1 ขวด 60 มล.', how: 'ครั้งละ 10 มล. วันละ 3 ครั้ง หลังอาหาร', drug: true, gen: 'Dextromethorphan', str: '15 mg/5 ml', ind: 'บรรเทาอาการไอ', warn: 'อาจทำให้ง่วงซึม', lbl: 'กรอกเอง' },
      { name: 'ยาแก้แพ้ ลดน้ำมูก', qty: '1 แผง', how: 'ครั้งละ 1 เม็ด วันละ 3 ครั้ง', drug: true, gen: 'Chlorpheniramine maleate', str: '4 mg', ind: 'บรรเทาน้ำมูกไหล จาม', warn: 'ทำให้ง่วง เลี่ยงการขับรถ', lbl: 'ยาแก้แพ้ ลดน้ำมูก ฉบับ 1' },
      { name: 'พาราเซตามอล 500 มก.', qty: '1 แผง', how: 'ครั้งละ 1 เม็ด ทุก 4-6 ชั่วโมง เมื่อมีไข้', drug: true, gen: 'Paracetamol', str: '500 mg', ind: 'บรรเทาปวด ลดไข้', warn: 'ไม่เกิน 8 เม็ดต่อวัน', lbl: 'ลดไข้ ฉบับ 2' }],
    recv: 'รับที่ร้าน · ตรวจรหัสรับยาแล้ว 10:52', zone: '', bill: 'TW2610161031' },
  'TC-261002-0087': { at: '02/10/2026 19:58', who: { name: 'สมใจ ใจดี', age: 38, weight: 58, alg: 'แอสไพริน', meds: 'แอมโลดิพีน 5 มก. (ยาความดัน)' }, ack: 'ลูกค้ารับทราบขั้นตอนและความเสี่ยงแล้ว ฉบับ 1.0 · 02/10/2026 19:39', sym: 'ไข้ต่ำ ๆ ไอ เจ็บคอ เป็นมา 2 วัน · กลืนแล้วเจ็บ · ไม่มีหอบเหนื่อย',
    items: [{ name: 'พาราเซตามอล 500 มก.', qty: '1 แผง', how: 'ครั้งละ 1 เม็ด ทุก 4-6 ชั่วโมง เมื่อมีไข้', drug: true, gen: 'Paracetamol', str: '500 mg', ind: 'บรรเทาปวด ลดไข้', warn: 'ไม่เกิน 8 เม็ดต่อวัน', lbl: 'ลดไข้ ฉบับ 2' },
      { name: 'อะม็อกซีซิลลิน 500 มก.', qty: '2 แผง', how: 'ครั้งละ 1 แคปซูล วันละ 3 ครั้ง หลังอาหาร ทานจนหมด', drug: true, gen: 'Amoxicillin', str: '500 mg', ind: 'ยาปฏิชีวนะ ฆ่าเชื้อแบคทีเรีย', warn: 'ทานจนหมดแม้อาการดีขึ้น · มีผื่นหรือบวม หยุดยาและแจ้งเภสัชกร', lbl: 'อะม็อกซีซิลลิน ฉบับ 1' }],
    recv: 'พัสดุ Flash Express · เลขพัสดุ TH2610023KX1', zone: 'กรุงเทพมหานคร · อยู่ในเขตส่งยา', bill: 'TW2610021958' },
  'TC-261017-0121': { at: '17/10/2026 15:41', who: { name: 'มานพ รุ่งเรือง', age: 45, weight: 72, alg: 'ไม่มี', meds: 'ไม่มี' }, ack: 'ลูกค้ารับทราบขั้นตอนและความเสี่ยงแล้ว ฉบับ 1.0 · 17/10/2026 15:29', sym: 'ไอมีเสมหะ เป็นมา 3 วัน · ไม่มีไข้ · ไม่มีหอบเหนื่อย',
    items: [{ name: 'บรอมเฮกซีน 8 มก.', qty: '1 แผง', how: 'ครั้งละ 1 เม็ด วันละ 3 ครั้ง หลังอาหาร', drug: true, gen: 'Bromhexine', str: '8 mg', ind: 'ละลายเสมหะ', warn: 'ดื่มน้ำมาก ๆ', lbl: 'ละลายเสมหะ ฉบับ 1' },
      { name: 'ยาแก้ไอ ชนิดน้ำ', qty: '1 ขวด 60 มล.', how: 'ครั้งละ 10 มล. วันละ 3 ครั้ง หลังอาหาร', drug: true, gen: 'Dextromethorphan', str: '15 mg/5 ml', ind: 'บรรเทาอาการไอ', warn: 'อาจทำให้ง่วงซึม', lbl: 'กรอกเอง' }],
    recv: 'ส่งด่วนโดยไรเดอร์ · ส่งถึง 16:32', zone: 'กรุงเทพมหานคร · อยู่ในเขตส่งยา', bill: 'TW2610171541' },
  'TC-261018-0119': { at: `${SC.NOW.date} 10:13`, who: { name: 'สุดา มณีวงศ์', age: 29, weight: 50, alg: 'ไม่มี', meds: 'ไม่มี' }, ack: `ลูกค้ารับทราบขั้นตอนและความเสี่ยงแล้ว ฉบับ 1.0 · ${SC.NOW.date} 10:04`, sym: 'ตาแดง แสบตา เป็นมา 1 วัน · ไม่มีขี้ตาเขียว มองเห็นปกติ',
    items: [{ name: 'น้ำตาเทียม', qty: '1 ขวด 10 มล.', how: 'หยอดครั้งละ 1-2 หยด วันละ 3-4 ครั้ง', drug: true, gen: 'Hypromellose', str: '0.3%', ind: 'บรรเทาตาแห้ง ระคายเคืองตา', warn: 'ไม่ใช้ร่วมกับผู้อื่น · ทิ้งหลังเปิด 1 เดือน', lbl: 'น้ำตาเทียม ฉบับ 1' }],
    recv: 'รับที่ร้าน · ตรวจรหัสรับยาแล้ว 10:40', zone: '', bill: 'TW2610181013' },
  'TC-261018-0112': { at: `${SC.NOW.date} 09:24`, who: { name: 'ชาญ ประเสริฐ', age: 61, weight: 0, alg: 'ไม่มี', meds: 'ยาความดัน (ไม่ทราบชื่อ)' }, ack: `ลูกค้ารับทราบขั้นตอนและความเสี่ยงแล้ว ฉบับ 1.0 · ${SC.NOW.date} 09:19`, sym: 'ไข้ ไอ หายใจเหนื่อยขณะพัก',
    items: [], recv: '', zone: '', bill: '', ref: { to: 'โรงพยาบาลใกล้บ้าน (ห้องฉุกเฉิน)', why: 'ไข้ ไอ หายใจเหนื่อยขณะพัก', u: 'now' } }
});
SC.recOf = r => r.snap || snap0()[r.id] || null;
const itemHtml = x => `<li><b>${esc(x.name)}</b> · ${esc(x.qty)}${x.cold ? ` ${ui.tag('เก็บเย็น', 'muted', { icon: 'snowflake' })}` : ''}
  <span class="sub">${x.drug === false ? 'เวชภัณฑ์ ไม่ต้องมีข้อมูลยา' : `ชื่อสามัญ ${esc(x.gen || '-')} · ความแรง ${esc(x.str || '-')} · ข้อบ่งใช้ ${esc(x.ind || '-')}${x.warn ? ` · ข้อควรระวัง ${esc(x.warn)}` : ''}`}</span>
  ${x.how ? `<span class="sub">วิธีใช้ ${esc(x.how)}</span>` : ''}<span class="sub">ฉลาก: ${esc(x.lbl || '-')}</span></li>`;
SC.recSnap = r => {
  const s = SC.recOf(r), ref = r.ref || s?.ref;
  if (!s) return `<div class="mt8">${ui.kv([['ผู้มีอาการ', esc(r.who)], ['ผล', esc(r.res)], ['ยา', r.amt ? 'มีรายการยา ดูในใบสรุป' : 'ไม่ได้จ่ายยา']])}<p class="small mt8">ต้นแบบมีสำเนาเต็มเฉพาะ 5 เคสตัวอย่างและเคสที่ปิดในรอบนี้ · ระบบจริงเก็บทุกเคส</p></div>`;
  return `<div class="mt8">${ui.kv([['ปิดเคส', esc(s.at)], ['ผู้มีอาการ', `${esc(s.who.name)} · ${esc(s.who.age)} ปี · ${s.who.weight ? esc(s.who.weight) + ' กก.' : 'ไม่ได้ระบุน้ำหนัก'}`],
    ['แพ้ยา ณ วันนั้น', esc(s.who.alg)], ['ยาประจำ ณ วันนั้น', esc(s.who.meds)], ['รับทราบขั้นตอน', esc(s.ack)], ['บันทึกอาการ', esc(s.sym || '-')],
    ...(ref ? [['ส่งต่อ', `${esc(ref.to || 'ไปพบแพทย์')} · ${esc(uTxt(ref.u))}${ref.why ? ` · ${esc(ref.why)}` : ''}`]] : [])])}
    <p class="label mt12">ยาที่จ่าย</p>${s.items.length ? `<ul class="rec-it mt4">${s.items.map(itemHtml).join('')}</ul>` : '<p class="small mt4">ไม่ได้จ่ายยา</p>'}
    ${s.recv || s.bill ? `<div class="mt12">${ui.kv([...(s.recv ? [['การส่งยา', esc(s.recv)]] : []), ...(s.zone ? [['เขตส่งยา', esc(s.zone)]] : []), ...(s.bill ? [['เลขบิลหน้าร้าน', `<span class="mono">${esc(s.bill)}</span>`]] : [])])}</div>` : ''}</div>`;
};
/* ---------- corrections: a closed case is never overwritten; a correction is added on top with a reason ---------- */
const FIX_SUBJ = ['บันทึกอาการ', 'คำแนะนำ', 'ยาที่จ่าย', 'ข้อมูลยา', 'การส่งต่อ', 'อื่น ๆ'];
const fixesOf = id => (SC.S.fixes || {})[id] || [];
SC.recFixes = r => { const l = fixesOf(r.id); return l.length ? `<section class="rec-fix"><p class="label">${ic('pencil', 13, 2)} บันทึกแก้ไข (${l.length})</p><ul class="mt8">${l.map(x => `<li><b>${esc(x.subj)}</b> · ${esc(SC.PHARM[x.by].short)} ${esc(x.at)}<span class="sub">ที่ถูกต้อง: ${esc(x.txt)}</span><span class="sub">เหตุผล: ${esc(x.why)}</span></li>`).join('')}</ul><p class="small mt8">ของเดิมยังอยู่ในสำเนา ณ วันปิดเคส · ใบสรุปที่ลูกค้าได้ไม่เปลี่ยน</p></section>` : ''; };
SC.fixModal = r => `<div class="scrim" ${ui.attrs({ st: 'detail', p: { id: r.id } })}></div><div class="modal" role="dialog" aria-modal="true" aria-labelledby="fxT">
  <div class="modal-h"><span class="brand-t">${ic('pencil', 24, 2)}</span><div class="grow"><h2 id="fxT">เพิ่มบันทึกแก้ไข</h2><p>${esc(SC.caseCode(r))} · ปิดเคสแล้ว แก้ทับไม่ได้ ของเดิมยังอยู่</p></div>${ui.ib('x', 'ปิด', { st: 'detail', p: { id: r.id } })}</div>
  <div class="modal-b">${ui.field({ id: 'fxS', label: 'แก้เรื่องอะไร', select: FIX_SUBJ, value: FIX_SUBJ[0], req: true })}
    <div class="mt12">${ui.field({ id: 'fxT2', label: 'ข้อความที่ถูกต้อง', textarea: true, rows: 3, req: true, max: 500, focus: true })}</div>
    <div class="mt12">${ui.field({ id: 'fxW', label: 'เหตุผลที่แก้', req: true, max: 200, ph: 'เช่น พิมพ์ความแรงผิด' })}</div>
    <p class="small mt12">${ic('lock', 13, 2)} บันทึกในชื่อ ${esc(SC.me().short)} เวลา ${esc(SC.clockStr())} · ลบไม่ได้ · ใบสรุปที่ลูกค้าได้ไม่เปลี่ยน ถ้าต้องแจ้งลูกค้าให้ส่งข้อความในแอป</p></div>
  <div class="modal-f">${ui.btn('ยกเลิก', { kind: 'secondary', st: 'detail', p: { id: r.id } })}${ui.btn('บันทึกแก้ไข', { a: 'fixSave', v: r.id, icon: 'check' })}</div></div>`;
SC.act('fixSave', t => {
  const id = t.dataset.v, s = $('#fxS'), x = $('#fxT2'), w = $('#fxW');
  for (const [el, m] of [[x, 'ใส่ข้อความที่ถูกต้อง'], [w, 'ใส่เหตุผลที่แก้']]) if (!el.value.trim()) { el.closest('.field').classList.add('err'); el.focus(); return SC.toast(m, 'info'); }
  const S = SC.S; S.fixes = S.fixes || {};
  S.fixes[id] = [...fixesOf(id), { by: S.me, at: `${SC.NOW.date} ${SC.clockStr()}`, subj: s.value, txt: x.value.trim(), why: w.value.trim() }];
  SC.logEv('fix', `เพิ่มบันทึกแก้ไข: ${s.value}`, id);
  SC.setSt('detail', { p: { id } }); SC.toast('บันทึกแก้ไขแล้ว ของเดิมยังอยู่', 'check');
});
/* ---------- who opened, printed, exported or changed this case ---------- */
SC.recAccess = r => {
  /* the same rows S504 shows (seeded day + this session), so both lists agree (real-user test 21/10) */
  const l = [...seed(), ...(SC.S.audit || [])].filter(x => x.ref === r.id).sort((a, b) => a.t < b.t ? 1 : -1);
  return `<div><p class="label">การเข้าถึงเคสนี้</p><ul class="audit mt8">${l.map(x => `<li><span class="num">${esc(x.d)} ${esc(x.t)}</span> ${esc(SC.PHARM[x.by]?.short || x.by)} ${esc(x.what)}</li>`).join('')}<li><span class="num">${esc(r.d)} ${esc(r.t)}</span> ${esc(SC.PHARM[r.ph].short)} รับเคส</li></ul></div>`;
};

/* ---------- S407 full record for an inspector ---------- */
const dmy = s => { const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(s || '').trim()), d = m && new Date(+m[3], +m[2] - 1, +m[1]); return d && d.getDate() === +m[1] && d.getMonth() === +m[2] - 1 ? d : null; };
const NOWD = () => dmy(SC.NOW.date);
const RANGE = [['30d', '30 วัน', 30], ['90d', '90 วัน', 90], ['1y', '1 ปี', 365], ['day', 'เลือกช่วงวันที่']];
const brOf = () => SC.isAdmin() ? (SC.S.auB ? [SC.S.auB] : SC.BRANCHES.map(b => b.id)) : [SC.S.branch];
const rowsAll = () => brOf().flatMap(b => SC.logAll(b).map(r => ({ ...r, br: b }))).filter(r => r.res !== 'กำลังปรึกษา');
function inRange(r) {
  const S = SC.S, d = dmy(r.d), n = NOWD();
  if (S.auR === 'day') { const a = dmy(S.auFrom), b = dmy(S.auTo); return a && b && d >= a && d <= b; }
  return (n - d) / 864e5 <= (RANGE.find(x => x[0] === (S.auR || '30d')) || RANGE[0])[2];
}
const tooOld = () => SC.S.auR === 'day' && dmy(SC.S.auFrom) && (NOWD() - dmy(SC.S.auFrom)) / 864e5 > 365;
const rows = () => rowsAll().filter(r => inRange(r) && (!SC.S.auPh || r.ph === SC.S.auPh));
const findRow = id => rowsAll().find(r => r.id === id);
const sumOf = r => r.doc || SC.SUM[r.id];
/* read-only transcript kept with the record (sample text built from the summary; never the customer's name) */
SC.recChat = r => {
  const s = sumOf(r), ph = SC.PHARM[r.ph] || SC.PHARM.kj, e = ph.male ? 'ครับ' : 'ค่ะ', t0 = SC.toMin(r.t), at = n => SC.hhmm(t0 + n);
  const adv = s ? s.adv : [], m = [['sys', at(0), `${ph.short} รับเคส · ${r.id}`], ['cu', at(0), `แจ้งอาการ: ${s ? s.sym : 'ตามบันทึกเคส'}`],
    ['ph', at(1), `สวัสดี${e} เภสัชกร${ph.first}ดูแลเคสนี้${e}`], ...adv.map((x, i) => ['ph', at(3 + i), x]),
    ['cu', at(4 + adv.length), 'ขอบคุณค่ะ'], ['sys', at(5 + adv.length), 'ปิดเคส · ส่งใบสรุปให้ลูกค้าแล้ว']];
  return `<ol class="rec-chat mt8">${m.map(([w, t, x]) => `<li class="${w}"><span class="num">${esc(t)}</span><b>${w === 'sys' ? 'ระบบ' : w === 'ph' ? esc(ph.short) : 'ลูกค้า'}</b><span>${esc(x)}</span></li>`).join('')}</ol>`;
};
SC.recView = r => {
  const b = SC.branch(r.br || SC.S.branch), s = sumOf(r);
  return `<div class="gap16">${ui.kv([['เคส', `<span class="mono">${esc(SC.caseCode(r))}</span>`], ['วันที่', `${esc(r.d)} ${esc(r.t)}${r.dur ? ' · ' + esc(r.dur) : ''}`], ['ช่องทาง', ui.mode(/วิดีโอ|video/.test(r.mode) ? 'video' : 'chat')],
      ['สาขา', `${esc(b.name)} · ใบอนุญาต ${esc(b.lic)}`], ['เภสัชกร', `${esc(SC.PHARM[r.ph].name)} · ${esc(SC.PHARM[r.ph].lic)}`], ['ผล', esc(r.res)]])}
    <section><p class="label">สำเนาบันทึก ณ วันปิดเคส</p>${SC.recSnap(r)}</section>
    ${s ? `<section><p class="label">ใบสรุปที่ลูกค้าได้รับ</p><article class="doc sm mt8"><h4>อาการที่แจ้ง</h4><p>${esc(s.sym)}</p><h4>คำแนะนำ</h4><ul>${s.adv.map(x => `<li>${esc(x)}</li>`).join('')}</ul><div class="doc-warn"><h4>${ic('octagon-alert', 15, 2)}ไปพบแพทย์ทันทีถ้า</h4><ul>${s.warn.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></article></section>` : ''}
    <section><p class="label">บทสนทนา</p><p class="small mt4">อ่านอย่างเดียว · เก็บ 1 ปีนับจากวันปิดเคส · ไม่มีการบันทึกวิดีโอ</p>${SC.recChat(r)}</section>
    ${SC.recFixes(r)}${SC.recAccess(r)}</div>`;
};
const phSel = () => `<label class="sr" for="auPh">เภสัชกร</label><select id="auPh" class="input au-sel">${[['', 'เภสัชกรทุกคน'], ...Object.values(SC.PHARM).filter(p => !p.admin && p.role !== 'staff').map(p => [p.id, p.short])].map(([v, l]) => `<option value="${v}"${v === (SC.S.auPh || '') ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
const brSel = () => SC.isAdmin() ? `<label class="sr" for="auB">สาขา</label><select id="auB" class="input au-sel">${[['', 'ทุกสาขา'], ...SC.BRANCHES.map(b => [b.id, b.short])].map(([v, l]) => `<option value="${v}"${v === (SC.S.auB || '') ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>` : '';
const stNow = () => tooOld() ? 'old' : rows().length ? 'list' : 'none';
SC.screen('audit', {
  code: 'S407', group: 4, title: 'ตรวจสอบย้อนหลัง', nav: () => SC.isAdmin() ? 'audit' : 'log',
  states: [['list', 'รายการ 30 วัน', { cust: [] }], ['detail', 'บันทึกเต็มของเคส', { back: 'list', cust: [['summary', 'normal', 'ใบสรุปเดียวกับที่ลูกค้าเห็น']] }], ['print', 'ดูก่อนพิมพ์', { back: 'detail', cust: [] }],
    ['none', 'ช่วงวันที่ไม่มีเคส', { cust: [] }], ['old', 'เกิน 1 ปี', { cust: [] }]],
  cust: [],
  notes: ['เจ้าของ 20/10 (B7 ห้องรีวิว อย.): "ต้องเก็บ log ด้วย" · จอสำหรับตอนเจ้าหน้าที่มาตรวจ ค้นย้อนหลังได้ 1 ปี ตามช่วงวันที่และเภสัชกร · อ่านอย่างเดียว แก้อะไรไม่ได้',
    'บันทึกเต็มของเคส = ข้อมูลเคส สาขาพร้อมเลขใบอนุญาต เภสัชกรพร้อมเลขใบประกอบวิชาชีพ สำเนา ณ วันปิดเคส ใบสรุปที่ลูกค้าได้ บันทึกแก้ไข และการเข้าถึง',
    'มีกล่อง "เขตส่งยา" บอกว่าล็อกอยู่ไหม และประวัติการเปลี่ยนทั้งหมด (อ่านอย่างเดียว) ให้เจ้าหน้าที่เห็น',
    'พิมพ์และส่งออกได้ทีละเคสหรือทั้งรายการ · ไฟล์มีข้อมูลส่วนตัวของลูกค้า ทุกครั้งถูกบันทึกว่าใครทำ (ขึ้นใน S504)',
    'เภสัชกรเห็นเฉพาะเคสของสาขาที่ประจำ · ผู้ดูแลระบบเลือกสาขาได้ · พนักงานร้านเปิดไม่ได้ · เกิน 1 ปีลบตามระยะเก็บ'],
  wait: ['ใครเปิดจอตรวจสอบย้อนหลังได้ (ตอนนี้: เภสัชกรเห็นเฉพาะสาขาตัวเอง ผู้ดูแลระบบเห็นทุกสาขา พนักงานร้านเปิดไม่ได้)'],
  head: () => ({ title: 'ตรวจสอบย้อนหลัง', sub: `${SC.isAdmin() ? 'ผู้ดูแลระบบ · ทุกสาขา' : SC.branch().name} · สำหรับเจ้าหน้าที่ตรวจ · อ่านอย่างเดียว` }),
  prep(S, st, p) {
    if (S._reseed || !S.auR) { S.auR = ['none', 'old'].includes(st) ? 'day' : '30d'; S.auFrom = st === 'old' ? '01/09/2025' : '01/10/2026'; S.auTo = st === 'old' ? '30/09/2025' : '01/10/2026'; S.auPh = ''; S.auB = ''; }
    /* a case of another branch never opens here; the first case this user can see stands in */
    if (st === 'detail' || st === 'print') { if (!findRow(p.id)) p.id = (findRow('TC-261016-0058') || rowsAll()[0])?.id; if (p.id) SC.logEv('case', 'เปิดบันทึกเต็มสำหรับตรวจ', p.id); }
  },
  render(ctx) {
    const S = SC.S, R = S.auR || '30d', list = rows();
    const bar = `<section class="card au-bar">${ui.seg(RANGE.map(([v, l]) => [v, l]), R, { a: 'auR', label: 'ช่วงเวลา' })}
      ${R === 'day' ? `<span class="au-day"><label class="sr" for="auFrom">ตั้งแต่วันที่</label><input id="auFrom" class="input rs-day" value="${esc(S.auFrom)}" placeholder="วว/ดด/ปปปป" maxlength="10" inputmode="numeric"><span class="small">ถึง</span><label class="sr" for="auTo">ถึงวันที่</label><input id="auTo" class="input rs-day" value="${esc(S.auTo)}" placeholder="วว/ดด/ปปปป" maxlength="10" inputmode="numeric">${ui.btn('ดู', { kind: 'secondary', sm: true, a: 'auDay', icon: 'search' })}</span>` : ''}
      ${phSel()}${brSel()}<span class="sp"></span>${list.length && !tooOld() ? ui.btn(`ส่งออกรายการ ${list.length} เคส`, { kind: 'ghost', sm: true, a: 'auExp', v: 'list', icon: 'download' }) : ''}</section>`;
    const zn = `<section class="card mt16 au-zone"><div class="hrow wrap"><p class="label">เขตส่งยา</p>${SC.zoneLocked() ? ui.tag('ล็อกอยู่', 'ok', { icon: 'map-pin' }) : ui.tag('ปลดล็อกอยู่', 'warn', { icon: 'map-pin' })}<span class="sp"></span><span class="small">${SC.zoneLocked() ? 'ไม่เกิน 15 กม. จากสาขา ทุกที่อยู่ รวมกรุงเทพฯ' : 'บังคับเฉพาะส่งด่วน Lalamove ไม่เกิน 15 กม.'}</span></div><details class="mt8"><summary>ประวัติการเปลี่ยน (${SC.zoneLog ? SC.zoneLog().length : 1})</summary>${SC.zoneLogHtml ? SC.zoneLogHtml() : ''}</details></section>`;
    if (tooOld()) return bar + zn + `<div class="mt16">${ui.note(`<b>${esc(S.auFrom)} เกิน 1 ปีแล้ว</b><p>บันทึกเคสเก็บ 1 ปีนับจากวันปิดเคส ข้อมูลก่อน ${esc(SC.NOW.date.slice(0, 6) + (+SC.NOW.date.slice(6) - 1))} ลบตามระยะเก็บแล้ว · เลือกช่วงวันที่ใหม่</p>`, { icon: 'history' })}</div>`;
    if (!list.length) return bar + zn + `<section class="card mt16">${ui.empty({ icon: 'search', title: 'ไม่มีเคสในช่วงนี้', body: 'ลองขยายช่วงวันที่ หรือเลือกเภสัชกรทุกคน', btn: ui.btn('ดู 30 วันล่าสุด', { kind: 'secondary', sm: true, a: 'auR', v: '30d' }) })}</section>`;
    return bar + zn + `<section class="card pad0 mt16"><table class="tbl"><thead><tr><th>เคส</th>${SC.isAdmin() ? '<th>สาขา</th>' : ''}<th>ผู้มีอาการ</th><th>เภสัชกร</th><th>ผล</th><th>สำเนา ณ วันปิด</th></tr></thead><tbody>
      ${list.map(r => { const s = SC.recOf(r); return `<tr class="click" data-st="detail" data-p='{"id":"${r.id}"}' tabindex="0" aria-label="ดูบันทึกเต็ม ${esc(SC.caseCode(r))}"${ctx.p.id === r.id && ctx.st !== 'list' ? ' aria-selected="true"' : ''}><td><span class="mono">${esc(SC.caseCode(r))}</span><span class="sub">${esc(r.d)} ${esc(r.t)}</span></td>${SC.isAdmin() ? `<td>${esc(SC.branch(r.br).short)}</td>` : ''}<td><b>${esc(r.who)}</b></td><td>${esc(SC.PHARM[r.ph].short)}</td><td>${ui.tag(r.res, r.tone)}</td><td>${s ? ui.tag(`ครบ · ยา ${s.items.length} รายการ`, 'ok', { icon: 'check' }) : ui.tag('ย่อ (ต้นแบบ)', 'muted')}</td></tr>`; }).join('')}</tbody></table></section>
      <p class="small mt8">${ic('lock', 13, 2)} อ่านอย่างเดียว · การเปิดดู พิมพ์ และส่งออก ถูกบันทึกทุกครั้ง</p>`;
  },
  overlay(ctx) {
    if (ctx.st !== 'detail' && ctx.st !== 'print') return '';
    const r = findRow(ctx.p.id); if (!r) return '';
    const dr = ui.drawer({ title: `บันทึกเต็ม ${r.id}`, sub: `${r.who} · ${r.d} · อ่านอย่างเดียว`, back: 'list', body: SC.recView(r),
      foot: `${ui.btn('ส่งออกไฟล์', { kind: 'secondary', sm: true, a: 'auExp', v: r.id, icon: 'download' })}<span class="sp"></span>${ui.btn('ดูก่อนพิมพ์', { sm: true, st: 'print', p: { id: r.id }, icon: 'printer' })}` });
    if (ctx.st !== 'print') return dr;
    return dr + `<div class="scrim" ${ui.attrs({ st: 'detail', p: { id: r.id } })}></div><div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="auPT">
      <div class="modal-h"><span class="brand-t">${ic('printer', 24, 2)}</span><div class="grow"><h2 id="auPT">ดูก่อนพิมพ์ บันทึกเต็ม ${esc(SC.caseCode(r))}</h2><p>กระดาษ A4 · มีข้อมูลส่วนตัวของลูกค้า เก็บในที่ปลอดภัย</p></div>${ui.ib('x', 'ปิด', { st: 'detail', p: { id: r.id } })}</div>
      <div class="modal-b"><article class="au-paper"><div class="hrow">${SC.logo({ cls: 'au-logo' })}<span class="sp"></span><span class="small">พิมพ์ ${esc(SC.NOW.date)} ${esc(SC.clockStr())} โดย ${esc(SC.me().short)}</span></div>${SC.recView(r)}</article></div>
      <div class="modal-f">${ui.btn('ปิด', { kind: 'secondary', st: 'detail', p: { id: r.id } })}${ui.btn('พิมพ์', { a: 'auPrint', v: r.id, icon: 'printer' })}</div></div>`;
  },
  mount(el) {
    $('#auPh', el)?.addEventListener('change', e => { SC.S.auPh = e.target.value; SC.setSt(stNow()); });
    $('#auB', el)?.addEventListener('change', e => { SC.S.auB = e.target.value; SC.setSt(stNow()); });
  },
  sims: ({ st }) => [st === 'list' && { label: 'ดูช่วง 1 ปี', run: () => { SC.S.auR = '1y'; SC.setSt('list'); } }]
});
SC.act('auR', t => { SC.S.auR = t.dataset.v; SC.setSt(stNow()); });
SC.act('auDay', () => {
  const a = $('#auFrom'), b = $('#auTo');
  for (const el of [a, b]) if (!dmy(el.value)) { el.classList.add('bad'); el.focus(); return SC.toast('ใส่วันที่เป็น วว/ดด/ปปปป เช่น 01/10/2026', 'info'); }
  if (dmy(a.value) > dmy(b.value)) { b.classList.add('bad'); b.focus(); return SC.toast('วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม', 'info'); }
  if (dmy(b.value) > NOWD()) { b.classList.add('bad'); b.focus(); return SC.toast('ยังไม่ถึงวันนั้น เลือกวันที่ผ่านมาแล้ว', 'info'); }
  Object.assign(SC.S, { auFrom: a.value.trim(), auTo: b.value.trim() }); const s = stNow(); SC.setSt(s);
  if (s === 'none') SC.toast('ไม่มีเคสในช่วงวันที่เลือก ลองเลือกช่วงอื่น', 'info');
});
SC.act('auPrint', async t => { await SC.busy(t, 500); SC.logEv('print', 'พิมพ์บันทึกเต็ม', t.dataset.v); SC.setSt('detail', { p: { id: t.dataset.v } }); SC.toast('จำลอง: ส่งไปเครื่องพิมพ์แล้ว การพิมพ์ถูกบันทึก', 'printer'); });
SC.act('auExp', t => {
  const id = t.dataset.v, all = id === 'list', n = all ? rows().length : 1;
  SC.openOv(() => `<div class="scrim" data-a="ovClose"></div><div class="modal" role="dialog" aria-modal="true" aria-labelledby="axT">
    <div class="modal-h"><span class="brand-t">${ic('download', 24, 2)}</span><div class="grow"><h2 id="axT">ส่งออก${all ? `รายการ ${n} เคส` : `บันทึกเต็ม ${esc(id)}`}</h2><p>ไฟล์ PDF · ${all ? 'เลขเคส วันที่ เภสัชกร ผล และสำเนา ณ วันปิดของทุกเคส' : 'ทุกอย่างในบันทึกเต็มของเคสนี้'}</p></div>${ui.ib('x', 'ปิด', { a: 'ovClose' })}</div>
    <div class="modal-b">${ui.note('<b>ไฟล์มีข้อมูลส่วนตัวของลูกค้า</b><p>ชื่อ อายุ ประวัติแพ้ยา และยาที่ได้รับ · ส่งให้เจ้าหน้าที่ที่มาตรวจเท่านั้น ไม่ส่งต่อทางแชทส่วนตัว · ระบบบันทึกว่าใครส่งออกเมื่อไร</p>', { tone: 'warn' })}</div>
    <div class="modal-f">${ui.btn('ยกเลิก', { kind: 'secondary', a: 'ovClose' })}${ui.btn('ส่งออก PDF', { a: 'auExpGo', v: id, icon: 'download' })}</div></div>`);
});
SC.act('auExpGo', async t => { const id = t.dataset.v; await SC.busy(t, 500); SC.logEv('export', id === 'list' ? `ส่งออกรายการ ${rows().length} เคส` : 'ส่งออกบันทึกเต็ม', id === 'list' ? '' : id); SC.closeOv(); SC.toast('จำลอง: ส่งออกไฟล์แล้ว การส่งออกถูกบันทึก', 'download'); });

/* ---------- S504 access log (admin) ---------- */
const KINDS = [['', 'ทุกเรื่อง'], ['signin', 'เข้าสู่ระบบ'], ['photo', 'รูปเข้ากะ'], ['case', 'เปิดดูเคส'], ['phone', 'ดูเบอร์ลูกค้า'], ['print', 'พิมพ์'], ['export', 'ส่งออก'], ['fix', 'แก้ไขเคส'], ['label', 'แก้ฉลาก'], ['zone', 'เขตส่งยา'], ['move', 'ย้ายสาขา'], ['pharm', 'บัญชีเภสัชกร'], ['take', 'รับและปิดเคส']];
const seed = () => {
  const v = SC.labelsOf?.('101325')[0];
  return [['08:52', 'tp', 'on', 'signin', 'เข้าสู่ระบบ ผ่าน QR ที่ร้าน ห่าง 35 เมตร และ OTP', ''], ['08:52', 'tp', 'on', 'photo', 'ถ่ายรูปเข้ากะ', ''],
    ['08:55', 'kj', 'tw', 'signin', 'เข้าสู่ระบบ ผ่าน QR ที่ร้าน ห่าง 20 เมตร และ OTP', ''], ['08:55', 'kj', 'tw', 'photo', 'ถ่ายรูปเข้ากะ', ''],
    ['09:02', 'admin', '', 'signin', 'เข้าสู่ระบบ ผู้ดูแลระบบ รหัสผ่านและ OTP', ''],
    ...(v ? [['10:12', 'tp', 'on', 'label', `แก้ฉลาก "${v.name}" เป็นฉบับ 2`, v.sku]] : []),
    ['11:02', 'kj', 'tw', 'phone', 'ดูเบอร์ลูกค้า', 'TC-261018-0126'], ['13:05', 'admin', '', 'export', 'ส่งออกบันทึกเต็ม', 'TC-261017-0121'], ['14:02', 'kj', 'tw', 'case', 'เปิดดูเคส', 'TC-261016-0058']]
    .map(([t, by, br, kind, what, ref]) => ({ d: SC.NOW.date, t, by, br, kind, what, ref }));
};
const acRows = () => [...seed(), ...(SC.S.audit || [])].filter(x => x.d === (SC.S.acDay || SC.NOW.date) && (!SC.S.acK || x.kind === SC.S.acK) && (!SC.S.acP || x.by === SC.S.acP)).sort((a, b) => a.t < b.t ? 1 : -1);
const acState = () => acRows().length ? (SC.S.acK || SC.S.acP ? 'person' : 'all') : 'none';
const sel = (id, label, list, val) => `<label class="sr" for="${id}">${label}</label><select id="${id}" class="input au-sel">${list.map(([v, l]) => `<option value="${v}"${v === (val || '') ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
SC.screen('access', {
  code: 'S504', group: 5, admin: true, title: 'บันทึกการเข้าถึง', nav: 'access',
  states: [['all', 'ทั้งหมดวันนี้', { cust: [] }], ['person', 'กรองรายคน', { cust: [] }], ['none', 'ไม่พบรายการ', { cust: [] }], ['zone', 'เปลี่ยนเขตส่งยา', { cust: [] }]],
  cust: [],
  notes: ['เจ้าของ 20/10: สวิตช์ล็อกเขตส่งยา ทุกการเปลี่ยน (ใคร เมื่อไร ล็อกหรือปลดล็อก เหตุผล) และพัสดุที่ส่งนอกเขตตอนปลดล็อก ขึ้นในบันทึกนี้ เรื่อง "เขตส่งยา"',
    'เจ้าของ 20/10 (B14 ห้องรีวิว อย.): "ต้องเก็บ log ด้วย" · ใครเปิดดูเคส ดูเบอร์ลูกค้า พิมพ์ ส่งออก แก้ไขเคส แก้ฉลาก รายงาน อย. เข้าสู่ระบบ และถ่ายรูปเข้ากะ · เก็บ 1 ปี ไม่มีใครแก้หรือลบได้ รวมผู้ดูแลระบบ',
    'แสดงเลขเคสหรือรหัสสินค้าเท่านั้น ไม่แสดงชื่อหรือเบอร์ลูกค้า (ข้อมูลส่วนตัว) · ดูรายละเอียดเคสได้ที่จอตรวจสอบย้อนหลัง S407 ซึ่งก็ถูกบันทึกเช่นกัน',
    'สิ่งที่ทำในรอบนี้ (เปิดเคส ดูเบอร์ ถ่ายรูปเข้ากะ แก้ฉลาก ส่งออก) ขึ้นในตารางทันที'],
  wait: ['ใครเปิดบันทึกการเข้าถึงได้ (ตอนนี้: ผู้ดูแลระบบเท่านั้น)'],
  head: () => ({ title: 'บันทึกการเข้าถึง', sub: `ผู้ดูแลระบบ · ${SC.NOW.date} · เก็บ 1 ปี แก้หรือลบไม่ได้` }),
  prep(S, st) {
    if (!S._reseed) return;
    S.acK = st === 'zone' ? 'zone' : ''; S.acP = st === 'person' ? 'kj' : st === 'none' ? 'pc' : '';
    if (st === 'zone') S.audit = [...(S.audit || []), { d: SC.NOW.date, t: '10:30', by: 'admin', br: '', kind: 'zone', what: 'ปลดล็อกเขตส่งยา · หนังสือ อย. ที่ สธ 1011/0000 (ตัวอย่าง)', ref: '' }, { d: SC.NOW.date, t: '11:40', by: 'tw', br: 'tw', kind: 'zone', what: `ส่งพัสดุ${SC.OUT_TAG} เชียงใหม่ 690 กม.`, ref: 'MT8V3QW2K7D' }, { d: SC.NOW.date, t: '13:15', by: 'admin', br: '', kind: 'zone', what: 'ล็อกเขตส่งยากลับ', ref: '' }].map(x => x.by === 'tw' ? { ...x, by: 'kj' } : x);
  },
  render(ctx) {
    const S = SC.S, l = acRows();
    return `<section class="card au-bar">${sel('acK', 'เรื่อง', KINDS, S.acK)}${sel('acP', 'ใคร', [['', 'ทุกคน'], ...Object.values(SC.PHARM).map(p => [p.id, p.short])], S.acP)}<span class="au-day"><label class="sr" for="acDay">วันที่</label><input id="acDay" class="input rs-day" value="${esc(S.acDay || SC.NOW.date)}" placeholder="วว/ดด/ปปปป" maxlength="10" inputmode="numeric">${ui.btn('ดู', { kind: 'secondary', sm: true, a: 'acDay', icon: 'search' })}</span><span class="sp"></span><span class="small">ย้อนหลังได้ 1 ปี · ต้นแบบมีตัวอย่างเฉพาะวันที่ ${esc(SC.NOW.date)}</span></section>
      ${l.length ? `<section class="card pad0 mt16"><table class="tbl"><thead><tr><th>เวลา</th><th>ใคร</th><th>สาขา</th><th>ทำอะไร</th><th>เลขอ้างอิง</th></tr></thead><tbody>${l.map(x => { const p = SC.PHARM[x.by] || { short: x.by, lic: '' }; return `<tr><td class="num">${esc(x.t)}</td><td><b>${esc(p.short)}</b><span class="sub">${esc(p.lic)}</span></td><td>${x.br ? esc(SC.branch(x.br).short) : 'ทุกสาขา'}</td><td>${ui.tag((KINDS.find(k => k[0] === x.kind) || [, x.kind])[1], 'muted')} ${esc(x.what)}</td><td>${x.ref ? `<span class="mono">${esc(x.ref)}</span>` : '-'}</td></tr>`; }).join('')}</tbody></table></section>`
        : `<section class="card mt16">${ui.empty({ icon: 'shield-check', title: 'ไม่พบรายการ', body: SC.S.acDay && SC.S.acDay !== SC.NOW.date ? `ไม่มีบันทึกวันที่ ${SC.S.acDay} ลองเลือกวันอื่น` : 'คนนี้ยังไม่มีการเข้าถึงวันนี้ ลองเลือกทุกคน', btn: ui.btn('ดูทั้งหมด', { kind: 'secondary', sm: true, a: 'acAll' }) })}</section>`}
      <p class="small mt8">${ic('lock', 13, 2)} ไม่แสดงชื่อหรือเบอร์ลูกค้า · บันทึกนี้แก้หรือลบไม่ได้</p>`;
  },
  mount(el) {
    $('#acK', el)?.addEventListener('change', e => { SC.S.acK = e.target.value; SC.setSt(acState()); });
    $('#acP', el)?.addEventListener('change', e => { SC.S.acP = e.target.value; SC.setSt(acState()); });
  }
});
SC.act('acDay', () => {
  const a = $('#acDay'), d = dmy(a.value), now = NOWD();
  if (!d) { a.classList.add('bad'); a.focus(); return SC.toast('ใส่วันที่เป็น วว/ดด/ปปปป เช่น 01/10/2026', 'info'); }
  if (d > now) { a.classList.add('bad'); a.focus(); return SC.toast('ยังไม่ถึงวันนั้น เลือกวันที่ผ่านมาแล้ว', 'info'); }
  if ((now - d) / 864e5 > 365) { a.classList.add('bad'); a.focus(); return SC.toast('ดูย้อนหลังได้ 1 ปี เลือกวันที่ใหม่กว่านี้', 'info'); }
  SC.S.acDay = a.value.trim(); SC.setSt(acState());
  if (acState() === 'none') SC.toast(`ไม่มีบันทึกวันที่ ${SC.S.acDay}`, 'info');
});
SC.act('acAll', () => { SC.S.acK = ''; SC.S.acP = ''; SC.setSt('all'); });
})();

/* ===== 76-pharm.js ===== */
/* =====================================================================
   76 · S503 pharmacists and licences (FDA review B11, 20/10/2026): one row per pharmacist with branch, licence no.,
        when it was last checked against the Pharmacy Council register, expiry, telepharmacy training evidence, photo
        and account open or closed. Closing an account needs a reason and goes into the access log (S504). Mock data
   ===================================================================== */
(() => {
const { $, esc, ic, ui } = SC;
/* sample dates and files only. The real ones are checked by hand against the council register (no link to it yet) */
const LIC = {
  kj: { chk: '01/10/2026', exp: '31/12/2028', train: '12/03/2026', file: 'ใบรับรองอบรม-ขวัญใจ.pdf' },
  tp: { chk: '01/10/2026', exp: '30/11/2027', train: '05/02/2026', file: 'ใบรับรองอบรม-ธัชพล.pdf' },
  pc: { chk: '01/10/2026', exp: '31/03/2029', train: '', file: '' }
};
const WARN_DAYS = 60;
const day = s => { const [d, m, y] = String(s).split('/').map(Number); return Date.UTC(y, m - 1, d); };
const left = s => Math.round((day(s) - day(SC.NOW.date)) / 864e5);
const list = () => Object.values(SC.PHARM).filter(p => !p.admin && p.role !== 'staff');
const lic = id => ({ ...LIC[id], ...(SC.S.phLic?.[id] || {}) });
const shut = id => SC.S.phClosed?.[id];
const expTag = s => { const n = left(s); return n < 0 ? ui.tag('หมดอายุแล้ว', 'danger', { icon: 'circle-x' }) : n <= WARN_DAYS ? ui.tag(`หมดอายุใน ${n} วัน`, 'warn', { icon: 'triangle-alert' }) : ''; };

SC.screen('pharm', {
  code: 'S503', group: 5, admin: true, title: 'เภสัชกรและใบอนุญาต', nav: 'pharm',
  states: [['list', 'ทั้งหมด', { cust: [] }], ['expiring', 'ใบอนุญาตใกล้หมดอายุ', { cust: [] }],
    ['closeask', 'ปิดบัญชี: ยืนยันและใส่เหตุผล', { back: () => 'list', cust: [] }], ['closed', 'ปิดบัญชีแล้ว', { cust: [] }]],
  cust: [],
  notes: ['ห้องรีวิว อย. 20/10 (B11): ทะเบียนเภสัชกรที่ให้บริการทางไกล แยกตามสาขา เลขใบอนุญาต วันที่ตรวจกับทะเบียนสภาเภสัชกรรม วันหมดอายุ หลักฐานอบรม รูป และสถานะบัญชี',
    'วันที่และไฟล์ในจอนี้เป็นตัวอย่าง · ยังไม่มีระบบเชื่อมทะเบียนสภาเภสัชกรรม ผู้ดูแลระบบตรวจเองแล้วกด "ตรวจแล้ววันนี้"',
    `ใบอนุญาตเหลือไม่เกิน ${WARN_DAYS} วัน ขึ้นป้ายเตือนและแถบบนจอ · ยังไม่ได้ปิดรับเคสให้เอง (รอเจ้าของเคาะ)`,
    'ปิดบัญชี: ต้องใส่เหตุผลและยืนยันก่อน · เข้าสู่ระบบไม่ได้ทันที · ประวัติเคสเดิมอยู่ครบ · ทุกการเปิดปิดบัญชี การตรวจใบอนุญาต และการแนบหลักฐาน ขึ้นในบันทึกการเข้าถึง S504 เรื่อง "บัญชีเภสัชกร" เก็บ 1 ปี',
    'เรื่องที่ต้องให้เจ้าของตรวจก่อนสร้างจริง (สิทธิ์และบทบาทผู้ใช้): ใครเปิดหรือปิดบัญชีได้ และปิดแล้วมีผลกับอะไรบ้าง',
    'พนักงานร้านไม่อยู่ในจอนี้ เพราะไม่มีใบอนุญาต'],
  wait: ['ใครเปิดหรือปิดบัญชีเภสัชกรได้ (ตอนนี้: ผู้ดูแลระบบเท่านั้น)', 'ใบอนุญาตหมดอายุแล้ว ให้ระบบปิดรับเคสของคนนั้นเองไหม', 'ยังไม่มีหลักฐานอบรม รับเคสทางไกลได้ไหม'],
  head: () => ({ title: 'เภสัชกรและใบอนุญาต', sub: `ผู้ดูแลระบบ · ${SC.NOW.date} · ตรวจกับทะเบียนสภาเภสัชกรรม` }),
  prep(S, st, p) {
    if (st === 'closeask' && !p.k) p.k = 'pc';
    if (!S._reseed) return;
    S.phLic = st === 'expiring' ? { tp: { exp: '30/11/2026' } } : {};
    S.phClosed = st === 'closed' ? { pc: { at: '18/10/2026 09:10', by: 'admin', why: 'ลาออก มีผล 17/10/2026' } } : {};
  },
  render() {
    const rows = list().map(p => {
      const l = lic(p.id), c = shut(p.id), b = SC.branch(p.home);
      return `<tr${c ? ' class="quiet"' : ''}><td><div class="ph-who">${SC.shotImg({ reg: true }, 'sm')}<span><b>${esc(p.name)}</b><span class="sub">พนักงาน ${esc(p.staff)}</span></span></div></td>
        <td>${esc(b.name)}</td>
        <td class="num"><b>${esc(p.lic)}</b><span class="sub">ตรวจกับสภาฯ ${esc(l.chk)}</span></td>
        <td class="num">${esc(l.exp)}${expTag(l.exp) ? `<span class="sub">${expTag(l.exp)}</span>` : ''}</td>
        <td>${l.file ? `${ui.tag('มีหลักฐาน', 'ok', { icon: 'circle-check' })}<span class="sub">อบรม ${esc(l.train)} · ${esc(l.file)}</span>` : `${ui.tag('ยังไม่มีหลักฐาน', 'warn', { icon: 'triangle-alert' })}<span class="sub">${ui.btn('แนบหลักฐาน', { kind: 'ghost', sm: true, a: 'phFile', v: p.id, icon: 'file-text' })}</span>`}</td>
        <td>${c ? `${ui.tag('ปิดบัญชีแล้ว', 'danger', { icon: 'lock' })}<span class="sub">${esc(c.at)} โดย ${esc(SC.PHARM[c.by]?.short || c.by)} · ${esc(c.why)}</span>` : ui.tag('เปิดใช้งาน', 'ok', { dot: true })}</td>
        <td class="r"><div class="ph-act">${c ? ui.btn('เปิดบัญชีอีกครั้ง', { kind: 'secondary', sm: true, a: 'phOpen', v: p.id, icon: 'user-check' })
          : `${ui.btn('ตรวจแล้ววันนี้', { kind: 'secondary', sm: true, a: 'phChk', v: p.id, icon: 'badge-check' })}${ui.btn('ปิดบัญชี', { kind: 'ghost', sm: true, st: 'closeask', p: { k: p.id }, icon: 'lock' })}`}</div></td></tr>`;
    }).join('');
    const soon = list().filter(p => !shut(p.id) && left(lic(p.id).exp) <= WARN_DAYS);
    return `${soon.length ? ui.note(`<b>ใบอนุญาตใกล้หมดอายุ ${soon.length} คน</b><p>${soon.map(p => `${esc(p.short)} ${esc(p.lic)} หมดอายุ ${esc(lic(p.id).exp)}`).join(' · ')} · ต่ออายุแล้วแก้วันหมดอายุและตรวจกับสภาฯ อีกครั้ง</p>`, { tone: 'warn' }) : ''}
      <section class="card pad0${soon.length ? ' mt16' : ''}"><div class="card-h qb-h"><h3>เภสัชกรที่ให้บริการทางไกล</h3><span class="sp"></span><span class="small">${list().length} คน · ${SC.BRANCHES.length} สาขา</span></div>
        <div class="ph-tw"><table class="tbl"><thead><tr><th>เภสัชกร</th><th>สาขา</th><th>เลขใบอนุญาต</th><th>หมดอายุ</th><th>อบรมเภสัชกรรมทางไกล</th><th>บัญชี</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></section>
      <p class="small mt8">${ic('lock', 13, 2)} ทุกการตรวจ แนบหลักฐาน และเปิดปิดบัญชี ถูกบันทึกในบันทึกการเข้าถึง เก็บ 1 ปี</p>`;
  },
  overlay(ctx) {
    if (ctx.st !== 'closeask') return '';
    const p = SC.PHARM[ctx.p.k] || SC.PHARM.pc, on = SC.duty(p.home)?.id === p.id;
    return ui.modal({ title: `ปิดบัญชี ${p.short}`, sub: `${p.lic} · ${SC.branch(p.home).name}`, icon: 'lock', tone: 'danger', back: 'list',
      body: `${on ? ui.note(`<b>${esc(p.short)} ประจำ${esc(SC.branch(p.home).name)}อยู่ตอนนี้</b><p>ปิดแล้วออกจากระบบทันที สาขานี้ไม่มีเภสัชกรประจำจนกว่าจะมีคนเข้าสู่ระบบรับกะต่อ</p>`, { tone: 'warn' }) : ''}
        <ul class="zn-eff${on ? ' mt12' : ''}"><li>เข้าสู่ระบบไม่ได้ทันที</li><li>ประวัติเคสเดิมอยู่ครบ ดูย้อนหลังได้</li><li>เปิดบัญชีอีกครั้งได้ที่จอนี้</li></ul>
        <div class="mt16">${ui.field({ id: 'phWhy', label: 'เหตุผล (บันทึกในระบบ)', req: true, max: 120, ph: 'เช่น ลาออก มีผล 31/10/2026' })}</div>`,
      foot: `${ui.btn('ยกเลิก', { kind: 'secondary', st: 'list' })}${ui.btn('ปิดบัญชี', { kind: 'danger', a: 'phClose', v: p.id, icon: 'lock' })}` });
  }
});
const log = (what, id) => SC.logEv('pharm', what, SC.PHARM[id].lic);
SC.act('phClose', async t => {
  const w = $('#phWhy'), id = t.dataset.v, p = SC.PHARM[id];
  if (!w.value.trim()) { w.closest('.field').classList.add('err'); w.focus(); return SC.toast('ใส่เหตุผลก่อนปิดบัญชี', 'info'); }
  await SC.busy(t, 600);
  const S = SC.S, why = w.value.trim();
  S.phClosed = { ...(S.phClosed || {}), [id]: { at: `${SC.NOW.date} ${SC.clockStr()}`, by: S.me, why } };
  log(`ปิดบัญชี ${p.short} · ${why}`, id);
  SC.go('pharm', { st: 'closed' }); SC.toast(`ปิดบัญชี ${p.short} แล้ว · เข้าสู่ระบบไม่ได้`, 'lock');
});
SC.act('phOpen', t => {
  const S = SC.S, id = t.dataset.v, p = SC.PHARM[id], c = { ...(S.phClosed || {}) };
  delete c[id]; S.phClosed = c; log(`เปิดบัญชี ${p.short} อีกครั้ง`, id);
  SC.go('pharm', { st: 'list' }); SC.toast(`เปิดบัญชี ${p.short} แล้ว`, 'user-check');
});
SC.act('phChk', async t => {
  const S = SC.S, id = t.dataset.v, p = SC.PHARM[id];
  await SC.busy(t, 400);
  S.phLic = { ...(S.phLic || {}), [id]: { ...(S.phLic?.[id] || {}), chk: SC.NOW.date } }; log(`ตรวจใบอนุญาต ${p.lic} กับทะเบียนสภาเภสัชกรรม`, id);
  SC.refresh(); SC.toast(`บันทึกแล้ว ตรวจใบอนุญาต ${p.lic} วันนี้`, 'badge-check');
});
SC.act('phFile', async t => {
  const S = SC.S, id = t.dataset.v, p = SC.PHARM[id];
  await SC.busy(t, 500);
  S.phLic = { ...(S.phLic || {}), [id]: { ...(S.phLic?.[id] || {}), train: SC.NOW.date, file: `ใบรับรองอบรม-${p.first}.pdf` } }; log(`แนบหลักฐานอบรมของ ${p.short}`, id);
  SC.refresh(); SC.toast('แนบหลักฐานอบรมแล้ว', 'file-text');
});
})();

/* ===== 80-settings.js ===== */
/* =====================================================================
   80 · Group 5 ตั้งค่าร้าน (superadmin only, owner 20/10/2026: "S501 502 อาจจะไม่ต้องให้สาขาเห็น เฉพาะ admin"):
        S501 branches, opening hours, intake per branch and the system-wide temporary off switch
        · S502 who is on duty per branch, read from who signed in ("502 ขึ้นกับ login ว่าเภสัชคนไหนล้อคอิน")
   ===================================================================== */
(() => {
const { $, esc, ic, ui } = SC;
const intakeTag = v => SC.S.sysOff ? ui.tag('ปิดระบบอยู่', 'danger', { icon: 'power' }) : v === 'open' ? ui.tag('เปิดรับ', 'ok', { dot: true, live: true }) : v === 'pause' ? ui.tag('พักชั่วคราว', 'warn', { icon: 'circle-pause' }) : ui.tag('ปิดรับวันนี้', 'muted', { icon: 'ban' });
const SYS_WHY = ['ระบบวิดีโอขัดข้อง', 'เน็ตของร้านมีปัญหา', 'เภสัชกรไม่พอ', 'เหตุอื่น'];
const SYS_MSG = 'ขออภัย ตอนนี้ปิดรับปรึกษาชั่วคราว ฝากคำถามไว้ได้ เภสัชกรจะตอบเมื่อเปิดระบบอีกครั้ง';
/* QA3-09: S501 saves into the story state (S.brSet) and SC.BRANCHES reads it back, so the new hours and phone show on every
   screen at once (S102, S202 decline message, S203, S502, labels). A review-panel jump starts a fresh story with the defaults */
SC.BRANCHES.forEach(b => { const base = { hours: b.hours, phone: b.phone }; ['hours', 'phone'].forEach(k => Object.defineProperty(b, k, { enumerable: true, configurable: true, get: () => SC.S.brSet?.[b.id]?.[k] ?? base[k] })); });
const DAYS = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];
const daysOf = b => SC.S.brSet?.[b.id]?.days || DAYS;
const daysTxt = d => d.length === DAYS.length ? 'ทุกวัน' : `เฉพาะ ${d.join(' ')}`;
/* Thai number as the store types it: starts with 0, 9-10 digits, dashes allowed between digits (082-053-9915, 02-123-4567) */
const phoneOk = v => /^0\d*(-\d+)*$/.test(v) && /^\d{9,10}$/.test(v.replace(/-/g, ''));
function brCard(b, S, st, editId) {
  const v = S.intake[b.id], d = SC.duty(b.id), edit = (st === 'edit' || st === 'error') && editId === b.id;
  const dr = S.hrDraft?.b === b.id ? S.hrDraft : null, [ho, hc] = b.hours.split('-'), on = dr ? dr.days : daysOf(b);
  return `<section class="card st-br">
    <div class="hrow wrap"><span class="brand-t">${ic('store', 20, 1.9)}</span><h2 class="h3">${esc(b.name)}</h2>${d ? intakeTag(v) : ui.tag('ไม่มีเภสัชกรประจำ', 'danger', { icon: 'user' })}<span class="sp"></span>${b.id === S.branch ? '<span class="small">สาขาที่ดูอยู่</span>' : ''}</div>
    ${edit ? `<div class="st-form mt16">
        <div class="st-two">${ui.field({ id: 'hOpen', label: 'เปิดรับปรึกษา', type: 'time', value: dr ? dr.open : ho, req: true, error: dr?.eOpen, focus: !!dr?.eOpen })}${ui.field({ id: 'hClose', label: 'ปิดรับปรึกษา', type: 'time', value: dr ? dr.close : hc, req: true, error: dr?.eClose, focus: !dr?.eOpen && !!dr?.eClose, hint: 'คิวสุดท้ายรับได้ถึงเวลานี้ เคสที่เปิดอยู่คุยต่อได้จนจบ' })}</div>
        <p class="label mt12" id="hDaysL">วันที่เปิดรับ</p><div class="chips mt8" role="group" aria-labelledby="hDaysL">${DAYS.map(x => `<button type="button" class="chip" data-toggle data-day="${x}" aria-pressed="${on.includes(x)}">${x}</button>`).join('')}</div>
        ${dr?.eDays ? `<p class="err-t mt8">${ic('circle-x', 14, 2)}<span>${esc(dr.eDays)}</span></p>` : ''}
        <div class="mt12">${ui.field({ id: 'hPhone', label: 'เบอร์ร้านที่ลูกค้าเห็น', value: dr ? dr.phone : b.phone, req: true, type: 'tel', max: 14, ac: 'off', error: dr?.ePhone, focus: !dr?.eOpen && !dr?.eClose && !!dr?.ePhone, hint: dr?.ePhone ? '' : 'ใส่ขีดได้ เช่น 082-053-9915' })}</div>
        ${st === 'error' ? `<p class="err-t mt8" role="alert">${ic('circle-x', 14, 2)}<span>บันทึกไม่สำเร็จ ลองอีกครั้ง ค่าที่แก้ไว้ยังอยู่</span></p>` : ''}
        <div class="btn-row mt16">${ui.btn('ยกเลิก', { kind: 'secondary', st: 'normal' })}${ui.btn('บันทึกเวลาทำการ', { a: 'saveHours', v: b.id, icon: 'check' })}</div></div>`
      : `<div class="st-kv mt12">${ui.kv([['เวลาทำการ', `${esc(b.hours)} ${esc(daysTxt(daysOf(b)))}`], ['เภสัชกรประจำวัน', d ? `${esc(d.name)} · ${esc(d.lic)} <span class="small">(ตามการเข้าสู่ระบบ)</span>` : 'ไม่มีใครเข้าสู่ระบบ สาขาปิดรับอัตโนมัติ'], ['เบอร์ร้าน', esc(b.phone)], ['ใบอนุญาตขายยา', `<span class="mono">${esc(b.lic)}</span>${b.licTmp ? ' <span class="small warn-t">ตัวอย่าง 2 สาขาใช้เลขเดียวกันอยู่ รอเลขแยกสาขา</span>' : ''}`], ['ผู้รับอนุญาต', '<span class="small">รอข้อมูล</span>'], ['ที่อยู่ร้านและหมุดแผนที่', '<span class="small">รอข้อมูล · ใช้ตรวจระยะ 200 เมตรตอนเข้าสู่ระบบ และระยะ 15 กม. ของเขตส่งยา</span>'], ['ลูกค้ารอในคิว', `${SC.qlen(b.id)} คน${S.sysOff ? ' (เก็บคิวไว้ รับเคสได้เมื่อเปิดระบบ)' : ''}`], ['ลูกค้าเห็นในแอป', esc(SC.custSees(b.id))]])}</div>
        <div class="btn-row mt16"><div><p class="label">รับเคสของสาขานี้</p><div class="mt8">${S.sysOff ? '<span class="small">ปิดระบบอยู่ เปลี่ยนได้เมื่อเปิดระบบอีกครั้ง</span>' : !d ? '<span class="small">เปิดรับได้เมื่อมีเภสัชกรเข้าสู่ระบบ</span>' : ui.seg([[b.id + ':open', 'เปิดรับ', 'circle-play'], [b.id + ':pause', 'พัก', 'circle-pause'], [b.id + ':closed', 'ปิดรับวันนี้', 'ban']], b.id + ':' + v, { a: 'intakeBr', label: 'รับเคสของ' + b.name })}</div></div><span class="sp"></span>${ui.btn('แก้เวลาทำการ', { kind: 'secondary', icon: 'pencil', st: 'edit', p: { b: b.id } })}</div>`}
  </section>`;
}
/* owner 20/10 night: "ส่วน console จะมี switch สำหรับ admin control ตรงนี้ว่า lock 15 km มั้ย on off". ON by default and declared in
   the FDA application. OFF needs written FDA permission first, a reason or letter no., and a confirm. ON again is one tap.
   Every change is kept 1 year (who, when, on/off, reason) and is shown here, on S407 and on S504 */
const ZONE0 = [{ on: true, at: '01/10/2026 09:00', by: 'admin', why: 'ค่าเริ่มต้น ตามประกาศ อย. แจ้งในใบสมัคร' }];
SC.zoneLog = () => [...ZONE0, ...(SC.S.zoneLog || [])];
SC.zoneLogHtml = () => `<ul class="audit mt8">${SC.zoneLog().slice().reverse().map(x => `<li><span class="num">${esc(x.at)}</span> ${esc(SC.PHARM[x.by]?.short || x.by)} · ${x.on ? '<b>ล็อก</b>' : '<b class="warn-t">ปลดล็อก</b>'} · ${esc(x.why)}</li>`).join('')}</ul>`;
const zoneCard = () => {
  const on = SC.zoneLocked(), z = SC.S.zoneInfo || {};
  return `<section class="card st-zone${on ? '' : ' off'}" aria-label="เขตส่งยา">${ui.sw({ icon: 'map-pin', title: 'ล็อกเขต 15 กม. จากสาขา (เปิด = ปรึกษาและส่งทุกแบบไม่เกิน 15 กม. รวมกรุงเทพฯ · ปิด = บังคับเฉพาะส่งด่วน Lalamove)', sub: on ? 'เปิดอยู่ (ค่าเริ่มต้น) · ลูกค้าที่อยู่เกิน 15 กม. เข้าคิวปรึกษาไม่ได้ · ที่อยู่จัดส่งเกิน 15 กม. รับที่ร้านเท่านั้น' : `ปลดล็อกอยู่ ตั้งแต่ ${z.at || ''} · ปรึกษาได้ทุกที่ · ส่งพัสดุ Flash DHL และส่งเย็นได้ไม่จำกัดระยะ · ส่งด่วน Lalamove ยังไม่เกิน 15 กม. จากสาขา`, on, a: 'zoneSw' })}
    ${on ? '' : `<div class="mt12">${ui.note(`<b>ปลดล็อกเขตส่งยาอยู่</b><p>เหตุผล: ${esc(z.why || '')} · ทุกจอมีแถบเตือน · พัสดุที่ส่งนอกเขตติดป้าย "${esc(SC.OUT_TAG)}" · กดสวิตช์ครั้งเดียวเพื่อล็อกกลับ</p>`, { tone: 'warn' })}</div>`}
    <details class="mt12 zn-log"${on ? '' : ' open'}><summary>ประวัติการเปลี่ยน (${SC.zoneLog().length}) · เก็บ 1 ปี แก้หรือลบไม่ได้</summary>${SC.zoneLogHtml()}</details></section>`;
};
SC.screen('settings', {
  code: 'S501', group: 5, admin: true, title: 'สาขาและเวลาทำการ', nav: 'settings',
  states: [['normal', 'ปกติ', { cust: [['branch', 'normal', 'สถานะและคิวของแต่ละสาขาที่ลูกค้าเห็น'], ['queueclosed', 'branch']] }],
    ['edit', 'แก้เวลาทำการ', { cust: [['branch', 'normal']] }],
    ['error', 'บันทึกไม่สำเร็จ', { cust: [] }],
    ['sysask', 'ยืนยันปิดระบบชั่วคราว', { back: 'normal', cust: [['sysoff', 'off', 'จอที่ลูกค้าจะเห็นทันทีหลังกดปิด']] }],
    ['sysoff', 'ปิดระบบชั่วคราวอยู่', { cust: [['sysoff', 'off'], ['sysoff', 'case', 'ลูกค้าที่คุยอยู่ คุยต่อได้จนจบ']] }],
    ['zoneask', 'ยืนยันปลดล็อกเขตส่งยา', { back: 'normal', cust: [] }],
    ['zoneoff', 'ปลดล็อกเขตส่งยาอยู่', { cust: [] }]],
  notes: ['เจ้าของ 21/10 (ความหมายสวิตช์): "ถ้าเปิดปุ่ม 15 km ใน console หมายถึง บังคับทุกอย่างเป็น 15 km แตถ้า off หมายถึง lalamove บังคับ 15 km ส่วนที่เหลือไม่บังคับ / * ปรึกษาไม่บังคับเขต * จัดส่ง dhl flash ไม่บังคับ * แต่เตือนก่อนเริ่มคำปรึกษาด้วยว่าไม่สามารถส่ง instant delivery ได้" · เปิด: ทุกอย่างไม่เกิน 15 กม. ลูกค้าที่อยู่เกินเข้าคิวไม่ได้ · ปิด: บังคับเฉพาะส่งด่วน Lalamove ไม่เกิน 15 กม. ปรึกษา ส่งพัสดุ Flash DHL และส่งเย็นไม่จำกัด · ชื่อสวิตช์ตรงกับแอปลูกค้า',
    'เจ้าของ 21/10: "ให้ lock distant 15 km ตาม ปุ่ม 15 km ใน console ได้เลย ให้มีผลกับทั้งการใช้บริการเข้าห้องในตอนแรก และล้อคอีกชั้นตอนเลือกจัดส่ง lalamove or dhl flash" และเลือก "15 กม. ทุกที่อยู่" · ทุกที่อยู่รวมกรุงเทพต้องห่างสาขาไม่เกิน 15 กม. ตามระยะวิ่งจริง ใช้กับ Lalamove Flash DHL และส่งเย็น · ล็อก 2 ชั้นในแอปลูกค้า: ตำแหน่งตอนเข้าคิว และที่อยู่ตอนเลือกจัดส่ง · เข้มกว่าประกาศ อย. (กรุงเทพทั้งหมด นอกกรุงเทพไม่เกิน 15 กม.)',
    'เจ้าของ 20/10: "ส่วน console จะมี switch สำหรับ admin control ตรงนี้ว่า lock 15 km มั้ย on off" · ค่าเริ่มต้นล็อก (ตั้งแต่ 21/10: ไม่เกิน 15 กม. ทุกที่อยู่) และแจ้งในใบสมัคร อย. · ปลดล็อกได้หลัง อย. อนุญาตเป็นหนังสือ ต้องกรอกเหตุผลหรือเลขหนังสือ และยืนยัน · ล็อกกลับกดครั้งเดียว · ทุกการเปลี่ยนเก็บ 1 ปี เห็นที่นี่ S407 และ S504',
    'ปลดล็อกแล้ว (เจ้าของ 21/10): ปรึกษาได้ทุกที่ ลูกค้าที่อยู่เกิน 15 กม. เห็นคำเตือนก่อนเริ่มว่าส่งด่วนไปไม่ถึง (แอปลูกค้า C209.4) · ส่งพัสดุ Flash DHL และส่งเย็น Inter Express ไม่จำกัดระยะ · ส่งด่วน Lalamove ยังไม่เกิน 15 กม. · ทุกจอมีแถบ "ปลดล็อกเขตส่งยาอยู่" · พัสดุนอกเขตติดป้าย "นอกเขต (ปลดล็อก)" (S404 S403 S407)',
    'สิทธิ์: ต้นแบบให้ผู้ดูแลระบบเท่านั้น · การออกแบบสิทธิ์จริงต้องให้เจ้าของตรวจตอนสร้างจริง (Protected Area)',
    'เจ้าของ 20/10 (B12): แต่ละสาขาต้องมี เลขใบอนุญาตขายยา ชื่อผู้รับอนุญาต ที่อยู่ และหมุดแผนที่ · ตอนนี้ทั้ง 2 สาขาใช้ ข.ย.5 กท 29/2566 เป็นตัวอย่าง เจ้าของจะยื่นจดทะเบียนสาขาใหม่หลังเปลี่ยนป้าย แล้วใส่เลขจริง · เลขนี้ขึ้นบนบัตรเภสัชกรที่ลูกค้าเห็น',
    'เคาะแล้ว 20/10 ข้อ 75 (เจ้าของ: "ใช้ตามนี้"): ปิดระบบแล้วลูกค้าที่รออยู่ยังอยู่ในคิว ระบบแจ้งลูกค้า และกดรับเคสไม่ได้จนกว่าจะเปิดระบบ', 'เจ้าของสั่ง 20/10: จอนี้เห็นเฉพาะผู้ดูแลระบบ เภสัชกรสาขาไม่เห็นเมนูนี้ (ใช้ปุ่ม เปิดรับ พัก ปิดรับ บนแถบบนของสาขาตัวเองได้ตามเดิม)', 'ผู้ดูแลระบบตั้งค่าได้ทุกสาขาในจอเดียว', 'เจ้าของเคาะ: เปิด พัก ปิดรับ แยกแต่ละสาขา และมีสวิตช์ปิดระบบปรึกษาชั่วคราวทั้งหมด', 'ปิดระบบทั้งหมด: ลูกค้าเข้าคิวใหม่ไม่ได้ · ลูกค้าที่รอคิวได้รับแจ้ง คิวเก็บไว้ แต่กดรับเคสไม่ได้จนเปิดระบบ · เคสที่เปิดอยู่คุยต่อได้จนจบ', 'เหตุผลและข้อความที่ขึ้นทุกจอ มาจากที่กรอกตอนปิดระบบ', 'เวลาทำการ 09:00-21:00 ตรงกับที่ลูกค้าเห็นในแอป (นอกเวลา = ฝากคำถาม C605)', 'แก้เวลาทำการ (QA 20/10): บันทึกแล้วค่าใหม่ขึ้นทุกจอทันที (S102 S202 S203 S502) · ตรวจก่อนบันทึก: เวลาปิดต้องหลังเวลาเปิด เลือกวันอย่างน้อย 1 วัน เบอร์ 9-10 หลักขึ้นต้นด้วย 0 ใส่ขีดได้ · ผิดแล้วบอกใต้ช่องนั้น ไม่บันทึก'],
  wait: [],
  head: () => ({ title: 'สาขาและเวลาทำการ', sub: 'ผู้ดูแลระบบ · ตั้งค่าที่ลูกค้าเห็นในแอป ทุกสาขา' }),
  prep(S, st, p) {
    if (st !== 'error') S.hrDraft = null;
    if (st === 'zoneoff' && S.zoneLock !== false) { S.zoneLock = false; S.zoneInfo = { at: `${SC.NOW.date} 10:30`, by: 'admin', why: 'หนังสือ อย. ที่ สธ 1011/0000 (ตัวอย่าง)' }; S.zoneLog = [...(S.zoneLog || []), { on: false, ...S.zoneInfo }]; }
    else if (S._reseed && st !== 'zoneoff') { S.zoneLock = true; S.zoneInfo = null; }
    if (st === 'sysoff') { S.sysOff = true; if (!S.sysInfo) S.sysInfo = { why: SYS_WHY[0], msg: SYS_MSG, at: '14:18', by: 'admin' }; }
    else if (S._reseed) { S.sysOff = false; S.sysInfo = null; }
    if (!p.b) p.b = S.branch;
  },
  render(ctx) {
    const S = SC.S, si = S.sysInfo || {};
    const sys = S.sysOff ? `<section class="card st-sys on" aria-label="ระบบปรึกษาทั้งหมด"><div class="hrow wrap"><span class="danger-t">${ic('power', 22, 2)}</span><div class="grow"><h2 class="h3">ปิดระบบปรึกษาชั่วคราวอยู่</h2><p class="small">ปิดโดย ${esc((SC.PHARM[si.by] || SC.me()).short)} ${SC.NOW.date} ${esc(si.at || '')} · เหตุผล: ${esc(si.why || '')}</p></div>${ui.btn('เปิดระบบอีกครั้ง', { a: 'sysOn', icon: 'circle-play' })}</div>
        <p class="label mt12">ข้อความที่ลูกค้าเห็น</p><p class="mt4">"${esc(si.msg || '')}"</p>
        <p class="small mt8">ลูกค้าใหม่เข้าคิวไม่ได้ ฝากคำถามได้ · ลูกค้าที่รออยู่ ${SC.qlen('tw') + SC.qlen('on')} คน เก็บคิวไว้ รับเคสได้เมื่อเปิดระบบ · เคสที่เปิดอยู่คุยต่อได้จนจบ</p></section>`
      : `<section class="card st-sys mgr"><div class="hrow wrap"><span class="muted">${ic('power', 22, 2)}</span><div class="grow"><h2 class="h3">ปิดระบบปรึกษาชั่วคราวทั้งหมด</h2><p class="small">ใช้เมื่อระบบมีปัญหาหรือมีเหตุจำเป็น ปิดทุกสาขาพร้อมกัน · ถ้าสาขาแค่ไม่ว่าง ให้สาขากด "พัก" เอง</p></div>${ui.btn('ปิดระบบชั่วคราว', { kind: 'danger-line', icon: 'power', st: 'sysask' })}</div></section>`;
    return `<div class="gap16">${SC.BRANCHES.map(b => brCard(b, S, ctx.st, ctx.p.b)).join('')}${sys}${zoneCard()}
      <section class="card"><div class="card-h"><h3>นอกเวลาทำการ</h3></div><p class="mt8">ลูกค้าฝากคำถามได้ตลอด เภสัชกรประจำวันตอบเมื่อร้านเปิด 09:00 · คำถามรอที่ "คำถามนอกเวลา"</p></section></div>`;
  },
  overlay(ctx) {
    if (ctx.st === 'zoneask') return ui.modal({ title: 'ปลดล็อกเขตส่งยา', sub: 'มีผลกับทุกสาขาทันที', icon: 'map-pin', tone: 'danger', back: 'normal',
      body: `${ui.note('<b>ต้องได้หนังสืออนุญาตจาก อย. ก่อน</b><p>ใบสมัครแจ้ง อย. ว่าล็อกเขตส่งยาไว้ ปลดล็อกโดยไม่มีหนังสือ เสี่ยงถูกถอนการรับรองแอป</p>', { tone: 'danger' })}
        <p class="label mt16">หลังปลดล็อก</p><ul class="zn-eff mt8"><li>ลูกค้าที่อยู่เกิน 15 กม. จากสาขา เข้าคิวปรึกษาได้ ระบบเตือนก่อนเริ่มว่าส่งด่วนไปไม่ถึง</li><li>ส่งพัสดุ Flash DHL และส่งเย็น Inter Express ได้ไม่จำกัดระยะ · ส่งด่วน Lalamove ยังไม่เกิน 15 กม.</li><li>ทุกจอมีแถบ "ปลดล็อกเขตส่งยาอยู่" · พัสดุนอกเขตติดป้าย "${esc(SC.OUT_TAG)}"</li><li>บันทึกว่าใครปลดล็อก เมื่อไร เพราะอะไร เก็บ 1 ปี</li></ul>
        <div class="mt16">${ui.field({ id: 'znWhy', label: 'เลขหนังสืออนุญาตจาก อย. หรือเหตุผล', req: true, max: 120, ph: 'เช่น หนังสือ อย. ที่ สธ 1011/1234 ลงวันที่ 01/12/2026' })}</div>
        <button type="button" class="opt mt12" role="checkbox" data-toggle id="znAck" aria-checked="false"><span class="ck">${ic('check', 13, 3)}</span><span class="tx"><b>ได้รับหนังสืออนุญาตจาก อย. เป็นลายลักษณ์อักษรแล้ว</b></span></button>`,
      foot: `${ui.btn('ยกเลิก', { kind: 'secondary', st: 'normal' })}${ui.btn('ปลดล็อกเขตส่งยา', { kind: 'danger', a: 'zoneOff', icon: 'map-pin' })}` });
    if (ctx.st !== 'sysask') return '';
    return ui.modal({ title: 'ปิดระบบปรึกษาชั่วคราวทั้งหมด', sub: 'มีผลกับทุกสาขาทันที', icon: 'power', tone: 'danger', back: 'normal',
      body: `${ui.kv([['ลูกค้ารอคิวอยู่', `${SC.qlen('tw') + SC.qlen('on')} คน (ตลาดเวิลด์ ${SC.qlen('tw')} · อ่อนนุช ${SC.qlen('on')}) · เก็บคิวไว้ รับเคสได้เมื่อเปิดระบบ`], ['เคสที่เปิดอยู่', SC.S.activeCase ? '1 เคส คุยต่อได้จนจบ' : 'ไม่มี']])}
        <div class="mt16">${ui.field({ id: 'sysWhy', label: 'เหตุผล (บันทึกในระบบ)', select: ['เลือกเหตุผล', ...SYS_WHY], value: 'เลือกเหตุผล', req: true })}</div>
        <div class="mt12">${ui.field({ id: 'sysMsg', label: 'ข้อความที่ลูกค้าเห็น', textarea: true, rows: 2, value: SYS_MSG, req: true })}</div>
        <p class="small mt8">ลูกค้าในคิวได้รับแจ้งทันที · เปิดใหม่ได้ที่จอนี้</p>`,
      foot: `${ui.btn('ยกเลิก', { kind: 'secondary', st: 'normal' })}${ui.btn('ปิดระบบชั่วคราว', { kind: 'danger', a: 'sysOff', icon: 'power' })}` });
  }
});
SC.act('zoneSw', () => SC.zoneLocked() ? SC.go('settings', { st: 'zoneask' }) : SC.ACTS.zoneOn());
SC.act('zoneOff', async t => {
  const w = $('#znWhy'), a = $('#znAck');
  if (w.value.trim().length < 5) { w.closest('.field').classList.add('err'); w.focus(); return SC.toast('ใส่เลขหนังสืออนุญาตจาก อย. หรือเหตุผล อย่างน้อย 5 ตัวอักษร', 'info'); }
  if (a.getAttribute('aria-checked') !== 'true') { a.focus(); return SC.toast('ติ๊กยืนยันว่าได้รับหนังสืออนุญาตจาก อย. แล้ว', 'info'); }
  await SC.busy(t, 600);
  const S = SC.S; S.zoneLock = false; S.zoneInfo = { at: `${SC.NOW.date} ${SC.clockStr()}`, by: S.me, why: w.value.trim() };
  S.zoneLog = [...(S.zoneLog || []), { on: false, ...S.zoneInfo }]; SC.logEv('zone', `ปลดล็อกเขตส่งยา · ${S.zoneInfo.why}`, '', '');
  document.querySelectorAll('.toast').forEach(n => n.remove());
  SC.go('settings', { st: 'zoneoff' }); SC.toast('ปลดล็อกเขตส่งยาแล้ว ทุกจอมีแถบเตือน', 'map-pin');
});
SC.act('zoneOn', () => {
  const S = SC.S, at = `${SC.NOW.date} ${SC.clockStr()}`; S.zoneLock = true; S.zoneInfo = null;
  S.zoneLog = [...(S.zoneLog || []), { on: true, at, by: S.me, why: 'ล็อกกลับ ไม่เกิน 15 กม. ทุกที่อยู่' }]; SC.logEv('zone', 'ล็อกเขตส่งยากลับ', '', '');
  SC.go('settings', { st: 'normal' }); SC.toast('ล็อกเขตส่งยาแล้ว นอกเขตรับที่ร้านเท่านั้น', 'map-pin');
});
SC.act('intakeBr', t => {
  const [bid, v] = t.dataset.v.split(':'), S = SC.S, b = SC.branch(bid);
  if (v === 'closed') { S.branch = bid; return SC.go('queue', { st: 'closeask' }); }
  if (v === 'pause') { S.branch = bid; return SC.ACTS.intake({ dataset: { v: 'pause' } }); }
  S.intake[bid] = v; if (bid === S.branch) S.pause = null;
  SC.refresh(); SC.toast(`เปิดรับเคส${b.short}แล้ว`, 'circle-play');
});
/* checks every field, shows each problem under its own field, saves nothing until all are right */
SC.act('saveHours', async t => {
  const S = SC.S, bid = t.dataset.v, b = SC.branch(bid), open = $('#hOpen').value, close = $('#hClose').value, phone = $('#hPhone').value.trim();
  const days = DAYS.filter(x => $(`[data-day="${x}"]`)?.getAttribute('aria-pressed') === 'true');
  const e = { eOpen: open ? '' : 'ใส่เวลาเปิดรับปรึกษา',
    eClose: !close ? 'ใส่เวลาปิดรับปรึกษา' : open && close <= open ? `เวลาปิดต้องหลังเวลาเปิด (${open}) เช่น เปิด 09:00 ปิด 21:00` : '',
    eDays: days.length ? '' : 'เลือกวันที่เปิดรับอย่างน้อย 1 วัน',
    ePhone: !phone ? 'ใส่เบอร์ร้านที่ลูกค้าเห็น เช่น 082-053-9915' : phoneOk(phone) ? '' : 'เบอร์โทรไม่ถูกต้อง ใส่ 9-10 หลัก เช่น 082-053-9915' };
  if (Object.values(e).some(Boolean)) { S.hrDraft = { b: bid, open, close, phone, days, ...e }; SC.refresh(); return; }
  await SC.busy(t, 600);
  const hours = `${open}-${close}`, same = hours === b.hours && phone === b.phone && days.join() === daysOf(b).join();
  S.brSet = { ...(S.brSet || {}), [bid]: { hours, phone, days } };
  SC.go('settings', { st: 'normal' });
  SC.toast(same ? `ไม่มีอะไรเปลี่ยน ${b.short} ใช้ค่าเดิม` : `บันทึกแล้ว ${b.short} เปิด ${hours} ${daysTxt(days)} · เบอร์ ${phone}`, 'check');
});
SC.act('sysOff', async t => {
  const w = $('#sysWhy'), m = $('#sysMsg');
  if (!SYS_WHY.includes(w.value)) { w.closest('.field').classList.add('err'); w.focus(); SC.toast('เลือกเหตุผลก่อนปิดระบบ', 'info'); return; }
  if (!m.value.trim()) { m.closest('.field').classList.add('err'); m.focus(); SC.toast('ใส่ข้อความที่ลูกค้าเห็น', 'info'); return; }
  await SC.busy(t, 700);
  SC.S.sysOff = true; SC.S.sysInfo = { why: w.value, msg: m.value.trim(), at: SC.clockStr(), by: SC.S.me };
  SC.go('settings', { st: 'sysoff' }); SC.toast(`ปิดระบบปรึกษาชั่วคราวแล้ว · เหตุผล: ${w.value} · ลูกค้าในคิวได้รับแจ้ง`, 'power');
});
SC.act('sysOn', async t => { await SC.busy(t, 600); SC.S.sysOff = false; SC.S.sysInfo = null; SC.go('settings', { st: 'normal' }); SC.toast('เปิดระบบปรึกษาแล้ว ลูกค้าเข้าคิวได้ และกดรับเคสได้ตามปกติ', 'circle-play'); });

/* ---------- S502 on duty per branch = whoever signed in and confirmed (nothing to pick here) ---------- */
/* the shift time is the one the pharmacist confirmed on S102, when they did it in this session */
const sinceOf = (p, bid) => SC.S.shiftAt?.[bid] && SC.duty(bid)?.id === p.id ? SC.S.shiftAt[bid] : SC.S.handFrom?.[bid] && SC.S.dutyBy[bid] === p.id ? SC.S.handFrom[bid].at : p.since;
/* B4: any day within 1 year. The mock has one past day filled in (17/10/2026) */
const PAST = { '17/10/2026': { rows: [['tw', 'kj', '08:57', '21:02', 31], ['on', 'tp', '08:50', '21:00', 24]],
  log: [['08:50', 'tp', 'on', 'เข้าสู่ระบบ ผ่าน QR ที่ร้าน ห่าง 40 เมตร และ OTP · ถ่ายรูปเข้ากะ'], ['08:57', 'kj', 'tw', 'เข้าสู่ระบบ ผ่าน QR ที่ร้าน ห่าง 25 เมตร และ OTP · ถ่ายรูปเข้ากะ'], ['13:10', 'kj', 'tw', 'พักรับเคส 30 นาที'], ['13:40', 'kj', 'tw', 'เปิดรับเคส'], ['21:00', 'tp', 'on', 'ออกจากระบบ ปิดรับตามเวลาทำการ'], ['21:02', 'kj', 'tw', 'ออกจากระบบ ปิดรับตามเวลาทำการ']] } };
const dmy = s => { const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(s || '').trim()), d = m && new Date(+m[3], +m[2] - 1, +m[1]); return d && d.getDate() === +m[1] && d.getMonth() === +m[2] - 1 ? d : null; };
const dayBar = st => `<section class="card rs-bar">${ui.seg([['normal', `วันนี้ ${SC.NOW.date}`], ['past', 'วันอื่น']], st === 'past' ? 'past' : 'normal', { st: true, label: 'วันที่ดู' })}
  ${st === 'past' ? `<label class="sr" for="rsDay">วันที่</label><input id="rsDay" class="input rs-day" value="${esc(SC.S.rsDay || '17/10/2026')}" placeholder="วว/ดด/ปปปป" maxlength="10" inputmode="numeric">${ui.btn('ดู', { kind: 'secondary', sm: true, a: 'rsDay', icon: 'search' })}` : ''}<span class="sp"></span><span class="small">ดูย้อนหลังได้ 1 ปี</span></section>`;
function pastDay() {
  const S = SC.S, day = S.rsDay || '17/10/2026', d = dmy(day), now = dmy(SC.NOW.date), P = PAST[day];
  if (!d) return `<div class="mt16">${ui.note('<b>วันที่ไม่ถูกต้อง</b><p>ใส่เป็น วว/ดด/ปปปป เช่น 17/10/2026</p>', { tone: 'warn', role: 'alert' })}</div>`;
  if (d > now) return `<div class="mt16">${ui.note('<b>ยังไม่ถึงวันนี้</b><p>เลือกวันที่ผ่านมาแล้ว</p>', { tone: 'warn' })}</div>`;
  if ((now - d) / 864e5 > 365) return `<div class="mt16">${ui.note(`<b>${esc(day)} เกิน 1 ปีแล้ว</b><p>บันทึกการเข้ากะเก็บ 1 ปี ข้อมูลวันนี้ลบตามระยะเก็บแล้ว</p>`, { icon: 'history' })}</div>`;
  if (!P) return `<section class="card mt16">${ui.empty({ icon: 'calendar', title: `ต้นแบบยังไม่มีข้อมูลของ ${day}`, body: 'ในต้นแบบมีตัวอย่างเฉพาะ 17/10/2026 · ระบบจริงแสดงได้ทุกวันภายใน 1 ปี' })}</section>`;
  return `<section class="card pad0 mt16"><div class="card-h qb-h"><h3>ใครประจำสาขาไหน ${esc(day)}</h3><span class="sp"></span><span class="small">อ่านอย่างเดียว</span></div>
    <table class="tbl"><thead><tr><th>สาขา</th><th>เภสัชกรประจำวัน</th><th>เข้ากะ</th><th>ออกกะ</th><th class="r">ปิดเคส</th></tr></thead><tbody>${P.rows.map(([b, w, i, o, n]) => { const p = SC.PHARM[w]; return `<tr><td><b>${esc(SC.branch(b).name)}</b></td><td><div class="hrow">${SC.shotImg({ at: i }, 'sm')}<div><b>${esc(p.name)}</b><span class="sub">${esc(p.lic)} · ${esc(p.staff)}</span></div></div></td><td class="num">${i}</td><td class="num">${o}</td><td class="r num">${n}</td></tr>`; }).join('')}</tbody></table></section>
    <section class="card mt16"><div class="card-h"><h3>บันทึกการเข้าและออกจากระบบ ${esc(day)}</h3></div><ul class="audit mt8">${P.log.map(([t, w, b, x]) => `<li><span class="num">${t}</span> ${esc(SC.PHARM[w].short)} · ${esc(SC.branch(b).short)} · ${esc(x)}</li>`).join('')}</ul></section>`;
}
SC.act('rsDay', () => { const v = ($('#rsDay')?.value || '').trim(); SC.S.rsDay = v; SC.go('roster', { st: 'past' }); });
/* the day's sign-in log; the session's own take-overs and sign-outs are added on top */
function logRows() {
  const S = SC.S, rows = [['08:52', 'tp', 'on', 'เข้าสู่ระบบ ยืนยันเข้ากะ'], ['08:55', 'kj', 'tw', 'เข้าสู่ระบบ ยืนยันเข้ากะ']];
  Object.entries(S.handFrom || {}).forEach(([bid, h]) => { rows.push([h.at, S.dutyBy[bid], bid, `เข้าสู่ระบบ รับกะต่อจาก ${SC.PHARM[h.who].short}`]); rows.push([h.at, h.who, bid, 'ออกกะ ได้รับแจ้งแล้ว เคสที่เปิดอยู่ดูแลต่อจนปิด']); });
  if (S.dutyBy.on === null && S.off?.b !== 'on') rows.push(['14:05', 'tp', 'on', 'ออกจากระบบ ไม่มีเภสัชกรคนอื่นเข้าสู่ระบบ ระบบปิดรับอัตโนมัติ']);
  if (S.off) rows.push([S.off.at, S.off.who, S.off.b, 'ออกจากระบบ ไม่มีเภสัชกรคนอื่นเข้าสู่ระบบ ระบบปิดรับอัตโนมัติ']);
  return rows.sort((a, b) => a[0] < b[0] ? -1 : 1);
}
SC.screen('roster', {
  code: 'S502', group: 5, admin: true, title: 'เภสัชกรประจำวัน', nav: 'roster',
  states: [['normal', 'ปกติ', { cust: [['queue', 'q2', 'ชื่อและเลขใบอนุญาตบนบัตรในหน้ารอคิว']] }],
    ['change', 'มีคนเข้าสู่ระบบรับกะต่อ', { cust: [['queue', 'q2', 'บัตรเปลี่ยนเป็นชื่อคนที่เข้าสู่ระบบรับกะต่อ']] }],
    ['nobody', 'สาขาไม่มีเภสัชกรเข้าสู่ระบบ', { cust: [['queueclosed', 'branch', 'สาขาที่ไม่มีเภสัชกรประจำ ลูกค้าเข้าคิวไม่ได้']] }],
    ['past', 'ดูวันย้อนหลัง', { cust: [] }]],
  notes: ['เจ้าของ 20/10 (B4): ดูย้อนหลังได้ทุกวันภายใน 1 ปี ไม่ใช่แค่วันนี้ · ใครประจำสาขาไหน เข้าและออกกะกี่โมง รูปเข้ากะ และบันทึกการเข้าออกระบบของวันนั้น · ใช้ตอนเจ้าหน้าที่มาตรวจ',
    'เจ้าของสั่ง 20/10: เห็นเฉพาะผู้ดูแลระบบ · เภสัชกรประจำวันขึ้นกับว่าใครเข้าสู่ระบบ ไม่มีการเลือกหรือส่งต่อกะในจอนี้ (ปุ่มส่งต่อกะเดิมเอาออกแล้ว)', 'เปลี่ยนคนประจำ = คนใหม่เข้าสู่ระบบที่สาขานั้นแล้วกดรับกะต่อ (S102.2) · ลูกค้าเห็นชื่อคนใหม่ทันที', 'ไม่มีเภสัชกรเข้าสู่ระบบ = สาขาปิดรับอัตโนมัติ ลูกค้าเห็น "สาขาปิดรับปรึกษา"', 'บันทึกงานรายเภสัชกร: เวลาเข้า ออก และจำนวนเคส'],
  wait: [],
  head: () => ({ title: 'เภสัชกรประจำวัน', sub: `ผู้ดูแลระบบ · ${SC.NOW.date} (วัน${SC.NOW.day}) · ตามการเข้าสู่ระบบ` }),
  prep(S, st) {
    if (!S._reseed) return;
    if (st === 'past') S.rsDay = '17/10/2026';
    if (st === 'change') { S.dutyBy = { tw: 'pc' }; S.handFrom = { tw: { who: 'kj', at: '14:10' } }; }
    if (st === 'nobody') { S.dutyBy = { on: null }; S.intake.on = 'closed'; }
  },
  render(ctx) {
    const bar = dayBar(ctx.st);
    if (ctx.st === 'past') return bar + pastDay();
    const rows = SC.BRANCHES.map(b => {
      const p = SC.duty(b.id);
      return `<tr${b.id === SC.S.branch ? ' class="sel"' : ''}><td><b>${esc(b.name)}</b><span class="sub">${esc(b.hours)}</span></td>
        <td>${!p ? `${ui.tag('ไม่มีเภสัชกรเข้าสู่ระบบ', 'danger', { icon: 'user' })}<span class="sub">${esc(SC.PHARM[SC.S.off?.b === b.id ? SC.S.off.who : 'tp'].short)} ออกจากระบบ ${esc(SC.S.off?.b === b.id ? SC.S.off.at : '14:05')}</span>` : `<div class="hrow">${SC.shotOf(p.id) ? SC.shotImg(SC.shotOf(p.id), 'sm') : ui.av(p.ini, { size: 'sm' })}<div><b>${esc(p.name)}</b><span class="sub">${esc(p.lic)} · ${esc(p.staff)}</span></div></div>`}</td>
        <td>${!p ? '-' : `<span class="num">${esc(sinceOf(p, b.id))}</span>`}</td>
        <td>${!p ? ui.tag('ปิดรับอัตโนมัติ', 'muted', { icon: 'ban' }) : intakeTag(SC.S.intake[b.id])}</td>
        <td class="r num">${!p ? '-' : SC.closedToday(b.id)}</td></tr>`;
    }).join('');
    const nobody = SC.BRANCHES.find(b => !SC.duty(b.id));
    return `${bar}${ui.note('<b>เภสัชกรประจำวันมาจากการเข้าสู่ระบบ</b><p>คนที่เข้าสู่ระบบด้วยบัญชีของสาขาและยืนยันเข้ากะ คือคนที่ลูกค้าเห็นในหน้ารอคิว · จะเปลี่ยนคน ให้คนใหม่เข้าสู่ระบบที่สาขาแล้วกดรับกะต่อ ไม่ต้องตั้งที่นี่</p>', { icon: 'user-check' })}
      <section class="card pad0 mt16"><div class="card-h qb-h"><h3>ตอนนี้ใครประจำสาขาไหน</h3><span class="sp"></span><span class="small">ลูกค้าเห็นชื่อนี้ในหน้ารอคิว</span></div>
        <table class="tbl"><thead><tr><th>สาขา</th><th>เภสัชกรประจำวัน</th><th>เข้ากะ</th><th>รับเคส</th><th class="r">ปิดเคสวันนี้</th></tr></thead><tbody>${rows}</tbody></table></section>
      ${nobody ? `<div class="mt16">${ui.note(`<b>${esc(nobody.name)}ไม่มีเภสัชกรเข้าสู่ระบบตั้งแต่ 14:05</b><p>ระบบปิดรับเคสของสาขานี้ให้อัตโนมัติ ลูกค้าในคิว ${SC.qlen(nobody.id)} คนได้รับแจ้งและเลือกย้ายสาขาได้ · เปิดใหม่เมื่อมีเภสัชกรเข้าสู่ระบบและยืนยันเข้ากะ</p>`, { tone: 'warn', role: 'status' })}</div>` : ''}
      <section class="card mt16"><div class="card-h"><h3>บันทึกการเข้าและออกจากระบบวันนี้</h3></div><ul class="audit mt8">
        ${logRows().map(([t, who, bid, what]) => `<li><span class="num">${esc(t)}</span> ${esc(SC.PHARM[who].short)} · ${esc(SC.branch(bid).short)} · ${esc(what)}</li>`).join('')}</ul></section>`;
  },
  sims: ({ st }) => [st === 'normal' && { label: 'ภญ.พิมพ์ชนก เข้าสู่ระบบที่ตลาดเวิลด์ รับกะต่อ', run: () => { const S = SC.S; S.dutyBy.tw = 'pc'; S.handFrom = { ...(S.handFrom || {}), tw: { who: 'kj', at: SC.clockStr() } }; SC.setSt('change'); } },
    st !== 'nobody' && { label: 'ภก.ธัชพล ออกจากระบบ (อ่อนนุช)', run: () => { const S = SC.S; S.dutyBy.on = null; S.intake.on = 'closed'; SC.setSt('nobody'); } }]
});
})();

/* ===== 90-edge.js ===== */
/* =====================================================================
   90 · Group 6 จอผิดปกติ: S601 customer dropped out of the app · S602 system switched off
        · S603 not allowed (other branch / not the on-duty pharmacist) · S604 the store lost its connection
   ===================================================================== */
(() => {
const { $, esc, ic, ui } = SC;

/* ---------- S601 customer dropped ---------- */
SC.screen('dropped', {
  code: 'S601', group: 6, duty: true, title: 'ลูกค้าหลุดจากแอป', nav: 'queue', fill: true,
  states: [['wait', 'รอลูกค้ากลับมา', { cust: [['lost', 'me', 'ฝั่งลูกค้ากำลังต่อใหม่'], ['room', 'offline']] }],
    ['long', 'หลุดนานเกิน 10 นาที', { cust: [['lost', 'fail'], ['lock', 'msg', 'ข้อความที่ส่งไว้ขึ้นเป็นแจ้งเตือน']] }]],
  notes: ['เคสและแชทไม่หาย ข้อความที่พิมพ์ส่งได้ ลูกค้าเห็นเมื่อกลับเข้าแอป', 'หลุดนานเกิน 10 นาที: โทรหาลูกค้าได้ หรือปิดเคสด้วยเหตุผล "ลูกค้าไม่ตอบกลับ" ลูกค้ายังได้ใบสรุป', 'ห้องนี้ยังนับเป็นเคสที่กำลังคุย (1 สาขา 1 เคส) จนกว่าจะปิด'],
  head: () => ({ title: 'ห้องปรึกษา', sub: SC.branch().name }),
  now: ctx => ({ date: SC.NOW.date, time: ctx.st === 'long' ? '14:31' : '14:21' }),
  prep(S, st, p) { S.activeCase = p.k || (S._reseed ? 'smj' : S.activeCase) || 'smj'; },
  render(ctx) {
    const long = ctx.st === 'long', c = SC.wsCase(ctx);
    const banner = long
      ? SC.caseNote('bad', 'wifi-off', '<b>ลูกค้าหลุดจากแอป 10 นาที</b> · ข้อความที่ส่ง ลูกค้าเห็นเมื่อกลับมา', `${ui.btn('ดูเบอร์ลูกค้า', { sm: true, kind: 'secondary', icon: 'phone', a: 'phCase', v: c.key })}${ui.btn('ปิดเคส ลูกค้าไม่ตอบ', { sm: true, kind: 'ghost', go: 'close', st: 'draft', p: { k: c.key, reason: 'noreply' } })}`)
      : SC.caseNote('wait', 'wifi-off', '<b>ลูกค้าหลุดจากแอป กำลังรอกลับมา <span class="num" id="dropT">0:45</span></b> · เคสและแชทไม่หาย ข้อความที่ส่ง ลูกค้าเห็นเมื่อกลับมา');
    return SC.roomBody({ ...ctx, st: 'talk' }, { banner, peer: ui.tag('ลูกค้าออฟไลน์', 'muted', { icon: 'wifi-off' }) });
  },
  mount(el, ctx) {
    SC.wireComposer(el); SC.tickElapsed(el, ctx, ctx.st === 'long' ? 900 : 300);
    const d = $('#dropT', el); if (d) { let s = 45; ctx.every(() => { s++; d.textContent = SC.mmss(s); }, 1000); }
  },
  sims: ({ st }) => [{ label: 'ลูกค้ากลับเข้าแอป', run: () => { SC.go('room', { st: 'talk', p: { k: SC.S.activeCase || 'smj' } }); SC.toast('ลูกค้ากลับเข้าห้องแล้ว', 'wifi'); } }, st === 'wait' && { label: 'ผ่านไป 10 นาที', run: () => SC.setSt('long') }]
});

/* ---------- S602 system switched off (what the queue looks like) ---------- */
SC.screen('sysoff', {
  code: 'S602', group: 6, title: 'ระบบปรึกษาปิดชั่วคราว', nav: 'queue',
  states: [['off', 'ไม่มีเคสเปิดอยู่', { cust: [['sysoff', 'off']] }], ['case', 'มีเคสที่เปิดอยู่', { cust: [['sysoff', 'case', 'ลูกค้าที่คุยอยู่ คุยต่อได้'], ['room', 'live']] }]],
  notes: ['ใครในร้านเปิดคอนโซลก็เห็นแถบบนสุดเหมือนกัน ไม่ใช่แค่คนกด', 'เจ้าของสั่ง 20/10: ปิด/เปิดระบบทั้งหมดอยู่ในจอตั้งค่าที่เห็นเฉพาะผู้ดูแลระบบ เภสัชกรสาขาเห็นแถบและเหตุผล แต่ไม่มีปุ่มไปตั้งค่า', 'เหตุผลและเวลาที่ขึ้น มาจากที่กรอกตอนปิดระบบ (S501)', 'กระดานคิวขึ้น "ปิดระบบอยู่" ทั้ง 2 สาขา · ลูกค้าที่รออยู่ยังอยู่ในคิว เปิดดูได้ แต่ปุ่ม "รับเคส" กดไม่ได้จนเปิดระบบ', 'ปุ่มเปิด พัก ปิดรับของสาขากดไม่ได้ระหว่างปิดระบบ (เปิดระบบก่อน)', 'เคสที่เปิดอยู่คุยต่อ จ่ายยา และปิดเคสได้ตามปกติ'],
  head: () => ({ title: 'คิวปรึกษา', sub: SC.branch().name }),
  prep(S, st) {
    S.sysOff = true;
    if (!S.sysInfo) S.sysInfo = { why: 'ระบบวิดีโอขัดข้อง', msg: 'ขออภัย ตอนนี้ปิดรับปรึกษาชั่วคราว ฝากคำถามไว้ได้ เภสัชกรจะตอบเมื่อเปิดระบบอีกครั้ง', at: '14:18', by: 'admin' };
    if (S._reseed) S.activeCase = st === 'case' ? 'smj' : null;
  },
  render(ctx) {
    const S = SC.S, ac = S.activeCase && SC.CASES[S.activeCase], si = S.sysInfo;
    return `<div class="pg-note" role="status">${ic('info', 18, 2)}<p class="grow">ปิดโดย ${esc((SC.PHARM[si.by] || SC.me()).short)} ${esc(si.at)} · เหตุผล: ${esc(si.why)} · ลูกค้าเห็น: "${esc(si.msg)}"</p>${SC.isAdmin() ? ui.btn('ไปที่การตั้งค่า', { kind: 'secondary', sm: true, go: 'settings', st: 'sysoff', icon: 'settings' }) : ''}</div>
      ${ac ? `<section class="card mt12"><div class="hrow">${ui.av(SC.casePerson(ac).name.slice(0, 2), { solid: true })}<div class="grow"><b>${ui.who(ac)} · เคส ${esc(ac.id.slice(-4))}</b><p class="small">เคสที่เปิดอยู่ คุยต่อได้จนจบ</p></div>${ui.btn('กลับเข้าห้องปรึกษา', { go: 'room', st: 'talk', p: { k: ac.key }, icon: 'message-circle' })}</div></section>` : ''}
      <div class="mt12">${SC.queueBoard(S, 'live', { notice: false })}</div>`;
  },
  mount(el, ctx) { SC.qTick?.(el, ctx); }
});

/* ---------- S603 not allowed ---------- */
SC.screen('denied', {
  code: 'S603', group: 6, staff: true, title: 'ไม่มีสิทธิ์ดู', nav: () => SC.isStaff() ? 'pack' : 'log',
  states: [['branch', 'เคสของสาขาอื่น', { cust: [] }], ['role', 'บัญชีพนักงานร้าน เปิดจอเภสัชกร', { cust: [], notes: ['เคาะแล้ว 20/10 (ข้อ 67): บัญชีพนักงานร้านเปิดจอของเภสัชกรไม่ได้ ระบบพามาจอนี้ พร้อมบอกว่าทำอะไรได้ และปุ่มกลับไปจอจัดยาและส่ง'] }]],
  notes: ['เคาะแล้ว 20/10 ข้อ 76 (เจ้าของ: "สั้นๆพอ"): เคสของสาขาอื่นเห็นแค่สรุปสั้น (วันที่ หัวข้อ เภสัชกร ผล) · ต้องการดูเต็มให้ขอสาขาเจ้าของเคส', 'ของเดิมจากคอนโซลเก่า: เคสสาขาอื่นเห็นแค่สรุปสั้น (วันที่ หัวข้อ เภสัชกร ผล) ไม่เห็นแชทหรือใบสรุปเต็ม', 'แพ้ยาและยาประจำของลูกค้าเห็นได้ทุกสาขา (อยู่ในการ์ดผู้มีอาการ) เพื่อความปลอดภัยตอนจ่ายยา', 'รับเคสได้เฉพาะเภสัชกรที่ยืนยันเป็นเภสัชกรประจำวันของสาขานั้น', 'ข้อความบอกเหตุผลและทางไปต่อ ไม่บอกรายละเอียดระบบ'],
  wait: [],
  head: ctx => ctx.st === 'role' ? { title: 'ไม่มีสิทธิ์ดู', sub: SC.branch().name } : { title: 'ประวัติเคส', sub: SC.branch().name },
  /* a staff account only ever sees the staff version; picking S603.2 in the review panel signs in as the store staff */
  prep(S, st) { if (S._reseed && st === 'role') { S.me = 'st'; S.branch = 'tw'; } if (SC.isStaff()) return 'role'; },
  render(ctx) {
    if (ctx.st === 'role') return `<div class="solo inset"><div class="solo-card">${ic('lock', 32, 1.8)}<h2 class="h2 mt12">จอนี้สำหรับเภสัชกร</h2>
      <p class="mt8">บัญชีพนักงานร้าน (${esc(SC.PHARM.st.staff)}) ใช้ได้ 2 อย่าง: รับยาด้วยรหัส และจัดยาและส่งรายการที่ชำระแล้ว · อาการ แชท ประวัติแพ้ยา และประวัติเคส เปิดได้เฉพาะเภสัชกร</p>
      <p class="small mt8">ลูกค้าต้องการปรึกษาหรือถามเรื่องยา ให้ ${esc(SC.duty()?.short || 'เภสัชกรประจำวัน')} ดูแล</p>
      <div class="btn-row mt16" style="justify-content:center">${ui.btn('ไปที่จัดยาและส่ง', { kind: 'secondary', go: 'pack', icon: 'package', focus: true })}</div></div></div>`;
    const h = SC.HISTORY.find(x => x.id === (ctx.p.id || 'TC-260914-0031')) || SC.HISTORY[2];
    return `<div class="solo inset"><div class="solo-card wide">
      <div class="hrow"><span class="muted">${ic('lock', 24, 1.8)}</span><h2 class="h2">เคสนี้อยู่ที่${esc(SC.branch(h.branch).name)}</h2></div>
      <p class="mt8">ดูได้เฉพาะสรุปสั้น แชทและใบสรุปเต็มเปิดได้เฉพาะสาขาที่ดูแลเคส</p>
      <div class="mt16">${ui.kv([['เลขเคส', `<span class="mono">${esc(SC.caseCode(h))}</span>`], ['วันที่', `${esc(h.date)} ${esc(h.time)}`], ['ผู้มีอาการ', `${esc(SC.person(h.who).name)} (${esc(SC.person(h.who).rel)})`], ['หัวข้อ', esc(h.topic)], ['เภสัชกร', `${esc(SC.PHARM[h.pharm].short)} · ${esc(SC.branch(h.branch).short)}`], ['ผล', esc(h.close)]])}</div>
      <p class="small mt12">ถ้าต้องการรายละเอียดเพื่อดูแลลูกค้า ติดต่อ${esc(SC.branch(h.branch).name)} ${esc(SC.branch(h.branch).phone)}</p>
      <div class="btn-row mt16">${ui.btn('กลับ', { kind: 'secondary', icon: 'arrow-left', go: SC.S.activeCase ? 'room' : 'log', st: SC.S.activeCase ? 'talk' : 'all' })}</div></div></div>`;
  }
});

/* ---------- S604 the store lost its connection ---------- */
SC.screen('netlost', {
  code: 'S604', group: 6, duty: true, title: 'เน็ตของร้านหลุด', nav: 'queue',
  states: [['retry', 'กำลังเชื่อมต่อใหม่', { cust: [['room', 'live', 'ลูกค้ายังเห็นห้องปกติ ข้อความรอส่ง']] }], ['fail', 'เชื่อมต่อไม่ได้ พักรับเคสให้แล้ว', { cust: [['queue', 'paused', 'ลูกค้าในคิวเห็นว่าเภสัชกรพักชั่วคราว']] }]],
  notes: ['เคาะแล้ว 19/10: คอนโซลหลุดเกิน 2 นาที พักรับเคสให้อัตโนมัติ (ข้อ 40)', 'ข้อความที่พิมพ์ไว้ไม่หาย ส่งให้เองเมื่อเชื่อมต่อได้', 'หลุดเกิน 2 นาที ระบบพักรับเคสของสาขาให้อัตโนมัติ ลูกค้าในคิวไม่เสียคิว', 'บอกทางไปต่อเสมอ: ลองใหม่ หรือใช้มือถือเปิดคอนโซลแทน'],
  wait: [],
  head: () => ({ title: 'คิวปรึกษา', sub: SC.branch().name }),
  now: ctx => ({ date: SC.NOW.date, time: ctx.st === 'fail' ? '14:27' : '14:25' }),
  prep(S, st) { if (st === 'fail') { S.intake[S.branch] = 'pause'; S.pause = { min: 0, until: '' }; } },
  render(ctx) { return `<div class="net-dim" aria-hidden="true">${SC.queueBoard(SC.S, ctx.st === 'fail' ? 'pause' : 'live')}</div>`; },
  overlay(ctx) {
    const fail = ctx.st === 'fail';
    return `<div class="scrim soft"></div><div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="netT">
      <div class="modal-h"><span class="${fail ? 'danger-t' : 'warn-t'}">${ic('wifi-off', 24, 2)}</span><div class="grow"><h2 id="netT">${fail ? 'เชื่อมต่อไม่ได้ พักรับเคสให้แล้ว' : 'การเชื่อมต่อหลุด'}</h2><p>${fail ? 'หลุดเกิน 2 นาที เมื่อ 14:27' : 'กำลังเชื่อมต่อใหม่'}</p></div></div>
      <div class="modal-b">${fail ? `<p>ระบบพักรับเคสของ${esc(SC.branch().name)}ให้อัตโนมัติ ลูกค้าในคิวเห็นว่าเภสัชกรพักชั่วคราว และไม่เสียคิว · ข้อความที่พิมพ์ไว้ยังอยู่</p><p class="small mt8">ตรวจเน็ตของร้าน หรือเปิดคอนโซลจากมือถือด้วยบัญชีเดียวกัน ถ้ายังไม่ได้ โทรแจ้งผู้จัดการสาขา</p>`
        : `<div class="hrow"><span class="spin"></span><p>ลองเชื่อมต่อใหม่ครั้งที่ 3 · <span class="num" id="netT2">0:08</span></p></div><p class="small mt8">ข้อความที่พิมพ์ไว้ไม่หาย ส่งให้เองเมื่อเชื่อมต่อได้ · ถ้าหลุดเกิน 2 นาที ระบบพักรับเคสให้อัตโนมัติ</p>`}</div>
      <div class="modal-f">${fail ? ui.btn('ลองเชื่อมต่ออีกครั้ง', { a: 'netRetry', icon: 'refresh-cw', focus: true }) : ui.btn('ลองตอนนี้', { kind: 'secondary', a: 'netRetry', icon: 'refresh-cw', focus: true })}</div></div>`;
  },
  mount(el, ctx) { const n = document.getElementById('netT2'); if (n) { let s = 8; ctx.every(() => { s++; n.textContent = SC.mmss(s); }, 1000); } },
  sims: ({ st }) => [st === 'retry' && { label: 'ผ่านไป 2 นาที ยังหลุด', run: () => SC.setSt('fail') }]
});
SC.act('netRetry', async t => {
  await SC.busy(t, 800);
  const st = SC.S.intake[SC.S.branch];
  SC.go('queue', { st: st === 'pause' ? 'pause' : 'live' });
  SC.toast(st === 'pause' ? 'เชื่อมต่อได้แล้ว รับเคสยังพักอยู่ กดเปิดรับเมื่อพร้อม' : 'เชื่อมต่อได้แล้ว', 'wifi');
});
})();

/* ===== 99-boot.js ===== */
/* =====================================================================
   99 · Boot. URL: ?screen=<id>&state=<k> open a screen in a state · ?bare=1 console only (no panel,
   real size, for screenshots and QA) · ?size=1024|fit stage size · ?panel=0 start with the panel hidden
   · ?registry=1 post the screen list to the parent page (the all-screens board, /screens)
   ===================================================================== */
(() => {
const Q = new URLSearchParams(location.search);
const want = Q.get('screen'), st = Q.get('state');
if (Q.get('registry') === '1' && parent !== window) parent.postMessage({ scRegistry: {
  groups: SC.GROUPS,
  items: SC.ORDER.map(id => SC.SCREENS[id]).map(d => ({ id: d.id, kind: 'screen', group: d.group, title: d.title, code: d.code, states: (d.states || []).map(s => [s[0], s[1]]), wait: (d.wait || []).length }))
} }, '*');
SC.panel.fit();
/* an old link (?screen=adr) goes through the same ALIAS as SC.go, so it lands in S401 instead of the sign-in page (QA3-13) */
if (want && (SC.SCREENS[want] || SC.ALIAS[want])) {
  const def = SC.SCREENS[want], ok = def ? def.states?.some(s => s[0] === st) : !!st;
  SC.reseed();
  SC.go(want, { st: ok ? st : undefined, p: {} });
} else SC.go('login');
requestAnimationFrame(() => SC.panel.fit());
window.__sc = SC; /* for QA scripts */
})();


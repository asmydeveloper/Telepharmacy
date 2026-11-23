// C515 preview map: empty until the address is complete, then a read-only map of the subdistrict or the saved pin.
const assert = require('node:assert/strict'), fs = require('node:fs');
const M = require('../public/runtime/address-map.js');
const fixture = JSON.parse(fs.readFileSync('tests/fixtures/tambon-104801.geojson'));
const a = { first: 'สมใจ', last: 'ใจดี', phone: '0812345678', house: '', dist: 'ทวีวัฒนา', amp: 'ทวีวัฒนา', prov: 'กรุงเทพมหานคร', zip: '10170' };
const maps = [], markers = [];
let removed = 0;
global.TP = { thaiAddressData: { load: async () => JSON.parse(fs.readFileSync('public/assets/data/thailand/addresses.json')) } };
global.L = {
  map(el, options) { const m = { options, view: null, setView(p, z) { this.view = [p, z]; return this; }, remove() { removed++; }, invalidateSize() {} }; maps.push(m); return m; },
  geoJSON: () => ({ addTo() { return this; } }),
  divIcon: o => o,
  marker(p, o) { const m = { p, o, draggable: true, addTo() { return this; }, setDraggable(v) { this.draggable = v; } }; markers.push(m); return m; },
};
global.fetch = async () => ({ ok: true, json: async () => fixture });
const note = { textContent: '' }, scope = { addEventListener() {}, removeEventListener() {} };
const host = { dataset: {}, closest: () => scope, querySelector: k => (k === '.address-pin-note' ? note : {}) };
const wait = () => new Promise(r => setTimeout(r, 300));
(async () => {
  M.preview(host, { read: () => a, ctx: { onLeave() {} } });
  await wait();
  assert.equal(host.dataset.state, 'empty');
  assert.equal(maps.length, 0, 'no map before the address is complete');
  assert.match(note.textContent, /กรอกที่อยู่ให้ครบ/);

  a.house = '88/12';
  host._addressPreview.refresh(); await wait();
  assert.equal(host.dataset.state, 'unpinned');
  assert.equal(maps.at(-1).options.interactive, false, 'preview map is read-only');
  assert.equal(markers.at(-1).draggable, false);
  assert.equal(maps.at(-1).view[1], 14, 'subdistrict view before a pin');
  assert.match(note.textContent, /ยังไม่ได้ปักหมุด/);

  const p = { lat: 13.7585281507793, lng: 100.358974455533 };
  Object.assign(a, { pin: true, location: { ...p, code: '104801', addressKey: M.key(a), verified: true } });
  host._addressPreview.refresh(); await wait();
  assert.equal(host.dataset.state, 'saved');
  assert.deepEqual(maps.at(-1).view, [[p.lat, p.lng], 17], 'saved pin is centred');
  assert.equal(removed, 1, 'old preview map removed before redraw');

  host._addressPreview.cleanup();
  const errHost = { dataset: {}, closest: () => scope, querySelector: k => (k === '.address-pin-note' ? note : {}) };
  M.preview(errHost, { read: () => a, ctx: { state: 'map-error', onLeave() {} } }); await wait();
  assert.equal(errHost.dataset.state, 'error');
  assert.match(note.textContent, /โหลดแผนที่ไม่สำเร็จ/);
  console.log('PASS: C515 preview map empty, subdistrict, saved pin, read-only and error states');
})().catch(e => { console.error(e); process.exitCode = 1; });

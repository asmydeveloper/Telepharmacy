// C515 preview mock button: fills only blank fields from FX.addressFormSample and picks the area through the selects.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('public/runtime/customer.js', 'utf8');
const fixtures = { window: {} };
vm.runInNewContext(fs.readFileSync('public/runtime/customer-fixtures.js', 'utf8'), fixtures);
const FX = fixtures.window.MitrareeFixtures;

const events = [];
const input = (id, value = '') => ({ id, value, dispatchEvent: e => events.push([id, e.type]) });
const select = (id, options) => ({ ...input(id), disabled: false, options: options.map(value => ({ value })) });
const fields = {
  first: input('first', 'มานี'), last: input('last'), phone: input('phone'), house: input('house'),
  building: input('building'), alley: input('alley'), road: input('road'), zip: input('zip'),
  prov: select('prov', ['', 'กรุงเทพมหานคร']), amp: select('amp', ['', 'ทวีวัฒนา']), dist: select('dist', ['', 'ทวีวัฒนา']),
};
const label = { textContent: 'เลือกจังหวัด / อำเภอ / ตำบล' };
const el = { querySelector: s => (s === '#home-address-first' ? fields.first : null) };
const TP = { SCREENS: { addressedit: {} }, cur: () => ({ el }) };
const ctx = vm.createContext({
  TP, FX, Event: class { constructor(type) { this.type = type; } },
  $: (selector) => selector === '.address-area-open > span' ? label : fields[selector.replace('#home-address-', '')] || null,
});
const start = source.indexOf('const addressFields =');
vm.runInContext(source.slice(start, source.indexOf('\n', start)), ctx);
const a = source.indexOf('const mockAreaKeys ='), b = source.indexOf('/* C515 preview map reads the pin being edited', a);
vm.runInContext(source.slice(a, b), ctx);

const mock = TP.SCREENS.addressedit.previewMock;
assert.equal(mock.canFill(), true);
assert.equal(mock.fill(), true);
assert.equal(fields.first.value, 'มานี', 'typed values are kept');
for (const key of ['last', 'phone', 'house', 'building', 'alley', 'road']) assert.equal(fields[key].value, FX.addressFormSample[key], key);
for (const key of ['prov', 'amp', 'dist']) assert.equal(fields[key].value, FX.addressFormSample[key], key);
assert.equal(fields.zip.value, '', 'zip comes from the area selects, not the mock');
assert.equal(label.textContent, 'ทวีวัฒนา · ทวีวัฒนา · กรุงเทพมหานคร');
assert(events.some(([id, type]) => id === 'dist' && type === 'change'));
// The mock must not rely on helpers from another runtime module (bug 24 Nov 2026: addressAreaKeys is not defined).
console.log('PASS: C515 mock fills blank fields only and picks the area through the selects');

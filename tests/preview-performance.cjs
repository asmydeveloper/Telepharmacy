const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');

const source = fs.readFileSync('public/runtime/customer.js', 'utf8');
const start = source.indexOf('TP.previewActivity =');
const end = source.indexOf('TP.wait =', start);
const documentListeners = {};
const windowListeners = {};
const document = {
  hidden: false,
  documentElement: { classList: { toggle() {} } },
  addEventListener(name, callback) { documentListeners[name] = callback; },
};
const parent = {};
const window = { parent, addEventListener(name, callback) { windowListeners[name] = callback; } };
const TP = {};
vm.runInNewContext(source.slice(start, end), {
  TP, document, window, URLSearchParams,
  location: { origin: 'http://localhost:3001', search: '?flowPreview=1' },
});
const activity = [];
const unsubscribe = TP.previewActivity.subscribe(active => activity.push(active));
const message = overrides => windowListeners.message({
  source: parent, origin: 'http://localhost:3001',
  data: { type: 'telepharmacy:preview-visibility', visible: false }, ...overrides,
});
message({ origin: 'https://untrusted.example' });
message({ source: {} });
message({ data: { type: 'telepharmacy:preview-visibility', visible: 'false' } });
assert.equal(TP.previewActivity.active(), true, 'Untrusted/malformed messages are ignored');
message({});
assert.equal(TP.previewActivity.active(), false);
message({ data: { type: 'telepharmacy:preview-visibility', visible: true } });
document.hidden = true;
documentListeners.visibilitychange();
assert.equal(TP.previewActivity.active(), false);
document.hidden = false;
documentListeners.visibilitychange();
assert.deepEqual(activity, [false, true, false, true]);
unsubscribe();
message({});
assert.equal(activity.length, 4, 'Disposed canvas listeners are removed');

let tickCount = 0;
let activeTimer;
let resume;
const pollingStart = source.indexOf('let orderExpiryTimer;');
const pollingEnd = source.indexOf('TP.orderMedicineList', pollingStart);
vm.runInNewContext(source.slice(pollingStart, pollingEnd), {
  TP: { orderExpiryTick() { tickCount++; }, previewActivity: {
    active: () => true, subscribe(fn) { resume = fn; },
  } },
  clearInterval() { activeTimer = undefined; },
  setInterval(fn) { activeTimer = fn; return 1; },
});
assert.equal(tickCount, 1);
resume(false);
assert.equal(activeTimer, undefined, 'Offscreen previews have no expiry polling timer');
resume(true);
assert.equal(tickCount, 2, 'Returning reconciles expiration immediately');
activeTimer();
assert.equal(tickCount, 3);

(async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'telepharmacy-version-'));
  try {
    const files = [
      'public/runtime/consultation-data.js', 'public/runtime/customer.js',
      'public/runtime/address-map.js', 'public/runtime/address-map-engine.js',
      'public/assets/data/thailand/delivery-map-style.json',
    ];
    for (const file of files) {
      const target = path.join(temp, file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, 'initial');
    }
    const { runtimeVersion } = await import(pathToFileURL(path.resolve('src/lib/runtime-version.mjs')));
    const first = runtimeVersion(temp);
    assert.equal(runtimeVersion(temp), first);
    fs.writeFileSync(path.join(temp, files[1]), 'updated runtime');
    assert.notEqual(runtimeVersion(temp), first, 'Source edits invalidate the shared version');
    assert.equal(runtimeVersion().length, 12);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
  console.log('PASS: preview visibility, trusted messages, timer cleanup and version invalidation');
})().catch(error => { console.error(error); process.exitCode = 1; });

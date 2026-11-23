// C111 policy accordion: four documents on one page, entry-specific expanded section, lazy load per section.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require.resolve('../public/runtime/customer.js'), 'utf8');
const block = source.slice(source.indexOf('const policyDocs = {'), source.indexOf("TP.act('stCall'"));

function setup() {
  const sheets = {}, actions = {}, opened = [], fetched = [];
  const S = { st: {} };
  const TP = {
    S,
    sheetDef: (id, def) => { sheets[id] = def; },
    act: (id, fn) => { actions[id] = fn; },
    sheet: (id, params) => { opened.push([id, params]); },
    ic: name => `<svg data-icon="${name}"></svg>`,
  };
  const ui = { row: o => `<row data-a="${o.a}" data-p='${JSON.stringify(o.p)}'>${o.title}</row>`, btn: label => `<button>${label}</button>` };
  const context = {
    TP, ui, esc: v => String(v), console,
    $: () => null, $$: () => [],
    AbortController,
    fetch: async url => { fetched.push(url); return { ok: true, text: async () => 'text' }; },
  };
  vm.createContext(context);
  vm.runInContext(block, context);
  return { TP, S, sheets, actions, opened, fetched };
}

const ctxFor = (state, params = {}) => ({ state, params, onLeave() {} });
const expanded = html => [...html.matchAll(/data-policy="(\w+)".*?aria-expanded="(true|false)"/g)].filter(m => m[2] === 'true').map(m => m[1]);

const h = setup();
const doc = h.sheets.doc;
assert.equal(doc.code, 'C111');
assert(!h.sheets.policyindex, 'C116 list is retired');

// Four sections, legacy footer order.
const all = doc.render(ctxFor('collapsed', { all: true }));
assert.deepEqual([...all.matchAll(/data-policy="(\w+)"/g)].map(m => m[1]), ['terms', 'privacy', 'notice', 'shipping']);
assert.equal(expanded(all).length, 0, 'menu entry opens with every section collapsed');
assert.equal((all.match(/ hidden>/g) || []).length, 4);
assert(!all.includes('healthConsent'), 'health consent stays on its own sheet (C107)');
assert.equal((all.match(/aria-controls="policy-panel-/g) || []).length, 4);

// Entry-specific section expands; preview cases map to the same sections.
assert.deepEqual(expanded(doc.render(ctxFor('terms', { key: 'notice' }))), ['notice'], 'tapped link wins over stale preview state');
for (const key of ['terms', 'privacy', 'notice', 'shipping']) assert.deepEqual(expanded(doc.render(ctxFor(key))), [key]);
assert.deepEqual(expanded(doc.render(ctxFor('load-error'))), ['terms']);
assert.deepEqual(expanded(doc.render(ctxFor('collapsed'))), []);

// Links: "all" opens collapsed and sets case .6; a document key sets its own case.
const link = (v, p) => ({ dataset: { v, p: p ? JSON.stringify(p) : undefined } });
h.actions.stDoc(link('all'));
assert.equal(h.S.st.doc, 'collapsed');
assert.deepEqual(JSON.parse(JSON.stringify(h.opened.at(-1))), ['doc', { all: true }]);
h.actions.stDoc(link('notice'));
assert.equal(h.S.st.doc, 'notice');
assert.deepEqual(JSON.parse(JSON.stringify(h.opened.at(-1))), ['doc', { key: 'notice' }]);
assert.match(h.TP.policyLinks(), /"key":"all"/, 'account menu opens the collapsed page');

// Mount loads only the expanded section, and a collapsed section loads on first expand only.
const loads = [];
h.TP.mountPolicyDocuments = (section, ctx, keys, simulateError, options) => loads.push([keys[0], simulateError, options.support]);
function fakeSection(key, open) {
  const attrs = { 'aria-expanded': String(open) }, listeners = {};
  const head = { getAttribute: k => attrs[k], setAttribute: (k, v) => { attrs[k] = v; }, addEventListener: (k, fn) => { listeners[k] = fn; } };
  const panel = { hidden: !open };
  return { dataset: { policy: key }, head, panel, click: () => listeners.click() };
}
const sections = [fakeSection('terms', false), fakeSection('notice', true)];
const ctx = ctxFor('notice', { key: 'notice' });
// Fresh context whose $ / $$ return fake sections, so mount runs without a DOM.
const m = (() => {
  const sheets = {}, context = {
    TP: { S: { st: {} }, sheetDef: (id, def) => { sheets[id] = def; }, act() {}, sheet() {}, ic: () => '', mountPolicyDocuments: (section, c, keys, err, options) => loads.push([keys[0], err, options.support]) },
    ui: { row: () => '', btn: () => '' }, esc: String, console, AbortController, fetch: async () => ({ ok: true, text: async () => '' }),
    $: (selector, root) => (selector === '.policy-acc-head' ? root.head : root.panel),
    $$: () => sections,
  };
  vm.createContext(context);
  vm.runInContext(block.replace(/TP\.mountPolicyDocuments = [\s\S]*?\n};\n/, ''), context);
  return sheets.doc;
})();
loads.length = 0;
m.mount({}, ctx);
assert.deepEqual(JSON.parse(JSON.stringify(loads)), [['notice', false, false]], 'only the expanded section loads, without a per-document support button');
sections[0].click();
assert.equal(sections[0].panel.hidden, false);
assert.equal(sections[0].head.getAttribute('aria-expanded'), 'true');
assert.equal(loads.length, 2);
sections[0].click();
assert.equal(sections[0].panel.hidden, true);
sections[0].click();
assert.equal(loads.length, 2, 'expanding again does not reload');

// load-error case simulates a failure only for the first loaded section.
loads.length = 0;
const errSections = [fakeSection('terms', true), fakeSection('privacy', false)];
sections.splice(0, sections.length, ...errSections);
m.mount({}, ctxFor('load-error'));
errSections[1].click();
assert.deepEqual(JSON.parse(JSON.stringify(loads)), [['terms', true, false], ['privacy', false, false]]);

console.log('PASS: C111 policy accordion sections, entry-specific expansion, collapsed menu entry, lazy per-section load and load-error case');

const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('public/runtime/customer.js', 'utf8');
const actions = {}, simulations = [], navigations = [];
const activeCase = { status: 'room', msgs: [] };
const TP = {
  S: {}, ACTS: actions,
  act: (id, fn) => actions[id] = fn,
  simAction: definition => simulations.push(definition),
  emit() {}, go: (id, options) => navigations.push({id, options}),
  cur: () => ({ id: 'video' }), refresh() {},
};
const start = source.indexOf("TP.act('chatVideo'");
const end = source.indexOf("TP.act('acceptVideoRequest'", start);
vm.runInNewContext(source.slice(start, end), {TP, C: () => activeCase, Date});
actions.chatVideo();
assert.equal(navigations.at(-1).id, 'video');
assert.equal(TP.S.call.waitingProvider, true);
assert.equal(TP.S.call.t0, null, 'waiting must not count as consultation time');
const waitingCall = TP.S.call;
actions.chatVideo();
assert.equal(TP.S.call, waitingCall, 'reopening preserves the waiting call');
const joined = simulations.find(event => event.id === 'joinCustomerVideo');
assert(joined.when(TP.S));
joined.run();
assert.equal(TP.S.call.waitingProvider, false);
assert.equal(typeof TP.S.call.t0, 'number');
assert(!joined.when(TP.S));
TP.S.call = null; TP.S.camDenied = true;
actions.chatVideo();
assert.equal(navigations.at(-1).id, 'nocam');
activeCase.status = 'closed';
const count = navigations.length;
actions.chatVideo();
assert.equal(navigations.length, count, 'closed cases cannot start video');
console.log('PASS: direct video waiting, preserve call on reopen, start time on provider join, camera denial and closed-case guard');

const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('public/runtime/customer.js','utf8');
// C305: the customer ending the chat cancels the consultation and any unpaid order; history shows "ยกเลิก".
const a=source.indexOf('function historyOutcome(S,h) {'),b=source.indexOf('\n}\n',a)+2;
const ctx=vm.createContext({TP:{completedMedicationOrder:()=>false}});vm.runInContext(source.slice(a,b),ctx);
const out=vm.runInContext("historyOutcome({},{outcome:'customer-ended',order:{status:'cancelled'}})",ctx);
assert.equal(out.label,'ยกเลิก');assert.equal(out.detailLabel,'ยกเลิก');
assert.equal(vm.runInContext("historyOutcome({},{outcome:'completed'})",ctx).label,'สำเร็จ');
const end=source.slice(source.indexOf("TP.act('endCase'"),source.indexOf("TP.act('retryMsg'"));
assert.match(end,/c\.order\?\.status === 'pending'\) \{ c\.order\.status = 'cancelled'/,'unpaid order is cancelled before closing');
assert(end.indexOf("c.order.status = 'cancelled'")<end.indexOf("TP.sim.closeCase('me')"),'cancel first so no payment route opens');
assert.match(source,/if \(by !== 'me'\) TP\.S\.inbox\.unshift\(\{ id: 'n' \+ Date\.now\(\), kind: 'summary'/,'no summary notification for a cancellation');
console.log('PASS: C305 ending cancels the consultation and unpaid order; history shows ยกเลิก');
